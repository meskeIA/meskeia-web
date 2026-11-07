import { test, expect, type Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact, sembrarValor } from './_hidratacion';
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

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * Inspector, 07/11/2026 — primera inspección, la app entera (panel Preparar, panel Diluir,
 * masas molares, JSON-LD). Esperados resueltos a mano ANTES de mirar la app.
 *
 * MASAS MOLARES: tabla abreviada de pesos atómicos estándar 2024 de la CIAAW
 * (www.ciaaw.org/abridged-atomic-weights.htm, consultada el 07/11/2026), con su incertidumbre:
 *   KMnO₄    39,098 + 54,938 + 4·15,999           = 158,032 ± 0,006   (app 158,03)
 *   CuSO₄    63,546 + 32,06 + 4·15,999            = 159,602 ± 0,027   (app 159,61, dentro)
 *   K₂Cr₂O₇  2·39,098 + 2·51,996 + 7·15,999       = 294,181 ± 0,011   (app 294,18)
 *   NiCl₂    58,693 + 2·35,45                     = 129,593 ± 0,021   (app 129,60, dentro)
 *   NaCl     22,990 + 35,45                       =  58,440 ± 0,011   (app 58,44)
 *   C₆H₁₂O₆  6·12,011 + 12·1,0080 + 6·15,999      = 180,156 ± 0,020   (app 180,16)
 *
 * LOS CASOS DEL PANEL:
 *   A  NaCl 14,5 g en 250 mL: n = 14,5/58,44 = 0,248118 mol → 0,2481 · M = n/0,25 = 0,99247 → 0,992
 *      · 14,5/0,25 = 58,00 g/L · 14,5/250·100 = 5,80 % m/v · 14 500 mg/0,25 L = 58.000 ppm
 *   A2 K₂Cr₂O₇ 29,5 g en 750 mL: n = 29,5/294,18 = 0,100279 → 0,1003 · M = n/0,75 = 0,133705 → 0,134
 *      · 39,333 → 39,33 g/L · 3,9333 → 3,93 % m/v · 39.333,3 → 39.333 ppm
 *   L  glucosa 0,5 g en 1000 mL (los dos topes del deslizador): n = 0,5/180,16 = 0,0027753 → 0,0028
 *      · M → 0,003 · 0,50 g/L · 0,05 % m/v · 500 ppm
 *   P  personalizado 98,08 g/mol tecleado con coma, 49 g en 250 mL: n = 0,4995922 → 0,4996
 *      · M = n/0,25 = 1,998369 → 1,998. «0» como masa molar dividiría entre cero: el campo lo acota
 *      a su mínimo (1 g/mol, CampoNumerico min 1), lo marca aria-invalid y al salir enseña «1»;
 *      M = 49/1/0,25 = 196,000
 *   B  Diluir 1,5 → 0,35 mol/L, V₂ 330 mL: V₁ = 0,35·330/1,5 = 77,0 mL · agua 330 − 77 = 253,0 mL
 *      · factor 1,5/0,35 = 4,2857 → 4,3×
 *   C  Diluir 0,8 → 0,8 mol/L, V₂ 400 mL (el límite C₂ = C₁): V₁ 400,0 · disolvente 0,0 · factor 1,0×
 *   R  Diluir 1 → 1,5 mol/L: concentrar diluyendo es imposible → aviso y ningún resultado
 *   V  Color del vaso (feature del JSON-LD): KMnO₄ en 500 mL, 15 g → M = 0,189837 y opacidad
 *      M/1,2 = 0,1582; 30 g → 0,379675 y 0,3164: el doble, como la concentración
 *   S  KMnO₄ 100 g en 50 mL = 2000 g/L → M = 100/158,03/0,05 = 12,656. La propia app cifra la
 *      solubilidad del KMnO₄ en 60 g/L (MAXIMO_G_POR_LITRO de casos.ts, «para no pedir una
 *      disolución que no se puede hacer») → ABIERTO: el panel la pinta como disolución sin aviso
 * ══════════════════════════════════════════════════════════════════════════════════════════ */

/** Pesos atómicos estándar abreviados 2024 de la CIAAW: [valor, incertidumbre]. */
const CIAAW_2024: Record<string, [number, number]> = {
  H: [1.008, 0.0002],
  C: [12.011, 0.002],
  O: [15.999, 0.001],
  Na: [22.99, 0.001],
  S: [32.06, 0.02],
  Cl: [35.45, 0.01],
  K: [39.098, 0.001],
  Cr: [51.996, 0.001],
  Mn: [54.938, 0.001],
  Ni: [58.693, 0.001],
  Cu: [63.546, 0.003],
};

/** Fórmula de cada soluto de la lista, átomo a átomo. */
const COMPOSICION: Record<string, Record<string, number>> = {
  kmno4: { K: 1, Mn: 1, O: 4 },
  cuso4: { Cu: 1, S: 1, O: 4 },
  k2cr2o7: { K: 2, Cr: 2, O: 7 },
  nicl2: { Ni: 1, Cl: 2 },
  nacl: { Na: 1, Cl: 1 },
  glucosa: { C: 6, H: 12, O: 6 },
};

/** Masa molar CIAAW y su incertidumbre propagada (suma de n·U, el peor caso). */
function masaMolarCiaaw(id: string): { valor: number; incertidumbre: number } {
  const formula = COMPOSICION[id];
  let valor = 0;
  let incertidumbre = 0;
  for (const [elemento, n] of Object.entries(formula)) {
    const [ar, u] = CIAAW_2024[elemento];
    valor += n * ar;
    incertidumbre += n * u;
  }
  return { valor, incertidumbre };
}

/** La tarjeta de resultado por su rótulo («Molaridad», «Disolvente a añadir»…). */
const tarjeta = (page: Page, rotulo: string) => page.locator('[class*="resultCard"]').filter({ hasText: rotulo });

test.describe('Inspector 07/11/2026 — masas molares contra la CIAAW, sin navegador', () => {
  test('cada soluto de la lista tiene la masa molar de los pesos atómicos estándar 2024', () => {
    expect(SOLUTOS.map((s) => s.id).sort()).toEqual(Object.keys(COMPOSICION).sort());
    for (const s of SOLUTOS) {
      const { valor, incertidumbre } = masaMolarCiaaw(s.id);
      // Margen: la incertidumbre propagada más el redondeo a dos decimales de la lista. Un
      // error de tecleo (158,3 por 158,03) se sale por mucho.
      expect(Math.abs(s.masaMolar - valor), `${s.formula}: app ${s.masaMolar} · CIAAW ${valor.toFixed(3)} ± ${incertidumbre.toFixed(3)}`).toBeLessThanOrEqual(
        incertidumbre + 0.005,
      );
    }
  });
});

test.describe('Inspector 07/11/2026 — panel Preparar y Diluir en el navegador', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/simulador-disoluciones/');
    await esperarHidratacion(page, ['#masa-input', '#casos-respuesta']);
  });

  test('las masas molares que enseña cada botón casan con la CIAAW', async ({ page }) => {
    for (const s of SOLUTOS) {
      await page.getByRole('button', { name: new RegExp(s.formula) }).first().click();
      const texto = await page.locator('[class*="masaMolarNota"]').textContent();
      const m = (texto ?? '').match(/Masa molar:\s*([\d.]+,\d{2})\s*g\/mol/);
      expect(m, `${s.formula}: «${texto}»`).not.toBeNull();
      const enPantalla = Number(m![1].replace(/\./g, '').replace(',', '.'));
      const { valor, incertidumbre } = masaMolarCiaaw(s.id);
      expect(Math.abs(enPantalla - valor), `${s.formula}: ${enPantalla}`).toBeLessThanOrEqual(incertidumbre + 0.005);
    }
  });

  test('A · NaCl, 14,5 g en 250 mL: 0,992 mol/L · 0,2481 mol · 58,00 g/L · 5,80 % m/v · 58.000 ppm', async ({ page }) => {
    await page.getByRole('button', { name: /NaCl/ }).first().click();
    await sembrarValor(page, '#masa-input', 14.5);
    await sembrarValor(page, '#vol-input', 250);
    await expect(tarjeta(page, 'Molaridad')).toContainText('0,992 mol/L');
    await expect(tarjeta(page, 'Moles de soluto')).toContainText('0,2481 mol');
    await expect(tarjeta(page, 'Concentración másica')).toContainText('58,00 g/L');
    await expect(tarjeta(page, '% masa / volumen')).toContainText('5,80 % m/v');
    await expect(tarjeta(page, 'ppm')).toContainText('58.000 ppm');
    await expect(page.locator('[class*="formulaNota"]')).toContainText('(14,5 g ÷ 58,44 g/mol) ÷ 0,250 L = 0,992 mol/L');
  });

  test('A2 · K₂Cr₂O₇, 29,5 g en 750 mL: 0,134 mol/L · 0,1003 mol · 39,33 g/L · 3,93 % m/v · 39.333 ppm', async ({ page }) => {
    await page.getByRole('button', { name: /K₂Cr₂O₇/ }).first().click();
    await sembrarValor(page, '#masa-input', 29.5);
    await sembrarValor(page, '#vol-input', 750);
    await expect(tarjeta(page, 'Molaridad')).toContainText('0,134 mol/L');
    await expect(tarjeta(page, 'Moles de soluto')).toContainText('0,1003 mol');
    await expect(tarjeta(page, 'Concentración másica')).toContainText('39,33 g/L');
    await expect(tarjeta(page, '% masa / volumen')).toContainText('3,93 % m/v');
    await expect(tarjeta(page, 'ppm')).toContainText('39.333 ppm');
  });

  test('L · los topes del deslizador: 0,5 g de glucosa en 1000 mL', async ({ page }) => {
    await page.getByRole('button', { name: /C₆H₁₂O₆/ }).first().click();
    await sembrarValor(page, '#masa-input', 0.5);
    await sembrarValor(page, '#vol-input', 1000);
    await expect(tarjeta(page, 'Molaridad')).toContainText('0,003 mol/L');
    await expect(tarjeta(page, 'Moles de soluto')).toContainText('0,0028 mol');
    await expect(tarjeta(page, 'Concentración másica')).toContainText('0,50 g/L');
    await expect(tarjeta(page, '% masa / volumen')).toContainText('0,05 % m/v');
    await expect(tarjeta(page, 'ppm')).toContainText('500 ppm');
  });

  test('P · masa molar personalizada: 98,08 con coma vale; «0» se acota a 1 g/mol y se marca inválido', async ({ page }) => {
    await page.getByRole('button', { name: /Personalizado/ }).click();
    const campo = page.getByRole('spinbutton', { name: 'Masa molar personalizada en g/mol' });
    await campo.fill('98,08');
    await esperarValorEnReact(page, campo, '98,08');
    await expect(page.locator('[class*="masaMolarNota"]')).toContainText('98,08 g/mol');
    await sembrarValor(page, '#masa-input', 49);
    await sembrarValor(page, '#vol-input', 250);
    await expect(tarjeta(page, 'Moles de soluto')).toContainText('0,4996 mol');
    await expect(tarjeta(page, 'Molaridad')).toContainText('1,998 mol/L');

    // Rechazo: una masa molar de 0 dividiría entre cero. No se usa: se aplica el mínimo.
    await campo.fill('0');
    await expect(campo).toHaveAttribute('aria-invalid', 'true');
    await campo.press('Tab');
    await expect(campo).toHaveValue('1');
    await expect(page.locator('[class*="masaMolarNota"]')).toContainText('1,00 g/mol');
    await expect(tarjeta(page, 'Molaridad')).toContainText('196,000 mol/L');
  });

  test('B · Diluir de 1,5 a 0,35 mol/L hasta 330 mL: V₁ 77,0 mL · agua 253,0 mL · factor 4,3×', async ({ page }) => {
    await page.getByRole('button', { name: /Diluir/ }).click();
    await sembrarValor(page, '#c1-input', 1.5);
    await sembrarValor(page, '#c2-input', 0.35);
    await sembrarValor(page, '#v2-input', 330);
    await expect(tarjeta(page, 'Volumen de madre')).toContainText('77,0 mL');
    await expect(tarjeta(page, 'Disolvente a añadir')).toContainText('253,0 mL');
    await expect(tarjeta(page, 'Factor de dilución')).toContainText('4,3×');
    await expect(page.locator('[class*="formulaNota"]')).toContainText('(0,35 × 330) ÷ 1,50 = 77,0 mL');
  });

  test('C · el límite C₂ = C₁ (0,8 mol/L, 400 mL): toda la madre, 0,0 mL de agua y factor 1,0×', async ({ page }) => {
    await page.getByRole('button', { name: /Diluir/ }).click();
    await sembrarValor(page, '#c1-input', 0.8);
    await sembrarValor(page, '#c2-input', 0.8);
    await sembrarValor(page, '#v2-input', 400);
    await expect(tarjeta(page, 'Volumen de madre')).toContainText('400,0 mL');
    await expect(tarjeta(page, 'Disolvente a añadir')).toContainText('0,0 mL');
    await expect(tarjeta(page, 'Factor de dilución')).toContainText('1,0×');
  });

  test('R · Diluir de 1 a 1,5 mol/L se rechaza con aviso y sin resultados', async ({ page }) => {
    await page.getByRole('button', { name: /Diluir/ }).click();
    await sembrarValor(page, '#c1-input', 1);
    await sembrarValor(page, '#c2-input', 1.5);
    // Acotado al aviso de la app: getByRole('alert') también casa con el anunciador de rutas de Next.
    await expect(page.getByRole('alert').filter({ hasText: 'menor o igual' })).toBeVisible();
    await expect(tarjeta(page, 'Volumen de madre')).toHaveCount(0);
  });

  test('V · el color del vaso sigue a la concentración: doble molaridad, doble opacidad', async ({ page }) => {
    const liquido = page.locator('svg[aria-label="Vaso de precipitados con la disolución"] rect');
    const opacidad = async () => {
      const fill = (await liquido.getAttribute('fill')) ?? '';
      const m = fill.match(/rgba\([^)]*,\s*([\d.]+)\)/);
      return m ? Number(m[1]) : Number.NaN;
    };
    await page.getByRole('button', { name: /KMnO₄/ }).first().click();
    await expect(page.locator('label[for="vol-input"]')).toContainText('500 mL');
    await sembrarValor(page, '#masa-input', 15);
    await expect.poll(opacidad).toBeCloseTo(0.1582, 3);
    await sembrarValor(page, '#masa-input', 30);
    await expect.poll(opacidad).toBeCloseTo(0.3164, 3);
  });

  test('J · el JSON-LD existe, con al menos 4 características y 5 preguntas', async ({ page }) => {
    const bloques = (await page.locator('script[type="application/ld+json"]').allTextContents()).map(
      (b) => JSON.parse(b) as Record<string, unknown>,
    );
    const app = bloques.find((b) => b['@type'] === 'WebApplication' && String(b.name).includes('Disoluciones'));
    expect(app).toBeDefined();
    expect((app!.featureList as string[]).length).toBeGreaterThanOrEqual(4);
    const faq = bloques.find((b) => b['@type'] === 'FAQPage');
    expect((faq!.mainEntity as unknown[]).length).toBe(5);
  });

  // ABIERTO (Inspector 07/11/2026): la descripción del JSON-LD dice «el volumen de disolvente»,
  // y la app calcula con el volumen de DISOLUCIÓN (su deslizador se llama así) y avisa de que
  // usar el de disolvente es el primer error frecuente. Lo leen buscadores y asistentes de IA.
  test('J2 · ABIERTO: la descripción del JSON-LD habla del volumen de disolución, no de disolvente', async ({ page }) => {
    test.fail(true, 'ABIERTO: metadata.ts dice «el volumen de disolvente» en la description del jsonLd');
    const bloques = (await page.locator('script[type="application/ld+json"]').allTextContents()).map(
      (b) => JSON.parse(b) as Record<string, unknown>,
    );
    const app = bloques.find((b) => b['@type'] === 'WebApplication' && String(b.name).includes('Disoluciones'));
    expect(String(app?.description ?? '')).not.toMatch(/volumen de disolvente/i);
  });

  // ABIERTO (Inspector 07/11/2026): el % del panel va tras un espacio NORMAL («5,80 <small>% m/v»),
  // y el % se separa con espacio duro (U+00A0) para que no salte solo de línea. casos.ts ya lo hace.
  test('F · ABIERTO: el % m/v del panel va separado con espacio duro', async ({ page }) => {
    test.fail(true, 'ABIERTO: page.tsx escribe «{cifra} <small>% m/v</small>» con un espacio normal');
    await page.getByRole('button', { name: /C₆H₁₂O₆/ }).first().click();
    await sembrarValor(page, '#masa-input', 25);
    const valor = tarjeta(page, '% masa / volumen').locator('[class*="resultValor"]');
    await expect(valor).toContainText('5,00');
    expect(await valor.textContent()).toMatch(/5,00 %/);
  });

  // ABIERTO (Inspector 07/11/2026): 100 g de KMnO₄ en 50 mL son 2000 g/L, 33 veces la solubilidad
  // que la propia app le da (60 g/L en MAXIMO_G_POR_LITRO de casos.ts), y el panel los pinta como
  // una disolución de 12,656 mol/L, sin ningún aviso. La aritmética sí es la del caso S.
  test('S · ABIERTO: una disolución por encima de la solubilidad se avisa', async ({ page }) => {
    test.fail(true, 'ABIERTO: el panel no conoce la solubilidad y pinta como disolución lo que no se disuelve');
    await page.getByRole('button', { name: /KMnO₄/ }).first().click();
    await sembrarValor(page, '#masa-input', 100);
    await sembrarValor(page, '#vol-input', 50);
    await expect(page.locator('main section:not(#casos-aula)').filter({ hasText: /solubilidad|saturad|no se disuelve/i })).not.toHaveCount(0, {
      timeout: 3000,
    });
  });
});
