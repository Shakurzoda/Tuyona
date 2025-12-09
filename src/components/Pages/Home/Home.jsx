// Home.jsx
import { memo, useMemo } from "react";
import image from "/src/assets/24122343_bwink_ppl_11_single_08.webp";
import styles from "./Home.module.css";
import MyButton from "../../MyButton/MyButton";
import Section from "../../Section/Section";
import ServicesCard from "../../ServicesCard/ServicesCard";
import servicesReviewsIMG from "/src/assets/ReviewsIMG1.webp";
import servicesReviewsIMG2 from "/src/assets/ReviewsIMG2.webp";
import resturantImg from "/src/assets/9000463_4067778.svg";
import singerImg from "/src/assets/violin-orchestra-concept-illustration_114360-17225.jpg";
import registrationImg from "/src/assets/8715396.png";

const CATEGORY_CARDS = [
  {
    img: resturantImg,
    title: "Рестораны",
    body: "1000 и 1 ресторан для проведения вашей свадьбы",
    alt: "Иконка ресторана",
  },
  {
    img: singerImg,
    title: "Певцы",
    body: "Изысканные певцы для вашего свадебного вечера",
    alt: "Иллюстрация певца и скрипки",
  },
  {
    img: registrationImg,
    title: "Оформление",
    body: "Сказочные оформления для вашей свадьбы",
    alt: "Иконка оформления зала",
  },
];

function Home() {
  // на случай будущих вычислений — мемоизируем список карточек
  const cards = useMemo(() => CATEGORY_CARDS, []);

  return (
    <section className={styles.home} aria-labelledby="home-title">
      <div className={styles.home__content}>
        <div className={styles.home__content__text}>
          <div className={styles.home__content__text__title}>
            {" "}
            <p className={styles.txtPink}>Свадьба Вашей Мечты Ждет Вас</p>{" "}
          </div>
          <div className={styles.home__content__text__desc}>
            <h2 className={styles.home__content__text__desc__title}>
              Добро пожаловать в Туйона
            </h2>
            <p className={styles.home__content__text__desc__desc}>
              Tuyuona — ваша онлайн-площадка для свадебных услуг. Здесь вы
              найдёте всё необходимое для организации свадьбы: от
              профессиональных фотографов и стилистов до свадебного кортежа!
            </p>
          </div>

          <div className={styles.home__content__text__btn}>
            <MyButton color="green" size="medium" href="/category">
              Категории
            </MyButton>
            <MyButton color="white" size="medium" href="#about">
              О нас
            </MyButton>
          </div>
        </div>

        <div className={styles.home__content__img}>
          <img
            src={image}
            alt="Счастливая пара — иллюстрация на главной"
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
        </div>
      </div>

      <Section />

      <section className={styles.servicesContent} aria-labelledby="cats-title">
        <h2 id="cats-title" className={styles.card__title}>
          Категории
        </h2>

        <div className={styles.servicesCards}>
          {cards.map((card) => (
            <ServicesCard key={card.title} card={card} />
          ))}
        </div>
      </section>

      <section
        className={styles.servicesReviews}
        aria-label="Призыв к действию"
      >
        <div className={styles.servicesReviews__content}>
          <div className={styles.servicesReviews__img}>
            <img
              src={servicesReviewsIMG}
              alt="Счастливая пара на свадьбе"
              loading="lazy"
              decoding="async"
            />
          </div>

          <div className={styles.servicesReviews__text}>
            <h2 className={styles.servicesReviews__text__title}>
              Начните планировать свадьбу <br /> своей мечты уже сегодня!
            </h2>
            <MyButton color="pink" size="medium" href="/category">
              Категории
            </MyButton>
          </div>

          <div className={styles.servicesReviews__imG}>
            <img
              src={servicesReviewsIMG2}
              alt="Сервированный стол на свадебном банкете"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </section>
    </section>
  );
}

export default memo(Home);
