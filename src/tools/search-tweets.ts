import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { TwitterApi } from "twitter-api-v2";
import { wrapToolHandler } from "../utils/error-handler.js";

const register = (server: McpServer, client: TwitterApi) => {
  server.tool(
    "search_tweets",
    "Search recent tweets (last 7 days) using a query string. NOTE: This endpoint requires Basic or Pro tier X API access — not available on the free tier.",
    {
      query: z
        .string()
        .min(1)
        .describe(
          "Search query. Supports operators like -is:retweet, lang:en, from:user, #hashtag",
        ),
      max_results: z
        .number()
        .int()
        .min(10)
        .max(100)
        .default(10)
        .describe("Number of results to return (10-100, default 10)"),
      next_token: z
        .string()
        .optional()
        .describe("Pagination token from previous response for next page"),
    },
    async (args) =>
      wrapToolHandler(async () => {
        const result = await client.v2.search(args.query, {
          max_results: args.max_results,
          next_token: args.next_token,
          expansions: ["author_id"],
          "tweet.fields": ["created_at", "public_metrics", "text", "author_id"],
          "user.fields": ["name", "username"],
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  data: result.data.data,
                  meta: result.data.meta,
                  includes: result.data.includes,
                },
                null,
                2,
              ),
            },
          ],
        };
      }),
  );
};

export { register };
