const baseUrl = (
  process.env.SMOKE_BASE_URL ||
  process.env.SITE_URL ||
  "http://localhost:5173"
).replace(/\/$/, "");

const checks = [
  { name: "Home", path: "/" },
  { name: "Listings", path: "/listings" },
  { name: "Events", path: "/events" },
  { name: "Stories", path: "/stories" },
  { name: "Offers", path: "/offers" },
  { name: "Newsletter", path: "/newsletter" },
  { name: "Search", path: "/search?q=hull" },
  { name: "API listings", path: "/api/v1/listings" },
  { name: "API offers", path: "/api/v1/offers" },
  { name: "Sitemap", path: "/sitemap.xml" },
];

let failures = 0;

for (const check of checks) {
  const url = `${baseUrl}${check.path}`;
  try {
    const response = await fetch(url, { redirect: "manual" });
    const ok = response.status >= 200 && response.status < 400;
    console.log(`${ok ? "PASS" : "FAIL"} ${check.name} ${response.status} ${url}`);
    if (!ok) failures++;
  } catch (error) {
    failures++;
    console.log(`FAIL ${check.name} ${url}`);
    console.log(error instanceof Error ? error.message : String(error));
  }
}

if (failures > 0) {
  console.error(`\n${failures} smoke check(s) failed.`);
  process.exit(1);
}

console.log(`\nAll smoke checks passed for ${baseUrl}`);
