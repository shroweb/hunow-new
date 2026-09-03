import type { EventItem } from "@/types";

export function expandEventDescription(event: {
  id?: string;
  title: string;
  description?: string;
  category?: string;
  locationName?: string;
  address?: string;
}): string {
  const title = event.title || "";
  const desc = (event.description || "").trim();
  const cat = (event.category || "").toLowerCase();
  const loc = (event.locationName || "").toLowerCase();
  const id = (event.id || "").toLowerCase();

  // If already rich (3 or more paragraphs or > 400 chars), return clean
  if (desc.split(/\n\n+/).length >= 3 && desc.length > 400) {
    return desc;
  }

  // 1. Trinity Market
  if (loc.includes("trinity") || title.toLowerCase().includes("trinity market")) {
    return `Step inside the vibrant, historic Trinity Market in the heart of Hull Old Town for a feast of global street food, specialty coffee, and unique independent maker stalls.\n\nHoused in a beautifully restored Victorian market hall adjacent to Hull Minster, Saturday is the market's liveliest day. Wander between artisan food traders serving freshly prepared dishes from around the world — from authentic wood-fired pizza and Greek gyros to steaming bao buns, traditional Yorkshire pastries, artisan desserts, and locally roasted coffee.\n\nAlongside the food hall, browse an eclectic mix of independent stalls featuring handcrafted gifts, vintage goods, vinyl, fashion, and local produce. Plenty of communal seating makes it the perfect social hub to meet friends, enjoy lunch, or grab a craft beer before exploring the cobblestone streets of Old Town.`;
  }

  // 2. Parkruns
  if (id.includes("parkrun-eastpark") || title.includes("East Park 5k")) {
    return `Join hundreds of local runners, joggers, walkers, and spectators for Hull's free weekly 5k community event in the picturesque surroundings of East Park.\n\nThe route takes in two and a half scenic laps around the historic park's boating lake, tree-lined avenues, and heritage gardens on smooth tarmac pathways. Welcoming to participants of all paces — from complete beginners and parents with buggies to seasoned club athletes.\n\nBefore your first run, register for free with parkrun UK to receive your personal barcode. A friendly first-timers briefing begins at 8:50 AM by the main pavilion, with the run setting off promptly at 9:00 AM. Many participants head to the East Park cafe afterwards for post-run coffee, breakfast, and catch-ups.`;
  }
  if (id.includes("parkrun-peterpan") || title.includes("Peter Pan Parkrun")) {
    return `A friendly community 5k run, jog, or walk around Peter Pan Park in West Hull, completely organized by local volunteers.\n\nThe three-lap flat grass and tarmac course winds past the park's open fields, bowling greens, and play areas. It is renowned across East Yorkshire for its warm, supportive community spirit and encouraging marshals.\n\nFree entry for all ages and abilities. Register once at parkrun.org.uk for your timing barcode. Meet at the Pickering Road entrance near the Costello Stadium sports complex for the 8:50 AM briefing before the 9:00 AM start.`;
  }
  if (id.includes("parkrun-humberbridge") || title.includes("Humber Bridge Parkrun")) {
    return `A stunning trail-style 5k weekly parkrun winding through the chalk cliffs, meadows, and woodland paths of Humber Bridge Country Park with breathtaking views of the iconic Humber suspension bridge.\n\nThe course features an undulating trail loop known locally as Little Switzerland, offering a rewarding mix of compact gravel, tree-canopied trails, and gentle inclines. Trail shoes are recommended during wetter months.\n\nFree entry for all abilities. Meet at the meadow area near the Hessle Foreshore car park for the 8:50 AM briefing. Parking is available at the main country park car park off Ferriby Road, with post-run refreshments available at the nearby Foreshore cafes.`;
  }

  // 3. Connexin Live shows
  if (loc.includes("connexin") || id.includes("connexin")) {
    const lead = desc.length > 20 && !desc.startsWith("Live show at Connexin")
      ? desc
      : `Catch ${title} live on stage at Connexin Live, Hull's premier state-of-the-art entertainment arena.`;
    return `${lead}\n\nConnexin Live offers world-class acoustics, expansive staging, and unobstructed sightlines across all seating tiers. Guests can enjoy a wide selection of arena concessions, including local craft beers, wine, cocktails, hot food, and official tour merchandise throughout the concourses before taking their seats.\n\nLocated in Hull City Centre on Myton Street, the arena is just a short 5-minute walk from Hull Paragon Interchange (trains and buses) and adjacent to ample multi-storey parking at Princes Quay and Osborne Street. Doors typically open 60 to 90 minutes before showtime.`;
  }

  // 4. Hull Theatres (City Hall & New Theatre)
  if (loc.includes("theatre") || loc.includes("city hall") || id.includes("hulltheatres")) {
    const venueName = event.locationName || "Hull Theatres";
    const lead = desc.length > 20 && !desc.startsWith("Experience ")
      ? desc
      : `Experience ${title} live on stage at ${venueName} in the heart of Hull's cultural district.`;
    return `${lead}\n\nFeaturing top-tier touring productions, celebrated performers, and world-class theatrical staging, ${venueName} offers an intimate, atmospheric auditorium with superb acoustics and comfortable seating across stalls, circle, and balcony tiers. Confectionery, programmes, and interval drinks are available across the venue bars.\n\nEasily accessible on foot from Hull Paragon Interchange, with multiple nearby car parks, restaurants, and Old Town pubs perfect for pre-show dinner and drinks.`;
  }

  // 5. Football & Rugby Matches
  if (cat.includes("sport") || title.includes(" vs ") || title.includes(" at ") || title.includes("Host")) {
    const venueName = event.locationName || "the stadium";
    const lead = desc.length > 20 ? desc : `${title} live in action.`;
    return `${lead}\n\nExpect an electric matchday atmosphere, passionate home support, and full coverage on the stadium big screens. The family-friendly concourses offer hot matchday pies, burgers, craft beers, hot drinks, and official club merchandise before kickoff.\n\nPlan to arrive at ${venueName} at least 45 minutes prior to the start time to comfortably navigate turnstiles, grab refreshments, and soak up the pre-match anthems. Direct public transport and shuttle buses connect directly from Hull Paragon Interchange.`;
  }

  // 6. Civic, Festivals, and Other Arts Events
  const lead = desc.length > 20 ? desc : `${title} in Hull.`;
  return `${lead}\n\nThis event is part of Hull's thriving year-round calendar of culture, independent arts, and community entertainment. Whether you are a local resident or visiting the city for the day, it offers a fantastic opportunity to experience the unique character, welcoming people, and vibrant creative spirit that make Hull special.\n\nWe recommend checking travel arrangements in advance and combining your visit with a stop at one of Hull's nearby independent cafes, historic pubs, or waterfront restaurants.`;
}

export function getEventHighlights(event: EventItem) {
  const cat = (event.category || "").toLowerCase();
  const loc = (event.locationName || "").toLowerCase();

  let atmosphere = "Vibrant live event bringing people together in Hull.";
  let refreshments = "Refreshments, hot drinks, or local dining spots nearby.";

  if (cat.includes("sport")) {
    atmosphere = "High-energy matchday atmosphere with passionate local supporters.";
    refreshments = "Stadium concourses serving hot matchday pies, burgers, and drinks.";
  } else if (cat.includes("music")) {
    atmosphere = "Electrifying live stage production with state-of-the-art concert sound and lighting.";
    refreshments = "On-site arena bars serving craft beers, wine, cocktails, and snacks.";
  } else if (cat.includes("comedy")) {
    atmosphere = "Hilarious live stand-up comedy performance from top touring talent.";
    refreshments = "Interval drinks, refreshments, and confectionery available at venue bars.";
  } else if (cat.includes("theatre")) {
    atmosphere = "Atmospheric historic auditorium with superb acoustics and clear sightlines.";
    refreshments = "Theatre bars serving interval drinks, ice cream, and show programmes.";
  } else if (cat.includes("food") || cat.includes("drink")) {
    atmosphere = "Bustling indoor market hall with authentic street food vendors and artisan producers.";
    refreshments = "Global street cuisines, specialty artisan coffee, craft beer, and baked treats.";
  } else if (cat.includes("family")) {
    atmosphere = "Fun, welcoming, and safe live entertainment designed for families and children.";
    refreshments = "Family-friendly snacks, soft drinks, and ice creams available on site.";
  }

  return [
    { title: "Atmosphere & Setting", desc: atmosphere },
    { title: "Food & Drinks", desc: refreshments },
    {
      title: "Admission & Booking",
      desc: event.isFree
        ? "Completely free entry — no advance booking fees required."
        : "Advance ticket booking recommended to guarantee preferred seating.",
    },
    {
      title: "Accessibility & Inclusion",
      desc: "Step-free level access, dedicated wheelchair spaces, and assistance dogs welcome.",
    },
  ];
}

export function getEventVisitorGuide(event: EventItem) {
  const loc = (event.locationName || "").toLowerCase();
  const addr = (event.address || "").toLowerCase();

  let transit = "Conveniently located in central Hull, 5–10 minutes walk from Hull Paragon Interchange (trains & local buses).";
  let parking = "Nearby parking available at Princes Quay, Osborne Street, or King William House car parks.";

  if (loc.includes("trinity") || addr.includes("lowgate") || loc.includes("old town")) {
    transit = "Located in Hull Old Town next to Hull Minster. 8 minutes walk from Hull Paragon Interchange via Whitefriargate.";
    parking = "King William House multi-storey (Market Place), Lowgate on-street bays, and Zebedee's Yard.";
  } else if (loc.includes("connexin") || loc.includes("myton")) {
    transit = "Just 5 minutes walk from Hull Paragon Interchange via Ferensway. Excellent city centre pedestrian access.";
    parking = "Adjacent multi-storey parking at Princes Quay (HU1 2NL) or Osborne Street surface car park.";
  } else if (loc.includes("mkm") || loc.includes("stadium") || loc.includes("walton")) {
    transit = "Direct matchday bus services operate from Hull Paragon Interchange to Anlaby Road / West Park.";
    parking = "Official matchday parking at Walton Street car park (HU3 6JR) or the Priory Park & Ride.";
  } else if (loc.includes("east park") || addr.includes("holderness")) {
    transit = "Frequent bus services run from Hull Paragon Interchange along Holderness Road directly to East Park gates.";
    parking = "Free visitor parking available inside East Park via the main Holderness Road entrance.";
  } else if (loc.includes("humber bridge") || addr.includes("hessle")) {
    transit = "Bus routes 66 and 153 connect Hull Interchange to Hessle square, a short walk to the Country Park.";
    parking = "Dedicated visitor car park off Ferriby Road (Humber Bridge Country Park) and Hessle Foreshore.";
  } else if (loc.includes("peter pan")) {
    transit = "Bus route 57 from Hull Interchange stops directly outside Pickering Road near Costello Stadium.";
    parking = "On-site car parking available near the Pickering Road / Costello Stadium entrance.";
  }

  return {
    timings: `We recommend arriving 30 to 45 minutes before the scheduled start time (${event.startTime}) to comfortably check tickets, browse stalls or refreshments, and settle into your place.`,
    transit,
    parking,
    accessibility: "The venue provides step-free level access, accessible restrooms, and welcomes registered assistance dogs. For companion seating or specific access accommodations, contact venue staff.",
  };
}
