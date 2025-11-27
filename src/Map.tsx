import { type FC, useRef, useState, type ChangeEvent } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import { Icon, Marker as LeafletMarker } from "leaflet";
import "leaflet/dist/leaflet.css";

interface LocationPoint {
  id: number;
  position: { lat: number; lng: number };
  title: string;
  description: string;
}

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
  {
    id: 3,
    position: { lat: 40.7128, lng: -74.006 },
    title: "Point C",
    description: "Example description for Point C.",
  },
];

// Default Leaflet marker icon
const markerIcon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});


// 🔥 Component to move map programmatically
const FlyToPoint: FC<{ position: { lat: number; lng: number } }> = ({
  position,
}) => {
  const map = useMap();
  map.flyTo(position, 14, { duration: 0.7 });
  return null;
};


const MapWithTable: FC = () => {
  const [search, setSearch] = useState("");
  const [selectedPoint, setSelectedPoint] = useState<LocationPoint | null>(null);

  // Store marker refs so we can open popups programmatically
  const markerRefs = useRef<Record<number, LeafletMarker | null>>({});

  // Filter table items
  const filtered = locations.filter((loc) =>
    loc.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleRowClick = (point: LocationPoint) => {
    setSelectedPoint(point);

    // Open popup
    const marker = markerRefs.current[point.id];
    marker?.openPopup();
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* LEFT SIDE — TABLE */}
      <div style={{ width: "35%", padding: "10px", overflowY: "auto" }}>
        <h2>Points</h2>

        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setSearch(e.target.value)
          }
          style={{
            width: "100%",
            padding: "8px",
            marginBottom: "12px",
            fontSize: "16px",
          }}
        />

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr>
              <th style={{ textAlign: "left", paddingBottom: "8px" }}>
                Title
              </th>
              <th style={{ textAlign: "left", paddingBottom: "8px" }}>
                Description
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((loc) => (
              <tr
                key={loc.id}
                onClick={() => handleRowClick(loc)}
                style={{
                  cursor: "pointer",
                  background:
                    selectedPoint?.id === loc.id ? "#f0f0f0" : "transparent",
                }}
              >
                <td style={{ padding: "6px 0" }}>{loc.title}</td>
                <td style={{ padding: "6px 0" }}>{loc.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* RIGHT SIDE — MAP */}
      <div style={{ width: "65%" }}>
        <MapContainer
          center={{ lat: 40.7128, lng: -74.006 }}
          zoom={12}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />

          {selectedPoint && <FlyToPoint position={selectedPoint.position} />}

          {locations.map((loc) => (
            <Marker
              key={loc.id}
              position={loc.position}
              icon={markerIcon}
              ref={(ref) => {
                markerRefs.current[loc.id] = ref;
              }}
            >
              <Popup>
                <h3>{loc.title}</h3>
                <p>{loc.description}</p>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default MapWithTable;
