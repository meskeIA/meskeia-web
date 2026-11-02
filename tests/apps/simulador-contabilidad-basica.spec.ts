/**
 * Test — /simulador-contabilidad-basica/ · casos para clase (19/10/2026)
 *
 * La tarea asignable que añadió la skill /casos-aula-meskeia: doce casos fijos y un modo
 * práctica, sobre `app/simulador-contabilidad-basica/casos.ts`, que mayoriza con la MISMA
 * `calcularMayor` de `motor.ts` que pinta la pestaña «Libro Mayor». La lógica se prueba sin
 * navegador; el último bloque registra un caso en el simulador y comprueba que el mayor da la
 * cifra del caso.
 *
 * LAS DOCE RESPUESTAS, resueltas a mano antes de ejecutar nada:
 *    1  Debe de Caja: aporte 8000 + venta al contado 600                         → 8600
 *    2  Haber de Caja: alquiler 700 + compra al contado 1200                     → 1900
 *    3  Saldo de Caja: (10.000 + 1200) − (2500 + 800) = 11.200 − 3300            → 7900 deudor
 *    4  Saldo de Banco: depósito 4000 − pago al proveedor 1500                   → 2500 deudor
 *    5  Saldo de Clientes: (3000 + 1200) − cobro 2500                            → 1700 deudor
 *    6  Saldo de Proveedores: (4500 + 800) − pago 3000 (el banco tiene 5000)     → 2300 acreedor
 *    7  Suma del diario: 12.000 + 7000 + 5000 + 900                              → 24.900
 *    8  Saldo de Ventas: 700 + 1500 + 300                                        → 2500 acreedor
 *    9  Saldo de Préstamos bancarios: 20.000 − 2000 − 2000                       → 16.000 acreedor
 *   10  Saldo de Caja: (9000 + 750) − (5000 + 600 + 1350) = 9750 − 6950          → 2800 deudor
 *   11  Saldo de Banco: cobro 1234,56 − pago 789,30                              → 445,26 deudor
 *   12  Saldo de Clientes: (2400 + 1800) − (1500 + 2400) = 4200 − 3900           → 300 deudor
 *
 * EL CONVENIO: el plan de cuentas y el método de inventario cambian de un país a otro. Solo se
 * pregunta por cuentas que salen igual con cualquiera (Caja, Banco, Clientes, Proveedores,
 * Ventas, Préstamos bancarios, Capital), y por la suma del diario solo sin mercaderías: con
 * inventario permanente, cada venta añade un asiento de costo de ventas. El test lo comprueba
 * con un mayor PROPIO que registra además ese asiento y llama a las mercaderías «Inventario».
 *
 * ERRORES CON NOMBRE (7.bis), a mano:
 *    3  total del Debe (11.200) o del Haber (3300) en vez del saldo; Debe + Haber = 14.500
 *    1  el Haber de Caja (1500) cuando se pide el Debe
 *    6  −2300: la cifra es esa, pero el saldo va sin signo
 */

import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';
import {
  CASOS,
  CUENTAS_PREGUNTABLES,
  TOTAL_CASOS,
  comprobarRespuesta,
  generarEjercicioAleatorio,
  importe,
  resolverCaso,
  type DatosCaso,
  type Operacion,
} from '../../app/simulador-contabilidad-basica/casos';

const RESUELTAS_A_MANO = [8600, 1900, 7900, 2500, 1700, 2300, 24900, 2500, 16000, 2800, 445.26, 300];

/**
 * Un libro mayor escrito aquí, no tomado de la app. Con `permanente`, cada venta registra además
 * la salida del inventario contra el costo de ventas (a un costo cualquiera, el 60 %), y las
 * mercaderías se llaman «Inventario»: el otro convenio legítimo.
 */
function mayorPropio(operaciones: readonly Operacion[], permanente: boolean): Map<string, { debe: number; haber: number }> {
  const m = new Map<string, { debe: number; haber: number }>();
  const anotar = (cuenta: string, debe: number, haber: number) => {
    const c = m.get(cuenta) ?? { debe: 0, haber: 0 };
    c.debe += debe;
    c.haber += haber;
    m.set(cuenta, c);
  };
  const merc = permanente ? 'Inventario' : 'Mercaderías';
  for (const { tipo, importe: x } of operaciones) {
    const par: Record<Operacion['tipo'], [string, string]> = {
      'aporte-capital': ['Caja', 'Capital'],
      'deposito-banco': ['Banco', 'Caja'],
      'compra-contado': [merc, 'Caja'],
      'compra-credito': [merc, 'Proveedores'],
      'venta-credito': ['Clientes', 'Ventas'],
      'venta-contado': ['Caja', 'Ventas'],
      'cobro-cliente': ['Banco', 'Clientes'],
      'pago-proveedor': ['Proveedores', 'Banco'],
      alquiler: ['Alquileres', 'Caja'],
      prestamo: ['Banco', 'Préstamos bancarios'],
      'devolucion-prestamo': ['Préstamos bancarios', 'Banco'],
    };
    const [d, h] = par[tipo];
    anotar(d, x, 0);
    anotar(h, 0, x);
    if (permanente && (tipo === 'venta-credito' || tipo === 'venta-contado')) {
      anotar('Costo de ventas', x * 0.6, 0);
      anotar('Inventario', 0, x * 0.6);
    }
  }
  return m;
}

function respuestaPropia(d: DatosCaso, permanente: boolean): number {
  const m = mayorPropio(d.operaciones, permanente);
  if (d.pregunta === 'suma-diario') return [...m.values()].reduce((s, c) => s + c.debe, 0);
  const c = m.get(d.cuenta ?? '') ?? { debe: NaN, haber: NaN };
  if (d.pregunta === 'total-debe') return c.debe;
  if (d.pregunta === 'total-haber') return c.haber;
  return Math.abs(c.debe - c.haber);
}

const red2 = (v: number): number => Math.round(v * 100) / 100;
const PRACTICAS = Array.from({ length: 40 }, (_, i) => generarEjercicioAleatorio(i + 1));
const TODOS = [
  ...CASOS.map((c) => ({ origen: `caso ${c.id}`, datos: c.datos, respuesta: c.respuesta, enunciado: c.enunciado, pasos: c.pasos })),
  ...PRACTICAS.map((e) => ({ origen: `semilla ${e.semilla}`, datos: e.datos, respuesta: e.respuesta, enunciado: e.enunciado, pasos: e.pasos })),
];

test.describe('casos para clase · lógica', () => {
  test('1 · doce casos con ids 1..12 sin huecos', () => {
    expect(TOTAL_CASOS).toBe(12);
    expect(CASOS.map((c) => c.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  test('2 · deterministas: dos resoluciones dan lo mismo', () => {
    for (const caso of CASOS) {
      const a = resolverCaso(caso.datos);
      const b = resolverCaso(caso.datos);
      expect(a.ok, `caso ${caso.id}: ${a.error ?? ''}`).toBe(true);
      expect(b.valor).toBe(a.valor);
      expect(b.pasos).toEqual(a.pasos);
    }
  });

  test('3 · la respuesta coincide con la resuelta a mano y con el mayor del test', () => {
    CASOS.forEach((caso, i) => {
      expect(caso.respuesta, `caso ${caso.id} frente a la cuenta a mano`).toBe(RESUELTAS_A_MANO[i]);
      expect(caso.respuesta, `caso ${caso.id} frente al mayor del test`).toBe(red2(respuestaPropia(caso.datos, false)));
    });
  });

  test('4 · cada caso tiene enunciado, etiqueta, respuesta positiva, desarrollo y pista', () => {
    for (const caso of CASOS) {
      expect(caso.enunciado.length, `caso ${caso.id}`).toBeGreaterThan(60);
      expect(caso.etiquetaRespuesta.trim(), `caso ${caso.id}`).not.toBe('');
      expect(Number.isFinite(caso.respuesta) && caso.respuesta > 0, `caso ${caso.id}`).toBe(true);
      expect(caso.pasos.length, `caso ${caso.id}`).toBeGreaterThanOrEqual(3);
      expect(caso.pista.trim(), `caso ${caso.id}`).not.toBe('');
      expect(caso.respuestaTexto, `caso ${caso.id}`).toContain('u.m.');
    }
    expect(new Set(CASOS.map((c) => c.categoria))).toEqual(new Set(['abstracto', 'aplicado']));
    expect(new Set(CASOS.map((c) => c.datos.pregunta)).size, 'los cuatro tipos de pregunta').toBe(4);
  });

  test('5 · ningún enunciado nombra un país, una ciudad, una moneda ni un impuesto', () => {
    const PROHIBIDO =
      /\b(España|Espana|México|Mexico|Colombia|Argentina|Perú|Peru|Chile|Uruguay|Madrid|Barcelona|Bogotá|Lima|euros?|dólares?|pesos (mexicanos|colombianos|argentinos|chilenos)|IVA|IGV|impuestos?)\b|€|\$/i;
    for (const t of TODOS) {
      expect(PROHIBIDO.test(t.enunciado), t.origen).toBe(false);
      expect(/\bESO\b/.test(t.enunciado), t.origen).toBe(false);
    }
  });

  test('5.bis · la solución acaba en la cifra de la casilla, y cada importe está escrito en el enunciado', () => {
    for (const t of TODOS) {
      const ultimo = t.pasos[t.pasos.length - 1].replace(/ /g, ' ');
      expect(ultimo, `${t.origen}: el último paso`).toContain(`${importe(t.respuesta)} u.m.`);
      for (const o of t.datos.operaciones) {
        expect(t.enunciado, `${t.origen}: el importe ${o.importe}`).toContain(`${importe(o.importe)} u.m.`);
      }
      expect(t.enunciado.match(/\d+\) /g)?.length, `${t.origen}: una frase por operación`).toBe(t.datos.operaciones.length);
      expect(/redondea/i.test(t.enunciado), `${t.origen}: los importes son exactos`).toBe(false);
    }
  });

  test('6 · el generador aleatorio es reproducible, variado, verosímil y usa la misma aritmética', () => {
    expect(generarEjercicioAleatorio(12345)).toEqual(generarEjercicioAleatorio(12345));
    expect(new Set(PRACTICAS.map((e) => e.respuesta)).size, 'respuestas distintas').toBeGreaterThanOrEqual(20);
    expect(new Set(PRACTICAS.map((e) => e.datos.pregunta)).size, 'tipos de pregunta').toBe(4);
    expect(new Set(PRACTICAS.map((e) => e.datos.cuenta).filter(Boolean)).size, 'cuentas').toBeGreaterThanOrEqual(4);
    for (const e of PRACTICAS) {
      expect(e.respuesta, `semilla ${e.semilla}`).toBe(red2(respuestaPropia(e.datos, false)));
      expect(e.respuesta, `semilla ${e.semilla}`).toBeGreaterThan(0);
      expect(comprobarRespuesta(e.respuesta, e.respuesta, e.datos).correcto, `semilla ${e.semilla}`).toBe(true);
    }
  });

  test('6.bis · verosímil, operación a operación: ni la caja ni el banco en descubierto, ni se cobra o paga de más', () => {
    // La primera versión del caso 6 pagaba 3000 a un proveedor desde un banco vacío.
    for (const t of TODOS) {
      for (let n = 1; n <= t.datos.operaciones.length; n++) {
        const m = mayorPropio(t.datos.operaciones.slice(0, n), false);
        for (const cuenta of ['Caja', 'Banco', 'Clientes']) {
          const c = m.get(cuenta);
          if (c) expect(c.debe - c.haber, `${t.origen}, operación ${n}: ${cuenta} en negativo`).toBeGreaterThanOrEqual(-1e-9);
        }
        for (const cuenta of ['Proveedores', 'Préstamos bancarios']) {
          const c = m.get(cuenta);
          if (c) expect(c.haber - c.debe, `${t.origen}, operación ${n}: ${cuenta} con saldo deudor`).toBeGreaterThanOrEqual(-1e-9);
        }
      }
      for (const p of t.pasos) expect(p, t.origen).not.toMatch(/\.\.$/);
    }
  });

  test('7 · convenio: la respuesta es la misma con inventario permanente y otros nombres de cuenta', () => {
    for (const t of TODOS) {
      if (t.datos.cuenta) expect(CUENTAS_PREGUNTABLES, t.origen).toContain(t.datos.cuenta);
      expect(red2(respuestaPropia(t.datos, true)), `${t.origen}: cambia con el otro convenio`).toBe(t.respuesta);
    }
    // Y lo exacto no admite margen: en contabilidad 1699 no es 1700
    const caso = (id: number) => CASOS[id - 1];
    expect(comprobarRespuesta(1699, caso(5).respuesta, caso(5).datos).correcto).toBe(false);
    expect(comprobarRespuesta(445.25, caso(11).respuesta, caso(11).datos).correcto).toBe(false);
    expect(comprobarRespuesta(445.26, caso(11).respuesta, caso(11).datos).correcto).toBe(true);
  });

  test('7.bis · el corrector: errores típicos con nombre, el signo y lo que no es número', () => {
    const caso = (id: number) => CASOS[id - 1];
    const motivo = (v: number, id: number) => comprobarRespuesta(v, caso(id).respuesta, caso(id).datos).motivo;
    expect(motivo(11200, 3)).toMatch(/total del Debe de Caja/);
    expect(motivo(3300, 3)).toMatch(/total del Haber de Caja/);
    expect(motivo(14500, 3)).toMatch(/DIFERENCIA/);
    expect(motivo(1500, 1)).toMatch(/va al Haber de Caja/);
    expect(motivo(-2300, 6)).toMatch(/sin signo/);
    expect(comprobarRespuesta(-2300, caso(6).respuesta, caso(6).datos).correcto).toBe(false);
    expect(motivo(NaN, 3)).not.toContain('NaN');
    expect(motivo(7901, 3)).toBe('No es correcto. Te has desviado 1,00 u.m. de la respuesta.');
  });

  test('7.ter · una sola implementación: la página toma el mayor de motor.ts', () => {
    const pagina = readFileSync('app/simulador-contabilidad-basica/page.tsx', 'utf8');
    expect(pagina).toMatch(/import \{[^}]*\bcalcularMayor\b[^}]*\} from '\.\/motor'/);
    expect(pagina).not.toMatch(/function calcularMayor/);
    expect(pagina).not.toContain('€');
  });
});

test.describe('casos para clase · en la página', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/simulador-contabilidad-basica/');
    await expect(page.locator('h1')).toContainText('Simulador de Contabilidad Básica');
    await esperarHidratacion(page, ['#casos-respuesta']);
  });

  test('se corrige el caso 5, avisa del Debe, y el Libro Mayor da la misma cifra', async ({ page }) => {
    const seccion = page.locator('section[aria-labelledby="casos-aula-titulo"]');
    await seccion.getByRole('button', { name: /^Caso 5:/ }).click();
    await expect(seccion.getByRole('button', { name: /^Caso 5:/ })).toHaveAttribute('aria-pressed', 'true');

    const casilla = seccion.locator('#casos-respuesta');
    await casilla.fill('4200');
    await seccion.getByRole('button', { name: 'Comprobar' }).click();
    await expect(seccion.getByRole('alert')).toContainText('total del Debe de Clientes');
    await casilla.fill('1700');
    await seccion.getByRole('button', { name: 'Comprobar' }).click();
    await expect(seccion.getByRole('alert')).toContainText('¡Correcto!');

    // Las tres operaciones del caso, registradas en el simulador como lo haría el alumno
    await page.getByRole('button', { name: 'Limpiar todo' }).click();
    const operaciones: [string, string, string][] = [
      ['Venta a crédito', 'Clientes', '3000'],
      ['Venta a crédito', 'Clientes', '1200'],
      ['Cobro por banco', 'Banco', '2500'],
    ];
    for (const [concepto, debe, cifra] of operaciones) {
      const haber = debe === 'Banco' ? 'Clientes' : 'Ventas';
      await page.getByRole('button', { name: 'Nuevo asiento' }).click();
      await page.getByLabel('Concepto').fill(concepto);
      await page.getByLabel('Cuenta línea 1').fill(debe);
      const importeDebe = page.getByLabel('Debe línea 1');
      await importeDebe.fill(cifra);
      await esperarValorEnReact(page, importeDebe, cifra);
      await page.getByLabel('Cuenta línea 2').fill(haber);
      await page.getByLabel('Haber línea 2').fill(cifra);
      await page.getByRole('button', { name: 'Guardar asiento' }).click();
    }
    await page.getByRole('tab', { name: /Libro Mayor/ }).click();
    const clientes = page.locator('[class*="cuentaT"]').filter({ hasText: /^Clientes/ }).first();
    // 4200 − 2500 = 1700, con dos decimales y sin agrupar las cuatro cifras (es-ES)
    await expect(clientes).toContainText('Saldo deudora: 1700,00');
    await expect(clientes).not.toContainText('€');
  });

  test('«Practicar» da un ejercicio y lo que no es número no enseña NaN', async ({ page }) => {
    const seccion = page.locator('section[aria-labelledby="casos-aula-titulo"]');
    const practicar = seccion.getByRole('button', { name: 'Practicar' });
    await practicar.click();
    await expect(practicar).toHaveAttribute('aria-pressed', 'true');
    await expect(seccion.getByRole('heading', { name: 'Ejercicio de práctica' })).toBeVisible();
    await seccion.getByRole('button', { name: 'Comprobar' }).click();
    await expect(seccion.getByRole('alert')).toContainText('Escribe un número');
    await expect(seccion.getByRole('alert')).not.toContainText('NaN');
  });
});

/* ═══════════════════════════════════════════════════════════════════════════════════════════
 * Inspector, primera inspección (02/11/2026): el simulador en sí —formulario, diario y mayor—,
 * y el cabo C0542 (la fecha que propone el formulario).
 *
 * Esperados resueltos a mano ANTES de ejecutar:
 *
 *   CASO 1 (normal) · los tres ejemplos + «Cobro parcial de un cliente»: Banco Debe «1.234,56» /
 *   Clientes Haber «1234,56» (el mismo importe escrito con y sin punto de millar).
 *     Formulario: Debe 1234,56 = Haber 1234,56 → «Equilibrado».
 *     Mayor: Caja D 10.000,00 H 500,00 → 9500,00 deudor · Capital H 10.000,00 → acreedor ·
 *     Clientes D 2000,00 H 1234,56 → 765,44 deudor · Banco 1234,56 deudor.
 *     Cuadre: deudores 9500 + 500 + 765,44 + 1234,56 = 12.000 = acreedores 10.000 + 2000.
 *
 *   CASO 2 (límite) · Banco Debe 9500 / Caja Haber 9500 → Caja D 10.000,00 H 10.000,00, saldo 0,00:
 *     la cuenta queda SALDADA, ni deudora ni acreedora (la app escribe «Saldo deudora: 0,00»).
 *
 *   CASO 3 (rechazo) · Caja Debe «1.500» / Capital Haber «1.000» → «El asiento no cuadra: Debe
 *     1500,00 ≠ Haber 1000,00. La diferencia es 500,00.» y el diario sigue con 3 asientos.
 *     Y lo que también debería rechazar y hoy guarda (HALLAZGOS ABIERTOS):
 *       · tercera línea SIN cuenta con 50 al Debe (Caja D 100, Capital H 150): cuadra 150 = 150 en
 *         el formulario, pero el mayor descarta la línea y queda Caja 100 deudor / Capital 150
 *         acreedor: el mayor ya no cuadra.
 *       · importes «100 u.m.» (no son número), vacíos o «−500»: se guardan como 0 o en negativo.
 *
 *   C0542 · la fecha propuesta sale de new Date().toISOString(), que es la fecha UTC:
 *       México (UTC−6), 02/11/2026 20:30 = 2026-11-03T02:30Z → esperado 2026-11-02 · da 2026-11-03.
 *       Madrid (UTC+1), 02/11/2026 00:30 = 2026-11-01T23:30Z → esperado 2026-11-02 · da 2026-11-01.
 *     La parte «fecha del build» NO se confirma: el formulario no está en el HTML prerenderizado
 *     (nace con mostrarFormulario = false) y el inicializador de useState se vuelve a ejecutar al
 *     hidratar, con el reloj del usuario: con el reloj en 2027-03-15 propone 2027-03-15.
 * ═══════════════════════════════════════════════════════════════════════════════════════════ */

interface Linea {
  cuenta?: string;
  debe?: string;
  haber?: string;
}

const diario = (page: Page) => page.locator('section[aria-label="Libro Diario"] article');
const formulario = (page: Page) => page.locator('[class*="formularioCard"]');

/** Una cuenta T del mayor por su nombre exacto. Las clases salen «<hash>_cuentaT» en el build y
 * «…__cuentaT» en dev: las dos acaban en «_cuentaT». */
function cuentaT(page: Page, nombre: string) {
  return page
    .locator('[class$="_cuentaT"]')
    .filter({ has: page.locator('[class$="_cuentaTNombre"]', { hasText: new RegExp(`^${nombre}$`) }) });
}

/** Rellena y guarda un asiento como lo haría el alumno; no comprueba si se guardó. */
async function registrar(page: Page, concepto: string, lineas: Linea[]): Promise<void> {
  await page.getByRole('tab', { name: /Libro Diario/ }).click();
  await page.getByRole('button', { name: 'Nuevo asiento' }).click();
  for (let i = 2; i < lineas.length; i++) await page.getByRole('button', { name: 'Añadir línea' }).click();
  await page.getByLabel('Concepto').fill(concepto);
  for (let i = 0; i < lineas.length; i++) {
    const { cuenta, debe, haber } = lineas[i];
    if (cuenta) await page.getByLabel(`Cuenta línea ${i + 1}`).fill(cuenta);
    if (debe) {
      const campo = page.getByLabel(`Debe línea ${i + 1}`);
      await campo.fill(debe);
      await esperarValorEnReact(page, campo, debe);
    }
    if (haber) {
      const campo = page.getByLabel(`Haber línea ${i + 1}`);
      await campo.fill(haber);
      await esperarValorEnReact(page, campo, haber);
    }
  }
  await page.getByRole('button', { name: 'Guardar asiento' }).click();
}

test.describe('simulador · diario y mayor (Inspector 02/11/2026)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/simulador-contabilidad-basica/');
    await expect(page.locator('h1')).toContainText('Simulador de Contabilidad Básica');
    await esperarHidratacion(page, ['#casos-respuesta']);
  });

  test('CASO 1 (normal) · un cobro de 1.234,56 cuadra y el mayor da Clientes 765,44 deudor', async ({ page }) => {
    await page.getByRole('button', { name: 'Nuevo asiento' }).click();
    await page.getByLabel('Concepto').fill('Cobro parcial de un cliente');
    await page.getByLabel('Cuenta línea 1').fill('Banco');
    await page.getByLabel('Debe línea 1').fill('1.234,56');
    await page.getByLabel('Cuenta línea 2').fill('Clientes');
    const haber = page.getByLabel('Haber línea 2');
    await haber.fill('1234,56');
    await esperarValorEnReact(page, haber, '1234,56');
    // «1.234,56» y «1234,56» son el mismo importe: el formulario ya lo da por equilibrado
    await expect(formulario(page)).toContainText('Debe: 1234,56');
    await expect(formulario(page)).toContainText('Haber: 1234,56');
    await expect(formulario(page)).toContainText('Equilibrado');
    await page.getByRole('button', { name: 'Guardar asiento' }).click();

    await expect(diario(page)).toHaveCount(4);
    const nuevo = diario(page).last();
    await expect(nuevo.locator('tfoot')).toHaveText(/Total\s*1234,56\s*1234,56/);
    await expect(nuevo.getByRole('alert')).toHaveCount(0);

    await page.getByRole('tab', { name: /Libro Mayor/ }).click();
    const saldo = (c: string) => cuentaT(page, c).locator('[class*="_cuentaTSaldo"]');
    // 2000 − 1234,56 = 765,44 · los demás, de los ejemplos (cuatro cifras sin punto, es-ES)
    await expect(saldo('Clientes')).toHaveText(/: 765,44$/);
    await expect(saldo('Clientes')).toHaveClass(/_saldoDeudor/);
    await expect(saldo('Banco')).toHaveText(/: 1234,56$/);
    await expect(saldo('Banco')).toHaveClass(/_saldoDeudor/);
    await expect(saldo('Caja')).toHaveText(/: 9500,00$/);
    await expect(saldo('Capital')).toHaveText(/: 10\.000,00$/);
    await expect(saldo('Capital')).toHaveClass(/_saldoAcreedor/);
    await expect(saldo('Ingresos por Servicios')).toHaveClass(/_saldoAcreedor/);
    await expect(cuentaT(page, 'Clientes').locator('[class$="_cuentaTTotal"]')).toHaveText([/2000,00$/, /1234,56$/]);
  });

  test('CASO 2 (límite) · Caja vaciada en el banco: 10.000,00 a cada lado y saldo 0,00', async ({ page }) => {
    await registrar(page, 'Ingreso de la caja en el banco', [
      { cuenta: 'Banco', debe: '9500' },
      { cuenta: 'Caja', haber: '9500' },
    ]);
    await expect(diario(page)).toHaveCount(4);
    await page.getByRole('tab', { name: /Libro Mayor/ }).click();
    const caja = cuentaT(page, 'Caja');
    await expect(caja.locator('[class$="_cuentaTTotal"]')).toHaveText([/10\.000,00$/, /10\.000,00$/]);
    await expect(caja.locator('[class*="_cuentaTSaldo"]')).toHaveText(/: 0,00/);
  });

  test('CASO 3 (rechazo) · un asiento descuadrado no se guarda y dice la diferencia', async ({ page }) => {
    await registrar(page, 'Descuadre', [
      { cuenta: 'Caja', debe: '1.500' },
      { cuenta: 'Capital', haber: '1.000' },
    ]);
    await expect(formulario(page).getByRole('alert')).toHaveText(
      /El asiento no cuadra: Debe 1500,00 ≠ Haber 1000,00\. La diferencia es 500,00\./,
    );
    await expect(diario(page)).toHaveCount(3);
  });

  test('CASO 3.bis (rechazo) · sin concepto no se guarda', async ({ page }) => {
    await page.getByRole('button', { name: 'Nuevo asiento' }).click();
    await page.getByLabel('Cuenta línea 1').fill('Caja');
    await page.getByLabel('Debe línea 1').fill('10');
    await page.getByLabel('Cuenta línea 2').fill('Capital');
    await page.getByLabel('Haber línea 2').fill('10');
    await page.getByRole('button', { name: 'Guardar asiento' }).click();
    await expect(formulario(page).getByRole('alert')).toContainText('El concepto del asiento es obligatorio.');
    await expect(diario(page)).toHaveCount(3);
  });

  test('HALLAZGO (02/11/2026, ABIERTO) · una línea con importe y sin cuenta cuadra el asiento y el mayor la descarta', async ({ page }) => {
    // Caja D 100 · Capital H 150 · tercera línea sin cuenta D 50. totalLineas suma las TRES líneas
    // (150 = 150) y calcularMayor salta la que no tiene cuenta: el mayor queda Caja 100 deudor y
    // Capital 150 acreedor, sin cuadrar. Esperado: no se guarda y avisa de la línea sin cuenta.
    test.fail();
    await page.getByRole('button', { name: 'Limpiar todo' }).click();
    await registrar(page, 'Línea sin cuenta', [
      { cuenta: 'Caja', debe: '100' },
      { cuenta: 'Capital', haber: '150' },
      { debe: '50' },
    ]);
    await expect(diario(page)).toHaveCount(0);
    await expect(formulario(page).getByRole('alert')).toBeVisible();
  });

  test('HALLAZGO (02/11/2026, ABIERTO) · «100 u.m.» no es un importe y el asiento se guarda a 0', async ({ page }) => {
    // parseSpanishNumber('100 u.m.') es NaN; totalLineas lo cuenta como 0 a los dos lados, 0 = 0 y
    // se guarda: el diario pinta «No definido» en el Debe y el Haber, con Total 0,00, y el mayor no
    // lo recoge. Esperado: no se guarda y dice qué importe no se entiende.
    test.fail();
    await page.getByRole('button', { name: 'Limpiar todo' }).click();
    await registrar(page, 'Importe con unidad', [
      { cuenta: 'Caja', debe: '100 u.m.' },
      { cuenta: 'Capital', haber: '100 u.m.' },
    ]);
    await expect(diario(page)).toHaveCount(0);
    await expect(formulario(page).getByRole('alert')).toBeVisible();
  });

  test('HALLAZGO (02/11/2026, ABIERTO, el mismo de «100 u.m.») · un asiento sin ningún importe se guarda', async ({ page }) => {
    // Caja y Capital sin importes: 0 = 0 y se guarda con Total 0,00 (el propio formulario no le pone
    // «Equilibrado», que exige un total mayor que 0). Esperado: no se guarda.
    test.fail();
    await page.getByRole('button', { name: 'Limpiar todo' }).click();
    await registrar(page, 'Asiento sin importes', [{ cuenta: 'Caja' }, { cuenta: 'Capital' }]);
    await expect(diario(page)).toHaveCount(0);
    await expect(formulario(page).getByRole('alert')).toBeVisible();
  });

  test('HALLAZGO (02/11/2026, ABIERTO, el mismo de «100 u.m.») · «-500» al Debe y al Haber se guarda y la cuenta T no lo enseña', async ({ page }) => {
    // −500 = −500 y se guarda. En el mayor, Caja tiene Total del Debe −500,00 sin ningún movimiento
    // a la vista (las columnas filtran > 0) y «Saldo acreedora: 500,00»; Capital, deudora.
    // Esperado: un importe del Debe o del Haber es positivo (el sentido lo da la columna): no se guarda.
    test.fail();
    await page.getByRole('button', { name: 'Limpiar todo' }).click();
    await registrar(page, 'Importes negativos', [
      { cuenta: 'Caja', debe: '-500' },
      { cuenta: 'Capital', haber: '-500' },
    ]);
    await expect(diario(page)).toHaveCount(0);
    await expect(formulario(page).getByRole('alert')).toBeVisible();
  });

  test('HALLAZGO (02/11/2026, ABIERTO) · «Saldo deudora»: el saldo es masculino, y uno de 0,00 no es deudor', async ({ page }) => {
    // page.tsx L476 escribe «Saldo {naturaleza}:» con naturaleza en femenino (la de la cuenta).
    // Esperado «Saldo deudor: 9500,00» para Caja; y Caja a 0,00 (CASO 2) es una cuenta saldada:
    // calcularMayor la da por 'deudora' porque 0 >= 0. OJO: el test «se corrige el caso 5…» de
    // arriba fija hoy «Saldo deudora: 1700,00»; la reparación lo cambia a «Saldo deudor: 1700,00».
    test.fail();
    await page.getByRole('tab', { name: /Libro Mayor/ }).click();
    await expect(cuentaT(page, 'Caja').locator('[class*="_cuentaTSaldo"]')).toHaveText('Saldo deudor: 9500,00');
    await expect(cuentaT(page, 'Capital').locator('[class*="_cuentaTSaldo"]')).toHaveText('Saldo acreedor: 10.000,00');
    await registrar(page, 'Ingreso de la caja en el banco', [
      { cuenta: 'Banco', debe: '9500' },
      { cuenta: 'Caja', haber: '9500' },
    ]);
    await page.getByRole('tab', { name: /Libro Mayor/ }).click();
    await expect(cuentaT(page, 'Caja').locator('[class*="_cuentaTSaldo"]')).not.toHaveText(/deudor|acreedor/);
  });

  test('HALLAZGO (02/11/2026, ABIERTO) · el diario y el mayor escriben la fecha AAAA-MM-DD, no DD/MM/AAAA', async ({ page }) => {
    // El primer ejemplo es del 2025-01-10: en pantalla debe leerse 10/01/2025 (formato español).
    test.fail();
    await expect(diario(page).first().locator('[class*="asientoFecha"]')).toHaveText('10/01/2025');
    await page.getByRole('tab', { name: /Libro Mayor/ }).click();
    await expect(cuentaT(page, 'Caja').locator('[class*="cuentaTFecha"]').first()).toHaveText('10/01/2025');
  });

  test('HALLAZGO (02/11/2026, ABIERTO) · con teclado, «Nuevo asiento» deja el foco en <body> y el Tab siguiente cae en «Limpiar todo»', async ({ page }) => {
    // El botón desaparece al abrir el formulario y nadie mueve el foco: el formulario queda ARRIBA
    // del punto de foco y el siguiente Tab va a «Limpiar todo», que borra el diario sin confirmar.
    // Lo mismo al guardar. Esperado: el foco pasa a un campo del formulario (la fecha o el concepto).
    test.fail();
    await page.getByRole('button', { name: 'Nuevo asiento' }).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByLabel('Concepto')).toBeVisible();
    const dentro = await page.evaluate(() => Boolean(document.activeElement?.closest('[class*="formularioCard"]')));
    expect(dentro, 'el foco debería estar en el formulario recién abierto').toBe(true);
  });
});

test.describe('C0542 · fecha propuesta en México por la tarde (Inspector 02/11/2026)', () => {
  test.use({ timezoneId: 'America/Mexico_City', locale: 'es-ES' });

  test('HALLAZGO (02/11/2026, ABIERTO) · a las 20:30 del 02/11 propone el 03/11 (la fecha UTC)', async ({ page }) => {
    // 2026-11-03T02:30Z = 02/11/2026 20:30 en Ciudad de México (UTC−6 todo el año desde 2022).
    // crearAsientoVacio usa new Date().toISOString(): da 2026-11-03, y el asiento se guarda con ella.
    test.fail();
    await page.clock.setFixedTime(new Date('2026-11-03T02:30:00Z'));
    await page.goto('/simulador-contabilidad-basica/');
    await esperarHidratacion(page, ['#casos-respuesta']);
    await page.getByRole('button', { name: 'Nuevo asiento' }).click();
    await expect(page.locator('input[type="date"]')).toHaveValue('2026-11-02');
  });
});

test.describe('C0542 · fecha propuesta en España (Inspector 02/11/2026)', () => {
  test.use({ timezoneId: 'Europe/Madrid', locale: 'es-ES' });

  test('HALLAZGO (02/11/2026, ABIERTO) · a las 00:30 del 02/11 propone el 01/11 (la fecha UTC)', async ({ page }) => {
    // 2026-11-01T23:30Z = 02/11/2026 00:30 en Madrid (UTC+1 en noviembre): en UTC aún es el día 1.
    test.fail();
    await page.clock.setFixedTime(new Date('2026-11-01T23:30:00Z'));
    await page.goto('/simulador-contabilidad-basica/');
    await esperarHidratacion(page, ['#casos-respuesta']);
    await page.getByRole('button', { name: 'Nuevo asiento' }).click();
    await expect(page.locator('input[type="date"]')).toHaveValue('2026-11-02');
  });

  test('no es la fecha del build: con el reloj en el 15/03/2027 propone 2027-03-15', async ({ page }) => {
    // El formulario no está en el HTML prerenderizado y el inicializador de useState corre al
    // hidratar con el reloj del usuario (12:00 en Madrid, el mismo día en UTC).
    await page.clock.setFixedTime(new Date('2027-03-15T11:00:00Z'));
    await page.goto('/simulador-contabilidad-basica/');
    await esperarHidratacion(page, ['#casos-respuesta']);
    await page.getByRole('button', { name: 'Nuevo asiento' }).click();
    await expect(page.locator('input[type="date"]')).toHaveValue('2027-03-15');
  });

  test('el HTML servido no lleva el formulario ni su fecha', async ({ request }) => {
    const html = await (await request.get('/simulador-contabilidad-basica/')).text();
    expect(html).toContain('Simulador de Contabilidad Básica');
    expect(html).not.toContain('type="date"');
  });
});

test.describe('textos de la página y del JSON-LD (Inspector 02/11/2026)', () => {
  const pagina = readFileSync('app/simulador-contabilidad-basica/page.tsx', 'utf8');
  const metadatos = readFileSync('app/simulador-contabilidad-basica/metadata.ts', 'utf8');

  test('HALLAZGO (02/11/2026, ABIERTO) · la FAQ dice que la contabilidad oficial «requiere software homologado» y un profesional', () => {
    // Código de Comercio (BOE-A-1885-6627), art. 25.2: «La contabilidad será llevada directamente
    // por los empresarios o por otras personas debidamente autorizadas»; art. 27.2: asientos «por
    // cualquier procedimiento idóneo». Ni software homologado ni supervisión obligatoria.
    test.fail();
    expect(pagina).not.toContain('requiere software homologado');
    expect(pagina).not.toMatch(/la supervisión de un profesional/);
  });

  test('HALLAZGO (02/11/2026, ABIERTO) · la guía dice que el banco «también va al Haber», cuando el gasto fue al Debe', () => {
    test.fail();
    expect(pagina).not.toContain('también va al Haber');
  });

  test('HALLAZGO (02/11/2026, ABIERTO) · features del JSON-LD con «100%» pegado', () => {
    // CLAUDE.md global §2: el % va separado con espacio duro («100 %»).
    test.fail();
    expect(metadatos).not.toMatch(/\d%/);
  });

  test('el JSON-LD declara al menos 4 características', () => {
    const bloque = metadatos.slice(metadatos.indexOf('features: ['), metadatos.indexOf('],', metadatos.indexOf('features: [')));
    expect(bloque.match(/^\s*'[^']+',?$/gm)?.length ?? 0).toBeGreaterThanOrEqual(4);
  });
});
