import { test, expect, devices, type Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';
import { parseSpanishNumber } from '@/lib/formatters';

/* ════════════════════════════════════════════════════════════════════════════════════════════
 * tabla-solubilidad — buscador (/reparar del 06/11/2026, cabo C0607)
 *
 * El buscador comparaba la consulta ENTERA como una subcadena seguida en las tres secciones
 * (reglas, iones y Kps). Medido el 06/11/2026 contra next dev, antes de reparar: «carbonato
 * calcio» → 0 fichas, aunque la ficha del CaCO₃ se llama «Carbonato de calcio». Ahora usa el
 * modo fórmulas de lib/buscadorTablas.ts: cada palabra por separado y los subíndices como
 * cifras (CaCO3 = CaCO₃), casando todavía dentro de una fórmula («Cl» encuentra AgCl).
 * ════════════════════════════════════════════════════════════════════════════════════════════ */

const RUTA = '/tabla-solubilidad/';
const BUSCADOR = '#buscador-solubilidad';

async function cargar(page: Page): Promise<void> {
  await page.goto(RUTA);
  await esperarHidratacion(page, [BUSCADOR]);
}

async function buscar(page: Page, termino: string): Promise<void> {
  await page.locator(BUSCADOR).fill(termino);
  await esperarValorEnReact(page, BUSCADOR, termino);
}

/** El destino de cada ficha visible (regla, ion o Kps), en su orden. */
async function fichas(page: Page): Promise<string[]> {
  return page
    .locator('button[aria-controls^="detalle-"][aria-expanded]')
    .evaluateAll((els) => els.map((b) => (b.getAttribute('aria-controls') ?? '').replace(/^detalle-/, '')));
}

test.describe('Buscador (cabo C0607)', () => {
  test('dos palabras sin el «de» y en cualquier orden encuentran la ficha', async ({ page }) => {
    await cargar(page);
    for (const termino of ['carbonato de calcio', 'carbonato calcio', 'calcio carbonato']) {
      await buscar(page, termino);
      expect.soft(await fichas(page), termino).toContain('kps-caco3');
    }
    for (const termino of ['cloruro plata', 'plata cloruro']) {
      await buscar(page, termino);
      expect.soft(await fichas(page), termino).toContain('kps-agcl');
    }
  });

  test('una fórmula sin subíndices es la misma que con ellos', async ({ page }) => {
    await cargar(page);
    await buscar(page, 'CaCO₃');
    const conSubindice = await fichas(page);
    expect(conSubindice).toEqual(expect.arrayContaining(['carbonatos', 'kps-caco3']));
    await buscar(page, 'CaCO3');
    expect(await fichas(page)).toEqual(conSubindice);
  });

  test('sigue casando dentro de una fórmula: «AgCl» y «Cl» encuentran el cloruro de plata', async ({ page }) => {
    await cargar(page);
    for (const termino of ['AgCl', 'Cl']) {
      await buscar(page, termino);
      expect.soft(await fichas(page), termino).toContain('kps-agcl');
    }
  });
});

/* ════════════════════════════════════════════════════════════════════════════════════════════
 * Inspector, primera inspección (14/11/2026)
 *
 * La verdad comprobable está en los DATOS de page.tsx: 21 reglas, 46 iones, 26 Kps (93 fichas) y
 * el comprobador de 22 cationes × 22 aniones. Cada esperado se resolvió A MANO antes de abrir la
 * app, contra el texto de la propia app (sus tarjetas de reglas, su umbral de «soluble/poco
 * soluble/insoluble», sus Kps) y, donde hizo falta, contra PubChem (NLM):
 *   · Li₂CO₃: «1.3 g/100 mL» (ICSC 1109) y 1,31 % en masa a 20 °C (Kirk-Othmer, vía HSDB).
 *   · KClO₄: «15 g/l at 25 °C» (Ashford's, vía HSDB).
 *   · CaSO₄: «0.209 g/100 cc a 30 °C» (CRC Handbook, 71.ª ed., vía HSDB).
 * Masas molares con los pesos abreviados de la CIAAW (Li 6,94 · C 12,011 · O 15,999 · K 39,098 ·
 * Cl 35,45 · Ca 40,078 · S 32,06).
 *
 * Los casos marcados «HALLAZGO (14/11/2026, ABIERTO)» llevan test.fail(): afirman lo correcto y
 * hoy fallan. Cuando se reparen pasarán, test.fail() los pondrá en rojo y habrá que quitarlo y
 * cambiar «ABIERTO» por «REPARADO».
 * ════════════════════════════════════════════════════════════════════════════════════════════ */

const COMPROBADOR = 'section[aria-labelledby="titulo-comprobador"] [role="status"]';
const CONTADOR = 'p[role="status"]';

type Categoria = 'soluble' | 'poco' | 'insoluble';

/** La categoría que pinta la etiqueta del comprobador o de una ficha. */
function categoria(etiqueta: string): Categoria {
  if (/Poco soluble/.test(etiqueta)) return 'poco';
  if (/Insoluble/.test(etiqueta)) return 'insoluble';
  if (/Soluble/.test(etiqueta)) return 'soluble';
  throw new Error(`Etiqueta sin categoría: «${etiqueta}»`);
}

async function elegirPar(page: Page, cation: string, anion: string): Promise<void> {
  await page.selectOption('#selector-cation', cation);
  await esperarValorEnReact(page, '#selector-cation', cation);
  await page.selectOption('#selector-anion', anion);
  await esperarValorEnReact(page, '#selector-anion', anion);
}

interface Resultado {
  formula: string;
  estado: string;
  regla: string;
  texto: string;
}

async function resultado(page: Page): Promise<Resultado> {
  const region = page.locator(COMPROBADOR);
  const parrafos = (await region.locator('p').allTextContents()).map((t) => t.replace(/\s+/g, ' ').trim());
  return { formula: parrafos[0], estado: parrafos[1], regla: parrafos[2], texto: await region.innerText() };
}

async function contador(page: Page): Promise<string> {
  return ((await page.locator(CONTADOR).filter({ hasText: 'fichas' }).textContent()) ?? '').trim();
}

const SUPERINDICE: Record<string, string> = {
  '⁻': '-', '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9',
};

/** «1,6×10⁻² mol/L» → 0,016. */
function solubilidadMolar(texto: string): number {
  const m = texto.match(/([\d,]+)×10([⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+)\s*mol\/L/);
  if (!m) throw new Error(`Sin solubilidad molar en «${texto}»`);
  const exponente = Number([...m[2]].map((c) => SUPERINDICE[c]).join(''));
  return parseSpanishNumber(m[1]) * 10 ** exponente;
}

interface ObjetoLd {
  '@type'?: string;
  mainEntity?: { name: string; acceptedAnswer: { text: string } }[];
  featureList?: string[];
}

async function jsonLd(page: Page, tipo: string): Promise<ObjetoLd> {
  const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
  const objetos = bloques.map((b) => JSON.parse(b) as ObjetoLd);
  const encontrado = objetos.find((o) => o['@type'] === tipo);
  if (!encontrado) throw new Error(`No hay JSON-LD de tipo ${tipo}`);
  return encontrado;
}

test.describe('Comprobador de precipitación (inspector 14/11/2026)', () => {
  test.beforeEach(async ({ page }) => {
    await cargar(page);
  });

  test('CASO 1 (normal) · Ca²⁺ + PO₄³⁻ cruza las cargas, precipita y ajusta la ecuación', async ({ page }) => {
    // Por defecto, Ag⁺ + Cl⁻: AgCl, la excepción de los halogenuros (tarjeta «Cloruros, bromuros y
    // yoduros»: «AgCl (blanco) … insolubles»).
    let r = await resultado(page);
    expect(r.formula).toBe('AgCl');
    expect(r.estado).toBe('✕ Insoluble — precipita');
    expect(r.texto).toContain('AgNO₃(ac) + NaCl(ac) → AgCl(s)↓ + NaNO₃(ac)');
    expect(r.texto).toContain('Ag⁺ + Cl⁻ → AgCl(s)↓');

    // Ca²⁺ (2+) y PO₄³⁻ (3−): mcd 1 → Ca₃(PO₄)₂. Fosfatos insolubles salvo alcalinos y amonio.
    // Molecular con el nitrato y la sal de sodio: 3 Ca(NO₃)₂ + 2 Na₃PO₄ → Ca₃(PO₄)₂ + 6 NaNO₃
    // (Ca 3 = 3, NO₃ 6 = 6, Na 6 = 6, PO₄ 2 = 2).
    await elegirPar(page, 'Ca', 'PO4');
    r = await resultado(page);
    expect(r.formula).toBe('Ca₃(PO₄)₂');
    expect(r.estado).toBe('✕ Insoluble — precipita');
    expect(r.texto).toContain('3 Ca(NO₃)₂(ac) + 2 Na₃PO₄(ac) → Ca₃(PO₄)₂(s)↓ + 6 NaNO₃(ac)');
    expect(r.texto).toContain('3 Ca²⁺ + 2 PO₄³⁻ → Ca₃(PO₄)₂(s)↓');

    // Hg₂²⁺ es diatómico: Hg₂Cl₂, no HgCl. Hg₂(NO₃)₂ + 2 NaCl → Hg₂Cl₂ + 2 NaNO₃.
    await elegirPar(page, 'Hg2', 'Cl');
    r = await resultado(page);
    expect(r.formula).toBe('Hg₂Cl₂');
    expect(r.texto).toContain('Hg₂(NO₃)₂(ac) + 2 NaCl(ac) → Hg₂Cl₂(s)↓ + 2 NaNO₃(ac)');
    expect(r.texto).toContain('Hg₂²⁺ + 2 Cl⁻ → Hg₂Cl₂(s)↓');

    // Fe³⁺ + S²⁻: Fe₂S₃. 2 Fe(NO₃)₃ + 3 Na₂S → Fe₂S₃ + 6 NaNO₃ (Fe 2, NO₃ 6, Na 6, S 3).
    await elegirPar(page, 'Fe3', 'S');
    r = await resultado(page);
    expect(r.formula).toBe('Fe₂S₃');
    expect(r.texto).toContain('2 Fe(NO₃)₃(ac) + 3 Na₂S(ac) → Fe₂S₃(s)↓ + 6 NaNO₃(ac)');
    expect(r.texto).toContain('2 Fe³⁺ + 3 S²⁻ → Fe₂S₃(s)↓');

    // Na⁺ + Cl⁻: soluble y sin ecuación que escribir.
    await elegirPar(page, 'Na', 'Cl');
    r = await resultado(page);
    expect(r.formula).toBe('NaCl');
    expect(r.estado).toBe('✔ Soluble — no precipita');
    expect(r.texto).not.toContain('→');
    expect(r.texto).toContain('no hay ecuación iónica neta que escribir');
  });

  test('las excepciones que enuncian las tarjetas de reglas, una a una', async ({ page }) => {
    // Esperado: el texto de las tarjetas de la propia app (entre paréntesis, de cuál sale).
    // Fuera, a propósito, Li₂CO₃, KClO₄ y CaSO₄: los discute el hallazgo del umbral, más abajo.
    const casos: [string, string, Categoria, string][] = [
      ['Ba', 'SO4', 'insoluble', 'Sulfatos: «Insolubles: BaSO₄, SrSO₄, PbSO₄ y Hg₂SO₄»'],
      ['Sr', 'SO4', 'insoluble', 'Sulfatos'],
      ['Pb', 'SO4', 'insoluble', 'Sulfatos'],
      ['Hg2', 'SO4', 'insoluble', 'Sulfatos'],
      ['Ag', 'SO4', 'poco', 'Sulfatos: «Poco solubles: CaSO₄ (el yeso) y Ag₂SO₄»'],
      ['Pb', 'Cl', 'poco', 'Halogenuros: «PbCl₂ y PbBr₂ son poco solubles en frío»'],
      ['Pb', 'Br', 'poco', 'Halogenuros'],
      ['Pb', 'I', 'insoluble', 'Halogenuros: «PbI₂ es insoluble»'],
      ['Ag', 'I', 'insoluble', 'Halogenuros: «AgI (amarillo) son insolubles»'],
      ['Hg2', 'I', 'insoluble', 'Halogenuros: «Hg₂I₂ son insolubles»'],
      ['Ba', 'OH', 'soluble', 'Hidróxidos: «Solubles: … y Ba(OH)₂»'],
      ['Ca', 'OH', 'poco', 'Hidróxidos: «Parcialmente solubles: Ca(OH)₂»'],
      ['Sr', 'OH', 'poco', 'Hidróxidos: «… y Sr(OH)₂»'],
      ['Fe3', 'OH', 'insoluble', 'Hidróxidos: Fe(OH)₃ entre los ejemplos'],
      ['Mg', 'CrO4', 'soluble', 'Cromatos: «Solubles … y MgCrO₄»'],
      ['Ca', 'CrO4', 'poco', 'Cromatos: «CaCrO₄ y SrCrO₄ son poco solubles»'],
      ['Ag', 'F', 'soluble', 'Fluoruros: «Solubles … y AgF»'],
      ['Li', 'F', 'poco', 'Fluoruros: «salvo LiF, poco soluble»'],
      ['Ca', 'F', 'insoluble', 'Fluoruros: «CaF₂ (fluorita) … son insolubles»'],
      ['Li', 'PO4', 'insoluble', 'Fosfatos: «Li₃PO₄ es insoluble»'],
      ['Ag', 'CH3COO', 'poco', 'Acetatos: «AgCH₃COO, es solo poco soluble»'],
      ['Ag', 'NO2', 'poco', 'Nitritos: «AgNO₂ es poco soluble»'],
      ['Ag', 'Cr2O7', 'poco', 'Dicromatos: «Ag₂Cr₂O₇ es poco soluble»'],
      ['Ca', 'S', 'soluble', 'Sulfuros: «Los de alcalinotérreos (CaS, SrS, BaS) se disuelven»'],
      ['Ba', 'S', 'soluble', 'Sulfuros'],
      ['Cu', 'S', 'insoluble', 'Sulfuros: CuS, el ejemplo de la tarjeta'],
      ['Na', 'S', 'soluble', 'Alcalinos: K₂S entre los ejemplos'],
      ['NH4', 'PO4', 'soluble', 'Amonio: (NH₄)₃PO₄ entre los ejemplos'],
      ['Hg2', 'NO3', 'soluble', 'Nitratos: «todos los nitratos conocidos son solubles»'],
      ['Ag', 'SCN', 'insoluble', 'Kps de AgSCN, 1,0×10⁻¹²'],
    ];
    for (const [cation, anion, esperado, origen] of casos) {
      await elegirPar(page, cation, anion);
      const r = await resultado(page);
      expect.soft(categoria(r.estado), `${cation} + ${anion} (${origen})`).toBe(esperado);
    }
  });

  // REPARADO (4651): SCN fuera de ANIONES_INSOLUBLES, con regla propia; AgSCN insoluble y Pb(SCN)₂
  // poco soluble (CRC/Merck vía PubChem) como excepciones.
  test('HALLAZGO 4651 (REPARADO) · el tiocianato «precipitaba» con cualquier catión: Fe³⁺ + SCN⁻ daba «Fe(SCN)₃(s)↓»', async ({ page }) => {
    // SCN está en ANIONES_INSOLUBLES, pero ninguna de las 21 reglas de la tabla dice que los
    // tiocianatos sean insolubles, y la regla que imprime el comprobador («Los carbonatos,
    // fosfatos, cromatos, sulfuros, sulfitos, oxalatos, fluoruros, silicatos e hidróxidos…») no
    // los nombra. La propia ficha del ion tiocianato dice: «Con Fe³⁺ da un complejo rojo sangre
    // intenso: es el ensayo clásico para detectar hierro(III)», y la del Kps de AgSCN usa Fe³⁺
    // como indicador del método de Volhard. Antes: 16 de los 22 cationes «precipitaban» con SCN⁻.
    await elegirPar(page, 'Fe3', 'SCN');
    let r = await resultado(page);
    expect.soft(categoria(r.estado), 'Fe³⁺ + SCN⁻: complejo soluble según la ficha del ion').toBe('soluble');
    // Si el comprobador dice que precipita, la regla que imprime tiene que hablar del tiocianato
    await elegirPar(page, 'Mg', 'SCN');
    r = await resultado(page);
    expect.soft(categoria(r.estado) === 'soluble' || /tiocianat/i.test(r.regla), `Mg²⁺ + SCN⁻: «${r.regla}»`).toBe(true);
    for (const cation of ['Ba', 'Co', 'Zn', 'Al']) {
      await elegirPar(page, cation, 'SCN');
      r = await resultado(page);
      expect.soft(categoria(r.estado), `${cation} + SCN⁻`).toBe('soluble');
      expect.soft(r.regla, `${cation} + SCN⁻: la regla nombra a los tiocianatos`).toMatch(/tiocianat/i);
    }
    // Las excepciones: AgSCN (Kps 1,0×10⁻¹²) y Pb(SCN)₂ (CRC 88.ª ed.: 0,05 g/100 mL a 20 °C).
    await elegirPar(page, 'Ag', 'SCN');
    expect.soft(categoria((await resultado(page)).estado), 'Ag + SCN⁻').toBe('insoluble');
    await elegirPar(page, 'Pb', 'SCN');
    expect.soft(categoria((await resultado(page)).estado), 'Pb + SCN⁻').toBe('poco');
  });

  test('HALLAZGO 4652 (REPARADO) · Sr²⁺ + CrO₄²⁻ salía «Insoluble», y la tarjeta Cromatos dice «poco soluble»', async ({ page }) => {
    // Tarjeta «Cromatos», excepciones: «CaCrO₄ y SrCrO₄ son poco solubles». EXCEPCIONES tenía
    // 'Ca|CrO4' y no 'Sr|CrO4'.
    await elegirPar(page, 'Sr', 'CrO4');
    expect(categoria((await resultado(page)).estado)).toBe('poco');
  });

  test('HALLAZGO 4653 (REPARADO) · Hg₂²⁺ + CH₃COO⁻ salía «Soluble», y la tarjeta Acetatos dice «poco soluble»', async ({ page }) => {
    // Tarjeta «Acetatos», excepciones: «El acetato de mercurio(I) también es poco soluble».
    // EXCEPCIONES no tenía 'Hg2|CH3COO'.
    await elegirPar(page, 'Hg2', 'CH3COO');
    expect(categoria((await resultado(page)).estado)).toBe('poco');
  });

  test('HALLAZGO (14/11/2026, ABIERTO) · el umbral que declara la app contradice sus propias clasificaciones', async ({ page }) => {
    // La guía declara: «soluble: más de 0,1 mol/L · poco soluble: entre 0,01 y 0,1 mol/L ·
    // insoluble: menos de 0,01 mol/L». Con las cifras de la PROPIA app:
    //   · Li₂CO₃ «unos 13 g/L» ÷ 73,888 g/mol = 0,176 mol/L → soluble (PubChem: 1,3 g/100 mL).
    //   · KClO₄ «Kps ≈ 1,05×10⁻²» → s = √Kps = 0,102 mol/L → soluble (PubChem: 15 g/L a 25 °C
    //     ÷ 138,55 g/mol = 0,108 mol/L).
    //   · CaSO₄ «s = 7,0×10⁻³ mol/L» → insoluble, y su ficha dice «Con solo 7 mmol/L es el caso
    //     típico de «poco soluble»» (PubChem/CRC: 0,209 g/100 mL ÷ 136,14 = 15 mmol/L, que sí es
    //     poco soluble). Hoy las tres salen «Poco soluble».
    // Si se cambia la forma del umbral, este caso deja de poder medirlo y pasa: revisarlo.
    test.fail();
    const cuerpo = (await page.locator('body').textContent()) ?? '';
    const alto = cuerpo.match(/soluble: más de ([\d,]+) mol\/L/);
    const bajo = cuerpo.match(/insoluble: menos de ([\d,]+) mol\/L/);
    if (!alto || !bajo) return;
    const umbralAlto = parseSpanishNumber(alto[1]);
    const umbralBajo = parseSpanishNumber(bajo[1]);
    const segunUmbral = (s: number): Categoria => (s > umbralAlto ? 'soluble' : s < umbralBajo ? 'insoluble' : 'poco');

    const casos: [string, string, number][] = [
      ['Li', 'CO3', 13 / 73.888],
      ['K', 'ClO4', Math.sqrt(1.05e-2)],
      ['Ca', 'SO4', 7.0e-3],
    ];
    for (const [cation, anion, s] of casos) {
      await elegirPar(page, cation, anion);
      expect.soft(categoria((await resultado(page)).estado), `${cation} + ${anion}: s = ${s.toPrecision(3)} mol/L`).toBe(
        segunUmbral(s),
      );
    }
  });

  test('HALLAZGO (14/11/2026, ABIERTO) · la característica «iónica completa de cada precipitación» que el comprobador no da', async ({ page }) => {
    // featureList del JSON-LD: «Ecuación molecular, iónica completa e iónica neta de cada
    // precipitación». El comprobador (el que resuelve «cada precipitación») solo escribe
    // «Molecular» e «Iónica neta»; la iónica completa solo está en los 21 ejemplos fijos.
    test.fail();
    const app = await jsonLd(page, 'WebApplication');
    const promete = (app.featureList ?? []).some((f) => /iónica completa/.test(f) && /cada precipitación/.test(f));
    await elegirPar(page, 'Ca', 'PO4');
    const texto = (await resultado(page)).texto;
    expect(!promete || /Iónica completa/i.test(texto)).toBe(true);
  });
});

test.describe('Buscador y filtros (inspector 14/11/2026)', () => {
  test.beforeEach(async ({ page }) => {
    await cargar(page);
  });

  test('los filtros cuentan 21 / 46 / 26 / 93 fichas y marcan el activo con aria-pressed', async ({ page }) => {
    // Contadas a mano en page.tsx: REGLAS 11 solubles + 10 insolubles = 21; IONES 46; KPS 26.
    expect(await contador(page)).toBe('93 de 93 fichas');
    const filtros: [string, string][] = [
      ['Reglas de solubilidad', '21 de 93 fichas'],
      ['Iones poliatómicos', '46 de 93 fichas'],
      ['Productos de solubilidad (Kps)', '26 de 93 fichas'],
      ['Todas', '93 de 93 fichas'],
    ];
    for (const [nombre, esperado] of filtros) {
      const boton = page.getByRole('button', { name: nombre, exact: true });
      await boton.click();
      await expect(boton).toHaveAttribute('aria-pressed', 'true');
      expect(await contador(page)).toBe(esperado);
      expect(
        await page.locator('section[aria-label="Buscador de la tabla de solubilidad"] button[aria-pressed="true"]').count(),
      ).toBe(1);
    }
  });

  test('CASO 2 (límite) · tildes, mayúsculas y cargas: «hidróxido» = «hidroxido» = «HIDRÓXIDO», «NH4+» = «NH₄⁺»', async ({ page }) => {
    // Las que contienen «hidroxido» en su texto indexado: la regla Hidróxidos, los iones
    // hidróxido, tetrahidroxidoaluminato y tetrahidroxidocromato, y los seis Kps de hidróxidos.
    const hidroxidos = [
      'hidroxidos', 'ion-hidroxido', 'ion-aluminato', 'ion-cromito',
      'kps-caoh2', 'kps-cuoh2', 'kps-feoh2', 'kps-feoh3', 'kps-mgoh2', 'kps-aloh3',
    ];
    for (const termino of ['hidróxido', 'hidroxido', 'HIDRÓXIDO']) {
      await buscar(page, termino);
      expect.soft(await fichas(page), termino).toEqual(hidroxidos);
      expect.soft(await contador(page), termino).toBe('10 de 93 fichas');
    }
    // «NH₄⁺» solo está en la regla del amonio y en la ficha del ion
    for (const termino of ['NH4+', 'NH₄⁺']) {
      await buscar(page, termino);
      expect.soft(await fichas(page), termino).toEqual(['amonio', 'ion-amonio']);
    }
  });

  test('un filtro que deja la lista vacía: «AgCl» en Iones da 0 fichas y el aviso', async ({ page }) => {
    await buscar(page, 'AgCl');
    await page.getByRole('button', { name: 'Iones poliatómicos', exact: true }).click();
    expect(await contador(page)).toBe('0 de 93 fichas');
    await expect(page.getByText('No hay ninguna ficha que coincida con «AgCl»')).toBeVisible();
  });

  test('CASO 3 (rechazo) · «xyzzy» da 0 de 93 y el aviso; «Limpiar» vuelve a las 93', async ({ page }) => {
    await buscar(page, 'xyzzy');
    expect(await fichas(page)).toEqual([]);
    expect(await contador(page)).toBe('0 de 93 fichas');
    await expect(page.getByText('No hay ninguna ficha que coincida con «xyzzy»')).toBeVisible();
    await page.getByRole('button', { name: 'Limpiar' }).click();
    await esperarValorEnReact(page, BUSCADOR, '');
    expect(await contador(page)).toBe('93 de 93 fichas');
  });

  test('las filas se despliegan con aria-expanded y su detalle existe', async ({ page }) => {
    const fila = page.locator('button[aria-controls="detalle-kps-caf2"]');
    await expect(fila).toHaveAttribute('aria-expanded', 'false');
    await fila.click();
    await expect(fila).toHaveAttribute('aria-expanded', 'true');
    // CaF₂: Kps 3,9×10⁻¹¹ = 4s³ → s = ∛(9,75×10⁻¹²) = 2,14×10⁻⁴ mol/L
    await expect(page.locator('#detalle-kps-caf2')).toContainText('s = ∛(Kps/4) = 2,1×10⁻⁴ mol/L');
    await fila.click();
    await expect(fila).toHaveAttribute('aria-expanded', 'false');
  });

  test('HALLAZGO (14/11/2026, ABIERTO) · «sulfato de bario» pierde la regla Sulfatos que «sulfato bario» sí muestra', async ({ page }) => {
    // El modo fórmulas busca cada palabra como subcadena, también «de»: el texto indexado de la
    // regla Sulfatos y de la ficha del ion sulfato no contiene «de», así que la preposición los
    // saca. Hoy: «sulfato bario» → sulfatos, ion-sulfato, kps-baso4; «sulfato de bario» → solo
    // kps-baso4. Igual con «sulfato de calcio» (la regla que dice «Poco solubles: CaSO₄»).
    test.fail();
    for (const termino of ['sulfato de bario', 'sulfato de calcio']) {
      await buscar(page, termino);
      expect.soft(await fichas(page), termino).toContain('sulfatos');
    }
  });

  test('HALLAZGO (14/11/2026, ABIERTO) · la ayuda dice que «producto de solubilidad» encuentra los Kps, y da uno de 26', async ({ page }) => {
    // Ayuda bajo el buscador: «producto de solubilidad encuentra los Kps». Solo la busqueda de
    // AgCl lleva esa frase. Esperado: las mismas fichas de Kps que «kps» (26). Hoy: kps-agcl.
    test.fail();
    await buscar(page, 'kps');
    const kps = (await fichas(page)).filter((f) => f.startsWith('kps-'));
    expect(kps).toHaveLength(26);
    await buscar(page, 'producto de solubilidad');
    expect((await fichas(page)).filter((f) => f.startsWith('kps-'))).toEqual(kps);
  });
});

test.describe('Textos frente a los datos (inspector 14/11/2026)', () => {
  test.beforeEach(async ({ page }) => {
    await cargar(page);
  });

  test('HALLAZGO (14/11/2026, ABIERTO) · la pregunta del precipitado está en las dos FAQ con respuestas distintas', async ({ page }) => {
    // FAQPage: «¿Cómo se sabe si dos disoluciones forman un precipitado al mezclarlas?» (con el
    // ejemplo AgNO₃ + NaCl). FAQ visible: «¿Cómo sé si al mezclar dos disoluciones se forma un
    // precipitado?» (con «si las dos son solubles, no hay reacción»). Una sola constante.
    test.fail();
    const faq = await jsonLd(page, 'FAQPage');
    const ld = (faq.mainEntity ?? []).find((q) => /precipitado/.test(q.name) && /mezcl/.test(q.name));
    const visible = await page
      .locator('h4', { hasText: /mezclar dos disoluciones/ })
      .locator('xpath=following-sibling::p[1]')
      .textContent();
    const normal = (t: string | null | undefined): string => (t ?? '').replace(/\s+/g, ' ').trim();
    expect(normal(ld?.acceptedAnswer.text)).toBe(normal(visible));
  });

  test('HALLAZGO (14/11/2026, ABIERTO) · la FAQPage dice «todos los … percloratos» y «todas las sales de metales alcalinos (Li…)» solubles', async ({ page }) => {
    // Primera respuesta del FAQPage. El comprobador dice KClO₄ «Poco soluble» y Li₂CO₃ «Poco
    // soluble», y la quinta respuesta del mismo FAQPage llama al carbonato de litio «poco soluble».
    test.fail();
    const faq = await jsonLd(page, 'FAQPage');
    const reglas = (faq.mainEntity ?? [])[0]?.acceptedAnswer.text ?? '';
    await elegirPar(page, 'K', 'ClO4');
    const kclo4 = categoria((await resultado(page)).estado);
    expect.soft(!/todos los nitratos, acetatos, cloratos y percloratos/.test(reglas) || kclo4 === 'soluble').toBe(true);
    await elegirPar(page, 'Li', 'CO3');
    const li2co3 = categoria((await resultado(page)).estado);
    expect.soft(!/todas las sales de metales alcalinos \(Li/.test(reglas) || li2co3 === 'soluble').toBe(true);
  });

  test('HALLAZGO (14/11/2026, ABIERTO) · tres frases que la propia tabla desmiente', async ({ page }) => {
    // 1. Ficha Kps de Ca(OH)₂: «Es el «insoluble» más soluble de la tabla» — el PbCl₂ de la misma
    //    tabla tiene s = 1,6×10⁻² mol/L, más que los 1,1×10⁻² del Ca(OH)₂.
    // 2. Ficha del ion fosfato: «carga 3−, la más alta de la tabla junto con arseniato y borato» —
    //    el fosfito PO₃³⁻ y el arsenito AsO₃³⁻ de la misma tabla también son −3.
    // 3. FAQ visible: «Con seis ideas se resuelve…» y enumera cinco, separadas por «;».
    test.fail();

    const filasKps = page.locator('button[aria-controls^="detalle-kps-"]');
    const solubilidades = await filasKps.evaluateAll((els) =>
      els.map((b) => [(b.getAttribute('aria-controls') ?? '').replace('detalle-kps-', ''), b.textContent ?? ''] as const),
    );
    const masSoluble = solubilidades
      .map(([id, texto]) => ({ id, s: solubilidadMolar(texto) }))
      .reduce((a, b) => (b.s > a.s ? b : a));
    await page.locator('button[aria-controls="detalle-kps-caoh2"]').click();
    const notaCaOH2 = (await page.locator('#detalle-kps-caoh2').textContent()) ?? '';
    if (/más soluble de la tabla/.test(notaCaOH2)) expect.soft(masSoluble.id, 'el «insoluble» más soluble').toBe('caoh2');

    const conMenosTres = await page
      .locator('button[aria-controls^="detalle-ion-"]')
      .evaluateAll((els) =>
        els
          .filter((b) => /Carga −3/.test(b.textContent ?? ''))
          .map((b) => (b.getAttribute('aria-controls') ?? '').replace('detalle-ion-', '')),
      );
    await page.locator('button[aria-controls="detalle-ion-fosfato"]').click();
    const notaFosfato = (await page.locator('#detalle-ion-fosfato').textContent()) ?? '';
    if (/junto con arseniato y borato/.test(notaFosfato)) {
      expect.soft(conMenosTres, 'iones −3 de la tabla').toEqual(['fosfato', 'arseniato', 'borato']);
    }

    const memorizar = await page
      .locator('h4', { hasText: '¿Hay que memorizar toda la tabla de solubilidad?' })
      .locator('xpath=following-sibling::p[1]')
      .textContent();
    const m = (memorizar ?? '').replace(/\s+/g, ' ').match(/Con (\w+) ideas[^:]*:(.*?)\. El resto/);
    const numeros: Record<string, number> = { cuatro: 4, cinco: 5, seis: 6, siete: 7 };
    if (m) expect.soft(m[2].split(';').length, `«Con ${m[1]} ideas»`).toBe(numeros[m[1]]);
  });
});

test.describe('móvil · Pixel 7 (inspector 14/11/2026)', () => {
  const PIXEL_7 = devices['Pixel 7'];
  test.use({
    viewport: PIXEL_7.viewport,
    userAgent: PIXEL_7.userAgent,
    deviceScaleFactor: PIXEL_7.deviceScaleFactor,
    isMobile: true,
    hasTouch: true,
  });

  test('la ecuación más larga no desborda la página y la tabla del bloque educativo se desplaza', async ({ page }) => {
    await cargar(page);
    await elegirPar(page, 'Ca', 'PO4');
    await expect(page.locator(COMPROBADOR)).toContainText('3 Ca(NO₃)₂(ac) + 2 Na₃PO₄(ac) → Ca₃(PO₄)₂(s)↓ + 6 NaNO₃(ac)');
    const pagina = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      ancho: document.documentElement.clientWidth,
    }));
    expect(pagina.scroll).toBeLessThanOrEqual(pagina.ancho);

    // Los selectores se apilan: el de aniones queda debajo del de cationes
    const cation = await page.locator('#selector-cation').boundingBox();
    const anion = await page.locator('#selector-anion').boundingBox();
    expect(anion!.y).toBeGreaterThan(cation!.y + cation!.height);

    // La tabla de cuatro columnas es más ancha que la pantalla: se lee desplazando su envoltorio
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const tabla = await page.evaluate(() => {
      const t = document.querySelector('table');
      const envoltorio = t?.parentElement;
      if (!t || !envoltorio) return null;
      envoltorio.scrollLeft = 10000;
      return {
        anchoTabla: t.scrollWidth,
        anchoEnvoltorio: envoltorio.clientWidth,
        desplazado: envoltorio.scrollLeft,
        paginaScroll: document.documentElement.scrollWidth,
        paginaAncho: document.documentElement.clientWidth,
      };
    });
    expect(tabla).not.toBeNull();
    expect(tabla!.anchoTabla).toBeGreaterThan(tabla!.anchoEnvoltorio);
    expect(tabla!.desplazado).toBeGreaterThan(0);
    expect(tabla!.paginaScroll).toBeLessThanOrEqual(tabla!.paginaAncho);
  });
});
