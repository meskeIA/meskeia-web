import { test, expect, Locator, Page } from '@playwright/test';
import { esperarHidratacion, sembrarValor } from './_hidratacion';
import { readFileSync } from 'node:fs';
import {
  CASOS,
  SLIDERS_INICIALES,
  TOTAL_CASOS,
  calcularCurvas,
  calcularEquilibrio,
  cantidadesAPrecio,
  comprobarRespuesta,
  esPrediccion,
  generarEjercicioAleatorio,
  resolverCaso,
  toleranciaDe,
  type Desplazador,
  type Direccion,
} from '../../app/simulador-oferta-demanda/casos';

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
    // En el estado inicial sí se dibuja. Con espera (06/10/2026): el canvas se pinta en un
    // useEffect DESPUÉS de hidratar, y leerlo al instante era una carrera que ganaba casi
    // siempre; con la sección de casos el árbol creció y empezó a perderla (1 de cada 3).
    await expect.poll(() => pixelesEquilibrio(page), { timeout: 3000 }).toBeGreaterThan(20);

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

/*
 * ═════════════════════════════════════════════════════════════════════════════════════════
 * CASOS PARA CLASE (skill /casos-aula-meskeia, 06/10/2026) — tipos A (1-6) y C (7-12).
 *
 * Van DETRÁS del acta del Inspector y la dejan intacta: la sección nueva no añade ningún
 * deslizador (el acta los cuenta por posición), ni role="status", ni clases con «resultCard».
 *
 * CÓMO SE DERIVA CADA VALOR ESPERADO — a mano, igualando Qd = Qo:
 *    1. 100 − 2P = 4P − 20 → 120 = 6P → P* = 20
 *    2. Q* = 100 − 2·20 = 60   (oferta: 4·20 − 20 = 60)
 *    3. 300 − 5P = 60 + 3P → 240 = 8P → P* = 30
 *    4. 200 − 4P = 6P − 100 → 300 = 10P → P* = 30 → Q* = 200 − 120 = 80
 *    5. P = 10: Qd = 120 − 30 = 90, Qo = 20 + 20 = 40 → faltan 50   (P* = 20, por encima)
 *    6. P = 30: Qd = 100 − 60 = 40, Qo = 120 − 20 = 100 → sobran 60  (P* = 20, por debajo)
 *  Los 7-12 son el desplazamiento de libro, desde el estado inicial:
 *    7. renta +2 → demanda a la derecha → P* SUBE        (34,3 → 36,6)
 *    8. tecnología +2 → oferta a la derecha → P* BAJA    (34,3 → 32,6)
 *    9. costes +2 → oferta a la izquierda → Q* BAJA      (31,4 → 28,0)
 *   10. sustitutivos +2 → demanda a la derecha → Q* SUBE (31,4 → 34,9)
 *   11. productores +3 → oferta a la derecha → P* BAJA   (34,3 → 31,7)
 *   12. preferencias −2 → demanda a la izquierda → Q* BAJA (31,4 → 28,0)
 *
 * Los A se cotejan además con Cramer escrito en el test, y los C con la TABLA DE LIBRO
 * (`direccionDeLibro`), que no ejecuta el modelo: así la comparación no es la app contra sí misma.
 * ═════════════════════════════════════════════════════════════════════════════════════════
 */

const ESPERADOS_CASOS: Record<number, number | Direccion> = {
  1: 20, 2: 60, 3: 30, 4: 80, 5: 50, 6: 60,
  7: 'sube', 8: 'baja', 9: 'baja', 10: 'sube', 11: 'baja', 12: 'baja',
};

/** Cramer sobre { Q + bP = a ; Q − dP = c }. */
function equilibrioCramer(a: number, b: number, c: number, d: number): { P: number; Q: number } {
  const det = 1 * -d - b * 1;
  const Q = (a * -d - b * c) / det;
  const P = (1 * c - a * 1) / det;
  return { P, Q };
}

/** La tabla de cualquier libro: hacia dónde va P* y Q* con cada desplazador. */
function direccionDeLibro(desplazador: Desplazador, movimiento: number, variable: 'precio' | 'cantidad'): Direccion {
  const demanda = ['renta', 'sustitutivos', 'preferencias'].includes(desplazador);
  // ¿La curva se mueve a la derecha? Los costes van al revés: más coste, menos oferta.
  const derecha = (desplazador === 'costes' ? -movimiento : movimiento) > 0;
  if (demanda) return derecha ? 'sube' : 'baja'; // P y Q en el mismo sentido
  if (variable === 'cantidad') return derecha ? 'sube' : 'baja';
  return derecha ? 'baja' : 'sube'; // oferta: P y Q en sentidos contrarios
}

test.describe('simulador-oferta-demanda · casos para clase', () => {
  test('1-4 · doce casos, ids 1..12, deterministas, completos y recalculables desde sus datos', () => {
    expect(CASOS).toHaveLength(12);
    expect(TOTAL_CASOS).toBe(12);
    expect(CASOS.map((c) => c.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    for (const c of CASOS) {
      expect(c.enunciado.length, `caso ${c.id}`).toBeGreaterThan(40);
      expect(c.etiquetaRespuesta.trim(), `caso ${c.id}`).not.toBe('');
      expect(
        typeof c.respuesta === 'string' ? ['sube', 'baja', 'no-cambia'].includes(c.respuesta) : Number.isFinite(c.respuesta),
        `caso ${c.id}`,
      ).toBe(true);
      expect(c.pasos.length, `caso ${c.id}`).toBeGreaterThanOrEqual(2);
      expect(c.pista.trim(), `caso ${c.id}`).not.toBe('');
      // 3 · la respuesta declarada es la que sale de recalcular desde `datos`
      const r = resolverCaso(c.datos);
      expect(r.ok, `caso ${c.id}`).toBe(true);
      expect(r.valor, `caso ${c.id}`).toBe(c.respuesta);
      // 2 · determinista
      expect(resolverCaso(c.datos)).toEqual(r);
    }
    expect(new Set(CASOS.map((c) => c.categoria))).toEqual(new Set(['abstracto', 'aplicado']));
    // Seis de cada tipo, en este orden: el texto de la sección lo anuncia así
    expect(CASOS.map((c) => esPrediccion(c.datos))).toEqual([...Array(6).fill(false), ...Array(6).fill(true)]);
  });

  test('las doce respuestas coinciden con las resueltas a mano, con Cramer y con la tabla de libro', () => {
    for (const c of CASOS) {
      expect(c.respuesta, `caso ${c.id}`).toEqual(ESPERADOS_CASOS[c.id]);
      const d = c.datos;
      if (d.tipo === 'equilibrio') {
        const { P, Q } = equilibrioCramer(d.curvas.a, d.curvas.b, d.curvas.c, d.curvas.d);
        expect(c.respuesta, `caso ${c.id}`).toBeCloseTo(d.pide === 'precio' ? P : Q, 10);
      } else if (d.tipo === 'desajuste') {
        const qd = d.curvas.a - d.curvas.b * d.precio;
        const qo = d.curvas.c + d.curvas.d * d.precio;
        expect(c.respuesta, `caso ${c.id}`).toBeCloseTo(Math.abs(qd - qo), 10);
      } else {
        expect(c.respuesta, `caso ${c.id}`).toBe(direccionDeLibro(d.desplazador, d.movimiento, d.variable));
      }
    }
  });

  test('5 · ningún enunciado nombra un país, una ciudad ni una moneda nacional', () => {
    const lugares =
      /españ|méxic|mexic|colombi|argentin|chile|perú|peru|venezuel|ecuador|guatemal|bolivi|uruguay|paraguay|cuba|honduras|salvador|nicaragu|costa rica|panam|dominican|madrid|barcelona|bogotá|lima|santiago|buenos aires|euro|€|dólar|dolar|\$|pesos (mexicanos|colombianos|argentinos|chilenos)|soles|selectividad|bachillerato/i;
    for (const c of CASOS) {
      expect(`${c.titulo} ${c.enunciado}`, `caso ${c.id}`).not.toMatch(lugares);
      expect(`${c.titulo} ${c.enunciado}`, `caso ${c.id}`).not.toMatch(/\bESO\b/);
    }
  });

  test('5.bis · respuestas limpias: enteras en los A, y ninguna pide redondear', () => {
    for (const c of CASOS) {
      expect(c.enunciado, `caso ${c.id}`).not.toMatch(/redonde/i);
      if (typeof c.respuesta === 'number') expect(Number.isInteger(c.respuesta), `caso ${c.id}`).toBe(true);
    }
    expect(CASOS[0].respuestaTexto).toBe('20 u. m.');
    expect(CASOS[1].respuestaTexto).toBe('60 unidades');
    expect(CASOS[6].respuestaTexto).toBe('Sube');
  });

  test('C · la rejilla entera: en cada desplazador y cada movimiento, el panel enseña lo que dice el libro', () => {
    // La regla del tipo C: la respuesta se evalúa sobre lo que ENSEÑA el panel (un decimal), y
    // no debe morder el suelo en 0 de calcularEquilibrio. Se recorre la rejilla completa que
    // permiten los deslizadores desde el estado inicial: 6 desplazadores × 10 movimientos × 2.
    const desplazadores: Desplazador[] = ['renta', 'sustitutivos', 'preferencias', 'costes', 'tecnologia', 'productores'];
    let combinaciones = 0;
    for (const desplazador of desplazadores) {
      for (const movimiento of [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]) {
        for (const variable of ['precio', 'cantidad'] as const) {
          const r = resolverCaso({ tipo: 'prediccion', desplazador, movimiento, variable });
          expect(r.ok, `${desplazador} ${movimiento}`).toBe(true);
          expect(r.valor, `${desplazador} ${movimiento} ${variable}`).toBe(direccionDeLibro(desplazador, movimiento, variable));
          combinaciones++;
        }
      }
    }
    expect(combinaciones).toBe(120);
    // Y el estado de partida es el de la app: P* = 34,3 y Q* = 31,4 en el panel
    const inicial = calcularEquilibrio(calcularCurvas(SLIDERS_INICIALES));
    expect(Math.round(inicial.P * 10) / 10).toBe(34.3);
    expect(Math.round(inicial.Q * 10) / 10).toBe(31.4);
  });

  test('7 · convenio: Qd = a − bP y Qo = c + dP, el panel y la corrección usan el mismo motor', () => {
    // Con la cantidad despejada. Si alguien leyera Qo = 4P − 20 como P = 4Q − 20, el caso 1
    // daría otro precio: 100 − 2P = (P + 20)/4 → P = 380/9 ≈ 42,2. No se acepta.
    expect(comprobarRespuesta(380 / 9, CASOS[0].respuesta, CASOS[0].datos).correcto).toBe(false);
    // cantidadesAPrecio es lo que usa el panel bajo un control de precio; aquí, el caso 5
    expect(cantidadesAPrecio({ a: 120, b: 3, c: 20, d: 2 }, 10)).toEqual({ qd: 90, qo: 40 });
    // El motor de la app es UNO: page.tsx importa las curvas de casos.ts y no las redefine
    const pagina = readFileSync('app/simulador-oferta-demanda/page.tsx', 'utf8');
    expect(pagina).toMatch(/from '\.\/casos'/);
    for (const f of ['calcularCurvas', 'calcularEquilibrio']) {
      expect(pagina, f).not.toMatch(new RegExp(`function ${f}\\b`));
    }
    expect(pagina).not.toMatch(/curvas\.a - curvas\.b \* precioFijado/);
  });

  test('corrección: tolerancia, signo cambiado, opción sin elegir y datos imposibles', () => {
    const caso1 = CASOS[0]; // 20
    expect(toleranciaDe(20)).toBeCloseTo(0.2, 10);
    expect(toleranciaDe(0)).toBe(0.01);
    expect(comprobarRespuesta(20, 20, caso1.datos).correcto).toBe(true);
    expect(comprobarRespuesta(20.2, 20, caso1.datos).correcto).toBe(true);
    expect(comprobarRespuesta(21, 20, caso1.datos).correcto).toBe(false);
    expect(comprobarRespuesta(NaN, 20, caso1.datos).motivo).toContain('Escribe un número');
    // El desajuste en negativo recibe un aviso propio
    const caso5 = CASOS[4]; // faltan 50
    const negativo = comprobarRespuesta(-50, 50, caso5.datos);
    expect(negativo.correcto).toBe(false);
    expect(negativo.motivo).toContain('en positivo');
    // Predicción: sin elegir no hay veredicto de acierto; elegir mal o bien
    const caso7 = CASOS[6]; // sube
    expect(comprobarRespuesta(null, 'sube', caso7.datos).motivo).toContain('Elige una');
    expect(comprobarRespuesta('baja', 'sube', caso7.datos).correcto).toBe(false);
    expect(comprobarRespuesta('sube', 'sube', caso7.datos).correcto).toBe(true);
    // Nada lanza: curvas, precios o movimientos imposibles devuelven ok: false
    expect(resolverCaso({ tipo: 'equilibrio', curvas: { a: 10, b: 2, c: 50, d: 1 }, pide: 'precio' }).ok).toBe(false);
    expect(resolverCaso({ tipo: 'equilibrio', curvas: { a: 100, b: 0, c: 0, d: 0 }, pide: 'precio' }).ok).toBe(false);
    expect(resolverCaso({ tipo: 'desajuste', curvas: { a: 100, b: 2, c: -20, d: 4 }, precio: 20 }).ok).toBe(false);
    expect(resolverCaso({ tipo: 'desajuste', curvas: { a: 100, b: 2, c: -20, d: 4 }, precio: 60 }).ok).toBe(false);
    expect(resolverCaso({ tipo: 'prediccion', desplazador: 'renta', movimiento: 6, variable: 'precio' }).ok).toBe(false);
    expect(resolverCaso({ tipo: 'prediccion', desplazador: 'renta', movimiento: 0, variable: 'precio' }).ok).toBe(false);
  });

  test('6 · la práctica es reproducible, variada y corrige con el mismo resolverCaso', () => {
    expect(generarEjercicioAleatorio(42)).toEqual(generarEjercicioAleatorio(42));
    const respuestas = new Set<string>();
    const escenarios = new Set<string>();
    const tipos = new Set<string>();
    for (let s = 1; s <= 40; s++) {
      const e = generarEjercicioAleatorio(s);
      respuestas.add(String(e.respuesta));
      escenarios.add(JSON.stringify(e.datos));
      tipos.add(e.datos.tipo);
      const r = resolverCaso(e.datos);
      expect(r.ok, `semilla ${s}: ${e.enunciado}`).toBe(true);
      expect(r.valor, `semilla ${s}`).toBe(e.respuesta);
      const d = e.datos;
      if (d.tipo === 'equilibrio') {
        const { P, Q } = equilibrioCramer(d.curvas.a, d.curvas.b, d.curvas.c, d.curvas.d);
        expect(e.respuesta, `semilla ${s}`).toBeCloseTo(d.pide === 'precio' ? P : Q, 10);
        expect(Number.isInteger(e.respuesta), `semilla ${s}`).toBe(true);
      } else if (d.tipo === 'prediccion') {
        expect(e.respuesta, `semilla ${s}`).toBe(direccionDeLibro(d.desplazador, d.movimiento, d.variable));
      }
      expect(e.enunciado, `semilla ${s}`).not.toMatch(/NaN|undefined|-\d/);
    }
    expect(respuestas.size).toBeGreaterThanOrEqual(3);
    expect(escenarios.size).toBeGreaterThanOrEqual(20);
    expect(tipos).toEqual(new Set(['equilibrio', 'desajuste', 'prediccion']));
  });
});

test.describe('simulador-oferta-demanda · la sección de casos en el navegador', () => {
  const seccion = (page: Page) => page.locator('section[aria-labelledby="casos-aula-titulo"]');
  const casilla = (page: Page) => page.locator('#casos-respuesta');

  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['input[type=range]']);
  });

  test('un caso numérico y uno de predicción, y la predicción se confirma en el panel', async ({ page }) => {
    await expect(seccion(page)).toBeVisible();
    await expect(seccion(page).getByRole('button', { name: /^Caso \d+:/ })).toHaveCount(12);

    await seccion(page).getByRole('button', { name: 'Caso 5: Pan a un precio demasiado bajo' }).click();
    await casilla(page).fill('-50');
    await seccion(page).getByRole('button', { name: 'Comprobar' }).click();
    await expect(seccion(page).getByRole('alert')).toContainText('en positivo');
    await casilla(page).fill('50');
    await casilla(page).press('Enter');
    await expect(seccion(page).getByRole('alert')).toContainText('¡Correcto!');

    // Caso 7: predecir sin mover, y después mover y ver que el panel dice lo mismo
    await seccion(page).getByRole('button', { name: 'Caso 7: Las familias ganan más' }).click();
    await expect(casilla(page)).toHaveCount(0);
    await seccion(page).getByRole('button', { name: 'Comprobar' }).click();
    await expect(seccion(page).getByRole('alert')).toContainText('Elige una');
    await seccion(page).getByRole('radio', { name: 'Sube' }).check();
    await seccion(page).getByRole('button', { name: 'Comprobar' }).click();
    await expect(seccion(page).getByRole('alert')).toContainText('¡Correcto!');
    await expect(resultado(page, 'Precio de equilibrio')).toHaveText('34,3 €');
    await sembrarValor(page, deslizador(page, RENTA), 2);
    await expect(resultado(page, 'Precio de equilibrio')).toHaveText('36,6 €');

    await seccion(page).getByRole('button', { name: 'Ver solución' }).click();
    await expect(seccion(page).locator('#casos-solucion')).toContainText('de 34,3 a 36,6');
  });

  test('la sección no añade deslizadores, ni role="status", ni tarjetas de resultado', async ({ page }) => {
    await expect(page.locator('input[type=range]')).toHaveCount(6);
    await expect(page.locator('[role="status"]')).toHaveCount(1);
    await expect(seccion(page).locator('[class*="resultCard"]')).toHaveCount(0);
  });
});
