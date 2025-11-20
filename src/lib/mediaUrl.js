// src/lib/mediaUrl.js

const HTTP_PREFIX = /^http:\/\//i;
const DATA_PREFIX = /^data:/i;
const VALID_SCHEME = /^(https?:)?\/\//i;

/**
 * Делает ссылку безопасной для прод-окружения:
 * - пустые строки -> ''
 * - http:// -> https:// (кроме localhost/127.0.0.1)
 * - тримим пробелы
 */
export function sanitizeMediaUrl(input) {
    if (!input && input !== 0) return "";
    let s = String(input).trim();
    if (!s) return "";

    // data: URI оставляем
    if (DATA_PREFIX.test(s)) return s;

    // относительный/без схемы урл — оставляем
    if (!VALID_SCHEME.test(s)) return s;

    // http -> https (кроме localhost)
    if (HTTP_PREFIX.test(s)) {
        try {
            const u = new URL(s);
            const host = (u.hostname || "").toLowerCase();
            if (host !== "localhost" && host !== "127.0.0.1") {
                u.protocol = "https:";
                return u.toString();
            }
            return s;
        } catch {
            return s.replace(HTTP_PREFIX, "https://");
        }
    }
    return s;
}

/** простая проверка, что урл можно отрендерить */
export function isProbablyRenderableUrl(s) {
    if (!s) return false;
    const v = String(s).trim();
    if (!v) return false;
    if (v === "#" || v === "about:blank") return false;
    return true;
}
