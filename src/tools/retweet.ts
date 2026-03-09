import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { TwitterApi } from "twitter-api-v2";
import { wrapToolHandler } from "../utils/error-handler.js";

const register = (server: McpServer, client: TwitterApi) => {
  server.tool(
    "retweet",
    "Retweet a tweet as the authenticated user.",
    {
      tweet_id: z.string().describe("The ID of the tweet to retweet"),
    },
    async (args) =>
      wrapToolHandler(async () => {
        // Get authenticated user ID
        const me = await client.v2.me();
        const userId = me.data.id;
        const result = await client.v2.retweet(userId, args.tweet_id);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                { retweeted: result.data.retweeted, tweet_id: args.tweet_id },
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
