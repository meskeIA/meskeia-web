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
 *   El % del componente se calcula con la partida de COMPONENTES sobre COSTE_MATERIALES_TOTAL:
 *   la lista de materiales que TechInsights estimó en su desmontaje de septiembre de 2018 (453 $).
 *   Hasta el hallazgo 1534 eran ocho horquillas sin fuente («~20–25 %» el procesador) que sumaban
 *   el 100 % en su punto medio; ahora cada una es una partida de la fuente y las ocho suman el
 *   85,1 % (el resto son partidas que el diagrama no dibuja).
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
  // COMPONENTES[1] en page.tsx. Antes «~20–25 %», una horquilla sin fuente (hallazgo 1534); ahora
  // la partida «Applications Processor/Modems» de TechInsights: 72 / 453 = 15,894 % → «15,9 %».
  await expect(panel.locator('span[class*="costeBadge"]')).toHaveText('15,9\u00A0%');
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
//   · Hallazgos 1528-1536: badge de coste y franja «~40 países» con blanco sobre la marca, color
//     de marca como texto en claro, rótulos del SVG ilegibles en móvil, y cinco datos que sus
//     fuentes desmienten. Nacieron como test.fail y se repararon el mismo 24/09/2026: ahora son
//     regresión, cada uno con su fuente cotejada.
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
  //   Espacio en «Batería de litio» → solo la batería pulsada y pintada activa, badge «2,0 %»,
  //   la página no se desplaza; Enter en «Módulo de cámaras» → pasa el testigo (batería false),
  //   badge «9,7 %»; Enter otra vez → ninguno pulsado y panel vacío. (Los badges eran «~10–15 %» y
  //   «~10–12 %», horquillas sin fuente: tras el hallazgo 1534 son 9 / 453 y 44 / 453 de TechInsights.) Foco visible: el rect
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
    await expect(panel(page).locator('span[class*="costeBadge"]')).toHaveText('2,0 %');
    let estado = await estadoDiagrama(page);
    expect(estado.map((e) => e.pulsado)).toEqual([false, false, true, false, false, false, false, false]);
    for (const e of estado) expect(e.pintadoActivo, 'aria-pressed y el relleno activo deben coincidir').toBe(e.pulsado);

    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await expect(componente(page, 'Módulo de cámaras')).toHaveAttribute('aria-pressed', 'true');
    await expect(componente(page, 'Batería de litio')).toHaveAttribute('aria-pressed', 'false');
    await expect(panel(page).locator('span[class*="costeBadge"]')).toHaveText('9,7 %');
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

  // HALLAZGO 1528 (reparado el 24/09/2026): .costeBadge ponía blanco sobre var(--primary). Texto
  // de 13,6 px peso 700 (texto pequeño: exige 4,5:1). Resuelto a mano antes: blanco sobre #2E86AB
  // = 4,11:1 en claro y sobre #3FA5D1 = 2,79:1 en oscuro. Ahora el fondo es --primary-boton
  // (#26718F en los dos temas): blanco encima = 5,47:1.
  test('contraste — el badge de coste del componente se lee a 4,5:1 en claro y en oscuro', async ({ page }) => {
    await componente(page, 'Batería de litio').click();
    const sel = 'span[class*="costeBadge"]';
    const claro = await contrasteMinimo(page, sel);
    await ponerOscuro(page);
    const oscuro = await contrasteMinimo(page, sel);
    expect(claro, 'badge de coste, tema claro (antes 4,11:1)').toBeGreaterThanOrEqual(4.5);
    expect(oscuro, 'badge de coste, tema oscuro (antes 2,79:1)').toBeGreaterThanOrEqual(4.5);
  });

  // HALLAZGO 1529 (reparado): la franja «Un smartphone moderno pasa por ~40 países…» era blanco
  // sobre un degradado var(--primary) → var(--secondary), 14,4 px peso 600. Peor extremo antes:
  // #48A9A6 = 2,80:1 en claro y #5ABDB9 = 2,23:1 en oscuro. Ahora --primary-boton →
  // --secondary-boton (#26718F → #327874 en los dos temas): peor extremo 5,15:1.
  test('contraste — la franja «~40 países» se lee a 4,5:1 en todo su degradado, en claro y en oscuro', async ({ page }) => {
    const sel = 'div[class*="contadorPaises"]';
    const claro = await contrasteMinimo(page, sel);
    await ponerOscuro(page);
    const oscuro = await contrasteMinimo(page, sel);
    expect(claro, 'franja ~40 países, tema claro (antes 2,80:1)').toBeGreaterThanOrEqual(4.5);
    expect(oscuro, 'franja ~40 países, tema oscuro (antes 2,23:1)').toBeGreaterThanOrEqual(4.5);
  });

  // HALLAZGO 1530 (reparado): color de marca como TEXTO en tema claro. Antes: el año de cada crisis
  // (.timelineAnio, var(--secondary), 12,8 px bold) 2,80:1; «Tendencia desde 2020:» 3,59:1; los
  // títulos en var(--primary) por debajo de 18,66 px bold (.jitNombre, .componenteNombre,
  // .reshoringNombre, .eduCard h4, .sliderValor) 4,11:1. Se miden todos los que nombra el acta,
  // más la duración de la crisis desplegada (.timelineStatNum, 16 px bold: mismo defecto), en los
  // dos temas: en oscuro los tokens -texto valen lo mismo que la marca, que ya pasaba.
  test('contraste — el color de marca usado como texto llega a 4,5:1 en claro y en oscuro', async ({ page }) => {
    await componente(page, 'Pantalla OLED').click();
    await page.getByRole('button', { name: 'Crisis global de semiconductores' }).click();
    const selectores: Record<string, string> = {
      'año de la crisis (.timelineAnio)': 'p[class*="timelineAnio"]',
      'Tendencia desde 2020 (.tendencia strong)': 'div[class*="tendencia"] strong',
      'título JIT (.jitNombre)': 'h3[class*="jitNombre"]',
      'título de la ficha (.componenteNombre)': 'h3[class*="componenteNombre"]',
      'estrategia (.reshoringNombre)': 'h3[class*="reshoringNombre"]',
      'guía (.eduCard h4)': 'div[class*="eduCard"] h4',
      'valor del deslizador (.sliderValor)': 'span[class*="sliderValor"]',
      'duración de la crisis (.timelineStatNum)': 'span[class*="timelineStatNum"]',
    };
    const medir = async (tema: string) => {
      for (const [nombre, sel] of Object.entries(selectores)) {
        expect(await contrasteMinimo(page, sel), `${nombre}, tema ${tema}`).toBeGreaterThanOrEqual(4.5);
      }
    };
    await medir('claro');
    await ponerOscuro(page);
    await medir('oscuro');
  });

  // HALLAZGO 1531 (reparado): los rótulos del SVG escalaban con un viewBox de 540 unidades; a 375 px
  // de ancho el SVG medía 293 px (escala 0,543) y los nombres (8,5 u) salían a 4,6 px, los países
  // (7,5 u) a 4,1 px; a 1280 px, 6,8 y 6,0 px. Y tres nombres se cortaban con «…».
  // Ahora: viewBox de 320 u, dos columnas, rótulos de 14 u (nombre) y 13 u (origen). Resuelto a
  // mano para 375 px: sección 375 − 2 × 24 = 327; tarjeta del SVG 327 − 2 × 8 − 2 × 1 = 309 px;
  // escala 309 / 320 = 0,966 → 13,5 y 12,6 px. Esperado: ≥ 12 px (lo más pequeño que la app usa
  // en su HTML, .timelineStatLabel, 0,75rem) a 375 y 390 px y en escritorio, sin «…» y con cada
  // rótulo dentro de su tarjeta. La escala se lee del viewBox real, no de un 540 fijo: el test
  // anterior lo daba por supuesto.
  test('móvil — los rótulos del diagrama se pintan a 12 px o más y caben en su tarjeta, a 375, 390 y 1280 px', async ({ page }) => {
    for (const ancho of [375, 390, 1280]) {
      await page.setViewportSize({ width: ancho, height: 812 });
      await page.waitForTimeout(200);
      const rotulos = await page.evaluate(() => {
        const svg = document.querySelector('svg[role="group"]') as SVGSVGElement | null;
        if (!svg) throw new Error('sin diagrama');
        const escala = svg.getBoundingClientRect().width / svg.viewBox.baseVal.width;
        return [...svg.querySelectorAll('g[role="button"] text')]
          .filter((t) => !/\p{Extended_Pictographic}/u.test(t.textContent ?? ''))
          .map((t) => {
            const texto = t as SVGTextElement;
            const caja = texto.closest('g')?.querySelector('rect');
            const cajaX = Number(caja?.getAttribute('x'));
            const cajaAncho = Number(caja?.getAttribute('width'));
            const bb = texto.getBBox();
            return {
              texto: texto.textContent ?? '',
              px: Number(texto.getAttribute('font-size')) * escala,
              dentro: bb.x >= cajaX + 4 && bb.x + bb.width <= cajaX + cajaAncho - 4,
            };
          });
      });
      expect(rotulos.length).toBe(16); // 8 nombres + 8 orígenes
      const minimo = Math.min(...rotulos.map((r) => r.px));
      expect(minimo, `rótulo más pequeño a ${ancho} px (antes 4,1 px a 375)`).toBeGreaterThanOrEqual(12);
      expect(rotulos.filter((r) => r.texto.includes('…')).map((r) => r.texto), `recortes a ${ancho} px`).toEqual([]);
      expect(rotulos.filter((r) => !r.dentro).map((r) => r.texto), `rótulos que se salen a ${ancho} px`).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth), `scroll horizontal a ${ancho} px`).toBeLessThanOrEqual(ancho);
    }
  });

  // HALLAZGO 1532 (reparado, dato): decía «el 60 % de las reservas mundiales» para el Triángulo del
  // Litio. USGS, Mineral Commodity Summaries 2026 (litio), cotejado el 24/09/2026 en
  // https://pubs.usgs.gov/periodicals/mcs2026/mcs2026-lithium.pdf: reservas Chile 9.200.000 t +
  // Argentina 4.400.000 t de 37.000.000 t mundiales = 36,8 % ≈ 37 %; Bolivia no figura en reservas
  // (23 Mt de RECURSOS); recursos de los tres, (28 + 23 + 13) / 150 = 42,7 % ≈ 43 %.
  test('dato — la ficha de la batería da el 37 % de reservas del USGS 2026, no el 60 %', async ({ page }) => {
    await componente(page, 'Batería de litio').click();
    const texto = (await panel(page).textContent()) ?? '';
    expect(texto).toContain('Triángulo del Litio');
    expect(texto).not.toMatch(/60\s?%\s+de las reservas/);
    expect(texto).toContain('reúnen el 37 % de las reservas mundiales');
    expect(texto).toContain('9,2 y 4,4 de 37 millones de toneladas');
    expect(texto).toContain('USGS, Mineral Commodity Summaries 2026');
    expect(texto).toContain('en torno al 43 %');
  });

  // HALLAZGO 1533 (reparado, dato): decía «más de 800 millones de subpíxeles». Aritmética de
  // resolución con una pantalla QHD+ de gama alta de 3120 × 1440 (resolución que da samsung.com/uk,
  // «Which Phone Has The Best Display?», cotejado el 24/09/2026): 3120 × 1440 = 4.492.800 píxeles;
  // × 3 subpíxeles (rojo, verde, azul) = 13.478.400 ≈ 13,5 millones.
  test('dato — la ficha de la pantalla calcula los subpíxeles por resolución (≈ 13,5 millones)', async ({ page }) => {
    await componente(page, 'Pantalla OLED').click();
    await expect(panel(page).getByRole('heading', { name: 'Pantalla OLED' })).toBeVisible();
    await expect(panel(page)).not.toContainText('800 millones de subpíxeles');
    await expect(panel(page)).toContainText('(3120 × 1440 píxeles) tiene 4.492.800 píxeles');
    await expect(panel(page)).toContainText('unos 13,5 millones');
  });

  // HALLAZGO 1534 (reparado, dato): la batería salía como «~10–15 %» del coste, y las ocho
  // horquillas no tenían fuente. Ahora cada componente es una partida de la lista de materiales de
  // TechInsights (desmontaje de septiembre de 2018, revisado el 27/09/2018 a 453 $),
  // https://www.techinsights.com/blog/apple-iphone-xs-max-teardown, cotejada el 24/09/2026.
  // Esperados resueltos a mano, partida / 453 redondeado a un decimal:
  //   Pantalla 90,50 → 19,978 → 20,0 · Procesador y módems 72,00 → 15,894 → 15,9 ·
  //   Batería 9,00 → 1,987 → 2,0 · Cámaras 44,00 → 9,713 → 9,7 · Memoria 64,50 → 14,238 → 14,2 ·
  //   Señal mixta y RF 23,00 → 5,077 → 5,1 · Mecánica y carcasas 58,00 → 12,804 → 12,8 ·
  //   Pruebas, ensamblaje y materiales 24,50 → 5,408 → 5,4.
  // El tope de la batería ≤ 5 % del acta se mantiene.
  test('dato — el coste de cada componente es su partida de TechInsights (batería 2,0 %)', async ({ page }) => {
    const esperados: Array<[string, string, string]> = [
      ['Pantalla OLED', '20,0', 'Partida «Pantalla»: 90,50 $ de 453,00 $'],
      ['Procesador (SoC)', '15,9', 'Partida «Procesador de aplicaciones y módems»: 72,00 $'],
      ['Batería de litio', '2,0', 'Partida «Batería»: 9,00 $ de 453,00 $'],
      ['Módulo de cámaras', '9,7', 'Partida «Cámaras»: 44,00 $'],
      ['Memoria flash (NAND)', '14,2', 'Partida «Memoria»: 64,50 $'],
      ['Antenas 5G', '5,1', 'Partida «Señal mixta y radiofrecuencia»: 23,00 $'],
      ['Chasis de aluminio', '12,8', 'Partida «Piezas mecánicas y carcasas»: 58,00 $'],
      ['Ensamblaje final', '5,4', 'Partida «Pruebas, ensamblaje y materiales auxiliares»: 24,50 $'],
    ];
    const badge = panel(page).locator('span[class*="costeBadge"]');
    for (const [nombre, pct, partida] of esperados) {
      await componente(page, nombre).click();
      await expect(badge, nombre).toHaveText(`${pct} %`);
      await expect(panel(page)).toContainText(partida);
      await expect(panel(page)).toContainText('TechInsights');
      await expect(panel(page)).toContainText('septiembre de 2018');
    }
    await componente(page, 'Batería de litio').click();
    const cifras = ((await badge.textContent()) ?? '').replace(',', '.').match(/[\d.]+/g)?.map(Number) ?? [];
    expect(cifras.length).toBeGreaterThan(0);
    expect(Math.max(...cifras), 'peso de la batería (antes «~10–15 %»)').toBeLessThanOrEqual(5);
    await expect(panel(page)).not.toContainText('Coste aproximado del total del dispositivo');
  });

  // HALLAZGO 1535 (reparado, dato): «El término fue acuñado por Jay Forrester (MIT, 1961)». Lee,
  // Padmanabhan y Whang (MIT Sloan Management Review, 15/04/1997), cotejado el 24/09/2026: «logistics
  // executives at Procter & Gamble (P&G) examined the order patterns for one of their best-selling
  // products, Pampers […] P&G called this phenomenon the "bullwhip" effect». Forrester describió la
  // amplificación en Harvard Business Review (julio-agosto de 1958), sin ponerle ese nombre.
  test('dato — el término «efecto látigo» se atribuye a P&G según Lee et al., no a Forrester', async ({ page }) => {
    const guia = (await page.locator('body').textContent()) ?? '';
    expect(guia).toContain('efecto látigo');
    expect(guia).not.toMatch(/término fue acuñado por Jay Forrester/);
    expect(guia).toContain('ya describió esta amplificación en 1958, en la Harvard Business');
    expect(guia).toMatch(/responsables de\s+logística de Procter & Gamble/);
    expect(guia).toMatch(/Seungjin Whang \(MIT\s+Sloan Management Review, 1997\)/);
  });

  // HALLAZGO 1536 (reparado, contenido): «subsidios billonarios (CHIPS Act…)» — en español un
  // billón son 10^12 — y «Toyota Production System, 1950s». Cifras cotejadas el 24/09/2026:
  //   · Casa Blanca, hoja informativa del 09/08/2022: «The CHIPS and Science Act provides $52.7
  //     billion for American semiconductor research, development, manufacturing, and workforce
  //     development» → 52.700 millones de $.
  //   · Comisión Europea, IP/22/729 (08/02/2022): «It will mobilise more than €43 billion euros of
  //     public and private investments» → más de 43.000 millones de €; en vigor el 21/09/2023
  //     (IP/23/4518).
  test('contenido — cuantías de la CHIPS Act y la Ley Europea de Chips en millones, y «década de 1950»', async ({ page }) => {
    const chips = page.getByRole('button', { name: 'Crisis global de semiconductores' });
    await chips.click();
    const detalle = page.locator('#disrupcion-detalle-0');
    await expect(detalle).toContainText('CHIPS and Science Act');
    await expect(detalle).toContainText('52.700 millones de $');
    await expect(detalle).toContainText('más de 43.000 millones de € de inversión pública y privada');
    await expect(detalle).toContainText('21/09/2023');
    await expect(detalle).not.toContainText('billonarios');
    const jit = page.locator('div[class*="jitCard"]').first();
    await expect(jit).not.toContainText('1950s');
    await expect(jit).toContainText('Sistema de Producción Toyota, década de 1950');
  });
});

// ─────────────────────────────────────────────────────────────────────────────────────────────
// RE-INSPECCIÓN del 25/09/2026, tras 20901bec (hallazgos 1528-1536).
//
// Los 16 hallazgos de las dos inspecciones del 24/09/2026 siguen cubiertos por los tests de arriba
// (teclado, contraste, SVG en móvil, datos con fuente): se ejecutan tal cual y no se duplican.
//
// Casos nuevos, resueltos a mano ANTES de ejecutar la app:
//   · NORMAL — las 8 partidas del diagrama suman 90,50 + 72 + 9 + 44 + 64,50 + 23 + 58 + 24,50 =
//     385,50 $ de 453 $ = 85,099 % → los badges (20,0 + 15,9 + 2,0 + 9,7 + 14,2 + 5,1 + 12,8 + 5,4)
//     suman 85,1. No el 100 %: el resto son partidas que el diagrama no dibuja. Y cada país que el
//     SVG rotula en la tarjeta aparece en el «País de origen» de su ficha.
//   · LÍMITE — móvil de 375 × 667 con toque: tocar un componente abre su ficha y el título queda
//     a la vista; tocar un evento lo despliega; la página no se desborda (la tabla comparativa
//     desplaza dentro de su contenedor).
//   · IMPEDIR / VACÍO — al cargar, ningún componente pulsado, ningún evento desplegado y el panel
//     vacío; el círculo central «~40 países» y las teclas que no son Enter ni Espacio no
//     seleccionan nada.
//
// SOSPECHA del 24/09/2026, cotejada EN SESIÓN el 25/09/2026:
//   · Batería, «el 75 % de la producción de celdas de batería ocurre en China», en presente y sin
//     año. IEA, Global EV Outlook 2025, «Electric vehicle batteries»: «China was responsible for
//     80% of global battery cell production in 2024»; Global EV Outlook 2026: «over 80%» de la
//     capacidad mundial a finales de 2025. → hallazgo, dato bajo.
//   · Cámaras, «Sony controla ~45 %…», sin año. Es la cifra de Strategy Analytics para 2021 (45 %
//     de los ingresos, nota del 21/03/2022). TechInsights, «Smartphone Image Sensor Market Share
//     Q4 2024»: «Sony Semiconductor ranked top with over 55% share». → hallazgo, dato bajo.
//   · Memoria, «con hasta 232 capas», en presente. 232 capas fue el récord de Micron (volumen
//     desde el 26/07/2022). SK hynix produce en masa NAND de 321 capas desde el 21/11/2024 y el
//     22/05/2025 anunció su UFS 4.1 para móviles sobre 321 capas (la generación móvil anterior ya
//     era de 238), con envíos en volumen desde el 1.er trimestre de 2026. → hallazgo, dato bajo.
//   · Guía, «más de 200 proveedores directos y miles […] distribuidos por 43 países». Apple,
//     apple.com/supply-chain: «Our supply chain includes thousands of supplier facilities in over
//     60 countries.» → hallazgo, dato bajo. Los «200 proveedores» y los «~40 países» de UN
//     smartphone no se levantan: no hay fuente que dé la cifra correcta para anclarlos.
//   · El campo `cosтe` con dos letras cirílicas: ya no existe. 20901bec rehízo el tipo
//     (`coste: PartidaCoste`) y el grep da 0 coincidencias; queda como regresión.
//
// Y uno que salió al cuadrar países con fabricantes (fuentes del 25/09/2026):
//   · Cámaras: «Japón / China / Suecia» con Sony (Japón), Largan Precision y Sunny Optical.
//     Largan tiene su sede en «No. 11, Jingke Rd., Nantun Dist., Taichung City 408210, Taiwan»
//     (largan.com.tw): falta Taiwán, y ningún fabricante nombrado es sueco. Antenas: Murata
//     (componentes RF) tiene su sede en «Nagaokakyo-shi, Kyoto 617-8555, Japan»
//     (corporate.murata.com) y Japón no está en el país. → hallazgo, dato bajo.
//
// REPARADOS el 25/09/2026 (Ronda 15, hallazgos 1724-1728): los cinco test.fail pasan a regresión.
// En antenas el diagrama rotula ahora «EEUU / Japón» (Qualcomm y Murata fabrican las piezas) y la
// ficha deja Finlandia y Suecia como «tecnología base» (Nokia, Ericsson: patentes y estándares).
// ─────────────────────────────────────────────────────────────────────────────────────────────

test.describe('Inspección 25/09/2026 — re-inspección tras 20901bec', () => {
  const componente = (page: Page, nombre: string): Locator =>
    page.getByRole('button', { name: `Ver detalles de ${nombre}` });
  const panel = (page: Page): Locator => page.locator('div[class*="panelDetalle"]');

  // CASO NORMAL. Esperados del array COMPONENTES de page.tsx y de TechInsights (desmontaje de
  // septiembre de 2018, 453 $): [nombre, badge, rótulo del SVG, «País de origen» de la ficha].
  test('normal — los 8 badges suman el 85,1 % y cada país rotulado en el diagrama está en su ficha', async ({ page }) => {
    const esperados: Array<[string, string, string, string]> = [
      ['Pantalla OLED', '20,0', 'Corea del Sur', 'Corea del Sur / China'],
      ['Procesador (SoC)', '15,9', 'EEUU → Taiwán', 'Diseñado en EEUU/UK — Fabricado en Taiwán/Corea'],
      ['Batería de litio', '2,0', 'Chile → China', 'Litio de Chile/Australia — Celdas en China'],
      ['Módulo de cámaras', '9,7', 'Japón / China', 'Japón / Taiwán / China'],
      ['Memoria flash (NAND)', '14,2', 'Japón / Corea', 'Japón / Corea del Sur / China'],
      ['Antenas 5G', '5,1', 'EEUU / Japón', 'EEUU / Japón (componentes) — Finlandia / Suecia (tecnología base)'],
      ['Chasis de aluminio', '12,8', 'China', 'China (fabricación) — Bauxita de Guinea/Australia'],
      ['Ensamblaje final', '5,4', 'China / India', 'China / India / Vietnam'],
    ];
    let suma = 0;
    for (const [nombre, pct, origenSvg, pais] of esperados) {
      const g = componente(page, nombre);
      await expect(g.locator('text').nth(2), `origen rotulado de ${nombre}`).toHaveText(origenSvg);
      await g.click();
      await expect(panel(page).getByRole('heading', { name: nombre })).toBeVisible();
      await expect(panel(page).locator('span[class*="costeBadge"]')).toHaveText(`${pct} %`);
      const fichaPais = page.locator('p[class*="componentePais"]');
      await expect(fichaPais).toHaveText(`País de origen: ${pais}`);
      for (const p of origenSvg.split(/→|\//).map((s) => s.trim())) {
        expect(pais, `«${p}» del diagrama en la ficha de ${nombre}`).toContain(p);
      }
      suma += Number(pct.replace(',', '.'));
    }
    // 385,50 / 453 = 85,099 % → 85,1.
    expect(suma).toBeCloseTo(85.1, 5);
  });

  // CASO IMPEDIR / VACÍO. Esperado del estado inicial de la página (useState(null) en los dos) y
  // del onKeyDown del <g>, que solo atiende Enter y Espacio.
  test('vacío — al cargar no hay nada pulsado; el círculo central y otras teclas no seleccionan', async ({ page }) => {
    const pulsados = () =>
      page.evaluate(
        () => [...document.querySelectorAll('g[role="button"]')].filter((g) => g.getAttribute('aria-pressed') === 'true').length,
      );
    expect(await pulsados()).toBe(0);
    await expect(panel(page)).toHaveText(
      '👆Pulsa cualquier componente del diagrama para ver su país de origen, empresa fabricante y datos curiosos',
    );
    await expect(page.locator('[role="listitem"] button[aria-expanded="true"]')).toHaveCount(0);
    await expect(page.locator('div[class*="timelineDetalle"]')).toHaveCount(0);

    // El círculo central no es un componente.
    await page.locator('svg[role="group"] text', { hasText: '~40 países' }).click();
    expect(await pulsados()).toBe(0);

    // Teclas que no son Enter ni Espacio: nada; Enter sí.
    const bateria = componente(page, 'Batería de litio');
    for (const tecla of ['a', 'Escape', 'ArrowRight']) {
      await bateria.focus();
      await page.keyboard.press(tecla);
      await expect(bateria, `tecla ${tecla}`).toHaveAttribute('aria-pressed', 'false');
    }
    await bateria.focus();
    await page.keyboard.press('Enter');
    await expect(bateria).toHaveAttribute('aria-pressed', 'true');
    expect(await pulsados()).toBe(1);
  });

  // CASO LÍMITE (móvil). Medido en la exploración: SVG de 309 px, título de la ficha a 467 px de
  // una pantalla de 667 tras el toque, scrollWidth 375 y la tabla (559 px) dentro de un
  // contenedor de 327 px con overflow-x auto.
  test.describe('móvil 375 × 667 con toque', () => {
    test.use({
      viewport: { width: 375, height: 667 },
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });

    test('móvil — tocar un componente abre su ficha a la vista y tocar un evento lo despliega, sin desbordar', async ({ page }) => {
      const bateria = componente(page, 'Batería de litio');
      await bateria.tap();
      await expect(bateria).toHaveAttribute('aria-pressed', 'true');
      const titulo = panel(page).getByRole('heading', { name: 'Batería de litio' });
      await expect(titulo).toBeInViewport();
      await expect(panel(page).locator('span[class*="costeBadge"]')).toHaveText('2,0 %');
      await bateria.tap();
      await expect(bateria).toHaveAttribute('aria-pressed', 'false');
      await expect(panel(page)).toContainText('Pulsa cualquier componente del diagrama');

      const tailandia = page.getByRole('button', { name: 'Inundaciones en Tailandia' });
      await tailandia.tap();
      await expect(tailandia).toHaveAttribute('aria-expanded', 'true');
      await expect(page.locator('#disrupcion-detalle-3 span[class*="timelineStatNum"]').first()).toHaveText('~4 meses');

      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
      const tabla = await page.evaluate(() => {
        const w = document.querySelector('div[class*="tablaWrapper"]') as HTMLElement;
        return { overflowX: getComputedStyle(w).overflowX, cabe: w.getBoundingClientRect().right <= innerWidth };
      });
      expect(tabla).toEqual({ overflowX: 'auto', cabe: true });
    });
  });

  // SOSPECHA RESUELTA — el identificador `cosтe` (т y е cirílicas) desapareció con 20901bec.
  // Entrada: grep de letras cirílicas (U+0400–U+04FF) en page.tsx → esperado 0 · obtenido 0.
  test('código — ningún carácter cirílico en page.tsx (el campo «cosтe» ya no existe)', async () => {
    const { readFileSync } = await import('node:fs');
    const { join } = await import('node:path');
    const fuente = readFileSync(join(process.cwd(), 'app/visualizador-cadenas-suministro/page.tsx'), 'utf8');
    const cirilicas = fuente.split('\n').flatMap((l, i) => (/[Ѐ-ӿ]/.test(l) ? [`${i + 1}: ${l.trim()}`] : []));
    expect(cirilicas).toEqual([]);
  });

  // HALLAZGO (25/09/2026, dato bajo) — batería. IEA, Global EV Outlook 2025: «China was
  // responsible for 80% of global battery cell production in 2024». Hoy la ficha dice «el 75 %
  // […] ocurre en China», en presente, sin año ni fuente. Lo correcto: la cifra de la IEA con su año.
  test('dato — la cuota china de celdas de batería lleva la cifra de la IEA y su año, no un 75 % sin fecha', async ({ page }) => {
    await componente(page, 'Batería de litio').click();
    const texto = (await panel(page).textContent()) ?? '';
    expect(texto).not.toMatch(/75\s?% de la producción de celdas/);
    expect(texto).toContain('IEA');
    expect(texto).toMatch(/80\s?%/);
  });

  // HALLAZGO (25/09/2026, dato bajo) — cámaras. «~45 %» es Strategy Analytics para 2021;
  // TechInsights, Q4 2024: «Sony Semiconductor ranked top with over 55% share».
  test('dato — la cuota de Sony en sensores de smartphone no es un «~45 %» sin año', async ({ page }) => {
    await componente(page, 'Módulo de cámaras').click();
    const texto = (await panel(page).textContent()) ?? '';
    expect(texto).not.toMatch(/~45\s?%/);
    expect(texto).toMatch(/55\s?%/);
  });

  // HALLAZGO (25/09/2026, dato bajo) — memoria. «Hasta 232 capas» fue el récord de Micron en julio
  // de 2022; SK hynix produce 321 capas desde el 21/11/2024 y su UFS 4.1 móvil es de 321 capas.
  test('dato — la ficha de la NAND no da «hasta 232 capas» como techo actual', async ({ page }) => {
    await componente(page, 'Memoria flash (NAND)').click();
    await expect(panel(page)).not.toContainText('hasta 232 capas');
  });

  // HALLAZGO (25/09/2026, dato bajo) — guía. «Distribuidos por 43 países»; Apple
  // (apple.com/supply-chain): «thousands of supplier facilities in over 60 countries».
  test('dato — la red de proveedores de Apple no se reparte por «43 países» sino por más de 60', async ({ page }) => {
    const guia = (await page.locator('div[class*="eduCard"]').first().textContent()) ?? '';
    expect(guia).not.toContain('43 países');
    expect(guia).toMatch(/60\s+países/);
  });

  // HALLAZGO (25/09/2026, dato bajo) — países que no casan con los fabricantes de la propia ficha.
  // Largan Precision: Taichung, Taiwán (largan.com.tw); Murata: Nagaokakyo, Kioto, Japón
  // (corporate.murata.com). Ningún fabricante de cámaras nombrado es sueco.
  test('dato — el país de cámaras y antenas incluye el de sus fabricantes (Taiwán, Japón) y no uno sin fabricante', async ({ page }) => {
    const fichaPais = page.locator('p[class*="componentePais"]');
    await componente(page, 'Módulo de cámaras').click();
    await expect(panel(page)).toContainText('Largan Precision');
    await expect(fichaPais).toContainText('Taiwán');
    await expect(fichaPais).not.toContainText('Suecia');
    await componente(page, 'Antenas 5G').click();
    await expect(panel(page)).toContainText('Murata');
    await expect(fichaPais).toContainText('Japón');
  });
});
