// src/components/Pages/UniversalVenuePage/UniversalVenuePage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import AuroraVenue from "@/components/VenueGallery/AuroraVenue";
import { supabase } from "@/lib/supabaseClient";

import { getCategoryItems } from "@/components/Category/getCategoryItems";
import { CategoryVariables } from "@/components/Category/CategoryVariables";
import { sanitizeAuroraMedia } from "@/lib/mediaUrl";

// --- helpers ---

function normalizeType(t) {
    const raw = String(t || "").trim().toLowerCase();
    if (["restaurant", "restaurants", "restorany", "рестораны"].includes(raw)) return "restaurant";
    return raw;
}

// Ищем локальную карточку по id среди всех направлений
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
            return Number.isFinite(localNum) && Number.isFinite(urlNum) && localNum === urlNum;
        });
        if (found) return { item: found, directionName: dirName };
    }
    return { item: null, directionName: "" };
}

export default function UniversalVenuePage() {
    const { type, id } = useParams();
    const routeType = normalizeType(type);
    const idStr = String(id);

    // 1) пытаемся отрисовать локальную карточку
    const { item: localItem, directionName } = useMemo(() => findLocalById(idStr), [idStr]);

    // 2) состояние БД (используем только для restaurant, если локалки нет)
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
            if (routeType !== "restaurant" || localItem) {
                setDb({ loading: false, error: "", venue: null, socials: null, media: [] });
                return;
            }

            try {
                setDb({ loading: true, error: "", venue: null, socials: null, media: [] });

                const nId = Number(idStr);
                if (!Number.isFinite(nId)) throw new Error("Некорректный идентификатор");

                const { data: v, error: e1 } = await supabase
                    .from("venues")
                    .select("*")
                    .eq("id", nId)
                    .eq("type", "restaurant")
                    .eq("is_published", true)
                    .maybeSingle();
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

                if (!cancelled) setDb({ loading: false, error: "", venue: v, socials: s || {}, media: m || [] });
            } catch (err) {
                if (!cancelled) setDb({ loading: false, error: err?.message || "Ошибка загрузки", venue: null, socials: null, media: [] });
            }
        }

        loadFromDb();
        return () => {
            cancelled = true;
        };
    }, [routeType, idStr, localItem]);

    // ---------- 1) ЛОКАЛЬНАЯ карточка ----------
    if (localItem) {
        const it = localItem;

        // Собираем сырые медиа из img + imgList
        const rawMedia = [
            it.img ? { type: "image", src: it.img, alt: `${it.title} — обложка` } : null,
            ...(Array.isArray(it.imgList) ? it.imgList : []),
        ].filter(Boolean);

        // Нормализуем/санитизируем
        const media = sanitizeAuroraMedia(rawMedia);

        // hero — только реальный url (undefined если нет)
        const hero = media.find((x) => x.type === "image")?.src || undefined;

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
                media={media}
                venue={venueProps}
                onShare={() => {
                    if (navigator.share)
                        navigator.share({ title: it.title, url: window.location.href }).catch(() => {});
                    else alert("Скопируйте ссылку из адресной строки, чтобы поделиться");
                }}
                showShare
                showBook={false}
            />
        );
    }

    // ---------- 2) БД ресторан ----------
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

        const auroraVenue = {
            name: v.title || "",
            categories: ["Рестораны"],
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

        // превращаем venue_media в формат Aurora + санитайз
        const auroraMedia = sanitizeAuroraMedia(
            (db.media || []).map((mm, i) =>
                mm.kind === "video"
                    ? {
                        type: "video",
                        poster: mm.poster,
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

        const hero = auroraMedia.find((x) => x.type === "image")?.src || undefined;

        return (
            <AuroraVenue
                hero={hero}
                media={auroraMedia}
                venue={auroraVenue}
                onShare={() => {
                    if (navigator.share)
                        navigator.share({ title: auroraVenue.name, url: window.location.href }).catch(() => {});
                    else alert("Скопируйте ссылку из адресной строки, чтобы поделиться");
                }}
                showShare
                showBook={false}
            />
        );
    }

    // ---------- Ничего не нашли ----------
    return (
        <section style={{ padding: 24 }}>
            <h1>Объявление не найдено</h1>
        </section>
    );
}
