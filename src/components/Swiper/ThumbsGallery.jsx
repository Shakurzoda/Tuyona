import { useState, useRef, useEffect, useCallback } from "react";
import styles from "./ThumbsGallery.module.css";

const ThumbsGallery = ({ imgList }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  const videoRef = useRef(null);
  const videoWrapperRef = useRef(null);


  const isVideo = (media) =>
    typeof media === "object" && media.type === "video";

  const formatTime = (sec) => {
    if (!isFinite(sec) || sec < 0) return "0:00";
    const s = Math.floor(sec % 60)
      .toString()
      .padStart(2, "0");
    const m = Math.floor((sec / 60) % 60).toString();
    const h = Math.floor(sec / 3600);
    return h > 0
      ? `${h}:${Math.floor((sec / 60) % 60)
          .toString()
          .padStart(2, "0")}:${s}`
      : `${Math.floor(sec / 60)}:${s}`;
  };

  const pauseIfVideo = useCallback(() => {
    if (isVideo(imgList[activeIndex])) {
      videoRef.current?.pause();
      setIsPlaying(false);
    }
  }, [activeIndex, imgList]);

  const handleThumbnailClick = (index) => {
    pauseIfVideo();
    setActiveIndex(index);
  };
  const handleNext = () => {
    pauseIfVideo();
    setActiveIndex((prev) => (prev + 1) % imgList.length);
  };
  const handlePrev = () => {
    pauseIfVideo();
    setActiveIndex((prev) => (prev - 1 + imgList.length) % imgList.length);
  };

  const handleTouchStart = (e) => setTouchStartX(e.touches[0].clientX);
  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (diff > 50) handleNext();
    else if (diff < -50) handlePrev();
  };

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

  const handleRateChange = (e) => {
    const v = videoRef.current;
    if (!v) return;
    const rate = Number(e.target.value);
    v.playbackRate = rate;
    setPlaybackRate(rate);
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


  useEffect(() => {
    const v = videoRef.current;
    if (!v || !isVideo(imgList[activeIndex])) return;

    const onLoaded = () => {
      setDuration(v.duration || 0);
      setCurrentTime(v.currentTime || 0);
      setVolume(v.volume);
      setIsMuted(v.muted);
      setPlaybackRate(v.playbackRate || 1);
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


  useEffect(() => {
    if (isVideo(imgList[activeIndex])) {
      setIsPlaying(false);
      videoRef.current?.pause();
      setCurrentTime(0);
      setDuration(0);
    }
  }, [activeIndex, imgList]);


  const onKeyDown = (e) => {
    if (!isVideo(imgList[activeIndex])) return;
    if (["Space", "ArrowLeft", "ArrowRight"].includes(e.code))
      e.preventDefault();
    if (e.code === "Space") togglePlayPause();
    if (e.code === "ArrowLeft") {
      const v = videoRef.current;
      if (v) v.currentTime = Math.max(0, v.currentTime - 5);
    }
    if (e.code === "ArrowRight") {
      const v = videoRef.current;
      if (v) v.currentTime = Math.min(v.duration || 0, v.currentTime + 5);
    }
  };


  const progressPercent =
    duration > 0
      ? Math.min(100, Math.max(0, (currentTime / duration) * 100))
      : 0;

  return (
    <div className={styles.galleryContainer}>
      <div className={styles.mainImageWrapper}>
        <div
          className={styles.mainMediaContainer}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={() => isVideo(imgList[activeIndex]) && togglePlayPause()}
        >
          {activeIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className={`${styles.navButton} ${styles.prevButton}`}
              aria-label="Предыдущий слайд"
              title="Предыдущий"
            >
              ‹
            </button>
          )}

          {isVideo(imgList[activeIndex]) ? (
            <div
              className={styles.videoWrapper}
              ref={videoWrapperRef}
              tabIndex={0}
              onKeyDown={onKeyDown}
            >
              <video
                ref={videoRef}
                src={imgList[activeIndex].src}
                poster={imgList[activeIndex].poster}
                className={styles.mainMedia}
                controls={false}
                loop
                playsInline
              />
              {!isPlaying && (
                <button
                  className={styles.playCenterButton}
                  aria-label="Воспроизвести"
                  title="Воспроизвести"
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlayPause();
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="46"
                    height="46"
                    aria-hidden="true"
                  >
                    <path
                      fill="currentColor"
                      d="M8,5.14V19.14L19,12.14L8,5.14Z"
                    />
                  </svg>
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
                    aria-label="Позиция воспроизведения"
                    style={{ "--progress": `${progressPercent}%` }}
                  />
                </div>

                <div className={styles.controlsRow}>
                  <div className={styles.leftGroup}>
                    <button
                      className={`${styles.controlButton} ${styles.primary}`}
                      onClick={togglePlayPause}
                      aria-label={isPlaying ? "Пауза" : "Воспроизвести"}
                      title={isPlaying ? "Пауза" : "Воспроизвести"}
                    >
                      {isPlaying ? (
                        <svg viewBox="0 0 24 24" width="18" height="18">
                          <path
                            fill="currentColor"
                            d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"
                          />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" width="18" height="18">
                          <path
                            fill="currentColor"
                            d="M8,5.14V19.14L19,12.14L8,5.14Z"
                          />
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
                      title={isMuted ? "Включить звук" : "Выключить звук"}
                    >
                      {isMuted || volume === 0 ? (
                        <svg viewBox="0 0 24 24" width="18" height="18">
                          <path
                            fill="currentColor"
                            d="M16.5 12l3.5 3.5-1.5 1.5L15 13.5 11.5 17l-1.5-1.5L13.5 12 10 8.5 11.5 7l3.5 3.5L18.5 7l1.5 1.5z"
                          />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" width="18" height="18">
                          <path
                            fill="currentColor"
                            d="M3 10v4h4l5 5V5L7 10H3zm13.5 2c0-1.77-1.02-3.29-2.5-4.03v8.06c1.48-.74 2.5-2.26 2.5-4.03z"
                          />
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
                      title="Громкость"
                    />

{/*                     <select
                      className={styles.rateSelect}
                      value={playbackRate}
                      onChange={handleRateChange}
                      aria-label="Скорость воспроизведения"
                      title="Скорость"
                    >
                      {[0.5, 0.75, 1, 1.25, 1.5, 2].map((r) => (
                        <option key={r} value={r}>
                          {r}×
                        </option>
                      ))}
                    </select> */}

                    <button
                      className={styles.controlButton}
                      onClick={handlePiP}
                      aria-label="Картинка в картинке"
                      title="Картинка в картинке"
                    >
                      <svg viewBox="0 0 24 24" width="18" height="18">
                        <path
                          fill="currentColor"
                          d="M19 7H5c-1.1 0-2 .9-2 2v8h2V9h14v10h2V9c0-1.1-.9-2-2-2zM17 12h-6v5h6v-5z"
                        />
                      </svg>
                    </button>

                    <button
                      className={styles.controlButton}
                      onClick={handleFullscreen}
                      aria-label="Во весь экран"
                      title="Во весь экран"
                    >
                      <svg viewBox="0 0 24 24" width="18" height="18">
                        <path
                          fill="currentColor"
                          d="M7 14H5v5h5v-2H7v-3zm0-4h3V7h2v5H7V7zm10 9h-3v2h5v-5h-2v3zm0-9V5h-5v2h3v3h2z"
                        />
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
              sizes="(max-width: 768px) 100vw, 960px"
            />
          )}

          {activeIndex < imgList.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className={`${styles.navButton} ${styles.nextButton}`}
              aria-label="Следующий слайд"
              title="Следующий"
            >
              ›
            </button>
          )}
        </div>
      </div>

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

      <div className={styles.thumbnailsContainer}>
        {imgList.map((media, index) => (
          <div key={index} className={styles.thumbnailWrapper}>
            {isVideo(media) ? (
              <div className={styles.videoThumbnail}>
                <img
                  src={media.poster}
                  className={`${styles.thumbnail} ${
                    index === activeIndex ? styles.activeThumbnail : ""
                  }`}
                  onClick={() => handleThumbnailClick(index)}
                  loading="lazy"
                  alt={`Видео превью ${index + 1}`}
                  sizes="(max-width: 768px) 20vw, 110px"
                />
                <div className={styles.videoIndicator}>
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    aria-hidden="true"
                  >
                    <path
                      fill="currentColor"
                      d="M8,5.14V19.14L19,12.14L8,5.14Z"
                    />
                  </svg>
                </div>
              </div>
            ) : (
              <img
                src={media}
                alt={`Thumbnail ${index + 1}`}
                className={`${styles.thumbnail} ${
                  index === activeIndex ? styles.activeThumbnail : ""
                }`}
                onClick={() => handleThumbnailClick(index)}
                loading="lazy"
                sizes="(max-width: 768px) 20vw, 110px"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThumbsGallery;
