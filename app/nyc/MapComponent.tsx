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
import { ArticlesDefinition } from "./types";
import About from "./About";
import { FeatureLike } from "ol/Feature";
import Fill from "ol/style/Fill";
import MapModal from "./MapModal";
import useMediaQuery from "@/lib/hooks/use-media-query";

const MapComponent = () => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedArticles, setSelectedArticles] =
    useState<ArticlesDefinition>(null);

  const [map, setMap] = useState();
  const mapElement = useRef<HTMLDivElement>();
  const mapRef = useRef();
  mapRef.current = map;

  const handleFeatureClick = async (feature: Feature<Geometry>) => {
    const properties = feature?.getProperties();
    if (!properties) return;
    setShowModal(true);
    setLoading(true);
    await fetch(`/nyc/live/articles/${properties.place_id}`, {
      cache: "force-cache",
      next: { revalidate: 1800 },
    })
      .then((response) => response.json())
      .then((data) => {
        setSelectedArticles({
          address: properties.title,
          place_id: properties.place_id,
          articles: data,
        });
        setLoading(false);
      });
  };

  useEffect(() => {
    if (!showModal) {
      setSelectedArticles(null);
    }
  }, [showModal]);

  const { isMobile } = useMediaQuery();
  const sizeDependentDotStyles = {
    radius: isMobile ? 8 : 4,
    strokeWidth: isMobile ? 3 : 2,
  };

  const getRadius = (count: number) => {
    if (!(count >= 0)) return sizeDependentDotStyles.radius;
    return (
      sizeDependentDotStyles.radius *
      Math.max(1, Math.log(count) / Math.log(2.2) + 1)
    );
  };

  const getColor = (index: number) => {
    return "rgba(0, 0, 255, 0.5)";
  };

  const dotStyle = useCallback(
    (feature: FeatureLike) => {
      const radius = getRadius(feature.get("count"));
      const color = getColor(0);
      return new Style({
        image: new Circle({
          stroke: new Stroke({
            width: sizeDependentDotStyles.strokeWidth,
            color: "rgba(255, 255, 255, 0.5)",
          }),
          fill: new Fill({
            color,
          }),
          radius,
        }),
      });
    },
    [sizeDependentDotStyles.radius, sizeDependentDotStyles.strokeWidth],
  );

  useEffect(() => {
    return initializeMap(mapElement);
  }, []);

  return (
    <>
      <MapModal
        showModal={showModal}
        setShowModal={setShowModal}
        selectedArticles={selectedArticles}
        loading={loading}
      />
      <div className="flex h-full w-full flex-col items-center justify-center pb-8 pt-16">
        <div
          ref={mapElement as React.RefObject<HTMLDivElement>}
          className="map-container h-[calc(100vh-12rem)] w-full"
        />
      </div>
      <About />
    </>
  );

  function initializeMap(
    mapElement: React.MutableRefObject<HTMLDivElement | undefined>,
  ) {
    const osmLayer = new TileLayer({
      preload: Infinity,
      source: new OSM(),
    });

    const vectorSource = new VectorSource({
      url: "/nyc/live/locations",
      format: new GeoJSON(),
    });

    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: (feature, _) => {
        return dotStyle(feature);
      },
    });

    const map = new Map({
      target: mapElement.current,
      layers: [osmLayer, vectorLayer],
      view: new View({
        center: [-8233189, 4966723],
        zoom: 11,
        projection: "EPSG:3857",
      }),
    });

    const selectClick = new Select({
      condition: click,
      // style: selectStyle,
    });

    map.addInteraction(selectClick);
    selectClick.on("select", async (e) => {
      const features = e.selected;
      const feature = features?.[0];
      await handleFeatureClick(feature);
    });

    map.on("pointermove", (event) => {
      const hit = map.hasFeatureAtPixel(event.pixel);
      map.getTargetElement().style.cursor = hit ? "pointer" : "";
    });

    return () => map.setTarget(undefined);
  }
};

export default MapComponent;
