import "./CardItem.css";

const CardItem = () => {
  return (
    <article class="card">
      <div class="card-img">
        <div class="card-imgs">
          <img
            src="https://www.mad4wheels.com/img/free-car-images/mobile/21549/novitec-esteso-based-on-2023-ferrari-purosangue--2025-thumb.jpg"
            alt=""
          />
        </div>
      </div>
      <div class="project-info">
        <div class="flex">
          <div class="project-title">Title card</div>
          <span class="tag">type</span>
        </div>
        <span class="lighter">
          Lorem ipsum, dolor sit amet consectetur adipisicing elit. Repudiandae
          voluptas ullam aut incidunt minima.
        </span>
      </div>
    </article>
  );
};

export default CardItem;
