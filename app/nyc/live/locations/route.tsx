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

type Simplify<T> =
  | {
      [K in keyof T]: T[K];
    };

type NullableLocation = {
  formatted_address: string | null;
  lat: number | null;
  lon: number | null;
  place_id: string;
  types: string[] | null;
  count: number | null;
  raw_count: number | null;
  pub_date: string | null;
};

type RequiredLocationAttrs = Pick<NullableLocation, "lat" | "lon">;

type Location = Simplify<
  Omit<NullableLocation, keyof RequiredLocationAttrs> & {
    [K in keyof RequiredLocationAttrs]: NonNullable<RequiredLocationAttrs[K]>;
  }
>;

const isPartiallyNullablePoint = (
  point: NullableLocation,
): point is Location => {
  return typeof point.lat === "number" && typeof point.lon === "number";
};

export async function GET() {
  const supabase = createClient<Database>(
    process.env.SUPABASE_URL || "",
    process.env.SUPABASE_API_KEY || "",
  );

  const getDataRecursive = async (
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

  console.log(`fetched ${data?.length} locations`);

  if (!data) {
    return Response.json([]);
  }

  if (error) {
    console.error(error);
    return Response.error();
  }

  const filteredData = data.filter(isPartiallyNullablePoint);

  console.log(`returning GeoJSON for ${filteredData.length} locations`);

  const geoJson: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: filteredData.map((location) => ({
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [location.lon, location.lat],
      },
      properties: {
        place_id: location.place_id,
        title: location.formatted_address,
        location_type: location.types,
        count: location.count,
        raw_count: location.raw_count,
        pub_date: location.pub_date,
      },
    })),
  };

  return Response.json(geoJson);
}
