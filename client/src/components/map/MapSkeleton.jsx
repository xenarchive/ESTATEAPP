import './mapSkeleton.scss';

function MapSkeleton() {
  return (
    <div className="map-skeleton">
      <div className="skeleton-map-container">
        <div className="skeleton-map-content">
          <div className="skeleton-loading-text">Loading map...</div>
          <div className="skeleton-spinner"></div>
        </div>
      </div>
    </div>
  );
}

export default MapSkeleton; 