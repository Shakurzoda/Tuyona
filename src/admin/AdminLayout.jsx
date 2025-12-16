// src/admin/AdminLayout.jsx
import React from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
// если у тебя раньше было только Outlet или Link – просто допиши NavLink

import "./admin.css";

export default function AdminLayout() {
    const nav = useNavigate();

    return (
      <div className="admin-shell">
        <aside className="admin-sidebar">
          <div className="logo">Админка</div>
          <nav className="menu">
            <Link to="/admin" className="menu-item">
              Площадки
            </Link>
            <Link to="/admin/venues/new" className="menu-item">
              Новая площадка
            </Link>
            <NavLink to="/admin/categories">Категории</NavLink>
          </nav>
          <div className="grow" />
          <button className="btn ghost" onClick={() => nav("/")}>
            На сайт
          </button>
        </aside>

        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    );
}
