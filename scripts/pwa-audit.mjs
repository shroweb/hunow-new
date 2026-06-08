import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const publicDir = path.join(root, "public");
const failures = [];
const warnings = [];

function pass(message) {
  console.log(`✓ ${message}`);
}

function fail(message) {
  failures.push(message);
  console.error(`✕ ${message}`);
}

function warn(message) {
  warnings.push(message);
  console.warn(`! ${message}`);
}

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

async function pngDimensions(file) {
  const buffer = await readFile(file);
  if (buffer.toString("ascii", 1, 4) !== "PNG") {
    throw new Error(`${path.basename(file)} is not a PNG`);
  }
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

const manifestPath = path.join(publicDir, "manifest.json");
if (!existsSync(manifestPath)) {
  fail("public/manifest.json is missing");
} else {
  const manifest = await readJson(manifestPath);
  if (manifest.name && manifest.short_name) pass("Manifest has name and short_name");
  else fail("Manifest needs name and short_name");

  if (manifest.start_url && manifest.scope) pass("Manifest has start_url and scope");
  else fail("Manifest needs start_url and scope");

  if (manifest.display === "standalone") pass("Manifest display is standalone");
  else warn(`Manifest display is ${manifest.display || "missing"}`);

  if (manifest.theme_color && manifest.background_color) pass("Manifest has theme colors");
  else warn("Manifest should include theme_color and background_color");

  const icons = Array.isArray(manifest.icons) ? manifest.icons : [];
  for (const size of ["192x192", "512x512"]) {
    const icon = icons.find((candidate) => candidate.sizes === size && candidate.purpose === "any");
    if (!icon?.src) {
      fail(`Manifest is missing ${size} any icon`);
      continue;
    }
    const iconPath = path.join(publicDir, icon.src.replace(/^\//, ""));
    if (!existsSync(iconPath)) {
      fail(`${icon.src} is missing`);
      continue;
    }
    const [width, height] = size.split("x").map(Number);
    const dims = await pngDimensions(iconPath);
    if (dims.width === width && dims.height === height) pass(`${icon.src} is ${size}`);
    else fail(`${icon.src} is ${dims.width}x${dims.height}, expected ${size}`);
  }

  for (const size of ["192x192", "512x512"]) {
    const icon = icons.find(
      (candidate) => candidate.sizes === size && candidate.purpose?.includes("maskable"),
    );
    if (!icon?.src) {
      fail(`Manifest is missing ${size} maskable icon`);
      continue;
    }
    const iconPath = path.join(publicDir, icon.src.replace(/^\//, ""));
    if (!existsSync(iconPath)) {
      fail(`${icon.src} is missing`);
      continue;
    }
    const [width, height] = size.split("x").map(Number);
    const dims = await pngDimensions(iconPath);
    if (dims.width === width && dims.height === height) pass(`${icon.src} is ${size}`);
    else fail(`${icon.src} is ${dims.width}x${dims.height}, expected ${size}`);
  }
}

const swPath = path.join(publicDir, "sw.js");
if (!existsSync(swPath)) {
  fail("public/sw.js is missing");
} else {
  const sw = await readFile(swPath, "utf8");
  if (sw.includes("OFFLINE_URL")) pass("Service worker has an offline fallback");
  else fail("Service worker should define an offline fallback");
  if (sw.includes("IMAGE_CACHE") && sw.includes("trimCache"))
    pass("Service worker caps image cache");
  else warn("Service worker does not appear to cap image cache");
  if (sw.includes('"/api/"') && sw.includes('"/admin"'))
    pass("Service worker bypasses API/admin routes");
  else fail("Service worker should bypass API and admin routes");
}

for (const asset of ["offline.html", "splash-portrait.png", "splash-landscape.png"]) {
  const assetPath = path.join(publicDir, asset);
  if (existsSync(assetPath)) pass(`${asset} exists`);
  else warn(`${asset} is missing`);
}

console.log("");
console.log(`PWA audit complete: ${failures.length} failure(s), ${warnings.length} warning(s).`);
if (failures.length > 0) process.exit(1);
