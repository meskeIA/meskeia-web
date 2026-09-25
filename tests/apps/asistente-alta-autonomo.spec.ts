import { test, expect, Page, Locator } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';
import { TARIFA_PLANA_2025 } from '../../data/fiscal/autonomos';
import { SMI_2026 } from '../../data/fiscal/smi';
import { AUTONOMO_SOCIETARIO_2025 } from '../../data/fiscal/sociedades';

/**
 * asistente-alta-autonomo — generado por /inspector el 24/09/2026.
 *
 * QUÉ PROMETE LA APP
 * ──────────────────
 * «Guía completa para darte de alta como trabajador autónomo en España. Checklist interactivo
 * con todos los trámites y calculadora de cuota.» Desde el 24/09/2026 la calculadora pide los
 * rendimientos netos mensuales (opcional) y con ellos sitúa al usuario en su tramo de
 * TRAMOS_RETA_2025; ofrece cuatro bases (mínima y máxima DEL TRAMO, «intermedia» de 1.200 €
 * acotada al tramo, y personalizada) y calcula cuota = base × tipo, con la tarifa plana como
 * alternativa en «Primera alta» o en pluriactividad con primera alta. Sin rendimientos, la
 * horquilla es la general [653,59 ; 5.101,20], que es lo que miden los CASOS 1-3.
 *
 * DE DÓNDE SALE CADA CIFRA — de `data/fiscal`, NO de lo que devuelve la app
 * ───────────────────────────────────────────────────────────────────────────
 *   · data/fiscal/autonomos.ts (vigencia 2026, RDL 13/2022 + Orden PJC/297/2026, art. 18):
 *       BASES_RETA_2025.minima = 653,59 € (base mínima del tramo 1 de 2026, pese al nombre)
 *       BASES_RETA_2025.maxima = 5.101,20 €
 *       TIPO_COTIZACION_RETA   = 31,50 %
 *       TARIFA_PLANA_2025      = 80 €/mes durante 12 meses
 *   · Gestoría 50-150 €/mes y seguro RC 150-500 €/año: rangos orientativos de la propia app
 *     (no son dato normativo), solo intervienen en el total anual.
 *
 * ⚠️ es-ES NO agrupa las cifras de cuatro dígitos (minimumGroupingDigits = 2): «1510,57 €»
 * sin punto y «18.322,54 €» con él. Es el formateador compartido, no un defecto de la app.
 *
 * REGRESIONES: al final, una por hallazgo reparado el 24/09/2026 (1370-1377), con la fuente
 * de cada valor esperado en su comentario.
 *
 * REINSPECCIÓN 25/09/2026 — tabla de tramos cotejada contra el texto del BOE
 * (Orden PJC/297/2026, art. 18, BOE-A-2026-7296):
 *   tabla reducida: ≤ 670 · > 670 y ≤ 900 · > 900 y < 1.166,70
 *   tabla general:  ≥ 1.166,70 y ≤ 1.300 · > 1.300 y ≤ 1.500 · … · > 4.050 y ≤ 6.000 · > 6.000
 * Es decir: todas las fronteras cierran por arriba (≤) MENOS la de 1.166,70, que pertenece al
 * tramo SIGUIENTE (el primero de la tabla general, tramo 4 de TRAMOS_RETA_2025).
 * Los casos con `test.fail()` vigilan hallazgos abiertos del acta del 25/09/2026.
 */

const RUTA = '/asistente-alta-autonomo/';

const ESPACIO_DURO = new RegExp(String.fromCharCode(160), 'g');
const limpiar = (s: string) => s.replace(ESPACIO_DURO, ' ').replace(/\s+/g, ' ').trim();

async function texto(loc: Locator): Promise<string> {
  return limpiar(await loc.innerText());
}

/** Importe (el <strong>) de una fila del resultado de la cuota, por su etiqueta. */
function filaCuota(page: Page, etiqueta: string): Locator {
  return page.locator('[class*="cuotaItem"]').filter({ hasText: etiqueta }).locator('strong');
}

/** Importe de una fila del desglose de costes anuales, por su etiqueta. */
function filaCoste(page: Page, etiqueta: string): Locator {
  return page.locator('[class*="costeItem"]').filter({ hasText: etiqueta }).locator('[class*="costeValor"]');
}

const ahorro = (page: Page) => page.locator('[class*="cuotaAhorro"] strong');
const campoPersonalizado = (page: Page) =>
  page.getByRole('textbox', { name: 'Base de cotización personalizada' });

async function abrirCostes(page: Page): Promise<void> {
  await page.getByRole('button', { name: /Cuota y Costes/ }).click();
  await expect(page.getByRole('heading', { name: /Calculadora de Cuota Autónomo/ })).toBeVisible();
}

async function elegirBase(page: Page, valor: 'minima' | 'media' | 'maxima' | 'personalizada'): Promise<void> {
  await page.locator(`input[name="baseElegida"][value="${valor}"]`).check();
}

/** Escribe en la base personalizada, espera a React y (opcional) sale del campo. */
async function escribirBase(page: Page, valor: string): Promise<Locator> {
  const campo = campoPersonalizado(page);
  await campo.fill(valor);
  await esperarValorEnReact(page, campo, valor);
  return campo;
}

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Asistente Alta Autónomo');
  // Testigo: la casilla «Tengo o tendré local/oficina» existe desde la carga.
  await esperarHidratacion(page, ['input[type="checkbox"]']);
});

// ─────────────────────────────────────────────────────────────────────────────
test('CASO 1 · normal: primera alta con base mínima, y base personalizada «1.500»', async ({ page }) => {
  await abrirCostes(page);

  // Por defecto: base mínima y «Primera alta».
  //   cuota = 653,59 × 31,50 % = 205,880850 → 205,88 €
  //   ahorro primer año = (205,880850 − 80) × 12 = 1.510,5702 → 1510,57 €
  //   cuota anual con tarifa plana = 80 × 12 = 960,00 €
  //   total anual = 960 + 50×12 + 150 = 1710,00 € ... 960 + 150×12 + 500 = 3260,00 €
  await expect(filaCuota(page, 'Base de cotización elegida').first()).toHaveText(/653,59\s€/);
  expect(await texto(filaCuota(page, 'Tipo de cotización'))).toBe('31,50%');
  expect(await texto(filaCuota(page, 'Cuota mensual normal'))).toBe('205,88 €');
  expect(await texto(filaCuota(page, 'Con tarifa plana'))).toBe('80,00 €/mes');
  expect(await texto(ahorro(page))).toBe('1510,57 €');
  expect(await texto(filaCoste(page, 'Cuota autónomo (anual)'))).toBe('960,00 €');
  expect(await texto(filaCoste(page, 'Total anual estimado'))).toBe('1710,00 € - 3260,00 €');

  // «1.500» con punto de millar debe leerse como mil quinientos (parseSpanishNumber).
  //   cuota = 1.500 × 31,50 % = 472,50 €
  //   ahorro = (472,50 − 80) × 12 = 4710,00 €
  await elegirBase(page, 'personalizada');
  const campo = await escribirBase(page, '1.500');
  await campo.blur();
  await expect(campo).toHaveValue('1.500');
  expect(await texto(filaCuota(page, 'Base de cotización elegida'))).toBe('1500,00 €');
  expect(await texto(filaCuota(page, 'Cuota mensual normal'))).toBe('472,50 €');
  expect(await texto(ahorro(page))).toBe('4710,00 €');
});

// ─────────────────────────────────────────────────────────────────────────────
test('CASO 2 · límites: base máxima, y la personalizada se acota a [653,59 ; 5.101,20]', async ({ page }) => {
  await abrirCostes(page);

  // Base máxima: 5.101,20 × 31,50 % = 1.606,878 → 1606,88 €
  // (coincide con cuotaMaxima del tramo 15 de TRAMOS_RETA_2025)
  //   ahorro = (1.606,878 − 80) × 12 = 18.322,536 → 18.322,54 €
  await elegirBase(page, 'maxima');
  expect(await texto(filaCuota(page, 'Base de cotización elegida'))).toBe('5101,20 €');
  expect(await texto(filaCuota(page, 'Cuota mensual normal'))).toBe('1606,88 €');
  expect(await texto(ahorro(page))).toBe('18.322,54 €');

  // 9.000 € supera la base máxima: al salir del campo se acota a 5.101,20 → 1606,88 €
  await elegirBase(page, 'personalizada');
  let campo = await escribirBase(page, '9000');
  await campo.blur();
  await expect(campo).toHaveValue('5101.2');
  expect(await texto(filaCuota(page, 'Base de cotización elegida'))).toBe('5101,20 €');
  expect(await texto(filaCuota(page, 'Cuota mensual normal'))).toBe('1606,88 €');

  // 500 € queda por debajo de la base mínima: al salir se acota a 653,59 → 205,88 €
  campo = await escribirBase(page, '500');
  await campo.blur();
  await expect(campo).toHaveValue('653.59');
  expect(await texto(filaCuota(page, 'Base de cotización elegida'))).toBe('653,59 €');
  expect(await texto(filaCuota(page, 'Cuota mensual normal'))).toBe('205,88 €');
});

// ─────────────────────────────────────────────────────────────────────────────
test('CASO 3 · entradas que no son una base: negativa, texto y vacío acaban en la base mínima', async ({ page }) => {
  await abrirCostes(page);
  await elegirBase(page, 'personalizada');

  // −100: al salir del campo se acota a la base mínima → 653,59 € y 205,88 €
  let campo = await escribirBase(page, '-100');
  await campo.blur();
  await expect(campo).toHaveValue('653.59');
  expect(await texto(filaCuota(page, 'Cuota mensual normal'))).toBe('205,88 €');

  // Texto: el control rechaza las letras, el campo se queda vacío y la app cae a la base
  // mínima (parseSpanishNumber('') → NaN → || BASES_RETA_2025.minima) → 205,88 €
  await campo.fill('');
  await esperarValorEnReact(page, campo, '');
  await campo.pressSequentially('abc');
  await expect(campo).toHaveValue('');
  expect(await texto(filaCuota(page, 'Base de cotización elegida'))).toBe('653,59 €');
  expect(await texto(filaCuota(page, 'Cuota mensual normal'))).toBe('205,88 €');
  expect(await texto(ahorro(page))).toBe('1510,57 €');
});

// ─────────────────────────────────────────────────────────────────────────────
// REGRESIONES DE LOS HALLAZGOS REPARADOS (24/09/2026)
// ─────────────────────────────────────────────────────────────────────────────

test('REGRESIÓN 1375 · con el foco en el campo, una base negativa NO publica una cuota negativa', async ({ page }) => {
  // Antes, hasta el blur la app calculaba con el valor crudo: «-100» → cuota −31,50 € y
  // «Ahorro primer año: -1338,00 €». Ahora la base se acota a la horquilla también con el
  // foco puesto: −100 → 653,59 € (base mínima del tramo 1) → 205,88 € y ahorro 1510,57 €.
  await abrirCostes(page);
  await elegirBase(page, 'personalizada');
  await escribirBase(page, '-100');
  await expect(campoPersonalizado(page)).toBeFocused();
  expect(await texto(filaCuota(page, 'Cuota mensual normal'))).toBe('205,88 €');
  expect(await texto(ahorro(page))).toBe('1510,57 €');
  // Y por arriba: 9.000 con el foco → 5.101,20 → 1606,88 €
  await escribirBase(page, '9000');
  expect(await texto(filaCuota(page, 'Cuota mensual normal'))).toBe('1606,88 €');
});

test('REGRESIÓN 1371 · pluriactividad en primera alta conserva la tarifa plana', async ({ page }) => {
  // Art. 38 ter de la Ley 20/2007: la cuota reducida es para quien causa alta inicial (o sin
  // alta en los 2 años anteriores), sin excluir a quien además trabaja por cuenta ajena.
  //   Con «primera alta» marcada (por defecto): 80,00 €/mes y cuota anual 80 × 12 = 960,00 €
  //   Sin ella: sin tarifa plana, cuota anual 653,59 × 31,50 % × 12 = 2.470,5702 → 2470,57 €
  await page.getByRole('button', { name: /Mis Datos/ }).click();
  await page.locator('input[name="situacionLaboral"][value="pluriactividad"]').check();
  const primeraAlta = page.getByRole('checkbox', { name: /Es mi primera alta como autónomo/ });
  await expect(primeraAlta).toBeChecked();
  await expect(page.getByText('¡Puedes solicitar la tarifa plana!')).toBeVisible();
  await abrirCostes(page);
  await expect(filaCuota(page, 'Con tarifa plana')).toHaveText(/80,00\s€\/mes/);
  expect(await texto(filaCoste(page, 'Cuota autónomo (anual)'))).toBe('960,00 €');

  await page.getByRole('button', { name: /Mis Datos/ }).click();
  await primeraAlta.uncheck();
  await abrirCostes(page);
  await expect(filaCuota(page, 'Con tarifa plana')).toHaveCount(0);
  expect(await texto(filaCoste(page, 'Cuota autónomo (anual)'))).toBe('2470,57 €');
});

test('REGRESIÓN 1370 · los epígrafes de la lista llevan el literal del catálogo oficial del IAE', async ({ page }) => {
  // El literal de cada epígrafe sale de public/datos/cnae-iae-catalogo.json (el catálogo que
  // publica data/fiscal/cnae-iae.ts, RDL 1175/1990), buscado por SECCIÓN y código: el mismo
  // número es otra actividad en otra sección. Se coteja cada botón contra ese JSON.
  const respuesta = await page.request.get('/datos/cnae-iae-catalogo.json');
  expect(respuesta.ok()).toBe(true);
  const catalogo = (await respuesta.json()) as { iae: { seccion: string; codigo: string; titulo: string }[] };

  await page.getByRole('button', { name: /Mis Datos/ }).click();
  await page.getByRole('button', { name: 'Ver epígrafes IAE frecuentes' }).click();
  const botones = page.locator('button[class*="epigrafeItem"]');
  await expect(botones.first()).toBeVisible();
  const n = await botones.count();
  expect(n).toBeGreaterThanOrEqual(15);
  for (let i = 0; i < n; i++) {
    const boton = botones.nth(i);
    const seccion = await boton.getAttribute('data-seccion');
    const codigo = await texto(boton.locator('[class*="epigrafeCodigo"]'));
    const oficial = catalogo.iae.find(e => e.seccion === seccion && e.codigo === codigo);
    expect(oficial, `${seccion} ${codigo} no está en el catálogo`).toBeTruthy();
    const titulo = oficial!.titulo;
    const esperado = titulo.charAt(0).toUpperCase() + titulo.slice(1);
    expect(await texto(boton.locator('[class*="epigrafeDesc"]'))).toContain(esperado);
  }

  // 763 de la sección 2.ª = «Programadores y Analistas de Informática» (antes la lista lo
  // daba como «Programadores, informáticos» y el caso de Pedro, como «Publicidad y RRPP»)
  await botones.filter({ hasText: 'Programadores y Analistas de Informática' }).click();
  await expect(page.getByPlaceholder('Ej: 763')).toHaveValue('763');
  await expect(page.getByPlaceholder('Ej: Programación informática')).toHaveValue('Programadores y Analistas de Informática');
  await expect(page.getByText('Sección 2ª de las Tarifas del IAE')).toBeVisible();
});

test('REGRESIÓN 1372 · los rendimientos netos sitúan la cuota en su tramo de 2026', async ({ page }) => {
  // TRAMOS_RETA_2025 (tabla 2026, Orden PJC/297/2026 art. 18): 1.600 €/mes cae en el tramo 6
  // (más de 1.500 y hasta 1.700), base entre 960,78 y 1.700,00 €.
  //   base mínima: 960,78 × 31,50 % = 302,6457 → 302,65 €
  //   base máxima: 1.700 × 31,50 % = 535,50 €
  //   personalizada 5.000 → se acota a 1.700 → 535,50 €
  await abrirCostes(page);
  const rendimientos = page.getByRole('textbox', { name: 'Rendimientos netos mensuales previstos' });
  await rendimientos.fill('1.600');
  await esperarValorEnReact(page, rendimientos, '1.600');
  await expect(page.locator('strong', { hasText: 'Tramo 6' })).toBeVisible();
  expect(await texto(filaCuota(page, 'Base de cotización elegida'))).toBe('960,78 €');
  expect(await texto(filaCuota(page, 'Cuota mensual normal'))).toBe('302,65 €');

  await elegirBase(page, 'maxima');
  expect(await texto(filaCuota(page, 'Base de cotización elegida'))).toBe('1700,00 €');
  expect(await texto(filaCuota(page, 'Cuota mensual normal'))).toBe('535,50 €');

  await elegirBase(page, 'personalizada');
  await escribirBase(page, '5000');
  expect(await texto(filaCuota(page, 'Cuota mensual normal'))).toBe('535,50 €');
});

test('REGRESIÓN 1373 · la SL tributa con la escala de micropymes y el 15 % de nueva creación', async ({ page }) => {
  // data/fiscal/sociedades.ts: TIPOS_IS_2025.general 25 %, nuevaCreacion 15 %,
  // TRAMOS_IS_MICROPYMES_2026 = 19 % hasta 50.000 € y 21 % en el resto
  await abrirCostes(page);
  const fila = page.locator('table tr').filter({ hasText: 'Fiscalidad' });
  const t = await texto(fila);
  expect(t).toContain('25 % general');
  expect(t).toContain('19 % hasta 50.000 €');
  expect(t).toContain('21 % en el resto');
  expect(t).toContain('15 % los dos primeros ejercicios');
  expect(t).not.toContain('IS fijo');
});

test('REGRESIÓN 1374 · un solo plazo para el alta en el RETA y la prórroga ligada al SMI', async ({ page }) => {
  // Art. 32.3 RD 84/1996: el alta de autónomos se solicita «con carácter previo» al inicio de
  // la actividad, dentro de los 60 días naturales anteriores. Art. 38 ter.2 Ley 20/2007: la
  // prórroga de la tarifa plana depende de que los rendimientos no lleguen al SMI.
  const cuerpo = limpiar((await page.locator('body').textContent()) ?? '');
  expect(cuerpo).not.toContain('tras Hacienda');
  expect(cuerpo).not.toContain('siguientes al alta en Hacienda');
  expect(cuerpo).not.toContain('desde el inicio de la actividad para darte');
  expect(cuerpo).not.toContain('si su comunidad tiene extensión');
  expect(cuerpo).toContain('hasta 60 días antes del inicio');
  const jsonLd = (await page.locator('script[type="application/ld+json"]').allTextContents()).join(' ');
  expect(jsonLd).not.toContain('30 días hábiles');
  expect(jsonLd).toContain('60 días naturales de antelación');
});

// ─────────────────────────────────────────────────────────────────────────────
// Sospechas del Inspector reparadas el 24/09/2026 — cotejadas en el BOE ese día.
// ─────────────────────────────────────────────────────────────────────────────

test('24/09 · colaborador familiar: sin tarifa plana (art. 38 ter.11) y con la bonificación del art. 35', async ({ page }) => {
  await page.getByRole('button', { name: /Mis Datos/ }).click();
  await page.locator('input[name="situacionLaboral"][value="colaborador_familiar"]').check();
  await expect(page.getByText('¡Puedes solicitar la tarifa plana!')).toHaveCount(0);
  const aviso = page.locator('[class*="infoPluriactividad"]').filter({ hasText: 'familiar colaborador' });
  await expect(aviso).toContainText('art. 38 ter.11');
  await expect(aviso).toContainText('50 % durante 18 meses');
  await expect(aviso).toContainText('25 % los 6 siguientes');
});

test('24/09 · pluriactividad: el 50 % es un reintegro del exceso (art. 313 LGSS), no una reducción el primer año', async ({ page }) => {
  // Art. 313 LGSS en la redacción del RDL 13/2022 (desde 2023): reintegro del 50 % del exceso
  // de cotización por contingencias comunes sobre el umbral de la LPGE. No hay reducción de cuota.
  await expect(page.locator('body')).not.toContainText('Posible reducción del 50 % el 1.º año');
  await expect(page.locator('body')).not.toContainText('bonificación del 50 % en la cuota RETA durante el primer año');
  await page.getByRole('button', { name: /Mis Datos/ }).click();
  await page.locator('input[name="situacionLaboral"][value="pluriactividad"]').check();
  await expect(page.locator('[class*="infoPluriactividad"]').first()).toContainText('art. 313 LGSS');
});

test('24/09 · IAE: las personas físicas están exentas sin límite de cifra (art. 82.1.c TRLRHL)', async ({ page }) => {
  const html = await page.content();
  expect(html).not.toContain('su cifra de negocios no supere');
  expect(html).not.toContain('La mayoría de autónomos con facturación inferior a 1 millón');
  expect(html).toContain('Las personas físicas están exentas del pago sea cual sea su facturación');
  // Y las cifras del FAQPage salen de data/fiscal: la tarifa plana, 80 €.
  expect(html).toContain('cuota reducida de 80 €/mes durante los primeros 12 meses');
});

// ─────────────────────────────────────────────────────────────────────────────
// REINSPECCIÓN 25/09/2026
// ─────────────────────────────────────────────────────────────────────────────

const campoRendimientos = (page: Page) =>
  page.getByRole('textbox', { name: 'Rendimientos netos mensuales previstos' });
/** El <strong>Tramo N</strong> del texto de la horquilla. */
const etiquetaTramo = (page: Page) => page.locator('strong', { hasText: /^Tramo \d+$/ });

async function escribirRendimientos(page: Page, valor: string): Promise<Locator> {
  const campo = campoRendimientos(page);
  await campo.fill(valor);
  await esperarValorEnReact(page, campo, valor);
  return campo;
}

/**
 * Contraste del texto de `selector` contra su fondo REAL: compone las capas con alfa y los
 * degradados de los ancestros hasta el primer fondo opaco, y devuelve el peor caso.
 */
async function contraste(page: Page, selector: string): Promise<number> {
  return page.locator(selector).first().evaluate((el) => {
    const parse = (c: string): number[] | null => {
      const m = c.match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      const p = m[1].split(',').map(s => parseFloat(s));
      if (p.length < 4) p.push(1);
      return p;
    };
    const lum = (rgb: number[]) => {
      const [r, g, b] = rgb.slice(0, 3).map(v => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const componer = (arriba: number[], abajo: number[]) =>
      [0, 1, 2].map(i => arriba[i] * arriba[3] + abajo[i] * (1 - arriba[3])).concat(1);
    const capas: { color?: number[]; paradas?: number[][] }[] = [];
    let base: number[] = [255, 255, 255, 1];
    let n: Element | null = el;
    while (n) {
      const cs = getComputedStyle(n);
      if (cs.backgroundImage.includes('gradient')) {
        const paradas = [...cs.backgroundImage.matchAll(/rgba?\([^)]+\)/g)].map(m => parse(m[0]) as number[]);
        capas.push({ paradas });
      }
      const fondo = parse(cs.backgroundColor);
      if (fondo && fondo[3] > 0) {
        if (fondo[3] >= 0.99) { base = fondo; break; }
        capas.push({ color: fondo });
      }
      n = n.parentElement;
    }
    let fondos: number[][] = [base];
    for (const capa of capas.reverse()) {
      if (capa.color) fondos = fondos.map(f => componer(capa.color as number[], f));
      else fondos = fondos.flatMap(f => (capa.paradas as number[][]).map(p => componer(p, f)));
    }
    const texto = parse(getComputedStyle(el).color) as number[];
    return Math.min(...fondos.map(f => {
      const t = texto[3] < 1 ? componer(texto, f) : texto;
      const l1 = lum(t), l2 = lum(f);
      return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    }));
  });
}

test('REGRESIÓN 1376 · type="button", pestañas con aria-pressed, fases con aria-expanded y emojis ocultos', async ({ page }) => {
  // Antes: type=null en pestañas, fases, «Reiniciar todo» y epígrafes; el ✕ sin aria-label.
  const sinType = await page.locator('button').evaluateAll(bs =>
    bs.filter(b => b.getAttribute('type') !== 'button').map(b => (b.textContent ?? '').trim().slice(0, 30)));
  expect(sinType).toEqual([]);

  const pestana = (n: RegExp) => page.getByRole('button', { name: n });
  await expect(pestana(/Checklist/)).toHaveAttribute('aria-pressed', 'true');
  await expect(pestana(/Mis Datos/)).toHaveAttribute('aria-pressed', 'false');
  await expect(pestana(/Checklist/).locator('span[aria-hidden="true"]')).toHaveText('✅');

  // Fase 1 abierta al cargar; al pulsar la 2, la 2 se abre y la 1 se cierra
  const fases = page.locator('button[class*="faseHeader"]');
  await expect(fases.nth(0)).toHaveAttribute('aria-expanded', 'true');
  await fases.nth(1).click();
  await expect(fases.nth(1)).toHaveAttribute('aria-expanded', 'true');
  await expect(fases.nth(0)).toHaveAttribute('aria-expanded', 'false');

  await pestana(/Mis Datos/).click();
  await expect(pestana(/Mis Datos/)).toHaveAttribute('aria-pressed', 'true');
  const buscar = page.getByRole('button', { name: 'Ver epígrafes IAE frecuentes' });
  await expect(buscar).toHaveAttribute('aria-expanded', 'false');
  await buscar.click();
  await expect(page.getByRole('button', { name: 'Cerrar la lista de epígrafes' })).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('button[class*="epigrafeItem"]').first()).toHaveAttribute('type', 'button');
});

test('REGRESIÓN 1377 · las cifras normativas de la prosa son las de data/fiscal', async ({ page }) => {
  // Valores literales, cotejados con el módulo: si data/fiscal cambia, este test obliga a
  // mirar que la página lo haya seguido (antes eran literales escritos a mano en page.tsx).
  //   TARIFA_PLANA_2025.cuota = 80 · SMI_2026.anual = 17.094 · societario 514,99 → «~515 €»
  expect(TARIFA_PLANA_2025.cuota).toBe(80);
  expect(SMI_2026.anual).toBe(17094);
  expect(Math.round(AUTONOMO_SOCIETARIO_2025.cuotaMinimaMensual)).toBe(515);

  expect(await texto(page.locator('[class*="infoCard"]').filter({ hasText: 'Tarifa plana' }))).toContain('80,00 €/mes');
  const cuerpo = limpiar((await page.locator('body').textContent()) ?? '');
  expect(cuerpo).toContain('(17.094 € en 2026)');
  expect(cuerpo).toContain('del SMI, 17.094 € anuales en 2026');
  await abrirCostes(page);
  expect(await texto(page.locator('table tr').filter({ hasText: 'Cuota Seg. Social' }))).toContain('~515 €/mes');
});

test('25/09 · tramo intermedio de 2026: 2.500 €/mes cae en el tramo 10', async ({ page }) => {
  // Orden PJC/297/2026, art. 18, tabla general: «> 2.330 y ≤ 2.760» → base 1.356,21 a 2.760,00
  // (tramo 10 de TRAMOS_RETA_2025).
  //   base mínima: 1.356,21 × 31,50 % = 427,20615 → 427,21 €
  //   ahorro con tarifa plana: (427,20615 − 80) × 12 = 4.166,4738 → 4166,47 €
  //   base máxima: 2.760 × 31,50 % = 869,40 €
  //   personalizada 1.000 (con el foco) → se acota a 1.356,21 → 427,21 €; al salir, el campo 1356.21
  await abrirCostes(page);
  await escribirRendimientos(page, '2.500');
  await expect(etiquetaTramo(page)).toHaveText('Tramo 10');
  expect(await texto(filaCuota(page, 'Base de cotización elegida'))).toBe('1356,21 €');
  expect(await texto(filaCuota(page, 'Cuota mensual normal'))).toBe('427,21 €');
  expect(await texto(ahorro(page))).toBe('4166,47 €');
  expect(await texto(filaCoste(page, 'Cuota autónomo (anual)'))).toBe('960,00 €');

  await elegirBase(page, 'maxima');
  expect(await texto(filaCuota(page, 'Base de cotización elegida'))).toBe('2760,00 €');
  expect(await texto(filaCuota(page, 'Cuota mensual normal'))).toBe('869,40 €');

  await elegirBase(page, 'personalizada');
  const campo = await escribirBase(page, '1000');
  expect(await texto(filaCuota(page, 'Cuota mensual normal'))).toBe('427,21 €');
  await campo.blur();
  await expect(campo).toHaveValue('1356.21');
});

test('25/09 · fronteras que cierran por arriba (≤ 670, ≤ 900, ≤ 6.000) y la de 1.166,69', async ({ page }) => {
  // Orden PJC/297/2026, art. 18: «≤ 670», «> 670 y ≤ 900», «> 900 y < 1.166,70»,
  // «> 4.050 y ≤ 6.000», «> 6.000». Cuota mínima = base mínima del tramo × 31,50 %:
  //   670      → tramo 1:  653,59 → 205,880850 → 205,88 €
  //   670,01   → tramo 2:  718,95 → 226,469250 → 226,47 €
  //   900      → tramo 2:  718,95 → 226,47 €
  //   1.166,69 → tramo 3:  849,67 → 267,646050 → 267,65 €
  //   6.000    → tramo 14: 1.732,03 → 545,589450 → 545,59 €
  //   6.000,01 → tramo 15: 1.928,10 → 607,351500 → 607,35 €
  await abrirCostes(page);
  const casos: [string, string, string][] = [
    ['670', 'Tramo 1', '205,88 €'],
    ['670,01', 'Tramo 2', '226,47 €'],
    ['900', 'Tramo 2', '226,47 €'],
    ['1.166,69', 'Tramo 3', '267,65 €'],
    ['6.000', 'Tramo 14', '545,59 €'],
    ['6.000,01', 'Tramo 15', '607,35 €'],
  ];
  for (const [rend, tramo, cuota] of casos) {
    await escribirRendimientos(page, rend);
    await expect(etiquetaTramo(page), rend).toHaveText(tramo);
    expect(await texto(filaCuota(page, 'Cuota mensual normal')), rend).toBe(cuota);
  }
});

test('25/09 · HALLAZGO · 1.166,70 €/mes es el primer tramo de la tabla GENERAL, no el último de la reducida', async ({ page }) => {
  test.fail(); // Hallazgo del acta 25/09/2026: tramoPorRendimientos usa «≤ rendimientoMax» también en 1.166,70
  // Orden PJC/297/2026, art. 18: tramo 3 «> 900 y < 1.166,70»; tabla general, tramo 1
  // «≥ 1.166,70 y ≤ 1.300» (tramo 4 de TRAMOS_RETA_2025, base 950,98 a 1.300,00).
  //   base mínima: 950,98 × 31,50 % = 299,5587 → 299,56 €
  // Hoy la app da el tramo 3: base 849,67 y cuota 267,65 €.
  await abrirCostes(page);
  await escribirRendimientos(page, '1.166,70');
  await expect(etiquetaTramo(page)).toHaveText('Tramo 4');
  expect(await texto(filaCuota(page, 'Base de cotización elegida'))).toBe('950,98 €');
  expect(await texto(filaCuota(page, 'Cuota mensual normal'))).toBe('299,56 €');
});

test('25/09 · rendimientos que no son un importe válido: negativo, vacío y texto', async ({ page }) => {
  // Negativo: la tabla dice «≤ 670», así que un rendimiento negativo es tramo 1 (653,59 → 205,88 €),
  // nunca una cuota negativa; al salir del campo, NumberInput (min 0) lo deja en 0.
  // Vacío: sin tramo; base mínima general 653,59 → 205,88 €. Texto: el control lo rechaza.
  await abrirCostes(page);
  const campo = await escribirRendimientos(page, '-500');
  await expect(etiquetaTramo(page)).toHaveText('Tramo 1');
  expect(await texto(filaCuota(page, 'Cuota mensual normal'))).toBe('205,88 €');
  await campo.blur();
  await expect(campo).toHaveValue('0');
  await expect(etiquetaTramo(page)).toHaveText('Tramo 1');

  await escribirRendimientos(page, '');
  await expect(etiquetaTramo(page)).toHaveCount(0);
  await expect(page.locator('[class*="basesInfo"]').filter({ hasText: 'Sin rendimientos' })).toBeVisible();
  expect(await texto(filaCuota(page, 'Base de cotización elegida'))).toBe('653,59 €');
  expect(await texto(filaCuota(page, 'Cuota mensual normal'))).toBe('205,88 €');

  await campo.pressSequentially('abc');
  await expect(campo).toHaveValue('');
});

test('25/09 · IAE: la exención de las personas físicas, también en el FAQ visible y en el paso 3', async ({ page }) => {
  // Art. 82.1.c TRLRHL (RDL 2/2004), texto consolidado del BOE: exentas «las personas físicas,
  // sean o no residentes»; el límite de 1.000.000 € es para los sujetos pasivos del IS,
  // sociedades civiles y entidades del art. 35.4 LGT.
  const faq = page.locator('details').filter({ hasText: '¿Tengo que darme de alta en el IAE?' });
  const t = limpiar((await faq.textContent()) ?? '');
  expect(t).toContain('Las personas físicas están exentas de pago sea cual sea su cifra de negocios');
  expect(t).toContain('el límite de 1.000.000 € es para las sociedades');
  const paso3 = page.locator('li').filter({ hasText: 'Alta en el IAE (Impuesto Actividades Económicas)' });
  expect(limpiar((await paso3.textContent()) ?? '')).toContain('exento de pago sea cual sea tu facturación');
});

test('25/09 · HALLAZGO · «Primera alta» no recoge los 3 años de quien ya disfrutó la tarifa plana', async ({ page }) => {
  test.fail(); // Hallazgo del acta 25/09/2026
  // Art. 38 ter.4 Ley 20/2007: el periodo sin alta exigido «será de tres años cuando los
  // trabajadores autónomos hubieran disfrutado de dichas reducciones en su anterior período de
  // alta». La opción «Primera alta — hace más de 2 años» concede la tarifa plana sin preguntarlo
  // (la casilla de pluriactividad sí lo dice). Esperado: que la sección lo pregunte o lo advierta.
  await page.getByRole('button', { name: /Mis Datos/ }).click();
  // div: el <h3> de la sección también lleva «datosSeccion» en su clase (datosSeccionTitulo)
  const seccion = page.locator('div[class*="datosSeccion"]').filter({ hasText: 'Situación Laboral' });
  await expect(page.getByText('¡Puedes solicitar la tarifa plana!')).toBeVisible();
  await expect(seccion).toContainText(/3 años|tres años|3 si ya|3 si la/);
});

test('25/09 · HALLAZGO · el FAQ de pluriactividad sigue prometiendo bonificaciones y devolución por tope de bases', async ({ page }) => {
  test.fail(); // Hallazgo del acta 25/09/2026 (reparación incompleta de 4962fef7)
  // Art. 313 LGSS (redacción del RDL 13/2022): reintegro del 50 % del exceso de las cotizaciones
  // por contingencias comunes sobre la cuantía que fije la LPGE, con tope del 50 % de las cuotas
  // del RETA. No hay bonificación de la cuota ni devolución por «suma de bases sobre el tope».
  const faq = page.locator('details').filter({ hasText: '¿Puedo ser autónomo y trabajar por cuenta ajena a la vez?' });
  const t = limpiar((await faq.textContent()) ?? '');
  expect(t).not.toContain('puedes tener bonificaciones en la cuota de autónomo');
  expect(t).not.toContain('Si la suma de bases supera el tope máximo');
});

test('25/09 · HALLAZGO · Verifactu no es obligatorio «desde 2025»', async ({ page }) => {
  test.fail(); // Hallazgo del acta 25/09/2026
  // RD 1007/2023, disposición final 4.ª (redacción del RDL 15/2025): contribuyentes del IS antes
  // del 1 de enero de 2027; el resto de obligados (autónomos) antes del 1 de julio de 2027.
  const fases = page.locator('button[class*="faseHeader"]');
  await fases.filter({ hasText: 'Operatividad' }).click();
  const item = page.locator('[class*="checklistItem"]').filter({ hasText: 'Elegir software de facturación' });
  await expect(item).toBeVisible();
  const t = await texto(item);
  expect(t).not.toContain('Desde 2025 será obligatorio');
  expect(t).toContain('2027');
});

test('25/09 · HALLAZGO · contraste del texto en color de marca, tema claro', async ({ page }) => {
  test.fail(); // Hallazgo del acta 25/09/2026
  // Texto normal (15,2 px): WCAG 1.4.3 exige 4,5:1. Medido hoy: «Ahorro primer año» 2,68:1 y
  // «¡Puedes solicitar la tarifa plana!» 2,55:1 (--secondary sobre fondo claro), «0 €» de la
  // columna Autónomo 2,87:1 (#27ae60).
  await page.evaluate(() => { document.documentElement.dataset.theme = 'light'; });
  await abrirCostes(page);
  await expect.poll(() => contraste(page, '[class*="cuotaAhorro"] strong')).toBeGreaterThanOrEqual(4.5);
  await expect.poll(() => contraste(page, 'td[class*="ventaja"]')).toBeGreaterThanOrEqual(4.5);
  await page.getByRole('button', { name: /Mis Datos/ }).click();
  await expect.poll(() => contraste(page, '[class*="infoTarifaPlana"]')).toBeGreaterThanOrEqual(4.5);
});

test('25/09 · HALLAZGO · el % va separado por espacio duro (U+00A0)', async ({ page }) => {
  test.fail(); // Hallazgo del acta 25/09/2026 (regla del 25/09/2026 del formato español)
  // «31,50 %» con U+00A0: hoy la fila dice «31,50%», el progreso «0%» y el IS «25 % general»
  // con espacio normal.
  const NBSP = String.fromCharCode(160);
  expect(await page.locator('[class*="progresoValor"]').innerText()).toBe(`0${NBSP}%`);
  await abrirCostes(page);
  expect(await filaCuota(page, 'Tipo de cotización').innerText()).toBe(`31,50${NBSP}%`);
  expect(await page.locator('table tr').filter({ hasText: 'Fiscalidad' }).innerText()).toContain(`25${NBSP}% general`);
});

test('25/09 · HALLAZGO · la escala del IRPF de la comparativa no sale de data/fiscal', async () => {
  test.fail(); // Hallazgo del acta 25/09/2026 (dato)
  // TRAMOS_IRPF_2025 (data/fiscal/irpf.ts) empieza en 19 y acaba en 47; la tabla lo escribe a
  // mano como «19-47%». Hoy coincide, pero no seguiría un cambio de la escala.
  const fuente = readFileSync(join(process.cwd(), 'app', 'asistente-alta-autonomo', 'page.tsx'), 'utf8');
  expect(fuente).not.toMatch(/19-47\s?%/);
});

test('25/09 · HALLAZGO · el autónomo societario: «al menos la cuarta parte», no «más del 25 %»', async ({ page }) => {
  test.fail(); // Hallazgo del acta 25/09/2026
  // Art. 305.2.b LGSS: control efectivo presunto con participación «igual o superior a la cuarta
  // parte» si tiene funciones de dirección y gerencia (igual o superior a la tercera parte sin
  // ellas); data/fiscal/sociedades.ts (AUTONOMO_SOCIETARIO_2025.nota) dice «≥25%».
  const fila = page.locator('table tr').filter({ hasText: 'Cuándo aplica' });
  expect(limpiar((await fila.textContent()) ?? '')).not.toMatch(/>\s*25\s*%/);
});
