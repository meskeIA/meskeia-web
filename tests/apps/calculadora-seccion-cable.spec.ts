import { test, expect, type Page } from '@playwright/test';
import { esperarHidratacion, sembrarValor } from './_hidratacion';

/**
 * Calculadora de Sección de Cable — regresión del criterio de intensidad admisible (16/10/2026)
 *
 * ORIGEN: mensaje de contacto, «es imposible que 40 A pasen por un cable de 1,5». La app solo
 * aplicaba la caída de tensión: con 40 A en 5 m la caída es mínima y el titular decía
 * «Sección recomendada: 1,5 mm²». Ahora la recomendada es la mayor de caída e intensidad
 * admisible (REBT, ITC-BT-19, Tabla 1). Los números están resueltos a mano en la cabecera de
 * tests/seccion-cable-motor.spec.ts; aquí se comprueba que llegan a la pantalla.
 *
 *   40 A · 5 m · 230 V · cobre · método B
 *     PVC (columna 5): 1,5→15 · 2,5→21 · 4→27 · 6→36 · 10→50 A  → 10 mm²
 *     XLPE (columna 9): 21 · 29 · 38 · 49 A                      → 6 mm²
 *     Modo caída con 1,5 mm² instalados: admite 15 A → no aguanta los 40 A
 *     Aluminio: la Tabla 1 no lo recoge → solo «Sección por caída de tensión: 1,5 mm²»
 */

const veredicto = (page: Page) => page.locator('section[role="status"]');

async function caso40A5m(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Corriente (A)' }).click();
  await sembrarValor(page, '#corriente', 40);
  await sembrarValor(page, '#longitud', 5);
}

test.describe('calculadora-seccion-cable — intensidad admisible', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculadora-seccion-cable/');
    await esperarHidratacion(page, ['#tension', '#longitud']);
  });

  test('40 A en 5 m con PVC: 10 mm², no 1,5', async ({ page }) => {
    await caso40A5m(page);
    await expect(veredicto(page).locator('strong')).toHaveText('Sección recomendada: 10 mm²');
    await expect(veredicto(page)).toContainText('bastarían 1,5 mm²');
    await expect(veredicto(page)).toContainText('(50 A)');
  });

  test('con XLPE el mismo caso pide 6 mm²', async ({ page }) => {
    await caso40A5m(page);
    await page.getByRole('button', { name: 'XLPE o EPR' }).click();
    await expect(veredicto(page).locator('strong')).toHaveText('Sección recomendada: 6 mm²');
  });

  test('modo caída: 1,5 mm² instalados con 40 A no aguantan', async ({ page }) => {
    await caso40A5m(page);
    await page.getByRole('button', { name: /La caída de tensión/ }).click();
    await page.getByRole('button', { name: '1,5 mm²', exact: true }).click();
    await expect(veredicto(page).locator('strong')).toContainText('1,5 mm² no aguanta');
    await expect(veredicto(page)).toContainText('admite 15 A');
  });

  test('aluminio: sin tabla no hay sección recomendada', async ({ page }) => {
    await caso40A5m(page);
    await page.getByRole('button', { name: 'Aluminio', exact: true }).click();
    await expect(veredicto(page).locator('strong')).toHaveText(
      'Sección por caída de tensión: 1,5 mm²',
    );
    await expect(veredicto(page)).toContainText('No es una sección recomendada');
  });

  test('F y G solo se ofrecen en trifásico', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'B', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'F', exact: true })).toHaveCount(0);
    await page.getByRole('button', { name: 'Trifásico' }).click();
    await expect(page.getByRole('button', { name: 'F', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'G', exact: true })).toBeVisible();
  });
});

/**
 * INSPECCIÓN DEL 04/11/2026 (modo primera). Casos resueltos a mano ANTES de ejecutar la app.
 *
 * Fuentes, en www.boe.es (RD 842/2002, texto consolidado BOE-A-2002-18099):
 *   · ITC-BT-19, 2.2.3, Tabla 1 (la imagen /datos/imagenes/disp/2002/224/18099_image32.png):
 *     cotejada columna a columna con data/rebt-intensidades-admisibles.ts. Coinciden las 11
 *     columnas de valores, la columna de cada método y la nota 1) de F-XLPE y G-PVC.
 *   · ITC-BT-19, 2.2.2: «menor del 3 % de la tensión nominal para cualquier circuito interior
 *     de viviendas, y para otras instalaciones interiores o receptoras, del 3 % para alumbrado y
 *     del 5 % para los demás usos»; con transformador de distribución propio, «del 4,5 % para
 *     alumbrado y del 6,5 % para los demás usos». La ITC-BT-25 repite el 3 % para viviendas.
 *   · ITC-BT-15, 3 (derivación individual): 0,5 % con contadores concentrados en más de un
 *     lugar, 1 % con contadores totalmente concentrados y 1,5 % para un único usuario sin línea
 *     general de alimentación.
 *   · Conductividad del motor (no está en el BOE): cobre 48 (PVC, 70 °C) y 44 (XLPE, 90 °C),
 *     aluminio 30 y 28 m/(Ω·mm²).
 *
 *   CASO 1 — normal. Mono 230 V, 3.680 W, cos φ 1, 25 m, cobre PVC, método B, alumbrado 3 %
 *     I = 3.680/230 = 16 A · ΔV adm = 0,03·230 = 6,9 V
 *     S caída = 2·25·16/(48·6,9) = 800/331,2 = 2,41546 → 2,5 mm²
 *     Iz (B, PVC, 2 → columna 5): 1,5 → 15 < 16 · 2,5 → 21 → 2,5 mm². Los dos piden 2,5 mm²
 *     ΔV = 800/(48·2,5) = 6,66667 V (2,89855 %) · receptor 230 − 6,66667 = 223,333 V
 *     R = 25/(48·2,5) = 0,208333 Ω · pérdidas 2·16²·R = 106,667 W · ×8×365/1000 = 311,467 kWh
 *   CASO 1b — el mismo a 40 m: S = 1.280/552 = 2,31884 → 2,5 mm² con el 5 % (cae
 *     1.280/120 = 10,6667 V, 4,63768 %); con el 3 %, 1.280/331,2 = 3,86473 → 4 mm² (2,89855 %).
 *   CASO 2 — límite: el último valor de la columna. Tri 400 V, 360 A, 10 m, cobre PVC, B, 5 %
 *     ΔV adm = 20 V · S caída = √3·10·360/(48·20) = 6.235,383/960 = 6,49519 → 10 mm²
 *     Iz (B, PVC, 3 → columna 4): 240 → 315 < 360 · 300 → 360 → 300 mm² (Iz ≥ I es inclusivo)
 *     ΔV = 6.235,383/(48·300) = 0,43301 V (0,10825 %) · con 361 A ninguna sección vale
 *   CASO 2b — límite: aluminio, trifásico y cos φ 0,8. 20.000 W, 60 m, XLPE, 5 %
 *     I = 20.000/(√3·400·0,8) = 36,0844 A · √3·I·cos φ = P/V = 50
 *     S caída = 60·50/(28·20) = 5,35714 → 6 mm² · ΔV = 3.000/(28·6) = 17,8571 V (4,46429 %)
 *     Aluminio: la Tabla 1 solo trae cobre → «Sección por caída de tensión: 6 mm²»
 *   CASO 3 — rechazo. Potencia «0» o «-500»: el campo (mínimo 1) aplica 1 W y lo enseña en la
 *     etiqueta; «1.500» es mil quinientos, no 1,5: I = 1.500/230 = 6,52174 A.
 */

const fila = (page: Page, etiqueta: RegExp) =>
  page.locator('[class*="resultRow"]').filter({ hasText: etiqueta });

const panelCriterio = (page: Page) =>
  page
    .locator('section')
    .filter({ has: page.getByRole('heading', { name: 'Caída de tensión admisible' }) });

interface PreguntaFaq {
  pregunta: string;
  respuesta: string;
}

/** Las preguntas del FAQPage de la página, tal como las leen buscadores y asistentes. */
async function faqJsonLd(page: Page): Promise<PreguntaFaq[]> {
  return page.evaluate(() => {
    const salida: { pregunta: string; respuesta: string }[] = [];
    for (const s of Array.from(document.querySelectorAll('script[type="application/ld+json"]'))) {
      let datos: unknown;
      try {
        datos = JSON.parse(s.textContent ?? '');
      } catch {
        continue;
      }
      const nodos = (Array.isArray(datos) ? datos : [datos]) as Record<string, unknown>[];
      for (const n of nodos) {
        if (n['@type'] !== 'FAQPage') continue;
        const preguntas = (n.mainEntity ?? []) as { name: string; acceptedAnswer: { text: string } }[];
        for (const q of preguntas) salida.push({ pregunta: q.name, respuesta: q.acceptedAnswer.text });
      }
    }
    return salida;
  });
}

test.describe('calculadora-seccion-cable — inspección 04/11/2026', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculadora-seccion-cable/');
    await esperarHidratacion(page, ['#tension', '#longitud', '#cosphi', '#potencia']);
  });

  test('CASO 1 — 3.680 W en 25 m con el 3 %: 2,5 mm² por los dos criterios', async ({ page }) => {
    await sembrarValor(page, '#potencia', '3.680');
    // 25 m es el valor inicial: se comprueba en la etiqueta en vez de sembrarlo
    await expect(page.locator('label[for="longitud"]')).toContainText('25,0 m');
    await panelCriterio(page).getByRole('button', { name: /^Alumbrado/ }).click();
    await expect(veredicto(page).locator('strong')).toHaveText('Sección recomendada: 2,5 mm²');
    await expect(veredicto(page)).toContainText('Los dos criterios piden la misma sección');
    await expect(veredicto(page)).toContainText('admite 21 A');
    await expect(veredicto(page)).toContainText('2,90');
    await expect(fila(page, /^Corriente de cálculo/)).toContainText('16,00 A');
    await expect(fila(page, /^Sección teórica por caída/)).toContainText('2,42 mm²');
    await expect(fila(page, /^Caída/)).toContainText('6,67 V');
    await expect(fila(page, /^Tensión en el receptor/)).toContainText('223,3 V');
    await expect(fila(page, /^Resistencia/)).toContainText('0,2083 Ω');
    await expect(fila(page, /^Pérdida por efecto Joule/)).toContainText('106,7 W');
    await expect(fila(page, /^Equivale al año/)).toContainText('311,5 kWh');
  });

  test('CASO 1b — 3.680 W en 40 m: 2,5 mm² con el 5 % (cae 4,64) y 4 mm² con el 3 %', async ({
    page,
  }) => {
    await sembrarValor(page, '#potencia', '3680');
    await sembrarValor(page, '#longitud', 40);
    await panelCriterio(page).getByRole('button', { name: /^Otros usos/ }).click();
    await expect(veredicto(page).locator('strong')).toHaveText('Sección recomendada: 2,5 mm²');
    await expect(fila(page, /^Sobre la tensión nominal/)).toContainText('4,64');
    await panelCriterio(page).getByRole('button', { name: /^Alumbrado/ }).click();
    await expect(veredicto(page).locator('strong')).toHaveText('Sección recomendada: 4 mm²');
    await expect(fila(page, /^Sección teórica por caída/)).toContainText('3,86 mm²');
  });

  test('CASO 2 — trifásico, 360 A: el último valor de la columna 4 da 300 mm²; 361 A ya no cabe', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Trifásico' }).click();
    await page.getByRole('button', { name: 'Corriente (A)' }).click();
    await sembrarValor(page, '#corriente', 360);
    await sembrarValor(page, '#longitud', 10);
    await expect(veredicto(page).locator('strong')).toHaveText('Sección recomendada: 300 mm²');
    await expect(veredicto(page)).toContainText('bastarían 10 mm²');
    await expect(veredicto(page)).toContainText('es 300 mm² (360 A)');
    await expect(veredicto(page)).toContainText('0,11');
    await expect(fila(page, /^Sección teórica por caída/)).toContainText('6,50 mm²');

    await sembrarValor(page, '#corriente', 361);
    await expect(veredicto(page).locator('strong')).toHaveText(
      'La corriente supera la tabla de intensidades admisibles',
    );
    await expect(veredicto(page)).toContainText('el máximo es 360 A');
  });

  test('CASO 2b — aluminio trifásico con cos φ 0,8: 6 mm² solo por caída, sin recomendada', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Trifásico' }).click();
    await sembrarValor(page, '#potencia', '20.000');
    await sembrarValor(page, '#cosphi', 0.8);
    await sembrarValor(page, '#longitud', 60);
    await page.getByRole('button', { name: 'Aluminio', exact: true }).click();
    await page.getByRole('button', { name: 'XLPE o EPR' }).click();
    await expect(page.getByText('Conductividad aplicada: 28 m/(Ω·mm²)')).toBeVisible();
    await expect(veredicto(page).locator('strong')).toHaveText('Sección por caída de tensión: 6 mm²');
    await expect(veredicto(page)).toContainText('No es una sección recomendada');
    await expect(fila(page, /^Corriente de cálculo/)).toContainText('36,08 A');
    await expect(fila(page, /^Sección teórica por caída/)).toContainText('5,36 mm²');
    await expect(fila(page, /^Caída/)).toContainText('17,86 V');
    await expect(fila(page, /^Sobre la tensión nominal/)).toContainText('4,46');
  });

  test('CASO 3 — potencia 0 o negativa se aplica como 1 W; «1.500» es mil quinientos', async ({
    page,
  }) => {
    const etiqueta = page.locator('label[for="potencia"]');
    await sembrarValor(page, '#potencia', '0');
    await expect(etiqueta).toContainText('1 W');
    await expect(page.locator('#potencia')).toHaveAttribute('aria-invalid', 'true');
    await expect(fila(page, /^Corriente de cálculo/)).toContainText('0,00 A');
    await sembrarValor(page, '#potencia', '-500');
    await expect(etiqueta).toContainText('1 W');
    await sembrarValor(page, '#potencia', '1.500');
    await expect(etiqueta).toContainText('1500 W');
    await expect(fila(page, /^Corriente de cálculo/)).toContainText('6,52 A');
  });

  test('HALLAZGO (04/11/2026, ABIERTO) · vivienda: el REBT pide el 3 % en cualquier circuito y la app ofrece el 5 % «para tomas»', async ({
    page,
  }) => {
    // ITC-BT-19 2.2.2 (y ITC-BT-25): «menor del 3 % … para cualquier circuito interior de
    // viviendas». La app solo tiene «Alumbrado · 3 %» y «Otros usos · 5 %», que describe como
    // «Tomas de corriente y receptores de fuerza» y es el criterio inicial. Una toma de vivienda
    // de 3.680 W a 40 m sale con 2,5 mm² y cae el 4,64 % (CASO 1b); el REBT pide 4 mm²
    // (S = 1.280/(48·6,9) = 3,86473). Ni compensando con toda la derivación individual de un
    // único usuario (3 + 1,5 = 4,5 %) cabe el 4,64 %.
    test.fail();
    await sembrarValor(page, '#potencia', '3680');
    await sembrarValor(page, '#longitud', 40);
    const vivienda = panelCriterio(page).getByRole('button', { name: /vivienda[^%]*\b3(,0)?\s%/i });
    await expect(vivienda.first()).toBeVisible();
    await vivienda.first().click();
    await expect(veredicto(page).locator('strong')).toHaveText('Sección recomendada: 4 mm²');
  });

  test('HALLAZGO (04/11/2026, ABIERTO) · derivación individual: con contadores centralizados la ITC-BT-15 pide el 1 %, no el 1,5 %', async ({
    page,
  }) => {
    // La app ofrece «Derivación individual · 1,5 %» con la ayuda «Tramo entre la centralización
    // de contadores y el cuadro». ITC-BT-15, 3: 1 % con contadores totalmente concentrados,
    // 0,5 % si están concentrados en más de un lugar; el 1,5 % es para un único usuario SIN
    // línea general de alimentación, donde no hay centralización.
    // Mono 230 V, 40 A, 20 m, cobre PVC, B: con el 1,5 % → 3,45 V → 1.600/165,6 = 9,66184 →
    // 10 mm² (cae 1,45 %); con el 1 % → 2,3 V → 1.600/110,4 = 14,49275 → 16 mm² (Iz 66 A).
    test.fail();
    await page.getByRole('button', { name: 'Corriente (A)' }).click();
    await sembrarValor(page, '#corriente', 40);
    await sembrarValor(page, '#longitud', 20);
    const di = panelCriterio(page).getByRole('button', {
      name: /Derivaci[oó]n individual[^%]*\b1(,0)?\s%/,
    });
    await expect(di.first()).toBeVisible();
    await di.first().click();
    await expect(veredicto(page).locator('strong')).toHaveText('Sección recomendada: 16 mm²');
  });

  test('HALLAZGO (04/11/2026, ABIERTO) · el FAQPage da a la estación transformadora de abonado el 3 % y el 5 % y calla el 3 % de las viviendas', async ({
    page,
  }) => {
    // FAQPage: «para instalaciones alimentadas desde una estación transformadora de abonado, un
    // máximo del 3 % en circuitos de alumbrado y del 5 % en los demás usos». ITC-BT-19 2.2.2:
    // con transformador propio son el 4,5 % y el 6,5 %; el 3/5 % es de las demás instalaciones
    // que no son vivienda, y en vivienda es el 3 % en cualquier circuito.
    test.fail();
    const faq = await faqJsonLd(page);
    const caida = faq.find((q) => /caída de tensión se admite/i.test(q.pregunta));
    expect(caida, 'la pregunta sobre la caída admisible').toBeDefined();
    expect(caida?.respuesta).not.toMatch(/transformadora de abonado[^.]*del 3\s%/);
    expect(caida?.respuesta).toMatch(/vivienda/i);
  });

  test('HALLAZGO (04/11/2026, ABIERTO) · F con XLPE y 10 A: la tabla no da valores bajo 25 mm² y la app dice que 1,5 mm² «se calentaría»', async ({
    page,
  }) => {
    // Nota 1) de la Tabla 1: la columna 10 vale para F-XLPE «a partir de 25 mm² de sección»
    // (igual que la 9 para G-PVC). Por debajo la tabla no da valor para ese método: no dice que
    // 1,5 mm² se caliente con 10 A. La app recomienda 25 mm² (123 A) para
    // 10 A y afirma «con 10 A el cable se calentaría»; en modo caída, «2,5 mm² no aguanta 10 A:
    // el cable se calienta». Con el aluminio y los métodos sin columna dice «sin tabla».
    test.fail();
    await page.getByRole('button', { name: 'Trifásico' }).click();
    await page.getByRole('button', { name: 'Corriente (A)' }).click();
    await sembrarValor(page, '#corriente', 10);
    await sembrarValor(page, '#longitud', 5);
    await page.getByRole('button', { name: 'XLPE o EPR' }).click();
    await page.getByRole('button', { name: 'F', exact: true }).click();
    await expect(page.getByRole('button', { name: 'F', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(veredicto(page)).not.toContainText('se calentaría');
    await page.getByRole('button', { name: /La caída de tensión/ }).click();
    await page.getByRole('button', { name: '2,5 mm²', exact: true }).click();
    await expect(veredicto(page)).not.toContainText('se calienta');
  });

  test('HALLAZGO (04/11/2026, ABIERTO) · datos del REBT sin el RegionBadge «es-data» tras el hero', async ({
    page,
  }) => {
    // CLAUDE.md §1.bis: datos de referencia de España con metodología universal → RegionBadge
    // «es-data». La app usa la tabla y los porcentajes del REBT y solo lo dice dentro del aviso.
    test.fail();
    await expect(
      page.getByRole('note', { name: 'Aviso: los datos de referencia son de España' }),
    ).toHaveCount(1);
  });

  test('HALLAZGO (04/11/2026, ABIERTO) · el «%» va tras un espacio normal y no tras el duro (U+00A0)', async ({
    page,
  }) => {
    // CLAUDE.md global §2 (25/09/2026): «15 %» con espacio duro, para que el «%» no salte solo
    // de línea. El veredicto («la caída queda en el 2,76 %.»), la fila «Sobre la tensión
    // nominal» y los botones del criterio llevan U+0020.
    test.fail();
    const textos = [
      (await veredicto(page).textContent()) ?? '',
      (await fila(page, /^Sobre la tensión nominal/).textContent()) ?? '',
      ...(await panelCriterio(page).getByRole('button').allTextContents()),
    ];
    for (const t of textos) expect(t).not.toMatch(/\d %/);
    expect(textos[0]).toMatch(/\d %/);
  });
});
