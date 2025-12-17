// src/admin/AdminLayout.jsx
import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import "./admin.css";

export default function AdminLayout() {
  const nav = useNavigate();

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      nav("/admin/login");
    }
  };

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <div className="admin-topbar__inner">
          <div
            className="admin-brand"
            onClick={() => nav("/admin")}
            role="button"
            tabIndex={0}
          >
            <div className="admin-brand__title">Админка</div>
            <div className="admin-brand__subtitle">Tuyona</div>
          </div>

          <nav className="admin-nav">
            <NavLink
              to="/admin"
              end
              className={({ isActive }) =>
                `admin-link ${isActive ? "is-active" : ""}`
              }
            >
              Площадки
            </NavLink>

            <NavLink
              to="/admin/venues/new"
              className={({ isActive }) =>
                `admin-link ${isActive ? "is-active" : ""}`
              }
            >
              Новая площадка
            </NavLink>

            <NavLink
              to="/admin/categories"
              className={({ isActive }) =>
                `admin-link ${isActive ? "is-active" : ""}`
              }
            >
              Категории
            </NavLink>
          </nav>

          <div className="admin-actions">
            <a
              className="admin-btn admin-btn--ghost"
              href="/"
              target="_blank"
              rel="noreferrer"
            >
              На сайт
            </a>
            <button className="admin-btn admin-btn--danger" onClick={logout}>
              Выйти
            </button>
          </div>
        </div>
      </header>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
