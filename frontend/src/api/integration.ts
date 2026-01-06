// src/api/integration.ts
import type { APIEndpoint } from "../agents/build-automate/build-context";

const endpoints: APIEndpoint[] = [];

export async function getApiEndpoints(): Promise<APIEndpoint[]> {
  return endpoints;
}
