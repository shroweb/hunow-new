/** Placeholder cards shown while a list is loading, so the page keeps its shape */
export function CardGridSkeleton({ count = 6, label }: { count?: number; label: string }) {
  return (
    <div
      role="status"
      aria-label={label}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12"
    >
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[4/3] bg-foreground/10" />
          <div className="mt-4 h-3 w-24 bg-foreground/10" />
          <div className="mt-3 h-6 w-11/12 bg-foreground/15" />
          <div className="mt-2 h-6 w-2/3 bg-foreground/15" />
          <div className="mt-4 h-3 w-1/2 bg-foreground/10" />
        </div>
      ))}
      <span className="sr-only">{label}</span>
    </div>
  );
}
