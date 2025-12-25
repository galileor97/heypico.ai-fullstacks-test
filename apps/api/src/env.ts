export const env = {
  // LLM Provider: "cloud" (OpenAI) or "local" (Ollama)
  LLM_PROVIDER: (process.env.LLM_PROVIDER || "cloud") as "cloud" | "local",
  
  // OpenAI Configuration
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_MODEL: process.env.OPENAI_MODEL || "gpt-4o-mini",
  
  // Ollama Configuration (for local LLM)
  OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
  OLLAMA_MODEL: process.env.OLLAMA_MODEL || "llama3.2",
  
  // Google Places
  GOOGLE_PLACES_API_KEY: process.env.GOOGLE_PLACES_API_KEY,
  
  // App Configuration
  API_BASE_URL: process.env.API_BASE_URL || "http://localhost:3001",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
  PORT: Number(process.env.PORT) || 3001,
  CHAT_RATE_LIMIT: Number(process.env.CHAT_RATE_LIMIT) || 10,
  GOOGLE_PLACES_RATE_LIMIT: Number(process.env.GOOGLE_PLACES_RATE_LIMIT) || 100,
  GOOGLE_PLACES_RATE_LIMIT_WINDOW: Number(process.env.GOOGLE_PLACES_RATE_LIMIT_WINDOW) || 60000,
};

export function validateEnv(): void {
  // Only require OpenAI API key when using cloud provider
  if (env.LLM_PROVIDER === "cloud" && !env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is required when using cloud provider");
  }
  
  if (!env.GOOGLE_PLACES_API_KEY) {
    throw new Error("GOOGLE_PLACES_API_KEY is required");
  }
  
  console.log(`[ENV] LLM Provider: ${env.LLM_PROVIDER}`);
  if (env.LLM_PROVIDER === "local") {
    console.log(`[ENV] Local LLM (Ollama): ${env.OLLAMA_BASE_URL}`);
    console.log(`[ENV] Model: ${env.OLLAMA_MODEL}`);
  } else {
    console.log(`[ENV] Cloud LLM (OpenAI)`);
    console.log(`[ENV] Model: ${env.OPENAI_MODEL}`);
  }
}
