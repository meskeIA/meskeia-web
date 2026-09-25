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

  /* ══════════════════════════════════════════════════════════════════════════════════════════
   * REINSPECCIÓN del 25/09/2026 (tras b0118e82 y 3de61f3c). Pesos cotejados de nuevo contra el
   * RD 174/2011 descargado del BOE (BOE-A-2011-3174), anexo A, columna «18 y más», y anexo C.
   * Valor de cada tarea = peso de la tarea × peso de su actividad.
   * ══════════════════════════════════════════════════════════════════════════════════════════ */

  /*
   * TRAMO DEL GRADO I con tareas sueltas (no actividades enteras), resuelto a mano:
   *   Lavarse (8,8): bañera/ducha 0,15 + inferior 0,25 + superior 0,25 = 0,65 × 8,8 = 5,72
   *   Vestirse (11,9): calzarse 0,10 + inferior 0,30 + superior 0,30 = 0,70 × 11,9 = 8,33
   *   Desplazarse fuera del hogar, entera = 12,2 · Tareas domésticas, entera = 8,0
   *   Σ = 5,72 + 8,33 + 12,2 + 8,0 = 34,25
   *   Sin tipo de apoyo: 34,25 × 0,90 = 30,825 → 31 … 34,25 → 34 → Grado I en los dos extremos.
   *   Supervisión 0,90 → 31 · sustitución máxima 0,95 → 32,5375 → 33 · apoyo especial 1,00 → 34:
   *   las tres puntuaciones puntuales caen DENTRO del intervalo 31-34 que se publica sin apoyo.
   */
  test('Grado I con tareas sueltas: intervalo 31-34 y cada tipo de apoyo cae dentro (31 · 33 · 34)', async ({ page }) => {
    await abrir(page);
    for (const t of ['Acceder a la bañera, ducha o similar', 'Lavarse la parte inferior del cuerpo',
      'Lavarse la parte superior del cuerpo', 'Calzarse', 'Vestirse las prendas de la parte inferior del cuerpo',
      'Vestirse las prendas de la parte superior del cuerpo']) {
      await page.getByRole('checkbox', { name: t, exact: true }).check();
    }
    await marcarActividad(page, 'Desplazarse fuera del hogar');
    await marcarActividad(page, 'Realizar tareas domésticas');
    await expect(page.getByText('16 tareas marcadas', { exact: true })).toBeVisible();

    await estimar(page);
    await expect(resultado(page)).toContainText('Compatible con el Grado I — Dependencia Moderada');
    await expect(resultado(page)).toContainText('entre 31 y 34 de 100 (escala general)');

    const puntual: [RegExp, string][] = [
      [/Sobre todo supervisión/, 'Puntuación BVD estimada: 31 de 100'],
      [/sustitución máxima/, 'Puntuación BVD estimada: 33 de 100'],
      [/Apoyo especial/, 'Puntuación BVD estimada: 34 de 100'],
    ];
    for (const [radio, texto] of puntual) {
      await page.getByRole('radio', { name: radio }).check();
      await estimar(page);
      await expect(resultado(page)).toContainText(texto);
      await expect(resultado(page)).toContainText('Compatible con el Grado I');
    }
  });

  /*
   * FRONTERAS EXACTAS con apoyo especial (× 1,00, la puntuación es la suma). «La puntuación final
   * se redondea al entero más cercano» (RD 174/2011, anexo I, apdo. 7.d); cortes 25/50/75.
   *   24,40 = comer entera 16,8 + acudir a un lugar adecuado 0,20×14,8 = 2,96
   *           + lavarse la parte inferior 0,25×8,8 = 2,20 + cercanos conocidos 0,20×12,2 = 2,44 → 24, sin grado
   *   24,60 = comer 16,8 + acudir 2,96 + grifos 0,15×8,8 = 1,32 + bañera 1,32 + inferior 2,20 → 25, Grado I
   *   49,40 = comer 16,8 + micción 14,8 + vestirse 11,9 (= 43,5) + manos 0,20×8,8 = 1,76
   *           + limpiar vivienda 0,20×8,0 = 1,60 + lejanos conocidos 0,10×12,2 = 1,22 + grifos 1,32 → 49, Grado I
   *   49,60 = 43,5 + lavarse el pelo 0,25×2,9 = 0,725 + riesgo dentro del domicilio 0,25×2,9 = 0,725
   *           + limpiar vivienda 1,60 + acceder al exterior 0,25×12,2 = 3,05 → 50, Grado II
   *   74,40 = comer + micción + vestirse + fuera 12,2 + dentro 12,3 (= 68,0) + inferior 2,20
   *           + superior 2,20 + hacer la compra 0,25×8,0 = 2,00 → 74, Grado II
   *   74,60 = comer + micción + vestirse + posición 9,4 + dentro 12,3 (= 65,2) + inferior 2,20
   *           + preparar comidas 0,45×8 = 3,60 + compra 2,00 + limpiar 1,60 → 75, Grado III
   */
  const FRONTERAS: { suma: string; actividades: Actividad[]; tareas: string[]; puntos: number; titulo: string }[] = [
    { suma: '24,40', actividades: ['Comer y beber'], tareas: ['Acudir a un lugar adecuado', 'Lavarse la parte inferior del cuerpo', 'Realizar desplazamientos cercanos en entornos conocidos'], puntos: 24, titulo: 'Por debajo del Grado I: sin grado reconocido' },
    { suma: '24,60', actividades: ['Comer y beber'], tareas: ['Acudir a un lugar adecuado', 'Abrir y cerrar grifos', 'Acceder a la bañera, ducha o similar', 'Lavarse la parte inferior del cuerpo'], puntos: 25, titulo: 'Compatible con el Grado I — Dependencia Moderada' },
    { suma: '49,40', actividades: ['Comer y beber', 'Higiene personal relacionada con la micción y defecación', 'Vestirse'], tareas: ['Lavarse las manos', 'Limpiar y cuidar de la vivienda', 'Realizar desplazamientos lejanos en entornos conocidos', 'Abrir y cerrar grifos'], puntos: 49, titulo: 'Compatible con el Grado I — Dependencia Moderada' },
    { suma: '49,60', actividades: ['Comer y beber', 'Higiene personal relacionada con la micción y defecación', 'Vestirse'], tareas: ['Lavarse el pelo', 'Evitar situaciones de riesgo dentro del domicilio', 'Limpiar y cuidar de la vivienda', 'Acceder al exterior'], puntos: 50, titulo: 'Compatible con el Grado II — Dependencia Severa' },
    { suma: '74,40', actividades: ['Comer y beber', 'Higiene personal relacionada con la micción y defecación', 'Vestirse', 'Desplazarse fuera del hogar', 'Desplazarse dentro del hogar'], tareas: ['Lavarse la parte inferior del cuerpo', 'Lavarse la parte superior del cuerpo', 'Hacer la compra'], puntos: 74, titulo: 'Compatible con el Grado II — Dependencia Severa' },
    { suma: '74,60', actividades: ['Comer y beber', 'Higiene personal relacionada con la micción y defecación', 'Vestirse', 'Cambiar y mantener la posición del cuerpo', 'Desplazarse dentro del hogar'], tareas: ['Lavarse la parte inferior del cuerpo', 'Preparar comidas', 'Hacer la compra', 'Limpiar y cuidar de la vivienda'], puntos: 75, titulo: 'Compatible con el Grado III — Gran Dependencia' },
  ];

  for (const f of FRONTERAS) {
    test(`frontera: suma ${f.suma} con apoyo especial → ${f.puntos} puntos`, async ({ page }) => {
      await abrir(page);
      for (const a of f.actividades) await marcarActividad(page, a);
      for (const t of f.tareas) await page.getByRole('checkbox', { name: t, exact: true }).check();
      await page.getByRole('radio', { name: /Apoyo especial/ }).check();
      await estimar(page);
      await expect(resultado(page)).toContainText(`Puntuación BVD estimada: ${f.puntos} de 100`);
      await expect(resultado(page)).toContainText(f.titulo);
    });
  }

  /*
   * LAS MITADES. La norma dice «al entero más cercano» y no resuelve el empate; la app sube la
   * mitad (redondeo aritmético) y se protege del ruido de coma flotante (motor.ts:72). Este caso
   * documenta esa convención y vigila la protección: sin ella una suma que en binario vale
   * 74,4999… bajaría a 74.
   *   24,50 = comer 16,8 + acudir 2,96 + grifos 1,32 + inferior 2,20 + lejanos conocidos 1,22 → 25
   *   49,50 = 43,5 + lavarse inferior 2,20 + superior 2,20 + limpiar vivienda 1,60 → 50
   *   74,50 = 68,0 + manos 1,76 + inferior 2,20 + peinarse 0,30×2,9 = 0,87 + dientes 0,87
   *           + lavar la ropa 0,10×8,0 = 0,80 → 75
   */
  test('las sumas que acaban en ,5 suben: 24,5 → 25 · 49,5 → 50 · 74,5 → 75', async ({ page }) => {
    const mitades: { actividades: Actividad[]; tareas: string[]; puntos: number; grado: string }[] = [
      { actividades: ['Comer y beber'], tareas: ['Acudir a un lugar adecuado', 'Abrir y cerrar grifos', 'Lavarse la parte inferior del cuerpo', 'Realizar desplazamientos lejanos en entornos conocidos'], puntos: 25, grado: 'Grado I' },
      { actividades: ['Comer y beber', 'Higiene personal relacionada con la micción y defecación', 'Vestirse'], tareas: ['Lavarse la parte inferior del cuerpo', 'Lavarse la parte superior del cuerpo', 'Limpiar y cuidar de la vivienda'], puntos: 50, grado: 'Grado II' },
      { actividades: ['Comer y beber', 'Higiene personal relacionada con la micción y defecación', 'Vestirse', 'Desplazarse fuera del hogar', 'Desplazarse dentro del hogar'], tareas: ['Lavarse las manos', 'Lavarse la parte inferior del cuerpo', 'Peinarse', 'Lavarse los dientes', 'Lavar y cuidar la ropa'], puntos: 75, grado: 'Grado III' },
    ];
    for (const m of mitades) {
      await abrir(page);
      for (const a of m.actividades) await marcarActividad(page, a);
      for (const t of m.tareas) await page.getByRole('checkbox', { name: t, exact: true }).check();
      await page.getByRole('radio', { name: /Apoyo especial/ }).check();
      await estimar(page);
      await expect(resultado(page)).toContainText(`Puntuación BVD estimada: ${m.puntos} de 100`);
      await expect(resultado(page)).toContainText(`Compatible con el ${m.grado}`);
    }
  });

  /*
   * INTERVALOS QUE CRUZAN UN CORTE (sin tipo de apoyo: × 0,90 … × 1,00):
   *   comer 16,8 + micción 14,8 + vestirse 11,9 + domésticas 8,0 = 51,5
   *     → 46,35 → 46 … 51,5 → 52: cruza 50. Con sustitución máxima: 48,925 → 49 → Grado I.
   *   comer + micción + vestirse + posición 9,4 + dentro 12,3 + fuera 12,2 = 77,4
   *     → 69,66 → 70 … 77,4 → 77: cruza 75. Con sustitución máxima: 73,53 → 74 → Grado II.
   */
  test('intervalos que cruzan 50 y 75 dicen «en el límite»; con sustitución máxima caen en 49 y 74', async ({ page }) => {
    await abrir(page);
    for (const a of ['Comer y beber', 'Higiene personal relacionada con la micción y defecación', 'Vestirse', 'Realizar tareas domésticas'] as const) {
      await marcarActividad(page, a);
    }
    await estimar(page);
    await expect(resultado(page)).toContainText('En el límite entre Grado I y Grado II');
    await expect(resultado(page)).toContainText('entre 46 y 52 de 100');
    await expect(resultado(page)).toContainText('cruza el corte de 50 puntos');
    await page.getByRole('radio', { name: /sustitución máxima/ }).check();
    await estimar(page);
    await expect(resultado(page)).toContainText('Puntuación BVD estimada: 49 de 100');
    await expect(resultado(page)).toContainText('Compatible con el Grado I');

    await abrir(page);
    for (const a of ['Comer y beber', 'Higiene personal relacionada con la micción y defecación', 'Vestirse',
      'Cambiar y mantener la posición del cuerpo', 'Desplazarse dentro del hogar', 'Desplazarse fuera del hogar'] as const) {
      await marcarActividad(page, a);
    }
    await estimar(page);
    await expect(resultado(page)).toContainText('En el límite entre Grado II y Grado III');
    await expect(resultado(page)).toContainText('entre 70 y 77 de 100');
    await expect(resultado(page)).toContainText('cruza el corte de 75 puntos');
    await page.getByRole('radio', { name: /sustitución máxima/ }).check();
    await estimar(page);
    await expect(resultado(page)).toContainText('Puntuación BVD estimada: 74 de 100');
    await expect(resultado(page)).toContainText('Compatible con el Grado II');
  });

  /* TODO «SIN DIFICULTAD» también con la escala específica y apoyo especial: 0 × lo que sea = 0. */
  test('nada marcado, con condición de funciones mentales y apoyo especial → 0, sin grado', async ({ page }) => {
    await abrir(page);
    await page.getByRole('checkbox', { name: CONDICION_MENTAL }).check();
    await page.getByRole('radio', { name: /Apoyo especial/ }).check();
    await estimar(page);
    await expect(resultado(page)).toContainText('Puntuación BVD estimada: 0 de 100');
    await expect(resultado(page)).toContainText('Por debajo del Grado I: sin grado reconocido');
    await expect(page.getByText(/Prestaciones y servicios del/)).toHaveCount(0);
  });

  /* HALLAZGO 1322, lado OSCURO — la caja de resultado en los cuatro colores, ≥ 4,5:1. */
  test('la caja de resultado tiene contraste AA en los cuatro colores (tema oscuro)', async ({ page }) => {
    await abrir(page);
    await page.addStyleTag({ content: '*, *::before, *::after { transition: none !important; }' });
    await activarTema(page, 'dark');
    const medir = () => page.evaluate(() => {
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
        const texto = lum(rgb(getComputedStyle(hijo).color));
        peor = Math.min(peor, (Math.max(texto, fondo) + 0.05) / (Math.min(texto, fondo) + 0.05));
      }
      return peor;
    });
    await estimar(page);
    await expect.poll(medir).toBeGreaterThanOrEqual(4.5);
    await marcarActividad(page, 'Comer y beber');
    await marcarActividad(page, 'Realizar tareas domésticas');
    await page.getByRole('radio', { name: /Apoyo especial/ }).check();
    await estimar(page);
    await expect(resultado(page)).toContainText('Grado I');
    await expect.poll(medir).toBeGreaterThanOrEqual(4.5);
    await marcarActividad(page, 'Vestirse');
    await marcarActividad(page, 'Higiene personal relacionada con la micción y defecación');
    await estimar(page);
    await expect(resultado(page)).toContainText('Grado II');
    await expect.poll(medir).toBeGreaterThanOrEqual(4.5);
    await marcarActividad(page, 'Cambiar y mantener la posición del cuerpo');
    await marcarActividad(page, 'Desplazarse dentro del hogar');
    await marcarActividad(page, 'Desplazarse fuera del hogar');
    await estimar(page);
    await expect(resultado(page)).toContainText('Grado III');
    await expect.poll(medir).toBeGreaterThanOrEqual(4.5);
  });

  /*
   * HALLAZGO NUEVO (reinspección 25/09/2026) — el primer escenario del bloque educativo («75 años,
   * necesita ayuda para ducharse y vestirse pero puede comer sola y moverse por casa») dice
   * «Probable Grado I o II» y «Grado I → SAD 3h/día». Con los pesos del BVD que usa la propia app,
   * lavarse (8,8) + vestirse (11,9) = 20,7 → 18,63 → 19 … 21: SIN GRADO. Y el SAD del Grado I es
   * de 20 a 37 horas MENSUALES (RD 1051/2013, anexo II, redacción del RD 675/2023,
   * BOE-A-2013-13811), no 3 h al día. Se marca test.fail() hasta que se repare.
   */
  test.fail('el escenario «ducharse y vestirse» no promete un grado que el baremo de la app no da', async ({ page }) => {
    await abrir(page);
    await marcarActividad(page, 'Lavarse');
    await marcarActividad(page, 'Vestirse');
    await estimar(page);
    await expect(resultado(page)).toContainText('Por debajo del Grado I: sin grado reconocido');
    await expect(resultado(page)).toContainText('entre 19 y 21 de 100');

    const escenario = page.locator('[class*="escenarioCard"]').filter({ hasText: 'Persona mayor con movilidad limitada' });
    await expect(escenario).toHaveCount(1);
    await expect(escenario).not.toContainText('Probable Grado I o II');
    await expect(escenario).not.toContainText('3h/día');
  });

  /*
   * HALLAZGO NUEVO (reinspección 25/09/2026) — la app repite que las prestaciones se cobran
   * «desde la fecha de solicitud, no desde la resolución». La Ley 39/2006, disposición final
   * primera, apartado 3 (redacción del RDL 20/2012, vigente en el texto consolidado del BOE,
   * BOE-A-2006-21990), dice lo contrario: el derecho «se generará desde la fecha de la resolución
   * de reconocimiento de las prestaciones o, en su caso, desde el transcurso del plazo de seis
   * meses desde la presentación de la solicitud» sin resolución, y la PECEF queda sujeta a un
   * plazo suspensivo de hasta dos años. Se marca test.fail() hasta que se repare.
   */
  test.fail('el bloque educativo no dice que las prestaciones se cobran desde la solicitud', async ({ page }) => {
    await abrir(page);
    const falsas = page.getByText(
      /(cobran|cuentan|son) desde la (fecha de )?solicitud|derechos son desde la solicitud|retroactivas \(desde la solicitud\)/,
    );
    await expect(falsas).toHaveCount(0);
  });

  /*
   * REPARACIÓN INCOMPLETA DEL 1326 — el FAQPage del JSON-LD (el que leen los buscadores con IA)
   * sigue respondiendo «Existen tres grados» a «¿cuántos niveles existen?», sin el Grado III+
   * que data/fiscal/dependencia.ts recoge (GRADO_III_PLUS, en vigor desde el 25/06/2026) y que la
   * app ya menciona en el resultado, la tabla y el bloque educativo. Se marca test.fail().
   */
  test.fail('el FAQPage del JSON-LD no dice que solo existen tres grados', async ({ page }) => {
    await abrir(page);
    const ld = (await page.locator('script[type="application/ld+json"]').allTextContents())
      .map((t) => JSON.parse(t) as Record<string, unknown>);
    const faq = ld.find((d) => d['@type'] === 'FAQPage');
    expect(faq, 'hay JSON-LD FAQPage').toBeTruthy();
    const texto = JSON.stringify(faq);
    expect(texto).not.toContain('Existen tres grados');
  });

  /*
   * HALLAZGO NUEVO (reinspección 25/09/2026) — las preguntas del FAQ visible (`.faqItem strong`,
   * OrientadorGradoDependencia.module.css:403-407) usan `var(--primary)` como color de TEXTO:
   * #2E86AB sobre el fondo del bloque educativo da 3,77:1 en claro y 3,21:1 en oscuro, por debajo
   * de 4,5:1 (texto normal en negrita, < 18,66 px). Se marca test.fail() hasta que se repare.
   */
  test.fail('las preguntas del FAQ visible tienen contraste AA en los dos temas', async ({ page }) => {
    await abrir(page);
    await page.addStyleTag({ content: '*, *::before, *::after { transition: none !important; }' });
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const peor = () => page.evaluate(() => {
      const rgba = (c: string) => { const m = (c.match(/[\d.]+/g) ?? []).map(Number); return { r: m[0], g: m[1], b: m[2], a: m.length > 3 ? m[3] : 1 }; };
      const lum = ({ r, g, b }: { r: number; g: number; b: number }) => {
        const f = (v: number) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
      };
      const fondoDe = (el: Element) => {
        for (let e: Element | null = el; e; e = e.parentElement) {
          const c = rgba(getComputedStyle(e).backgroundColor);
          if (c.a >= 1) return c;
        }
        return { r: 255, g: 255, b: 255, a: 1 };
      };
      let minimo = Infinity;
      for (const s of document.querySelectorAll('[class*="faqItem"] > strong')) {
        const t = lum(rgba(getComputedStyle(s).color));
        const f = lum(fondoDe(s));
        minimo = Math.min(minimo, (Math.max(t, f) + 0.05) / (Math.min(t, f) + 0.05));
      }
      return minimo;
    });
    await activarTema(page, 'light');
    expect(await peor()).toBeGreaterThanOrEqual(4.5);
    await activarTema(page, 'dark');
    expect(await peor()).toBeGreaterThanOrEqual(4.5);
  });
});
