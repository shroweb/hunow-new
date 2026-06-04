export type Status = "draft" | "published" | "pending" | "expired" | "scheduled" | "archived";

export interface SeoMeta {
  title?: string;
  description?: string;
  ogImage?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  featuredImage: string;
  author: string;
  status: Status;
  isFeatured: boolean;
  isSponsored: boolean;
  sponsorName?: string;
  readingMinutes: number;
  publishedAt: string;
  scheduledFor?: string;
  section?: string;
  subcategory?: string;
  series?: string;
  seriesOrder?: number;
  seo?: SeoMeta;
}

export interface EventItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  content?: string; // rich HTML body
  category: string;
  startDate: string; // ISO
  endDate?: string; // ISO — for multi-day events
  startTime: string;
  endTime?: string;
  locationName: string;
  address: string;
  price: string;
  isFree: boolean;
  ticketUrl?: string;
  featuredImage: string;
  gallery?: string[]; // additional image IDs/URLs
  status: Status;
  isFeatured: boolean;
  isSponsored: boolean;
  scheduledFor?: string;
  recurrence?: { type: "weekly" | "biweekly" | "monthly"; until?: string };
  seo?: SeoMeta;
}

export interface Listing {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  area: string;
  address: string;
  latitude?: number;
  longitude?: number;
  mapUrl?: string;
  openingHours: string;
  website?: string;
  phone?: string;
  email?: string;
  featuredImage: string;
  gallery?: string[];
  hours?: WeekHours;
  isFeatured: boolean;
  isHiddenGem: boolean;
  isIndependent: boolean;
  isVerified?: boolean;
  activeOfferId?: string;
  seo?: SeoMeta;
}

export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
export type DayHours = { open: string; close: string } | null; // null = closed
export type WeekHours = Record<DayKey, DayHours>;

export interface Offer {
  id: string;
  title: string;
  listingId: string;
  businessName: string;
  description: string;
  terms: string;
  code?: string;
  startDate: string;
  endDate: string;
  redemptionCount: number;
  category: string;
  status: "active" | "expired";
  seo?: SeoMeta;
}

export interface Submission {
  id: string;
  type: "event" | "listing";
  title: string;
  contactName: string;
  contactEmail: string;
  data: Record<string, string>;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface AdPlacement {
  id: string;
  advertiserName: string;
  placement: string;
  image: string;
  url: string;
  startDate: string;
  endDate: string;
  impressions: number;
  clicks: number;
  status: "active" | "paused" | "expired";
}

export interface MediaAsset {
  id: string;
  url: string;
  fileName: string;
  alt: string;
  credit?: string;
  focalPoint?: string;
  createdAt: string;
}
