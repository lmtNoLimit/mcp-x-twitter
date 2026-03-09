import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { TwitterApi } from "twitter-api-v2";
import { wrapToolHandler } from "../utils/error-handler.js";

const register = (server: McpServer, client: TwitterApi) => {
  server.tool(
    "delete_tweet",
    "Delete a tweet by its ID. Only tweets posted by the authenticated user can be deleted.",
    {
      tweet_id: z.string().describe("The ID of the tweet to delete"),
    },
    async (args) =>
      wrapToolHandler(async () => {
        const result = await client.v2.deleteTweet(args.tweet_id);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                { deleted: result.data.deleted, tweet_id: args.tweet_id },
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
