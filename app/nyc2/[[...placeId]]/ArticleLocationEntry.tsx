import { Database } from "@/app/nyc/live/database.types";
import Link from "@/components/shared/link";
import NextLink from "next/link";
import { ArrowRight, Map } from "lucide-react";

export const ArticleLocationEntry = ({
  relation,
}: {
  relation: Database["public"]["Tables"]["location_article_relations"]["Row"];
}) => (
  <li className="text-xs text-gray-500">
    <span className="flex flex-row items-start gap-2">
      <NextLink
        className="group flex flex-row items-start gap-1 text-pretty text-left text-gray-500 transition-all duration-75 hover:cursor-pointer hover:text-gray-800 hover:underline active:bg-gray-100"
        href={`/nyc2/${relation.place_id}`}
      >
        {relation.location_name}
        <ArrowRight
          className="transition-all group-hover:translate-x-[0.125rem]"
          size="14px"
        />
      </NextLink>
      <Link
        className="text-gray-500 transition-all duration-75 hover:cursor-pointer hover:text-gray-800 active:bg-gray-100"
        href={`https://www.google.com/maps/search/?api=1&query=${relation?.location_name}&query_place_id=${relation?.place_id}`}
      >
        <Map size="14px" />
      </Link>
    </span>
  </li>
);
