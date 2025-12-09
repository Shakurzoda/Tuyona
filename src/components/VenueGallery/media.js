// src/components/VenueGallery/media.js
import { sanitizeMediaUrl, isProbablyRenderableUrl } from "@/lib/mediaUrl";

/** Постер по умолчанию для ВСЕХ видео без собственного постера */
export const DEFAULT_VIDEO_POSTER =
  "https://mocrevywsynniwhoshtb.supabase.co/storage/v1/object/public/media/drafts/8ba66a22-5296-4e31-be6c-626296547839/posters/Def_Poster.png";

/**
 * Единый нормализатор медиа.
 *
 * Поддерживает ОБА формата:
 *  - { type: "image" | "video", ... }
 *  - { kind: "image" | "video", ... }   // так приходит из Supabase
 *
 * Для всех видео, у которых нет poster, подставляет DEFAULT_VIDEO_POSTER.
 * Убирает дубли по src.
 */
export function normalizeMedia(raw = []) {
  const out = [];
  const seen = new Set();

  for (const m of raw || []) {
    if (!m) continue;

    // строка -> картинка
    if (typeof m === "string") {
      const src = sanitizeMediaUrl(m);
      if (!isProbablyRenderableUrl(src)) continue;

      const key = `img:${src}`;
      if (seen.has(key)) continue;
      seen.add(key);

      out.push({ type: "image", src, alt: "" });
      continue;
    }

    const kind = (m.type || m.kind || "").toLowerCase();

    // ----- IMAGE -----
    if (kind === "image") {
      const src = sanitizeMediaUrl(m.src || "");
      if (!isProbablyRenderableUrl(src)) continue;

      const key = `img:${src}`;
      if (seen.has(key)) continue;
      seen.add(key);

      out.push({ type: "image", src, alt: m.alt || "" });
      continue;
    }

    // ----- VIDEO -----
    if (kind === "video") {
      // варианты:
      // 1) { kind:"video", src: "..." }
      // 2) { type:"video", sources:[{src,type},...] }
      let poster = sanitizeMediaUrl(m.poster || "");

      const sources =
        Array.isArray(m.sources) && m.sources.length
          ? m.sources
          : m.src
          ? [{ src: m.src, type: "video/mp4" }]
          : [];

      const fixedSources = sources
        .map((s) => ({
          src: sanitizeMediaUrl(s?.src || ""),
          type: s?.type || "video/mp4",
        }))
        .filter((s) => isProbablyRenderableUrl(s.src));

      if (!fixedSources.length) continue;

      // если постер отсутствует / кривая ссылка — ставим дефолтный
      if (!isProbablyRenderableUrl(poster)) {
        poster = DEFAULT_VIDEO_POSTER;
      }

      const mainSrc = fixedSources[0].src;
      const key = `vid:${mainSrc}`;
      if (seen.has(key)) continue;
      seen.add(key);

      out.push({
        type: "video",
        poster,
        sources: fixedSources.map((x) => ({ ...x })),
        alt: m.alt || "",
      });
    }
  }

  return out;
}
