#!/usr/bin/env node
/**
 * probar-check-anio-titulo.mjs — le reinyecta a `check:anio-titulo` el caso del que nació
 *
 * Ejecutar:  npm run anio-titulo:probar-candado
 *
 * Un candado que nunca ha fallado no ha demostrado nada. Éste se prueba contra:
 *
 *   1. EL CASO DE ORIGEN (S0174, 01/10/2026) — `estimador-cuota-autonomo` con «2025» escrito
 *      en el title mientras su módulo estaba sellado en 2026. Debe FALLAR.
 *   2. El año a mano en el título ANIDADO de `openGraph`. Debe FALLAR.
 *   3. El año a mano en una `const title`. Debe FALLAR.
 *   4. Una plantilla que deriva el año y además escribe OTRO a mano. Debe FALLAR.
 *   5. LA FORMA BUENA — `title: \`… ${anio} …\``. NO debe fallar.
 *   6. NOMBRES con año pegado a guion o barra: «CNAE-2025», «Plan 2026-2030», «Ley 28/2022».
 *      NO debe fallar: no son el año del dato.
 *   7. UNA APP QUE NO ES FISCAL con año en el título (no importa @/data/fiscal). NO debe fallar.
 *   8. UN AÑO CITADO EN UN COMENTARIO, no en el título. NO debe fallar.
 *   9. EL AÑO EN LA DESCRIPTION, fuera del alcance a propósito (ver cabecera). NO debe fallar.
 *  10. `anio-ok: <razón>` en la línea anterior. NO debe fallar.
 *  11. `anio-ok:` a secas. SÍ debe fallar.
 *
 * Trabaja sobre un árbol desechable en el directorio temporal: no escribe NADA en `app/`.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const CANDADO = path.join(RAIZ, 'scripts/check-anio-titulo.mjs');

const PAGINA_FISCAL = `'use client';
import { FISCAL_AUTONOMOS_META } from '@/data/fiscal';
export default function Pagina() { return <p>{FISCAL_AUTONOMOS_META.fuente}</p>; }
`;
const PAGINA_NO_FISCAL = `'use client';
export default function Pagina() { return <p>Hola</p>; }
`;

const meta = (cuerpo) => `import { Metadata } from 'next';
import { FISCAL_AUTONOMOS_META } from '@/data/fiscal';

const anio = FISCAL_AUTONOMOS_META.vigencia;

${cuerpo}
`;

const APP_SANA = {
  slug: 'app-sana',
  pagina: PAGINA_FISCAL,
  metadata: meta(`export const metadata: Metadata = {
  title: \`Estimador Cuota de Autónomo \${anio} | meskeIA\`,
};`),
};

const CASOS = [
  {
    n: 1,
    nombre: 'el caso de origen: «2025» a mano en el title (estimador-cuota-autonomo, S0174)',
    slug: 'app-origen',
    metadata: meta(`export const metadata: Metadata = {
  title: 'Estimador Cuota de Autónomo 2025 - Orientación RETA | meskeIA',
};`),
    debeFallar: true,
    esperado: /AÑO ESCRITO A MANO/,
  },
  {
    n: 2,
    nombre: 'año a mano en el título anidado de openGraph',
    slug: 'app-og',
    metadata: meta(`export const metadata: Metadata = {
  title: \`Estimador \${anio} | meskeIA\`,
  openGraph: {
    type: 'website',
    title: 'Estimador 2026 - Orientación',
  },
};`),
    debeFallar: true,
    esperado: /«2026»/,
  },
  {
    n: 3,
    nombre: 'año a mano en una const title',
    slug: 'app-const',
    metadata: meta(`const title = 'Estimador de Costas Judiciales 2026 — Cuánto cuesta un juicio | meskeIA';
export const metadata: Metadata = { title };`),
    debeFallar: true,
    esperado: /AÑO ESCRITO A MANO/,
  },
  {
    n: 4,
    nombre: 'plantilla que deriva un año y escribe otro a mano',
    slug: 'app-mixta',
    metadata: meta(`export const metadata: Metadata = {
  title: \`Renta \${anio} (campaña 2027) | meskeIA\`,
};`),
    debeFallar: true,
    esperado: /«2027»/,
  },
  { n: 5, nombre: 'la forma buena: el año sale de la vigencia', ...APP_SANA, slug: 'app-buena', debeFallar: false },
  {
    n: 6,
    nombre: 'nombres con año: CNAE-2025, Plan 2026-2030, Ley 28/2022',
    slug: 'app-nombres',
    metadata: meta(`export const metadata: Metadata = {
  title: 'Buscador de códigos CNAE-2025 y epígrafes del IAE | meskeIA',
  openGraph: { title: 'Ayudas Vivienda Rural (Plan 2026-2030)' },
  twitter: { title: 'Visa Nómada Digital (Ley 28/2022)' },
};`),
    debeFallar: false,
  },
  {
    n: 7,
    nombre: 'una app NO fiscal con año en el título',
    slug: 'app-no-fiscal',
    pagina: PAGINA_NO_FISCAL,
    metadata: `import { Metadata } from 'next';
export const metadata: Metadata = { title: 'Calendario 2026 | meskeIA' };
`,
    debeFallar: false,
  },
  {
    n: 8,
    nombre: 'un año citado en un comentario',
    slug: 'app-comentario',
    metadata: meta(`// Hasta el 01/10/2026 el title decía «Estimador 2025» a mano.
/* title: 'Estimador 2025' */
export const metadata: Metadata = {
  title: \`Estimador \${anio} | meskeIA\`,
};`),
    debeFallar: false,
  },
  {
    n: 9,
    nombre: 'el año en la description, fuera del alcance a propósito',
    slug: 'app-description',
    metadata: meta(`export const metadata: Metadata = {
  title: \`Estimador SMI \${anio} | meskeIA\`,
  description: 'SMI 2026: 1.221 €/mes × 14 pagas.',
};`),
    debeFallar: false,
  },
  {
    n: 10,
    nombre: '«anio-ok:» con razón en la línea anterior',
    slug: 'app-escape',
    metadata: meta(`export const metadata: Metadata = {
  // anio-ok: «Renta 2025» es el ejercicio que se declara, no la vigencia del dato
  title: 'Test: ¿Estoy obligado a declarar la Renta 2025? | meskeIA',
};`),
    debeFallar: false,
  },
  {
    n: 11,
    nombre: '«anio-ok:» a secas, sin razón',
    slug: 'app-escape-mudo',
    metadata: meta(`export const metadata: Metadata = {
  // anio-ok:
  title: 'Test: ¿Estoy obligado a declarar la Renta 2025? | meskeIA',
};`),
    debeFallar: true,
    esperado: /SIN RAZÓN ESCRITA/,
  },
];

function montar(apps, dir) {
  for (const app of apps) {
    const d = path.join(dir, 'app', app.slug);
    fs.mkdirSync(d, { recursive: true });
    fs.writeFileSync(path.join(d, 'page.tsx'), app.pagina ?? PAGINA_FISCAL, 'utf8');
    fs.writeFileSync(path.join(d, 'metadata.ts'), app.metadata, 'utf8');
  }
}

function ejecutar(dir) {
  try {
    const out = execFileSync(process.execPath, [CANDADO, '--raiz', dir], { cwd: RAIZ, stdio: 'pipe' });
    return { falla: false, salida: String(out) };
  } catch (e) {
    return { falla: true, salida: String(e.stdout ?? '') + String(e.stderr ?? '') };
  }
}

let fallos = 0;
const base = fs.mkdtempSync(path.join(os.tmpdir(), 'anio-titulo-candado-'));

try {
  for (const caso of CASOS) {
    const dir = path.join(base, `caso-${caso.n}`);
    // Cada caso va SOLO con la app sana: lo único que puede encender el candado es el caso
    montar([caso, APP_SANA], dir);
    const r = ejecutar(dir);
    const bien = r.falla === caso.debeFallar && (!caso.esperado || caso.esperado.test(r.salida));
    if (bien) {
      console.log(`  ✓ caso ${caso.n} · ${caso.nombre}`);
    } else {
      fallos++;
      console.log(`  ✗ caso ${caso.n} · ${caso.nombre}`);
      console.log(`      esperado: ${caso.debeFallar ? 'que SE ENCIENDA' : 'que CALLE'}` +
        (caso.esperado ? ` y que la salida case con ${caso.esperado}` : ''));
      console.log(`      obtenido: ${r.falla ? 'se encendió' : 'calló'}`);
      console.log(r.salida.split('\n').map((l) => '      ' + l).join('\n'));
    }
  }

  // Un árbol sin ninguna app fiscal: el candado debe PLANTARSE, no dar verde
  const vacio = path.join(base, 'sin-fiscal');
  montar([{ slug: 'app-no-fiscal', pagina: PAGINA_NO_FISCAL, metadata: CASOS[6].metadata }], vacio);
  const rv = ejecutar(vacio);
  if (rv.falla && /detector está roto/.test(rv.salida)) {
    console.log('  ✓ caso 12 · cero apps fiscales: se planta en vez de dar verde');
  } else {
    fallos++;
    console.log('  ✗ caso 12 · cero apps fiscales: debía plantarse');
    console.log(rv.salida);
  }
} finally {
  fs.rmSync(base, { recursive: true, force: true });
}

const real = ejecutar(RAIZ);
if (real.falla) {
  fallos++;
  console.log('\n  ✗ el candado quedó ROJO sobre el repositorio real tras las pruebas');
  console.log(real.salida);
}

const deben = CASOS.filter((c) => c.debeFallar).length + 1;
console.log(
  fallos === 0
    ? `\n✓ el candado se enciende en los ${deben} casos que debe y calla en los ${CASOS.length + 1 - deben} que debe`
    : `\n✗ ${fallos} comprobación(es) del candado no salieron como debían`,
);
process.exit(fallos === 0 ? 0 : 1);
