import { Map, Source, Layer } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import type { FeatureCollection, Point } from "geojson";
import type { LayerSpecification } from "maplibre-gl";

// ---------------------------------------------------------
// 30,000 fake points
// ---------------------------------------------------------
const pointsGeoJSON: FeatureCollection<Point, { id: number }> = {
  type: "FeatureCollection",
  features: Array.from({ length: 30000 }).map((_, i) => ({
    type: "Feature",
    properties: { id: i },
    geometry: {
      type: "Point",
      coordinates: [
        -73.93 + Math.random() * 0.4,
        40.7 + Math.random() * 0.4,
      ],
    },
  })),
};

// ---------------------------------------------------------
// Unclustered layer (no filtering)
// ---------------------------------------------------------
const unclusteredLayer: LayerSpecification = {
  id: "points-layer",
  type: "circle",
  source: "points",
  paint: {
    "circle-radius": 4,
    "circle-color": "#FF5722",
    "circle-opacity": 0.8,
  },
};

// ---------------------------------------------------------
// Component
// ---------------------------------------------------------
export default function MapPage3() {
  return (
    <Map
      initialViewState={{
        longitude: -73.95,
        latitude: 40.75,
        zoom: 9,
      }}
      style={{ width: "100%", height: "100vh" }}
      mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
    >
      <Source id="points" type="geojson" data={pointsGeoJSON}>
        <Layer {...unclusteredLayer} />
      </Source>
    </Map>
  );
}
