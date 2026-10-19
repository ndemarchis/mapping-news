import { readFile } from "fs/promises";
import path from "path";

export const revalidate = 600;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  // SUNSET: Supabase query commented out; reads data/article-relations.json
  /*
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
  */
  const all = JSON.parse(
    await readFile(path.join(process.cwd(), "data", "article-relations.json"), "utf8"),
  ) as Record<string, unknown[]>;
  return Response.json(all[slug] ?? []);
}
