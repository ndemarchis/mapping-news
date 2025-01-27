import { useState } from "react";
import { ArticlesDefinition } from "./types";
import { useRouter } from 'next/navigation';

const useSelectedArticle = () => {
  const router = useRouter();
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(
    null,
  );
  const [selectedArticles, setSelectedArticles] =
    useState<ArticlesDefinition>(null);

  const updateSelectedArticle = async (place_id: string) => {
    await fetch(`/nyc/live/articles/${place_id}`, {
      cache: "force-cache",
      next: { revalidate: 1800 },
    })
      .then((response) => response.json())
      .then((data) => {
        setSelectedArticleId(place_id);
        setSelectedArticles(data);
        // push query param
        router.push(`/nyc/live/articles/${place_id}`);
      });
  };

  return {selectedArticleId, selectedArticles}
};
