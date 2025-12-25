import { validateEnv, env } from "./env";
import { createApp } from "./app";

// Validate environment variables before starting
validateEnv();

// Create and start the application
const app = createApp().listen(env.PORT);

console.log(`🦊 Elysia server running at http://localhost:${app.server?.port}`);

// Export app for potential testing
export { app };
