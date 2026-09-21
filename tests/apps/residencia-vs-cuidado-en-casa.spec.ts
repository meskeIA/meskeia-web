import { test, expect, Page } from '@playwright/test';
import { esperarHidratacion, sembrarValor } from './_hidratacion';

/**
 * Residencia vs Cuidado en Casa — regresión del comparador de costes de cuidados.
 * Inspeccionada el 21/09/2026 · REPARADA el mismo día (hallazgos 1115-1127).
 *
 * QUÉ PROMETE (leído el 21/09/2026)
 *   · <h1>: «Residencia vs Cuidado en Casa».
 *   · Subtítulo: «Compara costes y factores de las opciones de cuidado para mayores · 2026».
 *   · <title> y openGraph: «Residencia vs Cuidado en Casa - Comparativa de costes».
 *   · description: «Compara los costes orientativos de residencia privada, servicio de ayuda
 *     a domicilio (SAD) y cuidador en casa para elegir la opción de cuidado más adecuada».
 *   · En pantalla: <RegionBadge variant="es-only" />, <LegalNotice />, <DisclaimerCard
 *     variant="financial" severity="critical"> (nivel 1, NO colapsable) y <DataReference>.
 *
 * DE DÓNDE SALEN LOS NÚMEROS
 *   El suelo del cuidado en casa sale de `data/fiscal/`, y esa es la reparación de fondo:
 *     · `SMI_2026.hogarHora` = 9,55 €/h (RD 126/2026) — salario mínimo del servicio del
 *       hogar por hora en régimen externo.
 *     · `COTIZACION_EMPLEADOS_HOGAR_2026.contingenciasComunesEmpleador` = 23,60 %
 *       (Orden PJC/297/2026, art. 15) — lo que paga el empleador encima del salario.
 *     · `HORAS_JORNADA_COMPLETA_MES` = 40 × 52 / 12 = 173,33 h — a partir de ahí, una sola
 *       persona ya no puede cubrir las horas pedidas.
 *     · `PRESTACIONES_DEPENDENCIA_2025` — PEVS y PECEF por grado, para las notas de ayudas.
 *   Lo que NO es normativo vive junto en `COSTES_MERCADO` dentro de page.tsx, con su
 *   advertencia: residencia 1.600-3.200 €/mes, SAD 18-22 €/h × 26 días, y un margen de
 *   mercado de 1,35 sobre el suelo legal del cuidador.
 *
 *   Fórmulas de hoy:
 *     · Residencia   → COSTES_MERCADO.residenciaMin/Max, constante.
 *     · SAD          → horas × 18 × 26 (mín) y horas × 22 × 26 (máx). Entre los dos
 *                      extremos SOLO cambia el precio por hora.
 *     · Cuidado casa → horasMes = horas × 30 · mín = horasMes × 9,55 × 1,236 ·
 *                      máx = mín × 1,35 · personas = ceil(horasMes / 173,33).
 *     · La insignia «Menor coste mensual» va a la opción de menor extremo inferior.
 *
 * QUÉ SE REPARÓ Y POR QUÉ ESTE TEST LO FIJA
 *   · 1115 — el «cuidador interno» era un importe PLANO de 1.300-1.700 €/mes para cualquier
 *     jornada de 9 a 24 h, y 1.300 € queda por debajo del SMI mensual antes de cotizar. La
 *     app coronaba esa opción como la más barata justo en el escenario de gran dependencia.
 *   · 1120 — el coste DECRECÍA al pedir más horas (8 h → 1.750 €; 9 h → 1.300 €), el tramo
 *     «jornada completa» empezaba en 5 h y de 9 a 24 h el importe era idéntico.
 *   · 1121 — los extremos del SAD mezclaban precio Y días (22 en el mínimo, 26 en el máximo).
 *   · 1118/1119 — el aviso de fuera de rango no retiraba la comparativa anterior, y «1.500»
 *     se colaba como 1,5 h por usar `parseFloat(x.replace(',', '.'))`.
 *   · 1123/1124 — el SAD público se declaraba «posible si se valora» con Grado I ya
 *     reconocido, y la nota de ayudas nunca aparecía en la residencia.
 *   · 1126 — cuatro rangos distintos para la residencia en la misma página.
 *
 * LOS CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   CASO 1 — NORMAL (3 h/día, Grado II)
 *       Residencia → 1.600,00 – 3.200,00 €/mes.
 *       SAD        → 3 × 18 × 26 = 1.404 € · 3 × 22 × 26 = 1.716 €.
 *       Cuidador   → 90 h/mes × 9,55 × 1,236 = 1.062,39 → 1.062 € · × 1,35 = 1.434 €.
 *                    90 < 173,33 → una sola persona.
 *       Extremos inferiores 1.600 / 1.404 / 1.062 → insignia al cuidado en casa.
 *
 *   CASO 2 — EL LÍMITE (24 h/día, Grado III)
 *       720 h/mes → 720 × 9,55 × 1,236 = 8.498,59 → 8.499 € · × 1,35 = 11.474 €.
 *       ceil(720 / 173,33) = 5 personas.
 *       Y ya no es la opción más barata: la residencia (1.600 €) lo es, que es lo que
 *       corresponde a comparar 24 h de plaza con 24 h de contratación directa.
 *       SAD → 24 × 18 × 26 = 11.232 € · 24 × 22 × 26 = 13.728 €.
 *
 *   CASO 3 — MONOTONÍA (8 h vs 9 h): el defecto que hacía más barato pedir más
 *       8 h → 240 h/mes → 2.833 € (2 personas, porque 240 > 173,33).
 *       9 h → 270 h/mes → 3.187 € (2 personas).
 *       Antes: 1.750 € con 8 h y 1.300 € con 9 h, es decir, 450 € menos por una hora más.
 *
 *   CASO 4 — LO QUE DEBE RECHAZARSE (0 h, 25 h y «1.500»)
 *       Los tres quedan fuera de [1, 24] → aviso Y comparativa retirada.
 *
 * ⚠️ `formatCurrency` (es-ES) separa el millar SOLO a partir de cinco dígitos enteros: imprime
 *    «1600,00 €» sin punto y «13.728,00 €» con él. El espacio antes del € es U+00A0, así que
 *    el texto se normaliza antes de comparar.
 */

const RUTA = '/residencia-vs-cuidado-en-casa/';
const HORAS = 'input[aria-label="Horas de cuidado necesarias al día"]';

async function abrir(page: Page): Promise<void> {
  await page.goto(RUTA, { waitUntil: 'load' });
  await esperarHidratacion(page, [HORAS]);
}

/** Una tarjeta de opción, por el nombre que imprime su cabecera. */
function tarjeta(page: Page, nombre: string | RegExp) {
  return page.locator('[class*="opcionCard"]').filter({ hasText: nombre });
}

/**
 * Deja una sola clase de espacio. `formatCurrency` (es-ES) separa la cifra del € con un
 * espacio duro que según la versión de ICU es U+00A0 o U+202F, así que compararlo a ojo
 * da igualdades que fallan: el mensaje de Playwright enseña dos cadenas idénticas.
 */
const norm = (t: string) => t.replace(/[\s  ]+/g, ' ').trim();

/** El rango de coste de una tarjeta, con los espacios duros ya normalizados. */
async function coste(page: Page, nombre: string | RegExp): Promise<string> {
  return norm(await tarjeta(page, nombre).locator('[class*="opcionCoste"]').innerText());
}

/** El aviso de la app. NO vale `getByRole('alert')`: aquí ese rol lo tienen también el
 *  DisclaimerCard crítico y el anunciador de rutas de Next. */
function aviso(page: Page) {
  return page.locator('[class*="errorMsg"]');
}

async function comparar(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Comparar opciones' }).click();
}

test.describe('Residencia vs Cuidado en Casa', () => {
  test('CASO 1 — 3 h/día con Grado II: el SAD usa los mismos 26 días en los dos extremos', async ({ page }) => {
    await abrir(page);

    // El campo arranca en 4 y el grado en «No valorado»: las dos siembras cambian el estado.
    await sembrarValor(page, HORAS, '3');
    await page.selectOption('#gradoDep', 'grado2');
    await comparar(page);

    // COSTES_MERCADO.residencia*: no depende de las horas ni del grado.
    expect(await coste(page, 'Residencia privada')).toBe(norm('1600,00 € – 3200,00 €/mes'));
    // Hallazgo 1121 · 3 × 18 × 26 = 1.404 · 3 × 22 × 26 = 1.716. Antes el mínimo usaba 22
    // días y el máximo 26, así que variaban a la vez precio y días y salía 1.188 €.
    expect(await coste(page, /SAD en domicilio/)).toBe(norm('1404,00 € – 1716,00 €/mes'));
    // 90 h/mes × 9,55 €/h × 1,236 = 1.062,39 → 1.062 · × 1,35 = 1.434
    expect(await coste(page, /Cuidado en casa/)).toBe(norm('1062,00 € – 1434,00 €/mes'));

    // La cabecera del SAD lleva las horas pedidas.
    await expect(tarjeta(page, /SAD en domicilio/)).toContainText('SAD en domicilio (3h/día)');
    // 90 h/mes no llegan a la jornada ordinaria: una sola persona, sin aviso de turnos.
    await expect(tarjeta(page, /Cuidado en casa/)).toContainText('Cuidado en casa (3h/día)');
    await expect(tarjeta(page, /Cuidado en casa/)).not.toContainText('contratos');

    // «Menor coste mensual» = menor extremo inferior (1.062 < 1.404 < 1.600).
    await expect(tarjeta(page, /Cuidado en casa/).locator('[class*="opcionBadge"]')).toHaveText('Menor coste mensual');
    await expect(tarjeta(page, 'Residencia privada').locator('[class*="opcionBadge"]')).toHaveCount(0);

    // Hallazgo 1125 · cada tarjeta dice QUÉ cubre su importe: comparar 3 h de servicio con
    // una plaza de 24 h no es comparar lo mismo, y la insignia sola no lo decía.
    await expect(tarjeta(page, 'Residencia privada')).toContainText('24 h al día');
    await expect(tarjeta(page, 'Residencia privada')).toContainText('alojamiento, manutención');
    await expect(tarjeta(page, /SAD en domicilio/)).toContainText('El resto del tiempo lo cubre la familia');

    // Hallazgo 1124 · la nota de ayudas también en la residencia: la PEVS está pensada
    // precisamente para pagar una plaza residencial privada.
    await expect(tarjeta(page, 'Residencia privada').locator('[class*="notaPublica"]')).toHaveCount(1);
    // Hallazgo 1116 · las cuantías salen de PRESTACIONES_DEPENDENCIA_2025, no escritas a mano.
    // Grado II → PEVS 426,12 € · PECEF 286,66 €.
    await expect(tarjeta(page, 'Residencia privada')).toContainText('426,12');
    await expect(tarjeta(page, 'Residencia privada')).toContainText('286,66');
  });

  test('CASO 2 — 24 h/día: el suelo sale del SMI y hacen falta cinco contratos', async ({ page }) => {
    await abrir(page);

    await sembrarValor(page, HORAS, '24');
    await page.selectOption('#gradoDep', 'grado3');
    await comparar(page);

    // 24 × 18 × 26 = 11.232 · 24 × 22 × 26 = 13.728
    expect(await coste(page, /SAD en domicilio/)).toBe(norm('11.232,00 € – 13.728,00 €/mes'));
    expect(await coste(page, 'Residencia privada')).toBe(norm('1600,00 € – 3200,00 €/mes'));

    // Hallazgo 1115 · 720 h/mes × 9,55 × 1,236 = 8.498,59 → 8.499 · × 1,35 = 11.474.
    // Antes: 1.300-1.700 € planos, por debajo del SMI mensual y descritos como coste TOTAL
    // del empleador.
    expect(await coste(page, /Cuidado en casa/)).toBe(norm('8499,00 € – 11.474,00 €/mes'));
    // …y se dice que una sola persona no puede: ceil(720 / 173,33) = 5.
    await expect(tarjeta(page, /Cuidado en casa/)).toContainText('5 personas');
    await expect(tarjeta(page, /Cuidado en casa/)).toContainText('Una sola persona no puede cubrir');

    // Con 24 h la opción más barata es la residencia, que es la que de verdad cubre 24 h.
    await expect(tarjeta(page, 'Residencia privada').locator('[class*="opcionBadge"]')).toHaveText('Menor coste mensual');
    await expect(tarjeta(page, /Cuidado en casa/).locator('[class*="opcionBadge"]')).toHaveCount(0);

    // El origen del suelo se declara: SMI del hogar + cotización del empleador.
    await expect(tarjeta(page, /Cuidado en casa/)).toContainText('9,55');
    await expect(tarjeta(page, /Cuidado en casa/)).toContainText('23,60 %');
  });

  test('CASO 3 — monotonía: pedir una hora más nunca sale más barato', async ({ page }) => {
    await abrir(page);

    // Hallazgo 1120 · aquí estaba el escalón: 8 h daban 1.750 € y 9 h, 1.300 €.
    await sembrarValor(page, HORAS, '8');
    await comparar(page);
    // 240 h/mes × 9,55 × 1,236 = 2.833,06 → 2.833. Y 240 > 173,33 → 2 personas.
    expect(await coste(page, /Cuidado en casa/)).toBe(norm('2833,00 € – 3825,00 €/mes'));
    await expect(tarjeta(page, /Cuidado en casa/)).toContainText('2 personas');

    await sembrarValor(page, HORAS, '9');
    await comparar(page);
    // 270 h/mes → 3.187,45 → 3.187. Más horas, más dinero.
    expect(await coste(page, /Cuidado en casa/)).toBe(norm('3187,00 € – 4302,00 €/mes'));

    // Y 9 h ya no son iguales que 24 h, que es lo que ocurría con el importe plano.
    await sembrarValor(page, HORAS, '24');
    await comparar(page);
    expect(await coste(page, /Cuidado en casa/)).toBe(norm('8499,00 € – 11.474,00 €/mes'));
  });

  test('CASO 4 — fuera de rango: avisa Y retira la comparativa; «1.500» ya no se cuela', async ({ page }) => {
    await abrir(page);

    // Primero una comparación válida, para poder ver qué hace el aviso con lo ya calculado.
    await sembrarValor(page, HORAS, '3');
    await comparar(page);
    expect(await coste(page, /SAD en domicilio/)).toBe(norm('1404,00 € – 1716,00 €/mes'));

    // 0 está fuera de [1, 24]: la app avisa…
    await sembrarValor(page, HORAS, '0');
    await comparar(page);
    await expect(aviso(page)).toBeVisible();
    await expect(aviso(page)).toHaveAttribute('role', 'alert');
    await expect(aviso(page)).toContainText('Introduce las horas de cuidado al día (entre 1 y 24).');
    // Hallazgo 1118 · …y la comparativa anterior desaparece. Antes convivían el aviso y tres
    // tarjetas con los importes de las 3 h del paso previo.
    await expect(page.locator('[class*="opcionCard"]')).toHaveCount(0);

    // 25 está fuera por arriba: mismo comportamiento.
    await sembrarValor(page, HORAS, '25');
    await comparar(page);
    await expect(aviso(page)).toContainText('entre 1 y 24');
    await expect(page.locator('[class*="opcionCard"]')).toHaveCount(0);

    // Hallazgo 1119 · «1.500» son mil quinientas horas en español, fuera de rango.
    // `parseFloat('1.500')` daba 1,5 y la app calculaba 594 €; `parseSpanishNumber` da 1.500.
    await sembrarValor(page, HORAS, '1.500');
    await comparar(page);
    await expect(aviso(page)).toContainText('entre 1 y 24');
    await expect(page.locator('[class*="opcionCard"]')).toHaveCount(0);
  });

  test('CASO 5 — con Grado I el SAD público está disponible, y la tarjeta no se contradice', async ({ page }) => {
    await abrir(page);

    await sembrarValor(page, HORAS, '3');
    await page.selectOption('#gradoDep', 'grado1');
    await comparar(page);

    // Hallazgo 1123 · SERVICIOS_SAAD da acceso al SAD a los grados 1, 2 y 3. La tarjeta
    // decía «SAD público posible si se valora dependencia» —cuando ya está valorada— justo
    // encima de una nota que empezaba «Con Grado 1 reconocido…».
    const sad = tarjeta(page, /SAD en domicilio/);
    await expect(sad).toContainText('SAD público disponible con tu grado');
    await expect(sad).not.toContainText('posible si se valora dependencia');
    // Grado I → PEVS 300 € · PECEF 153 €, de PRESTACIONES_DEPENDENCIA_2025.
    await expect(sad).toContainText('300,00');
    await expect(sad).toContainText('153,00');
  });

  test('las piezas obligatorias de una app de riesgo 1', async ({ page }) => {
    await abrir(page);

    // DisclaimerCard nivel 1 CRÍTICO: role="alert" y NUNCA colapsable.
    const disclaimer = page.locator('[class*="severity-critical"]').first();
    await expect(disclaimer).toBeVisible();
    await expect(disclaimer).toHaveAttribute('role', 'alert');
    await expect(disclaimer).toContainText('estimaciones orientativas');
    expect(await disclaimer.locator('details, summary, button').count()).toBe(0);

    // LegalNotice.
    await expect(page.getByRole('link', { name: 'Política de Privacidad' }).first()).toBeVisible();

    // RegionBadge es-only: la app es de normativa española.
    await expect(page.locator('body')).toContainText('Solo España');

    await expect(page.locator('h1')).toHaveText('Residencia vs Cuidado en Casa');

    // Hallazgo 1117 · DataReference con el sello del módulo que se estrenó para esta app.
    const dataRef = page.locator('[aria-label="Datos de referencia normativos"]');
    await expect(dataRef).toHaveCount(1);
    await expect(dataRef).toContainText('21/09/2026');
    await expect(dataRef).toContainText('Empleados de Hogar');

    // Hallazgo 1126 · un SOLO rango de residencia en toda la página. Los otros tres que
    // convivían con él eran 1.500-4.500, 2.000-4.500 y 1.500-4.000.
    const cuerpo = page.locator('body');
    await expect(cuerpo).not.toContainText('1.500-4.500');
    await expect(cuerpo).not.toContainText('2.000-4.500');
    await expect(cuerpo).not.toContainText('1.500-2.500');
    await expect(cuerpo).not.toContainText('800-3.000');

    // Hallazgo 1122 · «abandona su hogar» valoraba moralmente una opción legítima.
    await expect(cuerpo).not.toContainText('abandona su hogar');
    await sembrarValor(page, HORAS, '3');
    await comparar(page);
    await expect(tarjeta(page, 'Residencia privada')).toContainText('Cambio de domicilio y de entorno habitual');
  });
});
