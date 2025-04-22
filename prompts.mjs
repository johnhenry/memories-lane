import { z } from "zod";

export const samplePrompt = [
  "echo",
  { message: z.string().optional() },
  ({ message = "" } = {}) => ({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `Please process this message: ${message}`,
        },
      },
    ],
  }),
];
