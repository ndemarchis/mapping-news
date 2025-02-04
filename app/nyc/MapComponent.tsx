"use client";

import React, { useState, useEffect, useRef } from "react";
import { Map, NavigationControl } from "maplibre-gl";
import { ArticlesDefinition } from "./types";
import About from "./About";
import MapModal from "./MapModal";
import useMediaQuery from "@/lib/hooks/use-media-query";

const MapComponent = () => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedArticles, setSelectedArticles] =
    useState<ArticlesDefinition>(null);

  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);

  const handleFeatureClick = async (place_id: string, title: string) => {
    setShowModal(true);
    setLoading(true);
    await fetch(`/nyc/live/articles/${place_id}`, {
      cache: "force-cache",
      next: { revalidate: 1800 },
    })
      .then((response) => response.json())
      .then((data) => {
        setSelectedArticles({
          address: title,
          place_id: place_id,
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

  const sizeDependentDotStyles = {
    radius: 5,
    strokeWidth: 2,
  };

  useEffect(() => {
    if (mapElement.current && !mapRef.current) {
      mapRef.current = new Map({
        container: mapElement.current,
        style: "https://tiles.openfreemap.org/styles/positron", // Map style URL
        center: [-73.935242, 40.73061], // Initial map center [lng, lat]
        zoom: 11,
      });

      mapRef.current.addControl(new NavigationControl(), "top-right");

      mapRef.current.on("load", () => {
        mapRef.current?.addSource("locations", {
          type: "geojson",
          data: "/nyc/live/locations",
        });

        mapRef.current?.addLayer({
          id: "locations",
          type: "circle",
          source: "locations",
          paint: {
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              10,
              ["*", sizeDependentDotStyles.radius, ["get", "dot_size_factor"]],
              15,
              [
                "*",
                sizeDependentDotStyles.radius * 2,
                ["get", "dot_size_factor"],
              ],
            ],
            "circle-color": ["get", "dot_color"],
            "circle-stroke-width": sizeDependentDotStyles.strokeWidth,
            "circle-stroke-color": "rgba(255, 255, 255, 0.35)",
          },
        });

        mapRef.current?.on("click", "locations", (e: any) => {
          const feature = e.features?.[0];
          if (feature) {
            const { place_id, title } = feature.properties;
            handleFeatureClick(place_id, title);
          }
        });

        mapRef.current?.on("mouseenter", "locations", () => {
          if (mapRef.current) {
            mapRef.current.getCanvas().style.cursor = "pointer";
          }
        });

        mapRef.current?.on("mouseleave", "locations", () => {
          if (mapRef.current) {
            mapRef.current.getCanvas().style.cursor = "";
          }
        });
      });
    }

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [sizeDependentDotStyles.radius, sizeDependentDotStyles.strokeWidth]);

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
          ref={mapElement}
          className="map-container z-10 h-[calc(100vh-12rem)] w-full"
        />
      </div>
      <About />
    </>
  );
};

export default MapComponent;
