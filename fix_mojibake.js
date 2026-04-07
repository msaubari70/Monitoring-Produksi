const fs = require('fs');
const files = ['d:/project web/app.js', 'd:/project web/index.html'];

for (const f of files) {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/â€”/g, '-')
       .replace(/âœ /g, '✏')
       .replace(/ðŸ—‘ï¸ /g, '🗑️')
       .replace(/ðŸ—‘/g, '🗑')
       .replace(/â Œ/g, '❌')
       .replace(/âš \ï¸ /g, '⚠️')
       .replace(/âš /g, '⚠️')
       .replace(/ðŸ’¾/g, '💾')
       .replace(/âœ…/g, '✅')
       .replace(/âœ“/g, '✓')
       .replace(/ðŸŽ¯/g, '🎯')
       .replace(/ðŸ”„/g, '🔄')
       .replace(/â “/g, '❓')
       .replace(/âœ•/g, '✕');
  fs.writeFileSync(f, c, 'utf8');
  console.log('Fixed ' + f);
}
