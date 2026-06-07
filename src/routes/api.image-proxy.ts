import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const ALLOWED_HOSTS = [
  "images.unsplash.com",
  "upload.wikimedia.org",
  "commons.wikimedia.org",
  "images.pexels.com",
];

export const Route = createFileRoute("/api/image-proxy")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { searchParams } = new URL(request.url);
        const raw = searchParams.get("url");

        if (!raw) {
          return new Response("Missing url", { status: 400 });
        }

        let target: URL;
        try {
          target = new URL(raw);
        } catch {
          return new Response("Invalid url", { status: 400 });
        }

        if (!ALLOWED_HOSTS.includes(target.hostname)) {
          return new Response("Host not allowed", { status: 403 });
        }

        const upstream = await fetch(target.toString(), {
          headers: { "User-Agent": "HuNow-Newsletter-Bot/1.0" },
        });

        if (!upstream.ok) {
          return new Response("Upstream error", { status: 502 });
        }

        const contentType = upstream.headers.get("content-type") ?? "image/jpeg";
        const body = await upstream.arrayBuffer();

        return new Response(body, {
          status: 200,
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=604800, immutable",
          },
        });
      },
    },
  },
});
