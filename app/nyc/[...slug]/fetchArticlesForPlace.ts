"use server";
import { createClient } from "@supabase/supabase-js";
import { PostgrestSingleResponse } from "@supabase/postgrest-js";
import { Database } from "@/app/nyc/live/database.types";
import { createCache } from "../utils";
import { REVALIDATE } from "@/app/constants";
type Article = Database["public"]["Tables"]["articles"]["Row"] & {
  location_name: string;
};

const DEFAULT_PAGE_SIZE = 20;

export const fetchArticlesForPlace = async ({
  placeId,
  loadAll,
}: {
  placeId: string;
  loadAll?: boolean;
}) => {
  if (!placeId) {
    return null;
  }

  const supabase = createClient<Database>(
    process.env.SUPABASE_URL || "",
    process.env.SUPABASE_API_KEY || "",
  );

  const getSortedLocationArticleRelations = createCache(
    async () =>
      await supabase.rpc("get_sorted_location_article_relations", {
        p_place_id: placeId,
        p_limit: loadAll ? undefined : DEFAULT_PAGE_SIZE,
        p_offset: loadAll ? undefined : 0,
      }),
    {
      key: `${placeId}`,
      tag: "location_article_relations",
      revalidate: REVALIDATE,
    },
  );

  const { data, error } = (await getSortedLocationArticleRelations())
    .payload as PostgrestSingleResponse<
    {
      article_uuid: string;
      location_name: string;
      articles: Article | null;
    }[]
  >;

  if (error) {
    console.error(error);
    return;
  }

  const toReturn = data
    .map((relation) => ({
      ...relation.articles,
      location_name: relation.location_name,
    }))
    .filter(Boolean);

  if (!toReturn) {
    console.error("No data returned from the database");
    return;
  }

  return toReturn;
};
