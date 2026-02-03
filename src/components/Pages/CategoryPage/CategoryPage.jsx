// src/components/Pages/CategoryPage/CategoryPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import styles from "./CategoryPage.module.css";

import Category from "../../Category/Category";
import { CategoryVariables } from "../../Category/CategoryVariables";
import CardItem from "../../CardItem/CardItem";

import { findCategoryBySlug } from "./categoryConfig";

import OverlayLoader from "./OverlayLoader";
import { useMinDelayLoader } from "./useMinDelayLoader";
import { supabase } from "@/lib/supabaseClient";

// утилита slug
const toSlug = (s = "") =>
  s.toString().trim().toLowerCase().replace(/\s+/g, "-").replace(/-{2,}/g, "-");

// МАП: русское directionName -> slug в БД (category_visibility.slug)
const SLUG_MAP = {
  "Все категории": "all",
  Рестораны: "restaurants",
  Музыканты: "musicians",
  Машины: "cars",
  Оформление: "decoration",
  Ведущие: "presenters",
  Фотографы: "photographers",
  Певцы: "singers",
  "Свадебные салоны": "beautysalons",
};

const getDbSlugByDirection = (d) => {
  // если когда-то добавишь d.slug в CategoryVariables — это тоже будет работать
  if (d?.slug) return toSlug(d.slug);
  return SLUG_MAP[d?.directionName] || toSlug(d?.directionName || "");
};

// дефолтная категория (если в URL нет /:category)
// важно: дефолт должен быть slug-ом, который понимает categoryConfig/findCategoryBySlug
const DEFAULT_SLUG = getDbSlugByDirection(CategoryVariables[0]);

export default function CategoryPage() {
  const { category: categoryParam } = useParams();

  // важно не делать ранний return — иначе ломается порядок хуков
  const needsRedirect = !categoryParam;
  const raw = needsRedirect ? DEFAULT_SLUG : decodeURIComponent(categoryParam);
  const slug = toSlug(raw);

  // ====== видимость категорий из БД ======
  // visibleSet хранит ТОЛЬКО видимые slug-и (restaurants, cars...)
  const [visibleSet, setVisibleSet] = useState(null);

  useEffect(() => {
    let cancelled = false;

    if (!supabase) {
      // если Supabase не сконфигурирован — показываем всё
      setVisibleSet(null);
      return;
    }

    (async () => {
      try {
        const { data, error } = await supabase
          .from("category_visibility")
          .select("slug,is_visible");

        if (error) throw error;

        const set = new Set(
          (data || [])
            .filter((row) => row.is_visible !== false) // true или null => видим
            .map((row) => toSlug(row.slug))
        );

        if (!cancelled) setVisibleSet(set);
      } catch (e) {
        console.error("Ошибка загрузки category_visibility:", e);
        // при ошибке не ломаем сайт — покажем всё
        if (!cancelled) setVisibleSet(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // список категорий, которые показываем в навигации
  const visibleDirections = useMemo(() => {
    if (!visibleSet) return CategoryVariables; // если не загрузилось/ошибка — показываем все
    return CategoryVariables.filter((d) =>
      visibleSet.has(getDbSlugByDirection(d))
    );
  }, [visibleSet]);

  // если текущий slug выключен в админке — можно (по желанию) редиректить на дефолт
  const isCurrentHidden = useMemo(() => {
    if (!visibleSet) return false; // пока нет данных — не трогаем
    return !visibleSet.has(slug);
  }, [visibleSet, slug]);

  // конфиг категории (для загрузки локальных/БД-данных)
  const cat = useMemo(() => findCategoryBySlug(slug), [slug]);

  // активное «направление» для UI
  // ищем по dbSlug (а не по русскому названию), иначе не совпадёт
  const direction = useMemo(() => {
    return (
      CategoryVariables.find((d) => getDbSlugByDirection(d) === slug) ||
      CategoryVariables[0]
    );
  }, [slug]);

  // локальные карточки
  const localItems = useMemo(() => {
    return cat.getLocalItems(direction.directionName, slug);
  }, [cat, direction, slug]);

  // БД-состояния
  const [dbItems, setDbItems] = useState([]);
  const [errorDb, setErrorDb] = useState("");

  // Оверлей-лоадер, который не залипает
  const [loadingOverlay, startLoading, stopLoading] = useMinDelayLoader(
    500,
    12000
  );

  // Загрузка из БД (только если включено в конфиге)
  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!cat.db?.enabled) {
        setDbItems([]);
        setErrorDb("");
        stopLoading();
        return;
      }

      try {
        startLoading();

        const timeout = new Promise((_, rej) =>
          setTimeout(() => rej(new Error("Превышено время ожидания")), 12000)
        );

        const itemsFromDb = await Promise.race([cat.db.loader(), timeout]);
        if (!cancelled) setDbItems(itemsFromDb || []);
      } catch (err) {
        if (!cancelled) setErrorDb(err?.message || "Ошибка загрузки");
      } finally {
        if (!cancelled) stopLoading();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [cat, startLoading, stopLoading]);

  // объединяем local + db (без дублей по ключу из конфига)
  const items = useMemo(() => {
    if (!cat.db?.enabled) return localItems;

    const key = cat.db.dedupeBy || "title";
    const localSet = new Set(
      localItems
        .map((x) => (x?.[key] || "").toString().trim().toLowerCase())
        .filter(Boolean)
    );
    const onlyNew = dbItems.filter((x) => {
      const v = (x?.[key] || "").toString().trim().toLowerCase();
      return v && !localSet.has(v);
    });
    return [...localItems, ...onlyNew];
  }, [cat, localItems, dbItems]);

  const listKey = slug;

  return (
    <div className={styles.category}>
      {/* Канонический редирект, не ломая порядок хуков */}
      {needsRedirect && <Navigate to={`/category/${DEFAULT_SLUG}`} replace />}

      {/* Если категория скрыта — редиректим на дефолт (чтобы не открывали скрытое по прямой ссылке) */}
      {!needsRedirect && isCurrentHidden && (
        <Navigate to={`/category/${DEFAULT_SLUG}`} replace />
      )}

      {/* Оверлей-лоадер */}
      <OverlayLoader show={loadingOverlay} label="Обновляем список…" />

      {/* Навигация по категориям — уже с учётом видимости */}
      <Category currentDirection={direction} categories={visibleDirections} />

      <div className={styles.category__content}>
        {cat.db?.enabled && errorDb && (
          <div className={styles.category__error}>{errorDb}</div>
        )}

        <div className={styles.category__items} key={listKey}>
          {items.length ? (
            items.map((item) => (
              <CardItem
                key={item._key || `${listKey}-${item.type}-${item.id}`}
                item={item}
              />
            ))
          ) : (
            <p>Нет элементов в этой категории</p>
          )}
        </div>
      </div>
    </div>
  );
}
