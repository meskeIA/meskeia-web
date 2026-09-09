/**
 * Motor del Impuesto de Sucesiones — rama de Cataluña (Ley 19/2010)
 *
 * Casos con CIFRA ESPERADA, no invariantes. `calculadoras-invariantes.spec.ts` ya comprueba
 * que la cuota no salga negativa y que el tipo efectivo cuadre, y eso no habría detectado nada
 * de lo que este fichero cubre: los importes eran coherentes entre sí y estaban mal.
 *
 * ── De dónde sale (08/09/2026) ────────────────────────────────────────────────
 * Un usuario contrastó con ChatGPT una herencia de 250.000 € con vivienda habitual de
 * 180.000 € en Cataluña. La tool `consulta_herencia` del MCP Delegum respondió 23.000 €;
 * ChatGPT fue a la Agència Tributària de Catalunya y devolvió 0 €. Tenía razón, por dos
 * motivos independientes:
 *
 *   1. La reducción por parentesco del HIJO de 21 o más son 100.000 € (art. 2), y el motor
 *      le daba 50.000 €, que es lo del NIETO. Los dos compartían la clave 'II'.
 *   2. La reducción por vivienda habitual catalana (art. 17: 95 %, tope de 500.000 € sobre el
 *      valor conjunto) no se calculaba: la rama devolvía 0 y lo advertía, pero el aviso iba
 *      debajo de una cuota 23.000 € por encima de la real.
 *
 * Los importes están verificados en el texto consolidado de la Ley 19/2010 (BOE-A-2010-10829)
 * y en atc.gencat.cat/es/tributs/isd/herencies/reduccions/. El primer caso de cada bloque es
 * el que trajo el usuario; el segundo, el ejemplo práctico 5 que la propia ATC publica.
 *
 * ⚠️ Las cuotas esperadas están calculadas A MANO tramo a tramo, incluido el coeficiente
 * multiplicador (1,5882 en el Grupo III catalán). Derivarlas del propio motor las convertiría
 * en una tautología: no comprobarían nada.
 */

import { test, expect } from '@playwright/test';
import { calcularSucesion, porcentajeBonificacionPonderada } from '../lib/calculadoras/sucesiones';
import { calcularHerenciaConjunta } from '../lib/calculadoras/herenciaConjunta';
import {
  ESCALA_BONIF_CATALUNA_GRUPO_I_IS,
  ESCALA_BONIF_CATALUNA_GRUPO_II_IS,
} from '../data/fiscal';

/** Tolerancia de un céntimo: las cifras esperadas están calculadas a mano. */
const CENTIMO = 0.01;

test.describe('Cataluña — reducción por parentesco (art. 2 Ley 19/2010)', () => {
  test('el HIJO de 21 o más reduce 100.000 €, no los 50.000 € del nieto', () => {
    const r = calcularSucesion({
      baseImponible: 250000, ccaa: 'cataluna', grupo: 'II', edadHeredero: 45, viviendaHabitual: 180000,
    });
    expect(r.reduccionParentesco).toBe(100000);
    expect(r.reduccionVivienda).toBe(171000);       // 95 % de 180.000, por debajo del tope
    expect(r.totalReducciones).toBe(271000);        // supera la base: liquidable 0
    expect(r.baseLiquidable).toBe(0);
    expect(r.cuotaFinal).toBe(0);                   // ← la cifra que dio la ATC
  });

  test('el NIETO de 21 o más reduce 50.000 €, y con los mismos datos SÍ paga', () => {
    const r = calcularSucesion({
      baseImponible: 250000, ccaa: 'cataluna', grupo: 'II-descendiente', edadHeredero: 45, viviendaHabitual: 180000,
    });
    expect(r.reduccionParentesco).toBe(50000);
    // 250.000 − 50.000 − 171.000 = 29.000, que cae entero en el primer tramo de la tarifa
    // catalana (hasta 50.000 al 7 %): 7 % de 29.000 = 2.030 € de cuota íntegra.
    expect(r.baseLiquidable).toBe(29000);
    expect(r.cuotaIntegra).toBeCloseTo(2030, 2);
    // Y sobre esa cuota, la bonificación del art. 58 bis por la BASE IMPONIBLE (250.000):
    // 56,00 % → 2.030 × 0,44 = 893,20 €
    expect(r.cuotaFinal).toBeCloseTo(893.20, 2);
  });

  test('el ASCENDIENTE reduce 30.000 €, no 50.000 €', () => {
    const r = calcularSucesion({ baseImponible: 250000, ccaa: 'cataluna', grupo: 'II-ascendiente', edadHeredero: 70 });
    expect(r.reduccionParentesco).toBe(30000);
    // Base 220.000 → tramo 150.000-400.000: 14.500 + 17 % de 70.000 = 26.400 € de cuota íntegra
    expect(r.cuotaIntegra).toBeCloseTo(26400, 2);
    // El ascendiente es Grupo II a efectos del art. 58 bis: 56,00 % sobre base imponible 250.000
    expect(r.cuotaFinal).toBeCloseTo(11616, 2);
  });

  test('el CÓNYUGE reduce 100.000 € (ejemplo práctico 5 de la ATC)', () => {
    // Marta hereda de su marido la vivienda habitual (100.000 €), cuenta (5.000 €) y coche
    // (2.000 €). Base imponible 107.600 € con el ajuar. La ATC publica cuota 0,00 €.
    const r = calcularSucesion({
      baseImponible: 107600, ccaa: 'cataluna', grupo: 'I-conyuge', edadHeredero: 60, viviendaHabitual: 100000,
    });
    expect(r.reduccionParentesco).toBe(100000);
    expect(r.reduccionVivienda).toBe(95000);
    expect(r.totalReducciones).toBe(195000);
    expect(r.cuotaFinal).toBe(0);
  });
});

test.describe('Cataluña — incremento del Grupo I por año de menos de 21', () => {
  test('suma 12.000 € por año, no los 3.990,72 € estatales', () => {
    // Hijo de 5 años: 100.000 + 16 × 12.000 = 292.000, topado en 196.000 (art. 2).
    const r = calcularSucesion({ baseImponible: 300000, ccaa: 'cataluna', grupo: 'I-descendiente', edadHeredero: 5 });
    expect(r.totalReducciones).toBe(196000);
    // Base 104.000 → tramo 50.000-150.000: 3.500 + 11 % de 54.000 = 9.440 € de cuota íntegra
    expect(r.cuotaIntegra).toBeCloseTo(9440, 2);
    // Y la escala del GRUPO I sobre la base imponible de 300.000 → 97,00 % → 283,20 €
    expect(r.porcentajeBonificacion).toBeCloseTo(97, 2);
    expect(r.cuotaFinal).toBeCloseTo(283.20, 2);
  });

  test('el tope de 196.000 € es del TOTAL, no del incremento suelto', () => {
    // Recién nacido: 100.000 + 21 × 12.000 = 352.000 sin tope. Con tope, 196.000.
    const r = calcularSucesion({ baseImponible: 400000, ccaa: 'cataluna', grupo: 'I-descendiente', edadHeredero: 0 });
    expect(r.totalReducciones).toBe(196000);
    // Base 204.000 → 14.500 + 17 % de 54.000 = 23.680 € de cuota íntegra
    expect(r.cuotaIntegra).toBeCloseTo(23680, 2);
    // Escala del Grupo I sobre base imponible 400.000: 95,25 % → 1.124,80 €
    expect(r.cuotaFinal).toBeCloseTo(1124.80, 2);
  });
});

test.describe('Cataluña — reducción por vivienda habitual (art. 17 Ley 19/2010)', () => {
  test('el tope es 500.000 €, no los 122.606,47 € estatales', () => {
    // Vivienda de 600.000 € → 95 % son 570.000, por encima del tope catalán.
    const r = calcularSucesion({
      baseImponible: 900000, ccaa: 'cataluna', grupo: 'II', edadHeredero: 50, viviendaHabitual: 600000,
    });
    expect(r.reduccionVivienda).toBe(500000);
    // Base 900.000 − 100.000 − 500.000 = 300.000 → 14.500 + 17 % de 150.000 = 40.000 €
    expect(r.cuotaIntegra).toBeCloseTo(40000, 2);
    // Escala del Grupo II sobre base imponible 900.000 (45,28 %) → 21.888,89 €
    expect(r.cuotaFinal).toBeCloseTo(21888.89, 2);
  });

  test('el colateral menor de 65 años NO la tiene, y se dice por qué', () => {
    const r = calcularSucesion({
      baseImponible: 250000, ccaa: 'cataluna', grupo: 'III', edadHeredero: 40, viviendaHabitual: 180000,
    });
    expect(r.reduccionVivienda).toBe(0);
    expect(r.reduccionViviendaNoAplicada).toContain('colateral');
    // Base 242.000 → 14.500 + 17 % de 92.000 = 30.140, × 1,5882 = 47.868,35 €
    expect(r.cuotaFinal).toBeCloseTo(47868.35, 2);
  });

  test('el colateral de 65 o más que convivió los 2 años SÍ la tiene', () => {
    const r = calcularSucesion({
      baseImponible: 250000, ccaa: 'cataluna', grupo: 'III', edadHeredero: 70,
      viviendaHabitual: 180000, convivenciaDosAnios: true,
    });
    expect(r.reduccionVivienda).toBe(171000);
    // Base 71.000 → 3.500 + 11 % de 21.000 = 5.810, × 1,5882 = 9.227,44 €
    expect(r.cuotaFinal).toBeCloseTo(9227.44, 2);
  });

  test('el límite de 500.000 € se prorratea entre herederos, con suelo de 180.000 €', () => {
    // Piso de 1.000.000 € entre dos hijos al 50 %: sin prorrateo reducirían 475.000 € cada uno
    // (950.000 en total), casi el doble del tope que fija la ley.
    const r = calcularHerenciaConjunta(2000000, [
      { nombre: 'Hijo 1', grupo: 'II', ccaa: 'cataluna', porcentaje: 50, edadHeredero: 45, viviendaHabitual: 500000 },
      { nombre: 'Hijo 2', grupo: 'II', ccaa: 'cataluna', porcentaje: 50, edadHeredero: 45, viviendaHabitual: 500000 },
    ]);
    // Límite de cada uno: 500.000 × (500.000 / 1.000.000) = 250.000 €
    // Reducción de cada uno: mín(95 % de 500.000 = 475.000; 250.000) = 250.000 €
    // Base de cada uno: 1.000.000 − 100.000 − 250.000 = 650.000 €
    expect(r.herederos[0].reduccion).toBe(350000);
    expect(r.herederos[0].baseImponible).toBe(650000);
  });
});

/**
 * Bonificación en cuota del art. 58 bis (Fase B, 09/09/2026).
 *
 * Hasta hoy el motor la dejaba en 0 % para toda Cataluña, y ese era el mayor error que quedaba
 * tras corregir las reducciones: al cónyuge se le decían 57.000 € donde paga 570 €.
 *
 * ⚠️ SON DOS ESCALAS. La página de la Agència Tributària publica una para el Grupo I (99 %→20 %)
 * y otra para el Grupo II (60 %→0 %), y una primera lectura de la fuente solo devolvió la
 * segunda. Aplicarle esa al menor de 21 años le habría costado casi la cuota entera: para
 * 250.000 € de base son 56,00 % contra 97,40 %.
 */
test.describe('Cataluña — bonificación del art. 58 bis', () => {
  /**
   * La escala es MARGINAL: cada tramo bonifica su porción de base imponible y el porcentaje
   * final es el medio ponderado. Estas son las medias que la ATC publica en cada límite de
   * tramo, que es lo que permite comprobar la transcripción de los marginales sin volver a la
   * web.
   *
   * La tolerancia es medio decimal de los DOS con los que publica la ATC, más un margen de
   * coma flotante: el tramo de 2.000.000 € del Grupo II vale 35,875 % exacto y la tabla lo
   * redondea a 35,88 €, así que la diferencia legítima es de 0,005 clavados — y en binario
   * sale 0,005000000000002558, que con un `<= 0.005` a secas fallaría por el residuo.
   */
  const TOLERANCIA_REDONDEO_ATC = 0.0051;
  const MEDIAS_OFICIALES: Array<{ base: number; grupoI: number; grupoII: number }> = [
    { base: 100000,  grupoI: 99.00, grupoII: 60.00 },
    { base: 200000,  grupoI: 98.00, grupoII: 57.50 },
    { base: 300000,  grupoI: 97.00, grupoII: 55.00 },
    { base: 500000,  grupoI: 94.20, grupoII: 51.00 },
    { base: 750000,  grupoI: 89.47, grupoII: 47.33 },
    { base: 1000000, grupoI: 84.60, grupoII: 44.25 },
    { base: 1500000, grupoI: 76.40, grupoII: 39.50 },
    { base: 2000000, grupoI: 69.80, grupoII: 35.88 },
    { base: 2500000, grupoI: 63.84, grupoII: 32.70 },
    { base: 3000000, grupoI: 57.37, grupoII: 28.92 },
  ];

  test('la escala del Grupo I reproduce las diez medias que publica la ATC', () => {
    for (const { base, grupoI } of MEDIAS_OFICIALES) {
      const pct = porcentajeBonificacionPonderada(base, ESCALA_BONIF_CATALUNA_GRUPO_I_IS) * 100;
      expect(Math.abs(pct - grupoI), `base ${base}: ${pct} ≠ ${grupoI}`).toBeLessThanOrEqual(TOLERANCIA_REDONDEO_ATC);
    }
  });

  test('la escala del Grupo II reproduce las diez medias que publica la ATC', () => {
    for (const { base, grupoII } of MEDIAS_OFICIALES) {
      const pct = porcentajeBonificacionPonderada(base, ESCALA_BONIF_CATALUNA_GRUPO_II_IS) * 100;
      expect(Math.abs(pct - grupoII), `base ${base}: ${pct} ≠ ${grupoII}`).toBeLessThanOrEqual(TOLERANCIA_REDONDEO_ATC);
    }
  });

  test('el porcentaje es el MEDIO ponderado, no el del tramo en el que cae la base', () => {
    // 250.000 no está en la tabla. Grupo II: (100.000×60 + 100.000×55 + 50.000×50) / 250.000
    // = 140.000 / 250.000 = 56,00 %. Un `escalonado` de tramos planos habría dado 50 %.
    expect(porcentajeBonificacionPonderada(250000, ESCALA_BONIF_CATALUNA_GRUPO_II_IS) * 100).toBeCloseTo(56, 2);
    expect(porcentajeBonificacionPonderada(250000, ESCALA_BONIF_CATALUNA_GRUPO_I_IS) * 100).toBeCloseTo(97.4, 2);
  });

  test('el CÓNYUGE bonifica el 99 % fijo, sin escala: 57.000 € pasan a ser 570 €', () => {
    const r = calcularSucesion({ baseImponible: 500000, ccaa: 'cataluna', grupo: 'I-conyuge', edadHeredero: 60 });
    expect(r.cuotaIntegra).toBeCloseTo(57000, 2);   // la cifra que se daba antes como final
    expect(r.porcentajeBonificacion).toBe(99);
    expect(r.cuotaFinal).toBeCloseTo(570, 2);
  });

  test('el menor de 21 años NO usa la escala del Grupo II, que le costaría la cuota entera', () => {
    const menor = calcularSucesion({ baseImponible: 400000, ccaa: 'cataluna', grupo: 'I-descendiente', edadHeredero: 0 });
    const mayor = calcularSucesion({ baseImponible: 400000, ccaa: 'cataluna', grupo: 'II' });
    expect(menor.porcentajeBonificacion).toBeCloseTo(95.25, 2);  // escala del Grupo I
    expect(mayor.porcentajeBonificacion).toBeCloseTo(52.50, 2);  // escala del Grupo II
  });

  test('los Grupos III y IV quedan fuera del art. 58 bis', () => {
    for (const grupo of ['III', 'IV'] as const) {
      const r = calcularSucesion({ baseImponible: 250000, ccaa: 'cataluna', grupo, edadHeredero: 40 });
      expect(r.bonificacionCcaa).toBe(0);
      expect(r.porcentajeBonificacion).toBe(0);
    }
  });

  test('por encima de 3.000.000 € el Grupo II deja de bonificar el exceso', () => {
    // El último tramo del Grupo II tiene marginal 0: la bonificación absoluta se congela y el
    // porcentaje medio cae. El del Grupo I sigue al 20 %, así que nunca se estanca del todo.
    expect(porcentajeBonificacionPonderada(6000000, ESCALA_BONIF_CATALUNA_GRUPO_II_IS) * 100).toBeCloseTo(14.46, 2);
    expect(porcentajeBonificacionPonderada(6000000, ESCALA_BONIF_CATALUNA_GRUPO_I_IS) * 100).toBeCloseTo(38.68, 2);
  });
});

test.describe('Régimen común — que la corrección catalana no se haya llevado nada por delante', () => {
  test('Madrid sigue aplicando el tope estatal de 122.606,47 €', () => {
    const r = calcularSucesion({
      baseImponible: 250000, ccaa: 'madrid', grupo: 'II', edadHeredero: 45, viviendaHabitual: 180000,
    });
    expect(r.reduccionVivienda).toBeCloseTo(122606.47, 2);
    expect(r.reduccionParentesco).toBeCloseTo(15956.87, 2);
    expect(r.cuotaFinal).toBeCloseTo(103.46, CENTIMO);
  });

  test('el nieto NO pierde la bonificación del 99 % por tener grupo propio', () => {
    // 'II-descendiente' no existe en `BONIFICACIONES_CCAA_IS`: si no se colapsara sobre 'II',
    // el nieto se quedaría sin bonificación y pagaría 10.346 € en vez de 103,46 €.
    const hijo = calcularSucesion({ baseImponible: 250000, ccaa: 'madrid', grupo: 'II', edadHeredero: 45, viviendaHabitual: 180000 });
    const nieto = calcularSucesion({ baseImponible: 250000, ccaa: 'madrid', grupo: 'II-descendiente', edadHeredero: 45, viviendaHabitual: 180000 });
    expect(nieto.porcentajeBonificacion).toBe(99);
    expect(nieto.cuotaFinal).toBeCloseTo(hijo.cuotaFinal, CENTIMO);
  });

  test('el incremento estatal del Grupo I mantiene su tope de 47.858,59 €', () => {
    const r = calcularSucesion({ baseImponible: 300000, ccaa: 'madrid', grupo: 'I-descendiente', edadHeredero: 0 });
    expect(r.reduccionParentesco + r.reduccionEdadMenor21).toBeCloseTo(47858.59, 2);
  });
});

test.describe('Sellos: cada rama dice de cuándo es su verificación', () => {
  test('un cálculo catalán cita la Ley 19/2010 y su fecha propia', () => {
    const r = calcularSucesion({ baseImponible: 250000, ccaa: 'cataluna', grupo: 'II', edadHeredero: 45 });
    expect(r.fuenteDatos).toContain('19/2010');
    expect(r.fuenteDatos).toContain('2026-09-08');
  });

  test('el resto de comunidades siguen con el sello del módulo, sin heredar el catalán', () => {
    const r = calcularSucesion({ baseImponible: 250000, ccaa: 'madrid', grupo: 'II', edadHeredero: 45 });
    expect(r.fuenteDatos).toContain('Ley 29/1987');
    expect(r.fuenteDatos).not.toContain('2026-09-08');
  });
});
