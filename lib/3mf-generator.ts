import type { TubeConfig } from "./tube-types";
import type { AdapterConfig } from "./adapter-types";
import { generateTubeTriangles } from "./geometry/tube-mesh";
import { generateAdapterTriangles } from "./geometry/adapter-mesh";

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (const b of bytes) {
    c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

interface ZipEntry {
  name: string;
  data: Uint8Array;
  crc: number;
}

function buildZipStore(
  entries: { name: string; data: Uint8Array }[],
): Uint8Array {
  const encoder = new TextEncoder();
  const prepared: ZipEntry[] = entries.map((e) => ({
    name: e.name,
    data: e.data,
    crc: crc32(e.data),
  }));

  const localHeaders: Uint8Array[] = [];
  const centralHeaders: Uint8Array[] = [];
  const offsets: number[] = [];
  let runningOffset = 0;

  for (const entry of prepared) {
    const nameBytes = encoder.encode(entry.name);
    const local = new Uint8Array(30 + nameBytes.length + entry.data.length);
    const dvLocal = new DataView(local.buffer);

    dvLocal.setUint32(0, 0x04034b50, true); // local file header signature
    dvLocal.setUint16(4, 20, true); // version needed
    dvLocal.setUint16(6, 0, true); // flags
    dvLocal.setUint16(8, 0, true); // compression: STORE
    dvLocal.setUint16(10, 0, true); // mod time
    dvLocal.setUint16(12, 0x0021, true); // mod date (1980-01-01)
    dvLocal.setUint32(14, entry.crc, true);
    dvLocal.setUint32(18, entry.data.length, true);
    dvLocal.setUint32(22, entry.data.length, true);
    dvLocal.setUint16(26, nameBytes.length, true);
    dvLocal.setUint16(28, 0, true); // extra length

    local.set(nameBytes, 30);
    local.set(entry.data, 30 + nameBytes.length);
    localHeaders.push(local);

    offsets.push(runningOffset);
    runningOffset += local.length;
  }

  for (let i = 0; i < prepared.length; i++) {
    const entry = prepared[i];
    const nameBytes = encoder.encode(entry.name);
    const central = new Uint8Array(46 + nameBytes.length);
    const dvCentral = new DataView(central.buffer);

    dvCentral.setUint32(0, 0x02014b50, true); // central directory signature
    dvCentral.setUint16(4, 20, true); // version made by
    dvCentral.setUint16(6, 20, true); // version needed
    dvCentral.setUint16(8, 0, true); // flags
    dvCentral.setUint16(10, 0, true); // compression
    dvCentral.setUint16(12, 0, true); // mod time
    dvCentral.setUint16(14, 0x0021, true); // mod date
    dvCentral.setUint32(16, entry.crc, true);
    dvCentral.setUint32(20, entry.data.length, true);
    dvCentral.setUint32(24, entry.data.length, true);
    dvCentral.setUint16(28, nameBytes.length, true);
    dvCentral.setUint16(30, 0, true); // extra length
    dvCentral.setUint16(32, 0, true); // comment length
    dvCentral.setUint16(34, 0, true); // disk number
    dvCentral.setUint16(36, 0, true); // internal attrs
    dvCentral.setUint32(38, 0, true); // external attrs
    dvCentral.setUint32(42, offsets[i], true); // local header offset
    central.set(nameBytes, 46);
    centralHeaders.push(central);
  }

  const localTotal = localHeaders.reduce((s, h) => s + h.length, 0);
  const centralTotal = centralHeaders.reduce((s, h) => s + h.length, 0);
  const eocdSize = 22;
  const out = new Uint8Array(localTotal + centralTotal + eocdSize);

  let pos = 0;
  for (const h of localHeaders) {
    out.set(h, pos);
    pos += h.length;
  }
  const centralStart = pos;
  for (const h of centralHeaders) {
    out.set(h, pos);
    pos += h.length;
  }

  const dvEocd = new DataView(out.buffer, pos, eocdSize);
  dvEocd.setUint32(0, 0x06054b50, true);
  dvEocd.setUint16(4, 0, true); // disk number
  dvEocd.setUint16(6, 0, true); // disk with central directory
  dvEocd.setUint16(8, prepared.length, true);
  dvEocd.setUint16(10, prepared.length, true);
  dvEocd.setUint32(12, centralTotal, true);
  dvEocd.setUint32(16, centralStart, true);
  dvEocd.setUint16(20, 0, true); // comment length

  return out;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function trianglesToModelXml(triangles: number[][], appName: string): string {
  const vertexIndex = new Map<string, number>();
  const vertexOrder: { x: number; y: number; z: number }[] = [];
  const triIndices: [number, number, number][] = [];

  const keyOf = (x: number, y: number, z: number) =>
    `${String(x)},${String(y)},${String(z)}`;
  const intern = (x: number, y: number, z: number): number => {
    const k = keyOf(x, y, z);
    let idx = vertexIndex.get(k);
    if (idx === undefined) {
      idx = vertexOrder.length;
      vertexIndex.set(k, idx);
      vertexOrder.push({ x, y, z });
    }
    return idx;
  };

  for (const t of triangles) {
    const a = intern(t[0], t[1], t[2]);
    const b = intern(t[3], t[4], t[5]);
    const c = intern(t[6], t[7], t[8]);
    if (a === b || b === c || a === c) continue;
    triIndices.push([a, b, c]);
  }

  const parts: string[] = [];
  parts.push('<?xml version="1.0" encoding="UTF-8"?>');
  parts.push(
    '<model unit="millimeter" xml:lang="en-US" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02">',
  );
  parts.push(`<metadata name="Application">${escapeXml(appName)}</metadata>`);
  parts.push("<resources>");
  parts.push('<object id="1" type="model">');
  parts.push("<mesh>");
  parts.push("<vertices>");
  for (const v of vertexOrder) {
    parts.push(
      `<vertex x="${String(v.x)}" y="${String(v.y)}" z="${String(v.z)}"/>`,
    );
  }
  parts.push("</vertices>");
  parts.push("<triangles>");
  for (const [a, b, c] of triIndices) {
    parts.push(
      `<triangle v1="${String(a)}" v2="${String(b)}" v3="${String(c)}"/>`,
    );
  }
  parts.push("</triangles>");
  parts.push("</mesh>");
  parts.push("</object>");
  parts.push("</resources>");
  parts.push('<build><item objectid="1"/></build>');
  parts.push("</model>");

  return parts.join("\n");
}

export function trianglesTo3MF(
  triangles: number[][],
  appName = "TubeCraft",
): ArrayBuffer {
  const encoder = new TextEncoder();

  const contentTypes =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
    '<Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/>' +
    "</Types>";

  const rels =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/>' +
    "</Relationships>";

  const modelXml = trianglesToModelXml(triangles, appName);

  const zip = buildZipStore([
    { name: "[Content_Types].xml", data: encoder.encode(contentTypes) },
    { name: "_rels/.rels", data: encoder.encode(rels) },
    { name: "3D/3dmodel.model", data: encoder.encode(modelXml) },
  ]);

  return zip.buffer.slice(
    zip.byteOffset,
    zip.byteOffset + zip.byteLength,
  ) as ArrayBuffer;
}

function triggerDownload(buffer: ArrayBuffer, filename: string): void {
  const blob = new Blob([buffer], {
    type: "application/vnd.ms-package.3dmanufacturing-3dmodel+xml",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadTube3MF(config: TubeConfig, filename: string): void {
  const triangles = generateTubeTriangles(config);
  const buffer = trianglesTo3MF(triangles);
  triggerDownload(buffer, filename);
}

export function downloadAdapter3MF(
  config: AdapterConfig,
  filename: string,
): void {
  const triangles = generateAdapterTriangles(config);
  const buffer = trianglesTo3MF(triangles);
  triggerDownload(buffer, filename);
}
