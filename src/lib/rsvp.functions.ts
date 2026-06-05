import crypto from "node:crypto";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const getEventRsvp = createServerFn({ method: "GET" })
  .inputValidator(z.object({ eventId: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { getPool, ensureSchema } = await import("./db.server.rsvp");
    const { currentUser } = await import("./auth.server");
    await ensureSchema();
    const [countResult, user] = await Promise.all([
      getPool().query<{ count: string }>(
        "select count(*)::text as count from event_rsvps where event_id = $1",
        [data.eventId],
      ),
      currentUser().catch(() => null),
    ]);
    const count = Number(countResult.rows[0]?.count ?? 0);
    let going = false;
    if (user) {
      const row = await getPool().query(
        "select 1 from event_rsvps where event_id = $1 and user_id = $2",
        [data.eventId, user.id],
      );
      going = (row.rowCount ?? 0) > 0;
    }
    return { count, going, userId: user?.id ?? null };
  });

export const toggleRsvp = createServerFn({ method: "POST" })
  .inputValidator(z.object({ eventId: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { getPool, ensureSchema } = await import("./db.server.rsvp");
    const { currentUser } = await import("./auth.server");
    await ensureSchema();
    const user = await currentUser();
    if (!user) throw new Error("Sign in to RSVP.");
    const existing = await getPool().query(
      "select id from event_rsvps where event_id = $1 and user_id = $2",
      [data.eventId, user.id],
    );
    if ((existing.rowCount ?? 0) > 0) {
      await getPool().query("delete from event_rsvps where event_id = $1 and user_id = $2", [
        data.eventId,
        user.id,
      ]);
      return { going: false };
    }
    const id = crypto.randomUUID();
    await getPool().query(
      "insert into event_rsvps (id, event_id, user_id) values ($1, $2, $3) on conflict do nothing",
      [id, data.eventId, user.id],
    );
    return { going: true };
  });
