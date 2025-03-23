import { ArticleDefinition } from "./types";
import ArticleEntryClient from "./ArticleEntryClient";

const ArticleEntry = ({
  article,
  showLocationInfo,
  setSelectedPlace,
}: {
  article: ArticleDefinition;
  showLocationInfo?: boolean;
  setSelectedPlace: (place_id: string, title?: string) => void;
}) => {
  return (
    <ArticleEntryClient
      article={article}
      showLocationInfo={showLocationInfo}
      setSelectedPlace={setSelectedPlace}
    />
  );
};

export default ArticleEntry;
