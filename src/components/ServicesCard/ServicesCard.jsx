import MyButton from "../MyButton/MyButton";
import styles from "./ServicesCard.module.css";
import { Link } from "react-router-dom";

const ServicesCard = ({ card }) => {
  const { title, body, img } = card;
  return (
    <Link
      to="/category"
      className={styles.card}
      aria-label={`Перейти к ${title}`}
    >
      <div className={styles.card_content}>
        <div className={styles.card_content__img}>
          <img src={img} alt={title} loading="lazy" />
        </div>
        <div className={styles.card_content__text}>
          <p>{title}</p>
        </div>
        <div className={styles.card_content__desc}>
          <p>{body}</p>
        </div>
        <MyButton color="white" size="large">
          К категориям
        </MyButton>
      </div>
    </Link>
  );
};

export default ServicesCard;

