import { fetchArticlesForPlace } from "./fetchArticlesForPlace";
import ArticlesWrapper from "./ArticlesWrapper";
import { LayoutProps } from ".next/types/app/nyc2/[placeId]/layout";

const PlaceLayout = async ({ children, params }: LayoutProps) => {
  const { placeId } = await params;
  const articles = await fetchArticlesForPlace(
    Array.isArray(placeId) ? placeId[0] : placeId,
  );

  return (
    <ArticlesWrapper articles={articles} placeId={placeId}>
      {children}
    </ArticlesWrapper>
  );
};

export default PlaceLayout;
