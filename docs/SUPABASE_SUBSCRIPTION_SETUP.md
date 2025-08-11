# 📚 Guide complet d'intégration Supabase + Stripe

## 1. Configuration Supabase

### Étape 1 : Exécuter les migrations SQL

Connectez-vous à votre projet Supabase et exécutez ces requêtes SQL dans l'éditeur SQL :

```sql
-- 1. Créer la table user_profiles si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  subscription_status VARCHAR(50),
  subscription_plan VARCHAR(255),
  subscription_current_period_end TIMESTAMP WITH TIME ZONE,
  subscription_created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 2. Créer les index pour les performances
CREATE INDEX IF NOT EXISTS idx_user_profiles_stripe_customer_id 
ON user_profiles(stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_user_profiles_stripe_subscription_id 
ON user_profiles(stripe_subscription_id);

CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_status 
ON user_profiles(subscription_status);

-- 3. Créer la table pour tracker l'usage
CREATE TABLE IF NOT EXISTS public.user_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stack_count INTEGER DEFAULT 0,
  components_used INTEGER DEFAULT 0,
  exports_count INTEGER DEFAULT 0,
  last_export_at TIMESTAMP WITH TIME ZONE,
  period_start TIMESTAMP WITH TIME ZONE DEFAULT DATE_TRUNC('month', NOW()),
  period_end TIMESTAMP WITH TIME ZONE DEFAULT DATE_TRUNC('month', NOW()) + INTERVAL '1 month',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, period_start)
);

-- 4. Fonction pour vérifier les limites d'abonnement
CREATE OR REPLACE FUNCTION check_subscription_limit(
  p_user_id UUID,
  p_limit_type TEXT,
  p_current_count INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  v_subscription_plan VARCHAR;
  v_limit INTEGER;
BEGIN
  -- Récupérer le plan de l'utilisateur
  SELECT subscription_plan INTO v_subscription_plan
  FROM user_profiles
  WHERE user_id = p_user_id;
  
  -- Définir les limites selon le plan
  CASE COALESCE(v_subscription_plan, 'free')
    WHEN 'free' THEN
      CASE p_limit_type
        WHEN 'stacks' THEN v_limit := 3;
        WHEN 'components' THEN v_limit := 10;
        WHEN 'exports' THEN v_limit := 5;
        ELSE v_limit := 0;
      END CASE;
    WHEN 'price_1RuhzLLHD8k9z6XEUjMt0CZI' THEN -- Starter
      CASE p_limit_type
        WHEN 'stacks' THEN v_limit := 10;
        WHEN 'components' THEN v_limit := 25;
        WHEN 'exports' THEN v_limit := 50;
        ELSE v_limit := 0;
      END CASE;
    WHEN 'price_1RuhzMLHD8k9z6XEiLFmymgz' THEN -- Professional
      v_limit := -1; -- Illimité
    ELSE
      -- Par défaut, utiliser les limites gratuites
      CASE p_limit_type
        WHEN 'stacks' THEN v_limit := 3;
        WHEN 'components' THEN v_limit := 10;
        WHEN 'exports' THEN v_limit := 5;
        ELSE v_limit := 0;
      END CASE;
  END CASE;
  
  -- Retourner true si illimité ou sous la limite
  RETURN v_limit = -1 OR p_current_count < v_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Activer RLS (Row Level Security)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;

-- 6. Créer les politiques RLS pour user_profiles
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 7. Créer les politiques RLS pour user_usage
CREATE POLICY "Users can view their own usage"
  ON user_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage"
  ON user_usage FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage"
  ON user_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 8. Trigger pour créer automatiquement un profil utilisateur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Attacher le trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 10. Créer un profil pour les utilisateurs existants
INSERT INTO public.user_profiles (user_id, email)
SELECT id, email FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_profiles)
ON CONFLICT (user_id) DO NOTHING;
```

## 2. Variables d'environnement

Vos variables Supabase sont déjà configurées dans `.env.local` :
```env
NEXT_PUBLIC_SUPABASE_URL=https://odzjdqwtltxiwvabqioy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

## 3. Configuration du Webhook Stripe

### Dans Stripe Dashboard :

1. Allez dans **Developers → Webhooks**
2. Cliquez **Add endpoint**
3. **Endpoint URL** : `https://votre-domaine.com/api/stripe/webhook`
4. Sélectionnez ces événements :
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copiez le **Webhook secret** et ajoutez-le dans `.env.local`

## 4. Test en local

```bash
# Installer Stripe CLI
brew install stripe/stripe-cli/stripe

# Se connecter
stripe login

# Écouter les webhooks
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Dans un autre terminal, déclencher un test
stripe trigger customer.subscription.created
```

## 5. Structure de données

### Table `user_profiles`
- `user_id` : Référence vers auth.users
- `stripe_customer_id` : ID client Stripe
- `stripe_subscription_id` : ID abonnement actif
- `subscription_plan` : Price ID du plan actuel
- `subscription_status` : active, past_due, canceled, etc.

### Table `user_usage`
- Track l'utilisation mensuelle
- Reset automatique chaque mois
- Utilisé pour vérifier les limites

## 6. Flux complet

1. **Inscription utilisateur** → Trigger crée profil automatiquement
2. **Checkout Stripe** → Redirige vers Stripe
3. **Paiement réussi** → Webhook met à jour user_profiles
4. **App vérifie** → Lit subscription_plan pour appliquer limites
5. **Limites appliquées** → Via hooks React dans l'app

## 7. Debugging

Si les limites ne fonctionnent pas :

1. Vérifiez que les tables existent dans Supabase
2. Vérifiez que l'utilisateur a un profil dans user_profiles
3. Vérifiez les logs du webhook : `/api/stripe/webhook`
4. Testez la fonction SQL directement dans Supabase

## 8. Commandes utiles

```sql
-- Voir le plan d'un utilisateur
SELECT * FROM user_profiles WHERE email = 'user@example.com';

-- Forcer un plan pour tester
UPDATE user_profiles 
SET subscription_plan = 'price_1RuhzLLHD8k9z6XEUjMt0CZI',
    subscription_status = 'active'
WHERE email = 'user@example.com';

-- Reset l'usage mensuel
UPDATE user_usage 
SET stack_count = 0, components_used = 0, exports_count = 0
WHERE user_id = 'uuid-here';
```

## ⚠️ Important

- Les Price IDs dans la fonction SQL doivent correspondre exactement à ceux de Stripe
- Le webhook doit être configuré avec le bon secret
- Les politiques RLS sont essentielles pour la sécurité

---

📌 **Une fois ces étapes complétées, le système de subscription sera pleinement opérationnel !**