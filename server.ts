import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { join } from "path";
import { readFile } from "fs/promises";

const PORT = parseInt(process.env.PORT || "8000");
const app = new Hono();

// Serve static files from dist directory
app.use("/*", serveStatic({ root: "./dist" }));

// SPA fallback - serve index.html for all routes
app.get("*", async (c) => {
  try {
    const indexPath = join(process.cwd(), "dist", "index.html");
    const indexFile = await readFile(indexPath);
    
    return new Response(indexFile, {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Error serving index.html:", error);
    return new Response("Application not built. Please run 'npm run build' first.", {
      status: 500,
      headers: { "content-type": "text/plain" },
    });
  }
});

console.log(`Server starting on port ${PORT}`);
serve(app, { port: PORT });
