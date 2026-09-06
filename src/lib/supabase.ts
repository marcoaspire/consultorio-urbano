import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://lzjzqmlcijvkqwpvkuoe.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6anpxbWxjaWp2a3F3cHZrdW9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2NTQ0MTQsImV4cCI6MjEwNDIzMDQxNH0.qt9VHGBrxMttG_DvQvr3ECmwK0_xoIzWHN688lpPaY0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
