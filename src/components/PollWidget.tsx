import { useState, useEffect } from "react";
import { getPolls, getPollByIdFn, castVote } from "@/lib/polls.functions";
import type { PollRow } from "@/lib/db.server";

type PollWithVote = PollRow & { votedOptionId: string | null };

export function PollWidget({ pollId }: { pollId?: string } = {}) {
  const [polls, setPolls] = useState<PollWithVote[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    if (pollId) {
      getPollByIdFn({ data: { pollId } })
        .then((p) => {
          if (p) setPolls([p as PollWithVote]);
        })
        .catch(() => {});
    } else {
      getPolls()
        .then(setPolls)
        .catch(() => {});
    }
  }, [pollId]);

  const poll = polls[activeIndex];
  if (!poll) return null;

  const totalVotes = poll.options.reduce((s, o) => s + o.votes, 0);
  const hasVoted = Boolean(poll.votedOptionId);

  async function handleVote(optionId: string) {
    if (hasVoted || voting) return;
    setVoting(true);
    try {
      const result = await castVote({ data: { pollId: poll.id, optionId } });
      if (result.ok && result.poll) {
        setPolls((prev) =>
          prev.map((p) => (p.id === poll.id ? { ...result.poll!, votedOptionId: optionId } : p)),
        );
      } else {
        // Already voted in another tab — show results anyway
        setPolls((prev) =>
          prev.map((p) => (p.id === poll.id ? { ...p, votedOptionId: optionId } : p)),
        );
      }
    } finally {
      setVoting(false);
    }
  }

  return (
    <div className="border-2 border-foreground bg-white p-5 space-y-4">
      <div className="font-mono text-[10px] uppercase tracking-widest text-accent">Reader Poll</div>
      <p className="font-bold text-sm leading-snug">{poll.question}</p>

      <div className="space-y-2">
        {poll.options.map((opt) => {
          const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
          const isVoted = poll.votedOptionId === opt.id;

          return (
            <button
              key={opt.id}
              type="button"
              disabled={hasVoted || voting || poll.status === "closed"}
              onClick={() => handleVote(opt.id)}
              className={`w-full text-left border-2 px-4 py-2.5 transition-colors relative overflow-hidden text-sm font-medium ${
                isVoted
                  ? "border-accent bg-accent/10"
                  : hasVoted
                    ? "border-foreground/20 bg-foreground/[0.02]"
                    : "border-foreground hover:bg-foreground/5 cursor-pointer"
              }`}
            >
              {hasVoted && (
                <span
                  className="absolute inset-y-0 left-0 bg-foreground/8 transition-all"
                  style={{ width: `${pct}%` }}
                />
              )}
              <span className="relative flex justify-between items-center gap-2">
                <span>{opt.text}</span>
                {hasVoted && (
                  <span className="font-mono text-[10px] shrink-0 text-muted-foreground">
                    {pct}%
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono uppercase text-muted-foreground">
        <span>
          {totalVotes} vote{totalVotes !== 1 ? "s" : ""}
        </span>
        {polls.length > 1 && (
          <div className="flex gap-1">
            {polls.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveIndex(i)}
                className={`w-2 h-2 rounded-full transition-colors ${i === activeIndex ? "bg-foreground" : "bg-foreground/20"}`}
              />
            ))}
          </div>
        )}
        {poll.status === "closed" && <span className="text-accent">Closed</span>}
      </div>
    </div>
  );
}
