import { validateEnv, env } from "./env";
import { createApp } from "./app";

// Validate environment variables before starting
validateEnv();

// Create the application
const app = createApp();

// Only start the server when running locally (not on Vercel)
// Vercel will use the default export
if (process.env.VERCEL !== "1") {
  app.listen(env.PORT);
  console.log(`🦊 Elysia server running at http://localhost:${env.PORT}`);
}

// Default export for Vercel serverless
export default app;
