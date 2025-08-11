import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Sync subscription request');

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

    // Search for customer in Stripe by email
    const customers = await stripe.customers.list({
      email: user.email!,
      limit: 1,
    });

    if (customers.data.length === 0) {
      console.log('❌ No Stripe customer found for email:', user.email);
      return NextResponse.json({ 
        message: 'No subscription found',
        plan: 'free',
        status: null 
      });
    }

    const customer = customers.data[0];
    console.log('🎯 Found customer:', customer.id);

    // Get active subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      console.log('❌ No active subscription found');
      return NextResponse.json({ 
        message: 'No active subscription',
        plan: 'free',
        status: null 
      });
    }

    const subscription = subscriptions.data[0];
    const priceId = subscription.items.data[0]?.price.id;
    
    console.log('💳 Found subscription:', {
      id: subscription.id,
      status: subscription.status,
      priceId: priceId,
    });

    // Update user profile in database
    const { error: updateError } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: user.id,
        email: user.email,
        stripe_customer_id: customer.id,
        stripe_subscription_id: subscription.id,
        subscription_plan: priceId,
        subscription_status: subscription.status,
        subscription_current_period_end: new Date(subscription.current_period_end * 1000),
      }, {
        onConflict: 'user_id'
      });

    if (updateError) {
      console.error('❌ Database error:', updateError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // Map price ID to plan name
    let planName = 'free';
    if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER) {
      planName = 'starter';
    } else if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PROFESSIONAL) {
      planName = 'professional';
    } else if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE) {
      planName = 'enterprise';
    }

    console.log('✅ Subscription synced successfully:', planName);
    
    return NextResponse.json({ 
      success: true,
      message: 'Subscription synced from Stripe',
      plan: planName,
      status: subscription.status,
      priceId: priceId,
      customerId: customer.id,
      subscriptionId: subscription.id,
    });
  } catch (error) {
    console.error('Sync subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to sync subscription' },
      { status: 500 }
    );
  }
}