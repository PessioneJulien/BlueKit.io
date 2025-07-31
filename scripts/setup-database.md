# Setup Database

## Vérifier que les migrations sont appliquées

1. **Aller dans Supabase Dashboard** : https://app.supabase.com
2. **Sélectionner votre projet**
3. **Aller dans "SQL Editor"**
4. **Exécuter cette requête pour vérifier si la table users existe** :

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'users';
```

5. **Si la table n'existe pas, exécuter le contenu du fichier** :
   `supabase/migrations/01_initial_schema.sql`

## Vérifier les triggers

```sql
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND trigger_name = 'on_auth_user_created';
```

## Vérifier les fonctions

```sql
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'handle_new_user';
```

## Test d'inscription

Après avoir vérifié que tout est en place :

1. Créer un nouveau compte sur `/auth/signup`
2. Vérifier dans la table `auth.users` qu'un utilisateur a été créé
3. Vérifier dans la table `public.users` qu'un profil a été créé automatiquement

## Résolution des problèmes

Si le trigger ne fonctionne pas :

1. **Vérifier les permissions** :
```sql
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
```

2. **Recréer le trigger** :
```sql
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```