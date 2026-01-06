import React from "react";

// -------------------------------------------------------------
// DATASET TYPES — must match backend (/types/dataset.ts)
// -------------------------------------------------------------

export interface DatasetVersion {
  versionId: string;     // matches API shape
  createdAt: string;     // matches API shape
}

export interface DatasetInfo {
  name?: string;
  type?: string;         // backend uses string, not DatasetType enum
  versions: DatasetVersion[];
}

// -------------------------------------------------------------
// WORKFLOW TYPES — must match backend (/types/workflow.ts)
// -------------------------------------------------------------

export interface WorkflowNode {
  id: string;
  type: string;
  data?: unknown;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface WorkflowInfo {
  engine: string;        // backend returns string
  trigger: string;       // backend returns string
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  deployed?: boolean;
}

// -------------------------------------------------------------
// API ENDPOINTS — must match /types/integration.ts
// -------------------------------------------------------------

export interface APIEndpoint {
  name: string;
  url: string;
}

export interface AppIntegrationInfo {
  name?: string;
  connected?: boolean;
}

// -------------------------------------------------------------
// CONTEXT TYPE
// -------------------------------------------------------------

export interface BuildContextValue {
  dataset: DatasetInfo;
  setDataset: (d: Partial<DatasetInfo>) => void;
  addVersion: (v: DatasetVersion) => void;

  workflow: WorkflowInfo;
  setWorkflow: (w: Partial<WorkflowInfo>) => void;
  addNode: (node: WorkflowNode) => void;
  addEdge: (edge: WorkflowEdge) => void;

  apiEndpoints: APIEndpoint[];
  setApiEndpoints: (eps: APIEndpoint[]) => void;

  appIntegration: AppIntegrationInfo;
  setAppIntegration: (a: Partial<AppIntegrationInfo>) => void;

  openPanel?: (id: string) => void;
}

export const BuildContext = React.createContext<BuildContextValue | null>(null);
