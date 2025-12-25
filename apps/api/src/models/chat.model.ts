import { z } from "zod";

// Schema for individual chat messages
export const MessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1, { message: "Message content cannot be empty" }),
});

// Schema for chat request body
export const ChatRequestSchema = z.object({
  messages: z.array(MessageSchema).min(1, { message: "At least one message is required" }),
});

// Schema for the showPlaces tool parameters
export const ShowPlacesParamsSchema = z.object({
  query: z
    .string()
    .min(1)
    .describe(
      "Search query for places (e.g., 'nasi goreng restaurant in Bintaro Jakarta')"
    ),
  count: z
    .number()
    .min(1)
    .max(5)
    .default(5)
    .describe("Number of places to return (1-5)"),
});

// Export inferred types from Zod schemas
export type ChatMessage = z.infer<typeof MessageSchema>;
export type ChatRequest = z.infer<typeof ChatRequestSchema>;
export type ShowPlacesParams = z.infer<typeof ShowPlacesParamsSchema>;
