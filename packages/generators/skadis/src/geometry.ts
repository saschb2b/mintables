/**
 * SKÅDIS holder geometry, built with the shared Manifold CSG kernel.
 *
 * Frame: z-up, board face at y = 0. The plate spans y in [0, t], hooks reach
 * into -y through the slots, bodies extend into +y. The part stands on z = 0
 * in its mounted orientation, which is also the print orientation: every
 * body sits on the bed, so the only overhangs are the hook tabs (chamfered
 * at 45 degrees) and the optional upper rack tier (gusseted).
 */
import { configKey } from "@mintables/shared/lib/config-key";
import {
  box,
  circlePolygon,
  cylinderZ,
  extrudeX,
  extrudeY,
  extrudeZ,
  getCsg,
  manifoldToTriangles,
  roundedRectPolygon,
  withCsgScope,
  type CsgScope,
  type Manifold,
  type Vec2,
} from "@mintables/shared/lib/geometry/csg";
import { SKADIS } from "./board";
import {
  BODY_OVERLAP,
  DEG,
  cupFrame,
  deriveSkadis,
  rackLayout,
  slotLayout,
  trayLayout,
  type SkadisDerived,
} from "./derived";
import type {
  CupBody,
  MountConfig,
  RackBody,
  SkadisConfig,
  SlotBody,
  TrayBody,
} from "./types";

/** Segments around large circles (pockets, cups). */
const SEGMENTS = 64;
/** Radius of the rounded front corners on shelves, bars and blocks. */
const RIM_RADIUS = 3;
/** Radius of the rounded rear-top corner that guides the hook into the slot. */
const HOOK_ENTRY_RADIUS = 2.4;
/** Radius of the lip's two bottom corners. */
const HOOK_LIP_RADIUS = 1;
/** Concave fillet between tab underside and lip front face. */
const HOOK_FILLET_RADIUS = 1.5;
/** Points per hook corner arc. */
const HOOK_ARC_STEPS = 6;
/** Divider wall thickness inside cups. */
const DIVIDER_THICKNESS = 1.6;
/** Drain hole diameter in cup floors. */
const DRAIN_DIAMETER = 4;

function segmentsFor(diameter: number): number {
  return Math.max(24, Math.min(SEGMENTS, Math.round(diameter * 3)));
}

function unionAll(scope: CsgScope, parts: Manifold[]): Manifold {
  const { Manifold } = getCsg();
  if (parts.length === 0) throw new Error("unionAll needs at least one part");
  if (parts.length === 1) return parts[0];
  return scope.keep(Manifold.union(parts));
}

function subtractAll(
  scope: CsgScope,
  solid: Manifold,
  cutters: Manifold[],
): Manifold {
  if (cutters.length === 0) return solid;
  return scope.keep(solid.subtract(unionAll(scope, cutters)));
}

function move(
  scope: CsgScope,
  solid: Manifold,
  x: number,
  y: number,
  z: number,
): Manifold {
  return scope.keep(solid.translate([x, y, z]));
}

function rotateX(scope: CsgScope, solid: Manifold, degrees: number): Manifold {
  return scope.keep(solid.rotate([degrees, 0, 0]));
}

function shift(outline: Vec2[], dx: number, dy: number): Vec2[] {
  return outline.map(([x, y]): Vec2 => [x + dx, y + dy]);
}

/** Rounded footprint flush against the plate (square rear, rounded front). */
function footprint(
  width: number,
  depth: number,
  plateThickness: number,
  radius = RIM_RADIUS,
): Vec2[] {
  const total = depth + BODY_OVERLAP;
  const r = Math.min(radius, width / 4, total / 4);
  return shift(
    roundedRectPolygon(width, total, r, { roundBottom: false }),
    0,
    plateThickness - BODY_OVERLAP + total / 2,
  );
}

/* ------------------------------------------------------------------ */
/* Mount: plate + hooks                                                */
/* ------------------------------------------------------------------ */

function buildPlate(
  scope: CsgScope,
  mount: MountConfig,
  d: SkadisDerived,
): Manifold {
  const r = Math.max(
    0,
    Math.min(
      mount.cornerRadius,
      d.plateWidth / 2 - 0.01,
      d.plateHeight / 2 - 0.01,
    ),
  );
  const outline = shift(
    roundedRectPolygon(d.plateWidth, d.plateHeight, r, { roundBottom: false }),
    0,
    d.plateHeight / 2,
  );
  return extrudeY(scope, outline, 0, d.plateThickness);
}

/**
 * Side view (y, z) of one hook, modelled on the IKEA push-down hook that
 * well-fitting SKÅDIS accessories use: a tab leaves the plate through the
 * slot and a lip hangs *down* behind the board. Insert with the holder
 * raised, then let it drop: the tab rests on the slot's bottom edge and the
 * lip locks behind the board below the slot. Rounded rear-top corner for
 * entry, rounded lip bottom, and a fillet where the lip meets the tab.
 * Starts inside the plate so the union is seamless.
 */
export function hookProfile(
  mount: MountConfig,
  tabTop: number,
  plateThickness: number,
): Vec2[] {
  const gap = mount.boardThickness + mount.fit;
  const reach = gap + mount.lipThickness;
  const zTabBottom = tabTop - mount.tabHeight;
  const lipFront = -gap;
  const rear = -reach;
  const lipBottom = zTabBottom - mount.lipDrop;
  const rTop = Math.min(HOOK_ENTRY_RADIUS, mount.tabHeight, reach / 2);
  const rLip = Math.min(
    HOOK_LIP_RADIUS,
    mount.lipThickness / 3,
    mount.lipDrop / 3,
  );
  const rFillet = Math.min(HOOK_FILLET_RADIUS, gap / 2, mount.lipDrop / 3);
  const pts: Vec2[] = [];
  const arc = (
    cx: number,
    cz: number,
    r: number,
    fromDeg: number,
    toDeg: number,
  ) => {
    for (let i = 0; i <= HOOK_ARC_STEPS; i++) {
      const a =
        ((fromDeg + ((toDeg - fromDeg) * i) / HOOK_ARC_STEPS) * Math.PI) / 180;
      pts.push([cx + r * Math.cos(a), cz + r * Math.sin(a)]);
    }
  };
  pts.push([plateThickness / 2, zTabBottom], [plateThickness / 2, tabTop]);
  // Rear-top entry corner.
  arc(rear + rTop, tabTop - rTop, rTop, 90, 180);
  // Lip bottom: rear corner, then front corner.
  arc(rear + rLip, lipBottom + rLip, rLip, 180, 270);
  arc(lipFront - rLip, lipBottom + rLip, rLip, 270, 360);
  // Concave fillet from the lip's front face into the tab underside.
  arc(lipFront + rFillet, zTabBottom - rFillet, rFillet, 180, 90);
  pts.push([0, zTabBottom]);
  return pts;
}

function buildHooks(
  scope: CsgScope,
  mount: MountConfig,
  d: SkadisDerived,
): Manifold[] {
  const hooks: Manifold[] = [];
  for (const top of d.hooks.rowTops) {
    const profile = hookProfile(mount, top, d.plateThickness);
    for (const x of d.hooks.columnXs) {
      hooks.push(
        extrudeX(
          scope,
          profile,
          x - mount.tabWidth / 2,
          x + mount.tabWidth / 2,
        ),
      );
    }
  }
  return hooks;
}

/* ------------------------------------------------------------------ */
/* Cup                                                                 */
/* ------------------------------------------------------------------ */

function cupOutline(
  shape: CupBody["shape"],
  w: number,
  dpt: number,
  r: number,
  cy: number,
): Vec2[] {
  if (shape === "round") return circlePolygon(w / 2, SEGMENTS, 0, cy);
  return shift(roundedRectPolygon(w, dpt, r), 0, cy);
}

function buildCup(
  scope: CsgScope,
  body: CupBody,
  plateThickness: number,
): Manifold {
  const f = cupFrame(body, plateThickness);
  const theta = body.tilt * DEG;
  const h = body.height;
  const cy = plateThickness - f.inset + f.outerD / 2;

  const outer = extrudeZ(
    scope,
    cupOutline(body.shape, f.outerW, f.outerD, f.outerR, cy),
    0,
    h,
  );
  const parts = [outer];
  if (theta > 0) {
    // Fills the wedge that opens between the leaning cup and the plate. Kept
    // inside the outline so its sides never graze the cup wall at a tangent.
    const spineHalf =
      body.shape === "round" ? f.outerW * 0.42 : f.outerW / 2 - 0.6;
    parts.push(
      box(scope, -spineHalf, plateThickness - 80, 0, spineHalf, cy, h),
    );
  }
  let solid = unionAll(scope, parts);

  const cutters: Manifold[] = [
    extrudeZ(
      scope,
      cupOutline(body.shape, f.innerW, f.innerD, f.innerR, cy),
      f.floorZ,
      h + 10,
    ),
  ];
  const drains = Math.max(0, Math.round(body.drainHoles));
  if (drains > 0) {
    const ring = Math.min(f.innerW, f.innerD) / 4;
    for (let i = 0; i < drains; i++) {
      const a = drains === 1 ? 0 : (i / drains) * Math.PI * 2 + Math.PI / 4;
      const dx = drains === 1 ? 0 : ring * Math.cos(a);
      const dy = drains === 1 ? 0 : ring * Math.sin(a);
      cutters.push(
        cylinderZ(scope, DRAIN_DIAMETER / 2, -1, f.floorZ + 1, 24, dx, cy + dy),
      );
    }
  }
  solid = subtractAll(scope, solid, cutters);

  const dividers = Math.max(0, Math.round(body.dividers));
  if (dividers > 0) {
    const walls: Manifold[] = [];
    for (let k = 1; k <= dividers; k++) {
      const x = -f.innerW / 2 + (k * f.innerW) / (dividers + 1);
      const slab = box(
        scope,
        x - DIVIDER_THICKNESS / 2,
        cy - f.innerD / 2 - 1,
        f.floorZ - 1,
        x + DIVIDER_THICKNESS / 2,
        cy + f.innerD / 2 + 1,
        h - 3,
      );
      walls.push(scope.keep(slab.intersect(outer)));
    }
    solid = unionAll(scope, [solid, ...walls]);
  }

  if (body.frontDip > 0) {
    const dip = body.frontDip;
    const dipW = f.innerW * 0.6;
    const scoop = shift(
      roundedRectPolygon(dipW, dip + 10, Math.min(dipW / 2, dip), {
        roundTop: false,
      }),
      0,
      h - dip + (dip + 10) / 2,
    );
    solid = scope.keep(
      solid.subtract(extrudeY(scope, scoop, cy, cy + f.outerD / 2 + 2)),
    );
  }

  if (theta > 0) {
    // Lean forward about the plate's bottom edge, then flatten the base on
    // the bed and cut away whatever swung behind the plate face.
    const centered = move(scope, solid, 0, -plateThickness, 0);
    const leaned = rotateX(scope, centered, -body.tilt);
    const back = move(scope, leaned, 0, plateThickness, 0);
    const onBed = scope.keep(back.trimByPlane([0, 0, 1], 0));
    const front = scope.keep(
      onBed.trimByPlane([0, 1, 0], plateThickness - BODY_OVERLAP),
    );
    // The spine's top face tilts upward toward the plate; cap it at the rim.
    const rimTop = h * Math.cos(theta) + f.inset * Math.sin(theta);
    solid = scope.keep(front.trimByPlane([0, 0, -1], -rimTop));
  }
  return solid;
}

/* ------------------------------------------------------------------ */
/* Tray                                                                */
/* ------------------------------------------------------------------ */

function pocketSolid(
  scope: CsgScope,
  shape: TrayBody["pocketShape"],
  w: number,
  dpt: number,
  z0: number,
  z1: number,
  cx: number,
  cy: number,
): Manifold {
  if (shape === "round") {
    return cylinderZ(scope, w / 2, z0, z1, segmentsFor(w), cx, cy);
  }
  const r = Math.min(3, w / 4, dpt / 4);
  return extrudeZ(scope, shift(roundedRectPolygon(w, dpt, r), cx, cy), z0, z1);
}

function buildTray(
  scope: CsgScope,
  body: TrayBody,
  plateThickness: number,
): Manifold {
  const L = trayLayout(body, plateThickness);
  const parts: Manifold[] = [
    extrudeZ(
      scope,
      footprint(L.width, L.depth, plateThickness),
      0,
      body.shelfThickness,
    ),
  ];
  const guard = body.guardHeight > body.lipHeight;
  for (const p of L.pockets) {
    const top = L.shelfTop(p.row);
    parts.push(
      pocketSolid(
        scope,
        body.pocketShape,
        L.outerW,
        L.outerD,
        0,
        top + body.lipHeight,
        p.x,
        p.y,
      ),
    );
    if (body.rows === 2 && p.row === 0) {
      // Raised step behind the rear row, filling back to the plate. Slightly
      // narrower than the lip so its sides stay inside the pocket wall.
      parts.push(
        box(
          scope,
          p.x - L.outerW / 2 + 0.5,
          plateThickness - BODY_OVERLAP,
          0,
          p.x + L.outerW / 2 - 0.5,
          p.y,
          top,
        ),
      );
    }
    if (guard && p.row === 0) {
      const tall = pocketSolid(
        scope,
        body.pocketShape,
        L.outerW,
        L.outerD,
        0,
        top + body.guardHeight,
        p.x,
        p.y,
      );
      const rearHalf = box(
        scope,
        p.x - L.outerW,
        plateThickness - BODY_OVERLAP,
        0,
        p.x + L.outerW,
        p.y,
        top + body.guardHeight + 1,
      );
      parts.push(scope.keep(tall.intersect(rearHalf)));
    }
  }
  const solid = unionAll(scope, parts);
  const cavities = L.pockets.map((p) =>
    pocketSolid(
      scope,
      body.pocketShape,
      L.innerW,
      L.innerD,
      L.shelfTop(p.row),
      L.height + 50,
      p.x,
      p.y,
    ),
  );
  return subtractAll(scope, solid, cavities);
}

/* ------------------------------------------------------------------ */
/* Rack                                                                */
/* ------------------------------------------------------------------ */

function buildRack(
  scope: CsgScope,
  body: RackBody,
  plateThickness: number,
): Manifold {
  const L = rackLayout(body, plateThickness);
  const y0 = plateThickness - BODY_OVERLAP;
  const bar = extrudeZ(
    scope,
    footprint(L.width, L.barDepth, plateThickness),
    0,
    body.barThickness,
  );
  const parts = [bar];
  const z2 = body.tierSpacing;
  if (body.tiers === 2) {
    parts.push(
      extrudeZ(
        scope,
        footprint(L.width, L.barDepth + L.tierShift, plateThickness),
        z2,
        z2 + body.barThickness,
      ),
    );
    // 45 degree gusset under the upper bar, clipped at the bed.
    const reach = L.barDepth + L.tierShift + BODY_OVERLAP;
    const wedge: Vec2[] =
      z2 - reach >= 0
        ? [
            [y0, z2],
            [y0 + reach, z2],
            [y0, z2 - reach],
          ]
        : [
            [y0, z2],
            [y0 + reach, z2],
            [y0 + reach - z2, 0],
            [y0, 0],
          ];
    parts.push(extrudeX(scope, wedge, -L.width / 2, L.width / 2));
  }
  const solid = unionAll(scope, parts);

  const cutters: Manifold[] = [];
  const topZ = body.tiers === 2 ? z2 + body.barThickness : body.barThickness;
  for (const hole of L.holes) {
    const bore = cylinderZ(scope, hole.d / 2, -200, 200, segmentsFor(hole.d));
    const leaned = body.tilt > 0 ? rotateX(scope, bore, -body.tilt) : bore;
    cutters.push(move(scope, leaned, hole.x, L.holeY, body.barThickness / 2));
    if (body.frontSlot > 0) {
      cutters.push(
        box(
          scope,
          hole.x - body.frontSlot / 2,
          L.holeY,
          -1,
          hole.x + body.frontSlot / 2,
          plateThickness + L.barDepth + L.tierShift + 5,
          topZ + 1,
        ),
      );
    }
  }
  return subtractAll(scope, solid, cutters);
}

/* ------------------------------------------------------------------ */
/* Slot                                                                */
/* ------------------------------------------------------------------ */

function buildSlot(
  scope: CsgScope,
  body: SlotBody,
  plateThickness: number,
): Manifold {
  const L = slotLayout(body, plateThickness);
  const block = extrudeZ(
    scope,
    footprint(L.width, L.frontY - plateThickness, plateThickness),
    0,
    L.height,
  );
  const cutters: Manifold[] = [];
  const n = L.xs.length;
  L.xs.forEach((x, k) => {
    let x0 = x - body.slotWidth / 2;
    let x1 = x + body.slotWidth / 2;
    if (body.openSides && k === 0) x0 = -L.width / 2 - 1;
    if (body.openSides && k === n - 1) x1 = L.width / 2 + 1;
    const pocket = box(
      scope,
      x0,
      0,
      body.openFloor ? -20 : 0,
      x1,
      body.slotDepth,
      body.slotHeight + 60,
    );
    const leaned = body.tilt > 0 ? rotateX(scope, pocket, body.tilt) : pocket;
    cutters.push(move(scope, leaned, 0, L.pivotY, L.pivotZ));
    if (body.frontWindow > 0) {
      const half = body.slotWidth * 0.3;
      cutters.push(
        box(
          scope,
          x - half,
          L.frontTopY - 1,
          L.height - body.frontWindow,
          x + half,
          L.frontY + 1,
          L.height + 1,
        ),
      );
    }
  });
  return subtractAll(scope, block, cutters);
}

/* ------------------------------------------------------------------ */
/* Assembly + cache                                                    */
/* ------------------------------------------------------------------ */

export interface SkadisBuild {
  triangles: number[][];
  volumeMm3: number;
}

const CACHE_LIMIT = 6;
const cache = new Map<string, SkadisBuild>();

function buildBody(
  scope: CsgScope,
  config: SkadisConfig,
  plateThickness: number,
): Manifold {
  switch (config.body.kind) {
    case "cup":
      return buildCup(scope, config.body, plateThickness);
    case "tray":
      return buildTray(scope, config.body, plateThickness);
    case "rack":
      return buildRack(scope, config.body, plateThickness);
    case "slot":
      return buildSlot(scope, config.body, plateThickness);
  }
}

/** Build (or fetch from the small cache) the whole holder. */
export function buildSkadis(config: SkadisConfig): SkadisBuild {
  const key = configKey({ mount: config.mount, body: config.body });
  const hit = cache.get(key);
  if (hit) return hit;
  const d = deriveSkadis(config);
  const result = withCsgScope((scope) => {
    const parts = [
      buildPlate(scope, config.mount, d),
      ...buildHooks(scope, config.mount, d),
      buildBody(scope, config, d.plateThickness),
    ];
    const solid = unionAll(scope, parts);
    return {
      triangles: manifoldToTriangles(solid),
      volumeMm3: solid.volume(),
    };
  });
  cache.set(key, result);
  if (cache.size > CACHE_LIMIT) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  return result;
}

export function generateSkadisTriangles(config: SkadisConfig): number[][] {
  return buildSkadis(config).triangles;
}

/**
 * Preview-only translucent board segment with the slot grid, positioned so
 * the hooks land in real slots. Not part of the export.
 */
export function generateBoardTriangles(config: SkadisConfig): number[][] {
  const d = deriveSkadis(config);
  const m = config.mount;
  const halfW =
    Math.ceil((d.plateWidth / 2 + 45) / SKADIS.pitch) * SKADIS.pitch;
  const height = d.plateHeight + 35;
  const anchorX = d.hooks.columnXs[0];
  // Mounted, the tab rests on the slot's bottom edge.
  const anchorZ = d.hooks.rowTops[0] - m.tabHeight + SKADIS.slotHeight / 2;
  return withCsgScope((scope) => {
    const slab = box(scope, -halfW, -m.boardThickness, 0, halfW, 0, height);
    const stadium = roundedRectPolygon(
      SKADIS.slotWidth,
      SKADIS.slotHeight,
      SKADIS.slotRadius,
      { segments: 6 },
    );
    const slots: Manifold[] = [];
    const addSlot = (x: number, z: number) => {
      // Skip slots that would touch the slab's edges: a cut ending exactly
      // on a face leaves a tangent edge the kernel cannot keep manifold.
      if (Math.abs(x) > halfW - 4) return;
      const half = SKADIS.slotHeight / 2;
      if (z - half < 0.5 || z + half > height - 0.5) return;
      slots.push(
        extrudeY(scope, shift(stadium, x, z), -m.boardThickness - 1, 1),
      );
    };
    const cols = Math.ceil((halfW * 2) / SKADIS.pitch) + 2;
    const rows = Math.ceil(height / SKADIS.pitch) + 2;
    for (let i = -cols; i <= cols; i++) {
      for (let j = -rows; j <= rows; j++) {
        const x = anchorX + i * SKADIS.pitch;
        const z = anchorZ + j * SKADIS.pitch;
        addSlot(x, z);
        addSlot(x + SKADIS.offset, z + SKADIS.offset);
      }
    }
    return manifoldToTriangles(subtractAll(scope, slab, slots));
  });
}
