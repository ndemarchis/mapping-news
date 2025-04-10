from datetime import date
from typing import List, TypedDict, Optional, Set, Dict, Callable
from pathlib import Path
from collections import defaultdict
import asyncio
import aiohttp
import feedparser # type: ignore
import os
import argparse
from newspaper import Article # type: ignore
from pydantic import BaseModel
from openai import OpenAI
import pandas as pd
import requests
from supabase import create_client, Client
import hashlib

from actions.CacheManager import CacheManager

FEED_FILE = Path(__file__).resolve().parent / "../public/feeds/feeds.csv"
CACHE_DIRECTORY = Path(__file__).resolve().parent / "../cache/"
FILTERABLE_LOCATION_TYPES = ["political", "country", "administrative_area_level_1", "administrative_area_level_2","locality","sublocality","neighborhood","postal_code"]

# Flag to control whether to write to the database
WRITE_TO_DB = True

Hash = str
PlaceId = str

class ArticlesDefinition(TypedDict):
    uuid3: Hash
    headline: Optional[str]
    link: Optional[str]
    pub_date: Optional[str]
    author: Optional[str]
    feed_name: Optional[str]

class LocationsDefinition(TypedDict):
    place_id: PlaceId
    lat: float
    lon: float
    formatted_address: str
    types: Optional[List[str]]

class LocationArticleRelationsDefinition(TypedDict):
    id: Hash
    article_uuid: Hash
    place_id: PlaceId
    location_name: Optional[str]

class LocationAliasDefinition(TypedDict):
    """Maps location name to the place_id of the geocoded location. This is done in the Set method to allow for easier filtering by region in the future, if added."""
    alias: str
    place_id: PlaceId
    geo_boundary_hash: Optional[str]

class GeocodedLocation(TypedDict):
    lat: float
    lon: float

class GeoBoundaries(TypedDict):
    minLat: float
    minLon: float
    maxLat: float
    maxLon: float

class OptionalGeoBoundaries(TypedDict, total=False):
    minLat: Optional[float]
    minLon: Optional[float]
    maxLat: Optional[float]
    maxLon: Optional[float]

class Feed(OptionalGeoBoundaries):
    name: str
    url: str

class FeedItem(TypedDict, total=False):
    title: Optional[str]
    link: Optional[str]
    pub_date: Optional[str]
    id: Optional[str]
    author: Optional[str]
    fullText: Optional[bool]
    content: Optional[str]
    feed: Optional[Feed]

GeocodedLocations = Dict[str, PlaceId | None]
"""Associates string locations with their Google Maps Place IDs, or None."""

class CustomFeedItem(TypedDict):
    item: FeedItem
    locations: GeocodedLocations

class AddressArray(BaseModel):
    locations: List[str]

class GeocodingResultDefinition(TypedDict):
    articles: List[CustomFeedItem]
    new_geocoded_full_locations: List[LocationsDefinition]

def read_file_csv(file_path: Path) -> pd.DataFrame:
    df = pd.read_csv(file_path)
    return df

def read_file(file_path: Path) -> str:
    with open(file_path, "r", encoding="utf-8") as f:
        return f.read()

def write_file(file_path: Path, data: str) -> None:
    if not file_path.parent.exists():
        file_path.parent.mkdir(parents=True)
    if not file_path.exists():
        file_path.touch()
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(data)

def file_exists(file_path: Path) -> bool:
    return file_path.exists()

def load_feeds() -> List[Feed]:
    """Get the list of RSS feeds from the file."""
    data = read_file_csv(FEED_FILE)
    feeds: List[Feed] = [{
        "name": item["name"], 
        "url": item["url"], 
        "minLat": item["minLat"], 
        "minLon": item["minLon"], 
        "maxLat": item["maxLat"], 
        "maxLon": item["maxLon"]
    } for item in data.to_dict("records")]
    return feeds

def get_server_articles_recursive(supabase: Client, index: int = 0) -> List[dict]:
    response = supabase.table("articles").select("*").range(index, index + 1000).execute()
    if len(response.data) == 1000:
        return response.data + get_server_articles_recursive(supabase, index + 1000)
    return response.data

def get_server_locations_recursive(supabase: Client, index: int = 0) -> List[dict]:
    response = supabase.table("locations").select("place_id").range(index, index + 1000).execute()
    if len(response.data) == 1000:
        return response.data + get_server_locations_recursive(supabase, index + 1000)
    return response.data

def get_server_location_article_relations_recursive(supabase: Client, index: int = 0) -> List[dict]:
    response = supabase.table("location_article_relations").select("article_uuid,place_id,location_name").range(index, index + 1000).execute()
    if len(response.data) == 1000:
        return response.data + get_server_location_article_relations_recursive(supabase, index + 1000)
    return response.data

def refresh_cache_from_db() -> None:
    """Update the cache from the database - should only be run when needed to sync."""
    supabase_url = os.getenv("SUPABASE_URL") or ""
    supabase_key = os.getenv("SUPABASE_SER_KEY") or ""
    cache_mgr = CacheManager()

    supabase = create_client(supabase_url, supabase_key)

    print("Refreshing cache from database...")

    # Get articles
    prelim_articles_data = get_server_articles_recursive(supabase)
    articles = [article["uuid3"] for article in prelim_articles_data]
    cache_mgr.save_seen_articles(articles)

    # Get locations
    prelim_locations = get_server_locations_recursive(supabase)
    locations = [location["place_id"] for location in prelim_locations]
    cache_mgr.save_seen_locations(locations)

    # Get location-article relations
    prelim_location_article_relations = get_server_location_article_relations_recursive(supabase)
    location_article_relations = prelim_location_article_relations
    cache_mgr.save_location_article_relations(location_article_relations)
    
    print(f"Cache refreshed with {len(articles)} articles, {len(locations)} locations, and {len(location_article_relations)} relations")

def hash(string: Optional[str]) -> Hash:
    if not string:
        return ""
    return str(int(hashlib.sha256(string.encode('utf-8')).hexdigest(), 16))

def feed_item_standardizer(item: dict) -> FeedItem:
    """Standardize the individual item results into a predictable, library-agnostic format."""
    return {
        "title": item.get("title"),
        "link": item.get("link"),
        "pub_date": item.get("published") or item.get("updated") or date.today().isoformat(),
        "id": item.get("id"),
        "author": item.get("author"),
    }

async def parse_feed(feed: Feed) -> List[FeedItem]:
    """For a given RSS feed URL, get all current items."""

    url = feed.get("url", "")

    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                content = await response.text()
        parsedFeed = feedparser.parse(content)
    except Exception as e:
        print(f"Error parsing {feed.get('name', '')} feed: {e}")
        return []
    return [{**feed_item_standardizer(item), "feed": feed} for item in parsedFeed.entries]

async def fetch_new_articles() -> List[FeedItem]:
    """Check RSS feeds for new articles that are not included in the local cache."""
    cache_mgr = CacheManager()
    seen_articles: List[Hash] = cache_mgr.load_seen_articles()
    new_articles: List[FeedItem] = []
    seen_headlines: Set[str] = set()  # Track seen headlines to filter duplicates

    feeds = load_feeds()

    TEMP_ARTICLES_LIMIT = 1001.5
    articles_count = 0

    for feed in feeds:
        print(f"0. {feed['name']} (Parsing)")
        if articles_count >= TEMP_ARTICLES_LIMIT:
            continue
        articles = await parse_feed(feed)
        for article in articles:
            hashed_id = hash(article.get("id"))
            headline = article.get("title")
            if not hashed_id or articles_count >= TEMP_ARTICLES_LIMIT or headline is None:
                continue
            if hashed_id in seen_articles or headline in seen_headlines:
                # Skip articles with duplicate IDs or headlines
                continue

            print(f"    (New: {headline})")
            articles_count += 1
            new_articles.append(article)
            seen_articles.append(hashed_id)
            seen_headlines.add(headline)

    # No need to save here as we'll update at the end of the workflow
    return new_articles

async def scrap(url: Optional[str]) -> str:
    """Get data from provided article URLs."""
    if not url:
        return ""
    
    try:
        article = Article(url)
        article.download()
        article.parse()
        return article.text
    except Exception as e:
        print(f"    (Error: {e})")
        return ""

async def add_articles_full_content(articles: List[FeedItem]) -> List[FeedItem]:
    """For those articles that are missing full text, fetch the full content."""
    async def process_article(article: FeedItem) -> FeedItem:
        if article.get("fullText") or not article.get("link"):
            return article
        
        print(f"- 1. {article.get('title', '')} (Scraping)")

        # TODO: do we want to add other information here like author?
        content = await scrap(article.get("link"))
        article["content"] = content

        return article

    return await asyncio.gather(*(process_article(article) for article in articles))

def add_article_locations(articles: List[FeedItem]) -> List[CustomFeedItem]:
    """For each article, extract location information."""
    return [add_article_location(article) for article in articles]

def filter_parsed_locations(locations: List[str]) -> List[str]:
    """Remove API-parsed locations with fewer than 3 words."""
    return [location for location in locations if len(location.split()) >= 2]

def add_article_location(article: FeedItem) -> CustomFeedItem:
    key = os.getenv("OPENAI_API_KEY")
    client = OpenAI(api_key=key)

    print(f"- 2. {article.get('title', '')} (Parsing)")

    completion = client.beta.chat.completions.parse(
        model="gpt-4o-mini-2024-07-18",
        messages=[
            {"role": "system", "content": "Your goal is to extract all points of interest and street addresses from the text provided."},
            {"role": "user", "content": article.get("content") or ""},
        ],
        response_format=AddressArray,
    )

    event = completion.choices[0].message.parsed
    filtered_locations = filter_parsed_locations(event.locations if event else [])
    print(f"    (Locations: {filtered_locations})")

    return {
        "item": article,
        "locations": dict.fromkeys(filtered_locations, None),
    }

def filter_new_geocoded_full_locations(new_geocoded_full_locations: List[LocationsDefinition]) -> List[LocationsDefinition]:
    """Filter out locations that are already in the cache, and remove duplicate entries based on their place_id."""
    cache_mgr = CacheManager()
    seen_locations = cache_mgr.load_seen_locations()
    unseen_locations: List[LocationsDefinition] = []

    for location in new_geocoded_full_locations:
        if location["place_id"] not in seen_locations:
            unseen_locations.append(location)

        else:
            print(f"    (Seen: {location['formatted_address']})")

    return list({location["place_id"]: location for location in unseen_locations}.values())

def get_geo_boundaries(article: CustomFeedItem) -> OptionalGeoBoundaries | None:
    """Get the geo boundaries for the feed, if present."""
    if article["item"]["feed"]:
        return {
            "minLat": article["item"]["feed"]["minLat"],
            "minLon": article["item"]["feed"]["minLon"],
            "maxLat": article["item"]["feed"]["maxLat"],
            "maxLon": article["item"]["feed"]["maxLon"],
        }
    return None

async def add_geocoded_locations(articles: List[CustomFeedItem]) -> GeocodingResultDefinition:
    """For each article, geocode the locations."""

    new_geocoded_full_locations: List[LocationsDefinition] = []
    def add_new_geocoded_location(location: LocationsDefinition) -> None:
        """Add a new geocoded location to the cache in this function. Workaround until this is all in a class."""
        new_geocoded_full_locations.append(location)

    articles_with_geo = await asyncio.gather(*(add_geocoded_location(article, add_new_geocoded_location, get_geo_boundaries(article)) for article in articles))

    # TODO: Preliminary solution to avoid upsert errors.
    filtered_new_geocoded_full_locations = filter_new_geocoded_full_locations(new_geocoded_full_locations)

    return {
        "articles": articles_with_geo, 
        "new_geocoded_full_locations": filtered_new_geocoded_full_locations
    }

async def add_geocoded_location(article: CustomFeedItem, add_new_geocoded_location: Callable[[LocationsDefinition], None], geo_boundaries: Optional[OptionalGeoBoundaries]) -> CustomFeedItem:
    locations = article["locations"]

    geocoded_locations = await geocode_locations(locations, add_new_geocoded_location, geo_boundaries)
    return {
        "item": article["item"],
        "locations": geocoded_locations,
    }

async def geocode_locations(locations: GeocodedLocations, add_new_geocoded_location: Callable[[LocationsDefinition], None], geo_boundaries: Optional[OptionalGeoBoundaries]) -> GeocodedLocations:
    """For each location, make a request to Google Maps API to get geocoding information."""
    
    returned_locations: GeocodedLocations = defaultdict()

    for location in locations:
        geocoded_location = await geocode_location(location, add_new_geocoded_location, geo_boundaries)
        if geocoded_location:
            returned_locations[location] = geocoded_location

    return returned_locations

def get_location_in_alias_cache(location: str) -> PlaceId | None:
    """Extract the location from the cache, if present."""
    cache_mgr = CacheManager()
    aliases = cache_mgr.load_location_aliases()
    match = [alias for alias in aliases if alias["alias"] == location]

    if not match:
        return None

    return match[0]["place_id"]

def is_location_unspecific(types_list: List[str]) -> bool:
    """Check if the location too generic to be included in the map."""
    return any(loc in FILTERABLE_LOCATION_TYPES for loc in types_list)

def format_geocoding_results_for_cache(result: dict) -> LocationsDefinition:
    """Format the geocoding results for the cache."""
    return {
        "place_id": result["place_id"],
        "lat": result["geometry"]["location"]["lat"],
        "lon": result["geometry"]["location"]["lng"],
        "formatted_address": result["formatted_address"],
        "types": result.get("types"),
    }

async def geocode_location(location: str, add_new_geocoded_location: Callable[[LocationsDefinition], None], geo_boundaries: Optional[OptionalGeoBoundaries]) -> PlaceId | None:
    """Make a request to Google Maps API to get geocoding information. Returns the place_id."""

    cached_location = get_location_in_alias_cache(location)
    if cached_location:
        print(f"- 3. {location}")
        print(f"    (Cached)")
        return cached_location

    key = os.getenv("GOOGLE_MAPS_API_KEY")
    url = "https://maps.googleapis.com/maps/api/geocode/json"
    bounds = f"{geo_boundaries['minLat']},{geo_boundaries['minLon']}|{geo_boundaries['maxLat']},{geo_boundaries['maxLon']}" if geo_boundaries else None
    params = {
        "key": key,
        "address": location,
        "bounds": bounds,
    }

    print(f"- 3. {location} (Geocoding)")

    response = requests.get(url, params=params)
    data = response.json()
    if response.status_code != 200 or data["status"] != "OK":
        return None
    
    if not data["results"]:
        print(f"    (No results)")
        return None
    
    if is_location_unspecific(data["results"][0]["types"]):
        print(f"    (Location not specific enough: {data['results'][0]['types']})")
        return None

    formatted_location = format_geocoding_results_for_cache(data["results"][0])

    add_new_geocoded_location(formatted_location)
    return formatted_location["place_id"]

def is_feed_item_with_locations(item: CustomFeedItem) -> bool:
    """Filter out feed items that don't have any locations."""
    if not item["locations"]:
        return False
    return len(item["locations"].keys()) > 0

def filter_and_reorganize_articles(items: List[CustomFeedItem]) -> List[ArticlesDefinition]:
    """Filter out feed items that don't have any locations."""

    to_return = []
    for item in items:
        to_add: ArticlesDefinition
        if not is_feed_item_with_locations(item):
            to_add = {
                "uuid3": hash(item["item"].get("id")),
                "headline": None,
                "link": item["item"].get("link"),
                "pub_date": None,
                "author": None,
                "feed_name": None,
            }
        else:
            to_add = {
                "uuid3": hash(item["item"].get("id")),
                "headline": item["item"].get("title"),
                "link": item["item"].get("link"),
                "pub_date": item["item"].get("pub_date"),
                "author": item["item"].get("author"),
                "feed_name": item["item"]["feed"].get("name") if item["item"]["feed"] else None,
            }
        
        to_return.append(to_add)
            
    return to_return

def generate_location_article_relations(items: List[CustomFeedItem]) -> List[LocationArticleRelationsDefinition]:
    """Generate the location-article relations."""
    # TODO: Optimize this when we eventually migrate to a class-based component.

    to_return: List[LocationArticleRelationsDefinition] = []

    for item in items:
        if not is_feed_item_with_locations(item):
            continue
        for location in item["locations"]:
            article_uuid = hash(item["item"].get("id"))
            place_id = item["locations"][location]
            if not place_id or not article_uuid: 
                continue
            to_return.append({
                "id": hash(f"{article_uuid}-{place_id}"),
                "article_uuid": article_uuid,
                "place_id": place_id,
                "location_name": location,
            })

    return to_return

def send_articles_to_db(articles: List[ArticlesDefinition]) -> None:
    """Send articles to the Supabase database."""
    if not WRITE_TO_DB:
        print(f"Dry run: Would have sent {len(articles)} articles to Supabase.")
        return
    
    supabase_url = os.getenv("SUPABASE_URL") or ""
    supabase_key = os.getenv("SUPABASE_SER_KEY") or ""

    if len(articles) == 0:
        print("No new articles to send to Supabase.")
        return

    supabase = create_client(supabase_url, supabase_key)

    print(f"- 4. Sending {len(articles)} articles to Supabase")
    print(f"    {len([article for article in articles if article['headline']])} with location data, {len([article for article in articles if not article['headline']])} without")

    supabase.table("articles").insert(articles, upsert=True).execute()

def send_locations_to_db(locations: List[LocationsDefinition]) -> None:
    if not WRITE_TO_DB:
        print(f"Dry run: Would have sent {len(locations)} locations to Supabase.")
        return
    
    supabase_url = os.getenv("SUPABASE_URL") or ""
    supabase_key = os.getenv("SUPABASE_SER_KEY") or ""

    if len(locations) == 0:
        print("No new locations to send to Supabase.")
        return

    supabase = create_client(supabase_url, supabase_key)
    print(f"- 5. Sending {len(locations)} locations to Supabase")
    supabase.table("locations").insert(list(locations), upsert=True).execute()

def send_location_article_relations_to_db(location_article_relations: List[LocationArticleRelationsDefinition]) -> None:
    if not WRITE_TO_DB:
        print(f"Dry run: Would have sent {len(location_article_relations)} location-article relations to Supabase.")
        return
    
    supabase_url = os.getenv("SUPABASE_URL") or ""
    supabase_key = os.getenv("SUPABASE_SER_KEY") or ""

    if len(location_article_relations) == 0:
        print("No new location-article relations to send to Supabase.")
        return

    supabase = create_client(supabase_url, supabase_key)
    print(f"- 6. Sending {len(location_article_relations)} location-article relations to Supabase")
    supabase.table("location_article_relations").insert(location_article_relations, upsert=True).execute()

def handle_articles_result(new_articles_with_geocoded_locations: List[ArticlesDefinition]) -> None:
    """Add the new articles to the cache."""
    cache_mgr = CacheManager()
    seen_articles = cache_mgr.load_seen_articles()
    seen_articles.extend([article["uuid3"] for article in new_articles_with_geocoded_locations])
    cache_mgr.save_seen_articles(seen_articles)
    send_articles_to_db(new_articles_with_geocoded_locations)

def handle_locations_result(new_geocoded_full_locations: List[LocationsDefinition]) -> None:
    """Add the new geocoded locations to the cache."""
    cache_mgr = CacheManager()
    seen_locations = cache_mgr.load_seen_locations()
    seen_locations.extend([location["place_id"] for location in new_geocoded_full_locations])
    cache_mgr.save_seen_locations(seen_locations)
    send_locations_to_db(new_geocoded_full_locations)

def handle_location_article_relations_result(new_location_article_relations: List[LocationArticleRelationsDefinition]) -> None:
    """Add the new location-article relations to the cache."""
    cache_mgr = CacheManager()
    location_article_relations = cache_mgr.load_location_article_relations()
    location_article_relations.extend(new_location_article_relations)
    cache_mgr.save_location_article_relations(location_article_relations)
    send_location_article_relations_to_db(new_location_article_relations)

async def main() -> None:
    global WRITE_TO_DB
    
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='Parse RSS feeds and extract location data')
    parser.add_argument('--dry-run', action='store_true', help='Run without writing to database')
    parser.add_argument('--sync-db', action='store_true', help='Sync cache with database (use with caution)')
    args = parser.parse_args()
    
    # Update global flag based on command line arguments
    if args.dry_run:
        WRITE_TO_DB = False
        print("Running in dry-run mode - no data will be written to the database")
    
    # Initialize cache manager
    cache_mgr = CacheManager()
    
    # Sync with DB if requested (should be rarely needed)
    if args.sync_db:
        print("Syncing cache with database...")
        supabase_url = os.getenv("SUPABASE_URL") or ""
        supabase_key = os.getenv("SUPABASE_SER_KEY") or ""
        supabase = create_client(supabase_url, supabase_key)
        
        # This would normally be a more complex operation to compare and merge
        # For now, we'll just refresh the cache
        refresh_cache_from_db()
        return
    
    # Use the artifact-based cache instead of reading from DB
    new_articles = await fetch_new_articles()
    if not new_articles: 
        print("No new articles found.")
        return

    print("New articles found.")
    full_articles = await add_articles_full_content(new_articles)

    new_articles_with_locations = add_article_locations(full_articles)

    geocoding_result = await add_geocoded_locations(new_articles_with_locations)
    new_articles_with_geocoded_locations = geocoding_result["articles"]
    new_geocoded_full_locations = geocoding_result["new_geocoded_full_locations"]

    filtered_articles = filter_and_reorganize_articles(new_articles_with_geocoded_locations)
    location_article_relations = generate_location_article_relations(new_articles_with_geocoded_locations)

    handle_articles_result(filtered_articles)
    handle_locations_result(new_geocoded_full_locations)
    handle_location_article_relations_result(location_article_relations)

if __name__ == "__main__":
    asyncio.run(main())
