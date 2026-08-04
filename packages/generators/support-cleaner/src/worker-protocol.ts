import type { SupportAnalysisSummary } from "./analysis";
import type { PreparedSupportMesh, SupportSelection } from "./mesh-preparation";

export type SupportWorkerCommand =
  | {
      type: "analyze";
      assetId: string;
      buffer: ArrayBuffer;
      selection: SupportSelection;
    }
  | {
      type: "prepare";
      assetId: string;
      selection: SupportSelection;
    };

export type SupportWorkerRequest = SupportWorkerCommand & {
  requestId: number;
};

export type SupportWorkerResponse =
  | {
      type: "progress";
      requestId: number;
      progress: number;
      message: string;
    }
  | {
      type: "result";
      requestId: number;
      summary?: SupportAnalysisSummary;
      prepared: PreparedSupportMesh;
    }
  | {
      type: "error";
      requestId: number;
      message: string;
    };

export interface SupportWorkerResult {
  summary?: SupportAnalysisSummary;
  prepared: PreparedSupportMesh;
}

export interface WorkerProgress {
  progress: number;
  message: string;
}
