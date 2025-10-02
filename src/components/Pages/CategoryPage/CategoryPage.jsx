import { useEffect, useMemo, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import styles from "./CategoryPage.module.css";
import Category from "../../Category/Category";
import { CategoryVariables } from "../../Category/CategoryVariables";
import CardItem from "../../CardItem/CardItem";
import { getCategoryItems } from "../../Category/getCategoryItems";
import { supabase } from "../../../lib/supabaseClient"; // <-- проверь путь

const toSlug = (s = "") =>
  s.toString().trim().toLowerCase().replace(/\s+/g, "-").replace(/-{2,}/g, "-");

const DEFAULT_SLUG = toSlug(CategoryVariables[0].directionName);

// для удобства
const isRestaurantsSlug = (slug) =>
  slug === "restaurant" ||
  slug === "restaurants" ||
  slug === "restorany" ||
  slug === "рестораны";

export default function CategoryPage() {
  const { category: categoryParam } = useParams();

  // если пришли на /category без параметра — редирект на дефолт
  if (!categoryParam) {
    return <Navigate to={`/category/${DEFAULT_SLUG}`} replace />;
  }

  const slug = toSlug(decodeURIComponent(categoryParam));

  // направление по slug (без useEffect — производная от URL)
  const direction = useMemo(() => {
    return (
      CategoryVariables.find((d) => toSlug(d.directionName) === slug) ||
      CategoryVariables[0]
    );
  }, [slug]);

  // локальные карточки (как раньше)
  const localItems = useMemo(() => {
    const res = getCategoryItems(direction.directionName);
    const arr = Array.isArray(res) ? res : [];
    return arr.map((it) => ({
      ...it,
      _source: "local",
      _key: `${slug}-local-${it.type || "restaurant"}-${it.id}`,
    }));
  }, [direction, slug]);

  // ----------------------------
  // ДОБАВЛЯЕМ РЕСТОРАНЫ ИЗ SUPABASE
  // ----------------------------
  const [dbItems, setDbItems] = useState([]);
  const [loadingDb, setLoadingDb] = useState(false);
  const [errorDb, setErrorDb] = useState("");

  useEffect(() => {
    if (!isRestaurantsSlug(slug)) {
      setDbItems([]);
      setLoadingDb(false);
      setErrorDb("");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        setLoadingDb(true);
        setErrorDb("");

        const { data: venues, error: e1 } = await supabase
          .from("venues")
          .select(
            "id, title, description, address, map_link, phone, hours, created_at"
          )
          .eq("type", "restaurant")
          .eq("is_published", true)
          .order("created_at", { ascending: false });

        if (e1) throw e1;
        if (!venues?.length) {
          if (!cancelled) setDbItems([]);
          setLoadingDb(false);
          return;
        }

        const ids = venues.map((v) => v.id);
        const { data: media, error: e2 } = await supabase
          .from("venue_media")
          .select("venue_id, kind, src, poster, sort_order") // <-- ВАЖНО: poster
          .in("venue_id", ids)
          .order("sort_order", { ascending: true });

        if (e2) throw e2;

        // соберём кавер по правилу: image -> poster video
        const coverByVenue = new Map(); // id -> url
        if (media?.length) {
          for (const m of media) {
            if (coverByVenue.has(m.venue_id)) continue;
            if (m.kind === "image" && m.src) {
              coverByVenue.set(m.venue_id, m.src);
            }
          }
          // если не нашлось image — допройдёмся и поставим poster видео
          for (const m of media) {
            if (coverByVenue.has(m.venue_id)) continue;
            if (m.kind === "video" && m.poster) {
              coverByVenue.set(m.venue_id, m.poster);
            }
          }
        }

        // Маппинг к формату CardItem
        const mapped = venues.map((v) => ({
          id: v.id,
          type: "restaurant",
          img: coverByVenue.get(v.id) || "", // теперь будет постер, если нет image
          title: v.title || "",
          description: v.description || "",
          street: v.address || "",
          yandexMap: v.map_link || "",
          tel: v.phone || "",
          telLink: v.phone || "",
          time: v.hours || "",
          price: "",
          imgList: [],
          // ВАЖНО: свой маршрут для БД, чтобы избежать коллизий с локальными
          href: `/aurora/restaurant/${v.id}`,
          _source: "db",
          _key: `${slug}-db-restaurant-${v.id}`,
        }));

        if (!cancelled) setDbItems(mapped);
      } catch (err) {
        if (!cancelled)
          setErrorDb(err?.message || "Ошибка загрузки ресторанов");
      } finally {
        if (!cancelled) setLoadingDb(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  // объединяем локальные + БД (без дублей по названию)
  const items = useMemo(() => {
    if (!isRestaurantsSlug(slug)) return localItems;

    const byTitle = new Set(
      localItems
        .filter((x) => x?.title)
        .map((x) => x.title.trim().toLowerCase())
    );
    const onlyNew = dbItems.filter(
      (x) => x?.title && !byTitle.has(x.title.trim().toLowerCase())
    );
    return [...localItems, ...onlyNew];
  }, [slug, localItems, dbItems]);

  const listKey = slug; // ключ чтобы перерисовать список при смене URL

  return (
    <div className={styles.category}>
      <Category currentDirection={direction} />

      <div className={styles.category__content}>
        {isRestaurantsSlug(slug) && loadingDb && (
          <div className={styles.category__hint}>Обновляем список…</div>
        )}
        {isRestaurantsSlug(slug) && errorDb && (
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
