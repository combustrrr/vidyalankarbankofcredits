npm run setup:basket-credits-- Setup basket_credits table based on program structure
CREATE TABLE IF NOT EXISTS public.basket_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vertical TEXT NOT NULL,
  basket TEXT NOT NULL,
  total_credits INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(vertical, basket)
);

-- Add RLS policies for basket_credits
ALTER TABLE public.basket_credits ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read basket_credits
CREATE POLICY "Allow public read access to basket_credits" 
  ON public.basket_credits 
  FOR SELECT 
  USING (true);

-- Only allow admins to update basket_credits
CREATE POLICY "Allow admin update access to basket_credits" 
  ON public.basket_credits 
  FOR UPDATE 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Create a view to sum credits by basket
CREATE OR REPLACE VIEW public.basket_credits_summary AS
SELECT 
  vertical,
  basket,
  total_credits
FROM 
  public.basket_credits
ORDER BY 
  vertical ASC,
  basket ASC;

-- Create a view to calculate overall total credits
CREATE OR REPLACE VIEW public.total_credits AS
SELECT 
  SUM(total_credits) as grand_total
FROM 
  public.basket_credits;

-- Function to refresh/populate basket_credits from program structure
CREATE OR REPLACE FUNCTION public.refresh_basket_credits()
RETURNS void AS $$
BEGIN
  -- Clear existing data
  DELETE FROM public.basket_credits;
  
  -- BSC/ESC
  INSERT INTO public.basket_credits (vertical, basket, total_credits) VALUES
  ('BSC/ESC', 'Semester 1', 6),
  ('BSC/ESC', 'Semester 2', 3),
  ('BSC/ESC', 'Semester 3', 3),
  ('BSC/ESC', 'Semester 4', 3),
  ('BSC/ESC', 'Semester 5', 0),
  ('BSC/ESC', 'Semester 6', 0),
  ('BSC/ESC', 'Semester 7', 0),
  ('BSC/ESC', 'Semester 8', 0);

  -- ESC
  INSERT INTO public.basket_credits (vertical, basket, total_credits) VALUES
  ('ESC', 'Semester 1', 6),
  ('ESC', 'Semester 2', 6),
  ('ESC', 'Semester 3', 0),
  ('ESC', 'Semester 4', 0),
  ('ESC', 'Semester 5', 0),
  ('ESC', 'Semester 6', 0),
  ('ESC', 'Semester 7', 0),
  ('ESC', 'Semester 8', 0);

  -- PCC
  INSERT INTO public.basket_credits (vertical, basket, total_credits) VALUES
  ('PCC', 'Semester 1', 0),
  ('PCC', 'Semester 2', 0),
  ('PCC', 'Semester 3', 9),
  ('PCC', 'Semester 4', 12),
  ('PCC', 'Semester 5', 12),
  ('PCC', 'Semester 6', 9),
  ('PCC', 'Semester 7', 3),
  ('PCC', 'Semester 8', 0);

  -- PEC
  INSERT INTO public.basket_credits (vertical, basket, total_credits) VALUES
  ('PEC', 'Semester 1', 0),
  ('PEC', 'Semester 2', 0),
  ('PEC', 'Semester 3', 0),
  ('PEC', 'Semester 4', 0),
  ('PEC', 'Semester 5', 3),
  ('PEC', 'Semester 6', 6),
  ('PEC', 'Semester 7', 9),
  ('PEC', 'Semester 8', 0);

  -- MDM
  INSERT INTO public.basket_credits (vertical, basket, total_credits) VALUES
  ('MDM', 'Semester 1', 0),
  ('MDM', 'Semester 2', 2),
  ('MDM', 'Semester 3', 3),
  ('MDM', 'Semester 4', 3),
  ('MDM', 'Semester 5', 3),
  ('MDM', 'Semester 6', 3),
  ('MDM', 'Semester 7', 0),
  ('MDM', 'Semester 8', 0);

  -- OE
  INSERT INTO public.basket_credits (vertical, basket, total_credits) VALUES
  ('OE', 'Semester 1', 0),
  ('OE', 'Semester 2', 0),
  ('OE', 'Semester 3', 0),
  ('OE', 'Semester 4', 0),
  ('OE', 'Semester 5', 3),
  ('OE', 'Semester 6', 0),
  ('OE', 'Semester 7', 5),
  ('OE', 'Semester 8', 0);

  -- VSEC
  INSERT INTO public.basket_credits (vertical, basket, total_credits) VALUES
  ('VSEC', 'Semester 1', 3),
  ('VSEC', 'Semester 2', 3),
  ('VSEC', 'Semester 3', 2),
  ('VSEC', 'Semester 4', 0),
  ('VSEC', 'Semester 5', 0),
  ('VSEC', 'Semester 6', 0),
  ('VSEC', 'Semester 7', 0),
  ('VSEC', 'Semester 8', 0);

  -- AEC
  INSERT INTO public.basket_credits (vertical, basket, total_credits) VALUES
  ('AEC', 'Semester 1', 3),
  ('AEC', 'Semester 2', 1),
  ('AEC', 'Semester 3', 0),
  ('AEC', 'Semester 4', 0),
  ('AEC', 'Semester 5', 0),
  ('AEC', 'Semester 6', 0),
  ('AEC', 'Semester 7', 0),
  ('AEC', 'Semester 8', 3);

  -- EEMC
  INSERT INTO public.basket_credits (vertical, basket, total_credits) VALUES
  ('EEMC', 'Semester 1', 0),
  ('EEMC', 'Semester 2', 0),
  ('EEMC', 'Semester 3', 0),
  ('EEMC', 'Semester 4', 0),
  ('EEMC', 'Semester 5', 3),
  ('EEMC', 'Semester 6', 3),
  ('EEMC', 'Semester 7', 3),
  ('EEMC', 'Semester 8', 3);

  -- IKS
  INSERT INTO public.basket_credits (vertical, basket, total_credits) VALUES
  ('IKS', 'Semester 1', 0),
  ('IKS', 'Semester 2', 2),
  ('IKS', 'Semester 3', 0),
  ('IKS', 'Semester 4', 0),
  ('IKS', 'Semester 5', 0),
  ('IKS', 'Semester 6', 0),
  ('IKS', 'Semester 7', 0),
  ('IKS', 'Semester 8', 0);

  -- VEC
  INSERT INTO public.basket_credits (vertical, basket, total_credits) VALUES
  ('VEC', 'Semester 1', 3),
  ('VEC', 'Semester 2', 0),
  ('VEC', 'Semester 3', 0),
  ('VEC', 'Semester 4', 0),
  ('VEC', 'Semester 5', 0),
  ('VEC', 'Semester 6', 0),
  ('VEC', 'Semester 7', 0),
  ('VEC', 'Semester 8', 0);

  -- RM
  INSERT INTO public.basket_credits (vertical, basket, total_credits) VALUES
  ('RM', 'Semester 1', 0),
  ('RM', 'Semester 2', 0),
  ('RM', 'Semester 3', 0),
  ('RM', 'Semester 4', 0),
  ('RM', 'Semester 5', 0),
  ('RM', 'Semester 6', 0),
  ('RM', 'Semester 7', 0),
  ('RM', 'Semester 8', 3);

  -- CEP/FP
  INSERT INTO public.basket_credits (vertical, basket, total_credits) VALUES
  ('CEP/FP', 'Semester 1', 0),
  ('CEP/FP', 'Semester 2', 0),
  ('CEP/FP', 'Semester 3', 0),
  ('CEP/FP', 'Semester 4', 0),
  ('CEP/FP', 'Semester 5', 0),
  ('CEP/FP', 'Semester 6', 2),
  ('CEP/FP', 'Semester 7', 0),
  ('CEP/FP', 'Semester 8', 0);

  -- Project
  INSERT INTO public.basket_credits (vertical, basket, total_credits) VALUES
  ('Project', 'Semester 1', 0),
  ('Project', 'Semester 2', 0),
  ('Project', 'Semester 3', 0),
  ('Project', 'Semester 4', 0),
  ('Project', 'Semester 5', 0),
  ('Project', 'Semester 6', 0),
  ('Project', 'Semester 7', 0),
  ('Project', 'Semester 8', 6);

  -- Internship/OJT
  INSERT INTO public.basket_credits (vertical, basket, total_credits) VALUES
  ('Internship/OJT', 'Semester 1', 0),
  ('Internship/OJT', 'Semester 2', 0),
  ('Internship/OJT', 'Semester 3', 0),
  ('Internship/OJT', 'Semester 4', 0),
  ('Internship/OJT', 'Semester 5', 2),
  ('Internship/OJT', 'Semester 6', 2),
  ('Internship/OJT', 'Semester 7', 2),
  ('Internship/OJT', 'Semester 8', 6);

  -- CC
  INSERT INTO public.basket_credits (vertical, basket, total_credits) VALUES
  ('CC', 'Semester 1', 0),
  ('CC', 'Semester 2', 2),
  ('CC', 'Semester 3', 2),
  ('CC', 'Semester 4', 0),
  ('CC', 'Semester 5', 0),
  ('CC', 'Semester 6', 0),
  ('CC', 'Semester 7', 0),
  ('CC', 'Semester 8', 0);
END;
$$ LANGUAGE plpgsql;

-- Run the function to populate the initial data
SELECT refresh_basket_credits();