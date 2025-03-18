"use client";

import Link from "@/components/shared/link";
import { Database } from "./live/database.types";
import { ArrowRight, Map } from "lucide-react";

export const ArticleLocationEntry = ({
  relation,
  index,
  setSelectedPlace,
}: {
  relation: Database["public"]["Tables"]["location_article_relations"]["Row"];
  index: number;
  setSelectedPlace?: (place_id: string, location_name?: string) => void;
}) => (
  <li key={`${relation.id}${index}`} className="text-xs text-gray-500">
    <span className="flex flex-row items-start gap-2">
      <button
        className="group flex flex-row items-start gap-1 text-pretty text-left text-gray-500 transition-all duration-75 hover:cursor-pointer hover:text-gray-800 hover:underline active:bg-gray-100"
        onClick={() => {
          relation.place_id &&
            setSelectedPlace?.(
              relation.place_id,
              relation.location_name ?? undefined,
            );
        }}
      >
        {relation.location_name}
        <ArrowRight
          className="transition-all group-hover:translate-x-[0.125rem]"
          size="14px"
        />
      </button>
      <Link
        className="text-gray-500 transition-all duration-75 hover:cursor-pointer hover:text-gray-800 active:bg-gray-100"
        href={`https://www.google.com/maps/search/?api=1&query=${relation?.location_name}&query_place_id=${relation?.place_id}`}
      >
        <Map size="14px" />
      </Link>
    </span>
  </li>
);
