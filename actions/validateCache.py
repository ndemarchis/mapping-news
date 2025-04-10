#!/usr/bin/env python3
import os
import sys
import json
from pathlib import Path
from typing import List, Dict, Any, Set, TypedDict
from supabase import create_client, Client
import hashlib
import argparse

sys.path.append(str(Path(__file__).resolve().parent))
from feedParser import CacheManager, CACHE_DIRECTORY

class ValidationResults(TypedDict):
    missing_in_cache: int
    missing_in_db: int
    total_cache: int
    total_db: int
    sample_missing_in_cache: List[str]
    sample_missing_in_db: List[str]

def get_server_data_recursive(supabase: Client, table: str, field: str, index: int = 0, limit: int = 1000) -> Set[str]:
    """Recursively get all IDs from a table in the database."""
    response = supabase.table(table).select(field).range(index, index + limit).execute()
    result = {item[field] for item in response.data}
    
    if len(response.data) == limit:
        result.update(get_server_data_recursive(supabase, table, field, index + limit, limit))
    
    return result

def validate_cache_against_db(table: str, id_field: str, cache_file: str) -> ValidationResults:
    """Compare the cache with the database for a specific table."""
    supabase_url = os.getenv("SUPABASE_URL") or ""
    supabase_key = os.getenv("SUPABASE_SER_KEY") or ""
    supabase = create_client(supabase_url, supabase_key)
    
    # Get IDs from database
    db_ids = get_server_data_recursive(supabase, table, id_field)
    
    # Get IDs from cache
    cache_mgr = CacheManager()
    cache_file_path = CACHE_DIRECTORY / cache_file
    if not cache_file_path.exists():
        print(f"Cache file {cache_file} does not exist.")
        return {
            "missing_in_cache": 0,
            "missing_in_db": 0,
            "total_cache": 0,
            "total_db": len(db_ids),
            "sample_missing_in_cache": [],
            "sample_missing_in_db": []
        }
    
    with open(cache_file_path, "r", encoding="utf-8") as f:
        cache_data = json.load(f)
    
    # Simple arrays need to be converted to sets of IDs
    if isinstance(cache_data, list) and all(isinstance(item, str) for item in cache_data):
        cache_ids = set(cache_data)
    # For complex objects, extract the ID field
    elif isinstance(cache_data, list) and all(isinstance(item, dict) for item in cache_data):
        cache_ids = {item.get(id_field) for item in cache_data if id_field in item}
    else:
        cache_ids = set()
    
    # Find differences
    missing_in_cache = db_ids - cache_ids
    missing_in_db = cache_ids - db_ids
    
    # Get samples for reporting
    sample_missing_in_cache = list(missing_in_cache)[:10]
    sample_missing_in_db = list(missing_in_db)[:10]
    
    return {
        "missing_in_cache": len(missing_in_cache),
        "missing_in_db": len(missing_in_db),
        "total_cache": len(cache_ids),
        "total_db": len(db_ids),
        "sample_missing_in_cache": sample_missing_in_cache,
        "sample_missing_in_db": sample_missing_in_db
    }

def reconcile_cache_with_db(table: str, id_field: str, cache_file: str) -> None:
    """Update the cache to match the database."""
    supabase_url = os.getenv("SUPABASE_URL") or ""
    supabase_key = os.getenv("SUPABASE_SER_KEY") or ""
    supabase = create_client(supabase_url, supabase_key)
    
    # Get IDs from database
    db_ids = get_server_data_recursive(supabase, table, id_field)
    
    # Update the cache file
    cache_mgr = CacheManager()
    cache_file_path = CACHE_DIRECTORY / cache_file
    
    if table == "articles":
        cache_mgr.save_seen_articles(list(db_ids))
    elif table == "locations":
        cache_mgr.save_seen_locations(list(db_ids))
    elif table == "location_article_relations":
        # For complex objects, need to get the full data from DB
        response = supabase.table(table).select("*").execute()
        cache_mgr.save_location_article_relations(response.data)
    
    print(f"Cache file {cache_file} updated to match the database.")

def main() -> None:
    parser = argparse.ArgumentParser(description='Validate cache artifacts against the database')
    parser.add_argument('--reconcile', action='store_true', help='Update cache to match the database')
    parser.add_argument('--verbose', action='store_true', help='Print detailed results')
    args = parser.parse_args()
    
    # Define validation tasks
    tasks = [
        {"table": "articles", "id_field": "uuid3", "cache_file": "articles.json"},
        {"table": "locations", "id_field": "place_id", "cache_file": "locations.json"},
        {"table": "location_article_relations", "id_field": "id", "cache_file": "location_article_relations.json"}
    ]
    
    any_discrepancies = False
    
    for task in tasks:
        print(f"\nValidating {task['table']}...")
        results = validate_cache_against_db(task["table"], task["id_field"], task["cache_file"])
        
        print(f"  Total in database: {results['total_db']}")
        print(f"  Total in cache: {results['total_cache']}")
        print(f"  Missing in cache: {results['missing_in_cache']}")
        print(f"  Missing in database: {results['missing_in_db']}")
        
        if results['missing_in_cache'] > 0 or results['missing_in_db'] > 0:
            any_discrepancies = True
            if args.verbose:
                if results['sample_missing_in_cache']:
                    print("\n  Sample items missing in cache:")
                    for item in results['sample_missing_in_cache']:
                        print(f"    - {item}")
                
                if results['sample_missing_in_db']:
                    print("\n  Sample items missing in database:")
                    for item in results['sample_missing_in_db']:
                        print(f"    - {item}")
            
            if args.reconcile:
                reconcile_cache_with_db(task["table"], task["id_field"], task["cache_file"])
    
    if any_discrepancies and not args.reconcile:
        print("\nDiscrepancies found. Run with --reconcile to update the cache.")
        sys.exit(1)
    elif not any_discrepancies:
        print("\nAll cache files are in sync with the database.")
    else:
        print("\nCache has been reconciled with the database.")

if __name__ == "__main__":
    main() 