/**
 * Motores de panadería: DDT (temperatura del agua) y tiempo de fermentación.
 *
 * Ejecutar con: npm run test:calc  (lógica pura en Node, sin navegador ni servidor)
 *
 * Por qué existe: hasta el 24/08/2026 ninguno de los dos motores tenía test, y ese día
 * `calculadora-porcentaje-panadero` —83 usos/30 d, la app que sostiene Coquinum junto a
 * `calculadora-masa-madre`— los absorbió como pasos 2 y 3 de la misma sesión de amasado.
 * Un motor que pasa de una página con 4 visitas al mes a otra con 83 merece su candado:
 * el build no puede ver que una fórmula térmica esté mal, solo que compile.
 *
 * Los valores esperados están calculados a mano a partir de las fórmulas, que son públicas
 * y elementales:
 *   · DDT (3 factores):  T_agua = DDT × 3 − T_ambiente − T_harina − T_fricción
 *   · DDT (4 factores):  T_agua = DDT × 4 − T_ambiente − T_harina − T_fricción − T_prefermento
 *   · Fermentación (Q10 = 2): tiempo = tiempo_receta × 2^((T_receta − T_real) / 10)
 */

import { test, expect } from '@playwright/test';
import {
  calcularBakersPercentage,
  calcularBakersPercentageDesdePeso,
  calcularDDT,
  descomponerPrefermento,
} from '../lib/calculadoras/cocina';
import {
  ajustarFermentacion,
  formatearTiempo,
} from '../lib/calculadoras/fermentacionTemperatura';

test.describe('DDT — temperatura del agua de amasado', () => {
  test('A MANO: 24 °C de objetivo, cocina y harina a 22 °C, sin amasadora → agua a 28 °C', () => {
    // 24 × 3 − 22 − 22 − 0 = 28   (son los valores por defecto del bloque de la app)
    const r = calcularDDT(24, 22, 22, 'manual');
    expect(r.temperatura_agua_c).toBe(28);
    expect(r.advertencia).toBeNull();
  });

  test('FRICCIÓN: la amasadora de pie resta sus 8 °C al agua', () => {
    // 24 × 3 − 22 − 22 − 8 = 20
    expect(calcularDDT(24, 22, 22, 'kitchen_aid').temperatura_agua_c).toBe(20);
    // 24 × 3 − 22 − 22 − 12 = 16
    expect(calcularDDT(24, 22, 22, 'thermomix').temperatura_agua_c).toBe(16);
  });

  test('CUATRO FACTORES: con prefermento la fórmula multiplica por 4 y resta su temperatura', () => {
    // 24 × 4 − 20 − 20 − 0 − 20 = 36
    expect(calcularDDT(24, 20, 20, 'manual', 20).temperatura_agua_c).toBe(36);
  });

  test('MONOTONÍA: cuanto más caliente la cocina, más fría tiene que ir el agua', () => {
    const fria = calcularDDT(24, 16, 16, 'manual').temperatura_agua_c;
    const templada = calcularDDT(24, 22, 22, 'manual').temperatura_agua_c;
    const calurosa = calcularDDT(24, 30, 30, 'manual').temperatura_agua_c;
    expect(fria).toBeGreaterThan(templada);
    expect(templada).toBeGreaterThan(calurosa);
  });

  test('AVISO: por encima de 40 °C el agua empieza a dañar la levadura y hay que decirlo', () => {
    // 30 × 3 − 15 − 15 − 0 = 60
    const r = calcularDDT(30, 15, 15, 'manual');
    expect(r.temperatura_agua_c).toBe(60);
    expect(r.advertencia).not.toBeNull();
  });

  test('CONVERSIÓN: los grados Fahrenheit son los mismos grados, no otro cálculo', () => {
    const r = calcularDDT(24, 22, 22, 'manual');
    expect(r.temperatura_agua_f).toBeCloseTo(r.temperatura_agua_c * 9 / 5 + 32, 1);
  });
});

test.describe('Fermentación — el mismo pan a otra temperatura', () => {
  test('A MANO: +10 °C sobre la receta reduce el tiempo a la mitad', () => {
    const r = ajustarFermentacion(4, 24, 34);
    expect(r?.tiempoHoras).toBe(2);
    expect(r?.masRapido).toBe(true);
  });

  test('A MANO: −10 °C sobre la receta lo duplica', () => {
    const r = ajustarFermentacion(4, 24, 14);
    expect(r?.tiempoHoras).toBe(8);
    expect(r?.masRapido).toBe(false);
  });

  test('NEUTRO: a la temperatura de la receta, el tiempo es el de la receta', () => {
    const r = ajustarFermentacion(3, 24, 24);
    expect(r?.tiempoHoras).toBe(3);
    expect(r?.factor).toBe(1);
    expect(r?.masRapido).toBe(false);
  });

  test('A MANO: los valores por defecto del bloque (2 h de 24 °C a 22 °C) dan 2 h 18 min', () => {
    // factor = 2^(2/10) = 1,1487 → 2 × 1,1487 = 2,3 h
    const r = ajustarFermentacion(2, 24, 22);
    expect(r?.tiempoHoras).toBe(2.3);
    expect(formatearTiempo(r!.tiempoHoras)).toBe('2 h 18 min');
  });

  test('SIN TIEMPO NO HAY ESTIMACIÓN: un tiempo de receta no positivo devuelve null', () => {
    expect(ajustarFermentacion(0, 24, 22)).toBeNull();
    expect(ajustarFermentacion(-1, 24, 22)).toBeNull();
  });

  test('FORMATO: horas y minutos en español, sin decimales sueltos', () => {
    expect(formatearTiempo(1)).toBe('1 h');
    expect(formatearTiempo(0.5)).toBe('30 min');
    expect(formatearTiempo(0)).toBe('—');
  });
});

test.describe('Porcentaje del panadero — modo inverso (peso final → gramos)', () => {
  test('A MANO: masa de 1000 g al 65/2/0,3 % → harina ≈ 598 g (harina = peso / (1 + Σ%/100))', () => {
    // harina = 1000 / (1 + 67,3/100) = 597,73 → redondeado 598
    const r = calcularBakersPercentageDesdePeso(1000, [
      { nombre: 'Agua', porcentaje: 65 },
      { nombre: 'Sal', porcentaje: 2 },
      { nombre: 'Levadura', porcentaje: 0.3 },
    ]);
    expect(r.harina_g).toBe(598);
    expect(r.ingredientes.map(i => i.gramos)).toEqual([389, 12, 2]);
    expect(r.hidratacion_pct).toBe(65);
    // El peso real puede diferir 1-2 g del objetivo por el redondeo a gramos enteros.
    expect(r.pesoMasa_g).toBe(1001);
  });

  test('PORCIONES: un molde de 540 g a 60/2/1 % en porciones de 90 g da exactamente 6', () => {
    const r = calcularBakersPercentageDesdePeso(
      540,
      [
        { nombre: 'Agua', porcentaje: 60 },
        { nombre: 'Sal', porcentaje: 2 },
        { nombre: 'Levadura', porcentaje: 1 },
      ],
      90,
    );
    expect(r.pesoMasa_g).toBe(540);
    expect(r.rendimiento_porciones).toBe(6);
  });

  test('CONSISTENCIA IDA-VUELTA: invertir el resultado del modo directo reproduce los mismos gramos', () => {
    const directo = calcularBakersPercentage(1000, [
      { nombre: 'Agua', gramos: 650 },
      { nombre: 'Sal', gramos: 20 },
      { nombre: 'Levadura', gramos: 3 },
    ]);
    const inverso = calcularBakersPercentageDesdePeso(
      directo.pesoMasa_g,
      directo.ingredientes.map(i => ({ nombre: i.nombre, porcentaje: i.porcentajePanadero })),
    );
    expect(inverso.harina_g).toBe(directo.harina_g);
    expect(inverso.ingredientes.map(i => i.gramos)).toEqual(
      directo.ingredientes.map(i => i.gramos),
    );
  });
});

/**
 * Prefermentos (masa madre, poolish, biga, esponja).
 *
 * De dónde sale: hasta el 10/09/2026 un prefermento entraba en la lista como un ingrediente
 * plano, así que su harina y su agua no se contaban. La app enseñaba entonces una hidratación
 * FALSA y encima la etiquetaba («masa seca» / «hidratación muy alta»), que es justo lo que
 * prohíbe la regla de no dar una cifra bajo un aviso. La app hermana `calculadora-masa-madre`
 * ya explicaba el problema en su bloque educativo y sí lo resolvía; la que lo necesitaba, no.
 *
 * La descomposición es aritmética elemental: un prefermento de g gramos a hidratación h lleva
 * g/(1+h/100) de harina y el resto de agua.
 */
test.describe('Porcentaje del panadero — prefermentos', () => {
  test('A MANO: 200 g de masa madre al 100% son 100 g de harina y 100 g de agua', () => {
    expect(descomponerPrefermento('Masa madre', 200, 100)).toEqual({
      nombre: 'Masa madre', gramos: 200, hidratacion_pct: 100, harina_g: 100, agua_g: 100,
    });
    // Masa madre firme (50%): 300 / 1,5 = 200 g de harina, 100 g de agua.
    expect(descomponerPrefermento('Masa madre firme', 300, 50)).toMatchObject({
      harina_g: 200, agua_g: 100,
    });
  });

  test('LAS DOS MITADES SUMAN SIEMPRE LOS GRAMOS DE PARTIDA, pese al redondeo', () => {
    for (const [g, h] of [[100, 65], [237, 80], [55, 33], [1, 100]] as const) {
      const p = descomponerPrefermento('Prefermento', g, h);
      expect(p.harina_g + p.agua_g).toBe(g);
    }
  });

  test('EL CASO QUE MOTIVÓ EL ARREGLO: 1000 harina + 650 agua + 200 masa madre al 100%', () => {
    const receta = [
      { nombre: 'Agua', gramos: 650 },
      { nombre: 'Sal', gramos: 20 },
      { nombre: 'Levadura', gramos: 3 },
    ];

    // Sin declarar el prefermento la masa madre es un ingrediente plano: 650/1000 = 65,0%.
    const plano = calcularBakersPercentage(1000, [...receta, { nombre: 'Masa madre', gramos: 200 }]);
    expect(plano.hidratacion_pct).toBe(65);

    // Declarado: harina 1000+100 = 1100, agua 650+100 = 750 → 68,2%, y la sal deja de estar
    // al 2,0%. (La desviación crece con el prefermento: ver el caso de 400 g más abajo, que
    // sí cambia de categoría.)
    const real = calcularBakersPercentage(1000, [
      ...receta,
      { nombre: 'Masa madre', gramos: 200, prefermentoHidratacion_pct: 100 },
    ]);
    expect(real.harina_g).toBe(1100);
    expect(real.harinaAnadida_g).toBe(1000);
    expect(real.agua_g).toBe(750);
    expect(real.aguaAnadida_g).toBe(650);
    expect(real.hidratacion_pct).toBe(68.2);
    expect(real.harinaPrefermentada_pct).toBe(9.1);   // 100/1100
    expect(real.ingredientes.find(i => i.nombre === 'Sal')?.porcentajePanadero).toBe(1.8);

    // El peso de la masa no cambia: el prefermento pesa lo que pesa, se declare o no.
    expect(real.pesoMasa_g).toBe(plano.pesoMasa_g);
    expect(real.pesoMasa_g).toBe(1873);
  });

  test('CUANTO MÁS PREFERMENTO, MÁS SE DESVÍA: con 400 g la masa cambia de categoría', () => {
    // 400 g de masa madre al 100% = 200 de harina + 200 de agua.
    // harina 1200, agua 850 → 70,8%, que en la escala de la app ya es «hidratación alta»
    // (70-80), mientras sin declararla seguiría marcando 65,0% («estándar», 60-70).
    const r = calcularBakersPercentage(1000, [
      { nombre: 'Agua', gramos: 650 },
      { nombre: 'Masa madre', gramos: 400, prefermentoHidratacion_pct: 100 },
    ]);
    expect(r.harina_g).toBe(1200);
    expect(r.agua_g).toBe(850);
    expect(r.hidratacion_pct).toBe(70.8);
    expect(r.harinaPrefermentada_pct).toBe(16.7);   // 200/1200
  });

  test('DOS AGUAS: se suman todas las filas de agua, no solo la primera', () => {
    const r = calcularBakersPercentage(1000, [
      { nombre: 'Agua', gramos: 400 },
      { nombre: 'Agua tibia', gramos: 250 },
    ]);
    expect(r.hidratacion_pct).toBe(65);
  });

  test('MODO INVERSO: con prefermento al 20%, en la mesa se pesa menos harina y menos agua', () => {
    // Fórmula total: harina 100%, agua 65%, sal 2%, masa madre 20% al 100% de hidratación.
    // El prefermento NO suma peso propio (su harina y su agua ya están en los totales):
    // harina = 1670 / (1 + 67/100) = 1000.
    const r = calcularBakersPercentageDesdePeso(1670, [
      { nombre: 'Agua', porcentaje: 65 },
      { nombre: 'Sal', porcentaje: 2 },
      { nombre: 'Masa madre', porcentaje: 20, prefermentoHidratacion_pct: 100 },
    ]);
    expect(r.harina_g).toBe(1000);
    expect(r.pesoMasa_g).toBe(1670);
    expect(r.hidratacion_pct).toBe(65);
    // 200 g de masa madre = 100 de harina + 100 de agua, que se restan de lo que se pesa.
    expect(r.harinaAnadida_g).toBe(900);
    expect(r.aguaAnadida_g).toBe(550);
    // Y lo que se pone en la balanza vuelve a sumar el peso objetivo.
    expect(r.harinaAnadida_g + r.aguaAnadida_g + 20 + 200).toBe(1670);
  });

  test('FÓRMULA IMPOSIBLE: si el prefermento aporta más agua de la declarada, sale en negativo', () => {
    // Agua total 5% con una masa madre al 20%: el prefermento solo ya trae el 10%.
    const r = calcularBakersPercentageDesdePeso(1070, [
      { nombre: 'Agua', porcentaje: 5 },
      { nombre: 'Masa madre', porcentaje: 20, prefermentoHidratacion_pct: 100 },
    ]);
    expect(r.aguaAnadida_g).toBeLessThan(0);
  });

  test('REGRESIÓN: sin prefermentos, el resultado es el de toda la vida', () => {
    const r = calcularBakersPercentage(1000, [
      { nombre: 'Agua', gramos: 650 },
      { nombre: 'Sal', gramos: 20 },
      { nombre: 'Levadura', gramos: 3 },
    ]);
    expect(r.harina_g).toBe(r.harinaAnadida_g);
    expect(r.agua_g).toBe(r.aguaAnadida_g);
    expect(r.hidratacion_pct).toBe(65);
    expect(r.harinaPrefermentada_pct).toBe(0);
    expect(r.prefermentos).toEqual([]);
    expect(r.ingredientes.map(i => i.porcentajePanadero)).toEqual([65, 2, 0.3]);
  });

  test('SIN HARINA NINGUNA no se divide entre cero: los porcentajes salen a 0', () => {
    const r = calcularBakersPercentage(0, [{ nombre: 'Agua', gramos: 100 }]);
    expect(r.hidratacion_pct).toBe(0);
    expect(r.ingredientes[0].porcentajePanadero).toBe(0);
  });
});
