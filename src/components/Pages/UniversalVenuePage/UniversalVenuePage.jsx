// src/components/Pages/UniversalVenuePage/UniversalVenuePage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import AuroraVenue from "@/components/VenueGallery/AuroraVenue";
import { supabase } from "@/lib/supabaseClient";

// локальные источники
import { getCategoryItems } from "@/components/Category/getCategoryItems";
import { CategoryVariables } from "@/components/Category/CategoryVariables";

/* ---------- helpers ---------- */

// Приводим тип из урла к типу в БД (множественное/единственное/варианты)
function mapToDbType(typeFromUrl) {
  const t = String(typeFromUrl || "")
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

    presenter: "presenter",
    presenters: "presenter",

    photographer: "photographer",
    photographers: "photographer",

    singer: "singer",
    singers: "singer",

    beautysalon: "beautySalons",
    beautysalons: "beautySalons",
    beauty_salon: "beautySalons",
  };
  return map[t] || t; // если совпадает 1:1
}

// Приводим любое медиа к формату Aurora
function normalizeMedia(media = []) {
  return (media || []).filter(Boolean).map((m) => {
    // строка → image
    if (typeof m === "string") {
      return { type: "image", src: m, alt: "" };
    }
    // объект video c src или sources
    if (m.type === "video") {
      const sources =
        Array.isArray(m.sources) && m.sources.length
          ? m.sources
          : m.src
          ? [{ src: m.src, type: "video/mp4" }]
          : [];
      return {
        type: "video",
        poster: m.poster || "",
        alt: m.alt || "",
        sources,
      };
    }
    // объект image
    return { type: "image", src: m.src, alt: m.alt || "" };
  });
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

  const dbType = mapToDbType(type);
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

  useEffect(() => {
    let cancelled = false;

    async function loadFromDb() {
      // если нашли локальную — БД не трогаем
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

      const nId = Number(idStr);
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

      // если тип из URL непонятен — тоже выходим
      if (!dbType) {
        setDb({
          loading: false,
          error: "Некорректный тип объявления",
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

        // venues
        const { data: v, error: e1 } = await supabase
          .from("venues")
          .select("*")
          .eq("id", nId)
          .eq("type", dbType)
          .eq("is_published", true)
          .maybeSingle();
        if (e1) throw e1;
        if (!v) throw new Error("Объявление не найдено");

        // socials
        const { data: s, error: e2 } = await supabase
          .from("venue_socials")
          .select("*")
          .eq("venue_id", v.id)
          .maybeSingle();
        if (e2) throw e2;

        // media
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
  }, [dbType, idStr, localItem]);

  /* ---------- render: 1) локалка ---------- */

  if (localItem) {
    const it = localItem;

    // Собираем медиа из img + imgList (поддерживаем строки и объекты видео)
    const list = Array.isArray(it.imgList) ? it.imgList : [];
    const mediaPrepared = [
      it.img
        ? { type: "image", src: it.img, alt: `${it.title} — обложка` }
        : null,
      ...list,
    ].filter(Boolean);

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
        hero={it.img || ""}
        media={normalizeMedia(mediaPrepared)}
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
      categories: [dbType], // можно подставить красивое имя при желании
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

    const auroraMedia = m.map((mm, i) =>
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
    );

    const hero =
      auroraMedia.find((x) => x.type === "image")?.src ||
      auroraMedia[0]?.sources?.[0]?.src ||
      "";

    return (
      <AuroraVenue
        hero={hero}
        media={normalizeMedia(auroraMedia)}
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
