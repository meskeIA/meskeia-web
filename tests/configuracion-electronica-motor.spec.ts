/**
 * Tests unitarios del motor de calculadora-configuracion-electronica
 *
 * Ejecutar: npx playwright test tests/configuracion-electronica-motor.spec.ts
 *
 * El motor CALCULA las configuraciones en vez de consultarlas, así que la prueba
 * más fuerte que se le puede hacer es contrastar sus 118 salidas con las 118
 * configuraciones publicadas en app/tabla-periodica/elementos-data.ts, que son
 * independientes y llevan años en producción. Si alguien toca el orden de
 * Madelung, la tabla de excepciones o la abreviatura de gas noble, esa
 * comparación lo detecta entero.
 *
 * El resto son casos resueltos a mano, y están elegidos por dónde falla la gente:
 *
 *   · Fe³⁺ = [Ar] 3d⁵     — pierde antes el 4s que el 3d, aunque el 4s se llenara antes
 *   · Cr   = [Ar] 3d⁵ 4s¹ — la excepción de manual
 *   · Pd   = [Kr] 4d¹⁰    — el único con la capa externa vacía, que rompe cualquier
 *                           cálculo de periodo o de grupo basado en «el nivel más alto»
 *   · Zn   = grupo 12     — su vecino el cobre es una excepción, así que restar las
 *                           configuraciones reales para hallar el bloque da bloque s
 */

import { test, expect } from '@playwright/test';
import {
  ELEMENTOS,
  analizar,
  cajasDeSubnivel,
  desapareadosDe,
  textoAbreviado,
  textoCompleto,
  textoEspecie,
} from '../app/calculadora-configuracion-electronica/motor';
import { elementos as ELEMENTOS_PUBLICADOS } from '../app/tabla-periodica/elementos-data';

test.describe('Configuración de los 118 elementos neutros', () => {
  test('coinciden con las publicadas en la tabla periódica', () => {
    const discrepancias: string[] = [];
    for (const publicado of ELEMENTOS_PUBLICADOS) {
      const r = analizar(publicado.numero, 0);
      expect(r, `Z=${publicado.numero} sin resultado`).not.toBeNull();
      const calculada = textoAbreviado(r!);
      if (calculada !== publicado.configuracionElectronica) {
        discrepancias.push(
          `${publicado.simbolo} (Z=${publicado.numero}): motor "${calculada}" ≠ publicada "${publicado.configuracionElectronica}"`
        );
      }
    }
    expect(discrepancias, discrepancias.join('\n')).toEqual([]);
  });

  test('el grupo y el periodo deducidos coinciden con los publicados', () => {
    const discrepancias: string[] = [];
    for (const publicado of ELEMENTOS_PUBLICADOS) {
      const r = analizar(publicado.numero, 0)!;
      if (r.periodo !== publicado.periodo) {
        discrepancias.push(`${publicado.simbolo}: periodo ${r.periodo} ≠ ${publicado.periodo}`);
      }
      // Las dos series interiores no se numeran por grupo y el motor devuelve null
      if (r.grupo !== null && r.grupo !== publicado.grupo) {
        discrepancias.push(`${publicado.simbolo}: grupo ${r.grupo} ≠ ${publicado.grupo}`);
      }
    }
    expect(discrepancias, discrepancias.join('\n')).toEqual([]);
  });

  test('los electrones siempre cuadran, para cualquier carga', () => {
    for (const e of ELEMENTOS) {
      for (const carga of [-2, -1, 0, 1, 2, 3, 4, 7]) {
        const r = analizar(e.z, carga);
        if (!r) continue;
        const suma = r.porNivel.reduce((total, s) => total + s.electrones, 0);
        expect(suma, `Z=${e.z} carga ${carga}`).toBe(e.z - carga);
        for (const s of r.porNivel) {
          expect(s.electrones, `Z=${e.z} carga ${carga}: ${s.n}${s.l} sobrelleno`).toBeLessThanOrEqual(
            2 * (2 * s.l + 1)
          );
        }
      }
    }
  });

  test('una carga imposible no devuelve una configuración vacía', () => {
    expect(analizar(1, 1)).toBeNull(); // H⁺ no tiene electrones
    expect(analizar(2, 3)).toBeNull(); // no se pueden quitar 3 electrones a 2
    expect(analizar(0, 0)).toBeNull();
    expect(analizar(119, 0)).toBeNull();
  });
});

test.describe('Iones', () => {
  const casos: [string, number, number, string][] = [
    ['Fe²⁺ vacía el 4s, no el 3d', 26, 2, '[Ar] 3d⁶'],
    ['Fe³⁺ queda con el 3d semilleno', 26, 3, '[Ar] 3d⁵'],
    ['Cu²⁺ parte de una excepción', 29, 2, '[Ar] 3d⁹'],
    ['Cr³⁺ parte de la otra excepción', 24, 3, '[Ar] 3d³'],
    ['Mn²⁺', 25, 2, '[Ar] 3d⁵'],
    ['Zn²⁺', 30, 2, '[Ar] 3d¹⁰'],
    ['Ag⁺', 47, 1, '[Kr] 4d¹⁰'],
    ['Ti⁴⁺ queda como el argón', 22, 4, '[Ar]'],
    ['Na⁺', 11, 1, '[Ne]'],
    ['Al³⁺', 13, 3, '[Ne]'],
    ['Ca²⁺', 20, 2, '[Ar]'],
    ['Pb²⁺ pierde el 6p antes que el 6s', 82, 2, '[Xe] 4f¹⁴ 5d¹⁰ 6s²'],
    ['O²⁻', 8, -2, '[He] 2s² 2p⁶'],
    ['Cl⁻', 17, -1, '[Ne] 3s² 3p⁶'],
    ['N³⁻', 7, -3, '[He] 2s² 2p⁶'],
    ['H⁻ no tiene gas noble anterior', 1, -1, '1s²'],
  ];

  for (const [nombre, z, carga, esperado] of casos) {
    test(nombre, () => {
      expect(textoAbreviado(analizar(z, carga)!)).toBe(esperado);
    });
  }
});

test.describe('Excepciones a la regla de Madelung', () => {
  test('son exactamente veinte y todas cambian algo', () => {
    const conExcepcion = ELEMENTOS.filter((e) => analizar(e.z, 0)!.excepcion !== null);
    expect(conExcepcion).toHaveLength(20);
    for (const e of conExcepcion) {
      const r = analizar(e.z, 0)!;
      expect(r.segunMadelung, `${e.simbolo} declara excepción sin predicción alternativa`).not.toBeNull();
      expect(
        textoCompleto(r.segunMadelung!),
        `la excepción de ${e.simbolo} no cambia nada`
      ).not.toBe(textoCompleto(r.porNivel));
    }
  });

  test('el cromo y el cobre suben un electrón al 3d', () => {
    expect(textoAbreviado(analizar(24, 0)!)).toBe('[Ar] 3d⁵ 4s¹');
    expect(textoAbreviado(analizar(29, 0)!)).toBe('[Ar] 3d¹⁰ 4s¹');
  });

  test('el paladio deja la capa externa vacía y sigue en el periodo 5, grupo 10', () => {
    const pd = analizar(46, 0)!;
    expect(textoAbreviado(pd)).toBe('[Kr] 4d¹⁰');
    expect(pd.periodo).toBe(5);
    expect(pd.grupo).toBe(10);
    expect(pd.capaValencia.electrones).toBe(0);
  });

  test('el cinc es del bloque d aunque su vecino el cobre sea una excepción', () => {
    const zn = analizar(30, 0)!;
    expect(zn.bloque).toBe('d');
    expect(zn.grupo).toBe(12);
  });

  test('el cerio es del bloque f aunque su orbital más alto sea el 5d', () => {
    const ce = analizar(58, 0)!;
    expect(ce.bloque).toBe('f');
    expect(ce.serie).toBe('lantanidos');
    expect(ce.grupo).toBeNull();
  });
});

test.describe('Regla de Hund y magnetismo', () => {
  test('el reparto en cajas no empareja antes de tiempo', () => {
    expect(cajasDeSubnivel(1, 3)).toEqual([1, 1, 1]); // p³: tres cajas con uno
    expect(cajasDeSubnivel(1, 4)).toEqual([2, 1, 1]); // p⁴: el cuarto sí empareja
    expect(cajasDeSubnivel(2, 5)).toEqual([1, 1, 1, 1, 1]); // d⁵ semilleno
    expect(cajasDeSubnivel(0, 2)).toEqual([2]);
    expect(cajasDeSubnivel(3, 14).every((c) => c === 2)).toBe(true); // f¹⁴ lleno
  });

  test('los desapareados por subnivel', () => {
    expect(desapareadosDe(1, 3)).toBe(3);
    expect(desapareadosDe(1, 4)).toBe(2);
    expect(desapareadosDe(1, 6)).toBe(0);
    expect(desapareadosDe(2, 5)).toBe(5);
    expect(desapareadosDe(2, 8)).toBe(2);
  });

  const magnetismo: [string, number, number, number, boolean][] = [
    ['cromo', 24, 0, 6, true],
    ['hierro', 26, 0, 4, true],
    ['oxígeno', 8, 0, 2, true],
    ['nitrógeno', 7, 0, 3, true],
    ['neón', 10, 0, 0, false],
    ['cobre', 29, 0, 1, true],
    ['cinc', 30, 0, 0, false],
    ['Fe³⁺', 26, 3, 5, true],
    ['Mn²⁺', 25, 2, 5, true],
    ['paladio', 46, 0, 0, false],
  ];

  for (const [nombre, z, carga, desapareados, paramagnetico] of magnetismo) {
    test(`${nombre}: ${desapareados} desapareados`, () => {
      const r = analizar(z, carga)!;
      expect(r.desapareados).toBe(desapareados);
      expect(r.paramagnetico).toBe(paramagnetico);
    });
  }
});

test.describe('Números cuánticos del último electrón', () => {
  const casos: [string, number, number, number, number, number][] = [
    ['Cl (3p⁵)', 17, 3, 1, 0, -1],
    ['N (2p³)', 7, 2, 1, 1, 1],
    ['Sc (3d¹)', 21, 3, 2, -2, 1],
    ['O (2p⁴)', 8, 2, 1, -1, -1],
    ['Na (3s¹)', 11, 3, 0, 0, 1],
    ['Cr (3d⁵)', 24, 3, 2, 2, 1],
  ];

  for (const [nombre, z, n, l, ml, ms] of casos) {
    test(nombre, () => {
      const u = analizar(z, 0)!.ultimoElectron!;
      expect([u.n, u.l, u.ml, u.ms]).toEqual([n, l, ml, ms]);
    });
  }

  test('mₗ nunca se sale del rango −l..+l', () => {
    for (const e of ELEMENTOS) {
      const u = analizar(e.z, 0)!.ultimoElectron!;
      expect(Math.abs(u.ml), `Z=${e.z}`).toBeLessThanOrEqual(u.l);
    }
  });
});

test.describe('Valencia y notación', () => {
  test('en el bromo el 3d¹⁰ ya no es capa de valencia', () => {
    const br = analizar(35, 0)!;
    expect(br.capaValencia.n).toBe(4);
    expect(br.capaValencia.electrones).toBe(7);
  });

  test('en el hierro la valencia incluye el 3d interno', () => {
    const fe = analizar(26, 0)!;
    expect(fe.capaValencia.electrones).toBe(2);
    expect(fe.electronesValencia).toBe(8);
  });

  test('el símbolo del ion se escribe como en química', () => {
    expect(textoEspecie('Fe', 3)).toBe('Fe³⁺');
    expect(textoEspecie('Na', 1)).toBe('Na⁺');
    expect(textoEspecie('O', -2)).toBe('O²⁻');
    expect(textoEspecie('Cl', -1)).toBe('Cl⁻');
    expect(textoEspecie('Fe', 0)).toBe('Fe');
  });

  test('la abreviada nunca usa un elemento que no sea gas noble', () => {
    const nobles = ['He', 'Ne', 'Ar', 'Kr', 'Xe', 'Rn', 'Og'];
    for (const e of ELEMENTOS) {
      const r = analizar(e.z, 0)!;
      if (r.nucleo) expect(nobles, `Z=${e.z}`).toContain(r.nucleo.simbolo);
    }
  });
});
