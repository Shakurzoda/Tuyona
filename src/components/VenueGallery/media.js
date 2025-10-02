// src/VenueGallery/AuroraVenue/media.js

/** Приводим список к формату, который ест AuroraVenueMedia */
export function normalizeMedia(media = []) {
  return media.filter(Boolean).map((m) => {
    if (m.type === "video" || m.kind === "video") {
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
    return { type: "image", src: m.src, alt: m.alt || "Фото" };
  });
}
