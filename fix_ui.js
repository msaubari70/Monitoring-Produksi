const fs = require('fs');
let file = fs.readFileSync('d:/project web/app.js', 'utf8');

// The file was previously corrupted, now we do a regex to replace the remaining weird bytes 
// that showed up in the array: 'â', 'œ', '\x8F', '\uddd1', '\x9D', 'Œ', 'ï', '¸', '”', 'š', ' '

// We will just replace all characters matching 'âœ\x8f', 'â\x9DŒ', etc.
// But it's easier to just use standard replacements over the whole file text because it might be completely mangled.
// We only need standard emojis.

let replacer = (str) => {
  let s = str;
  // \u00E2\u0152\u008C is ❌
  s = s.replace(/.*Hapus Terpilih.*/g, (match) => { return match.replace(/[^A-Za-z0-9() \-_.>='"/<]/g, ' ').replace(/\s+/g, ' '); });
  s = s.replace(/âœ /g, '✏')
       .replace(/âœ\x8f/g, '✏')
       .replace(/â\x9DŒ/g, '❌')
       .replace(/âš\s*ï¸/g, '⚠️')
       .replace(/âš\s*/g, '⚠️')
       .replace(/ðŸ—‘ï¸/g, '🗑')
       .replace(/ðŸ—‘/g, '🗑')
       .replace(/â€”/g, '-')
       .replace(/ï¸/g, ''); 

  // Since it's only in button texts and toast messages, we can just remove all non-emoji non-ascii
  // from those literals if necessary, but that's risky.

  return s;
};

let cleaned = replacer(file);

// But wait! Many occurrences of emojis in javascript are just strings in HTML:
// e.g. `<button class="btn-delete" onclick="deleteBlok('${b.id}')">🗑</button>`
// Let's explicitly replace these known buttons to guarantee success:

cleaned = cleaned.replace(/>[^<]*Hapus Terpilih[^<]*</g, '>🗑 Hapus Terpilih<')
                 .replace(/>[^<]*Hapus[^<]*</g, '>🗑 Hapus<')
                 .replace(/>[^<]*Edit[^<]*</g, '>✏ Edit<')
                 .replace(/>[^<]*Pratinjau[^<]*</g, '>👁 Pratinjau<')
                 .replace(/>[^<]*Simpan[^<]*</g, '>💾 Simpan<')
                 .replace(/>[^<]*Simpan Data[^<]*</g, '>💾 Simpan Data<')
                 .replace(/>[^<]*Perbarui Data[^<]*</g, '>✏ Perbarui Data<')
                 .replace(/toast\('Data diperbarui.*'/g, "toast('Data diperbarui! ✓'")
                 .replace(/toast\('Data tersimpan.*'/g, "toast('Data tersimpan! ✓'");

fs.writeFileSync('d:/project web/app.js', cleaned, 'utf8');
