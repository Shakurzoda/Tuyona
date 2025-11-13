import React from "react";
import { Link } from "react-router-dom";

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        // Можно отправить в аналитику/логгер
        console.error("[ErrorBoundary] Caught error:", error, info);
    }

    componentDidUpdate(prevProps) {
        // Сбрасываем состояние при смене resetKey (например, при смене маршрута)
        if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
            this.setState({ hasError: false, error: null });
        }
    }

    render() {
        if (!this.state.hasError) return this.props.children;

        const errMsg =
            (this.state.error && (this.state.error.message || String(this.state.error))) ||
            "Что-то пошло не так.";

        return (
            <div style={styles.wrap}>
                <div style={styles.card}>
                    <div style={styles.emoji}>🛟</div>
                    <h1 style={styles.title}>Ой! Непредвиденная ошибка</h1>
                    <p style={styles.text}>
                        Мы уже знаем об этом. Попробуйте обновить страницу или вернуться на главную.
                    </p>

                    <details style={styles.details}>
                        <summary style={styles.summary}>Показать детали</summary>
                        <pre style={styles.pre}>{errMsg}</pre>
                    </details>

                    <div style={styles.actions}>
                        <button style={styles.btn} onClick={() => window.location.reload()}>
                            Обновить страницу
                        </button>
                        <Link to="/" style={{ ...styles.btn, ...styles.btnLight }}>
                            На главную
                        </Link>
                    </div>
                </div>
            </div>
        );
    }
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
    emoji: { fontSize: 40, marginBottom: 8 },
    title: { margin: "4px 0 8px", fontSize: 24 },
    text: { margin: "0 0 16px", color: "#555" },
    details: { textAlign: "left", margin: "8px 0 16px" },
    summary: { cursor: "pointer", color: "#333", marginBottom: 8 },
    pre: {
        whiteSpace: "pre-wrap",
        background: "#f7f7f8",
        padding: 12,
        borderRadius: 8,
        border: "1px solid #eee",
        fontSize: 12,
        color: "#444",
    },
    actions: { display: "flex", gap: 12, justifyContent: "center" },
    btn: {
        appearance: "none",
        border: "none",
        background: "#16a34a",
        color: "#fff",
        padding: "10px 14px",
        borderRadius: 10,
        cursor: "pointer",
        fontWeight: 600,
    },
    btnLight: {
        background: "#f1f5f9",
        color: "#0f172a",
        textDecoration: "none",
    },
};
