const fs = require('fs');
const path = require('path');
const { renames } = require('./rename-apps.js');

const BASE = path.join(__dirname, '..');
const guidesDir = path.join(BASE, 'app', 'guia');

const guides = fs.readdirSync(guidesDir).filter(d =>
  fs.statSync(path.join(guidesDir, d)).isDirectory()
);

let totalChanges = 0;

for (const guide of guides) {
  const files = ['page.tsx', 'metadata.ts', 'layout.tsx'];
  for (const file of files) {
    const filePath = path.join(guidesDir, guide, file);
    if (!fs.existsSync(filePath)) continue;

    let content = fs.readFileSync(filePath, 'utf8');
    const before = content;

    for (const [oldName, newName, oldUrl, newUrl] of renames) {
      content = content.split(oldName).join(newName);
      content = content.split(oldUrl).join(newUrl);
    }

    if (content !== before) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('  guia/' + guide + '/' + file + ': actualizado');
      totalChanges++;
    }
  }
}

console.log('Total guías modificadas: ' + totalChanges);
