import Link from "@/components/shared/link";
import * as Collapsible from "@radix-ui/react-collapsible";
import { ArticleDefinition } from "./types";
import { ModifiedEntriesWithDots } from "./ModifiedEntries";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { Database } from "./live/database.types";

const ArticleLineItem = ({
  article,
  showLocationInfo,
}: {
  article: ArticleDefinition;
  showLocationInfo?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<
    Database["public"]["Tables"]["location_article_relations"]["Row"][] | null
  >(null);
  const onOpenChange: Collapsible.CollapsibleProps["onOpenChange"] = (open) => {
    if (open && article?.uuid3 && !data) {
      fetch(`/nyc/live/locations/${article.uuid3}`)
        .then((response) => response.json())
        .then((data) => {
          setData(data);
        })
        .catch((error) => {
          console.error(error);
          setData(null);
        });
    }
    setOpen(open);
  };
  const conditionalLocationName = (["location_name"] as const).filter(() =>
    Boolean(showLocationInfo),
  );

  return (
    <Collapsible.Root open={open} onOpenChange={onOpenChange} asChild>
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
          <button className="flex flex-row items-center gap-2 text-xs text-gray-500">
            <span>See other locations this article mentioned</span>
            <ChevronRight
              className={`h-3 w-3 transition-all`}
              style={{ rotate: open ? "90deg" : "0deg" }}
            />
          </button>
        </Collapsible.Trigger>
        <Collapsible.Content>
          {data?.length && (
            <ul className="list-disc pl-4">
              {data.map((relation, index) => (
                <li key={`${relation.id}${index}`}>
                  <Link
                    href={`https://www.google.com/maps/place/?q=place_id:${relation?.place_id}`}
                    className="text-xs text-gray-500"
                  >
                    {relation.location_name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Collapsible.Content>
      </div>
    </Collapsible.Root>
  );
};

export default ArticleLineItem;
