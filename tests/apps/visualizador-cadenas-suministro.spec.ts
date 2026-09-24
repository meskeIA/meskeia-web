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
 * LOS DEFECTOS QUE DEJÓ DOCUMENTADOS (reparados el 24/09/2026; los test.fail pasan a regresión)
 *   · Teclado: ni los 8 componentes (`<g role="button">` sin tabIndex ni onKeyDown) ni los 5
 *     eventos de la línea de tiempo (`<div role="listitem" onClick>`) reciben foco. Medido con
 *     Tab desde el principio de la página: el foco pasa del LegalNotice al deslizador sin tocar
 *     ningún componente, y del deslizador al botón de la guía educativa sin tocar ningún evento.
 *     Todo el contenido de los paneles (fabricantes, coste, lección aprendida) es solo de ratón.
 *   · Contraste del estado en crisis: #dc2626 sobre rgba(220,38,38,.1) da 4,14:1 en claro
 *     (fondo compuesto 252,233,233) y 2,70:1 en oscuro (fondo 63,44,44). Es texto de 14 px en
 *     peso 600, o sea texto pequeño: exige 4,5:1. El bloque [data-theme='dark'] redeclara
 *     .jitEstadoOk pero no .jitEstadoCrisis.
 *   · Datos (hallazgos 1351-1354), cotejados con su fuente el 24/09/2026:
 *       – Trazabilidad Walmart/IBM: la prueba de 2,2 s (antes casi 7 días) fue con MANGOS
 *         cortados, 2016-2017 (Frank Yiannas, Walmart). Las lechugas son el brote de E. coli de
 *         2018 que llevó a exigir la red a los proveedores de hoja verde (carta del 24/09/2018).
 *       – 2.º trimestre de 2020: la OMC (nota de prensa 862, 06/10/2020) da −14,3 % en volumen
 *         RESPECTO AL TRIMESTRE ANTERIOR, no un −30 %.
 *       – Kioxia: no hubo inundación en 2020; fue la contaminación de materiales en Yokkaichi y
 *         Kitakami, febrero de 2022, ≥ 6,5 exabytes (Western Digital, 2022).
 *       – Dólares: formato español («210.000 millones de $»), nunca «$210.000M».
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
    '0\u00A0%',
    'Sistema funcionando con normalidad',
    false,
    'Stock de seguridad intacto — sin impacto',
    false,
  );

  await sembrarValor(page, DESLIZADOR, 60);
  await comprobar(
    page,
    '60\u00A0%',
    'Crisis moderada — paradas de producción',
    true,
    'Stocks al 40\u00A0% — producción sostenida aún',
    false,
  );

  const procesador = page.getByRole('button', { name: 'Ver detalles de Procesador (SoC)' });
  const panel = page.locator('div[class*="panelDetalle"]');
  await expect(procesador).toHaveAttribute('aria-pressed', 'false');
  await procesador.click();
  await expect(procesador).toHaveAttribute('aria-pressed', 'true');
  await expect(panel.getByRole('heading', { name: 'Procesador (SoC)' })).toBeVisible();
  // Literales de COMPONENTES[1] en page.tsx.
  await expect(panel.locator('span[class*="costeBadge"]')).toHaveText('~20–25\u00A0%');
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
    [19, '19\u00A0%', 'Sistema funcionando con normalidad', false, 'Stock de seguridad intacto — sin impacto', false],
    [20, '20\u00A0%', 'Tensión inicial — leve escasez de piezas', false, 'Buffer absorbe la tensión — producción normal', false],
    [49, '49\u00A0%', 'Tensión inicial — leve escasez de piezas', false, 'Buffer absorbe la tensión — producción normal', false],
    [50, '50\u00A0%', 'Crisis moderada — paradas de producción', true, 'Stocks al 40\u00A0% — producción sostenida aún', false],
    [74, '74\u00A0%', 'Crisis moderada — paradas de producción', true, 'Stocks al 40\u00A0% — producción sostenida aún', false],
    [75, '75\u00A0%', 'Colapso total — líneas paradas semanas', true, 'Reservas agotadas — impacto significativo', true],
    [100, '100\u00A0%', 'Colapso total — líneas paradas semanas', true, 'Reservas agotadas — impacto significativo', true],
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
    '100\u00A0%',
    'Colapso total — líneas paradas semanas',
    true,
    'Reservas agotadas — impacto significativo',
    true,
  );

  expect(await sembrarValorAcotado(page, DESLIZADOR, -20)).toBe('0');
  await comprobar(
    page,
    '0\u00A0%',
    'Sistema funcionando con normalidad',
    false,
    'Stock de seguridad intacto — sin impacto',
    false,
  );
});

// DEFECTO (24/09/2026) — teclado. Los componentes y los eventos NO reciben foco con Tab.
// Se recorre con Tab desde el principio y se anotan los focos hasta el botón de la guía
// educativa, que va DESPUÉS del deslizador y de la línea de tiempo en el DOM.
test('teclado — los 8 componentes y los 5 eventos se alcanzan con Tab', async ({ page }) => {
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

  // Y se accionan con teclado: Enter abre la ficha del componente, Espacio despliega el evento.
  const procesador = page.getByRole('button', { name: 'Ver detalles de Procesador (SoC)' });
  await procesador.focus();
  await page.keyboard.press('Enter');
  await expect(procesador).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('div[class*="panelDetalle"]').getByRole('heading', { name: 'Procesador (SoC)' })).toBeVisible();

  const suez = page.getByRole('button', { name: 'Bloqueo del Canal de Suez (Ever Given)' });
  await expect(suez).toHaveAttribute('aria-expanded', 'false');
  await suez.focus();
  await page.keyboard.press(' ');
  await expect(suez).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByText('Lección aprendida:')).toBeVisible();
});

// DEFECTO (24/09/2026) — contraste del estado en crisis, en los dos temas. Medido en navegador:
// 4,14:1 en claro y 2,70:1 en oscuro, frente a 4,5:1 exigible a texto de 14 px peso 600.
test('contraste — el rótulo en crisis se lee a 4,5:1 en claro y en oscuro', async ({ page }) => {
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

  expect(claro, 'rótulo en crisis, tema claro (antes 4,14:1)').toBeGreaterThanOrEqual(4.5);
  expect(oscuro, 'rótulo en crisis, tema oscuro (antes 2,70:1)').toBeGreaterThanOrEqual(4.5);
});

// DATOS (hallazgos 1351-1354) — regresión de los cuatro textos corregidos. Las fuentes están en
// la cabecera; aquí se comprueba que la página dice lo que dicen ellas y no lo de antes.
test('datos — mangos de Walmart, −14,3 % de la OMC, contaminación de Kioxia 2022 y dólares en formato español', async ({
  page,
}) => {
  // 1351 — la guía educativa está en el DOM aunque nazca plegada.
  const guia = await page.locator('main, body').first().textContent();
  expect(guia).toContain('mangos cortados');
  expect(guia).toContain('2,2 segundos');
  expect(guia).not.toMatch(/rastrear lechugas/);

  // 1352 — evento COVID desplegado.
  const covid = page.getByRole('button', { name: 'COVID-19: cierre de fábricas en Asia' });
  await covid.click();
  await expect(covid).toHaveAttribute('aria-expanded', 'true');
  const panelCovid = page.locator('[role="listitem"]').filter({ has: covid });
  await expect(panelCovid).toContainText('−14,3\u00A0%');
  await expect(panelCovid).toContainText('respecto al trimestre anterior');
  await expect(panelCovid).toContainText('OMC');
  await expect(panelCovid).not.toContainText('30%');

  // 1353 — ficha de la memoria NAND.
  await page.getByRole('button', { name: 'Ver detalles de Memoria flash (NAND)' }).click();
  const panel = page.locator('div[class*="panelDetalle"]');
  await expect(panel).toContainText('febrero de 2022');
  await expect(panel).toContainText('Yokkaichi y Kitakami');
  await expect(panel).not.toContainText('inundación');

  // 1354 — ninguna cifra con el $ delante ni con la «M» anglosajona pegada. Se despliega la
  // crisis de semiconductores, que es el caso del acta.
  const chips = page.getByRole('button', { name: 'Crisis global de semiconductores' });
  await chips.click();
  const semis = page.locator('[role="listitem"]').filter({ has: chips });
  await expect(semis).toContainText('210.000 millones de $');
  // Texto de la página SIN los <script> de Next (su payload RSC lleva referencias «$7»).
  const texto = await page.evaluate(() => {
    const copia = document.body.cloneNode(true) as HTMLElement;
    copia.querySelectorAll('script, style').forEach((n) => n.remove());
    return copia.textContent ?? '';
  });
  expect(texto.match(/\$\s?\d/g) ?? [], 'símbolo $ delante de una cifra').toEqual([]);
  expect(texto.match(/\d+M\b/g) ?? [], 'abreviatura «M» anglosajona').toEqual([]);
});

// SOSPECHA del Inspector (24/09/2026) — cifras populares sin fuente y «N%» pegados.
// Entrada: abrir las fichas del procesador y del ensamblaje y desplegar Tailandia.
// Esperado, cotejado con la fuente el 24/09/2026:
//   · 92 % de la capacidad por debajo de 10 nm en Taiwán — SIA y BCG, abril de 2021.
//   · ~12 % del comercio mundial por Suez — MFAT de Nueva Zelanda, abril de 2021.
//   · Tailandia: ~40 % de los discos duros (IHS iSuppli, 2011), NO 45 %; y no «se triplicó».
//   · Zhengzhou: 350.000 personas EN LOS PICOS — The New York Times, diciembre de 2016.
//   · McKinsey: 81 % y 44 % son de una encuesta de 2022 a 113 responsables; el 16-26 % del MGI
//     (2020) es lo que «está en juego» en cinco años, no «el 26 % en la próxima década».
//   · Ningún texto propio con la cifra pegada al signo.
test('sospecha — cada cifra con su fuente y año, y ningún «N%» pegado', async ({ page }) => {
  const panel = page.locator('div[class*="panelDetalle"]');
  await page.getByRole('button', { name: 'Ver detalles de Procesador (SoC)' }).click();
  await expect(panel).toContainText('92 % de la capacidad mundial');
  await expect(panel).toContainText('Semiconductor Industry Association y el Boston Consulting Group (abril de 2021)');

  await page.getByRole('button', { name: 'Ver detalles de Ensamblaje final' }).click();
  await expect(panel).toContainText('350.000 personas');
  await expect(panel).toContainText('The New York Times, diciembre de 2016');

  const suez = page.locator('[role="listitem"]').filter({ hasText: 'Ever Given' });
  await expect(suez).toContainText('12 % del comercio mundial');
  await expect(suez).toContainText('Nueva Zelanda, abril de 2021');

  const tailandia = page.getByRole('button', { name: 'Inundaciones en Tailandia' });
  await tailandia.click();
  const panelTailandia = page.locator('[role="listitem"]').filter({ has: tailandia });
  await expect(panelTailandia).toContainText('40 % de los discos duros del mundo (IHS iSuppli, 2011)');
  await expect(panelTailandia).not.toContainText('45');
  await expect(panelTailandia).not.toContainText('triplicó');

  const tendencia = page.locator('div[class*="tendencia"]');
  await expect(tendencia).toContainText('113 responsables');
  await expect(tendencia).toContainText('no una previsión');
  await expect(tendencia).not.toContainText('próxima década');

  const texto = await page.evaluate(() => {
    const copia = document.body.cloneNode(true) as HTMLElement;
    copia
      .querySelectorAll('script, style, svg, section[aria-label="Aplicaciones relacionadas"]')
      .forEach((n) => n.remove());
    return copia.textContent ?? '';
  });
  expect(texto.match(/\d%/g) ?? [], 'porcentaje pegado a la cifra').toEqual([]);
});

// SOSPECHA del Inspector (24/09/2026) — el fondo del SVG era #E8F4F8→#D0EAF2 escrito en el
// propio SVG: en oscuro quedaba una isla clara dentro de la tarjeta oscura. Medido antes de
// reparar: stop-color rgb(232,244,248) en los dos temas. Esperado: el fondo cambia con el tema
// y el título del diagrama y el blanco de las tarjetas se leen a 4,5:1 en los dos.
test('sospecha — el diagrama tiene variante oscura y sus textos se leen en los dos temas', async ({ page }) => {
  const medir = () =>
    page.evaluate(() => {
      const canal = (c: number) => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
      };
      const rgb = (s: string): number[] => (s.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
      const lum = (p: number[]) => 0.2126 * canal(p[0]) + 0.7152 * canal(p[1]) + 0.0722 * canal(p[2]);
      const ratio = (a: number[], b: number[]) => {
        const [l1, l2] = [lum(a), lum(b)];
        return Math.round(((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)) * 100) / 100;
      };
      const svg = document.querySelector('svg[role="group"]');
      if (!svg) throw new Error('sin diagrama');
      const paradas = (id: string) =>
        [...svg.querySelectorAll(`#${id} stop`)].map((s) => rgb(getComputedStyle(s).stopColor));
      const fondo = paradas('gradFondo');
      const tarjeta = paradas('gradComp');
      const titulo = rgb(getComputedStyle(svg.querySelector('text') as Element).fill);
      const blanco = [255, 255, 255];
      return {
        fondo: fondo.map((c) => c.join(',')),
        titulo: Math.min(...fondo.map((c) => ratio(titulo, c))),
        tarjetas: Math.min(...tarjeta.map((c) => ratio(blanco, c))),
      };
    });

  const claro = await medir();
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.getByRole('button', { name: /Cambiar a modo oscuro/i }).first().click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  const oscuro = await medir();

  expect(oscuro.fondo[0], 'el fondo del SVG no cambia con el tema').not.toBe(claro.fondo[0]);
  expect(oscuro.fondo[0]).not.toBe('232,244,248');
  for (const [tema, m] of [['claro', claro], ['oscuro', oscuro]] as const) {
    expect(m.titulo, `título del diagrama, tema ${tema}`).toBeGreaterThanOrEqual(4.5);
    expect(m.tarjetas, `blanco sobre las tarjetas, tema ${tema}`).toBeGreaterThanOrEqual(4.5);
  }
});

// ─────────────────────────────────────────────────────────────────────────────────────────────
// RE-INSPECCIÓN del 24/09/2026 (tarde), tras 95060386 y 0d54c8f9.
//
// Lo que ya cubrían los tests de arriba y NO se duplica: los 8 + 5 focos con Tab, Enter en el
// procesador, Espacio en Suez, el contraste del rótulo en crisis (re-medido: 5,54:1 en claro
// sobre 251,5/233,3/233,3 y 6,64:1 en oscuro sobre 71,3/44/44) y los textos de 1351-1354.
//
// Lo que se añade:
//   · Teclado a fondo: Espacio en un componente, exclusividad (un solo componente pulsado) y
//     que aria-pressed coincida con lo que se PINTA (fill url(#gradCompActivo)); foco visible
//     en claro y en oscuro; las 5 crisis una a una con Enter, cada una con su detalle.
//   · Qué debe cambiar al activar una crisis, según el modelo de datos de page.tsx: SOLO
//     `disrupcionActiva`. El diagrama (componenteActivo) y el deslizador no se tocan, y abrir
//     una crisis pliega la anterior.
//   · Hallazgos abiertos (test.fail): badge de coste y franja «~40 países» con blanco sobre la
//     marca, color de marca como texto en claro, rótulos del SVG ilegibles en móvil, y cinco
//     datos que sus fuentes desmienten.
// ─────────────────────────────────────────────────────────────────────────────────────────────

/**
 * Contraste mínimo de un texto contra su fondo compuesto real: se apilan las capas
 * semitransparentes hasta la primera opaca y, si una capa es un degradado, se mide contra cada
 * uno de sus extremos (el peor manda). Colores computados, nunca leídos del CSS con regex.
 */
async function contrasteMinimo(page: Page, selector: string): Promise<number> {
  return page.evaluate((sel) => {
    const canal = (c: number) => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    const lum = (p: number[]) => 0.2126 * canal(p[0]) + 0.7152 * canal(p[1]) + 0.0722 * canal(p[2]);
    const ratio = (a: number[], b: number[]) => {
      const [l1, l2] = [lum(a), lum(b)];
      return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    };
    const nums = (s: string): number[] => (s.match(/[\d.]+/g) ?? []).map(Number);
    const colores = (s: string): number[][] => [...s.matchAll(/rgba?\([^)]*\)/g)].map((m) => nums(m[0]));
    const el = document.querySelector(sel);
    if (!el) throw new Error(`no existe ${sel}`);
    type Capa = { grad: number[][] } | { color: number[] };
    const capas: Capa[] = [];
    for (let e: Element | null = el; e; e = e.parentElement) {
      const cs = getComputedStyle(e);
      const grad = cs.backgroundImage !== 'none' ? colores(cs.backgroundImage) : [];
      const c = nums(cs.backgroundColor);
      const a = c.length === 4 ? c[3] : 1;
      if (grad.length) {
        capas.push({ grad });
        if (grad.every((g) => (g.length === 4 ? g[3] : 1) === 1)) break;
      } else if (c.length && a > 0) {
        capas.push({ color: [c[0], c[1], c[2], a] });
        if (a === 1) break;
      }
    }
    const sobre = (base: number[], [r, g, b, a = 1]: number[]) => [
      r * a + base[0] * (1 - a),
      g * a + base[1] * (1 - a),
      b * a + base[2] * (1 - a),
    ];
    let bases: number[][] = [[255, 255, 255]];
    for (const capa of capas.reverse()) {
      bases = 'grad' in capa ? capa.grad.flatMap((g) => bases.map((b) => sobre(b, g))) : bases.map((b) => sobre(b, capa.color));
    }
    const texto = nums(getComputedStyle(el).color).slice(0, 3);
    return Math.round(Math.min(...bases.map((b) => ratio(texto, b))) * 100) / 100;
  }, selector);
}

async function ponerOscuro(page: Page): Promise<void> {
  // El gestor de tema pisa un data-theme puesto a mano: se usa el conmutador real.
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.getByRole('button', { name: /Cambiar a modo oscuro/i }).first().click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.waitForTimeout(400); // transiciones de 0,3 s en los rótulos
}

/** Pulsa Tab hasta que el foco caiga en el elemento con ese aria-label. */
async function tabularHasta(page: Page, etiquetaAria: string): Promise<void> {
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press('Tab');
    const foco = await page.evaluate(() => document.activeElement?.getAttribute('aria-label') ?? '');
    if (foco === etiquetaAria) return;
  }
  throw new Error(`Tab no llegó a «${etiquetaAria}»`);
}

test.describe('Inspección 24/09/2026 — re-inspección tras 95060386 y 0d54c8f9', () => {
  const componente = (page: Page, nombre: string): Locator =>
    page.getByRole('button', { name: `Ver detalles de ${nombre}` });
  const panel = (page: Page): Locator => page.locator('div[class*="panelDetalle"]');

  /** [pulsado, pintado activo] de cada uno de los 8 componentes, en orden. */
  const estadoDiagrama = (page: Page) =>
    page.evaluate(() =>
      [...document.querySelectorAll('g[role="button"]')].map((g) => ({
        pulsado: g.getAttribute('aria-pressed') === 'true',
        pintadoActivo: g.querySelector('rect')?.getAttribute('fill') === 'url(#gradCompActivo)',
      })),
    );

  // CASO 1 (1349, teclado del diagrama). Esperado resuelto a mano con COMPONENTES y el CSS:
  //   Espacio en «Batería de litio» → solo la batería pulsada y pintada activa, badge «~10–15 %»,
  //   la página no se desplaza; Enter en «Módulo de cámaras» → pasa el testigo (batería false),
  //   badge «~10–12 %»; Enter otra vez → ninguno pulsado y panel vacío. Foco visible: el rect
  //   lleva stroke --text-primary a 3 px (claro rgb(26, 26, 26), oscuro rgb(232, 232, 232)).
  test('teclado — Espacio y Enter en el diagrama: un solo componente pulsado y pintado, con foco visible en los dos temas', async ({
    page,
  }) => {
    await tabularHasta(page, 'Ver detalles de Batería de litio');
    const rectBateria = componente(page, 'Batería de litio').locator('rect');
    await expect(rectBateria).toHaveCSS('stroke', 'rgb(26, 26, 26)');
    await expect(rectBateria).toHaveCSS('stroke-width', '3px');
    await expect(componente(page, 'Pantalla OLED').locator('rect')).toHaveCSS('stroke', 'none');

    const scrollAntes = await page.evaluate(() => window.scrollY);
    await page.keyboard.press(' ');
    expect(await page.evaluate(() => window.scrollY), 'Espacio no debe desplazar la página').toBe(scrollAntes);
    await expect(componente(page, 'Batería de litio')).toHaveAttribute('aria-pressed', 'true');
    await expect(panel(page).getByRole('heading', { name: 'Batería de litio' })).toBeVisible();
    await expect(panel(page).locator('span[class*="costeBadge"]')).toHaveText('~10–15 %');
    let estado = await estadoDiagrama(page);
    expect(estado.map((e) => e.pulsado)).toEqual([false, false, true, false, false, false, false, false]);
    for (const e of estado) expect(e.pintadoActivo, 'aria-pressed y el relleno activo deben coincidir').toBe(e.pulsado);

    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await expect(componente(page, 'Módulo de cámaras')).toHaveAttribute('aria-pressed', 'true');
    await expect(componente(page, 'Batería de litio')).toHaveAttribute('aria-pressed', 'false');
    await expect(panel(page).locator('span[class*="costeBadge"]')).toHaveText('~10–12 %');
    estado = await estadoDiagrama(page);
    expect(estado.map((e) => e.pulsado)).toEqual([false, false, false, true, false, false, false, false]);
    for (const e of estado) expect(e.pintadoActivo).toBe(e.pulsado);

    await page.keyboard.press('Enter');
    estado = await estadoDiagrama(page);
    expect(estado.every((e) => !e.pulsado && !e.pintadoActivo)).toBe(true);
    await expect(panel(page)).toContainText('Pulsa cualquier componente del diagrama');

    // Oscuro: foco de teclado (Shift+Tab desde el deslizador cae en el último componente).
    await ponerOscuro(page);
    await page.locator(DESLIZADOR).focus();
    await page.keyboard.press('Shift+Tab');
    const rectEnsamblaje = componente(page, 'Ensamblaje final').locator('rect');
    await expect(rectEnsamblaje).toHaveCSS('stroke', 'rgb(232, 232, 232)');
    await expect(rectEnsamblaje).toHaveCSS('stroke-width', '3px');
  });

  // CASO 2 (1349, las 5 crisis). Esperado del array DISRUPCIONES de page.tsx: con Enter, cada
  // crisis se despliega sola (la anterior se pliega), su aria-controls apunta a un id que existe
  // y muestra su duración literal. Activar una crisis NO toca el diagrama ni el deslizador: la
  // memoria NAND sigue pulsada y el nivel sigue en «0 %». Un clic en el resumen (no en el
  // título) también despliega, por el ::after del botón.
  test('crisis — las 5 se abren con Enter de una en una, sin tocar el diagrama ni el deslizador', async ({ page }) => {
    const duraciones = [
      '~2,5 años',
      '6 días',
      '~3–4 meses (cierre masivo)',
      '~4 meses',
      '~6 meses para recuperación parcial',
    ];
    await componente(page, 'Memoria flash (NAND)').click();
    const botones = page.locator('[role="listitem"] button');
    await expect(botones).toHaveCount(5);

    for (let i = 0; i < 5; i++) {
      await botones.nth(i).focus();
      await page.keyboard.press('Enter');
      const expandidos = await botones.evaluateAll((bs) => bs.map((b) => b.getAttribute('aria-expanded')));
      expect(expandidos, `solo la crisis ${i} desplegada`).toEqual(
        Array.from({ length: 5 }, (_, j) => (j === i ? 'true' : 'false')),
      );
      const idDetalle = await botones.nth(i).getAttribute('aria-controls');
      expect(idDetalle).toBe(`disrupcion-detalle-${i}`);
      const detalle = page.locator(`#${idDetalle}`);
      await expect(detalle.locator('span[class*="timelineStatNum"]').first()).toHaveText(duraciones[i]);
      await expect(detalle).toContainText('Lección aprendida:');
      await expect(page.locator('div[class*="timelineDetalle"]')).toHaveCount(1);
      await expect(componente(page, 'Memoria flash (NAND)')).toHaveAttribute('aria-pressed', 'true');
      await expect(etiqueta(page)).toHaveText('0 %');
    }

    // Espacio pliega la última.
    await page.keyboard.press(' ');
    await expect(botones.nth(4)).toHaveAttribute('aria-expanded', 'false');

    // Clic en el resumen de Suez, en coordenadas: el ::after del botón cubre la tarjeta.
    const resumen = page.locator('[role="listitem"]').nth(1).locator('p[class*="timelineResumen"]');
    await resumen.scrollIntoViewIfNeeded();
    const caja = await resumen.boundingBox();
    if (!caja) throw new Error('sin caja del resumen');
    await page.mouse.click(caja.x + caja.width / 2, caja.y + caja.height / 2);
    await expect(botones.nth(1)).toHaveAttribute('aria-expanded', 'true');
  });

  // HALLAZGO abierto: .costeBadge pone blanco sobre var(--primary). Texto de 13,6 px peso 700
  // (texto pequeño: exige 4,5:1). Resuelto a mano: blanco sobre #2E86AB = 4,11:1 en claro y
  // sobre #3FA5D1 = 2,79:1 en oscuro. Es la campaña de botones/badges con fondo de marca, que
  // ningún candado mira (check:contraste-cabeceras solo vigila <th>/<thead>/.th).
  test('contraste — el badge de coste del componente se lee a 4,5:1 en claro y en oscuro', async ({ page }) => {
    test.fail(true, 'HALLAZGO abierto: badge de coste 4,11:1 en claro y 2,79:1 en oscuro');
    await componente(page, 'Batería de litio').click();
    const sel = 'span[class*="costeBadge"]';
    const claro = await contrasteMinimo(page, sel);
    await ponerOscuro(page);
    const oscuro = await contrasteMinimo(page, sel);
    expect(claro, 'badge de coste, tema claro').toBeGreaterThanOrEqual(4.5);
    expect(oscuro, 'badge de coste, tema oscuro').toBeGreaterThanOrEqual(4.5);
  });

  // HALLAZGO abierto: la franja «Un smartphone moderno pasa por ~40 países…» es blanco sobre un
  // degradado var(--primary) → var(--secondary), 14,4 px peso 600. Peor extremo, resuelto a
  // mano: #48A9A6 = 2,80:1 en claro y #5ABDB9 = 2,23:1 en oscuro. Misma campaña sin candado.
  test('contraste — la franja «~40 países» se lee a 4,5:1 en todo su degradado, en claro y en oscuro', async ({ page }) => {
    test.fail(true, 'HALLAZGO abierto: franja ~40 países 2,80:1 en claro y 2,23:1 en oscuro');
    const sel = 'div[class*="contadorPaises"]';
    const claro = await contrasteMinimo(page, sel);
    await ponerOscuro(page);
    const oscuro = await contrasteMinimo(page, sel);
    expect(claro, 'franja ~40 países, tema claro').toBeGreaterThanOrEqual(4.5);
    expect(oscuro, 'franja ~40 países, tema oscuro').toBeGreaterThanOrEqual(4.5);
  });

  // HALLAZGO abierto: color de marca como TEXTO en tema claro. El año de cada crisis
  // (.timelineAnio, var(--secondary), 12,8 px bold) da 2,80:1 sobre la tarjeta blanca; el
  // «Tendencia desde 2020:» (var(--primary) sobre su degradado claro) 3,59:1; los títulos de las
  // tarjetas JIT/JIC (var(--primary), 16,8 px bold) 4,11:1. En oscuro los tres pasan (6,17 /
  // 5,21 / 4,93). El candado de cabeceras no mira el color de marca como texto: se resuelve con
  // --primary-texto / --secondary-texto, que la propia app ya usa en .jitEstadoOk.
  test('contraste — el color de marca usado como texto llega a 4,5:1 en tema claro', async ({ page }) => {
    test.fail(true, 'HALLAZGO abierto: timelineAnio 2,80:1 · tendencia 3,59:1 · jitNombre 4,11:1 en claro');
    const medidas = {
      'año de la crisis (.timelineAnio)': await contrasteMinimo(page, 'p[class*="timelineAnio"]'),
      'Tendencia desde 2020 (.tendencia strong)': await contrasteMinimo(page, 'div[class*="tendencia"] strong'),
      'título JIT (.jitNombre)': await contrasteMinimo(page, 'h3[class*="jitNombre"]'),
    };
    for (const [nombre, valor] of Object.entries(medidas)) {
      expect(valor, `${nombre}, tema claro`).toBeGreaterThanOrEqual(4.5);
    }
  });

  // HALLAZGO abierto: los rótulos del SVG escalan con el viewBox de 540 unidades. A 375 px de
  // ancho el SVG mide 293 px (escala 0,543): los nombres (8,5 u) salen a 4,6 px y los países
  // (7,5 u) a 4,1 px. Esperado: al menos 12 px, el tamaño más pequeño que la propia app usa en
  // su HTML (.timelineStatLabel, 0,75rem).
  test('móvil — los nombres de los componentes del diagrama se pintan a 12 px o más a 375 px de ancho', async ({ page }) => {
    test.fail(true, 'HALLAZGO abierto: rótulos del SVG a 4,6 px (nombres) y 4,1 px (países) en móvil');
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(200);
    const px = await page.evaluate(() => {
      const svg = document.querySelector('svg[role="group"]');
      if (!svg) throw new Error('sin diagrama');
      const escala = svg.getBoundingClientRect().width / 540;
      return [...svg.querySelectorAll('g[role="button"] text')]
        .filter((t) => !/\p{Extended_Pictographic}/u.test(t.textContent ?? ''))
        .map((t) => Number(t.getAttribute('font-size')) * escala);
    });
    expect(px.length).toBe(16); // 8 nombres + 8 países
    expect(Math.min(...px), 'tamaño pintado del rótulo más pequeño, en px').toBeGreaterThanOrEqual(12);
  });

  // HALLAZGO abierto (dato): «el 60 % de las reservas mundiales» para el Triángulo del Litio.
  // USGS, Mineral Commodity Summaries 2026 (litio): reservas Chile 9,2 Mt + Argentina 4,4 Mt de
  // 37 Mt mundiales = 37 %; Bolivia no tiene reservas declaradas (sus 23 Mt son RECURSOS). En la
  // edición de 2025: (9,3 + 4,0) / 30 = 44 %. Ni sumando recursos de los tres países se llega:
  // (28 + 23 + 13) / 150 = 43 %.
  test('dato — la ficha de la batería no atribuye al Triángulo del Litio el 60 % de las reservas', async ({ page }) => {
    test.fail(true, 'HALLAZGO abierto: 60 % de reservas frente al 37 % del USGS 2026');
    await componente(page, 'Batería de litio').click();
    const texto = (await panel(page).textContent()) ?? '';
    expect(texto).toContain('Triángulo del Litio');
    expect(texto).not.toMatch(/60\s?%\s+de las reservas/);
  });

  // HALLAZGO abierto (dato): «más de 800 millones de subpíxeles» en una OLED de móvil.
  // Aritmética: la de más resolución en móvil, 3120 × 1440 = 4.492.800 píxeles; × 3 subpíxeles
  // = 13,5 millones (con matriz diamante, ~2 por píxel, ~9 millones). La cifra es ~60 veces
  // mayor; ni un televisor 8K llega (7680 × 4320 × 3 = 99,5 millones).
  test('dato — la ficha de la pantalla no dice «800 millones de subpíxeles»', async ({ page }) => {
    test.fail(true, 'HALLAZGO abierto: 800 millones de subpíxeles frente a ~13,5 millones');
    await componente(page, 'Pantalla OLED').click();
    await expect(panel(page).getByRole('heading', { name: 'Pantalla OLED' })).toBeVisible();
    await expect(panel(page)).not.toContainText('800 millones de subpíxeles');
  });

  // HALLAZGO abierto (dato): la batería «~10–15 %» del coste del dispositivo. TechInsights
  // (iPhone XS Max, 2018): batería 9 $ de 443 $ de lista de materiales = 2,0 %. Se exige que el
  // tope de la horquilla no pase del 5 %, margen de sobra para otros modelos y años.
  test('dato — la batería no aparece como el 10–15 % del coste del móvil', async ({ page }) => {
    test.fail(true, 'HALLAZGO abierto: batería ~10–15 % frente al ~2 % de TechInsights');
    await componente(page, 'Batería de litio').click();
    const badge = (await panel(page).locator('span[class*="costeBadge"]').textContent()) ?? '';
    const cifras = (badge.match(/\d+/g) ?? []).map(Number);
    expect(cifras.length).toBeGreaterThan(0);
    expect(Math.max(...cifras), `tope de la horquilla «${badge}»`).toBeLessThanOrEqual(5);
  });

  // HALLAZGO abierto (dato): «El término fue acuñado por Jay Forrester (MIT, 1961)». Lee,
  // Padmanabhan y Whang (MIT Sloan Management Review, 15/04/1997): «P&G called this phenomenon
  // the "bullwhip" effect». Forrester describió la AMPLIFICACIÓN de la demanda (1958, 1961),
  // pero no le puso ese nombre.
  test('dato — el término «efecto látigo» no se atribuye a Forrester', async ({ page }) => {
    test.fail(true, 'HALLAZGO abierto: el término lo acuñó P&G, no Forrester');
    const guia = (await page.locator('body').textContent()) ?? '';
    expect(guia).toContain('efecto látigo');
    expect(guia).not.toMatch(/término fue acuñado por Jay Forrester/);
  });

  // HALLAZGO abierto (contenido): calcos del inglés. «subsidios billonarios (CHIPS Act…)»: en
  // español un billón son 10^12; la CHIPS Act de EEUU son 52.700 millones de $ y la European
  // Chips Act unos 43.000 millones de €, así que la palabra infla la cifra por mil. Y
  // «Toyota Production System, 1950s» (en español: «años cincuenta» o «década de 1950»).
  test('contenido — sin «billonarios» para la CHIPS Act ni «1950s»', async ({ page }) => {
    test.fail(true, 'HALLAZGO abierto: «subsidios billonarios» y «1950s»');
    const chips = page.getByRole('button', { name: 'Crisis global de semiconductores' });
    await chips.click();
    const detalle = page.locator('#disrupcion-detalle-0');
    await expect(detalle).toContainText('CHIPS Act');
    await expect(detalle).not.toContainText('billonarios');
    await expect(page.locator('div[class*="jitCard"]').first()).not.toContainText('1950s');
  });
});
