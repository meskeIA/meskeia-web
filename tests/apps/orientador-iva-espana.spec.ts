import { test, expect, Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';
import { PORCENTAJES_IVA, TIPOS_IVA } from '../../data/fiscal/iva';

/**
 * orientador-iva-espana — generado por /inspector el 24/09/2026.
 *
 * La app no calcula una liquidación: orienta. Para cada combinación (emito/recibo × España,
 * UE, fuera de la UE, Canarias/Ceuta/Melilla × bienes/servicios × empresa/particular) dice
 * qué mecanismo aplica, con qué base legal, y pinta la factura: base, cuota y total.
 *
 * DE DÓNDE SALE CADA CIFRA — de `data/fiscal/iva.ts` y del texto consolidado de la
 * Ley 37/1992 (BOE-A-1992-28740, consultado el 24/09/2026), NUNCA de lo que devuelve la app:
 *   · 21 %  → PORCENTAJES_IVA.general       = art. 90.Uno LIVA
 *   · 10 %  → PORCENTAJES_IVA.reducido      = art. 91.Uno LIVA
 *   · 4 %   → PORCENTAJES_IVA.superreducido = art. 91.Dos LIVA («entregas, adquisiciones
 *             intracomunitarias o importaciones», así que vale también para una AIB)
 *   · AIB: sujeto pasivo = quien la realiza (art. 85 LIVA) → autorrepercusión
 *   · Servicios B2C: art. 69.Uno.2.º (se localizan donde está el prestador) y su excepción
 *     del 69.Dos, que NO alcanza a destinatarios de Canarias, Ceuta o Melilla
 *   · Régimen OSS (régimen de la Unión): Sección 3.ª del Cap. XI del Título IX,
 *     arts. 163 unvicies a 163 quatervicies. El 163 quaterdecies es el criterio de caja.
 *
 *   · Canarias, Ceuta y Melilla quedan fuera del territorio de aplicación (art. 3.Dos.1.º). Solo
 *     los BIENES que se les envían son exportación exenta (art. 21); los servicios se localizan
 *     por los arts. 69-70: B2B no sujeto (69.Uno.1.º), B2C con IVA español (69.Uno.2.º).
 *
 * Los porcentajes se escriben «21 %», con espacio (formato español).
 *
 * `formatNumber` usa `toLocaleString('es-ES')`, que no agrupa los millares hasta las cinco
 * cifras: 1.250,04 sale «1250,04». Es la convención de la RAE y del resto del catálogo.
 */

const RUTA = '/orientador-iva-espana/';
const BASE = '#base-imponible';

const ACCION = '¿Qué haces en esta operación?';
const LUGAR = '¿Dónde está la otra parte?';
const NATURALEZA = '¿Qué entregas o contratas?';
const CLIENTE = '¿Quién es la otra parte?';
const TIPO = 'Tipo de IVA';

const ESPACIO_DURO = new RegExp(String.fromCharCode(160), 'g');
const limpiar = (s: string) => s.replace(ESPACIO_DURO, ' ').replace(/\s+/g, ' ').trim();

/** Pulsa el botón de un grupo segmentado y comprueba que queda marcado. */
async function elegir(page: Page, grupo: string, etiqueta: string): Promise<void> {
  const boton = page
    .getByRole('group', { name: grupo, exact: true })
    .getByRole('button', { name: new RegExp('^' + etiqueta.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')) });
  await boton.click();
  await expect(boton).toHaveAttribute('aria-pressed', 'true');
}

/** Escribe la base imponible y espera a que el estado de React la recoja. */
async function escribirBase(page: Page, valor: string): Promise<void> {
  await page.locator(BASE).fill(valor);
  await esperarValorEnReact(page, BASE, valor);
}

const resultado = (page: Page) => page.getByRole('region', { name: 'Resultado de la operación' });

/** Las tres filas de la factura visual: «Base imponible», «IVA …» y «Total factura». */
async function factura(page: Page): Promise<{ base: string; ivaEtiqueta: string; iva: string; total: string }> {
  const filas = await resultado(page).evaluate((sec) =>
    [...sec.querySelectorAll('div')]
      .filter((d) => d.children.length === 2 && d.children[0].tagName === 'SPAN' && d.children[1].tagName === 'SPAN')
      .map((d) => [(d.children[0] as HTMLElement).innerText, (d.children[1] as HTMLElement).innerText]),
  );
  const buscar = (prefijo: string) => {
    const f = filas.find(([etiqueta]) => limpiar(etiqueta).startsWith(prefijo));
    if (!f) throw new Error(`No hay fila «${prefijo}» en la factura`);
    return [limpiar(f[0]), limpiar(f[1])];
  };
  return {
    base: buscar('Base imponible')[1],
    ivaEtiqueta: buscar('IVA')[0],
    iva: buscar('IVA')[1],
    total: buscar('Total factura')[1],
  };
}

/** «-1.234,56 €» → -1234.56 ; «—» → 0 */
function importe(texto: string): number {
  if (texto === '—') return 0;
  const n = Number(texto.replace(/[^\d,-]/g, '').replace(',', '.'));
  if (!Number.isFinite(n)) throw new Error(`Importe ilegible: «${texto}»`);
  return n;
}

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await esperarHidratacion(page, [BASE]);
});

// ─────────────────────────────────────────────────────────────────────────────
test('caso normal: venta nacional B2B de bienes al 10 % sobre 12.500,40 €', async ({ page }) => {
  // Tipo reducido 10 % → PORCENTAJES_IVA.reducido (data/fiscal/iva.ts) = art. 91.Uno LIVA.
  // Cuota  = 12.500,40 × 10 % = 1.250,04 €  → «1250,04 €»
  // Total  = 12.500,40 + 1.250,04 = 13.750,44 €
  await elegir(page, ACCION, 'Emito la factura');
  await elegir(page, LUGAR, 'España');
  await elegir(page, NATURALEZA, 'Bienes');
  await elegir(page, CLIENTE, 'Empresa');
  await elegir(page, TIPO, '10 %');
  await escribirBase(page, '12.500,40');

  await expect(resultado(page).getByRole('heading', { level: 2 })).toHaveText('Operación interior — facturas con IVA');
  const f = await factura(page);
  expect(f.base).toBe('12.500,40 €');
  expect(f.ivaEtiqueta).toBe('IVA 10 %');
  expect(f.iva).toBe('1250,04 €');
  expect(f.total).toBe('13.750,44 €');
  await expect(resultado(page)).toContainText('Arts. 90-91 Ley 37/1992 del IVA.');
});

// ─────────────────────────────────────────────────────────────────────────────
test('caso límite: adquisición intracomunitaria de bienes al 4 %, autorrepercutida', async ({ page }) => {
  // AIB: el proveedor de la UE factura sin IVA y el adquirente es el sujeto pasivo (art. 85 LIVA).
  // El 4 % (PORCENTAJES_IVA.superreducido, art. 91.Dos LIVA) alcanza expresamente a las
  // «adquisiciones intracomunitarias».
  // Factura del proveedor: 25.000,00 € sin cuota → IVA «—», total 25.000,00 €.
  // Autorrepercusión en el 303 = 25.000 × 4 % = 1.000,00 € → «1000,00 €», efecto neto 0 €.
  await elegir(page, ACCION, 'Recibo la factura');
  await elegir(page, LUGAR, 'Resto de la UE');
  await elegir(page, NATURALEZA, 'Bienes');
  await elegir(page, CLIENTE, 'Empresa');
  await elegir(page, TIPO, '4 %');
  await escribirBase(page, '25.000');

  await expect(resultado(page).getByRole('heading', { level: 2 })).toHaveText('Adquisición intracomunitaria de bienes (B2B)');
  await expect(resultado(page)).toContainText('Inversión del sujeto pasivo');
  const f = await factura(page);
  expect(f.base).toBe('25.000,00 €');
  expect(f.ivaEtiqueta).toBe('IVA Autorrepercutes el 4 %');
  expect(f.iva).toBe('—');
  expect(f.total).toBe('25.000,00 €');
  await expect(resultado(page)).toContainText('Autorrepercutes 1000,00 € de IVA (4 %) en tu modelo 303');
  await expect(resultado(page)).toContainText('Efecto neto: 0 €.');
});

// ─────────────────────────────────────────────────────────────────────────────
// Hallazgo 1329 (reparado): una base ilegible ya no pasa a 0 en silencio.
test('entrada no numérica: aviso role="alert", sin NaN, factura a 0,00 € que cuadra', async ({ page }) => {
  await escribirBase(page, 'abc');
  const aviso = page.getByRole('alert').filter({ hasText: 'no es un importe válido' });
  await expect(aviso).toBeVisible();
  await expect(page.locator(BASE)).toHaveAttribute('aria-invalid', 'true');
  const f = await factura(page);
  expect(f.base).toBe('0,00 €');
  expect(f.iva).toBe('—');
  expect(f.total).toBe('0,00 €');
  await expect(resultado(page)).not.toContainText(/NaN|No definido/);
});

// ─────────────────────────────────────────────────────────────────────────────
// Hallazgo 1329 (reparado): antes, -500 al 21 % daba base -500,00 €, IVA «—» y total -605,00 €
// (la factura no cuadraba consigo misma). Ahora la base negativa se rechaza con aviso y la
// factura se pinta a 0: base + IVA = total.
test('base negativa -500 €: se rechaza con aviso y la factura cuadra (base + IVA = total)', async ({ page }) => {
  await elegir(page, ACCION, 'Emito la factura');
  await elegir(page, LUGAR, 'España');
  await elegir(page, TIPO, '10 %');
  await elegir(page, TIPO, '21 %');
  await escribirBase(page, '-500');

  await expect(page.getByRole('alert').filter({ hasText: 'no puede ser negativa' })).toBeVisible();
  const f = await factura(page);
  expect(importe(f.base) + importe(f.iva)).toBeCloseTo(importe(f.total), 2);
  expect(f.total).toBe('0,00 €');
  // La comparativa hereda la misma base: ninguna fila puede sumar una cuota negativa.
  await expect(page.getByRole('region', { name: 'Comparativa del mismo importe por ámbito' })).not.toContainText('-');

  // Y al corregir la base, el aviso desaparece: 500 × 21 % = 105,00 € → total 605,00 €.
  await escribirBase(page, '500');
  await expect(page.getByRole('alert').filter({ hasText: 'no puede ser negativa' })).toHaveCount(0);
  const g = await factura(page);
  expect(g.iva).toBe('105,00 €');
  expect(g.total).toBe('605,00 €');
});

// ─────────────────────────────────────────────────────────────────────────────
// Hallazgo 1327 (reparado): un servicio prestado a un PARTICULAR residente en Canarias, Ceuta o
// Melilla salía «Exenta (0 %)» por el art. 21 LIVA, que es la exención de las exportaciones de
// BIENES. La regla que aplica es el art. 69.Uno.2.º (servicio B2C: se localiza donde está el
// prestador), y la excepción del 69.Dos se cierra expresamente para estos territorios («salvo
// en el caso de que dicho destinatario esté establecido [...] en las Islas Canarias, Ceuta o
// Melilla»). Con 1.000 € al 21 % (art. 90.Uno): IVA 210,00 €, total 1210,00 €.
test('servicio a particular de Canarias: tributa con IVA español (art. 69.Uno.2.º y 69.Dos)', async ({ page }) => {
  await elegir(page, ACCION, 'Emito la factura');
  await elegir(page, LUGAR, 'Canarias');
  await elegir(page, NATURALEZA, 'Servicios');
  await elegir(page, CLIENTE, 'Particular');
  await elegir(page, TIPO, '10 %');
  await elegir(page, TIPO, '21 %');
  await escribirBase(page, '1.000,00');

  const f = await factura(page);
  expect(f.iva).toBe('210,00 €');
  expect(f.total).toBe('1210,00 €');
  await expect(resultado(page)).toContainText('Arts. 69.Uno.2.º y 69.Dos Ley 37/1992');
  await expect(resultado(page)).not.toContainText('Exenta (0 %)');
});

// Sospecha del 24/09/2026 (reparada ese día): el camino anterior afirmaba «IVA español» para
// cualquier servicio, y los prestados por vía electrónica a un particular que reside en Canarias
// los localiza en Canarias el art. 17.Uno.4 de la Ley 20/1991 del IGIC, esté donde esté el
// prestador (cotejado en el BOE, BOE-A-1991-14463). La app no los modela: tiene que decirlo.
test('servicio a particular de Canarias: avisa de que los servicios electrónicos tributan por IGIC (art. 17 Ley 20/1991)', async ({ page }) => {
  await elegir(page, ACCION, 'Emito la factura');
  await elegir(page, LUGAR, 'Canarias');
  await elegir(page, NATURALEZA, 'Servicios');
  await elegir(page, CLIENTE, 'Particular');
  await escribirBase(page, '1.000,00');

  await expect(resultado(page)).toContainText('art. 17 Ley 20/1991');
  await expect(resultado(page)).toContainText('tributan por IGIC, no por IVA');
  await expect(resultado(page)).toContainText('esta respuesta NO vale');
});

// Hallazgo 1327, lado B2B: sin IVA, pero por NO SUJECIÓN (art. 69.Uno.1.º), no por el art. 21.
test('servicio a empresa de Canarias: no sujeto por el art. 69.Uno.1.º, no exento por el art. 21', async ({ page }) => {
  await elegir(page, ACCION, 'Emito la factura');
  await elegir(page, LUGAR, 'Canarias');
  await elegir(page, NATURALEZA, 'Servicios');
  await elegir(page, CLIENTE, 'Empresa');
  await escribirBase(page, '1.000,00');

  const f = await factura(page);
  expect(f.ivaEtiqueta).toBe('IVA No sujeta');
  expect(f.iva).toBe('—');
  expect(f.total).toBe('1000,00 €');
  await expect(resultado(page)).toContainText('No sujeto / fuera de territorio');
  await expect(resultado(page)).toContainText('69.Uno.1.º Ley 37/1992');
  await expect(resultado(page)).not.toContainText('Exenta (0 %)');
});

// Hallazgo 1327, lo que sí era correcto: los BIENES enviados a Canarias son exportación exenta
// (art. 21.1.º) también cuando el comprador es un particular.
test('bienes a particular de Canarias: siguen siendo exportación exenta (art. 21)', async ({ page }) => {
  await elegir(page, ACCION, 'Emito la factura');
  await elegir(page, LUGAR, 'Canarias');
  await elegir(page, NATURALEZA, 'Bienes');
  await elegir(page, CLIENTE, 'Particular');
  await escribirBase(page, '1.000,00');

  const f = await factura(page);
  expect(f.ivaEtiqueta).toBe('IVA Exenta (0 %)');
  expect(f.total).toBe('1000,00 €');
  await expect(resultado(page)).toContainText('Arts. 3 y 21 Ley 37/1992');
});

// ─────────────────────────────────────────────────────────────────────────────
// Hallazgo 1328 (reparado): en «Emito · Fuera de la UE · Servicios» la app ignoraba si la otra
// parte es empresa o particular. Para un particular la regla general es IVA español
// (art. 69.Uno.2.º); fuera solo quedan los servicios de la lista del 69.Dos.
// 1.000 € al 21 % → IVA 210,00 €, total 1210,00 €. B2B: no sujeto, total 1000,00 €.
test('servicio a particular fuera de la UE: regla general IVA español (art. 69.Uno.2.º)', async ({ page }) => {
  await elegir(page, ACCION, 'Emito la factura');
  await elegir(page, LUGAR, 'Fuera de la UE');
  await elegir(page, NATURALEZA, 'Servicios');
  await elegir(page, TIPO, '10 %');
  await elegir(page, TIPO, '21 %');
  await escribirBase(page, '1.000,00');

  await elegir(page, CLIENTE, 'Empresa');
  const b2b = limpiar(await resultado(page).innerText());
  expect((await factura(page)).total).toBe('1000,00 €');

  await elegir(page, CLIENTE, 'Particular');
  const b2c = limpiar(await resultado(page).innerText());
  expect(b2c).not.toBe(b2b);
  const f = await factura(page);
  expect(f.iva).toBe('210,00 €');
  expect(f.total).toBe('1210,00 €');
  await expect(resultado(page)).toContainText('69.Dos');
});

// ─────────────────────────────────────────────────────────────────────────────
// Hallazgo 1330 (reparado): la base legal citaba «163 quaterdecies y ss.» como régimen OSS. En
// el texto consolidado del BOE el art. 163 quaterdecies es «Efectos de la renuncia o exclusión
// del régimen especial del criterio de caja»; el régimen de la Unión (OSS) son los arts. 163
// unvicies a 163 quatervicies, y el umbral de 10.000 € (UMBRAL_OSS.importe) lo fija el art. 73.
test('venta a distancia B2C a la UE: la base legal del OSS cita los artículos del régimen de la Unión', async ({ page }) => {
  await elegir(page, ACCION, 'Emito la factura');
  await elegir(page, LUGAR, 'Resto de la UE');
  await elegir(page, CLIENTE, 'Particular');

  await expect(resultado(page).getByRole('heading', { level: 2 })).toHaveText('Venta a distancia a particular de la UE (B2C)');
  await expect(resultado(page)).not.toContainText('163 quaterdecies');
  await expect(resultado(page)).toContainText('163 unvicies');
  await expect(resultado(page)).toContainText('73');
});

// ─────────────────────────────────────────────────────────────────────────────
// Hallazgo 1331 (reparado): los tipos que se muestran salen de data/fiscal/iva.ts, no de
// literales. El test lee el módulo y exige que la página diga lo mismo.
test('los tipos de IVA mostrados salen de data/fiscal (PORCENTAJES_IVA / TIPOS_IVA)', async ({ page }) => {
  const lista = TIPOS_IVA.map((t) => `${t.porcentaje} %`);
  const esperada = `${lista.slice(0, -1).join(', ')} o ${lista[lista.length - 1]}`;
  await elegir(page, ACCION, 'Emito la factura');
  await elegir(page, LUGAR, 'España');
  await expect(resultado(page)).toContainText(`Aplicar el tipo correcto del producto o servicio (${esperada})`);
  // El tipo marcado al cargar es el general.
  await expect(
    page.getByRole('group', { name: TIPO, exact: true }).getByRole('button', { name: new RegExp(`^${PORCENTAJES_IVA.general} %`) }),
  ).toHaveAttribute('aria-pressed', 'true');
});

// ═════════════════════════════════════════════════════════════════════════════
// Reinspección del 25/09/2026, tras 612a084f y ce66bcd1. Casos nuevos por el código que tocó
// la reparación, resueltos a mano con el texto consolidado del BOE descargado ese día:
//   · Ley 37/1992 (BOE-A-1992-28740): arts. 3.Dos, 21, 69, 70, 84.
//   · Ley 20/1991 del IGIC (BOE-A-1991-14463): art. 17.Tres.Uno.4.
// ═════════════════════════════════════════════════════════════════════════════

const comparativa = (page: Page) => page.getByRole('region', { name: 'Comparativa del mismo importe por ámbito' });

/** Filas de la tabla comparativa: [ámbito, IVA en factura, total, mecanismo], con los espacios limpios. */
async function filasComparativa(page: Page): Promise<string[][]> {
  const filas = await comparativa(page).evaluate((sec) =>
    [...sec.querySelectorAll('tbody tr')].map((tr) => [...tr.querySelectorAll('td')].map((td) => (td as HTMLElement).innerText)),
  );
  return filas.map((f) => f.map(limpiar));
}

// Art. 69.Uno.1.º: un servicio B2B se localiza en el TAI solo si el destinatario tiene allí su
// sede; Canarias está excluida del «interior del país» (art. 3.Dos.1.º b). El art. 70.Dos solo
// devuelve al TAI los servicios del 69.Dos a particulares y el alquiler de medios de transporte,
// así que un servicio general a una empresa canaria NO está sujeto al IVA español.
// Base 2.345,67 € (cuatro cifras enteras: «2345,67», sin punto de millar). Al 10 %
// (PORCENTAJES_IVA.reducido) la fila «España» de la comparativa da 234,567 → «234,57 €» y
// 2.580,237 → «2580,24 €».
test('servicio general a empresa de Canarias al 10 %: no sujeto (art. 69.Uno.1.º), el tipo no influye', async ({ page }) => {
  await elegir(page, ACCION, 'Emito la factura');
  await elegir(page, LUGAR, 'Canarias');
  await elegir(page, NATURALEZA, 'Servicios');
  await elegir(page, CLIENTE, 'Empresa');
  await elegir(page, TIPO, '10 %');
  await escribirBase(page, '2.345,67');

  await expect(resultado(page).getByRole('heading', { level: 2 })).toHaveText('Servicios a empresa de Canarias, Ceuta o Melilla (B2B)');
  const f = await factura(page);
  expect(f.base).toBe('2345,67 €');
  expect(f.ivaEtiqueta).toBe('IVA No sujeta');
  expect(f.iva).toBe('—');
  expect(f.total).toBe('2345,67 €');
  await expect(page.getByText('(no influye en este escenario)')).toBeVisible();
  await expect(resultado(page)).toContainText('Arts. 3 y 69.Uno.1.º Ley 37/1992 (no sujeción por reglas de localización).');

  const filas = await filasComparativa(page);
  expect(filas).toContainEqual(['España', '234,57 € (10 %)', '2580,24 €', 'IVA repercutido']);
  expect(filas).toContainEqual(['Canarias / Ceuta / Melilla', '—', '2345,67 €', 'No sujeto / fuera de territorio']);
});

// Servicio a un particular de Canarias: la cifra es la del servicio GENERAL (69.Uno.2.º, IVA
// español). Al 4 % (PORCENTAJES_IVA.superreducido) sobre 99,99 €: cuota 3,9996 → «4,00 €»,
// total 103,9896 → «103,99 €», y lo pintado cuadra (99,99 + 4,00 = 103,99).
// Los servicios ELECTRÓNICOS van por otro lado: el art. 70.Uno.4.º LIVA solo los pone en el TAI
// si el particular reside EN el TAI, el 70.Uno.8.º solo si reside en otro Estado miembro, y el
// art. 17.Tres.Uno.4 de la Ley 20/1991 los localiza en Canarias → IGIC. La app no tiene selector
// para ellos: tiene que avisarlo, y nombrar el IPSI para Ceuta y Melilla.
test('servicio a particular de Canarias al 4 % sobre 99,99 €: la factura cuadra y avisa de IGIC e IPSI', async ({ page }) => {
  await elegir(page, ACCION, 'Emito la factura');
  await elegir(page, LUGAR, 'Canarias');
  await elegir(page, NATURALEZA, 'Servicios');
  await elegir(page, CLIENTE, 'Particular');
  await elegir(page, TIPO, '4 %');
  await escribirBase(page, '99,99');

  const f = await factura(page);
  expect(f.base).toBe('99,99 €');
  expect(f.ivaEtiqueta).toBe('IVA 4 %');
  expect(f.iva).toBe('4,00 €');
  expect(f.total).toBe('103,99 €');
  expect(importe(f.base) + importe(f.iva)).toBeCloseTo(importe(f.total), 2);
  await expect(resultado(page)).toContainText('servicio electrónico');
  await expect(resultado(page)).toContainText('tributan por IGIC, no por IVA');
  await expect(resultado(page)).toContainText('IPSI');
});

// Art. 3.Dos.2.º y 3.º: Canarias queda fuera de la «Comunidad» (territorio tercero). Art. 21.1.º:
// la entrega de bienes que el vendedor expide fuera de la Comunidad está exenta.
// 15.000 € al 21 % (PORCENTAJES_IVA.general): en Canarias IVA «—» y total 15.000,00 €; la fila
// «España» de la comparativa, 3.150,00 € → «3150,00 €» y total «18.150,00 €».
test('bienes a empresa de Canarias al 21 % sobre 15.000 €: exportación exenta (art. 21), distinta de España', async ({ page }) => {
  await elegir(page, ACCION, 'Emito la factura');
  await elegir(page, LUGAR, 'Canarias');
  await elegir(page, NATURALEZA, 'Bienes');
  await elegir(page, CLIENTE, 'Empresa');
  await elegir(page, TIPO, '10 %');
  await elegir(page, TIPO, '21 %');
  await escribirBase(page, '15.000');

  await expect(resultado(page).getByRole('heading', { level: 2 })).toHaveText('Venta de bienes a Canarias, Ceuta o Melilla');
  await expect(resultado(page)).toContainText('Operación exenta');
  const f = await factura(page);
  expect(f.ivaEtiqueta).toBe('IVA Exenta (0 %)');
  expect(f.iva).toBe('—');
  expect(f.total).toBe('15.000,00 €');
  await expect(resultado(page)).toContainText('Arts. 3 y 21 Ley 37/1992');

  const filas = await filasComparativa(page);
  expect(filas).toContainEqual(['España', '3150,00 € (21 %)', '18.150,00 €', 'IVA repercutido']);
  expect(filas).toContainEqual(['Canarias / Ceuta / Melilla', '—', '15.000,00 €', 'Operación exenta']);
});

// Hallazgo 1329, bordes que el test de «-500» no cubre: la base VACÍA avisa (no pasa a 0 en
// silencio), un céntimo negativo también se rechaza, y el 0 es una base legítima sin aviso, que
// además no hace creer que el tipo «no influye» (la app sondea el escenario con base 1).
test('base vacía, «-0,01» y «0»: avisa en las dos primeras, acepta el cero sin aviso', async ({ page }) => {
  await elegir(page, ACCION, 'Emito la factura');
  await elegir(page, LUGAR, 'España');
  const aviso = page.locator('#base-aviso');

  await escribirBase(page, '');
  await expect(aviso).toHaveText('Escribe la base imponible (importe sin IVA) para ver cómo queda la factura.');
  await expect(page.locator(BASE)).toHaveAttribute('aria-invalid', 'true');
  let f = await factura(page);
  expect([f.base, f.iva, f.total]).toEqual(['0,00 €', '—', '0,00 €']);

  await escribirBase(page, '-0,01');
  await expect(aviso).toContainText('no puede ser negativa');
  f = await factura(page);
  expect(f.total).toBe('0,00 €');

  await escribirBase(page, '0');
  await expect(aviso).toHaveCount(0);
  await expect(page.locator(BASE)).not.toHaveAttribute('aria-invalid', 'true');
  f = await factura(page);
  expect([f.base, f.iva, f.total]).toEqual(['0,00 €', '—', '0,00 €']);
  await expect(page.getByText('(no influye en este escenario)')).toHaveCount(0);
  await expect(comparativa(page)).not.toContainText(/NaN|No definido|-0,00/);
});

// «De paso» de 612a084f: recibir un servicio de una empresa canaria. Art. 69.Uno.1.º: el
// destinatario empresario está en el TAI → se localiza en el TAI. Art. 84.Uno.2.º a): el prestador
// no está establecido en el TAI → el sujeto pasivo es el destinatario (la excepción a' no aplica,
// porque el destinatario SÍ está establecido). No es una importación: los servicios no pasan
// por la aduana. 3.000 € al 10 % → autorrepercusión 300,00 €, factura del proveedor 3000,00 €.
test('servicio recibido de empresa de Canarias al 10 %: inversión del sujeto pasivo (art. 84.Uno.2.º), no importación', async ({ page }) => {
  await elegir(page, ACCION, 'Recibo la factura');
  await elegir(page, LUGAR, 'Canarias');
  await elegir(page, NATURALEZA, 'Servicios');
  await elegir(page, CLIENTE, 'Empresa');
  await elegir(page, TIPO, '10 %');
  await escribirBase(page, '3.000');

  await expect(resultado(page).getByRole('heading', { level: 2 })).toHaveText('Servicios recibidos de Canarias, Ceuta o Melilla');
  // La insignia del mecanismo (el <span> que sigue al título), no el texto entero: el aviso
  // dice precisamente «no hay IVA a la importación».
  await expect(resultado(page).locator('h2 + span')).toHaveText('Inversión del sujeto pasivo');
  const f = await factura(page);
  expect(f.ivaEtiqueta).toBe('IVA Autorrepercutes el 10 %');
  expect(f.iva).toBe('—');
  expect(f.total).toBe('3000,00 €');
  await expect(resultado(page)).toContainText('Autorrepercutes 300,00 € de IVA (10 %) en tu modelo 303');
  await expect(resultado(page)).toContainText('Arts. 69.Uno.1.º y 84.Uno.2.º Ley 37/1992.');
});

// ─────────────────────────────────────────────────────────────────────────────
// HALLAZGO ABIERTO (25/09/2026): pct() (page.tsx:71) y los literales «Exenta (0 %)» separan el
// % con un espacio NORMAL (U+0020). La regla del 25/09/2026 (CLAUDE.md global §2) pide espacio
// duro U+00A0 para que el % no salte solo de línea; a 360 px ya salta en la comparativa.
// Se compara el carácter crudo con textContent: limpiar() y toContainText normalizarían el espacio.
test.fail('formato: el % de la factura va separado con espacio duro U+00A0', async ({ page }) => {
  await elegir(page, ACCION, 'Emito la factura');
  await elegir(page, LUGAR, 'España');
  await elegir(page, TIPO, '10 %');
  await elegir(page, TIPO, '21 %');
  const etiqueta = await resultado(page).locator('strong').first().textContent();
  expect(etiqueta).toBe(`${PORCENTAJES_IVA.general} %`);
});

// ─────────────────────────────────────────────────────────────────────────────
// HALLAZGO ABIERTO (25/09/2026): ce66bcd1 añadió al resultado «servicios a particular de
// Canarias» el aviso de que los servicios electrónicos tributan por IGIC (art. 17.Tres.Uno.4
// Ley 20/1991; art. 70.Uno.4.º LIVA solo los pone en el TAI si el particular reside en él),
// pero el pie de la comparativa (page.tsx:842-844) —y la FAQ, page.tsx:941-943, y el faqJsonLd,
// metadata.ts:89— siguen diciendo sin salvedad que a un particular de allí se le factura con
// IVA español. Pasa cuando el pie deja de afirmarlo o nombra la salvedad de los electrónicos.
test.fail('pie de la comparativa: «a un particular, con IVA español» salva los servicios electrónicos', async ({ page }) => {
  await elegir(page, ACCION, 'Emito la factura');
  await elegir(page, LUGAR, 'Canarias');
  await elegir(page, NATURALEZA, 'Servicios');
  await elegir(page, CLIENTE, 'Particular');
  const pie = limpiar(await comparativa(page).locator('p').last().innerText());
  expect(pie).toContain('Canarias');
  const afirmaIvaParticular = /particular, con IVA español/.test(pie);
  const salvaElectronicos = /electr[óo]nic/i.test(pie);
  expect(afirmaIvaParticular && !salvaElectronicos).toBe(false);
});
