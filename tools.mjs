import { z } from "zod";
import crypto from "node:crypto";
import { handleError } from "./utility/index.mjs";

import {
  readFile,
  writeFile,
  deleteFile,
  listFilesIds,
} from "./utility/files.mjs";

export const leaveOff = [
  "leave_off", // name of the tool
  "Save context and instructions for another LLM to continue task.", // description of the tool
  {
    context: z.string().describe("Content to save"), // tool schema
  },
  async ({ context }) => {
    const trimmedContext = context.trim();
    if (!trimmedContext) {
      return {
        content: [{ type: "text", text: "No context provided" }],
        success: false,
      };
    }

    // Sample tool logic
    const id = [crypto.randomUUID().split("-")[0], new Date().toISOString()]
      .join("@")
      .replaceAll(":", "_");
    writeFile(id, trimmedContext);
    try {
      const text = `context saved under id: ${id}`;
      return {
        content: [{ type: "text", text }],
        success: true,
      };
    } catch (error) {
      return handleError(error);
    }
  },
];

export const continueFrom = [
  "pick_up", // name of the tool
  "Retrieves context and instructions left by another LLM in order to continue a task.", // description of the tool
  {
    id: z.string().describe("identifier"),
  },
  async ({ id }) => {
    const trimmedId = id.trim();
    if (!trimmedId) {
      return {
        content: [{ type: "text", text: "No id provided" }],
        success: false,
      };
    }
    // Sample tool logic
    try {
      const text = readFile(trimmedId);
      return {
        content: [{ type: "text", text }],
        success: true,
      };
    } catch (error) {
      return handleError(error);
    }
  },
];

export const removeItem = [
  "remove_item", // name of the tool
  "Remove previous contexts/instructions", // description of the tool
  {
    id: z.string().describe("identifier"), // tool schema
  },
  async ({ id }) => {
    const trimmedId = id.trim();
    if (!trimmedId) {
      return {
        content: [{ type: "text", text: "No id provided" }],
        success: false,
      };
    }
    // Sample tool logic
    try {
      deleteFile(trimmedId);
      return {
        content: [{ type: "text", text: `Context deleted ${trimmedId}` }],
        success: true,
      };
    } catch (error) {
      return handleError(error);
    }
  },
];

export const listItems = [
  "list_context_items", // name of the tool
  "List all saved contexts/instructions along with dates", // description of the tool
  {}, // no input schema
  async () => {
    try {
      const files = listFilesIds().map((file) => {
        const [_, date] = file.split("@");
        return [file, new Date(date.replaceAll("_", ":"))];
      });
      if (!files.length) {
        return {
          content: [
            {
              type: "text",
              text: `No saved contexts found.`,
            },
          ],
          success: true,
        };
      }
      // sort by date
      files.sort(([_, a], [__, b]) => {
        return b - a;
      });

      return {
        content: [
          {
            type: "text",
            text: `${files
              .map(
                ([file, date]) =>
                  `${file} (${date.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false,
                  })})`
              )
              .join("\n")}`,
          },
        ],
        success: true,
      };
    } catch (error) {
      return handleError(error);
    }
  },
];
