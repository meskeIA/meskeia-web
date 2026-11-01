/**
 * limpiar.mjs — borra el scratch de una campaña, y NADA fuera de él.
 *
 *   node scripts/campana/limpiar.mjs C0296              → borra scratch/campana-C0296 entero
 *   node scripts/campana/limpiar.mjs C0296 medidas/antes → borra solo esa subcarpeta (para remedir)
 *
 * Por qué existe (01/11/2026): el CLAUDE.md global del usuario tiene `"ask": ["Bash(rm -rf *)"]`,
 * que protege TODOS sus proyectos, y la skill /campana borraba su scratch con `rm -rf`. En las
 * cinco primeras campañas (C0074, C0317, C0312, C0546 y C0296) eso fueron 9 de las 12
 * confirmaciones que pararon la conversación hasta que el usuario volvía al PC; 6 en la C0296,
 * que vaciaba las medidas antes de cada pasada. El usuario decidió NO relajar la regla global y
 * sí este borrado estrecho: solo puede tocar `scratch/campana-<id>`, que git ignora y que la
 * propia campaña ha creado. Las otras 3 confirmaciones eran servidores lanzados con `( … & )`,
 * que la skill ahora arranca con run_in_background.
 *
 * Se planta (salida 2, sin borrar nada) si el id no es un cabo (`C` y cuatro cifras), si la
 * subruta sale de la carpeta (`..`, absoluta) o si `scratch/` resuelve fuera del repositorio
 * (un enlace). Que la carpeta no exista no es un error: ya está limpia.
 *
 * Sin subruta es el final de la campaña, y termina con «Siguiente: Orden sugerido: …» de
 * `scripts/inspector/orden-del-dia.mjs`, recalculado en ese momento (01/11/2026, P003 del repaso de
 * procesos: el usuario preguntaba qué lanzar después). Por eso la skill cierra el cabo ANTES de
 * llamarlo: abierto, la campaña recién hecha se recomendaría a sí misma. Si el cálculo falla, lo
 * dice y sale con 0: lo borrado, borrado está.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const [id, subruta = ''] = process.argv.slice(2);

function plantarse(motivo) {
  console.error(`✗ limpiar: ${motivo}. No se ha borrado nada.`);
  process.exit(2);
}

if (!/^C\d{4}$/.test(id || '')) plantarse(`«${id ?? ''}» no es el id de un cabo (C y cuatro cifras)`);
if (path.isAbsolute(subruta) || subruta.split(/[\\/]/).includes('..')) plantarse(`la subruta «${subruta}» sale de la carpeta de la campaña`);

const scratch = path.join(RAIZ, 'scratch');
if (fs.existsSync(scratch) && path.relative(RAIZ, fs.realpathSync(scratch)) !== 'scratch') {
  plantarse('scratch/ resuelve fuera del repositorio');
}

const carpeta = path.join(scratch, `campana-${id}`);
const objetivo = path.resolve(carpeta, subruta);
const relativa = path.relative(carpeta, objetivo);
if (relativa.startsWith('..') || path.isAbsolute(relativa)) plantarse(`«${objetivo}» queda fuera de ${carpeta}`);

const legible = path.relative(RAIZ, objetivo).split(path.sep).join('/');
if (!fs.existsSync(objetivo)) {
  console.log(`✓ limpiar: ${legible} no existe, nada que borrar.`);
} else {
  fs.rmSync(objetivo, { recursive: true, force: true });
  console.log(`✓ limpiar: ${legible} borrado.`);
}

if (!subruta) {
  const r = spawnSync(process.execPath, [path.join(RAIZ, 'scripts', 'inspector', 'orden-del-dia.mjs')], { cwd: RAIZ, encoding: 'utf8' });
  const linea = (r.stdout || '').trim();
  const errores = (r.stderr || r.error?.message || 'sin salida').trim().split(/\r?\n/);
  const error = errores.find((l) => /Error\b/.test(l)) ?? errores.pop();
  console.log(r.status === 0 && linea ? `Siguiente: ${linea}` : `Siguiente: (no se pudo calcular: ${error})`);
}
