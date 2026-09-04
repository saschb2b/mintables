# Plan: `skadis` generator (IKEA SKÅDIS pegboard holders)

Goal: one generator that produces a wall holder for almost any hand-sized object
(pencils, brushes, glue and paint bottles, calipers, screwdrivers, rulers,
knives, pliers) by combining a shared **mount** (backplate + hooks that fit the
SKÅDIS slot grid) with one of four **body** families that hold the object.

## 1. What the community does (research summary)

Sources: franpoli's OpenSCAD SKÅDIS library, JuanG's parametric bins/shelves,
shiv.b2 / Olo Deepdelver parametric bottle holders, the Cults3D caliper and
screwdriver holders, the MakerWorld hook and clip designs, dimensions.com.

**Board facts (all designs agree)**

| Item                       | Value                                                                        |
| -------------------------- | ---------------------------------------------------------------------------- |
| Slot                       | 5 mm wide x 15 mm tall stadium (r = 2.5), vertical                           |
| Grid                       | 40 mm pitch in X and Y, plus a second grid offset (20, 20)                   |
| Board thickness            | ~5.0 mm IKEA fiberboard (clones: 3, 4, 5 mm)                                 |
| Peg width through the slot | 4.6 mm (franpoli) to 4.8 mm (hook packs); 4.75 is the "fits all boards" pick |
| Behind-board space         | ~15 mm (IKEA spacers), hooks drop 8 to 15 mm                                 |

**Attachment styles seen, in order of popularity**

1. **J-hook tab**: horizontal tab through the slot, then a lip that turns up
   behind the board. Optional friction bump ("retainer") on the lip. Single
   piece, prints standing with a 45° chamfer under the tab. This is what most
   cups, trays and racks use, two hooks 40 mm apart on the top edge.
2. **Hook + lower rest**: same hooks plus a second hook row (40 or 80 mm lower)
   or a flat bumper that presses on the board face so a loaded, deep holder
   cannot rotate out. Heavy bottle trays always do this.
3. **Hook + lock pin / clip**: extra part that stops lift-off. Separate print.
4. **T-nut**: insert-and-twist nut with a screw boss, decouples the body.

**Body solutions per object**

| Object                          | Common solution                                                                                                                                         |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pencils, pens, brush bundle     | Round or rounded-rect cup with floor and drain holes, sometimes tilted 10 to 20° forward and with a dip in the front wall                               |
| Paint bottles, glue bottles     | Shelf with one round raised lip per bottle (lip 5 to 8 mm high) and often a second ring higher up for tall bottles; sizes offered 24 to 62 mm           |
| Dropper bottles (Vallejo etc.)  | Rack: bar with round holes the bottle hangs in by its shoulder                                                                                          |
| Screwdrivers                    | Rack bar with graded holes (e.g. back row 5 x 12 mm, front row 4 x 8 mm), often a front slot so the shaft slides in, second tier lower for long drivers |
| Brushes drying                  | Rack with small holes, tilted, or a flexible comb                                                                                                       |
| Calipers, rulers, files, knives | Narrow slot pocket sized to the beam (about 18 x 5 mm) with a closed floor, sometimes several slots side by side                                        |
| Pliers                          | Two-arm U cradle                                                                                                                                        |

## 2. Package layout

`packages/generators/skadis/` (`@mintables/gen-skadis`), same file set as
`pulls`: `types.ts`, `geometry.ts`, `validation.ts`, `controls.tsx`,
`scene.tsx`, `summary.tsx`, `spec.ts`, `print-tips.ts`, `icon-art.tsx`,
`index.ts`, `tests/`. Plus:

- `src/board.ts`: SKÅDIS constants (slot 5 x 15, pitch 40, offset 20) and the
  hook-position solver, shared by geometry, validation, scene and spec.
- `src/starters.ts`: built-in starter configs (see section 6).

Wiring: `apps/studio/lib/registry.ts`, `generator-slugs.ts`,
`next.config.ts` `transpilePackages`, `apps/studio/package.json` workspace dep.
Accent: `#e11d48` (rose) is unused by the nine existing generators.

## 3. Config model

```ts
interface SkadisConfig {
  mount: MountConfig; // shared by every body
  body: BodyConfig; // discriminated union on body.kind
}
```

### 3.1 Mount (shared)

| Field            | Default                         | Range     | Notes                                                                                                           |
| ---------------- | ------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------- |
| `hookColumns`    | `"auto"` \| 1..6                |           | auto = as many 40 mm columns as fit inside the backplate width minus margins                                    |
| `hookRows`       | 1                               | 1..2      | second row for deep or heavy bodies                                                                             |
| `rowSpacing`     | 40                              | 40 \| 80  | must be a multiple of 40                                                                                        |
| `boardThickness` | 5.0                             | 3..6      | clones are 3 to 5 mm                                                                                            |
| `fit`            | 0.2                             | -0.2..0.6 | clearance added to board gap and subtracted from tab width                                                      |
| `tabWidth`       | 4.7                             | 4.2..5.0  | across the slot, always < 5                                                                                     |
| `tabHeight`      | 4                               | 3..6      | vertical thickness of the tab in the slot                                                                       |
| `hookDrop`       | 10                              | 6..14     | how far the lip rises behind the board                                                                          |
| `lipThickness`   | 3                               | 2..4      |                                                                                                                 |
| `retainerBump`   | true                            |           | 0.4 mm nub on the lip for friction                                                                              |
| `lowerRest`      | `"auto"` \| `"none"` \| `"pad"` |           | flat bumper on the back of the backplate 40 mm below the hooks; auto turns on when body depth > 45 and rows = 1 |
| `plateWidth`     | `"auto"` \| mm                  |           | auto = body width; manual can be wider to add hooks                                                             |
| `plateHeight`    | `"auto"` \| mm                  |           | auto = body height + hook row clearance                                                                         |
| `plateThickness` | 3                               | 2.4..5    |                                                                                                                 |
| `cornerRadius`   | 4                               | 0..10     |                                                                                                                 |
| `lightening`     | false                           |           | cut a window in the plate above/below the body to save filament                                                 |

Hook X positions are always snapped to the 40 mm grid, centred on the plate.
When the plate is wider than 40 mm the solver picks
`floor((plateWidth - 2 * margin) / 40) + 1` columns (margin = 10 mm) unless
overridden. Rows sit at the top of the plate; a second row uses the same X
columns so the holder stays on one 40 mm grid.

### 3.2 Body families (`body.kind`)

**`cup`**: closed-bottom container (pencils, brushes, small tools).

| Field                                        | Default                              | Notes                                                     |
| -------------------------------------------- | ------------------------------------ | --------------------------------------------------------- |
| `shape`                                      | `"round"` \| `"rect"` \| `"stadium"` |                                                           |
| `innerDiameter` / `innerWidth`, `innerDepth` | 55 / 60 x 40                         |                                                           |
| `height`                                     | 80                                   | 20..200                                                   |
| `wall`                                       | 2                                    | 1.2..4                                                    |
| `floor`                                      | 2                                    | 1.2..5                                                    |
| `tilt`                                       | 0                                    | 0..25° forward lean, hinged at the backplate              |
| `frontDip`                                   | 0                                    | 0..height/2, scoops the front wall down for finger access |
| `drainHoles`                                 | 0                                    | 0..4, 4 mm holes in the floor                             |
| `dividers`                                   | 0                                    | 0..4, rect/stadium only, split into cells                 |

**`tray`**: shelf with raised round (or rect) lips (bottles, jars, glue).

| Field                       | Default                           | Notes                                                                                                                                     |
| --------------------------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `pockets`                   | 3                                 | 1..8                                                                                                                                      |
| `rows`                      | 1                                 | 1..2, second row staggered by half a pitch and stepped up 20 mm                                                                           |
| `pocketShape`               | `"round"` \| `"rect"`             |                                                                                                                                           |
| `pocketDiameter` (or w x d) | 35                                | 15..90; the object size, clearance added separately                                                                                       |
| `clearance`                 | 0.6                               | 0..2                                                                                                                                      |
| `lipHeight`                 | 6                                 | 3..25                                                                                                                                     |
| `lipThickness`              | 1.6                               | 1.2..3                                                                                                                                    |
| `pitchMode`                 | `"tight"` \| `"grid40"` \| manual | tight = diameter + 2 lip + gap; grid40 aligns pockets to hook columns                                                                     |
| `shelfThickness`            | 3                                 | 2..5                                                                                                                                      |
| `guardRail`                 | false                             | second ring at `guardHeight` (default 45) with `guardDiameter` (default = pocket) for tall bottles; open at the front so bottles lift out |
| `frontLipOnly`              | false                             | pockets become rear-open half rings to save filament                                                                                      |

**`rack`**: horizontal bar with holes the object hangs in (screwdrivers,
brushes, dropper bottles, pens).

| Field          | Default           | Notes                                                                                                         |
| -------------- | ----------------- | ------------------------------------------------------------------------------------------------------------- |
| `holes`        | `[{d: 12, n: 5}]` | editable list of groups, each `{diameter, count}`, laid left to right; covers graded rows like 3 x 12 + 4 x 8 |
| `gap`          | 6                 | wall left between holes                                                                                       |
| `frontSlot`    | 0                 | 0 = closed hole, else slot width opened to the front so shafts slide in                                       |
| `barDepth`     | `"auto"` \| mm    | auto = largest hole + 2 x gap                                                                                 |
| `barThickness` | 4                 | 3..8                                                                                                          |
| `tiers`        | 1                 | 1..2, second bar `tierSpacing` (default 60) lower with the same hole pattern for long tools                   |
| `tilt`         | 0                 | 0..20°, holes lean forward                                                                                    |
| `secondRow`    | off               | mirrored front row with its own hole group list, offset half a pitch                                          |

**`slot`**: vertical pocket(s) sized to a flat object (calipers, rulers, files,
knives, scissors, pliers with `openSides`).

| Field         | Default                | Notes                                                            |
| ------------- | ---------------------- | ---------------------------------------------------------------- |
| `slots`       | 1                      | 1..6                                                             |
| `slotWidth`   | 18                     | 4..80, along X                                                   |
| `slotDepth`   | 5                      | 2..40, along Y (object thickness)                                |
| `slotHeight`  | 30                     | 10..120                                                          |
| `pitch`       | `"tight"` \| mm        |                                                                  |
| `wall`        | 2.4                    |                                                                  |
| `floor`       | `"closed"` \| `"open"` | open = object rests on the board or hangs on its head            |
| `tilt`        | 10                     | 0..30°, slot leans back into the backplate for a natural drop-in |
| `frontWindow` | 0                      | cutout height in the front wall to see or grab the object        |
| `openSides`   | false                  | remove side walls to make a U cradle (pliers, wide handles)      |

### 3.3 Derived values (`derived.ts`)

Every body computes `bodyWidth`, `bodyHeight`, `bodyDepth`, the list of
horizontal cantilever spans (for gussets), plus the centre of mass depth. The
mount solver turns those into `plateWidth`, `plateHeight`, hook columns and
rows, and gusset triangles. Spec and validation read from `derived.ts` rather
than recomputing.

## 4. Geometry approach

**Orientation.** Z-up, print orientation equals mounted orientation: the
backplate's rear face is `y = 0`, hooks go to `-y`, the body to `+y`, the plate
bottom edge sits on `z = 0`. This is what every published holder does; cups,
trays, racks and slots are all naturally upright, and the hooks only need a 45°
chamfer under the tab.

**Union strategy (decided during implementation).** The generator uses real
CSG through the Manifold kernel (`manifold-3d`, WASM), wrapped in
`packages/shared/src/lib/geometry/csg.ts`. Every body is a union of
primitives minus cavities; holes, pockets, tilted cups and gussets are single
boolean calls. The kernel loads once per page via `Generator.prepare`, and the
shell holds the preview and export until it resolves. Output is a single
closed shell.

**Contacts need overlap, not tangency.** Manifold keeps tangent contacts as
duplicated vertices, so round cups sink 1.5 mm into the plate, pockets sink
0.6 mm, the shelf extends 1.2 mm past the lips, and risers stay 0.5 mm inside
the pocket walls.

**Hooks (revised against a measured reference model).** The hook is the
IKEA push-down type, matched to a working community holder that was sliced
and measured: a 4.5 mm tall, 4.5 mm wide tab leaves the plate through the
slot, and a 4.5 mm thick lip hangs 7.5 mm _down_ behind the board. The lip's
front face sits one board gap (4.8 mm, painted boards about 5.2) behind the
plate, so the reach is 9.3 mm. The rear-top corner is rounded (r 2.4) so the
hook finds the slot, the lip bottom is rounded (r 1), and a fillet (r 1.5)
joins lip and tab. Tab plus lip is 12 mm, which passes the 15 mm slot: raise
the holder, push the hooks through, let it drop. The tab then rests on the
slot's bottom edge and the lip locks behind the board below the slot.
Gravity and the load keep it seated; lifting removes it. The tab top sits
`hookInset` (default 5 mm) below the plate's top edge. Hooks are not
support-free in the standing print: each lip underside needs a small
support column behind the plate ("supports on build plate only" suffices).

**Gussets.** Every horizontal span that starts at the backplate (shelf, rack
bar, cup floor, slot floor) gets a triangular wedge underneath running from the
plate to the span's front edge at 45°, clipped to the plate height. Tilted
bodies extend the wedge along the tilt. This is the same rule the clamps
generator uses for its root gussets.

**Resolution.** 64 segments per full circle for pockets and cups, 32 for drain
holes, scaled down for tiny holes so live editing stays fast. Budget: a
3-pocket tray with 2 rows and guard rail should stay under ~40k triangles.

## 5. Preview scene

`scene.tsx` composes `ModelMesh`, `GridFloor`, `PreviewSceneRig` like `pulls`,
plus a `SkadisBoardGhost`: a translucent slab with the slot pattern
(instanced stadium cutouts, 3 x 3 cells around the hooks) drawn behind the
holder so the user sees the hooks land in slots. Toggle `showBoard` in the
controls (default on). Optional `ghostObject` cylinder inside cups/pockets at
the configured diameter to sanity-check fit.

## 6. Controls

`controls.tsx` structure, top to bottom, using `SectionCard`, `NumberField`
(`field=` keys matching validation), `TextField select`, and MUI `Slider`
where a range is more intuitive than a number (tilt, fit):

1. **Starters**: chip row that loads a full config: Pencil cup Ø60, Brush cup
   tilted 15°, Paint tray Ø35 x 3 (Tamiya / Vallejo 60 ml), Dropper rack Ø26 x 6
   (Vallejo 17 ml), Citadel tray Ø34 x 4, Glue bottle tray Ø30 x 2, Screwdriver
   rack 5 x 12 + 4 x 8 with front slot, Precision driver rack Ø8 x 8,
   Caliper slot 18 x 5, Ruler slots 3 x 32 x 3, Pliers cradle.
2. **Body type** select (cup / tray / rack / slot) with `switchBody` carrying
   over shared fields (mount) like `switchStyle` in pulls.
3. **Body section**: fields per family (tables above). The rack hole-group list
   follows the `inserts` array pattern (stable ids, add/remove, caps).
4. **Mount section**: hooks (auto/manual columns, rows, spacing), board fit
   (thickness, fit, tab width), plate (size auto/manual, thickness, corners,
   lightening), lower rest.
5. **Preview options**: show board, show ghost object.

`decode` must hand-validate the `body` union and the rack hole array (the
`pulls` `mergeWithDefaults` drops arrays).

## 7. Validation (errors block export, warnings inform)

Errors

- `tabWidth + fit` must be < 5.0; `tabHeight` must be < 15 - `hookDrop` \* 0.4
  (so the hook still angles into the slot).
- Hook columns must fit inside the plate width with 10 mm margin.
- Pocket / hole diameter + clearance + 2 x lip must be < pitch.
- Slot depth and width must exceed 2 x wall; rack holes must not exceed bar
  depth minus gap.
- Cup inner size ≥ 8 mm; wall and floor ≥ 1.2 mm.
- Total width ≤ 300 mm, height ≤ 250 mm.

Warnings

- One hook column with a body wider than 60 mm (rocks sideways).
- Single hook row with body depth > 45 mm and no lower rest (tips forward).
- Tilt > 20° on a cup (contents slide out).
- Lip height < 4 mm for pockets ≥ 40 mm (bottle can hop out).
- Front slot wider than 70% of the hole (tool falls through the front).
- Guard rail lower than 30 mm above the shelf (does nothing).
- Plate wider than 250 mm (check the print bed).

## 8. Spec, summary, badges, tips, filename

- `spec.ts`: footprint, height, hooks (columns x rows), capacity (cells,
  pockets, holes, slots), volume cm³, deepest cantilever, lowest hook row.
- Badges: `"2x1 hooks"`, `"3 x Ø35"`, `"9 holes"`, `"tilt 15°"`.
- Print tips: print standing with a brim, PETG for bottle trays, 3 to 4 walls,
  no supports thanks to gussets, test one hook first with `fit` before a
  batch, mention 4.75 tab width for unknown boards.
- Filename: `skadis-tray-3x35mm-2hooks.stl`, `skadis-rack-9holes.stl`,
  `skadis-cup-60mm.stl`, `skadis-slot-18x5.stl`.
- `describe`: "SKÅDIS bottle tray, 3 pockets Ø35 mm, 2 hooks".

## 9. Tests (`tests/`)

- `geometry.test.ts`: variant table covering every starter plus edge cases
  (1 hook, 2 rows, tilt, front slot, guard rail, open floor, dividers). Assert
  non-empty, `isPrintableMesh`, watertight (edge-use == 2), positive volume,
  `minZ ≈ 0`, `maxZ ≈ spec.height`, hook lips sit at `y = -(plateThickness +
boardThickness + fit)`, hook X centres are multiples of 40 apart.
- `board.test.ts`: hook solver columns/margins for widths 30..300.
- `decode.test.ts`, `validation.test.ts` like pulls; plus each starter has
  zero errors and zero warnings.

## 10. Phasing

1. **Skeleton**: package, board constants, mount (plate + hooks + gussets),
   `cup` body, scene with board ghost, registry wiring, tests. Ship.
2. **tray** and **rack** bodies, starters, rack hole groups UI.
3. **slot** body, guard rail, second rack row, lightening cutout.
4. Later ideas, not in scope now: T-nut or snap-in hook clips as a separate
   export (lets cups print in any orientation), lock pin, a plain hook / peg
   body, label recess on the plate, multi-body arrangement (several bodies on
   one wide plate).

## 11. Decisions taken

- CSG via Manifold instead of hand-built overlapping shells.
- Single-piece standing print, bodies on the bed, gussets only under the
  optional upper rack tier, not separate hook clips.
- Hooks only on the 40 mm grid, never on the offset (20, 20) grid; simpler
  solver and every holder aligns with the board.
- Default tab width 4.7 with `fit` 0.2 (targets IKEA 5 mm board, 4.7 is the
  community "fits all" number).
- `lowerRest` auto-on for deep bodies instead of forcing a second hook row.
