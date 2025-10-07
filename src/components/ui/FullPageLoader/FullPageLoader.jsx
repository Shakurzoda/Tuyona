import React from "react";
import s from "./FullPageLoader.module.css";

export default function FullPageLoader({ title = "Загружаем страницу…" }) {
  return (
    <div className={s.overlay} role="status" aria-live="polite">
      <div className={s.card}>
        <div className={s.spinner} />
        <div className={s.title}>{title}</div>
      </div>
    </div>
  );
}
