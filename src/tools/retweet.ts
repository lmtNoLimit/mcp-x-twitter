import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { XClients } from "../client.js";
import { getWriteClient } from "../client.js";
import { wrapToolHandler } from "../utils/error-handler.js";

const register = (server: McpServer, clients: XClients) => {
  server.tool(
    "retweet",
    "Retweet a tweet as the authenticated user. Requires OAuth 2.0 user auth.",
    {
      tweet_id: z.string().describe("The ID of the tweet to retweet"),
    },
    async (args) =>
      wrapToolHandler(async () => {
        const writeClient = await getWriteClient(clients);
        const me = await writeClient.v2.me();
        const result = await writeClient.v2.retweet(me.data.id, args.tweet_id);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ retweeted: result.data.retweeted, tweet_id: args.tweet_id }, null, 2),
            },
          ],
        };
      }),
  );
};

export { register };
