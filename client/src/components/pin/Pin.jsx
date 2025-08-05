import { Marker, Popup } from "react-leaflet";
import "./pin.scss";
import { Link } from "react-router-dom";

function Pin({ item }) {
  // Debug: Log the item to see what data we're receiving
  console.log('Pin item:', item);
  
  // Convert string coordinates to numbers
  const latitude = parseFloat(item.latitude);
  const longitude = parseFloat(item.longitude);
  
  console.log('Pin coordinates:', latitude, longitude);
  
  // Only render marker if coordinates are valid
  if (isNaN(latitude) || isNaN(longitude)) {
    console.log('Invalid coordinates for item:', item.id);
    return null;
  }

  return (
    <Marker position={[latitude, longitude]}>
      <Popup>
        <div className="popupContainer">
          <img src={item.img || item.images?.[0] || "/noavatar.jpg"} alt="" />
          <div className="textContainer">
            <Link to={`/${item.id}`}>{item.title}</Link>
            <span>{item.bedroom} bedroom</span>
            <b>$ {item.price}</b>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

export default Pin;
