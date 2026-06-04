import type { Article, EventItem, Listing } from "@/types";

export function articlePath(article: { subcategory?: string; slug: string }): string {
  if (article.subcategory) return `/${article.subcategory}/${article.slug}`;
  return `/stories/${article.slug}`;
}

export interface Taxonomy {
  slug: string;
  label: string;
  eyebrow: string;
  description: string;
  articleSections?: string[];
  articleSubcategories?: string[];
  articleCategories?: string[];
  eventCategories?: string[];
  allEvents?: boolean;
  listingCategories?: string[];
  listingAreas?: string[];
}

export const TAXONOMIES: Taxonomy[] = [
  {
    slug: "events",
    label: "Events",
    eyebrow: "What's On",
    description: "Gigs, openings, markets, shows and things happening across Hull.",
    articleSubcategories: ["events"],
    eventCategories: [],
    allEvents: true,
  },
  {
    slug: "arts",
    label: "Arts",
    eyebrow: "What's On",
    description: "Gallery openings, exhibitions, creative events and cultural stories.",
    articleSubcategories: ["arts"],
    articleCategories: ["Culture"],
    eventCategories: ["Arts"],
    listingCategories: ["Attractions"],
  },
  {
    slug: "music",
    label: "Music",
    eyebrow: "What's On",
    description: "Live music, club nights, local artists and venues.",
    articleSubcategories: ["music"],
    eventCategories: ["Music"],
  },
  {
    slug: "sport",
    label: "Sport",
    eyebrow: "What's On",
    description: "Sport fixtures, local clubs and active things to do.",
    articleSubcategories: ["sport"],
    eventCategories: ["Sport"],
  },
  {
    slug: "eat",
    label: "Eat",
    eyebrow: "Food & Drink",
    description: "Restaurants, cafes, takeaways and food stories from across Hull.",
    articleSections: ["food-and-drink"],
    articleSubcategories: ["restaurants", "takeaways", "lunch", "everything-else"],
    articleCategories: ["Eat & Drink", "Lunch", "Takeaways"],
    eventCategories: ["Food & Drink", "Food"],
    listingCategories: ["Eat"],
  },
  {
    slug: "drink",
    label: "Drink",
    eyebrow: "Food & Drink",
    description: "Bars, pubs, coffee shops and places to get a good drink.",
    articleSections: ["food-and-drink"],
    articleSubcategories: ["bars", "pubs"],
    articleCategories: ["Eat & Drink", "Pubs"],
    listingCategories: ["Drink"],
  },
  {
    slug: "restaurants",
    label: "Restaurants",
    eyebrow: "Food & Drink",
    description: "Sit-down spots, new openings and restaurant guides.",
    articleSubcategories: ["restaurants"],
    listingCategories: ["Eat"],
  },
  {
    slug: "takeaways",
    label: "Takeaways",
    eyebrow: "Food & Drink",
    description: "Takeaway picks and quick food guides.",
    articleSubcategories: ["takeaways"],
    listingCategories: ["Eat"],
  },
  {
    slug: "bars",
    label: "Bars",
    eyebrow: "Food & Drink",
    description: "Cocktail bars, late-night spots and places for a round.",
    articleSubcategories: ["bars"],
    listingCategories: ["Drink"],
  },
  {
    slug: "pubs",
    label: "Pubs",
    eyebrow: "Food & Drink",
    description: "Local pubs, taprooms and old favourites.",
    articleSubcategories: ["pubs"],
    listingCategories: ["Drink"],
  },
  {
    slug: "lunch",
    label: "Lunch",
    eyebrow: "Food & Drink",
    description: "Lunch breaks, cafes and daytime food guides.",
    articleSubcategories: ["lunch"],
    articleCategories: ["Lunch"],
    listingCategories: ["Eat"],
  },
  {
    slug: "things-to-do",
    label: "Things to Do",
    eyebrow: "City Guide",
    description: "Days out, activities, attractions and guides for exploring Hull.",
    articleSections: ["things-to-do"],
    listingCategories: ["Things To Do", "Attractions"],
  },
  {
    slug: "shopping",
    label: "Shopping",
    eyebrow: "Things to Do",
    description: "Independent shops, markets and retail guides.",
    articleSubcategories: ["shopping"],
    articleCategories: ["Shopping"],
    listingCategories: ["Shops"],
  },
  {
    slug: "shops",
    label: "Shops",
    eyebrow: "Listings",
    description: "Independent shops and places to browse around Hull.",
    articleSubcategories: ["shopping"],
    listingCategories: ["Shops"],
  },
  {
    slug: "attractions",
    label: "Attractions",
    eyebrow: "Listings",
    description: "Museums, galleries, landmarks and visitor favourites.",
    listingCategories: ["Attractions", "Things To Do"],
  },
  {
    slug: "fun",
    label: "Fun",
    eyebrow: "Things to Do",
    description: "Playful things to do, social plans and weekend ideas.",
    articleSubcategories: ["fun"],
  },
  {
    slug: "outdoors",
    label: "Outdoors",
    eyebrow: "Things to Do",
    description: "Fresh-air plans, walks and outdoor days around Hull.",
    articleSubcategories: ["outdoors"],
  },
  {
    slug: "days-out",
    label: "Days Out",
    eyebrow: "Things to Do",
    description: "Longer plans, family days and mini-adventures.",
    articleSubcategories: ["days-out"],
  },
  {
    slug: "community",
    label: "Community",
    eyebrow: "Local Life",
    description: "Everyday life, local people and community stories.",
    articleSections: ["community"],
  },
  {
    slug: "family",
    label: "Family",
    eyebrow: "Community",
    description: "Family-friendly events, places and guides.",
    articleSubcategories: ["family"],
    eventCategories: ["Family"],
  },
  {
    slug: "history",
    label: "History",
    eyebrow: "Community",
    description: "Local history, heritage and stories from Hull's past.",
    articleSubcategories: ["history"],
  },
  {
    slug: "travel",
    label: "Travel",
    eyebrow: "Community",
    description: "Getting around, city links and travel stories.",
    articleSubcategories: ["travel"],
  },
  {
    slug: "business",
    label: "Business",
    eyebrow: "More",
    description: "Independent business stories, openings and local trade.",
    articleSubcategories: ["business"],
    articleCategories: ["Independent Business"],
    listingCategories: ["Shops", "Eat", "Drink"],
  },
  {
    slug: "health",
    label: "Health",
    eyebrow: "More",
    description: "Wellbeing, health services and local lifestyle stories.",
    articleSubcategories: ["health"],
  },
  {
    slug: "weddings",
    label: "Weddings",
    eyebrow: "More",
    description: "Venues, suppliers and planning stories for Hull weddings.",
    articleSubcategories: ["weddings"],
  },
  {
    slug: "culture",
    label: "Culture",
    eyebrow: "Stories",
    description: "Culture stories, interviews and creative dispatches.",
    articleCategories: ["Culture"],
  },
  {
    slug: "interviews",
    label: "Interviews",
    eyebrow: "Stories",
    description: "Conversations with people shaping Hull.",
    articleCategories: ["Interviews"],
  },
  {
    slug: "guides",
    label: "Guides",
    eyebrow: "Stories",
    description: "Useful guides for getting more out of the city.",
    articleCategories: ["Guides"],
  },
  {
    slug: "hidden-gems",
    label: "Hidden Gems",
    eyebrow: "City Guide",
    description: "Under-the-radar places and stories worth discovering.",
    articleCategories: ["Hidden Gems"],
    listingCategories: ["Eat", "Drink", "Shops", "Things To Do", "Attractions"],
  },
  {
    slug: "independent-business",
    label: "Independent Business",
    eyebrow: "City Guide",
    description: "Local independents, founders and small business stories.",
    articleCategories: ["Independent Business"],
    listingCategories: ["Eat", "Drink", "Shops"],
  },
];

export function findTaxonomy(slug: string) {
  return TAXONOMIES.find((taxonomy) => taxonomy.slug === slug);
}

export function taxonomyPath(slug: string) {
  return `/${slug}`;
}

export function sectionTaxonomySlug(sectionSlug: string) {
  if (sectionSlug === "food-and-drink") return "eat";
  return findTaxonomy(sectionSlug) ? sectionSlug : undefined;
}

// The canonical landing page for each top-level nav section
export function sectionHref(sectionSlug: string): string {
  if (sectionSlug === "whats-on") return "/whats-on";
  const taxonomy = sectionTaxonomySlug(sectionSlug);
  if (taxonomy) return `/${taxonomy}`;
  return `/c/${sectionSlug}`;
}

export function articleMatchesTaxonomy(article: Article, taxonomy: Taxonomy) {
  return (
    hasMatch(taxonomy.articleSections, article.section) ||
    hasMatch(taxonomy.articleSubcategories, article.subcategory) ||
    hasMatch(taxonomy.articleCategories, article.category)
  );
}

export function eventMatchesTaxonomy(event: EventItem, taxonomy: Taxonomy) {
  if (taxonomy.allEvents) return true;
  return hasMatch(taxonomy.eventCategories, event.category);
}

export function listingMatchesTaxonomy(listing: Listing, taxonomy: Taxonomy) {
  if (taxonomy.slug === "hidden-gems") return listing.isHiddenGem;
  if (taxonomy.slug === "independent-business") return listing.isIndependent;
  return (
    hasMatch(taxonomy.listingCategories, listing.category) ||
    hasMatch(taxonomy.listingAreas, listing.area)
  );
}

function hasMatch(values: string[] | undefined, value: string | undefined) {
  if (!values || !value) return false;
  const normalised = value.toLowerCase();
  return values.some((item) => item.toLowerCase() === normalised);
}
