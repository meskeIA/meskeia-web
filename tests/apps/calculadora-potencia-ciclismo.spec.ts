import { test, expect, Page, Locator } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * Inspector — calculadora-potencia-ciclismo (segmento MOTOR de cálculo, riesgo 2)
 *
 * Primera inspección: 24/08/2026 (9 hallazgos, 237–245).
 * Segunda inspección: 24/08/2026, DESPUÉS de repararlos todos — este fichero sustituye al
 * anterior: conserva sus casos válidos, corrige dos regex suyas que habían perdido los
 * escapes (`/^d+ – d+ W$/` no casaba nada y dejaba la comprobación de contigüidad INERTE) y
 * añade los bordes que la reparación introdujo.
 * Tercera: 31/08/2026 (sin hallazgos). Cuarta: 30/09/2026, re-inspección completa tras los lotes
 * del catálogo (cabeceras de tabla, logo sobre el hero) — su bloque va al final del fichero.
 *
 * QUÉ PROMETE
 *   <h1>: «🚴 Calculadora de Vatios en Ciclismo»
 *   subtítulo: «Cuántos vatios (watts) mueves y qué significan: FTP, W/kg y VAM para conocer
 *              tu nivel como ciclista»
 *   metadata: «Calcula tus vatios (watts) en ciclismo: ratio W/kg, zonas de entrenamiento
 *              por FTP y VAM en subidas cronometradas».
 *
 * QUÉ HACE DE VERDAD — ahora son DOS motores en la misma pantalla
 *   A) Aritmética sobre un FTP que el usuario ya tiene medido: W/kg, nivel, zonas y VAM.
 *   B) Estimador por MODELO DE FUERZAS para quien no tiene potenciómetro (añadido al reparar
 *      el hallazgo 240): a partir de masa total, velocidad y pendiente devuelve los vatios.
 *      Aquí sí hay física verificable, y aquí sí pueden ocurrir las trampas del segmento
 *      (pendiente tratada como seno en vez de tangente, km/h sin convertir, rodadura sin
 *      cos θ). Ninguna ocurre: ver CASO 1.
 *
 * DÓNDE VIVE EL CÁLCULO — lib/calculadoras/deporte.ts
 *   calcularPotenciaCiclismo(peso_kg, ftp_w, desnivel_m?, tiempo_min?)
 *     · lanza si peso ≤ 0 o FTP ≤ 0 (reparación del hallazgo 237)
 *     · wattsKg  = round((ftp/peso)·100)/100 ; nivel con cortes 1,5 / 2,5 / 3,5 / 4,5 / 5,5
 *     · vam      = round(desnivel·60/tiempo) solo con desnivel > 0 y tiempo > 0;
 *                  nivelVam con cortes 800 / 1000 / 1200 / 1400 / 1600 m/h
 *     · zonas    = 6 filas Coggan por LÍMITE SUPERIOR (55/75/90/105/120/150 % del FTP) y
 *                  wattsMin = límite anterior + 1 (reparación del hallazgo 244)
 *   calcularVatiosPorFuerzas({ masaTotal_kg, velocidad_kmh, pendiente_pct })
 *     · P = (m·g·sen θ + Crr·m·g·cos θ + ½·ρ·CdA·v²)·v / η   con θ = arctan(pendiente/100)
 *     · G 9,80665 · Crr 0,005 · CdA 0,32 m² · ρ 1,225 kg/m³ · η 0,975
 *     · VAM = v·sen θ·3600, solo con pendiente > 0
 *
 * NOTA DE FORMATO: es-ES (CLDR minimumGroupingDigits = 2) NO agrupa los números de cuatro
 * cifras, así que una VAM de 1200 m/h se escribe «1200» y no «1.200». Es la convención
 * española correcta, no un fallo. Los decimales sí llevan coma: «4,00 W/kg».
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * LOS TRES CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   CASO 1 (normal) — los dos motores, y el puente entre ellos
 *     1a · peso 70 kg · FTP 280 W
 *          W/kg = 280 / 70 = 4,00 exacto → «4,00 W/kg»; 3,5 ≤ 4,00 < 4,5 → «Amateur competitivo»
 *          Zonas = límites superiores 55/75/90/105/120/150 % de 280 W:
 *              154 · 210 · 252 · 294 · 336 · 420, y cada zona empieza en el anterior + 1:
 *              Z1 0–154 · Z2 155–210 · Z3 211–252 · Z4 253–294 · Z5 295–336 · Z6 337–420
 *     1b · estimador: 78 kg totales · 14,46 km/h · pendiente 8 %
 *          v = 14,46 / 3,6 = 4,016667 m/s
 *          θ = arctan(0,08) → sen θ = 0,0797453 · cos θ = 0,9968153
 *          F_grav = 78 · 9,80665 · 0,0797453               = 60,999 N
 *          F_rod  = 0,005 · 78 · 9,80665 · 0,9968153       =  3,812 N
 *          F_aero = ½ · 1,225 · 0,32 · 4,016667²           =  3,162 N
 *          P = (60,999 + 3,812 + 3,162) · 4,016667 / 0,975 = 273,03 / 0,975 = 280,0 W
 *          Reparto: 251 W gravedad · 16 W rodadura · 13 W aire (suman 280)
 *          VAM = 4,016667 · 0,0797453 · 3600 = 1153,1 → 1153 m/h
 *          EL PUENTE: esos 280 W en un ciclista de 70 kg son 4,00 W/kg, y 1153 / 288 = 4,00.
 *          Es decir, el motor de fuerzas confirma el 288 que el bloque educativo afirma para
 *          el 8 % de pendiente (hallazgo 238: antes decía 255, que es el factor del 5,5 %).
 *
 *   CASO 2 (límite) — el corte 1200 m/h de la escala de VAM, por los DOS lados
 *          desnivel 1000 m en 50 min → VAM = 1000 · 60 / 50 = 1200 exacto.
 *            El motor corta con `< 1200 → Amateur`, así que 1200 pertenece ya al tramo
 *            siguiente: «Amateur fuerte». La guía de la misma página debe decir lo mismo
 *            (hallazgo 239: iba desfasada un escalón y llamaba a 1200 «Semi-profesional»).
 *          desnivel 999 m en 50 min → VAM = 1198,8 → 1199 → «Amateur». Un metro menos de
 *            desnivel no puede saltar dos niveles.
 *          Bordes hermanos: 280 W / 80 kg = 3,50 exacto → «Amateur competitivo» (borde
 *            inferior inclusivo, igual que su tabla); 244 W / 70 kg = 3,49 → «Amateur».
 *          Y la contigüidad de las zonas: con FTP 280 W ningún vatio entre 0 y 420 puede
 *            quedarse sin zona (hallazgo 244: 155 y 156 W no caían en ninguna).
 *
 *   CASO 3 (rechazo) — entradas que no describen a ningún ciclista
 *          peso vaciado (el navegador lo convierte en 0 kg) → 280 / 0 no está definido.
 *          peso −70 kg → −4,00 W/kg no significa nada. FTP 0 W → tampoco.
 *          velocidad 0 km/h en el estimador → P = 0 trivial, no una estimación.
 *          Lo correcto es rechazar y avisar; JAMÁS emitir un veredicto (hallazgo 237: peso 0
 *          daba «∞ W/kg» con el veredicto MÁS favorable de la escala).
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * ESTADO DE LOS 9 HALLAZGOS DE LA PRIMERA INSPECCIÓN (verificado el 24/08/2026)
 *   237 validación de entradas ......... REPARADO (CASO 3)
 *   238 «W/kg = VAM / 255» al 8 % ...... REPARADO: ahora 280 (Ferrari) y 288 (fuerzas), y el
 *                                        288 lo confirma el propio estimador (CASO 1b)
 *   239 escala de VAM desfasada ........ REPARADO (CASO 2)
 *   240 promesa incumplida ............. REPARADO con el estimador por fuerzas (CASO 1b); el
 *                                        FAQ y la tarjeta «Sin potenciómetro» se quedaron
 *                                        atrás (hallazgo 256, REPARADO el 24/08/2026)
 *   241 sliders aria-hidden tabulables . REPARADO (bloque de accesibilidad)
 *   242 disclaimer exento .............. REPARADO: DisclaimerCard médico, severidad alta y no
 *                                        colapsable; ya no hay «@disclaimer: exempt»
 *   243 VAM que desaparecía sin decirlo . REPARADO (CASO 2); con desnivel 0 quedó a medias
 *                                        (hallazgo 255, REPARADO el 24/08/2026)
 *   244 huecos entre zonas ............. REPARADO (CASO 1a y 2); dejó un borde nuevo en FTP
 *                                        absurdamente bajos (hallazgo 254, REPARADO el 24/08/2026)
 *   245 vatios sin formatNumber() ...... REPARADO; la mitad del rango declarado quedó
 *                                        pendiente (hallazgo 253, REPARADO el 24/08/2026)
 *
 * Los hallazgos 252-256 de la segunda inspección estuvieron marcados con `test.fail()` y ya
 * no lo llevan: se repararon el 24/08/2026 y quedan como regresión. Los ABIERTOS de la
 * re-inspección del 30/09/2026 van en su bloque, al final, con `test.fail()`: afirman lo que
 * DEBERÍA pasar, así que hoy fallan a propósito.
 * ─────────────────────────────────────────────────────────────────────────────────────────
 */

const RUTA = '/calculadora-potencia-ciclismo/';

/** Rellena el formulario principal y pulsa «Calcular potencia». */
async function calcular(
  page: Page,
  datos: { peso?: string; ftp?: string; desnivel?: string; tiempo?: string },
): Promise<void> {
  for (const [selector, valor] of [
    ['#peso', datos.peso],
    ['#ftp', datos.ftp],
    ['#desnivel', datos.desnivel],
    ['#tiempoMin', datos.tiempo],
  ] as const) {
    if (valor === undefined) continue;
    await page.fill(selector, '');
    if (valor !== '') await page.fill(selector, valor);
  }
  await page.getByRole('button', { name: /Calcular potencia/i }).click();
}

/** Abre el plegable de la VAM (desnivel + tiempo). */
async function abrirVam(page: Page): Promise<void> {
  await page.getByRole('button', { name: /Calcular VAM/i }).click();
  await expect(page.locator('#desnivel')).toBeVisible();
}

/** Abre el estimador por modelo de fuerzas y devuelve su tarjeta de resultado. */
async function abrirEstimador(page: Page) {
  await page.getByRole('button', { name: /Estima tus vatios/i }).click();
  await expect(page.locator('#masaTotal')).toBeVisible();
  // El rótulo de la tarjeta cambia según el caso: «Potencia estimada» en llano y en subida,
  // «No hace falta pedalear» cuando la gravedad sostiene la marcha (hallazgo 252). El locator
  // no puede depender de lo que precisamente se está comprobando.
  return page.locator('[role="status"]').filter({ hasText: /Potencia estimada|No hace falta pedalear/ });
}

/** Rellena el estimador y pulsa «Estimar vatios». */
async function estimar(
  page: Page,
  datos: { masa?: string; velocidad?: string; pendiente?: string },
): Promise<void> {
  for (const [selector, valor] of [
    ['#masaTotal', datos.masa],
    ['#velocidad', datos.velocidad],
    ['#pendiente', datos.pendiente],
  ] as const) {
    if (valor === undefined) continue;
    await page.fill(selector, '');
    if (valor !== '') await page.fill(selector, valor);
  }
  await page.getByRole('button', { name: /Estimar vatios/i }).click();
}

/** La región de resultados; solo existe cuando ya se ha calculado. */
function resultados(page: Page) {
  return page.locator('[role="region"][aria-label="Resultados de potencia"]');
}

/** Los rangos «min – max W» de la tabla de zonas, ya convertidos a números. */
async function rangosDeZona(page: Page): Promise<[number, number][]> {
  const celdas = await resultados(page).locator('td').allTextContents();
  return celdas
    .map((t) => t.trim().match(/^(\d+) – (\d+) W$/))
    .filter((m): m is RegExpMatchArray => m !== null)
    .map((m) => [Number(m[1]), Number(m[2])]);
}

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  // La app es un client component: sin hidratación no hay cálculo que inspeccionar. Que el
  // campo se vea no basta (viaja en el HTML del servidor): se espera a que React lo controle.
  await esperarHidratacion(page, ['#peso', '#ftp']);
  await expect(page.locator('#peso')).toBeVisible();
  await expect(page.getByRole('button', { name: /Calcular potencia/i })).toBeEnabled();
});

test.describe('CASO 1 (normal) — 70 kg con FTP 280 W, y los mismos 280 W por el modelo de fuerzas', () => {
  test('W/kg = 280 / 70 = 4,00 y el nivel es «Amateur competitivo»', async ({ page }) => {
    await calcular(page, { peso: '70', ftp: '280' });

    // 280 W / 70 kg = 4,00 W/kg exacto. Cortes del motor: 3,5 ≤ 4,00 < 4,5.
    await expect(resultados(page)).toContainText('4,00');
    await expect(resultados(page)).toContainText('W/kg');
    await expect(resultados(page)).toContainText('Amateur competitivo');
    await expect(resultados(page)).toContainText('Competición aficionado');

    // formatNumber(4, 2) → «4,00»: coma decimal, nunca «4.00».
    expect(await resultados(page).innerText()).not.toContain('4.00');
  });

  test('las 6 zonas Coggan salen de FTP · límite / 100 y no dejan ni un vatio huérfano', async ({
    page,
  }) => {
    await calcular(page, { peso: '70', ftp: '280' });
    const tabla = resultados(page);

    // HALLAZGO 245, reparado: el FTP del encabezado pasa por formatNumber().
    await expect(tabla).toContainText('basadas en tu FTP: 280 W');

    // Límites superiores de Coggan sobre 280 W: 55 % = 154 · 75 % = 210 · 90 % = 252 ·
    // 105 % = 294 · 120 % = 336 · 150 % = 420. Cada zona arranca en el anterior + 1.
    await expect(tabla).toContainText('0 – 154 W');
    await expect(tabla).toContainText('155 – 210 W');
    await expect(tabla).toContainText('211 – 252 W');
    await expect(tabla).toContainText('253 – 294 W');
    await expect(tabla).toContainText('295 – 336 W');
    await expect(tabla).toContainText('337 – 420 W');

    // HALLAZGO 244, reparado: escritos como 0-55 / 56-75 / 76-90, 155 y 156 W no caían en
    // ninguna zona (y así en los cinco cortes). Esta comprobación es la que estaba INERTE en
    // el fichero anterior por una regex sin escapes.
    const rangos = await rangosDeZona(page);
    expect(rangos.length).toBe(6);
    for (let i = 1; i < rangos.length; i++) {
      expect(rangos[i][0], `la zona ${i + 1} debe empezar donde acaba la anterior`).toBe(
        rangos[i - 1][1] + 1,
      );
    }

    await expect(tabla).toContainText('Recuperación activa');
    await expect(tabla).toContainText('Umbral (FTP)');
    await expect(tabla).toContainText('VO2max');
  });

  test('el estimador por fuerzas da 280 W a 14,46 km/h por una rampa del 8 %', async ({ page }) => {
    // HALLAZGO 240, reparado: el h1 prometía «calcular tus vatios» y el FTP en vatios era una
    // ENTRADA obligatoria. Este estimador es el modelo de fuerzas resuelto a mano arriba:
    //   F_grav 60,999 N + F_rod 3,812 N + F_aero 3,162 N = 67,973 N
    //   P = 67,973 N · 4,016667 m/s / 0,975 = 280,0 W
    const tarjeta = await abrirEstimador(page);
    await estimar(page, { masa: '78', velocidad: '14.46', pendiente: '8' });

    await expect(tarjeta).toContainText('280 W');
    // Reparto: la pendiente se toma como TANGENTE (θ = arctan 0,08) y la rodadura lleva cos θ.
    await expect(tarjeta).toContainText('251 W contra la gravedad');
    await expect(tarjeta).toContainText('16 W de rodadura');
    await expect(tarjeta).toContainText('13 W contra el aire');
    // VAM = v · sen θ · 3600 = 4,016667 · 0,0797453 · 3600 = 1153,1 m/h
    await expect(tarjeta).toContainText('1153 m/h');
    await expect(tarjeta).toContainText('no sustituye a un potenciómetro');
  });

  test('en llano manda el aire: 149 W a 30 km/h, y no hay VAM que dar', async ({ page }) => {
    // v = 30 / 3,6 = 8,333 m/s · sen 0 = 0 → sin componente de gravedad
    //   F_rod  = 0,005 · 78 · 9,80665 = 3,825 N → 33 W
    //   F_aero = ½ · 1,225 · 0,32 · 8,333² = 13,611 N → 116 W
    //   P = (3,825 + 13,611) · 8,333 / 0,975 = 149,0 W
    const tarjeta = await abrirEstimador(page);
    await estimar(page, { masa: '78', velocidad: '30', pendiente: '0' });

    await expect(tarjeta).toContainText('149 W');
    await expect(tarjeta).toContainText('0 W contra la gravedad');
    await expect(tarjeta).toContainText('33 W de rodadura');
    await expect(tarjeta).toContainText('116 W contra el aire');
    // En llano no se sube nada: la frase de la VAM no debe aparecer.
    await expect(tarjeta).not.toContainText('de VAM');
  });

  test('el 288 que afirma la guía es el que da su propio motor de fuerzas', async ({ page }) => {
    // HALLAZGO 238, reparado: decía «al 8 % W/kg = VAM / 255», que es el factor del 5,5 % y
    // sobreestimaba el rendimiento un 13 %. El puente se cierra con los dos motores:
    //   estimador → 280 W y 1153 m/h para 78 kg totales al 8 %
    //   principal → 280 W en un ciclista de 70 kg = 4,00 W/kg
    //   ratio     → 1153 / 4,00 = 288
    const tarjeta = await abrirEstimador(page);
    await estimar(page, { masa: '78', velocidad: '14.46', pendiente: '8' });
    const texto = await tarjeta.innerText();
    const vatios = Number(texto.match(/(\d+) W/)![1]);
    const vam = Number(texto.match(/([\d.]+) m\/h/)![1]);
    expect(vatios).toBe(280);
    expect(vam).toBe(1153);
    expect(vam / (vatios / 70)).toBeGreaterThan(285);
    expect(vam / (vatios / 70)).toBeLessThan(291);

    await page.getByRole('button', { name: /Ver guía educativa/i }).click();
    const guia = await page.locator('main').innerText();
    expect(guia).toContain('W/kg ≈ VAM / 280');
    expect(guia).toContain('288');
    expect(guia).not.toContain('VAM / 255');
  });
});

test.describe('CASO 2 (límite) — el corte 1200 m/h de la escala de VAM, por los dos lados', () => {
  test('1000 m en 50 min son 1200 m/h exactos y el nivel es «Amateur fuerte»', async ({ page }) => {
    await abrirVam(page);
    await calcular(page, { peso: '70', ftp: '280', desnivel: '1000', tiempo: '50' });

    // VAM = desnivel · 60 / tiempo = 1000 · 60 / 50 = 1200 m/h.
    // es-ES no agrupa las cifras de cuatro dígitos: se escribe «1200», no «1.200».
    await expect(resultados(page)).toContainText('1200 m/h');
    // El motor corta con `< 1200 → Amateur`: 1200 cae ya en el tramo siguiente.
    await expect(resultados(page)).toContainText('Amateur fuerte');

    // HALLAZGO 239, reparado: la guía de la misma página situaba 1200 m/h en
    // «Semi-profesionales: 1.200–1.400 m/h», así que una sola pantalla daba dos veredictos.
    await page.getByRole('button', { name: /Ver guía educativa/i }).click();
    const guia = await page.locator('main').innerText();
    expect(guia).toContain('1.200–1.400, amateur fuerte');
    expect(guia).toContain('1.400–1.600, semi-profesional');
    expect(guia).not.toContain('Semi-profesionales: 1.200-1.400 m/h');
  });

  test('un metro menos de desnivel no puede saltar dos niveles: 999 m son 1199 m/h y «Amateur»', async ({
    page,
  }) => {
    await abrirVam(page);
    await calcular(page, { peso: '70', ftp: '280', desnivel: '999', tiempo: '50' });

    // 999 · 60 / 50 = 1198,8 → round → 1199 m/h, justo por debajo del corte.
    await expect(resultados(page)).toContainText('1199 m/h');
    await expect(resultados(page)).toContainText('Amateur');
    await expect(resultados(page)).not.toContainText('Amateur fuerte');
  });

  test('bordes hermanos del W/kg: 3,50 es «Amateur competitivo» y 3,49 es «Amateur»', async ({
    page,
  }) => {
    // 280 / 80 = 3,50 exacto. El corte es `< 3.5 → Amateur`, o sea borde inferior inclusivo,
    // igual que anuncia su tabla («Amateur competitivo: 3,5 – 4,5»).
    await calcular(page, { peso: '80', ftp: '280' });
    await expect(resultados(page)).toContainText('3,50');
    await expect(resultados(page)).toContainText('Amateur competitivo');

    // 244 / 70 = 3,4857 → se redondea a 3,49 y se clasifica con el valor ya redondeado, de
    // modo que la cifra en pantalla y el veredicto nunca se contradicen.
    await calcular(page, { peso: '70', ftp: '244' });
    await expect(resultados(page)).toContainText('3,49');
    await expect(resultados(page)).toContainText('Amateur');
    await expect(resultados(page)).not.toContainText('Amateur competitivo');
  });

  test('con tiempo 0 o sin tiempo no se inventa una VAM, y se dice por qué', async ({ page }) => {
    await abrirVam(page);

    // HALLAZGO 243, reparado: la tarjeta desaparecía sin explicación.
    await calcular(page, { peso: '70', ftp: '280', desnivel: '1500', tiempo: '0' });
    await expect(resultados(page)).toContainText('Indica un tiempo mayor que 0 minutos');
    let texto = await resultados(page).innerText();
    expect(texto).not.toContain('∞');
    expect(texto).not.toContain('NaN');
    expect(texto).not.toContain('Infinity');
    // El W/kg, que no depende del tiempo, se sigue publicando: 280 / 70 = 4,00.
    expect(texto).toContain('4,00');

    // Cada caso con SU aviso (hallazgo 255): antes todo lo que no fuera «tiempo ≤ 0» caía en
    // un genérico «hacen falta los dos datos» que la propia pantalla desmentía cuando los dos
    // campos estaban rellenos.
    await calcular(page, { desnivel: '1500', tiempo: '' });
    await expect(resultados(page)).toContainText('Falta el tiempo empleado');
    texto = await resultados(page).innerText();
    expect(texto).not.toContain('m/h');

    // Y con los dos datos vuelve la VAM: 1500 · 60 / 50 = 1800 m/h → «Élite / Profesional».
    await calcular(page, { desnivel: '1500', tiempo: '50' });
    await expect(resultados(page)).toContainText('1800 m/h');
    await expect(resultados(page)).toContainText('Élite / Profesional');
    await expect(resultados(page)).not.toContainText('hacen falta los dos datos');
  });

  test('linealidad: al doblar el FTP se doblan el W/kg y los límites de zona', async ({ page }) => {
    // 560 / 70 = 8,00 (el doble exacto de 4,00) y Z6 pasa de 337–420 a 673–840:
    // round(560 · 1,20) = 672 → la zona empieza en 673, y round(560 · 1,50) = 840.
    await calcular(page, { peso: '70', ftp: '560' });
    await expect(resultados(page)).toContainText('8,00');
    await expect(resultados(page)).toContainText('Profesional / Élite');
    await expect(resultados(page)).toContainText('673 – 840 W');
  });
});

test.describe('CASO 3 (rechazo) — entradas que no describen a ningún ciclista', () => {
  test('peso 0 kg: aviso y ningún veredicto', async ({ page }) => {
    // HALLAZGO 237, reparado: 280 / 0 daba Infinity, que formatNumber pinta «∞», acompañado
    // del veredicto MÁS favorable de la escala.
    await calcular(page, { peso: '', ftp: '280' });
    await expect(resultados(page)).toHaveCount(0);
    const aviso = page.locator('p[role="alert"]');
    await expect(aviso).toContainText('El peso debe ser un número mayor que 0 kg.');
    const texto = await aviso.innerText();
    expect(texto).not.toContain('∞');
    expect(texto).not.toContain('Profesional / Élite');
  });

  test('peso negativo: mismo rechazo, sin «-4,00 W/kg» ni «Principiante»', async ({ page }) => {
    await calcular(page, { peso: '-70', ftp: '280' });
    await expect(resultados(page)).toHaveCount(0);
    await expect(page.locator('p[role="alert"]')).toContainText(
      'El peso debe ser un número mayor que 0 kg.',
    );
    expect(await page.locator('p[role="alert"]').innerText()).not.toContain('-4,00');
  });

  test('FTP 0 W: aviso propio, porque tampoco describe a nadie', async ({ page }) => {
    await calcular(page, { peso: '70', ftp: '' });
    await expect(resultados(page)).toHaveCount(0);
    await expect(page.locator('p[role="alert"]')).toContainText(
      'El FTP debe ser un número mayor que 0 W.',
    );
  });

  test('estimador: velocidad 0 y masa 0 se rechazan con su aviso', async ({ page }) => {
    const tarjeta = await abrirEstimador(page);
    await estimar(page, { masa: '78', velocidad: '', pendiente: '5' });
    await expect(tarjeta).toHaveCount(0);
    await expect(page.locator('p[role="alert"]')).toContainText(
      'La velocidad debe ser un número mayor que 0 km/h.',
    );

    await estimar(page, { masa: '', velocidad: '25', pendiente: '5' });
    await expect(tarjeta).toHaveCount(0);
    await expect(page.locator('p[role="alert"]')).toContainText(
      'La masa total debe ser un número mayor que 0 kg.',
    );
  });
});

test('accesibilidad — los sliders quedan fuera del tabulador y los botones llevan type', async ({
  page,
}) => {
  // HALLAZGO 241, reparado: los dos <input type="range"> son duplicados visuales de los
  // numéricos y llevan aria-hidden="true", pero conservaban tabIndex 0 — el usuario de
  // teclado aterrizaba en un control que su lector no anuncia (patrón axe «aria-hidden-focus»).
  const sliders = await page.evaluate(() =>
    [...document.querySelectorAll('input[type=range]')].map((r) => ({
      ariaHidden: r.getAttribute('aria-hidden'),
      tabIndex: (r as HTMLInputElement).tabIndex,
    })),
  );
  expect(sliders.length).toBe(2);
  for (const s of sliders) {
    expect(s.ariaHidden).toBe('true');
    expect(s.tabIndex).toBe(-1);
  }

  // El recorrido real: desde el peso se salta directo al FTP, sin pasar por ningún slider.
  await page.focus('#peso');
  await page.keyboard.press('Tab');
  await expect(page.locator('#ftp')).toBeFocused();

  const botones = await page.evaluate(() =>
    [...document.querySelectorAll('button')].map((b) => b.getAttribute('type')),
  );
  for (const t of botones) expect(t).toBe('button');
  await expect(page.getByRole('button', { name: /Calcular VAM/i })).toHaveAttribute(
    'aria-expanded',
    'false',
  );

  // HALLAZGO 242, reparado: la app estaba declarada exenta de disclaimer estando en la suite
  // salud y pautando entrenamiento por zonas. Ahora lleva aviso médico, no colapsable.
  await expect(page.locator('[role="note"]').first()).toContainText('Aviso Médico');
});

/* ═══════════════════════════════════════════════════════════════════════════════════════
 * HALLAZGOS 252-256 de la segunda inspección (24/08/2026) · REPARADOS el 24/08/2026.
 * Estaban escritos con `test.fail()`, afirmando lo que DEBERÍA ocurrir; se les ha quitado la
 * marca al repararlos, tras comprobar que lo que afirmaban seguía siendo correcto.
 * ═══════════════════════════════════════════════════════════════════════════════════════ */

test.describe('Hallazgos 252-256, ya reparados', () => {
  test('252 · en bajada no se publica una potencia negativa como «tu potencia»', async ({
    page,
  }) => {
    // El estimador invita expresamente a la bajada («0 en llano; negativa en bajada», min −15).
    // A −5 % y 25 km/h el balance de fuerzas da −178 W: la gravedad (−272 W) supera a rodadura
    // y aire. Eso no es la potencia que mueve el ciclista —sería 0 W, y además tendría que
    // frenar—, pero la tarjeta lo rotula «Potencia estimada −178 W».
    // ENTRADA 78 kg · 25 km/h · −5 % → ESPERADO 0 W o un aviso · OBTENIDO «-178 W».
    const tarjeta = await abrirEstimador(page);
    await estimar(page, { masa: '78', velocidad: '25', pendiente: '-5' });
    const texto = await tarjeta.innerText();
    expect(texto).not.toMatch(/-\d+ W/);
    // Y lo que sí dice: que ahí no se pedalea, con los vatios que sobran
    expect(texto).toContain('No hace falta pedalear');
    expect(texto).toMatch(/sobran \d+ W/);

    // Control: en subida sigue estimando como siempre
    await estimar(page, { masa: '78', velocidad: '15', pendiente: '6' });
    const subida = await tarjeta.innerText();
    expect(subida).toContain('Potencia estimada');
    expect(subida).toContain('contra la gravedad');
  });

  test('253 · un FTP fuera del rango declarado (50-600 W) no recibe veredicto', async ({
    page,
  }) => {
    // Mitad no reparada del hallazgo 245: los vatios ya pasan por formatNumber(), pero el
    // motor solo comprueba FTP > 0, y los min/max del input son una sugerencia del navegador.
    // ENTRADA 70 kg · FTP 1000 W → ESPERADO aviso o recorte · OBTENIDO «14,29 W/kg» con badge
    // «Profesional / Élite» y Z6 «1201 – 1500 W», sin una palabra.
    // (Lo mismo por abajo: 10 kg con 200 W → «20,00 W/kg · Nivel profesional internacional»,
    // casi el triple del récord humano.)
    await calcular(page, { peso: '70', ftp: '1000' });
    await expect(page.locator('p[role="alert"]')).toBeVisible();
    await expect(page.locator('p[role="alert"]')).toContainText('entre 50 y 600 W');
    // Y por abajo, el peso: 10 kg daba «20,00 W/kg · Nivel profesional internacional»
    await calcular(page, { peso: '10', ftp: '200' });
    await expect(page.locator('p[role="alert"]')).toContainText('entre 30 y 150 kg');
    // Control: dentro del rango se calcula sin avisos
    await calcular(page, { peso: '70', ftp: '280' });
    await expect(page.locator('p[role="alert"]')).toHaveCount(0);
  });

  test('254 · ninguna fila de zonas sale con el mínimo por encima del máximo', async ({
    page,
  }) => {
    // Regresión introducida al reparar el hallazgo 244: `wattsMin = límite anterior + 1` se
    // vuelve del revés cuando dos límites consecutivos redondean al mismo entero, algo que
    // ocurre por debajo de ~7 W de FTP (el 15–20 % de separación entre límites no llega a 1 W).
    // ENTRADA 70 kg · FTP 3 W → ESPERADO rangos crecientes · OBTENIDO Z2 «3 – 2 W» y Z4 «4 – 3 W».
    // Con el rango ya validado (253), un FTP de 3 W ni siquiera llega a calcularse: la fila
    // invertida era alcanzable solo porque el rango declarado no se hacía cumplir.
    await calcular(page, { peso: '70', ftp: '3' });
    await expect(page.locator('p[role="alert"]')).toBeVisible();
    expect(await rangosDeZona(page)).toHaveLength(0);

    // Y en el FTP más bajo que la herramienta SÍ admite, las seis filas son crecientes
    await calcular(page, { peso: '70', ftp: '50' });
    const filas = await rangosDeZona(page);
    expect(filas).toHaveLength(6);
    for (const [min, max] of filas) {
      expect(min).toBeLessThanOrEqual(max);
    }
  });

  test('255 · con el desnivel a 0 el aviso no dice que faltan datos', async ({ page }) => {
    // El aviso del hallazgo 243 solo distingue el caso «tiempo ≤ 0»; con el desnivel a 0 cae en
    // la rama genérica y afirma algo que la pantalla desmiente.
    // ENTRADA desnivel 0 m · tiempo 30 min (los dos rellenos) → ESPERADO un aviso sobre el
    // desnivel · OBTENIDO «Para la VAM hacen falta los dos datos: el desnivel subido y el
    // tiempo empleado».
    await abrirVam(page);
    await calcular(page, { peso: '70', ftp: '280', desnivel: '0', tiempo: '30' });
    await expect(resultados(page)).not.toContainText('hacen falta los dos datos');
    await expect(resultados(page)).toContainText('desnivel mayor que 0');
  });

  test('256 · la guía y el FAQ envían al estimador propio, no solo a apps de terceros', async ({
    page,
  }) => {
    // El hallazgo 240 se reparó en el formulario, pero los dos sitios que responden justo a esa
    // pregunta siguen escritos como si el estimador no existiera: la tarjeta «Sin potenciómetro»
    // manda a Zwift, TrainerRoad y Garmin Connect, y el FAQ del JSON-LD —lo que leen Bing
    // Copilot, ChatGPT o Perplexity— dice que la calculadora sirve «si ya conoces tu FTP».
    // ENTRADA abrir la guía → ESPERADO que la tarjeta mencione el estimador de esta misma
    // página · OBTENIDO solo aplicaciones de terceros.
    await page.getByRole('button', { name: /Ver guía educativa/i }).click();
    const guia = await page.locator('main').innerText();
    const tarjeta = guia.slice(guia.indexOf('Sin potenciómetro'), guia.indexOf('Sin potenciómetro') + 420);
    expect(tarjeta).toMatch(/Estimar mis vatios|esta misma página/i);

    // Y el FAQPage, que es lo que leen Bing Copilot, ChatGPT o Perplexity
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = bloques.map((b) => JSON.parse(b)).find((j) => j['@type'] === 'FAQPage');
    const textos: string[] = faq.mainEntity.map(
      (q: { acceptedAnswer: { text: string } }) => q.acceptedAnswer.text,
    );
    const sinPotenciometro = textos.find((t) => t.includes('potenciómetro'))!;
    expect(sinPotenciometro).not.toContain('si ya conoces tu FTP por haber realizado un test');
    expect(sinPotenciometro).toContain('modelo de fuerzas');
  });
});

/* ═══════════════════════════════════════════════════════════════════════════════════════
 * Inspector 30/09/2026 — re-inspección completa (INVALIDADA por b833b716 en
 * lib/calculadoras/deporte.ts, que solo tocó calcularSWOLF, y por los lotes del catálogo
 * b7733c6d, 586a4d61, 3de36a1f y a1d72a9c, que solo tocaron el CSS de la cabecera de tabla y
 * el relleno del hero).
 *
 * LOS CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *   Modelo de fuerzas de libro: P = (m·g·sen θ + Crr·m·g·cos θ + ½·ρ·CdA·v²)·v / η, con
 *   θ = arctan(pendiente/100), g 9,80665, y los coeficientes que la propia tarjeta declara:
 *   Crr 0,005 · CdA 0,32 m² · ρ 1,225 kg/m³ (nivel del mar) · η 0,975 (transmisión).
 *
 *   CASO 1 (normal) — ciclista de 70 kg con bici de 8 kg (78 kg en movimiento)
 *     · FTP 250 W → 250 / 70 = 3,5714 → «3,57 W/kg»; 3,5 ≤ 3,57 < 4,5 → «Amateur competitivo»
 *       Zonas de Coggan como límite superior (55/75/90/105/120/150 %): 137,5 · 187,5 · 225 ·
 *       262,5 · 300 · 375 W, que redondeados son 138 · 188 · 225 · 263 · 300 · 375 y cada zona
 *       empieza en el anterior + 1: 0–138 · 139–188 · 189–225 · 226–263 · 264–300 · 301–375.
 *     · Subida al 7 % a 15 km/h: v = 4,16667 m/s · sen θ = 0,0698291 · cos θ = 0,9975590
 *         F_grav = 78 · 9,80665 · 0,0698291          = 53,4136 N → 228,26 W
 *         F_rod  = 0,005 · 78 · 9,80665 · 0,9975590  =  3,8153 N →  16,30 W
 *         F_aero = ½ · 1,225 · 0,32 · 4,16667²       =  3,4028 N →  14,54 W
 *         P = 60,6316 N · 4,16667 m/s / 0,975 = 259,11 W → «259 W» (228 · 16 · 15)
 *         VAM = 4,16667 · 0,0698291 · 3600 = 1047,4 → «1047 m/h»
 *     · VAM cronometrada: 850 m en 45 min → 850 · 60 / 45 = 1133,3 → «1133 m/h», «Amateur»
 *
 *   CASO 2 (límite)
 *     · Llano (0 %) a 15 km/h: sin gravedad; rodadura 3,8246 N → 16,34 W, aire 14,54 W,
 *       P = 30,89 → «31 W», y sin VAM.
 *     · Bajada al −7 % a 15 km/h: 3,8153 + 3,4028 − 53,4136 = −46,1955 N → P = −197,42 W:
 *       no se pedalea y sobran «197 W».
 *     · Pendiente máxima que admite el campo (25 %) a 10 km/h: v = 2,77778 · sen θ = 0,2425356
 *       · cos θ = 0,9701425 → 185,520 + 3,710 + 1,512 = 190,743 N → P = 543,43 → «543 W»;
 *       VAM = 10.000 m/h · 0,2425356 = 2425,4 → «2425 m/h».
 *
 *   CASO 3 (rechazo)
 *     · Peso tecleado «abc»: un campo numérico no admite letras, el valor queda vacío (0 kg) y
 *       la app debe avisar sin veredicto.
 *     · FTP «1.500»: el navegador lee el punto como decimal (1,5 W) y el rango 50-600 lo rechaza.
 *     · Desnivel «1.500» m: en español son mil quinientos metros → con 50 min, 1500 · 60 / 50 =
 *       1800 m/h; lo que no puede salir es 1,5 m → 2 m/h «Principiante» (hallazgo ABIERTO).
 * ═══════════════════════════════════════════════════════════════════════════════════════ */

/** Teclea como un usuario —foco, seleccionar lo que hubiera y escribir tecla a tecla— tras
 *  esperar a que React controle ese campo. `fill()` escribe el valor entero de una vez y por
 *  eso no ve lo que pasa con los estados intermedios («-», «14.»), que es justo el hallazgo. */
async function teclear(page: Page, selector: string, texto: string, tocar = false): Promise<void> {
  await esperarHidratacion(page, [selector]);
  if (tocar) await page.tap(selector);
  else await page.click(selector);
  await page.keyboard.press('Control+A');
  await page.keyboard.type(texto);
}

/** Contraste WCAG del texto de un elemento contra el primer fondo opaco de sus ancestros. */
async function contraste(elemento: Locator): Promise<number> {
  return elemento.evaluate((el) => {
    const rgb = (s: string) => (s.match(/[\d.]+/g) ?? []).map(Number);
    const lum = ([r, g, b]: number[]) => {
      const f = (c: number) => {
        const x = c / 255;
        return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    let fondo = [255, 255, 255];
    for (let n: Element | null = el; n; n = n.parentElement) {
      const c = rgb(getComputedStyle(n).backgroundColor);
      if (c.length === 3 || (c.length === 4 && c[3] === 1)) {
        fondo = c;
        break;
      }
    }
    const a = lum(rgb(getComputedStyle(el).color));
    const b = lum(fondo);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  });
}

test.describe('Inspector 30/09/2026', () => {
  // Coma decimal y punto de miles del español: el caso de rechazo depende de ello.
  test.use({ locale: 'es-ES' });

  test.describe('CASO 1 (normal) — 70 kg, bici de 8 kg y FTP 250 W', () => {
    test('FTP 250 W: «3,57 W/kg», «Amateur competitivo» y zonas desde 137,5 W', async ({ page }) => {
      await calcular(page, { peso: '70', ftp: '250' });
      const tabla = resultados(page);
      // 250 / 70 = 3,5714 → 3,57, dentro de [3,5; 4,5)
      await expect(tabla).toContainText('3,57');
      await expect(tabla).toContainText('Amateur competitivo');
      // 55/75/90/105/120/150 % de 250 W = 137,5 · 187,5 · 225 · 262,5 · 300 · 375
      await expect(tabla).toContainText('basadas en tu FTP: 250 W');
      expect(await rangosDeZona(page)).toEqual([
        [0, 138],
        [139, 188],
        [189, 225],
        [226, 263],
        [264, 300],
        [301, 375],
      ]);
    });

    test('estimador: 78 kg a 15 km/h por una rampa del 7 % son 259 W y 1047 m/h', async ({
      page,
    }) => {
      const tarjeta = await abrirEstimador(page);
      await estimar(page, { masa: '78', velocidad: '15', pendiente: '7' });
      // P = (53,4136 + 3,8153 + 3,4028) N · 4,16667 m/s / 0,975 = 259,11 W
      await expect(tarjeta).toContainText('Potencia estimada');
      await expect(tarjeta).toContainText('259 W');
      await expect(tarjeta).toContainText('228 W contra la gravedad');
      await expect(tarjeta).toContainText('16 W de rodadura');
      await expect(tarjeta).toContainText('15 W contra el aire');
      // VAM = v · sen θ · 3600 = 4,16667 · 0,0698291 · 3600 = 1047,4
      await expect(tarjeta).toContainText('1047 m/h de VAM');
    });

    test('VAM cronometrada: 850 m en 45 min son 1133 m/h, «Amateur»', async ({ page }) => {
      await abrirVam(page);
      await calcular(page, { peso: '70', ftp: '250', desnivel: '850', tiempo: '45' });
      // 850 · 60 / 45 = 1133,3 → 1133, en [1000; 1200) → «Amateur»
      await expect(resultados(page)).toContainText('1133 m/h');
      const tarjetaVam = resultados(page).locator('div').filter({ hasText: /^VAM/ }).first();
      await expect(tarjetaVam).toContainText('Amateur');
      await expect(tarjetaVam).not.toContainText('Amateur fuerte');
    });
  });

  test.describe('CASO 2 (límite) — llano, bajada y la pendiente máxima', () => {
    test('llano a 15 km/h: 31 W, cero contra la gravedad y sin VAM', async ({ page }) => {
      const tarjeta = await abrirEstimador(page);
      await estimar(page, { masa: '78', velocidad: '15', pendiente: '0' });
      // (3,8246 + 3,4028) N · 4,16667 / 0,975 = 30,89 W
      await expect(tarjeta).toContainText('31 W');
      await expect(tarjeta).toContainText('0 W contra la gravedad');
      await expect(tarjeta).toContainText('16 W de rodadura');
      await expect(tarjeta).toContainText('15 W contra el aire');
      await expect(tarjeta).not.toContainText('de VAM');
    });

    test('bajada al −7 % a 15 km/h (escrita de una vez): no se pedalea y sobran 197 W', async ({
      page,
    }) => {
      const tarjeta = await abrirEstimador(page);
      await estimar(page, { masa: '78', velocidad: '15', pendiente: '-7' });
      await esperarValorEnReact(page, '#pendiente', -7);
      // 3,8153 + 3,4028 − 53,4136 = −46,1955 N → −197,42 W
      await expect(tarjeta).toContainText('No hace falta pedalear');
      await expect(tarjeta).toContainText('sobran 197 W');
      await expect(tarjeta).not.toContainText('Potencia estimada');
    });

    test('la pendiente más alta que admite el campo (25 %) a 10 km/h: 543 W y 2425 m/h', async ({
      page,
    }) => {
      const tarjeta = await abrirEstimador(page);
      await estimar(page, { masa: '78', velocidad: '10', pendiente: '25' });
      // (185,520 + 3,710 + 1,512) N · 2,77778 / 0,975 = 543,43 W
      await expect(tarjeta).toContainText('543 W');
      // 10.000 m/h · sen(arctan 0,25) = 10.000 · 0,2425356 = 2425,4 m/h
      await expect(tarjeta).toContainText('2425 m/h de VAM');
    });
  });

  test.describe('CASO 3 (rechazo)', () => {
    test('peso tecleado «abc»: el campo no lo admite y la app avisa sin veredicto', async ({
      page,
    }) => {
      await teclear(page, '#peso', 'abc');
      await page.getByRole('button', { name: /Calcular potencia/i }).click();
      await expect(page.locator('p[role="alert"]')).toContainText(
        'El peso debe ser un número mayor que 0 kg.',
      );
      await expect(resultados(page)).toHaveCount(0);
    });

    test('FTP «1.500»: el navegador lo lee como 1,5 W y el rango 50-600 lo rechaza', async ({
      page,
    }) => {
      await calcular(page, { peso: '70', ftp: '1.500' });
      await expect(page.locator('p[role="alert"]')).toContainText('entre 50 y 600 W');
      await expect(resultados(page)).toHaveCount(0);
    });
  });

  test.describe('Hallazgos ABIERTOS del 30/09/2026', () => {
    test('ABIERTO · teclear «-7» en la pendiente es una bajada, no una subida del 7 %', async ({
      page,
    }) => {
      // ABIERTO. Los campos con estado numérico (peso, FTP, masa, velocidad y pendiente) hacen
      // `setX(Number(e.target.value))`. Al teclear «-», el navegador entrega un valor vacío
      // (un «-» suelto no es un número), Number('') es 0 y React reescribe «0» en el campo:
      // el signo desaparece y el «7» que sigue deja «07». La app calcula la SUBIDA del 7 %.
      // ENTRADA 78 kg · 15 km/h · seleccionar el 0 de la pendiente y teclear «-7»
      // ESPERADO (a mano, CASO 2) «No hace falta pedalear» y sobran 197 W
      // OBTENIDO el campo muestra «07» y la tarjeta «Potencia estimada 259 W … Esa subida son
      // 1047 m/h de VAM». Con `fill('-7')` —como escriben los tests anteriores— no se ve.
      test.fail();
      const tarjeta = await abrirEstimador(page);
      await estimar(page, { masa: '78', velocidad: '15' });
      await teclear(page, '#pendiente', '-7');
      await page.getByRole('button', { name: /Estimar vatios/i }).click();
      await expect(page.locator('#pendiente')).toHaveValue('-7');
      await expect(tarjeta).toContainText('No hace falta pedalear');
      await expect(tarjeta).toContainText('sobran 197 W');
    });

    test('ABIERTO · teclear «14.5» en la velocidad son 14,5 km/h, no 5', async ({ page }) => {
      // ABIERTO. El mismo mecanismo con el punto decimal: «14.» no es un número válido, el
      // navegador entrega '' y la app escribe «0»; el «5» final deja «05». Pasa igual con
      // locale es-ES y es-MX, en escritorio y en móvil (medido el 30/09/2026), y el punto es el
      // separador decimal de México y del teclado numérico.
      // ENTRADA 78 kg · 7 % · teclear «14.5» en la velocidad
      // ESPERADO v = 4,02778 m/s → (53,4136 + 3,8153 + 3,1797) N · 4,02778 / 0,975 = 249,55
      //          → «250 W» y VAM 4,02778 · 0,0698291 · 3600 = 1012,5 → «1013 m/h»
      // OBTENIDO el campo queda en «05» y la app calcula con 5 km/h: «82 W» y «349 m/h».
      test.fail();
      const tarjeta = await abrirEstimador(page);
      await estimar(page, { masa: '78', pendiente: '7' });
      await esperarValorEnReact(page, '#pendiente', 7);
      await teclear(page, '#velocidad', '14.5');
      await page.getByRole('button', { name: /Estimar vatios/i }).click();
      await expect(page.locator('#velocidad')).toHaveValue('14.5');
      await expect(tarjeta).toContainText('250 W');
      await expect(tarjeta).toContainText('1013 m/h');
    });

    test('control del anterior: con coma, «14,5» sí llega y son 250 W', async ({ page }) => {
      // Con locale es-ES Chromium admite la coma y la traduce a «14.5» sin pasar por un valor
      // vacío: es la prueba de que el fallo de arriba es del punto y no del cálculo.
      const tarjeta = await abrirEstimador(page);
      await estimar(page, { masa: '78', pendiente: '7' });
      await esperarValorEnReact(page, '#pendiente', 7);
      await teclear(page, '#velocidad', '14,5');
      await esperarValorEnReact(page, '#velocidad', 14.5);
      await page.getByRole('button', { name: /Estimar vatios/i }).click();
      await expect(tarjeta).toContainText('250 W');
      await expect(tarjeta).toContainText('1013 m/h');
    });

    test('ABIERTO · un desnivel de «1.500» m no se convierte en 1,5 m', async ({ page }) => {
      // ABIERTO. El desnivel es un <input type="number">: el navegador lee «1.500» con el punto
      // como decimal y la app calcula la VAM de un metro y medio, con veredicto.
      // ENTRADA peso 70 · FTP 250 · desnivel «1.500» · tiempo 50 min
      // ESPERADO 1500 · 60 / 50 = 1800 m/h («1.234 = mil» en español, el criterio del catálogo
      //          para el separador ambiguo), o un aviso que lo rechace
      // OBTENIDO «2 m/h» y «Principiante» (1,5 · 60 / 50 = 1,8 → 2)
      test.fail();
      await abrirVam(page);
      await calcular(page, { peso: '70', ftp: '250' });
      await teclear(page, '#desnivel', '1.500');
      await teclear(page, '#tiempoMin', '50');
      await page.getByRole('button', { name: /Calcular potencia/i }).click();
      await expect(resultados(page).or(page.locator('p[role="alert"]'))).toBeVisible();
      const texto = (await resultados(page).count()) ? await resultados(page).innerText() : '';
      expect(texto).not.toMatch(/(^|\s)2 m\/h/);
    });

    test('ABIERTO · 30 kg con 600 W no recibe el veredicto «Profesional / Élite»', async ({
      page,
    }) => {
      // ABIERTO. Reparación a medias del hallazgo 253: ahora se hacen cumplir los rangos de peso
      // (30-150) y de FTP (50-600) por SEPARADO, pero no el cociente. El comentario del motor
      // cita «20,00 W/kg — casi el triple del récord humano» como el absurdo que se quería
      // evitar, y sigue saliendo con dos datos que la herramienta admite.
      // ENTRADA peso 30 kg · FTP 600 W → 600 / 30 = 20,00 W/kg
      // ESPERADO un aviso y ningún veredicto (la propia guía sitúa a los grandes escaladores
      //          del World Tour en 6,0-7,5 W/kg)
      // OBTENIDO «20,00 W/kg · Profesional / Élite · Nivel profesional internacional»
      test.fail();
      await calcular(page, { peso: '30', ftp: '600' });
      await expect(page.locator('p[role="alert"]')).toBeVisible();
      if (await resultados(page).count()) {
        await expect(resultados(page)).not.toContainText('Profesional / Élite');
      }
    });

    test('ABIERTO · 1000 m en 10 min (6000 m/h) no es «Élite / Profesional»', async ({ page }) => {
      // ABIERTO. La VAM no tiene ni el control de rangos que se añadió al W/kg: los min/max del
      // desnivel (0-3000) y del tiempo (1-600) son sugerencias del navegador (5000 m en 0,5 min
      // dan «600.000 m/h»), y aun dentro de ellos sale una VAM que triplica lo que la guía de
      // la misma página da como tope («los mejores escaladores han superado los 1.800 m/h»).
      // ENTRADA peso 70 · FTP 250 · desnivel 1000 m · tiempo 10 min → 1000 · 60 / 10 = 6000
      // ESPERADO un aviso y ningún veredicto sobre una VAM imposible
      // OBTENIDO «6000 m/h · Élite / Profesional»
      test.fail();
      await abrirVam(page);
      await calcular(page, { peso: '70', ftp: '250', desnivel: '1000', tiempo: '10' });
      await expect(resultados(page).or(page.locator('p[role="alert"]'))).toBeVisible();
      if (await resultados(page).count()) {
        await expect(resultados(page)).not.toContainText('Élite / Profesional');
      }
    });

    test('ABIERTO · el estimador no publica 34.687 W a 200 km/h (máximo declarado: 80)', async ({
      page,
    }) => {
      // ABIERTO. calcularVatiosPorFuerzas solo exige masa y velocidad > 0: los rangos que
      // declaran sus campos (masa 30-200, velocidad 1-80, pendiente −15/25) no se cumplen.
      // ENTRADA 78 kg · 200 km/h · 0 % → (3,8246 + 604,94) N · 55,556 / 0,975 = 34.687 W
      // ESPERADO un aviso con el rango, como el de peso y FTP del formulario principal
      // OBTENIDO «Potencia estimada 34.687 W» sin una palabra
      test.fail();
      const tarjeta = await abrirEstimador(page);
      await estimar(page, { masa: '78', velocidad: '200', pendiente: '0' });
      await expect(page.locator('p[role="alert"]')).toBeVisible();
      await expect(tarjeta).toHaveCount(0);
    });

    test('ABIERTO · los veredictos y las zonas se leen con contraste 4,5:1', async ({ page }) => {
      // ABIERTO. Las insignias ponen texto blanco de 12,5-12,8 px en negrita sobre colores
      // fijos: texto pequeño, exige 4,5:1. Medido el 30/09/2026 (igual en los dos temas):
      //   nivel  Cicloturista 2,87 · Principiante 3,54 · Semi-profesional 3,82 · Amateur 4,11
      //   zonas  Z1 2,80 · Z2 2,87 · Z3 2,19 · Z4 2,97 · Z5 3,82 (Z6 5,87 sí cumple)
      // El veredicto de la app ES el texto de la insignia.
      // ENTRADA 70 kg · FTP 150 W → 2,14 W/kg «Cicloturista»
      // ESPERADO ≥ 4,5:1 · OBTENIDO 2,87:1 (blanco sobre #27AE60) y Z3 2,19:1 (sobre #F39C12)
      test.fail();
      await calcular(page, { peso: '70', ftp: '150' });
      await expect(resultados(page)).toContainText('Cicloturista');
      const insignia = resultados(page).locator('[class*="nivelBadge"]');
      expect(await contraste(insignia)).toBeGreaterThanOrEqual(4.5);
      const z3 = resultados(page).locator('[class*="zonaBadge"]').nth(2);
      await expect(z3).toHaveText('Z3');
      expect(await contraste(z3)).toBeGreaterThanOrEqual(4.5);
    });

    test('ABIERTO · el azul de marca como texto pequeño no llega a 4,5:1', async ({ page }) => {
      // ABIERTO. `color: var(--primary)` (#2E86AB) sobre blanco da 4,11:1, y el texto es
      // pequeño (13-16 px en negrita): el título de la tabla de zonas, el del panel, los dos
      // plegables, los h4 de la guía y los rangos de vatios (3,96:1 en las filas pares). La
      // guía suma el h2 (3,77:1), el título de «Errores frecuentes» (#c0621a, 3,57:1), los
      // números de los pasos (blanco sobre el degradado de marca, 2,80:1; 2,23:1 en oscuro) y
      // los niveles de la tabla W/kg con color en línea (2,64-3,77:1; 2,25:1 «Profesional /
      // Élite» en oscuro). El token para texto es --primary-texto.
      // ENTRADA 70 kg · FTP 250 W → título «Zonas de Potencia…»
      // ESPERADO ≥ 4,5:1 · OBTENIDO 4,11:1
      test.fail();
      await calcular(page, { peso: '70', ftp: '250' });
      const titulo = resultados(page).locator('h3', { hasText: 'Zonas de Potencia' });
      await expect(titulo).toBeVisible();
      expect(await contraste(titulo)).toBeGreaterThanOrEqual(4.5);
    });

    test('ABIERTO · el % de la tabla de zonas va separado con espacio duro', async ({ page }) => {
      // ABIERTO. Regla del 25/09/2026 (Ortografía de la RAE, 2010): «15 %», con U+00A0. Los
      // rótulos salen del motor (`hasta ${limite}%`, lib/calculadoras/deporte.ts) y van pegados;
      // la guía repite el patrón («10–20%», «2–5%», «70–80%» dos veces), el FAQ («95%») y la
      // única que lo separa («al 8 %») usa un espacio normal.
      // ENTRADA 70 kg · FTP 250 W → celda «% FTP» de Z1
      // ESPERADO «hasta 55 %» (con U+00A0) · OBTENIDO «hasta 55%»
      test.fail();
      await calcular(page, { peso: '70', ftp: '250' });
      const celda = resultados(page).locator('tbody tr').first().locator('td').nth(2);
      expect(await celda.textContent()).toBe('hasta 55 %');
    });

    test('ABIERTO · la tarjeta del estimador dice cuándo esa cifra vale como FTP', async ({
      page,
    }) => {
      // ABIERTO. La guía («Sin potenciómetro: Esta misma página lo estima», en la sección del
      // FTP, remitiendo a un «Estimar mis vatios» que no existe con ese nombre) y el FAQ («Con
      // esa estimación —o con un FTP ya conocido— calcula el ratio W/kg y las seis zonas»)
      // tratan la potencia estimada como un FTP. El estimador da la potencia a la velocidad
      // introducida, que solo se aproxima al FTP si fue un esfuerzo máximo de alrededor de una
      // hora; la tarjeta no lo dice y no lleva la cifra al W/kg ni a las zonas.
      // ENTRADA 78 kg · 30 km/h · 0 % → «Potencia estimada 149 W»
      // ESPERADO que la tarjeta diga cuándo esa cifra sirve como FTP (o la lleve al cálculo)
      // OBTENIDO ninguna mención del FTP; el formulario principal sigue con 200 W
      test.fail();
      const tarjeta = await abrirEstimador(page);
      await estimar(page, { masa: '78', velocidad: '30', pendiente: '0' });
      await expect(tarjeta).toContainText('149 W');
      await expect(tarjeta).toContainText('FTP');
    });

    test('ABIERTO · el FAQ usa la misma escala de niveles que la calculadora', async ({ page }) => {
      // ABIERTO. El FAQPage (lo que leen Bing Copilot, ChatGPT o Perplexity) desplaza las
      // etiquetas un escalón respecto a la app y a su propia guía visible:
      //   W/kg: «Un ciclista recreativo medio suele estar entre 2,5 y 3,5 W/kg», cuando la app
      //         llama a 2,5-3,5 «Amateur · Entrenamiento estructurado» y pone lo recreativo
      //         («Salidas recreativas regulares», «fondo recreativo») en 1,5-2,5 «Cicloturista».
      //   VAM:  «Un ciclista aficionado suele tener una VAM de 800-1.000 m/h», cuando la app
      //         llama a 800-1000 «Cicloturista» y reserva «Amateur» para 1000-1200.
      // Es el patrón del hallazgo 239 (la guía un escalón desfasada), ahora en el FAQ.
      // ENTRADA 900 m/h → app «Cicloturista» · FAQ «aficionado»; 3,00 W/kg → app «Amateur» ·
      //         FAQ «recreativo medio»
      test.fail();
      const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
      const faq = bloques.map((b) => JSON.parse(b)).find((j) => j['@type'] === 'FAQPage');
      const textos: string[] = faq.mainEntity.map(
        (q: { acceptedAnswer: { text: string } }) => q.acceptedAnswer.text,
      );
      const todo = textos.join(' ');
      expect(todo).not.toContain('recreativo medio suele estar entre 2,5 y 3,5');
      expect(todo).not.toContain('aficionado suele tener una VAM de 800-1.000');
    });
  });

  test.describe('Móvil 390×844', () => {
    test.use({
      viewport: { width: 390, height: 844 },
      userAgent:
        'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
    });

    test('70 kg y FTP 250 W: 3,57 W/kg y la tabla cabe sin desbordar la página', async ({
      page,
    }) => {
      await calcular(page, { peso: '70', ftp: '250' });
      await expect(resultados(page)).toContainText('3,57');
      await expect(resultados(page)).toContainText('Amateur competitivo');
      await expect(resultados(page)).toContainText('301 – 375 W');
      const anchos = await page.evaluate(() => ({
        pagina: document.documentElement.scrollWidth,
        vista: document.documentElement.clientWidth,
      }));
      expect(anchos.pagina).toBeLessThanOrEqual(anchos.vista);
    });

    test('ABIERTO · en móvil, teclear «-7» en la pendiente también da la subida', async ({
      page,
    }) => {
      // ABIERTO. El hallazgo del «-» borrado, con toque y viewport de móvil.
      // ENTRADA 78 kg · 15 km/h · tocar la pendiente, seleccionar el 0 y teclear «-7»
      // ESPERADO «No hace falta pedalear», sobran 197 W · OBTENIDO «07» y 259 W de subida
      test.fail();
      const tarjeta = await abrirEstimador(page);
      await estimar(page, { masa: '78', velocidad: '15' });
      await teclear(page, '#pendiente', '-7', true);
      await page.getByRole('button', { name: /Estimar vatios/i }).tap();
      await expect(page.locator('#pendiente')).toHaveValue('-7');
      await expect(tarjeta).toContainText('No hace falta pedalear');
    });
  });
});
