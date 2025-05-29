import "./CardItem.css";
/* import image from "/src/assets/driving-car-their-honeymoon_3446-291.jpg"; */
import { Link } from "react-router";

const CardItem = ({item}) => {
  return (
    <Link to={`/${item.type}/${item.id}`}>
      <div class="card">
        <div class="card-image">
          <img src={item.img} alt="img" />
        </div>
        <p class="card-title">{item.title}</p>
        <p class="card-body">{item.description}</p>
        {/*         <p class="footer">
          Written by <span class="by-name">John Doe</span> on{" "}
          <span class="date">25/05/23</span>
        </p> */}
      </div>
    </Link>
  );
};

export default CardItem;
