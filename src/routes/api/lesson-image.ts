import { createFileRoute } from "@tanstack/react-router";

// Generates ONE illustration for a scene. Non-streaming, returns base64 PNG.
// Kept small + fast so the client can fan-out 3-4 calls in parallel for a
// story.
export const Route = createFileRoute("/api/lesson-image")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { prompt } = (await request.json()) as { prompt?: string };
          if (!prompt || typeof prompt !== "string" || prompt.length < 3) {
            return new Response(JSON.stringify({ error: "Missing prompt" }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }
          const key = process.env.LOVABLE_API_KEY;
          if (!key) {
            return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            });
          }

          const upstream = await fetch(
            "https://ai.gateway.lovable.dev/v1/images/generations",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${key}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "openai/gpt-image-1-mini",
                prompt: `Educational illustration, clean modern art style, vivid colors, clear focal subject, no text overlay. ${prompt}`,
                size: "1024x1024",
                quality: "low",
                n: 1,
              }),
            }
          );

          if (!upstream.ok) {
            const t = await upstream.text();
            return new Response(JSON.stringify({ error: t.slice(0, 500) }), {
              status: upstream.status,
              headers: { "Content-Type": "application/json" },
            });
          }

          const data = (await upstream.json()) as {
            data?: { b64_json?: string }[];
          };
          const b64 = data.data?.[0]?.b64_json;
          if (!b64) {
            return new Response(JSON.stringify({ error: "No image returned" }), {
              status: 502,
              headers: { "Content-Type": "application/json" },
            });
          }
          return new Response(JSON.stringify({ b64 }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (e) {
          return new Response(
            JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
      },
    },
  },
});
