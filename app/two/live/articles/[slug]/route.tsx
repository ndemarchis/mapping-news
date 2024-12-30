import { createClient } from "@supabase/supabase-js";
import type { NextApiRequest, NextApiResponse } from "next";
import { Database } from "../../database.types";

type ResponseData = {
  message: string;
};

type PlaceId = Database["public"]["Tables"]["locations"]["Row"]["place_id"];

const isSlugValidLocation = (slug: string): slug is PlaceId => {
  return /^[a-zA-Z0-9]+$/.test(slug);
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params; // 'a', 'b', or 'c'

  console.log({ slug });

  const supabase = createClient<Database>(
    process.env.SUPABASE_URL || "",
    process.env.SUPABASE_API_KEY || "",
  );

  // if (!isSlugValidLocation(slug)) {
  //   return Response.error();
  // }

  let { data, error } = await supabase
    .from("location_article_relations")
    .select(
      `
        article_uuid, 
        articles (*)
			`,
    )
    .eq("place_id", slug);

  if (error) {
    console.error(error);
    return Response.error();
  }

  if (!data) {
    return Response.error();
  }

  return Response.json(
    data.map((relation) => relation.articles).filter(Boolean),
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
