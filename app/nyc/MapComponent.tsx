"use client";

import React, { useState, useEffect, useRef } from "react";
import { Map, NavigationControl } from "maplibre-gl";
import { ArticlesDefinition } from "./types";
import About from "./About";
import { LoadingDots } from "@/components/shared/icons";
import ResponsiveSidebar from "./ResponsiveSidebar";
import Card from "@/components/home/card";
import Tutorial from "./Tutorial";

const MapComponent = () => {
  const [showModal, setShowModal] = useState(false);
  const [mapLoading, setMapLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(
    null,
  );
  const [selectedArticles, setSelectedArticles] =
    useState<ArticlesDefinition>(null);

  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);

  const handleFeatureClick = async (place_id: string, title: string) => {
    setShowModal(true);
    setModalLoading(true);
    await fetch(`/nyc/live/articles/${place_id}`, {
      cache: "force-cache",
      next: { revalidate: 1800 },
    })
      .then((response) => response.json())
      .then((data) => {
        setSelectedArticles({
          address: title,
          place_id,
          articles: data,
        });
        setSelectedArticleId(place_id);
        setModalLoading(false);
      });
  };

  useEffect(() => {
    if (!showModal) {
      setSelectedArticles(null);
      setSelectedArticleId(null);
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

        mapRef.current?.on("sourcedata", (e) => {
          if (e.sourceId === "locations" && e.isSourceLoaded) {
            setMapLoading(false);
          }
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
      <div className="grid h-full w-full grid-cols-1 pt-16 mo:grid-cols-[3fr_2fr] md:pb-8">
        <div
          ref={mapElement}
          className={`map-container relative z-10 h-[calc(100vh-12rem)]`}
        >
          <div
            aria-label={mapLoading ? "Loading map data..." : undefined}
            aria-hidden={mapLoading ? "false" : "true"}
            className={`pointer-events-none absolute z-50 flex h-[calc(100vh-12rem)] w-full max-w-[3fr] items-center justify-center bg-[#f3feff] transition-all ${
              mapLoading ? "opacity-70" : "opacity-0"
            }`}
          >
            <LoadingDots />
          </div>
        </div>
        <ResponsiveSidebar
          showModal={showModal}
          setShowModal={setShowModal}
          selectedArticles={selectedArticles}
          loading={modalLoading}
        />
      </div>
      <div className="items-left flex w-full p-4 mo:hidden md:max-w-xl">
        <div className="z-10 w-full rounded-xl border border-gray-200 bg-white p-4 shadow-md *:*:z-10">
          <Tutorial />
        </div>
      </div>
      <About />
    </>
  );
};

export default MapComponent;
