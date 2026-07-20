import type {
  BoardGameInsertConfig,
  InsertCompartment,
  InsertRow,
} from "./types";

export interface Rect {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export interface InsertLayoutCell extends Rect {
  rowIndex: number;
  compartmentIndex: number;
  compartment: InsertCompartment;
  clearWidth: number;
  clearDepth: number;
  /** Lowest floor surface, including the thumb pocket in card wells. */
  floorZ: number;
  /** Surface that supports the stored components. */
  contentFloorZ: number;
}

export interface InsertLayoutRow extends Rect {
  rowIndex: number;
  row: InsertRow;
  clearDepth: number;
  cells: InsertLayoutCell[];
}

export interface InsertLayout {
  rows: InsertLayoutRow[];
  cells: InsertLayoutCell[];
  compartmentCount: number;
  innerWidth: number;
  innerDepth: number;
  smallestClearWidth: number;
  smallestClearDepth: number;
}

function positiveShare(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function shareTotal(values: number[]): number {
  const total = values.reduce((sum, value) => sum + positiveShare(value), 0);
  return total > 0 ? total : Math.max(1, values.length);
}

export const CARD_ACCESS_UNDERCUT = 1.5;

/** Resolve relative row and compartment shares into exact clear well bounds. */
export function calculateInsertLayout(
  config: BoardGameInsertConfig,
): InsertLayout {
  const innerWidth = Math.max(0, config.width - 2 * config.wallThickness);
  const innerDepth = Math.max(0, config.depth - 2 * config.wallThickness);
  const rowCount = config.rows.length;
  const clearRowsDepth = Math.max(
    0,
    innerDepth - Math.max(0, rowCount - 1) * config.dividerThickness,
  );
  const rowShareTotal = shareTotal(config.rows.map((row) => row.depthShare));
  const rows: InsertLayoutRow[] = [];
  const cells: InsertLayoutCell[] = [];
  let y = -config.depth / 2 + config.wallThickness;

  for (const [rowIndex, row] of config.rows.entries()) {
    const rowWeight =
      rowShareTotal === rowCount && positiveShare(row.depthShare) === 0
        ? 1
        : positiveShare(row.depthShare);
    const clearDepth = (clearRowsDepth * rowWeight) / rowShareTotal;
    const minY = y;
    const maxY = minY + clearDepth;
    const compartmentCount = row.compartments.length;
    const clearCompartmentsWidth = Math.max(
      0,
      innerWidth - Math.max(0, compartmentCount - 1) * config.dividerThickness,
    );
    const widthShareTotal = shareTotal(
      row.compartments.map((compartment) => compartment.widthShare),
    );
    const rowCells: InsertLayoutCell[] = [];
    let x = -config.width / 2 + config.wallThickness;

    for (const [compartmentIndex, compartment] of row.compartments.entries()) {
      const weight =
        widthShareTotal === compartmentCount &&
        positiveShare(compartment.widthShare) === 0
          ? 1
          : positiveShare(compartment.widthShare);
      const clearWidth = (clearCompartmentsWidth * weight) / widthShareTotal;
      const floorZ = config.floorThickness + Math.max(0, compartment.floorLift);
      const cell: InsertLayoutCell = {
        rowIndex,
        compartmentIndex,
        compartment,
        minX: x,
        maxX: x + clearWidth,
        minY,
        maxY,
        clearWidth,
        clearDepth,
        floorZ,
        contentFloorZ:
          floorZ + (compartment.access === "cards" ? CARD_ACCESS_UNDERCUT : 0),
      };
      rowCells.push(cell);
      cells.push(cell);
      x = cell.maxX + config.dividerThickness;
    }

    rows.push({
      rowIndex,
      row,
      minX: -config.width / 2 + config.wallThickness,
      maxX: config.width / 2 - config.wallThickness,
      minY,
      maxY,
      clearDepth,
      cells: rowCells,
    });
    y = maxY + config.dividerThickness;
  }

  return {
    rows,
    cells,
    compartmentCount: cells.length,
    innerWidth,
    innerDepth,
    smallestClearWidth:
      cells.length > 0 ? Math.min(...cells.map((cell) => cell.clearWidth)) : 0,
    smallestClearDepth:
      cells.length > 0 ? Math.min(...cells.map((cell) => cell.clearDepth)) : 0,
  };
}

export interface InsertOutputBounds {
  width: number;
  depth: number;
  height: number;
}

export function lidOuterWidth(config: BoardGameInsertConfig): number {
  return config.width + 2 * (config.lidClearance + config.wallThickness);
}

export function lidOuterDepth(config: BoardGameInsertConfig): number {
  return config.depth + 2 * (config.lidClearance + config.wallThickness);
}

export function lidPrintHeight(config: BoardGameInsertConfig): number {
  return config.lidThickness + config.lidSkirtDepth;
}

export function getInsertOutputBounds(
  config: BoardGameInsertConfig,
): InsertOutputBounds {
  const lidWidth = lidOuterWidth(config);
  const lidDepth = lidOuterDepth(config);
  const lidHeight = lidPrintHeight(config);
  if (config.outputPart === "lid") {
    return { width: lidWidth, depth: lidDepth, height: lidHeight };
  }
  if (config.outputPart === "both") {
    return {
      width: config.width + 10 + lidWidth,
      depth: Math.max(config.depth, lidDepth),
      height: Math.max(config.height, lidHeight),
    };
  }
  return { width: config.width, depth: config.depth, height: config.height };
}
