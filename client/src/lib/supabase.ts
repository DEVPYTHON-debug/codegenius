import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || 'https://jxxrxsiqjjkfrmgnqopg.supabase.co',
  import.meta.env.VITE_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHJ4c2lxamprZnJtZ25xb3BnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwOTA0MTYsImV4cCI6MjA2MzY2NjQxNn0.f8qLpF69zDLgxBix1SrDCjFGP8Sy1DLA4T_NH-oMVeo'
);