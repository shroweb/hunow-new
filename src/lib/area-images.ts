export type AreaImage = {
  src: string;
  alt: string;
  credit?: string;
  source?: string;
};

const commons = (src: string, alt: string, credit: string, source: string): AreaImage => ({
  src,
  alt,
  credit,
  source,
});

export const AREA_IMAGES: Record<string, AreaImage> = {
  "old-town": commons(
    "https://upload.wikimedia.org/wikipedia/commons/d/d2/The_Old_Town_-_geograph.org.uk_-_775277.jpg",
    "Rooftops and historic buildings in Hull Old Town",
    "Robert Haywood / CC BY-SA 2.0",
    "https://commons.wikimedia.org/wiki/File:The_Old_Town_-_geograph.org.uk_-_775277.jpg",
  ),
  "fruit-market": commons(
    "https://upload.wikimedia.org/wikipedia/commons/6/6f/Humber_Street%2C_Hull_-_geograph.org.uk_-_5102929.jpg",
    "Humber Street in Hull's Fruit Market",
    "Ian S / CC BY-SA 2.0",
    "https://commons.wikimedia.org/wiki/File:Humber_Street,_Hull_-_geograph.org.uk_-_5102929.jpg",
  ),
  "city-centre": commons(
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/29/Victoria_Square_General_Overlook%2C_Apr23.jpg/1920px-Victoria_Square_General_Overlook%2C_Apr23.jpg",
    "Queen Victoria Square in Hull city centre",
    "Hullian111 / CC BY-SA 4.0",
    "https://commons.wikimedia.org/wiki/File:Victoria_Square_General_Overlook,_Apr23.jpg",
  ),
  avenues: commons(
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6e/Marlborough_Avenue%2C_Kingston_upon_Hull_-_geograph.org.uk_-_5622235.jpg/1920px-Marlborough_Avenue%2C_Kingston_upon_Hull_-_geograph.org.uk_-_5622235.jpg",
    "Victorian homes on Marlborough Avenue in Hull",
    "Bernard Sharp / CC BY-SA 2.0",
    "https://commons.wikimedia.org/wiki/File:Marlborough_Avenue,_Kingston_upon_Hull_-_geograph.org.uk_-_5622235.jpg",
  ),
  "hessle-road": commons(
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/72/Hessle_Road%2C_Hull_-_geograph.org.uk_-_4513758.jpg/1920px-Hessle_Road%2C_Hull_-_geograph.org.uk_-_4513758.jpg",
    "Hessle Road in Hull",
    "Ian S / CC BY-SA 2.0",
    "https://commons.wikimedia.org/wiki/File:Hessle_Road,_Hull_-_geograph.org.uk_-_4513758.jpg",
  ),
  marina: {
    src: "/hull-marina-hero.jpg",
    alt: "Boats moored at Hull Marina",
  },
  "east-hull": commons(
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5c/East_Park%2C_Holderness_Road%2C_Kingston_upon_Hull_-_geograph.org.uk_-_7725964.jpg/1920px-East_Park%2C_Holderness_Road%2C_Kingston_upon_Hull_-_geograph.org.uk_-_7725964.jpg",
    "East Park on Holderness Road in Hull",
    "Bernard Sharp / CC BY-SA 2.0",
    "https://commons.wikimedia.org/wiki/File:East_Park,_Holderness_Road,_Kingston_upon_Hull_-_geograph.org.uk_-_7725964.jpg",
  ),
  bransholme: commons(
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/58/Goodhart_Road%2C_North_Point_Shopping_Centre%2C_Hull_-_geograph.org.uk_-_6866965.jpg/1920px-Goodhart_Road%2C_North_Point_Shopping_Centre%2C_Hull_-_geograph.org.uk_-_6866965.jpg",
    "North Point Shopping Centre in Bransholme",
    "Ian S / CC BY-SA 2.0",
    "https://commons.wikimedia.org/wiki/File:Goodhart_Road,_North_Point_Shopping_Centre,_Hull_-_geograph.org.uk_-_6866965.jpg",
  ),
  kingswood: commons(
    "https://upload.wikimedia.org/wikipedia/commons/a/a9/Kingswood_Retail_Park%2C_Hull_%28geograph_3296524%29.jpg",
    "Kingswood Retail Park in Hull",
    "Ian S / CC BY-SA 2.0",
    "https://commons.wikimedia.org/wiki/File:Kingswood_Retail_Park,_Hull_(geograph_3296524).jpg",
  ),
  "beverley-road": commons(
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d9/Beverley_Road%2C_Kingston_upon_Hull_%28geograph_6540910%29.jpg/1920px-Beverley_Road%2C_Kingston_upon_Hull_%28geograph_6540910%29.jpg",
    "Beverley Road in Hull",
    "Bernard Sharp / CC BY-SA 2.0",
    "https://commons.wikimedia.org/wiki/File:Beverley_Road,_Kingston_upon_Hull_(geograph_6540910).jpg",
  ),
  "anlaby-road": commons(
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/17/Anlaby_Road%2C_Kingston_upon_Hull_-_geograph.org.uk_-_3906383.jpg/1920px-Anlaby_Road%2C_Kingston_upon_Hull_-_geograph.org.uk_-_3906383.jpg",
    "Anlaby Road in Hull",
    "Bernard Sharp / CC BY-SA 2.0",
    "https://commons.wikimedia.org/wiki/File:Anlaby_Road,_Kingston_upon_Hull_-_geograph.org.uk_-_3906383.jpg",
  ),
  "spring-bank": commons(
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a1/Pearson_Park%2C_Kingston_upon_Hull_-_geograph.org.uk_-_5466969.jpg/1920px-Pearson_Park%2C_Kingston_upon_Hull_-_geograph.org.uk_-_5466969.jpg",
    "Pearson Park beside Hull's Spring Bank area",
    "Bernard Sharp / CC BY-SA 2.0",
    "https://commons.wikimedia.org/wiki/File:Pearson_Park,_Kingston_upon_Hull_-_geograph.org.uk_-_5466969.jpg",
  ),
};

export function isGenericAreaImage(src?: string | null) {
  return !src?.trim() || src.includes("images.unsplash.com");
}

export function resolveAreaImage(areaKey: string, configuredImage?: string | null): AreaImage {
  const fallback = AREA_IMAGES[areaKey];
  if (fallback && (isGenericAreaImage(configuredImage) || configuredImage === fallback.src)) {
    return fallback;
  }
  return {
    src: configuredImage?.trim() ?? "",
    alt: `${areaKey.replaceAll("-", " ")} in Hull`,
  };
}
