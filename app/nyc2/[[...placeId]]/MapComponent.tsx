"use client";

import { ModifiedFeatureCollection } from "@/app/nyc/types";
import { LoadingDots } from "@/components/shared/icons";
import { Map, NavigationControl } from "maplibre-gl";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const sizeDependentDotStyles = {
  radius: 5,
  strokeWidth: 2,
};

const MapComponent = ({ geoJson }: { geoJson: ModifiedFeatureCollection }) => {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const [mapLoading, setMapLoading] = useState(true);
  const router = useRouter();

  const handleFeatureClick = (placeId: string, title: string) => {
    router.push(`/nyc2/${placeId}`);
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

        mapRef.current?.on("click", "locations", (e: any) => {
          const feature = e.features?.[0];
          if (feature) {
            const { place_id, title } = feature.properties;
            handleFeatureClick(place_id, title);
          }
        });

        mapRef.current?.on("mouseenter", "locations", (e: any) => {
          if (mapRef.current) {
            mapRef.current.getCanvas().style.cursor = "pointer";
          }

          const feature = e.features?.[0];
          if (feature) {
            router.prefetch(`/nyc2/${feature.properties.place_id}`);
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
