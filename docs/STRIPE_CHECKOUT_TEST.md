# 🧪 Test Stripe Checkout

## 🔍 Debug de l'erreur sessionId

### Ce qui a été corrigé :

1. **Vérification de la réponse API** avec logs
2. **Gestion d'erreur améliorée**
3. **Paramètres corrects** : `priceId` et `planName`

### Test maintenant :

1. **Ouvrez** : http://localhost:3001/pricing
2. **Ouvrez la console** (F12)
3. **Cliquez sur "S'abonner"** (Starter ou Professional)

### Dans la console, vous devriez voir :

```javascript
Checkout response: {
  sessionId: "cs_test_...",
  url: "https://checkout.stripe.com/..."
}
```

## 🐛 Si l'erreur persiste

### 1. Vérifiez que vous êtes connecté

Si non connecté, vous serez redirigé vers `/auth/login`

### 2. Vérifiez la réponse de l'API

Dans l'onglet Network (F12) :
- Cherchez la requête `checkout`
- Vérifiez le statut (200 = OK)
- Regardez la réponse JSON

### 3. Vérifiez les variables d'environnement

```bash
# Dans .env.local
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

### 4. Test direct de l'API

Dans la console du navigateur :
```javascript
// Test direct
fetch('/api/stripe/checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    priceId: 'price_1RuhzLLHD8k9z6XEUjMt0CZI',
    planName: 'starter'
  })
}).then(r => r.json()).then(console.log)
```

Vous devriez voir :
```javascript
{
  sessionId: "cs_test_...",
  url: "https://checkout.stripe.com/..."
}
```

## ✅ Solution rapide

Si ça ne marche toujours pas, utilisez directement l'URL :

```javascript
// Au lieu de redirectToCheckout
if (data.url) {
  window.location.href = data.url;
}
```

## 📋 Checklist

- [ ] Utilisateur connecté
- [ ] Console ouverte pour voir les logs
- [ ] `Checkout response` apparaît avec sessionId
- [ ] Redirection vers Stripe

---

Le système devrait maintenant rediriger vers Stripe Checkout ! 🚀