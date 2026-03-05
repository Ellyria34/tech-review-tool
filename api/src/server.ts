import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import { existsSync } from "node:fs";
import Fastify from "fastify";
import helmet from "@fastify/helmet";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import fastifyStatic from "@fastify/static";
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
      scriptSrcAttr: ["'unsafe-inline'"],
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

// --- API Routes ---

// Health check endpoint — verifies the API is running
app.get("/api/health", async (_request, _reply) => {
  return { status: "ok", timestamp: new Date().toISOString() };
});

// Register route modules
await app.register(rssRoutes);
await app.register(aiRoutes);

// --- Static file serving (production only) ---
// In production, Fastify serves the Angular build output (dist/).
// In development, Angular is served by ng serve (port 4200) with a proxy.

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const clientDistPath = join(__dirname, "../../client/dist/tech-review-tool/browser");

if (existsSync(clientDistPath)) {
  // Serve static files (JS, CSS, images) from the Angular build
  await app.register(fastifyStatic, {
    root: clientDistPath,
    prefix: "/",
    wildcard: false,
  });

  // SPA fallback — all non-API routes return index.html
  // Angular handles client-side routing (e.g., /projects, /settings)
  app.setNotFoundHandler(async (request, reply) => {
    if (request.url.startsWith("/api/")) {
      return reply.status(404).send({ error: "API route not found" });
    }
    return reply.sendFile("index.html");
  });

  app.log.info(`Serving Angular from ${clientDistPath}`);
} else {
  app.log.info("No Angular build found — API-only mode (use ng serve for frontend)");
}

// Start the server
const port = Number(process.env["PORT"] ?? 3000);

const start = async (): Promise<void> => {
  try {
    await app.listen({ port, host: "0.0.0.0" });
    app.log.info(`Server is running on http://localhost:${port}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

start();