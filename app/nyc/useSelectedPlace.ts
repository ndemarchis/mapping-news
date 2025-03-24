'use client';

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from "react";

type PlaceId = string | null;

export const useSelectedPlace = () => {
  const [selectedPlace, setSelectedPlace] = useState<PlaceId>(null);

  const router = useRouter();
  const pathname = usePathname();
  
  // Extract place_id from the pathname
  const extractPlaceId = (): PlaceId => {
    const segments = pathname.split('/');
    const lastSegment = segments[segments.length - 1];
    // If the lastSegment is 'nyc', there's no place_id in the path
    return lastSegment === 'nyc' ? null : lastSegment;
  };

  // Update the local state based on the URL
  useEffect(() => {
    const pathPlaceId = extractPlaceId();
    setSelectedPlace(pathPlaceId);
  }, [pathname]);

  // Custom setter that updates both state and URL
  const handleSelectedPlace = (placeId: string | null) => {
    if (placeId === selectedPlace) {
      return;
    }

    // Only update the URL, the state will be updated by the effect above
    if (placeId === null) {
      router.push('/nyc');
    } else {
      router.push(`/nyc/${placeId}`);
    }
  };

  return [selectedPlace, handleSelectedPlace] as [
    PlaceId,
    (place_id: PlaceId) => void,
  ];
};
