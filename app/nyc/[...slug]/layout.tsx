import { fetchArticlesForPlace } from "./fetchArticlesForPlace";
import ArticlesWrapper from "./ArticlesWrapper";

export const revalidate = 600;

const PlaceLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string[] }>;
}) => {
  const { slug } = await params;
  const [placeId, loadAll] = slug || [];
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
