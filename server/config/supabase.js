import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = 
  process.env.SUPABASE_URL || 
  process.env.VITE_SUPABASE_URL || 
  "";

const supabaseKey = 
  process.env.SUPABASE_KEY || 
  process.env.SUPABASE_ANON_KEY || 
  process.env.SUPABASE_SERVICE_ROLE_KEY || 
  process.env.VITE_SUPABASE_ANON_KEY || 
  process.env.VITE_SUPABASE_KEY || 
  "";

// Initialize the Supabase client safely
let supabase = null;
if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log("✅ Supabase client initialized successfully on backend server.");
  } catch (err) {
    console.warn("⚠️ Supabase initialization skipped:", err.message);
  }
} else {
  console.warn("⚠️ SUPABASE_URL or SUPABASE_KEY is missing on server. Database persistence running with fallbacks.");
}

export default supabase;
