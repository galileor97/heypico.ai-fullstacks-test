import { Elysia, t } from "elysia";
import { rateLimit } from "elysia-rate-limit";
import { streamText, tool } from "ai";
import { openai } from "@ai-sdk/openai";
import { createOllama } from "ollama-ai-provider";
import { env } from "../env";
import { ChatRequestSchema, ShowPlacesParamsSchema } from "../models";
import { searchPlaces } from "../services/places.service";

// Dynamic model selection based on LLM_PROVIDER env
function getModel() {
  if (env.LLM_PROVIDER === "local") {
    const ollamaProvider = createOllama({
      baseURL: `${env.OLLAMA_BASE_URL}/api`,
    });
    return ollamaProvider(env.OLLAMA_MODEL);
  }
  return openai(env.OPENAI_MODEL);
}



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
1. Format each place with numbers and spacing like this:

   1. **Place Name**
   Brief description here.

   2. **Place Name**
   Brief description here.

   (Number, name in bold, description on next line, blank line before next item)
2. Call showPlaces tool with a SINGLE search query
3. Do NOT include addresses, images, or photo URLs - the cards show those
4. Keep descriptions short (one sentence)

For follow-up questions and general conversation:
- Just answer naturally without calling any tool
- Reference the places you already showed if relevant
- Be helpful and conversational

When using showPlaces:
- Use ONE general search query like "nasi goreng restaurants in Bintaro Jakarta"
- The tool will return multiple results automatically
- Set count to ${env.PLACES_MAX_COUNT} for best results`;

// Chat route controller with rate limiting
export const chatRoute = new Elysia({ prefix: "/chat" })
  .use(
    rateLimit({
      duration: 60000,
      max: env.CHAT_RATE_LIMIT,
      scoping: "scoped",
      generator: (request, server) => {
        const forwardedFor = request.headers.get("X-Forwarded-For");
        if (forwardedFor) {
          return forwardedFor.split(",")[0].trim();
        }
        return server?.requestIP(request)?.address ?? "";
      },
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
    async ({ body, headers }) => {
      // Validate request body with Zod
      const { messages } = ChatRequestSchema.parse(body);

      // Parse user location from header
      let userLocation: { lat: number; lng: number } | undefined;
      const locationHeader = headers["x-user-location"];
      if (locationHeader) {
        const [lat, lng] = locationHeader.split(",").map(Number);
        if (!isNaN(lat) && !isNaN(lng)) {
          userLocation = { lat, lng };
          console.log("[ChatRoute] User location:", userLocation);
        }
      }

      const result = streamText({
        model: getModel(),
        maxSteps: 5,
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
                count,
                "location:",
                userLocation
              );

              const places = await searchPlaces(query, count, userLocation);
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

