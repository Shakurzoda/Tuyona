import "./CardItem.css";
/* import image from "/src/assets/driving-car-their-honeymoon_3446-291.jpg"; */
import { Link } from 'react-router';

const CardItem = () => {
  return (
    <Link to="/userAdDetails" className="card-item">
      <div class="card">
        <div class="card-image">
          <img
            src="https://img.freepik.com/premium-photo/groom-holds-hand-bride-with-bouquet-flowers-while-standing-paving-slabs-against_278455-2237.jpg?w=996"
            alt=""
          />
        </div>
        <p class="card-title">Мошин Люкс</p>
        <p class="card-body">
          Nullam ac tristique nulla, at convallis quam. Integer consectetur mi
          nec magna tristique, non lobortis.
        </p>
        {/*         <p class="footer">
          Written by <span class="by-name">John Doe</span> on{" "}
          <span class="date">25/05/23</span>
        </p> */}
      </div>
    </Link>
  );
};

export default CardItem;
