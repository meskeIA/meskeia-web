import { test, expect, Page } from '@playwright/test';

/**
 * Inspector — calculadora-potencia-ciclismo (segmento MOTOR de cálculo, riesgo 2, 96 usos)
 *
 * Primera inspección: 24/08/2026.
 *
 * QUÉ PROMETE
 *   <h1>: «🚴 Calculadora de Vatios en Ciclismo»
 *   subtítulo: «Cuántos vatios (watts) mueves y qué significan: FTP, W/kg y VAM para conocer
 *              tu nivel como ciclista»
 *   metadata/description: «Calcula tus vatios (watts) en ciclismo: ratio W/kg, zonas de
 *              entrenamiento por FTP y VAM en subidas cronometradas».
 *
 * QUÉ HACE DE VERDAD — y esto condiciona toda la inspección
 *   NO hay modelo físico de fuerzas. La app **no estima vatios**: el usuario introduce su
 *   FTP ya medido (en W) y la app hace tres cosas aritméticas sobre él. No existen aquí
 *   Crr, CdA, ρ, θ ni velocidad, así que las trampas clásicas del segmento —pendiente
 *   tratada como seno en vez de tangente, km/h sin convertir a m/s dentro del motor, viento
 *   sumado a la velocidad de avance— **no tienen dónde ocurrir**: no hay ningún término que
 *   las contenga. Lo que sí es comprobable a mano es la aritmética y los DATOS FÍSICOS que
 *   el bloque educativo afirma (ver HALLAZGOS ABIERTOS).
 *
 * DÓNDE VIVE EL CÁLCULO
 *   lib/calculadoras/deporte.ts → calcularPotenciaCiclismo(peso_kg, ftp_w, desnivel_m?, tiempo_min?)
 *     · wattsKg = Math.round((ftp_w / peso_kg) * 100) / 100        → W/kg = FTP / peso
 *     · nivel   = umbrales 1,5 / 2,5 / 3,5 / 4,5 / 5,5 W/kg (borde inferior INCLUSIVO)
 *     · vam     = Math.round((desnivel_m / tiempo_min) * 60)       → VAM (m/h) = D(m)·60/t(min)
 *                 solo si desnivel y tiempo están definidos Y tiempo_min > 0
 *     · nivelVam = umbrales 800 / 1000 / 1200 / 1400 / 1600 m/h
 *     · zonas   = 6 filas Coggan, wattsMin = round(ftp·pctMin/100), wattsMax = round(ftp·pctMax/100)
 *                 con pctMin/pctMax = 0-55, 56-75, 76-90, 91-105, 106-120, 121-150
 *   app/calculadora-potencia-ciclismo/page.tsx → solo la vista; W/kg y VAM pasan por
 *     formatNumber(); el FTP del encabezado y los vatios de la tabla se interpolan crudos.
 *
 * NOTA DE FORMATO: es-ES (CLDR minimumGroupingDigits = 2) NO agrupa los números de cuatro
 * cifras, así que un VAM de 1200 m/h se escribe «1200» y no «1.200». Es la convención
 * española correcta, no un fallo. Los decimales sí llevan coma: «4,00 W/kg».
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * LOS CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   CASO 1 (normal) — peso = 70 kg · FTP = 280 W · desnivel = 1000 m · tiempo = 50 min
 *       W/kg = FTP / peso = 280 W / 70 kg = 4,00 W/kg                    → «4,00»
 *              nivel: 3,5 ≤ 4,00 < 4,5 → «Amateur competitivo»
 *       VAM  = 1000 m / 50 min · 60 min/h = 20 m/min · 60 = 1200 m/h     → «1200»
 *              nivel según el motor: 1200 no es < 1200 → cae en < 1400 → «Amateur fuerte»
 *       Zonas con FTP = 280 W (round al entero):
 *              Z1  0–55 %  →   0   – 280·0,55 = 154        → «0 – 154 W»
 *              Z2 56–75 %  → 280·0,56 = 156,8 → 157 – 210  → «157 – 210 W»
 *              Z3 76–90 %  → 280·0,76 = 212,8 → 213 – 252  → «213 – 252 W»
 *              Z4 91–105 % → 280·0,91 = 254,8 → 255 – 294  → «255 – 294 W»
 *              Z5 106–120 %→ 280·1,06 = 296,8 → 297 – 336  → «297 – 336 W»
 *              Z6 121–150 %→ 280·1,21 = 338,8 → 339 – 420  → «339 – 420 W»
 *       CONTRASTE EXTERNO (el modelo físico que la app no implementa, resuelto a mano para
 *       saber si 280 W es una cifra sensata): ciclista 70 kg + bici 8 kg = 78 kg, en llano
 *       a 30 km/h = 8,3333 m/s, Crr = 0,005, CdA = 0,32 m², ρ = 1,225 kg/m³:
 *              F_rod  = Crr·m·g·cos0 = 0,005 · 78 kg · 9,81 m/s² · 1 =  3,826 N
 *              F_aero = ½·ρ·CdA·v²   = 0,5 · 1,225 · 0,32 · 69,44    = 13,611 N
 *              P_rueda = (3,826 + 13,611) N · 8,3333 m/s = 145,3 W ; /0,975 = 149 W al pedal
 *       Es decir, 149 W bastan para rodar a 30 km/h en llano: un FTP de 280 W es propio de
 *       un aficionado fuerte, que es justo lo que la app rotula. La cifra es coherente.
 *
 *   CASO 2 (límite) — denominador cero en la VAM: desnivel = 1500 m · tiempo = 0 min
 *       VAM = 1500 m / 0 min · 60 → división por cero: matemáticamente no está definida.
 *       Lo correcto es NO publicar ninguna VAM (jamás «∞» ni «NaN» ni un 0 fingido).
 *       El motor lo cubre con la guarda `tiempo_min > 0`, así que la tarjeta de VAM debe
 *       desaparecer entera mientras el W/kg (que no depende del tiempo) sigue en 4,00.
 *       Sonda de borde adjunta — peso = 80 kg · FTP = 280 W:
 *           W/kg = 280 / 80 = 3,50 exacto, justo en la frontera de dos niveles.
 *           El motor usa `< 3.5 → Amateur` y luego `< 4.5`, o sea borde inferior inclusivo:
 *           3,50 debe clasificarse «Amateur competitivo», igual que dice su tabla («3,5 – 4,5»).
 *       Sonda de linealidad adjunta — al doblar el FTP (70 kg, 560 W) el W/kg debe doblarse
 *       exactamente (8,00, no 4,00 ni 16,00) y cada límite de zona también: Z6 339–420 → 678–840.
 *
 *   CASO 3 (rechazo) — peso vaciado, que el navegador convierte en 0 kg
 *       W/kg = 280 W / 0 kg → división por cero. Un peso de 0 kg no describe a nadie: lo
 *       correcto es rechazar la entrada y avisar, nunca emitir un veredicto.
 *       Lo que la app hace: Math.round(Infinity·100)/100 = Infinity, y formatNumber devuelve
 *       «∞», que se pinta como «∞ W/kg» acompañado del badge «Profesional / Élite» y de
 *       «Nivel profesional internacional» — el veredicto MÁS favorable de la escala.
 *       Con peso = −70 kg sale «-4,00 W/kg» y badge «Principiante».
 *       Este fichero deja el hallazgo por escrito como testigo: el Inspector no repara.
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * HALLAZGOS ABIERTOS (el Inspector no repara). Los tests de abajo fijan el comportamiento
 * ACTUAL como TESTIGO: al reparar cualquiera de ellos el test se pondrá en rojo y habrá que
 * invertir la aserción marcada «TESTIGO DEL HALLAZGO».
 *   · Sin validación de entradas: peso 0 → «∞ W/kg» + «Profesional / Élite»; peso −70 →
 *     «-4,00 W/kg» + «Principiante». Los `min`/`max` del input son sugerencias del
 *     navegador, no hay guarda en calcularPotenciaCiclismo(). Ver CASO 3.
 *   · La escala de VAM del bloque educativo va DESFASADA UN ESCALÓN respecto al clasificador:
 *     el texto dice «Amateurs fuertes: 1.000–1.200 m/h. Semi-profesionales: 1.200–1.400 m/h»
 *     y el motor rotula 1000–1200 como «Amateur» y 1200–1400 como «Amateur fuerte»
 *     (reserva «Semi-profesional» para 1400–1600). Un VAM de 1200 recibe dos veredictos
 *     distintos en la misma página. Ver el testigo del CASO 1.
 *   · Dato físico del bloque educativo: «A 8% de pendiente: W/kg ≈ VAM / 255». Resuelto a
 *     mano con el modelo de fuerzas para 78 kg totales, Crr 0,005, CdA 0,32 m², ρ 1,2 kg/m³:
 *         θ = arctan(0,08) = 4,5739° → sen θ = 0,079746 · cos θ = 0,996815
 *         F_grav = 78·9,81·0,079746 = 61,02 N · F_rod = 0,005·78·9,81·0,996815 = 3,81 N
 *         para W/kg = 4,0 (280 W al pedal, 273,0 W a la rueda):
 *             273,0 = (61,02 + 3,81)·v + ½·1,2·0,32·v³  →  v = 4,0186 m/s
 *         VAM = v · sen θ · 3600 = 4,0186 · 0,079746 · 3600 = 1153,7 m/h
 *         ratio VAM/(W/kg) = 1153,7 / 4,0 = 288  (la regla clásica de Ferrari,
 *         VAM = W/kg·(2 + %/10)·100, da 280 a esa pendiente: coinciden dentro del 3 %)
 *     El 255 del texto corresponde a una pendiente del 5,5 %, no del 8 %. Aplicado a 8 %
 *     sobreestima el W/kg un 13 % (1153,7/255 = 4,52 en lugar de 4,00).
 *   · Los dos <input type="range"> llevan aria-hidden="true" pero conservan tabIndex 0: son
 *     alcanzables con el tabulador y mudos para el lector de pantalla (patrón
 *     aria-hidden-focus). Les falta tabIndex={-1}. Ver el test de accesibilidad.
 *   · La tabla de zonas deja huecos: con FTP 280 W, Z1 acaba en 154 W y Z2 empieza en 157 W,
 *     así que 155 y 156 W no pertenecen a ninguna zona (igual entre Z2 y Z3, y así todas).
 *     Sale de expresar los cortes Coggan como 55/56, 75/76… en vez de contiguos.
 *   · Promesa: el <h1>, la metadata y las keywords («calcular vatios bicicleta») ofrecen
 *     calcular vatios, pero el FTP en vatios es una ENTRADA obligatoria. La app divide
 *     vatios ya conocidos entre kilos; no estima potencia a partir de nada.
 *   · El page.tsx se declara `// @disclaimer: exempt` aunque la app está en la suite `salud`
 *     y pauta entrenamiento personalizado por zonas (Z4 de 10–20 min, Z5–Z6). La política
 *     sitúa «orientación de hábitos de salud o ejercicio» en Nivel 2 ALTO.
 *   · El FTP del encabezado de la tabla y los vatios de cada zona se interpolan crudos, sin
 *     formatNumber(). Dentro del rango declarado (≤ 600 W) coincide con lo que daría es-ES,
 *     así que hoy no se ve; pero el input acepta valores mayores sin protesta (FTP 1000 W
 *     se calcula y publica Z6 «1210 – 1500 W»).
 * ─────────────────────────────────────────────────────────────────────────────────────────
 */

const RUTA = '/calculadora-potencia-ciclismo/';

/** Rellena el formulario y pulsa «Calcular potencia». */
async function calcular(
  page: Page,
  datos: { peso?: string; ftp?: string; desnivel?: string; tiempo?: string },
): Promise<void> {
  if (datos.peso !== undefined) {
    await page.fill('#peso', '');
    if (datos.peso !== '') await page.fill('#peso', datos.peso);
  }
  if (datos.ftp !== undefined) {
    await page.fill('#ftp', '');
    if (datos.ftp !== '') await page.fill('#ftp', datos.ftp);
  }
  if (datos.desnivel !== undefined) await page.fill('#desnivel', datos.desnivel);
  if (datos.tiempo !== undefined) await page.fill('#tiempoMin', datos.tiempo);
  await page.getByRole('button', { name: /Calcular potencia/i }).click();
}

/** Abre el bloque plegable de la VAM (desnivel + tiempo). */
async function abrirVam(page: Page): Promise<void> {
  await page.getByRole('button', { name: /Calcular VAM/i }).click();
  await expect(page.locator('#desnivel')).toBeVisible();
}

/** La región de resultados; solo existe cuando ya se ha calculado. */
function resultados(page: Page) {
  return page.locator('[role="region"][aria-label="Resultados de potencia"]');
}

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  // La app es un client component: sin hidratación no hay cálculo que inspeccionar.
  await expect(page.locator('#peso')).toBeVisible();
  await expect(page.getByRole('button', { name: /Calcular potencia/i })).toBeEnabled();
});

test.describe('CASO 1 (normal) — 70 kg, FTP 280 W, 1000 m en 50 min', () => {
  test('W/kg = 280/70 = 4,00 y el nivel es «Amateur competitivo»', async ({ page }) => {
    await abrirVam(page);
    await calcular(page, { peso: '70', ftp: '280', desnivel: '1000', tiempo: '50' });

    // W/kg = FTP / peso = 280 W / 70 kg = 4,00 W/kg exacto.
    await expect(resultados(page)).toContainText('4,00');
    await expect(resultados(page)).toContainText('W/kg');
    // Umbrales del motor: 3,5 ≤ 4,00 < 4,5.
    await expect(resultados(page)).toContainText('Amateur competitivo');
  });

  test('VAM = 1000 m · 60 / 50 min = 1200 m/h', async ({ page }) => {
    await abrirVam(page);
    await calcular(page, { peso: '70', ftp: '280', desnivel: '1000', tiempo: '50' });

    // VAM (m/h) = desnivel (m) · 60 / tiempo (min) = 1000 · 60 / 50 = 1200 m/h.
    // es-ES no agrupa las cifras de cuatro dígitos: se escribe «1200», no «1.200».
    await expect(resultados(page)).toContainText('1200');
    await expect(resultados(page)).toContainText('m/h');

    // HALLAZGO ABIERTO: el motor clasifica 1200 m/h como «Amateur fuerte» (1200 no es < 1200,
    // así que cae en el tramo < 1400), mientras el bloque educativo de esta misma página
    // dice «Semi-profesionales: 1.200–1.400 m/h». Desfase de un escalón entre texto y motor.
    await expect(resultados(page)).toContainText('Amateur fuerte');
    await page.locator('button:has-text("Ver Guía")').first().click();
    const textoGuia = await page.locator('body').innerText();
    // TESTIGO DEL HALLAZGO: la guía sitúa 1.200–1.400 m/h en «Semi-profesionales» y el badge
    // de la misma pantalla acaba de decir «Amateur fuerte» para 1200. Cuando se armonicen las
    // dos escalas, esta aserción se pondrá en rojo: entonces hay que invertirla.
    expect(textoGuia).toContain('Semi-profesionales: 1.200–1.400 m/h');
  });

  test('las 6 zonas salen de FTP · % / 100 redondeado al entero', async ({ page }) => {
    await calcular(page, { peso: '70', ftp: '280' });
    const tabla = resultados(page);

    await expect(tabla).toContainText('basadas en tu FTP: 280 W');
    // Z1  0–55 %  → 0 – round(280·0,55 = 154)
    await expect(tabla).toContainText('0 – 154 W');
    // Z2 56–75 %  → round(280·0,56 = 156,8) = 157 – round(280·0,75 = 210)
    await expect(tabla).toContainText('157 – 210 W');
    // Z3 76–90 %  → round(212,8) = 213 – round(252) = 252
    await expect(tabla).toContainText('213 – 252 W');
    // Z4 91–105 % → round(254,8) = 255 – round(294) = 294
    await expect(tabla).toContainText('255 – 294 W');
    // Z5 106–120 %→ round(296,8) = 297 – round(336) = 336
    await expect(tabla).toContainText('297 – 336 W');
    // Z6 121–150 %→ round(338,8) = 339 – round(420) = 420
    await expect(tabla).toContainText('339 – 420 W');

    // Los nombres Coggan de cada zona, para que un renombrado no pase inadvertido.
    await expect(tabla).toContainText('Recuperación activa');
    await expect(tabla).toContainText('Umbral (FTP)');
    await expect(tabla).toContainText('VO2max');
  });

  test('formato español y unidades rotuladas: coma decimal, W, kg, min, m/h', async ({ page }) => {
    await abrirVam(page);
    await calcular(page, { peso: '70', ftp: '280', desnivel: '1000', tiempo: '50' });

    // formatNumber(4, 2) → «4,00»: coma decimal, nunca «4.00».
    const texto = await resultados(page).innerText();
    expect(texto).toContain('4,00');
    expect(texto).not.toContain('4.00');

    // Unidades de entrada rotuladas junto a cada campo.
    await expect(page.locator('main')).toContainText('kg');
    await expect(page.locator('main')).toContainText('W');
    await expect(page.locator('main')).toContainText('min');
  });
});

test.describe('CASO 2 (límite) — división por cero en la VAM y bordes de clasificación', () => {
  test('con tiempo = 0 min no se publica ninguna VAM (ni ∞ ni NaN)', async ({ page }) => {
    await abrirVam(page);
    await calcular(page, { peso: '70', ftp: '280', desnivel: '1500', tiempo: '0' });

    // VAM = 1500 / 0 · 60 no está definida: la guarda `tiempo_min > 0` retira la tarjeta.
    const texto = await resultados(page).innerText();
    expect(texto).not.toContain('m/h');
    expect(texto).not.toContain('∞');
    expect(texto).not.toContain('NaN');
    expect(texto).not.toContain('Infinity');
    // El W/kg, que no depende del tiempo, sigue calculándose: 280 / 70 = 4,00.
    expect(texto).toContain('4,00');
  });

  test('con el tiempo vacío tampoco se inventa una VAM', async ({ page }) => {
    await abrirVam(page);
    await calcular(page, { peso: '70', ftp: '280', desnivel: '1500', tiempo: '' });
    const texto = await resultados(page).innerText();
    expect(texto).not.toContain('m/h');
    expect(texto).toContain('4,00');
  });

  test('borde exacto: 280 W / 80 kg = 3,50 W/kg cae en «Amateur competitivo»', async ({ page }) => {
    // El motor corta con `< 3.5 → Amateur`, así que 3,50 pertenece ya al tramo superior,
    // igual que anuncia la tabla de la guía («Amateur competitivo: 3,5 – 4,5»).
    await calcular(page, { peso: '80', ftp: '280' });
    await expect(resultados(page)).toContainText('3,50');
    await expect(resultados(page)).toContainText('Amateur competitivo');
  });

  test('linealidad: al doblar el FTP se dobla el W/kg y se doblan las zonas', async ({ page }) => {
    // W/kg = FTP/peso es lineal en el FTP: 560 / 70 = 8,00 (el doble exacto de 4,00).
    await calcular(page, { peso: '70', ftp: '560' });
    await expect(resultados(page)).toContainText('8,00');
    await expect(resultados(page)).toContainText('Profesional / Élite');
    // Z6 con 280 W era 339 – 420 W; con 560 W debe ser 678 – 840 W (round(560·1,21) = 678).
    await expect(resultados(page)).toContainText('678 – 840 W');
  });
});

test.describe('CASO 3 (rechazo) — entradas que no describen a ningún ciclista', () => {
  test('HALLAZGO — peso 0 kg no se rechaza: publica «∞ W/kg» y «Profesional / Élite»', async ({
    page,
  }) => {
    // 280 W / 0 kg es una división por cero. Lo esperable es un aviso y ningún veredicto.
    await calcular(page, { peso: '', ftp: '280' });
    const texto = await resultados(page).innerText();

    // TESTIGO DEL HALLAZGO — lo que la app hace HOY. Lo correcto sería no calcular y avisar
    // («el peso debe ser mayor que 0»). Cuando se añada la validación, estas dos aserciones se
    // pondrán en rojo: entonces hay que sustituirlas por la comprobación del aviso.
    expect(texto).toContain('∞');
    expect(texto).toContain('Profesional / Élite');
  });

  test('HALLAZGO — peso negativo tampoco se rechaza: «-4,00 W/kg» y «Principiante»', async ({
    page,
  }) => {
    // 280 W / −70 kg = −4,00 W/kg: una potencia por kilo negativa no significa nada.
    await calcular(page, { peso: '-70', ftp: '280' });
    const texto = await resultados(page).innerText();

    // TESTIGO DEL HALLAZGO — mismo caso que el anterior: hoy se publica el veredicto en vez
    // de rechazar la entrada. Invertir estas aserciones cuando se valide el peso.
    expect(texto).toContain('-4,00');
    expect(texto).toContain('Principiante');
  });
});

test('accesibilidad — los sliders están ocultos al lector de pantalla pero se tabulan', async ({
  page,
}) => {
  // Los <input type="range"> son duplicados visuales de los <input type="number">, así que
  // llevan aria-hidden="true". Pero conservan tabIndex 0: un usuario de teclado aterriza en
  // un control que su lector de pantalla no anuncia (patrón axe «aria-hidden-focus»).
  const sliders = await page.evaluate(() =>
    [...document.querySelectorAll('input[type=range]')].map((r) => ({
      ariaHidden: r.getAttribute('aria-hidden'),
      tabIndex: (r as HTMLInputElement).tabIndex,
    })),
  );
  expect(sliders.length).toBe(2);
  for (const s of sliders) {
    expect(s.ariaHidden).toBe('true');
    // TESTIGO DEL HALLAZGO: un control aria-hidden debe llevar además tabIndex={-1} para no
    // quedar en el recorrido del tabulador. Al añadirlo, este 0 pasará a −1 y el test avisará.
    expect(s.tabIndex).toBe(0);
  }

  // Todos los botones con type explícito (regla de oro del CLAUDE.md) y el plegable de la
  // VAM exponiendo su estado con aria-expanded.
  const botones = await page.evaluate(() =>
    [...document.querySelectorAll('button')].map((b) => b.getAttribute('type')),
  );
  for (const t of botones) expect(t).toBe('button');
  await expect(page.getByRole('button', { name: /Calcular VAM/i })).toHaveAttribute(
    'aria-expanded',
    'false',
  );
});
