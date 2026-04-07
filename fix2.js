const fs = require('fs');

function fixMojibake(file) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace the known bad ones with actual emoji unicode
  content = content.replace(/â€”/g, '-')
                   .replace(/âœ/g, '✏') // pencil. it might appear with different suffixes
                   .replace(/✏\x8f/g, '✏') // catch partial
                   .replace(/✏ /g, '✏') // space
                   .replace(/ðŸ—‘ï¸/g, '🗑️')
                   .replace(/ðŸ—‘/g, '🗑')
                   .replace(/â\x9DŒ/g, '❌') // exact match for X
                   .replace(/â Œ/g, '❌')
                   .replace(/âš\s*ï¸/g, '⚠️')
                   .replace(/âš\s*/g, '⚠️')
                   .replace(/ðŸ’¾/g, '💾')
                   .replace(/âœ…/g, '✅')
                   .replace(/âœ“/g, '✓')
                   .replace(/✏\x9c/g, '✓') // sometimes it's check mark
                   .replace(/ðŸŽ¯/g, '🎯')
                   .replace(/ðŸ”„/g, '🔄')
                   .replace(/â “/g, '❓')
                   .replace(/âœ•/g, '✕');

  fs.writeFileSync(file, content, 'utf8');
}

fixMojibake('d:/project web/app.js');
fixMojibake('d:/project web/index.html');
