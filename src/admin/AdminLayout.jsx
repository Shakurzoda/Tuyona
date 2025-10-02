import React, { useEffect, useState } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";
import { supabase } from "../lib/supabaseClient";
import "./admin.css";

export default function AdminLayout() {
  const { session, loading } = useAuth();
  const nav = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const check = async () => {
      if (!session) return;
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .maybeSingle();
      setIsAdmin(data?.role === "admin");
      if (data?.role !== "admin") nav("/admin/login");
    };
    check();
  }, [session, nav]);

  if (loading) return <div className="admin-main">Загрузка…</div>;
  if (!session)
    return (
      <div className="admin-main">
        Нет сессии. <a href="/admin/login">Войти</a>
      </div>
    );
  if (!isAdmin) return <div className="admin-main">Нет прав.</div>;

  return (
    <div className="admin-shell">
      <aside className="admin-aside">
        <div className="brand">Админка</div>
        <nav className="nav">
          <Link to="/admin">Площадки</Link>
          <Link to="/admin/venues/new">+ Добавить</Link>
          <span className="spacer" />
          <button
            className="btn"
            onClick={() =>
              supabase.auth
                .signOut()
                .then(() => (window.location.href = "/admin/login"))
            }
          >
            Выйти
          </button>
        </nav>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
