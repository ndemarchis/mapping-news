import fetch from "node-fetch";
import * as fs from "fs-extra";
import { join } from "path";
import Parser from "rss-parser";

const RSS_FEEDS = [
  "https://morss.it/feeds.bbci.co.uk/news/rss.xml",
  "https://morss.it/https://gothamist.com/feed",
];

const CACHE_FILE = join(__dirname, "../cache.json");

interface FeedItem {
  title?: string;
  link?: string;
  published?: string;
  id?: string;
}

async function loadSeenArticles(): Promise<Set<string>> {
  if (await fs.pathExists(CACHE_FILE)) {
    const data = await fs.readFile(CACHE_FILE, "utf8");
    return new Set(JSON.parse(data));
  }
  return new Set();
}

async function saveSeenArticles(seenArticles: Set<string>): Promise<void> {
  await fs.writeFile(
    CACHE_FILE,
    JSON.stringify(Array.from(seenArticles)),
    "utf8",
  );
}

async function parseFeed(url: string): Promise<FeedItem[]> {
  const feedParser = new Parser();
  const items: FeedItem[] = [];

  const feed = await feedParser.parseURL(url);
  for (const item of feed.items) {
    items.push({
      title: item.title,
      link: item.link,
      published: item.pubDate,
      id: item.guid,
    });
  }
  return items;
}

async function fetchNewArticles(): Promise<FeedItem[]> {
  const seenArticles = await loadSeenArticles();
  const newArticles: FeedItem[] = [];

  for (const feedUrl of RSS_FEEDS) {
    const articles = await parseFeed(feedUrl);
    for (const article of articles) {
      console.log(article);
      if (!article?.id) continue;
      if (!seenArticles.has(article.id)) {
        newArticles.push(article);
        seenArticles.add(article.id);
      }
    }
  }

  await saveSeenArticles(seenArticles);
  return newArticles;
}

(async () => {
  try {
    const newArticles = await fetchNewArticles();
    if (newArticles.length > 0) {
      console.log("New articles found:");
      newArticles.forEach((article) =>
        console.log(`- ${article.title} (${article.link})`),
      );
    } else {
      console.log("No new articles found.");
    }
  } catch (error) {
    console.error(`Error: ${(error as Error).message}`);
    process.exit(1);
  }
})();
