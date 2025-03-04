import { useState } from 'react';
import { ArticlesDefinition } from '../types';

const PAGE_SIZE = 20;

export function useArticlePagination() {
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedArticles, setSelectedArticles] = useState<ArticlesDefinition>(null);

  const fetchArticles = async (place_id: string, title?: string, pageNum: number = 1) => {
    setLoading(true);
    try {
      const response = await fetch(`/nyc/live/articles/${place_id}?page=${pageNum}&pageSize=${PAGE_SIZE}`);
      const data = await response.json();
      
      // If we're loading the first page, replace the articles
      // Otherwise, append the new articles to the existing ones
      if (pageNum === 1) {
        setSelectedArticles({
          address: title ?? null,
          place_id,
          articles: data,
        });
        // If we got fewer articles than the page size, there are no more to load
        setHasMore(data.length === PAGE_SIZE);
      } else {
        setSelectedArticles(prev => {
          if (!prev) return null;
          return {
            ...prev,
            articles: [...prev.articles, ...data],
          };
        });
        // If we got fewer articles than the page size, there are no more to load
        setHasMore(data.length === PAGE_SIZE);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreArticles = () => {
    if (!selectedArticles?.place_id || !hasMore || loading) return;
    
    const nextPage = page + 1;
    setPage(nextPage);
    fetchArticles(selectedArticles.place_id, selectedArticles.address ?? undefined, nextPage);
  };

  const resetPagination = () => {
    setPage(1);
    setHasMore(true);
    setSelectedArticles(null);
  };

  return {
    selectedArticles,
    loading,
    hasMore,
    fetchArticles,
    loadMoreArticles,
    resetPagination,
  };
} 