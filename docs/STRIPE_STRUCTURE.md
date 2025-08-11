# 📊 Structure des données Stripe

## 🎯 Où sont stockées les informations d'abonnement

### 1. Pour voir les abonnements d'un utilisateur :

1. **Allez dans** : https://dashboard.stripe.com
2. **Menu** → **Customers** (Clients)
3. **Cherchez** par email
4. **Cliquez** sur le client
5. **Onglet** "Subscriptions"

### 2. Ce que vous verrez :

```
Customer: cus_PQrst123456
├── Email: user@example.com
├── Metadata: { userId: "abc-123" }
└── Subscriptions:
    └── sub_ABC123
        ├── Status: active
        ├── Plan: Professional (30€/mois)
        └── Price ID: price_1RupVsIEoBYk9xtjZqHidfqe
```

### 3. Les Price IDs de votre app :

| Plan | Price ID | Montant |
|------|----------|---------|
| Starter | `price_1RupVsIEoBYk9xtj4VQZv9pD` | 10€/mois |
| Professional | `price_1RupVsIEoBYk9xtjZqHidfqe` | 30€/mois |
| Enterprise | À créer | 100€/mois |

## 🔄 Comment l'app vérifie le plan :

```javascript
// 1. L'app cherche le Customer par email
stripe.customers.list({ email: "user@example.com" })

// 2. Récupère les Subscriptions du Customer
stripe.subscriptions.list({ customer: "cus_xxxxx" })

// 3. Extrait le Price ID
subscription.items.data[0].price.id // ex: "price_1RupVsIEoBYk9xtjZqHidfqe"

// 4. Compare avec les Price IDs connus
if (priceId === "price_1RupVsIEoBYk9xtjZqHidfqe") {
  plan = "professional"
}
```

## 🔍 Pour débugger un utilisateur :

### Option A : Via Stripe Dashboard

1. **Customers** → Cherchez l'email
2. **Vérifiez** :
   - A-t-il un Customer ID ?
   - A-t-il des Subscriptions ?
   - Quel est le Status ?
   - Quel est le Price ID ?

### Option B : Via Stripe CLI

```bash
# Lister les clients
stripe customers list --email "user@example.com"

# Voir les abonnements d'un client
stripe subscriptions list --customer cus_xxxxx

# Détails d'un abonnement
stripe subscriptions retrieve sub_xxxxx
```

## ⚠️ Cas problématiques :

### 1. "J'ai toujours le plan Enterprise"

**Vérifiez dans Stripe** :
- Le Customer existe-t-il ?
- A-t-il une Subscription active ?
- Quel est le Price ID ?

**Si pas d'abonnement actif** → La sync devrait le remettre en Free

### 2. "Mon plan ne se met pas à jour"

**Vérifiez** :
- Le Price ID dans Stripe
- Les variables d'environnement (`NEXT_PUBLIC_STRIPE_PRICE_ID_*`)
- Que les IDs correspondent

### 3. "Je n'ai pas de Customer dans Stripe"

**Normal si** :
- Jamais souscrit à un plan payant
- Utilisé uniquement le plan gratuit
- Compte créé mais jamais passé par Stripe Checkout

## 📝 Résumé :

**Le type d'abonnement = Price ID dans la Subscription**

- Customer → Subscriptions → Items → Price → ID
- C'est ce Price ID qui détermine si c'est Starter, Pro, etc.
- L'app compare ce Price ID avec ceux dans les variables d'environnement