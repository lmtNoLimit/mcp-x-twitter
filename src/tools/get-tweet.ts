import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { XClients } from "../client.js";
import { wrapToolHandler } from "../utils/error-handler.js";

const register = (server: McpServer, clients: XClients) => {
  server.tool(
    "get_tweet",
    "Fetch a single tweet by ID with full details including author info, metrics, and media.",
    {
      tweet_id: z.string().describe("The ID of the tweet to retrieve"),
    },
    async (args) =>
      wrapToolHandler(async () => {
        const result = await clients.readonly.v2.singleTweet(args.tweet_id, {
          expansions: ["author_id", "attachments.media_keys", "referenced_tweets.id"],
          "tweet.fields": ["created_at", "public_metrics", "text", "author_id", "entities"],
          "user.fields": ["name", "username", "profile_image_url"],
          "media.fields": ["url", "preview_image_url", "type", "width", "height"],
        });
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }),
  );
};

export { register };
