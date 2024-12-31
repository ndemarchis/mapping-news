import { Database } from "./live/database.types";

export type ArticleDefinition =
  Database["public"]["Tables"]["articles"]["Row"] & {
    location_name: string | null;
  };
