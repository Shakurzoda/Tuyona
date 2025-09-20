import s from "./CarsPage.module.css";

const nav = [
  { label: "Свадьбы" },
  { label: "Дильбы" },
  { label: "День рождення" },
  { label: "Туй" },
];

const gallery = [
  // большая слева
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop",
  // две маленьких справа
  "https://images.unsplash.com/photo-1521334726092-b509a19597c6?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1504805572947-34fad45aed93?q=80&w=1200&auto=format&fit=crop",
];

const reviews = [
  {
    name: "Анна",
    stars: 5,
    avatar: "https://i.pravatar.cc/80?img=48",
    text: "Сервис и очень хотели на кухню! Шеф отличнона спито. Засетила в кухне!",
  },
  {
    name: "Игор",
    stars: 4,
    avatar: "https://i.pravatar.cc/80?img=15",
    text: "Спорсивный стар! Ссыльке; дркеи декорацию, оборудше празд–цевения",
  },
  {
    name: "Дарья",
    stars: 5,
    avatar: "https://i.pravatar.cc/80?img=67",
    text: "Очень атмосферно. Красивый зал и отличная подача блюд.",
  },
];

function Stars({ value = 5 }) {
  const full = Array.from({ length: value }).map((_, i) => (
    <span key={`f-${i}`}>★</span>
  ));
  const empty = Array.from({ length: 5 - value }).map((_, i) => (
    <span key={`e-${i}`}>☆</span>
  ));
  return (
    <span className={s.stars}>
      {full}
      {empty}
    </span>
  );
}

export default function CarsPage() {
  return (
    <div className={s.page}>
      {/* TOP / HERO */}
      <section className={s.hero}>
        <div className={s.heroImgWrap}>
          <img className={s.heroImg} src={gallery[0]} alt="Банкетный зал" />
        </div>
        <aside className={s.panel}>
          <div className={s.panelPriceLine}>
            От <b>180</b> сомони/гость
          </div>

          <div className={s.panelRow}>
            <i className={s.chev}>▾</i>
            <span className={s.panelSub}>Посадка 80—220 гостей</span>
          </div>

          <div className={s.panelBtns}>
            <button className={s.primaryBtn}>Проверить дату</button>
            <button className={s.secondaryBtn}>Рассчитать смету</button>
          </div>

          <div className={s.panelRowSmall}>
            <i className={s.dot}>•</i>
            <span className={s.muted}>Скидка на свой торт: ≈ 20%</span>
          </div>
        </aside>
      </section>

      {/* TITLE */}
      <h1 className={s.h1}>Свадеса суда</h1>

      {/* NAV TAGS */}
      <nav className={s.nav} aria-label="Категории">
        {nav.map((n) => (
          <span key={n.label} className={s.pill}>
            {n.label}
          </span>
        ))}
        <span className={`${s.pill} ${s.pillMuted}`}>
          Время работы: 8:00—25:00
        </span>
      </nav>

      {/* BADGES */}
      <div className={s.badges}>
        <span className={s.badge}>Освещение — Звук</span>
        <span className={s.badge}>Адрес: Душанбе</span>
      </div>

      {/* INFO ROWS */}
      <div className={s.infoGrid}>
        <div className={s.infoCol}>
          <div className={s.infoTitle}>Адрес:</div>
          <div className={s.infoText}>мкр. Испичак‑2, 16/4</div>
        </div>
        <div className={s.infoCol}>
          <div className={s.infoTitle}>Вместимость:</div>
          <div className={s.infoText}>до 220 гостей</div>
        </div>
        <div className={s.infoCol}>
          <div className={s.infoTitle}>Время работы:</div>
          <div className={s.infoText}>8.00—25.00</div>
        </div>
        <div className={s.infoCol}>
          <div className={s.infoTitle}>Бронь:</div>
          <div className={s.infoText}>по запросу</div>
        </div>
      </div>

      {/* GALLERY */}
      <h2 className={s.sectionTitle}>Фотогалерея</h2>
      <section className={s.gallery}>
        <figure className={`${s.gItem} ${s.gMain}`}>
          <img src={gallery[0]} alt="Зал — общий вид" />
        </figure>
        <figure className={s.gItem}>
          <img src={gallery[1]} alt="Зал — вид 2" />
        </figure>
        <figure className={s.gItem}>
          <img src={gallery[2]} alt="Зал — вид 3" />
        </figure>
      </section>

      {/* REVIEWS */}
      <section className={s.reviews}>
        {reviews.map((r, i) => (
          <article key={i} className={s.reviewCard}>
            <img src={r.avatar} alt={r.name} className={s.avatar} />
            <div className={s.reviewContent}>
              <div className={s.reviewTop}>
                <div className={s.reviewer}>{r.name}</div>
                <Stars value={r.stars} />
              </div>
              <p className={s.reviewText}>{r.text}</p>
            </div>
          </article>
        ))}
      </section>

      <div className={s.bottomPad} />
    </div>
  );
}
