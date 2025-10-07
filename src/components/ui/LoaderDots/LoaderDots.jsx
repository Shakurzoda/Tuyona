import React from "react";
import s from "./LoaderDots.module.css";

export default function LoaderDots({ label = "Загружаем…" }) {
  return (
    <div className={s.wrap} role="status" aria-live="polite">
      <div className={s.dots}>
        <i />
        <i />
        <i />
      </div>
      {label && <div className={s.label}>{label}</div>}
    </div>
  );
}
