#!/usr/bin/env node
/**
 * memoria-frenos.mjs — prueba del candado de frenos de `check:memoria` (comprobación 11).
 *
 * Reinyecta el caso de origen y exige que el candado DISPARE donde debe y CALLE donde debe.
 * Es la regla del proyecto: un candado nuevo no vale hasta que se le devuelve el caso que lo
 * motivó y se comprueba que lo caza.
 *
 * El caso de origen (23/09/2026): un hook interno de Claude Code pidió compactar el índice a
 * mitad de otra tarea y se compactó en un minuto, de 21.749 B a 14.790 B. Ningún enlace se
 * perdió —las comprobaciones 1 a 10 dieron verde—, pero sí la mitad de los 31 vetos que la
 * recomposición de agosto había dejado en el índice a propósito. Esa versión tiene que FALLAR.
 *
 * Las dos versiones del índice de aquel día viven en `_private/memoria-refactor/2026-09-24/`
 * (el repositorio es público y el índice no). Si faltan, la prueba se planta: una prueba que no
 * encuentra su caso de origen y da verde no ha probado nada.
 *
 * Uso:  npm run memoria:probar-frenos
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const REPO = path.resolve(import.meta.dirname, '..', '..');
const SCRIPT = path.join(REPO, 'scripts', 'check-memoria.mjs');
const ACTA = path.join(REPO, '_private', 'memoria-refactor', '2026-09-24');
const PODA = path.join(ACTA, 'MEMORY-poda-2026-09-23.md');
const LISTA = path.join(REPO, '_private', 'frenos-indice-memoria.json');
const MEMORIA = path.join(os.homedir(), '.claude', 'projects', REPO.replace(/[:\\/]/g, '-'), 'memory');

for (const [ruta, que] of [[PODA, 'el índice de la poda del 23/09 (caso de origen)'], [LISTA, 'la lista de frenos'], [path.join(MEMORIA, 'MEMORY.md'), 'la memoria del proyecto']]) {
  if (!fs.existsSync(ruta)) {
    console.error(`\n✖ Falta ${que}: ${ruta}\n  Sin ella la prueba no prueba nada, así que se planta en vez de dar verde.\n`);
    process.exit(1);
  }
}

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'memoria-frenos-'));
const DIR = path.join(TMP, 'memory');
fs.mkdirSync(DIR);
for (const f of fs.readdirSync(MEMORIA)) {
  if (f.endsWith('.md')) fs.copyFileSync(path.join(MEMORIA, f), path.join(DIR, f));
}
const reparado = fs.readFileSync(path.join(MEMORIA, 'MEMORY.md'), 'utf8');
const lista = JSON.parse(fs.readFileSync(LISTA, 'utf8'));

/** Sustituye un fragmento que debe existir exactamente una vez: si no, la prueba está mal escrita. */
function cambiar(texto, viejo, nuevo) {
  const n = texto.split(viejo).length - 1;
  if (n !== 1) throw new Error(`La prueba busca «${viejo}» y aparece ${n} veces: rehacer el caso`);
  return texto.replace(viejo, nuevo);
}

const TERCERO = ' si el tercero ES la app, se RETIRA';

const CASOS = [
  {
    nombre: 'CASO DE ORIGEN: la poda apresurada del 23/09/2026',
    porQue: 'es la compactación que motivó el candado; las comprobaciones 1 a 10 le dieron verde',
    indice: () => fs.readFileSync(PODA, 'utf8'),
    espera: s => s.perdidos >= 20 &&
      ['plano en pág. 2+ → NO', 'literatura', 'si el tercero ES la app, se RETIRA', 'sin intérprete', 'oficio reglado + herramienta de sector = NO']
        .every(f => s.salida.includes(`«${f}»`)),
    describe: 'FALLA, con ≥20 frenos perdidos y nombrando los de «pág. 2+», clústers, API de tercero, criterio y público que PRODUCE',
  },
  {
    nombre: 'El índice reparado el 24/09',
    porQue: 'si el candado grita con el índice sano, enseña a ignorarlo',
    indice: () => reparado,
    espera: s => s.perdidos === 0 && s.sinVigilar === 0 && !s.planta && s.codigo === 0,
    describe: 'CALLA: 0 perdidos, 0 sin vigilar, exit 0',
  },
  {
    nombre: 'Un solo freno quitado',
    porQue: 'la unidad mínima de la poda de ayer: una coletilla de 25 caracteres',
    indice: () => cambiar(reparado, '; plano en pág. 2+ → NO', ''),
    espera: s => s.perdidos === 1 && s.salida.includes('«plano en pág. 2+ → NO»'),
    describe: 'FALLA con exactamente 1 perdido, y lo nombra',
  },
  {
    nombre: 'Reformatear sin tocar el sentido',
    porQue: 'quitar negritas y backticks, pasar a minúsculas y doblar espacios no es perder un freno',
    indice: () => reparado.replace(/\*\*/g, '').replace(/`/g, '')
      .replace('Control NO se toca', 'control  no  se  toca').replace('NO abrir un 5º', 'no abrir un 5º'),
    espera: s => s.perdidos === 0 && s.codigo === 0,
    describe: 'CALLA, exit 0',
  },
  {
    nombre: 'Freno movido a otra línea',
    porQue: 'el freno tiene que estar donde se lee su ficha; al final del índice no frena nada',
    indice: () => cambiar(reparado, TERCERO, '') + `\n-${TERCERO}\n`,
    espera: s => s.perdidos === 1 && s.salida.includes('«si el tercero ES la app, se RETIRA»'),
    describe: 'FALLA con 1 perdido',
  },
  {
    nombre: 'Freno nuevo que nadie apuntó en la lista',
    porQue: 'un candado que solo vigila lo declarado envejece en silencio si no avisa de lo nuevo',
    indice: () => cambiar(reparado, '[logo v2](project_logo_v2.md)', '[logo v2](project_logo_v2.md) NO reproponer'),
    espera: s => s.perdidos === 0 && s.salida.includes('Freno sin vigilar: el tramo de project_logo_v2.md'),
    describe: 'AVISA de «freno sin vigilar» en project_logo_v2.md',
  },
  {
    nombre: 'Lista que cita una ficha inexistente',
    porQue: 'una lista desfasada vigila fantasmas y deja de vigilar lo real',
    indice: () => reparado,
    lista: () => ({ ...lista, frenos: [...lista.frenos, { ficha: 'ficha-inexistente-de-prueba.md', frases: ['NO'] }] }),
    espera: s => s.salida.includes('cita una ficha que no existe: ficha-inexistente-de-prueba.md'),
    describe: 'FALLA: «lista desfasada»',
  },
  {
    nombre: 'Sin lista de frenos',
    porQue: 'sin lista no se mira nada; dar verde sería mentir',
    indice: () => fs.readFileSync(PODA, 'utf8'),
    lista: () => null,
    espera: s => s.planta && s.codigo === 1,
    describe: 'SE PLANTA con exit 1, aunque le den el índice de la poda',
  },
];

console.log('\n🧪 Prueba del candado de frenos de check:memoria\n');

let fallos = 0;
for (const [i, caso] of CASOS.entries()) {
  fs.writeFileSync(path.join(DIR, 'MEMORY.md'), caso.indice());
  const rutaLista = path.join(TMP, `frenos-${i}.json`);
  const listaCaso = caso.lista ? caso.lista() : lista;
  if (listaCaso) fs.writeFileSync(rutaLista, JSON.stringify(listaCaso));

  let salida = '';
  let codigo = 0;
  try {
    salida = execFileSync('node', [SCRIPT], {
      env: { ...process.env, MEMORIA_DIR: DIR, SERIE_MEMORIA: path.join(TMP, `serie-${i}.json`), FRENOS_MEMORIA: rutaLista },
      encoding: 'utf8',
    });
  } catch (e) {
    salida = (e.stdout || '') + (e.stderr || '');
    codigo = e.status ?? 1;
  }
  const s = {
    salida,
    codigo,
    perdidos: (salida.match(/Freno perdido en MEMORY\.md/g) || []).length,
    sinVigilar: (salida.match(/Freno sin vigilar/g) || []).length,
    planta: salida.includes('No se puede leer la lista de frenos'),
  };
  const ok = caso.espera(s);
  if (!ok) fallos++;
  console.log(`${ok ? '  ✅' : '  ❌'} ${caso.nombre}`);
  console.log(`      espera: ${caso.describe}`);
  console.log(`      obtiene: ${s.perdidos} perdidos · ${s.sinVigilar} sin vigilar · ${s.planta ? 'se planta' : 'no se planta'} · exit ${codigo}`);
  console.log(`      ${caso.porQue}\n`);
}

fs.rmSync(TMP, { recursive: true, force: true });

if (fallos) {
  console.log(`✖ ${fallos} de ${CASOS.length} casos fallan: el candado no distingue lo que dice distinguir.\n`);
  process.exit(1);
}
console.log(`✅ ${CASOS.length}/${CASOS.length}: caza la poda del 23/09, calla con el índice sano y con un reformateo, y no se deja engañar sin lista.\n`);
