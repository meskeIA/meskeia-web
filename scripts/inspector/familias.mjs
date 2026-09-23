/**
 * Las familias de apps — grupos que hay que inspeccionar JUNTOS
 *
 * Una familia son apps hermanas que comparten lógica escrita varias veces. Lo que las
 * define NO es el nombre: es que una reparación en una tenga que llegar a las demás.
 *
 * DE DÓNDE SALE, Y POR QUÉ NO BASTABA CON REPARAR EN LOTE
 * ──────────────────────────────────────────────────────
 * Medido el 23/09/2026: **63 de los 97 hallazgos históricos del Inspector con lenguaje de
 * propagación** («hermana», «no llegó a», «dejó atrás») son del clúster de compraventa —
 * el 7,9 % de todos los hallazgos de la base.
 *
 * El 22/09 a las 16:16 ese clúster se reparó EN LOTE, a propósito y con el patrón delante:
 * `cfe091a7 — fix(compraventa): un importe ilegible se nombra en las SIETE apps del clúster,
 * y el aviso dice en qué dirección falta`. **Y aun así dejó cuatro huecos**, y el más grave
 * reintrodujo en `local-comercial` el mismo defecto de dirección invertida que esa misma
 * reparación corregía en `trastero`: su comentario cita el hallazgo 1157 «visto en trastero»
 * y mete el campo en la lista contraria. Otro hueco era un campo EXCLUSIVO de una hermana
 * (amortizaciones), que el lote no podía ver porque las demás no lo tienen.
 *
 * De ahí las tres consecuencias que este fichero sostiene:
 *   1. La cola las saca JUNTAS, en vez de garaje en septiembre y solar en diciembre.
 *   2. Cada familia tiene un TESTIGO que mide las N a la vez y CALCULA la dirección del
 *      efecto en lugar de razonarla.
 *   3. El candado `check:familias` (en `npm run build`, desde el 23/09/2026) ejecuta ese
 *      testigo y exige que cubra cada `NumberInput` de cada hermana. Lee ESTA lista: una
 *      familia nueva entra en el build con declararla aquí.
 *
 * ⚠️ POR QUÉ LA LISTA ES A MANO Y NO SE DERIVA DEL NOMBRE
 * ──────────────────────────────────────────────────────
 * Compartir prefijo no es compartir código: medido el 23/09, `visualizador-sistema` (8),
 * `visualizador-ciclo` (7) y `selector-tipo` (7) comparten nombre y no son familias. Y al
 * revés, `estimador-compraventa-inmueble` no empieza por `simulador-gastos-` y sí lo es.
 *
 * ⚠️ Y POR QUÉ NADIE DEBE CENSAR UNA FAMILIA CON `grep`
 * ────────────────────────────────────────────────────
 * En esta misma investigación, `grep -c esLegible` devolvió 0 en tres apps SANAS que
 * escribían la guarda inline, y por poco se reparan tres apps que estaban bien. Contar la
 * presencia de un identificador no es contar la presencia de la protección: lo que vale es
 * medir COMPORTAMIENTO, que es lo que hace el testigo.
 */

export const FAMILIAS = [
  {
    id: 'compraventa',
    nombre: 'Compraventa inmobiliaria',
    testigo: 'tests/familias/compraventa.spec.ts',
    invariante:
      'Un importe ILEGIBLE (2.000.50) no es un cero: si mueve alguna cifra publicada, la app ' +
      'tiene que nombrarlo y decir EN QUÉ DIRECCIÓN falta.',
    referencia: 'estimador-compraventa-inmueble',
    slugs: [
      'estimador-compraventa-inmueble',
      'simulador-gastos-compraventa-garaje',
      'simulador-gastos-compraventa-trastero',
      'simulador-gastos-compraventa-local-comercial',
      'simulador-gastos-compraventa-nave-industrial',
      'simulador-gastos-compraventa-solar',
      'simulador-gastos-compraventa-terreno-rustico',
    ],
  },
];

const PORSLUG = new Map();
for (const f of FAMILIAS) for (const s of f.slugs) PORSLUG.set(s, f);

/** La familia a la que pertenece un slug, o null. */
export function familiaDe(slug) {
  return PORSLUG.get(slug) || null;
}

/** Las hermanas de un slug (sin incluirlo), o [] si no es de familia. */
export function hermanasDe(slug) {
  const f = PORSLUG.get(slug);
  return f ? f.slugs.filter((s) => s !== slug) : [];
}

/**
 * Comprueba que todo slug declarado existe de verdad en la base.
 *
 * Es el fallo silencioso clásico de este proyecto: una lista a mano que envejece sin que
 * nada avise. Devuelve los slugs huérfanos; quien llame decide si avisar o romper.
 */
export function slugsHuerfanos(db) {
  const vivos = new Set(db.prepare('SELECT slug FROM apps').all().map((r) => r.slug));
  return FAMILIAS.flatMap((f) =>
    f.slugs.filter((s) => !vivos.has(s)).map((s) => ({ familia: f.id, slug: s })),
  );
}
