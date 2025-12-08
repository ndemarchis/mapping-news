"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";

export default function Leaflet() {
  const [geoJson, setGeoJson] = useState<
    Parameters<typeof GeoJSON>[number]["data"] | null
  >(null);
  async function fetchGeoJson() {
    const response = await fetch("/linknyc/linknyc.geojson");
    const data = await response.json();
    return data;
  }

  useEffect(() => {
    fetchGeoJson().then((data) => {
      setGeoJson(data);
    });
  }, []);

  return (
    <MapContainer
      className="h-[1000px] w-full"
      center={[40.69, -73.96]}
      zoom={10.12}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {geoJson && (
        <GeoJSON
          data={geoJson}
          style={(feature) => ({ color: "red", backgroundColor: "red" })}
        />
      )}
    </MapContainer>
  );
}
