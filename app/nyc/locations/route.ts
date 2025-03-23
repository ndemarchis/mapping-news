import { getLocations } from "../utils/server";

export const revalidate = 600; // 10 minutes

export async function GET() {
  const geoJson = await getLocations();
  return Response.json(geoJson);
} 