import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { XClients } from "../client.js";
import { getWriteClient } from "../client.js";
import { wrapToolHandler } from "../utils/error-handler.js";

const register = (server: McpServer, clients: XClients) => {
  server.tool(
    "post_tweet",
    "Post a new tweet. Optionally attach media or reply to an existing tweet. Requires OAuth 2.0 user auth.",
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
        const writeClient = await getWriteClient(clients);
        const payload: Record<string, unknown> = { text: args.text };
        if (args.media_ids && args.media_ids.length > 0) {
          payload.media = { media_ids: args.media_ids };
        }
        if (args.reply_to_id) {
          payload.reply = { in_reply_to_tweet_id: args.reply_to_id };
        }
        const result = await writeClient.v2.tweet(payload as Parameters<typeof writeClient.v2.tweet>[0]);
        return {
          content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }],
        };
      }),
  );
};

export { register };
