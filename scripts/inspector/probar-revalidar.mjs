/**
 * Prueba de `--revalidar-reparadas` de `cerrar.mjs`, sobre una base DESECHABLE.
 *
 * Ejecutar con:  npm run inspector:probar-revalidar
 *
 * ── Por qué existe ────────────────────────────────────────────────────────────
 * El 24/09/2026 `--revalidar-reparadas` revalidó 16 apps en vez de 10: daba por buena TODA
 * INVALIDADA sin hallazgos abiertos, y otra sesión había añadido una función nueva (el grupo
 * sanguíneo ABO en simulador-genetica y simulador-punnett) y retocado cuatro de compraventa sin
 * hallazgo que cerrar. Una función sin inspeccionar salió de la cola sin que nada avisara.
 *
 * Desde entonces solo se revalida una INVALIDADA con un hallazgo ARREGLADO después de la última
 * vez que se dio por buena. Aquí se le reinyecta el caso de origen —tal como estaba en la base
 * real, con marcas de día— y se exige que lo deje en la cola; y, lo que importa igual, que siga
 * revalidando una reparación de verdad, también la del MISMO día de la inspección, que es la
 * que un criterio por fechas de día se habría llevado por delante.
 *
 * Los cierres pasan por `cerrar.mjs --arreglado`, no se siembran: así se prueba también que
 * el cierre deja la hora que luego se lee. Nada de esto toca `_private/inspector/inspector.db`:
 * va por `INSPECTOR_DB`.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { pathToFileURL } from 'node:url';

const TMP = process.argv[2] || fs.mkdtempSync(path.join(os.tmpdir(), 'inspector-revalidar-'));
const RUTA = path.join(TMP, 'revalidar.db');
const CERRAR = path.resolve('scripts/inspector/cerrar.mjs');
const DB_URL = pathToFileURL(path.resolve('scripts/inspector/db.mjs')).href;
fs.rmSync(RUTA, { force: true });
const env = { ...process.env, INSPECTOR_DB: RUTA };

/** Ejecuta código contra la base de prueba con el `abrir()` de verdad (esquema y migración). */
function sql(cuerpo) {
  const js = `import { abrir } from ${JSON.stringify(DB_URL)}; const db = abrir(); ${cuerpo}`;
  return execFileSync(process.execPath, ['--input-type=module', '-e', js], { env, encoding: 'utf8' });
}
const cerrar = (...args) => execFileSync(process.execPath, [CERRAR, ...args], { env, encoding: 'utf8' });

const hoy = new Date().toISOString().slice(0, 10);
const haceUnaHora = new Date(Date.now() - 3600e3).toISOString();

// ─── Siembra: seis apps inspeccionadas y vigentes ──────────────────────────────
sql(`
  const app = db.prepare(\`INSERT INTO apps (slug, hash_codigo, ultima_inspeccion, hash_inspeccionado, validada)
                          VALUES (?, 'h1', ?, 'h1|', ?)\`);
  app.run('reparada', ${JSON.stringify(hoy)}, ${JSON.stringify(haceUnaHora)});
  app.run('reparada-mismo-dia-sin-hora', ${JSON.stringify(hoy)}, null);   // inspeccionada antes de existir 'validada'
  app.run('funcion-nueva', ${JSON.stringify(hoy)}, ${JSON.stringify(haceUnaHora)});
  app.run('origen-punnett', '2026-09-11', null);
  app.run('con-abierto', ${JSON.stringify(hoy)}, ${JSON.stringify(haceUnaHora)});
  app.run('vigente', ${JSON.stringify(hoy)}, ${JSON.stringify(haceUnaHora)});

  const h = db.prepare(\`INSERT INTO hallazgos (id, slug, severidad, descripcion, caso, estado, fecha)
                        VALUES (?, ?, 'alto', ?, 'caso', ?, ?)\`);
  h.run(1, 'reparada', 'defecto', 'abierto', ${JSON.stringify(hoy)});
  h.run(2, 'reparada-mismo-dia-sin-hora', 'defecto', 'abierto', ${JSON.stringify(hoy)});
  // EL CASO DE ORIGEN, como estaba en la base real: inspeccionada y reparada el 11/09, sin hora
  h.run(3, 'origen-punnett', 'defecto [ARREGLADO 2026-09-11]', 'arreglado', '2026-09-11');
  h.run(4, 'con-abierto', 'defecto', 'abierto', ${JSON.stringify(hoy)});
  h.run(5, 'con-abierto', 'otro defecto', 'abierto', ${JSON.stringify(hoy)});
  h.run(6, 'vigente', 'defecto', 'abierto', ${JSON.stringify(hoy)});
`);

// Se reparan tres hallazgos por la vía real (deja la hora del cierre)
cerrar('--arreglado', '1,2,4');
cerrar('--arreglado', '6');

// Cambia el código de todas menos 'vigente': las cinco quedan INVALIDADAS
sql(`db.prepare("UPDATE apps SET hash_codigo = 'h2' WHERE slug <> 'vigente'").run();`);
// 'vigente' se arregló sin cambiar el código: no está invalidada y no debe tocarse
const antesVigente = sql(`process.stdout.write(db.prepare("SELECT validada FROM apps WHERE slug='vigente'").get().validada);`);

const salida1 = cerrar('--revalidar-reparadas');

const estado = () => JSON.parse(sql(`process.stdout.write(JSON.stringify(Object.fromEntries(
  db.prepare("SELECT slug, hash_inspeccionado = hash_codigo || '|' AS vale, validada FROM apps").all()
    .map(r => [r.slug, { vale: !!r.vale, validada: r.validada }]))));`));
const e1 = estado();

// Segunda vuelta: tras revalidar 'reparada', OTRA sesión le añade una función (el caso de
// origen, ahora con horas). El arreglo ya se consumió en la revalidación: no debe valer otra vez.
sql(`db.prepare("UPDATE apps SET hash_codigo = 'h3' WHERE slug = 'reparada'").run();`);
const salida2 = cerrar('--revalidar-reparadas');
const e2 = estado();

// La vía explícita sigue revalidando lo que se le nombra
cerrar('--revalidar', 'funcion-nueva');
const e3 = estado();

const casos = [
  ['reparada', e1.reparada.vale,
    'hallazgo ARREGLADO después de darse por buena → se revalida'],
  ['reparada-mismo-dia-sin-hora', e1['reparada-mismo-dia-sin-hora'].vale,
    'inspección del mismo día sin hora y cierre con hora → se revalida'],
  ['funcion-nueva', !e1['funcion-nueva'].vale && /sin reparación registrada[\s\S]*funcion-nueva/.test(salida1),
    'INVALIDADA sin hallazgos (la función ABO) → se queda en la cola y se lista'],
  ['origen-punnett', !e1['origen-punnett'].vale && /sin reparación registrada[\s\S]*origen-punnett/.test(salida1),
    'caso de origen: reparada el MISMO día que se inspeccionó, sin hora → se queda'],
  ['con-abierto', !e1['con-abierto'].vale && /hallazgos abiertos[\s\S]*con-abierto/.test(salida1),
    'un arreglo posterior pero otro abierto → se queda'],
  ['vigente', e1.vigente.validada === antesVigente,
    'no INVALIDADA → no se toca aunque tenga un arreglo'],
  ['ya-consumida', !e2.reparada.vale && /sin reparación registrada[\s\S]*reparada/.test(salida2),
    'arreglo ya consumido por una revalidación y cambio ajeno después → se queda'],
  ['explicita', e3['funcion-nueva'].vale,
    '--revalidar <slug> sigue siendo la vía explícita'],
];

let fallos = 0;
for (const [nombre, bien, porque] of casos) {
  console.log(`${bien ? '✓' : '✗'} ${nombre.padEnd(28)} ${porque}`);
  if (!bien) fallos++;
}
if (fallos) {
  console.log('\n    primera vuelta:\n' + salida1.split('\n').map((l) => '    | ' + l).join('\n'));
  console.log('    segunda vuelta:\n' + salida2.split('\n').map((l) => '    | ' + l).join('\n'));
}
console.log(fallos ? `\n✗ ${fallos} caso(s) mal` : '\n✓ revalida lo reparado y deja en la cola lo que cambió por otro motivo');
process.exit(fallos ? 1 : 0);
