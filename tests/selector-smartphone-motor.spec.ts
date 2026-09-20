/**
 * Tests unitarios del motor de selector-smartphone
 *
 * Ejecutar: npx playwright test tests/selector-smartphone-motor.spec.ts
 *
 * Los dos perfiles de contraste, con sus puntos contados a mano:
 *
 *   EXIGENTE  P1 foto (+2) · P2 intenso (+2) · P3 extremo (+2) · P6 camara (+2) ·
 *             P7 largo (+2) = 10 puntos → gama «pro» por perfil (umbral 7).
 *
 *   MODESTO   P1 basico · P2 poco · P3 poco · P6 bateria · P7 corto = 0 puntos → «basica».
 *
 * El hallazgo 943 era que el presupuesto solo acotaba en sus dos extremos: con el perfil
 * EXIGENTE y «250 – 500 €» la app proponía «Gama pro / flagship. Precio orientativo:
 * 900 – 1.500+ €», entre dos y seis veces el tramo declarado, sin mencionarlo. El 944, que
 * las razones salían de la gama de SALIDA, así que a quien pedía cámara y gaming con 250 €
 * le decía «para un uso básico…». El 945, que el pliego de características quedaba
 * internamente incompatible.
 */

import { test, expect } from '@playwright/test';
import { calcularResultado, TOPE_POR_PRESUPUESTO } from '../app/selector-smartphone/motor';

/** P1 uso · P2 juegos · P3 horas · P4 Apple · P5 ordenador · P6 prioridad · P7 duración ·
 *  P8 diseño · P9 presupuesto · P10 segunda mano */
const EXIGENTE = {
  1: 'foto',
  2: 'intenso',
  3: 'extremo',
  4: 'no',
  5: 'windows',
  6: 'camara',
  7: 'largo',
  8: 'resistente',
  10: 'no',
} as const;

const MODESTO = {
  1: 'basico',
  2: 'poco',
  3: 'poco',
  4: 'no',
  5: 'windows',
  6: 'bateria',
  7: 'corto',
  8: 'indiferente',
  10: 'no',
} as const;

const con = (base: Record<number, string>, presupuesto: string) =>
  calcularResultado({ ...base, 9: presupuesto });

test.describe('Hallazgo 943 (alto) — el presupuesto acota en los cuatro tramos', () => {
  test('el perfil exigente pide «pro», y cada tramo lo recorta a lo suyo', () => {
    expect(con(EXIGENTE, 'premium').gamaPorPerfil).toBe('pro');

    expect(con(EXIGENTE, 'bajo').gama).toBe('basica');
    expect(con(EXIGENTE, 'medio').gama).toBe('media'); // antes daba «pro»
    expect(con(EXIGENTE, 'alto').gama).toBe('alta'); // antes daba «pro»
    expect(con(EXIGENTE, 'premium').gama).toBe('pro');
  });

  test('y lo dice: el recorte queda marcado y explicado', () => {
    const r = con(EXIGENTE, 'medio');
    expect(r.recortadaPorPresupuesto).toBe(true);
    const texto = r.razones.join(' ');
    expect(texto).toContain('presupuesto');
    expect(texto).toContain('de 250 a 500 €');
    expect(texto).toContain('pro'); // nombra la gama que pedía el uso
  });

  test('sin recorte, no se inventa ninguno', () => {
    const r = con(EXIGENTE, 'premium');
    expect(r.recortadaPorPresupuesto).toBe(false);
    expect(r.ampliadaPorPresupuesto).toBe(false);
  });

  test('cada tramo declara su tope, y son los de las horquillas publicadas', () => {
    expect(TOPE_POR_PRESUPUESTO).toEqual({
      bajo: 'basica',
      medio: 'media',
      alto: 'alta',
      premium: 'pro',
    });
  });
});

test.describe('Hallazgo 944 (alto) — las razones hablan de lo respondido', () => {
  test('con recorte NO dice «para un uso básico»', () => {
    const r = con(EXIGENTE, 'bajo');
    expect(r.gama).toBe('basica');
    const texto = r.razones.join(' ');
    // Era literalmente lo que decía: «Para un uso básico, la gama de entrada cubre…»
    expect(texto).not.toContain('Para un uso básico');
    expect(texto).toContain('hasta 250 €');
  });

  test('con presupuesto premium y uso modesto, no atribuye un perfil intenso', () => {
    const r = con(MODESTO, 'premium');
    expect(r.gama).toBe('pro');
    expect(r.gamaPorPerfil).toBe('basica');
    expect(r.ampliadaPorPresupuesto).toBe(true);
    const texto = r.razones.join(' ');
    // Era: «Tu perfil de uso intenso o de fotografía avanzada justifica la inversión…»
    expect(texto).not.toContain('uso intenso o de fotografía avanzada');
    expect(texto).toContain('presupuesto');
    expect(texto).toContain('no te dejaría corto');
  });

  test('sin conflicto, la razón sigue siendo la de siempre', () => {
    const r = con(EXIGENTE, 'premium');
    expect(r.razones.join(' ')).toContain('justifica la inversión en un flagship');
  });

  test('a quien recorta y quiere comprar nuevo se le ofrece el reacondicionado', () => {
    const texto = con(EXIGENTE, 'bajo').consejos.join(' ');
    expect(texto).toContain('reacondicionado certificado de la gama que pedía tu uso');
  });
});

test.describe('Hallazgo 945 — el pliego de características cuadra con la gama', () => {
  test('en gama básica no se piden cosas imposibles en ese tramo', () => {
    const texto = con(EXIGENTE, 'bajo').caracteristicas.join(' | ');
    expect(texto).not.toContain('Procesador de gama alta de la generación más reciente');
    expect(texto).not.toContain('Pantalla con tasa de refresco ≥ 120 Hz');
    expect(texto).not.toContain('mínimo 5 años');
    expect(texto).not.toContain('teleobjetivo óptico');
  });

  test('y no se le quita a la gama básica lo que el usuario sí necesita', () => {
    const texto = con(EXIGENTE, 'bajo').caracteristicas.join(' | ');
    // Estaban condicionados a `gama !== 'basica'`, así que desaparecían justo aquí.
    expect(texto).toContain('NFC');
    expect(texto).toContain('5G');
  });

  test('en gama pro sí se piden, porque ahí existen', () => {
    const texto = con(EXIGENTE, 'premium').caracteristicas.join(' | ');
    expect(texto).toContain('Procesador de gama alta de la generación más reciente');
    expect(texto).toContain('≥ 120 Hz');
    expect(texto).toContain('mínimo 5 años');
    expect(texto).toContain('teleobjetivo óptico');
    expect(texto).toContain('RAM ≥ 8 GB');
  });

  test('el pliego nunca queda vacío ni repite líneas', () => {
    for (const presupuesto of ['bajo', 'medio', 'alto', 'premium']) {
      for (const perfil of [EXIGENTE, MODESTO]) {
        const lista = con(perfil, presupuesto).caracteristicas;
        expect(lista.length).toBeGreaterThan(3);
        expect(new Set(lista).size).toBe(lista.length);
      }
    }
  });
});

test.describe('El sistema operativo se decide aparte del presupuesto', () => {
  test('tres o más puntos de ecosistema Apple llevan a iOS', () => {
    // si_muchos (+3) con un ordenador que no resta: 3 puntos.
    expect(calcularResultado({ ...EXIGENTE, 9: 'medio', 4: 'si_muchos', 5: 'otro' }).os).toBe('ios');
    // si_alguno (+1) + mac (+2) = 3.
    expect(calcularResultado({ ...EXIGENTE, 9: 'medio', 4: 'si_alguno', 5: 'mac' }).os).toBe('ios');
  });

  test('y sin ellos, a Android', () => {
    expect(con(EXIGENTE, 'medio').os).toBe('android');
    expect(calcularResultado({ ...EXIGENTE, 9: 'medio', 4: 'si_alguno' }).os).toBe('android');
    // si_muchos (+3) con Windows (−1) se queda en 2: no basta.
    expect(calcularResultado({ ...EXIGENTE, 9: 'medio', 4: 'si_muchos' }).os).toBe('android');
  });

  test('el presupuesto no mueve el sistema operativo', () => {
    const sistemas = ['bajo', 'medio', 'alto', 'premium'].map((p) => con(EXIGENTE, p).os);
    expect(new Set(sistemas).size).toBe(1);
  });
});
