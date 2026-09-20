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
  sport:
    "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1200&h=800&q=80",
  rugby:
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&h=800&q=80",
  football:
    "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1200&h=800&q=80",
  music:
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&h=800&q=80",
  "food & drink":
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&h=800&q=80",
  food: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&h=800&q=80",
  arts: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=1200&h=800&q=80",
  comedy:
    "https://images.unsplash.com/photo-1527224857830-43a7acc85260?auto=format&fit=crop&w=1200&h=800&q=80",
  family:
    "https://images.unsplash.com/photo-1472162072942-cd5147eb3902?auto=format&fit=crop&w=1200&h=800&q=80",
  theatre:
    "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=1200&h=800&q=80",
  nightlife:
    "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&h=800&q=80",
};

export const getCategoryFallback = (category?: string, title?: string): string => {
  const cat = (category || "").toLowerCase();
  const t = (title || "").toLowerCase();
  if (t.includes("hull kr") || t.includes("rugby") || t.includes("hull fc"))
    return CATEGORY_FALLBACKS.rugby;
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
    id: "article-hull-fair-opening-times-2026",
    title: "Hull Fair Opening Times 2026: Full Day-by-Day Schedule",
    slug: "hull-fair-opening-times-2026",
    excerpt:
      "The complete Hull Fair 2026 opening timetable for every day, including the Sunday closure and final Saturday.",
    content: `<h2>Hull Fair 2026 opening dates</h2>
<p>Hull Fair runs from <strong>Friday 9 October to Saturday 17 October 2026</strong> at Walton Street, Hull. The fair is closed on Sunday 11 October.</p>
<h2>Day-by-day opening times</h2>
<ul>
  <li><strong>Friday 9 October:</strong> 4:00 PM–11:00 PM</li>
  <li><strong>Saturday 10 October:</strong> 12:00 PM–11:00 PM</li>
  <li><strong>Sunday 11 October:</strong> Closed</li>
  <li><strong>Monday 12 to Friday 16 October:</strong> 2:00 PM–11:00 PM daily</li>
  <li><strong>Saturday 17 October:</strong> 12:00 PM–11:00 PM</li>
</ul>
<p>Individual rides and stalls may stop admitting customers before the site closes. Weather, safety requirements or operational decisions can also affect opening, so check current official announcements before travelling.</p>
<h2>Plan your visit</h2>
<p>Entry is free, while rides, games and food are priced individually. See the <a href="/hull-fair">complete Hull Fair guide</a> for parking, food, ride and family information, or read our <a href="/travel/hull-fair-buses-2026">Hull Fair buses guide</a>.</p>`,
    category: "Guides",
    tags: ["Hull Fair", "Opening Times", "Family", "What's On"],
    featuredImage: "/hull-fair-hero.jpg",
    author: "HU NOW Editorial Team",
    status: "published",
    isFeatured: false,
    isSponsored: false,
    readingMinutes: 2,
    publishedAt: "2026-09-13",
    section: "things-to-do",
    subcategory: "guides",
    seo: {
      title: "Hull Fair Opening Times 2026: Daily Timetable",
      description:
        "Hull Fair 2026 opening times for every day from 9–17 October, including the Sunday closure and weekday and Saturday hours.",
    },
  },
  {
    id: "article-hull-fair-buses-2026",
    title: "Hull Fair Buses 2026: Park & Ride and Travel Guide",
    slug: "hull-fair-buses-2026",
    excerpt:
      "How to reach Hull Fair by bus, including the two park-and-ride locations, service frequency and late-evening planning.",
    content: `<h2>Hull Fair 2026 by bus: what is confirmed?</h2>
<p>Hull Fair runs from Friday 9 to Saturday 17 October 2026 at Walton Street, with no fair on Sunday 11 October. Hull City Council confirms two park-and-ride sites for the fair. Buses are scheduled every <strong>10–15 minutes</strong> and both sites are open until <strong>11pm each operating day</strong>. The council also says additional bus services will operate, but its fair information does not specify all routes, boarding stops, fares or the final return departure.</p>

<h2>Choose a park-and-ride site</h2>
<ul>
  <li><strong>Priory Park:</strong> Henry Boot Way, Hull <strong>HU4 7DY</strong>. This may suit drivers approaching via the A63 or west Hull. The regular Priory Park site has free parking; check the fair service fare before boarding.</li>
  <li><strong>Humber Bridge:</strong> Ferriby Road, Hessle <strong>HU13 0JG</strong>. This may suit visitors approaching from the bridge or Hessle.</li>
</ul>
<p>The <a href="https://www.hull.gov.uk/leisure/hull-fair/3" target="_blank" rel="noopener noreferrer">council's Hull Fair travel notice</a> is the source for the two locations, 10–15-minute frequency and 11pm site hours. Site closing time is <em>not</em> a promise that a bus leaves at exactly 11pm. Check the operator's return timetable and where to queue before entering the fair.</p>

<h2>Coming from Hull Paragon Interchange?</h2>
<p>The interchange is a useful starting point for local buses. The council confirms additional services for Hull Fair but does not publish a complete route list on its fair page. Use the current <a href="https://www.stagecoachbus.com/" target="_blank" rel="noopener noreferrer">Stagecoach</a> or <a href="https://www.eastyorkshirebuses.co.uk/" target="_blank" rel="noopener noreferrer">East Yorkshire Buses</a> journey planner for your date, including any diversions and the last journey back. Do not rely on a previous year's fair timetable or assume an ordinary service runs late enough for an 11pm fairground close.</p>

<h2>Before setting off</h2>
<ul>
  <li><strong>Check your return:</strong> note the stop location, route number and final departure before leaving the bus.</li>
  <li><strong>Check fares:</strong> parking and bus travel are separate; the council fair page does not list a universal 2026 shuttle fare.</li>
  <li><strong>Allow for closures:</strong> temporary restrictions affect Walton Street and surrounding roads, so boarding locations may differ from an ordinary day.</li>
  <li><strong>Allow extra time:</strong> 10–15 minutes is the advertised service frequency, not a guaranteed journey time or queue length.</li>
</ul>
<p>See the <a href="/guides/guide-to-parking-at-hull-fair">parking guide</a> for stadium parking and restrictions, the <a href="/guides/hull-fair-opening-times-2026">day-by-day timetable</a>, or the <a href="/hull-fair">main Hull Fair guide</a>.</p>`,
    category: "Guides",
    tags: ["Hull Fair", "Buses", "Park and Ride", "Travel"],
    featuredImage: "/hull-fair-hero.jpg",
    author: "HU NOW Editorial Team",
    status: "published",
    isFeatured: false,
    isSponsored: false,
    readingMinutes: 3,
    publishedAt: "2026-09-13",
    section: "community",
    subcategory: "travel",
    seo: {
      title: "Hull Fair Buses 2026: Park & Ride Information",
      description:
        "Hull Fair 2026 bus and park-and-ride guide, including Priory Park and Humber Bridge locations, service frequency and travel advice.",
    },
  },
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
      "Everything you need to know about parking for Hull Fair 2026 at Walton Street, including official park-and-ride locations, MKM Stadium parking and temporary road restrictions.",
    content: `<h2>The Essential Guide to Parking at Hull Fair 2026</h2>
<p>Hull Fair is one of Europe’s largest travelling fairs, bringing more than 250 rides and an array of attractions to Walton Street. Road closures and parking restrictions apply around the site, so travelling to the fair requires some advance planning.</p>
<p>Here is your complete guide to where to park, official park and ride services, matchday parking at the MKM Stadium, and council parking restrictions for Hull Fair 2026.</p>

<h2>Option 1: Official Hull Fair Park & Ride Services (Recommended)</h2>
<p>Hull City Council lists two dedicated <strong>Park & Ride services</strong> for Hull Fair, with buses running every 10–15 minutes and both sites open until 11:00 PM each day.</p>

<h3>1. Priory Park & Ride (West Hull / Hessle)</h3>
<ul>
  <li><strong>Postcode:</strong> HU4 7DY (Just off the A63 Clive Sullivan Way / Henry Boot Way)</li>
  <li><strong>Capacity:</strong> More than 650 parking spaces.</li>
  <li><strong>Buses:</strong> Hull City Council says Hull Fair park-and-ride buses run every 10–15 minutes and the site is open until 11:00 PM each day.</li>
  <li><strong>Parking Cost:</strong> Free to park; you only pay the bus fare.</li>
</ul>

<h3>2. Humber Bridge Park & Ride</h3>
<ul>
  <li><strong>Address:</strong> Ferriby Road, Hessle</li>
  <li><strong>Postcode:</strong> HU13 0JG</li>
  <li><strong>Buses:</strong> Hull City Council says services run every 10–15 minutes and the site is open until 11:00 PM each day.</li>
</ul>

<h2>Option 2: MKM Stadium Parking (5-Minute Walk)</h2>
<p>Hull City Council lists public parking at <strong>MKM Stadium</strong>, beside Walton Street Fairground. Availability may change, including on match days, so check the council's current notice before travelling.</p>
<ul>
  <li><strong>Access:</strong> Follow the council's current access directions and on-site signs.</li>
  <li><strong>Cost:</strong> Check Hull City Council’s current event information for the applicable charge.</li>
  <li><strong>Availability:</strong> Spaces may be limited at busy times, so allow extra time and keep a park-and-ride option in reserve.</li>
  <li><strong>Matchday Warning:</strong> Check the stadium fixture list and official traffic information before travelling.</li>
</ul>

<h2>Option 3: City Centre Multi-Storeys + Walk or Bus</h2>
<p>If you prefer to avoid the Walton Street traffic, city-centre parking followed by a walk or bus may be an alternative. Check each car park's current opening times, prices and availability before travelling.</p>
<ul>
  <li><strong>St Stephen’s Shopping Centre Car Park (HU2 8LN):</strong> Beside Hull Paragon Interchange.</li>
  <li><strong>Osborne Street Multi-Storey (HU1 2NW):</strong> Near Ferensway and Carr Lane.</li>
  <li><strong>Pryme Street Multi-Storey (HU2 8HR):</strong> A city-centre parking option.</li>
</ul>
<p>Additional bus services operate during Hull Fair. Check current operator timetables before travelling because routes and service numbers can change.</p>

<h2>Disabled & Blue Badge Parking</h2>
<p>Check Hull City Council’s current event information for accessible parking arrangements and follow the on-site signage. Display a valid Blue Badge wherever the applicable restrictions require it.</p>

<h2>Strict Enforcement: Residential Permit Zones (Avoid Costly Fines)</h2>
<p>During Hull Fair, Hull City Council publishes temporary road closures and permit-only parking restrictions on specified nearby roads, including:</p>
<ul>
  <li>Walton Street, Lowther Street, and Walliker Street</li>
  <li>Paisley Street, Lonsdale Street, and Sandringham Street</li>
  <li>Granville Street, Perry Street, Ruskin Street, and Arthur Street</li>
  <li>Little Anlaby Road between Perry Street and the West Park access gates</li>
</ul>
<p>Restrictions and timings can change, so check Hull City Council’s current Hull Fair road-closure page before travelling. <strong>Please respect local residents and use the official park-and-ride or stadium parking instead.</strong></p>

<h2>Plan Your Visit to Hull Fair 2026</h2>
<p>Hull Fair 2026 runs from <strong>Friday 9 October through Saturday 17 October 2026</strong> (closed Sunday 11 October). It opens at 4:00 PM on the first Friday, 12 noon on both Saturdays, and 2:00 PM Monday to Friday, closing at 11:00 PM each night.</p>
<p>For full event details and the day-by-day timetable, see our <a href="/hull-fair">Hull Fair 2026 guide</a>. Before setting off, check the <a href="https://www.hull.gov.uk/leisure/hull-fair/3" target="_blank" rel="noopener noreferrer">council's current road closures and parking restrictions</a> and <a href="https://www.hull.gov.uk/leisure/hull-fair" target="_blank" rel="noopener noreferrer">official opening times</a>.</p>`,
    category: "Guides",
    subcategory: "guides",
    section: "things-to-do",
    author: "HU NOW Editorial Team",
    readingMinutes: 4,
    featuredImage: "/hull-fair-hero.jpg",
    status: "published",
    publishedAt: "2026-09-03",
    tags: ["Hull Fair", "Parking", "Walton Street", "Park and Ride", "Guides"],
    isFeatured: true,
    isSponsored: false,
    seo: {
      title: "Hull Fair 2026 Parking: Park & Ride & Road Closures",
      description:
        "Where to park for Hull Fair 2026: Priory Park and Humber Bridge park-and-ride details, MKM Stadium parking and official road restrictions.",
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
    tags: [
      "Christmas",
      "Hull Christmas Markets",
      "Beverley Festival of Christmas",
      "Light Switch On",
      "Guides",
    ],
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
    title: "Hull Fireworks 2026: Bonfire Night Displays, Dates & Tickets",
    slug: "hull-bonfire-night-fireworks-guide-2026",
    excerpt:
      "Find verified Bonfire Night displays near Hull for 2026, with confirmed dates and tickets clearly separated from locations awaiting an announcement.",
    content: `<h2>Hull Fireworks and Bonfire Night 2026</h2>
<p>Looking for fireworks in Hull tonight or a Bonfire Night display near you? This guide tracks confirmed organised displays across Hull and East Yorkshire for November 2026. Details are checked against organiser information and updated as tickets and timings are announced.</p>

<h2>Confirmed: Brantingham Park Fireworx Extravaganza 2026</h2>
<p>Brantingham Park's annual family fireworks event is confirmed for <strong>Thursday 5 November 2026</strong>. It includes indoor areas, catering outlets, a children's disco and free face painting before the main display by Eastern Pyro Ltd.</p>
<ul>
  <li><strong>Date:</strong> Thursday 5 November 2026</li>
  <li><strong>Event time:</strong> 5:00 PM–9:00 PM</li>
  <li><strong>Fireworks:</strong> 7:15 PM prompt</li>
  <li><strong>Location:</strong> Brantingham Park, Brantingham Road, Elloughton HU15 1HX</li>
  <li><strong>Tickets:</strong> Advance ticket required; there is no pay-on-the-day admission</li>
  <li><strong>Parking:</strong> Free on-site parking</li>
</ul>

<h2>Hull and East Yorkshire Displays Awaiting 2026 Confirmation</h2>
<p>At the time of our latest check, organisers had not published authoritative 2026 details for the following previous display locations. They are listed as watch points, not confirmed events:</p>
<ul>
  <li><strong>Sewell Group Craven Park, East Hull:</strong> no confirmed public 2026 fireworks announcement found yet.</li>
  <li><strong>Beverley Westwood:</strong> no confirmed 2026 date, admission or organiser announcement found yet.</li>
  <li><strong>Swanland and West Hull:</strong> no confirmed public 2026 community display details found yet.</li>
</ul>
<p>We will add confirmed dates, ticket links and start times here as organisers publish them. Do not travel based on previous years' schedules.</p>

<h2>Are There Fireworks in Hull Tonight?</h2>
<p>This is a dated 2026 guide, not a live tonight listing. Brantingham Park is scheduled for Thursday 5 November at 7:15 PM; check the date and the organiser's latest information before travelling.</p>

<p><strong>Source:</strong> <a href="https://www.eventbrite.com/e/2026-fireworx-extravaganza-tickets-2000150996473" target="_blank" rel="noopener noreferrer">Brantingham Park's 2026 organiser listing</a>. Times, availability and event arrangements can change.</p>

<h2>Bonfire Night Safety and Visiting Tips</h2>
<ul>
  <li><strong>Arrive early:</strong> Allow extra time for queues and local traffic before the display.</li>
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
    tags: [
      "Bonfire Night",
      "Hull Fireworks 2026",
      "Fireworks Near Me",
      "Brantingham Park",
      "Guides",
    ],
    isFeatured: true,
    isSponsored: false,
    seo: {
      title: "Hull Fireworks 2026: Bonfire Night Displays & Tickets",
      description:
        "Verified Bonfire Night displays near Hull for 2026, with organiser links, ticket details and clear updates on unconfirmed locations.",
    },
  },
  {
    id: "article-best-sunday-roasts-hull-east-yorkshire",
    title: "Best Sunday Dinner in Hull: Sunday Roasts & Pub Lunches 2026",
    slug: "best-sunday-roasts-hull-east-yorkshire",
    excerpt:
      "Looking for the best Sunday dinner in Hull? Discover Sunday roasts, pub lunches, Yorkshire puddings and country inns to book in Hull and East Yorkshire.",
    content: `<h2>Where to find Sunday lunch in Hull and East Yorkshire</h2>
<p>Looking for a Sunday roast in Hull? Start by choosing between a city-centre pub and a country dining trip. Menus, serving hours and prices change, so this guide separates venues with a published Sunday offer from places where you should confirm the current menu before booking.</p>

<h2>Sunday-roast options with published information</h2>
<h3>The Green Dragon, Welton</h3>
<p>The Green Dragon advertises a Sunday roast on its <a href="https://www.greendragonpubwelton.co.uk/" target="_blank" rel="noopener noreferrer">official pub website</a>. The venue is at Cowgate, Welton, HU15 1NB, with parking and accessible access listed among its facilities. This is a practical option if you want a village pub outside central Hull. Check its current Sunday menu, price and table availability before travelling.</p>

<h3>The Pipe and Glass, South Dalton</h3>
<p>The Pipe and Glass publishes a separate <a href="https://www.pipeandglass.co.uk/menus" target="_blank" rel="noopener noreferrer">Sunday lunch menu</a> and lists Sunday food service from noon to 4pm. It is at West End, South Dalton, HU17 7PN. The restaurant recommends booking ahead; its bar is walk-in. Check the current menu if you are specifically after a traditional roast or need a vegetarian or vegan option.</p>

<h2>Hull and West Hull places to check directly</h2>
<h3>The Minerva, Hull waterfront</h3>
<p>The Minerva has published a <a href="https://minerva-hull.co.uk/onewebmedia/Minerva%20Menu%20A3%20Folded%20Cream%202024.pdf" target="_blank" rel="noopener noreferrer">Sunday-roast menu</a>, but that document is dated 2024. Treat it as evidence of a past offering, not confirmation of this Sunday's dishes, prices or opening hours. Ask the pub for the current menu before making a special journey.</p>

<h3>The Lion &amp; Key, Hull Old Town</h3>
<p>The Lion &amp; Key is a High Street pub with food service, but we have not verified a current dedicated Sunday-roast menu. Use its <a href="https://www.the-lionandkey-hull.foodndrink.uk/" target="_blank" rel="noopener noreferrer">venue page</a> to check contact and opening details, then ask what is being served this Sunday.</p>

<h3>The Wheatsheaf, Kirk Ella</h3>
<p>The Wheatsheaf lists Sunday food service on its <a href="https://www.wheatsheafkirkella.co.uk/menus" target="_blank" rel="noopener noreferrer">official menus page</a>. It does not establish a fixed roast selection for every Sunday, so check the live menu or call the pub for today's dishes and dietary options.</p>

<h2>Before you book</h2>
<ul>
  <li><strong>Confirm the roast:</strong> A pub being open for Sunday food does not guarantee a roast is on the menu that week.</li>
  <li><strong>Check timings and price:</strong> Kitchens can have different hours from the bar, and menus change seasonally.</li>
  <li><strong>Ask about allergies:</strong> Contact the venue directly about ingredients and cross-contact; do not rely on a general online guide.</li>
  <li><strong>Plan the journey:</strong> South Dalton and Welton are outside Hull city centre, so check travel options if you are not driving.</li>
</ul>
<p><em>Venue information checked 20 September 2026. We have not independently tasted or ranked these roasts; “best” is a search-friendly guide to options, not an unverified award.</em></p>`,
    category: "Guides",
    subcategory: "guides",
    section: "food-and-drink",
    author: "HU NOW Food & Drink Team",
    readingMinutes: 5,
    featuredImage: "photo-1635897411141-7bd2b9c6ab16",
    status: "published",
    publishedAt: "2026-09-03",
    tags: ["Sunday Roast", "Food & Drink", "Old Town", "Pubs", "East Yorkshire", "Guides"],
    isFeatured: true,
    isSponsored: false,
    seo: {
      title: "Best Sunday Dinner in Hull 2026: Sunday Roast Guide",
      description:
        "Find the best Sunday dinner in Hull and East Yorkshire, from classic Sunday roasts and pub lunches to vegetarian options and country inns. Includes booking tips.",
    },
  },
  {
    id: "article-free-things-to-do-with-kids-in-hull",
    title: "Free Things to Do with Kids in Hull: The Ultimate Family Day Out Guide",
    slug: "free-things-to-do-with-kids-in-hull",
    excerpt:
      "Looking for budget-friendly family days out? From the free Streetlife Museum and Ferens Art Gallery to East Park's splash boat and animal walk, here are Hull's best free activities for kids.",
    content: `<h2>Great Family Days Out That Won't Cost a Penny</h2>
<p>Entertaining kids during school holidays or rainy weekends doesn't need to break the bank. Hull is one of the most generous cities in the UK for free culture and open-air family attractions, with world-class museums that charge zero admission fee.</p>

<h2>1. Streetlife Museum of Transport (Hull Museums Quarter)</h2>
<p>Step through 200 years of transport history in the heart of Old Town. Kids can climb aboard a genuine 1940s Hull electric tram, sit inside historic horse-drawn carriages, and wander through a full-scale reconstruction of a Victorian high street complete with traditional sweet shops and vintage bicycles.</p>
<ul>
  <li><strong>Admission:</strong> 100% Free</li>
  <li><strong>Location:</strong> High Street, Hull Old Town (HU1 1PS)</li>
  <li><strong>Highlights:</strong> Carriage simulator ride, interactive horse stable, and pram-friendly lifts throughout.</li>
</ul>

<h2>2. East Park & Animal Education Centre (Holderness Road)</h2>
<p>Covering 130 acres, East Park is Hull's flagship green space. The park features an extensive free Animal Education Centre where children can see deer, wallabies, exotic birds, and farm animals up close. In warmer months, the modern water splash park is a summer favourite for toddlers and children.</p>
<ul>
  <li><strong>Cost:</strong> Free entry to park and animal centre</li>
  <li><strong>Facilities:</strong> Children's play areas, large boating lake, cafe, and free parking.</li>
</ul>

<h2>3. Ferens Art Gallery & Explore Art Zone</h2>
<p>Located in Queen Victoria Square, the award-winning Ferens Art Gallery houses a dedicated Children's Gallery designed specifically for young visitors. Children can touch interactive tactile displays, try dressing-up boxes, and participate in regular weekend craft workshops.</p>
<ul>
  <li><strong>Admission:</strong> Free</li>
  <li><strong>Bonus:</strong> Baby-changing facilities and child-friendly cafe on site.</li>
</ul>

<h2>4. Hull and East Riding Museum (Woolly Mammoth & Roman Mosaics)</h2>
<p>Walk beneath a life-sized replica of a prehistoric woolly mammoth, step inside an authentic Iron Age roundhouse, and discover stunning Roman mosaics excavated from local East Yorkshire villa sites.</p>
<ul>
  <li><strong>Admission:</strong> Free</li>
  <li><strong>Location:</strong> Museums Quarter (next door to Streetlife)</li>
</ul>

<h2>5. Humber Bridge Country Park (The Little Swiss)</h2>
<p>Set in a former chalk quarry beneath the majestic towers of the Humber Bridge, this 48-acre nature reserve offers gentle walking trails through woodland, meadows, and pond habitats. Kids love spotting wildlife along the cliff nature walks and picnicking on the open lawns.</p>
<ul>
  <li><strong>Cost:</strong> Free entry & free parking</li>
  <li><strong>Location:</strong> Ferriby Road, Hessle (HU13 0HB)</li>
</ul>`,
    category: "Guides",
    subcategory: "guides",
    section: "things-to-do",
    author: "HU NOW Family Team",
    readingMinutes: 5,
    featuredImage: "photo-1472162072942-cd5147eb3902",
    status: "published",
    publishedAt: "2026-09-03",
    tags: ["Family", "Free Things To Do", "Kids", "East Park", "Museums", "Guides"],
    isFeatured: true,
    isSponsored: false,
    seo: {
      title: "Free Things to Do with Kids in Hull: Best Family Days Out Guide",
      description:
        "Ultimate guide to free family activities and kids days out in Hull. Free museums, East Park animals, Ferens Art Gallery, and nature trails.",
    },
  },
  {
    id: "article-dog-friendly-pubs-cafes-hull",
    title:
      "Dog-Friendly Pubs and Cafes in Hull & East Yorkshire: Where Four-Legged Friends Are Welcome",
    slug: "dog-friendly-pubs-cafes-hull",
    excerpt:
      "A complete guide to dog-friendly pubs, craft taprooms, and cafes in Hull and East Yorkshire. Free dog treats, sheltered courtyards, and scenic dog walks nearby.",
    content: `<h2>Where Dogs Are Welcomed as Part of the Family</h2>
<p>Hull and East Yorkshire are fantastic areas for dog owners. From historic cobblestone Old Town courtyards to bustling artisan cafes along Humber Street, there is no need to leave your four-legged companion at home. Here is our curated guide to the best spots for dog-friendly pints, coffee, and weekend lunches.</p>

<h2>1. The Sailmakers Arms (High Street, Hull Old Town)</h2>
<p>The Sailmakers Arms is celebrated for its sheltered outdoor courtyard and welcoming attitude towards well-behaved dogs. Bar staff always have dog treats and fresh water bowls on hand while owners enjoy local real ales and Sunday roasts.</p>
<ul>
  <li><strong>Walk:</strong> Pair with a stroll along the historic Old Town High Street and River Hull footpath.</li>
</ul>

<h2>2. Thieving Harry's (Humber Street, Fruit Market)</h2>
<p>Overlooking the Hull Marina basin, Thieving Harry's is a favourite weekend morning haunt for dog walkers. Dogs are warmly welcomed both inside and at the outdoor street tables. Enjoy artisan coffee, loaded breakfast toasties, and fresh bakes with your pooch by your side.</p>
<ul>
  <li><strong>Walk:</strong> Walk around the marina pier and along the promenade to Victoria Dock.</li>
</ul>

<h2>3. The Minerva Hotel (Nelson Street Pier)</h2>
<p>After letting your dog stretch its legs along the Humber waterfront, head into The Minerva for a pint by the open coal fire. Dogs are welcome in the traditional front bar area.</p>

<h2>4. Atom Bar (Princes Avenue, Hull & Beverley)</h2>
<p>Independent local brewery Atom crafts world-class beers and welcomes dogs in both their Hull Princes Avenue bar and their historic Beverley town centre taproom. Clean, friendly, and laid-back.</p>

<h2>5. Beverley Westwood & Country Pubs</h2>
<p>Take your dog for an off-lead run across the open pasture of the Beverley Westwood, then retreat into dog-friendly historic pubs like <strong>The Woolpack</strong> or <strong>The Monks Walk</strong> for a well-earned drink.</p>`,
    category: "Guides",
    subcategory: "guides",
    section: "food-and-drink",
    author: "HU NOW Editorial Team",
    readingMinutes: 4,
    featuredImage: "photo-1583511655857-d19b40a7a54e",
    status: "published",
    publishedAt: "2026-09-03",
    tags: ["Dog Friendly", "Pubs", "Cafes", "Old Town", "Fruit Market", "Guides"],
    isFeatured: true,
    isSponsored: false,
    seo: {
      title: "Dog-Friendly Pubs and Cafes in Hull & East Yorkshire: Curated Guide",
      description:
        "The ultimate guide to dog-friendly pubs, cafes, and bars in Hull and East Yorkshire. Free treats, water bowls, outdoor courtyards, and nearby walking routes.",
    },
  },
  {
    id: "article-mkm-stadium-matchday-guide-hull-city-hull-fc",
    title: "MKM Stadium Matchday Guide: Parking, Pubs & Tips for Hull City & Hull FC Fans",
    slug: "mkm-stadium-matchday-guide-hull-city-hull-fc",
    excerpt:
      "Heading to the MKM Stadium for Hull City AFC or Hull FC? Here is your complete matchday guide: official car parking prices, away-friendly pubs, train travel, and turnstile tips.",
    content: `<h2>The Complete MKM Stadium Matchday Guide</h2>
<p>The 25,586-capacity <strong>MKM Stadium (formerly KC Stadium)</strong> is the shared home of football Championship club <strong>Hull City AFC</strong> and Super League rugby club <strong>Hull FC</strong>. Situated inside the green expanse of West Park, reaching the stadium and enjoying the matchday atmosphere is easy when you know the local territory.</p>

<h2>1. Getting to the Stadium</h2>
<ul>
  <li><strong>By Train:</strong> Hull Paragon Interchange is approximately a 20-minute signposted walk from the stadium via the tree-lined pedestrian footbridge crossing directly into West Park.</li>
  <li><strong>By Bus:</strong> Frequent buses run along Anlaby Road from the city centre interchange (services 2, 3, 4, 57, and 66) dropping off outside West Park.</li>
  <li><strong>By Car:</strong> From the M62/A63 Clive Sullivan Way, follow signs for MKM Stadium / KC Stadium onto the Daltry Street flyover towards Anlaby Road.</li>
</ul>

<h2>2. Matchday Parking Options</h2>
<ul>
  <li><strong>Stadium Car Park (Walton Street):</strong> Located adjacent to the ground inside West Park. Parking costs £5 per car (cash and contactless accepted). Please note: on evening matches, the car park fills quickly, so arrive at least 60 minutes before kick-off.</li>
  <li><strong>Priory Park & Ride (HU4 7DY):</strong> Matchday shuttle buses operate from the Priory Park & Ride off the A63 directly to the stadium.</li>
  <li><strong>City Centre Multi-Storeys:</strong> St Stephen's (HU2 8LN) and Osborne Street car parks provide secure 24/7 parking a short walk or bus ride away.</li>
  <li><strong>Warning:</strong> Residential streets surrounding the stadium have strict residents-only permit parking schemes enforced on matchdays.</li>
</ul>

<h2>3. Matchday Pubs & Food</h2>
<ul>
  <li><strong>Home Fans:</strong> The Boot Room, The Walton Street Social Club, and Anlaby Road pubs fill with black-and-amber faithful before kickoff.</li>
  <li><strong>Away Fans:</strong> The city centre pubs surrounding Hull Paragon Interchange (such as The Admiral of the Humber, The Hop & Vine, and Minerva Pier) welcome visiting supporters without incident.</li>
  <li><strong>Food Inside Ground:</strong> Traditional Hull patties, hot pies, burgers, and hot drinks are available across all concourses. Contactless payments are accepted at all kiosks.</li>
</ul>`,
    category: "Guides",
    subcategory: "guides",
    section: "things-to-do",
    author: "HU NOW Sports Team",
    readingMinutes: 5,
    featuredImage: "photo-1522778119026-d647f0596c20",
    status: "published",
    publishedAt: "2026-09-03",
    tags: ["Hull City", "Hull FC", "MKM Stadium", "Matchday Guide", "Parking", "Guides"],
    isFeatured: true,
    isSponsored: false,
    seo: {
      title: "MKM Stadium Matchday Guide: Parking, Pubs & Visiting Fans",
      description:
        "Complete matchday guide for Hull City AFC and Hull FC at the MKM Stadium. Official car parking prices, away-friendly pubs, directions from Paragon Station.",
    },
  },
  {
    id: "article-new-years-eve-hull-2026-parties-events",
    title: "Where to Celebrate New Year's Eve 2026/2027 in Hull: Parties, Dinners & Club Nights",
    slug: "new-years-eve-hull-2026-parties-events",
    excerpt:
      "Plan your New Year's Eve in Hull. From riverside midnight gatherings at Hull Marina and historic Old Town pub trails to ticketed galas, club nights, and celebratory dining.",
    content: `<h2>Ring in 2027 in Style Across Kingston upon Hull</h2>
<p>Whether you want a lively countdown on the cobblestones of Old Town, a glamorous black-tie dining banquet overlooking the marina, or an all-night alternative music party, Hull offers an electric atmosphere for New Year's Eve. Here is your definitive guide to celebrating NYE in Hull.</p>

<h2>1. Hull Marina & Humber Street Midnight Countdown</h2>
<p>The Fruit Market and Hull Marina basin form the focal point for many revellers at midnight. Bars and restaurants along Humber Street — from craft taprooms to cocktail lounges — host special ticketed parties with DJs, live music, and midnight champagne toasts before crowds gather by the water to watch midnight fireworks across the estuary.</p>

<h2>2. Old Town Historic Pub Trail</h2>
<p>For those who love real ale, crackling log fires, and traditional British hospitality, Old Town's historic taverns offer an unbeatable pub crawl on New Year's Eve. Pop into <strong>The Minerva</strong>, <strong>The Lion & Key</strong>, <strong>The Sailmakers Arms</strong>, and <strong>Ye Olde White Harte</strong>. Arrive early to secure your spot as bars fill to capacity by 9:00 PM.</p>

<h2>3. Live Music & Alternative Countdowns</h2>
<ul>
  <li><strong>The New Adelphi Club (De Grey Street):</strong> Hull's legendary grassroots venue hosts its annual New Year's Eve party featuring local indie bands, garage rock, and an unpretentious party crowd.</li>
  <li><strong>The Welly Club (Beverley Road):</strong> The city's famous indie and alternative club night with three rooms of rock, pop-punk, and retro anthems until 4:00 AM.</li>
  <li><strong>Connexin Live (Myton Street):</strong> Check the arena calendar for major headline touring concerts and big band gala celebrations.</li>
</ul>

<h2>4. Celebratory Dining: Where to Book</h2>
<p>Hull's top independent restaurants offer bespoke multi-course tasting menus on New Year's Eve. Booking early (by mid-November) is critical for Old Town and Humber Street dining rooms. Look out for festive menus with wine pairings and midnight bubbles.</p>

<h2>NYE Travel Advice in Hull</h2>
<ul>
  <li><strong>Taxis:</strong> Taxis on New Year's Eve are in extremely high demand between 12:30 AM and 3:30 AM. Pre-book your ride home or agree a designated driver in advance.</li>
  <li><strong>Buses:</strong> East Yorkshire Buses operate special evening timetables on 31 December with services tapering off around 8:00 PM; plan your travel ahead of time.</li>
</ul>`,
    category: "Guides",
    subcategory: "guides",
    section: "whats-on",
    author: "HU NOW What's On Team",
    readingMinutes: 4,
    featuredImage: "photo-1467810563316-b5476525c0f9",
    status: "published",
    publishedAt: "2026-09-03",
    tags: ["New Years Eve", "NYE Hull", "Parties", "Nightlife", "Old Town", "Guides"],
    isFeatured: true,
    isSponsored: false,
    seo: {
      title: "New Year's Eve 2026/2027 in Hull: Best Parties, Dinners & Events",
      description:
        "Complete guide to New Year's Eve in Hull. Humber Street parties, Old Town pub trails, live music countdowns, celebratory dining, and taxi tips.",
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
    title: "Best Brunch in Hull: 8 Places for a Saturday Morning",
    slug: "best-brunches-hull-saturday",
    excerpt:
      "Eight independent Hull brunch spots for Saturday morning, from Humber Street bakeries and big breakfasts to vegan plates and excellent coffee.",
    content: `<p>Hull has several genuinely different ways to do brunch. You can settle in for eggs and coffee beside the Marina, pick up pastries on Humber Street, order a generous cooked breakfast on Princes Avenue, or build a completely vegan morning around Newland Avenue.</p>

<p>This guide focuses on places that publish enough current information for you to plan a Saturday visit. Menus, prices and opening hours can change, so use the linked venue website for a final check before making a special journey.</p>

<h2>Hull brunch: the quick shortlist</h2>
<ul>
  <li><strong>Best all-rounder:</strong> Thieving Harry's, Humber Street</li>
  <li><strong>Best for fresh baking:</strong> Flour & Feast, Humber Street</li>
  <li><strong>Best vegan brunch:</strong> Barleys, Newland Avenue</li>
  <li><strong>Best for a large group:</strong> Garbutts, Princes Avenue</li>
  <li><strong>Best for speciality coffee:</strong> The Barista, Newland Avenue</li>
  <li><strong>Best city-centre coffee stop:</strong> Brew, Bond Street</li>
</ul>

<h2>1. Thieving Harry's, Humber Street</h2>
<p><a href="https://www.thievingharrys.co.uk/" target="_blank" rel="noopener noreferrer">Thieving Harry's</a> is the clearest choice when you want a full sit-down brunch in Hull's <a href="/areas/fruit-market">Fruit Market</a>. Its own description is refreshingly direct: it specialises in brunch, egg dishes and good coffee. The location at 73 Humber Street also makes it useful for combining breakfast with the Marina, Humber Street Gallery or The Deep.</p>
<p>The practical catch is demand. The café encourages walk-ins and normally only accepts reservations for groups of eight or more. For a Saturday visit, arrive early, expect a possible wait at peak time and have a second Humber Street option in mind.</p>
<p><strong>Choose it for:</strong> a proper brunch menu, waterside exploring afterwards and dog-friendly dining.</p>

<h2>2. Flour & Feast, Humber Street</h2>
<p>A few doors away, <a href="https://www.flourandfeast.com/" target="_blank" rel="noopener noreferrer">Flour & Feast</a> takes a bakery-first approach. Everything sold is made on site, and the counter changes with the seasons. Mornings centre on pastries and coffee; bread begins coming from the oven later, followed by focaccia sandwiches and other lunch options.</p>
<p>Saturday opening is currently listed from 9:00 AM to 4:00 PM. It is walk-in only, has a maximum table size of five and can become busy. If you have one particular bake in mind, the bakery recommends pre-ordering at least a day ahead. Vegan cinnamon buns are a regular feature, while vegan doughnuts are offered at weekends; gluten-free availability varies.</p>
<p><strong>Choose it for:</strong> croissants, cinnamon buns, fresh bread and a slower coffee rather than a traditional full English.</p>

<h2>3. The Barista, Newland Avenue</h2>
<p><a href="https://www.thebaristacafe.co.uk/" target="_blank" rel="noopener noreferrer">The Barista</a> is an independent licensed café serving breakfast, brunch and lunch every day. It puts locally roasted speciality coffee at the centre of the offer, with freshly prepared dishes alongside wine, craft beer and cocktails.</p>
<p>Its Newland Avenue location works particularly well if your Saturday includes the independent shops and cafés around the <a href="/areas/avenues">Avenues</a>. It is a better fit for diners who want a relaxed café atmosphere than a loud bottomless-brunch session.</p>
<p><strong>Choose it for:</strong> coffee-led brunch, a catch-up for two and a wander along Newland Avenue.</p>

<h2>4. Barleys, Newland Avenue</h2>
<p><a href="https://barleys.co/" target="_blank" rel="noopener noreferrer">Barleys</a> is Hull's dedicated all-vegan brunch choice. The independent café began in 2020 and now operates from a larger home at 123 Newland Avenue, where it makes its own plant-based alternatives and serves expanded brunch, lunch and sandwich menus.</p>
<p>This is not merely the fallback for one vegan member of a group: it is the place to choose when everyone wants a fully plant-based menu without repeatedly checking ingredients. Look at the current menu before visiting because specials and supper-club activity change.</p>
<p><strong>Choose it for:</strong> an entirely vegan menu and house-made plant-based food.</p>

<h2>5. Garbutts, Princes Avenue</h2>
<p><a href="https://garbuttshull.co.uk/brunch-in-hull/" target="_blank" rel="noopener noreferrer">Garbutts</a> is the most conventional restaurant-style option in this list. The long-established independent venue at 54 Princes Avenue serves breakfast until 2:00 PM and promotes cooked breakfasts, steak and eggs, coffee and brunch offers.</p>
<p>Unlike Hull's smallest cafés, it actively takes table bookings, making it a sensible choice for birthdays, larger groups or anyone who does not want to gamble on finding a Saturday table. Check the current offer and menu when booking rather than relying on an old price shared elsewhere.</p>
<p><strong>Choose it for:</strong> a substantial breakfast, groups and the reassurance of a reservation.</p>

<h2>6. Brew, Bond Street</h2>
<p><a href="https://www.brewhull.co.uk/" target="_blank" rel="noopener noreferrer">Brew</a> is a flexible city-centre café-bar at 76 Bond Street. It specialises in freshly ground coffee, loose-leaf tea and local craft beer, and currently opens at 9:00 AM on Saturdays before continuing into the evening.</p>
<p>This is the useful choice when brunch is part of a wider day in the <a href="/areas/city-centre">city centre</a>, especially if different people want coffee, cake or something more relaxed. Check the current food menu before travelling if a full cooked breakfast is essential.</p>
<p><strong>Choose it for:</strong> central location, coffee and a morning that may turn into afternoon drinks.</p>

<h2>7. Planet Coffee, Newland Avenue</h2>
<p><a href="https://www.planetcoffeehull.co.uk/" target="_blank" rel="noopener noreferrer">Planet Coffee</a> is an independent, dog-friendly café at 162 Newland Avenue. Its published Saturday hours are 9:00 AM to 5:00 PM, with speciality coffee, homemade cakes, pastries and sandwiches.</p>
<p>Think of it as a dependable lighter brunch or second-coffee stop rather than the destination for an elaborate plated brunch. Outdoor seating makes it especially appealing in good weather.</p>
<p><strong>Choose it for:</strong> dogs, outdoor seating, cakes and a relaxed Newland Avenue stop.</p>

<h2>8. Caffè Gelato, Princes Avenue</h2>
<p><a href="https://caffegelatohull.co.uk/" target="_blank" rel="noopener noreferrer">Caffè Gelato</a> at 73 Princes Avenue is the late-starting option. It currently opens at 11:00 AM daily and advertises an all-day breakfast alongside Mediterranean-inspired food, waffles, pastries, coffee and gelato.</p>
<p>That makes it useful for families, mixed appetites or anyone whose Saturday morning begins closer to lunchtime. It is also open much later than a traditional bakery or breakfast café.</p>
<p><strong>Choose it for:</strong> a later brunch, sweet options and groups with very different appetites.</p>

<h2>Which Hull neighbourhood is best for brunch?</h2>
<p><strong>Humber Street and the Marina</strong> offer the strongest compact route for visitors. Start at Flour & Feast or Thieving Harry's, then walk around the Marina and Fruit Market. <strong>Newland Avenue and Princes Avenue</strong> give you more choice within a neighbourhood, including vegan food, cooked breakfasts and coffee shops. <strong>Hull city centre</strong> is easiest when brunch needs to fit around shopping, a gallery visit or the train.</p>

<h2>Saturday brunch planning tips</h2>
<ul>
  <li>Arrive before the late-morning rush at walk-in-only venues.</li>
  <li>Book where possible if you are bringing a group.</li>
  <li>Check the venue's own site or social feed for seasonal menus and unexpected closures.</li>
  <li>Tell the venue about allergies directly; vegan and gluten-free are not interchangeable.</li>
  <li>Use Hull Paragon Interchange for the city centre and waterfront, or local buses for Princes and Newland avenues.</li>
</ul>

<p><em>Venue details checked 13 September 2026. HU NOW does not accept payment for inclusion in this guide.</em></p>`,
    category: "Eat & Drink",
    tags: ["brunch", "humber street", "breakfast", "café"],
    featuredImage: "photo-1504674900247-0877df9cc836",
    author: "Elena Hartley",
    status: "published",
    isFeatured: false,
    isSponsored: false,
    readingMinutes: 8,
    publishedAt: "2026-05-12",
    section: "food-and-drink",
    subcategory: "lunch",
    seo: {
      title: "Best Brunch in Hull: 8 Saturday Brunch Places",
      description:
        "Find the best brunch in Hull for Saturday morning, including Humber Street bakeries, vegan brunch, cooked breakfasts and speciality coffee.",
    },
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

seedArticles.push(
  {
    id: "article-hull-fair-ride-prices-2026",
    title: "Hull Fair Ride Prices 2026: What Visitors Should Budget",
    slug: "hull-fair-ride-prices-2026",
    excerpt:
      "A practical, honest guide to Hull Fair admission, ride pricing and budgeting without publishing unconfirmed prices.",
    content: `<h2>Are Hull Fair ride prices confirmed for 2026?</h2><p>Hull Fair runs at Walton Street from Friday 9 October to Saturday 17 October 2026, closing on Sunday 11 October. Entry to the fairground is free, but every ride, game and food stall is operated and priced separately. Hull City Council has not published a single official 2026 ride-price list, so any website claiming one fixed price for every attraction should be treated cautiously.</p><h2>How payment works</h2><p>Look for the price displayed at each attraction before joining its queue. Prices and accepted payment methods can differ between operators, and a price seen on one ride should not be assumed to apply elsewhere. Carrying both a payment card and some cash gives you an alternative, but visitors should never assume every operator accepts both.</p><h2>Planning a realistic budget</h2><p>Decide how many rides each person may choose before arriving, then keep food, games and travel in separate parts of the budget. Families can reduce surprises by agreeing a spending limit with children and checking prices together. Admission being free also means visitors can enjoy the lights, atmosphere and traditional food without buying a ride package.</p><h2>Avoid unverified price claims</h2><p>Older social posts and previous-year guides are not reliable evidence for 2026. Prices can change by ride, operator and year. HU NOW will only publish exact figures when they appear in current official information or are visibly displayed at the fair. Check the <a href="https://www.hull.gov.uk/leisure/hull-fair" target="_blank" rel="noopener noreferrer">Hull City Council Hull Fair page</a> before travelling, and confirm the displayed cost at the attraction before paying.</p><h2>Confirmed visitor information</h2><p>The official schedule lists a 4pm opening on Friday 9 October, noon openings on both Saturdays, 2pm openings Monday to Friday, and an 11pm close each operating night. The fair is closed on Sunday 11 October. These confirmed times are more useful for planning than speculative ride prices because they let families choose a quieter weekday afternoon or a busier evening visit.</p>`,
    category: "Guides",
    subcategory: "guides",
    section: "things-to-do",
    author: "HU NOW Editorial Team",
    readingMinutes: 4,
    featuredImage: "photo-1533230408708-8f9f91d1235a",
    status: "published",
    publishedAt: "2026-09-14",
    tags: ["Hull Fair", "Hull Fair Prices", "Family", "Guides"],
    isFeatured: false,
    isSponsored: false,
    seo: {
      title: "Hull Fair Ride Prices 2026: Budget & Admission Guide",
      description:
        "Is Hull Fair free and how much should you budget for rides? Confirmed 2026 admission and practical advice without unreliable price claims.",
    },
  },
  {
    id: "article-hull-fair-food-guide",
    title: "Hull Fair Food Guide: Traditional Favourites and Visitor Tips",
    slug: "hull-fair-food-guide",
    excerpt:
      "What to eat at Hull Fair, from patties and brandy snap to practical allergy and payment advice.",
    content: `<h2>Food is part of the Hull Fair tradition</h2><p>For many visitors, Hull Fair is as much about familiar tastes and smells as the rides. Patties and chips, cream-filled brandy snap, roasted chestnuts, toffee apples and pomegranates are closely associated with generations of visits to Walton Street. Individual traders vary from year to year, so this guide describes traditions rather than promising that a named stall or product will be present.</p><h2>Hull patties and chips</h2><p>A Hull patty is traditionally made with seasoned mashed potato, often flavoured with sage and onion, coated in batter and fried. It is commonly served with chips and chip spice. Recipes and allergens vary between vendors; ask the trader directly if you need ingredient or cross-contamination information.</p><h2>Brandy snap and sweet favourites</h2><p>Brandy snap is a crisp rolled wafer commonly filled with cream at the fair. Toffee apples, candy floss, doughnuts and roasted nuts are other familiar choices. Dairy, nut, gluten and other allergens may be present, including through shared preparation areas, so never rely on a general online description when making a medical decision.</p><h2>Payment and sensible planning</h2><p>Food stalls set their own prices and payment methods. Check the displayed menu before ordering and consider carrying both card and cash. Busy evenings can mean queues, particularly on Friday and Saturday. A weekday afternoon may be easier for families, although crowd levels cannot be guaranteed.</p><h2>Keeping information accurate</h2><p>Hull City Council confirms the fair dates and operating hours but does not publish a definitive menu or price list for independent traders. HU NOW therefore avoids quoting unverified 2026 food prices. Check signs at the stall, ask about allergens and keep hot food away from crowded ride entrances. Read the <a href="/hull-fair">complete Hull Fair guide</a> for confirmed dates, opening hours and travel advice.</p>`,
    category: "Guides",
    subcategory: "guides",
    section: "food-and-drink",
    author: "HU NOW Editorial Team",
    readingMinutes: 4,
    featuredImage: "photo-1515003197210-e0cd71810b5f",
    status: "published",
    publishedAt: "2026-09-14",
    tags: ["Hull Fair", "Food", "Guides"],
    isFeatured: false,
    isSponsored: false,
    seo: {
      title: "Hull Fair Food Guide: Patties, Brandy Snap & Tips",
      description:
        "A practical guide to traditional Hull Fair food, payment, allergens and choosing stalls during the 2026 fair on Walton Street.",
    },
  },
  {
    id: "article-hull-fair-family-guide-2026",
    title: "Hull Fair with Children 2026: A Practical Family Guide",
    slug: "hull-fair-family-guide-2026",
    excerpt:
      "Plan a calmer family visit to Hull Fair with confirmed opening times, meeting-point advice and sensible budgeting.",
    content: `<h2>Planning Hull Fair with children</h2><p>Hull Fair takes place on Walton Street from 9 to 17 October 2026 and is closed on Sunday 11 October. The first Friday opens at 4pm, Saturdays open at noon, and Monday to Friday opens at 2pm. Every operating night closes at 11pm. Families with younger children may prefer daylight or early-evening hours, but no time can be guaranteed to be quiet.</p><h2>Agree a meeting point</h2><p>The fair can be bright, noisy and crowded. Choose a clear meeting point as soon as you arrive, show children how to identify event staff, and make sure older children know a parent or guardian's phone number. A current photograph on your phone can help if someone becomes separated. Follow instructions from council stewards and emergency services.</p><h2>Noise, lights and accessibility</h2><p>Individual rides use flashing lights, loud music and temporary access arrangements. Families affected by sensory conditions should assess each attraction separately and contact the council or operator for current accessibility information. Ear defenders may help some visitors, but they do not remove every sensory trigger.</p><h2>Budgeting and payments</h2><p>Entry is free; rides, games and food are paid for individually. There is no official universal 2026 ride-price list. Agree a spending limit before arriving, check the displayed price and do not assume every operator accepts the same payment method.</p><h2>Travel and weather</h2><p>Road and parking restrictions operate around Walton Street. Use official travel information and allow additional time at busy periods. October weather can change quickly, so check the forecast and bring suitable layers. The <a href="https://www.hull.gov.uk/leisure/hull-fair" target="_blank" rel="noopener noreferrer">Hull City Council page</a> is the authoritative source for last-minute operational changes.</p>`,
    category: "Guides",
    subcategory: "family",
    section: "things-to-do",
    author: "HU NOW Editorial Team",
    readingMinutes: 4,
    featuredImage: "photo-1500530855697-b586d89ba3ee",
    status: "published",
    publishedAt: "2026-09-14",
    tags: ["Hull Fair", "Family", "Children", "Guides"],
    isFeatured: false,
    isSponsored: false,
    seo: {
      title: "Hull Fair with Children 2026: Family Visitor Guide",
      description:
        "Confirmed opening times and practical advice for visiting Hull Fair with children, including safety, budgeting, sensory needs and travel.",
    },
  },
  {
    id: "article-hull-fair-accessibility-guide-2026",
    title: "Hull Fair Accessibility Guide 2026: Planning Your Visit",
    slug: "hull-fair-accessibility-guide-2026",
    excerpt:
      "Accessibility planning for Hull Fair, with cautious advice on temporary surfaces, ride access, transport and support.",
    content: `<h2>Accessibility at a temporary fairground</h2><p>Hull Fair is built temporarily on and around Walton Street, so routes, surfaces and ride access can differ from a permanent attraction. Paved areas do not guarantee step-free access to every ride or stall. Visitors should check their own requirements with Hull City Council and the relevant ride operator before travelling.</p><h2>Ride access is individual</h2><p>Each attraction has its own physical design and safety requirements. Transfer arrangements, restraint systems, steps and boarding procedures may differ. Staff at the ride are best placed to explain the current requirements, but visitors with specific needs may wish to seek information in advance rather than relying on a decision made in a busy queue.</p><h2>Choosing a time</h2><p>The confirmed 2026 schedule is 4pm on Friday 9 October, noon on Saturdays 10 and 17 October, and 2pm Monday 12 to Friday 16 October, with an 11pm close. The fair is closed on Sunday 11 October. Earlier weekday hours may be less intense for some visitors, although noise, lighting and crowd levels cannot be guaranteed.</p><h2>Travel and parking</h2><p>Restrictions apply around Walton Street during the fair. Blue Badge holders should not assume ordinary access or parking arrangements remain available. Check the council's current traffic, parking and public-transport information before setting off and allow time for temporary diversions.</p><h2>Sensory and personal support</h2><p>Bright moving lights, music, announcements and crowds are central features of the event. Consider ear protection, a planned quiet exit route and a clear meeting point. Anyone requiring medical or personal assistance should attend with the support appropriate to their circumstances. This guide is general planning information, not a guarantee of access. Use the <a href="https://www.hull.gov.uk/leisure/hull-fair" target="_blank" rel="noopener noreferrer">official council page</a> for current notices.</p>`,
    category: "Guides",
    subcategory: "guides",
    section: "things-to-do",
    author: "HU NOW Editorial Team",
    readingMinutes: 4,
    featuredImage: "photo-1517457373958-b7bdd4587205",
    status: "published",
    publishedAt: "2026-09-14",
    tags: ["Hull Fair", "Accessibility", "Guides"],
    isFeatured: false,
    isSponsored: false,
    seo: {
      title: "Hull Fair Accessibility Guide 2026: Visit Planning",
      description:
        "Practical accessibility planning for Hull Fair 2026, covering temporary surfaces, individual ride access, crowds, sensory needs and transport.",
    },
  },
  {
    id: "article-brantingham-park-fireworks-2026",
    title: "Brantingham Park Fireworks 2026: Confirmed Times and Tickets",
    slug: "brantingham-park-fireworks-2026",
    excerpt:
      "Confirmed organiser information for the 2026 Fireworx Extravaganza at Brantingham Park near Hull.",
    content: `<h2>Confirmed 2026 event details</h2><p>Brantingham Park's 2026 Fireworx Extravaganza takes place on Thursday 5 November from 5pm to 9pm. The organiser's Eventbrite listing states that the fireworks begin promptly at 7:15pm and are presented by Eastern Pyro Ltd. The venue is Brantingham Park, Brantingham Road, Elloughton HU15 1HX.</p><h2>Tickets and admission</h2><p>This is a ticket-only event. The organiser explicitly states there will be no pay-on-the-day admission, so visitors should obtain tickets in advance and bring the ticket for scanning at the entrance. Availability and ticket prices can change; use the organiser's current booking page rather than an old screenshot or social post.</p><h2>What the organiser confirms</h2><p>The published programme includes catering outlets, indoor areas, a covered grandstand, a children's disco and free face painting from 5pm. Free on-site parking is advertised. Under-16s must attend with a parent or legal guardian. The booking page states a no-refunds policy.</p><h2>Before travelling</h2><p>Allow time for traffic and entry checks, dress for an outdoor November event and follow venue instructions. Do not infer rules about sparklers, outside food, accessibility or pets unless they appear in the organiser's current event information. Those arrangements may change.</p><h2>Source and updates</h2><p>These details were checked on 14 September 2026 against the <a href="https://www.eventbrite.com/e/2026-fireworx-extravaganza-tickets-2000150996473" target="_blank" rel="noopener noreferrer">2026 Fireworx Extravaganza listing published by Brantingham Park</a>. HU NOW will update this page if the organiser changes the schedule. For other locations, use the <a href="/guides/hull-bonfire-night-fireworks-guide-2026">Hull and East Yorkshire fireworks guide</a>; unconfirmed venues are clearly labelled.</p>`,
    category: "Guides",
    subcategory: "guides",
    section: "things-to-do",
    author: "HU NOW Editorial Team",
    readingMinutes: 4,
    featuredImage: "photo-1498931299472-f7a63a5a1cfa",
    status: "published",
    publishedAt: "2026-09-14",
    tags: ["Bonfire Night", "Fireworks", "Brantingham Park", "Guides"],
    isFeatured: false,
    isSponsored: false,
    seo: {
      title: "Brantingham Park Fireworks 2026: Times & Tickets",
      description:
        "Confirmed date, opening time, fireworks time, ticket requirements and parking for Brantingham Park Fireworx Extravaganza 2026.",
    },
  },
);

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
      "One of Europe's largest travelling fairs returns to Walton Street from 9–17 October, with more than 250 rides and an array of attractions. Entry is free; rides and stalls are individually priced.",
    content: `
<h2>Hull Fair 2026 Dates & Opening Times</h2>
<p>Hull Fair 2026 officially runs from <strong>Friday 9 October to Saturday 17 October 2026</strong>. The official schedule lists <strong>Sunday 11 October as closed</strong>.</p>
<ul>
  <li><strong>Opening Day (Friday 9 October):</strong> 4:00 PM – 11:00 PM</li>
  <li><strong>Saturdays (10 & 17 October):</strong> 12:00 PM (Noon) – 11:00 PM</li>
  <li><strong>Sunday 11 October:</strong> CLOSED ALL DAY</li>
  <li><strong>Monday 12 October – Friday 16 October:</strong> 2:00 PM – 11:00 PM daily</li>
</ul>

<h2>Hull Fair 2026 Admission and Ride Costs</h2>
<p><strong>Entry to Hull Fair is 100% FREE.</strong> You do not need to buy an admission ticket or book in advance — you can simply walk straight onto the Walton Street fairground site.</p>
<p>Rides, games, and food stalls are priced individually by their operators. Official 2026 prices have not been published, so check the displayed cost before buying or joining a queue.</p>

<h2>Payment: Cash vs. Card</h2>
<p>Payment methods vary between individual operators. Check before ordering or joining a ride queue and consider carrying both a payment card and some cash as alternatives.</p>

<h2>Parking & Getting to Walton Street</h2>
<p>Parking in the immediate Walton Street area is strictly restricted with residents-only permit zones. We strongly advise using the council-run Park & Ride services or stadium parking.</p>
<p>Hull City Council lists park-and-ride services from Priory Park (HU4 7DY) and Humber Bridge, Ferriby Road (HU13 0JG), as well as public parking at MKM Stadium. 👉 <strong>For complete parking details and map locations, see our <a href="/guides/guide-to-parking-at-hull-fair">Full Guide to Parking at Hull Fair 2026</a>.</strong></p>

<h2>What to Expect at One of Europe's Largest Travelling Fairs</h2>
<p>Hull City Council says Hull Fair brings more than <strong>250 rides</strong> and an array of attractions to Walton Street. The precise lineup changes each year.</p>

<h2>Tips for Visiting in 2026</h2>
<ul>
  <li><strong>Less Busy Times:</strong> Weekday afternoons are generally a better choice than Friday and Saturday evenings for families hoping to avoid peak periods, although crowd levels vary.</li>
  <li><strong>Busy Times:</strong> Friday evenings and Saturdays are likely to be popular, so allow extra time and expect queues.</li>
  <li><strong>Clothing:</strong> Walton Street is open to the elements — wear warm, waterproof layers and sturdy shoes for walking on asphalt and gravel.</li>
  <li><strong>Traditional Food:</strong> Brandy snap is closely associated with Hull Fair and is sold by multiple vendors.</li>
</ul>
    `.trim(),
    category: "Family",
    startDate: "2026-10-09",
    endDate: "2026-10-17",
    startTime: "16:00",
    endTime: "23:00",
    locationName: "Walton Street Fairground",
    address: "Walton Street, Hull HU3 6JU",
    price: "Free entry · rides priced individually",
    isFree: true,
    featuredImage: "/hull-fair-hero.jpg",
    status: "published",
    isFeatured: true,
    isSponsored: false,
    recurrence: { type: "annual" },
    seo: {
      title: "Hull Fair 2026 Dates, Opening Times & Parking — Walton Street",
      description:
        "Everything you need to know about Hull Fair 2026 (9–17 October), including confirmed opening times, free admission, park-and-ride locations and visitor guidance.",
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
