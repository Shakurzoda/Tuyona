// src/admin/AdminLogin.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import "./admin.css";

export default function AdminLogin() {
    const nav = useNavigate();
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setErr("");

            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password: pass,
            });
            if (error) throw error;

            // мягкая клиентская навигация
            nav("/admin", { replace: true });
        } catch (e2) {
            setErr(e2?.message || "Ошибка входа");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-shell">
            <form className="auth-card" onSubmit={onSubmit}>
                <h1>Вход</h1>
                {err && <div className="error mb-8">{err}</div>}

                <label className="label">Email</label>
                <input
                    className="input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="username"
                    required
                />

                <label className="label mt-8">Пароль</label>
                <input
                    className="input"
                    type="password"
                    value={pass}
                    onChange={(e) => setPass(e.target.value)}
                    autoComplete="current-password"
                    required
                />

                <button className="btn primary mt-16" type="submit" disabled={loading}>
                    {loading ? "Входим…" : "Войти"}
                </button>
            </form>
        </div>
    );
}
