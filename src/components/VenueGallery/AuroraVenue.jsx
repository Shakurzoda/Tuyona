import React, {
  useMemo,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import s from "./AuroraVenue.module.css";
import MyButton from '../MyButton/MyButton';

export default function AuroraVenueMedia({
  venue = {
    name: "Bubble Tea Point",
    rating: 4.8,
    reviews: 312,
    categories: ["Свадьбы", "Оши нахор", "Банкеты"],
    priceLevel: "₸₸",
    openNow: true,
    hours: "Ежедневно 10:00–22:00",
    phone: "+7 (777) 000-00-00",
    website: "https://example.com",
    address: "просп. Саади Шерози, 16",
    mapLink: "https://yandex.tj/maps/-/CHtwfFYy",
    description:
      "Авторские напитки с тапиокой. Уютная атмосфера, сезонные лимитки и десерты.",
  },
  /** media: смешанный массив:
   * { type:"image", src, alt? }
   * { type:"video", poster?, sources:[{src, type?}] } или {type:"video", src, poster?}
   */
  media = [],
  hero = "",
/*   onBook = () => {},
  onShare = () => {}, */
}) {
  // нормализация медиа
  const items = useMemo(() => {
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
  }, [media]);

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

  // клавиатура для лайтбокса
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

  // пауза, если ушли с видео
  const videoRef = useRef(null);
  useEffect(() => {
    if (!lb.open) return;
    const cur = items[lb.i];
    if (cur?.type !== "video" && videoRef.current) {
      videoRef.current.pause();
    }
  }, [lb.i, lb.open, items]);

  return (
    <section className={s.wrap}>
      {/* Aurora фон */}
      <div className={s.aurora} aria-hidden />

      {/* Hero */}
      <div className={s.hero}>
        {hero && <img src={hero} alt="" />}
        <div className={s.titleBlock}>
          <h1 className={s.title}>{venue.name}</h1>
          <div className={s.metaRow}>
            {/*             <Rating value={venue.rating} />
            <span className={s.rateVal}>{venue.rating.toFixed(1)}</span> */}
            {/*             <span className={s.muted}>({venue.reviews})</span> */}
            {venue.categories?.length > 0 && (
              <>
                {/* <span className={s.dot}>•</span> */}
                <span className={s.muted}>{venue.categories.join(" · ")}</span>
              </>
            )}
            <span className={`${s.badge} ${venue.openNow ? s.open : s.closed}`}>
              {venue.openNow ? "Проверено" : "Закрыто"}
            </span>
{/*             <span className={s.price}>{venue.priceLevel}</span> */}
          </div>
          <p className={s.desc}>{venue.description}</p>
          <div className={s.ctaRow}>
            <MyButton size="medium" color="green">
              Поделиться
            </MyButton>
            {/*             <button className={s.btn} onClick={onShare}>
              Поделиться
            </button> */}
          </div>
        </div>
      </div>

      {/* Инфо */}
      <div className={s.infoGrid}>
        <Info icon="clock" label="Часы" value={venue.hours} />
        <Info
          icon="pin"
          label="Адрес"
          value={
            <div className={s.addrRow}>
              <span className={s.addrText}>
                <span className={s.addrIcon}>📍</span>
                <a href={venue.mapLink} target="_blank" rel="noreferrer">
                  {venue.address}
                </a>
              </span>
              <a
                href={venue.mapLink}
                target="_blank"
                rel="noreferrer"
                className={s.addrBtn}
              >
                Маршрут
              </a>
            </div>
          }
        />
        <Info
          icon="phone"
          label="Телефон"
          value={<a href={`tel:${venue.phone}`}>{venue.phone}</a>}
        />
        <Info
          icon="link"
          label="Сайт"
          value={
            venue.website ? (
              <a href={venue.website} target="_blank" rel="noreferrer">
                {venue.website.replace(/^https?:\/\//, "")}
              </a>
            ) : (
              "—"
            )
          }
        />
      </div>

      {/* Bento-коллаж (берём первые 5 элементов из media если есть) */}
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

        {/* Mobile filmstrip c peek */}
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
                    {/* превью видео в ленте: постер */}
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

          <div className={s.stage}>
            {items[lb.i].type === "image" ? (
              <img
                className={s.lbImg}
                src={items[lb.i].src}
                alt={items[lb.i].alt || "Фото"}
              />
            ) : (
              <video
                className={s.lbVid}
                ref={videoRef}
                controls
                playsInline
                autoPlay
                poster={items[lb.i].poster}
              >
                {items[lb.i].sources.map((srcObj, idx) => (
                  <source key={idx} src={srcObj.src} type={srcObj.type || ""} />
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
  );
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
    link: "M7 12a5 5 0 0 1 5-5h3v2h-3a3 3 0 1 0 0 6h3v2h-3a5 5 0 0 1-5-5Zm10-5h-3v2h3a3 3 0 1 1 0 6h-3v2h3a5 5 0 0 0 0-10Z",
  };
  return (
    <svg viewBox="0 0 24 24">
      <path d={paths[name] || ""} />
    </svg>
  );
}
