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

import { test, expect } from '@playwright/test';
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
