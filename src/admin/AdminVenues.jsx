import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import "./admin.css";

export default function AdminVenues() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");

  const load = async () => {
    let query = supabase
      .from("venues")
      .select("*")
      .order("updated_at", { ascending: false });
    if (q) query = query.ilike("title", `%${q}%`);
    const { data } = await query;
    setRows(data || []);
  };

  useEffect(() => {
    load();
  }, []);
  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [q]);

  const togglePublish = async (v) => {
    await supabase
      .from("venues")
      .update({ is_published: !v.is_published })
      .eq("id", v.id);
    load();
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="panel-title">Площадки</div>
        <div className="right actions">
          <input
            className="input"
            style={{ minWidth: 260 }}
            placeholder="Поиск по названию"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <Link to="/admin/venues/new" className="btn primary">
            + Добавить
          </Link>
        </div>
      </div>
      <div className="panel-body">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Тип</th>
              <th>Название</th>
              <th>Опубликован</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((v) => (
              <tr key={v.id}>
                <td>{v.id}</td>
                <td>
                  <span className="badge gray">{v.type}</span>
                </td>
                <td>{v.title}</td>
                <td>
                  <button
                    className={`btn sm ${v.is_published ? "success" : "ghost"}`}
                    onClick={() => togglePublish(v)}
                  >
                    {v.is_published ? "Да" : "Нет"}
                  </button>
                </td>
                <td className="actions">
                  <Link to={`/admin/venues/${v.id}`} className="btn sm">
                    Редактировать
                  </Link>
                  <a
                    href={`/venue/${v.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn sm"
                  >
                    Открыть
                  </a>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  style={{ color: "var(--muted)", padding: "20px 10px" }}
                >
                  Пока пусто. Нажми “Добавить”.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
