/**
 * Prueba de `cerrar.mjs --revalidar-commits`, sobre un repositorio git y una base DESECHABLES.
 *
 * Ejecutar con:  npm run inspector:probar-revalidar-commits
 *
 * ── Por qué existe ────────────────────────────────────────────────────────────
 * Cabo C0161: el refactor mecánico 99e1ee7e (dos líneas por app) invalidó las 165 apps
 * inspeccionadas el 08/10/2026 y se arregló a mano. `--revalidar-commits` lo hace solo, y un
 * fallo aquí es caro en los dos sentidos: si revalida de más, saca de la cola un cambio que nadie
 * ha mirado; si de menos, la cola se llena de apps que solo cambiaron de color. Por eso se le
 * reinyecta la forma del caso de origen y, sobre todo, los controles que deben QUEDARSE:
 *
 *   origen        dos líneas cambiadas por el commit dado, nada más   → se revalida
 *   dos-tandas    dos commits dados sobre el mismo fichero (C0070)    → se revalida
 *   fichero-nuevo el commit dado AÑADE un fichero a la app            → se revalida
 *   otro-antes    un commit ajeno cambió la app y luego el dado       → se queda
 *   otro-despues  un commit ajeno tocó DESPUÉS el mismo fichero       → se queda
 *   spec-rojo     solo el commit dado, pero su spec falló             → se queda
 *   spec-inestable su spec pasó al reintentar (sonometro, 18/10/2026)  → se queda
 *   sin-informe   solo el commit dado, su spec no está en el informe  → se queda
 *   no-tocada     invalidada por un commit ajeno; el dado no la toca  → se queda
 *   vigente       no invalidada                                        → no se toca
 *
 * Nada de esto toca la base ni el repositorio reales: van por `INSPECTOR_DB` e `INSPECTOR_RAIZ`.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'inspector-revalidar-commits-'));
const REPO = path.join(TMP, 'repo');
const BASE = path.join(TMP, 'inspector.db');
process.env.INSPECTOR_DB = BASE;
const CERRAR = path.resolve('scripts/inspector/cerrar.mjs');
const { abrir } = await import(pathToFileURL(path.resolve('scripts/inspector/db.mjs')).href);
const { crearHuella } = await import(pathToFileURL(path.resolve('scripts/inspector/huella.mjs')).href);

const git = (...a) => execFileSync('git', a, { cwd: REPO, encoding: 'utf8' }).trim();
const escribir = (r, t) => {
  fs.mkdirSync(path.dirname(path.join(REPO, r)), { recursive: true });
  fs.writeFileSync(path.join(REPO, r), t);
};
const commit = (msg) => { git('add', '-A'); git('commit', '-q', '-m', msg); return git('rev-parse', 'HEAD'); };

const APPS = ['origen', 'dos-tandas', 'fichero-nuevo', 'otro-antes', 'otro-despues', 'spec-rojo', 'spec-inestable', 'sin-informe', 'no-tocada', 'vigente'];
const css = (slug, color) => `.container { --primary: #2E86AB; }\n.boton { background: ${color}; color: white; }\n`;

// ─── Estado inspeccionado ──────────────────────────────────────────────────────
fs.mkdirSync(REPO, { recursive: true });
git('init', '-q');
git('config', 'user.email', 'prueba@local');
git('config', 'user.name', 'prueba');
git('config', 'core.autocrlf', 'false');
escribir('data/fiscal/vacio.ts', 'export const NADA = 0;\n');
for (const s of APPS) {
  escribir(`app/${s}/page.tsx`, `export default function P() { return <main>${s}</main>; }\n`);
  escribir(`app/${s}/${s}.module.css`, css(s, 'var(--primary)'));
}
commit('base');

const db = abrir();
const sincronizar = () => {
  const { analizarApp } = crearHuella({ raiz: REPO });
  const up = db.prepare('UPDATE apps SET hash_codigo = ?, hash_deps = ? WHERE slug = ?');
  for (const s of APPS) { const a = analizarApp(s); up.run(a.hash_codigo, a.hash_deps || null, s); }
};
{
  const { analizarApp } = crearHuella({ raiz: REPO });
  const ins = db.prepare(`INSERT INTO apps (slug, hash_codigo, hash_deps, deps, ultima_inspeccion, hash_inspeccionado, test_path)
                          VALUES (?, ?, ?, '[]', '2026-10-10', ?, ?)`);
  for (const s of APPS) {
    const a = analizarApp(s);
    ins.run(s, a.hash_codigo, a.hash_deps || null, `${a.hash_codigo}|${a.hash_deps || ''}`, `tests/apps/${s}.spec.ts`);
  }
}

// ─── Historia posterior a la inspección ───────────────────────────────────────
// Un commit AJENO (una función nueva, sin verificar) antes de la campaña
escribir('app/otro-antes/page.tsx', 'export default function P() { return <main>otro-antes con función nueva</main>; }\n');
escribir('app/no-tocada/page.tsx', 'export default function P() { return <main>no-tocada con función nueva</main>; }\n');
commit('feat: función nueva sin inspeccionar');

// La campaña, en dos commits: la forma del caso de origen (cambio mecánico de unas líneas)
for (const s of ['origen', 'dos-tandas', 'fichero-nuevo', 'otro-antes', 'otro-despues', 'spec-rojo', 'spec-inestable', 'sin-informe']) {
  escribir(`app/${s}/${s}.module.css`, css(s, 'var(--primary-boton)'));
}
escribir('app/fichero-nuevo/extra.module.css', '.nuevo { color: var(--primary-texto); }\n');
const X1 = commit('fix: tanda 1');
escribir('app/dos-tandas/dos-tandas.module.css', css('dos-tandas', 'var(--primary-boton)') + '.dato { color: var(--primary-texto); }\n');
const X2 = commit('fix: tanda 2');

// Un commit AJENO después, sobre un fichero que la campaña también tocó
escribir('app/otro-despues/otro-despues.module.css', css('otro-despues', 'var(--primary-boton)') + '.cambio { display: none; }\n');
commit('fix: otra cosa en el mismo fichero');

sincronizar();

// ─── Informe de Playwright ────────────────────────────────────────────────────
const spec = (s, status) => ({ title: s, file: `apps/${s}.spec.ts`, specs: [{ title: 'caso', file: `apps/${s}.spec.ts`, tests: [{ status }] }] });
const informe = {
  config: { rootDir: path.join(REPO, 'tests') },
  suites: APPS.filter((s) => s !== 'sin-informe').map((s) => spec(s, s === 'spec-rojo' ? 'unexpected' : s === 'spec-inestable' ? 'flaky' : 'expected')),
};
const RUTA_INFORME = path.join(TMP, 'informe.json');
fs.writeFileSync(RUTA_INFORME, JSON.stringify(informe));

// ─── Ejecutar ─────────────────────────────────────────────────────────────────
const vigenteAntes = db.prepare("SELECT validada FROM apps WHERE slug = 'vigente'").get().validada;
const salida = execFileSync(process.execPath, [CERRAR, '--revalidar-commits', `${X1.slice(0, 8)},${X2.slice(0, 8)}`, '--informe', RUTA_INFORME], {
  env: { ...process.env, INSPECTOR_DB: BASE, INSPECTOR_RAIZ: REPO },
  encoding: 'utf8',
});
const vale = Object.fromEntries(db.prepare("SELECT slug, hash_inspeccionado = hash_codigo || '|' || COALESCE(hash_deps, '') AS v FROM apps").all().map((r) => [r.slug, !!r.v]));

const casos = [
  ['origen', vale.origen, 'dos líneas del commit dado, nada más → se revalida'],
  ['dos-tandas', vale['dos-tandas'], 'dos commits dados sobre el mismo fichero → se revalida'],
  ['fichero-nuevo', vale['fichero-nuevo'], 'el commit dado añade un fichero → se revalida'],
  ['otro-antes', !vale['otro-antes'] && /no explican todo el cambio[\s\S]*otro-antes/.test(salida), 'un commit ajeno antes → se queda y se lista'],
  ['otro-despues', !vale['otro-despues'] && /tocó también otro commit[\s\S]*otro-despues/.test(salida), 'un commit ajeno después en el mismo fichero → se queda y se lista'],
  ['spec-rojo', !vale['spec-rojo'] && /spec en ROJO/.test(salida), 'su spec falló → se queda'],
  ['spec-inestable', !vale['spec-inestable'] && /spec-inestable \(spec INESTABLE/.test(salida), 'su spec pasó al reintentar (flaky) → se queda, y se dice que es inestable'],
  ['sin-informe', !vale['sin-informe'] && /no está en el informe/.test(salida), 'su spec no está en el informe → se queda'],
  ['no-tocada', !vale['no-tocada'], 'invalidada por otro commit que el dado no explica → se queda'],
  ['vigente', vale.vigente && db.prepare("SELECT validada FROM apps WHERE slug = 'vigente'").get().validada === vigenteAntes, 'no invalidada → no se toca'],
];

let fallos = 0;
for (const [nombre, bien, porque] of casos) {
  console.log(`${bien ? '✓' : '✗'} ${nombre.padEnd(14)} ${porque}`);
  if (!bien) fallos++;
}
if (fallos) console.log('\n' + salida.split('\n').map((l) => `    | ${l}`).join('\n'));
// En Windows la base abierta bloquea el borrado: se cierra antes, y lo que quede lo limpia el sistema
db.close();
try { fs.rmSync(TMP, { recursive: true, force: true }); } catch { /* temporal: no es un fallo de la prueba */ }
console.log(fallos ? `\n✗ ${fallos} caso(s) mal` : '\n✓ revalida lo que esos commits explican y deja en la cola lo demás');
process.exit(fallos ? 1 : 0);
