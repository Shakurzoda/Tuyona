import { supabase } from "../../../lib/supabaseClient";
import { getCategoryItems } from "../../Category/getCategoryItems";

/** helper: формируем cover по медиа (image -> video.poster) */
function buildCoversMap(media = []) {
  const cover = new Map(); // venue_id -> url
  // сначала изображения
  for (const m of media) {
    if (!cover.has(m.venue_id) && m.kind === "image" && m.src) {
      cover.set(m.venue_id, m.src);
    }
  }
  // если не нашли — постер видео
  for (const m of media) {
    if (!cover.has(m.venue_id) && m.kind === "video" && m.poster) {
      cover.set(m.venue_id, m.poster);
    }
  }
  return cover;
}

/** Маппим venue + cover в CardItem */
function mapVenueToCardItem(v, coverUrl, slugForHref = "restaurant") {
  return {
    id: v.id,
    type: slugForHref, // единый тип для CardItem
    img: coverUrl || "",
    title: v.title || "",
    description: v.description || "",
    street: v.address || "",
    yandexMap: v.map_link || "",
    tel: v.phone || "",
    telLink: v.phone || "",
    time: v.hours || "",
    price: "",
    imgList: [],
    href: `/aurora/${slugForHref}/${v.id}`, // детальная — через универсальный роут
    _source: "db",
    _key: `db-${slugForHref}-${v.id}`,
  };
}

/** DB-лоадер: только для "restaurant" в первой итерации */
async function loadRestaurantsFromDB() {
  // venues
  const { data: venues, error: e1 } = await supabase
    .from("venues")
    .select(
      "id, title, description, address, map_link, phone, hours, created_at"
    )
    .eq("type", "restaurant")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (e1) throw e1;
  if (!venues?.length) return [];

  // media
  const ids = venues.map((v) => v.id);
  const { data: media, error: e2 } = await supabase
    .from("venue_media")
    .select("venue_id, kind, src, poster, sort_order")
    .in("venue_id", ids)
    .order("sort_order", { ascending: true });

  if (e2) throw e2;

  const covers = buildCoversMap(media || []);
  return venues.map((v) =>
    mapVenueToCardItem(v, covers.get(v.id), "restaurant")
  );
}

export const CATEGORY_CONFIG = [
  {
    key: "restaurant",
    slugs: ["restaurant", "restaurants", "restorany", "рестораны"],
    title: "Рестораны",
    // локальные карточки
    getLocalItems: (directionName, slug) => {
      const res = getCategoryItems(directionName);
      const arr = Array.isArray(res) ? res : [];
      return arr.map((it) => ({
        ...it,
        _source: "local",
        _key: `${slug}-local-${it.type || "restaurant"}-${it.id}`,
      }));
    },
    // поддержка БД
    db: {
      enabled: true,
      loader: loadRestaurantsFromDB,
      dedupeBy: "title", // как убирать дубли с локальными
    },
  },

  // Прочие категории — пока только локальные (можно расширять по мере миграции)
  {
    key: "musicians",
    slugs: ["musicians", "музыканты"],
    title: "Музыканты",
    getLocalItems: (directionName, slug) => {
      const res = getCategoryItems(directionName);
      return (Array.isArray(res) ? res : []).map((it) => ({
        ...it,
        _source: "local",
        _key: `${slug}-local-${it.type || "musicians"}-${it.id}`,
      }));
    },
    db: { enabled: false },
  },
  {
    key: "cars",
    slugs: ["cars", "авто", "машины"],
    title: "Авто",
    getLocalItems: (directionName, slug) => {
      const res = getCategoryItems(directionName);
      return (Array.isArray(res) ? res : []).map((it) => ({
        ...it,
        _source: "local",
        _key: `${slug}-local-${it.type || "cars"}-${it.id}`,
      }));
    },
    db: { enabled: false },
  },
  // … по желанию добавляй остальные категории (decorations, presenters, photographers, singers, beautySalons)
];

/** найти конфиг по slug */
export function findCategoryBySlug(slug) {
  const s = String(slug || "")
    .trim()
    .toLowerCase();
  return CATEGORY_CONFIG.find((c) => c.slugs.includes(s)) || CATEGORY_CONFIG[0];
}
