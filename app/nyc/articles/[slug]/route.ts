import { getArticlesByPlaceId } from "../../utils/server";

export const revalidate = 3600; // 60 * 60 — 1 hour

export async function GET(
  request: Request,
  { params }: { params: { slug: string } },
) {
  const { slug } = params;
  const articles = await getArticlesByPlaceId(slug);
  return Response.json(articles);
} 