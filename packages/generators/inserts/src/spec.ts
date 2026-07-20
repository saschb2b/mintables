import {
  calculateInsertLayout,
  getInsertOutputBounds,
  lidOuterDepth,
  lidOuterWidth,
} from "./layout";
import type { BoardGameInsertConfig } from "./types";

export interface InsertSpecSummary {
  compartmentCount: number;
  smallestWellWidth: number;
  smallestWellDepth: number;
  lowestClearHeight: number;
  outputWidth: number;
  outputDepth: number;
  outputHeight: number;
  estimatedVolumeCm3: number;
}

export function getInsertSpecSummary(
  config: BoardGameInsertConfig,
): InsertSpecSummary {
  const layout = calculateInsertLayout(config);
  const bounds = getInsertOutputBounds(config);
  const trayBlock = config.width * config.depth * config.height;
  const trayCavities = layout.cells.reduce(
    (sum, cell) =>
      sum +
      cell.clearWidth *
        cell.clearDepth *
        Math.max(0, config.height - cell.contentFloorZ),
    0,
  );
  const trayVolume = Math.max(0, trayBlock - trayCavities);
  const lidWidth = lidOuterWidth(config);
  const lidDepth = lidOuterDepth(config);
  const lidInnerWidth = Math.max(0, lidWidth - 2 * config.wallThickness);
  const lidInnerDepth = Math.max(0, lidDepth - 2 * config.wallThickness);
  const lidVolume =
    lidWidth * lidDepth * config.lidThickness +
    (lidWidth * lidDepth - lidInnerWidth * lidInnerDepth) *
      config.lidSkirtDepth;
  const outputVolume =
    config.outputPart === "tray"
      ? trayVolume
      : config.outputPart === "lid"
        ? lidVolume
        : trayVolume + lidVolume;

  return {
    compartmentCount: layout.compartmentCount,
    smallestWellWidth: layout.smallestClearWidth,
    smallestWellDepth: layout.smallestClearDepth,
    lowestClearHeight:
      layout.cells.length > 0
        ? Math.min(
            ...layout.cells.map((cell) => config.height - cell.contentFloorZ),
          )
        : 0,
    outputWidth: bounds.width,
    outputDepth: bounds.depth,
    outputHeight: bounds.height,
    estimatedVolumeCm3: outputVolume / 1000,
  };
}
