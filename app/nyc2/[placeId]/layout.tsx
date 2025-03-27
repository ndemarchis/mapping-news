import { fetchArticlesForPlace } from "./fetchArticlesForPlace";
import ArticlesWrapper from "./ArticlesWrapper";

const PlaceLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { placeId: string | string[] };
}) => {
  const { placeId } = await params;
  const articles = await fetchArticlesForPlace(
    Array.isArray(placeId) ? placeId[0] : placeId,
  );

  return <ArticlesWrapper articles={articles}>{children}</ArticlesWrapper>;
};

export default PlaceLayout;
