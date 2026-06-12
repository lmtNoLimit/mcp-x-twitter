import { TwitterApi } from "twitter-api-v2";
import { createLogger } from "./utils/logger.js";
import { createXquikClientFromEnv, type XquikClient } from "./xquik-client.js";

const logger = createLogger("x-twitter");

export interface XClients {
  /** Read-only client (Bearer Token - app-only auth) */
  readonly: TwitterApi | null;
  /** Optional Xquik REST API client for read tools */
  xquik: XquikClient | null;
  /** Read-write client (OAuth 2.0 user context) - null if no refresh token */
  readwrite: TwitterApi | null;
}

const createClient = (): XClients => {
  const {
    X_BEARER_TOKEN,
    X_CLIENT_ID,
    X_CLIENT_SECRET,
    X_REFRESH_TOKEN,
  } = process.env;

  const xquik = createXquikClientFromEnv();

  if (!X_BEARER_TOKEN && !xquik) {
    throw new Error(
      "Missing X_BEARER_TOKEN or XQUIK_API_KEY. Configure one read provider.",
    );
  }

  const readonly = X_BEARER_TOKEN ? new TwitterApi(X_BEARER_TOKEN) : null;
  if (readonly) {
    logger.info("X/Twitter read-only client initialized (Bearer Token)");
  }
  if (xquik) {
    logger.info("Xquik read client initialized");
  }

  // Read-write client using OAuth 2.0 user context (if refresh token available)
  let readwrite: TwitterApi | null = null;
  if (X_CLIENT_ID && X_REFRESH_TOKEN) {
    readwrite = new TwitterApi({
      clientId: X_CLIENT_ID,
      clientSecret: X_CLIENT_SECRET,
    });
    logger.info("X/Twitter read-write client initialized (OAuth 2.0)");
  } else {
    logger.warn(
      "No X_CLIENT_ID or X_REFRESH_TOKEN - write tools (post, like, retweet) will not work. Run: npm run get-token",
    );
  }

  return { readonly, xquik, readwrite };
};

/**
 * Get a fresh OAuth 2.0 user access token using the refresh token.
 * twitter-api-v2 handles this via refreshOAuth2Token.
 */
const getWriteClient = async (clients: XClients): Promise<TwitterApi> => {
  if (!clients.readwrite) {
    throw new Error(
      "Write operations require OAuth 2.0 user auth. Set X_CLIENT_ID and X_REFRESH_TOKEN. Run: npm run get-token",
    );
  }

  const { X_REFRESH_TOKEN } = process.env;

  const { client: refreshedClient } = await clients.readwrite.refreshOAuth2Token(
    X_REFRESH_TOKEN!,
  );

  return refreshedClient;
};

export { createClient, getWriteClient };
