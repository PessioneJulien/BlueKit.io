-- Add nodes and connections columns to stacks table
-- These will store the visual builder data as JSONB

ALTER TABLE public.stacks 
ADD COLUMN nodes JSONB DEFAULT '[]'::jsonb,
ADD COLUMN connections JSONB DEFAULT '[]'::jsonb;

-- Update existing stacks to have empty arrays
UPDATE public.stacks 
SET nodes = '[]'::jsonb, connections = '[]'::jsonb 
WHERE nodes IS NULL OR connections IS NULL;

-- Add indexes for better performance when querying nodes and connections
CREATE INDEX idx_stacks_nodes ON public.stacks USING GIN(nodes);
CREATE INDEX idx_stacks_connections ON public.stacks USING GIN(connections);

-- Add a comment to explain the structure
COMMENT ON COLUMN public.stacks.nodes IS 'Array of canvas nodes with positions and properties';
COMMENT ON COLUMN public.stacks.connections IS 'Array of connections between nodes';