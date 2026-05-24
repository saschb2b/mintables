"use client";

/** Synchronous lighting — no async HDR environment maps. */
export function StudioLights() {
  return (
    <>
      <ambientLight intensity={0.45} />
      <hemisphereLight args={["#ffffff", "#444444", 0.35]} />
      <directionalLight position={[10, 20, 10]} intensity={1.1} />
      <directionalLight position={[-10, 10, -10]} intensity={0.45} />
      <directionalLight position={[0, -10, 5]} intensity={0.25} />
    </>
  );
}
