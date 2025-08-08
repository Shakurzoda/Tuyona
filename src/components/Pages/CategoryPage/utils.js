import {
  RESTAURANTS,
  MUSICIANS,
  CARS,
  DECORATION,
  PRESENTERS,
  PHOTOGRAPHERS,
  SINGERS,
  BEAUTY_SALON
} from "./variables";

export const getCategoryItems = (category) => {
  switch (category) {
    case "Все категории":
      return [...RESTAURANTS, ...MUSICIANS, ...CARS, ...DECORATION, ...PRESENTERS, ...PHOTOGRAPHERS, ...SINGERS, ...BEAUTY_SALON];
    case "Рестораны":
      return RESTAURANTS;
    case "Музыканты":
      return MUSICIANS;
    case "Машины":
      return CARS;
    case "Оформление":
      return DECORATION;
    case "Ведущие":
      return PRESENTERS;
    case "Фотографы":
      return PHOTOGRAPHERS;
    case "Певцы":
      return SINGERS;
    case "Салоны красоты":
      return BEAUTY_SALON;
  }
};
