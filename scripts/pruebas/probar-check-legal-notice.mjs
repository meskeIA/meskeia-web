#!/usr/bin/env node
/**
 * probar-check-legal-notice.mjs — le reinyecta a `check:legal` los casos de los que nació
 *
 * Ejecutar:  npm run legal:probar-candado
 *
 * POR QUÉ EXISTE
 * ──────────────
 * Un candado que nunca ha fallado no ha demostrado nada: puede estar comprobando algo que
 * siempre se cumple, o no estar mirando. La única prueba de que `check:legal` sirve es
 * reproducirle los casos que ocurrieron y exigir que se encienda en ellos.
 *
 * Los tres primeros son los que motivan el candado; los dos siguientes son los DOS FALSOS
 * POSITIVOS que tuvo de verdad el 18/09/2026, en sus dos primeras ejecuciones, antes de que
 * existiera `soloCodigo`. Son los más valiosos de todos, porque un candado que grita de más se
 * desactiva igual de rápido que uno que no mira:
 *
 *   1. UNA APP SIN AVISO LEGAL — el caso de origen, `test-fragilidad` (escala FRAIL, riesgo 1),
 *      única de las 21 apps `app/test-*` sin `LegalNotice`. Debe FALLAR.
 *   2. IMPORTADO PERO NO MONTADO — el falso verde: el nombre está en el fichero y la página se
 *      sirve igual de desnuda. Debe FALLAR.
 *   3. ESCONDIDO EN `<EducationalSection>` — el aviso existe pero nace plegado, que es lo que
 *      el CLAUDE.md prohíbe expresamente. Debe FALLAR.
 *   4. MENCIÓN DE `<EducationalSection>` EN UN COMENTARIO — es `simulador-bono-joven-alquiler`:
 *      su aviso está en la línea 271 y el bloque educativo empieza en la 549, pero el fichero
 *      NOMBRA el componente en un comentario de la línea 84 para explicar que ahí no debe
 *      esconderse nada. La primera versión del candado lo dio por escondido. NO debe fallar.
 *   5. REGEX CON ACENTOS GRAVES — es `conversor-markdown-html`: la segunda versión enmascaraba
 *      también las cadenas, carácter a carácter, y una regex de código en línea (con acentos
 *      graves dentro) desalineaba el enmascarado hasta tragarse un `<LegalNotice />` que sí
 *      existía. NO debe fallar.
 *   6. EL CASO SANO — app normal con su aviso en su sitio. NO debe fallar.
 *
 * Y los dos del escape, que es la puerta por la que un candado se vuelve inútil sin avisar:
 *
 *   7. `legal-ok: <razón>` CON razón escrita — NO falla, la excepción está firmada.
 *   8. `legal-ok:` a secas — SÍ falla, porque una excepción sin motivo no se puede revisar.
 *
 * Trabaja sobre un mini-catálogo en un directorio temporal: no escribe NADA en `app/`.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const CANDADO = path.join(RAIZ, 'scripts/check-legal-notice.mjs');

/** Una app correcta, para que el catálogo de prueba no sea solo casos enfermos. */
const APP_SANA = `'use client';
import { MeskeiaLogo, LegalNotice, Footer, DisclaimerCard } from '@/components';

export default function Pagina() {
  return (
    <div>
      <MeskeiaLogo />
      <header><h1>App sana</h1></header>
      <LegalNotice />
      <DisclaimerCard variant="general" severity="low" />
    </div>
  );
}
`;

const CASOS = [
  {
    n: 1,
    nombre: 'una app SIN aviso legal (el caso de test-fragilidad, 18/09/2026)',
    slug: 'app-sin-aviso',
    contenido: `'use client';
import { MeskeiaLogo, Footer, DisclaimerCard } from '@/components';

export default function Pagina() {
  return (
    <div>
      <MeskeiaLogo />
      <header><h1>Test de algo</h1></header>
      <DisclaimerCard variant="medical" severity="critical" />
    </div>
  );
}
`,
    debeFallar: true,
    esperado: /SIN AVISO LEGAL/,
  },
  {
    n: 2,
    nombre: 'LegalNotice IMPORTADO pero no montado (el falso verde)',
    slug: 'app-import-huerfano',
    contenido: `'use client';
import { MeskeiaLogo, LegalNotice, Footer } from '@/components';

export default function Pagina() {
  return (
    <div>
      <MeskeiaLogo />
      <header><h1>App</h1></header>
    </div>
  );
}
`,
    debeFallar: true,
    esperado: /IMPORTADO PERO NO MONTADO/,
  },
  {
    n: 3,
    nombre: 'el aviso ESCONDIDO dentro de <EducationalSection>',
    slug: 'app-aviso-plegado',
    contenido: `'use client';
import { MeskeiaLogo, LegalNotice, EducationalSection } from '@/components';

export default function Pagina() {
  return (
    <div>
      <MeskeiaLogo />
      <header><h1>App</h1></header>
      <EducationalSection titulo="Saber más">
        <LegalNotice />
      </EducationalSection>
    </div>
  );
}
`,
    debeFallar: true,
    esperado: /ESCONDIDO EN EL PLEGABLE/,
  },
  {
    n: 4,
    nombre: 'un COMENTARIO que nombra <EducationalSection> (falso positivo de bono-joven)',
    slug: 'app-comentario-enganoso',
    contenido: `'use client';
/**
 * Ojo: el aviso legal NO va dentro de <EducationalSection>, que nace colapsada.
 * Esta cabecera nombra el componente a propósito, que es lo que despistó al candado.
 */
import { MeskeiaLogo, LegalNotice, EducationalSection } from '@/components';

export default function Pagina() {
  return (
    <div>
      <MeskeiaLogo />
      <header><h1>App</h1></header>
      <LegalNotice />
      <EducationalSection titulo="Saber más">
        <p>Contenido educativo.</p>
      </EducationalSection>
    </div>
  );
}
`,
    debeFallar: false,
  },
  {
    n: 5,
    nombre: 'REGEX con acentos graves antes del aviso (falso positivo de markdown-html)',
    slug: 'app-regex-con-tildes',
    contenido: `'use client';
import { MeskeiaLogo, LegalNotice } from '@/components';

function aHtml(md: string): string {
  // La regex del código en línea lleva acentos graves dentro, y la comilla simple de
  // «d'Hondt» y el «https://» de abajo son justo lo que desalineaba el enmascarado.
  return md
    .replace(/\`([^\`]+)\`/g, '<code>$1</code>')
    .replace(/'/g, '&#39;')
    .replace(/https:\\/\\/(\\S+)/g, '<a href="https://$1">$1</a>');
}

export default function Pagina() {
  return (
    <div>
      <MeskeiaLogo />
      <header><h1>{aHtml('# Hola')}</h1></header>
      <LegalNotice />
    </div>
  );
}
`,
    debeFallar: false,
  },
  {
    n: 6,
    nombre: 'una app normal con su aviso en su sitio (el caso sano)',
    slug: 'app-correcta',
    contenido: APP_SANA,
    debeFallar: false,
  },
  {
    n: 7,
    nombre: 'sin aviso pero con «legal-ok: <razón>» escrita',
    slug: 'app-escape-con-razon',
    contenido: `'use client';
// legal-ok: pantalla de prueba del candado, nunca se publica
import { MeskeiaLogo } from '@/components';

export default function Pagina() {
  return <div><MeskeiaLogo /></div>;
}
`,
    debeFallar: false,
  },
  {
    n: 8,
    nombre: 'sin aviso y con «legal-ok:» a secas, sin razón',
    slug: 'app-escape-mudo',
    contenido: `'use client';
// legal-ok:
import { MeskeiaLogo } from '@/components';

export default function Pagina() {
  return <div><MeskeiaLogo /></div>;
}
`,
    debeFallar: true,
    esperado: /SIN RAZÓN ESCRITA/,
  },
];

// ── Monta un mini-catálogo desechable con SOLO los slugs pedidos ──────────────
function montar(slugs, dir) {
  fs.mkdirSync(path.join(dir, 'data'), { recursive: true });
  const urls = slugs.map((s) => `  "/${s}/",`).join('\n');
  fs.writeFileSync(
    path.join(dir, 'data/implemented-apps.ts'),
    `export const implementedAppsUrls = [\n${urls}\n];\n`,
    'utf8',
  );
  for (const caso of CASOS.filter((c) => slugs.includes(c.slug))) {
    const d = path.join(dir, 'app', caso.slug);
    fs.mkdirSync(d, { recursive: true });
    fs.writeFileSync(path.join(d, 'page.tsx'), caso.contenido, 'utf8');
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
const base = fs.mkdtempSync(path.join(os.tmpdir(), 'legal-candado-'));

try {
  for (const caso of CASOS) {
    const dir = path.join(base, `caso-${caso.n}`);
    // Cada caso va SOLO con la app sana, para que lo único que pueda encender el
    // candado sea el caso bajo prueba y no un resto del anterior.
    const slugs = caso.slug === 'app-correcta' ? ['app-correcta'] : [caso.slug, 'app-correcta'];
    montar(slugs, dir);

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
} finally {
  fs.rmSync(base, { recursive: true, force: true });
}

// Y que el repositorio REAL siga en verde después de todo esto: si la prueba hubiera escrito
// algo en `app/`, se notaría aquí.
const real = ejecutar(RAIZ);
if (real.falla) {
  fallos++;
  console.log('\n  ✗ el candado quedó ROJO sobre el repositorio real tras las pruebas');
  console.log(real.salida);
}

const deben = CASOS.filter((c) => c.debeFallar).length;
console.log(
  fallos === 0
    ? `\n✓ el candado se enciende en los ${deben} casos que debe y calla en los ${CASOS.length - deben} que debe`
    : `\n✗ ${fallos} comprobación(es) del candado no salieron como debían`,
);
process.exit(fallos === 0 ? 0 : 1);
