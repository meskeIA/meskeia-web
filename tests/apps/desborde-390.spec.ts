/**
 * Cabos C0200 y C0201 (turno de noche a11y del 09/10/2026) — a 390 px de ancho la página no
 * puede ser más ancha que la pantalla. `documentElement.scrollWidth` NO lo delata (html y body
 * llevan overflow-x: hidden y recortan): se mide `body.scrollWidth`, como en C0154. Se mira
 * también el del documento: una etiqueta oculta con position: absolute y sin ancestro
 * posicionado escapa del recorte de su tabla y lo ensancha a él (forma F3 de la Ronda).
 *
 * Las demás rutas, de la primera pasada del detector de desborde de la Ronda (24/10/2026,
 * cabos C0391-C0434), reparadas en /reparar el 24/10: casi todas por una pista `1fr` que crece
 * hasta su contenido más ancho (receta: `minmax(0, 1fr)`).
 */
import { test, expect } from '@playwright/test';

const RUTAS = [
  '/seguimiento-habitos/',
  '/calculadora-matematica/',
  '/estimador-tir-van/', // C0391
  '/estimador-interes-compuesto/', // C0392
  '/comparador-vehiculos/', // C0394
  '/calculadora-gasto-energetico/', // C0395
  '/calculadora-mcd-mcm/', // C0396
  '/calculadora-trigonometria/', // C0397
  '/generador-qr/', // C0398
  '/validador-regex/', // C0402
  '/calculadora-aspectos/', // C0403
  '/generador-gradientes/', // C0404
  '/generador-tipografias/', // C0405
  '/generador-og-images/', // C0407
  '/orientador-tarifa-freelance/', // C0408
  '/conversor-unidades-rf/', // C0410
  '/calculadora-subredes/', // C0412
  '/visualizador-iluminacion-phong/', // C0414
  '/arbol-decision-ia/', // C0426
  '/calculadora-regla-500-npf-astrofoto/', // C0430
  '/calculadora-fov-video/', // C0431
  '/calculadora-porcentaje-panadero/', // C0432
  '/presupuesto-viaje/', // C0399
  '/conversor-numeros-romanos/', // C0400
  '/orientador-aval-ico/', // C0424: un flex-shrink: 0 pensado para el emoji alcanzaba al texto
  // Reparadas en /reparar el 25/10/2026
  '/creador-thumbnails/', // C0406: la escala del lienzo salía de innerWidth - 400, negativa en móvil
  '/estimador-roi-marketing/', // C0409
  '/creador-flashcards/', // C0411
  '/simulador-equilibrio-quimico/', // C0413
  // C0416-C0421: el mismo .speedControl sin salto de línea en seis simuladores
  '/simulador-arboles-bst-avl/',
  '/simulador-arboles-b/',
  '/simulador-concurrencia/',
  '/simulador-modelo-osi/',
  '/simulador-backtracking/',
  '/simulador-programacion-dinamica/',
  '/simulador-disoluciones/', // C0422
  '/simulador-bono-joven-alquiler/', // C0425
  '/visualizador-tipos-cliente-freelance/', // C0427: punto en el extremo de un espectro
  '/visualizador-ciclo-economico/', // C0428
  // F3: etiqueta oculta con position: absolute y sin ancestro posicionado; body sigue en 390 y
  // es el documento el que crece, por eso el test mide los dos
  '/simulador-automata-pila/', // C0415
  '/escalador-recetas/', // C0433
  '/escandallo-food-cost/', // C0434
];

for (const ruta of RUTAS) {
  test(`${ruta} · a 390 px nada fuerza un ancho mayor que la pantalla`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(ruta);
    await page.waitForLoadState('networkidle');
    const r = await page.evaluate(() => {
      const ancho = document.documentElement.clientWidth;
      // Los culpables: elementos cuyo borde derecho pasa del ancho y que no están dentro de
      // una caja que desplace por su cuenta (esa sí es legítima).
      const culpables = Array.from(document.body.querySelectorAll('*'))
        .filter((el) => {
          const caja = el.getBoundingClientRect();
          if (caja.right <= ancho + 1 || caja.width === 0) return false;
          for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
            const o = getComputedStyle(p).overflowX;
            if (o === 'auto' || o === 'scroll' || o === 'hidden' || o === 'clip') return false;
          }
          return true;
        })
        .slice(0, 6)
        .map((el) => `${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]} → ${Math.round(el.getBoundingClientRect().right)}`);
      return { body: document.body.scrollWidth, doc: document.documentElement.scrollWidth, ancho, culpables };
    });
    expect(r.body, `body ${r.body} px en ${r.ancho}: ${r.culpables.join(' · ')}`).toBeLessThanOrEqual(r.ancho);
    expect(r.doc, `documento ${r.doc} px en ${r.ancho}`).toBeLessThanOrEqual(r.ancho);
  });
}

// C0429, C0409 y C0406: el desborde solo salía al estrechar la ventana desde escritorio (la
// secuencia de la Ronda), porque un lienzo conservaba su ancho de 1280 px y mantenía ancha su
// pista `1fr`. creador-thumbnails desbordaba además en escritorio (C0358: 1452 px a 1280).
for (const ruta of ['/visualizador-melatonina/', '/estimador-roi-marketing/', '/creador-thumbnails/']) {
  test(`${ruta} · de 1280 a 390 px la página acaba en el ancho de la pantalla`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(ruta);
    await page.waitForLoadState('networkidle');
    const enEscritorio = await page.evaluate(() => document.body.scrollWidth);
    expect(enEscritorio, `a 1280 px: body ${enEscritorio}`).toBeLessThanOrEqual(1280);
    for (const ancho of [1024, 800, 390]) {
      await page.setViewportSize({ width: ancho, height: 900 });
      await page.waitForTimeout(150);
    }
    // Chart.js redimensiona tras un rebote: se espera a que el ancho se asiente
    await expect
      .poll(() => page.evaluate(() => document.body.scrollWidth), { timeout: 5000 })
      .toBeLessThanOrEqual(390);
  });
}

// C0393 y C0423: con cinco pistas de 80 px en 226, las últimas opciones quedaban fuera de la
// pantalla y no se podían pulsar. Cada opción tiene que verse entera, contestar al toque y
// conservar su frecuencia en el nombre accesible aunque a la vista solo quede el número.
for (const [ruta, ultima] of [
  ['/test-zarit-cuidador/', /^5 Casi siempre$/],
  ['/test-burnout-laboral/', /^4 Siempre$/],
] as const) {
  test(`${ruta} · a 390 px las cinco opciones se ven enteras y la última se puede contestar`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(ruta);
    await page.waitForLoadState('networkidle');
    const opciones = page.locator('[class*="opcionBtn"]');
    await expect(opciones).toHaveCount(5);
    for (let i = 0; i < 5; i++) {
      const caja = await opciones.nth(i).boundingBox();
      expect(caja, `opción ${i + 1}`).not.toBeNull();
      expect(caja!.x, `opción ${i + 1}: borde izquierdo`).toBeGreaterThanOrEqual(0);
      expect(caja!.x + caja!.width, `opción ${i + 1}: borde derecho`).toBeLessThanOrEqual(390);
      expect(caja!.width, `opción ${i + 1}: ancho mínimo de diana`).toBeGreaterThanOrEqual(24);
    }
    const ultimaBtn = page.getByRole('button', { name: ultima });
    await expect(async () => {
      await ultimaBtn.click();
      await expect(ultimaBtn).toHaveAttribute('aria-pressed', 'true', { timeout: 1000 });
    }).toPass({ timeout: 15000 });
  });
}

test('/seguimiento-habitos/ · a 390 px, con un hábito, ninguna de las tres vistas desborda (C0200)', async ({
  page,
}) => {
  // El turno de noche midió 451 px; en carga limpia (sin hábitos) no se reproduce, así que se
  // siembra uno ANTES de que la página cargue (addInitScript: sin carrera con la hidratación).
  await page.addInitScript(() => {
    const hoy = new Date().toISOString().split('T')[0];
    localStorage.setItem(
      'meskeia_habitos_v2',
      JSON.stringify({
        version: '2.0',
        habitos: [
          {
            id: 'h1',
            nombre: 'Ejercicio diario con estiramientos',
            icono: '💪',
            color: '#2E86AB',
            categoria: 'salud',
            frecuencia: 'diario',
            objetivo: 30,
            tipo: 'construir',
            registros: { [hoy]: { completado: true } },
            fechaCreacion: hoy,
          },
        ],
      }),
    );
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/seguimiento-habitos/');
  await page.waitForLoadState('networkidle');
  for (const vista of ['Mis Hábitos', 'Calendario', 'Estadísticas']) {
    const boton = page.getByRole('button', { name: vista, exact: true });
    await expect(async () => {
      await boton.click();
      await expect(boton).toHaveAttribute('aria-pressed', 'true', { timeout: 1000 });
    }).toPass({ timeout: 15000 });
    const r = await page.evaluate(() => {
      const culpables = Array.from(document.body.querySelectorAll('*'))
        .filter((el) => el.getBoundingClientRect().right > 391)
        .slice(-4)
        .map((el) => `${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]} → ${Math.round(el.getBoundingClientRect().right)}`);
      return { ancho: document.body.scrollWidth, culpables };
    });
    expect(r.ancho, `${vista}: body ${r.ancho} px · ${r.culpables.join(' · ')}`).toBeLessThanOrEqual(390);
  }
  // Y el modal de hábito nuevo, con sus rejillas de iconos, colores y categorías
  await page.getByRole('button', { name: 'Mis Hábitos', exact: true }).click();
  await page.getByRole('button', { name: /Nuevo Hábito/ }).click();
  await expect(page.getByRole('heading', { name: 'Nuevo Hábito' })).toBeVisible();
  const conModal = await page.evaluate(() => document.body.scrollWidth);
  expect(conModal, `modal: body ${conModal} px`).toBeLessThanOrEqual(390);
});

test('/calculadora-matematica/ · a 390 px ninguno de los cinco tipos desborda (C0201)', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/calculadora-matematica/');
  await page.waitForLoadState('networkidle');
  for (const tipo of ['Matrices 2×2', 'Fracciones', 'Potencias', 'Raíces', 'Logaritmos']) {
    const boton = page.locator('[class*="tipoBtn"]').filter({ hasText: tipo });
    await expect(async () => {
      await boton.click();
      await expect(boton).toHaveClass(/tipoActivo/, { timeout: 1000 });
    }).toPass({ timeout: 15000 });
    const ancho = await page.evaluate(() => document.body.scrollWidth);
    expect(ancho, `${tipo}: body ${ancho} px`).toBeLessThanOrEqual(390);
  }
});
