import { test, expect, type Locator, type Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact, sembrarValor, sembrarValorAcotado } from './_hidratacion';

/* ════════════════════════════════════════════════════════════════════════════════════════════
 * nombrador-compuestos-organicos — Inspector, primera inspección (15/11/2026)
 *
 * Cada nombre esperado se resolvió A MANO antes de abrir la app, con las reglas IUPAC que la propia
 * app dice seguir (recomendaciones de 2013) y que resume la «Brief Guide to the Nomenclature of
 * Organic Chemistry» de la IUPAC (Pure Appl. Chem. 92, 2020; PDF v1.1, junio de 2021, en iupac.org):
 *   · §7, numeración: «c. Lowest locant(s) for principal characteristic group(s); d. Lowest locants
 *     for 'ene', 'yne', and hydro prefixes; e. Lowest locants as a set for all substituents cited by
 *     prefixes; f. Lowest locants for the substituents in the order of citation».
 *   · §6 f.1, cadena principal: «Contains more atoms» (la cadena más larga manda).
 *   · Tabla 3, prioridad: ácidos > amidas > nitrilos > aldehídos > cetonas > alcoholes > aminas.
 * Los localizadores que la IUPAC omite (etanol, metanol, clorometano, etanamina) y el nombre de los
 * compuestos sin ambigüedad se cotejaron con los nombres IUPAC de PubChem (NLM): CID 702 «ethanol»,
 * 887 «methanol», 6327 «chloromethane», 6341 «ethanamine», 6360 «2-methylpropane», 12741
 * «decan-2-one», 180 «propan-2-one».
 * Fórmulas, contando enlaces a mano (4 por carbono).
 *
 * Los casos «HALLAZGO (15/11/2026, REPARADO)» fallaban en la inspección y se repararon el mismo
 * día en /reparar (hallazgos 4758-4770): ya no llevan test.fail(). Se añadieron comprobaciones de
 * control para lo que la reparación no debía romper (2-cloroetanol sigue con localizador, el
 * tercer clic en un carbono lleno quita los sustituyentes, «pentanona» pide el localizador).
 * ════════════════════════════════════════════════════════════════════════════════════════════ */

const RUTA = '/nombrador-compuestos-organicos/';
const LONGITUD = '#longitud';
const ENTRADA = '#nombre-entrada';
const INTERPRETACION = 'section[aria-label="Interpretación de un nombre"]';
/** En los casos ABIERTOS no se espera los 5 s del expect: hoy fallan seguro. */
const RAPIDO = { timeout: 1500 };

async function cargar(page: Page): Promise<void> {
  await page.goto(RUTA);
  await esperarHidratacion(page, [LONGITUD]);
}

async function pulsar(page: Page, nombre: string): Promise<void> {
  await page.getByRole('button', { name: nombre, exact: true }).click();
}

/** Pulsa el carbono N del dibujo: añade o quita el sustituyente seleccionado. */
async function carbono(page: Page, n: number): Promise<void> {
  await page.getByRole('button', { name: new RegExp(`^Carbono ${n} del dibujo:`) }).click();
}

function resultado(page: Page): Locator {
  return page.locator('section[aria-live="polite"]').filter({ hasText: 'Nombre IUPAC' });
}

function nombreIupac(page: Page): Locator {
  return resultado(page).locator('p').nth(1);
}

function clasico(page: Page): Locator {
  return resultado(page).locator('p', { hasText: 'Forma clásica' }).locator('strong');
}

/** El valor de una tarjeta de fórmula («Fórmula molecular», «Cadena principal»…) dentro de `ambito`. */
function tarjeta(ambito: Locator, etiqueta: string): Locator {
  return ambito.locator('span', { hasText: new RegExp(`^${etiqueta}$`) }).locator('xpath=following-sibling::span[1]');
}

async function abrirInterpretar(page: Page): Promise<void> {
  await page.getByRole('tab', { name: /Nombre → molécula/ }).click();
  await expect(page.locator(ENTRADA)).toBeVisible();
}

async function interpretar(page: Page, nombre: string): Promise<void> {
  await page.locator(ENTRADA).fill(nombre);
  await esperarValorEnReact(page, ENTRADA, nombre);
}

function respuesta(page: Page): Locator {
  return page.locator(INTERPRETACION).locator('div[aria-live="polite"]');
}

function errorInterpretacion(page: Page): Locator {
  return page.locator(INTERPRETACION).locator('p[role="alert"]');
}

const BIEN = 'El nombre está bien formulado.';

test.describe('Molécula → nombre e interpretación (inspector 15/11/2026)', () => {
  test.beforeEach(async ({ page }) => {
    await cargar(page);
  });

  test('CASO 1 (normal) · 6 C con el OH en el C5 del dibujo: hexan-2-ol; con un metilo en el C3, 4-metilhexan-2-ol', async ({ page }) => {
    // El OH en el C5 de 6: desde la derecha queda en 2 (frente a 5) → se invierte la numeración.
    // C₆H₁₄O: H = 3 + 1 (CH–OH) + 2·3 + 3 + 1 (del OH) = 14.
    await expect(nombreIupac(page)).toHaveText('hexan-2-ol');
    await expect(clasico(page)).toHaveText('2-hexanol');
    await expect(tarjeta(resultado(page), 'Fórmula molecular')).toHaveText('C₆H₁₄O');
    await expect(tarjeta(resultado(page), 'Fórmula semidesarrollada')).toHaveText('CH₃—CH(OH)—CH₂—CH₂—CH₂—CH₃');
    await expect(resultado(page)).toContainText('de derecha a izquierda');

    // Metilo en el C3 del dibujo → con la numeración invertida, localizador 7 − 3 = 4.
    // C₇H₁₆O: el metilo cambia un H por un CH₃.
    await pulsar(page, 'metil');
    await carbono(page, 3);
    await expect(nombreIupac(page)).toHaveText('4-metilhexan-2-ol');
    await expect(tarjeta(resultado(page), 'Fórmula molecular')).toHaveText('C₇H₁₆O');
    await expect(tarjeta(resultado(page), 'Fórmula semidesarrollada')).toHaveText('CH₃—CH(OH)—CH₂—CH(CH₃)—CH₂—CH₃');

    // El corrector da por buenos los nombres correctos, también la forma clásica sin sustituyentes
    await abrirInterpretar(page);
    await interpretar(page, '4-metilhexan-2-ol');
    await expect(respuesta(page)).toContainText(BIEN);
    await expect(tarjeta(respuesta(page), 'Cadena principal')).toHaveText('6 carbonos (hex-)');
    await expect(tarjeta(respuesta(page), 'Fórmula molecular')).toHaveText('C₇H₁₆O');
    // Ácido 3-metilbutanoico: (CH₃)₂CH–CH₂–COOH = C₅H₁₀O₂
    await interpretar(page, 'ácido 3-metilbutanoico');
    await expect(respuesta(page)).toContainText(BIEN);
    await expect(tarjeta(respuesta(page), 'Fórmula molecular')).toHaveText('C₅H₁₀O₂');
    await interpretar(page, '2-hexanol');
    await expect(respuesta(page)).toContainText(BIEN);
    // Un nombre mal numerado se corrige: el OH en 5 de 6 es el 2
    await interpretar(page, 'hexan-5-ol');
    await expect(respuesta(page)).toContainText('el nombre correcto es hexan-2-ol');
  });

  test('CASO 2 (límite) · 12 C (el máximo) con Cl, Br y dos metilos: los localizadores empatan y decide el orden alfabético', async ({ page }) => {
    // El deslizador no pasa de 12 (dodec-)
    expect(await sembrarValorAcotado(page, LONGITUD, 13)).toBe('12');
    await pulsar(page, 'Ninguno (hidrocarburo)');
    // Dibujo: Cl en C3, metilos en C5 y C8, Br en C10.
    //   Izquierda → {3, 5, 8, 10} · derecha → {13−10, 13−8, 13−5, 13−3} = {3, 5, 8, 10}: empate.
    //   Desempate: el primero en orden alfabético (bromo) lleva el número más bajo → derecha
    //   (Br en 3, no en 10). Alfabético sin el «di»: bromo, cloro, metil.
    // C₁₄H₂₈BrCl: la cadena tiene H = 3+2+1+2+1+2+2+1+2+1+2+3 = 22, más 2·3 de los metilos.
    await pulsar(page, 'cloro');
    await carbono(page, 3);
    await pulsar(page, 'metil');
    await carbono(page, 5);
    await carbono(page, 8);
    await pulsar(page, 'bromo');
    await carbono(page, 10);
    await expect(nombreIupac(page)).toHaveText('3-bromo-10-cloro-5,8-dimetildodecano');
    await expect(tarjeta(resultado(page), 'Fórmula molecular')).toHaveText('C₁₄H₂₈BrCl');
    await expect(tarjeta(resultado(page), 'Fórmula semidesarrollada')).toHaveText(
      'CH₃—CH₂—CH(Br)—CH₂—CH(CH₃)—CH₂—CH₂—CH(CH₃)—CH₂—CH(Cl)—CH₂—CH₃',
    );
    await expect(resultado(page)).toContainText('de derecha a izquierda');
    await expect(resultado(page)).toContainText('orden alfabético');
  });

  test('CASO 3 (rechazo) · un carbono con triple enlace en medio de la cadena no admite un sustituyente', async ({ page }) => {
    // Propino con el triple enlace C1≡C2: el C2 ya usa 3 enlaces con el C1 y 1 con el C3 = 4.
    // Un cloro en el C2 sería el quinto enlace.
    await sembrarValor(page, LONGITUD, 3);
    await pulsar(page, 'Un triple enlace (C≡C)');
    await pulsar(page, 'C1–C2');
    await pulsar(page, 'cloro');
    await carbono(page, 2);
    const aviso = page.locator('section[role="alert"]');
    await expect(aviso).toContainText('Esa molécula no puede existir');
    await expect(aviso).toContainText('El carbono 2 del dibujo se queda sin enlaces libres');
    await expect(resultado(page)).toHaveCount(0);

    // Y desde un nombre: una «propan-1-ona» sería el propanal; un «but-1-enal» tendría cinco
    // enlaces en el C1 (C=O, H, C=C); una terminación inventada no se reconoce.
    await abrirInterpretar(page);
    await interpretar(page, 'propan-1-ona');
    await expect(errorInterpretacion(page)).toContainText('Una cetona no puede estar en un carbono terminal');
    await interpretar(page, 'but-1-enal');
    await expect(errorInterpretacion(page)).toContainText('El carbono del grupo funcional ya tiene un enlace múltiple');
    await interpretar(page, 'hexanoxx');
    await expect(errorInterpretacion(page)).toContainText('No reconozco la terminación');
    await expect(respuesta(page)).toHaveCount(0);
  });
});

test.describe('Hallazgos de nomenclatura (inspector 15/11/2026)', () => {
  test.beforeEach(async ({ page }) => {
    await cargar(page);
  });

  test('HALLAZGO (15/11/2026, REPARADO) · escribe el localizador 1 que la IUPAC omite: «etan-1-ol», «metan-1-ol», «1-clorometano», y corrige «etanol»', async ({ page }) => {
    // PubChem (NLM): CID 702 «ethanol», 887 «methanol», 6327 «chloromethane», 6341 «ethanamine».
    // Con 1 o 2 carbonos y un solo sustituyente no hay otra posición: el localizador no se escribe.
    // Hoy: «etan-1-ol» (y forma clásica «1-etanol»), «metan-1-ol», «1-clorometano», y el corrector
    // responde a «etanol» que «el nombre correcto es etan-1-ol».
    await sembrarValor(page, LONGITUD, 2);
    await expect.soft(nombreIupac(page), '2 C con OH').toHaveText('etanol', RAPIDO);
    await sembrarValor(page, LONGITUD, 1);
    await expect.soft(nombreIupac(page), '1 C con OH').toHaveText('metanol', RAPIDO);
    await pulsar(page, 'Ninguno (hidrocarburo)');
    await pulsar(page, 'cloro');
    await carbono(page, 1);
    await expect.soft(nombreIupac(page), '1 C con Cl').toHaveText('clorometano', RAPIDO);

    await abrirInterpretar(page);
    for (const nombre of ['etanol', 'metanol', 'etanamina']) {
      await interpretar(page, nombre);
      await expect.soft(respuesta(page), nombre).toContainText(BIEN, RAPIDO);
    }
    // Control: con dos grupos en el etano el localizador sí hace falta (P-14.3.4.2 solo lo omite
    // cuando hay un único grupo): 2-cloroetan-1-ol, y el de un carbono con dos cloros, sin números.
    await interpretar(page, '2-cloroetan-1-ol');
    await expect(respuesta(page)).toContainText(BIEN);
    await interpretar(page, 'diclorometano');
    await expect(respuesta(page)).toContainText(BIEN);
    await expect(tarjeta(respuesta(page), 'Fórmula molecular')).toHaveText('CH₂Cl₂');
  });

  test('HALLAZGO (15/11/2026, REPARADO) · «2-penteno», la forma clásica que la propia app da al pent-2-eno, se «corrige» a pent-1-eno', async ({ page }) => {
    // 5 C con el doble enlace entre C2 y C3: pent-2-eno, y la app muestra como forma clásica
    // «2-penteno». El corrector lee el localizador clásico delante de la raíz solo para los grupos
    // funcionales (2-hexanol), no para el infijo -en-/-in-: hoy «2-penteno» → «el nombre correcto
    // es pent-1-eno» (CH₂=CH—CH₂—CH₂—CH₃), otra molécula. Igual «2-buteno» → but-1-eno.
    await sembrarValor(page, LONGITUD, 5);
    await pulsar(page, 'Ninguno (hidrocarburo)');
    await pulsar(page, 'Un doble enlace (C=C)');
    await pulsar(page, 'C2–C3');
    await expect(nombreIupac(page)).toHaveText('pent-2-eno');
    await expect(clasico(page)).toHaveText('2-penteno');
    await abrirInterpretar(page);
    await interpretar(page, '2-penteno');
    await expect.soft(tarjeta(respuesta(page), 'Fórmula semidesarrollada'), '2-penteno').toHaveText('CH₃—CH=CH—CH₂—CH₃', RAPIDO);
    await expect.soft(respuesta(page), '2-penteno').not.toContainText('pent-1-eno', RAPIDO);
    await interpretar(page, '2-buteno');
    await expect.soft(tarjeta(respuesta(page), 'Fórmula semidesarrollada'), '2-buteno').toHaveText('CH₃—CH=CH—CH₃', RAPIDO);
  });

  test('HALLAZGO (15/11/2026, REPARADO) · la raíz se busca como subcadena: «etanonitrilo» y «decanonitrilo» salen nonanonitrilo, «2-decanona» da error', async ({ page }) => {
    // «etanonitrilo» y «decanonitrilo» contienen «non» (eta-NON-itrilo), que se prueba antes que
    // «et» y «dec». Esperado: etanonitrilo = CH₃—C≡N, 2 C, C₂H₃N; decanonitrilo = 10 C, C₁₀H₁₉N
    // (H = 0 + 8·2 + 3); 2-decanona = decan-2-ona en forma clásica (PubChem CID 12741), C₁₀H₂₀O.
    // Hoy: las dos primeras «el nombre correcto es nonanonitrilo» (9 C, C₉H₁₇N) y la tercera
    // «Una cetona no puede estar en un carbono terminal».
    await abrirInterpretar(page);
    await interpretar(page, 'etanonitrilo');
    await expect.soft(tarjeta(respuesta(page), 'Cadena principal'), 'etanonitrilo').toHaveText('2 carbonos (et-)', RAPIDO);
    await expect.soft(tarjeta(respuesta(page), 'Fórmula molecular'), 'etanonitrilo').toHaveText('C₂H₃N', RAPIDO);
    await expect.soft(respuesta(page), 'etanonitrilo').toContainText(BIEN, RAPIDO);
    await interpretar(page, 'decanonitrilo');
    await expect.soft(tarjeta(respuesta(page), 'Fórmula molecular'), 'decanonitrilo').toHaveText('C₁₀H₁₉N', RAPIDO);
    await interpretar(page, '2-decanona');
    await expect.soft(errorInterpretacion(page), '2-decanona').toHaveCount(0, RAPIDO);
    await expect.soft(tarjeta(respuesta(page), 'Fórmula molecular'), '2-decanona').toHaveText('C₁₀H₂₀O', RAPIDO);
  });

  test('HALLAZGO (15/11/2026, REPARADO) · «2-etilbutano» sale bien formulado, y la propia FAQ lo pone de ejemplo de nombre mal elegido', async ({ page }) => {
    // FAQ de la app: «¿Por qué está mal el nombre 2-etilbutano? … la cadena principal es un pentano
    // y el nombre correcto es 3-metilpentano». IUPAC (Brief Guide §6 f.1): la cadena con más
    // átomos manda. El etilo en el C2 de un butano da 5 C seguidos. El aviso de la app solo mira
    // los extremos (C1 y Cn), así que no salta. Hoy: constructor «2-etilbutano» sin aviso, y el
    // corrector «✅ El nombre está bien formulado».
    await sembrarValor(page, LONGITUD, 4);
    await pulsar(page, 'Ninguno (hidrocarburo)');
    await pulsar(page, 'etil');
    await carbono(page, 2);
    const nombre = (await nombreIupac(page).textContent())?.trim();
    const avisa = /cadena principal/.test((await resultado(page).textContent()) ?? '');
    expect.soft(nombre === '3-metilpentano' || avisa, `constructor: «${nombre}» sin aviso`).toBe(true);

    await abrirInterpretar(page);
    await interpretar(page, '2-etilbutano');
    await expect.soft(respuesta(page), '2-etilbutano').not.toContainText(BIEN, RAPIDO);
    // Control: el nombre correcto pasa sin aviso.
    await interpretar(page, '3-metilpentano');
    await expect(respuesta(page)).toContainText(BIEN);
    await expect(respuesta(page)).not.toContainText('cadena principal');
  });

  test('HALLAZGO (15/11/2026, REPARADO) · lo que el corrector no entiende lo descarta en silencio: «clorometano» → metano, «metilpropano» → propano', async ({ page }) => {
    // El patrón de sustituyentes exige localizador: sin él, el prefijo se ignora; un localizador
    // que no cabe en la cadena se filtra; el del sufijo se recorta a n. Y aun así responde «Se
    // entiende a qué molécula te refieres». Esperado: clorometano CH₃Cl (PubChem CID 6327);
    // metilpropano = 2-metilpropano C₄H₁₀ (CID 6360); «7-metilhexano» y «pentan-6-ol» no tienen
    // ese carbono: se rechazan. Hoy: metano (CH₄), propano (C₃H₈), hexano y pentan-1-ol.
    await abrirInterpretar(page);
    await interpretar(page, 'clorometano');
    await expect.soft(tarjeta(respuesta(page), 'Fórmula molecular'), 'clorometano').toHaveText('CH₃Cl', RAPIDO);
    await interpretar(page, 'metilpropano');
    await expect.soft(tarjeta(respuesta(page), 'Fórmula molecular'), 'metilpropano').toHaveText('C₄H₁₀', RAPIDO);
    await interpretar(page, '7-metilhexano');
    await expect.soft(errorInterpretacion(page), '7-metilhexano').toBeVisible(RAPIDO);
    await interpretar(page, 'pentan-6-ol');
    await expect.soft(errorInterpretacion(page), 'pentan-6-ol').toBeVisible(RAPIDO);
  });

  test('HALLAZGO (15/11/2026, REPARADO) · la forma clásica con sustituyentes pierde el guion («4-metil2-hexanol») y el corrector rechaza la bien escrita', async ({ page }) => {
    // Forma clásica de 4-metilhexan-2-ol: 4-metil-2-hexanol (los localizadores se separan de las
    // letras con guion). Hoy: «4-metil2-hexanol», y el corrector responde a «4-metil-2-hexanol»
    // que «el nombre correcto es 4-metilhexan-2-ol», mientras da por bueno «2-hexanol».
    await pulsar(page, 'metil');
    await carbono(page, 3);
    await expect(nombreIupac(page)).toHaveText('4-metilhexan-2-ol');
    await expect.soft(clasico(page)).toHaveText('4-metil-2-hexanol', RAPIDO);
    await abrirInterpretar(page);
    await interpretar(page, '4-metil-2-hexanol');
    await expect.soft(respuesta(page)).toContainText(BIEN, RAPIDO);
  });

  test('HALLAZGO (15/11/2026, REPARADO) · el constructor no deja poner dos sustituyentes iguales en un carbono: 2,2-dimetilpropano no se puede montar', async ({ page }) => {
    // El C2 del propano tiene dos H libres. Pulsarlo dos veces con «metil» debería dar
    // 2,2-dimetilpropano (C₅H₁₂), que el corrector sí entiende; hoy el segundo clic QUITA el
    // primero y queda «propano». Tampoco 2,2,4-trimetilpentano ni 1,1,1-tricloroetano.
    await sembrarValor(page, LONGITUD, 3);
    await pulsar(page, 'Ninguno (hidrocarburo)');
    await pulsar(page, 'metil');
    await carbono(page, 2);
    await expect(nombreIupac(page)).toHaveText('2-metilpropano');
    await carbono(page, 2);
    await expect(nombreIupac(page)).toHaveText('2,2-dimetilpropano', RAPIDO);
    await expect(tarjeta(resultado(page), 'Fórmula molecular')).toHaveText('C₅H₁₂');
    // Control: el C2 ya no tiene hidrógenos libres; el tercer clic quita los dos metilos.
    await carbono(page, 2);
    await expect(nombreIupac(page)).toHaveText('propano');
  });

  test('HALLAZGO (15/11/2026, REPARADO) · «propanona» da «Una cetona no puede estar en un carbono terminal»', async ({ page }) => {
    // Con 3 C la única cetona posible es la del C2 (propan-2-ona, PubChem CID 180). El corrector
    // toma el C1 por defecto y acusa al alumno de algo que no escribió. Esperado: que la entienda
    // (y, si exige el localizador, que corrija a propan-2-ona). Igual «butanona».
    await abrirInterpretar(page);
    await interpretar(page, 'propanona');
    await expect.soft(errorInterpretacion(page)).toHaveCount(0, RAPIDO);
    await expect.soft(tarjeta(respuesta(page), 'Fórmula molecular')).toHaveText('C₃H₆O', RAPIDO);
    await interpretar(page, 'butanona');
    await expect(tarjeta(respuesta(page), 'Fórmula molecular')).toHaveText('C₄H₈O');
    // Control: con 5 carbonos el C=O cabe en el C2 o en el C3: sin localizador se pide.
    await interpretar(page, 'pentanona');
    await expect(errorInterpretacion(page)).toContainText('Falta el localizador de la cetona');
  });
});

test.describe('Textos y accesibilidad (inspector 15/11/2026)', () => {
  test.beforeEach(async ({ page }) => {
    await cargar(page);
  });

  test('HALLAZGO (15/11/2026, REPARADO) · aria-pressed de los carbonos marca el del grupo funcional, no si lleva el sustituyente', async ({ page }) => {
    // El botón añade o quita el sustituyente seleccionado («Carbono 5 del dibujo: añadir o quitar
    // metil»), pero su aria-pressed dice si es el carbono del grupo funcional. Por defecto (OH en el
    // C5, sin sustituyentes) el lector anuncia «pulsado» en el C5; tras poner un metilo en el C3,
    // el C3 sigue «no pulsado». Esperado: C5 sin «true» y C3 con «true».
    const c3 = page.getByRole('button', { name: /^Carbono 3 del dibujo:/ });
    const c5 = page.getByRole('button', { name: /^Carbono 5 del dibujo:/ });
    await pulsar(page, 'metil');
    await carbono(page, 3);
    await expect(nombreIupac(page)).toHaveText('4-metilhexan-2-ol');
    await expect.soft(c5).not.toHaveAttribute('aria-pressed', 'true', RAPIDO);
    await expect.soft(c3).toHaveAttribute('aria-pressed', 'true', RAPIDO);
  });

  test('HALLAZGO (15/11/2026, REPARADO) · el desempate alfabético dice «el bromoo recibe el número más bajo»', async ({ page }) => {
    // El motivo pega una «o» a la clave alfabética («metil» → «metilo»), y con los halógenos y el
    // nitro sale «bromoo», «cloroo», «fluoroo», «yodoo», «nitroo».
    await sembrarValor(page, LONGITUD, 5);
    await pulsar(page, 'Ninguno (hidrocarburo)');
    await pulsar(page, 'bromo');
    await carbono(page, 2);
    await pulsar(page, 'cloro');
    await carbono(page, 4);
    // {2,4} contra {2,4}: decide el bromo, que va antes → 2-bromo-4-cloropentano
    await expect(nombreIupac(page)).toHaveText('2-bromo-4-cloropentano');
    await expect(resultado(page)).not.toContainText('bromoo', RAPIDO);
  });

  test('HALLAZGO (15/11/2026, REPARADO) · «1 carbonos (met-)» en el corrector', async ({ page }) => {
    // Metanal (HCHO, sin localizador también para la app): la tarjeta «Cadena principal» dice
    // «1 carbonos». Esperado: «1 carbono (met-)».
    await abrirInterpretar(page);
    await interpretar(page, 'metanal');
    await expect(respuesta(page)).toContainText(BIEN);
    await expect(tarjeta(respuesta(page), 'Cadena principal')).toHaveText('1 carbono (met-)', RAPIDO);
  });

  test('HALLAZGO (15/11/2026, REPARADO) · «ocho grupos funcionales» y la app tiene siete más «Ninguno (hidrocarburo)»', async ({ page }) => {
    // featureList: «Ocho grupos funcionales con su orden de prioridad…»; «Hasta dónde llega»: «Un
    // grupo funcional principal de los ocho más frecuentes». Los botones del paso 2 son ácido,
    // amida, nitrilo, aldehído, cetona, alcohol, amina y «Ninguno (hidrocarburo)»: siete grupos.
    const grupos = page
      .locator('h2', { hasText: '2. El grupo funcional principal' })
      .locator('xpath=following-sibling::div[1]')
      .getByRole('button');
    const etiquetas = (await grupos.allTextContents()).map((t) => t.trim());
    const funcionales = etiquetas.filter((t) => !t.startsWith('Ninguno'));
    expect(funcionales).toHaveLength(7);
    const cuerpo = (await page.locator('body').textContent()) ?? '';
    const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).join(' ');
    expect.soft(/de los ocho más frecuentes/.test(cuerpo), 'bloque «Hasta dónde llega»').toBe(false);
    expect.soft(/Ocho grupos funcionales/.test(ld), 'featureList del JSON-LD').toBe(false);
  });

  test('HALLAZGO (15/11/2026, REPARADO) · «¿Por dónde se empieza a numerar?» está en las dos FAQ con respuestas distintas', async ({ page }) => {
    // FAQPage: «¿Por dónde se empieza a numerar la cadena principal?»; FAQ visible: «¿Por dónde
    // empiezo a numerar?», con una respuesta que resume la otra. Una sola constante (check:faq-unica).
    interface Pregunta { name: string; acceptedAnswer: { text: string } }
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = bloques.map((b) => JSON.parse(b) as { '@type'?: string; mainEntity?: Pregunta[] }).find((o) => o['@type'] === 'FAQPage');
    const ld = faq?.mainEntity?.find((q) => /empieza a numerar/.test(q.name))?.acceptedAnswer.text ?? '';
    expect(ld).not.toBe('');
    const visible = await page
      .locator('p', { hasText: '¿Por dónde empiezo a numerar?' })
      .locator('xpath=following-sibling::p[1]')
      .textContent();
    const normal = (t: string | null): string => (t ?? '').replace(/\s+/g, ' ').trim();
    expect(normal(visible)).toBe(normal(ld));
  });
});
