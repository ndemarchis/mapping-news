import { createClient } from "@supabase/supabase-js";
import { Database } from "../../database.types";

export const revalidate = 900; // 15 minutes

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const supabase = createClient<Database>(
    process.env.SUPABASE_URL || "",
    process.env.SUPABASE_API_KEY || "",
  );

  const { data, error } = await supabase
    .from("location_article_relations")
    .select(`*`)
    .eq("article_uuid", slug);

  if (error) {
    console.error(error);
    return Response.error();
  }

  if (!data) {
    return Response.error();
  }

  return Response.json(data.filter(Boolean));
}
