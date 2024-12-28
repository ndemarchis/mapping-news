"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Feature, Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import VectorLayer from "ol/layer/Vector";
import Style from "ol/style/Style";
import Stroke from "ol/style/Stroke";
import Circle from "ol/style/Circle";
import Select from "ol/interaction/Select";
import { click } from "ol/events/condition";
import { Geometry } from "ol/geom";

export default function Openlayers() {
  const [feature, setFeature] = useState<Feature<Geometry>>();
  const featureProperties = feature?.getProperties();
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

    const selectClick = new Select({
      condition: click,
      // style: selectStyle,
    });

    map.addInteraction(selectClick);
    selectClick.on("select", (e) => {
      const features = e.selected;
      const feature = features?.[0];
      setFeature(feature);
    });

    return () => map.setTarget(undefined);
  }, []);

  return (
    <div className="flex h-full min-h-[calc(100vh-6rem)] w-full flex-col items-center justify-center py-8">
      <div
        ref={mapElement as React.RefObject<HTMLDivElement>}
        className="map-container h-[600px] w-full"
      />
      <div className="z-10 flex flex-row gap-4 text-sm">
        <p>{JSON.stringify(featureProperties, null, 2)}</p>
      </div>
    </div>
  );
}
