import http from "node:http";
import { URL } from "node:url";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.mjs";
import pack from "./package.json" with { type: "json" };
import { log } from "./utility.mjs";
import server from "./index.mjs";

// Store transports for each session type
const transports = {
  streamable: {},
  sse: {},
};

const httpServer = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  // Modern Streamable HTTP endpoint
  if (url.pathname === "/mcp") {
    // Handle Streamable HTTP transport for modern clients
    // Implementation as shown in the "With Session Management" example
    // ...
    return;
  }

  // Legacy SSE endpoint for older clients
  if (url.pathname === "/sse" && req.method === "GET") {
    // Create SSE transport for legacy clients
    const transport = new SSEServerTransport("/messages", res);
    transports.sse[transport.sessionId] = transport;

    req.on("close", () => {
      delete transports.sse[transport.sessionId];
    });

    await server.connect(transport);
    return;
  }

  // Legacy message endpoint for older clients
  if (url.pathname === "/messages" && req.method === "POST") {
    const sessionId = url.searchParams.get("sessionId");
    const transport = transports.sse[sessionId];

    if (transport) {
      await transport.handlePostMessage(req, res);
    } else {
      res.statusCode = 400;
      res.end("No transport found for sessionId");
    }
    return;
  }

  // Handle 404 for any other route
  res.statusCode = 404;
  res.end("Not found");
});

const port = pack.port || 8080;
httpServer.listen(port, () => {
  log(`Server running on port ${port}`);
});
