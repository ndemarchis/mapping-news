from pathlib import Path
from typing import List, TypedDict, Optional, Dict
from pydantic import BaseModel


FEED_FILE = Path(__file__).resolve().parent / "../public/feeds/feeds.csv"
CACHE_DIRECTORY = Path(__file__).resolve().parent / "../cache/"
FILTERABLE_LOCATION_TYPES = ["political", "country", "administrative_area_level_1", "administrative_area_level_2","locality","sublocality","neighborhood","postal_code"]
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



class LLMConstrainedAddress(TypedDict):
    poi_name: Optional[str]
    street_address: Optional[str]
    city: Optional[str]
    state: Optional[str]
    postal_code: Optional[str]
    country: Optional[str]

class LLMConstrainedOutput(BaseModel):
    locations: List[LLMConstrainedAddress]

class GeocodingResultDefinition(TypedDict):
    articles: List[CustomFeedItem]
    new_geocoded_full_locations: List[LocationsDefinition]