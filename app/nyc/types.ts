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
