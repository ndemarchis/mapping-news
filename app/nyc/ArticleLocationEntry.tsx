"use client";

import { ArrowRight } from "lucide-react";
import { getPlaceIdRelativeHref } from "./getPlaceIdRelativeHref";
import Link from "@/components/shared/link";

export const ArticleLocationEntry = ({
  locationName: location_name,
  placeId: place_id,
}: {
  locationName?: string | null;
  placeId?: string | null;
}) => (
  <li className="text-xs text-gray-500">
    <Link
      className="hover group flex flex-row items-start gap-1 text-pretty text-left text-gray-500 transition-all duration-75 hover:cursor-pointer hover:text-gray-800 hover:underline active:bg-gray-100"
      href={getPlaceIdRelativeHref(place_id)}
      sameWindow
    >
      {location_name}
      <ArrowRight
        className="transition-all group-hover:translate-x-[0.125rem]"
        size="14px"
      />
    </Link>
  </li>
);
