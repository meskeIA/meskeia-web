#!/usr/bin/env node
/**
 * generar-catalogos-cnae-iae.mjs — Ingesta de los catálogos oficiales de actividad
 *
 * Descarga y transforma tres fuentes oficiales en un catálogo servido como JSON:
 *
 *   1. Tarifas del IAE      → API de datos abiertos del BOE (RDL 1175/1990 consolidado)
 *   2. Estructura CNAE-2025 → Excel del INE
 *   3. Correspondencia CNAE-2009 ⇄ CNAE-2025 → Excel del INE
 *
 * Genera `public/datos/cnae-iae-catalogo.json`, que la app carga bajo demanda
 * (son cientos de KB: incrustarlos en el bundle penalizaría a todo el catálogo).
 *
 * Uso:  node scripts/generar-catalogos-cnae-iae.mjs
 *
 * ⚠️ NO se incluyen las cuotas del IAE. Las del texto consolidado están en pesetas
 * de 1990 y la cuota real depende de coeficientes y recargos municipales: publicarlas
 * induciría a error. Este catálogo sirve para IDENTIFICAR la actividad, no para
 * calcular el impuesto.
 */

import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs';
import { inflateRawSync } from 'node:zlib';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const FUENTES = {
  iae: 'https://www.boe.es/datosabiertos/api/legislacion-consolidada/id/BOE-A-1990-23930/texto',
  cnae2025: 'https://www.ine.es/daco/daco42/clasificaciones/cnae25/Estructura_CNAE2025.xlsx',
  correspondencia: 'https://www.ine.es/daco/daco42/clasificaciones/cnae25/Correspondencia_CNAE09_CNAE25.xlsx',
};

const TMP = join(tmpdir(), 'meskeia-cnae-iae');
if (!existsSync(TMP)) mkdirSync(TMP, { recursive: true });

// ─── Utilidades de texto ─────────────────────────────────────────────────────

const limpiar = (s) =>
  s
    .replace(/<[^>]+>/g, '')
    .replace(/&#(\d+);/g, (a, d) => String.fromCharCode(+d))
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/­/g, '') // guion blando: parte palabras dentro del texto del BOE
    .replace(/\s+/g, ' ')
    .trim();

/** Separa la denominación de la cuota, que no publicamos (ver cabecera). */
function soloDenominacion(texto) {
  const corte = texto.search(/\s*Cuota\s+(de|mínima|municipal|provincial|nacional|íntegra)/i);
  const t = corte > 0 ? texto.slice(0, corte) : texto;
  return t.replace(/[.:,\s]+$/, '').trim();
}

// ─── Lectura de .xlsx sin dependencias ───────────────────────────────────────
// Un .xlsx es un ZIP de ficheros XML. Descomprimimos con zlib nativo en vez de
// depender del binario `unzip`, que no existe de serie en Windows.

function leerZip(buf) {
  const ficheros = new Map();
  // Recorremos el directorio central, que es la parte fiable del formato ZIP
  const FIN = 0x06054b50;
  let posFin = buf.length - 22;
  while (posFin >= 0 && buf.readUInt32LE(posFin) !== FIN) posFin--;
  if (posFin < 0) throw new Error('ZIP inválido: no se encuentra el fin del directorio central');

  const totalEntradas = buf.readUInt16LE(posFin + 10);
  let p = buf.readUInt32LE(posFin + 16);

  for (let i = 0; i < totalEntradas; i++) {
    if (buf.readUInt32LE(p) !== 0x02014b50) break;
    const metodo = buf.readUInt16LE(p + 10);
    const tamComprimido = buf.readUInt32LE(p + 20);
    const lenNombre = buf.readUInt16LE(p + 28);
    const lenExtra = buf.readUInt16LE(p + 30);
    const lenComentario = buf.readUInt16LE(p + 32);
    const offsetLocal = buf.readUInt32LE(p + 42);
    const nombre = buf.toString('utf8', p + 46, p + 46 + lenNombre);

    // Cabecera local: los campos de longitud pueden diferir del directorio central
    const lenNombreLocal = buf.readUInt16LE(offsetLocal + 26);
    const lenExtraLocal = buf.readUInt16LE(offsetLocal + 28);
    const inicioDatos = offsetLocal + 30 + lenNombreLocal + lenExtraLocal;
    const datos = buf.subarray(inicioDatos, inicioDatos + tamComprimido);

    ficheros.set(nombre, metodo === 0 ? datos : inflateRawSync(datos));
    p += 46 + lenNombre + lenExtra + lenComentario;
  }
  return ficheros;
}

function leerHojaXlsx(rutaXlsx, hoja = 'sheet2') {
  const zip = leerZip(readFileSync(rutaXlsx));
  const ss = zip.get('xl/sharedStrings.xml')?.toString('utf8') || '';
  const cadenas = [...ss.matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) =>
    limpiar([...m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((t) => t[1]).join(''))
  );
  const sh = zip.get(`xl/worksheets/${hoja}.xml`)?.toString('utf8');
  if (!sh) throw new Error(`No se encuentra la hoja ${hoja} en ${rutaXlsx}`);

  const valor = (celda) => {
    const esTexto = /t="s"/.test(celda);
    const v = (celda.match(/<v>([\s\S]*?)<\/v>/) || [])[1];
    if (v === undefined) return '';
    return esTexto ? cadenas[+v] : v;
  };
  return [...sh.matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)].map((f) =>
    [...f[1].matchAll(/<c[^>]*>[\s\S]*?<\/c>|<c[^>]*\/>/g)].map((c) => valor(c[0]))
  );
}

async function descargar(url, destino) {
  const ruta = join(TMP, destino);
  if (existsSync(ruta)) {
    console.log(`  · ${destino} (cacheado)`);
    return ruta;
  }
  console.log(`  ↓ ${url}`);
  const cabeceras = destino.endsWith('.xml') ? { Accept: 'application/xml' } : {};
  const res = await fetch(url, { headers: cabeceras });
  if (!res.ok) throw new Error(`HTTP ${res.status} descargando ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(ruta, buf);
  console.log(`    ${(buf.length / 1024).toFixed(0)} KB → ${destino}`);
  return ruta;
}

// ─── 1. Tarifas del IAE ──────────────────────────────────────────────────────

const SECCION_POR_BLOQUE = { sprimera: '1ª', ssegunda: '2ª', stercera: '3ª' };
const NIVELES = [
  [/^Divisi[óo]n\s+(\d+)\.?\s*(.*)$/i, 'division'],
  [/^Agrupaci[óo]n\s+(\d+)\.?\s*(.*)$/i, 'agrupacion'],
  // El separador entre código y denominación es un punto en la redacción original
  // de 1990, pero las reformas posteriores usan dos puntos ("Epígrafe 505.6: Pintura…").
  // Aceptar ambos es imprescindible: si no, se pierden redacciones VIGENTES
  // (505.6, 151.x, 615.6 entre otras).
  [/^Grupo\s+([\d.]+?)\s*[.:]?\s+(.+)$/i, 'grupo'],
  [/^Ep[íi]grafe\s+([\d.]+?)\s*[.:]?\s+(.+)$/i, 'epigrafe'],
  // Algunas reformas omiten además la palabra "Epígrafe" delante del código.
  [/^(\d{3}\.\d+)\s*:\s*(.+)$/, 'epigrafe'],
];

function extraerIae(rutaXml) {
  const xml = readFileSync(rutaXml, 'utf8');
  const bloques = [...xml.matchAll(/<bloque id="([^"]*)"[^>]*>([\s\S]*?)<\/bloque>/g)];

  let seccion = null;
  const registro = new Map(); // `${seccion}|${codigo}` → entrada vigente

  for (const [, id, cuerpo] of bloques) {
    const base = id.replace(/-\d+$/, '');
    if (SECCION_POR_BLOQUE[base]) seccion = SECCION_POR_BLOQUE[base];
    if (!seccion) continue;

    // Cada bloque acumula versiones (el consolidado recoge las reformas desde 1990):
    // nos quedamos siempre con la de fecha de vigencia más reciente.
    for (const v of cuerpo.matchAll(/<version[^>]*fecha_vigencia="(\d{8})"[^>]*>([\s\S]*?)<\/version>/g)) {
      const fecha = v[1];
      for (const p of v[2].matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)) {
        const texto = limpiar(p[1]);
        for (const [patron, tipo] of NIVELES) {
          const m = texto.match(patron);
          if (!m) continue;
          const codigo = m[1].replace(/\.$/, '');
          const titulo = soloDenominacion(m[2] || '');
          if (!titulo) break;
          const clave = `${seccion}|${codigo}`;
          const previo = registro.get(clave);
          if (!previo || fecha >= previo.fecha) {
            registro.set(clave, { seccion, codigo, tipo, titulo, fecha });
          }
          break;
        }
      }
    }
  }

  return [...registro.values()]
    .map(({ fecha, ...resto }) => resto)
    .sort(
      (a, b) =>
        a.seccion.localeCompare(b.seccion) ||
        a.codigo.localeCompare(b.codigo, 'es', { numeric: true })
    );
}

// ─── 2 y 3. CNAE-2025 y correspondencia ──────────────────────────────────────

function nivelCnae(codigo) {
  if (/^[A-Z]$/.test(codigo)) return 'seccion';
  const digitos = codigo.replace('.', '').length;
  return { 2: 'division', 3: 'grupo', 4: 'clase' }[digitos] || 'otro';
}

function extraerCnae2025(ruta) {
  return leerHojaXlsx(ruta)
    .slice(1)
    .filter((f) => f[0] && f[1])
    .map(([codigo, titulo]) => ({
      codigo: String(codigo).trim(),
      titulo: limpiar(String(titulo)),
      nivel: nivelCnae(String(codigo).trim()),
    }));
}

function extraerCorrespondencia(ruta) {
  const mapa = {}; // clase CNAE-2009 (sin punto) → [códigos CNAE-2025]
  const inverso = {}; // clase CNAE-2025 (sin punto) → [códigos CNAE-2009]
  for (const [c09, , c25, , nivel] of leerHojaXlsx(ruta).slice(1)) {
    if (!c09 || !c25 || nivel !== '4') continue; // nivel 4 = clase de 4 dígitos
    const a = String(c09).replace('.', '');
    const b = String(c25).replace('.', '');
    mapa[a] ||= [];
    if (!mapa[a].includes(c25)) mapa[a].push(c25);
    inverso[b] ||= [];
    if (!inverso[b].includes(c09)) inverso[b].push(c09);
  }
  return { mapa, inverso };
}

// ─── Sinónimos heredados del dataset curado ──────────────────────────────────

/**
 * Los sinónimos coloquiales ("hago páginas web", "corto el pelo") son la única
 * pieza que no figura en ninguna fuente oficial, y son los que hacen que el
 * buscador encuentre lo que la gente realmente escribe.
 *
 * Viven en `data/cnae-sinonimos.json`, indexados ya por código CNAE-2025. Es un
 * fichero CURADO A MANO, no generado: se editan añadiendo términos al código que
 * corresponda. Su origen fue el dataset `data/fiscal/cnae-iae.ts` (retirado), del
 * que se reengancharon vía la tabla oficial de correspondencia y se depuraron
 * los repartos que el solape léxico resolvía mal.
 */
function cargarSinonimos() {
  const ruta = 'data/cnae-sinonimos.json';
  if (!existsSync(ruta)) {
    console.log('  ⚠️ falta data/cnae-sinonimos.json: el buscador solo hallará por título oficial');
    return {};
  }
  return JSON.parse(readFileSync(ruta, 'utf8'));
}

// ─── Main ────────────────────────────────────────────────────────────────────

console.log('\n📥 Descargando fuentes oficiales…');
const rutaIae = await descargar(FUENTES.iae, 'iae-consolidado.xml');
const rutaCnae = await descargar(FUENTES.cnae2025, 'cnae2025.xlsx');
const rutaCorr = await descargar(FUENTES.correspondencia, 'correspondencia.xlsx');

console.log('\n🔎 Procesando…');
const iae = extraerIae(rutaIae);
const porSeccion = iae.reduce((a, e) => ((a[e.seccion] = (a[e.seccion] || 0) + 1), a), {});
console.log(`  IAE: ${iae.length} códigos`, porSeccion);

const cnae = extraerCnae2025(rutaCnae);
const porNivel = cnae.reduce((a, e) => ((a[e.nivel] = (a[e.nivel] || 0) + 1), a), {});
console.log(`  CNAE-2025: ${cnae.length} códigos`, porNivel);

const { mapa, inverso } = extraerCorrespondencia(rutaCorr);
console.log(`  Correspondencia: ${Object.keys(mapa).length} clases 2009 → ${Object.keys(inverso).length} clases 2025`);

const sinonimos = cargarSinonimos();
console.log(`  Sinónimos reenganchados a ${Object.keys(sinonimos).length} códigos CNAE-2025`);

if (iae.length < 1000) throw new Error(`Solo ${iae.length} códigos IAE: el parseo del BOE ha fallado`);
if (cnae.length < 900) throw new Error(`Solo ${cnae.length} códigos CNAE: el parseo del INE ha fallado`);

const salida = {
  meta: {
    generado: new Date().toISOString().slice(0, 10),
    iae: {
      fuente: 'Tarifas del IAE — RD Legislativo 1175/1990 (texto consolidado)',
      urlOficial: 'https://www.boe.es/buscar/act.php?id=BOE-A-1990-23930',
      nota: 'Sin cuotas: las del texto consolidado están en pesetas de 1990 y la cuota real depende de coeficientes y recargos municipales.',
    },
    cnae: {
      fuente: 'CNAE-2025 — RD 10/2025 (INE)',
      urlOficial: 'https://www.ine.es/dyngs/INEbase/es/operacion.htm?c=Estadistica_C&cid=1254736177032',
      nota: 'CNAE-2025 sustituye a CNAE-2009 desde enero de 2026. La correspondencia entre ambas es la tabla oficial del INE.',
    },
    advertencia:
      'No existe tabla oficial de equivalencia entre CNAE e IAE: son clasificaciones de organismos y finalidades distintas (INE, estadística / AEAT, tributaria). Este catálogo permite localizar cada código en su propia clasificación; el encaje de una actividad concreta lo decide quien se da de alta, con el literal oficial delante.',
  },
  iae,
  cnae,
  correspondencia: mapa,
  correspondenciaInversa: inverso,
  sinonimos,
};

// ─── Comparación con el catálogo publicado ───────────────────────────────────
// Es lo que permite que la revisión anual sea barata: se reejecuta el script y,
// si las fuentes oficiales han cambiado algo, aparece aquí enumerado. Sin esto,
// una reforma de epígrafes o una clasificación nueva pasarían inadvertidas.

const destino = 'public/datos/cnae-iae-catalogo.json';

function compararConPublicado(nuevo) {
  if (!existsSync(destino)) {
    console.log('\n📋 No hay catálogo previo: primera generación.');
    return true;
  }
  let previo;
  try {
    previo = JSON.parse(readFileSync(destino, 'utf8'));
  } catch {
    console.log('\n⚠️ El catálogo publicado no se puede leer; se regenera.');
    return true;
  }

  const cambios = [];

  for (const [nombre, clave] of [['IAE', (e) => `${e.seccion}|${e.codigo}`], ['CNAE-2025', (e) => e.codigo]]) {
    const lista = nombre === 'IAE' ? 'iae' : 'cnae';
    const antes = new Map((previo[lista] || []).map((e) => [clave(e), e.titulo]));
    const ahora = new Map((nuevo[lista] || []).map((e) => [clave(e), e.titulo]));

    const altas = [...ahora.keys()].filter((k) => !antes.has(k));
    const bajas = [...antes.keys()].filter((k) => !ahora.has(k));
    const modificados = [...ahora.keys()].filter((k) => antes.has(k) && antes.get(k) !== ahora.get(k));

    if (altas.length || bajas.length || modificados.length) {
      cambios.push({ nombre, altas, bajas, modificados, antes, ahora });
    }
  }

  if (!cambios.length) {
    console.log('\n📋 Sin cambios respecto al catálogo publicado: las fuentes oficiales siguen igual.');
    return false;
  }

  console.log('\n📋 CAMBIOS DETECTADOS respecto al catálogo publicado:');
  for (const c of cambios) {
    console.log(`\n  ${c.nombre}: ${c.altas.length} altas · ${c.bajas.length} bajas · ${c.modificados.length} títulos modificados`);
    for (const k of c.altas.slice(0, 15)) console.log(`    + ${k}  ${c.ahora.get(k).slice(0, 70)}`);
    if (c.altas.length > 15) console.log(`    … y ${c.altas.length - 15} altas más`);
    for (const k of c.bajas.slice(0, 15)) console.log(`    - ${k}  ${c.antes.get(k).slice(0, 70)}`);
    if (c.bajas.length > 15) console.log(`    … y ${c.bajas.length - 15} bajas más`);
    for (const k of c.modificados.slice(0, 15)) {
      console.log(`    ~ ${k}`);
      console.log(`        antes: ${c.antes.get(k).slice(0, 70)}`);
      console.log(`        ahora: ${c.ahora.get(k).slice(0, 70)}`);
    }
    if (c.modificados.length > 15) console.log(`    … y ${c.modificados.length - 15} modificaciones más`);
  }
  console.log('\n  ⚠️ Revisa los cambios y actualiza el sello `verificado` de data/fiscal/cnae-iae.ts.');
  return true;
}

const hayCambios = compararConPublicado(salida);

if (!existsSync('public/datos')) mkdirSync('public/datos', { recursive: true });
writeFileSync(destino, JSON.stringify(salida));
console.log(`\n✅ ${destino} (${(readFileSync(destino).length / 1024).toFixed(0)} KB)${hayCambios ? ' · actualizado' : ' · sin novedades'}\n`);
