// src/lib/links.js
export function normalizeType(t = "") {
  const r = String(t).toLowerCase();
  const map = {
    restaurants: "restaurant",
    restaurant: "restaurant",
    musicians: "musician",
    musician: "musician",
    cars: "car",
    car: "car",
    decorations: "decoration",
    decoration: "decoration",
    presenters: "presenter",
    presenter: "presenter",
    photographers: "photographer",
    photographer: "photographer",
    singers: "singer",
    singer: "singer",
    beautysalons: "beauty_salon",
    "beauty-salon": "beauty_salon",
    beauty_salon: "beauty_salon",
    beautysalon: "beauty_salon",
  };
  return map[r] || "restaurant";
}

/**
 * Возвращает href для карточки.
 * item: { id, type, _source?, href? }
 */
export function buildVenueHref(item) {
  // если явно задан href — уважим
  if (item?.href) return item.href;

  const id = item?.id;
  if (!id) return "#";

  const type = normalizeType(item?.type);

  // Для БД-вещей используем универсальный маршрут
  if (item?._source === "db") {
    return `/aurora/${type}/${id}`;
  }

  // Для локальных — можно вернуть старые маршруты (совместимость)
  const legacy =
    {
      restaurant: "/restaurant",
      musician: "/musicians",
      car: "/cars",
      decoration: "/decoration",
      presenter: "/presenters",
      photographer: "/photographers",
      singer: "/singers",
      beauty_salon: "/beautySalons",
    }[type] || "/restaurant";

  // можно и тут сразу на универсальный, но оставим привычный url — он всё равно редиректится
  return `${legacy}/${id}`;
}
