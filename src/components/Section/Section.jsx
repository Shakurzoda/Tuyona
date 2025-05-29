import styles from './Section.module.css';

const Section = () => {
    return (
      <section className={styles.section}>
        <div className={styles.section__content}>
          <div className={styles.weddingText}>
            <p>Почему выбирают Туйона?</p>
          </div>
          <div className={styles.weddingTitle}>
            <p>Лучшие предложения для вашей свадьбы</p>
          </div>
          <div className={styles.weddingDesc}>
            <p>
              Выбирайте из тысяч проверенных объявлений от надежных продавцов и
              исполнителей. На нашей площадке вы найдете всё для свадьбы по
              выгодным ценам
            </p>
          </div>
        </div>
      </section>
    );
};

export default Section;