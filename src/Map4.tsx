import { useState, useRef, useMemo, useCallback, type ChangeEvent } from "react";
import { Map, Source, Layer, type MapRef, type MapLayerMouseEvent } from "react-map-gl/maplibre";
// import type { MapRef } from "react-map-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import type { FeatureCollection, Feature, Point } from "geojson";
import type { LayerSpecification } from "maplibre-gl";

// ---------------------------------------------------------
// Generate 30k points
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
// Point layer (unclustered)
// ---------------------------------------------------------
const unclusteredLayer: LayerSpecification = {
  id: "points-layer",
  type: "circle",
  source: "points",
  paint: {
    "circle-radius": 4,
    "circle-color": [
      "case",
      ["boolean", ["feature-state", "selected"], false],
      "#00E5FF", // selected point
      "#FF5722"  // default point
    ],
    "circle-stroke-width": 1,
    "circle-stroke-color": "#333",
  },
};

// ---------------------------------------------------------
// Component
// ---------------------------------------------------------
export default function MapPage4() {
  const mapRef = useRef<MapRef | null>(null);

  const [search, setSearch] = useState("");
  const [selectedFeature, setSelectedFeature] =
    useState<Feature<Point, { id: number }> | null>(null);

  // Search points by id
  const filteredPoints = useMemo(() => {
    if (!search.trim()) return pointsGeoJSON.features;
    const s = search.toLowerCase();
    return pointsGeoJSON.features.filter((f) =>
      f.properties!.id.toString().includes(s)
    );
  }, [search]);

  // -------------------------------------------------------
  // Handle clicking a point on the MAP
  // -------------------------------------------------------
const handleMapClick = useCallback((e: MapLayerMouseEvent) => {
  const map = mapRef.current?.getMap();
  if (!map) return;

  const features = map.queryRenderedFeatures([e.point.x, e.point.y], {
    layers: ["points-layer"],
  });

  if (!features.length) return;

  const feature = features[0] as unknown as Feature<Point, { id: number }>;
  setSelectedFeature(feature);

  const [lng, lat] = feature.geometry.coordinates;

  map.flyTo({
    center: [lng, lat],
    zoom: 12,
    duration: 800,
  });
}, []);


  // -------------------------------------------------------
  // Handle clicking a row in the TABLE
  // -------------------------------------------------------
  const handleRowClick = (feature: Feature<Point, { id: number }>) => {
    setSelectedFeature(feature);
    const [lng, lat] = feature.geometry.coordinates;

    mapRef.current?.flyTo({
      center: [lng, lat],
      zoom: 12,
      duration: 800,
    });
  };

  // Highlight selected feature in the map
  const updateFeatureState = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    // Reset previous highlight
    map.removeFeatureState({ source: "points" });

    if (selectedFeature) {
      map.setFeatureState(
        {
          source: "points",
          id: selectedFeature.properties!.id,
        },
        { selected: true }
      );
    }
  }, [selectedFeature]);

  // Run after selection changes
  useMemo(updateFeatureState, [selectedFeature]);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* ----------------------- SIDEBAR ----------------------- */}
      <div
        style={{
          width: "300px",
          borderRight: "1px solid #ccc",
          padding: "10px",
          overflowY: "auto",
        }}
      >
        <h3>Points</h3>

        {/* Search */}
        <input
          placeholder="Search by ID..."
          value={search}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setSearch(e.target.value)
          }
          style={{
            width: "100%",
            padding: "6px",
            marginBottom: "10px",
            border: "1px solid #ccc",
          }}
        />

        {/* Table */}
        <table style={{ width: "100%", fontSize: "14px" }}>
          <thead>
            <tr>
              <th>ID</th>
            </tr>
          </thead>
          <tbody>
            {filteredPoints.slice(0, 500).map((f) => (
              <tr
                key={f.properties!.id}
                onClick={() => handleRowClick(f)}
                style={{
                  cursor: "pointer",
                  background:
                    selectedFeature?.properties!.id === f.properties!.id
                      ? "#e0f7fa"
                      : "transparent",
                }}
              >
                <td>{f.properties!.id}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p style={{ fontSize: "12px", marginTop: "10px" }}>
          Showing first 500 / {filteredPoints.length} matches
        </p>
      </div>

      {/* ----------------------- MAP ----------------------- */}
      <div style={{ flex: 1 }}>
        <Map
          ref={mapRef}
          onClick={handleMapClick}
          initialViewState={{
            longitude: -73.95,
            latitude: 40.75,
            zoom: 9,
          }}
          style={{ width: "100%", height: "100%" }}
          mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
        >
          <Source
            id="points"
            type="geojson"
            data={pointsGeoJSON}
            promoteId="id" // enables feature-state
          >
            <Layer {...unclusteredLayer} />
          </Source>
        </Map>
      </div>
    </div>
  );
}