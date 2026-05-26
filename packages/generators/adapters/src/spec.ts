import type { AdapterConfig } from "./types";
import { getEffectiveBendRadius } from "./types";
import { formatTubeEndSize } from "./layout";

export interface AdapterSpecSummary {
  transition: string;
  endA: string;
  endB: string;
  socketDepth: number;
  adapterWall: number;
  bendAngle: number;
  totalHeight: number;
}

export function getAdapterSpecSummary(
  config: AdapterConfig,
): AdapterSpecSummary {
  const bendRadius = getEffectiveBendRadius(config);
  const straightLength = config.bendAngle === 0 ? bendRadius : 0;
  const totalHeight =
    config.socketDepth * 2 +
    (config.bendAngle > 0 ? bendRadius : straightLength);

  return {
    transition: `${config.endA.shape} → ${config.endB.shape}`,
    endA: formatTubeEndSize(config.endA),
    endB: formatTubeEndSize(config.endB),
    socketDepth: config.socketDepth,
    adapterWall: config.wallThickness,
    bendAngle: config.bendAngle,
    totalHeight: Math.round(totalHeight),
  };
}
