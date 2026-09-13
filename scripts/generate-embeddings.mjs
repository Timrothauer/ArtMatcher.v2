import { createHash } from "node:crypto";
import { readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  AutoProcessor,
  AutoTokenizer,
  CLIPModel,
  RawImage,
  env
} from "@huggingface/transformers";

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const artworkPath = join(projectRoot, "data", "artworks.json");
const embeddingPath = join(projectRoot, "data", "embeddings.json");
const modelId = "Xenova/clip-vit-base-patch32";
const modelRevision = "d15189d7028b43f1d3e65039190477f6af591c2a";
const packageVersion = "3.8.1";
const promptVersion = "core-concepts-v1";
const expectedDimension = 512;
const normTolerance = 0.00001;

const conceptGroups = [
  { dimension: "representation", keys: ["abstract", "figurative"], prompts: ["an abstract artwork", "a figurative artwork"] },
  { dimension: "density", keys: ["minimal", "visuallyDense"], prompts: ["a minimal restrained artwork", "a visually dense detailed artwork"] },
  { dimension: "structure", keys: ["geometric", "organic"], prompts: ["a geometric structured composition", "an organic fluid composition"] },
  { dimension: "color", keys: ["restrainedColor", "saturatedColor"], prompts: ["an artwork with restrained color", "an artwork with saturated color"] },
  { dimension: "mood", keys: ["calm", "dramatic"], prompts: ["a calm contemplative artwork", "a dramatic energetic artwork"] },
  { dimension: "approach", keys: ["traditional", "experimental"], prompts: ["a traditional conventional artwork", "an experimental unconventional artwork"] }
];

const prompts = conceptGroups.flatMap((group) => group.prompts);
const scoreKeys = conceptGroups.flatMap((group) => group.keys);

env.cacheDir = join(projectRoot, ".cache", "huggingface");
env.allowLocalModels = false;

function normalize(values) {
  const norm = Math.sqrt(values.reduce((sum, value) => sum + value * value, 0));
  if (!Number.isFinite(norm) || norm === 0) {
    throw new Error("CLIP produced an invalid zero-length vector");
  }
  return values.map((value) => value / norm);
}

function pairedProbability(first, second) {
  const offset = Math.max(first, second);
  const firstExp = Math.exp(first - offset);
  const secondExp = Math.exp(second - offset);
  const total = firstExp + secondExp;
  return [firstExp / total, secondExp / total];
}

function conceptScoresFrom(logits) {
  const scores = {};
  conceptGroups.forEach((group, index) => {
    const [first, second] = pairedProbability(logits[index * 2], logits[index * 2 + 1]);
    scores[group.keys[0]] = Number(first.toFixed(6));
    scores[group.keys[1]] = Number(second.toFixed(6));
  });
  return scores;
}

async function imageHash(relativePath) {
  const bytes = await readFile(join(projectRoot, relativePath));
  return createHash("sha256").update(bytes).digest("hex");
}

async function readExisting() {
  try {
    return JSON.parse(await readFile(embeddingPath, "utf8"));
  } catch {
    return { metadata: {}, embeddings: {} };
  }
}

async function saveOutputs(artworks, embeddings, hashes) {
  const embeddingOutput = {
    metadata: {
      package: "@huggingface/transformers",
      packageVersion,
      checkpoint: modelId,
      revision: modelRevision,
      dtype: "q8",
      dimension: expectedDimension,
      normTolerance,
      promptVersion,
      conceptGroups,
      imageHashes: hashes,
      generatedAt: new Date().toISOString()
    },
    embeddings
  };
  const artworkTemporary = `${artworkPath}.tmp`;
  const embeddingTemporary = `${embeddingPath}.tmp`;
  await writeFile(artworkTemporary, `${JSON.stringify({ artworks }, null, 2)}\n`);
  await writeFile(embeddingTemporary, `${JSON.stringify(embeddingOutput, null, 2)}\n`);
  await rename(artworkTemporary, artworkPath);
  await rename(embeddingTemporary, embeddingPath);
}

const artworkFile = JSON.parse(await readFile(artworkPath, "utf8"));
const artworks = artworkFile.artworks;
const existing = await readExisting();
const embeddings = existing.embeddings ?? {};
const hashes = {};

for (const artwork of artworks) {
  hashes[artwork.id] = await imageHash(artwork.imagePath);
}

const pending = artworks.filter((artwork) => {
  const vector = embeddings[artwork.id];
  const scores = artwork.conceptScores ?? {};
  return existing.metadata?.checkpoint !== modelId
    || existing.metadata?.revision !== modelRevision
    || existing.metadata?.imageHashes?.[artwork.id] !== hashes[artwork.id]
    || !Array.isArray(vector)
    || vector.length !== expectedDimension
    || !scoreKeys.every((key) => Number.isFinite(scores[key]));
});

if (pending.length === 0) {
  console.log("All artwork embeddings and concept scores are current.");
  process.exit(0);
}

console.log(`Preparing ${pending.length} artwork embedding(s) with ${modelId}@${modelRevision}.`);
const [tokenizer, processor, model] = await Promise.all([
  AutoTokenizer.from_pretrained(modelId, { revision: modelRevision }),
  AutoProcessor.from_pretrained(modelId, { revision: modelRevision }),
  CLIPModel.from_pretrained(modelId, { revision: modelRevision, dtype: "q8" })
]);
const textInputs = tokenizer(prompts, { padding: true, truncation: true });

async function processArtwork(artwork) {
  const image = await RawImage.read(join(projectRoot, artwork.imagePath));
  const imageInputs = await processor(image);
  const output = await model({ ...textInputs, ...imageInputs });
  const vector = normalize(Array.from(output.image_embeds.data));
  const logits = Array.from(output.logits_per_image.data);
  if (vector.length !== expectedDimension || !vector.every(Number.isFinite)) {
    throw new Error(`Invalid embedding for ${artwork.id}`);
  }
  artwork.conceptScores = conceptScoresFrom(logits);
  embeddings[artwork.id] = vector.map((value) => Number(value.toFixed(8)));
}

for (const artwork of pending) {
  let error;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      await processArtwork(artwork);
      error = null;
      break;
    } catch (caught) {
      error = caught;
      if (attempt === 1) console.warn(`Retrying ${artwork.id} after one failed attempt.`);
    }
  }
  if (error) {
    await saveOutputs(artworks, embeddings, hashes);
    throw error;
  }
  await saveOutputs(artworks, embeddings, hashes);
  console.log(`Embedded ${artwork.id}.`);
}

console.log(`Saved ${Object.keys(embeddings).length} normalized ${expectedDimension}-dimension embeddings.`);
