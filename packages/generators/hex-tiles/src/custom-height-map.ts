export const CUSTOM_TEXTURE_RESOLUTION = 16;
export const CUSTOM_TEXTURE_SAMPLE_COUNT =
  CUSTOM_TEXTURE_RESOLUTION * CUSTOM_TEXTURE_RESOLUTION;

export function encodeCustomTextureSamples(samples: ArrayLike<number>): string {
  if (samples.length !== CUSTOM_TEXTURE_SAMPLE_COUNT) {
    throw new Error(
      `Custom textures require ${String(CUSTOM_TEXTURE_SAMPLE_COUNT)} grayscale samples.`,
    );
  }
  let binary = "";
  for (let index = 0; index < samples.length; index++) {
    const value = Math.max(0, Math.min(255, Math.round(samples[index])));
    binary += String.fromCharCode(value);
  }
  return btoa(binary);
}

export function decodeCustomTextureSamples(encoded: string): Uint8Array | null {
  try {
    const binary = atob(encoded);
    if (binary.length !== CUSTOM_TEXTURE_SAMPLE_COUNT) return null;
    return Uint8Array.from(binary, (character) => character.charCodeAt(0));
  } catch {
    return null;
  }
}
