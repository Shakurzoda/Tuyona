import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AuroraVenueMedia from "/src/components/VenueGallery/AuroraVenue"; // проверь путь
import { RESTAURANTS } from "../CategoryPage/variables";
import { supabase } from "/src/lib/supabaseClient.js";
// === helpers ======================================================
const normalizeMediaLocal = (imgList = [], title = "") =>
  imgList
    .map((item, idx) => {
      if (typeof item === "string") {
        return { type: "image", src: item, alt: `${title} — фото ${idx + 1}` };
      }
      if (item && item.type === "video" && typeof item.src === "string") {
        return {
          type: "video",
          poster: item.poster || "",
          sources: [{ src: item.src, type: "video/mp4" }],
          alt: `${title} — видео ${idx + 1}`,
        };
      }
      if (item && item.src) {
        return {
          type: "image",
          src: item.src,
          alt: `${title} — медиа ${idx + 1}`,
        };
      }
      return null;
    })
    .filter(Boolean);

// маппим строки БД → пропсы Aurora
function mapDbVenueToAurora({ venue, socials, media }) {
  const auroraVenue = {
    name: venue.title || "",
    categories: [venue.type || "Ресторан"].filter(Boolean),
    priceLevel: venue.price_level || "",
    openNow: !!venue.open_now,
    hours: venue.hours || "",
    phone: venue.phone || "",
    address: venue.address || "",
    mapLink: venue.map_link || "",
    description: venue.description || "",
    socials: {
      instagram: socials?.instagram || "",
      youtube: socials?.youtube || "",
      telegram: socials?.telegram || "",
      whatsapp: socials?.whatsapp || "",
    },
  };

  const auroraMedia = (media || []).map((m, i) =>
    m.kind === "video"
      ? {
          type: "video",
          poster: m.poster || "",
          sources: [{ src: m.src, type: "video/mp4" }],
          alt: `${venue.title || "Видео"} — ${i + 1}`,
        }
      : {
          type: "image",
          src: m.src,
          alt: `${venue.title || "Фото"} — ${i + 1}`,
        }
  );

  // hero: первая картинка, если есть
  const hero =
    auroraMedia.find((x) => x.type === "image")?.src ||
    auroraMedia[0]?.sources?.[0]?.src ||
    "";

  return { auroraVenue, auroraMedia, hero };
}

// === component ====================================================
export default function RestaurantAuroraPage() {
  const { id } = useParams();
  const nId = Number(id);
  const isNumeric = Number.isFinite(nId);

  // 1) сначала пробуем локальные рестораны
  const local = isNumeric ? RESTAURANTS.find((x) => x.id === nId) : null;

  // 2) состояние для БД-варианта (если локального нет)
  const [dbState, setDbState] = useState({
    loading: !local,
    error: "",
    venue: null,
    socials: null,
    media: [],
  });

  useEffect(() => {
    let cancelled = false;
    if (local) {
      // ничего не грузим — показываем локальные
      setDbState((s) => ({ ...s, loading: false, error: "" }));
      return;
    }
    // грузим из БД
    (async () => {
      try {
        setDbState({
          loading: true,
          error: "",
          venue: null,
          socials: null,
          media: [],
        });

        // venue
        const { data: v, error: e1 } = await supabase
          .from("venues")
          .select("*")
          .eq("id", nId) // id из URL
          .eq("type", "restaurant") // только рестораны
          .eq("is_published", true) // только опубликованные
          .maybeSingle();

        if (e1) throw e1;
        if (!v) throw new Error("Ресторан не найден в БД");

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

        if (!cancelled) {
          setDbState({
            loading: false,
            error: "",
            venue: v,
            socials: s || {},
            media: m || [],
          });
        }
      } catch (err) {
        if (!cancelled) {
          setDbState({
            loading: false,
            error: err.message || "Ошибка загрузки",
            venue: null,
            socials: null,
            media: [],
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, local, nId]);

  // === данные для Aurora: локальные ИЛИ из БД ===
  if (local) {
    const list = normalizeMediaLocal(local.imgList, local.title);
    const hasHero = list.some((m) => m.type === "image" && m.src === local.img);
    const media = hasHero
      ? list
      : [
          { type: "image", src: local.img, alt: `${local.title} — обложка` },
          ...list,
        ];

    const venue = {
      name: local.title,
      categories: ["Ресторан"],
      priceLevel: local.price || "",
      openNow: true,
      hours: local.time || "",
      phone: local.tel || "",
      address: local.street || "",
      mapLink: local.yandexMap || "",
      description: local.description || "",
      socials: {
        instagram: local.instagram || "",
        youtube: local.youtube || "",
        telegram: local.telegram || "",
        whatsapp: local.whatsapp || "",
      },
    };

    return (
      <AuroraVenueMedia
        hero={local.img}
        media={media}
        venue={venue}
        onShare={() => {
          if (navigator.share)
            navigator
              .share({ title: local.title, url: window.location.href })
              .catch(() => {});
          else alert("Скопируйте ссылку из адресной строки, чтобы поделиться");
        }}
        showShare={true}
        showBook={false}
      />
    );
  }

  // БД-вариант
  if (dbState.loading) {
    return (
      <section style={{ padding: 24 }}>
        <p></p>
      </section>
    );
  }
  if (dbState.error || !dbState.venue) {
    return (
      <section style={{ padding: 24 }}>
        <h1>Ресторан не найден</h1>
        <p>{dbState.error || "Проверьте ссылку или вернитесь к списку."}</p>
      </section>
    );
  }

  const { auroraVenue, auroraMedia, hero } = mapDbVenueToAurora({
    venue: dbState.venue,
    socials: dbState.socials,
    media: dbState.media,
  });

  return (
    <AuroraVenueMedia
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
      showShare={true}
      showBook={false}
    />
  );
}
