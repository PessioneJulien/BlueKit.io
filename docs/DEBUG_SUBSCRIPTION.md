# 🔍 Debug - Synchronisation abonnement

## 🎯 Pour diagnostiquer le problème :

### Étape 1 : Aller sur la page dashboard

1. **URL** : http://localhost:3001/dashboard?success=true&plan=starter
2. **Ouvrez la console** (F12)
3. **Regardez le message vert**

### Étape 2 : Vérifier les infos debug

Dans le message vert, vous devriez voir :
```
Plan URL: starter
Plan actuel: free
Statut: null (ou active)
Condition bouton: TRUE ou FALSE
```

### Étape 3 : Si le bouton n'apparaît pas

Si "Condition bouton: FALSE", le problème peut être :
- `planFromUrl` est null → Vous n'avez pas `?plan=starter` dans l'URL
- `subscription.plan` n'est pas 'free' → Le plan a déjà été mis à jour

### Étape 4 : Si le bouton apparaît, cliquez dessus

1. **Cliquez** "Activer le plan starter"
2. **Dans la console**, vous devriez voir :
   ```
   🔄 Test subscription request: { plan: "starter" }
   👤 User: votre-email@example.com
   💾 Updating subscription: { priceId: "price_1Rup...", plan: "starter" }
   ✅ Subscription updated successfully
   ```

### Étape 5 : Vérification dans Supabase

1. **Allez sur** : https://supabase.com/dashboard/project/YOUR_PROJECT
2. **Table Editor** → `user_profiles`
3. **Cherchez votre email**
4. **Vérifiez** :
   - `subscription_plan` = `price_1RupVsIEoBYk9xtj4VQZv9pD`
   - `subscription_status` = `active`

## 🐛 Problèmes possibles

### 1. Bouton n'apparaît pas
- **Cause** : Pas de paramètre `?plan=starter` dans l'URL
- **Solution** : Aller directement sur http://localhost:3001/dashboard?success=true&plan=starter

### 2. Erreur "Unauthorized"
- **Cause** : Pas connecté ou session expirée
- **Solution** : Se reconnecter sur `/auth/login`

### 3. Erreur "Database error"
- **Cause** : Table `user_profiles` n'existe pas
- **Solution** : Exécuter la migration SQL dans Supabase

### 4. Le plan reste "free" après clic
- **Cause** : Le hook `useSubscription` ne recharge pas les données
- **Solution** : Rafraîchir la page ou aller sur `/builder`

## 🔧 Test manuel dans Supabase

Si tout échoue, mettez à jour manuellement :

```sql
-- Dans Supabase SQL Editor
UPDATE user_profiles 
SET subscription_plan = 'price_1RupVsIEoBYk9xtj4VQZv9pD',
    subscription_status = 'active',
    subscription_current_period_end = NOW() + INTERVAL '30 days'
WHERE email = 'votre-email@example.com';
```

Puis rafraîchissez la page `/builder` pour voir les changements.

---

**Suivez ces étapes et dites-moi ce que vous voyez dans les infos debug !** 🔍