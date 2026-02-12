import sharp from "sharp";
import pngToIco from "png-to-ico";
import { writeFileSync } from "fs";
import { join } from "path";

const PUBLIC = join(import.meta.dir, "..", "public");
const APP = join(import.meta.dir, "..", "app");

// Brand palette
const CHARCOAL = "#1a1a1a";
const WARM_GRAY = "#C8C4BC";
const ORANGE = "#E8651A";
const DARK = "#2a2a2a";

// --- SVG Helpers ---

function dotGrid(
  x: number,
  y: number,
  cols: number,
  rows: number,
  gap: number,
  r: number,
  fill: string,
  opacity: number
) {
  const dots: string[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      dots.push(
        `<circle cx="${x + col * gap}" cy="${y + row * gap}" r="${r}" fill="${fill}" opacity="${opacity}" />`
      );
    }
  }
  return dots.join("\n");
}

function concentricRings(cx: number, cy: number, radii: number[]) {
  return radii
    .map(
      (r) =>
        `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${DARK}" stroke-width="1" />`
    )
    .join("\n");
}

function radialBars(cx: number, cy: number, count: number, innerR: number, maxLen: number) {
  const bars: string[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
    const len = innerR + 8 + Math.random() * (maxLen - 8);
    const x1 = cx + Math.cos(angle) * innerR;
    const y1 = cy + Math.sin(angle) * innerR;
    const x2 = cx + Math.cos(angle) * len;
    const y2 = cy + Math.sin(angle) * len;
    bars.push(
      `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${ORANGE}" stroke-width="2" stroke-linecap="round" opacity="0.7" />`
    );
  }
  return bars.join("\n");
}

function cornerBrackets(x: number, y: number, w: number, h: number, size: number, sw: number) {
  return `
    <polyline points="${x},${y + size} ${x},${y} ${x + size},${y}" fill="none" stroke="${ORANGE}" stroke-width="${sw}" />
    <polyline points="${x + w - size},${y} ${x + w},${y} ${x + w},${y + size}" fill="none" stroke="${ORANGE}" stroke-width="${sw}" />
    <polyline points="${x},${y + h - size} ${x},${y + h} ${x + size},${y + h}" fill="none" stroke="${ORANGE}" stroke-width="${sw}" />
    <polyline points="${x + w - size},${y + h} ${x + w},${y + h} ${x + w},${y + h - size}" fill="none" stroke="${ORANGE}" stroke-width="${sw}" />
  `;
}

// --- OG Image (1200x630) ---

function generateOgSvg(width: number, height: number): string {
  const discCx = width - 200;
  const discCy = height / 2;
  const discR = 160;

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="${CHARCOAL}" />

  <!-- Warm gray panel -->
  <rect x="60" y="60" width="${width - 120}" height="${height - 120}" fill="${WARM_GRAY}" rx="4" />
  ${cornerBrackets(60, 60, width - 120, height - 120, 30, 3)}

  <!-- Disc -->
  <circle cx="${discCx}" cy="${discCy}" r="${discR}" fill="${CHARCOAL}" />
  ${concentricRings(discCx, discCy, [discR * 0.92, discR * 0.78, discR * 0.64])}
  ${radialBars(discCx, discCy, 48, 40, discR * 0.85)}
  <circle cx="${discCx}" cy="${discCy}" r="36" fill="${ORANGE}" />

  <!-- Title -->
  <text x="120" y="230" font-family="Inter, system-ui, sans-serif" font-size="72" font-weight="800" letter-spacing="0.35em" fill="${CHARCOAL}">ESPIK</text>

  <!-- Orange accent bars -->
  <rect x="120" y="260" width="50" height="4" fill="${ORANGE}" rx="2" />
  <rect x="178" y="260" width="24" height="4" fill="${ORANGE}" rx="2" />

  <!-- Subtitle -->
  <text x="120" y="310" font-family="Inter, system-ui, sans-serif" font-size="22" font-weight="500" letter-spacing="0.08em" fill="${CHARCOAL}" opacity="0.4">REAL-TIME SPEECH TRANSLATION</text>

  <!-- Section label -->
  <text x="120" y="460" font-family="monospace" font-size="12" font-weight="700" fill="${ORANGE}" opacity="0.5">01</text>
  <text x="148" y="460" font-family="Inter, system-ui, sans-serif" font-size="12" font-weight="700" letter-spacing="0.2em" fill="${CHARCOAL}" opacity="0.3">MODULAR DESIGN</text>

  <!-- Dot grid -->
  ${dotGrid(120, 500, 5, 3, 10, 2, CHARCOAL, 0.12)}

  <!-- Bottom decorative scrubber -->
  <rect x="120" y="${height - 100}" width="220" height="4" rx="2" fill="${CHARCOAL}" opacity="0.1" />
  <rect x="120" y="${height - 100}" width="80" height="4" rx="2" fill="${ORANGE}" opacity="0.5" />
  <polygon points="346,${height - 100} 346,${height - 96} 352,${height - 98}" fill="${CHARCOAL}" opacity="0.15" />

  <!-- Top-right dot grid decoration -->
  ${dotGrid(width - 180, 90, 4, 4, 12, 2.5, CHARCOAL, 0.1)}
</svg>`;
}

// --- Favicon SVG (square, simple) ---

function generateFaviconSvg(size: number): string {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.44;

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${size * 0.18}" fill="${CHARCOAL}" />

  <!-- Disc -->
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="${DARK}" />
  ${radialBars(cx, cy, 24, r * 0.4, r * 0.88)}
  <circle cx="${cx}" cy="${cy}" r="${r * 0.32}" fill="${ORANGE}" />

  <!-- E letterform -->
  <text x="${cx}" y="${cy + size * 0.06}" font-family="Inter, system-ui, sans-serif" font-size="${size * 0.22}" font-weight="800" fill="white" text-anchor="middle" letter-spacing="0.02em">E</text>
</svg>`;
}

// --- Generate ---

async function main() {
  console.log("Generating OG image (1200x630)...");
  const ogSvg = generateOgSvg(1200, 630);
  await sharp(Buffer.from(ogSvg)).png({ quality: 95 }).toFile(join(PUBLIC, "og.png"));
  console.log("  -> public/og.png");

  console.log("Generating Twitter OG image (1200x600)...");
  const twitterSvg = generateOgSvg(1200, 600);
  await sharp(Buffer.from(twitterSvg))
    .png({ quality: 95 })
    .toFile(join(PUBLIC, "og-twitter.png"));
  console.log("  -> public/og-twitter.png");

  console.log("Generating favicon...");
  const sizes = [16, 32, 48];
  const pngs: Buffer[] = [];

  for (const s of sizes) {
    const svg = generateFaviconSvg(s * 4); // render at 4x then downscale
    const png = await sharp(Buffer.from(svg))
      .resize(s, s, { kernel: "lanczos3" })
      .png()
      .toBuffer();
    pngs.push(png);
  }

  const ico = await pngToIco(pngs);
  writeFileSync(join(APP, "favicon.ico"), ico);
  console.log("  -> app/favicon.ico");

  // Also generate a high-res PNG icon for modern browsers
  const favicon192Svg = generateFaviconSvg(192);
  await sharp(Buffer.from(favicon192Svg))
    .png()
    .toFile(join(APP, "icon.png"));
  console.log("  -> app/icon.png");

  console.log("\nDone! All brand assets generated.");
}

main().catch(console.error);
