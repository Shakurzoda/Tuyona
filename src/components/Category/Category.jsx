import styles from "./Category.module.css";
import clsx from "clsx";
import { useNavigate } from "react-router";
import { CategoryVariables } from "./CategoryVariables";

// приводим к “каноническому” slug как в БД (restaurants, cars...)
const toSlug = (s = "") =>
  s.toString().trim().toLowerCase().replace(/\s+/g, "-").replace(/-{2,}/g, "-");

// если у тебя directionName на русском — делаем явную мапу в slug как в БД
const SLUG_MAP = {
  "Все категории": "all",
  Рестораны: "restaurants",
  Музыканты: "musicians",
  Машины: "cars",
  Оформление: "decoration",
  Ведущие: "presenters",
  Фотографы: "photographers",
  Певцы: "singers",
  "Свадебные салоны": "beauty_salon",
};

function getSlug(directionElement) {
  // если ты добавишь slug в CategoryVariables — будет работать автоматически
  if (directionElement?.slug) return String(directionElement.slug);
  const name = directionElement?.directionName || directionElement?.title || "";
  return SLUG_MAP[name] || toSlug(name);
}

const Category = ({ currentDirection, categories = CategoryVariables }) => {
  const navigate = useNavigate();

  const currentSlug = currentDirection
    ? getSlug(currentDirection)
    : getSlug(categories?.[0]);

  return (
    <div className={styles.content__wrapper}>
      <div className={styles.content}>
        <div className={styles.corses__name}>
          <h1 className={styles.topName}>{currentDirection?.title || ""}</h1>
        </div>

        <div className={styles.courses__items}>
          {categories.map((directionElement) => {
            const slug = getSlug(directionElement);
            const isActive = currentSlug === slug;

            return (
              <div
                key={slug}
                className={clsx(styles.item, { [styles.activeItem]: isActive })}
                onClick={() =>
                  navigate(`/category/${encodeURIComponent(slug)}`)
                }
              >
                {directionElement.title}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Category;
