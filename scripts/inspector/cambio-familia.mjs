/**
 * cambio-familia.mjs — si el cambio de una hermana es COMÚN a su familia (lo valida su testigo, sin
 * Claude) o PROPIO (lo inspecciona Claude en modo `cambio`, como cualquier app)
 *
 * Lo comparten `cola.mjs`, que no manda a Claude las hermanas con cambio común, y
 * `validar-familias.mjs`, que las valida con el testigo antes de que la tarea llame a Claude.
 * Prueba: `npm run inspector:probar-familias`.
 *
 * EL CASO DE ORIGEN (03/11/2026, decidido por el usuario)
 * ───────────────────────────────────────────────────────
 * Con el cupo en 5, la cola pedía 21 apps: `lector-texto-voz` y la familia de quizzes entera, 15
 * hermanas en `cambio` y 5 de inglés nunca vistas. Una tanda así agota el plan Max con Opus en
 * xhigh, y el usuario no la lanzó. Dos reglas se sumaban:
 *   - «la familia sale ENTERA» (23/09/2026, `cfe091a7`: reparar compraventa «en las SIETE apps»
 *     dejó cuatro huecos). Entonces no había testigo; hoy cada familia tiene uno que mide su
 *     invariante en todas las hermanas, y lo ejecuta además `check:familias` en cada build. Y desde
 *     el 27/10/2026 el defecto visto en una hermana y sospechado en las demás va a `/reparar` como
 *     tipo `alcance`. Los dos cubren aquel caso sin inspeccionar 21 apps;
 *   - «la familia reposa entera o no reposa» (26/10/2026): las 15 se inspeccionaron el 28-29/10 sin
 *     ningún alto, y cada una por su cuenta reposaba; las 5 nunca vistas impedían que la familia
 *     reposara y las arrastraban.
 * Desde ese día cada hermana sale sola, con su reposo, y lo común lo valida el testigo.
 *
 * QUÉ ES COMÚN (medido sobre los 20 commits de esas 15 hermanas)
 * ──────────────────────────────────────────────────────────────
 *   familia — el commit toca MIN_HERMANAS o más hermanas de la misma familia: es el armazón que
 *             mide el testigo (`184a1872`, ✓/✗ en las quince; `5b65607f`, el foco tras contestar).
 *   campaña — el commit toca MÁS de MAX_APPS_SIN_CAMPANA apps: el umbral de «cambio a escala» del
 *             CLAUDE.md, que es lo que vigilan los candados (`147db49f`, contraste en 40 apps).
 *   propio  — todo lo demás, y va a Claude. Con «2 hermanas» contaría como común `56bfa250`
 *             (contenido en dos quizzes), y con «4 apps», `21b793a0` (el wolframio en
 *             `tabla-periodica`). Ante la duda, propio: el error que cuesta una inspección, no el
 *             que la esconde.
 * Una hermana tiene cambio común si TODOS sus commits desde su última validación son de familia o
 * de campaña, su última inspección no dejó ningún alto (eso vuelve a Claude siempre, como en el
 * reposo) y su test no está en rojo. Validarla es `cerrar.mjs --revalidar-commits` con esos commits:
 * exige que expliquen todo el cambio (huella del pasado) y su spec en verde. Este módulo añade el
 * testigo de la familia, entero en verde.
 *
 * ⚠️ LÍMITE: un commit de familia que cambia algo que ni el testigo ni el spec de la hermana miden
 * pasa sin que nadie lo mire. Es el mismo precio que `--revalidar-commits` (C0161) en las campañas.
 *
 * Si el testigo o la revalidación fallan, se anota en `meta` (`testigo-fallo:<slug>`) con la huella
 * de ese momento, y la cola manda la hermana a Claude hasta que su código vuelva a cambiar.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { FAMILIAS, familiaDe } from './familias.mjs';

export const MIN_HERMANAS = 3;
export const MAX_APPS_SIN_CAMPANA = 20;

/**
 * Hasta dónde mira git: HEAD, salvo en la prueba, que congela el caso de origen en el commit del
 * día (`INSPECTOR_HEAD=1c7cf5ec`). La historia no cambia, así que la prueba no envejece.
 */
export const REF = process.env.INSPECTOR_HEAD || 'HEAD';

const git = (raiz, args) => execFileSync('git', ['-C', raiz, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024 });

/** Las rutas de una app para git: su carpeta y sus dependencias, resueltas al fichero que exista. */
export function rutasDeLaApp(raiz, slug, depsJson) {
  const deps = JSON.parse(depsJson || '[]').map((d) => {
    for (const c of [`${d}.ts`, `${d}.tsx`, `${d}.mjs`, d]) if (fs.existsSync(path.join(raiz, c))) return c;
    return d;
  });
  return { carpeta: `app/${slug}/`, deps };
}

/**
 * El último commit anterior a la última validación de la app (o, sin ella, al día de su última
 * inspección): desde ahí se mide su cambio. null si git no lo encuentra.
 */
export function baseDelCambio(raiz, fila, ref = REF) {
  const desde = fila.validada || `${fila.ultima_inspeccion}T00:00:00Z`;
  try {
    return git(raiz, ['rev-list', '-1', `--before=${desde}`, ref]).trim().slice(0, 8) || null;
  } catch {
    return null;
  }
}

/** Qué es un commit, por las apps que toca. `apps` y `hermanas` son cuántas. */
export function tipoDeCommit({ apps, hermanas }) {
  if (hermanas >= MIN_HERMANAS) return 'familia';
  if (apps > MAX_APPS_SIN_CAMPANA) return 'campaña';
  return 'propio';
}

/**
 * Los commits que cambiaron la app desde `base`, del más nuevo al más antiguo, con las apps y las
 * hermanas que toca cada uno. Primer padre, como `pasado.mjs`.
 */
export function commitsDelCambio(raiz, { base, carpeta, deps, familia }, ref = REF) {
  const shas = git(raiz, ['log', '--first-parent', '--format=%H', `${base}..${ref}`, '--', carpeta, ...deps])
    .split('\n').filter(Boolean);
  if (!shas.length) return [];
  const hermanasDe = new Set(familia ? familia.slugs : []);
  const porSha = new Map();
  let actual = null;
  for (const l of git(raiz, ['log', '--no-walk=unsorted', '--no-renames', '--name-only', '--format=@@%H%x09%s', ...shas]).split('\n')) {
    if (l.startsWith('@@')) {
      const [sha, asunto] = l.slice(2).split('\t');
      actual = { sha, asunto, slugs: new Set() };
      porSha.set(sha, actual);
      continue;
    }
    const m = l.match(/^app\/([a-z0-9-]+)\//);
    if (m && actual) actual.slugs.add(m[1]);
  }
  return shas.map((sha) => {
    const c = porSha.get(sha);
    const apps = c.slugs.size;
    const hermanas = [...c.slugs].filter((s) => hermanasDe.has(s)).length;
    return { sha: sha.slice(0, 8), asunto: c.asunto, apps, hermanas, tipo: tipoDeCommit({ apps, hermanas }) };
  });
}

/** Clave de `meta` donde se anota que el testigo no pudo validar una hermana. */
export const claveFallo = (slug) => `testigo-fallo:${slug}`;
const huellaActual = (fila) => `${fila.hash_codigo}|${fila.hash_deps || ''}`;

/** El fallo anotado para la huella ACTUAL de la hermana, o null (si su código cambió, ya no vale). */
export function falloVigente(db, fila) {
  const r = db.prepare('SELECT valor FROM meta WHERE clave = ?').get(claveFallo(fila.slug));
  if (!r) return null;
  try {
    const f = JSON.parse(r.valor);
    return f.huella === huellaActual(fila) ? f : null;
  } catch {
    return null;
  }
}

export function anotarFallo(db, fila, motivo) {
  db.prepare('INSERT INTO meta (clave, valor) VALUES (?, ?) ON CONFLICT(clave) DO UPDATE SET valor = excluded.valor')
    .run(claveFallo(fila.slug), JSON.stringify({ huella: huellaActual(fila), motivo, fecha: new Date().toISOString() }));
}

export function borrarFallo(db, slug) {
  db.prepare('DELETE FROM meta WHERE clave = ?').run(claveFallo(slug));
}

/** ¿Dejó algún alto o crítico la última inspección de la app? */
function ultimaConAltos(db, slug) {
  return !!db.prepare(`
    SELECT 1 FROM hallazgos h
    WHERE h.severidad IN ('critico', 'alto')
      AND h.inspeccion_id = (SELECT i.id FROM inspecciones i WHERE i.slug = ? ORDER BY i.fecha DESC, i.id DESC LIMIT 1)
    LIMIT 1`).get(slug);
}

/**
 * Cómo se trata el cambio de una hermana ya inspeccionada e invalidada:
 *   { comun: true, commits }            → lo valida el testigo, sin Claude
 *   { comun: false, motivo, commits }   → va a Claude (motivo: por qué no es común)
 * `fila` es la fila de `apps`. Una app que no es de familia nunca es común.
 */
export function clasificarHermana(db, raiz, fila, ref = REF) {
  const familia = familiaDe(fila.slug);
  if (!familia) return { comun: false, motivo: 'no es de familia', commits: [] };
  if (fila.test_estado === 'rojo') return { comun: false, motivo: 'su test está en rojo', commits: [] };
  if (ultimaConAltos(db, fila.slug)) return { comun: false, motivo: 'su última inspección dejó un alto', commits: [] };
  const base = baseDelCambio(raiz, fila, ref);
  if (!base) return { comun: false, motivo: 'base del cambio no encontrada', commits: [] };
  const commits = commitsDelCambio(raiz, { base, ...rutasDeLaApp(raiz, fila.slug, fila.deps), familia }, ref);
  if (!commits.length) return { comun: false, motivo: 'ningún commit explica el cambio', commits };
  const propios = commits.filter((c) => c.tipo === 'propio');
  if (propios.length) return { comun: false, motivo: `commit propio: ${propios.map((c) => c.sha).join(', ')}`, commits };
  const fallo = falloVigente(db, fila);
  if (fallo) return { comun: false, motivo: `el testigo no la validó: ${fallo.motivo}`, commits };
  return { comun: true, base, commits };
}

/**
 * Qué hacer con un informe de Playwright (`verde`: ruta del spec en minúsculas → 'verde' |
 * 'inestable' | 'rojo', de `informe-playwright.mjs`): el testigo entero en verde o nada; con él en
 * verde, cada hermana se intenta revalidar con SUS commits (la revalidación exige su spec en verde y
 * que esos commits expliquen todo su cambio). Pura, para poder probarla sin navegador.
 *   candidatas: [{ slug, testigo, commits: [{sha}] }]
 */
export function decidir({ raiz, candidatas, verde }) {
  const revalidar = [], fallos = [];
  for (const c of candidatas) {
    const testigo = verde.get(path.resolve(raiz, c.testigo).toLowerCase());
    if (testigo !== 'verde') {
      fallos.push({ slug: c.slug, motivo: `testigo ${c.testigo} ${testigo === 'rojo' ? 'en ROJO' : testigo === 'inestable' ? 'INESTABLE (pasó al reintentar)' : 'sin resultado en el informe'}` });
      continue;
    }
    revalidar.push({ slug: c.slug, shas: c.commits.map((x) => x.sha) });
  }
  return { revalidar, fallos };
}

export { FAMILIAS };
