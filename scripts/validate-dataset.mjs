import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { RawImage } from "@huggingface/transformers";

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const failures = [];
const requiredFields = ["id", "sourceId", "source", "sourceUrl", "title", "artist", "yearLabel", "yearStart", "yearEnd", "cultureOrRegion", "movementOrStyle", "originalImageUrl", "imagePath", "imageAlt", "rightsStatement", "quizRole", "conceptScores"];
const roles = ["quiz", "recommendation", "holdout"];
const scoreKeys = ["abstract", "figurative", "minimal", "visuallyDense", "geometric", "organic", "restrainedColor", "saturatedColor", "calm", "dramatic", "traditional", "experimental"];
const normalizedRegions = new Set(["England", "France", "Germany", "Ghana (Asante)", "Italy (Nola)", "Japan", "Korea (Joseon)", "Netherlands", "Peru (Chimú)", "Peru (Moche)", "Peru (Nasca)", "Roman", "United States"]);
const normalizedMovementsAndStyles = new Set(["American Realism", "Apulian Greek", "Asante", "Augustan Roman", "Baroque", "Chimú", "Dutch Golden Age", "Early Bronze Age", "Early Photography", "Expressionism", "Hudson River School", "Impressionism", "Italo-Byzantine", "Joseon Porcelain", "Kanō School", "Middle Kingdom Egyptian", "Moche", "Modern Sculpture", "Nasca", "Neo-Impressionism", "Neoclassicism", "Neoplasticism", "Pictorialism", "Post-Impressionism", "Precisionism", "Renaissance", "Rococo", "Romanticism", "Symbolism", "Ukiyo-e", "Victorian Photography"]);

function fail(message) {
  failures.push(message);
}

function norm(vector) {
  return Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
}

const artworkFile = JSON.parse(await readFile(join(projectRoot, "data", "artworks.json"), "utf8"));
const embeddingFile = JSON.parse(await readFile(join(projectRoot, "data", "embeddings.json"), "utf8"));
const pairFile = JSON.parse(await readFile(join(projectRoot, "data", "initial-pairs.json"), "utf8"));
const artworks = artworkFile.artworks ?? [];
const embeddings = embeddingFile.embeddings ?? {};
const pairs = pairFile.pairs ?? [];
const artworkById = new Map(artworks.map((artwork) => [artwork.id, artwork]));

if (artworks.length !== 36) fail(`Expected 36 artwork records, found ${artworks.length}`);

const ids = new Set();
const sourceKeys = new Set();
const imageHashes = new Map();
const roleCounts = Object.fromEntries(roles.map((role) => [role, 0]));

for (const artwork of artworks) {
  if (ids.has(artwork.id)) fail(`Duplicate artwork ID: ${artwork.id}`);
  ids.add(artwork.id);
  const sourceKey = `${artwork.source}\u0000${artwork.sourceId}`;
  if (sourceKeys.has(sourceKey)) fail(`Duplicate source and sourceId: ${artwork.source} ${artwork.sourceId}`);
  sourceKeys.add(sourceKey);
  requiredFields.forEach((field) => {
    if (!(field in artwork)) fail(`${artwork.id} omits required key ${field}`);
  });
  if (typeof artwork.artist !== "string" || artwork.artist !== artwork.artist.trim()) fail(`${artwork.id} has an invalid artist label`);
  if (/\b\d{4}\b|\b(?:born|died)\b/i.test(artwork.artist)) fail(`${artwork.id} artist label contains biographical detail`);
  if (typeof artwork.yearLabel !== "string" || !artwork.yearLabel || artwork.yearLabel !== artwork.yearLabel.trim()) fail(`${artwork.id} has an invalid year label`);
  if (/\bca\.|\babout\b|\bpossibly\b|B\.C\.|\d-\d|\d\/\d/i.test(artwork.yearLabel)) fail(`${artwork.id} year label does not use the normalized format`);
  if (artwork.yearStart !== null && !Number.isFinite(artwork.yearStart)) fail(`${artwork.id} has an invalid yearStart`);
  if (artwork.yearEnd !== null && !Number.isFinite(artwork.yearEnd)) fail(`${artwork.id} has an invalid yearEnd`);
  if (Number.isFinite(artwork.yearStart) && Number.isFinite(artwork.yearEnd) && artwork.yearStart > artwork.yearEnd) fail(`${artwork.id} has an inverted year range`);
  if (typeof artwork.cultureOrRegion !== "string" || artwork.cultureOrRegion !== artwork.cultureOrRegion.trim()) fail(`${artwork.id} has an invalid culture or region label`);
  if (artwork.cultureOrRegion && !normalizedRegions.has(artwork.cultureOrRegion)) fail(`${artwork.id} has an unnormalized culture or region label: ${artwork.cultureOrRegion}`);
  if (typeof artwork.movementOrStyle !== "string" || !normalizedMovementsAndStyles.has(artwork.movementOrStyle)) fail(`${artwork.id} has an invalid movement or style label: ${artwork.movementOrStyle}`);
  if (!roles.includes(artwork.quizRole)) fail(`${artwork.id} has invalid role ${artwork.quizRole}`);
  else roleCounts[artwork.quizRole] += 1;
  try {
    new URL(artwork.sourceUrl);
    new URL(artwork.originalImageUrl);
  } catch {
    fail(`${artwork.id} has an invalid URL`);
  }
  try {
    const path = join(projectRoot, artwork.imagePath);
    const bytes = await readFile(path);
    await RawImage.read(path);
    const hash = createHash("sha256").update(bytes).digest("hex");
    if (imageHashes.has(hash)) fail(`${artwork.id} duplicates image bytes from ${imageHashes.get(hash)}`);
    imageHashes.set(hash, artwork.id);
  } catch (error) {
    fail(`${artwork.id} has an unreadable image: ${error.message}`);
  }
  for (const key of scoreKeys) {
    if (!Number.isFinite(artwork.conceptScores?.[key])) fail(`${artwork.id} lacks finite concept score ${key}`);
  }
}

if (roleCounts.quiz !== 24 || roleCounts.recommendation !== 6 || roleCounts.holdout !== 6) {
  fail(`Role counts are ${JSON.stringify(roleCounts)}`);
}

const embeddingIds = Object.keys(embeddings).sort();
const artworkIds = [...ids].sort();
if (JSON.stringify(embeddingIds) !== JSON.stringify(artworkIds)) fail("Artwork and embedding IDs do not match exactly");

const dimension = embeddingFile.metadata?.dimension;
const tolerance = embeddingFile.metadata?.normTolerance ?? 0.00001;
for (const [id, vector] of Object.entries(embeddings)) {
  if (!Array.isArray(vector) || vector.length !== dimension) fail(`${id} has an invalid embedding dimension`);
  else if (!vector.every(Number.isFinite)) fail(`${id} contains a non-finite embedding value`);
  else if (Math.abs(norm(vector) - 1) > tolerance) fail(`${id} embedding is not normalized`);
}

if (pairs.length !== 8) fail(`Expected 8 initial pairs, found ${pairs.length}`);
const pairKeys = new Set();
const pairIds = new Set();
for (const pair of pairs) {
  if (pairIds.has(pair.id)) fail(`Duplicate pair ID: ${pair.id}`);
  pairIds.add(pair.id);
  const left = artworkById.get(pair.leftId);
  const right = artworkById.get(pair.rightId);
  if (!left || !right) fail(`${pair.id} refers to a missing artwork`);
  if (left?.quizRole !== "quiz" || right?.quizRole !== "quiz") fail(`${pair.id} includes a non-quiz artwork`);
  const key = [pair.leftId, pair.rightId].sort().join("::");
  if (pairKeys.has(key)) fail(`${pair.id} repeats an unordered pair`);
  pairKeys.add(key);
}

if (failures.length) {
  console.error(`Dataset validation failed with ${failures.length} issue(s):`);
  failures.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log(`PASS: ${artworks.length} unique artworks and images`);
console.log(`PASS: roles ${JSON.stringify(roleCounts)}`);
console.log(`PASS: ${embeddingIds.length} normalized ${dimension}-dimension embeddings`);
console.log(`PASS: all ${scoreKeys.length} concept scores exist for every artwork`);
console.log(`PASS: ${pairs.length} deterministic quiz-only initial pairs`);
console.log("PASS: artist, year, culture/region, and movement/style labels use normalized display formats");
