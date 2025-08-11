# 🔧 Variables d'Environnement - Configuration

## ✅ Variables nécessaires

### 🔐 Stripe Configuration

```bash
# Clé publique (sécurisée pour le client)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51Rui5D...

# Clé secrète (JAMAIS exposée côté client)
STRIPE_SECRET_KEY=sk_test_51Rui5D...

# Price IDs pour les abonnements (côté client)
NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER=price_1Rup...
NEXT_PUBLIC_STRIPE_PRICE_ID_PROFESSIONAL=price_1Rup...

# Product IDs (pour le script de setup)
STRIPE_PRODUCT_ID_STARTER=prod_SqWY...
STRIPE_PRODUCT_ID_PROFESSIONAL=prod_SqWZ...
STRIPE_PRODUCT_ID_ENTERPRISE=prod_SqWZ...

# Webhook secret (pour valider les webhooks)
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 🔐 Supabase Configuration

```bash
# URL du projet Supabase
NEXT_PUBLIC_SUPABASE_URL=https://odzjdqwtltx...

# Clé publique anon (sécurisée)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJ...

# Clé service role (accès admin, jamais côté client)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJ...
```

## 🗑️ Variables supprimées (obsolètes)

- ~~`STRIPE_PRICE_ID_STARTER`~~ → Remplacée par `NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER`
- ~~`STRIPE_PRICE_ID_PROFESSIONAL`~~ → Remplacée par `NEXT_PUBLIC_STRIPE_PRICE_ID_PROFESSIONAL`
- ~~`STRIPE_PRICE_ID_ENTERPRISE`~~ → Plan Enterprise = pricing custom (pas de Price ID fixe)
- ~~`NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE`~~ → Non utilisé (plan custom)

## 📋 Notes importantes

### 🎯 Plan Enterprise
- **Pas de Price ID fixe** car pricing custom
- Géré via contact commercial, pas Stripe Checkout
- Product ID existe pour référence mais pas de prix automatisé

### 🔄 Génération des IDs
- **Price IDs et Product IDs** sont générés par `scripts/setup-stripe-products.ts`
- **Exécuter une seule fois** après création du compte Stripe
- **Copier les IDs générés** dans `.env.local`

### 🚨 Sécurité
- **Variables publiques** (`NEXT_PUBLIC_*`) : visibles côté client
- **Variables privées** : jamais exposées au navigateur
- **Clés secrètes** : ne jamais commit dans le code source

## ⚡ Configuration rapide

1. **Copiez** `.env.local.example` → `.env.local`
2. **Remplissez** les clés Stripe et Supabase
3. **Exécutez** `npx tsx scripts/setup-stripe-products.ts`
4. **Copiez** les Price IDs générés dans `.env.local`
5. **Configurez** le webhook dans Stripe Dashboard

## 🔍 Vérification

Pour vérifier que tout est configuré :

```bash
# Vérifier les variables d'environnement
npm run dev
# → Aller sur localhost:3001/pricing
# → Tester un paiement avec 4242 4242 4242 4242
```

## 📚 Références

- **Stripe Dashboard** : https://dashboard.stripe.com
- **Supabase Dashboard** : https://supabase.com/dashboard
- **Test Cards** : https://stripe.com/docs/testing#cards