import { createClient } from "@supabase/supabase-js";
import type { NextApiRequest, NextApiResponse } from "next";
import { Database } from "../../database.types";

type ResponseData = {
  message: string;
};

type PlaceId = Database["public"]["Tables"]["locations"]["Row"]["place_id"];

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const supabase = createClient<Database>(
    process.env.SUPABASE_URL || "",
    process.env.SUPABASE_API_KEY || "",
  );

  let { data, error } = await supabase
    .from("location_article_relations")
    .select(
      `
        article_uuid, 
        location_name,
        articles (*)
			`,
    )
    .eq("place_id", slug)
    .order("articles.pub_date", { ascending: false });

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

  //   const { data: relations, error: relationsError } = await supabase
  //     .from("location_article_relations")
  //     .select("article_uuid") // Assuming the foreign key column in `location_article_relations` is `article_uuid`
  //     .eq("place_id", slug);

  //   const { data, error } = await supabase
  //     .from("articles")
  //     .select("*")
  //     .in("uuid3", relations?.map((relation) => relation.article_uuid) || []);

  //   res.status(200).json({ message: "Hello from Next.js!" });
}
