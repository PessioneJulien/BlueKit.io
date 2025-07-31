# Migration 02: Add nodes and connections to stacks

## Instructions

1. **Aller dans Supabase Dashboard** : https://app.supabase.com
2. **Sélectionner votre projet**
3. **Aller dans "SQL Editor"**
4. **Exécuter le contenu du fichier** : `supabase/migrations/02_add_nodes_connections.sql`

## Vérification

Après avoir exécuté la migration, vérifiez que les colonnes ont été ajoutées :

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'stacks' 
AND column_name IN ('nodes', 'connections');
```

## Test

Créez une stack de test pour vérifier que tout fonctionne :

```sql
INSERT INTO public.stacks (name, description, author_id, nodes, connections)
VALUES (
  'Test Stack',
  'A test stack to verify the new columns work',
  (SELECT id FROM auth.users LIMIT 1),
  '[{"id": "react", "name": "React", "position": {"x": 100, "y": 100}}]'::jsonb,
  '[]'::jsonb
);
```

Puis vérifiez que les données sont bien stockées :

```sql
SELECT id, name, nodes, connections 
FROM public.stacks 
WHERE name = 'Test Stack';
```