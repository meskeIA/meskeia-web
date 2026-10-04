import { test, expect, Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact, sembrarValor } from './_hidratacion';
import { activarTema } from '../contraste-text-muted-auxiliares';

/**
 * Residencia vs Cuidado en Casa — regresión del comparador de costes de cuidados.
 * Inspeccionada el 21/09/2026 · REPARADA el mismo día (hallazgos 1115-1127, todos REPARADOS).
 * RE-INSPECCIONADA el 04/10/2026 (ver el bloque «RE-INSPECCIÓN» al final del fichero).
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
 *
 * ── RE-INSPECCIÓN 04/10/2026 ──────────────────────────────────────────────────
 * Volvió a la cola porque cambió `data/fiscal/dependencia.ts` al reparar
 * orientador-grado-dependencia (b0118e82 y 998a33e4). Ninguno de los dos toca lo que esta app
 * importa: el primero AÑADE el baremo BVD (BVD_META, BVD_ACTIVIDADES_18_MAS…) y el segundo
 * corrige GRADO_III_PLUS (RDL 11/2025) y anota que las cuantías de
 * PRESTACIONES_DEPENDENCIA_2025 están pendientes de cotejo. PRESTACIONES_DEPENDENCIA_2025 y
 * FISCAL_DEPENDENCIA_META quedan iguales: PEVS 300 / 426,12 / 833,96 y PECEF 153 / 286,66 /
 * 449,77 €/mes, vigencia «2025-2026», verificado «2026-07-14». Los once hallazgos de 2026-09-21
 * siguen REPARADOS salvo una parte del 1126 (el JSON-LD conserva sus propios rangos).
 *
 * Casos nuevos, resueltos a mano ANTES de abrir el navegador (horasMes = h × 30;
 * cuidado mín = horasMes × 9,55 × 1,236, redondeado; máx = mín × 1,35, redondeado):
 *   · 2,5 h + Grado I  → SAD 2,5×18×26 = 1.170 · 2,5×22×26 = 1.430 · cuidado 75 h →
 *                        885,285 → 885 · ×1,35 = 1.194,75 → 1.195. Notas: 300,00 y 153,00.
 *   · 3,5 h + Grado II (móvil, tecleado) → SAD 1.638 – 2.002 · cuidado 105 h → 1.239,40 →
 *                        1.239 · ×1,35 = 1.672,65 → 1.673. Notas: 426,12 y 286,66.
 *   · 5 h              → SAD 2.340 – 2.860 · cuidado 150 h → 1.770,57 → 1.771 · 2.390,85 →
 *                        2.391. La residencia (1.600) pasa a ser la de menor extremo inferior
 *                        a partir de ~4,52 h/día (1.600 / 354,114 €/h·día).
 *   · «1.234,56» tecleado → `NumberInput` acota al salir del campo (acotarAlSalir por
 *                        defecto) y calcula 24 h; «-» → aviso y ninguna cifra.
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

// ═══════════════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 04/10/2026
// ═══════════════════════════════════════════════════════════════════════════════════════

/** Ratio de contraste WCAG del texto de `selector` contra el primer fondo opaco de sus ancestros. */
async function contraste(page: Page, selector: string): Promise<number> {
  return page.locator(selector).first().evaluate((el) => {
    const rgb = (s: string) => (s.match(/[\d.]+/g) ?? []).map(Number);
    const canal = (c: number) => {
      const v = c / 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    };
    const lum = ([r, g, b]: number[]) => 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
    let nodo: Element | null = el;
    let fondo: number[] | null = null;
    while (nodo && nodo !== document.documentElement) {
      const v = rgb(getComputedStyle(nodo).backgroundColor);
      if (v.length === 3 || (v.length === 4 && v[3] > 0.9)) { fondo = v; break; }
      nodo = nodo.parentElement;
    }
    fondo ??= rgb(getComputedStyle(document.body).backgroundColor);
    const a = lum(rgb(getComputedStyle(el).color));
    const b = lum(fondo);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  });
}

test.describe('Re-inspección 04/10/2026 — escritorio', () => {
  test('CASO 6 — «2,5» tecleado con Grado I: decimales con coma y cuantías del Grado I', async ({ page }) => {
    await abrir(page);

    // fill() escribe a través del navegador; el testigo confirma que el estado de React lo recogió.
    await page.locator(HORAS).fill('2,5');
    await esperarValorEnReact(page, HORAS, '2,5');
    await page.selectOption('#gradoDep', 'grado1');
    await comparar(page);

    expect(await coste(page, 'Residencia privada')).toBe(norm('1600,00 € – 3200,00 €/mes'));
    // 2,5 × 18 × 26 = 1.170 · 2,5 × 22 × 26 = 1.430
    expect(await coste(page, /SAD en domicilio/)).toBe(norm('1170,00 € – 1430,00 €/mes'));
    // 75 h/mes × 9,55 × 1,236 = 885,285 → 885 · 885 × 1,35 = 1.194,75 → 1.195
    expect(await coste(page, /Cuidado en casa/)).toBe(norm('885,00 € – 1195,00 €/mes'));
    await expect(tarjeta(page, /Cuidado en casa/).locator('[class*="opcionBadge"]')).toHaveText('Menor coste mensual');
    // Grado I → PEVS 300 € · PECEF 153 € (PRESTACIONES_DEPENDENCIA_2025)
    await expect(tarjeta(page, 'Residencia privada')).toContainText('300,00');
    await expect(tarjeta(page, 'Residencia privada')).toContainText('153,00');
  });

  test('CASO 7 — 5 h/día: la residencia pasa a ser la de menor coste mensual', async ({ page }) => {
    await abrir(page);

    await sembrarValor(page, HORAS, '5');
    await comparar(page);

    // 5 × 18 × 26 = 2.340 · 5 × 22 × 26 = 2.860
    expect(await coste(page, /SAD en domicilio/)).toBe(norm('2340,00 € – 2860,00 €/mes'));
    // 150 h/mes × 9,55 × 1,236 = 1.770,57 → 1.771 · × 1,35 = 2.390,85 → 2.391
    expect(await coste(page, /Cuidado en casa/)).toBe(norm('1771,00 € – 2391,00 €/mes'));
    // 1.600 < 1.771 < 2.340
    await expect(tarjeta(page, 'Residencia privada').locator('[class*="opcionBadge"]')).toHaveText('Menor coste mensual');
  });

  test('HALLAZGO (abierto, 04/10/2026) · con la insignia «Menor coste mensual», la residencia se sigue listando como la más cara', async ({ page }) => {
    test.fail(true, 'El factor «Coste mensual más alto en términos absolutos» es fijo y contradice la insignia de la misma tarjeta desde ~4,52 h/día');
    await abrir(page);
    await sembrarValor(page, HORAS, '5');
    await comparar(page);
    const residencia = tarjeta(page, 'Residencia privada');
    // Preparación: la insignia SÍ está en la residencia (1.600 < 1.771).
    await expect(residencia.locator('[class*="opcionBadge"]')).toHaveText('Menor coste mensual');
    // El defecto: la misma tarjeta dice lo contrario.
    await expect(residencia).not.toContainText('Coste mensual más alto en términos absolutos', { timeout: 2000 });
  });

  test('HALLAZGO (abierto, 04/10/2026) · las horas decimales salen en formato inglés en el nombre de las tarjetas', async ({ page }) => {
    test.fail(true, '`${horasDia}h/día` imprime el número de JavaScript: «2.5h/día», mientras la cobertura de la misma tarjeta dice «2,5 h»');
    await abrir(page);
    await page.locator(HORAS).fill('2,5');
    await esperarValorEnReact(page, HORAS, '2,5');
    await comparar(page);
    // Preparación: la cobertura, que sí usa formatNumber, dice «2,5 h al día».
    await expect(tarjeta(page, /SAD en domicilio/)).toContainText('2,5 h al día');
    const nombre = norm(await tarjeta(page, /SAD en domicilio/).locator('[class*="opcionNombre"]').innerText());
    expect(nombre).not.toContain('2.5');
  });

  test('HALLAZGO (abierto, 04/10/2026) · el JSON-LD (FAQPage) conserva rangos de mercado distintos de COSTES_MERCADO', async ({ page }) => {
    test.fail(true, 'Reparación incompleta del 1126: la página dice 1.600-3.200 €/mes y 18-22 €/h; el FAQPage, 1.500-4.000 € y 15-25 €/h');
    await abrir(page);
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = bloques.map((b) => JSON.parse(b)).find((j) => j['@type'] === 'FAQPage');
    expect(faq).toBeTruthy();
    const respuestas: string[] = faq.mainEntity.map((q: { acceptedAnswer: { text: string } }) => q.acceptedAnswer.text);
    // COSTES_MERCADO.residenciaMin/Max = 1.600 / 3.200 €/mes (lo que pinta la comparativa)
    expect(respuestas[0]).toMatch(/1\.?600\s*(?:y|[–-])\s*3\.?200/);
    // COSTES_MERCADO.sadHoraMin/Max = 18 / 22 €/hora
    expect(respuestas[1]).toMatch(/18\s*(?:y|[–-])\s*22/);
  });

  test('HALLAZGO (abierto, 04/10/2026) · el sello de datos rotula las cuantías de dependencia como «2026» y verificadas el 21/09/2026', async ({ page }) => {
    test.fail(true, 'normativa = «SMI y prestaciones de dependencia ${FISCAL_SMI_META.vigencia}» y verificado = el del módulo de empleados de hogar; el de dependencia es PRESTACIONES_DEPENDENCIA_2025, vigencia «2025-2026», verificado 2026-07-14');
    await abrir(page);
    const sellos = page.locator('[aria-label="Datos de referencia normativos"]');
    await expect(sellos.first()).toBeVisible();
    // El año de las prestaciones no puede salir del módulo del SMI.
    await expect(sellos.first()).not.toContainText('prestaciones de dependencia 2026', { timeout: 2000 });
    // FISCAL_DEPENDENCIA_META.verificado = '2026-07-14'
    await expect(sellos.filter({ hasText: '14/07/2026' }).first()).toBeVisible({ timeout: 2000 });
  });

  test('HALLAZGO (abierto, 04/10/2026) · con 5 h todos los días no avisa de que una sola persona no puede cubrirlo', async ({ page }) => {
    test.fail(true, 'personasParaCubrir solo mira horas: ignora el descanso semanal de 36 h consecutivas del art. 9.5 del RD 1620/2011');
    await abrir(page);
    await sembrarValor(page, HORAS, '5');
    await comparar(page);
    const cuidado = tarjeta(page, /Cuidado en casa/);
    // Preparación: 150 h/mes, siete días a la semana.
    await expect(cuidado).toContainText('todos los días (150 h/mes)');
    await expect(cuidado).toContainText(/descanso semanal|2 personas|2 contratos/, { timeout: 2000 });
  });

  test('HALLAZGO (abierto, 04/10/2026) · los iconos ✅/❌/⚠️ son lo único que distingue ventajas de inconvenientes, y están ocultos al lector de pantalla', async ({ page }) => {
    test.fail(true, 'factorIcono lleva aria-hidden y no hay texto equivalente: el lector lee una lista plana');
    await abrir(page);
    await sembrarValor(page, HORAS, '3');
    await comparar(page);
    const arbol = await tarjeta(page, 'Residencia privada').ariaSnapshot();
    // Preparación: el árbol accesible sí trae los factores.
    expect(arbol).toContain('Cambio de domicilio y de entorno habitual');
    expect(arbol).toMatch(/ventaja|a favor|inconveniente|en contra|desventaja/i);
  });

  test('HALLAZGO (abierto, 04/10/2026) · el aviso de error lee el emoji ⚠️ dentro del role="alert"', async ({ page }) => {
    test.fail(true, 'page.tsx imprime «⚠️ {error}» sin <span aria-hidden="true"> (CLAUDE.md §5, regla 3)');
    await abrir(page);
    await sembrarValor(page, HORAS, '-');
    await comparar(page);
    await expect(aviso(page)).toContainText('Introduce las horas de cuidado al día (entre 1 y 24).');
    expect(await aviso(page).ariaSnapshot()).not.toMatch(/\p{Extended_Pictographic}/u);
  });

  test('HALLAZGO (abierto, 04/10/2026) · contraste de la insignia «Menor coste mensual» (blanco sobre #27AE60)', async ({ page }) => {
    test.fail(true, '2,87:1 en los dos temas: 11,5 px en negrita exige 4,5:1');
    await abrir(page);
    await activarTema(page, 'light');
    await sembrarValor(page, HORAS, '3');
    await comparar(page);
    await expect(page.locator('[class*="opcionBadge"]')).toHaveCount(1);
    expect(await contraste(page, '[class*="opcionBadge"]')).toBeGreaterThanOrEqual(4.5);
  });

  test('HALLAZGO (abierto, 04/10/2026) · contraste del aviso de error en tema OSCURO (#c0392b sin variante oscura)', async ({ page }) => {
    test.fail(true, '#c0392b sobre la tarjeta oscura #2A2A2A da 2,64:1; en claro da 5,44:1');
    await abrir(page);
    await activarTema(page, 'dark');
    await sembrarValor(page, HORAS, '-');
    await comparar(page);
    await expect(aviso(page)).toBeVisible();
    // El cambio de tema anima el fondo (disableTransitionOnChange=false): medir a mitad de la
    // transición daba 1,88:1 contra un gris intermedio. Se espera al fondo oscuro final de la
    // tarjeta, el --bg-card que el módulo declara en [data-theme='dark'] .container.
    await expect(aviso(page).locator('xpath=..')).toHaveCSS('background-color', 'rgb(42, 42, 42)');
    expect(await contraste(page, '[class*="errorMsg"]')).toBeGreaterThanOrEqual(4.5);
  });

  test('HALLAZGO (abierto, 04/10/2026) · el módulo fija --primary: #2E86AB en los dos temas y el texto de marca no llega a 4,5:1', async ({ page }) => {
    test.fail(true, 'Preguntas de la FAQ 3,77:1 en claro (sobre #F5F5F5) y 3,21:1 en oscuro; el .container tapa el #3FA5D1 oscuro de globals.css');
    await abrir(page);
    await activarTema(page, 'light');
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    await expect(page.locator('[class*="faqItem"] strong').first()).toBeVisible();
    expect(await contraste(page, '[class*="faqItem"] strong')).toBeGreaterThanOrEqual(4.5);
  });
});

test.describe('Re-inspección 04/10/2026 — móvil 375 px, tecleando', () => {
  test.use({
    viewport: { width: 375, height: 740 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  /** Borra el campo y teclea pulsación a pulsación, como un teclado de móvil. */
  async function teclear(page: Page, texto: string): Promise<void> {
    const campo = page.locator(HORAS);
    await campo.tap();
    await campo.press('Control+A');
    await campo.press('Backspace');
    for (const c of texto) await campo.press(c);
    await esperarValorEnReact(page, HORAS, texto);
  }

  test('CASO 8 — «3,5» con Grado II, tecleado: mismas cifras que en escritorio y sin desbordar', async ({ page }) => {
    await abrir(page);
    await teclear(page, '3,5');
    await page.selectOption('#gradoDep', 'grado2');
    await page.getByRole('button', { name: 'Comparar opciones' }).tap();

    // 3,5 × 18 × 26 = 1.638 · 3,5 × 22 × 26 = 2.002
    expect(await coste(page, /SAD en domicilio/)).toBe(norm('1638,00 € – 2002,00 €/mes'));
    // 105 h/mes × 9,55 × 1,236 = 1.239,40 → 1.239 · × 1,35 = 1.672,65 → 1.673
    expect(await coste(page, /Cuidado en casa/)).toBe(norm('1239,00 € – 1673,00 €/mes'));
    await expect(tarjeta(page, /Cuidado en casa/).locator('[class*="opcionBadge"]')).toHaveText('Menor coste mensual');
    // Grado II → PEVS 426,12 € · PECEF 286,66 €
    await expect(tarjeta(page, /Cuidado en casa/)).toContainText('426,12');
    await expect(tarjeta(page, /Cuidado en casa/)).toContainText('286,66');

    const { ancho, visible } = await page.evaluate(() => ({
      ancho: document.documentElement.scrollWidth,
      visible: document.documentElement.clientWidth,
    }));
    expect(ancho).toBeLessThanOrEqual(visible);
  });

  test('CASO 9 — «1.234,56» se acota a 24 al salir del campo; «-» avisa y no deja cifras', async ({ page }) => {
    await abrir(page);

    // NumberInput (acotarAlSalir por defecto): 1.234,56 > max 24 → el blur reescribe «24».
    await teclear(page, '1.234,56');
    await page.getByRole('button', { name: 'Comparar opciones' }).tap();
    await expect(page.locator(HORAS)).toHaveValue('24');
    // 720 h/mes → 8.498,74 → 8.499 · × 1,35 = 11.474 (CASO 2)
    expect(await coste(page, /Cuidado en casa/)).toBe(norm('8499,00 € – 11.474,00 €/mes'));

    // «-» no es un número: parseSpanishNumber → NaN, el blur no lo acota y la app avisa.
    await teclear(page, '-');
    await page.getByRole('button', { name: 'Comparar opciones' }).tap();
    await expect(aviso(page)).toContainText('Introduce las horas de cuidado al día (entre 1 y 24).');
    await expect(page.locator('[class*="opcionCard"]')).toHaveCount(0);
  });
});
