import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import "./admin.css";

/* ===== типы площадок (единые ключи) ===== */
const VENUE_TYPES = [
  { value: "all", label: "Все типы" },
  { value: "restaurant", label: "Рестораны" },
  { value: "musician", label: "Музыканты" },
  { value: "car", label: "Авто" },
  { value: "decoration", label: "Оформление" },
  { value: "presenter", label: "Ведущие" },
  { value: "photographer", label: "Фотографы" },
  { value: "singer", label: "Певцы" },
  { value: "beautysalon", label: "Свадебные салоны" },
];

function formatType(v) {
    return VENUE_TYPES.find((t) => t.value === v)?.label || v || "—";
}

export default function AdminVenues() {
    const nav = useNavigate();

    // ---- фильтры и состояние списка ----
    const [type, setType] = useState("all");
    const [onlyPublished, setOnlyPublished] = useState(false);
    const [search, setSearch] = useState("");

    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);

    // ---- пагинация/сортировка ----
    const [page, setPage] = useState(1);
    const [perPage] = useState(20); // можно 10/25/50
    const [total, setTotal] = useState(0);
    const [sortDir, setSortDir] = useState("desc"); // 'desc' | 'asc'

    // сбрасываем на первую страницу, если изменились фильтры
    useEffect(() => {
        setPage(1);
    }, [type, onlyPublished, search]);

    useEffect(() => {
        loadRows();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [type, onlyPublished, search, page, sortDir]);

    async function loadRows() {
        try {
            setLoading(true);

            // базовый запрос
            let q = supabase
                .from("venues")
                .select("*", { count: "exact" })
                .order("created_at", { ascending: sortDir === "asc" });

            // фильтр по типу
            if (type && type !== "all") {
                q = q.eq("type", type);
            }

            // «только опубликованные»
            if (onlyPublished) {
                q = q.eq("is_published", true);
            }

            // поиск по названию/адресу/телефону + числовой id
            const s = search.trim();
            if (s) {
                const asNum = Number(s);
                if (Number.isFinite(asNum)) {
                    q = q.or(
                        `id.eq.${asNum},title.ilike.%${s}%,address.ilike.%${s}%,phone.ilike.%${s}%`
                    );
                } else {
                    q = q.or(
                        `title.ilike.%${s}%,address.ilike.%${s}%,phone.ilike.%${s}%`
                    );
                }
            }

            // пагинация
            const from = (page - 1) * perPage;
            const to = from + perPage - 1;
            q = q.range(from, to);

            const { data, error, count } = await q;
            if (error) throw error;

            setRows(data || []);
            setTotal(count || 0);
        } catch (e) {
            console.error(e);
            setRows([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    }

    // удаление площадки (вместе с медиа/соцсетями)
    async function handleDelete(id) {
        if (!id) return;
        if (!window.confirm("Удалить площадку и связанное медиа?")) return;

        try {
            // удаляем связанные таблицы
            await supabase.from("venue_media").delete().eq("venue_id", id);
            await supabase.from("venue_socials").delete().eq("venue_id", id);
            // удаляем саму площадку
            const { error } = await supabase.from("venues").delete().eq("id", id);
            if (error) throw error;

            // обновляем текущую страницу
            await loadRows();
        } catch (e) {
            console.error(e);
            alert(e.message || "Не удалось удалить");
        }
    }

    const pageInfo = useMemo(() => {
        if (!total) return "Совпадений не найдено";
        const start = Math.min((page - 1) * perPage + 1, total);
        const end = Math.min(page * perPage, total);
        return `Показано ${start}–${end} из ${total}`;
    }, [page, perPage, total]);

    return (
        <div className="admin-shell">
            <div className="admin-header">
                <div className="admin-title">Площадки</div>
                <div className="admin-actions">
                    <button className="btn primary" onClick={() => nav("/admin/venues/new")}>
                        + Новая площадка
                    </button>
                </div>
            </div>

            {/* Фильтры */}
            <div className="filters-row">
                <input
                    className="input"
                    placeholder="Поиск: название, адрес, телефон, ID…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <select
                    className="select"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                >
                    {VENUE_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                            {t.label}
                        </option>
                    ))}
                </select>

                <label className="checkbox">
                    <input
                        type="checkbox"
                        checked={onlyPublished}
                        onChange={(e) => setOnlyPublished(e.target.checked)}
                    />
                    <span>Только опубликованные</span>
                </label>
            </div>

            {/* Таблица */}
            <div className="panel">
                <div className="panel-body">
                    <div className="table">
                        <div className="table-head">
                            <div className="th col-id">ID</div>
                            <div className="th col-title">Название</div>
                            <div className="th col-type">Тип</div>
                            <div className="th col-status">Статус</div>
                            <div className="th col-actions">Действия</div>
                        </div>

                        {loading ? (
                            <div className="table-empty">Загружаем…</div>
                        ) : rows.length === 0 ? (
                            <div className="table-empty">Совпадений не найдено</div>
                        ) : (
                            rows.map((r) => (
                                <div className="tr" key={r.id}>
                                    <div className="td col-id">#{r.id}</div>
                                    <div className="td col-title">{r.title || "—"}</div>
                                    <div className="td col-type">{formatType(r.type)}</div>
                                    <div className="td col-status">
                                        {r.is_published ? (
                                            <span className="badge green">Опубликовано</span>
                                        ) : (
                                            <span className="badge gray">Черновик</span>
                                        )}
                                    </div>
                                    <div className="td col-actions">
                                        <button
                                            className="btn sm"
                                            onClick={() => nav(`/admin/venues/${r.id}`)}
                                        >
                                            Редактировать
                                        </button>
                                        <button
                                            className="btn sm"
                                            onClick={() => {
                                                const t = r.type || "restaurant";
                                                window.open(`/aurora/${t}/${r.id}`, "_blank");
                                            }}
                                        >
                                            Открыть
                                        </button>
                                        <button
                                            className="btn sm danger"
                                            onClick={() => handleDelete(r.id)}
                                        >
                                            Удалить
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Пагинация + сортировка */}
                    <div className="pager">
                        <div className="pager-left">
                            <button
                                className="btn"
                                disabled={page <= 1}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                            >
                                ← Назад
                            </button>
                            <button
                                className="btn"
                                disabled={page * perPage >= total}
                                onClick={() => setPage((p) => p + 1)}
                            >
                                Вперёд →
                            </button>
                            <span className="pager-info">{pageInfo}</span>
                        </div>

                        <div className="pager-right">
                            <label className="switch-inline">
                                <input
                                    type="checkbox"
                                    checked={sortDir === "asc"}
                                    onChange={(e) => setSortDir(e.target.checked ? "asc" : "desc")}
                                />
                                <span>
                  {sortDir === "asc" ? "Сначала старые" : "Сначала новые"}
                </span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
