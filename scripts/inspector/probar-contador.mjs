/**
 * Prueba del contador de veredicto repetido de `registrar.mjs`, sobre bases DESECHABLES.
 *
 * Ejecutar con:  node scripts/inspector/probar-contador.mjs
 *
 * ── Por qué existe ────────────────────────────────────────────────────────────
 * El contador es un candado de juicio: avisa de que un indicador ha dejado de informar. Un
 * candado que nadie ha visto fallar no vale nada, así que aquí se le reinyecta cada caso y
 * se exige que dispare —y, lo que importa igual, que CALLE donde no debe—.
 *
 * Los cuatro escenarios salen del caso real del 24/08/2026, cuando saltó con 8
 * "con_hallazgos_menores" seguidos: la muestra eran diez re-inspecciones de apps recién
 * reparadas, cuyos altos ya se habían corregido, mientras la serie de primeras inspecciones
 * llevaba una racha de 2. El contador mezclaba dos poblaciones, que es la forma de fallo que
 * el candado 3 del CLAUDE.md nombra: contar un valor cuya frecuencia depende de otra
 * variable.
 *
 * Ninguna de estas bases toca `_private/inspector/inspector.db`: van por `INSPECTOR_DB`.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { pathToFileURL } from 'node:url';

// Las bases de prueba se crean donde diga el primer argumento, o junto al sistema
const TMP = process.argv[2] || fs.mkdtempSync(path.join(os.tmpdir(), 'inspector-contador-'));
const REGISTRAR = path.resolve('scripts/inspector/registrar.mjs');

/**
 * Escenario: lista de [slug, veredicto] en orden cronológico. Un slug repetido convierte la
 * segunda aparición en re-inspección, que es justo lo que el contador tiene que distinguir.
 */
function ejecutar(nombre, filas) {
  const ruta = path.join(TMP, `contador-${nombre}.db`);
  fs.rmSync(ruta, { force: true });
  const env = { ...process.env, INSPECTOR_DB: ruta };

  // Se crea la base con el esquema y se rellena a mano: aquí no se prueba el registro, se
  // prueba la LECTURA del histórico.
  const semilla = `
    import { abrir } from ${JSON.stringify(pathToFileURL(path.resolve('scripts/inspector/db.mjs')).href)};
    const db = abrir();
    const ins = db.prepare('INSERT INTO inspecciones (slug, fecha, veredicto, resumen) VALUES (?, ?, ?, ?)');
    for (const [slug, veredicto] of ${JSON.stringify(filas)}) ins.run(slug, '2026-08-24', veredicto, 'siembra de prueba');
  `;
  execFileSync(process.execPath, ['--input-type=module', '-e', semilla], { env, encoding: 'utf8' });

  return execFileSync(process.execPath, [REGISTRAR], { env, input: '[]', encoding: 'utf8' });
}

/**
 * Primeras inspecciones de n apps con veredictos ALTERNOS. Sirven para dejar cada app ya
 * inspeccionada —y así convertir la siguiente pasada en re-inspección— sin que la racha de
 * la población de primeras dispare su propia alarma y contamine la lectura.
 */
function primerasVariadas(n) {
  const slugs = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].slice(0, n);
  return slugs.map((s, i) => [s, i % 2 ? 'con_hallazgos' : 'con_hallazgos_menores']);
}

const casos = [
  {
    nombre: 'primeras-repetidas',
    filas: ['a', 'b', 'c', 'd', 'e', 'f'].map((s) => [s, 'con_hallazgos']),
    debeAlarmar: /PRIMERA vez/,
    porque: 'seis primeras inspecciones seguidas con el mismo veredicto',
  },
  {
    nombre: 're-graves',
    filas: [...primerasVariadas(5), ...['a', 'b', 'c', 'd', 'e'].map((s) => [s, 'con_hallazgos'])],
    debeAlarmar: /Lo que no cierra es la REPARACIÓN/,
    porque: 'cinco re-inspecciones seguidas vuelven a encontrar hallazgos graves',
  },
  {
    nombre: 're-ok',
    filas: [...primerasVariadas(5), ...['a', 'b', 'c', 'd', 'e'].map((s) => [s, 'ok'])],
    debeAlarmar: /sin un solo hallazgo/,
    porque: 'cinco re-inspecciones seguidas sin encontrar nada',
  },
  {
    nombre: 're-menores',
    // EL CASO DE ORIGEN (24/08/2026): re-inspecciones de apps recién reparadas
    filas: [
      ...primerasVariadas(8),
      ...['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map((s) => [s, 'con_hallazgos_menores']),
    ],
    debeAlarmar: null,
    porque: 'ocho re-inspecciones con hallazgos MENORES: lo esperado tras reparar',
  },
];

let fallos = 0;
for (const c of casos) {
  const salida = ejecutar(c.nombre, c.filas);
  const alarmas = (salida.match(/⚠/g) || []).length;
  const bien = c.debeAlarmar
    ? alarmas === 1 && c.debeAlarmar.test(salida)
    : alarmas === 0;
  console.log(`${bien ? '✓' : '✗'} ${c.nombre.padEnd(20)} ${c.porque}`);
  if (!bien) {
    fallos++;
    console.log('    salida:\n' + salida.split('\n').map((l) => '    | ' + l).join('\n'));
  }
}

console.log(fallos ? `\n✗ ${fallos} caso(s) mal` : '\n✓ el contador dispara donde debe y calla donde debe');
process.exit(fallos ? 1 : 0);
