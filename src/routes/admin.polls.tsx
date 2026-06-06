import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import {
  AdminHeader,
  AdminTable,
  adminBtn,
  adminBtnOutline,
  adminInput,
} from "@/components/admin/AdminLayout";
import {
  getAdminPolls,
  createAdminPoll,
  closeAdminPoll,
  deleteAdminPoll,
} from "@/lib/polls.functions";
import type { PollRow } from "@/lib/db.server";

export const Route = createFileRoute("/admin/polls")({
  loader: async () => ({ polls: await getAdminPolls() }),
  component: AdminPolls,
});

function AdminPolls() {
  const { polls: initial } = Route.useLoaderData();
  const [polls, setPolls] = useState<(PollRow & { votedOptionId?: string | null })[]>(initial);
  const [creating, setCreating] = useState(false);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [saving, setSaving] = useState(false);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    const filled = options.filter((o) => o.trim());
    if (filled.length < 2 || !question.trim()) return;
    setSaving(true);
    try {
      await createAdminPoll({ data: { question: question.trim(), options: filled } });
      const updated = await getAdminPolls();
      setPolls(updated);
      setCreating(false);
      setQuestion("");
      setOptions(["", ""]);
    } finally {
      setSaving(false);
    }
  }

  async function handleClose(pollId: string) {
    await closeAdminPoll({ data: { pollId } });
    setPolls((p) => p.map((poll) => (poll.id === pollId ? { ...poll, status: "closed" } : poll)));
  }

  async function handleDelete(pollId: string) {
    if (!confirm("Delete this poll?")) return;
    await deleteAdminPoll({ data: { pollId } });
    setPolls((p) => p.filter((poll) => poll.id !== pollId));
  }

  return (
    <>
      <AdminHeader
        title="Polls"
        subtitle="Create reader polls. Active polls appear in the homepage sidebar."
        action={
          <button className={adminBtn} onClick={() => setCreating((v) => !v)}>
            {creating ? "Cancel" : "+ New poll"}
          </button>
        }
      />

      <div className="px-6 md:px-10 py-8 space-y-8">
        {creating && (
          <form
            onSubmit={handleCreate}
            className="border-2 border-foreground bg-white p-6 space-y-5 max-w-xl"
          >
            <h3 className="font-display text-2xl uppercase">New Poll</h3>
            <label className="block space-y-1">
              <span className="font-mono text-[10px] uppercase text-muted-foreground">
                Question
              </span>
              <input
                className={adminInput}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="What's your favourite area of Hull?"
                required
              />
            </label>
            <div className="space-y-2">
              <span className="font-mono text-[10px] uppercase text-muted-foreground">
                Options (2–6)
              </span>
              {options.map((opt, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    className={adminInput}
                    value={opt}
                    onChange={(e) =>
                      setOptions((prev) => prev.map((o, j) => (j === i ? e.target.value : o)))
                    }
                    placeholder={`Option ${i + 1}`}
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      className={adminBtnOutline}
                      onClick={() => setOptions((prev) => prev.filter((_, j) => j !== i))}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              {options.length < 6 && (
                <button
                  type="button"
                  className={adminBtnOutline}
                  onClick={() => setOptions((prev) => [...prev, ""])}
                >
                  + Add option
                </button>
              )}
            </div>
            <button type="submit" className={adminBtn} disabled={saving}>
              {saving ? "Creating…" : "Create poll"}
            </button>
          </form>
        )}

        <AdminTable
          headers={["Question", "Options / Votes", "Status", "Actions"]}
          rows={polls.map((poll) => {
            const totalVotes = poll.options.reduce((s, o) => s + o.votes, 0);
            return [
              <span className="font-bold">{poll.question}</span>,
              <div className="space-y-1 min-w-[200px]">
                {poll.options.map((opt) => (
                  <div key={opt.id} className="text-xs">
                    <div className="flex justify-between mb-0.5">
                      <span>{opt.text}</span>
                      <span className="font-mono text-muted-foreground">
                        {opt.votes} (
                        {totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0}%)
                      </span>
                    </div>
                    <div className="h-1 bg-foreground/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent"
                        style={{
                          width: `${totalVotes > 0 ? (opt.votes / totalVotes) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
                <div className="font-mono text-[10px] text-muted-foreground pt-1">
                  {totalVotes} total vote{totalVotes !== 1 ? "s" : ""}
                </div>
              </div>,
              <span
                className={`font-mono text-[10px] uppercase px-2 py-0.5 ${poll.status === "active" ? "bg-foreground text-background" : "border border-foreground/30"}`}
              >
                {poll.status}
              </span>,
              <div className="flex gap-2">
                {poll.status === "active" && (
                  <button className={adminBtnOutline} onClick={() => handleClose(poll.id)}>
                    Close
                  </button>
                )}
                <button
                  className="inline-flex items-center gap-1.5 border-2 border-red-500 text-red-600 px-5 py-2.5 font-bold uppercase tracking-widest text-[10px] hover:bg-red-50 transition-colors"
                  onClick={() => handleDelete(poll.id)}
                >
                  Delete
                </button>
              </div>,
            ];
          })}
        />
      </div>
    </>
  );
}
