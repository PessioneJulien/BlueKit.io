import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Webhook test endpoint',
    env: {
      hasStripeSecret: !!process.env.STRIPE_SECRET_KEY,
      hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
      webhookSecretStart: process.env.STRIPE_WEBHOOK_SECRET?.substring(0, 7),
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    },
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest) {
  console.log('🔔 Test webhook POST received');
  
  const body = await request.text();
  const headers = Object.fromEntries(request.headers.entries());
  
  console.log('📦 Body:', body.substring(0, 100));
  console.log('🎯 Headers:', headers);
  
  return NextResponse.json({
    message: 'POST received successfully',
    bodyLength: body.length,
    hasSignature: !!headers['stripe-signature'],
    timestamp: new Date().toISOString(),
  });
}