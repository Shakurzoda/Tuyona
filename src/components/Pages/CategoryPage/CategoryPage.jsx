import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styles from "./CategoryPage.module.css";
import Category from "../../Category/Category";
import { CategoryVariables } from "../../Category/CategoryVariables";
import CardItem from "../../CardItem/CardItem";
import { getCategoryItems } from './utils';

const CategoryPage = () => {
  const [direction, setDirection] = useState(CategoryVariables[0]);


  const { category } = useParams();
useEffect(() => {
    setDirection(
      CategoryVariables.find((item) => item.directionName === category) || CategoryVariables[0]
    );
}, [category]);

  return (
    <div className={styles.category}>
      <Category direction={direction} setDirection={setDirection} />
      <div className={styles.category__content}>
        <div className={styles.category__items}>{
        getCategoryItems(direction.title).map((item) => (
          <CardItem
            key={item.id}
            item={item}
 />))}     
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
