# 🧪 Test des limites Premium

## Comment tester les limites

### 1. Ouvrir la console du navigateur
- Ouvrez http://localhost:3001/builder
- Ouvrez la console (F12) pour voir les logs

### 2. Vérifier les logs
Vous devriez voir dans la console :
```
🔍 Checking component limit: {
  currentCount: 10,
  maxAllowed: 10,
  plan: "free"
}
❌ Component limit reached!
```

### 3. Points à vérifier :

#### ✅ Limites de composants (Plan gratuit = 10)
- [ ] Ajoutez 10 composants
- [ ] Le 11e composant doit être bloqué
- [ ] Un toast rouge doit apparaître avec bouton "Voir les plans Premium"
- [ ] Le compteur doit afficher "10/10"

#### ✅ Conteneurs bloqués (Plan gratuit)
- [ ] Essayez d'ajouter un conteneur Docker/Kubernetes
- [ ] Un toast orange doit apparaître "Les conteneurs sont réservés aux plans payants"

#### ✅ Export limité (Plan gratuit = 5/mois)
- [ ] Cliquez sur Export
- [ ] Après 5 exports, devrait être bloqué

### 4. Si ça ne fonctionne pas :

#### Vérifiez dans la console :
1. Les logs apparaissent-ils ?
2. Y a-t-il des erreurs JavaScript ?

#### Vérifiez le plan actuel :
Dans la console du navigateur, tapez :
```javascript
// Pour voir le plan actuel
localStorage.getItem('user_subscription')
```

#### Forcez un refresh :
- Ctrl+F5 pour forcer le rechargement
- Videz le cache si nécessaire

### 5. Pour tester avec un plan payant :

Dans Supabase SQL Editor :
```sql
-- Forcer le plan Starter
UPDATE user_profiles 
SET subscription_plan = 'price_1RuhzLLHD8k9z6XEUjMt0CZI',
    subscription_status = 'active'
WHERE email = 'votre-email@example.com';
```

Puis rafraîchissez la page.

## 🐛 Debug avancé

Si les limites ne fonctionnent toujours pas :

1. **Vérifiez que handleAddComponent a bien les checks** :
   - Ligne ~1070 dans VisualStackBuilder.tsx
   - Doit avoir `if (!checkComponentLimit(nodes.length))`

2. **Vérifiez que les dépendances sont bonnes** :
   - Ligne ~1156 doit inclure `checkComponentLimit, checkFeatureAccess`

3. **Vérifiez les logs dans useStackLimits** :
   - Les console.log doivent apparaître

4. **Vérifiez le toast** :
   - React-hot-toast doit être installé
   - Le Toaster doit être dans layout.tsx

---

💡 **Les logs dans la console sont votre meilleur ami pour debugger !**