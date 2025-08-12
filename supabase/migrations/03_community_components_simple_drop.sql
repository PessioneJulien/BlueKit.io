-- Script simple pour supprimer uniquement les tables community components
-- Sans toucher aux fonctions partagées existantes

-- Supprimer les vues spécifiques
DROP VIEW IF EXISTS public.community_components_stats;

-- Supprimer les triggers spécifiques (sans toucher aux fonctions)
DROP TRIGGER IF EXISTS update_community_components_updated_at ON public.community_components;
DROP TRIGGER IF EXISTS update_component_reviews_updated_at ON public.component_reviews;
DROP TRIGGER IF EXISTS trigger_update_component_review_stats ON public.component_review_votes;

-- Supprimer uniquement la fonction spécifique aux reviews (pas celle partagée)
DROP FUNCTION IF EXISTS update_component_review_stats();

-- Supprimer les tables dans l'ordre (à cause des foreign keys)
DROP TABLE IF EXISTS public.component_review_votes CASCADE;
DROP TABLE IF EXISTS public.component_likes CASCADE;
DROP TABLE IF EXISTS public.component_reviews CASCADE;
DROP TABLE IF EXISTS public.community_components CASCADE;

-- Message de confirmation
DO $$ 
BEGIN 
    RAISE NOTICE 'Tables community components supprimées avec succès (fonctions partagées préservées)';
END $$;