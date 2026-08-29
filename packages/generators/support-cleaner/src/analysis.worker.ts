/// <reference lib="webworker" />

import { analyzeStl, summarizeAnalysis } from "./analysis";
import { prepareSupportMesh } from "./mesh-preparation";
import type {
  SupportWorkerRequest,
  SupportWorkerResponse,
} from "./worker-protocol";

const analyses = new Map<string, ReturnType<typeof analyzeStl>>();

function respond(response: SupportWorkerResponse, transfer?: Transferable[]) {
  self.postMessage(response, transfer ? { transfer } : undefined);
}

self.onmessage = async (event: MessageEvent<SupportWorkerRequest>) => {
  const { requestId } = event.data;
  try {
    const progress = (value: number, message: string) => {
      respond({ type: "progress", requestId, progress: value, message });
    };
    const analysis =
      event.data.type === "analyze"
        ? analyzeStl(event.data.buffer, progress)
        : analyses.get(event.data.assetId);
    if (!analysis) {
      throw new Error("The analyzed STL is no longer available in the worker.");
    }
    if (event.data.type === "analyze") {
      analyses.set(event.data.assetId, analysis);
    }
    const prepared = await prepareSupportMesh(
      analysis,
      event.data.selection,
      progress,
    );
    respond(
      {
        type: "result",
        requestId,
        summary:
          event.data.type === "analyze"
            ? summarizeAnalysis(analysis)
            : undefined,
        prepared,
      },
      [
        prepared.outputPositions.buffer,
        prepared.preview.positions.buffer,
        prepared.preview.indices.buffer,
        prepared.removedPreview.positions.buffer,
        prepared.removedPreview.indices.buffer,
      ],
    );
  } catch (error: unknown) {
    respond({
      type: "error",
      requestId,
      message:
        error instanceof Error
          ? error.message
          : "The STL could not be analyzed.",
    });
  }
};
