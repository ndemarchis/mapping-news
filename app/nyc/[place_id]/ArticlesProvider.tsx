import { createClient } from "@supabase/supabase-js";
import { Database } from "../live/database.types";

// Type for the response data
type Article = Database["public"]["Tables"]["articles"]["Row"] & {
  location_name: string;
};

// Server component to fetch articles data
export async function fetchArticlesForPlace(
  place_id: string,
): Promise<Article[]> {
  const supabase = createClient<Database>(
    process.env.SUPABASE_URL || "",
    process.env.SUPABASE_API_KEY || "",
  );

  // Use the same RPC function as the API route
  const { data, error } = await supabase.rpc(
    "get_sorted_location_article_relations",
    {
      p_place_id: place_id,
    },
  );

  if (error) {
    console.error("Error fetching articles:", error);
    return [];
  }

  if (!data) {
    return [];
  }

  // Format the data the same way as the API route
  return data
    .map((relation: any) => ({
      ...relation.articles,
      location_name: relation.location_name,
    }))
    .filter(Boolean);
}
