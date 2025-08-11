# 🎯 Guide Configuration Webhook Stripe

## 📋 Configuration étape par étape

### 1. Accéder au dashboard Stripe

1. **Allez sur** : https://dashboard.stripe.com
2. **Connectez-vous** avec votre compte Stripe

### 2. Créer le webhook endpoint

1. **Menu gauche** → `Developers` → `Webhooks`
2. **Cliquez** sur "Add endpoint"
3. **Remplissez** :
   - **Endpoint URL** : 
     - Production : `https://votre-domaine.vercel.app/api/stripe/webhook`
     - Développement : `https://your-ngrok-url.ngrok.io/api/stripe/webhook`
   - **Description** : "BlueKit.io - Subscription sync"

### 3. Sélectionner les événements

**Cochez ces événements** (très important) :

✅ **checkout.session.completed**
- Déclenché quand le paiement est confirmé

✅ **customer.subscription.created**  
- Nouvelle souscription créée

✅ **customer.subscription.updated**
- Plan changé ou renouvellement

✅ **customer.subscription.deleted**
- Abonnement annulé

✅ **invoice.payment_succeeded**
- Paiement réussi (renouvellement)

✅ **invoice.payment_failed**
- Échec de paiement

### 4. Récupérer le webhook secret

1. **Après création** → Cliquez sur le webhook créé
2. **Section "Signing secret"** → Cliquez `Reveal`
3. **Copiez** la clé qui commence par `whsec_...`

### 5. Mettre à jour .env.local

Remplacez dans votre fichier `.env.local` :

```bash
# AVANT
STRIPE_WEBHOOK_SECRET=whsec_REMPLACEZ_PAR_VOTRE_WEBHOOK_SECRET

# APRÈS (exemple)
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdefghijklmnop
```

### 6. Test en développement local (optionnel)

Si vous voulez tester en local :

1. **Installez Stripe CLI** :
   ```bash
   # MacOS
   brew install stripe/stripe-cli/stripe
   
   # Linux/Windows
   # Téléchargez depuis https://stripe.com/docs/stripe-cli
   ```

2. **Connectez-vous** :
   ```bash
   stripe login
   ```

3. **Démarrez le forward** :
   ```bash
   stripe listen --forward-to localhost:3001/api/stripe/webhook
   ```

4. **Récupérez le webhook secret** affiché dans le terminal

## 🚀 Test du webhook

### 1. Test en production

1. **Déployez** votre app sur Vercel
2. **Allez** sur la page pricing
3. **Souscrivez** au plan Starter
4. **Après paiement** → Vous devriez être automatiquement sur le plan Starter sans manuel activation

### 2. Vérification des logs

Dans le dashboard Stripe :
1. **Webhooks** → votre webhook
2. **Onglet "Events"**
3. **Vérifiez** que les événements arrivent avec statut 200

### 3. Debug en cas de problème

Si le webhook ne fonctionne pas :

1. **Vérifiez l'URL** : Elle doit être accessible publiquement
2. **Vérifiez les logs** Stripe : Erreurs 500/400 ?
3. **Vérifiez** `.env.local` : Le webhook secret est-il correct ?
4. **Vérifiez** les logs Vercel : Des erreurs côté serveur ?

## 🔧 Résolution des problèmes courants

### Erreur "Invalid signature"
- ❌ **Cause** : Mauvais webhook secret
- ✅ **Solution** : Récupérer le bon secret depuis Stripe

### Erreur 500 "Database error"
- ❌ **Cause** : Table `user_profiles` manquante
- ✅ **Solution** : Exécuter les migrations Supabase

### Webhook ne reçoit rien
- ❌ **Cause** : URL non accessible
- ✅ **Solution** : Vérifier que l'URL fonctionne dans le navigateur

### Plan ne se met pas à jour
- ❌ **Cause** : Pas d'`userId` dans les métadonnées
- ✅ **Solution** : Le code est déjà corrigé, c'est bon !

## ✅ Résultat attendu

Après configuration :

1. **Utilisateur** souscrit au plan Starter
2. **Stripe** envoie `checkout.session.completed` 
3. **Webhook** met à jour automatiquement la DB
4. **Utilisateur** atterrit sur `/dashboard` avec le bon plan
5. **Plus besoin** du bouton manuel !

---

**Une fois configuré, plus besoin de l'activation manuelle !** 🎉