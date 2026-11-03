import { test, expect, Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * Inspector — conversor-coordenadas (segmento cálculo · primera inspección, 03/11/2026)
 *
 * Promete (h1 «Conversor de Coordenadas Geográficas»): pegar una coordenada en cualquier formato
 * —decimal, grados minutos segundos, grados y minutos decimales, UTM o MGRS— y obtener todos los
 * demás, más distancia y rumbo entre dos puntos sobre el elipsoide WGS84. Motor: lib/geo/coordenadas.ts.
 *
 * DE DÓNDE SALEN LOS ESPERADOS (calculados ANTES de mirar la app, con un script aparte que NO
 * importa el motor: .inspector-trabajo/conversor-coordenadas-referencia.mjs y -antipodas.mjs):
 *   · UTM directa e inversa: series de Snyder (USGS Professional Paper 1395, 1987, pp. 61-64) sobre
 *     WGS84 (a = 6.378.137 m, f = 1/298,257223563, k0 = 0,9996). La app usa otras series (Krüger
 *     de 6.º orden); la ida y vuelta de Snyder cierra a 5·10⁻¹⁰° (0,05 mm).
 *   · MGRS: esquema AA de WGS84 (columnas A-H/J-R/S-Z por zona mód 3; filas desde A en zona impar
 *     y desde F en zona par), con TRUNCAMIENTO de este y norte.
 *   · Distancia y rumbos: integración numérica RK4 de las ecuaciones de la geodésica sobre el
 *     elipsoide + disparo de Newton sobre (azimut, distancia), no Vincenty. El integrador
 *     reproduce el arco de meridiano 0°-1° (110.574,389 m) a 10⁻⁹ m.
 *   · Sexagesimal: a mano (base 60).
 *
 * CASOS
 *   1 (normal)  Puerta del Sol 40.416775, -3.703790 →
 *               GMS 40° 25' 0,39" N · 3° 42' 13,64" O (145.500,39 s y 13.333,644 s)
 *               GM  40° 25,006/7' N (25,0065 es empate exacto) · 3° 42,227' O
 *               UTM 30 T 440.291,28 4.474.254,60 (Snyder: 440.291,284 · 4.474.254,600)
 *               MGRS 30T VK 40291 74254 · a 1 km 30T VK 40 74
 *               UTM 30 T 440291 4474255 → 40,416779, -3,703793 (Snyder inversa: 40,4167786 · -3,7037934)
 *               Madrid → Barcelona (41.385064, 2.173404): 506,649 km · 75,8° ENE · 79,7° E
 *               (geodésica integrada: 506.648,757 m · 75,8346° · 79,6848°)
 *   2 (límite)  -90, 180 → 90° S · 180° E, sin UTM ni MGRS y con el aviso de las cuadrículas UPS
 *               Ushuaia -54.801912, -68.302948 (sur y oeste) → 19 F 544.808,43 3.927.028,52 ·
 *               19F EV 44808 27028 · 54° 48' 6,88" S 68° 18' 10,61" O
 *               40.9999999, -3.0000001 → los segundos redondean a 60: 41° 00' 0,00" N 3° 00' 0,00" O
 *               40, -6 → zona 30 (243.900,35 4.432.069,06) · 40, -6.000001 → zona 29 (756.099,56 4.432.069,05)
 *               Bergen 60.39, 5.32 → 32 V (excepción de Noruega) · Longyearbyen 78.22, 15.65 → 33 X (Svalbard)
 *               (0,0) → (0,5, 179,5), casi antípodas: 19.936,289 km · 25,7° NNE · 154,3° SSE
 *   3 (rechazo) latitud 91 · longitud 181 · minutos 60 · texto «abc» → aviso y ningún resultado
 *
 * HALLAZGOS del 03/11/2026 — ABIERTOS. Sus casos van con test.fail(): afirman lo CORRECTO y hoy
 * fallan. Al repararse pasarán, y entonces se quita el test.fail() y se escribe REPARADO.
 *   A. Grados «-0» con minutos pierden el signo: «39 28 11, -0 22 34» (Valencia) sale 0,376111 E y
 *      «-0°13'47" -78°31'29"» (Quito) sale en el hemisferio norte. parseFloat('-0') < 0 es false.
 *   B. UTM con punto decimal: «30 T 440291.38 4474255.12» quita los puntos como si fueran de
 *      miles (44.029.138 m) y sale 0°, 87° E, en el Índico, con «✅ Interpretado como UTM».
 *   C. La letra tras la zona es SIEMPRE banda: «19 S 500000 8500000» (zona 19 Sur, la convención
 *      EPSG) sale a 76,58° N, banda X, en vez de -13,568451; nada coteja la banda con el norte.
 *   D. Caída al semiverseno (casi antípodas): el rumbo de llegada es por construcción el inicial
 *      y el rumbo es el de la esfera: (0,0)→(0,1, 179,9) da 45,0° NE y 45,0° NE; la geodésica
 *      sale a 8,2° N y llega a 171,8° S.
 *   E. MGRS tras la ida y vuelta UTM→geográficas→UTM se trunca sobre 440.299,9999…: «30 T 440300
 *      4474300» a 100 m da «403 742» (la casilla de al lado) y «30 S 400000 4400000» da
 *      «30S UJ 99999 99999» en vez de «30S VK 00000 00000».
 *   F. Contenido: «Sin el menos, Madrid se planta en Turquía»; la propia app la pone en 3,70° E
 *      (zona 31), en el Mediterráneo al norte de Menorca.
 *   G. Formato: «100%» en las features del JSON-LD (va «100 %»).
 *   H. Accesibilidad: el botón «Copiar» tiene aria-label fijo; el «✓ Copiado» no llega al lector.
 */

const RUTA = '/conversor-coordenadas/';
const ENTRADA = '#entrada-coordenada';
const ORIGEN = '#punto-origen';
const DESTINO = '#punto-destino';

/** Escribe como el usuario y comprueba que el valor llegó al estado de React. */
async function poner(page: Page, selector: string, valor: string): Promise<void> {
  await page.locator(selector).fill(valor);
  await esperarValorEnReact(page, selector, valor);
}

/** Valor de una fila de resultados, con los espacios normalizados. Se pinta en el mismo render. */
async function fila(page: Page, etiqueta: string): Promise<string> {
  const valor = page
    .getByRole('button', { name: `Copiar ${etiqueta}`, exact: true })
    .locator('xpath=..')
    .locator('[class*="filaValor"]');
  return ((await valor.textContent()) ?? '').replace(/\s+/g, ' ').trim();
}

async function convertir(page: Page, entrada: string): Promise<Record<string, string>> {
  await poner(page, ENTRADA, entrada);
  return {
    decimal: await fila(page, 'Grados decimales'),
    gms: await fila(page, 'Grados, minutos y segundos'),
    gm: await fila(page, 'Grados y minutos decimales'),
    utm: await fila(page, 'UTM'),
    mgrs: await fila(page, 'MGRS'),
  };
}

async function precision(page: Page, etiqueta: '1 km' | '100 m' | '10 m' | '1 m'): Promise<void> {
  const chip = page.getByRole('button', { name: new RegExp(`^${etiqueta}`) });
  await chip.click();
  await expect(chip).toHaveAttribute('aria-pressed', 'true');
}

const avisoConversion = (page: Page) =>
  page.locator('[role="alert"]').filter({ hasText: 'No se reconoce esa coordenada' });

/** Las tres tarjetas de la pestaña de distancia: distancia, rumbo inicial y rumbo de llegada. */
async function recorrido(page: Page, origen: string, destino: string): Promise<string[]> {
  await poner(page, ORIGEN, origen);
  await poner(page, DESTINO, destino);
  const textos = await page.locator('[class*="tarjetaValor"]').allTextContents();
  return textos.map((t) => t.replace(/\s+/g, ' ').trim());
}

test.describe('conversor-coordenadas · conversión de formatos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Conversor de Coordenadas Geográficas');
    await esperarHidratacion(page, [ENTRADA]);
  });

  test('CASO 1 (normal) · Puerta del Sol con punto decimal, como la copia Google Maps → los cinco formatos', async ({ page }) => {
    // Se escribe con punto: el campo arranca con la misma coordenada con coma, y así el estado cambia.
    const r = await convertir(page, '40.416775, -3.703790');
    await expect(page.getByText('Interpretado como')).toContainText('grados decimales');
    expect(r.decimal).toBe('40,416775, -3,703790');
    // 40,416775 × 3600 = 145.500,39 s → 40° 25' 0,39" · 3,70379 × 3600 = 13.333,644 s → 3° 42' 13,64"
    expect(r.gms).toBe(`40° 25' 0,39" N 3° 42' 13,64" O`);
    // 40,416775 × 60 = 2.425,0065 min: empate exacto en el tercer decimal, valen 25,006 y 25,007
    expect(r.gm).toMatch(/^40° 25,00[67]' N 3° 42,227' O$/);
    // Snyder: E 440.291,284 · N 4.474.254,600
    expect(r.utm).toBe('30 T 440.291,28 4.474.254,60');
    expect(r.mgrs).toBe('30T VK 40291 74254');
  });

  test('CASO 1 (normal) · MGRS recortado a 1 km: 30T VK 40 74', async ({ page }) => {
    await poner(page, ENTRADA, '40.416775, -3.703790');
    await precision(page, '1 km');
    expect(await fila(page, 'MGRS')).toBe('30T VK 40 74');
  });

  test('CASO 1 (normal) · UTM 30 T 440291 4474255 → 40,416779, -3,703793 (el ejemplo de la propia app)', async ({ page }) => {
    // Snyder inversa: φ 40,4167786° · λ -3,7037934°
    const r = await convertir(page, '30 T 440291 4474255');
    await expect(page.getByText('Interpretado como')).toContainText('UTM');
    expect(r.decimal).toBe('40,416779, -3,703793');
    expect(r.utm).toBe('30 T 440.291,00 4.474.255,00');
  });

  test('CASO 1 (normal) · la UTM que da la app se puede volver a pegar (formato español con puntos de miles)', async ({ page }) => {
    // 440.291,38 E y 4.474.255,12 N: 0,38 m más al este y 0,12 m más al norte que el ejemplo
    // → 40,4167797 · -3,7037889
    const r = await convertir(page, '30 T 440.291,38 4.474.255,12');
    expect(r.decimal).toBe('40,416780, -3,703789');
    expect(r.utm).toBe('30 T 440.291,38 4.474.255,12');
  });

  test('CASO 2 (límite) · polo sur con longitud 180: grados bien, sin UTM ni MGRS y con aviso UPS', async ({ page }) => {
    const r = await convertir(page, '-90, 180');
    expect(r.gms).toBe(`90° 00' 0,00" S 180° 00' 0,00" E`);
    expect(r.utm).toBe('—');
    expect(r.mgrs).toBe('—');
    await expect(page.locator('[role="tabpanel"] [role="note"]')).toContainText('80°S a 84°N');
    await expect(avisoConversion(page)).toHaveCount(0);
  });

  test('CASO 2 (límite) · hemisferio sur y oeste (Ushuaia): falso norte de 10.000 km y banda F', async ({ page }) => {
    // Snyder: zona 19 (meridiano central -69°), E 544.808,427 · N 3.927.028,516
    const r = await convertir(page, '-54.801912, -68.302948');
    expect(r.gms).toBe(`54° 48' 6,88" S 68° 18' 10,61" O`);
    expect(r.utm).toBe('19 F 544.808,43 3.927.028,52');
    expect(r.mgrs).toBe('19F EV 44808 27028');
  });

  test('CASO 2 (límite) · segundos que redondean a 60 arrastran al minuto y al grado', async ({ page }) => {
    // 40,9999999° = 40° 59' 59,99964" → con dos decimales 60,00" → 41° 00' 0,00"
    const r = await convertir(page, '40.9999999, -3.0000001');
    expect(r.gms).toBe(`41° 00' 0,00" N 3° 00' 0,00" O`);
    expect(r.gm).toBe(`41° 0,000' N 3° 0,000' O`);
  });

  test('CASO 2 (límite) · cambio de huso en -6°: zona 30 a un lado, zona 29 al otro', async ({ page }) => {
    // Snyder: (40, -6) en zona 30 → 243.900,352 · 4.432.069,057; (40, -6,000001) en zona 29 → 756.099,563 · 4.432.069,054
    expect((await convertir(page, '40, -6')).utm).toBe('30 T 243.900,35 4.432.069,06');
    expect((await convertir(page, '40, -6.000001')).utm).toBe('29 T 756.099,56 4.432.069,05');
  });

  test('CASO 2 (límite) · excepciones de huso que promete el JSON-LD: Bergen en la 32 y Longyearbyen en la 33', async ({ page }) => {
    // NGA: la zona 32 se ensancha en 56°-64° N entre 3° y 12° E; en Svalbard (72°-84° N) solo
    // zonas impares. Snyder con la zona forzada: Bergen (60,39, 5,32) → 297.230,220 · 6.700.510,176
    // (sin la excepción sería zona 31); Longyearbyen (78,22, 15,65) → 514.813,527 · 8.683.004,154.
    expect((await convertir(page, '60.39, 5.32')).utm).toBe('32 V 297.230,22 6.700.510,18');
    expect((await convertir(page, '78.22, 15.65')).utm).toBe('33 X 514.813,53 8.683.004,15');
  });

  test('CASO 3 (rechazo) · latitud 91, longitud 181, minutos 60 o texto: aviso y ningún resultado', async ({ page }) => {
    for (const entrada of ['91, 0', '40, 181', `40°60'00"N 3°00'00"O`, 'abc']) {
      await poner(page, ENTRADA, entrada);
      await expect(avisoConversion(page)).toBeVisible();
      await expect(page.getByRole('button', { name: 'Copiar UTM', exact: true })).toHaveCount(0);
    }
  });

  test('HALLAZGO A (ABIERTO) · grados «-0» con minutos: el signo no se pierde', async ({ page }) => {
    test.fail();
    // Valencia 39° 28' 11" N 0° 22' 34" O: 22/60 + 34/3600 = 0,376111 → longitud -0,376111
    expect((await convertir(page, '39 28 11, -0 22 34')).decimal).toBe('39,469722, -0,376111');
    // Quito-centro 0° 13' 47" S 78° 31' 29" O: 0,229722 → latitud -0,229722
    expect((await convertir(page, `-0°13'47" -78°31'29"`)).decimal).toBe('-0,229722, -78,524722');
  });

  test('HALLAZGO B (ABIERTO) · UTM con punto decimal (el de un SIG o un GPS) se lee como decimal', async ({ page }) => {
    test.fail();
    // Mismo punto que «30 T 440.291,38 4.474.255,12» → 40,416780, -3,703789
    const r = await convertir(page, '30 T 440291.38 4474255.12');
    expect(r.decimal).toBe('40,416780, -3,703789');
    expect(r.utm).toBe('30 T 440.291,38 4.474.255,12');
  });

  test('HALLAZGO C (ABIERTO) · «19 S 500000 8500000» (zona 19 Sur) no se va al Ártico', async ({ page }) => {
    test.fail();
    // Snyder inversa con falso norte de 10.000 km: φ -13,568451° · λ -69° (Perú-Bolivia).
    // Leída como banda S (32-40° N) sería incoherente con el norte: 8.500.000 m está en la banda X.
    const r = await convertir(page, '19 S 500000 8500000');
    expect(r.decimal).toBe('-13,568451, -69,000000');
  });

  test('HALLAZGO E (ABIERTO) · el MGRS de una UTM en metros redondos no salta a la casilla de al lado', async ({ page }) => {
    test.fail();
    // Truncar 440.300 / 4.474.300 a 100 m da 403 / 743
    await poner(page, ENTRADA, '30 T 440300 4474300');
    await precision(page, '100 m');
    expect(await fila(page, 'MGRS')).toBe('30T VK 403 743');
    // La referencia MGRS del usuario debe volver igual a la misma precisión
    await poner(page, ENTRADA, '30T VK 403 743');
    expect(await fila(page, 'MGRS')).toBe('30T VK 403 743');
    // 400.000 → columna 4 de S-Z = V · 4.400.000 → fila 44 mód 20 = 4 de F… = K
    await poner(page, ENTRADA, '30 S 400000 4400000');
    await precision(page, '1 m');
    expect(await fila(page, 'MGRS')).toBe('30S VK 00000 00000');
  });

  test('CASO 1 (normal) · Madrid sin el menos de la longitud cae en 3,70° E, zona 31', async ({ page }) => {
    // 3,70379° E → zona floor((3,70379 + 180) / 6) + 1 = 31 (0° a 6° E): el Mediterráneo al norte
    // de Menorca. Es el dato con el que se mide el HALLAZGO F.
    const r = await convertir(page, '40.416775, 3.703790');
    expect(r.gms).toBe(`40° 25' 0,39" N 3° 42' 13,64" E`);
    expect(r.utm.startsWith('31 T ')).toBe(true);
  });

  test('HALLAZGO F (ABIERTO) · el bloque educativo no dice que Madrid sin el menos cae en Turquía', async ({ page }) => {
    test.fail();
    // Turquía empieza hacia los 26° E; Madrid sin el signo queda en 3,70° E (caso anterior).
    await expect(page.locator('li', { hasText: 'Perder el signo de la longitud' })).not.toContainText('Turquía', { timeout: 1000 });
  });

  test('HALLAZGO G (ABIERTO) · el JSON-LD escribe el porcentaje separado («100 %»)', async ({ page }) => {
    test.fail();
    const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
    const webApp = scripts.find((s) => s.includes('"WebApplication"')) ?? '';
    expect(webApp).not.toMatch(/\d%/);
  });

  test('CASO 1 (normal) · copiar grados decimales deja el valor con punto, como promete el paso 3', async ({ page }) => {
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    await poner(page, ENTRADA, '40,416775, -3,7037900');
    const boton = page.getByRole('button', { name: 'Copiar Grados decimales', exact: true });
    await boton.click();
    await expect(boton).toHaveText('✓ Copiado');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('40.416775, -3.703790');
  });

  test('HALLAZGO H (ABIERTO) · copiar anuncia «Copiado» también al lector de pantalla', async ({ page }) => {
    test.fail();
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    await poner(page, ENTRADA, '40,416775, -3,7037900');
    await page.getByRole('button', { name: 'Copiar Grados decimales', exact: true }).click();
    // Hoy el texto visible pasa a «✓ Copiado», pero el nombre accesible es el aria-label fijo
    // «Copiar Grados decimales» y no hay región viva: el lector no se entera.
    await expect(page.getByRole('button', { name: /Copiado/ })).toHaveCount(1, { timeout: 1000 });
  });
});

test.describe('conversor-coordenadas · distancia y rumbo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, [ENTRADA]);
    await page.getByRole('tab', { name: /Distancia y rumbo/ }).click();
    await expect(page.getByRole('tab', { name: /Distancia y rumbo/ })).toHaveAttribute('aria-selected', 'true');
    await esperarHidratacion(page, [ORIGEN, DESTINO]);
  });

  test('CASO 1 (normal) · Madrid (Puerta del Sol) → Barcelona: 506,649 km, sale a 75,8° ENE y llega a 79,7° E', async ({ page }) => {
    // Geodésica integrada: 506.648,757 m · azimut de salida 75,8346° · de llegada 79,6848°
    // Con punto decimal: el campo arranca con los mismos puntos escritos con coma.
    const t = await recorrido(page, '40.416775, -3.703790', '41.385064, 2.173404');
    expect(t).toEqual(['506,649 km', '75,8° ENE', '79,7° E']);
    await expect(page.locator('[role="tabpanel"] [role="note"]')).toContainText('Vincenty');
  });

  test('CASO 2 (límite) · casi antípodas donde Vincenty aún converge: (0,0) → (0,5, 179,5)', async ({ page }) => {
    // Geodésica integrada: 19.936.288,579 m · 25,6719° · 154,3271°
    const t = await recorrido(page, '0, 0', '0.5, 179.5');
    expect(t).toEqual(['19.936,289 km', '25,7° NNE', '154,3° SSE']);
  });

  test('CASO 2 (límite) · caída al semiverseno: la distancia cumple el 0,5 % que anuncia la nota', async ({ page }) => {
    // Geodésica integrada (0,0) → (0,1, 179,9): 19.992.082,108 m
    const t = await recorrido(page, '0, 0', '0.1, 179.9');
    await expect(page.locator('[role="tabpanel"] [role="note"]')).toContainText('semiverseno');
    const km = Number(t[0].replace(' km', '').replace(/\./g, '').replace(',', '.'));
    expect(Math.abs(km - 19992.082) / 19992.082).toBeLessThan(0.005);
  });

  test('CASO 3 (rechazo) · un punto fuera de rango no da distancia y lo dice', async ({ page }) => {
    await poner(page, ORIGEN, '40, -3');
    await poner(page, DESTINO, '95, 0');
    await expect(
      page.locator('[role="alert"]').filter({ hasText: 'Hace falta que los dos puntos sean reconocibles' }),
    ).toBeVisible();
    await expect(page.locator('[class*="tarjetaValor"]')).toHaveCount(0);
  });

  test('HALLAZGO D (ABIERTO) · en la caída al semiverseno el rumbo de llegada no es el de salida', async ({ page }) => {
    test.fail();
    // Geodésica integrada (0,0) → (0,1, 179,9): sale a 8,1737° (N) y llega a 171,8263° (S).
    // Hoy: 45,0° NE en las dos tarjetas (rumbo de la esfera y rumboFinal = rumboInicial).
    const t = await recorrido(page, '0, 0', '0.1, 179.9');
    expect(t.slice(1)).toEqual(['8,2° N', '171,8° S']);
  });
});
