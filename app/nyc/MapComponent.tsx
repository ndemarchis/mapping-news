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
import Link from "ol/interaction/Link";
import { click } from "ol/events/condition";
import { Geometry } from "ol/geom";
import { ArticlesDefinition } from "./types";
import About from "./About";
import { FeatureLike } from "ol/Feature";
import Fill from "ol/style/Fill";
import MapModal from "./MapModal";
import useMediaQuery from "@/lib/hooks/use-media-query";
import { FeatureLoader } from "ol/featureloader";

const MapComponent = () => {
  const [showModal, setShowModal] = useState(false);
  const [isLocationsLoading, setIsLocationsLoading] = useState(false);
  const [isModalLoading, setIsModalLoading] = useState(false);
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
    setIsModalLoading(true);
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
        setIsModalLoading(false);
      });
  };

  useEffect(() => {
    if (!showModal) {
      setSelectedArticles(null);
    }
  }, [showModal]);

  const { isMobile } = useMediaQuery();
  const sizeDependentDotStyles = {
    radius: isMobile ? 10 : 5,
    strokeWidth: isMobile ? 3 : 2,
  };
  const dotStyle = useCallback(
    (feature: FeatureLike) => {
      const radius =
        sizeDependentDotStyles.radius * (feature.get("dot_size_factor") || 1);
      const color = feature.get("dot_color") || "rgba(0, 0, 0, 1)";
      return new Style({
        image: new Circle({
          stroke: new Stroke({
            width: sizeDependentDotStyles.strokeWidth,
            color: "rgba(255, 255, 255, 0.35)",
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

  const selectedDotStyle = useCallback(
    (feature: FeatureLike) => {
      const radius = sizeDependentDotStyles.radius * 1.5;
      const color = `rgba(255, 0, 0, 1)`;
      return new Style({
        image: new Circle({
          stroke: new Stroke({
            width: sizeDependentDotStyles.strokeWidth,
            color: "rgba(255, 255, 255, 0.35)",
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
        loading={isModalLoading}
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
    setIsLocationsLoading(true);

    const osmLayer = new TileLayer({
      preload: Infinity,
      source: new OSM(),
    });

    const vectorSource = new VectorSource({
      format: new GeoJSON(),
      loader: (extent, resolution, projection, success, failure) => {
        setIsLocationsLoading(true);
        fetch("/nyc/live/locations")
          .then((response) => response.json())
          .then((data) => {
            const features = vectorSource?.getFormat?.()?.readFeatures(data);
            if (!features) return;
            vectorSource.addFeatures(features);
            success?.(features);
          })
          .finally(() => {
            setIsLocationsLoading(false);
          })
          .catch((error) => {
            console.error(error);
            failure?.();
          });
      },
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
      style: selectedDotStyle,
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

    map.addInteraction(new Link());

    return () => map.setTarget(undefined);
  }
};

export default MapComponent;
