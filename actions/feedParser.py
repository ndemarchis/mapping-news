from datetime import date
from typing import List, TypedDict, Optional, Set, Dict
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
from supabase import create_client, Client
import uuid

FEED_FILE = Path(__file__).resolve().parent / "../public/feeds/feeds.csv"
CACHE_FILE = Path(__file__).resolve().parent / "../cache.json"

class GeocodedLocation(TypedDict):
    lat: float
    lon: float

class GeoBoundaries(TypedDict):
    minLat: float
    minLon: float
    maxLat: float
    maxLon: float

class Feed(TypedDict):
    name: str
    url: str
    geo: Optional[GeoBoundaries]

class FeedItem(TypedDict, total=False):
    title: Optional[str]
    link: Optional[str]
    pub_date: Optional[str]
    id: Optional[str]
    author: Optional[str]
    fullText: Optional[bool]
    content: Optional[str]
    feed: Optional[Feed]

GeocodedLocations = Dict[str, Optional[GeocodedLocation]]
"""Maps location name to the geocoded location."""

GeocodingCache = Dict[str, Dict[str, GeocodedLocation]]
"""Caches location name, then boundaries to the actual location that it should resolve to."""

class CustomFeedItem(TypedDict):
    item: FeedItem
    locations: GeocodedLocations

class AddressArray(BaseModel):
    locations: List[str]

class SupabaseRow(TypedDict):
    locations: Optional[GeocodedLocations]
    title: Optional[str]
    link: Optional[str]
    id: Optional[str]
    pub_date: Optional[str]
    author: Optional[str]
    feed_name: Optional[str]

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

async def load_feeds() -> List[Feed]:
    """Get the list of RSS feeds from the file."""
    data = read_file_csv(FEED_FILE)
    return data.to_dict(orient="records")
    

async def load_seen_articles() -> Set[str]:
    # TODO: get data in from the server
    if file_exists(CACHE_FILE):
        data = read_file(CACHE_FILE)
        return set(json.loads(data))
    return set()

async def save_seen_articles(seen_articles: Set[str]) -> None:
    write_file(CACHE_FILE, json.dumps(list(seen_articles), ensure_ascii=False))

def feed_item_standardizer(item: dict) -> FeedItem:
    """Standardize the individual item results into a predictable, library-agnostic format."""
    return {
        "title": item.get("title"),
        "link": item.get("link"),
        "pub_date": item.get("published"),
        "id": item.get("id"),
        "author": item.get("author"),
        "fullText": False,
    }

async def parse_feed(feed: Feed) -> List[FeedItem]:
    """For a given RSS feed URL, get all current items."""

    url = feed.get("url", "")

    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            content = await response.text()
    parsedFeed = feedparser.parse(content)
    return [{**feed_item_standardizer(item), "feed": feed} for item in parsedFeed.entries]

async def fetch_new_articles() -> List[FeedItem]:
    """Check RSS feeds for new articles that are not included in the local cache."""
    seen_articles = await load_seen_articles()
    new_articles: List[FeedItem] = []

    feeds = await load_feeds()

    for feed in feeds:
        print(f"0. {feed['name']} (Parsing)")
        articles = await parse_feed(feed)
        for article in articles:
            if not article.get("id"):
                continue
            if article["id"] not in seen_articles:
                new_articles.append(article)
                seen_articles.add(article.get("id") or "")

    await save_seen_articles(seen_articles)
    return new_articles

async def scrap(url: str) -> str:
    """Get data from provided article URLs."""
    article = Article(url)
    article.download()
    article.parse()
    return article.text

async def add_articles_full_content(articles: List[FeedItem]) -> List[FeedItem]:
    """For those articles that are missing full text, fetch the full content."""
    async def process_article(article: FeedItem) -> FeedItem:
        if article.get("fullText") or not article.get("link"):
            return article
        content = await scrap(article.get("link") or "")

        print(f"- 1. {article.get('title', '')} (Scraping)")

        # TODO: do we want to add other information here?
        article["content"] = content
        return article

    return await asyncio.gather(*(process_article(article) for article in articles))

def add_article_locations(articles: List[FeedItem]) -> List[CustomFeedItem]:
    """For each article, extract location information."""
    return [add_article_location(article) for article in articles]

def filter_parsed_locations(locations: List[str]) -> List[str]:
    """Remove locations with fewer than 3 words."""
    return [location for location in locations if len(location.split()) > 2]

def add_article_location(article: FeedItem) -> CustomFeedItem:
    key = os.getenv("OPENAI_API_KEY")
    client = OpenAI(api_key=key)

    print(f"- 2. {article.get('title', '')} (Parsing)")

    completion = client.beta.chat.completions.parse(
        model="gpt-4o-mini-2024-07-18",
        messages=[
            {"role": "system", "content": "Extract all physical addresses from the text."},
            {"role": "user", "content": article.get("content") or ""},
        ],
        response_format=AddressArray,
    )

    event = completion.choices[0].message.parsed
    filtered_locations = filter_parsed_locations(event.locations if event else [])

    return {
        "item": article,
        "locations": dict.fromkeys(filtered_locations, None),
    }

def add_geocoded_locations(articles: List[CustomFeedItem]) -> List[CustomFeedItem]:
    """For each article, geocode the locations."""
    return [add_geocoded_location(article) for article in articles]

def add_geocoded_location(article: CustomFeedItem) -> CustomFeedItem:
    locations = article["locations"]
    geocoded_locations = geocode_locations(locations)
    return {
        "item": article["item"],
        "locations": geocoded_locations,
    }

def geocode_locations(locations: GeocodedLocations) -> GeocodedLocations:
    """For each location, make a request to Google Maps API to get geocoding information."""
    
    returned_locations: GeocodedLocations = {}
    for location in locations:
        geocoded_location = geocode_location(location)
        if geocoded_location:
            returned_locations[location] = geocoded_location

    return returned_locations

FILTERABLE_LOCATION_TYPES = ["political", "country", "administrative_area_level_1", "administrative_area_level_2","locality","sublocality","neighborhood","postal_code"]

def geocode_location(location: str) -> GeocodedLocation | None:
    """Make a request to Google Maps API to get geocoding information."""
    key = os.getenv("GOOGLE_MAPS_API_KEY")
    url = "https://maps.googleapis.com/maps/api/geocode/json"
    params = {
        "key": key,
        "address": location,
    }

    print(f"- 3. {location} (Geocoding)")

    response = requests.get(url, params=params)
    data = response.json()
    if response.status_code != 200 or data["status"] != "OK":
        return None
    
    # TODO: Add returned locations to cache

    if not data["results"]:
        return None

    print(data["results"][0]["types"])
    
    if all(loc in FILTERABLE_LOCATION_TYPES for loc in data["results"][0]["types"]):
        print("NO")
        return None

    print("YES")

    lat = data["results"][0]["geometry"]["location"]["lat"]
    lon = data["results"][0]["geometry"]["location"]["lng"]
    return {
        "lat": lat,
        "lon": lon,
    }

def has_valid_location(item: CustomFeedItem) -> bool:
    """Filter out feed items that don't have any locations."""
    return bool(item.get("locations"))

def narrow_feed_items(items: List[CustomFeedItem]) -> List[SupabaseRow]:
    """Filter out feed items that don't have any locations."""
    return [{
        "locations": item.get("locations"), 
        "title": item["item"].get("title"),
        "link": item["item"].get("link"),
        "id": str(uuid.uuid3(uuid.NAMESPACE_URL, item["item"].get("id") or "")),
        # TODO: Move to initial RSS parsing
        "pub_date": item["item"].get("pub_date") or date.today().isoformat(),
        "author": item["item"].get("author"),
        "feed_name": item["item"]["feed"].get("name") if item["item"]["feed"] else None,
    } for item in items if has_valid_location(item)]

def send_to_db(articles: List[CustomFeedItem]) -> None:
    """Send articles to the Supabase database."""
    supabase_url = os.getenv("SUPABASE_URL") or ""
    supabase_key = os.getenv("SUPABASE_API_KEY") or ""

    supabase = create_client(supabase_url, supabase_key)
    narrowed_articles = narrow_feed_items(articles)

    print(f"- 4. Sending {len(narrowed_articles)} articles to Supabase")

    supabase.table("articles_and_data").insert(narrowed_articles, upsert=True).execute()


async def main() -> None:
    try:
        new_articles = await fetch_new_articles()
        if new_articles: 
            print("New articles found.")
            full_articles = await add_articles_full_content(new_articles)
            new_articles_with_locations = add_article_locations(full_articles)
            new_articles_with_geocoded_locations = add_geocoded_locations(new_articles_with_locations)

            # save file as JSON
            write_file(Path(__file__).resolve().parent / "../public/feeds/cache.json", json.dumps(new_articles_with_geocoded_locations, ensure_ascii=False))

            # send to db
            send_to_db(new_articles_with_geocoded_locations)

        else:
            print("No new articles found.")
    except Exception as error:
        print(f"Error: {str(error)}")
        exit(1)

if __name__ == "__main__":
    asyncio.run(main())
