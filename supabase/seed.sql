-- Seed data for technologies
INSERT INTO public.technologies (name, category, description, setup_time_hours, difficulty_level, pricing) VALUES
  ('React', 'frontend', 'A JavaScript library for building user interfaces', 2, 'intermediate', 'free'),
  ('Next.js', 'frontend', 'The React Framework for Production', 3, 'intermediate', 'free'),
  ('TypeScript', 'frontend', 'JavaScript with syntax for types', 1, 'intermediate', 'free'),
  ('Tailwind CSS', 'frontend', 'A utility-first CSS framework', 1, 'beginner', 'free'),
  ('Vue.js', 'frontend', 'The Progressive JavaScript Framework', 2, 'beginner', 'free'),
  ('Angular', 'frontend', 'Platform for building mobile and desktop web applications', 4, 'expert', 'free'),
  ('Svelte', 'frontend', 'Cybernetically enhanced web apps', 2, 'intermediate', 'free'),
  ('Gatsby', 'frontend', 'Build blazing fast, modern apps and websites with React', 3, 'intermediate', 'free'),
  
  ('Node.js', 'backend', 'JavaScript runtime built on Chrome V8 engine', 2, 'intermediate', 'free'),
  ('Express.js', 'backend', 'Fast, unopinionated, minimalist web framework for Node.js', 1, 'beginner', 'free'),
  ('FastAPI', 'backend', 'Modern, fast web framework for building APIs with Python', 2, 'intermediate', 'free'),
  ('Django', 'backend', 'The web framework for perfectionists with deadlines', 4, 'intermediate', 'free'),
  ('Flask', 'backend', 'A simple framework for building complex web applications', 2, 'beginner', 'free'),
  ('Laravel', 'backend', 'The PHP Framework for Web Artisans', 3, 'intermediate', 'free'),
  ('Spring Boot', 'backend', 'Java-based framework for building web applications', 5, 'expert', 'free'),
  ('Ruby on Rails', 'backend', 'Server-side web application framework written in Ruby', 4, 'intermediate', 'free'),
  
  ('PostgreSQL', 'database', 'Advanced open source relational database', 3, 'intermediate', 'free'),
  ('MySQL', 'database', 'Popular open source relational database', 2, 'beginner', 'free'),
  ('MongoDB', 'database', 'Document-oriented NoSQL database', 2, 'intermediate', 'freemium'),
  ('Redis', 'database', 'In-memory data structure store', 1, 'intermediate', 'freemium'),
  ('SQLite', 'database', 'Self-contained, serverless SQL database engine', 1, 'beginner', 'free'),
  ('Elasticsearch', 'database', 'Distributed search and analytics engine', 4, 'expert', 'freemium'),
  
  ('Docker', 'devops', 'Container platform for applications', 4, 'expert', 'freemium'),
  ('Kubernetes', 'devops', 'Container orchestration platform', 8, 'expert', 'free'),
  ('AWS', 'devops', 'Amazon Web Services cloud platform', 6, 'expert', 'paid'),
  ('Vercel', 'devops', 'Platform for frontend frameworks and static sites', 1, 'beginner', 'freemium'),
  ('Netlify', 'devops', 'Modern web development platform', 1, 'beginner', 'freemium'),
  ('GitHub Actions', 'devops', 'CI/CD platform integrated with GitHub', 3, 'intermediate', 'freemium'),
  ('Jenkins', 'devops', 'Open source automation server', 5, 'expert', 'free'),
  
  ('Supabase', 'backend', 'Open source Firebase alternative', 2, 'beginner', 'freemium'),
  ('Firebase', 'backend', 'Google mobile and web application development platform', 2, 'beginner', 'freemium'),
  ('Stripe', 'other', 'Payment processing platform', 3, 'intermediate', 'paid'),
  ('Auth0', 'other', 'Identity management platform', 2, 'intermediate', 'freemium'),
  ('GraphQL', 'backend', 'Query language for APIs', 3, 'intermediate', 'free'),
  ('Prisma', 'database', 'Next-generation ORM for Node.js and TypeScript', 2, 'intermediate', 'freemium'),
  ('Contentful', 'other', 'API-first content management platform', 2, 'beginner', 'freemium'),
  ('Sanity', 'other', 'Platform for structured content', 2, 'intermediate', 'freemium');

-- Note: Stacks will be created through the application interface or additional seed scripts
-- The application already has comprehensive stack data in /lib/data/stacksData.ts