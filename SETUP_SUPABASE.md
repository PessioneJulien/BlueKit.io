# 🚀 Configuration Rapide Supabase - BlueKit

## Configuration Express (5 minutes)

### Option 1 : Script Automatisé ⚡
```bash
# Exécuter le script de configuration automatique
./scripts/setup-supabase.sh
```

### Option 2 : Configuration Manuelle 🛠️

#### 1. Créer le Projet Supabase
1. Aller sur [supabase.com](https://supabase.com)
2. Créer un projet : `bluekit-stack-builder`
3. Noter l'URL et les clés API

#### 2. Variables d'Environnement
```bash
# Copier le template et remplir les valeurs
cp .env.local.example .env.local

# Éditer .env.local avec vos vraies valeurs Supabase
```

#### 3. Base de Données
```bash
# Installer CLI Supabase
npm install -g supabase

# Se connecter et migrer
supabase login
supabase link --project-ref votre-project-ref
supabase db push
```

#### 4. Données de Base
```sql
-- Dans l'éditeur SQL Supabase, exécuter :
-- Le contenu de supabase/seed.sql
```

#### 5. Test
```bash
npm run dev
# Ouvrir http://localhost:3000
# Tester l'inscription/connexion
```

## Documentation Complète 📚

- **[Guide Détaillé](docs/SUPABASE_SETUP.md)** - Configuration étape par étape
- **[Checklist de Validation](docs/SUPABASE_CHECKLIST.md)** - Vérifier que tout fonctionne
- **[Guide d'Authentification](docs/AUTHENTICATION.md)** - Architecture et utilisation

## Configuration OAuth (Optionnel)

### GitHub OAuth
1. [GitHub Developer Settings](https://github.com/settings/developers)
2. Créer OAuth App avec callback : `https://[project-ref].supabase.co/auth/v1/callback`
3. Ajouter Client ID/Secret dans Supabase

### Google OAuth
1. [Google Cloud Console](https://console.cloud.google.com)
2. Créer credentials OAuth 2.0
3. Ajouter Client ID/Secret dans Supabase

## Résolution de Problèmes ⚠️

### Erreurs Communes

**"Invalid login credentials"**
- Vérifier que l'email est confirmé
- Vérifier les variables d'environnement

**"Failed to fetch user"** 
- Vérifier NEXT_PUBLIC_SUPABASE_URL
- Vérifier la connexion réseau

**Migrations échouent**
- Copier/coller manuellement le contenu de `supabase/migrations/01_initial_schema.sql`

## Support 🆘

1. **Vérifier** [SUPABASE_CHECKLIST.md](docs/SUPABASE_CHECKLIST.md)
2. **Consulter** les logs Supabase Dashboard > Logs
3. **Tester** avec `curl https://[project-ref].supabase.co/rest/v1/`

---

**✅ Une fois configuré, votre authentification Supabase sera pleinement fonctionnelle !**