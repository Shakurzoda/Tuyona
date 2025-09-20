import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./ProductCarousel.module.css";

/**
 * img: string | { src, type|kind, poster, thumb, alt, loop, muted, controls }
 * imgList: (string | object)[]
 */
export default function ProductCarousel({
  img,
  imgList = [],
  autoPlay = false,
  interval = 5000,
  onChange,
}) {
  const videoExt = /\.(mp4|webm|ogg)(\?.*)?$/i;
  const normalize = (item) => {
    if (!item) return null;
    if (typeof item === "string") {
      const src = item.trim();
      return { src, alt: "", kind: videoExt.test(src) ? "video" : "image" };
    }
    const src = (item.src || "").trim();
    const declared = (item.type || item.kind || "").toString().toLowerCase();
    const kind =
      declared === "video"
        ? "video"
        : declared === "image"
        ? "image"
        : videoExt.test(src)
        ? "video"
        : "image";
    return {
      alt: "",
      controls: true,
      muted: true,
      loop: false,
      ...item,
      src,
      kind,
    };
  };

  const main = normalize(img);
  const list = imgList.map(normalize).filter(Boolean);
  const slides = useMemo(() => {
    if (!main) return list;
    const exists = list.some((x) => x.src === main.src);
    return exists ? list : [main, ...list];
  }, [main, list]);

  const [index, setIndex] = useState(0);
  const count = slides.length;
  const safe = (i) => (count ? (i + count) % count : 0);

  // autoplay (пауза на видео)
  const timerRef = useRef(null);
  useEffect(() => {
    if (!autoPlay || count < 2) return;
    if (slides[index]?.kind === "video") return;
    timerRef.current = setInterval(
      () => setIndex((i) => safe(i + 1)),
      interval
    );
    return () => clearInterval(timerRef.current);
  }, [autoPlay, interval, count, index, slides]);

  // клавиатура
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") setIndex((i) => safe(i + 1));
      if (e.key === "ArrowLeft") setIndex((i) => safe(i - 1));
      if (e.key === " ") {
        e.preventDefault();
        togglePlay();
      }
      if (e.key.toLowerCase() === "m") toggleMute();
      if (e.key.toLowerCase() === "f") toggleFullscreen();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  useEffect(() => {
    onChange?.(index);
  }, [index, onChange]);

  // свайпы
  const trackRef = useRef(null);
  const startX = useRef(0);
  const dx = useRef(0);
  const clearAuto = () => timerRef.current && clearInterval(timerRef.current);
  const onTouchStart = (e) => {
    clearAuto();
    startX.current = e.touches[0].clientX;
    dx.current = 0;
  };
  const onTouchMove = (e) => {
    dx.current = e.touches[0].clientX - startX.current;
    if (trackRef.current)
      trackRef.current.style.transform = `translateX(${dx.current}px)`;
  };
  const onTouchEnd = () => {
    if (trackRef.current) trackRef.current.style.transform = "";
    const t = 60;
    if (dx.current > t) setIndex((i) => safe(i - 1));
    else if (dx.current < -t) setIndex((i) => safe(i + 1));
  };

  if (!count) return null;
  const current = slides[index];

  // ==== кастомный видеоплеер ====
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(0.8);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedEnd, setBufferedEnd] = useState(0);
  const [controlsVisible, setControlsVisible] = useState(true);
  const hideTimer = useRef(null);

  const format = (s) => {
    if (!isFinite(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec < 10 ? "0" : ""}${sec}`;
  };

  const ensureVisible = () => {
    setControlsVisible(true);
    clearTimeout(hideTimer.current);
    // автоскрытие, когда видео играет
    if (isPlaying)
      hideTimer.current = setTimeout(() => setControlsVisible(false), 2200);
  };

  const togglePlay = async () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      try {
        await v.play();
        setIsPlaying(true);
        ensureVisible();
      } catch {}
    } else {
      v.pause();
      setIsPlaying(false);
      setControlsVisible(true);
    }
  };
  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setIsMuted(v.muted);
  };
  const onLoadedMetadata = () => {
    const v = videoRef.current;
    if (!v) return;
    setDuration(v.duration || 0);
    setIsMuted(v.muted);
  };
  const onTimeUpdate = () => {
    const v = videoRef.current;
    if (!v) return;
    setCurrentTime(v.currentTime || 0);
    if (v.buffered?.length)
      setBufferedEnd(v.buffered.end(v.buffered.length - 1));
  };
  const onSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(
      Math.max((e.clientX - rect.left) / rect.width, 0),
      1
    );
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = ratio * (v.duration || 0);
  };
  const onVolumeChange = (e) => {
    const v = videoRef.current;
    if (!v) return;
    const val = parseFloat(e.target.value);
    v.volume = val;
    setVolume(val);
    if (v.muted && val > 0) {
      v.muted = false;
      setIsMuted(false);
    }
  };
  const toggleFullscreen = () => {
    const el = trackRef.current;
    if (!document.fullscreenElement) el?.requestFullscreen?.();
    else document.exitFullscreen?.();
  };
  const togglePiP = async () => {
    const v = videoRef.current;
    if (!v) return;
    try {
      if (document.pictureInPictureElement)
        await document.exitPictureInPicture();
      else if (document.pictureInPictureEnabled)
        await v.requestPictureInPicture();
    } catch {}
  };

  // показывать контролы при движении мыши/таче
  const onPointerMove = () => ensureVisible();

  // при смене слайда — сброс плеера
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setBufferedEnd(0);
    setControlsVisible(true);
    clearTimeout(hideTimer.current);
  }, [index]);

  return (
    <section className={styles.wrap} aria-roledescription="carousel">
      {/* миниатюры */}
      <aside className={styles.thumbs} aria-label="Миниатюры">
        {slides.map((s, i) => {
          const thumbSrc = s.thumb || s.poster || s.src;
          return (
            <button
              key={s.src + i}
              className={`${styles.thumb} ${i === index ? styles.active : ""}`}
              onClick={() => setIndex(i)}
              aria-current={i === index ? "true" : "false"}
              aria-label={`Слайд ${i + 1}`}
            >
              <img src={thumbSrc} alt={s.alt || `Миниатюра ${i + 1}`} />
              {s.kind === "video" && (
                <span className={styles.playBadge} aria-hidden>
                  ▶
                </span>
              )}
            </button>
          );
        })}
      </aside>

      {/* сцена */}
      <div
        className={styles.stage}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          className={styles.track}
          ref={trackRef}
          onMouseMove={onPointerMove}
          onPointerMove={onPointerMove}
        >
          {current.kind === "video" ? (
            <div className={styles.videoWrap}>
              <video
                ref={videoRef}
                className={styles.media}
                src={current.src}
                poster={current.poster || current.thumb}
                playsInline
                preload="metadata"
                muted={true} // автостарт с mute, чтобы не блокировало
                autoPlay // начнём проигрывать, если можно
                loop={current.loop}
                onLoadedMetadata={onLoadedMetadata}
                onTimeUpdate={onTimeUpdate}
                onEnded={() => setIndex((i) => safe(i + 1))}
                onPlay={() => {
                  setIsPlaying(true);
                  ensureVisible();
                }}
                onPause={() => {
                  setIsPlaying(false);
                  setControlsVisible(true);
                }}
              />
              {/* большая кнопка Play/Pause */}
              {!isPlaying && (
                <button
                  className={styles.bigPlay}
                  onClick={togglePlay}
                  aria-label="Воспроизвести"
                >
                  ▶
                </button>
              )}

              {/* панель управления */}
              <div
                className={`${styles.controls} ${
                  controlsVisible ? styles.controlsVisible : ""
                }`}
              >
                <div className={styles.leftControls}>
                  <button
                    className={styles.ctrlBtn}
                    onClick={togglePlay}
                    aria-label="Пуск/Пауза"
                  >
                    {isPlaying ? "❚❚" : "▶"}
                  </button>
                  <div className={styles.time}>
                    {format(currentTime)} / {format(duration)}
                  </div>
                </div>

                <div className={styles.timeline} onClick={onSeek}>
                  <div
                    className={styles.buffered}
                    style={{
                      width: duration
                        ? `${(bufferedEnd / duration) * 100}%`
                        : "0%",
                    }}
                  />
                  <div
                    className={styles.progress}
                    style={{
                      width: duration
                        ? `${(currentTime / duration) * 100}%`
                        : "0%",
                    }}
                  />
                  <div
                    className={styles.scrubber}
                    style={{
                      left: duration
                        ? `${(currentTime / duration) * 100}%`
                        : "0%",
                    }}
                  />
                </div>

                <div className={styles.rightControls}>
                  <button
                    className={styles.ctrlBtn}
                    onClick={toggleMute}
                    aria-label="Звук"
                  >
                    {isMuted ? "🔇" : "🔊"}
                  </button>
                  <input
                    className={styles.volume}
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={onVolumeChange}
                    aria-label="Громкость"
                  />
                  <button
                    className={styles.ctrlBtn}
                    onClick={togglePiP}
                    aria-label="Картинка-в-картинке"
                  >
                    ⧉
                  </button>
                  <button
                    className={styles.ctrlBtn}
                    onClick={toggleFullscreen}
                    aria-label="Во весь экран"
                  >
                    ⤢
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <img
              key={current.src}
              className={styles.media}
              src={current.src}
              alt={current.alt || "Изображение"}
            />
          )}
        </div>

        {/* стрелки */}
        {count > 1 && (
          <>
            <button
              className={`${styles.nav} ${styles.prev}`}
              onClick={() => setIndex((i) => safe(i - 1))}
              aria-label="Предыдущий"
            >
              ‹
            </button>
            <button
              className={`${styles.nav} ${styles.next}`}
              onClick={() => setIndex((i) => safe(i + 1))}
              aria-label="Следующий"
            >
              ›
            </button>
          </>
        )}

        {/* точки */}
        {count > 1 && (
          <div className={styles.dots} role="tablist">
            {slides.map((_, i) => (
              <button
                key={i}
                className={`${styles.dot} ${
                  i === index ? styles.dotActive : ""
                }`}
                onClick={() => setIndex(i)}
                role="tab"
                aria-selected={i === index}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
