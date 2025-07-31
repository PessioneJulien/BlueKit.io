# Guide de Configuration Supabase - BlueKit Stack Builder

Ce guide vous accompagne étape par étape pour configurer Supabase en production pour BlueKit.

## 📋 Prérequis

- Compte GitHub (pour OAuth)
- Compte Google Cloud (pour OAuth Google)
- Accès à votre domaine (pour les redirections)
- Terminal avec accès Internet

## 🚀 Étape 1 : Créer le Projet Supabase

### 1.1 Inscription et Création du Projet

1. **Aller sur [supabase.com](https://supabase.com)**
2. **Cliquer sur "Start your project"**
3. **Se connecter avec GitHub** (recommandé)
4. **Créer une nouvelle organisation** (si première fois)
   - Nom : `BlueKit` ou votre nom d'organisation
5. **Créer un nouveau projet**
   - Nom du projet : `bluekit-stack-builder`
   - Mot de passe de la base de données : **Générer un mot de passe fort et le sauvegarder**
   - Région : Choisir la plus proche de vos utilisateurs
   - Plan : Gratuit pour commencer

### 1.2 Attendre la Création du Projet

⏱️ **Temps d'attente** : 2-3 minutes pour que le projet soit prêt.

## 🔑 Étape 2 : Récupérer les Clés API

### 2.1 Accéder aux Settings

1. **Dans votre projet Supabase, aller dans l'onglet "Settings"**
2. **Cliquer sur "API" dans le menu de gauche**

### 2.2 Noter les Informations Importantes

```bash
# Copier ces valeurs dans un fichier temporaire
Project URL: https://[votre-project-ref].supabase.co
Anon key: eyJ... (très longue clé)
Service role key: eyJ... (très longue clé, CONFIDENTIELLE)
```

⚠️ **IMPORTANT** : La `service role key` doit rester confidentielle !

## 🗄️ Étape 3 : Configurer la Base de Données

### 3.1 Installer le CLI Supabase

```bash
# Sur macOS (avec Homebrew)
brew install supabase/tap/supabase

# Sur Windows (avec Scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Sur Linux ou avec npm
npm install -g supabase
```

### 3.2 Se Connecter au Projet

```bash
# Dans le dossier de votre projet BlueKit
cd /chemin/vers/BlueKit.io

# Se connecter à Supabase
supabase login

# Lier le projet local au projet distant
supabase link --project-ref [votre-project-ref]
```

### 3.3 Migrer le Schéma de Base

```bash
# Appliquer les migrations
supabase db push

# Si erreur, utiliser la migration manuelle :
# Copier le contenu de supabase/migrations/01_initial_schema.sql
# Et l'exécuter dans l'éditeur SQL de Supabase
```

### 3.4 Ajouter les Données de Base

1. **Aller dans l'éditeur SQL de Supabase**
2. **Copier le contenu de `supabase/seed.sql`**
3. **Exécuter le script**

```sql
-- Vérifier que les tables sont créées
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Vérifier les données de base
SELECT COUNT(*) FROM technologies;
```

## 🛡️ Étape 4 : Configurer l'Authentification

### 4.1 Paramètres Généraux

1. **Aller dans Authentication > Settings**
2. **Configurer les paramètres** :
   - ✅ Enable email confirmations
   - ✅ Enable email change confirmations
   - Site URL : `http://localhost:3000` (développement)
   - Site URL : `https://votre-domaine.com` (production)

### 4.2 URLs de Redirection

**Ajouter les URLs autorisées** :

```
# Développement
http://localhost:3000/auth/callback

# Production
https://votre-domaine.com/auth/callback
https://www.votre-domaine.com/auth/callback
```

### 4.3 Configurer GitHub OAuth

1. **Aller sur [GitHub Developer Settings](https://github.com/settings/developers)**
2. **Créer une nouvelle OAuth App** :
   - Application name : `BlueKit Stack Builder`
   - Homepage URL : `https://votre-domaine.com`
   - Authorization callback URL : `https://[votre-project-ref].supabase.co/auth/v1/callback`

3. **Noter les informations** :
   - Client ID
   - Client Secret

4. **Dans Supabase Authentication > Providers** :
   - Activer GitHub
   - Ajouter Client ID et Client Secret

### 4.4 Configurer Google OAuth

1. **Aller sur [Google Cloud Console](https://console.cloud.google.com)**
2. **Créer un nouveau projet** ou sélectionner un existant
3. **Activer Google+ API** :
   - APIs & Services > Library
   - Rechercher "Google+ API"
   - Activer

4. **Créer les identifiants OAuth** :
   - APIs & Services > Credentials
   - Create Credentials > OAuth 2.0 Client IDs
   - Type : Web application
   - Authorized redirect URIs : `https://[votre-project-ref].supabase.co/auth/v1/callback`

5. **Dans Supabase Authentication > Providers** :
   - Activer Google
   - Ajouter Client ID et Client Secret

## 🔧 Étape 5 : Configuration de l'Application

### 5.1 Variables d'Environnement

**Créer/Modifier `.env.local`** :

```bash
# Remplacer par vos vraies valeurs
NEXT_PUBLIC_SUPABASE_URL=https://[votre-project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... (votre anon key)
SUPABASE_SERVICE_ROLE_KEY=eyJ... (votre service role key)

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=votre-secret-aleatoire-tres-long
```

### 5.2 Générer un Secret NextAuth

```bash
# Générer un secret aléatoire
openssl rand -base64 32

# Ou utiliser
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 5.3 Mise à Jour pour la Production

**Pour déployer sur Vercel/Netlify**, modifier les variables :

```bash
NEXT_PUBLIC_SUPABASE_URL=https://[votre-project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXTAUTH_URL=https://votre-domaine.com
NEXTAUTH_SECRET=votre-secret-production
```

## 🧪 Étape 6 : Tests et Vérification

### 6.1 Tester l'Application Localement

```bash
# Installer les dépendances
npm install

# Lancer l'application
npm run dev

# Ouvrir http://localhost:3000
```

### 6.2 Tester l'Authentification

1. **Aller sur `/auth/signup`**
2. **Créer un compte avec email/password**
3. **Vérifier l'email de confirmation**
4. **Se connecter avec `/auth/login`**
5. **Tester OAuth avec GitHub et Google**

### 6.3 Vérifier la Base de Données

```sql
-- Dans l'éditeur SQL Supabase
SELECT * FROM auth.users LIMIT 5;
SELECT * FROM public.users LIMIT 5;
SELECT * FROM public.technologies LIMIT 10;
```

## 📧 Étape 7 : Configuration des Emails

### 7.1 Templates d'Emails

1. **Aller dans Authentication > Email Templates**
2. **Personnaliser les templates** :
   - Confirm signup
   - Magic Link
   - Change Email Address
   - Reset Password

### 7.2 Exemple de Template

```html
<h2>Bienvenue sur BlueKit !</h2>
<p>Cliquez sur le lien ci-dessous pour confirmer votre email :</p>
<p><a href="{{ .ConfirmationURL }}">Confirmer mon email</a></p>
<p>Si vous n'avez pas créé de compte, ignorez cet email.</p>
<p>L'équipe BlueKit</p>
```

## 🛡️ Étape 8 : Sécurité et Politiques RLS

### 8.1 Vérifier les Politiques RLS

```sql
-- Vérifier que RLS est activé
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Lister les politiques
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

### 8.2 Tester les Permissions

1. **Se connecter avec un utilisateur**
2. **Essayer de créer une stack**
3. **Vérifier qu'on ne peut modifier que ses propres données**

## 🚀 Étape 9 : Déploiement en Production

### 9.1 Configuration Vercel

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Configurer les variables d'environnement
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add NEXTAUTH_URL
vercel env add NEXTAUTH_SECRET

# Déployer
vercel --prod
```

### 9.2 Mettre à Jour les URLs Supabase

1. **Dans Supabase Authentication > Settings**
2. **Ajouter l'URL de production** :
   - Site URL : `https://votre-domaine-vercel.vercel.app`
   - Redirect URLs : `https://votre-domaine-vercel.vercel.app/auth/callback`

## ✅ Étape 10 : Vérification Finale

### 10.1 Checklist de Vérification

- [ ] ✅ Projet Supabase créé et fonctionnel
- [ ] ✅ Base de données migrée avec toutes les tables
- [ ] ✅ Données de base (technologies) insérées
- [ ] ✅ Authentification email/password fonctionne
- [ ] ✅ OAuth GitHub configuré et testé
- [ ] ✅ OAuth Google configuré et testé
- [ ] ✅ Politiques RLS actives et testées
- [ ] ✅ Variables d'environnement configurées
- [ ] ✅ Application déployée en production
- [ ] ✅ Emails de confirmation fonctionnels

### 10.2 Tests Finaux

```bash
# Tester les API routes
curl https://votre-domaine.com/api/health

# Tester l'authentification
# Se connecter sur https://votre-domaine.com/auth/login

# Vérifier les logs Supabase
# Aller dans Logs > Auth dans le dashboard Supabase
```

## 🆘 Dépannage Courant

### Erreur : "Invalid login credentials"
```bash
# Vérifier dans Supabase Dashboard > Authentication > Users
# L'utilisateur existe-t-il ?
# L'email a-t-il été confirmé ?
```

### Erreur : "Failed to fetch user"
```bash
# Vérifier les variables d'environnement
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Vérifier la connexion réseau
curl https://[votre-project-ref].supabase.co/rest/v1/
```

### OAuth ne fonctionne pas
```bash
# Vérifier les URLs de callback dans :
# 1. Provider OAuth (GitHub/Google)
# 2. Supabase Authentication settings
# 3. Variables d'environnement NEXTAUTH_URL
```

### Problèmes de permissions
```sql
-- Vérifier les politiques RLS
SELECT * FROM pg_policies WHERE schemaname = 'public';

-- Tester une requête manuellement
SELECT * FROM public.users WHERE id = auth.uid();
```

## 📚 Ressources Supplémentaires

- [Documentation Supabase](https://supabase.com/docs)
- [Guide d'authentification Next.js](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Configuration OAuth](https://supabase.com/docs/guides/auth/social-login)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## 🎯 Prochaines Étapes

Une fois Supabase configuré :

1. **Optimiser les performances** de l'application
2. **Implémenter les fonctionnalités d'export**
3. **Ajouter le système de reviews**
4. **Développer le mode collaboration**

---

**🚀 Félicitations ! Votre instance Supabase est maintenant prête pour BlueKit Stack Builder !**