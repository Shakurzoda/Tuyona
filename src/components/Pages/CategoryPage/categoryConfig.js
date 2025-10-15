import { supabase } from "@/lib/supabaseClient";
import { getCategoryItems } from "@/components/Category/getCategoryItems";

/* ===== helpers ===== */

// сопоставление: ключ категории → алиасы type в БД
const TYPE_ALIASES = {
  restaurant: ["restaurant", "restaurants", "restorany", "рестораны"],
  musicians: ["musicians", "музыканты", "singers", "singer", "музыкант"],
  cars: ["cars", "car", "авто", "машины"],
  decoration: ["decoration", "decorations", "decor", "оформление"],
  presenters: ["presenters", "presenter", "ведущие", "ведущий"],
  photographers: ["photographers", "photographer", "фотографы"],
  singers: ["singers", "singer", "певцы", "певец"],
  beautySalons: [
    "beautySalons",
    "beauty-salons",
    "beauty",
    "salon",
    "салоны",
    "свадебные салоны",
  ],
};

// картинка-обложка: сначала image, если нет — poster у видео
function buildCoversMap(media = []) {
  const cover = new Map(); // venue_id -> url
  for (const m of media) {
    if (!cover.has(m.venue_id) && m.kind === "image" && m.src) {
      cover.set(m.venue_id, m.src);
    }
  }
  for (const m of media) {
    if (!cover.has(m.venue_id) && m.kind === "video" && m.poster) {
      cover.set(m.venue_id, m.poster);
    }
  }
  return cover;
}

// Приводим venue к формату CardItem
function mapVenueToCardItem(v, coverUrl, slugForHref) {
  return {
    id: v.id,
    type: slugForHref,
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
    href: `/aurora/${slugForHref}/${v.id}`,
    _source: "db",
    _key: `db-${slugForHref}-${v.id}`,
  };
}

// Универсальный лоадер для любой категории
async function loadFromDBByType(slugForHref) {
  const aliases = TYPE_ALIASES[slugForHref] || [slugForHref];

  // venues по алиасам
  const { data: venues, error: e1 } = await supabase
    .from("venues")
    .select(
      "id, title, description, address, map_link, phone, hours, created_at, type, is_published"
    )
    .in("type", aliases)
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
    mapVenueToCardItem(v, covers.get(v.id), slugForHref)
  );
}

/* ===== конфиг категорий для CategoryPage ===== */

export const CATEGORY_CONFIG = [
  {
    key: "restaurant",
    slugs: ["restaurant", "restaurants", "restorany", "рестораны"],
    title: "Рестораны",
    getLocalItems: (directionName, slug) => {
      const res = getCategoryItems(directionName);
      const arr = Array.isArray(res) ? res : [];
      return arr.map((it) => ({
        ...it,
        _source: "local",
        _key: `${slug}-local-${it.type || "restaurant"}-${it.id}`,
      }));
    },
    db: {
      enabled: true,
      loader: () => loadFromDBByType("restaurant"),
      dedupeBy: "title",
    },
  },

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
    db: {
      enabled: true,
      loader: () => loadFromDBByType("musicians"),
      dedupeBy: "title",
    },
  },

  {
    key: "cars",
    slugs: ["cars", "авто", "машины"],
    title: "Машины",
    getLocalItems: (directionName, slug) => {
      const res = getCategoryItems(directionName);
      return (Array.isArray(res) ? res : []).map((it) => ({
        ...it,
        _source: "local",
        _key: `${slug}-local-${it.type || "cars"}-${it.id}`,
      }));
    },
    db: {
      enabled: true,
      loader: () => loadFromDBByType("cars"),
      dedupeBy: "title",
    },
  },

  {
    key: "decoration",
    slugs: ["decoration", "оформление"],
    title: "Оформление",
    getLocalItems: (directionName, slug) => {
      const res = getCategoryItems(directionName);
      return (Array.isArray(res) ? res : []).map((it) => ({
        ...it,
        _source: "local",
        _key: `${slug}-local-${it.type || "decoration"}-${it.id}`,
      }));
    },
    db: {
      enabled: true,
      loader: () => loadFromDBByType("decoration"),
      dedupeBy: "title",
    },
  },

  {
    key: "presenters",
    slugs: ["presenters", "ведущие"],
    title: "Ведущие",
    getLocalItems: (directionName, slug) => {
      const res = getCategoryItems(directionName);
      return (Array.isArray(res) ? res : []).map((it) => ({
        ...it,
        _source: "local",
        _key: `${slug}-local-${it.type || "presenters"}-${it.id}`,
      }));
    },
    db: {
      enabled: true,
      loader: () => loadFromDBByType("presenters"),
      dedupeBy: "title",
    },
  },

  {
    key: "photographers",
    slugs: ["photographers", "фотографы"],
    title: "Фотографы",
    getLocalItems: (directionName, slug) => {
      const res = getCategoryItems(directionName);
      return (Array.isArray(res) ? res : []).map((it) => ({
        ...it,
        _source: "local",
        _key: `${slug}-local-${it.type || "photographers"}-${it.id}`,
      }));
    },
    db: {
      enabled: true,
      loader: () => loadFromDBByType("photographers"),
      dedupeBy: "title",
    },
  },

  {
    key: "singers",
    slugs: ["singers", "певцы"],
    title: "Певцы",
    getLocalItems: (directionName, slug) => {
      const res = getCategoryItems(directionName);
      return (Array.isArray(res) ? res : []).map((it) => ({
        ...it,
        _source: "local",
        _key: `${slug}-local-${it.type || "singers"}-${it.id}`,
      }));
    },
    db: {
      enabled: true,
      loader: () => loadFromDBByType("singers"),
      dedupeBy: "title",
    },
  },

  {
    key: "beautySalons",
    slugs: ["beautySalons", "свадебные салоны", "салоны"],
    title: "Свадебные салоны",
    getLocalItems: (directionName, slug) => {
      const res = getCategoryItems(directionName);
      return (Array.isArray(res) ? res : []).map((it) => ({
        ...it,
        _source: "local",
        _key: `${slug}-local-${it.type || "beautySalons"}-${it.id}`,
      }));
    },
    db: {
      enabled: true,
      loader: () => loadFromDBByType("beautySalons"),
      dedupeBy: "title",
    },
  },
];

/* найти конфиг по slug */
export function findCategoryBySlug(slug) {
  const s = String(slug || "")
    .trim()
    .toLowerCase();
  return (
    CATEGORY_CONFIG.find((c) =>
      c.slugs.some((x) => String(x).toLowerCase() === s)
    ) || CATEGORY_CONFIG[0]
  );
}
