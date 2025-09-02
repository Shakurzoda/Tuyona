import { useMemo } from "react";
import { useParams, Navigate } from "react-router-dom";
import styles from "./CategoryPage.module.css";
import Category from "../../Category/Category";
import { CategoryVariables } from "../../Category/CategoryVariables";
import CardItem from "../../CardItem/CardItem";
import { getCategoryItems } from "../../Category/getCategoryItems";

const toSlug = (s = "") =>
  s.toString().trim().toLowerCase().replace(/\s+/g, "-").replace(/-{2,}/g, "-");

const DEFAULT_SLUG = toSlug(CategoryVariables[0].directionName);

const CategoryPage = () => {
  const { category: categoryParam } = useParams();

  // если пришли на /category без параметра — сразу редиректим на дефолт
  if (!categoryParam) {
    return <Navigate to={`/category/${DEFAULT_SLUG}`} replace />;
  }

  const slug = toSlug(decodeURIComponent(categoryParam));

  // находим направление по slug (без useEffect — чисто производная от URL)
  const direction = useMemo(() => {
    return (
      CategoryVariables.find((d) => toSlug(d.directionName) === slug) ||
      CategoryVariables[0]
    );
  }, [slug]);

  // получаем карточки синхронно из локальных данных
  const items = useMemo(() => {
    const res = getCategoryItems(direction.directionName);
    return Array.isArray(res) ? res : [];
  }, [direction]);

  const listKey = slug; // ключ чтобы точно перерисовать список при смене URL

  return (
    <div className={styles.category}>
      <Category currentDirection={direction} />
      <div className={styles.category__content}>
        <div className={styles.category__items} key={listKey}>
          {items.length ? (
            items.map((item) => (
              <CardItem key={`${listKey}-${item.id}`} item={item} />
            ))
          ) : (
            <p>Нет элементов в этой категории</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
