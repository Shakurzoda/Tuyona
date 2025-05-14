import { useState } from "react";
import styles from "./ThumbsGallery.module.css";

const images = [
  "https://img.freepik.com/premium-photo/beautiful-daisy-flowers-grass-field-with-sunset-background-generative-ai_691560-9371.jpg?semt=ais_hybrid",
  "https://sotni.ru/wp-content/uploads/2023/08/polevye-tsvety-makro-1.webp",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWTjQOJ8-HvQpnVe2-mGeHm3z5gENld2ZmUCvqISFBKmB6v3QxaA--WNenVojVyhJAx_c&usqp=CAU",
  "https://img1.akspic.ru/previews/5/3/0/9/7/179035/179035-voda-gora-gidroresursy-rastenie-oblako-500x.jpg",
];

const ThumbsGallery = () => {
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
      {/* Main image */}
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

      {/* Thumbnails */}
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
