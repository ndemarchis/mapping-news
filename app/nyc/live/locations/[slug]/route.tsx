import { createClient } from "@supabase/supabase-js";
import { Database } from "../../database.types";
import { unstable_cache } from "next/cache";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const supabase = createClient<Database>(
    process.env.SUPABASE_URL || "",
    process.env.SUPABASE_API_KEY || "",
  );

  const getLocationArticleRelations = unstable_cache(
    async (slug: string) =>
      supabase
        .from("location_article_relations")
        .select(`*`)
        .eq("article_uuid", slug),
    ["location_article_relations"],
    { revalidate: 30 },
  );

  const { data, error } = await getLocationArticleRelations(slug);

  if (error) {
    console.error(error);
    return Response.error();
  }

  if (!data) {
    return Response.error();
  }

  return Response.json(data.filter(Boolean));
}
