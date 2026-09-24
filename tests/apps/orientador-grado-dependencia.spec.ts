import { test, expect, Page, Locator } from '@playwright/test';
import { esperarHidratacion } from './_hidratacion';
import { activarTema } from '../contraste-text-muted-auxiliares';

/**
 * orientador-grado-dependencia — la puntuación del BVD (RD 174/2011) y lo que puede prometer
 * Generado por /inspector el 24/09/2026 · reescrito al reparar los hallazgos 1319-1326.
 *
 * LA NORMA (RD 174/2011, anexo I, BOE-A-2011-3174, texto consultado el 24/09/2026)
 * ─────────────────────────────────────────────────────────────────────────────────
 *   · Escala: 0-24 sin grado · 25-49 Grado I · 50-74 Grado II · 75-100 Grado III
 *     (GRADOS_DEPENDENCIA en data/fiscal/dependencia.ts).
 *   · Puntuación = Σ (peso de la tarea × peso de la actividad × coeficiente de apoyo), sobre las
 *     tareas con desempeño negativo por dependencia, redondeada al entero. Coeficientes
 *     (anexo C): supervisión 0,90 · física parcial 0,90 · sustitución máxima 0,95 · apoyo
 *     especial 1,00.
 *   · Pesos de actividad, 18 años y más. General (anexo A): comer y beber 16,8 · micción y
 *     defecación 14,8 · lavarse 8,8 · otros cuidados corporales 2,9 · vestirse 11,9 ·
 *     mantenimiento de la salud 2,9 · posición del cuerpo 9,4 · dentro del hogar 12,3 · fuera
 *     del hogar 12,2 · tareas domésticas 8,0. Específica (anexo B, funciones mentales): 10,0 ·
 *     7,0 · 8,0 · 2,0 · 11,6 · 11,0 · 2,0 · 12,1 · 12,9 · 8,0 · tomar decisiones 15,4; vale la
 *     más alta de las dos.
 *
 * LA APP (tras la reparación) pregunta por las TAREAS oficiales del BVD y aplica esos pesos. Como
 * el tipo de apoyo de cada tarea lo decide el valorador, si no se indica da un intervalo
 * [Σ × 0,90, Σ × 1,00] y, si cruza un corte, dice «En el límite entre…» en vez de elegir grado.
 * Marcar una actividad entera suma su peso completo (las tareas de cada actividad suman 1,00).
 */

const RUTA = '/orientador-grado-dependencia/';

type Actividad =
  | 'Comer y beber'
  | 'Higiene personal relacionada con la micción y defecación'
  | 'Lavarse'
  | 'Realizar otros cuidados corporales'
  | 'Vestirse'
  | 'Mantenimiento de la salud'
  | 'Cambiar y mantener la posición del cuerpo'
  | 'Desplazarse dentro del hogar'
  | 'Desplazarse fuera del hogar'
  | 'Realizar tareas domésticas'
  | 'Tomar decisiones';

const TODAS_GENERALES: readonly Actividad[] = [
  'Comer y beber',
  'Higiene personal relacionada con la micción y defecación',
  'Lavarse',
  'Realizar otros cuidados corporales',
  'Vestirse',
  'Mantenimiento de la salud',
  'Cambiar y mantener la posición del cuerpo',
  'Desplazarse dentro del hogar',
  'Desplazarse fuera del hogar',
  'Realizar tareas domésticas',
];

const CONDICION_MENTAL = /condición de salud que afecta a sus funciones mentales/;

async function abrir(page: Page): Promise<void> {
  await page.goto(RUTA);
  await esperarHidratacion(page, ['input[type="checkbox"]']);
}

function escapar(texto: string): string {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Marca TODAS las tareas de una actividad (su fieldset se llama «Actividad · pesa …»). */
async function marcarActividad(page: Page, actividad: Actividad): Promise<void> {
  const grupo = page.getByRole('group', { name: new RegExp(`^${escapar(actividad)} · pesa`) });
  const casillas = grupo.getByRole('checkbox');
  const n = await casillas.count();
  expect(n, `tareas de «${actividad}»`).toBeGreaterThan(0);
  for (let i = 0; i < n; i++) await casillas.nth(i).check();
}

async function estimar(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Estimar grado orientativo' }).click();
}

/** La caja del resultado de la app (role="status"), no el anunciador de rutas de Next. */
function resultado(page: Page): Locator {
  return page.locator('[role="status"]').filter({ hasText: 'Puntuación BVD estimada' });
}

test.describe('orientador-grado-dependencia', () => {
  test('monta el aviso legal y un disclaimer crítico visible fuera del bloque educativo', async ({ page }) => {
    await abrir(page);
    await expect(page.getByRole('link', { name: /Términos/ }).first()).toBeVisible();
    // Severidad critical → DisclaimerCard se pinta con role="alert"; se acota por su texto.
    const aviso = page.getByRole('alert').filter({ hasText: 'SOLO indicativo' });
    await expect(aviso).toBeVisible();
    await expect(aviso).toContainText('solo puede determinarlo un técnico');
  });

  /*
   * HALLAZGO 1319 — persona lúcida que camina, se levanta y se desplaza sola, pero necesita
   * apoyo en TODAS las tareas de comer, micción, lavarse, otros cuidados, vestirse, salud y
   * tareas domésticas.
   *   16,8 + 14,8 + 8,8 + 2,9 + 11,9 + 2,9 + 8,0 = 66,1
   *   66,1 × 0,90 = 59,49 → 59 · 66,1 × 1,00 → 66 → Grado II en los dos extremos.
   * La escala antigua daba «Posible Grado III… presencia y/o supervisión continua».
   */
  test('perfil de autocuidado sin problemas de movilidad → Grado II (BVD 59-66)', async ({ page }) => {
    await abrir(page);
    for (const a of ['Comer y beber', 'Higiene personal relacionada con la micción y defecación', 'Lavarse',
      'Realizar otros cuidados corporales', 'Vestirse', 'Mantenimiento de la salud', 'Realizar tareas domésticas'] as const) {
      await marcarActividad(page, a);
    }
    await estimar(page);
    await expect(resultado(page)).toContainText('Compatible con el Grado II — Dependencia Severa');
    await expect(resultado(page)).toContainText('entre 59 y 66 de 100');
    await expect(resultado(page)).not.toContainText('Grado III');
  });

  /*
   * HALLAZGO 1320 — comer y tareas domésticas enteras, el resto autónomo.
   *   16,8 + 8,0 = 24,8 → intervalo 22,32 → 22 … 24,8 → 25: cruza el corte de 25.
   *   Con sustitución máxima: 24,8 × 0,95 = 23,56 → 24 → sin grado (el caso del acta).
   *   Con apoyo especial: 24,8 → 25 → Grado I, el umbral exacto.
   * La escala antigua daba «Posible Grado I» con 8 puntos propios.
   */
  test('comer y tareas domésticas: límite sin grado / Grado I; con sustitución máxima, 24 → sin grado', async ({ page }) => {
    await abrir(page);
    await marcarActividad(page, 'Comer y beber');
    await marcarActividad(page, 'Realizar tareas domésticas');
    await estimar(page);
    await expect(resultado(page)).toContainText('En el límite entre sin grado reconocido y Grado I');
    await expect(resultado(page)).toContainText('entre 22 y 25 de 100');

    await page.getByRole('radio', { name: /sustitución máxima/ }).check();
    await expect(resultado(page)).toHaveCount(0);
    await estimar(page);
    await expect(resultado(page)).toContainText('Por debajo del Grado I: sin grado reconocido');
    await expect(resultado(page)).toContainText('24 de 100');
    await expect(page.getByText(/Prestaciones y servicios del/)).toHaveCount(0);

    await page.getByRole('radio', { name: /Apoyo especial/ }).check();
    await estimar(page);
    await expect(resultado(page)).toContainText('Compatible con el Grado I — Dependencia Moderada');
    await expect(resultado(page)).toContainText('25 de 100');
  });

  /*
   * Solo comer y beber (el otro caso del acta 1320): techo 16,8 → 15 … 17 → sin grado.
   */
  test('solo comer y beber → sin grado (BVD 15-17)', async ({ page }) => {
    await abrir(page);
    await marcarActividad(page, 'Comer y beber');
    await estimar(page);
    await expect(resultado(page)).toContainText('Por debajo del Grado I');
    await expect(resultado(page)).toContainText('entre 15 y 17 de 100');
  });

  /*
   * ESCALA ESPECÍFICA — tomar decisiones, salud, tareas domésticas y desplazarse fuera, enteras.
   *   General:    2,9 + 8,0 + 12,2 = 23,1 → 20,79 → 21 … 23 → sin grado
   *   Específica: 15,4 + 11,0 + 8,0 + 12,9 = 47,3 → 42,57 → 43 … 47 → Grado I (vale la mayor)
   */
  test('con condición que afecta a las funciones mentales vale la escala específica (43-47, Grado I)', async ({ page }) => {
    await abrir(page);
    await expect(page.getByRole('group', { name: /^Tomar decisiones/ })).toHaveCount(0);
    await page.getByRole('checkbox', { name: CONDICION_MENTAL }).check();
    await marcarActividad(page, 'Tomar decisiones');
    await marcarActividad(page, 'Mantenimiento de la salud');
    await marcarActividad(page, 'Realizar tareas domésticas');
    await marcarActividad(page, 'Desplazarse fuera del hogar');
    await estimar(page);
    await expect(resultado(page)).toContainText('Compatible con el Grado I — Dependencia Moderada');
    await expect(resultado(page)).toContainText('entre 43 y 47 de 100 (escala específica');

    // Sin la condición, «Tomar decisiones» desaparece y no cuenta: 21-23, sin grado.
    await page.getByRole('checkbox', { name: CONDICION_MENTAL }).uncheck();
    await expect(page.getByText('15 tareas marcadas')).toBeVisible(); // 5 + 4 + 6, sin las 8 de decisiones
    await estimar(page);
    await expect(resultado(page)).toContainText('Por debajo del Grado I');
    await expect(resultado(page)).toContainText('entre 21 y 23 de 100 (escala general)');
  });

  /*
   * HALLAZGO 1326 — todas las tareas: 100 → 90 … 100 → Grado III. No puede decir que el III es
   * el grado máximo: el RDL 17/2026 creó el Grado III+ (GRADO_III_PLUS en data/fiscal).
   */
  test('todas las tareas → Grado III (90-100) y menciona el Grado III+ del RDL 17/2026', async ({ page }) => {
    await abrir(page);
    for (const a of TODAS_GENERALES) await marcarActividad(page, a);
    await estimar(page);
    await expect(resultado(page)).toContainText('Compatible con el Grado III — Gran Dependencia');
    await expect(resultado(page)).toContainText('entre 90 y 100 de 100');
    await expect(resultado(page)).toContainText('Grado III+');
    await expect(resultado(page)).not.toContainText('grado máximo');
  });

  /*
   * CUESTIONARIO VACÍO O CAMBIADO — sin tareas la puntuación es 0 (sin grado). Si se cambia una
   * respuesta después de estimar, el resultado viejo desaparece.
   */
  test('sin marcar nada → sin grado; cambiar una respuesta retira el resultado anterior', async ({ page }) => {
    await abrir(page);
    await expect(page.getByText('Ninguna tarea marcada')).toBeVisible();
    await estimar(page);
    await expect(resultado(page)).toContainText('Por debajo del Grado I: sin grado reconocido');
    await expect(resultado(page)).toContainText('0 de 100');

    await page.getByRole('checkbox', { name: 'Peinarse', exact: true }).check();
    await expect(resultado(page)).toHaveCount(0);
    await expect(page.getByText(/Marca las tareas que se aplican y pulsa el botón/)).toBeVisible();
  });

  /* HALLAZGO 1325 — el contador concuerda en número y sin «situaciónes». */
  test('el contador dice «1 tarea marcada» y «3 tareas marcadas»', async ({ page }) => {
    await abrir(page);
    await page.getByRole('checkbox', { name: 'Peinarse', exact: true }).check();
    await expect(page.getByText('1 tarea marcada', { exact: true })).toBeVisible();
    await page.getByRole('checkbox', { name: 'Calzarse', exact: true }).check();
    await page.getByRole('checkbox', { name: 'Lavarse el pelo', exact: true }).check();
    await expect(page.getByText('3 tareas marcadas', { exact: true })).toBeVisible();
  });

  /* HALLAZGO 1323 — el nombre accesible del botón es su texto visible (WCAG 2.5.3). */
  test('el botón se encuentra por su texto visible', async ({ page }) => {
    await abrir(page);
    await expect(page.getByRole('button', { name: 'Estimar grado orientativo' })).toHaveCount(1);
  });

  /*
   * HALLAZGO 1321 — la tabla toma cortes y cuantías de data/fiscal/dependencia.ts:
   * GRADOS_DEPENDENCIA (25-49 / 50-74 / 75-100) y PRESTACIONES_DEPENDENCIA_2025, PEVS
   * 300 / 426,12 / 833,96 €/mes (antes 291 / 426 / 833 escritos a mano).
   */
  test('la tabla toma cortes y cuantías de data/fiscal', async ({ page }) => {
    await abrir(page);
    const fila = (grado: string) => page.locator('table tr').filter({ hasText: grado });
    await expect(fila('Grado I — Dependencia Moderada')).toContainText('25-49');
    await expect(fila('Grado I — Dependencia Moderada')).toContainText('300,00 €/mes');
    await expect(fila('Grado II — Dependencia Severa')).toContainText('50-74');
    await expect(fila('Grado II — Dependencia Severa')).toContainText('426,12 €/mes');
    await expect(fila('Grado III — Gran Dependencia')).toContainText('75-100');
    await expect(fila('Grado III — Gran Dependencia')).toContainText('833,96 €/mes');
  });

  /* HALLAZGO 1324 — ningún 💡 del bloque educativo queda fuera de un aria-hidden. */
  test('los emojis de los consejos van ocultos a lectores de pantalla', async ({ page }) => {
    await abrir(page);
    const sueltos = await page.evaluate(() => {
      const recorrido = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const malos: string[] = [];
      for (let n = recorrido.nextNode(); n; n = recorrido.nextNode()) {
        const texto = n.textContent ?? '';
        if (!texto.includes('💡')) continue;
        if (n.parentElement?.closest('[aria-hidden="true"]')) continue;
        malos.push(texto.trim().slice(0, 60));
      }
      return malos;
    });
    expect(sueltos).toEqual([]);
  });

  /*
   * HALLAZGO 1322 — contraste ≥ 4,5:1 del título, la puntuación y la descripción de la caja de
   * resultado en tema claro, para los cuatro colores (sin grado, Grado I, II y III).
   */
  test('la caja de resultado tiene contraste AA en los cuatro colores (tema claro)', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await abrir(page);

    async function medir(): Promise<number> {
      return page.evaluate(() => {
        const caja = [...document.querySelectorAll('[role="status"]')]
          .find(el => el.textContent?.includes('Puntuación BVD estimada')) as HTMLElement;
        const rgb = (c: string) => (c.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
        const lum = ([r, g, b]: number[]) => {
          const f = (v: number) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
          return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
        };
        const fondo = lum(rgb(getComputedStyle(caja).backgroundColor));
        let peor = Infinity;
        for (const hijo of [...caja.children].slice(1) as HTMLElement[]) {
          const estilo = getComputedStyle(hijo);
          const texto = lum(rgb(estilo.color));
          const ratio = (Math.max(texto, fondo) + 0.05) / (Math.min(texto, fondo) + 0.05);
          const opacidad = Number(estilo.opacity);
          peor = Math.min(peor, opacidad < 1 ? 0 : ratio);
        }
        return peor;
      });
    }

    // Sin grado (verde)
    await estimar(page);
    expect(await medir()).toBeGreaterThanOrEqual(4.5);
    // Grado I (amarillo): comer + domésticas con apoyo especial = 25
    await marcarActividad(page, 'Comer y beber');
    await marcarActividad(page, 'Realizar tareas domésticas');
    await page.getByRole('radio', { name: /Apoyo especial/ }).check();
    await estimar(page);
    await expect(resultado(page)).toContainText('Grado I');
    expect(await medir()).toBeGreaterThanOrEqual(4.5);
    // Grado II (naranja): + vestirse 11,9 + micción 14,8 = 51,5 → 52
    await marcarActividad(page, 'Vestirse');
    await marcarActividad(page, 'Higiene personal relacionada con la micción y defecación');
    await estimar(page);
    await expect(resultado(page)).toContainText('Grado II');
    expect(await medir()).toBeGreaterThanOrEqual(4.5);
    // Grado III (rojo): + posición 9,4 + dentro del hogar 12,3 + fuera 12,2 = 85,4 → 85
    await marcarActividad(page, 'Cambiar y mantener la posición del cuerpo');
    await marcarActividad(page, 'Desplazarse dentro del hogar');
    await marcarActividad(page, 'Desplazarse fuera del hogar');
    await estimar(page);
    await expect(resultado(page)).toContainText('Grado III');
    expect(await medir()).toBeGreaterThanOrEqual(4.5);
  });
  /*
   * SOSPECHA DEL INSPECTOR (24/09/2026), CONFIRMADA Y REPARADA el mismo día:
   *  · metadata: `jsonLd.features` vacío y categoría FinanceApplication en una app
   *    sociosanitaria → 7 características reales y EducationalApplication (como test-fragilidad).
   *  · Sin <RegionBadge variant="es-only" /> siendo España-estructural (BVD, LAPAD, SAAD).
   *  · Botón «Estimar grado orientativo»: texto blanco sobre degradado --primary→--secondary.
   *    A mano (WCAG 2.x): blanco sobre #48A9A6 = 1,05 / 0,3264… → 2,80:1; sobre #2E86AB 4,11:1.
   *    Con --primary-boton #26718F → 5,47:1 y --secondary-boton #327874 → 5,15:1, en los dos temas.
   */
  test('sospecha: FAQ/JSON-LD con features y categoría sociosanitaria, y aviso es-only tras el hero', async ({ page }) => {
    await abrir(page);
    const ld = (await page.locator('script[type="application/ld+json"]').allTextContents())
      .map((t) => JSON.parse(t) as Record<string, unknown>);
    const app = ld.find((d) => d['@type'] === 'WebApplication');
    expect(app, 'hay JSON-LD WebApplication').toBeTruthy();
    expect(app!.applicationCategory).toBe('EducationalApplication');
    const features = app!.featureList as string[] | string | undefined;
    const lista = Array.isArray(features) ? features : (features ?? '').split(/,\s*|\n/).filter(Boolean);
    expect(lista.length).toBeGreaterThanOrEqual(4);
    expect(lista.join(' ')).toContain('Baremo de Valoración de la Dependencia');

    // El aviso de ámbito va justo después del hero y antes del aviso legal
    const orden = await page.evaluate(() => {
      const hero = document.querySelector('header[class*="hero"]');
      const siguiente = hero?.nextElementSibling;
      return siguiente?.textContent ?? '';
    });
    expect(orden).toMatch(/España/);
  });

  test('sospecha: el botón «Estimar» tiene contraste AA con texto blanco en los dos extremos del degradado y en los dos temas', async ({ page }) => {
    async function peorContraste(): Promise<number> {
      return page.getByRole('button', { name: 'Estimar grado orientativo' }).evaluate((btn) => {
        const estilo = getComputedStyle(btn);
        const lum = ([r, g, b]: number[]) => {
          const f = (v: number) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
          return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
        };
        const colores = [...estilo.backgroundImage.matchAll(/rgba?\(([^)]+)\)/g)]
          .map((m) => m[1].split(',').slice(0, 3).map((v) => Number(v.trim())));
        const texto = lum((estilo.color.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number));
        if (colores.length < 2) return 0;
        return Math.min(...colores.map((c) => {
          const f = lum(c);
          return (Math.max(texto, f) + 0.05) / (Math.min(texto, f) + 0.05);
        }));
      });
    }
    await abrir(page);
    await activarTema(page, 'light');
    expect(await peorContraste()).toBeGreaterThanOrEqual(4.5);
    await activarTema(page, 'dark');
    expect(await peorContraste()).toBeGreaterThanOrEqual(4.5);
  });
});
