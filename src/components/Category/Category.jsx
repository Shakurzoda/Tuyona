import { CategoryVariables } from "./CategoryVariables";
import styles from "./Category.module.css";
import clsx from "clsx";
import { useNavigate } from "react-router";

const Category = ({ currentDirection }) => {
  const navigate = useNavigate();

  return (
    <div className={styles.content__wrapper}>
      <div className={styles.content}>
        <div className={styles.corses__name}>
          <h1 className={styles.topName}>{currentDirection.title}</h1>
        </div>
        <div className={styles.courses__items}>
          {CategoryVariables.map((directionElement) => (
            <div
              key={directionElement.directionName}
              className={clsx(styles.item, {
                [styles.activeItem]:
                  currentDirection.directionName ===
                  directionElement.directionName,
              })}
              onClick={() =>
                navigate(`/category/${directionElement.directionName}`)
              }
            >
              {directionElement.title}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Category;
