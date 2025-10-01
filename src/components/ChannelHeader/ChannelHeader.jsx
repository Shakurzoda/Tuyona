import styles from "./ChannelHeader.module.css";

export default function ChannelHeader({
/*   coverUrl = "https://sun9-25.userapi.com/impf/8t69vnL2FfQTFY1uYTjWK963SoTu8_CSMur5Og/OAcehxdBO0s.jpg?size=2268x378&quality=95&crop=0,426,2560,426&sign=219424b58f1577a6cb66f2abbd20827c&type=cover_group&quot", */
  avatarUrl = 'https://sun9-25.userapi.com/impf/8t69vnL2FfQTFY1uYTjWK963SoTu8_CSMur5Og/OAcehxdBO0s.jpg?size=2268x378&quality=95&crop=0,426,2560,426&sign=219424b58f1577a6cb66f2abbd20827c&type=cover_group&quot',
  title = "Rozetked",
  verified = true,
  subscribers = "335K",
  videos = "1 405",
  onSubscribe = () => {},
  onMore = () => {},
  isSubscribed = false,
}) {
  return (
    <header className={styles.wrapper}>
{/*       <div className={styles.cover} role="img" aria-label="Channel cover">
        {coverUrl && <img src={coverUrl} alt="" />}
      </div> */}

      <div className={styles.bar}>
        <div className={styles.left}>
          <div className={styles.avatar}>
            {avatarUrl ? (
              <img src={avatarUrl} alt={`${title} avatar`} />
            ) : (
              <span className={styles.avatarStub} aria-hidden>
                {/* Hexagon stub */}
                <svg viewBox="0 0 100 100">
                  <polygon points="50,3 95,28 95,72 50,97 5,72 5,28" />
                </svg>
              </span>
            )}
          </div>

          <div className={styles.meta}>
            <div className={styles.titleRow}>
              <h1 className={styles.title}>{title}</h1>
              {verified && (
                <span className={styles.badge} title="Verified">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M9.999 16.2 5.799 12l1.4-1.4 2.8 2.8 6.8-6.8 1.4 1.4-8.2 8.2z" />
                  </svg>
                </span>
              )}
            </div>
            <div className={styles.stats}>
              <span className={styles.muted}>{subscribers} подписчиков</span>
              <span className={styles.dot} aria-hidden="true">
                •
              </span>
              <span className={styles.muted}>{videos} видео</span>
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <button
            className={`${styles.btn} ${
              isSubscribed ? styles.btnGhost : styles.btnPrimary
            }`}
            onClick={onSubscribe}
            type="button"
          >
            {isSubscribed ? "Вы подписаны" : "Подписаться"}
          </button>

          <button
            className={`${styles.iconBtn}`}
            type="button"
            aria-label="Поделиться"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7a3.27 3.27 0 0 0 0-1.39l7.02-4.11A2.99 2.99 0 1 0 14 5a2.9 2.9 0 0 0 .05.51L7.03 9.62a3 3 0 1 0 0 4.76l7.02 4.11c-.03.16-.05.33-.05.51a3 3 0 1 0 3-3z" />
            </svg>
          </button>

          <button
            className={styles.moreBtn}
            onClick={onMore}
            type="button"
            aria-label="Ещё"
          >
            Ещё
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7 10l5 5 5-5z" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
