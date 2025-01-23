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

const getDotSizeFactor = (count: number) => {
  if (!(count >= 0)) return 1;
  return Math.max(1, Math.log(count) / Math.log(2.2) + 1);
};

const getDotColor = ({
  today,
  pubDate,
}: {
  today: Date;
  pubDate: Date;
}): string => {
  const daysDiff =
    (today.getTime() - pubDate.getTime()) / (1000 * 60 * 60 * 24);
  const percentage = Math.E ** -Math.abs(daysDiff / 2.9);
  return getColorFromPercentage({ percentage });
};

const getColorFromPercentage = ({
  percentage,
  minHue = 195,
  maxHue = 260,
}: {
  percentage: number;
  minHue?: number;
  maxHue?: number;
}): string => {
  const hue = percentage * (maxHue - minHue) + minHue;
  const a = 40 + percentage * 20;
  return `hsl(${hue} 100% 50% / ${a}%)`;
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
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [location.lon, location.lat],
        },
        properties: {
          place_id: location.place_id,
          title: location.formatted_address,
          location_type: location.types,
          dot_color: dotColor,
          dot_size_factor: dotExpansion,
        },
      };
    }),
  };

  return Response.json(geoJson);
}
