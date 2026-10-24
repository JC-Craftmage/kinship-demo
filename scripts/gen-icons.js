const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

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

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuffer = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeBuffer, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcData), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function createSolidPNG(w, h, r, g, b) {
  const sig = Buffer.from([137,80,78,71,13,10,26,10]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(w, 0);
  ihdrData.writeUInt32BE(h, 4);
  ihdrData.writeUInt8(8, 8);
  ihdrData.writeUInt8(2, 9);
  ihdrData.writeUInt8(0, 10);
  ihdrData.writeUInt8(0, 11);
  ihdrData.writeUInt8(0, 12);
  const ihdr = createChunk('IHDR', ihdrData);
  const raw = Buffer.alloc((w * 3 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 3 + 1)] = 0;
    for (let x = 0; x < w; x++) {
      const o = y * (w * 3 + 1) + 1 + x * 3;
      raw[o] = r; raw[o+1] = g; raw[o+2] = b;
    }
  }
  const idat = createChunk('IDAT', zlib.deflateSync(raw));
  const iend = createChunk('IEND', Buffer.alloc(0));
  return Buffer.concat([sig, ihdr, idat, iend]);
}

const dir = path.join(__dirname, '..', 'public', 'icons');
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'icon-192.png'), createSolidPNG(192, 192, 13, 148, 136));
fs.writeFileSync(path.join(dir, 'icon-512.png'), createSolidPNG(512, 512, 13, 148, 136));
console.log('Icons generated');