const fs = require('fs');
const path = require('path');
const { renames } = require('./rename-apps.js');

const BASE = path.join(__dirname, '..');
const filePath = path.join(BASE, 'public/ai-index.json');

let content = fs.readFileSync(filePath, 'utf8');
let changes = 0;

for (const [oldName, newName, oldUrl, newUrl] of renames) {
  const before = content;
  content = content.split(oldName).join(newName);
  content = content.split(oldUrl).join(newUrl);
  if (content !== before) changes++;
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('public/ai-index.json: ' + changes + ' entradas modificadas');
