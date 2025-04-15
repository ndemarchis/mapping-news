'use server';

import { Database } from "@/app/nyc/live/database.types";
import { createClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";

export async function fetchRecentLocations() {
  const supabase = createClient<Database>(
    process.env.SUPABASE_URL || "",
    process.env.SUPABASE_API_KEY || "",
  );

  const getLocationStatsRecent = unstable_cache(
    async () => {
      return supabase.rpc("get_location_stats_recent").range(0, 8);
    },
    ["get_location_stats_recent"],
    { revalidate: 60 * 10 },
  );
  const { data, error } = await getLocationStatsRecent();

  if (error) {
    console.error("Error fetching recent locations:", error);
    return [];
  }

  return data || [];
}
