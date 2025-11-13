// src/lib/mediaUrl.js
const URL_OK_PREFIX = /^(https?:\/\/|data:|blob:)/i;

/**
 * Возвращает валидный URL (https/data/blob) или null.
 * Дополнительно правит Cloudinary c http -> https (фикс mixed content).
 */
export function sanitizeMediaUrl(u) {
    const s = String(u || "").trim();
    if (!s) return null;
    if (!URL_OK_PREFIX.test(s)) return null;

    // Cloudinary иногда приходит по http — принудительно делаем https
    if (s.startsWith("http://res.cloudinary.com")) {
        return s.replace("http://", "https://");
    }
    return s;
}

/**
 * Нормализует произвольный список медиа к формату Aurora:
 *  - строки -> image
 *  - видео с src -> sources[ {src,type} ]
 *  - выбрасывает элементы без валидных ссылок
 */
export function sanitizeAuroraMedia(media = []) {
    const out = [];
    for (const m of media || []) {
        if (!m) continue;

        // Строка -> картинка
        if (typeof m === "string") {
            const src = sanitizeMediaUrl(m);
            if (src) out.push({ type: "image", src });
            continue;
        }

        // Картинка
        if (m.type === "image") {
            const src = sanitizeMediaUrl(m.src);
            if (src) out.push({ type: "image", src, alt: m.alt || "" });
            continue;
        }

        // Видео
        if (m.type === "video") {
            const poster = sanitizeMediaUrl(m.poster || "") || undefined;
            let sources = Array.isArray(m.sources) ? m.sources : (m.src ? [{ src: m.src }] : []);
            sources = (sources || [])
                .map((s) => ({ src: sanitizeMediaUrl(s?.src), type: s?.type || "video/mp4" }))
                .filter((s) => !!s.src);

            if (sources.length) {
                out.push({ type: "video", poster, sources, alt: m.alt || "" });
            }
            continue;
        }

        // Fallback: пробуем как картинку
        const src = sanitizeMediaUrl(m.src);
        if (src) out.push({ type: "image", src, alt: m.alt || "" });
    }
    return out;
}
