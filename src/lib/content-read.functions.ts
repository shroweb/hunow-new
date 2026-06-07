import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const fetchArticleBySlug = createServerFn({ method: "GET" })
  .inputValidator(z.object({ slug: z.string() }))
  .handler(async ({ data }) => {
    const { getArticleBySlug } = await import("./db.server");
    return getArticleBySlug(data.slug);
  });

export const fetchEventBySlug = createServerFn({ method: "GET" })
  .inputValidator(z.object({ slug: z.string() }))
  .handler(async ({ data }) => {
    const { getEventBySlug } = await import("./db.server");
    return getEventBySlug(data.slug);
  });

export const fetchListingBySlug = createServerFn({ method: "GET" })
  .inputValidator(z.object({ slug: z.string() }))
  .handler(async ({ data }) => {
    const { getListingBySlug } = await import("./db.server");
    return getListingBySlug(data.slug);
  });
