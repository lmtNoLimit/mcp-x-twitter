import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { TwitterApi } from "twitter-api-v2";
import { wrapToolHandler } from "../utils/error-handler.js";

const register = (server: McpServer, client: TwitterApi) => {
  server.tool(
    "post_tweet",
    "Post a new tweet. Optionally attach media (up to 4 media IDs) or reply to an existing tweet.",
    {
      text: z.string().min(1).max(280).describe("Tweet text content (max 280 chars)"),
      media_ids: z
        .array(z.string())
        .max(4)
        .optional()
        .describe("Array of media IDs to attach (from upload_media)"),
      reply_to_id: z
        .string()
        .optional()
        .describe("Tweet ID to reply to"),
    },
    async (args) =>
      wrapToolHandler(async () => {
        const payload: Record<string, unknown> = { text: args.text };
        if (args.media_ids && args.media_ids.length > 0) {
          payload.media = { media_ids: args.media_ids };
        }
        if (args.reply_to_id) {
          payload.reply = { in_reply_to_tweet_id: args.reply_to_id };
        }
        const result = await client.v2.tweet(payload as Parameters<typeof client.v2.tweet>[0]);
        return {
          content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }],
        };
      }),
  );
};

export { register };
