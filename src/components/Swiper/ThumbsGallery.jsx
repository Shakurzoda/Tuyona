import { useState } from "react";
import styles from "./ThumbsGallery.module.css";


const ThumbsGallery = ({ imgList, img }) => {

  const images = [img, ...imgList];

  const [activeIndex, setActiveIndex] = useState(0);

  const handleThumbnailClick = (index) => {
    setActiveIndex(index);
  };

  const handleNext = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handlePrev = () => {
    setActiveIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length
    );
  };

  return (
    <div className={styles.galleryContainer}>
      <div className={styles.mainImageContainer}>
        <button onClick={handlePrev} className={styles.navButton}>
          &lt;
        </button>
        <img
          src={images[activeIndex]}
          alt={`Slide ${activeIndex + 1}`}
          className={styles.mainImage}
        />
        <button onClick={handleNext} className={styles.navButton}>
          &gt;
        </button>
      </div>
      <div className={styles.thumbnailsContainer}>
        {images.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`Thumbnail ${index + 1}`}
            className={`${styles.thumbnail} ${
              index === activeIndex ? styles.activeThumbnail : ""
            }`}
            onClick={() => handleThumbnailClick(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default ThumbsGallery;
