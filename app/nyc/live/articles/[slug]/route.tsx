import { createClient, PostgrestSingleResponse } from "@supabase/supabase-js";
import { Database } from "../../database.types";

export const revalidate = 3600; // 60 * 60 — 1 hour

type Article = Database["public"]["Tables"]["articles"]["Row"];

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const pageSize = parseInt(url.searchParams.get("pageSize") || "20");

  // Calculate offset based on page and pageSize
  const offset = (page - 1) * pageSize;

  const supabase = createClient<Database>(
    process.env.SUPABASE_URL || "",
    process.env.SUPABASE_API_KEY || "",
  );

  // Get the paginated results
  let returned = (await supabase.rpc("get_sorted_location_article_relations", {
    p_place_id: slug,
    p_limit: pageSize,
    p_offset: offset,
  })) as PostgrestSingleResponse<
    {
      article_uuid: string;
      location_name: string;
      articles: Article | null;
    }[]
  >;

  const { data, error } = returned;

  if (error) {
    console.error(error);
    return Response.error();
  }

  if (!data) {
    return Response.error();
  }

  const articles = data
    .map((relation) => ({
      ...relation.articles,
      location_name: relation.location_name,
    }))
    .filter(Boolean);

  // Just return the articles array - we'll determine if there are more based on the length
  return Response.json(articles);
}
