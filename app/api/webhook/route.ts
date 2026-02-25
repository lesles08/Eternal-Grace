import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/utils/supabase';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover' as any,
});

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const memorialId = session.metadata?.memorialId;
    const amountPaid = session.amount_total; // in cents
    const donorName = session.customer_details?.name || "Anonymous Supporter";

    if (memorialId && amountPaid) {
      if (!supabaseAdmin) {
        return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
      }

      // 1. Get current total from the database
      const { data, error: fetchError } = await supabaseAdmin
        .from('memorials')
        .select('total_raised_cents')
        .eq('id', memorialId)
        .single();

      if (fetchError) {
        console.error(`❌ Error fetching current total:`, fetchError.message);
      }

      // 2. Perform the math with explicit Number conversion
      const currentTotal = data?.total_raised_cents || 0;
      const newTotal = Number(currentTotal) + Number(amountPaid);

      // 3. Update the memorial's total raised amount
      const { error: updateError } = await supabaseAdmin
        .from('memorials')
        .update({ total_raised_cents: newTotal })
        .eq('id', memorialId);

      if (updateError) {
        console.error(`❌ DB Update Error:`, updateError.message);
      } else {
        console.log(`✅ Progress Bar Updated successfully.`);
      }

      // 4. Record the financial transaction in the 'donations' table
      await supabaseAdmin
        .from('donations')
        .insert([{
          memorial_id: memorialId,
          amount_cents: amountPaid,
          stripe_session_id: session.id,
          status: 'complete'
        }]);

      // 5. Record the public-facing "Tribute" for the Ticker
      const { error: tributeError } = await supabaseAdmin
        .from('tributes')
        .insert([{
          memorial_id: memorialId,
          author_name: donorName,
          message: session.metadata?.message || `Generous donation in honor of ${session.metadata?.deceasedName || "a loved one"}`,
          amount_cents: amountPaid 
        }]);

      if (tributeError) {
        console.error(`❌ Error creating tribute record:`, tributeError.message);
      } else {
        console.log(`✅ Created tribute record for ${donorName}`);
      }
        
      // 6. Refresh the cache for the specific memorial page
      revalidatePath(`/memorial/${memorialId}`);
      console.log(`✅ Cache cleared for /memorial/${memorialId}`);
    }
  }

  return NextResponse.json({ received: true });
}
