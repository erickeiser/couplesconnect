
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wcwyjnjmdivhnbdculil.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indjd3lqbmptZGl2aG5iZGN1bGlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNTEzOTgsImV4cCI6MjA3NDcyNzM5OH0.eyqQpb3XCctRuh96WLZXM5Ej7h5iVS1XWHLWbfIpPPE';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and anon key are required.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);