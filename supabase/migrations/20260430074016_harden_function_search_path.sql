-- Harden function execution context.
-- Fixes Supabase advisor warning: function_search_path_mutable.
ALTER FUNCTION public.update_updated_at_column()
SET search_path = public, pg_temp;

ALTER FUNCTION public.get_current_context_id()
SET search_path = public, pg_temp;
