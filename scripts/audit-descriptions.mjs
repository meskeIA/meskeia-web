import { readdirSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';

const appDir = 'app';
const results = [];

const apps = readdirSync(appDir).filter(d => {
  const metaPath = join(appDir, d, 'metadata.ts');
  return existsSync(metaPath) && !d.startsWith('[') && !d.startsWith('(');
});

for (const app of apps) {
  const metaPath = join(appDir, app, 'metadata.ts');
  const content = readFileSync(metaPath, 'utf8');
  const lines = content.split('\n');

  let inMetadata = false;
  let depth = 0;
  let desc = null;

  for (const line of lines) {
    if (!inMetadata && line.includes('export const metadata') && line.includes('Metadata')) {
      inMetadata = true;
    }
    if (!inMetadata) continue;

    depth += (line.match(/\{/g) || []).length;
    depth -= (line.match(/\}/g) || []).length;

    if (depth <= 0 && desc) break;

    // Only grab description at depth 1 (top of metadata object, not openGraph)
    if (depth === 1 && /^\s{2}description:/.test(line)) {
      // Extract content between first ' and last ' on this line
      const start = line.indexOf("'") + 1;
      const end = line.lastIndexOf("'");
      if (start > 0 && end > start) {
        desc = line.slice(start, end).replace(/\\'/g, "'");
      }
    }
  }

  if (desc) {
    results.push({ app, len: desc.length, desc });
  }
}

results.sort((a, b) => a.len - b.len);

const under130 = results.filter(r => r.len < 130);
const under80 = results.filter(r => r.len < 80);

console.log('Apps con description < 130 chars:\n');
under130.forEach(r => {
  const preview = r.desc.length > 90 ? r.desc.slice(0, 90) + '…' : r.desc;
  console.log(`${r.len}\t${r.app}`);
  console.log(`    ${preview}`);
});

console.log('\n---');
console.log('Total bajo 130:', under130.length);
console.log('Total bajo  80:', under80.length);
