# 🚀 Test Webhook avec Stripe CLI

## Installation Stripe CLI

### Sur Mac :
```bash
brew install stripe/stripe-cli/stripe
```

### Sur Windows/Linux :
Téléchargez depuis : https://stripe.com/docs/stripe-cli#install

## Test du webhook

1. **Connectez-vous** :
```bash
stripe login
```

2. **Déclenchez un événement test** :
```bash
stripe trigger checkout.session.completed
```

3. **Vérifiez dans Railway** :
- Allez dans les logs Railway
- Vous devriez voir : `🔔 Webhook received: checkout.session.completed`

## Événements à tester :

```bash
# Test paiement réussi
stripe trigger checkout.session.completed

# Test création abonnement
stripe trigger customer.subscription.created

# Test mise à jour abonnement
stripe trigger customer.subscription.updated

# Test paiement échoué
stripe trigger invoice.payment_failed
```

## Vérification :

Si ça fonctionne, vous verrez dans les logs Railway :
- `🔔 Webhook received: [event_type]`
- `💳 Checkout completed:`
- `✅ User subscription updated successfully`