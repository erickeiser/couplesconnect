
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xvvwhycgorshyvjktvip.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2dndoeWNnb3JzaHl2amt0dmlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMjgwOTgsImV4cCI6MjA3ODcwNDA5OH0.L7_-nRL3kX7m-xnvKgBNmHkOQAHvESPizRqgOVVswOw';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and anon key are required.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
