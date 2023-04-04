import type { NextApiRequest, NextApiResponse } from "next";

import { crawl, CrawlResult } from "@/utils/crawl";

export type SuccessResult = { links: CrawlResult; crawlTime: number };
export type ErrorResult = { error: unknown };
export type ResponseData = SuccessResult | ErrorResult;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method === "POST") {
    try {
      const payload = JSON.parse(req.body);
      if (payload.url) {
        const startTime = performance.now();
        const data = await crawl(payload.url);
        const endTime = performance.now();
        res.status(200).json({ links: data, crawlTime: endTime - startTime });
      }
    } catch (err) {
      res
        .status(500)
        .json({ error: (err as Error)?.message || "Server error" });
    }
  } else {
    res.status(405);
  }
}
