// src/api/workflow.ts
import type { WorkflowInfo } from "../agents/build-automate/build-context";

let workflow: WorkflowInfo = {
  engine: "react-flow",
  trigger: "manual",
  nodes: [],
  edges: [],
  deployed: false
};

export async function getWorkflow(): Promise<WorkflowInfo> {
  return workflow;
}

export async function updateWorkflow(patch: Partial<WorkflowInfo>): Promise<WorkflowInfo> {
  workflow = { ...workflow, ...patch };
  return workflow;
}
