import { useState, useRef, useMemo, useCallback, type ChangeEvent } from "react";
import { Map, Source, Layer, type MapRef, type MapLayerMouseEvent } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import Papa from "papaparse";

import type { FeatureCollection, Feature, Point } from "geojson";
import type { LayerSpecification } from "maplibre-gl";

// ---------------------------------------------------------
// Map layer
// ---------------------------------------------------------
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
export default function DenueMap() {
    const mapRef = useRef<MapRef | null>(null);

    const [geojson, setGeojson] = useState<FeatureCollection<Point>>({
        type: "FeatureCollection",
        features: []
    });

    const [search, setSearch] = useState("");
    const [personnelFilter, setPersonnelFilter] = useState("");
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
                const features: Feature<Point>[] = [];
                
                rows.forEach((r, idx) => {
                    // Adapt to denue inegi data structure (latitude and longitude)
                    const lat = parseFloat(r.latitud);
                    const lon = parseFloat(r.longitud);
                    
                    if (!isNaN(lat) && !isNaN(lon)) {
                         features.push({
                            type: "Feature",
                            id: idx,
                            properties: { 
                                ...r,
                                id: idx
                            },
                            geometry: {
                                type: "Point",
                                coordinates: [lon, lat]
                            }
                        });
                    }
                });

                setGeojson({ type: "FeatureCollection", features });
            }
        });
    };

    // ---------------------------------------------------------
    // SEARCH & FILTERS
    // ---------------------------------------------------------
    const uniquePersonnelOptions = useMemo(() => {
        const options = new Set<string>();
        geojson.features.forEach(f => {
            if (f.properties?.per_ocu) {
                options.add(String(f.properties.per_ocu));
            }
        });
        return Array.from(options).sort((a, b) => {
            // Helper to extract the first number in the string
            const getNum = (str: string) => {
                const match = str.match(/\d+/);
                return match ? parseInt(match[0], 10) : 0;
            };
            return getNum(a) - getNum(b);
        });
    }, [geojson]);

    const filtered = useMemo(() => {
        let result = geojson.features;

        if (personnelFilter) {
            result = result.filter(f => String(f.properties?.per_ocu) === personnelFilter);
        }

        if (search.trim()) {
            const s = search.toLowerCase();
            result = result.filter((f) =>
                JSON.stringify(f.properties).toLowerCase().includes(s)
            );
        }

        return result;
    }, [search, personnelFilter, geojson]);

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
            zoom: 16, // Better zoom for single establishment
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
            zoom: 16, // Better zoom for single establishment
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

        if (selected && selected.id !== undefined) {
            map.setFeatureState(
                { source: "points", id: selected.id },
                { selected: true }
            );
        }
    }, [selected]);

    return (
        <div style={{ display: "flex", height: "100vh", width: "100%", margin: 0, padding: 0 }}>
            {/* SIDEBAR */}
            <div
                style={{
                    width: "360px",
                    borderRight: "1px solid #ccc",
                    padding: "15px",
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    boxSizing: "border-box",
                    backgroundColor: "#fff"
                }}
            >
                <h3 style={{ margin: "0 0 15px 0", fontFamily: "sans-serif" }}>Cargar Datos DENUE</h3>

                {/* Upload Button */}
                <input
                    type="file"
                    accept=".csv"
                    onChange={handleCSVUpload}
                    style={{ marginBottom: "15px", width: "100%" }}
                />

                {/* Filters */}
                <select
                    value={personnelFilter}
                    onChange={(e) => setPersonnelFilter(e.target.value)}
                    style={{
                        width: "100%",
                        padding: "8px",
                        marginBottom: "10px",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        boxSizing: "border-box",
                        backgroundColor: "white",
                        fontFamily: "sans-serif"
                    }}
                >
                    <option value="">Todo el personal ocupado</option>
                    {uniquePersonnelOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>

                {/* Search */}
                <input
                    placeholder="Buscar establecimiento, municipio, etc..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                        width: "100%",
                        padding: "8px",
                        marginBottom: "15px",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        boxSizing: "border-box"
                    }}
                />

                {/* Selected Feature Info */}
                {selected && (
                    <div
                        style={{
                            marginBottom: "15px",
                            padding: "10px",
                            background: "#f8f9fa",
                            borderRadius: "6px",
                            border: "1px solid #dee2e6",
                            fontSize: "13px",
                            maxHeight: "350px",
                            overflowY: "auto",
                            fontFamily: "sans-serif"
                        }}
                    >
                        <h4 style={{ margin: "0 0 10px 0", color: "#333" }}>Registro Seleccionado</h4>
                        <p style={{ margin: "4px 0" }}><b>Establecimiento:</b> {selected.properties?.nom_estab}</p>
                        <p style={{ margin: "4px 0" }}><b>Actividad:</b> {selected.properties?.nombre_act}</p>
                        <p style={{ margin: "4px 0" }}><b>Personal:</b> {selected.properties?.per_ocu}</p>
                        <p style={{ margin: "4px 0" }}><b>Dirección:</b> {selected.properties?.tipo_vial} {selected.properties?.nom_vial} {selected.properties?.numero_ext}, {selected.properties?.nomb_asent}, {selected.properties?.municipio}, {selected.properties?.entidad}</p>
                        <details style={{ marginTop: "10px" }}>
                            <summary style={{cursor: "pointer", color: "#0d6efd", fontWeight: "bold"}}>Más detalles</summary>
                            <div style={{ marginTop: "8px" }}>
                                {Object.entries(selected.properties ?? {}).map(([k, v]) => (
                                    <p key={k} style={{margin: "2px 0", fontSize: "11px"}}><b>{k}:</b> {String(v)}</p>
                                ))}
                            </div>
                        </details>
                    </div>
                )}

                {/* Table container wrapping around remaining space */}
                <div style={{ flex: 1, overflowY: "auto", borderTop: "1px solid #eee", fontFamily: "sans-serif" }}>
                    <table
                        style={{
                            width: "100%",
                            fontSize: "12px",
                            borderCollapse: "collapse",
                        }}
                    >
                        <thead style={{ position: "sticky", top: 0, background: "#f8f9fa", zIndex: 1, boxShadow: "0 1px 2px rgba(0,0,0,0.1)" }}>
                            <tr>
                                <th style={{ textAlign: "left", padding: "8px", borderBottom: "2px solid #ccc" }}>Establecimiento</th>
                                <th style={{ textAlign: "left", padding: "8px", borderBottom: "2px solid #ccc" }}>Actividad</th>
                                <th style={{ textAlign: "left", padding: "8px", borderBottom: "2px solid #ccc" }}>Municipio</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.slice(0, 500).map((f) => (
                                <tr
                                    key={f.id}
                                    onClick={() => handleRowClick(f)}
                                    style={{
                                        cursor: "pointer",
                                        background: selected?.id === f.id ? "#e0f7fa" : "transparent",
                                        borderBottom: "1px solid #eee",
                                        transition: "background-color 0.2s"
                                    }}
                                    onMouseEnter={(e) => { if (selected?.id !== f.id) e.currentTarget.style.backgroundColor = "#f1f3f5"; }}
                                    onMouseLeave={(e) => { if (selected?.id !== f.id) e.currentTarget.style.backgroundColor = "transparent"; }}
                                >
                                    <td style={{ padding: "8px" }}>{f.properties?.nom_estab}</td>
                                    <td style={{ padding: "8px" }}>{f.properties?.nombre_act}</td>
                                    <td style={{ padding: "8px" }}>{f.properties?.municipio}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <p style={{ fontSize: "11px", marginTop: "10px", color: "#6c757d", textAlign: "center" }}>
                        Mostrando {Math.min(filtered.length, 500)} de {filtered.length} registros
                    </p>
                </div>
            </div>

            {/* MAP */}
            <div style={{ flex: 1, height: "100%" }}>
                <Map
                    ref={mapRef}
                    onClick={handleMapClick}
                    initialViewState={{
                        longitude: -99.1332,
                        latitude: 19.4326,
                        zoom: 5, // general Mexico view
                    }}
                    style={{ width: "100%", height: "100%" }}
                    mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
                >
                    <Source id="points" type="geojson" data={{ type: "FeatureCollection", features: filtered }} promoteId="id">
                        <Layer {...pointLayer} />
                    </Source>
                </Map>
            </div>
        </div>
    );
}
