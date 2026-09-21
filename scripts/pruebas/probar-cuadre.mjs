#!/usr/bin/env node
/**
 * Script: probar-cuadre.mjs  (`npm run cuadre:probar-candado`)
 *
 * Le tiende las cinco trampas al Cuadre y exige que salte en las cuatro primeras y que
 * CALLE en el resto. Un detector diseñado para callar no se distingue de uno roto: esta
 * es la única forma de saber, sin leer su código, si sigue mirando.
 *
 * EL QUINTO CASO VA PRIMERO, Y ES EL QUE MANDA
 * ────────────────────────────────────────────
 * Reinyecta los últimos 400 commits REALES del repositorio y exige que el Cuadre hable en
 * DIEZ o menos. Sin él, un detector que gritara «sorpresa» en todo pasaría los otros cuatro
 * casos con matrícula de honor. Es la prueba de especificidad que en agosto salvó al
 * Inspector de ser desmontado por sano (`_private/inspector/PRUEBA-ESPECIFICIDAD.md`).
 *
 * El umbral se escribió ANTES de construir nada, el 15/09/2026, a partir de la medición:
 * con las reglas comparando conjuntos, 8 de 400. Diez deja sitio a que el catálogo cambie
 * de costumbres sin que la prueba se vuelva un trámite; a la undécima, hay que mirar qué
 * regla se ha vuelto habladora y por qué.
 *
 * Los cuatro primeros casos no tocan git ni el disco: el motor (`cuadre-motor.mjs`) recibe
 * el antes y el después a mano. Por eso esta prueba corre en un segundo y se puede repetir
 * tantas veces como haga falta.
 */

import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { contar, REGLAS_QUE_BLOQUEAN, dentroDe } from '../cuadre-motor.mjs';

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const UMBRAL_ESPECIFICIDAD = 10;
const COMMITS_A_REINYECTAR = 400;

const casos = [];
const anotar = (nombre, ok, detalle = '') => casos.push({ nombre, ok, detalle });

/** Ejecuta el motor sobre un escenario escrito a mano. */
function cuadrar(escenario) {
  const antes = escenario.antes || {};
  const despues = escenario.despues || {};
  return contar({
    ficheros: escenario.ficheros,
    leerAntes: (r) => (r in antes ? antes[r] : null),
    leerDespues: (r) => (r in despues ? despues[r] : null),
    ficherosFuera: escenario.ficherosFuera || [],
  });
}

const reglasDe = (r) => r.hallazgos.map((h) => h.regla);

// ═══════════════════════════════════════════════════════════════════════════
// CASO 5 · Especificidad: los 400 commits reales (el que autoriza a los demás)
// ═══════════════════════════════════════════════════════════════════════════

const simulacion = spawnSync(
  process.execPath,
  [path.join(RAIZ, 'scripts', 'cuadre.mjs'), '--simular', String(COMMITS_A_REINYECTAR)],
  { encoding: 'utf8', cwd: RAIZ, maxBuffer: 1 << 26 },
);
const salida = `${simulacion.stdout ?? ''}${simulacion.stderr ?? ''}`;
const marcador = salida.match(/SIMULACION:\s*(\d+)\s+de\s+(\d+)/);

anotar(
  '5 · la simulación de los 400 commits se puede ejecutar',
  Boolean(marcador),
  marcador ? '' : salida.trim().split('\n').slice(-3).join(' · ') || 'sin salida',
);

if (marcador) {
  const habla = Number(marcador[1]);
  const sobre = Number(marcador[2]);
  anotar(
    `5 · habla en ${habla} de ${sobre} commits reales (umbral ${UMBRAL_ESPECIFICIDAD})`,
    habla <= UMBRAL_ESPECIFICIDAD,
    habla > UMBRAL_ESPECIFICIDAD ? 'DEMASIADO HABLADOR: el bloqueo no se puede enganchar así' : '',
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CASOS 1-4 · Las trampas: tiene que saltar
// ═══════════════════════════════════════════════════════════════════════════

// 1 · El caso del usuario: le borro un test a propósito.
{
  const r = cuadrar({
    ficheros: [{ ruta: 'tests/apps/calculadora-iva.spec.ts', estado: 'D' }],
    antes: { 'tests/apps/calculadora-iva.spec.ts': 'test("el IVA general es del 21%", ...)' },
  });
  anotar('1 · salta al borrar un test', reglasDe(r).includes('test-borrado'), reglasDe(r).join(', '));
}

// 2 · Dependencia inventada en package.json.
{
  const r = cuadrar({
    ficheros: [{ ruta: 'package.json', estado: 'M' }],
    antes: { 'package.json': JSON.stringify({ dependencies: { next: '^16.2.0' } }) },
    despues: { 'package.json': JSON.stringify({ dependencies: { next: '^16.2.0', 'left-pad': '^1.3.0' } }) },
  });
  anotar('2 · salta con una dependencia nueva', reglasDe(r).includes('dependencia-nueva'), reglasDe(r).join(', '));
}

// 3 · Un candado sale de la cadena del build.
{
  const cadena = (candados) => JSON.stringify({ scripts: { build: `${candados.map((c) => `node scripts/${c}`).join(' && ')} && next build` } });
  const r = cuadrar({
    ficheros: [{ ruta: 'package.json', estado: 'M' }],
    antes: { 'package.json': cadena(['check-verticales.mjs', 'check-og-image.mjs', 'check-tipos.mjs']) },
    despues: { 'package.json': cadena(['check-verticales.mjs', 'check-tipos.mjs']) },
  });
  anotar('3 · salta al desenganchar un candado del build', reglasDe(r).includes('candado-fuera-del-build'), reglasDe(r).join(', '));
}

// 4 · Se cae el disclaimer de una app. El riesgo principal del catálogo: responsabilidad
//     ante terceros. Tiene que saltar aunque el commit vaya de otra cosa.
{
  const con = 'export default function App() {\n  return <><LegalNotice />\n<DisclaimerCard variant="financial" severity="critical" />\n<Resultado /></>;\n}';
  const sin = 'export default function App() {\n  return <><LegalNotice />\n<Resultado /></>;\n}';
  const r = cuadrar({
    ficheros: [{ ruta: 'app/estimador-irpf/page.tsx', estado: 'M' }],
    antes: { 'app/estimador-irpf/page.tsx': con },
    despues: { 'app/estimador-irpf/page.tsx': sin },
  });
  anotar('4 · salta cuando cae el DisclaimerCard de una app', reglasDe(r).includes('guardia-a-cero'), reglasDe(r).join(', '));
}

// 4.bis · Y las demás guardias del mismo grupo.
{
  const r = cuadrar({
    ficheros: [{ ruta: 'app/calculadora-seccion-cable/page.tsx', estado: 'M' }],
    antes: { 'app/calculadora-seccion-cable/page.tsx': '<RegionBadge variant="es-data" />\n<Lienzo />' },
    despues: { 'app/calculadora-seccion-cable/page.tsx': '<Lienzo />' },
  });
  anotar('4.bis · salta cuando cae el RegionBadge', reglasDe(r).includes('guardia-a-cero'), reglasDe(r).join(', '));
}

// 4.ter · Escape ajeno añadido a un fichero que ya existía.
{
  const r = cuadrar({
    ficheros: [{ ruta: 'app/estimador-irpf/page.tsx', estado: 'M' }],
    antes: { 'app/estimador-irpf/page.tsx': 'const total = calcular(base);' },
    despues: { 'app/estimador-irpf/page.tsx': '// @ts-ignore\nconst total = calcular(base);' },
  });
  anotar('4.ter · salta con un @ts-ignore nuevo', reglasDe(r).includes('escape-ajeno'), reglasDe(r).join(', '));
}

// 4.quater · Se escribió fuera del repositorio.
{
  const r = cuadrar({ ficheros: [], ficherosFuera: ['C:/Users/jaceb/.claude/settings.json'] });
  anotar('4.quater · salta al escribir fuera de meskeia-web', reglasDe(r).includes('fuera-del-repositorio'), reglasDe(r).join(', '));
}

// 4.quinquies · La caja de la letra de unidad NO decide si algo está fuera.
//
// El caso real, del 21/09/2026: el harness emitió las rutas del transcript como
// `c:\Users\jaceb\meskeia-web\…` mientras `RAIZ` se resuelve como `C:\…`, y las DIEZ escrituras
// de un commit legítimo salieron como «fuera del ámbito declarado». El commit hubo que
// autorizarlo a mano con CUADRE_OK. Las cuatro actas del 16/09 tienen cero de estas líneas y
// las dos del 21/09 tienen diez cada una.
//
// ⚠️ La trampa 4.quater NO podía cazarlo: recibe `ficherosFuera` ya calculado, así que da por
// buena justo la parte que estaba rota. Esta ejercita la comparación misma.
{
  const DENTRO_MINUSCULA = [
    'c:\\Users\\jaceb\\meskeia-web\\app\\conjugador-verbos\\page.tsx',
    'c:\\Users\\jaceb\\meskeia-web\\scripts\\gsc-promesa.mjs',
    'c:\\Users\\jaceb\\meskeia-web\\tests\\apps\\tabla-valencias.spec.ts',
  ];
  const raiz = path.join(RAIZ);
  const todasDentro = DENTRO_MINUSCULA.every((r) => dentroDe(path.resolve(r), raiz));
  anotar(
    '4.quinquies · una ruta de DENTRO en minúscula NO se marca fuera',
    todasDentro,
    `${DENTRO_MINUSCULA.filter((r) => !dentroDe(path.resolve(r), raiz)).length} falsos positivos`,
  );

  // Y la simétrica: que no se haya vuelto ciego de tanto normalizar.
  const fuera = ['C:\\Users\\jaceb\\Documents\\otro-sitio\\x.ts', 'c:\\Windows\\System32\\drivers\\etc\\hosts'];
  anotar(
    '4.quinquies · lo que SÍ está fuera se sigue viendo fuera',
    fuera.every((r) => !dentroDe(path.resolve(r), raiz)),
    fuera.filter((r) => dentroDe(path.resolve(r), raiz)).join(', '),
  );

  // Y que esta trampa NO es vacua: con `insensible: false` se reproduce el comportamiento viejo
  // y el caso vuelve a fallar. Un caso que pasa con el código roto y con el arreglado no prueba
  // nada; esta línea es la que le da valor a las dos de arriba.
  anotar(
    '4.quinquies · la trampa caza el fallo (no pasa con el código viejo)',
    DENTRO_MINUSCULA.every((r) => dentroDe(path.resolve(r), raiz, { insensible: false }) === false),
    'si esto falla, el caso ya no distingue el bug y hay que rehacerlo',
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CASOS NEGATIVOS · Lo que hace a diario, y tiene que pasar en silencio
// ═══════════════════════════════════════════════════════════════════════════

// N1 · Crear una app nueva. Medido: 40 de los últimos 400 commits crearon apps y ninguno
//      dispara. Nacer no es una sorpresa: estas reglas miran lo que desaparece.
{
  const r = cuadrar({
    ficheros: [
      { ruta: 'app/calculadora-nueva/page.tsx', estado: 'A' },
      { ruta: 'app/calculadora-nueva/metadata.ts', estado: 'A' },
      { ruta: 'app/calculadora-nueva/layout.tsx', estado: 'A' },
      { ruta: 'app/calculadora-nueva/page.module.css', estado: 'A' },
      { ruta: 'tests/apps/calculadora-nueva.spec.ts', estado: 'A' },
      { ruta: 'data/applications.ts', estado: 'M' },
      { ruta: 'data/implemented-apps.ts', estado: 'M' },
      { ruta: 'data/app-relations.ts', estado: 'M' },
    ],
    antes: {
      'data/applications.ts': '  slug: "a",\n  slug: "b",',
      'data/implemented-apps.ts': '  slug: "a",\n  slug: "b",',
      'data/app-relations.ts': '  slug: "a",\n  slug: "b",',
    },
    despues: {
      'data/applications.ts': '  slug: "a",\n  slug: "b",\n  slug: "calculadora-nueva",',
      'data/implemented-apps.ts': '  slug: "a",\n  slug: "b",\n  slug: "calculadora-nueva",',
      'data/app-relations.ts': '  slug: "a",\n  slug: "b",\n  slug: "calculadora-nueva",',
    },
  });
  anotar('N1 · crear una app nueva NO dispara', r.hallazgos.length === 0, reglasDe(r).join(', '));
}

// N2 · Subir la versión de una dependencia que ya estaba (parche de seguridad).
{
  const r = cuadrar({
    ficheros: [{ ruta: 'package.json', estado: 'M' }],
    antes: { 'package.json': JSON.stringify({ dependencies: { next: '^16.2.11' } }) },
    despues: { 'package.json': JSON.stringify({ dependencies: { next: '^16.2.12' } }) },
  });
  anotar('N2 · actualizar una dependencia NO dispara', r.hallazgos.length === 0, reglasDe(r).join(', '));
}

// N3 · Añadir un candado a la cadena del build. Con reglas que leen líneas del diff, este
//      caso disparaba —la línea "build" entera se reescribe—; es el falso positivo que
//      obligó a comparar conjuntos.
{
  const cadena = (c) => JSON.stringify({ scripts: { build: `${c.map((x) => `node scripts/${x}`).join(' && ')} && next build` } });
  const r = cuadrar({
    ficheros: [{ ruta: 'package.json', estado: 'M' }],
    antes: { 'package.json': cadena(['check-verticales.mjs']) },
    despues: { 'package.json': cadena(['check-verticales.mjs', 'check-cuadre.mjs']) },
  });
  anotar('N3 · añadir un candado al build NO dispara', r.hallazgos.length === 0, reglasDe(r).join(', '));
}

// N4 · Mover un aviso de sitio dentro del mismo fichero: el literal sigue estando.
{
  const r = cuadrar({
    ficheros: [{ ruta: 'app/x/page.tsx', estado: 'M' }],
    antes: { 'app/x/page.tsx': '<div className={styles.aviso} role="alert">Error</div>\n<Resultado />' },
    despues: { 'app/x/page.tsx': '<Resultado />\n<div className={styles.alerta} role="alert">Error</div>' },
  });
  anotar('N4 · mover un role="alert" NO dispara', r.hallazgos.length === 0, reglasDe(r).join(', '));
}

// N5 · Escape de la casa: se nombra en el acta, no bloquea. Su convención ya obliga a
//      escribir la razón al lado, que es el rastro que el Cuadre busca.
{
  const r = cuadrar({
    ficheros: [{ ruta: 'app/x/page.tsx', estado: 'M' }],
    antes: { 'app/x/page.tsx': 'const v = parseSpanishNumber(entrada);' },
    despues: { 'app/x/page.tsx': '// parser-ok: es el value de un input range, lo genera la app\nconst v = parseFloat(rango.value);' },
  });
  const nombrado = r.notas.some((n) => n.tipo === 'escape-de-la-casa');
  anotar('N5 · escape de la casa se nombra pero NO bloquea', r.hallazgos.length === 0 && nombrado, `${reglasDe(r).join(', ')} · nombrado=${nombrado}`);
}

// N6 · Un lote grande de reparaciones del Inspector: 23 ficheros, 14 áreas, sin borrar nada.
//      Es el precio aceptado del radio apagado: pasa en silencio, y así tiene que ser.
{
  const ficheros = Array.from({ length: 23 }, (_, i) => ({ ruta: `app/app-${i}/page.tsx`, estado: 'M' }));
  const antes = Object.fromEntries(ficheros.map((f) => [f.ruta, '<DisclaimerCard />\nconst a = 1;']));
  const despues = Object.fromEntries(ficheros.map((f) => [f.ruta, '<DisclaimerCard />\nconst a = 2;']));
  const r = cuadrar({ ficheros, antes, despues });
  anotar('N6 · un lote de 23 ficheros sin borrados NO dispara', r.hallazgos.length === 0, reglasDe(r).join(', '));
  anotar('N6 · pero el acta cuenta el radio', r.radio.ficheros === 23 && r.radio.areas === 23, `${r.radio.ficheros} ficheros, ${r.radio.areas} áreas`);
}

// N7 · Ningún hallazgo puede tener una regla que no esté en la lista que bloquea.
{
  const todas = new Set();
  for (const escenario of [
    { ficheros: [{ ruta: 'tests/a.spec.ts', estado: 'D' }] },
    { ficheros: [{ ruta: 'ruido.txt', estado: 'A' }] },
  ]) {
    cuadrar(escenario).hallazgos.forEach((h) => todas.add(h.regla));
  }
  const desconocidas = [...todas].filter((r) => !REGLAS_QUE_BLOQUEAN.includes(r));
  anotar('N7 · toda regla que dispara está declarada', desconocidas.length === 0, desconocidas.join(', '));
}

// ═══════════════════════════════════════════════════════════════════════════
// LA PUERTA DE ONCE CARACTERES · el hook que rechaza --no-verify
// ═══════════════════════════════════════════════════════════════════════════
//
// El caso «mensaje que HABLA de --no-verify» está aquí porque ocurrió de verdad: el commit que
// creó este candado quedó bloqueado por explicar en su propio mensaje la regla que implantaba.

function puerta(orden) {
  const entrada = JSON.stringify({
    tool_name: 'Bash',
    cwd: RAIZ,
    tool_input: { command: orden },
  });
  const r = spawnSync(process.execPath, [path.join(RAIZ, 'scripts', 'cuadre-hook.mjs'), 'no-verify'], {
    input: entrada,
    encoding: 'utf8',
  });
  return r.status;
}

const DEBE_BLOQUEAR = [
  ['--no-verify explícito', 'git commit --no-verify -m "x"'],
  ['forma corta -n', 'git commit -n -m "x"'],
  ['flags pegados -nm', 'git commit -nm "x"'],
];
for (const [nombre, orden] of DEBE_BLOQUEAR) {
  anotar(`P · bloquea ${nombre}`, puerta(orden) === 2, `salida ${puerta(orden)}`);
}

const DEBE_PASAR = [
  ['commit normal', 'git commit -m "feat: algo"'],
  ['amend --no-edit', 'git commit --amend --no-edit'],
  ['grep -n commit', 'grep -n commit scripts/x.mjs'],
  ['git log -n 5', 'git log -n 5 --format=%h'],
  ['mensaje que HABLA de --no-verify', 'git commit -m "docs: explica por qué --no-verify está prohibido"'],
  ['heredoc que habla de --no-verify', 'git commit -m "$(cat <<\'EOF\'\nfeat: algo\n\nNo uses --no-verify: desarma los tres.\nEOF\n)"'],
];
for (const [nombre, orden] of DEBE_PASAR) {
  anotar(`P · deja pasar ${nombre}`, puerta(orden) === 0, `salida ${puerta(orden)}`);
}

// ═══════════════════════════════════════════════════════════════════════════

const fallos = casos.filter((c) => !c.ok);
console.log('\nCuadre · las cinco trampas\n');
for (const c of casos) {
  console.log(`  ${c.ok ? '✓' : '✖'} ${c.nombre}${c.detalle ? `  — ${c.detalle}` : ''}`);
}
console.log(`\n${casos.length - fallos.length}/${casos.length} casos correctos.`);

if (fallos.length > 0) {
  console.log('\nEl Cuadre NO está en condiciones de bloquear nada. Corrige antes de engancharlo.\n');
  process.exit(1);
}
console.log('\nEl Cuadre salta donde debe y calla donde debe.\n');
