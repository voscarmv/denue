import { Map, Source, Layer } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import type { FeatureCollection, Point } from "geojson";
import type {
  LayerSpecification,
  FilterSpecification,
} from "maplibre-gl";

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
// Filters (must match FilterSpecification)
// ---------------------------------------------------------
const clusterFilter: FilterSpecification = ["has", "point_count"];
const unclusteredFilter: FilterSpecification = ["!", ["has", "point_count"]];

// ---------------------------------------------------------
// Layers (must match LayerSpecification)
// ---------------------------------------------------------
const clusterLayer: LayerSpecification = {
  id: "clusters",
  type: "circle",
  source: "points",
  filter: clusterFilter,
  paint: {
    "circle-radius": [
      "step",
      ["get", "point_count"],
      15, 50, 20, 200, 30,
    ],
    "circle-color": "#007AFF",
  },
};

const clusterCountLayer: LayerSpecification = {
  id: "cluster-count",
  type: "symbol",
  source: "points",
  filter: clusterFilter,
  layout: {
    "text-field": "{point_count_abbreviated}",
    "text-size": 12,
  },
};

const unclusteredLayer: LayerSpecification = {
  id: "unclustered-point",
  type: "circle",
  source: "points",
  filter: unclusteredFilter,
  paint: {
    "circle-radius": 5,
    "circle-color": "#FF5722",
  },
};

// ---------------------------------------------------------
// Component
// ---------------------------------------------------------
export default function MapPage() {
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
      <Source
        id="points"
        type="geojson"
        data={pointsGeoJSON}
        cluster={true}
        clusterRadius={50}
      >
        <Layer {...clusterLayer} />
        <Layer {...clusterCountLayer} />
        <Layer {...unclusteredLayer} />
      </Source>
    </Map>
  );
}
