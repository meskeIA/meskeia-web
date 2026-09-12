#!/usr/bin/env node
/**
 * check-minimo-irpf.mjs — que el mínimo personal y familiar no vuelva a restarse de la base
 *
 * Ejecutar:  npm run check:minimo-irpf                       (lo ejecuta también `npm run build`)
 *            node scripts/check-minimo-irpf.mjs app/x/page.tsx   (ficheros sueltos)
 *
 * QUÉ BUSCA
 * ─────────
 * Una resta cuyo sustraendo es un mínimo del IRPF:
 *
 *     const baseLiquidable = Math.max(0, baseImponible - MINIMOS_IRPF_2025.personal);
 *     const base = rendimientoNetoReducido - minimoPersonal;
 *     const baseLiquidable = baseImponible - MINIMO_PERSONAL;
 *
 * En un fichero que además calcula cuota de IRPF (importa `TRAMOS_IRPF_2025`,
 * `MINIMOS_IRPF_2025` o las funciones canónicas de `data/fiscal/irpf.ts`), esa resta solo
 * puede significar una cosa: que el mínimo se está restando de la base antes de aplicar la
 * escala.
 *
 * POR QUÉ IMPORTA
 * ───────────────
 * El art. 63.1.2.º LIRPF dice que el mínimo **no reduce la renta**: forma parte de la base
 * liquidable general y se grava a TIPO CERO. La ley lo consigue aplicando la escala DOS
 * VECES —a la base liquidable completa y al mínimo— y restando la segunda cuota de la
 * primera. La AEAT lo enuncia así en el manual de ayuda de Renta 2025:
 *
 *   «A la base liquidable general (sin descontar el importe del mínimo personal y familiar)
 *    se le aplicarán los tipos correspondientes a la escala general del impuesto […]. Se
 *    aplicará la misma escala a la parte de base liquidable general correspondiente al
 *    mínimo personal y familiar […]. Se restará a la cuota resultante del apartado 1 la
 *    cuota resultante del apartado 2.»
 *
 * Restarlo de la base lo valora al tipo MARGINAL del contribuyente en vez de a los tipos
 * bajos de la escala, y **subestima la cuota**. Con el mínimo personal de 5.550 € el error
 * crece con la renta hasta un techo de 1.443 €/año (5.550 × (45 − 19) %): 610,50 € con
 * 30.000 € de bruto y 1.443 € de 80.000 € en adelante. Con mínimos familiares grandes llega
 * a 3.691 €/año (70.000 € de base, tres hijos, uno menor de 3 años).
 *
 * DE DÓNDE SALE
 * ─────────────
 * De tres reparaciones del MISMO defecto en cuatro días, cada una dejando fuera lo que nadie
 * había mirado, porque la fórmula estaba copiada en 19 sitios:
 *
 *   · 09/09/2026 (2b80033d) — seis motores de `lib/calculadoras`.
 *   · 11/09/2026 (4ba094cd) — `estimador-sueldo-neto`, que calculaba por su cuenta.
 *   · 12/09/2026            — las siete restantes: `simulador-desglose-nomina`,
 *     `visualizador-sueldo-neto`, `comparador-autonomo-vs-sl`, `optimizador-rentas-60`,
 *     `estimador-irpf`, `estimador-smi` y `simulador-modulos-vs-directa` (+ su motor).
 *
 * Ese día la fórmula se centralizó en `calcularCuotaIntegraGeneral` y el pasivo quedó a
 * CERO, que es la condición que permite a este candado romper el build de verdad en vez de
 * solo avisar (como `check:parser` o `check:a11y-jsx`, que arrastran miles de casos).
 *
 * QUÉ NO HACE, Y POR QUÉ
 * ──────────────────────
 * No mira la reducción por tributación conjunta del art. 84.2 (3.400 / 2.150 €). Esa SÍ se
 * resta de la base —«la base imponible se reducirá»—, así que una resta contra ella es
 * correcta y este candado no debe tocarla. Por eso el patrón exige que el sustraendo se
 * llame «mínimo», y por eso `REDUCCION_TRIBUTACION_CONJUNTA_2025` no dispara nada.
 *
 * Tampoco mira la resta entre CUOTAS (`cuotaEscala − cuotaMinimo`), que es exactamente el
 * método correcto. De ahí que un identificador que empieza por `cuota` quede excluido: la
 * diferencia entre el defecto y su reparación es qué se resta, no si se resta.
 *
 * Casos de prueba: `scripts/pruebas/minimo-irpf.tsx` · `npm run minimo:probar-candado`.
 *
 * FALSO POSITIVO
 * ──────────────
 * `minimo-ok: <razón>` en esa línea o en la anterior.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SUELTOS = process.argv.slice(2).filter((a) => !a.startsWith('--'));

// ─── Patrones ─────────────────────────────────────────────────────────────────

/**
 * Un fichero solo entra al análisis si calcula IRPF. Sin esto, cualquier «mínimo» del
 * catálogo (un mínimo de un gráfico, el mínimo de una serie) podría disparar el candado.
 */
const CALCULA_IRPF = /\b(TRAMOS_IRPF_2025|MINIMOS_IRPF_2025|cuotaEscalaGeneral|desglosarEscalaGeneral|calcularCuotaIntegraGeneral)\b/;

/**
 * Resta cuyo sustraendo es un mínimo del IRPF. Tres formas:
 *   − MINIMOS_IRPF_2025.personal        (la constante canónica, con o sin campo)
 *   − MINIMO_PERSONAL / MINIMO_ALGO     (constante local en mayúsculas)
 *   − minimoPersonal / minimosFamiliares / minimoAplicable  (variable en camelCase)
 *
 * El sustraendo NO puede empezar por `cuota`: `cuotaBase − cuotaDelMinimo` es el método
 * CORRECTO del art. 63.1.2.º, no el defecto.
 */
const RESTA_DE_UN_MINIMO =
  /(?:^|[\s(),[\]])-\s*(?!cuota)(?:MINIMOS_IRPF_2025\b|MINIMOS?_[A-Z][A-Z0-9_]*\b|[a-z$_][\w$]*[Mm]inimos?[\w$]*\b|minimos?[\w$]*\b)/;

/**
 * El guion de `irpf-tramos-minimos` no es una resta, y ese slug aparece en seis ficheros de
 * Delegum. Dos guardas lo separan del operador: el patrón exige que el `-` venga precedido
 * de un separador real —espacio, coma o paréntesis, nunca una letra— y aquí se vacían las
 * cadenas entrecomilladas, porque dentro de una cadena no se calcula nada.
 */
function sinCadenas(texto) {
  return texto
    .replace(/'(?:[^'\\]|\\.)*'/g, "''")
    .replace(/"(?:[^"\\]|\\.)*"/g, '""');
}

/** El escape, en la propia línea o en la anterior. */
const ESCAPE = /minimo-ok:/;

/**
 * Una resta dentro de un comentario no calcula nada. Se descartan las líneas cuyo contenido
 * antes del patrón ya está comentado (`//`, `*`, `/*`), que es como están escritas las
 * explicaciones del propio defecto en las cabeceras reparadas.
 */
function esComentario(texto) {
  const t = texto.trim();
  return t.startsWith('//') || t.startsWith('*') || t.startsWith('/*');
}

// ─── Objetivos ────────────────────────────────────────────────────────────────

function objetivos() {
  if (SUELTOS.length > 0) return SUELTOS.map((p) => p.replace(/\\/g, '/'));
  const todos = [];
  const rec = (dir) => {
    if (!fs.existsSync(dir)) return;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.name === 'node_modules' || e.name === '.next') continue;
      const abs = path.join(dir, e.name);
      if (e.isDirectory()) rec(abs);
      else if (e.name.endsWith('.ts') || e.name.endsWith('.tsx'))
        todos.push(path.relative(RAIZ, abs).replace(/\\/g, '/'));
    }
  };
  // Sin pasivo, así que se barre el árbol entero y no solo lo que el commit toca.
  for (const dir of ['app', 'components', 'lib', 'data']) rec(path.join(RAIZ, dir));
  return todos;
}

// ─── Análisis ─────────────────────────────────────────────────────────────────

const fallos = [];
let analizados = 0;

for (const rel of objetivos()) {
  const abs = path.isAbsolute(rel) ? rel : path.join(RAIZ, rel);
  if (!fs.existsSync(abs)) continue;
  const fuente = fs.readFileSync(abs, 'utf8');
  if (!CALCULA_IRPF.test(fuente)) continue;
  analizados++;

  const lineas = fuente.split('\n');
  lineas.forEach((texto, i) => {
    if (esComentario(texto)) return;
    if (!RESTA_DE_UN_MINIMO.test(sinCadenas(texto))) return;
    if (ESCAPE.test(texto) || (i > 0 && ESCAPE.test(lineas[i - 1]))) return;
    fallos.push({ rel, n: i + 1, texto: texto.trim().slice(0, 100) });
  });
}

// ─── Salida ───────────────────────────────────────────────────────────────────

if (fallos.length === 0) {
  console.log(`✓ mínimo IRPF: 0 restas del mínimo contra la base (${analizados} ficheros que calculan IRPF)`);
  process.exit(0);
}

console.error(`\n✗ MÍNIMO IRPF: ${fallos.length} resta(s) del mínimo contra la base\n`);
for (const f of fallos) {
  console.error(`  ${f.rel}:${f.n}`);
  console.error(`    ${f.texto}`);
}
console.error(
  '\n  El mínimo personal y familiar NO reduce la base (art. 63.1.2.º LIRPF): se grava a tipo\n' +
  '  cero aplicando la escala a la base COMPLETA y restando de la cuota la misma escala\n' +
  '  aplicada al mínimo. Restarlo de la base lo valora al tipo marginal y subestima la cuota\n' +
  '  hasta 1.443 €/año solo con el mínimo personal.\n\n' +
  '  Usa `calcularCuotaIntegraGeneral(baseLiquidableGeneral, minimo)` de @/data/fiscal.\n' +
  '  Falso positivo (p. ej. la reducción del art. 84.2, que esa sí va contra la base):\n' +
  '  escribe `minimo-ok: <razón>` en esa línea o en la anterior.\n'
);
process.exit(1);
