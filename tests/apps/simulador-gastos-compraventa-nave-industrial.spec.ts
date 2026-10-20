/**
 * Inspector — simulador-gastos-compraventa-nave-industrial (segmento CÁLCULO/FISCAL, riesgo 1 CRÍTICO)
 *
 * Historia del fichero:
 *  · 21/08/2026 — primera inspección. 11 hallazgos (156-166).
 *  · 23/08/2026 — reparación (commits c47189ca, c78fa7db, 148e2ebc, 4b936165, 44a5dc7d).
 *  · 27/08/2026 — RE-INSPECCIÓN. Los 11 hallazgos se reprodujeron uno a uno con su caso
 *    literal: los 11 siguen cerrados. Sus tests dejan de llamarse «hallazgos abiertos» y
 *    pasan al bloque de REGRESIÓN. Se añaden casos nuevos (Melilla, Cataluña en el tramo
 *    del 13 %, tope del arancel registral, formato español de entrada) y 4 hallazgos
 *    nuevos al final, con `test.fail()`.
 *  · 28/08/2026 — re-inspección de cierre: los 4 hallazgos del 27/08 cerrados, 4 nuevos.
 *  · 02/09/2026 — re-inspección: 5 hallazgos (600-604), reparados el mismo día.
 *  · 07/09/2026 — RE-INSPECCIÓN. El fichero entero pasó en verde ANTES de tocar nada
 *    (45/45, sin ningún `test.fail()` pendiente): las reparaciones anteriores siguen
 *    cerradas y no hay regresiones. Se añaden tres casos nuevos —Murcia 350.000 €,
 *    Ceuta en el corte exacto del arancel notarial (6.010.121,04 €) y Ceuta con
 *    renuncia, donde el IPSI NO se cuantifica—, un barrido de las 19 comunidades que
 *    comprueba que a ninguna nave se le cuela un tipo reducido de vivienda habitual,
 *    y 6 hallazgos nuevos al final, con `test.fail()`.
 *  · 09/09/2026 — REPARACIÓN de los 6 hallazgos del 07/09 (646-651): el suelo del ranking del
 *    FAQPage con `sueloDe()`, los dos avisos de transmisión mirando `TERRITORIOS_SIN_IVA`, los
 *    colores de la tabla comparativa con contraste en ambos temas, los 14 bordes `#e0e0e0`
 *    pasados a `var(--border)`, el 50 % derivado de `BONIFICACION_CUOTA_CEUTA_MELILLA` y el
 *    rango de ITP con `formatTipoNominal`. Sus tests pierden el `test.fail()` y pasan al
 *    bloque de REGRESIÓN. No queda ningún hallazgo abierto en el fichero.
 *  · 10/09/2026 — RE-INSPECCIÓN (56/56 en verde antes de tocar nada). Tres casos nuevos
 *    (Asturias 750.000 €, Castilla y León en 601.012,10 € y el barrido de tipos reducidos)
 *    y 3 hallazgos: los dos de contraste (683 y 684) y el AJD con dos decimales forzados.
 *    Los tres se repararon el mismo día.
 *  · 14/09/2026 — RE-INSPECCIÓN, la 7ª (63/63 en verde antes de tocar nada). Los tres
 *    hallazgos del 10/09 se reprodujeron y están cerrados… con una salvedad: el testigo del
 *    tercero estaba CIEGO (buscaba «AJD 0,5%» en un `textContent` donde pone «AJD0,5%»), así
 *    que se ha rehecho leyendo el nodo de la cifra. El 683 estaba reparado A MEDIAS: quedaban
 *    `.transmisionBtn.active` (3,74:1) y `.sectionTitle` (4,11:1) en tema claro. Tres casos
 *    nuevos —Galicia en obra nueva, Baleares en el corte exacto de 1.000.000 € y el precio
 *    negativo que sobrevive al blur—, la comprobación de las dos pistas de efecto familia de
 *    `garaje`/`trastero` (ninguna aplica: esta app no tiene parte de vendedor) y 3 hallazgos
 *    nuevos al final, con `test.fail()`.
 *  · 21/09/2026 — RE-INSPECCIÓN, la 8ª. El fichero entero pasó en verde ANTES de tocar nada
 *    (70/70), así que todo lo reparado desde el 23/08 sigue cerrado. Los 3 hallazgos del
 *    14/09 se reprodujeron MIDIENDO en el navegador: `.transmisionBtn.active` pasó de
 *    3,74:1 a 4,97:1 en claro (4,58:1 en oscuro, intacto), `.sectionTitle` de 4,11:1 a
 *    5,47:1 (4,93:1 en oscuro) y la FAQ de la plusvalía ya dice «no sujeción». Sus tests
 *    pierden el nombre de «hallazgo» y pasan al bloque de REGRESIÓN. Tres casos nuevos
 *    —Cantabria 480.000 €, Navarra con renuncia en 150.253,03 € exactos y tres millares mal
 *    escritos—, el corte de Aragón en 450.000 €, y 3 hallazgos nuevos al final con
 *    `test.fail()`.
 *  · 26/09/2026 — RE-INSPECCIÓN como hermana del grupo B de la familia «Compraventa
 *    inmobiliaria» (99/99 en verde antes de tocar nada). 1581-1585 siguen cerrados. Casos
 *    nuevos: Galicia 275.000 € en los dos regímenes, Valencia a UN CÉNTIMO del umbral (y con
 *    renuncia), Cataluña 3.000.000 € (último tramo de la escala y del arancel notarial), País
 *    Vasco con renuncia a 750.000 €, y el invariante del ilegible con su dirección. Cuatro
 *    hallazgos bajos al final, con `test.fail()` salvo con `VER_HUECOS=1`.
 *  · 26/09/2026 (tarde) — REPARADOS 2204-2207, sin marca, y la receta de la familia llevada
 *    aquí: notaría y registro sin IVA en Canarias, Ceuta y Melilla (2214), la base mínima del
 *    AJD (2209), las notas de la comunidad (2208) y el foco del select en oscuro (2215). Los
 *    casos anteriores con esas tres comunidades se recalcularon a mano (líneas ÷ 1,21), y los
 *    lectores de tarjeta comparan cifras con el «%» pegado (`pegarPct`) y apartan la salvedad
 *    del AJD (`sinAvisoBaseAjd`), que se mide aparte.
 *  · 06/10/2026 — RE-INSPECCIÓN como hermana de la familia (cola: INVALIDADA tras b86a5607,
 *    7d5c1876 y 242fffcd). Las reparaciones del 26/09 se verificaron en navegador, no por el
 *    commit. Casos nuevos: Castilla-La Mancha 420.000 € en los tres regímenes, Canarias con
 *    renuncia al IGIC a 640.000 € (y el paso a Ceuta y vuelta a Valencia con la renuncia
 *    elegida), Valencia en obra nueva a 1.200.000 €, el AJD foral del recuadro tras pulsar
 *    los tres botones, el invariante del ilegible en los dos campos y las formas que hoy
 *    salieron en las hermanas. Las cifras de notaría y registro NO se fijan en los casos
 *    nuevos: los hallazgos 2901 y 2902 (rebaja del 5 % de los dos aranceles, abiertos en la
 *    referencia) las cambiarán; se comprueba que el desglose CUADRA con ellas. Dos hallazgos
 *    bajos (2914 y 2915), REPARADOS ese mismo día: sus tests perdieron el `test.fail()`.
 *  · 08/10/2026 — INSPECCIÓN como hermana de la familia (único cambio de código desde el 06/10:
 *    99e1ee7e, las relacionadas montadas desde el layout). Casos nuevos: Asturias 420.000 € en
 *    el segundo tramo de su escala, Melilla en obra nueva a 7.000.000 € (IPSI sin calcular, AJD
 *    bonificado, notaría de libre acuerdo y gestoría ilegible a la vez) y la renuncia elegida en
 *    Galicia que Melilla rechaza; las relacionadas en el HTML servido y tras hidratar, y cinco
 *    hallazgos al final con `test.fail()` salvo con `VER_HUECOS=1`. Los cinco (3084-3088) se
 *    REPARARON ese mismo día y sus tests perdieron la marca.
 *  · 13/10/2026 — RE-INSPECCIÓN (INVALIDADA tras la rebaja del 5 % de los aranceles del 11/10 y el
 *    reparto del IBI, S0195). Casos nuevos: Extremadura 820.000 € en el tercer tramo de su escala,
 *    Valencia a 10.000.000 € con la renuncia (AJD del 2 %, notaría de libre acuerdo y el registro
 *    en su TOPE, con la rebaja aplicada después del tope) y el reparto del IBI y la comunidad, que el
 *    testigo de familia solo mide con el IBI. Notaría y registro se fijan al céntimo CON la rebaja.
 *    Cuatro hallazgos al final con `test.fail()` salvo con `VER_HUECOS=1` (3263-3266), REPARADOS
 *    el 19/10/2026 (98c7b32e y components/ProrrateoIbiComunidad): sus tests perdieron la marca.
 *  · 19/10/2026 — INSPECCIÓN (la cola la sacó por los cabos C0314 y C0315). Las cuatro reparaciones
 *    del 13/10 se sostienen. Casos nuevos: La Rioja a 345.678,90 € con decimales en los dos campos y
 *    en los tres regímenes, Aragón en el último tramo de su escala (1.100.000 € y el corte exacto de
 *    750.000 €, que la tabla oficial del art. 121-1 cifra en 64.500 €) con la gestoría a cero, y
 *    Canarias con la renuncia al IGIC y la gestoría ilegible. Tres hallazgos al final con
 *    `test.fail()` salvo con `VER_HUECOS=1`.
 *
 * De dónde sale CADA cifra esperada (ninguna de memoria):
 *  - Tipo general de ITP por CCAA → `TIPOS_ITP_CCAA_2025` en `data/fiscal/inmuebles.ts`,
 *    que `tipoGeneralDe()` de `data/itp-ccaa.ts` lee para rellenar `ITP_CCAA[x].tipoGeneral`
 *    (Madrid = 6 · Canarias = 6,5 · Murcia = 7,75 · Valencia = 9 · Baleares = 8 · Cataluña = 10).
 *  - Escalas progresivas y AJD por comunidad → `ITP_CCAA` en `data/itp-ccaa.ts`
 *    (Valencia: 9 % hasta 1.000.000 € y 11 % por encima · Baleares: 8/9/10/12/13 %
 *     · Cataluña: 10/11/12/13 % con cortes en 600.000, 900.000 y 1.500.000 €
 *     · Canarias `ajd: 0.75` · Ceuta y Melilla `ajd: 0.5` · País Vasco `ajd: 0.5`, foral, para
 *     una nave: su `ajdVivienda: 0` es la exención de la primera transmisión de VIVIENDA, desde
 *     el 24/09/2026, hallazgo 1583 · Castilla-La Mancha `ajd: 1.5` · Valencia `ajd: 1.4` y
 *     `ajdRenuncia: 2`).
 *  - Bonificación del 50 % de Ceuta y Melilla → `BONIFICACION_CUOTA_CEUTA_MELILLA` y
 *    `CIUDADES_CON_BONIFICACION` en `data/itp-ccaa.ts` (art. 57 bis del TRLITPAJD, que la
 *    reconoce por el SITIO del inmueble, sea cual sea su uso). La aplican `calcularITP`
 *    y `calcularAJD`, así que alcanza a las dos cuotas.
 *  - Territorios sin IVA → `TERRITORIOS_SIN_IVA` (Canarias → IGIC · Ceuta y Melilla → IPSI).
 *    El catálogo NO calcula esos impuestos: nombra el que toca y marca el total como parcial.
 *  - IVA de la nave / local en primera entrega → `IVA_INMUEBLES_2025.local = 21`
 *    en `data/fiscal/inmuebles.ts`.
 *  - Arancel notarial → `ARANCELES_NOTARIO` (RD 1426/1989, número 2: matriz + una copia) y
 *    la FACTURA mostrada → `FACTURA_NOTARIAL` (horquilla ×1,5 a ×2 por los números 4, 6 y 7;
 *    la tarjeta enseña el punto medio ×1,75).
 *  - Arancel registral → `ARANCELES_REGISTRO` (RD 1427/1989, número 2), con el tope
 *    `REGISTRO_MAXIMO = 2181,67`, MÁS los fijos de `REGISTRO_CONCEPTOS`: presentación
 *    6,010121 € y nota simple 3,005061 €.
 *  - El 21 % de IVA sobre honorarios va dentro de `calcularArancelNotarial` y `calcularRegistro`,
 *    salvo en Canarias, Ceuta y Melilla (`honorariosLlevanIVA`, desde el 26/09/2026).
 *  - Fecha y fuente que la página declara → `FISCAL_INMUEBLES_META` (verificado 2026-06-17,
 *    vigencia 2026).
 *
 * Todos los casos están resueltos a mano ANTES de ejecutar la app; el desarrollo va comentado
 * junto a cada aserción, con los importes sin redondear.
 *
 * Los dos hallazgos de la re-inspección del 06/10/2026 (2914 y 2915) se repararon ese mismo día y
 * se quedaron como regresión. Los cinco de la inspección del 08/10/2026 (3084-3088) se escribieron
 * con `test.fail()` y quedaron REPARADOS ese mismo día: hoy son regresión en el bloque de su fecha.
 * Los cuatro de la re-inspección del 13/10/2026 (3263-3266) se escribieron con `test.fail()` y
 * quedaron REPARADOS el 19/10/2026: hoy son regresión en el bloque de su fecha.
 * HALLAZGOS ABIERTOS a 19/10/2026: los tres de la inspección de ese día, al final del fichero con
 * `test.fail()`. Todos se escriben igual, afirmando lo que DEBERÍA pasar, y al repararse pierden la
 * marca y se quedan como regresión en el bloque de su fecha.
 */
import { test, expect, Page } from '@playwright/test';
import {
  GANANCIAS_PATRIMONIALES_META,
  IVA_INMUEBLES_2025,
  TRAMOS_GANANCIAS_PATRIMONIALES_2025,
} from '../../data/fiscal/inmuebles';
import {
  BONIFICACION_CUOTA_CEUTA_MELILLA,
  FACTURA_NOTARIAL,
  ITP_CCAA,
  LIMITE_ARANCEL_NOTARIAL,
  RANGO_AJD_OTROS,
  RANGO_ITP_OTROS,
  REBAJA_ARANCEL_CUANTIA,
  REGISTRO_CONCEPTOS,
  REGISTRO_MAXIMO,
} from '../../data/itp-ccaa';
import { esperarHidratacion, esperarValorEnReact, sembrarValor } from './_hidratacion';

const RUTA = '/simulador-gastos-compraventa-nave-industrial/';

/**
 * Repite una medición hasta que dos lecturas consecutivas coinciden.
 *
 * Leer un color computado justo después de cambiar de tema devuelve un fotograma
 * INTERMEDIO de la transición CSS: un número que no existe en ninguno de los dos temas.
 * El 09/09/2026 esto daba 1,72:1 en el trastero (texto ya oscuro sobre un panel a medio
 * camino, cuando lo real son 6,6:1) y 3,05:1 en la tabla de la nave, cuyo peor caso real
 * es 5,72:1.
 *
 * No sirve esperar `getAnimations()`: consultarlo en el mismo tick del clic devuelve una
 * lista vacía —el navegador aún no ha creado las transiciones— y, con margen de dos
 * fotogramas, las transiciones nacen escalonadas, así que unas terminan mientras otras
 * empiezan. Lo único que no depende de cómo esté implementada la animación es esperar a
 * que la medida deje de moverse.
 */
async function esperarEstable<T>(leer: () => Promise<T>): Promise<T> {
  let anterior = await leer();
  for (let intento = 0; intento < 30; intento++) {
    await new Promise((r) => setTimeout(r, 100));
    const actual = await leer();
    if (JSON.stringify(actual) === JSON.stringify(anterior)) return actual;
    anterior = actual;
  }
  return anterior;
}
/**
 * Pone la página en modo oscuro DE VERDAD, y lo comprueba.
 *
 * `document.documentElement.setAttribute('data-theme','dark')` a pelo no sirve: si se
 * ejecuta antes de que la app hidrate, su gestor de tema lo pisa con la preferencia
 * guardada y el atributo vuelve a `light` sin decir nada. El 09/09/2026 los dos tests de
 * accesibilidad de esta app medían así el tema CLARO creyendo medir el oscuro — el de los
 * bordes fallaba (en claro el borde ES #e0e0e0, y con razón) y el del contraste PASABA EN
 * FALSO, midiendo dos veces lo mismo.
 *
 * Por eso se pulsa el botón real —lo que hace un usuario, y deja a la app como dueña del
 * estado— y se AFIRMA el atributo: si algún día vuelve a revertirse, el test lo dice en vez
 * de medir el tema equivocado en silencio.
 */
async function activarTemaOscuro(page: Page): Promise<void> {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.getByRole('button', { name: /Cambiar a modo oscuro/i }).first().click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
}

const FUENTE_PAGE = 'app/simulador-gastos-compraventa-nave-industrial/page.tsx';

/**
 * Cifras, no tipografía: desde el 26/09/2026 la app separa el «%» con espacio duro (hallazgos
 * 2204/2211/2216), y `\s+` → ' ' lo deja en un espacio normal. Los casos anteriores comparan
 * cifras escritas con el «%» pegado, así que los lectores de tarjeta lo vuelven a pegar; la
 * tipografía la vigila el caso del «%» (forma «c»), que lee el texto en crudo.
 */
const pegarPct = (s: string): string => s.replace(/(\d) %/g, '$1%');

/**
 * La salvedad del art. 30.1 TRLITPAJD (hallazgo 2209, 26/09/2026) que la app añade a la tarjeta
 * del AJD y al total cuando hay AJD. Es la MISMA frase en las dos, y los casos anteriores miden
 * otra cosa en esas descripciones (la bonificación, el tipo de la renuncia, la dirección del
 * aviso), así que el lector de descripciones la aparta; su presencia —y su ausencia sin AJD— la
 * mide el caso «Hallazgo 2209» de este mismo fichero, sobre el texto en crudo.
 */
const AVISO_BASE_AJD =
  'El AJD va calculado sobre el precio escrito, pero su base no puede ser inferior al valor de referencia catastral (art. 30.1 TRLITPAJD): si ese valor es mayor, el AJD se liquida sobre él';
const sinAvisoBaseAjd = (s: string): string =>
  s.endsWith(AVISO_BASE_AJD) ? s.slice(0, -AVISO_BASE_AJD.length).replace(/\.\s*$/, '') : s;

/**
 * El marcador del panel cuando no hay cifra que publicar. Desde el 26/09/2026 (hallazgo 2207,
 * patrón 5 de la familia) distingue tres estados: el campo VACÍO («Introduce el precio…»), el
 * ILEGIBLE («No se ha podido leer…», que conserva esa misma frase detrás) y el LEGIBLE PERO
 * IMPOSIBLE —0, negativo o un importe que se pinta 0,00 €—, que ya no pide introducir un precio
 * que está escrito: dice que tiene que ser mayor que 0. Los casos antiguos que solo miran que no
 * haya desglose aceptan cualquiera de los tres; los que miden el mensaje lo dicen aparte.
 */
const MARCADOR_SIN_CIFRA =
  /Introduce el precio de la nave industrial para ver el desglose de gastos|tiene que ser mayor que 0: corrígelo para ver el desglose de gastos de la nave industrial/;
const PRECIO_NO_VALE = 'tiene que ser mayor que 0: corrígelo para ver el desglose de gastos de la nave industrial';
/**
 * Desde el 26/09/2026 (tarde) el cierre es PARCIAL en Canarias, Ceuta y Melilla aunque la
 * operación pague ITP: a la notaría y el registro les falta su IGIC o IPSI (criterio del
 * estimador, el garaje y el trastero). El total lo dice con esta línea.
 */
const sinHonorarios = (imp: 'IGIC' | 'IPSI') =>
  ` — SIN el ${imp} de las facturas de notaría y registro, que tampoco se calcula`;
const SOLO_HONORARIOS = (imp: 'IGIC' | 'IPSI') =>
  `Precio + los gastos calculados, sin el ${imp} de las facturas de notaría y registro (ver la nota de abajo)`;

/** Valor de una ResultCard, con el espacio duro del formato español normalizado. */
async function valorTarjeta(page: Page, titulo: string): Promise<string> {
  const valor = page
    .locator('h3', { hasText: titulo })
    .first()
    .locator('xpath=../following-sibling::div[1]/p');
  return pegarPct((await valor.innerText()).replace(/\s+/g, ' ').trim());
}

/** Texto descriptivo bajo el valor de una ResultCard. */
async function descripcionTarjeta(page: Page, titulo: string): Promise<string> {
  const desc = page
    .locator('h3', { hasText: titulo })
    .first()
    .locator('xpath=../following-sibling::p[1]');
  return sinAvisoBaseAjd(pegarPct((await desc.innerText()).replace(/\s+/g, ' ').trim()));
}

/** Rótulo completo de una ResultCard (el <h3>), que es donde va el tipo entre paréntesis. */
async function rotuloTarjeta(page: Page, patron: RegExp): Promise<string> {
  return pegarPct((await page.locator('h3', { hasText: patron }).first().innerText()).replace(/\s+/g, ' ').trim());
}

const PRECIO = 'Precio de compra de la nave industrial';
const GESTORIA = 'Gastos de gestoría (€)';

async function rellenar(page: Page, etiqueta: string, valor: string): Promise<void> {
  const campo = page.locator('input[aria-label="' + etiqueta + '"]');
  await campo.fill(valor);
  await campo.blur();
}

async function leerFuente(): Promise<string> {
  const { readFile } = await import('node:fs/promises');
  return readFile(FUENTE_PAGE, 'utf8');
}

const FUENTE_METADATA = 'app/simulador-gastos-compraventa-nave-industrial/metadata.ts';

async function leerMetadata(): Promise<string> {
  const { readFile } = await import('node:fs/promises');
  return readFile(FUENTE_METADATA, 'utf8');
}

test.describe('Simulador de gastos de compra de nave industrial — casos base', () => {
  /**
   * CASO 1 (NORMAL) — Madrid, segunda mano, 500.000 €, gestoría 500 €.
   * Operación corriente: una empresa compra una nave usada en la Comunidad de Madrid.
   */
  test('CASO 1 (normal) — Madrid, segunda mano, 500.000 €', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await page.selectOption('#select-ccaa', 'madrid');
    await rellenar(page, PRECIO, '500000');
    await rellenar(page, GESTORIA, '500');

    // ITP = 500.000 × 6 % = 30.000. El 6 % sale de TIPOS_ITP_CCAA_2025 → { ccaa: 'Madrid', tipo: 6 }.
    // Madrid no tiene escala progresiva, así que el tipo efectivo coincide con el nominal.
    expect(await valorTarjeta(page, 'ITP (')).toBe('30.000,00 €');
    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (6,00%)');

    // En segunda mano NO hay AJD de compraventa (solo lo habría sobre la escritura de hipoteca).
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);

    // Notaría — RD 1426/1989, número 2 (ARANCELES_NOTARIO):
    //   tramo 1 (hasta 6.010,12 €)                →                         90,151816
    //   tramo 2 (6.010,12→30.050,61, 0,45 %)      → 24.040,49 × 0,0045 =    108,182205
    //   tramo 3 (30.050,61→60.101,21, 0,15 %)     → 30.050,60 × 0,0015 =     45,075900
    //   tramo 4 (60.101,21→150.253,03, 0,10 %)    → 90.151,82 × 0,0010 =     90,151820
    //   tramo 5 (150.253,03→500.000, 0,05 %)      → 349.746,97 × 0,0005 =   174,873485
    //   escala del nº 2.1                         =                        508,435226
    //   rebaja del 5 % del nº 2.1 (17/10/2026, cabo C0209) × 0,95 =        483,013465
    //   con el 21 % de IVA                        = × 1,21 =               584,446292
    // FACTURA_NOTARIAL: ×1,5 = 876,669438 · ×2 = 1.168,892584 · punto medio = 1.022,781011
    // (sin la rebaja: 1.076,61 · 922,81 · 1.230,41)
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('1022,78 €');
    const notaria = await descripcionTarjeta(page, 'Gastos de notaría');
    expect(notaria).toContain('876,67 €');
    expect(notaria).toContain('1168,89 €');

    // Registro — RD 1427/1989, número 2 (ARANCELES_REGISTRO):
    //   tramo 1                                   →                         24,040484
    //   tramo 2 (0,175 %)                         → 24.040,49 × 0,00175 =   42,0708575
    //   tramo 3 (0,125 %)                         → 30.050,60 × 0,00125 =     37,56325
    //   tramo 4 (0,075 %)                         → 90.151,82 × 0,00075 =    67,613865
    //   tramo 5 (0,030 %)                         → 349.746,97 × 0,0003 =   104,924091
    //   suma (por debajo del tope 2.181,673939)   =                        276,212547
    //   × 0,95 (rebaja del nº 2.1)                =                        262,401920
    //   + presentación 6,010121 + nota simple 3,005061 (sin rebaja) =      271,417102
    //   con el 21 % de IVA                        = × 1,21 =               328,414694
    //   (sin la rebaja, 345,12)
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('328,41 €');

    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('500,00 €');

    // Total gastos = 30.000 + 1.022,78 + 328,41 + 500 = 31.851,19 (líneas ya redondeadas)
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('31.851,19 €');
    // 31.851,19 / 500.000 = 6,370238 % → «6,37%»
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('6,37%');

    // Coste total = 500.000 + 31.851,19 = 531.851,19
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('531.851,19 €');
  });

  /**
   * CASO 2 (LÍMITE) — Comunidad Valenciana, segunda mano, 1.200.000 €.
   * Es el borde donde cambia el TIPO: por encima de 1.000.000 € el 9 % pasa al 11 %.
   *
   * ⚠️ 24/09/2026 (hallazgo 1581) — este caso CONSAGRABA el defecto: esperaba 112.000 €
   * (9 % del primer millón + 11 % del exceso) y lo daba por bueno con un comentario que
   * descartaba justo la cifra correcta. La Ley 13/1997, art. 13.Uno (BOE-A-1998-8202,
   * consolidado a 11/08/2026) no fija una escala sino un UMBRAL: «cuando el valor de los
   * bienes inmuebles transmitidos … sea superior a un millón de euros, el tipo aplicable será
   * el 11 %», sobre TODO el valor. Se reescribe con la cifra de la norma.
   */
  test('CASO 2 (límite) — Valencia, segunda mano, 1.200.000 €: cruza el umbral 9 % → 11 %', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await page.selectOption('#select-ccaa', 'valencia');
    await rellenar(page, PRECIO, '1200000');

    // La app avisa del UMBRAL en el recuadro de la comunidad, y no lo llama escala.
    await expect(page.getByText(/pasa al 11\s% sobre TODO el valor, no solo sobre el exceso/)).toBeVisible();
    await expect(page.getByText(/escala progresiva \(9/)).toHaveCount(0);

    // ITP = 1.200.000 × 11 % = 132.000 (el 11 % grava todo el valor por superar el millón)
    expect(await valorTarjeta(page, 'ITP (')).toBe('132.000,00 €');
    // 132.000 / 1.200.000 = 11,00 % efectivo
    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (11,00%)');

    // Notaría — arancel(1.200.000):
    //   90,151816 + 108,182205 + 45,0759 + 90,15182
    //   + tramo 5 (150.253,03→601.012,10, 0,05 %) → 450.759,07 × 0,0005 =  225,379535
    //   + tramo 6 (601.012,10→1.200.000, 0,03 %)  → 598.987,90 × 0,0003 =  179,696370
    //   escala = 738,637646 · × 0,95 (rebaja del nº 2.1, cabo C0209) = 701,705764 ·
    //   con IVA = 849,063974
    //   ×1,5 = 1.273,595961 · ×2 = 1.698,127948 · punto medio = 1.485,861954
    //   (sin la rebaja, 1.564,06)
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('1485,86 €');

    // Registro — arancel(1.200.000):
    //   24,040484 + 42,0708575 + 37,56325 + 67,613865
    //   + tramo 5 (0,030 %) → 450.759,07 × 0,0003 = 135,227721
    //   + tramo 6 (0,020 %) → 598.987,90 × 0,0002 = 119,797580
    //   suma = 426,313758 (por debajo del tope) × 0,95 = 404,998070 + 9,015182 = 414,013252
    //   con el 21 % de IVA = 500,956034 (sin la rebaja, 526,75)
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('500,96 €');

    // Total gastos (líneas redondeadas) = 132.000 + 1.485,86 + 500,96 + 500 = 134.486,82
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('134.486,82 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('1.334.486,82 €');
  });

  /**
   * CASO 3 (RECHAZO) — importe cero, negativo, vacío y texto basura.
   * No debe salir ningún NaN, ningún «No definido» ni una cifra fantasma: la app se queda
   * en el marcador de posición hasta que el precio es un número positivo.
   */
  test('CASO 3 (rechazo) — 0, negativo, vacío y texto no producen NaN ni cifra fantasma', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await page.selectOption('#select-ccaa', 'madrid');

    const campo = page.locator('input[aria-label="' + PRECIO + '"]');
    const marcador = page.getByText(MARCADOR_SIN_CIFRA);

    for (const entrada of ['0', '-100', '']) {
      await campo.fill(entrada);
      await expect(marcador).toBeVisible();
      await expect(page.locator('h3', { hasText: 'COSTE TOTAL DE ADQUISICIÓN' })).toHaveCount(0);
    }

    // El texto ni siquiera llega al estado: NumberInput filtra con /^-?[\d.,]*$/
    await campo.fill('abc');
    expect(await campo.inputValue()).toBe('');
    await expect(marcador).toBeVisible();

    // «1.2.3» SÍ pasa el filtro del input (solo dígitos y separadores) pero `parseSpanishNumber`
    // lo rechaza con NaN — y ahí se detiene: la app vuelve al marcador, no pinta un total roto.
    await campo.fill('1.2.3');
    await campo.blur();
    await expect(marcador).toBeVisible();
    await expect(page.locator('h3', { hasText: 'COSTE TOTAL DE ADQUISICIÓN' })).toHaveCount(0);

    // En ningún momento aparecen los centinelas de formatNumber/formatCurrency ante NaN.
    const cuerpo = await page.locator('body').innerText();
    expect(cuerpo).not.toContain('NaN');
    expect(cuerpo).not.toContain('No definido');
    expect(cuerpo).not.toContain('∞');
  });

  /**
   * El precio escrito en FORMATO ESPAÑOL (punto de millar + coma decimal) tiene que llegar
   * entero al motor: es el formato con el que se teclea un importe en España y el que
   * `parseSpanishNumber` promete admitir.
   */
  test('El precio en formato español 1.234.567,89 se interpreta como 1.234.567,89 €', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await page.selectOption('#select-ccaa', 'madrid');
    await rellenar(page, PRECIO, '1.234.567,89');

    expect(await valorTarjeta(page, 'Precio de la nave industrial')).toBe('1.234.567,89 €');
    // ITP = 1.234.567,89 × 6 % = 74.074,0734
    expect(await valorTarjeta(page, 'ITP (')).toBe('74.074,07 €');
    // Notaría: escala = 90,151816 + 108,182205 + 45,0759 + 90,15182 + 225,379535
    //   + (1.234.567,89 − 601.012,10) × 0,0003 = 633.555,79 × 0,0003 = 190,066737
    //   = 749,008013 · × 0,95 (rebaja del nº 2.1, cabo C0209) = 711,557612 · × 1,21 =
    //   860,984711 · × 1,75 = 1.506,723244 (sin la rebaja, 1.586,02)
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('1506,72 €');
    // Registro: 24,040484 + 42,0708575 + 37,56325 + 67,613865 + 135,227721
    //   + 633.555,79 × 0,0002 = 126,711158 → 433,227336 × 0,95 = 411,565969 + 9,015182 =
    //   420,581151 × 1,21 = 508,903193 (sin la rebaja, 535,11)
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('508,90 €');
    // Total = 74.074,07 + 1.506,72 + 508,90 + 500 = 76.589,69 (líneas ya redondeadas)
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('76.589,69 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('1.311.157,58 €');
  });

  /**
   * Riesgo 1: el disclaimer crítico tiene que estar y NO puede ser colapsable
   * (_private/DISCLAIMER-POLICY.md, nivel 1 CRÍTICO).
   */
  test('Disclaimer crítico presente y no colapsable', async ({ page }) => {
    await page.goto(RUTA);
    const disclaimer = page.locator('[class*="disclaimer" i]').first();
    await expect(disclaimer).toBeVisible();
    await expect(disclaimer).toContainText('no constituye asesoramiento financiero, fiscal ni jurídico');
    // Sin botón dentro: no hay forma de plegarlo.
    expect(await disclaimer.locator('button').count()).toBe(0);
  });

  /**
   * País Vasco, obra nueva: IVA del 21 % y AJD del 0,5 %.
   *
   * ⚠️ 24/09/2026 (hallazgo 1583) — hasta ese día este test se llamaba «IVA del 21 % y ningún
   * AJD» y CONSAGRABA el defecto: `ITP_CCAA['pais-vasco'].ajd = 0` era la exención foral de la
   * primera transmisión de VIVIENDA, y una nave paga el 0,5 % (NF 1/2011 de Bizkaia, art.
   * 44.1: «al tipo de gravamen del 0,50 por 100»; NF 18/1987 de Gipuzkoa, art. 29.2; la
   * exención del art. 58.35 de Bizkaia excluye «los locales de negocio»).
   */
  test('País Vasco, obra nueva: IVA del 21 % y AJD del 0,5 %', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Obra nueva/ }).click();
    await page.selectOption('#select-ccaa', 'pais-vasco');
    await rellenar(page, PRECIO, '500000');
    // IVA = 500.000 × 21 % (IVA_INMUEBLES_2025.local) = 105.000
    expect(await valorTarjeta(page, 'IVA (')).toBe('105.000,00 €');
    // AJD = 500.000 × 0,5 % = 2.500
    expect(await rotuloTarjeta(page, /^AJD \(/)).toBe('AJD (0,50%)');
    expect(await valorTarjeta(page, 'AJD (')).toBe('2500,00 €');
    // Total = 105.000 + 2.500 + 1.022,78 + 328,41 + 500 = 109.351,19 (notaría y registro del
    // CASO 1, con la rebaja del nº 2.1, cabo C0209; sin ella, 109.421,73)
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('109.351,19 €');
    // La tabla comparativa deriva el rango de lo que NO es vivienda (RANGO_AJD_OTROS), que ya no
    // arranca en el 0 % vasco de la vivienda (vive dentro de EducationalSection, plegada: se
    // comprueba que está, no que se vea).
    expect(RANGO_AJD_OTROS).toEqual({ min: 0.5, max: 1.5 });
    expect(await page.getByText(/Sí \(0,5\s%\s–\s1,5\s%; en Ceuta y Melilla, la mitad/).count()).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// REGRESIÓN de la reparación del 23/08/2026 (hallazgos 156-166).
// Estaban escritos con `test.fail()`, afirmando lo que DEBERÍA ocurrir. El 27/08/2026 se
// reprodujo el caso literal de cada uno: los 11 siguen cerrados, así que se les ha quitado
// la marca y se quedan como red de seguridad. Si alguien vuelve a romperlos, salta aquí.
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Regresión — reparación del 23/08/2026', () => {
  /**
   * HALLAZGO 158 (dato, alto) — la página no declaraba la fuente ni la fecha de los datos
   * normativos. Hoy `<LegalNotice>` se sella con `FISCAL_INMUEBLES_META.verificado` y hay
   * `<DataReference>` con normativa, fuente y URL oficial.
   */
  test('HALLAZGO 158 — DataReference con fuente y fecha, y LegalNotice sellado con data/fiscal', async ({ page }) => {
    await page.goto(RUTA);
    await expect(page.getByText(/ITP\/AJD\/IVA 2026/)).toBeVisible();
    await expect(page.getByText(/17 de junio de 2026/)).toBeVisible();
    // La fecha escrita a mano «20 de diciembre de 2024» no puede volver.
    await expect(page.getByText(/20 de diciembre de 2024/)).toHaveCount(0);
  });

  /**
   * HALLAZGO 156 (cálculo, alto) — Canarias, Ceuta y Melilla están en el desplegable y, en
   * obra nueva, la app les cobraba IVA del 21 %. `TERRITORIOS_SIN_IVA` dice que allí rigen
   * el IGIC y el IPSI. La corrección no inventa ninguna cifra —calcular el IGIC exigiría
   * sellar sus tipos con su propia fuente y hoy no están en data/fiscal—: nombra el impuesto
   * que sí corresponde, no liquida nada y marca el total como PARCIAL.
   */
  test('HALLAZGO 156 — Canarias en obra nueva: IGIC no calculado y total marcado como parcial', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Obra nueva/ }).click();
    await page.selectOption('#select-ccaa', 'canarias');
    await rellenar(page, PRECIO, '500000');

    // 500.000 × 21 % = 105.000 € de IVA inventado: no puede aparecer en ningún sitio.
    await expect(page.getByText('105.000,00 €')).toHaveCount(0);
    expect(await rotuloTarjeta(page, /IGIC/)).toContain('IGIC');
    expect(await valorTarjeta(page, 'IGIC')).toBe('No calculado');
    await expect(page.locator('body')).toContainText('COSTE TOTAL (PARCIAL)');
    // AJD sí se devenga: 500.000 × 0,75 % (ITP_CCAA['canarias'].ajd) = 3.750
    expect(await valorTarjeta(page, 'AJD (')).toBe('3750,00 €');
    // 26/09/2026 (hallazgo 2214): en Canarias, Ceuta y Melilla la notaría y el registro van SIN
    // IVA —su factura lleva IGIC o IPSI, que la app no calcula y nombra junto al total—, así que
    // las dos líneas son las de antes ÷ 1,21 (el arancel × 1,75 y el arancel del registro).
    // Total parcial = 0 + 3.750 + 889,759046 (508,43341 × 1,75) + 285,227246 + 500 → líneas
    // redondeadas 3.750 + 889,76 + 285,23 + 500 = 5.424,99
    // 17/10/2026 (cabo C0209): con la base del BOE y la rebaja del 5 % del nº 2.1, notaría
    // 508,435226 × 0,95 × 1,75 = 845,273563 y registro 276,212547 × 0,95 + 9,015182 = 271,417102
    // → 3.750 + 845,27 + 271,42 + 500 = 5.366,69
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('845,27 €');
    expect(await rotuloTarjeta(page, /^Registro de la Propiedad/)).toBe('Registro de la Propiedad (sin IGIC)');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('271,42 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('5366,69 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('SIN el IGIC');
    expect(await valorTarjeta(page, 'COSTE TOTAL (PARCIAL)')).toBe('505.366,69 €');
  });

  /** Mismo cierre en Ceuta y en Melilla: el impuesto que se nombra es el IPSI. */
  test('HALLAZGO 156 — Ceuta y Melilla en obra nueva: IPSI no calculado', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Obra nueva/ }).click();

    await page.selectOption('#select-ccaa', 'ceuta');
    await rellenar(page, PRECIO, '500000');
    expect(await valorTarjeta(page, 'IPSI')).toBe('No calculado');
    // AJD Ceuta = 500.000 × 0,5 % = 2.500, bonificado al 50 % (art. 57 bis.1) = 1.250
    expect(await valorTarjeta(page, 'AJD (')).toBe('1250,00 €');
    // 26/09/2026 (hallazgo 2214): en Canarias, Ceuta y Melilla la notaría y el registro van SIN
    // IVA —su factura lleva IGIC o IPSI, que la app no calcula y nombra junto al total—, así que
    // las dos líneas son las de antes ÷ 1,21 (el arancel × 1,75 y el arancel del registro).
    // Total parcial = 1.250 + 889,76 + 285,23 + 500 = 2.924,99
    // 17/10/2026 (cabo C0209): con la rebaja del nº 2.1, 1.250 + 845,27 + 271,42 + 500 = 2.866,69
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('2866,69 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL (PARCIAL)')).toBe('502.866,69 €');

    await page.selectOption('#select-ccaa', 'melilla');
    await rellenar(page, PRECIO, '1000000');
    expect(await valorTarjeta(page, 'IPSI')).toBe('No calculado');
    // AJD Melilla = 1.000.000 × 0,5 % = 5.000 → bonificado = 2.500
    expect(await valorTarjeta(page, 'AJD (')).toBe('2500,00 €');
    // Notaría(1.000.000): escala = 558,941276 + (1.000.000 − 601.012,10) × 0,0003 = 678,637646
    //   × 0,95 (rebaja del nº 2.1, cabo C0209) × 1,75 = 1.128,235087 (sin IVA en Melilla:
    //   hallazgo 2214; con IVA era 1.437,01, y sin IVA ni rebaja, 1.187,61)
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('1128,24 €');
    // Registro(1.000.000): 306,516178 + 398.987,90 × 0,0002 = 386,313758 × 0,95 + 9,015182 =
    //   376,013252 (sin la rebaja, 395,33)
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('376,01 €');
    // Total parcial = 2.500 + 1.128,24 + 376,01 + 500 = 4.504,25
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('4504,25 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL (PARCIAL)')).toBe('1.004.504,25 €');
  });

  /**
   * HALLAZGO 157 (cálculo, alto) — la bonificación del 50 % del art. 57 bis del TRLITPAJD
   * se cumple por el SITIO del inmueble, sea cual sea su uso, y no se aplicaba: una nave de
   * 500.000 € en Ceuta liquidaba 30.000 € cuando le correspondían 15.000 €, el doble. Hoy la
   * aplica `calcularITP` a través de `aplicarBonificacionCiudad`, así que ninguna app tiene
   * que acordarse de ella.
   */
  test('HALLAZGO 157 — Ceuta y Melilla: la bonificación del 50 % se aplica y se anuncia', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();

    await page.selectOption('#select-ccaa', 'ceuta');
    await rellenar(page, PRECIO, '500000');
    // 500.000 × 6 % = 30.000 → × (1 − 0,5) = 15.000. Tipo efectivo 3,00 %.
    expect(await valorTarjeta(page, 'ITP (')).toBe('15.000,00 €');
    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (3,00%)');
    expect(await descripcionTarjeta(page, 'ITP (')).toContain('bonificación del 50%');
    // Y se anuncia en el recuadro de la comunidad, no solo en la tarjeta.
    await expect(page.locator('[class*="infoCcaa"]').first()).toContainText('artículo 57 bis');
    // 26/09/2026 (hallazgo 2214): en Ceuta y Melilla la notaría y el registro van SIN IVA —su
    // factura lleva IPSI, que la app no calcula y nombra junto al total—: arancel × 1,75 y arancel.
    // Total = 15.000 + 889,76 (508,43341 × 1,75) + 285,23 (285,2272455) + 500 = 16.674,99
    // 17/10/2026 (cabo C0209): con la rebaja del nº 2.1 (HALLAZGO 156), 15.000 + 845,27 +
    // 271,42 + 500 = 16.616,69
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('16.616,69 €');

    await page.selectOption('#select-ccaa', 'melilla');
    await rellenar(page, PRECIO, '300000');
    // 300.000 × 6 % = 18.000 → bonificado = 9.000 (3,00 %)
    expect(await valorTarjeta(page, 'ITP (')).toBe('9000,00 €');
    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (3,00%)');
    // Notaría(300.000): escala = 333,561741 + (300.000 − 150.253,03) × 0,0005 = 408,435226
    //   × 0,95 (rebaja del nº 2.1, cabo C0209) × 1,75 = 679,023564 (sin IVA en Melilla,
    //   hallazgo 2214; sin la rebaja, 714,76)
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('679,02 €');
    // Registro(300.000): 171,288457 + 149.746,97 × 0,0003 = 216,212547 × 0,95 + 9,015182 =
    //   214,417102 (sin la rebaja, 225,23)
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('214,42 €');
    // Total = 9.000 + 679,02 + 214,42 + 500 = 10.393,44
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('10.393,44 €');
    // Parcial: a los honorarios les falta el IPSI (26/09/2026).
    expect(await valorTarjeta(page, 'COSTE TOTAL (PARCIAL)')).toBe('310.393,44 €');
    expect(await descripcionTarjeta(page, 'COSTE TOTAL')).toBe(SOLO_HONORARIOS('IPSI'));
  });

  /**
   * HALLAZGO 160 (contenido, medio) — el rótulo del impuesto redondeaba el tipo a CERO
   * decimales y contradecía al recuadro de la comunidad: Canarias salía como «ITP (7%)»
   * sobre 32.500 €, que son el 6,5 %. Hoy rotula el tipo EFECTIVO con dos decimales.
   */
  test('HALLAZGO 160 — el rótulo del tipo es el efectivo y con dos decimales', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await page.selectOption('#select-ccaa', 'canarias');
    await rellenar(page, PRECIO, '500000');
    // Canarias: TIPOS_ITP_CCAA_2025 → 6,5 %. 500.000 × 6,5 % = 32.500 €.
    expect(await valorTarjeta(page, 'ITP (')).toBe('32.500,00 €');
    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (6,50%)');

    // Murcia: 7,75 % (Ley 3/2025). 300.000 × 7,75 % = 23.250 €.
    await page.selectOption('#select-ccaa', 'murcia');
    await rellenar(page, PRECIO, '300000');
    expect(await valorTarjeta(page, 'ITP (')).toBe('23.250,00 €');
    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (7,75%)');
    // Total = 23.250 + 821,62 + 259,44 + 500 = 24.831,06 (300.000 €: notaría 408,435226 × 0,95 ×
    // 1,21 × 1,75 y registro (216,212547 × 0,95 + 9,015182) × 1,21, con la rebaja del nº 2.1,
    // cabo C0209; sin ella, 24.887,38)
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('24.831,06 €');
  });

  /**
   * HALLAZGO 161 (contenido, medio) — el recuadro de la comunidad imprimía los tipos crudos
   * con PUNTO decimal («6.5%», «0.75%»), formato anglosajón, mientras la tarjeta de resultados
   * usaba coma: la misma cifra salía dos veces en la misma pantalla con dos formatos.
   */
  test('HALLAZGO 161 — el recuadro de la comunidad usa coma decimal, no punto', async ({ page }) => {
    await page.goto(RUTA);
    const recuadro = page.locator('[class*="infoCcaa"]').first();

    await page.selectOption('#select-ccaa', 'canarias');
    await expect(recuadro).toContainText('6,5\u00A0%');
    await expect(recuadro).not.toContainText('6.5%');
    await expect(recuadro).toContainText('0,75\u00A0%');
    await expect(recuadro).not.toContainText('0.75%');

    await page.selectOption('#select-ccaa', 'murcia');
    await expect(recuadro).toContainText('7,75\u00A0%');
    await expect(recuadro).not.toContainText('7.75%');

    await page.selectOption('#select-ccaa', 'valencia');
    await expect(recuadro).not.toContainText('1.5%');
  });

  /**
   * HALLAZGO 159 (contenido, medio) — el FAQPage de `metadata.ts`, que es lo que consumen
   * Bing Copilot, ChatGPT y Perplexity, contradecía al motor en tres cifras. Hoy las deriva
   * de RANGO_AJD, RANGO_ITP y del propio arancel.
   */
  test('HALLAZGO 159 — el FAQPage JSON-LD deriva sus cifras del motor', async ({ page }) => {
    await page.goto(RUTA);
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = bloques.find((b) => b.includes('FAQPage')) ?? '';
    expect(faq).not.toContain('entre el 0,5% y el 1,5%');
    expect(faq).not.toContain('entre el 6% y el 10%');
    expect(faq).not.toContain('entre 400 € y 800 €');
    // RANGO_AJD_OTROS = 0,5 – 1,5 y RANGO_ITP_OTROS = 6 – 13 (tramo alto de Baleares/Cataluña).
    // ⚠️ 24/09/2026 (hallazgos 1582 y 1583): hasta ese día el rango era uno solo y sus mínimos
    // eran los de la VIVIENDA vasca (AJD 0 %, ITP 4 %), que una nave no paga; esta aserción los
    // consagraba («del 0% al 1,5%»). Ahora cada app usa el rango de lo que calcula.
    expect(faq).toContain('del 0,5\u00A0% al 1,5\u00A0%');
    expect(faq).not.toContain('del 0% al 1,5%');
    expect(faq).toContain(`del ${String(RANGO_ITP_OTROS.min)}\u00A0% al ${String(RANGO_ITP_OTROS.max)}\u00A0%`);
    // Registro de 200.000 € según el propio arancel: 224,96 € con la rebaja del nº 2.1 (cabo
    // C0209: (186,212547 × 0,95 + 9,015182) × 1,21; antes, 236,22 €)
    expect(faq).toContain('225 €');
  });

  /**
   * HALLAZGO 162 (contenido, medio) — la FAQ visible afirmaba un rango de ITP escrito a mano
   * («4% … 10-11%») que la propia app desmentía. Hoy lo deriva de RANGO_ITP.
   */
  test('HALLAZGO 162 — el rango de ITP del bloque educativo se deriva del motor', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await page.selectOption('#select-ccaa', 'baleares');
    await rellenar(page, PRECIO, '2500000');
    // 400.000×8 % + 200.000×9 % + 400.000×10 % + 1.000.000×12 % + 500.000×13 %
    //   = 32.000 + 18.000 + 40.000 + 120.000 + 65.000 = 275.000 → 11 % efectivo
    expect(await valorTarjeta(page, 'ITP (')).toBe('275.000,00 €');
    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (11,00%)');
    // Notaría(2.500.000): arancel = 558,93946 + 5.409.108,94 × 0,0003 … no: el tramo 6 llega
    //   hasta 6.010.121,04, así que se aplica (2.500.000 − 601.012,10) × 0,0003 = 569,696370
    //   → escala 1.128,637646 (base del BOE) × 0,95 (rebaja del nº 2.1, cabo C0209) × 1,21 =
    //   1.297,368974 · × 1,75 = 2.270,395704 (sin la rebaja, 2.389,89)
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('2270,40 €');
    // Registro(2.500.000): 306,516178 + 1.898.987,90 × 0,0002 = 686,313758 (< tope 2.181,673939)
    //   × 0,95 + 9,015182 = 661,013252 × 1,21 = 799,826034 (sin la rebaja, 841,35)
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('799,83 €');
    // Total = 275.000 + 2.270,40 + 799,83 + 500 = 278.570,23
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('278.570,23 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('2.778.570,23 €');

    // …y el texto ya no sostiene un techo que la app supera.
    await expect(page.getByText(/oscila entre el 4% \(País Vasco\) y el 10-11%/)).toHaveCount(0);
    const fuente = await leerFuente();
    // Desde el 24/09/2026 el rango es el de lo que NO es vivienda (hallazgo 1582).
    expect(fuente).toContain('RANGO_ITP_OTROS.min');
    expect(fuente).toContain('RANGO_ITP_OTROS.max');
  });

  /**
   * HALLAZGO 163 (dato, medio) — el tipo de IVA estaba hardcodeado (`const IVA_NAVE_INDUSTRIAL = 21`)
   * pudiendo venir de `IVA_INMUEBLES_2025.local`. Hoy se importa, así que no puede divergir.
   */
  test('HALLAZGO 163 — el IVA de la nave se importa de data/fiscal, no se escribe a mano', async ({ page }) => {
    const fuente = await leerFuente();
    expect(fuente).toContain('IVA_INMUEBLES_2025.local');
    expect(fuente).not.toMatch(/const IVA_NAVE_INDUSTRIAL\s*=\s*21/);

    await page.goto(RUTA);
    await page.getByRole('button', { name: /Obra nueva/ }).click();
    await page.selectOption('#select-ccaa', 'madrid');
    await rellenar(page, PRECIO, '500000');
    // 500.000 × IVA_INMUEBLES_2025.local (21) = 105.000
    const esperado = (500000 * IVA_INMUEBLES_2025.local) / 100;
    expect(await valorTarjeta(page, 'IVA (')).toBe(
      esperado.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
    );
    expect(await rotuloTarjeta(page, /^IVA \(/)).toBe(`IVA (${String(IVA_INMUEBLES_2025.local)},00%)`);
  });

  /**
   * HALLAZGO 164 (contenido, medio) — la segunda transmisión de una nave está exenta de IVA,
   * pero entre empresarios con derecho a deducción lo habitual es renunciar a la exención
   * (art. 20.Dos LIVA): vuelve a haber IVA —autoliquidado por el comprador, inversión del
   * sujeto pasivo— y NO se paga ITP. Para el público que la app declara (empresas y autónomos)
   * ese es el caso frecuente, y la app lo negaba: forzaba ITP en toda segunda mano.
   *
   * Madrid, 500.000 €, con renuncia:
   *   IVA 21 % = 105.000 · AJD 0,75 % = 3.750 · ITP = 0
   *   notaría (medio) 1.076,61 · registro 345,12 · gestoría 500
   *   → total gastos = 110.671,73 · coste total = 610.671,73
   *   (17/10/2026, cabo C0209: con la rebaja del nº 2.1, notaría 1.022,78 y registro 328,41 del
   *   CASO 1 → total 110.601,19 · coste 610.601,19)
   */
  test('HALLAZGO 164 — la renuncia a la exención de IVA se puede elegir y liquida IVA + AJD, no ITP', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /renuncia al IVA/ }).click();
    await page.selectOption('#select-ccaa', 'madrid');
    await rellenar(page, PRECIO, '500000');

    expect(await valorTarjeta(page, 'IVA (renuncia')).toBe('105.000,00 €');
    // «3750,00 €» sin punto: es-ES no agrupa los millares de un número de cuatro cifras
    expect(await valorTarjeta(page, 'AJD (')).toBe('3750,00 €');
    // Ninguna TARJETA de resultado liquida ITP (el texto «ITP» sí sale en el recuadro de la
    // comunidad y en el bloque educativo, que hablan del impuesto, no de esta operación)
    await expect(page.locator('h3', { hasText: 'ITP (' })).toHaveCount(0);
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('110.601,19 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('610.601,19 €');
    // Y se dice quién autoliquida ese IVA, que es lo que cambia respecto de la obra nueva
    await expect(page.locator('body')).toContainText('inversión del sujeto pasivo');
    // Se avisa además de que el AJD incrementado por renuncia NO se está aplicando
    await expect(page.locator('[class*="avisoRenuncia"]').first()).toContainText('tipo incrementado');
  });

  /**
   * HALLAZGO 165 (operativa, bajo) — mientras el campo de gestoría tenía el foco, un importe
   * negativo se sumaba tal cual al total y la tarjeta de gestoría ni se pintaba, así que el
   * total no cuadraba con sus líneas visibles. Hoy se acota con `Math.max(0, …)` en el motor.
   */
  test('HALLAZGO 165 — una gestoría negativa sin blur no descuadra el total', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await page.selectOption('#select-ccaa', 'madrid');
    await rellenar(page, PRECIO, '500000');
    const gestoria = page.locator('input[aria-label="' + GESTORIA + '"]');
    await gestoria.click();
    await gestoria.press('Control+a');
    await gestoria.pressSequentially('-1000');   // sin salir del campo
    // 30.000 + 1.022,78 + 328,41 = 31.351,19, y son las tres líneas visibles (CASO 1, con la
    // rebaja del nº 2.1, cabo C0209; sin ella, 31.421,73)
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('31.351,19 €');
    await expect(page.locator('h3', { hasText: 'Gastos de gestoría' })).toHaveCount(0);
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('531.351,19 €');
  });

  /**
   * HALLAZGO 166 (accesibilidad, bajo) — el `<label>Tipo de transmisión</label>` no gobernaba
   * ningún control y los botones no formaban grupo accesible. Hoy es `role="group"` +
   * `aria-labelledby`, con los tres botones dentro.
   */
  test('HALLAZGO 166 — los botones de transmisión forman un grupo accesible', async ({ page }) => {
    await page.goto(RUTA);
    const grupo = page.getByRole('group', { name: /Tipo de transmisión/ });
    await expect(grupo).toBeVisible();
    expect(await grupo.getByRole('button').count()).toBe(3);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// CASOS NUEVOS de la re-inspección del 27/08/2026 (lo que la vuelta anterior no miró).
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Casos nuevos — re-inspección 27/08/2026', () => {
  /**
   * Cataluña, 2.000.000 €: cruza TRES cortes de la escala (600.000, 900.000 y 1.500.000) y
   * llega al tramo marginal del 13 %, que es el techo de RANGO_ITP.
   */
  test('Cataluña, segunda mano, 2.000.000 €: la escala llega al tramo del 13 %', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await page.selectOption('#select-ccaa', 'cataluna');
    await rellenar(page, PRECIO, '2000000');

    // 600.000×10 % + 300.000×11 % + 600.000×12 % + 500.000×13 %
    //   = 60.000 + 33.000 + 72.000 + 65.000 = 230.000 → 11,50 % efectivo
    expect(await valorTarjeta(page, 'ITP (')).toBe('230.000,00 €');
    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (11,50%)');
    // Notaría(2.000.000): escala = 558,941276 + 1.398.987,90 × 0,0003 = 978,637646
    //   × 0,95 (rebaja del nº 2.1, cabo C0209) × 1,21 = 1.124,943974 · × 1,75 = 1.968,651954
    //   (sin la rebaja, 2.072,26)
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('1968,65 €');
    // Registro(2.000.000): 306,516178 + 1.398.987,90 × 0,0002 = 586,313758 × 0,95 + 9,015182 =
    //   566,013252 × 1,21 = 684,876035 (sin la rebaja, 720,35)
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('684,88 €');
    // Total = 230.000 + 1.968,65 + 684,88 + 500 = 233.153,53
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('233.153,53 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('2.233.153,53 €');
    // El tramo marginal declarado en ITP_CCAA['cataluna'] es el 13 %, el techo de RANGO_ITP
    const ultimo = ITP_CCAA['cataluna'].tramosProgresivos!.at(-1)!.tipo;
    expect(ultimo).toBe(RANGO_ITP_OTROS.max);
  });

  /**
   * Tramo más alto de los aranceles: 20.000.000 €. El registro toca su tope
   * (`REGISTRO_MAXIMO = 2181,67`) y la notaría llega al límite del arancel.
   *
   * ⚠️ 24/09/2026 (hallazgo 1599) — este caso CONSAGRABA un séptimo tramo del 0,02 % que el
   * RD 1426/1989 no tiene: su número 2 dice «Por lo que excede de 6.010.121,04 euros el
   * Notario percibirá la cantidad que libremente acuerde con las partes otorgantes»
   * (BOE-A-1989-28111). Esperaba 10.544,40 € de notaría, 5.924,71 € de ellos inventados. Ahora
   * la cifra es el arancel hasta el límite, la tarjeta avisa de la parte libre y el cierre se
   * rotula «(PARCIAL)» con «puede ser mayor» (lo pactado puede ser cualquier cantidad).
   */
  test('Madrid, segunda mano, 20.000.000 €: el arancel registral toca su tope', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await page.selectOption('#select-ccaa', 'madrid');
    await rellenar(page, PRECIO, '20000000');

    // ITP = 20.000.000 × 6 % = 1.200.000
    expect(await valorTarjeta(page, 'ITP (')).toBe('1.200.000,00 €');
    // Notaría, solo hasta LIMITE_ARANCEL_NOTARIAL (6.010.121,04 €):
    //   558,941276 + (6.010.121,04 − 601.012,10) × 0,0003 = 1.622,732682 → 2.181,673958
    //   × 0,95 (rebaja del nº 2.1, cabo C0209) = 2.072,590260 × 1,21 = 2.507,834215 · × 1,5 =
    //   3.761,751322 · × 2 = 5.015,668430 · × 1,75 = 4.388,709876 (sin la rebaja, 4.619,69)
    expect(LIMITE_ARANCEL_NOTARIAL).toBe(6010121.04);
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('4388,71 €');
    const notaria = await descripcionTarjeta(page, 'Gastos de notaría');
    expect(notaria).toContain('entre 3761,75 € y 5015,67 €');
    expect(notaria).toContain('libre acuerdo');
    // Registro: la suma de tramos supera 2.181,673939 y se corta ahí (REGISTRO_MAXIMO), y la
    //   rebaja se aplica DESPUÉS del tope: 2.181,673939 × 0,95 = 2.072,590242 + 6,010121 +
    //   3,005061 = 2.081,605424 × 1,21 = 2.518,742563 (sin la rebaja, 2.650,73)
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('2518,74 €');
    // Total = 1.200.000 + 4.388,71 + 2.518,74 + 500 = 1.207.407,45
    expect(await rotuloTarjeta(page, /^Total gastos adicionales/)).toBe('Total gastos adicionales (parcial)');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('1.207.407,45 €');
    expect(await rotuloTarjeta(page, /^COSTE TOTAL/)).toBe('COSTE TOTAL (PARCIAL)');
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('21.207.407,45 €');
    expect(await descripcionTarjeta(page, 'COSTE TOTAL')).toBe(
      'No incluye la parte de la notaría de libre acuerdo: el coste real puede ser mayor',
    );
  });

  /**
   * La renuncia a la exención cambia el impuesto y el rótulo, pero NO el resto del desglose:
   * en Madrid, elegir «2ª mano con renuncia» frente a «Segunda mano» sustituye 30.000 € de ITP
   * por 105.000 € de IVA + 3.750 € de AJD, y deja notaría, registro y gestoría intactos.
   */
  test('La renuncia sustituye ITP por IVA + AJD y no toca el resto del desglose', async ({ page }) => {
    await page.goto(RUTA);
    await page.selectOption('#select-ccaa', 'madrid');
    await rellenar(page, PRECIO, '500000');

    await page.getByRole('button', { name: /Segunda mano/ }).click();
    const notariaSinRenuncia = await valorTarjeta(page, 'Gastos de notaría');
    const registroSinRenuncia = await valorTarjeta(page, 'Registro de la Propiedad');
    expect(await valorTarjeta(page, 'ITP (')).toBe('30.000,00 €');

    await page.getByRole('button', { name: /renuncia al IVA/ }).click();
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe(notariaSinRenuncia);
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe(registroSinRenuncia);
    // 110.601,19 − 31.851,19 = 78.750 = 105.000 (IVA) + 3.750 (AJD) − 30.000 (ITP) (cifras del
    // CASO 1, con la rebaja del nº 2.1, cabo C0209; sin ella, 110.671,73)
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('110.601,19 €');
  });

  /**
   * `aria-pressed` de los tres botones de transmisión: exactamente uno activo en cada momento
   * (CLAUDE.md global §5 — botón que cambia un estado visual lleva `aria-pressed`).
   */
  test('Exactamente un botón de transmisión con aria-pressed="true"', async ({ page }) => {
    await page.goto(RUTA);
    const grupo = page.getByRole('group', { name: /Tipo de transmisión/ });
    for (const patron of [/Segunda mano/, /Obra nueva/, /renuncia al IVA/]) {
      await grupo.getByRole('button', { name: patron }).click();
      expect(await grupo.locator('button[aria-pressed="true"]').count()).toBe(1);
      await expect(grupo.getByRole('button', { name: patron })).toHaveAttribute('aria-pressed', 'true');
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// REGRESIÓN — los cinco hallazgos de la re-inspección del 27/08/2026, reparados ese mismo
// día. Estaban escritos con `test.fail()`; ahora sujetan la reparación.
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Regresión — hallazgos del 27/08/2026, reparados', () => {
  /**
   * HALLAZGO A (contenido, medio) — reparación ASIMÉTRICA de la bonificación de Ceuta y Melilla.
   *
   * `calcularAJD` aplica el 50 % del art. 57 bis.1, así que el IMPORTE es correcto, pero el
   * rótulo de la tarjeta usa el tipo NOMINAL de la tabla (`datosCcaaActual.ajd`) en vez del
   * efectivo. La tarjeta de ITP, que sí se corrigió con el hallazgo 160, muestra el efectivo:
   * en la misma pantalla conviven «ITP (3,00%) 15.000,00 €» —coherente— y «AJD (0,50%)
   * 1.250,00 €», donde 0,50 % de 500.000 € son 2.500 €, el doble de lo que la propia tarjeta
   * enseña. Es el defecto que el Inspector ya vio en `simulador-gastos-compraventa-garaje`.
   */
  test('REPARADO A — el rótulo del AJD en Ceuta muestra el tipo nominal con el importe bonificado', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Obra nueva/ }).click();
    await page.selectOption('#select-ccaa', 'ceuta');
    await rellenar(page, PRECIO, '500000');

    // El importe es correcto: 500.000 × 0,5 % = 2.500 → bonificado al 50 % = 1.250
    expect(await valorTarjeta(page, 'AJD (')).toBe('1250,00 €');
    // …y el rótulo debería decir el tipo que corresponde a ESE importe: 1.250 / 500.000 = 0,25 %
    expect(await rotuloTarjeta(page, /^AJD \(/)).toBe('AJD (0,25%)');
    // Hoy dice «AJD (0,50%)», el nominal de ITP_CCAA['ceuta'].ajd.
  });

  /**
   * HALLAZGO B (contenido, medio) — el bloque educativo documenta el comportamiento ANTERIOR
   * a la reparación del hallazgo 164.
   *
   * El recuadro «Limitaciones de este simulador» sigue diciendo que la calculadora «no
   * contempla situaciones especiales (renuncia a la exención de IVA en segunda mano…)»,
   * cuando la app tiene desde el 23/08/2026 un botón «2ª mano con renuncia al IVA» que la
   * calcula — y su propia FAQ, dos bloques más arriba, dice lo contrario: «El simulador lo
   * contempla en su tercera opción». Dos afirmaciones opuestas en la misma página.
   */
  test('REPARADO B — el recuadro de limitaciones niega la renuncia que la app sí calcula', async ({ page }) => {
    await page.goto(RUTA);

    // La app SÍ la calcula: Madrid, 500.000 € con renuncia → IVA 105.000 + AJD 3.750
    await page.getByRole('button', { name: /renuncia al IVA/ }).click();
    await page.selectOption('#select-ccaa', 'madrid');
    await rellenar(page, PRECIO, '500000');
    expect(await valorTarjeta(page, 'IVA (renuncia')).toBe('105.000,00 €');

    // …así que el recuadro de limitaciones no puede seguir diciendo que no la contempla.
    const limitaciones = (await page.locator('[class*="warningBox"]').first().innerText()).replace(/\s+/g, ' ');
    expect(limitaciones).not.toMatch(/no contempla situaciones especiales[^.]*renuncia a la exención de IVA/);
  });

  /**
   * HALLAZGO C (dato, medio) — la quinta pregunta del FAQPage JSON-LD se quedó escrita a mano
   * cuando las otras cuatro pasaron a derivarse del motor (hallazgo 159), y hoy lo contradice:
   *   · «Cataluña y Comunidad Valenciana … llegando al 10%-11%» — pero
   *     `ITP_CCAA['cataluna'].tramosProgresivos` llega al 13 % y la app cobra 230.000 €
   *     (11,50 % efectivo) por una nave de 2.000.000 € en Cataluña.
   *   · Valencia tiene el tipo general en el 9 % desde el 01/06/2026
   *     (`TIPOS_ITP_CCAA_2025`), no en el 10-11 %.
   * Es el bloque que consumen Bing Copilot, ChatGPT y Perplexity: la cifra que se les sirve
   * no es la que la app calcula.
   */
  test('REPARADO C — la quinta pregunta del FAQPage sigue escrita a mano y contradice al motor', async ({ page }) => {
    await page.goto(RUTA);
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = bloques.find((b) => b.includes('FAQPage')) ?? '';
    expect(faq).toContain('¿Qué comunidad autónoma tiene el ITP más bajo para la compra de una nave?');
    // El techo real de la escala catalana es el 13 %, no el 10-11 %.
    expect(faq).not.toContain('llegando al 10%-11%');
    // Y el tipo general valenciano es el 9 % de TIPOS_ITP_CCAA_2025.
    expect(String(ITP_CCAA['valencia'].tipoGeneral)).toBe('9');
  });

  /**
   * HALLAZGO D (dato, bajo) — datos normativos escritos a mano en el bloque educativo
   * pudiendo venir de `data/fiscal`, que es la divergencia-en-silencio que ya costó el
   * hallazgo 163 en este mismo fichero:
   *   · la tabla comparativa rotula «IVA obra nueva · 21 % · 10 %» con literales, cuando
   *     `IVA_INMUEBLES_2025.local` (21) ya se importa aquí e `IVA_INMUEBLES_2025.obraNueva`
   *     vale 10 — y la fila de al lado, «AJD obra nueva», sí se deriva de RANGO_AJD;
   *   · la tarjeta «Vender nave con ganancia patrimonial» dice «(19-30%)» cuando esos dos
   *     extremos son el primer y el último tramo de `TRAMOS_GANANCIAS_PATRIMONIALES_2025`.
   */
  test('REPARADO D — la tabla comparativa y el IRPF del ahorro llevan los tipos escritos a mano', async () => {
    const fuente = await leerFuente();
    // Los valores de data/fiscal que hoy coinciden con los literales (por eso no hay error de
    // importe: hay riesgo de divergencia el día que cambien).
    expect(IVA_INMUEBLES_2025.local).toBe(21);
    expect(IVA_INMUEBLES_2025.obraNueva).toBe(10);
    expect(TRAMOS_GANANCIAS_PATRIMONIALES_2025[0].tipo).toBe(19);
    expect(TRAMOS_GANANCIAS_PATRIMONIALES_2025.at(-1)!.tipo).toBe(30);
    // Ninguno de ellos debería estar escrito a mano en la página.
    expect(fuente).not.toMatch(/>21%<\/td>/);
    expect(fuente).not.toMatch(/>10%<\/td>/);
    expect(fuente).not.toContain('(19-30%)');
  });

  /**
   * HALLAZGO E (contenido, bajo) — en Canarias, Ceuta y Melilla la tarjeta del impuesto nombra
   * siempre «la obra nueva», aunque el usuario haya elegido «2ª mano con renuncia al IVA».
   * El texto es fijo (`impuestoNoCalculado`) y no mira qué transmisión se ha seleccionado, así
   * que describe una operación distinta de la que el usuario está simulando.
   */
  test('REPARADO E — en Canarias, la tarjeta habla de «obra nueva» aunque se elija la renuncia', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /renuncia al IVA/ }).click();
    await page.selectOption('#select-ccaa', 'canarias');
    await rellenar(page, PRECIO, '500000');

    expect(await valorTarjeta(page, 'IGIC')).toBe('No calculado');
    // Antes de repararlo: «En Canarias no rige el IVA: la obra nueva tributa por el IGIC, que este simulador
    // no calcula», con «2ª mano con renuncia al IVA» seleccionado.
    expect(await descripcionTarjeta(page, 'IGIC')).not.toContain('la obra nueva');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN DE CIERRE — 28/08/2026
//
// MITAD A (cierre): se reproduce con su caso literal la reparación del commit d787b81b
//   —el IVA que no existe en Canarias y el rótulo EFECTIVO del AJD, que es la reparación
//   de referencia de la que carecían sus hermanas— y, sobre todo, se comprueba que NO se
//   pasó de largo: en SEGUNDA mano el ITP se sigue cobrando en Canarias.
// MITAD B (casos nuevos): tres casos frescos, resueltos a mano ANTES de ejecutar la app,
//   con el desarrollo entero junto a cada aserción. Ninguna cifra sale de memoria: los
//   tipos vienen de `TIPOS_ITP_CCAA_2025`/`ITP_CCAA` y los aranceles de `ARANCELES_NOTARIO`
//   y `ARANCELES_REGISTRO` (RD 1426/1989 y RD 1427/1989).
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Cierre y casos nuevos — 28/08/2026', () => {
  /**
   * MITAD A — la reparación del IVA de Canarias no se llevó por delante el ITP.
   *
   * Lo que se apagó en `c47189ca`/`d787b81b` es el IVA de una PRIMERA entrega en un
   * territorio donde ese impuesto no existe. El ITP no tiene nada que ver: es un tributo
   * cedido que Canarias sí exige, con su tipo general del 6,5 % (`TIPOS_ITP_CCAA_2025`),
   * así que una nave usada en Las Palmas tiene que seguir liquidándolo.
   *
   * Canarias · segunda mano · 500.000 € · gestoría 500 € (a mano):
   *   ITP  = 500.000 × 6,5 %                                    = 32.500,00
   *   AJD  = 0 (no hay cuota gradual en la compraventa sin IVA)
   *   Notaría: arancel = 90,15 + 108,182205 + 45,0759 + 90,15182
   *            + (500.000 − 150.253,03) × 0,0005 = 174,873485    = 508,43341
   *            × 1,21 = 615,2044261 · × 1,75 (punto medio)       =  1.076,6077
   *   Registro: 24,04 + 42,0708575 + 37,56325 + 67,613865
   *            + (500.000 − 150.253,03) × 0,0003 = 104,924091    = 276,2120635
   *            + 6,010121 + 3,005061 = 285,2272455 · × 1,21      =    345,1250
   *   Total gastos = 32.500 + 1.076,6077 + 345,1250 + 500        = 34.421,7327
   *   Total operación                                            = 534.421,7327
   * Y ni el total ni su rótulo pueden marcarse como PARCIAL: aquí no falta ningún impuesto.
   */
  test('A (cierre) — Canarias en SEGUNDA mano sigue cobrando ITP: la reparación del IVA no se pasó de largo', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await page.selectOption('#select-ccaa', 'canarias');
    await rellenar(page, PRECIO, '500000');
    await rellenar(page, GESTORIA, '500');

    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (6,50%)');
    expect(await valorTarjeta(page, 'ITP (')).toBe('32.500,00 €');
    // 26/09/2026 (hallazgo 2214): en Canarias, Ceuta y Melilla la notaría y el registro van SIN
    // IVA —su factura lleva IGIC o IPSI, que la app no calcula y nombra junto al total—, así que
    // las dos líneas son las de antes ÷ 1,21 (el arancel × 1,75 y el arancel del registro).
    //   notaría 508,43341 × 1,75 = 889,758468 · registro 285,2272455
    //   total 32.500 + 889,76 + 285,23 + 500 = 34.174,99 · coste 534.174,99
    // 17/10/2026 (cabo C0209): con la base del BOE y la rebaja del 5 % del nº 2.1, notaría
    //   508,435226 × 0,95 × 1,75 = 845,273563 · registro 276,212547 × 0,95 + 9,015182 = 271,417102
    //   → total 32.500 + 845,27 + 271,42 + 500 = 34.116,69 (6,82 %) · coste 534.116,69
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('845,27 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('271,42 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('34.116,69 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL (PARCIAL)')).toBe('534.116,69 €');
    // Y lo que falta se dice junto al total, fuera de su tarjeta (hallazgo 2214).
    await expect(page.locator('[class*="avisoHonorarios"]')).toContainText(
      'Las facturas de notaría y registro llevan además IGIC, que esta herramienta no calcula',
    );
    // ⚠️ 26/09/2026 (tarde): hasta ese día aquí se exigía «nada de parcial», porque el IGIC de
    // la operación solo entra con IVA que sustituir. Pero a la notaría y el registro les falta
    // SU IGIC (hallazgo 2214), así que el cierre es parcial por eso, y lo dice sin «coste real»:
    // el impuesto de la operación (ITP) sí está.
    expect(await rotuloTarjeta(page, /^Total gastos adicionales/)).toBe('Total gastos adicionales (parcial)');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toBe(`6,82% sobre el precio de compra${sinHonorarios('IGIC')}`);
    expect(await descripcionTarjeta(page, 'COSTE TOTAL')).toBe(SOLO_HONORARIOS('IGIC'));
    // Ninguna tarjeta del desglose se queda «No calculado» (el recuadro de la comunidad sí
    // rotula «IGIC (obra nueva) · No calculado», y eso es correcto: describe la obra nueva).
    await expect(page.locator('[class*="resultados"]').getByText('No calculado')).toHaveCount(0);
    // El tipo del recuadro de la comunidad sale de la tabla, con su decimal y coma española.
    expect(ITP_CCAA['canarias'].tipoGeneral).toBe(6.5);
  });

  /**
   * MITAD A — el rótulo EFECTIVO del AJD, ahora en Melilla y con otro importe.
   *
   * `REPARADO A` lo fija en Ceuta con 500.000 €; esto comprueba que la reparación es de la
   * fórmula y no del caso: el art. 57 bis.1 del TRLITPAJD bonifica al 50 % la cuota gradual
   * cuando el Registro radica en Melilla igual que en Ceuta.
   *
   * Melilla · obra nueva · 800.000 € · gestoría 500 € (a mano):
   *   IPSI: no se calcula (TERRITORIOS_SIN_IVA) → total marcado PARCIAL
   *   AJD  = 800.000 × 0,5 % = 4.000 · bonificado al 50 %        =  2.000,00
   *          tipo efectivo = 2.000 / 800.000                     =      0,25 %
   *   Notaría: arancel = 558,93946 (hasta 601.012,10)
   *            + (800.000 − 601.012,10) × 0,0003 = 59,69637      = 618,63583
   *            × 1,21 = 748,5493543 · × 1,75                     =  1.309,9614
   *   Registro: 306,5156935 (hasta 601.012,10)
   *            + (800.000 − 601.012,10) × 0,0002 = 39,79758      = 346,3132735
   *            + 9,015182 = 355,3284555 · × 1,21                 =    429,9474
   *   Total parcial = 2.000 + 1.309,9614 + 429,9474 + 500        =  4.239,9088
   *   Total operación                                            = 804.239,9088
   */
  test('A (cierre) — Melilla, obra nueva 800.000 €: el AJD se rotula con su tipo efectivo (0,25%)', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Obra nueva/ }).click();
    await page.selectOption('#select-ccaa', 'melilla');
    await rellenar(page, PRECIO, '800000');
    await rellenar(page, GESTORIA, '500');

    expect(await valorTarjeta(page, 'IPSI')).toBe('No calculado');
    expect(await rotuloTarjeta(page, /^AJD \(/)).toBe('AJD (0,25%)');
    expect(await valorTarjeta(page, 'AJD (')).toBe('2000,00 €');
    expect(await descripcionTarjeta(page, 'AJD (')).toContain('bonificación del 50%');
    // 26/09/2026 (hallazgo 2214): en Canarias, Ceuta y Melilla la notaría y el registro van SIN
    // IVA —su factura lleva IGIC o IPSI, que la app no calcula y nombra junto al total—, así que
    // las dos líneas son las de antes ÷ 1,21 (el arancel × 1,75 y el arancel del registro).
    //   notaría 618,63583 × 1,75 = 1.082,612703 · registro 355,3284555
    //   total 2.000 + 1.082,61 + 355,33 + 500 = 3.937,94 · coste 803.937,94
    // 17/10/2026 (cabo C0209): con la base del BOE y la rebaja del 5 % del nº 2.1, notaría
    //   618,637646 × 0,95 × 1,75 = 1.028,485086 · registro 346,313758 × 0,95 + 9,015182 =
    //   338,013252 → total 2.000 + 1.028,49 + 338,01 + 500 = 3.866,50 · coste 803.866,50
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('3866,50 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL (PARCIAL)')).toBe('803.866,50 €');
    // El 21 % que allí no existe no aparece por ninguna parte del desglose.
    await expect(page.getByText('168.000,00 €')).toHaveCount(0);
  });

  /**
   * MITAD B · CASO NUEVO 1 (normal) — Baleares, segunda mano, 700.000 €.
   *
   * Una nave usada en el tramo medio de la escala balear: es donde el tipo NOMINAL de la
   * tabla (8 %) y el que de verdad se paga dejan de coincidir, que es justo lo que el
   * rótulo del tipo efectivo tiene que enseñar. `ITP_CCAA['baleares'].tramosProgresivos`
   * = 8 % hasta 400.000, 9 % hasta 600.000, 10 % hasta 1.000.000, 12 % hasta 2.000.000, 13 %.
   *
   * A mano (gestoría 500 €):
   *   ITP = 400.000 × 8 % + 200.000 × 9 % + 100.000 × 10 %
   *       = 32.000 + 18.000 + 10.000                              = 60.000,00
   *   tipo efectivo = 60.000 / 700.000                            =      8,5714 % → «8,57%»
   *   AJD = 0 (segunda mano sin renuncia: no hay cuota gradual)
   *   Notaría: escala = 558,941276 + (700.000 − 601.012,10) × 0,0003 = 29,69637
   *          = 588,637646 · × 0,95 (rebaja del nº 2.1, 17/10/2026, cabo C0209) = 559,205764
   *          · × 1,21 = 676,638974 · × 1,75                         =  1.184,1182
   *   Registro: 306,516178 + (700.000 − 601.012,10) × 0,0002 = 19,79758
   *          = 326,313758 × 0,95 = 309,998070 + 9,015182 = 319,013252 · × 1,21 = 386,0060
   *   Total gastos = 60.000 + 1.184,12 + 386,01 + 500              = 62.070,13
   *   % sobre el precio = 62.070,13 / 700.000                      =      8,8672 % → «8,87%»
   *   Total operación                                              = 762.070,13
   *   (sin la rebaja: 1.246,44 · 405,75 · 62.152,19 · 8,88 %)
   */
  test('B1 (normal) — Baleares, segunda mano, 700.000 €: la escala 8/9/10 da un efectivo del 8,57%', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await page.selectOption('#select-ccaa', 'baleares');
    await rellenar(page, PRECIO, '700000');
    await rellenar(page, GESTORIA, '500');

    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (8,57%)');
    expect(await valorTarjeta(page, 'ITP (')).toBe('60.000,00 €');
    // El nominal de la tabla, 8 %, habría dado 56.000 €: el tramo importa.
    await expect(page.getByText('56.000,00 €')).toHaveCount(0);
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('1184,12 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('386,01 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('62.070,13 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('8,87%');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('762.070,13 €');
  });

  /**
   * MITAD B · CASO NUEVO 2 (el supuesto propio de una nave) — Cataluña, 2ª mano con
   * renuncia a la exención, 800.000 €.
   *
   * Es el caso que separa una nave de una vivienda: entre empresarios con derecho a
   * deducción la segunda transmisión vuelve al IVA (art. 20.Dos LIVA), con inversión del
   * sujeto pasivo, y entonces NO se paga ITP pero SÍ la cuota gradual de AJD. La app tiene
   * que sustituir un impuesto por el otro, no sumarlos.
   *
   * A mano (gestoría 500 €):
   *   IVA = 800.000 × 21 % (IVA_INMUEBLES_2025.local)             = 168.000,00
   *   AJD = 800.000 × 1,5 % (ITP_CCAA['cataluna'].ajd)            =  12.000,00
   *   ITP = 0 — y el 10 % del primer tramo catalán (80.000 €) no puede aparecer
   *   Notaría 1.309,9614 · Registro 429,9474 (mismo desarrollo que el caso de Melilla)
   *   Total gastos = 168.000 + 12.000 + 1.309,9614 + 429,9474 + 500 = 182.239,9088
   *   Total operación                                               = 982.239,9088
   *   17/10/2026 (cabo C0209): con la rebaja del nº 2.1, notaría 618,637646 × 0,95 × 1,21 ×
   *   1,75 = 1.244,47 · registro (346,313758 × 0,95 + 9,015182) × 1,21 = 409,00
   *   → total 168.000 + 12.000 + 1.244,47 + 409,00 + 500 = 182.153,47 · coste 982.153,47
   */
  test('B2 (renuncia) — Cataluña, 2ª mano con renuncia, 800.000 €: IVA 21% + AJD y ningún ITP', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /renuncia al IVA/ }).click();
    await page.selectOption('#select-ccaa', 'cataluna');
    await rellenar(page, PRECIO, '800000');
    await rellenar(page, GESTORIA, '500');

    expect(await rotuloTarjeta(page, /^IVA \(renuncia/)).toBe('IVA (renuncia · ISP) (21,00%)');
    expect(await valorTarjeta(page, 'IVA (renuncia')).toBe('168.000,00 €');
    expect(await rotuloTarjeta(page, /^AJD \(/)).toBe('AJD (1,50%)');
    expect(await valorTarjeta(page, 'AJD (')).toBe('12.000,00 €');
    // No coexisten: ni tarjeta de ITP ni el 10 % del primer tramo catalán.
    await expect(page.locator('h3', { hasText: /^ITP \(/ })).toHaveCount(0);
    await expect(page.getByText('80.000,00 €')).toHaveCount(0);
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('182.153,47 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('982.153,47 €');
  });

  /**
   * MITAD B · CASO NUEVO 3 (LÍMITE) — Madrid, segunda mano, 6.010,12 €.
   *
   * El primer tramo del arancel notarial (RD 1426/1989) y del registral (RD 1427/1989) es
   * una cuota FIJA hasta 6.010,12 € exactos. Ese es el punto en el que el bucle de
   * `calcularArancelNotarial` tiene que cortar sin entrar en el tramo del exceso: un `<=`
   * mal puesto ahí cobraría un exceso de cero euros o duplicaría la base. Además el precio
   * se teclea en formato español CON los dos separadores («6.010,12»), donde el último
   * manda como decimal.
   *
   * A mano (gestoría 500 €):
   *   ITP = 6.010,12 × 6 % (Madrid, TIPOS_ITP_CCAA_2025)          =    360,6072
   *   Notaría: escala = 90,151816 exacto (cuota fija del primer tramo, con los decimales del BOE)
   *            × 0,95 (rebaja del nº 2.1, 17/10/2026, cabo C0209) = 85,644225
   *            × 1,21 = 103,629512 · × 1,5 = 155,444268 (min)
   *                                × 2   = 207,259025 (max)
   *                                × 1,75                          =    181,3516
   *   Registro: 24,040484 × 0,95 = 22,838460 + 6,010121 + 3,005061 = 31,853642 · × 1,21 = 38,5429
   *   Total gastos = 360,61 + 181,35 + 38,54 + 500                  =  1.080,50
   *   % sobre el precio = 1.080,50 / 6.010,12                       =     17,9781 %
   *   Total operación = 6.010,12 + 1.080,50                         =  7.090,62
   *   (sin la rebaja: 190,89 · 163,62–218,16 · 40,00 · 1.091,50)
   */
  test('B3 (límite) — Madrid, 6.010,12 €: la frontera exacta del primer tramo del arancel', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await page.selectOption('#select-ccaa', 'madrid');
    await rellenar(page, PRECIO, '6.010,12');
    await rellenar(page, GESTORIA, '500');

    expect(await valorTarjeta(page, 'Precio de la nave industrial')).toBe('6010,12 €');
    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (6,00%)');
    expect(await valorTarjeta(page, 'ITP (')).toBe('360,61 €');
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('181,35 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain('entre 155,44 € y 207,26 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('38,54 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('1080,50 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('7090,62 €');
  });

  /**
   * MITAD B · CASO NUEVO 4 (RECHAZO) — la gestoría que no es un número.
   *
   * `CASO 3` cubre el rechazo del PRECIO y `HALLAZGO 165` el de una gestoría negativa. Falta
   * la tercera puerta: una gestoría que pasa el filtro del input (solo dígitos y separadores)
   * pero que `parseSpanishNumber` rechaza con NaN — «1.2.3», donde `parseFloat` habría
   * devuelto 10,5 y colado un importe inventado. `parseSpanishNumberOr` la resuelve a 0.
   *
   * Madrid · segunda mano · 500.000 € · gestoría «1.2.3» (a mano):
   *   ITP 30.000 + notaría 1.076,6077 + registro 345,1250 + gestoría 0 = 31.421,7327
   *   Total operación                                                  = 531.421,7327
   *   (17/10/2026, cabo C0209: con la rebaja del nº 2.1, 30.000 + 1.022,78 + 328,41 = 31.351,19
   *   · coste 531.351,19)
   *
   * ⚠️ 22/09/2026 (hallazgo 1199) — este testigo pedía además que la tarjeta de gestoría NO se
   * pintara, y esa mitad era el defecto: un importe ilegible desaparecía del desglose sin
   * dejar rastro y el coste total seguía rotulado «todos los gastos», es decir presupuestar
   * de menos en silencio. Las cifras NO cambian —la app no puede inventar lo que no ha
   * leído—, pero la línea vuelve con «Sin leer» y el total dice qué le falta.
   */
  test('B4 (rechazo) — una gestoría no numérica no descuadra el total ni pinta NaN, y se NOMBRA', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await page.selectOption('#select-ccaa', 'madrid');
    await rellenar(page, PRECIO, '500000');
    await rellenar(page, GESTORIA, '1.2.3');

    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('Sin leer');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('31.351,19 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain(
      'SIN la gestoría, que no se ha podido leer',
    );
    // 24/09/2026 (hallazgo 1585): el título pasa a «(PARCIAL)», como cuando falta el IGIC. Hasta
    // ese día este test leía la tarjeta por «COSTE TOTAL DE ADQUISICIÓN», que es el título de
    // una cifra definitiva, y así consagraba el defecto.
    expect(await rotuloTarjeta(page, /^COSTE TOTAL/)).toBe('COSTE TOTAL (PARCIAL)');
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('531.351,19 €');
    expect(await descripcionTarjeta(page, 'COSTE TOTAL')).toBe(
      'No incluye la gestoría, que no se ha podido leer: el coste real será mayor',
    );
    const cuerpo = await page.locator('body').innerText();
    expect(cuerpo).not.toContain('NaN');
    expect(cuerpo).not.toContain('No definido');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Hallazgos 490-493 de la re-inspección del 28/08/2026 — reparados.
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Hallazgos reparados — 28/08/2026', () => {
  /**
   * Hallazgo 490 — reparado. Los botones del grupo «Tipo de transmisión» nombran ahora el
   * impuesto local (IGIC/IPSI) en los tres territorios donde el IVA no rige, en vez de
   * prometer un «IVA 21%» que el recuadro de la comunidad desmiente unos centímetros más abajo.
   */
  test('REGRESIÓN — en Canarias los botones no ofrecen «IVA 21%»', async ({ page }) => {
    await page.goto(RUTA);
    await page.selectOption('#select-ccaa', 'canarias');
    const grupo = page.getByRole('group', { name: /Tipo de transmisión/ });
    const rotulos = (await grupo.innerText()).replace(/\s+/g, ' ');
    // Antes de repararlo: «🔄 Segunda mano Paga ITP (tipo general) || 🆕 Obra nueva / Promotor Paga IVA 21% +
    // AJD || 🤝 2ª mano con renuncia al IVA IVA 21% (ISP) + AJD».
    expect(rotulos).not.toMatch(/IVA\s*21\s*%/);
  });

  /**
   * Hallazgo 491 — reparado. La FAQ «¿Hay AJD en la compra de una nave industrial?» ya
   * distingue el caso sin renuncia (ITP, sin AJD salvo hipoteca) del caso con renuncia a la
   * exención (tercera opción), donde la app sí liquida AJD sobre la propia compraventa.
   */
  test('REGRESIÓN — la FAQ no niega el AJD que la app cobra con renuncia a la exención', async ({ page }) => {
    await page.goto(RUTA);
    const bloque = (
      await page
        .locator('strong', { hasText: '¿Hay AJD en la compra de una nave industrial?' })
        .first()
        .locator('xpath=..')
        .innerText()
    ).replace(/\s+/g, ' ');
    expect(bloque).not.toMatch(/En segunda mano, el AJD solo se pagaría sobre la escritura de hipoteca/);
  });

  /**
   * Hallazgo 492 — reparado. La tarjeta «Autónomo compra nave de segunda mano» ya nombra la
   * bonificación del 50 % de Ceuta y Melilla (art. 57 bis TRLITPAJD) en vez de negarla.
   */
  test('REGRESIÓN — el caso de uso del autónomo no niega la bonificación de Ceuta y Melilla', async ({ page }) => {
    await page.goto(RUTA);
    const tarjeta = (
      await page
        .locator('strong', { hasText: 'Autónomo compra nave de segunda mano' })
        .first()
        .locator('xpath=..')
        .innerText()
    ).replace(/\s+/g, ' ');
    expect(tarjeta).not.toContain('no hay bonificaciones para naves industriales');
  });

  /**
   * Hallazgo 493 — reparado. Los tres literales «21%» del bloque educativo (caso de uso de
   * la empresa, consejo del régimen de IVA y limitaciones) derivan ahora de
   * `IVA_NAVE_INDUSTRIAL` (= `IVA_INMUEBLES_2025.local`), igual que la tabla comparativa.
   */
  test('REGRESIÓN — no quedan «21%» escritos a mano en el bloque educativo', async () => {
    const fuente = await leerFuente();
    // El valor existe en data/fiscal y ya está importado aquí (lo fija `REPARADO D`).
    expect(fuente.match(/\b21%/g) ?? []).toHaveLength(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN — 02/09/2026 (Opus 5)
//
// Tres casos frescos, RESUELTOS A MANO ANTES de abrir el navegador, sobre terreno que las
// vueltas anteriores no habían pisado: dos escalas progresivas sin probar (Aragón y
// Extremadura) y el rechazo de entradas por la rama del IVA, que hasta hoy solo se había
// comprobado por la del ITP.
//
// De dónde sale CADA cifra esperada (ninguna de memoria):
//  - Tipo general de Aragón (8 %) y de Extremadura (8 %) → `TIPOS_ITP_CCAA_2025` en
//    `data/fiscal/inmuebles.ts`, que `tipoGeneralDe()` lee para rellenar `ITP_CCAA`.
//  - Escalas progresivas → `ITP_CCAA` en `data/itp-ccaa.ts`
//    (Aragón: escala de cinco tramos del art. 121-1 — 8 % hasta 400.000 €, 8,5 % hasta
//     450.000 €, 9 % hasta 500.000 €, 9,5 % hasta 750.000 € y 10 % por encima ·
//     Extremadura: 8 % hasta 360.000 €, 10 % hasta 600.000 € y 11 % por encima).
//    ⚠️ 11/09/2026: este caso se escribió contra una escala de Aragón de DOS tramos
//    (8 % / 10 %) que no era la de la norma — le faltaban los tres escalones intermedios.
//    El triaje fiscal de ese día la corrigió contra el consolidado del BOE, así que las
//    cifras de abajo bajaron de 92.000 € a 89.500 € de ITP. El caso sigue siendo válido y
//    sigue cruzando la escala; lo que cambió es cuánto sale.
//  - Aranceles → `ARANCELES_NOTARIO` (RD 1426/1989) y `ARANCELES_REGISTRO` (RD 1427/1989),
//    con `FACTURA_NOTARIAL` (×1,5 a ×2, punto medio ×1,75) y `REGISTRO_CONCEPTOS`
//    (presentación 6,010121 € + nota simple 3,005061 €). El 21 % de IVA va dentro.
//  - IVA de la nave → `IVA_INMUEBLES_2025.local` = 21.
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Re-inspección 02/09/2026 — tres casos nuevos', () => {
  /**
   * CASO 1 (NORMAL) — Aragón, segunda mano, 1.000.000 €, gestoría 500 €.
   *
   * Aragón tiene la escala de cinco tramos del art. 121-1 del Decreto Legislativo 1/2005,
   * con cuota íntegra acumulada. Una nave usada de un millón la cruza entera, así que el
   * tipo NOMINAL de la tabla (8 %) y el que de verdad se paga dejan de coincidir.
   *
   * A mano (los cortes acumulados son los de la tabla oficial: 32.000 · 36.250 · 40.750 ·
   * 64.500):
   *   ITP = 64.500 + (1.000.000 − 750.000) × 10 % = 64.500 + 25.000    =  89.500,00
   *   tipo efectivo = 89.500 / 1.000.000                               =       8,95 %
   *   AJD = 0 (segunda mano sin renuncia: no hay cuota gradual)
   *   Notaría: escala = 558,941276 (acumulado hasta 601.012,10, base del BOE 90,151816)
   *            + (1.000.000 − 601.012,10) × 0,0003 = 119,69637      = 678,637646
   *            × 0,95 (rebaja del nº 2.1, 17/10/2026, cabo C0209)   = 644,705764
   *            × 1,21 = 780,093974
   *            × 1,5 = 1.170,140961 (min) · × 2 = 1.560,187948 (max)
   *            punto medio                                          =  1.365,164454
   *   Registro: 306,516178 (acumulado hasta 601.012,10)
   *            + (1.000.000 − 601.012,10) × 0,0002 = 79,79758       = 386,313758
   *            × 0,95 = 366,998070 + 9,015182 = 376,013252 · × 1,21  =    454,976034
   *   Total gastos = 89.500 + 1.365,16 + 454,98 + 500               =  91.820,14
   *   % sobre el precio = 91.820,14 / 1.000.000                     =       9,1820 % → «9,18%»
   *   Total operación                                               = 1.091.820,14
   *   (sin la rebaja: 1.437,01 · 1.231,72–1.642,30 · 478,35 · 91.915,36)
   */
  test('CASO 1 (normal) — Aragón, segunda mano, 1.000.000 €: la escala de cinco tramos da un efectivo del 8,95%', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await page.selectOption('#select-ccaa', 'aragon');
    await rellenar(page, PRECIO, '1000000');
    await rellenar(page, GESTORIA, '500');

    // La app anuncia la escala en el recuadro de la comunidad; el caso comprueba que la aplica.
    await expect(page.getByText(/escala progresiva \(8\s% → 8,50\s% → 9\s% → 9,50\s% → 10\s%\)/)).toBeVisible();

    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (8,95%)');
    expect(await valorTarjeta(page, 'ITP (')).toBe('89.500,00 €');
    // El tipo plano del primer tramo habría dado 80.000 €, y el del último 100.000 €: ninguno.
    await expect(page.getByText('80.000,00 €')).toHaveCount(0);
    await expect(page.getByText('100.000,00 €')).toHaveCount(0);
    // Y la escala de dos tramos que esta app aplicó hasta el 11/09/2026 daba 92.000 €.
    await expect(page.getByText('92.000,00 €')).toHaveCount(0);
    // En segunda mano sin renuncia no hay cuota gradual de AJD sobre la compraventa.
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);

    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('1365,16 €');
    const notaria = await descripcionTarjeta(page, 'Gastos de notaría');
    expect(notaria).toContain('1170,14 €');
    expect(notaria).toContain('1560,19 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('454,98 €');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('500,00 €');

    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('91.820,14 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('9,18%');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('1.091.820,14 €');
  });

  /**
   * CASO 2 (LÍMITE) — Extremadura, segunda mano, 600.000,00 € exactos.
   *
   * Es el corte EXACTO entre el tramo del 10 % y el del 11 % de
   * `ITP_CCAA['extremadura'].tramosProgresivos` (8 % hasta 360.000, 10 % hasta 600.000,
   * 11 % después). En ese punto el bucle de `calcularITPProgresivo` tiene que agotar la base
   * en el segundo tramo y NO entrar en el tercero: un `<` por un `<=` mal puesto cobraría
   * aquí un exceso al 11 % que la ley no devenga. El importe se teclea además en formato
   * español con punto de millar («600.000»), donde el separador solo agrupa.
   *
   * A mano (gestoría 500 €):
   *   ITP = 360.000 × 8 % + 240.000 × 10 % = 28.800 + 24.000        =  52.800,00
   *   tipo efectivo = 52.800 / 600.000                              =       8,80 %
   *   Notaría: escala = 90,151816 + 108,182205 + 45,0759 + 90,15182
   *            + (600.000 − 150.253,03) × 0,0005 = 224,873485       = 558,435226
   *            (el tramo 6 arranca en 601.012,10: 600.000 no lo alcanza)
   *            × 0,95 (rebaja del nº 2.1, 17/10/2026, cabo C0209)   = 530,513465
   *            × 1,21 = 641,921293
   *            × 1,5 = 962,881940 (min) · × 2 = 1.283,842586 (max)
   *            punto medio                                          =  1.123,362263
   *   Registro: 24,040484 + 42,0708575 + 37,56325 + 67,613865
   *            + (600.000 − 150.253,03) × 0,0003 = 134,924091       = 306,212547
   *            × 0,95 = 290,901920 + 9,015182 = 299,917102 · × 1,21  =    362,899693
   *   Total gastos = 52.800 + 1.123,36 + 362,90 + 500               =  54.786,26
   *   % sobre el precio = 54.786,26 / 600.000                       =       9,1310 % → «9,13%»
   *   Total operación                                               = 654.786,26
   *   (sin la rebaja: 1.182,48 · 1.013,56–1.351,41 · 381,42 · 54.863,90)
   */
  test('CASO 2 (límite) — Extremadura, 600.000 € exactos: el corte 10 % → 11 % no se pasa de largo', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await page.selectOption('#select-ccaa', 'extremadura');
    await rellenar(page, PRECIO, '600.000');
    await rellenar(page, GESTORIA, '500');

    // El punto de millar del formato español no puede convertir el importe en 600 €.
    expect(await valorTarjeta(page, 'Precio de la nave industrial')).toBe('600.000,00 €');
    await expect(page.getByText(/escala progresiva \(8\s% → 10\s% → 11\s%\)/)).toBeVisible();

    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (8,80%)');
    expect(await valorTarjeta(page, 'ITP (')).toBe('52.800,00 €');
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('1123,36 €');
    const notaria = await descripcionTarjeta(page, 'Gastos de notaría');
    expect(notaria).toContain('962,88 €');
    expect(notaria).toContain('1283,84 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('362,90 €');

    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('54.786,26 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('9,13%');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('654.786,26 €');
  });

  /**
   * CASO 3 (RECHAZO) — entradas que no son un precio, con la RENUNCIA seleccionada.
   *
   * `CASO 3` de la primera vuelta y `B4` de la del 28/08 comprueban el rechazo por la rama
   * del ITP. Falta la otra: con «2ª mano con renuncia al IVA» el motor toma la rama
   * `conIva`, donde el impuesto se calcula como `precio × 21 %` en vez de con `calcularITP`.
   * Si la guarda `!Number.isFinite(precio) || precio <= 0` fallara ahí, la pantalla enseñaría
   * un «IVA (21,00%) 0,00 €» —o un NaN— sobre una operación inexistente.
   *
   * Entradas y lo que debe pasar con cada una:
   *   «0,00»    → cero escrito en formato español: parsea a 0 y la guarda lo rechaza
   *   «0»       → cero pelado
   *   «-250000» → negativo (el blur de NumberInput lo lleva a min=0, y 0 también se rechaza)
   *   «,»       → solo el separador decimal: `parseSpanishNumber` devuelve NaN
   *   «»        → vacío
   *   «1.2.3»   → pasa el filtro del input pero no es un número (NaN)
   * En los seis casos: marcador de posición visible, ninguna tarjeta de coste y ningún
   * centinela de NaN en pantalla.
   */
  test('CASO 3 (rechazo) — con renuncia al IVA, ningún precio inválido produce cifra ni NaN', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /renuncia al IVA/ }).click();
    await page.selectOption('#select-ccaa', 'madrid');

    const campo = page.locator('input[aria-label="' + PRECIO + '"]');
    const marcador = page.getByText(MARCADOR_SIN_CIFRA);

    for (const entrada of ['0,00', '0', '-250000', ',', '', '1.2.3']) {
      await campo.fill(entrada);
      await expect(marcador).toBeVisible();
      // Ni el total, ni el total parcial, ni una tarjeta de IVA vacía.
      await expect(page.locator('h3', { hasText: /^COSTE TOTAL/ })).toHaveCount(0);
      await expect(page.locator('h3', { hasText: /^IVA \(/ })).toHaveCount(0);
      const cuerpo = await page.locator('body').innerText();
      expect(cuerpo).not.toContain('NaN');
      expect(cuerpo).not.toContain('No definido');
      expect(cuerpo).not.toContain('∞');
    }

    // Y en cuanto el precio es válido, la rama del IVA vuelve a producir su cifra:
    // 250.000 × 21 % (IVA_INMUEBLES_2025.local) = 52.500
    await rellenar(page, PRECIO, '250000');
    expect(await valorTarjeta(page, 'IVA (renuncia')).toBe('52.500,00 €');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// REGRESIÓN — los cinco hallazgos de la re-inspección del 02/09/2026 (600-604), REPARADOS
// ese mismo día. Estaban escritos con `test.fail()` afirmando lo que DEBERÍA ocurrir; al
// repararlos se les quitó la marca, igual que se hizo con los hallazgos 156-166 y 490-493.
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Regresión — hallazgos del 02/09/2026, reparados', () => {
  /**
   * HALLAZGO 1 (contenido, medio) — con RENUNCIA a la exención, la tarjeta del impuesto lleva
   * debajo una descripción del ITP.
   *
   * El render decide el texto con `resultadosComprador.tipoImpuesto === 'IVA'`, una igualdad
   * ESTRICTA, y en la renuncia ese campo vale `'IVA (renuncia · ISP)'`. Así que cae al último
   * ramal del ternario y la pantalla queda: «IVA (renuncia · ISP) (21,00%) · 105.000,00 € ·
   * Tipo general — naves industriales no tienen tipos reducidos». «Tipo general» y «tipos
   * reducidos» son conceptos del ITP, que en esta operación NO se paga; y de paso se pierde lo
   * único que había que decir ahí —que ese IVA lo autoliquida el comprador y suele ser
   * deducible—, que es justo lo que sí aparece cuando la misma nave se compra en obra nueva.
   *
   * Verificado en Madrid con 500.000 € (2ª mano con renuncia). Alcanza a las 16 comunidades
   * donde rige el IVA: en Canarias, Ceuta y Melilla manda `impuestoNoCalculado` y no se ve.
   */
  test('HALLAZGO 1 — la tarjeta del IVA con renuncia describe el ITP', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /renuncia al IVA/ }).click();
    await page.selectOption('#select-ccaa', 'madrid');
    await rellenar(page, PRECIO, '500000');

    expect(await valorTarjeta(page, 'IVA (renuncia')).toBe('105.000,00 €');
    const desc = await descripcionTarjeta(page, 'IVA (renuncia');
    // Antes de repararlo: «Tipo general — naves industriales no tienen tipos reducidos».
    expect(desc).not.toContain('Tipo general');
    expect(desc).not.toContain('tipos reducidos');
    // Debería decir lo mismo que dice la obra nueva, que sí acierta el ramal.
    expect(desc).toContain('deducible');
  });

  /**
   * HALLAZGO 2 (contenido, medio) — el texto de ayuda del precio manda usar el valor de
   * referencia catastral TAMBIÉN cuando la operación va por IVA, donde no pinta nada.
   *
   * El campo dice, en los tres modos, «Precio escriturado o valor de referencia catastral (el
   * mayor de ambos)». Esa es la base del ITP y del AJD (arts. 10 y 30 del TRLITPAJD tras la
   * Ley 11/2021), pero la base del IVA es la contraprestación pactada (art. 78 de la Ley
   * 37/1992): en «Obra nueva / Promotor» y en «2ª mano con renuncia» —dos de los tres modos, y
   * según la propia app el caso frecuente para empresas y autónomos— seguir la instrucción
   * infla el 21 % sobre una base que la ley del IVA no reconoce.
   *
   * La página ya lo dice bien en otro sitio, y por eso se contradice: el recuadro de
   * limitaciones acota el valor de referencia «al ITP».
   */
  test('HALLAZGO 2 — el helper del precio ofrece la base del ITP también en los modos con IVA', async ({ page }) => {
    await page.goto(RUTA);
    const helper = page
      .locator('input[aria-label="' + PRECIO + '"]')
      .locator('xpath=following-sibling::p[1]');

    // El recuadro de limitaciones sí acota el valor de referencia al ITP…
    const limitaciones = (await page.locator('[class*="warningBox"]').first().innerText()).replace(/\s+/g, ' ');
    expect(limitaciones).toContain('base imponible real del ITP');

    // …y el campo tendría que decir lo mismo cuando la operación tributa por IVA.
    await page.getByRole('button', { name: /Obra nueva/ }).click();
    // 26/09/2026 (hallazgo 2209, de la hermana solar): con IVA la ayuda sigue sin decir «el mayor
    // de ambos» para el precio —la base del IVA es la contraprestación—, pero ahora nombra el
    // valor de referencia como SUELO DEL AJD (art. 30.1 TRLITPAJD), que es otra cosa.
    const ayudaIva = (await helper.innerText()).replace(/\s+/g, ' ');
    expect(ayudaIva).not.toContain('el mayor de ambos');
    expect(ayudaIva).toContain('La base del AJD no puede ser inferior al valor de referencia catastral (art. 30.1 TRLITPAJD)');
  });

  /**
   * HALLAZGO 3 (dato, bajo) — el 21 % vuelve a estar escrito a mano, ahora en `metadata.ts`.
   *
   * Es el hallazgo 163 (el `const IVA_NAVE_INDUSTRIAL = 21` de la página) y el 493 (los tres
   * literales del bloque educativo) por tercera vez, en el fichero que la barrida no miró:
   * `title`, `description`, las dos descripciones sociales, la `description` del WebApplication
   * y una de sus `features` dicen «IVA 21%» a mano —seis veces— mientras el FAQPage de ese
   * mismo fichero ya lo deriva con `pct(IVA_INMUEBLES_2025.local)`. El import y el formateador
   * están ahí; solo hay que usarlos.
   *
   * No hay ninguna cifra equivocada hoy: lo que hay es la divergencia en silencio que ya costó
   * dos reparaciones, y encima en el texto que leen Google y los buscadores conversacionales.
   */
  test('HALLAZGO 3 — metadata.ts escribe «IVA 21%» a mano pudiendo derivarlo de data/fiscal', async () => {
    const meta = await leerMetadata();
    // El valor vive en data/fiscal y el fichero ya lo importa (lo usa el FAQPage).
    expect(IVA_INMUEBLES_2025.local).toBe(21);
    expect(meta).toContain('IVA_INMUEBLES_2025');
    // Ningún literal «21%» debería quedar en el metadata.
    expect(meta.match(/\b21%/g) ?? []).toHaveLength(0);
  });

  /**
   * HALLAZGO 4 (accesibilidad, bajo) — emoji pegado al texto sin `aria-hidden`.
   *
   * El aviso «💡 Si eres empresa o autónomo:» (línea 216 de `page.tsx`) lleva el emoji dentro
   * del `<strong>`, sin el `<span aria-hidden="true">` que exige el CLAUDE.md §5, así que el
   * lector de pantalla lo anuncia antes de la frase. Es una de las dos reglas de corrección
   * unívoca: `npm run check:a11y-jsx` la señala y ROMPERÍA el build si esa línea se escribiera
   * hoy — sobrevive porque el candado juzga las líneas que un commit añade y esta es anterior.
   * Los demás emojis de la página sí van envueltos.
   */
  test('HALLAZGO 4 — el emoji del aviso de IVA deducible va sin aria-hidden', async () => {
    const fuente = await leerFuente();
    expect(fuente).toContain('Si eres empresa o autónomo:');
    // Debería ser <span aria-hidden="true">💡</span>, como el resto de emojis del fichero.
    expect(fuente).not.toMatch(/<strong>💡 Si eres empresa/);
  });

  /**
   * HALLAZGO 5 (operativa, bajo) — `calcularNotario` se importa y no se usa.
   *
   * La página pasó a `estimarFacturaNotarial` para poder enseñar la horquilla (min/medio/max)
   * y el import antiguo se quedó. No cambia ningún importe —`calcularNotario` devuelve
   * exactamente el punto medio que la app ya pinta— pero deja en la cabecera una dependencia
   * muerta que sugiere un segundo camino de cálculo que no existe.
   */
  test('HALLAZGO 5 — import muerto de calcularNotario en page.tsx', async () => {
    const fuente = await leerFuente();
    const usos = fuente.match(/calcularNotario/g) ?? [];
    // Hoy aparece una sola vez: en el import.
    expect(usos.length).not.toBe(1);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// INSPECCIÓN 07/09/2026 (Opus 5)
//
// RE-INSPECCIÓN. Antes de escribir nada se ejecutó el fichero entero: 45/45 en verde y
// ningún bloque con `test.fail()` pendiente, así que las tres reparaciones que el encargo
// nombraba (IVA español liquidado en Canarias/Ceuta/Melilla, bonificación del 50 % mal
// aplicada y ausencia de `<DataReference>`) siguen cerradas y con red debajo. Esta tanda
// añade CASOS NUEVOS, ninguno repetido de las anteriores.
//
// De dónde sale CADA cifra esperada de esta tanda:
//  - Murcia, tipo general 7,75 % → `TIPOS_ITP_CCAA_2025` en `data/fiscal/inmuebles.ts`
//    (Ley 3/2025, efectos 25/07/2025), que `tipoGeneralDe()` vuelca en `ITP_CCAA.murcia`.
//    Murcia NO tiene escala progresiva, así que el tipo efectivo coincide con el nominal.
//  - Ceuta: tipo general 6 % y `ajd: 0.5` → `ITP_CCAA.ceuta`; bonificación del 50 % de la
//    cuota → `BONIFICACION_CUOTA_CEUTA_MELILLA` (art. 57 bis TRLITPAJD), que aplican
//    `calcularITP` y `calcularAJD`; IPSI → `TERRITORIOS_SIN_IVA.ceuta`.
//  - Aranceles → `ARANCELES_NOTARIO` / `ARANCELES_REGISTRO` + la horquilla de
//    `FACTURA_NOTARIAL` (medio ×1,75) + los fijos de `REGISTRO_CONCEPTOS`
//    (6,010121 + 3,005061) + el 21 % de IVA que ambas funciones ya añaden.
//  - IVA de la nave en primera entrega → `IVA_INMUEBLES_2025.local` (21). NO el 10 % de
//    `obraNueva`, que es el reducido de VIVIENDA y una nave no puede tener nunca.
//
// Los tres casos se resolvieron a mano ANTES de abrir el navegador; el desarrollo va
// comentado junto a cada aserción, con los importes sin redondear.
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Inspección 07/09/2026 — tres casos nuevos', () => {
  /**
   * CASO 1 (NORMAL) — Murcia, segunda mano, 350.000 €, gestoría 500 €.
   *
   * Comunidad sin escala progresiva y con el único tipo general de dos decimales del mapa
   * (7,75 %): comprueba de paso que el rótulo del tipo efectivo no lo redondea a «8%».
   *
   * ITP = 350.000 × 7,75 % = 27.125,00
   * Arancel notarial = 90,15 + 24.040,49×0,45 % + 30.050,60×0,15 % + 90.151,82×0,10 %
   *                  + (350.000 − 150.253,03)×0,05 %
   *                  = 90,15 + 108,182205 + 45,0759 + 90,15182 + 99,873485 = 433,43341
   *   × 1,21 = 524,4544261 → medio × 1,75 = 917,795246 (min ×1,5 = 786,681639 · max ×2 = 1.048,908852)
   * Registro = 24,04 + 42,0708575 + 37,56325 + 67,613865 + 59,924091 = 231,2120635
   *   + 6,010121 + 3,005061 = 240,2272455 × 1,21 = 290,674967
   * Total (líneas ya redondeadas) = 27.125,00 + 0 + 917,80 + 290,67 + 500 = 28.833,47
   *   → 28.833,47 / 350.000 = 8,238134 % → 8,24 %
   * COSTE TOTAL = 350.000 + 28.833,47 = 378.833,47
   * ⚠️ 17/10/2026 (cabo C0209): con la base del BOE y la rebaja del 5 % del nº 2.1, escala
   *   433,435226 × 0,95 × 1,21 = 498,233792 → medio 871,909136 (min 747,350688 · max 996,467584)
   *   · registro (231,212547 × 0,95 + 9,015182) × 1,21 = 276,687194 → total 27.125 + 871,91 +
   *   276,69 + 500 = 28.773,60 → 8,221029 % → 8,22 % · COSTE TOTAL 378.773,60
   */
  test('CASO 1 (normal) — Murcia, segunda mano, 350.000 €: el 7,75 % no se redondea a 8 %', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await page.selectOption('#select-ccaa', 'murcia');
    await rellenar(page, PRECIO, '350000');

    // El tipo general de Murcia lo manda data/fiscal, no este test.
    expect(ITP_CCAA['murcia'].tipoGeneral).toBe(7.75);
    expect(ITP_CCAA['murcia'].tramosProgresivos).toBeUndefined();

    expect(await valorTarjeta(page, 'Precio de la nave industrial')).toBe('350.000,00 €');
    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (7,75%)');
    expect(await valorTarjeta(page, 'ITP (')).toBe('27.125,00 €');
    // Una nave no puede acogerse a ningún tipo reducido: todos exigen vivienda habitual.
    expect(await descripcionTarjeta(page, 'ITP (')).toContain('no tienen los reducidos de vivienda');

    // Segunda mano sin renuncia: ITP y AJD son incompatibles, así que no hay tarjeta de AJD.
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);

    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('871,91 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain('entre 747,35 € y 996,47 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('276,69 €');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('500,00 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('28.773,60 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('8,22% sobre el precio');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('378.773,60 €');

    // El recuadro de la comunidad dice lo mismo que la tarjeta, con el nominal sin inflar.
    const info = pegarPct((await page.locator('[class*="infoCcaa"]').first().innerText()).replace(/\s+/g, ' '));
    expect(info).toContain('ITP General 7,75%');
    // Relajado el 10/09/2026: lo que este caso comprueba es que el AJD del recuadro lleva
    // COMA decimal (hallazgo 161), no cuántos decimales. La cuenta de decimales es el
    // HALLAZGO 3 de esta re-inspección: hoy sale «1,50%» y debería salir «1,5%», como su
    // vecino «ITP General 7,75%». Fijar aquí el formato viejo haría fallar este test al
    // repararlo, que es exactamente la falsa alarma que se quiere evitar.
    expect(info).toMatch(/AJD 1,50?%/);
  });

  /**
   * CASO 2 (LÍMITE) — Ceuta, segunda mano, 6.010.121,04 €.
   *
   * Doble frontera a propósito: el importe es EXACTAMENTE el último corte de
   * `ARANCELES_NOTARIO` (6.010.121,04), donde el bucle tiene que parar sin entrar en el
   * séptimo tramo; y el inmueble está en una ciudad con bonificación de cuota del 50 %.
   *
   * ITP = 6.010.121,04 × 6 % = 360.607,2624 → × 0,5 = 180.303,6312 (efectivo 3,00 %)
   * Arancel notarial = 90,15 + 108,182205 + 45,0759 + 90,15182
   *                  + 450.759,07 × 0,05 % (= 225,379535)
   *                  + 5.409.108,94 × 0,03 % (= 1.622,732682) = 2.181,672142
   *   × 1,21 = 2.639,823292 → medio × 1,75 = 4.619,690761 (min 3.959,734938 · max 5.279,646584)
   *   ⚠️ 26/09/2026 (hallazgo 2214): en Ceuta, SIN IVA → × 1,75 = 3.817,926249 (min 3.272,508213
   *   · max 4.363,344284); registro 1.397,3526635 sin × 1,21;
   *   total 180.303,63 + 3.817,93 + 1.397,35 + 500 = 186.018,91 → 3,095 % → 3,10 %;
   *   COSTE TOTAL 6.196.139,95
   * Registro = 24,04 + 42,0708575 + 37,56325 + 67,613865 + 135,227721 + 1.081,821788
   *          = 1.388,3374815 (aún por debajo del tope 2.181,67)
   *   + 9,015182 = 1.397,3526635 × 1,21 = 1.690,796723
   * Total = 180.303,63 + 0 + 4.619,69 + 1.690,80 + 500 = 187.114,12 → 3,113317 % → 3,11 %
   * COSTE TOTAL = 6.010.121,04 + 187.114,12 = 6.197.235,16
   * ⚠️ 17/10/2026 (cabo C0209): con la base del BOE (90,151816) y la rebaja del 5 % del nº 2.1,
   *   escala 2.181,673958 × 0,95 = 2.072,590260 sin IVA × 1,75 = 3.627,032955 (min 3.108,885390
   *   · max 4.145,180520) · registro 1.388,337966 × 0,95 + 9,015182 = 1.327,936249 sin IVA
   *   → total 180.303,63 + 3.627,03 + 1.327,94 + 500 = 185.758,60 → 3,0908 % → 3,09 % ·
   *   COSTE TOTAL 6.195.879,64
   */
  test('CASO 2 (límite) — Ceuta, 6.010.121,04 €: el corte exacto del arancel notarial y la cuota bonificada', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await page.selectOption('#select-ccaa', 'ceuta');
    await rellenar(page, PRECIO, '6.010.121,04');

    // El importe en formato español llega entero al motor (parseSpanishNumber).
    expect(await valorTarjeta(page, 'Precio de la nave industrial')).toBe('6.010.121,04 €');

    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (3,00%)');
    expect(await valorTarjeta(page, 'ITP (')).toBe('180.303,63 €');
    expect(await descripcionTarjeta(page, 'ITP (')).toContain('bonificación del 50%');

    // En segunda mano sin renuncia no hay cuota gradual de AJD.
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);

    // Frontera del arancel: el séptimo tramo NO llega a entrar (valor == límite anterior).
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('3627,03 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain('entre 3108,89 € y 4145,18 €');
    // El registro se queda por debajo de su tope (REGISTRO_MAXIMO), que aquí aún no muerde.
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('1327,94 €');

    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('185.758,60 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('3,09% sobre el precio');
    expect(await valorTarjeta(page, 'COSTE TOTAL (PARCIAL)')).toBe('6.195.879,64 €');
  });

  /**
   * CASO 3 (RECHAZO) — Ceuta, «2ª mano con renuncia», 450.000 €.
   *
   * Dos rechazos en el mismo caso:
   *  a) el que importa fiscalmente — en Ceuta NO rige el IVA sino el IPSI, y el IPSI NO tiene
   *     renuncia a la exención: la Ley 8/1991 (BOE-A-1991-7645) toma sus exenciones de la ley
   *     del IVA (art. 7) sin regular ninguna renuncia, y prohíbe deducir el IPSI soportado en
   *     inmuebles (art. 20.3), que es lo que la renuncia del art. 20.Dos LIVA exige.
   *     ⚠️ 24/09/2026 (hallazgo 1584) — hasta ese día este caso esperaba «IPSI · No calculado»
   *     y AJD bonificado (total PARCIAL 2.975,64 €), es decir, CONSAGRABA una renuncia que la
   *     misma página negaba en su aviso. Ahora la opción se desactiva en Ceuta y la app calcula
   *     la segunda mano, que es lo que la norma deja: ITP bonificado (art. 57 bis.3.a).
   *  b) el de entrada — «1,2,3» pasa el filtro del `NumberInput` (solo cifras y separadores)
   *     pero `parseSpanishNumber` lo rechaza con NaN: dos comas no son un número.
   *
   * ITP = 450.000 × 6 % × (1 − 0,5) = 13.500,00 (efectivo 3,00 %) · sin AJD
   * Arancel notarial = 333,559925 + (450.000 − 150.253,03) × 0,05 % (= 149,873485) = 483,43341
   *   × 1,21 = 584,9544261 → medio × 1,75 = 1.023,670246 (min 877,431639 · max 1.169,908852)
   * Registro = 171,2879725 + 89,924091 = 261,2120635 + 9,015182 = 270,2272455 × 1,21 = 326,974967
   * Total = 13.500 + 1.023,67 + 326,97 + 500 = 15.350,64 → 3,41125 % → 3,41 %
   * COSTE TOTAL = 450.000 + 15.350,64 = 465.350,64
   */
  test('CASO 3 (rechazo) — Ceuta: la renuncia no existe en el IPSI, se calcula la segunda mano, y «1,2,3» no produce cifra', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /renuncia al IVA/ }).click();
    await page.selectOption('#select-ccaa', 'ceuta');
    await rellenar(page, PRECIO, '450000');

    // a) La renuncia no se puede elegir en Ceuta, y el botón dice por qué.
    const renuncia = page.getByRole('button', { name: /2ª mano con renuncia/ });
    await expect(renuncia).toBeDisabled();
    await expect(renuncia).toContainText('No existe en el IPSI: paga ITP');
    await expect(renuncia).toHaveAttribute('aria-pressed', 'false');
    await expect(page.getByRole('button', { name: /Segunda mano/ })).toHaveAttribute('aria-pressed', 'true');
    // Ni IPSI sin calcular ni AJD: la segunda mano paga ITP, bonificado.
    await expect(page.locator('[class*="resultados"]').getByText('No calculado')).toHaveCount(0);
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);
    await expect(page.locator('h3', { hasText: /^IVA/ })).toHaveCount(0);
    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (3,00%)');
    expect(await valorTarjeta(page, 'ITP (')).toBe('13.500,00 €');
    // Nunca aparece el 21 % peninsular sobre 450.000 € (= 94.500 €).
    expect(await page.locator('body').innerText()).not.toContain('94.500');

    // 26/09/2026 (hallazgo 2214): en Canarias, Ceuta y Melilla la notaría y el registro van SIN
    // IVA —su factura lleva IGIC o IPSI, que la app no calcula y nombra junto al total—, así que
    // las dos líneas son las de antes ÷ 1,21 (el arancel × 1,75 y el arancel del registro).
    //   notaría 483,43341 × 1,75 = 846,008468 · registro 270,2272455
    //   total 13.500 + 846,01 + 270,23 + 500 = 15.116,24 → 3,3592 % → 3,36 % · coste 465.116,24
    // 17/10/2026 (cabo C0209): con la base del BOE y la rebaja del 5 % del nº 2.1, notaría
    //   483,435226 × 0,95 × 1,75 = 803,711064 · registro 261,212547 × 0,95 + 9,015182 = 257,167102
    //   → total 13.500 + 803,71 + 257,17 + 500 = 15.060,88 → 3,3469 % → 3,35 % · coste 465.060,88
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('803,71 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('257,17 €');
    // Parcial: a los honorarios les falta el IPSI (26/09/2026, tarde).
    expect(await rotuloTarjeta(page, /^Total gastos adicionales/)).toBe('Total gastos adicionales (parcial)');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('15.060,88 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toBe(`3,35% sobre el precio de compra${sinHonorarios('IPSI')}`);
    expect(await valorTarjeta(page, 'COSTE TOTAL (PARCIAL)')).toBe('465.060,88 €');

    // De vuelta en Madrid la elección del usuario se conserva: la renuncia vuelve a calcularse.
    // 450.000 × 21 % = 94.500 · AJD 450.000 × 0,75 % = 3.375
    await page.selectOption('#select-ccaa', 'madrid');
    await expect(renuncia).toBeEnabled();
    await expect(renuncia).toHaveAttribute('aria-pressed', 'true');
    expect(await valorTarjeta(page, 'IVA (renuncia')).toBe('94.500,00 €');
    expect(await valorTarjeta(page, 'AJD (')).toBe('3375,00 €');
    await page.selectOption('#select-ccaa', 'ceuta');

    // b) «1,2,3» → dos comas, que `partesNumericas` rechaza. Vuelve el marcador y nada más.
    const campo = page.locator('input[aria-label="' + PRECIO + '"]');
    await campo.fill('1,2,3');
    await campo.blur();
    await expect(page.getByText('Introduce el precio de la nave industrial para ver el desglose de gastos')).toBeVisible();
    await expect(page.locator('h3', { hasText: /^COSTE TOTAL/ })).toHaveCount(0);
    const cuerpo = await page.locator('body').innerText();
    expect(cuerpo).not.toContain('NaN');
    expect(cuerpo).not.toContain('No definido');
    expect(cuerpo).not.toContain('∞');
  });

  /**
   * Barrido de las 19 comunidades en segunda mano con el MISMO importe: comprueba que la
   * página llama a `calcularITP(precio, ccaa)` sin forzar tipo en ninguna —es decir, que a
   * ninguna nave se le cuela un tipo reducido de vivienda habitual— y que el rótulo del
   * tipo efectivo cuadra siempre con el importe que hay al lado.
   *
   * El valor esperado sale del propio módulo `data/itp-ccaa`, no de memoria: para las 12
   * comunidades sin escala es el tipo general; para las 7 con escala, el reparto por tramos;
   * y en Ceuta y Melilla, la mitad, por la bonificación del art. 57 bis.
   */
  test('Barrido — las 19 comunidades cobran el tipo GENERAL (ningún reducido de vivienda)', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();

    const PRECIO_BARRIDO = 700000;
    await rellenar(page, PRECIO, String(PRECIO_BARRIDO));

    for (const clave of Object.keys(ITP_CCAA) as (keyof typeof ITP_CCAA)[]) {
      const datos = ITP_CCAA[clave];
      // Cuota esperada, calculada aquí a partir de la tabla (no llamando a calcularITP):
      let cuota: number;
      if (datos.tramosProgresivos && datos.tramosProgresivos.length > 0) {
        let restante = PRECIO_BARRIDO;
        let anterior = 0;
        cuota = 0;
        for (const tramo of datos.tramosProgresivos) {
          const base = Math.min(restante, tramo.hasta - anterior);
          if (base <= 0) break;
          cuota += base * (tramo.tipo / 100);
          restante -= base;
          anterior = tramo.hasta;
        }
      } else {
        // El tipo de lo que NO es vivienda donde la comunidad lo declara aparte (24/09/2026,
        // hallazgo 1582: el País Vasco grava la vivienda al 4 % y el resto de inmuebles al 7 %;
        // hasta ese día este barrido leía `tipoGeneral` y consagraba el 4 % en la nave). A
        // 700.000 € ningún umbral (Valencia, por encima del millón) entra en juego.
        cuota = PRECIO_BARRIDO * ((datos.tipoGeneralNoVivienda ?? datos.tipoGeneral) / 100);
      }
      if (clave === 'ceuta' || clave === 'melilla') cuota *= 0.5;

      await page.selectOption('#select-ccaa', clave);

      const esperado = cuota.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' }).replace(/\s+/g, ' ');
      expect(await valorTarjeta(page, 'ITP ('), `ITP de ${datos.nombre}`).toBe(esperado);

      // Y el rótulo lleva el tipo EFECTIVO, que es cuota/precio y no el nominal de la tabla.
      const efectivo = ((cuota / PRECIO_BARRIDO) * 100).toLocaleString('es-ES', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      expect(await rotuloTarjeta(page, /^ITP \(/), `rótulo de ${datos.nombre}`).toBe(`ITP (${efectivo}%)`);
    }
  });

  /**
   * El IVA de una nave en primera entrega es el GENERAL (21 %, `IVA_INMUEBLES_2025.local`),
   * nunca el reducido del 10 % de vivienda nueva (`IVA_INMUEBLES_2025.obraNueva`): una nave
   * industrial no es un inmueble residencial y no puede acogerse a él en ningún caso.
   */
  test('Obra nueva — el IVA de la nave es el general, no el reducido de vivienda', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Obra nueva/ }).click();
    await page.selectOption('#select-ccaa', 'murcia');
    await rellenar(page, PRECIO, '350000');

    expect(IVA_INMUEBLES_2025.local).toBe(21);
    expect(IVA_INMUEBLES_2025.obraNueva).toBe(10);
    // 350.000 × 21 % = 73.500 (con el 10 % de vivienda serían 35.000)
    expect(await rotuloTarjeta(page, /^IVA \(/)).toBe('IVA (21,00%)');
    expect(await valorTarjeta(page, 'IVA (')).toBe('73.500,00 €');
    // AJD Murcia = 350.000 × 1,5 % = 5.250
    expect(await valorTarjeta(page, 'AJD (')).toBe('5250,00 €');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// REGRESIÓN — los seis hallazgos de la re-inspección del 07/09/2026 (646-651), REPARADOS
// el 09/09/2026. Estaban escritos con `test.fail()` afirmando lo que DEBERÍA ocurrir; al
// cerrarse han perdido la marca y ahora sujetan la reparación, igual que se hizo con los
// hallazgos 156-166, 490-493 y 600-604.
//
// Qué se tocó en cada uno (solo `page.tsx`, `metadata.ts` y el `.module.css` de la app):
//  · 646 — `metadata.ts` gana `sueloDe()`, simétrico de `techoDe()`, y ordena el ranking por
//    el tipo EFECTIVO; el 6 % de Ceuta y Melilla sale ya bonificado al 3 %.
//  · 647 — los dos `role="note"` de transmisión miran `TERRITORIOS_SIN_IVA` y dicen lo que
//    corresponde en Canarias, Ceuta y Melilla, como ya hacía el rótulo del botón.
//  · 648 — las celdas de respuesta de la tabla comparativa pasan a `.celdaSi` / `.celdaNo`
//    del módulo CSS, con pareja clara y oscura medidas contra los dos fondos que llegan a
//    tener. Los tokens globales `--success` / `--error` NO servían: 2,66:1 en claro.
//  · 649 — los 14 `#e0e0e0` en línea pasan a `var(--border)`, que ya cambia con el tema.
//  · 650 — el 50 % se deriva de `BONIFICACION_CUOTA_CEUTA_MELILLA` en los siete sitios.
//  · 651 — el rango de ITP del bloque educativo usa `formatTipoNominal`, como el recuadro de
//    la comunidad. El `<DataReference>` no se tocó: su nota viene sellada de `data/fiscal` y
//    ya escribía «4%» y «13%», que es justo el formato al que se ha llevado el otro.
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Regresión — hallazgos del 07/09/2026, reparados', () => {
  /**
   * HALLAZGO 1 (dato, medio) — el SUELO del ranking de la quinta pregunta del FAQPage ignora
   * la bonificación que el motor SÍ aplica. Es el defecto SIMÉTRICO del hallazgo C del
   * 27/08/2026, que corrigió el TECHO derivándolo de las escalas progresivas (`techoDe`) y
   * dejó el suelo en `tipoGeneral` a secas.
   *
   * El JSON-LD responde a «¿Qué comunidad autónoma tiene el ITP más bajo para la compra de
   * una nave?» con «Los más bajos hoy son País Vasco (4%), Comunidad de Madrid (6%),
   * Comunidad Foral de Navarra (6%)» — mientras la propia app, con Ceuta seleccionada y
   * 500.000 €, rotula «ITP (3,00%)» y cobra 15.000 €. El más bajo para una nave es Ceuta o
   * Melilla, no el País Vasco, y la frase que lo desmiente está en el mismo párrafo («En
   * Ceuta y Melilla la cuota se bonifica al 50%»), lo que la deja contradiciéndose sola.
   *
   * Importa porque es el bloque que consumen Bing Copilot, ChatGPT y Perplexity para
   * responder exactamente esa pregunta.
   *
   * REPARADO el 09/09/2026: `metadata.ts` tiene ahora `sueloDe()`, simétrico de `techoDe()`,
   * y ordena el ranking por el tipo EFECTIVO (el primer tramo de la escala si la hay, con la
   * bonificación descontada donde la hay).
   */
  test('REPARADO 646 — el ranking del FAQPage encabeza con el 3 % efectivo de Ceuta y Melilla', async ({ page }) => {
    await page.goto(RUTA);

    // Lo que la app cobra de verdad en Ceuta: 500.000 × 6 % × 0,5 = 15.000 → 3,00 %.
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await page.selectOption('#select-ccaa', 'ceuta');
    await rellenar(page, PRECIO, '500000');
    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (3,00%)');

    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = bloques.find((b) => b.includes('FAQPage')) ?? '';
    expect(faq).toContain('¿Qué comunidad autónoma tiene el ITP más bajo');
    // El País Vasco ya no encabeza el ranking…
    expect(faq).not.toMatch(/Los más bajos hoy son País Vasco \(4%\)/);
    // …y el suelo que se sirve es el mismo 3 % que la pantalla acaba de rotular, DERIVADO de
    // ITP_CCAA['ceuta'].tipoGeneral (6) y BONIFICACION_CUOTA_CEUTA_MELILLA (0,5).
    const efectivoCeuta = ITP_CCAA['ceuta'].tipoGeneral * (1 - BONIFICACION_CUOTA_CEUTA_MELILLA);
    expect(efectivoCeuta).toBe(3);
    expect(faq).toContain(`${ITP_CCAA['ceuta'].nombre} (${String(efectivoCeuta)}\u00A0% efectivo`);
    expect(faq).toContain(`${ITP_CCAA['melilla'].nombre} (${String(efectivoCeuta)}\u00A0% efectivo`);
  });

  /**
   * HALLAZGO 2 (contenido, medio) — el aviso que hay bajo los botones de transmisión habla de
   * un IVA que en Canarias, Ceuta y Melilla no existe.
   *
   * Es el hallazgo 490 una línea más abajo: allí se corrigió el RÓTULO del botón —que ya dice
   * «Paga IPSI + AJD»— pero no el `role="note"` que lo acompaña. Con Ceuta y «2ª mano con
   * renuncia al IVA» seleccionados, la pantalla dice a la vez:
   *   · botón: «🤝 2ª mano con renuncia al IVA · Paga IPSI + AJD»
   *   · tarjeta: «IPSI · No calculado · En Ciudad Autónoma de Ceuta no rige el IVA…»
   *   · aviso:  «Con renuncia a la exención el IVA no se paga al vendedor: lo autoliquida el
   *              comprador (inversión del sujeto pasivo), y suele ser deducible si tu
   *              actividad está sujeta a IVA.»
   * Y en «Segunda mano», el otro aviso remata «la operación vuelve al IVA … Si es tu caso,
   * usa la tercera opción», que en esos tres territorios no ocurre: la tercera opción no
   * devuelve ningún IVA. El público declarado de la app son empresas y autónomos, para los
   * que la renuncia es el caso frecuente, así que el consejo se lee y se sigue.
   *
   * REPARADO el 09/09/2026: los dos avisos miran `TERRITORIOS_SIN_IVA` y nombran el impuesto
   * que sí rige (IGIC en Canarias, IPSI en Ceuta y Melilla), igual que el rótulo del botón
   * desde la reparación del hallazgo 490. En el resto de España el texto no cambia.
   */
  test('REPARADO 647 — en Ceuta los dos avisos hablan del IPSI, no de un IVA que no se devenga', async ({ page }) => {
    await page.goto(RUTA);
    await page.selectOption('#select-ccaa', 'ceuta');
    await rellenar(page, PRECIO, '450000');

    // ⚠️ 24/09/2026 (hallazgo 1584): en Ceuta ya no se puede elegir la renuncia —el IPSI no la
    // tiene (Ley 8/1991, arts. 7 y 20.3)—, así que la mitad de este test que pulsaba el botón y
    // leía «IPSI · No calculado» consagraba el cálculo de una renuncia inexistente. Queda la
    // mitad que sigue siendo cierta: ningún aviso describe un IVA que allí no se devenga.
    await expect(page.getByRole('button', { name: /2ª mano con renuncia/ })).toBeDisabled();

    // En «Segunda mano», el aviso no invita a una tercera opción que allí no existe.
    const avisoSegundaMano = (await page.locator('[class*="avisoRenuncia"]').first().innerText()).replace(/\s+/g, ' ');
    expect(avisoSegundaMano, 'en Ceuta la tercera opción no devuelve la operación al IVA').not.toContain(
      'la operación vuelve al IVA'
    );
    expect(avisoSegundaMano, 'ni describe un IVA autoliquidado').not.toContain('lo autoliquida el comprador');
    expect(avisoSegundaMano).toContain('IPSI');
    expect(avisoSegundaMano).toContain('no existe la renuncia a la exención');

    // En Canarias, el mismo aviso nombra el IGIC (TERRITORIOS_SIN_IVA.canarias)… y allí la
    // renuncia SÍ existe, a la exención del IGIC (art. 50.Cinco Ley canaria 4/2012).
    await page.selectOption('#select-ccaa', 'canarias');
    const avisoCanarias = (await page.locator('[class*="avisoRenuncia"]').first().innerText()).replace(/\s+/g, ' ');
    expect(avisoCanarias).toContain('IGIC');
    expect(avisoCanarias).toContain('art. 50.Cinco');

    // Y donde el IVA SÍ rige, el consejo útil sigue estando: la reparación no lo ha borrado.
    await page.selectOption('#select-ccaa', 'madrid');
    const avisoMadrid = (await page.locator('[class*="avisoRenuncia"]').first().innerText()).replace(/\s+/g, ' ');
    expect(avisoMadrid).toContain('la operación vuelve al IVA');
  });

  /**
   * HALLAZGO 3 (accesibilidad, medio) — la tabla comparativa del bloque educativo pinta sus
   * celdas de respuesta con dos literales hexadecimales (`#c0392b` rojo y `#27ae60` verde)
   * que no tienen variante de tema, y ninguno de los dos llega al 4,5:1 que exige la
   * WCAG 2.1 AA para texto normal en el tema donde le toca perder:
   *   · modo OSCURO: «No aplican» → 2,16:1 sobre rgb(56,56,56) · «No» → 3,20:1 sobre rgb(26,26,26)
   *   · modo CLARO:  «Sí (jóvenes, familia numerosa…)» → 2,64:1 · «Sí (si actividad sujeta a IVA)» → 2,75:1
   * Son justo las celdas que contestan la pregunta que la tabla existe para contestar
   * («¿tiene una nave tipos reducidos de ITP?»), y el color hace ahí trabajo informativo.
   *
   * REPARADO el 09/09/2026: las celdas usan `.celdaSi` / `.celdaNo` del módulo CSS, con pareja
   * clara y oscura medidas contra los DOS fondos que la tabla llega a tener en cada tema (el
   * de `EducationalSection` y el `--bg-primary` de las filas alternas). Los tokens globales
   * `--success` / `--error` no valían: #4CAF50 sobre el #F5F5F5 de la sección da 2,66:1.
   */
  test('REPARADO 648 — el rojo y el verde de la tabla comparativa llegan a 4,5:1 en los dos temas', async ({ page }) => {
    await page.goto(RUTA);
    // El bloque educativo vive en el DOM aunque esté plegado (igual que en las tandas
    // anteriores), así que sus estilos y su texto se pueden leer sin desplegarlo.

    const peorRatio = async (): Promise<number> =>
      page.evaluate(() => {
        const canal = (c: number) => {
          const s = c / 255;
          return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
        };
        const lum = (p: number[]) => 0.2126 * canal(p[0]) + 0.7152 * canal(p[1]) + 0.0722 * canal(p[2]);
        const rgb = (s: string) => (s.match(/\d+(\.\d+)?/g) ?? []).map(Number);
        const fondoDe = (el: Element | null): number[] => {
          let n: Element | null = el;
          while (n) {
            const p = rgb(getComputedStyle(n).backgroundColor);
            if (p.length >= 3 && (p.length < 4 || p[3] > 0)) return p.slice(0, 3);
            n = n.parentElement;
          }
          return [255, 255, 255];
        };
        let peor = 21;
        for (const td of Array.from(document.querySelectorAll('table td'))) {
          const txt = (td as HTMLElement).innerText.replace(/\s+/g, ' ').trim();
          if (!/^No aplican$|^No$|^Sí \(/.test(txt)) continue;
          const fg = rgb(getComputedStyle(td).color).slice(0, 3);
          const bg = fondoDe(td);
          const a = Math.max(lum(fg), lum(bg));
          const b = Math.min(lum(fg), lum(bg));
          peor = Math.min(peor, (a + 0.05) / (b + 0.05));
        }
        return Math.round(peor * 100) / 100;
      });

    const claro = await esperarEstable(peorRatio);
    await activarTemaOscuro(page);
    const oscuro = await esperarEstable(peorRatio);

    // Antes de la reparación: claro 2,64 · oscuro 2,16.
    expect(claro, 'peor contraste de la tabla en modo claro').toBeGreaterThanOrEqual(4.5);
    expect(oscuro, 'peor contraste de la tabla en modo oscuro').toBeGreaterThanOrEqual(4.5);

    // Y el color no puede volver a ser el ÚNICO portador del dato: la respuesta sigue estando
    // escrita en palabras en las cuatro celdas, que es lo que la lee sin ver el color.
    const respuestas = await page.evaluate(() =>
      Array.from(document.querySelectorAll('table td'))
        .map((td) => (td.textContent ?? '').replace(/\s+/g, ' ').trim())
        .filter((t) => /^No por perfil|^No$|^Sí /.test(t))
    );
    // «No aplican» pasó a «No por perfil del comprador; alguna comunidad…» (hallazgo 2914)
    expect(respuestas.filter((t) => t.startsWith('No por perfil del comprador'))).toHaveLength(1);
    expect(respuestas.filter((t) => t === 'No')).toHaveLength(1);
    expect(respuestas.some((t) => t.startsWith('Sí (jóvenes'))).toBe(true);
    // Texto de la celda desde el hallazgo 3264 (19/10/2026): «sujeta y no exenta».
    expect(respuestas.some((t) => t.startsWith('Sí (si actividad sujeta y no exenta de IVA'))).toBe(true);
  });

  /**
   * HALLAZGO 4 (accesibilidad, bajo) — el bloque educativo lleva `border: 1px solid #e0e0e0`
   * escrito en línea en 14 elementos (las 4 tarjetas de «Casos de uso», las 4 de «Consejos» y
   * 6 celdas de la tabla). En modo oscuro esos bordes siguen siendo rgb(224,224,224) sobre
   * tarjetas rgb(45,45,45): un filete casi blanco alrededor de cada tarjeta. El CLAUDE.md
   * global §6 pide variante oscura en cada elemento; el resto de la página sí usa tokens
   * (`var(--bg-card)`, `var(--primary)`) y por eso cambia sola.
   *
   * REPARADO el 09/09/2026: los 14 pasan a `var(--border)` (#E5E5E5 en claro, #404040 en
   * oscuro), que es el token que el resto de la página ya usaba.
   */
  test('REPARADO 649 — no quedan bordes #e0e0e0 en el bloque educativo en modo oscuro', async ({ page }) => {
    await page.goto(RUTA);
    // El bloque educativo vive en el DOM aunque esté plegado (igual que en las tandas
    // anteriores), así que sus estilos y su texto se pueden leer sin desplegarlo.

    await activarTemaOscuro(page);

    const contarBordesClaros = () =>
      page.evaluate(() => {
        let n = 0;
        for (const el of Array.from(document.querySelectorAll('div,td'))) {
          const cs = getComputedStyle(el);
          for (const lado of ['Top', 'Bottom', 'Left', 'Right']) {
            if (
              cs.getPropertyValue(`border-${lado.toLowerCase()}-width`) !== '0px' &&
              cs.getPropertyValue(`border-${lado.toLowerCase()}-color`) === 'rgb(224, 224, 224)'
            ) {
              n++;
              break;
            }
          }
        }
        return n;
      });

    const claros = await esperarEstable(contarBordesClaros);

    // Antes de la reparación: 14.
    expect(claros, 'elementos con borde #e0e0e0 en modo oscuro').toBe(0);
    // Y tampoco pueden volver a aparecer en el fuente, que es donde se escriben.
    expect(await leerFuente()).not.toContain('#e0e0e0');
  });

  /**
   * HALLAZGO 5 (dato, bajo) — el 50 % de la bonificación de Ceuta y Melilla va escrito a mano
   * cinco veces en `page.tsx` (recuadro de la comunidad, descripción de la tarjeta de ITP,
   * descripción de la tarjeta de AJD, caso de uso del autónomo y FAQ de tipos) y dos más en
   * `metadata.ts`, existiendo `BONIFICACION_CUOTA_CEUTA_MELILLA = 0.5` exportado por
   * `data/itp-ccaa.ts` — el mismo módulo del que la página ya importa `CIUDADES_CON_BONIFICACION`.
   *
   * Es el patrón exacto del hallazgo D del 27/08/2026 (el «21 %» y el «19-30 %» escritos a
   * mano teniendo la constante al lado): hoy los números coinciden, así que no hay error de
   * importe; lo que hay es la divergencia-en-silencio garantizada para el día que cambien.
   *
   * REPARADO el 09/09/2026: los siete salen de la constante — `page.tsx` la formatea una vez
   * en `BONIFICACION_CIUDADES` y `metadata.ts` en `BONIFICACION_PCT`.
   */
  test('REPARADO 650 — el 50 % de la bonificación se deriva de la constante del motor', async () => {
    const fuente = await leerFuente();
    const meta = await leerMetadata();
    expect(BONIFICACION_CUOTA_CEUTA_MELILLA).toBe(0.5);

    // Solo el texto que se VE: se descartan las líneas de comentario, donde explicar el
    // 50 % es legítimo y no puede divergir de nada.
    const esComentario = (l: string) => {
      const t = l.trim();
      return t.startsWith('//') || t.startsWith('*') || t.startsWith('/*');
    };
    const literales = [...fuente.split('\n'), ...meta.split('\n')].filter(
      (l) => !esComentario(l) && /50 ?%/.test(l)
    );
    // Antes de la reparación: 5 en page.tsx + 2 en metadata.ts, sin importar la constante.
    expect(literales.length, 'literales del 50 % teniendo la constante importable').toBe(0);
    // Y los dos ficheros la importan de verdad, que es lo que impide la divergencia.
    expect(fuente).toContain('BONIFICACION_CUOTA_CEUTA_MELILLA');
    expect(meta).toContain('BONIFICACION_CUOTA_CEUTA_MELILLA');
  });

  /**
   * HALLAZGO 6 (contenido, bajo) — el bloque educativo rotula el rango de ITP con
   * `formatNumber(RANGO_ITP.min, 2)`, así que dice «del 4,00% al 13,00%», mientras el
   * recuadro de la comunidad de la misma página usa `formatTipoNominal` y dice «ITP General
   * 6%» o «7,75%». Un tipo NOMINAL con dos decimales forzados es exactamente el ruido para
   * el que se creó `formatTipoNominal` (hallazgo 331), función que esta página ya importa y
   * usa tres veces. De paso, el `<DataReference>` de arriba escribe «del 4% (País Vasco)»:
   * el mismo número, con dos formatos, a dos pantallas de distancia.
   *
   * REPARADO el 09/09/2026: el bloque educativo pasa a `formatTipoNominal`. El
   * `<DataReference>` NO se tocó a propósito: su nota viene sellada de `FISCAL_INMUEBLES_META`
   * (data/fiscal, con su fecha de verificación) y ya escribía «4%» y «13%» — es el formato al
   * que se ha llevado el otro, no el que había que cambiar.
   */
  test('REPARADO 651 — el rango de ITP se rotula sin decimales forzados, igual que el resto de la página', async ({ page }) => {
    await page.goto(RUTA);
    // El bloque educativo vive en el DOM aunque esté plegado (igual que en las tandas
    // anteriores), así que sus estilos y su texto se pueden leer sin desplegarlo.

    // ⚠️ 24/09/2026 (hallazgo 1582): el rango es el de lo que NO es vivienda (6 – 13). Hasta ese
    // día era 4 – 13, con el 4 % de la vivienda vasca como suelo, y este test lo fijaba —también
    // en la nota del <DataReference>, que hoy es propia de la app y dice lo que paga una nave—.
    expect(RANGO_ITP_OTROS.min).toBe(6);
    expect(RANGO_ITP_OTROS.max).toBe(13);
    // `textContent` y no `innerText`: el bloque está plegado y no se renderiza como texto.
    const guia = pegarPct(((await page.locator('body').textContent()) ?? '').replace(/\s+/g, ' '));
    // Antes de la reparación: «que hoy va del 4,00% al 13,00%».
    expect(guia).not.toContain('del 4,00% al 13,00%');
    expect(guia).not.toContain('del 6,00% al 13,00%');
    // Los dos extremos, DERIVADOS del motor y sin decimales forzados.
    expect(guia).toContain(`del ${String(RANGO_ITP_OTROS.min)}% al ${String(RANGO_ITP_OTROS.max)}%`);
    // …y el mismo rango, con el mismo formato, en la nota del <DataReference> de cabecera.
    expect(guia).toContain(`El ITP de una nave va del ${String(RANGO_ITP_OTROS.min)}% al ${String(RANGO_ITP_OTROS.max)}%`);
    expect(guia).not.toContain('del 4% (País Vasco');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN — 10/09/2026 (Opus 5)
//
// Antes de escribir nada se ejecutó el fichero entero: 56/56 en verde y ningún `test.fail()`
// pendiente, así que todo lo reparado el 23/08, 27/08, 28/08, 02/09 y 09/09 sigue cerrado.
// El refactor de motores del 10/09 (commits 3a507acb y 1808419c) NO tocó esta app: no está
// entre las cinco que calculaban por su cuenta, y sus dependencias —`data/itp-ccaa.ts` y
// `data/fiscal/inmuebles.ts`— siguen en el commit 579b3a05 del 09/09.
//
// PISTA DE EFECTO FAMILIA (garaje / estimador: «Años de propiedad» con `min={1}` y
// `parseInt(x) || 0`, que hace inalcanzable el coeficiente 0,14 de COEFICIENTES_IIVTNU_2025):
// NO APLICA AQUÍ, y no por estar reparada sino porque el defecto no tiene dónde ocurrir —
// esta app no tiene parte de vendedor. Se comprueba abajo, en «efecto familia», para que si
// alguien le añade un día la plusvalía municipal, el test lo cace en vez de callar.
//
// De dónde sale CADA cifra esperada de esta tanda (ninguna de memoria):
//  - Escala de Asturias (8 % hasta 300.000 · 9 % hasta 500.000 · 10 % después) y de
//    Castilla y León (8 % hasta 250.000 · 10 % después) → `ITP_CCAA` en `data/itp-ccaa.ts`.
//    Son las DOS únicas de las siete comunidades con escala progresiva que ninguna vuelta
//    anterior había pisado (Aragón, Baleares, Cataluña, Valencia y Extremadura ya estaban).
//  - Tipo general de Baleares (8 %) y de Canarias (6,5 %) → `TIPOS_ITP_CCAA_2025` en
//    `data/fiscal/inmuebles.ts`, vía `tipoGeneralDe()`.
//  - Tipos REDUCIDOS que NO pueden aplicarse a una nave → `ITP_CCAA[x].tiposReducidos`
//    (Baleares: 0 % para menores de 30 y 4 % de vivienda habitual, ambos con techo de
//    270.151 € · Canarias: 5 % de vivienda habitual con techo de 150.000 €). El caso de
//    rechazo compra POR DEBAJO de esos techos, que es donde un motor que mirase solo el
//    valor —y no el uso del inmueble— se los concedería.
//  - Aranceles → `ARANCELES_NOTARIO` (RD 1426/1989) y `ARANCELES_REGISTRO` (RD 1427/1989),
//    con `FACTURA_NOTARIAL` (×1,5 a ×2, punto medio ×1,75) y `REGISTRO_CONCEPTOS`
//    (presentación 6,010121 € + nota simple 3,005061 €). El 21 % de IVA va dentro.
//
// Los tres casos se resolvieron a mano ANTES de abrir el navegador; el desarrollo va
// comentado junto a cada aserción, con los importes sin redondear.
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Peor contraste de un conjunto de elementos, COMPONIENDO los fondos translúcidos.
 *
 * ⚠️ No vale quedarse con el primer `backgroundColor` que no sea transparente, que es lo que
 * hace el medidor de `REPARADO 648`: allí los fondos son tokens opacos y da igual, pero esta
 * página pinta el botón de transmisión activo y el aviso de la renuncia con
 * `rgba(46, 134, 171, 0.08)`. Leído como si fuese el azul opaco, el subtítulo «Paga ITP (tipo
 * general)» sale a 1,40:1 —un fallo gravísimo— cuando en pantalla ese botón es casi blanco y
 * el texto pasa de sobra. Es un falso positivo que se comió la primera medición del 10/09.
 */
async function peorContrasteDe(page: Page, selector: string): Promise<{ ratio: number; texto: string }> {
  return page.evaluate((sel) => {
    const canal = (c: number) => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    const lum = (p: number[]) => 0.2126 * canal(p[0]) + 0.7152 * canal(p[1]) + 0.0722 * canal(p[2]);
    const rgba = (s: string) => {
      const n = (s.match(/[\d.]+/g) ?? []).map(Number);
      return n.length < 3 ? null : { r: n[0], g: n[1], b: n[2], a: n.length > 3 ? n[3] : 1 };
    };
    const fondoDe = (el: Element): number[] => {
      const capas: { r: number; g: number; b: number; a: number }[] = [];
      let n: Element | null = el;
      while (n) {
        const c = rgba(getComputedStyle(n).backgroundColor);
        if (c && c.a > 0) {
          capas.push(c);
          if (c.a >= 1) break;
        }
        n = n.parentElement;
      }
      let base = [255, 255, 255];
      for (let i = capas.length - 1; i >= 0; i--) {
        const c = capas[i];
        base = [
          c.r * c.a + base[0] * (1 - c.a),
          c.g * c.a + base[1] * (1 - c.a),
          c.b * c.a + base[2] * (1 - c.a),
        ];
      }
      return base;
    };
    let peor = { ratio: 21, texto: '' };
    for (const el of Array.from(document.querySelectorAll(sel))) {
      const propio = Array.from(el.childNodes).some(
        (n) => n.nodeType === 3 && (n.textContent ?? '').trim().length > 1
      );
      if (!propio) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none') continue;
      const bg = fondoDe(el);
      const f = rgba(cs.color)!;
      const fg = [
        f.r * f.a + bg[0] * (1 - f.a),
        f.g * f.a + bg[1] * (1 - f.a),
        f.b * f.a + bg[2] * (1 - f.a),
      ];
      const a = Math.max(lum(fg), lum(bg));
      const b = Math.min(lum(fg), lum(bg));
      const ratio = Math.round(((a + 0.05) / (b + 0.05)) * 100) / 100;
      if (ratio < peor.ratio) {
        peor = { ratio, texto: (el.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 60) };
      }
    }
    return peor;
  }, selector);
}

test.describe('Re-inspección 10/09/2026 — tres casos nuevos', () => {
  /**
   * CASO 1 (NORMAL) — Asturias, segunda mano, 750.000 €, gestoría 500 €.
   *
   * Asturias es una de las dos escalas progresivas que ninguna vuelta anterior había
   * probado, y la única de TRES tramos con los dos cortes por debajo del precio: a 750.000 €
   * la nave cruza los dos (300.000 y 500.000), así que el importe no puede salir de ningún
   * tipo plano. `ITP_CCAA['asturias'].tramosProgresivos` = 8 % hasta 300.000, 9 % hasta
   * 500.000, 10 % después.
   *
   * A mano:
   *   ITP = 300.000 × 8 % + 200.000 × 9 % + 250.000 × 10 %
   *       = 24.000 + 18.000 + 25.000                                   =  67.000,00
   *   tipo efectivo = 67.000 / 750.000                                 =       8,9333 % → «8,93%»
   *   AJD = 0 (segunda mano sin renuncia: no hay cuota gradual)
   *   Notaría: escala = 90,151816 + 24.040,49×0,45 % (108,182205)
   *            + 30.050,60×0,15 % (45,0759) + 90.151,82×0,10 % (90,15182)
   *            + 450.759,07×0,05 % (225,379535)                        = 558,941276 (hasta 601.012,10)
   *            + (750.000 − 601.012,10) × 0,03 % = 44,69637            = 603,637646
   *            × 0,95 (rebaja del nº 2.1, 17/10/2026, cabo C0209)      = 573,455764
   *            × 1,21 = 693,881474
   *            × 1,5 = 1.040,822211 (min) · × 2 = 1.387,762948 (max)
   *            punto medio × 1,75                                      =  1.214,292580
   *   Registro: 24,040484 + 42,0708575 + 37,56325 + 67,613865
   *            + 450.759,07×0,030 % (135,227721)                       = 306,516178
   *            + (750.000 − 601.012,10) × 0,020 % = 29,79758           = 336,313758
   *            × 0,95 = 319,498070 + 9,015182 = 328,513252 · × 1,21    =    397,501035
   *   Total gastos (líneas ya redondeadas)
   *            = 67.000 + 1.214,29 + 397,50 + 500                      =  69.111,79
   *   % sobre el precio = 69.111,79 / 750.000                          =       9,2149 % → «9,21%»
   *   Total operación                                                  = 819.111,79
   *   (sin la rebaja: 1.278,20 · 1.095,60–1.460,80 · 417,85 · 69.196,05)
   */
  test('CASO 1 (normal) — Asturias, segunda mano, 750.000 €: la escala 8/9/10 cruza SUS DOS cortes', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await page.selectOption('#select-ccaa', 'asturias');
    await rellenar(page, PRECIO, '750000');
    await rellenar(page, GESTORIA, '500');

    // La escala la manda data/itp-ccaa, no este test.
    expect(ITP_CCAA['asturias'].tramosProgresivos?.map((t) => t.tipo)).toEqual([8, 9, 10]);
    await expect(page.getByText(/escala progresiva \(8\s% → 9\s% → 10\s%\)/)).toBeVisible();

    expect(await valorTarjeta(page, 'Precio de la nave industrial')).toBe('750.000,00 €');
    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (8,93%)');
    expect(await valorTarjeta(page, 'ITP (')).toBe('67.000,00 €');
    // Ningún tipo plano de la escala da esta cifra: 8 % → 60.000, 9 % → 67.500, 10 % → 75.000.
    // El 9 % es el que más se le parece, y por eso el caso lo nombra.
    await expect(page.getByText('67.500,00 €')).toHaveCount(0);
    await expect(page.getByText('60.000,00 €')).toHaveCount(0);
    // Segunda mano sin renuncia: ITP y AJD son incompatibles.
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);

    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('1214,29 €');
    const notaria = await descripcionTarjeta(page, 'Gastos de notaría');
    expect(notaria).toContain('1040,82 €');
    expect(notaria).toContain('1387,76 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('397,50 €');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('500,00 €');

    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('69.111,79 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('9,21% sobre el precio');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('819.111,79 €');
  });

  /**
   * CASO 2 (LÍMITE) — Castilla y León, segunda mano, 601.012,10 € exactos.
   *
   * Frontera TRIPLE en un solo importe, y ninguna de las tres estaba probada junta:
   *  · 601.012,10 € es el último corte del tramo 6 de `ARANCELES_NOTARIO` (0,03 %) y del
   *    tramo 5 de `ARANCELES_REGISTRO` (0,030 %). El bucle tiene que parar ahí —`valor <=
   *    limiteAnterior` → break— sin abrir el tramo siguiente con un exceso de cero euros.
   *  · Castilla y León es la otra escala progresiva sin estrenar (8 % hasta 250.000, 10 %
   *    después) y el precio la cruza, así que el nominal de la tabla (8 %) y el efectivo
   *    dejan de coincidir.
   *  · El importe se teclea en formato español con los DOS separadores («601.012,10»), donde
   *    manda el último como decimal.
   *
   * A mano (gestoría 500 €):
   *   ITP = 250.000 × 8 % + 351.012,10 × 10 % = 20.000 + 35.101,21     =  55.101,21
   *   tipo efectivo = 55.101,21 / 601.012,10                           =       9,1681 % → «9,17%»
   *   Notaría: escala = 558,941276 EXACTO (el tramo 7 no llega a abrirse; base del BOE 90,151816)
   *            × 0,95 (rebaja del nº 2.1, 17/10/2026, cabo C0209)      = 530,994212
   *            × 1,21 = 642,502997
   *            × 1,5 = 963,754496 (min) · × 2 = 1.285,005994 (max)
   *            punto medio × 1,75                                      =  1.124,380245
   *   Registro: 306,516178 EXACTO (ídem, y muy por debajo del tope 2.181,673939)
   *            × 0,95 = 291,190369 + 9,015182 = 300,205551 · × 1,21    =    363,248717
   *   Total gastos = 55.101,21 + 1.124,38 + 363,25 + 500               =  57.088,84
   *   % sobre el precio = 57.088,84 / 601.012,10                       =       9,4988 % → «9,50%»
   *   Total operación                                                  = 658.100,94
   *   (sin la rebaja: 1.183,55 · 1.014,48–1.352,63 · 381,79 · 57.166,55)
   */
  test('CASO 2 (límite) — Castilla y León, 601.012,10 € exactos: el corte compartido de los dos aranceles', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await page.selectOption('#select-ccaa', 'castilla-leon');
    await rellenar(page, PRECIO, '601.012,10');
    await rellenar(page, GESTORIA, '500');

    expect(ITP_CCAA['castilla-leon'].tramosProgresivos?.map((t) => t.tipo)).toEqual([8, 10]);
    // Los dos separadores del formato español llegan enteros al motor.
    expect(await valorTarjeta(page, 'Precio de la nave industrial')).toBe('601.012,10 €');
    await expect(page.getByText(/escala progresiva \(8\s% → 10\s%\)/)).toBeVisible();

    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (9,17%)');
    expect(await valorTarjeta(page, 'ITP (')).toBe('55.101,21 €');
    // Tipos planos descartados: 8 % → 48.080,97 · 10 % → 60.101,21.
    await expect(page.getByText('48.080,97 €')).toHaveCount(0);
    await expect(page.getByText('60.101,21 €')).toHaveCount(0);

    // Frontera de los aranceles: ni un céntimo del tramo siguiente.
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('1124,38 €');
    const notaria = await descripcionTarjeta(page, 'Gastos de notaría');
    expect(notaria).toContain('963,75 €');
    expect(notaria).toContain('1285,01 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('363,25 €');

    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('57.088,84 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('9,50% sobre el precio');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('658.100,94 €');
  });

  /**
   * CASO 3 (RECHAZO) — lo que la app tiene que NEGARSE a aplicar.
   *
   * Los rechazos probados hasta hoy eran todos de ENTRADA (0, negativo, vacío, «1.2.3»,
   * «1,2,3»). Falta el rechazo que de verdad importa en una app fiscal: el del tipo REDUCIDO.
   * El «Barrido» del 07/09 comprueba las 19 comunidades con un solo precio (700.000 €), que
   * está por encima de todos los techos de los reducidos y, por tanto, no puede distinguir
   * «la app no los aplica» de «no cabían». Este caso compra DEBAJO del techo:
   *
   *  a) Baleares, 250.000 € — por debajo de los 270.151 € que `ITP_CCAA['baleares']
   *     .tiposReducidos` fija como techo del 0 % (menores de 30 o discapacidad ≥33 %),
   *     del 4 % (vivienda habitual) y del 5 % (familia numerosa / VPO). Todos exigen
   *     VIVIENDA, así que a una nave le corresponde el primer tramo de la escala, el 8 %:
   *       ITP = 250.000 × 8 %                                          =  20.000,00
   *       (con el 4 % serían 10.000 €, con el 5 % 12.500 € y con el 0 % ninguno)
   *       Notaría: arancel = 333,559925 + 99.746,97 × 0,05 % (49,873485) = 383,43341
   *                × 1,21 = 463,9544261 · medio × 1,75                 =    811,9202457
   *                (min 695,9316392 · max 927,9088522)
   *       Registro: 171,2879725 + 99.746,97 × 0,030 % (29,924091)      = 201,2120635
   *                + 9,015182 = 210,2272455 · × 1,21                   =    254,3749671
   *       Total gastos = 20.000 + 811,92 + 254,37 + 500                =  21.566,29
   *       % sobre el precio                                            =       8,6265 % → «8,63%»
   *       Total operación                                              = 271.566,29
   *
   *  b) Canarias, 140.000 € — por debajo de los 150.000 € del 5 % de vivienda habitual.
   *       ITP = 140.000 × 6,5 % (TIPOS_ITP_CCAA_2025)                  =   9.100,00
   *       (con el 5 % serían 7.000 € y con el 1 % de familia numerosa 1.400 €)
   *
   *  c) Y un rechazo de entrada que tampoco estaba: un precio de 320 dígitos. `parseFloat`
   *     lo desborda a Infinito y `parseSpanishNumber` devuelve NaN por su guarda
   *     `Number.isFinite`. Es la única rama de la guarda del `useMemo` que ninguna vuelta
   *     había ejercitado: las anteriores entraban siempre por NaN o por «≤ 0».
   */
  test('CASO 3 (rechazo) — ningún tipo reducido de vivienda alcanza a una nave, ni bajo su techo', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();

    // a) Baleares, 250.000 € — bajo el techo de los tres reducidos de la tabla.
    await page.selectOption('#select-ccaa', 'baleares');
    await rellenar(page, PRECIO, '250000');
    await rellenar(page, GESTORIA, '500');

    const techos = ITP_CCAA['baleares'].tiposReducidos?.map((t) => t.valorMaximo ?? 0) ?? [];
    expect(Math.min(...techos)).toBeGreaterThan(250000); // el precio cabe en todos ellos
    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (8,00%)');
    expect(await valorTarjeta(page, 'ITP (')).toBe('20.000,00 €');
    // Ninguno de los tres reducidos se ha colado: 4 % → 10.000 · 5 % → 12.500 · 0 % → 0.
    expect(await valorTarjeta(page, 'ITP (')).not.toBe('10.000,00 €');
    expect(await valorTarjeta(page, 'ITP (')).not.toBe('12.500,00 €');
    expect(await valorTarjeta(page, 'ITP (')).not.toBe('0,00 €');
    expect(await descripcionTarjeta(page, 'ITP (')).toContain('no tienen los reducidos de vivienda');
    // 17/10/2026 (cabo C0209): con la base del BOE y la rebaja del 5 % del nº 2.1, notaría
    // 383,435226 × 0,95 × 1,21 × 1,75 = 771,327886 (661,14–881,52) · registro (201,212547 × 0,95
    // + 9,015182) × 1,21 = 242,202194 → total 20.000 + 771,33 + 242,20 + 500 = 21.513,53 (8,61 %)
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('771,33 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain('entre 661,14 € y 881,52 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('242,20 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('21.513,53 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('8,61% sobre el precio');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('271.513,53 €');

    // b) Canarias, 140.000 € — bajo el techo de 150.000 € del 5 % de vivienda habitual.
    await page.selectOption('#select-ccaa', 'canarias');
    await rellenar(page, PRECIO, '140000');
    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (6,50%)');
    expect(await valorTarjeta(page, 'ITP (')).toBe('9100,00 €');
    expect(await valorTarjeta(page, 'ITP (')).not.toBe('7000,00 €');

    // c) Precio de 320 dígitos: desborda a Infinito y la guarda lo rechaza.
    const campo = page.locator('input[aria-label="' + PRECIO + '"]');
    await campo.fill('9'.repeat(320));
    await campo.blur();
    expect((await campo.inputValue()).length).toBe(320); // el filtro del input SÍ lo admite
    await expect(
      page.getByText('Introduce el precio de la nave industrial para ver el desglose de gastos')
    ).toBeVisible();
    await expect(page.locator('h3', { hasText: /^COSTE TOTAL/ })).toHaveCount(0);
    const cuerpo = await page.locator('body').innerText();
    expect(cuerpo).not.toContain('NaN');
    expect(cuerpo).not.toContain('No definido');
    expect(cuerpo).not.toContain('∞');
  });

  /**
   * EFECTO FAMILIA — el defecto de «Años de propiedad» no aplica aquí, y no por reparado.
   *
   * En `simulador-gastos-compraventa-garaje` y en `estimador-compraventa-inmueble` el campo
   * «Años de propiedad» lleva `min={1}` y el motor lee `parseInt(aniosPropiedad) || 0`, de
   * modo que la reventa antes del año es inalcanzable y con ella el coeficiente 0,14 de
   * `COEFICIENTES_IIVTNU_2025`; `simulador-gastos-compraventa-local-comercial` ya está
   * reparada. Esta app cae fuera de las tres: NO tiene parte de vendedor —ni campo de años,
   * ni valor catastral del suelo, ni plusvalía municipal, ni ganancia patrimonial—, así que
   * el defecto no tiene dónde ocurrir. Su `useMemo` devuelve un único `resultadosComprador`.
   *
   * El test se queda por lo que puede pasar mañana: si alguien le añade la plusvalía copiando
   * de una hermana sin reparar, esto lo caza en vez de callar.
   */
  test('efecto familia — la app no tiene parte de vendedor, así que el defecto de «Años de propiedad» no tiene dónde ocurrir', async ({ page }) => {
    await page.goto(RUTA);
    await expect(page.locator('input[aria-label*="Años"]')).toHaveCount(0);
    await expect(page.locator('h3', { hasText: /[Pp]lusval/ })).toHaveCount(0);
    await expect(page.locator('h3', { hasText: /[Gg]anancia patrimonial/ })).toHaveCount(0);

    const fuente = await leerFuente();
    expect(fuente).not.toContain('aniosPropiedad');
    expect(fuente).not.toContain('calcularPlusvaliaMunicipal');
    // Y si alguna vez se añade, que sea con la guarda buena: el 0 tiene que poder escribirse.
    expect(fuente).not.toMatch(/parseInt\(\s*aniosPropiedad\s*\)\s*\|\|\s*0/);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// HALLAZGOS de la re-inspección del 10/09/2026 — REPARADOS ese mismo día (683, 684 y el AJD
// con decimales forzados; el 683 se terminó de reparar el 15/09, hallazgo 856).
// Se escribieron con `test.fail()` afirmando lo que DEBÍA pasar; al repararlos se les quitó la
// marca y quedaron como regresión, igual que los hallazgos 156-166, 490-493, 600-604 y 646-651.
// (Hasta el 06/10/2026 este bloque seguía llamándose «Hallazgos abiertos»: la base ya no tenía
// ninguno abierto.)
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Hallazgos del 10/09/2026 — REPARADOS', () => {
  /**
   * HALLAZGO 1 (accesibilidad, medio) — la herramienta pinta texto con `var(--primary)`,
   * que es el azul de MARCA y no llega al 4,5:1 de la WCAG 2.1 AA en tema claro.
   *
   * Medido con Ceuta seleccionada y 500.000 € (los ratios no dependen del contenido):
   *   · `.infoCcaaNombre` «Ciudad Autónoma de Ceuta» → 3,93:1 sobre rgb(250,250,250)
   *   · `.infoCcaaValue` «0,50%» / «No calculado» / «6,5%» → 4,11:1 sobre blanco
   *   · `.catastroLink` «🔗 Consultar valor de referencia catastral…» → 4,11:1 sobre blanco
   * Son las tres cifras del recuadro de la comunidad —el ITP general, el AJD y el IVA— y el
   * único enlace de la herramienta: justo lo que hay que poder leer.
   *
   * El proyecto ya resolvió esto: `app/globals.css` define `--primary-texto` (#26718F en
   * claro) con el comentario «5,47:1 sobre blanco · 5,24 sobre la tarjeta», y lo usan
   * `Footer`, `LegalNotice`, `MeskeiaLogo` y una quincena de apps. Esta no.
   *
   * En OSCURO no ocurre: allí `--primary` ya resuelve a #3FA5D1 y las tres pasan.
   *
   * REPARADO el 10/09/2026: las tres clases pasan a `--primary-texto`, el token que el
   * proyecto tiene justo para esto. En oscuro resuelve al mismo #3FA5D1 que ya usaban, así
   * que allí no cambia nada. Queda como regresión, sin `test.fail()`.
   */
  test('HALLAZGO 1 — el azul de marca como texto no llega a 4,5:1 en tema claro', async ({ page }) => {
    await page.goto(RUTA);
    await page.selectOption('#select-ccaa', 'ceuta');
    await rellenar(page, PRECIO, '500000');

    const peor = await esperarEstable(() =>
      peorContrasteDe(page, '[class*="infoCcaaNombre"], [class*="infoCcaaValue"], [class*="catastroLink"]')
    );
    // El 10/09/2026, antes de repararlo: 3,93:1 en «Ciudad Autónoma de Ceuta».
    expect(peor.ratio, `peor contraste en claro: «${peor.texto}»`).toBeGreaterThanOrEqual(4.5);
  });

  /**
   * HALLAZGO 2 (accesibilidad, medio) — la celda «21%» de la tabla comparativa se quedó
   * fuera de la reparación del hallazgo 648, y falla en LOS DOS temas.
   *
   * El 09/09 esa tabla se arregló: las cuatro celdas de respuesta («No aplican», «No»,
   * «Sí (jóvenes…)», «Sí (si actividad sujeta a IVA)») pasaron de dos hexadecimales sin
   * variante de tema a `.celdaSi`/`.celdaNo`, con pareja clara y oscura medida contra los dos
   * fondos que la tabla llega a tener. La quinta celda con color propio —la que lleva el IVA
   * de la nave, `fontWeight: 700` y `color: 'var(--primary)'` en línea— no se tocó:
   *   · claro:  rgb(46,134,171) sobre rgb(245,245,245) → 3,77:1
   *   · oscuro: rgb(63,165,209) sobre rgb(56,56,56)    → 4,20:1
   * Con 14,4 px y peso 700 no es «texto grande» (la WCAG pide ≥18,66 px en negrita), así que
   * el umbral es 4,5:1 en los dos temas. Y es la cifra que la tabla existe para dar: el 21 %
   * que separa una nave de una vivienda.
   *
   * REPARADO el 10/09/2026 con `.celdaCifra`, la quinta clase de esta tabla, medida contra
   * sus dos fondos en cada tema igual que sus hermanas: #26718F → 5,01:1 sobre #F5F5F5 y
   * 5,24:1 sobre #FAFAFA · #6BC5EC → 6,04:1 sobre #383838 y 8,97:1 sobre #1A1A1A.
   */
  test('HALLAZGO 2 — la celda del IVA de la tabla comparativa no llega a 4,5:1 en ningún tema', async ({ page }) => {
    await page.goto(RUTA);
    // El bloque educativo vive en el DOM aunque esté plegado, pero un elemento con
    // `display: none` no tiene color computado útil: se despliega para medirlo.
    const abrir = page.locator('button', { hasText: /Guía fiscal para la compra de naves industriales/ }).first();
    if (await abrir.count()) await abrir.click();

    const celdaIva = 'table td[style*="fontWeight"], table td';
    const medirCelda = async (): Promise<number> =>
      page.evaluate((sel) => {
        const canal = (c: number) => {
          const s = c / 255;
          return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
        };
        const lum = (p: number[]) => 0.2126 * canal(p[0]) + 0.7152 * canal(p[1]) + 0.0722 * canal(p[2]);
        const rgba = (s: string) => {
          const n = (s.match(/[\d.]+/g) ?? []).map(Number);
          return n.length < 3 ? null : { r: n[0], g: n[1], b: n[2], a: n.length > 3 ? n[3] : 1 };
        };
        const fondoDe = (el: Element): number[] => {
          const capas: { r: number; g: number; b: number; a: number }[] = [];
          let n: Element | null = el;
          while (n) {
            const c = rgba(getComputedStyle(n).backgroundColor);
            if (c && c.a > 0) {
              capas.push(c);
              if (c.a >= 1) break;
            }
            n = n.parentElement;
          }
          let base = [255, 255, 255];
          for (let i = capas.length - 1; i >= 0; i--) {
            const c = capas[i];
            base = [
              c.r * c.a + base[0] * (1 - c.a),
              c.g * c.a + base[1] * (1 - c.a),
              c.b * c.a + base[2] * (1 - c.a),
            ];
          }
          return base;
        };
        const td = Array.from(document.querySelectorAll(sel)).find(
          (e) => (e.textContent ?? '').replace(/\s+/g, ' ').trim() === '21%'
        );
        if (!td) return 21;
        const cs = getComputedStyle(td);
        const bg = fondoDe(td);
        const f = rgba(cs.color)!;
        const fg = [
          f.r * f.a + bg[0] * (1 - f.a),
          f.g * f.a + bg[1] * (1 - f.a),
          f.b * f.a + bg[2] * (1 - f.a),
        ];
        const a = Math.max(lum(fg), lum(bg));
        const b = Math.min(lum(fg), lum(bg));
        return Math.round(((a + 0.05) / (b + 0.05)) * 100) / 100;
      }, celdaIva);

    const claro = await esperarEstable(medirCelda);
    await activarTemaOscuro(page);
    const oscuro = await esperarEstable(medirCelda);

    // Antes de repararlo: claro 3,77 · oscuro 4,20.
    expect(claro, 'celda «21%» en tema claro').toBeGreaterThanOrEqual(4.5);
    expect(oscuro, 'celda «21%» en tema oscuro').toBeGreaterThanOrEqual(4.5);
  });

  /**
   * HALLAZGO 3 (contenido, bajo) — el AJD del recuadro de la comunidad es el único tipo
   * NOMINAL de la página al que todavía se le fuerzan dos decimales.
   *
   * En la misma caja y en la línea de al lado, «ITP General» usa `formatTipoNominal` desde el
   * hallazgo 331 y el bloque educativo pasó a usarlo el 09/09 (hallazgo 651). El AJD se quedó
   * con `formatNumber(datosCcaaActual.ajd, 2)`, así que la caja dice a la vez:
   *   · Navarra     → «ITP General 6%»    junto a «AJD 0,50%»
   *   · País Vasco  → «ITP General 4%»    junto a «AJD 0,00%»
   *   · La Rioja    → «ITP General 7%»    junto a «AJD 1,00%»
   * y la tabla comparativa de la MISMA página escribe ese mismo rango como «Sí (0% – 1,5%)».
   *
   * Es efecto familia con la reparación ya hecha en el clúster: `trastero`,
   * `local-comercial`, `solar` y `terreno-rustico` ya escriben ahí
   * `formatTipoNominal(datosCcaaActual.ajd)`. Solo `nave-industrial` y `garaje` no.
   * No hay ninguna cifra equivocada: lo que hay es el ruido para el que se creó la función.
   *
   * REPARADO el 10/09/2026: `page.tsx` escribe `formatTipoNominal(datosCcaaActual.ajd)` y la
   * caja dice «AJD 0,5%», «AJD 0%» y «AJD 1%». Verificado en navegador el 14/09/2026.
   *
   * ⚠️ Y el testigo estaba CIEGO (14/09/2026). Este test seguía marcado `test.fail()` y la
   * corrida lo daba por bueno DESPUÉS de la reparación, porque sus tres aserciones no podían
   * acertar nunca: `toContainText` compara contra `textContent`, y ahí la etiqueta y su cifra
   * son dos `<span>` pegados sin espacio —«AJD0,5%», no «AJD 0,5%»—. Buscar «AJD 0,5%» fallaba
   * con el defecto vivo y con el defecto muerto, así que el `test.fail()` se satisfacía solo.
   * Es el caso simétrico del validador ciego del CLAUDE.md: un testigo que dice siempre lo
   * mismo no está midiendo. Ahora se lee el VALOR del item, que es el nodo que lleva la cifra,
   * y el test pasa a regresión sin marca.
   */
  test('REPARADO HALLAZGO 3 — el AJD del recuadro se rotula sin decimales que no tiene', async ({ page }) => {
    await page.goto(RUTA);
    /** Cifra del item «AJD» del recuadro de la comunidad, leída de su propio nodo. */
    const valorAjd = async (): Promise<string> =>
      page.evaluate(() => {
        const items = Array.from(document.querySelectorAll('[class*="infoCcaaItem"]'));
        const ajd = items.find((i) => (i.textContent ?? '').startsWith('AJD'));
        return ajd?.querySelector('[class*="infoCcaaValue"]')?.textContent?.trim() ?? '';
      });

    await page.selectOption('#select-ccaa', 'navarra');
    expect(ITP_CCAA['navarra'].ajd).toBe(0.5);
    // Antes de la reparación: «0,50%».
    await expect.poll(valorAjd).toBe('0,5\u00A0%');

    await page.selectOption('#select-ccaa', 'rioja');
    expect(ITP_CCAA['rioja'].ajd).toBe(1);
    await expect.poll(valorAjd).toBe('1\u00A0%');

    // 24/09/2026 (hallazgo 1583): una nave paga en el País Vasco el AJD foral del 0,5 %; el 0
    // era la exención de la primera VIVIENDA (`ajdVivienda`), y aquí se esperaba «0%».
    await page.selectOption('#select-ccaa', 'pais-vasco');
    expect(ITP_CCAA['pais-vasco'].ajd).toBe(0.5);
    expect(ITP_CCAA['pais-vasco'].ajdVivienda).toBe(0);
    await expect.poll(valorAjd).toBe('0,5\u00A0%');

    // Y el de al lado, que ya lo hacía bien, sigue haciéndolo: es la comparación que da
    // sentido al caso (dos tipos NOMINALES en la misma caja con el mismo formato).
    await page.selectOption('#select-ccaa', 'murcia');
    expect(ITP_CCAA['murcia'].tipoGeneral).toBe(7.75);
    await expect.poll(async () =>
      page.evaluate(() => {
        const items = Array.from(document.querySelectorAll('[class*="infoCcaaItem"]'));
        const itp = items.find((i) => (i.textContent ?? '').startsWith('ITP General'));
        return itp?.querySelector('[class*="infoCcaaValue"]')?.textContent?.trim() ?? '';
      }),
    ).toBe('7,75\u00A0%');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN — 14/09/2026 (Opus 5) · 7ª vuelta
//
// Antes de escribir nada se ejecutó el fichero entero: 63/63 en verde. Los dos hallazgos
// de contraste del 10/09 (683 y 684) están cerrados y medidos abajo; el tercero —el AJD con
// dos decimales forzados— también, aunque su testigo estaba ciego y se ha rehecho arriba.
//
// PISTAS DE EFECTO FAMILIA confirmadas HOY en `garaje` y `trastero`. Ninguna de las dos
// APLICA aquí, y no por estar reparadas sino porque no tienen dónde ocurrir: esta app NO
// tiene parte de vendedor. Sus únicos dos campos son el precio y la gestoría, y su único
// cálculo es el coste de ADQUISICIÓN del comprador.
//   1. «Años de propiedad» negativos que el `handleBlur` de NumberInput reescribe como 0 —el
//      coeficiente más alto de COEFICIENTES_IIVTNU_2025—: aquí no hay ese campo. El mismo
//      recorte SÍ le ocurre al precio (min={0}), pero ahí es inocuo y se comprueba en el
//      CASO 3: `precio <= 0` devuelve null, así que el 0 no calcula nada, no es una hipótesis
//      cara disfrazada de neutra.
//   2. `calcularGananciaInmueble` con `esPerdida = ganancia <= 0`, que rotula «Pérdida
//      patrimonial 0,00 €» en el cero exacto: esta app no importa ese motor ni lo llama.
// Las dos se dejan escritas como test para que, si alguien le añade un día la parte de
// vendedor, el fichero lo cace en vez de callar.
//
// De dónde sale CADA cifra esperada de esta tanda (ninguna de memoria):
//  - Tipo general de Galicia (8 %) → `TIPOS_ITP_CCAA_2025` en `data/fiscal/inmuebles.ts`,
//    vía `tipoGeneralDe()`. AJD de Galicia (1,5 %) → `ITP_CCAA['galicia'].ajd`.
//  - IVA de la nave en primera entrega (21 %) → `IVA_INMUEBLES_2025.local`.
//  - Escala de Baleares (8 % hasta 400.000 · 9 % hasta 600.000 · 10 % hasta 1.000.000 ·
//    12 % hasta 2.000.000 · 13 % después) → `ITP_CCAA['baleares'].tramosProgresivos`.
//  - Aranceles → `ARANCELES_NOTARIO` (RD 1426/1989) y `ARANCELES_REGISTRO` (RD 1427/1989),
//    con `FACTURA_NOTARIAL` (×1,5 a ×2, punto medio ×1,75) y `REGISTRO_CONCEPTOS`
//    (presentación 6,010121 € + nota simple 3,005061 €). El 21 % de IVA va dentro.
//  - «No sujeción» del IIVTNU cuando no hay incremento → art. 104.5 del TRLRHL en la
//    redacción del RDL 26/2021, que es la norma que `PLUSVALIA_MUNICIPAL_META`
//    (`data/fiscal/inmuebles.ts`) declara como `baseNormativa`.
//
// Los tres casos se resolvieron a mano ANTES de abrir el navegador; el desarrollo va
// comentado junto a cada aserción, con los importes sin redondear.
// ═══════════════════════════════════════════════════════════════════════════════

/** Los dos campos de la app, que son los que hay que esperar hidratados. */
const CAMPOS = [
  'input[aria-label="Precio de compra de la nave industrial"]',
  'input[aria-label="Gastos de gestoría (€)"]',
] as const;

/**
 * Siembra un campo comprobando que el ESTADO de React lo recogió.
 *
 * `rellenar()` —el helper de las tandas anteriores— usa `fill()` + `blur()`, que llega a
 * React pero no lo comprueba: si la app aún no ha hidratado, el DOM cambia, el estado no, y
 * el test mide el escenario anterior en verde (ver `tests/apps/_hidratacion.ts`). Aquí se
 * usa el ayudante del proyecto, que espera al valor en `__reactProps$`.
 */
async function sembrar(page: Page, etiqueta: string, valor: string): Promise<void> {
  await sembrarValor(page, `input[aria-label="${etiqueta}"]`, valor);
}

test.describe('Re-inspección 14/09/2026 — tres casos nuevos', () => {
  /**
   * CASO 1 (NORMAL) — Galicia, OBRA NUEVA del promotor, 425.000 €, gestoría 500 €.
   *
   * Combinación que ninguna vuelta anterior había pisado: una comunidad de tipo PLANO en el
   * modo con IVA. Prueba que el 8 % gallego no se cuela en una operación que tributa por IVA
   * y que el AJD sale del tipo de la tabla, no del ITP.
   *
   * A mano:
   *   IVA = 425.000 × 21 % (IVA_INMUEBLES_2025.local)                 =  89.250,00
   *   AJD = 425.000 × 1,5 % (ITP_CCAA['galicia'].ajd)                 =   6.375,00
   *   Notaría — RD 1426/1989, número 2:
   *     tramo 1 (hasta 6.010,12)                                      →   90,151816
   *     tramo 2 (0,45 %)  → 24.040,49 × 0,0045                        =  108,182205
   *     tramo 3 (0,15 %)  → 30.050,60 × 0,0015                        =   45,075900
   *     tramo 4 (0,10 %)  → 90.151,82 × 0,0010                        =   90,151820
   *     tramo 5 (0,05 %)  → (425.000 − 150.253,03) × 0,0005           =  137,373485
   *     escala del nº 2.1                                             =  470,935226
   *     rebaja del 5 % del nº 2.1 (17/10/2026, cabo C0209) × 0,95     =  447,388465
   *     × 1,21                                                        =  541,340043
   *     horquilla ×1,5 = 812,010064 · ×2 = 1.082,680086 · medio       =  947,345075
   *   Registro — RD 1427/1989, número 2:
   *     24,040484 + 42,0708575 + 37,56325 + 67,613865
   *          + (425.000 − 150.253,03) × 0,0003 = 82,424091            =  253,712547
   *     × 0,95 (rebaja del nº 2.1)                                    =  241,026920
   *     + presentación 6,010121 + nota simple 3,005061                =  250,042102
   *     × 1,21                                                        =  302,550943
   *   Total gastos (sumando las líneas YA redondeadas al céntimo, que es como se ven):
   *     89.250,00 + 6.375,00 + 947,35 + 302,55 + 500                  =  97.374,90
   *   % sobre el precio = 97.374,90 / 425.000                         =   22,9117 % → «22,91%»
   *   Coste total = 425.000 + 97.374,90                               = 522.374,90
   *   (sin la rebaja: 997,20 · 854,74–1.139,66 · 317,90 · 97.440,10)
   */
  test('CASO 1 (normal) — Galicia, obra nueva, 425.000 €: IVA del 21 % y AJD del 1,5 %', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, CAMPOS);
    await page.selectOption('#select-ccaa', 'galicia');
    await page.getByRole('button', { name: /Obra nueva/ }).click();
    await sembrar(page, PRECIO, '425000');

    // El tipo plano gallego es el del ITP y NO puede aparecer aquí: 425.000 × 8 % = 34.000.
    expect(ITP_CCAA['galicia'].tipoGeneral).toBe(8);
    await expect(page.locator('h3', { hasText: /^ITP \(/ })).toHaveCount(0);
    await expect(page.getByText('34.000,00 €')).toHaveCount(0);

    expect(IVA_INMUEBLES_2025.local).toBe(21);
    expect(await rotuloTarjeta(page, /^IVA \(/)).toBe('IVA (21,00%)');
    expect(await valorTarjeta(page, 'IVA (')).toBe('89.250,00 €');

    expect(ITP_CCAA['galicia'].ajd).toBe(1.5);
    expect(await rotuloTarjeta(page, /^AJD \(/)).toBe('AJD (1,50%)');
    // 4 cifras enteras: el español agrupa a partir de 5 (minimumGroupingDigits = 2).
    expect(await valorTarjeta(page, 'AJD (')).toBe('6375,00 €');

    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('947,35 €');
    const notaria = await descripcionTarjeta(page, 'Gastos de notaría');
    expect(notaria).toContain('812,01 €');
    expect(notaria).toContain('1082,68 €');

    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('302,55 €');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('500,00 €');

    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('97.374,90 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('22,91%');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('522.374,90 €');

    // Una nave no es vivienda: la tarjeta del IVA no puede ofrecer el 10 % del art. 91 LIVA.
    expect(IVA_INMUEBLES_2025.obraNueva).toBe(10);
    await expect(page.getByText('42.500,00 €')).toHaveCount(0);
  });

  /**
   * CASO 2 (LÍMITE) — Baleares, segunda mano, 1.000.000 € EXACTOS.
   *
   * `ITP_CCAA['baleares'].tramosProgresivos` corta justo ahí: el tramo del 10 % llega
   * «hasta 1.000.000» y el del 12 % empieza después. Es el borde donde un `<` mal puesto
   * cobraría el 12 % sobre todo el último tramo, o donde un `<=` de más metería una base de
   * cero euros en el tramo siguiente. Los dos vecinos se comprueban con él.
   *
   * A mano:
   *   ITP = 400.000 × 8 % + 200.000 × 9 % + 400.000 × 10 % + 0 × 12 %
   *       = 32.000 + 18.000 + 40.000                                  =  90.000,00
   *   tipo efectivo = 90.000 / 1.000.000                              =       9,00 % → «9,00%»
   *     (un tipo plano del 8 % daría 80.000 y del 12 %, 120.000: ninguno de los dos)
   *   un euro menos → 399.999 en el tramo del 10 %                    =  89.999,90
   *   un euro más   → 1 € al 12 %                                     =  90.000,12
   *   AJD = 0 (segunda mano sin renuncia: no hay cuota gradual)
   *   Notaría: 90,151816 + 108,182205 + 45,0759 + 90,15182
   *            + (601.012,10 − 150.253,03) × 0,0005 = 225,379535
   *            + (1.000.000 − 601.012,10) × 0,0003 = 119,69637        =  678,637646
   *            × 0,95 (rebaja del nº 2.1, 17/10/2026, cabo C0209)     =  644,705764
   *            × 1,21 = 780,093974 · ×1,5 = 1.170,140961
   *                                 ×2   = 1.560,187948 · medio       = 1.365,164454
   *   Registro: 24,040484 + 42,0708575 + 37,56325 + 67,613865
   *            + (601.012,10 − 150.253,03) × 0,0003 = 135,227721
   *            + (1.000.000 − 601.012,10) × 0,0002 = 79,79758         =  386,313758
   *            × 0,95 = 366,998070 + 9,015182 = 376,013252 · × 1,21   =  454,976034
   *   Total gastos = 90.000 + 1.365,16 + 454,98 + 500                 =  92.320,14
   *   % sobre el precio = 92.320,14 / 1.000.000                       =    9,232014 % → «9,23%»
   *   Coste total = 1.000.000 + 92.320,14                             = 1.092.320,14
   *   (sin la rebaja: 1.437,01 · 1.231,72–1.642,30 · 478,35 · 92.415,36)
   */
  test('CASO 2 (límite) — Baleares, 1.000.000 € exactos: el corte 10 % → 12 % no se pasa de largo', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, CAMPOS);
    await page.selectOption('#select-ccaa', 'baleares');
    await sembrar(page, PRECIO, '1000000');

    // La escala que la app anuncia es la de la tabla, con sus cinco tipos.
    expect(ITP_CCAA['baleares'].tramosProgresivos?.map((t) => t.tipo)).toEqual([8, 9, 10, 12, 13]);
    expect(ITP_CCAA['baleares'].tramosProgresivos?.[2].hasta).toBe(1000000);
    await expect(page.getByText(/escala progresiva \(8\s% → 9\s% → 10\s% → 12\s% → 13\s%\)/)).toBeVisible();

    expect(await valorTarjeta(page, 'ITP (')).toBe('90.000,00 €');
    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (9,00%)');
    // Ninguno de los dos tipos planos vecinos.
    await expect(page.getByText('80.000,00 €')).toHaveCount(0);
    await expect(page.getByText('120.000,00 €')).toHaveCount(0);

    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('1365,16 €');
    const notaria = await descripcionTarjeta(page, 'Gastos de notaría');
    expect(notaria).toContain('1170,14 €');
    expect(notaria).toContain('1560,19 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('454,98 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('92.320,14 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('9,23%');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('1.092.320,14 €');

    // Los dos vecinos del corte, que es lo que convierte el caso en un límite de verdad.
    await sembrar(page, PRECIO, '999999');
    expect(await valorTarjeta(page, 'ITP (')).toBe('89.999,90 €');
    await sembrar(page, PRECIO, '1000001');
    expect(await valorTarjeta(page, 'ITP (')).toBe('90.000,12 €');
  });

  /**
   * CASO 3 (RECHAZO) — un precio NEGATIVO, con el foco dentro Y saliendo con Tab.
   *
   * Es la primera pista de efecto familia del 14/09, comprobada donde el campo existe. En
   * `garaje` y `trastero` el recorte del `handleBlur` de NumberInput contra `min={0}` convierte
   * unos años de propiedad negativos en «0», que allí NO es neutro: es la reventa antes del
   * año, el coeficiente más alto de la tabla del IIVTNU. Aquí el único campo con `min={0}` que
   * gobierna el cálculo es el precio, y el recorte es inocuo porque el guard de la app es
   * `precio <= 0 → null`: el 0 no calcula nada, no calcula «lo más caro».
   *
   * Esperado en los DOS momentos: ninguna tarjeta de resultado, el marcador de espera en
   * pantalla y ni un «0,00 €» ni un «NaN» en el panel.
   */
  test('CASO 3 (rechazo) — un precio negativo sigue rechazado tras el blur, no se convierte en un 0 que calcule', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, CAMPOS);
    await page.selectOption('#select-ccaa', 'madrid');

    const campo = page.locator(`input[aria-label="${PRECIO}"]`);
    const panel = page.locator('[class*="resultados"]').first();

    // (1) Con el FOCO DENTRO del campo.
    await campo.click();
    await campo.fill('-250000');
    await esperarValorEnReact(page, campo, '-250000');
    await expect(page.locator('h3', { hasText: 'COSTE TOTAL' })).toHaveCount(0);
    await expect(page.locator('h3', { hasText: /^ITP \(/ })).toHaveCount(0);
    // Desde el 26/09 (hallazgo 2207) el negativo escrito no «falta»: no vale, y se dice.
    await expect(panel).toContainText(`El precio escrito («-250000») ${PRECIO_NO_VALE}`);
    expect(await panel.innerText()).not.toMatch(/NaN|€/);

    // (2) Saliendo con Tab: `handleBlur` lo recorta a «0»…
    await page.keyboard.press('Tab');
    await esperarValorEnReact(page, campo, '0');
    // …y el 0 SIGUE sin calcular nada. Si algún día calculase, aquí saldría el arancel
    // mínimo (90,15 € de notaría) sobre un precio que el usuario nunca escribió.
    await expect(page.locator('h3', { hasText: 'COSTE TOTAL' })).toHaveCount(0);
    await expect(panel).toContainText(`El precio escrito («0») ${PRECIO_NO_VALE}`);
    expect(await panel.innerText()).not.toMatch(/NaN|€/);

    // (3) Y el otro campo con `min={0}`, la gestoría, tampoco descuadra el total al pasar
    //     por el blur: con el foco dentro vale 0 por `Math.max(0, …)` y tras el Tab vale «0».
    await sembrar(page, PRECIO, '500000');
    const gestoria = page.locator(`input[aria-label="${GESTORIA}"]`);
    await gestoria.click();
    await gestoria.fill('-400');
    await esperarValorEnReact(page, gestoria, '-400');
    // 30.000 (ITP Madrid 6 %) + 1.022,78 + 328,41 + 0 = 31.351,19 (CASO 1, con la rebaja del
    // nº 2.1, cabo C0209; sin ella, 31.421,73)
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('31.351,19 €');
    await expect(page.locator('h3', { hasText: 'Gastos de gestoría' })).toHaveCount(0);
    await page.keyboard.press('Tab');
    await esperarValorEnReact(page, gestoria, '0');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('31.351,19 €');
  });

  /**
   * EFECTO FAMILIA (2ª pista del 14/09) — el cero exacto de la ganancia patrimonial.
   *
   * En `garaje` y `trastero`, `calcularGananciaInmueble` (`data/fiscal/ganancia-inmueble.ts`)
   * decide con `esPerdida = ganancia <= 0`, así que una venta al mismo precio de compra —cero
   * exacto— entra por la rama de la pérdida y se rotula «Pérdida patrimonial 0,00 €» con un
   * consejo de compensación en la declaración que ese caso no genera.
   *
   * Aquí NO puede ocurrir, y no por una guarda: esta app no calcula ninguna ganancia. No
   * importa el motor, no tiene campo de precio de compra original ni de años de propiedad, y
   * su único resultado es el coste de adquisición del comprador. El test deja constancia por
   * si algún día se le añade la parte de vendedor sin repasar este cero.
   */
  test('efecto familia — no hay ganancia patrimonial que pueda valer cero, porque la app no la calcula', async ({ page }) => {
    const fuente = await leerFuente();
    expect(fuente).not.toContain('calcularGananciaInmueble');
    expect(fuente).not.toContain('COEFICIENTES_IIVTNU_2025');
    expect(fuente).not.toContain('calcularPlusvalia');

    await page.goto(RUTA);
    await esperarHidratacion(page, CAMPOS);
    // Los DOS únicos campos de la calculadora. Desde S0195 la página monta además el bloque
    // compartido del reparto del IBI y la comunidad (fecha de la escritura, IBI, comunidad):
    // reparte gastos del año entre las partes, tampoco calcula ninguna ganancia, y se cuenta
    // aparte para que el test siga diciendo lo que decía (cabo C0234, 13/10/2026).
    const etiquetas = await page.evaluate(() =>
      Array.from(document.querySelectorAll('input'))
        .filter((i) => !i.closest('section[aria-labelledby="titulo-prorrateo"]'))
        .map((i) => i.getAttribute('aria-label')),
    );
    expect(etiquetas).toEqual([PRECIO, GESTORIA]);
    await expect(
      page.locator('section[aria-labelledby="titulo-prorrateo"] input'),
    ).toHaveCount(3);

    await sembrar(page, PRECIO, '500000');
    const cuerpo = ((await page.locator('body').textContent()) ?? '').replace(/\s+/g, ' ');
    expect(cuerpo).not.toContain('Pérdida patrimonial');
    expect(cuerpo).not.toContain('Años de propiedad');
    expect(cuerpo).not.toContain('Valor catastral del suelo');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Los tres hallazgos del 14/09/2026 se repararon el mismo día y el 21/09/2026 se
// reprodujeron uno a uno MIDIENDO en el navegador, con el tema esperado estable:
//   · botón activo  3,74:1 → 4,97:1 en claro  (oscuro 4,58:1, que no se tocó)
//   · .sectionTitle 4,11:1 → 5,47:1 en claro  (oscuro 4,93:1)
//   · la FAQ de la plusvalía dice «no sujeción», no «exención»
// Los tests conservan su redacción —afirman lo que DEBE ocurrir— y ahora sujetan la
// reparación en vez de denunciar el defecto.
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Regresión — hallazgos del 14/09/2026, reparados', () => {
  /**
   * HALLAZGO 1 (accesibilidad, medio) — el botón de transmisión ACTIVO pinta su rótulo con
   * `var(--primary)` y se queda en 3,74:1 en tema claro.
   *
   * Es el resto del hallazgo 683, reparado a medias el 10/09: aquella vuelta pasó a
   * `--primary-texto` las tres clases que había medido (`.infoCcaaNombre`, `.infoCcaaValue`
   * y `.catastroLink`, hoy en 5,24-5,47:1, comprobado abajo), pero `.transmisionBtn.active`
   * se quedó con el azul de marca:
   *   · rgb(46,134,171) sobre rgb(238,245,248) —el blanco de la tarjeta con el
   *     `rgba(46,134,171,0.08)` del propio botón compuesto encima— → 3,74:1
   *   · 14,08 px y peso 600: NO es «texto grande» (la WCAG 2.1 pide ≥18,66 px en negrita),
   *     así que el umbral es 4,5:1.
   * En OSCURO pasa (4,58:1), igual que ocurría con las tres clases ya reparadas.
   *
   * Y no es un adorno: el color es lo que distingue al botón elegido de los otros dos, así
   * que es justo el texto que dice cuál de las tres tributaciones se está simulando.
   */
  test('REPARADO 14/09-1 — el rótulo del botón de transmisión activo llega a 4,5:1 en los dos temas', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, CAMPOS);

    // Las tres clases YA reparadas el 10/09 siguen bien: el hallazgo es lo que quedó fuera.
    const reparadas = await esperarEstable(() =>
      peorContrasteDe(page, '[class*="infoCcaaNombre"], [class*="infoCcaaValue"], [class*="catastroLink"]'),
    );
    expect(reparadas.ratio, `ya reparadas: «${reparadas.texto}»`).toBeGreaterThanOrEqual(4.5);

    // El rótulo del botón activo, sin contar su icono decorativo.
    const activo = await esperarEstable(() =>
      peorContrasteDe(page, '[class*="transmisionBtn"][class*="active"] span:not([class*="transmisionIcon"])'),
    );
    // Medido el 21/09/2026: 4,97:1 en «Segunda mano», rgb(38,113,143) sobre rgb(238,245,248).
    expect(activo.ratio, `botón activo (claro): «${activo.texto}»`).toBeGreaterThanOrEqual(4.5);

    // Y lo que la reparación NO podía romper: los botones que NO están elegidos. Si el
    // arreglo hubiese tocado `.transmisionBtn` en vez de `.transmisionBtn.active`, los dos
    // no elegidos habrían pasado del negro del texto normal a un azul más flojo sin que
    // ninguna aserción del 14/09 lo notara. Medido: 16,67:1 el rótulo y 5,5:1 el subtítulo.
    const inactivo = await esperarEstable(() =>
      peorContrasteDe(page, '[class*="transmisionBtn"]:not([class*="active"]) span:not([class*="transmisionIcon"])'),
    );
    expect(inactivo.ratio, `botón NO activo (claro): «${inactivo.texto}»`).toBeGreaterThanOrEqual(4.5);

    // TEMA OSCURO — la regla `[data-theme='dark'] .transmisionBtn.active` no se tocó, así
    // que aquí se comprueba que sigue donde estaba (4,58:1) y que no ha caído de rebote.
    await activarTemaOscuro(page);
    const activoOscuro = await esperarEstable(() =>
      peorContrasteDe(page, '[class*="transmisionBtn"][class*="active"] span:not([class*="transmisionIcon"])'),
    );
    expect(activoOscuro.ratio, `botón activo (oscuro): «${activoOscuro.texto}»`).toBeGreaterThanOrEqual(4.5);
    const inactivoOscuro = await esperarEstable(() =>
      peorContrasteDe(page, '[class*="transmisionBtn"]:not([class*="active"]) span:not([class*="transmisionIcon"])'),
    );
    expect(inactivoOscuro.ratio, `botón NO activo (oscuro): «${inactivoOscuro.texto}»`).toBeGreaterThanOrEqual(4.5);
  });

  /**
   * HALLAZGO 2 (accesibilidad, bajo) — el título «📋 Datos de la operación» se quedó en el
   * mismo azul de marca: 4,11:1 sobre el blanco de la tarjeta, en tema claro.
   *
   * Mismo defecto y misma reparación que el anterior (`--primary` → `--primary-texto`), pero
   * en `.sectionTitle`, que es el único encabezado de la herramienta. Con 16,8 px y peso 700
   * tampoco llega a «texto grande» —la WCAG 2.1 pide ≥18,66 px en negrita—, así que su umbral
   * es 4,5:1 y no 3:1. En oscuro pasa (4,93:1).
   *
   * Va aparte del hallazgo 1 porque son dos reglas distintas del CSS module y cada una se
   * repara sola; juntas drenan lo que queda del 683 en esta app.
   */
  test('REPARADO 14/09-2 — el título de la herramienta llega a 4,5:1 en los dos temas', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, CAMPOS);

    const titulo = await esperarEstable(() => peorContrasteDe(page, '[class*="sectionTitle"]'));
    // Medido el 21/09/2026: 5,47:1, rgb(38,113,143) sobre rgb(255,255,255).
    expect(titulo.ratio, `título de sección (claro): «${titulo.texto}»`).toBeGreaterThanOrEqual(4.5);

    // `--primary-texto` resuelve a OTRO color en oscuro (#3FA5D1), así que el tema contrario
    // no se hereda: hay que medirlo. Medido el 21/09/2026: 4,93:1 sobre rgb(45,45,45), el
    // mismo valor que antes de la reparación, porque en oscuro no cambió nada.
    await activarTemaOscuro(page);
    const tituloOscuro = await esperarEstable(() => peorContrasteDe(page, '[class*="sectionTitle"]'));
    expect(tituloOscuro.ratio, `título de sección (oscuro): «${tituloOscuro.texto}»`).toBeGreaterThanOrEqual(4.5);
  });

  /**
   * HALLAZGO 3 (contenido, bajo) — la FAQ llama «exención» a lo que la norma que la propia
   * app cita declara NO SUJECIÓN.
   *
   * La pregunta «¿Hay plusvalía municipal al vender una nave industrial?» termina así:
   *   «Si no hay ganancia real en el valor del terreno, puede acreditarse la exención.»
   *
   * El art. 104.5 del TRLRHL, en la redacción que le dio el RDL 26/2021 —la `baseNormativa`
   * que declara `PLUSVALIA_MUNICIPAL_META` en `data/fiscal/inmuebles.ts`—, lo articula como
   * supuesto de NO SUJECIÓN: «No se producirá la sujeción al impuesto en las transmisiones de
   * terrenos respecto de los cuales se constate la inexistencia de incremento de valor».
   * No son sinónimos: la exención (art. 105) presupone un hecho imponible realizado y se
   * concede a determinados sujetos o transmisiones, mientras que aquí el hecho imponible no
   * llega a producirse, y quien lo invoca tiene que declararlo y acreditarlo con las
   * escrituras de adquisición y transmisión. Es la diferencia entre pedir un beneficio fiscal
   * y sostener que el impuesto no se ha devengado.
   *
   * Efecto familia: `local-comercial` y `solar` repiten la misma palabra. Los dos, al menos,
   * añaden «con las escrituras»; la nave se queda sin esa pista.
   */
  test('REPARADO 14/09-3 — la FAQ de la plusvalía dice «no sujeción», como el RDL 26/2021', async ({ page }) => {
    await page.goto(RUTA);
    // El bloque educativo vive en el DOM aunque esté plegado: `textContent`, no `innerText`.
    const guia = pegarPct(((await page.locator('body').textContent()) ?? '').replace(/\s+/g, ' '));
    expect(guia).toContain('¿Hay plusvalía municipal al vender una nave industrial?');

    // Hasta el 14/09 decía: «Si no hay ganancia real en el valor del terreno, puede
    // acreditarse la exención.»
    expect(guia).not.toContain('puede acreditarse la exención');
    expect(guia).toMatch(/no sujeción|no está sujeta|no se produce la sujeción/);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 21/09/2026 — la octava
//
// Antes de escribir nada se ejecutó el fichero entero: 70/70 en verde y ningún `test.fail()`
// pendiente, así que las tres reparaciones del 14/09 —las dos de contraste y la «exención»
// de la plusvalía— siguen cerradas y no hay regresiones que arrastrar.
//
// LAS DOS PISTAS DE EFECTO FAMILIA DE ESTA TANDA **no aplican aquí**, y no por estar
// reparadas sino porque el defecto no tiene dónde ocurrir:
//   1. «IRPF afirmado sin poder calcularse» (el `irpfCalculado` que `garaje`, `trastero` y
//      `estimador-compraventa-inmueble` ya tienen, y que a `local-comercial` le falta): esta
//      app NO tiene pestaña de vendedor. No calcula ganancia patrimonial, no pide precio de
//      compra original y su único resultado es el coste de adquisición del COMPRADOR.
//   2. «Años de propiedad negativos reescritos al `min` por `NumberInput.handleBlur`»: aquí
//      no existe ese campo. Los dos únicos `NumberInput` son el precio y la gestoría, ambos
//      con `min={0}`, y en los dos el 0 SÍ es neutro — el precio cae por el guard
//      `precio <= 0 → null` y la gestoría por `Math.max(0, …)`. Por eso esta app no necesita
//      `acotarAlSalir={false}`, que es la reparación que hoy solo llevan `garaje`, `trastero`
//      y `estimador-irpf-pensionista`.
// Las dos se comprueban abajo, en «efecto familia», para que si algún día se le añade la
// parte de vendedor el test lo cace en vez de callar.
//
// De dónde sale CADA cifra esperada de esta tanda (ninguna de memoria):
//  - Tipo general de Cantabria (9 %) y de Navarra (6 %) → `TIPOS_ITP_CCAA_2025` en
//    `data/fiscal/inmuebles.ts`, que `tipoGeneralDe()` lee para rellenar
//    `ITP_CCAA[x].tipoGeneral`. Son dos de las cinco comunidades que ninguna de las siete
//    vueltas anteriores había pisado (quedan Andalucía, Castilla-La Mancha y La Rioja).
//  - AJD de Navarra (0,5 %) y de Cantabria (1,5 %) → `ITP_CCAA[x].ajd` en `data/itp-ccaa.ts`.
//    El 0,5 % navarro es el más bajo de la tabla que no es cero, y el sitio exacto donde un
//    motor que cayese al `TIPOS_AJD_2025.general` (1,5 %) de `data/fiscal` se delataría.
//  - Escala de Aragón (8 % hasta 400.000 · 8,5 % hasta 450.000 · 9 % hasta 500.000 · 9,5 %
//    hasta 750.000 · 10 % después) → `ITP_CCAA['aragon'].tramosProgresivos`. El tramo del
//    8,5 % es el MÁS ESTRECHO de toda la tabla (50.000 € de ancho) y ninguna vuelta anterior
//    había probado su corte: el 02/09 se probó Aragón a 1.000.000 €, que los cruza todos.
//  - IVA de la nave en la renuncia → `IVA_INMUEBLES_2025.local = 21` en `data/fiscal`.
//  - Aranceles → `ARANCELES_NOTARIO` (RD 1426/1989, número 2) y `ARANCELES_REGISTRO`
//    (RD 1427/1989, número 2), con `FACTURA_NOTARIAL` (×1,5 a ×2, punto medio ×1,75) y
//    `REGISTRO_CONCEPTOS` (presentación 6,010121 € + nota simple 3,005061 €). El 21 % de IVA
//    sobre honorarios va dentro de las dos funciones.
//  - El parser que rechaza los millares mal escritos → `partesNumericas` en
//    `lib/formatters.ts`, que es lo que `parseSpanishNumber` usa por debajo.
//
// Los tres casos se resolvieron a mano ANTES de abrir el navegador; el desarrollo va
// comentado junto a cada aserción, con los importes sin redondear.
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Re-inspección 21/09/2026 — tres casos nuevos', () => {
  /**
   * CASO 1 (NORMAL) — Cantabria, segunda mano, 480.000 €, gestoría 500 €.
   *
   * Comunidad de tipo PLANO que ninguna vuelta anterior había pisado, y con el tipo general
   * más alto de las planas (9 %, empatada con Castilla-La Mancha). Sirve para comprobar que
   * un 9 % plano da exactamente el 9,00 % efectivo —sin escala que lo rebaje— y que el
   * recuadro de la comunidad anuncia los mismos tipos que la tarjeta cobra.
   *
   * A mano:
   *   ITP = 480.000 × 9 % (ITP_CCAA['cantabria'].tipoGeneral)          =  43.200,00
   *   tipo efectivo = 43.200 / 480.000                                 =       9,00 % → «9,00%»
   *   AJD = 0 (segunda mano sin renuncia: no hay cuota gradual)
   *   Notaría — RD 1426/1989, número 2:
   *     tramo 1 (hasta 6.010,12)                                       →  90,151816
   *     tramo 2 (0,45 %) → 24.040,49 × 0,0045                          = 108,182205
   *     tramo 3 (0,15 %) → 30.050,60 × 0,0015                          =  45,075900
   *     tramo 4 (0,10 %) → 90.151,82 × 0,0010                          =  90,151820
   *     tramo 5 (0,05 %) → (480.000 − 150.253,03) × 0,0005             = 164,873485
   *     escala del nº 2.1                                              = 498,435226
   *     rebaja del 5 % del nº 2.1 (17/10/2026, cabo C0209) × 0,95      = 473,513465
   *     × 1,21                                                         = 572,951293
   *     ×1,5 = 859,426940 · ×2 = 1.145,902586 · medio ×1,75            = 1.002,664763
   *   Registro — RD 1427/1989, número 2:
   *     24,040484 + 42,0708575 + 37,56325 + 67,613865
   *          + (480.000 − 150.253,03) × 0,0003 = 98,924091             = 270,212547
   *     × 0,95 (rebaja del nº 2.1)                                     = 256,701920
   *     + presentación 6,010121 + nota simple 3,005061                 = 265,717102
   *     × 1,21                                                         = 321,517693
   *   Total gastos (sumando las líneas YA redondeadas al céntimo, que es como se ven):
   *     43.200,00 + 1.002,66 + 321,52 + 500                            =  45.024,18
   *   % sobre el precio = 45.024,18 / 480.000                          =   9,380038 % → «9,38%»
   *   Coste total = 480.000 + 45.024,18                                = 525.024,18
   *   (sin la rebaja: 1.055,43 · 904,66–1.206,21 · 337,86 · 45.093,29)
   */
  test('CASO 1 (normal) — Cantabria, segunda mano, 480.000 €: el 9 % plano da el 9,00 % efectivo', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, CAMPOS);
    await page.selectOption('#select-ccaa', 'cantabria');
    await sembrar(page, PRECIO, '480000');

    expect(ITP_CCAA['cantabria'].tipoGeneral).toBe(9);
    expect(ITP_CCAA['cantabria'].tramosProgresivos).toBeUndefined();
    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (9,00%)');
    expect(await valorTarjeta(page, 'ITP (')).toBe('43.200,00 €');
    expect(await descripcionTarjeta(page, 'ITP (')).toContain('no tienen los reducidos de vivienda');

    // Sin escala, el recuadro de la comunidad NO puede anunciar tramos. Se acota a la nota
    // del recuadro: «escala progresiva» a secas casa también con el párrafo de
    // `FISCAL_INMUEBLES_META` que DataReference imprime arriba, y rompe el modo estricto.
    await expect(page.getByText(/Esta CCAA aplica escala progresiva/)).toHaveCount(0);
    const recuadro = pegarPct((await page.locator('[class*="infoCcaa"]').first().innerText()).replace(/\s+/g, ' '));
    expect(recuadro).toContain('Cantabria');
    expect(recuadro).toContain('9%');
    expect(recuadro).toContain('1,5%');   // el AJD nominal de la tabla, que aquí no se cobra

    // Segunda mano sin renuncia: no hay cuota gradual de AJD, así que su tarjeta no existe.
    await expect(page.locator('h3', { hasText: /^AJD \(/ })).toHaveCount(0);

    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('1002,66 €');
    const notaria = await descripcionTarjeta(page, 'Gastos de notaría');
    expect(notaria).toContain('859,43 €');
    expect(notaria).toContain('1145,90 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('321,52 €');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('500,00 €');

    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('45.024,18 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('9,38%');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('525.024,18 €');
  });

  /**
   * CASO 2 (LÍMITE) — Navarra, 2ª mano CON RENUNCIA a la exención, 150.253,03 € EXACTOS.
   *
   * Tres límites en una sola pantalla:
   *   · 150.253,03 € es la frontera que COMPARTEN los dos aranceles: el notarial pasa ahí del
   *     0,10 % al 0,05 % y el registral del 0,075 % al 0,030 %. En ese punto exacto la suma
   *     de los tramos anteriores tiene que dar la cuota fija que el propio tramo siguiente
   *     declara como `base` — 333,56 € en notaría y 171,29 € en registro—, así que el caso
   *     comprueba la tabla contra sí misma.
   *   · La renuncia a la exención (art. 20.Dos LIVA) es la rama que sustituye ITP por
   *     IVA + AJD, y es el caso frecuente en naves entre empresarios.
   *   · El AJD navarro (0,5 %) es el más bajo de la tabla que no es cero. Si el motor cayese
   *     al `TIPOS_AJD_2025.general` de `data/fiscal` (1,5 %) cobraría 2.253,80 € en vez de
   *     751,27 €, y eso es lo que el caso discrimina.
   *
   * A mano:
   *   IVA = 150.253,03 × 21 % (IVA_INMUEBLES_2025.local)               =  31.553,1363 → 31.553,14
   *   AJD = 150.253,03 × 0,5 % (ITP_CCAA['navarra'].ajd)               =     751,26515 →    751,27
   *   ITP = 0 — con renuncia NO se paga (el 6 % navarro habría dado 9.015,18 €)
   *   Notaría: 90,151816 + 108,182205 + 45,0759 + 90,15182             = 333,561741
   *            (= la `base` del tramo siguiente, 333,56 €)
   *            × 0,95 (rebaja del nº 2.1, 17/10/2026, cabo C0209)      = 316,883654
   *            × 1,21 = 383,429221 · ×1,5 = 575,143832 · ×2 = 766,858442
   *            medio ×1,75                                             = 671,001137
   *   Registro: 24,040484 + 42,0708575 + 37,56325 + 67,613865          = 171,288457
   *            (= la `base` del tramo siguiente, 171,29 €)
   *            × 0,95 = 162,724034 + 9,015182 = 171,739216 · × 1,21    = 207,804451
   *   Total gastos = 31.553,14 + 751,27 + 671,00 + 207,80 + 500        =  33.683,21
   *   % sobre el precio = 33.683,21 / 150.253,03                       =  22,4178 % → «22,42%»
   *   Coste total = 150.253,03 + 33.683,21                             = 183.936,24
   *   (sin la rebaja: 706,31 · 605,41–807,22 · 218,17 · 33.728,89)
   */
  test('CASO 2 (límite) — Navarra, 2ª mano con renuncia, 150.253,03 € exactos: IVA 21 % + AJD 0,5 % y ningún ITP', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, CAMPOS);
    await page.selectOption('#select-ccaa', 'navarra');
    await page.getByRole('button', { name: /2ª mano con renuncia/ }).click();
    // El precio se teclea en formato español, que es como lo escribiría quien lo copia de
    // la escritura.
    await sembrar(page, PRECIO, '150253,03');

    expect(await valorTarjeta(page, 'Precio de la nave industrial')).toBe('150.253,03 €');

    // El impuesto es IVA con inversión del sujeto pasivo, no ITP.
    expect(IVA_INMUEBLES_2025.local).toBe(21);
    expect(await rotuloTarjeta(page, /^IVA \(renuncia/)).toBe('IVA (renuncia · ISP) (21,00%)');
    expect(await valorTarjeta(page, 'IVA (renuncia')).toBe('31.553,14 €');
    expect(await descripcionTarjeta(page, 'IVA (renuncia')).toContain('inversión del sujeto pasivo');
    await expect(page.locator('h3', { hasText: /^ITP \(/ })).toHaveCount(0);
    // El ITP navarro sobre este precio habría sido 9.015,18 €: no puede estar en pantalla.
    expect(ITP_CCAA['navarra'].tipoGeneral).toBe(6);
    await expect(page.getByText('9015,18 €')).toHaveCount(0);

    // El AJD sale de la tabla de la comunidad (0,5 %), no del 1,5 % «general» de data/fiscal.
    expect(ITP_CCAA['navarra'].ajd).toBe(0.5);
    expect(await rotuloTarjeta(page, /^AJD \(/)).toBe('AJD (0,50%)');
    expect(await valorTarjeta(page, 'AJD (')).toBe('751,27 €');
    await expect(page.getByText('2253,80 €')).toHaveCount(0);

    // El corte exacto de los dos aranceles.
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('671,00 €');
    const notaria = await descripcionTarjeta(page, 'Gastos de notaría');
    expect(notaria).toContain('575,14 €');
    expect(notaria).toContain('766,86 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('207,80 €');

    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('33.683,21 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('22,42%');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('183.936,24 €');

    // El aviso de la renuncia advierte de lo único que la app NO ajusta: el tipo incrementado
    // de AJD que varias comunidades aplican en este supuesto.
    const aviso = (await page.locator('[class*="avisoRenuncia"]').first().innerText()).replace(/\s+/g, ' ');
    expect(aviso).toContain('inversión del sujeto pasivo');
    expect(aviso).toContain('tipo incrementado');
  });

  /**
   * CASO 3 (RECHAZO) — tres millares MAL ESCRITOS, con el foco dentro y saliendo con Tab.
   *
   * Es el caso que el 14/09 no cubría: allí se probó el número NEGATIVO, que sí es un número.
   * Aquí lo que se teclea no lo es, y por tres caminos distintos de `partesNumericas`:
   *   · «1.50.000»    → dos puntos y no agrupa de tres en tres → `null`
   *   · «450,000,00»  → dos comas y el último grupo tiene dos cifras → `null`
   *   · «2,5,3»       → dos comas sin agrupación posible → `null`
   * Los tres devuelven NaN, así que el guard `!Number.isFinite(precio)` los descarta. Lo que
   * importa es lo que pasa DESPUÉS del blur: `handleBlur` solo reescribe al `min` cuando
   * `parseSpanishNumber` devuelve un número, de modo que un texto que no lo es se queda tal
   * cual y NO se convierte en un 0. Si algún día se volviera al `parseFloat(x.replace(',','.'))`
   * de antes, «1.50.000» valdría 1,5 y la app liquidaría el arancel mínimo sobre un precio de
   * un euro y medio que el usuario nunca escribió.
   *
   * Esperado en los DOS momentos y para los tres: ninguna tarjeta de resultado, el marcador de
   * espera en pantalla, ni un «NaN» ni un solo «€» en el panel, y el campo intacto.
   */
  test('CASO 3 (rechazo) — un millar mal escrito no calcula, y el blur no lo convierte en un número', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, CAMPOS);
    await page.selectOption('#select-ccaa', 'rioja');
    await page.getByRole('button', { name: /Obra nueva/ }).click();

    const campo = page.locator(`input[aria-label="${PRECIO}"]`);
    const panel = page.locator('[class*="resultados"]').first();

    for (const malo of ['1.50.000', '450,000,00', '2,5,3']) {
      await sembrar(page, PRECIO, malo);

      // (1) Con el foco fuera todavía: nada que calcular.
      await expect(panel).toContainText('Introduce el precio de la nave industrial');
      await expect(page.locator('h3', { hasText: 'COSTE TOTAL' })).toHaveCount(0);
      await expect(page.locator('h3', { hasText: /^IVA \(/ })).toHaveCount(0);
      expect(await panel.innerText(), `panel con «${malo}»`).not.toMatch(/NaN|€/);

      // (2) Entrar y salir del campo: el texto se queda como se escribió.
      await campo.click();
      await page.keyboard.press('Tab');
      await esperarValorEnReact(page, campo, malo);
      await expect(panel).toContainText('Introduce el precio de la nave industrial');
      await expect(page.locator('h3', { hasText: 'COSTE TOTAL' })).toHaveCount(0);
      expect(await panel.innerText(), `panel tras el blur con «${malo}»`).not.toMatch(/NaN|€/);
    }

    // Y el contraste del caso: el mismo número BIEN escrito sí calcula, de las dos formas
    // que el parser admite. La Rioja en obra nueva paga IVA 21 % + AJD 1 %.
    expect(ITP_CCAA['rioja'].ajd).toBe(1);
    for (const bueno of ['150000', '150.000']) {
      await sembrar(page, PRECIO, bueno);
      expect(await valorTarjeta(page, 'Precio de la nave industrial'), `precio «${bueno}»`).toBe('150.000,00 €');
      // 150.000 × 21 % = 31.500 · 150.000 × 1 % = 1.500
      expect(await valorTarjeta(page, 'IVA (')).toBe('31.500,00 €');
      expect(await valorTarjeta(page, 'AJD (')).toBe('1500,00 €');
    }
  });

  /**
   * LÍMITE EXTRA — Aragón, segunda mano, 450.000 € EXACTOS.
   *
   * El tramo del 8,5 % de `ITP_CCAA['aragon'].tramosProgresivos` es el MÁS ESTRECHO de toda
   * la tabla: 50.000 € de ancho, entre 400.000 y 450.000. Ninguna vuelta anterior había
   * probado ese corte — el 02/09 se probó Aragón a 1.000.000 €, que los cruza todos y por
   * tanto no discrimina dónde empieza y acaba cada uno. Aquí se comprueba el corte y sus dos
   * vecinos, que es lo que distingue un tramo bien cerrado de uno que se come al siguiente.
   *
   * A mano:
   *   449.000 → 400.000 × 8 % + 49.000 × 8,5 % = 32.000 + 4.165       =  36.165,00 (8,0546 % → «8,05%»)
   *   450.000 → 400.000 × 8 % + 50.000 × 8,5 % = 32.000 + 4.250       =  36.250,00 (8,0556 % → «8,06%»)
   *   451.000 → 36.250 + 1.000 × 9 % = 36.250 + 90                    =  36.340,00 (8,0577 % → «8,06%»)
   *   Un 8 % plano daría 36.000 y un 9 % plano 40.500: ninguno de los dos.
   *   Notaría: 333,561741 + (450.000 − 150.253,03) × 0,0005 = 149,873485
   *            = 483,435226 × 0,95 (rebaja del nº 2.1, 17/10/2026, cabo C0209) = 459,263465
   *            × 1,21 = 555,708793 · medio ×1,75                       =   972,490388
   *   Registro: 171,288457 + (450.000 − 150.253,03) × 0,0003 = 89,924091
   *            = 261,212547 × 0,95 = 248,151920 + 9,015182 = 257,167102 × 1,21 = 311,172193
   *   Total gastos = 36.250 + 972,49 + 311,17 + 500                   =  38.033,66
   *   % sobre el precio = 38.033,66 / 450.000                         =   8,451924 % → «8,45%»
   *   Coste total = 450.000 + 38.033,66                               = 488.033,66
   *   (sin la rebaja: 1.023,67 · 326,97 · 38.100,64)
   */
  test('LÍMITE — Aragón, 450.000 € exactos: el tramo más estrecho de la tabla (8,5 %) se cierra donde debe', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, CAMPOS);
    await page.selectOption('#select-ccaa', 'aragon');

    expect(ITP_CCAA['aragon'].tramosProgresivos?.map((t) => t.tipo)).toEqual([8, 8.5, 9, 9.5, 10]);
    expect(ITP_CCAA['aragon'].tramosProgresivos?.[1].hasta).toBe(450000);
    await expect(page.getByText(/escala progresiva \(8\s% → 8,50\s% → 9\s% → 9,50\s% → 10\s%\)/)).toBeVisible();

    await sembrar(page, PRECIO, '449000');
    expect(await valorTarjeta(page, 'ITP (')).toBe('36.165,00 €');
    await sembrar(page, PRECIO, '450000');
    expect(await valorTarjeta(page, 'ITP (')).toBe('36.250,00 €');
    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (8,06%)');
    await sembrar(page, PRECIO, '451000');
    expect(await valorTarjeta(page, 'ITP (')).toBe('36.340,00 €');

    // Ninguno de los dos tipos planos vecinos, en el corte exacto.
    await sembrar(page, PRECIO, '450000');
    await expect(page.getByText('36.000,00 €')).toHaveCount(0);
    await expect(page.getByText('40.500,00 €')).toHaveCount(0);

    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('972,49 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('311,17 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('38.033,66 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('8,45%');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('488.033,66 €');
  });

  /**
   * EFECTO FAMILIA (las dos pistas del 21/09) — ninguna tiene dónde ocurrir en esta app.
   *
   * 1. `local-comercial` pinta «Ganancia patrimonial 0,00 €» y un «IRPF — SIN CUOTA» en
   *    tarjeta VERDE cuando solo se conoce el precio de venta, en vez de un «Sin calcular»
   *    en gris; `garaje`, `trastero` y `estimador-compraventa-inmueble` lo cierran con un
   *    campo `irpfCalculado`. Aquí no hay ni pestaña de vendedor ni motor de ganancia.
   * 2. `NumberInput.handleBlur` reescribe al `min` un valor fuera de rango, y en «Años de
   *    propiedad» ese `min` es 0, que NO es neutro: es la reventa antes del año. La
   *    reparación (`acotarAlSalir={false}`) no hace falta aquí porque ese campo no existe y
   *    porque en los dos que sí existen el 0 no calcula nada.
   *
   * Se comprueba por la FUENTE y por la pantalla, para que añadir la parte de vendedor sin
   * repasar esto rompa el test en vez de pasar en silencio.
   */
  test('efecto familia — ni IRPF de vendedor ni años de propiedad: las dos pistas del 21/09 no tienen dónde ocurrir', async ({ page }) => {
    const fuente = await leerFuente();
    // 1 — nada de la parte de vendedor.
    expect(fuente).not.toContain('ResultadosVendedor');
    expect(fuente).not.toContain('irpfCalculado');
    expect(fuente).not.toContain('gananciaPatrimonial');
    expect(fuente).not.toContain('SIN CUOTA');
    // 2 — ningún campo cuyo `min` signifique algo distinto de «ningún dato».
    expect(fuente).not.toContain('Años de propiedad');
    expect(fuente).not.toContain('acotarAlSalir');
    // Los dos únicos NumberInput de la app, los dos con min={0}.
    expect(fuente.match(/<NumberInput/g)).toHaveLength(2);
    expect(fuente.match(/min=\{0\}/g)).toHaveLength(2);

    await page.goto(RUTA);
    await esperarHidratacion(page, CAMPOS);
    await sembrar(page, PRECIO, '480000');
    const cuerpo = ((await page.locator('body').textContent()) ?? '').replace(/\s+/g, ' ');
    expect(cuerpo).not.toContain('Ganancia patrimonial');
    expect(cuerpo).not.toContain('SIN CUOTA');
    expect(cuerpo).not.toContain('Años de propiedad');
    // La app promete el coste del COMPRADOR y nada más: ese es su contrato.
    expect(cuerpo).toContain('COSTE TOTAL DE ADQUISICIÓN');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// REGRESIÓN — los tres hallazgos del 21/09/2026 (1175, 1176 y 1177), REPARADOS el 21/09.
//
// Se escribieron con `test.fail()` afirmando lo que DEBERÍA pasar; al repararlos se les quitó
// la marca sin tocar ninguna aserción, así que lo que hoy pasa en verde es exactamente lo que
// ayer fallaba en rojo.
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Regresión — hallazgos 1175, 1176 y 1177 del 21/09/2026', () => {
  /**
   * HALLAZGO 1 (accesibilidad, medio) — la CABECERA de la tabla comparativa es texto blanco
   * sobre `var(--primary)`, y falla en LOS DOS temas.
   *
   * Es lo que quedó de la misma tabla tras dos vueltas de reparación: el 09/09 se arreglaron
   * sus celdas de respuesta (hallazgo 648, `.celdaSi` / `.celdaNo`) y el 10/09 la celda de la
   * cifra (hallazgo 684, `.celdaCifra`). Las tres veces se midió el TEXTO de las celdas; la
   * fila `<thead>` nunca se midió porque su color no está en el texto sino en el FONDO:
   *   `<tr style={{ background: 'var(--primary)', color: '#fff' }}>`
   * Medido el 21/09/2026 con el tema estable:
   *   · claro:  #fff sobre rgb(46,134,171)  → 4,11:1
   *   · oscuro: #fff sobre rgb(63,165,209)  → 2,79:1
   * Con 14,4 px y el peso 700 que el navegador da a un `<th>` no es «texto grande» —la WCAG
   * 2.1 pide ≥18,66 px en negrita—, así que el umbral son 4,5:1 en ambos. En oscuro ni
   * siquiera llegaría al 3:1 del texto grande.
   *
   * Y no es adorno: son los rótulos «Concepto», «Nave industrial» y «Vivienda», es decir, lo
   * único que dice cuál de las dos columnas es la nave. Sin ellos la tabla no se puede leer.
   *
   * Efecto familia: el mismo `<tr style={{ background: 'var(--primary)', color: '#fff' }}>`
   * está escrito en línea, no en el módulo CSS, así que no lo alcanza ningún token.
   */
  test('REPARADO 1175 — la cabecera de la tabla comparativa llega a 4,5:1 en los dos temas', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, CAMPOS);
    // El bloque educativo nace plegado: se despliega para medir lo que el usuario ve.
    await page.getByRole('button', { name: /Ver guía educativa/i }).first().click();
    await expect(page.locator('table').first()).toBeVisible();

    const cabecera = async () => peorContrasteDe(page, 'table thead th');

    const claro = await esperarEstable(cabecera);
    // Antes de repararlo: 4,11:1 en «Concepto», rgb(255,255,255) sobre rgb(46,134,171).
    expect(claro.ratio, `cabecera en claro: «${claro.texto}»`).toBeGreaterThanOrEqual(4.5);

    await activarTemaOscuro(page);
    const oscuro = await esperarEstable(cabecera);
    // Antes de repararlo: 2,79:1, rgb(255,255,255) sobre rgb(63,165,209).
    expect(oscuro.ratio, `cabecera en oscuro: «${oscuro.texto}»`).toBeGreaterThanOrEqual(4.5);
  });

  /**
   * HALLAZGO 2 (contenido, medio) — el consejo «Guarda todos los justificantes» manda sumar
   * las facturas de IVA al valor de adquisición, justo en la app cuyo público lo DEDUCE.
   *
   * En «Consejos para compradores de naves industriales»:
   *   «Conserva facturas de ITP/IVA, notaría, registro y reformas. Al vender, estos gastos
   *    incrementan el valor de adquisición y reducen la ganancia patrimonial o el beneficio
   *    en el Impuesto de Sociedades.»
   *
   * Un IVA DEDUCIDO no es un coste: se recupera. El art. 35.1.b) LIRPF admite en el valor de
   * adquisición los «gastos y tributos inherentes a la adquisición… satisfechos por el
   * adquirente», y el PGC (norma de registro 2ª) excluye del precio de adquisición los
   * impuestos indirectos «cuando sean recuperables de la Hacienda Pública», que es lo que
   * decide el beneficio en el Impuesto de Sociedades que la misma frase menciona. Sumarlo dos
   * veces —deducirlo en el 303 y volver a restarlo de la ganancia— INFRAVALORA la ganancia.
   *
   * La contradicción está dentro del mismo bloque educativo: dos secciones más arriba, la
   * tarjeta «IVA deducible: cuándo y cómo» dice que «el IVA se recupera en la declaración
   * trimestral, reduciendo el coste real de adquisición». Las dos frases no pueden ser
   * ciertas a la vez para el mismo comprador, y la app declara su público en el aviso de
   * cabecera: «Si eres empresa o autónomo».
   *
   * No es efecto familia: `trastero` da el mismo consejo SIN el IVA («la escritura, el ITP
   * pagado y los gastos de notaría»), y en `estimador-compraventa-inmueble` es vivienda,
   * donde el IVA no se deduce. La nave es justo donde sí se deduce, y es la que lo lista.
   *
   * El test acepta las dos reparaciones posibles: quitar el IVA de la lista, o añadir la
   * salvedad del IVA deducido a la frase.
   */
  test('REPARADO 1176 — el consejo de los justificantes no suma el IVA que la propia app deduce', async ({ page }) => {
    await page.goto(RUTA);
    // El bloque educativo vive en el DOM aunque esté plegado: `textContent`.
    const tarjeta = await page.evaluate(() => {
      const fuerte = Array.from(document.querySelectorAll('strong')).find(
        (s) => (s.textContent ?? '').includes('Guarda todos los justificantes'),
      );
      return (fuerte?.parentElement?.textContent ?? '').replace(/\s+/g, ' ').trim();
    });
    expect(tarjeta, 'la tarjeta del consejo existe').toContain('incrementan el valor de adquisición');

    const listaElIva = /Conserva facturas de [^.]*IVA/i.test(tarjeta);
    const llevaSalvedad = /deducid|recuperab|no te lo hayas/i.test(tarjeta);
    // Antes de repararlo: listaElIva = true y llevaSalvedad = false.
    expect(
      !listaElIva || llevaSalvedad,
      `consejo sin salvedad del IVA deducido: «${tarjeta.slice(0, 180)}»`,
    ).toBe(true);
  });

  /**
   * HALLAZGO 3 (contenido, bajo) — el aviso permanente de cabecera promete un IVA deducible
   * también en Canarias, Ceuta y Melilla, donde la propia app dice que no hay IVA.
   *
   * `styles.ivaAviso` es texto FIJO: «Si eres empresa o autónomo: el IVA soportado en la
   * compra de una nave industrial puede ser deducible si tu actividad está sujeta a IVA».
   * Con Canarias elegida, esa frase queda en pantalla a la vez que:
   *   · el recuadro de la comunidad: «⚠️ En Canarias no se aplica el IVA… tributa por el IGIC»
   *   · la tarjeta del impuesto: «IGIC — No calculado»
   *   · el total: «COSTE TOTAL (PARCIAL) — No incluye el IGIC»
   *
   * Es exactamente la forma del hallazgo 647, reparado el 09/09 en los DOS avisos que cuelgan
   * del selector de transmisión: eran texto fijo que explicaba un IVA que la tarjeta de al
   * lado negaba en la misma pantalla. Aquel arreglo los hizo mirar `TERRITORIOS_SIN_IVA`, y
   * este tercer aviso —que está más arriba y es el primero que se lee— se quedó fuera.
   *
   * La hermana `simulador-gastos-compraventa-solar` ya enseña cómo se resuelve: su `ivaAviso`
   * dice «En Canarias, Ceuta y Melilla no rige el IVA: allí la operación va por IGIC o IPSI,
   * que esta calculadora no cifra». `local-comercial` arrastra el mismo defecto que la nave.
   */
  test('REPARADO 1177 — el aviso de IVA deducible nombra el IGIC/IPSI en Canarias, Ceuta y Melilla', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, CAMPOS);

    await page.getByRole('button', { name: /Obra nueva/ }).click();
    await sembrar(page, PRECIO, '500000');

    for (const territorio of ['canarias', 'ceuta', 'melilla']) {
      await page.selectOption('#select-ccaa', territorio);

      // La app YA dice en esa misma pantalla que allí no hay IVA.
      const recuadro = pegarPct((await page.locator('[class*="infoCcaa"]').first().innerText()).replace(/\s+/g, ' '));
      expect(recuadro, `recuadro de ${territorio}`).toMatch(/no se aplica el IVA/);

      // Y el aviso de cabecera tiene que decir lo mismo, en vez de contradecirlo.
      const aviso = (await page.locator('[class*="ivaAviso"]').first().innerText()).replace(/\s+/g, ' ');
      expect(aviso, `aviso de cabecera con ${territorio}: «${aviso}»`).toMatch(
        /IGIC|IPSI|no rige el IVA|no se aplica el IVA|resto de España/,
      );
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 23/09/2026 — la 9ª, y la primera como app de FAMILIA
//
// Antes de escribir nada se ejecutó el fichero entero: 78/78 en verde y ningún `test.fail()`
// pendiente, así que todo lo reparado desde el 23/08 —los tres hallazgos del 21/09 incluidos—
// sigue cerrado.
//
// Las dos reparaciones de familia que tocaron esta app se midieron en el navegador:
//   · `cfe091a7` (22/09) — la gestoría ilegible deja de desaparecer: tarjeta «Sin leer», y el
//     total y el coste dicen que les falta y que el real será MAYOR. El testigo de familia
//     solo lo mide en Madrid, segunda mano; aquí se mide en Canarias, donde el aviso tiene que
//     convivir con el del IGIC en la misma frase, y al cambiar de régimen.
//   · `8d7dcd1b` (23/09) — con el precio ilegible el marcador ya no pide «Introduce el precio»
//     a secas. Aquí se prueba su caso literal («2.000.50») y que sobrevive al cambio de régimen
//     y de comunidad, y en el CASO 3 los otros dos estados: VACÍO/CERO/NEGATIVO («Introduce…»,
//     porque el número SÍ se ha leído y no es un precio) frente a ILEGIBLE.
//
// De lo que salió hoy en garaje y trastero (grupo A), ninguna de las cuatro formas tiene
// dónde ocurrir aquí, y se comprobó una por una en el navegador:
//   (a) tarjeta que publica como definitiva una cifra con el ilegible tomado como 0: las dos
//       tarjetas que lo arrastran (total de gastos y coste total) lo nombran en su propia
//       descripción, y el «x % sobre el precio» va en la misma frase que el «SIN la gestoría».
//       El rótulo no pasa a «(parcial)» con la gestoría, pero tampoco en la referencia
//       (`estimador-compraventa-inmueble`, que es el patrón).
//   (b) descripción de total que afirma sumar la partida perdida: el «Precio + todos los
//       gastos» se sustituye entero por «No incluye…».
//   (c) concordancia en las frases unidas con join: «No incluye el IGIC ni la gestoría, que no
//       se ha podido leer» y «SIN el IGIC… — SIN la gestoría…» concuerdan.
//   (d) varios ilegibles a la vez: con el precio y la gestoría ilegibles el panel se apaga y
//       solo nombra el precio; al leerse el precio aparece la tarjeta de la gestoría. No se
//       contradicen.
//
// PUNTO CIEGO DE FAMILIA — lo que SOLO existe en la nave, que el testigo no mira:
//   · la tercera opción «2ª mano con renuncia al IVA» (inversión del sujeto pasivo), con su
//     rótulo «IVA (renuncia · ISP)» y su AJD — la comparte `local-comercial`, no el resto;
//   · el IVA de local (21 %) en obra nueva y los dos avisos de régimen bajo el selector;
//   · el aviso de cabecera de «IVA deducible» para empresa o autónomo, con su variante IGIC/IPSI;
//   · la tabla comparativa nave/vivienda y los «casos de uso» y consejos de empresa.
//   Ninguno de esos elementos lee la gestoría ni el precio ilegible: el aviso de la gestoría
//   se comprobó con la renuncia y con la obra nueva, en Madrid, Canarias y Ceuta.
//
// De dónde sale CADA cifra esperada de esta tanda (ninguna de memoria):
//  - Tipo general de Andalucía (7 %) → `TIPOS_ITP_CCAA_2025` en `data/fiscal/inmuebles.ts`,
//    que `tipoGeneralDe()` lee para `ITP_CCAA['andalucia'].tipoGeneral`. Sin escala.
//    Andalucía y Castilla-La Mancha eran las dos comunidades que ninguna vuelta había pisado.
//  - Escala de Baleares (8 % hasta 400.000 · 9 % hasta 600.000 · 10 % hasta 1.000.000 ·
//    12 % hasta 2.000.000 · 13 % después) → `ITP_CCAA['baleares'].tramosProgresivos`. El 13 %
//    es el techo de `RANGO_ITP` y ninguna vuelta lo había alcanzado en Baleares.
//  - AJD de Andalucía (1,2 %), Castilla-La Mancha (1,5 %) y Canarias (0,75 %) →
//    `ITP_CCAA[x].ajd` en `data/itp-ccaa.ts`. ITP de Canarias (6,5 %) → `TIPOS_ITP_CCAA_2025`.
//  - IVA de la nave → `IVA_INMUEBLES_2025.local = 21` en `data/fiscal/inmuebles.ts`.
//  - Aranceles → `ARANCELES_NOTARIO` (RD 1426/1989, número 2) y `ARANCELES_REGISTRO`
//    (RD 1427/1989, número 2), con `FACTURA_NOTARIAL` (×1,5 a ×2, punto medio ×1,75) y
//    `REGISTRO_CONCEPTOS` (presentación 6,010121 € + nota simple 3,005061 €). El 21 % de IVA
//    sobre honorarios va dentro de las dos funciones.
//  - Qué es ilegible y qué no → `partesNumericas` en `lib/formatters.ts` («,» y «-» no llevan
//    ninguna cifra; «0,00» y «-150.000» son números) y el filtro de `NumberInput`, que no deja
//    teclear «1e6» ni «500.000 €» (el campo se queda con lo anterior).
//
// Los casos se resolvieron a mano ANTES de abrir el navegador; el desarrollo va comentado
// junto a cada aserción, con los importes sin redondear.
// ═══════════════════════════════════════════════════════════════════════════════

/** «324.015,81 €» → 324015.81. Solo para medir la DIRECCIÓN de un cambio entre dos lecturas. */
function eurosDeTexto(texto: string): number {
  return Number(texto.replace(/[^\d,-]/g, '').replace(',', '.'));
}

test.describe('Re-inspección 23/09/2026 — familia y tres casos nuevos', () => {
  /**
   * 8d7dcd1b, con su caso LITERAL: Madrid, segunda mano, precio «2.000.50» (el millar y el
   * decimal a la estadounidense). `parseSpanishNumber` devuelve NaN por diseño; el panel se
   * abstiene —bien— y el marcador tiene que decir que el precio escrito NO se ha podido leer,
   * en vez de pedir que se introduzca un precio que el usuario está viendo en el campo.
   *
   * Y lo que el commit no probaba: que el aviso sigue ahí al cambiar de régimen (obra nueva,
   * renuncia) y de comunidad (Canarias, Ceuta), que son las ramas que reescriben media página.
   */
  test('8d7dcd1b — el precio ilegible se nombra, no se reescribe al salir y sobrevive al cambio de régimen y de comunidad', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, CAMPOS);
    const panel = page.locator('[class*="resultados"]').first();
    const campo = page.locator(`input[aria-label="${PRECIO}"]`);

    // VACÍO: el mensaje de siempre, sin hablar de lectura.
    await expect(panel).toContainText('Introduce el precio de la nave industrial para ver el desglose de gastos');
    await expect(panel).not.toContainText('No se ha podido leer');

    // ILEGIBLE: el caso literal del commit.
    await sembrar(page, PRECIO, '2.000.50');
    const literal = 'No se ha podido leer el precio «2.000.50».';
    await expect(panel).toContainText(literal);
    await expect(page.locator('h3', { hasText: 'COSTE TOTAL' })).toHaveCount(0);

    // Entrar y salir del campo no lo convierte en un número (handleBlur solo acota con !isNaN).
    await campo.click();
    await page.keyboard.press('Tab');
    await esperarValorEnReact(page, campo, '2.000.50');
    await expect(panel).toContainText(literal);

    // Las ramas que reescriben la página no se lo llevan por delante.
    for (const boton of [/Obra nueva/, /renuncia/, /Segunda mano/]) {
      await page.getByRole('button', { name: boton }).click();
      for (const territorio of ['canarias', 'ceuta', 'madrid']) {
        await page.selectOption('#select-ccaa', territorio);
        await expect(panel, `${boton} · ${territorio}`).toContainText(literal);
        expect(await panel.innerText(), `${boton} · ${territorio}`).not.toMatch(/NaN|€/);
      }
    }
  });

  /**
   * cfe091a7 fuera de la base del testigo de familia (que solo mide Madrid, segunda mano).
   *
   * Canarias, OBRA NUEVA, 320.000 €. Allí no rige el IVA: el IGIC no se cifra y el total ya
   * es PARCIAL por eso. Con la gestoría ilegible, el mismo total tiene que decir DOS cosas que
   * le faltan, y las dos en la dirección correcta (el coste real es MAYOR).
   *
   * A mano:
   *   IGIC → no calculado (TERRITORIOS_SIN_IVA.canarias)
   *   AJD = 320.000 × 0,75 % (ITP_CCAA['canarias'].ajd)                   =   2.400,00
   *   (⚠️ Las cifras de este bloque son las de antes del 26/09 —con IVA en los honorarios— y del
   *   17/10 —sin la rebaja del nº 2.1—; las vigentes van junto a las aserciones, abajo.)
   *   Notaría: 333,559925 + (320.000 − 150.253,03) × 0,0005 = 84,873485
   *            = 418,43341 × 1,21 = 506,304426 · medio ×1,75              =     886,032746
   *   Registro: 171,287973 + (320.000 − 150.253,03) × 0,0003 = 50,924091
   *            = 222,212064 + 9,015182 = 231,227246 × 1,21                =     279,784967
   *   Con gestoría 450:  2.400 + 886,03 + 279,78 + 450                    =   4.015,81 → coste 324.015,81
   *   Con gestoría «2.000.50» (no se lee, no se suma):                    =   3.565,81 → coste 323.565,81
   *   Dirección medida: la cifra publicada BAJA 450 € → el aviso tiene que decir «mayor».
   *   % sobre el precio sin gestoría = 3.565,81 / 320.000 = 1,11431 %     → «1,11%»
   *
   * Y al pasar a SEGUNDA MANO sin tocar la gestoría (ITP 6,5 % de Canarias, no hay IGIC):
   *   ITP = 320.000 × 6,5 % = 20.800 · total = 20.800 + 886,03 + 279,78   =  21.965,81 → coste 341.965,81
   *   % = 21.965,81 / 320.000 = 6,86432 %                                 → «6,86%»
   *   El aviso de la gestoría se queda y el del IGIC se va.
   */
  test('cfe091a7 — en Canarias el aviso de la gestoría convive con el del IGIC, dice «mayor» y sobrevive al cambio de régimen', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, CAMPOS);
    expect(ITP_CCAA['canarias'].ajd).toBe(0.75);
    expect(ITP_CCAA['canarias'].tipoGeneral).toBe(6.5);
    await page.selectOption('#select-ccaa', 'canarias');
    await page.getByRole('button', { name: /Obra nueva/ }).click();
    await sembrar(page, PRECIO, '320000');

    // Con el dato legible: la referencia.
    await sembrar(page, GESTORIA, '450');
    expect(await valorTarjeta(page, 'AJD (')).toBe('2400,00 €');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('450,00 €');
    // 26/09/2026 (hallazgo 2214): en Canarias, Ceuta y Melilla la notaría y el registro van SIN
    // IVA —su factura lleva IGIC o IPSI, que la app no calcula y nombra junto al total—, así que
    // las dos líneas son las de antes ÷ 1,21 (el arancel × 1,75 y el arancel del registro).
    //   notaría 418,43341 × 1,75 = 732,258468 · registro 231,227246
    //   con gestoría 450: 2.400 + 732,26 + 231,23 + 450 = 3.813,49 → coste 323.813,49
    //   sin la gestoría ilegible: 3.363,49 → coste 323.363,49 · 3.363,49 / 320.000 = 1,0511 % → 1,05 %
    //   segunda mano: 20.800 + 732,26 + 231,23 = 21.763,49 → coste 341.763,49 · 6,8011 % → 6,80 %
    // 17/10/2026 (cabo C0209): con la base del BOE y la rebaja del 5 % del nº 2.1, notaría
    //   418,435226 × 0,95 × 1,75 = 695,648563 · registro 222,212547 × 0,95 + 9,015182 = 220,117102
    //   con gestoría 450: 2.400 + 695,65 + 220,12 + 450 = 3.765,77 → coste 323.765,77
    //   sin la gestoría ilegible: 3.315,77 → coste 323.315,77 · 3.315,77 / 320.000 = 1,0362 % → 1,04 %
    //   segunda mano: 20.800 + 695,65 + 220,12 = 21.715,77 → coste 341.715,77 · 6,7862 % → 6,79 %
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('3765,77 €');
    const conDato = await valorTarjeta(page, 'COSTE TOTAL');
    expect(conDato).toBe('323.765,77 €');
    // 24/09/2026: «puede ser mayor» y no «será»: el IGIC tiene tipo cero (viviendas protegidas
    // con garaje y anexos, equipamiento comunitario; Ley canaria 4/2012, arts. 52 y 58) y el
    // IPSI depende de la ordenanza de cada ciudad. Solo la gestoría ilegible autoriza el «será».
    expect(await descripcionTarjeta(page, 'COSTE TOTAL')).toBe('No incluye el IGIC: el coste real puede ser mayor');

    // Con el dato ilegible.
    await sembrar(page, GESTORIA, '2.000.50');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('Sin leer');
    expect(await rotuloTarjeta(page, /^Total gastos adicionales/)).toBe('Total gastos adicionales (parcial)');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('3315,77 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toBe(
      `1,04% sobre el precio de compra — SIN el IGIC, que no está incluido — SIN la gestoría, que no se ha podido leer${sinHonorarios('IGIC')}`,
    );
    const sinDato = await valorTarjeta(page, 'COSTE TOTAL');
    expect(sinDato).toBe('323.315,77 €');
    const aviso = await descripcionTarjeta(page, 'COSTE TOTAL');
    expect(aviso).toBe('No incluye el IGIC ni la gestoría, que no se ha podido leer: el coste real será mayor');

    // La dirección se CALCULA: la cifra publicada bajó, así que el aviso tiene que decir «mayor»
    // y nunca mandar descontar.
    const delta = eurosDeTexto(sinDato) - eurosDeTexto(conDato);
    expect(delta).toBeCloseTo(-450, 2);
    expect(aviso).toMatch(/mayor/);
    expect(aviso).not.toMatch(/descont|menor|techo/i);

    // Cambio de régimen con la gestoría aún ilegible: el IGIC se va, la gestoría se queda.
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (6,50%)');
    expect(await valorTarjeta(page, 'ITP (')).toBe('20.800,00 €');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('Sin leer');
    // 24/09/2026 (hallazgo 1585): sin el IGIC el total sigue siendo PARCIAL, porque le falta la
    // gestoría ilegible. Hasta ese día aquí se esperaba el título definitivo, que era el defecto.
    expect(await rotuloTarjeta(page, /^Total gastos adicionales/)).toBe('Total gastos adicionales (parcial)');
    expect(await rotuloTarjeta(page, /^COSTE TOTAL/)).toBe('COSTE TOTAL (PARCIAL)');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('21.715,77 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toBe(
      `6,79% sobre el precio de compra — SIN la gestoría, que no se ha podido leer${sinHonorarios('IGIC')}`,
    );
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('341.715,77 €');
    expect(await descripcionTarjeta(page, 'COSTE TOTAL')).toBe(
      'No incluye la gestoría, que no se ha podido leer: el coste real será mayor',
    );
    expect(await page.locator('body').innerText()).not.toContain('NaN');
  });

  /**
   * CASO 1 (NORMAL) — Andalucía, segunda mano, 380.000 €, gestoría 650 €. Y la misma nave con
   * RENUNCIA a la exención, que en Andalucía no se había probado nunca.
   *
   * A mano, segunda mano:
   *   ITP = 380.000 × 7 % (ITP_CCAA['andalucia'].tipoGeneral, sin escala) =  26.600,00 → «ITP (7,00%)»
   *   AJD = 0 (segunda mano sin renuncia)
   *   Notaría — RD 1426/1989, número 2 (bases del BOE, 17/10/2026, cabo C0209):
   *     90,151816 + 108,182254 + 45,075900 + 90,151816
   *       + (380.000 − 150.253,03) × 0,0005 = 114,873515                  =     448,435226
   *     × 0,95 (rebaja del 5 % del nº 2.1)                                =     426,013465
   *     × 1,21                                                           =     515,476293
   *     ×1,5 = 773,214439 · ×2 = 1.030,952585 · medio ×1,75              =     902,083512
   *   Registro — RD 1427/1989, número 2:
   *     24,040484 + 42,070847 + 37,563256 + 67,613871
   *       + (380.000 − 150.253,03) × 0,0003 = 68,924089                  =     240,212547
   *     × 0,95 = 228,201920 + 6,010121 + 3,005061 = 237,217102 × 1,21     =     287,032693
   *   (sin la rebaja: notaría 949,56, registro 301,56)
   *   Total gastos = 26.600 + 902,08 + 287,03 + 650                      =  28.439,11
   *   % sobre el precio = 28.439,11 / 380.000 = 7,483976 %               → «7,48%»
   *   Coste total = 380.000 + 28.439,11                                  = 408.439,11
   *
   * Con renuncia (IVA_INMUEBLES_2025.local = 21 · ITP_CCAA['andalucia'].ajd = 1,2):
   *   IVA = 380.000 × 21 % = 79.800 · AJD = 380.000 × 1,2 % = 4.560 · ITP = 0
   *   Total gastos = 79.800 + 4.560 + 902,08 + 287,03 + 650              =  86.199,11
   *   % = 86.199,11 / 380.000 = 22,683976 %                              → «22,68%»
   *   Coste total                                                        = 466.199,11
   */
  test('CASO 1 (normal) — Andalucía, segunda mano, 380.000 €: el 7 % plano; y con renuncia, IVA 21 % + AJD 1,2 %', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, CAMPOS);
    expect(ITP_CCAA['andalucia'].tipoGeneral).toBe(7);
    expect(ITP_CCAA['andalucia'].tramosProgresivos).toBeUndefined();
    expect(ITP_CCAA['andalucia'].ajd).toBe(1.2);
    expect(IVA_INMUEBLES_2025.local).toBe(21);

    await page.selectOption('#select-ccaa', 'andalucia');
    await sembrar(page, PRECIO, '380.000');
    await sembrar(page, GESTORIA, '650');

    expect(await valorTarjeta(page, 'Precio de la nave industrial')).toBe('380.000,00 €');
    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (7,00%)');
    expect(await valorTarjeta(page, 'ITP (')).toBe('26.600,00 €');
    await expect(page.locator('h3', { hasText: 'AJD (' })).toHaveCount(0);
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('902,08 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain('entre 773,21 € y 1030,95 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('287,03 €');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('650,00 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('28.439,11 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toBe('7,48% sobre el precio de compra');
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('408.439,11 €');

    // El recuadro de la comunidad anuncia los mismos tipos que la tarjeta cobra.
    const recuadro = pegarPct((await page.locator('[class*="infoCcaa"]').first().innerText()).replace(/\s+/g, ' '));
    expect(recuadro).toContain('ITP General 7%');
    expect(recuadro).toContain('AJD 1,2%');

    // Renuncia a la exención: ITP fuera, IVA + AJD dentro, el resto del desglose intacto.
    await page.getByRole('button', { name: /renuncia/ }).click();
    expect(await rotuloTarjeta(page, /^IVA \(renuncia/)).toBe('IVA (renuncia · ISP) (21,00%)');
    expect(await valorTarjeta(page, 'IVA (renuncia')).toBe('79.800,00 €');
    expect(await rotuloTarjeta(page, /^AJD \(/)).toBe('AJD (1,20%)');
    expect(await valorTarjeta(page, 'AJD (')).toBe('4560,00 €');
    await expect(page.locator('h3', { hasText: /^ITP \(/ })).toHaveCount(0);
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('902,08 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('287,03 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('86.199,11 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toBe('22,68% sobre el precio de compra');
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('466.199,11 €');
  });

  /**
   * CASO 2 (LÍMITE) — Baleares, segunda mano: la escala llega a su tramo MÁS ALTO, el 13 %,
   * que es el techo de `RANGO_ITP` y que ninguna vuelta había alcanzado en Baleares (el 14/09
   * se probó 1.000.000 € exactos, el corte 10 % → 12 %).
   *
   * A mano (ITP_CCAA['baleares'].tramosProgresivos):
   *   2.000.000 exactos → 400.000 × 8 % + 200.000 × 9 % + 400.000 × 10 % + 1.000.000 × 12 %
   *                     = 32.000 + 18.000 + 40.000 + 120.000               = 210.000,00 (10,50 %)
   *     El 13 % NO puede entrar: el tramo del 12 % llega hasta 2.000.000 inclusive.
   *   2.000.100         → 210.000 + 100 × 13 %                              = 210.013,00 (10,500125 % → «10,50%»)
   *   2.400.000         → 210.000 + 400.000 × 13 % = 210.000 + 52.000       = 262.000,00
   *                       tipo efectivo = 262.000 / 2.400.000 = 10,916667 % → «10,92%»
   *   Notaría (2.400.000), bases del BOE (17/10/2026, cabo C0209):
   *       333,561786 + 450.759,07 × 0,0005 = 225,379535 + (2.400.000 − 601.012,10) × 0,0003
   *       = 539,69637 → 1.098,637646 × 0,95 (rebaja del nº 2.1) = 1.043,705764
   *       × 1,21 = 1.262,883974 · ×1,5 = 1.894,325961 · ×2 = 2.525,767948
   *       · medio ×1,75                                                     =   2.210,046955
   *   Registro (2.400.000): 171,288458 + 450.759,07 × 0,0003 = 135,227721
   *       + 1.798.987,90 × 0,0002 = 359,79758 → 666,313758 (bajo el tope de 2.181,67)
   *       × 0,95 = 632,998070 + 9,015182 = 642,013252 × 1,21                 =     776,836035
   *   (sin la rebaja: notaría 2.326,36, registro 817,15)
   *   Gestoría 800
   *   Total gastos = 262.000 + 2.210,05 + 776,84 + 800                      = 265.786,89
   *   % = 265.786,89 / 2.400.000 = 11,074454 %                              → «11,07%»
   *   Coste total = 2.400.000 + 265.786,89                                  = 2.665.786,89
   */
  test('CASO 2 (límite) — Baleares, 2.400.000 €: la escala llega a su tramo más alto (13 %) y no antes de 2.000.000', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, CAMPOS);
    expect(ITP_CCAA['baleares'].tramosProgresivos).toEqual([
      { hasta: 400000, tipo: 8 },
      { hasta: 600000, tipo: 9 },
      { hasta: 1000000, tipo: 10 },
      { hasta: 2000000, tipo: 12 },
      { hasta: Infinity, tipo: 13 },
    ]);
    expect(RANGO_ITP_OTROS.max).toBe(13);

    await page.selectOption('#select-ccaa', 'baleares');
    const recuadro = pegarPct((await page.locator('[class*="infoCcaa"]').first().innerText()).replace(/\s+/g, ' '));
    expect(recuadro).toContain('8% → 9% → 10% → 12% → 13%');

    // El corte: en 2.000.000 exactos el 13 % todavía no entra.
    await sembrar(page, PRECIO, '2.000.000');
    expect(await valorTarjeta(page, 'ITP (')).toBe('210.000,00 €');
    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (10,50%)');
    // Y 100 € más allá entra, al 13 %: 13 € de cuota más.
    await sembrar(page, PRECIO, '2.000.100');
    expect(await valorTarjeta(page, 'ITP (')).toBe('210.013,00 €');

    await sembrar(page, PRECIO, '2.400.000');
    await sembrar(page, GESTORIA, '800');
    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (10,92%)');
    expect(await valorTarjeta(page, 'ITP (')).toBe('262.000,00 €');
    await expect(page.locator('h3', { hasText: 'AJD (' })).toHaveCount(0);
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('2210,05 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain('entre 1894,33 € y 2525,77 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('776,84 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('265.786,89 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toBe('11,07% sobre el precio de compra');
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('2.665.786,89 €');
  });

  /**
   * CASO 3 (RECHAZO) — Castilla-La Mancha, 2ª mano con renuncia. Los TRES estados del marcador
   * que 8d7dcd1b tiene que distinguir, con entradas que el campo SÍ deja teclear:
   *   · «0,00» y «-150.000» se LEEN (son números) pero no son un precio → ni cifra ni «no se ha
   *     podido leer»: «Introduce el precio…». El negativo, al salir del campo, se acota a «0».
   *   · «,» y «-» no llevan ninguna cifra → `partesNumericas` devuelve null → ILEGIBLE, y el
   *     marcador lo dice con el texto escrito entre comillas.
   * Ninguno de los cuatro publica cifra, ni NaN.
   *
   * Y el contraste: 165.000 € bien escrito sí calcula.
   *   IVA = 165.000 × 21 % (IVA_INMUEBLES_2025.local)                       =  34.650,00
   *   AJD = 165.000 × 1,5 % (ITP_CCAA['castilla-mancha'].ajd)              =   2.475,00
   *   Notaría (bases del BOE, 17/10/2026, cabo C0209):
   *            333,561786 + (165.000 − 150.253,03) × 0,0005 = 7,373440
   *            = 340,935226 × 0,95 (rebaja del nº 2.1) = 323,888465
   *            × 1,21 = 391,905043 · ×1,5 = 587,857564 · ×2 = 783,810085
   *            · medio ×1,75                                               =     685,833825
   *   Registro: 171,288458 + (165.000 − 150.253,03) × 0,0003 = 4,424091
   *            = 175,712547 × 0,95 = 166,926920 + 9,015182 = 175,942102
   *            × 1,21                                                      =     212,889943
   *   (sin la rebaja: notaría 721,93, registro 223,52)
   *   Gestoría 500 (la de fábrica)
   *   Total gastos = 34.650 + 2.475 + 685,83 + 212,89 + 500                 =  38.523,72
   *   % = 38.523,72 / 165.000 = 23,347709 %                                 → «23,35%»
   *   Coste total = 165.000 + 38.523,72                                     = 203.523,72
   */
  test('CASO 3 (rechazo) — Castilla-La Mancha con renuncia: cero y negativo piden precio, «,» y «-» no se leen; 165.000 € sí calcula', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, CAMPOS);
    expect(ITP_CCAA['castilla-mancha'].ajd).toBe(1.5);
    await page.selectOption('#select-ccaa', 'castilla-mancha');
    await page.getByRole('button', { name: /renuncia/ }).click();

    const panel = page.locator('[class*="resultados"]').first();
    const campo = page.locator(`input[aria-label="${PRECIO}"]`);
    const sinCifra = async (rotulo: string): Promise<void> => {
      await expect(page.locator('h3', { hasText: 'COSTE TOTAL' }), rotulo).toHaveCount(0);
      await expect(page.locator('h3', { hasText: /^IVA \(/ }), rotulo).toHaveCount(0);
      expect(await panel.innerText(), rotulo).not.toMatch(/NaN|€/);
    };

    // CERO escrito con decimales: se ha leído, y es cero.
    await sembrar(page, PRECIO, '0,00');
    // Desde el 26/09 (hallazgo 2207): se ha leído, es cero, y el mensaje dice que no vale.
    await expect(panel).toContainText(`El precio escrito («0,00») ${PRECIO_NO_VALE}`);
    await expect(panel).not.toContainText('No se ha podido leer');
    await sinCifra('«0,00»');

    // ILEGIBLES: ninguna cifra dentro.
    for (const malo of [',', '-']) {
      await sembrar(page, PRECIO, malo);
      await expect(panel).toContainText(`No se ha podido leer el precio «${malo}»`);
      await sinCifra(`«${malo}»`);
    }

    // NEGATIVO: se ha leído, no es un precio; al salir del campo se acota a 0.
    await sembrar(page, PRECIO, '-150.000');
    await expect(panel).toContainText(`El precio escrito («-150.000») ${PRECIO_NO_VALE}`);
    await expect(panel).not.toContainText('No se ha podido leer');
    await sinCifra('«-150.000» con el foco');
    await campo.click();
    await page.keyboard.press('Tab');
    await esperarValorEnReact(page, campo, '0');
    await expect(panel).toContainText(`El precio escrito («0») ${PRECIO_NO_VALE}`);
    await sinCifra('«-150.000» tras el blur');

    // El contraste: bien escrito, calcula.
    await sembrar(page, PRECIO, '165.000');
    expect(await rotuloTarjeta(page, /^IVA \(renuncia/)).toBe('IVA (renuncia · ISP) (21,00%)');
    expect(await valorTarjeta(page, 'IVA (renuncia')).toBe('34.650,00 €');
    expect(await rotuloTarjeta(page, /^AJD \(/)).toBe('AJD (1,50%)');
    expect(await valorTarjeta(page, 'AJD (')).toBe('2475,00 €');
    await expect(page.locator('h3', { hasText: /^ITP \(/ })).toHaveCount(0);
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('685,83 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain('entre 587,86 € y 783,81 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('212,89 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('38.523,72 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toBe('23,35% sobre el precio de compra');
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('203.523,72 €');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// HALLAZGOS de la re-inspección del 23/09/2026 (1267 y 1268), REPARADOS el mismo día.
// Se escribieron con `test.fail()` afirmando lo que DEBERÍA pasar, y fallaban en la aserción
// del defecto, no en la preparación; reparados, se les quitó la marca y quedan de regresión.
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Regresión — hallazgos 1267 y 1268 del 23/09/2026', () => {
  /**
   * HALLAZGO 1 (contenido, medio) — EFECTO FAMILIA. El FAQPage y la FAQ visible dicen que una
   * nave nueva «paga IVA al 21%» sin la salvedad de Canarias, Ceuta y Melilla, mientras la
   * calculadora, en esos tres territorios, responde «IGIC · No calculado» / «IPSI».
   *
   * Es la forma del hallazgo 714 (trastero) y del 1200 (garaje): «la FAQ y los dos FAQPage
   * seguían diciendo que un trastero nuevo paga IVA sin matiz… La palabra IGIC no aparecía en
   * todo el metadata.ts». Se reparó en garaje, trastero, solar y terreno-rústico, que hoy dicen
   * «En Canarias, Ceuta y Melilla no rige el IVA sino el IGIC o el IPSI». En la nave, `grep IGIC
   * metadata.ts` sigue dando 0, y el FAQPage es el canal que citan los asistentes de IA.
   * (`local-comercial` y `estimador-compraventa-inmueble` tampoco lo llevan.)
   *
   * La pregunta del FAQPage ya nombra Ceuta y Melilla —para su bonificación del ITP—, así que
   * el test exige que nombre el IGIC o el IPSI, no solo los territorios.
   */
  test('REPARADO 23/09 (1267) — el FAQPage y la FAQ visible dicen que en Canarias, Ceuta y Melilla no rige el IVA', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, CAMPOS);

    // La calculadora SÍ lo dice: en Canarias, obra nueva, no hay IVA que cifrar.
    await page.selectOption('#select-ccaa', 'canarias');
    await page.getByRole('button', { name: /Obra nueva/ }).click();
    await sembrar(page, PRECIO, '500000');
    expect(await valorTarjeta(page, 'IGIC')).toBe('No calculado');

    // El FAQPage (JSON-LD) existe y contesta con el IVA de la península.
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = bloques.find((b) => b.includes('"FAQPage"')) ?? '';
    expect(faq, 'hay FAQPage').not.toBe('');
    const pregunta = (JSON.parse(faq) as { mainEntity: { name: string; acceptedAnswer: { text: string } }[] })
      // Desde el 08/10/2026 (3085) el FAQPage hace la misma pregunta que la FAQ visible.
      .mainEntity.find((q) => q.name === '¿Se paga IVA o ITP al comprar una nave industrial?');
    const respuesta = pregunta?.acceptedAnswer.text ?? '';
    expect(respuesta, 'la respuesta existe y habla del IVA de obra nueva').toContain('se paga IVA al 21\u00A0%');

    // La FAQ visible, igual.
    const visible = await page.evaluate(() => {
      const fuerte = Array.from(document.querySelectorAll('strong')).find(
        (s) => (s.textContent ?? '').includes('¿Se paga IVA o ITP al comprar una nave industrial?'),
      );
      return (fuerte?.parentElement?.textContent ?? '').replace(/\s+/g, ' ').trim();
    });
    expect(pegarPct(visible), 'la FAQ visible existe').toContain('se paga IVA al 21%');

    // EL DEFECTO — ninguna de las dos nombraba el impuesto que rige allí.
    expect(respuesta, `FAQPage sin salvedad territorial: «${respuesta.slice(0, 160)}…»`).toMatch(/IGIC|IPSI/);
    expect(visible, `FAQ visible sin salvedad territorial: «${visible.slice(0, 160)}…»`).toMatch(/IGIC|IPSI/);
    // Reparado con la frase de garaje, trastero, solar y terreno-rústico, en los dos canales.
    const salvedad = 'En Canarias, Ceuta y Melilla no rige el IVA sino el IGIC o el IPSI';
    expect(respuesta).toContain(salvedad);
    expect(visible).toContain(salvedad);
  });

  /**
   * HALLAZGO 2 (contenido, bajo) — el consejo «Consulta el régimen de IVA antes de comprar»
   * presenta TODA segunda mano como ITP no deducible, y con eso empuja hacia la obra nueva:
   * «Si tu actividad está sujeta a IVA, comprar en primera mano (IVA 21%) puede ser más
   * ventajoso que segunda mano (ITP no deducible)».
   *
   * Para quien el consejo va dirigido —actividad sujeta a IVA— la propia app dice lo contrario
   * en tres sitios: el aviso bajo «Segunda mano» («Entre empresarios con derecho a deducción es
   * habitual renunciar a la exención… no se paga ITP»), la FAQ «¿Se paga IVA o ITP…?» («Con una
   * salvedad que en naves industriales es frecuente») y el comentario del código que añadió la
   * tercera opción («para el público que declara la app es el caso frecuente, no el raro»).
   *
   * Es la forma del hallazgo B del 27/08/2026 —el recuadro de limitaciones negaba la renuncia
   * que la app sí calcula—: un texto del bloque educativo que se quedó con dos opciones cuando
   * la herramienta ya tenía tres.
   */
  test('REPARADO 23/09 (1268) — el consejo del régimen de IVA ya no presenta toda segunda mano como ITP no deducible', async ({ page }) => {
    await page.goto(RUTA);
    // El bloque educativo vive en el DOM aunque esté plegado: `textContent`.
    const consejo = await page.evaluate(() => {
      const fuerte = Array.from(document.querySelectorAll('strong')).find(
        (s) => (s.textContent ?? '').includes('Consulta el régimen de IVA antes de comprar'),
      );
      return (fuerte?.parentElement?.textContent ?? '').replace(/\s+/g, ' ').trim();
    });
    // (Hasta la reparación decía «segunda mano (ITP no deducible)»; ahora acota el ITP a la
    // segunda mano SIN renuncia.)
    expect(consejo, 'el consejo existe y compara primera y segunda mano').toContain('primera mano');
    expect(consejo).toContain('Sin renuncia, la segunda mano paga ITP, que no es deducible');

    // La app sí ofrece la tercera vía, y la llama la habitual entre empresarios.
    await expect(page.getByRole('button', { name: /renuncia/ })).toHaveCount(1);

    // EL DEFECTO — el consejo no la mencionaba.
    expect(consejo, `consejo sin la renuncia: «${consejo}»`).toMatch(/renuncia/i);
    // Reparado: nombra la renuncia, su mecánica (ISP) y que es deducible.
    expect(consejo).toContain('inversión del sujeto pasivo');
    expect(consejo).toContain('también es deducible');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Efecto familia del hallazgo 1272 de solar, encontrado al repararlo y reparado aquí el mismo
// día (23/09/2026): con la gestoría ilegible, el cierre SUSTITUÍA la salvedad del IVA
// deducible por el aviso, y «el coste real será mayor» quedaba falso para quien lo deduce.
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Regresión — familia del hallazgo 1272 (23/09/2026)', () => {
  test('obra nueva y renuncia con la gestoría ilegible: el aviso se suma a la salvedad del IVA', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, CAMPOS);
    await page.selectOption('#select-ccaa', 'madrid');
    await page.getByRole('button', { name: /Obra nueva/ }).click();
    await sembrar(page, PRECIO, '300000');
    await sembrar(page, GESTORIA, '2.000.50');

    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('Sin leer');
    // 24/09/2026 (hallazgo 1585): la tarjeta se lee por «COSTE TOTAL» y su título es PARCIAL;
    // hasta ese día se leía por «COSTE TOTAL DE ADQUISICIÓN», el título de una cifra definitiva.
    expect(await rotuloTarjeta(page, /^COSTE TOTAL/)).toBe('COSTE TOTAL (PARCIAL)');
    expect(await descripcionTarjeta(page, 'COSTE TOTAL')).toBe(
      'No incluye la gestoría, que no se ha podido leer: el coste real será mayor (precio + gastos antes de deducir el IVA si tienes derecho)',
    );

    await page.getByRole('button', { name: /renuncia al IVA/ }).click();
    expect(await rotuloTarjeta(page, /^COSTE TOTAL/)).toBe('COSTE TOTAL (PARCIAL)');
    expect(await descripcionTarjeta(page, 'COSTE TOTAL')).toBe(
      'No incluye la gestoría, que no se ha podido leer: el coste real será mayor (precio + gastos antes de deducir el IVA si tienes derecho)',
    );

    // Segunda mano (ITP): no hay IVA que deducir, el aviso va solo.
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    expect(await rotuloTarjeta(page, /^COSTE TOTAL/)).toBe('COSTE TOTAL (PARCIAL)');
    expect(await descripcionTarjeta(page, 'COSTE TOTAL')).toBe('No incluye la gestoría, que no se ha podido leer: el coste real será mayor');

    // Canarias con obra nueva: falta el IGIC y no hay IVA, así que tampoco hay salvedad.
    await page.selectOption('#select-ccaa', 'canarias');
    await page.getByRole('button', { name: /Obra nueva/ }).click();
    expect(await descripcionTarjeta(page, 'COSTE TOTAL')).toBe(
      'No incluye el IGIC ni la gestoría, que no se ha podido leer: el coste real será mayor',
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// INSPECCIÓN 24/09/2026 — régimen × territorio (lo que el testigo de familia no ve), el IPSI
// con renuncia y dos datos normativos que la nave hereda de la VIVIENDA.
//
// El testigo de familia (tests/familias/compraventa.spec.ts) solo exige fila para los
// <NumberInput>; el selector de régimen (tres botones) y el <select> de territorio quedan en su
// punto ciego, y su bloque del IGIC solo recorre CANARIAS. Aquí se barren las 19 × 3
// combinaciones y se prueba el IPSI de Melilla con renuncia.
//
// Casos resueltos a mano ANTES de abrir el navegador (notas en el scratchpad del Inspector):
//  · Tipos de ITP → TIPOS_ITP_CCAA_2025 (data/fiscal/inmuebles.ts) vía ITP_CCAA (data/itp-ccaa.ts).
//  · AJD, escalas, bonificación y territorios sin IVA → ITP_CCAA, BONIFICACION_CUOTA_CEUTA_MELILLA,
//    TERRITORIOS_SIN_IVA (data/itp-ccaa.ts). IVA de la nave → IVA_INMUEBLES_2025.local = 21.
//  · Notaría → ARANCELES_NOTARIO (RD 1426/1989) × FACTURA_NOTARIAL (medio ×1,75) · Registro →
//    ARANCELES_REGISTRO (RD 1427/1989) + REGISTRO_CONCEPTOS (6,010121 + 3,005061) · IVA 21 %.
//  · Los tres hallazgos de DATO se anclan en la norma oficial consultada en sesión, porque es
//    justo donde data/ se equivoca: Ley 13/1997 de la Generalitat Valenciana, art. 13.Uno
//    (BOE-A-1998-8202, texto consolidado, «Última modificación: 10 de agosto de 2026»); Norma
//    Foral 1/2011 de Bizkaia, arts. 13, 44 y 58.35 (texto consolidado de la Diputación,
//    «Última modificación normativa: 20/04/2026»); Norma Foral 18/1987 de Gipuzkoa, arts. 11
//    y 29 (texto actualizado de la Diputación, 2025).
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Inspección 24/09/2026 — régimen × territorio, IPSI con renuncia y datos forales', () => {
  test.describe.configure({ timeout: 120_000 });

  /**
   * CASO 1 (NORMAL) — La Rioja, 420.000 €, gestoría 600 €, en los TRES regímenes (La Rioja no
   * se había probado nunca en ninguno).
   *
   *   Notaría (bases del BOE, 17/10/2026, cabo C0209): 90,151816 + 24.040,49×0,45 %
   *            + 30.050,60×0,15 % + 90.151,82×0,10 % + (420.000 − 150.253,03)×0,05 %
   *            = 468,435226 × 0,95 (rebaja del nº 2.1) = 445,013465 × 1,21 = 538,466293
   *            → horquilla 807,70 – 1.076,93 · medio ×1,75 = 942,316013         →    942,32
   *   Registro: 24,040484 + 42,070847 + 37,563256 + 67,613871 + 269.746,97×0,03 %
   *            = 252,212547 × 0,95 = 239,601920 + 9,015182 = 248,617102
   *            × 1,21 = 300,826693                                           →    300,83
   *   (sin la rebaja: notaría 991,91 entre 850,21 y 1.133,61, registro 316,08)
   *   a) Segunda mano: ITP 420.000 × 7 % (ITP_CCAA.rioja.tipoGeneral, sin escala) = 29.400,00
   *      total 29.400 + 942,32 + 300,83 + 600 = 31.243,15 (7,4388 → 7,44 %) · coste 451.243,15
   *   b) Renuncia: IVA 21 % = 88.200,00 + AJD 1 % (ITP_CCAA.rioja.ajd) = 4.200,00, sin ITP
   *      total 94.243,15 (22,4388 → 22,44 %) · coste 514.243,15
   *   c) Obra nueva: los mismos importes, con el rótulo «IVA (21,00%)» y sin ISP.
   */
  test('CASO 1 (normal) — La Rioja, 420.000 €: ITP 7 %, renuncia con IVA + AJD 1 % y obra nueva', async ({ page }) => {
    expect(ITP_CCAA['rioja'].tipoGeneral).toBe(7);
    expect(ITP_CCAA['rioja'].tramosProgresivos).toBeUndefined();
    expect(ITP_CCAA['rioja'].ajd).toBe(1);
    expect(IVA_INMUEBLES_2025.local).toBe(21);

    await page.goto(RUTA);
    await esperarHidratacion(page, CAMPOS);
    await page.selectOption('#select-ccaa', 'rioja');
    await sembrar(page, PRECIO, '420000');
    await sembrar(page, GESTORIA, '600');

    // a) Segunda mano (el régimen por defecto).
    await expect(page.getByRole('button', { name: /Segunda mano/ })).toHaveAttribute('aria-pressed', 'true');
    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (7,00%)');
    expect(await valorTarjeta(page, 'ITP (')).toBe('29.400,00 €');
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('942,32 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain('entre 807,70 € y 1076,93 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('300,83 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('31.243,15 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toBe('7,44% sobre el precio de compra');
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('451.243,15 €');

    // b) Renuncia: el ITP se va entero y entran IVA con ISP + AJD.
    await page.getByRole('button', { name: /renuncia al IVA/ }).click();
    expect(await rotuloTarjeta(page, /^IVA/)).toBe('IVA (renuncia · ISP) (21,00%)');
    expect(await valorTarjeta(page, 'IVA (')).toBe('88.200,00 €');
    expect(await rotuloTarjeta(page, /^AJD/)).toBe('AJD (1,00%)');
    expect(await valorTarjeta(page, 'AJD (')).toBe('4200,00 €');
    await expect(page.locator('h3', { hasText: /^ITP/ })).toHaveCount(0);
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('94.243,15 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toBe('22,44% sobre el precio de compra');
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('514.243,15 €');

    // c) Obra nueva: mismos importes, sin la inversión del sujeto pasivo en el rótulo.
    await page.getByRole('button', { name: /Obra nueva/ }).click();
    expect(await rotuloTarjeta(page, /^IVA/)).toBe('IVA (21,00%)');
    expect(await valorTarjeta(page, 'IVA (')).toBe('88.200,00 €');
    expect(await valorTarjeta(page, 'AJD (')).toBe('4200,00 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('514.243,15 €');
    // Ni el 10 % de la vivienda nueva (42.000 €) ni el ITP de la segunda mano se cuelan.
    expect(await page.locator('[class*="resultados"]').first().innerText()).not.toMatch(/42\.000,00|29\.400,00/);
  });

  /**
   * CASO 2 — Melilla, 640.000 €, gestoría 500 €.
   *
   * ⚠️ 24/09/2026 (hallazgo 1584) — este caso se escribió con la renuncia elegida y esperaba
   * «IPSI · No calculado», sin ITP y con AJD: CONSAGRABA la renuncia que el aviso de la misma
   * página negaba. Se decidió con la norma (Ley 8/1991, BOE-A-1991-7645): el IPSI toma sus
   * exenciones de la ley del IVA (art. 7) sin regular ninguna renuncia, y prohíbe deducir el
   * IPSI soportado en inmuebles (art. 20.3), que es lo que la renuncia del art. 20.Dos LIVA
   * exige. La renuncia no existe en Melilla: su botón se desactiva y se calcula la segunda mano.
   * El invariante del IPSI sin cifrar («puede ser mayor») se sigue probando, en la OBRA NUEVA,
   * que sí está sujeta al IPSI.
   *
   *   (⚠️ Cifras de antes del 26/09 —con IVA en los honorarios— y del 17/10 —sin la rebaja del
   *   nº 2.1—; las vigentes van junto a las aserciones, abajo.)
   *   Notaría: 558,93946 (hasta 601.012,10) + 38.987,90 × 0,03 % = 570,63583
   *            × 1,21 = 690,469354 → 1.035,70 – 1.380,94 · medio                    =  1.208,32
   *   Registro: 306,5156935 + 38.987,90 × 0,02 % = 314,3132735 + 9,015182
   *            = 323,3284555 × 1,21                                                 =    391,23
   *   a) Segunda mano (y la renuncia, que aquí es lo mismo):
   *      ITP = 640.000 × 6 % × (1 − 0,5) = 19.200,00 (3,00 %)
   *      total 19.200 + 1.208,32 + 391,23 + 500 = 21.299,55 · coste 661.299,55
   *      con la gestoría «2.000.50»: 20.799,55 / 660.799,55 (PARCIAL, «será mayor»)
   *   b) Obra nueva: IPSI sin cifrar + AJD 640.000 × 0,5 % × 0,5 = 1.600,00 (0,25 %)
   *      total (parcial) 1.600 + 1.208,32 + 391,23 + 500 = 3.699,55 → 0,58 %
   *      coste (PARCIAL) 643.699,55 · «puede ser mayor» (el IPSI puede no sumar nada)
   */
  test('CASO 2 — Melilla: sin renuncia en el IPSI (segunda mano con ITP bonificado) y la obra nueva con el IPSI sin cifrar', async ({ page }) => {
    expect(ITP_CCAA['melilla'].ajd).toBe(0.5);
    expect(BONIFICACION_CUOTA_CEUTA_MELILLA).toBe(0.5);

    await page.goto(RUTA);
    await esperarHidratacion(page, CAMPOS);
    await page.getByRole('button', { name: /renuncia al IVA/ }).click();
    await page.selectOption('#select-ccaa', 'melilla');
    await sembrar(page, PRECIO, '640000');
    await sembrar(page, GESTORIA, '500');

    // a) La renuncia elegida antes no se calcula aquí: el botón está desactivado y lo dice.
    const renuncia = page.getByRole('button', { name: /2ª mano con renuncia/ });
    await expect(renuncia).toBeDisabled();
    await expect(renuncia).toContainText('No existe en el IPSI: paga ITP');
    await expect(page.getByRole('button', { name: /Segunda mano/ })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('h3', { hasText: /^IPSI/ })).toHaveCount(0);
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);
    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (3,00%)');
    expect(await valorTarjeta(page, 'ITP (')).toBe('19.200,00 €');
    // 26/09/2026 (hallazgo 2214): en Canarias, Ceuta y Melilla la notaría y el registro van SIN
    // IVA —su factura lleva IGIC o IPSI, que la app no calcula y nombra junto al total—, así que
    // las dos líneas son las de antes ÷ 1,21 (el arancel × 1,75 y el arancel del registro).
    //   notaría 570,63583 × 1,75 = 998,612703 · registro 323,3284555
    //   a) total 19.200 + 998,61 + 323,33 + 500 = 21.021,94 · coste 661.021,94
    //      con la gestoría «2.000.50»: 20.521,94 / 660.521,94
    //   b) obra nueva: 1.600 + 998,61 + 323,33 + 500 = 3.421,94 → 0,5347 % → 0,53 % · 643.421,94
    // 17/10/2026 (cabo C0209): con la base del BOE y la rebaja del 5 % del nº 2.1, notaría
    //   570,637646 × 0,95 = 542,105764 × 1,75 = 948,685087 · registro 314,313758 × 0,95
    //   + 9,015182 = 307,613252
    //   a) total 19.200 + 948,69 + 307,61 + 500 = 20.956,30 · coste 660.956,30
    //      con la gestoría «2.000.50»: 20.456,30 / 660.456,30
    //   b) obra nueva: 1.600 + 948,69 + 307,61 + 500 = 3.356,30 → 0,5244 % → 0,52 % · 643.356,30
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('948,69 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('307,61 €');
    // Parcial: a los honorarios les falta el IPSI (26/09/2026, tarde).
    expect(await rotuloTarjeta(page, /^Total gastos adicionales/)).toBe('Total gastos adicionales (parcial)');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('20.956,30 €');
    expect(await rotuloTarjeta(page, /^COSTE TOTAL/)).toBe('COSTE TOTAL (PARCIAL)');
    expect(await descripcionTarjeta(page, 'COSTE TOTAL')).toBe(SOLO_HONORARIOS('IPSI'));
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('660.956,30 €');
    // Una sola versión en pantalla: ningún aviso afirma una renuncia que la app no calcula.
    const avisos = (await page.locator('[role="note"]').allInnerTexts()).join(' ').replace(/\s+/g, ' ');
    expect(avisos).toContain('no existe la renuncia a la exención');
    expect(avisos).not.toContain('ni la renuncia a la exención ni la inversión del sujeto pasivo');

    // Con la gestoría ilegible, algo suma seguro: «será mayor» y título PARCIAL (hallazgo 1585).
    await sembrar(page, GESTORIA, '2.000.50');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('Sin leer');
    expect(await rotuloTarjeta(page, /^COSTE TOTAL/)).toBe('COSTE TOTAL (PARCIAL)');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('20.456,30 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('660.456,30 €');
    expect(await descripcionTarjeta(page, 'COSTE TOTAL')).toBe(
      'No incluye la gestoría, que no se ha podido leer: el coste real será mayor',
    );

    // b) Obra nueva: el IPSI se nombra y no se cifra, el AJD va bonificado y el coste es PARCIAL.
    await sembrar(page, GESTORIA, '500');
    await page.getByRole('button', { name: /Obra nueva/ }).click();
    expect(await valorTarjeta(page, 'IPSI')).toBe('No calculado');
    await expect(page.locator('h3', { hasText: /^IVA/ })).toHaveCount(0);
    await expect(page.locator('h3', { hasText: /^ITP/ })).toHaveCount(0);
    expect(await rotuloTarjeta(page, /^AJD/)).toBe('AJD (0,25%)');
    expect(await valorTarjeta(page, 'AJD (')).toBe('1600,00 €');
    expect(await rotuloTarjeta(page, /^Total gastos adicionales/)).toBe('Total gastos adicionales (parcial)');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('3356,30 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toBe(
      `0,52% sobre el precio de compra — SIN el IPSI, que no está incluido${sinHonorarios('IPSI')}`,
    );
    expect(await rotuloTarjeta(page, /^COSTE TOTAL/)).toBe('COSTE TOTAL (PARCIAL)');
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('643.356,30 €');
    expect(await descripcionTarjeta(page, 'COSTE TOTAL')).toBe('No incluye el IPSI: el coste real puede ser mayor');
  });

  /**
   * CASO 3 (LÍMITE) — Extremadura, segunda mano: el corte 8 % → 10 % en 360.000 €, que ninguna
   * vuelta había pisado (la del 02/09 probó el de 600.000 €). Escala de ITP_CCAA.extremadura.
   *   359.999 → 28.799,92 · 360.000 → 28.800,00 (8,00 %) · 360.001 → 28.800,10
   *   370.000 → 28.800 + 10.000 × 10 % = 29.800,00 (8,05 %) — ni el 10 % plano (37.000) ni el 8 % (29.600)
   */
  test('CASO 3 (límite) — Extremadura, 360.000 € exactos: el corte 8 % → 10 % se cierra donde debe', async ({ page }) => {
    expect(ITP_CCAA['extremadura'].tramosProgresivos?.[0]).toEqual({ hasta: 360000, tipo: 8 });
    expect(ITP_CCAA['extremadura'].tramosProgresivos?.[1]).toEqual({ hasta: 600000, tipo: 10 });

    await page.goto(RUTA);
    await esperarHidratacion(page, CAMPOS);
    await page.selectOption('#select-ccaa', 'extremadura');
    const casos: [string, string, string][] = [
      ['359999', '28.799,92 €', 'ITP (8,00%)'],
      ['360000', '28.800,00 €', 'ITP (8,00%)'],
      ['360001', '28.800,10 €', 'ITP (8,00%)'],
      ['370000', '29.800,00 €', 'ITP (8,05%)'],
    ];
    for (const [precio, itp, rotulo] of casos) {
      await sembrar(page, PRECIO, precio);
      expect(await valorTarjeta(page, 'ITP ('), `precio ${precio}`).toBe(itp);
      expect(await rotuloTarjeta(page, /^ITP \(/), `precio ${precio}`).toBe(rotulo);
    }
  });

  /**
   * BARRIDO — las 19 comunidades × los 3 regímenes, a 500.000 € con gestoría 500 €: el punto
   * ciego del candado de familia (un <select> y tres botones, ninguno <NumberInput>).
   * Invariantes, ninguno escrito a mano: el total es la suma de las líneas visibles; el coste es
   * precio + total; cada rótulo «(x,xx%)» es el tipo EFECTIVO de su importe; sin IVA en Canarias,
   * Ceuta y Melilla y, allí, total y coste «(parcial)»; ITP solo en segunda mano y AJD solo con IVA.
   * Medido hoy: 57 combinaciones sin una sola incoherencia.
   *
   * 24/09/2026 (hallazgo 1584): en Ceuta y Melilla la renuncia no existe (el IPSI no la tiene) y
   * su botón está desactivado, así que allí se comprueba eso —botón inerte y segunda mano con ITP—
   * en lugar de pulsarlo. En Canarias el botón se llama «renuncia al IGIC».
   */
  test('BARRIDO — 19 territorios × 3 regímenes: el desglose cuadra y cada régimen liquida lo suyo', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, CAMPOS);
    await sembrar(page, PRECIO, '500000');
    await sembrar(page, GESTORIA, '500');
    const territorios = await page
      .locator('#select-ccaa option')
      .evaluateAll((os) => os.map((o) => (o as HTMLOptionElement).value));
    expect(territorios).toHaveLength(19);
    const sinIva = ['canarias', 'ceuta', 'melilla'];
    const sinRenuncia = ['ceuta', 'melilla'];
    const regimenes: [string, RegExp][] = [
      ['segunda mano', /Segunda mano/],
      ['renuncia', /2ª mano con renuncia/],
      ['obra nueva', /Obra nueva/],
    ];
    const incoherencias: string[] = [];
    for (const t of territorios) {
      await page.selectOption('#select-ccaa', t);
      for (const [nombre, boton] of regimenes) {
        if (nombre === 'renuncia' && sinRenuncia.includes(t)) {
          // Sin renuncia en el IPSI: el botón no se puede pulsar y lo dice.
          await expect(page.getByRole('button', { name: boton })).toBeDisabled();
          await expect(page.getByRole('button', { name: boton })).toContainText('No existe en el IPSI');
          continue;
        }
        await page.getByRole('button', { name: boton }).click();
        await expect(page.getByRole('button', { name: boton })).toHaveAttribute('aria-pressed', 'true');
        const tarjetas = await page.locator('[class*="resultados"] h3').evaluateAll((hs) =>
          hs.map((h) => {
            const valor = h.parentElement?.nextElementSibling?.querySelector('p');
            return { titulo: (h as HTMLElement).innerText.trim(), valor: (valor as HTMLElement | null)?.innerText.trim() ?? '' };
          }),
        );
        const tag = `${t} · ${nombre}`;
        const de = (re: RegExp) => tarjetas.find((x) => re.test(x.titulo));
        const lineas = tarjetas.filter((x) => !/^(Precio de la nave|Total gastos|COSTE TOTAL)/.test(x.titulo));
        const suma = lineas.reduce((s, x) => s + (/\d/.test(x.valor) ? eurosDeTexto(x.valor) : 0), 0);
        const total = de(/^Total gastos/);
        const coste = de(/^COSTE TOTAL/);
        if (!total || !coste) {
          incoherencias.push(`${tag}: falta el total o el coste`);
          continue;
        }
        if (Math.abs(suma - eurosDeTexto(total.valor)) > 0.005) incoherencias.push(`${tag}: suma ${suma.toFixed(2)} ≠ ${total.valor}`);
        if (Math.abs(500000 + eurosDeTexto(total.valor) - eurosDeTexto(coste.valor)) > 0.005) incoherencias.push(`${tag}: coste ${coste.valor}`);
        for (const x of lineas) {
          const m = x.titulo.match(/\(([\d,]+)%\)$/);
          if (m && /\d/.test(x.valor)) {
            const efectivo = (eurosDeTexto(x.valor) / 500000) * 100;
            if (Math.abs(efectivo - Number(m[1].replace(',', '.'))) > 0.006) incoherencias.push(`${tag}: ${x.titulo} con ${x.valor}`);
          }
        }
        const conIva = nombre !== 'segunda mano';
        if (conIva && sinIva.includes(t)) {
          if (de(/^IVA/)) incoherencias.push(`${tag}: liquida IVA donde no rige`);
          if (!/\(PARCIAL\)/.test(coste.titulo) || !/\(parcial\)/.test(total.titulo)) incoherencias.push(`${tag}: sin «(parcial)»`);
        }
        if (conIva && !sinIva.includes(t) && !de(/^IVA/)) incoherencias.push(`${tag}: falta el IVA`);
        if (!conIva && !de(/^ITP/)) incoherencias.push(`${tag}: falta el ITP`);
        if (!conIva && de(/^AJD/)) incoherencias.push(`${tag}: AJD en segunda mano sin renuncia`);
        if (conIva && de(/^ITP/)) incoherencias.push(`${tag}: ITP junto al IVA`);
      }
    }
    expect(incoherencias, incoherencias.join('\n')).toEqual([]);
  });

  /** LÍMITE del hallazgo de Valencia, en el lado que es correcto con cualquier lectura. */
  test('Valencia, 1.000.000 € exactos: todavía el 9 % («superior a un millón» no incluye el millón)', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, CAMPOS);
    await page.selectOption('#select-ccaa', 'valencia');
    await sembrar(page, PRECIO, '1000000');
    expect(await valorTarjeta(page, 'ITP (')).toBe('90.000,00 €');
    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (9,00%)');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// HALLAZGOS 1581-1585 DEL 24/09/2026 — REPARADOS ese mismo día. Se escribieron con test.fail()
// afirmando lo que DEBERÍA pasar; al repararse se les quitó la marca y sujetan la reparación.
// Los datos (1581-1583) se corrigieron en el motor (data/itp-ccaa.ts, data/fiscal/inmuebles.ts);
// la app pasa el objeto `'otro'` y rotula con `tipoGeneralITP`, `tipoAJD` y `describirSubidaITP`.
//
// ⚠️ Al repararlos cambian también aserciones de tandas anteriores que CONSAGRAN el defecto, y
// habrá que reescribirlas (no borrarlas): «CASO 2 (límite) — Valencia, 1.200.000 €» (21/08,
// espera 112.000 €), «País Vasco, obra nueva: IVA del 21 % y ningún AJD» (21/08), el cfe091a7 del
// 23/09 (espera el título «Total gastos adicionales» sin «(parcial)» con la gestoría ilegible) y
// el de la familia del 1272 (lee la tarjeta por «COSTE TOTAL DE ADQUISICIÓN»).
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Hallazgos reparados — 24/09/2026 (1581-1585)', () => {
  test.describe.configure({ timeout: 60_000 });

  /**
   * HALLAZGO (contenido, bajo) — EFECTO FAMILIA, salido hoy también en la referencia y en el
   * garaje. Con la gestoría ilegible, las dos cifras de cierre conservan el título de
   * definitivas mientras su descripción dice «SIN la gestoría» y «el coste real será mayor». La
   * redacción común (85c9c9fe) rotula «(PARCIAL)» toda cifra final a la que le falta algo, y la
   * misma tarjeta lo hace cuando falta el IGIC/IPSI (CASO 2 de arriba).
   *
   * Madrid, renuncia, 300.000 €: IVA 63.000 + AJD 0,75 % 2.250 + notaría 864,86 + registro 272,52
   *   con gestoría 500 → 66.887,38 / 366.887,38 · con «2.000.50» → 66.387,38 / 366.387,38.
   * 17/10/2026 (cabo C0209), con la base del BOE y la rebaja del 5 % del nº 2.1: notaría
   *   408,435226 × 0,95 × 1,21 × 1,75 = 821,62 · registro (216,212547 × 0,95 + 9,015182) × 1,21
   *   = 259,44 → con «2.000.50»: 63.000 + 2.250 + 821,62 + 259,44 = 66.331,06 / 366.331,06.
   */
  test('REPARADO 1585 — con la gestoría ilegible, «Total gastos adicionales» y «COSTE TOTAL» se rotulan «(PARCIAL)»', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, CAMPOS);
    await page.selectOption('#select-ccaa', 'madrid');
    await page.getByRole('button', { name: /renuncia al IVA/ }).click();
    await sembrar(page, PRECIO, '300000');
    await sembrar(page, GESTORIA, '2.000.50');

    // La cifra y su descripción son las correctas: el defecto es solo el título.
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('66.331,06 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('366.331,06 €');
    expect(await descripcionTarjeta(page, 'COSTE TOTAL')).toContain('el coste real será mayor');

    expect(await rotuloTarjeta(page, /^COSTE TOTAL/)).toMatch(/\(PARCIAL\)/);
    expect(await rotuloTarjeta(page, /^Total gastos adicionales/)).toMatch(/\(parcial\)/);
  });

  /**
   * HALLAZGO (dato, alto) — Valencia: por encima de un millón, el 11 % es el tipo de TODA la
   * base, no el del exceso. Ley 13/1997, art. 13.Uno (BOE-A-1998-8202, consolidado a
   * 10/08/2026): «El 9% en las adquisiciones de inmuebles … No obstante, cuando el valor de los
   * bienes inmuebles transmitidos … sea superior a un millón de euros, el tipo aplicable será el
   * 11%». ITP_CCAA.valencia lo modela como escala (9 % hasta 1 M + 11 % del exceso).
   *   1.200.000 × 11 % = 132.000,00 € (la app: 90.000 + 22.000 = 112.000,00 €, «ITP (9,33%)»)
   */
  test('REPARADO 1581 — Valencia, 1.200.000 €: el 11 % se aplica a toda la base, no solo al exceso del millón', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, CAMPOS);
    await page.selectOption('#select-ccaa', 'valencia');
    await sembrar(page, PRECIO, '1200000');
    await expect(page.locator('h3', { hasText: /^ITP \(/ })).toHaveCount(1);

    expect(await valorTarjeta(page, 'ITP (')).toBe('132.000,00 €');
    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (11,00%)');
    // El recuadro dice «ITP General 11%» a ese precio y describe el umbral, no una escala.
    const recuadro = pegarPct((await page.locator('[class*="infoCcaa"]').first().innerText()).replace(/\s+/g, ' '));
    expect(recuadro).toContain('ITP General 11%');
    expect(recuadro).toContain('si el valor supera 1.000.000 € pasa al 11% sobre TODO el valor');
    expect(recuadro).not.toContain('escala progresiva');
    // Y con 1.000.001 €: 1.000.001 × 11 % = 110.000,11 € (con la escala salían 90.000,11 €).
    await sembrar(page, PRECIO, '1000001');
    expect(await valorTarjeta(page, 'ITP (')).toBe('110.000,11 €');
  });

  /**
   * HALLAZGO (dato, alto) — País Vasco: a la nave se le aplica el ITP de la VIVIENDA. Bizkaia,
   * NF 1/2011 art. 13.a): «El 7 por 100 si se trata de la transmisión de bienes inmuebles»; el
   * 4 % de la letra b) es para «la transmisión de viviendas en general» («no tendrán la
   * consideración de anexos a viviendas los locales de negocio»). Gipuzkoa, NF 18/1987 art.
   * 11.1: a) 7 % inmuebles, b) 4 % viviendas. TIPOS_ITP_CCAA_2025 («ITP — Vivienda de segunda
   * mano») trae el 4 %, y la nave lo hereda.
   *   500.000 × 7 % = 35.000,00 € (la app: 20.000,00 €, «ITP (4,00%)»)
   */
  test('REPARADO 1582 — País Vasco, segunda mano, nave de 500.000 €: ITP del 7 % de los inmuebles, no el 4 % de la vivienda', async ({ page }) => {
    // El 4 % sigue siendo el de la vivienda; la nave lee el de los demás inmuebles.
    expect(ITP_CCAA['pais-vasco'].tipoGeneral).toBe(4);
    expect(ITP_CCAA['pais-vasco'].tipoGeneralNoVivienda).toBe(7);
    await page.goto(RUTA);
    await esperarHidratacion(page, CAMPOS);
    await page.selectOption('#select-ccaa', 'pais-vasco');
    await sembrar(page, PRECIO, '500000');
    await expect(page.locator('h3', { hasText: /^ITP \(/ })).toHaveCount(1);

    expect(await valorTarjeta(page, 'ITP (')).toBe('35.000,00 €');
    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (7,00%)');
    // Total = 35.000 + 1.022,78 + 328,41 + 500 = 36.851,19 · coste 536.851,19
    // (notaría 508,435226 × 0,95 × 1,21 × 1,75 y registro (276,212547 × 0,95 + 9,015182) × 1,21,
    // con la base del BOE y la rebaja del 5 % del nº 2.1 —17/10/2026, cabo C0209—; sin la rebaja
    // eran 1.076,61 y 345,12, y el total 36.921,73)
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('36.851,19 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('536.851,19 €');
    // El recuadro rotula el ITP de la nave, no el de la vivienda.
    const recuadro = pegarPct((await page.locator('[class*="infoCcaa"]').first().innerText()).replace(/\s+/g, ' '));
    expect(recuadro).toContain('ITP General 7%');
    // Y el FAQPage ya no corona al País Vasco con el 4 % de la vivienda: para una nave los más
    // bajos son Ceuta y Melilla (3 % efectivo) y, empatadas al 6 %, Madrid y Navarra.
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = bloques.find((b) => b.includes('"FAQPage"')) ?? '';
    expect(faq).toContain(
      // Con artículo desde el 08/10/2026 (hallazgo 3084, nombreEnFrase).
      'Los más bajos hoy son la Ciudad Autónoma de Ceuta (3\u00A0% efectivo, ya bonificado), la Ciudad Autónoma de Melilla (3\u00A0% efectivo, ya bonificado), la Comunidad de Madrid (6\u00A0%), la Comunidad Foral de Navarra (6\u00A0%)',
    );
    expect(faq).not.toMatch(/País Vasco \(4%\)/);
  });

  /**
   * HALLAZGO (dato, alto) — País Vasco: la nave nueva (o con renuncia) sí paga AJD. Bizkaia,
   * NF 1/2011 art. 44.1: las primeras copias de escrituras tributan «al tipo de gravamen del
   * 0,50 por 100» (cosa valuable, inscribibles, no sujetas a TPO); la exención del art. 58.35 es
   * solo para «la primera transmisión de viviendas» y excluye «los locales de negocio».
   * Gipuzkoa, NF 18/1987 art. 29.2: «tributarán, además al tipo de gravamen del 0,5 por 100».
   * ITP_CCAA['pais-vasco'].ajd = 0 («Sin AJD») es el caso de la vivienda nueva.
   *   Obra nueva 500.000 €: AJD 2.500,00 · total 105.000 + 2.500 + 1.076,61 + 345,12 + 500
   *   = 109.421,73 (la app: 106.921,73 sin tarjeta de AJD, rotulado definitivo)
   *   17/10/2026 (cabo C0209), con la rebaja del 5 % del nº 2.1 y la base del BOE: notaría
   *   1.022,78 y registro 328,41 → 105.000 + 2.500 + 1.022,78 + 328,41 + 500 = 109.351,19
   */
  test('REPARADO 1583 — País Vasco, obra nueva, nave de 500.000 €: AJD del 0,5 % (2.500 €), no 0', async ({ page }) => {
    // El 0 es solo de la primera transmisión de vivienda (`ajdVivienda`); el general es el 0,5 %.
    expect(ITP_CCAA['pais-vasco'].ajd).toBe(0.5);
    expect(ITP_CCAA['pais-vasco'].ajdVivienda).toBe(0);
    await page.goto(RUTA);
    await esperarHidratacion(page, CAMPOS);
    await page.selectOption('#select-ccaa', 'pais-vasco');
    await page.getByRole('button', { name: /Obra nueva/ }).click();
    await sembrar(page, PRECIO, '500000');
    await sembrar(page, GESTORIA, '500');
    expect(await valorTarjeta(page, 'IVA (')).toBe('105.000,00 €');

    expect(await page.locator('h3', { hasText: /^AJD/ }).count()).toBe(1);
    expect(await valorTarjeta(page, 'AJD (')).toBe('2500,00 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('109.351,19 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('609.351,19 €');
    // Con renuncia, el mismo AJD: el País Vasco no tiene tipo propio de la renuncia verificado.
    await page.getByRole('button', { name: /renuncia al IVA/ }).click();
    expect(await valorTarjeta(page, 'AJD (')).toBe('2500,00 €');
    // El aviso ya no dice «aquí se calcula con el tipo general» sobre un AJD que no se calculaba.
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(1);
  });

  /**
   * HALLAZGO 1584 (contenido, medio) — Ceuta y Melilla con renuncia: dos reparaciones que se
   * contradecían en la misma pantalla. La tarjeta (hallazgo 451, 27/08) decía «la renuncia a la
   * exención tributa por el IPSI» y el cálculo la trataba como efectiva (quitaba el ITP y
   * liquidaba AJD), mientras el aviso de debajo (hallazgo 647, 09/09) decía que «ni la renuncia
   * a la exención ni la inversión del sujeto pasivo del IVA entran en juego». En Melilla, a
   * 640.000 €, elegir la opción que la app decía que no se aplica bajaba el coste 17.600 €.
   *
   * REPARADO decidiéndolo con la norma (Ley 8/1991 del IPSI, BOE-A-1991-7645): la renuncia NO
   * existe allí —art. 7, exenciones tomadas de la ley del IVA sin regular ninguna renuncia; art.
   * 20.3, el IPSI soportado en inmuebles no se deduce, que es lo que la renuncia del art. 20.Dos
   * LIVA exige—. El botón se desactiva y dice por qué, y el cálculo es el de la segunda mano.
   * Canarias es distinta: el IGIC sí la tiene (art. 50.Cinco Ley 4/2012, BOE-A-2012-9282).
   */
  test('REPARADO 1584 — Melilla: una sola versión de la renuncia, en pantalla y en el cálculo', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, CAMPOS);
    await page.selectOption('#select-ccaa', 'melilla');
    await sembrar(page, PRECIO, '640000');
    await sembrar(page, GESTORIA, '500');
    // Segunda mano: ITP 640.000 × 6 % × 0,5 = 19.200 · total 19.200 + 948,69 + 307,61 + 500
    // = 20.956,30 · coste 660.956,30 (notaría y registro sin IVA en Melilla: hallazgo 2214; con
    // la rebaja del 5 % del nº 2.1 y la base del BOE desde el 17/10/2026, cabo C0209 —antes
    // 998,61 y 323,33, coste 661.021,94—; la cuenta, en el CASO 2 de la inspección del 24/09)
    expect(await valorTarjeta(page, 'ITP (')).toBe('19.200,00 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('660.956,30 €');

    // La opción que la página dice que no existe no se puede elegir, y el coste no se mueve.
    const renuncia = page.getByRole('button', { name: /2ª mano con renuncia/ });
    await expect(renuncia).toBeDisabled();
    await renuncia.click({ force: true }).catch(() => undefined);
    await expect(renuncia).toHaveAttribute('aria-pressed', 'false');
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('660.956,30 €');
    await expect(page.locator('h3', { hasText: /^IPSI/ })).toHaveCount(0);

    // Ningún texto de la página afirma la renuncia en el IPSI ni la niega con la contraria.
    const cuerpo = ((await page.locator('body').textContent()) ?? '').replace(/\s+/g, ' ');
    expect(cuerpo).not.toContain('la renuncia a la exención tributa por el IPSI');
    expect(cuerpo).not.toContain('ni la renuncia a la exención ni la inversión del sujeto pasivo');
    expect(cuerpo).toContain('no existe la renuncia a la exención');

    // Canarias: la renuncia existe (a la exención del IGIC) y se calcula su consecuencia —AJD en
    // lugar de ITP, art. 4.4 Ley 20/1991—, con el botón y el aviso diciendo lo mismo.
    await page.selectOption('#select-ccaa', 'canarias');
    const renunciaIgic = page.getByRole('button', { name: /2ª mano con renuncia al IGIC/ });
    await expect(renunciaIgic).toBeEnabled();
    await renunciaIgic.click();
    expect(await valorTarjeta(page, 'IGIC')).toBe('No calculado');
    await expect(page.locator('h3', { hasText: /^ITP/ })).toHaveCount(0);
    // AJD = 640.000 × 0,75 % = 4.800
    expect(await valorTarjeta(page, 'AJD (')).toBe('4800,00 €');
    const aviso = (await page.locator('[class*="avisoRenuncia"]').first().innerText()).replace(/\s+/g, ' ');
    expect(aviso).toContain('la renuncia es a la exención del IGIC');
    expect(aviso).toContain('inversión del sujeto pasivo');
    expect(aviso).not.toContain('ni la renuncia a la exención ni la inversión del sujeto pasivo');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// REPARACIÓN 24/09/2026 — casos nuevos de lo que la reparación toca y los hallazgos no nombraban.
//  · El AJD propio de la renuncia en la Comunitat Valenciana (2 %, Ley 13/1997 art. 14.Dos,
//    BOE-A-1998-8202): es el hallazgo 1603 de la hermana terreno-rústico, y la nave también
//    tiene renuncia.
//  · La frontera del arancel notarial (RD 1426/1989, número 2): un céntimo por encima de
//    6.010.121,04 € la parte que excede es de libre acuerdo (hallazgo 1599).
//  · Un precio que se pinta como 0,00 € es el cero (forma del hallazgo 1601 de la hermana solar).
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Reparación 24/09/2026 — renuncia en Valencia, frontera de la notaría y el precio que se pinta cero', () => {
  /**
   * Comunitat Valenciana, 2ª mano con renuncia, 300.000 €, gestoría 500 €:
   *   IVA 300.000 × 21 % = 63.000 · AJD 300.000 × 2 % (art. 14.Dos, renuncia) = 6.000
   *   Notaría(300.000) = 408,43341 × 1,21 × 1,75 = 864,857746 · Registro(300.000) = 272,524968
   *   Total = 63.000 + 6.000 + 864,86 + 272,52 + 500 = 70.637,38 · coste 370.637,38
   *   (con el AJD general del 1,4 % serían 4.200 € y 68.837,38 €)
   *   17/10/2026 (cabo C0209), con la base del BOE y la rebaja del 5 % del nº 2.1: notaría
   *   408,435226 × 0,95 × 1,21 × 1,75 = 821,62 · registro (216,212547 × 0,95 + 9,015182) × 1,21
   *   = 259,44 → total 63.000 + 6.000 + 821,62 + 259,44 + 500 = 70.581,06 · coste 370.581,06
   */
  test('Valencia con renuncia, 300.000 €: el AJD de la renuncia es el 2 %, y se dice', async ({ page }) => {
    expect(ITP_CCAA['valencia'].ajdRenuncia).toBe(2);
    expect(ITP_CCAA['valencia'].ajd).toBe(1.4);
    await page.goto(RUTA);
    await esperarHidratacion(page, CAMPOS);
    await page.selectOption('#select-ccaa', 'valencia');
    await page.getByRole('button', { name: /renuncia al IVA/ }).click();
    await sembrar(page, PRECIO, '300000');
    await sembrar(page, GESTORIA, '500');

    expect(await valorTarjeta(page, 'IVA (renuncia')).toBe('63.000,00 €');
    expect(await rotuloTarjeta(page, /^AJD \(/)).toBe('AJD (2,00%)');
    expect(await valorTarjeta(page, 'AJD (')).toBe('6000,00 €');
    expect(await descripcionTarjeta(page, 'AJD (')).toContain('Tipo propio de la renuncia');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('70.581,06 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('370.581,06 €');
    const aviso = (await page.locator('[class*="avisoRenuncia"]').first().innerText()).replace(/\s+/g, ' ');
    expect(aviso).toContain('tipo propio de la renuncia');
    expect(aviso).not.toContain('aquí se calcula con el tipo general');

    // En obra nueva no hay renuncia: el AJD general valenciano, 1,4 % → 4.200.
    await page.getByRole('button', { name: /Obra nueva/ }).click();
    expect(await rotuloTarjeta(page, /^AJD \(/)).toBe('AJD (1,40%)');
    expect(await valorTarjeta(page, 'AJD (')).toBe('4200,00 €');
  });

  /**
   * Madrid, segunda mano, 6.010.121,05 € (un céntimo por encima del límite del arancel):
   *   ITP 6 % = 360.607,263 → 360.607,26
   *   Notaría: la del límite, 2.181,672142 × 1,21 × 1,75 = 4.619,690761 → 4.619,69, y AVISO
   *   Registro: 1.388,337484 + 9,015182 = 1.397,352666 × 1,21 = 1.690,796726 → 1.690,80
   *   Total = 360.607,26 + 4.619,69 + 1.690,80 + 500 = 367.417,75 · coste 6.377.538,80 (PARCIAL)
   * 17/10/2026 (cabo C0209), con la base del BOE y la rebaja del 5 % del nº 2.1:
   *   Notaría: 2.181,673958 × 0,95 = 2.072,590260 × 1,21 × 1,75 = 4.388,709876 → 4.388,71
   *   Registro: 1.388,337968 × 0,95 = 1.318,921070 + 9,015182 = 1.327,936252 × 1,21 → 1.606,80
   *   Total = 360.607,26 + 4.388,71 + 1.606,80 + 500 = 367.102,77 · coste 6.377.223,82 (PARCIAL)
   * En 6.010.121,04 € exactos el arancel aún fija la cifra (CASO 2 del 07/09, rotulado definitivo).
   */
  test('Frontera de la notaría: un céntimo por encima de 6.010.121,04 € se avisa y el cierre es parcial', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, CAMPOS);
    await page.selectOption('#select-ccaa', 'madrid');
    await sembrar(page, PRECIO, '6.010.121,05');
    await sembrar(page, GESTORIA, '500');

    expect(await valorTarjeta(page, 'ITP (')).toBe('360.607,26 €');
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('4388,71 €');
    const notaria = await descripcionTarjeta(page, 'Gastos de notaría');
    expect(notaria).toContain('Arancel hasta 6.010.121,04 €');
    expect(notaria).toContain('libre acuerdo con el notario (RD 1426/1989, número 2)');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('1606,80 €');
    expect(await rotuloTarjeta(page, /^Total gastos adicionales/)).toBe('Total gastos adicionales (parcial)');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('367.102,77 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain(
      'SIN la parte de la notaría de libre acuerdo (el valor que excede de 6.010.121,04 €)',
    );
    expect(await rotuloTarjeta(page, /^COSTE TOTAL/)).toBe('COSTE TOTAL (PARCIAL)');
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('6.377.223,82 €');
    expect(await descripcionTarjeta(page, 'COSTE TOTAL')).toBe(
      'No incluye la parte de la notaría de libre acuerdo: el coste real puede ser mayor',
    );

    // En el límite exacto el arancel todavía fija la cantidad: ni aviso ni cierre parcial.
    await sembrar(page, PRECIO, '6.010.121,04');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).not.toContain('libre acuerdo');
    expect(await rotuloTarjeta(page, /^COSTE TOTAL/)).toBe('COSTE TOTAL DE ADQUISICIÓN');
  });

  /**
   * «0,004» se pinta «0,00 €»: es el cero, así que no hay desglose (como con «0»). Desde el
   * 26/09 (hallazgo 2207) el marcador ya no pide «Introduce el precio…» —el precio está
   * escrito—: dice que tiene que ser mayor que 0, y en «0,004» por qué (se queda en 0,00 €).
   */
  test('Un precio que se pinta 0,00 € no publica desglose; 0,01 € sí es un precio', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, CAMPOS);
    const marcador = page.locator('[class*="placeholder"] p');
    const esperado: Record<string, string> = {
      '0': `El precio escrito («0») ${PRECIO_NO_VALE}.`,
      '0,004': `El precio escrito («0,004») se queda en 0,00 € al céntimo, y ${PRECIO_NO_VALE}.`,
    };
    for (const entrada of ['0', '0,004']) {
      await sembrar(page, PRECIO, entrada);
      await expect(marcador, entrada).toHaveText(esperado[entrada]);
      await expect(page.locator('h3', { hasText: /^COSTE TOTAL/ })).toHaveCount(0);
    }
    await sembrar(page, PRECIO, '0,01');
    expect(await valorTarjeta(page, 'Precio de la nave industrial')).toBe('0,01 €');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 26/09/2026 — hermana del GRUPO B de la familia «Compraventa inmobiliaria»
// (referencia: estimador-compraventa-inmueble · testigo: tests/familias/compraventa.spec.ts).
//
// Antes de escribir nada se ejecutó el fichero entero: 99/99 en verde y ningún `test.fail()`
// pendiente, así que 1581-1585 (1c83ff86 y b02fde62) siguen cerrados. Los casos nuevos los
// pisan desde otro sitio: el umbral valenciano a UN CÉNTIMO (1581), el AJD foral con renuncia a
// otro precio (1583) y la gestoría ilegible con su DIRECCIÓN medida (1585).
//
// De dónde sale cada cifra (ninguna de memoria):
//  - Galicia: `TIPOS_ITP_CCAA_2025` tipo 8 (data/fiscal/inmuebles.ts, fila «Galicia»), sin
//    escala ni umbral en `ITP_CCAA.galicia` (data/itp-ccaa.ts), `ajd: 1.5` y sin `ajdRenuncia`.
//  - Valencia: `umbralTipoUnico { superiorA: 1_000_000, tipo: 11 }` (Ley 13/1997 art. 13.Uno) y
//    `ajdRenuncia: 2` (art. 14.Dos), en `ITP_CCAA.valencia`.
//  - Cataluña: escala 10/11/12/13 con cortes en 600.000, 900.000 y 1.500.000 (`ITP_CCAA.cataluna`).
//  - País Vasco: `ajd: 0.5` (NF 1/2011 de Bizkaia, art. 44.1) y sin `ajdRenuncia`.
//  - IVA de la nave: `IVA_INMUEBLES_2025.local = 21`.
//  - Notaría: `ARANCELES_NOTARIO` (RD 1426/1989, nº 2) × 1,21 × `FACTURA_NOTARIAL` (×1,5 / ×2,
//    medio ×1,75). Registro: `ARANCELES_REGISTRO` + `REGISTRO_CONCEPTOS` (6,010121 + 3,005061),
//    con el tope 2.181,67, × 1,21.
// Resuelto ANTES de abrir el navegador con un script propio que no llama a la app; el
// desarrollo va en el comentario de cada caso.
//
// Los rótulos con «%» se comparan con `sinEspacioPct`, que quita el espacio de delante del
// signo: así estos casos siguen valiendo el día que se repare el «%» pegado (hallazgo de abajo).
// ═══════════════════════════════════════════════════════════════════════════════

/** Quita el espacio (normal o duro) de delante del «%», para comparar cifras y no tipografía. */
const sinEspacioPct = (s: string): string => s.replace(/\s+%/g, '%');

/** Texto del recuadro de la comunidad, normalizado. */
async function recuadroCcaa(page: Page): Promise<string> {
  return sinEspacioPct((await page.locator('[class*="infoCcaa"]').first().innerText()).replace(/\s+/g, ' '));
}

test.describe('Re-inspección 26/09/2026 — familia grupo B: casos nuevos y el invariante del ilegible', () => {
  test.describe.configure({ timeout: 60_000 });

  /**
   * CASO 1 (NORMAL) — Galicia, 275.000 €, gestoría 650 € (Galicia solo se había probado en obra
   * nueva, el 14/09).
   *   ITP = 275.000 × 8 % = 22.000,00 (sin escala ni umbral)
   *   Notaría (bases del BOE y rebaja del 5 % del nº 2.1, 17/10/2026, cabo C0209):
   *            333,561786 (acumulado del arancel a 150.253,03) + 124.746,97 × 0,05 % (62,373485)
   *            = 395,935226 (sic, redondeo de la suma) × 0,95 = 376,138465 × 1,21 = 455,127543
   *            → 682,69 – 910,26 · medio ×1,75 = 796,473200 → 796,47
   *   Registro: 171,288458 + 124.746,97 × 0,03 % (37,424091) = 208,712547 × 0,95 = 198,276920
   *            + 9,015182 = 207,292102 × 1,21 = 250,823443 → 250,82
   *   (sin la rebaja: notaría 838,39 entre 718,62 y 958,16, registro 263,45)
   *   a) Segunda mano: total 22.000 + 796,47 + 250,82 + 650 = 23.697,29 (8,6172 → 8,62 %)
   *      · coste 298.697,29
   *   b) Renuncia: IVA 21 % 57.750,00 + AJD 1,5 % 4.125,00 (Galicia no tiene tipo propio de la
   *      renuncia declarado), sin ITP → total 63.572,29 (23,1172 → 23,12 %) · coste 338.572,29
   */
  test('CASO 1 (normal) — Galicia, 275.000 €: ITP 8 % plano; con renuncia, IVA 21 % + AJD 1,5 % y ningún ITP', async ({ page }) => {
    expect(ITP_CCAA['galicia'].tipoGeneral).toBe(8);
    expect(ITP_CCAA['galicia'].tramosProgresivos).toBeUndefined();
    expect(ITP_CCAA['galicia'].umbralTipoUnico).toBeUndefined();
    expect(ITP_CCAA['galicia'].ajd).toBe(1.5);
    expect(ITP_CCAA['galicia'].ajdRenuncia).toBeUndefined();
    expect(IVA_INMUEBLES_2025.local).toBe(21);

    await page.goto(RUTA);
    await esperarHidratacion(page, CAMPOS);
    await page.selectOption('#select-ccaa', 'galicia');
    await sembrar(page, PRECIO, '275000');
    await sembrar(page, GESTORIA, '650');

    // a) Segunda mano, el régimen por defecto.
    await expect(page.getByRole('button', { name: /Segunda mano/ })).toHaveAttribute('aria-pressed', 'true');
    expect(sinEspacioPct(await rotuloTarjeta(page, /^ITP \(/))).toBe('ITP (8,00%)');
    expect(await valorTarjeta(page, 'ITP (')).toBe('22.000,00 €');
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('796,47 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain('entre 682,69 € y 910,26 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('250,82 €');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('650,00 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('23.697,29 €');
    expect(sinEspacioPct(await descripcionTarjeta(page, 'Total gastos adicionales'))).toBe('8,62% sobre el precio de compra');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('298.697,29 €');
    const recuadro = await recuadroCcaa(page);
    expect(recuadro).toContain('ITP General 8%');
    expect(recuadro).toContain('AJD 1,5%');
    expect(recuadro).not.toContain('Tipo según el valor');

    // b) Renuncia: el ITP se va entero y entran el IVA con inversión del sujeto pasivo y el AJD.
    await page.getByRole('button', { name: /renuncia al IVA/ }).click();
    expect(sinEspacioPct(await rotuloTarjeta(page, /^IVA/))).toBe('IVA (renuncia · ISP) (21,00%)');
    expect(await valorTarjeta(page, 'IVA (')).toBe('57.750,00 €');
    expect(sinEspacioPct(await rotuloTarjeta(page, /^AJD/))).toBe('AJD (1,50%)');
    expect(await valorTarjeta(page, 'AJD (')).toBe('4125,00 €');
    expect(await descripcionTarjeta(page, 'AJD (')).toBe(
      'Tipo general de la comunidad: algunas aplican uno incrementado cuando hay renuncia',
    );
    await expect(page.locator('h3', { hasText: /^ITP/ })).toHaveCount(0);
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('63.572,29 €');
    expect(sinEspacioPct(await descripcionTarjeta(page, 'Total gastos adicionales'))).toBe('23,12% sobre el precio de compra');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('338.572,29 €');
  });

  /**
   * CASO 2 (LÍMITE) — Comunitat Valenciana, 1.000.000,01 €: UN CÉNTIMO por encima del umbral de
   * la Ley 13/1997, art. 13.Uno («superior a un millón» → el 11 % sobre TODO el valor, hallazgo
   * 1581). En 1.000.000 € exactos sigue el 9 % (test del 24/09).
   *   a) Segunda mano: ITP = 1.000.000,01 × 11 % = 110.000,0011 → 110.000,00
   *      (con la escala de antes de 1581 serían 90.000,0011 €)
   *      Notaría (bases del BOE y rebaja del 5 % del nº 2.1, 17/10/2026, cabo C0209):
   *               558,941276 (acumulado a 601.012,10) + 398.987,91 × 0,03 % (119,696373)
   *               = 678,637649 × 0,95 = 644,705767 × 1,21 = 780,093978
   *               → 1170,14 – 1560,19 · medio 1.365,164462 → 1365,16
   *      Registro: 306,516178 + 398.987,91 × 0,02 % (79,797582) = 386,313760 × 0,95
   *               = 366,998072 + 9,015182 = 376,013254 × 1,21 = 454,976037 → 454,98
   *      (sin la rebaja: notaría 1437,01 entre 1231,72 y 1642,30, registro 478,35)
   *      Total 110.000 + 1365,16 + 454,98 + 500 = 112.320,14 (11,2320 → 11,23 %)
   *      · coste 1.000.000,01 + 112.320,14 = 1.112.320,15
   *   b) Renuncia al mismo precio: el umbral del ITP no se cuela en el IVA.
   *      IVA 210.000,0021 → 210.000,00 · AJD 2 % (ajdRenuncia) 20.000,0002 → 20.000,00
   *      Total 210.000 + 20.000 + 1365,16 + 454,98 + 500 = 232.320,14 (23,2320 → 23,23 %)
   *      · coste 1.232.320,15
   */
  test('CASO 2 (límite) — Valencia, 1.000.000,01 €: el 11 % sobre todo el valor; con renuncia, IVA + AJD 2 % y ningún ITP', async ({ page }) => {
    expect(ITP_CCAA['valencia'].umbralTipoUnico).toEqual({ superiorA: 1_000_000, tipo: 11 });
    expect(ITP_CCAA['valencia'].ajdRenuncia).toBe(2);

    await page.goto(RUTA);
    await esperarHidratacion(page, CAMPOS);
    await page.selectOption('#select-ccaa', 'valencia');
    await sembrar(page, PRECIO, '1.000.000,01');
    await sembrar(page, GESTORIA, '500');

    expect(await valorTarjeta(page, 'Precio de la nave industrial')).toBe('1.000.000,01 €');
    expect(sinEspacioPct(await rotuloTarjeta(page, /^ITP \(/))).toBe('ITP (11,00%)');
    expect(await valorTarjeta(page, 'ITP (')).toBe('110.000,00 €');
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('1365,16 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain('entre 1170,14 € y 1560,19 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('454,98 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('112.320,14 €');
    expect(sinEspacioPct(await descripcionTarjeta(page, 'Total gastos adicionales'))).toBe('11,23% sobre el precio de compra');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('1.112.320,15 €');
    const recuadro = await recuadroCcaa(page);
    expect(recuadro).toContain('ITP General 11%');
    expect(recuadro).toContain('sobre TODO el valor, no solo sobre el exceso');

    await page.getByRole('button', { name: /renuncia al IVA/ }).click();
    await expect(page.locator('h3', { hasText: /^ITP/ })).toHaveCount(0);
    expect(await valorTarjeta(page, 'IVA (')).toBe('210.000,00 €');
    expect(sinEspacioPct(await rotuloTarjeta(page, /^AJD/))).toBe('AJD (2,00%)');
    expect(await valorTarjeta(page, 'AJD (')).toBe('20.000,00 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('232.320,14 €');
    expect(sinEspacioPct(await descripcionTarjeta(page, 'Total gastos adicionales'))).toBe('23,23% sobre el precio de compra');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('1.232.320,15 €');
  });

  /**
   * CASO 2 bis (LÍMITE) — Cataluña, segunda mano, 3.000.000 €: el tramo más alto de la escala
   * (13 % por encima de 1.500.000) y el sexto y último tramo REGLADO del arancel notarial.
   *   ITP = 600.000 × 10 % + 300.000 × 11 % + 600.000 × 12 % + 1.500.000 × 13 %
   *       = 60.000 + 33.000 + 72.000 + 195.000 = 360.000,00 (12,00 % efectivo)
   *   Notaría (bases del BOE y rebaja del 5 % del nº 2.1, 17/10/2026, cabo C0209):
   *            558,941276 + 2.398.987,90 × 0,03 % (719,69637) = 1.278,637646 × 0,95 = 1.214,705764
   *            × 1,21 = 1.469,793974 → 2204,69 – 2939,59 · medio 2.572,139455 → 2572,14,
   *            sin «libre acuerdo» (< 6.010.121,04)
   *   Registro: 306,516178 + 2.398.987,90 × 0,02 % (479,79758) = 786,313758 (bajo el tope)
   *            × 0,95 = 746,998070 + 9,015182 = 756,013252 × 1,21 = 914,776035 → 914,78
   *   (sin la rebaja: notaría 2707,51 entre 2320,72 y 3094,30, registro 962,35)
   *   Total 360.000 + 2572,14 + 914,78 + 500 = 363.986,92 (12,1329 → 12,13 %) · coste 3.363.986,92
   */
  test('CASO 2 bis (límite) — Cataluña, 3.000.000 €: escala hasta el 13 % y último tramo reglado de la notaría', async ({ page }) => {
    expect(ITP_CCAA['cataluna'].tramosProgresivos).toEqual([
      { hasta: 600000, tipo: 10 },
      { hasta: 900000, tipo: 11 },
      { hasta: 1500000, tipo: 12 },
      { hasta: Infinity, tipo: 13 },
    ]);
    expect(LIMITE_ARANCEL_NOTARIAL).toBe(6010121.04);

    await page.goto(RUTA);
    await esperarHidratacion(page, CAMPOS);
    await page.selectOption('#select-ccaa', 'cataluna');
    await sembrar(page, PRECIO, '3000000');
    await sembrar(page, GESTORIA, '500');

    expect(sinEspacioPct(await rotuloTarjeta(page, /^ITP \(/))).toBe('ITP (12,00%)');
    expect(await valorTarjeta(page, 'ITP (')).toBe('360.000,00 €');
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('2572,14 €');
    const notaria = await descripcionTarjeta(page, 'Gastos de notaría');
    expect(notaria).toContain('entre 2204,69 € y 2939,59 €');
    expect(notaria).not.toContain('libre acuerdo');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('914,78 €');
    expect(await rotuloTarjeta(page, /^Total gastos adicionales/)).toBe('Total gastos adicionales');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('363.986,92 €');
    expect(sinEspacioPct(await descripcionTarjeta(page, 'Total gastos adicionales'))).toBe('12,13% sobre el precio de compra');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('3.363.986,92 €');
    expect(await recuadroCcaa(page)).toContain('escala progresiva (10% → 11% → 12% → 13%)');
  });

  /**
   * CASO 2 ter (LÍMITE) — País Vasco, 2ª mano con renuncia, 750.000 €. El AJD foral de una nave
   * es el 0,5 % (hallazgo 1583) también con renuncia: el País Vasco no tiene tipo propio de la
   * renuncia declarado, y la tarjeta tiene que decir que es el general.
   *   IVA = 750.000 × 21 % = 157.500,00 · AJD = 750.000 × 0,5 % = 3.750,00 · sin ITP
   *   Notaría (bases del BOE y rebaja del 5 % del nº 2.1, 17/10/2026, cabo C0209):
   *            558,941276 + 148.987,90 × 0,03 % (44,69637) = 603,637646 × 0,95 = 573,455764
   *            × 1,21 = 693,881474 → 1040,82 – 1387,76 · medio 1.214,292580 → 1214,29
   *   Registro: 306,516178 + 148.987,90 × 0,02 % (29,79758) = 336,313758 × 0,95 = 319,498070
   *            + 9,015182 = 328,513252 × 1,21 = 397,501035 → 397,50
   *   (sin la rebaja: notaría 1278,20 entre 1095,60 y 1460,80, registro 417,85)
   *   Total 157.500 + 3.750 + 1214,29 + 397,50 + 500 = 163.361,79 (21,7816 → 21,78 %)
   *   · coste 913.361,79
   */
  test('CASO 2 ter (límite) — País Vasco con renuncia, 750.000 €: IVA 21 % + AJD 0,5 % foral y ningún ITP', async ({ page }) => {
    expect(ITP_CCAA['pais-vasco'].ajd).toBe(0.5);
    expect(ITP_CCAA['pais-vasco'].ajdRenuncia).toBeUndefined();

    await page.goto(RUTA);
    await esperarHidratacion(page, CAMPOS);
    await page.selectOption('#select-ccaa', 'pais-vasco');
    await page.getByRole('button', { name: /renuncia al IVA/ }).click();
    await sembrar(page, PRECIO, '750000');
    await sembrar(page, GESTORIA, '500');

    await expect(page.locator('h3', { hasText: /^ITP/ })).toHaveCount(0);
    expect(sinEspacioPct(await rotuloTarjeta(page, /^IVA/))).toBe('IVA (renuncia · ISP) (21,00%)');
    expect(await valorTarjeta(page, 'IVA (')).toBe('157.500,00 €');
    expect(sinEspacioPct(await rotuloTarjeta(page, /^AJD/))).toBe('AJD (0,50%)');
    expect(await valorTarjeta(page, 'AJD (')).toBe('3750,00 €');
    expect(await descripcionTarjeta(page, 'AJD (')).toBe(
      'Tipo general de la comunidad: algunas aplican uno incrementado cuando hay renuncia',
    );
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('1214,29 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain('entre 1040,82 € y 1387,76 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('397,50 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('163.361,79 €');
    expect(sinEspacioPct(await descripcionTarjeta(page, 'Total gastos adicionales'))).toBe('21,78% sobre el precio de compra');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('913.361,79 €');
    const recuadro = await recuadroCcaa(page);
    expect(recuadro).toContain('ITP General 7%');
    expect(recuadro).toContain('AJD 0,5%');
  });

  /**
   * CASO 3 (RECHAZO / NOMBRAR) — el invariante de la familia en los DOS importes de la app.
   * «Un importe ILEGIBLE no es un cero: si mueve alguna cifra publicada, la app tiene que
   * nombrarlo y decir EN QUÉ DIRECCIÓN falta.» La dirección se MIDE: con el dato y sin él.
   *
   * Galicia, 2ª mano, 275.000 € (caso 1):
   *   (notaría 796,47 y registro 250,82: con la rebaja del 5 % del nº 2.1 desde el 17/10/2026,
   *   cabo C0209; antes 838,39 y 263,45, y cada total 54,55 € más)
   *   gestoría 650       → total 23.697,29 · coste 298.697,29 (definitivos)
   *   gestoría «2.000.50» → «Sin leer», total 23.047,29 (8,3808 → 8,38 %) · coste 298.047,29: la
   *     cifra BAJA 650 € sin el dato, así que el aviso tiene que decir que el coste real es MAYOR,
   *     y los dos títulos de cierre llevan «(parcial)» (hallazgo 1585).
   *   Obra nueva con la gestoría ilegible: IVA 57.750 + AJD 4.125 + 796,47 + 250,82 = 62.922,29 ·
   *     coste 337.922,29; el aviso del ilegible se SUMA a la salvedad del IVA deducible.
   * Precio «2.000.50»: ninguna cifra, y el marcador nombra lo escrito (8d7dcd1b).
   */
  test('CASO 3 (rechazo) — gestoría y precio ilegibles: se nombran, y la dirección del aviso es la medida', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, CAMPOS);
    await page.selectOption('#select-ccaa', 'galicia');
    await sembrar(page, PRECIO, '275000');

    await sembrar(page, GESTORIA, '650');
    const conDato = eurosDeTexto(await valorTarjeta(page, 'COSTE TOTAL'));
    expect(conDato).toBeCloseTo(298697.29, 2);
    expect(await rotuloTarjeta(page, /^COSTE TOTAL/)).toBe('COSTE TOTAL DE ADQUISICIÓN');

    await sembrar(page, GESTORIA, '2.000.50');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('Sin leer');
    expect(await descripcionTarjeta(page, 'Gastos de gestoría')).toContain('NO está incluido en el total');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('23.047,29 €');
    const sinDato = eurosDeTexto(await valorTarjeta(page, 'COSTE TOTAL'));
    expect(sinDato).toBeCloseTo(298047.29, 2);
    // Dirección medida: sin el dato la cifra publicada es MENOR, así que falta hacia arriba.
    expect(conDato - sinDato).toBeCloseTo(650, 2);
    expect(await rotuloTarjeta(page, /^Total gastos adicionales/)).toBe('Total gastos adicionales (parcial)');
    expect(sinEspacioPct(await descripcionTarjeta(page, 'Total gastos adicionales'))).toBe(
      '8,38% sobre el precio de compra — SIN la gestoría, que no se ha podido leer',
    );
    expect(await rotuloTarjeta(page, /^COSTE TOTAL/)).toBe('COSTE TOTAL (PARCIAL)');
    expect(await descripcionTarjeta(page, 'COSTE TOTAL')).toBe(
      'No incluye la gestoría, que no se ha podido leer: el coste real será mayor',
    );

    // Con IVA en pantalla, el aviso del ilegible se suma a la salvedad del IVA deducible.
    await page.getByRole('button', { name: /Obra nueva/ }).click();
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('62.922,29 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('337.922,29 €');
    expect(await descripcionTarjeta(page, 'COSTE TOTAL')).toBe(
      'No incluye la gestoría, que no se ha podido leer: el coste real será mayor (precio + gastos antes de deducir el IVA si tienes derecho)',
    );

    // El precio ilegible: ninguna cifra publicada y el marcador nombra lo que se escribió.
    await sembrar(page, PRECIO, '2.000.50');
    await expect(page.locator('h3', { hasText: /^COSTE TOTAL/ })).toHaveCount(0);
    await expect(page.locator('[class*="placeholder"] p')).toContainText('No se ha podido leer el precio «2.000.50»');
  });

  /**
   * «Coeficientes» (1c83ff86, IIVTNU con prorrateo): no tienen dónde llegar. La app solo
   * calcula lo que paga quien COMPRA —no hay plusvalía municipal ni ganancia del vendedor—, y
   * la FAQ de la plusvalía no publica ningún coeficiente.
   */
  test('efecto familia — los coeficientes del IIVTNU (1c83ff86) no tienen dónde llegar: la app no calcula plusvalía', async () => {
    const fuente = await leerFuente();
    expect(fuente).not.toMatch(/coeficienteIIVTNU|COEFICIENTES_IIVTNU|calcularPlusvaliaMunicipal/);
    expect(fuente).not.toMatch(/Años de propiedad/);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// REPARACIÓN 26/09/2026 — los cuatro hallazgos de la tanda del 26/09 (2204-2207) y la receta de
// la familia llevada a esta hermana: notaría y registro sin IVA donde no rige (2214, anotado en
// terreno-rústico), la base mínima del AJD (2209, anotado en solar), las notas de la comunidad
// (2208, anotado en solar) y el foco del select en oscuro (2215, anotado en terreno-rústico).
// Los cuatro casos del 26/09 estaban con `test.fail()`: se quita la marca, y las aserciones que
// afirmaban el defecto («se reproduce») salen, porque ya no se reproduce. Queda lo que DEBE pasar.
// Cifras a mano, de los comentarios de cada caso; ninguna copiada de la app.
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Reparación 26/09/2026 — hallazgos 2204-2207 y la receta de la familia', () => {
  test.describe.configure({ timeout: 60_000 });

  /**
   * REPARADO 2204 · forma (c) — el «%» va con espacio duro U+00A0 (regla de catálogo desde
   * 75d5db87; Ortografía de la RAE, 2010) en la herramienta, el sello, el JSON-LD y las tres
   * description (meta, og y twitter). Antes: 24 «%» pegados en la página, 26 en el JSON-LD y 3
   * en las description, más los «50 %» con espacio normal. Madrid, 500.000 €, gestoría 500.
   */
  test('REPARADO 2204 — ningún «%» sin espacio duro en pantalla, sellos, JSON-LD ni description', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, CAMPOS);
    await page.selectOption('#select-ccaa', 'madrid');
    await sembrar(page, PRECIO, '500000');
    await sembrar(page, GESTORIA, '500');
    expect(await valorTarjeta(page, 'ITP (')).toBe('30.000,00 €');

    const pantalla = [
      await page.locator('[class*="resultados"]').first().innerText(),
      await page.locator('[class*="infoCcaa"]').first().innerText(),
      await page.locator('[class*="transmisionGrid"]').first().innerText(),
      ...(await page.locator('[aria-label="Datos de referencia normativos"]').allInnerTexts()),
    ].join('\n');
    const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).join('\n');
    const descripciones = await Promise.all(
      ['meta[name="description"]', 'meta[property="og:description"]', 'meta[name="twitter:description"]'].map(
        async (sel) => (await page.locator(sel).getAttribute('content')) ?? '',
      ),
    );
    // Hay «%» que medir en las tres bocas (el caso no pasa en vacío)…
    expect(pantalla).toMatch(/\d %/);
    expect(ld).toMatch(/\d %/);
    expect(descripciones.join(' ')).toMatch(/\d %/);
    // …y ninguno sin su espacio duro.
    const malos = (t: string) =>
      [...t.matchAll(/\d%|\d %/g)].map((m) => t.slice(Math.max(0, (m.index ?? 0) - 14), (m.index ?? 0) + 3).replace(/\s+/g, ' '));
    expect({ pantalla: malos(pantalla), jsonLd: malos(ld), description: malos(descripciones.join('\n')) }).toEqual({
      pantalla: [],
      jsonLd: [],
      description: [],
    });
  });

  /**
   * REPARADO 2205 · forma (a) — un sello por módulo cuyos datos publica la página: la escala del
   * ahorro de la guía (`GANANCIAS_PATRIMONIALES_META`, art. 66 LIRPF, 12/08/2026) y los aranceles
   * de notaría y registro (RD 1426/1989 y RD 1427/1989, 20/08/2026). El de inmuebles lleva una
   * fuente propia: ya no cita la Ley 35/2006 ni el RDL 26/2021, que esta app no aplica (no calcula
   * ni el IRPF ni la plusvalía municipal).
   */
  test('REPARADO 2205 — sellos de la escala del ahorro y de los aranceles, y el de inmuebles sin normas ajenas', async ({ page }) => {
    const fecha = (iso: string) => iso.split('-').reverse().join('/');
    expect(fecha(GANANCIAS_PATRIMONIALES_META.verificado)).toBe('12/08/2026');
    expect(FACTURA_NOTARIAL.baseNormativa).toContain('RD 1426/1989');
    expect(REGISTRO_CONCEPTOS.baseNormativa).toContain('RD 1427/1989');

    await page.goto(RUTA);
    await esperarHidratacion(page, CAMPOS);
    await sembrar(page, PRECIO, '500000');
    const guia = ((await page.locator('body').textContent()) ?? '').replace(/\s+/g, ' ');
    expect(sinEspacioPct(guia)).toContain(
      `IRPF base del ahorro (${TRAMOS_GANANCIAS_PATRIMONIALES_2025[0].tipo}-${TRAMOS_GANANCIAS_PATRIMONIALES_2025[TRAMOS_GANANCIAS_PATRIMONIALES_2025.length - 1].tipo}%)`,
    );
    // Madrid, 500.000 €, con la rebaja del 5 % del nº 2.1 (17/10/2026, cabo C0209; antes 1076,61
    // y 345,12): notaría 508,435226 × 0,95 × 1,21 × 1,75 = 1.022,78 · registro (276,212547 × 0,95
    // + 9,015182) × 1,21 = 328,41
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('1022,78 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('328,41 €');

    const sellos =(await page.locator('[aria-label="Datos de referencia normativos"]').allInnerTexts()).map((s) =>
      s.replace(/\s+/g, ' '),
    );
    const todos = sellos.join(' | ');
    expect(todos).toContain(`Última verificación: ${fecha(GANANCIAS_PATRIMONIALES_META.verificado)}`);
    expect(todos).toMatch(/1426\/1989/);
    expect(todos).toMatch(/1427\/1989/);
    const inmuebles = sellos.find((s) => s.includes('ITP/AJD/IVA')) ?? '';
    expect(inmuebles).toContain('Real Decreto Legislativo 1/1993');
    expect(inmuebles).not.toMatch(/RDL 26\/2021|Ley 35\/2006/);
  });

  /**
   * REPARADO 2206 — el rango del AJD que se publica (tabla y FAQPage) dice que en Ceuta y Melilla
   * se paga la mitad (art. 57 bis.1 TRLITPAJD), que es lo que la app cobra:
   *   Ceuta, obra nueva, 500.000 €: AJD = 500.000 × 0,5 % × (1 − 0,5) = 1.250,00 (0,25 %)
   */
  test('REPARADO 2206 — el rango del AJD publicado dice que en Ceuta y Melilla se paga la mitad', async ({ page }) => {
    expect(RANGO_AJD_OTROS.min).toBe(0.5);
    expect(ITP_CCAA['ceuta'].ajd).toBe(0.5);
    expect(BONIFICACION_CUOTA_CEUTA_MELILLA).toBe(0.5);

    await page.goto(RUTA);
    await esperarHidratacion(page, CAMPOS);
    await page.selectOption('#select-ccaa', 'ceuta');
    await page.getByRole('button', { name: /Obra nueva/ }).click();
    await sembrar(page, PRECIO, '500000');
    expect(sinEspacioPct(await rotuloTarjeta(page, /^AJD/))).toBe('AJD (0,25%)');
    expect(await valorTarjeta(page, 'AJD (')).toBe('1250,00 €');

    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = JSON.parse(bloques.find((b) => b.includes('"FAQPage"')) ?? '{}') as {
      mainEntity: { name: string; acceptedAnswer: { text: string } }[];
    };
    // La pregunta del FAQPage es, desde el 08/10/2026 (3085), la misma que la visible.
    const respuesta = faq.mainEntity.find((q) => /IVA o ITP/.test(q.name))?.acceptedAnswer.text ?? '';
    const frase = respuesta.split(/(?<=\.)\s/).find((f) => /AJD/.test(f) && /va del/.test(f)) ?? '';
    expect(frase).toMatch(/Ceuta y Melilla se paga la mitad/);

    const celda = (await page.locator('tr', { hasText: 'AJD obra nueva' }).locator('td').nth(1).textContent()) ?? '';
    expect(celda).toMatch(/en Ceuta y Melilla, la mitad/);
  });

  /**
   * REPARADO 2207 · patrón 5 de la familia, «no falta, no vale» (hallazgo 1799 en la
   * referencia): un precio ESCRITO, legible e imposible no se anuncia como si faltara. El vacío
   * sigue pidiendo «Introduce el precio…», y el ilegible conserva su mensaje (grupo B del testigo).
   */
  test('REPARADO 2207 — un precio escrito como 0 o negativo dice que tiene que ser mayor que 0', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, CAMPOS);
    const marcador = page.locator('[class*="placeholder"] p');
    await expect(marcador).toHaveText('Introduce el precio de la nave industrial para ver el desglose de gastos');
    for (const entrada of ['0', '-275000']) {
      await sembrar(page, PRECIO, entrada);
      await expect(page.locator('h3', { hasText: /^COSTE TOTAL/ })).toHaveCount(0);
      await expect(marcador).toHaveText(`El precio escrito («${entrada}») ${PRECIO_NO_VALE}.`);
    }
    // El ilegible no cambia: sigue nombrando lo escrito.
    await sembrar(page, PRECIO, '2.000.50');
    await expect(marcador).toContainText('No se ha podido leer el precio «2.000.50»');
  });

  /**
   * Receta 1 (hallazgo 2214, anotado en terreno-rústico, motor reparado en 242fffcd) — en
   * Canarias, Ceuta y Melilla la notaría y el registro van SIN IVA: allí su factura lleva IGIC o
   * IPSI, que la app no calcula y nombra junto al total. Canarias, segunda mano, 150.000 €,
   * gestoría 500 (arancel a mano, RD 1426/1989 y RD 1427/1989):
   *   notaría: 90,15 + 108,182205 + 45,0759 + 89,89879 = 333,306895 × 1,75 = 583,287066 → 583,29
   *   registro: 171,0982 + 9,015182 = 180,113382 → 180,11
   *   ITP 150.000 × 6,5 % = 9.750 · total 9.750 + 583,29 + 180,11 + 500 = 11.013,40 · coste 161.013,40
   * Madrid, mismo precio: notaría × 1,21 = 705,78 y registro × 1,21 = 217,94, «(IVA incluido)».
   * 17/10/2026 (cabo C0209), con las bases del BOE y la rebaja del 5 % del nº 2.1:
   *   notaría: 90,151816 + 108,182254 + 45,075900 + 89,898741 = 333,308711 × 0,95 = 316,643275
   *            × 1,75 = 554,125732 → 554,13
   *   registro: 171,098684 × 0,95 = 162,543750 + 9,015182 = 171,558932 → 171,56
   *   total 9.750 + 554,13 + 171,56 + 500 = 10.975,69 · coste 160.975,69
   *   Madrid: notaría 316,643275 × 1,21 × 1,75 = 670,49 · registro 171,558932 × 1,21 = 207,59
   */
  test('Receta 1 (2214) — Canarias y Ceuta: notaría y registro sin IVA, rotulados sin IGIC/IPSI y nombrados junto al total', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, CAMPOS);
    await page.selectOption('#select-ccaa', 'canarias');
    await sembrar(page, PRECIO, '150000');
    await sembrar(page, GESTORIA, '500');
    expect(await valorTarjeta(page, 'ITP (')).toBe('9750,00 €');
    expect(await rotuloTarjeta(page, /^Gastos de notaría/)).toBe('Gastos de notaría (sin IGIC)');
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('554,13 €');
    expect(await rotuloTarjeta(page, /^Registro de la Propiedad/)).toBe('Registro de la Propiedad (sin IGIC)');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('171,56 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('10.975,69 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('160.975,69 €');
    const nota = page.locator('[class*="avisoHonorarios"]');
    await expect(nota).toHaveText(
      'ℹ️ Las facturas de notaría y registro llevan además IGIC, que esta herramienta no calcula, así que cuestan más de lo que se muestra.',
    );
    // La nota no habla del «coste real»: esas palabras son del aviso de la operación (testigo).
    await expect(nota).not.toContainText('coste real');

    await page.selectOption('#select-ccaa', 'ceuta');
    expect(await rotuloTarjeta(page, /^Registro de la Propiedad/)).toBe('Registro de la Propiedad (sin IPSI)');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('171,56 €');
    await expect(nota).toContainText('llevan además IPSI');

    await page.selectOption('#select-ccaa', 'madrid');
    expect(await rotuloTarjeta(page, /^Gastos de notaría/)).toBe('Gastos de notaría (IVA incluido)');
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('670,49 €');
    expect(await rotuloTarjeta(page, /^Registro de la Propiedad/)).toBe('Registro de la Propiedad (IVA incluido)');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('207,59 €');
    await expect(nota).toHaveCount(0);
  });

  /**
   * Hallazgo 2209 (anotado en solar, la misma forma aquí) — la base del AJD no puede ser inferior
   * al valor de referencia (art. 30.1 TRLITPAJD, redacción de la Ley 11/2021), aunque la del IVA
   * sea la contraprestación. La app tiene un solo precio, así que lo dice donde publica el AJD —la
   * tarjeta, el total, la ayuda del precio y las limitaciones— y en ningún sitio sin AJD.
   */
  test('Hallazgo 2209 — con AJD, la tarjeta, el total y la ayuda dicen que su base mínima es el valor de referencia', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, CAMPOS);
    await page.selectOption('#select-ccaa', 'madrid');
    await sembrar(page, PRECIO, '500000');
    const crudo = async (titulo: RegExp) =>
      ((await page.locator('h3', { hasText: titulo }).first().locator('xpath=../following-sibling::p[1]').innerText()) ?? '').replace(/\s+/g, ' ');

    // Segunda mano: ITP y ningún AJD → ninguna salvedad del AJD.
    expect(await crudo(/^COSTE TOTAL/)).not.toContain('art. 30.1');

    await page.getByRole('button', { name: /Obra nueva/ }).click();
    expect(await valorTarjeta(page, 'AJD (')).toBe('3750,00 €');
    expect(await crudo(/^AJD/)).toContain(AVISO_BASE_AJD);
    expect((await crudo(/^COSTE TOTAL/)).endsWith(`. ${AVISO_BASE_AJD}`)).toBe(true);
    const ayuda = (await page.locator(`[id="${await page.locator(`input[aria-label="${PRECIO}"]`).getAttribute('aria-describedby')}"]`).innerText()).replace(/\s+/g, ' ');
    expect(ayuda).toContain('art. 30.1 TRLITPAJD');

    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const limitacion = (await page.locator('li', { hasText: 'valor de referencia catastral puede ser' }).innerText()).replace(/\s+/g, ' ');
    expect(limitacion).toMatch(/AJD.*art\. 30\.1 TRLITPAJD/);
  });

  /**
   * Hallazgo 2208 (anotado en solar, la misma forma aquí) — la app negaba de plano los tipos
   * reducidos («naves industriales no tienen tipos reducidos», «solo aplican a inmuebles
   * residenciales») y no pintaba las notas de la comunidad, donde data/itp-ccaa.ts documenta el
   * 1 % del art. 121-11 de Aragón por adquirir un inmueble para iniciar una actividad económica.
   */
  test('Hallazgo 2208 — Aragón: sin negar de plano los tipos reducidos, y con su nota (art. 121-11) a la vista', async ({ page }) => {
    expect(ITP_CCAA['aragon'].notas).toContain('art. 121-11');
    await page.goto(RUTA);
    await esperarHidratacion(page, CAMPOS);
    await page.selectOption('#select-ccaa', 'aragon');
    await sembrar(page, PRECIO, '100000');
    const texto = [await descripcionTarjeta(page, 'ITP ('), await page.locator('[class*="infoCcaa"]').first().innerText()]
      .join(' ')
      .replace(/\s+/g, ' ');
    expect(texto).not.toMatch(/no tienen tipos reducidos|solo aplican a inmuebles residenciales/);
    expect(texto).toContain('121-11');
    // La nota llega de data/ con el «%» pegado y se pinta con espacio duro.
    const recuadro = await page.locator('[class*="infoCcaa"]').first().innerText();
    expect(recuadro).not.toMatch(/\d%/);
  });

  /**
   * Hallazgo 2215 (anotado en terreno-rústico; la misma regla en este módulo) — en oscuro, la
   * regla `[data-theme='dark'] .select` pisaba el borde del foco. Ahora el borde cambia y hay
   * contorno con el teclado.
   */
  test('Hallazgo 2215 — en oscuro el select de comunidad muestra el foco', async ({ page }) => {
    await page.addInitScript(() => {
      try {
        localStorage.setItem('meskeia-theme', 'dark');
      } catch {
        /* sin almacenamiento no hay tema oscuro que medir */
      }
    });
    await page.goto(RUTA);
    await esperarHidratacion(page, CAMPOS);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    const leer = () =>
      page.locator('#select-ccaa').evaluate((el) => {
        const cs = getComputedStyle(el);
        return { borde: cs.borderTopColor, outline: cs.outlineStyle };
      });
    const sinFoco = await leer();
    await page.locator(`input[aria-label="${PRECIO}"]`).focus();
    await page.keyboard.press('Tab');
    await expect(page.locator('#select-ccaa')).toBeFocused();
    await expect.poll(async () => (await leer()).borde).not.toBe(sinFoco.borde);
    expect((await leer()).outline).not.toBe('none');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 06/10/2026 — hermana de la familia «Compraventa inmobiliaria» (referencia:
// estimador-compraventa-inmueble · testigo: tests/familias/compraventa.spec.ts, 82/82 en verde
// ese mismo día). La cola la sacó INVALIDADA tras b86a5607, 7d5c1876 y 242fffcd: las
// reparaciones del 26/09 se midieron en navegador (Canarias y Ceuta sin IGIC/IPSI en notaría y
// registro y con el cierre parcial; la salvedad del art. 30.1; el «0» que «tiene que ser mayor
// que 0»; ningún «%» pegado en 19 territorios × 3 regímenes ni en la guía abierta).
//
// De dónde sale cada cifra (ninguna de memoria):
//  - Castilla-La Mancha: `TIPOS_ITP_CCAA_2025` tipo 9 (data/fiscal/inmuebles.ts), sin escala ni
//    umbral en `ITP_CCAA['castilla-mancha']`, `ajd: 1.5` y sin `ajdRenuncia`.
//  - Canarias: tipo 6,5 (data/fiscal), `ajd: 0.75`, sin `ajdRenuncia`; `TERRITORIOS_SIN_IVA`
//    (IGIC) y `honorariosLlevanIVA('canarias') === false`.
//  - Ceuta: `tipoGeneral: 6` × (1 − `BONIFICACION_CUOTA_CEUTA_MELILLA`) = 3 % efectivo.
//  - Valencia: `umbralTipoUnico { superiorA: 1_000_000, tipo: 11 }`, `ajd: 1.4`, `ajdRenuncia: 2`.
//  - IVA de la nave: `IVA_INMUEBLES_2025.local = 21`.
//
// ⚠️ Notaría y registro: a mano salen (CLM 420.000 €) 991,91 € (850,21–1133,61) y 316,08 €;
// (Canarias 640.000 €, sin IGIC) 998,61 € (855,95–1141,27) y 323,33 €; (Valencia 1.200.000 €)
// 1564,06 € y 526,75 €, y la app da esas cifras al céntimo. NO se fijan aquí: los hallazgos 2901
// y 2902 (la rebaja del 5 % de los dos aranceles, RD 1426/1989 y RD 1427/1989, abiertos en la
// referencia) las cambiarán. Lo que se comprueba es que el desglose CUADRA con ellas: el total es
// la suma de las líneas visibles, el impuesto fijo más los dos fedatarios, el «% sobre el
// precio» y el coste.
// ═══════════════════════════════════════════════════════════════════════════════

/** Las líneas del desglose (lo que hay entre el precio y el total), leídas de la pantalla. */
async function lineasDelDesglose(page: Page): Promise<{ titulo: string; euros: number | null }[]> {
  const tarjetas = await page.locator('[class*="resultados"] h3').evaluateAll((hs) =>
    hs.map((h) => ({
      titulo: (h.textContent ?? '').replace(/\s+/g, ' ').trim(),
      valor: (h.parentElement?.nextElementSibling?.textContent ?? '').replace(/\s+/g, ' ').trim(),
    })),
  );
  return tarjetas
    .filter((t) => !/^(Precio de la nave|Total gastos|COSTE TOTAL)/.test(t.titulo))
    .map((t) => ({ titulo: t.titulo, euros: /\d/.test(t.valor) ? eurosDeTexto(t.valor) : null }));
}

const pctEs = (n: number): string =>
  new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

/**
 * El desglose cuadra con lo que enseña: total = suma de las líneas = `fijos` (impuesto, AJD y
 * gestoría, calculados a mano en cada caso) + notaría + registro; la notaría es el punto medio
 * de su propia horquilla; el «% sobre el precio» y el coste salen de ese total. Devuelve el total.
 */
async function cuadraElDesglose(page: Page, precio: number, fijos: number): Promise<number> {
  const lineas = await lineasDelDesglose(page);
  const de = (re: RegExp) => lineas.find((l) => re.test(l.titulo))?.euros ?? NaN;
  const notaria = de(/^Gastos de notaría/);
  const registro = de(/^Registro de la Propiedad/);
  expect(notaria).toBeGreaterThan(0);
  expect(registro).toBeGreaterThan(0);

  const horquilla = (await descripcionTarjeta(page, 'Gastos de notaría')).match(/entre ([\d.,]+) € y ([\d.,]+) €/);
  expect(horquilla, 'la notaría publica su horquilla').not.toBeNull();
  const [min, max] = [eurosDeTexto(horquilla![1]), eurosDeTexto(horquilla![2])];
  expect(Math.abs(notaria - (min + max) / 2)).toBeLessThanOrEqual(0.011);

  const total = eurosDeTexto(await valorTarjeta(page, 'Total gastos adicionales'));
  expect(total).toBeCloseTo(lineas.reduce((s, l) => s + (l.euros ?? 0), 0), 2);
  expect(total).toBeCloseTo(fijos + notaria + registro, 2);
  expect(sinEspacioPct(await descripcionTarjeta(page, 'Total gastos adicionales'))).toMatch(
    new RegExp(`^${pctEs((total / precio) * 100)}% sobre el precio de compra`),
  );
  expect(eurosDeTexto(await valorTarjeta(page, 'COSTE TOTAL'))).toBeCloseTo(precio + total, 2);
  return total;
}

/** La cifra del item «AJD» del recuadro de la comunidad, leída de su propio nodo. */
async function ajdDelRecuadro(page: Page): Promise<string> {
  return page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('[class*="infoCcaaItem"]'));
    const ajd = items.find((i) => (i.textContent ?? '').startsWith('AJD'));
    return (ajd?.querySelector('[class*="infoCcaaValue"]')?.textContent ?? '').replace(/\s+/g, ' ').trim();
  });
}

test.describe('Re-inspección 06/10/2026 — familia: casos nuevos, invariante y formas de las hermanas', () => {
  test.describe.configure({ timeout: 90_000 });

  /**
   * CASO 1 (NORMAL) — nave de segunda mano entre empresas en Castilla-La Mancha, 420.000 €,
   * gestoría 600 € (Castilla-La Mancha solo se había probado con renuncia, el 23/09, a 165.000 €).
   *   a) Segunda mano: ITP = 420.000 × 9 % = 37.800,00 → fijos 37.800 + 600 = 38.400
   *      (total a mano 39.707,99, 9,45 %; coste 459.707,99)
   *   b) Renuncia: IVA 420.000 × 21 % = 88.200,00 (ISP) + AJD 420.000 × 1,5 % = 6.300,00 (tipo
   *      general: CLM no tiene tipo propio de la renuncia) y ningún ITP → fijos 95.100
   *      (total a mano 96.407,99, 22,95 %)
   *   c) Obra nueva: el mismo IVA y el mismo AJD, sin la frase de la renuncia.
   */
  test('CASO 1 (normal) — Castilla-La Mancha, 420.000 €: ITP 9 % plano; con renuncia y en obra nueva, IVA 21 % + AJD 1,5 %', async ({ page }) => {
    const clm = ITP_CCAA['castilla-mancha'];
    expect(clm.tipoGeneral).toBe(9);
    expect(clm.tramosProgresivos).toBeUndefined();
    expect(clm.umbralTipoUnico).toBeUndefined();
    expect(clm.ajd).toBe(1.5);
    expect(clm.ajdRenuncia).toBeUndefined();
    expect(IVA_INMUEBLES_2025.local).toBe(21);

    await page.goto(RUTA);
    await esperarHidratacion(page, CAMPOS);
    await page.selectOption('#select-ccaa', 'castilla-mancha');
    await sembrar(page, PRECIO, '420000');
    await sembrar(page, GESTORIA, '600');

    // a) Segunda mano
    await expect(page.getByRole('button', { name: /Segunda mano/ })).toHaveAttribute('aria-pressed', 'true');
    expect(sinEspacioPct(await rotuloTarjeta(page, /^ITP \(/))).toBe('ITP (9,00%)');
    expect(await valorTarjeta(page, 'ITP (')).toBe('37.800,00 €');
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('600,00 €');
    await cuadraElDesglose(page, 420000, 37800 + 600);
    expect(await rotuloTarjeta(page, /^COSTE TOTAL/)).toBe('COSTE TOTAL DE ADQUISICIÓN');
    const recuadro = await recuadroCcaa(page);
    expect(recuadro).toContain('ITP General 9%');
    expect(recuadro).toContain('AJD 1,5%');
    expect(recuadro).not.toContain('Tipo según el valor');

    // b) Renuncia
    await page.getByRole('button', { name: /renuncia al IVA/ }).click();
    await expect(page.locator('h3', { hasText: /^ITP/ })).toHaveCount(0);
    expect(sinEspacioPct(await rotuloTarjeta(page, /^IVA/))).toBe('IVA (renuncia · ISP) (21,00%)');
    expect(await valorTarjeta(page, 'IVA (')).toBe('88.200,00 €');
    expect(sinEspacioPct(await rotuloTarjeta(page, /^AJD/))).toBe('AJD (1,50%)');
    expect(await valorTarjeta(page, 'AJD (')).toBe('6300,00 €');
    expect(await descripcionTarjeta(page, 'AJD (')).toBe(
      'Tipo general de la comunidad: algunas aplican uno incrementado cuando hay renuncia',
    );
    await cuadraElDesglose(page, 420000, 88200 + 6300 + 600);
    expect(sinEspacioPct(await ajdDelRecuadro(page))).toBe('1,5%');

    // c) Obra nueva
    await page.getByRole('button', { name: /Obra nueva/ }).click();
    expect(sinEspacioPct(await rotuloTarjeta(page, /^IVA/))).toBe('IVA (21,00%)');
    expect(await valorTarjeta(page, 'IVA (')).toBe('88.200,00 €');
    expect(await valorTarjeta(page, 'AJD (')).toBe('6300,00 €');
    // Solo la salvedad del art. 30.1, que el lector aparta: ninguna frase de la renuncia.
    expect(await descripcionTarjeta(page, 'AJD (')).toBe('');
    await cuadraElDesglose(page, 420000, 88200 + 6300 + 600);
  });

  /**
   * CASO 2 (LÍMITE) — Canarias, 2ª mano con RENUNCIA a la exención del IGIC, 640.000 €,
   * gestoría 500. Tres cosas a la vez que la app no cifra o cifra a medias: el IGIC de la
   * operación (no calculado), el IGIC de las facturas de notaría y registro (242fffcd: sin IVA) y
   * una gestoría ilegible.
   *   AJD = 640.000 × 0,75 % = 4.800,00 (sin tipo propio de la renuncia) → fijos 4.800 + 500
   *   (total a mano 6.621,94, 1,03 %; coste 646.621,94, PARCIAL)
   *   Gestoría «2.000.50»: el coste BAJA 500 € sin el dato → el aviso tiene que decir «mayor».
   * Y el paso por Ceuta con la renuncia elegida (el IPSI no la admite, hallazgo 1584):
   *   ITP = 640.000 × 6 % × 50 % = 19.200,00 (3,00 %), ningún AJD, cierre parcial por el IPSI de
   *   los fedatarios. De vuelta en Valencia la elección reaparece: IVA 134.400,00 y AJD 2 % =
   *   12.800,00.
   */
  test('CASO 2 (límite) — Canarias con renuncia al IGIC, 640.000 €; y la renuncia elegida al pasar por Ceuta y volver a Valencia', async ({ page }) => {
    expect(ITP_CCAA['canarias'].ajd).toBe(0.75);
    expect(ITP_CCAA['canarias'].ajdRenuncia).toBeUndefined();
    expect(ITP_CCAA['ceuta'].tipoGeneral).toBe(6);
    expect(BONIFICACION_CUOTA_CEUTA_MELILLA).toBe(0.5);

    await page.goto(RUTA);
    await esperarHidratacion(page, CAMPOS);
    await page.selectOption('#select-ccaa', 'canarias');
    await sembrar(page, PRECIO, '640000');
    await sembrar(page, GESTORIA, '500');
    await page.getByRole('button', { name: /renuncia al IGIC/ }).click();
    await expect(page.getByRole('button', { name: /renuncia al IGIC/ })).toHaveAttribute('aria-pressed', 'true');

    await expect(page.locator('h3', { hasText: /^ITP/ })).toHaveCount(0);
    expect(await rotuloTarjeta(page, /^IGIC$/)).toBe('IGIC');
    expect(await valorTarjeta(page, 'IGIC')).toBe('No calculado');
    expect(await descripcionTarjeta(page, 'IGIC')).toBe(
      'En Canarias no rige el IVA: la renuncia a la exención del IGIC tributa por el IGIC, que este simulador no calcula',
    );
    expect(sinEspacioPct(await rotuloTarjeta(page, /^AJD/))).toBe('AJD (0,75%)');
    expect(await valorTarjeta(page, 'AJD (')).toBe('4800,00 €');
    expect(await descripcionTarjeta(page, 'AJD (')).toBe(
      'Tipo general de la comunidad: algunas aplican uno incrementado cuando hay renuncia',
    );
    expect(await rotuloTarjeta(page, /^Gastos de notaría/)).toBe('Gastos de notaría (sin IGIC)');
    expect(await rotuloTarjeta(page, /^Registro de la Propiedad/)).toBe('Registro de la Propiedad (sin IGIC)');
    await cuadraElDesglose(page, 640000, 4800 + 500);
    expect(await rotuloTarjeta(page, /^Total gastos adicionales/)).toBe('Total gastos adicionales (parcial)');
    const descTotal = sinEspacioPct(await descripcionTarjeta(page, 'Total gastos adicionales'));
    expect(descTotal).toContain(' — SIN el IGIC, que no está incluido');
    expect(descTotal.endsWith(sinHonorarios('IGIC'))).toBe(true);
    expect(await rotuloTarjeta(page, /^COSTE TOTAL/)).toBe('COSTE TOTAL (PARCIAL)');
    expect(await descripcionTarjeta(page, 'COSTE TOTAL')).toBe('No incluye el IGIC: el coste real puede ser mayor');
    await expect(page.locator('[class*="avisoHonorarios"]')).toContainText('llevan además IGIC');
    const recuadro = await recuadroCcaa(page);
    expect(recuadro).toContain('ITP General 6,5%');
    expect(recuadro).toContain('AJD 0,75%');
    expect(recuadro).toContain('IGIC (obra nueva) No calculado');

    // La gestoría ilegible se SUMA a lo que ya faltaba, y en la dirección medida.
    const conDato = eurosDeTexto(await valorTarjeta(page, 'COSTE TOTAL'));
    await sembrar(page, GESTORIA, '2.000.50');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('Sin leer');
    const sinDato = eurosDeTexto(await valorTarjeta(page, 'COSTE TOTAL'));
    expect(conDato - sinDato).toBeCloseTo(500, 2);
    await cuadraElDesglose(page, 640000, 4800);
    expect(sinEspacioPct(await descripcionTarjeta(page, 'Total gastos adicionales'))).toContain(
      ' — SIN la gestoría, que no se ha podido leer',
    );
    expect(await descripcionTarjeta(page, 'COSTE TOTAL')).toBe(
      'No incluye el IGIC ni la gestoría, que no se ha podido leer: el coste real será mayor',
    );

    // Ceuta con la renuncia elegida: el botón se desactiva y se calcula la segunda mano.
    await sembrar(page, GESTORIA, '500');
    await page.selectOption('#select-ccaa', 'ceuta');
    const renunciaIpsi = page.getByRole('button', { name: /renuncia al IPSI/ });
    await expect(renunciaIpsi).toBeDisabled();
    await expect(renunciaIpsi).toHaveAttribute('aria-pressed', 'false');
    await expect(renunciaIpsi).toContainText('No existe en el IPSI: paga ITP');
    await expect(page.getByRole('button', { name: /Segunda mano/ })).toHaveAttribute('aria-pressed', 'true');
    expect(sinEspacioPct(await rotuloTarjeta(page, /^ITP \(/))).toBe('ITP (3,00%)');
    expect(await valorTarjeta(page, 'ITP (')).toBe('19.200,00 €');
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);
    await cuadraElDesglose(page, 640000, 19200 + 500);
    expect(await rotuloTarjeta(page, /^COSTE TOTAL/)).toBe('COSTE TOTAL (PARCIAL)');
    expect(await descripcionTarjeta(page, 'COSTE TOTAL')).toBe(SOLO_HONORARIOS('IPSI'));

    // De vuelta en una comunidad con renuncia, la elección del usuario no se ha perdido.
    await page.selectOption('#select-ccaa', 'valencia');
    await expect(page.getByRole('button', { name: /renuncia al IVA/ })).toHaveAttribute('aria-pressed', 'true');
    expect(await valorTarjeta(page, 'IVA (')).toBe('134.400,00 €');
    expect(sinEspacioPct(await rotuloTarjeta(page, /^AJD/))).toBe('AJD (2,00%)');
    expect(await valorTarjeta(page, 'AJD (')).toBe('12.800,00 €');
    expect(sinEspacioPct(await ajdDelRecuadro(page))).toBe('2%');
    await cuadraElDesglose(page, 640000, 134400 + 12800 + 500);
  });

  /**
   * CASO 2 bis (LÍMITE) — Comunitat Valenciana, OBRA NUEVA, 1.200.000 €, gestoría 500: el umbral
   * del ITP no se cuela en el IVA, y el AJD es el general (1,4 %), no el de la renuncia (2 %).
   *   IVA 1.200.000 × 21 % = 252.000,00 · AJD 1.200.000 × 1,4 % = 16.800,00 → fijos 269.300
   *   (total a mano 271.390,81, 22,62 %; coste 1.471.390,81)
   * El recuadro rotula el ITP General de una nave a ESE precio: 11 %.
   */
  test('CASO 2 bis (límite) — Valencia, obra nueva, 1.200.000 €: IVA 21 % + AJD general 1,4 %, ni ITP ni el AJD de la renuncia', async ({ page }) => {
    expect(ITP_CCAA['valencia'].ajd).toBe(1.4);
    expect(ITP_CCAA['valencia'].ajdRenuncia).toBe(2);

    await page.goto(RUTA);
    await esperarHidratacion(page, CAMPOS);
    await page.selectOption('#select-ccaa', 'valencia');
    await page.getByRole('button', { name: /Obra nueva/ }).click();
    await sembrar(page, PRECIO, '1200000');
    await sembrar(page, GESTORIA, '500');

    await expect(page.locator('h3', { hasText: /^ITP/ })).toHaveCount(0);
    expect(sinEspacioPct(await rotuloTarjeta(page, /^IVA/))).toBe('IVA (21,00%)');
    expect(await valorTarjeta(page, 'IVA (')).toBe('252.000,00 €');
    expect(sinEspacioPct(await rotuloTarjeta(page, /^AJD/))).toBe('AJD (1,40%)');
    expect(await valorTarjeta(page, 'AJD (')).toBe('16.800,00 €');
    expect(await descripcionTarjeta(page, 'AJD (')).toBe('');
    await cuadraElDesglose(page, 1200000, 252000 + 16800 + 500);
    expect(await rotuloTarjeta(page, /^COSTE TOTAL/)).toBe('COSTE TOTAL DE ADQUISICIÓN');
    const recuadro = await recuadroCcaa(page);
    expect(recuadro).toContain('ITP General 11%');
    expect(recuadro).toContain('AJD 1,4%');
  });

  /**
   * CASO 2 ter (LÍMITE) · forma del hallazgo 2905 de garaje — allí el AJD del recuadro salía de
   * un selector OCULTO y cambiaba según lo pulsado antes (País Vasco: 0 % al cargar, 0,5 % tras
   * pasar por otra pestaña). Aquí el recuadro lo pide al motor con el objeto de la app ('otro') y
   * la transmisión VISIBLE: 0,5 % (NF 1/2011 de Bizkaia, art. 44.1) al cargar y después de pulsar
   * los tres botones. No se reproduce.
   */
  test('CASO 2 ter — País Vasco: el AJD del recuadro es el 0,5 % de una nave antes y después de pulsar los tres regímenes', async ({ page }) => {
    expect(ITP_CCAA['pais-vasco'].ajd).toBe(0.5);
    expect(ITP_CCAA['pais-vasco'].ajdVivienda).toBe(0);

    await page.goto(RUTA);
    await esperarHidratacion(page, CAMPOS);
    await page.selectOption('#select-ccaa', 'pais-vasco');
    expect(sinEspacioPct(await ajdDelRecuadro(page))).toBe('0,5%');
    for (const boton of [/Obra nueva/, /renuncia al IVA/, /Segunda mano/]) {
      await page.getByRole('button', { name: boton }).click();
      expect(sinEspacioPct(await ajdDelRecuadro(page)), `tras pulsar ${boton}`).toBe('0,5%');
    }
    expect(await recuadroCcaa(page)).toContain('ITP General 7%');
  });

  /**
   * CASO 3 (RECHAZO / NOMBRAR) — el invariante en los dos importes y los estados que no son un
   * número. El NumberInput solo deja escribir dígitos, «,», «.» y un «-» inicial, así que lo
   * ilegible que puede llegar es eso: «,», «-», «1,2,3», «2.000.50».
   *   Precio ilegible → ninguna cifra y el marcador nombra lo escrito (8d7dcd1b), también tras el
   *   blur, que no lo reescribe. «0,004» → «se queda en 0,00 € al céntimo». «-420000» con el foco
   *   → «tiene que ser mayor que 0», y al salir del campo el min={0} lo deja en «0», que lo dice.
   *   Gestoría ilegible (CLM 420.000 €, gestoría 600 → total 39.707,99 a mano) → «Sin leer»,
   *   cierre «(parcial)» y «será mayor», con 600 € de diferencia medida.
   *   Valencia «1.500.000.00»: el recuadro vuelve al estado sin precio (9 % y la nota del umbral
   *   del 11 %, igual que con el campo vacío) y el panel nombra el precio; con «1.500.000,00»
   *   rotula el 11 %. No publica ninguna cifra calculada con un precio que no ha leído.
   */
  test('CASO 3 (rechazo) — ilegibles del precio y de la gestoría: se nombran, la dirección es la medida y el blur no los reescribe', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, CAMPOS);
    await page.selectOption('#select-ccaa', 'castilla-mancha');
    const marcador = page.locator('[class*="placeholder"] p');
    const campoPrecio = page.locator(`input[aria-label="${PRECIO}"]`);

    for (const ilegible of [',', '-', '1,2,3', '2.000.50']) {
      await sembrar(page, PRECIO, ilegible);
      await expect(page.locator('h3', { hasText: /^COSTE TOTAL/ })).toHaveCount(0);
      await expect(marcador).toContainText(`No se ha podido leer el precio «${ilegible}»`);
      await campoPrecio.focus();
      await campoPrecio.blur();
      await expect(campoPrecio).toHaveValue(ilegible);
      await expect(marcador).toContainText(`No se ha podido leer el precio «${ilegible}»`);
    }
    await sembrar(page, PRECIO, '0,004');
    await expect(marcador).toHaveText(`El precio escrito («0,004») se queda en 0,00 € al céntimo, y ${PRECIO_NO_VALE}.`);
    await campoPrecio.focus();
    await sembrar(page, PRECIO, '-420000');
    await expect(marcador).toHaveText(`El precio escrito («-420000») ${PRECIO_NO_VALE}.`);
    await campoPrecio.blur();
    await esperarValorEnReact(page, `input[aria-label="${PRECIO}"]`, '0');
    await expect(marcador).toHaveText(`El precio escrito («0») ${PRECIO_NO_VALE}.`);

    // La gestoría, con la dirección medida.
    await sembrar(page, PRECIO, '420000');
    await sembrar(page, GESTORIA, '600');
    const conDato = await cuadraElDesglose(page, 420000, 37800 + 600);
    for (const ilegible of [',', '-', '1.000.000.00']) {
      await sembrar(page, GESTORIA, ilegible);
      expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('Sin leer');
      const sinDato = await cuadraElDesglose(page, 420000, 37800);
      expect(conDato - sinDato, `gestoría «${ilegible}»`).toBeCloseTo(600, 2);
      expect(await rotuloTarjeta(page, /^Total gastos adicionales/)).toBe('Total gastos adicionales (parcial)');
      expect(await rotuloTarjeta(page, /^COSTE TOTAL/)).toBe('COSTE TOTAL (PARCIAL)');
      expect(await descripcionTarjeta(page, 'COSTE TOTAL')).toBe(
        'No incluye la gestoría, que no se ha podido leer: el coste real será mayor',
      );
    }

    // Valencia: un precio ilegible por encima del umbral no fija el tipo del recuadro.
    await page.selectOption('#select-ccaa', 'valencia');
    await sembrar(page, PRECIO, '1.500.000,00');
    expect(await recuadroCcaa(page)).toContain('ITP General 11%');
    await sembrar(page, PRECIO, '1.500.000.00');
    await expect(marcador).toContainText('No se ha podido leer el precio «1.500.000.00»');
    const recuadro = await recuadroCcaa(page);
    expect(recuadro).toContain('ITP General 9%');
    expect(recuadro).toContain('pasa al 11% sobre TODO el valor');
  });

  /**
   * Forma del hallazgo 2906 de garaje (`.transmisionSub { opacity: 0.8 }`, 3,36-3,60:1): aquí el
   * subtítulo usa `--text-secondary` SIN opacidad. Medido el 06/10/2026, con el fondo compuesto
   * (el activo lleva rgba(46,134,171,…)) y la opacidad de toda la cadena: claro 5,22-5,50:1,
   * oscuro 4,78-5,83:1. No se reproduce; queda como testigo.
   */
  test('forma 2906 — los subtítulos de los botones de transmisión llegan a 4,5:1 en los dos temas', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, CAMPOS);
    await page.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important}' });
    const peorSubtitulo = () =>
      page.evaluate(() => {
        const canal = (c: number) => {
          const s = c / 255;
          return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
        };
        const lum = (p: number[]) => 0.2126 * canal(p[0]) + 0.7152 * canal(p[1]) + 0.0722 * canal(p[2]);
        const rgba = (s: string) => {
          const n = (s.match(/[\d.]+/g) ?? []).map(Number);
          return { c: [n[0], n[1], n[2]], a: n.length > 3 ? n[3] : 1 };
        };
        const sobre = (arriba: number[], a: number, abajo: number[]) => arriba.map((v, i) => v * a + abajo[i] * (1 - a));
        let peor = { ratio: 21, texto: '' };
        for (const el of Array.from(document.querySelectorAll('[class*="transmisionSub"]'))) {
          const capas: { c: number[]; a: number }[] = [];
          let opacidad = 1;
          for (let n: Element | null = el; n; n = n.parentElement) {
            opacidad *= Number(getComputedStyle(n).opacity);
            const f = rgba(getComputedStyle(n).backgroundColor);
            if (f.a > 0) capas.push(f);
            if (f.a >= 1) break;
          }
          let fondo = [255, 255, 255];
          for (let i = capas.length - 1; i >= 0; i--) fondo = sobre(capas[i].c, capas[i].a, fondo);
          const t = rgba(getComputedStyle(el).color);
          const texto = sobre(t.c, t.a * opacidad, fondo);
          const [x, y] = [lum(texto), lum(fondo)].sort((p, q) => q - p);
          const ratio = Math.round(((x + 0.05) / (y + 0.05)) * 100) / 100;
          if (ratio < peor.ratio) peor = { ratio, texto: (el.textContent ?? '').trim() };
        }
        return peor;
      });

    for (const regimen of [/Segunda mano/, /Obra nueva/, /renuncia al IVA/]) {
      await page.getByRole('button', { name: regimen }).click();
      const claro = await esperarEstable(peorSubtitulo);
      expect(claro.ratio, `claro, ${regimen}: «${claro.texto}»`).toBeGreaterThanOrEqual(4.5);
    }
    await activarTemaOscuro(page);
    for (const regimen of [/Segunda mano/, /Obra nueva/, /renuncia al IVA/]) {
      await page.getByRole('button', { name: regimen }).click();
      const oscuro = await esperarEstable(peorSubtitulo);
      expect(oscuro.ratio, `oscuro, ${regimen}: «${oscuro.texto}»`).toBeGreaterThanOrEqual(4.5);
    }
  });

  /**
   * Forma (c) del 2204 en TODOS los estados de la herramienta: el caso «REPARADO 2204» mide
   * Madrid en segunda mano; aquí, los 19 territorios × los regímenes que cada uno permite, con
   * sus avisos (IGIC, IPSI, renuncia, honorarios) y las notas de la comunidad que llegan de data/.
   * Medido el 06/10/2026: 0 «%» sin espacio duro, ni en la guía abierta.
   */
  test('forma (c) — ningún «%» sin espacio duro en 19 territorios × 3 regímenes', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, CAMPOS);
    await sembrar(page, PRECIO, '500000');
    await sembrar(page, GESTORIA, '500');
    const malos: string[] = [];
    for (const ccaa of Object.keys(ITP_CCAA)) {
      await page.selectOption('#select-ccaa', ccaa);
      for (const regimen of [/Segunda mano/, /Obra nueva/, /renuncia al/]) {
        const boton = page.getByRole('button', { name: regimen });
        if (await boton.isDisabled()) continue;
        await boton.click();
        const t = await page.locator('[class*="mainContent"]').first().innerText();
        for (const m of t.matchAll(/\d%|\d %/g)) {
          malos.push(`${ccaa} ${regimen.source}: …${t.slice(Math.max(0, (m.index ?? 0) - 14), (m.index ?? 0) + 3)}`);
        }
      }
    }
    expect(malos).toEqual([]);
  });

  /**
   * Efecto familia de hoy: el «Valor de transmisión» y el aviso de error del NumberInput
   * (#E53E3E) que se registraron en local-comercial no tienen dónde ocurrir aquí: la app no tiene
   * parte de vendedor ni pasa `error=` a sus dos NumberInput.
   */
  test('efecto familia 06/10 — ni «Valor de transmisión» ni `error=` en los NumberInput', async () => {
    const fuente = await leerFuente();
    expect(fuente).not.toMatch(/Valor de transmisión/);
    expect(fuente).not.toMatch(/\berror=\{/);
  });

  /**
   * REPARADO el 06/10/2026 (hallazgo 2914): la tabla, el FAQPage y el caso de uso nombran la
   * salvedad de Aragón. Era así [06/10·A] (contenido, bajo) — residuo de los hallazgos 726 (local-comercial) y 2208
   * (solar, llevado aquí el 26/09 en b86a5607). Aquella reparación arregló la tarjeta del ITP y el
   * recuadro, que ya no niegan de plano un tipo reducido y pintan la nota de Aragón (art. 121-11:
   * el 1 % por adquirir un inmueble para iniciar una actividad económica, documentado en
   * `ITP_CCAA.aragon.notas`). Pero quedan categóricos:
   *   · la tabla «Diferencias fiscales: nave industrial vs vivienda», fila «Tipos reducidos ITP»,
   *     columna nave: «No aplican» (la tabla solo existe en esta hermana);
   *   · la 6.ª pregunta del FAQPage, lo que leen los asistentes de IA: «Una nave no tiene tipos
   *     reducidos por perfil del comprador […], así que se aplica el tipo general del sitio donde
   *     esté el inmueble» (la de local-comercial, reparada con el 726, nombra el 1 % de Aragón);
   *   · el caso de uso «Autónomo compra nave de segunda mano»: «Paga ITP al tipo general de su
   *     CCAA — salvo en Ceuta y Melilla».
   * La FAQ visible de la misma página sí dice «Hay dos salvedades… en Aragón».
   */
  test('[06/10·A] ni la tabla comparativa ni el FAQPage niegan de plano el tipo de Aragón por actividad', async ({ page }) => {
    expect(ITP_CCAA['aragon'].notas).toContain('art. 121-11');
    await page.goto(RUTA);
    await esperarHidratacion(page, CAMPOS);
    await page.selectOption('#select-ccaa', 'aragon');
    await sembrar(page, PRECIO, '300000');
    // La propia pantalla documenta el tipo de la actividad…
    await expect(page.locator('[class*="infoCcaa"]').first()).toContainText('121-11');
    // …y la tabla y el FAQPage lo niegan.
    const celda = ((await page.locator('tr', { hasText: 'Tipos reducidos ITP' }).locator('td').nth(1).textContent()) ?? '').trim();
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = JSON.parse(bloques.find((b) => b.includes('"FAQPage"')) ?? '{}') as {
      mainEntity: { name: string; acceptedAnswer: { text: string } }[];
    };
    const sexta = faq.mainEntity.find((q) => /ITP más bajo/.test(q.name))?.acceptedAnswer.text ?? '';
    expect(sexta).toContain('tipo general');
    expect({
      tablaDiceNoAplican: celda === 'No aplican',
      faqSinSalvedadDeActividad: !/actividad|121-11/i.test(sexta),
    }).toEqual({ tablaDiceNoAplican: false, faqSinSalvedadDeActividad: false });
  });

  /**
   * REPARADO el 06/10/2026 (hallazgo 2915): la nota de Canarias se queda en «Exención total para
   * VPO.», sin comparativa. Era así [06/10·B] (contenido, bajo) — la nota de Canarias que llega de `data/itp-ccaa.ts`
   * (l. 390, «ITP más bajo de España junto con País Vasco y Madrid») se pinta en el recuadro de
   * una NAVE, para la que el País Vasco cobra el 7 % (`tipoNoVivienda`, NF 1/2011 art. 13.a), más
   * que Canarias (6,5 %), y para la que Navarra (6 %) y Ceuta y Melilla (3 % efectivo) son más
   * baratas. El FAQPage de esta misma app lo dice al revés: «El País Vasco no está entre ellas
   * para una nave». Las siete hermanas pintan las notas de la comunidad (local, solar y terreno
   * desde la receta del 726/2208), y en las de inmuebles que no son vivienda la nota afirma lo
   * mismo frente a un 7 % vasco. Medida solo aquí.
   */
  test('[06/10·B] la nota de Canarias no pone al País Vasco entre los ITP más bajos para una nave', async ({ page }) => {
    expect(ITP_CCAA['pais-vasco'].tipoGeneralNoVivienda).toBe(7);
    expect(ITP_CCAA['canarias'].tipoGeneral).toBe(6.5);
    expect(ITP_CCAA['navarra'].tipoGeneral).toBe(6);
    await page.goto(RUTA);
    await esperarHidratacion(page, CAMPOS);
    await page.selectOption('#select-ccaa', 'pais-vasco');
    expect(await recuadroCcaa(page)).toContain('ITP General 7%');
    await page.selectOption('#select-ccaa', 'canarias');
    const recuadro = await recuadroCcaa(page);
    expect(recuadro).toContain('ITP General 6,5%');
    expect(recuadro).not.toMatch(/más bajo de España junto con País Vasco/);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// INSPECTOR 08/10/2026 — hermana de la familia «Compraventa inmobiliaria» (referencia:
// estimador-compraventa-inmueble). Único cambio de código desde el 06/10: 99e1ee7e (page.tsx pinta
// `<RelatedApps />` sin prop y layout.tsx monta `<ConRelacionadas slug>`).
//
// Los tres casos se resolvieron a mano ANTES de abrir el navegador, con las tablas de
// `data/itp-ccaa.ts` y `data/fiscal/inmuebles.ts`:
//  - Asturias: `tramosProgresivos` 8 % hasta 300.000, 9 % hasta 500.000, 10 % el resto; `ajd: 1.2`.
//  - Melilla: `tipoGeneral: 6`, `ajd: 0.5`, × (1 − `BONIFICACION_CUOTA_CEUTA_MELILLA`) = la mitad;
//    IPSI sin calcular (`TERRITORIOS_SIN_IVA`) y notaría y registro sin IVA (`honorariosLlevanIVA`).
//  - Galicia: `tipoGeneral: 8`, `ajd: 1.5`, sin `ajdRenuncia`. IVA de la nave: `IVA_INMUEBLES_2025.local = 21`.
//  - Notaría: `ARANCELES_NOTARIO` hasta `LIMITE_ARANCEL_NOTARIAL` (6.010.121,04 €), × 1,5 / 1,75 / 2.
//
// ⚠️ Notaría y registro, a mano y con el motor de hoy: Asturias 420.000 € → 991,91 € (850,21–1133,61)
// y 316,08 €; Melilla 7.000.000 € (sin IPSI) → 3817,93 € (3272,51–4363,34) y 1595,33 €; Melilla
// 250.000 € (sin IPSI) → 671,01 € (575,15–766,87) y 210,23 €. La app da esas cifras al céntimo, y
// las tres arrastran los hallazgos de familia 2901 y 2902 (sin la rebaja del 5 % de los aranceles:
// con ella, Asturias 420.000 € serían 942,31 € y 300,83 €). Como el 06/10, NO se fijan: se
// comprueba que el desglose CUADRA con ellas (`cuadraElDesglose`).
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * `VER_HUECOS=1` quitaba la marca de los hallazgos abiertos del 08/10 y enseñaba por qué fallaban.
 * Los cinco (3084-3088) se REPARARON ese mismo día y ya no llevan marca; la constante queda sin uso.
 */
const I08_VER_HUECOS = Boolean(process.env.VER_HUECOS);

/** Las preguntas de la FAQ visible, leídas del DOM (la guía nace plegada, pero se renderiza). */
async function faqVisible(page: Page): Promise<{ q: string; a: string }[]> {
  return page.evaluate(() => {
    const h2 = Array.from(document.querySelectorAll('h2')).find((x) =>
      /Preguntas frecuentes — Compra de nave industrial/.test(x.textContent ?? ''),
    );
    const bloques = Array.from(h2?.parentElement?.querySelectorAll(':scope > div > div') ?? []);
    return bloques.map((d) => ({
      q: (d.querySelector('strong')?.textContent ?? '').replace(/\s+/g, ' ').trim(),
      a: Array.from(d.querySelectorAll('p'))
        .map((p) => (p.textContent ?? '').replace(/\s+/g, ' ').trim())
        .join(' '),
    }));
  });
}

/** Las preguntas del FAQPage que la página sirve en su `<script type="application/ld+json">`. */
async function faqPage(page: Page): Promise<{ q: string; a: string }[]> {
  const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
  const faq = JSON.parse(bloques.find((b) => b.includes('"FAQPage"')) ?? '{"mainEntity":[]}') as {
    mainEntity: { name: string; acceptedAnswer: { text: string } }[];
  };
  return faq.mainEntity.map((e) => ({
    q: e.name.replace(/\s+/g, ' ').trim(),
    a: e.acceptedAnswer.text.replace(/\s+/g, ' ').trim(),
  }));
}

test.describe('Inspector 08/10/2026 — familia: Asturias en escala, Melilla en obra nueva sobre el límite del arancel y la renuncia que Melilla rechaza', () => {
  test.describe.configure({ timeout: 90_000 });

  /**
   * CASO 1 (NORMAL) — Asturias, segunda mano, 420.000 €, gestoría 700 € (Asturias solo se había
   * probado a 750.000 €, en el tercer tramo).
   *   ITP = 300.000 × 8 % + 120.000 × 9 % = 24.000 + 10.800 = 34.800,00 €
   *   efectivo 34.800 / 420.000 = 8,2857 % → «ITP (8,29 %)»; recuadro: «ITP General 8 %» (primer
   *   tramo, el nominal que rotula el motor) y «AJD 1,2 %», con la nota de la escala.
   *   Sin AJD (segunda mano sin renuncia). Fijos: 34.800 + 700 = 35.500.
   *   (Total a mano con el motor de hoy: 36.807,99 €, 8,76 %; coste 456.807,99 €.)
   */
  test('CASO 1 (normal) — Asturias 420.000 €: ITP de escala 34.800,00 € (8,29 %), sin AJD, cierre definitivo', async ({ page }) => {
    const ast = ITP_CCAA['asturias'];
    expect(ast.tramosProgresivos).toEqual([
      { hasta: 300000, tipo: 8 },
      { hasta: 500000, tipo: 9 },
      { hasta: Infinity, tipo: 10 },
    ]);
    expect(ast.ajd).toBe(1.2);

    await page.goto(RUTA);
    await esperarHidratacion(page, CAMPOS);
    await page.selectOption('#select-ccaa', 'asturias');
    await sembrar(page, PRECIO, '420000');
    await sembrar(page, GESTORIA, '700');

    await expect(page.getByRole('button', { name: /Segunda mano/ })).toHaveAttribute('aria-pressed', 'true');
    expect(sinEspacioPct(await rotuloTarjeta(page, /^ITP \(/))).toBe('ITP (8,29%)');
    expect(await valorTarjeta(page, 'ITP (')).toBe('34.800,00 €');
    expect(await descripcionTarjeta(page, 'ITP (')).toBe(
      'Tipo general — las naves no tienen los reducidos de vivienda, pero alguna comunidad sí tiene tipos ligados a la ACTIVIDAD',
    );
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('700,00 €');
    expect(await rotuloTarjeta(page, /^Gastos de notaría/)).toBe('Gastos de notaría (IVA incluido)');
    await cuadraElDesglose(page, 420000, 34800 + 700);
    expect(await rotuloTarjeta(page, /^Total gastos adicionales/)).toBe('Total gastos adicionales');
    expect(await rotuloTarjeta(page, /^COSTE TOTAL/)).toBe('COSTE TOTAL DE ADQUISICIÓN');
    expect(await descripcionTarjeta(page, 'COSTE TOTAL')).toBe('Precio + todos los gastos (antes de deducir IVA si aplica)');

    const recuadro = await recuadroCcaa(page);
    expect(recuadro).toContain('ITP General 8%');
    expect(recuadro).toContain('AJD 1,2%');
    expect(recuadro).toContain('aplica escala progresiva (8% → 9% → 10%): cada tramo del valor tributa a su tipo');
  });

  /**
   * CASO 2 (LÍMITE) — Melilla, OBRA NUEVA, 7.000.000 €: cuatro cosas que faltan a la vez.
   *   IPSI de la operación: «No calculado» (TERRITORIOS_SIN_IVA.melilla).
   *   AJD = 7.000.000 × 0,5 % × 0,5 = 17.500,00 € → efectivo 0,25 %.
   *   Notaría: el arancel se corta en 6.010.121,04 € y lo que excede es de libre acuerdo.
   *   Notaría y registro sin IPSI (honorariosLlevanIVA('melilla') = false).
   *   Gestoría 500 → fijos 18.000 (total a mano 23.413,26 €, 0,33 %; coste 7.023.413,26 €).
   *   Gestoría «2.000.50»: ilegible, el coste BAJA 500 € → el aviso nombra la gestoría y dice
   *   «será mayor» (total a mano 22.913,26 €; coste 7.022.913,26 €).
   * La coma que falta antes de «ni» en ese aviso es el hallazgo [08/10-d], aparte.
   */
  test('CASO 2 (límite) — Melilla, obra nueva, 7.000.000 €: AJD bonificado 17.500,00 €, notaría de libre acuerdo y gestoría ilegible con su dirección', async ({ page }) => {
    expect(ITP_CCAA['melilla'].ajd).toBe(0.5);
    expect(BONIFICACION_CUOTA_CEUTA_MELILLA).toBe(0.5);
    expect(LIMITE_ARANCEL_NOTARIAL).toBe(6010121.04);

    await page.goto(RUTA);
    await esperarHidratacion(page, CAMPOS);
    await page.selectOption('#select-ccaa', 'melilla');
    await page.getByRole('button', { name: /Obra nueva/ }).click();
    await expect(page.getByRole('button', { name: /Obra nueva/ })).toHaveAttribute('aria-pressed', 'true');
    await sembrar(page, PRECIO, '7000000');
    await sembrar(page, GESTORIA, '500');

    expect(await rotuloTarjeta(page, /^IPSI$/)).toBe('IPSI');
    expect(await valorTarjeta(page, 'IPSI')).toBe('No calculado');
    expect(sinEspacioPct(await rotuloTarjeta(page, /^AJD/))).toBe('AJD (0,25%)');
    expect(await valorTarjeta(page, 'AJD (')).toBe('17.500,00 €');
    expect(await descripcionTarjeta(page, 'AJD (')).toBe('Con la bonificación del 50% de Ceuta y Melilla aplicada');
    expect(await rotuloTarjeta(page, /^Gastos de notaría/)).toBe('Gastos de notaría (sin IPSI)');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain('Arancel hasta 6.010.121,04 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain('libre acuerdo');
    expect(await rotuloTarjeta(page, /^Registro de la Propiedad/)).toBe('Registro de la Propiedad (sin IPSI)');
    const conDato = await cuadraElDesglose(page, 7000000, 17500 + 500);
    expect(await rotuloTarjeta(page, /^Total gastos adicionales/)).toBe('Total gastos adicionales (parcial)');
    expect(await rotuloTarjeta(page, /^COSTE TOTAL/)).toBe('COSTE TOTAL (PARCIAL)');
    expect(await descripcionTarjeta(page, 'COSTE TOTAL')).toBe(
      'No incluye el IPSI ni la parte de la notaría de libre acuerdo: el coste real puede ser mayor',
    );
    await expect(page.locator('[class*="avisoHonorarios"]')).toContainText('llevan además IPSI');

    // La gestoría ilegible: se nombra, sale del total y la dirección es la medida.
    await sembrar(page, GESTORIA, '2.000.50');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('Sin leer');
    const sinDato = await cuadraElDesglose(page, 7000000, 17500);
    expect(conDato - sinDato).toBeCloseTo(500, 2);
    const descTotal = sinEspacioPct(await descripcionTarjeta(page, 'Total gastos adicionales'));
    expect(descTotal).toContain(' — SIN el IPSI, que no está incluido');
    expect(descTotal).toContain(' — SIN la gestoría, que no se ha podido leer');
    expect(descTotal).toContain(' — SIN la parte de la notaría de libre acuerdo (el valor que excede de 6.010.121,04 €)');
    expect(descTotal.endsWith(sinHonorarios('IPSI'))).toBe(true);
    const descCoste = await descripcionTarjeta(page, 'COSTE TOTAL');
    expect(descCoste.startsWith('No incluye el IPSI ni la gestoría, que no se ha podido leer')).toBe(true);
    expect(descCoste).toContain('la parte de la notaría de libre acuerdo');
    expect(descCoste.endsWith(': el coste real será mayor')).toBe(true);
  });

  /**
   * CASO 3 (RECHAZO) — la renuncia elegida en Galicia no se cuela en Melilla, y un precio
   * ilegible no publica ninguna cifra.
   *   Galicia, renuncia pulsada. En Melilla el botón «renuncia al IPSI» se desactiva (el IPSI no
   *   la admite, Ley 8/1991 arts. 7 y 20.3; hallazgo 1584) y se calcula la segunda mano.
   *   Precio «250.000.00» → sin desglose y el marcador nombra lo escrito.
   *   Precio 250.000 → ITP = 250.000 × 6 % × 0,5 = 7500,00 € (3,00 %), sin AJD; gestoría 500
   *   → fijos 8000 (total a mano 8881,24 €, 3,55 %; coste 258.881,24 €), parcial solo por el IPSI
   *   de los fedatarios.
   *   De vuelta en Galicia, la elección reaparece: IVA 250.000 × 21 % = 52.500,00 € (ISP) y AJD
   *   250.000 × 1,5 % = 3750,00 € (tipo general: Galicia no tiene `ajdRenuncia`) → fijos 56.750.
   */
  test('CASO 3 (rechazo) — Melilla rechaza la renuncia elegida en Galicia y no publica cifra con «250.000.00»; con 250.000 €, ITP 7500,00 € (3,00 %)', async ({ page }) => {
    expect(ITP_CCAA['melilla'].tipoGeneral).toBe(6);
    expect(ITP_CCAA['galicia'].ajd).toBe(1.5);
    expect(ITP_CCAA['galicia'].ajdRenuncia).toBeUndefined();
    expect(IVA_INMUEBLES_2025.local).toBe(21);

    await page.goto(RUTA);
    await esperarHidratacion(page, CAMPOS);
    await page.selectOption('#select-ccaa', 'galicia');
    await page.getByRole('button', { name: /renuncia al IVA/ }).click();
    await expect(page.getByRole('button', { name: /renuncia al IVA/ })).toHaveAttribute('aria-pressed', 'true');

    await page.selectOption('#select-ccaa', 'melilla');
    const renunciaIpsi = page.getByRole('button', { name: /renuncia al IPSI/ });
    await expect(renunciaIpsi).toBeDisabled();
    await expect(renunciaIpsi).toHaveAttribute('aria-pressed', 'false');
    await expect(renunciaIpsi).toContainText('No existe en el IPSI: paga ITP');
    await expect(page.getByRole('button', { name: /Segunda mano/ })).toHaveAttribute('aria-pressed', 'true');

    const marcador = page.locator('[class*="placeholder"] p');
    await sembrar(page, PRECIO, '250.000.00');
    await expect(page.locator('h3', { hasText: /^COSTE TOTAL/ })).toHaveCount(0);
    await expect(marcador).toContainText('No se ha podido leer el precio «250.000.00»');

    await sembrar(page, PRECIO, '250000');
    expect(sinEspacioPct(await rotuloTarjeta(page, /^ITP \(/))).toBe('ITP (3,00%)');
    expect(await valorTarjeta(page, 'ITP (')).toBe('7500,00 €');
    expect(await descripcionTarjeta(page, 'ITP (')).toBe(
      'Tipo general con la bonificación del 50% de la cuota ya aplicada (art. 57 bis TRLITPAJD)',
    );
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);
    await expect(page.locator('[class*="resultados"] h3', { hasText: /^(IVA|IPSI)/ })).toHaveCount(0);
    await cuadraElDesglose(page, 250000, 7500 + 500);
    expect(await rotuloTarjeta(page, /^COSTE TOTAL/)).toBe('COSTE TOTAL (PARCIAL)');
    expect(await descripcionTarjeta(page, 'COSTE TOTAL')).toBe(SOLO_HONORARIOS('IPSI'));

    // De vuelta en Galicia, la elección del usuario sigue ahí.
    await page.selectOption('#select-ccaa', 'galicia');
    await expect(page.getByRole('button', { name: /renuncia al IVA/ })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('h3', { hasText: /^ITP/ })).toHaveCount(0);
    expect(await valorTarjeta(page, 'IVA (')).toBe('52.500,00 €');
    expect(sinEspacioPct(await rotuloTarjeta(page, /^AJD/))).toBe('AJD (1,50%)');
    expect(await valorTarjeta(page, 'AJD (')).toBe('3750,00 €');
    await cuadraElDesglose(page, 250000, 52500 + 3750 + 500);
  });

  /**
   * 99e1ee7e: la página pinta `<RelatedApps />` sin prop y el layout monta `<ConRelacionadas
   * slug>`. Las cuatro primeras de `data/app-relations.ts` para esta app tienen que salir en el
   * HTML servido y seguir ahí tras hidratar, sin errores en la consola.
   */
  test('relacionadas (99e1ee7e) — las cuatro tarjetas en el HTML servido y tras hidratar, sin errores de hidratación', async ({ page }) => {
    const esperadas = [
      '/simulador-gastos-compraventa-local-comercial/',
      '/estimador-compraventa-inmueble/',
      '/simulador-gastos-compraventa-garaje/',
      '/simulador-gastos-compraventa-trastero/',
    ];
    const marca = '#from=related-simulador-gastos-compraventa-nave-industrial';

    const servido = await (await page.request.get(RUTA)).text();
    expect(servido).toContain('Apps relacionadas');
    const enServido = [...servido.matchAll(/href="(\/[a-z0-9-]+\/)#from=related-simulador-gastos-compraventa-nave-industrial"/g)].map((m) => m[1]);
    expect([...new Set(enServido)]).toEqual(esperadas);

    const errores: string[] = [];
    page.on('pageerror', (e) => errores.push(e.message));
    page.on('console', (m) => {
      if (m.type() === 'error') errores.push(m.text());
    });
    await page.goto(RUTA);
    await esperarHidratacion(page, CAMPOS);
    const tras = await page
      .locator(`a[href$="${marca}"]`)
      .evaluateAll((as) => as.map((a) => (a.getAttribute('href') ?? '').split('#')[0]));
    expect(tras).toEqual(esperadas);
    expect(errores).toEqual([]);
  });

  // ─── Hallazgos de la inspección del 08/10/2026 (3084-3088): se escribieron con `test.fail()` y
  //     quedaron REPARADOS ese mismo día; hoy son regresión, sin marca ───

  /**
   * [08/10-a] (contenido, bajo) — ✅ REPARADO el 08/10/2026 (3084, `nombreEnFrase` y `deNombreCcaa`). `ITP_CCAA[x].nombre` es el nombre oficial con su sustantivo
   * («Ciudad Autónoma de Melilla», «Comunidad Valenciana»), y esta app lo encaja en frases propias
   * de su page.tsx y su metadata.ts sin artículo. No es el componente común AvisoTerritorioSinIva,
   * que esta app no usa: los textos son suyos (líneas 436-441, 524, 665, 690-693, 751, 571 y 779 de
   * page.tsx, y la 6.ª respuesta del FAQPage).
   */
  test('[08/10-a] los nombres oficiales llevan artículo: «en la Ciudad Autónoma de Melilla», «en la Comunidad Valenciana»', async ({ page }) => {
    const sinArticulo = /\b(?:[Ee]n|de) (?:Ciudad Autónoma de (?:Ceuta|Melilla)|Comunidad Valenciana)/g;
    const textos = async () => {
      const notas = await page.locator('[role="note"]').allInnerTexts();
      const herramienta = await page.locator('[class*="mainContent"]').first().innerText();
      return [...notas, herramienta].join(' ').replace(/\s+/g, ' ');
    };

    await page.goto(RUTA);
    await esperarHidratacion(page, CAMPOS);
    await sembrar(page, PRECIO, '250000');
    const vistos: string[] = [];
    // Melilla en segunda mano (aviso de la renuncia) y en obra nueva (tarjeta del IPSI).
    await page.selectOption('#select-ccaa', 'melilla');
    vistos.push(...((await textos()).match(sinArticulo) ?? []));
    await page.getByRole('button', { name: /Obra nueva/ }).click();
    vistos.push(...((await textos()).match(sinArticulo) ?? []));
    // Valencia con renuncia: el tipo propio del AJD se atribuye a la comunidad.
    await page.selectOption('#select-ccaa', 'valencia');
    await page.getByRole('button', { name: /renuncia al IVA/ }).click();
    vistos.push(...((await textos()).match(sinArticulo) ?? []));
    // FAQPage: «Los más bajos hoy son Ciudad Autónoma de Ceuta (…), …, Comunidad de Madrid (6 %)…»
    const sexta = (await faqPage(page)).find((f) => /ITP más bajo/.test(f.q))?.a ?? '';
    if (/\bson Ciudad Autónoma/.test(sexta)) vistos.push('FAQPage: «hoy son Ciudad Autónoma de Ceuta…»');
    expect(vistos).toEqual([]);
  });

  /**
   * [08/10-b] (contenido, bajo) — ✅ REPARADO el 08/10/2026 (3085): RESPUESTA_IMPUESTO_COMPRA en metadata.ts, que importan las dos bocas. Forma del 2968 de local-comercial: la pregunta del impuesto de la
   * compra tiene dos respuestas escritas aparte. Visible: «¿Se paga IVA o ITP al comprar una nave
   * industrial?» (page.tsx:1042-1062); FAQPage: «¿Qué impuesto paga la compra de una nave
   * industrial?» (metadata.ts). El FAQPage da los rangos del AJD y del ITP y la bonificación de
   * Ceuta y Melilla; la visible, que con la renuncia se paga AJD a un tipo que puede ser
   * incrementado (Valencia). Y el FAQPage coloca mal la salvedad: «No pueden coexistir IVA e ITP en
   * la misma operación, salvo que se renuncie…: entonces vuelve a haber IVA… y no se paga ITP».
   */
  test('[08/10-b] la pregunta del impuesto de la compra tiene UNA respuesta en la FAQ visible y en el FAQPage', async ({ page }) => {
    await page.goto(RUTA);
    const tema = /IVA o ITP|Qué impuesto (se )?paga/;
    const visible = (await faqVisible(page)).find((f) => tema.test(f.q));
    const ld = (await faqPage(page)).find((f) => tema.test(f.q));
    expect(visible, 'la FAQ visible tiene la pregunta').toBeDefined();
    expect(ld, 'el FAQPage tiene la pregunta').toBeDefined();
    expect(ld!.a).not.toMatch(/No pueden coexistir IVA e ITP en la misma operación, salvo/);
    expect(ld!.a).toBe(visible!.a);
  });

  /**
   * [08/10-c] (contenido, medio) — ✅ REPARADO el 08/10/2026 (3086): RESPUESTA_IVA_DEDUCIBLE en metadata.ts. La pregunta del IVA deducible tiene dos respuestas escritas
   * aparte, y la del FAQPage calla el aviso de la visible. Visible: «¿Es deducible el IVA en la
   * compra de una nave industrial?» → «…actividad económica sujeta y no exenta de IVA… Si la
   * actividad está exenta de IVA (ej. médico, educación), no es deducible.» FAQPage: «¿Puede una
   * empresa deducirse el IVA de la compra de una nave industrial?» → «Si… está sujeto a IVA, puede
   * deducirse…», sin la actividad exenta.
   */
  test('[08/10-c] la pregunta del IVA deducible tiene UNA respuesta en la FAQ visible y en el FAQPage', async ({ page }) => {
    await page.goto(RUTA);
    const tema = /deduc/i;
    const visible = (await faqVisible(page)).find((f) => tema.test(f.q));
    const ld = (await faqPage(page)).find((f) => tema.test(f.q));
    expect(visible, 'la FAQ visible tiene la pregunta').toBeDefined();
    expect(ld, 'el FAQPage tiene la pregunta').toBeDefined();
    expect(ld!.a).toMatch(/exenta/);
    expect(ld!.a).toBe(visible!.a);
  });

  /**
   * [08/10-d] (contenido, bajo) — ✅ REPARADO el 08/10/2026 (3087). Forma del 2958 de la referencia: el aviso del coste total une las
   * ausencias con `.join(' ni ')` (page.tsx:873-879) y el inciso «que no se ha podido leer» no se
   * cierra con coma antes del «ni» siguiente. Madrid, segunda mano, 7.000.000 €, gestoría
   * «2.000.50»: esperado «No incluye la gestoría, que no se ha podido leer, ni la parte de la
   * notaría de libre acuerdo: el coste real será mayor».
   */
  test('[08/10-d] el inciso de la gestoría ilegible se cierra con coma antes de «ni»', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, CAMPOS);
    await sembrar(page, PRECIO, '7000000');
    await sembrar(page, GESTORIA, '2.000.50');
    const desc = await descripcionTarjeta(page, 'COSTE TOTAL');
    expect(desc).toContain('la gestoría, que no se ha podido leer');
    expect(desc).toContain('la parte de la notaría de libre acuerdo');
    expect(desc).toContain('el coste real será mayor');
    expect(desc).not.toMatch(/que no se ha podido leer ni /);
  });

  /**
   * [08/10-e] (dato, bajo) — ✅ REPARADO el 08/10/2026 (3088): importada de data/itp-ccaa.ts. Dónde NO existe la renuncia a la exención es un dato normativo (Ley
   * 8/1991 del IPSI, arts. 7 y 20.3, leída en el BOE el 24/09/2026), y vive tecleado en esta
   * página como `TERRITORIOS_SIN_RENUNCIA = ['ceuta', 'melilla']`, igual que en local-comercial y
   * terreno-rustico (tres copias), mientras su gemelo `TERRITORIOS_SIN_IVA` vive en
   * `data/itp-ccaa.ts`. La regla de las apps Legal-Fiscal: nunca inline.
   */
  test('[08/10-e] la lista de territorios sin renuncia no se teclea en la página', async () => {
    const fuente = await leerFuente();
    expect(fuente).not.toMatch(/const\s+TERRITORIOS_SIN_RENUNCIA[^=]*=\s*\[/);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 13/10/2026 — hermana de la familia «Compraventa inmobiliaria» (referencia:
// estimador-compraventa-inmueble · testigo tests/familias/compraventa.spec.ts, 89/89 en verde al
// empezar la tanda). La cola la sacó INVALIDADA tras la rebaja del 5 % de los dos aranceles
// (11/10/2026, `REBAJA_ARANCEL_CUANTIA`) y el reparto del IBI (S0195, `ProrrateoIbiComunidad`).
//
// Cifras resueltas a mano ANTES de abrir el navegador, con un script propio que NO importa la app
// (los tramos copiados del BOE tal como los transcribe data/itp-ccaa.ts):
//  - Extremadura: `ITP_CCAA.extremadura.tramosProgresivos` 8 % hasta 360.000, 10 % hasta 600.000 y
//    11 % el resto; `ajd: 1.5`.
//  - Valencia: `umbralTipoUnico { superiorA: 1.000.000, tipo: 11 }`, `ajd: 1.4`, `ajdRenuncia: 2`
//    (Ley 13/1997, arts. 13.Uno y 14, verificado en el BOE el 24/09/2026).
//  - IVA de la nave: `IVA_INMUEBLES_2025.local = 21` (data/fiscal/inmuebles.ts).
//  - Notaría: escala del RD 1426/1989, nº 2.1 (`ARANCELES_NOTARIO`), solo hasta
//    `LIMITE_ARANCEL_NOTARIAL`; × (1 − `REBAJA_ARANCEL_CUANTIA`) (RDL 8/2010, DA 8.ª), × 1,21 de IVA
//    y × 1,5 / 1,75 / 2 (`FACTURA_NOTARIAL`).
//  - Registro: escala del RD 1427/1989, nº 2.1 (`ARANCELES_REGISTRO`), tope `REGISTRO_MAXIMO` y la
//    rebaja DESPUÉS del tope («del importe del arancel a percibir»); más presentación (6,010121 €) y
//    nota simple (3,005061 €), sin rebaja; × 1,21.
//  - Reparto del IBI: STS 409/2016, por días naturales; el vendedor hasta el día ANTERIOR a la
//    escritura (`lib/calculadoras/prorrateoCompraventa.ts`).
//
// A diferencia del 06/10 y el 08/10, aquí la notaría y el registro SÍ se fijan al céntimo: el motor
// aplica ya la rebaja y estos casos la miden. Comparar la cadena exacta vigila un defecto de 5,26 %
// (66 € en la notaría del caso 1) y uno de 5,34 € (la rebaja antes del tope, caso 2). Los casos
// anteriores que fijan esas cifras SIN rebaja son el cabo C0209 (destino reparar): no se tocan.
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * `VER_HUECOS=1` quitaba la marca de los hallazgos abiertos del 13/10 y enseñaba por qué fallaban.
 * Los cuatro se REPARARON el 19/10/2026 y ya no llevan marca; la constante queda sin uso.
 */
const I13_VER_HUECOS = Boolean(process.env.VER_HUECOS);

const BLOQUE_REPARTO = 'section[aria-labelledby="titulo-prorrateo"]';
const IBI = 'Cuota anual del IBI';
const COMUNIDAD = 'Cuota de comunidad';
const CAMPOS_REPARTO = [`input[aria-label="${IBI}"]`, `input[aria-label="${COMUNIDAD}"]`] as const;

/** Una fila de la tabla del reparto, con los espacios normalizados. */
async function filaReparto(page: Page, concepto: string): Promise<string> {
  return ((await page.locator(BLOQUE_REPARTO).locator('tbody tr', { hasText: concepto }).first().innerText()) ?? '')
    .replace(/\s+/g, ' ')
    .trim();
}

test.describe('Re-inspección 13/10/2026 — Extremadura en el tramo del 11 %, Valencia a 10.000.000 € con renuncia y el registro en su tope, y el reparto del IBI', () => {
  test.describe.configure({ timeout: 90_000 });

  /**
   * CASO 1 (NORMAL) — Extremadura, segunda mano sin renuncia, 820.000 €, gestoría 650 €. Llega al
   * tercer tramo de la escala, que ninguna vuelta anterior había cobrado con la rebaja del 11/10.
   *   ITP = 360.000 × 8 % + 240.000 × 10 % + 220.000 × 11 % = 28.800 + 24.000 + 24.200 = 77.000,00 €
   *   efectivo 77.000 / 820.000 = 9,3902 % → «ITP (9,39 %)»
   *   Notaría: arancel 90,151816 + 108,182205 + 45,0759 + 90,15182 + 225,379535 + 65,69637
   *            = 624,637646 € × 0,95 × 1,21 = 718,020974 € → ×1,5 = 1077,03 · ×1,75 = 1256,54 · ×2 = 1436,04
   *   Registro: 24,040484 + 42,0708575 + 37,56325 + 67,613865 + 135,227721 + 43,79758 = 350,3137575
   *            (bajo el tope) × 0,95 = 332,798070 + 9,015182 = 341,813252 × 1,21 = 413,59 €
   *   Total = 77.000,00 + 1256,54 + 413,59 + 650,00 = 79.320,13 € (9,6732 % → «9,67 %»)
   *   Coste = 899.320,13 €, definitivo (sin IGIC/IPSI, sin ilegibles y por debajo del límite notarial).
   */
  test('CASO 1 (normal) — Extremadura 820.000 €: ITP de escala 77.000,00 € (9,39 %), notaría 1256,54 € y registro 413,59 € con la rebaja del 5 %', async ({ page }) => {
    expect(ITP_CCAA['extremadura'].tramosProgresivos).toEqual([
      { hasta: 360000, tipo: 8 },
      { hasta: 600000, tipo: 10 },
      { hasta: Infinity, tipo: 11 },
    ]);
    expect(ITP_CCAA['extremadura'].ajd).toBe(1.5);
    expect(REBAJA_ARANCEL_CUANTIA).toBe(0.05);
    expect(FACTURA_NOTARIAL.factorMin).toBe(1.5);
    expect(FACTURA_NOTARIAL.factorMax).toBe(2);

    await page.goto(RUTA);
    await esperarHidratacion(page, CAMPOS);
    await page.selectOption('#select-ccaa', 'extremadura');
    await sembrar(page, PRECIO, '820000');
    await sembrar(page, GESTORIA, '650');

    await expect(page.getByRole('button', { name: /Segunda mano/ })).toHaveAttribute('aria-pressed', 'true');
    expect(sinEspacioPct(await rotuloTarjeta(page, /^ITP \(/))).toBe('ITP (9,39%)');
    expect(await valorTarjeta(page, 'ITP (')).toBe('77.000,00 €');
    expect(await descripcionTarjeta(page, 'ITP (')).toBe(
      'Tipo general — las naves no tienen los reducidos de vivienda, pero alguna comunidad sí tiene tipos ligados a la ACTIVIDAD',
    );
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);
    expect(await rotuloTarjeta(page, /^Gastos de notaría/)).toBe('Gastos de notaría (IVA incluido)');
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('1256,54 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain('Factura estimada entre 1077,03 € y 1436,04 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('413,59 €');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('650,00 €');
    expect(await rotuloTarjeta(page, /^Total gastos adicionales/)).toBe('Total gastos adicionales');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('79.320,13 €');
    expect(sinEspacioPct(await descripcionTarjeta(page, 'Total gastos adicionales'))).toBe('9,67% sobre el precio de compra');
    expect(await rotuloTarjeta(page, /^COSTE TOTAL/)).toBe('COSTE TOTAL DE ADQUISICIÓN');
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('899.320,13 €');
    expect(await descripcionTarjeta(page, 'COSTE TOTAL')).toBe('Precio + todos los gastos (antes de deducir IVA si aplica)');

    const recuadro = await recuadroCcaa(page);
    expect(recuadro).toContain('ITP General 8%');
    expect(recuadro).toContain('AJD 1,5%');
    expect(recuadro).toContain('aplica escala progresiva (8% → 10% → 11%): cada tramo del valor tributa a su tipo');
  });

  /**
   * CASO 2 (LÍMITE) — Comunitat Valenciana, 2.ª mano CON RENUNCIA, 10.000.000 €, gestoría 800 €.
   * Tres límites a la vez: el umbral del ITP (rotulado, no cobrado), la notaría por encima de
   * 6.010.121,04 € (libre acuerdo) y el arancel registral por encima de su tope.
   *   IVA (ISP) = 10.000.000 × 21 % = 2.100.000,00 € · AJD de la renuncia = 10.000.000 × 2 % = 200.000,00 €
   *   Notaría: arancel hasta 6.010.121,04 € = 558,941276 + 5.409.108,94 × 0,03 % = 2181,673958 €
   *            × 0,95 × 1,21 = 2507,834215 → ×1,5 = 3761,75 · ×1,75 = 4388,71 · ×2 = 5015,67
   *   Registro: escala = 2186,3137575 > tope 2181,673939 → 2181,673939 × 0,95 = 2072,590242
   *            + 9,015182 = 2081,605424 × 1,21 = 2518,74 € (con la rebaja ANTES del tope saldría
   *            2524,08 €; sin rebaja, 2650,73 €)
   *   Total = 2.100.000 + 200.000 + 4388,71 + 2518,74 + 800 = 2.307.707,45 € (23,0771 % → «23,08 %»),
   *   PARCIAL por la notaría de libre acuerdo · coste 12.307.707,45 €.
   *   Obra nueva al mismo precio: AJD general 1,4 % = 140.000,00 € → total 2.247.707,45 €.
   *   Gestoría «2.000.50» con la renuncia: el total BAJA 800 € (2.306.907,45 €) → «será mayor».
   */
  test('CASO 2 (límite) — Valencia 10.000.000 € con renuncia: IVA ISP 2.100.000 €, AJD 2 %, notaría de libre acuerdo y registro en su tope 2518,74 €', async ({ page }) => {
    const val = ITP_CCAA['valencia'];
    expect(val.umbralTipoUnico).toEqual({ superiorA: 1_000_000, tipo: 11 });
    expect(val.ajd).toBe(1.4);
    expect(val.ajdRenuncia).toBe(2);
    expect(IVA_INMUEBLES_2025.local).toBe(21);
    expect(LIMITE_ARANCEL_NOTARIAL).toBe(6010121.04);
    expect(REGISTRO_MAXIMO).toBeCloseTo(2181.673939, 6);
    expect(REGISTRO_CONCEPTOS.presentacion + REGISTRO_CONCEPTOS.notaSimple).toBeCloseTo(9.015182, 6);

    await page.goto(RUTA);
    await esperarHidratacion(page, CAMPOS);
    await page.selectOption('#select-ccaa', 'valencia');
    await page.getByRole('button', { name: /renuncia al IVA/ }).click();
    await sembrar(page, PRECIO, '10000000');
    await sembrar(page, GESTORIA, '800');

    await expect(page.locator('h3', { hasText: /^ITP/ })).toHaveCount(0);
    expect(sinEspacioPct(await rotuloTarjeta(page, /^IVA/))).toBe('IVA (renuncia · ISP) (21,00%)');
    expect(await valorTarjeta(page, 'IVA (')).toBe('2.100.000,00 €');
    expect(await descripcionTarjeta(page, 'IVA (')).toBe(
      'Lo autoliquida el comprador por inversión del sujeto pasivo (no se paga al vendedor) y es deducible si tienes derecho',
    );
    expect(sinEspacioPct(await rotuloTarjeta(page, /^AJD/))).toBe('AJD (2,00%)');
    expect(await valorTarjeta(page, 'AJD (')).toBe('200.000,00 €');
    expect(await descripcionTarjeta(page, 'AJD (')).toBe('Tipo propio de la renuncia a la exención en la Comunidad Valenciana');
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('4388,71 €');
    const notaria = await descripcionTarjeta(page, 'Gastos de notaría');
    expect(notaria).toContain('Arancel hasta 6.010.121,04 €: factura estimada entre 3761,75 € y 5015,67 €');
    expect(notaria).toContain('libre acuerdo');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('2518,74 €');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('800,00 €');
    expect(await rotuloTarjeta(page, /^Total gastos adicionales/)).toBe('Total gastos adicionales (parcial)');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('2.307.707,45 €');
    expect(sinEspacioPct(await descripcionTarjeta(page, 'Total gastos adicionales'))).toBe(
      '23,08% sobre el precio de compra — SIN la parte de la notaría de libre acuerdo (el valor que excede de 6.010.121,04 €)',
    );
    expect(await rotuloTarjeta(page, /^COSTE TOTAL/)).toBe('COSTE TOTAL (PARCIAL)');
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('12.307.707,45 €');
    expect(await descripcionTarjeta(page, 'COSTE TOTAL')).toBe(
      'No incluye la parte de la notaría de libre acuerdo: el coste real puede ser mayor (precio + gastos antes de deducir el IVA si tienes derecho)',
    );
    const recuadro = await recuadroCcaa(page);
    expect(recuadro).toContain('ITP General 11%');
    expect(sinEspacioPct(await ajdDelRecuadro(page))).toBe('2%');

    // Obra nueva al mismo precio: el AJD general (1,4 %), no el de la renuncia.
    await page.getByRole('button', { name: /Obra nueva/ }).click();
    expect(sinEspacioPct(await rotuloTarjeta(page, /^IVA/))).toBe('IVA (21,00%)');
    expect(sinEspacioPct(await rotuloTarjeta(page, /^AJD/))).toBe('AJD (1,40%)');
    expect(await valorTarjeta(page, 'AJD (')).toBe('140.000,00 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('2518,74 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('2.247.707,45 €');
    expect(sinEspacioPct(await ajdDelRecuadro(page))).toBe('1,4%');

    // De vuelta a la renuncia, la gestoría ilegible: se nombra, sale del total y la dirección es la medida.
    await page.getByRole('button', { name: /renuncia al IVA/ }).click();
    const conDato = eurosDeTexto(await valorTarjeta(page, 'COSTE TOTAL'));
    await sembrar(page, GESTORIA, '2.000.50');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('Sin leer');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('2.306.907,45 €');
    const sinDato = eurosDeTexto(await valorTarjeta(page, 'COSTE TOTAL'));
    expect(conDato - sinDato).toBeCloseTo(800, 2);
    expect(await descripcionTarjeta(page, 'COSTE TOTAL')).toBe(
      'No incluye la gestoría, que no se ha podido leer, ni la parte de la notaría de libre acuerdo: el coste real será mayor (precio + gastos antes de deducir el IVA si tienes derecho)',
    );
  });

  /**
   * CASO 3 (RECHAZO) — el punto ciego del testigo: el reparto del IBI y la comunidad. El testigo de
   * familia solo mide «Cuota anual del IBI»; aquí, la «Cuota de comunidad» y la periodicidad.
   *   Escritura 13/10/2026, IBI 840 €, comunidad 120 € trimestral.
   *   IBI (año natural, 365 días): vendedor 285 días (01/01–12/10) → 840 × 285 / 365 = 655,890411;
   *   comprador 80 días → 184,109589 → «184,11 €».
   *   Comunidad (01/10–31/12, 92 días): vendedor 12 días → 120 × 12 / 92 = 15,652174; comprador 80
   *   días → 104,347826 → «104,35 €».
   *   Abona en la firma 184,109589 + 104,347826 = 288,457415 → «288,46 €» (cuadra con las líneas:
   *   184,11 + 104,35; el descuadre del 3239, abierto en la referencia, no salta con estos importes).
   *   Comunidad «2.000.50» → ILEGIBLE: se nombra y no se reparte nada (ni el IBI, que sí se lee).
   *   Comunidad vacía → solo el IBI: abona 184,11 €.
   *   Nada de esto mueve el coste de la compra (Madrid, 500.000 €, gestoría 500): el reparto es un
   *   ajuste entre las partes y no un gasto de la adquisición, así que aquí solo se exige que no cambie.
   */
  test('CASO 3 (rechazo) — reparto del IBI: la cuota de comunidad ilegible se nombra y no reparte nada; legible, 184,11 € + 104,35 € = 288,46 €', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, [...CAMPOS, ...CAMPOS_REPARTO]);
    await sembrar(page, PRECIO, '500000');
    await sembrar(page, GESTORIA, '500');
    const coste = await valorTarjeta(page, 'COSTE TOTAL');

    const bloque = page.locator(BLOQUE_REPARTO);
    const fecha = bloque.locator('input[type="date"]');
    await fecha.fill('2026-10-13');
    await esperarValorEnReact(page, fecha, '2026-10-13');
    await sembrar(page, IBI, '840');
    await sembrar(page, COMUNIDAD, '120');
    await bloque.locator('select').selectOption('trimestral');

    expect(await filaReparto(page, 'IBI del año')).toBe('IBI del año 01/01/2026 – 31/12/2026 655,89 € · 285 días 184,11 € · 80 días');
    expect(await filaReparto(page, 'Comunidad')).toBe(
      'Comunidad (cuota trimestral) 01/10/2026 – 31/12/2026 15,65 € · 12 días 104,35 € · 80 días',
    );
    await expect(bloque).toContainText('el comprador le abona en la firma 288,46 €');

    // La cuota de comunidad ilegible: se nombra y no se publica ningún reparto, tampoco el del IBI.
    await sembrar(page, COMUNIDAD, '2.000.50');
    await expect(bloque.getByRole('alert')).toHaveText(
      'No se entiende el importe de «Cuota de comunidad»: escríbelo como 450 o 450,80. Hasta corregirlo no se reparte nada, para no publicar una cifra calculada con un importe equivocado.',
    );
    await expect(bloque.locator('table')).toHaveCount(0);
    await expect(bloque).not.toContainText('abona');
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe(coste);

    // Vacía: no hay comunidad que repartir, y el IBI vuelve solo.
    await sembrar(page, COMUNIDAD, '');
    await expect(bloque.getByRole('alert')).toHaveCount(0);
    await expect(bloque.locator('tbody tr')).toHaveCount(1);
    await expect(bloque).toContainText('el comprador le abona en la firma 184,11 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe(coste);
  });

  // ─── Hallazgos de la re-inspección del 13/10/2026 (3263-3266): se escribieron con `test.fail()`
  //     y quedaron REPARADOS el 19/10/2026; hoy son regresión, sin marca ───

  /**
   * [13/10-a] (contenido, medio) — En Ceuta y Melilla el aviso de cabecera (`ivaAviso`, page.tsx
   * ~l. 440-448) dice del IPSI que «El impuesto soportado también puede ser deducible, pero con las
   * reglas del IPSI». La Ley 8/1991, art. 20.3 (BOE-A-1991-7645, consolidado, leído hoy): «Las
   * cuotas soportadas o satisfechas en relación con las entregas de bienes inmuebles […] no podrán
   * ser objeto de deducción». La propia app lo dice dos avisos más abajo en Ceuta y Melilla con
   * «Segunda mano» («no deja deducir el IPSI soportado en la compra de un inmueble (art. 20.3)»),
   * que es la reparación del 1584 (24/09); el aviso de cabecera es del 1177 (21/09) y no se
   * actualizó. En Canarias la frase vale (el IGIC sí se deduce). Local-comercial tiene el mismo
   * texto (page.tsx l. 1246), sin medir.
   */
  test('[13/10-a] en Ceuta y Melilla el aviso de cabecera no promete deducir el IPSI de la compra de la nave (Ley 8/1991, art. 20.3)', async ({ page }) => {
    // REPARADO el 19/10/2026 (hallazgo 3263): en Ceuta y Melilla el aviso dice que el IPSI de la
    // compra de un inmueble no se puede deducir (art. 20.3).
    await page.goto(RUTA);
    await esperarHidratacion(page, CAMPOS);
    await sembrar(page, PRECIO, '500000');
    const cabecera = page.locator('[class*="ivaAviso"]');
    const vistos: string[] = [];
    for (const [ccaa, regimen] of [
      ['ceuta', /Segunda mano/],
      ['melilla', /Obra nueva/],
    ] as const) {
      await page.selectOption('#select-ccaa', ccaa);
      await page.getByRole('button', { name: regimen }).click();
      const texto = (await cabecera.innerText()).replace(/\s+/g, ' ');
      expect(texto).toContain('IPSI');
      if (regimen.source === 'Segunda mano') {
        // La misma pantalla ya lo dice bien, con el artículo, en el aviso de la renuncia.
        await expect(page.locator('[class*="avisoRenuncia"]')).toContainText('no deja deducir el IPSI soportado en la compra de un inmueble (art. 20.3)');
      }
      if (/puede ser deducible/.test(texto)) vistos.push(`${ccaa} · ${regimen.source}: «${texto}»`);
    }
    expect(vistos).toEqual([]);
  });

  /**
   * [13/10-b] (contenido, medio) — cabo C0164, medido aquí. Art. 94.Uno.1.º.a) de la Ley 37/1992
   * (BOE-A-1992-28740, leído hoy): dan derecho a deducir «Las entregas de bienes y prestaciones de
   * servicios sujetas y no exentas del Impuesto sobre el Valor Añadido». La FAQ «¿Es deducible el
   * IVA…?», el consejo «Consulta el régimen de IVA» y las limitaciones lo dicen así («sujeta y no
   * exenta»; la FAQ añade «Si la actividad está exenta de IVA (por ejemplo, la sanitaria o la
   * educativa), no es deducible»). Cinco bocas condicionan la deducción a la actividad «sujeta» sin
   * «no exenta»: dos sin matiz —la tabla «IVA deducible: Sí (si actividad sujeta a IVA)» y el caso
   * de uso «Si la empresa está dada de alta en actividades sujetas a IVA, puede deducir el IVA»— y
   * tres matizadas que no por eso aciertan («puede ser deducible», «suele ser deducible»,
   * «Potencialmente deducible»): a una clínica o un colegio, sujetos y exentos, les dicen que puede.
   * Es la forma del hallazgo 3089 de solar (reparado el 08/10/2026).
   */
  test('[13/10-b] ningún texto condiciona la deducción del IVA a una actividad «sujeta» sin «no exenta» (art. 94.Uno.1.º.a LIVA)', async ({ page }) => {
    // REPARADO el 19/10/2026 (hallazgo 3264): las cinco bocas dicen «sujeta y no exenta».
    const limpio = (s: string | null) => (s ?? '').replace(/\s+/g, ' ').trim();
    await page.goto(RUTA);
    await esperarHidratacion(page, CAMPOS);
    await sembrar(page, PRECIO, '500000');

    // La regla bien dicha, en la propia página.
    const faq = (await faqVisible(page)).find((f) => /deducible el IVA/.test(f.q));
    expect(faq?.a).toContain('sujeta y no exenta');

    const textos: { donde: string; t: string }[] = [];
    textos.push({ donde: 'aviso de cabecera', t: limpio(await page.locator('[class*="ivaAviso"]').innerText()) });
    await page.getByRole('button', { name: /Obra nueva/ }).click();
    textos.push({ donde: 'tarjeta del IVA (obra nueva)', t: await descripcionTarjeta(page, 'IVA (') });
    await page.getByRole('button', { name: /renuncia al IVA/ }).click();
    textos.push({ donde: 'aviso de la renuncia', t: limpio(await page.locator('[class*="avisoRenuncia"]').innerText()) });
    textos.push({
      donde: 'tabla comparativa',
      t: limpio(await page.locator('tr', { hasText: 'IVA deducible' }).locator('td').nth(1).textContent()),
    });
    textos.push({
      donde: 'caso de uso «Empresa compra nave nueva al promotor»',
      t: limpio(
        await page
          .locator('strong', { hasText: 'Empresa compra nave nueva al promotor' })
          .locator('xpath=following-sibling::p[1]')
          .textContent(),
      ),
    });
    const sinExenta = textos.filter(({ t }) => /deduc/i.test(t) && /sujet[ao]/.test(t) && !/no exent[ao]/.test(t));
    expect(sinExenta.map(({ donde, t }) => `${donde}: «${t}»`)).toEqual([]);
  });

  /**
   * [13/10-c] (contenido, bajo) — residuo del hallazgo 1267 (23/09/2026) en el FAQPage, que solo
   * leen buscadores y asistentes de IA. «¿En qué se diferencia comprar una nave industrial de
   * comprar un local comercial?» responde «IVA 21 % en primera transmisión e ITP al tipo general en
   * segunda mano», sin las dos salvedades que la misma página da en RESPUESTA_IMPUESTO_COMPRA y que
   * la calculadora aplica: en Canarias, Ceuta y Melilla no hay IVA (la tarjeta dice «IGIC/IPSI · No
   * calculado») y, con la renuncia a la exención (la tercera opción), la segunda mano no paga ITP
   * sino IVA. Tampoco dice que en Ceuta y Melilla la cuota del ITP se paga a la mitad.
   */
  test('[13/10-c] el FAQPage «¿En qué se diferencia… de un local comercial?» no da por universales el IVA del 21 % y el ITP', async ({ page }) => {
    // REPARADO el 19/10/2026 (hallazgo 3265): la respuesta nombra el IGIC/IPSI y la renuncia.
    await page.goto(RUTA);
    const respuesta = (await faqPage(page)).find((f) => /local comercial/.test(f.q));
    expect(respuesta, 'el FAQPage tiene la pregunta').toBeDefined();
    const a = respuesta!.a;
    expect({
      nombraIgicOIpsi: /IGIC|IPSI/.test(a),
      nombraLaRenuncia: /renuncia/i.test(a),
    }).toEqual({ nombraIgicOIpsi: true, nombraLaRenuncia: true });
  });

  /**
   * [13/10-d] (contenido, bajo) — patrón 5 de la familia («no falta, no vale») en la FECHA del
   * reparto, que el 3240 (cuotas negativas, abierto en la referencia) no cubre. `leerFechaISO`
   * (lib/calculadoras/prorrateoCompraventa.ts) rechaza los años fuera de 1900-2200 y el bloque cae al
   * estado «sin fecha»: «Indica la fecha de la escritura para repartir los días.», con la fecha
   * escrita a la vista. Se llega tecleando el año en dos cifras: en Chromium, «13», «10», «26» deja
   * el campo en 13/10/0026 (valor «0026-10-13»; medido con el teclado el 13/10/2026). No reparte
   * nada, que es lo correcto; lo que falla es la frase. Vive en components/ProrrateoIbiComunidad, así
   * que alcanza a las siete apps.
   */
  test('[13/10-d] una fecha escrita con un año imposible (13/10/0026) no se pide como si faltara', async ({ page }) => {
    // REPARADO el 19/10/2026 (hallazgo 3266, components/ProrrateoIbiComunidad): dice que la fecha
    // no es válida en vez de pedirla.
    await page.goto(RUTA);
    await esperarHidratacion(page, CAMPOS_REPARTO);
    const bloque = page.locator(BLOQUE_REPARTO);
    await sembrar(page, IBI, '840');
    const fecha = bloque.locator('input[type="date"]');
    await fecha.fill('0026-10-13');
    await esperarValorEnReact(page, fecha, '0026-10-13');
    await expect(fecha).toHaveValue('0026-10-13');
    await expect(bloque).not.toContainText('abona');
    await expect(bloque.getByText('Indica la fecha de la escritura para repartir los días.')).toHaveCount(0);
    await expect(bloque.getByRole('alert')).toContainText('La fecha de la escritura no es válida');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// INSPECCIÓN 19/10/2026 — hermana de la familia «Compraventa inmobiliaria» (referencia:
// estimador-compraventa-inmueble · testigo tests/familias/compraventa.spec.ts, 93/93 en verde al
// empezar la tanda). La cola la sacó por los cabos C0314 (requisito de la renuncia, art. 20.Dos LIVA)
// y C0315 (apartado del art. 57 bis TRLITPAJD que bonifica el AJD).
//
// Cifras resueltas a mano ANTES de abrir el navegador, con un script propio que NO importa la app
// (.inspector-trabajo/nav-esperados.mjs, fuera del repositorio):
//  - La Rioja: `ITP_CCAA.rioja` tipo general 7 (de `TIPOS_ITP_CCAA_2025`, data/fiscal/inmuebles.ts),
//    sin escala ni umbral, `ajd: 1` y sin tipo propio de la renuncia.
//  - Aragón: `ITP_CCAA.aragon.tramosProgresivos` 8 % hasta 400.000, 8,5 % hasta 450.000, 9 % hasta
//    500.000, 9,5 % hasta 750.000 y 10 % el resto (art. 121-1 del DL 1/2005 de Aragón: la tabla oficial
//    da 64.500 € a los 750.000, que es la comprobación de la escala); `ajd: 1.5`.
//  - Canarias: `ajd: 0.75`; sin IVA en la operación ni en los honorarios (`TERRITORIOS_SIN_IVA`).
//  - IVA de la nave: `IVA_INMUEBLES_2025.local = 21`.
//  - Notaría: RD 1426/1989, nº 2.1 (`ARANCELES_NOTARIO`) × 0,95 (RDL 8/2010, DA 8.ª) × 1,21 donde hay
//    IVA, y × 1,5 / 1,75 / 2 (`FACTURA_NOTARIAL`). Registro: RD 1427/1989, nº 2.1 con tope y × 0,95,
//    más presentación (6,010121 €) y nota simple (3,005061 €), × 1,21 donde hay IVA.
// ═══════════════════════════════════════════════════════════════════════════════

/** `VER_HUECOS=1` quita la marca de los hallazgos abiertos del 19/10 y enseña por qué fallan. */
const I19_VER_HUECOS = Boolean(process.env.VER_HUECOS);

/** Las tarjetas de la gestoría que hay en el panel de resultados (0 si no se pinta). */
const tarjetasGestoria = (page: Page) => page.locator('[class*="resultados"] h3', { hasText: 'Gastos de gestoría' });

test.describe('Inspección 19/10/2026 — La Rioja con decimales, Aragón en el último tramo y la gestoría ilegible con la renuncia al IGIC', () => {
  test.describe.configure({ timeout: 90_000 });

  /**
   * CASO 1 (NORMAL) — La Rioja, 345.678,90 € y gestoría 475,50 €, escritos con coma decimal y punto de
   * millar en los dos campos.
   *   Segunda mano: ITP = 345.678,90 × 7 % = 24.197,523 → «24.197,52 €», «ITP (7,00 %)».
   *   Notaría: 90,151816 + 108,182205 + 45,0759 + 90,15182 + (345.678,90 − 150.253,03) × 0,05 %
   *            (= 97,712935) = 431,274676 × 0,95 × 1,21 = 495,750240 → ×1,5 = 743,63 · ×1,75 = 867,56
   *            · ×2 = 991,50.
   *   Registro: 24,040484 + 42,0708575 + 37,56325 + 67,613865 + 195.425,87 × 0,03 % (= 58,627761)
   *            = 229,916218 × 0,95 = 218,420407 + 9,015182 = 227,435589 × 1,21 = 275,20 €.
   *   Total = 24.197,52 + 867,56 + 275,20 + 475,50 = 25.815,78 € (7,4681 % → «7,47 %») · coste 371.494,68 €.
   *   Obra nueva: IVA 21 % = 72.592,569 → 72.592,57 € · AJD 1 % = 3456,789 → 3456,79 € · total
   *   72.592,57 + 3456,79 + 867,56 + 275,20 + 475,50 = 77.667,62 € (22,4681 % → «22,47 %») · coste 423.346,52 €.
   *   Renuncia: las mismas cifras (La Rioja no tiene `ajdRenuncia`: AJD general con el aviso).
   */
  test('CASO 1 (normal) — La Rioja 345.678,90 €: ITP 24.197,52 € (7 %), y en obra nueva o con renuncia IVA 72.592,57 € + AJD 3456,79 €', async ({ page }) => {
    const rioja = ITP_CCAA['rioja'];
    expect(rioja.tipoGeneral).toBe(7);
    expect(rioja.tramosProgresivos).toBeUndefined();
    expect(rioja.umbralTipoUnico).toBeUndefined();
    expect(rioja.ajd).toBe(1);
    expect(rioja.ajdRenuncia).toBeUndefined();
    expect(IVA_INMUEBLES_2025.local).toBe(21);

    await page.goto(RUTA);
    await esperarHidratacion(page, CAMPOS);
    await page.selectOption('#select-ccaa', 'rioja');
    await sembrar(page, PRECIO, '345.678,90');
    await sembrar(page, GESTORIA, '475,50');

    await expect(page.getByRole('button', { name: /Segunda mano/ })).toHaveAttribute('aria-pressed', 'true');
    expect(await valorTarjeta(page, 'Precio de la nave industrial')).toBe('345.678,90 €');
    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (7,00%)');
    expect(await valorTarjeta(page, 'ITP (')).toBe('24.197,52 €');
    await expect(page.locator('[class*="resultados"] h3', { hasText: /^AJD/ })).toHaveCount(0);
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('867,56 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain('Factura estimada entre 743,63 € y 991,50 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('275,20 €');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('475,50 €');
    expect(await rotuloTarjeta(page, /^Total gastos adicionales/)).toBe('Total gastos adicionales');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('25.815,78 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toBe('7,47% sobre el precio de compra');
    expect(await rotuloTarjeta(page, /^COSTE TOTAL/)).toBe('COSTE TOTAL DE ADQUISICIÓN');
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('371.494,68 €');
    expect(await descripcionTarjeta(page, 'COSTE TOTAL')).toBe('Precio + todos los gastos (antes de deducir IVA si aplica)');
    const recuadro = await recuadroCcaa(page);
    expect(recuadro).toContain('ITP General 7%');
    expect(recuadro).toContain('AJD 1%');
    expect(recuadro).toContain('IVA (obra nueva) 21%');

    // Obra nueva al mismo precio: IVA + AJD general, y el ITP fuera.
    await page.getByRole('button', { name: /Obra nueva/ }).click();
    await expect(page.locator('[class*="resultados"] h3', { hasText: /^ITP/ })).toHaveCount(0);
    expect(await rotuloTarjeta(page, /^IVA \(/)).toBe('IVA (21,00%)');
    expect(await valorTarjeta(page, 'IVA (')).toBe('72.592,57 €');
    expect(await rotuloTarjeta(page, /^AJD \(/)).toBe('AJD (1,00%)');
    expect(await valorTarjeta(page, 'AJD (')).toBe('3456,79 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('77.667,62 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toBe('22,47% sobre el precio de compra');
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('423.346,52 €');

    // Con la renuncia: las mismas cifras, el IVA como ISP y el AJD general con su aviso.
    await page.getByRole('button', { name: /renuncia al IVA/ }).click();
    expect(await rotuloTarjeta(page, /^IVA \(/)).toBe('IVA (renuncia · ISP) (21,00%)');
    expect(await valorTarjeta(page, 'IVA (')).toBe('72.592,57 €');
    expect(await valorTarjeta(page, 'AJD (')).toBe('3456,79 €');
    expect(await descripcionTarjeta(page, 'AJD (')).toBe('Tipo general de la comunidad: algunas aplican uno incrementado cuando hay renuncia');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('77.667,62 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('423.346,52 €');
  });

  /**
   * CASO 2 (LÍMITE) — Aragón, segunda mano, gestoría 0: el corte exacto del último tramo de la escala
   * (750.000 €) y el tramo más alto (1.100.000 €).
   *   750.000: ITP = 400.000 × 8 % + 50.000 × 8,5 % + 50.000 × 9 % + 250.000 × 9,5 % = 32.000 + 4250 +
   *            4500 + 23.750 = 64.500,00 € — la cifra de la tabla oficial del art. 121-1 — («ITP (8,60 %)»).
   *            Notaría: 558,941276 + 148.987,90 × 0,03 % = 603,637646 × 0,95 × 1,21 = 693,881474 →
   *            1040,82 / 1214,29 / 1387,76. Registro: 306,516178 + 148.987,90 × 0,02 % = 336,313758
   *            × 0,95 + 9,015182 = 328,513252 × 1,21 = 397,50 €. Total 64.500 + 1214,29 + 397,50 =
   *            66.111,79 € (8,8149 % → «8,81 %») · coste 816.111,79 €.
   *   1.100.000: ITP = 64.500 + 350.000 × 10 % = 99.500,00 € (9,0455 % → «ITP (9,05 %)»).
   *            Notaría: 558,941276 + 498.987,90 × 0,03 % = 708,637646 × 0,95 × 1,21 = 814,578974 →
   *            1221,87 / 1425,51 / 1629,16. Registro: 306,516178 + 498.987,90 × 0,02 % = 406,313758
   *            × 0,95 + 9,015182 = 395,013252 × 1,21 = 477,97 €. Total 99.500 + 1425,51 + 477,97 =
   *            101.403,48 € (9,2185 % → «9,22 %») · coste 1.201.403,48 €.
   *   Gestoría 0 o vacía: no se pinta su tarjeta y el cierre es DEFINITIVO (un 0 legible no falta).
   */
  test('CASO 2 (límite) — Aragón: 64.500,00 € en el corte de 750.000 € y 99.500,00 € (9,05 %) a 1.100.000 €, gestoría 0 sin tarjeta', async ({ page }) => {
    const ar = ITP_CCAA['aragon'];
    expect(ar.tramosProgresivos).toEqual([
      { hasta: 400000, tipo: 8 },
      { hasta: 450000, tipo: 8.5 },
      { hasta: 500000, tipo: 9 },
      { hasta: 750000, tipo: 9.5 },
      { hasta: Infinity, tipo: 10 },
    ]);
    expect(ar.ajd).toBe(1.5);

    await page.goto(RUTA);
    await esperarHidratacion(page, CAMPOS);
    await page.selectOption('#select-ccaa', 'aragon');
    await sembrar(page, GESTORIA, '0');
    await sembrar(page, PRECIO, '750000');

    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (8,60%)');
    expect(await valorTarjeta(page, 'ITP (')).toBe('64.500,00 €');
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('1214,29 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain('Factura estimada entre 1040,82 € y 1387,76 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('397,50 €');
    await expect(tarjetasGestoria(page)).toHaveCount(0);
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('66.111,79 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toBe('8,81% sobre el precio de compra');
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('816.111,79 €');

    await sembrar(page, PRECIO, '1100000');
    expect(await rotuloTarjeta(page, /^ITP \(/)).toBe('ITP (9,05%)');
    expect(await valorTarjeta(page, 'ITP (')).toBe('99.500,00 €');
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('1425,51 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain('Factura estimada entre 1221,87 € y 1629,16 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('477,97 €');
    await expect(tarjetasGestoria(page)).toHaveCount(0);
    expect(await rotuloTarjeta(page, /^Total gastos adicionales/)).toBe('Total gastos adicionales');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('101.403,48 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toBe('9,22% sobre el precio de compra');
    expect(await rotuloTarjeta(page, /^COSTE TOTAL/)).toBe('COSTE TOTAL DE ADQUISICIÓN');
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('1.201.403,48 €');
    const recuadro = await recuadroCcaa(page);
    expect(recuadro).toContain('ITP General 8%');
    expect(recuadro).toContain('AJD 1,5%');
    expect(recuadro).toContain('aplica escala progresiva (8% → 8,50% → 9% → 9,50% → 10%): cada tramo del valor tributa a su tipo');
    expect(recuadro).toContain('art. 121-11');

    // Vaciar la gestoría no cambia nada: vacía es «sin gestoría», no un dato ilegible.
    await sembrar(page, GESTORIA, '');
    await expect(tarjetasGestoria(page)).toHaveCount(0);
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('101.403,48 €');
    expect(await rotuloTarjeta(page, /^COSTE TOTAL/)).toBe('COSTE TOTAL DE ADQUISICIÓN');
  });

  /**
   * CASO 3 (RECHAZO) — Canarias, 2.ª mano con renuncia al IGIC, 880.000 €: la gestoría «1.200,5,0»
   * (dos comas decimales) no se puede leer. Tiene que nombrarse, salir del total y decir en qué
   * dirección falta, en una pantalla donde el total ya es parcial por el IGIC.
   *   IGIC sin cifra («No calculado»). AJD = 880.000 × 0,75 % = 6600,00 € («AJD (0,75 %)»).
   *   Notaría sin IVA: 558,941276 + 278.987,90 × 0,03 % = 642,637646 × 0,95 = 610,505764 → 915,76 /
   *   1068,39 / 1221,01. Registro sin IVA: 306,516178 + 278.987,90 × 0,02 % = 362,313758 × 0,95 +
   *   9,015182 = 353,21 €.
   *   Gestoría 1200: total 6600 + 1068,39 + 353,21 + 1200 = 9221,60 € (1,0479 % → «1,05 %») · coste
   *   889.221,60 €, «No incluye el IGIC: el coste real puede ser mayor».
   *   Gestoría «1.200,5,0»: «Sin leer», total 8021,60 € (0,9115 % → «0,91 %») · coste 888.021,60 €: baja
   *   exactamente 1200 € y el aviso pasa a «será mayor».
   */
  test('CASO 3 (rechazo) — Canarias con renuncia, 880.000 €: la gestoría «1.200,5,0» se nombra, sale del total (−1200 €) y el coste «será mayor»', async ({ page }) => {
    expect(ITP_CCAA['canarias'].ajd).toBe(0.75);

    await page.goto(RUTA);
    await esperarHidratacion(page, CAMPOS);
    await page.selectOption('#select-ccaa', 'canarias');
    await page.getByRole('button', { name: /renuncia al IGIC/ }).click();
    await expect(page.getByRole('button', { name: /renuncia al IGIC/ })).toHaveAttribute('aria-pressed', 'true');
    await sembrar(page, PRECIO, '880000');
    await sembrar(page, GESTORIA, '1200');

    expect(await rotuloTarjeta(page, /^IGIC/)).toBe('IGIC');
    expect(await valorTarjeta(page, 'IGIC')).toBe('No calculado');
    expect(await descripcionTarjeta(page, 'IGIC')).toBe(
      'En Canarias no rige el IVA: la renuncia a la exención del IGIC tributa por el IGIC, que este simulador no calcula',
    );
    expect(await rotuloTarjeta(page, /^AJD \(/)).toBe('AJD (0,75%)');
    expect(await valorTarjeta(page, 'AJD (')).toBe('6600,00 €');
    expect(await rotuloTarjeta(page, /^Gastos de notaría/)).toBe('Gastos de notaría (sin IGIC)');
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('1068,39 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain('Factura estimada entre 915,76 € y 1221,01 €');
    expect(await rotuloTarjeta(page, /^Registro de la Propiedad/)).toBe('Registro de la Propiedad (sin IGIC)');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('353,21 €');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('1200,00 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('9221,60 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toBe(
      '1,05% sobre el precio de compra — SIN el IGIC, que no está incluido — SIN el IGIC de las facturas de notaría y registro, que tampoco se calcula',
    );
    expect(await rotuloTarjeta(page, /^COSTE TOTAL/)).toBe('COSTE TOTAL (PARCIAL)');
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('889.221,60 €');
    expect(await descripcionTarjeta(page, 'COSTE TOTAL')).toBe('No incluye el IGIC: el coste real puede ser mayor');
    await expect(page.locator('[class*="avisoHonorarios"]')).toContainText(
      'Las facturas de notaría y registro llevan además IGIC, que esta herramienta no calcula',
    );
    const conDato = eurosDeTexto(await valorTarjeta(page, 'COSTE TOTAL'));

    // La gestoría ilegible: se nombra, sale del total y el aviso dice en qué dirección.
    await sembrar(page, GESTORIA, '1.200,5,0');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('Sin leer');
    expect(await descripcionTarjeta(page, 'Gastos de gestoría')).toBe(
      'El importe escrito no se ha podido leer, así que NO está incluido en el total. Escríbelo con coma decimal (300,50).',
    );
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('8021,60 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toBe(
      '0,91% sobre el precio de compra — SIN el IGIC, que no está incluido — SIN la gestoría, que no se ha podido leer — SIN el IGIC de las facturas de notaría y registro, que tampoco se calcula',
    );
    expect(await rotuloTarjeta(page, /^COSTE TOTAL/)).toBe('COSTE TOTAL (PARCIAL)');
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('888.021,60 €');
    expect(await descripcionTarjeta(page, 'COSTE TOTAL')).toBe(
      'No incluye el IGIC ni la gestoría, que no se ha podido leer: el coste real será mayor',
    );
    const sinDato = eurosDeTexto(await valorTarjeta(page, 'COSTE TOTAL'));
    // La dirección y el tamaño de lo que falta: exactamente la gestoría, al céntimo.
    expect(conDato - sinDato).toBeCloseTo(1200, 2);
  });

  // ─── Hallazgos de la inspección del 19/10/2026, con `test.fail()` salvo con VER_HUECOS=1 ───

  /**
   * [19/10-a] (contenido, medio) — cabo C0314. Art. 20.Dos de la Ley 37/1992 (BOE-A-1992-28740, leído
   * el 19/10/2026): «Las exenciones relativas a los números 20.º y 22.º del apartado anterior podrán
   * ser objeto de renuncia por el sujeto pasivo, en la forma y con los requisitos que se determinen
   * reglamentariamente, cuando el adquirente sea un sujeto pasivo que actúe en el ejercicio de sus
   * actividades empresariales o profesionales y se le atribuya el derecho a efectuar la deducción
   * total o parcial del Impuesto soportado al realizar la adquisición…». El derecho a deducir es del
   * ADQUIRENTE, y renuncia el sujeto pasivo de la entrega (quien vende). Cuatro textos se lo piden a
   * los dos («comprador y vendedor son empresarios con derecho a deducción», «entre empresarios con
   * derecho a deducción») y la FAQ del AJD hace renunciar a los dos («si el comprador y el vendedor
   * renuncian»). La 5.ª respuesta del FAQPage, reparada el 19/10 (3265), ya lo dice bien: «salvo que
   * el vendedor renuncie a la exención del IVA porque el comprador es un empresario con derecho a
   * deducirlo». El cálculo no exige nada a ninguno de los dos: la tercera opción es un botón.
   */
  test('[19/10-a] el derecho a deducir que exige la renuncia es del ADQUIRENTE, y renuncia quien vende (art. 20.Dos LIVA)', async ({ page }) => {
    // REPARADO el 20/10/2026 (hallazgo 3387). En Canarias el aviso ya no pone requisito a ninguna de
    // las partes («si se cumplen los requisitos de la ley»): el art. 50.Cinco de la Ley canaria 4/2012
    // no se pudo leer en el BOE consolidado en la sesión, y no se escribe un requisito sin cotejar.
    const limpio = (s: string | null) => (s ?? '').replace(/\s+/g, ' ').trim();
    await page.goto(RUTA);
    await esperarHidratacion(page, CAMPOS);
    await sembrar(page, PRECIO, '500000');

    // La regla bien dicha, en la propia página (FAQPage, «¿En qué se diferencia… de un local comercial?»).
    const local = (await faqPage(page)).find((f) => /local comercial/.test(f.q));
    expect(local?.a).toContain('salvo que el vendedor renuncie a la exención del IVA porque el comprador es un empresario con derecho a deducirlo');

    const textos: { donde: string; t: string }[] = [];
    for (const f of await faqVisible(page)) {
      if (/IVA o ITP|AJD/.test(f.q)) textos.push({ donde: `FAQ visible «${f.q}»`, t: f.a });
    }
    for (const f of await faqPage(page)) {
      if (/IVA o ITP/.test(f.q)) textos.push({ donde: `FAQPage «${f.q}»`, t: f.a });
    }
    for (const ccaa of ['madrid', 'canarias'] as const) {
      await page.selectOption('#select-ccaa', ccaa);
      await page.getByRole('button', { name: /Segunda mano/ }).click();
      textos.push({ donde: `aviso de «Segunda mano» (${ccaa})`, t: limpio(await page.locator('[class*="avisoRenuncia"]').first().innerText()) });
    }
    textos.push({
      donde: 'consejo «Consulta el régimen de IVA antes de comprar»',
      t: limpio(await page.locator('strong', { hasText: 'Consulta el régimen de IVA antes de comprar' }).first().locator('xpath=..').textContent()),
    });
    expect(textos.length).toBe(6);

    const aLosDos = /comprador y vendedor son empresarios con derecho a deducción|entre empresarios con derecho a deducción|el comprador y el vendedor renuncian/i;
    expect(textos.filter(({ t }) => aLosDos.test(t)).map(({ donde, t }) => `${donde}: «${t.match(aLosDos)![0]}»`)).toEqual([]);
  });

  /**
   * [19/10-b] (contenido, bajo) — regresión de bd3f3e2a (08/10/2026, reparación del 3084). La nota del
   * recuadro en Canarias, Ceuta y Melilla terminaba en «…en la administración tributaria» y la línea
   * siguiente era el texto «de {nombre}»; al cambiar ese texto por la expresión `{deNombreCcaa(ccaa)}`,
   * JSX se come el salto de línea entre texto y expresión, y se lee «consúltalo en la administración
   * tributariade Canarias» (y «tributariade la Ciudad Autónoma de Ceuta/Melilla»). El aviso de cabecera
   * de las mismas comunidades, con la expresión en la misma línea, sí dice «tributaria de Canarias».
   */
  test('[19/10-b] la nota del recuadro en Canarias, Ceuta y Melilla dice «administración tributaria de …», con su espacio', async ({ page }) => {
    // REPARADO el 20/10/2026 (hallazgo 3388): «tributaria» y la expresión, en la misma línea.
    await page.goto(RUTA);
    await esperarHidratacion(page, CAMPOS);
    const vistos: string[] = [];
    for (const [ccaa, de] of [
      ['canarias', 'de Canarias'],
      ['ceuta', 'de la Ciudad Autónoma de Ceuta'],
      ['melilla', 'de la Ciudad Autónoma de Melilla'],
    ] as const) {
      await page.selectOption('#select-ccaa', ccaa);
      const nota = ((await page.locator('[class*="infoCcaaNote"]', { hasText: 'no se aplica el IVA' }).first().textContent()) ?? '').replace(/\s+/g, ' ');
      // En Canarias el aviso de cabecera de la misma pantalla ya lo escribe bien (en Ceuta y Melilla
      // ese aviso no remite a la administración: dice que el IPSI de la compra no se deduce).
      if (ccaa === 'canarias') {
        expect((await page.locator('[class*="ivaAviso"]').innerText()).replace(/\s+/g, ' ')).toContain(`administración tributaria ${de}`);
      }
      if (!nota.includes(`administración tributaria ${de}.`)) vistos.push(`${ccaa}: «…${nota.slice(nota.indexOf('consúltalo'))}»`);
    }
    expect(vistos).toEqual([]);
  });

  /**
   * [19/10-c] (contenido, bajo) — forma del hallazgo 1268 (el consejo «Consulta el régimen de IVA»,
   * reparado el 23/09) en otra tarjeta. El caso de uso «Autónomo compra nave de segunda mano» dice
   * «Paga ITP al tipo general de su CCAA — salvo en Ceuta y Melilla […] y en las comunidades con un
   * tipo reducido para el inmueble con el que se inicia una actividad, como Aragón», y enumera las
   * salvedades sin la que la propia página llama habitual para su público: la renuncia a la exención
   * cuando el vendedor es empresario (art. 20.Dos LIVA), que la app calcula en su tercera opción y con
   * la que no se paga ITP sino IVA autoliquidado y deducible.
   */
  test('[19/10-c] el caso de uso «Autónomo compra nave de segunda mano» nombra la renuncia a la exención', async ({ page }) => {
    // REPARADO el 20/10/2026 (hallazgo 3389), con el requisito del 3387: el derecho a deducir es del autónomo.
    await page.goto(RUTA);
    const tarjeta = (
      (await page.locator('strong', { hasText: 'Autónomo compra nave de segunda mano' }).first().locator('xpath=following-sibling::p[1]').textContent()) ?? ''
    ).replace(/\s+/g, ' ');
    expect(tarjeta).toContain('Paga ITP al tipo general de su CCAA');
    expect(tarjeta).toMatch(/renuncia/);
    expect(tarjeta).toContain('el autónomo tiene derecho a deducir el IVA (art. 20.Dos LIVA');
  });
});
