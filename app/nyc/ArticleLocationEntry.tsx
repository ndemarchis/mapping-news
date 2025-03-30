"use client";

import Link from "@/components/shared/link";
import { ArrowRight, Map } from "lucide-react";
import { getPlaceIdRelativeHref } from "./getPlaceIdRelativeHref";

export const ArticleLocationEntry = ({
  locationName: location_name,
  placeId: place_id,
}: {
  locationName?: string | null;
  placeId?: string | null;
}) => (
  <li className="text-xs text-gray-500">
    <span className="flex flex-row items-start gap-2">
      <Link
        className="group flex flex-row items-start gap-1 text-pretty hover:underline"
        href={getPlaceIdRelativeHref(place_id)}
        sameWindow
      >
        {location_name}
        <ArrowRight
          className="transition-all group-hover:translate-x-[0.125rem]"
          size="14px"
        />
      </Link>
      <Link
        className="text-gray-500 transition-all duration-75 hover:cursor-pointer hover:text-gray-800 active:bg-gray-100"
        href={`https://www.google.com/maps/search/?api=1&query=${location_name}&query_place_id=${place_id}`}
      >
        <Map size="14px" />
      </Link>
    </span>
  </li>
);
