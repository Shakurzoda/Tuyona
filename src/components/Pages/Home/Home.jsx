import image from "/src/assets/homeImg.webp";
import styles from "./Home.module.css";
import MyButton from "../../MyButton/MyButton";
import Section from '../../Section/Section';
import ServicesCard from '../../ServicesCard/ServicesCard';
import { cardsData } from './../../ServicesCard/CardPost';

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
                Tyuona воплощает ваши свадебные мечты: от изысканных цветочных
                композиций до элегантного кейтеринга. Создадим ваш идеальный
                день вместе
              </p>
            </div>
          </div>
          <div className={styles.home__content__text__btn}>
            <MyButton color="pink" size="medium">
              Все категории
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
          <p>Наши Услуги</p>
        </div>
        <div className={styles.servicesCard}>
          {cardsData.map((card) => (
            <ServicesCard key={card.id} card={card} />
          ))}
        </div>
      </div>

      <div className={styles.servicesReviews}>
        <div className={styles.servicesReviews__content}>
          <div className={styles.servicesReviews__img}>
            <img src="/src/assets/ReviewsIMG1.webp" alt="" />
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
              <img src="/src/assets/quotation-marks-svgrepo-com.svg" alt="" />
              <div className={styles.quotationPer}>
                <span className={styles.quotationPer__text}>
                  Туйона помогала нам на каждом шагу. Наша свадьба была именно
                  такой, о какой мы мечтали!
                </span>{" "}
                <br /> <br />
                <p className={styles.quotationName}>Jessica & Mark</p>
              </div>
            </div>
          </div>
          <div className={styles.servicesReviews__imG}>
            <img src="/src/assets/ReviewsIMG2.webp" alt="" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Home;
