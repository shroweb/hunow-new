import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AdminHeader } from "@/components/admin/AdminLayout";

export const Route = createFileRoute("/admin/pwa")({
  component: AdminPwa,
});

type CheckStatus = "pass" | "warn" | "fail";

type PwaCheck = {
  label: string;
  detail: string;
  status: CheckStatus;
};

type ManifestIcon = {
  src?: string;
  sizes?: string;
  purpose?: string;
  type?: string;
};

type ManifestShape = {
  name?: string;
  short_name?: string;
  start_url?: string;
  scope?: string;
  display?: string;
  theme_color?: string;
  background_color?: string;
  icons?: ManifestIcon[];
};

function AdminPwa() {
  const [checks, setChecks] = useState<PwaCheck[]>([]);
  const [manifest, setManifest] = useState<ManifestShape | null>(null);
  const [swState, setSwState] = useState("Checking…");
  const [displayMode, setDisplayMode] = useState("Browser tab");

  useEffect(() => {
    let cancelled = false;

    async function runChecks() {
      const next: PwaCheck[] = [];

      const standalone = window.matchMedia("(display-mode: standalone)").matches;
      setDisplayMode(standalone ? "Standalone app" : "Browser tab");

      try {
        const manifestRes = await fetch("/manifest.json", { cache: "no-store" });
        const data = (await manifestRes.json()) as ManifestShape;
        if (cancelled) return;
        setManifest(data);

        next.push({
          label: "Manifest",
          status: manifestRes.ok ? "pass" : "fail",
          detail: manifestRes.ok ? "manifest.json is reachable" : "manifest.json did not load",
        });
        next.push({
          label: "Install display",
          status: data.display === "standalone" ? "pass" : "warn",
          detail: `Display mode is ${data.display || "missing"}`,
        });
        next.push({
          label: "Start URL",
          status: data.start_url ? "pass" : "fail",
          detail: data.start_url ? `Starts at ${data.start_url}` : "No start_url set",
        });
        next.push({
          label: "Theme colors",
          status: data.theme_color && data.background_color ? "pass" : "warn",
          detail:
            data.theme_color && data.background_color
              ? `${data.theme_color} / ${data.background_color}`
              : "Theme or background color missing",
        });

        const icons = data.icons ?? [];
        const has192 = icons.some((icon) => icon.sizes === "192x192");
        const has512 = icons.some((icon) => icon.sizes === "512x512");
        const hasMaskable = icons.some((icon) => icon.purpose?.includes("maskable"));
        next.push({
          label: "Icons",
          status: has192 && has512 && hasMaskable ? "pass" : "fail",
          detail: `${has192 ? "192" : "No 192"} / ${has512 ? "512" : "No 512"} / ${
            hasMaskable ? "maskable" : "not maskable"
          }`,
        });

        for (const icon of icons) {
          if (!icon.src) continue;
          const iconRes = await fetch(icon.src, { method: "HEAD", cache: "no-store" });
          next.push({
            label: icon.sizes ? `Icon ${icon.sizes}` : "Icon",
            status: iconRes.ok ? "pass" : "fail",
            detail: `${icon.src} ${iconRes.ok ? "loads" : "missing"}`,
          });
        }
      } catch (err) {
        next.push({
          label: "Manifest",
          status: "fail",
          detail: err instanceof Error ? err.message : String(err),
        });
      }

      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.getRegistration("/");
        const controller = navigator.serviceWorker.controller;
        setSwState(
          registration
            ? `${registration.active?.state ?? registration.installing?.state ?? "registered"}${
                controller ? " and controlling this page" : ""
              }`
            : "Not registered yet",
        );
        next.push({
          label: "Service worker",
          status: registration ? "pass" : "warn",
          detail: registration ? "Registered at /sw.js" : "Not registered for this tab yet",
        });
      } else {
        setSwState("Unsupported");
        next.push({
          label: "Service worker",
          status: "fail",
          detail: "This browser does not support service workers",
        });
      }

      next.push({
        label: "Offline fallback",
        status: "pass",
        detail: "/offline.html is precached and used for failed navigations",
      });

      next.push({
        label: "Push support",
        status: "Notification" in window && "PushManager" in window ? "pass" : "warn",
        detail:
          "Notification" in window && "PushManager" in window
            ? `Browser permission is ${Notification.permission}`
            : "Push is not available in this browser",
      });

      if (!cancelled) setChecks(next);
    }

    void runChecks();
    return () => {
      cancelled = true;
    };
  }, []);

  const summary = useMemo(() => {
    const pass = checks.filter((check) => check.status === "pass").length;
    const warn = checks.filter((check) => check.status === "warn").length;
    const fail = checks.filter((check) => check.status === "fail").length;
    return { pass, warn, fail };
  }, [checks]);

  return (
    <div>
      <AdminHeader
        title="PWA"
        subtitle="Installability, offline fallback, cache and push readiness"
      />
      <div className="p-6 md:p-10 space-y-8">
        <div className="grid gap-4 md:grid-cols-4">
          <Metric label="Passed" value={summary.pass} tone="pass" />
          <Metric label="Warnings" value={summary.warn} tone="warn" />
          <Metric label="Failures" value={summary.fail} tone="fail" />
          <Metric label="Display" value={displayMode} />
        </div>

        <section className="border-2 border-foreground bg-white">
          <div className="border-b-2 border-foreground px-5 py-4">
            <h2 className="font-display text-3xl uppercase leading-none">Runtime Health</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Service worker: <span className="font-mono">{swState}</span>
            </p>
          </div>
          <div className="divide-y divide-border">
            {checks.map((check) => (
              <div
                key={`${check.label}-${check.detail}`}
                className="grid gap-2 p-5 md:grid-cols-12"
              >
                <div className="md:col-span-3">
                  <StatusBadge status={check.status} />
                </div>
                <div className="md:col-span-3 font-bold uppercase tracking-wide text-sm">
                  {check.label}
                </div>
                <div className="md:col-span-6 text-sm text-muted-foreground">{check.detail}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="border border-border p-5 bg-white">
            <h2 className="font-bold uppercase tracking-wide text-sm mb-4">Manifest Snapshot</h2>
            <dl className="grid gap-3 text-sm">
              <Row label="Name" value={manifest?.name ?? "Unknown"} />
              <Row label="Short name" value={manifest?.short_name ?? "Unknown"} />
              <Row label="Start URL" value={manifest?.start_url ?? "Unknown"} />
              <Row label="Scope" value={manifest?.scope ?? "Unknown"} />
              <Row label="Display" value={manifest?.display ?? "Unknown"} />
            </dl>
          </div>
          <div className="border border-border p-5 bg-white">
            <h2 className="font-bold uppercase tracking-wide text-sm mb-4">Launch Checklist</h2>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>Run `npm run pwa:audit` before every production deploy.</li>
              <li>Test Add to Home Screen on iOS Safari and Android Chrome.</li>
              <li>
                Open the site offline after one online visit and confirm the fallback appears.
              </li>
              <li>Send a push test to each segment after VAPID keys are set in production.</li>
              <li>Run Lighthouse against the live Vercel URL and resolve any PWA failures.</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone?: CheckStatus;
}) {
  const toneClass =
    tone === "pass"
      ? "text-green-700"
      : tone === "warn"
        ? "text-accent"
        : tone === "fail"
          ? "text-red-700"
          : "";
  return (
    <div className="border-2 border-foreground bg-white p-5">
      <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
        {label}
      </div>
      <div className={`font-display text-4xl uppercase leading-none ${toneClass}`}>{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: CheckStatus }) {
  const label = status === "pass" ? "Pass" : status === "warn" ? "Warning" : "Fail";
  const className =
    status === "pass"
      ? "bg-green-700 text-white"
      : status === "warn"
        ? "bg-accent text-foreground"
        : "bg-red-700 text-white";
  return (
    <span
      className={`inline-flex px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${className}`}
    >
      {label}
    </span>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border pb-2">
      <dt className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </dt>
      <dd className="font-bold text-right">{value}</dd>
    </div>
  );
}
