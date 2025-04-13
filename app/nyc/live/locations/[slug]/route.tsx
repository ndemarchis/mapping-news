import { createClient } from "@supabase/supabase-js";
import { Database } from "../../database.types";
import { createCache } from "@/app/nyc/utils";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const supabase = createClient<Database>(
    process.env.SUPABASE_URL || "",
    process.env.SUPABASE_API_KEY || "",
  );

  const getLocationArticleRelations = createCache(
    async () =>
      await supabase
        .from("location_article_relations")
        .select(`*`)
        .eq("article_uuid", slug),
    {
      key: `location_article_relations_${slug}`,
      revalidate: 60 * 15,
    },
  );
  const { data, error } = (await getLocationArticleRelations()).payload;

  if (error) {
    console.error(error);
    return Response.error();
  }

  if (!data) {
    return Response.error();
  }

  return Response.json(data.filter(Boolean));
}
