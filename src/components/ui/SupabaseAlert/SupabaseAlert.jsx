// src/components/UI/SupabaseAlert.jsx
export default function SupabaseAlert({ className = "" }) {
    return (
        <div
            className={className}
            style={{
                padding: "12px 16px",
                background: "#fff4e5",
                border: "1px solid #ffd8a8",
                color: "#8b5e00",
                borderRadius: 8,
                margin: "12px 0",
            }}
        >
            Supabase не сконфигурирован. Проверьте переменные окружения
            <code style={{ margin: "0 6px" }}>VITE_SUPABASE_URL</code> и
            <code style={{ margin: "0 6px" }}>VITE_SUPABASE_ANON_KEY</code> в Vercel.
        </div>
    );
}
