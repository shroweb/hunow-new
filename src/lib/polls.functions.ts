import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie } from "@tanstack/react-start/server";
import { z } from "zod";

export const getPolls = createServerFn({ method: "GET" }).handler(async () => {
  const { getActivePolls } = await import("./db.server");
  const polls = await getActivePolls();
  return polls.map((poll) => ({
    ...poll,
    votedOptionId: getCookie(`poll_${poll.id}`) ?? null,
  }));
});

export const castVote = createServerFn({ method: "POST" })
  .inputValidator(z.object({ pollId: z.string().min(1), optionId: z.string().min(1) }))
  .handler(async ({ data }) => {
    const already = getCookie(`poll_${data.pollId}`);
    if (already) return { ok: false, reason: "already_voted" as const };

    const { voteOnPoll } = await import("./db.server");
    const poll = await voteOnPoll(data.pollId, data.optionId);
    if (!poll) return { ok: false, reason: "not_found" as const };

    setCookie(`poll_${data.pollId}`, data.optionId, {
      maxAge: 60 * 60 * 24 * 365,
      httpOnly: false,
      path: "/",
    });

    return { ok: true, poll };
  });

export const getAdminPolls = createServerFn({ method: "GET" }).handler(async () => {
  const { requireAdmin } = await import("./auth.server");
  const { getAllPolls } = await import("./db.server");
  await requireAdmin();
  return getAllPolls();
});

export const createAdminPoll = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      question: z.string().min(3),
      options: z.array(z.string().min(1)).min(2).max(6),
    }),
  )
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./auth.server");
    const { createPoll } = await import("./db.server");
    await requireAdmin();
    const id = crypto.randomUUID();
    await createPoll(id, data.question, data.options);
    return { ok: true, id };
  });

export const closeAdminPoll = createServerFn({ method: "POST" })
  .inputValidator(z.object({ pollId: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./auth.server");
    const { setPollStatus } = await import("./db.server");
    await requireAdmin();
    await setPollStatus(data.pollId, "closed");
    return { ok: true };
  });

export const deleteAdminPoll = createServerFn({ method: "POST" })
  .inputValidator(z.object({ pollId: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./auth.server");
    const { deletePoll } = await import("./db.server");
    await requireAdmin();
    await deletePoll(data.pollId);
    return { ok: true };
  });
