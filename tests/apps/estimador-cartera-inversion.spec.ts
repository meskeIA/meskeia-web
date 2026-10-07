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
 * SEGUNDA INSPECCIÓN — 07/10/2026 (casos 6 a 23, al final del fichero)
 *   ⚠️ El bloque educativo se localiza por sus encabezados, NO por clase: 28 clases que usa
 *   el JSX (tableWrapper, escenarioCard, tipCard, warningBox, stepNumber…) no existen en
 *   EstimadorCartera.module.css y llegan al DOM sin clase. Con `[class*=…]` los casos 12,
 *   13, 18 y 21 fallaban (o pasaban) sin haber mirado nada, y un test.fail() lo tapaba.
 *   Las reparaciones del 21/09 siguen en pie (casos 1-5 en verde), salvo la de los emojis
 *   (hallazgo 1138): los botones ya llevan type="button", pero los emojis en nodo propio de
 *   los cuatro escenarios, las seis buenas prácticas y el recuadro de errores siguen sin
 *   aria-hidden (caso 18).
 *
 *   LA SEMILLA. El motor usa Math.random sin semilla, pero se puede sustituir desde el test
 *   justo antes de pulsar «Simular» (`sembrarAzar`): con mulberry32(20261007) la app da, al
 *   céntimo, lo mismo que una RÉPLICA independiente del modelo que declara (Box-Muller con
 *   u y v por mes, rₘ = r_real/12 + σ/√12·z, aportación al final de mes, mediana = elemento
 *   500 de 1.000). Valores de la réplica con esa semilla e inflación 2 %:
 *     · por defecto (10.000 € + 200 €/mes, 20 años, 50/35/10/5): mediana 79.651,02 € ·
 *       P5 52.271,44 € · P95 122.646,74 € · caída mediana 25,03 % · caída P95 42,64 % ·
 *       prob(≥100.000 €) 18,9 % · prob(≥50.000 €) 96,7 % (MISMAS 1.000 trayectorias).
 *     · límite (10.000 €, 0 €/mes, 1 año, 100/0/0/0): mediana 10.307,50 € · P5 7910,89 € ·
 *       P95 13.270,53 € · caída mediana 11,56 %.
 *     · ejemplos del bloque educativo: «Joven» 211.429,82 € · «Familia» 183.952,70 € ·
 *       «Pre-jubilado» 163.898,77 € · «Conservador 35» 89.265,23 €. Sin semilla (40 corridas
 *       de 1.000): 213.539 · 187.880 · 164.381 · 89.677 €. La página dice ~230.000 ·
 *       ~200.000 · ~170.000 · ~90.000.
 *
 *   A MANO (deterministas, sin semilla):
 *     · 50/40/10/0 (fila «Moderado» de la tabla de perfiles): r = 0,5·7 + 0,4·3 + 0,1·1,5 =
 *       4,85 % · a = (0,08; 0,02; 0,0005; 0) · diag 0,00680025 + cruzados 2·(0,0004 +
 *       0,000004 + 0,0000005) = 0,000809 → σ² 0,00760925 → σ 8,72 % · real 1,0485/1,02 − 1
 *       = 2,79 % · Sharpe (4,85 − 2)/8,7231 = 0,33. La tabla dice 5-6 % y 10-12 %.
 *       20/70/10/0 («Conservador»): 3,65 % y σ 5,30 % (tabla: volatilidad 6-8 %).
 *       80/15/5/0 («Agresivo»): 6,125 % y σ 13,01 % (tabla: 7-8 % y 14-18 %).
 *     · Límite 100/0/0/0: r 7,00 % · σ 16,00 % · real 1,07/1,02 − 1 = 4,90 % ·
 *       Sharpe (7 − 2)/16 = 0,3125 → 0,31 · aportado 10.000,00 € · prob(100.000) 0,0 %.
 *     · Normalizar: 60/35/10/5 (110 %) → ×100/110 → round(54,55; 31,82; 9,09; 4,55) =
 *       55/32/9/5 = 101 %. 50/50/50/0 (150 %) → 33/33/33/0 = 99 %, y otra vez ×100/99 →
 *       round(33,33) = 33: se queda en 99 % para siempre.
 *     · 100 % RF con tasa libre 0: Sharpe = 3/5 = 0,60 (la tarjeta: «0,5+ aceptable, 1+
 *       bueno»; el FAQPage: «superior a 1 se considera bueno»).
 *     · Ejemplo del TER: 50.000·1,058²⁰ = 154.413 € y 50.000·1,045²⁰ = 120.586 €, 33.827 € de
 *       diferencia (multiplicando 1,06·(1−TER): 154.063 y 118.526). La página: ~157.000,
 *       ~139.000 y 18.000 €.
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
    expect(detalle(texto, 'Rentabilidad nominal esperada')).toBe('6,70 % anual');
    // Hallazgos 1129 y 1130 · la REAL, que es con la que proyecta, se enseña al lado y sale
    // de Fisher: 1,067/1,02 − 1 = 4,6078 %. Con la resta a secas sería 4,70 %.
    expect(detalle(texto, 'Rentabilidad real (la que proyecta)')).toBe('4,61 % anual');
    // (2) Markowitz: √0,02165395 = 0,1471528
    expect(detalle(texto, 'Volatilidad cartera')).toBe('14,72 % anual');
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
    expect(aNumero(detalle(texto, 'Escenario pesimista (percentil 5)'))).toBeLessThan(mediana);
    expect(aNumero(detalle(texto, 'Escenario optimista (percentil 95)'))).toBeGreaterThan(mediana);
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
    expect(detalle(texto, 'Rentabilidad nominal esperada')).toBe('1,50 % anual');
    // Fisher: 1,015/1,015 − 1 = 0 exacto, igual que la resta. El límite se conserva.
    expect(detalle(texto, 'Rentabilidad real (la que proyecta)')).toBe('0,00 % anual');
    expect(detalle(texto, 'Volatilidad cartera')).toBe('0,50 % anual');
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
    expect(aNumero(detalle(texto, 'Escenario pesimista (percentil 5)'))).toBeLessThan(60_000);
    expect(aNumero(detalle(texto, 'Escenario optimista (percentil 95)'))).toBeGreaterThan(60_000);
  });

  test('CASO 3 · pesos que no suman 100 %: la app no debe simular', async ({ page }) => {
    test.setTimeout(90_000);
    await abrir(page);

    await expect(botonSimular(page)).toBeEnabled();

    // 100 + 35 + 10 + 5 = 150 % (por defecto es 50/35/10/5).
    expect(await sembrarValorAcotado(page, deslizador(page, 'Renta Variable'), 100)).toBe('100');

    await expect(page.getByText(/^150\s%$/)).toBeVisible();
    await expect(botonSimular(page)).toBeDisabled();
    await expect(botonSimular(page)).toHaveAttribute('aria-disabled', 'true');
    await expect(page.getByRole('button', { name: /Normalizar a 100\s?%/ })).toBeVisible();

    // Hallazgo 1137 · el rechazo se ANUNCIA. Antes la única señal era el color del total
    // y un botón deshabilitado en silencio: con lector de pantalla no había forma de saber
    // por qué había dejado de funcionar.
    const motivo = page.getByRole('alert').filter({ hasText: 'tienen que sumar exactamente 100' });
    await expect(motivo).toHaveCount(1);
    await expect(motivo).toContainText('150');

    // Rechazo de verdad: ni resultados ni pérdida del estado vacío, ni un NaN en pantalla.
    await botonSimular(page).click({ force: true }).catch(() => { /* deshabilitado: no hace nada */ });
    await expect(panel(page)).toContainText('Configura tu simulación');
    // 07/10/2026: aquí ponía «Capital Final (Mediana)», el rótulo de ANTES de la reparación
    // del 21/09, así que la comprobación pasaba siempre sin mirar nada. Es el rótulo vigente.
    await expect(panel(page)).not.toContainText('Capital final (mediana');
    expect(await textoPanel(page)).not.toMatch(/NaN|∞/);

    // Normalizar: factor 100/150 = 0,6667 → round(66,67)=67 · round(23,33)=23 ·
    // round(6,67)=7 · round(3,33)=3, que suman exactamente 100.
    await page.getByRole('button', { name: /Normalizar a 100\s?%/ }).click();
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

// ═══════════════════════ SEGUNDA INSPECCIÓN · 07/10/2026 ═══════════════════════

/** La semilla de los casos deterministas. Los valores esperados salen de la réplica (cabecera). */
const SEMILLA = 20261007;

/**
 * Sustituye Math.random por mulberry32(semilla) en la página. Se llama JUSTO antes de pulsar
 * «Simular»: entre ese instante y la simulación nada más consume números aleatorios (medido:
 * dos corridas con la misma semilla dan el mismo panel al céntimo, y el mismo que la réplica).
 */
async function sembrarAzar(page: Page, semilla: number): Promise<void> {
  await page.evaluate((s) => {
    let a = s;
    Math.random = () => {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }, semilla);
}

/**
 * Pulsa «Simular» y espera a que el panel CAMBIE respecto a lo que había. Ojo: con las mismas
 * entradas y la misma semilla el panel no cambia nunca; los casos siempre mueven algo antes.
 */
async function simularNuevo(page: Page): Promise<string> {
  const antes = await textoPanel(page);
  await botonSimular(page).click();
  await expect
    .poll(async () => {
      const t = await textoPanel(page);
      return t !== antes && t.includes('Total aportado (euros de hoy)');
    }, { timeout: 30_000 })
    .toBe(true);
  return textoPanel(page);
}

async function simularConSemilla(page: Page, semilla: number = SEMILLA): Promise<string> {
  await sembrarAzar(page, semilla);
  return simularNuevo(page);
}

async function fijarPesos(page: Page, rv: number, rf: number, liq: number, alt: number): Promise<void> {
  expect(await sembrarValorAcotado(page, deslizador(page, 'Renta Variable'), rv)).toBe(String(rv));
  expect(await sembrarValorAcotado(page, deslizador(page, 'Renta Fija'), rf)).toBe(String(rf));
  expect(await sembrarValorAcotado(page, deslizador(page, 'Liquidez'), liq)).toBe(String(liq));
  expect(await sembrarValorAcotado(page, deslizador(page, 'Alternativos'), alt)).toBe(String(alt));
}

/** «4,85% anual» o «4,85 % anual» → 4.85 */
function porcentajeDe(texto: string): number {
  const m = texto.replace(/ /g, ' ').match(/(-?\d+(?:,\d+)?)\s?%/);
  if (!m) throw new Error(`«${texto}» no lleva un porcentaje.`);
  return Number(m[1].replace(',', '.'));
}

/** El total de pesos que pinta la app («Total: 101%»). */
async function totalPesos(page: Page): Promise<number> {
  return porcentajeDe(await page.locator('[class*="totalPesos"]').innerText());
}

/**
 * Las «tarjetas» de una sección del bloque educativo, localizadas por su <h2> y NO por clase:
 * 28 de las clases que usa el JSX de esta app no existen en su .module.css (caso 23), así que
 * esos nodos llegan al DOM sin ninguna clase y un `[class*="tipCard"]` no encuentra nada
 * —y un test.fail() lo daría por bueno sin haber mirado—. `niveles` sube desde el encabezado
 * de la tarjeta hasta la tarjeta: 2 en los escenarios (h3 › cabecera › tarjeta), 1 en las
 * buenas prácticas (h4 › tarjeta). Funciona con el bloque plegado: está montado, solo oculto.
 */
async function tarjetasDeSeccion(page: Page, tituloSeccion: string, encabezado: 'h3' | 'h4', niveles: number): Promise<string[]> {
  return page.evaluate(([titulo, etiqueta, subir]) => {
    const h2 = Array.from(document.querySelectorAll('h2')).find((h) => (h.textContent || '').includes(titulo));
    const seccion = h2?.closest('section');
    if (!seccion) return [];
    return Array.from(seccion.querySelectorAll(etiqueta)).map((h) => {
      let tarjeta: Element | null = h;
      for (let i = 0; i < subir && tarjeta; i++) tarjeta = tarjeta.parentElement;
      return (tarjeta?.textContent || '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
    });
  }, [tituloSeccion, encabezado, niveles] as const);
}

/** Texto entero de la <section> cuyo <h2> contiene `tituloSeccion`. */
async function textoDeSeccion(page: Page, tituloSeccion: string): Promise<string> {
  return page.evaluate((titulo) => {
    const h2 = Array.from(document.querySelectorAll('h2')).find((h) => (h.textContent || '').includes(titulo));
    return (h2?.closest('section')?.textContent || '').replace(/\s+/g, ' ').trim();
  }, tituloSeccion);
}

/** Texto del bloque educativo: está montado aunque nazca plegado. */
async function textoEducativo(page: Page, selector: string): Promise<string[]> {
  return page.locator(selector).evaluateAll((els) =>
    els.map((el) => (el.textContent || '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim()),
  );
}

test.describe('Segunda inspección (07/10/2026) · lo que sigue en pie', () => {
  test('CASO 6 · con la semilla fijada, el motor da al céntimo lo que la réplica del modelo', async ({ page }) => {
    test.setTimeout(90_000);
    await abrir(page);

    // Por defecto: 10.000 € + 200 €/mes, 20 años, inflación 2 %, Equilibrado 50/35/10/5.
    const texto = await simularConSemilla(page);
    // Precisión −1 (±5 €): el defecto más pequeño que vigila —aportar a principio de mes en
    // vez de al final— mueve la mediana unos 200 €; Fisher frente a la resta, ~1.000 €.
    expect(aNumero(metrica(texto, 'Capital final (mediana, en euros de hoy)'))).toBeCloseTo(79_651.02, -1);
    expect(aNumero(detalle(texto, 'Escenario pesimista (percentil 5)'))).toBeCloseTo(52_271.44, -1);
    expect(aNumero(detalle(texto, 'Escenario optimista (percentil 95)'))).toBeCloseTo(122_646.74, -1);
    // 10.000 + 200 × 240 = 58.000
    expect(detalle(texto, 'Total aportado (euros de hoy)')).toBe('58.000,00 €');
    // Caída medida en las trayectorias (hallazgo 1132): 25,03 % la mediana, 42,64 % la del P95.
    expect(porcentaje(metrica(texto, 'Caída máxima mediana'))).toBeCloseTo(25.0, 1);
    const p95 = texto.match(/llega\s+a\s+[−-]\s?(\d+,\d)\s?%/);
    expect(p95?.[1]).toBe('42,6');
    // prob(≥ 100.000 €) en esas mismas 1.000 trayectorias: 189 de 1.000.
    expect(porcentaje(metrica(texto, 'Prob. alcanzar'))).toBeCloseTo(18.9, 1);

    // Ejemplo «Joven inversor» del bloque educativo: 10.000 € + 300 €/mes, 30 años, 80/15/5/0.
    await fijarPesos(page, 80, 15, 5, 0);
    await sembrarValor(page, '#aportacionMensual', '300');
    await sembrarValor(page, '#horizonte', '30');
    const joven = await simularConSemilla(page);
    expect(aNumero(metrica(joven, 'Capital final (mediana, en euros de hoy)'))).toBeCloseTo(211_429.82, -1);
  });

  test('CASO 7 · límite: 1 año, 0 €/mes y 100 % renta variable', async ({ page }) => {
    test.setTimeout(90_000);
    await abrir(page);

    await fijarPesos(page, 100, 0, 0, 0);
    await sembrarValor(page, '#aportacionMensual', '0');  // por defecto 200
    await sembrarValor(page, '#horizonte', '1');           // por defecto 20; es el mínimo
    // Capital (10.000 €), inflación (2 %) y objetivo (100.000 €) por defecto.

    const texto = await simularConSemilla(page);
    expect(detalle(texto, 'Rentabilidad nominal esperada')).toBe('7,00 % anual');
    // Fisher: 1,07/1,02 − 1 = 4,902 %
    expect(detalle(texto, 'Rentabilidad real (la que proyecta)')).toBe('4,90 % anual');
    expect(detalle(texto, 'Volatilidad cartera')).toBe('16,00 % anual');
    // (7 − 2)/16 = 0,3125
    expect(metrica(texto, 'Ratio de Sharpe')).toBe('0,31');
    // Sin aportaciones, lo aportado es el capital.
    expect(detalle(texto, 'Total aportado (euros de hoy)')).toBe('10.000,00 €');
    const mediana = aNumero(metrica(texto, 'Capital final (mediana, en euros de hoy)'));
    expect(mediana).toBeCloseTo(10_307.5, -1);
    expect(aNumero(detalle(texto, 'Ganancia esperada (euros de hoy)'))).toBeCloseTo(mediana - 10_000, 2);
    expect(aNumero(detalle(texto, 'Escenario pesimista (percentil 5)'))).toBeCloseTo(7910.89, -1);
    // Nadie llega a 100.000 € en un año partiendo de 10.000.
    expect(metrica(texto, 'Prob. alcanzar')).toBe('0,0 %');
    expect(texto).not.toMatch(/NaN|∞/);
  });

  test('CASO 8 · lo que debe rechazarse: horizonte fuera de 1-50, capital negativo, inflación negativa', async ({ page }) => {
    test.setTimeout(60_000);
    await abrir(page);
    const aviso = page.getByRole('alert').filter({ hasText: 'Revisa estos datos' });

    await sembrarValor(page, '#horizonte', '50');   // el máximo se admite
    await expect(aviso).toHaveCount(0);
    await expect(botonSimular(page)).toBeEnabled();

    await sembrarValor(page, '#horizonte', '51');
    await expect(aviso).toContainText('horizonte (1 – 50 años)');
    await expect(botonSimular(page)).toBeDisabled();

    await sembrarValor(page, '#horizonte', '0');
    await expect(aviso).toContainText('horizonte (1 – 50 años)');
    await expect(botonSimular(page)).toBeDisabled();

    await sembrarValor(page, '#horizonte', '20');
    await sembrarValor(page, '#capitalInicial', '-5.000');
    await expect(aviso).toContainText('capital inicial');
    await expect(botonSimular(page)).toBeDisabled();

    await sembrarValor(page, '#capitalInicial', '10.000');
    await sembrarValor(page, '#inflacion', '-1');
    await expect(aviso).toContainText('inflación');
    await expect(botonSimular(page)).toBeDisabled();
    await expect(panel(page)).toContainText('Configura tu simulación');
  });

  test('CASO 16 · ?perfil=agresivo (enlace del test de perfil) carga 90/5/0/5 y su aviso', async ({ page }) => {
    // Vigila la reparación del caso 15: envolver useSearchParams en <Suspense> no puede
    // romper la llegada desde /test-perfil-inversor/.
    test.setTimeout(60_000);
    await page.goto(`${RUTA}?perfil=agresivo`, { waitUntil: 'load' });
    await esperarHidratacion(page, ENTRADAS);
    await expect(deslizador(page, 'Renta Variable')).toHaveValue('90');
    await expect(deslizador(page, 'Renta Fija')).toHaveValue('5');
    await expect(deslizador(page, 'Liquidez')).toHaveValue('0');
    await expect(deslizador(page, 'Alternativos')).toHaveValue('5');
    await expect(page.getByRole('button', { name: 'Agresivo', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByText(/Simulando con tu perfil/)).toContainText('Agresivo');
  });
});

test.describe('Segunda inspección (07/10/2026) · en móvil (390 px)', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  test('CASO 7-móvil · el mismo límite da lo mismo y la página no desborda', async ({ page }) => {
    test.setTimeout(90_000);
    await abrir(page);
    await fijarPesos(page, 100, 0, 0, 0);
    await sembrarValor(page, '#aportacionMensual', '0');
    await sembrarValor(page, '#horizonte', '1');
    const texto = await simularConSemilla(page);
    expect(aNumero(metrica(texto, 'Capital final (mediana, en euros de hoy)'))).toBeCloseTo(10_307.5, -1);
    expect(detalle(texto, 'Total aportado (euros de hoy)')).toBe('10.000,00 €');
    const anchos = await page.evaluate(() => ({
      pagina: document.documentElement.scrollWidth,
      ventana: document.documentElement.clientWidth,
    }));
    expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
  });

  test('CASO 23 · la tabla de perfiles se corta a 390 px: «Horizonte temporal» e «Ideal para...» quedan fuera', async ({ page }) => {
    test.setTimeout(60_000);
    await abrir(page);
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const tabla = page.locator('table').filter({ hasText: 'Perfil (botón de arriba)' });
    await expect(tabla).toBeVisible();
    // Medido hoy: la tabla mide 546 px y su borde derecho cae en x = 579 con una ventana de
    // 390; «Horizonte temporal» empieza en x = 412. Ningún contenedor desplaza en horizontal
    // (body: overflow-x hidden), así que esas columnas NO se pueden leer de ninguna forma.
    const medida = await tabla.evaluate((t) => {
      const ventana = document.documentElement.clientWidth;
      let desplazable = false;
      for (let el = t.parentElement; el && el !== document.body; el = el.parentElement) {
        const ox = getComputedStyle(el).overflowX;
        if ((ox === 'auto' || ox === 'scroll') && el.scrollWidth > el.clientWidth) desplazable = true;
      }
      return { derecha: t.getBoundingClientRect().right, ventana, desplazable };
    });
    expect(medida.derecha <= medida.ventana || medida.desplazable, JSON.stringify(medida)).toBe(true);
  });
});

test.describe('Segunda inspección (07/10/2026) · hallazgos REPARADOS el 07/10/2026', () => {
  test('CASO 9 · el panel mezcla la simulación hecha con campos cambiados DESPUÉS', async ({ page }) => {
    test.setTimeout(90_000);
    await abrir(page);

    const texto = await simularConSemilla(page);
    expect(porcentaje(metrica(texto, 'Prob. alcanzar'))).toBeCloseTo(18.9, 1);

    // Sin volver a simular, el objetivo pasa de 100.000 a 50.000 €. En esas MISMAS 1.000
    // trayectorias, 967 acaban por encima de 50.000 €: 96,7 %. Vale cualquiera de las dos
    // salidas honestas —rotular el objetivo con el que se calculó, o recalcular—, pero no
    // «18,9 % de alcanzar 50.000 €».
    await sembrarValor(page, '#objetivo', '50.000');
    const tras = await textoPanel(page);
    if (tras.includes('Prob. alcanzar')) {
      const ls = lineas(tras);
      const rotulo = ls.find((l) => l.startsWith('Prob. alcanzar')) ?? '';
      const prob = porcentaje(metrica(tras, 'Prob. alcanzar'));
      if (rotulo.includes('50.000')) expect(prob).toBeCloseTo(96.7, 1);
      else expect(rotulo).toContain('100.000');
    }

    // Y el horizonte pasa de 20 a 30 años, también sin volver a simular. Si la mediana sigue
    // siendo la de 20 años, lo aportado tiene que ser el de 20 años (58.000 €) y la ganancia,
    // mediana − 58.000; la app enseña 82.000 € y −2348,98 €.
    await sembrarValor(page, '#horizonte', '30');
    const tras2 = await textoPanel(page);
    if (tras2.includes('Capital final (mediana')) {
      const mediana = aNumero(metrica(tras2, 'Capital final (mediana, en euros de hoy)'));
      if (Math.abs(mediana - 79_651.02) < 5) {
        expect(detalle(tras2, 'Total aportado (euros de hoy)')).toBe('58.000,00 €');
        expect(aNumero(detalle(tras2, 'Ganancia esperada (euros de hoy)'))).toBeCloseTo(79_651.02 - 58_000, 0);
      }
    }
  });

  test('CASO 10 · «Normalizar a 100%» deja 101 % o 99 % y el botón sigue bloqueado', async ({ page }) => {
    test.setTimeout(60_000);
    await abrir(page);
    const normalizar = page.getByRole('button', { name: /Normalizar a 100\s?%/ });

    // 60/35/10/5 = 110 % → round(54,55 · 31,82 · 9,09 · 4,55) = 55/32/9/5 = 101 %.
    expect(await sembrarValorAcotado(page, deslizador(page, 'Renta Variable'), 60)).toBe('60');
    await normalizar.click();
    await expect.poll(() => totalPesos(page)).toBe(100);
    await expect(botonSimular(page)).toBeEnabled();

    // 50/50/50/0 = 150 % → 33/33/33/0 = 99 %, y pulsar otra vez no lo mueve (×100/99 → 33).
    await fijarPesos(page, 50, 50, 50, 0);
    await normalizar.click();
    await expect.poll(() => totalPesos(page)).toBe(100);
  });

  test('CASO 11 · la tabla «Perfiles de inversor» concuerda con los botones y con el motor', async ({ page }) => {
    test.setTimeout(150_000);
    await abrir(page);

    // REPARADO el 07/10/2026: la tabla sale de PERFILES_PREDEFINIDOS y de calcularParametrosCartera.
    // Ya no da rangos sino el valor del motor, así que se compara al céntimo con «Detalles».
    const filas = await page
      .locator('table')
      .filter({ hasText: 'Perfil (botón de arriba)' })
      .locator('tbody tr')
      .evaluateAll((trs) =>
        trs.map((tr) => Array.from(tr.querySelectorAll('td')).map((td) => (td.textContent || '').replace(/ /g, ' ').trim())),
      );
    const pct = (texto: string, re: RegExp): number => Number(texto.match(re)?.[1] ?? 0);
    const rango = (texto: string): [number, number] | null => {
      const m = texto.match(/(\d+(?:,\d+)?)\s?[-–]\s?(\d+(?:,\d+)?)\s?%/);
      return m ? [Number(m[1].replace(',', '.')), Number(m[2].replace(',', '.'))] : null;
    };

    const discrepancias: string[] = [];
    let comprobadas = 0;
    for (const celdas of filas) {
      if (celdas.length < 4) continue; // la fila de la nota a pie
      const [perfil, comp, rent, vol] = celdas;
      const rv = pct(comp, /(\d+)\s?%\s*RV/i);
      const rf = pct(comp, /(\d+)\s?%\s*RF/i);
      const liq = pct(comp, /(\d+)\s?%\s*Liquidez/i);
      const alt = pct(comp, /(\d+)\s?%\s*Alternativos/i);
      expect(rv + rf + liq + alt, `composición de «${perfil}»`).toBe(100);
      // El botón del mismo nombre carga ESA composición (antes, tres «Conservador» distintos)
      await page.getByRole('button', { name: perfil, exact: true }).click();
      await expect.poll(() => totalPesos(page)).toBe(100);
      const texto = await simularNuevo(page);
      const nominal = porcentajeDe(detalle(texto, 'Rentabilidad nominal esperada'));
      const sigma = porcentajeDe(detalle(texto, 'Volatilidad cartera'));
      const rRango = rango(rent);
      const vRango = rango(vol);
      if (rRango && (nominal < rRango[0] || nominal > rRango[1])) discrepancias.push(`${perfil}: rentabilidad ${nominal} fuera de ${rent}`);
      if (vRango && (sigma < vRango[0] || sigma > vRango[1])) discrepancias.push(`${perfil}: volatilidad ${sigma} fuera de ${vol}`);
      if (!rRango && porcentajeDe(rent) !== nominal) discrepancias.push(`${perfil}: tabla ${rent}, motor ${nominal}`);
      if (!vRango && porcentajeDe(vol) !== sigma) discrepancias.push(`${perfil}: tabla ${vol}, motor ${sigma}`);
      comprobadas++;
    }
    expect(comprobadas).toBe(5);
    // Hoy: Conservador vol 5,3 ∉ 6-8 · Moderado 4,85 ∉ 5-6 y 8,72 ∉ 10-12 · Agresivo 6,13 ∉ 7-8 y 13,01 ∉ 14-18.
    expect(discrepancias).toEqual([]);
  });

  test('CASO 12 · los ejemplos del bloque educativo prometen más mediana de la que da el motor', async ({ page }) => {
    test.setTimeout(150_000);
    await abrir(page);

    const tarjetas = await tarjetasDeSeccion(page, 'Perfiles de inversores y estrategias reales', 'h3', 2);
    expect(tarjetas).toHaveLength(4);
    const importe = (t: string, re: RegExp): number => {
      const m = t.match(re);
      if (!m) throw new Error(`No encuentro ${re} en: ${t}`);
      return Number(m[1].replace(/\./g, ''));
    };
    const discrepancias: string[] = [];
    for (const t of tarjetas) {
      const capital = importe(t, /Capital inicial:\s*([\d.]+)\s?€/);
      const aportacion = importe(t, /Aportación mensual:\s*([\d.]+)\s?€/);
      const anos = importe(t, /Horizonte:\s*(\d+)\s*años/);
      const prometido = importe(t, /~\s?([\d.]+)\s?€/);
      const rv = Number(t.match(/(\d+)\s?%\s*RV/)?.[1] ?? 0);
      const rf = Number(t.match(/(\d+)\s?%\s*RF/)?.[1] ?? 0);
      const liq = Number(t.match(/(\d+)\s?%\s*Liquidez/)?.[1] ?? 0);
      await fijarPesos(page, rv, rf, liq, 0);
      await sembrarValor(page, '#capitalInicial', String(capital));
      await sembrarValor(page, '#aportacionMensual', String(aportacion));
      await sembrarValor(page, '#horizonte', String(anos));
      const mediana = aNumero(metrica(await simularConSemilla(page), 'Capital final (mediana, en euros de hoy)'));
      // ±5 %: el error de la mediana con 1.000 escenarios es ~2 % y redondear a «~X0.000»
      // mueve hasta ~3 %. Hoy: 230.000/211.430 = +8,8 % · 200.000/183.953 = +8,7 % ·
      // 170.000/163.899 = +3,7 % · 90.000/89.265 = +0,8 %.
      if (Math.abs(prometido / mediana - 1) > 0.05) {
        discrepancias.push(`${t.slice(0, 30)}…: la página ~${prometido} €, el motor ${Math.round(mediana)} €`);
      }
    }
    expect(discrepancias).toEqual([]);
  });

  test('CASO 13 · el ejemplo del TER se queda en la mitad de lo que cuestan las comisiones', async ({ page }) => {
    await abrir(page);
    const [tarjeta] = (await tarjetasDeSeccion(page, 'Mejores prácticas', 'h4', 1)).filter((t) => t.includes('TER') && t.includes('50.000'));
    expect(tarjeta, 'tarjeta «Minimiza costes»').toBeTruthy();
    const importes = Array.from(tarjeta.matchAll(/(\d{1,3}(?:\.\d{3})+)\s?€/g)).map((m) => Number(m[1].replace(/\./g, '')));
    // Las tolerancias admiten las dos convenciones (restar el TER: 154.413 y 120.586; o
    // multiplicar por 1 − TER: 154.063 y 118.526) y nada más: el ~157.000 de hoy queda a
    // +1,7 % y el ~139.000, a +15 %.
    const cerca = (objetivo: number, tolerancia: number) =>
      importes.some((x) => Math.abs(x / objetivo - 1) <= tolerancia);
    expect(cerca(154_413, 0.01), `ningún importe cerca de 154.413 en ${importes.join(' · ')}`).toBe(true);
    expect(cerca(120_586, 0.02), `ningún importe cerca de 120.586 en ${importes.join(' · ')}`).toBe(true);
  });

  test('CASO 14 · un Sharpe de 0,60 sale como «Buena relación», y la tarjeta y el FAQPage dicen que bueno es > 1', async ({ page }) => {
    test.setTimeout(90_000);
    await abrir(page);
    await fijarPesos(page, 0, 100, 0, 0);
    await sembrarValor(page, '#tasaLibre', '0');
    const texto = await simularNuevo(page);
    // 100 % RF: (3 − 0) / 5 = 0,60
    expect(metrica(texto, 'Ratio de Sharpe')).toBe('0,60');
    const interpretacion = lineas(texto).find((l) => l.startsWith('Sharpe Ratio:')) ?? '';
    expect(interpretacion).not.toMatch(/Buena relación/);
  });

  test('CASO 15 · sin JavaScript el HTML servido no trae ni la app, ni el <h1>, ni los JSON-LD', async ({ request }) => {
    const res = await request.get(RUTA);
    expect(res.status()).toBe(200);
    const html = await res.text();
    expect(html).toContain('<title>Estimador de Cartera de Inversión - Monte Carlo | meskeIA</title>');

    const tipos = Array.from(html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)).map((m) => {
      try {
        return String((JSON.parse(m[1]) as Record<string, unknown>)['@type']);
      } catch {
        return 'JSON inválido';
      }
    });
    // §1.ter del CLAUDE.md: WebApplication + FAQPage en el HTML (hoy: ninguno).
    expect(tipos).toEqual(expect.arrayContaining(['WebApplication', 'FAQPage']));
    expect(html).toMatch(/<h1[^>]*>[^<]*Estimador de Cartera de Inversión/);
    expect(html).toContain('id="capitalInicial"');
    expect(html).not.toContain('BAILOUT_TO_CLIENT_SIDE_RENDERING');
  });

  test('CASO 17 · formato español: «Rent: 1.5%» con punto decimal y el % pegado', async ({ page }) => {
    test.setTimeout(90_000);
    await abrir(page);
    const metas = (await page.locator('[class*="pesoMeta"]').allInnerTexts()).join(' | ');
    expect(metas).not.toMatch(/\d\.\d/);
    expect(await page.getByText('Un Sharpe de 0.5+').count()).toBe(0);
    const texto = await simularNuevo(page);
    // Con espacio duro (U+00A0, que textoPanel normaliza a espacio): «4,95 % anual».
    expect(detalle(texto, 'Rentabilidad nominal esperada')).toMatch(/\d %/);
  });

  test('CASO 18 · emojis decorativos en nodo propio, sin aria-hidden (resto del hallazgo 1138)', async ({ page }) => {
    await abrir(page);
    // Por estructura y no por clase (ver `tarjetasDeSeccion`): las secciones de escenarios y
    // de buenas prácticas, la caja de errores y el estado vacío del panel de resultados.
    const { raices, expuestos } = await page.evaluate(() => {
      const texto = (el: Element) => (el.textContent || '').trim();
      const esEmoji = (t: string) => t.length > 0 && /^[\p{Extended_Pictographic}\u{FE0F}\u{200D}]+$/u.test(t);
      const seccion = (titulo: string) =>
        Array.from(document.querySelectorAll('h2')).find((h) => texto(h).includes(titulo))?.closest('section') ?? null;
      const cajaErrores =
        Array.from(document.querySelectorAll('h3')).find((h) => texto(h).includes('Errores costosos'))?.parentElement?.parentElement ?? null;
      const lista = [
        seccion('Perfiles de inversores y estrategias reales'),
        seccion('Mejores prácticas'),
        cajaErrores,
        document.querySelector('[role="status"]'),
      ].filter((r): r is Element => r !== null);
      const sueltos: string[] = [];
      for (const r of lista) {
        for (const el of Array.from(r.querySelectorAll('span, div'))) {
          if (el.children.length === 0 && esEmoji(texto(el)) && !el.closest('[aria-hidden="true"]') && !el.hasAttribute('aria-label')) {
            sueltos.push(texto(el));
          }
        }
      }
      return { raices: lista.length, expuestos: sueltos };
    });
    expect(raices).toBe(4);
    // Hoy: 👨‍💻 👨‍👩‍👧 🏖️ 🛡️ · ✅ ×6 · ⚠️ · y en el estado vacío 📊 🎲 📈 📊.
    expect(expuestos).toEqual([]);
  });

  test('CASO 19 · «pesimista» es el P5 en los detalles y el P10 en la leyenda y el bloque educativo', async ({ page }) => {
    test.setTimeout(90_000);
    await abrir(page);
    const texto = await simularNuevo(page);
    const enDetalles = lineas(texto).find((l) => /pesimista/i.test(l))?.match(/(?:P|percentil )(\d+)/)?.[1];
    const educativo = (await textoEducativo(page, '[class*="contentCard"]')).join(' ').replace(/\s+/g, ' ');
    // REPARADO: la tarjeta «Percentiles» dice qué percentil es el pesimista en «Detalles», y la
    // leyenda del gráfico ya no llama «pesimista» al 10.
    const enEducativo = educativo.match(/pesimista es el percentil (\d+)/i)?.[1];
    expect(enDetalles).toBeTruthy();
    expect(enEducativo).toBe(enDetalles);
    expect(educativo).not.toMatch(/percentil 10 es el escenario pesimista/i);
  });

  test('CASO 20 · la nota compara el 7 % NOMINAL con un 4-6 % REAL que ya contiene al motor', async ({ page }) => {
    await abrir(page);
    const nota = (await page.getByText('Nota sobre rentabilidad esperada').locator('xpath=..').innerText()).replace(/ /g, ' ');
    const m = nota.match(/(\d+)\s?[-–]\s?(\d+)\s?%\s*real/);
    // 1,07/1,02 − 1 = 4,902 %: la real con la que el motor proyecta la renta variable.
    const realMotor = 4.902;
    const contradice = Boolean(m) && realMotor >= Number(m?.[1]) && realMotor <= Number(m?.[2]) && /sustancialmente menores/.test(nota);
    expect(contradice).toBe(false);
  });

  test('CASO 21 · erratas: «Míraras», «olvidate» y dos palabras pegadas', async ({ page }) => {
    await abrir(page);
    const educativo = (await textoDeSeccion(page, 'Guía paso a paso')) + ' ' + (await textoDeSeccion(page, 'Mejores prácticas'));
    expect(educativo.length).toBeGreaterThan(1000);
    // La caja de errores no es una <section>: se toma desde su <h3>.
    const errores = await page.evaluate(() => {
      const h3 = Array.from(document.querySelectorAll('h3')).find((h) => (h.textContent || '').includes('Errores costosos'));
      return (h3?.parentElement?.parentElement?.textContent || '').replace(/\s+/g, ' ');
    });
    expect(errores.length).toBeGreaterThan(500);
    const fallos = [
      educativo.includes('Míraras') && '«Míraras» (Míralas)',
      educativo.includes('olvidate') && '«olvidate» (olvídate)',
      // Un salto de línea del JSX entre el texto y el <strong> se come el espacio.
      educativo.includes('y¿cuándo') && '«y¿cuándo»',
      errores.includes('máximos).Solución') && '«máximos).Solución:»',
    ].filter(Boolean);
    expect(fallos).toEqual([]);
  });

  test('CASO 22 · «dentro de 1 años»', async ({ page }) => {
    test.setTimeout(90_000);
    await abrir(page);
    await sembrarValor(page, '#horizonte', '1');
    const texto = await simularNuevo(page);
    expect(texto).toContain('dentro de 1 año ');
    expect(texto).not.toContain('dentro de 1 años');
  });
});
