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

/*
 * C0630 (06/11/2026) — el caso de arriba mide tras networkidle, sin esperar a la hidratación, y
 * con el equipo cargado puede medir el HTML SERVIDO: creador-thumbnails salió en la suite entera
 * del 04/11 a 835 px (y a 1.310 en 1.280), las cifras exactas de su HTML servido, que pintaba el
 * lienzo a 1.280 px hasta que un efecto medía la columna; aislado pasaba siempre. Se mide aquí el
 * HTML servido a propósito, sin JS: lo que ve un móvil lento hasta que llega el JS, y lo que el
 * caso de arriba solo ve a veces. Medido el 06/11 en las 43 rutas: solo desbordaba esa.
 */
for (const ruta of RUTAS) {
  test(`${ruta} · el HTML servido, sin JS, ya cabe en 390 px (C0630)`, async ({ browser }) => {
    const contexto = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const page = await contexto.newPage();
    await page.goto(ruta);
    const r = await page.evaluate(() => ({
      body: document.body.scrollWidth,
      doc: document.documentElement.scrollWidth,
    }));
    await contexto.close();
    expect(r.body, `body ${r.body} px sin JS`).toBeLessThanOrEqual(390);
    expect(r.doc, `documento ${r.doc} px sin JS`).toBeLessThanOrEqual(390);
  });
}

/*
 * C0565 (03/11/2026) — que la página no desborde NO basta: el desborde horizontal desaparece
 * también encogiendo una columna de texto hasta cero. 2487ae59 (C0425) dejó así la checklist de
 * simulador-bono-joven-alquiler a 0 px (hallazgo 3893, 49 líneas para una pregunta) y este testigo
 * siguió en verde. Se mide además, a 360, 390 y 412 px, que ningún bloque de texto quede más
 * estrecho que su palabra más larga con el texto saliéndose de su caja (un break-all no cuenta), ni
 * por debajo de 60 px con más de 20 caracteres. Fuera: SVG (su caja no limita el texto), elementos
 * en línea (miden lo que mide su texto) y lo que va dentro de una caja que desplaza.
 * Al añadir la regla salieron dos más de la misma receta: estimador-interes-compuesto (el desglose
 * a repeat(3, minmax(0, 1fr)), «+79.086,03 €» en 51 px) y simulador-modelo-osi («Transporte» en
 * 22 px junto a su PDU). El CONTROL de abajo comprueba que el instrumento ve una columna aplastada.
 */
async function columnasAplastadas(page: import('@playwright/test').Page): Promise<string[]> {
  return page.evaluate(() => {
    const fuera: string[] = [];
    const lienzo = document.createElement('canvas').getContext('2d')!;
    for (const el of Array.from(document.body.querySelectorAll<HTMLElement>('*'))) {
      const propio = Array.from(el.childNodes)
        .filter((n) => n.nodeType === Node.TEXT_NODE)
        .map((n) => n.textContent ?? '')
        .join('')
        .replace(/\s+/g, ' ')
        .trim();
      if (propio.length < 4) continue;
      const caja = el.getBoundingClientRect();
      // 1 px o menos: oculto a la vista a propósito (sr-only), no aplastado
      if (caja.width <= 1 || caja.height <= 1) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden') continue;
      if (el instanceof SVGElement || cs.display === 'inline' || cs.display === 'contents') continue;
      let enScroll = false;
      for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
        const o = getComputedStyle(p).overflowX;
        if (o === 'auto' || o === 'scroll') { enScroll = true; break; }
      }
      if (enScroll) continue;
      const palabra = propio.split(' ').reduce((a, b) => (b.length > a.length ? b : a), '');
      lienzo.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      const anchoPalabra = lienzo.measureText(palabra).width;
      const util = caja.width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const estrecho = util + 1 < anchoPalabra && palabra.length >= 4 && el.scrollWidth > el.clientWidth + 1;
      const raquitico = util < 60 && propio.length > 20;
      if (estrecho || raquitico) {
        fuera.push(`${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]} ${Math.round(util)} px «${propio.slice(0, 40)}»`);
      }
    }
    return fuera.slice(0, 6);
  });
}

test('CONTROL C0565 · el instrumento ve una columna de texto aplastada junto a un hermano que no encoge', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/calculadora-mcd-mcm/');
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => {
    const d = document.createElement('div');
    d.style.display = 'flex';
    d.innerHTML =
      '<span style="flex:1;min-width:0">¿Tienes contrato de alquiler firmado a tu nombre?</span>' +
      '<span style="flex:none;width:380px">x</span>';
    (document.querySelector('main') ?? document.body).prepend(d);
  });
  expect(await columnasAplastadas(page)).not.toEqual([]);
});

for (const ruta of RUTAS) {
  test(`${ruta} · a 360, 390 y 412 px ninguna columna de texto queda aplastada (C0565)`, async ({ page }) => {
    for (const ancho of [360, 390, 412]) {
      await page.setViewportSize({ width: ancho, height: 844 });
      await page.goto(ruta);
      await page.waitForLoadState('networkidle');
      expect(await columnasAplastadas(page), `a ${ancho} px`).toEqual([]);
    }
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

// C0553 (01/11/2026): el 451 px de seguimiento-habitos que C0200 no reprodujo salía al ABRIR la
// guía. Sus clases edu-* vivían en el .module.css pero el TSX las ponía como cadena
// (className="edu-table-scroll"): CSS Modules las renombra, así que no llegaba ninguna, y la
// tabla, sin su caja con overflow-x, ensanchaba la página. Las dos apps con la misma plantilla
// tenían el mismo defecto.
for (const ruta of ['/seguimiento-habitos/', '/conversor-binario/', '/codificador-base64/']) {
  test(`${ruta} · a 390 px, con la guía abierta, la tabla desplaza en su caja y la página no desborda (C0553)`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(ruta);
    await page.waitForLoadState('networkidle');
    const guia = page.getByRole('button', { name: /guía/i }).first();
    await expect(async () => {
      await guia.click();
      await expect(guia).toHaveAttribute('aria-expanded', 'true', { timeout: 1000 });
    }).toPass({ timeout: 15000 });
    const tabla = page.locator('table[class*="edu-table"]').first();
    await expect(tabla).toBeVisible();
    await expect(tabla.locator('xpath=..')).toHaveCSS('overflow-x', 'auto');
    const ancho = await page.evaluate(() => document.body.scrollWidth);
    expect(ancho, `guía abierta: body ${ancho} px`).toBeLessThanOrEqual(390);
  });
}

// C0554 (01/11/2026): forma F3 dentro de la guía. Los sr-only de la columna «Recomendado» de la
// tabla comparativa (position: absolute) no tenían ancestro posicionado, escapaban de la caja con
// overflow-x y el DOCUMENTO crecía a 591 px; el body seguía en 390. Solo con la guía abierta.
test('/estimador-fondo-emergencia/ · a 390 px, con la guía abierta, ni el body ni el documento desbordan (C0554)', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/estimador-fondo-emergencia/');
  await page.waitForLoadState('networkidle');
  const guia = page.getByRole('button', { name: /guía|aprender más/i }).first();
  await expect(async () => {
    await guia.click();
    await expect(guia).toHaveAttribute('aria-expanded', 'true', { timeout: 1000 });
  }).toPass({ timeout: 15000 });
  await expect(page.locator('table[class*="comparativaTable"]')).toBeVisible();
  const r = await page.evaluate(() => ({
    body: document.body.scrollWidth,
    doc: document.documentElement.scrollWidth,
  }));
  expect(r.body, `body ${r.body} px`).toBeLessThanOrEqual(390);
  expect(r.doc, `documento ${r.doc} px`).toBeLessThanOrEqual(390);
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
