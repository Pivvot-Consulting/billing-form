import { createBrowserClient } from '@supabase/ssr';

// Create a browser client that properly handles cookies
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
