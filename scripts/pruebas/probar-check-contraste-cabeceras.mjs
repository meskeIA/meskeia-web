#!/usr/bin/env node
/**
 * probar-check-contraste-cabeceras.mjs — le reinyecta a `check:contraste-cabeceras` el caso
 * del que nació y las trampas que aparecieron al drenarlo.
 *
 * Ejecutar:  npm run contraste:probar-candado
 *
 * POR QUÉ EXISTE
 * ──────────────
 * Un candado que nunca ha fallado no ha demostrado nada: puede estar comprobando algo que
 * siempre se cumple, o directamente no estar mirando. La única prueba de que este sirve es
 * reproducirle el caso que ocurrió y exigir que se encienda — y, tan importante como eso,
 * darle la versión REPARADA del mismo caso y exigir que CALLE.
 *
 * LOS DOS PRIMEROS SON EL CASO DE ORIGEN, en sus dos versiones:
 *
 *   1. EL `<th>` DE NAVE-INDUSTRIAL ANTES DEL 1175 — `<tr style={{ background:
 *      'var(--primary)', color: '#fff' }}>` dentro de un `<thead>`, escrito EN LÍNEA en el
 *      JSX. Blanco sobre #2E86AB son 4,11:1 en claro y 2,79:1 en oscuro. Debe FALLAR.
 *   2. EL MISMO, REPARADO — `.cabeceraTabla { background: var(--primary-boton); color: #fff }`,
 *      que es literalmente lo que el commit 1262a0fe dejó escrito. Debe CALLAR.
 *
 * LAS CUATRO FORMAS QUE TENÍA EL PASIVO, medidas el 22/09/2026 sobre 683 bloques:
 *
 *   3. FONDO SÓLIDO en el `<th>` — la forma corriente, 429 bloques. Debe FALLAR.
 *   4. GRADIENTE DE MARCA — 154 bloques. El extremo teal da 2,80:1 y el barrido original no
 *      los vio porque solo miraba `background: var(--x)` a secas. Debe FALLAR.
 *   5. FONDO Y COLOR EN REGLAS HERMANAS — `.tabla thead tr { background }` +
 *      `.tabla th { color: white }`. Son 17 casos, y la PRIMERA versión del reparador los
 *      perdió entera porque exigía que el selector fuese idéntico. Debe FALLAR.
 *   6. BLOQUE EN UNA SOLA LÍNEA — la primera versión del detector de verificación se los
 *      comía, porque cerraba el bloque al ver la `}` antes de mirar la declaración. Debe FALLAR.
 *   7. OVERRIDE DARK QUE REPONE EL TOKEN — `[data-theme='dark'] .tabla th { background:
 *      var(--primary) }` sin repetir el color. 84 bloques del catálogo tenían un override
 *      dark que parecía arreglar algo y no arreglaba nada: en oscuro `--primary` aclara a
 *      #3FA5D1 y cae a 2,79:1. Debe FALLAR.
 *
 * Y LO QUE NO DEBE ENCENDER, que es donde un candado se vuelve inútil por gritar de más:
 *
 *   8. `var(--hero-bg)` CON BLANCO — 8,33:1, cumple de sobra. NO debe fallar.
 *   9. `color-mix(in srgb, var(--primary) 8%, transparent)` CON TEXTO OSCURO — fondo teñido,
 *      casi el de la tarjeta. Los 11 del catálogo son así. NO debe fallar.
 *  10. UN BOTÓN CON FONDO DE MARCA — `.btnPrimary`, que no es una cabecera de tabla. Son
 *      2.042 bloques de campaña aparte: si este candado los encendiera, rompería el build de
 *      medio catálogo y acabaría desactivado. NO debe fallar.
 *  11. UNA CABECERA YA REPARADA con los dos tokens `-boton`. NO debe fallar.
 *
 * Y los dos del escape, que es la puerta por la que un candado se vuelve decorativo:
 *
 *  12. `contraste-ok: <razón>` CON razón escrita — NO falla, la excepción está firmada.
 *  13. `contraste-ok:` a secas — SÍ falla, porque una excepción sin motivo no se puede revisar.
 *
 * Trabaja sobre mini-catálogos en directorios temporales: no escribe NADA en `app/`.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const CANDADO = path.join(RAIZ, 'scripts', 'check-contraste-cabeceras.mjs');

/** Cada caso: un mini-catálogo `app/<slug>/` con los ficheros que se le dan. */
const CASOS = [
  {
    n: 1,
    nombre: 'CASO DE ORIGEN · el <th> de nave-industrial antes del 1175 (JSX en línea)',
    debeFallar: true,
    ficheros: {
      'app/simulador-nave/page.tsx': [
        'export default function Pagina() {',
        '  return (',
        '    <table>',
        '      <thead>',
        "        <tr style={{ background: 'var(--primary)', color: '#fff' }}>",
        '          <th>Concepto</th>',
        '        </tr>',
        '      </thead>',
        '    </table>',
        '  );',
        '}',
      ].join('\n'),
    },
  },
  {
    n: 2,
    nombre: 'CASO DE ORIGEN REPARADO · .cabeceraTabla con --primary-boton (commit 1262a0fe)',
    debeFallar: false,
    ficheros: {
      'app/simulador-nave/page.tsx': [
        'export default function Pagina() {',
        '  return (',
        '    <table>',
        '      <thead>',
        '        <tr className={styles.cabeceraTabla}>',
        '          <th>Concepto</th>',
        '        </tr>',
        '      </thead>',
        '    </table>',
        '  );',
        '}',
      ].join('\n'),
      'app/simulador-nave/SimuladorNave.module.css': [
        '.cabeceraTabla {',
        '  background: var(--primary-boton);',
        '  color: #fff;',
        '}',
      ].join('\n'),
    },
  },
  {
    n: 3,
    nombre: 'fondo sólido en el <th> (429 bloques del pasivo)',
    debeFallar: true,
    ficheros: {
      'app/uno/Uno.module.css': [
        '.comparativaTable th {',
        '  background: var(--primary);',
        '  color: #fff;',
        '  padding: 0.75rem;',
        '}',
      ].join('\n'),
    },
  },
  {
    n: 4,
    nombre: 'gradiente de marca en el <th> (154 bloques)',
    debeFallar: true,
    ficheros: {
      'app/dos/Dos.module.css': [
        '.tabla th {',
        '  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);',
        '  color: white;',
        '}',
      ].join('\n'),
    },
  },
  {
    n: 5,
    nombre: 'fondo y color en reglas HERMANAS (17 bloques que el primer reparador perdió)',
    debeFallar: true,
    ficheros: {
      'app/tres/Tres.module.css': [
        '.comparativaTable thead tr {',
        '  background: var(--primary);',
        '}',
        '',
        '.comparativaTable th {',
        '  color: white;',
        '  padding: 0.75rem 1rem;',
        '}',
      ].join('\n'),
    },
  },
  {
    n: 6,
    nombre: 'bloque escrito en UNA sola línea',
    debeFallar: true,
    ficheros: {
      'app/cuatro/Cuatro.module.css':
        '.th { background: var(--primary); color: white; padding: 0.5rem; font-weight: 600; }\n',
    },
  },
  {
    n: 7,
    nombre: 'override dark que repone var(--primary) sin repetir el color (84 bloques)',
    debeFallar: true,
    ficheros: {
      'app/cinco/Cinco.module.css': [
        '.comparativaTable th {',
        '  background: var(--primary-boton);',
        '  color: #fff;',
        '}',
        '',
        "[data-theme='dark'] .comparativaTable th {",
        '  background: var(--primary);',
        '}',
      ].join('\n'),
    },
  },
  {
    n: 8,
    nombre: 'var(--hero-bg) con texto blanco — 8,33:1, cumple',
    debeFallar: false,
    ficheros: {
      'app/seis/Seis.module.css': [
        '.tabla th {',
        '  background: var(--hero-bg);',
        '  color: #fff;',
        '}',
      ].join('\n'),
    },
  },
  {
    n: 9,
    nombre: 'color-mix al 8% con texto oscuro — los 11 del catálogo son así',
    debeFallar: false,
    ficheros: {
      'app/siete/Siete.module.css': [
        '.comparativaTable th {',
        '  background: color-mix(in srgb, var(--primary) 8%, transparent);',
        '  color: var(--text-primary);',
        '}',
      ].join('\n'),
    },
  },
  {
    n: 10,
    nombre: 'un BOTÓN con fondo de marca — campaña aparte, no es cabecera',
    debeFallar: false,
    ficheros: {
      'app/ocho/Ocho.module.css': [
        '.btnPrimary {',
        '  background: var(--primary);',
        '  color: #fff;',
        '}',
        '',
        '.stepNumber {',
        '  background: var(--primary);',
        '  color: white;',
        '}',
      ].join('\n'),
    },
  },
  {
    n: 11,
    nombre: 'cabecera ya reparada con los dos tokens -boton',
    debeFallar: false,
    ficheros: {
      'app/nueve/Nueve.module.css': [
        '.tabla th {',
        '  background: linear-gradient(135deg, var(--primary-boton) 0%, var(--secondary-boton) 100%);',
        '  color: #fff;',
        '}',
      ].join('\n'),
    },
  },
  {
    n: 12,
    nombre: 'escape `contraste-ok:` CON razón escrita',
    debeFallar: false,
    ficheros: {
      'app/diez/Diez.module.css': [
        '/* contraste-ok: la cabecera va sobre la marca de agua del informe impreso, que se',
        '   imprime en gris al 10% y deja el azul casi blanco. */',
        '.tabla th {',
        '  background: var(--primary);',
        '  color: #fff;',
        '}',
      ].join('\n'),
    },
  },
  {
    n: 13,
    nombre: 'escape `contraste-ok:` a secas, SIN razón',
    debeFallar: true,
    ficheros: {
      'app/once/Once.module.css': [
        '/* contraste-ok: */',
        '.tabla th {',
        '  background: var(--primary);',
        '  color: #fff;',
        '}',
      ].join('\n'),
    },
  },

  // ── Regla 3: un token de TEXTO usado como FONDO (añadida el 22/09/2026) ──
  {
    n: 14,
    nombre: 'CASO DE ORIGEN 2 · el hover de EducationalSection antes del 22/09 (blanco en el estado base)',
    debeFallar: true,
    ficheros: {
      'components/EducationalSection.module.css': [
        '.toggleButton {',
        '  background: var(--secondary-boton, #327874);',
        '  color: white;',
        '}',
        '',
        '.toggleButton:hover {',
        '  background: var(--secondary-texto, #2F726F);',
        '  transform: translateY(-2px);',
        '}',
      ].join('\n'),
    },
  },
  {
    n: 15,
    nombre: 'CASO DE ORIGEN 2 REPARADO · el hover con --secondary-boton',
    debeFallar: false,
    ficheros: {
      'components/EducationalSection.module.css': [
        '.toggleButton {',
        '  background: var(--secondary-boton, #327874);',
        '  color: white;',
        '}',
        '',
        '.toggleButton:hover {',
        '  background: var(--secondary-boton, #327874);',
        '  transform: translateY(-2px);',
        '}',
      ].join('\n'),
    },
  },
  {
    n: 16,
    nombre: 'el token -texto usado como COLOR, que es para lo que existe',
    debeFallar: false,
    ficheros: {
      'app/doce/Doce.module.css': [
        '.enlace {',
        '  color: var(--primary-texto);',
        '  background: transparent;',
        '}',
      ].join('\n'),
    },
  },
  {
    n: 17,
    nombre: 'una cabecera rota en components/ — prueba de que barre el SEGUNDO árbol',
    debeFallar: true,
    ficheros: {
      'components/TablaCompartida.module.css': [
        '.tabla th {',
        '  background: var(--primary);',
        '  color: #fff;',
        '}',
      ].join('\n'),
    },
  },
  {
    n: 18,
    nombre: 'CASO DE ORIGEN 3 · var(--primary, #2E86AB) con reserva (hallazgo 1670, punnett, y 17 más)',
    debeFallar: true,
    ficheros: {
      'app/punnett/Punnett.module.css': [
        '.tabla th {',
        '  background: var(--primary, #2E86AB);',
        '  color: #fff;',
        '}',
      ].join('\n'),
    },
  },
  {
    n: 19,
    nombre: 'reserva en un estilo EN LÍNEA de un <th>',
    debeFallar: true,
    ficheros: {
      'app/tres/page.tsx': "<th style={{ background: 'var(--secondary, #48A9A6)', color: '#fff' }}>A</th>\n",
    },
  },
  {
    n: 20,
    nombre: 'CASO DE ORIGEN 3 REPARADO · --primary-boton, que no debe confundirse con la reserva',
    debeFallar: false,
    ficheros: {
      'app/punnett/Punnett.module.css': [
        '.tabla th {',
        '  background: var(--primary-boton);',
        '  color: #fff;',
        '}',
      ].join('\n'),
    },
  },
];

/** Ejecuta el candado sobre `dir` y dice si se encendió. */
function ejecutar(dir) {
  try {
    const out = execFileSync(process.execPath, [CANDADO, '--raiz', dir, '--todo'], {
      cwd: RAIZ,
      stdio: 'pipe',
      encoding: 'utf8',
    });
    return { fallo: false, salida: out };
  } catch (e) {
    return { fallo: true, salida: `${e.stdout ?? ''}${e.stderr ?? ''}` };
  }
}

let fallos = 0;
console.log('\nReinyectando a check:contraste-cabeceras sus casos…\n');

for (const caso of CASOS) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'contraste-'));
  try {
    for (const [rel, contenido] of Object.entries(caso.ficheros)) {
      const destino = path.join(dir, rel);
      fs.mkdirSync(path.dirname(destino), { recursive: true });
      fs.writeFileSync(destino, contenido);
    }
    const r = ejecutar(dir);
    const bien = r.fallo === caso.debeFallar;
    const esperado = caso.debeFallar ? 'FALLAR' : 'CALLAR';
    const obtenido = r.fallo ? 'falló' : 'calló';
    console.log(`  ${bien ? '✅' : '❌'} ${String(caso.n).padStart(2)}. ${caso.nombre}`);
    console.log(`        debe ${esperado} · ${obtenido}`);
    if (!bien) {
      fallos++;
      console.log(`        ── salida ──\n${r.salida.split('\n').map((l) => '        ' + l).join('\n')}`);
    }
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

// Y el catálogo real, que debe estar limpio: el drenaje del 22/09/2026 lo dejó sin pasivo.
const real = ejecutar(RAIZ);
console.log(`\n  ${real.fallo ? '❌' : '✅'} catálogo real: ${real.fallo ? 'HAY PASIVO' : 'sin pasivo'}`);
if (real.fallo) {
  fallos++;
  console.log(real.salida);
}

if (fallos) {
  console.error(`\n❌ ${fallos} caso(s) no se comportan como deben.\n`);
  process.exit(1);
}
console.log(`\n✅ Los ${CASOS.length} casos y el catálogo real se comportan como deben.\n`);
