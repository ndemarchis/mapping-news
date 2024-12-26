from typing import List, TypedDict, Optional, Set
from pathlib import Path
import json
import asyncio
import aiohttp
import feedparser
import os
from newspaper import Article
from pydantic import BaseModel
from openai import OpenAI
import pandas as pd
import requests

FEED_FILE = Path(__file__).resolve().parent / "../public/feeds/feeds.csv"
CACHE_FILE = Path(__file__).resolve().parent / "../cache.json"
FULL_ARTICLE_CHAR_THRESHOLD = 250

class GeocodedLocation(TypedDict):
    lat: float
    lon: float

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
    locations: Optional[List[str]]
    geocoded_locations: Optional[List[GeocodedLocation]]

class AddressArray(BaseModel):
    locations: List[str]

class FeedParser:
    def __init__(self):
        self.articles = []
        self.custom_articles = []
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.client = OpenAI(api_key=self.api_key)

def read_file_csv(file_path: Path) -> pd.DataFrame:
    df = pd.read_csv(file_path)
    return df

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
    data = read_file_csv(FEED_FILE)
    return data["url"].tolist()

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
        "fullText": False,
        # "fullText": len(item.get("summary", "")) > FULL_ARTICLE_CHAR_THRESHOLD,
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

def add_article_locations(articles: List[FeedItem]) -> List[CustomFeedItem]:
    """
    For each article, extract location information.
    """
    return [add_article_location(article) for article in articles]

def filter_parsed_locations(locations: List[str]) -> List[str]:
    """
    Remove locations with fewer than 3 words.
    """
    return [location for location in locations if len(location.split()) > 2]

def add_article_location(article: FeedItem) -> CustomFeedItem:
    # TODO: Either add API or spaCy to get locations

    key = os.getenv("OPENAI_API_KEY")
    client = OpenAI(api_key=key)

    completion = client.beta.chat.completions.parse(
        model="gpt-4o-mini-2024-07-18",
        messages=[
            {"role": "system", "content": "Extract all physical addresses from the text."},
            {"role": "user", "content": article.get("content", "")},
        ],
        response_format=AddressArray,
    )

    event = completion.choices[0].message.parsed

    return {
        "item": article,
        "locations": filter_parsed_locations(event.locations),
    }

def add_geocoded_locations(articles: List[CustomFeedItem]) -> List[CustomFeedItem]:
    """
    For each article, geocode the locations.
    """
    return [add_geocoded_location(article) for article in articles]

def add_geocoded_location(article: CustomFeedItem) -> CustomFeedItem:
    locations = article["locations"]
    geocoded_locations = geocode_locations(locations)
    return {
        "item": article["item"],
        "locations": locations,
        "geocoded_locations": geocoded_locations,
    }

def geocode_locations(locations: List[str]) -> List[GeocodedLocation]:
    """
    For each location, make a request to Google Maps API to get geocoding information.
    """
    return [geocode_location(location) for location in locations]

def geocode_location(location: str) -> GeocodedLocation | None:
    """
    Make a request to Google Maps API to get geocoding information.
    """
    key = os.getenv("GOOGLE_MAPS_API_KEY")
    url = "https://maps.googleapis.com/maps/api/geocode/json"
    params = {
        "key": key,
        "address": location,
    }

    response = requests.get(url, params=params)
    data = response.json()
    if response.status_code != 200 or data["status"] != "OK":
        return
    lat = data["results"][0]["geometry"]["location"]["lat"]
    lon = data["results"][0]["geometry"]["location"]["lng"]
    return {
        "lat": lat,
        "lon": lon,
    }


async def main() -> None:
    try:
        new_articles = await fetch_new_articles()
        if new_articles: 
            print("New articles found:")
            for article in new_articles:
                print(f"- {article['title']} ({article['link']})")

            full_articles = await add_articles_full_content(new_articles)
            new_articles_with_locations = add_article_locations(full_articles)
            new_articles_with_geocoded_locations = add_geocoded_locations(new_articles_with_locations)

            # save file as JSON
            write_file(Path(__file__).resolve().parent / "../public/feeds/cache.json", json.dumps(new_articles_with_geocoded_locations, ensure_ascii=False))

        else:
            print("No new articles found.")
    except Exception as error:
        print(f"Error: {str(error)}")
        exit(1)

if __name__ == "__main__":
    asyncio.run(main())
