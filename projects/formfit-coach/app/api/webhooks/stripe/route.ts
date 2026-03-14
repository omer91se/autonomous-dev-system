import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
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

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const credits = parseInt(session.metadata?.credits || '0');

        if (userId && credits > 0) {
          // Create transaction record
          const transaction = await prisma.transaction.create({
            data: {
              userId,
              amount: session.amount_total ? session.amount_total / 100 : 0,
              type: 'CREDIT_PURCHASE',
              status: 'COMPLETED',
              stripePaymentId: session.payment_intent as string,
            },
          });

          // Update or create credit record
          const existingCredit = await prisma.credit.findFirst({
            where: { userId },
          });

          if (existingCredit) {
            await prisma.credit.update({
              where: { id: existingCredit.id },
              data: {
                balance: existingCredit.balance + credits,
                transactionId: transaction.id,
              },
            });
          } else {
            await prisma.credit.create({
              data: {
                userId,
                balance: credits,
                transactionId: transaction.id,
              },
            });
          }
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        // Update transaction status
        await prisma.transaction.updateMany({
          where: { stripePaymentId: paymentIntent.id },
          data: { status: 'FAILED' },
        });
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
