import React, {
  useMemo,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import s from "./AuroraVenue.module.css";
import MyButton from "../MyButton/MyButton";

/**
 * Пропсы:
 * - media: [
 *     { type:"image", src, alt? } |
 *     { type:"video", poster?, sources:[{src,type?}] } |
 *     { type:"video", src, poster?, alt? } // src → будет превращено в sources
 *   ]
 * - venue: {
 *     name, rating?, reviews?, categories?, priceLevel?, openNow?, hours?,
 *     phone?, address?, mapLink?, description?,
 *     socials?: { instagram?, telegram?, whatsapp?, youtube? }
 *   }
 * - onShare?, onBook?, showShare=true, showBook=false
 */

export default function AuroraVenueMedia({
  venue = {},
  media = [],
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

  // 1) Нормализация медиа
  const items = useMemo(() => normalizeMedia(media), [media]);

  // 2) Очень лёгкий «загрузчик» при первом показе (0.5 c)
  const [isBooting, setIsBooting] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setIsBooting(false), 500);
    return () => clearTimeout(t);
  }, []);

  // 3) Лайтбокс и навигация
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

  // 4) Клавиатура
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

  // 5) Автопауза/автоплей видео
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
        el.muted = true; // для автоплея на мобильных
        const p = el.play?.();
        if (p?.catch) p.catch(() => {});
      });
    }
  }, [lb.i, lb.open, items]);

  // 6) Свайп
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
    if (Math.abs(dx) > SWIPE_THR) (dx < 0 ? next : prev)();
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
      {isBooting && (
        <div className={s.loaderOverlay} aria-hidden>
          <div className={s.spinner} />
        </div>
      )}

      <section className={s.wrap}>
        {/* фон-«аврора» */}
        <div className={s.aurora} aria-hidden />

        {/* Заголовок / hero-зона */}
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

        {/* Инфо-блоки */}
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

        {/* Бенто-коллаж */}
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

          {/* Мобильная лента */}
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
                  muted
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

/* ===== helpers ===== */

/** Аккуратная подчистка URL: фиксим только явные опечатки. */
function cleanUrl(u = "") {
  let x = String(u).trim();
  // исправляем "/https://..." → "https://..."
  x = x.replace(/^\/+(https?:\/\/)/, "$1");
  // cloudinary: http → https
  if (x.startsWith("http://res.cloudinary.com")) {
    x = x.replace(/^http:\/\//, "https://");
  }
  return x;
}

/** Превращаем все варианты медиа к стабильному виду. */
export function normalizeMedia(media = []) {
  return (media || [])
    .filter(Boolean)
    .map((m) => {
      if (m.type === "video") {
        const poster = m.poster ? cleanUrl(m.poster) : "";
        const direct = m.src ? cleanUrl(m.src) : "";
        const sources =
          Array.isArray(m.sources) && m.sources.length
            ? m.sources
                .map((s) => ({
                  src: cleanUrl(s?.src || ""),
                  type: s?.type || "video/mp4",
                }))
                .filter((s) => !!s.src)
            : direct
            ? [{ src: direct, type: "video/mp4" }]
            : [];
        return { type: "video", poster, alt: m.alt || "", sources };
      }
      return { type: "image", src: cleanUrl(m.src || ""), alt: m.alt || "" };
    })
    .filter((x) => (x.type === "image" ? !!x.src : !!x.sources?.[0]?.src));
}

/** Карточка плитки */
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

/** Иконки соцсетей */
function SvgSocial({ name }) {
  const icons = {
    youtube: (
      <svg viewBox="0 0 24 24" className={s.socialIcon} aria-hidden>
        <path d="M23 12c0-2.5-.3-4.2-.7-5-.3-.6-.8-1.1-1.4-1.4C19.9 5 12 5 12 5S4.1 5 3.1 5.6c-.6.3-1.1.8-1.4 1.4C1.3 7.8 1 9.5 1 12s.3 4.2.7 5c.3.6.8 1.1 1.4 1.4C4.1 19 12 19 12 19s7.9 0 8.9-.6c.6-.3 1.1-.8 1.4-1.4.4-.8.7-2.5.7-5z" />
        <path d="M10 15l5-3-5-3v6z" />
      </svg>
    ),
    whatsapp: (
      <svg viewBox="0 0 24 24" className={s.socialIcon} aria-hidden>
        <path d="M20 3.9A10 10 0 1 0 4.2 19.7L3 23l3.4-1.2A10 10 0 1 0 20 3.9zM7.5 9.4c.2-.5.4-.6.8-.6h.6c.2 0 .5.1.6.4l.5 1.1c.1.3.1.5-.1.7l-.5.6c.6 1.1 1.6 2 2.7 2.7l.6-.5c.2-.2.4-.2.7-.1l1.1.5c.3.1.4.4.4.6v.6c0 .4-.2.6-.6.8-.3.1-.9.3-1.9.1-1.7-.4-3.8-2.4-4.5-4.1-.4-1-.2-1.6 0-1.8z" />
      </svg>
    ),
    telegram: (
      <svg viewBox="0 0 24 24" className={s.socialIcon} aria-hidden>
        <path d="M21.5 3.5 3 10.6c-1.2.5-1.2 2.2.1 2.6l4.3 1.4 1.6 5.1c.3 1 1.6 1.2 2.2.4l2.8-3.5 4.5 3.3c.9.7 2.2.2 2.5-1l3-14c.3-1.3-1-2.4-2.5-1.8z" />
      </svg>
    ),
    instagram: (
      <svg viewBox="0 0 24 24" className={s.socialIcon} aria-hidden>
        <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm6-1a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
      </svg>
    ),
  };
  return icons[name] || null;
}
