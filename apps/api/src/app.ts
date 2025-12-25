import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { rateLimit } from "elysia-rate-limit";
import { env } from "./env";
import { chatRoute } from "./routes/chat.routes";
import { photosRoute } from "./routes/photos.routes";


//Global error handler helper
//Extracts error info and returns appropriate response
function getErrorResponse(
  error: unknown,
  code: string | number
): { status: number; body: { error: string } } {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorName = error instanceof Error ? error.name : "UnknownError";

  // Handle Elysia validation errors
  if (code === "VALIDATION") {
    return { status: 400, body: { error: "Invalid request format" } };
  }

  // Handle not found errors
  if (code === "NOT_FOUND") {
    return { status: 404, body: { error: "Not found" } };
  }

  // Handle missing API key errors
  if (
    errorMessage.includes("API key") ||
    errorMessage.includes("OPENAI_API_KEY")
  ) {
    return { status: 500, body: { error: "Server configuration error" } };
  }

  // Handle Zod validation errors
  if (errorName === "ZodError" || errorMessage.includes("Expected")) {
    return { status: 400, body: { error: "Invalid request format" } };
  }

  // Handle OpenAI API errors
  if (errorMessage.includes("OpenAI") || errorMessage.includes("AI service")) {
    return { status: 502, body: { error: "AI service unavailable" } };
  }

  // Handle rate limiting
  if (errorMessage.includes("rate") || errorMessage.includes("429")) {
    return { status: 429, body: { error: "Too many requests" } };
  }

  // Default error response
  return { status: 500, body: { error: "Internal server error" } };
}

//Create and configure the Elysia application
export function createApp() {
  return (
    new Elysia()
      // Swagger/OpenAPI documentation
      .use(
        swagger({
          documentation: {
            info: {
              title: "HeyPico API",
              version: "1.0.0",
              description: "AI Place Finder API",
            },
            tags: [
              { name: "Chat", description: "Chat endpoints" },
              { name: "Photos", description: "Photo proxy endpoints" },
              { name: "Health", description: "Health check endpoints" },
            ],
          },
        })
      )
      // CORS configuration
      .use(
        cors({
          origin: env.FRONTEND_URL,
          methods: ["GET", "POST", "OPTIONS"],
        })
      )
      // Global rate limit: 100 requests per minute per IP
      .use(
        rateLimit({
          duration: 60000,
          max: 100,
          generator: (request, server) => {
            const forwardedFor = request.headers.get("X-Forwarded-For");
            if (forwardedFor) {
              return forwardedFor.split(",")[0].trim();
            }
            return server?.requestIP(request)?.address ?? "";
          },
          errorResponse: new Response(
            JSON.stringify({
              error: "Too many requests. Please try again later.",
            }),
            { status: 429, headers: { "Content-Type": "application/json" } }
          ),
        })
      )
      // Global error handler
      .onError(({ error, set, code }) => {
        const response = getErrorResponse(error, code);
        set.status = response.status;
        return response.body;
      })
      // Health check routes
      .get("/", () => "Welcome to HeyPico API")
      .get("/health", () => ({
        status: "ok",
        timestamp: new Date().toISOString(),
      }))
      // Mount route modules
      .use(chatRoute)
      .use(photosRoute)
  );
}

// Export app type for type inference
export type App = ReturnType<typeof createApp>;

// Default export for Vercel serverless
export default createApp();
