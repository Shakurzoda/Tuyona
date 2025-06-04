import { useEffect, useRef } from "react";
import Typed from "typed.js";
import styles from "./PartnerText.module.css";

const PartnerText = () => {
  const typedRef = useRef(null);

  useEffect(() => {
    const typed = new Typed(typedRef.current, {
      strings: [
        "Оператор",
        "Фотограф",
        "Ведущий",
        "Оформление",
        "Салон красоты",
      ],
      typeSpeed: 50,
      backSpeed: 30,
      backDelay: 1500,
      loop: true,
      showCursor: true,
      cursorChar: "|",
      smartBackspace: true,
    });

    return () => {
      typed.destroy();
    };
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.txtTitle}>
        <p className={styles.mainTitle}>Станьте нашим партнером</p>
      </div>
      <div className={styles.animatedText}>
        <span>В категории: </span>
        <span ref={typedRef} />
      </div>
    </div>
  );
};

export default PartnerText;
