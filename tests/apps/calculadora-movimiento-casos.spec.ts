import { test, expect } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';
import {
  CASOS,
  TOTAL_CASOS,
  comprobarRespuesta,
  generarEjercicioAleatorio,
  resolverCaso,
  usaGravedad,
} from '../../app/calculadora-movimiento/casos';
import { redondearA } from '../../lib/calculadoras/correctorCasosAula';

/**
 * calculadora-movimiento — Casos para clase (skill /casos-aula-meskeia, 24/10/2026).
 *
 * Va en un fichero APARTE del acta del Inspector (`calculadora-movimiento.spec.ts`) porque el
 * acta tiene un `beforeEach` de nivel superior que abre la página antes de cada test: estas
 * invariantes no necesitan navegador y se pagarían doce cargas para nada.
 *
 * LAS 12 RESPUESTAS, CALCULADAS A MANO (nunca copiadas de la app), con g = 9,81 m/s²:
 *    1  MRU                 x = 12·25                                            = 300 m
 *    2  MRU, km/h           90 ÷ 3,6 = 25 m/s · t = 3000/25                      = 120 s
 *    3  MRUA                v = 0 + 2,5·8                                        = 20 m/s
 *    4  MRUA                x = 4·6 + ½·3·6² = 24 + 54                           = 78 m
 *    5  MRUA, km/h          36 → 10 m/s, 72 → 20 m/s · a = (20 − 10)/5           = 2 m/s²
 *    6  frenado, km/h       108 ÷ 3,6 = 30 m/s · t = 30/6                        = 5 s
 *    7  frenado             t = 10/2 = 5 s · x = 10·5 − ½·2·25 = 50 − 25         = 25 m
 *    8  ir y volver         para en t = 12/4 = 3 s, a 12·3 − ½·4·9 = 18 m;
 *                           x(5) = 60 − 50 = 10 m · distancia = 18 + (18 − 10)  = 26 m
 *    9  caída desde 20 m    t = √(40/9,81) = √4,07747… = 2,01928…                → 2,02 s
 *   10  caída 3 s           v = 9,81·3                                           = 29,43 m/s
 *   11  hacia arriba        h = 14²/(2·9,81) = 196/19,62 = 9,98981…              → 9,99 m
 *   12  parabólico          R = 20²·sen 60°/9,81 = 400·0,866025/9,81 = 35,3119…  → 35,31 m
 *
 * Los errores típicos, también a mano, que el corrector reconoce por su nombre:
 *    caso 9 con g = 10   t = √4 = 2                   («has usado g = 10»)
 *    caso 6 sin convertir 108/6 = 18                  («te falta pasar los km/h a m/s»)
 *    caso 8 desplazamiento 10                         («eso es el desplazamiento»)
 *    caso 1 con signo    −300                         («se pide sin signo»)
 */

const A_MANO: Record<number, number> = {
  1: 300,
  2: 120,
  3: 20,
  4: 78,
  5: 2,
  6: 5,
  7: 25,
  8: 26,
  9: 2.02,
  10: 29.43,
  11: 9.99,
  12: 35.31,
};

/** Decimales que enseña una cifra en formato español: «35,31 m» → 2. */
function decimalesMostrados(texto: string): number {
  const m = texto.match(/,(\d+)/);
  return m ? m[1].length : 0;
}

test.describe('casos.ts — invariantes, sin navegador', () => {
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
      expect(redondearA(r.valor, caso.datos.decimales ?? 2), `caso ${caso.id}`).toBe(caso.respuesta);
    }
  });

  test('4 · cada caso tiene enunciado, etiqueta, respuesta finita, desarrollo y pista', () => {
    for (const caso of CASOS) {
      expect(caso.enunciado.length, `caso ${caso.id}`).toBeGreaterThan(30);
      expect(caso.etiquetaRespuesta.trim(), `caso ${caso.id}`).not.toBe('');
      expect(caso.etiquetaRespuesta, `caso ${caso.id}: la unidad va tras « en »`).toMatch(/ en \S/);
      expect(Number.isFinite(caso.respuesta), `caso ${caso.id}`).toBe(true);
      expect(caso.pasos.length, `caso ${caso.id}`).toBeGreaterThanOrEqual(2);
      expect(caso.pista.trim(), `caso ${caso.id}`).not.toBe('');
      expect(caso.comoComprobar?.trim(), `caso ${caso.id}`).toBeTruthy();
    }
  });

  test('5 · ningún enunciado nombra un país, una ciudad o una moneda', () => {
    const PROHIBIDO =
      /\b(España|Espana|México|Mexico|Colombia|Argentina|Perú|Peru|Chile|Uruguay|Ecuador|Madrid|Barcelona|Bogotá|Lima|Quito|euros?|dólares?|pesos (mexicanos|colombianos|chilenos|argentinos|uruguayos)|Bachillerato|selectividad)\b/i;
    const SIGLA_ESO = /\bESO\b/;
    for (const caso of CASOS) {
      const texto = `${caso.titulo} ${caso.enunciado}`;
      expect(PROHIBIDO.test(texto) || SIGLA_ESO.test(texto), `caso ${caso.id}`).toBe(false);
    }
    for (let s = 1; s <= 40; s++) {
      const e = generarEjercicioAleatorio(s);
      expect(PROHIBIDO.test(e.enunciado) || SIGLA_ESO.test(e.enunciado), `semilla ${s}`).toBe(false);
    }
  });

  test('5.bis · lo que el enunciado PIDE coincide con lo que la solución MUESTRA', () => {
    for (const caso of CASOS) {
      const decimales = caso.datos.decimales ?? 2;
      expect(decimalesMostrados(caso.respuestaTexto), `caso ${caso.id}`).toBeLessThanOrEqual(decimales);
      const ultimo = caso.pasos[caso.pasos.length - 1];
      expect(ultimo, `caso ${caso.id}: el último paso enseña la cifra de la casilla`).toContain(caso.respuestaTexto);
      const exacto = Math.abs(resolverCaso(caso.datos).valor - caso.respuesta) < 1e-9;
      expect(caso.requiereRedondeo, `caso ${caso.id}`).toBe(!exacto);
      if (!exacto) {
        expect(caso.enunciado, `caso ${caso.id}: se redondea y el enunciado no lo pide`).toMatch(/redonde/i);
      }
    }
  });

  test('6 · el generador aleatorio es reproducible, variado y usa la misma aritmética', () => {
    const a = generarEjercicioAleatorio(12345);
    const b = generarEjercicioAleatorio(12345);
    expect(b.enunciado).toBe(a.enunciado);
    expect(b.respuesta).toBe(a.respuesta);

    const muestras = Array.from({ length: 40 }, (_, i) => generarEjercicioAleatorio(i + 1));
    expect(new Set(muestras.map((m) => m.respuesta)).size).toBeGreaterThanOrEqual(3);
    expect(new Set(muestras.map((m) => m.datos.pregunta)).size).toBeGreaterThanOrEqual(3);
    for (const m of muestras) {
      expect(Number.isFinite(m.respuesta), m.enunciado).toBe(true);
      expect(m.respuesta, m.enunciado).toBeGreaterThan(0);
      expect(redondearA(resolverCaso(m.datos).valor, m.datos.decimales ?? 2)).toBe(m.respuesta);
      // Un ejercicio que se corrige con g la declara, igual que los fijos.
      if (usaGravedad(m.datos.pregunta)) expect(m.enunciado).toContain('g = 9,81');
    }
  });

  test('7 · el convenio queda fijado: las doce respuestas son las de la tabla a mano', () => {
    for (const caso of CASOS) {
      expect(caso.respuesta, `caso ${caso.id} · ${caso.titulo}`).toBe(A_MANO[caso.id]);
    }
  });

  test('7.bis · g = 9,81 se declara justo donde la respuesta cambiaría con g = 10', () => {
    for (const caso of CASOS) {
      const decimales = caso.datos.decimales ?? 2;
      const con10 = resolverCaso(caso.datos, { g: 10 });
      expect(con10.ok, `caso ${caso.id}`).toBe(true);
      const cambia = redondearA(con10.valor, decimales) !== caso.respuesta;
      // La propiedad se prueba EJECUTANDO con otra g, no buscando la cadena (física, 14/09/2026).
      expect(cambia, `caso ${caso.id}: ¿depende de g?`).toBe(usaGravedad(caso.datos.pregunta));
      if (cambia) expect(caso.enunciado, `caso ${caso.id}`).toContain('g = 9,81 m/s²');
      else expect(caso.enunciado, `caso ${caso.id}`).not.toContain('g = ');
    }
  });

  test('8 · ningún título choca con los localizadores del acta del Inspector', () => {
    // El acta busca por nombre, sin `exact`: /MRUA/, /Caída/, /Parabólico/, /Al inicio/,
    // /^Reproducir$/, /Pausa/ y /Reproducir de nuevo/. El nombre de cada botón es «Caso N: título».
    for (const caso of CASOS) {
      expect(caso.titulo, `caso ${caso.id}`).not.toMatch(/MRUA|Caída|Parabólico|Al inicio|Reproducir|Pausa/);
    }
  });

  test('9 · el corrector reconoce los errores típicos por su nombre', () => {
    const caso = (id: number) => CASOS[id - 1];
    const corregir = (id: number, valor: number) => comprobarRespuesta(valor, caso(id).respuesta, caso(id).datos);

    // Aciertos, incluida la cifra sin redondear donde se pide redondeo.
    expect(corregir(9, 2.02).correcto).toBe(true);
    expect(corregir(9, 2.019).correcto).toBe(true);
    expect(corregir(12, 35.31).correcto).toBe(true);
    expect(corregir(1, 300).correcto).toBe(true);

    // g = 10
    expect(corregir(9, 2).motivo).toMatch(/g = 10/);
    expect(corregir(10, 30).motivo).toMatch(/g = 10/);
    expect(corregir(11, 9.8).motivo).toMatch(/g = 10/);
    expect(corregir(12, 34.64).motivo).toMatch(/g = 10/);

    // km/h sin convertir
    expect(corregir(6, 18).motivo).toMatch(/km\/h a m\/s/);
    expect(corregir(5, 7.2).motivo).toMatch(/km\/h a m\/s/);
    expect(corregir(2, 33.33).correcto).toBe(false);

    // desplazamiento en vez de distancia
    expect(corregir(8, 10).motivo).toMatch(/desplazamiento/);

    // signo
    expect(corregir(1, -300).motivo).toMatch(/sin signo/);

    // Un error cualquiera: motivo genérico con la desviación, y nunca «NaN» en pantalla.
    expect(corregir(4, 132).correcto).toBe(false);
    expect(corregir(4, 132).motivo).toMatch(/desviado/);
    expect(corregir(4, Number.NaN).motivo).not.toMatch(/NaN/);

    // Una cifra exacta no tiene margen: 300,4 no vale por 300.
    expect(corregir(1, 300.4).correcto).toBe(false);
  });
});

test.describe('Casos para clase — en el navegador', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculadora-movimiento/');
    await esperarHidratacion(page, ['#mov-v0', '#casos-respuesta']);
  });

  test('el caso 9 se corrige: 2,02 vale y 2 recibe el motivo de g = 10', async ({ page }) => {
    await page.getByRole('button', { name: 'Caso 9: La maceta del balcón' }).click();
    await expect(page.locator('#casos-enunciado')).toContainText('20 m del suelo');
    const caja = page.locator('#casos-respuesta');

    await caja.fill('2');
    await esperarValorEnReact(page, caja, '2');
    await page.locator('#casos-comprobar').click();
    await expect(page.locator('#casos-veredicto')).toContainText('g = 10');

    await caja.fill('2,02');
    await esperarValorEnReact(page, caja, '2,02');
    await page.locator('#casos-comprobar').click();
    await expect(page.locator('#casos-veredicto')).toContainText('¡Correcto!');
  });

  test('la solución enseña la cifra con su unidad y la pista se despliega', async ({ page }) => {
    await page.getByRole('button', { name: 'Caso 8: Ir y volver: distancia frente a desplazamiento' }).click();
    const pista = page.getByRole('button', { name: /Ver pista/ });
    await expect(pista).toHaveAttribute('aria-expanded', 'false');
    await pista.click();
    await expect(page.locator('#casos-pista')).toBeVisible();
    await page.getByRole('button', { name: /Ver solución/ }).click();
    await expect(page.locator('#casos-resultado')).toContainText('26 m');
  });

  test('Practicar trae un ejercicio que se puede corregir', async ({ page }) => {
    await page.locator('#casos-practicar').click();
    await expect(page.locator('#casos-titulo-caso')).toHaveText('Ejercicio de práctica');
    await expect(page.locator('#casos-practicar')).toHaveAttribute('aria-pressed', 'true');
    const caja = page.locator('#casos-respuesta');
    await caja.fill('abc');
    await esperarValorEnReact(page, caja, 'abc');
    await page.locator('#casos-comprobar').click();
    await expect(page.locator('#casos-veredicto')).toContainText('Escribe un número');
  });

  test('la sección no deja ambiguos los botones que busca el acta', async ({ page }) => {
    await expect(page.getByRole('button', { name: /MRUA/ })).toHaveCount(1);
    await expect(page.getByRole('button', { name: /Caída/ })).toHaveCount(1);
    await expect(page.getByRole('button', { name: /Parabólico/ })).toHaveCount(1);
    await expect(page.getByRole('slider')).toHaveCount(1);
  });
});
