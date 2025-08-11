import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Customer portal request');

    // Get current user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('❌ Auth error:', authError);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('👤 User:', user.email);

    // Get user profile to find Stripe customer ID
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    let customerId = profile?.stripe_customer_id;

    // If no customer ID in profile, search by email in Stripe
    if (!customerId) {
      console.log('🔍 No customer ID in profile, searching by email...');
      const customers = await stripe.customers.list({
        email: user.email!,
        limit: 1,
      });

      if (customers.data.length === 0) {
        console.error('❌ No Stripe customer found');
        return NextResponse.json(
          { error: 'No subscription found. Please subscribe first.' },
          { status: 404 }
        );
      }

      customerId = customers.data[0].id;
      console.log('✅ Found customer:', customerId);

      // Save customer ID for future use
      await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          email: user.email,
          stripe_customer_id: customerId,
        }, {
          onConflict: 'user_id'
        });
    }

    // Create portal session
    const returnUrl = `${request.headers.get('origin')}/profile`;
    
    console.log('🎯 Creating portal session for customer:', customerId);
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    console.log('✅ Portal session created:', session.id);

    return NextResponse.json({ 
      url: session.url,
      message: 'Redirecting to Stripe customer portal...'
    });
  } catch (error) {
    console.error('Customer portal error:', error);
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    );
  }
}