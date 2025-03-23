"use client";

import Link from "@/components/shared/link";
import * as Collapsible from "@radix-ui/react-collapsible";
import { ArticleDefinition } from "./types";
import { ModifiedEntriesWithDots } from "./ModifiedEntries";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { Database } from "./live/database.types";
import { LoadingDots } from "@/components/shared/icons";
import { ArticleLocationEntry } from "./ArticleLocationEntry";

const ArticleEntryClient = ({
  article,
  showLocationInfo,
  setSelectedPlace,
}: {
  article: ArticleDefinition;
  showLocationInfo?: boolean;
  setSelectedPlace: (place_id: string, title?: string) => void;
}) => {
  const [isLocationsOpen, setIsLocationsOpen] = useState(false);
  const [isLocationsLoading, setIsLocationsLoading] = useState(false);
  const [locations, setLocations] = useState<
    Database["public"]["Tables"]["location_article_relations"]["Row"][] | null
  >(null);

  const onOpenChange: Collapsible.CollapsibleProps["onOpenChange"] = (open) => {
    if (open && article?.uuid3 && !locations) {
      setIsLocationsLoading(true);
      fetch(`/nyc/locations/${article.uuid3}`)
        .then((response) => response.json())
        .then((data) => {
          setLocations(data);
        })
        .catch((error) => {
          console.error(error);
          setLocations(null);
        })
        .finally(() => {
          setIsLocationsLoading(false);
        });
    }
    setIsLocationsOpen(open);
  };

  const conditionalLocationName = (["location_name"] as const).filter(() =>
    Boolean(showLocationInfo),
  );

  return (
    <Collapsible.Root
      open={isLocationsOpen}
      onOpenChange={onOpenChange}
      asChild
    >
      <div className="flex flex-col gap-1 rounded-md px-4 py-2 hover:bg-slate-200">
        <Link className="flex flex-col gap-1" href={article.link as string}>
          <ModifiedEntriesWithDots
            article={article}
            entries={["headline", "feed_name"]}
            className="text-md leading-[1.375rem]"
          />
          <ModifiedEntriesWithDots
            article={article}
            entries={["pub_date", "author", ...conditionalLocationName]}
            className="text-xs text-gray-500"
          />
        </Link>
        <Collapsible.Trigger asChild>
          <button
            className="flex flex-row items-center gap-2 text-xs text-gray-500"
            disabled={isLocationsLoading}
          >
            <span>See other locations this article mentioned</span>
            {isLocationsLoading ? (
              <LoadingDots aria-label="Locations loading..." />
            ) : (
              <ChevronRight
                className={`h-3 w-3 transition-all`}
                style={{ rotate: isLocationsOpen ? "90deg" : "0deg" }}
              />
            )}
          </button>
        </Collapsible.Trigger>
        <Collapsible.Content>
          {locations?.length && !isLocationsLoading && (
            <ul className="list-disc pl-4">
              {locations.map((relation, index) => (
                <ArticleLocationEntry
                  key={`${relation.id}${index}`}
                  relation={relation}
                  index={index}
                  setSelectedPlace={setSelectedPlace}
                />
              ))}
            </ul>
          )}
        </Collapsible.Content>
      </div>
    </Collapsible.Root>
  );
};

export default ArticleEntryClient;
