from types_consts import CACHE_DIRECTORY, Hash, PlaceId, LocationAliasDefinition, LocationArticleRelationsDefinition

from supabase import Client

import json
from pathlib import Path
from typing import List


class CacheManager:
    """Manages cache operations for all tables."""

    def __init__(self, cache_dir: Path = CACHE_DIRECTORY):
        self.cache_dir = cache_dir
        if not self.cache_dir.exists():
            self.cache_dir.mkdir(parents=True)

    def _get_file_path(self, filename: str) -> Path:
        return self.cache_dir / filename

    def _file_exists(self, filename: str) -> bool:
        return self._get_file_path(filename).exists()

    def _read_file(self, filename: str) -> str:
        file_path = self._get_file_path(filename)
        if not file_path.exists():
            return ""
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()

    def _write_file(self, filename: str, data: str) -> None:
        file_path = self._get_file_path(filename)
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(data)

    def load_seen_articles(self) -> List[Hash]:
        """Get the list of article uuid3s that have been seen before from cache."""
        if self._file_exists("articles.json"):
            return json.loads(self._read_file("articles.json"))
        return []

    def load_seen_locations(self) -> List[PlaceId]:
        """Get the list of location place_ids that have been seen before from cache."""
        if self._file_exists("locations.json"):
            return json.loads(self._read_file("locations.json"))
        return []

    def load_location_aliases(self) -> List[LocationAliasDefinition]:
        """Get the list of location aliases that have been seen before from cache."""
        if self._file_exists("location_aliases.json"):
            return json.loads(self._read_file("location_aliases.json"))
        return []

    def load_location_article_relations(self) -> List[LocationArticleRelationsDefinition]:
        """Get the list of location-article relations that have been seen before from cache."""
        if self._file_exists("location_article_relations.json"):
            return json.loads(self._read_file("location_article_relations.json"))
        return []

    def save_seen_articles(self, seen_articles: List[Hash]) -> None:
        """Save the list of seen articles to cache."""
        self._write_file("articles.json", json.dumps(list(seen_articles), ensure_ascii=False))

    def save_seen_locations(self, seen_locations: List[PlaceId]) -> None:
        """Save the list of seen locations to cache."""
        self._write_file("locations.json", json.dumps(list(seen_locations), ensure_ascii=False))

    def save_location_aliases(self, seen_location_aliases: List[LocationAliasDefinition]) -> None:
        """Save the list of location aliases to cache."""
        self._write_file("location_aliases.json", json.dumps(list(seen_location_aliases), ensure_ascii=False))

    def save_location_article_relations(self, location_article_relations: List[LocationArticleRelationsDefinition]) -> None:
        """Save the list of location-article relations to cache."""
        self._write_file("location_article_relations.json", json.dumps(location_article_relations, ensure_ascii=False))

    def merge_artifact_with_db(self, supabase: Client) -> None:
        """One-time operation to merge existing artifacts with database contents."""
        # This would be run once when switching to the new system
        pass