import { useIsSaved, toggleSaved, type SavedKind } from "@/lib/bookmarks";

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
        toggleSaved({ kind, id, slug, title, subcategory });
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
