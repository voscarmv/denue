import { type FC, useState } from "react";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader,
} from "@react-google-maps/api";

const containerStyle: React.CSSProperties = {
  width: "100%",
  height: "100vh",
};

interface LocationPoint {
  id: number;
  position: google.maps.LatLngLiteral;
  title: string;
  description: string;
}

const center: google.maps.LatLngLiteral = {
  lat: 40.7128,
  lng: -74.006,
};

const locations: LocationPoint[] = [
  {
    id: 1,
    position: { lat: 40.73061, lng: -73.935242 },
    title: "Point A",
    description: "This is information about Point A.",
  },
  {
    id: 2,
    position: { lat: 40.650002, lng: -73.949997 },
    title: "Point B",
    description: "Details and information about Point B.",
  },
];

const MyMap: FC = () => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GMAPS_KEY,
  });

  const [activeMarker, setActiveMarker] = useState<number | null>(null);

  const handleActiveMarker = (markerId: number) => {
    if (markerId === activeMarker) return;
    setActiveMarker(markerId);
  };

  if (!isLoaded) return <p>Loading map…</p>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={10}
      onClick={() => setActiveMarker(null)}
    >
      {locations.map(({ id, position, title, description }) => (
        <Marker
          key={id}
          position={position}
          onClick={() => handleActiveMarker(id)}
        >
          {activeMarker === id && (
            <InfoWindow onCloseClick={() => setActiveMarker(null)}>
              <div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            </InfoWindow>
          )}
        </Marker>
      ))}
    </GoogleMap>
  );
};

export default MyMap;
