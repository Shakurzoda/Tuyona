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
  const thumbsContainerRef = useRef(null);

  const isVideo = (media) =>
    typeof media === "object" && media.type === "video";

  /** Формат времени */
  const formatTime = (sec) => {
    if (!isFinite(sec) || sec < 0) return "0:00";
    const s = Math.floor(sec % 60).toString().padStart(2, "0");
    const m = Math.floor((sec / 60) % 60).toString();
    const h = Math.floor(sec / 3600);
    return h > 0 ? `${h}:${m.padStart(2, "0")}:${s}` : `${m}:${s}`;
  };

  /** Прокрутка миниатюры в видимую область (учёт горизонт/вертикаль) */
  const scrollThumbIntoView = (index) => {
    const container = thumbsContainerRef.current;
    const thumbElement = document.getElementById(`thumb-${index}`);
    if (!container || !thumbElement) return;

    const isHorizontal =
      container.scrollWidth > container.clientWidth + 1 &&
      container.scrollHeight <= container.clientHeight + 2;

    if (isHorizontal) {
      const left = thumbElement.offsetLeft;
      const right = left + thumbElement.offsetWidth;
      const cLeft = container.scrollLeft;
      const cRight = cLeft + container.clientWidth;

      if (left < cLeft) {
        container.scrollTo({ left, behavior: "smooth" });
      } else if (right > cRight) {
        container.scrollTo({
          left: right - container.clientWidth,
          behavior: "smooth",
        });
      }
    } else {
      const top = thumbElement.offsetTop;
      const bottom = top + thumbElement.offsetHeight;
      const cTop = container.scrollTop;
      const cBottom = cTop + container.clientHeight;

      if (top < cTop) {
        container.scrollTo({ top, behavior: "smooth" });
      } else if (bottom > cBottom) {
        container.scrollTo({
          top: bottom - container.clientHeight,
          behavior: "smooth",
        });
      }
    }
  };

  /** Навигация */
  const pauseIfVideo = useCallback(() => {
    if (isVideo(imgList[activeIndex])) {
      videoRef.current?.pause();
      setIsPlaying(false);
    }
  }, [activeIndex, imgList]);

  const handleThumbnailClick = useCallback(
    (index) => {
      pauseIfVideo();
      setActiveIndex(index);
      // прокрутить активный превью в зону видимости
      requestAnimationFrame(() => scrollThumbIntoView(index));
    },
    [pauseIfVideo]
  );

  const handleNext = useCallback(() => {
    pauseIfVideo();
    setActiveIndex((prev) => {
      const next = (prev + 1) % imgList.length;
      requestAnimationFrame(() => scrollThumbIntoView(next));
      return next;
    });
  }, [imgList.length, pauseIfVideo]);

  const handlePrev = useCallback(() => {
    pauseIfVideo();
    setActiveIndex((prev) => {
      const next = (prev - 1 + imgList.length) % imgList.length;
      requestAnimationFrame(() => scrollThumbIntoView(next));
      return next;
    });
  }, [imgList.length, pauseIfVideo]);

  /** Управление видео */
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
      <div className={styles.galleryContent}>
        {/* Миниатюры (горизонтально на мобиле, вертикально на десктопе) */}
        <div className={styles.thumbnailsContainerVertical} ref={thumbsContainerRef}>
          {imgList.map((media, index) => {
            const isVid = isVideo(media);
            const src = isVid ? media.poster : media;
            return (
              <div key={index} className={styles.thumbnailWrapperVertical}>
                <img
                  id={`thumb-${index}`}
                  src={src}
                  alt={isVid ? `Видео превью ${index + 1}` : `Thumbnail ${index + 1}`}
                  className={`${styles.thumbnailVertical} ${
                    index === activeIndex ? styles.activeThumbnailVertical : ""
                  }`}
                  onClick={() => handleThumbnailClick(index)}
                  loading="lazy"
                  decoding="async"
                  width={80}   // резервируем место (CSS все равно ужмет до var(--thumb-w))
                  height={80}
                />
                {isVid && (
                  <div className={styles.videoIndicator}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Главное медиа */}
        <div className={styles.mainMediaWrapper}>
          <div className={styles.mainMediaContainer}>
            {activeIndex > 0 && (
              <button
                onClick={handlePrev}
                className={`${styles.navButton} ${styles.prevButton}`}
                aria-label="Предыдущий слайд"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                </svg>
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
                  // атрибуты для iOS: ширина/высота помогают стабилизировать бокс
                  width={1280}
                  height={1280}
                />
                {!isPlaying && (
                  <button
                    className={styles.playCenterButton}
                    onClick={togglePlayPause}
                    aria-label="Воспроизвести"
                  >
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                )}
                <div className={styles.controlsBar} onClick={(e) => e.stopPropagation()}>
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
                        {isPlaying ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        )}
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
                        {isMuted ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3.63 3.63a.996.996 0 000 1.41L7.29 8.7 7 9H4c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h3l3.29 3.29c.63.63 1.71.18 1.71-.71v-4.17l4.18 4.18c-.49.37-1.02.68-1.6.91-.36.15-.58.53-.58.92 0 .72.73 1.18 1.39.91.8-.33 1.55-.77 2.22-1.31l1.34 1.34a.996.996 0 101.41-1.41L5.05 3.63c-.39-.39-1.02-.39-1.42 0zM19 12c0 .82-.15 1.61-.41 2.34l1.53 1.53c.56-1.17.88-2.48.88-3.87 0-3.83-2.4-7.11-5.78-8.4-.59-.23-1.22.23-1.22.86v.19c0 .38.25.71.61.85C17.18 6.54 19 9.06 19 12zm-8.71-6.29l-.17.17L12 7.76V6.41c0-.89-1.08-1.33-1.71-.7zM16.5 12A4.5 4.5 0 0014 7.97v1.79l2.48 2.48c.01-.08.02-.16.02-.24z" />
                          </svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                          </svg>
                        )}
                      </button>
                      <input
                        className={styles.volumeInput}
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={handleVolumeChange}
                        aria-label="Громкость"
                      />
                      <button
                        className={styles.controlButton}
                        onClick={handlePiP}
                        aria-label="Картинка в картинке"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 1.98 2 1.98h18c1.1 0 2-.88 2-1.98V5c0-1.1-.9-2-2-2zm0 16.01H3V4.98h18v14.03z" />
                        </svg>
                      </button>
                      <button
                        className={styles.controlButton}
                        onClick={handleFullscreen}
                        aria-label="Во весь экран"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                        </svg>
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
                decoding="async"
                sizes="(max-width: 768px) 100vw, 650px"
              />
            )}

            {activeIndex < imgList.length - 1 && (
              <button
                onClick={handleNext}
                className={`${styles.navButton} ${styles.nextButton}`}
                aria-label="Следующий слайд"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                </svg>
              </button>
            )}
          </div>

          {/* Навигация (dots) для мобильных */}
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
        </div>
      </div>
    </div>
  );
};

export default ThumbsGallery;
