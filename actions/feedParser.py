from typing import List, TypedDict, Optional, Set
from pathlib import Path
import json
import asyncio
import aiohttp
import feedparser
from newspaper import Article

FEED_FILE = Path(__file__).resolve().parent / "../public/feeds/feeds.txt"
CACHE_FILE = Path(__file__).resolve().parent / "../cache.json"
FULL_ARTICLE_CHAR_THRESHOLD = 250

class FeedItem(TypedDict, total=False):
    title: Optional[str]
    link: Optional[str]
    pubDate: Optional[str]
    id: Optional[str]
    author: Optional[str]
    fullText: Optional[bool]
    content: Optional[str]

class CustomFeedItem(TypedDict):
    item: FeedItem
    locations: List[dict]

def read_file(file_path: Path) -> str:
    with open(file_path, "r", encoding="utf-8") as f:
        return f.read()

def write_file(file_path: Path, data: str) -> None:
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(data)

def file_exists(file_path: Path) -> bool:
    return file_path.exists()

async def load_feeds() -> List[str]:
    """
    Get the list of RSS feeds from the file.
    """
    data = read_file(FEED_FILE)
    return [line.strip() for line in data.splitlines() if line.strip()]

async def load_seen_articles() -> Set[str]:
    # TODO: get data in from the server
    if file_exists(CACHE_FILE):
        data = read_file(CACHE_FILE)
        return set(json.loads(data))
    return set()

async def save_seen_articles(seen_articles: Set[str]) -> None:
    write_file(CACHE_FILE, json.dumps(list(seen_articles), ensure_ascii=False))

def feed_item_standardizer(item: dict) -> FeedItem:
    """
    Standardize the individual item results into a predictable, library-agnostic format.
    """
    return {
        "title": item.get("title"),
        "link": item.get("link"),
        "pubDate": item.get("published"),
        "id": item.get("id"),
        "author": item.get("author"),
        "fullText": len(item.get("summary", "")) > FULL_ARTICLE_CHAR_THRESHOLD,
    }

async def parse_feed(url: str) -> List[FeedItem]:
    """
    For a given RSS feed URL, get all current items.
    """
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            content = await response.text()
    feed = feedparser.parse(content)
    return [feed_item_standardizer(item) for item in feed.entries]

async def fetch_new_articles() -> List[FeedItem]:
    """
    Check RSS feeds for new articles that are not included in the local cache.
    """
    seen_articles = await load_seen_articles()
    new_articles: List[FeedItem] = []

    RSS_FEEDS = await load_feeds()

    for feed_url in RSS_FEEDS:
        articles = await parse_feed(feed_url)
        for article in articles:
            if not article.get("id"):
                continue
            if article["id"] not in seen_articles:
                new_articles.append(article)
                seen_articles.add(article["id"])

    await save_seen_articles(seen_articles)
    return new_articles

async def scrap(url: str) -> str:
    """
    Get data from provided article URLs.
    """
    article = Article(url)
    article.download()
    article.parse()
    return article.text

async def add_articles_full_content(articles: List[FeedItem]) -> List[FeedItem]:
    """
    For those articles that are missing full text, fetch the full content.
    """
    async def process_article(article: FeedItem) -> FeedItem:
        if article.get("fullText"):
            return article
        content = await scrap(article.get("link", ""))

        # TODO: do we want to add other information here?
        article["content"] = content
        return article

    return await asyncio.gather(*(process_article(article) for article in articles))

async def add_article_location(article: FeedItem) -> CustomFeedItem:
    # TODO: Either add API or spaCy to get locations
    return {
        "item": article,
        "locations": []  # Example locations
    }

async def main() -> None:
    try:
        new_articles = await fetch_new_articles()
        if new_articles:
            print("New articles found:")
            for article in new_articles:
                print(f"- {article['title']} ({article['link']})")

            full_articles = await add_articles_full_content(new_articles)
        else:
            print("No new articles found.")
    except Exception as error:
        print(f"Error: {str(error)}")
        exit(1)

if __name__ == "__main__":
    asyncio.run(main())
