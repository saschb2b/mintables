import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { addBoxProjectedUvs } from "./wood-material";

describe("addBoxProjectedUvs", () => {
  it("gives every face finite UV coordinates without changing the source", () => {
    const source = new THREE.BoxGeometry(20, 10, 30);
    const projected = addBoxProjectedUvs(source);
    const positions = projected.getAttribute("position");
    const uvs = projected.getAttribute("uv");

    expect(source.index).not.toBeNull();
    expect(projected.index).toBeNull();
    expect(uvs.count).toBe(positions.count);
    expect(Array.from(uvs.array).every(Number.isFinite)).toBe(true);

    source.dispose();
    projected.dispose();
  });
});
