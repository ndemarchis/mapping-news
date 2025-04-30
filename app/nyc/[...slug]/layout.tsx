import { fetchArticlesForPlace } from "./fetchArticlesForPlace";
import ArticlesWrapper from "./ArticlesWrapper";
import { fetchRecentLocations } from "./fetchRecentLocations";

export const revalidate = 600;

export async function generateStaticParams() {
  const data = await fetchRecentLocations();

  return data?.map(({ place_id }) => ({
    slug: [place_id, ""],
  }));
}

const PlaceLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: [string, ...(string | undefined)[]] }>;
}) => {
  const [placeId, loadAll] = (await params)?.slug;
  const articles = await fetchArticlesForPlace({
    placeId: Array.isArray(placeId) ? placeId[0] : placeId,
    loadAll: loadAll === "full",
  });

  return (
    <ArticlesWrapper articles={articles} placeId={placeId}>
      {children}
    </ArticlesWrapper>
  );
};

export default PlaceLayout;
