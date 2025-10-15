// src/components/Pages/UniversalVenuePage/UniversalVenuePage.jsx
import React, { useEffect, useMemo, useState, useRef } from "react";
import { useParams } from "react-router-dom";

import AuroraVenue from "@/components/VenueGallery/AuroraVenue";
import { supabase } from "@/lib/supabaseClient";

// локальные источники
import { getCategoryItems } from "@/components/Category/getCategoryItems";
import { CategoryVariables } from "@/components/Category/CategoryVariables";

/* ================= Helpers ================= */

const TYPE_ALIASES = {
  restaurant: ["restaurant", "restaurants", "restorany", "рестораны"],
  musicians: ["musicians", "музыканты", "singer", "singers", "музыкант"],
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

const TYPE_TITLES = {
  restaurant: "Рестораны",
  musicians: "Музыканты",
  cars: "Машины",
  decoration: "Оформление",
  presenters: "Ведущие",
  photographers: "Фотографы",
  singers: "Певцы",
  beautySalons: "Свадебные салоны",
};

function normalizeType(t) {
  const raw = String(t || "")
    .trim()
    .toLowerCase();
  for (const key of Object.keys(TYPE_ALIASES)) {
    if (TYPE_ALIASES[key].map((x) => x.toLowerCase()).includes(raw)) {
      return key;
    }
  }
  // если ничего не совпало — вернём, что дали (на всякий)
  return raw || "restaurant";
}

// приводим любой формат медиа к формату Aurora
function normalizeMedia(media = []) {
  return (media || []).filter(Boolean).map((m, i) => {
    // строка -> картинка
    if (typeof m === "string") {
      return { type: "image", src: m, alt: `Фото ${i + 1}` };
    }
    // видео в “коротком” виде
    if (m.type === "video" && m.src && !m.sources) {
      return {
        type: "video",
        poster: m.poster || "",
        alt: m.alt || `Видео ${i + 1}`,
        sources: [{ src: m.src, type: "video/mp4" }],
      };
    }
    // полноценный видео-объект
    if (m.type === "video") {
      return {
        type: "video",
        poster: m.poster || "",
        alt: m.alt || `Видео ${i + 1}`,
        sources: Array.isArray(m.sources) ? m.sources : [],
      };
    }
    // картинка-объект
    return { type: "image", src: m.src, alt: m.alt || `Фото ${i + 1}` };
  });
}

function firstHero(media = []) {
  const img = media.find((x) => x.type === "image");
  if (img) return img.src || "";
  const v = media.find((x) => x.type === "video");
  if (v?.sources?.[0]?.src) return v.sources[0].src;
  return "";
}

// Ищем локальную карточку по id СРЕДИ ВСЕХ направлений
function findLocalById(idStr) {
  const listOfDirections = Array.isArray(CategoryVariables)
    ? CategoryVariables.map((d) => d.directionName)
    : [];

  for (const dirName of listOfDirections) {
    const items = getCategoryItems(dirName) || [];
    const found = items.find((x) => {
      const localStr = String(x?.id);
      if (localStr === idStr) return true;
      const localNum = Number(x?.id);
      const urlNum = Number(idStr);
      return (
        Number.isFinite(localNum) &&
        Number.isFinite(urlNum) &&
        localNum === urlNum
      );
    });
    if (found) {
      return { item: found, directionName: dirName };
    }
  }
  return { item: null, directionName: "" };
}

/* ================= Page ================= */

export default function UniversalVenuePage() {
  const { type, id } = useParams();
  const routeType = normalizeType(type);
  const idStr = String(id);
  const nId = Number(idStr);

  // 1) сначала пробуем ЛОКАЛЬНУЮ карточку, не завися от type
  const { item: localItem, directionName } = useMemo(
    () => findLocalById(idStr),
    [idStr]
  );

  // 2) БД-состояние
  const [db, setDb] = useState({
    loading: !localItem,
    error: "",
    venue: null,
    socials: null,
    media: [],
  });

  // грузим из БД, если локальной карточки нет
  useEffect(() => {
    let cancelled = false;

    async function loadFromDb() {
      if (localItem) {
        setDb((s) => ({ ...s, loading: false, error: "" }));
        return;
      }
      if (!Number.isFinite(nId)) {
        setDb({
          loading: false,
          error: "Некорректный идентификатор",
          venue: null,
          socials: null,
          media: [],
        });
        return;
      }

      try {
        setDb({
          loading: true,
          error: "",
          venue: null,
          socials: null,
          media: [],
        });

        // Фильтр по алиасам типа
        const aliases = TYPE_ALIASES[routeType] || [routeType];

        const q = supabase
          .from("venues")
          .select("*")
          .eq("id", nId)
          .eq("is_published", true);

        // если есть алиасы — фильтруем по ним
        if (aliases?.length) q.in("type", aliases);

        const { data: v, error: e1 } = await q.maybeSingle();
        if (e1) throw e1;
        if (!v) throw new Error("Объявление не найдено");

        const { data: s, error: e2 } = await supabase
          .from("venue_socials")
          .select("*")
          .eq("venue_id", v.id)
          .maybeSingle();
        if (e2) throw e2;

        const { data: m, error: e3 } = await supabase
          .from("venue_media")
          .select("*")
          .eq("venue_id", v.id)
          .order("sort_order", { ascending: true });
        if (e3) throw e3;

        if (!cancelled)
          setDb({
            loading: false,
            error: "",
            venue: v,
            socials: s || {},
            media: m || [],
          });
      } catch (err) {
        if (!cancelled)
          setDb({
            loading: false,
            error: err?.message || "Ошибка загрузки",
            venue: null,
            socials: null,
            media: [],
          });
      }
    }

    loadFromDb();
    return () => {
      cancelled = true;
    };
  }, [routeType, nId, localItem]);

  /* ========== Renders ========== */

  // ---------- 1) Локалка ----------
  if (localItem) {
    const it = localItem;

    // Собираем медиа из img + imgList (поддержка смешанного формата)
    const list = Array.isArray(it.imgList) ? it.imgList : [];
    const mediaPrepared = [
      it.img
        ? { type: "image", src: it.img, alt: `${it.title} — обложка` }
        : null,
      ...list,
    ].filter(Boolean);

    const mediaAurora = normalizeMedia(mediaPrepared);

    const venueProps = {
      name: it.title || "",
      categories: [TYPE_TITLES[routeType] || routeType].filter(Boolean),
      priceLevel: it.price || "",
      openNow: true,
      hours: it.time || "",
      phone: it.tel || "",
      address: it.street || "",
      mapLink: it.yandexMap || "",
      description: it.description || "",
      socials: {
        instagram: it.instagram || "",
        youtube: it.youtube || "",
        telegram: it.telegram || "",
        whatsapp: it.whatsapp || "",
      },
    };

    return (
      <AuroraVenue
        hero={firstHero(mediaAurora)}
        media={mediaAurora}
        venue={venueProps}
        onShare={() => {
          if (navigator.share)
            navigator
              .share({ title: it.title, url: window.location.href })
              .catch(() => {});
          else alert("Скопируйте ссылку из адресной строки, чтобы поделиться");
        }}
        showShare
        showBook={false}
      />
    );
  }

  // ---------- 2) БД ----------
  if (db.loading) {
    return (
      <section style={{ padding: 24 }}>
        <p>Загружаем…</p>
      </section>
    );
  }
  if (db.error || !db.venue) {
    return (
      <section style={{ padding: 24 }}>
        <h1>Объявление не найдено</h1>
        <p>{db.error || "Проверьте ссылку или вернитесь к списку."}</p>
      </section>
    );
  }

  // map DB → Aurora
  const v = db.venue;
  const m = db.media || [];

  const auroraVenue = {
    name: v.title || "",
    categories: [TYPE_TITLES[routeType] || routeType].filter(Boolean),
    priceLevel: v.price_level || "",
    openNow: !!v.open_now,
    hours: v.hours || "",
    phone: v.phone || "",
    address: v.address || "",
    mapLink: v.map_link || "",
    description: v.description || "",
    socials: {
      instagram: db.socials?.instagram || "",
      youtube: db.socials?.youtube || "",
      telegram: db.socials?.telegram || "",
      whatsapp: db.socials?.whatsapp || "",
    },
  };

  const auroraMedia = normalizeMedia(
    m.map((mm, i) =>
      mm.kind === "video"
        ? {
            type: "video",
            poster: mm.poster || "",
            sources: [{ src: mm.src, type: "video/mp4" }],
            alt: `${v.title || "Видео"} — ${i + 1}`,
          }
        : {
            type: "image",
            src: mm.src,
            alt: `${v.title || "Фото"} — ${i + 1}`,
          }
    )
  );

  return (
    <AuroraVenue
      hero={firstHero(auroraMedia)}
      media={auroraMedia}
      venue={auroraVenue}
      onShare={() => {
        if (navigator.share)
          navigator
            .share({ title: auroraVenue.name, url: window.location.href })
            .catch(() => {});
        else alert("Скопируйте ссылку из адресной строки, чтобы поделиться");
      }}
      showShare
      showBook={false}
    />
  );
}
