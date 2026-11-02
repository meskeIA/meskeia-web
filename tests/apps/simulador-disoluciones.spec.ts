import { test, expect } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';
import {
  CASOS,
  FICHAS,
  TOTAL_CASOS,
  comprobarRespuesta,
  dependeDeMasaMolar,
  generarEjercicioAleatorio,
  resolverCaso,
  toleranciaDe,
  type DatosCaso,
} from '../../app/simulador-disoluciones/casos';
import { SOLUTOS, calcularDilucion, calcularPreparacion } from '../../app/simulador-disoluciones/motor';
import { dentroDeTolerancia, redondearA } from '../../lib/calculadoras/correctorCasosAula';

/**
 * simulador-disoluciones — Casos para clase (skill /casos-aula-meskeia, 02/11/2026).
 *
 * La app no tenía spec. El cálculo vivía en dos `useMemo` de page.tsx y se MOVIÓ a `motor.ts`
 * (`calcularPreparacion`, `calcularDilucion`); el test 0 lo compara con las fórmulas de antes,
 * copiadas aquí tal como estaban en HEAD, para que se vea que fue un traslado.
 *
 * EL CONVENIO DE LA APP
 *   · Molaridad, g/L, % m/v y ppm van por volumen de DISOLUCIÓN (enrasada), no de disolvente.
 *   · % es masa/volumen: gramos por cada 100 mL. ppm = mg/L (acuosa diluida, densidad ≈ 1).
 *   · En la dilución, agua a añadir = V₂ − V₁: volúmenes aditivos.
 *   · Masas molares de la lista (NaCl 58,44 · CuSO₄ 159,61 · KMnO₄ 158,03 · glucosa 180,16). Un
 *     libro usa 58,5 · 159,6 · 158 · 180: la respuesta con la de libro tiene que entrar en la
 *     tolerancia (test 7.bis). Por eso lo que depende de la masa molar va con la RELATIVA y lo
 *     demás con la de redondeo, sin margen si la cifra es exacta.
 *
 * LAS 12 RESPUESTAS, A MANO (nunca copiadas de la app):
 *    1  58,5 g NaCl en 500 mL     58,5/58,44 = 1,001027 mol ÷ 0,5 L = 2,00205        → 2,002 mol/L
 *    2  87,5 g NaCl               87,5/58,44 = 1,497262                                → 1,4973 mol
 *    3  12,5 g CuSO₄ en 250 mL    12,5 ÷ 0,25 L                                        = 50 g/L
 *    4  25 g glucosa en 500 mL    25/500 · 100                                         = 5 % m/v
 *    5  1 g NaCl en 500 mL        1000 mg ÷ 0,5 L                                      = 2000 ppm
 *    6  KMnO₄ 0,2 M, 500 mL       0,2 · 0,5 · 158,03 = 15,803                          → 15,80 g
 *    7  CuSO₄ 160 g/L             160/159,61 = 1,002443                                → 1,002 mol/L
 *    8  2,5 M → 0,75 M, 200 mL    V₁ = 0,75 · 200 / 2,5                                = 60 mL
 *    9  5 M → 1,2 M, 400 mL       V₁ = 1,2 · 400 / 5 = 96 · agua = 400 − 96            = 304 mL
 *   10  3 M → 0,4 M               3 / 0,4                                              = 7,5
 *   11  30 mL de 2,5 M a 250 mL   2,5 · 30 / 250                                       = 0,3 mol/L
 *   12  suero 0,9 %, 500 mL       0,9 · 500 / 100                                      = 4,5 g
 *
 * Con masa molar de libro (58,5 · 159,6 · 158): 1 → 2,000 · 2 → 1,4957 · 6 → 15,80 · 7 → 1,003.
 */

const A_MANO: Record<number, number> = {
  1: 2.002,
  2: 1.4973,
  3: 50,
  4: 5,
  5: 2000,
  6: 15.8,
  7: 1.002,
  8: 60,
  9: 304,
  10: 7.5,
  11: 0.3,
  12: 4.5,
};

/** Masas molares de libro, redondeadas como en clase. */
const LIBRO: Record<string, number> = {
  nacl: 58.5,
  glucosa: 180,
  cuso4: 159.6,
  kmno4: 158,
  k2cr2o7: 294.2,
  nicl2: 129.6,
};

/** La respuesta recalculada con fórmulas propias del spec y la masa molar que se le pase. */
function aMano(d: DatosCaso, mm: number): number {
  const L = (d.volumenML ?? 0) / 1000;
  switch (d.tipo) {
    case 'molaridad':
      return (d.masaG! / mm) / L;
    case 'moles':
      return d.masaG! / mm;
    case 'gPorLitro':
      return d.masaG! / L;
    case 'porcentajeMV':
      return (d.masaG! / d.volumenML!) * 100;
    case 'ppm':
      return (d.masaG! * 1000) / L;
    case 'masaParaMolaridad':
      return d.molaridad! * L * mm;
    case 'molaridadDesdeGPorLitro':
      return d.gPorLitro! / mm;
    case 'masaParaPorcentaje':
      return (d.porcentajeMV! * d.volumenML!) / 100;
    case 'volumenMadre':
      return (d.c2! * d.v2ML!) / d.c1!;
    case 'disolvente':
      return d.v2ML! - (d.c2! * d.v2ML!) / d.c1!;
    case 'factor':
      return d.c1! / d.c2!;
    case 'concentracionDiluida':
      return (d.c1! * d.v1ML!) / d.v2ML!;
    default:
      return Number.NaN;
  }
}

const masaMolarApp = (d: DatosCaso): number => SOLUTOS.find((s) => s.id === d.solutoId)?.masaMolar ?? Number.NaN;

/** Decimales que enseña una cifra en formato español: «2,002 mol/L» → 3. */
function decimalesMostrados(texto: string): number {
  const m = texto.match(/,(\d+)/);
  return m ? m[1].length : 0;
}

test.describe('casos.ts — invariantes, sin navegador', () => {
  test('0 · el motor es un traslado: da lo mismo que las fórmulas que había en page.tsx', () => {
    for (const masa of [0.5, 7.5, 58.5, 100]) {
      for (const volumen of [50, 330, 1000]) {
        for (const mm of [58.44, 158.03, 294.18, 1]) {
          const litros = volumen / 1000;
          const moles = mm > 0 ? masa / mm : 0;
          const p = calcularPreparacion(masa, volumen, mm);
          expect(p).toEqual({
            litros,
            moles,
            molaridad: litros > 0 ? moles / litros : 0,
            gPorLitro: litros > 0 ? masa / litros : 0,
            porcentajeMV: volumen > 0 ? (masa / volumen) * 100 : 0,
            ppm: litros > 0 ? (masa * 1000) / litros : 0,
          });
        }
      }
    }
    for (const [c1, c2, v2] of [[2, 0.5, 250], [0.1, 0.05, 50], [5, 5, 1000], [1, 2, 100]]) {
      const valido = c1 > 0 && c2 > 0 && v2 > 0 && c2 <= c1;
      const v1 = valido ? (c2 * v2) / c1 : 0;
      expect(calcularDilucion(c1, c2, v2)).toEqual({ valido, v1, disolvente: valido ? v2 - v1 : 0, factor: c2 > 0 ? c1 / c2 : 0 });
    }
  });

  test('1 · hay 12 casos con ids 1..12 sin huecos', () => {
    expect(TOTAL_CASOS).toBe(12);
    expect(CASOS.map((c) => c.id)).toEqual(Array.from({ length: 12 }, (_, i) => i + 1));
  });

  test('2 · son deterministas: dos lecturas dan lo mismo', () => {
    for (const caso of CASOS) {
      const a = resolverCaso(caso.datos);
      const b = resolverCaso(caso.datos);
      expect(b.valor, `caso ${caso.id}`).toBe(a.valor);
      expect(b.pasos, `caso ${caso.id}`).toEqual(a.pasos);
    }
  });

  test('3 · la respuesta declarada coincide con recalcularla desde los datos', () => {
    for (const caso of CASOS) {
      const r = resolverCaso(caso.datos);
      expect(r.ok, `caso ${caso.id}: ${r.error ?? ''}`).toBe(true);
      expect(redondearA(r.valor, FICHAS[caso.datos.tipo].decimales), `caso ${caso.id}`).toBe(caso.respuesta);
    }
  });

  test('4 · cada caso tiene enunciado, etiqueta con unidad, respuesta finita, desarrollo y pista', () => {
    for (const caso of CASOS) {
      expect(caso.enunciado.length, `caso ${caso.id}`).toBeGreaterThan(30);
      expect(caso.etiquetaRespuesta.trim(), `caso ${caso.id}`).not.toBe('');
      expect(Number.isFinite(caso.respuesta), `caso ${caso.id}`).toBe(true);
      expect(caso.respuesta, `caso ${caso.id}`).toBeGreaterThan(0);
      expect(caso.pasos.length, `caso ${caso.id}`).toBeGreaterThanOrEqual(2);
      expect(caso.pista.trim(), `caso ${caso.id}`).not.toBe('');
      expect(/\bNaN\b|undefined|Infinity/.test(caso.enunciado + caso.pasos.join(' ')), `caso ${caso.id}`).toBe(false);
      expect(caso.enunciado + caso.pasos.join(' '), `caso ${caso.id}`).not.toMatch(/\b[Dd]e el\b/);
    }
  });

  test('5 · ningún enunciado nombra un país, una ciudad o una moneda', () => {
    const PROHIBIDO =
      /\b(España|Espana|México|Mexico|Colombia|Argentina|Perú|Peru|Chile|Uruguay|Ecuador|Madrid|Barcelona|Bogotá|Lima|Quito|euros?|dólares?|pesos (mexicanos|colombianos|chilenos|argentinos|uruguayos)|Bachillerato|selectividad)\b/i;
    for (const caso of CASOS) {
      const texto = `${caso.titulo} ${caso.enunciado}`;
      expect(PROHIBIDO.test(texto) || /\bESO\b/.test(texto), `caso ${caso.id}`).toBe(false);
    }
    for (let s = 1; s <= 40; s++) {
      const e = generarEjercicioAleatorio(s);
      expect(PROHIBIDO.test(e.enunciado) || /\bESO\b/.test(e.enunciado), `semilla ${s}`).toBe(false);
    }
  });

  test('5.bis · lo que el enunciado PIDE coincide con lo que la solución MUESTRA', () => {
    for (const caso of CASOS) {
      const decimales = FICHAS[caso.datos.tipo].decimales;
      expect(decimalesMostrados(caso.respuestaTexto), `caso ${caso.id}`).toBeLessThanOrEqual(decimales);
      const exacto = Math.abs(resolverCaso(caso.datos).valor - caso.respuesta) < 1e-9;
      expect(caso.requiereRedondeo, `caso ${caso.id}`).toBe(!exacto);
      if (!exacto) expect(caso.enunciado, `caso ${caso.id}: se redondea y no lo pide`).toMatch(/redonde/i);
    }
  });

  test('6 · el generador es reproducible, variado y usa la misma aritmética', () => {
    const a = generarEjercicioAleatorio(12345);
    const b = generarEjercicioAleatorio(12345);
    expect(b.enunciado).toBe(a.enunciado);
    expect(b.respuesta).toBe(a.respuesta);
    const muestras = Array.from({ length: 40 }, (_, i) => generarEjercicioAleatorio(i + 1));
    expect(new Set(muestras.map((m) => m.respuesta)).size).toBeGreaterThanOrEqual(3);
    expect(new Set(muestras.map((m) => m.datos.tipo)).size).toBeGreaterThanOrEqual(3);
    for (const m of muestras) {
      const decimales = FICHAS[m.datos.tipo].decimales;
      expect(redondearA(resolverCaso(m.datos).valor, decimales), m.enunciado).toBe(m.respuesta);
      // La misma que las fórmulas propias del spec con la masa molar de la app.
      expect(dentroDeTolerancia(aMano(m.datos, masaMolarApp(m.datos)), m.respuesta, toleranciaDe(m.datos)), m.enunciado).toBe(true);
      expect(comprobarRespuesta(m.respuesta, m.respuesta, m.datos).correcto, m.enunciado).toBe(true);
      // Datos que el alumno puede poner en los deslizadores.
      const d = m.datos;
      if (d.masaG !== undefined) expect(d.masaG * 2, m.enunciado).toBe(Math.round(d.masaG * 2));
      if (d.volumenML !== undefined) expect(d.volumenML % 10, m.enunciado).toBe(0);
      if (d.c1 !== undefined) expect(d.c1 >= 0.1 && d.c1 <= 5, m.enunciado).toBe(true);
      if (d.c2 !== undefined) expect(d.c2 <= d.c1!, m.enunciado).toBe(true);
    }
  });

  test('7 · el convenio queda fijado: las doce respuestas son las de la tabla a mano', () => {
    for (const caso of CASOS) {
      expect(caso.respuesta, `caso ${caso.id} · ${caso.titulo}`).toBe(A_MANO[caso.id]);
      const mm = masaMolarApp(caso.datos);
      expect(redondearA(aMano(caso.datos, mm), FICHAS[caso.datos.tipo].decimales), `caso ${caso.id}`).toBe(caso.respuesta);
    }
  });

  test('7.bis · con la masa molar de libro la respuesta también se acepta', () => {
    for (const caso of [...CASOS, ...Array.from({ length: 40 }, (_, i) => generarEjercicioAleatorio(i + 1))]) {
      const id = 'id' in caso ? `caso ${caso.id}` : caso.enunciado;
      const mmLibro = LIBRO[caso.datos.solutoId ?? ''];
      if (!dependeDeMasaMolar(caso.datos)) continue;
      expect(mmLibro, id).toBeDefined();
      const conLibro = redondearA(aMano(caso.datos, mmLibro), FICHAS[caso.datos.tipo].decimales);
      expect(comprobarRespuesta(conLibro, caso.respuesta, caso.datos).correcto, `${id}: ${conLibro}`).toBe(true);
    }
    // Y la política no es un cheque en blanco: lo que no depende de la masa molar no tiene margen.
    const caso3 = CASOS[2];
    expect(dependeDeMasaMolar(caso3.datos)).toBe(false);
    expect(comprobarRespuesta(50.4, caso3.respuesta, caso3.datos).correcto).toBe(false);
  });

  test('8 · el corrector reconoce los errores típicos por su nombre', () => {
    const caso = (id: number) => CASOS[id - 1];
    const corregir = (id: number, valor: number) => comprobarRespuesta(valor, caso(id).respuesta, caso(id).datos);

    expect(corregir(1, 2.002).correcto).toBe(true);
    expect(corregir(1, 2).correcto).toBe(true); // 58,5 de libro
    expect(corregir(9, 304).correcto).toBe(true);

    expect(corregir(1, 0.002).error).toBe('volumen-en-ml'); // dividir entre 500 mL
    expect(corregir(1, 117).error).toBe('falta-masa-molar'); // los g/L
    expect(corregir(4, 50).error).toBe('porcentaje-por-litro'); // los g/L por el %
    expect(corregir(8, 140).error).toBe('disolvente-por-v1');
    expect(corregir(9, 96).error).toBe('v1-por-disolvente');
    expect(corregir(10, 0.4 / 3).error).toBe('factor-invertido');
    expect(corregir(8, 2.5 * 200 / 0.75).error).toBe('cociente-invertido');

    // Imposibles con su porqué; nunca «NaN» ni «Infinity» en pantalla.
    expect(corregir(1, -2).correcto).toBe(false);
    expect(corregir(1, -2).motivo).toMatch(/negativa/);
    expect(corregir(8, 250).motivo).toMatch(/200/);
    expect(corregir(4, Number.NaN).motivo).not.toMatch(/NaN/);
    for (const c of CASOS) {
      expect(comprobarRespuesta(-1, c.respuesta, c.datos).motivo, `caso ${c.id}`).not.toMatch(/Infinity|NaN/);
    }
    // Una cifra exacta no tiene margen: 60,4 no vale por 60.
    expect(corregir(8, 60.4).correcto).toBe(false);
  });
});

test.describe('Casos para clase — en el navegador', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/simulador-disoluciones/');
    await esperarHidratacion(page, ['#masa-input', '#casos-respuesta']);
  });

  test('el caso 9 se corrige: 96 recibe el motivo de V₁ y 304 vale', async ({ page }) => {
    const boton = page.getByRole('button', { name: /^Caso 9: / });
    await boton.click();
    await expect(boton).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#casos-enunciado')).toContainText('400 mL');
    const caja = page.locator('#casos-respuesta');

    await caja.fill('96');
    await esperarValorEnReact(page, caja, '96');
    await page.locator('#casos-comprobar').click();
    await expect(page.locator('#casos-veredicto')).not.toContainText('¡Correcto!');
    await expect(page.locator('#casos-veredicto')).toContainText(/madre/i);

    await caja.fill('304');
    await esperarValorEnReact(page, caja, '304');
    await page.locator('#casos-comprobar').click();
    await expect(page.locator('#casos-veredicto')).toContainText('¡Correcto!');
  });

  test('la solución se despliega con aria-expanded y enseña la cifra con su unidad', async ({ page }) => {
    await page.getByRole('button', { name: /^Caso 1: / }).click();
    const solucion = page.locator('#casos-aula').getByRole('button', { name: /Ver solución/ });
    await expect(solucion).toHaveAttribute('aria-expanded', 'false');
    await solucion.click();
    await expect(page.locator('#casos-resultado')).toContainText('2,002');
    await expect(page.locator('#casos-resultado')).toContainText('mol/L');
  });

  test('el panel da lo que dice el caso 3: 12,5 g de CuSO₄ en 250 mL son 50,00 g/L', async ({ page }) => {
    // Lo que el alumno haría para comprobarlo: elegir el soluto y mover los dos deslizadores.
    await page.getByRole('button', { name: /CuSO₄/ }).first().click();
    await page.locator('#masa-input').fill('12.5');
    await page.locator('#vol-input').fill('250');
    // Acotado a la tarjeta: «Concentración másica» también es una fila de la tabla educativa.
    await expect(page.locator('[class*="resultCard"]', { hasText: 'Concentración másica' })).toContainText('50,00');
  });

  test('Practicar trae un ejercicio que se puede corregir', async ({ page }) => {
    await page.locator('#casos-practicar').click();
    await expect(page.locator('#casos-titulo-caso')).toHaveText('Ejercicio de práctica');
    const caja = page.locator('#casos-respuesta');
    await caja.fill('abc');
    await esperarValorEnReact(page, caja, 'abc');
    await page.locator('#casos-comprobar').click();
    await expect(page.locator('#casos-veredicto')).toContainText('Escribe un número');
  });
});
