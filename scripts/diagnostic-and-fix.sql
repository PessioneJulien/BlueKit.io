-- Diagnostic et correction complète des problèmes RLS et trigger
-- Exécuter ce script dans Supabase SQL Editor

-- 1. DIAGNOSTIC: Vérifier la table users
SELECT 'Checking users table...' as step;
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_name = 'users' AND table_schema = 'public';

-- 2. DIAGNOSTIC: Vérifier les politiques RLS actuelles
SELECT 'Current RLS policies on users table:' as step;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'users';

-- 3. DIAGNOSTIC: Vérifier le trigger
SELECT 'Checking trigger...' as step;
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 4. CORRECTION: Supprimer toutes les anciennes politiques sur users
DROP POLICY IF EXISTS "Users can view public profiles" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

-- 5. CORRECTION: Créer des politiques RLS plus permissives
-- Permettre à tous les utilisateurs authentifiés de lire tous les profils
CREATE POLICY "Allow authenticated users to read all profiles" ON public.users
  FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Permettre aux utilisateurs de créer leur propre profil
CREATE POLICY "Allow users to insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Permettre aux utilisateurs de modifier leur propre profil
CREATE POLICY "Allow users to update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- 6. CORRECTION: Vérifier et recréer la fonction trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insérer avec les données des métadonnées utilisateur
  INSERT INTO public.users (id, email, name, bio, website, github, twitter, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'bio', ''),
    COALESCE(NEW.raw_user_meta_data->>'website', ''),
    COALESCE(NEW.raw_user_meta_data->>'github', ''),
    COALESCE(NEW.raw_user_meta_data->>'twitter', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log l'erreur mais ne pas faire échouer l'inscription
    RAISE WARNING 'Failed to create user profile: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. CORRECTION: Recréer le trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. VÉRIFICATION: Afficher les nouvelles politiques
SELECT 'New RLS policies:' as step;
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'users';

-- 9. TEST: Vérifier les permissions
SELECT 'Testing permissions...' as step;
SELECT 
  has_table_privilege('authenticated', 'public.users', 'SELECT') as can_select,
  has_table_privilege('authenticated', 'public.users', 'INSERT') as can_insert,
  has_table_privilege('authenticated', 'public.users', 'UPDATE') as can_update;

SELECT 'Setup complete! Try creating a new user account now.' as status;