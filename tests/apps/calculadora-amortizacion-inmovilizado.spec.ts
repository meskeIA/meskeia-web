import { test, expect, type Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * Inspector — calculadora-amortizacion-inmovilizado (segmento fiscal, riesgo 1 · primera
 * inspección 16/11/2026).
 *
 * La app promete en su <h1> «Calculadora de Amortización de Inmovilizado» y en el subtítulo
 * «Compara los tres sistemas de amortización —lineal, degresivo y suma de dígitos— y obtén el
 * cuadro año a año con la cuota, la amortización acumulada y el valor neto contable». Hay verdad
 * comprobable: el porcentaje degresivo, cada cuota, la acumulada y el valor neto contable.
 *
 * DÓNDE VIVE EL CÁLCULO
 *   app/calculadora-amortizacion-inmovilizado/page.tsx (cuadroLineal, cuadroDegresivo,
 *   cuadroDigitos, calcularMetodos), sin motor aparte.
 *   data/fiscal/amortizacion.ts → TABLA_AMORTIZACION_2026 (coeficientes y períodos),
 *   MULTIPLICADORES_DEGRESIVO_2026 (1,5 · 2 · 2,5 · mínimo 11 %) y multiplicadorDegresivo().
 *
 * FUENTES OFICIALES CONSULTADAS (16/11/2026)
 *   · Ley 27/2014 del IS (BOE-A-2014-12328), art. 12.1.a: Maquinaria 12 % / 18 años; Equipos
 *     para procesos de información 25 % / 8; Mobiliario 10 % / 20; Elementos de transporte
 *     externo 16 % / 14; Edificios industriales 3 % / 68.
 *   · Art. 12.1.b: «1,5, si el elemento tiene un período de amortización inferior a 5 años»;
 *     «2, si el elemento tiene un período de amortización igual o superior a 5 años e inferior a
 *     8 años»; «2,5, si el elemento tiene un período de amortización igual o superior a 8 años»;
 *     «El porcentaje constante no podrá ser inferior al 11 por ciento»; edificios, mobiliario y
 *     enseres no pueden acogerse al porcentaje constante.
 *   · Art. 12.1.c: «Los edificios, mobiliario y enseres no podrán acogerse a la amortización
 *     mediante números dígitos.»
 *   · RD 634/2015, Reglamento del IS (BOE-A-2015-7771): art. 3.2 «Será amortizable el precio de
 *     adquisición o coste de producción, excluido, en su caso, el valor residual»; art. 5.1 el
 *     porcentaje se aplica «al valor pendiente de amortización» y el importe pendiente del
 *     período en que concluye la vida útil se amortiza en ese período; art. 6.1.a el período de
 *     dígitos «podrá ser cualquiera de los comprendidos entre el período máximo y el que se
 *     deduce del coeficiente», con «el valor numérico mayor» el primer año.
 *
 * ══ CASOS RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR ══
 *   CASO 1 (normal) · Equipos para procesos de información (25 % → 100 / 25 = 4 años, exacto),
 *     10.000 € y residual 0:
 *     lineal 2.500 €/año · mitad de vida (año 2) 50 %;
 *     degresivo: 4 < 5 → ×1,5 → 1/4 × 1,5 = 37,5 %: 3750 · 2343,75 · 1464,84 · 2441,41 (resto)
 *       → en pantalla 3750 · 2344 · 1465 · 2441; acumulada a mitad 6093,75 → 61 %;
 *     dígitos: suma 10 → 4000 · 3000 · 2000 · 1000; mitad 70 %.
 *   CASO 2 (límite)
 *     2a · período de 8 años EXACTO, 10.000 € y residual 0 (sin residual, para que no entre la
 *       duda de si el porcentaje va sobre el VNC o sobre la base): art. 12.1.b → ×2,5 →
 *       1/8 × 2,5 = 31,25 % (en pantalla «31,3 %»): 3125 · 2148,44 · 1477,05 · 1015,47 · 698,14 ·
 *       479,97 · 329,98 · 725,95 (resto); acumulada al año 4 = 7765,96 → 78 %.
 *     2b · ejemplo por defecto (Maquinaria, 50.000 / 2.000 / 9 desde el hallazgo 4870; antes 8,
 *       por debajo de la vida mínima): lineal 48.000 / 9 = 5333 €; dígitos 48.000 × 9/45 =
 *       9600 €, último 48.000 / 45 = 1067 €, mitad 35/45 = 78 %; los tres métodos terminan con
 *       48.000 € acumulados y 2000 € de valor neto contable (el residual).
 *     2c · suelo del 11 %: 25 años, 10.000 / 0 → 1/25 × 2,5 = 10 % < 11 % → 11 %: 1100 € el
 *       primer año; el año 25 amortiza el resto, 10.000 × 0,89^24 = 610 €.
 *     2d · vida útil de 1 año, 10.000 / 1.000 → los tres métodos, 9000 € en el único año.
 *     2e · vida útil mínima de Maquinaria: «la que se deduce del coeficiente» (RIS 6.1.a) =
 *       100 / 12 = 8,33 años; 8 años darían 12,5 % > 12 %. Vehículos: 100 / 16 = 6,25; 6 años →
 *       16,67 % > 16 %.
 *     2f · Mobiliario y enseres: ni porcentaje constante ni números dígitos (art. 12.1.b y c).
 *   CASO 3 (rechazo) · residual igual o mayor que la adquisición, residual negativo, vida 0 o
 *     negativa, adquisición 0 o negativa: ningún cuadro y el aviso «Introduce un valor de
 *     adquisición mayor que cero…».
 *
 * Los test con test.fail() son HALLAZGOS ABIERTOS: el día que se reparen, fallarán por pasar y
 * habrá que quitarles el test.fail() (y cambiar ABIERTO por REPARADO).
 */

const ADQ = '#campo-valorAdquisicion';
const RES = '#campo-valorResidual';
const VIDA = '#campo-vidaUtil';

const normalizar = (t: string) => t.replace(/[  ]/g, ' ').replace(/\s*\n+\s*/g, ' | ');

/**
 * Escribe en un campo como un usuario que entra con el ratón y selecciona todo antes de teclear
 * (con Tab el campo pierde la selección al enfocar: es el hallazgo del último test). El campo
 * guarda lo tecleado mientras tiene el foco y lo normaliza al salir, con separador de miles.
 */
async function escribir(page: Page, selector: string, valor: string, mostrado: string): Promise<void> {
  const campo = page.locator(selector);
  await campo.click();
  await campo.press('Control+A');
  await campo.pressSequentially(valor);
  await esperarValorEnReact(page, campo, valor);
  await campo.blur();
  await esperarValorEnReact(page, campo, mostrado);
}

async function elegirTipo(page: Page, nombre: string): Promise<void> {
  const boton = page.getByRole('button', { name: nombre, exact: true });
  await boton.click();
  await expect(boton).toHaveAttribute('aria-pressed', 'true');
}

function resumen(page: Page) {
  return page.locator('section').filter({ has: page.getByText('Cuota 1.er año') }).first();
}

async function textoCarta(page: Page, metodo: string): Promise<string> {
  const carta = resumen(page).locator(':scope > div').filter({ hasText: metodo });
  await expect(carta).toHaveCount(1);
  return normalizar(await carta.innerText());
}

/** Filas del cuadro del método pedido, cada una «año/cuota/acumulada/VNC». */
async function filasCuadro(page: Page, metodo: string): Promise<string[]> {
  const boton = page.getByRole('group', { name: 'Elegir método del cuadro' }).getByRole('button', { name: metodo, exact: true });
  await boton.click();
  await expect(boton).toHaveAttribute('aria-pressed', 'true');
  const filas = page
    .getByRole('table')
    .filter({ has: page.getByRole('columnheader', { name: 'Valor neto contable' }) })
    .locator('tbody tr');
  const n = await filas.count();
  const salida: string[] = [];
  for (let i = 0; i < n; i++) {
    const celdas = await filas.nth(i).locator('td').allInnerTexts();
    salida.push(celdas.map((c) => c.replace(/[  ]/g, ' ').trim()).join('/'));
  }
  return salida;
}

const aviso = (page: Page) => page.getByText('Introduce un valor de adquisición mayor que cero');
const tituloCuadro = (page: Page) => page.getByRole('heading', { name: 'Cuadro de amortización' });

test.describe('calculadora-amortizacion-inmovilizado', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculadora-amortizacion-inmovilizado/');
    await esperarHidratacion(page, [ADQ, RES, VIDA]);
  });

  test('CASO 1 (normal) · equipos informáticos, 10.000 € a 4 años: lineal 2500, degresivo 37,5 % y dígitos 4/10', async ({ page }) => {
    await elegirTipo(page, 'Equipos para procesos de información');
    await expect(page.locator(VIDA)).toHaveValue('4'); // 100 / 25 = 4 años, exacto
    await escribir(page, ADQ, '10000', '10.000');
    await escribir(page, RES, '0', '0');

    const lineal = await textoCarta(page, 'Lineal');
    expect(lineal).toContain('Cuota 1.er año | 2500 €');
    expect(lineal).toContain('Cuota último año | 2500 €');
    expect(lineal).toContain('Amortizado a mitad de vida | 50 %');

    // Art. 12.1.b LIS: período 4 < 5 → ×1,5 → 37,5 %
    const degresivo = await textoCarta(page, 'Degresivo (% constante)');
    expect(degresivo).toContain('37,5 % sobre el saldo pendiente (×1,5)');
    expect(degresivo).toContain('Cuota 1.er año | 3750 €');
    expect(degresivo).toContain('Cuota último año | 2441 €');
    expect(degresivo).toContain('Amortizado a mitad de vida | 61 %');

    const digitos = await textoCarta(page, 'Suma de dígitos');
    expect(digitos).toContain('Cuota 1.er año | 4000 €');
    expect(digitos).toContain('Cuota último año | 1000 €');
    expect(digitos).toContain('Amortizado a mitad de vida | 70 %');
    expect(digitos).toContain('suma = 10');

    expect(await filasCuadro(page, 'Lineal')).toEqual([
      '1/2500 €/2500 €/7500 €',
      '2/2500 €/5000 €/5000 €',
      '3/2500 €/7500 €/2500 €',
      '4/2500 €/10.000 €/0 €',
    ]);
    // RIS 5.1: el porcentaje va sobre el valor pendiente y el último año se amortiza el resto
    expect(await filasCuadro(page, 'Degresivo (% constante)')).toEqual([
      '1/3750 €/3750 €/6250 €',
      '2/2344 €/6094 €/3906 €',
      '3/1465 €/7559 €/2441 €',
      '4/2441 €/10.000 €/0 €',
    ]);
    // RIS 6.1.a: el valor numérico mayor el primer año
    expect(await filasCuadro(page, 'Suma de dígitos')).toEqual([
      '1/4000 €/4000 €/6000 €',
      '2/3000 €/7000 €/3000 €',
      '3/2000 €/9000 €/1000 €',
      '4/1000 €/10.000 €/0 €',
    ]);
  });

  test('CASO 2a (límite) · período de 8 años exacto: el art. 12.1.b LIS pondera por 2,5 → 31,25 %, 3125 € el primer año', async ({ page }) => {
    // ABIERTO: multiplicadorDegresivo() de data/fiscal/amortizacion.ts devuelve 2 con
    // `vidaUtilAnios <= 8`, y la ley da 2 solo «igual o superior a 5 años e inferior a 8 años» y
    // 2,5 «igual o superior a 8 años». La app muestra «25,0 % (×2,0)», 2500 € el primer año,
    // 1335 € el último y 68 % a mitad de vida.
    test.fail();
    await escribir(page, ADQ, '10000', '10.000');
    await escribir(page, RES, '0', '0');
    await escribir(page, VIDA, '8', '8');

    const degresivo = await textoCarta(page, 'Degresivo (% constante)');
    expect(degresivo).toContain('31,3 % sobre el saldo pendiente (×2,5)');
    expect(degresivo).toContain('Cuota 1.er año | 3125 €');
    expect(degresivo).toContain('Cuota último año | 726 €');
    expect(degresivo).toContain('Amortizado a mitad de vida | 78 %');
    const filas = await filasCuadro(page, 'Degresivo (% constante)');
    expect(filas[0]).toBe('1/3125 €/3125 €/6875 €');
    expect(filas[1]).toBe('2/2148 €/5273 €/4727 €');
  });

  test('CASO 2a bis (límite) · períodos de 5 y 7 años siguen con ×2, el de 4 con ×1,5', async ({ page }) => {
    await escribir(page, ADQ, '10000', '10.000');
    await escribir(page, RES, '0', '0');
    await escribir(page, VIDA, '7', '7');
    expect(await textoCarta(page, 'Degresivo (% constante)')).toContain('28,6 % sobre el saldo pendiente (×2,0)');
    await escribir(page, VIDA, '5', '5');
    expect(await textoCarta(page, 'Degresivo (% constante)')).toContain('40,0 % sobre el saldo pendiente (×2,0)');
    await escribir(page, VIDA, '4', '4');
    expect(await textoCarta(page, 'Degresivo (% constante)')).toContain('37,5 % sobre el saldo pendiente (×1,5)');
  });

  test('CASO 2b (límite) · ejemplo por defecto, maquinaria 50.000 / 2.000 / 9: los tres métodos acaban en el residual', async ({ page }) => {
    // REPARADO (hallazgo 4870): el ejemplo usaba 8 años, por debajo de la vida útil mínima de la
    // maquinaria (100 / 12 = 8,33 → 9 años enteros). Con 9 años:
    //   lineal 48.000 / 9 = 5333,33 → 5333 €; a mitad de vida (año 5) 5/9 = 55,6 → 56 %;
    //   dígitos suma 45: 48.000 × 9/45 = 9600 €, último 48.000 / 45 = 1066,67 → 1067 €,
    //   mitad (9+8+7+6+5)/45 = 35/45 = 77,8 → 78 %.
    await expect(page.locator(ADQ)).toHaveValue('50.000');
    await expect(page.locator(RES)).toHaveValue('2000');
    await expect(page.locator(VIDA)).toHaveValue('9');

    const lineal = await textoCarta(page, 'Lineal');
    expect(lineal).toContain('Cuota 1.er año | 5333 €');
    expect(lineal).toContain('Cuota último año | 5333 €');
    expect(lineal).toContain('Amortizado a mitad de vida | 56 %');

    const digitos = await textoCarta(page, 'Suma de dígitos');
    expect(digitos).toContain('Cuota 1.er año | 9600 €');
    expect(digitos).toContain('Cuota último año | 1067 €');
    expect(digitos).toContain('Amortizado a mitad de vida | 78 %');
    expect(digitos).toContain('suma = 45');

    for (const metodo of ['Lineal', 'Degresivo (% constante)', 'Suma de dígitos']) {
      const filas = await filasCuadro(page, metodo);
      expect(filas).toHaveLength(9);
      // RIS 3.2: lo amortizable es la adquisición menos el residual
      expect(filas[8]).toMatch(/^9\/[\d.]+ €\/48\.000 €\/2000 €$/);
    }
  });

  test('CASO 2c (límite) · 25 años: 1/25 × 2,5 = 10 % sube al mínimo del 11 %', async ({ page }) => {
    await escribir(page, ADQ, '10000', '10.000');
    await escribir(page, RES, '0', '0');
    await escribir(page, VIDA, '25', '25');
    const degresivo = await textoCarta(page, 'Degresivo (% constante)');
    expect(degresivo).toContain('11,0 % sobre el saldo pendiente (×2,5)');
    expect(degresivo).toContain('Cuota 1.er año | 1100 €');
    expect(degresivo).toContain('Cuota último año | 610 €');
    const filas = await filasCuadro(page, 'Degresivo (% constante)');
    expect(filas[1]).toBe('2/979 €/2079 €/7921 €');
    expect(filas[24]).toBe('25/610 €/10.000 €/0 €');
  });

  test('CASO 2d (límite) · vida útil de 1 año: los tres métodos amortizan la base entera, 9000 €', async ({ page }) => {
    await escribir(page, ADQ, '10000', '10.000');
    await escribir(page, RES, '1000', '1000');
    await escribir(page, VIDA, '1', '1');
    for (const metodo of ['Lineal', 'Degresivo (% constante)', 'Suma de dígitos']) {
      const texto = await textoCarta(page, metodo);
      expect(texto).toContain('Cuota 1.er año | 9000 €');
      expect(await filasCuadro(page, metodo)).toEqual(['1/9000 €/9000 €/1000 €']);
    }
  });

  test('CASO 2e (límite) · la vida útil mínima sugerida no puede superar el coeficiente máximo (100 / 12 = 8,33 años)', async ({ page }) => {
    // REPARADO (hallazgo 4870): seleccionarTipo() redondeaba 100 / coefLinealMax con Math.round
    // (Maquinaria 8 años, 12,5 % > 12 %). RIS 6.1.a: el período mínimo es «el que se deduce del
    // coeficiente»; con años enteros, hacia arriba: 9 (Maquinaria), 7 (vehículos, 100/16 = 6,25),
    // 34 (edificios industriales, 100/3 = 33,33), 4 (software, 100/33 = 3,03) y 4 exacto
    // (equipos, 100/25).
    await elegirTipo(page, 'Instalaciones técnicas');
    await elegirTipo(page, 'Maquinaria');
    await expect(page.getByText(/coeficiente lineal máximo 12/)).toContainText('entre 9 y 18 años');
    await expect(page.locator(VIDA)).toHaveValue('9');
    await elegirTipo(page, 'Elementos de transporte (vehículos)');
    await expect(page.locator(VIDA)).toHaveValue('7');
    await elegirTipo(page, 'Edificios y construcciones (uso industrial)');
    await expect(page.locator(VIDA)).toHaveValue('34');
    await elegirTipo(page, 'Sistemas y programas informáticos');
    await expect(page.locator(VIDA)).toHaveValue('4');
    await elegirTipo(page, 'Equipos para procesos de información');
    await expect(page.locator(VIDA)).toHaveValue('4');
  });

  test('CASO 2f (límite) · mobiliario y enseres: la nota avisa de que tampoco admiten números dígitos', async ({ page }) => {
    // REPARADO (hallazgo 4869): art. 12.1.c LIS, «Los edificios, mobiliario y enseres no podrán
    // acogerse a la amortización mediante números dígitos». La app solo marcaba excluido el
    // porcentaje constante y pintaba la suma de dígitos sin aviso; ahora lo dicen la nota y las
    // tarjetas de los dos métodos degresivos (la lineal, no).
    await elegirTipo(page, 'Mobiliario y enseres');
    const nota = page.getByText(/coeficiente lineal máximo 10 %/);
    await expect(nota).toContainText('porcentaje constante');
    await expect(nota).toContainText(/d[ií]gitos/i);
    expect(await textoCarta(page, 'Suma de dígitos')).toContain('No admitido fiscalmente');
    expect(await textoCarta(page, 'Degresivo (% constante)')).toContain('No admitido fiscalmente');
    expect(await textoCarta(page, 'Lineal')).not.toContain('No admitido fiscalmente');
    // Con un activo que sí los admite, el aviso desaparece
    await elegirTipo(page, 'Maquinaria');
    expect(await textoCarta(page, 'Suma de dígitos')).not.toContain('No admitido fiscalmente');
  });

  test('CASO 3 (rechazo) · residual ≥ adquisición, residual negativo, vida 0 o negativa y adquisición 0 o negativa', async ({ page }) => {
    await expect(tituloCuadro(page)).toBeVisible();

    await escribir(page, ADQ, '10000', '10.000');
    await escribir(page, RES, '10000', '10.000');
    await expect(aviso(page)).toBeVisible();
    await expect(tituloCuadro(page)).toHaveCount(0);

    await escribir(page, RES, '12000', '12.000');
    await expect(aviso(page)).toBeVisible();

    await escribir(page, RES, '-500', '-500');
    await expect(aviso(page)).toBeVisible();

    await escribir(page, RES, '0', '0');
    await expect(tituloCuadro(page)).toBeVisible();

    await escribir(page, VIDA, '0', '0');
    await expect(aviso(page)).toBeVisible();
    await expect(tituloCuadro(page)).toHaveCount(0);

    await escribir(page, VIDA, '-3', '-3');
    await expect(aviso(page)).toBeVisible();

    await escribir(page, VIDA, '5', '5');
    await escribir(page, ADQ, '0', '0');
    await expect(aviso(page)).toBeVisible();

    await escribir(page, ADQ, '-5000', '-5000');
    await expect(aviso(page)).toBeVisible();
    await expect(tituloCuadro(page)).toHaveCount(0);
  });

  test('CASO 3 bis · el aviso de datos no válidos se anuncia al lector de pantalla', async ({ page }) => {
    // ABIERTO: el aviso es un <section> sin role="alert" ni aria-live; el cuadro desaparece y
    // el lector de pantalla no dice nada.
    test.fail();
    await escribir(page, VIDA, '0', '0');
    await expect(aviso(page)).toBeVisible();
    await expect(
      page.locator('[role="alert"], [aria-live]').filter({ hasText: 'Introduce un valor de adquisición' }),
    ).toHaveCount(1);
  });

  test('FAQ · el JSON-LD y la FAQ visible no dicen que el coeficiente 2 llega hasta los 8 años', async ({ page }) => {
    // ABIERTO: «por 2 si está entre 5 y 8 años, o por 2,5 si supera los 8 años» (JSON-LD) y
    // «2 (de 5 a 8 años) o 2,5 (más de 8 años)» (visible); el art. 12.1.b da 2,5 «igual o
    // superior a 8 años». Además es la misma pregunta escrita dos veces.
    test.fail();
    const jsonLd = await page.evaluate(() =>
      Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
        .map((s) => s.textContent ?? '')
        .join('\n'),
    );
    expect(jsonLd).not.toMatch(/(entre 5 y 8|de 5 a 8) años/);
    await expect(page.getByText(/(entre 5 y 8|de 5 a 8) años/)).toHaveCount(0);
  });

  test('OPERATIVA · entrar con Tab en un campo de cinco cifras y teclear sustituye el valor', async ({ page }) => {
    // ABIERTO: al enfocar, handleFocus cambia «50.000» por «50000»; el navegador pierde la
    // selección que hace Tab y lo tecleado se añade al final: 50.000 + «10000» = 5.000.010.000.
    // Con un campo de cuatro cifras («2000») el texto no cambia y sí funciona.
    test.fail();
    const adq = page.locator(ADQ);
    await page.locator(RES).focus();
    await page.keyboard.press('Shift+Tab');
    await expect(adq).toBeFocused();
    await page.keyboard.type('10000');
    await page.keyboard.press('Tab');
    await expect(adq).toHaveValue('10.000');
  });
});
