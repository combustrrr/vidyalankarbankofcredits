-- Update basket_credits table to track both recommended and actual credits
-- First, check if we need to modify the table
DO $$ 
BEGIN
  -- Check if actual_credits column already exists
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'basket_credits' AND column_name = 'actual_credits'
  ) THEN
    -- Rename existing total_credits column to recommended_credits
    ALTER TABLE public.basket_credits RENAME COLUMN total_credits TO recommended_credits;
    
    -- Add actual_credits column
    ALTER TABLE public.basket_credits ADD COLUMN actual_credits INTEGER NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Function to update actual credits based on courses
CREATE OR REPLACE FUNCTION update_basket_actual_credits()
RETURNS TRIGGER AS $$
BEGIN
  -- Update actual_credits in basket_credits based on sum of course credits
  UPDATE public.basket_credits bc
  SET actual_credits = COALESCE((
    SELECT SUM(c.credits)
    FROM public.courses c
    WHERE c.vertical = bc.vertical
    AND c.basket = bc.basket
  ), 0);
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_basket_credits_after_course_change ON public.courses;

-- Create triggers to update basket_credits when courses change
CREATE TRIGGER update_basket_credits_after_course_change
  AFTER INSERT OR UPDATE OR DELETE ON public.courses
  FOR EACH STATEMENT
  EXECUTE FUNCTION update_basket_actual_credits();
  
-- Initial population of actual credits
SELECT update_basket_actual_credits();

-- Update views to include both recommended and actual credits
DROP VIEW IF EXISTS public.basket_credits_summary;
CREATE OR REPLACE VIEW public.basket_credits_summary AS
SELECT 
  vertical,
  basket,
  recommended_credits,
  actual_credits,
  CASE 
    WHEN actual_credits < recommended_credits THEN 'under'
    WHEN actual_credits > recommended_credits THEN 'over'
    ELSE 'met'
  END as credit_status
FROM 
  public.basket_credits
ORDER BY 
  vertical ASC,
  basket ASC;

-- Update total_credits view to show both totals
DROP VIEW IF EXISTS public.total_credits;
CREATE OR REPLACE VIEW public.total_credits AS
SELECT 
  SUM(recommended_credits) as total_recommended_credits,
  SUM(actual_credits) as total_actual_credits
FROM 
  public.basket_credits;