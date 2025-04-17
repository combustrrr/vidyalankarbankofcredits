-- Create a view that calculates total credits per basket
DROP VIEW IF EXISTS public.basket_credits;

CREATE VIEW public.basket_credits AS
SELECT 
    vertical,
    basket,
    SUM(credits) AS total_credits
FROM 
    public.courses
GROUP BY 
    vertical, basket
ORDER BY 
    vertical, basket;

-- Create a view that calculates the overall total credits
DROP VIEW IF EXISTS public.total_credits;

CREATE VIEW public.total_credits AS
SELECT 
    SUM(total_credits) AS grand_total
FROM 
    public.basket_credits;

-- Grant access to the authenticated and anon roles
GRANT SELECT ON public.basket_credits TO authenticated;
GRANT SELECT ON public.basket_credits TO anon;
GRANT SELECT ON public.total_credits TO authenticated;
GRANT SELECT ON public.total_credits TO anon;
