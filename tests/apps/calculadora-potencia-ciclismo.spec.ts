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
 * Quinta: 03/10/2026, verificación de la reparación 18411e51 (2491-2499) tecleando de verdad en
 * los siete campos, en escritorio y en móvil, y del cambio 10b7eb5f del motor (solo SWOLF): su
 * bloque va detrás del de la cuarta.
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
 * no lo llevan: se repararon el 24/08/2026 y quedan como regresión. Los de la re-inspección
 * del 30/09/2026 (2491-2499) van en su bloque, al final: estuvieron con `test.fail()` y se
 * REPARARON el 30/09/2026, así que también quedan como regresión.
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
    // Lo que vigila es que el tramo 1.400–1.600 sea el semiprofesional, no cómo se escribe: hasta
    // el 03/10/2026 pedía la grafía con guion, que es la errata que anota el Inspector ese día
    // («semiprofesional», prefijo unido a la base), y habría roto al repararla.
    expect(guia).toMatch(/1\.400–1\.600, semi-?profesional/);
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

  test('linealidad: al reducir el FTP a la mitad se reducen a la mitad el W/kg y los límites de zona', async ({ page }) => {
    // Este test DOBLABA el FTP: 560 / 70 = 8,00 W/kg con el veredicto «Profesional / Élite».
    // Ocho vatios por kilo de FTP no los sostiene nadie (la guía da 6,0-7,5 a los grandes
    // escaladores del World Tour) y desde el hallazgo 2493 se rechazan, así que la linealidad
    // se comprueba en el otro sentido, que no sale del rango de lo posible:
    // 140 / 70 = 2,00 (la mitad exacta de 4,00) → «Cicloturista», y Z6 pasa de 337–420 a
    // 169–210: round(140 · 1,20) = 168 → la zona empieza en 169, y round(140 · 1,50) = 210.
    await calcular(page, { peso: '70', ftp: '140' });
    await expect(resultados(page)).toContainText('2,00');
    await expect(resultados(page)).toContainText('Cicloturista');
    await expect(resultados(page)).toContainText('169 – 210 W');
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
 *     · FTP «1.500»: son 1500 W (antes el navegador lo leía como 1,5 W) y el rango 50-600 lo rechaza.
 *     · Desnivel «1.500» m: en español son mil quinientos metros → con 50 min, 1500 · 60 / 50 =
 *       1800 m/h; lo que no puede salir es 1,5 m → 2 m/h «Principiante» (hallazgo 2492, REPARADO).
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
    test('peso tecleado «abc»: no es un número y la app avisa sin veredicto', async ({
      page,
    }) => {
      // Desde la reparación del 2491 el campo es de texto (un type="number" borraba el «-» y el
      // punto al teclear), así que «abc» se queda escrito; parseSpanishNumber lo lee como NaN y
      // el motor lo rechaza con el mismo aviso que un campo vacío.
      await teclear(page, '#peso', 'abc');
      await page.getByRole('button', { name: /Calcular potencia/i }).click();
      await expect(page.locator('p[role="alert"]')).toContainText(
        'El peso debe ser un número mayor que 0 kg.',
      );
      await expect(resultados(page)).toHaveCount(0);
    });

    test('FTP «1.500»: son mil quinientos vatios y el rango 50-600 lo rechaza', async ({
      page,
    }) => {
      // Con el antiguo type="number" el navegador lo leía como 1,5 W; desde la reparación del
      // 2491-2492 se lee con parseSpanishNumber («1.500» = 1500, el criterio del catálogo).
      // Por un lado o por el otro queda fuera del rango, y el aviso es el mismo.
      await calcular(page, { peso: '70', ftp: '1.500' });
      await expect(page.locator('p[role="alert"]')).toContainText('entre 50 y 600 W');
      await expect(resultados(page)).toHaveCount(0);
    });
  });

  /* Hallazgos 2491-2499, REPARADOS el 30/09/2026. Estaban escritos con `test.fail()`
   * afirmando lo que DEBERÍA ocurrir; se les ha quitado la marca al repararlos. Las cabeceras
   * conservan el caso tal como se encontró, en pasado. */
  test.describe('Hallazgos del 30/09/2026 (2491-2499), ya reparados', () => {
    test('2491 · teclear «-7» en la pendiente es una bajada, no una subida del 7 %', async ({
      page,
    }) => {
      // REPARADO el 30/09/2026: los campos guardan el texto tecleado y el número se deriva con
      // parseSpanishNumber. El defecto: los campos con estado numérico (peso, FTP, masa,
      // velocidad y pendiente) hacían `setX(Number(e.target.value))`. Al teclear «-», el navegador entrega un valor vacío
      // (un «-» suelto no es un número), Number('') es 0 y React reescribe «0» en el campo:
      // el signo desaparece y el «7» que sigue deja «07». La app calcula la SUBIDA del 7 %.
      // ENTRADA 78 kg · 15 km/h · seleccionar el 0 de la pendiente y teclear «-7»
      // ESPERADO (a mano, CASO 2) «No hace falta pedalear» y sobran 197 W
      // OBTENIDO el campo muestra «07» y la tarjeta «Potencia estimada 259 W … Esa subida son
      // 1047 m/h de VAM». Con `fill('-7')` —como escriben los tests anteriores— no se ve.
      const tarjeta = await abrirEstimador(page);
      await estimar(page, { masa: '78', velocidad: '15' });
      await teclear(page, '#pendiente', '-7');
      await page.getByRole('button', { name: /Estimar vatios/i }).click();
      await expect(page.locator('#pendiente')).toHaveValue('-7');
      await expect(tarjeta).toContainText('No hace falta pedalear');
      await expect(tarjeta).toContainText('sobran 197 W');
    });

    test('2491 · teclear «14.5» en la velocidad son 14,5 km/h, no 5', async ({ page }) => {
      // REPARADO el 30/09/2026 (misma reparación). Era el mismo mecanismo con el punto decimal: «14.» no es un número válido, el
      // navegador entrega '' y la app escribe «0»; el «5» final deja «05». Pasa igual con
      // locale es-ES y es-MX, en escritorio y en móvil (medido el 30/09/2026), y el punto es el
      // separador decimal de México y del teclado numérico.
      // ENTRADA 78 kg · 7 % · teclear «14.5» en la velocidad
      // ESPERADO v = 4,02778 m/s → (53,4136 + 3,8153 + 3,1797) N · 4,02778 / 0,975 = 249,55
      //          → «250 W» y VAM 4,02778 · 0,0698291 · 3600 = 1012,5 → «1013 m/h»
      // OBTENIDO el campo queda en «05» y la app calcula con 5 km/h: «82 W» y «349 m/h».
      const tarjeta = await abrirEstimador(page);
      await estimar(page, { masa: '78', pendiente: '7' });
      await esperarValorEnReact(page, '#pendiente', 7);
      await teclear(page, '#velocidad', '14.5');
      await page.getByRole('button', { name: /Estimar vatios/i }).click();
      await expect(page.locator('#velocidad')).toHaveValue('14.5');
      await expect(tarjeta).toContainText('250 W');
      await expect(tarjeta).toContainText('1013 m/h');
    });

    test('control del anterior: con coma, «14,5» también llega y son 250 W', async ({ page }) => {
      // Con el antiguo type="number" y locale es-ES, Chromium traducía la coma a «14.5» sin
      // pasar por un valor vacío: era la prueba de que el fallo era del punto y no del cálculo.
      // Desde la reparación el campo es de texto y el estado guarda lo tecleado, «14,5», que
      // parseSpanishNumber lee como 14,5: los dos separadores dan la misma cifra.
      const tarjeta = await abrirEstimador(page);
      await estimar(page, { masa: '78', pendiente: '7' });
      await esperarValorEnReact(page, '#pendiente', 7);
      await teclear(page, '#velocidad', '14,5');
      await esperarValorEnReact(page, '#velocidad', '14,5');
      await page.getByRole('button', { name: /Estimar vatios/i }).click();
      await expect(tarjeta).toContainText('250 W');
      await expect(tarjeta).toContainText('1013 m/h');
    });

    test('2492 · un desnivel de «1.500» m no se convierte en 1,5 m', async ({ page }) => {
      // REPARADO el 30/09/2026: el campo es de texto y se lee con parseSpanishNumber. El
      // desnivel era un <input type="number">: el navegador lee «1.500» con el punto
      // como decimal y la app calcula la VAM de un metro y medio, con veredicto.
      // ENTRADA peso 70 · FTP 250 · desnivel «1.500» · tiempo 50 min
      // ESPERADO 1500 · 60 / 50 = 1800 m/h («1.234 = mil» en español, el criterio del catálogo
      //          para el separador ambiguo), o un aviso que lo rechace
      // OBTENIDO «2 m/h» y «Principiante» (1,5 · 60 / 50 = 1,8 → 2)
      await abrirVam(page);
      await calcular(page, { peso: '70', ftp: '250' });
      await teclear(page, '#desnivel', '1.500');
      await teclear(page, '#tiempoMin', '50');
      await page.getByRole('button', { name: /Calcular potencia/i }).click();
      await expect(resultados(page).or(page.locator('p[role="alert"]'))).toBeVisible();
      const texto = (await resultados(page).count()) ? await resultados(page).innerText() : '';
      expect(texto).not.toMatch(/(^|\s)2 m\/h/);
      // Y lo que sí sale: 1500 · 60 / 50 = 1800 m/h, por encima de 1600 → «Élite / Profesional»
      await expect(resultados(page)).toContainText('1800 m/h');
      await expect(resultados(page)).toContainText('Élite / Profesional');
    });

    test('2493 · 30 kg con 600 W no recibe el veredicto «Profesional / Élite»', async ({
      page,
    }) => {
      // REPARADO el 30/09/2026: el motor rechaza un cociente por encima de 7,5 W/kg, el extremo
      // superior que la guía da a los grandes escaladores. Era una reparación a medias del 253: ahora se hacen cumplir los rangos de peso
      // (30-150) y de FTP (50-600) por SEPARADO, pero no el cociente. El comentario del motor
      // cita «20,00 W/kg — casi el triple del récord humano» como el absurdo que se quería
      // evitar, y sigue saliendo con dos datos que la herramienta admite.
      // ENTRADA peso 30 kg · FTP 600 W → 600 / 30 = 20,00 W/kg
      // ESPERADO un aviso y ningún veredicto (la propia guía sitúa a los grandes escaladores
      //          del World Tour en 6,0-7,5 W/kg)
      // OBTENIDO «20,00 W/kg · Profesional / Élite · Nivel profesional internacional»
      await calcular(page, { peso: '30', ftp: '600' });
      await expect(page.locator('p[role="alert"]')).toBeVisible();
      await expect(page.locator('p[role="alert"]')).toContainText('revisa el peso y el FTP');
      await expect(resultados(page)).toHaveCount(0);

      // El borde, por los dos lados: 450 / 60 = 7,50 exacto sí se admite (el techo es
      // inclusivo) y 451 / 60 = 7,5167 → 7,52 ya no.
      await calcular(page, { peso: '60', ftp: '450' });
      await expect(resultados(page)).toContainText('7,50');
      await expect(resultados(page)).toContainText('Profesional / Élite');
      await expect(page.locator('p[role="alert"]')).toHaveCount(0);
      await calcular(page, { peso: '60', ftp: '451' });
      await expect(page.locator('p[role="alert"]')).toContainText('7,52 W/kg');
      await expect(resultados(page)).toHaveCount(0);
    });

    test('2494 · 1000 m en 10 min (6000 m/h) no es «Élite / Profesional»', async ({ page }) => {
      // REPARADO el 30/09/2026: el motor hace cumplir los rangos del desnivel y del tiempo y no
      // da veredicto por encima de 2000 m/h. La VAM no tenía ni el control de rangos que se añadió al W/kg: los min/max del
      // desnivel (0-3000) y del tiempo (1-600) son sugerencias del navegador (5000 m en 0,5 min
      // dan «600.000 m/h»), y aun dentro de ellos sale una VAM que triplica lo que la guía de
      // la misma página da como tope («los mejores escaladores han superado los 1.800 m/h»).
      // ENTRADA peso 70 · FTP 250 · desnivel 1000 m · tiempo 10 min → 1000 · 60 / 10 = 6000
      // ESPERADO un aviso y ningún veredicto sobre una VAM imposible
      // OBTENIDO «6000 m/h · Élite / Profesional»
      await abrirVam(page);
      await calcular(page, { peso: '70', ftp: '250', desnivel: '1000', tiempo: '10' });
      await expect(resultados(page).or(page.locator('p[role="alert"]'))).toBeVisible();
      if (await resultados(page).count()) {
        await expect(resultados(page)).not.toContainText('Élite / Profesional');
      }
      await expect(resultados(page)).toContainText('revisa el desnivel y el tiempo');
      // El W/kg, que no depende de la subida, se sigue publicando: 250 / 70 = 3,57
      await expect(resultados(page)).toContainText('3,57');

      // Fuera de los rangos declarados: 5000 m en 0,5 min daban «600.000 m/h»
      await calcular(page, { desnivel: '5000', tiempo: '0,5' });
      await expect(resultados(page)).toContainText('El desnivel debe estar entre 1 y 3000 m');
      await expect(resultados(page)).not.toContainText('Élite / Profesional');
      await calcular(page, { desnivel: '500', tiempo: '0,5' });
      await expect(resultados(page)).toContainText('El tiempo debe estar entre 1 y 600 minutos');

      // Control: una subida real sigue clasificándose. 1500 m en 50 min = 1800 m/h, por
      // debajo del techo de 2000.
      await calcular(page, { desnivel: '1500', tiempo: '50' });
      await expect(resultados(page)).toContainText('1800 m/h');
      await expect(resultados(page)).toContainText('Élite / Profesional');
    });

    test('2494 · el estimador no publica 34.687 W a 200 km/h (máximo declarado: 80)', async ({
      page,
    }) => {
      // REPARADO el 30/09/2026: el motor hace cumplir los tres rangos. calcularVatiosPorFuerzas
      // solo exigía masa y velocidad > 0: los rangos que
      // declaran sus campos (masa 30-200, velocidad 1-80, pendiente −15/25) no se cumplen.
      // ENTRADA 78 kg · 200 km/h · 0 % → (3,8246 + 604,94) N · 55,556 / 0,975 = 34.687 W
      // ESPERADO un aviso con el rango, como el de peso y FTP del formulario principal
      // OBTENIDO «Potencia estimada 34.687 W» sin una palabra
      const tarjeta = await abrirEstimador(page);
      await estimar(page, { masa: '78', velocidad: '200', pendiente: '0' });
      await expect(page.locator('p[role="alert"]')).toBeVisible();
      await expect(page.locator('p[role="alert"]')).toContainText('entre 1 y 80 km/h');
      await expect(tarjeta).toHaveCount(0);
      await estimar(page, { masa: '250', velocidad: '20', pendiente: '0' });
      await expect(page.locator('p[role="alert"]')).toContainText('entre 30 y 200 kg');
      await estimar(page, { masa: '78', velocidad: '20', pendiente: '30' });
      await expect(page.locator('p[role="alert"]')).toContainText('entre -15 y 25');
      // Control: en el borde declarado (25 %) sigue estimando, CASO 2
      await estimar(page, { masa: '78', velocidad: '10', pendiente: '25' });
      await expect(page.locator('p[role="alert"]')).toHaveCount(0);
      await expect(tarjeta).toContainText('543 W');
    });

    test('2495 · los veredictos y las zonas se leen con contraste 4,5:1', async ({ page }) => {
      // REPARADO el 30/09/2026: fondos más oscuros del mismo matiz, todos por encima de 5:1.
      // Las insignias ponían texto blanco de 12,5-12,8 px en negrita sobre colores
      // fijos: texto pequeño, exige 4,5:1. Medido el 30/09/2026 (igual en los dos temas):
      //   nivel  Cicloturista 2,87 · Principiante 3,54 · Semi-profesional 3,82 · Amateur 4,11
      //   zonas  Z1 2,80 · Z2 2,87 · Z3 2,19 · Z4 2,97 · Z5 3,82 (Z6 5,87 sí cumple)
      // El veredicto de la app ES el texto de la insignia.
      // ENTRADA 70 kg · FTP 150 W → 2,14 W/kg «Cicloturista»
      // ESPERADO ≥ 4,5:1 · OBTENIDO 2,87:1 (blanco sobre #27AE60) y Z3 2,19:1 (sobre #F39C12)
      await calcular(page, { peso: '70', ftp: '150' });
      await expect(resultados(page)).toContainText('Cicloturista');
      const insignia = resultados(page).locator('[class*="nivelBadge"]');
      expect(await contraste(insignia)).toBeGreaterThanOrEqual(4.5);
      const z3 = resultados(page).locator('[class*="zonaBadge"]').nth(2);
      await expect(z3).toHaveText('Z3');
      expect(await contraste(z3)).toBeGreaterThanOrEqual(4.5);
      // Las seis zonas, no solo la Z3 del caso
      const zonas = resultados(page).locator('[class*="zonaBadge"]');
      await expect(zonas).toHaveCount(6);
      for (let i = 0; i < 6; i++) {
        expect(await contraste(zonas.nth(i)), `zona Z${i + 1}`).toBeGreaterThanOrEqual(4.5);
      }
    });

    test('2496 · el azul de marca como texto pequeño llega a 4,5:1', async ({ page }) => {
      // REPARADO el 30/09/2026: --primary-texto para el texto, --primary-boton/--secondary-boton
      // bajo el blanco de los pasos, #9A4A10 en «Errores frecuentes» y clases con variante
      // oscura para los niveles de la tabla W/kg. Era `color: var(--primary)` (#2E86AB) sobre blanco da 4,11:1, y el texto es
      // pequeño (13-16 px en negrita): el título de la tabla de zonas, el del panel, los dos
      // plegables, los h4 de la guía y los rangos de vatios (3,96:1 en las filas pares). La
      // guía suma el h2 (3,77:1), el título de «Errores frecuentes» (#c0621a, 3,57:1), los
      // números de los pasos (blanco sobre el degradado de marca, 2,80:1; 2,23:1 en oscuro) y
      // los niveles de la tabla W/kg con color en línea (2,64-3,77:1; 2,25:1 «Profesional /
      // Élite» en oscuro). El token para texto es --primary-texto.
      // ENTRADA 70 kg · FTP 250 W → título «Zonas de Potencia…»
      // ESPERADO ≥ 4,5:1 · OBTENIDO 4,11:1
      await calcular(page, { peso: '70', ftp: '250' });
      const titulo = resultados(page).locator('h3', { hasText: 'Zonas de Potencia' });
      await expect(titulo).toBeVisible();
      expect(await contraste(titulo)).toBeGreaterThanOrEqual(4.5);
      // El resto de lo que medía el acta, en los dos temas
      await page.getByRole('button', { name: /Ver guía educativa/i }).click();
      // globals.css anima color y fondo 0,3 s al cambiar de tema: sin esto se mediría el color
      // a medio camino. Con movimiento reducido la transición dura 0,01 ms.
      await page.emulateMedia({ reducedMotion: 'reduce' });
      for (const tema of ['light', 'dark']) {
        await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), tema);
        const elementos: [string, Locator][] = [
          ['título de zonas', titulo],
          ['título del panel', page.locator('h2', { hasText: 'Datos de rendimiento' })],
          ['plegable VAM', page.getByRole('button', { name: /Calcular VAM/i })],
          ['rango Z2 (fila par)', resultados(page).locator('tbody tr').nth(1).locator('td').nth(3)],
          ['h2 de la guía', page.locator('h2', { hasText: '¿Qué es el FTP y cómo medirlo?' })],
          ['h4 de la guía', page.locator('h4', { hasText: 'Definición y fórmula' })],
          ['Errores frecuentes', page.locator('h3', { hasText: 'Errores Frecuentes' })],
          ['Cicloturista (tabla W/kg)', page.locator('td strong', { hasText: 'Cicloturista' })],
          ['Profesional / Élite (tabla W/kg)', page.locator('td strong', { hasText: 'Profesional / Élite' })],
        ];
        // expect.poll: el color cambia en el fotograma siguiente al del atributo (la transición
        // de globals.css, aun reducida, arranca en el valor viejo), y medir en el mismo instante
        // daba el azul CLARO sobre la tarjeta OSCURA: 2,79:1 que la página no muestra nunca.
        for (const [nombre, el] of elementos) {
          await expect
            .poll(() => contraste(el), { message: `${nombre} en tema ${tema}` })
            .toBeGreaterThanOrEqual(4.5);
        }
        // El número de paso va sobre un DEGRADADO, que `contraste()` no ve (lee backgroundColor
        // y sube hasta el blanco de la tarjeta): se mide el blanco contra cada parada del
        // degradado, y manda la peor.
        const paradas = await page
          .locator('[class*="stepNumber"]')
          .first()
          .evaluate((el) => {
            const lum = (s: string) => {
              const [r, g, b] = (s.match(/[\d.]+/g) ?? []).map(Number);
              const f = (c: number) => {
                const x = c / 255;
                return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
              };
              return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
            };
            const estilo = getComputedStyle(el);
            const texto = lum(estilo.color);
            return (estilo.backgroundImage.match(/rgba?\([^)]*\)/g) ?? []).map((c) => {
              const fondo = lum(c);
              return (Math.max(texto, fondo) + 0.05) / (Math.min(texto, fondo) + 0.05);
            });
          });
        expect(paradas.length, 'el número de paso tiene su degradado').toBeGreaterThanOrEqual(2);
        expect(Math.min(...paradas), `número de paso en tema ${tema}`).toBeGreaterThanOrEqual(4.5);
      }
    });

    test('2497 · el % de la tabla de zonas va separado con espacio duro', async ({ page }) => {
      // REPARADO el 30/09/2026 en el motor, la guía y el FAQ. Regla del 25/09/2026 (Ortografía
      // de la RAE, 2010): «15 %», con U+00A0. Los rótulos salían del motor (`hasta ${limite}%`,
      // lib/calculadoras/deporte.ts) y iban pegados; la guía repetía el patrón («10–20%»,
      // «2–5%», «70–80%» dos veces), el FAQ («95%») y la única que lo separaba («al 8 %») usaba
      // un espacio normal.
      // ENTRADA 70 kg · FTP 250 W → celda «% FTP» de Z1
      // ESPERADO «hasta 55 %» (con U+00A0) · OBTENIDO «hasta 55%»
      await calcular(page, { peso: '70', ftp: '250' });
      const celda = resultados(page).locator('tbody tr').first().locator('td').nth(2);
      expect(await celda.textContent()).toBe('hasta 55 %');
      expect(await resultados(page).locator('tbody tr').nth(1).locator('td').nth(2).textContent()).toBe(
        '55–75 %',
      );
      // Ni en la guía ni en el FAQ queda una cifra con el % pegado o con espacio normal
      await page.getByRole('button', { name: /Ver guía educativa/i }).click();
      const guia = await page.locator('main').textContent();
      expect(guia).not.toMatch(/\d[%]/);
      expect(guia).not.toMatch(/\d [%]/);
      const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
      const faq = bloques.find((b) => b.includes('"FAQPage"'))!;
      expect(faq).not.toMatch(/\d[%]|\d [%]/);
    });

    test('2498 · la tarjeta del estimador dice cuándo esa cifra vale como FTP', async ({
      page,
    }) => {
      // REPARADO el 30/09/2026: la tarjeta, la guía y el FAQ dicen que es la potencia a esa
      // velocidad, que solo vale como FTP tras un esfuerzo máximo de ~1 h. La guía («Sin potenciómetro: Esta misma página lo estima», en la sección del
      // FTP, remitiendo a un «Estimar mis vatios» que no existe con ese nombre) y el FAQ («Con
      // esa estimación —o con un FTP ya conocido— calcula el ratio W/kg y las seis zonas»)
      // tratan la potencia estimada como un FTP. El estimador da la potencia a la velocidad
      // introducida, que solo se aproxima al FTP si fue un esfuerzo máximo de alrededor de una
      // hora; la tarjeta no lo dice y no lleva la cifra al W/kg ni a las zonas.
      // ENTRADA 78 kg · 30 km/h · 0 % → «Potencia estimada 149 W»
      // ESPERADO que la tarjeta diga cuándo esa cifra sirve como FTP (o la lleve al cálculo)
      // OBTENIDO ninguna mención del FTP; el formulario principal sigue con 200 W
      const tarjeta = await abrirEstimador(page);
      await estimar(page, { masa: '78', velocidad: '30', pendiente: '0' });
      await expect(tarjeta).toContainText('149 W');
      await expect(tarjeta).toContainText('FTP');
      await expect(tarjeta).toContainText('alrededor de una hora');
      // La guía ya no remite a un «Estimar mis vatios» que no existe: nombra el botón real
      await page.getByRole('button', { name: /Ver guía educativa/i }).click();
      const guia = await page.locator('main').innerText();
      expect(guia).not.toContain('«Estimar mis vatios»');
      expect(guia).toContain('«¿No tienes potenciómetro? Estima tus vatios a partir de la velocidad»');
    });

    test('2499 · el FAQ usa la misma escala de niveles que la calculadora', async ({ page }) => {
      // REPARADO el 30/09/2026: el FAQ enuncia la escala de la app. El FAQPage (lo que leen Bing Copilot, ChatGPT o Perplexity) desplaza las
      // etiquetas un escalón respecto a la app y a su propia guía visible:
      //   W/kg: «Un ciclista recreativo medio suele estar entre 2,5 y 3,5 W/kg», cuando la app
      //         llama a 2,5-3,5 «Amateur · Entrenamiento estructurado» y pone lo recreativo
      //         («Salidas recreativas regulares», «fondo recreativo») en 1,5-2,5 «Cicloturista».
      //   VAM:  «Un ciclista aficionado suele tener una VAM de 800-1.000 m/h», cuando la app
      //         llama a 800-1000 «Cicloturista» y reserva «Amateur» para 1000-1200.
      // Es el patrón del hallazgo 239 (la guía un escalón desfasada), ahora en el FAQ.
      // ENTRADA 900 m/h → app «Cicloturista» · FAQ «aficionado»; 3,00 W/kg → app «Amateur» ·
      //         FAQ «recreativo medio»
      const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
      const faq = bloques.map((b) => JSON.parse(b)).find((j) => j['@type'] === 'FAQPage');
      const textos: string[] = faq.mainEntity.map(
        (q: { acceptedAnswer: { text: string } }) => q.acceptedAnswer.text,
      );
      const todo = textos.join(' ');
      expect(todo).not.toContain('recreativo medio suele estar entre 2,5 y 3,5');
      expect(todo).not.toContain('aficionado suele tener una VAM de 800-1.000');
      // Y dice lo mismo que la calculadora en los dos casos del acta
      expect(todo).toContain('de 2,5 a 3,5, amateur con entrenamiento estructurado');
      expect(todo).toContain('de 800 a 1.000, cicloturista');
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

    test('2491 · en móvil, teclear «-7» en la pendiente da la bajada', async ({
      page,
    }) => {
      // REPARADO el 30/09/2026. El hallazgo del «-» borrado, con toque y viewport de móvil.
      // ENTRADA 78 kg · 15 km/h · tocar la pendiente, seleccionar el 0 y teclear «-7»
      // ESPERADO «No hace falta pedalear», sobran 197 W · OBTENIDO «07» y 259 W de subida
      const tarjeta = await abrirEstimador(page);
      await estimar(page, { masa: '78', velocidad: '15' });
      await teclear(page, '#pendiente', '-7', true);
      await page.getByRole('button', { name: /Estimar vatios/i }).tap();
      await expect(page.locator('#pendiente')).toHaveValue('-7');
      await expect(tarjeta).toContainText('No hace falta pedalear');
    });
  });
});

/* ═══════════════════════════════════════════════════════════════════════════════════════
 * Inspector 03/10/2026 — verificación de la reparación 18411e51 (hallazgos 2491-2499) y del
 * cambio 10b7eb5f en lib/calculadoras/deporte.ts (la reparación de calculadora-swolf-natacion).
 *
 * 10b7eb5f solo toca la sección 6 del motor (SWOLF): `git diff 18411e51 HEAD` de ese fichero no
 * tiene ningún bloque antes de la línea 548, así que calcularPotenciaCiclismo y
 * calcularVatiosPorFuerzas siguen siendo las mismas. Los casos de abajo lo confirman por
 * comportamiento, y TECLEANDO: fill() escribe el valor entero de una vez y no ve los estados
 * intermedios («-», «14.») que el 2491 reescribía a 0.
 *
 * CONSTANTES — las que declara la app, y de dónde salen
 *   g = 9,80665 m/s² · gravedad normal (CGPM 1901, folleto SI del BIPM)
 *   ρ = 1,225 kg/m³ · atmósfera estándar ISA a nivel del mar y 15 °C (ISO 2533)
 *   Crr 0,005 · CdA 0,32 m² · η 0,975 · los de la app, SIN fuente (hallazgo de este día)
 *   Sin viento: el modelo no lo admite y la tarjeta lo advierte.
 *   P = (m·g·sen θ + Crr·m·g·cos θ + ½·ρ·CdA·v²)·v / η, con θ = arctan(pendiente / 100)
 *
 * LOS CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *   CASO 1 (normal)
 *     · 64 kg · FTP 230 W → 230 / 64 = 3,59375 → «3,59», en [3,5; 4,5) → «Amateur competitivo».
 *       Zonas: 55/75/90/105/120/150 % de 230 = 126,5 · 172,5 · 207 · 241,5 · 276 · 345, y
 *       Math.round sube los ,5 → 127 · 173 · 207 · 242 · 276 · 345, es decir
 *       0–127 · 128–173 · 174–207 · 208–242 · 243–276 · 277–345.
 *     · VAM «1.250» m en 62 min: 1250 · 60 / 62 = 1209,68 → «1210 m/h», en [1200; 1400) →
 *       «Amateur fuerte» (el punto es de millar: el criterio del catálogo).
 *     · Punto decimal: «70.5» kg y «250.5» W → 3,5532 → «3,55»; zonas 137,775 · 187,875 · 225,45 ·
 *       263,025 · 300,6 · 375,75 → 0–138 · 139–188 · 189–225 · 226–263 · 264–301 · 302–376.
 *     · Estimador «82,5» kg · «18.5» km/h · «5,5» %: v = 5,138889 m/s · sen θ = 0,0549170 ·
 *       cos θ = 0,9984909 → F_g 44,4305 N · F_r 4,0391 N · F_a 5,1760 N →
 *       P = 53,6456 · 5,138889 / 0,975 = 282,75 → «283 W» (reparto 234 · 21 · 27 W);
 *       VAM = 5,138889 · 0,0549170 · 3600 = 1015,96 → «1016 m/h».
 *   CASO 2 (límite)
 *     · Bajada «-4» % a 30 km/h con 78 kg: F_g −30,5723 · F_r 3,8215 · F_a 13,6111 N →
 *       P = −13,1397 · 8,3333 / 0,975 = −112,30 → no se pedalea y sobran «112 W».
 *     · Todo al mínimo del estimador, 30 kg · 1 km/h · −15 %: P = −12,01 → sobran «12 W».
 *     · W/kg: 337 / 45 = 7,489 → «7,49», aún admitido · 320 / 40 = 8,00 → aviso ·
 *       50 / 150 = 0,33 → «Principiante» · 29,9 kg y 600,5 W, fuera de rango.
 *     · VAM: 3000 m en 90 min = 2000 m/h, justo el techo (se clasifica, «Élite / Profesional»);
 *       en 89 min, 2022,47 → «2022 m/h» con aviso y sin veredicto.
 *   CASO 3 (rechazo): masa «-78», velocidad «abc», pendiente vacía, FTP «200W», desnivel «abc».
 * ═══════════════════════════════════════════════════════════════════════════════════════ */

/**
 * Teclea carácter a carácter y comprueba, tras CADA tecla, que el campo muestra lo escrito hasta
 * ahí. Es la forma de ver el hallazgo 2491: con el estado numérico, el «-» o el «14.» se
 * reescribían a «0» en cuanto se pulsaban.
 */
async function teclearViendo(page: Page, selector: string, texto: string, tocar = false): Promise<void> {
  await esperarHidratacion(page, [selector]);
  if (tocar) await page.tap(selector);
  else await page.click(selector);
  await page.keyboard.press('Control+A');
  let escrito = '';
  for (const letra of texto) {
    await page.keyboard.type(letra);
    escrito += letra;
    await expect(page.locator(selector), `tras teclear «${escrito}»`).toHaveValue(escrito);
  }
}

/**
 * Contraste WCAG del texto contra el fondo que se VE: compone las capas semitransparentes de los
 * ancestros sobre la primera opaca. `contraste()`, más arriba, salta las semitransparentes y mide
 * contra la opaca de debajo, así que no ve tintes como el de `.warningBox` o `.vamGrid` en oscuro.
 * Contrastado por píxel el 03/10/2026: el fondo real de la pista del desnivel en oscuro es
 * rgb(45, 54, 57) y el de «Errores frecuentes», rgb(69, 57, 49), los mismos que da esta suma.
 */
async function contrasteSobreFondoReal(elemento: Locator): Promise<number> {
  return elemento.evaluate((el) => {
    const rgba = (s: string): number[] => {
      const n = (s.match(/[\d.]+/g) ?? []).map(Number);
      return [n[0], n[1], n[2], n.length > 3 ? n[3] : 1];
    };
    const lum = ([r, g, b]: number[]): number => {
      const f = (c: number) => {
        const x = c / 255;
        return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const capas: number[][] = [];
    for (let n: Element | null = el; n; n = n.parentElement) {
      const c = rgba(getComputedStyle(n).backgroundColor);
      if (c[3] > 0) {
        capas.push(c);
        if (c[3] >= 1) break;
      }
    }
    let fondo = [255, 255, 255];
    for (let i = capas.length - 1; i >= 0; i--) {
      const [r, g, b, a] = capas[i];
      fondo = [r * a + fondo[0] * (1 - a), g * a + fondo[1] * (1 - a), b * a + fondo[2] * (1 - a)];
    }
    const t = rgba(getComputedStyle(el).color);
    const texto = [0, 1, 2].map((i) => t[i] * t[3] + fondo[i] * (1 - t[3]));
    const a = lum(texto);
    const b = lum(fondo);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  });
}

test.describe('Inspector 03/10/2026', () => {
  test.use({ locale: 'es-ES' });

  test.describe('CASO 1 (normal) — tecleado, no con fill()', () => {
    test('64 kg y FTP 230 W: «3,59 W/kg» y las zonas redondean los ,5 hacia arriba', async ({
      page,
    }) => {
      await teclearViendo(page, '#peso', '64');
      await teclearViendo(page, '#ftp', '230');
      await page.getByRole('button', { name: /Calcular potencia/i }).click();
      // 230 / 64 = 3,59375 → 3,59, en [3,5; 4,5)
      await expect(resultados(page)).toContainText('3,59');
      await expect(resultados(page)).toContainText('Amateur competitivo');
      await expect(resultados(page)).toContainText('basadas en tu FTP: 230 W');
      // 126,5 → 127 y 241,5 → 242: el ,5 sube, y cada zona empieza en la anterior + 1
      expect(await rangosDeZona(page)).toEqual([
        [0, 127],
        [128, 173],
        [174, 207],
        [208, 242],
        [243, 276],
        [277, 345],
      ]);
    });

    test('VAM con el desnivel «1.250» tecleado: el punto es de millar, 1210 m/h «Amateur fuerte»', async ({
      page,
    }) => {
      await teclearViendo(page, '#peso', '64');
      await teclearViendo(page, '#ftp', '230');
      await abrirVam(page);
      // «1.» no es todavía un número: con el estado numérico de antes se reescribía a «0»
      await teclearViendo(page, '#desnivel', '1.250');
      await teclearViendo(page, '#tiempoMin', '62');
      await page.getByRole('button', { name: /Calcular potencia/i }).click();
      // 1250 · 60 / 62 = 1209,68 → 1210, en [1200; 1400)
      await expect(resultados(page)).toContainText('1210 m/h');
      const tarjetaVam = resultados(page).locator('div').filter({ hasText: /^VAM/ }).first();
      await expect(tarjetaVam).toContainText('Amateur fuerte');
    });

    test('peso «70.5» y FTP «250.5» con punto decimal: «3,55 W/kg» y zonas desde 137,775 W', async ({
      page,
    }) => {
      await teclearViendo(page, '#peso', '70.5');
      await teclearViendo(page, '#ftp', '250.5');
      await page.getByRole('button', { name: /Calcular potencia/i }).click();
      // 250,5 / 70,5 = 3,5532 → 3,55. Si el punto se perdiera (705 kg, 2505 W) saldría un aviso.
      await expect(resultados(page)).toContainText('3,55');
      expect(await rangosDeZona(page)).toEqual([
        [0, 138],
        [139, 188],
        [189, 225],
        [226, 263],
        [264, 301],
        [302, 376],
      ]);
    });

    test('estimador tecleado: 82,5 kg · 18.5 km/h · 5,5 % son 283 W y 1016 m/h', async ({ page }) => {
      const tarjeta = await abrirEstimador(page);
      await teclearViendo(page, '#masaTotal', '82,5');
      await teclearViendo(page, '#velocidad', '18.5');
      await teclearViendo(page, '#pendiente', '5,5');
      await page.getByRole('button', { name: /Estimar vatios/i }).click();
      // P = (44,4305 + 4,0391 + 5,1760) N · 5,138889 m/s / 0,975 = 282,75 W
      await expect(tarjeta).toContainText('Potencia estimada');
      await expect(tarjeta).toContainText('283 W');
      await expect(tarjeta).toContainText('234 W contra la gravedad');
      await expect(tarjeta).toContainText('21 W de rodadura');
      await expect(tarjeta).toContainText('27 W contra el aire');
      // VAM = 5,138889 · 0,0549170 · 3600 = 1015,96
      await expect(tarjeta).toContainText('1016 m/h de VAM');
    });
  });

  test.describe('CASO 2 (límite) — bajada, mínimos y techos', () => {
    test('bajada tecleada «-4» % a 30 km/h: no se pedalea y sobran 112 W', async ({ page }) => {
      const tarjeta = await abrirEstimador(page);
      await estimar(page, { masa: '78', velocidad: '30' });
      await teclearViendo(page, '#pendiente', '-4');
      await page.getByRole('button', { name: /Estimar vatios/i }).click();
      // (−30,5723 + 3,8215 + 13,6111) N · 8,3333 m/s / 0,975 = −112,30 W
      await expect(tarjeta).toContainText('No hace falta pedalear');
      await expect(tarjeta).toContainText('sobran 112 W');
      await expect(tarjeta).not.toContainText('Potencia estimada');
    });

    test('el estimador con todo al mínimo (30 kg · 1 km/h · −15 %): sobran 12 W', async ({ page }) => {
      const tarjeta = await abrirEstimador(page);
      await estimar(page, { masa: '30', velocidad: '1', pendiente: '-15' });
      await esperarValorEnReact(page, '#pendiente', '-15');
      // (−43,6417 + 1,4547 + 0,0151) N · 0,27778 m/s / 0,975 = −12,01 W
      await expect(tarjeta).toContainText('No hace falta pedalear');
      await expect(tarjeta).toContainText('sobran 12 W');
    });

    test('bordes del W/kg y de los rangos: 7,49 se clasifica, 8,00 se rechaza, 0,33 es «Principiante»', async ({
      page,
    }) => {
      const aviso = page.locator('p[role="alert"]');
      // 337 / 45 = 7,489 → 7,49, por debajo del techo de 7,5
      await calcular(page, { peso: '45', ftp: '337' });
      await expect(resultados(page)).toContainText('7,49');
      await expect(resultados(page)).toContainText('Profesional / Élite');
      await expect(aviso).toHaveCount(0);
      // 320 / 40 = 8,00: dos datos dentro de rango, cociente imposible (hallazgo 2493)
      await calcular(page, { peso: '40', ftp: '320' });
      await expect(aviso).toContainText('8,00 W/kg');
      await expect(aviso).toContainText('revisa el peso y el FTP');
      await expect(resultados(page)).toHaveCount(0);
      // 50 / 150 = 0,33: el extremo inferior admitido
      await calcular(page, { peso: '150', ftp: '50' });
      await expect(resultados(page)).toContainText('0,33');
      await expect(resultados(page)).toContainText('Principiante');
      // Una décima fuera de cada rango
      await calcular(page, { peso: '29,9', ftp: '200' });
      await expect(aviso).toContainText('entre 30 y 150 kg');
      await calcular(page, { peso: '70', ftp: '600,5' });
      await expect(aviso).toContainText('entre 50 y 600 W');
    });

    test('VAM en el techo: 3000 m en 90 min son 2000 m/h y se clasifica; en 89 min, aviso', async ({
      page,
    }) => {
      await abrirVam(page);
      // 3000 · 60 / 90 = 2000, que no supera el techo de 2000 m/h
      await calcular(page, { peso: '70', ftp: '250', desnivel: '3000', tiempo: '90' });
      await expect(resultados(page)).toContainText('2000 m/h');
      await expect(resultados(page)).toContainText('Élite / Profesional');
      // 3000 · 60 / 89 = 2022,47 → aviso y sin veredicto
      await calcular(page, { desnivel: '3000', tiempo: '89' });
      await expect(resultados(page)).toContainText('2022 m/h');
      await expect(resultados(page)).toContainText('revisa el desnivel y el tiempo');
      await expect(resultados(page)).not.toContainText('Élite / Profesional');
    });
  });

  test.describe('CASO 3 (rechazo)', () => {
    test('estimador: masa «-78», velocidad «abc» y pendiente vacía, cada una con su aviso', async ({
      page,
    }) => {
      const tarjeta = await abrirEstimador(page);
      const aviso = page.locator('p[role="alert"]');
      await teclearViendo(page, '#masaTotal', '-78');
      await page.getByRole('button', { name: /Estimar vatios/i }).click();
      await expect(aviso).toContainText('La masa total debe ser un número mayor que 0 kg.');
      await expect(tarjeta).toHaveCount(0);

      await teclear(page, '#masaTotal', '78');
      await teclearViendo(page, '#velocidad', 'abc');
      await page.getByRole('button', { name: /Estimar vatios/i }).click();
      await expect(aviso).toContainText('La velocidad debe ser un número mayor que 0 km/h.');
      await expect(tarjeta).toHaveCount(0);

      // Una pendiente vacía no se toma por llano: se pide
      await teclear(page, '#velocidad', '20');
      await page.fill('#pendiente', '');
      await esperarValorEnReact(page, '#pendiente', '');
      await page.getByRole('button', { name: /Estimar vatios/i }).click();
      await expect(aviso).toContainText('La pendiente debe ser un número.');
      await expect(tarjeta).toHaveCount(0);
    });

    test('formulario principal: «200W» de FTP y «abc» de desnivel no se leen como números', async ({
      page,
    }) => {
      const aviso = page.locator('p[role="alert"]');
      await teclear(page, '#ftp', '200W');
      await page.getByRole('button', { name: /Calcular potencia/i }).click();
      await expect(aviso).toContainText('El FTP debe ser un número mayor que 0 W.');
      await expect(resultados(page)).toHaveCount(0);

      await teclear(page, '#ftp', '200');
      await abrirVam(page);
      await teclear(page, '#desnivel', 'abc');
      await teclear(page, '#tiempoMin', '45');
      await page.getByRole('button', { name: /Calcular potencia/i }).click();
      await expect(aviso).toContainText('El desnivel y el tiempo deben ser números');
      await expect(resultados(page)).toHaveCount(0);
    });
  });

  test('control del contraste: en claro, la pista del desnivel y «Errores frecuentes» pasan de 4,5:1', async ({
    page,
  }) => {
    // Medido por píxel el 03/10/2026: 4,81:1 y 5,30:1. Es el control del caso abierto de abajo,
    // con el mismo medidor: si este falla, el que falla es el medidor.
    await abrirVam(page);
    await page.getByRole('button', { name: /Ver guía educativa/i }).click();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
    const pista = page.locator('[class*="inputHint"]', { hasText: 'Hasta 3000 m' });
    const errores = page.locator('h3', { hasText: 'Errores Frecuentes' });
    await expect.poll(() => contrasteSobreFondoReal(pista)).toBeGreaterThanOrEqual(4.5);
    await expect.poll(() => contrasteSobreFondoReal(errores)).toBeGreaterThanOrEqual(4.5);
  });

  /* Hallazgos ABIERTOS el 03/10/2026. Van con `test.fail()`: afirman lo que DEBERÍA ocurrir, y
   * el día que se reparen pasarán y el runner avisará para quitar la marca. */
  test.describe('Hallazgos del 03/10/2026', () => {
    test.fail(
      'ABIERTO, hallazgo (inspector 03/10/2026) · con el plegable de la VAM cerrado, sus campos ocultos siguen contando',
      async ({ page }) => {
        // ENTRADA 70 kg · FTP 250 W · abrir «Calcular VAM», desnivel «abc» y tiempo 45, cerrar
        //         el plegable y pulsar «Calcular potencia»
        // ESPERADO la VAM ya no se pide: «3,57 W/kg» sin aviso (250 / 70 = 3,5714)
        // OBTENIDO «El desnivel y el tiempo deben ser números» y ningún resultado, con los dos
        //          campos ocultos; con 850 m y 45 min escondidos sale «1133 m/h · Amateur»
        await calcular(page, { peso: '70', ftp: '250' });
        await abrirVam(page);
        await teclear(page, '#desnivel', 'abc');
        await teclear(page, '#tiempoMin', '45');
        await page.getByRole('button', { name: /Calcular VAM/i }).click();
        await expect(page.locator('#desnivel')).toHaveCount(0);
        await page.getByRole('button', { name: /Calcular potencia/i }).click();
        await expect(page.locator('p[role="alert"]')).toHaveCount(0);
        await expect(resultados(page)).toContainText('3,57');
        // Y con datos válidos escondidos tampoco sale una VAM que el usuario plegó
        await abrirVam(page);
        await teclear(page, '#desnivel', '850');
        await page.getByRole('button', { name: /Calcular VAM/i }).click();
        await page.getByRole('button', { name: /Calcular potencia/i }).click();
        await expect(resultados(page)).toContainText('3,57');
        await expect(resultados(page)).not.toContainText('m/h');
      },
    );

    test.fail(
      'ABIERTO, hallazgo (inspector 03/10/2026) · el estimador publica potencias que ningún ciclista sostiene',
      async ({ page }) => {
        // La reparación del 2494 hizo cumplir el rango de CADA campo, pero no la combinación (el
        // patrón del 2493 en el formulario principal, que sí tiene techo de 7,5 W/kg).
        // ENTRADA 78 kg · 80 km/h · 0 %, todo dentro de lo admitido
        // ESPERADO un aviso: a mano, (3,8246 + 96,7901) N · 22,2222 m/s / 0,975 = 2293 W de
        //          «velocidad media sostenida», cuando la misma página rechaza un FTP de más de 600 W
        // OBTENIDO «Potencia estimada 2293 W», y con 200 kg · 80 km/h · 25 %, «13.265 W» y
        //          «19.403 m/h de VAM», sin una palabra
        const tarjeta = await abrirEstimador(page);
        await estimar(page, { masa: '78', velocidad: '80', pendiente: '0' });
        await expect(page.locator('p[role="alert"]')).toBeVisible();
        await expect(tarjeta).toHaveCount(0);
        await estimar(page, { masa: '200', velocidad: '80', pendiente: '25' });
        await expect(page.locator('p[role="alert"]')).toBeVisible();
        await expect(tarjeta).toHaveCount(0);
      },
    );

    test.fail(
      'ABIERTO, hallazgo (inspector 03/10/2026) · el mínimo de 1 m que declara el aviso del desnivel no se cumple',
      async ({ page }) => {
        // El aviso del motor dice «El desnivel debe estar entre 1 y 3000 m», pero solo exige > 0.
        // ENTRADA 70 kg · FTP 250 W · desnivel «0,85» (kilómetros escritos en el campo de metros)
        //         · 45 min
        // ESPERADO el aviso del rango · OBTENIDO 0,85 · 60 / 45 = 1,13 → «1 m/h · Principiante»
        await abrirVam(page);
        await calcular(page, { peso: '70', ftp: '250', desnivel: '0,85', tiempo: '45' });
        await expect(resultados(page)).toContainText('entre 1 y 3000 m');
      },
    );

    test.fail(
      'ABIERTO, hallazgo (inspector 03/10/2026) · en una bajada suave el reparto rotula «-153 W contra la gravedad»',
      async ({ page }) => {
        // El 252 retiró la potencia negativa del total, pero el reparto sigue publicando la
        // componente negativa como «esfuerzo»: en esa bajada la gravedad APORTA 153 W.
        // ENTRADA 78 kg · 35 km/h · −2 %
        // ESPERADO a mano P = (−15,2953 + 3,8238 + 18,5262) N · 9,72222 / 0,975 = 70,35 → «70 W», con
        //          la gravedad descrita como ayuda (153 W a favor)
        // OBTENIDO «Reparto del esfuerzo: -153 W contra la gravedad · 38 W de rodadura · 185 W
        //          contra el aire»
        const tarjeta = await abrirEstimador(page);
        await estimar(page, { masa: '78', velocidad: '35', pendiente: '-2' });
        await esperarValorEnReact(page, '#pendiente', '-2');
        await expect(tarjeta).toContainText('Potencia estimada');
        await expect(tarjeta).toContainText('70 W');
        expect(await tarjeta.innerText()).not.toMatch(/-\d+ W contra la gravedad/);
      },
    );

    test.fail(
      'ABIERTO, hallazgo (inspector 03/10/2026) · la tarjeta del estimador no cita fuente de Crr y CdA ni declara la transmisión',
      async ({ page }) => {
        // ENTRADA estimador 78 kg · 20 km/h · 0 %
        // ESPERADO los supuestos con su fuente, y los cuatro: también el rendimiento de la
        //          transmisión (η 0,975, un 2,5 % de pérdida que el cálculo aplica)
        // OBTENIDO «supone asfalto en buen estado (Crr 0,005), posición sobre las manetas
        //          (CdA 0,32 m²) y aire a nivel del mar», sin fuente ni transmisión
        const tarjeta = await abrirEstimador(page);
        await estimar(page, { masa: '78', velocidad: '20', pendiente: '0' });
        // La tarjeta entera, no un párrafo concreto: si la reparación reescribe la frase, un
        // localizador fijo daría error y el test.fail seguiría «fallando como se espera».
        await expect(tarjeta).toContainText('56 W');
        const supuestos = await tarjeta.innerText();
        expect(supuestos).toContain('Crr 0,005');
        expect(supuestos).toMatch(/transmisi/i);
        // Una fuente lleva su año; es la única forma de comprobarla sin fijar cuál
        expect(supuestos).toMatch(/\b(19|20)\d{2}\b/);
      },
    );

    test.fail(
      'ABIERTO, hallazgo (inspector 03/10/2026) · las zonas no nombran el modelo de Coggan y las escalas no citan fuente',
      async ({ page }) => {
        // ENTRADA 70 kg · FTP 250 W y abrir la guía
        // ESPERADO las zonas atribuidas a su autor (Coggan: el motor lo dice en un comentario) y
        //          las escalas de W/kg y VAM con su fuente
        // OBTENIDO «Zonas de Potencia (basadas en tu FTP: 250 W)» y tablas sin fuente ni autor
        await calcular(page, { peso: '70', ftp: '250' });
        await page.getByRole('button', { name: /Ver guía educativa/i }).click();
        const texto = await page.locator('main').innerText();
        expect(texto).toContain('Coggan');
      },
    );

    test.fail(
      'ABIERTO, hallazgo (inspector 03/10/2026) · «Semi-profesional» con guion y «el VAM» frente a «la VAM»',
      async ({ page }) => {
        // ENTRADA 70 kg · FTP 350 W → 5,00 W/kg, en [4,5; 5,5)
        // ESPERADO «Semiprofesional» (prefijo unido a la base, como ya escribe el FAQ) y «la VAM»
        //          (velocidad), como dicen el FAQ y los avisos del motor
        // OBTENIDO la insignia «Semi-profesional» y, en la guía, «¿Qué es el VAM?» y «El VAM varía»
        await calcular(page, { peso: '70', ftp: '350' });
        await expect(resultados(page)).toContainText('5,00');
        await page.getByRole('button', { name: /Ver guía educativa/i }).click();
        const texto = await page.locator('main').innerText();
        expect(texto).not.toMatch(/[Ss]emi-profesional/);
        expect(texto).not.toMatch(/\b[Ee]l VAM\b/);
      },
    );

    test.fail(
      'ABIERTO, hallazgo (inspector 03/10/2026) · en oscuro, las pistas del plegable y «Errores frecuentes» no llegan a 4,5:1',
      async ({ page }) => {
        // Texto pequeño sobre un tinte semitransparente: la pista (12 px, --text-muted #9B9B9B)
        // sobre el .vamGrid oscuro y el h3 (15,2 px en negrita, #E09060) sobre el .warningBox
        // oscuro. El 2496 midió con `contraste()`, que salta los tintes.
        // ENTRADA tema oscuro, plegable de la VAM y guía abiertos
        // ESPERADO ≥ 4,5:1 · OBTENIDO 4,45:1 la pista «Hasta 3000 m» (y las del estimador) y
        //          4,42:1 «Errores Frecuentes…», medidos por píxel
        await abrirVam(page);
        await page.getByRole('button', { name: /Ver guía educativa/i }).click();
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
        const pista = page.locator('[class*="inputHint"]', { hasText: 'Hasta 3000 m' });
        const errores = page.locator('h3', { hasText: 'Errores Frecuentes' });
        await expect
          .poll(() => contrasteSobreFondoReal(pista), { timeout: 3000 })
          .toBeGreaterThanOrEqual(4.5);
        await expect
          .poll(() => contrasteSobreFondoReal(errores), { timeout: 3000 })
          .toBeGreaterThanOrEqual(4.5);
      },
    );
  });

  test.describe('Móvil 412×839 (Pixel 7) — tecleando con toque', () => {
    test.use({
      viewport: { width: 412, height: 839 },
      userAgent:
        'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
      deviceScaleFactor: 2.625,
      isMobile: true,
      hasTouch: true,
    });

    // Un solo campo tecleado por test: los demás se siembran con fill() y se espera a React,
    // porque teclear, tocar otro campo y volver a teclear puede fallar en falso en el Chromium
    // móvil emulado.
    test('«18.5» tecleado en la velocidad: 283 W y 1016 m/h', async ({ page }) => {
      const tarjeta = await abrirEstimador(page);
      await page.fill('#masaTotal', '82,5');
      await esperarValorEnReact(page, '#masaTotal', '82,5');
      await page.fill('#pendiente', '5,5');
      await esperarValorEnReact(page, '#pendiente', '5,5');
      await teclearViendo(page, '#velocidad', '18.5', true);
      await page.getByRole('button', { name: /Estimar vatios/i }).tap();
      // Mismo cálculo que el CASO 1 de escritorio: 282,75 W y 1015,96 m/h
      await expect(tarjeta).toContainText('283 W');
      await expect(tarjeta).toContainText('1016 m/h de VAM');
    });

    test('«-4» tecleado en la pendiente: no se pedalea y sobran 112 W', async ({ page }) => {
      const tarjeta = await abrirEstimador(page);
      await page.fill('#masaTotal', '78');
      await esperarValorEnReact(page, '#masaTotal', '78');
      await page.fill('#velocidad', '30');
      await esperarValorEnReact(page, '#velocidad', '30');
      await teclearViendo(page, '#pendiente', '-4', true);
      await page.getByRole('button', { name: /Estimar vatios/i }).tap();
      await expect(tarjeta).toContainText('No hace falta pedalear');
      await expect(tarjeta).toContainText('sobran 112 W');
    });

    test('«250.5» tecleado en el FTP con 70,5 kg: 3,55 W/kg', async ({ page }) => {
      await page.fill('#peso', '70,5');
      await esperarValorEnReact(page, '#peso', '70,5');
      await teclearViendo(page, '#ftp', '250.5', true);
      await page.getByRole('button', { name: /Calcular potencia/i }).tap();
      // 250,5 / 70,5 = 3,5532 → 3,55
      await expect(resultados(page)).toContainText('3,55');
      await expect(resultados(page)).toContainText('302 – 376 W');
    });

    test.fail(
      'ABIERTO, hallazgo (inspector 03/10/2026) · con el estimador abierto, el aviso del formulario principal cae fuera de la pantalla',
      async ({ page }) => {
        // El aviso es único y se pinta DETRÁS del panel del estimador: con el panel abierto queda
        // muy por debajo del botón «Calcular potencia», y al pulsarlo no cambia nada a la vista.
        // ENTRADA abrir el estimador, vaciar el peso y tocar «Calcular potencia»
        // ESPERADO el aviso «El peso debe ser un número mayor que 0 kg.» a la vista
        // OBTENIDO el aviso a 1045 px de la parte superior de una pantalla de 839 (1830 px si la
        //          tarjeta del estimador está abierta); medido el 03/10/2026
        await page.getByRole('button', { name: /Estima tus vatios/i }).tap();
        await expect(page.locator('#masaTotal')).toBeVisible();
        await page.fill('#peso', '');
        await esperarValorEnReact(page, '#peso', '');
        await page.getByRole('button', { name: /Calcular potencia/i }).tap();
        const aviso = page.locator('p[role="alert"]');
        await expect(aviso).toContainText('El peso debe ser un número mayor que 0 kg.');
        await expect(aviso).toBeInViewport();
      },
    );

    test.fail(
      'ABIERTO, hallazgo (inspector 03/10/2026) · en el flujo que propone la tarjeta, el W/kg aparece fuera de la pantalla',
      async ({ page }) => {
        // Mismo hallazgo que el anterior, en el camino BUENO: la tarjeta del estimador invita a
        // «escribirla como FTP arriba», y los resultados del formulario principal también se
        // pintan detrás del panel del estimador.
        // ENTRADA estimar 78 kg · 15 km/h · 7 % (259 W), escribir 259 como FTP con 70 kg y tocar
        //         «Calcular potencia»
        // ESPERADO «3,70 W/kg» a la vista (259 / 70 = 3,70)
        // OBTENIDO los resultados empiezan a 1372 px en una pantalla de 839; medido el 03/10/2026
        const tarjeta = await abrirEstimador(page);
        await page.fill('#masaTotal', '78');
        await esperarValorEnReact(page, '#masaTotal', '78');
        await page.fill('#velocidad', '15');
        await esperarValorEnReact(page, '#velocidad', '15');
        await page.fill('#pendiente', '7');
        await esperarValorEnReact(page, '#pendiente', '7');
        await page.getByRole('button', { name: /Estimar vatios/i }).tap();
        await expect(tarjeta).toContainText('259 W');
        await page.fill('#ftp', '259');
        await esperarValorEnReact(page, '#ftp', '259');
        await page.getByRole('button', { name: /Calcular potencia/i }).tap();
        await expect(resultados(page)).toContainText('3,70');
        await expect(resultados(page)).toBeInViewport();
      },
    );
  });
});
