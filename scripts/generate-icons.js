// Simple script to generate placeholder PWA icons
// Run with: node scripts/generate-icons.js

const fs = require('fs');
const path = require('path');

// Simple 1x1 PNG (teal color) - smallest valid PNG
// This is a minimal valid PNG with a single teal pixel
function createSimplePNG(width, height) {
  // PNG signature
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  // IHDR chunk (image header)
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);  // width
  ihdrData.writeUInt32BE(height, 4); // height
  ihdrData.writeUInt8(8, 8);         // bit depth
  ihdrData.writeUInt8(2, 9);         // color type (RGB)
  ihdrData.writeUInt8(0, 10);        // compression
  ihdrData.writeUInt8(0, 11);        // filter
  ihdrData.writeUInt8(0, 12);        // interlace
  
  const ihdr = createChunk('IHDR', ihdrData);
  
  // IDAT chunk (image data) - simple solid color
  // Create raw image data (filter byte + RGB for each row)
  const rawData = Buffer.alloc((width * 3 + 1) * height);
  for (let y = 0; y < height; y++) {
    rawData[y * (width * 3 + 1)] = 0; // filter byte
    for (let x = 0; x < width; x++) {
      const offset = y * (width * 3 + 1) + 1 + x * 3;
      rawData[offset] = 0x0D;     // R (teal)
      rawData[offset + 1] = 0x94;  // G
      rawData[offset + 2] = 0x88;  // B
    }
  }
  
  // Compress with zlib
  const zlib = require('zlib');
  const compressed = zlib.deflateSync(rawData);
  
  const idat = createChunk('IDAT', compressed);
  
  // IEND chunk (end)
  const iend = createChunk('IEND', Buffer.alloc(0));
  
  return Buffer.concat([signature, ihdr, idat, iend]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  
  const typeBuffer = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeBuffer, data]);
  
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcData), 0);
  
  return Buffer.concat([length, typeBuffer, data, crc]);
}

// CRC32 implementation
function crc32(data) {
  let crc = 0xFFFFFFFF;
  const table = makeCRCTable();
  for (let i = 0; i < data.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ data[i]) & 0xFF];
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function makeCRCTable() {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c;
  }
  return table;
}

// Generate icons
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

console.log('Generating PWA icons...');

const icon192 = createSimplePNG(192, 192);
fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), icon192);
console.log('Created icon-192.png');

const icon512 = createSimplePNG(512, 512);
fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), icon512);
console.log('Created icon-512.png');

console.log('Done! PWA icons generated in public/icons/');