import "./cardSkeleton.scss";

function CardSkeleton() {
  return (
    <div className="card-skeleton">
      <div className="imageContainer-skeleton">
        <div className="skeleton-image"></div>
      </div>
      <div className="textContainer-skeleton">
        <div className="skeleton-title"></div>
        <div className="skeleton-address">
          <div className="skeleton-icon"></div>
          <div className="skeleton-text"></div>
        </div>
        <div className="skeleton-price"></div>
        <div className="bottom-skeleton">
          <div className="features-skeleton">
            <div className="feature-skeleton">
              <div className="skeleton-icon-small"></div>
              <div className="skeleton-text-small"></div>
            </div>
            <div className="feature-skeleton">
              <div className="skeleton-icon-small"></div>
              <div className="skeleton-text-small"></div>
            </div>
          </div>
          <div className="icons-skeleton">
            <div className="icon-skeleton"></div>
            <div className="icon-skeleton"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CardSkeleton; 