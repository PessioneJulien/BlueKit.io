# 🔧 Gestion des Abonnements - Guide Utilisateur

## ✅ Fonctionnalités ajoutées :

### 1. **Lien Pricing dans la topbar**
- Visible pour tous les utilisateurs (connectés ou non)
- Accès rapide aux plans tarifaires
- Icône CreditCard pour l'identifier facilement

### 2. **Section Abonnement dans le profil**
- Affichage du plan actuel avec couleur et icône
- Status de l'abonnement (actif, annulé, en retard)
- Date de renouvellement
- Limites du plan actuel
- Boutons d'action selon le plan

### 3. **Portail Client Stripe**
- Accès sécurisé à la gestion d'abonnement Stripe
- Permet d'annuler, changer de plan, ou mettre à jour le mode de paiement
- Historique des factures et téléchargements
- Gestion des informations de facturation

## 🎯 Comment ça fonctionne :

### Pour les utilisateurs gratuits :
1. **Page Profil** → Section "Subscription" → Bouton "Upgrade Plan"
2. **Topbar** → "Pricing" → Choisir un plan

### Pour les utilisateurs payants :
1. **Page Profil** → Section "Subscription" → "Manage Subscription"
2. **Redirection** vers le Stripe Customer Portal
3. **Actions possibles** :
   - Annuler l'abonnement
   - Changer de plan (upgrade/downgrade)
   - Mettre à jour la carte de crédit
   - Télécharger les factures
   - Demander un remboursement (via support)

## 🔄 Flux d'annulation :

### Étape 1 : Accès au portail
```
Page Profil → "Manage Subscription" → Stripe Customer Portal
```

### Étape 2 : Annulation
```
Customer Portal → "Cancel subscription" → Confirmation → Annulation effective
```

### Étape 3 : Synchronisation
```
Webhook Stripe → Mise à jour BDD → Plan gratuit → Sync automatique
```

## 💰 Remboursements :

### Politique Stripe par défaut :
- **Remboursements manuels** via le dashboard Stripe (admin)
- **Période de grâce** selon la politique de l'app
- **Contact support** pour cas particuliers

### Pour les administrateurs :
1. **Stripe Dashboard** → Payments → Rechercher le paiement
2. **Refund** → Montant → Raison → Confirmer
3. **Webhook automatique** → Mise à jour du statut

## 🎨 Interface utilisateur :

### Indicateurs visuels :
- **Gratuit** : Gris avec icône CreditCard
- **Starter** : Bleu avec icône Sparkles
- **Professional** : Violet avec icône Rocket  
- **Enterprise** : Or avec icône Crown

### Status de l'abonnement :
- **Active** : ✅ Vert - "Active"
- **Past Due** : ⚠️ Jaune - "Payment Due"
- **Cancelled** : ❌ Rouge - "Cancelled"

## 📱 Actions disponibles :

| Plan | Actions |
|------|---------|
| **Free** | • Upgrade Plan (→ /pricing) |
| **Starter/Pro/Enterprise** | • Manage Subscription (→ Stripe Portal)<br>• Cancel anytime<br>• Change plan<br>• Update payment |

## 🔍 Vérifications automatiques :

### Synchronisation périodique :
- **Toutes les 60 secondes** : Vérification du statut
- **Changement de page** : Check automatique
- **Retour sur l'app** : Refresh du statut
- **Annulation détectée** : Reset immédiat au plan gratuit

### Cas gérés automatiquement :
- Annulation d'abonnement
- Échec de paiement (past_due)
- Expiration d'abonnement
- Changement de plan
- Réactivation d'abonnement

## 🚀 Pour les développeurs :

### APIs disponibles :
- `GET /api/stripe/sync-subscription` : Synchroniser avec Stripe
- `POST /api/stripe/customer-portal` : Accès au portail client
- `POST /api/test-subscription` : Activation manuelle (dev)

### Webhooks Stripe :
- `customer.subscription.updated` : Plan changé
- `customer.subscription.deleted` : Abonnement annulé
- `invoice.payment_failed` : Paiement échoué
- `checkout.session.completed` : Nouveau paiement

## ⚡ Résumé des fonctionnalités :

✅ **Lien Pricing** dans la topbar
✅ **Section Abonnement** complète dans le profil  
✅ **Portail Client Stripe** pour gestion avancée
✅ **Annulation d'abonnement** en un clic
✅ **Accès aux remboursements** via Stripe Portal
✅ **Synchronisation temps réel** avec Stripe
✅ **Interface utilisateur** claire et intuitive

---

**Tous vos besoins de gestion d'abonnement sont maintenant couverts !** 🎉