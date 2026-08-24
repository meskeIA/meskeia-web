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
 * HALLAZGOS DEL INSPECTOR (24/08/2026) — REPARADOS el 24/08/2026, y estos tests los blindan.
 *   · 237 · Sin validación de entradas: peso 0 → «∞ W/kg» con el veredicto MÁS favorable de
 *     su escala («Profesional / Élite»); peso −70 → «-4,00 W/kg» con el más desfavorable. Los
 *     min/max del input son sugerencias del navegador, no una guarda. Ver CASO 3.
 *   · 238 · «A 8% de pendiente: W/kg ≈ VAM / 255». Resuelto a mano con el modelo de fuerzas
 *     para 78 kg totales, Crr 0,005, CdA 0,32 m²:
 *         θ = arctan(0,08) = 4,5739° → sen θ = 0,079746 · cos θ = 0,996815
 *         F_grav = 78·9,81·0,079746 = 61,02 N · F_rod = 0,005·78·9,81·0,996815 = 3,81 N
 *         280 W al pedal (273,0 a la rueda) → v = 4,0186 m/s → VAM = 1153,7 m/h
 *         ratio VAM/(W/kg) = 1153,7/4,0 = 288 para un ciclista de 70 kg con bici de 8;
 *         la regla de Ferrari, VAM = W/kg·(2+%/10)·100, da 280 a esa pendiente.
 *     El 255 corresponde al 5,5 %, y aplicado al 8 % sobreestimaba el rendimiento un 13 %.
 *   · 239 · La escala de VAM del bloque educativo iba DESFASADA UN ESCALÓN respecto al
 *     clasificador, de modo que la misma pantalla daba dos veredictos para 1200 m/h.
 *   · 240 · El h1 y las keywords ofrecían «calcular vatios» y el FTP en vatios era una
 *     ENTRADA obligatoria: la app dividía vatios ya conocidos entre kilos. Ahora hay un
 *     estimador por el modelo de fuerzas para quien no tiene potenciómetro.
 *   · 241 · Los dos <input type=range> llevaban aria-hidden pero conservaban tabIndex 0.
 *   · 242 · La app se declaraba exenta de disclaimer estando en la suite salud y pautando
 *     entrenamiento por zonas (Z4 de 10-20 min, Z5-Z6): Nivel 2 ALTO.
 *   · 243 · Cuando la VAM no se podía calcular, la tarjeta desaparecía sin decir por qué.
 *   · 244 · La tabla de zonas dejaba huecos: con FTP 280 W, 155 y 156 W no caían en ninguna.
 *   · 245 · El FTP del encabezado y los vatios de cada zona se interpolaban crudos, sin
 *     formatNumber().
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

    // HALLAZGO 239, reparado el 24/08/2026: el motor clasifica 1200 m/h como «Amateur fuerte»
    // (1200 no es < 1200, así que cae en el tramo < 1400) y el bloque educativo decía
    // «Semi-profesionales: 1.200–1.400 m/h». La misma pantalla emitía dos veredictos para el
    // mismo número; ahora la guía enuncia la escala del clasificador.
    await expect(resultados(page)).toContainText('Amateur fuerte');
    await page.locator('button:has-text("Ver Guía")').first().click();
    const textoGuia = await page.locator('body').innerText();
    expect(textoGuia).toContain('1.200–1.400, amateur fuerte');
    expect(textoGuia).not.toContain('Semi-profesionales: 1.200–1.400 m/h');
  });

  test('las 6 zonas salen de FTP · % / 100 redondeado al entero', async ({ page }) => {
    await calcular(page, { peso: '70', ftp: '280' });
    const tabla = resultados(page);

    await expect(tabla).toContainText('basadas en tu FTP: 280 W');
    // HALLAZGO 244, reparado el 24/08/2026: los cortes de Coggan son CONTIGUOS (menos de 55 %,
    // 55-75 %, 75-90 %…), y escribirlos como 0-55 / 56-75 / 76-90 dejaba vatios sin zona: con
    // FTP 280, ni 155 ni 156 W caían en ninguna. Ahora cada zona empieza donde acaba la anterior.
    await expect(tabla).toContainText('0 – 154 W');   // Z1: hasta round(280·0,55) = 154
    await expect(tabla).toContainText('155 – 210 W'); // Z2: hasta round(280·0,75) = 210
    await expect(tabla).toContainText('211 – 252 W'); // Z3: hasta round(280·0,90) = 252
    await expect(tabla).toContainText('253 – 294 W'); // Z4: hasta round(280·1,05) = 294
    await expect(tabla).toContainText('295 – 336 W'); // Z5: hasta round(280·1,20) = 336
    await expect(tabla).toContainText('337 – 420 W'); // Z6: hasta round(280·1,50) = 420

    // Y no queda ni un vatio huérfano entre dos zonas
    const rangos = await tabla.locator('td').filter({ hasText: /^d+ – d+ W$/ }).allTextContents();
    const limites = rangos.map((t) => t.match(/(d+) – (d+)/)!.slice(1, 3).map(Number));
    for (let i = 1; i < limites.length; i++) {
      expect(limites[i][0], `la zona ${i + 1} debe empezar donde acaba la anterior`).toBe(
        limites[i - 1][1] + 1,
      );
    }

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
    // Z6 con 280 W era 337 – 420 W; con 560 W debe ser 673 – 840 W: empieza justo donde acaba
    // Z5, round(560·1,20) = 672, y llega a round(560·1,50) = 840.
    await expect(resultados(page)).toContainText('673 – 840 W');
  });
});

test.describe('CASO 3 (rechazo) — entradas que no describen a ningún ciclista', () => {
  test('peso 0 kg: se rechaza con un aviso, sin publicar ningún veredicto', async ({
    page,
  }) => {
    // 280 W / 0 kg es una división por cero. Lo esperable es un aviso y ningún veredicto.
    await calcular(page, { peso: '', ftp: '280' });
    const texto = await page.locator('p[role="alert"]').innerText();
    await expect(page.locator('[role="region"][aria-label="Resultados de potencia"]')).toHaveCount(0);

    // HALLAZGO 237, reparado el 24/08/2026: publicaba «∞ W/kg» con el veredicto MÁS favorable
    // de su escala. Ahora el motor rechaza la entrada y la app lo dice.
    expect(texto).not.toContain('∞');
    expect(texto).not.toContain('Profesional / Élite');
    expect(texto).toContain('El peso debe ser un número mayor que 0 kg.');
  });

  test('peso negativo: mismo rechazo, sin «-4,00 W/kg» ni «Principiante»', async ({
    page,
  }) => {
    // 280 W / −70 kg = −4,00 W/kg: una potencia por kilo negativa no significa nada.
    await calcular(page, { peso: '-70', ftp: '280' });
    const texto = await page.locator('p[role="alert"]').innerText();
    await expect(page.locator('[role="region"][aria-label="Resultados de potencia"]')).toHaveCount(0);

    // Mismo hallazgo 237: un peso negativo daba «-4,00 W/kg» y el veredicto MÁS desfavorable.
    expect(texto).not.toContain('-4,00');
    expect(texto).toContain('El peso debe ser un número mayor que 0 kg.');
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
    // HALLAZGO 241, reparado el 24/08/2026: un control aria-hidden tiene que llevar además
    // tabIndex={-1} para salir del recorrido del tabulador (patrón axe «aria-hidden-focus»).
    expect(s.tabIndex).toBe(-1);
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

/**
 * HALLAZGO 240 — la promesa incumplida, reparada el 24/08/2026.
 *
 * El h1 («Calculadora de Vatios en Ciclismo») y las keywords («calcular vatios bicicleta»)
 * ofrecían obtener vatios, y el FTP en vatios era una ENTRADA obligatoria: quien buscaba
 * «cuántos vatios muevo» se encontraba un formulario que le exigía justo el dato que venía a
 * buscar. Ahora se estiman con el modelo de fuerzas.
 *
 * CASO RESUELTO A MANO — 78 kg totales a 14,467 km/h (4,0186 m/s) por una rampa del 8 %:
 *   θ = arctan(0,08) = 0,0798299 rad → sen θ = 0,0797469 · cos θ = 0,9968147
 *   F_grav = 78 · 9,80665 · 0,0797469 = 60,9975 N
 *   F_rod  = 0,005 · 78 · 9,80665 · 0,9968147 = 3,8126 N
 *   F_aero = ½ · 1,225 · 0,32 · 4,0186² = 3,1648 N
 *   P = (60,9975 + 3,8126 + 3,1648) · 4,0186 / 0,975 = 280 W
 *   VAM = 4,0186 · 0,0797469 · 3600 = 1153,6 m/h
 * El reparto es el que enseña la física de la escalada: casi todo contra la gravedad.
 */
test('el estimador da los vatios de quien no tiene potenciómetro', async ({ page }) => {
  await page.goto(RUTA);
  await page.getByRole('button', { name: /Estima tus vatios/i }).click();

  await page.fill('#masaTotal', '');
  await page.fill('#masaTotal', '78');
  await page.fill('#velocidad', '');
  await page.fill('#velocidad', '14.467');
  await page.fill('#pendiente', '');
  await page.fill('#pendiente', '8');
  await page.getByRole('button', { name: /Estimar vatios/i }).click();

  const tarjeta = page.locator('[role="status"]').filter({ hasText: 'Potencia estimada' });
  await expect(tarjeta).toContainText('280');
  await expect(tarjeta).toContainText('W');
  // El desglose: 251 W contra la gravedad, 16 de rodadura y 13 contra el aire
  await expect(tarjeta).toContainText('251 W contra la gravedad');
  await expect(tarjeta).toContainText('16 W de rodadura');
  await expect(tarjeta).toContainText('13 W contra el aire');
  // Y la VAM que corresponde a esa subida
  await expect(tarjeta).toContainText('1154 m/h');
  // Se dice que es una estimación y con qué supuestos
  await expect(tarjeta).toContainText('no sustituye a un potenciómetro');

  // En llano no hay VAM que dar, y el reparto se invierte: manda el aire
  await page.fill('#pendiente', '');
  await page.fill('#pendiente', '0');
  await page.fill('#velocidad', '');
  await page.fill('#velocidad', '30');
  await page.getByRole('button', { name: /Estimar vatios/i }).click();
  await expect(tarjeta).not.toContainText('de VAM');
  const desglose = await tarjeta.innerText();
  const [, gravedad] = desglose.match(/(\d+) W contra la gravedad/)!;
  const [, aire] = desglose.match(/(\d+) W contra el aire/)!;
  expect(Number(gravedad)).toBe(0);
  expect(Number(aire)).toBeGreaterThan(100); // a 30 km/h el aire ya es el grueso del esfuerzo
});

/**
 * HALLAZGO 243 — cuando la VAM no se puede calcular, se dice por qué. Antes la tarjeta
 * simplemente no aparecía: el usuario abría el plegable, rellenaba un campo, pulsaba
 * Calcular y no obtenía ni VAM ni explicación.
 */
test('si falta el tiempo o el desnivel, la VAM se explica en vez de desaparecer', async ({
  page,
}) => {
  await page.goto(RUTA);
  await page.getByRole('button', { name: /Calcular VAM/i }).click();

  // Desnivel sin tiempo
  await page.fill('#desnivel', '1500');
  await page.getByRole('button', { name: /Calcular potencia/i }).click();
  await expect(resultados(page)).toContainText('hacen falta los dos datos');

  // Con tiempo 0
  await page.fill('#tiempoMin', '0');
  await page.getByRole('button', { name: /Calcular potencia/i }).click();
  await expect(resultados(page)).toContainText('Indica un tiempo mayor que 0 minutos');

  // Y con los dos datos, la VAM aparece y el aviso se va
  await page.fill('#tiempoMin', '');
  await page.fill('#tiempoMin', '50');
  await page.getByRole('button', { name: /Calcular potencia/i }).click();
  await expect(resultados(page)).toContainText('1800'); // 1500 · 60 / 50
  await expect(resultados(page)).not.toContainText('hacen falta los dos datos');
});
