import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const INSTALL_DISMISSED_KEY = "hunow:pwa-install-dismissed-at";
const INSTALL_SEEN_KEY = "hunow:pwa-install-seen-count";

function isStandaloneDisplay() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator &&
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

export function PwaEnhancements() {
  const [online, setOnline] = useState(true);
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    setOnline(navigator.onLine);
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      if (isStandaloneDisplay()) return;

      const dismissedAt = Number(localStorage.getItem(INSTALL_DISMISSED_KEY) || 0);
      const dismissedRecently = dismissedAt && Date.now() - dismissedAt < 1000 * 60 * 60 * 24 * 14;
      if (dismissedRecently) return;

      const seenCount = Number(localStorage.getItem(INSTALL_SEEN_KEY) || 0) + 1;
      localStorage.setItem(INSTALL_SEEN_KEY, String(seenCount));
      setInstallEvent(event as BeforeInstallPromptEvent);

      if (seenCount >= 2) {
        window.setTimeout(() => setShowInstall(true), 1200);
      }
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", () => setShowInstall(false));
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  }, []);

  const install = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === "dismissed") {
      localStorage.setItem(INSTALL_DISMISSED_KEY, String(Date.now()));
    }
    setInstallEvent(null);
    setShowInstall(false);
  };

  const dismissInstall = () => {
    localStorage.setItem(INSTALL_DISMISSED_KEY, String(Date.now()));
    setShowInstall(false);
  };

  return (
    <>
      {!online && (
        <div
          role="status"
          className="fixed left-3 right-3 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] md:bottom-4 z-[120] border-2 border-foreground bg-background px-4 py-3 shadow-lg md:left-auto md:right-4 md:w-[340px]"
        >
          <div className="text-[10px] font-mono uppercase tracking-widest text-accent mb-1">
            Offline mode
          </div>
          <p className="text-sm font-semibold">
            You can keep reading cached pages. Sign-in, saving, checkout and admin actions need a
            connection.
          </p>
        </div>
      )}

      {showInstall && installEvent && online && (
        <div className="fixed left-3 right-3 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] md:left-auto md:right-4 md:bottom-4 z-[120] border-2 border-foreground bg-background p-4 shadow-xl md:w-[360px]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-accent mb-1">
                Install HU NOW
              </div>
              <p className="text-sm text-muted-foreground">
                Add HU NOW to your home screen for quicker access and offline fallback.
              </p>
            </div>
            <button
              type="button"
              onClick={dismissInstall}
              className="text-xl leading-none text-muted-foreground hover:text-foreground"
              aria-label="Dismiss install prompt"
            >
              ×
            </button>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={install}
              className="bg-foreground text-background px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-accent"
            >
              Install app
            </button>
            <button
              type="button"
              onClick={dismissInstall}
              className="border-2 border-foreground px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-foreground hover:text-background"
            >
              Not now
            </button>
          </div>
        </div>
      )}
    </>
  );
}
