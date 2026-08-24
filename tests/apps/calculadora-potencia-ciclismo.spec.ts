import { test, expect, Page } from '@playwright/test';

/**
 * Inspector — calculadora-potencia-ciclismo (segmento MOTOR de cálculo, riesgo 2)
 *
 * Primera inspección: 24/08/2026 (9 hallazgos, 237–245).
 * Segunda inspección: 24/08/2026, DESPUÉS de repararlos todos — este fichero sustituye al
 * anterior: conserva sus casos válidos, corrige dos regex suyas que habían perdido los
 * escapes (`/^d+ – d+ W$/` no casaba nada y dejaba la comprobación de contigüidad INERTE) y
 * añade los bordes que la reparación introdujo.
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
 *   240 promesa incumplida ............. REPARADO con el estimador por fuerzas (CASO 1b),
 *                                        salvo el FAQ y la tarjeta «Sin potenciómetro»
 *                                        (hallazgo abierto 5)
 *   241 sliders aria-hidden tabulables . REPARADO (bloque de accesibilidad)
 *   242 disclaimer exento .............. REPARADO: DisclaimerCard médico, severidad alta y no
 *                                        colapsable; ya no hay «@disclaimer: exempt»
 *   243 VAM que desaparecía sin decirlo . REPARADO (CASO 2), salvo con desnivel 0
 *                                        (hallazgo abierto 4)
 *   244 huecos entre zonas ............. REPARADO (CASO 1a y 2), con un borde nuevo en FTP
 *                                        absurdamente bajos (hallazgo abierto 3)
 *   245 vatios sin formatNumber() ...... REPARADO; la mitad del rango declarado, NO
 *                                        (hallazgo abierto 2)
 *
 * HALLAZGOS ABIERTOS: al final, marcados con `test.fail()`. Afirman lo que DEBERÍA pasar, así
 * que hoy fallan a propósito; cuando se reparen, se les quita el `test.fail()` y quedan como
 * regresión.
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
  return page.locator('[role="status"]').filter({ hasText: 'Potencia estimada' });
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
  // La app es un client component: sin hidratación no hay cálculo que inspeccionar.
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

    await calcular(page, { desnivel: '1500', tiempo: '' });
    await expect(resultados(page)).toContainText('hacen falta los dos datos');
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
 * HALLAZGOS ABIERTOS de la segunda inspección (24/08/2026).
 * Escritos con `test.fail()`: afirman lo que DEBERÍA ocurrir, así que hoy fallan a propósito.
 * ═══════════════════════════════════════════════════════════════════════════════════════ */

test.describe('Hallazgos abiertos', () => {
  test.fail('en bajada no debería publicarse una potencia negativa como «tu potencia»', async ({
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
  });

  test.fail('un FTP fuera del rango declarado (50–600 W) no debería recibir veredicto', async ({
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
  });

  test.fail('ninguna fila de zonas debería salir con el mínimo por encima del máximo', async ({
    page,
  }) => {
    // Regresión introducida al reparar el hallazgo 244: `wattsMin = límite anterior + 1` se
    // vuelve del revés cuando dos límites consecutivos redondean al mismo entero, algo que
    // ocurre por debajo de ~7 W de FTP (el 15–20 % de separación entre límites no llega a 1 W).
    // ENTRADA 70 kg · FTP 3 W → ESPERADO rangos crecientes · OBTENIDO Z2 «3 – 2 W» y Z4 «4 – 3 W».
    await calcular(page, { peso: '70', ftp: '3' });
    for (const [min, max] of await rangosDeZona(page)) {
      expect(min).toBeLessThanOrEqual(max);
    }
  });

  test.fail('con el desnivel a 0 el aviso no debería decir que faltan datos', async ({ page }) => {
    // El aviso del hallazgo 243 solo distingue el caso «tiempo ≤ 0»; con el desnivel a 0 cae en
    // la rama genérica y afirma algo que la pantalla desmiente.
    // ENTRADA desnivel 0 m · tiempo 30 min (los dos rellenos) → ESPERADO un aviso sobre el
    // desnivel · OBTENIDO «Para la VAM hacen falta los dos datos: el desnivel subido y el
    // tiempo empleado».
    await abrirVam(page);
    await calcular(page, { peso: '70', ftp: '280', desnivel: '0', tiempo: '30' });
    await expect(resultados(page)).not.toContainText('hacen falta los dos datos');
  });

  test.fail('la guía y el FAQ deberían enviar al estimador propio, no solo a apps de terceros', async ({
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
    expect(tarjeta).toMatch(/estimador|esta misma página|más arriba/i);
  });
});
