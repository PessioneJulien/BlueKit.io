# 🎯 Intégration Stripe Checkout Direct

## ✅ Ce qui a été modifié

### 1. Page Pricing améliorée (`/app/pricing/page.tsx`)

Le système utilise maintenant **Stripe Checkout directement** côté client :

```javascript
// Avant : Appel API puis redirection
const response = await fetch('/api/stripe/checkout');
window.location.href = data.url;

// Maintenant : Stripe.js avec redirectToCheckout
const stripe = await loadStripe(PUBLISHABLE_KEY);
await stripe.redirectToCheckout({ sessionId });
```

### 2. Flux complet

1. **Utilisateur clique "S'abonner"**
2. **Vérification connexion** → Si non connecté, redirige vers login
3. **Chargement Stripe.js** côté client
4. **Appel API** pour créer la session checkout
5. **Redirection directe** vers Stripe Checkout
6. **Retour sur le site** après paiement

## 🔧 Configuration requise

### Variables d'environnement (`.env.local`)

```env
# Clé publique (safe côté client)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51Rui5DIEoBYk9xtj...

# Clé secrète (serveur uniquement)
STRIPE_SECRET_KEY=sk_test_51Rui5DIEoBYk9xtj...

# Price IDs publics
NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER=price_1RuhzLLHD8k9z6XEUjMt0CZI
NEXT_PUBLIC_STRIPE_PRICE_ID_PROFESSIONAL=price_1RuhzMLHD8k9z6XEiLFmymgz
```

## 🚀 Avantages de cette approche

1. **Plus rapide** : Redirection directe sans double navigation
2. **Plus sûr** : Stripe gère tout le processus de paiement
3. **Meilleure UX** : Transition fluide vers Stripe
4. **Mobile optimisé** : Fonctionne parfaitement sur mobile

## 🧪 Test du checkout

### 1. Test en local

```bash
# Lancer le serveur
npm run dev

# Aller sur
http://localhost:3001/pricing

# Cliquer sur "S'abonner" (Starter ou Professional)
```

### 2. Cartes de test Stripe

Utilisez ces numéros pour tester :

| Type | Numéro | CVC | Date |
|------|--------|-----|------|
| ✅ Succès | 4242 4242 4242 4242 | 123 | 12/34 |
| ❌ Refusé | 4000 0000 0000 0002 | 123 | 12/34 |
| ⚠️ Auth requise | 4000 0025 0000 3155 | 123 | 12/34 |

### 3. URLs de retour

Après le paiement, l'utilisateur est redirigé vers :
- **Succès** : `/dashboard?success=true&plan=starter`
- **Annulation** : `/pricing?canceled=true`

## 📊 Webhook pour synchronisation

Le webhook Stripe met à jour automatiquement la base de données :

1. **Événement reçu** : `customer.subscription.created`
2. **Mise à jour DB** : `user_profiles.subscription_plan = 'price_xxx'`
3. **Statut actif** : `subscription_status = 'active'`

## 🐛 Debug

### Si la redirection ne fonctionne pas :

1. **Vérifiez la clé publique** :
```javascript
console.log(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
// Doit commencer par pk_test_ ou pk_live_
```

2. **Vérifiez la session** :
```javascript
// Dans la console après l'appel API
console.log(sessionId);
// Doit être un string commençant par cs_
```

3. **Vérifiez Stripe.js** :
```javascript
const stripe = await loadStripe('...');
console.log(stripe); // Ne doit pas être null
```

### Logs utiles

Dans la console du navigateur :
- "Stripe redirect error" → Problème avec Stripe
- "Checkout error" → Problème avec l'API
- "Stripe failed to load" → Clé publique invalide

## 🔒 Sécurité

- ✅ Clé publique côté client uniquement
- ✅ Clé secrète jamais exposée
- ✅ Session créée côté serveur
- ✅ Validation webhook avec signature
- ✅ HTTPS requis en production

## 📝 Checklist de déploiement

- [ ] Variables d'environnement en production
- [ ] Webhook configuré dans Stripe Dashboard
- [ ] URLs de retour avec domaine de production
- [ ] Mode Live activé dans Stripe
- [ ] SSL/HTTPS configuré

---

**Le système est maintenant prêt pour recevoir des paiements !** 💳