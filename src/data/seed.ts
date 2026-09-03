import type {
  AdPlacement,
  Article,
  EventItem,
  Listing,
  MediaAsset,
  Offer,
  Submission,
} from "@/types";

export const DEFAULT_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&h=800&q=80";

export const CATEGORY_FALLBACKS: Record<string, string> = {
  sport: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1200&h=800&q=80",
  rugby: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&h=800&q=80",
  football: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1200&h=800&q=80",
  music: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&h=800&q=80",
  "food & drink": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&h=800&q=80",
  food: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&h=800&q=80",
  arts: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=1200&h=800&q=80",
  comedy: "https://images.unsplash.com/photo-1527224857830-43a7acc85260?auto=format&fit=crop&w=1200&h=800&q=80",
  family: "https://images.unsplash.com/photo-1472162072942-cd5147eb3902?auto=format&fit=crop&w=1200&h=800&q=80",
  theatre: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=1200&h=800&q=80",
  nightlife: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&h=800&q=80",
};

export const getCategoryFallback = (category?: string, title?: string): string => {
  const cat = (category || "").toLowerCase();
  const t = (title || "").toLowerCase();
  if (t.includes("hull kr") || t.includes("rugby") || t.includes("hull fc")) return CATEGORY_FALLBACKS.rugby;
  if (t.includes("hull city") || t.includes("football")) return CATEGORY_FALLBACKS.football;
  for (const [key, url] of Object.entries(CATEGORY_FALLBACKS)) {
    if (cat.includes(key)) return url;
  }
  return DEFAULT_FALLBACK_IMAGE;
};

export const img = (id?: string | null, w = 1200, h = 800, fallback?: string) => {
  const fallbackUrl = fallback || DEFAULT_FALLBACK_IMAGE;
  if (!id || typeof id !== "string" || !id.trim()) return fallbackUrl;
  const clean = id.trim();
  // Pass through uploaded data URLs and absolute URLs
  if (
    clean.startsWith("data:") ||
    clean.startsWith("http://") ||
    clean.startsWith("https://") ||
    clean.startsWith("blob:") ||
    clean.startsWith("/")
  ) {
    if (clean.includes("wikimedia.org") && clean.endsWith(".svg")) {
      return fallbackUrl;
    }
    return clean;
  }
  return `https://images.unsplash.com/${clean}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;
};

/** Generate a WebP URL for an Unsplash image */
export const imgWebp = (id: string, w = 1200, h = 800) => {
  if (
    !id ||
    id.startsWith("data:") ||
    id.startsWith("http://") ||
    id.startsWith("https://") ||
    id.startsWith("blob:") ||
    id.startsWith("/")
  ) {
    return undefined;
  }
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80&fm=webp`;
};

/** Generate srcSet string for responsive images */
export const imgSrcSet = (id: string, widths: number[], h?: number) => {
  if (
    !id ||
    id.startsWith("data:") ||
    id.startsWith("http://") ||
    id.startsWith("https://") ||
    id.startsWith("blob:") ||
    id.startsWith("/")
  ) {
    return undefined;
  }
  return widths
    .map(
      (w) =>
        `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h ?? Math.round(w * 0.75)}&q=80 ${w}w`,
    )
    .join(", ");
};

export const seedArticles: Article[] = [
  {
    id: "a1",
    title: "The Secret Garden Cafe Behind Whitefriargate",
    slug: "secret-garden-cafe-whitefriargate",
    excerpt:
      "Tucked down an unmarked alley, this courtyard cafe is Hull's worst-kept secret — and our new favourite.",
    content:
      "Whitefriargate is changing quickly, but the best discoveries are still the ones you almost miss. Tucked behind an unshowy doorway, this courtyard cafe has become a quiet bolt-hole for people who want good coffee without the city-centre rush.\n\nThe room is small, bright and full of plants, with a short menu built around toasties, cakes and carefully made espresso. Regulars come for the calm as much as the coffee: freelancers with laptops in the morning, shoppers ducking in at lunch, and friends stretching one flat white into an hour-long catch-up.\n\nOwner Maya Patel spent two years bringing the Georgian outbuilding back to life. The result feels personal rather than polished, and that is exactly why it works.",
    category: "Hidden Gems",
    tags: ["cafe", "coffee", "old town"],
    featuredImage: "photo-1554118811-1e0d58224f24",
    author: "Elena Hartley",
    status: "published",
    isFeatured: true,
    isSponsored: false,
    readingMinutes: 4,
    publishedAt: "2026-05-28",
    section: "food-and-drink",
    subcategory: "everything-else",
    series: "Hidden Hull",
    seriesOrder: 1,
  },
  {
    id: "article-guide-to-parking-at-hull-fair",
    title: "Guide to Parking at Hull Fair 2026: Park & Ride, Stadium Parking & Restrictions",
    slug: "guide-to-parking-at-hull-fair",
    excerpt:
      "Everything you need to know about parking for Hull Fair 2026 at Walton Street. Official park and ride routes, MKM stadium parking prices, disabled bays, and residential permit restriction zones to avoid fines.",
    content: `<h2>The Essential Guide to Parking at Hull Fair 2026</h2>
<p>Hull Fair is Europe’s largest travelling fair, attracting over 800,000 visitors across its nine-day run along Walton Street. Because Walton Street and the surrounding residential terraces are completely closed to non-resident vehicles, parking near the fairground requires planning ahead.</p>
<p>Here is your complete guide to where to park, official park and ride services, matchday parking at the MKM Stadium, and council parking restrictions for Hull Fair 2026.</p>

<h2>Option 1: Official Hull Fair Park & Ride Services (Recommended)</h2>
<p>The most convenient, stress-free way to reach Hull Fair is using the official dedicated <strong>Park & Ride services</strong>. Hull City Council and Stagecoach/East Yorkshire Buses operate high-frequency direct shuttle buses that drop you right outside the fairground gates.</p>

<h3>1. Priory Park & Ride (West Hull / Hessle)</h3>
<ul>
  <li><strong>Postcode:</strong> HU4 7DY (Just off the A63 Clive Sullivan Way / Henry Boot Way)</li>
  <li><strong>Capacity:</strong> Over 650 secure parking spaces.</li>
  <li><strong>Buses:</strong> Depart every 10–15 minutes directly to Walton Street. Return buses run continuously until after the fair closes each night.</li>
  <li><strong>Ideal for:</strong> Visitors driving in via the M62, A63, Humber Bridge, Beverley, or West Hull villages.</li>
  <li><strong>Parking Cost:</strong> Free to park; you only pay the bus fare.</li>
</ul>

<h3>2. Craven Park Park & Ride (East Hull)</h3>
<ul>
  <li><strong>Postcode:</strong> HU9 5DX (Preston Road, East Hull)</li>
  <li><strong>Buses:</strong> Special direct fair shuttle services run in the late afternoon and evening throughout fair week.</li>
  <li><strong>Ideal for:</strong> Visitors travelling from East Hull, Holderness, Hedon, and Withernsea.</li>
</ul>

<h2>Option 2: MKM Stadium Parking (5-Minute Walk)</h2>
<p>The <strong>MKM Stadium (formerly KC Stadium)</strong>, situated directly adjacent to Walton Street Fairground inside West Park, provides dedicated parking for fairgoers on non-match days.</p>
<ul>
  <li><strong>Access:</strong> Entry is via the Walton Street / Anlaby Road entrance.</li>
  <li><strong>Cost:</strong> Typically £5 to £6 per vehicle (cash and contactless accepted at the gate).</li>
  <li><strong>Availability:</strong> The car park opens daily at 11:30 AM. It fills up extremely quickly on Friday and Saturday evenings, so plan to arrive before 5:00 PM if aiming to park here.</li>
  <li><strong>Matchday Warning:</strong> If Hull City AFC or Hull FC have a home fixture during fair week, stadium parking will be reserved strictly for match ticket holders and stadium pass holders.</li>
</ul>

<h2>Option 3: City Centre Multi-Storeys + Walk or Bus</h2>
<p>If you prefer to avoid the Walton Street traffic entirely, parking in Hull City Centre and taking a quick bus or 20-minute walk down Anlaby Road is an excellent alternative:</p>
<ul>
  <li><strong>St Stephen’s Shopping Centre Car Park (HU2 8LN):</strong> Over 800 spaces, open 24/7, covered and secure. Located directly beside Hull Paragon Interchange.</li>
  <li><strong>Osborne Street Multi-Storey (HU1 2NW):</strong> Just off Ferensway and Carr Lane.</li>
  <li><strong>Pryme Street Multi-Storey (HU2 8HR):</strong> City centre multi-storey with evening flat rates.</li>
</ul>
<p>From Hull Paragon Interchange, East Yorkshire buses (services 3, 4, 57, 66, and dedicated fair specials) run down Anlaby Road every few minutes to the fairground.</p>

<h2>Disabled & Blue Badge Parking</h2>
<p>Dedicated accessible parking for <strong>Blue Badge holders</strong> is located inside the MKM Stadium car park via the Walton Street entrance. Spaces are allocated on a first-come, first-served basis. Make sure your valid Blue Badge is clearly displayed on your dashboard upon arrival.</p>

<h2>Strict Enforcement: Residential Permit Zones (Avoid Costly Fines)</h2>
<p>During Hull Fair, Hull City Council enforces <strong>strict residents-only parking zones</strong> covering all streets within a 1-mile radius of Walton Street, including:</p>
<ul>
  <li>Walton Street and all adjoining residential terraces</li>
  <li>Lowther Street, Paisley Street, Perry Street, and Sandringham Street</li>
  <li>Walliker Street, St George’s Road, and Arthur Street</li>
  <li>West Park groves and avenues</li>
</ul>
<p>Civil enforcement officers patrol these streets continuously throughout the day and night. Any vehicles parked without a valid resident parking permit will receive an immediate penalty charge notice (PCN) and risk being towed away. <strong>Please respect local residents and use the official park and ride or stadium car parks instead.</strong></p>

<h2>Plan Your Visit to Hull Fair 2026</h2>
<p>Hull Fair 2026 runs from <strong>Friday 9 October through Saturday 17 October 2026</strong> (closed Sunday 11 October). The fair opens at 12:00 PM (noon) daily and closes at 11:00 PM.</p>
<p>For full event details, opening times, ride lists, and historical background, see our dedicated <a href="/events/hull-fair-2026">Hull Fair 2026 What’s On Guide</a>.</p>`,
    category: "Guides",
    subcategory: "guides",
    section: "things-to-do",
    author: "HU NOW Editorial Team",
    readingMinutes: 4,
    featuredImage: "photo-1513889961551-628c1e5e2ee9",
    status: "published",
    publishedAt: "2026-09-03",
    tags: ["Hull Fair", "Parking", "Walton Street", "Park and Ride", "Guides"],
    isFeatured: true,
    isSponsored: false,
    seo: {
      title: "Guide to Parking at Hull Fair 2026: Park & Ride, Stadium & Restrictions",
      description:
        "Complete guide to parking at Hull Fair 2026. Official Priory and Craven Park and ride buses, MKM Stadium car parking, disabled bays, and residential permit zones to avoid fines.",
    },
  },
  {
    id: "article-essential-guide-to-christmas-in-hull",
    title: "The Essential Guide to Christmas 2026 in Hull: Markets, Light Switch-On & Events",
    slug: "essential-guide-to-christmas-in-hull",
    excerpt:
      "Everything happening for Christmas 2026 in Hull. Queen Victoria Square lights switch-on, Trinity Market festive night markets, Beverley Festival of Christmas, and theatre pantomimes.",
    content: `<h2>Christmas 2026 in Hull & East Yorkshire</h2>
<p>From historic cobbled streets illuminated by thousands of twinkling festoon bulbs to bustling Victorian artisan craft markets and packed theatre pantomimes, Hull comes alive across November and December. Here is your definitive guide to the essential events, markets, light switch-ons, and seasonal celebrations across the city for Christmas 2026.</p>

<h2>1. Queen Victoria Square Christmas Lights Switch-On</h2>
<p>Hull's festive season officially begins with the spectacular <strong>Queen Victoria Square Light Switch-On</strong> in late November. Centred around the grand backdrop of Hull City Hall and the Ferens Art Gallery, the square fills with thousands of families for live entertainment, community choirs, and special guest appearances before the big countdown triggers the illuminations and a rooftop pyrotechnic finale.</p>
<ul>
  <li><strong>Location:</strong> Queen Victoria Square, Hull City Centre (HU1 3RA)</li>
  <li><strong>Admission:</strong> Free entry</li>
  <li><strong>Highlights:</strong> Giant illuminated Christmas tree, street food stalls, live brass bands, and late-night shopping opening.</li>
</ul>

<h2>2. Trinity Market Victorian Christmas & Festive Night Markets</h2>
<p>Hull Old Town's independent market hall hosts a series of special <strong>Christmas Night Markets</strong> throughout December. Expect the indoor food court serving festive street food — spiced bratwurst, Yorkshire pudding wraps, festive loaded roasties, mulled spiced cider, and hot chocolate with toasted marshmallows — alongside dozens of local makers and craftsmen selling unique gifts, prints, and ceramics.</p>
<ul>
  <li><strong>Location:</strong> Trinity Market, Trinity House Lane, Hull HU1 2JH</li>
  <li><strong>Dates:</strong> Every Thursday evening and selected weekends in December</li>
  <li><strong>Vibe:</strong> Live acoustic music, festive drinks, covered and warm.</li>
</ul>

<h2>3. Beverley Festival of Christmas</h2>
<p>Just 15 minutes north of Hull, the world-famous <strong>Beverley Festival of Christmas</strong> transforms the historic Georgian market town into a Victorian winter wonderland. More than 120 Victorian stalls take over Saturday Market, Wednesday Market, and North Bar Within, featuring reindeer parades, traditional fairground rides, and carol singing outside Beverley Minster.</p>
<ul>
  <li><strong>Location:</strong> Saturday Market & Wednesday Market, Beverley (HU17 8AA)</li>
  <li><strong>Travel Advice:</strong> Park & Ride services run continuously from Beverley Racecourse; public buses run frequently from Hull Paragon Interchange.</li>
</ul>

<h2>4. Festive Shows & Pantomimes</h2>
<ul>
  <li><strong>Hull New Theatre:</strong> The region's flagship star-studded family pantomime features high-energy comedy, spectacular staging, and audience participation from early December through mid-January.</li>
  <li><strong>Hull Truck Theatre (Ferensway):</strong> Celebrated for inventive, heartwarming home-grown holiday productions tailored for younger children and theatre lovers alike.</li>
  <li><strong>Hull City Hall:</strong> Traditional candlelit orchestral performances of Handel's Messiah and festive brass band concerts.</li>
</ul>

<h2>5. Festive Food & Independent Shopping</h2>
<p>Combine your day with independent gift shopping down <strong>Humber Street in the Fruit Market</strong>, where local boutiques, art galleries, and craft bakeries offer thoughtful presents you won't find on the high street. Warm up afterwards in one of Old Town's historic taverns by an open real log fire.</p>`,
    category: "Guides",
    subcategory: "guides",
    section: "things-to-do",
    author: "HU NOW Editorial Team",
    readingMinutes: 5,
    featuredImage: "photo-1543589077-47d81606c1bf",
    status: "published",
    publishedAt: "2026-09-03",
    tags: ["Christmas", "Hull Christmas Markets", "Beverley Festival of Christmas", "Light Switch On", "Guides"],
    isFeatured: true,
    isSponsored: false,
    seo: {
      title: "The Essential Guide to Christmas 2026 in Hull: Markets, Lights & Events",
      description:
        "Complete guide to Christmas 2026 in Hull. Queen Victoria Square lights switch-on, Trinity Market Christmas markets, Beverley Festival of Christmas and festive theatre shows.",
    },
  },
  {
    id: "article-hull-bonfire-night-fireworks-guide-2026",
    title: "Bonfire Night & Fireworks in Hull & East Yorkshire 2026: Dates, Times & Tickets",
    slug: "hull-bonfire-night-fireworks-guide-2026",
    excerpt:
      "Where to watch fireworks in Hull and East Yorkshire for Bonfire Night 2026. Dates, ticket details, food stalls, and timings for Craven Park, Brantingham, Beverley, and community displays.",
    content: `<h2>Bonfire Night & Fireworks in Hull & East Yorkshire 2026</h2>
<p>Looking for the best places to watch fireworks across Hull, Beverley, and East Yorkshire this November? Whether you want a massive stadium laser and pyrotechnic musical extravaganza or a traditional village green bonfire with jacket potatoes and sparklers, here is your complete guide to Bonfire Night 2026.</p>

<h2>1. Craven Park Fireworks Spectacular (East Hull)</h2>
<p>Hull's largest organised fireworks event takes place at <strong>Sewell Group Craven Park</strong>, home of Hull KR. The evening features an immense musical fireworks display lighting up the night sky above the stadium bowl, accompanied by live DJ entertainment, funfair rides for children, and stadium street food kiosks.</p>
<ul>
  <li><strong>Location:</strong> Sewell Group Craven Park, Preston Road, Hull HU9 5DX</li>
  <li><strong>Timings:</strong> Gates open at 4:30 PM, display begins at approximately 7:30 PM</li>
  <li><strong>Tickets:</strong> Advance online booking recommended; early-bird family tickets available.</li>
</ul>

<h2>2. Brantingham Park Big Fireworks Display (Brough / West Hull)</h2>
<p>Situated in the grounds of Hull Ionians RUFC, <strong>Brantingham Park</strong> hosts one of the most popular community fireworks displays in the East Riding. The event boasts an enormous bonfire, extensive licensed bars, hog roast and burger stalls, and a dedicated low-noise children's display preceding the main musical show.</p>
<ul>
  <li><strong>Location:</strong> Brantingham Park, Brantingham Road, Brough HU15 1HX</li>
  <li><strong>Parking:</strong> On-site field parking available (arrive early to avoid queues on Cave Road).</li>
</ul>

<h2>3. Beverley Westwood & Town Fireworks</h2>
<p>A classic Guy Fawkes celebration against the atmospheric landscape of the Beverley Westwood pasture. Organised by Beverley Lions and local community partners, it features a traditional wood bonfire built by volunteers and a stunning aerial fireworks display illuminating the Westwood Black Mill.</p>
<ul>
  <li><strong>Location:</strong> Beverley Westwood (near the Black Mill), HU17 8RG</li>
  <li><strong>Admission:</strong> Free entry with voluntary bucket donations supporting local charities.</li>
</ul>

<h2>4. Swanland Playing Fields Community Bonfire</h2>
<p>A firm favourite with West Hull families, Swanland's annual bonfire night provides a welcoming, community-focused evening with hot food stalls, children's rides, mulled wine, and synchronized fireworks over the playing fields.</p>
<ul>
  <li><strong>Location:</strong> Swanland Playing Fields, West Leys Road, Swanland HU14 3LZ</li>
</ul>

<h2>Bonfire Night Safety & Visiting Tips</h2>
<ul>
  <li><strong>Arrive Early:</strong> Popular displays in Craven Park and Brantingham see heavy traffic on approach roads between 6:00 PM and 7:00 PM.</li>
  <li><strong>Wrap Up Warm:</strong> November evenings in East Yorkshire can be cold and windy; thermal layers, gloves, and waterproof boots are recommended.</li>
  <li><strong>Pet Welfare:</strong> Keep dogs and cats safely indoors with curtains drawn and soothing music playing during peak fireworks hours (6:00 PM – 9:00 PM).</li>
</ul>`,
    category: "Guides",
    subcategory: "guides",
    section: "things-to-do",
    author: "HU NOW Editorial Team",
    readingMinutes: 4,
    featuredImage: "photo-1498931299472-f7a63a5a1cfa",
    status: "published",
    publishedAt: "2026-09-03",
    tags: ["Bonfire Night", "Fireworks", "Craven Park", "Beverley", "Guides"],
    isFeatured: true,
    isSponsored: false,
    seo: {
      title: "Bonfire Night & Fireworks Displays in Hull & East Yorkshire 2026",
      description:
        "Complete guide to Bonfire Night & Fireworks 2026 in Hull and East Yorkshire. Craven Park, Brantingham, Beverley Westwood, dates, tickets, and times.",
    },
  },
  {
    id: "a2",
    title: "10 Minutes with Local Mural Artist Spray-K",
    slug: "10-minutes-spray-k",
    excerpt:
      "The artist behind Hull's most photographed wall on growing up in Bransholme, painting fast and never looking back.",
    content:
      "Spray-K did not set out to become one of Hull's most photographed artists. The first walls were quick, borrowed spaces: shutters, boards, legal jams, anywhere with enough room to practise a line and enough light to see it properly.\n\nThese days the work is easier to spot. Big colour, clean characters, local references tucked into corners for people who know the city well. He talks about Bransholme, buses, football cages and the long route into town as naturally as he talks about paint brands and caps.\n\nThe thing he keeps returning to is permission. Not permission from a committee, but permission for young artists to take themselves seriously. If you can see your own estate on a wall, you start to think your story belongs in public.",
    category: "Interviews",
    tags: ["art", "street art", "interview"],
    featuredImage: "photo-1541961017774-22349e4a1262",
    author: "Jordan Mills",
    status: "published",
    isFeatured: true,
    isSponsored: false,
    readingMinutes: 6,
    publishedAt: "2026-05-26",
    section: "whats-on",
    subcategory: "arts",
  },
  {
    id: "a3",
    title: "Why Hull's Old Town Is the UK's Next Foodie Hub",
    slug: "old-town-foodie-hub",
    excerpt:
      "From sourdough bakeries to Vietnamese small-plates, the Old Town has quietly become a serious dining destination.",
    content:
      "Walk through Old Town on a Friday night and the queues tell the story. What used to be a dependable pub-and-curry circuit now has bakeries, small plates, Vietnamese kitchens, cocktail bars and independent coffee shops all feeding into the same few streets.\n\nThe appeal is partly practical: the area is compact, walkable and close to the waterfront. But the bigger shift is confidence. Operators are taking smaller spaces, writing tighter menus and betting that Hull diners will follow good ideas wherever they land.\n\nFor visitors, the best approach is to move slowly. Start with a drink, split a few plates, then wander towards High Street or Trinity Square for whatever looks busiest. In Old Town, busy is usually a useful recommendation.",
    category: "Eat & Drink",
    tags: ["food", "old town", "restaurants"],
    featuredImage: "photo-1414235077428-338989a2e8c0",
    author: "Sam Whitfield",
    status: "published",
    isFeatured: true,
    isSponsored: false,
    readingMinutes: 7,
    publishedAt: "2026-05-24",
    section: "food-and-drink",
    subcategory: "restaurants",
    series: "Hidden Hull",
    seriesOrder: 2,
  },
  {
    id: "a4",
    title: "Inside the Maker Spaces Powering Hull's Indie Scene",
    slug: "hull-maker-spaces",
    excerpt: "Where the city's printmakers, ceramicists and small-batch brewers actually work.",
    content:
      "Hull's independent scene is powered by practical spaces as much as big ideas. Behind the shopfronts and market stalls are shared workshops where printmakers, ceramicists, brewers, designers and repairers trade tools, contacts and the occasional emergency roll of tape.\n\nThese places rarely look glamorous from the outside. Some sit above retail units, some on industrial estates, some in former storage rooms brought back into use one bench at a time. Inside, they act as informal business schools: someone knows packaging, someone else knows wholesale, and everyone knows the pain of a late invoice.\n\nThat quiet infrastructure matters. It lets local makers test products, keep overheads low and stay in Hull while their audience grows.",
    category: "Independent Business",
    tags: ["business", "makers"],
    featuredImage: "photo-1556761175-5973dc0f32e7",
    author: "Priya Shah",
    status: "published",
    isFeatured: false,
    isSponsored: true,
    sponsorName: "Hull City Council",
    readingMinutes: 5,
    publishedAt: "2026-05-22",
    section: "more",
    subcategory: "business",
    series: "Independent Hull",
    seriesOrder: 1,
  },
  {
    id: "a5",
    title: "A Weekend Guide to Hull for First-Time Visitors",
    slug: "weekend-guide-first-time",
    excerpt: "Two days, one perfect itinerary, zero tourist traps.",
    content:
      "Start at the Marina with coffee and a slow walk along the water. From there, head into Old Town for Trinity Square, the Minster and the museums quarter, where you can cover a lot of Hull's history without losing half the day to travel.\n\nLunch works best around Humber Street or High Street, depending on whether you want galleries and waterfront views or older streets and pubs. Leave time for The Deep if you are travelling with children, or for a quieter wander through the Ferens and Queen Victoria Square if you are not.\n\nOn day two, cross to Pearson Park or take the bus out towards the Humber Bridge. Hull rewards visitors who look sideways: down alleys, into independent shops and beyond the first obvious photo stop.",
    category: "Guides",
    tags: ["guide", "weekend", "tourism"],
    featuredImage: "photo-1577717903315-1691ae25ab3f",
    author: "Elena Hartley",
    status: "published",
    isFeatured: false,
    isSponsored: false,
    readingMinutes: 8,
    publishedAt: "2026-05-20",
    section: "community",
    subcategory: "everyday-life",
  },
  {
    id: "a6",
    title: "Where to Drink in Hull This Summer",
    slug: "where-to-drink-summer",
    excerpt: "Sun-traps, rooftops and beer gardens worth crossing town for.",
    content:
      "When the sun finally shows up in Hull, the best seats disappear quickly. The trick is to pick your side of the city early: Marina and Humber Street for waterside tables, Old Town for historic pubs, Princes Avenue for an easy crawl, or Newland Avenue for casual pints and late food.\n\nFor something relaxed, look for courtyards and pavement tables rather than the biggest beer garden. Hull's summer drinking is at its best when it feels improvised: a cold pint after work, a shared bottle outside, a last-minute plan that somehow becomes a whole evening.\n\nBook if you are eating, be kind to staff, and remember that the best table is often the one you can actually get.",
    category: "Eat & Drink",
    tags: ["bars", "summer"],
    featuredImage: "photo-1514933651103-005eec06c04b",
    author: "Sam Whitfield",
    status: "published",
    isFeatured: false,
    isSponsored: false,
    readingMinutes: 5,
    publishedAt: "2026-05-18",
    section: "food-and-drink",
    subcategory: "bars",
  },
  {
    id: "a7",
    title: "The Fruit Market: How Humber Street Became Hull's Creative Quarter",
    slug: "fruit-market-humber-street-creative-quarter",
    excerpt:
      "Ten years ago it was a wholesale market. Today it's home to galleries, restaurants, studios and one of the most talked-about independent coffee scenes in the north.",
    content:
      "The Fruit Market didn't happen overnight. The regeneration of Hull's old wholesale produce district — a cluster of Victorian brick warehouses between the city centre and the Humber — took the better part of a decade, and the result is one of the UK's most convincing creative neighbourhood stories.\n\nHumber Street is the spine of it. Walk its length on a Saturday morning and you pass Humber Street Gallery, a cluster of independent cafés and restaurants, artists' studios above the shopfronts, and occasional weekend markets that spill onto the cobbles. The grain of the original warehouse district is still legible: wide arches, loading bays repurposed as shopfronts, names that nod to the area's trading past.\n\nWhat makes the Fruit Market work, compared with regeneration projects that land with a thud, is pace and mix. Independent operators moved in before the rent got steep. Galleries sat alongside food businesses from the start. The Humber Bridge is visible at the end of the street on a clear day, a constant reminder that this is a waterfront city that spent decades looking away from its own water.\n\nThe neighbourhood isn't finished. New buildings keep arriving and some of the rough edges that made it interesting are being smoothed. But the foundations are solid, and on a good evening — wine in hand outside one of the Humber Street terraces, the estuary catching the last of the light — it is hard to argue with what the city has managed here.",
    category: "Culture",
    tags: ["fruit market", "humber street", "regeneration", "arts"],
    featuredImage:
      "https://upload.wikimedia.org/wikipedia/commons/e/e9/Horner%27s_Square%2C_Humber_Street%2C_Kingston_upon_Hull_-_geograph.org.uk_-_7960320.jpg",
    author: "Sam Whitfield",
    status: "published",
    isFeatured: true,
    isSponsored: false,
    readingMinutes: 6,
    publishedAt: "2026-05-15",
    section: "community",
    subcategory: "history",
  },
  {
    id: "a8",
    title: "Hull's Best Brunches: Where to Go on a Saturday Morning",
    slug: "best-brunches-hull-saturday",
    excerpt:
      "Smashed eggs, sourdough, shakshuka and the full works — our definitive guide to Hull's weekend brunch scene.",
    content:
      "Hull's brunch scene has quietly matured into something worth setting an alarm for. The concentration of good options around Humber Street, Princes Avenue and the Old Town means you rarely have to travel more than a few minutes between decent choices, but the quality varies and the queues at the best spots are real.\n\nThieving Harry's on Humber Street is the obvious starting point. The space is small, the menu tight and seasonal, and the coffee — sourced from a local roaster — is consistently the best in the building. Weekend queues form before 10am; the trick is to arrive early or embrace the wait with a flat white.\n\nFor something heartier, the options around Princes Avenue lean towards the full English end of the spectrum, with a few places doing excellent eggs benedict variations that have gathered loyal followings over several years. Princes Avenue is also the right part of town for post-brunch wandering: good charity shops, a bookshop, a record store, and the park if the sun is out.\n\nIn the Old Town, brunch tends to happen inside historic buildings that reward a bit of curiosity — former banks, converted warehouses, courtyard spaces you'd walk past without looking up. If you're coming in from outside the city, the Old Town cluster is probably the most efficient route to a good morning.",
    category: "Eat & Drink",
    tags: ["brunch", "humber street", "breakfast", "café"],
    featuredImage: "photo-1504674900247-0877df9cc836",
    author: "Elena Hartley",
    status: "published",
    isFeatured: false,
    isSponsored: false,
    readingMinutes: 5,
    publishedAt: "2026-05-12",
    section: "food-and-drink",
    subcategory: "lunch",
  },
  {
    id: "a9",
    title: "Walking the Humber Bridge: Everything You Need to Know",
    slug: "walking-humber-bridge-guide",
    excerpt:
      "At 2.2km, it's one of the great walks in the north of England. Here's how to do it properly.",
    content:
      "The Humber Bridge opened in 1981 and held the record for the world's longest single-span suspension bridge for sixteen years. Today it's open to pedestrians and cyclists from dawn to dusk, free of charge, and the walk across and back is one of the most underrated two hours you can spend in the area.\n\nThe pedestrian path is on the west side of the bridge — wide, well-surfaced and sheltered enough from traffic to feel calm even on a busy day. From the Hessle side, you walk out over the north bank of the estuary, the city of Hull visible to your right, open water stretching south. The central span is 1,410 metres and the towers rise 155 metres above the water; standing at mid-span with the wind coming off the Humber, it is genuinely vertiginous.\n\nThe best time to walk is late afternoon on a clear day, when the light drops low over the water and the bridge cables catch it at angles that make it look like something from a photograph rather than an engineering project. Sunset from the southern tower anchorage, looking back at the north bank, is one of those things that residents take for granted and visitors remember for years.\n\nPractical notes: the car park on the Hessle side has good facilities and the Country Park around the base is worth the additional half-hour. Allow ninety minutes for the crossing and back if you're walking at a normal pace. The bridge is occasionally closed in high winds; check before you go.",
    category: "Outdoors",
    tags: ["humber bridge", "walking", "outdoors", "hessle"],
    featuredImage:
      "https://upload.wikimedia.org/wikipedia/commons/8/8b/Beautiful_sunny_day_at_Humber_Bridge_near_Hull%2C_UK_01.jpg",
    author: "Jordan Mills",
    status: "published",
    isFeatured: false,
    isSponsored: false,
    readingMinutes: 6,
    publishedAt: "2026-05-08",
    section: "things-to-do",
    subcategory: "outdoors",
  },
  {
    id: "a10",
    title: "Hull City of Culture 2017: What the Legacy Looks Like Now",
    slug: "hull-city-of-culture-2017-legacy",
    excerpt:
      "Nine years on from the year that changed how the city saw itself, we look at what actually stuck.",
    content:
      "City of Culture 2017 was not a single event. It was 365 days of programming that ran from a spectacular opening night in Queen Victoria Square — white powder, fireworks, thousands of people — through twelve months of exhibitions, commissions, concerts, theatre and a lot of arguing about what culture means in a city that has spent decades being told it doesn't have any.\n\nThe infrastructure changes are the easiest to measure. Ferens Art Gallery closed for refurbishment before the year and reopened transformed: new galleries, better storage, a Caravaggio on loan that queued around the block. The Humber Street Gallery was new. Hull Truck got a new building. The Maritime Museum was refreshed. The investment was real and most of it has lasted.\n\nThe harder thing to measure is confidence. Hull before 2017 had a complicated relationship with its own reputation — funny about it, defensive about it, sometimes genuinely beaten down by it. What the City of Culture year did, at its best, was give the city a year of taking itself seriously in public. Artists from outside saw something worth engaging with. Artists from inside felt something worth staying for.\n\nNot all of it held. Some of the volunteer culture that built up during the year dispersed. Some of the cultural organisations that grew in 2017's atmosphere found the years after harder. But the Fruit Market kept growing, the gallery programme kept its ambition, and the city that you can walk around today — the waterfront, the Old Town, the art on the walls — has 2017 running through it whether people track the connection or not.",
    category: "Culture",
    tags: ["city of culture", "history", "arts", "hull"],
    featuredImage: "photo-1541961017774-22349e4a1262",
    author: "Sam Whitfield",
    status: "published",
    isFeatured: true,
    isSponsored: false,
    readingMinutes: 7,
    publishedAt: "2026-05-04",
    section: "community",
    subcategory: "history",
  },
  {
    id: "a11",
    title: "East Park: Hull's Most Underrated Green Space",
    slug: "east-park-hull-guide",
    excerpt:
      "Splash park, boating lake, animal enclosure and 130 acres of Victorian parkland — and most people outside the east of the city have never been.",
    content:
      "East Park sits about two miles from the city centre, in a part of Hull that doesn't often make it onto visitor itineraries. That's the first thing to know about it, and the first reason it's worth going: it is a proper Victorian municipal park, large and unhurried, used by the people who live near it rather than the people who write about Hull.\n\nThe park opened in 1887 and the bones of the original layout are still there — the boating lake, the formal gardens, the long sight lines that Victorian park designers were so good at. But East Park has also accumulated things over its 130-odd years: a small animal and bird enclosure where children can see wallabies and meerkats, a Splash Park that runs through the summer, a newly renovated café, and the Khyber Pass — a rockery feature that children have been climbing on for generations.\n\nIn summer the park fills up quickly on hot days and the splash park queue gets long. The better visiting time, if you're not bringing children specifically for the water, is a weekday morning in June or September when the park is quiet and the café is reliably open. The boating lake hire runs on warmer days and is exactly as leisurely as it sounds.\n\nEast Park is free. It always has been. In a city with a lot of pay-to-enter attractions, that still feels significant.",
    category: "Outdoors",
    tags: ["park", "east hull", "outdoors", "family"],
    featuredImage:
      "https://upload.wikimedia.org/wikipedia/commons/2/26/East_Park_Avenue_of_Trees%2C_Kingston_upon_Hull_Sep25.jpg",
    author: "Priya Shah",
    status: "published",
    isFeatured: false,
    isSponsored: false,
    readingMinutes: 5,
    publishedAt: "2026-05-01",
    section: "things-to-do",
    subcategory: "outdoors",
  },
];

export const seedEvents: EventItem[] = [
  {
    id: "e1",
    title: "Hull Freedom Festival 2026",
    slug: "hull-freedom-festival-2026",
    description:
      "Hull's biggest annual arts festival returns for its free bank holiday weekend spectacular. Three days of street theatre, live music, circus, visual art and large-scale outdoor performances across the city centre and waterfront. One of the UK's largest free arts festivals.",
    category: "Arts",
    startDate: "2026-08-28",
    startTime: "11:00",
    endTime: "22:00",
    locationName: "Hull City Centre & Waterfront",
    address: "Queen Victoria Square and surrounding areas, Hull HU1",
    price: "Free",
    isFree: true,
    featuredImage:
      "https://upload.wikimedia.org/wikipedia/commons/0/0b/L%27Homme_Debout_giant_parade_at_Hull_Freedom_Festival_-_geograph.org.uk_-_5893946.jpg",
    status: "published",
    isFeatured: true,
    isSponsored: false,
    seo: {
      title: "Hull Freedom Festival 2026 — Free Arts Festival August Bank Holiday",
      description:
        "Hull Freedom Festival 2026 runs 28–30 August across the city centre and waterfront. Free entry. Street theatre, live music, circus and large-scale outdoor art.",
    },
  },
  {
    id: "e2",
    title: "Humber Street Sesh 2026",
    slug: "humber-street-sesh-2026",
    description:
      "The UK's biggest free urban music festival, set across multiple stages and venues in Hull's Fruit Market district. Over 100 acts performing across one weekend, showcasing the best of emerging and independent music. Entirely free and family-friendly during the day.",
    category: "Music",
    startDate: "2026-08-01",
    startTime: "12:00",
    endTime: "23:00",
    locationName: "Humber Street & Fruit Market",
    address: "Humber Street, Hull HU1 1TU",
    price: "Free",
    isFree: true,
    featuredImage:
      "https://upload.wikimedia.org/wikipedia/commons/9/99/2015_Humber_Street_Sesh_Music_Festival_-_geograph.org.uk_-_4594036.jpg",
    status: "published",
    isFeatured: true,
    isSponsored: false,
    seo: {
      title: "Humber Street Sesh 2026 — Hull's Free Music Festival",
      description:
        "Humber Street Sesh 2026 — over 100 acts across the Fruit Market on 1–2 August. The UK's biggest free urban music festival.",
    },
  },
  {
    id: "e3",
    title: "Hull Big Malarkey Festival 2026",
    slug: "hull-big-malarkey-festival-2026",
    description:
      "Hull's much-loved children's literature and arts festival returns to East Park. A free outdoor event featuring author talks, storytelling, live performances, workshops and creative activities for children and families. One of the highlights of Hull's summer calendar.",
    category: "Family",
    startDate: "2026-06-27",
    startTime: "10:00",
    endTime: "17:00",
    locationName: "East Park",
    address: "East Park, Holderness Road, Hull HU8 8JU",
    price: "Free",
    isFree: true,
    featuredImage:
      "https://upload.wikimedia.org/wikipedia/commons/2/26/East_Park_Avenue_of_Trees%2C_Kingston_upon_Hull_Sep25.jpg",
    status: "published",
    isFeatured: true,
    isSponsored: false,
  },
  {
    id: "e8",
    title: "Old Town Saturday Market",
    slug: "old-town-saturday-market-june-2026",
    description:
      "The weekly independent market in Trinity Square returns with a strong lineup of local food producers, vintage traders and craft makers. Pick up fresh bread from Humber Bakehouse, locally roasted coffee, and handmade ceramics — all under the shadow of Holy Trinity Minster. Running every Saturday, rain or shine.",
    category: "Food & Drink",
    startDate: "2026-06-06",
    startTime: "09:00",
    endTime: "15:00",
    locationName: "Trinity Square",
    address: "Trinity Square, Hull HU1 2JH",
    price: "Free entry",
    isFree: true,
    featuredImage: "photo-1488459716781-31db52582fe9",
    status: "published",
    isFeatured: true,
    isSponsored: false,
  },
  {
    id: "e9",
    title: "Open Studios: Fruit Market Artists",
    slug: "fruit-market-open-studios-june-2026",
    description:
      "Thirty artists working in the Fruit Market's studio buildings open their doors for a free weekend of visits. See printmakers, painters, ceramicists and textile artists at work in the warehouse spaces above Humber Street. No booking required — just turn up, walk around and talk to the people making the work.",
    category: "Arts",
    startDate: "2026-06-07",
    startTime: "11:00",
    endTime: "17:00",
    locationName: "Fruit Market Studios, Humber Street",
    address: "Humber Street, Hull HU1 1TU",
    price: "Free",
    isFree: true,
    featuredImage:
      "https://upload.wikimedia.org/wikipedia/commons/e/e9/Horner%27s_Square%2C_Humber_Street%2C_Kingston_upon_Hull_-_geograph.org.uk_-_7960320.jpg",
    status: "published",
    isFeatured: true,
    isSponsored: false,
  },
  {
    id: "e10",
    title: "Live at The Minerva: Sunday Session",
    slug: "minerva-sunday-session-june-2026",
    description:
      "The Minerva's weekly Sunday afternoon session features local musicians playing acoustic sets in the bar from 3pm. This week: folk and blues from Hull-based duo Tidal Roots, with an open mic slot from 5pm. Free entry, real ales on tap, and the best Humber view in the city from the terrace.",
    category: "Music",
    startDate: "2026-06-07",
    startTime: "15:00",
    endTime: "20:00",
    locationName: "The Minerva Hotel",
    address: "Nelson Street, Hull HU1 1XE",
    price: "Free",
    isFree: true,
    featuredImage: "https://upload.wikimedia.org/wikipedia/commons/9/93/The_Minerva.jpg",
    status: "published",
    isFeatured: false,
    isSponsored: false,
  },
  {
    id: "e4",
    title: "Hull Jazz Festival 2026",
    slug: "hull-jazz-festival-2026",
    description:
      "Hull Jazz Festival returns with a packed programme of gigs across the city's bars, galleries and outdoor spaces. From mainstream jazz to experimental and soul, the festival showcases international touring acts alongside the best of the local scene. Most events are free.",
    category: "Music",
    startDate: "2026-07-10",
    startTime: "17:00",
    locationName: "Various venues, Hull city centre",
    address: "Humber Street and Old Town, Hull HU1",
    price: "Most events free",
    isFree: true,
    featuredImage: "photo-1415201364774-f6f0bb35f28f",
    status: "published",
    isFeatured: true,
    isSponsored: false,
  },
  {
    id: "e5",
    title: "Ferens Art Gallery: Summer Exhibition Opening",
    slug: "ferens-summer-exhibition-2026",
    description:
      "The Ferens opens its major summer exhibition with a free public evening. The gallery's programme of loan exhibitions and new commissions continues to draw visitors from across the region. Free entry, drinks provided, talks from the curators.",
    category: "Arts",
    startDate: "2026-07-03",
    startTime: "18:00",
    endTime: "21:00",
    locationName: "Ferens Art Gallery",
    address: "Queen Victoria Square, Hull HU1 3RA",
    price: "Free",
    isFree: true,
    featuredImage:
      "https://upload.wikimedia.org/wikipedia/commons/e/e0/Ferens_Art_Gallery_Apr23.jpg",
    status: "published",
    isFeatured: false,
    isSponsored: false,
  },
  {
    id: "e6",
    title: "Hull Truck Theatre: New Season Launch",
    slug: "hull-truck-new-season-2026",
    description:
      "Hull Truck Theatre announces its autumn–winter season with a free public launch event. Meet the creative team, hear extracts from upcoming productions, and book early for the best seats. The theatre's programme of new writing and classic productions has established it as one of the UK's most important regional theatres.",
    category: "Theatre",
    startDate: "2026-09-01",
    startTime: "19:00",
    endTime: "21:30",
    locationName: "Hull Truck Theatre",
    address: "50 Ferensway, Hull HU2 8LB",
    price: "Free",
    isFree: true,
    ticketUrl: "https://hulltruck.co.uk",
    featuredImage: "https://upload.wikimedia.org/wikipedia/commons/7/7c/New_Hull_Truck_Theatre.JPG",
    status: "published",
    isFeatured: false,
    isSponsored: false,
  },
  {
    id: "e7",
    title: "Hull Fair 2026",
    slug: "hull-fair-2026",
    description:
      "Europe's largest travelling fair returns to Walton Street for its 134th year — nine nights of rides, lights, and brandy snap from 9–17 October. Entry to the fairground is free; rides and stalls are individually priced.",
    content: `
<h2>Hull Fair 2026 Dates & Opening Times</h2>
<p>Hull Fair 2026 officially runs from <strong>Friday 9 October to Saturday 17 October 2026</strong>. Please note that by royal charter tradition, <strong>the fair is closed on Sunday 11 October</strong>.</p>
<ul>
  <li><strong>Opening Day (Friday 9 October):</strong> 5:00 PM – 11:00 PM</li>
  <li><strong>Saturdays (10 & 17 October):</strong> 12:00 PM (Noon) – 11:00 PM</li>
  <li><strong>Sunday 11 October:</strong> CLOSED ALL DAY</li>
  <li><strong>Monday 12 October – Friday 16 October:</strong> 2:00 PM – 11:00 PM daily</li>
</ul>

<h2>Hull Fair 2026 Tickets & Prices: Do You Need a Ticket?</h2>
<p><strong>Entry to Hull Fair is 100% FREE.</strong> You do not need to buy an admission ticket or book in advance — you can simply walk straight onto the Walton Street fairground site.</p>
<p>All rides, food stalls, and games are individually priced:</p>
<ul>
  <li><strong>Children's Rides:</strong> Typically £2.00 to £3.00 per ride.</li>
  <li><strong>Family & Classic Rides (Ferris Wheel, Gallopers, Dodgems):</strong> Typically £3.00 to £4.00.</li>
  <li><strong>Major Thrill & White-Knuckle Rides:</strong> Typically £4.00 to £5.00+ each.</li>
  <li><strong>Side Stalls & Games (Hook-a-Duck, Darts, Rifle Range):</strong> Typically £2.00 to £3.00 per turn.</li>
  <li><strong>Food & Sweets:</strong> Brandy snap from £2, nougat, candy floss, hot roast chestnuts, and loaded chips £3 to £7.</li>
</ul>

<h2>Payment: Cash vs. Card</h2>
<p>While an increasing number of showmen now have contactless card machines, <strong>many stalls and smaller children's rides remain strictly cash-only</strong> due to mobile network congestion on site.</p>
<p>There are mobile cash ATMs situated at the north and south gates of Walton Street, but they charge withdrawal transaction fees and develop long queues during peak hours. <strong>We strongly recommend bringing £20 to £30 in cash per person</strong> before you arrive.</p>

<h2>Parking & Getting to Walton Street</h2>
<p>Parking in the immediate Walton Street area is strictly restricted with residents-only permit zones. We strongly advise using the council-run Park & Ride services or stadium parking.</p>
<p>👉 <strong>For complete parking details, shuttle buses, and map locations, see our <a href="/guides/guide-to-parking-at-hull-fair">Full Guide to Parking at Hull Fair 2026</a>.</strong></p>

<h2>What to Expect at Europe's Largest Travelling Fair</h2>
<p>Hull Fair occupies 16 acres of Walton Street and the neighbouring parkland with more than <strong>250 rides, 80+ side stalls, and dozens of international food trucks</strong>. From 50-metre observation wheels giving panoramic views across the Humber to high-intensity reverse bungees and historic steam-driven carousels, there is entertainment for all generations.</p>

<h2>Tips for Visiting in 2026</h2>
<ul>
  <li><strong>Quietest Times:</strong> Monday to Thursday afternoons (2 PM – 5 PM) are ideal for families with young children and prams.</li>
  <li><strong>Busiest Times:</strong> Friday evenings and Saturday nights attract peak crowds; expect queues for headline rides.</li>
  <li><strong>Clothing:</strong> Walton Street is open to the elements — wear warm, waterproof layers and sturdy shoes for walking on asphalt and gravel.</li>
  <li><strong>Brandy Snap:</strong> Wright's Brandy Snap stalls have traded at Hull Fair for over a century — don't leave without a bag of freshly rolled brandy snaps!</li>
</ul>
    `.trim(),
    category: "Family",
    startDate: "2026-10-09",
    endDate: "2026-10-17",
    startTime: "12:00",
    endTime: "23:00",
    locationName: "Walton Street Fairground",
    address: "Walton Street, Hull HU3 6HR",
    price: "Free entry · rides £2–5 each",
    isFree: true,
    featuredImage: "photo-1513889961551-628c1e5e2ee9",
    status: "published",
    isFeatured: true,
    isSponsored: false,
    seo: {
      title: "Hull Fair 2026 Dates, Prices, Tickets & Times — Walton Street",
      description:
        "Everything you need to know about Hull Fair 2026 (9–17 October). Free entry, ticket prices, ride costs, daily opening times, cash tips and parking details.",
    },
  },
  {
    id: "e11",
    title: "St Stephen's 'Alive After Five' Live Music",
    slug: "alive-after-five-st-stephens",
    description:
      "St Stephen's Shopping Centre brings live music to the city centre every Thursday evening with its Alive After Five series. Local and regional artists perform in the mall's central atrium — free entry, no booking required.",
    category: "Music",
    startDate: "2026-06-04",
    startTime: "17:00",
    endTime: "20:00",
    locationName: "St Stephen's Shopping Centre",
    address: "St Stephen's, Hull HU2 8LN",
    price: "Free",
    isFree: true,
    featuredImage: "photo-1493225457124-a3eb161ffa5f",
    status: "published",
    isFeatured: true,
    isSponsored: false,
  },
  {
    id: "e12",
    title: "World Food Festival",
    slug: "world-food-festival-2026",
    description:
      "A one-day celebration of global street food, spices and flavours in Hull's Beverley Road area. Over 30 traders bringing cuisines from across the world — from South Asian street food to Caribbean, West African and Middle Eastern dishes. Free entry.",
    category: "Food & Drink",
    startDate: "2026-06-06",
    startTime: "11:00",
    endTime: "18:00",
    locationName: "Haris & Co Supermarket",
    address: "Terry Street, off Beverley Road, Hull HU3 1TY",
    price: "Free",
    isFree: true,
    featuredImage: "photo-1555939594-58d7cb561ad1",
    status: "published",
    isFeatured: true,
    isSponsored: false,
  },
];

export const seedListings: Listing[] = [
  {
    id: "l1",
    name: "The Deep",
    slug: "the-deep",
    description:
      "One of Europe's most spectacular aquariums, built at the confluence of the Rivers Hull and Humber. Home to over 3,500 fish and 40 sharks across 87 metres of underwater tunnels and two million litres of water. An architectural landmark as well as one of the UK's great visitor attractions.",
    category: "Attractions",
    area: "Waterfront",
    address: "Tower Street, Hull HU1 4DP",
    latitude: 53.7421,
    longitude: -0.3253,
    openingHours: "Daily 10:00–17:00",
    website: "https://www.thedeep.co.uk",
    featuredImage:
      "https://upload.wikimedia.org/wikipedia/commons/e/e2/The_Deep%2C_Kingston_upon_Hull_May24_%28cropped%29.jpg",
    hours: {
      mon: { open: "10:00", close: "17:00" },
      tue: { open: "10:00", close: "17:00" },
      wed: { open: "10:00", close: "17:00" },
      thu: { open: "10:00", close: "17:00" },
      fri: { open: "10:00", close: "17:00" },
      sat: { open: "10:00", close: "18:00" },
      sun: { open: "10:00", close: "18:00" },
    },
    isFeatured: true,
    isHiddenGem: false,
    isIndependent: false,
    isVerified: true,
  },
  {
    id: "l2",
    name: "Ferens Art Gallery",
    slug: "ferens-art-gallery",
    description:
      "Hull's flagship public gallery holds a permanent collection spanning seven centuries of European and British art, including Old Masters, portraits, marine paintings and a strong contemporary programme. Transformed during City of Culture 2017, the Ferens hosts major loan exhibitions and is free to enter.",
    category: "Attractions",
    area: "City Centre",
    address: "Queen Victoria Square, Hull HU1 3RA",
    latitude: 53.7444,
    longitude: -0.3392,
    openingHours: "Mon–Sat 10:00–17:00, Sun 11:00–16:30",
    website: "https://www.hullmuseums.co.uk/ferens",
    featuredImage:
      "https://upload.wikimedia.org/wikipedia/commons/e/e0/Ferens_Art_Gallery_Apr23.jpg",
    hours: {
      mon: { open: "10:00", close: "17:00" },
      tue: { open: "10:00", close: "17:00" },
      wed: { open: "10:00", close: "17:00" },
      thu: { open: "10:00", close: "17:00" },
      fri: { open: "10:00", close: "17:00" },
      sat: { open: "10:00", close: "17:00" },
      sun: { open: "11:00", close: "16:30" },
    },
    isFeatured: true,
    isHiddenGem: false,
    isIndependent: false,
    isVerified: true,
  },
  {
    id: "l3",
    name: "Hull Truck Theatre",
    slug: "hull-truck-theatre",
    description:
      "One of the UK's leading producing theatres, Hull Truck has been developing and staging new writing for over fifty years. Its Ferensway building — opened in 2009 — houses a 440-seat main auditorium and a flexible studio space. The theatre programmes a mix of world premieres, co-productions with major UK companies, and community work rooted in Hull.",
    category: "Attractions",
    area: "City Centre",
    address: "50 Ferensway, Hull HU2 8LB",
    latitude: 53.7462,
    longitude: -0.344,
    openingHours: "Box office Mon–Sat 10:00–18:00 (performance days until late)",
    website: "https://www.hulltruck.co.uk",
    phone: "01482 323638",
    featuredImage: "https://upload.wikimedia.org/wikipedia/commons/7/7c/New_Hull_Truck_Theatre.JPG",
    hours: {
      mon: { open: "10:00", close: "18:00" },
      tue: { open: "10:00", close: "18:00" },
      wed: { open: "10:00", close: "18:00" },
      thu: { open: "10:00", close: "18:00" },
      fri: { open: "10:00", close: "18:00" },
      sat: { open: "10:00", close: "18:00" },
      sun: null,
    },
    isFeatured: true,
    isHiddenGem: false,
    isIndependent: false,
    isVerified: true,
  },
  {
    id: "l4",
    name: "Humber Street Gallery",
    slug: "humber-street-gallery",
    description:
      "A contemporary visual arts gallery at the heart of Hull's Fruit Market creative quarter. Humber Street Gallery presents a rolling programme of exhibitions by British and international artists, with a focus on emerging talent alongside established names. Free entry, with a well-regarded café on the ground floor.",
    category: "Attractions",
    area: "Marina",
    address: "64 Humber Street, Hull HU1 1TU",
    latitude: 53.7411,
    longitude: -0.3367,
    openingHours: "Tue–Sun 10:00–17:00",
    website: "https://www.humberstreetgallery.co.uk",
    featuredImage: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Humber_Street_Gallery.jpg",
    hours: {
      mon: null,
      tue: { open: "10:00", close: "17:00" },
      wed: { open: "10:00", close: "17:00" },
      thu: { open: "10:00", close: "17:00" },
      fri: { open: "10:00", close: "17:00" },
      sat: { open: "10:00", close: "17:00" },
      sun: { open: "10:00", close: "17:00" },
    },
    isFeatured: true,
    isHiddenGem: false,
    isIndependent: true,
    isVerified: true,
  },
  {
    id: "l5",
    name: "The Minerva Hotel",
    slug: "the-minerva-hotel",
    description:
      "Hull's oldest pub, Grade II listed and perched at the end of Nelson Street with uninterrupted views across the Humber. Dating to 1830, the Minerva is a proper waterfront local with a long bar, regular live music, and a terrace that's one of the finest spots in the city on a summer evening. Real ales, straightforward food, no fuss.",
    category: "Drink",
    area: "Old Town",
    address: "Nelson Street, Hull HU1 1XE",
    latitude: 53.7392,
    longitude: -0.3396,
    openingHours: "Mon–Sun 11:00–23:00",
    featuredImage: "https://upload.wikimedia.org/wikipedia/commons/9/93/The_Minerva.jpg",
    hours: {
      mon: { open: "11:00", close: "23:00" },
      tue: { open: "11:00", close: "23:00" },
      wed: { open: "11:00", close: "23:00" },
      thu: { open: "11:00", close: "23:00" },
      fri: { open: "11:00", close: "00:00" },
      sat: { open: "11:00", close: "00:00" },
      sun: { open: "12:00", close: "22:30" },
    },
    isFeatured: false,
    isHiddenGem: false,
    isIndependent: true,
    isVerified: true,
  },
  {
    id: "l6",
    name: "Furley & Co",
    slug: "furley-and-co",
    description:
      "Wood-fired pizzas, natural wine and a courtyard made for long evenings in Hull's Old Town. Furley & Co has built a loyal following since opening, with a menu that changes with the seasons and a wine list that takes independent producers seriously. Booking recommended at weekends.",
    category: "Eat",
    area: "Old Town",
    address: "Princes Dock Street, Hull HU1 2JZ",
    latitude: 53.743,
    longitude: -0.3372,
    openingHours: "Wed–Sun 17:00–23:00",
    website: "https://www.furleyandco.co.uk",
    featuredImage: "photo-1513104890138-7c749659a591",
    hours: {
      mon: null,
      tue: null,
      wed: { open: "17:00", close: "23:00" },
      thu: { open: "17:00", close: "23:00" },
      fri: { open: "17:00", close: "23:30" },
      sat: { open: "12:00", close: "23:30" },
      sun: { open: "12:00", close: "22:00" },
    },
    isFeatured: false,
    isHiddenGem: false,
    isIndependent: true,
    isVerified: true,
  },
];

export const seedOffers: Offer[] = [
  {
    id: "o1",
    title: "Mid-Week Burger Deal — 20% off",
    listingId: "l1",
    businessName: "Dope Burger",
    description:
      "20% off any burger and fries combo Mon–Wed after 5pm. Just show the code at the till.",
    terms: "One redemption per visit. Cannot be combined with other offers.",
    code: "HUNOW20",
    startDate: "2026-05-01",
    endDate: "2026-07-31",
    redemptionCount: 142,
    category: "Food",
    status: "active",
  },
  {
    id: "o2",
    title: "Free Pastry With Your First Coffee",
    listingId: "l2",
    businessName: "Two Gingers Coffee",
    description: "Try us out — first coffee comes with a free pastry of the day.",
    terms: "New customers only. Dine in.",
    code: "FIRSTSIP",
    startDate: "2026-05-15",
    endDate: "2026-08-31",
    redemptionCount: 67,
    category: "Drink",
    status: "active",
  },
  {
    id: "o3",
    title: "2-for-1 Pizzas Sunday Nights",
    listingId: "l5",
    businessName: "Furley & Co",
    description: "Bring a friend and split the bill — every Sunday from 5pm.",
    terms: "Cheapest pizza free. Walk-ins only.",
    code: "SUNDAYSLICE",
    startDate: "2026-04-01",
    endDate: "2026-09-30",
    redemptionCount: 213,
    category: "Food",
    status: "active",
  },
  {
    id: "o4",
    title: "10% off any book",
    listingId: "l4",
    businessName: "Beasley's Bookshop",
    description: "Show the code at checkout for 10% off any single book.",
    terms: "Not valid on second-hand or sale items.",
    code: "READHULL",
    startDate: "2026-05-01",
    endDate: "2026-12-31",
    redemptionCount: 41,
    category: "Shopping",
    status: "active",
  },
];

export const seedSubmissions: Submission[] = [
  {
    id: "s1",
    type: "event",
    title: "Drum & Bass Warehouse Party",
    contactName: "Joe Adams",
    contactEmail: "joe@example.com",
    data: { date: "2026-06-21", venue: "The Welly", category: "Music" },
    status: "pending",
    createdAt: "2026-05-30",
  },
  {
    id: "s2",
    type: "listing",
    title: "Northbank Records",
    contactName: "Sara Lin",
    contactEmail: "sara@example.com",
    data: { category: "Shops", area: "Old Town" },
    status: "pending",
    createdAt: "2026-05-29",
  },
];

export const seedAds: AdPlacement[] = [
  {
    id: "ad1",
    advertiserName: "Hull City Council",
    placement: "Homepage Hero Sponsor",
    image: "photo-1497366216548-37526070297c",
    url: "https://example.com",
    startDate: "2026-05-01",
    endDate: "2026-07-01",
    impressions: 24500,
    clicks: 412,
    status: "active",
  },
  {
    id: "ad2",
    advertiserName: "Princes Quay",
    placement: "Sidebar Ad",
    image: "photo-1441986300917-64674bd600d8",
    url: "https://example.com",
    startDate: "2026-05-15",
    endDate: "2026-06-15",
    impressions: 8120,
    clicks: 96,
    status: "active",
  },
  {
    id: "ad3",
    advertiserName: "Humber Street Market",
    placement: "Homepage Inline Banner",
    image: "photo-1533174072545-7a4b6ad7a6c3",
    url: "https://example.com",
    startDate: "2026-06-01",
    endDate: "2026-08-31",
    impressions: 3200,
    clicks: 58,
    status: "active",
  },
];

export const seedMedia: MediaAsset[] = [
  {
    id: "m-hull-hero",
    url: "/hull-marina-hero.jpg",
    fileName: "hull-marina-hero.jpg",
    alt: "Hull Marina waterfront",
    credit: "Bernard Sharp / CC BY-SA 2.0",
    focalPoint: "center",
    createdAt: "2026-06-03",
  },
];
