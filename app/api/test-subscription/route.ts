import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { plan } = await request.json();
    console.log('🔄 Test subscription request:', { plan });

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

    // Map plan to price ID (use same env vars as useSubscription hook)
    let priceId = '';
    switch (plan) {
      case 'starter':
        priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER || 'price_1RupVsIEoBYk9xtj4VQZv9pD';
        break;
      case 'professional':
        priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PROFESSIONAL || 'price_1RupVsIEoBYk9xtjZqHidfqe';
        break;
      case 'enterprise':
        priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE || 'price_1RupVsIEoBYk9xtjOther';
        break;
      default:
        return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    console.log('💾 Updating subscription:', { priceId, plan });

    // Update user subscription in database (simulate webhook)
    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: user.id,
        email: user.email,
        subscription_plan: priceId,
        subscription_status: 'active',
        subscription_current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('❌ Database error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    console.log('✅ Subscription updated successfully');
    return NextResponse.json({ success: true, message: 'Subscription updated' });
  } catch (error) {
    console.error('Test subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    );
  }
}