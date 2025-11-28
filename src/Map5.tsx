import { useState, useRef, useMemo, useCallback, type ChangeEvent } from "react";
import { Map, Source, Layer, type MapRef, type MapLayerMouseEvent } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import Papa from "papaparse";

import type { FeatureCollection, Feature, Point } from "geojson";
import type { LayerSpecification } from "maplibre-gl";

// ---------------------------------------------------------
// Map layer
// ---------------------------------------------------------
// const pointLayer: LayerSpecification = {
//     id: "points-layer",
//     type: "circle",
//     source: "points",
//     paint: {
//         "circle-radius": 4,
//         "circle-color": [
//             "case",
//             ["boolean", ["feature-state", "selected"], false],
//             "#00E5FF",
//             "#FF5722"
//         ],
//         "circle-stroke-width": 1,
//         "circle-stroke-color": "#333",
//     },
// };
const pointLayer: LayerSpecification = {
    id: "points-layer",
    type: "circle",
    source: "points",
    paint: {
        "circle-radius": [
            "case",
            ["boolean", ["feature-state", "selected"], false],
            8,
            4
        ],
        "circle-color": [
            "case",
            ["boolean", ["feature-state", "selected"], false],
            "#00E5FF",
            "#FF5722"
        ],
        "circle-stroke-width": 1,
        "circle-stroke-color": "#333",
    },
};
// ---------------------------------------------------------
// Component
// ---------------------------------------------------------
export default function MapPage() {
    const mapRef = useRef<MapRef | null>(null);

    const [csvData, setCsvData] = useState<any[]>([]);
    console.log(csvData);
    const [geojson, setGeojson] = useState<FeatureCollection<Point>>({
        type: "FeatureCollection",
        features: []
    });

    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<Feature<Point> | null>(null);

    // ---------------------------------------------------------
    // LOAD CSV FILE
    // ---------------------------------------------------------
    const handleCSVUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const rows = results.data as any[];

                // Build GeoJSON
                const features: Feature<Point>[] = rows
                    .filter(r => r.LATITUD && r.LONGITUD)
                    .map((r, idx) => ({
                        type: "Feature",
                        id: idx,
                        properties: { 
                            ...r,
                            id: idx
                        },
                        geometry: {
                            type: "Point",
                            coordinates: [
                                parseFloat(r.LONGITUD),
                                parseFloat(r.LATITUD)
                            ]
                        }
                    }));

                setCsvData(rows);
                setGeojson({ type: "FeatureCollection", features });
            }
        });
    };

    // ---------------------------------------------------------
    // SEARCH
    // ---------------------------------------------------------
    const filtered = useMemo(() => {
        if (!search.trim()) return geojson.features;

        const s = search.toLowerCase();

        return geojson.features.filter((f) =>
            JSON.stringify(f.properties).toLowerCase().includes(s)
        );
    }, [search, geojson]);

    // ---------------------------------------------------------
    // MAP CLICK
    // ---------------------------------------------------------
    const handleMapClick = useCallback((e: MapLayerMouseEvent) => {
        const map = mapRef.current?.getMap();
        if (!map) return;

        const features = map.queryRenderedFeatures([e.point.x, e.point.y], {
            layers: ["points-layer"]
        });

        if (!features.length) return;

        const f = features[0] as Feature<Point>;
        setSelected(f);

        map.flyTo({
            center: f.geometry.coordinates as [number, number],
            zoom: 12,
            duration: 800
        });
    }, []);

    // ---------------------------------------------------------
    // TABLE ROW CLICK
    // ---------------------------------------------------------
    const handleRowClick = (f: Feature<Point>) => {
        setSelected(f);

        mapRef.current?.flyTo({
            center: f.geometry.coordinates as [number, number],
            zoom: 12,
            duration: 800
        });
    };

    // ---------------------------------------------------------
    // UPDATE SELECTED FEATURE STATE
    // ---------------------------------------------------------
    useMemo(() => {
        const map = mapRef.current?.getMap();
        if (!map) return;

        map.removeFeatureState({ source: "points" });

        if (selected) {
            map.setFeatureState(
                { source: "points", id: selected.id },
                { selected: true }
            );
        }
    }, [selected]);

    return (
        <div style={{ display: "flex", height: "100vh" }}>
            {/* SIDEBAR */}
            <div
                style={{
                    width: "360px",
                    borderRight: "1px solid #ccc",
                    padding: "10px",
                    overflowY: "auto",
                }}
            >
                <h3>Upload CSV</h3>

                {/* Upload Button */}
                <input
                    type="file"
                    accept=".csv"
                    onChange={handleCSVUpload}
                    style={{ marginBottom: "10px" }}
                />

                {/* Selected Feature */}
                {selected && (
                    <div
                        style={{
                            marginBottom: "20px",
                            padding: "10px",
                            background: "#f7f7f7",
                            borderRadius: "6px",
                            border: "1px solid #ddd",
                            fontSize: "13px",
                        }}
                    >
                        <h4>Selected Record</h4>
                        {Object.entries(selected.properties ?? {}).map(([k, v]) => (
                            <p key={k}><b>{k}:</b> {String(v)}</p>
                        ))}
                    </div>
                )}

                {/* Search */}
                <input
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                        width: "100%",
                        padding: "6px",
                        marginBottom: "10px",
                        border: "1px solid #ccc",
                    }}
                />

                {/* Table */}
                <table
                    style={{
                        width: "100%",
                        fontSize: "12px",
                        borderCollapse: "collapse",
                    }}
                >
                    <thead>
                        <tr>
                            <th style={{ textAlign: "left" }}>FOLIO</th>
                            <th style={{ textAlign: "left" }}>LIB</th>
                            <th style={{ textAlign: "left" }}>TELEFONO</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.slice(0, 500).map((f) => (
                            <tr
                                key={f.id}
                                onClick={() => handleRowClick(f)}
                                style={{
                                    cursor: "pointer",
                                    background:
                                        selected?.id === f.id ? "#e0f7fa" : "transparent",
                                }}
                            >
                                <td>{f.properties?.FOLIO}</td>
                                <td>{f.properties?.LIB}</td>
                                <td>{f.properties?.TELEFONO}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <p style={{ fontSize: "11px", marginTop: "10px" }}>
                    Showing {filtered.length > 500 ? 500 : filtered.length} / {filtered.length}
                </p>
            </div>

            {/* MAP */}
            <div style={{ flex: 1 }}>
                <Map
                    ref={mapRef}
                    onClick={handleMapClick}
                    initialViewState={{
                        longitude: -99,
                        latitude: 24,
                        zoom: 4,
                    }}
                    style={{ width: "100%", height: "100%" }}
                    mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
                >
                    <Source id="points" type="geojson" data={geojson} promoteId="id">
                        <Layer {...pointLayer} />
                    </Source>
                </Map>
            </div>
        </div>
    );
}