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
  ajustarRangoFermentacion,
  formatearTiempo,
} from '../lib/calculadoras/fermentacionTemperatura';
import { FERMENTACION_MM_REF } from '../lib/calculadoras/cocina';
import {
  calcularRecetaPan,
  TIPOS_PAN,
  RITMO_POR_ID,
  type EntradaRecetaPan,
} from '../lib/calculadoras/recetaPan';

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

test.describe('Fermentación — la HORQUILLA de masa madre ajustada a la cocina', () => {
  // Añadido el 13/09/2026, cuando `calculadora-masa-madre` dejó de imprimir un «4–6 h» fijo.
  // Los esperados salen de aplicar el Q10 a MANO a los dos extremos:
  //   tiempo = horas × 2^((24 − T) / 10),  redondeado a dos decimales por el motor.
  const { horasMin, horasMax, tempRefC } = FERMENTACION_MM_REF;

  test('A MANO: una cocina a 20 °C estira la horquilla de 4–6 h a 5,28–7,92 h', () => {
    // 2^((24 − 20) / 10) = 2^0,4 = 1,3195…  →  4 × 1,3195 = 5,28   ·   6 × 1,3195 = 7,92
    const r = ajustarRangoFermentacion(horasMin, horasMax, tempRefC, 20);
    expect(r).not.toBeNull();
    expect(r!.horasMin).toBe(5.28);
    expect(r!.horasMax).toBe(7.92);
    expect(r!.factor).toBe(1.32);
    expect(r!.masRapido).toBe(false);
    expect(formatearTiempo(r!.horasMin)).toBe('5 h 17 min');
    expect(formatearTiempo(r!.horasMax)).toBe('7 h 55 min');
  });

  test('A MANO: una cocina a 28 °C la encoge a 3,03–4,55 h', () => {
    // 2^((24 − 28) / 10) = 2^−0,4 = 0,7579…  →  4 × 0,7579 = 3,03   ·   6 × 0,7579 = 4,55
    const r = ajustarRangoFermentacion(horasMin, horasMax, tempRefC, 28);
    expect(r!.horasMin).toBe(3.03);
    expect(r!.horasMax).toBe(4.55);
    expect(r!.masRapido).toBe(true);
    expect(formatearTiempo(r!.horasMin)).toBe('3 h 2 min');
    expect(formatearTiempo(r!.horasMax)).toBe('4 h 33 min');
  });

  test('NEUTRO: a la temperatura de referencia sale la horquilla de la receta, sin desviarla', () => {
    const r = ajustarRangoFermentacion(horasMin, horasMax, tempRefC, tempRefC);
    expect(r!.horasMin).toBe(horasMin);
    expect(r!.horasMax).toBe(horasMax);
    expect(r!.factor).toBe(1);
  });

  test('LOS DOS EXTREMOS se mueven: ajustar solo uno daría un rango que no existe', () => {
    const r = ajustarRangoFermentacion(horasMin, horasMax, tempRefC, 18)!;
    expect(r.horasMin).toBeGreaterThan(horasMin);
    expect(r.horasMax).toBeGreaterThan(horasMax);
    // Y la horquilla sigue siendo una horquilla, no se cruza ni se colapsa.
    expect(r.horasMax).toBeGreaterThan(r.horasMin);
  });

  test('FUERA DEL MODELO no se da cifra: por debajo de 4 °C y por encima de 32 °C, null', () => {
    // El Q10 extrapolaría un número convincente donde la levadura ya no se comporta así:
    // a 2 °C queda casi parada y a 40 °C se estresa. Un null obliga a la app a decirlo.
    expect(ajustarRangoFermentacion(horasMin, horasMax, tempRefC, 2)).toBeNull();
    expect(ajustarRangoFermentacion(horasMin, horasMax, tempRefC, 40)).toBeNull();
    expect(ajustarRangoFermentacion(horasMin, horasMax, tempRefC, NaN)).toBeNull();
    // Los bordes SÍ valen: el rango es cerrado.
    expect(ajustarRangoFermentacion(horasMin, horasMax, tempRefC, 4)).not.toBeNull();
    expect(ajustarRangoFermentacion(horasMin, horasMax, tempRefC, 32)).not.toBeNull();
  });

  test('LA REFERENCIA lleva su temperatura: sin ella nadie puede ajustar la horquilla', () => {
    // El defecto que originó todo esto: el motor decía «4–6 h a temperatura ambiente», y
    // «ambiente» no es un número.
    expect(tempRefC).toBe(24);
    expect(horasMin).toBeLessThan(horasMax);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Receta de pan: de la harina que se pesa a la fórmula completa
//
// Es el camino INVERSO al del porcentaje del panadero, y por eso necesita sus propios
// casos: aquí la fórmula no la trae el usuario, la deduce el motor. Si se equivoca, el
// pan sale mal y nadie puede detectarlo leyendo la pantalla, porque no hay ningún número
// de entrada contra el que contrastar.
//
// Los valores esperados están calculados a mano con las reglas declaradas en el módulo:
//   · harina total = harina pesada / (1 − harina prefermentada), solo con masa madre
//   · agua = harina total × hidratación − el agua que ya traen leche, huevo, extras y fermento
//   · levadura seca = harina prefermentada / 10   (la equivalencia 1:20 de la app hermana)

test.describe('Receta de pan — el camino de la harina a la fórmula', () => {
  const base: EntradaRecetaPan = {
    harinaPesada_g: 1000,
    tipoPan: 'hogaza',
    harinaPrincipal: 'panificable',
    proporcionPrincipal: 100,
    fermento: 'seca',
    ritmo: 'normal',
    hidratacionMasaMadre: 100,
    extras: [],
  };

  test('A MANO: 1 kg de harina, hogaza rústica, levadura seca y ritmo de tarde', () => {
    // harina total = 1.000 (sin masa madre no hay harina escondida)
    // harina prefermentada = 7 % → 70 g  →  levadura seca = 70/10 = 7 g
    // agua = 1.000 × 72 % = 720 g · sal = 2 % = 20 g
    // masa = 1.000 + 720 + 7 + 20 = 1.747 g  →  2 piezas de 874 g
    const r = calcularRecetaPan(base)!;
    expect(r.harinaTotal_g).toBe(1000);
    expect(r.hidratacion_pct).toBe(72);

    const agua = r.ingredientes.find((i) => i.nombre === 'Agua')!;
    const sal = r.ingredientes.find((i) => i.nombre === 'Sal')!;
    const levadura = r.ingredientes.find((i) => i.nombre.startsWith('Levadura'))!;
    expect(agua.gramos).toBe(720);
    expect(sal.gramos).toBe(20);
    expect(levadura.gramos).toBe(7);

    expect(r.pesoMasa_g).toBe(1747);
    expect(r.piezas.cantidad).toBe(2);
  });

  test('A MANO: con masa madre, la harina que se PESA sigue siendo la que pidió el usuario', () => {
    // Es la trampa del cálculo: la masa madre mete harina de más, así que la fórmula se
    // calcula sobre 518,1 g aunque el usuario solo pese 500.
    // harina total = 500 / (1 − 0,035) = 518,13 · prefermentada = 18,13
    // masa madre al 100 % = 18,13 + 18,13 = 36,3 g
    // agua = 518,13 × 72 % − 18,13 = 354,9 g
    const r = calcularRecetaPan({ ...base, harinaPesada_g: 500, fermento: 'masa_madre', ritmo: 'lento' })!;
    expect(r.harinaTotal_g).toBe(518);
    expect(r.fermento.gramos).toBe(36);
    expect(r.fermento.harinaEnFermento_g).toBe(18);

    // La suma de las harinas de la lista es EXACTAMENTE lo que el usuario dijo que pesaría.
    const harinaAPesar = r.harinas.reduce((s, h) => s + h.gramos, 0);
    expect(harinaAPesar).toBe(500);

    const agua = r.ingredientes.find((i) => i.nombre === 'Agua')!;
    expect(agua.gramos).toBe(355);
    // Y la hidratación prometida se cumple contando el agua que va dentro del fermento.
    expect(r.hidratacion_pct).toBe(72);
  });

  test('EL HALLAZGO 288 NO VUELVE: cambiar la hidratación del fermento no cambia la fermentación', () => {
    // Lo que gobierna el ritmo es la harina prefermentada, no los gramos de masa madre. Si
    // se anclara en los gramos, dos panaderos con la misma receta y fermentos de distinta
    // hidratación fermentarían distinto creyendo hacer lo mismo.
    const alCien = calcularRecetaPan({ ...base, fermento: 'masa_madre', hidratacionMasaMadre: 100 })!;
    const alCincuenta = calcularRecetaPan({ ...base, fermento: 'masa_madre', hidratacionMasaMadre: 50 })!;

    expect(alCincuenta.fermento.harinaPrefermentada_g).toBe(alCien.fermento.harinaPrefermentada_g);
    // Los gramos de masa madre SÍ cambian, que es justo lo que debe pasar: es la misma
    // harina con menos agua alrededor.
    expect(alCincuenta.fermento.gramos).toBeLessThan(alCien.fermento.gramos);
    // Y la hidratación final de la masa no se mueve: el agua que el fermento deja de traer
    // se compensa en el agua que se añade.
    expect(alCincuenta.hidratacion_pct).toBe(alCien.hidratacion_pct);
  });

  test('LA HARINA CORRIGE EL AGUA, y en proporción a la mezcla', () => {
    // Espelta entera: 72 − 4 = 68 %. Media espelta: 72 − 2 = 70 %.
    const todaEspelta = calcularRecetaPan({ ...base, harinaPrincipal: 'espelta', proporcionPrincipal: 100 })!;
    const mediaEspelta = calcularRecetaPan({ ...base, harinaPrincipal: 'espelta', proporcionPrincipal: 50 })!;
    const centeno = calcularRecetaPan({ ...base, harinaPrincipal: 'centeno', proporcionPrincipal: 100 })!;

    expect(todaEspelta.hidratacionBase_pct).toBe(68);
    expect(mediaEspelta.hidratacionBase_pct).toBe(70);
    expect(centeno.hidratacionBase_pct).toBe(80); // 72 + 8

    // Y la mezcla reparte la harina en dos filas que suman el total.
    expect(mediaEspelta.harinas).toHaveLength(2);
    expect(mediaEspelta.harinas.reduce((s, h) => s + h.gramos, 0)).toBe(1000);
  });

  test('PASARSE DE PROPORCIÓN AVISA, no se calla ni se bloquea', () => {
    // El aviso es la parte útil: el número sale igual, pero con espelta al 100 % el pan sube
    // menos y conviene saberlo ANTES de amasar, no después de hornear.
    const espelta100 = calcularRecetaPan({ ...base, harinaPrincipal: 'espelta', proporcionPrincipal: 100 })!;
    const espelta50 = calcularRecetaPan({ ...base, harinaPrincipal: 'espelta', proporcionPrincipal: 50 })!;
    expect(espelta100.avisos.some((a) => /espelta/i.test(a))).toBe(true);
    expect(espelta50.avisos.some((a) => /espelta/i.test(a))).toBe(false);

    const centeno = calcularRecetaPan({ ...base, harinaPrincipal: 'centeno', proporcionPrincipal: 100 })!;
    expect(centeno.avisos.some((a) => /centeno/i.test(a))).toBe(true);
  });

  test('CON MASA MADRE NO HAY PAN EN DOS HORAS: se recalcula y se dice', () => {
    // Subir la dosis no compensa: la masa madre tiene menos levaduras por gramo y compite
    // con las bacterias lácticas. Dar una cifra para «lo antes posible» sería mentir.
    const r = calcularRecetaPan({ ...base, fermento: 'masa_madre', ritmo: 'rapido' })!;
    expect(r.avisos[0]).toMatch(/masa madre/i);
    expect(r.tiempo).toBe(RITMO_POR_ID.normal.tiempoMasaMadre);

    // Con levadura, en cambio, el ritmo rápido existe y lleva más dosis que el lento.
    const rapido = calcularRecetaPan({ ...base, ritmo: 'rapido' })!;
    const lento = calcularRecetaPan({ ...base, ritmo: 'lento' })!;
    const dosis = (r2: ReturnType<typeof calcularRecetaPan>) =>
      r2!.ingredientes.find((i) => i.nombre.startsWith('Levadura'))!.gramos;
    expect(dosis(rapido)).toBeGreaterThan(dosis(lento));
  });

  test('LA LEVADURA FRESCA ES EL TRIPLE DE LA SECA', () => {
    const seca = calcularRecetaPan(base)!;
    const fresca = calcularRecetaPan({ ...base, fermento: 'fresca' })!;
    const g = (r: ReturnType<typeof calcularRecetaPan>) =>
      r!.ingredientes.find((i) => i.nombre.startsWith('Levadura'))!.gramos;
    expect(g(fresca)).toBeCloseTo(g(seca) * 3, 1);
  });

  test('EL AGUA DE LA LECHE Y DEL HUEVO SE DESCUENTA: el brioche no se ahoga', () => {
    // Sin descontarla, un pan dulce con 15 % de leche y 25 % de huevo saldría con un 87 %
    // de líquido real donde la fórmula prometía 55 %, y la masa sería incontrolable.
    const r = calcularRecetaPan({ ...base, tipoPan: 'dulce' })!;
    const agua = r.ingredientes.find((i) => i.nombre === 'Agua')!;
    // 55 − 15×0,87 − 25×0,75 = 23,2 % → 232 g
    expect(agua.gramos).toBe(232);
    // Y el líquido total sigue siendo el 55 % prometido.
    expect(r.hidratacion_pct).toBe(55);
  });

  test('EL AGUA DEL REMOJO NO ES HIDRATACIÓN DE LA MASA', () => {
    // Es la regla que ninguna calculadora de pan aplica: las semillas se remojan aparte, y
    // esa agua no moja la harina. Contarla como hidratación daría una masa seca.
    const r = calcularRecetaPan({ ...base, extras: [{ id: 'semillas', porcentaje: 10 }] })!;
    expect(r.aguaRemojo_g).toBe(100); // 10 % de 1.000 g, remojo 1:1
    expect(r.hidratacion_pct).toBe(72); // intacta
    expect(r.avisos.some((a) => /remojan aparte/i.test(a))).toBe(true);
  });

  test('LA MIEL SÍ CAMBIA LA FÓRMULA: trae agua dentro y es azúcar', () => {
    const sinMiel = calcularRecetaPan(base)!;
    const conMiel = calcularRecetaPan({ ...base, extras: [{ id: 'miel', porcentaje: 10 }] })!;
    const agua = (r: ReturnType<typeof calcularRecetaPan>) =>
      r!.ingredientes.find((i) => i.nombre === 'Agua')!.gramos;

    // 10 % de miel sobre 1.000 g = 100 g, de los que 18 g son agua: el agua añadida baja.
    expect(agua(conMiel)).toBe(agua(sinMiel) - 18);
    // Y la hidratación final NO se mueve, porque esa agua sigue estando en la masa.
    expect(conMiel.hidratacion_pct).toBe(sinMiel.hidratacion_pct);

    // El azúcar de esos 100 g de miel son 82 g = 8,2 % de la harina: por DEBAJO del umbral,
    // así que no avisa. Al 15 % de miel son 12,3 % y entonces sí.
    expect(conMiel.avisos.some((a) => /azúcar/i.test(a))).toBe(false);
    const muchaMiel = calcularRecetaPan({ ...base, extras: [{ id: 'miel', porcentaje: 15 }] })!;
    expect(muchaMiel.avisos.some((a) => /azúcar/i.test(a))).toBe(true);
  });

  test('LOS FRUTOS SECOS NO TOCAN NADA, y pasado el 30 % se avisa', () => {
    const r = calcularRecetaPan({ ...base, extras: [{ id: 'nueces', porcentaje: 15 }] })!;
    expect(r.hidratacion_pct).toBe(72);
    expect(r.aguaRemojo_g).toBe(0);
    expect(r.extras[0].gramos).toBe(150);
    expect(r.avisos.some((a) => /inclusiones sólidas/i.test(a))).toBe(false);

    const cargado = calcularRecetaPan({
      ...base,
      extras: [{ id: 'nueces', porcentaje: 20 }, { id: 'pasas', porcentaje: 20 }],
    })!;
    expect(cargado.avisos.some((a) => /inclusiones sólidas/i.test(a))).toBe(true);
  });

  test('DEMASIADO LÍQUIDO NO DA UN AGUA NEGATIVA: se corta y se dice', () => {
    // Sin la guarda saldría un «Agua: −120 g» perfectamente formateado, que es la peor
    // forma de estar mal: parece un resultado.
    const r = calcularRecetaPan({ ...base, extras: [{ id: 'leche', porcentaje: 90 }] })!;
    expect(r.ingredientes.find((i) => i.nombre === 'Agua')).toBeUndefined();
    expect(r.avisos.some((a) => /más agua de la que este pan admite/i.test(a))).toBe(true);
  });

  test('INVARIANTE: la masa pesa lo que suman sus ingredientes, en los 7 panes', () => {
    for (const tipo of TIPOS_PAN) {
      for (const fermento of ['seca', 'fresca', 'masa_madre'] as const) {
        const r = calcularRecetaPan({ ...base, tipoPan: tipo.id, fermento })!;
        const suma =
          r.harinas.reduce((s, h) => s + h.gramos, 0) +
          r.ingredientes.reduce((s, i) => s + i.gramos, 0) +
          r.extras.reduce((s, e) => s + e.gramos, 0);
        // Tolerancia de 2 g por los redondeos de cada fila: la lista es para pesar en
        // cocina, no para cuadrar una contabilidad.
        expect(Math.abs(suma - r.pesoMasa_g)).toBeLessThanOrEqual(2);
        expect(r.piezas.cantidad).toBeGreaterThanOrEqual(1);
      }
    }
  });

  test('ENTRADA INÚTIL, RESULTADO NULO: sin harina no hay receta', () => {
    expect(calcularRecetaPan({ ...base, harinaPesada_g: 0 })).toBeNull();
    expect(calcularRecetaPan({ ...base, harinaPesada_g: -500 })).toBeNull();
    expect(calcularRecetaPan({ ...base, harinaPesada_g: NaN })).toBeNull();
  });
});
