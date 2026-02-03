// src/components/Category/categoryConfig.js
import { supabase } from "@/lib/supabaseClient";
import { getCategoryItems } from "@/components/Category/getCategoryItems";

/* ===========================
   Канонические типы и алиасы
   =========================== */

const TYPE_DEFS = [
    { key: "restaurant", slugs: ["restaurant", "restaurants", "restorany", "рестораны"] },
    { key: "musician",   slugs: ["musician", "musicians", "музыканты"] },
    { key: "car",        slugs: ["car", "cars", "авто", "машины"] },
    { key: "decoration", slugs: ["decoration", "decorations", "оформление", "decor"] },
    { key: "presenter",  slugs: ["presenter", "presenters", "ведущие", "ведущий"] },
    { key: "photographer", slugs: ["photographer", "photographers", "фотографы", "фото", "видео"] },
    { key: "singer",     slugs: ["singer", "singers", "певцы", "певец"] },
    { key: "beautysalons", slugs: ["beauty_salon", "beautysalons", "beauty-salon", "beautySalons", "салоны", "свадебные салоны"] },
];

const ALIAS_TO_KEY = new Map();
for (const def of TYPE_DEFS) {
    for (const s of def.slugs) ALIAS_TO_KEY.set(String(s).toLowerCase(), def.key);
    // сам ключ также является валидным слагом
    ALIAS_TO_KEY.set(def.key, def.key);
}

export function normalizeCategoryType(slug) {
    if (!slug) return "";
    return ALIAS_TO_KEY.get(String(slug).trim().toLowerCase()) || "";
}

export function allCategoryDefs() {
    return TYPE_DEFS.slice();
}

/* ===========================
   Карточки: локальные + БД
   =========================== */

// helper: подобрать cover по media (image -> video.poster)
function buildCoversMap(media = []) {
    const cover = new Map(); // venue_id -> url
    for (const m of media) {
        if (!cover.has(m.venue_id) && m.kind === "image" && m.src) cover.set(m.venue_id, m.src);
    }
    for (const m of media) {
        if (!cover.has(m.venue_id) && m.kind === "video" && m.poster) cover.set(m.venue_id, m.poster);
    }
    return cover;
}

/** Преобразование venue из БД в формат CardItem */
function mapVenueToCardItem(v, coverUrl, typeForHref = "restaurant") {
    const canonical = normalizeCategoryType(typeForHref) || "restaurant";
    return {
        id: v.id,
        type: canonical,
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
        href: `/aurora/${canonical}/${v.id}`, // единый формат
        _source: "db",
        _key: `db-${canonical}-${v.id}`,
    };
}

/* Пример DB-лоадера: restaurants (включайте другие по мере миграции) */
async function loadFromDB_ByType(canonicalType) {
    // Включены к БД только те типы, которые вы добавите здесь:
    const DB_ENABLED = new Set(["restaurant" /*, "musician", "car", ... */]);

    if (!DB_ENABLED.has(canonicalType)) return [];

    const { data: venues, error: e1 } = await supabase
        .from("venues")
        .select("id, title, description, address, map_link, phone, hours, created_at")
        .eq("type", canonicalType)
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

    const covers = buildCoversMap(media || []);
    return venues.map((v) => mapVenueToCardItem(v, covers.get(v.id), canonicalType));
}

export const CATEGORY_CONFIG = TYPE_DEFS.map((def) => ({
    key: def.key,
    slugs: def.slugs,
    title: (() => {
        switch (def.key) {
            case "restaurant": return "Рестораны";
            case "musician": return "Музыканты";
            case "car": return "Авто";
            case "decoration": return "Оформление";
            case "presenter": return "Ведущие";
            case "photographer": return "Фотографы";
            case "singer": return "Певцы";
            case "beautysalons": return "Свадебные салоны";
            default: return def.key;
        }
    })(),
    // локальные (из variables.js)
    getLocalItems: (directionName, slug) => {
        const res = getCategoryItems(directionName);
        const arr = Array.isArray(res) ? res : [];
        const canonical = normalizeCategoryType(def.key);
        return arr.map((it) => ({
            ...it,
            type: canonical,
            href: `/aurora/${canonical}/${it.id}`,
            _source: "local",
            _key: `${canonical}-local-${it.id}`,
        }));
    },
    // поддержка БД (по мере миграции включайте тип здесь)
    db: {
        enabled: ["restaurant" /*, "musician", "car", ... */].includes(def.key),
        loader: () => loadFromDB_ByType(def.key),
        dedupeBy: "title",
    },
}));

/** найти конфиг по slug */
export function findCategoryBySlug(slug) {
    const s = String(slug || "").trim().toLowerCase();
    return CATEGORY_CONFIG.find((c) => c.slugs.map((x) => x.toLowerCase()).includes(s)) || CATEGORY_CONFIG[0];
}

/** Набор типов, у которых включено подключение к БД */
export const CATEGORY_TYPES_WITH_DB = new Set(
    CATEGORY_CONFIG.filter((c) => c.db?.enabled).map((c) => c.key)
);
