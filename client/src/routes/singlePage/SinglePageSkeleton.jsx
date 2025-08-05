import "./singlePageSkeleton.scss";

function SinglePageSkeleton() {
  return (
    <div className="singlePage-skeleton">
      <div className="details-skeleton">
        <div className="wrapper-skeleton">
          <div className="slider-skeleton">
            <div className="skeleton-image-large"></div>
          </div>
          <div className="info-skeleton">
            <div className="top-skeleton">
              <div className="post-skeleton">
                <div className="skeleton-title-large"></div>
                <div className="skeleton-address">
                  <div className="skeleton-icon"></div>
                  <div className="skeleton-text"></div>
                </div>
                <div className="skeleton-price"></div>
              </div>
              <div className="user-skeleton">
                <div className="skeleton-avatar"></div>
                <div className="skeleton-username"></div>
              </div>
            </div>
            <div className="bottom-skeleton">
              <div className="skeleton-description"></div>
              <div className="skeleton-description"></div>
              <div className="skeleton-description-short"></div>
            </div>
          </div>
        </div>
      </div>
      <div className="features-skeleton">
        <div className="wrapper-skeleton">
          <div className="skeleton-section-title"></div>
          <div className="listVertical-skeleton">
            {[1, 2, 3].map((i) => (
              <div key={i} className="feature-skeleton">
                <div className="skeleton-icon-small"></div>
                <div className="featureText-skeleton">
                  <div className="skeleton-text-small"></div>
                  <div className="skeleton-text-medium"></div>
                </div>
              </div>
            ))}
          </div>
          <div className="skeleton-section-title"></div>
          <div className="sizes-skeleton">
            {[1, 2, 3].map((i) => (
              <div key={i} className="size-skeleton">
                <div className="skeleton-icon-small"></div>
                <div className="skeleton-text-small"></div>
              </div>
            ))}
          </div>
          <div className="skeleton-section-title"></div>
          <div className="listHorizontal-skeleton">
            {[1, 2, 3].map((i) => (
              <div key={i} className="feature-skeleton">
                <div className="skeleton-icon-small"></div>
                <div className="featureText-skeleton">
                  <div className="skeleton-text-small"></div>
                  <div className="skeleton-text-medium"></div>
                </div>
              </div>
            ))}
          </div>
          <div className="skeleton-section-title"></div>
          <div className="mapContainer-skeleton">
            <div className="skeleton-map"></div>
          </div>
          <div className="buttons-skeleton">
            <div className="skeleton-button"></div>
            <div className="skeleton-button"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SinglePageSkeleton; 