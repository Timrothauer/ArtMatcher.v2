import { config } from "./config.js";

async function fetchJson(path, errorMessage) {
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error(errorMessage);
    return await response.json();
  } catch (error) {
    if (error instanceof Error && error.message === errorMessage) throw error;
    throw new Error(errorMessage);
  }
}

async function readSample() {
  const data = await fetchJson(config.dataPaths.sample, "The sample collection could not be loaded. Please try again.");
  return Array.isArray(data.items) ? data.items : [];
}

async function readProfilerData() {
  const [artworkFile, embeddingFile, pairFile] = await Promise.all([
    fetchJson(config.dataPaths.artworks, "The artwork catalog could not be loaded. Please refresh and try again."),
    fetchJson(config.dataPaths.embeddings, "The prepared visual data could not be loaded. Please refresh and try again."),
    fetchJson(config.dataPaths.initialPairs, "The comparison set could not be loaded. Please refresh and try again.")
  ]);
  return {
    artworks: artworkFile.artworks ?? [],
    embeddings: embeddingFile.embeddings ?? {},
    embeddingMetadata: embeddingFile.metadata ?? {},
    pairs: pairFile.pairs ?? []
  };
}

export const source = Object.freeze({
  async load(params = {}) {
    if (params.dataset === "profiler") return readProfilerData();
    const items = await readSample();
    if (params.scenario === "empty") return [];
    if (params.scenario === "error") throw new Error("The preview encountered a sample problem. Nothing was changed.");
    return items;
  },

  async detail(id) {
    if (id.startsWith("sample-")) {
      const items = await readSample();
      return items.find((item) => item.id === id) ?? null;
    }
    const data = await readProfilerData();
    return data.artworks.find((artwork) => artwork.id === id) ?? null;
  },

  async save() {
    throw new Error("Not used in this project");
  },

  async list() {
    throw new Error("Not used in this project");
  }
});
