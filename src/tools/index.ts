import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { XClients } from "../client.js";
import { register as postTweet } from "./post-tweet.js";
import { register as deleteTweet } from "./delete-tweet.js";
import { register as getTweet } from "./get-tweet.js";
import { register as searchTweets } from "./search-tweets.js";
import { register as uploadMedia } from "./upload-media.js";
import { register as likeTweet } from "./like-tweet.js";
import { register as retweet } from "./retweet.js";
import { register as getMentions } from "./get-mentions.js";

const registerAllTools = (server: McpServer, clients: XClients) => {
  postTweet(server, clients);
  deleteTweet(server, clients);
  getTweet(server, clients);
  searchTweets(server, clients);
  uploadMedia(server, clients);
  likeTweet(server, clients);
  retweet(server, clients);
  getMentions(server, clients);
};

export { registerAllTools };
