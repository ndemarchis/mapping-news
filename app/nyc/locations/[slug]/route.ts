import { getLocationsByArticleId } from "../../utils/server";

export const revalidate = 3600; // 60 * 60 — 1 hour

export async function GET(
  request: Request,
  { params }: { params: { slug: string } },
) {
  const { slug } = params;
  const locations = await getLocationsByArticleId(slug);
  return Response.json(locations);
} 