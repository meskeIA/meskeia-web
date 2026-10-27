import { test, expect, Locator, Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * Inspector — conversor-pesetas-euros (segmento CÁLCULO, riesgo 2, 122 usos/90 d)
 * Primera inspección: 18/09/2026 · RE-INSPECCIÓN: 20/09/2026 (invalidada por cambio de datos)
 * · TERCERA: 27/10/2026 (re-inspección tras las reparaciones; sus casos, al final del fichero).
 *
 * QUÉ PROMETE LA APP
 *   · <h1> «Conversor de Pesetas a Euros» y subtítulo «Convierte al tipo oficial y descubre
 *     cuánto valdría esa cantidad hoy según la inflación». Son DOS promesas distintas y las
 *     dos se verifican aquí.
 *   · metadata.ts / FAQPage: «tipo de cambio oficial (166,386 ptas/€)», «fijado de forma
 *     irrevocable por el Reglamento (CE) 2866/98», y la fórmula literal del segundo modo:
 *     «valor hoy = (pesetas ÷ 166,386) × (IPC del último año cerrado ÷ IPC del año de
 *     referencia)». Hasta el 20/09/2026 decía «IPC del año actual» (hallazgo 942, REPARADO).
 *   · El bloque educativo repite la fórmula en su tabla comparativa.
 *
 * DÓNDE VIVE EL CÁLCULO — no hay motor aparte: los dos `useMemo` de app/…/page.tsx.
 *   · TASA_FIJA_PESETA_EURO = 166.386 e IPC_DATA vienen de data/ipc-ine.ts (módulo
 *     compartido con estimador-inflacion), no escritos a mano en el componente.
 *   · La entrada la lee parseSpanishNumber() de @/lib — el parser canónico, NO el
 *     parseFloat(x.replace(',', '.')) que el catálogo arrastra. Por eso el primer caso de
 *     abajo es justo el que ese defecto rompería.
 *
 * ── POR QUÉ SE RE-INSPECCIONA (20/09/2026) ───────────────────────────────────
 * La cola la marcó INVALIDADA: el 19/09/2026 se regeneró entera data/ipc-ine.ts (commit
 * 90404672) y con ella cambian todas las cifras del segundo modo. La serie nueva se ha
 * cotejado CONTRA LA FUENTE VIVA, no contra la memoria, descargando el INE en sesión:
 *
 *   · 2002-2025 — tabla 24077 (`DATOS_TABLA/24077?nult=800`, 296 índices mensuales,
 *     que empiezan en 2002 pese al título de la tabla). La media aritmética de los 12
 *     meses de cada año reproduce IPC_DATA con una desviación máxima del 0,0001 %.
 *   · 1961-2001 — reconstruidos dividiendo cada mes de 2002 por su tasa de variación
 *     anual de la tabla 76134, hacia atrás año a año, tal como documenta el módulo. La
 *     serie así rehecha reproduce IPC_DATA con una desviación máxima del 0,0022 %
 *     (peor año, 1961), que es el redondeo a cuatro decimales del propio fichero.
 *
 * O sea: el dato no es de segunda mano y la serie es fiel a su fuente. La escala es la
 * base 2025 = 100 que el INE publica desde enero de 2026.
 *
 * LOS CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   CASO 1 (normal, con separador de millar) — 1.000.000 ptas → euros
 *       1.000.000 ÷ 166,386 = 6.010,121043837…
 *       El art. 5 del Reglamento (CE) 1103/97 obliga a redondear al céntimo más próximo:
 *       6.010,12 €. Se escribe «6010,12 €» porque es-ES no agrupa los millares de cuatro
 *       cifras. Si la app parseara con parseFloat(replace(',', '.')), leería «1.000.000»
 *       como 1 peseta y devolvería 0,01 €: de ahí que este sea el caso normal y no uno
 *       exótico, porque las cifras típicas de esta app tienen seis y siete dígitos.
 *       El art. 4.3 prohíbe además tipos inversos y triangulaciones: se divide por 166,386
 *       en un sentido y se multiplica por 166,386 en el otro, nunca por 1/166,386.
 *
 *   CASO 2 (límite) — 0 pesetas y 999.999.999.999 pesetas
 *       0 ÷ 166,386 = 0 → «0,00 €», y NO el aviso de cantidad inválida: el cero es un
 *       número legítimo y el resultado existe.
 *       999.999.999.999 ÷ 166,386 = 6.010.121.043,831813… → al céntimo, 6.010.121.043,83 €.
 *
 *   CASO 3 (rechazo) — «-50000» y «12abc»
 *       Una cantidad negativa de pesetas no significa nada y «12abc» no es un número:
 *       parseSpanishNumber() devuelve NaN en el segundo y la guarda `cantidad < 0` atrapa
 *       el primero. En los dos debe desaparecer el resultado y salir «Introduce una
 *       cantidad válida para ver el resultado» — nunca una cifra plausible pero falsa
 *       (con parseFloat, «12abc» habría valido 12 y habría dado 0,07 € sin avisar).
 *
 *   CASO 4 (la segunda promesa: poder adquisitivo) — 100.000 ptas de 1985
 *       euros de la época = 100.000 ÷ 166,386 = 601,012104… → 601,01 €
 *       IPC 1985 = 27,9389 e IPC 2025 = 100 (data/ipc-ine.ts, base 2025 = 100)
 *       valor hoy = 601,012104 × (100 ÷ 27,9389) = 601,012104 × 3,57923898 = 2.151,1712…
 *                 → 2.151,17 €
 *       inflación acumulada = (100 − 27,9389) ÷ 27,9389 × 100 = 257,920…% → +257,9 %
 *       años transcurridos = 2025 − 1985 = 40
 *       Y 1.000.000 ptas de 1975 (IPC 6,6913): 6.010,121044 × (100 ÷ 6,6913) = 89.819,93 €,
 *       inflación (100 − 6,6913) ÷ 6,6913 × 100 = 1.394,464…% → +1394,5 %, 50 años.
 *
 *       ⚠️ ESTAS CIFRAS CAMBIARON EL 19/09/2026 y no porque la app calcule distinto: la serie
 *       del IPC se regeneró contra la fuente. La anterior no estaba en ninguna base publicada
 *       por el INE y traía tres eslabones mal empalmados —2001, 2013 y un 2025 estimado—, que
 *       dejaban cualquier peseta anterior a 2001 un 3,9 % por debajo de su valor real. Los de
 *       arriba son los valores con la serie corregida; con la vieja salían 2.070,61 € y
 *       86.256,37 €. Verificados contra el INE en la re-inspección del 20/09/2026.
 *
 *   CASO 5 (el parser, que es lo que más se teclea aquí) — «1.500» y «1500,50»
 *       «1.500» es millar español → 1500 ptas ÷ 166,386 = 9,015181… → 9,02 €
 *       «1500,50» es decimal español → 1500,5 ÷ 166,386 = 9,018186… → 9,02 €
 *       Los dos dan el mismo céntimo, y eso es correcto: media peseta son 0,003 €. Lo que
 *       el caso descarta es la lectura CRUZADA, que sí se nota: con parseFloat a secas
 *       «1.500» valdría 1,5 (→ 0,01 €) y con replace(',', '.') «1500,50» sería 1500,5 pero
 *       «1.500» seguiría siendo 1,5. Mil veces menos, sin ningún aviso.
 *
 * LOS CINCO SE CUMPLEN EN LOCAL (20/09/2026), comparados uno a uno con el cálculo a mano.
 * El motor está sano: tipo correcto, redondeo al céntimo, sin tipo inverso, parser canónico,
 * rechazo limpio y la serie del IPC fiel a la fuente.
 *
 * ── LOS TRES HALLAZGOS de la re-inspección (20/09/2026) — REPARADOS el mismo día ──
 * (commit 0f4a5f0a). Se describieron aquí sin asertarlos mientras estuvieron abiertos; hoy
 * son los candados de regresión del final del fichero:
 *
 *   A. (940, REPARADO) La ETIQUETA redondeaba la cantidad a cero decimales mientras el
 *      cálculo usaba el valor completo: con «1499,60» salía «1500 pesetas equivalen a:
 *      9,01 €», y 1.500 pesetas son 9,02 €. Ahora rotula las pesetas con sus decimales
 *      (`decimalesDe`). ⚠️ El sentido euros → pesetas NO se tocó y sigue rotulando el
 *      importe con dos decimales fijos: es el hallazgo de la inspección del 27/10/2026.
 *
 *   B. (941, REPARADO) El botón «⇄» —único camino a la dirección euros → pesetas— no tenía
 *      `aria-label` y su nombre accesible era el propio glifo. El candado `check:a11y-jsx`
 *      no lo veía: «⇄» (U+21C4) no está en su rango de emojis.
 *
 *   C. (942, REPARADO) El FAQPage del jsonLd decía que la fórmula usa «el IPC del año
 *      actual», y el motor usa la media anual del último año CERRADO. Hoy dice «IPC del
 *      último año cerrado». ⚠️ La fila «Fórmula» de la tabla educativa sigue diciendo «IPC
 *      hoy»: es otra boca con el mismo defecto, hallazgo de la inspección del 27/10/2026.
 *
 * LOS 4 HALLAZGOS del 18/09/2026, al final, ya como candados de regresión: se repararon ese
 * mismo día. El de fondo —que el índice de 2025 era una estimación propia y no el dato
 * publicado— se cerró el 19/09/2026 regenerando la serie entera contra el INE.
 */

/** El € que escribe Intl va precedido de un espacio DURO (U+00A0). Lo normalizamos. */
async function texto(loc: Locator): Promise<string> {
  return ((await loc.textContent()) ?? '').replace(/ /g, ' ').trim();
}

const valorPrincipal = (page: Page) => page.locator('[class*="resultValue"]').first();
const etiquetaPrincipal = (page: Page) => page.locator('[class*="resultLabel"]').first();
const aviso = (page: Page) => page.locator('[class*="placeholder"] p').first();

/** Escribe en el campo de la cantidad y comprueba que el estado de React lo recogió. */
async function escribir(page: Page, selector: string, valor: string): Promise<void> {
  await page.fill(selector, valor);
  await esperarValorEnReact(page, selector, valor);
}

/** El selector de año, por su etiqueta (su id lleva una «ñ» que no conviene meter en CSS). */
const selectorDeAño = (page: Page) => page.getByLabel('¿De qué año son esas pesetas?');

/** Pasa al modo «Valor real hoy» y espera a que su campo esté hidratado. */
async function irAValorRealHoy(page: Page): Promise<void> {
  await page.getByRole('button', { name: /Valor real hoy/ }).click();
  await esperarHidratacion(page, ['#cantidad-historica']);
}

test.beforeEach(async ({ page }) => {
  await page.goto('/conversor-pesetas-euros/');
  await esperarHidratacion(page, ['#cantidad-directa']);
});

test.describe('Conversión oficial (Reglamento CE 2866/98: 166,386 ptas/€)', () => {
  test('CASO 1 · lee el separador de millar español y redondea al céntimo', async ({ page }) => {
    // El campo arranca en «100000»; escribir «1.000.000» lo MUEVE de verdad.
    await escribir(page, '#cantidad-directa', '1.000.000');

    // 1.000.000 ÷ 166,386 = 6.010,121043837… → al céntimo más próximo, 6.010,12 €.
    // es-ES no agrupa los millares hasta las cinco cifras: de ahí «6010,12 €».
    expect(await texto(valorPrincipal(page))).toBe('6010,12 €');
    expect(await texto(etiquetaPrincipal(page))).toBe('1.000.000 pesetas equivalen a:');

    // Y ahora a la baja, desde 1.000.000: 100.000 ÷ 166,386 = 601,012104… → 601,01 €.
    // Es el mismo valor que el FAQ de la app declara dos veces («100.000 ptas = 601,01 €»).
    await escribir(page, '#cantidad-directa', '100000');
    expect(await texto(valorPrincipal(page))).toBe('601,01 €');
  });

  test('CASO 1.bis · el millar escrito con coma (Latam) da el mismo importe', async ({ page }) => {
    // «1,000,000» son un millón de pesetas en México o Perú; parseSpanishNumber lo admite.
    await escribir(page, '#cantidad-directa', '1,000,000');
    expect(await texto(valorPrincipal(page))).toBe('6010,12 €');
  });

  test('CASO 5 · el punto de millar y la coma decimal, leídos cada uno como toca', async ({ page }) => {
    // Este es el caso que rompería un parseo casero, y el que más se teclea en esta app:
    // las cantidades en pesetas se escriben con punto de millar por costumbre.

    // «1.500» = mil quinientas pesetas → 1500 ÷ 166,386 = 9,015181… → 9,02 €.
    // Con parseFloat a secas valdría 1,5 y saldría 0,01 €: mil veces menos.
    await escribir(page, '#cantidad-directa', '1.500');
    expect(await texto(valorPrincipal(page))).toBe('9,02 €');

    // «1500,50» = mil quinientas pesetas con cincuenta céntimos → 1500,5 ÷ 166,386
    // = 9,018186… → 9,02 €. Coincide con el anterior porque media peseta son 0,003 €,
    // y eso es lo correcto: lo que este caso descarta es que la coma se lea como millar.
    await escribir(page, '#cantidad-directa', '1500,50');
    expect(await texto(valorPrincipal(page))).toBe('9,02 €');

    // La prueba de que NO son el mismo número: 1.499,60 ÷ 166,386 = 9,012777… → 9,01 €,
    // un céntimo por debajo. Si la coma se estuviera ignorando, aquí saldría 9,02 €.
    // La etiqueta de esta pantalla decía «1500 pesetas» (hallazgo 940, REPARADO el
    // 20/09/2026): aquí se comprueba la CIFRA; el rótulo lo vigila su candado, al final.
    await escribir(page, '#cantidad-directa', '1499,60');
    expect(await texto(valorPrincipal(page))).toBe('9,01 €');
  });

  test('CASO 2 · el cero da resultado, no aviso', async ({ page }) => {
    await escribir(page, '#cantidad-directa', '0');
    // 0 ÷ 166,386 = 0. El cero es una cantidad válida: debe salir el importe, no el aviso.
    expect(await texto(valorPrincipal(page))).toBe('0,00 €');
    await expect(aviso(page)).toHaveCount(0);
  });

  test('CASO 2.bis · una cifra muy grande no pierde céntimos', async ({ page }) => {
    await escribir(page, '#cantidad-directa', '999999999999');
    // 999.999.999.999 ÷ 166,386 = 6.010.121.043,831813… → 6.010.121.043,83 €
    expect(await texto(valorPrincipal(page))).toBe('6.010.121.043,83 €');
  });

  test('CASO 3 · rechaza la cantidad negativa y el texto que no es número', async ({ page }) => {
    await escribir(page, '#cantidad-directa', '-50000');
    await expect(valorPrincipal(page)).toHaveCount(0);
    expect(await texto(aviso(page))).toBe('Introduce una cantidad válida para ver el resultado');

    // «12abc» con parseFloat habría valido 12 y habría dado 0,07 € sin avisar de nada.
    await escribir(page, '#cantidad-directa', '12abc');
    await expect(valorPrincipal(page)).toHaveCount(0);
    expect(await texto(aviso(page))).toBe('Introduce una cantidad válida para ver el resultado');

    // «1e3» valía 1000 y «1.2.3» valía 1,2 con parseFloat: importes plausibles y falsos.
    await escribir(page, '#cantidad-directa', '1e3');
    await expect(valorPrincipal(page)).toHaveCount(0);
    await escribir(page, '#cantidad-directa', '1.2.3');
    await expect(valorPrincipal(page)).toHaveCount(0);
  });

  test('CASO 1.ter · el sentido inverso multiplica por el mismo tipo, sin tipo inverso', async ({ page }) => {
    await escribir(page, '#cantidad-directa', '100');
    await page.locator('[class*="swapButton"]').click();
    await expect(page.locator('label[for="cantidad-directa"]')).toHaveText('Cantidad en euros (€)');

    // 100 × 166,386 = 16.638,6 → a la peseta más próxima, 16.639.
    // El art. 4.3 del Reglamento (CE) 1103/97 prohíbe usar el tipo inverso (1/166,386 =
    // 0,00601012…), que con esos decimales daría 16.638,5999… y podría bajar a 16.638.
    expect(await texto(valorPrincipal(page))).toBe('16.639 ptas');
    expect(await texto(etiquetaPrincipal(page))).toBe('100,00 € equivalen a:');

    // 1 € = 166,386 ptas → 166 ptas a la unidad más próxima.
    await escribir(page, '#cantidad-directa', '1');
    expect(await texto(valorPrincipal(page))).toBe('166 ptas');
  });

  test('el tipo declarado en pantalla es el del Reglamento, no uno redondeado', async ({ page }) => {
    const subtexto = page.locator('[class*="resultSubtext"]').first();
    expect(await texto(subtexto)).toBe('al tipo fijo oficial de 166,386 ptas/€');
  });
});

test.describe('Valor real hoy (IPC del INE, base 2025 = 100)', () => {
  test('CASO 4 · aplica la fórmula que la propia app declara', async ({ page }) => {
    await irAValorRealHoy(page);

    // El campo arranca en «100000» y el año en 1985: los dos casos MUEVEN ambos controles.
    // Primero 1975, que es el que obliga a mover el selector desde su valor inicial.
    await escribir(page, '#cantidad-historica', '1.000.000');
    await selectorDeAño(page).selectOption('1975');

    // 1.000.000 ÷ 166,386 = 6.010,121044 → × (100 ÷ 6,6913) = 89.819,93 €
    // inflación = (100 − 6,6913) ÷ 6,6913 × 100 = 1.394,464…% · años = 2025 − 1975 = 50
    expect(await texto(valorPrincipal(page))).toBe('89.819,93 €');
    expect(await texto(etiquetaPrincipal(page))).toBe('1.000.000 pesetas de 1975 equivalen hoy a:');
    const tarjetas1975 = page.locator('[class*="statCard"]');
    expect(await texto(tarjetas1975.nth(0))).toContain('6010,12 €');
    // Desde el hallazgo 3578 el % va separado con espacio duro (texto() lo normaliza a espacio)
    expect(await texto(tarjetas1975.nth(1))).toContain('+1394,5 %');
    expect(await texto(tarjetas1975.nth(2))).toContain('50');

    // Y ahora el caso de referencia, moviendo los dos controles otra vez.
    await escribir(page, '#cantidad-historica', '100000');
    await selectorDeAño(page).selectOption('1985');

    // 100.000 ÷ 166,386 = 601,012104 → × (100 ÷ 27,9389) = 2.151,1712… → 2.151,17 €
    expect(await texto(valorPrincipal(page))).toBe('2151,17 €');
    const tarjetas1985 = page.locator('[class*="statCard"]');
    expect(await texto(tarjetas1985.nth(0))).toContain('601,01 €'); // conversión sin inflación
    expect(await texto(tarjetas1985.nth(1))).toContain('+257,9 %');  // (100−27,9389)/27,9389
    expect(await texto(tarjetas1985.nth(2))).toContain('40');       // 2025 − 1985
  });

  test('CASO 4.bis · los dos extremos de la serie, que son los que delatan un eslabón mal empalmado', async ({ page }) => {
    await irAValorRealHoy(page);

    // 1961 es el año más antiguo del IPC del INE y el que acumula todo el encadenado hacia
    // atrás: si algún empalme de la serie se rompiera, aquí se vería multiplicado.
    // IPC 1961 = 2,1228 → 601,012104 × (100 ÷ 2,1228) = 28.312,2340… → 28.312,23 €
    // inflación = (100 − 2,1228) ÷ 2,1228 × 100 = 4.610,78…% · años = 2025 − 1961 = 64
    await selectorDeAño(page).selectOption('1961');
    expect(await texto(valorPrincipal(page))).toBe('28.312,23 €');
    const extremoViejo = page.locator('[class*="statCard"]');
    expect(await texto(extremoViejo.nth(1))).toContain('+4610,8 %');
    expect(await texto(extremoViejo.nth(2))).toContain('64');

    // 2001 es el último año seleccionable y el eslabón que estaba mal antes del 19/09/2026.
    // IPC 2001 = 57,9905 → 601,012104 × (100 ÷ 57,9905) = 1.036,3975… → 1.036,40 €
    // inflación = (100 − 57,9905) ÷ 57,9905 × 100 = 72,44…% · años = 24
    await selectorDeAño(page).selectOption('2001');
    expect(await texto(valorPrincipal(page))).toBe('1036,40 €');
    const extremoNuevo = page.locator('[class*="statCard"]');
    expect(await texto(extremoNuevo.nth(1))).toContain('+72,4 %');
    expect(await texto(extremoNuevo.nth(2))).toContain('24');
  });

  test('el año más reciente del cálculo se dice en pantalla', async ({ page }) => {
    await irAValorRealHoy(page);
    // La app no promete «hoy» a secas: dice de qué año es el poder adquisitivo que usa.
    // Es lo que salvaba en pantalla el hallazgo 942 mientras el jsonLd prometía «el IPC del
    // año actual» (REPARADO el 20/09/2026: hoy dice «último año cerrado»).
    expect(await texto(page.locator('[class*="resultSubtext"]').first()))
      .toBe('en poder adquisitivo de 2025');
  });

  test('CASO 3.bis · también aquí rechaza la cantidad negativa', async ({ page }) => {
    await irAValorRealHoy(page);
    await escribir(page, '#cantidad-historica', '-1000');
    await expect(valorPrincipal(page)).toHaveCount(0);
    expect(await texto(aviso(page))).toBe('Introduce una cantidad válida para ver el resultado');
  });

  test('solo se ofrecen años en que la peseta existía y el IPC tiene dato', async ({ page }) => {
    await irAValorRealHoy(page);
    const opciones = await selectorDeAño(page).locator('option').allTextContents();
    // El IPC del INE arranca en 1961; la peseta dejó de circular el 28/02/2002.
    expect(opciones[0]).toBe('1961');
    expect(opciones[opciones.length - 1]).toBe('2001');
    expect(opciones).toHaveLength(41); // 2001 − 1961 + 1
  });
});

test.describe('Los 4 hallazgos del 18/09/2026, reparados el mismo día', () => {
  test('915 · la tabla educativa dice lo mismo que el motor', async ({ page }) => {
    // La fila «Ejemplo» de la tabla comparativa decía «100.000 ptas de 1985 = unos 1.470 €
    // de poder adquisitivo hoy», mientras el motor devolvía 2.070,61 € para esa entrada
    // exacta: una cifra un 29 % más baja para quien se quedara con la tabla. Lo que este
    // candado vigila no es un número concreto sino que la tabla y el motor digan lo mismo,
    // así que al regenerarse la serie el 19/09/2026 se mueven los dos a la vez: hoy son
    // 2.151,17 € (CASO 4).
    // ⚠️ Esa cifra sigue ESCRITA A MANO en el JSX aunque el componente ya importa IPC_DATA
    //    y TASA_FIJA_PESETA_EURO: volverá a desfasarse en enero, cuando el INE cierre 2026.
    const filaEjemplo = page.locator('table tbody tr').filter({ hasText: 'Ejemplo' });
    await expect(filaEjemplo).toContainText('2.151,17');
  });

  test('916 y 917 · la app dice de dónde sale el IPC, de cuándo es y en qué base está', async ({ page }) => {
    // data/ipc-ine.ts marcaba el IPC de 2025 con «Valor estimado — actualizar cuando el INE
    // publique el IPC real de 2025», y la app atribuía el resultado al «IPC del INE» sin
    // ningún matiz. El CLAUDE.md exige además un <DataReference> tras el <DisclaimerCard>
    // en toda app apoyada en datos con fecha de caducidad, y la página no tenía ninguno.
    await expect(page.getByText(/Última verificación/i).first()).toBeVisible();

    // El 18/09 hizo falta advertir de que el índice de 2025 era una estimación propia. El
    // 19/09/2026 esa advertencia desapareció porque desapareció su motivo: la serie se
    // regeneró contra la fuente y ya no hay ningún año estimado. Lo que queda vigilado es el
    // sello de procedencia —de dónde sale el dato y de cuándo es—, que el CLAUDE.md exige
    // mientras la serie caduque cada enero, y que la base declarada sea la que el módulo usa
    // de verdad: 2025, no la 2021 que el INE cerró en diciembre de 2025.
    const referencia = page.locator('[class*="dataReference"]');
    await expect(referencia).toContainText('INE');
    await expect(referencia).toContainText('base 2025');
  });

  test('918 · el aviso de entrada inválida es anunciable', async ({ page }) => {
    // Al escribir algo que no es un número el resultado DESAPARECE y aparece un <p> suelto.
    // Sin role="status"/"alert" ni aria-live, un lector de pantalla no anuncia ni la
    // desaparición ni el aviso: el usuario se queda esperando un resultado que ya no está.
    await escribir(page, '#cantidad-directa', '12abc');
    const region = page.locator('[class*="placeholder"]').first();
    const anunciable = await region.evaluate((el) => {
      const contenedor = el.closest('[aria-live], [role="status"], [role="alert"]');
      return contenedor !== null;
    });
    expect(anunciable).toBe(true);
  });
});

/* ── Los tres hallazgos del Inspector del 20/09/2026, ya reparados ───────────── */

test('la etiqueta del resultado nombra la cantidad tecleada, no una redondeada', async ({
  page,
}) => {
  // Redondeaba a cero decimales mientras el cálculo usaba el valor completo: con 1.499,60
  // anunciaba «1500 pesetas equivalen a: 9,01 €», y 1.500 pesetas son 9,02 € (hallazgo 940).
  await escribir(page, '#cantidad-directa', '1499,60');

  const etiqueta = etiquetaPrincipal(page);
  // Sin punto de millar porque son cuatro cifras: es la regla de la RAE y así lo hace
  // Intl con es-ES. Desde cinco cifras sí agrupa.
  await expect(etiqueta).toContainText('1499,60 pesetas');
  await expect(etiqueta).not.toContainText('1500 pesetas');
  // 1.499,60 ÷ 166,386 = 9,0128… → 9,01 €
  await expect(valorPrincipal(page)).toContainText('9,01');
});

test('el botón de invertir la conversión tiene nombre accesible', async ({ page }) => {
  // Es el ÚNICO camino a euros → pesetas, o sea la mitad de lo que promete el <h1>, y su
  // nombre accesible era el propio glifo «⇄» (hallazgo 941).
  await expect(
    page.getByRole('button', { name: 'Cambiar dirección de la conversión' }),
  ).toHaveCount(1);
});

/* ══════════════════════════════════════════════════════════════════════════════════════
 * TERCERA INSPECCIÓN — 27/10/2026
 *
 * LAS FUENTES, LEÍDAS EN SESIÓN (EUR-Lex devolvió la página vacía; los dos reglamentos se
 * leyeron en la base «Diario Oficial de la UE» del BOE, que reproduce su texto):
 *   · Reglamento (CE) 2866/98, art. 1 (BOE DOUE-L-1998-82362): «1 euro = 166,386 pesetas
 *     españolas», en vigor el 01/01/1999. Los once tipos tienen SEIS cifras significativas
 *     (40,3399 · 1,95583 · 166,386 · 6,55957 · 0,787564 · 1 936,27 …).
 *   · Reglamento (CE) 1103/97 (BOE DOUE-L-1997-81104): art. 4.1, seis cifras significativas;
 *     art. 4.2, sin redondear ni truncar el tipo; art. 4.3, «No se utilizarán tipos inversos»;
 *     art. 5, los importes en euros al céntimo más próximo y, si el resultado cae justo en la
 *     mitad, al alza.
 *   · Ley 46/1998 (BOE-A-1998-29216), art. 11.1: euros al céntimo más próximo, pesetas a la
 *     peseta más próxima, la mitad exacta al alza. Art. 4.2: curso legal de la peseta hasta el
 *     28/02/2002; art. 24.1: canje en bancos hasta el 30/06/2002; art. 25: canje en el Banco
 *     de España hasta el 30/06/2021.
 *   · IPC: CSV de la tabla 24077 del INE. La media de los doce índices de 2025 da 100,0001
 *     (IPC_DATA: 100) y la de 2002, 60,0363 (IPC_DATA: 60,0363). Para 1985, los doce meses
 *     se reconstruyeron con el Actualizador de Rentas (ine.es/varipc, mes de 1985 → mismo mes
 *     de 2025): su media da 27,952 frente al 27,9389 del módulo, un 0,048 % por debajo, dentro
 *     del 0,055 % que declara la propia app en su DataReference.
 *
 * LOS CASOS NUEVOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR (los valores van literales
 * en cada test, con su cuenta al lado).
 * ══════════════════════════════════════════════════════════════════════════════════════ */

/** El botón «⇄», que es el único camino al sentido euros → pesetas. */
const botonInvertir = (page: Page) =>
  page.getByRole('button', { name: 'Cambiar dirección de la conversión' });

async function aEurosAPesetas(page: Page): Promise<void> {
  await botonInvertir(page).click();
  await expect(page.locator('label[for="cantidad-directa"]')).toHaveText('Cantidad en euros (€)');
}

/** El FAQPage tal como lo sirve el HTML (lo que leen buscadores y asistentes de IA). */
async function faqServido(page: Page): Promise<{ name: string; acceptedAnswer: { text: string } }[]> {
  const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
  for (const b of bloques) {
    const j = JSON.parse(b) as { '@type'?: string; mainEntity?: { name: string; acceptedAnswer: { text: string } }[] };
    if (j['@type'] === 'FAQPage' && j.mainEntity) return j.mainEntity;
  }
  throw new Error('El HTML no lleva ningún FAQPage');
}

const normalizar = (s: string) => s.replace(/[\s ]+/g, ' ').trim();

test.describe('Tercera inspección (27/10/2026) · casos que pasan', () => {
  test('CASO 6 · euros → pesetas con céntimos, y la vuelta devuelve el mismo importe', async ({ page }) => {
    await aEurosAPesetas(page);
    // El campo arranca en «100000»: escribir «2.500,75» lo mueve de verdad.
    await escribir(page, '#cantidad-directa', '2.500,75');
    // 2.500,75 × 166,386 = 416.089,7895 → a la peseta más próxima (art. 11.1 Ley 46/1998): 416.090
    expect(await texto(valorPrincipal(page))).toBe('416.090 ptas');
    // es-ES no agrupa las cuatro cifras enteras: «2500,75 €»
    expect(await texto(etiquetaPrincipal(page))).toBe('2500,75 € equivalen a:');

    // Y de vuelta: 416.090 ÷ 166,386 = 2.500,75126… → al céntimo, 2.500,75 €. Sin pérdida.
    await botonInvertir(page).click();
    await expect(page.locator('label[for="cantidad-directa"]')).toHaveText('Cantidad en pesetas');
    await escribir(page, '#cantidad-directa', '416.090');
    expect(await texto(valorPrincipal(page))).toBe('2500,75 €');
    expect(await texto(etiquetaPrincipal(page))).toBe('416.090 pesetas equivalen a:');
  });

  test('CASO 7 · la media peseta exacta se redondea al alza, como manda la ley', async ({ page }) => {
    await aEurosAPesetas(page);
    // 250 × 166,386 = 41.596,5 EXACTO (250 € es el menor importe que cae justo en la mitad:
    // con E céntimos, 166.386 × E ≡ 50.000 (mod 100.000) solo si E ≡ 25.000 (mod 50.000)). El art. 11.1
    // de la Ley 46/1998 y el art. 5 del Reglamento 1103/97 lo mandan a la cifra superior:
    // 41.597. Un redondeo «a la par» o un truncado darían 41.596.
    await escribir(page, '#cantidad-directa', '250');
    expect(await texto(valorPrincipal(page))).toBe('41.597 ptas');
    // 750 × 166,386 = 124.789,5 → 124.790
    await escribir(page, '#cantidad-directa', '750');
    expect(await texto(valorPrincipal(page))).toBe('124.790 ptas');
    // 0,01 × 166,386 = 1,66386 → 2 pesetas: un céntimo de euro vale casi dos pesetas.
    await escribir(page, '#cantidad-directa', '0,01');
    expect(await texto(valorPrincipal(page))).toBe('2 ptas');
  });

  test('CASO 8 · en el sentido euros → pesetas rechaza el negativo, el vacío y el texto', async ({ page }) => {
    await aEurosAPesetas(page);
    // «−100» lleva el signo menos tipográfico (U+2212), que parseSpanishNumber lee como «-».
    for (const malo of ['-5', '−100', '', 'abc']) {
      await escribir(page, '#cantidad-directa', malo);
      await expect(valorPrincipal(page)).toHaveCount(0);
      expect(await texto(aviso(page))).toBe('Introduce una cantidad válida para ver el resultado');
    }
  });

  test('CASO 9 · valor real hoy con un año intermedio y con los atajos de década', async ({ page }) => {
    await irAValorRealHoy(page);
    await escribir(page, '#cantidad-historica', '25.000');
    await selectorDeAño(page).selectOption('1990');
    // 25.000 ÷ 166,386 = 150,253026 → × (100 ÷ 38,2389) = 392,9324 → 392,93 €
    // inflación = (100 − 38,2389) ÷ 38,2389 × 100 = 161,5138 % · años = 2025 − 1990 = 35
    expect(await texto(valorPrincipal(page))).toBe('392,93 €');
    const tarjetas = page.locator('[class*="statCard"]');
    expect(await texto(tarjetas.nth(0))).toContain('150,25 €');
    expect(await texto(tarjetas.nth(1))).toContain('161,5');
    expect(await texto(tarjetas.nth(2))).toContain('35');
    expect(await texto(page.locator('[class*="interpretation"] p').first()))
      .toContain('25.000 pesetas de 1990 son 150,25 €');

    // Los atajos «Décadas habituales» MUEVEN el selector: se comprueba el valor que queda en
    // él y el resultado, que es lo que un atajo roto dejaría en el año anterior.
    await escribir(page, '#cantidad-historica', '100000');
    await page.getByRole('button', { name: '1970', exact: true }).click();
    await expect(selectorDeAño(page)).toHaveValue('1970');
    // 601,012104 × (100 ÷ 3,7873) = 15.869,1444 → 15.869,14 € · (100 − 3,7873) ÷ 3,7873 = 2540,40 %
    expect(await texto(valorPrincipal(page))).toBe('15.869,14 €');
    expect(await texto(tarjetas.nth(1))).toContain('2540,4');
    expect(await texto(tarjetas.nth(2))).toContain('55');

    await page.getByRole('button', { name: '2000', exact: true }).click();
    await expect(selectorDeAño(page)).toHaveValue('2000');
    // 601,012104 × (100 ÷ 55,9782) = 1.073,6539 → 1073,65 € · (100 − 55,9782) ÷ 55,9782 = 78,64 %
    expect(await texto(valorPrincipal(page))).toBe('1073,65 €');
    expect(await texto(tarjetas.nth(1))).toContain('78,6');
    expect(await texto(tarjetas.nth(2))).toContain('25');
  });

  test('942 · el FAQPage nombra el año que usa el motor: el último cerrado', async ({ page }) => {
    // Decía «el IPC del año actual» (hallazgo 942, REPARADO el 20/09/2026). El motor usa
    // IPC_DATA[IPC_MAX_YEAR], la media anual de 2025: el año en curso no tiene media publicada.
    const faq = await faqServido(page);
    const datos = faq.find((q) => q.name.startsWith('¿De dónde salen los datos'));
    expect(datos?.acceptedAnswer.text).toContain('IPC del último año cerrado');
    expect(datos?.acceptedAnswer.text).not.toContain('año actual');
  });
});

test.describe('Tercera inspección · a 390 px', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36',
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  test('CASO 10 · sin desborde lateral, «⇄» se toca y la cifra más larga cabe', async ({ page }) => {
    const anchoPagina = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(anchoPagina).toBeLessThanOrEqual(390);

    await botonInvertir(page).tap();
    await expect(page.locator('label[for="cantidad-directa"]')).toHaveText('Cantidad en euros (€)');
    await escribir(page, '#cantidad-directa', '999999999999');
    // 999.999.999.999 × 166,386 = 166.385.999.999.833,614 → 166.385.999.999.834 ptas
    expect(await texto(valorPrincipal(page))).toBe('166.385.999.999.834 ptas');
    const desborda = await valorPrincipal(page).evaluate((el) => el.scrollWidth > el.clientWidth);
    expect(desborda).toBe(false);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });
});

/* ── Hallazgos de la tercera inspección (27/10/2026), 3574-3581 ──────────────────────
 * Se escribieron con `test.fail()` y el valor CORRECTO; REPARADOS el mismo día en /reparar,
 * hoy son regresión.
 */

/** Contraste del texto de un elemento contra el píxel de fondo que tiene 6 px a su izquierda. */
async function contrasteContraFondo(page: Page, loc: Locator): Promise<number> {
  await loc.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0); // que ninguna tarjeta esté en :hover al medir
  const caja = await loc.boundingBox();
  if (!caja) throw new Error('El elemento no está maquetado');
  const png = await page.screenshot({
    clip: { x: Math.max(0, caja.x - 6), y: caja.y + caja.height / 2, width: 1, height: 1 },
  });
  return page.evaluate(
    async ({ b64, color }) => {
      const img = new Image();
      img.src = 'data:image/png;base64,' + b64;
      await img.decode();
      const lienzo = document.createElement('canvas');
      lienzo.width = img.width;
      lienzo.height = img.height;
      const ctx = lienzo.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      const [r, g, b] = Array.from(ctx.getImageData(0, 0, 1, 1).data);
      const lum = (c: number[]) => {
        const l = c.map((v) => {
          const x = v / 255;
          return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
        });
        return 0.2126 * l[0] + 0.7152 * l[1] + 0.0722 * l[2];
      };
      const texto = (color.match(/\d+/g) ?? []).slice(0, 3).map(Number);
      const l1 = lum(texto);
      const l2 = lum([r, g, b]);
      return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    },
    { b64: png.toString('base64'), color: await loc.evaluate((el) => getComputedStyle(el).color) },
  );
}

async function abrirGuia(page: Page): Promise<void> {
  await page.getByRole('button', { name: /Ver guía educativa/ }).click();
  await expect(page.locator('[class*="warningHeader"] h3')).toBeVisible();
}

test.describe('Tercera inspección · hallazgos reparados', () => {
  test('3574 · la etiqueta del sentido euros → pesetas nombra el importe tecleado, no uno redondeado', async ({ page }) => {
    // REPARADO: el rótulo lleva los decimales del importe (mínimo dos, el céntimo).
    // Es el gemelo del hallazgo 940 en el otro sentido, que su reparación no tocó. Un precio
    // unitario en euros lleva tres decimales (el litro de gasóleo, 1,455 €/l):
    //   1,455 × 166,386 = 242,0916 → 242 ptas (la cifra es CORRECTA)
    // pero el rótulo dice «1,46 € equivalen a: 242 ptas», y 1,46 × 166,386 = 242,9236 → 243.
    await aEurosAPesetas(page);
    await escribir(page, '#cantidad-directa', '1,455');
    expect(await texto(valorPrincipal(page))).toBe('242 ptas');
    expect(await texto(etiquetaPrincipal(page))).toBe('1,455 € equivalen a:');
    // 2,345 × 166,386 = 390,1752 → 390 ptas; con el rótulo «2,35 €» serían 391,0071 → 391.
    await escribir(page, '#cantidad-directa', '2,345');
    expect(await texto(valorPrincipal(page))).toBe('390 ptas');
    expect(await texto(etiquetaPrincipal(page))).toBe('2,345 € equivalen a:');
    // Y un importe de dos decimales se sigue rotulando con dos: 100 € → «100,00 € equivalen a:»
    await escribir(page, '#cantidad-directa', '100');
    expect(await texto(etiquetaPrincipal(page))).toBe('100,00 € equivalen a:');
  });

  test('3578 · la inflación acumulada separa el «%» con un espacio duro', async ({ page }) => {
    // REPARADO: la tarjeta, el featureList y IPC_META.nota llevan U+00A0 antes del %.
    // CLAUDE.md global §2 (25/09/2026): «15 %», separado con U+00A0.
    // 100.000 ptas de 1985: (100 − 27,9389) ÷ 27,9389 × 100 = 257,9239 → «+257,9 %».
    // ⚠️ Al repararlo, los `toContain('+257,9%')`, '+1394,5%', '+4610,8%' y '+72,4%' de los
    //    CASOS 4 y 4.bis, que fijan el formato pegado, tendrán que pasar a « %».
    await irAValorRealHoy(page);
    const bruto = (await page.locator('[class*="statCard"]').nth(1).textContent()) ?? '';
    expect(bruto).toContain('+257,9 %');
  });

  test('3577 · la fila «Fórmula» de la tabla educativa nombra el IPC que usa el motor', async ({ page }) => {
    // REPARADO: dice «IPC de 2025, último año cerrado», el que divide el motor.
    // El motor divide por IPC_DATA[2025] = 100, la media del último año cerrado, y así lo dicen
    // el FAQPage («IPC del último año cerrado») y la pantalla («en poder adquisitivo de 2025»).
    // Con el «IPC hoy» de la tabla —el último índice publicado por el INE, 104,978 en
    // septiembre de 2026 (tabla 24077)—, 100.000 ptas de 1985 darían 601,012104 × 104,978 ÷
    // 27,9389 = 2.258,25 €, y la fila «Ejemplo» de la misma tabla dice 2.151,17 €.
    const fila = page.locator('table tbody tr').filter({ hasText: 'Fórmula' });
    await expect(fila).not.toContainText('IPC hoy');
    await expect(fila).toContainText(/último año cerrado|IPC de \d{4}/);
  });

  test('3575 · la FAQ visible y el FAQPage dan la MISMA respuesta a la misma pregunta', async ({ page }) => {
    // REPARADO: las dos bocas leen PREGUNTAS_FRECUENTES de metadata.ts; ahora se comparan las seis.
    // La reparación es UNA constante en metadata.ts que importen las dos bocas (como
    // app/simulador-gastos-compraventa-garaje). Se comparan las preguntas que aparecen con el
    // MISMO enunciado en las dos; hoy, «¿Cuál es el tipo de cambio oficial de pesetas a euros?».
    const faq = await faqServido(page);
    const items = page.locator('[class*="faqItem"]');
    let comparadas = 0;
    for (const q of faq) {
      const item = items.filter({ has: page.locator('h4', { hasText: q.name }) });
      if ((await item.count()) === 0) continue;
      comparadas++;
      const visible = normalizar(
        (await item.first().locator('p:not([class*="faqTip"])').first().textContent()) ?? '',
      );
      expect(visible, `respuesta visible a «${q.name}»`).toBe(normalizar(q.acceptedAnswer.text));
    }
    expect(comparadas).toBe(6);
  });

  test('3576 · la FAQ «¿Por qué tantos decimales?» da la regla del Reglamento 1103/97', async ({ page }) => {
    // REPARADO: cita el art. 4.1 del Reglamento (CE) 1103/97, consultado en boe.es el 27/10/2026.
    // Art. 4.1 del Reglamento (CE) 1103/97: los tipos de conversión se fijan con SEIS cifras
    // significativas. Por eso 166,386 lleva tres decimales, 6,55957 cinco y 1 936,27 dos. La
    // respuesta de hoy dice «Por eso [por venir del ECU] cada moneda del euro tiene su propio
    // tipo fijo con distinto número de decimales».
    const item = page.locator('[class*="faqItem"]').filter({ hasText: 'tantos decimales' });
    await expect(item).toContainText('seis cifras significativas');
    await expect(item).not.toContainText('valor de mercado');
  });

  test('3579 · el título del recuadro de errores frecuentes se lee con contraste suficiente', async ({ page }) => {
    // REPARADO: #BF360C, 4,91:1 sobre el ámbar.
    // 16,8 px en negrita no es «texto grande» (14 pt = 18,66 px en negrita): pide 4,5:1.
    await abrirGuia(page);
    const ratio = await contrasteContraFondo(page, page.locator('[class*="warningHeader"] h3'));
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  test('3580 · en oscuro, el modo recomendado de cada escenario se lee con contraste suficiente', async ({ page }) => {
    // REPARADO: en oscuro el <code> usa --text-primary.
    // El tema se activa con el conmutador real, no sembrando data-theme (que puede no aplicar
    // el color-scheme y medir otra cosa).
    await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await abrirGuia(page);
    const ratio = await contrasteContraFondo(page, page.locator('[class*="escenarioExample"] code').first());
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  test('3581 · las tarjetas de fechas clave no simulan ser pulsables', async ({ page }) => {
    // REPARADO: sin cursor de mano ni elevación al pasar el ratón.
    const tarjeta = page.locator('[class*="timelineCard"]').first();
    const { cursor, interactiva } = await tarjeta.evaluate((el) => ({
      cursor: getComputedStyle(el).cursor,
      interactiva: el.matches('a, button, [role="button"], [tabindex]'),
    }));
    expect(interactiva).toBe(false);
    expect(cursor).not.toBe('pointer');
  });
});
