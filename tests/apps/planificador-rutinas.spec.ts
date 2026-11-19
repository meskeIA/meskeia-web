import { test, expect, type Page, type Locator } from '@playwright/test';
import { esperarValorEnReact, esperarPaginaAsentada } from './_hidratacion';

/**
 * Inspector — planificador-rutinas (segmento cálculo · planificador cotidiano) · 19/11/2026
 *
 * Promete (h1, metadata y guía): crear rutinas con pictogramas (emojis), reordenar sus tareas con
 * una duración orientativa, seguirlas paso a paso con un botón ¡HECHO!, un contador «k / N», una
 * barra de progreso y un fin de rutina, y guardarlo todo en localStorage (clave
 * «meskeia-rutinas-v1»). No hay horas de reloj ni totales: la app no suma duraciones, así que lo
 * comprobable es el recuento, el orden, el avance, lo que se guarda y lo que se rechaza.
 *
 * DE DÓNDE SALEN LOS ESPERADOS (resueltos a mano antes de abrir la app)
 *   · La rutina de ejemplo que trae la app sin datos: «Mañana», 6 tareas (page.tsx, RUTINA_EJEMPLO).
 *   · «Tarde» = Merendar 15 min, Deberes 30 min, Jugar sin tiempo; ▲ en Jugar → Merendar, Jugar,
 *     Deberes. Al seguirla: 1 / 3 → 2 / 3 → 3 / 3 → fin. La barra vale completadas / total:
 *     0 · 1/3 = 33,33 % · 2/3 = 66,67 % · 100 %. El toBeCloseTo va a 1 decimal: un fallo de
 *     recuento la movería 33 puntos.
 *   · 7 tareas → «7 tareas» y la vista previa enseña 6 emojis y «+1» (slice(0, 6)).
 *   · El campo de duración declara min=0 y max=120: −5, 500 o 1e3 no son duraciones válidas.
 *   · Formato español (CLAUDE.md §2): 2,5 min, nunca «2.5 min».
 *
 * Los test con test.fail() son HALLAZGOS ABIERTOS (19/11/2026): describen lo que DEBERÍA pasar y
 * hoy no pasa. Al reparar cada uno se quita su test.fail() —comprobando antes que lo que afirma
 * sigue siendo lo correcto— y «ABIERTO» pasa a «REPARADO».
 */

test.use({ locale: 'es-ES', reducedMotion: 'reduce' });

const RUTA = '/planificador-rutinas/';
const CLAVE = 'meskeia-rutinas-v1';

interface TareaGuardada {
  nombre: string;
  duracion: number;
  completada: boolean;
}
interface RutinaGuardada {
  nombre: string;
  tareas: TareaGuardada[];
}

/** Abre la app y espera a la rutina de ejemplo: solo existe tras el efecto que lee localStorage. */
async function abrir(page: Page): Promise<void> {
  await page.goto(RUTA);
  await expect(page.getByRole('button', { name: 'Iniciar rutina Mañana' })).toBeVisible();
}

const tarjetas = (page: Page): Locator => page.locator('div[class$="_rutinaCard"]');
const nombresTarjetas = (page: Page): Locator => page.locator('h3[class$="_rutinaCardNombre"]');
const cuentasTarjetas = (page: Page): Locator => page.locator('[class$="_rutinaCardCount"]');
const itemsEditor = (page: Page): Locator => page.locator('[class$="_tareaEditorItem"]');
const progreso = (page: Page): Locator => page.locator('[class$="_rutinaHeaderProgreso"]');
const tareaActual = (page: Page): Locator => page.locator('[class$="_tareaActualNombre"]');
const duracionActual = (page: Page): Locator => page.locator('[class$="_tareaActualDuracion"]');
const proxima = (page: Page): Locator => page.locator('[class$="_proximaTarea"]');
const botonHecho = (page: Page): Locator => page.getByRole('button', { name: 'Marcar tarea como completada' });

async function leerGuardado(page: Page): Promise<RutinaGuardada[]> {
  const bruto = await page.evaluate((clave) => localStorage.getItem(clave), CLAVE);
  return bruto ? (JSON.parse(bruto) as RutinaGuardada[]) : [];
}

async function anchoBarra(page: Page): Promise<number> {
  const estilo = await page.locator('[class$="_progresoTopBar"]').evaluate((el) => (el as HTMLElement).style.width);
  return parseFloat(estilo);
}

/** Añade una tarea en el editor; la duración se escribe con fill() y se comprueba en React. */
async function anadirTarea(page: Page, nombre: string, duracion?: number | string): Promise<void> {
  await page.locator('#nueva-tarea-nombre').fill(nombre);
  await esperarValorEnReact(page, '#nueva-tarea-nombre', nombre);
  if (duracion !== undefined) {
    await page.locator('#nueva-tarea-dur').fill(String(duracion));
  }
  await page.locator('#nueva-tarea-nombre').press('Enter');
  await expect(page.locator('#nueva-tarea-nombre')).toHaveValue('');
}

async function crearRutina(page: Page, nombre: string, tareas: [string, number?][]): Promise<void> {
  await page.getByRole('button', { name: 'Crear nueva rutina' }).click();
  await expect(page.getByRole('heading', { name: 'Nueva rutina' })).toBeVisible();
  await page.locator('#nombre-rutina').fill(nombre);
  await esperarValorEnReact(page, '#nombre-rutina', nombre);
  for (const [n, d] of tareas) await anadirTarea(page, n, d);
}

test.describe('Casos resueltos a mano', () => {
  test('normal · «Tarde» (15, 30 y sin tiempo), reordenada: recuento, avance 1/3 → fin, barra y recarga', async ({ page }) => {
    await abrir(page);
    await crearRutina(page, 'Tarde', [['Merendar', 15], ['Deberes', 30], ['Jugar']]);
    await expect(itemsEditor(page)).toHaveCount(3);

    // ▲ en la tercera (Jugar) → Merendar, Jugar, Deberes
    await itemsEditor(page).nth(2).getByRole('button', { name: 'Mover arriba' }).click();
    await expect(itemsEditor(page).nth(1)).toContainText('Jugar');
    await page.getByRole('button', { name: /Guardar rutina/ }).click();

    await expect(nombresTarjetas(page)).toHaveText(['Mañana', 'Tarde']);
    await expect(cuentasTarjetas(page)).toHaveText(['6 tareas', '3 tareas']);
    const guardado = await leerGuardado(page);
    expect(guardado.map((r) => r.nombre)).toEqual(['Mañana', 'Tarde']);
    expect(guardado[1].tareas.map((t) => [t.nombre, t.duracion, t.completada])).toEqual([
      ['Merendar', 15, false],
      ['Jugar', 0, false],
      ['Deberes', 30, false],
    ]);

    // Seguir: 1/3 → 2/3 → 3/3 → fin; barra = completadas / total
    await page.getByRole('button', { name: 'Iniciar rutina Tarde' }).click();
    await expect(progreso(page)).toHaveText('1 / 3');
    await expect(tareaActual(page)).toHaveText('Merendar');
    await expect(duracionActual(page)).toContainText('15 min');
    await expect(proxima(page)).toContainText('Jugar');
    expect(await anchoBarra(page)).toBeCloseTo(0, 1);

    await botonHecho(page).click();
    await expect(progreso(page)).toHaveText('2 / 3');
    await expect(tareaActual(page)).toHaveText('Jugar');
    await expect(duracionActual(page)).toHaveCount(0); // sin tiempo: no se pinta «0 min»
    await expect(proxima(page)).toContainText('Deberes');
    expect(await anchoBarra(page)).toBeCloseTo(33.33, 1);

    await botonHecho(page).click();
    await expect(progreso(page)).toHaveText('3 / 3');
    await expect(tareaActual(page)).toHaveText('Deberes');
    await expect(duracionActual(page)).toContainText('30 min');
    await expect(proxima(page)).toHaveCount(0);
    expect(await anchoBarra(page)).toBeCloseTo(66.67, 1);

    await botonHecho(page).click();
    await expect(page.getByRole('heading', { name: '¡Rutina completada!' })).toBeVisible();
    expect(await anchoBarra(page)).toBeCloseTo(100, 1);

    // Recargar: las dos rutinas siguen, con su recuento
    await page.getByRole('button', { name: /Volver al inicio/ }).click();
    await page.reload();
    await expect(page.getByRole('button', { name: 'Iniciar rutina Tarde' })).toBeVisible();
    await expect(nombresTarjetas(page)).toHaveText(['Mañana', 'Tarde']);
    await expect(cuentasTarjetas(page)).toHaveText(['6 tareas', '3 tareas']);
  });

  test('límite · 7 tareas y una de 120 min (el máximo del campo): «7 tareas», 6 emojis + «+1», «120 min»', async ({ page }) => {
    await abrir(page);
    await crearRutina(page, 'Larga', [['Uno', 120], ['Dos'], ['Tres'], ['Cuatro'], ['Cinco'], ['Seis'], ['Siete']]);
    await page.getByRole('button', { name: /Guardar rutina/ }).click();

    const tarjeta = tarjetas(page).filter({ has: page.getByRole('heading', { name: 'Larga' }) });
    await expect(tarjeta.locator('[class$="_rutinaCardCount"]')).toHaveText('7 tareas');
    await expect(tarjeta.locator('[class$="_previewEmoji"]')).toHaveCount(6);
    await expect(tarjeta.locator('[class$="_previewMas"]')).toHaveText('+1');

    await page.getByRole('button', { name: 'Iniciar rutina Larga' }).click();
    await expect(progreso(page)).toHaveText('1 / 7');
    await expect(duracionActual(page)).toContainText('120 min');
  });

  test('HALLAZGO (19/11/2026, ABIERTO) · límite: borrar la única rutina no se guarda y vuelve al recargar', async ({ page }) => {
    // El efecto que guarda solo escribe con rutinas.length > 0: con la lista vacía localStorage
    // se queda con la última rutina, y al recargar reaparece «Mañana».
    test.fail();
    await abrir(page);
    await page.getByRole('button', { name: 'Eliminar rutina Mañana' }).click();
    await expect(page.getByText('Aún no tienes rutinas. ¡Crea la primera!')).toBeVisible();

    await page.reload();
    await esperarPaginaAsentada(page);
    await expect(nombresTarjetas(page)).toHaveCount(0);
    await expect(page.getByText('Aún no tienes rutinas. ¡Crea la primera!')).toBeVisible();
  });

  test('rechazo · nombre de tarea vacío o de espacios, y nombre de rutina de espacios', async ({ page }) => {
    await abrir(page);
    await page.getByRole('button', { name: 'Crear nueva rutina' }).click();
    const anadir = page.getByRole('button', { name: '+ Añadir tarea' });
    const guardar = page.getByRole('button', { name: /Guardar rutina/ });

    await expect(anadir).toBeDisabled();
    await page.locator('#nueva-tarea-nombre').fill('   ');
    await esperarValorEnReact(page, '#nueva-tarea-nombre', '   ');
    await expect(anadir).toBeDisabled();
    await page.locator('#nueva-tarea-nombre').press('Enter');
    await expect(page.getByRole('heading', { name: 'Tareas (0)' })).toBeVisible();
    await expect(guardar).toBeDisabled(); // sin tareas no se guarda

    await anadirTarea(page, 'Lavarse los dientes', 3);
    await expect(page.getByRole('heading', { name: 'Tareas (1)' })).toBeVisible();
    await page.locator('#nombre-rutina').fill('   ');
    await esperarValorEnReact(page, '#nombre-rutina', '   ');
    await expect(guardar).toBeDisabled();
  });

  test('HALLAZGO (19/11/2026, ABIERTO) · rechazo: la duración admite −5, 500 y 1e3 pese a min=0 y max=120, y pinta «2.5 min»', async ({ page }) => {
    // Hoy: −5 se guarda como −5 (y no se pinta), 500 sale «500 min», «1e3» sale «1000 min» y
    // «2,5» tecleado en es-ES sale «2.5 min».
    test.fail();
    await abrir(page);
    await crearRutina(page, 'Pruebas', [['Base', 10]]);
    await anadirTarea(page, 'Negativa', -5);
    await anadirTarea(page, 'Larguísima', 500);
    await page.locator('#nueva-tarea-nombre').fill('Decimal');
    await page.locator('#nueva-tarea-dur').click();
    await page.keyboard.type('2,5');
    await page.locator('#nueva-tarea-nombre').press('Enter');

    const lista = page.locator('[class$="_tareasList"]');
    await expect(lista).not.toContainText('500 min');
    await expect(lista).not.toContainText(/\d\.\d+\s*min/); // nunca el punto decimal de EE. UU.

    await page.getByRole('button', { name: /Guardar rutina/ }).click();
    const pruebas = (await leerGuardado(page)).find((r) => r.nombre === 'Pruebas');
    expect(pruebas).toBeDefined();
    for (const t of pruebas?.tareas ?? []) {
      expect(t.duracion, `duración guardada de «${t.nombre}»`).toBeGreaterThanOrEqual(0);
      expect(t.duracion, `duración guardada de «${t.nombre}»`).toBeLessThanOrEqual(120);
    }
  });

  test('HALLAZGO (19/11/2026, ABIERTO) · doble toque en ¡HECHO! marca dos tareas y no hay vuelta atrás', async ({ page }) => {
    // Hoy: en 1/3 un doble clic deja «3 / 3» (Jugar marcada sin hacer) y la vista no tiene
    // «Anterior» ni «Deshacer». La receta del repositorio para la ráfaga es useGuardaRafaga.
    test.fail();
    await abrir(page);
    await crearRutina(page, 'Tarde', [['Merendar', 15], ['Jugar'], ['Deberes', 30]]);
    await page.getByRole('button', { name: /Guardar rutina/ }).click();
    await page.getByRole('button', { name: 'Iniciar rutina Tarde' }).click();
    await expect(progreso(page)).toHaveText('1 / 3');
    await botonHecho(page).dblclick();
    await expect(progreso(page)).toHaveText('2 / 3');
    await expect(tareaActual(page)).toHaveText('Jugar');
  });
});

test.describe('Foco, anuncios y selector', () => {
  test('HALLAZGO (19/11/2026, ABIERTO) · el foco cae a <body> al cambiar de vista y en el editor', async ({ page }) => {
    // Hoy: BODY tras Iniciar, tras el último ¡HECHO!, tras Guardar rutina, tras elegir un emoji y
    // tras «+ Añadir tarea» (el botón se deshabilita con el foco dentro).
    test.fail();
    const enBody = (): Promise<boolean> => page.evaluate(() => !document.activeElement || document.activeElement === document.body);
    await abrir(page);

    await page.getByRole('button', { name: 'Crear nueva rutina' }).click();
    await page.getByRole('button', { name: /Emoji seleccionado/ }).click();
    await page.getByRole('option', { name: '🚿' }).focus();
    await page.keyboard.press('Enter');
    expect(await enBody(), 'tras elegir un emoji').toBe(false);

    await page.locator('#nombre-rutina').fill('Noche');
    await page.locator('#nueva-tarea-nombre').fill('Ducharse');
    await esperarValorEnReact(page, '#nueva-tarea-nombre', 'Ducharse');
    await page.getByRole('button', { name: '+ Añadir tarea' }).focus();
    await page.keyboard.press('Enter');
    await expect(itemsEditor(page)).toHaveCount(1);
    expect(await enBody(), 'tras «+ Añadir tarea»').toBe(false);

    await page.getByRole('button', { name: /Guardar rutina/ }).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('button', { name: 'Iniciar rutina Noche' })).toBeVisible();
    expect(await enBody(), 'tras Guardar rutina').toBe(false);

    await page.getByRole('button', { name: 'Iniciar rutina Noche' }).focus();
    await page.keyboard.press('Enter');
    await expect(progreso(page)).toHaveText('1 / 1');
    expect(await enBody(), 'tras Iniciar').toBe(false);

    await botonHecho(page).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { name: '¡Rutina completada!' })).toBeVisible();
    expect(await enBody(), 'tras el último ¡HECHO!').toBe(false);
  });

  test('HALLAZGO (19/11/2026, ABIERTO) · al pulsar ¡HECHO! nada anuncia la tarea nueva', async ({ page }) => {
    // Hoy: la vista no tiene ninguna región viva, el botón se llama «Marcar tarea como completada»
    // aunque enseña «✓ ¡HECHO!» (WCAG 2.5.3) y el role="progressbar" no lleva aria-valuenow.
    test.fail();
    await abrir(page);
    await page.getByRole('button', { name: 'Iniciar rutina Mañana' }).click();
    await expect(tareaActual(page)).toHaveText('Levantarse');
    await botonHecho(page).click();
    await expect(tareaActual(page)).toHaveText('Ducharse');

    const vivas = page.locator('[class$="_seguirWrapper"]').locator('[aria-live], [role="status"], [role="log"]');
    await expect(vivas.filter({ hasText: 'Ducharse' })).toHaveCount(1);
    await expect(page.getByRole('button', { name: /HECHO/ })).toHaveCount(1);
    const barras = page.getByRole('progressbar');
    for (let i = 0; i < (await barras.count()); i++) {
      await expect(barras.nth(i)).toHaveAttribute('aria-valuenow', /\d/);
    }
  });

  test('HALLAZGO (19/11/2026, ABIERTO) · el selector ofrece 💊 dos veces y el emoji de «Después:» se lee', async ({ page }) => {
    // Hoy: 45 opciones con 💊 en las posiciones 20 y 42 (las dos aria-selected al elegirla), y el
    // lector lee «Después: 🚿 Ducharse» porque ese emoji no lleva aria-hidden.
    test.fail();
    await abrir(page);
    await page.getByRole('button', { name: 'Crear nueva rutina' }).click();
    await page.getByRole('button', { name: /Emoji seleccionado/ }).click();
    await expect(page.getByRole('option', { name: '💊', exact: true })).toHaveCount(1);

    await page.getByRole('button', { name: '← Volver' }).click();
    await page.getByRole('button', { name: 'Iniciar rutina Mañana' }).click();
    await expect(proxima(page)).toContainText('Ducharse');
    expect(await page.locator('[class$="_seguirWrapper"]').ariaSnapshot()).not.toContain('🚿');
  });

  test('HALLAZGO (19/11/2026, ABIERTO) · 🗑️ borra la rutina al instante, sin confirmar ni deshacer', async ({ page }) => {
    // La guía avisa de «Borrar las rutinas guardadas accidentalmente», pero el borrado está en la
    // lista, junto a «Iniciar», y no pide confirmación ni deja deshacer.
    test.fail();
    let dialogo = false;
    page.on('dialog', (d) => {
      dialogo = true;
      void d.dismiss();
    });
    await abrir(page);
    await crearRutina(page, 'Tarde', [['Merendar', 15]]);
    await page.getByRole('button', { name: /Guardar rutina/ }).click();
    await page.getByRole('button', { name: 'Eliminar rutina Tarde' }).click();
    const salvavidas = page.getByRole('button', { name: /deshacer|confirmar|sí, eliminar|eliminar definitivamente/i });
    expect(dialogo || (await salvavidas.count()) > 0).toBe(true);
  });
});

test.describe('Contenido declarado', () => {
  test('HALLAZGO (19/11/2026, ABIERTO) · «¿Cuántas actividades/tareas…?» tiene una respuesta en el JSON-LD y otra en la página', async ({ page }) => {
    // JSON-LD: 4-6 · 6-10 · 10-15 por edad. FAQ visible: 4-6 para TEA o DI y ampliar tras 2-3
    // semanas. Ninguna cita fuente. Reparación: UNA constante que importen las dos (check:faq-unica).
    test.fail();
    await page.goto(RUTA);
    const preguntas = await page.locator('script[type="application/ld+json"]').evaluateAll((ss) =>
      ss
        .map((s) => JSON.parse(s.textContent ?? '{}') as { '@type'?: string; mainEntity?: { name: string; acceptedAnswer: { text: string } }[] })
        .filter((j) => j['@type'] === 'FAQPage')
        .flatMap((j) => j.mainEntity ?? []),
    );
    // El texto de la página sin los <script>: el JSON-LD va dentro del body y se contaría a sí mismo
    const visible = await page.evaluate(() => {
      const copia = document.body.cloneNode(true) as HTMLElement;
      copia.querySelectorAll('script').forEach((s) => s.remove());
      return copia.textContent ?? '';
    });
    for (const q of preguntas.filter((p) => /Cuántas (actividades|tareas)/i.test(p.name))) {
      expect(visible, `la respuesta del JSON-LD a «${q.name}» está en la página`).toContain(q.acceptedAnswer.text);
    }
  });

  test('HALLAZGO (19/11/2026, ABIERTO) · promete «pantalla completa» y una exportación «prevista»', async ({ page }) => {
    // features: «Modo seguimiento en pantalla completa» (la vista conserva logo y pie y no pide
    // pantalla completa). FAQ: «Una función de exportación/importación está prevista».
    test.fail();
    await page.goto(RUTA);
    const caracteristicas = await page.locator('script[type="application/ld+json"]').evaluateAll((ss) =>
      ss.flatMap((s) => ((JSON.parse(s.textContent ?? '{}') as { featureList?: string[] }).featureList ?? [])),
    );
    expect(caracteristicas.join(' · ')).not.toMatch(/pantalla completa/i);
    await expect(page.getByText(/prevista para futuras versiones/)).toHaveCount(0);
  });
});

test.describe('Móvil (Pixel 7)', () => {
  test.use({
    viewport: { width: 412, height: 839 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36',
    deviceScaleFactor: 2.625,
    isMobile: true,
    hasTouch: true,
  });

  test('HALLAZGO (19/11/2026, ABIERTO) · al tocar «Iniciar» la tarea actual queda por encima de la pantalla', async ({ page }) => {
    // Hoy: la vista nueva hereda el desplazamiento de la lista (scrollY ≈ 434) y el nombre de la
    // tarea queda en top ≈ −127 px; solo se ve el botón ¡HECHO!.
    test.fail();
    await abrir(page);
    const iniciar = page.getByRole('button', { name: 'Iniciar rutina Mañana' });
    await iniciar.scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
    await iniciar.tap();
    await expect(tareaActual(page)).toHaveText('Levantarse');
    await expect(tareaActual(page)).toBeInViewport({ ratio: 1 });
  });
});
