"use client";

import React, { useState, useEffect, useRef } from "react";
import { Map, NavigationControl } from "maplibre-gl";
import { ArticlesDefinition } from "./types";
import { LoadingDots } from "@/components/shared/icons";
import ResponsiveSidebar from "./ResponsiveSidebar";
import { useSelectedPlace } from "./useSelectedPlace";
import { useSearchParams } from "next/navigation";

const MapComponent = () => {
  const [showPlaceDetail, setShowModal] = useState(false);
  const [mapLoading, setMapLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useSelectedPlace();
  const [selectedArticles, setSelectedArticles] =
    useState<ArticlesDefinition>(null);

  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const params = useSearchParams();

  const handleFeatureClick = (place_id: string, title?: string) => {
    getSelectedArticles(place_id, title);
  };

  const getSelectedArticles = async (place_id: string, title?: string) => {
    setShowModal(true);
    setModalLoading(true);
    await fetch(`/nyc/live/articles/${place_id}`)
      .then((response) => response.json())
      .then((data) => {
        setSelectedArticles({
          address: title ?? null,
          place_id,
          articles: data,
        });
        setSelectedPlace(place_id);
        setModalLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setModalLoading(false);
      });
  };

  useEffect(() => {
    const place_id = params.get("place_id");
    if (place_id !== selectedPlace && place_id) {
      setSelectedPlace(place_id);
    }

    if (!showPlaceDetail && selectedPlace) {
      setSelectedArticles(null);
      setSelectedPlace(null);
    }
  }, [showPlaceDetail, params]);

  useEffect(() => {
    if (
      selectedPlace &&
      !((selectedArticles?.articles?.length || 0) > 0) &&
      !mapLoading
    ) {
      getSelectedArticles(selectedPlace);
    }
  }, [selectedPlace, selectedArticles, mapLoading]);

  useEffect(() => {
    if (selectedPlace && mapRef?.current && !mapLoading) {
      const selectedFeature = mapRef.current.querySourceFeatures("locations", {
        filter: ["==", "place_id", selectedPlace],
      })?.[0];
      console.log(selectedFeature);
      if (selectedFeature) {
        mapRef.current.flyTo({
          // @ts-expect-error
          center: selectedFeature?.geometry?.coordinates,
          zoom: 11.5,
        });
      }
    }
  }, [selectedPlace, mapLoading]);

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

  useEffect(() => {
    // wait until locations layer is loaded

    if (mapRef.current && selectedPlace && !mapLoading) {
      if (mapRef.current.getLayer("selected-place")) {
        mapRef.current.removeLayer("selected-place");
      }

      mapRef.current.addLayer({
        id: "selected-place",
        type: "circle",
        source: "locations",
        filter: ["==", "place_id", selectedPlace],
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
          "circle-color": "red",
          "circle-stroke-width": sizeDependentDotStyles.strokeWidth,
          "circle-stroke-color": "rgba(255, 255, 255, 0.35)",
        },
      });
    }
  }, [selectedPlace, mapRef.current, mapLoading]);

  return (
    <>
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
        showModal={showPlaceDetail}
        setShowModal={setShowModal}
        selectedArticles={selectedArticles}
        setSelectedPlace={handleFeatureClick}
        loading={modalLoading}
      />
    </>
  );
};

export default MapComponent;
