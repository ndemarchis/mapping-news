"use client";

import React, { useState, useEffect, useRef } from "react";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { toStringXY } from "ol/coordinate";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import VectorLayer from "ol/layer/Vector";

export function MapComponent() {
  const [map, setMap] = useState();
  const mapElement = useRef<HTMLDivElement>();
  const mapRef = useRef();
  mapRef.current = map;

  const vectorSource = new VectorSource({
    url: "/linknyc/linknyc.geojson",
    format: new GeoJSON(),
  });

  const vectorLayer = new VectorLayer({
    source: vectorSource,
  });

  useEffect(() => {
    const osmLayer = new TileLayer({
      preload: Infinity,
      source: new OSM(),
    });

    const map = new Map({
      target: mapElement.current,
      layers: [osmLayer, vectorLayer],
      view: new View({
        center: [-73.96, 40.69],
        zoom: 10.12,
        projection: "EPSG:4326",
      }),
    });
    return () => map.setTarget(undefined);
  }, []);

  return (
    <div
      style={{ height: "100%", width: "100%" }}
      ref={mapElement as React.RefObject<HTMLDivElement>}
      className="map-container"
    />
  );
}

export default function Openlayers() {
  return (
    <div className="flex h-full min-h-[calc(100vh-6rem)] w-full flex-col items-center justify-center pt-16">
      <MapComponent />
    </div>
  );
}
