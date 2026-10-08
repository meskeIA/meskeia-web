#!/usr/bin/env node
/**
 * probar-check-catalogo-cliente.mjs — le reinyecta a `check:catalogo-cliente` sus casos de origen
 *
 * Ejecutar:  npm run catalogo:probar-candado
 *
 * Un candado que nunca ha fallado no ha demostrado nada. Cada caso monta un mini-árbol en un
 * directorio temporal (no escribe NADA en el repositorio) y exige que el candado se encienda o
 * calle según corresponda:
 *
 *   1. Página `'use client'` con `getRelatedApps('slug')` — el caso de origen de las relacionadas
 *      (733.730 B en 1.005 páginas, 08/10/2026). Debe FALLAR.
 *   2. Lo mismo a través de un helper de `lib/` — por eso el candado sigue la cadena. Debe FALLAR.
 *   3. Barrel que exporta un componente que importa el catálogo — el caso de Sidebar (692.214 B
 *      en 925 páginas). Debe FALLAR.
 *   4. Barrel → componente → `@/lib` → `lib/dailyApps.ts` → catálogo — el camino que encontró el
 *      propio candado el día que nació, por el reexporte de `lib/index.ts`. Debe FALLAR.
 *   5. Un cliente que importa `ConRelacionadas` (componente de servidor) — lo convierte en
 *      cliente y arrastra el mapa. Debe FALLAR.
 *   6. Layout de servidor con `ConRelacionadas` — la forma correcta. NO debe fallar.
 *   7. `import type` y `import { type X }` desde app-relations en un cliente — no generan
 *      código. NO debe fallar.
 *   8. Un import citado dentro de una cadena — `conversor-markdown-html` tenía uno en su texto de
 *      ejemplo. NO debe fallar.
 *   9. La portada (`'use client'`) importando Sidebar por su ruta — el catálogo fuera del barrel
 *      es legítimo donde se usa. NO debe fallar.
 *  10. `catalogo-ok: <razón>` — NO falla.   11. `catalogo-ok:` a secas — SÍ falla.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const CANDADO = path.join(RAIZ, 'scripts/check-catalogo-cliente.mjs');

/** Árbol base sano: los tres ficheros que el candado exige que existan. */
const BASE = {
  'data/applications.ts': `export const applicationsDatabase = [{ name: 'x', suites: ['a'] }];\n`,
  'data/app-relations.ts': `import { RelatedApp } from '@/components/RelatedApps';\nconst mapa: Record<string, RelatedApp[]> = {};\nexport function getRelatedApps(s: string) { return mapa[s] || []; }\n`,
  'components/RelatedApps.tsx': `'use client';\nexport interface RelatedApp { url: string }\nexport default function RelatedApps() { return null; }\n`,
  'components/NumberInput.tsx': `'use client';\nimport { parseSpanishNumber } from '@/lib';\nexport default function NumberInput() { return parseSpanishNumber('1'); }\n`,
  'components/index.ts': `export { default as NumberInput } from './NumberInput';\nexport { default as RelatedApps } from './RelatedApps';\n`,
  'components/ConRelacionadas.tsx': `import { getRelatedApps } from '@/data/app-relations';\nexport default function ConRelacionadas({ slug }: { slug: string }) { return getRelatedApps(slug).length; }\n`,
  'lib/index.ts': `export { parseSpanishNumber } from './formatters';\n`,
  'lib/formatters.ts': `export function parseSpanishNumber(s: string) { return Number(s); }\n`,
  'app/mi-app/page.tsx': `'use client';\nimport { NumberInput, RelatedApps } from '@/components';\nexport default function P() { return <RelatedApps />; }\n`,
};

const CASOS = [
  { n: 1, nombre: "página 'use client' con getRelatedApps (origen, 08/10/2026)", debeFallar: true, esperado: /RELACIONADAS EN EL CLIENTE/,
    extra: { 'app/mi-app/page.tsx': `'use client';\nimport { RelatedApps } from '@/components';\nimport { getRelatedApps } from '@/data/app-relations';\nexport default function P() { return <RelatedApps apps={getRelatedApps('mi-app')} />; }\n` } },
  { n: 2, nombre: 'relacionadas a través de un helper de lib/', debeFallar: true, esperado: /lib\/relacion\.ts → data\/app-relations\.ts/,
    extra: { 'lib/relacion.ts': `export { getRelatedApps } from '@/data/app-relations';\n`,
      'app/mi-app/page.tsx': `'use client';\nimport { getRelatedApps } from '@/lib/relacion';\nexport default function P() { return getRelatedApps('x').length; }\n` } },
  { n: 3, nombre: 'barrel que exporta un componente con el catálogo (caso Sidebar)', debeFallar: true, esperado: /CATÁLOGO EN EL BARREL/,
    extra: { 'components/Sidebar.tsx': `'use client';\nimport { applicationsDatabase, type Application } from '@/data/applications';\nexport default function Sidebar() { return applicationsDatabase.length; }\n`,
      'components/index.ts': BASE['components/index.ts'] + `export { default as Sidebar } from './Sidebar';\n` } },
  { n: 4, nombre: 'barrel → NumberInput → @/lib → dailyApps → catálogo', debeFallar: true, esperado: /lib\/dailyApps\.ts → data\/applications\.ts/,
    extra: { 'lib/dailyApps.ts': `import { applicationsDatabase } from '@/data/applications';\nexport const getDailyApps = () => applicationsDatabase;\n`,
      'lib/index.ts': BASE['lib/index.ts'] + `export {\n  getDailyApps,\n} from './dailyApps';\n` } },
  { n: 5, nombre: 'un cliente que importa ConRelacionadas', debeFallar: true, esperado: /ConRelacionadas\.tsx → data\/app-relations\.ts/,
    extra: { 'app/otra/page.tsx': `'use client';\nimport ConRelacionadas from '@/components/ConRelacionadas';\nexport default function P() { return <ConRelacionadas slug="otra" />; }\n` } },
  { n: 6, nombre: 'layout de servidor con ConRelacionadas (la forma correcta)', debeFallar: false,
    extra: { 'app/mi-app/layout.tsx': `import ConRelacionadas from '@/components/ConRelacionadas';\nexport default function L({ children }: { children: React.ReactNode }) { return <ConRelacionadas slug="mi-app">{children}</ConRelacionadas>; }\n` } },
  { n: 7, nombre: 'solo tipos desde app-relations en un cliente', debeFallar: false,
    extra: { 'app/tipos/page.tsx': `'use client';\nimport type { RelatedApp } from '@/data/app-relations';\nimport { type RelatedApp as R2 } from '@/data/app-relations';\nexport default function P() { return null; }\n` } },
  { n: 8, nombre: 'import citado dentro de una cadena (conversor-markdown-html)', debeFallar: false,
    extra: { 'app/md/page.tsx': `'use client';\nimport { RelatedApps } from '@/components';\nconst EJEMPLO = \`\nimport { getRelatedApps } from '@/data/app-relations';\n\`;\nexport default function P() { return EJEMPLO; }\n` } },
  { n: 9, nombre: 'la portada importa Sidebar por su ruta', debeFallar: false,
    extra: { 'components/Sidebar.tsx': `'use client';\nimport { applicationsDatabase } from '@/data/applications';\nexport default function Sidebar() { return applicationsDatabase.length; }\n`,
      'app/page.tsx': `'use client';\nimport { NumberInput } from '@/components';\nimport Sidebar from '@/components/Sidebar';\nexport default function Home() { return <Sidebar />; }\n` } },
  { n: 10, nombre: '`catalogo-ok:` con razón', debeFallar: false,
    extra: { 'app/mi-app/page.tsx': `'use client';\n// catalogo-ok: prueba del candado, razón escrita\nimport { getRelatedApps } from '@/data/app-relations';\nexport default function P() { return getRelatedApps('x').length; }\n` } },
  { n: 11, nombre: '`catalogo-ok:` a secas', debeFallar: true, esperado: /sin razón escrita/,
    extra: { 'app/mi-app/page.tsx': `'use client';\nimport { getRelatedApps } from '@/data/app-relations'; // catalogo-ok:\nexport default function P() { return getRelatedApps('x').length; }\n` } },
];

let malos = 0;
for (const c of CASOS) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'catalogo-cliente-'));
  try {
    for (const [f, txt] of Object.entries({ ...BASE, ...c.extra })) {
      fs.mkdirSync(path.join(dir, path.dirname(f)), { recursive: true });
      fs.writeFileSync(path.join(dir, f), txt);
    }
    let fallo = false, salida = '';
    try {
      salida = execFileSync(process.execPath, [CANDADO, '--raiz', dir], { encoding: 'utf8', stdio: 'pipe' });
    } catch (e) {
      fallo = true;
      salida = `${e.stdout ?? ''}${e.stderr ?? ''}`;
    }
    const ok = fallo === c.debeFallar && (!c.esperado || c.esperado.test(salida));
    if (!ok) malos++;
    console.log(`${ok ? '✓' : '✗'} ${c.n}. ${c.nombre} — ${fallo ? 'falla' : 'calla'}${c.debeFallar ? ' (debe fallar)' : ' (debe callar)'}`);
    if (!ok) console.log(salida.split('\n').map((l) => `     ${l}`).join('\n'));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}
console.log(malos ? `\n✗ ${malos} caso(s) no se comportan como deben` : `\n✓ los ${CASOS.length} casos se comportan como deben`);
process.exit(malos ? 1 : 0);
