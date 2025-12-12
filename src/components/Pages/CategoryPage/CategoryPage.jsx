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

// утилита
const toSlug = (s = "") =>
  s.toString().trim().toLowerCase().replace(/\s+/g, "-").replace(/-{2,}/g, "-");

const DEFAULT_SLUG = toSlug(CategoryVariables[0].directionName);

// ===== КЭШ ДЛЯ РЕЗУЛЬТАТОВ ИЗ БД =====
const dbCache = new Map(); // key: slug / cacheKey → { items, error, ts }
const CACHE_TTL = 60_000; // 60 секунд считаем актуальными

export default function CategoryPage() {
  const { category: categoryParam } = useParams();

  // важно не делать ранний return — иначе ломается порядок хуков
  const needsRedirect = !categoryParam;
  const raw = needsRedirect ? DEFAULT_SLUG : decodeURIComponent(categoryParam);
  const slug = toSlug(raw);

  // конфиг категории
  const cat = useMemo(() => findCategoryBySlug(slug), [slug]);

  // ключ кэша (если нужно, можно задать в конфиге свой)
  const cacheKey = useMemo(() => cat.db?.cacheKey || slug, [cat, slug]);

  // активное «направление» для UI
  const direction = useMemo(() => {
    return (
      CategoryVariables.find((d) => toSlug(d.directionName) === slug) ||
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
        // категория без БД — лоадер точно прячем
        setDbItems([]);
        setErrorDb("");
        stopLoading();
        return;
      }

      // 1) пробуем взять из кэша
      const cached = dbCache.get(cacheKey);
      const now = Date.now();
      if (cached && now - cached.ts < CACHE_TTL) {
        setDbItems(cached.items || []);
        setErrorDb(cached.error || "");
        stopLoading();
        return;
      }

      try {
        startLoading();

        // таймаут-предохранитель на случай зависших запросов
        const timeout = new Promise((_, rej) =>
          setTimeout(() => rej(new Error("Превышено время ожидания")), 12000)
        );

        const itemsFromDb = await Promise.race([cat.db.loader(), timeout]);

        if (cancelled) return;

        const safeItems = itemsFromDb || [];

        setDbItems(safeItems);
        setErrorDb("");

        // сохраняем в кэш
        dbCache.set(cacheKey, {
          items: safeItems,
          error: "",
          ts: Date.now(),
        });
      } catch (err) {
        if (cancelled) return;

        const msg = err?.message || "Ошибка загрузки";
        setErrorDb(msg);
        setDbItems([]);

        // тоже кладём в кэш, чтобы не дёргать БД бесконечно
        dbCache.set(cacheKey, {
          items: [],
          error: msg,
          ts: Date.now(),
        });
      } finally {
        if (!cancelled) stopLoading();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [cat, cacheKey, startLoading, stopLoading]);

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

      {/* Оверлей-лоадер */}
      <OverlayLoader show={loadingOverlay} label="Обновляем список…" />

      <Category currentDirection={direction} />

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
