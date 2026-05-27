"use client";

import Box from "@mui/material/Box";

const WALLPAPER_SRC = "/wallpaper-mountains.jpg";

/**
 * Full-bleed wallpaper layer.
 *  · The mountain photo fills the screen via `background-size: cover`
 *  · A soft vignette darkens the corners so icons + dock stay legible on
 *    any region of the photo
 */
export function DesktopWallpaper() {
  return (
    <Box
      aria-hidden
      sx={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
        backgroundColor: "#0a0c1a",
        "--mx": "0",
        "--my": "0",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: "-4%",
          backgroundImage: `url(${WALLPAPER_SRC})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: 0,
          animation:
            "wallpaper-in 1.1s cubic-bezier(0.2, 0.8, 0.2, 1) 60ms forwards",
          "@keyframes wallpaper-in": {
            to: { opacity: 1 },
          },
        }}
      />

      {/* Vignette — pulls focus inward and keeps corner UI readable. */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 110% 80% at 50% 55%, transparent 45%, rgba(0,0,0,0.55) 100%)",
        }}
      />
    </Box>
  );
}
