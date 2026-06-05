export interface Author {
  name: string;
  bio: string;
  role: string;
}

// Extend this as new writers join — keyed by the exact name used in articles
export const AUTHORS: Record<string, Author> = {
  "Elena Hartley": {
    name: "Elena Hartley",
    role: "Food & Culture Writer",
    bio: "Elena covers Hull's independent food scene, hidden spaces and the quieter corners of city life. Previously at the Yorkshire Post.",
  },
  "Jordan Mills": {
    name: "Jordan Mills",
    role: "Arts & Culture Editor",
    bio: "Jordan writes about street art, music and creative communities across East Yorkshire. Finds the best walls before anyone else does.",
  },
  "Sam Whitfield": {
    name: "Sam Whitfield",
    role: "City Guide Writer",
    bio: "Sam's speciality is neighbourhood guides and the kind of places you only find by walking slowly. Based in the Old Town.",
  },
  "Priya Shah": {
    name: "Priya Shah",
    role: "Business Reporter",
    bio: "Priya covers Hull's independent business scene — the makers, founders and operators building something worth writing about.",
  },
  "HU NOW": {
    name: "HU NOW",
    role: "Editorial Team",
    bio: "Written by the HU NOW editorial team.",
  },
};

export function getAuthor(name: string): Author {
  return AUTHORS[name] ?? { name, role: "Contributor", bio: "" };
}

export function authorSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
