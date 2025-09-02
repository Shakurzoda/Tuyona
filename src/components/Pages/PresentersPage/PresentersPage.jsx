import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import styles from "./PresentersPage.module.css";
import { PRESENTERS } from "../CategoryPage/variables";

const currency = "с";
const format = (n) =>
  typeof n === "number" ? new Intl.NumberFormat("ru-RU").format(n) : n;

export default function PresentersPage() {
  const { id } = useParams();
  const item = PRESENTERS.find((it) => Number(it.id) === Number(id)) || null;

  if (!item) {
    return (
      <div className={styles.notFound}>
        <h1>Объявление не найдено</h1>
        <Link to="/category/vedushchie" className={styles.btnPrimary}>
          Вернуться к списку
        </Link>
      </div>
    );
  }

  const images = useMemo(() => {
    const arr = [item.img, ...(item.imgList || [])].filter(Boolean);
    // убираем дубликаты
    return Array.from(new Set(arr));
  }, [item]);

  const [active, setActive] = useState(0);

  // демо-наборы “как у магазина”
  const variants1 = item.formats || [
    "Свадьбы",
    "Корпоративы",
    "Юбилеи",
    "Выпускные",
  ];
  const variants2 = item.languages || ["RU", "TJ", "EN"];
  const [v1, setV1] = useState(variants1[0]);
  const [v2, setV2] = useState(variants2[0]);

  return (
    <div className={styles.page}>
      {/* Заголовок + действия */}
      <div className={styles.headerRow}>
        <h1 className={styles.title}>{item.title}</h1>

        <div className={styles.headerActions}>
          <button className={styles.iconBtn} aria-label="В избранное">
            ★
          </button>
          <button className={styles.iconBtn} aria-label="Поделиться">
            ↗
          </button>
        </div>
      </div>

      {/* Главная сетка как на скрине */}
      <div className={styles.grid}>
        {/* Левый столбец — вертикальные превью */}
        <aside className={styles.thumbs}>
          {images.map((src, i) => (
            <button
              key={src}
              className={`${styles.thumb} ${
                i === active ? styles.thumbActive : ""
              }`}
              onClick={() => setActive(i)}
              aria-label={`Фото ${i + 1}`}
            >
              <img src={src} alt="" loading="lazy" decoding="async" />
            </button>
          ))}
        </aside>

        {/* Большое изображение */}
        <div className={styles.viewer}>
          <img src={images[active]} alt={item.title} />
          <div className={styles.badge}>Проверено</div>
        </div>

        {/* Характеристики и опции (середина) */}
        <section className={styles.specs}>
          <div className={styles.optionGroup}>
            <div className={styles.optionLabel}>Формат</div>
            <div className={styles.chips}>
              {variants1.map((opt) => (
                <button
                  key={opt}
                  className={`${styles.chip} ${
                    v1 === opt ? styles.chipActive : ""
                  }`}
                  onClick={() => setV1(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.optionGroup}>
            <div className={styles.optionLabel}>Язык</div>
            <div className={styles.chips}>
              {variants2.map((opt) => (
                <button
                  key={opt}
                  className={`${styles.chip} ${
                    v2 === opt ? styles.chipActive : ""
                  }`}
                  onClick={() => setV2(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <dl className={styles.kvList}>
            <div className={styles.kvRow}>
              <dt>Город</dt>
              <dd>{item.city || "Душанбе"}</dd>
            </div>
            <div className={styles.kvRow}>
              <dt>Опыт</dt>
              <dd>{item.experience || "3+ лет"}</dd>
            </div>
            <div className={styles.kvRow}>
              <dt>Тип площадки</dt>
              <dd>{item.venueType || "Ресторан, банкет-холл"}</dd>
            </div>
            <div className={styles.kvRow}>
              <dt>Контакты</dt>
              <dd>{item.phone || "+992 xx xxx xx xx"}</dd>
            </div>
            <div className={styles.kvRow}>
              <dt>Год</dt>
              <dd>{item.year || "2025"}</dd>
            </div>
          </dl>

          {item.description && (
            <p className={styles.desc}>{item.description}</p>
          )}

          <a href="#" className={styles.allSpecsLink}>
            Все характеристики
          </a>
        </section>

        {/* Правый сайдбар — цена и кнопка */}
        <aside className={styles.buyBox}>
          <div className={styles.price}>
            {format(item.price || 13230)} {currency}.
          </div>
          <div className={styles.subPrice}>от 756 {currency}. × 24 мес</div>
          <div className={styles.commission}>
            Комиссия: 4 895 {currency}. (37%)
          </div>

          <button className={styles.buyBtn}>Забронировать</button>

          <div className={styles.note}>
            Выбрано: <strong>{v1}</strong>, <strong>{v2}</strong>
          </div>
        </aside>
      </div>
    </div>
  );
}
