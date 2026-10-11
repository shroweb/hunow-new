export function PaginationControls({
  page,
  totalPages,
  onPrev,
  onNext,
  total,
  perPage,
}: {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  total: number;
  perPage: number;
}) {
  if (totalPages <= 1) return null;
  const start = (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, total);
  // After changing page, bring the top of the list back into view
  const toListTop = (e: React.MouseEvent<HTMLButtonElement>) => {
    const section = e.currentTarget.closest("section");
    if (!section) return;
    const top = section.getBoundingClientRect().top + window.scrollY - 140;
    window.scrollTo({ top: Math.max(0, top) });
  };
  return (
    <div className="flex items-center justify-between gap-4 mt-12 pt-8 border-t border-border">
      <span className="text-[11px] font-mono uppercase text-muted-foreground">
        {start}–{end} of {total}
      </span>
      <div className="flex gap-2">
        <button
          onClick={(e) => {
            onPrev();
            toListTop(e);
          }}
          aria-label="Previous page"
          disabled={page <= 1}
          className="px-4 py-3 border-2 border-foreground text-[11px] font-bold uppercase tracking-widest hover:bg-foreground hover:text-background transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ← Prev
        </button>
        <span className="px-4 py-3 border-2 border-foreground/20 text-[11px] font-mono">
          {page} / {totalPages}
        </span>
        <button
          onClick={(e) => {
            onNext();
            toListTop(e);
          }}
          aria-label="Next page"
          disabled={page >= totalPages}
          className="px-4 py-3 border-2 border-foreground text-[11px] font-bold uppercase tracking-widest hover:bg-foreground hover:text-background transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
