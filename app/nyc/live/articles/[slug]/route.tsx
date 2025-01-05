import { createClient, PostgrestSingleResponse } from "@supabase/supabase-js";
import type { NextApiRequest, NextApiResponse } from "next";
import { Database } from "../../database.types";

type Article = Database["public"]["Tables"]["articles"]["Row"];

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const supabase = createClient<Database>(
    process.env.SUPABASE_URL || "",
    process.env.SUPABASE_API_KEY || "",
  );

  let returned = (await supabase.rpc("get_sorted_location_article_relations", {
    p_place_id: slug,
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

  return Response.json(
    data
      .map((relation) => ({
        ...relation.articles,
        location_name: relation.location_name,
      }))
      .filter(Boolean),
  );
}
