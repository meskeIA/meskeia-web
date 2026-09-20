import { test, expect } from '@playwright/test';
import {
  MATRICES_CVD,
  CVD_META,
  simularColor,
  srgbALineal,
  linealASrgb,
  matrizParaFeColorMatrix,
  puedeFundirColores,
  type TipoCVD,
} from '@/lib/calculadoras/daltonismo';

/**
 * Motor de simulación de daltonismo — Machado et al. (2009)
 *
 * Existe porque el defecto que este motor repara era INVISIBLE en pantalla: las dos apps que
 * simulaban daltonismo pintaban colores plausibles, bonitos y equivocados, y cada una los
 * suyos. Lo que delata el modelo no es el aspecto, son las propiedades algebraicas de la
 * matriz, y eso solo se ve probándolo aparte.
 *
 * Los valores esperados se calculan A MANO en el comentario de cada caso, nunca copiando lo
 * que devuelve el propio motor.
 */

const DICROMACIAS: TipoCVD[] = ['protanopia', 'deuteranopia', 'tritanopia'];
const ANOMALIAS: TipoCVD[] = ['protanomaly', 'deuteranomaly', 'tritanomaly'];

const det = (m: readonly (readonly number[])[]): number =>
  m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
  m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
  m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);

test.describe('matrices de Machado — las propiedades que delatan un modelo falso', () => {
  test('cada fila suma 1: la simulación conserva el blanco', () => {
    for (const [tipo, m] of Object.entries(MATRICES_CVD)) {
      for (const [i, fila] of m.entries()) {
        const suma = fila.reduce((a, b) => a + b, 0);
        // 1e-5 es el redondeo con el que el paper publica sus seis decimales.
        expect(suma, `${tipo} fila ${i}`).toBeCloseTo(1, 5);
      }
    }
  });

  test('protanopia y deuteranopia son SINGULARES: colapsan el espacio de 3 a 2 dimensiones', () => {
    // Es la prueba que descartó al juego HCIRN/Wickline que había antes, cuyas matrices daban
    // 0,006822 y −0,052500: invertibles, y por tanto incapaces de fundir dos colores en uno.
    expect(Math.abs(det(MATRICES_CVD.protanopia))).toBeLessThan(1e-4);
    expect(Math.abs(det(MATRICES_CVD.deuteranopia))).toBeLessThan(1e-4);
  });

  test('la tritanopia de Machado NO es singular, y se declara como tal', () => {
    // No es un error de transcripción: el modelo se ajusta peor a la tritanopia, la más rara
    // y con menos datos experimentales. Se deja como la publican y se declara que esa vista
    // no garantiza fusión de colores, en vez de prometer lo que no puede dar.
    expect(Math.abs(det(MATRICES_CVD.tritanopia))).toBeGreaterThan(0.1);
    expect(puedeFundirColores('tritanopia')).toBe(false);
    expect(puedeFundirColores('protanopia')).toBe(true);
    expect(puedeFundirColores('deuteranopia')).toBe(true);
  });

  test('las anomalías son invertibles: una tricromacia anómala NO colapsa el espacio', () => {
    for (const tipo of ANOMALIAS) {
      expect(Math.abs(det(MATRICES_CVD[tipo])), tipo).toBeGreaterThan(1e-4);
    }
  });

  test('las anomalías se simulan a severidad 0,6, no a 1,0: si no, serían la dicromacia', () => {
    expect(CVD_META.severidadAnomalia).toBe(0.6);
    // Con severidad 1,0 estas dos matrices serían idénticas y la interfaz ofrecería una
    // distinción que no existe.
    expect(MATRICES_CVD.protanomaly).not.toEqual(MATRICES_CVD.protanopia);
    expect(MATRICES_CVD.deuteranomaly).not.toEqual(MATRICES_CVD.deuteranopia);
  });
});

test.describe('conversión de espacio de color', () => {
  test('la curva sRGB va y vuelve sin perder el valor', () => {
    for (const v of [0, 1, 10, 55, 128, 200, 254, 255]) {
      expect(linealASrgb(srgbALineal(v)), `canal ${v}`).toBe(v);
    }
  });

  test('el tramo lineal y el de potencia son los de la especificación sRGB', () => {
    // 10/255 = 0,039216 ≤ 0,04045 → tramo lineal: 0,039216/12,92 = 0,0030353
    expect(srgbALineal(10)).toBeCloseTo(0.0030353, 6);
    // 128/255 = 0,501961 > 0,04045 → ((0,501961+0,055)/1,055)^2,4 = 0,527115^2,4 = 0,215861
    expect(srgbALineal(128)).toBeCloseTo(0.21586, 5);
    expect(srgbALineal(255)).toBe(1);
  });
});

test.describe('simulación de color — casos resueltos a mano', () => {
  test('«normal» devuelve el original intacto', () => {
    expect(simularColor([220, 38, 38], 'normal')).toEqual([220, 38, 38]);
  });

  test('blanco y negro se conservan en las ocho vistas', () => {
    for (const tipo of Object.keys(MATRICES_CVD) as TipoCVD[]) {
      // El blanco se conserva porque cada fila suma 1; el negro, porque la matriz es lineal.
      expect(simularColor([255, 255, 255], tipo), `blanco en ${tipo}`).toEqual([255, 255, 255]);
      expect(simularColor([0, 0, 0], tipo), `negro en ${tipo}`).toEqual([0, 0, 0]);
    }
  });

  test('rojo puro en protanopia → rgb(109, 95, 0)', () => {
    // A mano: #FF0000 en lineal es (1, 0, 0), así que el resultado es la primera COLUMNA.
    //   R' = 0,152286 → 1,055·0,152286^(1/2,4) − 0,055 = 0,42654 → 108,8 → 109
    //   G' = 0,114503 → 1,055·0,114503^(1/2,4) − 0,055 = 0,37272 →  95,1 →  95
    //   B' = −0,003882 → negativo, se acota a 0
    expect(simularColor([255, 0, 0], 'protanopia')).toEqual([109, 95, 0]);
  });

  test('el rojo se OSCURECE en protanopia, que es lo que la interfaz promete', () => {
    // Luminancia relativa (Rec.709) sobre luz lineal, antes y después.
    const lum = (c: [number, number, number]) =>
      0.2126 * srgbALineal(c[0]) + 0.7152 * srgbALineal(c[1]) + 0.0722 * srgbALineal(c[2]);
    const original = lum([255, 0, 0]); // = 0,2126
    const visto = lum(simularColor([255, 0, 0], 'protanopia'));
    expect(original).toBeCloseTo(0.2126, 4);
    // Con las matrices HCIRN que había antes salía 0,5194: el rojo se veía 2,4 veces MÁS
    // luminoso, justo lo contrario de «el rojo se percibe muy oscuro».
    expect(visto).toBeLessThan(original);
  });

  test('protanopia y deuteranopia no dan lo mismo', () => {
    const p = simularColor([0, 200, 80], 'protanopia');
    const d = simularColor([0, 200, 80], 'deuteranopia');
    expect(p).not.toEqual(d);
  });

  test('un par de confusión protán se funde: dos colores distintos, el mismo resultado', () => {
    // La prueba de fuego del modelo. Separados a simple vista, indistinguibles para un
    // protánope: es lo que una app de diseño accesible tiene que poder enseñar.
    const verde = simularColor([0, 104, 8], 'protanopia');
    const rojo = simularColor([248, 8, 0], 'protanopia');
    for (let i = 0; i < 3; i++) {
      expect(Math.abs(verde[i] - rojo[i]), `canal ${i}`).toBeLessThanOrEqual(3);
    }
  });

  test('acromatopsia: gris puro, y con la luminancia de luz lineal', () => {
    const gris = simularColor([255, 0, 0], 'achromatopsia');
    expect(gris[0]).toBe(gris[1]);
    expect(gris[1]).toBe(gris[2]);
    // A mano: luminancia del rojo puro = 0,2126 en lineal → 1,055·0,2126^(1/2,4) − 0,055
    //       = 1,055·0,52 − 0,055 = 0,4936 → 126 (con los 0,299/0,587/0,114 de Rec.601 sobre
    //       luz lineal salía 149, que no es ningún convenio).
    expect(gris[0]).toBeGreaterThanOrEqual(125);
    expect(gris[0]).toBeLessThanOrEqual(127);
  });
});

test.describe('serialización para SVG', () => {
  test('feColorMatrix recibe 4 filas de 5 y deja pasar el alfa', () => {
    const values = matrizParaFeColorMatrix('deuteranopia');
    const numeros = values.trim().split(/\s+/).map(Number);
    expect(numeros).toHaveLength(20);
    // Última fila: el alfa pasa tal cual.
    expect(numeros.slice(15)).toEqual([0, 0, 0, 1, 0]);
    // Primera fila: los tres coeficientes de la matriz, y cero en alfa y desplazamiento.
    expect(numeros.slice(0, 5)).toEqual([0.367322, 0.860646, -0.227968, 0, 0]);
  });

  test('las tres dicromacias tienen su serialización', () => {
    for (const tipo of DICROMACIAS) {
      expect(matrizParaFeColorMatrix(tipo).split(/\s+/).filter(Boolean), tipo).toHaveLength(20);
    }
  });
});
