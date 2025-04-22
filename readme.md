# Continue MCP

An MCP server that facilitates sharing context between conversations.

## Features

- Tools for staving and loading contexts
- Prompts for calling the tools

## Tools

### Leave Off

The `leave_off` tool stores context and returns an id to access it later.

### Pick Up

The `pick_up` tool retrieves context using the id returned by `leave_off`.

## Prompts

Many MCP clients allow you to use prompts to customize the conversation.

In Claude Desktop, click the "Attach to MCP" button, and select a prompt from the "Choose an integraton" menu.

### 💾 Save"

The save prompt crafts a message telling the LLM to summarize the conversation and use the `leave_off` tool to store it.

It takes the following optional parameters:

- projectType: the type of project (general, technical, creative, problem-solving)
- includeMermaid: whether to include mermaid diagrams (default: no)
- includeCode: whether to include code (default: no)
- includeTasks: whether to include tasks (default: no)

### 📂 Continue

The Continue prompt crafts a message telling the LLM to load the context of the conversation using the `pick_up` tool.

It takes the following required parameters:

- id: the id returned by the `leave_off` tool

## Installation

### Prerequisites

### Installation

```json
{
  "mcpServers": {
    ...
    "vimble-mcp": {
      "command": "npx",
      "args": [
        "-y",
        "continue-mcp",
        "<path to context storage>"
      ],
    }
  }
}
```

Or you can install it locally for development:

```json
{
  "mcpServers": {
    ...
    "vimble-mcp": {
      "command": "<path to node>",
      "args": [
        "<this directory>/stdio.mjs",
        "<path to context storage>",
      ],
    }
  }
}
```
