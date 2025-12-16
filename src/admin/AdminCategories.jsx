// src/admin/AdminCategories.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "./useAuth";
import { CategoryVariables } from "../components/Category/CategoryVariables";
import "./admin.css";

const toSlug = (s = "") =>
  s.toString().trim().toLowerCase().replace(/\s+/g, "-").replace(/-{2,}/g, "-");

// все категории из конфига + их slug
const ALL_CATEGORIES = CategoryVariables.map((c) => ({
  ...c,
  slug: toSlug(c.directionName),
}));

export default function AdminCategories() {
  const { session } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("category_visibility")
          .select("slug,is_visible");

        if (error) throw error;

        const map = new Map();
        (data || []).forEach((row) => {
          map.set(row.slug, row.is_visible !== false); // по умолчанию true
        });

        const merged = ALL_CATEGORIES.map((c) => ({
          ...c,
          is_visible: map.has(c.slug) ? map.get(c.slug) : true,
        }));

        if (!cancelled) setRows(merged);
      } catch (e) {
        if (!cancelled) setError(e.message || "Ошибка загрузки");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleVisibility = async (slug, nextVisible) => {
    // оптимистичное обновление UI
    setRows((prev) =>
      prev.map((row) =>
        row.slug === slug ? { ...row, is_visible: nextVisible } : row
      )
    );

    const { error } = await supabase
      .from("category_visibility")
      .upsert({ slug, is_visible: nextVisible }, { onConflict: "slug" });

    if (error) {
      console.error(error);
      alert(error.message);
    }
  };

  if (!session) {
    return (
      <div className="panel">
        <div className="panel-body">Нужно войти в админку.</div>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="panel-title">Категории — видимость</div>
      </div>

      <div className="panel-body">
        {error && <div className="error">{error}</div>}

        {loading ? (
          <p>Загрузка…</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Название</th>
                <th>Slug</th>
                <th>Показывать</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.slug}>
                  <td>{row.directionName}</td>
                  <td>
                    <code>{row.slug}</code>
                  </td>
                  <td>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={row.is_visible}
                        onChange={(e) =>
                          toggleVisibility(row.slug, e.target.checked)
                        }
                      />
                      <span style={{ marginLeft: 8 }}>Вкл</span>
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
