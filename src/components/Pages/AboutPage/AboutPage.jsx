import styles from "./AboutPage.module.css";

const AboutPage = () => {
  // Статистика
  const stats = [
    /*     { number: "500+", label: "проверенных исполнителей" },
    { number: "3,000+", label: "успешных свадеб" },
    { number: "95%", label: "клиентов рекомендуют нас" },
    { number: "50+", label: "городов обслуживания" }, */
  ];

  // Преимущества
  const features = [
    {
      icon: "🛡️",
      title: "Проверенные исполнители",
      description: "Каждый профиль проходит ручную модерацию перед публикацией",
    },
    {
      icon: "❤️",
      title: "Прямой контакт",
      description:
        "Общайтесь с исполнителями напрямую, без посредников и скрытых комиссий",
    },
    {
      icon: "💰",
      title: "Лучшие цены",
      description: "Сравнивайте цены и выбирайте оптимальное предложение",
    },
  ];

  // Как это работает
  const howItWorks = [
    {
      step: "01",
      title: "Найдите исполнителя",
      description: "Ищите по категориям, читайте отзывы и смотрите портфолио",
    },
    {
      step: "02",
      title: "Свяжитесь напрямую",
      description:
        "Напишите или позвоните исполнителю через контакты в профиле",
    },
    {
      step: "03",
      title: "Обсудите детали",
      description:
        "Договоритесь обо всех нюансах и условиях напрямую с исполнителем",
    },
  ];

  // Иконки для шагов
  const stepIcons = ["🔍", "📞", "🤝", "⭐"];

  return (
    <div className={styles.aboutPage}>
      {/* Hero секция */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Мы создаём <span className={styles.highlight}>связи</span>, которые
            превращаются в{" "}
            <span className={styles.highlight}>незабываемые свадьбы</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Tuyona.tj — это где будущие молодожены напрямую находят лучших
            свадебных исполнителей. Мы не берём комиссию — вы общаетесь и
            договариваетесь напрямую с выбранными специалистами.
          </p>
          <div className={styles.heroStats}>
            {stats.map((stat, index) => (
              <div key={index} className={styles.statItem}>
                <span className={styles.statNumber}>{stat.number}</span>
                <span className={styles.statLabel}>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.heroImage}>
          <img
            src="https://ik.imagekit.io/tuyona/ChatGPT%20Image%201%20%D1%84%D0%B5%D0%B2%D1%80.%202026%20%D0%B3.,%2023_35_34.png"
            alt="Счастливая пара на свадьбе"
            className={styles.heroImg}
            loading="lazy"
          />
          <div className={styles.imageOverlay}></div>
        </div>
      </section>

      {/* Миссия */}
      <section className={styles.mission}>
        <div className={styles.container}>
          <div className={styles.missionCard}>
            <div className={styles.missionHeader}>
              <div className={styles.missionIcon}>🎯</div>
              <h2 className={styles.missionTitle}>Наша миссия</h2>
            </div>
            <p className={styles.missionText}>
              Мы упрощаем организацию свадьбы, устраняя посредников и делая
              процесс прозрачным. Наша цель — помочь каждой паре найти идеальных
              исполнителей для их особенного дня, экономя время, деньги и нервы.
            </p>
            <div className={styles.values}>
              <h3 className={styles.valuesTitle}>Наши принципы:</h3>
              <div className={styles.valuesGrid}>
                <div className={styles.valueItem}>
                  <span className={styles.checkIcon}>✓</span>
                  <span>Только проверенные исполнители</span>
                </div>
                <div className={styles.valueItem}>
                  <span className={styles.checkIcon}>✓</span>
                  <span>Прямое общение без посредников</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Как это работает */}
      <section className={styles.works}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Как работает наш сервис</h2>
          <p className={styles.sectionSubtitle}>
            3 простых шага к идеальной свадьбе
          </p>

          <div className={styles.steps}>
            {howItWorks.map((step, index) => (
              <div key={index} className={styles.stepCard}>
                <div className={styles.stepHeader}>
                  <div className={styles.stepNumber}>{stepIcons[index]}</div>
                  <div className={styles.stepNum}>{step.step}</div>
                </div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDescription}>{step.description}</p>
                {index < howItWorks.length - 1 && (
                  <div className={styles.stepArrow}>→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Преимущества */}
      <section className={styles.features}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Почему выбирают Tuyona.tj</h2>
          <p className={styles.sectionSubtitle}>
            Мы делаем процесс поиска свадебных услуг простым и безопасным
          </p>

          <div className={styles.featuresGrid}>
            {features.map((feature, index) => (
              <div key={index} className={styles.featureCard}>
                <div className={styles.featureIcon}>{feature.icon}</div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureText}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <div className={styles.container}>
          <div className={styles.ctaCard}>
            <h2 className={styles.ctaTitle}>
              Начните планировать свадьбу мечты
            </h2>
            {/*             <p className={styles.ctaText}>
              Присоединяйтесь к тысячам пар, которые уже нашли идеальных
              исполнителей через нашу платформу
            </p> */}
            <div className={styles.ctaButtons}>
              <a href="/category" className={styles.ctaButtonPrimary}>
                Найти исполнителей
              </a>
{/*               <a href="/register" className={styles.ctaButtonSecondary}>
                Зарегистрироваться как исполнитель
              </a> */}
            </div>
            <p className={styles.ctaNote}>
              Это бесплатно. Мы не берём комиссию с ваших сделок.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
