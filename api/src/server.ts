import Fastify from "fastify";
import { rssRoutes } from "./routes/rss.routes.js";

// Create the Fastify instance with logger enabled
const app = Fastify({
  logger: true,
});

// Health check endpoint — verifies the API is running
app.get("/api/health", async (_request, _reply) => {
  return { status: "ok", timestamp: new Date().toISOString() };
});

// Register route modules
await app.register(rssRoutes);

// Start the server
const start = async (): Promise<void> => {
  try {
    await app.listen({ port: 3000, host: "0.0.0.0" });
    app.log.info("Server is running on http://localhost:3000");
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

start();