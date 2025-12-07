"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/StadiaMaps";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import VectorLayer from "ol/layer/Vector";
import Style from "ol/style/Style";
import Stroke from "ol/style/Stroke";
import Circle from "ol/style/Circle";

export default function Openlayers() {
  const [map, setMap] = useState();
  const mapElement = useRef<HTMLDivElement>(undefined);
  const mapRef = useRef(undefined);
  mapRef.current = map;

  const vectorSource = new VectorSource({
    url: "/linknyc/linknyc.geojson",
    format: new GeoJSON(),
  });

  const dotStyle = useCallback(
    (color: string) =>
      new Style({
        image: new Circle({
          stroke: new Stroke({
            color: color,
            width: 1.5,
          }),
          radius: 3,
        }),
      }),
    [],
  );

  const vectorLayer = new VectorLayer({
    source: vectorSource,
    style: (feature, _) => {
      const color =
        feature.get("Planned Kiosk Type") === "Link1.0" ? "blue" : "red";
      return dotStyle(color);
    },
  });

  useEffect(() => {
    const osmLayer = new TileLayer({
      preload: Infinity,
      source: new OSM({ layer: "alidade_smooth", retina: true }),
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
    <div className="flex h-full min-h-[calc(100vh-6rem)] w-full flex-col items-center justify-center py-8">
      <div
        ref={mapElement as React.RefObject<HTMLDivElement | null>}
        className="map-container h-full w-full"
      />
    </div>
  );
}
