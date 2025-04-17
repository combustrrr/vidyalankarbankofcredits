-- Create a function to calculate basket credits for a student
CREATE OR REPLACE FUNCTION public.get_basket_credits_for_student(student_id UUID)
RETURNS TABLE (
  vertical TEXT,
  basket TEXT,
  completed_credits BIGINT,
  total_credits BIGINT
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  -- Get completed credits per basket for the student
  WITH completed_basket_credits AS (
    SELECT 
      c.vertical,
      c.basket,
      SUM(cc.credit_awarded) AS completed_credits
    FROM 
      completed_courses cc
      JOIN courses c ON cc.course_id = c.id
    WHERE 
      cc.student_id = $1
    GROUP BY 
      c.vertical,
      c.basket
  ),
  -- Get total credits per basket across all courses
  total_basket_credits AS (
    SELECT 
      vertical,
      basket,
      SUM(credits) AS total_credits
    FROM 
      courses
    GROUP BY 
      vertical,
      basket
  )
  -- Join them together
  SELECT 
    t.vertical,
    t.basket,
    COALESCE(c.completed_credits, 0) AS completed_credits,
    t.total_credits
  FROM 
    total_basket_credits t
    LEFT JOIN completed_basket_credits c 
      ON t.vertical = c.vertical AND t.basket = c.basket
  ORDER BY 
    t.vertical, t.basket;
END; $$;