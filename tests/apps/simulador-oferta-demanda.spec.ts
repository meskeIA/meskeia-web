import { test, expect, Locator, Page } from '@playwright/test';
import { esperarHidratacion, sembrarValor } from './_hidratacion';

/**
 * Inspector — simulador-oferta-demanda (segmento cálculo, riesgo 3, 169 usos, 110 s de estancia)
 *
 * Primera inspección: 20/09/2026 (Opus 5), contra producción y contra el código del repositorio,
 * que el deploy de las 11:25 deja idénticos.
 *
 * QUÉ PROMETE
 *   <h1> «Simulador de Oferta y Demanda» y subtítulo: mover los desplazadores de demanda (renta,
 *   sustitutivos, preferencias) y de oferta (costes, tecnología, productores) «para ver cómo
 *   cambia el equilibrio en tiempo real» y experimentar con precios máximos y mínimos. La
 *   metadata añade excedente del consumidor, del productor y bienestar total. El bloque educativo
 *   publica las fórmulas exactas, así que la verdad es comprobable con lápiz:
 *       Q_d = a − b·P   ·   Q_o = c + d·P   ·   P* = (a − c)/(b + d)   ·   Q* = a − b·P*
 *
 * DÓNDE VIVE EL CÁLCULO
 *   app/simulador-oferta-demanda/page.tsx, líneas 51-92. No hay motor aparte ni importa nada de
 *   data/fiscal ni de lib/: `calcularCurvas`, `calcularEquilibrio` y `calcularExcedente` viven en
 *   el propio componente, con b = 2 y d = 1,5 FIJAS y las bases a = 100, c = −20. Cada punto de
 *   deslizador mueve la demanda 4 unidades y la oferta 3:
 *       a = 100 + 4·(renta + sustitutivos + preferencias)      (renta, sustitutivos, preferencias ∈ [−5, 5])
 *       c = −20 + 3·(−costes + tecnología + productores)       (costes, tecnología, productores ∈ [−5, 5])
 *
 * LOS TRES CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   CASO 1 (normal) — renta +3, los demás a 0, libre mercado
 *     a = 100 + 4·3 = 112 ; c = −20
 *     P* = (112 + 20)/3,5 = 264/7 = 37,714… → 37,7
 *     Q* = 112 − 2·(264/7) = 256/7 = 36,571… → 36,6   (comprobado por oferta: −20 + 1,5·P* = 36,571 ✔)
 *     Intercepto de la demanda en el eje P: a/b = 56 ; de la oferta: −c/d = 40/3 = 13,333…
 *     EC = ½·(56 − 264/7)·(256/7) = ½·(128/7)·(256/7) = 16384/49 = 334,367… → 334,4
 *     EP = ½·(264/7 − 40/3)·(256/7) = ½·(512/21)·(256/7) = 65536/147 = 445,823… → 445,8
 *     Bienestar total = 780,190… → 780,2
 *
 *   CASO 2 (límite — los tres desplazadores de oferta en su extremo favorable)
 *     costes −5, tecnología +5, productores +5 → c = −20 + 3·15 = +25 (hay oferta ya a precio 0)
 *     P* = (100 − 25)/3,5 = 150/7 = 21,428… → 21,4 ; Q* = 400/7 = 57,142… → 57,1
 *     EC = ½·(50 − 150/7)·(400/7) = 40000/49 = 816,326… → 816,3
 *     EP esperado = área entre P* y la curva de oferta, ésta truncada en P = 0 (nadie produce a
 *       precio negativo): P*·Q* − área bajo la oferta = 1224,49 − 344,39 = 880,1
 *       (y si en vez de truncarla se prolonga la recta hasta −16,7 €, saldría 1088,4:
 *        ninguna de las dos lecturas da lo que publica la app)
 *
 *   CASO 3 (debe rechazarse) — modo «precio máximo» con P_max = −10 €
 *     El campo declara min=0 y un precio negativo no existe; `checkValidity()` del propio
 *     navegador devuelve false. Esperado: rechazo, o al menos aviso y ninguna cifra publicada.
 *
 * RESULTADO: el CASO 1 salió exacto en los cinco indicadores, y del CASO 2 solo el excedente del
 * productor se desvía. Lo demás son los hallazgos de abajo. Los `expect` comparan la CADENA que
 * la app pinta (un decimal, coma española), no un número con tolerancia: las cifras de arriba son
 * fracciones exactas, así que el primer decimal discrimina sin margen que elegir.
 *
 * HALLAZGOS ABIERTOS, escritos como TESTIGO (documentan lo que la app hace HOY; cuando se
 * reparen, estos bloques fallarán y habrá que invertirlos). NO se corrigen desde el test:
 *   A. El excedente del productor se calcula como un triángulo desde P = 0 en cuanto la curva de
 *      oferta corta el eje de cantidades en positivo (c > 0, es decir −costes + tecnología +
 *      productores ≥ 7). Con la oferta al máximo publica 612,2 € en vez de 880,1 €, un 30 % menos,
 *      y el canvas ni siquiera sombrea ese excedente (su dibujo exige −c/d ≥ 0): el gráfico calla
 *      y el panel da cifra.
 *   B. Con el control de precios ACTIVO, el excedente del consumidor, el del productor y el
 *      bienestar total siguen siendo los del libre mercado. El canvas sí retira las dos áreas
 *      (solo las sombrea en modo libre), de modo que gráfico y panel se contradicen; y el propio
 *      FAQ de la app enseña que «el bienestar total (EC + EP) siempre es menor con control de
 *      precios», que es justo lo que el panel no muestra.
 *   C. Un techo POR ENCIMA del equilibrio no ata, así que el mercado se vacía en P* y la escasez
 *      es 0; la app publica igualmente «Escasez 55,0 u.». Sale el aviso, pero la cifra se queda.
 *   D. El punto de equilibrio desaparece del gráfico sin avisar cuando Q* supera el ancho
 *      dibujado (Q_MAX = 80), cosa que ocurre dentro del propio recorrido de los deslizadores.
 *   E. Formato español: las cifras de cuatro dígitos salen sin separador de miles («1428,6 €»),
 *      porque `fmt()` es un toFixed() con la coma cambiada a mano en vez de `formatNumber`.
 *   F. Los tres botones del selector de modo no llevan `type="button"`.
 */

const RUTA = '/simulador-oferta-demanda/';

/** Orden de aparición de los seis deslizadores en el DOM (ninguno tiene id). */
const RENTA = 0;
const COSTES = 3;
const TECNOLOGIA = 4;
const PRODUCTORES = 5;

const deslizador = (page: Page, indice: number): Locator =>
  page.locator('input[type=range]').nth(indice);

/** El valor de una tarjeta del panel de resultados, buscada por el texto de su etiqueta. */
const resultado = (page: Page, etiqueta: string): Locator =>
  page
    .locator('[class*="resultCard"]')
    .filter({ hasText: etiqueta })
    .first()
    .locator('[class*="resultValue"]');

/**
 * Píxeles del canvas pintados con el color del punto de equilibrio (#48A9A6). Es la única forma
 * de comprobar si E* está dibujado: el disco mide 7 px de radio y no hay nada más de ese color.
 */
async function pixelesEquilibrio(page: Page): Promise<number> {
  return page.evaluate(() => {
    const lienzo = document.querySelector('canvas') as HTMLCanvasElement;
    const ctx = lienzo.getContext('2d')!;
    const datos = ctx.getImageData(0, 0, lienzo.width, lienzo.height).data;
    let n = 0;
    for (let i = 0; i < datos.length; i += 4) {
      if (
        Math.abs(datos[i] - 0x48) < 14 &&
        Math.abs(datos[i + 1] - 0xa9) < 14 &&
        Math.abs(datos[i + 2] - 0xa6) < 14
      ) {
        n++;
      }
    }
    return n;
  });
}

const abrirPrecioMaximo = (page: Page): Promise<void> =>
  page.getByRole('button', { name: /Precio máximo \(techo\)/ }).click();

test.describe('simulador-oferta-demanda', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    // Un clic o una siembra antes de hidratar se pierden: el DOM cambia y React no se entera.
    await esperarHidratacion(page, ['input[type=range]']);
  });

  test('CASO 1 · normal — subir la renta desplaza la demanda y recalcula el panel entero', async ({
    page,
  }) => {
    await sembrarValor(page, deslizador(page, RENTA), 3); // parte de 0, así que es un movimiento real

    // a = 112, c = −20 → P* = 264/7, Q* = 256/7, EC = 16384/49, EP = 65536/147 (cabecera, CASO 1)
    await expect(resultado(page, 'Precio de equilibrio')).toHaveText('37,7 €');
    await expect(resultado(page, 'Cantidad de equilibrio')).toHaveText('36,6 u.');
    await expect(resultado(page, 'Excedente consumidor')).toHaveText('334,4 €');
    await expect(resultado(page, 'Excedente productor')).toHaveText('445,8 €');
    await expect(resultado(page, 'Bienestar total')).toHaveText('780,2 €');
  });

  test('CASO 2 · límite — con los tres desplazadores de oferta al máximo, el equilibrio y el excedente del consumidor siguen siendo exactos', async ({
    page,
  }) => {
    await sembrarValor(page, deslizador(page, COSTES), -5);
    await sembrarValor(page, deslizador(page, TECNOLOGIA), 5);
    await sembrarValor(page, deslizador(page, PRODUCTORES), 5);

    // c = −20 + 3·15 = +25 → P* = 150/7, Q* = 400/7, EC = 40000/49 (cabecera, CASO 2)
    await expect(resultado(page, 'Precio de equilibrio')).toHaveText('21,4 €');
    await expect(resultado(page, 'Cantidad de equilibrio')).toHaveText('57,1 u.');
    await expect(resultado(page, 'Excedente consumidor')).toHaveText('816,3 €');
    // El excedente del productor de este mismo escenario está en el testigo del HALLAZGO A.
  });

  test('CASO 3 · rechazo — HALLAZGO testigo: un precio máximo negativo se acepta sin decir nada', async ({
    page,
  }) => {
    await abrirPrecioMaximo(page);
    await sembrarValor(page, '#precioFijado', -10); // parte de 25, así que es un movimiento real

    // Esperado: rechazo. El campo declara min=0 y el navegador ya lo da por inválido.
    const campo = page.locator('#precioFijado');
    expect(await campo.evaluate((el) => (el as HTMLInputElement).checkValidity())).toBe(false);
    // Obtenido: se calcula igual. Qd = 100 − 2·(−10) = 120 ; Qo = máx(0, −20 − 15) = 0 → 120,0 u.
    await expect(resultado(page, 'Escasez')).toHaveText('120,0 u.');
    // Y ni un aviso: el único que tiene la app solo salta si P_max ≥ P*. Se busca por su TEXTO
    // porque en la página hay además un [role="alert"] vacío que no es de esta app.
    await expect(page.getByText(/P_max debe ser/)).toHaveCount(0);
  });

  test('HALLAZGO A testigo — el excedente del productor se queda corto cuando hay oferta a precio cero', async ({
    page,
  }) => {
    await sembrarValor(page, deslizador(page, COSTES), -5);
    await sembrarValor(page, deslizador(page, TECNOLOGIA), 5);
    await sembrarValor(page, deslizador(page, PRODUCTORES), 5);

    // Esperado 880,1 € (área entre P* = 21,4 y la oferta truncada en P = 0; cabecera, CASO 2).
    // Obtenido: ½·P*·Q* = 30000/49 = 612,2 €, el triángulo que sale de tratar el intercepto
    // negativo de la oferta como si fuera cero.
    await expect(resultado(page, 'Excedente productor')).toHaveText('612,2 €');
    // Arrastra al bienestar total: 1696,4 € reales frente a los 1428,6 € publicados. Y de paso
    // enseña el HALLAZGO E: cuatro dígitos sin el punto de los millares (debería ser «1.428,6 €»).
    await expect(resultado(page, 'Bienestar total')).toHaveText('1428,6 €');
  });

  test('HALLAZGO B testigo — bajo un techo vinculante el panel sigue publicando el bienestar del libre mercado', async ({
    page,
  }) => {
    await abrirPrecioMaximo(page);
    await sembrarValor(page, '#precioFijado', 20); // parte de 25; P* = 34,3, así que el techo ATA

    // Esto sí es correcto: Qd = 100 − 40 = 60 ; Qo = −20 + 30 = 10 → escasez 50 u.
    await expect(resultado(page, 'Escasez')).toHaveText('50,0 u.');

    // Esto no: con la cantidad racionada en 10 u. y precio 20 €, el excedente del consumidor es
    // 475 − 200 = 275,0 €, el del productor 200 − 166,67 = 33,3 €, y el bienestar total 308,3 €
    // (267,9 € menos que en libre mercado: la pérdida irrecuperable que el propio FAQ explica).
    // La app publica los tres valores del libre mercado, sin enterarse del control.
    await expect(resultado(page, 'Excedente consumidor')).toHaveText('246,9 €');
    await expect(resultado(page, 'Excedente productor')).toHaveText('329,3 €');
    await expect(resultado(page, 'Bienestar total')).toHaveText('576,2 €');
  });

  test('HALLAZGO C testigo — un techo por encima del equilibrio publica una escasez que no existe', async ({
    page,
  }) => {
    await abrirPrecioMaximo(page);
    await sembrarValor(page, '#precioFijado', 50); // parte de 25; P* = 34,3, así que el techo NO ata

    // El aviso sale...
    await expect(page.getByText(/P_max debe ser menor que P\*/)).toBeVisible();
    // ...pero la cifra se publica igual. Esperado 0,0 u. (el mercado se vacía en P* = 34,3);
    // obtenido |Qd − Qo| evaluado en 50 €: |0 − 55| = 55,0 u.
    await expect(resultado(page, 'Escasez')).toHaveText('55,0 u.');
  });

  test('HALLAZGO D testigo — con los seis deslizadores al extremo, E* se sale del gráfico sin avisar', async ({
    page,
  }) => {
    expect(await pixelesEquilibrio(page)).toBeGreaterThan(20); // en el estado inicial sí se dibuja

    for (const [indice, valor] of [[0, 5], [1, 5], [2, 5], [3, -5], [4, 5], [5, 5]] as const) {
      await sembrarValor(page, deslizador(page, indice), valor);
    }

    // a = 160, c = 25 → P* = 135/3,5 = 38,571… y Q* = 160 − 2·P* = 82,857…, por encima del
    // Q_MAX = 80 que dibuja el canvas: el panel anuncia un equilibrio que el gráfico no enseña.
    await expect(resultado(page, 'Cantidad de equilibrio')).toHaveText('82,9 u.');
    await expect(resultado(page, 'Precio de equilibrio')).toHaveText('38,6 €');
    await page.waitForTimeout(300); // el canvas se repinta en un efecto, tras el render
    expect(await pixelesEquilibrio(page)).toBe(0);
  });

  test('HALLAZGO F testigo — los tres botones del selector de modo no declaran type="button"', async ({
    page,
  }) => {
    const modos = page.locator('[class*="modeBtn"]');
    await expect(modos).toHaveCount(3);
    for (let i = 0; i < 3; i++) {
      // aria-pressed sí está (el selector anuncia cuál está activo); lo que falta es el type,
      // así que los tres quedan como submit por defecto.
      expect(await modos.nth(i).getAttribute('aria-pressed')).not.toBeNull();
      expect(await modos.nth(i).getAttribute('type')).toBeNull();
    }
  });

  test('los cinco componentes obligatorios están montados', async ({ page }) => {
    await expect(page.getByRole('link', { name: /meskeIA/i }).first()).toBeVisible();
    await expect(page.getByText(/Política de Privacidad/i).first()).toBeVisible(); // LegalNotice
    await expect(page.getByText(/Compártela|Compartir/i).first()).toBeVisible(); // ShareCard
    await expect(page.locator('footer').first()).toBeVisible(); // Footer
  });
});
