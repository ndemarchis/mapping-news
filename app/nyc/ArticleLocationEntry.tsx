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
  <li className="text-subtle text-xs">
    <Link
      className="hover text-subtle hover:text-primary active:bg-surface-muted group text-pretty text-left transition-all duration-75 hover:cursor-pointer hover:underline"
      href={getPlaceIdRelativeHref(place_id)}
      sameWindow
    >
      <span className="inline">{location_name} </span>
      <ArrowRight
        className="inline transition-all group-hover:translate-x-[0.125rem]"
        size="14px"
      />
    </Link>
  </li>
);
