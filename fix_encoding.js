const fs = require('fs');
const path = 'd:/project web/app.js';

// Read as buffer to inspect raw bytes
const buf = fs.readFileSync(path);
const text = buf.toString('utf8');

// Count occurrences of the mojibake pattern
const pattern = '\u00e2\u0080\u201c'; // â€" (UTF-8 bytes of em-dash decoded as latin-1)
const pattern2 = '\u00e2\u0080\u0093'; // â€" variant (en-dash mojibake)
const emdash = '\u2014'; // proper em-dash —
const endash = '\u2013'; // proper en-dash –

let fixed = text;

// Replace all mojibake variants with proper em-dash
// The â€" pattern when saved as UTF-8 could be various byte sequences
// Let's just do a simple string replace for what we see in the file
let count = 0;

// Search for the actual string "â€"" as it appears in the source
const searchStr = String.fromCharCode(0xE2, 0x80, 0x9C); // â€œ
const searchStr2 = String.fromCharCode(0xE2, 0x80, 0x9D); // â€
const searchStr3 = String.fromCharCode(0xE2, 0x80, 0x93); // â€"

// Let's check what we actually have
const lines = text.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('\u00e2\u20ac\u201c') || lines[i].includes('\u00e2\u20ac\u0153')) {
    console.log(`Line ${i+1} has mojibake`);
    count++;
  }
}

// Try a different approach - look for the literal string
const regex = /â€"/g;
const matches = text.match(regex);
console.log('Matches found with regex:', matches ? matches.length : 0);

// Also check for â€œ and â€
const regex2 = /â€["\u201c\u201d\u0153\u0093\u009c\u009d]/g;
const matches2 = text.match(regex2);
console.log('Extended matches:', matches2 ? matches2.length : 0);

// Let's find all non-ASCII characters and their positions
let nonAscii = [];
for (let i = 0; i < text.length; i++) {
  const code = text.charCodeAt(i);
  if (code > 127 && code < 8192) {
    nonAscii.push({ pos: i, char: text[i], code: code, hex: '0x' + code.toString(16), context: text.substring(Math.max(0, i-5), i+6) });
  }
}

console.log('Non-ASCII chars (sample):', JSON.stringify(nonAscii.slice(0, 30), null, 2));
