import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import QRCode from "qrcode";
import { PublicLayout } from "@/components/layout/PublicLayout";
import {
  getCurrentUser,
  signOutUser,
  updateProfileFn,
  uploadAvatarFn,
  updatePasswordFn,
  deleteAccountFn,
  getNewsletterPrefsFn,
  updateNewsletterPrefsFn,
  getActivityFeedFn,
  getLoyaltyCardFn,
  getMyRedemptionsFn,
} from "@/lib/auth.functions";
import { getVapidPublicKeyFn, saveWebPushSubscriptionFn } from "@/lib/content.functions";
import type { AuthUser } from "@/lib/auth.server";
import { useStore } from "@/lib/store";

type Tab = "card" | "profile" | "security" | "newsletter" | "activity" | "danger";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Account — HU NOW" },
      { name: "description", content: "Manage your HU NOW account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Account,
});

function Account() {
  const [user, setUser] = useState<
    (AuthUser & { avatarUrl?: string | null; bio?: string }) | null | undefined
  >(undefined);
  const [tab, setTab] = useState<Tab>("card");

  useEffect(() => {
    getCurrentUser()
      .then((u) => setUser(u as typeof user))
      .catch(() => setUser(null));
  }, []);

  if (user === undefined) {
    return (
      <PublicLayout>
        <div className="flex min-h-[50vh] items-center justify-center">
          <p className="font-mono text-xs uppercase text-muted-foreground">Loading…</p>
        </div>
      </PublicLayout>
    );
  }

  if (!user) {
    return (
      <PublicLayout>
        <section className="max-w-md mx-auto px-4 py-24 text-center">
          <h1 className="font-display text-6xl uppercase mb-4">Account</h1>
          <p className="text-muted-foreground mb-8">Sign in to access your account.</p>
          <div className="flex justify-center gap-3">
            <Link to="/sign-in" search={{ redirect: "/account" }} className={btn}>
              Sign in
            </Link>
            <Link to="/sign-up" search={{ redirect: "/account" }} className={btnOutline}>
              Create account
            </Link>
          </div>
        </section>
      </PublicLayout>
    );
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: "card", label: "HU NOW Card" },
    { id: "profile", label: "Profile" },
    { id: "security", label: "Security" },
    { id: "newsletter", label: "Newsletter" },
    { id: "activity", label: "Activity" },
    { id: "danger", label: "Danger Zone" },
  ];

  return (
    <PublicLayout>
      <section className="max-w-4xl mx-auto px-4 py-12 md:py-20">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-6 mb-10 border-b-2 border-foreground pb-8">
          <div className="flex items-center gap-5">
            <Avatar
              user={user}
              onUpdate={(url) => setUser((u) => (u ? { ...u, avatarUrl: url } : u))}
            />
            <div>
              <div className="font-mono text-[10px] uppercase text-accent mb-1">Your account</div>
              <h1 className="font-display text-4xl md:text-5xl uppercase leading-none">
                {user.name}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link to="/profile/$userId" params={{ userId: user.id }} className={btnOutline}>
              View profile
            </Link>
            {user.role === "admin" && (
              <Link to="/admin" className={btn}>
                Admin
              </Link>
            )}
            <button
              type="button"
              onClick={() =>
                void signOutUser().then(() => {
                  window.location.href = "/";
                })
              }
              className={btnOutline}
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b-2 border-foreground mb-8 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`px-5 py-3 text-xs font-bold uppercase tracking-widest whitespace-nowrap border-b-2 -mb-[2px] transition-colors ${
                tab === t.id
                  ? "border-accent text-accent"
                  : "border-transparent text-foreground/50 hover:text-foreground"
              } ${t.id === "danger" ? "ml-auto text-red-500 hover:text-red-700" : ""}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "card" && <CardTab userName={user.name} />}
        {tab === "profile" && (
          <ProfileTab
            user={user}
            onUpdate={(patch) => setUser((u) => (u ? { ...u, ...patch } : u))}
          />
        )}
        {tab === "security" && <SecurityTab />}
        {tab === "newsletter" && <NewsletterTab userEmail={user.email} />}
        {tab === "activity" && <ActivityTab />}
        {tab === "danger" && <DangerTab userName={user.name} />}
      </section>
    </PublicLayout>
  );
}

// ---- Avatar ----

function Avatar({
  user,
  onUpdate,
}: {
  user: { id: string; name: string; avatarUrl?: string | null };
  onUpdate: (url: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function onFile(file: File | null) {
    if (!file) return;
    setUploading(true);
    try {
      const dataUrl = await readDataUrl(file);
      const result = await uploadAvatarFn({ data: { fileName: file.name, dataUrl } });
      if (result.ok) onUpdate(result.url);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <button
      type="button"
      onClick={() => fileRef.current?.click()}
      className="relative group shrink-0"
      title="Change avatar"
    >
      <div className="w-16 h-16 rounded-full border-2 border-foreground overflow-hidden bg-foreground/10 flex items-center justify-center">
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
        ) : (
          <span className="font-display text-xl">{initials}</span>
        )}
      </div>
      <div className="absolute inset-0 rounded-full bg-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <span className="text-background text-[10px] font-bold uppercase">
          {uploading ? "…" : "Edit"}
        </span>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => void onFile(e.target.files?.[0] ?? null)}
      />
    </button>
  );
}

// ---- Profile tab ----

function ProfileTab({
  user,
  onUpdate,
}: {
  user: { name: string; bio?: string };
  onUpdate: (patch: { name?: string; bio?: string }) => void;
}) {
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio ?? "");
  const [status, setStatus] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("Saving…");
    try {
      await updateProfileFn({ data: { name, bio } });
      onUpdate({ name, bio });
      setStatus("Saved");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Error saving.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-lg space-y-5">
      <Field label="Display name">
        <input
          className={input}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          minLength={2}
        />
      </Field>
      <Field label="Bio" hint="Max 300 characters. Shown on your public profile.">
        <textarea
          className={input}
          rows={3}
          maxLength={300}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="A few words about yourself…"
        />
        <span className="text-[10px] font-mono text-muted-foreground">{bio.length}/300</span>
      </Field>
      <div className="flex items-center gap-4">
        <button type="submit" className={btn}>
          Save changes
        </button>
        {status && <span className="text-sm font-bold">{status}</span>}
      </div>
    </form>
  );
}

// ---- Security tab ----

function SecurityTab() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (next !== confirm) {
      setStatus("New passwords don't match.");
      return;
    }
    setStatus("Saving…");
    try {
      await updatePasswordFn({ data: { currentPassword: current, newPassword: next } });
      setStatus("Password updated. Other sessions have been signed out.");
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Error.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-lg space-y-5">
      <h2 className="font-display text-3xl uppercase">Change Password</h2>
      <Field label="Current password">
        <input
          type="password"
          className={input}
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          required
        />
      </Field>
      <Field label="New password" hint="Minimum 8 characters.">
        <input
          type="password"
          className={input}
          value={next}
          onChange={(e) => setNext(e.target.value)}
          required
          minLength={8}
        />
      </Field>
      <Field label="Confirm new password">
        <input
          type="password"
          className={input}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
      </Field>
      <div className="flex items-center gap-4">
        <button type="submit" className={btn}>
          Update password
        </button>
        {status && <span className="text-sm font-bold">{status}</span>}
      </div>
    </form>
  );
}

// ---- Newsletter tab ----

const SEGMENTS = [
  { id: "events", label: "What's On", desc: "Events, gigs and things to do" },
  { id: "offers", label: "Offers", desc: "Deals and discounts from local businesses" },
  { id: "businesses", label: "Business", desc: "New openings, business news" },
] as const;

type NewsletterSegment = (typeof SEGMENTS)[number]["id"];

function isNewsletterSegment(segment: string): segment is NewsletterSegment {
  return SEGMENTS.some(({ id }) => id === segment);
}

function NewsletterTab({ userEmail }: { userEmail: string }) {
  const [subscribed, setSubscribed] = useState<boolean | null>(null);
  const [segments, setSegments] = useState<NewsletterSegment[]>([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    getNewsletterPrefsFn()
      .then((prefs) => {
        setSubscribed(prefs.subscribed);
        setSegments(prefs.segments.filter(isNewsletterSegment));
      })
      .catch(() => {});
  }, []);

  function toggle(id: NewsletterSegment) {
    setSegments((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  }

  async function onSave(e: FormEvent) {
    e.preventDefault();
    setStatus("Saving…");
    try {
      await updateNewsletterPrefsFn({ data: { segments } });
      setStatus("Preferences saved.");
    } catch {
      setStatus("Error saving.");
    }
  }

  if (subscribed === null) return <p className="text-sm text-muted-foreground">Loading…</p>;

  if (!subscribed) {
    return (
      <div className="max-w-lg space-y-4">
        <h2 className="font-display text-3xl uppercase">Newsletter</h2>
        <p className="text-sm text-muted-foreground">You're not currently subscribed.</p>
        <Link to="/newsletter" className={btn}>
          Subscribe →
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSave} className="max-w-lg space-y-6">
      <div>
        <h2 className="font-display text-3xl uppercase mb-1">Newsletter Preferences</h2>
        <p className="text-sm text-muted-foreground">
          Subscribed as <strong>{userEmail}</strong>. Choose what to include in your Thursday email.
        </p>
      </div>
      <fieldset className="space-y-3">
        <legend className="sr-only">Newsletter segments</legend>
        {SEGMENTS.map(({ id, label, desc }) => (
          <label
            key={id}
            className={`flex items-start gap-4 border-2 p-4 cursor-pointer transition-colors ${segments.includes(id) ? "border-accent bg-accent/5" : "border-foreground/20 hover:border-foreground"}`}
          >
            <input
              type="checkbox"
              className="mt-0.5 shrink-0"
              checked={segments.includes(id)}
              onChange={() => toggle(id)}
            />
            <div>
              <div className="font-bold text-sm">{label}</div>
              <div className="text-xs text-muted-foreground">{desc}</div>
            </div>
          </label>
        ))}
      </fieldset>
      <div className="flex items-center gap-4">
        <button type="submit" className={btn}>
          Save preferences
        </button>
        {status && <span className="text-sm font-bold">{status}</span>}
      </div>
      <p className="text-xs text-muted-foreground">
        To unsubscribe completely,{" "}
        <Link to="/newsletter" className="underline">
          visit the newsletter page
        </Link>
        .
      </p>
    </form>
  );
}

// ---- Activity tab ----

type FeedItem = {
  type: "review" | "saved";
  id: string;
  date: string;
  label: string;
  href: string;
  meta: string;
};

function ActivityTab() {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActivityFeedFn()
      .then((items) => setFeed(items as FeedItem[]))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;

  if (feed.length === 0) {
    return (
      <div className="space-y-3">
        <h2 className="font-display text-3xl uppercase">Activity</h2>
        <p className="text-sm text-muted-foreground">
          No activity yet. Save some places or leave a review to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-lg">
      <h2 className="font-display text-3xl uppercase">Activity</h2>
      <ul className="space-y-0">
        {feed.map((item) => (
          <li
            key={`${item.type}-${item.id}`}
            className="flex items-start gap-4 py-4 border-b border-foreground/10"
          >
            <div
              className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${item.type === "review" ? "bg-accent" : "bg-foreground/40"}`}
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm">
                {item.type === "review" ? "Reviewed " : "Saved "}
                <a href={item.href} className="font-bold hover:underline">
                  {item.label}
                </a>
                {item.type === "review" && (
                  <span className="ml-2 text-accent text-xs">{item.meta}</span>
                )}
                {item.type === "saved" && (
                  <span className="ml-2 font-mono text-[10px] uppercase text-muted-foreground">
                    {item.meta}
                  </span>
                )}
              </div>
              <div className="font-mono text-[10px] text-muted-foreground mt-0.5">
                {new Date(item.date).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---- Danger Zone ----

function DangerTab({ userName }: { userName: string }) {
  const [confirm, setConfirm] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [open, setOpen] = useState(false);

  async function onDelete(e: FormEvent) {
    e.preventDefault();
    if (confirm !== userName) {
      setStatus(`Type your name exactly: "${userName}"`);
      return;
    }
    setStatus("Deleting…");
    try {
      await deleteAccountFn({ data: { password } });
      window.location.href = "/?deleted=1";
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Error.");
    }
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h2 className="font-display text-3xl uppercase text-red-600 mb-1">Danger Zone</h2>
        <p className="text-sm text-muted-foreground">Permanent actions that cannot be undone.</p>
      </div>

      <div className="border-2 border-red-300 p-5 space-y-4">
        <div>
          <p className="font-bold text-sm">Delete account</p>
          <p className="text-sm text-muted-foreground mt-1">
            Permanently deletes your account, saved items and reviews. Your comments will be
            anonymised. This cannot be reversed.
          </p>
        </div>

        {!open ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="border-2 border-red-500 text-red-600 px-5 py-2.5 font-bold uppercase tracking-widest text-[10px] hover:bg-red-50 transition-colors"
          >
            Delete my account
          </button>
        ) : (
          <form onSubmit={onDelete} className="space-y-4 border-t border-red-200 pt-4">
            <Field label={`Type your name to confirm: "${userName}"`}>
              <input
                className={`${input} border-red-400 focus:border-red-600`}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder={userName}
                required
              />
            </Field>
            <Field label="Enter your password">
              <input
                type="password"
                className={`${input} border-red-400`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Field>
            <div className="flex gap-3 items-center flex-wrap">
              <button
                type="submit"
                className="bg-red-600 text-white px-5 py-2.5 font-bold uppercase tracking-widest text-[10px] hover:bg-red-700 transition-colors"
              >
                Permanently delete
              </button>
              <button type="button" onClick={() => setOpen(false)} className={btnOutline}>
                Cancel
              </button>
              {status && <span className="text-sm font-bold text-red-600">{status}</span>}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ---- Shared helpers ----

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1">
      <span className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      {children}
      {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

function readDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

const btn =
  "inline-flex items-center bg-foreground text-background px-5 py-2.5 font-bold uppercase tracking-widest text-[10px] hover:bg-accent transition-colors";
const btnOutline =
  "inline-flex items-center border-2 border-foreground px-5 py-2.5 font-bold uppercase tracking-widest text-[10px] hover:bg-foreground hover:text-background transition-colors";
const input =
  "w-full bg-background border-2 border-foreground px-4 py-3 font-mono text-sm focus:outline-none";

function CardTab({ userName }: { userName: string }) {
  const offers = useStore((s) => (s.offers ?? []).filter((o) => o.status === "active"));
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [cardToken, setCardToken] = useState<string | null>(null);
  const [tier, setTier] = useState("Member");
  const [points, setPoints] = useState(0);

  // One-time code state
  const [selectedOfferId, setSelectedOfferId] = useState("");
  const [code, setCode] = useState<string | null>(null);
  const [codeExpiry, setCodeExpiry] = useState<Date | null>(null);
  const [codeSecondsLeft, setCodeSecondsLeft] = useState(0);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [codeError, setCodeError] = useState("");

  // History
  const [history, setHistory] = useState<
    { id: string; offer_title: string | null; listing_name: string | null; redeemed_at: string; method: string }[]
  >([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  useEffect(() => {
    getLoyaltyCardFn().then((data) => {
      if (!data.card_token) return;
      setCardToken(data.card_token);
      setTier(data.tier ?? "Member");
      setPoints(Number(data.points ?? 0));
      QRCode.toDataURL(data.card_token, {
        width: 200,
        margin: 1,
        color: { dark: "#080d2d", light: "#f5efe6" },
      }).then(setQrDataUrl).catch(() => {});
    }).catch(() => {});
    getMyRedemptionsFn().then(setHistory).catch(() => {}).finally(() => setHistoryLoaded(true));
  }, []);

  // Countdown timer for active code
  useEffect(() => {
    if (!codeExpiry) return;
    const tick = () => {
      const secs = Math.max(0, Math.floor((codeExpiry.getTime() - Date.now()) / 1000));
      setCodeSecondsLeft(secs);
      if (secs === 0) setCode(null);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [codeExpiry]);

  const generateCode = async () => {
    if (!selectedOfferId) return;
    setGeneratingCode(true);
    setCodeError("");
    try {
      const res = await fetch("/api/v1/generate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offer_id: selectedOfferId }),
      });
      const data = await res.json() as { code?: string; expires_at?: string; error?: string };
      if (!res.ok || !data.code) throw new Error(data.error ?? "Failed to generate code");
      setCode(data.code);
      setCodeExpiry(new Date(data.expires_at!));
    } catch (err) {
      setCodeError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setGeneratingCode(false);
    }
  };

  const selectedOffer = offers.find((o) => o.id === selectedOfferId);
  const mm = String(Math.floor(codeSecondsLeft / 60)).padStart(2, "0");
  const ss = String(codeSecondsLeft % 60).padStart(2, "0");

  return (
    <div className="max-w-sm mx-auto pt-6 pb-12 px-4 space-y-6">
      {/* Membership card */}
      <div className="relative bg-foreground text-background rounded-none overflow-hidden aspect-[1.586/1] flex flex-col justify-between p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <div className="font-display text-2xl uppercase leading-none tracking-wide">HU NOW</div>
            <div className="font-mono text-[9px] uppercase tracking-widest text-accent mt-0.5">{tier}</div>
          </div>
          <div className="text-right">
            <div className="font-mono text-[9px] uppercase text-white/50">Points</div>
            <div className="font-bold text-lg text-accent">{points}</div>
          </div>
        </div>
        <div>
          <div className="font-mono text-[9px] uppercase text-white/50 mb-0.5">Member</div>
          <div className="font-bold text-lg uppercase tracking-wide">{userName}</div>
        </div>
      </div>

      {/* QR code (static card scan) */}
      <div className="bg-[#f5efe6] border-2 border-foreground p-6 flex flex-col items-center gap-3">
        <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
          Scan at business to redeem
        </div>
        {qrDataUrl ? (
          <img src={qrDataUrl} alt="Your HU NOW card QR code" width={160} height={160} />
        ) : (
          <div className="w-40 h-40 bg-foreground/10 flex items-center justify-center">
            <span className="font-mono text-xs text-muted-foreground">Loading…</span>
          </div>
        )}
        {cardToken && (
          <div className="font-mono text-[9px] text-muted-foreground truncate max-w-full">
            {cardToken.slice(0, 8)}…
          </div>
        )}
      </div>

      {/* One-time redemption code */}
      {offers.length > 0 && (
        <div className="border-2 border-foreground p-5 space-y-4">
          <div>
            <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mb-2">
              Generate redemption code
            </div>
            <select
              value={selectedOfferId}
              onChange={(e) => { setSelectedOfferId(e.target.value); setCode(null); setCodeError(""); }}
              className="w-full bg-background border-2 border-foreground px-3 py-2 font-mono text-xs focus:outline-none"
            >
              <option value="">Select an offer…</option>
              {offers.map((o) => (
                <option key={o.id} value={o.id}>{o.title} — {o.businessName}</option>
              ))}
            </select>
          </div>

          {code && codeSecondsLeft > 0 ? (
            <div className="text-center space-y-2">
              <div className="font-display text-6xl tracking-[0.3em] text-foreground">{code}</div>
              <div className="font-mono text-xs text-muted-foreground">
                Show this to staff · expires in {mm}:{ss}
              </div>
              {selectedOffer && (
                <div className="font-mono text-[10px] text-accent uppercase">{selectedOffer.title}</div>
              )}
            </div>
          ) : (
            <button
              onClick={generateCode}
              disabled={!selectedOfferId || generatingCode}
              className="w-full bg-foreground text-background py-3 font-bold uppercase tracking-widest text-xs hover:bg-accent transition-colors disabled:opacity-40"
            >
              {generatingCode ? "Generating…" : "Get Code"}
            </button>
          )}
          {codeError && <p className="text-xs text-red-600 font-mono">{codeError}</p>}
        </div>
      )}

      <PushSubscribeButton />

      {/* Redemption history */}
      <div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
          Redemption history
        </div>
        {!historyLoaded ? (
          <p className="font-mono text-xs text-muted-foreground">Loading…</p>
        ) : history.length === 0 ? (
          <p className="font-mono text-xs text-muted-foreground">No redemptions yet.</p>
        ) : (
          <div className="space-y-2">
            {history.map((r) => (
              <div key={r.id} className="border border-foreground/15 p-3 flex justify-between gap-3">
                <div>
                  <p className="text-sm font-bold">{r.offer_title ?? "Offer"}</p>
                  {r.listing_name && (
                    <p className="font-mono text-[10px] text-muted-foreground">{r.listing_name}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="font-mono text-[10px] text-muted-foreground">
                    {new Date(r.redeemed_at).toLocaleDateString("en-GB", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </p>
                  <p className="font-mono text-[9px] text-accent uppercase">{r.method}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PushSubscribeButton() {
  const [state, setState] = useState<"idle" | "loading" | "on" | "unsupported">("idle");

  useEffect(() => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      setState("unsupported");
      return;
    }
    if (Notification.permission === "granted") setState("on");
  }, []);

  const subscribe = async () => {
    setState("loading");
    try {
      const { publicKey } = await getVapidPublicKeyFn();
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
      const json = sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } };
      await saveWebPushSubscriptionFn({ data: { endpoint: json.endpoint, p256dh: json.keys.p256dh, auth: json.keys.auth } });
      setState("on");
    } catch {
      setState("idle");
    }
  };

  if (state === "unsupported" || state === "on") return null;

  return (
    <button
      onClick={subscribe}
      disabled={state === "loading"}
      className="mt-6 w-full flex items-center justify-center gap-2 border-2 border-foreground py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-foreground hover:text-background transition-colors disabled:opacity-50"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      {state === "loading" ? "Enabling…" : "Enable notifications"}
    </button>
  );
}

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const arr = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) arr[i] = rawData.charCodeAt(i);
  return arr.buffer;
}
