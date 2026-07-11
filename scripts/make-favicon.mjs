import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const publicDir = path.join(root, "public");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="32" y2="32">
      <stop stop-color="#FF3B47"/>
      <stop offset="0.45" stop-color="#FF5A3D"/>
      <stop offset="1" stop-color="#E83CFF"/>
    </linearGradient>
  </defs>
  <rect width="32" height="32" rx="8" fill="#070708"/>
  <rect x="4" y="4" width="24" height="24" rx="6" fill="url(#g)"/>
</svg>`;

const png = await sharp(Buffer.from(svg)).resize(32, 32).png().toBuffer();

// ICO with embedded PNG (supported by modern browsers)
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(1, 4);
const entry = Buffer.alloc(16);
entry[0] = 32;
entry[1] = 32;
entry[2] = 0;
entry[3] = 0;
entry.writeUInt16LE(1, 4);
entry.writeUInt16LE(32, 6);
entry.writeUInt32LE(png.length, 8);
entry.writeUInt32LE(22, 12);

const ico = Buffer.concat([header, entry, png]);
fs.writeFileSync(path.join(publicDir, "favicon.ico"), ico);
fs.writeFileSync(path.join(publicDir, "favicon-32.png"), png);
console.log("wrote public/favicon.ico", ico.length, "bytes");
