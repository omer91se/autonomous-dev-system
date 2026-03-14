import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { env } from '@/lib/env';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  // Ensure webhook secret is configured
  if (!env.STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured');
    return NextResponse.json(
      { error: 'Webhook not configured' },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  // Verify webhook signature
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  // Check for duplicate events (idempotency)
  try {
    const existingLog = await prisma.stripeWebhookLog.findUnique({
      where: { eventId: event.id },
    });

    if (existingLog && existingLog.status === 'processed') {
      console.log(`Duplicate event ${event.id} - already processed`);
      return NextResponse.json({ received: true, duplicate: true });
    }

    // Create or update webhook log
    await prisma.stripeWebhookLog.upsert({
      where: { eventId: event.id },
      create: {
        eventId: event.id,
        eventType: event.type,
        status: 'processing',
        payload: event as any,
        attempts: 1,
      },
      update: {
        attempts: { increment: 1 },
        status: 'processing',
      },
    });
  } catch (error) {
    console.error('Error logging webhook:', error);
    // Continue processing even if logging fails
  }

  // Process webhook event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const credits = parseInt(session.metadata?.credits || '0');

        if (!userId || !credits) {
          throw new Error('Missing userId or credits in session metadata');
        }

        // Use transaction to ensure atomicity
        await prisma.$transaction(async (tx) => {
          // Create Purchase record
          const purchase = await tx.purchase.create({
            data: {
              userId,
              stripeSessionId: session.id,
              stripePaymentIntentId: session.payment_intent as string,
              amount: session.amount_total || 0,
              credits,
              status: 'completed',
              metadata: {
                customerEmail: session.customer_email,
                currency: session.currency,
              },
              completedAt: new Date(),
            },
          });

          // Update or create credit record
          const existingCredit = await tx.credit.findFirst({
            where: { userId },
          });

          if (existingCredit) {
            await tx.credit.update({
              where: { id: existingCredit.id },
              data: {
                balance: existingCredit.balance + credits,
              },
            });
          } else {
            await tx.credit.create({
              data: {
                userId,
                balance: credits,
              },
            });
          }

          // Create notification
          await tx.notification.create({
            data: {
              userId,
              type: 'PURCHASE_COMPLETE',
              title: 'Credits Added!',
              message: `${credits} credits have been added to your account`,
              link: '/dashboard',
            },
          });
        });

        console.log(`Successfully processed credit purchase for user ${userId}: ${credits} credits`);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        // Update purchase status
        await prisma.purchase.updateMany({
          where: { stripePaymentIntentId: paymentIntent.id },
          data: { status: 'failed' },
        });

        console.log(`Payment failed for intent ${paymentIntent.id}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Mark webhook as processed
    await prisma.stripeWebhookLog.update({
      where: { eventId: event.id },
      data: {
        status: 'processed',
        processedAt: new Date(),
        error: null,
      },
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);

    // Log error in webhook log
    await prisma.stripeWebhookLog.update({
      where: { eventId: event.id },
      data: {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
