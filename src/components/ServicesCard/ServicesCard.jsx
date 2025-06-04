import MyButton from "../MyButton/MyButton";
import styles from "./ServicesCard.module.css";
import { Link } from "react-router-dom";

const ServicesCard = ({ card }) => {
  const { title, body, img } = card;
  return (
    <div className={styles.card}>
      <div className={styles.card_content}>
        <div className={styles.card_content__img}>
          <img src={img} alt="" />
        </div>
        <div className={styles.card_content__text}>
          <p>{title}</p>
        </div>
        <div className={styles.card_content__desc}>
          <p>{body}</p>
        </div>
        <MyButton color="white" size="large" href="/category">
          К категориям
        </MyButton>
      </div>
    </div>
  );
};

export default ServicesCard;

