// Extracción ÚNICA del ranking de uso real desde Turso (uso_aplicaciones),
// excluyendo tráfico de bots/MCP/ChatGPT. Escribe el resultado en el campo
// "ranking" de audit-state.json, conservando "lastTanda" y demás claves.
// El estado "revisada/no revisada" vive en REVISION-PROGRESO.md, no aquí.
//
// Uso: node scripts/audit-pipeline/extract-ranking.mjs
import { createClient } from '@libsql/client';
import { config } from 'dotenv';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

config({ path: '.env.local', quiet: true });

const __dirname = dirname(fileURLToPath(import.meta.url));
const STATE_PATH = join(__dirname, 'audit-state.json');

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

function existeApp(slug) {
  if (slug.startsWith('guia-')) {
    return existsSync(join(__dirname, '..', '..', `app/guia/${slug.substring(5)}/page.tsx`));
  }
  return existsSync(join(__dirname, '..', '..', `app/${slug}/page.tsx`));
}

const result = await client.execute({
  sql: `SELECT aplicacion, COUNT(*) as visitas
        FROM uso_aplicaciones
        WHERE modo IS NULL OR modo NOT IN ('bot', 'mcp', 'chatgpt')
        GROUP BY aplicacion
        ORDER BY visitas DESC`,
  args: [],
});

const ranking = result.rows
  .map((r) => ({ slug: String(r.aplicacion), usos: Number(r.visitas) }))
  .filter((r) => r.slug !== 'meskeIA')
  .filter((r) => existeApp(r.slug))
  .map((r, i) => ({ ...r, rank: i + 1 }));

const state = JSON.parse(readFileSync(STATE_PATH, 'utf-8'));
state.ranking = ranking;
state.rankingExtraidoEn = new Date().toISOString().slice(0, 10);
writeFileSync(STATE_PATH, JSON.stringify(state, null, 2) + '\n');

console.log(`Ranking extraído: ${ranking.length} apps.`);
console.log(`audit-state.json actualizado (rankingExtraidoEn: ${state.rankingExtraidoEn}).`);
