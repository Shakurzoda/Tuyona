import styles from './Section.module.css';

const Section = () => {
    return (
      <section className={styles.section}>
        <div className={styles.section__content}>
          <div className={styles.weddingText}>
            <p>Почему выбирают Туйона?</p>
          </div>
          <div className={styles.weddingTitle}>
            <p>Безупречный Свадебный Опыт</p>
          </div>
          <div className={styles.weddingDesc}>
            <p>
              Благодаря нашей обширной сети надежных поставщиков и
              персонализированным услугам мы позаботимся о каждой детали вашей
              свадьбы, что позволит вам сосредоточиться на том, что
              действительно важно.
            </p>
          </div>
        </div>
      </section>
    );
};

export default Section;