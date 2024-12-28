import { createClient } from "@supabase/supabase-js";
import { Database } from "./database.types";

type LocationType = Record<string, { lat: number; lon: number }>;

export async function GET() {
  const supabase = createClient<Database>(
    process.env.SUPABASE_URL || "",
    process.env.SUPABASE_API_KEY || "",
  );

  const { data, error } = await supabase.from("articles_and_data").select("*");

  if (error) {
    console.error(error);
    return Response.error();
  }

  const geoJson = data?.reduce<GeoJSON.FeatureCollection>(
    (acc, curr) => ({
      ...acc,
      features: [
        ...acc.features,
        ...Object.entries(curr.locations as LocationType).map(
          ([locationName, coordinates]) => ({
            type: "Feature" as const,
            geometry: {
              type: "Point" as const,
              coordinates: [coordinates.lon, coordinates.lat],
            },
            properties: {
              title: locationName,
              articleTitle: curr.title,
              articleLink: curr.link,
              articlePubDate: curr.pub_date,
              articleAuthor: curr.author,
              feedName: curr.feed_name,
              locations: Object.entries(curr.locations as LocationType)
                .map(([locationName, _]) => locationName)
                .join(", "),
            },
          }),
        ),
      ],
    }),
    {
      type: "FeatureCollection",
      features: [],
    },
  );

  return Response.json(geoJson);
}
