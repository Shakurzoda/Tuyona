// src/admin/useAuth.js
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useAuth() {
    const [session, setSession] = useState(() => supabase?.auth?.getSession ? null : null);
    const [loading, setLoading] = useState(!!supabase);

    useEffect(() => {
        let unsub = () => {};
        if (!supabase) {
            setLoading(false);
            setSession(null);
            return;
        }

        let cancelled = false;

        async function init() {
            try {
                const { data } = await supabase.auth.getSession();
                if (!cancelled) setSession(data.session ?? null);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        init();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, s) => {
            setSession(s ?? null);
        });
        unsub = () => subscription.unsubscribe();

        return () => {
            cancelled = true;
            unsub();
        };
    }, []);

    return { session, loading };
}
