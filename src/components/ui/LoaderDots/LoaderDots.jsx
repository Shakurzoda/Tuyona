import React from "react";
import s from "./LoaderDots.module.css";

export default function LoaderDots({
  size = 8,
  color = "#111827",
  className = "",
}) {
  const style = { width: size, height: size, backgroundColor: color };
  return (
    <span className={`${s.dots} ${className}`} aria-hidden="true">
      <i style={style} />
      <i style={style} />
      <i style={style} />
    </span>
  );
}
