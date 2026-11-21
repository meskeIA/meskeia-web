import { test, expect, devices, type Page, type Locator } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact, esperarPaginaAsentada } from './_hidratacion';
import { activarTemaOscuro, prepararParaMedir } from '../_contraste';

/**
 * Inspector — comparador-tamanos-papel (segmento cálculo)
 *
 * Primera inspección: 20/11/2026. La app promete en su <h1> «Medidas de papel: A4, Carta, Oficio y
 * cuartilla» y en el subtítulo los formatos «superpuestos y a escala real, con las diferencias
 * acotadas al milímetro». Cuatro herramientas con verdad comprobable: el catálogo (mm, cm, pulgadas,
 * píxeles a un DPI y superficie), el comparador visual (Δ ancho, Δ alto, ¿encaja?), «¿Cabe en mi
 * impresora?» (escala, sobrante, aprovechamiento, recorte) y el conversor de unidades.
 *
 * DÓNDE VIVE EL CÁLCULO: todo en app/comparador-tamanos-papel/page.tsx (FORMATOS en mm, mmACm,
 * mmAPulgadas, mmAPixeles, el useMemo `comprobacion` y el `conversion`). Lee con parseSpanishNumber y
 * pinta con formatNumber (es-ES: sin punto de millares hasta cinco cifras enteras, «9999» y «14.043»).
 *
 * MEDIDAS DERIVADAS A MANO, SIN MIRAR LA APP (script .inspector-trabajo/papel-esperados.mjs)
 *   Serie A: A0 = 841 × 1189 (1 m², razón √2); cada An+1 parte el lado largo de An y redondea hacia
 *     abajo al mm: 594 × 841, 420 × 594, 297 × 420, 210 × 297, 148 × 210, 105 × 148, 74 × 105,
 *     52 × 74, 37 × 52, 26 × 37.
 *   Serie B: B0 = 1000 × 1414, misma regla: 707 × 1000 … 250 × 353 (B4), 176 × 250 (B5) … 31 × 44.
 *   Serie C (ISO 269): C0 = √(841·1000) × √(1189·1414) = 917,06 × 1296,63 → 917 × 1297, y la regla:
 *     648 × 917 … 229 × 324 (C4), 162 × 229 (C5), 114 × 162 (C6), 81 × 114, 57 × 81. DL = 110 × 220.
 *   Norteamérica, por la pulgada exacta (25,4 mm): Carta 8,5 × 11 in = 215,9 × 279,4 · Legal 8,5 × 14
 *     = 215,9 × 355,6 · Tabloide 11 × 17 = 279,4 × 431,8 · Media carta 5,5 × 8,5 = 139,7 × 215,9 ·
 *     Ejecutivo 7,25 × 10,5 = 184,15 × 266,7 · ANSI C 17 × 22 = 431,8 × 558,8.
 *   Columnas: cm = mm/10 (1 decimal) · in = mm/25,4 (2) · px = in × DPI (0) · superficie mm²/100 (0).
 *
 * LOS CASOS, RESUELTOS ANTES DE ABRIR EL NAVEGADOR
 *   CASO 1 (normal)
 *     Catálogo de A, B, C y norteamericanos a 300 DPI: las filas literales de abajo.
 *     Comparador inicial A4 + Carta: Carta 5,9 mm más ancho y 17,6 mm más bajo (al mm, +6 y −18);
 *       no cabe en A4. Rectángulos con razón alto/ancho 297/210 = 1,4143 y 279,4/215,9 = 1,2941.
 *     Carta → A4: escala min(210/215,9; 297/279,4) = 97,267 %; tras escalar sobran 0 × 25,24 mm;
 *       aprovechamiento 271,76/297 = 91,5 %; al 100 % se pierden 5,9 mm de ancho.
 *     A4 → Carta: 279,4/297 = 94,074 %; sobran 18,34 × 0; al 100 % se pierden 17,6 mm de alto.
 *     Legal → A4: 297/355,6 = 83,52 %; sobran 29,68 × 0; aprovechamiento 85,87 %; recorte 5,9 y 58,6.
 *     Conversor a 300 DPI: 210 mm = 21,00 cm = 8,268 in = 2480 px (72 DPI: 595) · «21,5» cm = 215 mm
 *       = 8,465 in = 2539 px · «8,5» in = 215,90 mm = 2550 px · «1.500» px = 5 in = 127,00 mm.
 *     DPI libre 240: A4 = 8,2677 × 240 = 1984 por 11,6929 × 240 = 2806 px.
 *   CASO 2 (límite)
 *     A0 y A10, B0 y B10, C0 y C8 (dentro de las filas de cada serie). A4 → A4: 100 %, nada sobra.
 *     A0 → A10: 3,09 %; al 100 % se pierden 815 y 1152 mm. A5 → A4: cabe al 100 %; impreso a 100 %
 *     sobran 62 × 87 mm y se aprovecha 31 080/62 370 = 49,8 % de la hoja.
 *     Tarjeta de visita europea (85 × 55, apaisada) en A7 (74 × 105): girada, 55 × 85 cabe entera.
 *     Móvil (Pixel 7): el dibujo cabe en el ancho y cada rectángulo conserva su razón.
 *   CASO 3 (rechazo)
 *     Conversor: «0», «-5», vacío, «abc», «12abc» y «1e3» → sin cifras y con el aviso.
 *     «1,234.5» → con los dos separadores manda el último: 1234,50 mm. DPI «1.200» = mil doscientos;
 *     DPI «5» (fuera de 10-4800) no se aplica.
 *
 * HALLAZGOS del 20/11/2026 (5343-5352), REPARADOS el 21/11/2026: sus test ya no llevan test.fail().
 *   A. «Cabe al 100 %», pero sobrante y aprovechamiento se calculan ampliando (A5 → A4 a 141,4 %).
 *   B. Texto del SVG del comparador por debajo de 4,5:1 en los dos temas.
 *   C. Escala A4 → Carta: el FAQPage dice 97 % y la guía 94,3 %; el comprobador da 94,1 %.
 *   D. La escala se redondea al décimo más cercano: a 97,3 % un Carta mide 210,07 mm y no entra en A4.
 *   E. Ejecutivo guardado con 184,1 mm (7,25 in = 184,15): 2174 px a 300 DPI en vez de 2175; y
 *      «Medidas exactas» redondea al mm los formatos en pulgadas.
 *   F. Las tarjetas de visita van apaisadas y nada gira: «no cabe» en A7 cuando girada cabe.
 *   G. DPI libre fuera de rango: se descarta sin decir nada.
 *   H. Cifras «exactas» que no lo son (841 ÷ 594,5 = 1,4146; un A4 de 80 g/m² pesa 4,99 g) y la regla
 *      del sobre «misma letra y número que el papel más uno».
 *   I. «%» con espacio normal (no U+00A0) y «100%» pegado en el JSON-LD.
 *   J. JSON-LD: la serie C no es ISO 216 (es ISO 269) y el «catálogo completo» se para en C8.
 *
 * HALLAZGO 5377 del 21/11/2026 (cabo C0862), REPARADO el 21/11/2026 con una tinta por pieza y tema
 * (.doblado0…4), calculada contra la pieza compuesta para dar ≥ 4,6:1:
 *   K. Los rótulos A1…A5 del dibujo «Por qué al doblar un A4 sale un A5» se pintan con los rellenos
 *      fijos de COLORES (sin variante de tema, lo que 5344 ya corrigió en las cotas del comparador)
 *      sobre su propia pieza teñida con fill-opacity 0,14 + 0,05·i. Las piezas no se superponen (cada
 *      una es la mitad del resto), así que el fondo de cada rótulo es su pieza compuesta sobre el
 *      lienzo (#FAFAFA / #1A1A1A). Calculado a mano (.inspector-trabajo/c0862-esperados.mjs):
 *        claro:  A1 3,34 · A2 2,26 · A3 1,83 · A4 4,92 · A5 2,60
 *        oscuro: A1 3,63 · A2 4,59 · A3 4,81 · A4 1,76 · A5 2,73
 *      Tamaño en pantalla, peso 700 (fuente en unidades × escala del viewBox): en 1280 × 720 el SVG
 *      lo limita max-height 46vh (escala 331,2/853): 72,1 · 51,0 · 36,1 · 25,5 · 18,0 px; en Pixel 7
 *      (312 px de lienzo, escala 312/1201): 48,3 · 34,1 · 24,1 · 17,1 · 12,1 px. Grande (≥ 18,66 px
 *      en negrita) → 3:1; si no, 4,5:1. Fallan A2, A3 y A5 en claro y A4 y A5 en oscuro, a los dos
 *      anchos.
 */

const RUTA = '/comparador-tamanos-papel/';
const PIXEL_7 = devices['Pixel 7'];

type Fila = [nombre: string, mm: string, cm: string, pulgadas: string, px300: string, superficie: string];

const SERIE_A: Fila[] = [
  ['A0', '841 × 1189', '84,1 × 118,9', '33,11 × 46,81', '9933 × 14.043', '9999 cm²'],
  ['A1', '594 × 841', '59,4 × 84,1', '23,39 × 33,11', '7016 × 9933', '4996 cm²'],
  ['A2', '420 × 594', '42,0 × 59,4', '16,54 × 23,39', '4961 × 7016', '2495 cm²'],
  ['A3', '297 × 420', '29,7 × 42,0', '11,69 × 16,54', '3508 × 4961', '1247 cm²'],
  ['A4', '210 × 297', '21,0 × 29,7', '8,27 × 11,69', '2480 × 3508', '624 cm²'],
  ['A5', '148 × 210', '14,8 × 21,0', '5,83 × 8,27', '1748 × 2480', '311 cm²'],
  ['A6', '105 × 148', '10,5 × 14,8', '4,13 × 5,83', '1240 × 1748', '155 cm²'],
  ['A7', '74 × 105', '7,4 × 10,5', '2,91 × 4,13', '874 × 1240', '78 cm²'],
  ['A8', '52 × 74', '5,2 × 7,4', '2,05 × 2,91', '614 × 874', '38 cm²'],
  ['A9', '37 × 52', '3,7 × 5,2', '1,46 × 2,05', '437 × 614', '19 cm²'],
  ['A10', '26 × 37', '2,6 × 3,7', '1,02 × 1,46', '307 × 437', '10 cm²'],
];

const SERIE_B: Fila[] = [
  ['B0', '1000 × 1414', '100,0 × 141,4', '39,37 × 55,67', '11.811 × 16.701', '14.140 cm²'],
  ['B1', '707 × 1000', '70,7 × 100,0', '27,83 × 39,37', '8350 × 11.811', '7070 cm²'],
  ['B2', '500 × 707', '50,0 × 70,7', '19,69 × 27,83', '5906 × 8350', '3535 cm²'],
  ['B3', '353 × 500', '35,3 × 50,0', '13,90 × 19,69', '4169 × 5906', '1765 cm²'],
  ['B4', '250 × 353', '25,0 × 35,3', '9,84 × 13,90', '2953 × 4169', '883 cm²'],
  ['B5', '176 × 250', '17,6 × 25,0', '6,93 × 9,84', '2079 × 2953', '440 cm²'],
  ['B6', '125 × 176', '12,5 × 17,6', '4,92 × 6,93', '1476 × 2079', '220 cm²'],
  ['B7', '88 × 125', '8,8 × 12,5', '3,46 × 4,92', '1039 × 1476', '110 cm²'],
  ['B8', '62 × 88', '6,2 × 8,8', '2,44 × 3,46', '732 × 1039', '55 cm²'],
  ['B9', '44 × 62', '4,4 × 6,2', '1,73 × 2,44', '520 × 732', '27 cm²'],
  ['B10', '31 × 44', '3,1 × 4,4', '1,22 × 1,73', '366 × 520', '14 cm²'],
];

const SERIE_C: Fila[] = [
  ['C0', '917 × 1297', '91,7 × 129,7', '36,10 × 51,06', '10.831 × 15.319', '11.893 cm²'],
  ['C1', '648 × 917', '64,8 × 91,7', '25,51 × 36,10', '7654 × 10.831', '5942 cm²'],
  ['C2', '458 × 648', '45,8 × 64,8', '18,03 × 25,51', '5409 × 7654', '2968 cm²'],
  ['C3', '324 × 458', '32,4 × 45,8', '12,76 × 18,03', '3827 × 5409', '1484 cm²'],
  ['C4', '229 × 324', '22,9 × 32,4', '9,02 × 12,76', '2705 × 3827', '742 cm²'],
  ['C5', '162 × 229', '16,2 × 22,9', '6,38 × 9,02', '1913 × 2705', '371 cm²'],
  ['C6', '114 × 162', '11,4 × 16,2', '4,49 × 6,38', '1346 × 1913', '185 cm²'],
  ['DL (sobre alargado)', '110 × 220', '11,0 × 22,0', '4,33 × 8,66', '1299 × 2598', '242 cm²'],
  ['C7', '81 × 114', '8,1 × 11,4', '3,19 × 4,49', '957 × 1346', '92 cm²'],
  ['C8', '57 × 81', '5,7 × 8,1', '2,24 × 3,19', '673 × 957', '46 cm²'],
];
/** Por la misma regla, si algún día se añaden (hallazgo J): C9 = 40 × 57 y C10 = 28 × 40. */
const C9_C10: Record<string, string> = { C9: '40 × 57', C10: '28 × 40' };

/**
 * Norteamericanos: la columna de mm se acepta redondeada al mm (lo de hoy) o con su decimal exacto
 * (hallazgo E). La de píxeles del Ejecutivo se mira aparte, en su hallazgo.
 */
const NORTEAMERICA: [string, string[], string, string, string | null, string][] = [
  ['Carta (Letter)', ['216 × 279', '215,9 × 279,4'], '21,6 × 27,9', '8,50 × 11,00', '2550 × 3300', '603 cm²'],
  ['Oficio / Legal (EE. UU.)', ['216 × 356', '215,9 × 355,6'], '21,6 × 35,6', '8,50 × 14,00', '2550 × 4200', '768 cm²'],
  // Oficio mexicano: 340 mm de alto por definición de la app (no hay norma con la que cotejarlo);
  // solo se comprueban sus conversiones: 340/25,4 = 13,386 in → 4016 px; 215,9 × 340 = 734 cm².
  ['Oficio (México)', ['216 × 340', '215,9 × 340'], '21,6 × 34,0', '8,50 × 13,39', '2550 × 4016', '734 cm²'],
  ['Tabloide (Ledger)', ['279 × 432', '279,4 × 431,8'], '27,9 × 43,2', '11,00 × 17,00', '3300 × 5100', '1206 cm²'],
  ['Media carta (Half Letter)', ['140 × 216', '139,7 × 215,9'], '14,0 × 21,6', '5,50 × 8,50', '1650 × 2550', '302 cm²'],
  ['Ejecutivo (Executive)', ['184 × 267', '184,2 × 266,7', '184,15 × 266,7'], '18,4 × 26,7', '7,25 × 10,50', null, '491 cm²'],
  ['ANSI C', ['432 × 559', '431,8 × 558,8'], '43,2 × 55,9', '17,00 × 22,00', '5100 × 6600', '2413 cm²'],
];

const catalogo = (page: Page): Locator => page.locator('section[aria-labelledby="titulo-catalogo"]');
const comparador = (page: Page): Locator => page.locator('section[aria-labelledby="titulo-comparador"]');
const impresion = (page: Page): Locator => page.locator('section[aria-labelledby="titulo-impresion"]');
const conversor = (page: Page): Locator => page.locator('section[aria-labelledby="titulo-conversor"]');

/**
 * El contenedor de la app (el <div> que tiene el hero). No `body`: su textContent incluye los
 * <script> del JSON-LD y la carga de React, que repiten los textos (tests/apps/README.md).
 */
const contenedor = (page: Page): Locator => page.locator('div:has(> header > h1)');

const normal = (s: string | null): string => (s ?? '').replace(/\s+/g, ' ').trim();

/** Activa una familia del catálogo y devuelve sus filas: nombre (sin la nota) y las cinco cifras. */
async function filasDe(page: Page, familia: RegExp): Promise<string[][]> {
  const chip = catalogo(page).getByRole('button', { name: familia });
  await chip.click();
  await expect(chip).toHaveAttribute('aria-pressed', 'true');
  return catalogo(page)
    .locator('table tbody tr')
    .evaluateAll((trs) =>
      trs.map((tr) => {
        const th = tr.querySelector('th');
        const nombre = (th?.childNodes[0]?.textContent ?? '').trim();
        const celdas = Array.from(tr.querySelectorAll('td'))
          .slice(0, 5)
          .map((td) => (td.textContent ?? '').replace(/\s+/g, ' ').trim());
        return [nombre, ...celdas];
      }),
    );
}

function porNombre(filas: string[][]): Map<string, string[]> {
  return new Map(filas.map((f) => [f[0], f]));
}

interface Comprobacion {
  escala: string;
  notaEscala: string;
  sobrante: string;
  aprovechamiento: string;
  notaAprovechamiento: string;
  recorte: string;
}

async function tarjeta(page: Page, etiqueta: string): Promise<Locator> {
  return impresion(page).getByText(etiqueta, { exact: true }).locator('xpath=..');
}

async function comprobar(page: Page, origen: string, destino: string): Promise<Comprobacion> {
  await page.locator('#origen').selectOption(origen);
  await page.locator('#destino').selectOption(destino);
  await expect(page.locator('#origen')).toHaveValue(origen);
  await expect(page.locator('#destino')).toHaveValue(destino);
  const escala = await tarjeta(page, 'Escala necesaria');
  const sobrante = await tarjeta(page, 'Papel sobrante tras escalar');
  const aprov = await tarjeta(page, 'Aprovechamiento de la hoja');
  const recorte = await tarjeta(page, 'Si imprimes al 100 % sin reducir');
  return {
    escala: normal(await escala.locator('strong').textContent()),
    notaEscala: normal(await escala.locator('span').last().textContent()),
    sobrante: normal(await sobrante.locator('strong').textContent()),
    aprovechamiento: normal(await aprov.locator('strong').textContent()),
    notaAprovechamiento: normal(await aprov.locator('span').last().textContent()),
    recorte: normal(await recorte.locator('strong').textContent()),
  };
}

/** Cifra española a número: «97,3» → 97.3. */
const aNumero = (s: string): number => Number(s.replace(/\./g, '').replace(',', '.'));

async function convertir(page: Page, valor: string, unidad: 'mm' | 'cm' | 'in' | 'px'): Promise<void> {
  await page.locator('#unidad-conversor').selectOption(unidad);
  await expect(page.locator('#unidad-conversor')).toHaveValue(unidad);
  await page.locator('#valor-conversor').fill(valor);
  await esperarValorEnReact(page, '#valor-conversor', valor);
}

async function leerConversor(page: Page): Promise<string[]> {
  return (await conversor(page).locator('strong').allTextContents()).map(normal);
}

async function aplicarDpi(page: Page, valor: string): Promise<void> {
  await page.locator('#dpi-libre').fill(valor);
  await esperarValorEnReact(page, '#dpi-libre', valor);
  await catalogo(page).getByRole('button', { name: 'Aplicar' }).click();
}

async function ldDeTipo(page: Page, tipo: string): Promise<Record<string, unknown>> {
  const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
  const hallado = bloques.map((b) => JSON.parse(b) as Record<string, unknown>).find((j) => j['@type'] === tipo);
  if (!hallado) throw new Error(`No hay JSON-LD de tipo ${tipo}`);
  return hallado;
}

/** Razón alto/ancho de cada rectángulo dibujado en el comparador, medida en pantalla. */
async function razonesDibujadas(page: Page): Promise<{ ancho: number; alto: number; razon: number }[]> {
  return comparador(page)
    .locator('svg rect')
    .evaluateAll((rs) =>
      rs.map((r) => {
        const b = r.getBoundingClientRect();
        return { ancho: Number(r.getAttribute('width')), alto: Number(r.getAttribute('height')), razon: b.height / b.width };
      }),
    );
}

/**
 * Contraste de las cotas del SVG («210 mm»…), que van fuera de los rectángulos, sobre el fondo opaco
 * del lienzo. No sirve `contrasteSobreFondoReal` de ./_contraste: mide `color` y un <text> de SVG se
 * pinta con `fill`.
 */
async function contrastesCotas(page: Page): Promise<{ texto: string; fill: string; ratio: number }[]> {
  return comparador(page)
    .locator('svg text')
    .evaluateAll((ts) => {
      const lum = (rgb: string): number => {
        const c = (rgb.match(/[\d.]+/g) ?? []).slice(0, 3).map((v) => Number(v) / 255)
          .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
        return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
      };
      return ts
        .filter((t) => / mm$/.test(t.textContent ?? ''))
        .map((t) => {
          const fondo = getComputedStyle(t.closest('svg')!.parentElement!).backgroundColor;
          const fill = getComputedStyle(t).fill;
          const a = lum(fill);
          const b = lum(fondo);
          return { texto: t.textContent ?? '', fill, ratio: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) };
        });
    });
}

async function elegirCuatroFormatos(page: Page): Promise<void> {
  // Estado inicial A4 + Carta; se añaden A3 y A5 para que salgan los cuatro colores del dibujo.
  for (const nombre of ['A3', 'A5']) {
    const chip = comparador(page).getByRole('button', { name: nombre, exact: true });
    await chip.click();
    await expect(chip).toHaveAttribute('aria-pressed', 'true');
  }
  await expect(comparador(page).locator('svg rect')).toHaveCount(4);
}

interface RotuloMedido {
  etiqueta: string;
  /** Tamaño en pantalla: font-size computado (unidades del viewBox) × escala de la CTM del SVG */
  px: number;
  /** WCAG 1.4.3: 3 si es texto grande (≥ 24 px, o ≥ 18,66 px en negrita); si no, 4,5 */
  umbral: number;
  ratio: number;
  tinta: string;
  fondo: string;
}

/**
 * Contraste POR PÍXEL de los rótulos A1…A5 del dibujo del doblado (hallazgo K, cabo C0862). Cada
 * rótulo va sobre su pieza teñida con alfa: leer el `fill` y el fondo del lienzo no basta, así que se
 * captura el SVG y, en la caja de cada rótulo, el fondo es el color más frecuente y la tinta, el píxel
 * de máximo contraste con él que aparezca al menos 6 veces (el interior del trazo). La captura se
 * analiza en una pestaña aparte en blanco, sin la CSP de la app.
 */
async function contrastesRotulosDoblado(page: Page): Promise<RotuloMedido[]> {
  const svg = page.locator('section[aria-labelledby="titulo-raiz"] svg');
  await svg.scrollIntoViewIfNeeded();
  const datos = await svg.evaluate((s) => {
    const escala = (s as SVGSVGElement).getScreenCTM()?.a ?? Number.NaN;
    const c = s.getBoundingClientRect();
    return {
      clip: { x: c.x, y: c.y, width: c.width, height: c.height },
      textos: Array.from(s.querySelectorAll('text')).map((t) => {
        const cs = getComputedStyle(t);
        const b = t.getBoundingClientRect();
        return {
          etiqueta: t.textContent ?? '',
          px: parseFloat(cs.fontSize) * escala,
          peso: Number(cs.fontWeight),
          caja: { x: b.x - c.x, y: b.y - c.y, ancho: b.width, alto: b.height },
        };
      }),
    };
  });
  const png = await page.screenshot({ clip: datos.clip });
  const analisis = await page.context().newPage();
  let pixeles: { ratio: number; tinta: string; fondo: string }[];
  try {
    pixeles = await analisis.evaluate(
      async ({ b64, anchoCss, cajas }) => {
        const img = new Image();
        img.src = `data:image/png;base64,${b64}`;
        await img.decode();
        const lienzo = document.createElement('canvas');
        lienzo.width = img.naturalWidth;
        lienzo.height = img.naturalHeight;
        const g = lienzo.getContext('2d')!;
        g.drawImage(img, 0, 0);
        const k = img.naturalWidth / anchoCss;
        const lin = (v: number): number => {
          const s = v / 255;
          return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
        };
        const lum = (c: number[]): number => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
        const contraste = (a: number[], b: number[]): number => {
          const x = lum(a);
          const y = lum(b);
          return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
        };
        return cajas.map((caja) => {
          const x0 = Math.max(0, Math.floor(caja.x * k));
          const y0 = Math.max(0, Math.floor(caja.y * k));
          const x1 = Math.min(lienzo.width, Math.ceil((caja.x + caja.ancho) * k));
          const y1 = Math.min(lienzo.height, Math.ceil((caja.y + caja.alto) * k));
          const d = g.getImageData(x0, y0, x1 - x0, y1 - y0).data;
          const cuenta = new Map<string, number>();
          for (let i = 0; i < d.length; i += 4) {
            const clave = `${d[i]},${d[i + 1]},${d[i + 2]}`;
            cuenta.set(clave, (cuenta.get(clave) ?? 0) + 1);
          }
          const orden = [...cuenta.entries()].sort((a, b) => b[1] - a[1]);
          const fondo = orden[0][0].split(',').map(Number);
          let tinta = fondo;
          let ratio = 1;
          for (const [clave, n] of orden) {
            if (n < 6) continue;
            const color = clave.split(',').map(Number);
            const r = contraste(color, fondo);
            if (r > ratio) {
              ratio = r;
              tinta = color;
            }
          }
          return { ratio, tinta: `rgb(${tinta.join(', ')})`, fondo: `rgb(${fondo.join(', ')})` };
        });
      },
      { b64: png.toString('base64'), anchoCss: datos.clip.width, cajas: datos.textos.map((t) => t.caja) },
    );
  } finally {
    await analisis.close();
  }
  return datos.textos.map((t, i) => ({
    etiqueta: t.etiqueta,
    px: t.px,
    umbral: t.px >= 24 || (t.px >= 18.66 && t.peso >= 700) ? 3 : 4.5,
    ...pixeles[i],
  }));
}

/** «A3: 1,83:1 < 3 (36,1 px; tinta … sobre …)» de cada rótulo que no llega a su umbral */
const rotulosPorDebajo = (medidas: RotuloMedido[], tema: string): string[] =>
  medidas
    .filter((m) => m.ratio < m.umbral)
    .map((m) => `${tema} ${m.etiqueta}: ${m.ratio.toFixed(2)}:1 < ${m.umbral} (${m.px.toFixed(1)} px; tinta ${m.tinta} sobre ${m.fondo})`);

test.describe('comparador-tamanos-papel — Inspector 20/11/2026', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['#valor-conversor', '#dpi-libre']);
  });

  // ── CASO 1 · normal ────────────────────────────────────────────────────────
  test('CASO 1 · serie A: de A0 (841 × 1189) a A10 (26 × 37) partiendo el lado largo hacia abajo', async ({ page }) => {
    // El contenedor con el que miran el texto los hallazgos C y H existe y es uno solo.
    await expect(contenedor(page)).toHaveCount(1);
    await expect(contenedor(page)).toContainText('La cuenta, paso a paso');
    await expect(catalogo(page).locator('caption')).toContainText('calculada a 300 DPI');
    const filas = await filasDe(page, /Serie A/);
    expect(filas).toEqual(SERIE_A);
  });

  test('CASO 1 · serie B: de B0 (1000 × 1414) a B10 (31 × 44)', async ({ page }) => {
    const filas = await filasDe(page, /Serie B/);
    expect(filas).toEqual(SERIE_B);
  });

  test('CASO 1 · serie C (sobres): C0 = 917 × 1297 por media geométrica, C4 229 × 324, DL 110 × 220', async ({ page }) => {
    const filas = porNombre(await filasDe(page, /Serie C/));
    for (const esperada of SERIE_C) expect(filas.get(esperada[0]), esperada[0]).toEqual(esperada);
    // Solo pueden sobrar C9 y C10 (hallazgo J), y con sus medidas por la misma regla.
    for (const [nombre, fila] of filas) {
      if (SERIE_C.some((e) => e[0] === nombre)) continue;
      expect(Object.keys(C9_C10), `fila inesperada ${nombre}`).toContain(nombre);
      expect(fila[1]).toBe(C9_C10[nombre]);
    }
  });

  test('CASO 1 · norteamericanos por la pulgada exacta: Carta 8,50 × 11,00 in = 2550 × 3300 px', async ({ page }) => {
    const filas = porNombre(await filasDe(page, /Norteamericanos/));
    expect(filas.size).toBe(NORTEAMERICA.length);
    for (const [nombre, mm, cm, pulgadas, px, superficie] of NORTEAMERICA) {
      const fila = filas.get(nombre);
      expect(fila, nombre).toBeDefined();
      expect(mm, `${nombre}: mm`).toContain(fila![1]);
      expect(fila![2], `${nombre}: cm`).toBe(cm);
      expect(fila![3], `${nombre}: pulgadas`).toBe(pulgadas);
      if (px) expect(fila![4], `${nombre}: px a 300 DPI`).toBe(px);
      expect(fila![5], `${nombre}: superficie`).toBe(superficie);
    }
  });

  test('CASO 1 · tradicionales y fotografía: conversiones de sus medidas nominales', async ({ page }) => {
    // Folio 215 × 315: 8,4646 × 12,4016 in → 2539 × 3720 px; 677,25 cm².
    const tradicionales = porNombre(await filasDe(page, /Tradicionales/));
    expect(tradicionales.get('Folio (tradicional)')).toEqual(
      ['Folio (tradicional)', '215 × 315', '21,5 × 31,5', '8,46 × 12,40', '2539 × 3720', '677 cm²'],
    );
    // Tarjeta EE. UU. 3,5 × 2 in = 88,9 × 50,8 mm → 1050 × 600 px; 45,16 cm².
    // Foto 10 × 15 cm: 3,937 × 5,906 in → 1181 × 1772 px.
    const fotos = porNombre(await filasDe(page, /Fotografía/));
    expect(fotos.get('Tarjeta de visita (EE. UU. y Latam)')?.slice(2)).toEqual(['8,9 × 5,1', '3,50 × 2,00', '1050 × 600', '45 cm²']);
    expect(fotos.get('Foto 10 × 15 cm')).toEqual(['Foto 10 × 15 cm', '100 × 150', '10,0 × 15,0', '3,94 × 5,91', '1181 × 1772', '150 cm²']);
  });

  test('CASO 1 · comparador inicial: Carta es 5,9 mm más ancho y 17,6 mm más bajo que A4, y no cabe', async ({ page }) => {
    const tabla = comparador(page).locator('table');
    await expect(tabla.locator('caption')).toContainText('A4 (210 × 297 mm)');
    const celdas = (await tabla.locator('tbody tr').first().locator('th, td').allTextContents()).map(normal);
    expect(celdas[0]).toBe('Carta (Letter)');
    // Al mm (lo de hoy) o con su decimal (hallazgo E): +5,9 / −17,6.
    expect(celdas[2]).toMatch(/^\+(6|5,9) mm$/);
    expect(celdas[3]).toMatch(/^−(18|17,6) mm$/);
    expect(celdas[4]).toBe('No, se sale');
    await expect(comparador(page).locator('svg')).toHaveAttribute('aria-label', /Carta \(Letter\) es (6|5,9) mm más ancho y (18|17,6) mm más corto que A4/);
    // A escala: razón alto/ancho de cada rectángulo = la del papel (297/210 y 279,4/215,9).
    const razones = await razonesDibujadas(page);
    expect(razones).toHaveLength(2);
    for (const r of razones) expect(r.razon, `${r.ancho} × ${r.alto}`).toBeCloseTo(r.alto / r.ancho, 2);
    expect(razones.map((r) => `${r.ancho} × ${r.alto}`).sort()).toEqual(['210 × 297', '215.9 × 279.4']);
  });

  test('CASO 1 · ¿Cabe en mi impresora?: Carta → A4, A4 → Carta y Legal → A4', async ({ page }) => {
    // Carta → A4 (estado inicial): sobran 0 × 25,24 mm; 91,5 %; al 100 % se pierden 5,9 mm de ancho.
    let r = await comprobar(page, 'carta', 'a4');
    expect(r.sobrante).toBe('0 × 25 mm');
    expect(r.aprovechamiento).toMatch(/^91,[45] %$/);
    expect(r.notaAprovechamiento).toContain('Las proporciones no coinciden');
    expect(r.recorte).toMatch(/^Se pierden (6|5,9) mm de ancho y 0 mm de alto$/);
    // A4 → Carta: 94,07 %; sobran 18,34 × 0; al 100 % se pierden 17,6 mm de alto.
    r = await comprobar(page, 'a4', 'carta');
    expect(r.sobrante).toMatch(/^1[89] × 0 mm$/);
    expect(r.recorte).toMatch(/^Se pierden 0 mm de ancho y (18|17,6) mm de alto$/);
    // Legal → A4: 297/355,6 = 83,52 % (redondeo y truncado coinciden); sobran 29,68 × 0. El
    // aprovechamiento, a la escala que se MUESTRA y se recomienda (83,5 %, hallazgos 5343 y 5346):
    // 215,9 × 0,835 = 180,28 por 355,6 × 0,835 = 296,93 → 53.530/62.370 = 85,83 % («85,8 %»). Antes
    // se calculaba con el factor exacto sin redondear (85,87 %), que no es el que se imprime.
    r = await comprobar(page, 'oficio-legal', 'a4');
    expect(r.escala).toBe('83,5 %');
    expect(r.notaEscala).toBe('Reduce al 83,5 % para que entre completo.');
    expect(r.sobrante).toBe('30 × 0 mm');
    expect(r.aprovechamiento).toBe('85,8 %');
    expect(r.recorte).toMatch(/^Se pierden (6|5,9) mm de ancho y (59|58,6) mm de alto$/);
    // A3 → A4: misma proporción √2; 210/297 = 70,71 %.
    r = await comprobar(page, 'a3', 'a4');
    expect(r.escala).toBe('70,7 %');
    expect(r.notaAprovechamiento).toBe('Ambos formatos comparten proporción: el ajuste es perfecto.');
    expect(r.recorte).toBe('Se pierden 87 mm de ancho y 123 mm de alto');
  });

  test('CASO 1 · conversor: 210 mm, «21,5» cm, «8,5» in y «1.500» px a 300 DPI', async ({ page }) => {
    // Estado inicial: 210 mm → 21,00 cm; 210/25,4 = 8,2677 in; × 300 = 2480,3 px (72 DPI: 595,3).
    await expect.poll(() => leerConversor(page)).toEqual(['210,00 mm', '21,00 cm', '8,268 in', '2480 px']);
    await expect(conversor(page)).toContainText('A 72 DPI serían 595 px y a 300 DPI, 2480 px.');
    // «21,5» cm con coma = 215 mm → 8,4646 in → 2539,4 px.
    await convertir(page, '21,5', 'cm');
    await expect.poll(() => leerConversor(page)).toEqual(['215,00 mm', '21,50 cm', '8,465 in', '2539 px']);
    // «8,5» in = 215,9 mm exactos → 2550 px.
    await convertir(page, '8,5', 'in');
    await expect.poll(() => leerConversor(page)).toEqual(['215,90 mm', '21,59 cm', '8,500 in', '2550 px']);
    // «1.500» px = mil quinientos: 1500/300 = 5 in = 127 mm (72 DPI: 360 px).
    await convertir(page, '1.500', 'px');
    await expect.poll(() => leerConversor(page)).toEqual(['127,00 mm', '12,70 cm', '5,000 in', '1500 px']);
    await expect(conversor(page)).toContainText('A 72 DPI serían 360 px y a 300 DPI, 1500 px.');
  });

  test('CASO 1 · DPI libre 240: el A4 pasa a 1984 × 2806 px', async ({ page }) => {
    // 210/25,4 × 240 = 1984,25; 297/25,4 × 240 = 2806,30.
    await aplicarDpi(page, '240');
    await expect(catalogo(page).locator('caption')).toContainText('calculada a 240 DPI');
    const filas = porNombre(await filasDe(page, /Serie A/));
    expect(filas.get('A4')?.[4]).toBe('1984 × 2806');
    await expect(page.locator('#dpi-conversor')).toHaveValue('240');
  });

  // ── CASO 2 · límite ────────────────────────────────────────────────────────
  test('CASO 2 · comprobador en los extremos: A4 → A4, A0 → A10 y A5 → A4 (cabe)', async ({ page }) => {
    let r = await comprobar(page, 'a4', 'a4');
    expect(r).toEqual({
      escala: '100,0 %',
      notaEscala: 'Cabe al 100 %: imprime a tamaño real sin reducir.',
      sobrante: '0 × 0 mm',
      aprovechamiento: '100,0 %',
      notaAprovechamiento: 'Ambos formatos comparten proporción: el ajuste es perfecto.',
      recorte: 'No se corta nada',
    });
    // A0 → A10: 26/841 = 3,09 %; al 100 % se pierden 841 − 26 = 815 y 1189 − 37 = 1152 mm.
    r = await comprobar(page, 'a0', 'a10');
    expect(r.notaEscala).toMatch(/^Reduce al 3,[01] % para que entre completo\.$/);
    expect(r.recorte).toBe('Se pierden 815 mm de ancho y 1152 mm de alto');
    // A5 → A4: cabe sin reducir.
    r = await comprobar(page, 'a5', 'a4');
    expect(r.escala).toBe('100,0 %');
    expect(r.notaEscala).toBe('Cabe al 100 %: imprime a tamaño real sin reducir.');
    expect(r.recorte).toBe('No se corta nada');
  });

  // ── CASO 3 · rechazo ───────────────────────────────────────────────────────
  test('CASO 3 · el conversor no da cifras con 0, negativo, vacío, «abc», «12abc» ni «1e3»', async ({ page }) => {
    const aviso = conversor(page).getByRole('status');
    for (const valor of ['0', '-5', '', 'abc', '12abc', '1e3']) {
      await convertir(page, valor, 'mm');
      await expect(aviso, `«${valor}»`).toHaveText('Introduce un valor mayor que cero para ver la conversión.');
      expect(await leerConversor(page), `«${valor}»`).toEqual([]);
    }
  });

  test('CASO 3 · «1,234.5» con los dos separadores: manda el último (1234,50 mm)', async ({ page }) => {
    // parseSpanishNumber: con punto y coma, el último es el decimal → 1234,5 mm = 48,602 in = 14.581 px.
    await convertir(page, '1,234.5', 'mm');
    await expect.poll(() => leerConversor(page)).toEqual(['1234,50 mm', '123,45 cm', '48,602 in', '14.581 px']);
  });

  test('CASO 3 · DPI libre: «1.200» son mil doscientos y «5» (fuera de 10-4800) no se aplica', async ({ page }) => {
    // 210/25,4 × 1200 = 9921,26; 297/25,4 × 1200 = 14.031,50.
    await aplicarDpi(page, '1.200');
    await expect(catalogo(page).locator('caption')).toContainText('calculada a 1200 DPI');
    expect(porNombre(await filasDe(page, /Serie A/)).get('A4')?.[4]).toBe('9921 × 14.031');
    await aplicarDpi(page, '5');
    await expect(catalogo(page).locator('caption')).toContainText('calculada a 1200 DPI');
  });

  // ── Hallazgos abiertos ─────────────────────────────────────────────────────
  test('HALLAZGO (20/11/2026, REPARADO 21/11/2026) · A · «cabe al 100 %», pero sobrante y aprovechamiento son los de ampliar', async ({ page }) => {
    // A5 (148 × 210) en A4 (210 × 297): la app recomienda 100 % («imprime a tamaño real») y calcula
    // las otras dos tarjetas con el factor de AMPLIAR, min(210/148; 297/210) = 141,4 %: «1 × 0 mm» y
    // «99,7 %». Impreso al 100 % sobran 210 − 148 = 62 y 297 − 210 = 87 mm, y se usa
    // 31 080/62 370 = 49,8 % de la hoja.
    const r = await comprobar(page, 'a5', 'a4');
    expect(r.sobrante).toBe('62 × 87 mm');
    expect(r.aprovechamiento).toBe('49,8 %');
  });

  test('HALLAZGO (20/11/2026, REPARADO 21/11/2026) · B · claro: las cotas del dibujo llegan a 4,5:1', async ({ page }) => {
    // Rellenos fijos (COLORES) sobre el lienzo #FAFAFA: #2E86AB 3,93 · #48A9A6 2,68 · #7FB3D3 2,17.
    // Las cotas pintan a ~14 px en escritorio (11 px de caja en móvil): texto normal, umbral 4,5.
    await esperarPaginaAsentada(page);
    await prepararParaMedir(page);
    await elegirCuatroFormatos(page);
    const medidas = await contrastesCotas(page);
    expect(medidas.length).toBe(8);
    for (const m of medidas) expect(m.ratio, `${m.texto} en ${m.fill}`).toBeGreaterThanOrEqual(4.5);
  });

  test('HALLAZGO (20/11/2026, REPARADO 21/11/2026) · B · oscuro: las cotas del dibujo llegan a 4,5:1', async ({ page }) => {
    // En oscuro el lienzo es #1A1A1A: #2E86AB da 4,24:1 y el cuarto color, #1a5278 (el azul del
    // hero), 2,09:1. Sin transiciones: medido a mitad del cambio de tema salía 1,30:1.
    await esperarPaginaAsentada(page);
    await prepararParaMedir(page);
    await activarTemaOscuro(page);
    await elegirCuatroFormatos(page);
    const medidas = await contrastesCotas(page);
    expect(medidas.length).toBe(8);
    for (const m of medidas) expect(m.ratio, `${m.texto} en ${m.fill}`).toBeGreaterThanOrEqual(4.5);
  });

  test('HALLAZGO (20/11/2026, REPARADO 21/11/2026) · C · el FAQPage da 97 % para imprimir un A4 en Carta', async ({ page }) => {
    // «un A4 impreso en Carta se corta 18 mm por abajo salvo que se reduzca la escala al 97 %»: a 97 %
    // el A4 mide 297 × 0,97 = 288,1 mm y la Carta 279,4: siguen cortándose 8,7 mm. Lo que hace falta
    // es 279,4/297 = 94,07 %, lo que da el propio comprobador («94,1 %»).
    const faq = await ldDeTipo(page, 'FAQPage');
    const preguntas = faq.mainEntity as { name: string; acceptedAnswer: { text: string } }[];
    const texto = preguntas.find((p) => p.name.includes('Carta y el A4'))!.acceptedAnswer.text;
    expect(texto).not.toMatch(/escala al 97/);
    expect(texto).toMatch(/94(,\d)?\s?%/);
  });

  test('HALLAZGO (20/11/2026, REPARADO 21/11/2026) · C · la guía y el escenario dan otras escalas que el comprobador', async ({ page }) => {
    // Guía: «De Carta a A4 es 97,2 %; de A4 a Carta, 94,3 %». A4 → Carta es 279,4/297 = 94,07 %; a
    // 94,3 % el A4 mide 280,1 mm y se corta 0,7. Y el escenario «Un PDF mexicano…»: «hay que reducir
    // al 97,2 %. A cambio quedan 18 mm libres abajo»: tras reducir quedan 297 − 279,4 × 0,9727 = 25,2
    // mm (el comprobador: «0 × 25 mm»); 17,6 mm es lo que sobra SIN reducir.
    const cartaA4 = (await comprobar(page, 'carta', 'a4')).escala;
    const a4Carta = (await comprobar(page, 'a4', 'carta')).escala;
    await page.getByRole('button', { name: /Ver guía educativa/ }).click();
    const guia = page.locator('li').filter({ hasText: 'Calcula la escala necesaria' });
    await expect(guia).toContainText(`De Carta a A4 es ${cartaA4}; de A4 a Carta, ${a4Carta}`);
    await expect(contenedor(page)).not.toContainText('A cambio quedan 18 mm libres abajo');
  });

  test('HALLAZGO (20/11/2026, REPARADO 21/11/2026) · D · la escala mostrada hace que el documento entre', async ({ page }) => {
    // La escala se redondea al décimo más cercano: Carta → A4 97,267 % → «97,3 %», y 215,9 × 0,973 =
    // 210,07 mm > 210; A4 → Carta 94,074 % → «94,1 %», 297 × 0,941 = 279,48 > 279,4; A0 → A10
    // 3,0916 % → «3,1 %», 841 × 0,031 = 26,07 > 26. «Para que entre completo» pide redondear hacia
    // abajo (97,2 %, 94,0 %, 3,0 %), que es lo que ya escribe el texto de la página para el Carta.
    const casos: [string, string, [number, number], [number, number]][] = [
      ['carta', 'a4', [215.9, 279.4], [210, 297]],
      ['a4', 'carta', [210, 297], [215.9, 279.4]],
      ['a0', 'a10', [841, 1189], [26, 37]],
    ];
    for (const [o, d, [ow, oh], [dw, dh]] of casos) {
      const s = aNumero((await comprobar(page, o, d)).escala.replace(' %', '')) / 100;
      expect(ow * s, `${o} → ${d}: ancho a ${s * 100} %`).toBeLessThanOrEqual(dw + 1e-9);
      expect(oh * s, `${o} → ${d}: alto a ${s * 100} %`).toBeLessThanOrEqual(dh + 1e-9);
    }
  });

  test('HALLAZGO (20/11/2026, REPARADO 21/11/2026) · E · Ejecutivo 7,25 in = 184,15 mm: 2175 px a 300 DPI; «exactas» sin redondear al mm', async ({ page }) => {
    // FORMATOS guarda ancho 184.1: 184,1/25,4 × 300 = 2174,4 → «2174»; 7,25 × 300 = 2175 exactos (a
    // 600 DPI, 4349 por 4350). Y la tabla «Medidas exactas» da la Carta como «216 × 279» cuando por
    // definición mide 215,9 × 279,4 (Δ con A4: 5,9 y 17,6 mm, no 6 y 18).
    const filas = porNombre(await filasDe(page, /Norteamericanos/));
    expect(filas.get('Ejecutivo (Executive)')?.[4]).toBe('2175 × 3150');
    const leyenda = normal(await catalogo(page).locator('caption').textContent());
    expect(filas.get('Carta (Letter)')?.[1] === '215,9 × 279,4' || !/exactas/i.test(leyenda)).toBe(true);
  });

  test('HALLAZGO (20/11/2026, REPARADO 21/11/2026) · F · una tarjeta de visita (85 × 55) cabe girada en un A7', async ({ page }) => {
    // Las dos tarjetas son los únicos formatos guardados apaisados y ni el comprobador ni «¿Encaja
    // dentro?» giran: en A7 (74 × 105) la app dice «Reduce al 87,1 %» y «Se pierden 11 mm de ancho»;
    // girada, 55 × 85 entra en 74 × 105 al 100 %.
    const r = await comprobar(page, 'tarjeta-es', 'a7');
    expect(r.escala).toBe('100,0 %');
    expect(r.recorte).toBe('No se corta nada');
  });

  test('HALLAZGO (20/11/2026, REPARADO 21/11/2026) · G · un DPI fuera de 10-4800 avisa en vez de descartarse callado', async ({ page }) => {
    // «5» + Aplicar: la leyenda sigue en 300 DPI, el campo sigue diciendo 5 y no hay ningún aviso.
    await aplicarDpi(page, '5');
    await expect(catalogo(page).locator('caption')).toContainText('calculada a 300 DPI');
    const invalido = await page.locator('#dpi-libre').getAttribute('aria-invalid');
    const mensaje = await catalogo(page).getByText(/entre 10 y 4\.?800/).count();
    expect(invalido === 'true' || mensaje > 0).toBe(true);
  });

  test('HALLAZGO (20/11/2026, REPARADO 21/11/2026) · H · cifras «exactas» que no lo son y la regla del sobre', async ({ page }) => {
    // «841 ÷ 594,5 = 1,4142»: 841/594,5 = 1,41463 (√2 = 1,41421 solo sin redondear a mm).
    // «hojas A4 de exactamente 5 gramos» / «de 5 g exactos»: 80 g/m² × 0,06237 m² = 4,99 g, y la
    // propia página dice antes «623,7 exactos por el redondeo a milímetros».
    // «El sobre lleva la misma letra y número que el papel más uno»: un A4 sin doblar va en C4 (otra
    // letra, mismo número), como dice la línea de debajo.
    await page.getByRole('button', { name: /Ver guía educativa/ }).click();
    const cuerpo = contenedor(page);
    await expect(cuerpo).toHaveCount(1);
    await expect(cuerpo).not.toContainText('841 ÷ 594,5 = 1,4142');
    await expect(cuerpo).not.toContainText(/exactamente 5 gramos|5 g exactos/);
    await expect(cuerpo).not.toContainText('la misma letra y número que el papel más uno');
  });

  test('HALLAZGO (20/11/2026, REPARADO 21/11/2026) · I · el «%» va con espacio duro, también en el JSON-LD', async ({ page }) => {
    // CLAUDE.md global §2: «15 %» con U+00A0. «97,3 %» de la escala lleva un espacio normal (U+0020)
    // y featureList dice «Funciona 100% en el navegador».
    const escala = (await (await tarjeta(page, 'Escala necesaria')).locator('strong').textContent()) ?? '';
    expect(escala).toMatch(/\d %$/);
    const app = await ldDeTipo(page, 'WebApplication');
    for (const f of ((app.featureList ?? app.features ?? []) as string[])) expect(f).not.toMatch(/\d%/);
  });

  test('HALLAZGO (20/11/2026, REPARADO 21/11/2026) · J · el JSON-LD atribuye la serie C a la ISO 216 y promete un catálogo completo', async ({ page }) => {
    // La serie C (sobres) es de la ISO 269; la propia página la etiqueta «Serie C (sobres)» y deja
    // «(ISO 216)» para A y B. Y «Catálogo completo de series A, B y C»: A y B llegan a 10, la C se
    // para en C8 (por la misma regla, C9 = 40 × 57 y C10 = 28 × 40).
    const app = await ldDeTipo(page, 'WebApplication');
    const texto = JSON.stringify([app.description, app.featureList ?? app.features]);
    expect(texto).not.toMatch(/A, B y C \(ISO 216\)|A, B y C de la norma ISO 216/);
    const filas = porNombre(await filasDe(page, /Serie C/));
    expect(!/completo/i.test(texto) || filas.has('C10')).toBe(true);
  });

  test('HALLAZGO 5377 (21/11/2026, cabo C0862, REPARADO) · K · claro: los rótulos A1…A5 del doblado llegan a su umbral', async ({ page }) => {
    // 1280 × 720, lienzo #FAFAFA. Calculado a mano (cabecera): A2 #48A9A6 sobre su pieza al 19 %,
    // 2,26:1 (51,0 px, umbral 3) · A3 #7FB3D3 al 24 %, 1,83:1 (36,1 px, umbral 3) · A5 #2E86AB al
    // 34 %, 2,60:1 (18,0 px en negrita, por debajo de 18,66: umbral 4,5; en una ventana de 745 px de
    // alto o más pasa a 3, y tampoco llega). A1 3,34 (72,1 px) y A4 4,92 (25,5 px) sí llegan a 3.
    await esperarPaginaAsentada(page);
    await prepararParaMedir(page);
    const medidas = await contrastesRotulosDoblado(page);
    expect(medidas.map((m) => m.etiqueta)).toEqual(['A1', 'A2', 'A3', 'A4', 'A5']);
    expect(rotulosPorDebajo(medidas, 'claro')).toEqual([]);
  });

  test('HALLAZGO 5377 (21/11/2026, cabo C0862, REPARADO) · K · oscuro: los rótulos A1…A5 del doblado llegan a su umbral', async ({ page }) => {
    // 1280 × 720, lienzo #1A1A1A, los mismos rellenos fijos: A4 #1a5278 (el azul del hero) sobre su
    // pieza al 29 %, 1,76:1 (25,5 px, umbral 3) · A5 #2E86AB al 34 %, 2,73:1 (18,0 px, umbral 4,5).
    // A1 3,63 · A2 4,59 · A3 4,81 sí llegan a 3.
    await esperarPaginaAsentada(page);
    await prepararParaMedir(page);
    await activarTemaOscuro(page);
    const medidas = await contrastesRotulosDoblado(page);
    expect(medidas.map((m) => m.etiqueta)).toEqual(['A1', 'A2', 'A3', 'A4', 'A5']);
    expect(rotulosPorDebajo(medidas, 'oscuro')).toEqual([]);
  });
});

test.describe('comparador-tamanos-papel — móvil (Pixel 7)', () => {
  test.use({
    viewport: PIXEL_7.viewport,
    userAgent: PIXEL_7.userAgent,
    deviceScaleFactor: PIXEL_7.deviceScaleFactor,
    isMobile: PIXEL_7.isMobile,
    hasTouch: PIXEL_7.hasTouch,
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['#valor-conversor']);
    await esperarPaginaAsentada(page);
  });

  async function dibujoEntero(page: Page): Promise<void> {
    const svg = await comparador(page).locator('svg').boundingBox();
    expect(svg).not.toBeNull();
    const ancho = await page.evaluate(() => window.innerWidth);
    expect(svg!.x).toBeGreaterThanOrEqual(0);
    expect(svg!.x + svg!.width).toBeLessThanOrEqual(ancho);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(ancho);
    // Ningún rótulo ni cota se sale del lienzo.
    const cajas = await comparador(page).locator('svg text').evaluateAll((ts) =>
      ts.map((t) => {
        const b = t.getBoundingClientRect();
        return { texto: t.textContent ?? '', left: b.left, right: b.right, bottom: b.bottom };
      }),
    );
    for (const c of cajas) {
      expect(c.left, c.texto).toBeGreaterThanOrEqual(svg!.x - 0.5);
      expect(c.right, c.texto).toBeLessThanOrEqual(svg!.x + svg!.width + 0.5);
      expect(c.bottom, c.texto).toBeLessThanOrEqual(svg!.y + svg!.height + 0.5);
    }
  }

  test('CASO 2 · el dibujo A4 + Carta cabe en 412 px y guarda la proporción de cada papel', async ({ page }) => {
    await dibujoEntero(page);
    const razones = await razonesDibujadas(page);
    expect(razones).toHaveLength(2);
    // 297/210 = 1,4143 · 279,4/215,9 = 1,2941
    for (const r of razones) expect(r.razon, `${r.ancho} × ${r.alto}`).toBeCloseTo(r.alto / r.ancho, 2);
  });

  test('CASO 2 · con cuatro formatos (A3 y Legal añadidos) sigue entero y a escala', async ({ page }) => {
    for (const nombre of ['A3', 'Oficio / Legal (EE. UU.)']) {
      const chip = comparador(page).getByRole('button', { name: nombre, exact: true });
      await chip.click();
      await expect(chip).toHaveAttribute('aria-pressed', 'true');
    }
    await expect(comparador(page).locator('svg rect')).toHaveCount(4);
    await dibujoEntero(page);
    // 420/297 = 1,4141 · 355,6/215,9 = 1,6471 · y los dos de antes
    const razones = await razonesDibujadas(page);
    for (const r of razones) expect(r.razon, `${r.ancho} × ${r.alto}`).toBeCloseTo(r.alto / r.ancho, 2);
    expect(razones.map((r) => r.ancho).sort((a, b) => a - b)).toEqual([210, 215.9, 215.9, 297]);
  });

  test('HALLAZGO 5377 (21/11/2026, cabo C0862, REPARADO) · K · Pixel 7: los rótulos del doblado llegan a su umbral en los dos temas', async ({ page }) => {
    // Lienzo de 312 px (escala 312/1201): A1 48,3 · A2 34,1 · A3 24,1 · A4 17,1 · A5 12,1 px, así que
    // A4 y A5 ya no son texto grande y piden 4,5:1. Calculado a mano (cabecera): en claro A2 2,26 ·
    // A3 1,83 · A5 2,60 (A4 4,92 sí llega a 4,5); en oscuro A4 1,76 · A5 2,73.
    await prepararParaMedir(page);
    const claro = await contrastesRotulosDoblado(page);
    await activarTemaOscuro(page);
    const oscuro = await contrastesRotulosDoblado(page);
    expect(claro.map((m) => m.etiqueta)).toEqual(['A1', 'A2', 'A3', 'A4', 'A5']);
    expect([...rotulosPorDebajo(claro, 'claro'), ...rotulosPorDebajo(oscuro, 'oscuro')]).toEqual([]);
  });
});
