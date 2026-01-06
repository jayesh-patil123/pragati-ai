import type { DatasetInfo, DatasetVersion } from "../agents/build-automate/build-context";

const dataset: DatasetInfo = {
  name: "",
  type: undefined,
  versions: []
};

export async function getDataset(): Promise<DatasetInfo> {
  return dataset;
}

export async function addVersion(v: DatasetVersion): Promise<DatasetVersion> {
  const saved: DatasetVersion = {
    ...v,
    versionId: v.versionId ?? `v-${Date.now()}`,   // <-- FIXED: use versionId
    createdAt: new Date().toISOString(),           // OK → exists in interface
  };

  dataset.versions = [saved, ...dataset.versions];
  return saved;
}
