import {
  RESTAURANTS,
  MUSICIANS,
  CARS,
  DECORATION,
  PRESENTERS,
  PHOTOGRAPHERS,
  SINGERS,
  BEAUTYSALONS,
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
        ...BEAUTYSALONS,
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
    case "beautysalons":
      return BEAUTYSALONS;
    default:
      return []; // 🔑 никогда не undefined
  }
};
