import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { XClients } from "../client.js";
import { getWriteClient } from "../client.js";
import { wrapToolHandler } from "../utils/error-handler.js";

const register = (server: McpServer, clients: XClients) => {
  server.tool(
    "get_mentions",
    "Retrieve recent tweets that mention the authenticated user. Requires OAuth 2.0 user auth.",
    {
      max_results: z
        .number()
        .int()
        .min(1)
        .max(100)
        .default(5)
        .describe("Number of mention tweets to return (1-100, default 5)"),
      since_id: z
        .string()
        .optional()
        .describe("Return only tweets newer than this tweet ID"),
      pagination_token: z
        .string()
        .optional()
        .describe("Pagination token from a previous response"),
    },
    async (args) =>
      wrapToolHandler(async () => {
        const writeClient = await getWriteClient(clients);
        const me = await writeClient.v2.me();
        const userId = me.data.id;
        const result = await writeClient.v2.userMentionTimeline(userId, {
          max_results: args.max_results,
          since_id: args.since_id,
          pagination_token: args.pagination_token,
          expansions: ["author_id", "referenced_tweets.id"],
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
