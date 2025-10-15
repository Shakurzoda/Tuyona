import "./CardItem.css";
import { Link } from "react-router-dom";
import { buildVenueHref } from "/src/lib/links";

const CardItem = ({item}) => {

  const href = buildVenueHref(item);

  return (
    <Link to={href}>
      <div className="card">
        <div className="card-image">
          <img src={item.img} alt="img" />
        </div>
        <p className="card-title">{item.title}</p>
        <p className="card-body">{item.description}</p>
        {/*         <p class="footer">
          Written by <span class="by-name">John Doe</span> on{" "}
          <span class="date">25/05/23</span>
        </p> */}
      </div>
    </Link>
  );
};

export default CardItem;
