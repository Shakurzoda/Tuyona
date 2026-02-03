// src/admin/AdminCategories.jsx
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import "./admin.css";

const CATEGORY_LABELS = {
  all: "Все категории",
  restaurants: "Рестораны",
  musicians: "Музыканты",
  cars: "Машины",
  decoration: "Оформление",
  presenters: "Ведущие",
  photographers: "Фотографы",
  singers: "Певцы",
  beautysalons: "Свадебные салоны",
};

const normalizeSlug = (s = "") => s.toString().trim().toLowerCase();

export default function AdminCategories() {
  const [rows, setRows] = useState([]);
  const [draft, setDraft] = useState({}); // slug -> is_visible
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancel = false;

    (async () => {
      setLoading(true);
      setErr("");
      try {
        const { data, error } = await supabase
          .from("category_visibility")
          .select("id, slug, title, is_visible")
          .order("slug", { ascending: true });

        if (error) throw error;

        const safe = (data || []).map((r) => ({
          ...r,
          slug: normalizeSlug(r.slug),
        }));

        if (cancel) return;

        setRows(safe);
        const map = {};
        safe.forEach((r) => (map[r.slug] = !!r.is_visible));
        setDraft(map);
        setDirty(false);
      } catch (e) {
        if (!cancel) setErr(e?.message || "Ошибка загрузки");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();

    return () => {
      cancel = true;
    };
  }, []);

  const list = useMemo(() => {
    return rows.map((r) => {
      const slug = normalizeSlug(r.slug);
      const title = r.title || CATEGORY_LABELS[slug] || slug;
      const isVisible = draft[slug] ?? !!r.is_visible;
      return { ...r, slug, title, isVisible };
    });
  }, [rows, draft]);

  const toggle = (slug) => {
    setDraft((d) => {
      const next = { ...d, [slug]: !d[slug] };
      return next;
    });
    setDirty(true);
  };

const save = async () => {
  setSaving(true);
  setErr("");

  try {
    const updates = list
      .filter((r) => !!r.is_visible !== !!r.isVisible)
      .map((r) => ({
        slug: r.slug, // ОБЯЗАТЕЛЬНО
        title: r.title || null, // можно оставить
        is_visible: !!r.isVisible,
      }))
      .filter((x) => x.slug); // защита от null/undefined

    if (!updates.length) {
      setDirty(false);
      return;
    }

    const { error } = await supabase
      .from("category_visibility")
      .upsert(updates, { onConflict: "slug" }); // <-- ВАЖНО

    if (error) throw error;

    // обновим локально rows
    setRows((prev) =>
      prev.map((r) => {
        const slug = normalizeSlug(r.slug);
        const d = draft[slug];
        return typeof d === "boolean" ? { ...r, is_visible: d } : r;
      })
    );

    setDirty(false);
  } catch (e) {
    setErr(e?.message || "Ошибка сохранения");
  } finally {
    setSaving(false);
  }
};


  const reset = () => {
    const map = {};
    rows.forEach((r) => (map[normalizeSlug(r.slug)] = !!r.is_visible));
    setDraft(map);
    setDirty(false);
  };

  return (
    <div className="panel">
      <div
        className="panel-header"
        style={{ display: "flex", alignItems: "center", gap: 12 }}
      >
        <div className="panel-title">Категории — видимость</div>

        <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
          <button
            className="admin-btn admin-btn--ghost"
            onClick={reset}
            disabled={!dirty || saving}
          >
            Отменить
          </button>
          <button
            className="admin-btn"
            onClick={save}
            disabled={!dirty || saving}
          >
            {saving ? "Сохраняю…" : "Сохранить"}
          </button>
        </div>
      </div>

      <div className="panel-body">
        {err && (
          <div
            style={{
              marginBottom: 10,
              padding: 10,
              borderRadius: 12,
              border: "1px solid rgba(220,53,69,.25)",
              background: "rgba(220,53,69,.06)",
              color: "#b42318",
            }}
          >
            {err}
          </div>
        )}

        {loading ? (
          <div style={{ padding: 14 }}>Загрузка…</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              className="admin-table"
              style={{ width: "100%", borderCollapse: "collapse" }}
            >
              <thead>
                <tr style={{ textAlign: "left" }}>
                  <th style={{ padding: "10px 12px" }}>Название</th>
                  <th style={{ padding: "10px 12px" }}>Slug</th>
                  <th style={{ padding: "10px 12px" }}>Показывать</th>
                </tr>
              </thead>
              <tbody>
                {list.map((r) => (
                  <tr
                    key={r.id}
                    style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
                  >
                    <td style={{ padding: "12px" }}>{r.title}</td>
                    <td style={{ padding: "12px", color: "rgba(0,0,0,0.55)" }}>
                      {r.slug}
                    </td>
                    <td style={{ padding: "12px" }}>
                      <button
                        type="button"
                        className={`admin-toggle ${r.isVisible ? "is-on" : ""}`}
                        onClick={() => toggle(r.slug)}
                        aria-pressed={r.isVisible}
                      >
                        <span className="admin-toggle__knob" />
                        <span className="admin-toggle__text">
                          {r.isVisible ? "Вкл" : "Выкл"}
                        </span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {dirty && (
              <div
                style={{
                  marginTop: 10,
                  color: "rgba(0,0,0,0.6)",
                  fontSize: 13,
                }}
              >
                Есть несохранённые изменения.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
