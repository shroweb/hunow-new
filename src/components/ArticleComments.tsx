import { useState, useEffect, type FormEvent } from "react";
import { getComments, submitComment } from "@/lib/comments.functions";
import type { ArticleComment } from "@/lib/db.server";

export function ArticleComments({ articleId }: { articleId: string }) {
  const [comments, setComments] = useState<ArticleComment[]>([]);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getComments({ data: { articleId } })
      .then(setComments)
      .catch(() => {});
  }, [articleId]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setSending(true);
    setError("");
    try {
      await submitComment({
        data: {
          articleId,
          authorName: String(fd.get("authorName")),
          authorEmail: String(fd.get("authorEmail")),
          body: String(fd.get("body")),
        },
      });
      (e.target as HTMLFormElement).reset();
      setDone(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const fieldCls = "w-full border-2 border-foreground px-4 py-3 font-mono text-sm focus:outline-none focus:border-accent bg-transparent";

  return (
    <section className="mt-16 pt-10 border-t-2 border-foreground">
      <h2 className="font-display text-3xl uppercase mb-8">
        {comments.length > 0 ? `${comments.length} Comment${comments.length !== 1 ? "s" : ""}` : "Leave a comment"}
      </h2>

      {comments.length > 0 && (
        <div className="space-y-6 mb-12">
          {comments.map((c) => (
            <div key={c.id} className="border-l-4 border-foreground/20 pl-5">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="font-bold text-sm">{c.authorName}</span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {new Date(c.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-foreground/80">{c.body}</p>
            </div>
          ))}
        </div>
      )}

      {done ? (
        <div className="border-2 border-foreground p-6">
          <p className="font-bold">Thanks — your comment is awaiting moderation.</p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4 max-w-xl">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-[10px] uppercase mb-1">Name</label>
              <input name="authorName" required placeholder="Your name" className={fieldCls} />
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase mb-1">Email <span className="text-muted-foreground">(not published)</span></label>
              <input name="authorEmail" type="email" required placeholder="you@example.com" className={fieldCls} />
            </div>
          </div>
          <div>
            <label className="block font-mono text-[10px] uppercase mb-1">Comment</label>
            <textarea name="body" required minLength={3} rows={5} placeholder="Share your thoughts..." className={fieldCls} />
          </div>
          {error && <p className="text-sm text-red-600 font-bold">{error}</p>}
          <button
            disabled={sending}
            className="bg-foreground text-background px-8 py-3 font-bold uppercase tracking-widest text-xs hover:bg-accent transition-colors disabled:opacity-50"
          >
            {sending ? "Posting…" : "Post comment"}
          </button>
        </form>
      )}
    </section>
  );
}
