#!/usr/bin/env npx tsx
import { TwitterApi } from "twitter-api-v2";
import { createServer } from "http";
import { URL } from "url";
import "dotenv/config";

const PORT = 3457;
const CALLBACK_URL = `http://127.0.0.1:${PORT}`;

const SCOPES = [
  "tweet.read",
  "tweet.write",
  "users.read",
  "like.read",
  "like.write",
  "offline.access",
];

const main = async () => {
  const clientId = process.env.X_CLIENT_ID;
  const clientSecret = process.env.X_CLIENT_SECRET;
  if (!clientId) {
    console.error("Set X_CLIENT_ID in .env (from developer.x.com → App → OAuth 2.0 settings)");
    process.exit(1);
  }

  const client = new TwitterApi({ clientId, clientSecret });

  const { url, codeVerifier, state } = client.generateOAuth2AuthLink(CALLBACK_URL, {
    scope: SCOPES,
  });

  console.log("\n1. Open this URL in your browser:\n");
  console.log(url);
  console.log("\n2. Authorize the app — you will be redirected back automatically.\n");

  const code = await new Promise<string>((resolve, reject) => {
    const server = createServer((req, res) => {
      const reqUrl = new URL(req.url ?? "/", CALLBACK_URL);
      const authCode = reqUrl.searchParams.get("code");
      const returnedState = reqUrl.searchParams.get("state");
      const error = reqUrl.searchParams.get("error");

      if (error) {
        res.writeHead(400, { "Content-Type": "text/html" });
        res.end(`<h1>Authorization failed</h1><p>${error}</p>`);
        server.close();
        reject(new Error(`Authorization denied: ${error}`));
        return;
      }

      if (authCode && returnedState === state) {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end("<h1>Authorization successful!</h1><p>You can close this tab and return to the terminal.</p>");
        server.close();
        resolve(authCode);
      }
    });

    server.listen(PORT, "127.0.0.1", () => {
      console.log(`Waiting for authorization on ${CALLBACK_URL}...\n`);
    });

    server.on("error", (err) => {
      reject(new Error(`Could not start local server on port ${PORT}: ${err.message}`));
    });
  });

  const { accessToken, refreshToken } = await client.loginWithOAuth2({
    code,
    codeVerifier,
    redirectUri: CALLBACK_URL,
  });

  console.log("3. Add this to your .env file or Claude MCP config:\n");
  console.log(`X_REFRESH_TOKEN=${refreshToken}`);
  console.log(`\nAccess token (expires in 2h, refresh token is long-lived): ${accessToken.substring(0, 20)}...`);
  console.log("\nNote: In developer.x.com → App → OAuth 2.0, set callback URL to: http://127.0.0.1:3457");
};

main().catch(console.error);
