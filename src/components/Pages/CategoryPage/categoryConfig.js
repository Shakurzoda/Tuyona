// src/components/Pages/CategoryPage/categoryConfig.js
import { supabase } from "../../../lib/supabaseClient";
import { getCategoryItems } from "../../Category/getCategoryItems";

/* ---- helpers ---- */

// строим карту обложек: сначала берем image, если нет — poster от video
function buildCoversMap(media = []) {
  const cover = new Map(); // venue_id -> url
  for (const m of media || []) {
    if (!cover.has(m.venue_id) && m.kind === "image" && m.src) {
      cover.set(m.venue_id, m.src);
    }
  }
  for (const m of media || []) {
    if (!cover.has(m.venue_id) && m.kind === "video" && m.poster) {
      cover.set(m.venue_id, m.poster);
    }
  }
  return cover;
}

// Маппим venue + cover -> CardItem (для списка)
function mapVenueToCardItem(v, coverUrl, slugForHref = "restaurant") {
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

/**
 * Фабрика DB-лоадеров.
 * dbType — значение поля venues.type (например, "restaurant", "car", "presenter", "beautySalons").
 * slugForHref — что ставить в href и type карточки (обычно совпадает с dbType).
 */
function createDbLoader(dbType, slugForHref = dbType) {
  return async () => {
    // venues
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
  };
}

/* ---- общий helper локальных карточек ---- */
function makeLocalGetter(fallbackType) {
  return (directionName, slug) => {
    const res = getCategoryItems(directionName);
    const arr = Array.isArray(res) ? res : [];
    return arr.map((it) => ({
      ...it,
      _source: "local",
      _key: `${slug}-local-${it.type || fallbackType}-${it.id}`,
      // важно: ссылка детальной тоже на универсальный роут
      href: `/aurora/${it.type || fallbackType}/${it.id}`,
    }));
  };
}

/* ---- конфиги категорий ---- */

export const CATEGORY_CONFIG = [
  {
    key: "restaurant",
    slugs: ["restaurant", "restaurants", "restorany", "рестораны"],
    title: "Рестораны",
    getLocalItems: makeLocalGetter("restaurant"),
    db: {
      enabled: true,
      loader: createDbLoader("restaurant", "restaurant"),
      dedupeBy: "title",
    },
  },

  {
    key: "musicians",
    slugs: ["musicians", "музыканты", "musician"],
    title: "Музыканты",
    getLocalItems: makeLocalGetter("musicians"),
    // включишь позже, когда мигрируешь
    db: { enabled: false },
  },

  {
    key: "cars",
    slugs: ["cars", "car", "авто", "машины"],
    title: "Авто",
    getLocalItems: makeLocalGetter("cars"),
    db: {
      enabled: true,
      loader: createDbLoader("car", "car"),
      dedupeBy: "title",
    },
  },

  {
    key: "decoration",
    slugs: ["decoration", "оформление", "decorations"],
    title: "Оформление",
    getLocalItems: makeLocalGetter("decoration"),
    db: { enabled: false },
  },

  {
    key: "presenters",
    slugs: ["presenters", "presenter", "ведущие"],
    title: "Ведущие",
    getLocalItems: makeLocalGetter("presenters"),
    db: {
      enabled: true,
      loader: createDbLoader("presenter", "presenter"),
      dedupeBy: "title",
    },
  },

  {
    key: "photographers",
    slugs: ["photographers", "photographer", "фотографы"],
    title: "Фотографы",
    getLocalItems: makeLocalGetter("photographers"),
    db: { enabled: false },
  },

  {
    key: "singers",
    slugs: ["singers", "singer", "певцы"],
    title: "Певцы",
    getLocalItems: makeLocalGetter("singers"),
    db: { enabled: false },
  },

  {
    key: "beautySalons",
    slugs: [
      "beautySalons",
      "beautySalon",
      "свадебные салоны",
      "wedding-salons",
    ],
    title: "Свадебные салоны",
    getLocalItems: makeLocalGetter("beautySalons"),
    db: {
      enabled: true,
      loader: createDbLoader("beautySalons", "beautySalons"),
      dedupeBy: "title",
    },
  },
];

/** найти конфиг по slug */
export function findCategoryBySlug(slug) {
  const s = String(slug || "")
    .trim()
    .toLowerCase();
  return (
    CATEGORY_CONFIG.find((c) =>
      c.slugs.map((x) => String(x).toLowerCase()).includes(s)
    ) || CATEGORY_CONFIG[0]
  );
}
