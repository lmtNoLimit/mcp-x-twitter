import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { XClients } from "../client.js";
import { getWriteClient } from "../client.js";
import { wrapToolHandler } from "../utils/error-handler.js";

const register = (server: McpServer, clients: XClients) => {
  server.tool(
    "delete_tweet",
    "Delete a tweet by its ID. Requires OAuth 2.0 user auth.",
    {
      tweet_id: z.string().describe("The ID of the tweet to delete"),
    },
    async (args) =>
      wrapToolHandler(async () => {
        const writeClient = await getWriteClient(clients);
        const result = await writeClient.v2.deleteTweet(args.tweet_id);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ deleted: result.data.deleted, tweet_id: args.tweet_id }, null, 2),
            },
          ],
        };
      }),
  );
};

export { register };
