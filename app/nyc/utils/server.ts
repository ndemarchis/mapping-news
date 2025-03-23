import { createClient, PostgrestSingleResponse } from "@supabase/supabase-js";
import { Database } from "../live/database.types";
import { NullableLocation, ArticleDefinition } from "../types";
import { isPartiallyNullablePoint, getDotSizeFactor, getDotColor } from "../live/locations/utils";
import type { GeoJSON } from 'geojson';

// Create and export the Supabase client
export const getSupabaseClient = () => {
  return createClient<Database>(
    process.env.SUPABASE_URL || "",
    process.env.SUPABASE_API_KEY || ""
  );
};

// Fetch locations for the map
export async function getLocations(): Promise<GeoJSON.FeatureCollection> {
  const supabase = getSupabaseClient();
  
  const getDataRecursive = async (start = 0): Promise<NullableLocation[]> => {
    const returned = await supabase
      .rpc("get_location_stats")
      .range(start, start + 1000);

    const data = returned.data || [];
    const error = returned.error;

    if (error) {
      console.error(error);
      return [];
    }

    if (data.length === 1000) {
      const recurredData = await getDataRecursive(start + 1000);
      return [...data, ...recurredData];
    }

    return data;
  };

  const data = await getDataRecursive();
  console.log(`fetched ${data?.length} locations`);

  const today = new Date();
  const filteredData = data.filter(isPartiallyNullablePoint);

  console.log(`returning GeoJSON for ${filteredData.length} locations`);

  const geoJson: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: filteredData.map((location) => {
      const pubDate = new Date(location.pub_date || "2022-01-01");
      const dotExpansion = getDotSizeFactor(location.count || 0);
      const dotColor = getDotColor({ today, pubDate });
      return {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [Number(location.lon.toFixed(5)), Number(location.lat.toFixed(5))],
        },
        properties: {
          place_id: location.place_id,
          title: location.formatted_address,
          dot_color: dotColor,
          dot_size_factor: dotExpansion,
        },
      };
    }),
  };

  return geoJson;
}

// Fetch articles for a specific place
export async function getArticlesByPlaceId(placeId: string): Promise<ArticleDefinition[]> {
  const supabase = getSupabaseClient();

  type Article = Database["public"]["Tables"]["articles"]["Row"];
  
  const returned = await supabase.rpc("get_sorted_location_article_relations", {
    p_place_id: placeId,
  }) as PostgrestSingleResponse<
    {
      article_uuid: string;
      location_name: string;
      articles: Article | null;
    }[]
  >;

  const { data, error } = returned;

  if (error) {
    console.error(error);
    return [];
  }

  if (!data) {
    return [];
  }

  return data
    .map((relation) => {
      if (!relation.articles) return null;
      return {
        ...relation.articles,
        location_name: relation.location_name,
      };
    })
    .filter(Boolean) as ArticleDefinition[];
}

// Fetch locations for a specific article
export async function getLocationsByArticleId(articleId: string) {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from("location_article_relations")
    .select("*")
    .eq("article_uuid", articleId);

  if (error) {
    console.error(error);
    return [];
  }

  return data || [];
} 