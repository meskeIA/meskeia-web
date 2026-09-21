import { test, expect, Page, Locator } from '@playwright/test';
import { esperarHidratacion, sembrarValor, sembrarValorAcotado } from './_hidratacion';

/**
 * Estimador de Cartera de Inversión — regresión del MOTOR (Markowitz + Monte Carlo).
 * Inspeccionada el 21/09/2026 · REPARADA el mismo día (hallazgos 1128-1140).
 *
 * QUÉ PROMETE (leído el 21/09/2026)
 *   · <h1>: «Estimador de Cartera de Inversión».
 *   · Subtítulo: «Proyecta la evolución de tu patrimonio con simulación Monte Carlo».
 *   · <title>/openGraph: «Estimador de Cartera de Inversión - Monte Carlo».
 *   · En pantalla: <LegalNotice />, <DisclaimerCard variant="financial" severity="high"
 *     collapsible={false}> (nivel 2 ALTO, NO colapsable) y un panel role="status".
 *
 * DE DÓNDE SALEN LOS NÚMEROS — todo vive en la propia página (no hay módulo aparte):
 *   · ASSET_CLASSES: RV 7 % / σ 16 % · RF 3 % / σ 5 % · Liquidez 1,5 % / σ 0,5 % ·
 *     Alternativos 5 % / σ 12 %.  Tasa libre de riesgo: campo editable, 2 % por omisión.
 *     NUM_SIMULACIONES = 1000.
 *   · PERFILES_PREDEFINIDOS.agresivo = { rv: 90, rf: 5, liq: 0, alt: 5 }.
 *   · Correlaciones: RV-RF 0,25 · RV-LIQ 0,10 · RV-ALT 0,40 · RF-LIQ 0,05 · RF-ALT 0,15 ·
 *     LIQ-ALT 0,05.
 *
 * LAS CUATRO FÓRMULAS QUE ESTE TEST VIGILA
 *   (1) Rentabilidad de cartera = Σ wᵢ·rᵢ                       (media ponderada)
 *   (2) Volatilidad de cartera = √(Σᵢ Σⱼ wᵢ·wⱼ·σᵢ·σⱼ·ρᵢⱼ)        (Markowitz)
 *   (3) Sharpe = (rentabilidad − tasa libre de riesgo) / volatilidad
 *   (4) Caída máxima = mediana del máximo drawdown MEDIDO en cada una de las 1.000
 *       trayectorias, sobre un índice sin aportaciones. Hasta el 21/09/2026 era
 *       volatilidad × 2,5, una regla del pulgar que no dependía de ningún escenario:
 *       cambiar horizonte, capital o aportación no la movía ni un decimal (hallazgo 1132).
 *   Y el motor: capitalₘ = capitalₘ₋₁·(1 + rₘ) + aportación, con
 *   rₘ = r_real/12 + (σ/√12)·N(0,1) y r_real = (1+nominal)/(1+inflación) − 1 por Fisher
 *   (hallazgo 1130: antes se restaba a secas). Aportación AL FINAL de cada mes.
 *
 * LOS CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   CASO 1 — NORMAL · perfil Agresivo (90/5/0/5), 25.000 €, 300 €/mes, 20 años, inflación 2 %.
 *       (1) r = 0,90·7 + 0,05·3 + 0,00·1,5 + 0,05·5 = 6,3 + 0,15 + 0 + 0,25 = 6,70 %
 *       (2) aᵢ = wᵢ·σᵢ → a_rv = 0,144 · a_rf = 0,0025 · a_liq = 0 · a_alt = 0,006
 *           Σ diagonal = 0,144² + 0,0025² + 0,006² = 0,020736 + 0,00000625 + 0,000036
 *                      = 0,02077825
 *           Σ cruzados = 2·(0,144·0,0025·0,25 + 0,144·0,006·0,40 + 0,0025·0,006·0,15)
 *                      = 2·(0,00009 + 0,0003456 + 0,00000225) = 0,0008757
 *           varianza = 0,02165395 → σ = 0,1471528 → 14,72 %
 *       (3) Sharpe = (6,70 − 2) / 14,71528 = 4,70 / 14,71528 = 0,3194 → «0,32»
 *       (4) rentabilidad real por Fisher = 1,067/1,02 − 1 = 4,6078 % (antes 4,70 a secas)
 *       Total aportado = 25.000 + 300·20·12 = 25.000 + 72.000 = 97.000,00 €, en euros de
 *       HOY, que es la misma moneda en que proyecta el motor (hallazgo 1131: antes se
 *       restaba una mediana deflactada menos unas aportaciones nominales).
 *       Mediana: la trayectoria mediana crece al tipo REAL ≈4,61 % anual, con el
 *       arrastre de varianza de la simulación mensual (μₘ = 0,0039167, σₘ = 0,042480):
 *           factor ≈ exp(240·(μₘ − σₘ²/2)) = exp(240·0,0030147) = 2,062
 *           capital ≈ 25.000·2,062 = 51.500 €
 *           aportaciones ≈ 300·(2,062 − 1)/0,0030192 = 300·351,7 = 105.500 €
 *           → ≈ 157.000 €.  Medido en 4 corridas: 157.707 · 159.422 · 161.319 · 161.748.
 *
 *   CASO 2 — EL LÍMITE DEL 0 % · 100 % liquidez (1,5 % nominal) con inflación 1,5 %
 *       → rentabilidad REAL exactamente 0, que es donde una fórmula de anualidad
 *       `A·[((1+i)ⁿ−1)/i]` divide entre cero y devuelve NaN. Aquí, con capital inicial 0,
 *       500 €/mes y 10 años, la rama correcta es la degenerada **A·n**:
 *           500 € × 120 meses = 60.000,00 €
 *       y la volatilidad de la liquidez (0,5 % anual → σₘ = 0,1443 %) apenas separa la
 *       mediana de ese valor: el arrastre teórico es 500·Σⱼ e^(−1,04e−6·j) ≈ 60.000 − 4 €.
 *       Medido en 5 corridas: 59.972 · 59.975 · 59.996 · 60.004 · 60.045 (± 50 €).
 *       Además (1) 1,50 % · (2) √(1,0²·0,005²) = 0,50 % · (3) (1,5 − 2)/0,5 = −1,00 exacto,
 *       que es el único Sharpe NEGATIVO alcanzable en esta app y comprueba que el signo
 *       sobrevive al formateo.
 *
 *   CASO 3 — DEBE RECHAZARSE · pesos que no suman 100 %.
 *       Sobre la cartera por defecto (50/35/10/5) se sube RV al 100 % → total 150 %.
 *       La app NO debe simular: botón deshabilitado, ningún resultado y el estado vacío
 *       intacto. Al pulsar «Normalizar a 100%», factor = 100/150 = 0,6667 y
 *       Math.round: 100→67 · 35→23 · 10→7 · 5→3, que suman 100 y reabren el botón.
 *
 * ⚠️ `formatCurrency` (es-ES) NO separa el millar hasta cinco dígitos enteros: imprime
 *    «97.000,00 €» con punto pero «5318,79 €» sin él. Y el espacio antes del € es U+00A0.
 * ⚠️ `getByRole('alert')` NO sirve de ancla aquí: casa con el anunciador de rutas de Next
 *    (#__next-route-announcer__). El panel de resultados es el único role="status".
 */

const RUTA = '/estimador-cartera-inversion/';

/** Los cinco campos numéricos. Sirven de testigo de hidratación para toda la página. */
const ENTRADAS = ['#capitalInicial', '#aportacionMensual', '#horizonte', '#inflacion', '#objetivo'];

async function abrir(page: Page): Promise<void> {
  await page.goto(RUTA, { waitUntil: 'load' });
  await esperarHidratacion(page, ENTRADAS);
}

/** El panel de resultados: único role="status" de la página. */
function panel(page: Page): Locator {
  return page.getByRole('status');
}

function botonSimular(page: Page): Locator {
  return page.getByRole('button', { name: /Simular Cartera/ });
}

function deslizador(page: Page, activo: string): Locator {
  return page.getByLabel(`Peso de ${activo}`);
}

/** Texto del panel, normalizando el espacio duro que `formatCurrency` pone antes del €. */
async function textoPanel(page: Page): Promise<string> {
  return (await panel(page).innerText()).replace(/ /g, ' ');
}

function lineas(texto: string): string[] {
  return texto.split('\n').map(l => l.trim()).filter(Boolean);
}

/** Tarjeta de métrica: el valor va ENCIMA de su etiqueta. */
function metrica(texto: string, etiqueta: string): string {
  const ls = lineas(texto);
  const i = ls.findIndex(l => l === etiqueta || l.startsWith(etiqueta));
  if (i < 1) throw new Error(`No aparece la métrica «${etiqueta}» en:\n${texto}`);
  return ls[i - 1];
}

/** Fila de detalle: el valor va DEBAJO de su etiqueta. */
function detalle(texto: string, etiqueta: string): string {
  const ls = lineas(texto);
  const i = ls.findIndex(l => l === etiqueta);
  if (i < 0 || i === ls.length - 1) throw new Error(`No aparece el detalle «${etiqueta}» en:\n${texto}`);
  return ls[i + 1];
}

/** «161.748,42 €» → 161748.42 · «-2358,01 €» → -2358.01 */
function aNumero(importe: string): number {
  const encontrado = importe.match(/(-?[\d.]*\d),(\d{2})/);
  if (!encontrado) throw new Error(`«${importe}» no es un importe en formato español.`);
  const entero = Number(encontrado[1].replace(/\./g, ''));
  const centimos = Number(encontrado[2]) / 100;
  return entero < 0 ? entero - centimos : entero + centimos;
}

async function simularYEsperar(page: Page): Promise<string> {
  await botonSimular(page).click();
  await expect(panel(page)).toContainText('Capital final (mediana, en euros de hoy)', { timeout: 30_000 });
  await expect(panel(page)).toContainText('Total aportado (euros de hoy)');
  return textoPanel(page);
}

/** El porcentaje de una tarjeta de métrica, ya sin el signo ni el símbolo. */
function porcentaje(valor: string): number {
  return Number(valor.replace('%', '').replace('-', '').replace(',', '.').trim());
}

test.describe('Estimador de Cartera de Inversión', () => {
  test('CASO 1 · perfil Agresivo, 25.000 € + 300 €/mes a 20 años', async ({ page }) => {
    test.setTimeout(90_000);
    await abrir(page);

    // Agresivo = 90/5/0/5 (la cartera por defecto es 50/35/10/5, así que SÍ mueve los pesos).
    await page.getByRole('button', { name: 'Agresivo', exact: true }).click();
    await expect(deslizador(page, 'Renta Variable')).toHaveValue('90');
    await expect(deslizador(page, 'Renta Fija')).toHaveValue('5');
    await expect(deslizador(page, 'Liquidez')).toHaveValue('0');

    await sembrarValor(page, '#capitalInicial', '25000');   // por defecto 10.000
    await sembrarValor(page, '#aportacionMensual', '300');  // por defecto 200
    // Horizonte (20 años), inflación (2 %) y objetivo (100.000 €) se dejan por defecto.

    const texto = await simularYEsperar(page);

    // (1) Σ wᵢ·rᵢ = 0,90·7 + 0,05·3 + 0,05·5 = 6,70 %
    expect(detalle(texto, 'Rentabilidad nominal esperada')).toBe('6,70% anual');
    // Hallazgos 1129 y 1130 · la REAL, que es con la que proyecta, se enseña al lado y sale
    // de Fisher: 1,067/1,02 − 1 = 4,6078 %. Con la resta a secas sería 4,70 %.
    expect(detalle(texto, 'Rentabilidad real (la que proyecta)')).toBe('4,61% anual');
    // (2) Markowitz: √0,02165395 = 0,1471528
    expect(detalle(texto, 'Volatilidad cartera')).toBe('14,72% anual');
    // (3) (6,70 − 2) / 14,71528 = 0,3194
    expect(metrica(texto, 'Ratio de Sharpe')).toBe('0,32');
    // (4) La caída ya no es σ × 2,5 = 36,8 %: se mide en las trayectorias. Con σ = 14,7 %
    // y 240 meses, la mediana del máximo drawdown queda bastante por encima.
    const caida20 = porcentaje(metrica(texto, 'Caída máxima mediana'));
    expect(caida20).toBeGreaterThan(20);
    expect(caida20).toBeLessThan(90);
    // 25.000 + 300 × 20 × 12 = 97.000
    expect(detalle(texto, 'Total aportado (euros de hoy)')).toBe('97.000,00 €');

    // La mediana es estocástica (1.000 escenarios). Banda de ±13 % sobre los ≈157.000 €
    // calculados a mano: el error típico de la mediana es ≈3.000 € (1,2533·mediana·σ_ln/√n
    // con σ_ln ≈ 0,47), así que ±20.000 € son ~6 errores típicos — no puede saltar por ruido,
    // pero sí si el motor proyectase al tipo NOMINAL (6,70 % → ≈239.000 €) o se comiese las
    // aportaciones (≈51.500 €).
    const mediana = aNumero(metrica(texto, 'Capital final (mediana, en euros de hoy)'));
    expect(mediana).toBeGreaterThan(135_000);
    expect(mediana).toBeLessThan(185_000);

    // Coherencia interna: ganancia = mediana − total aportado, las dos en euros de hoy.
    const ganancia = aNumero(detalle(texto, 'Ganancia esperada (euros de hoy)'));
    expect(ganancia).toBeCloseTo(mediana - 97_000, 2);

    // Hallazgo 1132 · el testigo de que la caída se MIDE: a menos horizonte, menos
    // ocasiones de caer. Con la regla σ × 2,5 este valor no se movía ni un decimal.
    await sembrarValor(page, '#horizonte', '3');
    await botonSimular(page).click();
    // `expect.poll` espera a que la NUEVA simulación reemplace al panel: leer el texto
    // justo tras el clic devolvería todavía el resultado de los 20 años.
    await expect
      .poll(async () => porcentaje(metrica(await textoPanel(page), 'Caída máxima mediana')), { timeout: 30_000 })
      .toBeLessThan(caida20);

    // P5 < mediana < P95, y la probabilidad es un porcentaje válido.
    expect(aNumero(detalle(texto, 'Escenario pesimista (P5)'))).toBeLessThan(mediana);
    expect(aNumero(detalle(texto, 'Escenario optimista (P95)'))).toBeGreaterThan(mediana);
    const probabilidad = porcentaje(metrica(texto, 'Prob. alcanzar'));
    expect(probabilidad).toBeGreaterThan(50);
    expect(probabilidad).toBeLessThanOrEqual(100);
    // Hallazgo 1129 · el objetivo se compara con una proyección deflactada, y ahora se dice.
    expect(texto).toContain('de hoy');

    // Nivel 2 ALTO: aviso legal y disclaimer financiero NO colapsable.
    await expect(page.locator('[role="note"]').first()).toContainText('no constituye asesoramiento financiero');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Estimador de Cartera de Inversión');
  });

  test('CASO 2 · el límite del 0 %: rentabilidad real nula → mediana = A·n', async ({ page }) => {
    test.setTimeout(90_000);
    await abrir(page);

    // 100 % liquidez: 1,5 % nominal y σ 0,5 %. Con inflación 1,5 % el tipo REAL es 0.
    expect(await sembrarValorAcotado(page, deslizador(page, 'Liquidez'), 100)).toBe('100');
    expect(await sembrarValorAcotado(page, deslizador(page, 'Renta Variable'), 0)).toBe('0');
    expect(await sembrarValorAcotado(page, deslizador(page, 'Renta Fija'), 0)).toBe('0');
    expect(await sembrarValorAcotado(page, deslizador(page, 'Alternativos'), 0)).toBe('0');

    await sembrarValor(page, '#capitalInicial', '0');       // por defecto 10.000
    await sembrarValor(page, '#aportacionMensual', '500');  // por defecto 200
    await sembrarValor(page, '#horizonte', '10');           // por defecto 20
    await sembrarValor(page, '#inflacion', '1,5');          // por defecto 2
    await sembrarValor(page, '#objetivo', '60000');         // por defecto 100.000

    const texto = await simularYEsperar(page);

    // (1) 1,00 · 1,5 % = 1,50 %  ·  (2) √(1²·0,005²) = 0,5 %  ·  (3) (1,5 − 2)/0,5 = −1
    expect(detalle(texto, 'Rentabilidad nominal esperada')).toBe('1,50% anual');
    // Fisher: 1,015/1,015 − 1 = 0 exacto, igual que la resta. El límite se conserva.
    expect(detalle(texto, 'Rentabilidad real (la que proyecta)')).toBe('0,00% anual');
    expect(detalle(texto, 'Volatilidad cartera')).toBe('0,50% anual');
    expect(metrica(texto, 'Ratio de Sharpe')).toBe('-1,00');
    // 0 + 500 × 10 × 12 = 60.000
    expect(detalle(texto, 'Total aportado (euros de hoy)')).toBe('60.000,00 €');

    // EL LÍMITE: con tipo real 0 la anualidad degenera en A·n = 500 × 120 = 60.000 €.
    // Precisión −3 ⇒ |diferencia| < 500 €, y el defecto vigilado es de otro orden: NaN,
    // ∞ o un 0 por dividir entre i. El ruido Monte Carlo medido fue ±50 € (5 corridas).
    const mediana = aNumero(metrica(texto, 'Capital final (mediana, en euros de hoy)'));
    expect(Number.isFinite(mediana)).toBe(true);
    expect(mediana).toBeCloseTo(60_000, -3);

    // Y no se cuela ningún NaN/∞ en pantalla por el camino.
    expect(texto).not.toMatch(/NaN|∞|No definido/);

    // Con deriva nula, P5 y P95 abrazan los 60.000 € por los dos lados.
    expect(aNumero(detalle(texto, 'Escenario pesimista (P5)'))).toBeLessThan(60_000);
    expect(aNumero(detalle(texto, 'Escenario optimista (P95)'))).toBeGreaterThan(60_000);
  });

  test('CASO 3 · pesos que no suman 100 %: la app no debe simular', async ({ page }) => {
    test.setTimeout(90_000);
    await abrir(page);

    await expect(botonSimular(page)).toBeEnabled();

    // 100 + 35 + 10 + 5 = 150 % (por defecto es 50/35/10/5).
    expect(await sembrarValorAcotado(page, deslizador(page, 'Renta Variable'), 100)).toBe('100');

    await expect(page.getByText('150%')).toBeVisible();
    await expect(botonSimular(page)).toBeDisabled();
    await expect(botonSimular(page)).toHaveAttribute('aria-disabled', 'true');
    await expect(page.getByRole('button', { name: /Normalizar a 100%/ })).toBeVisible();

    // Hallazgo 1137 · el rechazo se ANUNCIA. Antes la única señal era el color del total
    // y un botón deshabilitado en silencio: con lector de pantalla no había forma de saber
    // por qué había dejado de funcionar.
    const motivo = page.getByRole('alert').filter({ hasText: 'tienen que sumar exactamente 100' });
    await expect(motivo).toHaveCount(1);
    await expect(motivo).toContainText('150');

    // Rechazo de verdad: ni resultados ni pérdida del estado vacío, ni un NaN en pantalla.
    await botonSimular(page).click({ force: true }).catch(() => { /* deshabilitado: no hace nada */ });
    await expect(panel(page)).toContainText('Configura tu simulación');
    await expect(panel(page)).not.toContainText('Capital Final (Mediana)');
    expect(await textoPanel(page)).not.toMatch(/NaN|∞/);

    // Normalizar: factor 100/150 = 0,6667 → round(66,67)=67 · round(23,33)=23 ·
    // round(6,67)=7 · round(3,33)=3, que suman exactamente 100.
    await page.getByRole('button', { name: /Normalizar a 100%/ }).click();
    await expect(deslizador(page, 'Renta Variable')).toHaveValue('67');
    await expect(deslizador(page, 'Renta Fija')).toHaveValue('23');
    await expect(deslizador(page, 'Liquidez')).toHaveValue('7');
    await expect(deslizador(page, 'Alternativos')).toHaveValue('3');
    await expect(botonSimular(page)).toBeEnabled();
    await expect(page.getByRole('alert').filter({ hasText: 'tienen que sumar exactamente 100' })).toHaveCount(0);
  });

  test('CASO 4 · los campos leen el formato español, y lo que no es un número se dice', async ({ page }) => {
    test.setTimeout(90_000);
    await abrir(page);

    // Hallazgo 1128 · con `type="number"` y `parseInt`, «1.500» entraba como 500 € y
    // «250,50» como 2.500 €/mes, en silencio: la proyección entera salía de una cifra que
    // el usuario nunca introdujo. Aquí se comprueba que el millar y el decimal se leen bien.
    await sembrarValor(page, '#capitalInicial', '1.500');
    await sembrarValor(page, '#aportacionMensual', '250,50');
    await sembrarValor(page, '#horizonte', '10');
    await sembrarValor(page, '#objetivo', '50.000');

    const texto = await simularYEsperar(page);
    // 1.500 + 250,50 × 10 × 12 = 1.500 + 30.060 = 31.560. Con el parseo viejo habrían
    // salido 500 + 2.500 × 120 = 300.500 €, un orden de magnitud distinto.
    expect(detalle(texto, 'Total aportado (euros de hoy)')).toBe('31.560,00 €');

    // Y el campo se puede vaciar sin que salte a 0: antes era imposible.
    await sembrarValor(page, '#capitalInicial', '');
    await expect(page.locator('#capitalInicial')).toHaveValue('');
    const aviso = page.getByRole('alert').filter({ hasText: 'Revisa estos datos' });
    await expect(aviso).toContainText('capital inicial');
    await expect(botonSimular(page)).toBeDisabled();

    // Lo que no es un número tampoco pasa por 0.
    await sembrarValor(page, '#capitalInicial', '1500abc');
    await expect(aviso).toContainText('capital inicial');
    await expect(botonSimular(page)).toBeDisabled();
  });

  test('CASO 5 · la tasa libre de riesgo del Sharpe está a la vista y se puede cambiar', async ({ page }) => {
    test.setTimeout(90_000);
    await abrir(page);

    // Hallazgo 1140 · estaba fijada en el código sin fuente, no se mostraba y no se podía
    // cambiar, pero decidía el SIGNO del indicador en carteras conservadoras.
    expect(await sembrarValorAcotado(page, deslizador(page, 'Liquidez'), 100)).toBe('100');
    expect(await sembrarValorAcotado(page, deslizador(page, 'Renta Variable'), 0)).toBe('0');
    expect(await sembrarValorAcotado(page, deslizador(page, 'Renta Fija'), 0)).toBe('0');
    expect(await sembrarValorAcotado(page, deslizador(page, 'Alternativos'), 0)).toBe('0');

    // Con el 2 % por omisión: (1,5 − 2) / 0,5 = −1,00.
    await expect(page.locator('#tasaLibre')).toHaveValue('2');
    expect(metrica(await simularYEsperar(page), 'Ratio de Sharpe')).toBe('-1,00');

    // Con el 1 %: (1,5 − 1) / 0,5 = +1,00. El mismo indicador cambia de signo, que es
    // exactamente por lo que no podía seguir siendo invisible.
    await sembrarValor(page, '#tasaLibre', '1');
    await botonSimular(page).click();
    await expect
      .poll(async () => metrica(await textoPanel(page), 'Ratio de Sharpe'), { timeout: 30_000 })
      .toBe('1,00');
  });
});
