export interface NavSub {
  slug: string;
  label: string;
}

export interface NavSection {
  slug: string;
  label: string;
  blurb: string;
  subs: NavSub[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    slug: "whats-on",
    label: "What's On",
    blurb: "Live events, gigs, shows and happenings across the city.",
    subs: [
      { slug: "events", label: "Events" },
      { slug: "arts", label: "Arts" },
      { slug: "music", label: "Music" },
      { slug: "sport", label: "Sport" },
    ],
  },
  {
    slug: "things-to-do",
    label: "Things to Do",
    blurb: "Days out, shopping trips and adventures around Hull.",
    subs: [
      { slug: "shopping", label: "Shopping" },
      { slug: "fun", label: "Fun" },
      { slug: "outdoors", label: "Outdoors" },
      { slug: "days-out", label: "Days Out" },
    ],
  },
  {
    slug: "food-and-drink",
    label: "Food & Drink",
    blurb: "Where to eat, drink and graze in the city.",
    subs: [
      { slug: "restaurants", label: "Restaurants" },
      { slug: "takeaways", label: "Takeaways" },
      { slug: "bars", label: "Bars" },
      { slug: "pubs", label: "Pubs" },
      { slug: "lunch", label: "Lunch" },
      { slug: "everything-else", label: "Everything Else" },
    ],
  },
  {
    slug: "community",
    label: "Community",
    blurb: "Local life, family, travel and the stories that shape Hull.",
    subs: [
      { slug: "everyday-life", label: "Everyday Life" },
      { slug: "travel", label: "Travel" },
      { slug: "family", label: "Family" },
      { slug: "history", label: "History" },
    ],
  },
  {
    slug: "more",
    label: "More",
    blurb: "Business, health, weddings and the rest.",
    subs: [
      { slug: "business", label: "Business" },
      { slug: "health", label: "Health" },
      { slug: "animals", label: "Animals" },
      { slug: "weddings", label: "Weddings" },
    ],
  },
];

export function findSection(slug: string) {
  return NAV_SECTIONS.find((s) => s.slug === slug);
}

export function findSub(sectionSlug: string, subSlug: string) {
  return findSection(sectionSlug)?.subs.find((s) => s.slug === subSlug);
}
