import { createClient } from "@supabase/supabase-js";
import { Database } from "../../database.types";
import { createCache } from "@/app/nyc/utils";
import { REVALIDATE } from "@/app/constants";

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
      key: `r_${slug}`,
      tag: `location_article_relations`,
      revalidate: REVALIDATE,
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
