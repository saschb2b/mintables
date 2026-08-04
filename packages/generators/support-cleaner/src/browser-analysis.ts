"use client";

import type { SupportSelection } from "./mesh-preparation";
import type {
  SupportWorkerCommand,
  SupportWorkerResponse,
  SupportWorkerResult,
  WorkerProgress,
} from "./worker-protocol";

interface PendingRequest {
  resolve: (result: SupportWorkerResult) => void;
  reject: (error: Error) => void;
  onProgress?: (progress: WorkerProgress) => void;
}

const pendingRequests = new Map<number, PendingRequest>();
let worker: Worker | undefined;
let nextRequestId = 1;

function rejectPendingRequests(message: string): void {
  for (const pending of pendingRequests.values()) {
    pending.reject(new Error(message));
  }
  pendingRequests.clear();
}

function getWorker(): Worker {
  if (worker) return worker;
  worker = new Worker(new URL("./analysis.worker.ts", import.meta.url), {
    type: "module",
  });
  worker.onmessage = (event: MessageEvent<SupportWorkerResponse>) => {
    const pending = pendingRequests.get(event.data.requestId);
    if (!pending) return;
    if (event.data.type === "progress") {
      pending.onProgress?.({
        progress: event.data.progress,
        message: event.data.message,
      });
      return;
    }
    pendingRequests.delete(event.data.requestId);
    if (event.data.type === "error") {
      pending.reject(new Error(event.data.message));
      return;
    }
    pending.resolve({
      summary: event.data.summary,
      prepared: event.data.prepared,
    });
  };
  worker.onerror = () => {
    worker?.terminate();
    worker = undefined;
    rejectPendingRequests(
      "The local mesh-analysis worker stopped unexpectedly.",
    );
  };
  return worker;
}

function runWorkerRequest(
  request: SupportWorkerCommand,
  transfer: Transferable[],
  onProgress?: (progress: WorkerProgress) => void,
): Promise<SupportWorkerResult> {
  const requestId = nextRequestId++;
  return new Promise((resolve, reject) => {
    pendingRequests.set(requestId, { resolve, reject, onProgress });
    getWorker().postMessage({ ...request, requestId }, transfer);
  });
}

export function analyzeStlInWorker(
  assetId: string,
  buffer: ArrayBuffer,
  selection: SupportSelection,
  onProgress?: (progress: WorkerProgress) => void,
): Promise<SupportWorkerResult> {
  return runWorkerRequest(
    { type: "analyze", assetId, buffer, selection },
    [buffer],
    onProgress,
  );
}

export function prepareStlInWorker(
  assetId: string,
  selection: SupportSelection,
  onProgress?: (progress: WorkerProgress) => void,
): Promise<SupportWorkerResult> {
  return runWorkerRequest(
    { type: "prepare", assetId, selection },
    [],
    onProgress,
  );
}
