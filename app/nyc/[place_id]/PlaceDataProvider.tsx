"use client";

import { useEffect } from "react";
import { Database } from "../live/database.types";

// Create a custom event to pass data to the MapComponent
const dispatchPlaceDataEvent = (placeId: string, articles: any[]) => {
  // Use a custom event to communicate with the MapComponent
  const event = new CustomEvent("place-data-update", {
    detail: { placeId, articles },
  });
  window.dispatchEvent(event);
};

// Define types for articles
type Article = Database["public"]["Tables"]["articles"]["Row"] & {
  location_name: string;
};

// Props for the PlaceDataProvider component
interface PlaceDataProviderProps {
  place_id: string;
  articles: Article[];
}

// Client component that will be responsible for passing data to MapComponent
export default function PlaceDataProvider({
  place_id,
  articles,
}: PlaceDataProviderProps) {
  useEffect(() => {
    // When this component mounts, dispatch the event with the place data
    dispatchPlaceDataEvent(place_id, articles);
  }, [place_id, articles]);

  // This component doesn't render anything visible
  return null;
}
