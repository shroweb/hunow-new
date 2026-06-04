export function uniqueSlug(base: string, existing: string[], current?: string) {
  const clean = base || "untitled";
  if (clean === current || !existing.includes(clean)) return clean;
  let index = 2;
  while (existing.includes(`${clean}-${index}`)) index += 1;
  return `${clean}-${index}`;
}
