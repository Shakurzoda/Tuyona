import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function NotFound() {
    const loc = useLocation();

    return (
        <section style={styles.wrap}>
            <div style={styles.card}>
                <div style={styles.emoji}>🧭</div>
                <h1 style={styles.title}>Страница не найдена (404)</h1>
                <p style={styles.text}>
                    Мы не нашли страницу <code style={styles.code}>{loc.pathname}</code>.
                    Возможно, вы перешли по устаревшей ссылке.
                </p>
                <div style={styles.actions}>
                    <Link to="/" style={styles.btn}>
                        На главную
                    </Link>
                    <Link to="/category" style={{ ...styles.btn, ...styles.btnLight }}>
                        Категории
                    </Link>
                </div>
            </div>
        </section>
    );
}

const styles = {
    wrap: {
        minHeight: "60vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        background: "var(--page-bg, #fafafa)",
    },
    card: {
        width: "100%",
        maxWidth: 640,
        background: "#fff",
        borderRadius: 16,
        boxShadow:
            "0 1px 2px rgba(0,0,0,.06), 0 8px 32px rgba(0,0,0,.08)",
        padding: 24,
        textAlign: "center",
    },
    emoji: { fontSize: 42, marginBottom: 8 },
    title: { margin: "4px 0 8px", fontSize: 26 },
    text: { margin: "0 0 16px", color: "#555" },
    code: {
        background: "#f7f7f8",
        padding: "2px 6px",
        borderRadius: 6,
        border: "1px solid #eee",
    },
    actions: { display: "flex", gap: 12, justifyContent: "center" },
    btn: {
        background: "#0ea5e9",
        color: "#fff",
        padding: "10px 14px",
        borderRadius: 10,
        textDecoration: "none",
        fontWeight: 600,
    },
    btnLight: {
        background: "#f1f5f9",
        color: "#0f172a",
    },
};
