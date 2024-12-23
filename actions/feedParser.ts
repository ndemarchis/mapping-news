import * as fs from "fs-extra";
import { join } from "path";
import Parser, { type Item as ParserItem } from "rss-parser";
import puppeteer from "puppeteer";

const FEED_FILE = join(__dirname, "../public/feeds/feeds.txt");
const CACHE_FILE = join(__dirname, "../cache.json");
const FULL_ARTICLE_CHAR_THRESHOLD = 250;

interface FeedItem {
  /**
   * The title of the article.
   */
  title?: string;
  link?: string;
  pubDate?: string;
  id?: string;
  author?: string;
  /**
   * Whether the article has full text or not.
   */
  fullText?: boolean;
}

interface CustomFeedItem {
  item: FeedItem;
  locations: ScrapedLocation[];
}

interface ScrapedLocation {
  originalText: string;
  processedText: string;
  confidence: number;
}

async function loadFeeds(): Promise<string[]> {
  const data = await fs.readFile(FEED_FILE, "utf8");
  return data.split("\n").filter(Boolean);
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

const feedItemStandardizer = (item: ParserItem): FeedItem => ({
  title: item.title,
  link: item.link,
  pubDate: item.pubDate,
  id: item.guid,
  author: item.creator,
  fullText: (item.content?.length || 0) > FULL_ARTICLE_CHAR_THRESHOLD,
});

async function parseFeed(url: string): Promise<FeedItem[]> {
  const feedParser = new Parser();
  const feed = await feedParser.parseURL(url);
  return feed.items.map(feedItemStandardizer);
}

async function fetchNewArticles(): Promise<FeedItem[]> {
  // TODO: sync with server

  const seenArticles = await loadSeenArticles();
  const newArticles: FeedItem[] = [];

  const RSS_FEEDS = await loadFeeds();

  for (const feedUrl of RSS_FEEDS) {
    const articles = await parseFeed(feedUrl);
    for (const article of articles) {
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

async function scrape(url: string) {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
  });
  const page = await browser.newPage();
  await page.goto(url);
  const content = await page.content();
  await browser.close();
  return content;
}

async function addArticlesFullContent(
  articles: FeedItem[],
): Promise<FeedItem[]> {
  return Promise.all(
    articles.map(async (article) => {
      if (article.fullText) return article;
      const content = await scrape(article.link || "");
      return { ...article, content };
    }),
  );
}

async function addArticleLocation(article: FeedItem): Promise<CustomFeedItem> {}

(async () => {
  try {
    const newArticles = await fetchNewArticles();
    if (newArticles.length > 0) {
      console.log("New articles found:");
      newArticles.forEach((article) =>
        console.log(`- ${article.title} (${article.link})`),
      );
      const fullArticles = await addArticlesFullContent(newArticles);
    } else {
      console.log("No new articles found.");
    }
  } catch (error) {
    console.error(`Error: ${(error as Error).message}`);
    process.exit(1);
  }
})();
