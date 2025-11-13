// src/admin/AdminLayout.jsx
import React from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import "./admin.css";

export default function AdminLayout() {
    const nav = useNavigate();

    return (
        <div className="admin-shell">
            <aside className="admin-sidebar">
                <div className="logo">Админка</div>
                <nav className="menu">
                    <Link to="/admin" className="menu-item">Площадки</Link>
                    <Link to="/admin/venues/new" className="menu-item">Новая площадка</Link>
                </nav>
                <div className="grow" />
                <button className="btn ghost" onClick={() => nav("/")}>На сайт</button>
            </aside>

            <main className="admin-main">
                <Outlet />
            </main>
        </div>
    );
}
