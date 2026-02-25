import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover' as any,
});

export async function POST(req: Request) {
  try {
    const { amount, memorialId, deceasedName, message } = await req.json();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Donation in memory of ${deceasedName}`,
            },
            unit_amount: amount * 100, // Stripe expects cents ($25.00 = 2500)
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get("origin")}/memorial/${memorialId}?success=true`,
      cancel_url: `${req.headers.get("origin")}/memorial/${memorialId}?canceled=true`,
      metadata: {
        memorialId: memorialId, deceasedName: deceasedName, message: message || ""
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe Session Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
