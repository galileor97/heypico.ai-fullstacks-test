export const env = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  GOOGLE_PLACES_API_KEY: process.env.GOOGLE_PLACES_API_KEY,
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
  PORT: Number(process.env.PORT) || 3001,
  CHAT_RATE_LIMIT: Number(process.env.CHAT_RATE_LIMIT) || 10,
  GOOGLE_PLACES_RATE_LIMIT: Number(process.env.GOOGLE_PLACES_RATE_LIMIT) || 100,
  GOOGLE_PLACES_RATE_LIMIT_WINDOW: Number(process.env.GOOGLE_PLACES_RATE_LIMIT_WINDOW) || 60000,
};

export function validateEnv(): void {
  if (!env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is required");
  }
  if (!env.GOOGLE_PLACES_API_KEY) {
    throw new Error("GOOGLE_PLACES_API_KEY is required");
  }
}
