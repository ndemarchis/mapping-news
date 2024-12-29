import { createClient } from "@supabase/supabase-js";
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

  const { data, error } = await supabase.from("locations").select("*");

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
