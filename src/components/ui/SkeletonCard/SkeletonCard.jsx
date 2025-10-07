import React from "react";
import s from "./SkeletonCard.module.css";

export default function SkeletonCard({ rows = 2 }) {
  return (
    <div className={s.card} aria-hidden="true">
      <div className={s.thumb} />
      <div className={s.text}>
        <div className={s.line} />
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className={`${s.line} ${s.dim}`} />
        ))}
      </div>
    </div>
  );
}
