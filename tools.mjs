import { z } from "zod";

export const sampleTool = [
  "sample_tool_name", // name of the tool
  "Sample tool description", // description of the tool
  {
    input: z.string().optional().describe("Input for the sample tool"), // tool schema
  },
  async ({ input }) => {
    // Sample tool logic
    try {
      const result = `Sample tool processed input: ${input}`;
      return {
        content: [{ type: "text", text: result }],
        success: true,
      };
    } catch (error) {
      return handleError(error);
    }
  },
];
