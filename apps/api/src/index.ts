import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";

// Create the main Elysia app
const app = new Elysia()
  .use(cors())
  .get("/", () => ({
    message: "Welcome to HeyPico API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  }))
  .get("/health", () => ({
    status: "healthy",
    uptime: process.uptime(),
  }))
  .listen(3001);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

export type App = typeof app;
