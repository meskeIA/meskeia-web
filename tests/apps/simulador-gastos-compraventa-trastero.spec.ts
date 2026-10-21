/**
 * Inspector — simulador-gastos-compraventa-trastero (segmento FISCAL, riesgo 1 CRÍTICO)
 *
 * Primera inspección: 20/08/2026, posterior a la reparación de la factura notarial y del
 * arancel registral (commit 44a5dc7d). App hermana de simulador-gastos-compraventa-garaje:
 * comparten los motores de notaría y registro, y se han vuelto a verificar aquí desde cero.
 *
 * RE-INSPECCIÓN 27/08/2026 (la cola la reabrió porque `data/fiscal` cambió después de la
 * reparación del 21/08). Y RE-INSPECCIÓN DE CIERRE 28/08/2026, que verifica esa reparación y
 * añade las partes 5 a 7. El fichero tiene siete partes:
 *   1. CASOS 1-3 — los de la primera inspección, intactos y en verde.
 *   2. REGRESIONES — los 9 hallazgos del 20/08, reparados el 21/08 y hoy reproducidos uno a
 *      uno: los 9 siguen cerrados en lo que estas aserciones afirman.
 *   3. CASOS 4-7 (MITAD B, 27/08) — zonas que ninguna inspección anterior tocó: la plusvalía
 *      municipal del vendedor con sus dos métodos, la venta con pérdida y no sujeción, la
 *      bonificación de Ceuta y la escala progresiva catalana en un tramo alto de verdad, y
 *      el rechazo de una cifra malformada.
 *   4. REGRESIÓN 27/08 — los seis hallazgos de la re-inspección, reparados ese mismo día.
 *      Estaban escritos con `test.fail()` afirmando lo que DEBERÍA pasar; al repararlos se
 *      les quitó la marca y ahora sujetan la reparación.
 *   5. MITAD A (28/08) — el cierre de esa reparación por sus dos caras: en Canarias la obra
 *      nueva NO liquida IVA (IGIC sin cifra, total parcial) y la segunda mano SÍ liquida ITP
 *      al 6,5 %, que es donde una reparación así se pasa de largo.
 *   6. CASOS 8-9 (MITAD B, 28/08) — el método REAL de la plusvalía ganando al objetivo por la
 *      proporción catastral, y el tope del coeficiente del IIVTNU a los 20 años.
 *   7. HALLAZGOS 28/08 — cuatro, que nacieron con `test.fail()` y UNA sola aserción de fondo
 *      cada uno. Tres eran reparaciones que llegaron a las apps hermanas y no a esta. Reparados el
 *      30/08 (commit 0828da3e) y hoy convertidos en regresión.
 *   8. RE-INSPECCIÓN 30/08 — la cola invalidó lo anterior tras esa reparación. CASOS 11-13,
 *      en territorio y precio que ninguna ronda había usado (Murcia 40.000 € y Melilla
 *      30.000 €), que además vuelven a cerrar de cero los cinco defectos de la tanda 2. Al
 *      final, UN hallazgo que nació con `test.fail()` y hoy está REPARADO.
 *   9. RE-INSPECCIÓN 02/09/2026 — CASOS 14-16, otra vez en territorio virgen: el País Vasco
 *      con un perfil de comprador que ninguna ronda había elegido, la escala de Baleares en
 *      su tramo MÁS ALTO (el 13 %, el techo de toda la tabla) y la plusvalía municipal a la
 *      que le falta UN solo dato. Al final, UN hallazgo que nació con `test.fail()` y hoy
 *      está REPARADO.
 *  10. RE-INSPECCIÓN 07/09/2026 — CASOS 17-19, posterior a la reparación del clúster de
 *      compraventa (commit 0dba12c9) y a la del recargo del art. 27.2 LGT (13d2181b).
 *      Territorio y perfil nuevos otra vez: Cantabria con familia numerosa, la FRONTERA
 *      exacta de la escala de Aragón (400.000 €, donde un `<` en vez de `<=` se lleva el
 *      segundo tramo por delante) y unos años de propiedad NEGATIVOS. Al final, los CINCO
 *      hallazgos de esa ronda (637-641), REPARADOS el 09/09/2026: se les quitó el
 *      `test.fail()` y hoy quedan como REGRESIÓN de la reparación.
 *  11. RE-INSPECCIÓN 10/09/2026 — CASOS 20-22, posterior al refactor de motores
 *      (commits 3a507acb y 1808419c). Comunidad y precio nuevos otra vez (Comunidad
 *      Valenciana, 24.000 €, con el tipo general del 9 % vigente desde el 01/06/2026), la
 *      REVENTA ANTES DEL AÑO —el coeficiente 0,14 de `COEFICIENTES_IIVTNU_2025`, que esta
 *      app no podía alcanzar— y un precio de compra malformado. Al final, UN hallazgo (682)
 *      que nació con `test.fail()` y se REPARÓ ese mismo día (bc437470).
 *
 *  12. RE-INSPECCIÓN 11/09/2026 — CASOS 23-25, posterior a la reparación de la reventa
 *      antes del año (bc437470) y al triaje fiscal que reescribió la escala de Aragón
 *      (7a02470c). Territorio y perfil nuevos otra vez —Castilla y León con perfil joven,
 *      la comunidad del reducido del 0,01 %—, el TERCER escalón de la escala aragonesa
 *      (500.000 € → 40.750 €) y unos años de propiedad MALFORMADOS, que es el camino que
 *      la reparación del 10/09 estrenó. Al final, CUATRO hallazgos que nacieron con
 *      `test.fail()` y hoy están REPARADOS: tres eran EFECTO FAMILIA del commit bc437470 —las
 *      correcciones 670 y 671 se aplicaron en la hermana garaje y la 683 en nave-industrial,
 *      y ninguna llegó aquí— y el cuarto, una divergencia entre las dos tablas de ITP.
 *
 *  13. RE-INSPECCIÓN 12/09/2026 — CASOS 26-28, posterior a los tres commits del 11/09 que
 *      movieron sus datos (7a02470c, e947fa55 y 21a13c6b; el último tocó de esta app solo
 *      el CSS y este fichero, no su `page.tsx`). Territorio y tramo nuevos otra vez: La
 *      Rioja con familia numerosa —comunidad SIN escala progresiva, el caso simétrico— y el
 *      QUINTO tramo de la escala aragonesa (1.000.000 € → 89.500 €), el único escalón del
 *      art. 121-1 al que ningún caso llegaba. El tercero rechaza una COMISIÓN malformada,
 *      que era el último campo del vendedor sin caso de basura. Al final, TRES hallazgos
 *      (713, 773 y 774) que nacieron con `test.fail()` y se REPARARON el 13/09. Estos casos
 *      siembran con `_hidratacion.ts`.
 *
 *  14. RE-INSPECCIÓN 14/09/2026 — CASOS 29-31, posterior a la reparación de esos tres
 *      (713 el plazo del ITP, 773 la comisión ilegible y 774 la FAQ duplicada a mano),
 *      que hoy quedan como regresión. Comunidad y perfil nuevos —Extremadura, la última
 *      con escala progresiva sin usar, con perfil DISCAPACIDAD— y las dos zonas que
 *      nueve rondas no habían tocado: qué hace un dato imposible al SALIR del campo
 *      (todos los casos anteriores lo probaban con el foco puesto) y qué rotula la app
 *      cuando la ganancia patrimonial es EXACTAMENTE 0. Al final, TRES hallazgos que
 *      nacieron con `test.fail()` y se REPARARON el 15/09.
 *
 *  15. RE-INSPECCIÓN 21/09/2026 — CASOS 32-34, posterior a la reparación de esos tres
 *      (822/844 el blur que convertía un año imposible en la reventa antes del año,
 *      823/845 la ganancia cero rotulada como pérdida compensable y 846 el segundo
 *      FAQPage), que hoy quedan como regresión verificada. Comunidad nueva —Asturias, la
 *      última con escala progresiva sin usar— y las dos zonas que la reparación del 15/09
 *      deja expuestas: el 0 LEGÍTIMO en los años de propiedad (la reventa dentro del
 *      mismo año, que la guarda del negativo NO puede bloquear) y el par catastral
 *      IMPOSIBLE, el único campo del vendedor sin caso de rechazo. Al final, DOS
 *      hallazgos (1157 y 1158) que nacieron con `test.fail()` y hoy están REPARADOS.
 *
 *  16. INSPECCIÓN 24/09/2026 y REPARACIÓN del mismo día — los hallazgos 1559-1569, sin
 *      `test.fail()`. Dos cambian cifras de todo el fichero: los coeficientes del IIVTNU son
 *      los del art. 107.4 TRLRHL en la redacción del RDL 8/2023 (1559; p. ej. 5 años 0,18
 *      y no 0,17), y la reventa antes del año prorratea el 0,15 por meses completos, que la
 *      app pregunta (1560). Y con el motor del 24/09 el trastero SUELTO no es vivienda: en el
 *      País Vasco paga el ITP del 7 % y el AJD del 0,5 % (no el 4 % ni el 0 de la vivienda).
 *      Cada caso afectado dice su cifra anterior junto a la nueva.
 *
 *      ⚠️ El CASO 16 (02/09) se REESCRIBIÓ ese día. Verificaba el rechazo escribiendo un
 *      «0» en los años de propiedad y daba por buena la reescritura del `min={1}` a «1»:
 *      eso era cierto cuando se escribió, y desde la reparación del motor del 07/09
 *      (hallazgo 666, `calcularPlusvaliaMunicipal` acota en 0 y no en 1) ya no lo es. Un
 *      test de regresión que fija el contrato anterior impide ver la reparación pendiente,
 *      así que el mismo rechazo se comprueba ahora con el campo VACÍO —que es el dato que
 *      de verdad falta— y el 0 pasó a ser el caso de la parte 11 (hallazgo 682, reparado el
 *      10/09 en bc437470).
 *
 *  17. RE-INSPECCIÓN 26/09/2026 — CASOS 41-46 y los hallazgos 2193-2197, reparados ese día
 *      (fa0772c0), más el caso del hallazgo 2209 (7d5c1876).
 *
 *  18. RE-INSPECCIÓN 06/10/2026 — verifica en navegador fa0772c0, 7d5c1876 y 242fffcd (notaría
 *      y registro sin IVA donde rige IGIC o IPSI). CASOS 47-50 al final del fichero: Baleares
 *      con familia numerosa y un vendedor completo, Navarra en obra nueva con las dos
 *      modalidades y Ceuta, la notaría de libre acuerdo (> 6.010.121,04 €), el invariante de
 *      la familia con los MESES del prorrateo (el selector que el testigo no ve) y el % con
 *      espacio duro en lo que llega de data/ para las 19 comunidades. Y cuatro hallazgos
 *      (2907-2910) que nacieron con `test.fail()` y se REPARARON ese mismo día, al final: el
 *      plazo de 30 días hábiles atribuido también al IVA, el espacio que faltaba tras el aviso
 *      del plazo, y dos medidos aquí a raíz de la gemela garaje (el AJD del recuadro según una
 *      modalidad oculta y los subtítulos de los botones por debajo de 4,5:1).
 *
 *  19. INSPECTOR 08/10/2026 — la familia de compraventa entera, una hermana por agente. CASOS
 *      52-54 al final del fichero: Galicia con perfil discapacidad (comprador y vendedor, y
 *      una pérdida con los gastos de aquella compra ilegibles), el UMBRAL valenciano del
 *      millón al céntimo (Ley 13/1997, art. 13.Uno) y el 0 escrito en el precio y en el valor
 *      catastral del suelo. Y seis hallazgos que nacieron con `test.fail()` y etiqueta
 *      [08/10-a] … [08/10-f] (3078-3083), REPARADOS el 08/10/2026 y hoy regresión: el 0 del
 *      precio y el del suelo anunciados como si faltaran, la coma antes de «ni», el nombre de
 *      la comunidad sin artículo, «existe:» delante de una lista de varios tipos y el ⚠️ sin
 *      aria-hidden del tope de valor.
 *
 *  20. REPARACIÓN 10/10/2026 — Ceuta, Melilla y la plusvalía foral (bloque propio al final).
 *
 *  21. INSPECTOR 13/10/2026 (re-inspección, app INVALIDADA) — CASOS 55-57 al final del
 *      fichero: Cantabria con perfil joven (comprador y vendedor), Melilla con el coeficiente
 *      más alto del IIVTNU (≥ 20 años), el método real, la bonificación del 50 % y la
 *      deducción del 60 % del IRPF, y una comisión del 150 % en Ceuta. Las cifras de notaría y
 *      registro ya llevan la rebaja del 5 % que el motor aplica desde el 11/10/2026. Y cuatro
 *      hallazgos que nacieron con `test.fail()` y etiqueta [13/10-a] … [13/10-d] (3252-3255),
 *      REPARADOS el 20/10/2026 (f6de548d) y hoy regresión.
 *
 *  22. INSPECTOR 19/10/2026 (re-inspección, app INVALIDADA por 5f1b199a, hallazgo 3368: el IRPF
 *      de la venta con las otras rentas del ahorro del año) — CASOS 58-60 al final del fichero:
 *      Castilla-La Mancha con otras rentas que hacen CRUZAR a la venta el tramo de 50.000 €,
 *      Melilla en el tramo MÁS ALTO de la escala (30 %) con la deducción del art. 68.4 LIRPF
 *      sobre la parte PROPORCIONAL de la cuota, y esas otras rentas ilegibles en Melilla. Y
 *      cuatro hallazgos que nacieron con `test.fail()` y etiqueta [19/10-a] … [19/10-d]
 *      (3380-3383), REPARADOS el 20/10/2026 (616e5fc8 y f6de548d) y hoy regresión.
 *
 *  23. INSPECTOR 21/10/2026 (re-inspección, app INVALIDADA por f6de548d, 1084f12f y 616e5fc8) —
 *      CASOS 61-63 al final del fichero: Andalucía en obra nueva con el trastero independiente y el
 *      vendedor-promotor, Murcia a 50 años de propiedad (el máximo del campo) y el País Vasco con la
 *      gestoría del comprador y la comisión ilegibles, más la cuota de comunidad del reparto. Y tres
 *      hallazgos ABIERTOS con `test.fail()` y etiqueta [21/10-a] … [21/10-c].
 *
 * De dónde sale CADA cifra esperada (ninguna de memoria):
 *  - Tipo general de ITP por CCAA → `TIPOS_ITP_CCAA_2025` en `data/fiscal/inmuebles.ts`,
 *    leído por `tipoGeneralDe()` en `data/itp-ccaa.ts` (Madrid = 6 %, Cataluña = 10 %,
 *    Galicia = 8 %).
 *  - Escala progresiva y AJD por CCAA → `ITP_CCAA` en `data/itp-ccaa.ts`
 *    (Cataluña 10/11/12/13 % y `ajd: 1.5` · Madrid `ajd: 0.75` · País Vasco `ajd: 0.5`, con
 *    `ajdVivienda: 0` para la vivienda y sus anexos desde el 24/09/2026).
 *  - IVA del trastero de obra nueva → `IVA_INMUEBLES_2025` en `data/fiscal/inmuebles.ts`.
 *    La app usa `anejoVinculado: 10` para el trastero VINCULADO (anejo transmitido junto con la
 *    vivienda, art. 91.Uno.1.7º LIVA) y `garaje: 21` para el INDEPENDIENTE (finca registral
 *    propia, operación separada → tipo general).
 *  - Arancel notarial → `ARANCELES_NOTARIO` (RD 1426/1989, número 2: matriz + una copia) y
 *    la FACTURA que se muestra → `FACTURA_NOTARIAL` (horquilla ×1,5 a ×2, que cubre los
 *    números 4, 6 y 7 —copias, folios y suplidos—; la tarjeta enseña el punto medio ×1,75).
 *  - Arancel registral → `ARANCELES_REGISTRO` (RD 1427/1989, número 2) MÁS los dos importes
 *    fijos de `REGISTRO_CONCEPTOS`: asiento de presentación 6,010121 € (número 1) y nota
 *    simple 3,005061 € (número 4). Al registro NO se le aplica la horquilla de la notaría.
 *  - El 21 % de IVA sobre honorarios notariales y registrales va DENTRO de
 *    `calcularArancelNotarial` y `calcularRegistro`, salvo en Canarias, Ceuta y Melilla, donde
 *    desde el 26/09/2026 (242fffcd, hallazgo 2214) devuelven el arancel sin impuesto indirecto
 *    (`honorariosLlevanIVA`): allí se factura IGIC o IPSI, que la app nombra y no calcula.
 *  - ⚠️ 06/10/2026: el agente de la referencia registró que ni la notaría ni el registro
 *    aplican la rebaja del 5 % de sus aranceles (RD 1426/1989 y RD 1427/1989, Anexo I nº 2.1;
 *    hallazgos 2901 y 2902). Los casos nuevos de ese día NO fijan cifras de notaría ni de
 *    registro: las leen de la pantalla y comprueban que el total las sume.
 *  - Ganancia patrimonial e IRPF → `calcularGananciaInmueble` (`data/fiscal/ganancia-inmueble.ts`,
 *    arts. 34-36 LIRPF) sobre `TRAMOS_GANANCIAS_PATRIMONIALES_2025` (19 % hasta 6.000 ·
 *    21 % hasta 50.000 · 23 % hasta 200.000 · 27 % hasta 300.000 · 30 % resto).
 *  - Plusvalía municipal → `calcularPlusvaliaMunicipal` (`data/itp-ccaa.ts`) sobre
 *    `COEFICIENTES_IIVTNU_2025` y `PLUSVALIA_MUNICIPAL_META.tipoOrientativo` = 25 %
 *    (`data/fiscal/inmuebles.ts`, RDL 26/2021 y arts. 104.5 y 107.4-5 TRLHL).
 *  - Bonificación del 50 % de la cuota en Ceuta y Melilla → `ITP_CCAA.ceuta` /
 *    `aplicarBonificacionCiudad` (art. 57 bis TRLITPAJD).
 *  - Territorios donde NO rige el IVA español → `TERRITORIOS_SIN_IVA` (`data/itp-ccaa.ts`):
 *    Canarias (IGIC) y Ceuta y Melilla (IPSI).
 *  - Escala de recargos por presentación extemporánea → `lib/calculadoras/recargoPresentacionTardia.ts`
 *    (LGT art. 27.2 en la redacción de la Ley 11/2021).
 *
 * Todos los casos están resueltos a mano ANTES de ejecutar la app; el desarrollo va comentado
 * junto a cada aserción, con los importes sin redondear.
 *
 * Nota de formato: `formatCurrency` usa es-ES, que NO agrupa los millares de un número de
 * cuatro cifras («1535,59 €») y sí los de cinco o más («16.535,59 €»).
 *
 * Los hallazgos de la re-inspección van al final. Estaban marcados con `test.fail()` y hoy
 * están REPARADOS, así que la marca se retiró y las aserciones sujetan la reparación.
 */
import { test, expect, Page } from '@playwright/test';
// Los casos añadidos el 12/09/2026 siembran con estos dos: `rellenar` usa `fill()` sin
// esperar a que React haya montado el input, y en esa ventana el DOM cambia sin que el
// estado de React se entere (ver la cabecera de `_hidratacion.ts`).
import { esperarHidratacion, esperarValorEnReact, sembrarValor } from './_hidratacion';

const RUTA = '/simulador-gastos-compraventa-trastero/';

/**
 * Repite una medición hasta que dos lecturas consecutivas coinciden.
 *
 * Leer un color computado justo después de cambiar de tema devuelve un fotograma
 * INTERMEDIO de la transición CSS: un número que no existe en ninguno de los dos temas.
 * El 09/09/2026 este test daba 1,72:1 midiendo texto ya oscuro (rgb(176,176,176)) sobre un
 * panel a medio camino (rgb(132,132,132)), cuando el valor real con la transición
 * terminada es 6,6:1 sobre rgb(42,42,42). El fallo estaba en la medición, no en el color.
 *
 * No sirve esperar `getAnimations()`: consultarlo en el mismo tick del clic devuelve una
 * lista vacía —el navegador aún no ha creado las transiciones— y, con margen de fotogramas,
 * nacen escalonadas. Lo único que no depende de cómo esté implementada la animación es
 * esperar a que la medida deje de moverse.
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


/** El formato de moneda es-ES separa la cifra del € con un espacio duro (U+00A0). */
const ESPACIO_DURO = new RegExp(String.fromCharCode(160), 'g');

/** Valor de una ResultCard, con el espacio duro del formato español normalizado. */
async function valorTarjeta(page: Page, titulo: string | RegExp): Promise<string> {
  const valor = page
    .locator('h3', { hasText: titulo })
    .first()
    .locator('xpath=../following-sibling::div[1]/p');
  return (await valor.innerText()).replace(ESPACIO_DURO, ' ').trim();
}

/** Texto de un elemento, con el espacio duro del formato español normalizado. */
async function texto(locator: ReturnType<Page['getByText']>): Promise<string> {
  return (await locator.innerText()).replace(ESPACIO_DURO, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * La salvedad del art. 30.1 TRLITPAJD (hallazgo 2209 de la hermana solar, llevado aquí el
 * 26/09/2026): la app la añade a la tarjeta del AJD y al total cuando hay AJD. Los casos
 * anteriores miden otra cosa en esas descripciones (la bonificación, el tipo de la renuncia, la
 * dirección del aviso), así que el lector de descripciones la aparta; su presencia —y su
 * ausencia sin AJD— la mide el caso «Hallazgo 2209» del final de este fichero, en crudo.
 */
const AVISO_BASE_AJD =
  'El AJD va calculado sobre el precio escrito, pero su base no puede ser inferior al valor de referencia catastral (art. 30.1 TRLITPAJD): si ese valor es mayor, el AJD se liquida sobre él';
/**
 * La app une la salvedad con «. » si el texto no acababa en punto, y con un espacio si ya
 * acababa (las frases completas de esta familia: la nota de los honorarios, «…se muestra.», y la
 * rebaja del AJD de la vivienda habitual, «…lo preguntamos.»). Aquí se deshace igual.
 */
const sinAvisoBaseAjd = (s: string): string => {
  if (!s.endsWith(AVISO_BASE_AJD)) return s;
  const resto = s.slice(0, -AVISO_BASE_AJD.length).trimEnd();
  return /(?:se muestra|lo preguntamos)\.$/.test(resto) ? resto : resto.replace(/\.$/, '');
};

/** Texto descriptivo bajo el valor de una ResultCard. */
async function descripcionTarjeta(page: Page, titulo: string | RegExp): Promise<string> {
  const desc = page
    .locator('h3', { hasText: titulo })
    .first()
    .locator('xpath=../following-sibling::p[1]');
  return sinAvisoBaseAjd((await desc.innerText()).replace(ESPACIO_DURO, ' ').replace(/\s+/g, ' ').trim());
}

async function rellenar(page: Page, etiqueta: string, valor: string): Promise<void> {
  const campo = page.locator(`input[aria-label="${etiqueta}"]`);
  await campo.fill(valor);
  await campo.blur();
}

/**
 * Los dos desplegables ya tienen id desde la reparación del 21/08/2026 (#select-ccaa y
 * #select-perfil), pero se siguen localizando por posición para que el test no dependa de
 * un identificador: el de comunidad autónoma siempre existe; el de perfil solo se pinta en
 * la rama de segunda mano.
 */
const selectCcaa = (page: Page) => page.locator('select').nth(0);
const selectPerfil = (page: Page) => page.locator('select').nth(1);

test.describe('Simulador de gastos de compraventa de trastero — inspección 20/08/2026', () => {
  /**
   * CASO 1 (NORMAL) — segunda mano en una CCAA concreta, con el precio que la propia app
   * propone como placeholder (15.000 €) y la gestoría que trae por defecto (300 €).
   */
  test('CASO 1 (normal) — Madrid, segunda mano, 15.000 €, comprador general', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await selectCcaa(page).selectOption('madrid');
    await selectPerfil(page).selectOption('general');
    await rellenar(page, 'Precio del trastero', '15000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');

    // ITP = 15.000 × 6 % = 900. El 6 % es TIPOS_ITP_CCAA_2025 → { ccaa: 'Madrid', tipo: 6 }.
    // Madrid no tiene escala progresiva, así que el tipo efectivo coincide con el nominal.
    // `elegirTipoITP` recibe `viviendaHabitual: false` (un trastero suelto nunca lo es), y
    // los tres reducidos de Madrid exigen vivienda habitual o municipio pequeño, así que
    // ninguno se aplica: el general es lo correcto.
    expect(await valorTarjeta(page, 'ITP (6,00 %)')).toBe('900,00 €');
    expect(await descripcionTarjeta(page, 'ITP (6,00 %)')).toContain('Comunidad de Madrid');

    // Notaría — RD 1426/1989, número 2 (ARANCELES_NOTARIO):
    //   tramo 1 (hasta 6.010,12 €)            →                         90,151816
    //   tramo 2 (6.010,12→30.050,61, 0,45 %)  →  8.989,88 × 0,0045 =        40,45446
    //   escala del nº 2.1                     =                           130,606276
    //   rebaja del 5 % del nº 2.1 (17/10/2026, cabo C0209) × 0,95 =       124,075962
    //   con el 21 % de IVA                    = × 1,21 =                  150,131914
    // FACTURA_NOTARIAL (números 4, 6 y 7 aparte): ×1,5 = 225,197871 · ×2 = 300,263828
    //   punto medio ×1,75, que es lo que suma la app =                    262,730850
    // (sin la rebaja: 276,55 · 237,05 · 316,06)
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('262,73 €');
    const notaria = await descripcionTarjeta(page, 'Gastos de notaría');
    expect(notaria).toContain('225,20 €');
    expect(notaria).toContain('300,26 €');

    // Registro — RD 1427/1989, números 1, 2 y 4 (ARANCELES_REGISTRO + REGISTRO_CONCEPTOS):
    //   tramo 1 (hasta 6.010,12 €)             →                        24,040484
    //   tramo 2 (6.010,12→30.050,61, 0,175 %)  →  8.989,88 × 0,00175 =      15,73229
    //   inscripción (número 2)                 =                            39,772774
    //   × 0,95 (rebaja del nº 2.1)             =                            37,784135
    //   + asiento de presentación (número 1)   →                             6,010121
    //   + nota simple (número 4)               →                             3,005061
    //                                          =                            46,799317
    //   con el 21 % de IVA                     = 46,799317 × 1,21 =         56,627174
    // Al registro NO se le aplica el factor 1,5-2 de la notaría: son importes fijos, y la rebaja
    // tampoco alcanza a la presentación ni a la nota simple. (Sin la rebaja, 59,03 €.)
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('56,63 €');

    // En segunda mano no hay AJD: la operación tributa por ITP y ambos son incompatibles.
    await expect(page.locator('h3', { hasText: 'AJD' })).toHaveCount(0);

    // Total gastos = 900 + 262,73 + 56,63 + 300 = 1.519,36 (líneas ya redondeadas)
    //   % sobre el precio = 1.519,36 / 15.000 = 10,129067 %
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('1519,36 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('10,13 %');

    // Coste total = 15.000 + 1.519,36 = 16.519,36
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('16.519,36 €');
  });

  /**
   * CASO 2 (LÍMITE) — lo PROPIO del trastero: el mismo inmueble de obra nueva tributa al
   * 10 % si se transmite como anejo junto con la vivienda y al 21 % si es finca registral
   * independiente (art. 91.Uno.1.7º LIVA). Se comprueba el salto en los dos sentidos, y
   * sobre un precio tan bajo (3.000 €) que los importes fijos de notaría y registro
   * (219,89 € con la rebaja del nº 2.1; 230,89 € antes) pesan casi tanto como el propio
   * impuesto del caso vinculado (300 €).
   */
  test('CASO 2 (límite) — obra nueva en Madrid, 3.000 €: IVA 10 % vinculado vs 21 % independiente', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Primera mano/ }).click();
    await selectCcaa(page).selectOption('madrid');
    await rellenar(page, 'Precio del trastero', '3000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');

    // --- Trastero VINCULADO (es la modalidad por defecto) ---
    // IVA = 3.000 × 10 % = 300 — IVA_INMUEBLES_2025.anejoVinculado = 10 (anejo con la vivienda).
    await expect(page.getByRole('button', { name: /Vinculado a vivienda/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(await valorTarjeta(page, 'IVA (10,00 %)')).toBe('300,00 €');
    expect(await descripcionTarjeta(page, 'IVA (10,00 %)')).toContain('anejo transmitido con la vivienda');

    // AJD = 3.000 × 0,75 % = 22,50 — ITP_CCAA.madrid.ajd = 0.75. Solo hay AJD en obra nueva.
    expect(await valorTarjeta(page, 'AJD (0,75 %)')).toBe('22,50 €');

    // Notaría — por debajo de 6.010,12 € solo se devenga la cuota fija del primer tramo:
    //   90,151816 × 0,95 (rebaja del nº 2.1, cabo C0209) = 85,644225 × 1,21 (IVA) = 103,629512
    //   horquilla FACTURA_NOTARIAL: ×1,5 = 155,444268 · ×2 = 207,259025 · medio = 181,351647
    //   (sin la rebaja: 190,89 · 163,62 · 218,16)
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('181,35 €');
    const notaria = await descripcionTarjeta(page, 'Gastos de notaría');
    expect(notaria).toContain('155,44 €');
    expect(notaria).toContain('207,26 €');

    // Registro — cuota fija 24,040484 × 0,95 = 22,838460 + presentación 6,010121 + nota simple
    //   3,005061 = 31,853642 · con el 21 % de IVA = 38,542907 (sin la rebaja, 40,00)
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('38,54 €');

    // Total vinculado = 300 + 22,50 + 181,35 + 38,54 + 300 = 842,39
    //   % sobre el precio = 28,079667 %  ·  coste total = 3.842,39
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('842,39 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('28,08 %');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('3842,39 €');

    // --- Mismo trastero, ahora INDEPENDIENTE ---
    await page.getByRole('button', { name: /Independiente/ }).click();

    // IVA = 3.000 × 21 % = 630 — IVA_INMUEBLES_2025.garaje = 21 (tipo general).
    // El salto respecto al vinculado es de 330 €, el 11 % del precio del trastero.
    expect(await valorTarjeta(page, 'IVA (21,00 %)')).toBe('630,00 €');
    expect(await descripcionTarjeta(page, 'IVA (21,00 %)')).toContain('trastero independiente');

    // El aviso tiene que explicar la CONDICIÓN, no solo el tipo: el 10 % es para los anejos
    // transmitidos junto con la vivienda.
    await expect(page.getByText(/solo se aplica a los anejos/)).toBeVisible();

    // Los fijos no se mueven (dependen del precio, no del tipo de IVA):
    expect(await valorTarjeta(page, 'AJD (0,75 %)')).toBe('22,50 €');
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('181,35 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('38,54 €');

    // Total independiente = 630 + 22,50 + 181,35 + 38,54 + 300 = 1.172,39
    //   % sobre el precio = 39,079667 %  ·  coste total = 4.172,39
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('1172,39 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('39,08 %');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('4172,39 €');

    // El 10 %/21 % es estatal (Ley 37/1992), no autonómico: cambiar de comunidad mueve el
    // AJD (Cataluña 1,5 % → 45 €) pero NO el IVA.
    await selectCcaa(page).selectOption('cataluna');
    expect(await valorTarjeta(page, 'IVA (21,00 %)')).toBe('630,00 €');
    expect(await valorTarjeta(page, 'AJD (1,50 %)')).toBe('45,00 €');

    // País Vasco — ⚠️ REESCRITO el 24/09/2026. El caso daba por hecho que allí no hay AJD, y
    // eso solo es cierto para la vivienda y sus anejos (`ITP_CCAA['pais-vasco'].ajdVivienda`
    // = 0: la exención foral es de la primera transmisión de vivienda con sus anexos del mismo
    // edificio, NF 1/2011 de Bizkaia art. 58.35, según la ficha del motor). Un trastero
    // INDEPENDIENTE no es vivienda: paga el 0,5 % general (`ITP_CCAA['pais-vasco'].ajd`; NF
    // 1/2011 de Bizkaia art. 44.1, NF 18/1987 de Gipuzkoa art. 29.2). 3.000 × 0,5 % = 15,00 €.
    await selectCcaa(page).selectOption('pais-vasco');
    expect(await valorTarjeta(page, 'IVA (21,00 %)')).toBe('630,00 €');
    expect(await valorTarjeta(page, 'AJD (0,50 %)')).toBe('15,00 €');
    // El VINCULADO sí se transmite con la vivienda: ahí el AJD es 0 y la tarjeta desaparece.
    await page.getByRole('button', { name: /Vinculado a vivienda/ }).click();
    await expect(page.locator('h3', { hasText: 'AJD' })).toHaveCount(0);
  });

  /**
   * CASO 3 (DEBE RECHAZARSE) — un precio cero o negativo no puede producir presupuesto:
   * un ITP negativo (−3.000 × 6 % = −180 €) sería un «ahorro» inexistente, y un
   * «No definido» en la tarjeta de COSTE TOTAL sería peor que no responder.
   */
  test('CASO 3 (debe rechazarse) — precio negativo o cero: la app pide el dato en vez de calcular', async ({
    page,
  }) => {
    await page.goto(RUTA);
    const precio = page.locator('input[aria-label="Precio del trastero"]');
    const aviso = page.getByText(
      'Introduce el precio del trastero para ver el desglose de gastos del comprador',
    );

    // Sin escribir nada: parseSpanishNumber('') devuelve NaN y la guarda lo atrapa
    // (`!Number.isFinite(precio)`), así que no puede colarse ningún «No definido».
    await expect(aviso).toBeVisible();
    await expect(page.getByText('No definido')).toHaveCount(0);

    // Con un negativo y SIN salir del campo: la guarda `precio <= 0` corta el cálculo.
    await precio.fill('-3000');
    // Escrito y legible, pero imposible: no se pide como si faltara (patrón 5, 08/10/2026).
    const noValido = (v: string) => page.getByText(`El precio escrito («${v}») tiene que ser mayor que 0`);
    await expect(page.locator('h3', { hasText: 'COSTE TOTAL DE ADQUISICIÓN' })).toHaveCount(0);
    await expect(page.locator('h3', { hasText: 'ITP' })).toHaveCount(0);
    await expect(noValido('-3000')).toBeVisible();

    // Al perder el foco, NumberInput normaliza al mínimo declarado (min = 0)...
    await precio.blur();
    await expect(precio).toHaveValue('0');

    // ...y con 0 tampoco calcula: nada de ITP de 0 €, ni notaría de 190,89 €, ni «0,00 %».
    await expect(page.locator('h3', { hasText: 'COSTE TOTAL DE ADQUISICIÓN' })).toHaveCount(0);
    await expect(page.locator('h3', { hasText: 'Gastos de notaría' })).toHaveCount(0);
    await expect(noValido('0')).toBeVisible();
    await expect(page.getByText('No definido')).toHaveCount(0);

    // La pestaña del vendedor tiene la misma guarda sobre el mismo precio.
    await page.getByRole('button', { name: /Vendedor/ }).click();
    await expect(page.getByText('El precio de venta escrito («0») tiene que ser mayor que 0')).toBeVisible();
    await expect(page.locator('h3', { hasText: 'IMPORTE NETO VENDEDOR' })).toHaveCount(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// REGRESIONES — hallazgos del 20/08/2026, reparados el 21/08/2026. Afirman lo que debe
// pasar y hoy PASAN: si alguien reintroduce el defecto, saltan aquí.
// ─────────────────────────────────────────────────────────────────────────────

// ✅ REPARADO 21/08/2026 — cálculo.
// Hay UN solo campo de gestoría, en el panel «Datos de la operación» junto al precio y la
// CCAA, y su importe se cobra al COMPRADOR (tarjeta «Gastos de gestoría» dentro del COSTE
// TOTAL DE ADQUISICIÓN) y ADEMÁS se pasa como `gastosTransmision` del vendedor, donde resta
// del valor de transmisión. El art. 35.1 LIRPF solo admite como menor valor de transmisión
// los gastos «satisfechos por el transmitente»: los mismos 300 € no pueden ser a la vez
// coste del comprador y gasto deducible del vendedor. Rebaja el IRPF.
// Caso: 15.000 € de venta · 8.000 € de compra · gestoría 300 € (valor por defecto) →
//       esperado ganancia 6.550,00 € e IRPF 1.255,50 € (solo la comisión del 3 %, 450 €,
//       la paga el vendedor) · obtenido 6.250,00 € y 1.192,50 €, 63,00 € menos de IRPF.
//       Poniendo la gestoría a 0 la app da exactamente los valores esperados, lo que
//       confirma que el desvío viene de ese campo.
test('REGRESIÓN (cálculo) — la gestoría del comprador no puede reducir la ganancia del vendedor', async ({
  page,
}) => {
  await page.goto(RUTA);
  await rellenar(page, 'Precio del trastero', '15000');
  await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');
  await page.getByRole('button', { name: /Vendedor/ }).click();
  await rellenar(page, 'Precio de compra original', '8000');

  // valor de transmisión = 15.000 − 450 de comisión = 14.550 (la gestoría es del comprador)
  // ganancia = 14.550 − 8.000 = 6.550 → IRPF = 6.000×19 % + 550×21 % = 1.140 + 115,50
  expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('14.550,00 €');
  expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('6550,00 €');
  expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('1255,50 €');
});

// ✅ REPARADO 21/08/2026 — contenido.
// Las tarjetas se titulan «Gastos de notaría (+ IVA)» y «Registro de la Propiedad (+ IVA)»,
// pero el importe YA lleva el 21 %: `calcularArancelNotarial` y `calcularRegistro` terminan
// en `total * 1.21`. «+ IVA» significa en castellano «IVA aparte», así que quien presupuesta
// suma un 21 % que ya está dentro. Vale cualquiera de las dos salidas —rotular «IVA
// incluido» o publicar la base sin IVA—; lo que no puede quedarse es el «+».
// Caso: Madrid · segunda mano · 15.000 € → «Gastos de notaría (+ IVA)» = 276,55 €
//       (130,60446 de arancel × 1,21 de IVA × 1,75 de factura) y «Registro de la Propiedad
//       (+ IVA)» = 59,03 € (48,787472 × 1,21). Esperado un rótulo que no prometa un IVA
//       aparte · obtenido el «(+ IVA)», que lleva a presupuestar 334,63 € y 71,43 €.
test('REGRESIÓN (contenido) — el rótulo «(+ IVA)» contradice a unos importes que ya llevan el 21 %', async ({
  page,
}) => {
  await page.goto(RUTA);
  await rellenar(page, 'Precio del trastero', '15000');

  // 17/10/2026 (cabo C0209): las cifras del CASO 1, con la rebaja del nº 2.1 (antes 276,55 y 59,03)
  expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('262,73 €');
  expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('56,63 €');
  const tituloNotaria = await page.locator('h3', { hasText: 'Gastos de notaría' }).first().innerText();
  const tituloRegistro = await page
    .locator('h3', { hasText: 'Registro de la Propiedad' })
    .first()
    .innerText();
  expect(tituloNotaria).not.toMatch(/\+\s*IVA/);
  expect(tituloRegistro).not.toMatch(/\+\s*IVA/);
});

// ✅ REPARADO 21/08/2026 — dato.
// La fila «AJD en primera mano» de la tabla comparativa dice «0,5% – 1,5% según CCAA» en sus
// tres columnas, escrito a mano. En la misma página, ITP_CCAA['pais-vasco'].ajd = 0: al
// elegir País Vasco el recuadro imprime «AJD 0%» y la tarjeta de AJD desaparece. El 1,5 %
// del extremo alto sí es correcto (es el máximo de la tabla); el que falla es el mínimo.
// Caso: primera mano · independiente · País Vasco · 3.000 € → esperado que la fila de AJD
//       incluya el 0 % que la propia app aplica · obtenido «0,5% – 1,5% según CCAA» y
//       cero tarjetas de AJD en el resultado.
test('REGRESIÓN (dato) — el rango de AJD de la tabla deja fuera el 0 % del País Vasco', async ({
  page,
}) => {
  await page.goto(RUTA);
  await page.getByRole('button', { name: /Primera mano/ }).click();
  await selectCcaa(page).selectOption('pais-vasco');
  await rellenar(page, 'Precio del trastero', '3000');
  await expect(page.locator('h3', { hasText: 'AJD' })).toHaveCount(0);

  await page.getByRole('button', { name: /Ver guía educativa/i }).click();
  await expect(page.locator('tr', { hasText: 'AJD en primera mano' })).toContainText('0 %');
});

// ✅ REPARADO 21/08/2026 — contenido.
// La tarjeta «Trastero de segunda mano» del bloque educativo se quedó con las cifras de
// notaría y registro de antes de la reparación del 20/08/2026: dice «notaría (~160 €) y
// registro (~90 €)» y «un coste adicional de ~2.350 €». El ITP sí cuadra (10 % del primer
// tramo de la escala catalana = 1.800 €), pero los otros dos no, y en sentidos opuestos.
// Caso: Cataluña · segunda mano · 18.000 € → la app calcula notaría 305,14 € (144,10446 ×
//       1,21 × 1,75) y registro 65,39 € (54,037472 × 1,21); ITP + notaría + registro =
//       2.170,53 €. Esperado que el ejemplo repita esas cifras · obtenido ~160 €, ~90 € y
//       ~2.350 €, con la notaría casi al doble.
// 17/10/2026 (cabo C0209): con la base del BOE y la rebaja del 5 % del nº 2.1, notaría 144,106276
//       × 0,95 × 1,21 × 1,75 = 289,89 € y registro (45,022774 × 0,95 + 9,015182) × 1,21 = 62,66 €.
//       El ejemplo los deriva del motor (EJEMPLOS de page.tsx), así que se movió solo.
test('REGRESIÓN (contenido) — el ejemplo de Cataluña publica una notaría que el motor ya no da', async ({
  page,
}) => {
  await page.goto(RUTA);
  await selectCcaa(page).selectOption('cataluna');
  await rellenar(page, 'Precio del trastero', '18000');
  expect(await valorTarjeta(page, 'ITP (10,00 %)')).toBe('1800,00 €');
  expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('289,89 €');
  expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('62,66 €');

  await page.getByRole('button', { name: /Ver guía educativa/i }).click();
  const ejemplo = await texto(
    page.getByText(/Una persona compra un trastero independiente en Cataluña/),
  );
  expect(ejemplo).toContain('289,89 €');
  expect(ejemplo).toContain('62,66 €');
});

// ✅ REPARADO 21/08/2026 — contenido.
// La tarjeta «Vender un trastero» anuncia una ganancia que el motor no produce: dice que
// comprado por 8.000 € y vendido por 15.000 € «la ganancia de 7.000 € tributará al 19 % en
// la base del ahorro (1.330 €)». El motor del art. 35 LIRPF descuenta del valor de
// transmisión los gastos de la venta, y con los valores por defecto de la propia app
// (comisión 3 % y gestoría 300 €) la ganancia no es 7.000 €. Además el tipo no es plano:
// los últimos 250 € van al 21 %, así que ni siquiera un 19 % sobre 7.000 daría la cifra.
// Caso: precio de venta 15.000 € · compra 8.000 € · comisión 3 % · gestoría 300 € (todo por
//       defecto) → esperado que el ejemplo diga lo mismo que la calculadora, 6.250,00 € de
//       ganancia y 1.192,50 € de IRPF · obtenido «7.000 €» y «1.330 €», 137,50 € de más.
test('REGRESIÓN (contenido) — la tarjeta de venta anuncia una ganancia que el motor no produce', async ({
  page,
}) => {
  await page.goto(RUTA);
  await rellenar(page, 'Precio del trastero', '15000');
  await page.getByRole('button', { name: /Vendedor/ }).click();
  await rellenar(page, 'Precio de compra original', '8000');
  expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('6550,00 €');
  expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('1255,50 €');

  await page.getByRole('button', { name: /Ver guía educativa/i }).click();
  const ejemplo = await texto(page.getByText(/El vendedor debe calcular la plusvalía municipal/));
  // es-ES no agrupa los millares en cifras de cuatro dígitos: «1255,50 €», no «1.255,50 €»
  expect(ejemplo).toContain('1255,50 €');
});

// ✅ REPARADO 21/08/2026 — contenido.
// La tarjeta «Tipos reducidos de ITP» promete un «Ahorro de 600 € con el tipo reducido del
// 3%» para un joven que compra un trastero en Galicia por 12.000 €, y remite solo a «los
// requisitos de la Xunta para jóvenes compradores». El reducido gallego del 3 % exige
// «Vivienda habitual» (ITP_CCAA.galicia), y la app pasa `viviendaHabitual: false` a
// `elegirTipoITP` a propósito porque un trastero suelto no lo es nunca. La propia app lo
// dice tres pantallas más arriba: «Un trastero comprado por separado no es vivienda
// habitual, así que los tipos que exigen esa condición no suelen aplicarse».
// Caso: Galicia · segunda mano · joven · 12.000 € → esperado que el ejemplo nombre la
//       condición de vivienda habitual · obtenido una promesa de 360 € de ITP mientras la
//       calculadora cobra 960,00 € (8 %) y saca el aviso «Podrías pagar menos».
test('REGRESIÓN (contenido) — el ejemplo del reducido gallego omite la condición que lo bloquea', async ({
  page,
}) => {
  await page.goto(RUTA);
  await selectCcaa(page).selectOption('galicia');
  await rellenar(page, 'Precio del trastero', '12000');
  await selectPerfil(page).selectOption('joven');
  expect(await valorTarjeta(page, 'ITP (8,00 %)')).toBe('960,00 €');
  await expect(page.getByText(/Podrías pagar menos/)).toBeVisible();

  await page.getByRole('button', { name: /Ver guía educativa/i }).click();
  const ejemplo = await texto(page.getByText(/Un joven de 30 años que compra un trastero en Galicia/));
  expect(ejemplo).toMatch(/vivienda habitual/i);
});

// ✅ REPARADO 21/08/2026 — contenido.
// La nota que encabeza la app dice del trastero independiente que «puede tributar diferente
// según la comunidad autónoma». La diferencia que la app aplica —y la única que hay— es
// ESTATAL: el 10 % del anejo transmitido con la vivienda frente al 21 % general del
// art. 91.Uno.1.7º LIVA. El selector de comunidad no mueve ese tipo ni un punto, y en la
// rama de segunda mano la modalidad no cambia absolutamente nada del cálculo.
// Caso: primera mano · independiente · 3.000 € → IVA 630,00 € (21 %) en Madrid, en Cataluña
//       y en País Vasco; y en segunda mano · Madrid · 15.000 €, alternar vinculado ↔
//       independiente deja el ITP en 900,00 € y el coste total en 16.535,59 €. Esperado que
//       la nota nombre el 21 % estatal · obtenido la remisión a la comunidad autónoma.
test('REGRESIÓN (contenido) — la nota atribuye a la CCAA una diferencia que es estatal', async ({
  page,
}) => {
  await page.goto(RUTA);
  await page.getByRole('button', { name: /Primera mano/ }).click();
  await page.getByRole('button', { name: /Independiente/ }).click();
  await rellenar(page, 'Precio del trastero', '3000');
  for (const comunidad of ['madrid', 'cataluna', 'pais-vasco']) {
    await selectCcaa(page).selectOption(comunidad);
    expect(await valorTarjeta(page, 'IVA (21,00 %)')).toBe('630,00 €');
  }

  // El % separado con espacio DURO desde el 26/09/2026 (hallazgo 2194): se normaliza.
  const nota = (await page.locator('[class*="trasteroNote"]').first().innerText()).replace(ESPACIO_DURO, ' ');
  expect(nota).toContain('21 %');
});

// ✅ REPARADO 21/08/2026 — operativa.
// Cuando faltan los datos de la plusvalía municipal (años de propiedad y valor catastral del
// suelo), la app imprime «0,00 €» en la tarjeta y suma ese 0 al total de gastos y al neto del
// vendedor, aunque su propia descripción diga «No calculada (faltan datos)». Un importe de
// cero y un importe desconocido no son lo mismo: el neto sale más alto de lo que será.
// Caso: 15.000 € de venta · 8.000 € de compra · sin años ni valor catastral → esperado que
//       la tarjeta no dé una cifra (o que el neto avise de que le falta la plusvalía) ·
//       obtenido «Plusvalía municipal 0,00 €» y un «IMPORTE NETO VENDEDOR 13.057,50 €»
//       presentado como «Lo que realmente recibes tras los gastos».
test('REGRESIÓN (operativa) — una plusvalía no calculada no puede presentarse como 0,00 €', async ({
  page,
}) => {
  await page.goto(RUTA);
  await rellenar(page, 'Precio del trastero', '15000');
  await page.getByRole('button', { name: /Vendedor/ }).click();
  await rellenar(page, 'Precio de compra original', '8000');
  // Desde el hallazgo 590 el aviso NOMBRA los campos que faltan, uno a uno, en vez de decir
  // «faltan datos» a secas.
  expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toContain('No calculada (falta');
  expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toContain('los años de propiedad');
  expect(await valorTarjeta(page, 'Plusvalía municipal')).not.toBe('0,00 €');
});

// ✅ REPARADO 21/08/2026 — accesibilidad.
// Los dos <select> de la app («Comunidad Autónoma» y «Perfil del comprador») no tienen id,
// ni aria-label, ni aria-labelledby, y el <label> que los precede no lleva htmlFor ni los
// envuelve: son labels huérfanos. Un lector de pantalla anuncia «cuadro combinado» sin decir
// de qué. La CCAA es el dato que más mueve el resultado (del 4 % al 13 % de ITP). Los labels
// de «Modalidad del trastero» y «Tipo de transmisión» están igual de sueltos sobre sus
// grupos de botones.
// Caso: abrir la app → los dos selects devuelven nombre accesible vacío (id null, aria-label
//       null, aria-labelledby null, ningún label[for]) · esperado «Comunidad Autónoma
//       (ubicación del trastero)» y «Perfil del comprador (para tipos reducidos)».
test('REGRESIÓN (accesibilidad) — los desplegables deben tener nombre accesible', async ({
  page,
}) => {
  await page.goto(RUTA);
  await page.getByRole('button', { name: /Segunda mano/ }).click();
  await expect(selectCcaa(page)).toHaveAccessibleName(/Comunidad Autónoma/);
  await expect(selectPerfil(page)).toHaveAccessibleName(/Perfil del comprador/);
});

// ═════════════════════════════════════════════════════════════════════════════
// MITAD B — casos nuevos de la re-inspección del 27/08/2026, en zonas que ninguna
// inspección anterior tocó: la plusvalía municipal por sus dos métodos, la venta con
// pérdida, la bonificación de Ceuta, la escala progresiva catalana y el rechazo de una
// cifra malformada. Resueltos a mano ANTES de abrir el navegador.
// ═════════════════════════════════════════════════════════════════════════════

test.describe('MITAD B — zonas no cubiertas por la inspección del 20/08/2026', () => {
  /**
   * CASO 4 (NORMAL, pestaña Vendedor) — la plusvalía municipal con TODOS sus datos, que es
   * la parte del vendedor que la inspección anterior solo tocó por su ausencia (hallazgo 88).
   * Se elige a propósito un caso donde el método objetivo gana al real, para comprobar que
   * la app aplica el mínimo del art. 107.5 TRLHL y lo dice.
   */
  test('CASO 4 (normal) — vendedor con plusvalía calculada: 15.000/8.000, 5 años, suelo 4.000 de 9.000', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio del trastero', '15000');
    await page.getByRole('button', { name: /Vendedor/ }).click();
    await rellenar(page, 'Precio de compra original', '8000');
    await rellenar(page, 'Impuestos y gastos que pagaste al comprarlo', '1000');
    await rellenar(page, 'Años de propiedad', '5');
    await rellenar(page, 'Valor catastral del suelo', '4000');
    await rellenar(page, 'Valor catastral total (suelo + construcción)', '9000');

    // Plusvalía municipal — calcularPlusvaliaMunicipal (data/itp-ccaa.ts):
    //   método OBJETIVO (art. 107.4 TRLHL, redacción del RDL 8/2023): 5 años → 0,18
    //     base = 4.000 × 0,18 = 720 · cuota = 720 × 25 % = 180,00
    //     (el 25 % es PLUSVALIA_MUNICIPAL_META.tipoOrientativo, no el 30 % máximo legal)
    //     ⚠️ 24/09/2026 (hallazgo 1559): hasta hoy el coeficiente era 0,17 (tabla anterior
    //     al RDL 8/2023) y la cifra, 170,00.
    //   método REAL (art. 107.5 TRLHL): el incremento se reparte en la proporción catastral
    //     (15.000 − 8.000) × (4.000 / 9.000) × 25 % = 7.000 × 0,4444… × 0,25 = 777,777…
    //   el contribuyente elige el más favorable → 180,00 €, y el método se nombra.
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('180,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toContain('Método objetivo');

    // Valor de adquisición (art. 35.1 LIRPF) = 8.000 + 1.000 de impuestos y gastos = 9.000
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('9000,00 €');

    // Valor de transmisión (art. 35.2 LIRPF) = 15.000 − 450 de comisión (3 % por defecto)
    //   − 0 de gestoría del vendedor − 180 de plusvalía municipal = 14.370
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('14.370,00 €');
    expect(await valorTarjeta(page, 'Comisión inmobiliaria (3 %)')).toBe('450,00 €');

    // Ganancia = 14.370 − 9.000 = 5.370 → cabe entera en el primer tramo del ahorro
    //   (TRAMOS_GANANCIAS_PATRIMONIALES_2025: 19 % hasta 6.000) → 5.370 × 19 % = 1.020,30
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('5370,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('1020,30 €');

    // Total gastos vendedor = 180 + 450 + 0 de gestoría + 1.020,30 = 1.650,30
    // Neto = 15.000 − 1.650,30 = 13.349,70
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('1650,30 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('13.349,70 €');
    // Con la plusvalía ya calculada, el neto deja de ser un techo (reparación del hallazgo 88)
    expect(await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR')).toContain('realmente recibes');
  });

  /**
   * CASO 5 (LÍMITE) — vender por DEBAJO de lo que se pagó. Toca a la vez las dos ramas que
   * se salen del camino normal: la no sujeción del art. 104.5 TRLHL (sin incremento de valor
   * no hay plusvalía municipal) y la pérdida patrimonial del art. 33 LIRPF (sin cuota).
   * Es el caso en el que un cero mal puesto se convierte en un impuesto inexistente.
   */
  test('CASO 5 (límite) — venta con pérdida: plusvalía no sujeta y cero IRPF', async ({ page }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio del trastero', '8000');
    await page.getByRole('button', { name: /Vendedor/ }).click();
    await rellenar(page, 'Precio de compra original', '12000');
    await rellenar(page, 'Años de propiedad', '10');
    await rellenar(page, 'Valor catastral del suelo', '5000');
    await rellenar(page, 'Valor catastral total (suelo + construcción)', '10000');

    // incremento real = 8.000 − 12.000 = −4.000 ≤ 0 → `exento` en calcularPlusvaliaMunicipal.
    // No puede salir la cuota objetiva (5.000 × 0,08 × 25 % = 100,00 €): sin incremento de
    // valor el impuesto no se devenga, y el rótulo tiene que decirlo con palabras.
    // «NO SUJETA» desde el 18/09/2026 (hallazgo 901): el art. 104.5 TRLRHL articula un
    // supuesto de NO SUJECIÓN, no una exención, y la propia tarjeta ya lo decía así en su
    // descripción mientras el valor decía «EXENTO».
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('NO SUJETA');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toContain('No sujeta');

    // valor de transmisión = 8.000 − 240 (comisión 3 %) = 7.760 · valor de adquisición = 12.000
    // ganancia = 7.760 − 12.000 = −4.240 → pérdida patrimonial, sin cuota
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('12.000,00 €');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('7760,00 €');
    expect(await valorTarjeta(page, 'Pérdida patrimonial')).toBe('4240,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('SIN CUOTA');
    await expect(page.locator('h3', { hasText: 'Ganancia patrimonial' })).toHaveCount(0);

    // Total gastos = 0 de plusvalía + 240 de comisión + 0 de gestoría + 0 de IRPF = 240
    // Neto = 8.000 − 240 = 7.760
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('240,00 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('7760,00 €');
  });

  /**
   * CASO 6 (LÍMITE) — las dos comunidades cuyo ITP NO es un porcentaje plano del precio:
   * Ceuta, donde el art. 57 bis TRLITPAJD bonifica la cuota al 50 % por el SITIO del
   * inmueble (y por tanto se aplica también a un trastero, que nunca es vivienda habitual),
   * y Cataluña, cuya escala progresiva solo se separa del tipo plano por encima de 600.000 €.
   */
  test('CASO 6 (límite) — Ceuta bonificada al 50 % y la escala progresiva catalana por encima de 600.000 €', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await selectCcaa(page).selectOption('ceuta');
    await rellenar(page, 'Precio del trastero', '20000');

    // ITP_CCAA.ceuta: tipoGeneral 6 y un reducido «Bonificación general 50%» del 3 % cuyas
    // condiciones son ['Inmueble situado en Ceuta', 'Bonificación automática 50%'] — las dos
    // de UBICACIÓN, así que `elegirTipoITP` las da por cumplidas con el perfil general.
    //   20.000 × 3 % = 600,00 (la mitad de los 1.200 del tipo general)
    expect(await valorTarjeta(page, 'ITP (3,00 %)')).toBe('600,00 €');

    // Cataluña, 700.000 € — tramosProgresivos 10/11/12/13 %:
    //   600.000 × 10 % = 60.000 · (700.000 − 600.000) × 11 % = 11.000 → 71.000,00
    //   tipo EFECTIVO = 71.000 / 700.000 = 10,142857 % (NO el 10 % nominal del primer tramo:
    //   el tipo plano daría 70.000 €, mil euros menos)
    await selectCcaa(page).selectOption('cataluna');
    await rellenar(page, 'Precio del trastero', '700000');
    expect(await valorTarjeta(page, 'ITP (10,14 %)')).toBe('71.000,00 €');
    await expect(page.getByText(/aplica escala progresiva/)).toBeVisible();

    // Notaría a ese precio — ARANCELES_NOTARIO acumulado hasta 700.000 = 588,637646 sin IVA
    //   (base del BOE 90,151816); × 0,95 (rebaja del nº 2.1, cabo C0209) = 559,205764 · × 1,21 =
    //   676,638974 de arancel · factura media × 1,75 = 1.184,118205 (sin la rebaja, 1.246,44)
    // Registro — ARANCELES_REGISTRO acumulado 326,313758 (por debajo del tope de 2.181,673939)
    //   × 0,95 = 309,998070 + 6,010121 de presentación + 3,005061 de nota simple = 319,013252 ·
    //   × 1,21 = 386,006034 (sin la rebaja, 405,75)
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('1184,12 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('386,01 €');
  });

  /**
   * CASO 7 (DEBE RECHAZARSE) — una cifra malformada. `NumberInput` filtra las letras con su
   * regex `/^-?[\d.,]*$/`, así que lo que de verdad puede llegar al motor es un número con
   * dos separadores mal puestos. `parseSpanishNumber` devuelve NaN para «1.2.3» (está en su
   * propia documentación), y la app tiene que pedir el dato en vez de calcular sobre NaN.
   */
  test('CASO 7 (debe rechazarse) — «1.2.3» no es un precio: ni cálculo ni «No definido»', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio del trastero', '1.2.3');

    // Escrito pero ilegible: se dice que no se lee, no que falta (hallazgo 1285).
    await expect(page.getByText('No se ha podido leer el precio «1.2.3»', { exact: false })).toBeVisible();
    await expect(page.locator('h3', { hasText: 'COSTE TOTAL DE ADQUISICIÓN' })).toHaveCount(0);
    await expect(page.locator('h3', { hasText: 'Gastos de notaría' })).toHaveCount(0);
    await expect(page.getByText('No definido')).toHaveCount(0);
    // Sobre el texto completo y con mayúsculas: `getByText('NaN')` es una búsqueda de
    // subcadena SIN distinguir mayúsculas y casaría con «ganancia», que lleva «nan» dentro.
    expect(await page.locator('body').innerText()).not.toContain('NaN');

    // Lo mismo en el campo de gestoría: `parseSpanishNumberOr` devuelve su valor por defecto
    // (0) en vez de contaminar el total. Con un precio válido, el total no puede llevar NaN.
    await rellenar(page, 'Precio del trastero', '15000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '1.2.3');
    // 900 de ITP + 262,73 de notaría + 56,63 de registro + 0 de gestoría (las del CASO 1, con la
    // rebaja del nº 2.1, cabo C0209; sin ella, 1.235,58)
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('1219,36 €');
    // ⚠️ 22/09/2026 (hallazgo 1201): hasta hoy este testigo pedía que la tarjeta NO se pintara,
    // y esa mitad era el defecto —el importe desaparecía sin dejar rastro—. La cifra sigue
    // siendo la misma, porque la app no puede inventar lo que no ha podido leer, pero la línea
    // vuelve al desglose y lo dice.
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('Sin leer');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// HALLAZGOS de la re-inspección del 27/08/2026 — REPARADOS ese mismo día.
// Nacieron con `test.fail()` afirmando lo que DEBERÍA pasar; al repararlos se les quitó la
// marca y quedan como regresión.
// ═════════════════════════════════════════════════════════════════════════════

test.describe('REGRESIÓN — hallazgos del 27/08/2026, reparados', () => {
  // ✅ REPARADO 27/08 (alto) — cálculo. REPARACIÓN A MEDIAS del commit c47189ca.
  // En Canarias, Ceuta y Melilla no rige el IVA español: `TERRITORIOS_SIN_IVA`
  // (data/itp-ccaa.ts) los declara como IGIC e IPSI. La app RENDERIZA el componente
  // `AvisoTerritorioSinIva`, que dice literalmente «Esta herramienta no lo calcula, así que
  // el importe del impuesto indirecto no es el tuyo»… y la tarjeta de al lado liquida un IVA
  // que allí no existe y lo suma a un total rotulado «Precio del trastero + todos los gastos».
  // A esta app llegó el aviso pero NO el cálculo: `page.tsx` ni siquiera importa
  // `TERRITORIOS_SIN_IVA`. Las tres hermanas del clúster (nave-industrial, solar y
  // terreno-rústico) lo resolvieron con una bandera `impuestoNoCalculado` que deja el
  // impuesto sin cifra y rotula «COSTE TOTAL (PARCIAL)».
  // Caso: Canarias · primera mano · vinculado · 15.000 € · gestoría 300 € → esperado ninguna
  //       cifra de impuesto indirecto y el total marcado como parcial · obtenido
  //       «IVA (10,00%) 1500,00 €», «Total gastos adicionales 2248,09 € — 14,99% sobre el
  //       precio» y «COSTE TOTAL DE ADQUISICIÓN 17.248,09 € — Precio del trastero + todos los
  //       gastos». En Ceuta con trastero independiente: «IVA (21,00%) 3150,00 €» y 18.823,09 €.
  test('REGRESIÓN (cálculo) — en Canarias, Ceuta y Melilla no puede liquidarse IVA', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Primera mano/ }).click();
    await selectCcaa(page).selectOption('canarias');
    await rellenar(page, 'Precio del trastero', '15000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');

    // El aviso SÍ está: es el cálculo el que no se enteró.
    await expect(page.getByText(/no se aplica el IVA/)).toBeVisible();

    // Ninguna tarjeta puede titularse «IVA» ni poner cifra a ese impuesto…
    await expect(page.locator('h3', { hasText: /^IVA/ })).toHaveCount(0);
    // …y el total no puede presentarse como completo mientras falte el impuesto indirecto.
    const total = await page.locator('h3', { hasText: /COSTE TOTAL/ }).first().innerText();
    expect(total).toMatch(/PARCIAL/i);
  });

  // ✅ REPARADO 27/08 (medio) — dato.
  // El único `<DataReference>` de la página declara «ITP/AJD/IVA 2026» con
  // FISCAL_INMUEBLES_META (verificado 17/06/2026), pero la pestaña Vendedor emite dos cifras
  // normativas más con vigencia y verificación PROPIAS y sin ninguna referencia: la plusvalía
  // municipal, calculada con COEFICIENTES_IIVTNU_2025 y PLUSVALIA_MUNICIPAL_META
  // (RDL 26/2021; ese módulo declara `verificado: '2025-01-15'` y `vigencia: '2025'`, y avisa
  // de que los coeficientes se actualizan cada Ley de Presupuestos), y el IRPF de la ganancia
  // con TRAMOS_GANANCIAS_PATRIMONIALES_2025. La página presenta datos de 2025 bajo un sello
  // de 2026. La app hermana del garaje cerró exactamente esto (hallazgo 35) añadiendo un
  // segundo DataReference con PLUSVALIA_MUNICIPAL_META; aquí no llegó.
  // Caso: pestaña Vendedor · 15.000/8.000 · 5 años · suelo 4.000 · total 9.000 → plusvalía
  //       170,00 € (coeficiente 0,17 de 2025) e IRPF 1022,20 € (tramos de 2025) · esperado un
  //       bloque de referencia que nombre la plusvalía municipal · obtenido un solo bloque
  //       «DATOS DE REFERENCIA — Normativa aplicada: ITP/AJD/IVA 2026 · última verificación
  //       17/06/2026», que no cubre ninguna de las dos.
  test('REGRESIÓN (dato) — la plusvalía municipal y el IRPF se publican sin su propia referencia', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio del trastero', '15000');
    await page.getByRole('button', { name: /Vendedor/ }).click();
    await rellenar(page, 'Precio de compra original', '8000');
    await rellenar(page, 'Años de propiedad', '5');
    await rellenar(page, 'Valor catastral del suelo', '4000');
    await rellenar(page, 'Valor catastral total (suelo + construcción)', '9000');
    // Plusvalía, método objetivo: 4.000 × 0,18 (coeficiente de 5 años del art. 107.4 TRLRHL,
    //   redacción del RDL 8/2023; hasta el 24/09/2026 la app usaba 0,17, hallazgo 1559)
    //   = 720 de base × 25 % (PLUSVALIA_MUNICIPAL_META.tipoOrientativo) = 180,00 €.
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('180,00 €');

    // ⚠️ El acta anotaba aquí 1022,20 €, y esa cifra NO sale de ningún camino: estaba dentro
    // de un `test.fail()`, donde basta con que el test falle en ALGÚN punto, así que la
    // aserción nunca llegó a comprobarse. Resuelto a mano con el art. 35 LIRPF:
    //   comisión (3 % por defecto)  = 15.000 × 0,03            =    450,00
    //   valor de transmisión        = 15.000 − 450 − 180       = 14.370,00
    //   valor de adquisición        = 8.000 (sin gastos declarados)
    //   ganancia                    = 14.370 − 8.000           =  6.370,00
    //   IRPF (TRAMOS_GANANCIAS_PATRIMONIALES_2025)
    //        6.000 × 19 %           =                             1.140,00
    //          370 × 21 %           =                                77,70
    //                               =                             1.217,70
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('1217,70 €');

    // Debe existir una referencia que cubra el IIVTNU, además de la de ITP/AJD/IVA.
    await expect(page.getByText(/Normativa aplicada:.*(IIVTNU|[Pp]lusval)/)).toBeVisible();
  });

  // ✅ REPARADO 27/08 (medio) — dato.
  // El consejo «Liquida los impuestos a tiempo» del bloque educativo lleva escrita a mano una
  // escala de recargos por presentación extemporánea que contradice a la calculadora canónica
  // del propio catálogo: `lib/calculadoras/recargoPresentacionTardia.ts` aplica el art. 27.2
  // LGT en la redacción de la Ley 11/2021 —1 % por cada mes completo hasta 12 meses, y 15 %
  // más intereses de demora desde el mes 13— mientras esta app anuncia «recargos automáticos
  // del 5% al 20%», que es la escala ANTERIOR a esa reforma. No hay módulo en data/fiscal con
  // este dato, así que el número vive inline pudiendo derivarse de la lógica ya existente.
  // Caso: desplegar la guía educativa → consejo «Liquida los impuestos a tiempo»: obtenido
  //       «El incumplimiento genera recargos automáticos del 5% al 20%» · esperado la escala
  //       vigente. Sobre el ITP de 900,00 € del caso de Madrid que la propia página publica,
  //       un mes de retraso son 9,00 € y la app hace temer entre 45,00 € y 180,00 €.
  test('REGRESIÓN (dato) — la escala de recargos del bloque educativo es la anterior a la Ley 11/2021', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Ver guía educativa/i }).click();
    // 07/09/2026 — el localizador buscaba la palabra «recargos» EN PLURAL, y la reparación
    // del art. 27.2 LGT (commit 13d2181b) reescribió el consejo en singular: «genera recargo
    // desde el primer día: un 1% de partida más otro 1% por cada mes completo». El texto es
    // hoy MÁS correcto que cuando se escribió esta aserción —antes se comía el 1% de partida—,
    // así que lo que se corrige es el localizador, no la app: se ancla en el título del
    // consejo, que no depende de cómo esté redactada la escala.
    const consejo = await texto(page.getByText(/Liquida los impuestos a tiempo/i).first().locator('xpath=..'));
    expect(consejo).not.toMatch(/5\s*%?\s*al\s*20\s*%/);
    expect(consejo).toMatch(/1\s*%.*mes|15\s*%/);
    // Y el 1 % de partida, que es lo que faltaba hasta el 07/09/2026 en los cuatro sitios
    // que componían el texto desde la constante.
    expect(consejo).toMatch(/1\s*%\s*de partida/);
  });

  // ✅ REPARADO 27/08 (medio) — accesibilidad. REPARACIÓN A MEDIAS del hallazgo 85 (21/08/2026).
  // Aquel hallazgo nombraba dos cosas: los `<select>` sin nombre accesible —reparados, ver la
  // regresión de más arriba— y que «los labels de "Modalidad del trastero" y "Tipo de
  // transmisión" están igualmente sueltos sobre sus grupos de botones». Esa segunda mitad
  // sigue igual: los dos `<label>` no tienen `for` ni envuelven ningún control, y el par de
  // botones no va dentro de ningún `role="group"` ni `<fieldset>`, así que quien navega por
  // voz oye «Vinculado a vivienda» y «Segunda mano» sin saber de qué pregunta son opciones.
  // No lo cubre `npm run check:a11y-jsx`, que vigila type=, aria-hidden y aria-pressed: los
  // tres están correctos en esta página.
  // Caso: abrir la app y evaluar en el DOM →
  //       document.querySelectorAll('[role="group"],[role="radiogroup"],fieldset').length
  //       esperado ≥ 2 · obtenido 0; y los labels sin destino son
  //       ["Modalidad del trastero", "Tipo de transmisión"] (los otros dos labels huérfanos
  //       son de NumberInput, cuyo input sí lleva aria-label).
  test('REGRESIÓN (accesibilidad) — los dos grupos de botones deben tener nombre accesible', async ({
    page,
  }) => {
    await page.goto(RUTA);
    // En segunda mano solo hay UN grupo: desde el hallazgo 595 el selector de modalidad se
    // oculta ahí, porque no cambia nada del cálculo. En primera mano vuelven a ser dos.
    expect(await page.locator('[role="group"], [role="radiogroup"], fieldset').count()).toBe(1);
    await page.getByRole('button', { name: /Primera mano/ }).click();
    const grupos = await page.locator('[role="group"], [role="radiogroup"], fieldset').count();
    expect(grupos).toBeGreaterThanOrEqual(2);
  });

  // ✅ REPARADO 27/08 (bajo) — contenido.
  // El título de la tarjeta de comisión del vendedor interpola el TEXTO CRUDO del input
  // —`Comisión inmobiliaria (${comisionInmobiliaria}%)`— en vez de pasarlo por `formatNumber`,
  // así que un porcentaje tecleado con punto decimal se publica en formato estadounidense,
  // contra la regla de formato español obligatoria. El importe sí es correcto. Es el mismo
  // resto que el garaje tenía abierto entonces (hallazgo 438, ya cerrado en la base).
  // Caso: pestaña Vendedor · precio de venta 15.000 € · compra 8.000 € · «Comisión
  //       inmobiliaria (%)» = 3.5 → esperado el título «Comisión inmobiliaria (3,5%)» ·
  //       obtenido «Comisión inmobiliaria (3.5%)», con el importe 525,00 €, que sí es
  //       correcto (15.000 × 3,5 %).
  test('REGRESIÓN (contenido) — el porcentaje de comisión se publica en formato estadounidense', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio del trastero', '15000');
    await page.getByRole('button', { name: /Vendedor/ }).click();
    await rellenar(page, 'Precio de compra original', '8000');
    await rellenar(page, 'Comisión inmobiliaria (%)', '3.5');

    // El % separado con espacio DURO desde el 26/09/2026 (hallazgo 2194): se normaliza.
    const titulo = (await page.locator('h3', { hasText: 'Comisión inmobiliaria' }).first().innerText()).replace(ESPACIO_DURO, ' ');
    expect(titulo).toContain('3,5 %');
    expect(titulo).not.toContain('3.5 %');
  });

  // ✅ REPARADO 27/08 (bajo) — operativa.
  // Mientras el campo de gestoría tiene el foco, un importe negativo se suma tal cual al total
  // y su tarjeta ni se pinta (la guarda es `gastosGestoria > 0`), así que el total en pantalla
  // no cuadra con las líneas visibles. El `min={0}` de NumberInput solo actúa en el blur. La
  // hermana `nave-industrial` cerró esto el 23/08/2026 acotando con `Math.max(0, …)` dentro
  // del useMemo, y el comentario de su código explica por qué no basta con el blur.
  // Caso: Madrid · segunda mano · 15.000 € · escribir «-500» en «Gastos de gestoría del
  //       comprador (€)» SIN salir del campo → esperado que el total siga siendo la suma de
  //       lo que se ve, 1235,59 € (900 de ITP + 276,55 de notaría + 59,03 de registro) ·
  //       obtenido «Total gastos adicionales 735,59 € — 4,90% sobre el precio» y «COSTE TOTAL
  //       DE ADQUISICIÓN 15.735,59 €», 500 € por debajo de sus propias líneas.
  test('REGRESIÓN (operativa) — una gestoría negativa con el foco puesto descuadra el total', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio del trastero', '15000');
    const gestoria = page.locator('input[aria-label="Gastos de gestoría del comprador (€)"]');
    await gestoria.fill('-500'); // sin blur: el min={0} de NumberInput aún no ha actuado

    // 900 + 262,73 + 56,63 = 1.219,36 (CASO 1, con la rebaja del nº 2.1, cabo C0209; sin ella,
    // 1.235,58 y 16.235,58)
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('1219,36 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('16.219,36 €');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN DE CIERRE — 28/08/2026.
//
// MITAD A: comprobar que la reparación del commit d787b81b (el IVA que no existe en
// Canarias, Ceuta y Melilla) es correcta Y que no se ha pasado de largo: en SEGUNDA mano
// esos territorios sí liquidan ITP, y ahí no hay nada que dejar «sin calcular».
// MITAD B: casos nuevos sobre la parte del motor que ninguna ronda había tocado — el
// método REAL de la plusvalía ganando al objetivo (art. 107.5 TRLHL), el tope del
// coeficiente del IIVTNU a los 20 años y las partidas del vendedor sin acotar.
//
// Cifras: `TIPOS_ITP_CCAA_2025` (Canarias = 6,5 %), `ITP_CCAA` (Canarias `ajd: 0.75`,
// Ceuta `ajd: 0.5` + bonificación del 50 % del art. 57 bis TRLITPAJD),
// `COEFICIENTES_IIVTNU_2025`, `PLUSVALIA_MUNICIPAL_META.tipoOrientativo` (25 %) y
// `TRAMOS_GANANCIAS_PATRIMONIALES_2025`. Aranceles: RD 1426/1989 y RD 1427/1989.
// ═════════════════════════════════════════════════════════════════════════════

test.describe('MITAD A (28/08/2026) — cierre de la reparación del impuesto que no existe', () => {
  /**
   * La reparación es CORRECTA: en Canarias la obra nueva no devenga IVA sino IGIC, así que
   * el impuesto indirecto se queda sin cifra y el total se rotula parcial. Lo que sí se
   * sigue cobrando es todo lo demás, y eso es lo que se verifica línea a línea.
   */
  test('CIERRE (normal) — Canarias, primera mano, 25.000 €: IGIC sin cifra y el resto completo', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Primera mano/ }).click();
    await selectCcaa(page).selectOption('canarias');
    await rellenar(page, 'Precio del trastero', '25000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');

    // TERRITORIOS_SIN_IVA.canarias = IGIC: ninguna tarjeta puede titularse «IVA»…
    await expect(page.locator('h3', { hasText: /^IVA/ })).toHaveCount(0);
    expect(await valorTarjeta(page, 'IGIC')).toBe('No calculado');
    expect(await descripcionTarjeta(page, 'IGIC')).toContain('no rige el IVA');

    // …pero el AJD SÍ se devenga en Canarias, y sin bonificación de ciudad autónoma:
    //   25.000 × 0,75 % (ITP_CCAA.canarias.ajd) = 187,50
    expect(await valorTarjeta(page, 'AJD (0,75 %)')).toBe('187,50 €');

    // ⚠️ 26/09/2026 (hallazgo 2214, motor 242fffcd): en Canarias, Ceuta y Melilla la notaría y el
    // registro van SIN el 21 % de IVA, que allí no existe (llevan IGIC o IPSI, que la app no
    // calcula), y el coste total pasa a PARCIAL también en segunda mano.
    // Notaría — RD 1426/1989 nº 2: 90,151816 + (25.000 − 6.010,12) × 0,45 % = 175,606276, SIN IVA
    //   × 0,95 (rebaja del nº 2.1, 17/10/2026, cabo C0209) = 166,825962
    //   · factura media × 1,75 = 291,945434 · horquilla × 1,5 = 250,238943 y × 2 = 333,651924
    //   (con IVA eran 371,84, 318,72 y 424,96; sin IVA y sin la rebaja, 307,31, 263,41 y 351,21)
    expect(await tituloTarjeta24(page, /^Gastos de notaría/)).toBe('Gastos de notaría (sin IGIC)');
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('291,95 €');
    const notaria = await descripcionTarjeta(page, 'Gastos de notaría');
    expect(notaria).toContain('250,24 €');
    expect(notaria).toContain('333,65 €');

    // Registro — RD 1427/1989: 24,040484 + (25.000 − 6.010,12) × 0,175 % = 57,272774 × 0,95 =
    //   54,409135 + 6,010121 de presentación + 3,005061 de nota simple = 63,424317, SIN IVA
    //   (eran 80,21 con IVA y 66,29 sin la rebaja)
    expect(await tituloTarjeta24(page, /^Registro de la Propiedad/)).toBe('Registro de la Propiedad (sin IGIC)');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('63,42 €');

    // Total = líneas redondeadas: 0 + 187,50 + 291,95 + 63,42 + 300 = 842,87
    //   % sobre el precio = 842,87 / 25.000 = 3,3715 % (antes 939,55 y 3,76 %; sin la rebaja, 861,10)
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('842,87 €');
    const desglose = await descripcionTarjeta(page, 'Total gastos adicionales');
    expect(desglose).toContain('3,37 %');
    expect(desglose).toContain('SIN el IGIC');
    expect(desglose).toContain('SIN el IGIC de las facturas de notaría y registro');

    // Y el total tiene que decir que está incompleto, no rotularse como coste de adquisición.
    const tituloTotal = await page.locator('h3', { hasText: /COSTE TOTAL/ }).first().innerText();
    expect(tituloTotal).toMatch(/PARCIAL/i);
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('25.842,87 €');
    expect(await descripcionTarjeta(page, 'COSTE TOTAL')).toBe(
      'No incluye el IGIC: el coste real puede ser mayor. Las facturas de notaría y registro llevan además IGIC, que esta herramienta no calcula, así que cuestan más de lo que se muestra.',
    );
  });

  /**
   * La contrapartida, que es donde una reparación de este tipo se pasa de largo: en SEGUNDA
   * mano no hay IVA que quitar —la operación tributa por ITP— y Canarias tiene tipo propio.
   * Si la bandera de «territorio sin IVA» se hubiera aplicado a las dos ramas, aquí saldría
   * «No calculado» y el simulador dejaría de servir para el caso más frecuente.
   */
  test('CIERRE (contrapartida) — en Canarias la SEGUNDA mano sigue pagando ITP al 6,50 %', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await selectCcaa(page).selectOption('canarias');
    await selectPerfil(page).selectOption('general');
    await rellenar(page, 'Precio del trastero', '25000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');

    // TIPOS_ITP_CCAA_2025 → { ccaa: 'Canarias', tipo: 6.5 }. Sin escala progresiva y sin
    // bonificación de ciudad, el tipo efectivo coincide con el nominal:
    //   25.000 × 6,5 % = 1.625,00
    // Ninguno de los cuatro reducidos de Canarias es aplicable: los tres primeros exigen
    // vivienda habitual (un trastero suelto nunca lo es) y el cuarto, VPO.
    expect(await valorTarjeta(page, 'ITP (6,50 %)')).toBe('1625,00 €');
    expect(await descripcionTarjeta(page, 'ITP (6,50 %)')).toContain('Canarias');

    // El aviso de territorio sin IVA NO debe salir aquí: en ITP no hay nada que advertir.
    await expect(page.getByText(/no se aplica el IVA/)).toHaveCount(0);

    // ⚠️ 26/09/2026 (hallazgo 2214, motor 242fffcd): en Canarias, Ceuta y Melilla la notaría y el
    // registro van SIN el 21 % de IVA, que allí no existe (llevan IGIC o IPSI, que la app no
    // calcula), y el coste total pasa a PARCIAL también en segunda mano.
    // Total = 1.625 + 307,31 + 66,29 + 300 = 2.298,60 → 9,1944 % (antes 2.377,05 y 9,51 %, con
    // IVA en la notaría y el registro). El rótulo ya no es el completo: falta el IGIC de esas
    // dos facturas, que no puede ser cero, y se dice con la frase común de las siete.
    // 17/10/2026 (cabo C0209): con la rebaja del nº 2.1, 1.625 + 291,95 + 63,42 + 300 = 2.280,37
    // → 9,1215 % · coste 27.280,37.
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('2280,37 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toBe(
      '9,12 % sobre el precio — SIN el IGIC de las facturas de notaría y registro',
    );
    expect(await valorTarjeta(page, 'COSTE TOTAL (PARCIAL)')).toBe('27.280,37 €');
    expect(await descripcionTarjeta(page, 'COSTE TOTAL (PARCIAL)')).toBe('Las facturas de notaría y registro llevan además IGIC, que esta herramienta no calcula, así que cuestan más de lo que se muestra.');
  });
});

test.describe('MITAD B (28/08/2026) — zonas del motor que ninguna ronda anterior tocó', () => {
  /**
   * CASO 8 (NORMAL) — la rama de la plusvalía que faltaba: el método REAL ganando al
   * objetivo. El caso 4 del 27/08 eligió a propósito uno donde ganaba el objetivo, así que
   * la proporción catastral suelo/total del art. 107.5 TRLHL nunca había decidido el
   * resultado. De paso entra por primera vez la gestoría del VENDEDOR, que solo desde la
   * reparación del 20/08 es un campo distinto del de la gestoría del comprador.
   */
  test('CASO 8 (normal) — el método real gana al objetivo y la gestoría del vendedor resta en el art. 35.2', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio del trastero', '20000');
    await page.getByRole('button', { name: /Vendedor/ }).click();
    await rellenar(page, 'Precio de compra original', '18000');
    await rellenar(page, 'Impuestos y gastos que pagaste al comprarlo', '500');
    await rellenar(page, 'Años de propiedad', '15');
    await rellenar(page, 'Valor catastral del suelo', '6000');
    await rellenar(page, 'Valor catastral total (suelo + construcción)', '30000');
    await rellenar(page, 'Comisión inmobiliaria (%)', '4');
    await rellenar(page, 'Gestoría y certificados del vendedor (€)', '250');

    // Plusvalía municipal — los dos métodos, con el suelo pesando solo un 20 % del catastro:
    //   OBJETIVO  6.000 × 0,12 (coeficiente de 15 años) × 25 % =            180,00
    //   REAL      (20.000 − 18.000) × (6.000 / 30.000) × 25 % =            100,00
    //   el contribuyente elige el menor (art. 107.5 TRLHL) →               100,00
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('100,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toContain('Método real');

    // Valor de adquisición = 18.000 + 500 de impuestos y gastos de aquella compra = 18.500
    // Valor de transmisión = 20.000 − 800 (comisión 4 %) − 250 (gestoría propia) − 100 = 18.850
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('18.500,00 €');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('18.850,00 €');
    expect(await valorTarjeta(page, 'Comisión inmobiliaria (4 %)')).toBe('800,00 €');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('250,00 €');

    // Ganancia = 18.850 − 18.500 = 350 → primer tramo del ahorro: 350 × 19 % = 66,50
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('350,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('66,50 €');

    // Total gastos = 100 + 800 + 250 + 66,50 = 1.216,50 · neto = 20.000 − 1.216,50 = 18.783,50
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('1216,50 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('18.783,50 €');
  });

  /**
   * CASO 9 (LÍMITE) — el tope del coeficiente del IIVTNU. `COEFICIENTES_IIVTNU_2025` llega
   * hasta «20 o más años» y `calcularPlusvaliaMunicipal` acota con
   * `Math.min(Math.max(anios, 1), 20)`; el campo admite hasta 50, así que 30 años tienen que
   * dar exactamente lo mismo que 20 y no un `undefined` que caiga en un coeficiente por
   * defecto. ⚠️ 24/09/2026 (hallazgo 1559): el de «20 o más años» es 0,40 desde el RDL 8/2023
   * (art. 107.4 TRLRHL); la app usaba 0,45, de la tabla anterior.
   * La ganancia, además, cruza al segundo tramo de la base del ahorro.
   */
  test('CASO 9 (límite) — 30 años de propiedad: el coeficiente se topa en el de 20 años', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio del trastero', '25000');
    await page.getByRole('button', { name: /Vendedor/ }).click();
    await rellenar(page, 'Precio de compra original', '5000');
    await rellenar(page, 'Años de propiedad', '30');
    await rellenar(page, 'Valor catastral del suelo', '10000');
    await rellenar(page, 'Valor catastral total (suelo + construcción)', '20000');

    // OBJETIVO  10.000 × 0,40 (coeficiente de «20 o más años») × 25 % =  1.000,00
    // REAL      (25.000 − 5.000) × (10.000 / 20.000) × 25 % =            2.500,00
    // gana el objetivo → 1.000,00
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('1000,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toContain('Método objetivo');

    // Valor de transmisión = 25.000 − 750 (comisión 3 % por defecto) − 1.000 = 23.250
    // Ganancia = 23.250 − 5.000 = 18.250 → 6.000 × 19 % = 1.140 · 12.250 × 21 % = 2.572,50
    //   cuota = 3.712,50
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('23.250,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('18.250,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('3712,50 €');

    // Total gastos = 1.000 + 750 + 0 + 3.712,50 = 5.462,50 · neto = 25.000 − 5.462,50
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('5462,50 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('19.537,50 €');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// Hallazgos 483-486 de la re-inspección del 28/08/2026 — reparados.
// ═════════════════════════════════════════════════════════════════════════════

// Hallazgo 484 — reparado. El rótulo del AJD da ahora el tipo EFECTIVO
// (`ajd / precioInmueble`), no el nominal de la tabla, igual que ya hacían nave-industrial
// y estimador-compraventa-inmueble.
test('REGRESIÓN — el rótulo del AJD en Ceuta anuncia el tipo bonificado, no el nominal', async ({
  page,
}) => {
  await page.goto(RUTA);
  await page.getByRole('button', { name: /Primera mano/ }).click();
  await selectCcaa(page).selectOption('ceuta');
  await rellenar(page, 'Precio del trastero', '30000');

  // El % separado con espacio DURO desde el 26/09/2026 (hallazgo 2194): se normaliza.
  const titulo = (await page.locator('h3', { hasText: 'AJD' }).first().innerText()).replace(ESPACIO_DURO, ' ');
  expect(titulo).toContain('0,25 %');
});

// Hallazgo 483 — reparado. Sin precio de compra original, `irpfCalculado` es falso y la
// tarjeta dice «Sin calcular» en variante neutra (no «SIN CUOTA» en verde), y el neto nombra
// también el IRPF entre lo que falta, igual que ya hacía estimador-compraventa-inmueble.
test('REGRESIÓN — sin precio de compra, el IRPF no se anuncia «SIN CUOTA» en verde', async ({
  page,
}) => {
  await page.goto(RUTA);
  await rellenar(page, 'Precio del trastero', '15000');
  await page.getByRole('button', { name: /Vendedor/ }).click();

  expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('Sin calcular');
});

// Hallazgo 485 — reparado. El botón «Primera mano» y el aviso de modalidad independiente
// nombran ahora el impuesto local (IGIC/IPSI) en vez de prometer un IVA que allí no existe.
test('REGRESIÓN — en Canarias el botón no ofrece un tipo de IVA', async ({
  page,
}) => {
  await page.goto(RUTA);
  await page.getByRole('button', { name: /Primera mano/ }).click();
  await selectCcaa(page).selectOption('canarias');

  const rotulo = await texto(page.getByRole('button', { name: /Primera mano/ }));
  expect(rotulo).not.toMatch(/IVA\s*\d/);
});

// Hallazgo 486 — reparado. La comisión y la gestoría del VENDEDOR se acotan ahora con
// `Math.max(0, …)` dentro del useMemo, igual que el 457 ya acotó la gestoría del comprador.
test('CASO 10 (debe rechazarse) — una comisión negativa con el foco puesto ya no infla el neto', async ({
  page,
}) => {
  await page.goto(RUTA);
  await rellenar(page, 'Precio del trastero', '15000');
  await page.getByRole('button', { name: /Vendedor/ }).click();
  await rellenar(page, 'Precio de compra original', '8000');
  const comision = page.locator('input[aria-label="Comisión inmobiliaria (%)"]');
  await comision.fill('-10'); // sin blur: el min={0} de NumberInput aún no ha actuado

  expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('13.650,00 €');
});

// ═════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 30/08/2026 — la cola invalidó la anterior tras la reparación del
// clúster de compraventa (commit 0828da3e, «tanda 2»). Se re-verifica DESDE CERO que
// los cinco hallazgos de aquella tanda están cerrados en ESTA app y se abren tres
// casos nuevos, resueltos a mano ANTES de tocar el navegador.
//
// Los tres casos eligen a propósito territorio y precio que ninguna ronda anterior
// había usado (Murcia y Melilla; 40.000 € y 30.000 €), para que las cifras no puedan
// venir copiadas de un caso ya escrito.
//
// De dónde sale cada cifra esperada:
//  - Tipo general de Murcia (7,75 %) → `TIPOS_ITP_CCAA_2025` en `data/fiscal/inmuebles.ts`,
//    leído por `tipoGeneralDe()`. La Ley 3/2025 lo bajó del 8 % con efectos 25/07/2025.
//  - Melilla → `ITP_CCAA.melilla` (tipoGeneral 6, reducido «Bonificación general 50%» del
//    3 %, `ajd: 0.5`) y `aplicarBonificacionCiudad` (art. 57 bis TRLITPAJD, 50 % de la
//    cuota gradual de AJD cuando el Registro radica allí) → AJD efectivo 0,25 %.
//  - Melilla no liquida IVA sino IPSI → `TERRITORIOS_SIN_IVA` en `data/itp-ccaa.ts`.
//  - Aranceles → `ARANCELES_NOTARIO` (RD 1426/1989 nº 2) × `FACTURA_NOTARIAL` (×1,5-×2,
//    tarjeta = punto medio ×1,75) y `ARANCELES_REGISTRO` (RD 1427/1989 nº 2) +
//    `REGISTRO_CONCEPTOS` (presentación 6,010121 € y nota simple 3,005061 €). Ambos
//    terminan en `× 1.21` de IVA.
//  - IRPF de la ganancia → `calcularGananciaInmueble` (art. 35 LIRPF) sobre
//    `TRAMOS_GANANCIAS_PATRIMONIALES_2025` (19 % hasta 6.000 · 21 % hasta 50.000).
// ═════════════════════════════════════════════════════════════════════════════

test.describe('RE-INSPECCIÓN 30/08/2026 — casos nuevos y cierre de la tanda 2', () => {
  /**
   * CASO 11 (NORMAL, península) — Murcia, la comunidad cuyo tipo general se movió en 2025
   * (8 % → 7,75 %) y que ninguna ronda anterior había ejercitado. Precio 40.000 €, que cruza
   * el tercer tramo de los dos aranceles y por tanto los ejercita más allá de la cuota fija.
   */
  test('CASO 11 (normal) — Murcia, segunda mano, 40.000 €, comprador general', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await selectCcaa(page).selectOption('murcia');
    await selectPerfil(page).selectOption('general');
    await rellenar(page, 'Precio del trastero', '40000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');

    // ITP = 40.000 × 7,75 % = 3.100,00. El 7,75 % es TIPOS_ITP_CCAA_2025 → { ccaa: 'Murcia',
    // tipo: 7.75 }. Murcia NO tiene escala progresiva, así que el tipo efectivo que rotula la
    // tarjeta coincide con el nominal. Ninguno de sus cuatro reducidos se aplica: los tres de
    // colectivo exigen «Vivienda habitual» (y la app pasa `viviendaHabitual: false`, porque un
    // trastero suelto nunca lo es) y el cuarto es VPO.
    expect(await valorTarjeta(page, 'ITP (7,75 %)')).toBe('3100,00 €');
    expect(await descripcionTarjeta(page, 'ITP (7,75 %)')).toContain('Región de Murcia');

    // Con perfil general y ningún reducido al alcance de cualquiera, no hay oportunidad que
    // ofrecer: el aviso «Podrías pagar menos» NO debe salir.
    await expect(page.getByText(/Podrías pagar menos/)).toHaveCount(0);

    // Notaría — RD 1426/1989 nº 2 (ARANCELES_NOTARIO), tres tramos:
    //   tramo 1 (hasta 6.010,12 €)                →                        90,151816
    //   tramo 2 (6.010,12→30.050,61, 0,45 %)      → 24.040,49 × 0,0045 =      108,182205
    //   tramo 3 (30.050,61→40.000, 0,15 %)        →  9.949,39 × 0,0015 =       14,924085
    //   escala del nº 2.1                         =                           213,258106
    //   rebaja del 5 % del nº 2.1 (17/10/2026, cabo C0209) × 0,95 =           202,595201
    //   con el 21 % de IVA                        = × 1,21 =                  245,140193
    // FACTURA_NOTARIAL: ×1,5 = 367,710290 · ×2 = 490,280386 · medio ×1,75 = 429,000338
    // (sin la rebaja: 451,57 · 387,06 · 516,08)
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('429,00 €');
    const notaria = await descripcionTarjeta(page, 'Gastos de notaría');
    expect(notaria).toContain('367,71 €');
    expect(notaria).toContain('490,28 €');

    // Registro — RD 1427/1989 nº 2 (ARANCELES_REGISTRO) + los dos fijos de REGISTRO_CONCEPTOS:
    //   tramo 1                                   →                        24,040484
    //   tramo 2 (0,175 %)                         → 24.040,49 × 0,00175 =      42,0708575
    //   tramo 3 (0,125 %)                         →  9.949,39 × 0,00125 =      12,4367375
    //   inscripción                               =                            78,548079
    //   × 0,95 (rebaja del nº 2.1)                =                            74,620675
    //   + presentación 6,010121 + nota simple 3,005061 =                       83,635857
    //   con el 21 % de IVA                        = 83,635857 × 1,21 =        101,199387
    //   (sin la rebaja, 105,95)
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('101,20 €');

    // En segunda mano no hay AJD: ITP y AJD son incompatibles en la misma transmisión.
    await expect(page.locator('h3', { hasText: 'AJD' })).toHaveCount(0);

    // Total = 3.100 + 429,00 + 101,20 + 300 = 3.930,20 (líneas ya redondeadas)
    //   % sobre el precio = 3.930,20 / 40.000 = 9,8255 %
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('3930,20 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('9,83 %');

    // Coste total = 40.000 + 3.930,20 = 43.930,20
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('43.930,20 €');

    // Cierre de la tanda 2 (hallazgo 457/477): con la gestoría en negativo y SIN salir del
    // campo, el total tiene que seguir siendo la suma de las líneas visibles —la tarjeta de
    // gestoría desaparece— y no bajar 500 € por debajo de ellas.
    const gestoria = page.locator('input[aria-label="Gastos de gestoría del comprador (€)"]');
    await gestoria.fill('-500'); // sin blur: el min={0} de NumberInput aún no ha actuado
    // 3.100 + 429,00 + 101,20 + 0 = 3.630,20
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('3630,20 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('43.630,20 €');
    await expect(page.locator('h3', { hasText: 'Gastos de gestoría' })).toHaveCount(0);
  });

  /**
   * CASO 12 (RÉGIMEN ESPECIAL) — Melilla, el territorio donde se cruzan los tres arreglos de
   * la tanda 2 a la vez: allí no rige el IVA sino el IPSI (TERRITORIOS_SIN_IVA), el AJD va
   * bonificado al 50 % por el art. 57 bis TRLITPAJD y la cuota de ITP también. Se comprueban
   * las dos ramas, porque una reparación de «aquí no hay IVA» se pasa de largo justo en la
   * segunda mano, donde sí hay un ITP que liquidar.
   */
  test('CASO 12 (régimen especial) — Melilla, 30.000 €: IPSI sin cifra, AJD bonificado e ITP al 3 %', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Primera mano/ }).click();
    await selectCcaa(page).selectOption('melilla');
    await rellenar(page, 'Precio del trastero', '30000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');

    // El botón no puede ofrecer un tipo de IVA donde no hay IVA (hallazgo 485/490):
    // `Paga ${TERRITORIOS_SIN_IVA[ccaa].impuesto}` → «Paga IPSI», ni «Paga IVA 10%».
    const rotulo = await texto(page.getByRole('button', { name: /Primera mano/ }));
    expect(rotulo).toContain('Paga IPSI');
    expect(rotulo).not.toMatch(/IVA/);

    // Y el impuesto indirecto se queda SIN CIFRA, no se inventa un 10 % ni un 21 %.
    await expect(page.locator('h3', { hasText: /^IVA/ })).toHaveCount(0);
    expect(await valorTarjeta(page, 'IPSI')).toBe('No calculado');
    expect(await descripcionTarjeta(page, 'IPSI')).toContain('no rige el IVA');
    await expect(page.getByText(/no se aplica el IVA/)).toBeVisible();

    // AJD — ITP_CCAA.melilla.ajd = 0.5, y `calcularAJD` aplica la bonificación del 50 %
    // del art. 57 bis.1 TRLITPAJD: 30.000 × 0,5 % = 150 → × 0,5 = 75,00.
    // El rótulo tiene que dar el tipo EFECTIVO (75 / 30.000 = 0,25 %), no el 0,5 % nominal
    // de la tabla, que era el hallazgo 484 de la tanda 2.
    expect(await valorTarjeta(page, 'AJD (0,25 %)')).toBe('75,00 €');

    // ⚠️ 26/09/2026 (hallazgo 2214, motor 242fffcd): en Canarias, Ceuta y Melilla la notaría y el
    // registro van SIN el 21 % de IVA, que allí no existe (llevan IGIC o IPSI, que la app no
    // calcula), y el coste total pasa a PARCIAL también en segunda mano.
    // Notaría 30.000 € — 90,151816 + (30.000 − 6.010,12) × 0,45 % = 198,106276, SIN IVA
    //   × 0,95 (rebaja del nº 2.1, 17/10/2026, cabo C0209) = 188,200962
    //   · ×1,5 = 282,301443 · ×2 = 376,401924 · medio ×1,75 = 329,351684
    //   (con IVA eran 419,49; sin IVA y sin la rebaja, 346,68)
    expect(await tituloTarjeta24(page, /^Gastos de notaría/)).toBe('Gastos de notaría (sin IPSI)');
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('329,35 €');
    // Registro — (24,040484 + 23.989,88 × 0,175 %) = 66,022774 × 0,95 = 62,721635 · + 6,010121 +
    //   3,005061 = 71,736817, SIN IVA (eran 90,80 con IVA y 75,04 sin la rebaja)
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('71,74 €');

    // Total = 0 (IPSI, sin cifra) + 75 + 329,35 + 71,74 + 300 = 776,09
    //   % sobre el precio = 776,09 / 30.000 = 2,5870 % (antes 885,29 y 2,95 %; sin la rebaja, 796,72)
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('776,09 €');
    const desglose = await descripcionTarjeta(page, 'Total gastos adicionales');
    expect(desglose).toContain('2,59 %');
    expect(desglose).toContain('SIN el IPSI');
    // Y el total no puede presentarse como completo mientras falte el impuesto indirecto.
    const tituloTotal = await page.locator('h3', { hasText: /COSTE TOTAL/ }).first().innerText();
    expect(tituloTotal).toMatch(/PARCIAL/i);
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('30.776,09 €');

    // La modalidad vinculado/independiente no mueve nada aquí, así que desde el hallazgo 595
    // el selector directamente NO se pinta en los territorios sin IVA: antes se mostraba y su
    // aviso hablaba del 21 % del art. 91.Uno.1.7º LIVA, que en Melilla no rige.
    await expect(page.getByRole('button', { name: /Independiente/ })).toHaveCount(0);
    await expect(page.getByText('Modalidad del trastero')).toHaveCount(0);

    // --- La contrapartida: en SEGUNDA mano sí hay impuesto que liquidar ---
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    // `elegirTipoITP` da por cumplidas las dos condiciones del reducido melillense
    // («Inmueble situado en Melilla» y «Bonificación automática 50%»), que son de UBICACIÓN:
    //   30.000 × 3 % = 900,00 — la mitad de los 1.800 € del tipo general del 6 %.
    expect(await valorTarjeta(page, 'ITP (3,00 %)')).toBe('900,00 €');
    // El aviso de territorio sin IVA desaparece: en una transmisión por ITP no advierte nada.
    await expect(page.getByText(/no se aplica el IVA/)).toHaveCount(0);
    // Total = las líneas YA redondeadas (hallazgo 594): 900 + 329,35 + 71,74 + 300 = 1.601,09
    //   % sobre el precio = 1.601,09 / 30.000 = 5,3370 % (antes 1.710,29 con IVA en la notaría
    //   y el registro, y 1.621,72 sin la rebaja del nº 2.1), y el coste es PARCIAL: falta el IPSI
    //   de esas dos facturas (2214).
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('1601,09 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('5,34 %');
    expect(await valorTarjeta(page, 'COSTE TOTAL (PARCIAL)')).toBe('31.601,09 €');
    expect(await descripcionTarjeta(page, 'COSTE TOTAL (PARCIAL)')).toBe('Las facturas de notaría y registro llevan además IPSI, que esta herramienta no calcula, así que cuestan más de lo que se muestra.');
  });

  /**
   * CASO 13 (LÍMITE) — el precio de compra vacío o a cero en la pestaña del vendedor. Es el
   * hallazgo 483 de la tanda 2 por su cara más peligrosa: un 0 € de IRPF anunciado en verde
   * como «SIN CUOTA» se lee como una exención, cuando lo que pasa es que falta el dato con el
   * que se calcula. Se comprueba además que el neto se rotula como TECHO y nombra las DOS
   * cosas que le faltan, y que en cuanto llega el dato el cálculo aparece completo.
   */
  test('CASO 13 (límite) — sin precio de compra el IRPF no se calcula y el neto es un techo', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio del trastero', '15000');
    await page.getByRole('button', { name: /Vendedor/ }).click();

    // Campo VACÍO: `parseSpanishNumber('')` es NaN y `precioC > 0` es falso, así que
    // `irpfCalculado` es falso. Ni «SIN CUOTA» ni «0,00 €» ni «No definido» ni «NaN».
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('Sin calcular');
    expect(await descripcionTarjeta(page, 'IRPF sobre ganancia')).toContain(
      'NO está incluido en el neto',
    );
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('SIN CALCULAR');
    // Sin valor de adquisición no se pintan las tarjetas del art. 35 LIRPF.
    await expect(page.locator('h3', { hasText: 'Valor de adquisición' })).toHaveCount(0);
    await expect(page.locator('h3', { hasText: 'Ganancia patrimonial' })).toHaveCount(0);
    await expect(page.getByText('No definido')).toHaveCount(0);
    expect(await page.locator('body').innerText()).not.toContain('NaN');

    // El neto SOLO lleva la comisión del 3 % que trae por defecto: 15.000 × 3 % = 450
    //   total gastos = 0 (plusvalía sin calcular) + 450 + 0 + 0 (IRPF sin calcular) = 450
    //   neto = 15.000 − 450 = 14.550
    expect(await valorTarjeta(page, 'Comisión inmobiliaria (3 %)')).toBe('450,00 €');
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('450,00 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('14.550,00 €');
    // …y tiene que decir que es un techo, nombrando las DOS cosas que faltan.
    const neto = await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR');
    expect(neto).toContain('No descuenta');
    expect(neto).toContain('plusvalía municipal');
    expect(neto).toContain('IRPF');

    // Un 0 escrito a mano es lo mismo que el campo vacío: sigue faltando el dato.
    await rellenar(page, 'Precio de compra original', '0');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('Sin calcular');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('14.550,00 €');

    // Y con el dato puesto, el cálculo aparece entero (art. 35 LIRPF):
    //   valor de adquisición = 8.000 · valor de transmisión = 15.000 − 450 = 14.550
    //   ganancia = 6.550 → 6.000 × 19 % + 550 × 21 % = 1.140 + 115,50 = 1.255,50
    //   total gastos = 0 + 450 + 0 + 1.255,50 = 1.705,50 · neto = 15.000 − 1.705,50
    await rellenar(page, 'Precio de compra original', '8000');
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('8000,00 €');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('14.550,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('6550,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('1255,50 €');
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('1705,50 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('13.294,50 €');
    // El neto sigue siendo techo, pero ya SOLO por la plusvalía.
    const neto2 = await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR');
    expect(neto2).toContain('plusvalía municipal');
    expect(neto2).not.toContain('IRPF');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// Reparados el 30/08/2026 (Inspector, ronda 8, hallazgos 526-527).
// ═════════════════════════════════════════════════════════════════════════════

test('526 — el ejemplo de Galicia ya publica el reducido real (3 %), no un 0 % inventado', async ({
  page,
}) => {
  await page.goto(RUTA);
  await selectCcaa(page).selectOption('galicia');
  await rellenar(page, 'Precio del trastero', '12000');
  await selectPerfil(page).selectOption('joven');
  // Lo que la app SÍ hace bien: cobra el tipo general y ofrece el reducido real como
  // oportunidad, con su cifra correcta.
  expect(await valorTarjeta(page, 'ITP (8,00 %)')).toBe('960,00 €');
  expect(await texto(page.locator('[class*="avisoReducidos"]').first())).toContain('3,00 %');

  await page.getByRole('button', { name: /Ver guía educativa/i }).click();
  const ejemplo = await texto(
    page.getByText(/Un joven de 30 años que compra un trastero en Galicia/),
  );
  expect(ejemplo).toContain('3 %');
  expect(ejemplo).not.toContain('0 %');
});

test('527 — la nota de cabecera ya no contradice el aviso de IGIC/IPSI en Melilla', async ({
  page,
}) => {
  await page.goto(RUTA);
  await selectCcaa(page).selectOption('melilla');
  const nota = await texto(page.locator('[class*="trasteroNote"]').first());
  expect(nota).toMatch(/Canarias, Ceuta y Melilla/i);
  expect(nota).not.toMatch(/que no depende de la comunidad autónoma/i);
});

// ═════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 02/09/2026 — tres casos en zonas que ninguna ronda anterior pisó.
//
// Territorio y perfil elegidos a propósito para que las cifras no puedan venir copiadas de
// un caso ya escrito: el País Vasco (el ITP más bajo de la tabla, 4 %, y el único con
// `ajd: 0`) con el perfil «discapacidad», que ninguna ronda había seleccionado; y Baleares
// en su QUINTO tramo, el 13 %, que es el techo de todas las escalas del catálogo y hasta hoy
// no lo había ejercitado ningún test de esta app.
//
// De dónde sale cada cifra esperada (ninguna de memoria):
//  - País Vasco 4 % y Baleares 8 % → `TIPOS_ITP_CCAA_2025` en `data/fiscal/inmuebles.ts`,
//    leído por `tipoGeneralDe()` en `data/itp-ccaa.ts`.
//  - Escala progresiva de Baleares (8/9/10/12/13 %) y `ajd: 0` del País Vasco → `ITP_CCAA`
//    en `data/itp-ccaa.ts`, aplicada por `calcularITPProgresivo` a través de `importeITP`.
//  - Reducidos y su elección → `elegirTipoITP` (mismo fichero), con `viviendaHabitual: false`
//    porque un trastero suelto nunca lo es.
//  - Aranceles → `ARANCELES_NOTARIO` (RD 1426/1989 nº 2) × `FACTURA_NOTARIAL` (horquilla
//    ×1,5-×2; la tarjeta enseña el punto medio ×1,75) y `ARANCELES_REGISTRO` (RD 1427/1989
//    nº 2) + `REGISTRO_CONCEPTOS` (presentación 6,010121 € y nota simple 3,005061 €). Los
//    dos terminan en `× 1.21` de IVA.
//  - Plusvalía municipal → `calcularPlusvaliaMunicipal` sobre `COEFICIENTES_IIVTNU_2025`
//    (1 año → 0,13) y `PLUSVALIA_MUNICIPAL_META.tipoOrientativo` = 25 %.
//  - IRPF → `calcularGananciaInmueble` (art. 35 LIRPF) sobre
//    `TRAMOS_GANANCIAS_PATRIMONIALES_2025` (19 % hasta 6.000 · 21 % hasta 50.000).
// ═════════════════════════════════════════════════════════════════════════════

test.describe('RE-INSPECCIÓN 02/09/2026 — País Vasco, el tramo del 13 % y la plusvalía incompleta', () => {
  /**
   * CASO 14 (NORMAL) — País Vasco, segunda mano, 22.000 €, perfil «Persona con discapacidad».
   *
   * Dos cosas que ninguna ronda anterior había comprobado a la vez: el tipo general más bajo
   * de la tabla (4 %) y un perfil de comprador para el que esa comunidad NO tiene ningún
   * reducido con ese nombre. `elegirTipoITP` no encuentra candidatos por perfil, así que cae
   * al tipo general — y aun así tiene que ofrecer como oportunidad el reducido que no es de
   * colectivo y que un trastero sí podría alcanzar (zonas despobladas de Álava, 1,5 %, cuyas
   * condiciones no incluyen «Vivienda habitual»).
   */
  test('CASO 14 (normal) — País Vasco, segunda mano, 22.000 €, comprador con discapacidad', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await selectCcaa(page).selectOption('pais-vasco');
    await selectPerfil(page).selectOption('discapacidad');
    await rellenar(page, 'Precio del trastero', '22000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');

    // ⚠️ REESCRITO el 24/09/2026. El caso tomaba el 4 % del País Vasco, que es el tipo de las
    // VIVIENDAS y sus anejos. Un trastero de segunda mano comprado suelto no es vivienda y
    // tributa al 7 % (NF 1/2011 de Bizkaia art. 13.a; NF 18/1987 de Gipuzkoa art. 11.1.a;
    // Álava sin verificar, según la ficha de `TIPOS_ITP_CCAA_2025`), que el motor expone como
    // `ITP_CCAA['pais-vasco'].tipoGeneralNoVivienda`. Y ninguno de sus reducidos —todos de
    // vivienda— se aplica ni se ofrece: `elegirTipoITP` con `objeto: 'otro'` devuelve el
    // general sin oportunidades.
    // ITP = 22.000 × 7 % = 1.540,00
    expect(await valorTarjeta(page, 'ITP (7,00 %)')).toBe('1540,00 €');
    expect(await descripcionTarjeta(page, 'ITP (7,00 %)')).toContain('País Vasco');
    await expect(page.locator('[class*="avisoReducidos"]')).toHaveCount(0);

    // Notaría — RD 1426/1989 nº 2 (ARANCELES_NOTARIO), dos tramos:
    //   tramo 1 (hasta 6.010,12 €)             →                        90,151816
    //   tramo 2 (6.010,12→30.050,61, 0,45 %)   → 15.989,88 × 0,0045 =       71,95446
    //   escala del nº 2.1                      =                          162,106276
    //   rebaja del 5 % del nº 2.1 (17/10/2026, cabo C0209) × 0,95 =       154,000962
    //   con el 21 % de IVA                     = × 1,21 =                 186,341164
    // FACTURA_NOTARIAL: ×1,5 = 279,511746 · ×2 = 372,682328 · medio ×1,75 = 326,097037
    // (sin la rebaja: 343,26 · 294,22 · 392,29)
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('326,10 €');
    const notaria = await descripcionTarjeta(page, 'Gastos de notaría');
    expect(notaria).toContain('279,51 €');
    expect(notaria).toContain('372,68 €');

    // Registro — RD 1427/1989 nº 2 (ARANCELES_REGISTRO) + los dos fijos de REGISTRO_CONCEPTOS:
    //   tramo 1                                →                        24,040484
    //   tramo 2 (0,175 %)                      → 15.989,88 × 0,00175 =      27,98229
    //   inscripción                            =                            52,022774
    //   × 0,95 (rebaja del nº 2.1)             =                            49,421635
    //   + presentación 6,010121 + nota simple 3,005061 =                     58,436817
    //   con el 21 % de IVA                     = 58,436817 × 1,21 =         70,708549
    //   (sin la rebaja, 73,86)
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('70,71 €');

    // ITP_CCAA['pais-vasco'].ajd = 0, y además es segunda mano: no hay tarjeta de AJD.
    await expect(page.locator('h3', { hasText: 'AJD' })).toHaveCount(0);

    // Total = 1.540 + 326,10 + 70,71 + 300 = 2.236,81 (la app suma las partidas ya redondeadas
    //   a céntimo; sin la rebaja eran 2.257,12)
    //   % sobre el precio = 2.236,81 / 22.000 = 10,1673 %
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('2236,81 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('10,17 %');

    // Coste total = 22.000 + 2.236,81 = 24.236,81
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('24.236,81 €');
  });

  /**
   * CASO 15 (LÍMITE) — Baleares, 2.500.000 €: el TRAMO MÁS ALTO de todas las escalas del
   * catálogo. `ITP_CCAA.baleares.tramosProgresivos` es la única escala de cinco tramos, y su
   * quinto (13 %) marca el máximo que cita `FISCAL_INMUEBLES_META.nota`. Es también donde más
   * se separan el tipo plano y el progresivo: el 8 % nominal daría 200.000 € y la escala da
   * 275.000 €, 75.000 € de diferencia.
   *
   * El precio es deliberadamente absurdo para un trastero: lo que se prueba es la ARITMÉTICA
   * de la escala, y solo por encima de 2.000.000 € se alcanza el quinto tramo.
   */
  test('CASO 15 (límite) — Baleares, 2.500.000 €: los cinco tramos hasta el 13 %', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await selectCcaa(page).selectOption('baleares');
    await selectPerfil(page).selectOption('general');
    await rellenar(page, 'Precio del trastero', '2500000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');

    // La app tiene que ANUNCIAR la escala que va a aplicar, con sus cinco tipos.
    // Desde el 24/09/2026 la frase la escribe `describirSubidaITP` del motor, con el espacio
    // antes del % (hallazgos 1581 y 1602: distingue la escala del umbral de Valencia).
    await expect(page.getByText('8 % → 9 % → 10 % → 12 % → 13 %')).toBeVisible();

    // ITP progresivo (calcularITPProgresivo sobre ITP_CCAA.baleares.tramosProgresivos):
    //         0 →   400.000  (  400.000) ×  8 % =  32.000
    //   400.000 →   600.000  (  200.000) ×  9 % =  18.000
    //   600.000 → 1.000.000  (  400.000) × 10 % =  40.000
    // 1.000.000 → 2.000.000  (1.000.000) × 12 % = 120.000
    // 2.000.000 → 2.500.000  (  500.000) × 13 % =  65.000
    //                                     TOTAL = 275.000,00
    //   tipo EFECTIVO = 275.000 / 2.500.000 = 11,00 % — y tiene que ser el efectivo el que
    //   rotule la tarjeta: el 8 % nominal de la tabla desmentiría a la cifra de al lado.
    expect(await valorTarjeta(page, 'ITP (11,00 %)')).toBe('275.000,00 €');
    expect(await descripcionTarjeta(page, 'ITP (11,00 %)')).toContain('Islas Baleares');

    // Ningún reducido de Baleares está al alcance: los cuatro llevan `valorMaximo: 270151`,
    // muy por debajo de este precio, así que ni se aplican ni se ofrecen como oportunidad.
    await expect(page.getByText(/Podrías pagar menos/)).toHaveCount(0);

    // Notaría — ARANCELES_NOTARIO, seis tramos acumulados hasta 2.500.000 €:
    //   90,151816 + 24.040,49×0,45 % + 30.050,60×0,15 % + 90.151,82×0,10 %
    //         + 450.759,07×0,05 % + 1.898.987,90×0,03 %
    //   = 90,151816 + 108,182205 + 45,0759 + 90,15182 + 225,379535 + 569,69637 = 1.128,637646
    //   × 0,95 (rebaja del nº 2.1, 17/10/2026, cabo C0209) = 1.072,205764
    //   con el 21 % de IVA = 1.297,368974 · medio ×1,75 = 2.270,395704
    //   horquilla: ×1,5 = 1.946,053461 · ×2 = 2.594,737948
    //   (sin la rebaja: 2.389,89 · 2.048,47 · 2.731,30)
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('2270,40 €');
    const notaria = await descripcionTarjeta(page, 'Gastos de notaría');
    expect(notaria).toContain('1946,05 €');
    expect(notaria).toContain('2594,74 €');

    // Registro — ARANCELES_REGISTRO, seis tramos acumulados:
    //   24,040484 + 24.040,49×0,175 % + 30.050,60×0,125 % + 90.151,82×0,075 %
    //         + 450.759,07×0,030 % + 1.898.987,90×0,020 %
    //   = 24,040484 + 42,0708575 + 37,56325 + 67,613865 + 135,227721 + 379,79758 = 686,313758
    //   sigue por DEBAJO del tope REGISTRO_MAXIMO (2.181,673939), así que no se recorta
    //   × 0,95 (rebaja del nº 2.1) = 651,998070
    //   + presentación 6,010121 + nota simple 3,005061 = 661,013252
    //   con el 21 % de IVA = 799,826034 (sin la rebaja, 841,35)
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('799,83 €');

    // Total = 275.000 + 2.270,40 + 799,83 + 300 = 278.370,23 (líneas ya redondeadas)
    //   % sobre el precio = 278.370,23 / 2.500.000 = 11,134809 %
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('278.370,23 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('11,13 %');

    // Coste total = 2.500.000 + 278.370,23 = 2.778.370,23
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('2.778.370,23 €');
  });

  /**
   * CASO 16 (DEBE RECHAZARSE) — la plusvalía municipal con UN solo dato ausente.
   *
   * Los años de propiedad son el multiplicador de la base objetiva (art. 107.4 TRLHL) y no
   * admiten valor por defecto: `COEFICIENTES_IIVTNU_2025` va de 0,08 a 0,45, más de cinco
   * veces de diferencia. Con el campo a 0 la app no puede inventar un coeficiente ni escribir
   * «0,00 €» —que se leería como «no pagas nada»—, y el neto no puede presentarse como
   * definitivo mientras esa partida falte.
   *
   * Se prueban las dos caras: sin el dato la plusvalía se declara SIN CALCULAR y el neto se
   * rotula como techo; con el dato puesto (1 año) aparece la cifra exacta y el neto deja de
   * ser un techo.
   *
   * ⚠️ REESCRITO el 10/09/2026. Hasta hoy este caso escribía un «0» en el campo y lo daba por
   * equivalente a «no hay dato», que es exactamente el defecto que la parte 11 dejó abierto
   * (hallazgo 682, reparado ese mismo día en bc437470):
   * desde la reparación del motor del 07/09 (hallazgo 666) el 0 es un dato VÁLIDO —la reventa
   * antes del año, coeficiente 0,14— y lo único que falta de verdad es el campo VACÍO. Lo que
   * este caso verifica sigue siendo lo mismo; lo que cambia es que el dato ausente se
   * representa como ausente.
   */
  test('CASO 16 (debe rechazarse) — sin años de propiedad no hay plusvalía: ni 0,00 € ni NaN', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio del trastero', '20000');
    await page.getByRole('button', { name: /Vendedor/ }).click();
    await rellenar(page, 'Precio de compra original', '12000');
    await rellenar(page, 'Valor catastral del suelo', '6000');
    await rellenar(page, 'Valor catastral total (suelo + construcción)', '15000');

    // Los años de propiedad son lo ÚNICO que falta, y faltan de la única forma en que un dato
    // puede faltar en un campo de texto: vacío.
    const anios = page.locator('input[aria-label="Años de propiedad"]');
    await anios.fill('');
    await anios.blur();
    await expect(anios).toHaveValue('');

    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('SIN CALCULAR');
    await expect(page.getByText('No definido')).toHaveCount(0);
    // Sobre el texto completo y en mayúsculas: `getByText('NaN')` no distingue mayúsculas y
    // casaría con «ganancia», que lleva «nan» dentro.
    expect(await page.locator('body').innerText()).not.toContain('NaN');

    // El resto del art. 35 LIRPF sí se calcula, SIN plusvalía en el valor de transmisión:
    //   comisión 3 % (la que trae por defecto) = 20.000 × 3 % = 600
    //   valor de transmisión = 20.000 − 600 − 0 = 19.400 · valor de adquisición = 12.000
    //   ganancia = 7.400 → 6.000 × 19 % + 1.400 × 21 % = 1.140 + 294 = 1.434,00
    //   total gastos = 0 (plusvalía sin calcular) + 600 + 0 + 1.434 = 2.034
    //   neto = 20.000 − 2.034 = 17.966,00
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('19.400,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('7400,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('1434,00 €');
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('2034,00 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('17.966,00 €');
    // …y ese neto TIENE que anunciarse como techo, no como lo que se recibe.
    expect(await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR')).toContain('No descuenta');

    // Con el dato puesto (1 año de tenencia):
    await rellenar(page, 'Años de propiedad', '1');
    await expect(anios).toHaveValue('1');
    // Plusvalía — el art. 107.4 TRLRHL (redacción del RDL 8/2023) da 0,15 a 1 año (hasta el
    // 24/09/2026 la app usaba 0,13, hallazgo 1559):
    //   objetivo (art. 107.4): 6.000 × 0,15 = 900 → × 25 % = 225,00
    //     (el 25 % es PLUSVALIA_MUNICIPAL_META.tipoOrientativo, no el 30 % máximo legal)
    //   real (art. 107.5): (20.000 − 12.000) × (6.000/15.000) × 25 % = 8.000 × 0,4 × 0,25 = 800
    //   el contribuyente elige el más favorable → 225,00 €
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('225,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toContain('Método objetivo');
    //   valor de transmisión = 20.000 − 600 − 225 = 19.175 · ganancia = 19.175 − 12.000 = 7.175
    //   IRPF = 6.000 × 19 % + 1.175 × 21 % = 1.140 + 246,75 = 1.386,75
    //   total gastos = 225 + 600 + 0 + 1.386,75 = 2.211,75 · neto = 20.000 − 2.211,75
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('19.175,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('7175,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('1386,75 €');
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('2211,75 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('17.788,25 €');
    // Ya no falta nada: el neto deja de ser un techo.
    expect(await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR')).toContain('realmente recibes');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// REGRESIÓN — el hallazgo 590 de la re-inspección del 02/09/2026, REPARADO ese mismo día.
// Estaba escrito con `test.fail()` afirmando lo que DEBERÍA pasar; al repararlo se le quitó
// la marca y se queda como regresión.
// ═════════════════════════════════════════════════════════════════════════════

// ✅ REPARADO (medio) — operativa.
// Cuando la plusvalía no se puede calcular, la app manda al usuario a rellenar campos que YA
// tiene rellenos y no nombra el que de verdad falta. El texto de la tarjeta es fijo —«No
// calculada (faltan datos)»— y el del neto también: «añade los años de propiedad y el valor
// catastral del suelo». La guarda del `useMemo`, en cambio, exige TRES cosas
// (`valorSuelo > 0 && anios > 0 && precioC > 0`), y el precio de compra original no aparece
// en ninguno de los dos mensajes.
// Es el hallazgo 437, que la app hermana `simulador-gastos-compraventa-garaje` reparó
// construyendo la lista `faltan` con lo que de verdad está vacío («No calculada (falta el
// valor catastral del suelo)», etc.). A esta app no llegó.
// Caso: 20.000 € de venta · 12.000 € de compra · suelo 6.000 · total catastral 15.000 · años
//       de propiedad VACÍO → esperado que el aviso nombre los años de propiedad y NO mande a
//       rellenar el valor catastral del suelo, que ya vale 6.000 · obtenido «No calculada
//       (faltan datos)» en la tarjeta y «Techo: aún NO incluye la plusvalía municipal (añade
//       los años de propiedad y el valor catastral del suelo)» sobre un neto de 17.966,00 €.
test(
  'REGRESIÓN (operativa) — el aviso de plusvalía nombra el campo que de verdad falta',
  async ({ page }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio del trastero', '20000');
    await page.getByRole('button', { name: /Vendedor/ }).click();
    await rellenar(page, 'Precio de compra original', '12000');
    await rellenar(page, 'Valor catastral del suelo', '6000');
    await rellenar(page, 'Valor catastral total (suelo + construcción)', '15000');
    // Los años de propiedad son lo ÚNICO que falta.
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('SIN CALCULAR');

    // La aserción de fondo: no se puede pedir un dato que el usuario ya ha dado.
    const neto = await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR');
    expect(neto).not.toContain('valor catastral del suelo');
  },
);

// ═════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 07/09/2026 — la cola la reabrió tras la reparación del clúster de
// compraventa (commit 0dba12c9) y la del recargo del art. 27.2 LGT (13d2181b), que
// tocó el bloque educativo de esta app.
//
// Tres casos NUEVOS, resueltos a mano ANTES de tocar el navegador, en territorio y
// perfil que ninguna ronda anterior había usado (Cantabria y Aragón; 55.000 €,
// 400.000 € y 450.000 €), para que ninguna cifra pueda venir copiada de un caso ya
// escrito.
//
// De dónde sale cada cifra esperada (ninguna de memoria):
//  - Tipo general de Cantabria (9 %) y de Aragón (8 %) → `TIPOS_ITP_CCAA_2025` en
//    `data/fiscal/inmuebles.ts`, leído por `tipoGeneralDe()` en `data/itp-ccaa.ts`.
//  - Escala progresiva de Aragón → `ITP_CCAA.aragon.tramosProgresivos`
//    ([{ hasta: 400000, tipo: 8 }, { hasta: Infinity, tipo: 10 }]).
//  - Tipos reducidos de Cantabria y sus condiciones → `ITP_CCAA.cantabria.tiposReducidos`.
//    Ninguno se aplica: los tres que casan con «familia numerosa» exigen «Vivienda
//    habitual», y `elegirTipoITP` recibe `viviendaHabitual: false` porque un trastero
//    suelto nunca lo es.
//  - Aranceles → `ARANCELES_NOTARIO` (RD 1426/1989 nº 2) × `FACTURA_NOTARIAL`
//    (×1,5 a ×2; la tarjeta enseña el punto medio ×1,75) y `ARANCELES_REGISTRO`
//    (RD 1427/1989 nº 2) + `REGISTRO_CONCEPTOS` (presentación 6,010121 € y nota simple
//    3,005061 €). Ambos terminan en `× 1.21` de IVA.
//  - Ganancia patrimonial e IRPF → `calcularGananciaInmueble` (arts. 34-36 LIRPF) sobre
//    `TRAMOS_GANANCIAS_PATRIMONIALES_2025` (19 % hasta 6.000 · 21 % hasta 50.000).
//  - Plusvalía municipal → `calcularPlusvaliaMunicipal` sobre `COEFICIENTES_IIVTNU_2025`
//    y `PLUSVALIA_MUNICIPAL_META.tipoOrientativo` (25 %).
// ═════════════════════════════════════════════════════════════════════════════

test.describe('RE-INSPECCIÓN 07/09/2026 — Cantabria, la frontera de la escala de Aragón y unos años negativos', () => {
  /**
   * CASO 17 (NORMAL) — Cantabria, comunidad que ninguna ronda había ejercitado, con el
   * perfil «Familia numerosa», que hasta hoy solo se había probado en el País Vasco con
   * discapacidad. Precio 55.000 €, dentro del tercer tramo de los dos aranceles, y una
   * gestoría distinta de la que trae por defecto (250 € en vez de 300 €).
   *
   * Lo que se comprueba de fondo: que un perfil con derecho a un 4 % NO se lo lleve, porque
   * los tres reducidos de Cantabria que casan con «familia» exigen vivienda habitual y un
   * trastero suelto no lo es. Equivocarse aquí por defecto son 2.750 € de menos en el
   * presupuesto (55.000 × 4 % = 2.200 frente a 55.000 × 9 % = 4.950).
   */
  test('CASO 17 (normal) — Cantabria, segunda mano, 55.000 €, familia numerosa', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await selectCcaa(page).selectOption('cantabria');
    await selectPerfil(page).selectOption('familia-numerosa');
    await rellenar(page, 'Precio del trastero', '55000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '250');

    // ITP = 55.000 × 9 % = 4.950. El 9 % es TIPOS_ITP_CCAA_2025 → { ccaa: 'Cantabria', tipo: 9 }.
    // Cantabria no tiene escala progresiva, así que el tipo efectivo coincide con el nominal.
    expect(await valorTarjeta(page, 'ITP (9,00 %)')).toBe('4950,00 €');
    expect(await descripcionTarjeta(page, 'ITP (9,00 %)')).toContain('Cantabria');

    // Notaría — RD 1426/1989, número 2 (ARANCELES_NOTARIO):
    //   tramo 1 (hasta 6.010,12 €)             →                          90,151816
    //   tramo 2 (6.010,12→30.050,61, 0,45 %)   → 24.040,49 × 0,0045 =        108,182205
    //   tramo 3 (30.050,61→55.000, 0,15 %)     → 24.949,39 × 0,0015 =         37,424085
    //   escala del nº 2.1                      =                             235,758106
    //   rebaja del 5 % del nº 2.1 (17/10/2026, cabo C0209) × 0,95 =          223,970201
    //   con el 21 % de IVA                     = × 1,21 =                    271,003943
    // FACTURA_NOTARIAL: ×1,5 = 406,505915 · ×2 = 542,007886 · medio ×1,75 = 474,256900
    // (sin la rebaja: 499,21 · 427,90 · 570,53)
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('474,26 €');
    const notaria17 = await descripcionTarjeta(page, 'Gastos de notaría');
    expect(notaria17).toContain('406,51 €');
    expect(notaria17).toContain('542,01 €');

    // Registro — RD 1427/1989, números 1, 2 y 4:
    //   tramo 1 (hasta 6.010,12 €)             →                          24,040484
    //   tramo 2 (6.010,12→30.050,61, 0,175 %)  → 24.040,49 × 0,00175 =         42,0708575
    //   tramo 3 (30.050,61→55.000, 0,125 %)    → 24.949,39 × 0,00125 =         31,1867375
    //   inscripción (número 2)                 =                              97,298079
    //   × 0,95 (rebaja del nº 2.1)             =                              92,433175
    //   + presentación 6,010121 + nota simple 3,005061 =                     101,448357
    //   con el 21 % de IVA                     = 101,448357 × 1,21 =         122,752512
    //   (sin la rebaja, 128,64)
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('122,75 €');

    // En segunda mano no hay AJD: ITP y cuota gradual de AJD son incompatibles.
    await expect(page.locator('h3', { hasText: 'AJD' })).toHaveCount(0);
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('250,00 €');

    // Total = 4.950 + 474,26 + 122,75 + 250 = 5.797,01 (líneas ya redondeadas al céntimo)
    //   % sobre el precio = 5.797,01 / 55.000 = 10,540018 %
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('5797,01 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('10,54 %');
    // Coste total = 55.000 + 5.797,01 = 60.797,01
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('60.797,01 €');

    // Y el 4 % que NO se ha aplicado tiene que enseñarse como oportunidad, con sus
    // requisitos: los dos de «familia» (que exigen vivienda habitual) y el de municipios
    // despoblados, que no la exige y por eso también entra en `alAlcanceDeCualquiera`.
    const aviso = await texto(page.locator('p', { hasText: 'Podrías pagar menos' }).first().locator('xpath=..'));
    expect(aviso).toContain('4,00 % — Familia numerosa');
    expect(aviso).toContain('4,00 % — Familia monoparental');
    expect(aviso).toContain('4,00 % — Municipios despoblados');
    expect(aviso).toContain('Vivienda habitual');
  });

  /**
   * CASO 18 (LÍMITE) — la FRONTERA exacta de una escala progresiva, que es donde un `<` en
   * lugar de un `<=` se lleva por delante el tramo siguiente o cobra de más. Aragón parte
   * en 400.000 € (8 % → 8,5 %), así que se prueba justo encima de la raya y 50.000 € más
   * arriba, donde el segundo tramo ya tiene que morder.
   *
   * A 400.000 € el tipo efectivo debe seguir siendo 8,00 % clavado; a 450.000 €, 8,06 %.
   * Si la app aplicara el tipo plano del primer tramo a todo (el defecto que `importeITP`
   * vino a cerrar), a 450.000 € cobraría 36.000 € en vez de 36.250 €.
   *
   * ⚠️ 11/09/2026: hasta ese día la escala de Aragón que aplicaba esta app tenía DOS tramos
   * (8 % hasta 400.000 € y 10 % por encima) y le faltaban los tres escalones intermedios
   * del art. 121-1. El triaje fiscal la corrigió contra el consolidado del BOE, así que el
   * segundo tramo pasó del 10 % al 8,5 % y el caso de 450.000 € bajó de 37.000 a 36.250 €.
   * La frontera que vigila este caso sigue siendo la misma; lo que cambió es cuánto muerde
   * el tramo de después — y ahora la diferencia con el tipo plano es de solo 250 €, que es
   * justamente lo que hace el caso más exigente, no menos.
   */
  test('CASO 18 (límite) — Aragón, la raya de los 400.000 € entre el 8 % y el 8,5 %', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await selectCcaa(page).selectOption('aragon');
    await selectPerfil(page).selectOption('general');
    await rellenar(page, 'Precio del trastero', '400000');

    // El recuadro de la comunidad tiene que anunciar la escala que luego aplica.
    expect(await texto(page.locator('p', { hasText: 'escala progresiva (' }).first())).toContain(
      '8 % → 8,50 % → 9 % → 9,50 % → 10 %', // `describirSubidaITP` (24/09/2026)
    );

    // ITP a 400.000 € exactos = 400.000 × 8 % = 32.000. El segundo tramo empieza DESPUÉS:
    // `calcularITPProgresivo` agota el primero (baseTramo = 400.000 − 0) y sale del bucle
    // porque al segundo le queda base 0.
    expect(await valorTarjeta(page, 'ITP (8,00 %)')).toBe('32.000,00 €');

    // Notaría — ARANCELES_NOTARIO hasta el quinto tramo:
    //   90,151816 + 24.040,49×0,0045 + 30.050,60×0,0015 + 90.151,82×0,001 + 249.746,97×0,0005
    //   = 90,151816 + 108,182205 + 45,0759 + 90,15182 + 124,873485 = 458,435226
    //   × 0,95 (rebaja del nº 2.1, 17/10/2026, cabo C0209) = 435,513465
    //   con IVA = 526,971292 · ×1,5 = 790,456938 · ×2 = 1.053,942584 · medio = 922,199761
    //   (sin la rebaja: 970,73 · 832,06 · 1.109,41)
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('922,20 €');
    const notaria18 = await descripcionTarjeta(page, 'Gastos de notaría');
    expect(notaria18).toContain('790,46 €');
    expect(notaria18).toContain('1053,94 €');

    // Registro — ARANCELES_REGISTRO hasta el quinto tramo:
    //   24,040484 + 24.040,49×0,00175 + 30.050,60×0,00125 + 90.151,82×0,00075 + 249.746,97×0,0003
    //   = 24,040484 + 42,0708575 + 37,56325 + 67,613865 + 74,924091 = 246,212547
    //   × 0,95 = 233,901920 + 6,010121 + 3,005061 = 242,917102 · con IVA = 293,929694
    //   (sin la rebaja, 308,82)
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('293,93 €');

    // Total = 32.000 + 922,20 + 293,93 + 300 (gestoría por defecto) = 33.516,13
    //   % sobre el precio = 33.516,13 / 400.000 = 8,379033 %
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('33.516,13 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('8,38 %');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('433.516,13 €');

    // Los cinco reducidos de Aragón son todos de colectivo (joven, discapacidad, víctimas
    // de violencia de género, familia numerosa y familia numerosa en medio rural) y ninguno
    // queda «al alcance de cualquiera», así que con perfil general no hay nada que ofrecer:
    // la caja de oportunidades NO debe pintarse.
    await expect(page.locator('p', { hasText: 'Podrías pagar menos' })).toHaveCount(0);

    // 50.000 € por encima de la raya, el segundo tramo ya muerde:
    //   400.000 × 8 % + 50.000 × 8,5 % = 32.000 + 4.250 = 36.250
    //   tipo EFECTIVO = 36.250 / 450.000 = 8,0555 % (el nominal, 8 %, mentiría)
    //   y coincide con la cuota acumulada que la tabla del art. 121-1 fija a los 450.000 €.
    await rellenar(page, 'Precio del trastero', '450000');
    expect(await valorTarjeta(page, 'ITP (8,06 %)')).toBe('36.250,00 €');
    // Notaría: 483,435226 × 0,95 (rebaja del nº 2.1, cabo C0209) = 459,263465 × 1,21 =
    //   555,708793 → medio ×1,75 = 972,490388 (sin la rebaja, 1.023,67)
    // Registro: 261,212547 × 0,95 + 9,015182 = 257,167102 → ×1,21 = 311,172193 (antes 326,97)
    // Total = 36.250 + 972,49 + 311,17 + 300 = 37.833,66
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('37.833,66 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('487.833,66 €');
  });

  /**
   * CASO 19 (DEBE RECHAZARSE) — años de propiedad NEGATIVOS, tecleados mientras el campo
   * conserva el foco, que es cuando el `min={1}` de NumberInput todavía no ha actuado.
   *
   * Por qué importa: `aniosPropiedad` se lee con `parseInt`, y el motor de la plusvalía
   * acota con `Math.min(Math.max(anios, 1), 20)`. Si la guarda del `useMemo` dejara pasar
   * un −5, el −5 se convertiría en el coeficiente de UN año (0,13) y la app publicaría una
   * plusvalía de aspecto normal a partir de un dato imposible. Lo correcto es tratarlo como
   * dato que falta —igual que el campo vacío del CASO 16— y decirlo.
   *
   * El resto de la pestaña sí tiene que calcular: el IRPF no depende de los años.
   */
  test('CASO 19 (debe rechazarse) — unos años de propiedad negativos no son un año de tenencia', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio del trastero', '24000');
    await page.getByRole('button', { name: /Vendedor/ }).click();
    await rellenar(page, 'Precio de compra original', '14000');
    await rellenar(page, 'Impuestos y gastos que pagaste al comprarlo', '1200');
    await rellenar(page, 'Valor catastral del suelo', '5000');
    await rellenar(page, 'Valor catastral total (suelo + construcción)', '12000');
    await rellenar(page, 'Comisión inmobiliaria (%)', '4');
    await rellenar(page, 'Gestoría y certificados del vendedor (€)', '350');
    // Sin blur: el min del NumberInput (0 desde el hallazgo 682) aún no ha corregido el valor.
    const anios = page.locator('input[aria-label="Años de propiedad"]');
    await anios.fill('-5');

    // La plusvalía NO se calcula, y no se calcula con el coeficiente de 1 año (0,13), que
    // habría dado 5.000 × 0,13 × 25 % = 162,50 €. Tampoco con el de «menos de 1 año» (0,14):
    // un año negativo se RECHAZA, no se acota a 0. Acotarlo lo convertiría en una reventa
    // antes del año y liquidaría un impuesto a partir de un dato imposible.
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('SIN CALCULAR');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toContain('años de propiedad');

    // Lo que sí se calcula (art. 35 LIRPF), con la plusvalía a 0 porque falta:
    //   valor de adquisición = 14.000 + 1.200 = 15.200
    //   comisión = 24.000 × 4 % = 960 · gestoría del vendedor = 350
    //   valor de transmisión = 24.000 − 960 − 350 − 0 = 22.690
    //   ganancia = 22.690 − 15.200 = 7.490
    //   IRPF = 6.000 × 19 % + 1.490 × 21 % = 1.140 + 312,90 = 1.452,90
    //   total gastos = 0 + 960 + 350 + 1.452,90 = 2.762,90 · neto = 24.000 − 2.762,90
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('15.200,00 €');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('22.690,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('7490,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('1452,90 €');
    expect(await valorTarjeta(page, 'Comisión inmobiliaria (4 %)')).toBe('960,00 €');
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('2762,90 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('21.237,10 €');
    // Y el neto se anuncia como techo, nombrando el campo que de verdad falta.
    const neto19 = await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR');
    expect(neto19).toContain('No descuenta');
    expect(neto19).toContain('los años de propiedad');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// REGRESIÓN — los CINCO hallazgos de la re-inspección del 07/09/2026 (637-641),
// REPARADOS el 09/09/2026. Estaban escritos con `test.fail()` afirmando lo que DEBERÍA
// pasar; al repararlos se les quitó la marca y hoy sujetan la reparación.
// ═════════════════════════════════════════════════════════════════════════════

// ✅ REPARADO 09/09/2026 (637, medio) — accesibilidad.
// El aviso de la modalidad «Independiente» lleva el color escrito a mano en un `style`
// inline (`color: '#856404'`, page.tsx:516) en vez del token `var(--text-secondary)` que usa
// su hermana del mismo panel. En modo oscuro ese marrón queda rgb(133,100,4) sobre el
// rgb(42,42,42) del panel: contraste 2,61:1, cuando WCAG AA pide 4,5:1 para texto normal
// (0,85rem). La nota hermana, con el token, rinde rgb(176,176,176) sobre el mismo fondo.
// No es decorativo: es el párrafo que avisa de que el trastero independiente paga el 21 %
// y no el 10 %, o sea la diferencia entre 1.200 € y 2.520 € en un trastero de 12.000 €.
// El CLAUDE.md global §6 exige el modo oscuro completo, y un color literal no lo tiene.
// Caso: modo oscuro (botón «Cambiar a modo oscuro») · Primera mano · Modalidad
//       «Independiente» → esperado contraste ≥ 4,5:1 · obtenido 2,61:1.
// Reparado retirando el literal: el párrafo se queda con el token del `.infoCcaaNote`,
// que en oscuro rinde rgb(176,176,176) sobre el rgb(42,42,42) del panel (6,6:1).
test(
  'REGRESIÓN 637 (accesibilidad) — el aviso de modalidad es legible en modo oscuro',
  async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Cambiar a modo oscuro/i }).first().click();
    await page.getByRole('button', { name: /Primera mano/ }).click();
    await page.getByRole('button', { name: /Independiente/ }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    const medirRatio = () =>
      page.evaluate(() => {
      const luminancia = (css: string) => {
        const [r, g, b] = (css.match(/[\d.]+/g) as string[]).slice(0, 3).map(Number).map((v) => {
          const s = v / 255;
          return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };
      const p = Array.from(document.querySelectorAll('p')).find((e) =>
        /el trastero independiente tributa al/.test(e.textContent || ''),
      );
      if (!p) return 0;
      let fondo: string | null = null;
      let el: HTMLElement | null = p.parentElement;
      while (el && !fondo) {
        const bg = getComputedStyle(el).backgroundColor;
        if (bg && !/rgba\(0, 0, 0, 0\)/.test(bg) && !/, 0\)$/.test(bg)) fondo = bg;
        el = el.parentElement;
      }
      const l1 = luminancia(getComputedStyle(p).color);
      const l2 = luminancia(fondo || 'rgb(255, 255, 255)');
      return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      });

    const ratio = await esperarEstable(medirRatio);

    expect(ratio).toBeGreaterThanOrEqual(4.5);
  },
);

// ✅ REPARADO 09/09/2026 (638, bajo) — contenido.
// La tarjeta de plusvalía compone el aviso como «No calculada (falta ...)» y le pega detrás
// una lista, así que en cuanto lo que falta es un plural —o son dos campos— el verbo no
// concuerda: «No calculada (falta los años de propiedad)» y «No calculada (falta el valor
// catastral del suelo, los años de propiedad)». Es el texto que se lee al lado de un
// «SIN CALCULAR» en una app fiscal.
// Caso: pestaña Vendedor · venta 24.000 € · compra 14.000 € · suelo 5.000 € · total
//       catastral 12.000 € · años de propiedad VACÍOS → esperado «faltan los años de
//       propiedad» · obtenido «No calculada (falta los años de propiedad)».
// Reparado marcando el número gramatical de cada campo (`CampoQueFalta`) y componiendo el
// verbo y la enumeración aparte: «faltan» con dos o más campos o con uno solo en plural, y
// «y» antes del último en vez de una coma.
test(
  'REGRESIÓN 638 (contenido) — el verbo del aviso concuerda con lo que falta',
  async ({ page }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio del trastero', '24000');
    await page.getByRole('button', { name: /Vendedor/ }).click();
    await rellenar(page, 'Precio de compra original', '14000');
    await rellenar(page, 'Valor catastral del suelo', '5000');
    await rellenar(page, 'Valor catastral total (suelo + construcción)', '12000');

    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('SIN CALCULAR');
    // Un solo campo, pero PLURAL: «faltan los años de propiedad».
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toMatch(/faltan los años de propiedad/);

    // Y con DOS campos vacíos, el verbo sigue en plural y la lista se cierra con «y», no
    // con una coma: «faltan el valor catastral del suelo y los años de propiedad».
    await rellenar(page, 'Valor catastral del suelo', '');
    const dos = await descripcionTarjeta(page, 'Plusvalía municipal');
    expect(dos).toContain('faltan el valor catastral del suelo y los años de propiedad');
  },
);

// ✅ REPARADO 09/09/2026 (639, bajo) — contenido.
// Cuando lo único que falta es el precio de compra original, ese campo bloquea a la vez la
// plusvalía y el IRPF, y el aviso del neto lo pide DOS VECES en la misma frase: «Techo: aún
// NO incluye la plusvalía municipal (añade el precio de compra original) ni el IRPF de la
// ganancia (añade el precio de compra original)». Se construye concatenando dos avisos que
// nombran cada uno sus campos, sin mirar si coinciden.
// Caso: pestaña Vendedor · venta 24.000 € · suelo 5.000 € · años 10 · precio de compra
//       VACÍO → esperado que el campo se pida una sola vez · obtenido dos veces en la
//       misma descripción, sobre un neto de 23.280,00 €.
// Reparado separando los CONCEPTOS que faltan de los CAMPOS que hay que rellenar: los dos
// conceptos se siguen nombrando («la plusvalía municipal ni el IRPF de la ganancia») y el
// campo se pide una sola vez al final.
test(
  'REGRESIÓN 639 (contenido) — el aviso del neto no pide dos veces el mismo campo',
  async ({ page }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio del trastero', '24000');
    await page.getByRole('button', { name: /Vendedor/ }).click();
    await rellenar(page, 'Valor catastral del suelo', '5000');
    await rellenar(page, 'Años de propiedad', '10');

    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('23.280,00 €');
    const neto = await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR');
    const veces = neto.split('el precio de compra original').length - 1;
    expect(veces).toBe(1);
    // Y sin perder ninguno de los dos conceptos que quedan fuera del neto.
    expect(neto).toContain('la plusvalía municipal');
    expect(neto).toContain('el IRPF de la ganancia');
  },
);

// ✅ REPARADO 09/09/2026 (640, bajo) — dato.
// El sello `DataReference` de la plusvalía cierra su nota con «El IRPF de la ganancia usa
// los tramos del ahorro de 2025 (19 % a 30 %)», con el rango TECLEADO A MANO, mientras la
// propia página ya lo deriva de `TRAMOS_GANANCIAS_PATRIMONIALES_2025` en `TIPO_AHORRO_MIN`
// y `TIPO_AHORRO_MAX` y lo publica cuatro tarjetas más abajo («Tributación en base del
// ahorro (19%-30%)») y en la tabla comparativa. Hoy los dos dicen lo mismo; el día que se
// mueva el tramo del 30 % se moverán los derivados y el sello se quedará atrás, que es
// justo lo que un sello de verificación no puede hacer. Es el hallazgo 592 sin terminar de
// drenar: aquella reparación derivó los extremos y dejó fuera el sello.
// Caso: `app/simulador-gastos-compraventa-trastero/page.tsx` → esperado que el rango salga
//       de TIPO_AHORRO_MIN/TIPO_AHORRO_MAX · obtenido el literal «(19 % a 30 %)» en el
//       `nota` del segundo DataReference, visible en pantalla junto al sello de la IIVTNU.
// Reparado interpolando `TIPO_AHORRO_MIN` y `TIPO_AHORRO_MAX` en la nota del sello: el
// rango sale ya de `TRAMOS_GANANCIAS_PATRIMONIALES_2025`, como las otras tres veces que
// aparece en la página.
test('REGRESIÓN 640 (dato) — el sello de la plusvalía deriva el rango del ahorro', async ({ page }) => {
  const { readFileSync } = await import('node:fs');
  const { join } = await import('node:path');
  const fuente = readFileSync(
    join(process.cwd(), 'app', 'simulador-gastos-compraventa-trastero', 'page.tsx'),
    'utf8',
  );
  // Ningún extremo tecleado a mano en el `nota` del sello…
  expect(fuente).not.toContain('(19 % a 30 %)');
  expect(fuente).toContain('formatNumber(TIPO_AHORRO_MIN, 0)');
  expect(fuente).toContain('formatNumber(TIPO_AHORRO_MAX, 0)');

  // …y en pantalla el sello sigue publicando el rango vigente, el mismo que la tarjeta del
  // IRPF, que ya lo derivaba (19 % a 30 % con los tramos de 2025). Desde el 26/09/2026 lo
  // publica el sello PROPIO del IRPF (GANANCIAS_PATRIMONIALES_META), no el de la plusvalía.
  await page.goto(RUTA);
  await expect(page.getByText('Escala del ahorro: del 19 % al 30 %.').first()).toBeVisible();
  await expect(page.getByText(/El IRPF de la ganancia usa los tramos/)).toHaveCount(0);
});

// ✅ REPARADO 09/09/2026 (641, bajo) — dato.
// El IVA del trastero VINCULADO se calculaba con la constante del garaje —`garageCon`, «IVA
// garaje incluido con la vivienda (hasta 2 plazas)», una regla del garaje con su propio
// límite de plazas— mientras el botón «Primera mano», la nota de cabecera, la tabla
// comparativa, la FAQ y el JSON-LD de `metadata.ts` anunciaban ese mismo tipo desde
// `obraNueva`. La propia tabla repartía las dos constantes al revés de como calculaba: fila
// «Trastero vinculado a vivienda» → `obraNueva`; fila «Garaje / Plaza de parking» →
// `garageCon`. Las dos valen 10 hoy, así que no había divergencia visible; existen separadas
// precisamente para poder divergir.
// Caso: Primera mano · Vinculado · Madrid · 12.000 € → la tarjeta cobra 1.200,00 € y se
//       describe «IVA 10% — anejo transmitido con la vivienda» leyendo una constante, mientras
//       el botón de al lado decía «Paga IVA 10%» leyendo la otra. Esperado: una sola
//       constante para el anejo residencial · obtenido: dos.
// REPARADO en dos mitades: en `data/fiscal/inmuebles.ts`, `garageCon` pasó a llamarse
// `anejoVinculado` y su comentario cubre ya el art. 91.Uno.1.7º LIVA entero (garajes de hasta
// dos plazas Y trasteros transmitidos con la vivienda); y aquí, el cálculo y TODOS los textos
// —botón, nota de cabecera, tabla, FAQ y JSON-LD— leen esa única constante.
test('REGRESIÓN 641 (dato) — el anejo residencial se calcula y se anuncia con la MISMA constante', async ({
  page,
}) => {
  const { readFileSync } = await import('node:fs');
  const { join } = await import('node:path');
  const carpeta = join(process.cwd(), 'app', 'simulador-gastos-compraventa-trastero');
  const fuente = readFileSync(join(carpeta, 'page.tsx'), 'utf8');
  const meta = readFileSync(join(carpeta, 'metadata.ts'), 'utf8');

  // El motor sigue liquidando el vinculado con `anejoVinculado`…
  const inicio = fuente.indexOf('porcentaje = modalidadTrastero');
  expect(inicio).toBeGreaterThan(-1);
  expect(fuente.slice(inicio, inicio + 160)).toContain('IVA_INMUEBLES_2025.anejoVinculado');

  // …y ni la página ni el JSON-LD pueden volver a anunciar el anejo desde `obraNueva`, que
  // es el IVA de la VIVIENDA y no el del anejo que esta app calcula.
  expect(fuente).not.toContain('IVA_INMUEBLES_2025.obraNueva');
  expect(meta).not.toContain('IVA_INMUEBLES_2025.obraNueva');
  expect(meta).toContain('IVA_INMUEBLES_2025.anejoVinculado');

  // Y en pantalla el botón y la tarjeta dicen lo mismo sobre el mismo caso:
  // Madrid (por defecto) · Primera mano · Vinculado · 12.000 € → 12.000 × 10 % = 1.200.
  await page.goto(RUTA);
  await page.getByRole('button', { name: /Primera mano/ }).click();
  await page.getByRole('button', { name: /Vinculado a vivienda/ }).click();
  await rellenar(page, 'Precio del trastero', '12000');
  expect(await valorTarjeta(page, 'IVA (10,00 %)')).toBe('1200,00 €');
  await expect(page.getByRole('button', { name: /Primera mano/ })).toContainText('Paga IVA 10 %');
});

// ═════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 10/09/2026 — CASOS 20-22.
// La cola reabrió la app tras el refactor de motores (3a507acb, 1808419c) y con una PISTA
// de efecto familia: en `simulador-gastos-compraventa-garaje` el campo «Años de propiedad»
// lleva `min={1}` y el motor lee `parseInt(aniosPropiedad) || 0`, de modo que la reventa
// antes del año es inalcanzable. La hermana `local-comercial` ya está reparada. Este bloque
// averigua de qué lado está el trastero (CASO 21) y estrena territorio y precio (CASO 20).
// ═════════════════════════════════════════════════════════════════════════════

test.describe('RE-INSPECCIÓN 10/09/2026 — Comunidad Valenciana, la reventa antes del año y un precio de compra malformado', () => {
  /**
   * CASO 20 (NORMAL) — Comunidad Valenciana, comunidad que ninguna ronda anterior había
   * elegido, y en la que además el tipo general se movió hace tres meses: `TIPOS_ITP_CCAA_2025`
   * la trae al 9 % «desde el 01/06/2026 (antes 10%)». Tiene escala progresiva declarada
   * (`tramosProgresivos` 9 % hasta 1.000.000 € y 11 % por encima), así que a 24.000 € el
   * tipo efectivo tiene que coincidir con el nominal del primer tramo y ni un céntimo más.
   */
  test('CASO 20 (normal) — Comunidad Valenciana, segunda mano, 24.000 €, comprador general', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await selectCcaa(page).selectOption('valencia');
    await selectPerfil(page).selectOption('general');
    await rellenar(page, 'Precio del trastero', '24000');
    await rellenar(page, 'Gastos de gestoría del comprador (€)', '300');

    // ITP — `calcularITPProgresivo` sobre ITP_CCAA.valencia.tramosProgresivos:
    //   los 24.000 € caben enteros en el primer tramo (hasta 1.000.000 €, 9 %)
    //   24.000 × 9 % = 2.160,00 · tipo efectivo = 2.160 / 24.000 = 9,00 %
    // Ninguno de los siete reducidos de Valencia se aplica: seis son de colectivo (joven,
    // familia, discapacidad, VPO) y el séptimo —víctimas de violencia de género, 3 %— exige
    // «Vivienda habitual», y `elegirTipoITP` recibe `viviendaHabitual: false` porque un
    // trastero suelto nunca lo es. Por eso tampoco sale el aviso «Podrías pagar menos».
    expect(await valorTarjeta(page, 'ITP (9,00 %)')).toBe('2160,00 €');
    expect(await descripcionTarjeta(page, 'ITP (9,00 %)')).toContain('Comunidad Valenciana');
    await expect(page.getByText(/Podrías pagar menos/)).toHaveCount(0);
    // Valencia no tiene escala sino UMBRAL: por encima de 1.000.000 € el 11 % grava TODO el
    // valor (art. 13 de la Ley 13/1997 valenciana, `ITP_CCAA.valencia.umbralTipoUnico`). Desde
    // el 24/09/2026 el recuadro lo dice así y no como «escala progresiva» (hallazgos 1581 y
    // 1602), aunque a este precio no se separe del tipo plano.
    await expect(page.getByText(/aplica escala progresiva/)).toHaveCount(0);
    await expect(
      page.getByText('En esta comunidad, el tipo general es del 9 %, y si el valor supera 1.000.000 € pasa al 11 % sobre TODO el valor, no solo sobre el exceso.'),
    ).toBeVisible();

    // Notaría — RD 1426/1989, número 2 (ARANCELES_NOTARIO):
    //   tramo 1 (hasta 6.010,12 €)             →                          90,151816
    //   tramo 2 (6.010,12→30.050,61, 0,45 %)   →  17.989,88 × 0,0045 =        80,95446
    //   escala del nº 2.1                      =                             171,106276
    //   rebaja del 5 % del nº 2.1 (17/10/2026, cabo C0209) × 0,95 =          162,550962
    //   con el 21 % de IVA                     = × 1,21 =                    196,686664
    // FACTURA_NOTARIAL: ×1,5 = 295,029996 · ×2 = 393,373328 · medio ×1,75 = 344,201662
    // (sin la rebaja: 362,31 · 310,55 · 414,07)
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('344,20 €');
    const notaria20 = await descripcionTarjeta(page, 'Gastos de notaría');
    expect(notaria20).toContain('295,03 €');
    expect(notaria20).toContain('393,37 €');

    // Registro — RD 1427/1989, números 1, 2 y 4 (ARANCELES_REGISTRO + REGISTRO_CONCEPTOS):
    //   tramo 1 (hasta 6.010,12 €)             →                          24,040484
    //   tramo 2 (6.010,12→30.050,61, 0,175 %)  →  17.989,88 × 0,00175 =       31,48229
    //   inscripción (número 2)                 =                              55,522774
    //   × 0,95 (rebaja del nº 2.1)             =                              52,746635
    //   + asiento de presentación (número 1)   →                               6,010121
    //   + nota simple (número 4)               →                               3,005061
    //                                          =                              61,761817
    //   con el 21 % de IVA                     = 61,761817 × 1,21 =           74,731799
    //   (sin la rebaja, 78,09)
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('74,73 €');

    // En segunda mano no hay AJD: ITP y AJD-cuota gradual son incompatibles.
    await expect(page.locator('h3', { hasText: 'AJD' })).toHaveCount(0);

    // Total gastos — `sumarLineasVisibles` redondea cada línea al céntimo ANTES de sumar,
    // que es como las ve el usuario: 2.160,00 + 344,20 + 74,73 + 300,00 = 2.878,93
    //   % sobre el precio = 2.878,93 / 24.000 = 11,9955 % → 12,00 %. (Sin la rebaja eran
    //   2.900,40 y un 12,085 % que el redondeo binario dejaba en 12,08 %.)
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('2878,93 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('12,00 %');

    // Coste total = 24.000 + 2.878,93 = 26.878,93
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('26.878,93 €');
  });

  /**
   * CASO 22 (DEBE RECHAZARSE) — un precio de compra original malformado.
   *
   * `NumberInput` filtra las letras con su regex `/^-?[\d.,]*$/`, así que lo que de verdad
   * puede llegar al motor es un número con dos separadores mal puestos. `parseSpanishNumber`
   * devuelve NaN para «1.2.3» (está en su propia documentación) y ese NaN NO puede leerse
   * como un 0: si lo fuera, el valor de adquisición sería 0, el precio de venta entero se
   * convertiría en ganancia y la app publicaría una cuota de IRPF de 3.546,60 € que no debe
   * nadie (6.000 × 19 % + 11.460 × 21 % sobre una ganancia inventada de 17.460 €). Tampoco
   * puede leerse como el 1,2 que devolvería `parseFloat`.
   *
   * Es la contrapartida del CASO 7, que probaba lo mismo en el precio del comprador.
   */
  test('CASO 22 (debe rechazarse) — «1.2.3» no es un precio de compra: ni 0 € ni 1,2 €', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio del trastero', '18000');
    await page.getByRole('button', { name: /Vendedor/ }).click();
    await rellenar(page, 'Precio de compra original', '1.2.3');
    await rellenar(page, 'Años de propiedad', '6');
    await rellenar(page, 'Valor catastral del suelo', '5000');
    await rellenar(page, 'Valor catastral total (suelo + construcción)', '12000');

    // El campo conserva lo escrito (el `handleBlur` de NumberInput solo acota min/max).
    await expect(page.locator('input[aria-label="Precio de compra original"]')).toHaveValue('1.2.3');

    // Sin precio de compra no hay incremento de valor que comparar, así que la plusvalía
    // tampoco se calcula — y el aviso nombra ESE campo, no los otros dos, que están puestos.
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('SIN CALCULAR');
    const metodo22 = await descripcionTarjeta(page, 'Plusvalía municipal');
    // Escrito pero ilegible: no «falta», no se lee (hallazgo 1285).
    expect(metodo22).toContain('el precio de compra original no se ha podido leer');
    expect(metodo22).not.toContain('valor catastral del suelo');
    expect(metodo22).not.toContain('años de propiedad');

    // El IRPF se declara sin calcular, y NO como «SIN CUOTA» en verde (hallazgo 483): un 0
    // ahí se leería como una exención. Las tarjetas de ganancia/pérdida y de valor de
    // adquisición no se pintan: no hay base sobre la que calcularlas.
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('Sin calcular');
    await expect(page.locator('h3', { hasText: 'Valor de adquisición' })).toHaveCount(0);
    await expect(page.locator('h3', { hasText: 'Ganancia patrimonial' })).toHaveCount(0);
    await expect(page.locator('h3', { hasText: 'Pérdida patrimonial' })).toHaveCount(0);

    // Lo único que sí se puede calcular es la comisión: 18.000 × 3 % (por defecto) = 540,00
    //   total gastos = 0 de plusvalía + 540 + 0 de gestoría + 0 de IRPF = 540,00
    //   neto = 18.000 − 540 = 17.460,00 — y se anuncia como TECHO, con los dos conceptos
    //   que faltan y el ÚNICO campo que hay que rellenar (hallazgo 639: no se pide dos veces).
    expect(await valorTarjeta(page, 'Comisión inmobiliaria (3 %)')).toBe('540,00 €');
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('540,00 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('17.460,00 €');
    const neto22 = await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR');
    expect(neto22).toContain('No descuenta');
    expect(neto22).toContain('la plusvalía municipal ni el IRPF de la ganancia');
    // Escrito pero ilegible: se nombra como tal y se pide corregirlo UNA vez (1285 y 639).
    expect(neto22).toContain('El precio de compra original no se ha podido leer');
    expect(neto22.match(/precio de compra original/g) ?? []).toHaveLength(1);

    // Y en ninguna parte de la página puede haber NaN. Se busca sobre el texto completo y
    // con mayúsculas: `getByText('NaN')` no distingue mayúsculas y casaría con «ganancia».
    expect(await page.locator('body').innerText()).not.toContain('NaN');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// HALLAZGO 682 de la re-inspección del 10/09/2026 — REPARADO ese mismo día (bc437470).
// Estaba marcado con `test.fail()`, afirmando lo que DEBERÍA pasar; al repararlo se le
// quitó la marca y hoy sujeta la reparación.
// ═════════════════════════════════════════════════════════════════════════════

// ✅ REPARADO 10/09/2026 (alto) — cálculo. La reventa antes del año era INALCANZABLE, y la
// app liquidaba de menos sin decirlo. Lo que sigue es el caso de origen, tal como se escribió.
//
// `COEFICIENTES_IIVTNU_2025` (data/fiscal/inmuebles.ts) tiene fila propia para la tenencia
// de menos de un año —`{ anios: 0, label: 'Menos de 1 año', coeficiente: 0.14 }`, el TERCERO
// más alto de toda la tabla, por encima del 0,13 de un año— porque desde el RDL 26/2021 esa
// transmisión SÍ tributa. El motor ya sabe atenderla: `calcularPlusvaliaMunicipal` acota con
// `Math.min(Math.max(aniosPropiedad, 0), 20)` desde la reparación del 07/09/2026 (hallazgo
// 666), y su comentario dice literalmente «las apps que usan el 0 como campo vacío filtran
// antes de llamar».
//
// Esta app es una de esas, y no ha filtrado: sigue leyendo `parseInt(aniosPropiedad) || 0`
// (page.tsx:318), que confunde el 0 explícito con el campo vacío, y su `NumberInput` declara
// `min={1}` (page.tsx:831), que al salir del campo REESCRIBE el 0 a 1 sin avisar. Las dos
// mitades se tapan la una a la otra: mientras el foco está puesto, el 0 desactiva la
// plusvalía («SIN CALCULAR»); al salir, el campo ya no dice 0 sino 1 y la app liquida con el
// coeficiente equivocado presentándolo como firme («Lo que realmente recibes tras los
// gastos»). El usuario no tiene forma de introducir el dato que la ley contempla.
//
// La hermana `simulador-gastos-compraventa-local-comercial` ya está reparada con este mismo
// patrón (`min={0}`, los años leídos del STRING y el campo vacío distinguido del 0);
// `simulador-gastos-compraventa-garaje` arrastra el defecto igual que esta.
//
// Y el error va A LA BAJA, que es el sentido irrecuperable en una herramienta fiscal: el
// contribuyente presupuesta menos de lo que la oficina liquidadora le va a pedir.
//
// Caso: Precio 15.000 € · Vendedor · compra 12.000 € · años 0 · suelo 4.000 · total 9.000
//       (comisión 3 % por defecto)
//       → esperado plusvalía 140,00 € (4.000 × 0,14 × 25 %) y neto 13.952,10 €
//       → obtenido plusvalía 130,00 € (4.000 × 0,13 × 25 %) y neto 13.960,20 €
// REPARADO el 10/09/2026 (hallazgo 682): los años se leen del STRING —el «0» explícito ya no
// se confunde con el campo vacío— y el NumberInput baja a `min={0}`, así que el blur deja de
// reescribir el 0 a «1».
test(
  'REGRESIÓN 682 (cálculo) — la reventa antes del año liquida con su coeficiente prorrateado por meses',
  async ({ page }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio del trastero', '15000');
    await page.getByRole('button', { name: /Vendedor/ }).click();
    await rellenar(page, 'Precio de compra original', '12000');
    await rellenar(page, 'Valor catastral del suelo', '4000');
    await rellenar(page, 'Valor catastral total (suelo + construcción)', '9000');

    // Cero años de tenencia: el trastero se revende antes de cumplir el año. Se sale del
    // campo a propósito, porque es el estado en el que el usuario deja el formulario.
    const anios = page.locator('input[aria-label="Años de propiedad"]');
    await anios.fill('0');
    await anios.blur();

    // ⚠️ La aserción de FONDO va primero a propósito: dentro de un `test.fail()` basta con
    // que el test falle en algún punto, así que lo que se ejecuta de verdad es la primera
    // que falla. Si la primera fuera la del valor del campo, la cifra fiscal —que es el
    // hallazgo— nunca llegaría a comprobarse (es el aviso que dejó el CASO 8 el 28/08).
    // Las tres de abajo están resueltas a mano y verificadas en navegador por separado.
    //
    // ⚠️ REESCRITO el 24/09/2026 (hallazgos 1559 y 1560). El art. 107.4 TRLRHL (redacción del
    // RDL 8/2023, BOE-A-2004-4214 consolidado) no tiene un coeficiente fijo para «menos de un
    // año»: da 0,15 y manda PRORRATEARLO por los meses completos («se prorrateará el
    // coeficiente anual teniendo en cuenta el número de meses completos»). La app aplicaba
    // 0,14 a cualquier reventa antes del año, así que ahora pregunta los meses; sin ellos la
    // plusvalía no se inventa.
    await expect(page.locator('#meses-completos')).toBeVisible();
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('SIN CALCULAR');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toContain(
      'los meses completos desde la compra',
    );

    // Con 6 meses completos:
    //   objetivo (art. 107.4): 4.000 × (0,15 × 6/12 = 0,075) = 300 → × 25 % = 75,00
    //     (el 25 % es PLUSVALIA_MUNICIPAL_META.tipoOrientativo, no el 30 % máximo legal)
    //   real (art. 107.5): (15.000 − 12.000) × (4.000/9.000) × 25 % = 3.000 × 0,4444… × 0,25
    //     = 333,33… → el contribuyente elige el más favorable: 75,00 €
    await page.locator('#meses-completos').selectOption('6');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('75,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toContain('Método objetivo');

    // Y se propaga al art. 35 LIRPF, porque la plusvalía resta del valor de transmisión:
    //   comisión = 15.000 × 3 % = 450 · valor de adquisición = 12.000
    //   valor de transmisión = 15.000 − 450 − 75 = 14.475 · ganancia = 2.475
    //   IRPF = 2.475 × 19 % (primer tramo del ahorro) = 470,25
    //   total gastos = 75 + 450 + 0 + 470,25 = 995,25 · neto = 15.000 − 995,25
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('14.475,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('2475,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('470,25 €');
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('995,25 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('14.004,75 €');

    // Segunda cara del defecto, y la que lo hace invisible: el `min={1}` reescribe a «1» el
    // dato que el usuario ha escrito, sin decir nada. Al reparar, este campo debe conservar
    // el 0 (es lo que `local-comercial` ya hace con `min={0}`).
    await expect(anios).toHaveValue('0');
  },
);

// ═════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 11/09/2026 — CASOS 23-25.
// La cola reabrió la app tras DOS commits que tocan lo que calcula:
//   · bc437470 — «la reventa antes del año ya se puede liquidar, y con su coeficiente»
//     (hallazgo 682 de esta app; el test de más arriba ya sujeta la reparación).
//   · 7a02470c — «Aragón no tiene tipos reducidos de ITP, tiene bonificaciones en cuota»,
//     que reescribió la escala del art. 121-1 de DOS tramos a CINCO (8 / 8,5 / 9 / 9,5 /
//     10 %) y los tipos efectivos de las bonificaciones en cuota.
// Territorio y perfil nuevos otra vez (Castilla y León con perfil joven, que es donde vive
// el tipo del 0,01 % —el análogo del 0 % de Madrid que dio origen a `elegirTipoITP`—), el
// TERCER escalón de la escala aragonesa recién corregida, al que ningún caso llegaba, y
// unos años de propiedad MALFORMADOS, que es el camino que la reparación del 10/09 estrenó.
// ═════════════════════════════════════════════════════════════════════════════

test.describe('RE-INSPECCIÓN 11/09/2026 — Castilla y León, el tercer escalón de Aragón y unos años malformados', () => {
  /**
   * CASO 23 (NORMAL) — Castilla y León con perfil JOVEN, la combinación que ninguna ronda
   * había ejercitado y que aquí importa por un motivo concreto: `ITP_CCAA['castilla-leon']`
   * declara un reducido del **0,01 %** («Municipios poco poblados (< 36 años)»), que es el
   * tipo más bajo de toda la tabla después del 0 % de Madrid. Es exactamente la forma del
   * defecto que hizo nacer `elegirTipoITP` el 14/08/2026: aplicar el primer reducido que
   * casa por nombre sin mirar sus condiciones dejaba el ITP en 0 en la comunidad que viene
   * por defecto. Aquí se comprueba que ese 0,01 % NO se aplica —ni el 4 % de jóvenes, que
   * exige vivienda habitual y un trastero suelto nunca lo es— y que ambos salen como
   * OPORTUNIDAD, que es el contrato de la función («se enseña como oportunidad, nunca como
   * cifra»).
   */
  test('CASO 23 (normal) — Castilla y León, segunda mano, 20.000 €, comprador joven', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await selectCcaa(page).selectOption('castilla-leon');
    await selectPerfil(page).selectOption('joven');
    await rellenar(page, 'Precio del trastero', '20000');

    // ITP — `calcularITPProgresivo` sobre ITP_CCAA['castilla-leon'].tramosProgresivos
    // (8 % hasta 250.000 €, 10 % por encima): los 20.000 € caben enteros en el primero.
    //   20.000 × 8 % = 1.600,00 · tipo efectivo = 1.600 / 20.000 = 8,00 %
    // El tipo general (8 %) sale de `TIPOS_ITP_CCAA_2025` en `data/fiscal/inmuebles.ts`,
    // leído por `tipoGeneralDe('Castilla y León')`.
    expect(await valorTarjeta(page, 'ITP (8,00 %)')).toBe('1600,00 €');
    expect(await descripcionTarjeta(page, 'ITP (8,00 %)')).toContain('Castilla y León');
    expect(await texto(page.locator('p', { hasText: 'escala progresiva (' }).first())).toContain(
      '8 % → 10 %', // `describirSubidaITP` (24/09/2026)
    );

    // Notaría — RD 1426/1989, número 2 (ARANCELES_NOTARIO):
    //   tramo 1 (hasta 6.010,12 €)            →                         90,151816
    //   tramo 2 (6.010,12→30.050,61, 0,45 %)  → 13.989,88 × 0,0045 =        62,95446
    //   escala del nº 2.1                     =                           153,106276
    //   rebaja del 5 % del nº 2.1 (17/10/2026, cabo C0209) × 0,95 =       145,450962
    //   con el 21 % de IVA                    = × 1,21 =                  175,995664
    // FACTURA_NOTARIAL: ×1,5 = 263,993496 · ×2 = 351,991328 · medio ×1,75 = 307,992412
    // (sin la rebaja: 324,20 · 277,88 · 370,51)
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('307,99 €');
    const notaria23 = await descripcionTarjeta(page, 'Gastos de notaría');
    expect(notaria23).toContain('263,99 €');
    expect(notaria23).toContain('351,99 €');

    // Registro — RD 1427/1989, números 1, 2 y 4 (ARANCELES_REGISTRO + REGISTRO_CONCEPTOS):
    //   tramo 1 (hasta 6.010,12 €)            →                        24,040484
    //   tramo 2 (6.010,12→30.050,61, 0,175 %) → 13.989,88 × 0,00175 =       24,48229
    //   inscripción (número 2)                =                            48,522774
    //   × 0,95 (rebaja del nº 2.1)            =                            46,096635
    //   + asiento de presentación 6,010121 + nota simple 3,005061 =         55,111817
    //   con el 21 % de IVA                    = 55,111817 × 1,21 =         66,685299
    //   (sin la rebaja, 69,62)
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('66,69 €');

    // Gestoría: la que trae el formulario por defecto.
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('300,00 €');

    // En segunda mano no hay AJD (ITP y cuota gradual de AJD son incompatibles).
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);

    // Total — `sumarLineasVisibles` redondea cada línea al céntimo ANTES de sumar:
    //   1.600,00 + 307,99 + 66,69 + 300,00 = 2.274,68
    //   % sobre el precio = 2.274,68 / 20.000 = 11,3734 %
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('2274,68 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('11,37 %');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('22.274,68 €');

    // Y lo que de verdad vigila este caso: los dos reducidos salen como OPORTUNIDAD y
    // ninguno se ha cobrado. Con el 0,01 % aplicado, el ITP habrían sido 2,00 € en vez de
    // 1.600,00 €; con el 4 %, 800,00 €.
    const oportunidades = page.locator('div[class*="avisoReducidos"] li');
    await expect(oportunidades).toHaveCount(2);
    expect(await texto(oportunidades.nth(0))).toContain('4,00 % — Jóvenes < 36 años');
    expect(await texto(oportunidades.nth(1))).toContain(
      '0,01 % — Municipios poco poblados (< 36 años)',
    );
    // El de municipios poco poblados enseña además su tope de valor, que sí es comprobable.
    expect(await texto(oportunidades.nth(1))).toContain('Valor máximo 150.000,00 €');
  });

  /**
   * CASO 24 (LÍMITE) — el TERCER escalón de la escala de Aragón, que es el tramo al que
   * ningún caso de este fichero llegaba: el CASO 18 se queda en la raya de los 400.000 € y
   * 50.000 € más arriba.
   *
   * Importa porque esa escala se reescribió hace dos días (commit 7a02470c, triaje fiscal
   * del 11/09/2026): tenía DOS tramos —8 % hasta 400.000 € y 10 % por encima— y el art.
   * 121-1 tiene CINCO. Con la tabla vieja, 500.000 € liquidaban 42.000 €. El comentario de
   * `ITP_CCAA['aragon']` fija los cortes contra la tabla oficial de cuota acumulada, y
   * 500.000 € es uno de los cuatro que nombra: **40.750 €**.
   */
  test('CASO 24 (límite) — Aragón, 500.000 €: el tercer escalón del art. 121-1 (40.750 €)', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await selectCcaa(page).selectOption('aragon');
    await selectPerfil(page).selectOption('general');
    await rellenar(page, 'Precio del trastero', '500000');

    // El recuadro anuncia los CINCO tramos, con la coma decimal del formato español
    // (`formatTipoNominal`, reparado en este mismo commit para las 6 apps del clúster).
    expect(await texto(page.locator('p', { hasText: 'escala progresiva (' }).first())).toContain(
      '8 % → 8,50 % → 9 % → 9,50 % → 10 %', // `describirSubidaITP` (24/09/2026)
    );

    // ITP — calcularITPProgresivo sobre los cinco tramos:
    //   400.000 × 8 %  = 32.000
    //    50.000 × 8,5 % =  4.250   (400.000 → 450.000)
    //    50.000 × 9 %   =  4.500   (450.000 → 500.000)
    //                    = 40.750,00 — la cuota acumulada que la tabla del art. 121-1
    //                      fija a los 500.000 €, y que la escala de DOS tramos daba como
    //                      42.000 € hasta el 11/09/2026.
    //   tipo EFECTIVO = 40.750 / 500.000 = 8,15 % (el nominal, 8 %, mentiría)
    expect(await valorTarjeta(page, 'ITP (8,15 %)')).toBe('40.750,00 €');
    expect(await descripcionTarjeta(page, 'ITP (8,15 %)')).toContain('Aragón');

    // Notaría — ARANCELES_NOTARIO hasta el quinto tramo:
    //   90,151816 + 24.040,49×0,0045 + 30.050,60×0,0015 + 90.151,82×0,001 + 349.746,97×0,0005
    //   = 90,151816 + 108,182205 + 45,0759 + 90,15182 + 174,873485 = 508,435226
    //   × 0,95 (rebaja del nº 2.1, 17/10/2026, cabo C0209) = 483,013465
    //   con IVA = 584,446292 · ×1,5 = 876,669438 · ×2 = 1.168,892584
    //   medio ×1,75 = 1.022,781011 (sin la rebaja: 1.076,61 · 922,81 · 1.230,41)
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('1022,78 €');
    const notaria24 = await descripcionTarjeta(page, 'Gastos de notaría');
    expect(notaria24).toContain('876,67 €');
    expect(notaria24).toContain('1168,89 €');

    // Registro — ARANCELES_REGISTRO hasta el quinto tramo:
    //   24,040484 + 24.040,49×0,00175 + 30.050,60×0,00125 + 90.151,82×0,00075 + 349.746,97×0,0003
    //   = 24,040484 + 42,0708575 + 37,56325 + 67,613865 + 104,924091 = 276,212547
    //   (por debajo del REGISTRO_MAXIMO de 2.181,673939) × 0,95 = 262,401920
    //   + 6,010121 + 3,005061 = 271,417102 · con IVA = 328,414694 (sin la rebaja, 345,12)
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('328,41 €');

    // Total = 40.750,00 + 1.022,78 + 328,41 + 300,00 = 42.401,19
    //   % sobre el precio = 42.401,19 / 500.000 = 8,480238 %
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('42.401,19 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('8,48 %');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('542.401,19 €');

    // Las cinco bonificaciones de Aragón exigen vivienda habitual (las tres del art. 121-4
    // y las dos de familia numerosa), y además topan el inmueble en 100.000 €: a este
    // precio no hay nada que ofrecer y la caja de oportunidades NO debe pintarse.
    await expect(page.locator('p', { hasText: 'Podrías pagar menos' })).toHaveCount(0);
  });

  /**
   * CASO 25 (DEBE RECHAZARSE) — unos años de propiedad MALFORMADOS.
   *
   * Es el camino que la reparación del 10/09/2026 (hallazgo 682) estrenó y que ningún caso
   * cubría: desde entonces los años se leen del STRING con `parseSpanishNumber` en vez de
   * con `parseInt(...) || 0`, y el `NumberInput` bajó a `min={0}` porque el **0 es ahora un
   * dato válido** —la reventa antes del año, coeficiente 0,14—. Justamente por eso un valor
   * ilegible no puede caer en 0: sería liquidar el tercer coeficiente más alto de
   * `COEFICIENTES_IIVTNU_2025` a partir de algo que el usuario no ha escrito. Tampoco puede
   * caer en el 1 que devolvería `parseFloat('1.2.3')`.
   *
   * `NumberInput` filtra las letras con su regex `/^-?[\d.,]*$/`, así que lo que de verdad
   * llega al motor es un número con dos separadores mal puestos; y su `handleBlur`, que sí
   * usa `parseFloat`, lee 1,2 —dentro de min/max— y deja el campo tal cual.
   */
  test('CASO 25 (debe rechazarse) — «1.2.3» no son años de propiedad: ni 0 ni 1', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await rellenar(page, 'Precio del trastero', '20000');
    await page.getByRole('button', { name: /Vendedor/ }).click();
    await rellenar(page, 'Precio de compra original', '14000');
    await rellenar(page, 'Años de propiedad', '1.2.3');
    await rellenar(page, 'Valor catastral del suelo', '5000');
    await rellenar(page, 'Valor catastral total (suelo + construcción)', '11000');

    // El campo conserva lo escrito: el blur solo acota min/max.
    await expect(page.locator('input[aria-label="Años de propiedad"]')).toHaveValue('1.2.3');

    // La plusvalía NO se calcula, y el aviso nombra ESE campo y solo ese: los otros dos
    // están puestos. El verbo concuerda en plural («faltan los años»), hallazgo 638.
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('SIN CALCULAR');
    const metodo25 = await descripcionTarjeta(page, 'Plusvalía municipal');
    // Escritos pero ilegibles: no «faltan», no se leen (hallazgo 1285); el plural concuerda.
    expect(metodo25).toBe('No calculada (no se han podido leer los años de propiedad)');

    // Y ni rastro de las dos lecturas equivocadas:
    //   · como 0 años → objetivo 5.000 × 0,14 × 25 % = 175,00 · real (20.000−14.000) ×
    //     (5.000/11.000) × 25 % = 681,8181… → recomendado 175,00 €
    //   · como 1 año  → 5.000 × 0,13 × 25 % = 162,50 €
    const cuerpo25 = (await page.locator('body').innerText()).replace(ESPACIO_DURO, ' ');
    expect(cuerpo25).not.toContain('175,00 €');
    expect(cuerpo25).not.toContain('162,50 €');

    // El resto del vendedor SÍ se calcula, y con la plusvalía en 0 el IRPF sale AL ALZA,
    // que es el sentido recuperable: art. 35 LIRPF con `calcularGananciaInmueble`.
    //   comisión = 20.000 × 3 % (por defecto) = 600,00 · gestoría del vendedor = 0
    //   valor de adquisición = 14.000 (sin gastos de adquisición declarados)
    //   valor de transmisión = 20.000 − 600 − 0 = 19.400,00
    //   ganancia = 19.400 − 14.000 = 5.400,00
    //   IRPF (TRAMOS_GANANCIAS_PATRIMONIALES_2025, primer tramo hasta 6.000 al 19 %):
    //        5.400 × 19 % = 1.026,00
    //   total gastos = 0 + 600,00 + 0 + 1.026,00 = 1.626,00 · neto = 20.000 − 1.626,00
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('14.000,00 €');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('19.400,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('5400,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('1026,00 €');
    expect(await valorTarjeta(page, 'Comisión inmobiliaria (3 %)')).toBe('600,00 €');
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('1626,00 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('18.374,00 €');

    // El neto se presenta como TECHO, nombrando el concepto que falta y el campo que lo
    // desbloquea (hallazgos 483 y 639).
    const neto25 = await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR');
    expect(neto25).toBe('No descuenta la plusvalía municipal: el neto real puede ser menor que este. No se han podido leer los años de propiedad. Escribe con coma decimal (1.234,56) lo que no se ha podido leer para obtenerlo.');

    // Y en ninguna parte de la página puede haber NaN. Mayúsculas incluidas: `getByText`
    // no distingue y casaría con «ganancia».
    expect(await page.locator('body').innerText()).not.toContain('NaN');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// HALLAZGOS de la re-inspección del 11/09/2026 — REPARADOS.
// Nacieron con `test.fail()` afirmando lo que DEBERÍA pasar; al repararlos se les quitó la
// marca y quedan como regresión.
//
// Los tres primeros eran EFECTO FAMILIA del commit bc437470 (10/09/2026), que reparó los 13
// hallazgos del clúster inmobiliario: las correcciones 670 y 671 se aplicaron en
// `simulador-gastos-compraventa-garaje` y la 683 en `simulador-gastos-compraventa-nave-industrial`,
// y ninguna de las tres llegó a esta app, que tiene el mismo defecto en el mismo sitio.
// ═════════════════════════════════════════════════════════════════════════════

// ✅ REPARADO 11/09/2026 (medio) — contenido. EFECTO FAMILIA del hallazgo 670.
// La FAQ visible y los DOS bloques FAQPage de `metadata.ts` afirman sin ninguna excepción
// territorial que un trastero nuevo paga IVA (10 % como anejo, 21 % independiente), mientras
// la calculadora responde «IGIC — No calculado» en Canarias y «IPSI» en Ceuta y Melilla.
// La nota de cabecera de la página SÍ lleva la excepción desde el hallazgo 527; la FAQ y el
// JSON-LD se quedaron fuera, y el JSON-LD es justo lo que leen los asistentes de IA.
// Caso: Canarias · Primera mano · 12.000 € → la tarjeta dice «IGIC / No calculado» y «En
//       Canarias no rige el IVA», y dos pantallas más abajo la pregunta «¿Qué IVA paga un
//       trastero nuevo?» responde «tributa al tipo general del 21%» sin matiz.
//       Esperado: la misma excepción que la hermana garaje añadió el 10/09 («En Canarias,
//       Ceuta y Melilla no rige el IVA sino el IGIC o el IPSI, con sus propios tipos»).
//       Obtenido: ni «IGIC» ni «IPSI» aparecen en la FAQ ni en ninguno de los dos FAQPage.
// Reparado con el patrón que garaje estrenó en el hallazgo 624: la respuesta vive en UNA
// constante de metadata.ts (`RESPUESTA_IVA_TRASTERO_NUEVO`) que importan los dos FAQPage, y
// la FAQ visible nombra la misma excepción. Este test queda de candado de regresión.
test('REPARADO 11/09 (contenido) — la FAQ y el FAQPage recogen la excepción de Canarias', async ({
  page,
}) => {
  await page.goto(RUTA);
  await page.getByRole('button', { name: /Primera mano/ }).click();
  await selectCcaa(page).selectOption('canarias');
  await rellenar(page, 'Precio del trastero', '12000');

  // Lo que la calculadora responde de verdad (esto ya está bien y pasa):
  expect(await valorTarjeta(page, 'IGIC')).toBe('No calculado');
  expect(await descripcionTarjeta(page, 'IGIC')).toContain('no rige el IVA');

  // …y lo que la FAQ visible contesta a la misma pregunta, en la misma página.
  const respuesta = page
    .locator('h4', { hasText: '¿Qué IVA paga un trastero nuevo?' })
    .locator('xpath=following-sibling::p[1]');
  expect(await texto(respuesta)).toMatch(/IGIC|IPSI/);

  // Y los dos FAQPage de metadata.ts, que es lo que citan los asistentes de IA.
  const { readFileSync } = await import('node:fs');
  const { join } = await import('node:path');
  const meta = readFileSync(
    join(process.cwd(), 'app', 'simulador-gastos-compraventa-trastero', 'metadata.ts'),
    'utf8',
  );
  expect(meta).toContain('IGIC');
});

// ✅ REPARADO 11/09/2026 (medio) — dato. EFECTO FAMILIA del hallazgo 671.
// El ÚNICO tipo de plusvalía municipal que la página publica es el 30 % máximo legal, que
// llega por `PLUSVALIA_MUNICIPAL_META.nota` dentro del segundo `DataReference`. El tipo que
// el motor APLICA es el 25 % orientativo (`PLUSVALIA_MUNICIPAL_META.tipoOrientativo`, que es
// el valor por defecto de `calcularPlusvaliaMunicipal`), y no aparece en ninguna parte: ni en
// la página, ni en la FAQ visible, ni en los dos FAQPage. El usuario no puede reconstruir la
// cifra que se le da, y quien la recalcule con el único tipo publicado obtendrá un 20 % más.
// La hermana garaje lo cerró el 10/09 añadiendo «Esta calculadora aplica un tipo del 25 %
// como referencia orientativa habitual; cada ayuntamiento fija el suyo, con un máximo legal
// del 30 %» a la FAQ visible y a los dos FAQPage.
// Caso: Vendedor · venta 20.000 € · compra 14.000 € · 5 años · suelo 5.000 · total 11.000
//       → la app publica 212,50 € de plusvalía (5.000 × 0,17 × 25 %; el método real daría
//         (20.000−14.000) × 5.000/11.000 × 25 % = 681,82 €, así que gana el objetivo)
//       → con el 30 % que la propia página anuncia serían 255,00 €
//       Esperado: que la página diga qué tipo aplica · obtenido: «25 %» no aparece en
//       ninguna parte del documento, y «30%» sí.
// Reparado igual que garaje: la FAQ visible y los dos FAQPage dicen ahora qué tipo APLICA la
// calculadora, leído de `PLUSVALIA_MUNICIPAL_META.tipoOrientativo` y no tecleado.
test('REPARADO 11/09 (dato) — la página dice el 25 % orientativo que aplica, no solo el 30 % máximo', async ({
  page,
}) => {
  await page.goto(RUTA);
  await rellenar(page, 'Precio del trastero', '20000');
  await page.getByRole('button', { name: /Vendedor/ }).click();
  await rellenar(page, 'Precio de compra original', '14000');
  await rellenar(page, 'Años de propiedad', '5');
  await rellenar(page, 'Valor catastral del suelo', '5000');
  await rellenar(page, 'Valor catastral total (suelo + construcción)', '11000');

  // La cifra que el motor da, resuelta a mano:
  //   objetivo: 5.000 × 0,18 (coeficiente de 5 años del art. 107.4 TRLRHL, RDL 8/2023; era
  //     0,17 hasta el 24/09/2026, hallazgo 1559) = 900 × 25 % = 225,00
  //   real: (20.000 − 14.000) × (5.000/11.000) × 25 % = 681,8181…
  //   recomendado = el más favorable = 225,00 €
  expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('225,00 €');
  expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toContain('Método objetivo');

  // Con el 30 % que la página anuncia, esa misma base daría 255,00 €. El tipo que la
  // calculadora APLICA tiene que estar escrito donde el usuario pregunta por él.
  //
  // Se lee el párrafo concreto y no `body.innerText()`: la FAQ vive dentro de la sección
  // educativa colapsable y el innerText del documento no la recoge.
  const respuestaPlusvalia = page
    .locator('h4', { hasText: '¿Se paga plusvalía municipal al vender un trastero?' })
    .locator('xpath=following-sibling::p[1]');
  expect(await texto(respuestaPlusvalia)).toMatch(/25\s?%/);

  // Y los dos FAQPage de metadata.ts, que es lo que citan los asistentes de IA.
  const jsonLd = (await page.locator('script[type="application/ld+json"]').allTextContents()).join(' ');
  // Con el espacio DURO del 26/09/2026 (hallazgo 2194): `\s` lo admite.
  expect(jsonLd).toMatch(/25\s% como referencia orientativa/);
});

// ✅ REPARADO 11/09/2026 (medio) — accesibilidad. EFECTO FAMILIA del hallazgo 683.
// El azul de MARCA `--primary` (#2E86AB) se sigue usando como color de TEXTO en esta app, en
// los mismos tres selectores que `simulador-gastos-compraventa-nave-industrial` pasó a
// `--primary-texto` el 10/09/2026. `app/globals.css` documenta el motivo en su propia
// cabecera: «como TEXTO sobre fondo claro no llegan al 4,5:1 que exige WCAG 2.1 AA —el azul
// da 4,11—», y para eso existe `--primary-texto` (#26718F, 5,47:1 sobre blanco), que en
// oscuro resuelve al mismo #3FA5D1 que ya se usa, de modo que allí no cambia nada.
// Caso (tema claro, medido en navegador sobre el fondo efectivo ya compuesto):
//   · .catastroLink («🔗 Consultar valor de referencia catastral…», 16 px / peso 500)
//       → esperado ≥ 4,5:1 · obtenido 4,11:1 (#2E86AB sobre #FFFFFF)
//   · .infoCcaaNombre («Comunidad de Madrid», 16 px / peso 600)
//       → esperado ≥ 4,5:1 · obtenido 3,74:1 (#2E86AB sobre #EEF5F8, la tarjeta con su
//         rgba(46,134,171,0.08) ya compuesto)
//   · .casoTag («Trastero con vivienda nueva», 12,8 px / peso 600)
//       → esperado ≥ 4,5:1 · obtenido 3,65:1
// Queda FUERA .infoCcaaValue (19,2 px / peso 700): ahí 3,74:1 sí cumple, porque la WCAG
// admite 3:1 para texto grande (≥18,66 px en negrita). No todo el azul de la página falla.
test('REPARADO 11/09 (accesibilidad) — el azul de marca ya no hace de texto: se usa --primary-texto', async ({
  page,
}) => {
  await page.goto(RUTA);
  await page.waitForTimeout(300);

  const contraste = (selector: string) =>
    page.evaluate((sel) => {
      const canal = (c: number) => {
        const v = c / 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      };
      const partes = (s: string) => (s.match(/[\d.]+/g) || []).map(Number);
      const lum = ([r, g, b]: number[]) => 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
      const mezcla = (fg: number[], bg: number[], a: number) => fg.map((c, i) => a * c + (1 - a) * bg[i]);

      const el = document.querySelector(sel);
      if (!el) return null;
      // Fondo EFECTIVO: compone todas las capas semitransparentes hasta la primera opaca.
      const capas: { rgb: number[]; a: number }[] = [];
      let n: Element | null = el;
      while (n) {
        const p = partes(getComputedStyle(n).backgroundColor);
        const a = p.length === 4 ? p[3] : 1;
        if (a > 0) capas.push({ rgb: p.slice(0, 3), a });
        if (a === 1) break;
        n = n.parentElement;
      }
      if (!capas.length || capas[capas.length - 1].a !== 1) capas.push({ rgb: [255, 255, 255], a: 1 });
      let fondo = capas[capas.length - 1].rgb;
      for (let i = capas.length - 2; i >= 0; i--) fondo = mezcla(capas[i].rgb, fondo, capas[i].a);

      const l1 = lum(partes(getComputedStyle(el).color).slice(0, 3));
      const l2 = lum(fondo);
      return Math.round(((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)) * 100) / 100;
    }, selector);

  // El enlace primero: un enlace es justo el texto que hay que poder leer.
  expect(await contraste('[class*="catastroLink"]')).toBeGreaterThanOrEqual(4.5);
  expect(await contraste('[class*="infoCcaaNombre"]')).toBeGreaterThanOrEqual(4.5);
  expect(await contraste('[class*="casoTag"]')).toBeGreaterThanOrEqual(4.5);
});

// ✅ REPARADO 11/09/2026 (bajo) — dato. Las dos tablas de ITP del repositorio no decían lo
// mismo sobre el reducido de Castilla y León, y la app publica la versión sin tope.
// `TIPOS_ITP_CCAA_2025` (data/fiscal/inmuebles.ts), que es de donde esta app saca el tipo
// GENERAL de la comunidad, dice: «Reducido 4% (≤150.000 €) o 6% (resto) para jóvenes <36,
// familia numerosa/monoparental, discapacidad ≥65%, VPO o zonas rurales». La entrada
// equivalente de `ITP_CCAA['castilla-leon']` (data/itp-ccaa.ts) declara el 4 % SIN
// `valorMaximo` y sin el escalón del 6 %, así que la caja «Podrías pagar menos» ofrece el
// 4 % a cualquier precio. El cotejo del triaje del 11/09 comparaba los VALORES de las dos
// tablas —y ahí ambas dicen 4— pero no el tope, que vive en el texto de `notaReducido`.
// No cambia ninguna cifra cobrada: el reducido nunca se aplica en esta app (exige vivienda
// habitual y un trastero suelto no lo es), solo se enseña como oportunidad. De ahí el «bajo».
// Caso: Castilla y León · segunda mano · perfil joven · 200.000 €
//       → esperado: la oportunidad del 4 % con su tope («Valor ≤ 150.000 €» / «Valor máximo
//         150.000,00 €»), como ya hace la del 0,01 % dos líneas más abajo
//       → obtenido: «4,00% — Jóvenes < 36 años · Requisitos: Menor de 36 años · Vivienda
//         habitual», sin tope, a 200.000 € (a ese precio la propia data/fiscal dice 6 %).
test('REPARADO 11/09 (dato) — el reducido de Castilla y León se ofrece con su tope de 150.000 €', async ({
  page,
}) => {
  await page.goto(RUTA);
  await page.getByRole('button', { name: /Segunda mano/ }).click();
  await selectCcaa(page).selectOption('castilla-leon');
  await selectPerfil(page).selectOption('joven');
  await rellenar(page, 'Precio del trastero', '200000');

  // A 200.000 € el de municipios poco poblados ya ha desaparecido de la caja por su
  // `valorMaximo` de 150.000 €: queda una sola oportunidad, la del 4 % (esto pasa).
  const oportunidades = page.locator('div[class*="avisoReducidos"] li');
  await expect(oportunidades).toHaveCount(1);
  expect(await texto(oportunidades.first())).toContain('4,00 % — Jóvenes < 36 años');

  // Y esa, a 200.000 €, o no debería ofrecerse o debería llevar su tope escrito.
  expect(await texto(oportunidades.first())).toContain('150.000');
});

// ═════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 12/09/2026 — CASOS 26-28 y tres hallazgos (713, 773 y 774), reparados el 13/09.
//
// La cola invalidó la inspección del 11/09 porque el código y las dependencias de esta app
// cambiaron ese mismo día por tres commits:
//   · 7a02470c — el triaje fiscal reescribió entera la ficha de Aragón: el art. 121-1 es una
//     escala de CINCO tramos con cuota acumulada, y lo que allí hay no son tipos reducidos
//     por colectivo sino bonificaciones en cuota (art. 121-4, 121-5 y 160-3).
//   · e947fa55 — la tarifa del ISD (que esta app no usa) y el pase FAQ ↔ FAQPage, del que
//     aquí salieron los hallazgos 714 y 715.
//   · 21a13c6b — los 32 hallazgos del 11/09. De esta app tocó SOLO el CSS (el azul de marca
//     que hacía de texto) y este fichero de pruebas: su `page.tsx` no se modificó.
//
// Territorio y precio nuevos otra vez: La Rioja con familia numerosa —la comunidad que
// ninguna ronda había elegido— y el QUINTO tramo de la escala aragonesa, por encima de los
// 750.000 €, que es el único escalón del art. 121-1 al que ningún caso de este fichero
// llegaba (el CASO 18 se queda en 400.000 y el CASO 24 en 500.000).
//
// Los casos se siembran con `esperarValorEnReact`: `rellenar` escribe con `fill()` y no
// espera a la hidratación, así que sin ese testigo un caso podría pasar en verde midiendo
// el escenario anterior.
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Rellena un campo y ESPERA a que el estado de React lo recoja.
 *
 * `fill()` llega a React (lo escribe el navegador, no el setter nativo), pero no llega si la
 * app todavía no ha hidratado, y entonces el test seguiría midiendo el valor anterior. Se
 * espera antes a que ese input esté montado, porque los del vendedor no existen hasta que se
 * pulsa su pestaña.
 */
async function sembrar(page: Page, etiqueta: string, valor: string): Promise<void> {
  const selector = `input[aria-label="${etiqueta}"]`;
  await esperarHidratacion(page, [selector]);
  const campo = page.locator(selector);
  await campo.fill(valor);
  await campo.blur();
  // El blur de `NumberInput` solo reescribe el campo cuando el número sale de [min, max];
  // ninguno de estos casos lo hace, así que React debe quedarse con lo escrito.
  await esperarValorEnReact(page, selector, valor);
}

test.describe('RE-INSPECCIÓN 12/09/2026 — La Rioja, el quinto tramo de Aragón y una comisión ilegible', () => {
  /**
   * CASO 26 (NORMAL) — La Rioja con perfil FAMILIA NUMEROSA, la comunidad que ninguna ronda
   * había usado. Interesa por dos motivos:
   *
   *   · es una comunidad SIN escala progresiva (no hay `tramosProgresivos` en su ficha), de
   *     modo que el aviso de escala NO debe pintarse — el caso simétrico del CASO 27;
   *   · sus CINCO beneficios exigen vivienda habitual o primera vivienda, y un trastero
   *     suelto no es ninguna de las dos, así que el 5 % de familia numerosa tiene que salir
   *     como OPORTUNIDAD y no como cifra cobrada. Es el contrato de `elegirTipoITP` desde el
   *     14/08/2026 («se enseña como oportunidad, nunca como cifra»), y aquí importa porque
   *     aplicarlo habría dejado el ITP en 825,00 € en vez de 1.155,00 €.
   */
  test('CASO 26 (normal) — La Rioja, segunda mano, 16.500 €, familia numerosa', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['input[aria-label="Precio del trastero"]']);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await selectCcaa(page).selectOption('rioja');
    await selectPerfil(page).selectOption('familia-numerosa');
    await sembrar(page, 'Precio del trastero', '16500');

    // Tipo general de La Rioja = 7 %, de `TIPOS_ITP_CCAA_2025` en `data/fiscal/inmuebles.ts`
    // (leído por `tipoGeneralDe('La Rioja')`). Su ficha de `ITP_CCAA` no declara
    // `tramosProgresivos`, así que `calcularITP` aplica el tipo plano:
    //   16.500 × 7 % = 1.155,00 · tipo efectivo = 1.155 / 16.500 = 7,00 %
    expect(await valorTarjeta(page, 'ITP (7,00 %)')).toBe('1155,00 €');
    expect(await descripcionTarjeta(page, 'ITP (7,00 %)')).toContain('La Rioja');

    // Y por eso mismo NO puede haber aviso de escala progresiva (el CASO 27 es el simétrico).
    await expect(page.locator('p', { hasText: 'escala progresiva (' })).toHaveCount(0);

    // Notaría — RD 1426/1989, número 2 (`ARANCELES_NOTARIO`):
    //   tramo 1 (hasta 6.010,12 €)            →                         90,151816
    //   tramo 2 (6.010,12→30.050,61, 0,45 %)  → 10.489,88 × 0,0045 =         47,20446
    //   escala del nº 2.1                     =                            137,356276
    //   rebaja del 5 % del nº 2.1 (17/10/2026, cabo C0209) × 0,95 =        130,488462
    //   con el 21 % de IVA                    = × 1,21 =                   157,891039
    // `FACTURA_NOTARIAL`: ×1,5 = 236,836559 · ×2 = 315,782078 · medio ×1,75 = 276,309318
    // (sin la rebaja: 290,85 · 249,30 · 332,40)
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('276,31 €');
    const notaria26 = await descripcionTarjeta(page, 'Gastos de notaría');
    expect(notaria26).toContain('236,84 €');
    expect(notaria26).toContain('315,78 €');

    // Registro — RD 1427/1989, números 1, 2 y 4 (`ARANCELES_REGISTRO` + `REGISTRO_CONCEPTOS`):
    //   tramo 1 (hasta 6.010,12 €)            →                         24,040484
    //   tramo 2 (6.010,12→30.050,61, 0,175 %) → 10.489,88 × 0,00175 =        18,35729
    //   inscripción (número 2)                =                             42,397774
    //   × 0,95 (rebaja del nº 2.1)            =                             40,277885
    //   + asiento de presentación 6,010121 + nota simple 3,005061 =          49,293067
    //   con el 21 % de IVA                    = 49,293067 × 1,21 =          59,644611
    //   (sin la rebaja, 62,21)
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('59,64 €');

    // Gestoría: la que trae el formulario por defecto.
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('300,00 €');

    // En segunda mano no hay AJD (ITP y cuota gradual de AJD son incompatibles).
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);

    // Total — `sumarLineasVisibles` redondea cada línea al céntimo ANTES de sumar:
    //   1.155,00 + 276,31 + 59,64 + 300,00 = 1.790,95
    //   % sobre el precio = 1.790,95 / 16.500 = 10,854242 %
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('1790,95 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('10,85 %');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('18.290,95 €');

    // El 5 % de familia numerosa sale como oportunidad y NO se ha cobrado: con él aplicado,
    // el ITP habrían sido 16.500 × 5 % = 825,00 € en vez de 1.155,00 €. Es el único de los
    // cinco de La Rioja que el perfil elegido puede alcanzar; los otros cuatro son de
    // jóvenes o de VPO, y `elegirTipoITP` solo propone los que casan con el perfil.
    const oportunidades26 = page.locator('div[class*="avisoReducidos"] li');
    await expect(oportunidades26).toHaveCount(1);
    expect(await texto(oportunidades26.first())).toContain('5,00 % — Familia numerosa');
    expect(await texto(oportunidades26.first())).toContain('Vivienda habitual');
  });

  /**
   * CASO 27 (LÍMITE) — el QUINTO tramo de la escala de Aragón, el único del art. 121-1 al
   * que ningún caso de este fichero llegaba.
   *
   * La escala se reescribió el 11/09/2026 (commit 7a02470c): tenía DOS tramos —8 % hasta
   * 400.000 € y 10 % por encima— y el art. 121-1 tiene CINCO, con cuota acumulada. Los
   * cuatro cortes que el comentario de `ITP_CCAA['aragon']` fija contra la tabla oficial son
   * 32.000 € a los 400.000, 36.250 € a los 450.000, 40.750 € a los 500.000 y **64.500 € a
   * los 750.000**; a partir de ahí el exceso va al 10 %, que es lo que este caso ejercita y
   * lo que `TIPOS_ITP_CCAA_2025` publica en su nota («10 % desde 750.000 € — art. 121-1»).
   *
   * Con la escala VIEJA, 1.000.000 € liquidaban 32.000 + 600.000 × 10 % = 92.000 €.
   */
  test('CASO 27 (límite) — Aragón, 1.000.000 €: el quinto tramo del art. 121-1 (89.500 €)', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['input[aria-label="Precio del trastero"]']);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await selectCcaa(page).selectOption('aragon');
    await selectPerfil(page).selectOption('general');
    await sembrar(page, 'Precio del trastero', '1000000');

    // El recuadro anuncia los CINCO tramos, con coma decimal (`formatTipoNominal`).
    expect(await texto(page.locator('p', { hasText: 'escala progresiva (' }).first())).toContain(
      '8 % → 8,50 % → 9 % → 9,50 % → 10 %', // `describirSubidaITP` (24/09/2026)
    );

    // ITP — `calcularITPProgresivo` sobre los cinco tramos del art. 121-1:
    //   400.000 × 8 %   = 32.000          (0 → 400.000)
    //    50.000 × 8,5 % =  4.250          (400.000 → 450.000) → acumulado 36.250
    //    50.000 × 9 %   =  4.500          (450.000 → 500.000) → acumulado 40.750
    //   250.000 × 9,5 % = 23.750          (500.000 → 750.000) → acumulado 64.500
    //   250.000 × 10 %  = 25.000          (750.000 → 1.000.000)
    //                   = 89.500,00 €
    //   tipo EFECTIVO = 89.500 / 1.000.000 = 8,95 % (el nominal, 8 %, mentiría)
    expect(await valorTarjeta(page, 'ITP (8,95 %)')).toBe('89.500,00 €');
    expect(await descripcionTarjeta(page, 'ITP (8,95 %)')).toContain('Aragón');

    // Notaría — `ARANCELES_NOTARIO` hasta el SEXTO tramo, que ningún caso había alcanzado:
    //   90,151816 + 24.040,49×0,0045 + 30.050,60×0,0015 + 90.151,82×0,001
    //        + 450.759,07×0,0005 + 398.987,90×0,0003
    //   = 90,151816 + 108,182205 + 45,0759 + 90,15182 + 225,379535 + 119,69637 = 678,637646
    //   × 0,95 (rebaja del nº 2.1, 17/10/2026, cabo C0209) = 644,705764
    //   con IVA = 780,093974 · ×1,5 = 1.170,140961 · ×2 = 1.560,187948
    //   medio ×1,75 = 1.365,164454 (sin la rebaja: 1.437,01 · 1.231,72 · 1.642,30)
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('1365,16 €');
    const notaria27 = await descripcionTarjeta(page, 'Gastos de notaría');
    expect(notaria27).toContain('1170,14 €');
    expect(notaria27).toContain('1560,19 €');

    // Registro — `ARANCELES_REGISTRO` hasta su último tramo:
    //   24,040484 + 24.040,49×0,00175 + 30.050,60×0,00125 + 90.151,82×0,00075
    //        + 450.759,07×0,0003 + 398.987,90×0,0002
    //   = 24,040484 + 42,0708575 + 37,56325 + 67,613865 + 135,227721 + 79,79758 = 386,313758
    //   (por debajo del `REGISTRO_MAXIMO` de 2.181,673939, que es lo que este caso comprueba)
    //   × 0,95 = 366,998070 + 6,010121 + 3,005061 = 376,013252 · con IVA = 454,976034
    //   (sin la rebaja, 478,35)
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('454,98 €');

    // Total = 89.500,00 + 1.365,16 + 454,98 + 300,00 = 91.620,14
    //   % sobre el precio = 91.620,14 / 1.000.000 = 9,162014 %
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('91.620,14 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain('9,16 %');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('1.091.620,14 €');

    // Las cinco bonificaciones de Aragón topan el inmueble en 100.000 € (las tres del art.
    // 121-4) o exigen renta y venta de la vivienda anterior (las dos de familia numerosa):
    // a este precio no hay nada que ofrecer y la caja de oportunidades NO debe pintarse.
    await expect(page.locator('p', { hasText: 'Podrías pagar menos' })).toHaveCount(0);
  });

  /**
   * CASO 28 (DEBE RECHAZARSE) — una COMISIÓN inmobiliaria malformada.
   *
   * Es el último campo del vendedor que ninguna ronda había atacado con basura: el precio de
   * venta (CASO 7), el de compra (CASO 22) y los años (CASO 25) ya tienen su caso, y la
   * comisión solo se había probado en negativo y con el foco puesto (CASO 10).
   *
   * `NumberInput` deja pasar «1.2.3» —su regex `/^-?[\d.,]*$/` solo filtra letras— y su
   * `handleBlur`, que usa `parseFloat`, lee 1,2: está dentro de [0, 10], así que no reescribe
   * el campo. Lo que llega al motor es por tanto un porcentaje ilegible, y `parseSpanishNumber`
   * lo rechaza con NaN, que es lo correcto.
   *
   * Este caso fija lo que debe cumplirse con CUALQUIER reparación: que el campo conserve lo
   * escrito, que no aparezca ningún NaN y que en la página no haya rastro de las dos lecturas
   * equivocadas posibles. Lo que la app hacía entonces con ese NaN es el hallazgo 773 de
   * abajo, reparado el 13/09/2026.
   */
  test('CASO 28 (debe rechazarse) — «1.2.3» no es un porcentaje de comisión', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['input[aria-label="Precio del trastero"]']);
    await sembrar(page, 'Precio del trastero', '15000');
    await page.getByRole('button', { name: /Vendedor/ }).click();
    await sembrar(page, 'Precio de compra original', '8000');
    await sembrar(page, 'Comisión inmobiliaria (%)', '1.2.3');

    // El campo conserva lo escrito: el blur solo acota min/max, y 1,2 cae dentro.
    await expect(page.locator('input[aria-label="Comisión inmobiliaria (%)"]')).toHaveValue(
      '1.2.3',
    );

    // Ni rastro de las dos lecturas equivocadas de ese texto:
    //   · como 1,2 % (lo que devolvería el `parseFloat` del blur) → 15.000 × 1,2 % = 180,00 €
    //   · como el 3 % que el campo traía por defecto               → 15.000 × 3 %   = 450,00 €
    const cuerpo28 = (await page.locator('body').innerText()).replace(ESPACIO_DURO, ' ');
    expect(cuerpo28).not.toContain('180,00 €');
    expect(cuerpo28).not.toContain('450,00 €');

    // El precio de venta sí se lee, y la plusvalía sigue abstiéndose por sus dos campos
    // vacíos, con el verbo en plural (hallazgo 638).
    expect(await valorTarjeta(page, 'Precio de venta')).toBe('15.000,00 €');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('SIN CALCULAR');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe(
      'No calculada (faltan el valor catastral del suelo y los años de propiedad)',
    );

    // Y en ninguna parte de la página puede haber NaN.
    expect(await page.locator('body').innerText()).not.toContain('NaN');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// REGRESIÓN — los TRES hallazgos de la re-inspección del 12/09/2026 (713, 773 y 774),
// REPARADOS el 13/09/2026 y verificados el 14/09: se les retiró el `test.fail()` y hoy
// sujetan la reparación. Los comentarios de cada uno describen el defecto de origen.
// ═════════════════════════════════════════════════════════════════════════════

// ✅ REPARADO 13/09/2026 (medio) — dato. EFECTO FAMILIA del hallazgo 713. Caso de origen:
// El plazo de autoliquidación del ITP sigue escrito a mano en el bloque educativo («30 días
// hábiles desde la firma de la escritura») y SIN norma citada, cuando el 11/09/2026 ese dato
// pasó a `data/fiscal/inmuebles.ts` como `PLAZO_ITP` —con su base normativa, su URL del BOE y
// su fecha de verificación— precisamente porque estaba a mano en la app hermana garaje, que
// ya lo deriva (`{PLAZO_ITP.dias} días hábiles … ({PLAZO_ITP.baseNormativa})`).
// Aquí el contraste se ve dentro de la MISMA frase: el recargo por presentación tardía sí va
// sellado desde `ESCALA_RECARGO_EXTEMPORANEO`, con su «Art. 27.2 LGT (Ley 58/2003), redacción
// de la Ley 11/2021 (BOE-A-2021-11473)» impreso en pantalla, y el plazo del que ese recargo
// arranca no lleva nada. Se pierde además el `aviso` del módulo: el plazo es de gestión
// autonómica y hay comunidades que lo amplían (Cataluña lo tiene en un mes en varios
// supuestos), así que quien lea «30 días hábiles» sin ese matiz puede presentar tarde o
// contar con menos margen del que tiene.
// Caso: abrir «Ver Guía Completa» → consejo «Liquida los impuestos a tiempo»
//       → esperado: «…30 días hábiles… (art. 102.1 del Reglamento del ITPAJD, RD 828/1995)»,
//         derivado de `PLAZO_ITP` como en garaje desde el commit 21a13c6b
//       → obtenido: «El ITP o el IVA+AJD debe liquidarse en 30 días hábiles desde la firma de
//         la escritura», y ni «828/1995» ni «102.1» aparecen en todo el documento.
test('REGRESIÓN 713 (dato) — el plazo del ITP cita su norma y sale de data/fiscal', async ({
  page,
}) => {
  await page.goto(RUTA);
  await esperarHidratacion(page, ['input[aria-label="Precio del trastero"]']);

  // La guía viene colapsada: sin abrirla, su texto no entra en el innerText del documento.
  //
  // ⚠️ 15/09/2026 — se lee del DOM con `textContent` en vez de abrir el desplegable. El
  // montaje anterior pulsaba el ÚLTIMO `[aria-expanded]` de la página y exigía que quedase
  // exactamente uno abierto: pasaba aislado y fallaba en la suite completa, donde el orden de
  // render deja otro elemento colapsable el último. El contenido está en el DOM aunque esté
  // plegado —es lo que ya hace el spec de nave-industrial—, así que no hace falta abrir nada
  // para comprobar de dónde sale el dato, que es lo único que este caso vigila.
  const cuerpo = ((await page.locator('body').textContent()) ?? '').replace(/\s+/g, ' ');

  // El plazo está (esto pasa): lo que falta es de dónde sale.
  expect(cuerpo).toContain('30 días hábiles');

  // La norma del plazo, literal de `PLAZO_ITP.baseNormativa` en data/fiscal/inmuebles.ts.
  expect(cuerpo).toContain('art. 102.1 del Reglamento del ITPAJD, RD 828/1995');
});

// ✅ REPARADO 13/09/2026 (medio) — operativa. Una comisión que la app NO podía leer se
// convertía en 0 % sin decirlo, y el neto del vendedor subía. Caso de origen:
// `parseSpanishNumberOr(comisionInmobiliaria)` devuelve su valor por defecto —0— cuando el
// parser rechaza el texto, así que el NaN de «1.2.3» y un campo vacío son la misma cosa para
// el motor. Con la comisión en 0 la tarjeta «Comisión inmobiliaria» ni se pinta (su guard es
// `> 0`), de modo que no queda en pantalla ninguna línea que explique la diferencia: el
// usuario ve un neto y no puede saber que se ha calculado sin la comisión que él creía haber
// escrito. Y el error va en la dirección mala: el neto sale AL ALZA y el IRPF también, porque
// la comisión es gasto de transmisión del art. 35.1 LIRPF y al desaparecer sube la ganancia.
// Es el defecto que el commit 21a13c6b corrigió en `estimador-impuesto-sucesiones`
// (hallazgos 740 y 742): «o se lee el importe, o no se da número». Los campos de esta app ya
// acotan el NEGATIVO a 0 a propósito (hallazgos 457 y 486), pero un valor ILEGIBLE no es un
// cero: es un dato que falta, y esta app ya sabe abstenerse y nombrarlo (lo hace con la
// plusvalía y con el IRPF).
// Caso: precio de venta 15.000 € · precio de compra 8.000 € · comisión «1.2.3»
//       → esperado: que la app se abstenga o nombre el campo ilegible, como hace con el
//         valor catastral y los años («Techo: aún NO incluye…»)
//       → obtenido: comisión 0 %, sin tarjeta de comisión, IRPF 1.350,00 € y NETO
//         13.650,00 €. Con el 3 % que el campo traía por defecto: comisión 450,00 €,
//         IRPF 1.255,50 € y neto 13.294,50 € — 355,50 € menos.
test('REGRESIÓN 773 (operativa) — una comisión ilegible se nombra en vez de leerse como 0 %', async ({
  page,
}) => {
  await page.goto(RUTA);
  await esperarHidratacion(page, ['input[aria-label="Precio del trastero"]']);
  await sembrar(page, 'Precio del trastero', '15000');
  await page.getByRole('button', { name: /Vendedor/ }).click();
  await sembrar(page, 'Precio de compra original', '8000');
  await sembrar(page, 'Comisión inmobiliaria (%)', '1.2.3');

  // El neto se entrega como cifra sin mencionar la comisión que no se ha podido leer.
  // Hoy dice: «Techo: aún NO incluye la plusvalía municipal (añade el valor catastral del
  // suelo y los años de propiedad)» — la comisión no aparece por ninguna parte.
  expect(await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR')).toMatch(/comisi[óo]n/i);
});

// ✅ REPARADO 13/09/2026 (bajo) — contenido. La FAQ visible no importaba las respuestas que
// `metadata.ts` decía que importaba, así que el mismo texto vivía duplicado a mano en dos
// canales. Caso de origen:
// La cabecera de `metadata.ts` afirma de `RESPUESTA_IVA_TRASTERO_NUEVO` y
// `RESPUESTA_PLUSVALIA_TRASTERO`: «Las importan las tres bocas que las publican: el FAQPage de
// `generateFAQSchema`, el `faqJsonLd` de abajo y la FAQ VISIBLE de `page.tsx`». Las dos
// primeras sí; `page.tsx` no importa ninguna de las dos y vuelve a escribir las respuestas en
// JSX. Hoy los tres textos coinciden en sustancia —el 10 %, el 21 %, la excepción de IGIC/IPSI
// y el 25 % orientativo están en los dos canales, que es lo que los hallazgos 714 y 715
// pedían—, así que no hay ninguna cifra mal: lo que no está es el mecanismo que impide que
// vuelvan a divergir, y es exactamente el mecanismo que la app hermana garaje sí tiene desde
// el hallazgo 624 (`import { RESPUESTA_ITP_GARAJE_SEGUNDA_MANO } from './metadata'`, y un
// único `<p>{RESPUESTA_ITP_GARAJE_SEGUNDA_MANO}</p>` en su FAQ).
// Caso: `grep -c "RESPUESTA_" app/simulador-gastos-compraventa-trastero/page.tsx`
//       → esperado: ≥ 2 (las dos constantes importadas y usadas, como en garaje)
//       → obtenido: 0, mientras `metadata.ts` afirma lo contrario en su línea 21.
test('REGRESIÓN 774 (contenido) — la FAQ visible importa las respuestas de metadata', async () => {
  const { readFileSync } = await import('node:fs');
  const { join } = await import('node:path');
  const pagina = readFileSync(
    join(process.cwd(), 'app', 'simulador-gastos-compraventa-trastero', 'page.tsx'),
    'utf8',
  );
  expect(pagina).toContain("from './metadata'");
});

// ═════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 14/09/2026 — Extremadura, la ganancia exactamente 0 y unos años
// negativos que SALEN del campo.
//
// La décima pasada por esta app, y la primera posterior a la reparación de los tres
// hallazgos del 12/09 (774 la FAQ duplicada a mano, 713 el plazo del ITP sin norma y 773
// la comisión ilegible leída como 0 %). Los tres se verifican arriba, ya sin `test.fail()`.
//
// Territorio nuevo otra vez —Extremadura, la última comunidad con escala progresiva que
// ninguna ronda había elegido, con el perfil DISCAPACIDAD que solo se había probado en el
// País Vasco— y, sobre todo, DOS sitios que las nueve rondas anteriores dejaron sin tocar:
//
//   · qué pasa con un valor imposible cuando el usuario SALE del campo. El CASO 19 (07/09)
//     y el CASO 10 (30/08) prueban los negativos «sin blur», con el foco todavía puesto, y
//     lo dicen en un comentario: «el min del NumberInput aún no ha corregido el valor». La
//     otra mitad del camino —la que recorre cualquiera que pulse Tab— no se había mirado.
//   · qué rotula la app cuando la ganancia patrimonial es EXACTAMENTE 0. Hay casos de
//     ganancia (4, 8, 19…) y de pérdida (5), y ninguno en la raya que los separa.
//
// Los casos siembran con `sembrar`, que espera al estado de React.
// ═════════════════════════════════════════════════════════════════════════════

/** La descripción de la tarjeta de ganancia/pérdida, o '' si esa tarjeta no se pinta. */
async function descripcionPatrimonial(page: Page): Promise<string> {
  const titulo = page.locator('h3', { hasText: /patrimonial/ });
  if ((await titulo.count()) === 0) return '';
  return descripcionTarjeta(page, /patrimonial/);
}

test.describe('RE-INSPECCIÓN 14/09/2026 — Extremadura, la ganancia cero y el blur de un dato imposible', () => {
  /**
   * CASO 29 (NORMAL) — Extremadura, segunda mano, 45.000 €, perfil DISCAPACIDAD.
   *
   * Comunidad nueva: es la única con escala progresiva (8/10/11 %, `ITP_CCAA.extremadura`)
   * que ninguna de las nueve rondas anteriores había elegido. El perfil de discapacidad
   * interesa porque su reducido del 6,4 % exige «Vivienda habitual», y un trastero suelto
   * nunca lo es: tiene que salir como OPORTUNIDAD en el aviso y no como cifra cobrada
   * (contrato de `elegirTipoITP` desde el 14/08/2026).
   */
  test('CASO 29 (normal) — Extremadura, segunda mano, 45.000 €, comprador con discapacidad', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['input[aria-label="Precio del trastero"]']);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await selectCcaa(page).selectOption('extremadura');
    await selectPerfil(page).selectOption('discapacidad');
    await sembrar(page, 'Precio del trastero', '45000');

    // ITP — escala progresiva de Extremadura en `ITP_CCAA` (8 % hasta 360.000 · 10 % hasta
    // 600.000 · 11 % el resto), aplicada por `calcularITPProgresivo`. 45.000 cabe entero en
    // el primer tramo: 45.000 × 8 % = 3.600,00. Tipo EFECTIVO = 3.600 / 45.000 = 8,00 %.
    expect(await valorTarjeta(page, /^ITP/)).toBe('3600,00 €');
    await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (8,00 %)');

    // El aviso de escala tiene que pintarse, con los tres tipos de la ficha.
    await expect(page.getByText(/Esta comunidad aplica escala progresiva/)).toContainText(
      '(8 % → 10 % → 11 %)', // `describirSubidaITP` (24/09/2026)
    );

    // Segunda mano: no hay AJD.
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);

    // Notaría — arancel del RD 1426/1989 nº 2 (`ARANCELES_NOTARIO`) sobre 45.000:
    //   90,151816 + (30.050,61 − 6.010,12) × 0,45 % + (45.000 − 30.050,61) × 0,15 %
    //   = 90,151816 + 108,182205 + 22,424085 = 220,758106 · × 0,95 (rebaja del nº 2.1,
    //   17/10/2026, cabo C0209) = 209,720201 · con IVA ×1,21 = 253,761443
    //   factura = ×1,5 → 380,642164 · ×2 → 507,522886 · medio = 444,082525
    //   (sin la rebaja: 467,45 · 400,67 · 534,23)
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('444,08 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain(
      'entre 380,64 € y 507,52 €',
    );

    // Registro — arancel del RD 1427/1989 nº 2 (`ARANCELES_REGISTRO`) sobre 45.000:
    //   24,040484 + 24.040,49 × 0,175 % + 14.949,39 × 0,125 % = 84,798079 × 0,95 = 80,558175
    //   + presentación 6,010121 + nota simple 3,005061 = 89,573357 · ×1,21 = 108,383762
    //   (sin la rebaja, 113,51)
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('108,38 €');

    // Total = 3.600 + 444,08 + 108,38 + 300 (gestoría por defecto) = 4.452,46
    //   porcentaje = 4.452,46 / 45.000 = 9,8944 % → 9,89 %
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('4452,46 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toBe(
      '9,89 % sobre el precio',
    );
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('49.452,46 €');

    // El 6,4 % de discapacidad NO se cobra —exige vivienda habitual— y se ofrece como
    // oportunidad, con sus condiciones a la vista.
    const avisoReducidos = page.locator('[role="note"]', { hasText: /Podrías pagar menos/ });
    await expect(avisoReducidos).toHaveCount(1);
    await expect(avisoReducidos).toContainText('6,40 % — Discapacidad (bonif. 20 %)');
    await expect(avisoReducidos).toContainText('Vivienda habitual');
  });

  /**
   * CASO 30 (LÍMITE) — la ganancia patrimonial EXACTAMENTE 0: la raya entre ganancia y
   * pérdida, que ningún caso de este fichero pisaba.
   *
   * Los números están elegidos para que el valor de transmisión caiga clavado sobre el de
   * adquisición CON todo calculado —plusvalía incluida—, que es el escenario en el que la
   * app no puede escudarse en un «Techo»:
   *   plusvalía objetivo = 4.000 × 0,18 (coef. de 5 años, art. 107.4 TRLRHL, RDL 8/2023)
   *                        × 25 % (`PLUSVALIA_MUNICIPAL_META.tipoOrientativo`) = 180,00
   *   método real = (20.000 − 17.820) × (4.000 / 9.000) × 25 % = 242,22 → gana el objetivo
   *   comisión = 20.000 × 10 % = 2.000,00
   *   valor de transmisión = 20.000 − 2.000 − 180 = 17.820,00  (art. 35.1 LIRPF)
   *   valor de adquisición = 17.820 + 0 = 17.820,00
   *   ganancia = 17.820 − 17.820 = 0,00 exacto · IRPF = 0
   *   total gastos = 180 + 2.000 = 2.180,00 · neto = 20.000 − 2.180 = 17.820,00
   * ⚠️ 24/09/2026 (hallazgo 1559): con el coeficiente anterior (0,17) la compra era 17.830;
   * se mueve a 17.820 para que la ganancia siga cayendo en el 0 exacto.
   */
  test('CASO 30 (límite) — ganancia patrimonial exactamente 0 con todo calculado', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['input[aria-label="Precio del trastero"]']);
    await sembrar(page, 'Precio del trastero', '20000');
    await page.getByRole('button', { name: /Vendedor/ }).click();
    await sembrar(page, 'Precio de compra original', '17820');
    await sembrar(page, 'Años de propiedad', '5');
    await sembrar(page, 'Valor catastral del suelo', '4000');
    await sembrar(page, 'Valor catastral total (suelo + construcción)', '9000');
    await sembrar(page, 'Comisión inmobiliaria (%)', '10');

    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('180,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe(
      'Método objetivo (más favorable)',
    );
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('17.820,00 €');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('17.820,00 €');

    // No hay cuota, y eso sí está bien dicho: `calcularCuotaBaseAhorro(0)` es 0.
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('SIN CUOTA');
    expect(await valorTarjeta(page, 'Comisión inmobiliaria')).toBe('2000,00 €');
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('2180,00 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('17.820,00 €');
    // Todo está calculado, así que el neto NO es un techo.
    expect(await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe(
      'Lo que realmente recibes tras los gastos',
    );
    // Y la tarjeta del cero ya no se llama «Pérdida patrimonial» ni aconseja compensarla:
    // se vende EXACTAMENTE por el valor de adquisición, que no es ni ganancia ni pérdida
    // (hallazgo 845; el motor lo distingue con `sinGananciaNiPerdida`).
    expect(await valorTarjeta(page, 'Sin ganancia ni pérdida')).toBe('0,00 €');
    expect(await descripcionTarjeta(page, 'Sin ganancia ni pérdida')).toContain(
      'exactamente por el valor de adquisición',
    );
  });

  /**
   * CASO 31 (DEBE RECHAZARSE) — unos años de propiedad NEGATIVOS, con el foco todavía
   * puesto. Repite el contrato del CASO 19 con otros números porque es la mitad que hoy
   * funcionaba, y es el contraste que hizo medible el hallazgo 844 de más abajo (reparado el
   * 15/09/2026): el MISMO dato, después de salir del campo, sí se liquidaba.
   */
  test('CASO 31 (debe rechazarse) — unos años negativos no son un año de tenencia', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['input[aria-label="Precio del trastero"]']);
    await sembrar(page, 'Precio del trastero', '30000');
    await page.getByRole('button', { name: /Vendedor/ }).click();
    await sembrar(page, 'Precio de compra original', '18000');
    await sembrar(page, 'Impuestos y gastos que pagaste al comprarlo', '1000');
    await sembrar(page, 'Valor catastral del suelo', '6000');
    await sembrar(page, 'Valor catastral total (suelo + construcción)', '15000');

    // Sin blur: el `min={0}` de NumberInput aún no ha reescrito el campo.
    const anios = page.locator('input[aria-label="Años de propiedad"]');
    await anios.fill('-4');
    await esperarValorEnReact(page, 'input[aria-label="Años de propiedad"]', '-4');

    // Ni con el coeficiente de 1 año (0,13) ni con el de «menos de 1 año» (0,14): un año
    // negativo se RECHAZA, y el neto se entrega como techo nombrando lo que falta.
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('SIN CALCULAR');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toContain(
      'los años de propiedad',
    );
    // Lo que no depende de los años sí se calcula (art. 35 LIRPF):
    //   valor de adquisición = 18.000 + 1.000 = 19.000
    //   comisión = 30.000 × 3 % (por defecto) = 900 · plusvalía 0 porque falta
    //   valor de transmisión = 30.000 − 900 = 29.100 · ganancia = 10.100
    //   IRPF = 6.000 × 19 % + 4.100 × 21 % = 1.140 + 861 = 2.001
    //   total gastos = 900 + 2.001 = 2.901 · neto = 30.000 − 2.901 = 27.099
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('19.000,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('10.100,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('2001,00 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('27.099,00 €');
    expect(await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR')).toContain('No descuenta');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// HALLAZGOS DEL 14/09/2026 — REPARADOS el 15/09 y verificados el 21/09/2026.
// Nacieron con `test.fail()` afirmando lo que DEBERÍA pasar; al repararlos se les quitó la
// marca y hoy sujetan la reparación. Los comentarios conservan el caso de origen entero:
// la descripción de un defecto reparado es lo único que impide reintroducirlo.
// ═════════════════════════════════════════════════════════════════════════════

// ✅ REPARADO 15/09/2026 (medio) — operativa. El `blur` convertía un dato IMPOSIBLE en un
// escenario fiscal distinto y perfectamente válido, y lo liquidaba. Caso de origen:
// `page.tsx` documenta el contrato en su `useMemo`: «Un año NEGATIVO no se acota a 0: se
// rechaza […] Acotarlo lo convertiría en una reventa antes del año y liquidaría un impuesto a
// partir de un dato imposible». El `useMemo` cumple — el CASO 31 lo comprueba— pero el campo
// lleva `min={0}`, y el `handleBlur` de `NumberInput` reescribe a «0» todo lo que baje del
// mínimo. Y «0» no es un valor neutro aquí: desde el RDL 26/2021 es la reventa antes de
// cumplir el año, que tributa con el coeficiente 0,14 de `COEFICIENTES_IIVTNU_2025` —el
// tercero más alto de la tabla— y que el propio `helperText` del campo invita a escribir.
// Al salir del campo la app liquida:
//   plusvalía objetivo = 6.000 × 0,14 × 25 % = 210,00
//   valor de transmisión = 30.000 − 900 (comisión 3 %) − 210 = 28.890
//   ganancia = 28.890 − 19.000 = 9.890 · IRPF = 6.000 × 19 % + 3.890 × 21 % = 1.956,90
//   neto = 30.000 − (210 + 900 + 1.956,90) = 26.933,10
// y lo presenta como DEFINITIVO: el «Techo» del CASO 31 desaparece y el neto pasa a decir
// «Lo que realmente recibes tras los gastos». Nada en pantalla dice que el −4 se convirtió en
// otra cosa. Es la mitad del hallazgo 764 que quedó viva: allí se cerró el −0,5 con el foco
// puesto, y el mismo signo sigue teniendo dos tratamientos según se mire antes o después de
// salir del campo. Afecta igual a los demás campos con `min={0}`, pero en ninguno el valor
// acotado significa un escenario fiscal distinto: solo en los años.
// Caso: 30.000 / 18.000 / gastos 1.000 / suelo 6.000 de 15.000 / años «−4» + Tab
//       → esperado: «SIN CALCULAR» y neto como techo, igual que con el foco puesto
//       → obtenido: plusvalía 210,00 €, IRPF 1.956,90 €, neto 26.933,10 € y
//         «Lo que realmente recibes tras los gastos»
test('REPARADO 15/09 (operativa) — al salir del campo, unos años negativos siguen sin liquidarse', async ({
  page,
}) => {
  await page.goto(RUTA);
  await esperarHidratacion(page, ['input[aria-label="Precio del trastero"]']);
  await sembrar(page, 'Precio del trastero', '30000');
  await page.getByRole('button', { name: /Vendedor/ }).click();
  await sembrar(page, 'Precio de compra original', '18000');
  await sembrar(page, 'Impuestos y gastos que pagaste al comprarlo', '1000');
  await sembrar(page, 'Valor catastral del suelo', '6000');
  await sembrar(page, 'Valor catastral total (suelo + construcción)', '15000');

  const anios = page.locator('input[aria-label="Años de propiedad"]');
  await anios.fill('-4');
  await esperarValorEnReact(page, 'input[aria-label="Años de propiedad"]', '-4');
  await anios.blur();
  // ✅ El blur YA NO reescribe el campo a «0» (hallazgo 844): `acotarAlSalir={false}`. El 0
  // no era neutro aquí —es la reventa antes de cumplir el año, coeficiente 0,14—, así que
  // acotar convertía un dato imposible en un supuesto fiscal válido y lo liquidaba como
  // definitivo, justo lo que el useMemo de la página declara que no debe pasar.
  await esperarValorEnReact(page, 'input[aria-label="Años de propiedad"]', '-4');

  expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('SIN CALCULAR');
  // Y el neto sigue siendo un TECHO, no lo que se recibe: igual que con el foco dentro.
  expect(await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR')).toContain('No descuenta');
});

// ✅ REPARADO 15/09/2026 (medio) — contenido. Lo que la app ROTULABA cuando la ganancia
// patrimonial es exactamente 0. Caso de origen:
// `calcularGananciaInmueble` marca `esPerdida = ganancia <= 0`, de modo que el cero exacto
// entra por la rama de la pérdida: la app pinta «Pérdida patrimonial 0,00 €» con la
// descripción «Vendes por debajo del valor de adquisición: no hay IRPF y la pérdida se puede
// compensar en la declaración». Las dos mitades son falsas —no se vende por debajo del valor
// de adquisición, se vende exactamente por él, y no hay ninguna pérdida que compensar—, y la
// segunda invita a una casilla de la declaración que ese caso no genera. La cifra, 0,00 €,
// sí es correcta: lo que falla es el rótulo. Es el mismo criterio que el hallazgo 483 fijó
// para el IRPF («ese 0 no es una exención, es un dato que falta»), aplicado al otro cero de
// la misma pantalla.
// Caso: 20.000 / 17.820 / 5 años / suelo 4.000 de 9.000 / comisión 10 % (CASO 30; era 17.830
//       con el coeficiente de 5 años anterior al RDL 8/2023, 0,17 — hallazgo 1559)
//       → esperado: un rótulo que no afirme una venta por debajo del coste ni una pérdida
//         compensable — «Ganancia patrimonial 0,00 €» o equivalente
//       → obtenido: «Pérdida patrimonial 0,00 €» + «Vendes por debajo del valor de
//         adquisición: no hay IRPF y la pérdida se puede compensar en la declaración»
test('REPARADO 15/09 (contenido) — una ganancia de 0 ya no se rotula como venta por debajo del coste', async ({
  page,
}) => {
  await page.goto(RUTA);
  await esperarHidratacion(page, ['input[aria-label="Precio del trastero"]']);
  await sembrar(page, 'Precio del trastero', '20000');
  await page.getByRole('button', { name: /Vendedor/ }).click();
  await sembrar(page, 'Precio de compra original', '17820');
  await sembrar(page, 'Años de propiedad', '5');
  await sembrar(page, 'Valor catastral del suelo', '4000');
  await sembrar(page, 'Valor catastral total (suelo + construcción)', '9000');
  await sembrar(page, 'Comisión inmobiliaria (%)', '10');

  expect(await descripcionPatrimonial(page)).not.toContain('por debajo');
});

// ✅ REPARADO 15/09/2026 (bajo) — contenido. La página publicaba DOS bloques FAQPage. Caso de
// origen:
// `metadata.ts` exporta `jsonLd = combineSchemas(webAppSchema, faqSchema)` —donde `faqSchema`
// ya es un FAQPage de cinco preguntas— y además un `faqJsonLd` de seis, y el `layout.tsx`
// inyecta los dos. Servido: dos nodos `"@type":"FAQPage"` para una sola URL, con cinco
// preguntas repetidas palabra por palabra. Las hermanas `local-comercial` y `nave-industrial`
// sirven UNO (su `jsonLd` es solo el `generateWebAppSchema`); `trastero` y `garaje`, dos.
// Lo que lo convierte en hallazgo y no en redundancia inocua es que tres de esas cinco
// respuestas están escritas DOS VECES a mano en el mismo fichero —solo las dos que el
// hallazgo 774 centralizó viajan en constante— y una de ellas YA ha divergido: la de los
// tipos reducidos dice «algunas CCAA pueden extenderlos» en `faqSchema` (metadata.ts:106) y
// «algunas comunidades autónomas pueden extenderlos» en `faqJsonLd` (metadata.ts:162). Es
// exactamente el mecanismo que el 774 cerró para las otras dos, y este es el canal que citan
// los asistentes de IA sin el disclaimer al lado.
// Caso: contar los nodos FAQPage servidos en /simulador-gastos-compraventa-trastero/
//       → esperado: 1 (como en local-comercial y en nave-industrial)
//       → obtenido: 2, con las cinco preguntas de `faqSchema` repetidas en `faqJsonLd`.
test('REPARADO 15/09 (contenido) — la página sirve UN solo FAQPage para una sola URL', async ({
  page,
}) => {
  await page.goto(RUTA);
  const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
  const faqPages = bloques.flatMap((bloque) => {
    const json = JSON.parse(bloque) as Record<string, unknown>;
    const nodos = (Array.isArray(json) ? json : (json['@graph'] ?? [json])) as {
      '@type'?: string;
    }[];
    return nodos.filter((n) => n['@type'] === 'FAQPage');
  });
  expect(faqPages).toHaveLength(1);
});

// ═════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 21/09/2026 — Asturias, la reventa dentro del mismo año y un par
// catastral imposible.
//
// La cola la reabrió tras la reparación del 15/09 (hallazgos 822/844 el blur, 823/845 la
// ganancia cero y 846 el FAQPage duplicado), que los tres tests de arriba dejan sujeta.
// Los casos de hoy van a las tres zonas que esa reparación deja expuestas:
//
//   · CASO 32 — Asturias, la ÚLTIMA comunidad con escala progresiva que ninguna de las
//     doce rondas anteriores había elegido, con perfil general.
//   · CASO 33 — la CONTRAPARTIDA de la reparación del blur: el 0 en «Años de propiedad»
//     es un dato VÁLIDO (la reventa antes de cumplir el año, coeficiente 0,14 de
//     COEFICIENTES_IIVTNU_2025). Si la guarda del negativo se hubiera pasado de frenada,
//     aquí se vería: el 0 tiene que liquidar y el neto tiene que ser DEFINITIVO, no un
//     techo. Ninguna ronda lo había probado en esta app por el camino del vendedor
//     completo, y era alcanzable solo desde la reparación del 07/09 (hallazgo 666).
//   · CASO 34 — el par catastral IMPOSIBLE (suelo por encima del total, que por
//     definición lo incluye): el único campo del vendedor sin caso de rechazo en este
//     fichero, y la rama `parCatastralImposible` que el hallazgo 900 añadió al motor.
// ═════════════════════════════════════════════════════════════════════════════

test.describe('RE-INSPECCIÓN 21/09/2026 — Asturias, la reventa dentro del año y un par catastral imposible', () => {
  /**
   * CASO 32 (NORMAL) — Asturias, segunda mano, 28.000 €, comprador GENERAL.
   *
   * Comunidad nueva: su escala progresiva (8/9/10 %, `ITP_CCAA.asturias.tramosProgresivos`)
   * era la única sin usar. El perfil general interesa aquí porque sus TRES tipos reducidos
   * —jóvenes, familia numerosa y familia monoparental, todos al 4 %— exigen «Vivienda
   * habitual» Y son de colectivo, de modo que `elegirTipoITP` no puede ni aplicarlos ni
   * ofrecerlos: el aviso «Podrías pagar menos» NO debe pintarse. Es el caso simétrico del
   * CASO 29, donde sí sale.
   *
   * Resuelto a mano ANTES de ejecutar la app:
   *   ITP — 28.000 cabe entero en el primer tramo (8 % hasta 300.000):
   *     28.000 × 8 % = 2.240,00 · tipo EFECTIVO = 2.240 / 28.000 = 8,00 %
   *   Notaría — RD 1426/1989 nº 2 (`ARANCELES_NOTARIO`) sobre 28.000:
   *     90,151816 + (28.000 − 6.010,12) × 0,45 % = 90,151816 + 98,95446 = 189,106276
   *     × 0,95 (rebaja del nº 2.1, 17/10/2026, cabo C0209) = 179,650962
   *     con IVA ×1,21 = 217,377664 · factura ×1,5 = 326,066496 · ×2 = 434,755328
   *     medio = 380,410912 → 380,41
   *   Registro — RD 1427/1989 nº 2 (`ARANCELES_REGISTRO`) sobre 28.000:
   *     24,040484 + (28.000 − 6.010,12) × 0,175 % = 24,040484 + 38,48229 = 62,522774 × 0,95 =
   *     59,396635 + presentación 6,010121 + nota simple 3,005061 = 68,411817 · ×1,21 = 82,778299
   *   Total = 2.240 + 380,41 + 82,78 + 300 (gestoría por defecto) = 3.003,19
   *     porcentaje = 3.003,19 / 28.000 = 10,7257 % → 10,73 %
   *   Coste total = 28.000 + 3.003,19 = 31.003,19
   *   (sin la rebaja: 400,43 · 343,22–457,63 · 86,56 · 3.026,99)
   */
  test('CASO 32 (normal) — Asturias, segunda mano, 28.000 €, comprador general', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['input[aria-label="Precio del trastero"]']);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await selectCcaa(page).selectOption('asturias');
    await sembrar(page, 'Precio del trastero', '28000');

    expect(await valorTarjeta(page, /^ITP/)).toBe('2240,00 €');
    await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (8,00 %)');
    await expect(page.getByText(/Esta comunidad aplica escala progresiva/)).toContainText(
      '(8 % → 9 % → 10 %)', // `describirSubidaITP` (24/09/2026)
    );

    // Segunda mano: no hay AJD (el 1,2 % de la ficha de Asturias es de primera mano).
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);

    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('380,41 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain(
      'entre 326,07 € y 434,76 €',
    );
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('82,78 €');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('300,00 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('3003,19 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toBe(
      '10,73 % sobre el precio',
    );
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('31.003,19 €');

    // Los tres reducidos de Asturias exigen vivienda habitual Y son de colectivo: ni se
    // aplican ni se ofrecen. Ofrecerlos sería prometer una rebaja imposible para un
    // trastero suelto (contrato de `elegirTipoITP`, 14/08/2026).
    await expect(page.locator('[role="note"]', { hasText: /Podrías pagar menos/ })).toHaveCount(
      0,
    );
  });

  /**
   * CASO 33 (LÍMITE) — 0 AÑOS de propiedad: la reventa dentro del mismo año.
   *
   * Es la contrapartida de la reparación del 15/09. Aquella acotó el `blur` para que un año
   * NEGATIVO no se convirtiera en un 0 —que es un supuesto fiscal válido y caro—, y el modo
   * de pasarse de frenada sería rechazar también el 0 legítimo. Aquí tiene que liquidar: el
   * RDL 26/2021 sujeta la transmisión anterior al año. Se escribe con `fill()` + `blur()` a
   * propósito, que es donde vivía el defecto.
   *
   * ⚠️ 24/09/2026 (hallazgos 1559 y 1560): el art. 107.4 TRLRHL (redacción del RDL 8/2023)
   * no da un coeficiente fijo a la reventa antes del año, sino el anual (0,15) PRORRATEADO por
   * los meses completos. La app usaba 0,14 fijo; ahora pregunta los meses (aquí, 8).
   *
   * Resuelto a mano ANTES de ejecutar la app (20.000 / 16.000 / 0 años y 8 meses / suelo
   * 5.000 de 12.000 / comisión 3 % por defecto / sin gastos de adquisición ni gestoría):
   *   coeficiente        = 0,15 × 8/12 = 0,10
   *   plusvalía objetivo = 5.000 × 0,10 × 25 % (`PLUSVALIA_MUNICIPAL_META.tipoOrientativo`)
   *                      = 125,00
   *   plusvalía real     = (20.000 − 16.000) × (5.000 / 12.000) × 25 % = 416,666…
   *                      → gana el OBJETIVO, que es el menor (art. 107.4 y 107.5 TRLHL)
   *   comisión           = 20.000 × 3 % = 600,00
   *   valor transmisión  = 20.000 − 600 − 125 = 19.275,00   (art. 35.1 LIRPF)
   *   valor adquisición  = 16.000,00
   *   ganancia           = 3.275,00 · IRPF = 3.275 × 19 % = 622,25 (primer tramo del ahorro)
   *   total gastos       = 125 + 600 + 622,25 = 1.347,25 · neto = 20.000 − 1.347,25 = 18.652,75
   */
  test('CASO 33 (límite) — 0 años de propiedad: la reventa dentro del año sí se liquida', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['input[aria-label="Precio del trastero"]']);
    await sembrar(page, 'Precio del trastero', '20000');
    await page.getByRole('button', { name: /Vendedor/ }).click();
    await sembrar(page, 'Precio de compra original', '16000');
    await sembrar(page, 'Valor catastral del suelo', '5000');
    await sembrar(page, 'Valor catastral total (suelo + construcción)', '12000');

    const anios = page.locator('input[aria-label="Años de propiedad"]');
    await anios.fill('0');
    await esperarValorEnReact(page, 'input[aria-label="Años de propiedad"]', '0');
    await anios.blur();
    // El 0 sobrevive al blur igual que el −4 del test de arriba: `acotarAlSalir={false}` no
    // reescribe NADA, ni por abajo ni por arriba. Si algún día volviera a acotar, aquí no se
    // notaría (0 ya es el mínimo), y por eso este test comprueba el RESULTADO y no el campo.
    await esperarValorEnReact(page, 'input[aria-label="Años de propiedad"]', '0');
    await page.locator('#meses-completos').selectOption('8');

    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('125,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe(
      'Método objetivo (más favorable)',
    );
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('16.000,00 €');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('19.275,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('3275,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('622,25 €');
    expect(await valorTarjeta(page, 'Comisión inmobiliaria')).toBe('600,00 €');
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('1347,25 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('18.652,75 €');
    // La aserción que de verdad separa este caso del −4: con 0 años y los meses elegidos NO
    // falta ningún dato, así que el neto es definitivo y no un techo.
    expect(await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe(
      'Lo que realmente recibes tras los gastos',
    );
  });

  /**
   * CASO 34 (DEBE RECHAZARSE) — un par catastral IMPOSIBLE: el suelo por encima del total.
   *
   * El valor catastral total incluye el suelo por definición, así que 12.000 de suelo dentro
   * de 9.000 totales no describe ningún inmueble: es el despiste de intercambiar dos campos
   * que salen consecutivos del mismo recibo del IBI. Lo que NO puede pasar es que el método
   * real se calcule igual dando el suelo por el 100 % del inmueble y se rotule «más
   * favorable» (rama `parCatastralImposible` del motor, hallazgo 900). El objetivo sí es
   * calculable —solo necesita el suelo— y se aplica, nombrando el par imposible.
   *
   * Resuelto a mano ANTES de ejecutar la app (20.000 / 16.000 / 5 años / suelo 12.000 de
   * 9.000 / comisión 3 % por defecto):
   *   plusvalía objetivo = 12.000 × 0,18 (coef. de 5 años, art. 107.4 TRLRHL, RDL 8/2023;
   *                        era 0,17 hasta el 24/09/2026, hallazgo 1559) × 25 % = 540,00
   *   método real        — NO disponible: el par es imposible
   *   valor transmisión  = 20.000 − 600 − 540 = 18.860,00 · adquisición = 16.000,00
   *   ganancia           = 2.860,00 · IRPF = 2.860 × 19 % = 543,40
   *   total gastos       = 540 + 600 + 543,40 = 1.683,40 · neto = 20.000 − 1.683,40 = 18.316,60
   */
  test('CASO 34 (debe rechazarse) — el suelo no puede superar al valor catastral total', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['input[aria-label="Precio del trastero"]']);
    await sembrar(page, 'Precio del trastero', '20000');
    await page.getByRole('button', { name: /Vendedor/ }).click();
    await sembrar(page, 'Precio de compra original', '16000');
    await sembrar(page, 'Años de propiedad', '5');
    await sembrar(page, 'Valor catastral del suelo', '12000');
    await sembrar(page, 'Valor catastral total (suelo + construcción)', '9000');

    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('540,00 €');
    const metodo = await descripcionTarjeta(page, 'Plusvalía municipal');
    expect(metodo).toContain('el valor catastral del suelo no puede superar al total');
    // Y sobre todo: NO se presenta un método real como «más favorable» a partir del par
    // imposible, que es lo que el `Math.min(1, suelo/total)` hacía antes del hallazgo 900.
    expect(metodo).not.toContain('Método real');

    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('2860,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('543,40 €');
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('1683,40 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('18.316,60 €');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// HALLAZGOS de la re-inspección del 21/09/2026 — REPARADOS.
// Nacieron con `test.fail()` afirmando lo que DEBERÍA pasar; al repararlos se les quitó la
// marca y quedan como regresión.
// ═════════════════════════════════════════════════════════════════════════════

// ✅ HALLAZGO 1157 del 21/09/2026 (medio) — operativa, REPARADO el 21/09. Era la mitad del
// hallazgo 773 que quedó viva.
// Aquel cerró la COMISIÓN: «Un valor ILEGIBLE no es un cero: es un dato que falta, y esta app
// ya sabe abstenerse y nombrarlo». La reparación añadió `comisionLegible` y solo a ese campo.
// Los otros dos campos del vendedor siguen leyéndose con `parseSpanishNumberOr`, que devuelve
// su 0 por defecto cuando el parser RECHAZA el texto, de modo que un dato ilegible y un campo
// vacío son la misma cosa para el motor y nada en pantalla lo dice:
//   · «Impuestos y gastos que pagaste al comprarlo» — su propio helperText dice que SUMAN al
//     valor de adquisición y REDUCEN la ganancia (art. 35.1 LIRPF). Al desaparecer, el IRPF
//     sube. Y la tarjeta «Valor de adquisición» sigue describiéndose como «Precio de compra +
//     impuestos y gastos de aquella compra», que en ese momento es falso.
//   · «Gestoría y certificados del vendedor (€)» — gasto de transmisión del mismo artículo:
//     al desaparecer suben la ganancia, el IRPF y el neto a la vez.
// No hace falta teclear basura para llegar: «2.000.50» —el millar y el decimal a la
// estadounidense, un copiar y pegar corriente— es NaN para `parseSpanishNumber` (lo es por
// diseño desde el 24/08/2026) y entra por este camino.
// Caso: 20.000 / 16.000 / 5 años / suelo 5.000 de 12.000 / gastos de adquisición «2.000.50»
//       → esperado: el neto marcado nombrando el dato ilegible, igual que hace la app con la
//         comisión desde el hallazgo 773
//       → obtenido: valor de adquisición 16.000,00 €, ganancia 3.187,50 €, IRPF 605,63 €
//         (frente a los 130,53 € que salen leyendo 2.000,50) y el neto presentado como
//         «Lo que realmente recibes tras los gastos»
//
// ⚠️ 22/09/2026 — este testigo pedía la palabra «Techo» y la palabra era el defecto siguiente
// (hallazgo 1202). Aquella reparación metió los tres importes en la misma frase, y para estos
// gastos la dirección es la CONTRARIA: suman al valor de adquisición (art. 35.1 LIRPF),
// reducen la ganancia y con ella el IRPF, así que su ausencia deja el neto por DEBAJO del
// real. Aquí se ve en las cifras del propio caso: el IRPF pasa de 605,63 € a 130,53 € al leer
// el dato, es decir el neto SUBE. La aserción se cambia a «Suelo», que es lo que la cifra es.
test('REGRESIÓN 1157+1202 (operativa) — unos gastos de adquisición ilegibles se nombran, y como SUELO', async ({
  page,
}) => {
  await page.goto(RUTA);
  await esperarHidratacion(page, ['input[aria-label="Precio del trastero"]']);
  await sembrar(page, 'Precio del trastero', '20000');
  await page.getByRole('button', { name: /Vendedor/ }).click();
  await sembrar(page, 'Precio de compra original', '16000');
  await sembrar(page, 'Años de propiedad', '5');
  await sembrar(page, 'Valor catastral del suelo', '5000');
  await sembrar(page, 'Valor catastral total (suelo + construcción)', '12000');

  const gastos = page.locator('input[aria-label="Impuestos y gastos que pagaste al comprarlo"]');
  await gastos.fill('2.000.50');
  await esperarValorEnReact(
    page,
    'input[aria-label="Impuestos y gastos que pagaste al comprarlo"]',
    '2.000.50',
  );
  await gastos.blur();

  const aviso = await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR');
  expect(aviso).toContain('los impuestos y gastos de aquella compra');
  expect(aviso).toContain('Escribe con coma decimal (1.234,56)');
  // La dirección importa: leer el dato SUBE el neto, así que la cifra es un suelo.
  expect(aviso).toMatch(/el neto real es MAYOR que este/);
  expect(aviso).not.toMatch(/menor que este/);
});

// ✅ HALLAZGO 1158 del 21/09/2026 (bajo) — contenido, REPARADO el 21/09. La FAQ visible y el
// FAQPage servido estaban
// escritos DOS VECES a mano en tres de sus seis respuestas, y dos ya han divergido.
// El hallazgo 774 centralizó en constantes las respuestas del IVA y de la plusvalía
// («¿Qué IVA paga un trastero nuevo?» y «¿Se paga plusvalía municipal…?») precisamente para
// que la respuesta visible y la estructurada no pudieran divergir, y el 846 citó esa
// divergencia como la razón para dejar UN solo FAQPage. Las otras tres —vinculado vs
// independiente, comprar sin la vivienda y tipos reducidos— se quedaron duplicadas: el texto
// vive a la vez en `page.tsx` (JSX, con sus `<strong>`) y en `faqJsonLd` de `metadata.ts`.
// Las dos divergencias de hoy son de redacción, no de fondo —«como anejo» frente a «como
// anejo de la vivienda», y «algunas CCAA» frente a «algunas comunidades autónomas»—, así que
// no engañan a nadie; lo que demuestran es que el mecanismo sigue abierto, y este es el canal
// que citan los asistentes de IA sin el disclaimer al lado. (De paso, «CCAA» es de las
// abreviaturas España-only que el CLAUDE.md pide evitar.)
// Caso: comparar cada respuesta visible con la del FAQPage servido
//       → esperado: las 6 iguales, como ya lo son las 3 que viajan en constante
//       → obtenido: 4 iguales y 2 distintas
test('REGRESIÓN 1158 (contenido) — las seis respuestas de la FAQ visible y del FAQPage son la misma', async ({
  page,
}) => {
  await page.goto(RUTA);
  const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
  const faqPage = bloques
    .map((b) => JSON.parse(b) as Record<string, unknown>)
    .find((j) => j['@type'] === 'FAQPage') as
    | { mainEntity: { name: string; acceptedAnswer: { text: string } }[] }
    | undefined;
  expect(faqPage).toBeDefined();

  const divergentes: string[] = [];
  for (const item of await page.locator('[class*="faqItem"]').all()) {
    const pregunta = (await item.locator('h4').innerText()).replace(/\s+/g, ' ').trim();
    const visible = (await item.locator('p').innerText())
      .replace(ESPACIO_DURO, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const nodo = faqPage!.mainEntity.find(
      (q) => q.name.replace(/\s+/g, ' ').trim() === pregunta,
    );
    const estructurada = (nodo?.acceptedAnswer.text ?? '(sin nodo)')
      .replace(ESPACIO_DURO, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (visible !== estructurada) divergentes.push(pregunta);
  }
  expect(divergentes).toEqual([]);
});

// ─────────────────────────────────────────────────────────────────────────────
// RE-INSPECCIÓN 22/09/2026
//
// Territorio nuevo: NAVARRA (régimen foral, ITP 6 % y el AJD más bajo de la tabla junto al
// País Vasco) y BALEARES, cuya escala progresiva de cinco tramos era la única sin usar. Y
// una raya que ninguna ronda anterior había pisado: los 6.010,12 € donde TERMINA el primer
// tramo del arancel notarial y del registral (RD 1426/1989 y RD 1427/1989, número 2), que
// es el único punto del catálogo donde un trastero de precio realista cae justo en el
// límite de un arancel.
//
// De dónde sale CADA cifra esperada (ninguna de memoria):
//  - ITP general de Navarra (6 %) y de Baleares (8 % del primer tramo) → `TIPOS_ITP_CCAA_2025`
//    en `data/fiscal/inmuebles.ts`, leído por `tipoGeneralDe()` en `data/itp-ccaa.ts`.
//  - Escala progresiva de Baleares (8/9/10/12/13 %) y AJD de Navarra (0,5 %) → `ITP_CCAA`.
//  - Aranceles → `ARANCELES_NOTARIO` + `FACTURA_NOTARIAL` (×1,5 a ×2, medio ×1,75) y
//    `ARANCELES_REGISTRO` + `REGISTRO_CONCEPTOS` (presentación 6,010121 · nota simple 3,005061).
//  - Ganancia e IRPF → `calcularGananciaInmueble` sobre `TRAMOS_GANANCIAS_PATRIMONIALES_2025`.
//  - Plusvalía → `calcularPlusvaliaMunicipal` sobre `COEFICIENTES_IIVTNU_2025` (5 años → 0,17)
//    y `PLUSVALIA_MUNICIPAL_META.tipoOrientativo` = 25 %.
// ─────────────────────────────────────────────────────────────────────────────
test.describe('RE-INSPECCIÓN 22/09/2026 — Navarra, la raya del arancel y la gestoría del comprador', () => {
  /**
   * CASO 35 (NORMAL) — Navarra, segunda mano, 26.000 €, comprador GENERAL.
   *
   * Comunidad nueva y foral: `tipoGeneral: 6` y `ajd: 0.5`, sin escala progresiva. Sus dos
   * únicos tipos reducidos exigen vivienda habitual (5 %) o municipio despoblado + vivienda
   * habitual (4 %), así que un trastero suelto no puede acogerse a ninguno Y tampoco se le
   * pueden OFRECER: el aviso «Podrías pagar menos» no debe pintarse, igual que en el CASO 32.
   *
   * Resuelto a mano ANTES de ejecutar la app:
   *   ITP — 26.000 × 6 % = 1.560,00 · tipo EFECTIVO = 1.560 / 26.000 = 6,00 %
   *   Notaría — RD 1426/1989 nº 2 sobre 26.000:
   *     90,151816 + (26.000 − 6.010,12) × 0,45 % = 90,151816 + 89,95446 = 180,106276
   *     × 0,95 (rebaja del nº 2.1, 17/10/2026, cabo C0209) = 171,100962
   *     con IVA ×1,21 = 207,032164 · ×1,5 = 310,548246 · ×2 = 414,064328
   *     medio = 362,306287 → 362,31
   *   Registro — RD 1427/1989 nº 2 sobre 26.000:
   *     24,040484 + (26.000 − 6.010,12) × 0,175 % = 24,040484 + 34,98229 = 59,022774 × 0,95 =
   *     56,071635 + 6,010121 + 3,005061 = 65,086817 · ×1,21 = 78,755049 → 78,76
   *   Total = 1.560 + 362,31 + 78,76 + 300 (gestoría por defecto) = 2.301,07
   *     porcentaje = 2.301,07 / 26.000 = 8,8503 % → 8,85 %
   *   Coste total = 26.000 + 2.301,07 = 28.301,07
   *   (sin la rebaja: 381,37 · 326,89–435,85 · 82,33 · 2.323,70)
   */
  test('CASO 35 (normal) — Navarra, segunda mano, 26.000 €, comprador general', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['input[aria-label="Precio del trastero"]']);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await selectCcaa(page).selectOption('navarra');
    await sembrar(page, 'Precio del trastero', '26000');

    await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (6,00 %)');
    expect(await valorTarjeta(page, /^ITP/)).toBe('1560,00 €');
    expect(await descripcionTarjeta(page, /^ITP/)).toBe('ITP Comunidad Foral de Navarra');

    // Régimen foral: 6 % de ITP y 0,5 % de AJD, el más bajo de la tabla tras el 0 % vasco.
    await expect(page.getByText('ITP General').locator('xpath=..')).toContainText('6 %');
    await expect(page.getByText('AJD', { exact: true }).locator('xpath=..')).toContainText('0,5 %');
    // Navarra NO tiene escala progresiva: el aviso que la anuncia no puede aparecer.
    await expect(page.getByText(/Esta comunidad aplica escala progresiva/)).toHaveCount(0);
    // Segunda mano: no hay AJD.
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);

    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('362,31 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain(
      'entre 310,55 € y 414,06 €',
    );
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('78,76 €');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('300,00 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('2301,07 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toBe(
      '8,85 % sobre el precio',
    );
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('28.301,07 €');

    // Los dos reducidos navarros exigen vivienda habitual: ni se aplican ni se ofrecen.
    await expect(page.locator('[role="note"]', { hasText: /Podrías pagar menos/ })).toHaveCount(
      0,
    );
  });

  /**
   * CASO 36 (LÍMITE) — Baleares, 6.010,12 €: el precio que cae EXACTAMENTE en el techo del
   * primer tramo de los dos aranceles.
   *
   * `calcularArancelNotarial` y `calcularRegistro` salen del bucle con
   * `if (valor <= limiteAnterior) break`, y ese límite es justo 6.010,12. Un céntimo menos y
   * un céntimo más recorren ramas distintas del bucle, así que el punto es la frontera entre
   * la cuota FIJA (90,15 € de notaría, 24,04 € de registro) y el porcentaje sobre el exceso.
   * De paso estrena la escala de Baleares, la única de las cinco tramos sin usar: aquí solo
   * puede entrar en su primer tramo (8 % hasta 400.000), y el aviso debe anunciar los cinco.
   *
   * Resuelto a mano ANTES de ejecutar la app:
   *   ITP — 6.010,12 cabe entero en el primer tramo: 6.010,12 × 8 % = 480,8096 → 480,81
   *     tipo EFECTIVO = 480,8096 / 6.010,12 = 8,00 %
   *   Notaría — el bucle da la base fija del primer tramo y CORTA (6.010,12 ≤ 6.010,12):
   *     90,151816 × 0,95 (rebaja del nº 2.1, 17/10/2026, cabo C0209) = 85,644225 · con IVA
   *     ×1,21 = 103,629512 · ×1,5 = 155,444268 · ×2 = 207,259025
   *     medio = 181,351647 → 181,35
   *   Registro — misma frontera: 24,040484 × 0,95 = 22,838460 + 6,010121 + 3,005061 = 31,853642
   *     ×1,21 = 38,542907 → 38,54
   *   Total = 480,81 + 181,35 + 38,54 + 300 = 1.000,70
   *     porcentaje = 1.000,70 / 6.010,12 = 16,6503 % → 16,65 %
   *   Coste total = 6.010,12 + 1.000,70 = 7.010,82
   *   (sin la rebaja: 190,89 · 163,62–218,16 · 40,00 · 1.011,70)
   */
  test('CASO 36 (límite) — Baleares, 6.010,12 €: el techo del primer tramo de los dos aranceles', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['input[aria-label="Precio del trastero"]']);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await selectCcaa(page).selectOption('baleares');
    await sembrar(page, 'Precio del trastero', '6010,12');

    await expect(page.locator('h3', { hasText: /^ITP/ }).first()).toHaveText('ITP (8,00 %)');
    expect(await valorTarjeta(page, /^ITP/)).toBe('480,81 €');
    await expect(page.getByText(/Esta comunidad aplica escala progresiva/)).toContainText(
      '(8 % → 9 % → 10 % → 12 % → 13 %)', // `describirSubidaITP` (24/09/2026)
    );

    // La frontera: la cuota fija del primer tramo, sin un céntimo de exceso.
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('181,35 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain(
      'entre 155,44 € y 207,26 €',
    );
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('38,54 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('1000,70 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toBe(
      '16,65 % sobre el precio',
    );
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('7010,82 €');

    // Un céntimo por encima entra en el segundo tramo, pero el exceso es de 0,45 % sobre
    // 0,01 € — cuatro cienmilésimas — así que la pantalla NO puede moverse. Es la prueba de
    // que la frontera es continua y no hay salto artificial al cambiar de tramo.
    await sembrar(page, 'Precio del trastero', '6010,13');
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('181,35 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('38,54 €');
  });

  /**
   * CASO 37 (DEBE RECHAZARSE) — «2.000.50» en la gestoría del COMPRADOR.
   *
   * Es el hueco que la reparación del 21/09 (commit ae1358d6, hallazgo 1157) dejó abierto en
   * su propia app de origen: allí se cubrieron los TRES importes del vendedor —comisión,
   * gastos de aquella compra y gestoría de la venta— con `esLegible()`, y el del COMPRADOR se
   * quedó con el `Math.max(0, parseSpanishNumberOr(gastosGestoria))` de la línea 259.
   *
   * «2.000.50» es el millar y el decimal a la estadounidense, y `parseSpanishNumber` devuelve
   * NaN POR DISEÑO desde el 24/08/2026 (dos puntos, ninguno agrupa de tres en tres). El
   * `parseSpanishNumberOr` lo convierte en 0, la tarjeta de gestoría tiene guard `> 0` y por
   * tanto desaparece, y el total baja 300 € bajo un rótulo que sigue prometiendo «todos los
   * gastos». Ni una palabra sobre el dato que no se ha podido leer.
   *
   * Medido en navegador el 22/09/2026 sobre Navarra 26.000 €:
   *   con la gestoría por defecto (300 €) → total 2.323,70 · coste 28.323,70
   *   con «2.000.50»                      → total 2.023,70 · coste 28.023,70 (−300,00)
   *   con «2000,50», la MISMA cifra legible → la tarjeta vuelve con 2000,50 €
   *   (17/10/2026, cabo C0209: con la rebaja del nº 2.1 —CASO 35— son 2.301,07 / 28.301,07 y
   *   2.001,07 / 28.001,07)
   *
   * ✅ REPARADO el 22/09/2026 (hallazgo 1201). `gestoriaLegible` distingue el campo vacío del
   * ilegible, la tarjeta se pinta igual con «Sin leer» y las dos cifras de cierre nombran lo
   * que falta. Se le retiró el `test.fail()` y queda como regresión.
   *
   * ⚠️ La segunda aserción del acta —«el total no puede ser 2023,70 €»— NO se conserva, y es
   * el punto 6 del procedimiento: el «esperado» del Inspector es una hipótesis suya, y esta
   * apuntaba a la reparación equivocada. Para que el total dejara de ser 2.023,70 € habría
   * que inventar un importe para un dato que la app NO ha podido leer, que es justamente lo
   * que prohíbe la regla del aviso bajo cifra falsa: o se calcula, o no se da cifra. La
   * reparación del VENDEDOR (hallazgo 1157, commit ae1358d6) tampoco movió el neto: nombró la
   * partida que faltaba. El testigo gemelo del garaje (1199) lo dice así, y por eso ahí el
   * acta fija `COSTE TOTAL` en 26.952,05 € DESPUÉS de reparar.
   */
  test('CASO 37 (regresión) — una gestoría del comprador ilegible se nombra en vez de leerse como 0 €', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['input[aria-label="Precio del trastero"]']);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await selectCcaa(page).selectOption('navarra');
    await sembrar(page, 'Precio del trastero', '26000');
    await sembrar(page, 'Gastos de gestoría del comprador (€)', '2.000.50');

    // FONDO: un importe que la app no puede leer no es un cero, y el coste total no puede
    // seguir anunciándose como «todos los gastos» cuando falta uno.
    expect(await descripcionTarjeta(page, 'COSTE TOTAL')).toBe(
      'No incluye la gestoría, que no se ha podido leer: el coste real será mayor',
    );

    // La línea vuelve al desglose —antes desaparecía sin dejar rastro— y dice que el importe
    // está escrito pero no se ha podido leer.
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('Sin leer');
    expect(await descripcionTarjeta(page, 'Gastos de gestoría')).toContain(
      'no se ha podido leer',
    );

    // El total SIGUE siendo el de tratarlo como ausente: la app no puede inventar el importe
    // que no ha podido leer. Lo que cambia es que ya no lo presenta como completo.
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('2001,07 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toContain(
      'SIN la gestoría, que no se ha podido leer',
    );

    // Y con la MISMA cifra escrita en español la tarjeta vuelve con su importe.
    await sembrar(page, 'Gastos de gestoría del comprador (€)', '2000,50');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('2000,50 €');
    expect(await descripcionTarjeta(page, 'COSTE TOTAL')).toBe(
      'Precio del trastero + todos los gastos',
    );
  });
});

// ── HALLAZGO de la re-inspección del 22/09/2026 — REPARADO ─────────────────────
// Nació con `test.fail()` afirmando lo que DEBERÍA pasar; al repararlo se le quitó la marca.

/**
 * El aviso del neto rotula «Techo» una ausencia que deja el neto por DEBAJO del real.
 *
 * La reparación del 1157 añadió los gastos de aquella compra a la lista de conceptos que el
 * aviso del «IMPORTE NETO VENDEDOR» nombra cuando no se pueden leer, pero los metió en la
 * MISMA frase que la comisión y la gestoría: «Techo: aún NO incluye …». Para esas dos es
 * correcto —son gastos de transmisión del art. 35.1 LIRPF, y al desaparecer el neto sube—,
 * pero los impuestos y gastos de la compra original van en la otra dirección: suman al VALOR
 * DE ADQUISICIÓN (art. 35.1 LIRPF), reducen la ganancia y con ella el IRPF, que es una de las
 * cuatro líneas que el neto resta. Su ausencia deja el neto por DEBAJO del real, así que la
 * cifra en pantalla es un SUELO y el aviso la llama techo: manda al usuario a descontar de
 * una cifra que en realidad va a subir.
 *
 * Medido en navegador el 22/09/2026 (venta 26.000 · compra 10.000 · 5 años · suelo 4.000 de
 * 9.000 · comisión 3 % por defecto · sin gestoría de venta), resuelto a mano antes:
 *   plusvalía objetivo = 4.000 × 0,18 (5 años) × 25 % = 180,00 · gana al real
 *     (16.000 × 4.000/9.000 × 25 % = 1.777,77…), art. 107.4 y 107.5 TRLHL
 *     (⚠️ 24/09/2026, hallazgo 1559: coeficiente del RDL 8/2023; con el 0,17 de antes eran
 *     170,00 y todo lo de abajo 10 € más de ganancia)
 *   comisión = 26.000 × 3 % = 780,00 · valor transmisión = 26.000 − 780 − 180 = 25.040,00
 *
 *   con «2.000.50» (ILEGIBLE → 0): adquisición 10.000,00 · ganancia 15.040,00
 *     IRPF = 6.000 × 19 % + 9.040 × 21 % = 1.140 + 1.898,40 = 3.038,40
 *     total gastos = 180 + 780 + 3.038,40 = 3.998,40 · neto = 22.001,60
 *   con «2000,50» (la MISMA cifra, legible): adquisición 12.000,50 · ganancia 13.039,50
 *     IRPF = 1.140 + 7.039,50 × 21 % = 1.140 + 1.478,295 = 2.618,295 → 2.618,30
 *     total gastos = 180 + 780 + 2.618,30 = 3.578,30 · neto = 22.421,70
 *
 * Leer el dato SUBE el neto 420,10 €. El aviso dice lo contrario.
 */
test('REGRESIÓN 22/09 (contenido) — el aviso del neto llama SUELO a lo que es un suelo', async ({
  page,
}) => {
  await page.goto(RUTA);
  await esperarHidratacion(page, ['input[aria-label="Precio del trastero"]']);
  await sembrar(page, 'Precio del trastero', '26000');
  await page.getByRole('button', { name: /Vendedor/ }).click();
  await sembrar(page, 'Precio de compra original', '10000');
  await sembrar(page, 'Impuestos y gastos que pagaste al comprarlo', '2.000.50');
  await sembrar(page, 'Años de propiedad', '5');
  await sembrar(page, 'Valor catastral del suelo', '4000');
  await sembrar(page, 'Valor catastral total (suelo + construcción)', '9000');

  // La plusvalía y el IRPF SÍ están calculados: el único concepto que falta es el que va en
  // dirección contraria, para que el aviso no pueda ser correcto «por otra de sus partes».
  expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('180,00 €');
  expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('10.000,00 €');
  expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('22.001,60 €');

  // FONDO: 22.001,60 € es el SUELO —leer el dato lo sube a 22.421,70 €—, así que el aviso no
  // puede presentarlo como un techo del que aún hay que descontar.
  const aviso = await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR');
  expect(aviso).not.toMatch(/menor que este/);
  expect(aviso).toMatch(/el neto real es MAYOR que este/);
  expect(aviso).toContain('REDUCEN el IRPF): el neto real es MAYOR que este');
  expect(aviso).toContain('Escribe con coma decimal (1.234,56)');

  // Y con la MISMA cifra legible el neto sube los 420,10 € que el aviso anunciaba.
  await sembrar(page, 'Impuestos y gastos que pagaste al comprarlo', '2000,50');
  expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('12.000,50 €');
  expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('22.421,70 €');
  expect(await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe(
    'Lo que realmente recibes tras los gastos',
  );
});

// ═════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 23/09/2026 — Andalucía, Castilla-La Mancha, el IRPF al 30 % y los
// efectos colaterales de la reparación del importe ilegible
//
// Posterior a cfe091a7 (el ilegible se nombra en las siete apps y el aviso dice en qué
// dirección falta) y a 758e053f (el valor catastral total ilegible, hueco C1). Esta app es la
// de ORIGEN del defecto (ae1358d6, hallazgo 1157). El testigo de familia
// (`tests/familias/compraventa.spec.ts`, 52/52) ya mide campo a campo la CIFRA FINAL de cada
// panel; aquí se mira lo que ese testigo no puede ver: las tarjetas INTERMEDIAS, los casos en
// que el aviso sale sin que el neto se mueva, y dos ilegibles a la vez con direcciones
// opuestas.
//
// Territorio nuevo: ANDALUCÍA y CASTILLA-LA MANCHA, las dos únicas comunidades que ninguna
// ronda de este fichero había elegido. Y dos escalas en su último escalón, que ningún caso
// había pisado: la base del ahorro por encima de 300.000 € (el 30 %) y el coeficiente del
// IIVTNU de «20 o más años» (0,40) frente al de 19 (0,23) — los del art. 107.4 TRLRHL en la
// redacción del RDL 8/2023; hasta el 24/09/2026 la app usaba 0,45 y 0,36 (hallazgo 1559).
//
// De dónde sale CADA cifra esperada (ninguna de memoria):
//  - ITP general: Andalucía 7 % y Castilla-La Mancha 9 % → `TIPOS_ITP_CCAA_2025`
//    (`data/fiscal/inmuebles.ts`), leído por `tipoGeneralDe()` en `data/itp-ccaa.ts`. Ninguna
//    de las dos tiene `tramosProgresivos`: el tipo es plano.
//  - Tipos reducidos que se ofrecen o no → `ITP_CCAA[…].tiposReducidos` + `elegirTipoITP`
//    con `viviendaHabitual: false`.
//  - Notaría → `ARANCELES_NOTARIO` × 1,21 (IVA) × `FACTURA_NOTARIAL` (1,5 · 1,75 · 2).
//  - Registro → `ARANCELES_REGISTRO` + `REGISTRO_CONCEPTOS` (6,010121 + 3,005061) × 1,21.
//  - Plusvalía → `COEFICIENTES_IIVTNU_2025` (6 años 0,19 · 7 años 0,20 · 19 años 0,23 ·
//    20 años 0,40; hasta el 24/09/2026 0,16 · 0,12 · 0,36 · 0,45, hallazgo 1559)
//    × `PLUSVALIA_MUNICIPAL_META.tipoOrientativo` (25 %), y el método real
//    (art. 107.5 TRLHL) con la proporción suelo/total de `calcularPlusvaliaMunicipal`.
//  - Ganancia e IRPF → `calcularGananciaInmueble` (art. 35 LIRPF) sobre
//    `TRAMOS_GANANCIAS_PATRIMONIALES_2025` (19 % hasta 6.000 · 21 % hasta 50.000 · 23 % hasta
//    200.000 · 27 % hasta 300.000 · 30 % el resto).
// ═════════════════════════════════════════════════════════════════════════════

/** El texto del marcador de posición del panel activo (cuando no hay resultados). */
const textoMarcador = (page: Page) => page.locator('[class*="placeholder"] p').first();

/**
 * El recuadro «Podrías pagar menos…» de los tipos reducidos que no se pueden comprobar. Por su
 * `role="note"` y su título: la clase `avisoReducidos` es prefijo de las de sus hijos.
 */
const avisoReducidos = (page: Page) =>
  page.locator('[role="note"]', { hasText: 'Podrías pagar menos' });

test.describe('RE-INSPECCIÓN 23/09/2026 — Andalucía, Castilla-La Mancha y el IRPF al 30 %', () => {
  /**
   * CASO 38 (NORMAL) — Andalucía, segunda mano, 21.500 €, FAMILIA NUMEROSA, y su venta.
   *
   * COMPRADOR, resuelto a mano:
   *   ITP = 21.500 × 7 % = 1.505,00 (tipo general; el 3,5 % de familia numerosa exige
   *     «Vivienda habitual», que un trastero suelto no es → se OFRECE, no se aplica)
   *   notaría: escala = 90,151816 + (21.500 − 6.010,12) × 0,45 % = 90,151816 + 69,70446 =
   *     159,856276 × 0,95 (rebaja del nº 2.1, 17/10/2026, cabo C0209) = 151,863462
   *     × 1,21 = 183,754789 → factura ×1,5 = 275,632184 · ×1,75 = 321,570881 · ×2 = 367,509578
   *     → 321,57 (entre 275,63 y 367,51)
   *   registro: (24,040484 + 15.489,88 × 0,175 %) = 51,147774 × 0,95 = 48,590385 + 9,015182 =
   *     57,605567 × 1,21 = 69,702736 → 69,70
   *   gestoría 300,00 (la del campo por defecto)
   *   total = 1.505,00 + 321,57 + 69,70 + 300,00 = 2.196,27 (10,2152… % → 10,22 %)
   *   coste = 21.500 + 2.196,27 = 23.696,27
   *   (sin la rebaja: 338,49 · 290,14–386,85 · 72,80 · 2.216,29)
   *
   * VENDEDOR — compra 12.000 · gastos de aquella compra 1.100 · 7 años · suelo 6.000 de
   * 14.000 · comisión 4 % · gestoría del vendedor 250:
   *   plusvalía objetivo = 6.000 × 0,20 × 25 % = 300,00
   *   plusvalía real = (21.500 − 12.000) × 6.000/14.000 × 25 % = 1.017,86 → gana el objetivo
   *   comisión = 21.500 × 4 % = 860,00
   *   transmisión = 21.500 − 860 − 250 − 300 = 20.090,00 · adquisición = 13.100,00
   *   ganancia = 6.990,00 → IRPF = 6.000 × 19 % + 990 × 21 % = 1.140 + 207,90 = 1.347,90
   *   total = 300 + 860 + 250 + 1.347,90 = 2.757,90 · neto = 21.500 − 2.757,90 = 18.742,10
   */
  test('CASO 38 (normal) — Andalucía, segunda mano, 21.500 €, familia numerosa', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['input[aria-label="Precio del trastero"]']);
    await selectCcaa(page).selectOption('andalucia');
    await selectPerfil(page).selectOption('familia-numerosa');
    await sembrar(page, 'Precio del trastero', '21500');

    expect(await valorTarjeta(page, /^ITP \(/)).toBe('1505,00 €');
    await expect(page.locator('h3', { hasText: /^ITP \(/ })).toHaveText('ITP (7,00 %)');
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('321,57 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain(
      'entre 275,63 € y 367,51 €',
    );
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('69,70 €');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('300,00 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('2196,27 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toBe('10,22 % sobre el precio');
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('23.696,27 €');
    expect(await descripcionTarjeta(page, 'COSTE TOTAL')).toBe('Precio del trastero + todos los gastos');

    // El 3,5 % de familia numerosa se ENSEÑA con su requisito de vivienda habitual, pero no
    // se cobra: 21.500 × 3,5 % serían 752,50 €, y la tarjeta dice 1.505,00 €.
    const reducidos = (await avisoReducidos(page).innerText()).replace(ESPACIO_DURO, ' ');
    expect(reducidos).toContain('3,50 % — Familia numerosa');
    expect(reducidos).toContain('Vivienda habitual');

    await page.getByRole('button', { name: /Vendedor/ }).click();
    await sembrar(page, 'Precio de compra original', '12000');
    await sembrar(page, 'Impuestos y gastos que pagaste al comprarlo', '1100');
    await sembrar(page, 'Años de propiedad', '7');
    await sembrar(page, 'Valor catastral del suelo', '6000');
    await sembrar(page, 'Valor catastral total (suelo + construcción)', '14000');
    await sembrar(page, 'Comisión inmobiliaria (%)', '4');
    await sembrar(page, 'Gestoría y certificados del vendedor (€)', '250');

    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('300,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe('Método objetivo (más favorable)');
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('13.100,00 €');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('20.090,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('6990,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('1347,90 €');
    expect(await valorTarjeta(page, 'Comisión inmobiliaria (4 %)')).toBe('860,00 €');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('250,00 €');
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('2757,90 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('18.742,10 €');
    expect(await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe(
      'Lo que realmente recibes tras los gastos',
    );
  });

  /**
   * CASO 39 (LÍMITE) — Castilla-La Mancha, 360.000 €: la base del ahorro en su ÚLTIMO tramo
   * (30 %) y el coeficiente del IIVTNU en la raya de los 20 años.
   *
   * COMPRADOR, perfil general, resuelto a mano:
   *   ITP = 360.000 × 9 % = 32.400,00 (sin escala en esta comunidad)
   *   notaría: 90,151816 + 24.040,49 × 0,45 % (108,182205) + 30.050,60 × 0,15 % (45,0759)
   *     + 90.151,82 × 0,10 % (90,15182) + 209.746,97 × 0,05 % (104,873485) = 438,435226
   *     × 0,95 (rebaja del nº 2.1, 17/10/2026, cabo C0209) = 416,513465
   *     × 1,21 = 503,981293 → ×1,5 = 755,971940 · ×1,75 = 881,967263 · ×2 = 1.007,962586
   *   registro: 24,040484 + 24.040,49 × 0,175 % (42,0708575) + 30.050,60 × 0,125 % (37,56325)
   *     + 90.151,82 × 0,075 % (67,613865) + 209.746,97 × 0,03 % (62,924091) = 234,212547
   *     × 0,95 = 222,501920 + 9,015182 = 231,517102 × 1,21 = 280,135693 → 280,14
   *   total = 32.400 + 881,97 + 280,14 + 300 = 33.862,11 (9,4061 % → 9,41 %)
   *   coste = 393.862,11
   *   (sin la rebaja: 928,38 · 795,76–1.061,01 · 294,30 · 33.922,68)
   *   El reducido «Vivienda habitual (primera compra)» (6 %) NO puede ofrecerse: exige
   *   primera vivienda (hallazgos 1154/1155) y su tope es 180.000 €.
   *
   * VENDEDOR — compra 40.000 · sin gastos de aquella compra · 20 años · suelo 10.000 · total
   * vacío · comisión 0 · sin gestoría:
   *   plusvalía = 10.000 × 0,40 × 25 % = 1.000,00 (sin total no hay método real)
   *   transmisión = 360.000 − 1.000 = 359.000,00 · ganancia = 359.000 − 40.000 = 319.000,00
   *   IRPF = 6.000 × 19 % (1.140) + 44.000 × 21 % (9.240) + 150.000 × 23 % (34.500)
   *        + 100.000 × 27 % (27.000) + 19.000 × 30 % (5.700) = 77.580,00
   *   total = 1.000 + 77.580 = 78.580,00 · neto = 281.420,00
   *   Con 19 años (0,23): plusvalía 575,00 · ganancia 319.425 · IRPF = 71.880 + 19.425 × 30 %
   *   = 77.707,50 · total 78.282,50 · neto 281.717,50
   */
  test('CASO 39 (límite) — Castilla-La Mancha, 360.000 €: el IRPF al 30 % y la raya de los 20 años', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['input[aria-label="Precio del trastero"]']);
    await selectCcaa(page).selectOption('castilla-mancha');
    await sembrar(page, 'Precio del trastero', '360000');

    expect(await valorTarjeta(page, /^ITP \(/)).toBe('32.400,00 €');
    await expect(page.locator('h3', { hasText: /^ITP \(/ })).toHaveText('ITP (9,00 %)');
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('881,97 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain(
      'entre 755,97 € y 1007,96 €',
    );
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('280,14 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('33.862,11 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toBe('9,41 % sobre el precio');
    expect(await valorTarjeta(page, 'COSTE TOTAL')).toBe('393.862,11 €');
    expect(await avisoReducidos(page).innerText()).not.toContain('Vivienda habitual (primera compra)');

    await page.getByRole('button', { name: /Vendedor/ }).click();
    await sembrar(page, 'Precio de compra original', '40000');
    await sembrar(page, 'Años de propiedad', '20');
    await sembrar(page, 'Valor catastral del suelo', '10000');
    await sembrar(page, 'Comisión inmobiliaria (%)', '0');

    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('1000,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe(
      'Método objetivo (falta el valor catastral total para comparar)',
    );
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('359.000,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('319.000,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('77.580,00 €');
    await expect(page.locator('h3', { hasText: 'Comisión inmobiliaria' })).toHaveCount(0);
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('78.580,00 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('281.420,00 €');
    expect(await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe(
      'Lo que realmente recibes tras los gastos',
    );

    // Un año menos cruza la raya del coeficiente: 0,23 en vez de 0,40.
    await sembrar(page, 'Años de propiedad', '19');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('575,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('77.707,50 €');
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('78.282,50 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('281.717,50 €');
  });

  /**
   * CASO 40 (DEBE RECHAZARSE) — un valor catastral del suelo de 0 no liquida una plusvalía
   * de 0,00 € ni la da por «no sujeta»: es un dato que falta.
   *
   * Venta 18.000 · compra 11.000 · gastos de aquella compra 900 · 6 años · suelo «0» · total
   * 8.000 · comisión 3 % por defecto · sin gestoría del vendedor. Resuelto a mano:
   *   con suelo 0 → plusvalía SIN CALCULAR (no entra en el neto)
   *     comisión = 540,00 · transmisión = 18.000 − 540 = 17.460,00 · adquisición 11.900,00
   *     ganancia = 5.560,00 → IRPF = 5.560 × 19 % = 1.056,40
   *     total = 540 + 1.056,40 = 1.596,40 · neto = 16.403,60 (TECHO)
   *   con suelo 3.000 → plusvalía = 3.000 × 0,19 (6 años, art. 107.4 TRLRHL, RDL 8/2023; era
   *     0,16 hasta el 24/09/2026, hallazgo 1559) × 25 % = 142,50 (el real, 7.000 × 3/8 × 25 %
   *     = 656,25, pierde) · transmisión 17.317,50 · ganancia 5.417,50 → IRPF 1.029,325
   *     → 1.029,33 · total = 142,50 + 540 + 1.029,33 = 1.711,83 · neto = 16.288,17, por
   *     DEBAJO del techo
   */
  test('CASO 40 (debe rechazarse) — un valor catastral del suelo de 0 no es una plusvalía de 0 €', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['input[aria-label="Precio del trastero"]']);
    await sembrar(page, 'Precio del trastero', '18000');
    await page.getByRole('button', { name: /Vendedor/ }).click();
    await sembrar(page, 'Precio de compra original', '11000');
    await sembrar(page, 'Impuestos y gastos que pagaste al comprarlo', '900');
    await sembrar(page, 'Años de propiedad', '6');
    await sembrar(page, 'Valor catastral del suelo', '0');
    await sembrar(page, 'Valor catastral total (suelo + construcción)', '8000');

    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('SIN CALCULAR');
    // Desde el 08/10/2026 (hallazgo 3079) no «falta»: está escrito y no vale.
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe(
      'No calculada (el valor catastral del suelo tiene que ser mayor que 0)',
    );
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('1056,40 €');
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('1596,40 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('16.403,60 €');
    expect(await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe(
      'No descuenta la plusvalía municipal: el neto real puede ser menor que este. Corrige el valor catastral del suelo (tiene que ser mayor que 0) para obtenerlo.',
    );
    // El 0 se queda en el campo: el blur no lo reescribe (min = 0).
    await expect(page.locator('input[aria-label="Valor catastral del suelo"]')).toHaveValue('0');

    // Con un suelo de verdad el neto BAJA: lo de arriba era un techo, como decía el aviso.
    await sembrar(page, 'Valor catastral del suelo', '3000');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('142,50 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('1029,33 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('16.288,17 €');
  });

  /**
   * COLATERAL (verde) — el aviso nuevo NO sale donde no debe.
   *
   * Un campo VACÍO no es un ilegible; «1000.25» (el decimal con punto) SÍ es legible y vale
   * 1.000,25; y el ilegible de un panel no se cuela en el otro. Base 15.000 (Madrid) y en el
   * vendedor compra 10.000 · 5 años · suelo 4.000 · total VACÍO · comisión 3 % · sin gestoría:
   *   comprador sin gestoría: ITP 900,00 + notaría 262,73 + registro 56,63 = 1.219,36 (las del
   *     CASO 1, con la rebaja del nº 2.1, cabo C0209; sin ella, 276,55 + 59,03 = 1.235,58)
   *   plusvalía = 4.000 × 0,18 (5 años, RDL 8/2023; 0,17 hasta el 24/09/2026, hallazgo 1559)
   *     × 25 % = 180,00 (sin total no hay método real)
   *   con gastos 1.000,25: adquisición 11.000,25 · transmisión 15.000 − 450 − 180 = 14.370
   *     ganancia 3.369,75 → IRPF 640,2525 → 640,25 · total 1.270,25 · neto 13.729,75
   */
  test('COLATERAL (verde) — un campo vacío o un decimal con punto no disparan el aviso del ilegible', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['input[aria-label="Precio del trastero"]']);
    await sembrar(page, 'Precio del trastero', '15000');
    await sembrar(page, 'Gastos de gestoría del comprador (€)', '');
    await expect(page.locator('h3', { hasText: 'Gastos de gestoría' })).toHaveCount(0);
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('1219,36 €');
    expect(await descripcionTarjeta(page, 'COSTE TOTAL')).toBe('Precio del trastero + todos los gastos');

    // Y el ilegible del comprador se queda en su panel.
    await sembrar(page, 'Gastos de gestoría del comprador (€)', '2.000.50');
    await page.getByRole('button', { name: /Vendedor/ }).click();
    await sembrar(page, 'Precio de compra original', '10000');
    await sembrar(page, 'Años de propiedad', '5');
    await sembrar(page, 'Valor catastral del suelo', '4000');

    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe(
      'Método objetivo (falta el valor catastral total para comparar)',
    );
    expect(await descripcionTarjeta(page, 'Valor de adquisición')).toBe(
      'Precio de compra + impuestos y gastos de aquella compra',
    );
    expect(await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe(
      'Lo que realmente recibes tras los gastos',
    );

    await sembrar(page, 'Impuestos y gastos que pagaste al comprarlo', '1000.25');
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('11.000,25 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('640,25 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('13.729,75 €');
    expect(await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe(
      'Lo que realmente recibes tras los gastos',
    );
  });
});

// ── HALLAZGOS 1280-1285 de la re-inspección del 23/09/2026 — REPARADOS el mismo día ──
// La dirección de cada aviso sale ahora de SONDEAR el cálculo (lib/sondeoIlegibles.ts). Los
// casos quedan como regresión, sin `test.fail()`.

test.describe('HALLAZGOS 23/09/2026 — lo que la reparación del ilegible dejó en las otras tarjetas', () => {
  /**
   * HALLAZGO (operativa, medio) — la tarjeta del IRPF publica como DEFINITIVA una cuota
   * calculada con un importe ilegible leído como 0.
   *
   * Las reparaciones 1157/1202 avisan en el neto («Suelo: …») y en «Valor de adquisición»,
   * pero la cuota que el vendedor lee en «IRPF sobre ganancia» sigue rotulada «Tributación en
   * base del ahorro», como si fuera la buena. La referencia de la familia
   * (`estimador-compraventa-inmueble`, hallazgo 1190 y C3) la marca «TECHO: hay importes que
   * no se han podido leer y que reducen la ganancia». Vale igual para la comisión y la
   * gestoría de la venta ilegibles (las tres reducen la ganancia, así que sin ellas la cuota
   * es siempre un techo).
   *
   * Caso literal del 1202 (venta 26.000 · compra 10.000 · gastos «2.000.50» · 5 años · suelo
   * 4.000 de 9.000 · comisión 3 %), resuelto a mano en el test de arriba:
   *   ilegible → ganancia 15.040,00 → IRPF 6.000 × 19 % + 9.040 × 21 % = 3.038,40
   *   «2000,50» → ganancia 13.039,50 → IRPF 1.140 + 7.039,50 × 21 % = 2.618,295 → 2.618,30
   * (plusvalía 180,00 con el coeficiente de 5 años del RDL 8/2023, 0,18; hasta el 24/09/2026
   * eran 170,00 con el 0,17 anterior, y las cuotas 3.040,50 y 2.620,40 — hallazgo 1559)
   * La tarjeta publicaba la cuota del ilegible como definitiva: 420,10 € de más.
   */
  test('HALLAZGO (operativa) — la cuota del IRPF con unos gastos de compra ilegibles se marca como techo', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['input[aria-label="Precio del trastero"]']);
    await sembrar(page, 'Precio del trastero', '26000');
    await page.getByRole('button', { name: /Vendedor/ }).click();
    await sembrar(page, 'Precio de compra original', '10000');
    await sembrar(page, 'Impuestos y gastos que pagaste al comprarlo', '2.000.50');
    await sembrar(page, 'Años de propiedad', '5');
    await sembrar(page, 'Valor catastral del suelo', '4000');
    await sembrar(page, 'Valor catastral total (suelo + construcción)', '9000');

    // FONDO: la cuota que se publica es un techo, y la tarjeta tiene que decirlo.
    expect(await descripcionTarjeta(page, 'IRPF sobre ganancia')).toMatch(
      /techo|no se ha(?:n)? podido leer/i,
    );
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('3038,40 €');

    await sembrar(page, 'Impuestos y gastos que pagaste al comprarlo', '2000,50');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('2618,30 €');
    expect(await descripcionTarjeta(page, 'IRPF sobre ganancia')).not.toMatch(/techo/i);
  });

  /**
   * HALLAZGO (operativa, medio) — el aviso del «Suelo» sale cuando el neto NO se mueve, y la
   * cifra que SÍ se mueve se publica sin aviso.
   *
   * La frase del 1202 («…REDUCEN el IRPF y suben el neto») se añade siempre que los gastos
   * de aquella compra no se leen, haya o no IRPF que reducir. En una venta con PÉRDIDA la
   * cuota es 0 con el dato y sin él, así que el neto no sube ni un céntimo; lo que se mueve
   * es la pérdida compensable, y esa tarjeta no dice nada. Resuelto a mano (venta 15.000 ·
   * compra 20.000 · 5 años · suelo 4.000 de 9.000 · comisión 3 % · gestoría 500):
   *   plusvalía NO SUJETA (15.000 − 20.000 < 0, art. 104.5 TRLHL)
   *   transmisión = 15.000 − 450 − 500 = 14.050,00 · IRPF 0 · neto = 14.050,00 en los dos
   *   pérdida con «2.000.50» = 20.000 − 14.050 = 5.950,00
   *   pérdida con «2000,50» = 22.000,50 − 14.050 = 7.950,50 (2.000,50 € más que compensar)
   * Y sin precio de compra pasa lo mismo: el IRPF ni siquiera está en el neto —la propia
   * frase dice «aún NO incluye … el IRPF de la ganancia»— y a continuación promete que
   * reducirlo lo subirá.
   */
  test('HALLAZGO (operativa) — con pérdida, unos gastos de compra ilegibles no «suben el neto»: mueven la pérdida', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['input[aria-label="Precio del trastero"]']);
    await sembrar(page, 'Precio del trastero', '15000');
    await page.getByRole('button', { name: /Vendedor/ }).click();
    await sembrar(page, 'Precio de compra original', '20000');
    await sembrar(page, 'Impuestos y gastos que pagaste al comprarlo', '2.000.50');
    await sembrar(page, 'Años de propiedad', '5');
    await sembrar(page, 'Valor catastral del suelo', '4000');
    await sembrar(page, 'Valor catastral total (suelo + construcción)', '9000');
    await sembrar(page, 'Gestoría y certificados del vendedor (€)', '500');

    // FONDO 1: el neto no se mueve, así que no puede prometer que subirá.
    expect(await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR')).not.toMatch(/suben el neto/i);
    // FONDO 2: lo que se mueve es la pérdida compensable, y ahí es donde hay que nombrarlo.
    expect(await descripcionTarjeta(page, 'Pérdida patrimonial')).toMatch(
      /no se ha(?:n)? podido leer|aquella compra/i,
    );
    expect(await valorTarjeta(page, 'Pérdida patrimonial')).toBe('5950,00 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('14.050,00 €');

    // Sin precio de compra el IRPF no está en el neto: tampoco hay nada que «suba».
    await sembrar(page, 'Precio de compra original', '');
    expect(await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR')).not.toMatch(/suben el neto/i);

    // Con la misma cifra legible: el neto no cambia y la pérdida crece 2.000,50 €.
    await sembrar(page, 'Precio de compra original', '20000');
    await sembrar(page, 'Impuestos y gastos que pagaste al comprarlo', '2000,50');
    expect(await valorTarjeta(page, 'Pérdida patrimonial')).toBe('7950,50 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('14.050,00 €');
  });

  /**
   * HALLAZGO (contenido, bajo) — dos ilegibles de dirección OPUESTA y la misma cifra se
   * rotula a la vez «Techo:» y «Suelo:».
   *
   * Un techo dice que la real es menor o igual; un suelo, que es mayor o igual. Las dos a la
   * vez solo son ciertas si la cifra es la buena, y aquí no lo es. Resuelto a mano (venta
   * 20.000 · compra 16.000 · 5 años · suelo 5.000 de 12.000 · comisión 3 %):
   *   plusvalía = 5.000 × 0,18 × 25 % = 225,00 (el real, 4.000 × 5/12 × 25 % = 416,67, pierde)
   *     (coeficiente de 5 años del RDL 8/2023; hasta el 24/09/2026 era 0,17 → 212,50, y las
   *     cifras de abajo, 18.581,87 y 17.187,00 — hallazgo 1559)
   *   gestoría y gastos de compra «2.000.50» → transmisión 19.175,00 · ganancia 3.175,00
   *     IRPF 603,25 · total 1.428,25 · neto 18.571,75 «Techo: … Suelo: …»
   *   los dos «2000,50» → transmisión 17.174,50 · adquisición 18.000,50 → PÉRDIDA de 826,00
   *     IRPF 0 · total 225 + 600 + 2.000,50 = 2.825,50 · neto 17.174,50
   * El neto real queda 1.397,25 € POR DEBAJO: el «Suelo:» es falso. Con la comisión y los
   * gastos de compra ilegibles sobre la base del testigo sale al revés (13.507,30 publicado y
   * 13.522,89 real), así que la dirección de conjunto no se conoce y no se puede afirmar
   * ninguna de las dos. La referencia dice «INCOMPLETO» y luego «el neto real es MAYOR», con
   * el mismo defecto.
   */
  test('HALLAZGO (contenido) — con ilegibles de dirección opuesta el neto no puede ser techo y suelo a la vez', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['input[aria-label="Precio del trastero"]']);
    await sembrar(page, 'Precio del trastero', '20000');
    await page.getByRole('button', { name: /Vendedor/ }).click();
    await sembrar(page, 'Precio de compra original', '16000');
    await sembrar(page, 'Años de propiedad', '5');
    await sembrar(page, 'Valor catastral del suelo', '5000');
    await sembrar(page, 'Valor catastral total (suelo + construcción)', '12000');
    await sembrar(page, 'Gestoría y certificados del vendedor (€)', '2.000.50');
    await sembrar(page, 'Impuestos y gastos que pagaste al comprarlo', '2.000.50');

    // FONDO: una sola cifra no puede declararse techo y suelo en la misma frase.
    const aviso = await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR');
    expect(aviso).not.toMatch(/menor que este[\s\S]*mayor que este|mayor que este[\s\S]*menor que este/i);
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('18.571,75 €');

    await sembrar(page, 'Gestoría y certificados del vendedor (€)', '2000,50');
    await sembrar(page, 'Impuestos y gastos que pagaste al comprarlo', '2000,50');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('17.174,50 €');
  });

  /**
   * HALLAZGO (contenido, bajo) — «Techo: aún NO incluye la comisión inmobiliaria» invita a
   * restar la comisión ENTERA, y el hueco es menor: es la C3 de la referencia, que no llegó.
   *
   * `0f70fdf8` corrigió en `estimador-compraventa-inmueble` que «falta descontar la comisión»
   * mandaba restar el importe completo cuando la comisión también rebaja el IRPF, y publica
   * la cota («rebaja también el IRPF al descontarla, hasta un T % de su importe»). Aquí el
   * aviso sigue sin decirlo. Base del testigo (venta 15.000 · compra 10.000 · gastos 1.000 ·
   * 5 años · suelo 4.000 de 9.000 · gestoría 500), resuelto a mano:
   *   comisión «3.5.0» → transmisión 15.000 − 500 − 180 = 14.320 · ganancia 3.320
   *     IRPF 630,80 · total 1.310,80 · neto 13.689,20
   *   comisión 3 → comisión 450 · transmisión 13.870 · ganancia 2.870 · IRPF 545,30
   *     total 1.675,30 · neto 13.324,70
   * (plusvalía 180,00 con el coeficiente de 5 años del RDL 8/2023, 0,18; con el 0,17 anterior
   * eran 170,00 y los netos 13.697,30 y 13.332,80 — hallazgo 1559, 24/09/2026)
   * Restar los 450,00 € da 13.239,20; el real es 13.324,70, porque el IRPF baja 85,50 € a la
   * vez (450 × 19 %, el tipo marginal de esa base).
   */
  test('HALLAZGO (contenido) — el techo de una comisión ilegible dice que al descontarla también baja el IRPF', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['input[aria-label="Precio del trastero"]']);
    await sembrar(page, 'Precio del trastero', '15000');
    await page.getByRole('button', { name: /Vendedor/ }).click();
    await sembrar(page, 'Precio de compra original', '10000');
    await sembrar(page, 'Impuestos y gastos que pagaste al comprarlo', '1000');
    await sembrar(page, 'Años de propiedad', '5');
    await sembrar(page, 'Valor catastral del suelo', '4000');
    await sembrar(page, 'Valor catastral total (suelo + construcción)', '9000');
    await sembrar(page, 'Gestoría y certificados del vendedor (€)', '500');
    await sembrar(page, 'Comisión inmobiliaria (%)', '3.5.0');

    // FONDO: el aviso de la comisión tiene que decir que su descuento rebaja también el IRPF.
    expect(await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR')).toMatch(
      /comisi[oó]n[^.]*IRPF/i,
    );
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('13.689,20 €');

    await sembrar(page, 'Comisión inmobiliaria (%)', '3');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('13.324,70 €');
  });

  /**
   * HALLAZGO (contenido, bajo) — «Valor de transmisión» afirma restar una comisión que el
   * motor ha tomado como 0.
   *
   * Es la gemela de lo que el 1157 corrigió en «Valor de adquisición» («deja además de
   * afirmar que suma unos gastos que el motor tomó como 0»): aquí la descripción sigue siendo
   * «Precio de venta − comisión, gestoría y plusvalía municipal» con la comisión ilegible.
   * Base del testigo con comisión «3.5.0»: 15.000 − 500 (gestoría) − 180 (plusvalía, con el
   * coeficiente de 5 años del RDL 8/2023; 170 con el anterior, hallazgo 1559) = 14.320,00,
   * sin comisión. Lo mismo con la gestoría de la venta ilegible.
   */
  test('HALLAZGO (contenido) — «Valor de transmisión» no afirma restar una comisión que no ha podido leer', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['input[aria-label="Precio del trastero"]']);
    await sembrar(page, 'Precio del trastero', '15000');
    await page.getByRole('button', { name: /Vendedor/ }).click();
    await sembrar(page, 'Precio de compra original', '10000');
    await sembrar(page, 'Impuestos y gastos que pagaste al comprarlo', '1000');
    await sembrar(page, 'Años de propiedad', '5');
    await sembrar(page, 'Valor catastral del suelo', '4000');
    await sembrar(page, 'Valor catastral total (suelo + construcción)', '9000');
    await sembrar(page, 'Gestoría y certificados del vendedor (€)', '500');
    await sembrar(page, 'Comisión inmobiliaria (%)', '3.5.0');

    // FONDO: la descripción no puede decir que resta una comisión que no ha restado.
    expect(await descripcionTarjeta(page, 'Valor de transmisión')).toMatch(/no se ha podido leer/i);
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('14.320,00 €');
  });

  /**
   * HALLAZGO (contenido, bajo) — un importe escrito pero ilegible se trata como NO escrito:
   * el marcador pide «Introduce el precio» con «2.000.50» a la vista.
   *
   * Es el hueco de MENSAJE que `8d7dcd1b` reparó en el grupo B (nave-industrial dice hoy «No
   * se ha podido leer el precio «2.000.50»…»). El testigo de familia solo declara ese caso
   * para el grupo B, y el trastero —con el garaje y el estimador— se quedó fuera. Lo mismo
   * pasa en el vendedor con un precio de compra «10.000.00»: la plusvalía dice «falta el
   * precio de compra original» y el neto pide «añade el precio de compra original», un dato
   * que el usuario ve escrito (es lo que la C1 corrigió para el valor catastral total: «no
   * falta, no se lee»).
   */
  test('HALLAZGO (contenido) — un precio escrito pero ilegible se nombra como ilegible, no como ausente', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['input[aria-label="Precio del trastero"]']);
    await sembrar(page, 'Precio del trastero', '2.000.50');
    await expect(page.locator('input[aria-label="Precio del trastero"]')).toHaveValue('2.000.50');

    // FONDO: el precio está escrito; lo que pasa es que no se ha podido leer.
    await expect(textoMarcador(page)).toContainText(/no se ha podido leer/i);

    await sembrar(page, 'Precio del trastero', '15000');
    await page.getByRole('button', { name: /Vendedor/ }).click();
    await sembrar(page, 'Precio de compra original', '10.000.00');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toMatch(/no se ha podido leer/i);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Propagación del hallazgo 1273 de solar (23/09/2026): la ayuda del precio no manda escribir
// «el mayor» con el valor de referencia catastral cuando el impuesto es IVA, cuya base es la
// contraprestación pactada (art. 78 Ley 37/1992). En Canarias, Ceuta y Melilla no hay IVA.
// ─────────────────────────────────────────────────────────────────────────────
test('la ayuda del precio depende del régimen: en IVA, el precio pactado (familia del 1273)', async ({ page }) => {
  await page.goto('/simulador-gastos-compraventa-trastero/');
  await esperarHidratacion(page, ['input[aria-label="Precio del trastero"]']);
  const ayuda = page.getByText(/Precio escriturado o valor de referencia catastral|Precio pactado en la escritura/).first();
  await expect(ayuda).toContainText('(el mayor)');
  await page.getByRole('button', { name: /Primera mano/ }).click();
  await expect(ayuda).toContainText('la base del IVA es la contraprestación');
  await page.locator('select').filter({ has: page.locator('option[value="canarias"]') }).first().selectOption('canarias');
  await expect(ayuda).toContainText('(el mayor)');
});

// ═══════════════════════════════════════════════════════════════════════════════
//  INSPECCIÓN 24/09/2026 — tras 758e053f, 1b09235c, 85c9c9fe y 5b5d33ae
//
//  Esperados resueltos a mano ANTES de abrir el navegador, con una calculadora que no
//  importa nada del repositorio (constantes transcritas de data/itp-ccaa.ts y
//  data/fiscal/inmuebles.ts). Los coeficientes VIGENTES del IIVTNU salen del texto
//  consolidado del BOE (BOE-A-2004-4214, art. 107.4 TRLRHL, versión del 28/01/2026: el
//  Congreso derogó el RDL 16/2025 y rige la tabla del art. 24 del RDL 8/2023).
//
//  Primero, cuatro casos en verde sobre los controles que NO son NumberInput (el punto
//  ciego del testigo de familia): la escala progresiva × perfil, la modalidad × territorio
//  × tipo de transmisión, Ceuta con la gestoría ilegible (el testigo solo prueba Canarias)
//  y un vendedor en el que gana el método REAL con cualquiera de las dos tablas de
//  coeficientes. Después, los hallazgos 1559-1569, que nacieron con `test.fail()` y su
//  aserción de FONDO en primer lugar, y se REPARARON ese mismo día.
// ═══════════════════════════════════════════════════════════════════════════════

/** Título de una ResultCard (donde la redacción común escribe el «(PARCIAL)»). */
async function tituloTarjeta24(page: Page, titulo: RegExp): Promise<string> {
  // El espacio duro del «%» (regla del 25/09/2026, hallazgo 2194) se normaliza, como en los
  // demás lectores de este fichero.
  return (await page.locator('h3').filter({ hasText: titulo }).first().innerText()).replace(ESPACIO_DURO, ' ').trim();
}

/** «1.234,56 €» → 1234.56; NaN si la tarjeta no publica un importe («SIN CALCULAR»…). */
const euros24 = (s: string): number =>
  Number(s.replace(ESPACIO_DURO, ' ').replace(/[€\s]/g, '').replace(/\./g, '').replace(',', '.'));

/** Deja la pestaña Vendedor con los siete campos escritos (vacío = no escrito). */
async function vendedor24(
  page: Page,
  d: { venta: string; compra: string; gastos: string; anios: string; suelo: string; total: string; comision: string; gestoria: string },
): Promise<void> {
  await page.goto(RUTA);
  await esperarHidratacion(page, ['input[aria-label="Precio del trastero"]']);
  await sembrar(page, 'Precio del trastero', d.venta);
  await page.getByRole('button', { name: 'Vendedor', exact: true }).click();
  await sembrar(page, 'Precio de compra original', d.compra);
  await sembrar(page, 'Impuestos y gastos que pagaste al comprarlo', d.gastos);
  await sembrar(page, 'Años de propiedad', d.anios);
  await sembrar(page, 'Valor catastral del suelo', d.suelo);
  await sembrar(page, 'Valor catastral total (suelo + construcción)', d.total);
  await sembrar(page, 'Comisión inmobiliaria (%)', d.comision);
  await sembrar(page, 'Gestoría y certificados del vendedor (€)', d.gestoria);
}

test.describe('Inspección 24/09/2026 — la escala de Castilla y León, la modalidad × territorio y los coeficientes del IIVTNU', () => {
  /**
   * CASO 38 (normal) — Castilla y León, SEGUNDO tramo de su escala, al que ningún caso
   * llegaba (el 11/09 se probó a 20.000 €). Segunda mano · 260.000 € · familia numerosa ·
   * gestoría 300. De ITP_CCAA['castilla-leon'].tramosProgresivos (8 % hasta 250.000, 10 %):
   *   ITP = 250.000 × 8 % + 10.000 × 10 % = 21.000,00 € → efectivo 8,0769 % → «ITP (8,08%)»
   *   notaría: escala 388,435226 (tramos 1-5 de ARANCELES_NOTARIO, base del BOE 90,151816)
   *     × 0,95 (rebaja del nº 2.1, 17/10/2026, cabo C0209) × 1,21 × 1,75 = 781,39 €
   *     (horquilla × 1,5 / × 2 = 669,76 – 893,01 €)
   *   registro: 204,212547 (ARANCELES_REGISTRO) × 0,95 + 6,010121 + 3,005061 = 203,017102
   *     × 1,21 = 245,65 €
   *   total = 21.000,00 + 781,39 + 245,65 + 300,00 = 22.327,04 € (8,59 %)
   *   coste = 282.327,04 €
   *   (sin la rebaja: 822,51 · 705,01–940,01 · 258,00 · 22.380,51)
   * El reducido de familia numerosa (4 %) exige vivienda habitual: se ofrece y NO se cobra.
   */
  test('CASO 38 — Castilla y León 260.000 €: el 10 % del segundo tramo y el 4 % de familia numerosa sin aplicar', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['input[aria-label="Precio del trastero"]']);
    await page.locator('#select-ccaa').selectOption('castilla-leon');
    await page.locator('#select-perfil').selectOption('familia-numerosa');
    await sembrar(page, 'Precio del trastero', '260000');

    expect(await tituloTarjeta24(page, /^ITP \(/)).toBe('ITP (8,08 %)');
    expect(await valorTarjeta(page, /^ITP \(/)).toBe('21.000,00 €');
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('781,39 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain('entre 669,76 € y 893,01 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('245,65 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('22.327,04 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toBe('8,59 % sobre el precio');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('282.327,04 €');
    // La frase del motor (`describirSubidaITP`, 24/09/2026), con el espacio antes del %.
    // Desde 242fffcd el motor separa el % con espacio DURO: `\s` lo admite.
    await expect(page.getByText(/escala progresiva \(8\s% → 10\s%\)/)).toBeVisible();
    const oportunidad = page.locator('[role="note"]').filter({ hasText: 'Podrías pagar menos' });
    await expect(oportunidad).toContainText('4,00 % — Familia numerosa');
    await expect(oportunidad).toContainText('Vivienda habitual');
  });

  /**
   * CASO 39 (obra nueva, vinculado e independiente) — Galicia · primera mano · 9.500 € ·
   * gestoría 300. IVA_INMUEBLES_2025.anejoVinculado = 10 y .garaje = 21 (art. 91.Uno.1.7º
   * LIVA); AJD de ITP_CCAA['galicia'] = 1,5 %:
   * ⚠️ 17/10/2026 (cabo C0209): con la base del BOE y la rebaja del 5 % del nº 2.1, notaría
   * 105,856276 × 0,95 × 1,21 × 1,75 = 212,94 y registro (30,147774 × 0,95 + 9,015182) × 1,21 =
   * 45,56 (antes 224,15 y 47,39; cada total de abajo, 13,04 € más alto):
   *   vinculado:     IVA 950,00 · AJD 142,50 · notaría 212,94 · registro 45,56 → total 1.651,00
   *                  (17,38 %) · coste 11.151,00 €
   *   independiente: IVA 1.995,00 → total 2.696,00 (28,38 %) · coste 12.196,00 €
   * Y la COMBINACIÓN de controles que el testigo no ve: con «Independiente» marcado, pasar a
   * Canarias (el selector desaparece y no hay IVA: IGIC «No calculado», AJD 0,75 % = 71,25,
   * total parcial y coste «puede ser mayor», abajo), volver a Galicia (el 21 % vuelve, porque la
   * elección se conserva) y pasar a segunda mano (la modalidad no entra: ITP 8 % = 760,00,
   * coste 9.500 + 760 + 212,94 + 45,56 + 300 = 10.818,50 y ningún aviso del IVA de obra nueva).
   */
  test('CASO 39 — obra nueva en Galicia: 10 % vinculado, 21 % independiente, y la elección sobrevive a Canarias', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['input[aria-label="Precio del trastero"]']);
    await page.locator('#select-ccaa').selectOption('galicia');
    await sembrar(page, 'Precio del trastero', '9500');
    await page.getByRole('button', { name: /Primera mano/ }).click();

    expect(await tituloTarjeta24(page, /^IVA \(/)).toBe('IVA (10,00 %)');
    expect(await valorTarjeta(page, /^IVA \(/)).toBe('950,00 €');
    expect(await valorTarjeta(page, /^AJD \(/)).toBe('142,50 €');
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('212,94 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('45,56 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('11.151,00 €');

    await page.getByRole('button', { name: /Independiente/ }).click();
    expect(await tituloTarjeta24(page, /^IVA \(/)).toBe('IVA (21,00 %)');
    expect(await valorTarjeta(page, /^IVA \(/)).toBe('1995,00 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toBe('28,38 % sobre el precio');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('12.196,00 €');
    await expect(page.getByRole('button', { name: /Primera mano/ })).toContainText('Paga IVA 21 %');

    await page.locator('#select-ccaa').selectOption('canarias');
    await expect(page.locator('#rotulo-modalidad')).toHaveCount(0);
    expect(await valorTarjeta(page, 'IGIC')).toBe('No calculado');
    expect(await valorTarjeta(page, /^AJD \(/)).toBe('71,25 €');
    // ⚠️ 26/09/2026 (hallazgo 2214): sin IVA en la notaría y el registro. Arancel notarial
    // 90,15 + 3.489,88 × 0,45 % = 105,85446 × 1,75 = 185,245305 · registro 24,04 + 3.489,88 ×
    // 0,175 % + 9,015182 = 39,162472 → total 71,25 + 185,25 + 39,16 + 300 = 595,66 · coste
    // 10.095,66 (antes, con IVA, 642,79 y 10.142,79).
    // ⚠️ 17/10/2026 (cabo C0209): con la base del BOE y la rebaja del nº 2.1, notaría 105,856276
    // × 0,95 × 1,75 = 175,99 · registro 30,147774 × 0,95 + 9,015182 = 37,66 → total 71,25 +
    // 175,99 + 37,66 + 300 = 584,90 · coste 10.084,90.
    expect(await valorTarjeta(page, 'Total gastos adicionales (parcial)')).toBe('584,90 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL (PARCIAL)')).toBe('10.084,90 €');
    expect(await descripcionTarjeta(page, 'COSTE TOTAL (PARCIAL)')).toBe(
      'No incluye el IGIC: el coste real puede ser mayor. Las facturas de notaría y registro llevan además IGIC, que esta herramienta no calcula, así que cuestan más de lo que se muestra.',
    );

    await page.locator('#select-ccaa').selectOption('galicia');
    await expect(page.getByRole('button', { name: /Independiente/ })).toHaveAttribute('aria-pressed', 'true');
    expect(await valorTarjeta(page, /^IVA \(/)).toBe('1995,00 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('12.196,00 €');

    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await expect(page.locator('#rotulo-modalidad')).toHaveCount(0);
    await expect(page.getByText(/el trastero independiente tributa al/)).toHaveCount(0);
    expect(await tituloTarjeta24(page, /^ITP \(/)).toBe('ITP (8,00 %)');
    expect(await valorTarjeta(page, /^ITP \(/)).toBe('760,00 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('10.818,50 €');
  });

  /**
   * CASO 39b — Ceuta en obra nueva (el segundo invariante de 5b5d33ae; el testigo de familia
   * lo prueba solo en Canarias). 9.500 €: IPSI sin calcular, AJD 9.500 × 0,5 % × 50 %
   * (art. 57 bis TRLITPAJD) = 23,75 € → «AJD (0,25%)»:
   *   gestoría 300      → total parcial 595,29 (6,27 %) · coste 10.095,29 · «puede ser mayor»
   *   gestoría ilegible → total parcial 295,29 (3,11 %) · coste 9.795,29 · «será mayor»
   * (el IPSI puede ser cero; la gestoría ilegible suma seguro).
   */
  test('CASO 39b — Ceuta: sin el IPSI el coste «puede ser» mayor, y con la gestoría ilegible «será» mayor', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['input[aria-label="Precio del trastero"]']);
    await page.locator('#select-ccaa').selectOption('ceuta');
    await sembrar(page, 'Precio del trastero', '9500');
    await page.getByRole('button', { name: /Primera mano/ }).click();

    expect(await valorTarjeta(page, 'IPSI')).toBe('No calculado');
    expect(await tituloTarjeta24(page, /^AJD \(/)).toBe('AJD (0,25 %)');
    expect(await valorTarjeta(page, /^AJD \(/)).toBe('23,75 €');
    // ⚠️ 26/09/2026 (hallazgo 2214): notaría 185,25 y registro 39,16 SIN IVA (CASO 39) →
    // total 23,75 + 185,25 + 39,16 + 300 = 548,16 · coste 10.048,16; con la gestoría ilegible
    // 248,16 y 9748,16 (antes, con IVA, 595,29 / 10.095,29 y 295,29 / 9795,29). El aviso del
    // IPSI de la operación no cambia («puede ser» / «será»); el de las facturas va aparte.
    // ⚠️ 17/10/2026 (cabo C0209): con la rebaja del nº 2.1, 175,99 y 37,66 (CASO 39) → total
    // 23,75 + 175,99 + 37,66 + 300 = 537,40 · coste 10.037,40; con la gestoría ilegible 237,40
    // y 9737,40.
    expect(await valorTarjeta(page, 'Total gastos adicionales (parcial)')).toBe('537,40 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL (PARCIAL)')).toBe('10.037,40 €');
    expect(await descripcionTarjeta(page, 'COSTE TOTAL (PARCIAL)')).toBe(
      'No incluye el IPSI: el coste real puede ser mayor. Las facturas de notaría y registro llevan además IPSI, que esta herramienta no calcula, así que cuestan más de lo que se muestra.',
    );

    await sembrar(page, 'Gastos de gestoría del comprador (€)', '2.000.50');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('Sin leer');
    expect(await valorTarjeta(page, 'Total gastos adicionales (parcial)')).toBe('237,40 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL (PARCIAL)')).toBe('9737,40 €');
    expect(await descripcionTarjeta(page, 'COSTE TOTAL (PARCIAL)')).toBe(
      'No incluye el IPSI ni la gestoría, que no se ha podido leer: el coste real será mayor. Las facturas de notaría y registro llevan además IPSI, que esta herramienta no calcula, así que cuestan más de lo que se muestra.',
    );
  });

  /**
   * CASO 40 (vendedor con ganancia) — gana el método REAL con las DOS tablas de coeficientes,
   * así que este caso no depende del hallazgo de los coeficientes de más abajo. 21.000 € de
   * venta · compra 19.000 · gastos 300 · 6 años · suelo 7.000 de 14.000 · comisión 2 %:
   *   objetivo 7.000 × 0,19 × 25 % = 332,50 (tabla vigente del BOE, RDL 8/2023; con la
   *     anterior, 0,16 → 280,00; hallazgo 1559)
   *   real (21.000 − 19.000) × 7.000/14.000 × 25 % = 250,00 → gana el real
   *   transmisión 21.000 − 420 − 250 = 20.330,00 · adquisición 19.300,00 · ganancia 1.030,00
   *   IRPF 1.030 × 19 % = 195,70 · total 250 + 420 + 195,70 = 865,70 · neto 20.134,30,
   * DEFINITIVO: ni «(PARCIAL)» ni aviso (la redacción común de 85c9c9fe no se pasa de largo).
   */
  test('CASO 40 — vendedor: gana el método real y el neto se publica definitivo', async ({ page }) => {
    await vendedor24(page, { venta: '21000', compra: '19000', gastos: '300', anios: '6', suelo: '7000', total: '14000', comision: '2', gestoria: '' });

    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('250,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe('Método real (más favorable)');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('20.330,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('1030,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('195,70 €');
    expect(await tituloTarjeta24(page, /Comisión inmobiliaria/)).toBe('Comisión inmobiliaria (2 %)');
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('865,70 €');
    expect(await tituloTarjeta24(page, /IMPORTE NETO VENDEDOR/)).toBe('IMPORTE NETO VENDEDOR');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('20.134,30 €');
    expect(await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('Lo que realmente recibes tras los gastos');
  });
});

// ── HALLAZGOS 1559-1569 de la inspección del 24/09/2026 — REPARADOS el mismo día ──
// Estaban escritos con `test.fail()` y una aserción de FONDO. Al repararlos se les quitó la
// marca; los que la inspección escribió con cifras de la tabla de coeficientes anterior se
// han recalculado a mano con la vigente (art. 107.4 TRLRHL, redacción del RDL 8/2023,
// BOE-A-2004-4214 consolidado). Tres fondos se reescriben, y cada uno dice por qué.

test.describe('HALLAZGOS 24/09/2026 — reparados', () => {
  /**
   * HALLAZGO 1559 (dato, alto), REPARADO — los coeficientes del IIVTNU eran los del RDL 26/2021
   * ORIGINAL. Hoy rige la tabla del RDL 8/2023 (BOE-A-2004-4214, art. 107.4 TRLRHL):
   *   <1 0,15 · 1 0,15 · 2 0,14 · 3 0,14 · 4 0,16 · 5 0,18 · 6 0,19 · 7 0,20 · 8 0,19 · 9 0,15 ·
   *   10 0,12 · 11 0,10 · 12-15 0,09 · 16 0,10 · 17 0,13 · 18 0,17 · 19 0,23 · ≥20 0,40
   * Base del testigo con 7 años (15.000 / 10.000 / gastos 1.000 / suelo 4.000 de 9.000 / 3 % /
   * gestoría 500):
   *   objetivo 4.000 × 0,20 × 25 % = 200,00 (el real, 5.000 × 4/9 × 25 % = 555,56, pierde)
   *   transmisión 15.000 − 450 − 500 − 200 = 13.850 · ganancia 2.850 · IRPF 541,50
   *   neto 15.000 − 200 − 450 − 500 − 541,50 = 13.308,50 (con la tabla vieja, 0,12: 13.373,30)
   */
  test('1559 — la plusvalía de 7 años usa el coeficiente vigente del art. 107.4 TRLRHL (0,20)', async ({ page }) => {
    await vendedor24(page, { venta: '15000', compra: '10000', gastos: '1000', anios: '7', suelo: '4000', total: '9000', comision: '3', gestoria: '500' });

    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('200,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('541,50 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('13.308,50 €');
  });

  /**
   * HALLAZGO 1560 (cálculo, medio), REPARADO — la reventa antes del año liquidaba el
   * coeficiente ENTERO (0,14). El art. 107.4 TRLRHL: «En el caso de que el periodo de
   * generación sea inferior a un año, se prorrateará el coeficiente anual teniendo en cuenta el
   * número de meses completos». Con años = 0 la app pregunta ahora los meses; sin ellos no
   * liquida. Caso literal del 682 (15.000 / 12.000 / 0 años / suelo 4.000 de 9.000 / 3 %) con
   * 11 meses, el MÁXIMO para cualquier reventa de menos de un año:
   *   coeficiente 0,15 × 11/12 = 0,1375 · plusvalía 4.000 × 0,1375 × 25 % = 137,50
   *   transmisión 15.000 − 450 − 137,50 = 14.412,50 · ganancia 2.412,50
   *   IRPF 2.412,50 × 19 % = 458,375 → 458,38 · neto 15.000 − 137,50 − 450 − 458,38 = 13.954,12
   * Y la ayuda del campo ya no promete «un coeficiente mayor»: siempre es menor o igual.
   */
  test('1560 — la plusvalía de menos de un año se prorratea por meses completos', async ({ page }) => {
    await vendedor24(page, { venta: '15000', compra: '12000', gastos: '', anios: '0', suelo: '4000', total: '9000', comision: '3', gestoria: '' });
    await expect(page.getByText(/con un coeficiente mayor/)).toHaveCount(0);

    // Sin los meses, el dato falta: ni 0,00 € ni el coeficiente entero.
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('SIN CALCULAR');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe(
      'No calculada (faltan los meses completos desde la compra)',
    );
    expect(await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR')).toContain(
      'Elige los meses completos desde la compra para obtenerlo.',
    );

    await page.locator('#meses-completos').selectOption('11');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('137,50 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('458,38 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('13.954,12 €');
    expect(await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('Lo que realmente recibes tras los gastos');
  });

  /**
   * HALLAZGO 1561 (contenido, bajo), REPARADO — un ilegible que SUBIRÍA el neto y la plusvalía
   * que FALTA, que lo bajaría: el aviso afirmaba «el neto real es MAYOR que este». 20.000 /
   * 16.000 / gastos «2.000.50» / años VACÍOS / suelo 10.000 de 12.000 / 3 %:
   *   transmisión 19.400 · ganancia 3.400 · IRPF 646,00 · neto 18.754,00
   *   con 20 años y «2000,50»: plusvalía real 833,33 (el objetivo, 1.000,00, pierde) · IRPF
   *   107,57 · neto 18.459,10, POR DEBAJO; con 5 años, 18.789,84, por encima.
   * ⚠️ El fondo se reescribe: la inspección pedía que no apareciera /neto real es (mayor|menor)/,
   * y la redacción común del «Sin cerrar» (1282) dice justo «no se puede saber si el neto real
   * es mayor o menor que este», que es lo que el hallazgo pide. Lo que no puede aparecer es una
   * dirección SEGURA.
   */
  test('1561 — un ilegible que sube el neto y la plusvalía que falta dan «Sin cerrar»', async ({ page }) => {
    await vendedor24(page, { venta: '20000', compra: '16000', gastos: '2.000.50', anios: '', suelo: '10000', total: '12000', comision: '3', gestoria: '' });
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('18.754,00 €');

    const aviso = await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR');
    expect(aviso).not.toMatch(/el neto real es (?:MAYOR|menor) que este/);
    expect(aviso).toContain(
      'Sin cerrar: no se han podido leer los impuestos y gastos de aquella compra y lo subirían, pero falta la plusvalía municipal, que lo bajaría: no se puede saber si el neto real es mayor o menor que este',
    );
  });

  /**
   * HALLAZGO 1562 (contenido, medio), REPARADO — con la plusvalía SIN CALCULAR, «Valor de
   * transmisión» decía restarla, y la ganancia y el IRPF se publicaban como definitivos siendo
   * un MÁXIMO. Base del testigo con los años vacíos: transmisión 15.000 − 450 − 500 =
   * 14.050,00 · ganancia 3.050,00 · IRPF 579,50. Con 5 años (plusvalía 4.000 × 0,18 × 25 % =
   * 180,00): transmisión 13.870,00 e IRPF 545,30, menor.
   */
  test('1562 — con la plusvalía sin calcular, la transmisión no la resta y la ganancia y el IRPF son un máximo', async ({ page }) => {
    await vendedor24(page, { venta: '15000', compra: '10000', gastos: '1000', anios: '', suelo: '4000', total: '9000', comision: '3', gestoria: '500' });
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('14.050,00 €');
    expect(await descripcionTarjeta(page, 'Valor de transmisión')).toBe(
      'Precio de venta − comisión y gestoría, sin la plusvalía municipal, que falta',
    );
    expect(await tituloTarjeta24(page, /^Ganancia patrimonial/)).toBe('Ganancia patrimonial (máximo)');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('3050,00 €');
    expect(await tituloTarjeta24(page, /^IRPF sobre ganancia/)).toBe('IRPF sobre ganancia (máximo)');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('579,50 €');
    // Desde el hallazgo 3386 (20/10/2026) el aviso va seguido de la base del ahorro de la cuota.
    expect(await descripcionTarjeta(page, 'IRPF sobre ganancia')).toBe(
      'No resta la plusvalía municipal, que falta, así que la cuota real puede ser menor. Calculado como si esta venta fuera tu única renta del ahorro del año: si tienes intereses, dividendos u otras ganancias, escríbelos arriba, porque la cuota puede ser mayor.',
    );

    await sembrar(page, 'Años de propiedad', '5');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('13.870,00 €');
    expect(await tituloTarjeta24(page, /^IRPF sobre ganancia/)).toBe('IRPF sobre ganancia');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('545,30 €');
  });

  /**
   * HALLAZGO 1563 (operativa, bajo), REPARADO — EFECTO FAMILIA del 1232 de la referencia: con el
   * par catastral imposible el neto se publicaba DEFINITIVO. Base del testigo con suelo 9.000 y
   * total 4.000: objetivo 9.000 × 0,18 × 25 % = 405,00 · transmisión 15.000 − 450 − 500 − 405 =
   * 13.645 · ganancia 2.645 · IRPF 502,55 · neto 13.142,45. Con el recibo al derecho (4.000 /
   * 9.000): plusvalía 180,00 y neto 13.324,70, MAYOR, que es lo que el aviso dice.
   */
  test('1563 — con el par catastral imposible el neto no se publica como definitivo', async ({ page }) => {
    await vendedor24(page, { venta: '15000', compra: '10000', gastos: '1000', anios: '5', suelo: '9000', total: '4000', comision: '3', gestoria: '500' });
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('405,00 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('13.142,45 €');
    expect(await tituloTarjeta24(page, /IMPORTE NETO VENDEDOR/)).toBe('IMPORTE NETO VENDEDOR (PARCIAL)');
    const aviso = await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR');
    expect(aviso).toContain('el neto real puede ser MAYOR que este');
    expect(aviso).toContain('Revisa los dos valores catastrales del recibo del IBI para obtenerlo.');

    await sembrar(page, 'Valor catastral del suelo', '4000');
    await sembrar(page, 'Valor catastral total (suelo + construcción)', '9000');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('13.324,70 €');
    expect(await tituloTarjeta24(page, /IMPORTE NETO VENDEDOR/)).toBe('IMPORTE NETO VENDEDOR');
  });

  /**
   * HALLAZGO 1564 (operativa, bajo), REPARADO — vendiendo por debajo de la compra, la no
   * sujeción del art. 104.5 TRLRHL («No se producirá la sujeción al impuesto en las
   * transmisiones de terrenos respecto de los cuales se constate la inexistencia de incremento
   * de valor») no depende del suelo, y la app no llamaba al motor sin él. 15.000 / 18.000 /
   * 1.000 / 8 años / suelo y total vacíos / 3 % → NO SUJETA · pérdida 19.000 − 14.550 =
   * 4.450,00 · neto 14.550,00 definitivo.
   */
  test('1564 — con pérdida y sin valor del suelo, la plusvalía es no sujeta y el neto definitivo', async ({ page }) => {
    await vendedor24(page, { venta: '15000', compra: '18000', gastos: '1000', anios: '8', suelo: '', total: '', comision: '3', gestoria: '' });
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('NO SUJETA');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe('No sujeta (sin incremento de valor)');
    expect(await valorTarjeta(page, 'Pérdida patrimonial')).toBe('4450,00 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('14.550,00 €');
    expect(await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('Lo que realmente recibes tras los gastos');
  });

  /**
   * HALLAZGO 1565 (contenido, bajo), REPARADO — con la ganancia exactamente en cero porque los
   * gastos de aquella compra no se leen, «Sin ganancia ni pérdida» negaba la pérdida
   * compensable. 20.000 / «2.000.50» / 5 años / suelo 4.000 sin total / comisión 4 %:
   * transmisión 20.000 − 800 − 180 = 19.020,00, así que la compra pasa de 19.030 (la del acta,
   * con el 0,17 anterior) a 19.020 para seguir cayendo en el cero. Con «2000,50», pérdida
   * 2.000,50 €.
   */
  test('1565 — con la ganancia en cero por un ilegible, la app no niega la pérdida compensable', async ({ page }) => {
    await vendedor24(page, { venta: '20000', compra: '19020', gastos: '2.000.50', anios: '5', suelo: '4000', total: '', comision: '4', gestoria: '' });
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('19.020,00 €');
    expect(await valorTarjeta(page, 'Sin ganancia ni pérdida')).toBe('0,00 €');
    expect(await descripcionTarjeta(page, 'Sin ganancia ni pérdida')).toBe(
      'No se han podido leer los impuestos y gastos de aquella compra, así que hay una pérdida que se compensaría en la declaración. Escríbelo con coma decimal (1.234,56).',
    );
    expect(await page.locator('[class*="resultados"]').first().innerText()).not.toMatch(/ni pérdida que compensar/);

    await sembrar(page, 'Impuestos y gastos que pagaste al comprarlo', '2000,50');
    expect(await valorTarjeta(page, 'Pérdida patrimonial')).toBe('2000,50 €');
  });

  /**
   * HALLAZGO 1566 (contenido, bajo), REPARADO — unos años NEGATIVOS, escritos y a la vista, se
   * anunciaban como si faltaran. La guarda ya los rechazaba (no liquida); ahora el mensaje dice
   * que no pueden ser negativos. Base del testigo con «-3».
   */
  test('1566 — unos años negativos no «faltan»: se dice que no pueden ser negativos', async ({ page }) => {
    await vendedor24(page, { venta: '15000', compra: '10000', gastos: '1000', anios: '-3', suelo: '4000', total: '9000', comision: '3', gestoria: '500' });
    await expect(page.locator('input[aria-label="Años de propiedad"]')).toHaveValue('-3');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('SIN CALCULAR');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe(
      'No calculada (los años de propiedad no pueden ser negativos)',
    );
    const neto = await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR');
    expect(neto).toContain('Corrige los años de propiedad (no pueden ser negativos) para obtenerlo.');
    expect(neto).not.toMatch(/Rellena los años|faltan? los años/i);
  });

  /**
   * HALLAZGO 1567 (contenido, bajo), REPARADO — con la gestoría del COMPRADOR ilegible, las dos
   * cifras de cierre se titulaban como definitivas. Misma condición que el IGIC/IPSI no
   * calculado. Madrid · primera mano · vinculado · 9.500 € · gestoría «2.000.50» → IVA 950,00 ·
   * AJD 71,25 · notaría 224,15 · registro 47,39 → total 1.292,79 · coste 10.792,79.
   * (17/10/2026, cabo C0209: con la rebaja del nº 2.1, notaría 212,94 y registro 45,56, los del
   * CASO 39 → total 1.279,75 · coste 10.779,75.)
   */
  test('1567 — con la gestoría del comprador ilegible el coste se rotula «(PARCIAL)»', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['input[aria-label="Precio del trastero"]']);
    await sembrar(page, 'Precio del trastero', '9500');
    await page.getByRole('button', { name: /Primera mano/ }).click();
    await sembrar(page, 'Gastos de gestoría del comprador (€)', '2.000.50');
    expect(await valorTarjeta(page, /^COSTE TOTAL/)).toBe('10.779,75 €');
    expect(await descripcionTarjeta(page, /^COSTE TOTAL/)).toContain('el coste real será mayor');
    expect(await tituloTarjeta24(page, /^COSTE TOTAL/)).toBe('COSTE TOTAL (PARCIAL)');
    expect(await tituloTarjeta24(page, /^Total gastos adicionales/)).toBe('Total gastos adicionales (parcial)');
  });

  /**
   * HALLAZGO 1568 (contenido, bajo), REPARADO — la redacción común no llegó a dos ramas: el aviso
   * de la pérdida abría en minúscula y el «Sin cerrar» conjugaba por el número de campos, no del
   * sujeto. Pérdida: 15.000 / 20.000 / «2.000.50» / 5 años / 4.000 de 9.000 / 3 % / 500 → NO
   * SUJETA · transmisión 15.000 − 450 − 500 = 14.050 · pérdida 20.000 − 14.050 = 5.950,00.
   */
  test('1568 — el aviso de la pérdida abre en mayúscula', async ({ page }) => {
    await vendedor24(page, { venta: '15000', compra: '20000', gastos: '2.000.50', anios: '5', suelo: '4000', total: '9000', comision: '3', gestoria: '500' });
    expect(await valorTarjeta(page, 'Pérdida patrimonial')).toBe('5950,00 €');
    expect(await descripcionTarjeta(page, 'Pérdida patrimonial')).toBe(
      'No se han podido leer los impuestos y gastos de aquella compra: la pérdida real es mayor que esta. Escríbelo con coma decimal (1.234,56).',
    );
  });

  /**
   * El «Sin cerrar» del mixto: 20.000 / 16.000 / «2.000.50» / 5 años / 5.000 de 12.000 / 3 % /
   * gestoría «2.000.50». La gestoría ilegible bajaría el neto y los gastos de aquella compra lo
   * subirían: el verbo concuerda con cada sujeto.
   */
  test('1568 — «Sin cerrar» concuerda el verbo con su sujeto plural', async ({ page }) => {
    await vendedor24(page, { venta: '20000', compra: '16000', gastos: '2.000.50', anios: '5', suelo: '5000', total: '12000', comision: '3', gestoria: '2.000.50' });
    const aviso = await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR');
    expect(aviso).toMatch(/^Sin cerrar/);
    expect(aviso).toContain('los impuestos y gastos de aquella compra lo subirían');
    expect(aviso).not.toMatch(/aquella compra lo subiría\b/);
  });

  /**
   * HALLAZGO 1569 (dato, bajo), REPARADO — la FAQ visible y el FAQPage decían que sin
   * incremento de valor se podía «quedar exento». El art. 104.5 TRLRHL (BOE-A-2004-4214, bloque
   * a104, consultado en sesión el 24/09/2026) lo articula como NO SUJECIÓN: «No se producirá la
   * sujeción al impuesto en las transmisiones de terrenos respecto de los cuales se constate la
   * inexistencia de incremento de valor», y obliga a declarar la transmisión y aportar los
   * títulos. La tarjeta de esta misma página dice «NO SUJETA» desde el hallazgo 901.
   */
  test('1569 — la FAQ de la plusvalía habla de no sujeción, no de exención', async ({ page }) => {
    const html = await (await page.request.get(RUTA)).text();
    expect(html).toContain('¿Se paga plusvalía municipal al vender un trastero?');
    expect(html).not.toContain('quedar exento');
    expect(html).toContain('la transmisión no está sujeta al impuesto (art. 104.5');
    expect(html).toContain('no es una exención');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  RE-INSPECCIÓN 26/09/2026 — hermana de la familia «Compraventa inmobiliaria»
//
//  Posterior a la reparación de 1559-1569 (1c83ff86/8bdf3446), al ITP/AJD de Valencia y del
//  País Vasco en data/itp-ccaa.ts, a la comisión sin tope mudo (238aff76) y al % con espacio
//  duro (75d5db87). Los once hallazgos del 24/09 siguen cerrados: los sujetan los tests del
//  bloque anterior, que se ejecutan con este.
//
//  Esperados resueltos a mano ANTES de abrir el navegador, a partir de:
//   · ITP_CCAA.valencia (data/itp-ccaa.ts): tipo general 9 % (TIPOS_ITP_CCAA_2025), sin escala
//     por debajo del millón, y `ajd: 1.4` (Ley 13/1997, art. 14.Cuatro, devengos desde el
//     01/06/2026). Sin `ajdVivienda`: el vinculado paga el mismo 1,4 %.
//   · IVA_INMUEBLES_2025 (data/fiscal/inmuebles.ts): anejoVinculado 10 · garaje 21.
//   · ARANCELES_NOTARIO / FACTURA_NOTARIAL y ARANCELES_REGISTRO / REGISTRO_CONCEPTOS.
//   · COEFICIENTES_IIVTNU_2025 y `coeficienteIIVTNU` (art. 107.4 TRLRHL, prorrateo por meses
//     completos por debajo del año) · PLUSVALIA_MUNICIPAL_META.tipoOrientativo = 25 %.
//   · TRAMOS_GANANCIAS_PATRIMONIALES_2025 (19 % hasta 6.000 €, 21 % hasta 50.000 €).
//
//  Primero seis casos en verde: comprador en Valencia (obra nueva × modalidad × segunda mano),
//  un vendedor que cruza la raya de los 6.000 € del ahorro, la reventa antes del año con
//  5, 0 y 11 meses, la gestoría del vendedor ilegible con el matiz del marginal del 21 %, y
//  el cruce que el testigo de familia no ve: el selector de MESES (no es un NumberInput) con
//  el valor catastral total ilegible y el método real ganando, y con la comisión ilegible.
//  Después, cinco hallazgos (2193-2197) que nacieron con `test.fail()` y su aserción de FONDO
//  primero —tres eran reparaciones del 25/09 que llegaron a la app de referencia (238aff76) y
//  no a esta— y que se REPARARON ese mismo día (fa0772c0).
// ═══════════════════════════════════════════════════════════════════════════════

/** Como `vendedor24`, pero con los MESES completos del prorrateo cuando los años son 0. */
async function vendedor26(
  page: Page,
  d: {
    venta: string;
    compra: string;
    gastos: string;
    anios: string;
    meses?: string;
    suelo: string;
    total: string;
    comision: string;
    gestoria: string;
  },
): Promise<void> {
  await page.goto(RUTA);
  await esperarHidratacion(page, ['input[aria-label="Precio del trastero"]']);
  await sembrar(page, 'Precio del trastero', d.venta);
  await page.getByRole('button', { name: 'Vendedor', exact: true }).click();
  await sembrar(page, 'Precio de compra original', d.compra);
  await sembrar(page, 'Impuestos y gastos que pagaste al comprarlo', d.gastos);
  await sembrar(page, 'Años de propiedad', d.anios);
  // El <select> de meses lo monta React al leer «0» en los años: la página ya está hidratada.
  if (d.meses !== undefined) await page.locator('#meses-completos').selectOption(d.meses);
  await sembrar(page, 'Valor catastral del suelo', d.suelo);
  await sembrar(page, 'Valor catastral total (suelo + construcción)', d.total);
  await sembrar(page, 'Comisión inmobiliaria (%)', d.comision);
  await sembrar(page, 'Gestoría y certificados del vendedor (€)', d.gestoria);
}

/**
 * Contraste WCAG del texto del primer elemento VISIBLE que casa con el selector, contra su
 * fondo EFECTIVO (compone las capas semitransparentes hasta la primera opaca), medido hasta
 * que dos lecturas seguidas coinciden (ver `esperarEstable`).
 */
async function contraste26(page: Page, selector: string): Promise<number> {
  return esperarEstable(() =>
    page.evaluate((sel) => {
      const canal = (c: number) => {
        const v = c / 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      };
      const partes = (s: string) => (s.match(/[\d.]+/g) || []).map(Number);
      const lum = ([r, g, b]: number[]) => 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
      const mezcla = (fg: number[], bg: number[], a: number) => fg.map((c, i) => a * c + (1 - a) * bg[i]);
      const el = Array.from(document.querySelectorAll(sel)).find(
        (e) => (e as HTMLElement).offsetParent !== null,
      );
      if (!el) return -1;
      const capas: { rgb: number[]; a: number }[] = [];
      let n: Element | null = el;
      while (n) {
        const p = partes(getComputedStyle(n).backgroundColor);
        const a = p.length === 4 ? p[3] : 1;
        if (a > 0) capas.push({ rgb: p.slice(0, 3), a });
        if (a === 1) break;
        n = n.parentElement;
      }
      if (!capas.length || capas[capas.length - 1].a !== 1) capas.push({ rgb: [255, 255, 255], a: 1 });
      let fondo = capas[capas.length - 1].rgb;
      for (let i = capas.length - 2; i >= 0; i--) fondo = mezcla(capas[i].rgb, fondo, capas[i].a);
      const l1 = lum(partes(getComputedStyle(el).color).slice(0, 3));
      const l2 = lum(fondo);
      return Math.round(((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)) * 100) / 100;
    }, selector),
  );
}

test.describe('RE-INSPECCIÓN 26/09/2026 — Valencia en obra nueva, la raya del ahorro y los meses con ilegibles', () => {
  /**
   * CASO 41 (normal, comprador) — Comunidad Valenciana · 30.000 € · gestoría 300 (defecto).
   *   ⚠️ 17/10/2026 (cabo C0209): con la base del BOE y la rebaja del 5 % del nº 2.1 (antes,
   *   notaría 419,49 · 359,56–479,41 · registro 90,80, y cada total 24,97 € más alto):
   *   notaría: 90,151816 + (30.000 − 6.010,12) × 0,45 % = 198,106276 × 0,95 = 188,200962 ×
   *     1,21 = 227,723164 → ×1,5 = 341,58 · ×2 = 455,45 · medio 398,515537 → 398,52 €
   *   registro: (24,040484 + 23.989,88 × 0,175 %) = 66,022774 × 0,95 = 62,721635 + 6,010121 +
   *     3,005061 = 71,736817 × 1,21 = 86,801549 → 86,80 €
   *   primera mano, INDEPENDIENTE: IVA 21 % = 6.300,00 · AJD 1,4 % = 420,00
   *     total 6.300 + 420 + 398,52 + 86,80 + 300 = 7.505,32 (25,02 %) · coste 37.505,32
   *   VINCULADO: IVA 10 % = 3.000,00 · AJD 1,4 % (Valencia no exime la vivienda) = 420,00
   *     total 4.205,32 · coste 34.205,32
   *   SEGUNDA MANO: ITP 9 % = 2.700,00 (un trastero suelto nunca es vivienda habitual)
   *     total 3.485,32 (11,62 %) · coste 33.485,32, y sin tarjeta de AJD.
   * Antes del 01/06/2026 el AJD era del 1,5 % (450,00 €) y el ITP del 10 % (3.000,00 €).
   */
  test('CASO 41 — Valencia, 30.000 €: AJD del 1,4 % en obra nueva con las dos modalidades e ITP del 9 %', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['input[aria-label="Precio del trastero"]']);
    await page.locator('#select-ccaa').selectOption('valencia');
    await sembrar(page, 'Precio del trastero', '30000');
    await page.getByRole('button', { name: /Primera mano/ }).click();
    await page.getByRole('button', { name: /Independiente/ }).click();

    expect(await tituloTarjeta24(page, /^IVA \(/)).toBe('IVA (21,00 %)');
    expect(await valorTarjeta(page, /^IVA \(/)).toBe('6300,00 €');
    expect(await tituloTarjeta24(page, /^AJD \(/)).toBe('AJD (1,40 %)');
    expect(await valorTarjeta(page, /^AJD \(/)).toBe('420,00 €');
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('398,52 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain('entre 341,58 € y 455,45 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('86,80 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('7505,32 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toBe('25,02 % sobre el precio');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('37.505,32 €');

    await page.getByRole('button', { name: /Vinculado a vivienda/ }).click();
    expect(await valorTarjeta(page, /^IVA \(/)).toBe('3000,00 €');
    expect(await valorTarjeta(page, /^AJD \(/)).toBe('420,00 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('4205,32 €');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('34.205,32 €');

    await page.getByRole('button', { name: /Segunda mano/ }).click();
    expect(await tituloTarjeta24(page, /^ITP \(/)).toBe('ITP (9,00 %)');
    expect(await valorTarjeta(page, /^ITP \(/)).toBe('2700,00 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('3485,32 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toBe('11,62 % sobre el precio');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('33.485,32 €');
    await expect(page.locator('h3').filter({ hasText: /^AJD/ })).toHaveCount(0);
  });

  /**
   * CASO 42 (normal, vendedor) — la ganancia cruza la raya de los 6.000 € de la base del ahorro.
   * venta 40.000 · compra 30.000 · gastos 2.000 · 12 años · suelo 10.000 de 25.000 · 3 % · gestoría 400
   *   objetivo 10.000 × 0,09 × 25 % = 225,00 · real 10.000 × 10.000/25.000 × 25 % = 1.000 → objetivo
   *   comisión 1.200 · transmisión 40.000 − 1.200 − 400 − 225 = 38.175,00 · adquisición 32.000,00
   *   ganancia 6.175,00 → IRPF 6.000 × 19 % + 175 × 21 % = 1.140 + 36,75 = 1.176,75
   *   total 225 + 1.200 + 400 + 1.176,75 = 3.001,75 · neto 36.998,25, DEFINITIVO
   * Un 19 % plano daría 1.173,25 (3,50 € menos): la precisión de 2 decimales vigila ese tramo.
   */
  test('CASO 42 — vendedor con 6.175 € de ganancia: los últimos 175 € van al 21 %', async ({ page }) => {
    await vendedor26(page, { venta: '40000', compra: '30000', gastos: '2000', anios: '12', suelo: '10000', total: '25000', comision: '3', gestoria: '400' });

    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('225,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe('Método objetivo (más favorable)');
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('32.000,00 €');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('38.175,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('6175,00 €');
    expect(euros24(await valorTarjeta(page, 'IRPF sobre ganancia'))).toBeCloseTo(1176.75, 2);
    expect(await valorTarjeta(page, /Comisión inmobiliaria/)).toBe('1200,00 €');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('400,00 €');
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('3001,75 €');
    expect(await tituloTarjeta24(page, /IMPORTE NETO VENDEDOR/)).toBe('IMPORTE NETO VENDEDOR');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('36.998,25 €');
    expect(await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('Lo que realmente recibes tras los gastos');
  });

  /**
   * CASO 43 (límite) — reventa ANTES del año: el 0,15 de «Menos de 1 año» se prorratea por
   * meses completos (art. 107.4 TRLRHL, `coeficienteIIVTNU`).
   * venta 20.000 · compra 16.000 · 0 años · suelo 6.000 de 15.000 · 3 % · sin gastos ni gestoría
   *   real 4.000 × 6.000/15.000 × 25 % = 400,00 (pierde en los tres)
   *   5 meses: 0,15 × 5/12 = 0,0625 → 6.000 × 0,0625 × 25 % = 93,75 · transmisión 19.306,25 ·
   *     ganancia 3.306,25 · IRPF 628,1875 → 628,19 · total 93,75 + 600 + 628,19 = 1.321,94 ·
   *     neto 18.678,06
   *   0 meses: coeficiente 0 → 0,00 · ganancia 3.400,00 · IRPF 646,00 · neto 18.754,00
   *   11 meses: 0,1375 → 206,25 · ganancia 3.193,75 · IRPF 606,8125 → 606,81 · total 1.413,06 ·
   *     neto 18.586,94
   * Con el coeficiente ENTERO (el defecto del 1560) los tres darían 225,00 € de plusvalía.
   */
  test('CASO 43 — reventa antes del año con 5, 0 y 11 meses completos', async ({ page }) => {
    await vendedor26(page, { venta: '20000', compra: '16000', gastos: '', anios: '0', meses: '5', suelo: '6000', total: '15000', comision: '3', gestoria: '' });
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('93,75 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe('Método objetivo (más favorable)');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('19.306,25 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('3306,25 €');
    expect(euros24(await valorTarjeta(page, 'IRPF sobre ganancia'))).toBeCloseTo(628.19, 2);
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('1321,94 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('18.678,06 €');
    expect(await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('Lo que realmente recibes tras los gastos');

    await page.locator('#meses-completos').selectOption('0');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('0,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('646,00 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('18.754,00 €');

    await page.locator('#meses-completos').selectOption('11');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('206,25 €');
    expect(euros24(await valorTarjeta(page, 'IRPF sobre ganancia'))).toBeCloseTo(606.81, 2);
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('1413,06 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('18.586,94 €');
  });

  /**
   * CASO 44 (debe nombrarse) — la gestoría del VENDEDOR ilegible sobre el CASO 42.
   *   leída como 0: transmisión 40.000 − 1.200 − 225 = 38.575,00 · ganancia 6.575,00 ·
   *   IRPF 1.140 + 575 × 21 % = 1.260,75 · total 2.685,75 · neto 37.314,25
   *   dirección (sondeo): cualquier gestoría > 0 baja el neto (−1 € de gasto, +0,21 € de IRPF),
   *   así que «el neto real ES menor», con el marginal del 21 % (la base cae en el 2.º tramo).
   *   Con «2000,50» legible: base 4.574,50 al 19 % = 869,155 · neto ≈ 35.705,34-35, MENOR
   *   (1.608,9 € por debajo: la precisión de 1 decimal sobra para vigilarlo).
   */
  test('CASO 44 — gestoría del vendedor «2.000.50»: se nombra y el neto real es menor', async ({ page }) => {
    await vendedor26(page, { venta: '40000', compra: '30000', gastos: '2000', anios: '12', suelo: '10000', total: '25000', comision: '3', gestoria: '2.000.50' });

    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('Sin leer');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('38.575,00 €');
    expect(await descripcionTarjeta(page, 'Valor de transmisión')).toBe(
      'Precio de venta − plusvalía municipal y los gastos que se leen: la gestoría de la venta no se ha podido leer',
    );
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('6575,00 €');
    expect(await descripcionTarjeta(page, 'Ganancia patrimonial')).toBe(
      'La gestoría de la venta no se ha podido leer, así que la ganancia real es menor. Escríbelo con coma decimal (1.234,56).',
    );
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('1260,75 €');
    expect(await descripcionTarjeta(page, 'IRPF sobre ganancia')).toBe(
      'La gestoría de la venta no se ha podido leer, así que la cuota real es menor. Escríbelo con coma decimal (1.234,56). Calculado como si esta venta fuera tu única renta del ahorro del año: si tienes intereses, dividendos u otras ganancias, escríbelos arriba, porque la cuota puede ser mayor.',
    );
    expect(await tituloTarjeta24(page, /^Total gastos vendedor/)).toBe('Total gastos vendedor (parcial)');
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('2685,75 €');
    expect(await tituloTarjeta24(page, /IMPORTE NETO VENDEDOR/)).toBe('IMPORTE NETO VENDEDOR (PARCIAL)');
    const neto = await valorTarjeta(page, 'IMPORTE NETO VENDEDOR');
    expect(neto).toBe('37.314,25 €');
    expect(await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe(
      'No descuenta la gestoría de la venta, que no se ha podido leer (la gestoría de la venta rebaja también el IRPF al descontarla, hasta un 21 % de su importe): el neto real es menor que este. Escribe con coma decimal (1.234,56) lo que no se ha podido leer para obtenerlo.',
    );

    // La dirección anunciada es la medida: con el importe legible, el neto baja.
    await sembrar(page, 'Gestoría y certificados del vendedor (€)', '2000,50');
    const netoLegible = euros24(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR'));
    expect(netoLegible).toBeLessThan(euros24(neto));
    expect(netoLegible).toBeCloseTo(35705.345, 1);
  });

  /**
   * CASO 45 (el punto ciego del testigo) — el <select> de meses no es un NumberInput, así que
   * `check:familias` no le exige fila. Aquí se cruza con un ilegible que SÍ mueve el neto:
   * venta 20.000 · compra 18.000 · 0 años · 11 meses · suelo 6.000 de 15.000 · 3 %
   *   legible: objetivo 206,25 · real 2.000 × 0,4 × 25 % = 200,00 → gana el REAL
   *     transmisión 19.200 · ganancia 1.200 · IRPF 228,00 · total 1.028,00 · neto 18.972,00
   *   total «15.000.00»: objetivo 206,25 · ganancia 1.193,75 · IRPF 226,8125 → 226,81 ·
   *     total 1.033,06 · neto 18.966,94 (5,06 € por debajo)
   *   sondeo: total = suelo → real 500 (no mueve); total × 1000 → real 0,50 (sube): solo el
   *     grande mueve, así que «PUEDE SER mayor», no «es».
   */
  test('CASO 45 — meses completos con el valor catastral total ilegible: el neto real puede ser MAYOR', async ({ page }) => {
    await vendedor26(page, { venta: '20000', compra: '18000', gastos: '', anios: '0', meses: '11', suelo: '6000', total: '15000', comision: '3', gestoria: '' });
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('200,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe('Método real (más favorable)');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('228,00 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('18.972,00 €');

    await sembrar(page, 'Valor catastral total (suelo + construcción)', '15.000.00');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('206,25 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toContain('el valor catastral total no se ha podido leer');
    expect(euros24(await valorTarjeta(page, 'IRPF sobre ganancia'))).toBeCloseTo(226.81, 2);
    expect(await descripcionTarjeta(page, 'IRPF sobre ganancia')).toBe(
      'El valor catastral total no se ha podido leer, así que la cuota real puede ser mayor. Escríbelo con coma decimal (1.234,56). Calculado como si esta venta fuera tu única renta del ahorro del año: si tienes intereses, dividendos u otras ganancias, escríbelos arriba, porque la cuota puede ser mayor.',
    );
    expect(await tituloTarjeta24(page, /IMPORTE NETO VENDEDOR/)).toBe('IMPORTE NETO VENDEDOR (PARCIAL)');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('18.966,94 €');
    const aviso = await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR');
    expect(aviso).toContain('no se ha podido leer: el neto real puede ser MAYOR que este');
    expect(aviso).not.toMatch(/el neto real es MAYOR/);
  });

  /**
   * CASO 46 — los meses SIN elegir y la comisión ilegible: dos cosas que bajan el neto.
   * venta 20.000 · compra 16.000 · 0 años · meses sin elegir · suelo 6.000 de 15.000 ·
   * comisión «3.5.0» → plusvalía SIN CALCULAR · transmisión 20.000 · ganancia 4.000 ·
   * IRPF 760,00 (MÁXIMO: la plusvalía, al calcularse, restará) · neto 19.240,00.
   */
  test('CASO 46 — meses sin elegir y comisión ilegible: los dos se nombran y los dos bajan el neto', async ({ page }) => {
    await vendedor26(page, { venta: '20000', compra: '16000', gastos: '', anios: '0', suelo: '6000', total: '15000', comision: '3.5.0', gestoria: '' });
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('SIN CALCULAR');
    expect(await tituloTarjeta24(page, /^IRPF sobre ganancia/)).toBe('IRPF sobre ganancia (máximo)');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('760,00 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('19.240,00 €');
    expect(await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe(
      'No descuenta la plusvalía municipal: el neto real puede ser menor que este. No descuenta la comisión inmobiliaria, que no se ha podido leer (la comisión inmobiliaria rebaja también el IRPF al descontarla, hasta un 19 % de su importe): el neto real es menor que este. Elige los meses completos desde la compra y escribe con coma decimal (1.234,56) lo que no se ha podido leer para obtenerlo.',
    );
  });

  /**
   * La otra mitad del último hallazgo de abajo, en verde: con los datos del ejemplo de venta
   * (15.000 / 8.000 y la comisión del 3 % por defecto, sin años ni suelo) la calculadora ya
   * rotula la ganancia y el IRPF como «(máximo)», porque falta la plusvalía (patrón 2, 1562).
   */
  test('con los datos del ejemplo de venta, la calculadora rotula la ganancia como máximo', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['input[aria-label="Precio del trastero"]']);
    await sembrar(page, 'Precio del trastero', '15000');
    await page.getByRole('button', { name: 'Vendedor', exact: true }).click();
    await sembrar(page, 'Precio de compra original', '8000');
    expect(await tituloTarjeta24(page, /^Ganancia patrimonial/)).toBe('Ganancia patrimonial (máximo)');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('6550,00 €');
    expect(await tituloTarjeta24(page, /^IRPF sobre ganancia/)).toBe('IRPF sobre ganancia (máximo)');
  });
});

// ── HALLAZGOS 26/09/2026 (2193-2197) — REPARADOS el mismo día ────────────────────
// Estaban marcados con `test.fail()`; al repararlos se les quitó la marca y quedan como
// regresión, con las aserciones añadidas al lado de cada una (resueltas a mano).

test.describe('HALLAZGOS 26/09/2026 — reparados (2193-2197)', () => {
  /**
   * HALLAZGO (contenido, bajo) — EFECTO FAMILIA del 1799 (238aff76, solo en la referencia):
   * un precio de compra «0» está ESCRITO y se lee; no «falta». La referencia dice «El precio
   * de compra original tiene que ser mayor que 0» y pide corregirlo; aquí la tarjeta del IRPF
   * dice «Falta el precio de compra original» y el neto manda a «Rellena el precio de compra
   * original» un campo que el usuario ve relleno. Un «-5000» acaba igual: el blur lo acota a 0.
   * Caso: CASO 42 con compra «0» → esperado «tiene que ser mayor que 0» / «Corrige…» ·
   * obtenido «Falta el precio de compra original…» / «Rellena el precio de compra original…».
   */
  test('REPARADO 26/09 — un precio de compra 0 se pide corregir, no «falta»', async ({ page }) => {
    await vendedor26(page, { venta: '40000', compra: '0', gastos: '2000', anios: '12', suelo: '10000', total: '25000', comision: '3', gestoria: '400' });
    expect(await descripcionTarjeta(page, 'IRPF sobre ganancia')).toContain('tiene que ser mayor que 0');
    expect(await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR')).not.toContain('Rellena el precio de compra original');
    // Reparado con los textos de la referencia (hallazgo 1799). Sin precio de compra válido no
    // hay plusvalía ni IRPF: comisión 40.000 × 3 % = 1.200 · gestoría 400 · total 1.600,00 · neto
    // 38.400,00 (PARCIAL).
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe(
      'No calculada (el precio de compra original tiene que ser mayor que 0)',
    );
    expect(await descripcionTarjeta(page, 'IRPF sobre ganancia')).toBe(
      'El precio de compra original tiene que ser mayor que 0: corrígelo. Este impuesto NO está incluido en el neto de abajo.',
    );
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('38.400,00 €');
    expect(await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe(
      'No descuenta la plusvalía municipal ni el IRPF de la ganancia: el neto real puede ser menor que este. Corrige el precio de compra original (tiene que ser mayor que 0) para obtenerlo.',
    );
  });

  /**
   * La forma del hallazgo 2191 de garaje, que aquí también estaba (patrón 5): una comisión
   * que el propio campo declara imposible (> 100 %) no se liquida ni da un neto definitivo.
   * CASO 42 con comisión 150: plusvalía objetivo 10.000 × 0,09 (12 años, COEFICIENTES_IIVTNU_2025)
   * × 25 % = 225,00 · real 10.000 × 10.000/25.000 × 25 % = 1.000,00 → 225,00 · sin comisión ni
   * IRPF: total 225 + 400 = 625,00 · neto 40.000 − 625 = 39.375,00 (PARCIAL). Antes: comisión 60.000 €,
   * pérdida patrimonial y «Vendes por debajo del valor de adquisición» (40.000 > 32.000).
   */
  test('una comisión de más del 100 % no se liquida ni da un neto definitivo', async ({ page }) => {
    await vendedor26(page, { venta: '40000', compra: '30000', gastos: '2000', anios: '12', suelo: '10000', total: '25000', comision: '150', gestoria: '400' });
    await expect(page.getByText('La comisión no puede superar el 100')).toBeVisible();
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('225,00 €');
    expect(await valorTarjeta(page, 'Comisión inmobiliaria')).toBe('Sin aplicar');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('Sin calcular');
    await expect(page.locator('h3').filter({ hasText: /^Pérdida patrimonial/ })).toHaveCount(0);
    await expect(page.getByText('Vendes por debajo del valor de adquisición')).toHaveCount(0);
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('625,00 €');
    expect(await tituloTarjeta24(page, /^IMPORTE NETO VENDEDOR/)).toBe('IMPORTE NETO VENDEDOR (PARCIAL)');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('39.375,00 €');
    expect(await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe(
      'No descuenta la comisión inmobiliaria ni el IRPF de la ganancia: el neto real puede ser menor que este. Corrige la comisión (no puede superar el 100 % del precio de venta) para obtenerlo.',
    );
  });

  /**
   * HALLAZGO (contenido, bajo) — EFECTO FAMILIA del 1800 (238aff76, solo en la referencia) y
   * regla del CLAUDE.md global §2 desde el 25/09/2026 (75d5db87): el % va separado de la cifra
   * con espacio duro. El título de la comisión (page.tsx ~l. 1618) sigue pegado, y con él 58
   * porcentajes del texto visible (comprador con 15.000 € y la guía abierta: «ITP (6,00%)»,
   * «AJD (0,75%)», «10,24% sobre el precio», «ITP General 6%», «(19%-30%)», la tabla y las
   * FAQ) y 14 del JSON-LD. Otros 4 van con espacio normal (U+0020) en vez de duro.
   * Caso: CASO 42 → esperado «Comisión inmobiliaria (3 %)» con U+00A0 · obtenido «(3%)».
   */
  test('REPARADO 26/09 — el título de la comisión separa el % con espacio duro', async ({ page }) => {
    await vendedor26(page, { venta: '40000', compra: '30000', gastos: '2000', anios: '12', suelo: '10000', total: '25000', comision: '3', gestoria: '400' });
    const tituloCrudo = (await page.locator('h3').filter({ hasText: /Comisión inmobiliaria/ }).first().innerText()).trim();
    expect(tituloCrudo).toBe('Comisión inmobiliaria (3 %)');
    // Todo el texto de la APP. Se descuenta el bloque de apps relacionadas: su «IVA 21% y gastos
    // de compra» viene de data/app-relations.ts (l. 667, 682 y 698, la tarjeta de la nave
    // industrial), fuera del ámbito de esta app; queda anotado para repararlo allí.
    const cuerpo = await page.locator('body').innerText();
    const relacionadas = await page.locator('section[aria-label="Aplicaciones relacionadas"]').innerText();
    expect(cuerpo.replace(relacionadas, '').match(/\d%/g) ?? []).toHaveLength(0);
  });

  /**
   * HALLAZGO (accesibilidad, bajo) — EFECTO FAMILIA del 1801 (238aff76, solo en la
   * referencia): la pestaña activa pinta texto blanco sobre `var(--primary)` (#2E86AB), que el
   * módulo además redeclara en `.container`. 16 px / peso 600 no es texto grande: exige 4,5:1 y
   * da 4,11:1 en los dos temas. La referencia usa `--primary-boton` (#26718F, 5,47:1).
   * Caso: pestaña «Comprador» activa, tema claro → esperado ≥ 4,5:1 · obtenido 4,11:1.
   */
  test('REPARADO 26/09 — la pestaña activa llega a 4,5:1', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['input[aria-label="Precio del trastero"]']);
    expect(await contraste26(page, 'button[aria-pressed="true"][class*="tab"]')).toBeGreaterThanOrEqual(4.5);
  });

  /**
   * HALLAZGO (accesibilidad, medio) — el resumen de cada «Caso de uso» del bloque educativo
   * (`.casoResultado`, 12,8 px / peso 600) pinta el teal de marca `var(--secondary)` (#48A9A6)
   * como TEXTO sobre la tarjeta blanca: 2,80:1 en tema claro (en oscuro, 5,13:1). Son las
   * cuatro líneas con la cifra del ejemplo («IVA + AJD: 1290,00 € de gastos fiscales»…). El
   * candado de cabeceras no mira el color de marca como texto; el 11/09 se reparó el azul de
   * `.casoTag` en la misma tarjeta y el teal de la línea de abajo se quedó.
   * Caso: guía abierta, tema claro → esperado ≥ 4,5:1 · obtenido 2,80:1.
   */
  test('REPARADO 26/09 — el resultado de los casos de uso llega a 4,5:1 en tema claro', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['input[aria-label="Precio del trastero"]']);
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    expect(await contraste26(page, '[class*="casoResultado"]')).toBeGreaterThanOrEqual(4.5);
  });

  /**
   * HALLAZGO (contenido, bajo) — el ejemplo «Vender un trastero» publica como cifras cerradas
   * la ganancia (6550,00 €) y el IRPF (1255,50 €) sin la plusvalía municipal, que la primera
   * frase del mismo párrafo manda calcular y que el art. 35.1 LIRPF resta del valor de
   * transmisión (el motor lo hace). Con esos mismos datos la calculadora las rotula «(máximo)»
   * (patrón 2 de la familia, hallazgo 1562: verde arriba), así que ejemplo y calculadora dicen
   * cosas distintas de la misma cifra.
   * Caso: guía abierta → esperado que el ejemplo diga que la cifra es un máximo o que falta
   * restar la plusvalía · obtenido «la ganancia queda en 6550,00 € y el IRPF en 1255,50 €».
   */
  test('REPARADO 26/09 — el ejemplo de la venta no da por cerrada una ganancia sin la plusvalía', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['input[aria-label="Precio del trastero"]']);
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const ejemplo = await texto(page.getByText(/El vendedor debe calcular la plusvalía municipal/));
    expect(ejemplo).toMatch(/como máximo|sin (?:contar|restar) la plusvalía|antes de (?:restar )?la plusvalía/i);
    // Y la línea de resultado del caso dice lo mismo que la calculadora: «(máximo)».
    expect(await texto(page.getByText(/Como máximo: ganancia de/))).toContain('antes de restar la plusvalía');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Hallazgo 2209 (26/09/2026) — anotado en la hermana solar y llevado a las siete apps de la
// familia: la base del AJD no puede ser inferior al valor de referencia (art. 30.1 TRLITPAJD,
// redacción de la Ley 11/2021), aunque la del IVA sea la contraprestación pactada. La app tiene
// un solo precio: lo dice en la tarjeta del AJD, al final del total y en la ayuda del precio con
// IVA, y en ningún sitio cuando no hay AJD.
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Hallazgo 2209 — la base mínima del AJD (art. 30.1 TRLITPAJD)', () => {
  test('con AJD, la tarjeta, el total y la ayuda lo dicen; sin AJD, no', async ({ page }) => {
    const CAMPO = 'input[aria-label="Precio del trastero"]';
    await page.goto(RUTA);
    await esperarHidratacion(page, [CAMPO]);
    await sembrarValor(page, CAMPO, '200000');
    const crudo = async (titulo: RegExp): Promise<string> =>
      (await page.locator('h3', { hasText: titulo }).first().locator('xpath=../following-sibling::p[1]').innerText())
        .replace(/\s+/g, ' ')
        .trim();

    // Segunda mano: ITP y ningún AJD, así que ninguna salvedad.
    await page.getByRole('button', { name: /Segunda mano/ }).first().click();
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);
    expect(await crudo(/^COSTE TOTAL/)).not.toContain('art. 30.1');

    // Primera mano en Madrid: IVA + AJD, y la salvedad en la tarjeta y al final del total.
    await page.getByRole('button', { name: /Primera mano/ }).first().click();
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(1);
    expect(await crudo(/^AJD/)).toContain(AVISO_BASE_AJD);
    expect((await crudo(/^COSTE TOTAL/)).endsWith(AVISO_BASE_AJD)).toBe(true);
    const idAyuda = await page.locator(CAMPO).getAttribute('aria-describedby');
    const ayuda = (await page.locator(`[id="${idAyuda}"]`).innerText()).replace(/\s+/g, ' ');
    expect(ayuda).toContain('La base del AJD no puede ser inferior al valor de referencia catastral (art. 30.1 TRLITPAJD)');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 06/10/2026 — Baleares con familia numerosa, Navarra en obra nueva, la notaría
// de libre acuerdo, los meses del prorrateo con importes ilegibles y el % de lo que llega de data/.
//
//  La cola invalidó la del 26/09 tras fa0772c0 (garaje y trastero reciben las reparaciones de
//  la referencia y los 11 del Inspector), 7d5c1876 (total parcial sin IGIC/IPSI y la salvedad
//  del art. 30.1 TRLITPAJD) y 242fffcd (data/itp-ccaa.ts: notaría y registro sin IVA donde rige
//  IGIC o IPSI, y el % con espacio duro). Las tres verificadas en navegador; la base no tenía
//  ningún hallazgo abierto.
//
//  ⚠️ Ningún caso de este bloque fija la notaría ni el registro: el 06/10/2026 la referencia
//  registró que sus aranceles no aplican la rebaja del 5 % (hallazgos 2901 y 2902, data/
//  itp-ccaa.ts, las siete apps). Se leen de la pantalla y se exige que el total los sume.
//
//  De dónde sale cada cifra (resuelta a mano antes de abrir la app):
//   · ITP_CCAA (data/itp-ccaa.ts): Baleares, escala 8 % hasta 400.000 y «Familia numerosa» 5 %
//     con «Vivienda habitual» entre sus condiciones; Navarra, AJD 0,5 % sin `ajdVivienda`;
//     Ceuta, AJD 0,5 % con la bonificación del 50 % (art. 57 bis TRLITPAJD); Madrid, 6 %.
//   · IVA_INMUEBLES_2025 (data/fiscal/inmuebles.ts): anejoVinculado 10 · garaje 21.
//   · LIMITE_ARANCEL_NOTARIAL = 6.010.121,04 € (RD 1426/1989, nº 2.1).
//   · COEFICIENTES_IIVTNU_2025 + `coeficienteIIVTNU` (art. 107.4 TRLRHL, RDL 8/2023): 9 años
//     0,15 · menos de un año 0,15 prorrateado por meses completos · tipo orientativo 25 %.
//   · TRAMOS_GANANCIAS_PATRIMONIALES_2025: 19 % hasta 6.000 € · 21 % hasta 50.000 €.
// ═══════════════════════════════════════════════════════════════════════════════

/** Importe de una tarjeta como número; falla si la tarjeta no publica un importe. */
async function importe06(page: Page, titulo: string | RegExp): Promise<number> {
  const n = euros24(await valorTarjeta(page, titulo));
  expect(n, `«${String(titulo)}» tendría que publicar un importe`).not.toBeNaN();
  return n;
}

/** El consejo «Liquida los impuestos a tiempo» del bloque educativo, del DOM (nace plegado). */
async function consejoPlazo06(page: Page): Promise<string> {
  return page.evaluate(() => {
    const titulo = Array.from(document.querySelectorAll('strong')).find((s) =>
      (s.textContent ?? '').includes('Liquida los impuestos a tiempo'),
    );
    return (titulo?.parentElement?.querySelector('p')?.textContent ?? '').replace(/\s+/g, ' ').trim();
  });
}

test.describe('RE-INSPECCIÓN 06/10/2026 — Baleares, Navarra en obra nueva, la notaría libre y los meses con ilegibles', () => {
  /**
   * CASO 47 (normal) — Baleares, segunda mano, 32.000 €, perfil familia numerosa, gestoría 250.
   *   ITP = 32.000 × 8 % (primer tramo de la escala balear) = 2.560,00 → «ITP (8,00 %)».
   *   El reducido de familia numerosa (5 %) exige vivienda habitual: no se aplica y se ofrece
   *   como oportunidad, sola (el de vivienda habitual, 4 %, no es de colectivo y se descarta
   *   porque un trastero suelto nunca lo es). Sin AJD en segunda mano.
   *   Total = 2.560 + notaría + registro + 250 (leídas) · coste = 32.000 + total.
   * VENDEDOR — compra 20.000 · gastos 1.800 · 9 años · suelo 6.000 de 14.000 · comisión 4 % ·
   * gestoría 150:
   *   objetivo 6.000 × 0,15 × 25 % = 225,00 · real 12.000 × 6/14 × 25 % = 1.285,71 → 225,00
   *   comisión 1.280,00 · transmisión 32.000 − 1.280 − 150 − 225 = 30.345,00
   *   adquisición 21.800,00 · ganancia 8.545,00 · IRPF 6.000 × 19 % + 2.545 × 21 % = 1.674,45
   *   total 225 + 1.280 + 150 + 1.674,45 = 3.329,45 · neto 28.670,55, DEFINITIVO.
   */
  test('CASO 47 — Baleares, 32.000 €, familia numerosa, y un vendedor con todo escrito', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['input[aria-label="Precio del trastero"]']);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await page.locator('#select-ccaa').selectOption('baleares');
    await page.locator('#select-perfil').selectOption('familia-numerosa');
    await sembrar(page, 'Precio del trastero', '32000');
    await sembrar(page, 'Gastos de gestoría del comprador (€)', '250');

    expect(await tituloTarjeta24(page, /^ITP \(/)).toBe('ITP (8,00 %)');
    expect(await valorTarjeta(page, /^ITP \(/)).toBe('2560,00 €');
    await expect(page.locator('h3', { hasText: /^AJD/ })).toHaveCount(0);

    const aviso = page.locator('[role="note"]').filter({ hasText: 'Podrías pagar menos' });
    await expect(aviso).toHaveCount(1);
    const oportunidades = (await aviso.locator('li').allInnerTexts()).map((s) => s.replace(ESPACIO_DURO, ' '));
    expect(oportunidades).toHaveLength(1);
    expect(oportunidades[0]).toContain('5,00 % — Familia numerosa');
    expect(oportunidades[0]).toContain('Vivienda habitual');

    const notaria = await importe06(page, 'Gastos de notaría');
    const registro = await importe06(page, 'Registro de la Propiedad');
    expect(await importe06(page, 'Gastos de gestoría')).toBe(250);
    const total = await importe06(page, 'Total gastos adicionales');
    expect(total).toBeCloseTo(2560 + notaria + registro + 250, 2);
    expect(await importe06(page, 'COSTE TOTAL')).toBeCloseTo(32000 + total, 2);
    expect(await descripcionTarjeta(page, 'COSTE TOTAL')).toBe('Precio del trastero + todos los gastos');

    await page.getByRole('button', { name: 'Vendedor', exact: true }).click();
    await sembrar(page, 'Precio de compra original', '20000');
    await sembrar(page, 'Impuestos y gastos que pagaste al comprarlo', '1800');
    await sembrar(page, 'Años de propiedad', '9');
    await sembrar(page, 'Valor catastral del suelo', '6000');
    await sembrar(page, 'Valor catastral total (suelo + construcción)', '14000');
    await sembrar(page, 'Comisión inmobiliaria (%)', '4');
    await sembrar(page, 'Gestoría y certificados del vendedor (€)', '150');

    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('225,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe('Método objetivo (más favorable)');
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('21.800,00 €');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('30.345,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('8545,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('1674,45 €');
    // El título de la comisión con el % separado por un espacio DURO (hallazgo 2194).
    const tituloComision = (await page.locator('h3').filter({ hasText: /Comisión inmobiliaria/ }).first().innerText()).trim();
    expect(tituloComision).toBe('Comisión inmobiliaria (4 %)');
    expect(await valorTarjeta(page, /Comisión inmobiliaria/)).toBe('1280,00 €');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('150,00 €');
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('3329,45 €');
    expect(await tituloTarjeta24(page, /^IMPORTE NETO VENDEDOR/)).toBe('IMPORTE NETO VENDEDOR');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('28.670,55 €');
    expect(await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('Lo que realmente recibes tras los gastos');
  });

  /**
   * CASO 48 (límite: modalidad × territorio) — Navarra, obra nueva, 50.000 €, gestoría 300.
   *   Vinculado: IVA 10 % = 5.000,00 · AJD 0,5 % = 250,00 (Navarra no exime la vivienda: no
   *     tiene `ajdVivienda`, y el vinculado pasa con `objeto: 'vivienda'`).
   *   Independiente: IVA 21 % = 10.500,00 · el MISMO AJD de 250,00. Los totales difieren
   *     exactamente en 5.500,00, sea cual sea la notaría.
   *   Ceuta (sin IVA): IPSI «No calculado», AJD 50.000 × 0,5 % × 50 % = 125,00 → «AJD (0,25 %)»,
   *     notaría y registro «(sin IPSI)», coste «puede ser mayor» y la nota de las facturas.
   *   Y un precio «0» o «0,004» (se pinta 0,00 €) no publica desglose (hallazgo 1601).
   */
  test('CASO 48 — Navarra en obra nueva, 50.000 €: 10 % o 21 % con el mismo AJD, y Ceuta', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['input[aria-label="Precio del trastero"]']);
    await page.locator('#select-ccaa').selectOption('navarra');
    await sembrar(page, 'Precio del trastero', '50000');
    await page.getByRole('button', { name: /Primera mano/ }).click();

    await expect(page.getByRole('button', { name: /Vinculado a vivienda/ })).toHaveAttribute('aria-pressed', 'true');
    expect(await tituloTarjeta24(page, /^IVA \(/)).toBe('IVA (10,00 %)');
    expect(await valorTarjeta(page, /^IVA \(/)).toBe('5000,00 €');
    expect(await tituloTarjeta24(page, /^AJD \(/)).toBe('AJD (0,50 %)');
    expect(await valorTarjeta(page, /^AJD \(/)).toBe('250,00 €');
    const notaria = await importe06(page, 'Gastos de notaría');
    const registro = await importe06(page, 'Registro de la Propiedad');
    const totalVinculado = await importe06(page, 'Total gastos adicionales');
    expect(totalVinculado).toBeCloseTo(5000 + 250 + notaria + registro + 300, 2);

    await page.getByRole('button', { name: /Independiente/ }).click();
    expect(await tituloTarjeta24(page, /^IVA \(/)).toBe('IVA (21,00 %)');
    expect(await valorTarjeta(page, /^IVA \(/)).toBe('10.500,00 €');
    expect(await valorTarjeta(page, /^AJD \(/)).toBe('250,00 €');
    await expect(page.getByRole('button', { name: /Primera mano/ })).toContainText('Paga IVA 21 %');
    expect((await importe06(page, 'Total gastos adicionales')) - totalVinculado).toBeCloseTo(5500, 2);

    await page.locator('#select-ccaa').selectOption('ceuta');
    await expect(page.locator('#rotulo-modalidad')).toHaveCount(0);
    expect(await valorTarjeta(page, 'IPSI')).toBe('No calculado');
    expect(await tituloTarjeta24(page, /^AJD \(/)).toBe('AJD (0,25 %)');
    expect(await valorTarjeta(page, /^AJD \(/)).toBe('125,00 €');
    expect(await tituloTarjeta24(page, /^Gastos de notaría/)).toBe('Gastos de notaría (sin IPSI)');
    expect(await tituloTarjeta24(page, /^Registro de la Propiedad/)).toBe('Registro de la Propiedad (sin IPSI)');
    const totalCeuta = await importe06(page, 'Total gastos adicionales');
    expect(totalCeuta).toBeCloseTo(
      125 + (await importe06(page, 'Gastos de notaría')) + (await importe06(page, 'Registro de la Propiedad')) + 300,
      2,
    );
    expect(await descripcionTarjeta(page, 'COSTE TOTAL (PARCIAL)')).toBe(
      'No incluye el IPSI: el coste real puede ser mayor. Las facturas de notaría y registro llevan además IPSI, que esta herramienta no calcula, así que cuestan más de lo que se muestra.',
    );

    // 08/10/2026: el 0 escrito se anunciaba como si el precio faltara (hallazgo [08/10-a], 3078),
    // REPARADO: ahora se nombra como no válido, y 0,004 «se queda en 0,00 € al céntimo».
    for (const precio of ['0', '0,004']) {
      await sembrar(page, 'Precio del trastero', precio);
      await expect(page.locator('h3', { hasText: /^COSTE TOTAL/ })).toHaveCount(0);
      await expect(page.getByText(`El precio escrito («${precio}»)`)).toBeVisible();
      await expect(page.getByText('Introduce el precio del trastero para ver el desglose de gastos del comprador')).toHaveCount(0);
    }
  });

  /**
   * CASO 49 (límite) — la notaría de libre acuerdo, rama que ningún caso de este fichero tocaba.
   * Madrid, segunda mano, 7.000.000 €, gestoría 300:
   *   ITP 6 % = 420.000,00 · notaría estimada solo hasta 6.010.121,04 € (lo que excede es de
   *   libre acuerdo, RD 1426/1989 nº 2.1) → total y coste «(parcial)», «puede ser mayor».
   *   Con la gestoría «2.000.50»: el total baja exactamente los 300 € y el coste pasa a «será
   *   mayor», nombrando las dos cosas que faltan.
   */
  test('CASO 49 — Madrid, 7.000.000 €: lo que excede del arancel notarial se nombra y el coste es parcial', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['input[aria-label="Precio del trastero"]']);
    await sembrar(page, 'Precio del trastero', '7000000');

    expect(await tituloTarjeta24(page, /^ITP \(/)).toBe('ITP (6,00 %)');
    expect(await valorTarjeta(page, /^ITP \(/)).toBe('420.000,00 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain(
      'Por encima de 6.010.121,04 € el arancel no fija cantidad',
    );
    expect(await tituloTarjeta24(page, /^Total gastos adicionales/)).toBe('Total gastos adicionales (parcial)');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toMatch(
      / — SIN la parte de la notaría que es de libre acuerdo$/,
    );
    expect(await descripcionTarjeta(page, 'COSTE TOTAL (PARCIAL)')).toBe(
      'No incluye la parte de la notaría que excede de 6.010.121,04 €, que es de libre acuerdo: el coste real puede ser mayor',
    );
    const notaria = await importe06(page, 'Gastos de notaría');
    const registro = await importe06(page, 'Registro de la Propiedad');
    const total = await importe06(page, 'Total gastos adicionales');
    expect(total).toBeCloseTo(420000 + notaria + registro + 300, 2);
    expect(await importe06(page, 'COSTE TOTAL (PARCIAL)')).toBeCloseTo(7000000 + total, 2);

    await sembrar(page, 'Gastos de gestoría del comprador (€)', '2.000.50');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('Sin leer');
    expect((await importe06(page, 'Total gastos adicionales')) - total).toBeCloseTo(-300, 2);
    // 08/10/2026: el literal gana la coma que cierra el inciso antes de «ni» (hallazgo 3080,
    // [08/10-c]; el 2958 de la referencia).
    expect(await descripcionTarjeta(page, 'COSTE TOTAL (PARCIAL)')).toBe(
      'No incluye la gestoría, que no se ha podido leer, ni la parte de la notaría que excede de 6.010.121,04 €, que es de libre acuerdo: el coste real será mayor',
    );
  });

  /**
   * CASO 50 (debe nombrarse) — el invariante de la familia con el selector de MESES, que no es
   * un NumberInput y el testigo no recorre. Base: venta 15.000 · compra 10.000 · gastos 1.000 ·
   * 0 años y 6 meses completos · suelo 4.000 de 9.000 · comisión 3 % · gestoría 500.
   *   coeficiente 0,15 × 6/12 = 0,075 → objetivo 4.000 × 0,075 × 25 % = 75,00 (real 555,56)
   *   transmisión 15.000 − 450 − 500 − 75 = 13.975 · adquisición 11.000 · ganancia 2.975
   *   IRPF 565,25 · total 1.590,25 · neto 13.409,75 DEFINITIVO.
   * Gastos de aquella compra «2.000.50» (leídos como 0): adquisición 10.000 · ganancia 3.975 ·
   *   IRPF 755,25 · total 1.780,25 · neto 13.219,75 → el real (13.409,75) es MAYOR, seguro.
   * Años «2.000.50»: desaparece el selector de meses, sin plusvalía · transmisión 14.050 ·
   *   ganancia 3.050 (máximo) · IRPF 579,50 (máximo) · total 1.529,50 · neto 13.470,50 →
   *   el real (13.409,75) es MENOR: «puede ser menor».
   */
  test('CASO 50 — reventa a los 6 meses: los gastos de compra y los años ilegibles se nombran con su dirección', async ({ page }) => {
    const base = { venta: '15000', compra: '10000', gastos: '1000', anios: '0', meses: '6', suelo: '4000', total: '9000', comision: '3', gestoria: '500' };
    await vendedor26(page, base);
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('75,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('565,25 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('13.409,75 €');
    expect(await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('Lo que realmente recibes tras los gastos');

    await vendedor26(page, { ...base, gastos: '2.000.50' });
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('75,00 €');
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('10.000,00 €');
    expect(await descripcionTarjeta(page, 'Valor de adquisición')).toBe(
      'Solo el precio de compra: los impuestos y gastos de aquella compra no se han podido leer',
    );
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('3975,00 €');
    expect(await descripcionTarjeta(page, 'Ganancia patrimonial')).toBe(
      'No se han podido leer los impuestos y gastos de aquella compra, así que la ganancia real es menor. Escríbelo con coma decimal (1.234,56).',
    );
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('755,25 €');
    expect(await descripcionTarjeta(page, 'IRPF sobre ganancia')).toBe(
      'No se han podido leer los impuestos y gastos de aquella compra, así que la cuota real es menor. Escríbelo con coma decimal (1.234,56). Calculado como si esta venta fuera tu única renta del ahorro del año: si tienes intereses, dividendos u otras ganancias, escríbelos arriba, porque la cuota puede ser mayor.',
    );
    expect(await tituloTarjeta24(page, /^IMPORTE NETO VENDEDOR/)).toBe('IMPORTE NETO VENDEDOR (PARCIAL)');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('13.219,75 €');
    expect(await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe(
      'No se han podido leer los impuestos y gastos de aquella compra (suman al valor de adquisición y REDUCEN el IRPF): el neto real es MAYOR que este. Escribe con coma decimal (1.234,56) lo que no se ha podido leer para obtenerlo.',
    );

    await vendedor26(page, { ...base, anios: '2.000.50', meses: undefined });
    await expect(page.locator('#meses-completos')).toHaveCount(0);
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('SIN CALCULAR');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe(
      'No calculada (no se han podido leer los años de propiedad)',
    );
    expect(await tituloTarjeta24(page, /^Ganancia patrimonial/)).toBe('Ganancia patrimonial (máximo)');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('3050,00 €');
    expect(await tituloTarjeta24(page, /^IRPF sobre ganancia/)).toBe('IRPF sobre ganancia (máximo)');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('579,50 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('13.470,50 €');
    expect(await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe(
      'No descuenta la plusvalía municipal: el neto real puede ser menor que este. No se han podido leer los años de propiedad. Escribe con coma decimal (1.234,56) lo que no se ha podido leer para obtenerlo.',
    );
  });

  /**
   * CASO 51 (regresión de 2190, 2194 y 242fffcd) — ningún % pegado ni con espacio normal en lo
   * que la app pinta, recorriendo los textos que llegan de data/ sin pasar por sus constantes:
   * la nota de las 19 comunidades, la escala o el umbral de describirSubidaITP, los reducidos
   * del aviso «Podrías pagar menos» con los cuatro perfiles, las dos modalidades de obra nueva,
   * la respuesta de «escriturar» y los dos bloques JSON-LD. El caso del 26/09 solo miraba el
   * texto visible de la pestaña Vendedor. Se descuenta el bloque de apps relacionadas, cuyo
   * texto es de data/app-relations.ts.
   */
  test('CASO 51 — el % de lo que llega de data/ va con espacio duro en las 19 comunidades', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['input[aria-label="Precio del trastero"]']);
    await sembrar(page, 'Precio del trastero', '120000');
    const malos = new Map<string, string>();
    const anotar = (texto: string, donde: string) => {
      for (const m of texto.matchAll(/.{0,40}\d ?%/g)) if (!malos.has(m[0])) malos.set(m[0], donde);
    };
    const leer = () =>
      page.evaluate(() => {
        const clon = document.body.cloneNode(true) as HTMLElement;
        clon
          .querySelectorAll('section[aria-label="Aplicaciones relacionadas"], script, style')
          .forEach((n) => n.remove());
        return clon.textContent ?? '';
      });
    const comunidades = await page.locator('#select-ccaa option').evaluateAll((os) =>
      os.map((o) => (o as HTMLOptionElement).value),
    );
    expect(comunidades).toHaveLength(19);

    await page.getByRole('button', { name: /Segunda mano/ }).click();
    for (const c of comunidades) {
      await page.locator('#select-ccaa').selectOption(c);
      for (const perfil of ['general', 'joven', 'familia-numerosa', 'discapacidad']) {
        await page.locator('#select-perfil').selectOption(perfil);
        anotar(await leer(), `${c} · segunda mano · ${perfil}`);
      }
    }
    await page.getByRole('button', { name: /Primera mano/ }).click();
    for (const c of comunidades) {
      await page.locator('#select-ccaa').selectOption(c);
      anotar(await leer(), `${c} · obra nueva`);
      if ((await page.getByRole('button', { name: /Independiente/ }).count()) > 0) {
        await page.getByRole('button', { name: /Independiente/ }).click();
        anotar(await leer(), `${c} · obra nueva · independiente`);
        await page.getByRole('button', { name: /Vinculado a vivienda/ }).click();
      }
    }

    const cadenas = (v: unknown): string[] =>
      typeof v === 'string'
        ? [v]
        : Array.isArray(v)
          ? v.flatMap(cadenas)
          : v && typeof v === 'object'
            ? Object.values(v).flatMap(cadenas)
            : [];
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(bloques.length).toBeGreaterThan(0);
    for (const b of bloques) anotar(cadenas(JSON.parse(b)).join(' ¦ '), 'JSON-LD');

    expect([...malos].map(([texto, donde]) => `[${donde}] …${texto}`)).toEqual([]);
  });
});

// ✅ REPARADO el 06/10/2026 (hallazgo 2907; también en garaje y en la referencia): «El ITP o, en obra
// nueva, el AJD debe liquidarse…». Era así (bajo, contenido): el consejo «Liquida los impuestos a
// tiempo» del bloque educativo atribuía al IVA el plazo de autoliquidación del ITP y AJD.
// `PLAZO_ITP` (data/fiscal/inmuebles.ts) es el «Plazo de autoliquidación del ITP y AJD», y su
// base normativa, el art. 102.1 del Reglamento del ITPAJD (RD 828/1995), solo regula las
// declaraciones-liquidaciones de ese impuesto. El IVA de la obra nueva no lo autoliquida el
// comprador: lo repercute el promotor en la factura (arts. 84.Uno.1.º y 88 de la Ley 37/1992) y
// lo declara él. La frase, seguida del recargo del art. 27.2 LGT por «presentarlo tarde», le
// dice al comprador de obra nueva que tiene que liquidar el IVA en 30 días hábiles.
// La hermana garaje dice «El ITP debe liquidarse…» (sin el IVA, aunque deja fuera el AJD); la
// referencia (estimador-compraventa-inmueble, l. 3100 y 3181) arrastra el mismo «IVA+AJD».
// Caso: abrir la guía → «Liquida los impuestos a tiempo»
//       → esperado: el plazo de 30 días hábiles atribuido al ITP o, en obra nueva, al AJD
//       → obtenido: «El ITP o el IVA+AJD debe liquidarse en 30 días hábiles desde la firma de la
//         escritura (art. 102.1 del Reglamento del ITPAJD, RD 828/1995)».
test('HALLAZGO 06/10 (contenido) — el plazo del art. 102.1 RITPAJD es del ITP y el AJD, no del IVA', async ({ page }) => {
  await page.goto(RUTA);
  await esperarHidratacion(page, ['input[aria-label="Precio del trastero"]']);
  const consejo = await consejoPlazo06(page);
  // FONDO primero: dentro de un test.fail() basta con que falle cualquier aserción.
  expect(consejo).not.toMatch(/IVA\s*\+\s*AJD debe liquidarse/);
  expect(consejo).toContain('art. 102.1 del Reglamento del ITPAJD, RD 828/1995');
});

// ✅ REPARADO el 06/10/2026 (hallazgo 2908; también en la referencia). Era así (bajo, contenido): en
// el mismo consejo faltaba el espacio entre el aviso en
// negrita y la frase siguiente: en page.tsx (~l. 2093) `</strong>` cierra la línea y «Presentarlo»
// abre la siguiente, y JSX descarta ese salto de línea sin dejar espacio. La hermana garaje escribe
// «</strong> Presentarlo» en la misma línea y no lo tiene. (La referencia, l. 3101-3102, cierra la
// línea con `{PLAZO_ITP.aviso}` y empieza la siguiente con «El incumplimiento»: misma forma, sin
// medir.)
// Caso: abrir la guía → «Liquida los impuestos a tiempo»
//       → esperado «…Confirma el de la tuya antes de presentar. Presentarlo tarde por iniciativa propia…»
//       → obtenido «…antes de presentar.Presentarlo tarde por iniciativa propia…» (textContent e innerText).
test('HALLAZGO 06/10 (contenido) — el aviso del plazo y la frase del recargo van separados por un espacio', async ({ page }) => {
  await page.goto(RUTA);
  await esperarHidratacion(page, ['input[aria-label="Precio del trastero"]']);
  const consejo = await consejoPlazo06(page);
  expect(consejo).not.toContain('presentar.Presentarlo');
  expect(consejo).toContain('antes de presentar. Presentarlo tarde por iniciativa propia');
});

// ✅ REPARADO el 06/10/2026 (hallazgo 2909): en segunda mano el AJD del recuadro es el del trastero
// suelto. Era así (bajo, contenido), medido aquí a raíz del hallazgo de la gemela garaje.
// En SEGUNDA mano el recuadro de la comunidad rotula el ITP del trastero SUELTO
// (`tipoGeneralITP(ccaa, OBJETO_ITP, …)`, ~l. 1237), pero el AJD de al lado sale de
// `tipoAJD(ccaa, { objeto: objetoAJDDe(modalidadTrastero) })` (~l. 1242), y la modalidad es un
// estado que en segunda mano NO se ve: el selector solo se pinta en obra nueva. En el País Vasco
// (AJD 0 % de la vivienda, `ajdVivienda`, y 0,5 % del resto) la misma pantalla publica dos cifras
// distintas según por dónde haya pasado el usuario, y la de carga (0 %) es la de un objeto
// distinto del que rotula el ITP de al lado (7 %, el del trastero suelto).
// Caso: País Vasco · segunda mano · 20.000 € → recuadro «ITP General 7 % · AJD 0 %»; pulsar
//       Primera mano → Independiente → Segunda mano → misma pantalla (sin selector de modalidad)
//       → esperado: el mismo AJD en las dos visitas · obtenido «AJD 0,5 %».
test('HALLAZGO 06/10 (contenido) — en segunda mano el AJD del recuadro no depende de una modalidad oculta', async ({ page }) => {
  await page.goto(RUTA);
  await esperarHidratacion(page, ['input[aria-label="Precio del trastero"]']);
  await page.locator('#select-ccaa').selectOption('pais-vasco');
  await sembrar(page, 'Precio del trastero', '20000');
  const ajdDelRecuadro = async (): Promise<string> =>
    (await page.locator('[class*="infoCcaaItem"]').nth(1).innerText()).replace(ESPACIO_DURO, ' ').replace(/\s+/g, ' ').trim();
  const alCargar = await ajdDelRecuadro();

  await page.getByRole('button', { name: /Primera mano/ }).click();
  await page.getByRole('button', { name: /Independiente/ }).click();
  await page.getByRole('button', { name: /Segunda mano/ }).click();
  await expect(page.locator('#rotulo-modalidad')).toHaveCount(0);

  // FONDO primero: la misma pantalla, el mismo dato.
  expect(await ajdDelRecuadro()).toBe(alCargar);
  expect(alCargar).toMatch(/^AJD/);
  // Y es el del trastero suelto, el objeto cuyo ITP (7 %) rotula la casilla de al lado
  expect(alCargar).toBe('AJD 0,5 %');
});

/**
 * El contraste MÁS BAJO entre los elementos visibles que casan con el selector, contra su fondo
 * efectivo, contando la OPACIDAD del propio elemento y de sus contenedores hasta el botón: el
 * `contraste26` de arriba solo mira `color`, y una `opacity: 0.8` no le cambia nada.
 */
async function contrasteMinimo06(page: Page, selector: string): Promise<{ ratio: number; texto: string }> {
  return esperarEstable(() =>
    page.evaluate((sel) => {
      const canal = (c: number) => {
        const v = c / 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      };
      const partes = (s: string) => (s.match(/[\d.]+/g) || []).map(Number);
      const lum = ([r, g, b]: number[]) => 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
      const mezcla = (fg: number[], bg: number[], a: number) => fg.map((c, i) => a * c + (1 - a) * bg[i]);
      let peor = { ratio: Infinity, texto: '' };
      for (const el of Array.from(document.querySelectorAll(sel))) {
        if ((el as HTMLElement).offsetParent === null) continue;
        const capas: { rgb: number[]; a: number }[] = [];
        let n: Element | null = el;
        while (n) {
          const p = partes(getComputedStyle(n).backgroundColor);
          const a = p.length === 4 ? p[3] : 1;
          if (a > 0) capas.push({ rgb: p.slice(0, 3), a });
          if (a === 1) break;
          n = n.parentElement;
        }
        if (!capas.length || capas[capas.length - 1].a !== 1) capas.push({ rgb: [255, 255, 255], a: 1 });
        let fondo = capas[capas.length - 1].rgb;
        for (let i = capas.length - 2; i >= 0; i--) fondo = mezcla(capas[i].rgb, fondo, capas[i].a);
        let opacidad = 1;
        for (let m: Element | null = el; m && m.tagName !== 'BUTTON'; m = m.parentElement) {
          opacidad *= Number(getComputedStyle(m).opacity);
        }
        const color = partes(getComputedStyle(el).color);
        const alfa = (color.length === 4 ? color[3] : 1) * opacidad;
        const texto = mezcla(color.slice(0, 3), fondo, alfa);
        const l1 = lum(texto);
        const l2 = lum(fondo);
        const ratio = Math.round(((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)) * 100) / 100;
        if (ratio < peor.ratio) peor = { ratio, texto: (el.textContent ?? '').trim() };
      }
      return peor;
    }, selector),
  );
}

// ✅ REPARADO el 06/10/2026 (hallazgo 2910): `.transmisionSub` pierde la opacidad en las tres
// hermanas que la tenían (trastero, garaje y la referencia). Era así (bajo, accesibilidad), medido
// aquí a raíz del hallazgo de la gemela garaje.
// `.transmisionSub { font-size: 0.8rem; opacity: 0.8 }` (SimuladorTrasteroCompraventa.module.css
// ~l. 190) apaga los subtítulos de los cuatro botones de transmisión y modalidad («Paga ITP»,
// «Paga IVA 10 %/21 %», «Anejo residencial», «Finca registral propia»): 12,8 px de peso 400 es
// texto normal y exige 4,5:1. Medido con el fondo compuesto y la opacidad: tema claro 3,60:1 en
// el botón inactivo (#666 sobre #FAFAFA) y 3,36:1 en el activo (#26718F sobre #EAF3F7); tema
// oscuro 3,50:1 en el activo (#3FA5D1 sobre #2A3337). Los contrastes de la medición del 26/09 no
// lo vieron porque leen `color` y no la opacidad.
// Caso: primera mano, tema claro → esperado ≥ 4,5:1 · obtenido 3,36:1 («Paga IVA 21 %» y
//       «Finca registral propia» con su botón activo).
test('HALLAZGO 06/10 (accesibilidad) — los subtítulos de los botones de transmisión y modalidad llegan a 4,5:1', async ({ page }) => {
  await page.goto(RUTA);
  await esperarHidratacion(page, ['input[aria-label="Precio del trastero"]']);
  await page.getByRole('button', { name: /Primera mano/ }).click();
  await expect(page.locator('#rotulo-modalidad')).toHaveCount(1);
  for (const tema of ['light', 'dark'] as const) {
    await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), tema);
    const peor = await contrasteMinimo06(page, '[class*="transmisionSub"]');
    expect(peor.ratio, `tema ${tema}: «${peor.texto}»`).toBeGreaterThanOrEqual(4.5);
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// INSPECTOR 08/10/2026 — la familia de compraventa entera, una hermana por agente (referencia:
// estimador-compraventa-inmueble). Desde la inspección del 06/10 el único cambio de código es
// 99e1ee7e (las relacionadas las monta el layout con <ConRelacionadas>): verificado en el HTML
// servido y tras hidratar, cuatro tarjetas y la consola limpia.
//
// El invariante de la familia («un importe ILEGIBLE no es un cero: si mueve una cifra publicada,
// la app lo nombra y dice en qué dirección falta») se barrió campo a campo en las dos pestañas
// —los 7 importes del vendedor en cinco bases (ganancia, pérdida, suelo vacío, ganancia mínima y
// reventa a los 6 meses) y la gestoría del comprador en Galicia, Canarias, Ceuta, Madrid a
// 7.000.000 € y Canarias a 7.000.000 €—, y se cumple en todos: lo que no se cumple es la
// redacción de abajo.
//
// De dónde sale cada cifra (ninguna de memoria):
//  - ITP: `TIPOS_ITP_CCAA_2025` (Galicia 8 %, Valencia 9 %) y `ITP_CCAA.valencia.umbralTipoUnico`
//    (11 % sobre TODO el valor por encima de 1.000.000 €), contrastado hoy con su fuente: Ley
//    13/1997 valenciana, art. 13.Uno, BOE-A-1998-8202 consolidado: «El 9 % en las adquisiciones
//    de inmuebles […] No obstante, cuando el valor de los bienes inmuebles transmitidos […] sea
//    superior a un millón de euros, el tipo aplicable será el 11 %». Vale para cualquier
//    inmueble, no solo la vivienda: el trastero lo paga igual.
//  - Notaría y registro: NO se fijan (hallazgos 2901 y 2902 de la referencia, abiertos aquel día
//    y hoy REPARADOS: faltaba la rebaja del 5 % de los dos aranceles, que el motor aplica desde el
//    11/10/2026). Se leen de la pantalla y se comprueba que el total las sume. A mano, con el
//    arancel de ANTES de esa rebaja: 27.500 € → notaría 395,66 (339,14 – 452,19) y registro
//    85,50; 1.000.000 € → 1437,01 y 478,35.
//  - Plusvalía: `COEFICIENTES_IIVTNU_2025` (12 años 0,09; menos de 1 año 0,15 prorrateado) y
//    `PLUSVALIA_MUNICIPAL_META.tipoOrientativo` = 25 %.
//  - IRPF: `TRAMOS_GANANCIAS_PATRIMONIALES_2025` (19 % hasta 6.000, 21 % hasta 50.000).
// ═══════════════════════════════════════════════════════════════════════════════

/** El vendedor completo en una comunidad (los importes del vendedor no dependen de ella hoy). */
async function vendedor0810(
  page: Page,
  d: { ccaa: string; venta: string; compra: string; gastos: string; anios: string; suelo: string; total: string; comision: string; gestoria: string },
): Promise<void> {
  await page.goto(RUTA);
  await esperarHidratacion(page, ['input[aria-label="Precio del trastero"]']);
  await page.locator('#select-ccaa').selectOption(d.ccaa);
  await sembrar(page, 'Precio del trastero', d.venta);
  await page.getByRole('button', { name: 'Vendedor', exact: true }).click();
  await sembrar(page, 'Precio de compra original', d.compra);
  await sembrar(page, 'Impuestos y gastos que pagaste al comprarlo', d.gastos);
  await sembrar(page, 'Años de propiedad', d.anios);
  await sembrar(page, 'Valor catastral del suelo', d.suelo);
  await sembrar(page, 'Valor catastral total (suelo + construcción)', d.total);
  await sembrar(page, 'Comisión inmobiliaria (%)', d.comision);
  await sembrar(page, 'Gestoría y certificados del vendedor (€)', d.gestoria);
}

/** La base de Galicia de los CASOS 52 y 54 (ganancia, plusvalía por el método objetivo). */
const BASE_0810 = {
  ccaa: 'galicia',
  venta: '27500',
  compra: '16000',
  gastos: '1400',
  anios: '12',
  suelo: '5200',
  total: '13000',
  comision: '4',
  gestoria: '220',
};

/** Escribe sin salir del campo: el valor que el blur reescribiría (un negativo) sigue a la vista. */
async function sembrarConFoco0810(page: Page, etiqueta: string, valor: string): Promise<void> {
  const selector = `input[aria-label="${etiqueta}"]`;
  await esperarHidratacion(page, [selector]);
  await page.locator(selector).fill(valor);
  await esperarValorEnReact(page, selector, valor);
}

/** El texto que la pestaña activa pinta cuando no publica desglose. */
async function sinDesglose0810(page: Page): Promise<string> {
  return texto(page.locator('[class*="placeholder"] p').first());
}

/** El aviso «Podrías pagar menos» (cero coincidencias si no se pinta). */
const avisoReducidos0810 = (page: Page) =>
  page.locator('[role="note"]').filter({ hasText: 'Podrías pagar menos' });

test.describe('Inspector 08/10/2026 — Galicia con discapacidad, el umbral valenciano del millón y el 0 que no falta', () => {
  /**
   * CASO 52 (normal) — Galicia · segunda mano · 27.500 € · perfil discapacidad · gestoría 280.
   *   ITP = 27.500 × 8 % (Galicia, sin escala) = 2.200,00 → «ITP (8,00 %)»
   *   El reducido de discapacidad (3 %) exige vivienda habitual y valor ≤ 150.000 €: no se aplica
   *   y se ofrece, solo, sin el aviso del tope (27.500 no lo supera). El de vivienda habitual
   *   (7 %) no es de colectivo y se descarta: un trastero suelto nunca lo es.
   *   total = 2.200 + notaría + registro + 280 (a mano 2961,16, 10,77 %) · coste = 27.500 + total
   * VENDEDOR — compra 16.000 · gastos 1.400 · 12 años · suelo 5.200 de 13.000 · comisión 4 % ·
   * gestoría 220:
   *   plusvalía: objetivo 5.200 × 0,09 × 25 % = 117,00 · real 11.500 × 0,4 × 25 % = 1.150 → 117,00
   *   comisión 1.100,00 · transmisión 27.500 − 1.100 − 220 − 117 = 26.063,00 · adquisición 17.400
   *   ganancia 8.663,00 · IRPF 6.000 × 19 % + 2.663 × 21 % = 1.140 + 559,23 = 1.699,23
   *   total 117 + 1.100 + 220 + 1.699,23 = 3.136,23 · neto 24.363,77, DEFINITIVO.
   * Y la PÉRDIDA (compra 30.000 > venta): no sujeta a plusvalía (art. 104.5 TRLRHL) ·
   *   transmisión 26.180 · adquisición 31.400 · pérdida 5.220,00 · neto 26.180,00. Con los gastos
   *   de aquella compra «2.000.50» la adquisición baja a 30.000 y la pérdida a 3.820,00, que se
   *   nombra «mayor»; el neto NO se mueve (sin IRPF que rebajar) y sigue siendo definitivo.
   */
  test('CASO 52 — Galicia, 27.500 €: el 3 % de discapacidad sin aplicar, un vendedor completo y una pérdida', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['input[aria-label="Precio del trastero"]']);
    await page.locator('#select-ccaa').selectOption('galicia');
    await page.locator('#select-perfil').selectOption('discapacidad');
    await sembrar(page, 'Precio del trastero', '27500');
    await sembrar(page, 'Gastos de gestoría del comprador (€)', '280');

    expect(await tituloTarjeta24(page, /^ITP \(/)).toBe('ITP (8,00 %)');
    expect(await valorTarjeta(page, /^ITP \(/)).toBe('2200,00 €');
    expect(await descripcionTarjeta(page, /^ITP \(/)).toBe('ITP Galicia');
    const notaria = await importe06(page, 'Gastos de notaría');
    const registro = await importe06(page, 'Registro de la Propiedad');
    expect(await importe06(page, 'Gastos de gestoría')).toBe(280);
    const total = await importe06(page, 'Total gastos adicionales');
    expect(total).toBeCloseTo(2200 + notaria + registro + 280, 2);
    expect(await importe06(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBeCloseTo(27500 + total, 2);
    expect(await descripcionTarjeta(page, 'COSTE TOTAL')).toBe('Precio del trastero + todos los gastos');

    const aviso = avisoReducidos0810(page);
    await expect(aviso).toHaveCount(1);
    const lineas = (await aviso.locator('li').allInnerTexts()).map((s) => s.replace(ESPACIO_DURO, ' '));
    expect(lineas).toHaveLength(1);
    expect(lineas[0]).toContain('3,00 % — Discapacidad ≥65 %');
    expect(lineas[0]).toContain('Vivienda habitual');
    expect(lineas[0]).toContain('Valor máximo 150.000,00 €');
    expect(lineas[0]).not.toContain('supera ese límite');

    await vendedor0810(page, BASE_0810);
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('117,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe('Método objetivo (más favorable)');
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('17.400,00 €');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('26.063,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('8663,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('1699,23 €');
    expect(await valorTarjeta(page, /Comisión inmobiliaria/)).toBe('1100,00 €');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('220,00 €');
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('3136,23 €');
    expect(await tituloTarjeta24(page, /^IMPORTE NETO VENDEDOR/)).toBe('IMPORTE NETO VENDEDOR');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('24.363,77 €');
    expect(await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('Lo que realmente recibes tras los gastos');

    await vendedor0810(page, { ...BASE_0810, compra: '30000' });
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('NO SUJETA');
    expect(await valorTarjeta(page, 'Pérdida patrimonial')).toBe('5220,00 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('26.180,00 €');

    await sembrar(page, 'Impuestos y gastos que pagaste al comprarlo', '2.000.50');
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('30.000,00 €');
    expect(await valorTarjeta(page, 'Pérdida patrimonial')).toBe('3820,00 €');
    expect(await descripcionTarjeta(page, 'Pérdida patrimonial')).toBe(
      'No se han podido leer los impuestos y gastos de aquella compra: la pérdida real es mayor que esta. Escríbelo con coma decimal (1.234,56).',
    );
    expect(await tituloTarjeta24(page, /^IMPORTE NETO VENDEDOR/)).toBe('IMPORTE NETO VENDEDOR');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('26.180,00 €');
    expect(await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('Lo que realmente recibes tras los gastos');
  });

  /**
   * CASO 53 (límite) — el UMBRAL valenciano, al céntimo. Valencia · segunda mano · general ·
   * gestoría 300 (la de fábrica). Ley 13/1997, art. 13.Uno: 9 %, y el 11 % sobre TODO el valor
   * cuando este es «superior a un millón de euros».
   *   1.000.000,00 → ITP 9 % = 90.000,00 → «ITP (9,00 %)» · recuadro «ITP General 9 %»
   *   1.000.000,01 → ITP 11 % = 110.000,0011 → 110.000,00 → «ITP (11,00 %)» · recuadro «11 %»
   *   La notaría y el registro no cambian por un céntimo (1437,01 y 478,35 a mano), así que el
   *   total salta EXACTAMENTE 20.000,00 €. Ningún reducido valenciano está al alcance de un
   *   trastero suelto con perfil general: no hay aviso «Podrías pagar menos».
   */
  test('CASO 53 — Valencia, 1.000.000 € frente a 1.000.000,01 €: del 9 % al 11 % sobre todo el valor', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['input[aria-label="Precio del trastero"]']);
    await page.locator('#select-ccaa').selectOption('valencia');
    const recuadroITP = async (): Promise<string> =>
      (await page.locator('[class*="infoCcaaItem"]').nth(0).innerText()).replace(ESPACIO_DURO, ' ').replace(/\s+/g, ' ').trim();

    await sembrar(page, 'Precio del trastero', '1000000');
    expect(await tituloTarjeta24(page, /^ITP \(/)).toBe('ITP (9,00 %)');
    expect(await valorTarjeta(page, /^ITP \(/)).toBe('90.000,00 €');
    expect(await recuadroITP()).toBe('ITP General 9 %');
    const notaria = await importe06(page, 'Gastos de notaría');
    const registro = await importe06(page, 'Registro de la Propiedad');
    const totalMillon = await importe06(page, 'Total gastos adicionales');
    expect(totalMillon).toBeCloseTo(90000 + notaria + registro + 300, 2);
    expect(await importe06(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBeCloseTo(1000000 + totalMillon, 2);
    await expect(avisoReducidos0810(page)).toHaveCount(0);

    await sembrar(page, 'Precio del trastero', '1000000,01');
    expect(await tituloTarjeta24(page, /^ITP \(/)).toBe('ITP (11,00 %)');
    expect(await valorTarjeta(page, /^ITP \(/)).toBe('110.000,00 €');
    expect(await recuadroITP()).toBe('ITP General 11 %');
    expect(await importe06(page, 'Gastos de notaría')).toBeCloseTo(notaria, 2);
    expect(await importe06(page, 'Registro de la Propiedad')).toBeCloseTo(registro, 2);
    const totalUmbral = await importe06(page, 'Total gastos adicionales');
    expect(totalUmbral - totalMillon).toBeCloseTo(20000, 2);
    expect(await importe06(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBeCloseTo(1000000.01 + totalUmbral, 2);
    await expect(avisoReducidos0810(page)).toHaveCount(0);
  });

  /**
   * CASO 54 (debe rechazarse) — el 0 escrito. Lo que SÍ hace bien y no cambiará al reparar los
   * hallazgos [08/10-a] y [08/10-b] de abajo:
   *   · precio «0», o «-5000» con el foco dentro (el blur lo deja en 0): ningún desglose, ni en
   *     el comprador ni en el vendedor (hallazgo 1601);
   *   · suelo «0» en la base del CASO 52: la plusvalía no se inventa («SIN CALCULAR») y las cifras
   *     son las de una plusvalía pendiente: transmisión 27.500 − 1.100 − 220 = 26.180 · ganancia
   *     8.780,00 (máximo) · IRPF 1.140 + 2.780 × 21 % = 1.723,80 (máximo) · total 1.100 + 220 +
   *     1.723,80 = 3.043,80 · neto 24.456,20 (PARCIAL);
   *   · y el precio de compra «0», que esta app YA distingue (hallazgo 2193): «tiene que ser mayor
   *     que 0: corrígelo».
   */
  test('CASO 54 — el 0 escrito en el precio y en el suelo no publica cifras inventadas', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['input[aria-label="Precio del trastero"]']);
    for (const [precio, foco] of [['0', false], ['-5000', true]] as const) {
      if (foco) await sembrarConFoco0810(page, 'Precio del trastero', precio);
      else await sembrar(page, 'Precio del trastero', precio);
      await expect(page.locator('input[aria-label="Precio del trastero"]')).toHaveValue(precio);
      await expect(page.locator('h3', { hasText: /^COSTE TOTAL/ })).toHaveCount(0);
      await page.getByRole('button', { name: 'Vendedor', exact: true }).click();
      await expect(page.locator('h3', { hasText: /^IMPORTE NETO VENDEDOR/ })).toHaveCount(0);
      await page.getByRole('button', { name: 'Comprador', exact: true }).click();
    }

    await vendedor0810(page, { ...BASE_0810, suelo: '0' });
    await expect(page.locator('input[aria-label="Valor catastral del suelo"]')).toHaveValue('0');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('SIN CALCULAR');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('26.180,00 €');
    expect(await tituloTarjeta24(page, /^Ganancia patrimonial/)).toBe('Ganancia patrimonial (máximo)');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('8780,00 €');
    expect(await tituloTarjeta24(page, /^IRPF sobre ganancia/)).toBe('IRPF sobre ganancia (máximo)');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('1723,80 €');
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('3043,80 €');
    expect(await tituloTarjeta24(page, /^IMPORTE NETO VENDEDOR/)).toBe('IMPORTE NETO VENDEDOR (PARCIAL)');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('24.456,20 €');

    await vendedor0810(page, { ...BASE_0810, compra: '0' });
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('Sin calcular');
    expect(await descripcionTarjeta(page, 'IRPF sobre ganancia')).toBe(
      'El precio de compra original tiene que ser mayor que 0: corrígelo. Este impuesto NO está incluido en el neto de abajo.',
    );
  });

  // ─── HALLAZGOS del 08/10/2026, REPARADOS (3078-3083) ─────────────────────────────────
  // Nacieron con `test.fail()` y la aserción de FONDO primero; al repararlos el 08/10/2026 se
  // les quitó la marca y quedan como regresión (re-inspección del 13/10/2026: la base los tiene
  // cerrados). El escenario de los dos primeros lo sujeta en verde el CASO 54.

  // HALLAZGO [08/10-a] (bajo, contenido) — ✅ REPARADO el 08/10/2026 (3078). Patrón 5 en el PRECIO principal: es el 2960
  // de la referencia y el 3062 de local-comercial. Con el precio escrito «0», o «-5000» con el foco
  // dentro (el blur lo deja en 0), los dos paneles piden que se introduzca el precio, como si el
  // campo estuviera vacío, con el 0 a la vista. page.tsx distingue el ilegible (escritoIlegible)
  // pero no el «no vale». Solar, nave y terreno rústico ya lo distinguen («El precio escrito («0»)
  // tiene que ser mayor que 0: corrígelo…»), y esta misma app lo hace con el precio de compra
  // original desde el 2193. Al repararlo cambia el literal del «0» en el CASO 48.
  //   obtenido: «Introduce el precio del trastero para ver el desglose de gastos del comprador» y
  //   «Introduce el precio de venta y los datos adicionales para calcular el neto del vendedor».
  test('[08/10-a] un precio escrito como 0 se nombra como no válido, no como que falta', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['input[aria-label="Precio del trastero"]']);
    await sembrar(page, 'Precio del trastero', '0');
    const comprador = await sinDesglose0810(page);
    await page.getByRole('button', { name: 'Vendedor', exact: true }).click();
    const vendedor = await sinDesglose0810(page);
    // El defecto.
    expect({ comprador: /mayor que 0/.test(comprador), vendedor: /mayor que 0/.test(vendedor) }).toEqual({
      comprador: true,
      vendedor: true,
    });
    await page.getByRole('button', { name: 'Comprador', exact: true }).click();
    await sembrarConFoco0810(page, 'Precio del trastero', '-5000');
    expect(await sinDesglose0810(page)).toMatch(/mayor que 0/);
  });

  // HALLAZGO [08/10-b] (bajo, contenido) — ✅ REPARADO el 08/10/2026 (3079). Patrón 5 en el valor catastral del SUELO: es
  // el 2959 de la referencia. Un suelo escrito «0», o «-3000» con el foco dentro (el blur lo acota a
  // 0 por su min={0}), se anuncia como si faltara: `faltanVacios` lo mete por `!(valorSuelo > 0)`
  // (page.tsx ~l. 664). La misma tarjeta ya distingue el precio de compra 0 (2193) y los años
  // negativos (1566). Las cifras son correctas (CASO 54). Misma forma en el valor catastral TOTAL:
  // «0» con el suelo escrito da «Método objetivo (falta el valor catastral total para comparar)»,
  // con el 0 a la vista (la referencia lo tiene igual y su 2959 no lo nombra).
  //   obtenido: «No calculada (falta el valor catastral del suelo)» y, en el neto, «Rellena el
  //   valor catastral del suelo para obtenerlo».
  test('[08/10-b] un valor catastral del suelo escrito como 0 se nombra como no válido, no como que falta', async ({ page }) => {
    await vendedor0810(page, { ...BASE_0810, suelo: '0' });
    const plusvalia = await descripcionTarjeta(page, 'Plusvalía municipal');
    const neto = await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR');
    // El defecto.
    expect({
      plusvalia: /falta el valor catastral del suelo/.test(plusvalia),
      neto: /Rellena el valor catastral del suelo/.test(neto),
    }).toEqual({ plusvalia: false, neto: false });
    expect(neto).toMatch(/valor catastral del suelo[^.]*mayor que 0/);
    await vendedor0810(page, { ...BASE_0810, total: '0' });
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).not.toContain('falta el valor catastral total');
  });

  // HALLAZGO [08/10-c] (bajo, contenido) — ✅ REPARADO el 08/10/2026 (3080). El 2958 de la referencia: en «COSTE TOTAL
  // (PARCIAL)» el inciso «que no se ha podido leer» no lleva coma de cierre antes de «ni»
  // (`faltan.join(' ni ')`, page.tsx ~l. 1015), y se lee como si tampoco se hubiera podido leer
  // la parte de libre acuerdo de la notaría. Al repararlo cambia el literal del CASO 49.
  //   Madrid · segunda mano · 7.000.000 € · gestoría «2.000.50» → obtenido «No incluye la
  //   gestoría, que no se ha podido leer ni la parte de la notaría que excede de 6.010.121,04 €,
  //   que es de libre acuerdo: el coste real será mayor». En Canarias, obra nueva, igual: «No
  //   incluye el IGIC ni la gestoría, que no se ha podido leer ni la parte…».
  test('[08/10-c] el inciso de la gestoría ilegible se cierra con coma antes de «ni»', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['input[aria-label="Precio del trastero"]']);
    await sembrar(page, 'Precio del trastero', '7000000');
    await sembrar(page, 'Gastos de gestoría del comprador (€)', '2.000.50');
    expect(await descripcionTarjeta(page, 'COSTE TOTAL (PARCIAL)')).toBe(
      'No incluye la gestoría, que no se ha podido leer, ni la parte de la notaría que excede de 6.010.121,04 €, que es de libre acuerdo: el coste real será mayor',
    );
  });

  // HALLAZGO [08/10-d] (bajo, contenido) — ✅ REPARADO el 08/10/2026 (3081, `nombreEnFrase`). El nombre oficial de `ITP_CCAA.nombre` se
  // interpola sin artículo en dos frases ESCRITAS EN ESTE page.tsx (la forma del 3065 de
  // local-comercial): la tarjeta del impuesto no calculado (~l. 1347, «En Ciudad Autónoma de Ceuta
  // no rige el IVA…», y Melilla) y el aviso de reducidos (~l. 1456, «En Comunidad de Madrid
  // existe:», «En Comunidad Valenciana…», «En Región de Murcia…», «En Islas Baleares…»). El
  // aviso común AvisoTerritorioSinIva tiene la misma forma, pero es código común y va en el 3065.
  test('[08/10-d] el nombre de la comunidad lleva su artículo en las frases de esta página', async ({ page }) => {
    const sinArticulo = /(?:^|[\s(])(?:[Ee]n|de) (?:Ciudad Autónoma|Comunidad|Región|Islas) /;
    await page.goto(RUTA);
    await esperarHidratacion(page, ['input[aria-label="Precio del trastero"]']);
    await page.locator('#select-ccaa').selectOption('ceuta');
    await page.getByRole('button', { name: /Primera mano/ }).click();
    await sembrar(page, 'Precio del trastero', '27500');
    const ipsi = await descripcionTarjeta(page, /^IPSI$/);
    await page.getByRole('button', { name: /Segunda mano/ }).click();
    await page.locator('#select-ccaa').selectOption('madrid');
    await page.locator('#select-perfil').selectOption('familia-numerosa');
    const aviso = await texto(avisoReducidos0810(page));
    // El defecto.
    expect({ ipsi: sinArticulo.test(ipsi), aviso: sinArticulo.test(aviso) }).toEqual({ ipsi: false, aviso: false });
    expect(ipsi).toContain('En la Ciudad Autónoma de Ceuta no rige el IVA');
    expect(aviso).toMatch(/En la Comunidad de Madrid existen?:/);
  });

  // HALLAZGO [08/10-e] (bajo, contenido) — ✅ REPARADO el 08/10/2026 (3082, también en la referencia y garaje). «En {nombre} existe:» (page.tsx ~l. 1456) va
  // en singular delante de una lista de DOS o TRES tipos: Castilla-La Mancha con perfil general
  // (las tres zonas de despoblación), Cantabria con familia numerosa (3), y con 2 Aragón, Asturias,
  // Cataluña, Castilla y León, Valencia y La Rioja. La referencia y garaje tienen la misma frase.
  //   Castilla-La Mancha · segunda mano · 27.500 € · general → obtenido «En Castilla-La Mancha
  //   existe:» y debajo 5,00 %, 4,00 % y 3,00 %.
  test('[08/10-e] el aviso de reducidos concuerda en plural cuando ofrece varios tipos', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['input[aria-label="Precio del trastero"]']);
    await page.locator('#select-ccaa').selectOption('castilla-mancha');
    await sembrar(page, 'Precio del trastero', '27500');
    const aviso = avisoReducidos0810(page);
    await expect(aviso.locator('li')).toHaveCount(3);
    // El defecto.
    expect(await texto(aviso)).toContain('En Castilla-La Mancha existen:');
  });

  // HALLAZGO [08/10-f] (bajo, accesibilidad) — ✅ REPARADO el 08/10/2026 (3083, también en la referencia y garaje). El aviso de que el precio supera el tope
  // de un reducido lleva el emoji dentro de una cadena (page.tsx ~l. 1469: ' · ⚠️ tu precio supera
  // ese límite: no podrías acogerte'), sin <span aria-hidden="true"> (CLAUDE.md global §5, regla
  // 3): el lector de pantalla lo anuncia en mitad de la línea. `check:a11y-jsx` no lo ve porque
  // es un literal de JS y no texto JSX. La misma cadena está en la referencia (~l. 2059) y en
  // garaje (~l. 1464).
  //   Galicia · segunda mano · 160.000 € · discapacidad → ITP 8 % = 12.800,00 y el 3 % ofrecido
  //   con «· ⚠️ tu precio supera ese límite» (tope 150.000 €), con el ⚠️ fuera de aria-hidden.
  test('[08/10-f] el ⚠️ del tope de valor de un reducido va con aria-hidden', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['input[aria-label="Precio del trastero"]']);
    await page.locator('#select-ccaa').selectOption('galicia');
    await page.locator('#select-perfil').selectOption('discapacidad');
    await sembrar(page, 'Precio del trastero', '160000');
    const linea = avisoReducidos0810(page).locator('li', { hasText: 'supera ese límite' });
    await expect(linea).toHaveCount(1);
    const emojisALaVista = await linea.evaluate((li) => {
      const recorrido = document.createTreeWalker(li, NodeFilter.SHOW_TEXT);
      const malos: string[] = [];
      for (let n = recorrido.nextNode(); n; n = recorrido.nextNode()) {
        if (/⚠/.test(n.textContent ?? '') && !n.parentElement?.closest('[aria-hidden="true"]')) {
          malos.push((n.textContent ?? '').trim());
        }
      }
      return malos;
    });
    // El defecto.
    expect(emojisALaVista).toEqual([]);
    expect(await valorTarjeta(page, /^ITP \(/)).toBe('12.800,00 €');
  });
});

/**
 * REPARACIÓN DEL 10/10/2026 — Ceuta, Melilla y territorio foral en la pestaña Vendedor.
 *
 * Por decisión del usuario sobre los hallazgos 3059/3060 y 3069-3071 (local y la referencia), que
 * alcanzaban a esta app por el motor común. BASE_0810 trasladada a cada comunidad.
 */
test.describe('Reparación 10/10/2026 — Ceuta, Melilla y la plusvalía foral', () => {
  test('Ceuta: plusvalía bonificada al 50 % e IRPF con la deducción del 60 %', async ({ page }) => {
    // A mano: objetivo 5.200 × 0,09 × 25 % = 117 → 58,50 (el real, 11.500 × 0,4 × 25 % = 1.150 →
    // 575, es mayor). Transmisión 27.500 − 1.100 − 220 − 58,50 = 26.121,50; adquisición 17.400;
    // ganancia 8.721,50; cuota 1.140 + 2.721,50 × 21 % = 1.711,515; × 40 % = 684,61.
    await vendedor0810(page, { ...BASE_0810, ccaa: 'ceuta' });
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('58,50 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toMatch(/bonificación del 50\s% de la cuota de Ceuta y Melilla/);
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('684,61 €');
    expect(await descripcionTarjeta(page, 'IRPF sobre ganancia')).toMatch(/deducción del 60\s% por rentas obtenidas en Ceuta o Melilla/);
    expect(await valorTarjeta(page, /^IMPORTE NETO VENDEDOR/)).toBe('25.436,89 €');
  });

  test('Navarra: la plusvalía es foral, no se calcula y el neto no pide rellenar el suelo', async ({ page }) => {
    await vendedor0810(page, { ...BASE_0810, ccaa: 'navarra' });
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('SIN CALCULAR');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toContain('Ley Foral 2/1995 de Haciendas Locales de Navarra');
    const neto = await descripcionTarjeta(page, /^IMPORTE NETO VENDEDOR/);
    expect(neto).toContain('No descuenta la plusvalía municipal');
    expect(neto).not.toMatch(/[Rr]ellena/);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  INSPECTOR 13/10/2026 — re-inspección (la app estaba INVALIDADA por la reparación del 10/10,
//  la rebaja de los aranceles del 11/10 y el reparto del IBI del 11/10).
//
//  Tres casos resueltos a mano ANTES de abrir el navegador, en lo que la reparación del 10/10
//  estrenó y ningún caso había combinado: Cantabria con perfil joven, Melilla con el tramo MÁS
//  ALTO del coeficiente del IIVTNU (≥ 20 años), el método REAL, la bonificación del 50 % de la
//  cuota y la deducción del 60 % del IRPF, y una comisión imposible en Ceuta. Después, cuatro
//  hallazgos que nacieron con `test.fail()` y la aserción de FONDO primero, REPARADOS el
//  20/10/2026 (hallazgos 3252-3255): se les quitó la marca y quedan como regresión.
//
//  De dónde sale cada cifra (ninguna de memoria):
//   · ITP de Cantabria 9 %, sin escala → `TIPOS_ITP_CCAA_2025` (data/fiscal/inmuebles.ts), leído
//     por `ITP_CCAA.cantabria`; su reducido «Jóvenes < 36 años» (4 %, vivienda habitual, ≤ 300.000 €)
//     y «Municipios despoblados» (4 %) → `ITP_CCAA.cantabria.tiposReducidos` (data/itp-ccaa.ts).
//   · Notaría → `ARANCELES_NOTARIO` + `REBAJA_ARANCEL_CUANTIA` (5 %, DA 8.ª RDL 8/2010) + IVA 21 %
//     + `FACTURA_NOTARIAL` (×1,5 a ×2, se publica ×1,75). Registro → `ARANCELES_REGISTRO` con la
//     misma rebaja + `REGISTRO_CONCEPTOS` (6,010121 + 3,005061) + IVA 21 %. RD 1426/1989 y 1427/1989.
//   · Coeficientes del IIVTNU → `COEFICIENTES_IIVTNU_2025` (art. 107.4 TRLRHL, RDL 8/2023):
//     3 años 0,14 · 8 años 0,19 · ≥ 20 años 0,40; tipo `PLUSVALIA_MUNICIPAL_META.tipoOrientativo`
//     = 25 %; en Ceuta y Melilla la cuota × 50 % (`BONIFICACION_IIVTNU_CEUTA_MELILLA`, art. 159.2).
//   · IRPF → `TRAMOS_GANANCIAS_PATRIMONIALES_2025` (19 % hasta 6.000, 21 % hasta 50.000) y en Ceuta
//     y Melilla × (1 − 60 %) (`DEDUCCION_IRPF_RENTAS_CEUTA_MELILLA`, art. 68.4 LIRPF).
// ═══════════════════════════════════════════════════════════════════════════════

/** Melilla, ≥ 20 años, método real: la base del CASO 56 y de los hallazgos [13/10-a/b/c]. */
const BASE_1310_MELILLA = {
  ccaa: 'melilla',
  venta: '40000',
  compra: '29000',
  gastos: '1500',
  anios: '22',
  suelo: '9000',
  total: '30000',
  comision: '3',
  gestoria: '387,50',
};

test.describe('Inspector 13/10/2026 — Cantabria con perfil joven, Melilla a 20 años con método real y una comisión imposible en Ceuta', () => {
  /**
   * CASO 55 (normal) — Cantabria · segunda mano · perfil joven · 18.500 € · gestoría 250.
   *   ITP = 18.500 × 9 % = 1.665,00 → «ITP (9,00 %)», «ITP Cantabria».
   *   El reducido de jóvenes (4 %) exige vivienda habitual: no se aplica y se OFRECE con su
   *   requisito; «Municipios despoblados» (4 %) no es de colectivo y no exige vivienda habitual:
   *   se ofrece también. «Vivienda habitual < 200.000 €» se descarta (un trastero suelto no lo es).
   *   Notaría: 90,151816 + 12.489,88 × 0,45 % = 146,356276 × 0,95 = 139,0384622 × 1,21 =
   *     168,2365393 → ×1,5 = 252,35 · ×2 = 336,47 · ×1,75 = 294,41.
   *   Registro: 24,040484 + 12.489,88 × 0,175 % = 45,897774 × 0,95 = 43,6028853 + 9,015182 =
   *     52,6180673 × 1,21 = 63,67.
   *   Total = 1.665,00 + 294,41 + 63,67 + 250,00 = 2.273,08 (12,29 %) · coste 20.773,08.
   * VENDEDOR — compra 11.000 · gastos 900 · 8 años · suelo 3.600 de 8.000 · comisión 4 % · gestoría 150:
   *   plusvalía: objetivo 3.600 × 0,19 × 25 % = 171,00 · real 7.500 × 0,45 × 25 % = 843,75 → 171,00
   *   comisión 740,00 · transmisión 18.500 − 740 − 150 − 171 = 17.439,00 · adquisición 11.900,00
   *   ganancia 5.539,00 · IRPF 5.539 × 19 % = 1.052,41 · total 171 + 740 + 150 + 1.052,41 = 2.113,41
   *   neto 16.386,59, DEFINITIVO.
   */
  test('CASO 55 — Cantabria, 18.500 € con perfil joven: el 9 %, dos reducidos ofrecidos y un vendedor completo', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['input[aria-label="Precio del trastero"]']);
    await page.locator('#select-ccaa').selectOption('cantabria');
    await page.locator('#select-perfil').selectOption('joven');
    await sembrar(page, 'Precio del trastero', '18500');
    await sembrar(page, 'Gastos de gestoría del comprador (€)', '250');

    expect(await tituloTarjeta24(page, /^ITP \(/)).toBe('ITP (9,00 %)');
    expect(await valorTarjeta(page, /^ITP \(/)).toBe('1665,00 €');
    expect(await descripcionTarjeta(page, /^ITP \(/)).toBe('ITP Cantabria');
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('294,41 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain('Factura estimada entre 252,35 € y 336,47 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('63,67 €');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('250,00 €');
    expect(await tituloTarjeta24(page, /^Total gastos adicionales/)).toBe('Total gastos adicionales');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('2273,08 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toBe('12,29 % sobre el precio');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('20.773,08 €');
    expect(await descripcionTarjeta(page, 'COSTE TOTAL')).toBe('Precio del trastero + todos los gastos');

    const aviso = avisoReducidos0810(page);
    await expect(aviso).toHaveCount(1);
    expect(await texto(aviso)).toContain('En Cantabria existen:');
    const lineas = (await aviso.locator('li').allInnerTexts()).map((s) => s.replace(ESPACIO_DURO, ' '));
    expect(lineas).toHaveLength(2);
    expect(lineas[0]).toContain('4,00 % — Jóvenes < 36 años');
    expect(lineas[0]).toContain('Menor de 36 años · Vivienda habitual · Valor ≤ 300.000 €');
    expect(lineas[0]).not.toContain('supera ese límite');
    expect(lineas[1]).toContain('4,00 % — Municipios despoblados');

    await vendedor0810(page, {
      ccaa: 'cantabria',
      venta: '18500',
      compra: '11000',
      gastos: '900',
      anios: '8',
      suelo: '3600',
      total: '8000',
      comision: '4',
      gestoria: '150',
    });
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('171,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe('Método objetivo (más favorable)');
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('11.900,00 €');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('17.439,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('5539,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('1052,41 €');
    expect(await descripcionTarjeta(page, 'IRPF sobre ganancia')).toBe('Tributación en base del ahorro (del 19 % al 30 %). Calculado como si esta venta fuera tu única renta del ahorro del año: si tienes intereses, dividendos u otras ganancias, escríbelos arriba, porque la cuota puede ser mayor.');
    expect(await tituloTarjeta24(page, /^Comisión inmobiliaria/)).toBe('Comisión inmobiliaria (4 %)');
    expect(await valorTarjeta(page, /Comisión inmobiliaria/)).toBe('740,00 €');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('150,00 €');
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('2113,41 €');
    expect(await tituloTarjeta24(page, /^IMPORTE NETO VENDEDOR/)).toBe('IMPORTE NETO VENDEDOR');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('16.386,59 €');
    expect(await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('Lo que realmente recibes tras los gastos');
  });

  /**
   * CASO 56 (límite) — Melilla · venta 40.000 · compra 29.000 · gastos 1.500 · 22 años (el
   * coeficiente se topa en el de «20 o más años», 0,40, el más alto de la tabla) · suelo 9.000 de
   * 30.000 · comisión 3 % · gestoría 387,50.
   *   plusvalía: objetivo 9.000 × 0,40 × 25 % × 50 % = 450,00 · real 11.000 × 0,3 × 25 % × 50 % =
   *     412,50 → gana el REAL, 412,50, bonificado.
   *   comisión 1.200,00 · transmisión 40.000 − 1.200 − 387,50 − 412,50 = 38.000,00 · adquisición
   *     30.500,00 · ganancia 7.500,00 (cruza el tramo de 6.000)
   *   cuota íntegra 6.000 × 19 % + 1.500 × 21 % = 1.455,00 · deducción 60 % = 873,00 · IRPF 582,00
   *   total 412,50 + 1.200 + 387,50 + 582 = 2.582,00 · neto 37.418,00, DEFINITIVO.
   * (Sin la bonificación serían 825,00 de plusvalía y sin la deducción 1.455,00 de IRPF.)
   */
  test('CASO 56 — Melilla, 22 años: método real bonificado al 50 % y el IRPF con la deducción del 60 %', async ({ page }) => {
    await vendedor0810(page, BASE_1310_MELILLA);
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('412,50 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe(
      'Método real (más favorable), con la bonificación del 50 % de la cuota de Ceuta y Melilla (art. 159.2 TRLRHL)',
    );
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('30.500,00 €');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('38.000,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('7500,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('582,00 €');
    expect(await descripcionTarjeta(page, 'IRPF sobre ganancia')).toBe(
      'Tributación en base del ahorro (del 19 % al 30 %), con la deducción del 60 % por rentas obtenidas en Ceuta o Melilla (art. 68.4 LIRPF): 873,00 € menos. Calculado como si esta venta fuera tu única renta del ahorro del año: si tienes intereses, dividendos u otras ganancias, escríbelos arriba, porque la cuota puede ser mayor.',
    );
    expect(await valorTarjeta(page, /Comisión inmobiliaria/)).toBe('1200,00 €');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('387,50 €');
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('2582,00 €');
    expect(await tituloTarjeta24(page, /^IMPORTE NETO VENDEDOR/)).toBe('IMPORTE NETO VENDEDOR');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('37.418,00 €');
    expect(await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('Lo que realmente recibes tras los gastos');

    // Con el total catastral «30.000.00» (ilegible): objetivo 450,00 · transmisión 37.962,50 ·
    // ganancia 7.462,50 · IRPF (1.140 + 1.462,50 × 21 %) × 40 % = 578,85 · total 2.616,35 ·
    // neto 37.383,65 (PARCIAL). Las cifras que SÍ cumplen el invariante de la familia: el neto, la
    // ganancia y el IRPF nombran el ilegible y dicen que el real puede ser MAYOR.
    await sembrar(page, 'Valor catastral total (suelo + construcción)', '30.000.00');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('450,00 €');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('37.962,50 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('7462,50 €');
    expect(await descripcionTarjeta(page, 'Ganancia patrimonial')).toContain('la ganancia real puede ser mayor');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('578,85 €');
    expect(await descripcionTarjeta(page, 'IRPF sobre ganancia')).toContain('la cuota real puede ser mayor');
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('2616,35 €');
    expect(await tituloTarjeta24(page, /^IMPORTE NETO VENDEDOR/)).toBe('IMPORTE NETO VENDEDOR (PARCIAL)');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('37.383,65 €');
    expect(await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR')).toContain(
      'El valor catastral total (con él la plusvalía puede salir más barata por el método real) no se ha podido leer: el neto real puede ser MAYOR que este',
    );
  });

  /**
   * CASO 57 (debe rechazarse) — Ceuta · venta 12.000 · compra 9.000 · gastos 600 · 3 años · suelo
   * 2.500 de 7.000 · comisión «150» (más del 100 % del precio) · sin gestoría de venta.
   *   La comisión no se aplica ni se liquida nada con ella (patrón 5): sin ganancia ni IRPF.
   *   plusvalía (no depende de la comisión): objetivo 2.500 × 0,14 × 25 % × 50 % = 43,75 · real
   *     3.000 × (2.500 / 7.000) × 25 % × 50 % = 133,93 → 43,75, bonificada.
   *   total 43,75 (PARCIAL: sin la comisión ni el IRPF) · neto 12.000 − 43,75 = 11.956,25 (PARCIAL).
   *   Sin «Valor de adquisición», «Valor de transmisión» ni «Ganancia patrimonial».
   */
  test('CASO 57 — Ceuta, comisión del 150 %: no se aplica, no se liquida el IRPF y se pide corregirla', async ({ page }) => {
    await vendedor0810(page, {
      ccaa: 'ceuta',
      venta: '12000',
      compra: '9000',
      gastos: '600',
      anios: '3',
      suelo: '2500',
      total: '7000',
      comision: '150',
      gestoria: '',
    });
    const comision = page.locator('input[aria-label="Comisión inmobiliaria (%)"]');
    await expect(comision).toHaveValue('150');
    await expect(comision).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('p[role="alert"]', { hasText: 'La comisión no puede superar el 100' })).toHaveCount(1);

    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('43,75 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe(
      'Método objetivo (más favorable), con la bonificación del 50 % de la cuota de Ceuta y Melilla (art. 159.2 TRLRHL)',
    );
    await expect(page.locator('h3', { hasText: 'Valor de adquisición' })).toHaveCount(0);
    await expect(page.locator('h3', { hasText: 'Valor de transmisión' })).toHaveCount(0);
    await expect(page.locator('h3', { hasText: 'Ganancia patrimonial' })).toHaveCount(0);
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('Sin calcular');
    expect(await descripcionTarjeta(page, 'IRPF sobre ganancia')).toBe(
      'Corrige la comisión: no puede superar el 100 % del precio de venta. Este impuesto NO está incluido en el neto de abajo.',
    );
    expect(await valorTarjeta(page, /Comisión inmobiliaria/)).toBe('Sin aplicar');
    expect(await tituloTarjeta24(page, /^Total gastos vendedor/)).toBe('Total gastos vendedor (parcial)');
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('43,75 €');
    expect(await tituloTarjeta24(page, /^IMPORTE NETO VENDEDOR/)).toBe('IMPORTE NETO VENDEDOR (PARCIAL)');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('11.956,25 €');
    expect(await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe(
      'No descuenta la comisión inmobiliaria ni el IRPF de la ganancia: el neto real puede ser menor que este. Corrige la comisión (no puede superar el 100 % del precio de venta) para obtenerlo.',
    );
  });

  // ─── HALLAZGOS del 13/10/2026, REPARADOS el 20/10/2026 ───────────────────────────────
  // Nacieron con `test.fail()` y la aserción de FONDO primero; al repararlos (f6de548d) se les
  // quitó la marca y hoy sujetan la reparación. Las cifras de sus escenarios las sujeta en verde
  // el CASO 56.

  // HALLAZGO [13/10-a] (bajo, operativa) — EFECTO FAMILIA del 2911 de local-comercial, que ya
  // nombraba esta app. Con el valor catastral total ilegible y el método REAL más barato, la
  // plusvalía se liquida por el objetivo y «Valor de transmisión» se publica por DEBAJO del real
  // con su descripción fija «Precio de venta − comisión, gestoría y plusvalía municipal», sin
  // nombrar el ilegible ni la dirección (page.tsx ~l. 1696-1705 solo distingue comisión y
  // gestoría). La plusvalía, la ganancia, el IRPF y el neto sí lo nombran.
  //   Melilla (CASO 56) con el total «30.000.00» → obtenido 37.962,50 € y la descripción fija;
  //   con el total legible 30.000 es 38.000,00 € (real ≥ publicado: puede ser MAYOR).
  // REPARADO el 20/10/2026 (hallazgo 3252).
  test('[13/10-a] «Valor de transmisión» nombra el valor catastral total ilegible', async ({ page }) => {
    await vendedor0810(page, { ...BASE_1310_MELILLA, total: '30.000.00' });
    expect(await descripcionTarjeta(page, 'Valor de transmisión')).toMatch(/valor catastral total/i);
    expect(await descripcionTarjeta(page, 'Valor de transmisión')).toMatch(/puede ser MAYOR/);
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('37.962,50 €');
  });

  // HALLAZGO [13/10-b] (bajo, contenido) — la deducción del 60 % del art. 68.4 LIRPF solo se dice
  // en la rama por defecto de la tarjeta del IRPF (page.tsx ~l. 1800-1804). En cuanto hay otro
  // aviso —un importe ilegible o la plusvalía pendiente— `avisoTarjeta` sustituye la descripción
  // y la deducción desaparece, aunque la cifra la sigue llevando restada. La referencia
  // (estimador, reparación del 3070) la añade SIEMPRE junto a la cuota (page.tsx ~l. 2620-2623).
  //   Melilla (CASO 56) con los años VACÍOS → «IRPF sobre ganancia (máximo) 616,65 €» =
  //   (1.140 + 1.912,50 × 21 %) × 40 %, descrito solo «No resta la plusvalía municipal, que falta,
  //   así que la cuota real puede ser menor.» (con el total «30.000.00», 578,85 € e igual).
  // REPARADO el 20/10/2026 (hallazgo 3253).
  test('[13/10-b] la tarjeta del IRPF dice la deducción de Ceuta y Melilla también cuando hay otro aviso', async ({ page }) => {
    await vendedor0810(page, { ...BASE_1310_MELILLA, anios: '' });
    expect(await descripcionTarjeta(page, 'IRPF sobre ganancia')).toMatch(
      /deducción del 60\s?% por rentas obtenidas en Ceuta o Melilla/,
    );
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('616,65 €');
  });

  // HALLAZGO [13/10-c] (bajo, contenido) — la coletilla de la bonificación (page.tsx ~l. 726-728)
  // se pega detrás de cualquier descripción de la plusvalía, y la del total catastral ilegible ya
  // termina en frase completa con punto: sale «…Escríbelo con coma decimal (1.234,56)., con la
  // bonificación del 50 % de la cuota de Ceuta y Melilla (art. 159.2 TRLRHL)». La referencia
  // (~l. 1002-1007), garaje (~l. 700) y local-comercial (~l. 796) componen igual.
  // REPARADO el 20/10/2026 (hallazgo 3254), con la receta del 3259 de local-comercial.
  test('[13/10-c] la bonificación de Ceuta y Melilla no se pega tras un punto final', async ({ page }) => {
    await vendedor0810(page, { ...BASE_1310_MELILLA, total: '30.000.00' });
    const desc = await descripcionTarjeta(page, 'Plusvalía municipal');
    expect(desc).not.toContain('.,');
    expect(desc).toContain('bonificación del 50 % de la cuota de Ceuta y Melilla');
  });

  // HALLAZGO [13/10-d] (bajo, dato) — el selector rotula «Joven (< 35 años)», una edad escrita a
  // mano que contradice a `ITP_CCAA` en ocho comunidades (Cantabria, Galicia y Castilla y León:
  // menores de 36; Asturias y Cataluña: 35 o menos; Murcia: hasta 40; La Rioja: menores de 40;
  // Baleares: menores de 30), y la app lo enseña en la misma pantalla. data/itp-ccaa.ts ya deriva la horquilla
  // (`horquillaEdadJoven`, hallazgos 719 y 720). La referencia y garaje llevan la misma etiqueta.
  //   Cantabria · segunda mano · perfil «Joven (< 35 años)» · 18.500 € → el aviso ofrece
  //   «4,00 % — Jóvenes < 36 años · Requisitos: Menor de 36 años…»: quien tiene 35 años lee
  //   que no es «joven» y elige General, con lo que la oportunidad no se le enseña.
  // REPARADO el 20/10/2026 (hallazgo 3255), también en garaje y el estimador.
  test('[13/10-d] la etiqueta del perfil joven no contradice la edad del reducido que ofrece', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['input[aria-label="Precio del trastero"]']);
    await page.locator('#select-ccaa').selectOption('cantabria');
    const etiqueta = (await page.locator('#select-perfil option[value="joven"]').innerText()).replace(ESPACIO_DURO, ' ');
    // El defecto.
    expect(etiqueta).not.toMatch(/<\s*35\s*años/);
    await page.locator('#select-perfil').selectOption('joven');
    await sembrar(page, 'Precio del trastero', '18500');
    expect(await texto(avisoReducidos0810(page))).toContain('Menor de 36 años');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  INSPECTOR 19/10/2026 — re-inspección (la app estaba INVALIDADA por 5f1b199a, hallazgo 3368,
//  y por ca9ab312, que retiró COSTES_COMPRAVENTA_2025 sin lectores aquí).
//
//  Lo que 5f1b199a estrenó: el campo «Otras rentas del ahorro de este año (€)» y la cuota de la
//  venta como lo que AÑADE a la base del ahorro, cuota(otras + ganancia) − cuota(otras). El
//  testigo de familia (tests/familias/compraventa.spec.ts) lo mide en Madrid con 6.000 € de otras
//  rentas y una ganancia que se queda en el tramo del 21 %; aquí, lo que no cubre: una venta que
//  CRUZA un tramo por las otras rentas, el tramo más alto de la escala, y la deducción de Ceuta y
//  Melilla, que va sobre la parte PROPORCIONAL de la cuota total y no sobre lo que la venta añade.
//
//  De dónde sale cada cifra (ninguna de memoria):
//   · Escala del ahorro → `TRAMOS_GANANCIAS_PATRIMONIALES_2025` (data/fiscal/inmuebles.ts, art. 66
//     LIRPF): 19 % hasta 6.000 · 21 % hasta 50.000 · 23 % hasta 200.000 · 27 % hasta 300.000 · 30 %.
//   · Cuota de la venta → `calcularGananciaInmueble` (data/fiscal/ganancia-inmueble.ts):
//     cuota(otras + ganancia) − cuota(otras); en Ceuta y Melilla menos el 60 %
//     (`DEDUCCION_IRPF_RENTAS_CEUTA_MELILLA`, art. 68.4 LIRPF: «la parte […] que proporcionalmente
//     corresponda») de cuota(otras + ganancia) × ganancia / (otras + ganancia).
//   · Plusvalía → `COEFICIENTES_IIVTNU_2025` (10 años 0,12 · 2 años 0,14 · ≥ 20 años 0,40) ×
//     `PLUSVALIA_MUNICIPAL_META.tipoOrientativo` (25 %), en Ceuta y Melilla × 50 %
//     (`BONIFICACION_IIVTNU_CEUTA_MELILLA`, art. 159.2 TRLRHL).
// ═══════════════════════════════════════════════════════════════════════════════

const OTRAS_RENTAS_1910 = 'Otras rentas del ahorro de este año (€)';

/** Melilla, ≥ 20 años, método objetivo: la base de los CASOS 59 y 60. */
const BASE_1910_MELILLA = {
  ccaa: 'melilla',
  venta: '40000',
  compra: '25000',
  gastos: '1000',
  anios: '22',
  suelo: '6000',
  total: '20000',
  comision: '0',
  gestoria: '',
};

test.describe('Inspector 19/10/2026 — las otras rentas del ahorro: un tramo cruzado, el 30 % en Melilla y un importe ilegible', () => {
  /**
   * CASO 58 (normal) — Castilla-La Mancha · venta 60.000 · compra 40.000 · gastos 3.000 · 10 años
   * · suelo 15.000 de 40.000 · comisión 3 % · gestoría 400, primero SIN otras rentas y después con
   * 45.000 €, que hacen cruzar a la venta el tramo de 50.000 €.
   *   plusvalía: objetivo 15.000 × 0,12 × 25 % = 450,00 · real 20.000 × 0,375 × 25 % = 1.875 → 450,00
   *   comisión 1.800,00 · transmisión 60.000 − 1.800 − 400 − 450 = 57.350,00 · adquisición 43.000,00
   *   ganancia 14.350,00
   *   SIN otras: 6.000 × 19 % + 8.350 × 21 % = 1.140 + 1.753,50 = 2.893,50 · total 5.543,50 · neto 54.456,50
   *   CON 45.000: cuota(59.350) − cuota(45.000) = 12.530,50 − 9.330,00 = 3.200,50
   *     (= 5.000 × 21 % + 9.350 × 23 % = 1.050 + 2.150,50) · total 5.850,50 · neto 54.149,50
   *   Si la venta se cobrara sola (el defecto del 3368) seguiría en 2.893,50: 307,00 € de menos.
   */
  test('CASO 58 — Castilla-La Mancha: 45.000 € de otras rentas suben la venta al tramo del 23 %', async ({ page }) => {
    await vendedor0810(page, {
      ccaa: 'castilla-mancha',
      venta: '60000',
      compra: '40000',
      gastos: '3000',
      anios: '10',
      suelo: '15000',
      total: '40000',
      comision: '3',
      gestoria: '400',
    });
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('450,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe('Método objetivo (más favorable)');
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('43.000,00 €');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('57.350,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('14.350,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('2893,50 €');
    expect(await descripcionTarjeta(page, 'IRPF sobre ganancia')).toContain('Calculado como si esta venta fuera tu única renta del ahorro del año');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('54.456,50 €');

    await sembrar(page, OTRAS_RENTAS_1910, '45000');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('14.350,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('3200,50 €');
    expect(await descripcionTarjeta(page, 'IRPF sobre ganancia')).toBe(
      'Tributación en base del ahorro (del 19 % al 30 %). Es lo que esta venta añade a tu cuota, sumada a 45.000,00 € de otras rentas del ahorro del año.',
    );
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('5850,50 €');
    expect(await tituloTarjeta24(page, /^IMPORTE NETO VENDEDOR/)).toBe('IMPORTE NETO VENDEDOR');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('54.149,50 €');
    expect(await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('Lo que realmente recibes tras los gastos');
  });

  /**
   * CASO 59 (límite) — Melilla · el tramo MÁS ALTO de la escala: 295.000 € de otras rentas y una
   * ganancia de 13.700 € que cruza los 300.000 €. Venta 40.000 · compra 25.000 · gastos 1.000 ·
   * 22 años · suelo 6.000 de 20.000 · comisión 0 · sin gestoría.
   *   plusvalía: objetivo 6.000 × 0,40 × 25 % × 50 % = 300,00 · real 15.000 × 0,3 × 25 % × 50 % =
   *     562,50 → 300,00, bonificada
   *   transmisión 40.000 − 300 = 39.700,00 · adquisición 26.000,00 · ganancia 13.700,00
   *   cuota(308.700) = 1.140 + 9.240 + 34.500 + 27.000 + 8.700 × 30 % = 74.490,00
   *   cuota(295.000) = 1.140 + 9.240 + 34.500 + 95.000 × 27 % = 70.530,00 → añade 3.960,00
   *   deducción = 74.490 × 13.700 / 308.700 × 60 % = 1.983,504… → «1983,50 € menos»
   *   IRPF = 3.960,00 − 1.983,50 = 1.976,50 · total 2.276,50 · neto 37.723,50, DEFINITIVO.
   *   Las dos lecturas equivocadas dan otra cifra: deducir el 60 % de lo que la venta añade,
   *   1.584,00; deducirlo de la cuota de la venta sola (2.757,00), 2.305,80.
   */
  test('CASO 59 — Melilla, tramo del 30 %: la deducción del 60 % sobre la parte proporcional de la cuota', async ({ page }) => {
    await vendedor0810(page, BASE_1910_MELILLA);
    await sembrar(page, OTRAS_RENTAS_1910, '295000');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('300,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe(
      'Método objetivo (más favorable), con la bonificación del 50 % de la cuota de Ceuta y Melilla (art. 159.2 TRLRHL)',
    );
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('39.700,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('13.700,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('1976,50 €');
    expect(await descripcionTarjeta(page, 'IRPF sobre ganancia')).toBe(
      'Tributación en base del ahorro (del 19 % al 30 %), con la deducción del 60 % por rentas obtenidas en Ceuta o Melilla (art. 68.4 LIRPF): 1983,50 € menos. Es lo que esta venta añade a tu cuota, sumada a 295.000,00 € de otras rentas del ahorro del año.',
    );
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('2276,50 €');
    expect(await tituloTarjeta24(page, /^IMPORTE NETO VENDEDOR/)).toBe('IMPORTE NETO VENDEDOR');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('37.723,50 €');
  });

  /**
   * CASO 60 (debe rechazarse) — la base del CASO 59 con las otras rentas escritas «295.000.50»
   * (el millar y el decimal a la estadounidense): no se leen, y no pueden ser un cero callado.
   *   leídas como 0: cuota de la venta sola 6.000 × 19 % + 7.700 × 21 % = 2.757,00 × 40 % = 1.102,80
   *   total 300 + 1.102,80 = 1.402,80 · neto 38.597,20 (PARCIAL)
   *   Cualquier valor que quisiera escribir SUBE la cuota (con 1 €, 1.102,81), así que la cuota real
   *   ES mayor y el neto real ES menor: lo dice el sondeo y lo nombra con el campo.
   *   (Que la tarjeta perdía la frase de la deducción con este aviso era el hallazgo 3253, REPARADO
   *   el 20/10/2026: hoy la lleva detrás del aviso.)
   */
  test('CASO 60 — Melilla, otras rentas «295.000.50»: no se leen como cero y se dice hacia dónde queda la cuota', async ({ page }) => {
    await vendedor0810(page, BASE_1910_MELILLA);
    await sembrar(page, OTRAS_RENTAS_1910, '295.000.50');
    await expect(page.locator(`input[aria-label="${OTRAS_RENTAS_1910}"]`)).toHaveValue('295.000.50');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('13.700,00 €');
    expect(await descripcionTarjeta(page, 'Ganancia patrimonial')).toBe('Base para IRPF (base del ahorro)');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('1102,80 €');
    // Desde el hallazgo 3253 (20/10/2026) la deducción de Melilla va también detrás del aviso;
    // la frase de «única renta» no, porque el ilegible son las propias otras rentas (3386).
    const descIrpf = await descripcionTarjeta(page, 'IRPF sobre ganancia');
    expect(descIrpf.startsWith(
      'El importe de otras rentas del ahorro no se ha podido leer, así que la cuota real es mayor. Escríbelo con coma decimal (1.234,56). Lleva la deducción del 60',
    )).toBe(true);
    expect(descIrpf).toMatch(/por rentas obtenidas en Ceuta o Melilla \(art\. 68\.4 LIRPF\): 1654,20\s€ menos\.$/);
    expect(await tituloTarjeta24(page, /^Total gastos vendedor/)).toBe('Total gastos vendedor (parcial)');
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('1402,80 €');
    expect(await tituloTarjeta24(page, /^IMPORTE NETO VENDEDOR/)).toBe('IMPORTE NETO VENDEDOR (PARCIAL)');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('38.597,20 €');
    expect(await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe(
      'El importe de otras rentas del ahorro no se ha podido leer: el neto real es menor que este. Escribe con coma decimal (1.234,56) lo que no se ha podido leer para obtenerlo.',
    );
  });

  // ─── HALLAZGOS del 19/10/2026, REPARADOS el 20/10/2026 ───────────────────────────────
  // Nacieron con `test.fail()` y la aserción de FONDO primero; al repararlos (616e5fc8 y
  // f6de548d) se les quitó la marca y hoy sujetan la reparación.

  // HALLAZGO [19/10-a] (medio, calculo) — la forma del 3379 (garaje) y el 3377 (estimador), cabo
  // C0284. Con «Primera mano» la pestaña Vendedor liquida la venta como la ganancia patrimonial de
  // un particular en la base del ahorro, pero en una primera entrega vende el promotor, que es
  // empresario (LIVA art. 5.Uno.d y 20.Uno.22.º A) y cuya renta es de actividad económica (LIRPF
  // art. 27.1) o del IS, no ganancia patrimonial (art. 33.1). `calcularVendedor` no recibe el tipo
  // de transmisión. Valencia · Primera mano · vinculado · 25.000 · compra 18.000 · 2 años · suelo
  // 3.000 de 9.000 · comisión 0: plusvalía 3.000 × 0,14 × 25 % = 105,00 · ganancia 25.000 − 105 −
  // 18.000 = 6.895,00 · IRPF 1.140 + 895 × 21 % = 1.327,95 · neto 23.567,05, y nada en el panel
  // nombra al promotor.
  // ✅ REPARADO el 20/10/2026 (hallazgo 3380): el usuario decidió avisar y NO publicar cuota. En
  // primera mano la tarjeta del IRPF y las de la ganancia dejan paso a «Impuesto sobre la renta de
  // la venta · Sin calcular» con el aviso común (AVISO_VENTA_PROMOTOR), y el neto sale sin IRPF y
  // «(PARCIAL)»: 25.000 − 105 de plusvalía = 24.895,00.
  test('[19/10-a] con «Primera mano», el vendedor no se liquida como un particular en la base del ahorro', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['input[aria-label="Precio del trastero"]']);
    await page.locator('#select-ccaa').selectOption('valencia');
    await page.getByRole('button', { name: /Primera mano/ }).click();
    await page.getByRole('button', { name: /Vinculado a vivienda/ }).click();
    await sembrar(page, 'Precio del trastero', '25000');
    await page.getByRole('button', { name: 'Vendedor', exact: true }).click();
    await sembrar(page, 'Precio de compra original', '18000');
    await sembrar(page, 'Años de propiedad', '2');
    await sembrar(page, 'Valor catastral del suelo', '3000');
    await sembrar(page, 'Valor catastral total (suelo + construcción)', '9000');
    await sembrar(page, 'Comisión inmobiliaria (%)', '0');
    const panel = await texto(page.locator('[class*="resultsPanel"]'));
    expect(panel).toMatch(/vende el promotor/);
    expect(panel).toMatch(/actividad económica/);
    expect(panel).not.toMatch(/IRPF sobre ganancia|Ganancia patrimonial|base del ahorro \(del/);
    expect(await valorTarjeta(page, 'Impuesto sobre la renta de la venta')).toBe('Sin calcular');
    expect(panel).toContain('IMPORTE NETO VENDEDOR (PARCIAL)');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('24.895,00 €');
  });

  // HALLAZGO [19/10-b] (bajo, contenido) — el ejemplo «Vender un trastero» del bloque educativo
  // (page.tsx ~l. 2095-2101) sigue diciendo «Como máximo: ganancia de 6550,00 € → 1255,50 € de
  // IRPF, antes de restar la plusvalía», sin el supuesto de que la venta sea la única renta del
  // ahorro del año. Desde 5f1b199a la calculadora cobra lo que la venta AÑADE: con esos mismos datos
  // y 6.000 € de otras rentas publica 6.550 × 21 % = 1.375,50 € (máximo), por encima del «como
  // máximo» del ejemplo.
  // REPARADO el 20/10/2026 (hallazgo 3381).
  test('[19/10-b] el ejemplo de la venta dice sobre qué base del ahorro está su «como máximo» de IRPF', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['input[aria-label="Precio del trastero"]']);
    const ejemplo = await page.evaluate(() => {
      const tag = [...document.querySelectorAll('[class*="casoTag"]')].find((e) => e.textContent?.includes('Vender un trastero'));
      return (tag?.closest('[class*="casoCard"]')?.textContent ?? '').replace(/ /g, ' ');
    });
    // El defecto.
    expect(ejemplo).toMatch(/única renta del ahorro|otras rentas del ahorro/);
    expect(ejemplo).toContain('Como máximo: ganancia de 6550,00 € → 1255,50 € de IRPF');
    await sembrar(page, 'Precio del trastero', '15000');
    await page.getByRole('button', { name: 'Vendedor', exact: true }).click();
    await sembrar(page, 'Precio de compra original', '8000');
    await sembrar(page, OTRAS_RENTAS_1910, '6000');
    expect(await tituloTarjeta24(page, /^IRPF sobre ganancia/)).toBe('IRPF sobre ganancia (máximo)');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('1375,50 €');
  });

  // HALLAZGO [19/10-c] (bajo, dato) — EFECTO FAMILIA del 3250 (garaje; abierto aquel día y
  // REPARADO el 20/10/2026 con este), que ya nombraba
  // esta app. El sello ITP/AJD/IVA (NOTA_DATOS, page.tsx l. 447) atribuye al art. 57 bis.1
  // TRLITPAJD la bonificación del ITP y la del AJD; en el BOE (BOE-A-1993-25359, leído hoy) el
  // apartado 1 es la cuota gradual de AJD y la transmisión de inmuebles es el apartado 3.a). La
  // fila «AJD en primera mano» de la tabla educativa cita bien el 57 bis.1 (es AJD).
  // REPARADO el 20/10/2026 (hallazgo 3382): «art. 57 bis.3.a y 57 bis.1», ITP y AJD, leído en el BOE.
  test('[19/10-c] el sello no atribuye al art. 57 bis.1 la bonificación del ITP', async ({ page }) => {
    await page.goto(RUTA);
    const sello = (await page.locator('body').innerText()).replace(ESPACIO_DURO, ' ');
    const i = sello.indexOf('El ITP de un trastero comprado por separado');
    const nota = sello.slice(i, i + 400);
    // El defecto.
    expect(nota).toMatch(/57 bis(?:\.3| TRLITPAJD|\))/);
    expect(nota).toContain('en Ceuta y Melilla la cuota del ITP y la del AJD se bonifican un 50 %');
  });

  // HALLAZGO [19/10-d] (bajo, contenido) — EFECTO FAMILIA del 3249 (garaje; abierto aquel día y
  // REPARADO el 20/10/2026 con este), que ya
  // nombraba RESPUESTA_PLUSVALIA_TRASTERO. La respuesta (FAQ visible y FAQPage, una sola constante)
  // dice sin salvedad «Esta calculadora aplica un tipo del 25 %…», pero en Ceuta y Melilla la
  // calculadora bonifica la cuota al 50 % (art. 159.2 TRLRHL, `BONIFICACION_IIVTNU_CEUTA_MELILLA`)
  // y en Navarra y el País Vasco no la calcula. Melilla, base del CASO 59: quien rehaga la cuenta
  // con el tipo escrito obtiene 6.000 × 0,40 × 25 % = 600,00 €; la tarjeta publica 300,00 €.
  // REPARADO el 20/10/2026 (hallazgo 3383), con garaje (3249).
  test('[19/10-d] la FAQ de la plusvalía nombra la bonificación de Ceuta y Melilla y el régimen foral', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['input[aria-label="Precio del trastero"]']);
    const respuestas = await page.evaluate(() => {
      const h4 = [...document.querySelectorAll('h4')].find((h) => h.textContent?.includes('plusvalía municipal al vender'));
      const ld = [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => JSON.parse(s.textContent ?? '{}'));
      const faq = ld.find((x) => x['@type'] === 'FAQPage');
      const enLd = faq?.mainEntity.find((q: { name: string }) => q.name.includes('plusvalía'))?.acceptedAnswer.text ?? '';
      return { visible: h4?.nextElementSibling?.textContent ?? '', ld: enLd as string };
    });
    // El defecto.
    expect(respuestas.visible).toMatch(/Ceuta|Melilla/);
    expect(respuestas.visible).toMatch(/foral|Navarra|País Vasco/);
    expect(respuestas.ld).toMatch(/Ceuta|Melilla/);
    expect(respuestas.ld).toMatch(/foral/);
    await vendedor0810(page, BASE_1910_MELILLA);
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('300,00 €');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  INSPECTOR 21/10/2026 — re-inspección (la app estaba INVALIDADA por las reparaciones del
//  20/10/2026: f6de548d, 1084f12f y 616e5fc8; e2c8819a no la tocó, ya lo llevaba desde 9b58029b).
//  Los hallazgos de esas reparaciones (3252-3255 y 3380-3383) siguen cerrados: los sujetan arriba
//  [13/10-a…d] y [19/10-a…d], hoy sin marca.
//
//  Tres casos resueltos a mano ANTES de abrir el navegador, en ramas que el testigo de familia no
//  mide (tests/familias/compraventa.spec.ts pasa esta app por Madrid y segunda mano):
//   · CASO 61 — Andalucía en OBRA NUEVA con el trastero INDEPENDIENTE (IVA del 21 % y el AJD del
//     objeto «otro») y el vendedor-promotor de 616e5fc8, sin cuota y con el neto «(PARCIAL)».
//   · CASO 62 — Murcia (un tipo general que no es entero, 7,75 %) y 50 años de propiedad, el máximo
//     que admite el campo: el coeficiente del IIVTNU se topa en el de «20 o más años».
//   · CASO 63 — el País Vasco: obra nueva independiente (AJD del 0,5 %, no la exención foral de la
//     vivienda) con la gestoría del comprador «2.000.50»; la venta de un particular con la comisión
//     «3.5.0» y la plusvalía FORAL; y la cuota de comunidad «2.000.50» del reparto del IBI.
//  Después, tres hallazgos ABIERTOS con `test.fail()` y la aserción de FONDO primero.
//
//  De dónde sale cada cifra (ninguna de memoria):
//   · ITP general → `TIPOS_ITP_CCAA_2025` (data/fiscal/inmuebles.ts): Andalucía 7 %, Murcia 7,75 %,
//     País Vasco 7 % para lo que no es vivienda (`tipoNoVivienda`, NF 1/2011 de Bizkaia art. 13.a).
//   · IVA → `IVA_INMUEBLES_2025.garaje` = 21 % para el trastero independiente. AJD → `ITP_CCAA`
//     (data/itp-ccaa.ts): Andalucía `ajd` 1,2 % · País Vasco `ajd` 0,5 % (su `ajdVivienda` 0 es solo
//     de la vivienda y sus anejos) · Murcia `ajd` 1,5 % en el recuadro.
//   · Notaría → `ARANCELES_NOTARIO` × (1 − `REBAJA_ARANCEL_CUANTIA`) × 1,21 y `FACTURA_NOTARIAL`
//     (×1,5 a ×2; se publica ×1,75). Registro → `ARANCELES_REGISTRO` × 0,95 + `REGISTRO_CONCEPTOS`
//     (6,010121 + 3,005061), × 1,21. RD 1426/1989 y RD 1427/1989.
//   · Plusvalía → `COEFICIENTES_IIVTNU_2025` (3 años 0,14 · 20 o más años 0,40) ×
//     `PLUSVALIA_MUNICIPAL_META.tipoOrientativo` (25 %); foral en el País Vasco y Navarra
//     (`TERRITORIOS_IIVTNU_FORAL`). IRPF → `TRAMOS_GANANCIAS_PATRIMONIALES_2025` (19 % hasta 6.000,
//     21 % hasta 50.000). Obra nueva → `AVISO_VENTA_PROMOTOR` (data/fiscal/ganancia-inmueble.ts).
// ═══════════════════════════════════════════════════════════════════════════════

/** Obra nueva con el trastero INDEPENDIENTE, con el precio y la gestoría del comprador escritos. */
async function obraNuevaIndependiente2110(page: Page, ccaa: string, precio: string, gestoria: string): Promise<void> {
  await page.goto(RUTA);
  await esperarHidratacion(page, ['input[aria-label="Precio del trastero"]']);
  await page.locator('#select-ccaa').selectOption(ccaa);
  await page.getByRole('button', { name: /Primera mano/ }).click();
  await page.getByRole('button', { name: /Independiente/ }).click();
  await expect(page.getByRole('button', { name: /Independiente/ })).toHaveAttribute('aria-pressed', 'true');
  await sembrar(page, 'Precio del trastero', precio);
  await sembrar(page, 'Gastos de gestoría del comprador (€)', gestoria);
}

/** Las dos casillas del recuadro de la comunidad («ITP General» y «AJD»). */
const recuadro2110 = (page: Page) => texto(page.locator('[class*="infoCcaaGrid"]'));

/** El vendedor-promotor del CASO 61 y del hallazgo [21/10-a] (la comisión, la del 3 % por defecto). */
async function promotorAndalucia2110(page: Page): Promise<void> {
  await obraNuevaIndependiente2110(page, 'andalucia', '22000', '280');
  await page.getByRole('button', { name: 'Vendedor', exact: true }).click();
  await sembrar(page, 'Precio de compra original', '14000');
  await sembrar(page, 'Años de propiedad', '3');
  await sembrar(page, 'Valor catastral del suelo', '2000');
  await sembrar(page, 'Valor catastral total (suelo + construcción)', '6000');
  await sembrar(page, 'Gestoría y certificados del vendedor (€)', '150');
}

/** Murcia, 50 años de propiedad: la base del CASO 62 y del hallazgo [21/10-b]. */
const BASE_2110_MURCIA = {
  ccaa: 'murcia',
  venta: '48000',
  compra: '9000',
  gastos: '600',
  anios: '50',
  suelo: '4000',
  total: '12000',
  comision: '3',
  gestoria: '',
};

/** País Vasco, un particular con la comisión ilegible: la base del CASO 63 y del hallazgo [21/10-c]. */
const BASE_2110_PV = {
  ccaa: 'pais-vasco',
  venta: '30000',
  compra: '21000',
  gastos: '1200',
  anios: '9',
  suelo: '3000',
  total: '10000',
  comision: '3.5.0',
  gestoria: '200',
};

test.describe('Inspector 21/10/2026 — Andalucía en obra nueva con el promotor, Murcia a 50 años y el País Vasco con tres importes ilegibles', () => {
  /**
   * CASO 61 (normal) — Andalucía · Primera mano · Independiente · 22.000 € · gestoría 280.
   *   IVA 22.000 × 21 % = 4.620,00 · AJD 22.000 × 1,2 % = 264,00
   *   Notaría: 90,151816 + (22.000 − 6.010,12) × 0,45 % = 162,106276 × 0,95 = 154,000962 × 1,21 =
   *     186,341164 → ×1,5 = 279,51 · ×2 = 372,68 · ×1,75 = 326,10
   *   Registro: 24,040484 + 15.989,88 × 0,175 % = 52,022774 × 0,95 = 49,421635 + 9,015182 =
   *     58,436817 × 1,21 = 70,71
   *   Total 4.620,00 + 264,00 + 326,10 + 70,71 + 280,00 = 5.560,81 (25,28 %) · coste 27.560,81
   *   Recuadro: «ITP General 7 %» y «AJD 1,2 %», el del trastero suelto que se liquida.
   * VENDEDOR (el promotor, 616e5fc8) — compra 14.000 · 3 años · suelo 2.000 de 6.000 · comisión del 3 %
   * por defecto · gestoría 150:
   *   plusvalía: objetivo 2.000 × 0,14 × 25 % = 70,00 · real 8.000 × 1/3 × 25 % = 666,67 → 70,00
   *   «Impuesto sobre la renta de la venta · Sin calcular» y ninguna tarjeta de ganancia
   *   comisión 660,00 · total 70 + 660 + 150 = 880,00 (parcial) · neto 21.120,00 (PARCIAL)
   *   Con la comisión «3.5.0» (el invariante en la rama del promotor): leída como 0, total 220,00 y
   *   neto 21.780,00; cualquier comisión real lo BAJA, y se dice con su nombre.
   */
  test('CASO 61 — Andalucía, obra nueva independiente de 22.000 €: IVA del 21 %, AJD del 1,2 % y el promotor sin cuota', async ({ page }) => {
    await obraNuevaIndependiente2110(page, 'andalucia', '22000', '280');
    expect(await tituloTarjeta24(page, /^IVA \(/)).toBe('IVA (21,00 %)');
    expect(await valorTarjeta(page, /^IVA \(/)).toBe('4620,00 €');
    expect(await descripcionTarjeta(page, /^IVA \(/)).toBe('IVA 21 % — trastero independiente (obra nueva)');
    expect(await tituloTarjeta24(page, /^AJD \(/)).toBe('AJD (1,20 %)');
    expect(await valorTarjeta(page, /^AJD \(/)).toBe('264,00 €');
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('326,10 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain('Factura estimada entre 279,51 € y 372,68 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('70,71 €');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('280,00 €');
    expect(await tituloTarjeta24(page, /^Total gastos adicionales/)).toBe('Total gastos adicionales');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('5560,81 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toBe('25,28 % sobre el precio');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('27.560,81 €');
    expect(await descripcionTarjeta(page, 'COSTE TOTAL')).toBe('Precio del trastero + todos los gastos');
    const recuadro = await recuadro2110(page);
    expect(recuadro).toContain('ITP General 7 %');
    expect(recuadro).toContain('AJD 1,2 %');
    await expect(avisoReducidos0810(page)).toHaveCount(0);

    await page.getByRole('button', { name: 'Vendedor', exact: true }).click();
    await sembrar(page, 'Precio de compra original', '14000');
    await sembrar(page, 'Años de propiedad', '3');
    await sembrar(page, 'Valor catastral del suelo', '2000');
    await sembrar(page, 'Valor catastral total (suelo + construcción)', '6000');
    await sembrar(page, 'Gestoría y certificados del vendedor (€)', '150');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('70,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe('Método objetivo (más favorable)');
    expect(await valorTarjeta(page, 'Impuesto sobre la renta de la venta')).toBe('Sin calcular');
    expect(await descripcionTarjeta(page, 'Impuesto sobre la renta de la venta')).toContain('vende el promotor');
    await expect(page.locator('h3', { hasText: /Ganancia patrimonial|IRPF sobre ganancia|Valor de adquisición/ })).toHaveCount(0);
    expect(await tituloTarjeta24(page, /^Comisión inmobiliaria/)).toBe('Comisión inmobiliaria (3 %)');
    expect(await valorTarjeta(page, /Comisión inmobiliaria/)).toBe('660,00 €');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('150,00 €');
    expect(await tituloTarjeta24(page, /^Total gastos vendedor/)).toBe('Total gastos vendedor (parcial)');
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('880,00 €');
    expect(await descripcionTarjeta(page, 'Total gastos vendedor')).toBe('SIN el impuesto sobre la renta del promotor, que no se incluye');
    expect(await tituloTarjeta24(page, /^IMPORTE NETO VENDEDOR/)).toBe('IMPORTE NETO VENDEDOR (PARCIAL)');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('21.120,00 €');
    expect(await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe(
      'No descuenta el impuesto sobre la renta del promotor: el neto real puede ser menor que este.',
    );

    await sembrar(page, 'Comisión inmobiliaria (%)', '3.5.0');
    expect(await valorTarjeta(page, /Comisión inmobiliaria/)).toBe('Sin leer');
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('220,00 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('21.780,00 €');
    expect(await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR')).toContain(
      'No descuenta la comisión inmobiliaria, que no se ha podido leer: el neto real es menor que este.',
    );
  });

  /**
   * CASO 62 (límite) — Murcia · segunda mano · 48.000 € · gestoría 300 por defecto, y un vendedor con
   * 50 años de propiedad, el MÁXIMO que admite el campo (max={50}).
   *   ITP 48.000 × 7,75 % = 3.720,00 → «ITP (7,75 %)», un tipo general con decimales
   *   Notaría: 90,151816 + 24.040,49 × 0,45 % + 17.949,39 × 0,15 % = 225,258106 × 0,95 × 1,21 =
   *     258,934193 → ×1,5 = 388,40 · ×2 = 517,87 · ×1,75 = 453,13
   *   Registro: 24,040484 + 24.040,49 × 0,175 % + 17.949,39 × 0,125 % = 88,548079 × 0,95 =
   *     84,120675 + 9,015182 = 93,135857 × 1,21 = 112,69
   *   Total 3.720,00 + 453,13 + 112,69 + 300,00 = 4.585,82 (9,55 %) · coste 52.585,82
   *   Los cuatro reducidos de Murcia son de colectivo: a un perfil General no se le ofrece ninguno.
   * VENDEDOR — compra 9.000 · gastos 600 · 50 años · suelo 4.000 de 12.000 · comisión 3 % · sin gestoría:
   *   plusvalía: objetivo 4.000 × 0,40 × 25 % = 400,00 · real 39.000 × 1/3 × 25 % = 3.250 → 400,00
   *   comisión 1.440,00 · transmisión 48.000 − 1.440 − 400 = 46.160,00 · adquisición 9.600,00
   *   ganancia 36.560,00 (cruza el tramo de 6.000) · IRPF 1.140 + 30.560 × 21 % = 7.557,60
   *   total 400 + 1.440 + 7.557,60 = 9.397,60 · neto 38.602,40, que la app da por definitivo.
   *   (Que con 50 años la compra es de 1976, anterior al 31/12/1994, es el hallazgo [21/10-b].)
   */
  test('CASO 62 — Murcia, 48.000 € al 7,75 % y un vendedor con 50 años de propiedad', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['input[aria-label="Precio del trastero"]']);
    await page.locator('#select-ccaa').selectOption('murcia');
    await sembrar(page, 'Precio del trastero', '48000');
    expect(await tituloTarjeta24(page, /^ITP \(/)).toBe('ITP (7,75 %)');
    expect(await valorTarjeta(page, /^ITP \(/)).toBe('3720,00 €');
    expect(await descripcionTarjeta(page, /^ITP \(/)).toBe('ITP Región de Murcia');
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('453,13 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain('Factura estimada entre 388,40 € y 517,87 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('112,69 €');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('300,00 €');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('4585,82 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toBe('9,55 % sobre el precio');
    expect(await valorTarjeta(page, 'COSTE TOTAL DE ADQUISICIÓN')).toBe('52.585,82 €');
    const recuadro = await recuadro2110(page);
    expect(recuadro).toContain('ITP General 7,75 %');
    expect(recuadro).toContain('AJD 1,5 %');
    await expect(avisoReducidos0810(page)).toHaveCount(0);

    await vendedor0810(page, BASE_2110_MURCIA);
    await expect(page.locator('input[aria-label="Años de propiedad"]')).toHaveValue('50');
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('400,00 €');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toBe('Método objetivo (más favorable)');
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('9600,00 €');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('46.160,00 €');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('36.560,00 €');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('7557,60 €');
    expect(await valorTarjeta(page, /Comisión inmobiliaria/)).toBe('1440,00 €');
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('9397,60 €');
    expect(await tituloTarjeta24(page, /^IMPORTE NETO VENDEDOR/)).toBe('IMPORTE NETO VENDEDOR');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('38.602,40 €');
    expect(await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('Lo que realmente recibes tras los gastos');
  });

  /**
   * CASO 63 (debe rechazarse) — el País Vasco con tres importes ilegibles, en ramas que el testigo no mide.
   * COMPRADOR — Primera mano · Independiente · 30.000 € · gestoría «2.000.50»:
   *   IVA 30.000 × 21 % = 6.300,00 · AJD 30.000 × 0,5 % = 150,00 (el trastero suelto no comparte la
   *   exención foral de la primera transmisión de vivienda)
   *   Notaría: 90,151816 + 23.989,88 × 0,45 % = 198,106276 × 0,95 × 1,21 = 227,723164 → ×1,5 =
   *     341,58 · ×2 = 455,45 · ×1,75 = 398,52
   *   Registro: 24,040484 + 23.989,88 × 0,175 % = 66,022774 × 0,95 = 62,721635 + 9,015182 =
   *     71,736817 × 1,21 = 86,80
   *   La gestoría no se lee: «Sin leer», total 6.300 + 150 + 398,52 + 86,80 = 6.935,32 (parcial,
   *   23,12 %) y coste 36.935,32 «(PARCIAL)», «el coste real será mayor».
   * VENDEDOR — segunda mano (un particular) · compra 21.000 · gastos 1.200 · 9 años · suelo 3.000 de
   * 10.000 · comisión «3.5.0» · gestoría 200:
   *   plusvalía FORAL «SIN CALCULAR» · la comisión entra como 0
   *   transmisión 30.000 − 200 = 29.800,00 · adquisición 22.200,00 · ganancia 7.600,00 (máximo)
   *   IRPF 1.140 + 1.600 × 21 % = 1.476,00 (máximo) · total 200 + 1.476 = 1.676,00 · neto 28.324,00
   *   La comisión real BAJA la ganancia, la cuota y el neto: «es menor» en las tres, con su nombre.
   * REPARTO — escritura 01/07/2026 · IBI 180 · cuota de comunidad «2.000.50» → no reparte nada y nombra
   *   el campo.
   */
  test('CASO 63 — País Vasco: gestoría, comisión y cuota de comunidad ilegibles se nombran con su dirección', async ({ page }) => {
    await obraNuevaIndependiente2110(page, 'pais-vasco', '30000', '2.000.50');
    await expect(page.locator('input[aria-label="Gastos de gestoría del comprador (€)"]')).toHaveValue('2.000.50');
    expect(await tituloTarjeta24(page, /^IVA \(/)).toBe('IVA (21,00 %)');
    expect(await valorTarjeta(page, /^IVA \(/)).toBe('6300,00 €');
    expect(await tituloTarjeta24(page, /^AJD \(/)).toBe('AJD (0,50 %)');
    expect(await valorTarjeta(page, /^AJD \(/)).toBe('150,00 €');
    expect(await valorTarjeta(page, 'Gastos de notaría')).toBe('398,52 €');
    expect(await descripcionTarjeta(page, 'Gastos de notaría')).toContain('Factura estimada entre 341,58 € y 455,45 €');
    expect(await valorTarjeta(page, 'Registro de la Propiedad')).toBe('86,80 €');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('Sin leer');
    expect(await tituloTarjeta24(page, /^Total gastos adicionales/)).toBe('Total gastos adicionales (parcial)');
    expect(await valorTarjeta(page, 'Total gastos adicionales')).toBe('6935,32 €');
    expect(await descripcionTarjeta(page, 'Total gastos adicionales')).toBe('23,12 % sobre el precio — SIN la gestoría, que no se ha podido leer');
    expect(await tituloTarjeta24(page, /^COSTE TOTAL/)).toBe('COSTE TOTAL (PARCIAL)');
    expect(await valorTarjeta(page, /^COSTE TOTAL/)).toBe('36.935,32 €');
    expect(await descripcionTarjeta(page, /^COSTE TOTAL/)).toBe('No incluye la gestoría, que no se ha podido leer: el coste real será mayor');
    const recuadro = await recuadro2110(page);
    expect(recuadro).toContain('ITP General 7 %');
    expect(recuadro).toContain('AJD 0,5 %');

    await vendedor0810(page, BASE_2110_PV);
    expect(await valorTarjeta(page, 'Plusvalía municipal')).toBe('SIN CALCULAR');
    expect(await descripcionTarjeta(page, 'Plusvalía municipal')).toContain('norma foral de cada territorio histórico');
    expect(await valorTarjeta(page, 'Valor de adquisición')).toBe('22.200,00 €');
    expect(await valorTarjeta(page, 'Valor de transmisión')).toBe('29.800,00 €');
    expect(await descripcionTarjeta(page, 'Valor de transmisión')).toContain('la comisión no se ha podido leer');
    expect(await tituloTarjeta24(page, /^Ganancia patrimonial/)).toBe('Ganancia patrimonial (máximo)');
    expect(await valorTarjeta(page, 'Ganancia patrimonial')).toBe('7600,00 €');
    expect(await descripcionTarjeta(page, 'Ganancia patrimonial')).toContain(
      'La comisión inmobiliaria no se ha podido leer, así que la ganancia real es menor',
    );
    expect(await tituloTarjeta24(page, /^IRPF sobre ganancia/)).toBe('IRPF sobre ganancia (máximo)');
    expect(await valorTarjeta(page, 'IRPF sobre ganancia')).toBe('1476,00 €');
    expect(await descripcionTarjeta(page, 'IRPF sobre ganancia')).toContain(
      'La comisión inmobiliaria no se ha podido leer, así que la cuota real es menor',
    );
    expect(await valorTarjeta(page, /Comisión inmobiliaria/)).toBe('Sin leer');
    expect(await valorTarjeta(page, 'Gastos de gestoría')).toBe('200,00 €');
    expect(await tituloTarjeta24(page, /^Total gastos vendedor/)).toBe('Total gastos vendedor (parcial)');
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('1676,00 €');
    expect(await tituloTarjeta24(page, /^IMPORTE NETO VENDEDOR/)).toBe('IMPORTE NETO VENDEDOR (PARCIAL)');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('28.324,00 €');
    const neto = await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR');
    expect(
      neto.startsWith(
        'No descuenta la plusvalía municipal: el neto real puede ser menor que este. No descuenta la comisión inmobiliaria, que no se ha podido leer (la comisión inmobiliaria rebaja también el IRPF al descontarla, hasta un 21 % de su importe): el neto real es menor que este. En el País Vasco la plusvalía municipal se rige por la norma foral',
      ),
    ).toBe(true);

    await page.locator('input[type="date"]').fill('2026-07-01');
    await sembrar(page, 'Cuota anual del IBI', '180');
    await sembrar(page, 'Cuota de comunidad', '2.000.50');
    const reparto = page.locator('section[aria-labelledby="titulo-prorrateo"]');
    await expect(reparto.locator('[role="alert"]')).toHaveText(
      /No se entiende el importe de «Cuota de comunidad»: escríbelo como 450 o 450,80\. Hasta corregirlo no se reparte nada/,
    );
    await expect(reparto.locator('table')).toHaveCount(0);
  });

  // ─── HALLAZGOS del 21/10/2026, ABIERTOS ──────────────────────────────────────────────
  // Cada uno con `test.fail()` y la aserción de FONDO primero; las cifras de sus escenarios las
  // sujetan en verde los CASOS 61-63.

  // HALLAZGO [21/10-a] (bajo, contenido) — EFECTO FAMILIA del 3394 (estimador-compraventa-inmueble),
  // medido aquí. Con «Primera mano» la pestaña Vendedor ya no liquida la renta del promotor (616e5fc8,
  // hallazgo 3380), pero sigue pidiendo bajo el rótulo «Datos para calcular plusvalía e IRPF» los dos
  // campos que solo alimentaban esa cuota, con ayudas que prometen un efecto: «Impuestos y gastos que
  // pagaste al comprarlo» («…suman al valor de adquisición y REDUCEN la ganancia (art. 35.1 LIRPF)») y
  // «Otras rentas del ahorro de este año (€)» («…así que con ellas la venta puede tributar a un tipo
  // mayor»). Escribir en ellos no mueve ninguna cifra: el neto sigue en 21.120,00 € y el total en
  // 880,00 €.
  test.fail('[21/10-a] en obra nueva la pestaña Vendedor no promete el efecto de campos que ya no alimentan nada', async ({ page }) => {
    await promotorAndalucia2110(page);
    // El defecto.
    const formulario = await texto(page.locator('[class*="formVendedor"]'));
    expect(formulario).not.toMatch(/REDUCEN la ganancia|puede tributar a un tipo mayor/);
    // Lo que lo demuestra, si los campos siguen ahí: con 1.500 € y 40.000 € escritos nada se mueve.
    for (const [etiqueta, valor] of [
      ['Impuestos y gastos que pagaste al comprarlo', '1500'],
      ['Otras rentas del ahorro de este año (€)', '40000'],
    ] as const) {
      if (await page.locator(`input[aria-label="${etiqueta}"]`).count()) await sembrar(page, etiqueta, valor);
    }
    expect(await valorTarjeta(page, 'Total gastos vendedor')).toBe('880,00 €');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('21.120,00 €');
  });

  // HALLAZGO [21/10-b] (bajo, contenido) — EFECTO FAMILIA del 3396 (simulador-gastos-compraventa-
  // garaje), medido aquí. El campo admite hasta 50 años de propiedad, y con 32 o más la compra es
  // anterior al 31/12/1994 (con 31, puede serlo): su ganancia puede reducirse con los coeficientes de abatimiento de la
  // disposición transitoria 9.ª LIRPF, que la app no aplica. data/fiscal/ganancia-inmueble.ts, el
  // motor de la tarjeta, lo pone en «LO QUE ESTE MÓDULO NO HACE (y por qué se dice en vez de
  // aproximarlo)», y la referencia lo nombra en su bloque educativo («…y los coeficientes de
  // abatimiento de las compras anteriores a 1995»). Aquí no lo dice ni la tarjeta del IRPF, ni el
  // sello, ni las «Limitaciones de esta calculadora», y el neto del CASO 62 sale como definitivo.
  test.fail('[21/10-b] con una compra anterior a 1995 la página dice que no aplica los coeficientes de abatimiento', async ({ page }) => {
    await vendedor0810(page, BASE_2110_MURCIA);
    // El defecto: el texto de la página, bloque educativo plegado incluido y sin los <script>.
    const textoPagina = await page.evaluate(() => {
      const copia = document.body.cloneNode(true) as HTMLElement;
      copia.querySelectorAll('script, style').forEach((s) => s.remove());
      return copia.textContent ?? '';
    });
    expect(textoPagina).toMatch(/abatimiento|anteriores a 1995|31\/12\/1994/i);
  });

  // HALLAZGO [21/10-c] (bajo, contenido) — en territorio foral el neto promete «obtenerlo». Con la
  // plusvalía foral (País Vasco y Navarra, que la app no calcula nunca) y un importe que corregir, la
  // descripción del neto termina «Escribe con coma decimal (1.234,56) lo que no se ha podido leer para
  // obtenerlo.»; escrita la comisión legible (3,5 %), el neto sigue «(PARCIAL)» —30.000 − 1.050 − 200
  // − 1.255,50 de IRPF = 27.494,50 €— porque la plusvalía no llega nunca. Es lo que 616e5fc8 resolvió
  // para el promotor con «para calcular lo demás» (page.tsx ~l. 2015), y el comentario de esa misma
  // línea solo prevé el foral SIN nada que pedir. La misma línea está en la referencia (~l. 2865),
  // garaje (~l. 2003) y local-comercial (~l. 2290); medido solo aquí.
  test.fail('[21/10-c] en territorio foral el neto no promete «obtenerlo» al corregir un importe', async ({ page }) => {
    await vendedor0810(page, BASE_2110_PV);
    // El defecto.
    expect(await descripcionTarjeta(page, 'IMPORTE NETO VENDEDOR')).not.toContain('para obtenerlo');
    // Lo que lo demuestra: corregida la comisión, el neto sigue sin la plusvalía foral.
    await sembrar(page, 'Comisión inmobiliaria (%)', '3,5');
    expect(await tituloTarjeta24(page, /^IMPORTE NETO VENDEDOR/)).toBe('IMPORTE NETO VENDEDOR (PARCIAL)');
    expect(await valorTarjeta(page, 'IMPORTE NETO VENDEDOR')).toBe('27.494,50 €');
  });
});
