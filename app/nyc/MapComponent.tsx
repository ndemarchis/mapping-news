"use client";

import React, { useState, useEffect, useRef } from "react";
import { Map, NavigationControl } from "maplibre-gl";
import { ArticlesDefinition } from "./types";
import { LoadingDots } from "@/components/shared/icons";
import ResponsiveSidebar from "./ResponsiveSidebar";
import { useSelectedPlace } from "./useSelectedPlace";
import { usePathname } from "next/navigation";

interface MapComponentProps {
  initialData?: string;
}

const MapComponent = ({ initialData }: MapComponentProps) => {
  const [showPlaceDetail, setShowModal] = useState(false);
  const [mapLoading, setMapLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useSelectedPlace();
  const [selectedArticles, setSelectedArticles] =
    useState<ArticlesDefinition>(null);

  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const pathname = usePathname();

  // Handle custom events from dynamic routes
  useEffect(() => {
    const handlePlaceDataUpdate = (event: any) => {
      const { placeId, articles } = event.detail;

      if (placeId && articles) {
        setSelectedArticles({
          place_id: placeId,
          articles: articles,
          address: articles[0]?.location_name || null,
        });
        setShowModal(true);
        setModalLoading(false);
      }
    };

    // Add event listener
    window.addEventListener("place-data-update", handlePlaceDataUpdate);

    // Clean up
    return () => {
      window.removeEventListener("place-data-update", handlePlaceDataUpdate);
    };
  }, []);

  // Legacy initialData support (for direct loading without custom events)
  useEffect(() => {
    if (initialData && !selectedArticles) {
      try {
        const parsedData = JSON.parse(initialData);
        if (parsedData.place_id && parsedData.articles) {
          setSelectedArticles({
            place_id: parsedData.place_id,
            articles: parsedData.articles,
            address: parsedData.articles[0]?.location_name || null,
          });
          setShowModal(true);
          setModalLoading(false);
        }
      } catch (error) {
        console.error("Failed to parse initial data:", error);
      }
    }
  }, [initialData]);

  const handleFeatureClick = (place_id: string, title?: string) => {
    // Just navigate to the new place_id - the route change will trigger data fetching
    setSelectedPlace(place_id);
  };

  // Fetch articles when selectedPlace changes or when we need to show articles for the current place
  useEffect(() => {
    const fetchArticlesForPlace = async () => {
      // Skip fetching if we already have the data or there's no selected place
      if (!selectedPlace) return;

      if (
        selectedArticles?.place_id === selectedPlace &&
        selectedArticles.articles.length > 0
      ) {
        setShowModal(true);
        return;
      }

      setShowModal(true);
      setModalLoading(true);
      try {
        const response = await fetch(`/nyc/live/articles/${selectedPlace}`);
        const data = await response.json();
        setSelectedArticles({
          address: null, // Will be updated from the data if available
          place_id: selectedPlace,
          articles: data,
        });
        setModalLoading(false);
      } catch (error) {
        console.error(error);
        setModalLoading(false);
      }
    };

    // If we have a selected place, fetch articles for it
    if (selectedPlace && !mapLoading) {
      fetchArticlesForPlace();
    }
  }, [selectedPlace, mapLoading]);

  useEffect(() => {
    if (!showPlaceDetail && selectedPlace) {
      // Just close the modal without changing the URL when it's dismissed
      setSelectedArticles(null);
    }
  }, [showPlaceDetail]);

  useEffect(() => {
    if (selectedPlace && mapRef?.current && !mapLoading) {
      const selectedFeature = mapRef.current.querySourceFeatures("locations", {
        filter: ["==", "place_id", selectedPlace],
      })?.[0];

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
        maxBounds: [
          [-74.52, 40.36], // Southwest coordinates
          [-73.15, 41.22], // Northeast coordinates
        ],
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
