// src/lib/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const URL = import.meta.env.VITE_SUPABASE_URL?.trim();
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

const hasEnv = Boolean(URL && KEY);

// Экспортируемый клиент (может быть null)
export const supabase = hasEnv ? createClient(URL, KEY) : null;

// Флаги/утилиты
export const isSupabaseReady = hasEnv;

/**
 * Безопасно получить клиент Supabase или бросить предсказуемую ошибку.
 * Используй там, где без Supabase работать невозможно (админка, загрузка из БД).
 */
export function requireSupabase() {
    if (supabase) return supabase;
    const msg =
        "Supabase не сконфигурирован. Проверь VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY (Vercel → Project Settings → Environment Variables).";
    throw new Error(msg);
}

/**
 * Опциональный хелпер — вернуть клиент или null (когда функционал необязателен).
 * Удобно для публичных страниц, где можно показать заглушку.
 */
export function getSupabaseOrNull() {
    return supabase;
}
