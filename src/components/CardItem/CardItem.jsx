import React from "react";
import s from "./CardItem.module.css";

const EXCERPT_MAX = 166;

function toPlain(text = "") {
    const str = typeof text === "string" ? text : String(text || "");
    return str.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}
function excerpt(text = "", max = EXCERPT_MAX) {
    const p = toPlain(text);
    if (p.length <= max) return p;
    const cut = p.slice(0, max + 1);
    const safe = cut.slice(0, Math.max(0, cut.lastIndexOf(" ")));
    return (safe || p.slice(0, max)).trim() + "…";
}

export default function CardItem({ item }) {
    const { img, title, description, href = "#" } = item || {};

    return (
        <article className={s.card}>
            {/* ОВЕРЛЕЙ — делает кликабельной всю карту */}
            <a className={s.linkAll} href={href} aria-label={title || "Открыть"} />

            <div className={s.cover}>
                {img ? <img src={img} alt={title || "img"} loading="lazy" /> : <div className={s.ph} />}
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
