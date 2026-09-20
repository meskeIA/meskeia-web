import { test, expect, Locator, Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * Inspector — conversor-pesetas-euros (segmento CÁLCULO, riesgo 2, 122 usos/90 d)
 * Primera inspección: 18/09/2026 · RE-INSPECCIÓN: 20/09/2026 (invalidada por cambio de datos).
 *
 * QUÉ PROMETE LA APP
 *   · <h1> «Conversor de Pesetas a Euros» y subtítulo «Convierte al tipo oficial y descubre
 *     cuánto valdría esa cantidad hoy según la inflación». Son DOS promesas distintas y las
 *     dos se verifican aquí.
 *   · metadata.ts / FAQPage: «tipo de cambio oficial (166,386 ptas/€)», «fijado de forma
 *     irrevocable por el Reglamento (CE) 2866/98», y la fórmula literal del segundo modo:
 *     «valor hoy = (pesetas ÷ 166,386) × (IPC del año actual ÷ IPC del año de referencia)».
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
 * ── HALLAZGOS ABIERTOS de la re-inspección (20/09/2026) — NO se asertan aquí ──
 * El Inspector no repara, y un test que fijara la conducta defectuosa la volvería norma.
 * Quedan descritos para quien los repare:
 *
 *   A. La ETIQUETA redondea la cantidad a cero decimales mientras el cálculo usa el valor
 *      completo, así que la pantalla se contradice consigo misma. Con «1499,60» en modo
 *      «Conversión oficial» sale «1500 pesetas equivalen a: 9,01 €», y 1.500 pesetas son
 *      9,02 €. La CIFRA es correcta (1.499,60 ÷ 166,386 = 9,0128 → 9,01 €); lo que miente
 *      es el rótulo. Sale de `formatNumber(resultadoDirecta.cantidad, 0)`.
 *
 *   B. El botón «⇄» —único camino a la dirección euros → pesetas, que es la mitad de lo que
 *      prometen el <h1> y los `features` del jsonLd— no tiene `aria-label`: su nombre
 *      accesible es el propio glifo. Medido con el árbol de accesibilidad de Chromium, el
 *      `title` queda SUPERSEDED y baja a descripción, porque el contenido del botón gana.
 *      El CLAUDE.md §5 pide `aria-label` justo en este caso (botón cuyo único contenido es
 *      un signo). El candado `check:a11y-jsx` no lo ve: «⇄» (U+21C4) no está en su rango
 *      de emojis.
 *
 *   C. El FAQPage del jsonLd dice que la fórmula usa «el IPC del año actual», y el motor usa
 *      la media anual del último año CERRADO. A 20/09/2026 eso son dos cosas distintas: el
 *      INE ya publica hasta agosto de 2026 (índice 104,638 en base 2025), así que 100.000
 *      ptas de 1985 darían 2.250,94 € con el último dato publicado y la app da 2.151,17 €,
 *      un 4,64 % menos. En PANTALLA está bien dicho —el subtexto reza «en poder adquisitivo
 *      de 2025» y el FAQ visible habla del «año más reciente disponible»—; lo que promete de
 *      más es el dato estructurado, que es justo la señal que leen las IAs.
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
    // ⚠️ La etiqueta de esta pantalla dice hoy «1500 pesetas» (hallazgo A del encabezado):
    //    se comprueba la CIFRA, que es la correcta, no el rótulo, que está abierto.
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
    expect(await texto(tarjetas1975.nth(1))).toContain('+1394,5%');
    expect(await texto(tarjetas1975.nth(2))).toContain('50');

    // Y ahora el caso de referencia, moviendo los dos controles otra vez.
    await escribir(page, '#cantidad-historica', '100000');
    await selectorDeAño(page).selectOption('1985');

    // 100.000 ÷ 166,386 = 601,012104 → × (100 ÷ 27,9389) = 2.151,1712… → 2.151,17 €
    expect(await texto(valorPrincipal(page))).toBe('2151,17 €');
    const tarjetas1985 = page.locator('[class*="statCard"]');
    expect(await texto(tarjetas1985.nth(0))).toContain('601,01 €'); // conversión sin inflación
    expect(await texto(tarjetas1985.nth(1))).toContain('+257,9%');  // (100−27,9389)/27,9389
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
    expect(await texto(extremoViejo.nth(1))).toContain('+4610,8%');
    expect(await texto(extremoViejo.nth(2))).toContain('64');

    // 2001 es el último año seleccionable y el eslabón que estaba mal antes del 19/09/2026.
    // IPC 2001 = 57,9905 → 601,012104 × (100 ÷ 57,9905) = 1.036,3975… → 1.036,40 €
    // inflación = (100 − 57,9905) ÷ 57,9905 × 100 = 72,44…% · años = 24
    await selectorDeAño(page).selectOption('2001');
    expect(await texto(valorPrincipal(page))).toBe('1036,40 €');
    const extremoNuevo = page.locator('[class*="statCard"]');
    expect(await texto(extremoNuevo.nth(1))).toContain('+72,4%');
    expect(await texto(extremoNuevo.nth(2))).toContain('24');
  });

  test('el año más reciente del cálculo se dice en pantalla', async ({ page }) => {
    await irAValorRealHoy(page);
    // La app no promete «hoy» a secas: dice de qué año es el poder adquisitivo que usa.
    // Es lo que salva el hallazgo C del encabezado en la pantalla, aunque no en el jsonLd.
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
