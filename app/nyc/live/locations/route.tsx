import {
  createClient,
  PostgrestError,
  PostgrestSingleResponse,
} from "@supabase/supabase-js";
import { Database } from "../database.types";
import { NextRequest } from "next/server";

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

export async function GET(request: NextRequest) {
  const supabase = createClient<Database>(
    process.env.SUPABASE_URL || "",
    process.env.SUPABASE_API_KEY || "",
  );

  const searchParams = request.nextUrl.searchParams;
  const offsetQuery = searchParams.get("offset")
    ? parseInt(searchParams.get("offset") as string)
    : 0;
  const limitQuery = searchParams.get("limit")
    ? parseInt(searchParams.get("limit") as string)
    : 1000;

  const getData = async (
    offset = offsetQuery,
    limit = limitQuery,
  ): Promise<{
    data: NullableLocation[] | null;
    error: PostgrestError | null;
  }> => {
    const returned = await supabase
      .rpc("get_location_stats")
      .range(offset, offset + limit);

    const data = returned.data || [];
    const error = returned.error;

    if (error) {
      return { data: null, error };
    }

    if (!data) {
      return { data: null, error: null };
    }

    return { data, error };
  };

  const { data, error } = await getData();

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
