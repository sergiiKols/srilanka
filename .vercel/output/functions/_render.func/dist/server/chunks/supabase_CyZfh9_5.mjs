import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://mcmzdscpuoxwneuzsanu.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jbXpkc2NwdW94d25ldXpzYW51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzNDAxMjEsImV4cCI6MjA4NDkxNjEyMX0.FINUETJbgsos3tJdrJp_cyAPVOPxqpT_XjWIeFywPzw";
console.log("🔧 Supabase configured:", supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    // Сохраняем сессию в localStorage
    autoRefreshToken: true,
    // Автообновление токена
    detectSessionInUrl: true
    // Определение сессии из URL (для OAuth)
  }
});

export { supabase as s };
