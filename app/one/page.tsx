"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import VectorLayer from "ol/layer/Vector";
import Style from "ol/style/Style";
import Stroke from "ol/style/Stroke";
import Circle from "ol/style/Circle";

export default function Openlayers() {
  const [map, setMap] = useState();
  const mapElement = useRef<HTMLDivElement>();
  const mapRef = useRef();
  mapRef.current = map;

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

  useEffect(() => {
    const osmLayer = new TileLayer({
      preload: Infinity,
      source: new OSM(),
    });

    const vectorSource = new VectorSource({
      url: "/one/live",
      format: new GeoJSON(),
    });

    const vectorLayer = new VectorLayer({
      source: vectorSource,
      // style: (feature, _) => {
      //   const color =
      //     feature.get("Planned Kiosk Type") === "Link1.0" ? "blue" : "red";
      //   return dotStyle(color);
      // },
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
        ref={mapElement as React.RefObject<HTMLDivElement>}
        className="map-container h-[1000px] w-full"
      />
    </div>
  );
}
