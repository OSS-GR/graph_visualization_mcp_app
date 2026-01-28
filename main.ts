/**
 * Entry point for running the Graph Visualization MCP App server.
 * Uses stdio transport which Claude Desktop expects.
 */

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server.js";

async function main() {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Graph Visualization MCP App server running on stdio");
}

main().catch((e) => {
  console.error("Failed to start server:", e);
  process.exit(1);
});
