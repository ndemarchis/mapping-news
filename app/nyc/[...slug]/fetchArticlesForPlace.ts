"use server";
import { readFile } from "fs/promises";
import path from "path";
import { Database } from "@/app/nyc/live/database.types";
type Article = Database["public"]["Tables"]["articles"]["Row"] & {
  location_name: string;
};

// SUNSET: Supabase call commented out below; reads data/articles-by-place.json
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

  /*
  const supabase = createClient<Database>(
    process.env.SUPABASE_URL || "",
    process.env.SUPABASE_API_KEY || "",
  );

  console.log("supabase request for ", placeId);
  const returned = (await supabase.rpc("get_sorted_location_article_relations", {
    p_place_id: placeId,
    p_limit: loadAll ? undefined : DEFAULT_PAGE_SIZE,
    p_offset: loadAll ? undefined : 0,
  })) as PostgrestSingleResponse<
    {
      article_uuid: string;
      location_name: string;
      articles: Article | null;
    }[]
  >;

  const { data, error } = returned;

  if (error) {
    console.error(error);
    return;
  }
  */
  const all = JSON.parse(
    await readFile(path.join(process.cwd(), "data", "articles-by-place.json"), "utf8"),
  ) as Record<string, Article[]>;
  const articles = all[placeId] ?? [];
  return loadAll ? articles : articles.slice(0, DEFAULT_PAGE_SIZE);
};

/*
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
*/
