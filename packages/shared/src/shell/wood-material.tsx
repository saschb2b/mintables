"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";

export type WoodTone = "honey" | "walnut";

const TEXTURE_SIZE = 256;

const WOOD_COLORS: Record<
  WoodTone,
  { light: [number, number, number]; dark: [number, number, number] }
> = {
  honey: {
    light: [188, 119, 64],
    dark: [132, 76, 39],
  },
  walnut: {
    light: [99, 72, 52],
    dark: [62, 42, 31],
  },
};

function clampByte(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function pixelNoise(x: number, y: number): number {
  const value = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function createWoodTexture(
  tone: WoodTone,
  repeat: readonly [number, number],
): THREE.DataTexture {
  const pixels = new Uint8Array(TEXTURE_SIZE * TEXTURE_SIZE * 4);
  const colors = WOOD_COLORS[tone];

  for (let y = 0; y < TEXTURE_SIZE; y++) {
    for (let x = 0; x < TEXTURE_SIZE; x++) {
      const warpedY =
        y + Math.sin(x * 0.035) * 7 + Math.sin(x * 0.11 + 1.4) * 2.5;
      const broadGrain = 0.5 + Math.sin(warpedY * 0.095) * 0.1;
      const fineGrain = Math.sin(warpedY * 0.23 + Math.sin(x * 0.07)) * 0.012;
      const knotDistance = Math.hypot((x - 174) * 0.24, y - 92);
      const knot =
        Math.sin(knotDistance * 0.42) *
        Math.max(0, 1 - knotDistance / 48) *
        0.08;
      const noise = (pixelNoise(x, y) - 0.5) * 0.02;
      const mix = Math.max(
        0.08,
        Math.min(0.88, broadGrain + fineGrain + knot + noise),
      );
      const offset = (y * TEXTURE_SIZE + x) * 4;

      pixels[offset] = clampByte(
        colors.light[0] + (colors.dark[0] - colors.light[0]) * mix,
      );
      pixels[offset + 1] = clampByte(
        colors.light[1] + (colors.dark[1] - colors.light[1]) * mix,
      );
      pixels[offset + 2] = clampByte(
        colors.light[2] + (colors.dark[2] - colors.light[2]) * mix,
      );
      pixels[offset + 3] = 255;
    }
  }

  const texture = new THREE.DataTexture(
    pixels,
    TEXTURE_SIZE,
    TEXTURE_SIZE,
    THREE.RGBAFormat,
  );
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(...repeat);
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

export function addBoxProjectedUvs(
  geometry: THREE.BufferGeometry,
  scale = 36,
): THREE.BufferGeometry {
  const projected = geometry.index ? geometry.toNonIndexed() : geometry.clone();
  const positions = projected.getAttribute("position");
  const uvs = new Float32Array(positions.count * 2);
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  const normal = new THREE.Vector3();
  const edgeA = new THREE.Vector3();
  const edgeB = new THREE.Vector3();

  for (let index = 0; index < positions.count; index += 3) {
    a.fromBufferAttribute(positions, index);
    b.fromBufferAttribute(positions, index + 1);
    c.fromBufferAttribute(positions, index + 2);
    edgeA.subVectors(b, a);
    edgeB.subVectors(c, a);
    normal.crossVectors(edgeA, edgeB).normalize();
    const absX = Math.abs(normal.x);
    const absY = Math.abs(normal.y);
    const absZ = Math.abs(normal.z);

    for (let vertex = 0; vertex < 3; vertex++) {
      const point = vertex === 0 ? a : vertex === 1 ? b : c;
      const uvOffset = (index + vertex) * 2;
      if (absY >= absX && absY >= absZ) {
        uvs[uvOffset] = point.x / scale;
        uvs[uvOffset + 1] = point.z / scale;
      } else if (absX >= absZ) {
        uvs[uvOffset] = point.z / scale;
        uvs[uvOffset + 1] = point.y / scale;
      } else {
        uvs[uvOffset] = point.x / scale;
        uvs[uvOffset + 1] = point.y / scale;
      }
    }
  }

  projected.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  return projected;
}

export function WoodMaterial({
  tone,
  repeat = [1, 1],
  bumpScale = 0.2,
  roughness = 0.48,
}: {
  tone: WoodTone;
  repeat?: readonly [number, number];
  bumpScale?: number;
  roughness?: number;
}) {
  const repeatX = repeat[0];
  const repeatY = repeat[1];
  // Three retains texture identity outside React, and creating the pixel map is expensive.
  const texture = useMemo(
    () => createWoodTexture(tone, [repeatX, repeatY]),
    [tone, repeatX, repeatY],
  );

  useEffect(
    () => () => {
      texture.dispose();
    },
    [texture],
  );

  return (
    <meshPhysicalMaterial
      map={texture}
      bumpMap={texture}
      bumpScale={bumpScale}
      roughness={roughness}
      metalness={0}
      clearcoat={0.1}
      clearcoatRoughness={0.68}
      side={THREE.DoubleSide}
    />
  );
}
