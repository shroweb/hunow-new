import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { getPublicProfileFn } from "@/lib/auth.functions";
import type { PublicProfile } from "@/lib/auth.server";

export const Route = createFileRoute("/profile/$userId")({
  loader: async ({ params }) => {
    const profile = await getPublicProfileFn({ data: { userId: params.userId } });
    if (!profile) throw notFound();
    return { profile };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.profile;
    if (!p) return {};
    return {
      meta: [
        { title: `${p.name} — HU NOW` },
        { name: "description", content: p.bio || `${p.name}'s profile on HU NOW.` },
      ],
    };
  },
  notFoundComponent: () => (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-4 py-32 text-center">
        <h1 className="font-display text-6xl mb-4">Profile Not Found</h1>
        <Link to="/" className="underline">
          Go home
        </Link>
      </div>
    </PublicLayout>
  ),
  component: ProfilePage,
});

function ProfilePage() {
  const { profile } = Route.useLoaderData();
  const initials = profile.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <PublicLayout>
      {/* Header */}
      <section className="max-w-4xl mx-auto px-4 py-12 md:py-20 border-b-2 border-foreground">
        <div className="flex items-center gap-6">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full border-2 border-foreground overflow-hidden bg-foreground/10 flex items-center justify-center shrink-0">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="font-display text-2xl">{initials}</span>
            )}
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase text-accent mb-1">HU NOW member</div>
            <h1 className="font-display text-5xl md:text-7xl uppercase leading-none">
              {profile.name}
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Member since {profile.memberSince}
              {profile.reviews.length > 0 && (
                <span>
                  {" "}
                  · {profile.reviews.length} review{profile.reviews.length !== 1 ? "s" : ""}
                </span>
              )}
            </p>
          </div>
        </div>
        {profile.bio && (
          <p className="mt-6 text-lg max-w-2xl text-muted-foreground">{profile.bio}</p>
        )}
      </section>

      {/* Reviews */}
      {profile.reviews.length > 0 ? (
        <section className="max-w-4xl mx-auto px-4 py-12">
          <h2 className="font-display text-4xl uppercase mb-8">Reviews by {profile.name}</h2>
          <div className="space-y-4">
            {profile.reviews.map((r: PublicProfile["reviews"][number]) => (
              <div key={r.id} className="border-2 border-foreground bg-white p-5 space-y-2">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    {r.listingSlug ? (
                      <Link
                        to="/places/$slug"
                        params={{ slug: r.listingSlug }}
                        className="font-bold text-lg hover:underline"
                      >
                        {r.listingName}
                      </Link>
                    ) : (
                      <span className="font-bold text-lg">{r.listingName}</span>
                    )}
                    <div className="text-accent text-sm mt-0.5">
                      {"★".repeat(r.rating)}
                      {"☆".repeat(5 - r.rating)}
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground shrink-0">
                    {new Date(r.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                {r.body && <p className="text-sm text-muted-foreground">{r.body}</p>}
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="max-w-4xl mx-auto px-4 py-12">
          <p className="text-muted-foreground">No public reviews yet.</p>
        </section>
      )}
    </PublicLayout>
  );
}
