#!/usr/bin/env node
import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createClient } from "./client.js";
import { registerAllTools } from "./tools/index.js";
import { createLogger } from "./utils/logger.js";

const logger = createLogger("x-twitter");

const main = async () => {
  const server = new McpServer({
    name: "mcp-x-twitter",
    version: "1.0.0",
  });
  const client = createClient();
  registerAllTools(server, client);
  const transport = new StdioServerTransport();
  await server.connect(transport);
  logger.info("MCP X/Twitter server running on stdio");
};

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
