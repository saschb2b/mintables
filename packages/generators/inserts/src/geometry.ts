import { addTriangle } from "@mintables/shared/lib/geometry/mesh-utils";
import {
  calculateInsertLayout,
  lidOuterDepth,
  lidOuterWidth,
  type InsertLayoutCell,
  type Rect,
} from "./layout";
import type { BoardGameInsertConfig } from "./types";

interface HeightRegion extends Rect {
  heightAt: (x: number, y: number) => number;
}

interface HeightFieldDefinition {
  width: number;
  depth: number;
  xCoordinates: number[];
  yCoordinates: number[];
  regions: HeightRegion[];
}

interface AccessCut extends Rect {
  top: number;
}

interface CardAccessProfile extends Rect {
  cell: InsertLayoutCell;
  pocketDepth: number;
  rampDepth: number;
}

function inside(rect: Rect, x: number, y: number): boolean {
  const epsilon = 1e-7;
  return (
    x >= rect.minX - epsilon &&
    x <= rect.maxX + epsilon &&
    y >= rect.minY - epsilon &&
    y <= rect.maxY + epsilon
  );
}

function wallRectangles(config: BoardGameInsertConfig): Rect[] {
  const layout = calculateInsertLayout(config);
  const halfW = config.width / 2;
  const halfD = config.depth / 2;
  const innerMinX = -halfW + config.wallThickness;
  const innerMaxX = halfW - config.wallThickness;
  const walls: Rect[] = [
    {
      minX: -halfW,
      maxX: innerMinX,
      minY: -halfD,
      maxY: halfD,
    },
    {
      minX: innerMaxX,
      maxX: halfW,
      minY: -halfD,
      maxY: halfD,
    },
    {
      minX: innerMinX,
      maxX: innerMaxX,
      minY: -halfD,
      maxY: -halfD + config.wallThickness,
    },
    {
      minX: innerMinX,
      maxX: innerMaxX,
      minY: halfD - config.wallThickness,
      maxY: halfD,
    },
  ];

  for (let rowIndex = 0; rowIndex < layout.rows.length - 1; rowIndex++) {
    const row = layout.rows[rowIndex];
    walls.push({
      minX: innerMinX,
      maxX: innerMaxX,
      minY: row.maxY,
      maxY: row.maxY + config.dividerThickness,
    });
  }

  for (const row of layout.rows) {
    for (
      let compartmentIndex = 0;
      compartmentIndex < row.cells.length - 1;
      compartmentIndex++
    ) {
      const cell = row.cells[compartmentIndex];
      walls.push({
        minX: cell.maxX,
        maxX: cell.maxX + config.dividerThickness,
        minY: row.minY,
        maxY: row.maxY,
      });
    }
  }
  return walls;
}

function accessCutForEdge(
  config: BoardGameInsertConfig,
  cell: InsertLayoutCell,
  edge: "front" | "back",
  widthRatio: number,
  topOverride?: number,
): AccessCut {
  const boundaryThickness =
    edge === "front"
      ? cell.rowIndex === 0
        ? config.wallThickness
        : config.dividerThickness
      : cell.rowIndex === config.rows.length - 1
        ? config.wallThickness
        : config.dividerThickness;
  const width = Math.max(
    2,
    Math.min(cell.clearWidth - 2, cell.clearWidth * widthRatio),
  );
  const centerX = (cell.minX + cell.maxX) / 2;
  const top =
    topOverride ?? Math.max(cell.floorZ + 1, config.height - config.notchDepth);
  return {
    minX: centerX - width / 2,
    maxX: centerX + width / 2,
    minY: edge === "front" ? cell.minY - boundaryThickness : cell.maxY,
    maxY: edge === "front" ? cell.minY : cell.maxY + boundaryThickness,
    top,
  };
}

function cardAccessProfile(cell: InsertLayoutCell): CardAccessProfile {
  const shoulder = Math.min(6, Math.max(2, cell.clearWidth * 0.1));
  const width = Math.max(
    2,
    Math.min(42, cell.clearWidth * 0.62, cell.clearWidth - 2 * shoulder),
  );
  const centerX = (cell.minX + cell.maxX) / 2;
  return {
    cell,
    minX: centerX - width / 2,
    maxX: centerX + width / 2,
    minY: cell.minY,
    maxY: cell.maxY,
    pocketDepth: Math.min(12, cell.clearDepth * 0.2),
    rampDepth: Math.min(4, cell.clearDepth * 0.08),
  };
}

function trayDefinition(config: BoardGameInsertConfig): HeightFieldDefinition {
  const layout = calculateInsertLayout(config);
  const walls = wallRectangles(config);
  const cuts: AccessCut[] = [];
  const cardProfiles: CardAccessProfile[] = [];
  const xCoordinates = [-config.width / 2, config.width / 2];
  const yCoordinates = [-config.depth / 2, config.depth / 2];

  for (const wall of walls) {
    xCoordinates.push(wall.minX, wall.maxX);
    yCoordinates.push(wall.minY, wall.maxY);
  }

  for (const cell of layout.cells) {
    xCoordinates.push(cell.minX, cell.maxX);
    yCoordinates.push(cell.minY, cell.maxY);
    if (cell.compartment.access === "finger") {
      cuts.push(accessCutForEdge(config, cell, "front", 0.52));
    } else if (cell.compartment.access === "scoop") {
      cuts.push(accessCutForEdge(config, cell, "front", 0.86));
      yCoordinates.push(
        Math.min(
          cell.maxY,
          cell.minY + Math.min(config.scoopLength, cell.clearDepth * 0.45),
        ),
      );
    } else if (cell.compartment.access === "cards") {
      const profile = cardAccessProfile(cell);
      cardProfiles.push(profile);
      cuts.push(accessCutForEdge(config, cell, "front", 0.62, cell.floorZ));
      cuts.push(accessCutForEdge(config, cell, "back", 0.62, cell.floorZ));
      xCoordinates.push(profile.minX, profile.maxX);
      yCoordinates.push(
        cell.minY + profile.pocketDepth,
        cell.minY + profile.pocketDepth + profile.rampDepth,
        cell.maxY - profile.pocketDepth - profile.rampDepth,
        cell.maxY - profile.pocketDepth,
      );
    }
  }

  for (const cut of cuts) {
    xCoordinates.push(cut.minX, cut.maxX);
    yCoordinates.push(cut.minY, cut.maxY);
  }

  const wallRegions: HeightRegion[] = walls.map((wall) => ({
    ...wall,
    heightAt: (x, y) => {
      const cut = cuts.find((candidate) => inside(candidate, x, y));
      return cut ? cut.top : config.height;
    },
  }));

  const cellRegions: HeightRegion[] = layout.cells.map((cell) => ({
    minX: cell.minX,
    maxX: cell.maxX,
    minY: cell.minY,
    maxY: cell.maxY,
    heightAt: (x, y) => {
      if (cell.compartment.access === "cards") {
        const profile = cardProfiles.find(
          (candidate) => candidate.cell === cell,
        );
        if (!profile || x < profile.minX || x > profile.maxX) {
          return cell.contentFloorZ;
        }
        const edgeDistance = Math.min(y - cell.minY, cell.maxY - y);
        if (edgeDistance <= profile.pocketDepth) return cell.floorZ;
        if (edgeDistance < profile.pocketDepth + profile.rampDepth) {
          const progress =
            (edgeDistance - profile.pocketDepth) / profile.rampDepth;
          return (
            cell.floorZ +
            Math.max(0, Math.min(1, progress)) *
              (cell.contentFloorZ - cell.floorZ)
          );
        }
        return cell.contentFloorZ;
      }
      if (cell.compartment.access !== "scoop") return cell.contentFloorZ;
      const run = Math.min(config.scoopLength, cell.clearDepth * 0.45);
      if (run <= 0 || y >= cell.minY + run) return cell.contentFloorZ;
      const maxRise = Math.max(
        0,
        config.height - config.notchDepth - cell.contentFloorZ,
      );
      const rise = Math.min(10, maxRise);
      const progress = 1 - (y - cell.minY) / run;
      return cell.contentFloorZ + Math.max(0, Math.min(1, progress)) * rise;
    },
  }));

  return {
    width: config.width,
    depth: config.depth,
    xCoordinates,
    yCoordinates,
    regions: [...wallRegions, ...cellRegions],
  };
}

function lidDefinition(config: BoardGameInsertConfig): HeightFieldDefinition {
  const width = lidOuterWidth(config);
  const depth = lidOuterDepth(config);
  const halfW = width / 2;
  const halfD = depth / 2;
  const wall = config.wallThickness;
  const innerMinX = -halfW + wall;
  const innerMaxX = halfW - wall;
  const innerMinY = -halfD + wall;
  const innerMaxY = halfD - wall;
  const totalHeight = config.lidThickness + config.lidSkirtDepth;
  const notchWidth = Math.min(config.width * 0.28, 34);
  const notchTop =
    config.lidThickness + Math.max(1, config.lidSkirtDepth * 0.45);
  const frontNotch: AccessCut = {
    minX: -notchWidth / 2,
    maxX: notchWidth / 2,
    minY: -halfD,
    maxY: innerMinY,
    top: notchTop,
  };
  const walls: Rect[] = [
    { minX: -halfW, maxX: innerMinX, minY: -halfD, maxY: halfD },
    { minX: innerMaxX, maxX: halfW, minY: -halfD, maxY: halfD },
    { minX: innerMinX, maxX: innerMaxX, minY: -halfD, maxY: innerMinY },
    { minX: innerMinX, maxX: innerMaxX, minY: innerMaxY, maxY: halfD },
  ];
  return {
    width,
    depth,
    xCoordinates: [
      -halfW,
      innerMinX,
      frontNotch.minX,
      frontNotch.maxX,
      innerMaxX,
      halfW,
    ],
    yCoordinates: [-halfD, innerMinY, innerMaxY, halfD],
    regions: [
      ...walls.map((wallRect) => ({
        ...wallRect,
        heightAt: (x: number, y: number) =>
          inside(frontNotch, x, y) ? frontNotch.top : totalHeight,
      })),
      {
        minX: innerMinX,
        maxX: innerMaxX,
        minY: innerMinY,
        maxY: innerMaxY,
        heightAt: () => config.lidThickness,
      },
    ],
  };
}

function sortedCoordinates(values: number[]): number[] {
  const rounded = values.map((value) => Math.round(value * 1e6) / 1e6);
  return [...new Set(rounded)].sort((a, b) => a - b);
}

function addQuad(
  triangles: number[][],
  a: [number, number, number],
  b: [number, number, number],
  c: [number, number, number],
  d: [number, number, number],
): void {
  addTriangle(triangles, ...a, ...b, ...c);
  addTriangle(triangles, ...a, ...c, ...d);
}

function generateHeightField(
  definition: HeightFieldDefinition,
  offsetX = 0,
): number[][] {
  const triangles: number[][] = [];
  const xs = sortedCoordinates(definition.xCoordinates);
  const ys = sortedCoordinates(definition.yCoordinates);

  const regionFor = (x: number, y: number): HeightRegion => {
    const region = definition.regions.find((candidate) =>
      inside(candidate, x, y),
    );
    if (region) return region;
    return {
      minX: -definition.width / 2,
      maxX: definition.width / 2,
      minY: -definition.depth / 2,
      maxY: definition.depth / 2,
      heightAt: () => 0,
    };
  };

  const cells: HeightRegion[][] = [];
  for (let xi = 0; xi < xs.length - 1; xi++) {
    cells[xi] = [];
    for (let yi = 0; yi < ys.length - 1; yi++) {
      cells[xi][yi] = regionFor(
        (xs[xi] + xs[xi + 1]) / 2,
        (ys[yi] + ys[yi + 1]) / 2,
      );
    }
  }

  for (let xi = 0; xi < xs.length - 1; xi++) {
    for (let yi = 0; yi < ys.length - 1; yi++) {
      const x1 = xs[xi] + offsetX;
      const x2 = xs[xi + 1] + offsetX;
      const sourceX1 = xs[xi];
      const sourceX2 = xs[xi + 1];
      const y1 = ys[yi];
      const y2 = ys[yi + 1];
      const region = cells[xi][yi];
      const z11 = region.heightAt(sourceX1, y1);
      const z21 = region.heightAt(sourceX2, y1);
      const z22 = region.heightAt(sourceX2, y2);
      const z12 = region.heightAt(sourceX1, y2);

      addQuad(
        triangles,
        [x1, y1, z11],
        [x2, y1, z21],
        [x2, y2, z22],
        [x1, y2, z12],
      );
      addQuad(triangles, [x1, y2, 0], [x2, y2, 0], [x2, y1, 0], [x1, y1, 0]);

      if (xi === 0) {
        addQuad(
          triangles,
          [x1, y1, 0],
          [x1, y1, z11],
          [x1, y2, z12],
          [x1, y2, 0],
        );
      }
      if (xi === xs.length - 2) {
        addQuad(
          triangles,
          [x2, y2, 0],
          [x2, y2, z22],
          [x2, y1, z21],
          [x2, y1, 0],
        );
      }
      if (yi === 0) {
        addQuad(
          triangles,
          [x2, y1, 0],
          [x2, y1, z21],
          [x1, y1, z11],
          [x1, y1, 0],
        );
      }
      if (yi === ys.length - 2) {
        addQuad(
          triangles,
          [x1, y2, 0],
          [x1, y2, z12],
          [x2, y2, z22],
          [x2, y2, 0],
        );
      }

      if (xi < xs.length - 2) {
        const neighbor = cells[xi + 1][yi];
        const leftA = z21;
        const leftB = z22;
        const rightA = neighbor.heightAt(sourceX2, y1);
        const rightB = neighbor.heightAt(sourceX2, y2);
        if (
          Math.abs(leftA - rightA) > 1e-7 ||
          Math.abs(leftB - rightB) > 1e-7
        ) {
          addQuad(
            triangles,
            [x2, y1, leftA],
            [x2, y2, leftB],
            [x2, y2, rightB],
            [x2, y1, rightA],
          );
        }
      }
      if (yi < ys.length - 2) {
        const neighbor = cells[xi][yi + 1];
        const frontA = z12;
        const frontB = z22;
        const backA = neighbor.heightAt(sourceX1, y2);
        const backB = neighbor.heightAt(sourceX2, y2);
        if (
          Math.abs(frontA - backA) > 1e-7 ||
          Math.abs(frontB - backB) > 1e-7
        ) {
          addQuad(
            triangles,
            [x1, y2, frontA],
            [x1, y2, backA],
            [x2, y2, backB],
            [x2, y2, frontB],
          );
        }
      }
    }
  }
  return triangles;
}

function translateX(triangles: number[][], offsetX: number): number[][] {
  return triangles.map((triangle) =>
    triangle.map((value, index) => (index % 3 === 0 ? value + offsetX : value)),
  );
}

export function generateInsertTriangles(
  config: BoardGameInsertConfig,
): number[][] {
  if (config.outputPart === "tray") {
    return generateHeightField(trayDefinition(config));
  }
  if (config.outputPart === "lid") {
    return generateHeightField(lidDefinition(config));
  }

  const gap = 10;
  const lidWidth = lidOuterWidth(config);
  const trayOffset = -(gap + lidWidth) / 2;
  const lidOffset = (gap + config.width) / 2;
  return [
    ...translateX(generateHeightField(trayDefinition(config)), trayOffset),
    ...translateX(generateHeightField(lidDefinition(config)), lidOffset),
  ];
}
