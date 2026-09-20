import { test, expect, Locator, Page } from '@playwright/test';
import { esperarHidratacion, sembrarValor } from './_hidratacion';

/**
 * Inspector — simulador-oferta-demanda (segmento cálculo, riesgo 3, 169 usos, 110 s de estancia)
 *
 * Primera inspección: 20/09/2026 (Opus 5), contra producción y contra el código del repositorio,
 * que el deploy de las 11:25 deja idénticos.
 * REPARACIÓN: 20/09/2026 — los siete hallazgos del acta, corregidos en
 * `app/simulador-oferta-demanda/`. Los bloques que eran TESTIGO (afirmaban lo que la app hacía
 * MAL) se han invertido: ahora exigen el valor bueno, el que el acta daba como «esperado».
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
 *   app/simulador-oferta-demanda/page.tsx. No hay motor aparte ni importa nada de data/fiscal:
 *   `calcularCurvas`, `calcularEquilibrio`, `areaBajoDemanda`, `areaBajoOferta` y
 *   `calcularExcedente` viven en el propio componente, con b = 2 y d = 1,5 FIJAS y las bases
 *   a = 100, c = −20. Cada punto de deslizador mueve la demanda 4 unidades y la oferta 3:
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
 *     EP = área entre P* y la curva de oferta, ésta truncada en P = 0 (nadie produce a precio
 *       negativo): P*·Q* − área bajo la oferta = 60000/49 − 16875/49 = 43125/49 = 880,1
 *       (si en vez de truncarla se prolongase la recta hasta −16,7 € saldría 1088,4, y el
 *        triángulo desde P = 0 que publicaba la app daba 612,2: ninguno es el excedente)
 *
 *   CASO 3 (debe rechazarse) — modo «precio máximo» con P_max = −10 €
 *     El campo declara min=0 y un precio negativo no existe en el modelo. Esperado: rechazo o
 *     acotado. La app lo ACOTA a 0 y calcula ese escenario, que sí existe.
 *
 * LOS SIETE HALLAZGOS, Y DÓNDE SE COMPRUEBA QUE SIGUEN REPARADOS
 *   A. [alto] Excedente del productor que ignoraba el rectángulo de las unidades ofrecidas a
 *      precio cero (c > 0) → test «HALLAZGO A». Ahora EP = P*·Q* − área bajo la oferta.
 *   B. [alto] Con control de precios, EC/EP/bienestar eran los del libre mercado → test
 *      «HALLAZGO B». Ahora se calculan sobre la cantidad del lado corto y al precio fijado.
 *   C. [medio] Un techo por encima del equilibrio publicaba una escasez inexistente y con el
 *      signo cambiado → test «HALLAZGO C». Ahora la cifra es 0,0 u. y el aviso sigue saliendo.
 *   D. [medio] El campo de precio aceptaba negativos → test «CASO 3». Ahora se acota a [0, 60].
 *   E. [bajo] El equilibrio se salía del lienzo sin decirlo (Q_MAX fijo en 80) → test
 *      «HALLAZGO D». Ahora los dos ejes se adaptan (siempre ≥ 80 × 60).
 *   F. [bajo] `fmt()` era un toFixed() con la coma cambiada a mano → ahora usa `formatNumber`
 *      de `@/lib`. ⚠️ OJO A LAS CADENAS ESPERADAS: es-ES con `useGrouping:'auto'` NO agrupa los
 *      millares de un número de CUATRO cifras («1696,4», no «1.696,4») y sí los de cinco o más.
 *      Está documentado y asumido en todo el catálogo (ver la nota de formato en
 *      `estimador-costes-divorcio.spec.ts` y `estimador-costas-judiciales.spec.ts`), y en esta
 *      app el máximo alcanzable con los deslizadores es 3.796,4 €, así que ninguna cifra llega
 *      a cinco dígitos. Si algún día se decide agrupar siempre, se decide en `lib/formatters.ts`
 *      para las 1.100 apps a la vez, no aquí.
 *   G. [bajo] Los tres botones del selector de modo sin `type` → test «HALLAZGO F».
 *
 * Los `expect` comparan la CADENA que la app pinta (un decimal, coma española), no un número con
 * tolerancia: las cifras de arriba son fracciones exactas, así que el primer decimal discrimina
 * sin margen que elegir.
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
    // El excedente del productor de este mismo escenario es el del HALLAZGO A, aquí abajo.
  });

  test('CASO 3 · rechazo — un precio máximo negativo se acota a 0 en vez de calcularse', async ({
    page,
  }) => {
    await abrirPrecioMaximo(page);
    // Parte de 25 y el campo lo ACOTA: React se queda en 0, no en −10.
    await sembrarValor(page, '#precioFijado', -10, { esperado: 0 });

    // El campo ya no publica un precio que no existe, y deja de ser inválido para el navegador.
    await expect(page.locator('#precioFijado')).toHaveValue('0');
    const campo = page.locator('#precioFijado');
    expect(await campo.evaluate((el) => (el as HTMLInputElement).checkValidity())).toBe(true);

    // Lo que queda es un techo de 0 €, que sí existe y sí ata (P* = 34,3): Qd = 100 − 0 = 100 ;
    // Qo = máx(0, −20 + 0) = 0 → escasez 100,0 u. y nada que negociar, luego EC = EP = 0.
    await expect(resultado(page, 'Escasez')).toHaveText('100,0 u.');
    await expect(resultado(page, 'Cantidad negociada')).toHaveText('0,0 u.');
    await expect(resultado(page, 'Excedente consumidor')).toHaveText('0,0 €');
    await expect(resultado(page, 'Excedente productor')).toHaveText('0,0 €');
  });

  test('HALLAZGO A — el excedente del productor incluye el rectángulo de las unidades ofrecidas a precio cero', async ({
    page,
  }) => {
    await sembrarValor(page, deslizador(page, COSTES), -5);
    await sembrarValor(page, deslizador(page, TECNOLOGIA), 5);
    await sembrarValor(page, deslizador(page, PRODUCTORES), 5);

    // c = +25: la oferta corta el eje de cantidades en positivo, así que las 25 primeras
    // unidades ya se ofrecen a precio 0 y el excedente NO es el triángulo desde P = 0 (612,2 €,
    // lo que publicaba antes), sino P*·Q* − área bajo la oferta = 43125/49 (cabecera, CASO 2).
    await expect(resultado(page, 'Excedente productor')).toHaveText('880,1 €');
    // Y arrastra al bienestar total: 816,3 + 880,1 = 1696,4 € (publicaba 1428,6 €).
    // Cuatro cifras sin punto de millar: es lo que da es-ES, ver nota F de la cabecera.
    await expect(resultado(page, 'Bienestar total')).toHaveText('1696,4 €');
  });

  test('HALLAZGO B — bajo un techo vinculante el panel publica el bienestar del mercado controlado', async ({
    page,
  }) => {
    await abrirPrecioMaximo(page);
    await sembrarValor(page, '#precioFijado', 20); // parte de 25; P* = 34,3, así que el techo ATA

    // Qd = 100 − 40 = 60 ; Qo = −20 + 30 = 10 → escasez 50 u., y se negocian las 10 del lado corto.
    await expect(resultado(page, 'Escasez')).toHaveText('50,0 u.');
    await expect(resultado(page, 'Cantidad negociada')).toHaveText('10,0 u.');

    // Con 10 u. a 20 €: EC = ∫₀¹⁰ (100 − q)/2 dq − 200 = 475 − 200 = 275,0 €
    //                  EP = 200 − ∫₀¹⁰ (q + 20)/1,5 dq = 200 − 166,67 = 33,3 €
    // Bienestar 308,3 €, es decir 267,9 € menos que los 576,2 € del libre mercado: la pérdida
    // irrecuperable de eficiencia que el propio FAQ de la app explica.
    await expect(resultado(page, 'Excedente consumidor')).toHaveText('275,0 €');
    await expect(resultado(page, 'Excedente productor')).toHaveText('33,3 €');
    await expect(resultado(page, 'Bienestar total')).toHaveText('308,3 €');
    await expect(resultado(page, 'Pérdida irrecuperable')).toHaveText('267,9 €');
  });

  test('HALLAZGO C — un techo por encima del equilibrio no ata: la escasez es 0, no una cifra con el signo cambiado', async ({
    page,
  }) => {
    await abrirPrecioMaximo(page);
    await sembrarValor(page, '#precioFijado', 50); // parte de 25; P* = 34,3, así que el techo NO ata

    // El aviso sale...
    await expect(page.getByText(/P_max debe ser menor que P\*/)).toBeVisible();
    // ...y ahora la cifra que lo acompaña es la buena: el mercado se vacía en P* = 34,3 y no hay
    // escasez ninguna. Antes publicaba |Qd − Qo| evaluado en 50 €: |0 − 55| = 55,0 u., que
    // además es exceso de OFERTA, no escasez.
    await expect(resultado(page, 'Escasez')).toHaveText('0,0 u.');
    // Y el panel sigue siendo el del libre mercado, porque el control no cambia nada.
    await expect(resultado(page, 'Bienestar total')).toHaveText('576,2 €');
    // Sin control efectivo no hay cantidad racionada ni pérdida que enseñar.
    await expect(page.locator('[class*="resultCard"]').filter({ hasText: 'Cantidad negociada' })).toHaveCount(0);
  });

  test('HALLAZGO D — con los seis deslizadores al extremo, el eje se adapta y E* sigue dibujado', async ({
    page,
  }) => {
    expect(await pixelesEquilibrio(page)).toBeGreaterThan(20); // en el estado inicial sí se dibuja

    for (const [indice, valor] of [[0, 5], [1, 5], [2, 5], [3, -5], [4, 5], [5, 5]] as const) {
      await sembrarValor(page, deslizador(page, indice), valor);
    }

    // a = 160, c = 25 → P* = 135/3,5 = 38,571… y Q* = 160 − 2·P* = 82,857…, por encima del
    // Q_MAX = 80 que dibujaba antes el canvas. Ahora la escala sube al múltiplo de 10 siguiente
    // (100 u.) y el punto que el panel anuncia se puede localizar en la gráfica.
    await expect(resultado(page, 'Cantidad de equilibrio')).toHaveText('82,9 u.');
    await expect(resultado(page, 'Precio de equilibrio')).toHaveText('38,6 €');
    await page.waitForTimeout(300); // el canvas se repinta en un efecto, tras el render
    expect(await pixelesEquilibrio(page)).toBeGreaterThan(20);
  });

  test('HALLAZGO F — los tres botones del selector de modo declaran type="button"', async ({
    page,
  }) => {
    const modos = page.locator('[class*="modeBtn"]');
    await expect(modos).toHaveCount(3);
    for (let i = 0; i < 3; i++) {
      // aria-pressed anuncia cuál está activo; el type evita que sean submit por defecto
      // (regla §5 del CLAUDE.md global).
      expect(await modos.nth(i).getAttribute('aria-pressed')).not.toBeNull();
      expect(await modos.nth(i).getAttribute('type')).toBe('button');
    }
  });

  test('los cinco componentes obligatorios están montados', async ({ page }) => {
    await expect(page.getByRole('link', { name: /meskeIA/i }).first()).toBeVisible();
    await expect(page.getByText(/Política de Privacidad/i).first()).toBeVisible(); // LegalNotice
    await expect(page.getByText(/Compártela|Compartir/i).first()).toBeVisible(); // ShareCard
    await expect(page.locator('footer').first()).toBeVisible(); // Footer
  });
});
