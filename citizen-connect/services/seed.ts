import { makeSampleData } from "./sampleDataset";

// Sample records are loaded only when the existing explicit demo mode is selected.
// Real Firebase mode never falls back to this dataset.
export function makeSeed() {
  return makeSampleData({ demo: true });
}
