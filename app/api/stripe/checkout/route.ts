import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession, createOrGetCustomer } from '@/lib/stripe/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { priceId, planName } = await request.json();

    // Get current user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Create or get Stripe customer
    const customer = await createOrGetCustomer({
      email: user.email!,
      userId: user.id,
    });

    // Create checkout session
    const session = await createCheckoutSession({
      priceId,
      userId: user.id,
      customerEmail: user.email!,
      successUrl: `${request.headers.get('origin')}/dashboard?success=true&plan=${planName}`,
      cancelUrl: `${request.headers.get('origin')}/pricing?canceled=true`,
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}