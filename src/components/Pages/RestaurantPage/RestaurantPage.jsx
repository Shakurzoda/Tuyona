import React, { useEffect, useState, useRef } from "react";
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

  // --- простой лоадер страницы: минимум 500мс при загрузке из БД ---
  const [showLoader, setShowLoader] = useState(!local);
  const loaderStartRef = useRef(0);

  useEffect(() => {
    let cancelled = false;

    if (local) {
      // локальные данные — без загрузки
      setDbState((s) => ({ ...s, loading: false, error: "" }));
      setShowLoader(false);
      return;
    }

    // старт загрузки из БД
    setDbState({
      loading: true,
      error: "",
      venue: null,
      socials: null,
      media: [],
    });
    setShowLoader(true);
    loaderStartRef.current = performance.now();

    (async () => {
      try {
        const { data: v, error: e1 } = await supabase
          .from("venues")
          .select("*")
          .eq("id", nId)
          .eq("type", "restaurant")
          .eq("is_published", true)
          .maybeSingle();

        if (e1) throw e1;
        if (!v) throw new Error("Ресторан не найден в БД");

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

        if (!cancelled) {
          setDbState({
            loading: false,
            error: "",
            venue: v,
            socials: s || {},
            media: m || [],
          });
          // удерживаем лоадер минимум 500мс
          const elapsed = performance.now() - loaderStartRef.current;
          const rest = Math.max(0, 500 - elapsed);
          setTimeout(() => !cancelled && setShowLoader(false), rest);
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
          const elapsed = performance.now() - loaderStartRef.current;
          const rest = Math.max(0, 500 - elapsed);
          setTimeout(() => !cancelled && setShowLoader(false), rest);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, local, nId]);

  // === локальные данные ===
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
      <>
        {/* на локальном — лоадер не нужен */}
        <AuroraVenueMedia
          hero={local.img}
          media={media}
          venue={venue}
          onShare={() => {
            if (navigator.share)
              navigator
                .share({ title: local.title, url: window.location.href })
                .catch(() => {});
            else
              alert("Скопируйте ссылку из адресной строки, чтобы поделиться");
          }}
          showShare={true}
          showBook={false}
        />
      </>
    );
  }

  // === БД-вариант ===
  if (dbState.error || !dbState.venue) {
    return (
      <section style={{ padding: 24, minHeight: "60vh" }}>
        {/* простой оверлей-лоадер, покажи через CSS классы .pageLoaderOverlay/.spinner */}
        {showLoader && (
          <div className="pageLoaderOverlay" aria-hidden>
            <div className="spinner" />
          </div>
        )}
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
    <>
      {/* оверлей на время первичной загрузки из БД (минимум 500мс) */}
      {showLoader && (
        <div className="pageLoaderOverlay" aria-hidden>
          <div className="spinner" />
        </div>
      )}

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
    </>
  );
}
