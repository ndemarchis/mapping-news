'use server';

import { createClient, PostgrestError } from "@supabase/supabase-js";
import { Database } from "@/app/nyc/live/database.types";

import { ModifiedFeatureCollection, NullableLocation } from "@/app/nyc/types";
import { isPartiallyNullablePoint, getDotColor, getDotSizeFactor } from "@/app/nyc/live/locations/utils";
import { unstable_cache } from "next/cache";

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

export async function fetchLocations(): Promise<ModifiedFeatureCollection> {
  const supabase = createClient<Database>(
    process.env.SUPABASE_URL || "",
    process.env.SUPABASE_API_KEY || "",
  );

  const getDataRecursive = unstable_cache(
    getDataRecursiveCurry(supabase),
    ["get_location_stats"],
    { revalidate: 30 },
  );
  const { data, error } = await getDataRecursive();

  if (!data) {
    return {
      type: "FeatureCollection",
      features: [],
    };
  }

  if (error) {
    console.error(error);
    throw new Error(error.message);
  }

  const today = new Date();
  const filteredData = data.filter(isPartiallyNullablePoint);

  console.log(`returning GeoJSON for ${filteredData.length} locations`);

  return {
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
}
