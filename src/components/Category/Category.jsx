import { CategoryVariables } from "./CategoryVariables";
import styles from "./Category.module.css";
import clsx from "clsx";
import { useNavigate } from 'react-router';

const Category = ({ direction, setDirection }) => {

  const navigate = useNavigate();
  return (
    <div className={styles.content__wrapper}>
      <div className={styles.content}>
        <div className={styles.corses__name}>
          <h1 className={styles.topName}>{direction.title}</h1>
        </div>
        <div className={styles.courses__items}>
          {CategoryVariables.map((directionElement) => (
            <div
              key={directionElement.directionName}
              className={clsx(styles.item, {
                [styles.activeItem]:
                  direction.directionName === directionElement.directionName,
              })}
              onClick={() => {
                navigate(`/category/${directionElement.directionName}`);
                setDirection(directionElement)}}
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
