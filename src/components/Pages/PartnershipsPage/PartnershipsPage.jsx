import PartnerText from "../../PartnerText/PartnerText";
import styles from "./PartnershipsPage.module.css";
import banerImage from "/src/assets/parnt_baner.png";
import MyButton from "./../../MyButton/MyButton";

const PartnershipsPage = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.textContent}>
          <PartnerText />
          <div className={styles.imageContainer}>
            <img src={banerImage} alt="baner" />
          </div>
        </div>

        <div className={styles.linkContent}>
          <div className={styles.linkTittle}>
            <p>Выберите способ отправки заявки:</p>
          </div>

          <div className={styles.linkItems}>
            <div className={styles.linkItemTG}>
              <div className={styles.backgroundImage}>
                <img src="/src/assets/TG_Poster.png" alt="Telegram Poster" />
              </div>
              <div
                style={{ position: "relative", zIndex: 1 }}
                className={styles.linkItemContent}
              >
                <p className={styles.titleItem}>Telegram</p>
                <p lassName={styles.bodyItem}>
                  Наш бот поможет Вам подать заявку
                </p>
                <MyButton
                  color="white"
                  size="medium"
                  href="https://t.me/TuyonaEvents_bot"
                >
                  Перейти
                </MyButton>
              </div>
            </div>

            <div className={styles.linkItemGglFrm}>
              <div className={styles.backgroundImage2}>
                <img
                  src="/src/assets/form-concept.png"
                  alt="Google Forms Poster"
                />
              </div>
              <div
                style={{ position: "relative", zIndex: 1 }}
                className={styles.linkItemContent2}
              >
                <p className={styles.titleItem}>Google Forms</p>
                <p lassName={styles.bodyItem}>
                  Заполните форму и мы с Вами свяжемся
                </p>
                <MyButton
                  color="white"
                  size="medium"
                  href="https://forms.gle/AiP66GFpgxieLr9r6"
                >
                  Перейти
                </MyButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnershipsPage;
