import { createClient } from "@supabase/supabase-js";
import { Database } from "../../database.types";

export async function GET() {
  const supabase = createClient<Database>(
    process.env.SUPABASE_URL || "",
    process.env.SUPABASE_API_KEY || "",
  );

  const returned = await supabase.rpc("get_location_stats_recent").range(0, 10);

  if (returned.error) {
    return Response.error();
  }

  const sorted = returned.data.sort((a, b) => b.count - a.count);

  return Response.json(sorted);
}
