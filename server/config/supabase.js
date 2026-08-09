import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Initialize the Supabase client safely
let supabase = null;
if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
  } catch (err) {
    console.warn("Supabase initialization skipped:", err.message);
  }
} else {
  console.warn("SUPABASE_URL or SUPABASE_KEY is missing. Database persistence disabled.");
}

export default supabase;