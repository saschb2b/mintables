"use client";

import { Grid } from "@react-three/drei";

export function GridFloor({ size }: { size: number }) {
  const gridSize = Math.max(size * 2, 100);

  return (
    <group position={[0, -0.01, 0]}>
      <Grid
        args={[gridSize, gridSize]}
        cellSize={10}
        cellThickness={0.5}
        cellColor="#555555"
        sectionSize={50}
        sectionThickness={1}
        sectionColor="#6a6a6a"
        fadeDistance={gridSize * 2}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid={false}
      />
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[
              new Float32Array([-gridSize / 2, 0.01, 0, gridSize / 2, 0.01, 0]),
              3,
            ]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#ef4444" linewidth={2} />
      </line>
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[
              new Float32Array([0, 0.01, -gridSize / 2, 0, 0.01, gridSize / 2]),
              3,
            ]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#3b82f6" linewidth={2} />
      </line>
    </group>
  );
}
