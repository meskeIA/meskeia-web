#!/usr/bin/env node
/**
 * probar-check-contraste-marca.mjs — le reinyecta a `check-contraste-marca.mjs` el caso del que
 * nació (cabo C0070) y las trampas que salieron al escribir la campaña, y comprueba además que
 * la CAMPAÑA deja callado al candado.
 *
 * Ejecutar:  npm run contraste-marca:probar-candado
 *
 * POR QUÉ EXISTE
 * ──────────────
 * Un candado que nunca ha fallado no ha demostrado nada. Este se prueba con la hoja de
 * simulador-movimiento-circular tal como estaba ANTES de 8f5eb9b7 (28/09/2026, hallazgos 2381
 * y 2382), que debe FALLAR en las dos tandas, y con la misma hoja reparada, que debe CALLAR.
 *
 * Y como el criterio lo comparten candado y campaña (`clasificar.mjs`), la última parte pasa la
 * campaña con `--aplicar` sobre una copia y exige que, después, el candado calle en todo lo que
 * la campaña sabía migrar y siga rompiendo en lo que no (el fondo translúcido de lupa-digital).
 * Si un día la campaña y el candado discreparan, aquí se vería.
 *
 * Los casos 17-19 (27/10/2026, cabo C0483) son la tanda 2 en impresión: `-texto` dentro de un
 * `@media print`, con el título del parte del sonómetro de antes de 5fcd18bc como caso de origen.
 *
 * Trabaja sobre mini-catálogos en directorios temporales: no escribe NADA en `app/`.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const CANDADO = path.join(RAIZ, 'scripts', 'check-contraste-marca.mjs');
const CAMPANA = path.join(RAIZ, 'scripts', 'contraste-marca', 'campana.mjs');

const css = (...l) => l.join('\n') + '\n';

/** Cada caso: ficheros del mini-catálogo, tanda que se mira y si debe fallar. */
const CASOS = [
  {
    n: 1,
    nombre: 'CASO DE ORIGEN · movimiento-circular antes de 8f5eb9b7: blanco sobre var(--primary)',
    tanda: 1,
    debeFallar: true,
    ficheros: {
      'app/simulador-movimiento-circular/SimuladorMovimientoCircular.module.css': css(
        '.modeBtnActive {', '  border-color: var(--primary);', '  background: var(--primary);', '  color: white;', '}',
        '.stepNumber {', '  flex-shrink: 0;', '  width: 28px;', '  border-radius: 50%;', '  background: var(--primary);', '  color: white;', '}',
        "[data-theme='dark'] .modeBtnActive {", '  border-color: var(--primary);', '  background: var(--primary);', '  color: white;', '}',
      ),
    },
  },
  {
    n: 2,
    nombre: 'CASO DE ORIGEN · el título del caso en var(--secondary) (2,68:1)',
    tanda: 2,
    debeFallar: true,
    ficheros: {
      'app/simulador-movimiento-circular/SimuladorMovimientoCircular.module.css': css(
        '.casoTitulo {', '  margin: 0 0 var(--spacing-sm);', '  font-size: 1.1rem;', '  color: var(--secondary);', '}',
        '.modeBtn:hover {', '  border-color: var(--primary);', '  color: var(--primary);', '}',
      ),
    },
  },
  {
    n: 3,
    nombre: 'EL MISMO, REPARADO como lo dejó 8f5eb9b7: -boton y -texto',
    tanda: null,
    debeFallar: false,
    ficheros: {
      'app/simulador-movimiento-circular/SimuladorMovimientoCircular.module.css': css(
        '.modeBtnActive,', '.modeBtnActive:hover {', '  border-color: var(--primary-boton);', '  background: var(--primary-boton);', '  color: white;', '}',
        '.casoTitulo {', '  color: var(--secondary-texto);', '}',
        '.modeBtn:hover {', '  border-color: var(--primary);', '  color: var(--primary-texto);', '}',
      ),
    },
  },
  {
    n: 4,
    nombre: 'NOTA DEL 14/10 · lupa-digital: degradado #2E86AB→#48A9A6 escrito a mano',
    tanda: 1,
    debeFallar: true,
    ficheros: {
      'app/lupa-digital/LupaDigital.module.css': css('.btnActivar {', '  background: linear-gradient(135deg, #2E86AB 0%, #48A9A6 100%);', '  color: white;', '}'),
    },
  },
  {
    n: 5,
    nombre: 'NOTA DEL 14/10 · lupa-digital: «Congelada» sobre rgba(46,134,171,0.85) (a mano, sin sustituto)',
    tanda: 1,
    debeFallar: true,
    ficheros: {
      'app/lupa-digital/LupaDigital.module.css': css('.congeladoIndicador {', '  background: rgba(46, 134, 171, 0.85);', '  color: white;', '}'),
    },
  },
  {
    n: 6,
    nombre: 'HOVER QUE HEREDA EL BLANCO del estado base, con :not(:disabled)',
    tanda: 1,
    debeFallar: true,
    ficheros: {
      'app/x/X.module.css': css('.btn {', '  background: var(--primary-boton);', '  color: #fff;', '}', '.btn:hover:not(:disabled) {', '  background: var(--secondary);', '}'),
    },
  },
  {
    n: 7,
    nombre: 'COMPUESTO: .opcion.activa toma el blanco de .activa',
    tanda: 1,
    debeFallar: true,
    ficheros: { 'app/x/X.module.css': css('.activa { color: white; }', '.opcion.activa { background: var(--primary); }') },
  },
  {
    n: 8,
    nombre: 'BLOQUE EN UNA LÍNEA y override oscuro que repone el token',
    tanda: 1,
    debeFallar: true,
    ficheros: {
      'app/x/X.module.css': css('.tab { background: var(--primary-boton); color: white; }', "[data-theme='dark'] .tab { background: var(--primary); }"),
    },
  },
  {
    n: 9,
    nombre: 'ESTILO EN LÍNEA de varias líneas: fondo de marca y blanco en el JSX',
    tanda: 1,
    debeFallar: true,
    ficheros: {
      'app/x/page.tsx': [
        'export default function P({ activo }: { activo: boolean }) {',
        '  return (',
        '    <button',
        '      type="button"',
        '      style={{',
        "        background: activo ? 'var(--primary)' : 'var(--bg-card)',",
        "        color: activo ? 'white' : 'var(--text-primary)',",
        '      }}',
        '    >A</button>',
        '  );',
        '}',
      ].join('\n'),
    },
  },
  {
    n: 10,
    nombre: 'ESTILO EN LÍNEA: texto en #2E86AB',
    tanda: 2,
    debeFallar: true,
    ficheros: { 'app/x/page.tsx': "export const A = () => <span style={{ color: '#2E86AB', fontWeight: 600 }}>x</span>;\n" },
  },
  {
    n: 11,
    nombre: 'TEXTO EN DEGRADADO (background-clip: text) es de la tanda 2, no de la 1',
    tanda: 2,
    debeFallar: true,
    ficheros: {
      'app/x/X.module.css': css('.titulo {', '  background: linear-gradient(90deg, var(--primary), var(--secondary));', '  -webkit-background-clip: text;', '  -webkit-text-fill-color: transparent;', '}'),
    },
  },
  {
    n: 16,
    nombre: 'FONDO CLARO FIJO: el CTA blanco de los cursos con texto var(--primary) (en oscuro, -texto daría 2,6:1)',
    tanda: 2,
    debeFallar: true,
    ficheros: {
      'app/curso-x/CursoX.module.css': css('.container { --primary: #2E86AB; }', '.ctaButton {', '  background: white;', '  color: var(--primary);', '}'),
    },
  },
  {
    n: 12,
    nombre: 'NO DEBE ENCENDER · hero-bg con blanco, tintes, color-mix, fondo sin blanco, deshabilitado',
    tanda: null,
    debeFallar: false,
    ficheros: {
      'app/x/X.module.css': css(
        '.hero { background: var(--hero-bg); color: white; }',
        '.tinte { background: rgba(46, 134, 171, 0.08); color: var(--text-primary); }',
        '.mezcla { background: color-mix(in srgb, var(--primary) 8%, var(--bg-card)); color: var(--text-primary); }',
        '.barra { background: var(--primary); height: 4px; }',
        '.btn { background: var(--primary-boton); color: white; }',
        '.btn:disabled { background: var(--secondary); }',
        '.borde { border: 2px solid var(--primary); color: var(--text-primary); }',
      ),
      'app/x/page.tsx': "export const A = () => <div style={{ borderLeftColor: 'var(--secondary)' }}>x</div>;\n",
    },
  },
  {
    n: 13,
    nombre: 'NO DEBE ENCENDER · app con paleta propia (--primary redeclarado a otro tono)',
    tanda: null,
    debeFallar: false,
    ficheros: {
      'app/y/Y.module.css': css('.container { --primary: #10B981; }', '.btn { background: var(--primary); color: white; }', '.dato { color: var(--primary); }'),
    },
  },
  {
    n: 14,
    nombre: 'ESCAPE con razón escrita: calla',
    tanda: null,
    debeFallar: false,
    ficheros: {
      'app/x/X.module.css': css('/* marca-ok: muestra de la paleta de marca, el rótulo es decorativo */', '.muestra { background: var(--secondary); color: white; }'),
    },
  },
  {
    n: 15,
    nombre: 'ESCAPE a secas, sin razón: rompe',
    tanda: 1,
    debeFallar: true,
    ficheros: { 'app/x/X.module.css': css('/* marca-ok: */', '.muestra { background: var(--secondary); color: white; }') },
  },
  // Tanda 2 en impresión (cabo C0483): -texto dentro de @media print, el papel es blanco en los dos temas
  {
    n: 17,
    nombre: 'CASO DE ORIGEN · el título del parte del sonómetro antes de 5fcd18bc: var(--primary-texto) en @media print',
    tanda: 2,
    debeFallar: true,
    ficheros: {
      'app/sonometro/Sonometro.module.css': css(
        '@media print {', '  .parteCabecera {', '    border-bottom: 2pt solid #2e86ab;', '  }', '',
        '  .parteTitulo {', '    margin: 0 0 2mm 0;', '    font-size: 16pt;', '    color: var(--primary-texto);', '  }', '}',
      ),
    },
  },
  {
    n: 18,
    nombre: 'EL MISMO, REPARADO: var(--primary-boton), y -texto FUERA del bloque de impresión',
    tanda: null,
    debeFallar: false,
    ficheros: {
      'app/sonometro/Sonometro.module.css': css(
        '.titulo { color: var(--primary-texto); }',
        '@media print {', '  .parteTitulo {', '    color: var(--primary-boton);', '  }', '  .borde { border-color: var(--secondary-texto); }', '}',
      ),
    },
  },
  {
    n: 19,
    nombre: 'IMPRESIÓN con escape y razón escrita: calla',
    tanda: null,
    debeFallar: false,
    ficheros: {
      'app/x/X.module.css': css('@media print {', '  /* marca-ok: la hoja impresa fuerza el tema claro con data-theme */', '  .t { color: var(--secondary-texto); }', '}'),
    },
  },
];

function montar(ficheros) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'probar-marca-'));
  for (const [r, contenido] of Object.entries(ficheros)) {
    const p = path.join(dir, r);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, contenido);
  }
  return dir;
}

const correr = (script, dir, extra = []) => spawnSync(process.execPath, [script, '--raiz', dir, ...extra], { encoding: 'utf8' });

let fallos = 0;
for (const c of CASOS) {
  const dir = montar(c.ficheros);
  const r = correr(CANDADO, dir, c.tanda ? ['--tanda', String(c.tanda)] : []);
  const fallo = r.status === 1;
  const bien = fallo === c.debeFallar && (r.status === 0 || r.status === 1);
  if (!bien) fallos++;
  console.log(`${bien ? '✅' : '❌'} ${String(c.n).padStart(2)}. ${c.nombre} — ${c.debeFallar ? 'debe fallar' : 'debe callar'}, ${fallo ? 'falla' : r.status === 0 ? 'calla' : `sale con ${r.status}`}`);
  if (!bien) console.log((r.stderr || r.stdout).split('\n').slice(0, 8).map((l) => `      ${l}`).join('\n'));
  fs.rmSync(dir, { recursive: true, force: true });
}

// ─── La campaña deja callado al candado en lo que sabe migrar ──────────────────
{
  // Fuera el 5 (sin sustituto), el 15 (escape sin razón) y el 17 (impresión): la campaña no los migra
  const todos = Object.assign({}, ...CASOS.filter((c) => c.debeFallar && ![5, 15, 17].includes(c.n)).map((c, i) =>
    Object.fromEntries(Object.entries(c.ficheros).map(([r, t]) => [r.replace(/^app\/([^/]+)/, `app/$1-${i}`), t])),
  ));
  const dir = montar(todos);
  const pasos = [
    ['campaña tanda 1 --aplicar', correr(CAMPANA, dir, ['--tanda', '1', '--aplicar', '--diffs', '0'])],
    ['campaña tanda 2 --aplicar', correr(CAMPANA, dir, ['--tanda', '2', '--aplicar', '--diffs', '0'])],
  ];
  for (const [nombre, r] of pasos) {
    const bien = r.status === 0;
    if (!bien) fallos++;
    console.log(`${bien ? '✅' : '❌'} ${nombre} sobre los casos que fallaban`);
    if (!bien) console.log((r.stderr || r.stdout).split('\n').slice(0, 8).map((l) => `      ${l}`).join('\n'));
  }
  const tras = correr(CANDADO, dir);
  const bien = tras.status === 0;
  if (!bien) fallos++;
  console.log(`${bien ? '✅' : '❌'} tras la campaña, el candado calla en todo lo que sabía migrar — ${bien ? 'calla' : 'sigue fallando'}`);
  if (!bien) console.log((tras.stderr || tras.stdout).split('\n').slice(0, 10).map((l) => `      ${l}`).join('\n'));

  // El CTA de fondo claro fijo (caso 16) tiene que acabar en -boton, no en -texto
  const cta = fs.readdirSync(path.join(dir, 'app')).find((d) => d.startsWith('curso-x'));
  const ctaCss = fs.readFileSync(path.join(dir, 'app', cta, 'CursoX.module.css'), 'utf8');
  const bienCta = /color:\s*var\(--primary-boton\)/.test(ctaCss);
  if (!bienCta) fallos++;
  console.log(`${bienCta ? '✅' : '❌'} el texto sobre fondo claro fijo migra a --primary-boton, que no se aclara en oscuro — ${bienCta ? 'sí' : ctaCss.match(/color:[^;]*/)?.[0]}`);
  fs.rmSync(dir, { recursive: true, force: true });

  // Y en lo que NO sabe migrar sigue rompiendo: la campaña no lo toca y el candado lo ve
  const dir2 = montar(CASOS.find((c) => c.n === 5).ficheros);
  correr(CAMPANA, dir2, ['--tanda', '1', '--aplicar', '--diffs', '0']);
  const sigue = correr(CANDADO, dir2, ['--tanda', '1']);
  const bien2 = sigue.status === 1;
  if (!bien2) fallos++;
  console.log(`${bien2 ? '✅' : '❌'} el fondo translúcido de lupa-digital NO lo migra la campaña y el candado lo sigue viendo — ${bien2 ? 'falla' : 'calla'}`);
  fs.rmSync(dir2, { recursive: true, force: true });
}

console.log(fallos ? `\n❌ ${fallos} prueba(s) en rojo\n` : '\n✅ Todas las pruebas en verde\n');
process.exit(fallos ? 1 : 0);
