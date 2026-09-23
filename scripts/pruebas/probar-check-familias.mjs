#!/usr/bin/env node
/**
 * probar-check-familias.mjs — las trampas de `check:familias`
 *
 * Ejecutar:  npm run familias:probar-candado      (~1 min: tres de las trampas abren navegador)
 *
 * Un candado nuevo se prueba REINYECTÁNDOLE su caso de origen y exigiendo que falle
 * ([[project_test_juicio_baseline]]): si no, lo único que se sabe es que calla, y callar lo
 * hace igual de bien un script vacío.
 *
 *   1. EL CASO DE ORIGEN (A1), en el código real de local-comercial: «los impuestos y gastos
 *      de aquella compra» de vuelta en la lista de «No descuenta…: el neto real será menor».
 *      Es el defecto de dirección que `cfe091a7` reintrodujo al repararlo en trastero, y el que
 *      ningún análisis estático puede ver. El candado tiene que FALLAR nombrando ese campo.
 *   2. El código de hoy tiene que CALLAR, entero y con navegador.
 *   3. Una hermana declarada sin bloque en el testigo (la «octava hermana» que nadie mide).
 *   4. Un campo sin fila: el de las amortizaciones de local-comercial, el hueco A2 — el campo
 *      EXCLUSIVO de una hermana que el lote no podía ver.
 *   5. Una marca `falla` MUERTA: un caso que ya pasa marcado como hueco. Tiene que romper,
 *      o las marcas sobrevivirían a las reparaciones que se olvidan de quitarlas.
 *   6. Una tabla que el candado no entiende: tiene que PLANTARSE, no dar verde por no mirar.
 *   7. Un `falla` sin razón escrita.
 *
 * La 1 toca un fichero real, así que exige que esté limpio en git ANTES de empezar y lo
 * restaura en un `finally`, comprobando después que ha quedado idéntico. Las demás trabajan
 * sobre copias desechables (la 5, dentro de `tests/familias/` porque Playwright solo busca
 * specs ahí, con nombre `_trampa-` y borrada al terminar).
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const CANDADO = path.join(RAIZ, 'scripts/check-familias.mjs');
const { FAMILIAS } = await import(pathToFileURL(path.join(RAIZ, 'scripts/inspector/familias.mjs')).href);
const FAM = FAMILIAS.find((f) => f.id === 'compraventa');
const TESTIGO = path.join(RAIZ, FAM.testigo);
const LOCAL = path.join(RAIZ, 'app/simulador-gastos-compraventa-local-comercial/page.tsx');
const TRAMPA_SPEC = path.join(RAIZ, 'tests/familias/_trampa-marca-muerta.spec.ts');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'familias-candado-'));

/** Escribe una declaración desechable con estas familias y devuelve su ruta. */
function declaracion(nombre, familias) {
  const ruta = path.join(tmp, `${nombre}.mjs`);
  fs.writeFileSync(ruta, `export const FAMILIAS = ${JSON.stringify(familias, null, 2)};\n`, 'utf8');
  return ruta;
}

/** Copia del testigo con un cambio, fuera del repositorio (solo para las trampas estáticas). */
function testigoDesechable(nombre, cambiar) {
  const ruta = path.join(tmp, `${nombre}.spec.ts`);
  const src = fs.readFileSync(TESTIGO, 'utf8');
  const nuevo = cambiar(src);
  if (nuevo === src) throw new Error(`la trampa ${nombre} no ha cambiado nada: su patrón ya no casa`);
  fs.writeFileSync(ruta, nuevo, 'utf8');
  return ruta;
}

function correr(argumentos) {
  const r = spawnSync(process.execPath, [CANDADO, ...argumentos], {
    cwd: RAIZ,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    timeout: 8 * 60 * 1000,
  });
  return { fallo: r.status !== 0, salida: `${r.stdout ?? ''}${r.stderr ?? ''}` };
}

/** Sustituye una vez y exige que el patrón exista, para que la trampa no pruebe el vacío. */
function unaVez(src, viejo, nuevo) {
  const n = src.split(viejo).length - 1;
  if (n !== 1) throw new Error(`se esperaba 1 coincidencia y hay ${n}: «${viejo.slice(0, 70)}»`);
  return src.replace(viejo, nuevo);
}

const casos = [
  {
    nombre: '1-origen-A1-direccion-invertida',
    debeFallar: true,
    espera: 'Impuestos y gastos que pagaste al comprarlo',
    correr: () => {
      const limpio = spawnSync('git', ['diff', '--quiet', '--', LOCAL], { cwd: RAIZ }).status === 0;
      if (!limpio) throw new Error(`${LOCAL} tiene cambios sin commitear: la trampa no lo toca`);
      const original = fs.readFileSync(LOCAL, 'utf8');
      // Con autocrlf, el fichero puede estar en CRLF o en LF según quién lo tocó el último.
      const crlf = original.includes('\r\n');
      try {
        let A1 = unaVez(
          original.replace(/\r\n/g, '\n'),
          "        resultadosVendedor.gestoriaLegible ? null : 'la gestoría de la venta',\n",
          "        resultadosVendedor.gestoriaLegible ? null : 'la gestoría de la venta',\n" +
            "        resultadosVendedor.gastosAdquisicionLegible ? null : 'los impuestos y gastos de aquella compra',\n",
        );
        A1 = unaVez(
          A1,
          'resultadosVendedor.gastosAdquisicionLegible || !(resultadosVendedor.irpfGanancia > 0)',
          'true',
        );
        fs.writeFileSync(LOCAL, crlf ? A1.replace(/\n/g, '\r\n') : A1, 'utf8');
        return correr(['--grep', 'local-comercial']);
      } finally {
        fs.writeFileSync(LOCAL, original, 'utf8');
        if (fs.readFileSync(LOCAL, 'utf8') !== original) {
          console.error(`\n✗ ${LOCAL} NO ha quedado como estaba: git checkout -- ${LOCAL}\n`);
          process.exit(2);
        }
      }
    },
  },
  {
    nombre: '2-el-codigo-de-hoy-debe-callar',
    debeFallar: false,
    espera: 'testigo en verde',
    correr: () => correr([]),
  },
  {
    nombre: '3-hermana-declarada-sin-bloque',
    debeFallar: true,
    espera: '«simulador-heredar-vivienda» no tiene bloque',
    correr: () =>
      correr([
        '--estatico',
        '--declaracion',
        declaracion('octava', [{ ...FAM, slugs: [...FAM.slugs, 'simulador-heredar-vivienda'] }]),
      ]),
  },
  {
    nombre: '4-campo-sin-fila-A2',
    debeFallar: true,
    espera: '«Amortizaciones acumuladas deducidas (€)» no tiene fila',
    correr: () => {
      // Quita la fila de las amortizaciones: el objeto entero, de su `{` a su `},`.
      const t = testigoDesechable('sin-amortizaciones', (src) => {
        const i = src.indexOf("etiqueta: 'Amortizaciones acumuladas deducidas (€)'");
        const desde = src.lastIndexOf('      {\n', i);
        const hasta = src.indexOf('      },\n', i) + '      },\n'.length;
        return src.slice(0, desde) + src.slice(hasta);
      });
      return correr(['--estatico', '--declaracion', declaracion('sin-fila', [{ ...FAM, testigo: t }])]);
    },
  },
  {
    nombre: '5-marca-falla-muerta',
    debeFallar: true,
    espera: 'garaje',
    correr: () => {
      // Un caso VERDE del garaje marcado como hueco abierto: tiene que romper. La fila de la
      // gestoría del comprador está en cuatro hermanas; la primera de la tabla es la del garaje.
      const src = fs.readFileSync(TESTIGO, 'utf8');
      const fila = "        etiqueta: 'Gastos de gestoría del comprador (€)',\n";
      if (!src.includes(fila)) throw new Error('no se encuentra la fila de la gestoría del garaje');
      const trampa = src.replace(fila, `${fila}        falla: 'TRAMPA — este caso ya pasa',\n`);
      fs.writeFileSync(TRAMPA_SPEC, trampa, 'utf8');
      try {
        return correr([
          '--grep',
          'garaje · «Gastos de gestoría del comprador',
          '--declaracion',
          declaracion('muerta', [{ ...FAM, testigo: 'tests/familias/_trampa-marca-muerta.spec.ts' }]),
        ]);
      } finally {
        fs.rmSync(TRAMPA_SPEC, { force: true });
      }
    },
  },
  {
    nombre: '6-tabla-que-no-entiende-no-da-verde',
    debeFallar: true,
    espera: 'no entiende la tabla',
    correr: () => {
      const t = testigoDesechable('renombrada', (src) => src.replace(/^(\s*)slug: '/gm, "$1app: '"));
      return correr(['--estatico', '--declaracion', declaracion('renombrada', [{ ...FAM, testigo: t }])]);
    },
  },
  {
    nombre: '7-falla-sin-razon',
    debeFallar: true,
    espera: 'sin razón escrita',
    correr: () => {
      const t = testigoDesechable('falla-vacio', (src) =>
        unaVez(src, "        delta: -342,\n", "        delta: -342,\n        falla: '',\n"),
      );
      return correr(['--estatico', '--declaracion', declaracion('falla-vacio', [{ ...FAM, testigo: t }])]);
    },
  },
];

let fallos = 0;
console.log('\nTrampas de check:familias\n');

try {
  for (const caso of casos) {
    let r;
    try {
      r = caso.correr();
    } catch (e) {
      fallos++;
      console.log(`  ✗ ${caso.nombre} — la trampa no se pudo montar: ${e.message}`);
      continue;
    }
    const bienElVeredicto = r.fallo === caso.debeFallar;
    const bienElMotivo = r.salida.includes(caso.espera);
    if (bienElVeredicto && bienElMotivo) {
      console.log(`  ✓ ${caso.nombre} — ${caso.debeFallar ? 'falla' : 'calla'}, y por lo que debe`);
    } else {
      fallos++;
      console.log(`  ✗ ${caso.nombre}`);
      if (!bienElVeredicto) console.log(`      esperaba ${caso.debeFallar ? 'que FALLARA' : 'que CALLARA'} y no lo hizo`);
      if (!bienElMotivo) console.log(`      no nombra «${caso.espera}»`);
      console.log(`      dijo: ${r.salida.trim().split('\n').slice(0, 6).join(' / ')}`);
    }
  }
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
  fs.rmSync(TRAMPA_SPEC, { force: true });
}

// Y nada de lo que se ha tocado puede quedar tocado.
const sucio = execFileSync('git', ['status', '--porcelain', '--', 'app', 'tests'], { cwd: RAIZ, encoding: 'utf8' }).trim();
if (sucio) console.log(`\n⚠ quedan cambios en app/ o tests/ (¿eran previos?):\n${sucio}`);

if (fallos > 0) {
  console.error(`\n✗ ${fallos} de ${casos.length} trampas no se cumplen: el candado no vale.\n`);
  process.exit(1);
}
console.log(`\n✓ las ${casos.length} trampas se cumplen\n`);
