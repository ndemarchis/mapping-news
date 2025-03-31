"use client";

import { ModifiedFeatureCollection } from "@/app/nyc/types";
import { LoadingDots } from "@/components/shared/icons";
import { Listener, Map, NavigationControl } from "maplibre-gl";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import "maplibre-gl/dist/maplibre-gl.css";
import { getPlaceIdRelativeHref } from "./getPlaceIdRelativeHref";

const sizeDependentDotStyles = {
  radius: 5,
  strokeWidth: 2,
};

const MapComponent = ({ geoJson }: { geoJson: ModifiedFeatureCollection }) => {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const [mapLoading, setMapLoading] = useState(true);
  const router = useRouter();

  const pathname = usePathname();
  const placeId = pathname.split("/").pop();

  const handleFeatureClick = (placeId: string, title: string) => {
    const href = getPlaceIdRelativeHref(placeId);
    router.push(href);
  };

  const onLocationsClick: Listener = (e) => {
    const feature = e.features?.[0];
    if (feature) {
      const { place_id, title } = feature.properties;
      handleFeatureClick(place_id, title);
    }
  };

  const onLocationsMouseEnter: Listener = (e) => {
    if (mapRef.current) {
      mapRef.current.getCanvas().style.cursor = "pointer";
    }

    const feature = e.features?.[0];
    if (feature) {
      const zoom = mapRef?.current?.getZoom() || 0;
      if (zoom > 13.5) {
        const href = getPlaceIdRelativeHref(feature.properties.place_id);
        router.prefetch(href);
      }
    }
  };

  const onLocationsMouseLeave: Listener = () => {
    if (mapRef.current) {
      mapRef.current.getCanvas().style.cursor = "";
    }
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
          // @ts-expect-error string not assignable to number
          data: geoJson,
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

        mapRef.current?.on("click", "locations", onLocationsClick);
        mapRef.current?.on("mouseenter", "locations", onLocationsMouseEnter);
        mapRef.current?.on("mouseleave", "locations", onLocationsMouseLeave);
      });
    }

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [sizeDependentDotStyles.radius, sizeDependentDotStyles.strokeWidth]);

  useEffect(() => {
    // wait until locations layer is loaded

    if (mapRef.current && placeId && !mapLoading) {
      if (mapRef.current.getLayer("selected-place")) {
        mapRef.current.removeLayer("selected-place");
      }

      mapRef.current.addLayer({
        id: "selected-place",
        type: "circle",
        source: "locations",
        filter: ["==", "place_id", placeId],
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

      const selectedFeature = mapRef.current.querySourceFeatures("locations", {
        filter: ["==", "place_id", placeId],
      })?.[0];

      const zoom = mapRef?.current?.getZoom() || 0;
      mapRef.current.flyTo({
        // @ts-expect-error
        center: selectedFeature?.geometry?.coordinates,
        zoom: Math.max(zoom, 11.5),
      });
    }
  }, [placeId, mapRef.current, mapLoading]);

  return (
    <div
      ref={mapElement}
      className="map-container relative z-10 h-[calc(100vh-12rem)]"
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
  );
};
export default MapComponent;
