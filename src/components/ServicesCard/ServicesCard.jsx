// src/components/ServicesCard/ServicesCard.jsx
import { memo } from "react";
import { Link } from "react-router-dom";
import MyButton from "../MyButton/MyButton";
import styles from "./ServicesCard.module.css";

const ServicesCard = ({ card }) => {
  const { title, body, img, alt } = card;

  return (
    <Link
      to="/category"
      className={styles.card}
      aria-label={`Перейти к категории ${title}`}
    >
      <div className={styles.card_content}>
        <div className={styles.card_content__img}>
          <img src={img} alt={alt || title} loading="lazy" decoding="async" />
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

export default memo(ServicesCard);
