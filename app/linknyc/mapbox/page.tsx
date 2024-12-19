"use client";

import { MutableRefObject, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import Link from "@/components/shared/link";

export default function Mapbox() {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>();

  useEffect(() => {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current as NonNullable<
        typeof mapContainerRef.current
      >,
      style: "mapbox://styles/catpenguin42/cm4ukbgwg000801s23c4a4wc8",
      center: [-73.96, 40.69],
      zoom: 10.12,
    });

    return () => {
      mapRef?.current?.remove();
    };
  }, []);

  return (
    <div className="border-box z-10 flex h-full w-full max-w-xl flex-col">
      <span>
        read more at{" "}
        <Link href="https://hellgatenyc.com/what-is-the-point-of-linknyc">
          Hell Gate
        </Link>
      </span>
      <div
        className="h-full"
        id="map-container"
        ref={mapContainerRef as MutableRefObject<HTMLDivElement>}
      />
    </div>
  );
}
