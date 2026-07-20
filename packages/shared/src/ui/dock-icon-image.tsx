interface DockIconImageProps {
  src: string;
  size?: number;
}

/** Renders transparent app artwork inside the dock's own squircle tile. */
export function DockIconImage({ src, size = 34 }: DockIconImageProps) {
  return (
    <img
      src={src}
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
      draggable={false}
      style={{
        display: "block",
        height: size,
        objectFit: "contain",
        userSelect: "none",
        width: size,
      }}
    />
  );
}
