"use client";

import { ContactShadows } from "@react-three/drei";
import { GridFloor } from "@mintables/shared/shell/grid-floor";
import { ModelMesh } from "@mintables/shared/shell/model-mesh";
import { PreviewSceneRig } from "@mintables/shared/shell/preview-scene-rig";
import { generateInsertTriangles } from "./geometry";
import { getInsertOutputBounds } from "./layout";
import type { BoardGameInsertConfig } from "./types";

export function InsertScene({ config }: { config: BoardGameInsertConfig }) {
  const output = getInsertOutputBounds(config);
  const maxDimension = Math.max(output.width, output.depth, output.height);
  const bounds = {
    maxDimension,
    cameraDistance: maxDimension * 1.8,
    orbitTarget: [0, output.height * 0.28, 0] as [number, number, number],
  };

  return (
    <>
      <PreviewSceneRig bounds={bounds} />
      <ModelMesh
        config={config}
        generate={generateInsertTriangles}
        axis="z-up"
      />
      <GridFloor size={maxDimension} />
      <ContactShadows
        position={[0, -0.01, 0]}
        opacity={0.4}
        scale={maxDimension * 2}
        blur={2}
        far={maxDimension}
      />
    </>
  );
}
