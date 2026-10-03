import { test, expect, devices, Locator, Page } from '@playwright/test';
import { esperarPaginaAsentada, esperarValorEnReact } from './_hidratacion';
import { activarTema } from '../contraste-text-muted-auxiliares';
import { calcular, escalaNotarial, escalaProcura, type Entrada } from '../../app/estimador-costes-divorcio/motor';
import { PREGUNTAS_FRECUENTES } from '../../app/estimador-costes-divorcio/faq';
import { faqJsonLd } from '../../app/estimador-costes-divorcio/metadata';

/**
 * Inspector — estimador-costes-divorcio (segmento FISCAL/LEGAL, RIESGO 1 CRÍTICO)
 * Primera inspección: 31/08/2026 · Re-inspección: 03/10/2026 · Reparación: 03/10/2026.
 *
 * Qué promete la app
 * ──────────────────
 *   <h1>  «Estimador de Costes de Divorcio en España 2026»
 *   sub.  «Cuánto cuesta divorciarse en España: honorarios del abogado y arancel del procurador
 *          y del notario según el tipo de procedimiento (mutuo acuerdo vs contencioso), hijos y
 *          bienes comunes»
 *
 *   El cálculo vive en `app/estimador-costes-divorcio/motor.ts` (desde el 03/10/2026; antes era
 *   un `calcular()` dentro de page.tsx con partidas fijas escritas a mano). Las FAQ visibles y el
 *   FAQPage salen de UNA lista, `faq.ts`, con las cifras del motor. Entrada: tres grupos de
 *   botones (tipo × hijos × complejidad) y tres campos numéricos: valor de los bienes (si los
 *   hay), pensiones al mes (opcional, solo vía judicial) y presupuesto del abogado (opcional).
 *
 * Nota de formato: `formatCurrency` usa es-ES con `useGrouping:'auto'`, que NO agrupa los
 * millares de un número de cuatro cifras («1450,00 €») y SÍ los de cinco o más («12.800,00 €»),
 * como manda la Ortografía de la RAE. Se codifica tal cual en las cadenas esperadas.
 *
 * FUENTES de los valores esperados (leídas en el BOE el 03/10/2026, no de memoria)
 * ──────────────────────────────────────────────────────────────────────────
 *   · RD 434/2024, arancel de la Procura (BOE-A-2024-8706): arancel de MÁXIMOS; art. 3 (351,00 €,
 *     SUPLETORIO), art. 6.1 (un procurador para varios: una cuenta + 10 % como máximo por cada
 *     representado) y art. 22, concepto especial de los procesos matrimoniales:
 *       22.1.a mutuo acuerdo: 70,21 € · 22.3.a contencioso: 100,31 € por procurador ·
 *       22.2 medidas provisionales: 70,21 € · 22.1.b/22.3.b alimentos o compensatoria: escala
 *       del art. 2 sobre una anualidad · 22.1.c liquidación en el mutuo acuerdo: 25 % de la
 *       escala · 22.3.c disolución de gananciales: 25 % · 22.3.d liquidación: 50 %.
 *     En `data/fiscal/costas-judiciales.ts` (ARANCEL_PROCURA_FAMILIA, ARANCEL_PROCURA_ESCALA).
 *   · RD 1426/1989, arancel notarial (BOE-A-1989-28111): nº 1.1.h (documento sin cuantía,
 *     30,050605 €), nº 2.1 (escala sobre el valor, «rebaja del 5 por 100») y norma general 4.ª.3
 *     (en la liquidación de la sociedad conyugal, la escala se aplica A CADA INTERESADO por lo
 *     que se le adjudica). Escala en `data/itp-ccaa.ts` (ARANCELES_NOTARIO).
 *   · Ley 20/2011 del Registro Civil (BOE-A-2011-12628): art. 61 (el notario o el letrado de la
 *     Administración de Justicia remiten la escritura o la sentencia y la Oficina inscribe de
 *     inmediato); la ley no fija tasa ni arancel alguno.
 *   · Código Civil arts. 81, 82 y 87 (redacción de la Ley 8/2021): el notarial queda vedado
 *     con «hijos menores no emancipados o hijos mayores respecto de los que se hayan
 *     establecido judicialmente medidas de apoyo atribuidas a sus progenitores».
 *   · Ley 1/1996 de asistencia jurídica gratuita, art. 3.1 (2 / 2,5 / 3 veces el IPREM) y 3.3
 *     (valoración individual con intereses contrapuestos). IPREM en `data/fiscal/iprem.ts`.
 *   · Ley 10/2012 art. 4.2.a: personas físicas exentas de tasas (TASAS_JUDICIALES, data/fiscal).
 *   · IVA general 21 % (PORCENTAJES_IVA.general, data/fiscal/iva.ts).
 *   Los honorarios de ABOGADO no tienen tarifa: son libres (cabecera de costas-judiciales.ts).
 *
 * CASOS (resueltos a mano ANTES de ejecutar la app)
 * ─────────────────────────────────────────────────
 *   CASO 1 (normal) — mutuo acuerdo judicial · sin hijos · sin bienes ni pensiones:
 *       procurador 70,21 × 1,20 (art. 6.1) = 84,252 € → con IVA 101,94492 → 101,94 €.
 *       Abogado 500–1.200 (supuesto de la herramienta) → total 601,94 € – 1301,94 €, 2–4 meses.
 *
 *   CASO 2 (límite, el más caro) — contencioso · con hijos · bienes complejos de 300.000 €:
 *       escala art. 2 (≤ 300.000) = 1.472,62 €; 22.3.c + 22.3.d = 75 % → 1.104,465 €.
 *       100,31 + 70,21 + 1.104,465 = 1.274,985 € → con IVA 1.542,73185 → 1542,73 € por cónyuge.
 *       Abogado 4.000–12.000 → 5542,73 € – 13.542,73 € por cónyuge, 6–18 meses.
 *
 *   CASO 3 (combinación imposible + notario con bienes) — el notarial no admite hijos menores
 *       no emancipados: al elegirlo desaparece la pregunta y `hijos` vuelve a false. Notarial con
 *       una vivienda de 150.000 € a partes iguales (75.000 € a cada uno):
 *       escala nº 2 = 90,15 + 24.040,49 × 4,5 ‰ (108,182205) + 30.050,60 × 1,5 ‰ (45,0759)
 *       + 14.898,79 × 1 ‰ (14,89879) = 258,306895 € → × 0,95 = 245,39155 € por cónyuge;
 *       × 2 = 490,7831 €; + 30,050605 € de la escritura de divorcio (nº 1.1.h) = 520,833705 €
 *       → con IVA 630,2087831 → 630,21 €. (El acta daba 490,79 € con la base 90,151816 del BOE;
 *       data/itp-ccaa.ts la redondea a 90,15: 0,3 céntimos.) Abogado 700–1.500 →
 *       1330,21 € – 2130,21 €.
 *
 *   CASO 4 (pensiones) — mutuo acuerdo judicial · con hijos · bienes simples 150.000 € ·
 *       pensión 400 €/mes: anualidad 4.800 € → escala 187,42 €; liquidación 25 % × 1.294,12 €
 *       (≤ 180.000) = 323,53 €; (70,21 + 187,42 + 323,53) × 1,20 = 697,392 € → con IVA
 *       843,84432 → 843,84 €.
 *
 *   CONTENCIOSO sin hijos ni bienes, por cónyuge: 100,31 + 70,21 = 170,52 € → 206,3292 → 206,33 €.
 *   NOTARIAL sin bienes: 30,050605 € → con IVA 36,3612 → 36,36 €.
 *
 *   JUSTICIA GRATUITA — persona que se divorcia, con 10.000 € brutos al año: supera 1 × IPREM
 *       (7.200 € en 12 pagas, 8.400 € en 14) y queda bajo 2 × IPREM (14.400 / 16.800 €), que es
 *       el umbral del art. 3.1.a: puede tener derecho.
 *
 * ── Reparado 02/09/2026 (hallazgos 571 y 572) ──────────────────────────────────────────
 *   571 — La «Comparativa rápida» daba cifras que el motor no podía producir. Desde el
 *       03/10/2026 la comparativa se calcula con el motor y los datos del usuario: su test exige
 *       que cada tarjeta valga lo que da elegir ese tipo con los mismos datos.
 *   572 — DataReference con data/fiscal y la exención de tasas (Ley 10/2012 art. 4.2.a).
 *
 * ── Reparado 03/10/2026 (hallazgos 2792-2802) ──────────────────────────────────────────
 *   2792 procurador por encima del arancel · 2793 DataReference con el art. 3 en vez del 22 ·
 *   2794 «Registro Civil 50 €» · 2795 notario fijo con bienes · 2796 honorarios de abogado sin
 *   decir que son libres · 2797 requisito del notarial · 2798 justicia gratuita sin el múltiplo
 *   del IPREM · 2799 duraciones de las FAQ/JSON-LD · 2800 emojis sin aria-hidden · 2801 grupos
 *   sin nombre accesible · 2802 contraste en los dos temas.
 */

const RUTA = '/estimador-costes-divorcio/';
const COMPLEJIDADES = ['Sin bienes comunes', 'Bienes simples', 'Bienes complejos'] as const;

/** `formatCurrency` separa la cifra del € con un espacio duro (U+00A0): se normaliza. */
const ESPACIO_DURO = new RegExp(String.fromCharCode(160), 'g');
const limpiar = (s: string) => s.replace(ESPACIO_DURO, ' ').replace(/\s+/g, ' ').trim();

/**
 * Importes «1234,56 €» / «12.345,67 €» de un texto, en CÉNTIMOS y en orden. Sin parseFloat: son
 * cifras que pinta la propia app con `formatCurrency`, no entrada de usuario.
 */
function importesEnCentimos(texto: string): number[] {
  const salida: number[] = [];
  for (const m of limpiar(texto).matchAll(/(\d{1,3}(?:\.\d{3})+|\d+),(\d{2}) €/g)) {
    salida.push(Number(m[1].split('.').join('')) * 100 + Number(m[2]));
  }
  return salida;
}

/** Una partida o un total como horquilla [mín, máx] en céntimos: «No necesario» → [0, 0]. */
function horquilla(texto: string): [number, number] {
  const c = importesEnCentimos(texto);
  if (c.length === 0) return [0, 0];
  if (c.length === 1) return [c[0], c[0]];
  if (c.length === 2) return [c[0], c[1]];
  throw new Error(`Más de dos importes en «${texto}»`);
}

const enCentimos = (r: { min: number; max: number }): [number, number] => [Math.round(r.min * 100), Math.round(r.max * 100)];

async function elegirTipo(page: Page, etiqueta: string): Promise<void> {
  await page.getByRole('button', { name: etiqueta }).click();
}

async function elegirHijos(page: Page, si: boolean): Promise<void> {
  await page.getByRole('button', { name: si ? 'Sí' : 'No', exact: true }).click();
}

async function elegirComplejidad(page: Page, etiqueta: string): Promise<void> {
  await page.getByRole('button', { name: etiqueta }).click();
}

const campoValor = (page: Page) => page.getByRole('textbox', { name: /Valor de los bienes comunes/ });
const campoPension = (page: Page) => page.getByRole('textbox', { name: /Pensiones que se fijan/ });
const campoPresupuesto = (page: Page) => page.getByRole('textbox', { name: /Presupuesto de tu abogado/ });

/** Escribe en un campo con `fill()` y espera a que el estado de React lo tenga (_hidratacion.ts). */
async function escribir(page: Page, campo: Locator, valor: string): Promise<void> {
  await campo.fill(valor);
  await esperarValorEnReact(page, campo, valor);
}

async function estimar(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Estimar costes' }).click();
}

async function hayResultado(page: Page): Promise<boolean> {
  return (await page.locator('[class*="totalImporte"]').count()) > 0;
}

/** «Coste total estimado[ (por cónyuge)]» — la horquilla que preside la tarjeta de resultados. */
async function totalEstimado(page: Page): Promise<string> {
  return limpiar(await page.locator('[class*="totalImporte"]').innerText());
}

async function etiquetaTotal(page: Page): Promise<string> {
  return limpiar(await page.locator('[class*="totalLabel"]').innerText());
}

/**
 * Importe de una fila del desglose («Abogado», «Procurador», «Notario», «Tasas judiciales»).
 * No se ancla `nombre` al inicio: cada fila empieza con un emoji decorativo (`aria-hidden`,
 * pero SIGUE en el texto visible) antes del nombre de la partida.
 */
async function partida(page: Page, nombre: RegExp): Promise<string> {
  const fila = page.locator('[class*="desgloseItem"]', { hasText: nombre });
  return limpiar(await fila.locator('strong').innerText());
}

/** Suma de todas las filas del desglose, como horquilla en céntimos. */
async function sumaDelDesglose(page: Page): Promise<[number, number]> {
  const importes = await page.locator('[class*="desgloseItem"] strong').allInnerTexts();
  return importes.map(horquilla).reduce<[number, number]>((s, h) => [s[0] + h[0], s[1] + h[1]], [0, 0]);
}

async function duracion(page: Page): Promise<string> {
  return limpiar(await page.locator('[class*="duracion"]').innerText());
}

/**
 * Notas del resultado, acotadas al `notasCard` de la tarjeta de resultados: un selector
 * `[class*="nota"]` sobre toda la página también atrapa el `<DataReference>` (su nota
 * normativa usa `styles.nota`), que no es una nota del cálculo.
 */
async function notas(page: Page): Promise<string[]> {
  const parrafos = page.locator('[class*="notasCard"] [class*="nota"]');
  const salida: string[] = [];
  for (let i = 0; i < (await parrafos.count()); i++) {
    // Quita el emoji ℹ️ decorativo del principio.
    salida.push(limpiar(await parrafos.nth(i).innerText()).replace(/^ℹ️\s*/, '').trim());
  }
  return salida;
}

/** Todo el texto de la página, también lo plegado en <EducationalSection>, sin los <script>. */
async function textoDeLaPagina(page: Page): Promise<string> {
  return page.evaluate(() => {
    const recorrido = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const partes: string[] = [];
    while (recorrido.nextNode()) {
      const padre = recorrido.currentNode.parentElement;
      if (padre && (padre.tagName === 'SCRIPT' || padre.tagName === 'STYLE')) continue;
      partes.push(recorrido.currentNode.textContent ?? '');
    }
    return partes.join(' ').replace(/\s+/g, ' ');
  });
}

/** El texto de los JSON-LD (WebApplication + FAQPage) que lee un buscador o una IA. */
async function textoJsonLd(page: Page): Promise<string> {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
      .map((s) => s.textContent ?? '')
      .join(' '),
  );
}

/**
 * Contraste del texto de un elemento contra su fondo efectivo (capas semitransparentes de los
 * ancestros, y la opacidad del propio elemento). Con un degradado devuelve el PEOR de sus
 * extremos, que es donde el texto se lee peor.
 */
async function contrasteMinimo(objetivo: Locator): Promise<number> {
  return objetivo.evaluate((el) => {
    interface Rgba { r: number; g: number; b: number; a: number }
    const leer = (c: string): Rgba | null => {
      const m = c.match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      const p = m[1].split(',').map((x) => Number(x.trim()));
      return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
    };
    const lineal = (v: number): number => {
      const s = v / 255;
      return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    const luminancia = (c: Rgba): number => 0.2126 * lineal(c.r) + 0.7152 * lineal(c.g) + 0.0722 * lineal(c.b);
    const sobre = (arriba: Rgba, abajo: Rgba): Rgba => ({
      r: arriba.r * arriba.a + abajo.r * (1 - arriba.a),
      g: arriba.g * arriba.a + abajo.g * (1 - arriba.a),
      b: arriba.b * arriba.a + abajo.b * (1 - arriba.a),
      a: 1,
    });
    const razon = (x: Rgba, y: Rgba): number => {
      const a = luminancia(x);
      const b = luminancia(y);
      return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    };
    const capas: Rgba[] = [];
    let degradado: Rgba[] | null = null;
    let nodo: Element | null = el;
    while (nodo) {
      const estilo = getComputedStyle(nodo);
      if (!degradado && estilo.backgroundImage.includes('gradient')) {
        degradado = (estilo.backgroundImage.match(/rgba?\([^)]+\)/g) ?? [])
          .map(leer)
          .filter((c): c is Rgba => c !== null);
      }
      const fondo = leer(estilo.backgroundColor);
      if (fondo && fondo.a > 0) {
        capas.push(fondo);
        if (fondo.a === 1) break;
      }
      nodo = nodo.parentElement;
    }
    let base: Rgba = { r: 255, g: 255, b: 255, a: 1 };
    for (let i = capas.length - 1; i >= 0; i--) base = sobre(capas[i], base);
    const estilo = getComputedStyle(el);
    const color = leer(estilo.color) ?? { r: 0, g: 0, b: 0, a: 1 };
    const opacidad = Number(estilo.opacity);
    const fondos = degradado && degradado.length ? degradado : [base];
    return Math.min(
      ...fondos.map((f) => {
        const solido = color.a < 1 ? sobre(color, f) : color;
        const visto = opacidad < 1 ? sobre({ ...solido, a: opacidad }, f) : solido;
        return razon(visto, f);
      }),
    );
  });
}

/** Las piezas de la app con texto sobre color de marca, y lo que exige cada una (WCAG 1.4.3). */
async function medirContrasteDeLaApp(page: Page): Promise<string[]> {
  await elegirTipo(page, 'Contencioso');
  await estimar(page);
  const piezas: { nombre: string; objetivo: Locator; umbral: number }[] = [
    // 19,2 px en negrita: texto grande, 3:1.
    { nombre: 'título de tarjeta', objetivo: page.locator('h2[class*="cardTitle"]').first(), umbral: 3 },
    { nombre: 'opción activa (strong)', objetivo: page.locator('[class*="optionActivo"] strong').first(), umbral: 4.5 },
    { nombre: 'interruptor No/Sí activo', objetivo: page.locator('[class*="switchActivo"]'), umbral: 4.5 },
    { nombre: 'botón «Estimar costes»', objetivo: page.getByRole('button', { name: 'Estimar costes' }), umbral: 4.5 },
    { nombre: 'etiqueta del total', objetivo: page.locator('[class*="totalLabel"]'), umbral: 4.5 },
    { nombre: 'duración', objetivo: page.locator('[class*="duracion"]'), umbral: 4.5 },
    // 28,8 px en negrita: grande.
    { nombre: 'importe del total', objetivo: page.locator('[class*="totalImporte"]'), umbral: 3 },
    { nombre: 'aviso del contencioso (strong)', objetivo: page.locator('[class*="alertCard"] strong'), umbral: 4.5 },
    { nombre: 'comparativa activa (strong)', objetivo: page.locator('[class*="comparativaActivo"] strong'), umbral: 4.5 },
  ];
  const fallos: string[] = [];
  for (const p of piezas) {
    const r = await contrasteMinimo(p.objetivo);
    if (r < p.umbral) fallos.push(`${p.nombre}: ${r.toFixed(2)}:1 < ${p.umbral}:1`);
  }
  return fallos;
}

// ═════════════════════════════ MOTOR (sin navegador) ═════════════════════════════

const BASE: Omit<Entrada, 'tipo'> = { hijos: false, complejidad: 'sin_bienes', valorBienes: 0, pensionMensual: 0, presupuestoAbogado: null };

test.describe('MOTOR · casos resueltos a mano', () => {
  test('escalas: art. 2 de la Procura y nº 2 notarial con la rebaja del 5 %', () => {
    expect(escalaProcura(4800)).toBe(187.42);
    expect(escalaProcura(150000)).toBe(1294.12);
    expect(escalaProcura(300000)).toBe(1472.62); // «no exceda de» 300.000: el escalón incluye el límite
    expect(escalaNotarial(75000)).toBeCloseTo(245.39155, 4);
  });

  test('procurador y notario de los casos de la cabecera', () => {
    expect(calcular({ ...BASE, tipo: 'mutuo_acuerdo_judicial' }).procurador?.total).toBe(101.94);
    expect(calcular({ ...BASE, tipo: 'contencioso' }).procurador?.total).toBe(206.33);
    expect(calcular({ ...BASE, tipo: 'mutuo_acuerdo_notarial' }).notario?.total).toBe(36.36);
    expect(
      calcular({ ...BASE, tipo: 'mutuo_acuerdo_notarial', complejidad: 'bienes_simples', valorBienes: 150000 }).notario?.total,
    ).toBe(630.21);
    expect(
      calcular({ ...BASE, tipo: 'contencioso', hijos: true, complejidad: 'bienes_complejos', valorBienes: 300000 }).procurador?.total,
    ).toBe(1542.73);
    expect(
      calcular({ ...BASE, tipo: 'mutuo_acuerdo_judicial', hijos: true, complejidad: 'bienes_simples', valorBienes: 150000, pensionMensual: 400 })
        .procurador?.total,
    ).toBe(843.84);
  });

  test('el notarial ignora «hijos» (no cabe) y el presupuesto sustituye a la horquilla', () => {
    const notarialConHijos = calcular({ ...BASE, tipo: 'mutuo_acuerdo_notarial', hijos: true });
    expect(notarialConHijos).toEqual(calcular({ ...BASE, tipo: 'mutuo_acuerdo_notarial' }));
    const r = calcular({ ...BASE, tipo: 'mutuo_acuerdo_judicial', presupuestoAbogado: 900 });
    expect(r.abogado).toEqual({ min: 900, max: 900, esPresupuesto: true });
    expect(enCentimos(r.total)).toEqual([90000 + 10194, 90000 + 10194]);
  });
});

// ═════════════════════════════ PÁGINA ═════════════════════════════

test.describe('PÁGINA', () => {
test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Estimador de Costes de Divorcio en España 2026');
  // Sin esto el primer clic puede llegar antes de que React hidrate y perderse (_hidratacion.ts).
  await esperarPaginaAsentada(page);
});

// ─────────────────────────────────────────────────────────────────────────────
test('CASO 1 (normal) · mutuo acuerdo judicial, sin hijos, sin bienes: 601,94 € – 1301,94 €', async ({ page }) => {
  // Riesgo 1: el disclaimer crítico va SIEMPRE desplegado (no colapsable).
  const disclaimer = page.locator('[role="alert"]').first();
  await expect(disclaimer).toContainText('orientativ');
  expect(await disclaimer.locator('button').count()).toBe(0);

  await elegirTipo(page, 'Mutuo acuerdo (judicial)');
  await elegirHijos(page, false);
  await elegirComplejidad(page, 'Sin bienes comunes');
  await estimar(page);

  expect(await etiquetaTotal(page)).toBe('Coste total estimado');
  expect(await partida(page, /Abogado/)).toBe('500,00 € – 1200,00 €');
  // Hallazgo 2792: el máximo legal (70,21 × 1,20 + IVA), no los 250 € de antes.
  expect(await partida(page, /Procurador/)).toBe('101,94 €');
  expect(await partida(page, /Tasas judiciales/)).toBe('Exento');
  expect(await totalEstimado(page)).toBe('601,94 € – 1301,94 €');
  expect(horquilla(await totalEstimado(page))).toEqual(await sumaDelDesglose(page));
  expect(await duracion(page)).toBe('Duración estimada: 2–4 meses');
  const n = await notas(page);
  expect(n[0]).toBe('Un solo abogado y procurador para ambos (coste compartido)');
  expect(n).toContain('Las personas físicas están exentas de tasas judiciales desde 2015');

  // No se muestran filas de notario ni de registro civil fuera del notarial.
  expect(await page.locator('[class*="desgloseItem"]', { hasText: /Notario/ }).count()).toBe(0);
  expect(await page.locator('[class*="desgloseItem"]', { hasText: /Registro Civil/ }).count()).toBe(0);

  // Regla de accesibilidad obligatoria: todo <button> de la app lleva type="button".
  const sinType = await page.evaluate(() =>
    Array.from(document.querySelectorAll('button'))
      .filter(b => b.getRootNode() === document && !b.getAttribute('type'))
      .map(b => (b.textContent || '').slice(0, 40)),
  );
  expect(sinType).toEqual([]);
});

// ─────────────────────────────────────────────────────────────────────────────
test('CASO 2 (límite) · contencioso, con hijos, bienes complejos de 300.000 €: 5542,73 € – 13.542,73 € por cónyuge', async ({ page }) => {
  // Reescrito el 03/10/2026: fijaba «Procurador 800,00 €» y «4800,00 € – 12.800,00 €»; los 800 €
  // eran un fijo escrito a mano que no dependía del activo. Ahora el activo se pide y el
  // procurador sale del art. 22.3 (cuenta en la cabecera).
  await elegirTipo(page, 'Contencioso');
  await elegirHijos(page, true);
  await elegirComplejidad(page, 'Bienes complejos');
  await escribir(page, campoValor(page), '300.000');
  await estimar(page);

  // El propio motor avisa de que el importe es por cónyuge, no por pareja.
  expect(await etiquetaTotal(page)).toBe('Coste total estimado (por cónyuge)');
  expect(await partida(page, /Abogado/)).toBe('4000,00 € – 12.000,00 €');
  expect(await partida(page, /Procurador/)).toBe('1542,73 €');
  expect(await partida(page, /Tasas judiciales/)).toBe('Exento');
  expect(await totalEstimado(page)).toBe('5542,73 € – 13.542,73 €');
  expect(await duracion(page)).toBe('Duración estimada: 6–18 meses');
  const n = await notas(page);
  expect(n.slice(0, 2)).toEqual([
    'Cada cónyuge necesita su propio abogado y procurador',
    'Los importes mostrados son por cónyuge — el coste total familiar sería el doble',
  ]);
  expect(n).toContain('Posibles informes periciales psicosociales si hay disputa sobre custodia');

  // El detalle del arancel nombra los cuatro conceptos del art. 22.3 que suma.
  const detalle = limpiar(await page.locator('[class*="detallePartida"]').first().innerText());
  for (const art of ['22.3.a', '22.2', '22.3.c', '22.3.d']) expect(detalle).toContain(art);

  // Aviso adicional específico del contencioso (condena en costas).
  await expect(page.getByText('cada cónyuge paga sus propios gastos')).toBeVisible();
});

// ─────────────────────────────────────────────────────────────────────────────
test('CASO 3 · el notarial oculta y resetea la pregunta de hijos; con una vivienda de 150.000 €, notario 630,21 €', async ({ page }) => {
  await elegirTipo(page, 'Mutuo acuerdo (judicial)');
  await elegirHijos(page, true);
  await elegirComplejidad(page, 'Bienes simples');
  await escribir(page, campoValor(page), '150.000');
  await estimar(page);
  expect(await partida(page, /Abogado/)).toBe('1000,00 € – 2000,00 €');
  expect(horquilla(await totalEstimado(page))).toEqual(await sumaDelDesglose(page));
  expect(await notas(page)).toContain('Se necesita convenio regulador con medidas sobre custodia, alimentos y uso de vivienda');

  // El divorcio notarial (CC arts. 82.2 y 87) no cabe con hijos menores no emancipados: la
  // app debe impedir la combinación, no solo advertirla. Se ancla al GRUPO de la pregunta, no a
  // su frase (que cambió con el hallazgo 2797).
  await elegirTipo(page, 'Mutuo acuerdo (notarial)');
  await expect(page.getByRole('group', { name: /hijos/i })).toHaveCount(0);
  expect(await hayResultado(page)).toBe(false); // el resultado anterior (con hijos) se limpia

  // El estado de "hijos" no debe quedar pegado en Sí por detrás del formulario.
  await elegirTipo(page, 'Mutuo acuerdo (judicial)');
  await expect(page.getByRole('button', { name: 'No', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: 'Sí', exact: true })).toHaveAttribute('aria-pressed', 'false');

  await elegirTipo(page, 'Mutuo acuerdo (notarial)');
  await estimar(page);
  expect(await partida(page, /Abogado/)).toBe('700,00 € – 1500,00 €');
  expect(await partida(page, /Procurador/)).toBe('No necesario'); // CC art. 82.1: basta letrado
  expect(await partida(page, /Notario/)).toBe('630,21 €');
  expect(await totalEstimado(page)).toBe('1330,21 € – 2130,21 €');
  expect(horquilla(await totalEstimado(page))).toEqual(await sumaDelDesglose(page));
  expect(await duracion(page)).toBe('Duración estimada: 1–2 meses');
  const n = await notas(page);
  expect(n.join(' ')).not.toMatch(/Ministerio Fiscal|custodia/);
});

// ─────────────────────────────────────────────────────────────────────────────
test('CASO 4 · las pensiones suman la escala del art. 2 sobre una anualidad: procurador 843,84 €', async ({ page }) => {
  await elegirTipo(page, 'Mutuo acuerdo (judicial)');
  await elegirHijos(page, true);
  await elegirComplejidad(page, 'Bienes simples');
  await escribir(page, campoValor(page), '150.000');
  await escribir(page, campoPension(page), '400');
  await estimar(page);
  expect(await partida(page, /Procurador/)).toBe('843,84 €');
});

// ─────────────────────────────────────────────────────────────────────────────
test('ENTRADAS · con bienes el valor es obligatorio; el presupuesto del abogado sustituye a la horquilla', async ({ page }) => {
  await elegirComplejidad(page, 'Bienes simples');
  await estimar(page);
  expect(await hayResultado(page)).toBe(false);
  await expect(page.getByRole('alert').filter({ hasText: 'valor aproximado de los bienes' })).toBeVisible();

  await elegirComplejidad(page, 'Sin bienes comunes');
  await escribir(page, campoPresupuesto(page), '900');
  await estimar(page);
  expect(await partida(page, /Abogado/)).toBe('900,00 €');
  expect(await totalEstimado(page)).toBe('1001,94 € – 1001,94 €');
  await expect(page.locator('[class*="aclaracion"]')).toContainText('Tu presupuesto');
});

// ─────────────────────────────────────────────────────────────────────────────
test('HALLAZGO 572 (reparado) · DataReference cita la exención de tasas y el arancel de Procura', async ({ page }) => {
  const referencia = page.locator('[aria-label="Datos de referencia normativos"]');
  await expect(referencia).toContainText('Ley 10/2012');
  await expect(referencia).toContainText('RD 434/2024');
});

// ─────────────────────────────────────────────────────────────────────────────
test('HALLAZGO 571 / COMPARATIVA · cada tarjeta vale lo que da elegir ese tipo con los mismos datos', async ({ page }) => {
  // Reescrito el 03/10/2026: la comparativa ya no son tres horquillas fijas sino el motor con los
  // datos del usuario. Para cada combinación se estima con los tres tipos y se exige que, tras la
  // última estimación, cada tarjeta coincida con el total de su tipo.
  const tipos: { boton: string; tarjeta: string }[] = [
    { boton: 'Mutuo acuerdo (notarial)', tarjeta: 'Notarial' },
    { boton: 'Mutuo acuerdo (judicial)', tarjeta: 'Mutuo acuerdo' },
    { boton: 'Contencioso', tarjeta: 'Contencioso' },
  ];
  for (const hijos of [false, true]) {
    for (const c of COMPLEJIDADES) {
      const totales = new Map<string, [number, number]>();
      for (const t of tipos) {
        await elegirTipo(page, t.boton);
        if (t.boton !== 'Mutuo acuerdo (notarial)') await elegirHijos(page, hijos);
        else if (hijos) continue; // no cabe con hijos
        await elegirComplejidad(page, c);
        if (c !== 'Sin bienes comunes') await escribir(page, campoValor(page), '200.000');
        await estimar(page);
        const total = horquilla(await totalEstimado(page));
        expect(total, `${t.boton} · hijos=${hijos} · ${c}`).toEqual(await sumaDelDesglose(page));
        totales.set(t.tarjeta, total);
      }
      for (const t of tipos) {
        const tarjeta = page.locator('[class*="comparativaItem"]', { hasText: t.tarjeta });
        if (!totales.has(t.tarjeta)) {
          await expect(tarjeta).toContainText('No cabe con hijos');
          continue;
        }
        expect(horquilla(await tarjeta.locator('span').first().innerText()), `${t.tarjeta} · hijos=${hijos} · ${c}`).toEqual(totales.get(t.tarjeta));
      }
    }
  }
});

// ─────────────────────────────────────────────────────────────────────────────
test('TECLADO · los botones de opción se activan con Espacio y el cálculo con Intro', async ({ page }) => {
  const contencioso = page.getByRole('button', { name: 'Contencioso' });
  await contencioso.focus();
  await page.keyboard.press('Space');
  await expect(contencioso).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Estimar costes' }).focus();
  await page.keyboard.press('Enter');
  expect(await etiquetaTotal(page)).toBe('Coste total estimado (por cónyuge)');
});

// ─────────────────────────────────────────────────────────────────────────────
test.describe('MÓVIL 390 px', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent: devices['Pixel 7'].userAgent,
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  test('el caso más caro se calcula con toques y no desborda la pantalla', async ({ page }) => {
    await page.getByRole('button', { name: 'Contencioso' }).tap();
    await page.getByRole('button', { name: 'Sí', exact: true }).tap();
    await page.getByRole('button', { name: 'Bienes complejos' }).tap();
    await escribir(page, campoValor(page), '300.000');
    await page.getByRole('button', { name: 'Estimar costes' }).tap();
    expect(await totalEstimado(page)).toBe('5542,73 € – 13.542,73 €');
    await expect(page.locator('[class*="totalImporte"]')).toBeVisible();
    const anchos = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      cliente: document.documentElement.clientWidth,
    }));
    expect(anchos.scroll).toBeLessThanOrEqual(anchos.cliente);
  });
});

// ═════════════════════════════ REPARADOS (03/10/2026) ═════════════════════════════

test('HALLAZGO 2792 (reparado) · procurador del mutuo acuerdo sin hijos ni bienes: no pasa de 101,94 € (RD 434/2024 art. 22.1.a)', async ({ page }) => {
  // 70,21 € (art. 22.1.a) × 1,20 (art. 6.1, un procurador para los dos) = 84,25 € + IVA 21 %
  // = 101,94 €. Sin pensiones no hay 22.1.b; sin bienes no hay 22.1.c. Antes: 250,00 €.
  await elegirTipo(page, 'Mutuo acuerdo (judicial)');
  await elegirHijos(page, false);
  await elegirComplejidad(page, 'Sin bienes comunes');
  await estimar(page);
  const [, maximo] = horquilla(await partida(page, /Procurador/));
  expect(maximo).toBeGreaterThan(0);
  expect(maximo).toBeLessThanOrEqual(10194);
});

test('HALLAZGO 2792 (reparado) · procurador del contencioso sin hijos ni bienes: no pasa de 206,33 € por cónyuge (art. 22.3.a + 22.2)', async ({ page }) => {
  // 100,31 € (art. 22.3.a) + 70,21 € de medidas provisionales (art. 22.2) = 170,52 € + IVA 21 %
  // = 206,33 €. Antes: 500,00 €.
  await elegirTipo(page, 'Contencioso');
  await elegirHijos(page, false);
  await elegirComplejidad(page, 'Sin bienes comunes');
  await estimar(page);
  const [, maximo] = horquilla(await partida(page, /Procurador/));
  expect(maximo).toBeGreaterThan(0);
  expect(maximo).toBeLessThanOrEqual(20633);
});

test('HALLAZGO 2793 (reparado) · DataReference cita el concepto del divorcio (art. 22: 70,21 €), no el supletorio de 351,00 €', async ({ page }) => {
  const referencia = page.locator('[aria-label="Datos de referencia normativos"]');
  await expect(referencia).toContainText('70,21', { timeout: 2000 });
  await expect(referencia).toContainText('art. 22');
  await expect(referencia).not.toContainText('351,00', { timeout: 2000 });
});

test('HALLAZGO 2794 (reparado) · el divorcio notarial no paga 50 € al Registro Civil (Ley 20/2011, art. 61)', async ({ page }) => {
  // La ley no fija tasa ni arancel por la inscripción: la remite el notario de oficio.
  await elegirTipo(page, 'Mutuo acuerdo (notarial)');
  await elegirComplejidad(page, 'Sin bienes comunes');
  await estimar(page);
  const fila = page.locator('[class*="desgloseItem"]', { hasText: /Registro Civil/ });
  if ((await fila.count()) > 0) {
    expect(horquilla(await fila.locator('strong').innerText())).toEqual([0, 0]);
  }
  // Y la escritura sin bienes ni procurador: total = abogado + notario.
  const [abMin, abMax] = horquilla(await partida(page, /Abogado/));
  const [noMin, noMax] = horquilla(await partida(page, /Notario/));
  expect(horquilla(await totalEstimado(page))).toEqual([abMin + noMin, abMax + noMax]);
  // 30,050605 € (nº 1.1.h) + IVA = 36,36 €; abogado 500–1.000 → 536,36 € – 1036,36 €.
  expect(await totalEstimado(page)).toBe('536,36 € – 1036,36 €');
  // Ni la FAQ visible ni el FAQPage vuelven a ponerle precio.
  expect(await textoDeLaPagina(page)).not.toMatch(/Registro Civil \(unos/);
  expect(await textoJsonLd(page)).not.toMatch(/Registro Civil \(unos/);
});

test('HALLAZGO 2795 (reparado) · el notario con bienes no cuesta lo mismo que sin bienes (RD 1426/1989 nº 2 y norma 4.ª.3)', async ({ page }) => {
  await elegirTipo(page, 'Mutuo acuerdo (notarial)');
  await elegirComplejidad(page, 'Sin bienes comunes');
  await estimar(page);
  const sinBienes = await partida(page, /Notario/);
  await elegirComplejidad(page, 'Bienes simples');
  await escribir(page, campoValor(page), '150.000');
  await estimar(page);
  const conVivienda = await partida(page, /Notario/);
  expect(sinBienes).toBe('36,36 €');
  expect(conVivienda).toBe('630,21 €');
});

test('HALLAZGO 2796 (reparado) · los honorarios de abogado se dicen libres, sin tarifa oficial, junto a la cifra', async ({ page }) => {
  // Son libres desde la Ley 25/2009 (cabecera de data/fiscal/costas-judiciales.ts).
  const texto = await textoDeLaPagina(page);
  expect(texto).toMatch(/honorarios[^.]{0,160}(libres|no tienen? (tarifa|arancel)|sin (tarifa|arancel)|no hay (tarifa|arancel))/i);
  // Y junto a la cifra del resultado, no solo en la FAQ plegada.
  await estimar(page);
  await expect(page.locator('[class*="aclaracion"]')).toContainText('Ley 25/2009');
  await expect(page.locator('[class*="aclaracion"]')).toContainText('sin tarifa oficial');
});

test('HALLAZGO 2797 (reparado) · el requisito del notarial es el del Código Civil: hijos menores no emancipados o con medidas de apoyo', async ({ page }) => {
  await elegirTipo(page, 'Mutuo acuerdo (notarial)');
  await estimar(page);
  const n = (await notas(page)).join(' ');
  expect(n).not.toMatch(/discapacidad a cargo/);
  expect(n).toMatch(/no emancipad|medidas (judiciales )?de apoyo/i);
  // La pregunta del formulario también.
  await elegirTipo(page, 'Mutuo acuerdo (judicial)');
  await expect(page.getByRole('group', { name: /hijos menores no emancipados/i })).toHaveCount(1);
  await expect(page.getByRole('group', { name: /medidas judiciales de apoyo/i })).toHaveCount(1);
  expect(await textoDeLaPagina(page)).not.toMatch(/discapacidad a cargo/);
  expect(await textoJsonLd(page)).not.toMatch(/discapacidad a cargo/);
});

test('HALLAZGO 2798 (reparado) · justicia gratuita: el umbral es 2 × IPREM (Ley 1/1996 art. 3.1), no «el límite IPREM»', async ({ page }) => {
  const texto = await textoDeLaPagina(page);
  expect(texto).toMatch(/(dos veces|doble|2 ?[×x])[^.]{0,40}IPREM|IPREM[^.]{0,60}(dos veces|doble|2 ?[×x])/i);
  // Con las cifras: 14.400 € (12 pagas) y 16.800 € (14 pagas), y la valoración individual (3.3).
  expect(limpiar(texto)).toContain('entre 14.400,00 € y 16.800,00 €');
  expect(texto).toContain('art. 3.3');
});

test('HALLAZGO 2799 (reparado) · las duraciones de las FAQ y del JSON-LD no contradicen al motor', async ({ page }) => {
  await elegirTipo(page, 'Mutuo acuerdo (notarial)');
  await estimar(page);
  expect(await duracion(page)).toBe('Duración estimada: 1–2 meses');
  const jsonLd = await textoJsonLd(page);
  expect(jsonLd).not.toContain('entre 1 y 3 años');
  expect(await textoDeLaPagina(page)).not.toContain('2-4 semanas');
  // Lo que dicen ahora: las duraciones del motor, en la FAQ visible y en el FAQPage.
  for (const d of ['entre 1 y 2 meses', 'entre 2 y 4 meses', 'entre 4 y 12 meses', 'entre 6 y 18 meses']) {
    expect(jsonLd).toContain(d);
    expect(await textoDeLaPagina(page)).toContain(d);
  }
});

test('FAQ · la visible y el FAQPage son la misma lista, y ninguna cifra contradice al motor', async ({ page }) => {
  // Una sola fuente (faq.ts) para las dos.
  expect(faqJsonLd.mainEntity.map((q) => q.name)).toEqual(PREGUNTAS_FRECUENTES.map((p) => p.pregunta));
  expect(faqJsonLd.mainEntity.map((q) => q.acceptedAnswer.text)).toEqual(PREGUNTAS_FRECUENTES.map((p) => p.respuesta));
  const visibles = (await page.locator('[class*="faqItem"] summary').allInnerTexts()).map(limpiar);
  expect(visibles).toEqual(PREGUNTAS_FRECUENTES.map((p) => p.pregunta));
  // El procurador que cita la FAQ es el que da la app (CASO 1 y el contencioso sin nada).
  const faq = limpiar(await textoDeLaPagina(page));
  expect(faq).toContain('101,94 €');
  expect(faq).toContain('206,33 €');
  expect(faq).not.toMatch(/250-800|150-250 €/);
});

test('HALLAZGO 2800 (reparado) · los emojis de las opciones de tipo van con aria-hidden', async ({ page }) => {
  const visibles = await page.evaluate(() => {
    const pictograma = /\p{Extended_Pictographic}/u;
    const salida: string[] = [];
    for (const grupo of Array.from(document.querySelectorAll('[class*="optionGrid"]'))) {
      const recorrido = document.createTreeWalker(grupo, NodeFilter.SHOW_TEXT);
      while (recorrido.nextNode()) {
        const t = recorrido.currentNode;
        if (!pictograma.test(t.textContent ?? '')) continue;
        if (t.parentElement?.closest('[aria-hidden="true"]')) continue;
        salida.push((t.textContent ?? '').trim());
      }
    }
    return salida;
  });
  expect(visibles).toEqual([]);
  // Y el nombre accesible del botón empieza por el texto, sin el pictograma.
  await expect(page.getByRole('button', { name: /^Mutuo acuerdo \(judicial\)/ })).toHaveCount(1);
});

test('HALLAZGO 2801 (reparado) · los grupos de botones tienen nombre accesible (el «Sí»/«No» de los hijos)', async ({ page }) => {
  await expect(page.getByRole('group', { name: /hijos/i })).toHaveCount(1, { timeout: 2000 });
  await expect(page.getByRole('group', { name: /tipo de divorcio/i })).toHaveCount(1, { timeout: 2000 });
  await expect(page.getByRole('group', { name: /complejidad patrimonial/i })).toHaveCount(1, { timeout: 2000 });
  // El «Sí» está DENTRO del grupo de los hijos.
  await expect(page.getByRole('group', { name: /hijos/i }).getByRole('button', { name: 'Sí', exact: true })).toHaveCount(1);
});

test('HALLAZGO 2802 (reparado) · contraste en tema CLARO del texto sobre color de marca', async ({ page }) => {
  await activarTema(page, 'light');
  expect(await medirContrasteDeLaApp(page)).toEqual([]);
});

test('HALLAZGO 2802 (reparado) · contraste en tema OSCURO del texto sobre color de marca', async ({ page }) => {
  // El módulo redeclaraba --primary: #2E86AB en .container para los dos temas y tapaba el
  // #3FA5D1 oscuro de globals.css. Retirado.
  await activarTema(page, 'dark');
  expect(await medirContrasteDeLaApp(page)).toEqual([]);
});
});
