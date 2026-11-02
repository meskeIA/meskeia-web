import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';
import {
  CASOS,
  OPCIONES_ESTADO,
  OPCIONES_SENTIDO,
  OPCIONES_TONICIDAD,
  TOTAL_CASOS,
  comprobarRespuesta,
  decimalesDe,
  esPrediccion,
  generarEjercicioAleatorio,
  prediccionRobusta,
  resolverCaso,
  toleranciaDe,
  type DatosCaso,
  type DisolucionCaso,
} from '../../app/simulador-osmosis/casos';
import { dentroDeTolerancia, redondearA } from '../../lib/calculadoras/correctorCasosAula';

/**
 * simulador-osmosis — Casos para clase (skill /casos-aula-meskeia, 02/11/2026).
 *
 * Va APARTE del acta del Inspector (`simulador-osmosis.spec.ts`) porque el acta tiene un
 * `beforeEach` de nivel superior que abre la página: estas invariantes no necesitan navegador.
 * `casos.ts` IMPORTA el `motor.ts` que ya existía, sin tocarlo (su spec, `tests/osmosis-motor.spec.ts`).
 *
 * TIPOS: A (calcular) y C (predecir antes de mover). Los C van primero porque son la biología de
 * 13-16 (tonicidad, hacia dónde pasa el agua); π = i·M·R·T es química de 16-17, casos 9 a 12.
 *
 * EL CONVENIO: el motor usa R = 0,0820574 atm·L/(mol·K) (8,314462618/101,325) y T = t + 273,15;
 * en clase, R = 0,082 y T = t + 273. Los enunciados declaran los de clase y la tolerancia de π, Δπ
 * y h es la relativa (test 7.bis). i es el ideal (disociación completa), y lo dice el enunciado.
 *
 * LAS 12 RESPUESTAS, A MANO (interior de las células: 0,30 osmol/L):
 *    1 C  glucosa 0,1 | glucosa 0,4      el agua va hacia más partículas            → De A hacia B
 *    2 C  glóbulo rojo en agua destilada 0 < 0,30: hipotónico, animal                → se hincha
 *    3 C  lechuga en NaCl 3 %            30/58,44 = 0,5133 M · 2 = 1,027 > 0,30     → plasmólisis
 *    4 A  CaCl₂ 0,1 M                    3 · 0,1                                     = 0,3 osmol/L
 *    5 C  glucosa 0,30 M frente a 0,30   iguales                                     → isotónico
 *    6 C  glucosa 10 % | sacarosa 10 %   100/180,16 = 0,5551 frente a 100/342,3 = 0,2921 → De B hacia A
 *    7 C  glucosa 0,2 | sacarosa 0,2     mismo i, misma M                            → Ninguno
 *    8 A  NaCl 0,9 %                     9/58,44 = 0,154004                          → 0,154 mol/L
 *    9 A  sacarosa 0,2 M, 27 °C          0,2 · 0,0820574 · 300,15 = 4,9259           → 4,93 atm   (clase: 0,2·0,082·300 = 4,92)
 *   10 A  NaCl 3,5 %, 20 °C              35/58,44 · 2 = 1,19781 · 0,0820574 · 293,15 = 28,813 → 28,81 atm (clase: 28,78)
 *   11 A  NaCl 0,1 | glucosa 0,1, 25 °C  Δosm 0,1 · 8,314462618 · 298,15 = 247,90    → 247,9 kPa  (clase: 247,6)
 *   12 A  sacarosa 0,01 | agua, 20 °C    Δπ = 10 · 8,31446 · 293,15 = 24.373,6 Pa ÷ (1000 · 9,81) = 2,4846 → 2,48 m (clase: 2,48)
 */

const A_MANO: Record<number, number | string> = {
  1: 'A_a_B',
  2: 'hinchada',
  3: 'plasmolizada',
  4: 0.3,
  5: 'isotonico',
  6: 'B_a_A',
  7: 'ninguno',
  8: 0.154,
  9: 4.93,
  10: 28.81,
  11: 247.9,
  12: 2.48,
};

/* ── Un modelo propio, escrito en el test sin usar el motor ── */

const I: Record<string, number> = { glucosa: 1, sacarosa: 1, urea: 1, nacl: 2, kcl: 2, cacl2: 3 };
const MASA_MOLAR: Record<string, number> = { glucosa: 180.16, sacarosa: 342.3, urea: 60.06, nacl: 58.44, kcl: 74.55, cacl2: 110.98 };

interface Constantes {
  R: number; // atm·L/(mol·K)
  cero: number; // 0 °C en K
  i?: (id: string) => number;
}
const EXACTAS: Constantes = { R: 8.314462618 / 101.325, cero: 273.15 };
const DE_CLASE: Constantes = { R: 0.082, cero: 273 };
/** i real aproximado: los iones no se separan del todo (NaCl ≈ 1,9). */
const I_REAL = (id: string) => 1 + 0.9 * (I[id] - 1);

function osm(d: DisolucionCaso, c: Constantes): number {
  const M = d.unidad === 'molar' ? d.valor : (d.valor * 10) / MASA_MOLAR[d.solutoId];
  return (c.i ?? ((id: string) => I[id]))(d.solutoId) * M;
}

function aMano(d: DatosCaso, c: Constantes): number | string {
  const atm = (o: number, celsius: number) => o * c.R * (celsius + c.cero);
  const enUnidad = (a: number, u: 'atm' | 'kPa') => (u === 'atm' ? a : a * 101.325);
  switch (d.tipo) {
    case 'osmolaridad':
      return osm(d.disolucion, c);
    case 'molaridad':
      return (d.disolucion.valor * 10) / MASA_MOLAR[d.disolucion.solutoId];
    case 'presion':
      return enUnidad(atm(osm(d.disolucion, c), d.celsius), d.unidadPresion);
    case 'deltaPi':
      return enUnidad(atm(Math.abs(osm(d.ladoA, c) - osm(d.ladoB, c)), d.celsius), d.unidadPresion);
    case 'altura':
      return (atm(Math.abs(osm(d.ladoA, c) - osm(d.ladoB, c)), d.celsius) * 101325) / (1000 * 9.81);
    case 'sentido': {
      const a = osm(d.ladoA, c);
      const b = osm(d.ladoB, c);
      return Math.abs(a - b) < 1e-12 ? 'ninguno' : a > b ? 'B_a_A' : 'A_a_B';
    }
    case 'tonicidad':
    case 'estado': {
      const rel = (osm(d.medio, c) - d.interior) / d.interior;
      const t = Math.abs(rel) <= 0.05 + 1e-12 ? 'isotonico' : rel < 0 ? 'hipotonico' : 'hipertonico';
      if (d.tipo === 'tonicidad') return t;
      const ESTADO = {
        animal: { hipotonico: 'hinchada', isotonico: 'normal', hipertonico: 'crenada' },
        vegetal: { hipotonico: 'turgente', isotonico: 'flacida', hipertonico: 'plasmolizada' },
      } as const;
      return ESTADO[d.celula][t];
    }
  }
}

const redondeado = (d: DatosCaso, v: number | string) => (typeof v === 'number' ? redondearA(v, decimalesDe(d, v)) : v);

/** Decimales que enseña una cifra en formato español: «4,93 atm» → 2. */
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
      // `respuesta` guarda la cifra EXACTA: el redondeo va en el texto y en la tolerancia.
      expect(r.valor, `caso ${caso.id}`).toBe(caso.respuesta);
    }
  });

  test('4 · cada caso tiene enunciado, etiqueta, respuesta, desarrollo y pista', () => {
    for (const caso of CASOS) {
      expect(caso.enunciado.length, `caso ${caso.id}`).toBeGreaterThan(30);
      expect(caso.etiquetaRespuesta.trim(), `caso ${caso.id}`).not.toBe('');
      // La osmolaridad del caso 4 es un solo paso (3 · 0,1): es todo su desarrollo.
      expect(caso.pasos.length, `caso ${caso.id}`).toBeGreaterThanOrEqual(caso.datos.tipo === 'osmolaridad' ? 1 : 2);
      expect(caso.pista.trim(), `caso ${caso.id}`).not.toBe('');
      expect(caso.tarea, `caso ${caso.id}`).toBe(esPrediccion(caso.datos) ? 'C' : 'A');
      if (typeof caso.respuesta === 'number') expect(Number.isFinite(caso.respuesta), `caso ${caso.id}`).toBe(true);
      expect(/\bNaN\b|undefined|Infinity/.test(caso.enunciado + caso.pasos.join(' ')), `caso ${caso.id}`).toBe(false);
      expect(caso.enunciado + caso.pasos.join(' '), `caso ${caso.id}`).not.toMatch(/\b[Dd]e el\b/);
    }
    // Primero lo de secundaria: los C y la osmolaridad van antes que π = i·M·R·T.
    const primeraPresion = CASOS.findIndex((c) => ['presion', 'deltaPi', 'altura'].includes(c.datos.tipo));
    expect(CASOS.slice(0, primeraPresion).every((c) => !['presion', 'deltaPi', 'altura'].includes(c.datos.tipo))).toBe(true);
    expect(primeraPresion).toBeGreaterThanOrEqual(6);
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
    for (const caso of CASOS.filter((c) => typeof c.respuesta === 'number')) {
      const exacto = caso.respuesta as number;
      const decimales = decimalesDe(caso.datos, exacto);
      expect(decimalesMostrados(caso.respuestaTexto), `caso ${caso.id}`).toBeLessThanOrEqual(decimales);
      expect(caso.respuestaTexto, `caso ${caso.id}`).toContain(String(redondearA(exacto, decimales)).replace('.', ','));
      const esExacta = Math.abs(exacto - redondearA(exacto, decimales)) < 1e-9;
      expect(caso.requiereRedondeo, `caso ${caso.id}`).toBe(!esExacta);
      if (!esExacta) expect(caso.enunciado, `caso ${caso.id}`).toMatch(/redonde/i);
    }
  });

  test('6 · el generador es reproducible, variado y usa la misma aritmética', () => {
    const a = generarEjercicioAleatorio(12345);
    const b = generarEjercicioAleatorio(12345);
    expect(b.enunciado).toBe(a.enunciado);
    expect(b.respuesta).toBe(a.respuesta);
    const muestras = Array.from({ length: 40 }, (_, i) => generarEjercicioAleatorio(i + 1));
    expect(new Set(muestras.map((m) => String(m.respuesta))).size).toBeGreaterThanOrEqual(3);
    expect(new Set(muestras.map((m) => m.datos.tipo)).size).toBeGreaterThanOrEqual(3);
    for (const m of muestras) {
      const r = resolverCaso(m.datos);
      expect(r.valor, m.enunciado).toBe(m.respuesta);
      expect(comprobarRespuesta(m.respuesta, m.respuesta, m.datos).correcto, m.enunciado).toBe(true);
      // Y la cifra redondeada que pide el enunciado, que es la que escribe el alumno.
      expect(comprobarRespuesta(redondeado(m.datos, m.respuesta) as typeof m.respuesta, m.respuesta, m.datos).correcto, m.enunciado).toBe(true);
      const propio = aMano(m.datos, EXACTAS);
      if (typeof propio === 'string') {
        expect(propio, m.enunciado).toBe(m.respuesta);
        expect(prediccionRobusta(m.datos), m.enunciado).toBe(true);
      } else {
        expect(dentroDeTolerancia(propio, m.respuesta as number, toleranciaDe(m.datos, m.respuesta as number)), m.enunciado).toBe(true);
      }
    }
  });

  test('7 · el convenio queda fijado: las doce respuestas son las de la tabla a mano', () => {
    for (const caso of CASOS) {
      expect(redondeado(caso.datos, caso.respuesta), `caso ${caso.id} · ${caso.titulo}`).toBe(A_MANO[caso.id]);
      expect(redondeado(caso.datos, aMano(caso.datos, EXACTAS)), `caso ${caso.id}`).toBe(A_MANO[caso.id]);
      // La redondeada que pide el enunciado se acepta.
      expect(comprobarRespuesta(A_MANO[caso.id] as never, caso.respuesta, caso.datos).correcto, `caso ${caso.id}`).toBe(true);
    }
  });

  test('7.bis · con R = 0,082 y T = t + 273 la cifra de clase también se acepta', () => {
    const todos = [...CASOS, ...Array.from({ length: 40 }, (_, i) => generarEjercicioAleatorio(i + 1))];
    for (const caso of todos) {
      const id = 'id' in caso ? `caso ${caso.id}` : caso.enunciado;
      const deClase = aMano(caso.datos, DE_CLASE);
      if (typeof deClase === 'string') {
        // Una predicción no depende de R ni de T.
        expect(deClase, id).toBe(caso.respuesta);
        continue;
      }
      const cifra = redondeado(caso.datos, deClase) as number;
      expect(comprobarRespuesta(cifra, caso.respuesta, caso.datos).correcto, `${id}: ${cifra}`).toBe(true);
    }
    // Las de π declaran las constantes de clase.
    for (const caso of CASOS.filter((c) => ['presion', 'deltaPi', 'altura'].includes(c.datos.tipo))) {
      expect(caso.enunciado, `caso ${caso.id}`).toContain('R = 0,082');
    }
  });

  test('7.ter · los C no cambian con el i real ni caen cerca de la banda isotónica', () => {
    for (const caso of CASOS.filter((c) => esPrediccion(c.datos))) {
      // Ejecutando el modelo con OTRA i, no leyendo el enunciado.
      expect(aMano(caso.datos, { ...EXACTAS, i: I_REAL }), `caso ${caso.id}`).toBe(caso.respuesta);
      expect(prediccionRobusta(caso.datos), `caso ${caso.id}`).toBe(true);
      const d = caso.datos;
      if (d.tipo === 'estado' || d.tipo === 'tonicidad') {
        const rel = Math.abs(osm(d.medio, EXACTAS) - d.interior) / d.interior;
        expect(rel < 1e-9 || rel >= 0.15, `caso ${caso.id}: diferencia del ${rel}`).toBe(true);
        expect(d.medio.solutoId, `caso ${caso.id}: la urea cruza la membrana`).not.toBe('urea');
      }
      if (d.tipo === 'sentido') {
        const a = osm(d.ladoA, EXACTAS);
        const b = osm(d.ladoB, EXACTAS);
        if (caso.respuesta === 'ninguno') expect(I[d.ladoA.solutoId], `caso ${caso.id}`).toBe(I[d.ladoB.solutoId]);
        else expect(Math.abs(a - b) / Math.max(a, b), `caso ${caso.id}`).toBeGreaterThanOrEqual(0.15);
      }
    }
  });

  test('7.quater · las opciones dicen lo mismo que la pantalla del simulador', () => {
    // Se evalúa sobre lo que la pantalla ENSEÑA (ecosistema trófico, 23/09/2026): los textos de
    // las opciones tienen que ser los rótulos que pinta page.tsx para ese mismo resultado.
    const pagina = readFileSync('app/simulador-osmosis/page.tsx', 'utf8');
    for (const o of [...OPCIONES_SENTIDO, ...OPCIONES_TONICIDAD, ...OPCIONES_ESTADO.animal, ...OPCIONES_ESTADO.vegetal]) {
      expect(pagina, o.texto).toContain(`'${o.texto}'`);
    }
  });

  test('8 · el corrector reconoce los errores típicos por su nombre', () => {
    const caso = (id: number) => CASOS[id - 1];
    const corregir = (id: number, v: number | string | null) => comprobarRespuesta(v as never, caso(id).respuesta, caso(id).datos);

    expect(corregir(4, 0.3).correcto).toBe(true);
    expect(corregir(9, 4.92).correcto).toBe(true); // R = 0,082 y 300 K
    expect(corregir(12, 2.48).correcto).toBe(true);
    expect(corregir(1, 'A_a_B').correcto).toBe(true);
    expect(corregir(1, 'B_a_A').correcto).toBe(false);
    expect(corregir(1, null).motivo).toMatch(/Elige/);

    expect(corregir(4, 0.1).motivo).toMatch(/i = 1|disocia/i); // olvidar la disociación
    expect(corregir(9, 0.2 * 0.082 * 27).motivo).toMatch(/kelvin|°C/i); // T en °C
    expect(corregir(9, 4.9259 * 101.325).motivo).toMatch(/kPa/); // kPa por atm
    expect(corregir(11, 2.45).motivo).toMatch(/atm/); // atm por kPa
    expect(corregir(8, 0.9).motivo).toMatch(/%/); // el % como mol/L
    expect(corregir(8, 0.0154).motivo).toMatch(/10/); // falta el ×10

    expect(corregir(4, -0.3).correcto).toBe(false);
    expect(corregir(4, -0.3).motivo).toMatch(/negativ/);
    expect(corregir(4, -0.3).motivo).not.toMatch(/Infinity/);
    expect(corregir(4, Number.NaN).motivo).not.toMatch(/NaN/);
    // Una cifra exacta no tiene margen: 0,31 no vale por 0,3.
    expect(corregir(4, 0.31).correcto).toBe(false);
  });
});

test.describe('Casos para clase — en el navegador', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/simulador-osmosis/');
    await esperarHidratacion(page, ['input']);
  });

  test('el caso 1 se predice: «De B hacia A» falla y «De A hacia B» acierta', async ({ page }) => {
    const seccion = page.locator('#casos-aula');
    await page.getByRole('button', { name: /^Caso 1: / }).click();
    await expect(page.getByRole('button', { name: /^Caso 1: / })).toHaveAttribute('aria-pressed', 'true');
    const opciones = seccion.getByRole('group', { name: 'Paso neto de agua' });
    await opciones.getByRole('button', { name: 'De B hacia A' }).click();
    await expect(opciones.getByRole('button', { name: 'De B hacia A' })).toHaveAttribute('aria-pressed', 'true');
    await page.locator('#casos-comprobar').click();
    await expect(page.locator('#casos-veredicto')).not.toContainText('¡Correcto!');
    await opciones.getByRole('button', { name: 'De A hacia B' }).click();
    await page.locator('#casos-comprobar').click();
    await expect(page.locator('#casos-veredicto')).toContainText('¡Correcto!');
  });

  test('el caso 9 se corrige: 4,92 de clase vale y la solución se despliega', async ({ page }) => {
    await page.getByRole('button', { name: /^Caso 9: / }).click();
    const caja = page.locator('#casos-respuesta');
    await caja.fill('4,92');
    await esperarValorEnReact(page, caja, '4,92');
    await page.locator('#casos-comprobar').click();
    await expect(page.locator('#casos-veredicto')).toContainText('¡Correcto!');
    const solucion = page.locator('#casos-aula').getByRole('button', { name: /Ver solución/ });
    await expect(solucion).toHaveAttribute('aria-expanded', 'false');
    await solucion.click();
    await expect(page.locator('#casos-aula')).toContainText('4,93');
  });

  test('la sección no deja ambiguos los localizadores del acta', async ({ page }) => {
    for (const nombre of ['Lado A', 'Lado B', 'Medios de referencia', 'Tipo de célula']) {
      await expect(page.getByRole('group', { name: nombre, exact: true })).toHaveCount(1);
    }
    await expect(page.getByRole('textbox', { name: 'Temperatura de las disoluciones', exact: true })).toHaveCount(1);
    await expect(page.locator('#casos-aula [role="status"]')).toHaveCount(0);
  });
});
