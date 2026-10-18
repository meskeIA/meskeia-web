/**
 * huella.mjs — la receta de la HUELLA de una app del Inspector, con el lector de ficheros
 * inyectable.
 *
 * Vivía dentro de `sincronizar.mjs`, que ejecuta al importarse, así que nadie más podía
 * calcularla. La necesita también `cerrar.mjs --revalidar-commits` (cabo C0161): para saber si
 * unos commits explican TODO el cambio de una app, rehace la huella con los ficheros que esos
 * commits tocaron tal como estaban ANTES de ellos, y el resto como están hoy. Eso exige leer
 * de un árbol virtual, y por eso el lector se inyecta. Una sola receta para los dos: si se
 * copiara, la huella que revalida y la que invalida acabarían discrepando sin avisar.
 *
 * El lector (`fsv`) imita lo que se usa de `fs`: existsSync, readFileSync, readdirSync con
 * withFileTypes y statSync. Por defecto es `fs`.
 *
 * La receta (esquema de huella 3) y su historia están en la cabecera de `sincronizar.mjs`.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export const huella = (txt) => crypto.createHash('sha256').update(txt).digest('hex').slice(0, 16);

/** Texto con los finales de línea en LF: la huella no puede depender de la carpeta. */
export const aLF = (t) => t.replace(/\r\n/g, '\n');
/** Solo para migrar a la versión 3: el mismo texto tal como lo leía la copia en CRLF. */
export const aCRLF = (t) => aLF(t).replace(/\n/g, '\r\n');

/**
 * Las funciones de la receta atadas a una raíz y a un lector. `sincronizar.mjs` usa la raíz
 * del repositorio y `fs`; `cerrar.mjs --revalidar-commits`, un lector que superpone el pasado.
 */
export function crearHuella({ raiz, fsv = fs }) {
  /** Ficheros de código de la app, recursivo y en orden estable. */
  function ficherosDeApp(dir) {
    const salida = [];
    const recorrer = (d) => {
      for (const e of fsv.readdirSync(d, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
        const p = path.join(d, e.name);
        if (e.isDirectory()) recorrer(p);
        else if (/\.(tsx?|module\.css)$/.test(e.name)) salida.push(p);
      }
    };
    recorrer(dir);
    return salida;
  }

  /** Nombre exportado → módulo de data/fiscal que lo exporta (sin pasar por el barril). */
  let exportsFiscales = null;
  function moduloFiscalDe(nombre) {
    if (!exportsFiscales) {
      exportsFiscales = new Map();
      const dir = path.join(raiz, 'data', 'fiscal');
      for (const f of fsv.readdirSync(dir)) {
        const nombreF = typeof f === 'string' ? f : f.name;
        if (!nombreF.endsWith('.ts') || nombreF === 'index.ts') continue;
        const mod = `data/fiscal/${nombreF.replace(/\.ts$/, '')}`;
        const t = fsv.readFileSync(path.join(dir, nombreF), 'utf8');
        for (const m of t.matchAll(/export\s+(?:declare\s+)?(?:const|let|var|async\s+function\*?|function\*?|class|type|interface|enum)\s+([A-Za-z_$][\w$]*)/g)) {
          if (!exportsFiscales.has(m[1])) exportsFiscales.set(m[1], mod);
        }
        for (const m of t.matchAll(/export\s+(?:type\s+)?\{([^}]*)\}(?!\s*from)/g)) {
          for (const trozo of m[1].split(',')) {
            const alias = trozo.trim().split(/\s+as\s+/).pop()?.replace(/^type\s+/, '').trim();
            if (alias && !exportsFiscales.has(alias)) exportsFiscales.set(alias, mod);
          }
        }
      }
    }
    return exportsFiscales.get(nombre) ?? null;
  }

  /** Dependencias de un texto de código: módulos de data/fiscal y lib/calculadoras. */
  function depsDe(texto) {
    const deps = [];
    for (const m of texto.matchAll(/@\/data\/fiscal\/([\w-]+)/g)) deps.push(`data/fiscal/${m[1]}`);
    for (const m of texto.matchAll(/@\/lib\/calculadoras\/([\w-]+)/g)) deps.push(`lib/calculadoras/${m[1]}`);
    // El barril: cada nombre importado, a su módulo
    for (const m of texto.matchAll(/import\s+(type\s+)?([^;]*?)\s+from\s+['"]@\/data\/fiscal\/?['"]/g)) {
      const llaves = m[2].match(/\{([^}]*)\}/);
      if (!llaves) { deps.push('data/fiscal/index'); continue; } // import * as …: no se puede resolver
      for (const trozo of llaves[1].split(',')) {
        const nombre = trozo.trim().replace(/^type\s+/, '').split(/\s+as\s+/)[0].trim();
        if (!nombre) continue;
        deps.push(moduloFiscalDe(nombre) ?? 'data/fiscal/index');
      }
    }
    return deps;
  }

  function hashDeDeps(unicas, finLinea = aLF) {
    if (!unicas.length) return '';
    let acum = '';
    for (const d of unicas) {
      for (const ext of ['.ts', '.tsx', '/index.ts']) {
        const p = path.join(raiz, d + ext);
        if (fsv.existsSync(p) && fsv.statSync(p).isFile()) { acum += finLinea(fsv.readFileSync(p, 'utf8')); break; }
      }
    }
    return huella(acum);
  }

  function analizarApp(slug, finLinea = aLF) {
    const dir = path.join(raiz, 'app', slug);
    if (!fsv.existsSync(dir)) return null;
    const pagina = path.join(dir, 'page.tsx');
    if (!fsv.existsSync(pagina)) return null;
    const page = fsv.readFileSync(pagina, 'utf8');

    let codigo = '';
    const deps = [];
    for (const p of ficherosDeApp(dir)) {
      const t = finLinea(fsv.readFileSync(p, 'utf8'));
      // La ruta entra en la huella: mover un trozo de un fichero a otro también es un cambio
      codigo += `\n// ${path.relative(dir, p).replace(/\\/g, '/')}\n${t}`;
      if (!p.endsWith('.css')) deps.push(...depsDe(t));
    }
    const unicas = [...new Set(deps)].sort();
    const hashDeps = hashDeDeps(unicas, finLinea);

    // El segmento decide CÓMO se inspecciona, no si se inspecciona.
    let segmento;
    if (/@\/data\/fiscal/.test(page)) segmento = 'fiscal';
    else if (/@\/lib\/calculadoras/.test(page)) segmento = 'motor';
    else if (/type=["']number["']|parseSpanishNumber|formatCurrency|toFixed\(/.test(page)) segmento = 'calculo';
    else if (/useState|onClick|onChange/.test(page)) segmento = 'interactiva';
    else segmento = 'contenido';

    return { hash_codigo: huella(codigo), deps: unicas, hash_deps: hashDeps, segmento };
  }

  return { ficherosDeApp, moduloFiscalDe, depsDe, hashDeDeps, analizarApp };
}
