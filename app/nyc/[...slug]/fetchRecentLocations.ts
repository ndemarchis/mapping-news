"use server";

import { Database } from "@/app/nyc/live/database.types";
import { createClient } from "@supabase/supabase-js";
import { createCache } from "../utils";
import { REVALIDATE } from "@/app/constants";

export async function fetchRecentLocations() {
  const supabase = createClient<Database>(
    process.env.SUPABASE_URL || "",
    process.env.SUPABASE_API_KEY || "",
  );

  const getLocationStatsRecent = createCache(
    async () => await supabase.rpc("get_location_stats_recent").range(0, 8),
    {
      key: "get_location_stats_recent",
      tag: `get_location_stats_recent`,
      revalidate: REVALIDATE,
    },
  );
  const { data, error } = (await getLocationStatsRecent()).payload;

  if (error) {
    console.error("Error fetching recent locations:", error);
    return [];
  }

  return data || [];
}
