import { load } from "cheerio";
import { URL } from "url";

export type CrawlResult = string[];

async function getHTMLByUrl(url: string) {
  const response = await fetch(url);
  const html = await response.text();

  return html;
}

export async function crawl(
  url: string,
  visited: Set<string> = new Set()
): Promise<CrawlResult> {
  if (!url) {
    return [];
  }

  if (visited.has(url)) {
    return [];
  }

  const origin = new URL(url).origin;
  visited.add(url);
  const html = await getHTMLByUrl(url);
  const $ = load(html);
  const linkElements = $("a");
  const links = new Set<string>();
  const nestedCrawlPromises: Promise<CrawlResult>[] = [];
  linkElements.each((_, element) => {
    const link = $(element).attr("href");
    if (link) {
      const resolvedLink = new URL(link, url).href;
      if (resolvedLink.startsWith(origin)) {
        links.add(resolvedLink);
        nestedCrawlPromises.push(crawl(resolvedLink, visited));
      }
    }
  });
  const nestedCrawlResults = await Promise.all(nestedCrawlPromises);
  nestedCrawlResults?.flat()?.map((link) => links.add(link));

  return [...links];
}
