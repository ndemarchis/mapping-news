"use server";

import { readFile } from "fs/promises";
import path from "path";

// SUNSET: Supabase calls commented out; serving a static snapshot from data/ (see actions/exportStaticData.py)
/*
import { Database } from "@/app/nyc/live/database.types";
import { createClient } from "@supabase/supabase-js";

export async function fetchRecentLocations() {
  const supabase = createClient<Database>(
    process.env.SUPABASE_URL || "",
    process.env.SUPABASE_API_KEY || "",
  );

  const { data, error } = await supabase.rpc("get_location_stats_recent").range(0, 8);

  if (error) {
    console.error("Error fetching recent locations:", error);
    return [];
  }

  return data || [];
}
*/

type RecentLocation = {
  place_id: string;
  manual_name: string | null;
  article_location_name: string | null;
};

export async function fetchRecentLocations(): Promise<RecentLocation[]> {
  return JSON.parse(
    await readFile(path.join(process.cwd(), "data", "recent-locations.json"), "utf8"),
  );
}
