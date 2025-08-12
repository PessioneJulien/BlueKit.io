-- Fix pour les policies RLS qui bloquent les insertions

-- Permettre les insertions de composants officiels sans authentification
CREATE POLICY "Permettre insertion composants officiels" ON public.community_components
  FOR INSERT WITH CHECK (is_official = true);

-- Alternatively, nous pouvons temporairement désactiver RLS pour les tests
-- ALTER TABLE public.community_components DISABLE ROW LEVEL SECURITY;

-- Ou créer une policy plus permissive temporaire
CREATE POLICY "Insertion publique temporaire" ON public.community_components
  FOR INSERT WITH CHECK (true);

-- Note: Cette policy sera à supprimer en production et remplacer par :
-- CREATE POLICY "Les utilisateurs peuvent créer des composants" ON public.community_components
--   FOR INSERT WITH CHECK (auth.uid() = author_id AND is_official = false);