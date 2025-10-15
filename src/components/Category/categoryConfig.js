// src/components/Pages/CategoryPage/categoryConfig.js
import { supabase } from "../../../lib/supabaseClient";
import { getCategoryItems } from "../../Category/getCategoryItems";

/** Универсальная выборка карточек из БД по venues.type */
async function loadFromDbByType(type) {
  const { data: venues, error: e1 } = await supabase
    .from("venues")
    .select("id,title,description,address,map_link,phone,hours,created_at")
    .eq("type", type)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (e1) throw e1;
  if (!venues?.length) return [];

  const ids = venues.map((v) => v.id);
  const { data: media } = await supabase
    .from("venue_media")
    .select("venue_id,kind,src,poster,sort_order")
    .in("venue_id", ids)
    .order("sort_order", { ascending: true });

  const coverByVenue = new Map();
  // сначала ищем image
  for (const m of media || []) {
    if (!coverByVenue.has(m.venue_id) && m.kind === "image" && m.src) {
      coverByVenue.set(m.venue_id, m.src);
    }
  }
  // если нет image — используем постер видео
  for (const m of media || []) {
    if (!coverByVenue.has(m.venue_id) && m.kind === "video" && m.poster) {
      coverByVenue.set(m.venue_id, m.poster);
    }
  }

  return (venues || []).map((v) => ({
    id: v.id,
    type, // важен для маршрута /aurora/:type/:id
    img: coverByVenue.get(v.id) || "",
    title: v.title || "",
    description: v.description || "",
    street: v.address || "",
    yandexMap: v.map_link || "",
    tel: v.phone || "",
    telLink: v.phone || "",
    time: v.hours || "",
    price: "",
    imgList: [],
    href: `/aurora/${type}/${v.id}`,
    _source: "db",
    _key: `${type}-db-${v.id}`,
  }));
}

/** Хелпер для локальных карточек: навешиваем href и служебные поля */
function mapLocal(directionName, slug, routeType) {
  const arr = getCategoryItems(directionName) || [];
  return arr.map((it) => ({
    ...it,
    href: `/aurora/${routeType}/${it.id}`,
    _source: "local",
    _key: `${slug}-local-${routeType}-${it.id}`,
  }));
}

/** Полный конфиг всех категорий */
export const CATEGORY_CONFIG = [
  // === РЕСТОРАНЫ ===
  {
    slugList: ["restaurant", "restaurants", "restorany", "рестораны"],
    getLocalItems(directionName, slug) {
      return mapLocal(directionName, slug, "restaurant");
    },
    db: {
      enabled: true,
      dedupeBy: "title",
      loader: () => loadFromDbByType("restaurant"),
    },
  },

  // === МУЗЫКАНТЫ ===
  {
    slugList: ["musician", "musicians", "музыканты"],
    getLocalItems(directionName, slug) {
      return mapLocal(directionName, slug, "musician");
    },
    db: {
      enabled: true,
      dedupeBy: "title",
      loader: () => loadFromDbByType("musician"),
    },
  },

  // === МАШИНЫ / АВТО ===
  {
    slugList: ["car", "cars", "auto", "машины"],
    getLocalItems(directionName, slug) {
      return mapLocal(directionName, slug, "car");
    },
    db: {
      enabled: true,
      dedupeBy: "title",
      loader: () => loadFromDbByType("car"),
    },
  },

  // === ОФОРМЛЕНИЕ ===
  {
    slugList: ["decoration", "decor", "оформление"],
    getLocalItems(directionName, slug) {
      return mapLocal(directionName, slug, "decoration");
    },
    db: {
      enabled: true,
      dedupeBy: "title",
      loader: () => loadFromDbByType("decoration"),
    },
  },

  // === ВЕДУЩИЕ / ПРЕЗЕНТЕРЫ ===
  {
    slugList: ["presenter", "presenters", "ведущие"],
    getLocalItems(directionName, slug) {
      return mapLocal(directionName, slug, "presenter");
    },
    db: {
      enabled: true,
      dedupeBy: "title",
      loader: () => loadFromDbByType("presenter"),
    },
  },

  // === ФОТОГРАФЫ ===
  {
    slugList: ["photographer", "photographers", "фотографы"],
    getLocalItems(directionName, slug) {
      return mapLocal(directionName, slug, "photographer");
    },
    db: {
      enabled: true,
      dedupeBy: "title",
      loader: () => loadFromDbByType("photographer"),
    },
  },

  // === ПЕВЦЫ / ВОКАЛ ===
  {
    slugList: ["singer", "singers", "певцы", "вокал"],
    getLocalItems(directionName, slug) {
      return mapLocal(directionName, slug, "singer");
    },
    db: {
      enabled: true,
      dedupeBy: "title",
      loader: () => loadFromDbByType("singer"),
    },
  },

  // === САЛОНЫ КРАСОТЫ / СВАДЕБНЫЕ САЛОНЫ ===
  {
    slugList: [
      "beauty_salon",
      "beauty-salon",
      "beautySalons",
      "beauty-salons",
      "салоны",
      "свадебные салоны",
    ],
    getLocalItems(directionName, slug) {
      return mapLocal(directionName, slug, "beauty_salon");
    },
    db: {
      enabled: true,
      dedupeBy: "title",
      loader: () => loadFromDbByType("beauty_salon"),
    },
  },
];

/** Поиск категории по slug; по умолчанию — первая (рестораны) */
export function findCategoryBySlug(slug = "") {
  const s = String(slug).trim().toLowerCase();
  return (
    CATEGORY_CONFIG.find((c) =>
      c.slugList.some((x) => String(x).toLowerCase() === s)
    ) || CATEGORY_CONFIG[0]
  );
}
