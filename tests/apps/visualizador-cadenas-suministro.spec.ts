import { test, expect, Page, Locator } from '@playwright/test';
import { esperarHidratacion, sembrarValor, sembrarValorAcotado } from './_hidratacion';

/**
 * Cadenas de Suministro Globales — generado por /inspector el 24/09/2026
 *
 * QUÉ PROMETE LA APP
 *   El <h1> dice «Cadenas de Suministro Globales» y el subtítulo «el viaje de un smartphone,
 *   disrupciones históricas y las nuevas estrategias de relocalización». Es un visualizador
 *   educativo sin cálculo: no pide datos a quien la usa. Tiene tres piezas interactivas:
 *     · 8 componentes del smartphone en un SVG (`<g role="button" aria-pressed>`) que abren un
 *       panel con país, fabricantes, % de coste y dato curioso, y lo cierran al volver a pulsar.
 *     · Un deslizador «Nivel de disrupción» (0–100 %) que cambia el ESTADO de dos tarjetas,
 *       Just-in-Time y Just-in-Case, y las pinta en rojo cuando entran en crisis.
 *     · Una línea de tiempo de 5 disrupciones que se despliega al pulsar.
 *
 * LO QUE TIENE VERDAD COMPROBABLE: LOS UMBRALES DEL DESLIZADOR, RESUELTOS A MANO
 *   Leídos en getJitEstado / getJicEstado / isJitCrisis / isJicCrisis del page.tsx:
 *
 *     nivel      JIT                                        JIC                                          rojo
 *     0–19       Sistema funcionando con normalidad          Stock de seguridad intacto — sin impacto      ninguno
 *     20–49      Tensión inicial — leve escasez de piezas    Buffer absorbe la tensión — producción normal ninguno
 *     50–74      Crisis moderada — paradas de producción     Stocks al 40% — producción sostenida aún      solo JIT
 *     75–100     Colapso total — líneas paradas semanas      Reservas agotadas — impacto significativo     los dos
 *
 *   La idea que enseña la sección es justo esa asimetría: el JIT cae en crisis en 50 y el JIC
 *   aguanta hasta 75. Un umbral corrido (`<=` por `<`) la borraría sin que nada se rompa.
 *
 *   El % del componente sale literal de COMPONENTES (Procesador: «~20–25%»). Las ocho horquillas
 *   suman 86–114 % con punto medio 100 %: coherentes como reparto del coste del dispositivo.
 *
 * LOS DEFECTOS QUE DEJA DOCUMENTADOS (test.fail: se pondrán en verde al repararlos)
 *   · Teclado: ni los 8 componentes (`<g role="button">` sin tabIndex ni onKeyDown) ni los 5
 *     eventos de la línea de tiempo (`<div role="listitem" onClick>`) reciben foco. Medido con
 *     Tab desde el principio de la página: el foco pasa del LegalNotice al deslizador sin tocar
 *     ningún componente, y del deslizador al botón de la guía educativa sin tocar ningún evento.
 *     Todo el contenido de los paneles (fabricantes, coste, lección aprendida) es solo de ratón.
 *   · Contraste del estado en crisis: #dc2626 sobre rgba(220,38,38,.1) da 4,14:1 en claro
 *     (fondo compuesto 252,233,233) y 2,70:1 en oscuro (fondo 63,44,44). Es texto de 14 px en
 *     peso 600, o sea texto pequeño: exige 4,5:1. El bloque [data-theme='dark'] redeclara
 *     .jitEstadoOk pero no .jitEstadoCrisis.
 */

const RUTA = '/visualizador-cadenas-suministro/';
const DESLIZADOR = 'input[type="range"][aria-label="Nivel de disrupción de la cadena de suministro"]';

/** El rótulo de estado de cada tarjeta: el div cuya clase CSS module contiene «jitEstado». */
const estado = (page: Page, tarjeta: 'Just-in-Time (JIT)' | 'Just-in-Case (JIC)'): Locator =>
  page
    .locator('div[class*="jitCard"]')
    .filter({ has: page.getByRole('heading', { name: tarjeta }) })
    .locator('div[class*="jitEstado"]');

const etiqueta = (page: Page): Locator => page.locator('span[class*="sliderValor"]');

/** Comprueba texto y color (clase de crisis) de las dos tarjetas a la vez. */
async function comprobar(
  page: Page,
  nivel: string,
  jit: string,
  jitCrisis: boolean,
  jic: string,
  jicCrisis: boolean,
): Promise<void> {
  await expect(etiqueta(page)).toHaveText(nivel);
  await expect(estado(page, 'Just-in-Time (JIT)')).toHaveText(jit);
  await expect(estado(page, 'Just-in-Case (JIC)')).toHaveText(jic);
  const crisis = /jitEstadoCrisis/;
  if (jitCrisis) await expect(estado(page, 'Just-in-Time (JIT)')).toHaveClass(crisis);
  else await expect(estado(page, 'Just-in-Time (JIT)')).not.toHaveClass(crisis);
  if (jicCrisis) await expect(estado(page, 'Just-in-Case (JIC)')).toHaveClass(crisis);
  else await expect(estado(page, 'Just-in-Case (JIC)')).not.toHaveClass(crisis);
}

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await esperarHidratacion(page, [DESLIZADOR]);
});

// CASO 1 — normal. Deslizador a 60 (tramo 50–74 de la tabla de arriba): el JIT ya está en
// crisis y el JIC todavía no. Y el componente Procesador abre y cierra su panel.
test('caso normal — a 60 % el JIT está en crisis y el JIC aguanta; el procesador abre y cierra su ficha', async ({
  page,
}) => {
  // Estado de arranque (nivel 0): tramo 0–19.
  await comprobar(
    page,
    '0%',
    'Sistema funcionando con normalidad',
    false,
    'Stock de seguridad intacto — sin impacto',
    false,
  );

  await sembrarValor(page, DESLIZADOR, 60);
  await comprobar(
    page,
    '60%',
    'Crisis moderada — paradas de producción',
    true,
    'Stocks al 40% — producción sostenida aún',
    false,
  );

  const procesador = page.getByRole('button', { name: 'Ver detalles de Procesador (SoC)' });
  const panel = page.locator('div[class*="panelDetalle"]');
  await expect(procesador).toHaveAttribute('aria-pressed', 'false');
  await procesador.click();
  await expect(procesador).toHaveAttribute('aria-pressed', 'true');
  await expect(panel.getByRole('heading', { name: 'Procesador (SoC)' })).toBeVisible();
  // Literales de COMPONENTES[1] en page.tsx.
  await expect(panel.locator('span[class*="costeBadge"]')).toHaveText('~20–25%');
  await expect(panel).toContainText('TSMC / Samsung Foundry (fabricación)');

  // Segundo clic: se cierra y vuelve el panel vacío.
  await procesador.click();
  await expect(procesador).toHaveAttribute('aria-pressed', 'false');
  await expect(panel).toContainText('Pulsa cualquier componente del diagrama');
});

// CASO 2 — límites. Cada umbral a un lado y otro (19/20, 49/50, 74/75) y el máximo 100.
// Se recorren en orden creciente desde 0, así que cada siembra MUEVE el valor.
test('caso límite — los umbrales 20, 50 y 75 cambian el estado exactamente donde dice el código', async ({
  page,
}) => {
  const tramos: Array<[number, string, string, boolean, string, boolean]> = [
    [19, '19%', 'Sistema funcionando con normalidad', false, 'Stock de seguridad intacto — sin impacto', false],
    [20, '20%', 'Tensión inicial — leve escasez de piezas', false, 'Buffer absorbe la tensión — producción normal', false],
    [49, '49%', 'Tensión inicial — leve escasez de piezas', false, 'Buffer absorbe la tensión — producción normal', false],
    [50, '50%', 'Crisis moderada — paradas de producción', true, 'Stocks al 40% — producción sostenida aún', false],
    [74, '74%', 'Crisis moderada — paradas de producción', true, 'Stocks al 40% — producción sostenida aún', false],
    [75, '75%', 'Colapso total — líneas paradas semanas', true, 'Reservas agotadas — impacto significativo', true],
    [100, '100%', 'Colapso total — líneas paradas semanas', true, 'Reservas agotadas — impacto significativo', true],
  ];
  for (const [valor, rotulo, jit, jitC, jic, jicC] of tramos) {
    await sembrarValor(page, DESLIZADOR, valor);
    await comprobar(page, rotulo, jit, jitC, jic, jicC);
  }
});

// CASO 3 — fuera de rango. El <input type="range" min=0 max=100> recorta lo que se le escribe:
// 150 → 100 (colapso en las dos) y luego −20 → 0 (vuelta a la normalidad). La app no puede
// quedarse con un «150%» ni un «-20%» en la etiqueta.
test('caso fuera de rango — 150 se recorta a 100 % y −20 a 0 %, con el estado de cada extremo', async ({
  page,
}) => {
  expect(await sembrarValorAcotado(page, DESLIZADOR, 150)).toBe('100');
  await comprobar(
    page,
    '100%',
    'Colapso total — líneas paradas semanas',
    true,
    'Reservas agotadas — impacto significativo',
    true,
  );

  expect(await sembrarValorAcotado(page, DESLIZADOR, -20)).toBe('0');
  await comprobar(
    page,
    '0%',
    'Sistema funcionando con normalidad',
    false,
    'Stock de seguridad intacto — sin impacto',
    false,
  );
});

// DEFECTO (24/09/2026) — teclado. Los componentes y los eventos NO reciben foco con Tab.
// Se recorre con Tab desde el principio y se anotan los focos hasta el botón de la guía
// educativa, que va DESPUÉS del deslizador y de la línea de tiempo en el DOM.
test('DEFECTO teclado — los 8 componentes y los 5 eventos se alcanzan con Tab', async ({ page }) => {
  test.fail(true, 'Hallazgo 24/09/2026: <g role="button"> y <div role="listitem" onClick> sin tabIndex');
  const focos: string[] = [];
  for (let i = 0; i < 120; i++) {
    await page.keyboard.press('Tab');
    const foco = await page.evaluate(() => {
      const a = document.activeElement;
      if (!a) return '';
      if (a.closest('[role="listitem"]')) return 'EVENTO';
      return a.getAttribute('aria-label') ?? a.textContent?.trim().slice(0, 40) ?? '';
    });
    focos.push(foco);
    if (foco === 'Ver guía educativa') break;
  }
  const componentes = focos.filter((f) => f.startsWith('Ver detalles de '));
  const eventos = focos.filter((f) => f === 'EVENTO');
  expect(componentes, `focos recorridos: ${focos.join(' · ')}`).toHaveLength(8);
  expect(eventos).toHaveLength(5);
});

// DEFECTO (24/09/2026) — contraste del estado en crisis, en los dos temas. Medido en navegador:
// 4,14:1 en claro y 2,70:1 en oscuro, frente a 4,5:1 exigible a texto de 14 px peso 600.
test('DEFECTO contraste — el rótulo en crisis se lee a 4,5:1 en claro y en oscuro', async ({ page }) => {
  test.fail(true, 'Hallazgo 24/09/2026: .jitEstadoCrisis #dc2626 da 4,14:1 en claro y 2,70:1 en oscuro');
  await sembrarValor(page, DESLIZADOR, 80);

  const contraste = () =>
    page.evaluate(() => {
      const canal = (c: number) => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
      };
      const lum = (p: number[]) => 0.2126 * canal(p[0]) + 0.7152 * canal(p[1]) + 0.0722 * canal(p[2]);
      const rgba = (s: string): number[] => (s.match(/[\d.]+/g) ?? []).map(Number);
      const el = document.querySelector('div[class*="jitEstadoCrisis"]');
      if (!el) throw new Error('no hay rótulo en crisis');
      // Fondo efectivo: se componen las capas semitransparentes hasta la primera opaca.
      const capas: number[][] = [];
      for (let e: Element | null = el; e; e = e.parentElement) {
        const c = rgba(getComputedStyle(e).backgroundColor);
        const a = c.length === 4 ? c[3] : 1;
        if (c.length && a > 0) capas.push([c[0], c[1], c[2], a]);
        if (c.length && a === 1) break;
      }
      let fondo = [255, 255, 255];
      for (const [r, g, b, a] of capas.reverse()) {
        fondo = [r * a + fondo[0] * (1 - a), g * a + fondo[1] * (1 - a), b * a + fondo[2] * (1 - a)];
      }
      const l1 = lum(rgba(getComputedStyle(el).color).slice(0, 3));
      const l2 = lum(fondo);
      return Math.round(((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)) * 100) / 100;
    });
  // La transición de color devuelve valores intermedios: se lee hasta que dos lecturas coinciden.
  const estable = async (): Promise<number> => {
    let anterior = await contraste();
    for (let i = 0; i < 30; i++) {
      await page.waitForTimeout(100);
      const actual = await contraste();
      if (actual === anterior) return actual;
      anterior = actual;
    }
    return anterior;
  };

  const claro = await estable();
  // El tema se pone con el botón real: el gestor de tema pisa un data-theme puesto a mano.
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.getByRole('button', { name: /Cambiar a modo oscuro/i }).first().click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  const oscuro = await estable();

  expect(claro, 'rótulo en crisis, tema claro (hoy 4,14:1)').toBeGreaterThanOrEqual(4.5);
  expect(oscuro, 'rótulo en crisis, tema oscuro (hoy 2,70:1)').toBeGreaterThanOrEqual(4.5);
});
