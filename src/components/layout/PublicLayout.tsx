import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { NAV_SECTIONS } from "@/lib/nav";
import { findTaxonomy, sectionTaxonomySlug, sectionHref } from "@/lib/taxonomy";
import { getCurrentUser } from "@/lib/auth.functions";
import { subscribeNewsletter } from "@/lib/public.functions";
import { CommandPalette } from "@/components/CommandPalette";

export function PublicLayout({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState<string | null>(null);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountLabel, setAccountLabel] = useState("Sign in");

  useEffect(() => {
    getCurrentUser()
      .then((user) => setAccountLabel(user ? "Account" : "Sign in"))
      .catch(() => setAccountLabel("Sign in"));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isK = e.key === "k" || e.key === "K";
      if (isK && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCmdOpen((v) => !v);
      }
      if (e.key === "/" && !cmdOpen) {
        const t = e.target as HTMLElement | null;
        if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
        e.preventDefault();
        setCmdOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cmdOpen]);

  return (
    <div className="min-h-screen flex flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[200] focus:bg-foreground focus:text-background focus:px-4 focus:py-2 focus:text-xs focus:font-bold focus:uppercase focus:tracking-widest"
      >
        Skip to content
      </a>
      <nav
        className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b-2 border-foreground"
        onMouseLeave={() => setOpen(null)}
      >
        {/* Top utility row */}
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center gap-4">
          <Link
            to="/"
            className="text-2xl md:text-3xl font-display tracking-wider shrink-0"
            onMouseEnter={() => setOpen(null)}
          >
            HU NOW
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCmdOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-2 border-2 border-foreground/40 hover:border-foreground bg-background text-foreground/60 hover:text-foreground transition-colors w-[260px]"
              aria-label="Open search (Cmd K)"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <span className="text-xs font-bold uppercase tracking-widest flex-1 text-left">
                Search…
              </span>
              <kbd className="hidden md:inline-block text-[9px] font-mono border border-foreground/30 px-1.5 py-0.5 rounded">
                ⌘K
              </kbd>
            </button>
            <button
              onClick={() => setCmdOpen(true)}
              className="sm:hidden p-2 border-2 border-foreground/40 hover:border-foreground"
              aria-label="Search"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </button>
            <Link
              to="/saved"
              className="hidden sm:flex items-center justify-center w-9 h-9 border-2 border-foreground/40 hover:border-foreground hover:bg-foreground hover:text-background transition-colors"
              aria-label="Saved items"
              title="Saved"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </Link>
            <Link
              to="/submit"
              className="hidden md:inline-block px-4 py-2 border-2 border-foreground text-xs font-bold uppercase tracking-wider hover:bg-foreground hover:text-background transition-colors"
            >
              Submit
            </Link>
            <Link
              to="/account"
              className="hidden md:inline-block px-[18px] py-[9px] bg-foreground text-background text-xs font-bold uppercase tracking-wider hover:bg-accent transition-colors"
            >
              {accountLabel}
            </Link>
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="lg:hidden px-3 py-2 border-2 border-foreground text-xs font-bold uppercase"
              aria-label="Menu"
            >
              Menu
            </button>
          </div>
        </div>

        {/* Main nav row */}
        <div className="hidden lg:block border-t border-foreground/15">
          <div className="max-w-7xl mx-auto px-4">
            <div className="-mx-4 flex items-stretch justify-start gap-1 text-xs font-bold uppercase tracking-widest">
              <Link
                to="/"
                className={`whitespace-nowrap px-4 py-3 border-b-2 transition-colors ${pathname === "/" ? "border-accent text-accent" : "border-transparent hover:text-accent"}`}
                onMouseEnter={() => setOpen(null)}
              >
                Home
              </Link>
              {NAV_SECTIONS.map((s) => {
                const href = sectionHref(s.slug);
                const active =
                  pathname === href ||
                  pathname.startsWith(`/c/${s.slug}`) ||
                  open === s.slug;
                return (
                  <div key={s.slug} onMouseEnter={() => setOpen(s.slug)} className="relative">
                    <a
                      href={href}
                      className={`whitespace-nowrap flex items-center gap-1.5 px-4 py-3 border-b-2 transition-colors ${active ? "border-accent text-accent" : "border-transparent hover:text-accent"}`}
                    >
                      {s.label}
                      <svg
                        width="9"
                        height="9"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </a>
                  </div>
                );
              })}
              <Link
                to="/listings"
                className={`whitespace-nowrap px-4 py-3 border-b-2 transition-colors ${pathname.startsWith("/listings") ? "border-accent text-accent" : "border-transparent hover:text-accent"}`}
                onMouseEnter={() => setOpen(null)}
              >
                Listings
              </Link>
              <Link
                to="/stories"
                className={`whitespace-nowrap px-4 py-3 border-b-2 transition-colors ${pathname.startsWith("/stories") ? "border-accent text-accent" : "border-transparent hover:text-accent"}`}
                onMouseEnter={() => setOpen(null)}
              >
                Stories
              </Link>
              <Link
                to="/offers"
                className={`whitespace-nowrap px-4 py-3 border-b-2 transition-colors ${pathname.startsWith("/offers") ? "border-accent text-accent" : "border-transparent hover:text-accent"}`}
                onMouseEnter={() => setOpen(null)}
              >
                Offers
              </Link>
            </div>
          </div>
        </div>

        {/* Mega menu dropdown */}
        {open && (
          <div
            className="hidden lg:block absolute left-0 right-0 bg-background border-b-2 border-foreground shadow-xl"
            onMouseLeave={() => setOpen(null)}
          >
            <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-12 gap-8">
              {(() => {
                const section = NAV_SECTIONS.find((s) => s.slug === open)!;
                return (
                  <>
                    <div className="col-span-4">
                      <div className="text-[10px] font-mono uppercase text-accent mb-3">
                        Section
                      </div>
                      <h3 className="text-4xl font-display uppercase leading-none mb-4">
                        {section.label}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-6">{section.blurb}</p>
                      <a
                        href={sectionHref(section.slug)}
                        onClick={() => setOpen(null)}
                        className="inline-block text-[10px] font-bold uppercase tracking-widest border-b-2 border-foreground pb-1 hover:text-accent hover:border-accent"
                      >
                        See all {section.label} →
                      </a>
                    </div>
                    <div className="col-span-8 grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3">
                      {section.subs.map((sub) => {
                        const hasTaxonomy = Boolean(findTaxonomy(sub.slug));
                        return (
                          <Link
                            key={sub.slug}
                            to={hasTaxonomy ? "/$taxonomy" : "/c/$section/$sub"}
                            params={
                              hasTaxonomy
                                ? { taxonomy: sub.slug }
                                : { section: section.slug, sub: sub.slug }
                            }
                            onClick={() => setOpen(null)}
                            className="group flex items-baseline justify-between border-b border-foreground/10 py-2 hover:border-accent"
                          >
                            <span className="font-bold">{sub.label}</span>
                            <span className="text-[10px] font-mono uppercase text-muted-foreground group-hover:text-accent">
                              →
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-foreground/10 bg-background max-h-[70vh] overflow-y-auto">
            <div className="px-4 py-4 space-y-4">
              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                className="block text-xs font-bold uppercase tracking-widest"
              >
                Home
              </Link>
              {NAV_SECTIONS.map((s) => (
                <div key={s.slug} className="border-t border-foreground/10 pt-3">
                  <a
                    href={sectionHref(s.slug)}
                    onClick={() => setMobileOpen(false)}
                    className="block text-xs font-bold uppercase tracking-widest text-accent mb-2"
                  >
                    {s.label}
                  </a>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 pl-2">
                    {s.subs.map((sub) => {
                      const hasTaxonomy = Boolean(findTaxonomy(sub.slug));
                      return (
                        <Link
                          key={sub.slug}
                          to={hasTaxonomy ? "/$taxonomy" : "/c/$section/$sub"}
                          params={
                            hasTaxonomy
                              ? { taxonomy: sub.slug }
                              : { section: s.slug, sub: sub.slug }
                          }
                          onClick={() => setMobileOpen(false)}
                          className="text-sm py-1"
                        >
                          {sub.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
              <Link
                to="/listings"
                onClick={() => setMobileOpen(false)}
                className="block text-xs font-bold uppercase tracking-widest border-t border-foreground/10 pt-3"
              >
                Listings
              </Link>
              <Link
                to="/account"
                onClick={() => setMobileOpen(false)}
                className="block text-xs font-bold uppercase tracking-widest"
              >
                {accountLabel}
              </Link>
              <Link
                to="/saved"
                onClick={() => setMobileOpen(false)}
                className="block text-xs font-bold uppercase tracking-widest"
              >
                ★ Saved
              </Link>
              <button
                onClick={() => {
                  setMobileOpen(false);
                  setCmdOpen(true);
                }}
                className="block text-xs font-bold uppercase tracking-widest text-left"
              >
                Search…
              </button>
            </div>
          </div>
        )}
      </nav>
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </div>
  );
}

function Footer() {
  return (
    <footer className="bg-foreground text-background py-20 px-4 mt-20">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-5xl md:text-7xl font-display mb-6 tracking-wide">
          GET HULL IN YOUR INBOX
        </h2>
        <p className="text-background/60 mb-10 max-w-xl mx-auto">
          The best events, food guides and hidden gems sent every Thursday afternoon. Just in time
          for the weekend.
        </p>
        <form
          className="flex flex-col md:flex-row gap-0 max-w-md mx-auto"
          onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            const email = String(data.get("email") || "");
            if (email) {
              void subscribeNewsletter({ data: { email } }).catch((error) => {
                console.error("Unable to subscribe newsletter email", error);
              });
              import("@/lib/store").then(({ setState }) => {
                setState((s) => ({ ...s, newsletter: [...s.newsletter, email] }), {
                  persist: false,
                });
              });
              (e.currentTarget as HTMLFormElement).reset();
              alert("Thanks — see you Thursday.");
            }
          }}
        >
          <input
            name="email"
            type="email"
            required
            placeholder="your@email.com"
            className="flex-grow bg-transparent border-2 border-background px-6 py-4 font-mono text-sm focus:outline-none placeholder:text-background/40"
          />
          <button className="bg-background text-foreground px-8 py-4 font-bold uppercase tracking-widest hover:bg-accent hover:text-background transition-colors">
            Join
          </button>
        </form>
      </div>
      <div className="max-w-7xl mx-auto pt-20 flex flex-col md:flex-row justify-between items-center gap-8 border-t border-white/10 mt-20">
        <div className="text-4xl font-display">HU NOW</div>
        <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest text-white/40">
          <Link to="/advertise">Advertise</Link>
          <Link to="/submit">Submit</Link>
          <a href="#">Privacy</a>
        </div>
        <div className="text-[10px] font-mono text-white/20 uppercase">
          Hull's Independent City Guide
        </div>
      </div>
    </footer>
  );
}
