CREATE OR REPLACE FUNCTION public.update_goal_saved()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  UPDATE public.goals
  SET saved_amount = (
    SELECT COALESCE(SUM(amount), 0)
    FROM public.contributions
    WHERE goal_id = NEW.goal_id
  )
  WHERE id = NEW.goal_id;
  RETURN NEW;
END;
$function$;
