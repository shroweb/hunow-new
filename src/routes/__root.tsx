import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { getSettings } from "../lib/settings.functions";
import { Toaster } from "../components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  loader: async () => {
    try {
      const settings = await getSettings();
      return { settings };
    } catch {
      return { settings: {} as Record<string, string> };
    }
  },
  head: ({ loaderData }) => {
    const s = loaderData?.settings ?? {};
    const siteName = s.site_name || "HU NOW";
    const tagline = s.site_tagline || "Hull's Independent City Guide";
    const desc =
      s.meta_description || "Events, places, stories and independent businesses across Hull.";
    const ogDesc =
      s.meta_description_og || "Find what's on, where to eat and what to explore in Hull.";
    const title = `${siteName} — ${tagline}`;
    return {
      meta: [
        { charSet: "utf-8" },
        {
          name: "viewport",
          content:
            "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover",
        },
        { name: "theme-color", content: "#0b0130" },
        { name: "theme-color", media: "(prefers-color-scheme: light)", content: "#0b0130" },
        { name: "application-name", content: siteName },
        { name: "mobile-web-app-capable", content: "yes" },
        { name: "apple-mobile-web-app-capable", content: "yes" },
        { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
        { name: "apple-mobile-web-app-title", content: siteName },
        { name: "msapplication-TileColor", content: "#0b0130" },
        { name: "msapplication-tap-highlight", content: "no" },
        { name: "format-detection", content: "telephone=no" },
        { title },
        { name: "description", content: desc },
        { name: "author", content: siteName },
        { property: "og:site_name", content: siteName },
        { property: "og:locale", content: "en_GB" },
        { property: "og:title", content: title },
        { property: "og:description", content: ogDesc },
        { property: "og:type", content: "website" },
        { property: "og:image", content: s.og_image || "/hunow.jpg" },
        { property: "og:image:alt", content: `${siteName} — ${tagline}` },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: ogDesc },
        { name: "twitter:image", content: s.og_image || "/hunow.jpg" },
        ...(s.social_twitter ? [{ name: "twitter:site", content: `@${s.social_twitter.replace(/^@/, "")}` }] : []),
        ...(s.gsc_verify ? [{ name: "google-site-verification", content: s.gsc_verify }] : []),
        ...(s.ga_id ? [{ "data-ga-id": s.ga_id }] : []),
      ],
      links: [
        { rel: "stylesheet", href: appCss },
        { rel: "manifest", href: "/manifest.json" },
        { rel: "icon", type: "image/png", sizes: "192x192", href: "/icon-192.png" },
        { rel: "icon", type: "image/png", sizes: "512x512", href: "/icon-512.png" },
        { rel: "apple-touch-icon", sizes: "192x192", href: "/icon-192.png" },
        {
          rel: "apple-touch-startup-image",
          href: "/splash-portrait.png",
          media: "(orientation: portrait)",
        },
        {
          rel: "apple-touch-startup-image",
          href: "/splash-landscape.png",
          media: "(orientation: landscape)",
        },
        {
          rel: "alternate",
          type: "application/rss+xml",
          title: `${siteName} — Articles`,
          href: "/feed.articles.rss",
        },
        {
          rel: "alternate",
          type: "application/rss+xml",
          title: `${siteName} — Events`,
          href: "/feed.events.rss",
        },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap",
        },
        ...(s.ga_id ? [{ rel: "preconnect", href: "https://www.googletagmanager.com" }] : []),
      ],
      scripts: [
        // Global Organisation + WebSite schema (entity & Sitelinks Search Box)
        {
          type: "application/ld+json",
          children: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              name: siteName,
              url: "https://hunow.co.uk",
              logo: "https://hunow.co.uk/hunow.jpg",
              description: desc,
              sameAs: [
                s.social_facebook,
                s.social_instagram ? `https://instagram.com/${s.social_instagram.replace(/^@/, "")}` : undefined,
                s.social_twitter ? `https://twitter.com/${s.social_twitter.replace(/^@/, "")}` : undefined,
                s.social_tiktok,
                s.social_youtube,
              ].filter(Boolean),
            },
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: siteName,
              url: "https://hunow.co.uk",
              potentialAction: {
                "@type": "SearchAction",
                target: { "@type": "EntryPoint", urlTemplate: "https://hunow.co.uk/search?q={search_term_string}" },
                "query-input": "required name=search_term_string",
              },
            },
          ]),
        },
        ...(s.ga_id
          ? [
              { src: `https://www.googletagmanager.com/gtag/js?id=${s.ga_id}`, async: true },
              {
                children: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${s.ga_id}');`,
              },
            ]
          : []),
      ],
    };
  },
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      const register = () => {
        void navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
      };
      if (document.readyState === "complete") {
        register();
      } else {
        window.addEventListener("load", register, { once: true });
        return () => window.removeEventListener("load", register);
      }
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <Toaster position="bottom-right" />
    </QueryClientProvider>
  );
}
