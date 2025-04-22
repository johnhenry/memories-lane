#!/usr/bin/env node
import {
  McpServer,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import pack from "./package.json" with { type: "json" };
import { log } from "./utility.mjs";

// Create an MCP server with more detailed information
const server = new McpServer({
  name: pack.name,
  version: pack.version,
  description: pack.description,
});

// Error handling utility
const handleError = (error) => {
  const message = error instanceof Error 
    ? error.message
    : String(error);
  
  log('Error:', message);

  return {
    content:[{ type: "text", text: `Error: ${message}`}],
    error: message,
    success: false
  }
};


import * as tools from "./tools.mjs";
Object.values(tools).forEach(([name, description, inputSchema, handler]) => {
  server.tool(
    name,
    description,
    inputSchema,
    async (input) => {
      log('Tool:', name, 'Input:', input);
      try {
        const result = await handler(input);
        log('Tool:', name, 'Result:', result);
        return result;
      } catch (error) {
        return handleError(error);
      }
    }
  );
});
import * as resources from "./resources.mjs";
Object.values(resources).forEach(([name, description, inputSchema, handler]) => {
  server.resource(
    name,
    description,
    inputSchema,
    async (input) => {
      log('Resource:', name, 'Input:', input);
      try {
        const result = await handler(input);
        log('Resource:', name, 'Result:', result);
        return result;
      } catch (error) {
        return handleError(error);
      }
    }
  );
});
import * as prompts from "./prompts.mjs";
Object.values(prompts).forEach(([name, description, inputSchema, handler]) => {
  server.prompt(
    name,
    description,
    inputSchema,
    async (input) => {
      log('Prompt:', name, 'Input:', input);
      try {
        const result = await handler(input);
        log('Prompt:', name, 'Result:', result);
        return result;
      } catch (error) {
        return handleError(error);
      }
    }
  );
});


export default server;
