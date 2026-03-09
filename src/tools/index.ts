import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { TwitterApi } from "twitter-api-v2";
import { register as postTweet } from "./post-tweet.js";
import { register as deleteTweet } from "./delete-tweet.js";
import { register as getTweet } from "./get-tweet.js";
import { register as searchTweets } from "./search-tweets.js";
import { register as uploadMedia } from "./upload-media.js";
import { register as likeTweet } from "./like-tweet.js";
import { register as retweet } from "./retweet.js";
import { register as getMentions } from "./get-mentions.js";

const registerAllTools = (server: McpServer, client: TwitterApi) => {
  postTweet(server, client);
  deleteTweet(server, client);
  getTweet(server, client);
  searchTweets(server, client);
  uploadMedia(server, client);
  likeTweet(server, client);
  retweet(server, client);
  getMentions(server, client);
};

export { registerAllTools };
