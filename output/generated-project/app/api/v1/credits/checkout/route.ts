import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { creditPackageSchema } from '@/lib/validations';
import { getCreditPackage } from '@/lib/credit-packages';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = creditPackageSchema.parse(body);

    const creditPackage = getCreditPackage(validatedData.packageId);

    if (!creditPackage) {
      return NextResponse.json(
        { error: 'Invalid package ID' },
        { status: 400 }
      );
    }

    // Create Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: creditPackage.price,
            product_data: {
              name: creditPackage.name,
              description: `${creditPackage.credits} video feedback credits`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: session.user.id,
        credits: creditPackage.credits.toString(),
        packageId: creditPackage.id,
      },
      customer_email: session.user.email || undefined,
      success_url:
        validatedData.successUrl || `${request.nextUrl.origin}/credits/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:
        validatedData.cancelUrl || `${request.nextUrl.origin}/credits`,
    });

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
