import { Hono } from "hono";
import { serveStatic } from "hono/deno";

const PORT = parseInt(Deno.env.get("PORT") || "8000");
const app = new Hono();

// Serve static files from dist directory
app.use("/*", serveStatic({ root: "./dist" }));

// SPA fallback - serve index.html for all routes
app.get("*", async (c) => {
  try {
    const indexPath = "./dist/index.html";
    const indexFile = await Deno.readTextFile(indexPath);
    
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
Deno.serve({ port: PORT }, app.fetch);
