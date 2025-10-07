// src/lib/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL || "";
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// В dev бросаем явную ошибку (сразу видно причину)
if ((!url || !anon) && import.meta.env.DEV) {
  throw new Error(
    "Missing env: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. " +
      "Добавь их в .env (локально) и в Vercel → Settings → Environment Variables."
  );
}

// В prod, если кто-то забыл env, не создаём клиент, чтобы не уронить всё приложение
export const supabase = url && anon ? createClient(url, anon) : null;

// В местах, где очень нужен supabase, можно звать:
export function requireSupabase() {
  if (!supabase) {
    throw new Error("Supabase is not configured (env variables are missing).");
  }
  return supabase;
}
