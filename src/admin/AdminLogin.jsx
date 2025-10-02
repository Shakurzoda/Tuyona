import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import "./admin.css";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");

  const onLogin = async (e) => {
    e.preventDefault();
    setErr("");
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });
    if (error) setErr(error.message);
    else window.location.href = "/admin";
  };

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-title">Вход в админку</div>
        <form className="login-form" onSubmit={onLogin}>
          <div>
            <div className="label">Email</div>
            <input
              className="input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <div className="label">Пароль</div>
            <input
              className="input"
              type="password"
              placeholder="••••••••"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
            />
          </div>
          <button className="btn primary lg" type="submit">
            Войти
          </button>
          {err && <div style={{ color: "var(--danger)" }}>{err}</div>}
        </form>
        <div className="login-foot">
          <span>Нет аккаунта? Создай в Supabase → Users</span>
        </div>
      </div>
    </div>
  );
}
