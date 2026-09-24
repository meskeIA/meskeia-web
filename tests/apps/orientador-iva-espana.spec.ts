import { test, expect, Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

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
  await elegir(page, TIPO, '10%');
  await escribirBase(page, '12.500,40');

  await expect(resultado(page).getByRole('heading', { level: 2 })).toHaveText('Operación interior — facturas con IVA');
  const f = await factura(page);
  expect(f.base).toBe('12.500,40 €');
  expect(f.ivaEtiqueta).toBe('IVA 10%');
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
  await elegir(page, TIPO, '4%');
  await escribirBase(page, '25.000');

  await expect(resultado(page).getByRole('heading', { level: 2 })).toHaveText('Adquisición intracomunitaria de bienes (B2B)');
  await expect(resultado(page)).toContainText('Inversión del sujeto pasivo');
  const f = await factura(page);
  expect(f.base).toBe('25.000,00 €');
  expect(f.ivaEtiqueta).toBe('IVA Autorrepercutes el 4%');
  expect(f.iva).toBe('—');
  expect(f.total).toBe('25.000,00 €');
  await expect(resultado(page)).toContainText('Autorrepercutes 1000,00 € de IVA (4%) en tu modelo 303');
  await expect(resultado(page)).toContainText('Efecto neto: 0 €.');
});

// ─────────────────────────────────────────────────────────────────────────────
test('entrada no numérica: no sale NaN ni «No definido», la base queda a 0,00 €', async ({ page }) => {
  // parseSpanishNumber('abc') = NaN y la app lo convierte en 0 → base, total 0,00 €, IVA «—».
  await escribirBase(page, 'abc');
  const f = await factura(page);
  expect(f.base).toBe('0,00 €');
  expect(f.iva).toBe('—');
  expect(f.total).toBe('0,00 €');
  await expect(resultado(page)).not.toContainText(/NaN|No definido/);
});

// ─────────────────────────────────────────────────────────────────────────────
// HALLAZGO (24/09/2026): una base negativa se acepta sin aviso y la factura queda descuadrada
// consigo misma: la línea de IVA muestra «—» (solo pinta la cuota si es > 0) pero el total sí
// suma la cuota negativa. Con -500 al 21 %: base -500,00 €, IVA «—», total -605,00 €.
// Da igual cómo se repare —rechazar la base con aviso o pintar la cuota -105,00 €—: el test
// exige que total = base + IVA mostrado, y se pondrá verde en cuanto cuadre.
test.fail('caso a rechazar: base negativa -500 € → la factura debe cuadrar (base + IVA = total)', async ({ page }) => {
  await elegir(page, ACCION, 'Emito la factura');
  await elegir(page, LUGAR, 'España');
  await elegir(page, TIPO, '10%');
  await elegir(page, TIPO, '21%');
  await escribirBase(page, '-500');

  const f = await factura(page);
  expect(importe(f.base) + importe(f.iva)).toBeCloseTo(importe(f.total), 2);
});

// ─────────────────────────────────────────────────────────────────────────────
// HALLAZGO (24/09/2026): un servicio prestado a un PARTICULAR residente en Canarias, Ceuta o
// Melilla sale «Exenta (0 %)» por el art. 21 LIVA, que es la exención de las exportaciones de
// BIENES. La regla que aplica es el art. 69.Uno.2.º (servicio B2C: se localiza donde está el
// prestador), y la excepción del 69.Dos se cierra expresamente para estos territorios («salvo
// en el caso de que dicho destinatario esté establecido [...] en las Islas Canarias, Ceuta o
// Melilla»). Esperado con 1.000 € al 21 % (art. 90.Uno): IVA 210,00 €, total 1210,00 €.
test.fail('servicio a particular de Canarias: tributa con IVA español (art. 69.Uno.2.º y 69.Dos)', async ({ page }) => {
  await elegir(page, ACCION, 'Emito la factura');
  await elegir(page, LUGAR, 'Canarias');
  await elegir(page, NATURALEZA, 'Servicios');
  await elegir(page, CLIENTE, 'Particular');
  await elegir(page, TIPO, '10%');
  await elegir(page, TIPO, '21%');
  await escribirBase(page, '1.000,00');

  const f = await factura(page);
  expect(f.iva).toBe('210,00 €');
  expect(f.total).toBe('1210,00 €');
});

// ─────────────────────────────────────────────────────────────────────────────
// HALLAZGO (24/09/2026): en «Emito · Fuera de la UE · Servicios» la app ignora si la otra parte
// es empresa o particular y da en los dos casos el mismo resultado —«Sin IVA español»— con el
// texto «Por regla general, los servicios prestados a destinatarios establecidos fuera de la UE
// se localizan fuera». Para un particular la regla general es la contraria (art. 69.Uno.2.º:
// IVA español); fuera solo quedan los servicios de la lista del 69.Dos. El test exige que el
// escenario B2C no sea idéntico al B2B.
test.fail('servicio a particular fuera de la UE: no puede resolverse igual que el B2B (art. 69.Uno.2.º)', async ({ page }) => {
  await elegir(page, ACCION, 'Emito la factura');
  await elegir(page, LUGAR, 'Fuera de la UE');
  await elegir(page, NATURALEZA, 'Servicios');
  await escribirBase(page, '1.000,00');

  await elegir(page, CLIENTE, 'Empresa');
  const b2b = limpiar(await resultado(page).innerText());
  await elegir(page, CLIENTE, 'Particular');
  const b2c = limpiar(await resultado(page).innerText());

  expect(b2c).not.toBe(b2b);
});

// ─────────────────────────────────────────────────────────────────────────────
// HALLAZGO (24/09/2026): la base legal de la venta a distancia B2C a la UE cita
// «163 quaterdecies y ss.» como régimen OSS. En el texto consolidado del BOE el art. 163
// quaterdecies es «Efectos de la renuncia o exclusión del régimen especial del criterio de
// caja»; el régimen de la Unión (OSS) son los arts. 163 unvicies a 163 quatervicies, y el
// umbral de 10.000 € (UMBRAL_OSS.importe) lo fija el art. 73.
test.fail('venta a distancia B2C a la UE: la base legal del OSS cita los artículos del régimen de la Unión', async ({ page }) => {
  await elegir(page, ACCION, 'Emito la factura');
  await elegir(page, LUGAR, 'Resto de la UE');
  await elegir(page, CLIENTE, 'Particular');

  await expect(resultado(page).getByRole('heading', { level: 2 })).toHaveText('Venta a distancia a particular de la UE (B2C)');
  await expect(resultado(page)).not.toContainText('163 quaterdecies');
  await expect(resultado(page)).toContainText('163 unvicies');
});
