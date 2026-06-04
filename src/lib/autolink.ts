interface Entity {
  name: string;
  path: string;
}

export function autoLink(html: string, entities: Entity[]): string {
  if (!html || entities.length === 0) return html;

  // Longest match first to avoid partial replacements
  const sorted = [...entities].sort((a, b) => b.name.length - a.name.length);
  const linked = new Set<string>();
  let result = html;

  for (const { name, path } of sorted) {
    if (linked.has(path)) continue;

    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // Split on HTML tags; only process text nodes
    const parts = result.split(/(<[^>]+>)/);
    let found = false;

    const processed = parts.map((part) => {
      if (found || part.startsWith("<")) return part;
      const replaced = part.replace(new RegExp(`\\b${escaped}\\b`, "i"), (match) => {
        found = true;
        return `<a href="${path}" class="underline hover:text-accent transition-colors">${match}</a>`;
      });
      return replaced;
    });

    if (found) {
      result = processed.join("");
      linked.add(path);
    }
  }

  return result;
}
