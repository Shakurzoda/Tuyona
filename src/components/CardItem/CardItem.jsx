// src/components/CardItem/CardItem.jsx
import React from "react";
import { Link } from "react-router-dom";
import s from "./CardItem.module.css";

const EXCERPT_MAX = 166;

function toPlain(text = "") {
  const str = typeof text === "string" ? text : String(text || "");
  return str
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function excerpt(text = "", max = EXCERPT_MAX) {
  const p = toPlain(text);
  if (p.length <= max) return p;
  const cut = p.slice(0, max + 1);
  const safe = cut.slice(0, Math.max(0, cut.lastIndexOf(" ")));
  return (safe || p.slice(0, max)).trim() + "…";
}

// Канонический билд URL для карточки
function buildHref(item) {
  if (!item) return "#";

  // 1) если уже есть готовый href — просто используем его
  if (item.href) return item.href;

  // 2) если есть type + id — строим /aurora/:type/:id
  const type = item.type;
  const id = item.id;

  if (type && id != null) {
    return `/aurora/${encodeURIComponent(type)}/${encodeURIComponent(id)}`;
  }

  // 3) иначе fallback
  return "#";
}

export default function CardItem({ item }) {
  const { img, title, description } = item || {};
  const href = buildHref(item);

  return (
    <article className={s.card}>
      {/* ОВЕРЛЕЙ — кликабельная вся карточка */}
      <Link className={s.linkAll} to={href} aria-label={title || "Открыть"} />

      <div className={s.cover}>
        {img ? (
          <img src={img} alt={title || "img"} loading="lazy" decoding="async" />
        ) : (
          <div className={s.ph} />
        )}
      </div>

      <div className={s.body}>
        <div className={s.title}>{title || "—"}</div>
        <p className={s.desc} title={toPlain(description)}>
          {excerpt(description)}
        </p>
      </div>
    </article>
  );
}
