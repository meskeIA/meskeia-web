import { createClient } from '@libsql/client';
import { config } from 'dotenv';

config({ path: '.env.local' });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const r = await client.execute({
  sql: `SELECT name FROM sqlite_master WHERE type='table'`,
  args: [],
});
console.log('TABLES:', r.rows.map(r => r.name));

const cols = await client.execute({
  sql: `PRAGMA table_info(uso_aplicaciones)`,
  args: [],
});
console.log('\nCOLUMNS uso_aplicaciones:');
cols.rows.forEach(c => console.log(` - ${c.name} (${c.type})`));

const sample = await client.execute({
  sql: `SELECT * FROM uso_aplicaciones LIMIT 1`,
  args: [],
});
console.log('\nSAMPLE ROW:', sample.rows[0]);
