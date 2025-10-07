// src/VenueGallery/AuroraVenue.jsx
import React, {
  useMemo,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import s from "./AuroraVenue.module.css";
import MyButton from "../MyButton/MyButton";
import FullPageLoader from "/src/components/UI/FullPageLoader/FullPageLoader";

/**
 * Пропсы:
 * - hero: string
 * - media: [{type:"image",src,alt?} | {type:"video",poster?,sources:[{src,type?}]} | {type:"video",src,poster?}]
 * - venue: { name, rating?, reviews?, categories?, priceLevel?, openNow?, hours?, phone?, address?, mapLink?, description? }
 * - onShare?, onBook?, showShare=true, showBook=false
 */
export default function AuroraVenueMedia({
  venue = {},
  media = [],
  hero = "",
  onShare = () => {},
  onBook = () => {},
  showShare = true,
  showBook = false,
}) {
  const {
    name = "",
    rating,
    reviews,
    categories = [],
    priceLevel,
    openNow,
    hours,
    phone,
    address,
    mapLink,
    description,
  } = venue;

  // === нормализация медиа ===
  const items = useMemo(() => {
    return (media || []).filter(Boolean).map((m) => {
      if (m.type === "video") {
        const sources =
          Array.isArray(m.sources) && m.sources.length
            ? m.sources
            : m.src
            ? [{ src: m.src, type: "video/mp4" }]
            : [];
        return {
          type: "video",
          poster: m.poster || "",
          alt: m.alt || "",
          sources,
        };
      }
      return { type: "image", src: m.src, alt: m.alt || "" };
    });
  }, [media]);

  // === ЛОАДЕР: ждём одну первую превью (src/poster) ===
  // Стабильный ключ только по URL превью (не по всему items)
  const previewUrl = useMemo(() => {
    const cand =
      items
        .slice(0, 5)
        .find((it) => (it.type === "image" ? !!it.src : !!it.poster)) || null;
    return cand ? (cand.type === "image" ? cand.src : cand.poster) : "";
  }, [items]);

  const [previewReady, setPreviewReady] = useState(false);

  // ЗАМЕНИ этот useEffect, который управляет previewReady:

  // Мини-лоадер: минимум 0.5 c, авто-снятие через 2 c на всякий случай
  useEffect(() => {
    const MIN_SHOW_MS = 500; // ← полсекунды
    const HARD_CAP_MS = 2000; // ← форс-скрытие, если превью не загрузится

    // нет превью — просто показываем лоадер ровно 0.5 c и выходим
    if (!previewUrl) {
      setPreviewReady(false);
      const t = setTimeout(() => setPreviewReady(true), MIN_SHOW_MS);
      return () => clearTimeout(t);
    }

    setPreviewReady(false);

    let done = false;
    const img = new Image();
    const startedAt = Date.now();

    const finish = () => {
      if (done) return;
      done = true;
      const elapsed = Date.now() - startedAt;
      const delay = Math.max(MIN_SHOW_MS - elapsed, 0);
      const t = setTimeout(() => setPreviewReady(true), delay);
      timers.push(t);
    };

    // форс-снятие лоадера, если onload/onerror не пришли
    const hardCap = setTimeout(finish, HARD_CAP_MS);
    const timers = [hardCap];

    img.onload = finish;
    img.onerror = finish;
    img.src = previewUrl;

    return () => {
      done = true;
      timers.forEach(clearTimeout);
    };
  }, [previewUrl]);

  // === лайтбокс и навигация ===
  const [lb, setLb] = useState({ open: false, i: 0 });
  const open = useCallback((i) => setLb({ open: true, i }), []);
  const close = useCallback(() => setLb((x) => ({ ...x, open: false })), []);
  const prev = useCallback(
    () => setLb((x) => ({ ...x, i: (x.i - 1 + items.length) % items.length })),
    [items.length]
  );
  const next = useCallback(
    () => setLb((x) => ({ ...x, i: (x.i + 1) % items.length })),
    [items.length]
  );

  // клавиатура
  useEffect(() => {
    if (!lb.open) return;
    const onKey = (e) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lb.open, close, prev, next]);

  // автопауза/автоплей видео
  const videoRef = useRef(null);
  useEffect(() => {
    if (!lb.open) return;
    const cur = items[lb.i];

    if (cur?.type !== "video" && videoRef.current) {
      videoRef.current.pause();
    }

    if (cur?.type === "video") {
      requestAnimationFrame(() => {
        const el = videoRef.current;
        if (!el) return;
        const p = el.play?.();
        if (p && p.catch) {
          p.catch(() => {
            el.muted = true;
            el.play?.().catch(() => {});
          });
        }
      });
    }
  }, [lb.i, lb.open, items]);

  // свайп
  const swipe = useRef({ x0: 0, x: 0 });
  const SWIPE_THR = 50;
  const onTouchStart = (e) => {
    const t = e.touches?.[0];
    if (!t) return;
    swipe.current.x0 = t.clientX;
    swipe.current.x = t.clientX;
  };
  const onTouchMove = (e) => {
    const t = e.touches?.[0];
    if (!t) return;
    swipe.current.x = t.clientX;
  };
  const onTouchEnd = () => {
    const dx = swipe.current.x - swipe.current.x0;
    if (Math.abs(dx) > SWIPE_THR) {
      if (dx < 0) next();
      else prev();
    }
    swipe.current.x0 = 0;
    swipe.current.x = 0;
  };

  const cleanTel = (val) => {
    if (!val) return "";
    const v = String(val).replace(/\s+/g, "");
    return v.startsWith("tel:") ? v : `tel:${v}`;
  };

  return (
    <>
      {!previewReady && <FullPageLoader title="Подгружаем медиа…" />}

      <section className={s.wrap} aria-busy={!previewReady}>
        {/* Aurora фон */}
        <div className={s.aurora} aria-hidden />

        {/* Hero (опционально)
        {hero && <img src={hero} alt="" />} */}
        <div className={s.hero}>
          <div className={s.titleBlock}>
            <h1 className={s.title}>{name}</h1>

            <div className={s.metaRow}>
              {typeof rating === "number" && (
                <>
                  <Rating value={rating} />
                  <span className={s.rateVal}>
                    {rating.toFixed ? rating.toFixed(1) : rating}
                  </span>
                </>
              )}
              {typeof reviews === "number" && (
                <span className={s.muted}>({reviews})</span>
              )}
              {categories?.length > 0 && (
                <span className={s.muted}>{categories.join(" · ")}</span>
              )}
              {typeof openNow === "boolean" && (
                <span className={`${s.badge} ${openNow ? s.open : s.closed}`}>
                  {openNow ? "Проверено" : "Закрыто"}
                </span>
              )}
              {priceLevel && <span className={s.price}>{priceLevel}</span>}
            </div>

            {description && <p className={s.desc}>{description}</p>}

            {(showShare || showBook) && (
              <div className={s.ctaRow}>
                {showShare && (
                  <MyButton size="medium" color="green" onClick={onShare}>
                    Поделиться
                  </MyButton>
                )}
                {showBook && (
                  <MyButton size="medium" color="primary" onClick={onBook}>
                    Забронировать
                  </MyButton>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Инфо */}
        <div className={s.infoGrid}>
          {hours && <Info icon="clock" label="Часы" value={hours} />}

          {(address || mapLink) && (
            <Info
              icon="pin"
              label="Адрес"
              value={
                <div className={s.addrRow}>
                  <span className={s.addrText}>
                    <span className={s.addrIcon}>📍</span>
                    {mapLink ? (
                      <a href={mapLink} target="_blank" rel="noreferrer">
                        {address || "Открыть карту"}
                      </a>
                    ) : (
                      address || "—"
                    )}
                  </span>
                </div>
              }
            />
          )}

          {phone && (
            <Info
              icon="phone"
              label="Телефон"
              value={<a href={cleanTel(phone)}>{phone}</a>}
            />
          )}
        </div>

        {/* Bento-коллаж */}
        <div className={s.bento}>
          <div className={s.bentoGrid}>
            {items[0] && (
              <Tile
                item={items[0]}
                className={`${s.bentoItem} ${s.bentoHero}`}
                onClick={() => open(0)}
              />
            )}
            {items[1] && (
              <Tile
                item={items[1]}
                className={`${s.bentoItem} ${s.bentoA}`}
                onClick={() => open(1)}
              />
            )}
            {items[2] && (
              <Tile
                item={items[2]}
                className={`${s.bentoItem} ${s.bentoB}`}
                onClick={() => open(2)}
              />
            )}
            {items[3] && (
              <Tile
                item={items[3]}
                className={`${s.bentoItem} ${s.bentoC}`}
                onClick={() => open(3)}
              />
            )}
            {items[4] && (
              <Tile
                item={items[4]}
                className={`${s.bentoItem} ${s.bentoD}`}
                onClick={() => open(4)}
              />
            )}
          </div>

          {/* Mobile filmstrip */}
          <div className={s.filmstripWrap}>
            <div className={s.filmstrip} role="list">
              {items.slice(0, 12).map((it, i) => (
                <button
                  key={i}
                  className={s.filmItem}
                  onClick={() => open(i)}
                  role="listitem"
                  aria-label={`Медиа ${i + 1}`}
                >
                  {it.type === "image" ? (
                    <img
                      src={it.src}
                      alt={it.alt || `Фото ${i + 1}`}
                      loading="lazy"
                    />
                  ) : (
                    <div className={s.videoThumb}>
                      {it.poster ? (
                        <img src={it.poster} alt="" />
                      ) : (
                        <div className={s.noPoster} />
                      )}
                      <span className={s.playBadge}>▶</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
            <div className={s.edgeFade} aria-hidden />
          </div>
        </div>

        {/* Лайтбокс */}
        {lb.open && items.length > 0 && (
          <div className={s.lb} role="dialog" aria-modal="true">
            <div className={s.lbGlass} onClick={close} />
            <img style={{ display: "none" }} alt="" />
            <button
              className={`${s.nav} ${s.prev}`}
              onClick={prev}
              aria-label="Назад"
            >
              ‹
            </button>
            <button
              className={`${s.nav} ${s.next}`}
              onClick={next}
              aria-label="Вперёд"
            >
              ›
            </button>
            <button className={s.close} onClick={close} aria-label="Закрыть">
              ✕
            </button>

            <div
              className={s.stage}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {items[lb.i].type === "image" ? (
                <img
                  className={s.lbImg}
                  src={items[lb.i].src}
                  alt={items[lb.i].alt || "Фото"}
                />
              ) : (
                <video
                  key={items[lb.i].sources?.[0]?.src || lb.i}
                  className={s.lbVid}
                  ref={videoRef}
                  controls
                  playsInline
                  autoPlay
                  preload="metadata"
                  poster={items[lb.i].poster}
                >
                  {items[lb.i].sources.map((srcObj, idx) => (
                    <source
                      key={idx}
                      src={srcObj.src}
                      type={srcObj.type || "video/mp4"}
                    />
                  ))}
                  Ваш браузер не поддерживает видео.
                </video>
              )}
            </div>

            <div className={s.thumbRow}>
              {items.map((it, i) => (
                <button
                  key={i}
                  className={`${s.thumb} ${i === lb.i ? s.active : ""}`}
                  onClick={() => setLb({ open: true, i })}
                  aria-label={`Открыть ${
                    it.type === "video" ? "видео" : "фото"
                  } ${i + 1}`}
                >
                  {it.type === "image" ? (
                    <img src={it.src} alt="" />
                  ) : (
                    <div className={s.thumbVideo}>
                      {it.poster ? (
                        <img src={it.poster} alt="" />
                      ) : (
                        <div className={s.noPoster} />
                      )}
                      <span className={s.playDot} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  );
}

/* ===== вспомогалки ===== */

export function normalizeMedia(media = []) {
  return media.filter(Boolean).map((m) => {
    if (m.type === "video") {
      const sources =
        Array.isArray(m.sources) && m.sources.length
          ? m.sources
          : m.src
          ? [{ src: m.src, type: "video/mp4" }]
          : [];
      return {
        type: "video",
        poster: m.poster || "",
        alt: m.alt || "",
        sources,
      };
    }
    return { type: "image", src: m.src, alt: m.alt || "" };
  });
}

function Tile({ item, className, onClick }) {
  if (item.type === "image") {
    return (
      <button className={className} onClick={onClick} aria-label="Фото">
        <img src={item.src} alt={item.alt || "Фото"} loading="lazy" />
      </button>
    );
  }
  return (
    <button
      className={`${className} ${s.hasPlay}`}
      onClick={onClick}
      aria-label="Видео"
    >
      {item.poster ? (
        <img src={item.poster} alt="Видео" loading="lazy" />
      ) : (
        <div className={s.noPoster} />
      )}
      <span className={s.playBadge}>▶</span>
    </button>
  );
}

function Rating({ value = 0 }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <span className={s.stars} aria-label={`Рейтинг ${value} из 5`}>
      {Array.from({ length: 5 }).map((_, i) => {
        if (i < full) return <span key={i}>★</span>;
        if (i === full && half) return <span key={i}>☆</span>;
        return <span key={i}>☆</span>;
      })}
    </span>
  );
}

function Info({ icon, label, value }) {
  return (
    <div className={s.infoCard}>
      <div className={s.icn} aria-hidden>
        {iconPath(icon)}
      </div>
      <div className={s.infoText}>
        <div className={s.infoLabel}>{label}</div>
        <div className={s.infoValue}>{value}</div>
      </div>
    </div>
  );
}

function iconPath(name) {
  const paths = {
    clock: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 11H7v-2h4V6h2v7Z",
    pin: "M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7Zm0 9a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z",
    phone:
      "M6 2h3l2 5-2 1a12 12 0 0 0 5 5l1-2 5 2v3a2 2 0 0 1-2 2 16 16 0 0 1-15-15 2 2 0 0 1 2-2Z",
    share:
      "M4 12a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm16-8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM8 14l8-4M8 18l8 4",
  };
  return (
    <svg viewBox="0 0 24 24">
      <path d={paths[name] || ""} />
    </svg>
  );
}
