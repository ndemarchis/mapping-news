import { Database } from "./live/database.types";

export type ArticleDefinition =
  Database["public"]["Tables"]["articles"]["Row"] & {
    location_name: string | null;
  };

export type ArticlesDefinition = {
  address: string | null;
  place_id: string | null;
  articles: ArticleDefinition[];
} | null;

export type Properties = {
  title: string;
  articleTitle: string | null;
  articleLink: string | null;
  articlePubDate: string | null;
  articleAuthor: string | null;
  feedName: string | null;
  locations: string | null;
  place_id: string | null;
};

export type NullableLocation = {
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

export type Location = Omit<NullableLocation, keyof RequiredLocationAttrs> & ({
  [K in keyof RequiredLocationAttrs]: NonNullable<RequiredLocationAttrs[K]>;
});

export interface ModifiedFeatureCollection
  extends Omit<GeoJSON.FeatureCollection, "features"> {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    geometry: {
      type: "Point";
      coordinates: [string, string] | GeoJSON.Position;
    };
    properties: { [K in keyof Properties]?: Properties[K] | null };
  }>;
}
