import { Elysia, t } from "elysia";
import { rateLimit } from "elysia-rate-limit";
import { streamText, tool } from "ai";
import { openai } from "@ai-sdk/openai";
import { env } from "../env";
import { ChatRequestSchema, ShowPlacesParamsSchema } from "../models";
import { searchPlaces } from "../services/places.service";


// System prompt for the AI assistant
const SYSTEM_PROMPT = `You are a helpful assistant that helps users find places to go, eat, and visit.

WHEN TO USE showPlaces TOOL:
- ONLY when user explicitly asks for place recommendations (e.g., "find me restaurants", "where can I eat", "best coffee shops")
- DO NOT use the tool for follow-up questions or general conversation

WHEN NOT TO USE showPlaces TOOL:
- Follow-up questions like "is it expensive?", "what about parking?", "is it good?"
- General questions about places already shown
- Clarifying questions
- Any question that doesn't ask for NEW place recommendations

For place recommendations:
1. Write ONE short friendly sentence
2. Call showPlaces tool with a SINGLE search query
3. DO NOT list place names in your text

For follow-up questions and general conversation:
- Just answer naturally without calling any tool
- Reference the places you already showed if relevant
- Be helpful and conversational

When using showPlaces:
- Use ONE general search query like "nasi goreng restaurants in Bintaro Jakarta"
- The tool will return multiple results automatically
- Set count to 5 for best results`;

// Chat route controller with rate limiting
export const chatRoute = new Elysia({ prefix: "/chat" })
  .use(
    rateLimit({
      duration: 60000,
      max: env.CHAT_RATE_LIMIT,
      scoping: "scoped",
      errorResponse: new Response(
        JSON.stringify({
          error:
            "Chat rate limit exceeded. Please wait before sending more messages.",
        }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      ),
    })
  )
  .post(
    "/",
    async ({ body }) => {
      // Validate request body with Zod
      const { messages } = ChatRequestSchema.parse(body);

      const result = streamText({
        model: openai("gpt-4o-mini"),
        maxSteps: 3,
        system: SYSTEM_PROMPT,
        messages,
        tools: {
          showPlaces: tool({
            description:
              "Search and show places in a carousel. Use a general search query like 'nasi goreng restaurants in Bintaro'. ONLY use when user asks for NEW place recommendations.",
            parameters: ShowPlacesParamsSchema,
            execute: async ({ query, count = 5 }) => {
              console.log(
                "[ChatRoute] showPlaces called:",
                query,
                "count:",
                count
              );

              const places = await searchPlaces(query, count);
              console.log(
                "[ChatRoute] showPlaces found",
                places.length,
                "places"
              );

              if (places.length === 0) {
                return {
                  error:
                    "Could not find any places. Please try a different search.",
                  query,
                };
              }

              return { places };
            },
          }),
        },
      });

      return result.toDataStreamResponse();
    },
    {
      body: t.Object({
        messages: t.Array(
          t.Object({
            role: t.Union([t.Literal("user"), t.Literal("assistant")]),
            content: t.String(),
          })
        ),
      }),
      detail: {
        tags: ["Chat"],
        summary: "Send a chat message",
        description:
          "Send a message to the AI assistant. Returns a streaming response with AI-generated text and optional place recommendations.",
      },
    }
  );

