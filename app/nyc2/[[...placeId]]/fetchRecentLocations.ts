import { Database } from "@/app/nyc/live/database.types";
import { createClient } from "@supabase/supabase-js";

export async function fetchRecentLocations() {
  const supabase = createClient<Database>(
    process.env.SUPABASE_URL || "",
    process.env.SUPABASE_API_KEY || "",
  );

  const { data, error } = await supabase.rpc("get_location_stats_recent");

  if (error) {
    console.error("Error fetching recent locations:", error);
    return [];
  }

  return data || [];
}
