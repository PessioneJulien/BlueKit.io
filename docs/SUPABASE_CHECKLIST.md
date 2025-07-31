# ✅ Checklist de Vérification Supabase - BlueKit

Ce document vous permet de vérifier que votre configuration Supabase est correcte et fonctionnelle.

## 🏗️ Infrastructure de Base

### Projet Supabase
- [ ] Projet créé sur supabase.com
- [ ] Mot de passe de base de données sauvegardé
- [ ] Région sélectionnée (proche de vos utilisateurs)
- [ ] Status : "Healthy" dans le dashboard

### Clés API
- [ ] Project URL récupérée
- [ ] Anon key récupérée  
- [ ] Service role key récupérée et gardée confidentielle
- [ ] Clés ajoutées dans `.env.local`

## 🗄️ Base de Données

### Tables Créées
```sql
-- Exécuter dans l'éditeur SQL Supabase
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Résultat attendu :
- [ ] `reviews`
- [ ] `stack_technologies` 
- [ ] `stacks`
- [ ] `technologies`
- [ ] `users`

### Données de Base
```sql
-- Vérifier les technologies
SELECT COUNT(*) as tech_count FROM technologies;
```
- [ ] Au moins 30 technologies présentes

### Politiques RLS
```sql
-- Vérifier que RLS est activé
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```
- [ ] Toutes les tables ont `rowsecurity = true`

## 🔐 Authentification

### Configuration Générale
- [ ] Email confirmations activées
- [ ] Site URL configurée (dev + prod)
- [ ] Redirect URLs configurées

### Providers OAuth

#### GitHub
- [ ] GitHub OAuth App créée
- [ ] Client ID et Secret ajoutés dans Supabase
- [ ] Callback URL correcte : `https://[project-ref].supabase.co/auth/v1/callback`
- [ ] Provider activé dans Supabase

#### Google  
- [ ] Projet Google Cloud créé
- [ ] Google+ API activée
- [ ] OAuth 2.0 credentials créées
- [ ] Client ID et Secret ajoutés dans Supabase
- [ ] Provider activé dans Supabase

## 🔧 Application

### Variables d'Environnement

Vérifier `.env.local` :
```bash
# Ces variables doivent être définies
echo "SUPABASE_URL: $NEXT_PUBLIC_SUPABASE_URL"
echo "SUPABASE_ANON: ${NEXT_PUBLIC_SUPABASE_ANON_KEY:0:10}..."
echo "NEXTAUTH_URL: $NEXTAUTH_URL"
echo "NEXTAUTH_SECRET: ${NEXTAUTH_SECRET:0:10}..."
```

- [ ] `NEXT_PUBLIC_SUPABASE_URL` définie
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` définie
- [ ] `SUPABASE_SERVICE_ROLE_KEY` définie  
- [ ] `NEXTAUTH_URL` définie
- [ ] `NEXTAUTH_SECRET` définie (32+ caractères)

### Démarrage de l'Application
```bash
npm run dev
```
- [ ] Application démarre sans erreur
- [ ] Console sans erreurs Supabase
- [ ] Page d'accueil accessible à `http://localhost:3000`

## 🧪 Tests Fonctionnels

### Test 1 : Inscription Email/Password
1. [ ] Aller sur `/auth/signup`
2. [ ] Remplir le formulaire avec un nouvel email
3. [ ] Cliquer "Create Account"
4. [ ] Message de succès affiché
5. [ ] Email de confirmation reçu
6. [ ] Cliquer sur le lien de confirmation
7. [ ] Redirection vers l'application

### Test 2 : Connexion Email/Password
1. [ ] Aller sur `/auth/login`
2. [ ] Saisir email/password du test 1
3. [ ] Connexion réussie
4. [ ] Redirection vers `/profile`
5. [ ] Nom d'utilisateur affiché dans header
6. [ ] Menu utilisateur fonctionnel

### Test 3 : OAuth GitHub
1. [ ] Se déconnecter
2. [ ] Aller sur `/auth/login`
3. [ ] Cliquer "GitHub"
4. [ ] Redirection vers GitHub
5. [ ] Autoriser l'application
6. [ ] Redirection vers l'application
7. [ ] Connexion automatique réussie

### Test 4 : OAuth Google
1. [ ] Se déconnecter  
2. [ ] Aller sur `/auth/login`
3. [ ] Cliquer "Google"
4. [ ] Redirection vers Google
5. [ ] Autoriser l'application
6. [ ] Redirection vers l'application
7. [ ] Connexion automatique réussie

### Test 5 : Reset Password
1. [ ] Se déconnecter
2. [ ] Aller sur `/auth/login`
3. [ ] Cliquer "Forgot password"
4. [ ] Saisir email existant
5. [ ] Email de reset reçu
6. [ ] Lien fonctionnel (optionnel à tester)

### Test 6 : Protection des Routes
1. [ ] Se déconnecter
2. [ ] Essayer d'accéder à `/profile` directement
3. [ ] Redirection automatique vers `/auth/login`
4. [ ] Se reconnecter
5. [ ] Accès autorisé à `/profile`

## 🗃️ Vérifications Base de Données

### Test 7 : Création de Profil Automatique
```sql
-- Vérifier qu'un profil est créé automatiquement
SELECT u.email, p.name, p.created_at 
FROM auth.users u
LEFT JOIN public.users p ON u.id = p.id
WHERE u.email = 'votre-email-de-test@example.com';
```
- [ ] Profil créé automatiquement à l'inscription
- [ ] Données synchronisées (email, nom si disponible)

### Test 8 : Permissions RLS
```sql
-- Se connecter en tant qu'utilisateur puis tester
SELECT * FROM public.users; -- Doit fonctionner
SELECT * FROM public.stacks WHERE author_id = auth.uid(); -- Doit fonctionner
```
- [ ] Utilisateur peut voir les données publiques
- [ ] Utilisateur peut voir ses propres données
- [ ] Utilisateur ne peut pas modifier les données d'autres utilisateurs

## 📧 Configuration Emails

### Templates d'Emails
- [ ] Template "Confirm signup" personnalisé
- [ ] Template "Reset password" personnalisé
- [ ] Template "Magic Link" personnalisé (si utilisé)
- [ ] Branding BlueKit ajouté

### Test d'Envoi
- [ ] Emails reçus rapidement (< 1 minute)
- [ ] Pas de spam (vérifier dossier spam)
- [ ] Liens fonctionnels
- [ ] Design cohérent avec l'application

## 🚀 Production

### Déploiement
- [ ] Application déployée (Vercel/Netlify)
- [ ] Variables d'environnement configurées en production
- [ ] HTTPS activé
- [ ] Domaine personnalisé configuré (optionnel)

### URLs de Production
- [ ] Site URL mis à jour dans Supabase
- [ ] Redirect URLs mises à jour
- [ ] OAuth callbacks mis à jour pour la production

### Performance
- [ ] Temps de chargement < 3 secondes
- [ ] Authentification rapide (< 2 secondes)
- [ ] Base de données responsive

## 🔍 Monitoring et Logs

### Dashboard Supabase
- [ ] Onglet "Logs" > Auth pour voir les connexions
- [ ] Onglet "Database" > Logs pour les requêtes
- [ ] Onglet "API" > Logs pour les erreurs API

### Métriques Importantes
```sql
-- Dans l'éditeur SQL
SELECT 
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE email_confirmed_at IS NOT NULL) as confirmed_users,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as new_users_week
FROM auth.users;
```

- [ ] Nombre d'utilisateurs cohérent
- [ ] Taux de confirmation acceptable
- [ ] Pas d'erreurs massives dans les logs

## ⚠️ Sécurité

### Checklist Sécurité
- [ ] Service role key jamais exposée côté client
- [ ] HTTPS en production
- [ ] Variables d'environnement sécurisées
- [ ] Politiques RLS testées et fonctionnelles
- [ ] Mots de passe forts configurés
- [ ] Rate limiting activé (Supabase le gère automatiquement)

### Test de Sécurité Basique
```javascript
// Dans la console du navigateur, vérifier qu'on ne peut pas
localStorage.getItem('supabase.auth.token') // Doit être null ou contenir un token valide
// Essayer de modifier les données d'un autre utilisateur via l'API
```

## 📝 Documentation

### Documentation Créée
- [ ] `docs/SUPABASE_SETUP.md` - Guide de configuration
- [ ] `docs/AUTHENTICATION.md` - Guide d'authentification  
- [ ] `docs/SUPABASE_CHECKLIST.md` - Cette checklist
- [ ] README mis à jour avec instructions Supabase

### Sauvegarde des Informations
- [ ] Clés API sauvegardées dans un gestionnaire de mots de passe
- [ ] Informations OAuth providers sauvegardées
- [ ] Mot de passe base de données sauvegardé
- [ ] URLs et configuration documentées

---

## 🎉 Validation Finale

Si tous les éléments ci-dessus sont cochés ✅, votre configuration Supabase est **complète et prête pour la production** !

### Score de Completude

**Comptez vos ✅ :**
- 0-20 : Configuration de base - continuer le setup
- 21-40 : Bien avancé - quelques ajustements nécessaires  
- 41-60 : Presque prêt - finaliser les tests
- 61+ : **Configuration complète** - prêt pour la production ! 🚀

### Prochaines Étapes

Une fois cette checklist validée :
1. **Optimiser les performances** de l'application
2. **Implémenter les fonctionnalités avancées**
3. **Ajouter le monitoring en production**
4. **Configurer la sauvegarde de la base de données**

---

**🎯 Bravo ! Votre infrastructure Supabase est opérationnelle !**