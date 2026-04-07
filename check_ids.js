const fs = require('fs');
const js = fs.readFileSync('app.js', 'utf8');
const html = fs.readFileSync('index.html', 'utf8');

const matches = js.match(/document\.getElementById\(['"]([^'"]+)['"]\)/g);
if (matches) {
  matches.forEach(m => {
    const idMatch = m.match(/['"]([^'"]+)['"]/);
    if (idMatch) {
      const id = idMatch[1];
      if (!html.includes('id="' + id + '"')) {
        console.log('MISSING ID IN HTML:', id);
      }
    }
  });
}
