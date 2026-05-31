const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

const OUT_DIR = path.resolve(__dirname, '../src/static/tab');
const SIZE = 81;

// Colors
const INACTIVE = { r: 0x99, g: 0x99, b: 0x99 };
const ACTIVE = { r: 0xe5, g: 0x4d, b: 0x42 };

// --- PNG encoding helpers ---

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  const table = new Int32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c;
  }
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function makeChunk(type, data) {
  const typeB = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crcData = Buffer.concat([typeB, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcData), 0);
  return Buffer.concat([len, typeB, data, crc]);
}

function encodePNG(width, height, rgbaBuf) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  // Scanlines with filter byte 0
  const scanlines = [];
  for (let y = 0; y < height; y++) {
    const row = Buffer.alloc(1 + width * 4);
    row[0] = 0; // filter none
    rgbaBuf.copy(row, 1, y * width * 4, (y + 1) * width * 4);
    scanlines.push(row);
  }
  const raw = Buffer.concat(scanlines);
  const compressed = zlib.deflateSync(raw);
  const iend = Buffer.alloc(0);
  return Buffer.concat([
    signature,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', iend),
  ]);
}

// --- Drawing helpers ---

function createBuffer() {
  return Buffer.alloc(SIZE * SIZE * 4, 0); // transparent
}

function setPixel(buf, x, y, r, g, b, a = 255) {
  if (x < 0 || x >= SIZE || y < 0 || y >= SIZE) return;
  const idx = (y * SIZE + x) * 4;
  // Alpha blend
  if (buf[idx + 3] === 0 || a === 255) {
    buf[idx] = r; buf[idx + 1] = g; buf[idx + 2] = b; buf[idx + 3] = a;
  } else {
    const srcA = a / 255, dstA = buf[idx + 3] / 255;
    const outA = srcA + dstA * (1 - srcA);
    buf[idx] = Math.round((r * srcA + buf[idx] * dstA * (1 - srcA)) / outA);
    buf[idx + 1] = Math.round((g * srcA + buf[idx + 1] * dstA * (1 - srcA)) / outA);
    buf[idx + 2] = Math.round((b * srcA + buf[idx + 2] * dstA * (1 - srcA)) / outA);
    buf[idx + 3] = Math.round(outA * 255);
  }
}

function fillRect(buf, x0, y0, w, h, r, g, b, a = 255) {
  for (let y = y0; y < y0 + h; y++)
    for (let x = x0; x < x0 + w; x++)
      setPixel(buf, x, y, r, g, b, a);
}

function fillCircle(buf, cx, cy, radius, r, g, b, a = 255) {
  for (let y = cy - radius; y <= cy + radius; y++)
    for (let x = cx - radius; x <= cx + radius; x++)
      if ((x - cx) ** 2 + (y - cy) ** 2 <= radius ** 2)
        setPixel(buf, Math.round(x), Math.round(y), r, g, b, a);
}

function fillTriangle(buf, x1, y1, x2, y2, x3, y3, r, g, b, a = 255) {
  const minY = Math.max(0, Math.min(y1, y2, y3));
  const maxY = Math.min(SIZE - 1, Math.max(y1, y2, y3));
  for (let y = minY; y <= maxY; y++) {
    for (let x = 0; x < SIZE; x++) {
      if (pointInTriangle(x, y, x1, y1, x2, y2, x3, y3))
        setPixel(buf, x, y, r, g, b, a);
    }
  }
}

function pointInTriangle(px, py, x1, y1, x2, y2, x3, y3) {
  const d1 = sign(px, py, x1, y1, x2, y2);
  const d2 = sign(px, py, x2, y2, x3, y3);
  const d3 = sign(px, py, x3, y3, x1, y1);
  const hasNeg = (d1 < 0) || (d2 < 0) || (d3 < 0);
  const hasPos = (d1 > 0) || (d2 > 0) || (d3 > 0);
  return !(hasNeg && hasPos);
}

function sign(px, py, x1, y1, x2, y2) {
  return (px - x2) * (y1 - y2) - (x1 - x2) * (py - y2);
}

function fillRoundRect(buf, x, y, w, h, radius, r, g, b, a = 255) {
  fillRect(buf, x + radius, y, w - 2 * radius, h, r, g, b, a);
  fillRect(buf, x, y + radius, w, h - 2 * radius, r, g, b, a);
  fillCircle(buf, x + radius, y + radius, radius, r, g, b, a);
  fillCircle(buf, x + w - radius - 1, y + radius, radius, r, g, b, a);
  fillCircle(buf, x + radius, y + h - radius - 1, radius, r, g, b, a);
  fillCircle(buf, x + w - radius - 1, y + h - radius - 1, radius, r, g, b, a);
}

// --- Icon drawing functions ---

function drawHome(color) {
  const buf = createBuffer();
  const { r, g, b } = color;
  const cx = 40;
  // Roof (triangle)
  fillTriangle(buf, cx, 10, 12, 40, 68, 40, r, g, b);
  // House body
  fillRect(buf, 20, 40, 41, 28, r, g, b);
  // Door (cut out)
  fillRect(buf, 33, 48, 15, 20, 255, 255, 255, 0);
  // Redraw door outline
  fillRect(buf, 34, 49, 13, 19, 255, 255, 255, 0);
  // Chimney
  fillRect(buf, 52, 16, 8, 18, r, g, b);
  return buf;
}

function drawActivity(color) {
  const buf = createBuffer();
  const { r, g, b } = color;
  // Megaphone / loudspeaker icon
  // Main body (trapezoid approximated as rect + triangle)
  fillRect(buf, 15, 28, 25, 25, r, g, b);
  // Cone part
  fillTriangle(buf, 40, 20, 40, 61, 62, 40, r, g, b);
  // Handle
  fillRect(buf, 10, 34, 8, 13, r, g, b);
  // Sound waves (small lines)
  fillRect(buf, 65, 30, 3, 6, r, g, b);
  fillRect(buf, 65, 45, 3, 6, r, g, b);
  fillRect(buf, 69, 35, 3, 11, r, g, b);
  return buf;
}

function drawPoints(color) {
  const buf = createBuffer();
  const { r, g, b } = color;
  const cx = 40, cy = 40;
  // Star shape (5-pointed)
  const outerR = 30, innerR = 13;
  const points = [];
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI / 2 * 3) + (i * Math.PI / 5);
    const rad = i % 2 === 0 ? outerR : innerR;
    points.push({ x: cx + Math.cos(angle) * rad, y: cy + Math.sin(angle) * rad });
  }
  // Fill star using triangle fan from center
  for (let i = 0; i < points.length; i++) {
    const next = points[(i + 1) % points.length];
    fillTriangle(buf, cx, cy, Math.round(points[i].x), Math.round(points[i].y), Math.round(next.x), Math.round(next.y), r, g, b);
  }
  return buf;
}

function drawUser(color) {
  const buf = createBuffer();
  const { r, g, b } = color;
  // Head
  fillCircle(buf, 40, 24, 14, r, g, b);
  // Body (half ellipse approximated as rounded rect)
  fillRoundRect(buf, 16, 44, 49, 30, 14, r, g, b);
  return buf;
}

// --- Generate all icons ---

const icons = [
  { name: 'home', draw: drawHome },
  { name: 'activity', draw: drawActivity },
  { name: 'points', draw: drawPoints },
  { name: 'user', draw: drawUser },
];

for (const icon of icons) {
  // Inactive
  const inactiveBuf = icon.draw(INACTIVE);
  const inactivePng = encodePNG(SIZE, SIZE, inactiveBuf);
  const inactivePath = path.join(OUT_DIR, `${icon.name}.png`);
  fs.writeFileSync(inactivePath, inactivePng);
  console.log(`Written: ${inactivePath} (${inactivePng.length} bytes)`);

  // Active
  const activeBuf = icon.draw(ACTIVE);
  const activePng = encodePNG(SIZE, SIZE, activeBuf);
  const activePath = path.join(OUT_DIR, `${icon.name}-active.png`);
  fs.writeFileSync(activePath, activePng);
  console.log(`Written: ${activePath} (${activePng.length} bytes)`);
}

console.log('\nDone! All tab icons generated.');
