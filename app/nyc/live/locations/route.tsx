import { createClient, PostgrestError } from "@supabase/supabase-js";
import { Database } from "../database.types";
import { NullableLocation, ModifiedFeatureCollection } from "../../types";
import {
  isPartiallyNullablePoint,
  getDotSizeFactor,
  getDotColor,
} from "./utils";

const getDataRecursiveCurry =
  (supabase: ReturnType<typeof createClient<Database>>) =>
  async (
    start = 0,
  ): Promise<{
    data: NullableLocation[] | null;
    error: PostgrestError | null;
  }> => {
    const returned = await supabase
      .rpc("get_location_stats")
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
      const recurred = await getDataRecursiveCurry(supabase)(start + 1000);
      const recurredData = recurred.data || [];

      return {
        data: [...data, ...recurredData],
        error: recurred.error,
      };
    }

    return { data, error };
  };

export const revalidate = 600; // 10 minutes

export async function GET() {
  const supabase = createClient<Database>(
    process.env.SUPABASE_URL || "",
    process.env.SUPABASE_API_KEY || "",
  );

  const getDataRecursive = getDataRecursiveCurry(supabase);
  const { data, error } = await getDataRecursive();

  console.log(`fetched ${data?.length} locations`);

  if (!data) {
    return Response.json([]);
  }

  if (error) {
    console.error(error);
    return Response.error();
  }

  const today = new Date();
  const filteredData = data.filter(isPartiallyNullablePoint);

  console.log(`returning GeoJSON for ${filteredData.length} locations`);

  const geoJson: ModifiedFeatureCollection = {
    type: "FeatureCollection",
    features: filteredData.map((location) => {
      const pubDate = new Date(location.pub_date || "2022-01-01");
      const dotExpansion = getDotSizeFactor(location.count || 0);
      const dotColor = getDotColor({ today, pubDate });
      return {
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [location.lon.toFixed(5), location.lat.toFixed(5)],
        },
        properties: {
          place_id: location.place_id,
          title: location.formatted_address,
          // location_type: location.types,
          dot_color: dotColor,
          dot_size_factor: dotExpansion,
        },
      };
    }),
  };

  return Response.json(geoJson);
}
