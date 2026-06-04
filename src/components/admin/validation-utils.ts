export function validateUrl(value: string, label: string) {
  if (!value) return undefined;
  try {
    new URL(value);
    return undefined;
  } catch {
    return `${label} must be a valid URL.`;
  }
}

export function validateUniqueSlug(slug: string, existing: string[], current?: string) {
  if (!slug) return "Slug is required.";
  if (slug !== current && existing.includes(slug)) return `Slug "${slug}" is already in use.`;
  return undefined;
}
