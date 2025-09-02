import { useState, useRef, useEffect, useCallback } from "react";
import styles from "./ThumbsGallery.module.css";

const ThumbsGallery = ({ imgList }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const videoRef = useRef(null);
  const videoWrapperRef = useRef(null);

  const isVideo = (media) =>
    typeof media === "object" && media.type === "video";

  /** Формат времени */
  const formatTime = (sec) => {
    if (!isFinite(sec) || sec < 0) return "0:00";
    const s = Math.floor(sec % 60)
      .toString()
      .padStart(2, "0");
    const m = Math.floor((sec / 60) % 60).toString();
    const h = Math.floor(sec / 3600);
    return h > 0 ? `${h}:${m.padStart(2, "0")}:${s}` : `${m}:${s}`;
  };

  /** Навигация */
  const handleThumbnailClick = useCallback(
    (index) => {
      pauseIfVideo();
      setActiveIndex(index);
      document.querySelector(`#thumb-${index}`)?.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    },
    [imgList]
  );

  const handleNext = useCallback(() => {
    pauseIfVideo();
    setActiveIndex((prev) => (prev + 1) % imgList.length);
  }, [imgList]);

  const handlePrev = useCallback(() => {
    pauseIfVideo();
    setActiveIndex((prev) => (prev - 1 + imgList.length) % imgList.length);
  }, [imgList]);

  /** Управление видео */
  const pauseIfVideo = useCallback(() => {
    if (isVideo(imgList[activeIndex])) {
      videoRef.current?.pause();
      setIsPlaying(false);
    }
  }, [activeIndex, imgList]);

  const togglePlayPause = () => {
    if (!isVideo(imgList[activeIndex])) return;
    const v = videoRef.current;
    if (!v) return;
    if (isPlaying) v.pause();
    else v.play();
  };

  const handleSeek = (e) => {
    const v = videoRef.current;
    if (!v) return;
    const newTime = Number(e.target.value);
    v.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e) => {
    const v = videoRef.current;
    if (!v) return;
    const val = Number(e.target.value);
    v.volume = val;
    setVolume(val);
    setIsMuted(val === 0);
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setIsMuted(v.muted);
  };

  const handleFullscreen = async () => {
    const el = videoWrapperRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      await el.requestFullscreen?.();
    } else {
      await document.exitFullscreen?.();
    }
  };

  const handlePiP = async () => {
    const v = videoRef.current;
    if (!v) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (
        document.pictureInPictureEnabled &&
        !v.disablePictureInPicture
      ) {
        await v.requestPictureInPicture();
      }
    } catch {}
  };

  /** Обновление состояния видео */
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !isVideo(imgList[activeIndex])) return;

    const onLoaded = () => {
      setDuration(v.duration || 0);
      setCurrentTime(v.currentTime || 0);
      setVolume(v.volume);
      setIsMuted(v.muted);
    };
    const onTime = () => setCurrentTime(v.currentTime || 0);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);

    v.addEventListener("loadedmetadata", onLoaded);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("ended", onEnded);

    return () => {
      v.removeEventListener("loadedmetadata", onLoaded);
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("ended", onEnded);
    };
  }, [activeIndex, imgList]);

  /** Сброс при смене слайда */
  useEffect(() => {
    if (isVideo(imgList[activeIndex])) {
      setIsPlaying(false);
      videoRef.current?.pause();
      setCurrentTime(0);
      setDuration(0);
    }
  }, [activeIndex, imgList]);

  const progressPercent =
    duration > 0
      ? Math.min(100, Math.max(0, (currentTime / duration) * 100))
      : 0;

  return (
    <div className={styles.galleryContainer}>
      {/* Главное медиа */}
      <div className={styles.mainImageWrapper}>
        <div className={styles.mainMediaContainer}>
          {activeIndex > 0 && (
            <button
              onClick={handlePrev}
              className={`${styles.navButton} ${styles.prevButton}`}
              aria-label="Предыдущий слайд"
            >
              ‹
            </button>
          )}

          {isVideo(imgList[activeIndex]) ? (
            <div className={styles.videoWrapper} ref={videoWrapperRef}>
              <video
                ref={videoRef}
                src={imgList[activeIndex].src}
                poster={imgList[activeIndex].poster}
                className={styles.mainMedia}
                preload="metadata"
                playsInline
                loop
              />
              {!isPlaying && (
                <button
                  className={styles.playCenterButton}
                  onClick={togglePlayPause}
                  aria-label="Воспроизвести"
                >
                  ▶
                </button>
              )}
              <div
                className={styles.controlsBar}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={styles.progressRow}>
                  <input
                    className={styles.progressInput}
                    type="range"
                    min={0}
                    max={duration || 0}
                    value={currentTime}
                    step="0.1"
                    onChange={handleSeek}
                    aria-label="Прогресс видео"
                    style={{ "--progress": `${progressPercent}%` }}
                  />
                </div>
                <div className={styles.controlsRow}>
                  <div className={styles.leftGroup}>
                    <button
                      className={`${styles.controlButton} ${styles.primary}`}
                      onClick={togglePlayPause}
                      aria-label={isPlaying ? "Пауза" : "Воспроизвести"}
                    >
                      {isPlaying ? "❚❚" : "▶"}
                    </button>
                    <div className={styles.timeLabel}>
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </div>
                  </div>
                  <div className={styles.rightGroup}>
                    <button
                      className={styles.controlButton}
                      onClick={toggleMute}
                      aria-label={isMuted ? "Включить звук" : "Выключить звук"}
                    >
                      {isMuted ? "🔇" : "🔊"}
                    </button>
                    <input
                      className={styles.volumeInput}
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={volume}
                      onChange={handleVolumeChange}
                    />
                    <button
                      className={styles.controlButton}
                      onClick={handlePiP}
                      aria-label="Картинка в картинке"
                    >
                      ⧉
                    </button>
                    <button
                      className={styles.controlButton}
                      onClick={handleFullscreen}
                      aria-label="Во весь экран"
                    >
                      ⛶
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <img
              src={imgList[activeIndex]}
              alt={`Slide ${activeIndex + 1}`}
              className={styles.mainMedia}
              loading="lazy"
            />
          )}

          {activeIndex < imgList.length - 1 && (
            <button
              onClick={handleNext}
              className={`${styles.navButton} ${styles.nextButton}`}
              aria-label="Следующий слайд"
            >
              ›
            </button>
          )}
        </div>
      </div>

      {/* Навигация (dots) */}
      <div className={styles.dotsContainer}>
        {imgList.map((_, index) => (
          <button
            key={index}
            className={`${styles.dot} ${
              index === activeIndex ? styles.activeDot : ""
            } ${isVideo(imgList[index]) ? styles.videoDot : ""}`}
            onClick={() => handleThumbnailClick(index)}
            aria-label={`К слайду ${index + 1}`}
          />
        ))}
      </div>

      {/* Миниатюры */}
      <div className={styles.thumbnailsContainer}>
        {imgList.map((media, index) => (
          <div key={index} className={styles.thumbnailWrapper}>
            {isVideo(media) ? (
              <div className={styles.videoThumbnail}>
                <img
                  id={`thumb-${index}`}
                  src={media.poster}
                  className={`${styles.thumbnail} ${
                    index === activeIndex ? styles.activeThumbnail : ""
                  }`}
                  onClick={() => handleThumbnailClick(index)}
                  alt={`Видео превью ${index + 1}`}
                />
                <div className={styles.videoIndicator}>▶</div>
              </div>
            ) : (
              <img
                id={`thumb-${index}`}
                src={media}
                alt={`Thumbnail ${index + 1}`}
                className={`${styles.thumbnail} ${
                  index === activeIndex ? styles.activeThumbnail : ""
                }`}
                onClick={() => handleThumbnailClick(index)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThumbsGallery;
