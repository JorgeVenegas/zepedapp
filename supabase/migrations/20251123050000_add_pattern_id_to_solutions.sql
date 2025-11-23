-- Add pattern_id column to solutions table
ALTER TABLE public.solutions 
ADD COLUMN pattern_id uuid REFERENCES public.patterns(id) ON DELETE CASCADE;

-- Create index for pattern_id lookups
CREATE INDEX idx_solutions_pattern_id ON public.solutions USING btree (pattern_id);

-- Make pattern_id required for new entries (but allow existing nulls if any)
-- Note: If you want to make it NOT NULL, first ensure all existing rows have a pattern_id
-- ALTER TABLE public.solutions ALTER COLUMN pattern_id SET NOT NULL;
