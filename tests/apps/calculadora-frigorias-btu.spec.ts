import { test, expect, type Page, type Locator } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * calculadora-frigorias-btu — PRIMERA INSPECCIÓN (Inspector, 17/11/2026)
 *
 * La app promete en su <h1> «Calculadora de Frigorías y BTU» y en su subtítulo «Cuánta potencia de
 * frío y de calor necesita una estancia, y de dónde sale cada vatio». Todo el cálculo vive en
 * app/calculadora-frigorias-btu/page.tsx (sin motor aparte ni data/fiscal):
 *
 *   volumen = superficie × altura
 *   base = volumen × {templado 30 · cálido 40 · muy cálido 50} W/m³
 *   corrección = aislamiento {bueno 0,9 · medio 1 · escaso 1,15} × sol {0,95 · 1 · 1,1}
 *                × cristal {0,95 · 1 · 1,1} × (bajo cubierta ? 1,1 : 1)
 *   frío W = base × corrección + personas × 100 W + aparatos W
 *   calor W = superficie × {suave 55/75/95 · frío 75/100/125 · muy frío 95/125/155 (bueno/medio/escaso)}
 *             × altura / 2,5 × cristal {0,95 · 1 · 1,1} × (bajo cubierta ? 1,1 : 1)
 *             (REPARADO, hallazgo 4971: antes ni la altura ni el cristal entraban)
 *   equipo = primer tamaño de [9000, 12000, 18000, 24000, 30000, 36000, 42000, 48000] BTU ≥ carga
 *   consumo = frío W / 8 … frío W / 4,5
 *
 * Las conversiones salen de sus DEFINICIONES, no del redondeo de la app:
 *   1 frigoría/h = 1 kcal(IT)/h = 4186,8 J / 3600 s = 1,163 W (exacto)
 *   1 BTU(IT)/h = 1055,05585262 J / 3600 s = 0,29307107 W → 1 W = 3,41214163 BTU/h
 *   1 frigoría/h = 1,163 × 3,41214163 = 3,96832 BTU/h («3,968», como dice la app)
 * La app usa 3,412142 BTU/h por W: difiere en 4·10⁻⁷ relativo, invisible con cifras enteras.
 *
 * LOS TRES CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR (y la app coincidió en todos)
 *
 *   CASO 1 (normal) — 25 m², altura «2,7» (coma decimal), verano templado, invierno frío,
 *     aislamiento bueno, mucho sol, mucha cristal, sin cubierta, 3 personas, 300 W:
 *     volumen 67,5 m³ · base 67,5 × 30 = 2025 W · corrección 0,9 × 1,1 × 1,1 = 1,089 →
 *     envolvente 2205,225 W (+180,225) · frío = 2205,225 + 300 + 300 = 2805,225 W
 *     → 2805,225 / 1,163 = 2412,06 frig/h · × 3,41214163 = 9571,8 BTU/h
 *     → equipo 12.000 BTU, margen 12000 / 9571,8 − 1 = 25,4 % → «25 %»
 *       (12000 BTU/h = 3516,85 W = 3023,9 frigorías → «3024»)
 *     calor = 25 × 75 = 1875 W → «1,88 kW» · 1875 × 3,41214 = 6397,8 → «6398 BTU/h»
 *     consumo 2805,2 / 8 = 351 W → «0,35» · / 4,5 = 623 W → «0,62» · 2412,06 / 25 = 96,5 → «96 frig/m²»
 *     pesos: 2025 / 2805,2 = 72 % · 180 → 6 % · 300 → 11 % · 300 → 11 %
 *
 *   CASO 2 (límite: la combinación que más sube la carga) — 300 m², 6 m, muy cálido, muy frío,
 *     escaso, mucho sol, mucha cristal, bajo cubierta, 30 personas, 6000 W (el máximo de cada control):
 *     volumen 1800 m³ · base 1800 × 50 = 90.000 W · corrección 1,15 × 1,1³ = 1,53065 →
 *     envolvente 137.758,5 W (+47.758,5) · frío = 137.758,5 + 3000 + 6000 = 146.758,5 W
 *     → 126.189,6 frig/h → «126.190» · 500.760,8 BTU/h → «500.761» · ningún tamaño comercial
 *     calor = 300 × 155 × 1,1 = 51.150 W → «51,15 kW» · «174.531 BTU/h»
 *     consumo 18.344,8 W … 32.613 W → «18,34-32,61 kW» · 126.189,6 / 300 = 420,6 → «421 frig/m²»
 *     pesos 61 % · 33 % · 2 % · 4 %
 *   Y el mínimo: 4 m², 2 m, templado, 0 personas, 0 W → 8 m³ × 30 = 240 W → «206» frig/h, «819 BTU/h»,
 *     equipo 9000 BTU con margen 9000 / 818,9 − 1 = 999 % y el aviso de sobredimensionado; calor
 *     4 × 75 = 300 W → «0,30 kW», «1024 BTU/h»; consumo «0,03-0,05 kW»; «52 frig/m²».
 *
 *   CASO 3 (se rechaza) — superficie 3 o 300,5 m², altura 7 o 1,9 m, −1 o 31 personas, 6001 W: cada
 *     uno con su mensaje de rango y sin resultado. Coincide. Pero un campo VACÍO o que no es un número
 *     («», «12abc», «20 m2») debía dar «Revisa los datos: hay algún campo vacío o que no es un
 *     número.» y da «No definido frigorías/h» y «la estancia pide más de un equipo». HALLAZGO.
 *
 * Los test con test.fail() son HALLAZGOS ABIERTOS: el día que se reparen, fallarán por pasar y
 * habrá que quitarles el test.fail() (y cambiar ABIERTO por REPARADO). Cada uno afirma lo CORRECTO.
 */

const RUTA = '/calculadora-frigorias-btu/';
const SUPERFICIE = '#superficie';
const ALTURA = '#altura';
const OCUPANTES = '#ocupantes';
const EQUIPOS = '#equipos';

const W_POR_FRIGORIA = 4186.8 / 3600; // 1 kcal(IT)/h en vatios
const W_POR_BTU_H = 1055.05585262 / 3600; // 1 BTU(IT)/h en vatios

/** Escribe en un campo como lo haría el usuario y espera a que llegue al estado de React. */
async function poner(page: Page, selector: string, valor: string): Promise<void> {
  await page.locator(selector).fill(valor);
  await esperarValorEnReact(page, selector, valor);
}

/** Pulsa una opción de un selector (su nombre empieza por la etiqueta) y comprueba que queda activa. */
async function elegir(page: Page, inicioNombre: RegExp): Promise<void> {
  const boton = page.getByRole('button', { name: inicioNombre });
  await boton.click();
  await expect(boton).toHaveAttribute('aria-pressed', 'true');
}

/** El conmutador «Bajo cubierta» (su texto cambia al pulsarlo: ver el hallazgo de accesibilidad). */
function conmutadorCubierta(page: Page): Locator {
  return page.getByRole('button', { name: /cubierta|vivienda encima|última planta/i });
}

async function activarCubierta(page: Page): Promise<void> {
  const boton = conmutadorCubierta(page);
  await expect(boton).toHaveAttribute('aria-pressed', 'false');
  await boton.click();
  await expect(conmutadorCubierta(page)).toHaveAttribute('aria-pressed', 'true');
}

const panelResultado = (page: Page): Locator => page.locator('section[aria-labelledby="tituloResultado"]');

/** El texto visible del panel de resultados, con los espacios (también el duro) reducidos a uno. */
async function resultado(page: Page): Promise<string> {
  return (await panelResultado(page).innerText()).replace(/\s+/g, ' ').trim();
}

/** Los vatios de refrigeración que pinta la app («… BTU/h · 2400 W»). */
async function vatiosFrio(page: Page): Promise<number> {
  const m = (await resultado(page)).match(/BTU\/h · ([\d.]+) W/);
  expect(m, 'la app pinta los vatios de refrigeración').not.toBeNull();
  return Number(m![1].replace(/\./g, ''));
}

/** La potencia de calefacción en kW que pinta la app («1,50 kW 5118 BTU/h»). */
async function kwCalefaccion(page: Page): Promise<string> {
  const m = (await resultado(page)).match(/(\d[\d.]*,\d{2}) kW \d[\d.]* BTU\/h/);
  expect(m, 'la app pinta la calefacción').not.toBeNull();
  return m![1];
}

type EntradaFaq = { name: string; acceptedAnswer: { text: string } };
async function faqJsonLd(page: Page): Promise<EntradaFaq[]> {
  for (const b of await page.locator('script[type="application/ld+json"]').allTextContents()) {
    const j = JSON.parse(b) as { '@type'?: string; mainEntity?: EntradaFaq[] };
    if (j['@type'] === 'FAQPage' && j.mainEntity) return j.mainEntity;
  }
  throw new Error('La página no lleva FAQPage en su JSON-LD');
}

async function featuresJsonLd(page: Page): Promise<string[]> {
  for (const b of await page.locator('script[type="application/ld+json"]').allTextContents()) {
    const j = JSON.parse(b) as { '@type'?: string; featureList?: string[] | string };
    if (j['@type'] === 'WebApplication') {
      const f = j.featureList ?? [];
      return Array.isArray(f) ? f : f.split(/,\s*/);
    }
  }
  throw new Error('La página no lleva WebApplication en su JSON-LD');
}

/** El texto de la guía educativa (está en el DOM aunque nazca plegada). */
async function textoGuia(page: Page): Promise<string> {
  return ((await page.locator('[data-guia-educativa]').textContent()) ?? '').replace(/\s+/g, ' ');
}

test.describe('Calculadora de Frigorías y BTU — lo que promete el <h1>', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Calculadora de Frigorías y BTU/);
    // El <h1> viaja en el HTML servido: está en pantalla antes de que la app responda a nada.
    await esperarHidratacion(page, [SUPERFICIE, ALTURA, OCUPANTES, EQUIPOS]);
  });

  test('ESTADO INICIAL · 20 m² × 2,5 m, cálido, 2 personas y 200 W = 2400 W = 2064 frig/h = 8189 BTU/h', async ({ page }) => {
    // 50 m³ × 40 = 2000 W + 200 + 200 = 2400 W · 2400 / 1,163 = 2063,6 · 2400 × 3,41214 = 8189,1
    // 9000 / 8189,1 − 1 = 9,9 % → «10 %» · 9000 BTU/h = 2637,6 W = 2268,0 frigorías
    // calor 20 × 75 = 1500 W → «1,50 kW» · 5118 BTU/h · consumo 300 … 533 W · 2063,6 / 20 = 103
    const t = await resultado(page);
    expect(t).toContain('2064 frigorías/h 8189 BTU/h · 2400 W');
    expect(t).toContain('Equipo equivalente: 9000 BTU (2268 frigorías), el primer tamaño comercial que cubre la carga, con un margen del 10 %.');
    expect(t).toContain('1,50 kW 5118 BTU/h');
    expect(t).toContain('0,30-0,53 kW');
    expect(t).toContain('50,0 m³ 103 frig/m²');
    expect(t).toContain('Volumen de aire (50,0 m³ × 40 W/m³) 2000 83 %');
    expect(t).toContain('Personas (2 × 100 W) 200 8 %');
    expect(t).toContain('Aparatos encendidos 200 8 %');
  });

  test('CASO 1 (normal) · 25 m² × «2,7» m, templado/frío, buen aislamiento, mucho sol y cristal, 3 personas y 300 W', async ({ page }) => {
    await poner(page, SUPERFICIE, '25');
    await poner(page, ALTURA, '2,7');
    await elegir(page, /^Templado/);
    await elegir(page, /^Frío/);
    await elegir(page, /^Bueno/);
    await elegir(page, /^Mucho sol/);
    await elegir(page, /^Mucha ventanal/);
    await poner(page, OCUPANTES, '3');
    await poner(page, EQUIPOS, '300');
    const t = await resultado(page);
    // 67,5 m³ × 30 = 2025 · × 1,089 = 2205,225 · + 300 + 300 = 2805,225 W
    expect(t).toContain('2412 frigorías/h 9572 BTU/h · 2805 W');
    expect(t).toContain('Equipo equivalente: 12.000 BTU (3024 frigorías), el primer tamaño comercial que cubre la carga, con un margen del 25 %.');
    // 25 × 75 × (2,7 / 2,5) × 1,1 (mucha cristal) = 2227,5 W → 7600,5 BTU/h. 2,2275 kW es un empate
    // exacto en la segunda decimal: el redondeo en coma flotante puede dar 2,22 o 2,23.
    expect(t).toMatch(/2,2[23] kW 7601 BTU\/h/);
    expect(t).toContain('0,35-0,62 kW');
    expect(t).toContain('67,5 m³ 96 frig/m²');
    expect(t).toContain('Desglose de los 2805 W de refrigeración');
    expect(t).toContain('Volumen de aire (67,5 m³ × 30 W/m³) 2025 72 %');
    expect(t).toContain('Corrección por aislamiento, sol, cristal y cubierta (×1,09) +180 6 %');
    expect(t).toContain('Personas (3 × 100 W) 300 11 %');
    expect(t).toContain('Aparatos encendidos 300 11 %');
    // Sin aviso de sobredimensionado: el margen (25 %) no pasa del 35 %.
    expect(t).not.toContain('Sobra potencia');
  });

  test('CASO 1 (normal) · las tres cifras son la misma potencia, según las definiciones de kcal y BTU', async ({ page }) => {
    // Con los vatios redondeados que pinta la app, las otras dos cifras no pueden diferir en más de
    // una unidad (más el medio vatio del redondeo) de W / 1,163 y W × 3600 / 1055,05585262.
    for (const [sup, alt] of [['25', '2,7'], ['60', '3'], ['12', '2,4']] as const) {
      await poner(page, SUPERFICIE, sup);
      await poner(page, ALTURA, alt);
      const t = await resultado(page);
      const m = t.match(/([\d.]+) frigorías\/h ([\d.]+) BTU\/h · ([\d.]+) W/);
      expect(m, `${sup} m² × ${alt} m: «${t}»`).not.toBeNull();
      const [frig, btu, w] = [m![1], m![2], m![3]].map((x) => Number(x.replace(/\./g, '')));
      expect(Math.abs(frig - w / W_POR_FRIGORIA), `${sup} m²: frigorías`).toBeLessThanOrEqual(1.5);
      expect(Math.abs(btu - w / W_POR_BTU_H), `${sup} m²: BTU/h`).toBeLessThanOrEqual(2);
    }
  });

  test('CASO 1 (normal) · la altura se lee con coma o con punto decimal: «3,2» y «3.2» = 64 m³ y 2960 W', async ({ page }) => {
    // parseSpanishNumber: una coma sola es decimal; un punto que no agrupa tres cifras, también.
    // 20 × 3,2 = 64 m³ × 40 = 2560 W + 400 = 2960 W
    for (const alt of ['3,2', '3.2']) {
      await poner(page, ALTURA, alt);
      const t = await resultado(page);
      expect(t, `altura «${alt}»`).toContain('2545 frigorías/h 10.100 BTU/h · 2960 W');
      expect(t, `altura «${alt}»`).toContain('64,0 m³');
    }
  });

  test('CASO 1 (normal) · «6.000» W son seis mil vatios (punto de millar español)', async ({ page }) => {
    // 2000 + 200 + 6000 = 8200 W
    await poner(page, EQUIPOS, '6.000');
    expect(await vatiosFrio(page)).toBe(8200);
    expect(await resultado(page)).toContain('Aparatos encendidos 6000 73 %');
  });

  test('CASO 2 (límite) · el máximo de cada control y todos los recargos: 146.759 W y ningún equipo doméstico', async ({ page }) => {
    await poner(page, SUPERFICIE, '300');
    await poner(page, ALTURA, '6');
    await elegir(page, /^Muy cálido/);
    await elegir(page, /^Muy frío/);
    await elegir(page, /^Escaso/);
    await elegir(page, /^Mucho sol/);
    await elegir(page, /^Mucha ventanal/);
    await activarCubierta(page);
    await poner(page, OCUPANTES, '30');
    await poner(page, EQUIPOS, '6000');
    const t = await resultado(page);
    // 1800 m³ × 50 = 90.000 · × 1,53065 = 137.758,5 · + 3000 + 6000 = 146.758,5 W
    expect(t).toContain('126.190 frigorías/h 500.761 BTU/h · 146.759 W');
    expect(t).toContain('La carga supera el mayor tamaño de equipo doméstico habitual');
    expect(t).not.toContain('Equipo equivalente');
    // 300 × 155 × (6 / 2,5) × 1,1 (cristal) × 1,1 (cubierta) = 135.036 W × 3,412142 = 460.762 BTU/h
    expect(t).toContain('135,04 kW 460.762 BTU/h');
    expect(t).toContain('18,34-32,61 kW');
    expect(t).toContain('1800,0 m³ 421 frig/m²');
    expect(t).toContain('Volumen de aire (1800,0 m³ × 50 W/m³) 90.000 61 %');
    expect(t).toContain('Corrección por aislamiento, sol, cristal y cubierta (×1,53) +47.759 33 %');
    expect(t).toContain('Personas (30 × 100 W) 3000 2 %');
    expect(t).toContain('Aparatos encendidos 6000 4 %');
  });

  test('CASO 2 (límite) · el mínimo: 4 m² × 2 m, templado, sin personas ni aparatos = 240 W y aviso de sobredimensionado', async ({ page }) => {
    await poner(page, SUPERFICIE, '4');
    await poner(page, ALTURA, '2');
    await elegir(page, /^Templado/);
    await poner(page, OCUPANTES, '0');
    await poner(page, EQUIPOS, '0');
    const t = await resultado(page);
    // 8 m³ × 30 = 240 W · 240 / 1,163 = 206,4 · 240 × 3,41214 = 818,9 · 9000 / 818,9 − 1 = 999 %
    expect(t).toContain('206 frigorías/h 819 BTU/h · 240 W');
    expect(t).toContain('Equipo equivalente: 9000 BTU (2268 frigorías)');
    expect(t).toContain('con un margen del 999 %.');
    expect(t).toContain('Ese tamaño comercial queda un 999 % por encima de lo calculado.');
    expect(t).toContain('0,24 kW 819 BTU/h'); // 4 × 75 × (2 / 2,5) = 240 W
    expect(t).toContain('0,03-0,05 kW');
    expect(t).toContain('8,0 m³ 52 frig/m²');
    expect(t).toContain('Personas (0 × 100 W) 0 0 %');
  });

  test('CASO 3 (rechazo) · cada valor fuera de rango da su aviso y ningún resultado', async ({ page }) => {
    const casos: [string, string, string, string][] = [
      [SUPERFICIE, '3', 'Introduce una superficie de entre 4 y 300 m².', '20'],
      [SUPERFICIE, '300,5', 'Introduce una superficie de entre 4 y 300 m².', '20'],
      [ALTURA, '7', 'Introduce una altura de entre 2 y 6 metros.', '2,5'],
      [ALTURA, '1,9', 'Introduce una altura de entre 2 y 6 metros.', '2,5'],
      [OCUPANTES, '-1', 'Introduce un número de ocupantes de entre 0 y 30.', '2'],
      [OCUPANTES, '31', 'Introduce un número de ocupantes de entre 0 y 30.', '2'],
      [EQUIPOS, '6001', 'Introduce una potencia de equipos de entre 0 y 6.000 W.', '200'],
    ];
    for (const [sel, valor, aviso, valido] of casos) {
      await poner(page, sel, valor);
      // Acotado al panel: getByRole('alert') a secas casa también con el anunciador de rutas de Next.
      await expect(panelResultado(page).getByRole('alert'), `${sel} = «${valor}»`).toContainText(aviso);
      expect(await resultado(page), `${sel} = «${valor}»`).not.toContain('frigorías/h');
      await poner(page, sel, valido);
      await expect(panelResultado(page).getByRole('alert')).toHaveCount(0);
    }
  });

  test('HALLAZGO 4970 · un campo vacío o que no es un número se rechaza, no da «No definido» ni «más de un equipo»', async ({ page }) => {
    // REPARADO (ahora pregunta Number.isFinite). Antes: la validación compara parseSpanishNumber(…) === null, pero parseSpanishNumber
    // devuelve NaN (nunca null) con lo que no es un número; NaN < 4 y NaN > 300 son falsos, así que
    // el aviso «Revisa los datos…» no sale nunca y la app calcula con NaN: «No definido frigorías/h»,
    // «No definido BTU/h · No definido W» y, como ningún tamaño es ≥ NaN, «La carga supera el mayor
    // tamaño de equipo doméstico habitual: la estancia pide más de un equipo». Con la altura vacía
    // muestra además una calefacción válida (1,50 kW) junto a la refrigeración «No definido».
    for (const [sel, valor, valido] of [
      [SUPERFICIE, '', '20'],
      [SUPERFICIE, '12abc', '20'],
      [SUPERFICIE, '20 m2', '20'],
      [ALTURA, '', '2,5'],
      [OCUPANTES, '', '2'],
      [EQUIPOS, '', '200'],
    ] as const) {
      await poner(page, sel, valor);
      const t = await resultado(page);
      expect(t, `${sel} = «${valor}»`).not.toContain('No definido');
      expect(t, `${sel} = «${valor}»`).not.toContain('más de un equipo');
      await expect(panelResultado(page).getByRole('alert'), `${sel} = «${valor}»`).toContainText(
        'Revisa los datos: hay algún campo vacío o que no es un número.',
      );
      await poner(page, sel, valido);
    }
  });

  test('HALLAZGO · con 2,5 personas el desglose no dice «3 × 100 W» junto a 250 W', async ({ page }) => {
    // ABIERTO: el campo admite decimales (0 a 30), la carga es 2,5 × 100 = 250 W, pero la fila
    // redondea el número de personas a cero decimales: «Personas (3 × 100 W) 250». Esperado: o se
    // rechazan las personas no enteras, o la fila dice «2,5 × 100 W».
    test.fail();
    await poner(page, OCUPANTES, '2,5');
    expect(await resultado(page)).not.toMatch(/Personas \(3 × 100 W\) 250/);
  });

  test('HALLAZGO 4971 · la calefacción crece con la altura del techo', async ({ page }) => {
    // REPARADO: los W/m² son los de un techo de 2,5 m y se escalan con la altura. 20 m² × 75 W/m²:
    // con 2 m, 1500 × 0,8 = 1200 W → «1,20 kW»; con 6 m, 1500 × 2,4 = 3600 W → «3,60 kW».
    // Antes: calor = superficie × W/m² × cubierta; la altura no entraba. 20 m² con 2 m y con 6 m dan
    // los dos «1,50 kW», mientras el frío pasa de 2000 a 5200 W. La propia app dice que el calor «se
    // escapa […] a través de la envolvente» (la superficie de muro se triplica con la altura) y que
    // «el volumen manda sobre los metros cuadrados»; su JSON-LD promete estimar la calefacción «a
    // partir de su superficie y altura». Esperado: más kW de calefacción con 6 m que con 2 m.
    await poner(page, ALTURA, '2');
    const con2m = await kwCalefaccion(page);
    await poner(page, ALTURA, '6');
    const con6m = await kwCalefaccion(page);
    expect(con6m, `2 m → ${con2m} kW · 6 m → ${con6m} kW`).not.toBe(con2m);
    expect(con2m).toBe('1,20');
    expect(con6m).toBe('3,60');
  });

  test('HALLAZGO 4971 · la calefacción crece con la superficie acristalada', async ({ page }) => {
    // REPARADO: el cristal corrige también la calefacción. Mucha: 1500 × 1,1 = 1650 W → «1,65 kW».
    // Antes: el cristal solo corregía el frío. Poca y mucha cristalera dan «1,50 kW» de calefacción,
    // y el FAQPage de la app afirma que «un metro cuadrado de ventana deja pasar varias veces más
    // calor que un metro cuadrado de pared»; su JSON-LD lista la superficie acristalada entre lo que
    // estima la carga «de refrigeración y de calefacción».
    await elegir(page, /^Poca una ventana/);
    const poca = await kwCalefaccion(page);
    await elegir(page, /^Mucha ventanal/);
    const mucha = await kwCalefaccion(page);
    expect(mucha, `poca → ${poca} kW · mucha → ${mucha} kW`).not.toBe(poca);
    expect(mucha).toBe('1,65');
  });

  test('HALLAZGO · la guía cuenta las correcciones con los factores que aplica la calculadora', async ({ page }) => {
    // ABIERTO: «Qué hacen las correcciones» dice «El aislamiento mueve la carga entre un 10 % arriba
    // y un 10 % abajo», pero «Escaso» multiplica por 1,15 (+15 %); y que una buhardilla mal aislada
    // con ventanal al oeste «puede pedir un 45 % más de potencia que una habitación interior», cuando
    // la propia app da ×1,53 (escaso × mucho sol × mucha cristal × cubierta = 1,15 × 1,1³ = 1,53065,
    // +53 % sobre la habitación neutra; +70 % sobre una interior con poco sol y poca cristal, ×0,9025).
    test.fail();
    await elegir(page, /^Escaso/);
    const soloEscaso = (await resultado(page)).match(/cubierta \(×(\d,\d{2})\)/);
    expect(soloEscaso).not.toBeNull();
    const subidaEscaso = Math.round((Number(soloEscaso![1].replace(',', '.')) - 1) * 100); // 15
    await elegir(page, /^Mucho sol/);
    await elegir(page, /^Mucha ventanal/);
    await activarCubierta(page);
    const buhardilla = (await resultado(page)).match(/cubierta \(×(\d,\d{2})\)/);
    expect(buhardilla).not.toBeNull();
    const subidaBuhardilla = Math.round((Number(buhardilla![1].replace(',', '.')) - 1) * 100); // 53

    const guia = await textoGuia(page);
    const dichoAislamiento = guia.match(/aislamiento mueve la carga entre un (\d+)\s%\sarriba/);
    expect(dichoAislamiento, 'la guía cifra la subida por aislamiento').not.toBeNull();
    expect(Number(dichoAislamiento![1]), 'subida por aislamiento escaso').toBe(subidaEscaso);
    const dichoBuhardilla = guia.match(/puede pedir un (\d+)\s%\smás de potencia/);
    expect(dichoBuhardilla, 'la guía cifra la buhardilla').not.toBeNull();
    expect(Number(dichoBuhardilla![1]), 'buhardilla frente a la habitación neutra').toBeGreaterThanOrEqual(subidaBuhardilla);
  });

  test('HALLAZGO · el FAQPage no atribuye a los techos de 3,2 m «casi un 30 % más de potencia»', async ({ page }) => {
    // ABIERTO: 3,2 / 2,5 = 1,28 es lo que crece el AIRE; la potencia que da la app para esa
    // habitación (20 m², valores por defecto) pasa de 2400 a 2960 W: +23 %, porque personas y
    // aparatos no crecen con la altura. Solo sin cargas internas se acerca al 28 %.
    test.fail();
    const w25 = await vatiosFrio(page);
    await poner(page, ALTURA, '3,2');
    const w32 = await vatiosFrio(page);
    expect(Math.round((w32 / w25 - 1) * 100), 'subida que da la app').toBe(23);
    const faq = (await faqJsonLd(page)).find((q) => /por metro cuadrado/.test(q.name));
    expect(faq).toBeDefined();
    expect(faq!.acceptedAnswer.text).not.toMatch(/casi un 30\s%\smás de potencia/);
  });

  test('HALLAZGO · el porcentaje va separado de la cifra con espacio duro (U+00A0)', async ({ page }) => {
    // ABIERTO: «con un margen del 10 %», la columna «Peso» («83 %») y el FAQPage («casi un 30 %»,
    // «un 10 %», «del 10 al 15 %») llevan un espacio normal (U+0020) antes del % (CLAUDE.md §2).
    test.fail();
    const panel = await panelResultado(page).innerText();
    expect(panel).not.toMatch(/\d %/);
    const faq = (await faqJsonLd(page)).map((q) => q.acceptedAnswer.text).join(' ');
    expect(faq).not.toMatch(/\d %/);
  });

  test('HALLAZGO · el conmutador «Bajo cubierta» lleva el rótulo del campo y no cambia de nombre', async ({ page }) => {
    // ABIERTO: el rótulo «Bajo cubierta» es un <span> suelto; el botón se anuncia «No, tiene vivienda
    // encima, no presionado» y, al pulsarlo, «Sí, es la última planta o un ático, presionado»: su
    // nombre cambia con el estado, lo que con aria-pressed se lee como doble negación (APG: el nombre
    // de un conmutador no cambia). Los cinco grupos de opciones tampoco tienen nombre de grupo.
    test.fail();
    await expect(conmutadorCubierta(page)).toHaveAccessibleName(/cubierta/i);
    await conmutadorCubierta(page).click();
    await expect(conmutadorCubierta(page)).toHaveAccessibleName(/cubierta/i);
    await expect(page.getByRole('group', { name: /Aislamiento/ })).toHaveCount(1);
  });

  test('HALLAZGO · las features del JSON-LD no prometen un conversor de kcal/h que la app no tiene', async ({ page }) => {
    // ABIERTO: «Conversión entre frigorías, BTU, kcal/h y vatios». La app no convierte un valor que
    // escriba el usuario: expresa SU resultado en frigorías/h, BTU/h y W, y kcal/h no aparece en el
    // panel de resultados.
    test.fail();
    const features = await featuresJsonLd(page);
    expect(features.length).toBeGreaterThanOrEqual(4);
    const prometeKcal = features.some((f) => /kcal/i.test(f));
    const muestraKcal = /kcal/i.test(await resultado(page));
    expect(prometeKcal && !muestraKcal, features.join(' | ')).toBe(false);
  });
});

test.describe('Lo que la app dice de las unidades', () => {
  test('FAQPage y guía · 1 frigoría/h = 1,163 W = 3,968 BTU/h y 1 BTU/h = 0,293 W, como sale de las definiciones', async ({ page }) => {
    await page.goto(RUTA);
    // 4186,8 / 3600 = 1,163 · 1,163 × 3600 / 1055,05585262 = 3,96832 · 1055,05585262 / 3600 = 0,293071
    expect(W_POR_FRIGORIA.toFixed(3)).toBe('1.163');
    expect((W_POR_FRIGORIA / W_POR_BTU_H).toFixed(3)).toBe('3.968');
    expect(W_POR_BTU_H.toFixed(3)).toBe('0.293');
    const faq = (await faqJsonLd(page)).find((q) => /BTU son una frigoría/.test(q.name));
    expect(faq).toBeDefined();
    expect(faq!.acceptedAnswer.text).toContain('3,968 BTU/h');
    expect(faq!.acceptedAnswer.text).toContain('1,163 vatios');
    const guia = await textoGuia(page);
    expect(guia).toContain('1,163 vatios');
    expect(guia).toContain('0,293 vatios');
    expect(guia).toContain('3,968 BTU');
  });
});
