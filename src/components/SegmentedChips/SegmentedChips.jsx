import styles from "./SegmentedChips.module.css";
import {test} from "./test";
import clsx from "clsx";


const SegmentedChips = () => {
    return (
      <div>
        <div className={styles.courses__items}>
          {test.map((directionElement) => (
            <div
              key={directionElement.directionName}
              className={clsx(styles.item, {
                [styles.activeItem]:
                  test.directionName === directionElement.directionName,
              })}
            >
              {directionElement.title}
            </div>
          ))}
        </div>
      </div>
    );
};

export default SegmentedChips;