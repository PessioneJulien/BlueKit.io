-- Script pour supprimer les tables existantes avant recréation
-- À exécuter AVANT 03_community_components.sql si les tables existent déjà

-- Supprimer les vues
DROP VIEW IF EXISTS public.community_components_stats;

-- Supprimer les triggers spécifiques aux community components
DROP TRIGGER IF EXISTS update_community_components_updated_at ON public.community_components;
DROP TRIGGER IF EXISTS update_component_reviews_updated_at ON public.component_reviews;
DROP TRIGGER IF EXISTS trigger_update_component_review_stats ON public.component_review_votes;

-- Supprimer les triggers existants sur les anciennes tables si elles existent
DROP TRIGGER IF EXISTS trigger_components_updated_at ON public.components;
DROP TRIGGER IF EXISTS trigger_component_reviews_updated_at ON public.component_reviews;

-- Supprimer les fonctions avec CASCADE pour gérer les dépendances
DROP FUNCTION IF EXISTS update_component_review_stats() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Supprimer les tables dans l'ordre (à cause des foreign keys)
DROP TABLE IF EXISTS public.component_review_votes;
DROP TABLE IF EXISTS public.component_likes;
DROP TABLE IF EXISTS public.component_reviews;
DROP TABLE IF EXISTS public.community_components;

-- Message de confirmation
DO $$ 
BEGIN 
    RAISE NOTICE 'Tables community components supprimées avec succès';
END $$;