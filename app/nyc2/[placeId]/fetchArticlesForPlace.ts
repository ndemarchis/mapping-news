'use server';
import { createClient } from "@supabase/supabase-js";
import { PostgrestSingleResponse } from "@supabase/postgrest-js";
import { Database } from "@/app/nyc/live/database.types";
type Article = Database["public"]["Tables"]["articles"]["Row"] & {
  location_name: string;
};

export const fetchArticlesForPlace = async (placeId: string) => {

    if (!placeId) {
      return null;
    }

    const supabase = createClient<Database>(
      process.env.SUPABASE_URL || "",
      process.env.SUPABASE_API_KEY || "",
    );
  
    let returned = (await supabase.rpc("get_sorted_location_article_relations", {
      p_place_id: placeId,
    })) as PostgrestSingleResponse<
      {
        article_uuid: string;
        location_name: string;
        articles: Article | null;
      }[]
    >;

    console.log('supabase request for ', placeId);
  
    const { data, error } = returned;
  
    if (error) {
      console.error(error);
      return;
    }
  
    if (!data) {
      console.error("No data returned from the database");
      return;
    }
  
    return data
      .map((relation) => ({
        ...relation.articles,
        location_name: relation.location_name,
      }))
      .filter(Boolean);
  };