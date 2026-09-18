#!/usr/bin/env node
/**
 * check-legal-notice.mjs — que ninguna app se publique sin su aviso legal
 *
 * Ejecutar:  npm run check:legal            (lo ejecuta también `npm run build`)
 *            npm run check:legal -- --lista  (imprime el recuento y las excepciones vigentes)
 *
 * QUÉ EXIGE
 * ─────────
 * Que toda app registrada en `data/implemented-apps.ts` MONTE `<LegalNotice />`, en su
 * `page.tsx` o en su `layout.tsx`. Es uno de los cinco componentes obligatorios en TODAS las
 * apps (CLAUDE.md, «Estructura estándar de una app») y `_private/DISCLAIMER-POLICY.md` lo
 * repite: «LegalNotice sigue siendo obligatorio en todas las apps».
 *
 * Y exige dos cosas más, que son las que impiden que la primera se cumpla en apariencia:
 *
 *   1. Que el componente se MONTE, no que se importe. Un `import { LegalNotice }` sin su
 *      `<LegalNotice` debajo deja la página exactamente igual de desnuda, y un candado que
 *      buscara el nombre a secas daría verde. Es la misma lección que dejó escrita
 *      `check:motores`: lo que un fichero dice de sí mismo no demuestra nada, y en 107 casos
 *      mentía. Aquí el import es justo eso, una declaración de intenciones.
 *
 *   2. Que NO viva dentro de `<EducationalSection>`, que es contenido colapsable. El CLAUDE.md
 *      lo prohíbe con todas las letras: «Nunca ocultar dentro de EducationalSection un
 *      disclaimer legal, una advertencia de responsabilidad ni un aviso sobre datos personales:
 *      es responsabilidad jurídica, no maquetación». Un aviso plegado por defecto cumple el
 *      grep y no cumple el propósito.
 *
 * DE DÓNDE SALE
 * ─────────────
 * Del Inspector, el 18/09/2026. Al verificar `test-fragilidad` —escala FRAIL, riesgo 1— resultó
 * que no montaba `LegalNotice`, y era la ÚNICA de las 21 apps `app/test-*` que no lo llevaba.
 * Justo la que pregunta cinco cosas sobre la salud de quien la usa.
 *
 * El barrido que siguió encontró otras seis en la misma situación, tres de ellas de riesgo 1:
 * `estimador-plusvalias-irpf`, `estimador-riesgo-osteoporosis`, `plazos-legales`,
 * `adaptacion-hogar`, `asistente-constitucion-asociacion` y `calendario-fiscal-emprendedor`.
 * Siete de 1.001, invisibles durante meses porque nada las contaba.
 *
 * POR QUÉ NO BASTABA CON EL CUADRE
 * ────────────────────────────────
 * El Cuadre ya vigila `LegalNotice`: una de sus nueve reglas salta cuando el componente **cae a
 * CERO** en un fichero de `app/` o `components/`. Pero esa regla compara el antes con el después,
 * así que cubre la DESAPARICIÓN y es ciega a la AUSENCIA DE ORIGEN — una app que nace sin aviso
 * nunca tuvo un valor que pudiera caer. Es la asimetría que su propia documentación reconoce:
 * «estas reglas miran lo que desaparece, y nacer no es una sorpresa». Estas siete nacieron así.
 *
 * SIN PASIVO
 * ──────────
 * Las siete se repararon el 18/09/2026 en el mismo commit que crea este fichero, así que el
 * candado nace con el pasivo a cero y puede ROMPER EL BUILD de verdad, en vez de limitarse a
 * avisar como `check:a11y-jsx` o `check:parser`. Esa es la condición que lo hace valer: solo
 * puede encenderlo una app nueva escrita sin aviso legal.
 *
 * ESCAPE
 * ──────
 * `legal-ok: <razón>` en el `page.tsx` de la app. Tiene que llevar razón escrita: el candado
 * rechaza la marca a secas, porque una excepción sin motivo es una excepción que nadie puede
 * revisar después. No se conoce hoy ningún caso legítimo — la lista de excepciones está vacía
 * a propósito y `--lista` la imprime para que no crezca en silencio.
 *
 * QUÉ NO MIRA
 * ───────────
 * Las páginas que no son apps: portales (`/coquinum`, `/stemum`, `/cronicum`, `/delegum`),
 * `/contacto`, `/acerca`, `/apps`, `/mcp` y las guías. El universo es exactamente
 * `implementedAppsUrls`, que es el registro canónico de lo que es una app en este catálogo.
 * Tampoco juzga el DISCLAIMER (nivel de riesgo, severidad, colapsabilidad): eso exige criterio
 * y vive en `_private/DISCLAIMER-POLICY.md`; aquí solo se comprueba lo que tiene una única
 * respuesta correcta.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * `--raiz <dir>` analiza otro árbol en vez del repositorio. Existe solo para que
 * `npm run legal:probar-candado` pueda montar un mini-catálogo desechable y comprobar que
 * este fichero se enciende donde debe y calla donde debe, sin escribir nada en `app/`.
 */
function raizPedida() {
  const i = process.argv.indexOf('--raiz');
  return i !== -1 && process.argv[i + 1] ? path.resolve(process.argv[i + 1]) : null;
}

const RAIZ = raizPedida() ?? path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LISTA = process.argv.includes('--lista');

/**
 * Excepciones permanentes, con su razón. Vacía a propósito: hoy no hay ninguna app que
 * legítimamente deba publicarse sin aviso legal. Si alguna vez la hay, se anota aquí Y se
 * explica, para que la siguiente persona pueda discutirla.
 */
const EXCEPCIONES = new Map([]);

// ── Universo: lo que el catálogo considera una app ────────────────────────────
function slugsDeApps() {
  const src = fs.readFileSync(path.join(RAIZ, 'data/implemented-apps.ts'), 'utf8');
  const ini = src.indexOf('implementedAppsUrls = [');
  if (ini === -1) {
    console.error('✗ No se encuentra `implementedAppsUrls` en data/implemented-apps.ts');
    process.exit(1);
  }
  const cuerpo = src.slice(ini, src.indexOf('\n];', ini));
  return [...new Set([...cuerpo.matchAll(/"\/([a-z0-9-]+)\/"/g)].map((m) => m[1]))];
}

/**
 * ¿Lleva el fichero un `legal-ok:` CON razón escrita?
 *
 * ⚠️ La razón tiene que estar en la MISMA línea que la marca. El `\s*` que había aquí antes
 * incluía el salto de línea, así que un «// legal-ok:» a secas se daba por justificado con
 * lo que viniera debajo —el `import` de la línea siguiente— y el candado callaba. Lo destapó
 * el caso 8 de `npm run legal:probar-candado`, que es justo para lo que está.
 */
function tieneEscape(texto) {
  const m = texto.match(/legal-ok:[ \t]*([^\n]*)/);
  if (!m) return null;
  const razon = m[1].replace(/\*\/\s*$/, '').trim();
  return { razon, valida: razon.length > 0 };
}

/**
 * Vacía las líneas que son ENTERAS un comentario, dejando el resto intacto.
 *
 * ⚠️ Sin esto el candado se equivoca, y se equivocó las dos veces que se ejecutó antes de
 * existir esta función:
 *
 *   · `simulador-bono-joven-alquiler` — el `<LegalNotice />` está en la línea 271 y el
 *     `<EducationalSection>` empieza en la 549, pero el fichero MENCIONA
 *     «<EducationalSection>» en un comentario de la línea 84, precisamente para explicar que
 *     ahí no debe esconderse un aviso legal. Esa mención adelantaba el comienzo del bloque
 *     465 líneas y metía dentro un aviso que estaba fuera. Es el mismo fallo que arregló el
 *     commit `622bdc1a`: «un <h1> citado en un comentario metía 607 líneas de código en la
 *     señal fuerte».
 *
 *   · `conversor-markdown-html` — la primera versión de esta función también enmascaraba el
 *     contenido de las CADENAS, recorriendo el fichero carácter a carácter. Un conversor de
 *     Markdown está lleno de expresiones regulares, y una regex con acentos graves (la del
 *     código en línea) parece el principio de una plantilla: el enmascarado se desalineaba y
 *     se tragaba el `<LegalNotice />` de la línea 430, que sí existe y que producción sirve.
 *
 * De ahí que esto sea deliberadamente romo: solo líneas que son íntegramente comentario. No
 * interpreta cadenas, no interpreta regex y no puede desalinearse, porque trabaja por líneas.
 * Un comentario al final de una línea con código (`const x = 1; // …`) no se enmascara, y da
 * igual: el caso real son las cabeceras y los bloques explicativos.
 */
function soloCodigo(fuente) {
  let dentroDeBloque = false;
  return fuente
    .split('\n')
    .map((linea) => {
      const limpia = linea.trim();
      if (dentroDeBloque) {
        const cierra = limpia.includes('*/');
        if (cierra) dentroDeBloque = false;
        // La línea de cierre puede llevar código detrás; en la práctica no ocurre, y
        // vaciarla entera es el lado seguro: como mucho deja de ver algo, nunca inventa.
        return '';
      }
      if (limpia.startsWith('//')) return '';
      if (limpia.startsWith('/*') || limpia.startsWith('*')) {
        if (limpia.startsWith('/*') && !limpia.includes('*/')) dentroDeBloque = true;
        return '';
      }
      return linea;
    })
    .join('\n');
}

/**
 * Dónde empieza y acaba el bloque `<EducationalSection>`, si lo hay. Se busca sobre el código
 * ya enmascarado, nunca sobre el fuente crudo (ver `soloCodigo`).
 */
function rangoEducational(codigo) {
  const ini = codigo.search(/<EducationalSection[\s>]/);
  if (ini === -1) return null;
  const fin = codigo.indexOf('</EducationalSection>', ini);
  return { ini, fin: fin === -1 ? codigo.length : fin };
}

const slugs = slugsDeApps();

const sinMontar = [];      // ni page.tsx ni layout.tsx lo montan
const soloImportado = [];  // lo importa pero no lo monta — el falso verde
const dentroDelPlegable = [];
const escapeSinRazon = [];
const conEscape = [];

for (const slug of slugs) {
  const rutaPag = path.join(RAIZ, 'app', slug, 'page.tsx');
  const rutaLay = path.join(RAIZ, 'app', slug, 'layout.tsx');
  if (!fs.existsSync(rutaPag)) continue; // lo vigila check:verticales

  const fuentePag = fs.readFileSync(rutaPag, 'utf8');
  const fuenteLay = fs.existsSync(rutaLay) ? fs.readFileSync(rutaLay, 'utf8') : '';
  // El escape SÍ se busca en el fuente crudo: vive precisamente en un comentario.
  // Todo lo demás se juzga sobre el código enmascarado.
  const pag = soloCodigo(fuentePag);
  const lay = soloCodigo(fuenteLay);

  const escape = tieneEscape(fuentePag);
  if (escape) {
    if (!escape.valida) escapeSinRazon.push(slug);
    else conEscape.push({ slug, razon: escape.razon });
    continue;
  }
  if (EXCEPCIONES.has(slug)) continue;

  const montadoEn = (c) => /<LegalNotice[\s/>]/.test(c);
  const nombradoEn = (c) => /\bLegalNotice\b/.test(c);

  if (montadoEn(pag) || montadoEn(lay)) {
    // Montado: queda comprobar que no esté escondido en el plegable.
    const rango = rangoEducational(pag);
    if (rango) {
      const pos = pag.search(/<LegalNotice[\s/>]/);
      if (pos > rango.ini && pos < rango.fin) dentroDelPlegable.push(slug);
    }
    continue;
  }

  if (nombradoEn(pag) || nombradoEn(lay)) soloImportado.push(slug);
  else sinMontar.push(slug);
}

// ── Salida ────────────────────────────────────────────────────────────────────
if (LISTA) {
  console.log(`${slugs.length} apps registradas en data/implemented-apps.ts`);
  console.log(`  montan <LegalNotice />: ${slugs.length - sinMontar.length - soloImportado.length - conEscape.length - escapeSinRazon.length}`);
  console.log(`  con «legal-ok:»:        ${conEscape.length}`);
  for (const { slug, razon } of conEscape) console.log(`      ${slug} → ${razon}`);
  console.log(`  excepciones declaradas: ${EXCEPCIONES.size}`);
  for (const [slug, razon] of EXCEPCIONES) console.log(`      ${slug} → ${razon}`);
  process.exit(0);
}

let falla = false;

if (sinMontar.length) {
  falla = true;
  console.error(`\n✗ APPS SIN AVISO LEGAL: ${sinMontar.length} de ${slugs.length}\n`);
  console.error('  LegalNotice es uno de los cinco componentes obligatorios en TODAS las apps');
  console.error('  (CLAUDE.md · _private/DISCLAIMER-POLICY.md). Sin él, la app no dice quién');
  console.error('  responde de lo que calcula ni qué pasa con lo que el usuario escribe.\n');
  for (const s of sinMontar) console.error(`    app/${s}/page.tsx`);
  console.error('\n  Monta <LegalNotice /> tras el hero, o declara «legal-ok: <razón>» en el page.tsx.');
}

if (soloImportado.length) {
  falla = true;
  console.error(`\n✗ LegalNotice IMPORTADO PERO NO MONTADO: ${soloImportado.length}\n`);
  console.error('  El nombre aparece en el fichero, pero no hay ningún <LegalNotice /> en el JSX,');
  console.error('  así que la página se sirve igual de desnuda que si no estuviera.\n');
  for (const s of soloImportado) console.error(`    app/${s}/page.tsx`);
  console.error('\n  Añade <LegalNotice /> al JSX, o retira el import si no se va a usar.');
}

if (dentroDelPlegable.length) {
  falla = true;
  console.error(`\n✗ AVISO LEGAL ESCONDIDO EN EL PLEGABLE: ${dentroDelPlegable.length}\n`);
  console.error('  <LegalNotice /> está dentro de <EducationalSection>, que nace colapsada.');
  console.error('  El CLAUDE.md lo prohíbe: «Nunca ocultar dentro de EducationalSection un');
  console.error('  disclaimer legal […]: es responsabilidad jurídica, no maquetación».\n');
  for (const s of dentroDelPlegable) console.error(`    app/${s}/page.tsx`);
  console.error('\n  Sácalo del bloque educativo y déjalo visible tras el hero.');
}

if (escapeSinRazon.length) {
  falla = true;
  console.error(`\n✗ «legal-ok:» SIN RAZÓN ESCRITA: ${escapeSinRazon.length}\n`);
  console.error('  Una excepción sin motivo es una excepción que nadie puede revisar después.\n');
  for (const s of escapeSinRazon) console.error(`    app/${s}/page.tsx`);
  console.error('\n  Escribe «legal-ok: <por qué esta app no lleva aviso legal>».');
}

if (falla) process.exit(1);

const eximidas = conEscape.length + EXCEPCIONES.size;
console.log(
  `✓ aviso legal: las ${slugs.length - eximidas} apps montan <LegalNotice /> y ninguna lo esconde en el plegable` +
    (eximidas ? ` (${eximidas} con excepción declarada)` : ''),
);
