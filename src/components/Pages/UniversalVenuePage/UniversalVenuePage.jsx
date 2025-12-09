// src/components/Pages/UniversalVenuePage/UniversalVenuePage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import AuroraVenue from "@/components/VenueGallery/AuroraVenue";
import { normalizeMedia } from "@/components/VenueGallery/media";

import { supabase } from "@/lib/supabaseClient";

// локальные источники
import { getCategoryItems } from "@/components/Category/getCategoryItems";
import { CategoryVariables } from "@/components/Category/CategoryVariables";

/* ---------- helpers ---------- */

// маленький алиас, чтобы не переименовывать код ниже
const normalizeAuroraMedia = (raw) => normalizeMedia(raw);

// унификация типа (минимально достаточная)
function normalizeType(t) {
  const raw = String(t || "")
    .trim()
    .toLowerCase();
  const map = {
    restaurant: "restaurant",
    restaurants: "restaurant",
    restorany: "restaurant",
    рестораны: "restaurant",

    musician: "musician",
    musicians: "musician",

    car: "car",
    cars: "car",

    decoration: "decoration",
    decorations: "decoration",

    presenter: "presenter",
    presenters: "presenter",

    photographer: "photographer",
    photographers: "photographer",

    singer: "singer",
    singers: "singer",

    beauty_salon: "beauty_salon",
    beautysalon: "beauty_salon",
    "beauty-salon": "beauty_salon",
    beautysalons: "beauty_salon",
  };
  return map[raw] || raw;
}

// собрать медиа из локальной карточки (поддерживает строки и {type:'video',...})
function buildLocalMedia(it) {
  const list = Array.isArray(it.imgList) ? it.imgList : [];
  const head = it.img
    ? [{ type: "image", src: it.img, alt: `${it.title} — обложка` }]
    : [];
  // приводим все элементы в формат нормализатора
  const tail = list
    .map((entry) => {
      if (!entry) return null;
      if (typeof entry === "string") return { type: "image", src: entry };
      if (entry.type === "video" && entry.src) {
        return { type: "video", src: entry.src, poster: entry.poster || "" };
      }
      if (entry.type === "image" && entry.src) {
        return { type: "image", src: entry.src, alt: entry.alt || "" };
      }
      return null;
    })
    .filter(Boolean);
  return [...head, ...tail];
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

/* ---------- page ---------- */

export default function UniversalVenuePage() {
  const { type, id } = useParams();
  const routeType = normalizeType(type);
  const idStr = String(id);

  // 1) сначала пробуем ЛОКАЛЬНУЮ карточку, не завися от type
  const { item: localItem, directionName } = useMemo(
    () => findLocalById(idStr),
    [idStr]
  );

  // 2) состояние для БД-варианта
  const [db, setDb] = useState({
    loading: false,
    error: "",
    venue: null,
    socials: null,
    media: [],
  });

  // грузим из БД только если нет локальной карточки
  useEffect(() => {
    let cancelled = false;

    async function loadFromDb() {
      if (localItem) {
        setDb({
          loading: false,
          error: "",
          venue: null,
          socials: null,
          media: [],
        });
        return;
      }

      const t = routeType;
      try {
        setDb({
          loading: true,
          error: "",
          venue: null,
          socials: null,
          media: [],
        });

        const nId = Number(idStr);
        if (!Number.isFinite(nId))
          throw new Error("Некорректный идентификатор");

        const { data: v, error: e1 } = await supabase
          .from("venues")
          .select("*")
          .eq("id", nId)
          .maybeSingle();
        if (e1) throw e1;
        if (!v) throw new Error("Объявление не найдено");

        if (t && normalizeType(v.type) !== t) {
          throw new Error("Объявление не найдено");
        }

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
  }, [routeType, idStr, localItem]);

  /* ---------- render: 1) локалка ---------- */

  if (localItem) {
    const it = localItem;
    const rawMedia = buildLocalMedia(it);
    const auroraMedia = normalizeAuroraMedia(rawMedia);

    const hero = auroraMedia.find((x) => x.type === "image")?.src || "";

    const venueProps = {
      name: it.title || "",
      categories: [directionName].filter(Boolean),
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
        hero={hero}
        media={auroraMedia}
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

  /* ---------- render: 2) БД ---------- */

  if (db.loading) {
    return (
      <section style={{ padding: 24 }}>
        <p>Загружаем…</p>
      </section>
    );
  }
  if (db.error) {
    return (
      <section style={{ padding: 24 }}>
        <h1>Объявление не найдено</h1>
        <p>{db.error}</p>
      </section>
    );
  }
  if (db.venue) {
    const v = db.venue;
    const m = db.media || [];

    const auroraVenue = {
      name: v.title || "",
      categories: [v.type ? v.type : ""].filter(Boolean),
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

    const auroraMedia = normalizeAuroraMedia(
      m.map((mm) =>
        mm.kind === "video"
          ? { type: "video", src: mm.src, poster: mm.poster || "" }
          : { type: "image", src: mm.src }
      )
    );

    const hero = auroraMedia.find((x) => x.type === "image")?.src || "";

    return (
      <AuroraVenue
        hero={hero}
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

  /* ---------- ничего не нашли ---------- */
  return (
    <section style={{ padding: 24 }}>
      <h1>Объявление не найдено</h1>
    </section>
  );
}
