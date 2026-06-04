import { Link } from "@tanstack/react-router";

export interface Crumb {
  label: string;
  to?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="border-b border-foreground/10 bg-background/80">
      <ol className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto px-4 py-3 text-[10px] font-mono font-bold uppercase tracking-wide text-muted-foreground whitespace-nowrap">
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li key={i} className="flex min-w-0 items-center gap-2">
              {c.to && !last ? (
                <Link to={c.to} className="hover:text-accent">
                  {c.label}
                </Link>
              ) : (
                <span className={last ? "max-w-[48vw] truncate text-foreground" : ""}>
                  {c.label}
                </span>
              )}
              {!last && (
                <span aria-hidden="true" className="text-foreground/25">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
