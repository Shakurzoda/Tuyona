import {
  RESTAURANTS,
  MUSICIANS,
  CARS,
  DECORATION,
  PRESENTERS,
  PHOTOGRAPHERS,
  SINGERS,
  BEAUTY_SALON,
} from "../Pages/CategoryPage/variables";

export const getCategoryItems = (categoryName) => {
  switch (categoryName) {
    case "all":
      return [
        ...RESTAURANTS,
        ...MUSICIANS,
        ...CARS,
        ...DECORATION,
        ...PRESENTERS,
        ...PHOTOGRAPHERS,
        ...SINGERS,
        ...BEAUTY_SALON,
      ];
    case "restaurants":
      return RESTAURANTS;
    case "musicians":
      return MUSICIANS;
    case "cars":
      return CARS;
    case "decoration":
      return DECORATION;
    case "presenters":
      return PRESENTERS;
    case "photographers":
      return PHOTOGRAPHERS;
    case "singers":
      return SINGERS;
    case "beautySalons":
      return BEAUTY_SALON;
    default:
      return []; // 🔑 никогда не undefined
  }
};
