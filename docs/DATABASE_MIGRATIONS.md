# Migrations de base de données

## Système de notation des stacks

### 1. Table `stack_ratings`

```sql
-- Créer la table des ratings des stacks
CREATE TABLE IF NOT EXISTS stack_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stack_id UUID NOT NULL REFERENCES stacks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  
  -- Contrainte : un utilisateur ne peut noter qu'une fois par stack
  UNIQUE(stack_id, user_id)
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_stack_ratings_stack_id ON stack_ratings(stack_id);
CREATE INDEX IF NOT EXISTS idx_stack_ratings_user_id ON stack_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_stack_ratings_created_at ON stack_ratings(created_at);
CREATE INDEX IF NOT EXISTS idx_stack_ratings_rating ON stack_ratings(rating);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_stack_ratings_updated_at
    BEFORE UPDATE ON stack_ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Politique de sécurité RLS (Row Level Security)
ALTER TABLE stack_ratings ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent voir tous les ratings
CREATE POLICY "Ratings are viewable by everyone" ON stack_ratings
  FOR SELECT USING (true);

-- Les utilisateurs peuvent insérer leurs propres ratings
CREATE POLICY "Users can insert their own ratings" ON stack_ratings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent modifier leurs propres ratings
CREATE POLICY "Users can update their own ratings" ON stack_ratings
  FOR UPDATE USING (auth.uid() = user_id);

-- Les utilisateurs peuvent supprimer leurs propres ratings
CREATE POLICY "Users can delete their own ratings" ON stack_ratings
  FOR DELETE USING (auth.uid() = user_id);
```

### 2. Mise à jour de la table `stacks`

```sql
-- Ajouter des colonnes pour optimiser les performances (cache des ratings)
ALTER TABLE stacks 
ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_rating_update TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Index sur les nouvelles colonnes
CREATE INDEX IF NOT EXISTS idx_stacks_rating ON stacks(rating);
CREATE INDEX IF NOT EXISTS idx_stacks_rating_count ON stacks(rating_count);

-- Fonction pour recalculer automatiquement la moyenne des ratings
CREATE OR REPLACE FUNCTION update_stack_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Mise à jour des statistiques de rating pour la stack concernée
    UPDATE stacks 
    SET 
        rating = COALESCE((
            SELECT ROUND(AVG(rating)::numeric, 1)
            FROM stack_ratings 
            WHERE stack_id = COALESCE(NEW.stack_id, OLD.stack_id)
        ), 0),
        rating_count = COALESCE((
            SELECT COUNT(*)
            FROM stack_ratings 
            WHERE stack_id = COALESCE(NEW.stack_id, OLD.stack_id)
        ), 0),
        last_rating_update = NOW()
    WHERE id = COALESCE(NEW.stack_id, OLD.stack_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers pour mettre à jour automatiquement les stats
CREATE TRIGGER update_stack_stats_on_rating_insert
    AFTER INSERT ON stack_ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_stack_rating_stats();

CREATE TRIGGER update_stack_stats_on_rating_update
    AFTER UPDATE ON stack_ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_stack_rating_stats();

CREATE TRIGGER update_stack_stats_on_rating_delete
    AFTER DELETE ON stack_ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_stack_rating_stats();
```

### 3. Script d'initialisation des données (optionnel)

```sql
-- Générer quelques ratings de test pour les stacks existantes
-- (Uniquement à des fins de démonstration, supprimer en production)

DO $$
DECLARE 
    stack_record RECORD;
    user_id_sample UUID;
BEGIN
    -- Récupérer un utilisateur test (remplacer par de vrais IDs)
    -- SELECT id INTO user_id_sample FROM auth.users LIMIT 1;
    
    -- Si vous voulez ajouter des ratings factices :
    /*
    FOR stack_record IN SELECT id FROM stacks LIMIT 10 LOOP
        INSERT INTO stack_ratings (stack_id, user_id, rating, comment)
        VALUES (
            stack_record.id,
            user_id_sample,
            (RANDOM() * 2 + 3)::integer, -- Rating entre 3 et 5
            'Excellent stack, très facile à utiliser!'
        ) ON CONFLICT (stack_id, user_id) DO NOTHING;
    END LOOP;
    */
END $$;
```

## Instructions d'application

1. **Supabse CLI** (recommandé) :
   ```bash
   # Sauvegarder le schéma actuel
   supabase db dump --schema=public > backup_before_ratings.sql
   
   # Appliquer la migration
   supabase db reset
   ```

2. **Interface Supabase** :
   - Aller dans SQL Editor
   - Copier/coller les requêtes SQL ci-dessus
   - Exécuter dans l'ordre

3. **Vérification** :
   ```sql
   -- Vérifier que la table existe
   SELECT table_name FROM information_schema.tables WHERE table_name = 'stack_ratings';
   
   -- Vérifier les nouvelles colonnes de stacks
   SELECT column_name FROM information_schema.columns WHERE table_name = 'stacks' AND column_name IN ('rating_count', 'last_rating_update');
   ```

## Rollback

Si nécessaire, pour annuler les changements :

```sql
-- Supprimer la table ratings
DROP TABLE IF EXISTS stack_ratings CASCADE;

-- Supprimer les nouvelles colonnes de stacks
ALTER TABLE stacks 
DROP COLUMN IF EXISTS rating_count,
DROP COLUMN IF EXISTS last_rating_update;

-- Supprimer les fonctions et triggers
DROP FUNCTION IF EXISTS update_stack_rating_stats() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
```