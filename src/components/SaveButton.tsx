import { toast } from "sonner";
import { useIsSaved, toggleSaved, type SavedKind } from "@/lib/bookmarks";
import { getCurrentUser } from "@/lib/auth.functions";

// Cached one-time check — avoids a server round-trip on every save
let loggedInCache: boolean | null = null;
async function checkLoggedIn() {
  if (loggedInCache !== null) return loggedInCache;
  try {
    const user = await getCurrentUser();
    loggedInCache = Boolean(user);
  } catch {
    loggedInCache = false;
  }
  return loggedInCache;
}

export function SaveButton({
  kind,
  id,
  slug,
  title,
  subcategory,
  className,
}: {
  kind: SavedKind;
  id: string;
  slug: string;
  title: string;
  subcategory?: string;
  className?: string;
}) {
  const saved = useIsSaved(kind, id);
  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `Remove ${title} from saved` : `Save ${title}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const adding = !saved;
        toggleSaved({ kind, id, slug, title, subcategory });
        if (adding) {
          void checkLoggedIn().then((isLoggedIn) => {
            if (!isLoggedIn) {
              toast("Saved to this device", {
                description: "Sign in to sync your saves across devices.",
                action: {
                  label: "Sign in",
                  onClick: () => {
                    window.location.href = "/sign-in?redirect=/saved";
                  },
                },
                duration: 5000,
              });
            }
          });
        }
      }}
      className={
        className ??
        `px-5 py-3 border-2 border-foreground text-xs font-bold uppercase tracking-widest transition-colors ${
          saved
            ? "bg-accent text-background border-accent"
            : "hover:bg-foreground hover:text-background"
        }`
      }
    >
      {saved ? "★ Saved" : "☆ Save"}
    </button>
  );
}
