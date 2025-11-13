// src/components/Pages/CategoryPage/categoryConfig.js
import { supabase } from "@/lib/supabaseClient";
import { getCategoryItems } from "@/components/Category/getCategoryItems";
import { sanitizeMediaUrl } from "@/lib/mediaUrl";

/** helper: формируем cover по медиа (image -> video.poster) */
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

/** Маппим venue + cover в CardItem */
function mapVenueToCardItem(v, coverUrl, slugForHref = "restaurant") {
    return {
        id: v.id,
        type: slugForHref,
        img: sanitizeMediaUrl(coverUrl || ""),
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

/** Универсальный DB-лоадер по типу */
async function loadFromDB(typeKey) {
    const { data: venues, error: e1 } = await supabase
        .from("venues")
        .select("id, title, description, address, map_link, phone, hours, price_level, created_at")
        .eq("type", typeKey)
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
    return venues.map((v) => mapVenueToCardItem(v, covers.get(v.id), typeKey));
}

/** вспомогалка локалки */
function localGetterFactory(fallbackType) {
    return (directionName, slug) => {
        const res = getCategoryItems(directionName);
        const arr = Array.isArray(res) ? res : [];
        return arr.map((it) => ({
            ...it,
            _source: "local",
            _key: `${slug}-local-${it.type || fallbackType}-${it.id}`,
        }));
    };
}

export const CATEGORY_CONFIG = [
    {
        key: "restaurant",
        slugs: ["restaurant", "restaurants", "restorany", "рестораны"],
        title: "Рестораны",
        getLocalItems: localGetterFactory("restaurant"),
        db: { enabled: true, loader: () => loadFromDB("restaurant"), dedupeBy: "title" },
    },
    {
        key: "musician",
        slugs: ["musician", "musicians", "музыканты"],
        title: "Музыканты",
        getLocalItems: localGetterFactory("musicians"),
        db: { enabled: true, loader: () => loadFromDB("musician"), dedupeBy: "title" },
    },
    {
        key: "car",
        slugs: ["car", "cars", "авто", "машины"],
        title: "Авто",
        getLocalItems: localGetterFactory("cars"),
        db: { enabled: true, loader: () => loadFromDB("car"), dedupeBy: "title" },
    },
    {
        key: "decoration",
        slugs: ["decoration", "decorations"],
        title: "Оформление",
        getLocalItems: localGetterFactory("decoration"),
        db: { enabled: true, loader: () => loadFromDB("decoration"), dedupeBy: "title" },
    },
    {
        key: "presenter",
        slugs: ["presenter", "presenters"],
        title: "Ведущие",
        getLocalItems: localGetterFactory("presenters"),
        db: { enabled: true, loader: () => loadFromDB("presenter"), dedupeBy: "title" },
    },
    {
        key: "photographer",
        slugs: ["photographer", "photographers"],
        title: "Фотографы",
        getLocalItems: localGetterFactory("photographers"),
        db: { enabled: true, loader: () => loadFromDB("photographer"), dedupeBy: "title" },
    },
    {
        key: "singer",
        slugs: ["singer", "singers"],
        title: "Певцы",
        getLocalItems: localGetterFactory("singers"),
        db: { enabled: true, loader: () => loadFromDB("singer"), dedupeBy: "title" },
    },
    {
        key: "beauty_salon",
        slugs: ["beauty_salon", "beautysalon", "beautysalons"],
        title: "Свадебные салоны",
        getLocalItems: localGetterFactory("beautySalons"),
        db: { enabled: true, loader: () => loadFromDB("beauty_salon"), dedupeBy: "title" },
    },
];

/** найти конфиг по slug */
export function findCategoryBySlug(slug) {
    const s = String(slug || "").trim().toLowerCase();
    return CATEGORY_CONFIG.find((c) => c.slugs.includes(s)) || CATEGORY_CONFIG[0];
}
