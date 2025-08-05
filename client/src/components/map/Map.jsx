import { MapContainer, TileLayer } from 'react-leaflet'
import './map.scss'
import "leaflet/dist/leaflet.css";
import Pin from '../pin/Pin';
import L from 'leaflet';

// Fix for default markers not showing up
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function Map({items}){
  // Debug: Log the items to see what data we're receiving
  console.log('Map items:', items);
  
  // Convert string coordinates to numbers and provide fallbacks
  const getCenter = () => {
    if (items.length === 1 && items[0].latitude && items[0].longitude) {
      const lat = parseFloat(items[0].latitude);
      const lng = parseFloat(items[0].longitude);
      console.log('Map center coordinates:', lat, lng);
      return [lat, lng];
    }
    console.log('Using default center coordinates');
    return [52.4797, -1.90269]; // Default center
  };

  return (
    <MapContainer 
      center={getCenter()} 
      zoom={7} 
      scrollWheelZoom={false} 
      className='map'
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {items.map(item=>(
        <Pin item={item} key={item.id}/>
      ))}
    </MapContainer>
  )
}

export default Map