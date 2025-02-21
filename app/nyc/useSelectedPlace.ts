'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from "react";

type PlaceId = string | null;

export const useSelectedPlace = () => {
  const [selectedPlace, setSelectedPlace] = useState<PlaceId>(null);

  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const place_id = params.get("place_id");

  const handleSelectedPlace = (placeId: string) => {
    if (placeId === selectedPlace) {
      return;
    }

    const newParams = new URLSearchParams(Array.from(params.entries()));

    if (placeId === null) {
      newParams.delete("place_id");
    } else {
      newParams.set("place_id", placeId);
    }

    setSelectedPlace(placeId);
    router.push(`${pathname}?${newParams.toString()}`);
  };

  useEffect(() => {
    if (place_id) {
      setSelectedPlace(place_id as string);
    }
  }, [place_id]);

  return [selectedPlace, handleSelectedPlace] as [
    PlaceId,
    (place_id: PlaceId) => void,
  ];
};
