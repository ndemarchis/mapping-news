# parse local_cache for articles and articles_CLOUD json files. 

from pathlib import Path
from typing import List

from feedParser import load_seen_articles, refresh_cache_from_db, load_seen_articles_cloud, send_articles_to_db, ArticlesDefinition

def update_cloud_cache() -> None:
    # if there are any article IDs that exist in our article.json, but not in our articles_CLOUD.json, we need to send them to the cloud

    # load the local and cloud cache
    seen_articles = load_seen_articles()
    refresh_cache_from_db()

    # check the cloud cache for any articles that are not in the local cache
    cloud_articles = load_seen_articles_cloud()
    cloud_articles_ids = set(cloud_articles)
    local_articles_ids = set(seen_articles)
    missing_from_cloud = local_articles_ids - cloud_articles_ids

    # if there are any articles that are missing from the cloud, add them
    if missing_from_cloud:
        print(f"Adding {len(missing_from_cloud)} articles to the cloud cache")
        # lambda to convert set to list of dicts
        missing_articles: List[ArticlesDefinition] = list(map(lambda x: {"uuid3": x, "headline": None, "link": None, "pub_date": None, "author": None, "feed_name": None}, missing_from_cloud))
        print(missing_articles[0])
        send_articles_to_db(missing_articles)

update_cloud_cache()