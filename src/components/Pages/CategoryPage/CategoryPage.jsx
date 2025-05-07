import { useState } from 'react';
import styles from './CategoryPage.module.css';
import Category from '../../Category/Category';
import { CategoryVariables } from "../../Category/CategoryVariables";
import CardItem from '../../CardItem/CardItem';


const CategoryPage = () => {
    const [direction, setDirection] = useState(CategoryVariables[0]);


    return (
      <div className={styles.category}>
        <Category direction={direction} setDirection={setDirection} />
        <CardItem />
      </div>
    );
};

export default CategoryPage;