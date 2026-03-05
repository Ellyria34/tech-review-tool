import Fastify from "fastify";
import helmet from "@fastify/helmet";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import { rssRoutes } from "./routes/rss.routes.js";
import { aiRoutes } from "./routes/ai.routes.js";

// Create the Fastify instance with logger enabled
const app = Fastify({
  logger: true,
});

// --- Security plugins (registered BEFORE routes) ---

// HTTP security headers (X-Content-Type-Options, X-Frame-Options, CSP, HSTS...)
await app.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
    },
  },
});

// CORS — restrict which origins can call the API
await app.register(cors, {
  origin: process.env["CORS_ORIGIN"] ?? "http://localhost:4200",
  methods: ["GET", "POST"],
});

// Rate limiting — protect against abuse (especially AI endpoint)
await app.register(rateLimit, {
  max: 100,
  timeWindow: "1 minute",
  allowList: ["127.0.0.1"],
});

// --- Routes ---

// Health check endpoint — verifies the API is running
app.get("/api/health", async (_request, _reply) => {
  return { status: "ok", timestamp: new Date().toISOString() };
});

// Register route modules
await app.register(rssRoutes);
await app.register(aiRoutes);

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