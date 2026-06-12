import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { XClients } from "../client.js";
import { wrapToolHandler } from "../utils/error-handler.js";
import { normalizeXquikSearchResponse } from "../xquik-client.js";

const register = (server: McpServer, clients: XClients) => {
  server.tool(
    "search_tweets",
    "Search recent tweets using Xquik when configured, or X API recent search otherwise.",
    {
      query: z
        .string()
        .min(1)
        .describe("Search query. Supports operators like -is:retweet, lang:en, from:user, #hashtag"),
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
        if (clients.xquik) {
          const result = await clients.xquik.searchTweets({
            query: args.query,
            limit: args.max_results,
            cursor: args.next_token,
          });
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  normalizeXquikSearchResponse(result),
                  null,
                  2,
                ),
              },
            ],
          };
        }
        if (!clients.readonly) {
          throw new Error("search_tweets requires X_BEARER_TOKEN or XQUIK_API_KEY.");
        }
        const result = await clients.readonly.v2.search(args.query, {
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
                { data: result.data.data, meta: result.data.meta, includes: result.data.includes },
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
