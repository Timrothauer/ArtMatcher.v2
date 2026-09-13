import { config } from "./config.js";

async function readSample() {
  const response = await fetch(config.dataPaths.sample);

  if (!response.ok) {
    throw new Error("The sample collection could not be loaded. Please try again.");
  }

  const data = await response.json();
  return Array.isArray(data.items) ? data.items : [];
}

export const source = Object.freeze({
  async load(params = {}) {
    const items = await readSample();

    if (params.scenario === "empty") {
      return [];
    }

    if (params.scenario === "error") {
      throw new Error("The preview encountered a sample problem. Nothing was changed.");
    }

    return items;
  },

  async detail(id) {
    const items = await readSample();
    return items.find((item) => item.id === id) ?? null;
  },

  async save() {
    throw new Error("Not used in this project");
  },

  async list() {
    throw new Error("Not used in this project");
  }
});
