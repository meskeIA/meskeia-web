import { test, expect, devices, Locator, Page } from '@playwright/test';
import { esperarPaginaAsentada } from './_hidratacion';
import { activarTema } from '../contraste-text-muted-auxiliares';

/**
 * Inspector — estimador-costes-divorcio (segmento FISCAL/LEGAL, RIESGO 1 CRÍTICO)
 * Primera inspección: 31/08/2026 · Re-inspección: 03/10/2026.
 *
 * Qué promete la app
 * ──────────────────
 *   <h1>  «Estimador de Costes de Divorcio en España 2026»
 *   sub.  «Cuánto cuesta divorciarse en España: precio del abogado, procurador y tarifa
 *          notarial según el tipo de procedimiento (mutuo acuerdo vs contencioso), hijos
 *          y bienes comunes»
 *
 *   El cálculo vive entero en `calcular()`, dentro de `app/estimador-costes-divorcio/page.tsx`
 *   (no hay motor aparte): suma partidas fijas escritas a mano (abogado, procurador, notario,
 *   «Registro Civil») según tipo × hijos × complejidad. No hay campos numéricos: la entrada son
 *   tres grupos de botones, así que no hay importes negativos, vacíos ni letras que rechazar; la
 *   combinación imposible (notarial con hijos menores) la impide el propio formulario (CASO 3).
 *
 * Nota de formato: `formatCurrency` usa es-ES con `useGrouping:'auto'`, que NO agrupa los
 * millares de un número de cuatro cifras («1450,00 €») y SÍ los de cinco o más («12.800,00 €»),
 * como manda la Ortografía de la RAE. Se codifica tal cual en las cadenas esperadas.
 *
 * FUENTES de los valores esperados (leídas en el BOE el 03/10/2026, no de memoria)
 * ──────────────────────────────────────────────────────────────────────────
 *   · RD 434/2024, arancel de la Procura (BOE-A-2024-8706): art. 1.2 y 3 del RD (el arancel es
 *     de MÁXIMOS y «el precio ofertado, en ningún caso, podrá superar» su umbral); arancel,
 *     art. 3 (351,00 €, SUPLETORIO: solo para lo que «no tenga fijado expresamente un concepto
 *     especial»), art. 6.1 (un procurador para varios: una cuenta + 10 % como máximo por cada
 *     representado) y art. 22, el concepto especial de los procesos matrimoniales:
 *       22.1.a mutuo acuerdo: 70,21 € · 22.3.a contencioso: 100,31 € por procurador ·
 *       22.2 medidas provisionales: 70,21 € · 22.1.b/22.3.b alimentos o compensatoria: escala
 *       del art. 2 sobre una anualidad · 22.1.c/22.3.d liquidación: 25 %/50 % de la escala.
 *     `data/fiscal/costas-judiciales.ts` (ARANCEL_PROCURA) NO tiene todavía el art. 22.
 *   · RD 1426/1989, arancel notarial (BOE-A-1989-28111): nº 1.h (documento sin cuantía,
 *     30,050605 €), nº 2.1 (escala sobre el valor, con rebaja del 5 %) y norma general 4.ª.3
 *     (en la liquidación de la sociedad conyugal, la escala se aplica A CADA INTERESADO por lo
 *     que se le adjudica). La escala está en `data/itp-ccaa.ts` (ARANCELES_NOTARIO).
 *   · Ley 20/2011 del Registro Civil (BOE-A-2011-12628): art. 61 (el notario remite la
 *     escritura y la Oficina inscribe de inmediato); la ley no fija tasa ni arancel alguno.
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
 *   CASO 1 (normal) — mutuo acuerdo judicial · sin hijos · sin bienes: abogado 500–1.200
 *       (horquilla de mercado de la app) + procurador. Reescrito el 03/10/2026: fijaba como
 *       correctos «Procurador 250,00 €» y «750,00 € – 1450,00 €», y 250 € supera el máximo legal;
 *       ahora comprueba la aritmética (total = suma del desglose) y el procurador va a su ABIERTO.
 *
 *   CASO 2 (límite, el más caro que ofrece la app) — contencioso · con hijos · bienes complejos:
 *       4.800,00 € – 12.800,00 € POR CÓNYUGE, 6–18 meses. El procurador de 800 € cabe en el
 *       arancel cuando hay liquidación de un activo grande (art. 22.3.d), así que no se toca.
 *
 *   CASO 3 (combinación imposible) — el notarial no admite hijos menores no emancipados: al
 *       elegirlo desaparece la pregunta y `tieneHijos` vuelve a false. Reescrito el 03/10/2026:
 *       fijaba «Notario 150,00 €», «Registro Civil 50,00 €» y «900,00 € – 1700,00 €», que
 *       arrastran dos hallazgos abiertos; ahora comprueba la aritmética del desglose.
 *
 *   PROCURADOR (límite normativo) — mutuo acuerdo judicial · sin hijos · sin bienes ni pensión:
 *       máximo = 70,21 € (22.1.a) × 1,20 (art. 6.1, dos representados) = 84,25 € → con IVA
 *       21 % = 101,94 €. La app pone 250,00 €. Contencioso sin hijos ni bienes, por cónyuge:
 *       100,31 € (22.3.a) + 70,21 € (22.2) = 170,52 € → con IVA 206,33 €. La app pone 500,00 €.
 *
 *   NOTARIO con bienes (vivienda de 150.000 € liquidada a partes iguales, 75.000 € a cada uno):
 *       por cónyuge 0,95 × (90,151816 + 108,1822 + 45,0759 + 14,8988) = 245,39 € → 490,79 € de
 *       matriz entre los dos, sin folios, copias ni IVA. Basta con adjudicar más de 15.216 € a
 *       cada cónyuge para pasar de 250 €. La app pone 150 € (igual que sin bienes) y, con
 *       «bienes complejos», 250 €.
 *
 *   JUSTICIA GRATUITA — persona que se divorcia, con 10.000 € brutos al año: supera 1 × IPREM
 *       (7.200 € en 12 pagas, 8.400 € en 14) y queda bajo 2 × IPREM (14.400 / 16.800 €), que es
 *       el umbral del art. 3.1.a: puede tener derecho. La app solo dice «límite IPREM».
 *
 * ── Reparado 02/09/2026 (hallazgos 571 y 572) — verificado el 03/10/2026 ──────────────
 *   571 — La «Comparativa rápida» y las FAQ daban 650–2.550 € para el notarial; el motor solo
 *       puede dar 700–2.800 €. Cerrado: ambos citan 700–2.800 € (test reescrito como invariante).
 *   572 — La app no citaba data/fiscal ni mostraba <DataReference>. Cerrado en su letra: lo
 *       muestra y la exención de tasas (Ley 10/2012 art. 4.2.a) es correcta. PERO la nota que
 *       añadió la reparación cita para el procurador el art. 3 (351,00 € de cuantía
 *       indeterminada), que es supletorio: el divorcio tiene concepto propio en el art. 22. El
 *       test de 572 afirmaba «351,00» como correcto; se retira esa línea y el defecto queda en
 *       su propio test ABIERTO.
 *
 * ── ABIERTOS (inspector 03/10/2026), cada uno en su test.fail() ─────────────────────────
 *   procurador por encima del arancel · DataReference con el concepto equivocado · partida de
 *   «Registro Civil» de 50 € · notario fijo con bienes · honorarios de abogado sin fuente ni
 *   aviso de que son libres · requisito del notarial mal formulado · justicia gratuita sin el
 *   múltiplo del IPREM · duraciones de las FAQ/JSON-LD que contradicen al motor · emojis de las
 *   opciones sin aria-hidden · grupos de botones sin nombre accesible · contraste en los dos temas.
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

/** «700 – 2.800 €» de la Comparativa rápida → [70000, 280000]. */
function horquillaComparativa(texto: string): [number, number] {
  const m = limpiar(texto).match(/(\d[\d.]*) – (\d[\d.]*) €/);
  if (!m) throw new Error(`Sin horquilla en «${texto}»`);
  return [Number(m[1].split('.').join('')) * 100, Number(m[2].split('.').join('')) * 100];
}

async function elegirTipo(page: Page, etiqueta: string): Promise<void> {
  await page.getByRole('button', { name: etiqueta }).click();
}

async function elegirHijos(page: Page, si: boolean): Promise<void> {
  await page.getByRole('button', { name: si ? 'Sí' : 'No', exact: true }).click();
}

async function elegirComplejidad(page: Page, etiqueta: string): Promise<void> {
  await page.getByRole('button', { name: etiqueta }).click();
}

async function estimar(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Estimar costes' }).click();
}

async function hayResultado(page: Page): Promise<boolean> {
  return (await page.getByText('Completa los datos y pulsa').count()) === 0;
}

/** «Coste total estimado[ (por cónyuge)]» — la horquilla que preside la tarjeta de resultados. */
async function totalEstimado(page: Page): Promise<string> {
  const importe = page.locator('div', { hasText: /^\d.*€.*–.*€$/ }).last();
  return limpiar(await importe.innerText());
}

async function etiquetaTotal(page: Page): Promise<string> {
  const etiqueta = page.getByText(/^Coste total estimado/);
  return limpiar(await etiqueta.innerText());
}

/**
 * Importe de una fila del desglose («Abogado», «Procurador», «Notario», «Registro Civil»,
 * «Tasas judiciales»). No se ancla `nombre` al inicio: cada fila empieza con un emoji
 * decorativo (`aria-hidden`, pero SIGUE en el texto visible) antes del nombre de la partida.
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
  return limpiar(await page.getByText(/^Duración estimada/).innerText());
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

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Estimador de Costes de Divorcio en España 2026');
  // Sin esto el primer clic puede llegar antes de que React hidrate y perderse (_hidratacion.ts).
  await esperarPaginaAsentada(page);
});

// ─────────────────────────────────────────────────────────────────────────────
test('CASO 1 (normal) · mutuo acuerdo judicial, sin hijos, sin bienes: el total es la suma del desglose', async ({ page }) => {
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
  expect(await partida(page, /Tasas judiciales/)).toBe('Exento');
  // Reescrito el 03/10/2026: aquí se fijaban «Procurador 250,00 €» y «750,00 € – 1450,00 €»
  // como correctos, y 250 € pasa del máximo legal del arancel (test ABIERTO del procurador).
  // Lo que queda es la aritmética del motor, que vale con cualquier procurador.
  expect(horquilla(await totalEstimado(page))).toEqual(await sumaDelDesglose(page));
  expect(await duracion(page)).toBe('Duración estimada: 2–4 meses');
  expect(await notas(page)).toEqual([
    'Un solo abogado y procurador para ambos (coste compartido)',
    'Las personas físicas están exentas de tasas judiciales desde 2015',
  ]);

  // No se muestran filas de notario ni registro civil fuera del notarial.
  expect(await page.locator('[class*="desgloseItem"]', { hasText: /^Notario/ }).count()).toBe(0);
  expect(await page.locator('[class*="desgloseItem"]', { hasText: /^Registro Civil/ }).count()).toBe(0);

  // Regla de accesibilidad obligatoria: todo <button> de la app lleva type="button".
  const sinType = await page.evaluate(() =>
    Array.from(document.querySelectorAll('button'))
      .filter(b => b.getRootNode() === document && !b.getAttribute('type'))
      .map(b => (b.textContent || '').slice(0, 40)),
  );
  expect(sinType).toEqual([]);
});

// ─────────────────────────────────────────────────────────────────────────────
test('CASO 2 (límite) · contencioso, con hijos, bienes complejos: 4800,00 € – 12.800,00 € por cónyuge', async ({ page }) => {
  await elegirTipo(page, 'Contencioso');
  await elegirHijos(page, true);
  await elegirComplejidad(page, 'Bienes complejos');
  await estimar(page);

  // El propio motor avisa de que el importe es por cónyuge, no por pareja.
  expect(await etiquetaTotal(page)).toBe('Coste total estimado (por cónyuge)');
  expect(await partida(page, /Abogado/)).toBe('4000,00 € – 12.000,00 €');
  expect(await partida(page, /Procurador/)).toBe('800,00 €'); // escalón caro (bienes complejos)
  expect(await partida(page, /Tasas judiciales/)).toBe('Exento');
  expect(await totalEstimado(page)).toBe('4800,00 € – 12.800,00 €');
  expect(await duracion(page)).toBe('Duración estimada: 6–18 meses');
  expect(await notas(page)).toEqual([
    'Cada cónyuge necesita su propio abogado y procurador',
    'Los importes mostrados son por cónyuge — el coste total familiar sería el doble',
    'Posibles informes periciales psicosociales si hay disputa sobre custodia',
    'Las personas físicas están exentas de tasas judiciales desde 2015',
  ]);

  // Aviso adicional específico del contencioso (condena en costas).
  await expect(page.getByText('cada cónyuge paga sus propios gastos')).toBeVisible();
});

// ─────────────────────────────────────────────────────────────────────────────
test('CASO 3 (aviso claro) · el notarial oculta y resetea la pregunta de hijos, no la deja pegada en "Sí"', async ({ page }) => {
  // Punto de partida: judicial + hijos=Sí + bienes simples → 1.250–2.250 €.
  await elegirTipo(page, 'Mutuo acuerdo (judicial)');
  await elegirHijos(page, true);
  await elegirComplejidad(page, 'Bienes simples');
  await estimar(page);
  expect(await partida(page, /Abogado/)).toBe('1000,00 € – 2000,00 €');
  expect(horquilla(await totalEstimado(page))).toEqual(await sumaDelDesglose(page));
  expect(await notas(page)).toContain('Se necesita convenio regulador con medidas sobre custodia, alimentos y uso de vivienda');

  // El divorcio notarial (CC arts. 82.2 y 87) no cabe con hijos menores no emancipados: la
  // app debe impedir la combinación, no solo advertirla.
  await elegirTipo(page, 'Mutuo acuerdo (notarial)');
  await expect(page.getByText('¿Hay hijos menores o con discapacidad?')).toHaveCount(0);
  expect(await hayResultado(page)).toBe(false); // el resultado anterior (con hijos) se limpia

  // El estado de "hijos" no debe quedar pegado en Sí por detrás del formulario: al volver
  // a judicial, el switch debe mostrarse otra vez en "No", no conservar la elección previa.
  await elegirTipo(page, 'Mutuo acuerdo (judicial)');
  await expect(page.getByRole('button', { name: 'No', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: 'Sí', exact: true })).toHaveAttribute('aria-pressed', 'false');

  // Y el cálculo notarial en sí, con bienes simples. Reescrito el 03/10/2026: fijaba «Notario
  // 150,00 €», «Registro Civil 50,00 €» y «900,00 € – 1700,00 €» como correctos; las dos
  // partidas tienen su test ABIERTO. Queda lo que no depende de ellas.
  await elegirTipo(page, 'Mutuo acuerdo (notarial)');
  await elegirComplejidad(page, 'Bienes simples');
  await estimar(page);
  expect(await partida(page, /Abogado/)).toBe('700,00 € – 1500,00 €');
  expect(await partida(page, /Procurador/)).toBe('No necesario'); // CC art. 82.1: basta letrado
  expect(horquilla(await totalEstimado(page))).toEqual(await sumaDelDesglose(page));
  expect(await duracion(page)).toBe('Duración estimada: 1–2 meses');
  // Y ninguna nota de hijos se cuela en el notarial.
  const n = await notas(page);
  expect(n.join(' ')).not.toMatch(/Ministerio Fiscal|custodia/);
});

// ─────────────────────────────────────────────────────────────────────────────
test('HALLAZGO 571 (reparado) · la "Comparativa rápida" del notarial coincide con lo que el propio motor puede producir', async ({ page }) => {
  // Reescrito el 03/10/2026 como invariante: antes fijaba los tres totales del notarial
  // (700–1.200, 900–1.700, 1.300–2.800), que incluyen los 50 € de «Registro Civil» del hallazgo
  // abierto. Ahora: mínimo y máximo de lo que el motor produce = lo que dice la tarjeta.
  let minimo = Infinity;
  let maximo = -Infinity;
  await elegirTipo(page, 'Mutuo acuerdo (notarial)');
  for (const c of COMPLEJIDADES) {
    await elegirComplejidad(page, c);
    await estimar(page);
    const [a, b] = horquilla(await totalEstimado(page));
    minimo = Math.min(minimo, a);
    maximo = Math.max(maximo, b);
  }
  const comparativaNotarial = page.locator('[class*="comparativaItem"]', { hasText: 'Notarial' });
  expect(horquillaComparativa(await comparativaNotarial.innerText())).toEqual([minimo, maximo]);
  // La cifra vieja (650–2.550) no vuelve.
  await expect(comparativaNotarial).not.toContainText('650');
  await expect(comparativaNotarial).not.toContainText('2.550');
});

// ─────────────────────────────────────────────────────────────────────────────
test('HALLAZGO 572 (reparado) · DataReference cita la exención de tasas y el arancel de Procura', async ({ page }) => {
  const referencia = page.locator('[aria-label="Datos de referencia normativos"]');
  await expect(referencia).toContainText('Ley 10/2012');
  await expect(referencia).toContainText('RD 434/2024');
  // Reescrito el 03/10/2026: aquí se exigía «351,00», que es el art. 3 del arancel (cuantía
  // indeterminada, SUPLETORIO). El divorcio tiene concepto propio en el art. 22: ver el test
  // ABIERTO «DataReference cita el concepto del divorcio».
});

// ─────────────────────────────────────────────────────────────────────────────
test('COMPARATIVA · las tres tarjetas y el total de las 15 combinaciones cuadran con el motor', async ({ page }) => {
  const tipos: { boton: string; tarjeta: string; conHijos: boolean }[] = [
    { boton: 'Mutuo acuerdo (notarial)', tarjeta: 'Notarial', conHijos: false },
    { boton: 'Mutuo acuerdo (judicial)', tarjeta: 'Mutuo acuerdo', conHijos: true },
    { boton: 'Contencioso', tarjeta: 'Contencioso', conHijos: true },
  ];
  for (const t of tipos) {
    let minimo = Infinity;
    let maximo = -Infinity;
    await elegirTipo(page, t.boton);
    for (const hijos of t.conHijos ? [false, true] : [false]) {
      if (t.conHijos) await elegirHijos(page, hijos);
      for (const c of COMPLEJIDADES) {
        await elegirComplejidad(page, c);
        await estimar(page);
        const total = horquilla(await totalEstimado(page));
        // Cada total es la suma de su desglose (abogado + procurador + notario + registro).
        expect(total, `${t.boton} · hijos=${hijos} · ${c}`).toEqual(await sumaDelDesglose(page));
        minimo = Math.min(minimo, total[0]);
        maximo = Math.max(maximo, total[1]);
      }
    }
    const tarjeta = page.locator('[class*="comparativaItem"]', { hasText: t.tarjeta });
    expect(horquillaComparativa(await tarjeta.innerText()), t.tarjeta).toEqual([minimo, maximo]);
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
    await page.getByRole('button', { name: 'Estimar costes' }).tap();
    expect(await totalEstimado(page)).toBe('4800,00 € – 12.800,00 €');
    await expect(page.locator('[class*="totalImporte"]')).toBeVisible();
    const anchos = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      cliente: document.documentElement.clientWidth,
    }));
    expect(anchos.scroll).toBeLessThanOrEqual(anchos.cliente);
  });
});

// ═════════════════════════════ ABIERTOS (03/10/2026) ═════════════════════════════

test.fail('ABIERTO, hallazgo (inspector 03/10/2026) · procurador del mutuo acuerdo sin hijos ni bienes: no puede pasar de 101,94 € (RD 434/2024 art. 22.1.a)', async ({ page }) => {
  // 70,21 € (art. 22.1.a) × 1,20 (art. 6.1, un procurador para los dos) = 84,25 € + IVA 21 %
  // = 101,94 €. Sin hijos no hay alimentos (22.1.b); sin bienes no hay liquidación (22.1.c).
  // Hoy la app pone 250,00 €.
  await elegirTipo(page, 'Mutuo acuerdo (judicial)');
  await elegirHijos(page, false);
  await elegirComplejidad(page, 'Sin bienes comunes');
  await estimar(page);
  const [, maximo] = horquilla(await partida(page, /Procurador/));
  expect(maximo).toBeGreaterThan(0);
  expect(maximo).toBeLessThanOrEqual(10194);
});

test.fail('ABIERTO, hallazgo (inspector 03/10/2026) · procurador del contencioso sin hijos ni bienes: no puede pasar de 206,33 € por cónyuge (art. 22.3.a + 22.2)', async ({ page }) => {
  // 100,31 € (art. 22.3.a) + 70,21 € de medidas provisionales (art. 22.2) = 170,52 € + IVA 21 %
  // = 206,33 €. Hoy la app pone 500,00 €.
  await elegirTipo(page, 'Contencioso');
  await elegirHijos(page, false);
  await elegirComplejidad(page, 'Sin bienes comunes');
  await estimar(page);
  const [, maximo] = horquilla(await partida(page, /Procurador/));
  expect(maximo).toBeGreaterThan(0);
  expect(maximo).toBeLessThanOrEqual(20633);
});

test.fail('ABIERTO, hallazgo (inspector 03/10/2026) · DataReference cita el concepto del divorcio (art. 22: 70,21 €), no el supletorio de 351,00 €', async ({ page }) => {
  // La nota añadida al reparar el 572 dice «351,00 € para cuantía indeterminada»: es el art. 3,
  // que solo rige donde no hay «concepto especial»; los procesos matrimoniales lo tienen.
  const referencia = page.locator('[aria-label="Datos de referencia normativos"]');
  await expect(referencia).toContainText('70,21', { timeout: 2000 });
  await expect(referencia).not.toContainText('351,00', { timeout: 2000 });
});

test.fail('ABIERTO, hallazgo (inspector 03/10/2026) · el divorcio notarial no paga 50 € al Registro Civil (Ley 20/2011, art. 61)', async ({ page }) => {
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
});

test.fail('ABIERTO, hallazgo (inspector 03/10/2026) · el notario con bienes no puede costar lo mismo que sin bienes (RD 1426/1989 nº 2 y norma 4.ª.3)', async ({ page }) => {
  // Sin bienes la escritura es «sin cuantía» (nº 1.h, 30,05 € + folios y copias). Si liquida la
  // sociedad conyugal, la escala del nº 2 se aplica a cada cónyuge por lo que se le adjudica:
  // una vivienda de 150.000 € a partes iguales son 490,79 € de matriz. La app pone 150 € en
  // los dos casos (y 250 € con «bienes complejos», que se superan adjudicando 15.216 € a cada uno).
  await elegirTipo(page, 'Mutuo acuerdo (notarial)');
  await elegirComplejidad(page, 'Sin bienes comunes');
  await estimar(page);
  const sinBienes = await partida(page, /Notario/);
  await elegirComplejidad(page, 'Bienes simples');
  await estimar(page);
  const conVivienda = await partida(page, /Notario/);
  expect(conVivienda).not.toBe(sinBienes);
});

test.fail('ABIERTO, hallazgo (inspector 03/10/2026) · los honorarios de abogado se dicen libres, sin tarifa oficial', async ({ page }) => {
  // Son libres desde la Ley 25/2009 (cabecera de data/fiscal/costas-judiciales.ts): una
  // horquilla de honorarios es una estimación de mercado y tiene que decirlo y citar su origen.
  // Hoy la app los da como «Abogado 500,00 € – 1200,00 €» sin decir de dónde salen.
  const texto = await textoDeLaPagina(page);
  expect(texto).toMatch(/honorarios[^.]{0,160}(libres|no tienen? (tarifa|arancel)|sin (tarifa|arancel)|no hay (tarifa|arancel))/i);
});

test.fail('ABIERTO, hallazgo (inspector 03/10/2026) · el requisito del notarial es el del Código Civil: hijos menores no emancipados o con medidas de apoyo', async ({ page }) => {
  // CC arts. 81 y 82.2 (Ley 8/2021). Un hijo mayor con discapacidad SIN medidas judiciales de
  // apoyo atribuidas a los padres, o un ascendiente con discapacidad a cargo, no lo impiden.
  // Hoy la nota dice «Solo posible sin hijos menores ni personas con discapacidad a cargo».
  await elegirTipo(page, 'Mutuo acuerdo (notarial)');
  await estimar(page);
  const n = (await notas(page)).join(' ');
  expect(n).not.toMatch(/discapacidad a cargo/);
  expect(n).toMatch(/no emancipad|medidas (judiciales )?de apoyo/i);
});

test.fail('ABIERTO, hallazgo (inspector 03/10/2026) · justicia gratuita: el umbral es 2 × IPREM (Ley 1/1996 art. 3.1), no «el límite IPREM»', async ({ page }) => {
  // Con 10.000 € brutos al año se supera 1 × IPREM (7.200 / 8.400 €) y se queda bajo 2 × IPREM
  // (14.400 / 16.800 €): puede haber derecho. La FAQ solo dice «por debajo del límite IPREM».
  const texto = await textoDeLaPagina(page);
  expect(texto).toMatch(/(dos veces|doble|2 ?[×x])[^.]{0,40}IPREM|IPREM[^.]{0,60}(dos veces|doble|2 ?[×x])/i);
});

test.fail('ABIERTO, hallazgo (inspector 03/10/2026) · las duraciones de las FAQ y del JSON-LD no contradicen al motor', async ({ page }) => {
  // El motor: notarial 1–2 meses; contencioso hasta 18 meses (con hijos). El FAQPage dice
  // «entre 1 y 3 años» para el contencioso y la FAQ visible, «2-4 semanas» para el notarial.
  await elegirTipo(page, 'Mutuo acuerdo (notarial)');
  await estimar(page);
  expect(await duracion(page)).toBe('Duración estimada: 1–2 meses');
  expect(await textoJsonLd(page)).not.toContain('entre 1 y 3 años');
  expect(await textoDeLaPagina(page)).not.toContain('2-4 semanas');
});

test.fail('ABIERTO, hallazgo (inspector 03/10/2026) · los emojis de las opciones de tipo van con aria-hidden', async ({ page }) => {
  // 🤝, 📄 y ⚔️ van dentro del <strong> del botón: el lector de pantalla los lee como parte del
  // nombre («apretón de manos, Mutuo acuerdo (judicial)…»).
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
});

test.fail('ABIERTO, hallazgo (inspector 03/10/2026) · los grupos de botones tienen nombre accesible (el «Sí»/«No» de los hijos)', async ({ page }) => {
  // Los tres <label> no están asociados a ningún control y no hay role="group": «Sí» y «No» se
  // anuncian sin la pregunta a la que responden.
  await expect(page.getByRole('group', { name: /hijos/i })).toHaveCount(1, { timeout: 2000 });
  await expect(page.getByRole('group', { name: /tipo de divorcio/i })).toHaveCount(1, { timeout: 2000 });
});

test.fail('ABIERTO, hallazgo (inspector 03/10/2026) · contraste en tema CLARO del texto sobre color de marca', async ({ page }) => {
  // Medido el 03/10/2026: interruptor y «Estimar costes» 4,11:1 (y 2,80:1 en el extremo teal del
  // degradado), opción activa 3,99:1, etiqueta del total 2,55:1, aviso rojo 3,54:1. Existe
  // --primary-boton (5,47:1 con blanco) y --primary-texto.
  await activarTema(page, 'light');
  expect(await medirContrasteDeLaApp(page)).toEqual([]);
});

test.fail('ABIERTO, hallazgo (inspector 03/10/2026) · contraste en tema OSCURO del texto sobre color de marca', async ({ page }) => {
  // El módulo redeclara --primary: #2E86AB en .container para los dos temas y tapa el #3FA5D1
  // oscuro de globals.css: título de tarjeta 2,99:1, opción activa 3,16:1, aviso rojo 3,05:1.
  await activarTema(page, 'dark');
  expect(await medirContrasteDeLaApp(page)).toEqual([]);
});
