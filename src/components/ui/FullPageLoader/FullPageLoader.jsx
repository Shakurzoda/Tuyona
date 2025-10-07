// легкий оверлей-прелоадер, если не нужен — просто вернет null при hidden
import React from "react";
import s from "./FullPageLoader.module.css";

export default function FullPageLoader({
  title = "Загрузка…",
  hidden = false,
}) {
  if (hidden) return null;
  return (
    <div
      className={s.overlay}
      role="status"
      aria-live="polite"
      aria-label={title}
    >
      <div className={s.card}>
        <div className={s.spinner} aria-hidden />
        <div className={s.text}>{title}</div>
      </div>
    </div>
  );
}
