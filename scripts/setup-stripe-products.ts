/**
 * Script pour créer automatiquement les produits et prix dans Stripe
 * À exécuter une seule fois pour configurer votre compte Stripe
 * 
 * Usage: npx tsx scripts/setup-stripe-products.ts
 */

import Stripe from 'stripe';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY is not set in .env.local');
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

async function setupStripeProducts() {
  try {
    console.log('🚀 Creating Stripe products and prices...\n');

    // 1. Create Starter Product
    console.log('📦 Creating Starter product...');
    const starterProduct = await stripe.products.create({
      name: 'BlueKit Starter',
      description: 'Perfect for individual developers and small projects',
      metadata: {
        plan: 'starter',
      },
    });

    const starterPrice = await stripe.prices.create({
      product: starterProduct.id,
      unit_amount: 1900, // 19€ in cents
      currency: 'eur',
      recurring: {
        interval: 'month',
      },
      metadata: {
        plan: 'starter',
      },
    });

    console.log('✅ Starter product created');
    console.log(`   Product ID: ${starterProduct.id}`);
    console.log(`   Price ID: ${starterPrice.id}\n`);

    // 2. Create Professional Product
    console.log('📦 Creating Professional product...');
    const professionalProduct = await stripe.products.create({
      name: 'BlueKit Professional',
      description: 'For teams and growing businesses',
      metadata: {
        plan: 'professional',
      },
    });

    const professionalPrice = await stripe.prices.create({
      product: professionalProduct.id,
      unit_amount: 4900, // 49€ in cents
      currency: 'eur',
      recurring: {
        interval: 'month',
      },
      metadata: {
        plan: 'professional',
      },
    });

    console.log('✅ Professional product created');
    console.log(`   Product ID: ${professionalProduct.id}`);
    console.log(`   Price ID: ${professionalPrice.id}\n`);

    // 3. Create Enterprise Product (placeholder - actual pricing via sales)
    console.log('📦 Creating Enterprise product...');
    const enterpriseProduct = await stripe.products.create({
      name: 'BlueKit Enterprise',
      description: 'Custom solutions for large organizations',
      metadata: {
        plan: 'enterprise',
      },
    });

    // Enterprise doesn't have a fixed price - handled via sales
    console.log('✅ Enterprise product created');
    console.log(`   Product ID: ${enterpriseProduct.id}`);
    console.log('   Note: Enterprise pricing is custom, contact sales\n');

    // 4. Create a Customer Portal configuration
    console.log('⚙️ Configuring Customer Portal...');
    const portalConfig = await stripe.billingPortal.configurations.create({
      business_profile: {
        headline: 'BlueKit - Manage your subscription',
      },
      features: {
        customer_update: {
          enabled: true,
          allowed_updates: ['email', 'tax_id'],
        },
        invoice_history: {
          enabled: true,
        },
        payment_method_update: {
          enabled: true,
        },
        subscription_cancel: {
          enabled: true,
          mode: 'at_period_end',
        },
        subscription_pause: {
          enabled: false,
        },
        subscription_update: {
          enabled: true,
          default_allowed_updates: ['price', 'quantity', 'promotion_code'],
          products: [
            {
              product: starterProduct.id,
              prices: [starterPrice.id],
            },
            {
              product: professionalProduct.id,
              prices: [professionalPrice.id],
            },
          ],
        },
      },
    });

    console.log('✅ Customer Portal configured\n');

    // Print summary
    console.log('========================================');
    console.log('🎉 Stripe setup completed successfully!');
    console.log('========================================\n');
    console.log('Add these values to your .env.local file:\n');
    console.log(`STRIPE_PRICE_ID_STARTER=${starterPrice.id}`);
    console.log(`STRIPE_PRICE_ID_PROFESSIONAL=${professionalPrice.id}`);
    console.log(`STRIPE_PRODUCT_ID_STARTER=${starterProduct.id}`);
    console.log(`STRIPE_PRODUCT_ID_PROFESSIONAL=${professionalProduct.id}`);
    console.log(`STRIPE_PRODUCT_ID_ENTERPRISE=${enterpriseProduct.id}`);
    console.log('\n👉 Next steps:');
    console.log('1. Copy these IDs to your .env.local file');
    console.log('2. Set up webhook endpoint in Stripe Dashboard');
    console.log('3. Test with Stripe CLI: stripe listen --forward-to localhost:3000/api/stripe/webhook');

  } catch (error) {
    console.error('❌ Error setting up Stripe products:', error);
    process.exit(1);
  }
}

// Run the setup
setupStripeProducts();