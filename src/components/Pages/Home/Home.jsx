import image from "/src/assets/24122343_bwink_ppl_11_single_08.svg";
import styles from "./Home.module.css";
import MyButton from "../../MyButton/MyButton";
import Section from "../../Section/Section";
import ServicesCard from "../../ServicesCard/ServicesCard";
import servicesReviewsIMG from "/src/assets/ReviewsIMG1.webp";
import servicesReviewsIMG2 from "/src/assets/ReviewsIMG2.webp";
import marksImg from "/src/assets/quotation-marks-svgrepo-com.svg";
import resturantImg from "/src/assets/9000463_4067778.svg";
import singerImg from "/src/assets/7097523.png";
import registrationImg from "/src/assets/8715396.png";
import { Link } from "react-router-dom";
import Category from './../../Category/Category';

const Home = () => {
  return (
    <section className={styles.home}>
      <div className={styles.home__content}>
        <div className={styles.home__content__text}>
          <div className={styles.home__content__text__title}>
            <p className={styles.txtPink}>Свадьба Вашей Мечты Ждет Вас</p>
          </div>
          <div className={styles.home__content__text__desc}>
            <div className={styles.home__content__text__desc__title}>
              <p>Добро Пожаловать в Туйона</p>
            </div>
            <div className={styles.home__content__text__desc__desc}>
              <p>
                Tyuona - ваша онлайн-площадка для свадебных товаров и услуг.
                Здесь вы найдете всё необходимое для организации свадьбы: от
                профессиональных фотографов и стилистов до свадебного кортежа!
              </p>
            </div>
          </div>
          <div className={styles.home__content__text__btn}>
            <MyButton color="pink" size="medium">
              <Link to="/category">Все категории</Link>
            </MyButton>
            <MyButton color="white" size="medium">
              О нас
            </MyButton>
          </div>
        </div>
        <div className={styles.home__content__img}>
          <img src={image} alt="wedding" />
        </div>
      </div>

      <Section />

      <div className={styles.servicesContent}>
        <div className={styles.card__title}>
          <p>Категории</p>
        </div>
        <div className={styles.servicesCards}>
          <ServicesCard
            card={{
              img: resturantImg,
              title: "Рестораны",
              body: "1000 и 1 ресторан для проведения вашей свадьбы",
            }}
          />
          <ServicesCard
            card={{
              img: singerImg,
              title: "Певцы",
              body: "Изысанынные певцы для вашего свадебного вечера",
            }}
          />
          <ServicesCard
            card={{
              img: registrationImg,
              title: "Оформление",
              body: "Сазочные оформления для вашей свадьбы",
            }}
          />
        </div>
      </div>

      <div className={styles.servicesReviews}>
        <div className={styles.servicesReviews__content}>
          <div className={styles.servicesReviews__img}>
            <img src={servicesReviewsIMG} alt="" />
          </div>
          <div className={styles.servicesReviews__text}>
            <div className={styles.servicesReviews__text__title}>
              <p>
                Начните планировать свадьбу <br /> Своей мечты уже сегодня!
              </p>
            </div>
            <MyButton color="pink" size="medium">
              Категории
            </MyButton>
            <div className={styles.quotationMarks}>
              <img src={marksImg} alt="" />
              <div className={styles.quotationPer}>
                <span className={styles.quotationPer__text}>
                  Туйона - лучший помощник в подготовке свадьбы. Проверенные
                  продавцы, идеальный результат!
                </span>{" "}
                <br /> <br />
                <p className={styles.quotationName}>Малика & Фаррух</p>
              </div>
            </div>
          </div>
          <div className={styles.servicesReviews__imG}>
            <img src={servicesReviewsIMG2} alt="" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Home;
