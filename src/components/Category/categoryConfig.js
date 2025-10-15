// categoryConfig.js
import {
  RESTAURANTS,
  MUSICIANS,
  CARS,
  DECORATION,
  PRESENTERS,
  PHOTOGRAPHERS,
  SINGERS,
  BEAUTY_SALON,
} from "../../Category/CategoryVariables";
import { getCategoryItems } from "../../Category/getCategoryItems";
import { supabase } from "../../../lib/supabaseClient";

// утилита: получить cover (image -> poster video)
async function loadFromDbByType(dbType, slugForHref) {
  const { data: venues, error: e1 } = await supabase
    .from("venues")
    .select(
      "id, title, description, address, map_link, phone, hours, created_at"
    )
    .eq("type", dbType)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (e1) throw e1;
  if (!venues?.length) return [];

  const ids = venues.map((v) => v.id);
  const { data: media, error: e2 } = await supabase
    .from("venue_media")
    .select("venue_id, kind, src, poster, sort_order")
    .in("venue_id", ids)
    .order("sort_order", { ascending: true });
  if (e2) throw e2;

  const coverByVenue = new Map();
  for (const m of media || []) {
    if (!coverByVenue.has(m.venue_id) && m.kind === "image" && m.src) {
      coverByVenue.set(m.venue_id, m.src);
    }
  }
  for (const m of media || []) {
    if (!coverByVenue.has(m.venue_id) && m.kind === "video" && m.poster) {
      coverByVenue.set(m.venue_id, m.poster);
    }
  }

  return venues.map((v) => ({
    id: v.id,
    type: dbType, // исходный type из БД
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
    // href всегда на универсальную детальку — slugForHref берём из категории (множественное)
    href: `/aurora/${slugForHref}/${v.id}`,
    _source: "db",
    _key: `${slugForHref}-db-${dbType}-${v.id}`,
  }));
}

// локальные элементы (как раньше)
function getLocal(directionName, slugForHref) {
  const res = getCategoryItems(directionName);
  const arr = Array.isArray(res) ? res : [];
  return arr.map((it) => ({
    ...it,
    _source: "local",
    _key: `${slugForHref}-local-${it.type || slugForHref}-${it.id}`,
  }));
}

/**
 * ВАЖНО:
 * - slug — то, что в URL (/category/<slug>) и в href детальной (/aurora/<slug|type>/<id>)
 * - dbType — ровно то, что лежит в venues.type в БД
 */
export const CATEGORY_CONFIG = [
  {
    slug: "restaurants",
    title: "Рестораны",
    db: {
      enabled: true,
      dedupeBy: "title",
      loader: () => loadFromDbByType("restaurant", "restaurants"),
    },
    getLocalItems: (directionName) => getLocal(directionName, "restaurants"),
  },
  {
    slug: "musicians",
    title: "Музыканты",
    db: {
      enabled: false, // включим позже, когда появится таблица для музыкантов
      dedupeBy: "title",
      loader: async () => [],
    },
    getLocalItems: (directionName) => getLocal(directionName, "musicians"),
  },
  {
    slug: "cars",
    title: "Машины",
    db: {
      enabled: true, // ← ВКЛЮЧЕНО
      dedupeBy: "title",
      loader: () => loadFromDbByType("car", "cars"),
    },
    getLocalItems: (directionName) => getLocal(directionName, "cars"),
  },
  {
    slug: "decoration",
    title: "Оформление",
    db: {
      enabled: false,
      dedupeBy: "title",
      loader: async () => [],
    },
    getLocalItems: (directionName) => getLocal(directionName, "decoration"),
  },
  {
    slug: "presenters",
    title: "Ведущие",
    db: {
      enabled: true, // ← ВКЛЮЧЕНО
      dedupeBy: "title",
      loader: () => loadFromDbByType("presenter", "presenters"),
    },
    getLocalItems: (directionName) => getLocal(directionName, "presenters"),
  },
  {
    slug: "photographers",
    title: "Фотографы",
    db: {
      enabled: false,
      dedupeBy: "title",
      loader: async () => [],
    },
    getLocalItems: (directionName) => getLocal(directionName, "photographers"),
  },
  {
    slug: "singers",
    title: "Певцы",
    db: {
      enabled: false,
      dedupeBy: "title",
      loader: async () => [],
    },
    getLocalItems: (directionName) => getLocal(directionName, "singers"),
  },
  {
    slug: "beautySalons",
    title: "Свадебные салоны",
    db: {
      enabled: true, // ← ВКЛЮЧЕНО
      dedupeBy: "title",
      loader: () => loadFromDbByType("beautySalons", "beautySalons"),
      // ВАЖНО: в БД у тебя type именно "beautySalons" (как в скрине). Оставляем так.
    },
    getLocalItems: (directionName) => getLocal(directionName, "beautySalons"),
  },
];

// хелперы
export function findCategoryBySlug(slug) {
  return CATEGORY_CONFIG.find((c) => c.slug === slug);
}
export function listAllSlugs() {
  return CATEGORY_CONFIG.map((c) => c.slug);
}
