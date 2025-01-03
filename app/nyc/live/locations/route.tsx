import {
  createClient,
  PostgrestError,
  PostgrestSingleResponse,
} from "@supabase/supabase-js";
import { Database } from "../database.types";

export type Properties = {
  title: string;
  articleTitle: string | null;
  articleLink: string | null;
  articlePubDate: string | null;
  articleAuthor: string | null;
  feedName: string | null;
  locations: string | null;
};

export async function GET() {
  const supabase = createClient<Database>(
    process.env.SUPABASE_URL || "",
    process.env.SUPABASE_API_KEY || "",
  );

  const getDataRecursive = async (
    start = 0,
  ): Promise<{
    data:
      | {
          formatted_address: string | null;
          lat: number | null;
          lon: number | null;
          place_id: string;
          types: string[] | null;
        }[]
      | null;
    error: PostgrestError | null;
  }> => {
    const returned = await supabase
      .from("locations")
      .select("*")
      .range(start, start + 1000);

    const data = returned.data || [];
    const error = returned.error;

    if (error) {
      return { data: null, error };
    }

    if (!data) {
      return { data: null, error: null };
    }

    if (data.length === 1000) {
      const recurred = await getDataRecursive(start + 1000);
      const recurredData = recurred.data || [];

      return {
        data: [...data, ...recurredData],
        error: recurred.error,
      };
    }

    return { data, error };
  };

  const { data, error } = await getDataRecursive();

  if (!data) {
    return Response.json([]);
  }

  if (error) {
    console.error(error);
    return Response.error();
  }

  const geoJson: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: data
      .filter(
        (location) =>
          typeof location.lat === "number" && typeof location.lon === "number",
      )
      .map((location) => ({
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [location.lon as number, location.lat as number],
        },
        properties: {
          place_id: location.place_id,
          title: location.formatted_address,
          location_type: location.types,
        },
      })),
  };

  return Response.json(geoJson);
}
