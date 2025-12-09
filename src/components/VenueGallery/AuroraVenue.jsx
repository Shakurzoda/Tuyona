// src/components/VenueGallery/AuroraVenue.jsx
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import s from "./AuroraVenue.module.css";
import MyButton from "../MyButton/MyButton";
import { sanitizeMediaUrl, isProbablyRenderableUrl } from "@/lib/mediaUrl";
import { normalizeMedia } from "./media";

// ОДИН общий постер для всех видео
const DEFAULT_VIDEO_POSTER =
  "https://mocrevywsynniwhoshtb.supabase.co/storage/v1/object/public/media/drafts/8ba66a22-5296-4e31-be6c-626296547839/posters/Def_Poster.png";

export default function AuroraVenue({
  hero,
  media = [],
  venue = {},
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
    socials = {},
  } = venue;

  /** нормализованная галерея */
  const items = useMemo(() => normalizeMedia(media), [media]);

  /** безопасный hero */
  const derivedHero = useMemo(() => {
    const fromProp = sanitizeMediaUrl(hero || "");
    if (isProbablyRenderableUrl(fromProp)) return fromProp;
    const firstImg = items.find((x) => x.type === "image")?.src || "";
    const safe = sanitizeMediaUrl(firstImg);
    return isProbablyRenderableUrl(safe) ? safe : "";
  }, [hero, items]);

  /** лёгкий лоадер */
  const [booting, setBooting] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 400);
    return () => clearTimeout(t);
  }, []);

  /** лайтбокс */
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

  /** autoplay видео в лайтбоксе */
  const videoRef = useRef(null);
  useEffect(() => {
    if (!lb.open) return;
    const cur = items[lb.i];
    if (cur?.type !== "video" && videoRef.current) {
      try {
        videoRef.current.pause();
      } catch {}
    }
    if (cur?.type === "video") {
      requestAnimationFrame(() => {
        const el = videoRef.current;
        if (!el) return;
        const p = el.play?.();
        if (p?.catch) {
          p.catch(() => {
            el.muted = true;
            el.play?.().catch(() => {});
          });
        }
      });
    }
  }, [lb.i, lb.open, items]);

  /** свайпы */
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
      {booting && (
        <div className={s.loaderOverlay} aria-hidden>
          <div className={s.spinner} />
        </div>
      )}

      <section className={`${s.wrap} ${s.auroraTheme}`}>
        <div className={s.aurora} aria-hidden />

        {/* Шапка */}
        <header className={s.header}>
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

          {derivedHero && (
            <div className={s.heroImgWrap}>
              <img className={s.heroImg} src={derivedHero} alt="" />
            </div>
          )}
        </header>

        {/* Инфо блоки */}
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

          {(socials.instagram ||
            socials.telegram ||
            socials.whatsapp ||
            socials.youtube) && (
            <Info
              icon="share"
              label="Соцсети"
              value={
                <div className={s.socials}>
                  {socials.youtube && (
                    <a
                      href={socials.youtube}
                      target="_blank"
                      rel="noreferrer"
                      className={s.socialBtn}
                      aria-label="YouTube"
                    >
                      <SvgSocial name="youtube" />
                      <span>YouTube</span>
                    </a>
                  )}
                  {socials.whatsapp && (
                    <a
                      href={socials.whatsapp}
                      target="_blank"
                      rel="noreferrer"
                      className={s.socialBtn}
                      aria-label="WhatsApp"
                    >
                      <SvgSocial name="whatsapp" />
                      <span>WhatsApp</span>
                    </a>
                  )}
                  {socials.telegram && (
                    <a
                      href={socials.telegram}
                      target="_blank"
                      rel="noreferrer"
                      className={s.socialBtn}
                      aria-label="Telegram"
                    >
                      <SvgSocial name="telegram" />
                      <span>Telegram</span>
                    </a>
                  )}
                  {socials.instagram && (
                    <a
                      href={socials.instagram}
                      target="_blank"
                      rel="noreferrer"
                      className={s.socialBtn}
                      aria-label="Instagram"
                    >
                      <SvgSocial name="instagram" />
                      <span>Instagram</span>
                    </a>
                  )}
                </div>
              }
            />
          )}
        </div>

        {/* Галерея */}
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

          {/* Мобильная плёнка */}
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
                      <img
                        src={DEFAULT_VIDEO_POSTER}
                        alt={it.alt || `Видео ${i + 1}`}
                        loading="lazy"
                      />
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
                  muted
                  preload="metadata"
                  poster={DEFAULT_VIDEO_POSTER}
                >
                  {(items[lb.i].sources || []).map((srcObj, idx) => (
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
                    <img src={DEFAULT_VIDEO_POSTER} alt="" />
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

/* ===== helpers / UI ===== */

function Tile({ item, className, onClick }) {
  if (item.type === "image") {
    return (
      <button className={className} onClick={onClick} aria-label="Фото">
        <img src={item.src} alt={item.alt || "Фото"} loading="lazy" />
      </button>
    );
  }

  // Видео: ВСЕГДА общий постер
  return (
    <button
      className={`${className} ${s.hasPlay}`}
      onClick={onClick}
      aria-label="Видео"
    >
      <img
        src={DEFAULT_VIDEO_POSTER}
        alt={item.alt || "Видео"}
        loading="lazy"
      />
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
    clock: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 11H11V6h2v7z",
    pin: "M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9a2 2 0 1 1 0-4 2 2 0 0 1 0 4z",
    phone:
      "M6 2h3l2 5-2 1a12 12 0 0 0 5 5l1-2 5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 4 4a2 2 0 0 1 2-2z",
    share:
      "M4 12a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0-2a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm16 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm-10 1 4-2-4-2v4zm0 6 4 2-4 2v-4z",
  };
  return (
    <svg viewBox="0 0 24 24">
      <path d={paths[name] || ""} />
    </svg>
  );
}

function SvgSocial({ name }) {
  const icons = {
    youtube: (
      <svg viewBox="0 0 24 24" className={s.socialIcon} aria-hidden>
        <path d="M21 7.2c-.2-.9-.9-1.6-1.8-1.8C17.3 5 12 5 12 5S6.7 5 4.8 5.4C3.9 5.6 3.2 6.3 3 7.2 2.6 9.1 2.6 12 2.6 12s0 2.9.4 4.8c.2.9.9 1.6 1.8 1.8C6.7 19 12 19 12 19s5.3 0 7.2-.4c.9-.2 1.6-.9 1.8-1.8.4-1.9.4-4.8.4-4.8s0-2.9-.4-4.8z" />
        <path d="M10 15l4-3-4-3v6z" />
      </svg>
    ),
    whatsapp: (
      <svg viewBox="0 0 24 24" className={s.socialIcon} aria-hidden>
        <path d="M12 2a10 10 0 0 0-8.8 14.9L2 22l5.3-1.1A10 10 0 1 0 12 2zM7.5 9.4c.2-.5.4-.6.8-.6h.6c.2 0 .5.1.6.4l.5 1.1c.1.3.1.5-.1.7l-.5.6c.6 1.1 1.6 2 2.7 2.7l.6-.5c.2-.2.4-.2.7-.1l1.1.5c.3.1.4.4.4.6v.6c0 .4-.2.6-.6.8-.3.1-.9.3-1.9.1-1.7-.4-3.8-2.4-4.5-4.1-.4-1-.2-1.6 0-1.8z" />
      </svg>
    ),
    telegram: (
      <svg viewBox="0 0 24 24" className={s.socialIcon} aria-hidden>
        <path d="M21.5 3.5 4 10.2c-1.1.4-1.1 2 0 2.4l4.3 1.4 1.6 5.1c.3 1 1.5 1.2 2.1.4l2.8-3.5 4.4 3.3c.9.7 2.2.2 2.5-.9l3-14c.3-1.3-.9-2.4-2.5-1.9z" />
      </svg>
    ),
    instagram: (
      <svg viewBox="0 0 24 24" className={s.socialIcon} aria-hidden>
        <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 4a6 6 0 1 0 0 12 6 6 0 0 0 0-12zm7-1a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
      </svg>
    ),
  };
  return icons[name] || null;
}
