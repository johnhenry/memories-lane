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
  "Save current context and instructions to a persistent storage for another LLM to continue the task later. Creates a unique ID that can be used to retrieve this context.", // description of the tool
  {
    context: z
      .string()
      .describe(
        "Content to save - can include working context, instructions, and current progress"
      ), // tool schema
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
  "Retrieves previously saved context and instructions using a unique identifier. Allows an LLM to resume work on a task where another left off.", // description of the tool
  {
    id: z
      .string()
      .describe(
        "Unique identifier for the saved context (format: uuid@timestamp)"
      ),
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
  "remove_context_item", // name of the tool
  "Permanently removes a previously saved context/instruction set from storage based on its unique identifier.", // description of the tool
  {
    id: z
      .string()
      .describe(
        "Unique identifier for the context to be deleted (format: uuid@timestamp)"
      ), // tool schema
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
  "Lists all saved context/instruction items in chronological order with their unique identifiers and timestamps. Helps manage and locate previously saved work.", // description of the tool
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

/* Finds latest context item and loads it
 * combination of list_context_items and pick_up
 */

export const loadLatest = [
  "load_latest_context_item", // name of the tool
  "Retrieves the most recent saved context/instruction set using its unique identifier. Allows an LLM to resume work on a task where another left off.", // description of the tool
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
      const latest = files[0][0];
      const text = readFile(latest);
      return {
        content: [{ type: "text", text }],
        success: true,
      };
    } catch (error) {
      return handleError(error);
    }
  },
];
