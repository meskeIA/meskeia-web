import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';
import {
  CASOS,
  TOTAL_CASOS,
  comprobarRespuesta,
  generarEjercicioAleatorio,
  resolverCaso,
  type Forma,
  type Pregunta,
} from '../../app/visualizador-geometria-analitica/casos';
import { analizarConica, escribirGeneral, expandir } from '../../app/visualizador-geometria-analitica/motor';

/**
 * visualizador-geometria-analitica — el modo «Desde la ecuación general» y los casos para clase
 * (26/10/2026, semilla S0228). La app no tenía spec: este es el primero.
 *
 * LAS DOCE RESPUESTAS, resueltas a mano antes de ejecutar nada (completando cuadrados):
 *    1  x² + y² − 4x + 6y − 12 = 0      (x − 2)² + (y + 3)² = 12 + 4 + 9 = 25       → radio 5
 *    2  2x² + 2y² + 8x − 4y − 8 = 0     ÷2: (x + 2)² + (y − 1)² = 4 + 4 + 1 = 9      → h = −2
 *    3  x² + y² + 6x − 8y + 30 = 0      (x + 3)² + (y − 4)² = −30 + 9 + 16 = −5       → −5 (vacía)
 *    4  16x² + 25y² − 400 = 0           x²/25 + y²/16 = 1, c = √(25 − 16) = 3, e = 3/5 → 0,6
 *    5  4x² + 9y² − 16x + 18y − 11 = 0  4(x − 2)² + 9(y + 1)² = 11 + 16 + 9 = 36,
 *                                       (x − 2)²/9 + (y + 1)²/4 = 1, c = √5, 2c = 4,4721 → 4,47
 *    6  25x² + 16y² + 100x − 96y − 156  25(x + 2)² + 16(y − 3)² = 156 + 100 + 144 = 400,
 *                                       (x + 2)²/16 + (y − 3)²/25 = 1, eje mayor vertical,
 *                                       c = √(25 − 16) = 3, foco de arriba y = 3 + 3   → 6
 *    7  x² − 4x − 8y + 28 = 0           (x − 2)² = 8y − 24 = 8(y − 3), 4p = 8, p = 2,
 *                                       vértice (2, 3), foco y = 3 + 2                 → 5
 *    8  y² + 6y + 12x − 15 = 0          (y + 3)² = −12x + 24 = −12(x − 2), p = −3,
 *                                       vértice (2, −3), directriz x = 2 − (−3)        → 5
 *    9  −9x² + 16y² − 144 = 0           y²/9 − x²/16 = 1, a = 3 (la de la y), b = 4,
 *                                       c = 5, e = 5/3 = 1,6667                        → 1,67
 *   10  4x² − y² − 8x − 4y − 4 = 0      4(x − 1)² − (y + 2)² = 4 + 4 − 4 = 4,
 *                                       (x − 1)²/1 − (y + 2)²/4 = 1, b/a = 2/1         → 2
 *   11  x² − 6x − 12y + 9 = 0           (x − 3)² = 12y, 4p = 12, p = 3                 → 3 dm
 *   12  144x² + 169y² − 24336 = 0       x²/169 + y²/144 = 1, c = √25 = 5, 2c           → 10 m
 *
 * EL CONVENIO: unos libros escriben (x − h)² = 4p(y − k) y otros y² = 2px, con p distinta; unos
 * llaman a al semieje bajo la x y otros al mayor. Ningún caso pide «p» ni «a»: el test lo exige
 * leyendo los enunciados, y comprueba que las cifras que cambiarían de un libro a otro (4p, 2p,
 * el semieje equivocado) reciben su motivo con nombre.
 *
 * El modo práctica se comprueba con FÓRMULAS PROPIAS escritas aquí a partir de la forma con que
 * se generó cada ejercicio (c² = a² ∓ b², e = c/a, foco = vértice + p…), no con el motor.
 */

const A_MANO = [5, -2, -5, 0.6, 4.47, 6, 5, 5, 1.67, 2, 3, 10];

const red2 = (v: number): number => Math.round(v * 100) / 100;

/** La respuesta de una pregunta calculada con las fórmulas de un libro, desde la forma. */
function respuestaPropia(forma: Forma, p: Pregunta): number {
  switch (forma.tipo) {
    case 'circunferencia':
      return { radio: forma.r, 'centro-x': forma.h, 'centro-y': forma.k }[p as 'radio'] ?? NaN;
    case 'elipse':
    case 'hiperbola': {
      const { a, b, h, k } = forma;
      const c = forma.tipo === 'elipse' ? Math.sqrt(a * a - b * b) : Math.sqrt(a * a + b * b);
      const horizontal = forma.eje === 'horizontal';
      switch (p) {
        case 'excentricidad': return c / a;
        case 'distancia-focos': return 2 * c;
        case 'foco-mayor': return horizontal ? h + c : k + c;
        case 'centro-x': return h;
        case 'centro-y': return k;
        case 'pendiente-asintota': return horizontal ? b / a : a / b;
        default: return NaN;
      }
    }
    case 'parabola': {
      const { h, k, p: pp } = forma;
      const vertical = forma.eje === 'vertical';
      switch (p) {
        case 'foco': return vertical ? k + pp : h + pp;
        case 'directriz': return vertical ? k - pp : h - pp;
        case 'distancia-vertice-foco': return Math.abs(pp);
        default: return NaN;
      }
    }
  }
}

const PRACTICAS = Array.from({ length: 40 }, (_, i) => generarEjercicioAleatorio(i + 1));
const TODOS = [
  ...CASOS.map((c) => ({ origen: `caso ${c.id}`, enunciado: c.enunciado, pasos: c.pasos, pista: c.pista })),
  ...PRACTICAS.map((e) => ({ origen: `semilla ${e.semilla}`, enunciado: e.enunciado, pasos: e.pasos, pista: '' })),
];
const caso = (id: number) => CASOS[id - 1];
const motivo = (v: number, id: number) => comprobarRespuesta(v, caso(id).respuesta, caso(id).datos).motivo;
const acierta = (v: number, id: number) => comprobarRespuesta(v, caso(id).respuesta, caso(id).datos).correcto;

test.describe('casos para clase · lógica, sin navegador', () => {
  test('1 · doce casos con ids 1..12 sin huecos', () => {
    expect(TOTAL_CASOS).toBe(12);
    expect(CASOS.map((c) => c.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  test('2 · deterministas: dos resoluciones dan lo mismo', () => {
    for (const c of CASOS) {
      const a = resolverCaso(c.datos);
      const b = resolverCaso(c.datos);
      expect(a.ok, `caso ${c.id}: ${a.error ?? ''}`).toBe(true);
      expect(b.valor).toBe(a.valor);
      expect(b.pasos).toEqual(a.pasos);
    }
  });

  test('3 · la respuesta coincide con la resuelta a mano y con recalcularla desde los datos', () => {
    CASOS.forEach((c, i) => {
      expect(c.respuesta, `caso ${c.id} frente a la cuenta a mano`).toBe(A_MANO[i]);
      expect(c.respuesta, `caso ${c.id} frente a recalcular`).toBe(red2(resolverCaso(c.datos).valor));
    });
  });

  test('4 · cada caso tiene enunciado, etiqueta, respuesta finita, desarrollo y pista', () => {
    for (const c of CASOS) {
      expect(c.enunciado.length, `caso ${c.id}`).toBeGreaterThan(40);
      expect(c.etiquetaRespuesta.trim(), `caso ${c.id}`).not.toBe('');
      expect(Number.isFinite(c.respuesta), `caso ${c.id}`).toBe(true);
      expect(c.pasos.length, `caso ${c.id}`).toBeGreaterThanOrEqual(4);
      expect(c.pista.trim(), `caso ${c.id}`).not.toBe('');
      // La ecuación del enunciado es la de los datos.
      expect(c.enunciado, `caso ${c.id}`).toContain(escribirGeneral(c.datos.ecuacion));
      if (c.unidad) expect(c.respuestaTexto, `caso ${c.id}`).toContain(c.unidad);
    }
    expect(new Set(CASOS.map((c) => c.categoria))).toEqual(new Set(['abstracto', 'aplicado']));
    const tipos = new Set(CASOS.map((c) => resolverCaso(c.datos).analisis?.tipo));
    for (const t of ['circunferencia', 'elipse', 'parabola', 'hiperbola', 'vacia']) expect(tipos.has(t as never), t).toBe(true);
  });

  test('5 · ningún enunciado nombra un país, una ciudad ni una moneda', () => {
    const PROHIBIDO =
      /\b(España|Espana|México|Mexico|Colombia|Argentina|Perú|Peru|Chile|Uruguay|Madrid|Barcelona|Bogotá|Lima|Washington|euros?|dólares?|pesos (mexicanos|colombianos|argentinos|chilenos))\b/i;
    for (const t of TODOS) {
      expect(PROHIBIDO.test(t.enunciado), t.origen).toBe(false);
      expect(/\bESO\b|selectividad|EBAU/.test(t.enunciado), t.origen).toBe(false);
    }
  });

  test('5.bis · lo que el enunciado PIDE coincide con lo que la solución MUESTRA', () => {
    for (const c of CASOS) {
      const ultimo = c.pasos[c.pasos.length - 1];
      expect(ultimo, `caso ${c.id}: el último paso enseña la cifra de la casilla`).toContain(c.respuestaTexto);
      expect(/dos decimales/.test(c.enunciado), `caso ${c.id}: pide redondear si y solo si hace falta`).toBe(c.requiereRedondeo);
    }
    for (const t of TODOS) {
      for (const texto of [t.enunciado, t.pista, ...t.pasos]) {
        expect(texto, t.origen).not.toMatch(/\b[Dd]e el\b/);
        expect(texto, t.origen).not.toMatch(/\bNaN\b|undefined|Infinity/);
        // Las cifras van en formato español: nunca un punto decimal (3.5) ni el guion como menos.
        expect(texto, t.origen).not.toMatch(/\d\.\d{1,2}(?!\d)/);
        expect(texto, t.origen).not.toMatch(/(^|[\s(=])-\d/);
      }
    }
    // Solo dos casos exigen redondear: los que llevan una raíz no exacta.
    expect(CASOS.filter((c) => c.requiereRedondeo).map((c) => c.id)).toEqual([5, 9]);
  });

  test('6 · el modo práctica es reproducible, variado y coincide con las fórmulas del test', () => {
    expect(generarEjercicioAleatorio(12345)).toEqual(generarEjercicioAleatorio(12345));
    expect(new Set(PRACTICAS.map((e) => e.respuesta)).size, 'respuestas distintas').toBeGreaterThanOrEqual(15);
    expect(new Set(PRACTICAS.map((e) => e.datos.pregunta)).size, 'tipos de pregunta').toBeGreaterThanOrEqual(6);
    expect(new Set(PRACTICAS.map((e) => e.forma.tipo)), 'las cuatro cónicas').toEqual(
      new Set(['circunferencia', 'elipse', 'hiperbola', 'parabola']),
    );
    for (const e of PRACTICAS) {
      expect(e.respuesta, `semilla ${e.semilla}`).toBe(red2(respuestaPropia(e.forma, e.datos.pregunta)));
      expect(comprobarRespuesta(e.respuesta, e.respuesta, e.datos).correcto, `semilla ${e.semilla}`).toBe(true);
      expect(/dos decimales/.test(e.enunciado), `semilla ${e.semilla}`).toBe(e.requiereRedondeo);
      expect(e.enunciado, `semilla ${e.semilla}`).toContain(escribirGeneral(e.datos.ecuacion));
    }
  });

  test('6.bis · expandir y analizar son inversas: la cónica vuelve con su tipo y su centro', () => {
    for (const e of PRACTICAS) {
      const an = analizarConica(expandir(e.forma));
      expect(an.tipo, `semilla ${e.semilla}`).toBe(e.forma.tipo);
      const centro = an.tipo === 'parabola' ? an.vertice : an.centro;
      expect(centro?.x, `semilla ${e.semilla}`).toBeCloseTo(e.forma.h, 9);
      expect(centro?.y, `semilla ${e.semilla}`).toBeCloseTo(e.forma.k, 9);
      if (an.tipo !== 'parabola' && an.tipo !== 'circunferencia' && 'eje' in e.forma) expect(an.eje).toBe(e.forma.eje);
    }
  });

  test('7 · convenio: ningún caso pide «p» ni «a», y las cifras de otro libro tienen nombre', () => {
    for (const t of TODOS) {
      expect(t.enunciado, t.origen).not.toMatch(/\bvalor de p\b|\bhalla p\b|\bel parámetro\b|\bsemieje a\b|\bhalla a\b/i);
    }
    // Antena (caso 11): 4p = 12 y 2p = 6 no son la distancia del vértice al foco.
    expect(acierta(3, 11)).toBe(true);
    expect(motivo(12, 11)).toMatch(/4p/);
    expect(motivo(6, 11)).toMatch(/foco a la directriz/);
    // Hipérbola vertical (caso 9): dividir entre el semieje equivocado da 5/4.
    expect(motivo(1.25, 9)).toMatch(/semieje equivocado/);
    // Elipse vertical (caso 6): con los focos en el eje horizontal saldría y = 3.
    expect(motivo(3, 6)).toMatch(/coordenada del centro/);
  });

  test('7.bis · el corrector: tolerancia, errores con nombre y lo que no es número', () => {
    // Exactas sin margen; las de raíz con el 1 %: 2·2,24 = 4,48 es un redondeo intermedio legítimo.
    expect(acierta(5, 1)).toBe(true);
    expect(acierta(5.01, 1)).toBe(false);
    expect(acierta(0.61, 4)).toBe(false);
    expect(acierta(4.48, 5)).toBe(true);
    expect(acierta(4.4, 5)).toBe(false);
    expect(acierta(1.67, 9)).toBe(true);
    // Errores típicos
    expect(motivo(25, 1)).toMatch(/r², no el radio/);
    expect(motivo(2, 2)).toMatch(/signo va al revés/);
    expect(motivo(5, 3)).toMatch(/signo/);
    expect(motivo(Math.sqrt(41) / 5, 4)).toMatch(/Has sumado/);
    expect(motivo(2.24, 5)).toMatch(/Eso es c/);
    expect(motivo(3, 7)).toMatch(/vértice/);
    expect(motivo(-1, 8)).toMatch(/coordenada del foco/);
    expect(motivo(0.5, 10)).toMatch(/invertido/);
    expect(motivo(5, 12)).toMatch(/Eso es c/);
    // Lo imposible y lo ilegible
    expect(motivo(-5, 1)).toMatch(/no pueden ser negativos/);
    expect(motivo(NaN, 1)).not.toContain('NaN');
    expect(motivo(NaN, 1)).toMatch(/Escribe un número/);
    // Un fallo cualquiera dice cuánto se ha desviado, con espacio duro antes de la unidad.
    expect(motivo(11, 12)).toBe('No es correcto. Te has desviado 1,00 m de la respuesta.');
  });

  test('7.ter · degeneradas: un punto, dos rectas y ninguna curva, sin cifra inventada', () => {
    expect(analizarConica({ A: 1, C: 1, D: -2, E: 4, F: 5 }).tipo).toBe('punto');
    expect(analizarConica({ A: 1, C: -1, D: 0, E: 0, F: 0 }).tipo).toBe('rectas-secantes');
    const paralelas = analizarConica({ A: 1, C: 0, D: 0, E: 0, F: -4 });
    expect(paralelas.tipo).toBe('rectas-paralelas');
    expect(paralelas.rectas.paralelas.map((r) => r.valor)).toEqual([-2, 2]);
    expect(analizarConica({ A: 1, C: 0, D: 0, E: 0, F: 4 }).tipo).toBe('vacia');
    expect(analizarConica({ A: 0, C: 0, D: 1, E: 1, F: 0 }).ok).toBe(false);
    expect(analizarConica({ A: NaN, C: 1, D: 0, E: 0, F: -1 }).ok).toBe(false);
    // Una pregunta que no se aplica no da cifra (el radio de una elipse).
    expect(resolverCaso({ ecuacion: caso(5).datos.ecuacion, pregunta: 'radio' }).ok).toBe(false);
  });

  test('7.quater · una sola implementación: la página y los casos toman la geometría del motor', () => {
    const pestana = readFileSync('app/visualizador-geometria-analitica/EcuacionGeneral.tsx', 'utf8');
    const casos = readFileSync('app/visualizador-geometria-analitica/casos.ts', 'utf8');
    expect(pestana).toMatch(/import \{[^}]*\banalizarConica\b[^}]*\} from '\.\/motor'/);
    expect(casos).toMatch(/import \{[^}]*\banalizarConica\b[^}]*\} from '\.\/motor'/);
    expect(pestana).not.toMatch(/Math\.sqrt/);
  });
});

test.describe('en la página', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/visualizador-geometria-analitica/');
    await esperarHidratacion(page, ['#casos-respuesta']);
  });

  test('la pestaña «Desde la ecuación» completa cuadrados en la elipse del caso 5', async ({ page }) => {
    await page.getByRole('button', { name: 'Ver Desde la ecuación' }).click();
    await expect(page.locator('#ecuacion-tipo')).toHaveText('Elipse');
    await expect(page.locator('#ecuacion-reducida')).toHaveText('(x − 2)²/9 + (y + 1)²/4 = 1');
    await expect(page.getByText('Distancia entre focos: 4,4721')).toBeVisible();

    // Cambiar un coeficiente reanaliza: con F = −23 queda 4(x − 2)² + 9(y + 1)² = 23 + 16 + 9 = 48,
    // y al dividir entre 48 los denominadores son 12 y 48/9 = 5,3333.
    const campoF = page.getByRole('textbox', { name: 'Término independiente F' });
    await campoF.fill('−23');
    await esperarValorEnReact(page, campoF, '−23');
    await expect(page.locator('#ecuacion-reducida')).toHaveText('(x − 2)²/12 + (y + 1)²/5,3333 = 1');

    // Un coeficiente que no es número se avisa, sin «NaN».
    await campoF.fill('12abc');
    await esperarValorEnReact(page, campoF, '12abc');
    // Acotado a la herramienta: Next monta su propio role="alert" (el anunciador de rutas).
    await expect(page.locator('main').getByRole('alert')).toContainText('no es un número');
    await expect(page.locator('body')).not.toContainText('NaN');

    await page.getByRole('button', { name: 'Ejemplo: Parábola', exact: true }).click();
    await expect(page.locator('#ecuacion-tipo')).toHaveText('Parábola');
    await expect(page.getByText('Foco: (2, 5)')).toBeVisible();
  });

  test('el caso 9 se corrige: 1,25 recibe su motivo y 1,67 vale', async ({ page }) => {
    const seccion = page.locator('section[aria-labelledby="casos-aula-titulo"]');
    await seccion.getByRole('button', { name: /^Caso 9:/ }).click();
    await expect(seccion.getByRole('button', { name: /^Caso 9:/ })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#casos-enunciado')).toContainText('−9x² + 16y² − 144 = 0');

    const casilla = page.locator('#casos-respuesta');
    await casilla.fill('1,25');
    await esperarValorEnReact(page, casilla, '1,25');
    await page.locator('#casos-comprobar').click();
    await expect(page.locator('#casos-veredicto')).toContainText('semieje equivocado');

    await casilla.fill('1,67');
    await esperarValorEnReact(page, casilla, '1,67');
    await page.locator('#casos-comprobar').click();
    await expect(page.locator('#casos-veredicto')).toContainText('¡Correcto!');

    await seccion.getByRole('button', { name: /Ver solución/ }).click();
    await expect(page.locator('#casos-resultado')).toContainText('y²/9 − x²/16 = 1');
    await expect(page.locator('#casos-resultado')).toContainText('1,67');
  });

  test('una respuesta negativa con el menos tipográfico se lee (caso 2: −2)', async ({ page }) => {
    await page.getByRole('button', { name: /^Caso 2:/ }).click();
    const casilla = page.locator('#casos-respuesta');
    await casilla.fill('−2');
    await esperarValorEnReact(page, casilla, '−2');
    await page.locator('#casos-comprobar').click();
    await expect(page.locator('#casos-veredicto')).toContainText('¡Correcto!');
  });

  test('«Practicar» da un ejercicio y se corrige con su propia respuesta', async ({ page }) => {
    const seccion = page.locator('section[aria-labelledby="casos-aula-titulo"]');
    const practicar = seccion.getByRole('button', { name: 'Practicar' });
    await practicar.click();
    await expect(practicar).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#casos-titulo-caso')).toHaveText('Ejercicio de práctica');
    await page.locator('#casos-comprobar').click();
    await expect(page.locator('#casos-veredicto')).toContainText('Escribe un número');
    await expect(page.locator('#casos-veredicto')).not.toContainText('NaN');
  });
});
