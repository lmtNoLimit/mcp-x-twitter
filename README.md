# @builderhub/mcp-x-twitter

MCP server for X (Twitter) — post tweets, upload media, and manage interactions via Claude Code or Claude Desktop.

[![CI](https://github.com/lmtNoLimit/mcp-x-twitter/actions/workflows/ci.yml/badge.svg)](https://github.com/lmtNoLimit/mcp-x-twitter/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/@builderhub%2Fmcp-x-twitter.svg)](https://www.npmjs.com/package/@builderhub/mcp-x-twitter)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Install

```bash
npx @builderhub/mcp-x-twitter
```

## Claude Code Configuration

Add to your `.claude/mcp.json` (or run `claude mcp add`):

```json
{
  "mcpServers": {
    "x-twitter": {
      "command": "npx",
      "args": ["-y", "@builderhub/mcp-x-twitter"],
      "env": {
        "X_API_KEY": "your_api_key",
        "X_API_SECRET": "your_api_secret",
        "X_ACCESS_TOKEN": "your_access_token",
        "X_ACCESS_SECRET": "your_access_secret"
      }
    }
  }
}
```

## Claude Desktop Configuration

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "x-twitter": {
      "command": "npx",
      "args": ["-y", "@builderhub/mcp-x-twitter"],
      "env": {
        "X_API_KEY": "your_api_key",
        "X_API_SECRET": "your_api_secret",
        "X_ACCESS_TOKEN": "your_access_token",
        "X_ACCESS_SECRET": "your_access_secret"
      }
    }
  }
}
```

## Available Tools

| Tool | Description | Tier Required |
|------|-------------|---------------|
| `post_tweet` | Post a tweet with optional media and reply support | Free |
| `delete_tweet` | Delete a tweet by ID | Free |
| `get_tweet` | Fetch a tweet with full details and expansions | Free |
| `search_tweets` | Search recent tweets (last 7 days) by query | Basic+ |
| `upload_media` | Upload image or video and get a media_id | Free |
| `like_tweet` | Like a tweet as the authenticated user | Free |
| `retweet` | Retweet a tweet as the authenticated user | Free |
| `get_mentions` | Retrieve recent mentions of the authenticated user | Free |

> **Note:** `search_tweets` requires Basic or Pro tier X API access — not available on the free tier.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `X_API_KEY` | Yes | Your X app API Key (Consumer Key) |
| `X_API_SECRET` | Yes | Your X app API Secret (Consumer Secret) |
| `X_ACCESS_TOKEN` | Yes | Access Token for the authenticated user |
| `X_ACCESS_SECRET` | Yes | Access Token Secret for the authenticated user |
| `X_BEARER_TOKEN` | No | Bearer Token (optional, for app-only auth) |

### How to Get X API Credentials

1. Go to [developer.twitter.com](https://developer.twitter.com/) and sign in
2. Create a new Project and App (or use an existing one)
3. Under your App settings, enable **Read and Write** permissions (required for posting)
4. Generate **API Key & Secret** under "Keys and tokens"
5. Generate **Access Token & Secret** (make sure they have Read+Write scope)
6. Copy all four values into your MCP config or `.env` file

## Development

```bash
# Clone the repo
git clone https://github.com/lmtNoLimit/mcp-x-twitter.git
cd mcp-x-twitter

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
# Fill in your credentials in .env

# Type check
npm run typecheck

# Build
npm run build

# Run locally
node dist/index.js
```

## License

MIT — see [LICENSE](LICENSE)
