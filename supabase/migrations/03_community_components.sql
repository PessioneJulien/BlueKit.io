-- Migration pour le système de composants communautaires
-- Créé le: 2024-12-12
-- Description: Tables pour les composants communautaires, reviews, et likes

-- Table principale des composants communautaires
CREATE TABLE IF NOT EXISTS public.community_components (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Informations de base
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN (
    'frontend', 'backend', 'database', 'devops', 
    'mobile', 'ai', 'infrastructure', 'other'
  )),
  
  -- Type et configuration
  type VARCHAR(20) NOT NULL CHECK (type IN ('component', 'container')),
  container_type VARCHAR(20) CHECK (
    container_type IS NULL OR 
    container_type IN ('docker', 'kubernetes')
  ),
  
  -- Métadonnées
  setup_time_hours DECIMAL(4,1) NOT NULL DEFAULT 1.0 CHECK (setup_time_hours > 0),
  difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'expert')),
  pricing VARCHAR(20) NOT NULL CHECK (pricing IN ('free', 'freemium', 'paid')),
  
  -- Documentation et liens
  documentation TEXT,
  official_docs_url VARCHAR(500),
  github_url VARCHAR(500),
  logo_url VARCHAR(500),
  
  -- Tags et compatibilité  
  tags TEXT[] DEFAULT '{}',
  compatible_with TEXT[] DEFAULT '{}',
  contained_technologies TEXT[] DEFAULT '{}', -- Pour les containers
  
  -- Ressources système (JSON)
  resource_requirements JSONB DEFAULT '{}',
  
  -- Métadonnées d'auteur
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_official BOOLEAN DEFAULT false,
  
  -- Stats d'usage (mises à jour via triggers)
  usage_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contraintes
  CONSTRAINT check_container_type_when_container CHECK (
    (type = 'container' AND container_type IS NOT NULL) OR
    (type = 'component' AND container_type IS NULL)
  )
);

-- Table des reviews/évaluations
CREATE TABLE IF NOT EXISTS public.component_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  component_id UUID REFERENCES public.community_components(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Évaluation
  rating DECIMAL(2,1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  
  -- Critères détaillés (JSON)
  criteria JSONB DEFAULT '{}', -- {"documentation": 4, "easeOfUse": 5, "performance": 4}
  
  -- Utilité de la review
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  
  -- Métadonnées
  is_verified BOOLEAN DEFAULT false, -- Review d'un utilisateur vérifié
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Une seule review par utilisateur par composant
  UNIQUE(component_id, user_id)
);

-- Table des likes
CREATE TABLE IF NOT EXISTS public.component_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  component_id UUID REFERENCES public.community_components(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Un seul like par utilisateur par composant
  UNIQUE(component_id, user_id)
);

-- Table pour l'utilité des reviews
CREATE TABLE IF NOT EXISTS public.component_review_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID REFERENCES public.component_reviews(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_helpful BOOLEAN NOT NULL, -- true = helpful, false = not helpful
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Un seul vote par utilisateur par review
  UNIQUE(review_id, user_id)
);

-- Indexes pour les performances
CREATE INDEX IF NOT EXISTS idx_community_components_category ON public.community_components(category);
CREATE INDEX IF NOT EXISTS idx_community_components_type ON public.community_components(type);
CREATE INDEX IF NOT EXISTS idx_community_components_difficulty ON public.community_components(difficulty);
CREATE INDEX IF NOT EXISTS idx_community_components_pricing ON public.community_components(pricing);
CREATE INDEX IF NOT EXISTS idx_community_components_author ON public.community_components(author_id);
CREATE INDEX IF NOT EXISTS idx_community_components_created_at ON public.community_components(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_components_usage_count ON public.community_components(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_community_components_tags ON public.community_components USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_community_components_compatible_with ON public.community_components USING GIN(compatible_with);

CREATE INDEX IF NOT EXISTS idx_component_reviews_component ON public.component_reviews(component_id);
CREATE INDEX IF NOT EXISTS idx_component_reviews_rating ON public.component_reviews(rating DESC);
CREATE INDEX IF NOT EXISTS idx_component_reviews_created_at ON public.component_reviews(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_component_likes_component ON public.component_likes(component_id);
CREATE INDEX IF NOT EXISTS idx_component_likes_user ON public.component_likes(user_id);

-- Triggers pour mettre à jour les timestamps
-- Créer la fonction seulement si elle n'existe pas déjà
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        CREATE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $func$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $func$ LANGUAGE 'plpgsql';
    END IF;
END $$;

CREATE TRIGGER update_community_components_updated_at
    BEFORE UPDATE ON public.community_components
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_component_reviews_updated_at
    BEFORE UPDATE ON public.component_reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour recalculer les stats des reviews
CREATE OR REPLACE FUNCTION update_component_review_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalculer helpful_count et not_helpful_count pour la review
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.component_reviews 
    SET 
      helpful_count = (
        SELECT COUNT(*) FROM public.component_review_votes 
        WHERE review_id = NEW.review_id AND is_helpful = true
      ),
      not_helpful_count = (
        SELECT COUNT(*) FROM public.component_review_votes 
        WHERE review_id = NEW.review_id AND is_helpful = false
      )
    WHERE id = NEW.review_id;
    
    RETURN NEW;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    UPDATE public.component_reviews 
    SET 
      helpful_count = (
        SELECT COUNT(*) FROM public.component_review_votes 
        WHERE review_id = OLD.review_id AND is_helpful = true
      ),
      not_helpful_count = (
        SELECT COUNT(*) FROM public.component_review_votes 
        WHERE review_id = OLD.review_id AND is_helpful = false
      )
    WHERE id = OLD.review_id;
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER trigger_update_component_review_stats
  AFTER INSERT OR UPDATE OR DELETE ON public.component_review_votes
  FOR EACH ROW EXECUTE FUNCTION update_component_review_stats();

-- RLS (Row Level Security) Policies
ALTER TABLE public.community_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.component_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.component_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.component_review_votes ENABLE ROW LEVEL SECURITY;

-- Policies pour community_components
CREATE POLICY "Les composants sont visibles par tous" ON public.community_components
  FOR SELECT USING (true);

CREATE POLICY "Les utilisateurs peuvent créer des composants" ON public.community_components
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Les auteurs peuvent modifier leurs composants" ON public.community_components
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Les auteurs peuvent supprimer leurs composants" ON public.community_components
  FOR DELETE USING (auth.uid() = author_id);

-- Policies pour component_reviews
CREATE POLICY "Les reviews sont visibles par tous" ON public.component_reviews
  FOR SELECT USING (true);

CREATE POLICY "Les utilisateurs connectés peuvent créer des reviews" ON public.component_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent modifier leurs propres reviews" ON public.component_reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres reviews" ON public.component_reviews
  FOR DELETE USING (auth.uid() = user_id);

-- Policies pour component_likes
CREATE POLICY "Les likes sont visibles par tous" ON public.component_likes
  FOR SELECT USING (true);

CREATE POLICY "Les utilisateurs connectés peuvent liker" ON public.component_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent retirer leurs likes" ON public.component_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Policies pour component_review_votes
CREATE POLICY "Les votes sur reviews sont visibles par tous" ON public.component_review_votes
  FOR SELECT USING (true);

CREATE POLICY "Les utilisateurs connectés peuvent voter" ON public.component_review_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent modifier leurs votes" ON public.component_review_votes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent supprimer leurs votes" ON public.component_review_votes
  FOR DELETE USING (auth.uid() = user_id);

-- Vue pour statistiques des composants (avec cache)
CREATE OR REPLACE VIEW public.community_components_stats AS
SELECT 
  cc.*,
  COALESCE(AVG(cr.rating), 0) as avg_rating,
  COUNT(DISTINCT cr.id) as review_count,
  COUNT(DISTINCT cl.id) as likes_count
FROM public.community_components cc
LEFT JOIN public.component_reviews cr ON cc.id = cr.component_id
LEFT JOIN public.component_likes cl ON cc.id = cl.component_id
GROUP BY cc.id;

-- Données de seed (composants officiels)
-- Optionnel: décommenter si vous souhaitez des données de test
/*
INSERT INTO public.community_components (
  name, description, category, type, difficulty, pricing,
  documentation, official_docs_url, github_url, logo_url,
  tags, compatible_with, resource_requirements, is_official
) VALUES 
-- React Query
('React Query', 
 'Powerful asynchronous state management for React applications with caching, synchronization, and optimistic updates.',
 'frontend', 'component', 'intermediate', 'free',
 'React Query (TanStack Query) is a library for fetching, caching, and updating asynchronous data in React applications. It provides a set of hooks that handle server state with automatic caching, background updates, and error handling.',
 'https://tanstack.com/query/latest',
 'https://github.com/TanStack/query',
 '/logos/react-query.svg',
 '{"state-management", "react", "async", "cache", "hooks"}',
 '{"react", "next.js", "vite"}',
 '{"cpu": "0.1 cores", "memory": "50MB"}',
 true),

-- Prisma ORM
('Prisma ORM',
 'Next-generation ORM for Node.js & TypeScript with type-safe database access.',
 'backend', 'component', 'beginner', 'free',
 'Prisma is a modern ORM that generates a type-safe client from your database schema. It supports PostgreSQL, MySQL, SQLite, MongoDB and SQL Server.',
 'https://www.prisma.io/docs',
 'https://github.com/prisma/prisma',
 '/logos/prisma.svg',
 '{"orm", "database", "typescript", "nodejs", "postgresql"}',
 '{"postgresql", "mysql", "mongodb", "sqlite"}',
 '{"cpu": "0.5 cores", "memory": "256MB"}',
 true),

-- LAMP Stack Container
('LAMP Stack',
 'Complete containerized LAMP stack with Linux, Apache, MySQL, and PHP.',
 'infrastructure', 'container', 'intermediate', 'free',
 'Production-ready LAMP stack container with Apache 2.4, MySQL 8.0, PHP 8.2, and phpMyAdmin. Perfect for traditional web development.',
 'https://hub.docker.com/_/lamp',
 'https://github.com/docker-library/lamp',
 '/logos/docker.svg',
 '{"lamp", "web-development", "php", "mysql", "apache"}',
 '{"php", "wordpress", "drupal"}',
 '{"cpu": "2 cores", "memory": "4GB", "storage": "20GB"}',
 true);
*/

-- Commenter pour tester la connexion
-- COMMIT;