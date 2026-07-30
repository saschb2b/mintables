"use client";

import { useLayoutEffect, useRef, useState, type RefObject } from "react";
import { useThree } from "@react-three/fiber";
import { ContactShadows, GizmoHelper, Html } from "@react-three/drei";
import type { Vector3 } from "three";
import type { PreviewUiPalette } from "@mintables/shared/lib";
import { GridFloor } from "@mintables/shared/shell/grid-floor";
import { ModelMesh } from "@mintables/shared/shell/model-mesh";
import { PreviewSceneRig } from "@mintables/shared/shell/preview-scene-rig";
import { requestView } from "@mintables/shared/shell/viewport-context";
import { WoodMaterial } from "@mintables/shared/shell/wood-material";
import { generateHexTileTriangles } from "./geometry";
import { calculateHexTileLayout } from "./layout";
import type { HexTileConfig } from "./types";

type RenderView = "model" | "table";

function RenderViewToggle({
  view,
  onChange,
  palette,
}: {
  view: RenderView;
  onChange: (view: RenderView) => void;
  palette: PreviewUiPalette;
}) {
  const portal = useRef(document.body) as RefObject<HTMLElement>;
  const connected = useThree((state) => state.events.connected);
  const invalidate = useThree((state) => state.invalidate);

  useLayoutEffect(() => {
    if (!(connected instanceof HTMLElement)) return;
    const resizeObserver = new ResizeObserver(() => {
      invalidate();
    });
    resizeObserver.observe(connected);
    return () => {
      resizeObserver.disconnect();
    };
  }, [connected, invalidate]);

  const calculatePosition = (): [number, number] => {
    if (!(connected instanceof HTMLElement)) return [-1000, -1000];
    const rect = connected.getBoundingClientRect();
    return [rect.left + 116, rect.bottom - 42];
  };

  return (
    <GizmoHelper alignment="bottom-left" margin={[116, 42]}>
      <Html
        center
        portal={portal}
        calculatePosition={calculatePosition}
        zIndexRange={[1160, 1160]}
        style={{ pointerEvents: "auto" }}
      >
        <div
          role="group"
          aria-label="Preview appearance"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 3,
            padding: 3,
            borderRadius: 10,
            border: `1px solid ${palette.border}`,
            background: palette.surface,
            backdropFilter: "blur(14px) saturate(150%)",
            boxShadow: `0 8px 24px ${palette.shadow}`,
            whiteSpace: "nowrap",
          }}
        >
          {(["model", "table"] as const).map((option) => {
            const active = view === option;
            return (
              <button
                key={option}
                type="button"
                aria-pressed={active}
                onClick={() => onChange(option)}
                style={{
                  minWidth: 74,
                  height: 28,
                  padding: "0 12px",
                  border: 0,
                  borderRadius: 7,
                  background: active ? palette.active : palette.inactive,
                  color: active ? palette.activeText : palette.text,
                  font: "inherit",
                  fontSize: 11,
                  fontWeight: 650,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                {option === "model" ? "Model" : "Table"}
              </button>
            );
          })}
        </div>
      </Html>
    </GizmoHelper>
  );
}

function Tabletop({ size }: { size: number }) {
  return (
    <mesh
      position={[0, -0.08, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
    >
      <planeGeometry args={[size * 1.8, size * 1.8]} />
      <WoodMaterial
        tone="walnut"
        repeat={[1.5, 1.5]}
        bumpScale={0.015}
        roughness={0.78}
      />
    </mesh>
  );
}

export function HexTileScene({
  config,
  previewUiPalette,
}: {
  config: HexTileConfig;
  previewUiPalette: PreviewUiPalette;
}) {
  const [renderView, setRenderView] = useState<RenderView>("model");
  const layout = calculateHexTileLayout(config);
  const maxDimension = Math.max(
    layout.pointToPoint,
    config.acrossFlats,
    layout.overallHeight,
  );
  const bounds = {
    maxDimension,
    cameraDistance: maxDimension * 1.7,
    orbitTarget: [0, layout.overallHeight * 0.3, 0] as [number, number, number],
  };

  const changeRenderView = (nextView: RenderView) => {
    setRenderView(nextView);
    if (nextView === "table") {
      requestView("hex-tiles", "iso");
    }
  };

  return (
    <>
      <PreviewSceneRig bounds={bounds} />
      <ModelMesh
        config={config}
        generate={generateHexTileTriangles}
        axis="z-up"
        appearance={renderView === "table" ? "wood" : "model"}
      />
      {renderView === "model" ? (
        <GridFloor size={maxDimension} />
      ) : (
        <>
          <Tabletop size={maxDimension} />
          <hemisphereLight args={["#fff1d6", "#2f2119", 0.12]} />
          <directionalLight
            position={[-80, 130, 90]}
            intensity={0.25}
            color="#ffe0b2"
          />
        </>
      )}
      <ContactShadows
        position={[0, -0.01, 0]}
        opacity={renderView === "table" ? 0.62 : 0.4}
        scale={maxDimension * 2}
        blur={renderView === "table" ? 2.8 : 2}
        far={maxDimension}
      />
      <RenderViewToggle
        view={renderView}
        onChange={changeRenderView}
        palette={previewUiPalette}
      />
    </>
  );
}
