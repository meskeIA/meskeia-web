import { test, expect } from '@playwright/test';

/**
 * Corrector compartido de «Casos para clase» — lib/calculadoras/correctorCasosAula.ts
 *
 * Lógica pura, sin navegador: corre en `npm run test:calc`.
 *
 * DE DÓNDE SALE (15/10/2026, hito `casos-aula-motor-corrector`)
 * El corrector estaba copiado en 33 apps. El hallazgo 1211 (ruido binario en el borde de la
 * tolerancia) se reparó a mano en las copias y faltaba en tres; el 1207 (la tolerancia del 1 %
 * daba por bueno un «101 %» de la descendencia) se reparó en una sola y quedó latente en nueve.
 * Este spec fija las dos cosas en el motor y comprueba que las apps le pasan la magnitud.
 *
 * CÓMO SE DERIVA CADA VALOR ESPERADO (a mano, nunca copiado de lo que devuelve el motor)
 *   · 1211: con esperado 0,1 y tolerancia 0,01, 0,11 y 0,09 están a 0,01 justos. En binario,
 *     0,11 − 0,1 = 0,009999999999999995 y 0,1 − 0,09 = 0,010000000000000009: sin margen, el
 *     segundo se rechazaría. Los dos tienen que aceptarse; 0,12 (a 0,02) no.
 *   · Tolerancia relativa: el mayor entre 0,01 y el 1 %. 7 → 0,07 · 0,5 → 0,01 · −300 → 3.
 *   · Tolerancia de redondeo: 6,25 con 2 decimales es exacto → 0. 1/3 con 2 decimales exige
 *     redondear → media centésima, 0,005. 2/3 con 0 decimales → 0,5.
 *   · Dominio: 101 % no existe; 99 % sí. 60,5 individuos no; 60 sí; −1 individuos no. Un coseno
 *     de 1,009 no; de −1 sí. El cuadrante 3,03 no; el 5 tampoco; el 4 sí. Δn = −1 sí; −0,99 no.
 *
 * LO QUE COMPRUEBA SOBRE LAS APPS
 * Para cada caso fijo y 40 semillas del modo práctica de las apps cuya magnitud no es siempre
 * 'real': (1) la respuesta declarada es posible en la magnitud declarada —una magnitud mal
 * elegida suspendería la respuesta correcta—, (2) el corrector de la app la acepta, y (3) los
 * valores IMPOSIBLES que caen dentro de su tolerancia se rechazan, que es el 1207.
 * Lo que NO puede ver: un caso que debería declararse 'recuento' y se dejó en 'real'. Eso lo
 * decide quien escribe el caso leyendo el enunciado; la sonda del 15/10/2026 lo hizo para los
 * 33 existentes (skill /casos-aula-meskeia).
 */

import {
  RUIDO_BINARIO,
  corregirNumero,
  dentroDeTolerancia,
  exigeRedondeo,
  fueraDeDominio,
  textoDesviacion,
  toleranciaDeRedondeo,
  toleranciaRelativa,
  type Magnitud,
} from '../lib/calculadoras/correctorCasosAula';

import * as algebra from '../app/algebra-ecuaciones/casos';
import * as estadistica from '../app/calculadora-estadistica/casos';
import * as circulo from '../app/simulador-trigonometria-circulo-unitario/casos';
import * as funciones from '../app/visualizador-funciones-mundo/casos';
import * as progresiones from '../app/simulador-progresiones/motor';
import * as equilibrio from '../app/simulador-equilibrio-quimico/casos';
import * as punnett from '../app/simulador-punnett/casos';
import * as normal from '../app/simulador-distribucion-normal/casos';
import * as genetica from '../app/simulador-genetica/casos';
import * as bohr from '../app/simulador-modelo-bohr/casos';
import * as periodica from '../app/tabla-periodica/casos';
import * as estequiometria from '../app/simulador-estequiometria/casos';
import * as circular from '../app/simulador-movimiento-circular/casos';
import * as plano from '../app/simulador-plano-inclinado/casos';
import * as pascal from '../app/simulador-principio-pascal/casos';
import * as resorte from '../app/simulador-mas-resorte/casos';
import * as lentes from '../app/simulador-lentes-opticas/casos';
import * as flotabilidad from '../app/simulador-flotabilidad/casos';
import * as condensadores from '../app/simulador-condensadores/casos';
import * as circuitos from '../app/simulador-circuitos-electricos/casos';
import * as volumenes from '../app/visualizador-volumenes/casos';
import * as contabilidad from '../app/simulador-contabilidad-basica/casos';

const CUADRANTE: Magnitud = { entero: true, minimo: 1, maximo: 4, que: 'el número de cuadrante' };

test.describe('el motor', () => {
  test('1211 — el borde exacto de la tolerancia no lo decide el ulp', () => {
    expect(0.11 - 0.1).toBeLessThan(0.01); // lo que hace la resta en binario por arriba…
    expect(0.1 - 0.09).toBeGreaterThan(0.01); // …y por abajo: por eso hace falta el margen
    expect(dentroDeTolerancia(0.11, 0.1, 0.01)).toBe(true);
    expect(dentroDeTolerancia(0.09, 0.1, 0.01)).toBe(true);
    expect(dentroDeTolerancia(0.12, 0.1, 0.01)).toBe(false);
    // Con tolerancia 0 es lo único que separa 0,3 de 0,1 + 0,2.
    expect(dentroDeTolerancia(0.1 + 0.2, 0.3, 0)).toBe(true);
    expect(RUIDO_BINARIO).toBeLessThan(0.0005 / 1000); // cinco órdenes bajo la menor tolerancia
  });

  test('las dos políticas de tolerancia', () => {
    expect(toleranciaRelativa(7)).toBeCloseTo(0.07, 12);
    expect(toleranciaRelativa(0.5)).toBe(0.01);
    expect(toleranciaRelativa(-300)).toBeCloseTo(3, 12);
    expect(exigeRedondeo(6.25, 2)).toBe(false);
    expect(toleranciaDeRedondeo(6.25, 2)).toBe(0);
    expect(toleranciaDeRedondeo(1 / 3, 2)).toBeCloseTo(0.005, 12);
    expect(toleranciaDeRedondeo(2 / 3, 0)).toBeCloseTo(0.5, 12);
    // El ruido binario no cuenta como «exige redondear»: 4,904999999999999 es 4,905.
    expect(exigeRedondeo(4.904999999999999, 3)).toBe(false);
    // Y el redondeo propio de una app se respeta (lentes y plano inclinado usan el suyo).
    const truncar = (v: number, d: number) => Math.trunc(v * 10 ** d) / 10 ** d;
    expect(exigeRedondeo(0.129, 2, truncar)).toBe(true);
  });

  test('1207 — el dominio de cada magnitud', () => {
    expect(fueraDeDominio(101, 'porcentaje')).toContain('100 %');
    expect(fueraDeDominio(-1, 'porcentaje')).not.toBeNull();
    expect(fueraDeDominio(99, 'porcentaje')).toBeNull();
    expect(fueraDeDominio(60.5, 'recuento')).not.toBeNull();
    expect(fueraDeDominio(-1, 'recuento')).not.toBeNull();
    expect(fueraDeDominio(60, 'recuento')).toBeNull();
    expect(fueraDeDominio(-1, 'entero')).toBeNull();
    expect(fueraDeDominio(-0.99, 'entero')).not.toBeNull();
    expect(fueraDeDominio(1.009, 'seno-coseno')).not.toBeNull();
    expect(fueraDeDominio(-1, 'seno-coseno')).toBeNull();
    expect(fueraDeDominio(3.03, CUADRANTE)).toBe('El número de cuadrante es un número entero.');
    expect(fueraDeDominio(5, CUADRANTE)).toBe('El número de cuadrante va de 1 a 4.');
    expect(fueraDeDominio(4, CUADRANTE)).toBeNull();
    expect(fueraDeDominio(1e9, 'real')).toBeNull();
  });

  test('corregirNumero: lo imposible se rechaza ANTES que la tolerancia', () => {
    // 101 está a 1 de 100, dentro del 1 %: sin dominio sería un acierto (el 1207 tal cual).
    expect(corregirNumero(101, 100, { tolerancia: toleranciaRelativa(100), magnitud: 'real' }).estado).toBe('acierto');
    const c = corregirNumero(101, 100, { tolerancia: toleranciaRelativa(100), magnitud: 'porcentaje' });
    expect(c.estado).toBe('imposible');
    expect(c.motivoImposible).not.toBeNull();
    expect(c.diferencia).toBeCloseTo(1, 12);
    expect(corregirNumero(99, 100, { tolerancia: 1, magnitud: 'porcentaje' }).estado).toBe('acierto');
    expect(corregirNumero(97, 100, { tolerancia: 1, magnitud: 'porcentaje' }).estado).toBe('fallo');
    const nada = corregirNumero(Number.NaN, 100, { tolerancia: 1, magnitud: 'porcentaje' });
    expect(nada.estado).toBe('no-numerico');
    expect(Number.isNaN(nada.diferencia)).toBe(true);
  });

  test('3369 — la desviación que se enseña al suspender no se redondea a 0', () => {
    const conComa = (n: number, d: number) => n.toLocaleString('es-ES', { maximumFractionDigits: d });
    // 8,004 − 8 = 0,004 (más el ulp): con dos decimales es «0»; hacen falta tres
    expect(textoDesviacion(8.004 - 8, 2, conComa)).toBe('0,004');
    expect(textoDesviacion(0.00004, 4, conComa)).toBe('0,00004');
    // Lo que ya se leía bien no cambia: 88,43 y 4 siguen con los decimales pedidos
    expect(textoDesviacion(90 - 1.5707963, 2, conComa)).toBe('88,43');
    expect(textoDesviacion(4, 2, conComa)).toBe('4');
    expect(textoDesviacion(0, 2, conComa)).toBe('0');
  });
});

/* ──────── Familia de la política de redondeo: ninguna dice «Te has desviado 0» (3369) ──────── */

/**
 * Las apps que corrigen con `toleranciaDeRedondeo` dan tolerancia 0 a una respuesta exacta, así que
 * suspenden a cualquier distancia. Se responde cada caso fijo y 40 prácticas a 0,00004 de la
 * respuesta (cuatro decimales por debajo de lo que pide la que más pide, lentes): en los exactos
 * suspende, y la cifra del motivo tiene que ser distinta de 0. Antes de 3369 decía «0» en todas.
 * Fuera, simulador-efecto-fotoelectrico: también usa esa política, pero ninguno de sus casos ni de
 * sus prácticas es exacto (h y e no dan cifras redondas), así que su tolerancia nunca es 0 y lo que
 * suspende se desvía al menos media centésima (medido el 18/10/2026 con esta misma sonda).
 */
interface Respuesta {
  correcto: boolean;
  motivo: string;
}
const DESVIO = 0.00004;
type Probar = () => Respuesta[];
const conCasos = <C, E>(casos: readonly C[], generar: (s: number) => E, deCaso: (c: C) => Respuesta, deEjercicio: (e: E) => Respuesta): Respuesta[] => [
  ...casos.map(deCaso),
  ...SEMILLAS.map((s) => deEjercicio(generar(s))),
];
const FAMILIA_REDONDEO: Record<string, Probar> = {
  'simulador-movimiento-circular': () =>
    conCasos(circular.CASOS, circular.generarEjercicioAleatorio, (c) => circular.comprobarRespuesta(c.exacto + DESVIO, c.exacto, c.decimales), (e) => circular.comprobarRespuesta(e.exacto + DESVIO, e.exacto)),
  'simulador-genetica': () =>
    conCasos(genetica.CASOS, genetica.generarEjercicioAleatorio, (c) => genetica.comprobarRespuesta(c.respuesta + DESVIO, c.respuesta, c.datos.busca.magnitud), (e) => genetica.comprobarRespuesta(e.respuesta + DESVIO, e.respuesta, e.datos.busca.magnitud)),
  'simulador-plano-inclinado': () =>
    conCasos(plano.CASOS, plano.generarEjercicioAleatorio, (c) => plano.comprobarRespuesta(c.respuesta + DESVIO, c.datos), (e) => plano.comprobarRespuesta(e.respuesta + DESVIO, e.datos)),
  'simulador-lentes-opticas': () =>
    conCasos(lentes.CASOS, lentes.generarEjercicioAleatorio, (c) => lentes.comprobarRespuesta(c.respuesta + DESVIO, c.datos), (e) => lentes.comprobarRespuesta(e.respuesta + DESVIO, e.datos)),
  'simulador-principio-pascal': () =>
    conCasos(pascal.CASOS, pascal.generarEjercicioAleatorio, (c) => pascal.comprobarRespuesta(c.respuesta + DESVIO, c.respuesta, c.datos), (e) => pascal.comprobarRespuesta(e.respuesta + DESVIO, e.respuesta, e.datos)),
  'simulador-mas-resorte': () =>
    conCasos(resorte.CASOS, resorte.generarEjercicioAleatorio, (c) => resorte.comprobarRespuesta(c.respuesta + DESVIO, c.respuesta, c.datos), (e) => resorte.comprobarRespuesta(e.respuesta + DESVIO, e.respuesta, e.datos)),
  'simulador-flotabilidad': () =>
    conCasos(flotabilidad.CASOS, flotabilidad.generarEjercicioAleatorio, (c) => flotabilidad.comprobarRespuesta(c.respuesta + DESVIO, c.respuesta, c.datos), (e) => flotabilidad.comprobarRespuesta(e.respuesta + DESVIO, e.respuesta, e.datos)),
  'simulador-condensadores': () =>
    conCasos(condensadores.CASOS, condensadores.generarEjercicioAleatorio, (c) => condensadores.comprobarRespuesta(c.respuesta + DESVIO, c.respuesta, c.datos), (e) => condensadores.comprobarRespuesta(e.respuesta + DESVIO, e.respuesta, e.datos)),
  'simulador-circuitos-electricos': () =>
    conCasos(circuitos.CASOS, circuitos.generarEjercicioAleatorio, (c) => circuitos.comprobarRespuesta(c.respuesta + DESVIO, c.respuesta, c.datos), (e) => circuitos.comprobarRespuesta(e.respuesta + DESVIO, e.respuesta, e.datos)),
  'visualizador-volumenes': () =>
    conCasos(volumenes.CASOS, volumenes.generarEjercicioAleatorio, (c) => volumenes.comprobarRespuesta(c.respuesta + DESVIO, c.respuesta, c.datos), (e) => volumenes.comprobarRespuesta(e.respuesta + DESVIO, e.respuesta, e.datos)),
  'simulador-contabilidad-basica': () =>
    conCasos(contabilidad.CASOS, contabilidad.generarEjercicioAleatorio, (c) => contabilidad.comprobarRespuesta(c.respuesta + DESVIO, c.respuesta, c.datos), (e) => contabilidad.comprobarRespuesta(e.respuesta + DESVIO, e.respuesta, e.datos)),
};

for (const [slug, probar] of Object.entries(FAMILIA_REDONDEO)) {
  test(`${slug}: al suspender por una desviación diminuta, la cifra del motivo no es 0 (3369)`, () => {
    const conDesvio = probar().filter((r) => !r.correcto && /desviado/.test(r.motivo));
    expect(conDesvio.length, 'ningún caso exacto suspendió: la sonda no ha probado nada').toBeGreaterThan(0);
    const enCero = conDesvio.map((r) => r.motivo).filter((m) => /desviado [−-]?0 de/.test(m));
    expect(enCero).toEqual([]);
  });
}

/* ───────────────────── Las apps con magnitud que cambia de un caso a otro ───────────────────── */

interface Pregunta {
  origen: string;
  esperado: number;
  tolerancia: number;
  magnitud: Magnitud;
  acierta: (valor: number) => boolean;
}

const SEMILLAS = Array.from({ length: 40 }, (_, i) => (i + 1) * 7919);

function conPractica<C, E>(casos: readonly C[], generar: (s: number) => E, deCaso: (c: C, i: number) => Pregunta, deEjercicio: (e: E, s: number) => Pregunta): Pregunta[] {
  return [...casos.map(deCaso), ...SEMILLAS.map((s) => deEjercicio(generar(s), s))];
}

const APPS: Record<string, () => Pregunta[]> = {
  'algebra-ecuaciones': () =>
    conPractica(
      algebra.CASOS,
      algebra.generarEjercicioAleatorio,
      (c) => pregunta(`caso ${c.id}`, c.respuesta, algebra.magnitudDe(c.datos), algebra.toleranciaDe, (v, e, m) => algebra.comprobarRespuesta(v, e, m).correcto),
      (e, s) => pregunta(`semilla ${s}`, e.respuesta, algebra.magnitudDe(e.datos), algebra.toleranciaDe, (v, x, m) => algebra.comprobarRespuesta(v, x, m).correcto),
    ),
  'calculadora-estadistica': () =>
    conPractica(
      estadistica.CASOS,
      estadistica.generarEjercicioAleatorio,
      (c) => pregunta(`caso ${c.id}`, c.respuesta, estadistica.magnitudDe(c), estadistica.toleranciaDe, (v, e, m) => estadistica.comprobarRespuesta(v, e, m).correcto),
      (e, s) => pregunta(`semilla ${s}`, e.respuesta, estadistica.magnitudDe(e), estadistica.toleranciaDe, (v, x, m) => estadistica.comprobarRespuesta(v, x, m).correcto),
    ),
  'simulador-trigonometria-circulo-unitario': () =>
    conPractica(
      circulo.CASOS,
      circulo.generarEjercicioAleatorio,
      (c) => pregunta(`caso ${c.id}`, c.respuesta, circulo.magnitudDe(c.datos), circulo.toleranciaDe, (v, e, m) => circulo.comprobarRespuesta(v, e, m).correcto),
      (e, s) => pregunta(`semilla ${s}`, e.respuesta, circulo.magnitudDe(e.datos), circulo.toleranciaDe, (v, x, m) => circulo.comprobarRespuesta(v, x, m).correcto),
    ),
  'visualizador-funciones-mundo': () =>
    conPractica(
      funciones.CASOS,
      funciones.generarEjercicioAleatorio,
      (c) => pregunta(`caso ${c.id}`, c.respuesta, c.magnitud, funciones.toleranciaDe, (v, e, m) => funciones.comprobarRespuesta(v, e, m).correcto),
      (e, s) => pregunta(`semilla ${s}`, e.respuesta, e.magnitud, funciones.toleranciaDe, (v, x, m) => funciones.comprobarRespuesta(v, x, m).correcto),
    ),
  'simulador-progresiones': () =>
    conPractica(
      progresiones.CASOS,
      progresiones.generarEjercicioAleatorio,
      (c) => pregunta(`caso ${c.id}`, c.respuesta, c.magnitud, progresiones.toleranciaDe, (v, e, m) => progresiones.comprobarRespuesta(v, e, m).correcto),
      (e, s) => pregunta(`semilla ${s}`, e.respuesta, e.magnitud, progresiones.toleranciaDe, (v, x, m) => progresiones.comprobarRespuesta(v, x, m).correcto),
    ),
  'simulador-equilibrio-quimico': () =>
    equilibrio.CASOS.flatMap((c) =>
      c.tipo === 'numerico'
        ? [pregunta(`caso ${c.id}`, c.respuesta, equilibrio.magnitudDe(c.datos), equilibrio.toleranciaDe, (v, e, m) => equilibrio.comprobarRespuesta(String(v).replace('.', ','), e, m).correcto)]
        : [],
    ),
  'simulador-punnett': () =>
    conPractica(
      punnett.CASOS,
      punnett.generarEjercicioAleatorio,
      (c) => ({ origen: `caso ${c.id}`, esperado: c.respuesta, tolerancia: punnett.toleranciaDe(), magnitud: punnett.esPorcentaje(c.datos) ? 'porcentaje' : 'recuento', acierta: (v) => punnett.comprobarRespuesta(v, c.respuesta, c.datos).correcto }),
      (e, s) => ({ origen: `semilla ${s}`, esperado: e.respuesta, tolerancia: punnett.toleranciaDe(), magnitud: punnett.esPorcentaje(e.datos) ? 'porcentaje' : 'recuento', acierta: (v) => punnett.comprobarRespuesta(v, e.respuesta, e.datos).correcto }),
    ),
  'simulador-distribucion-normal': () =>
    conPractica(
      normal.CASOS,
      normal.generarEjercicioAleatorio,
      (c) => ({ origen: `caso ${c.id}`, esperado: c.respuesta, tolerancia: normal.toleranciaDe(c.datos), magnitud: normal.magnitudDe(c.datos), acierta: (v) => normal.comprobarRespuesta(v, c.respuesta, c.datos).correcto }),
      (e, s) => ({ origen: `semilla ${s}`, esperado: e.respuesta, tolerancia: normal.toleranciaDe(e.datos), magnitud: normal.magnitudDe(e.datos), acierta: (v) => normal.comprobarRespuesta(v, e.respuesta, e.datos).correcto }),
    ),
  'simulador-genetica': () =>
    conPractica(
      genetica.CASOS,
      genetica.generarEjercicioAleatorio,
      (c) => deGenetica(`caso ${c.id}`, c.respuesta, c.datos.busca.magnitud),
      (e, s) => deGenetica(`semilla ${s}`, e.respuesta, e.datos.busca.magnitud),
    ),
  'simulador-modelo-bohr': () =>
    conPractica(
      bohr.CASOS,
      bohr.generarEjercicioAleatorio,
      (c) => ({ origen: `caso ${c.id}`, esperado: c.respuesta, tolerancia: bohr.toleranciaDe(c.datos), magnitud: bohr.magnitudDe(c.datos), acierta: (v) => bohr.comprobarRespuesta(v, c.respuesta, c.datos).correcto }),
      (e, s) => ({ origen: `semilla ${s}`, esperado: e.respuesta, tolerancia: bohr.toleranciaDe(e.datos), magnitud: bohr.magnitudDe(e.datos), acierta: (v) => bohr.comprobarRespuesta(v, e.respuesta, e.datos).correcto }),
    ),
  'simulador-estequiometria': () =>
    conPractica(
      estequiometria.CASOS,
      estequiometria.generarEjercicioAleatorio,
      (c) => ({ origen: `caso ${c.id}`, esperado: c.respuesta, tolerancia: estequiometria.toleranciaDe(c.respuesta), magnitud: estequiometria.magnitudDe(c.datos.pregunta), acierta: (v) => estequiometria.comprobarRespuesta(v, c.respuesta, c.datos).correcto }),
      (e, s) => ({ origen: `semilla ${s}`, esperado: e.respuesta, tolerancia: estequiometria.toleranciaDe(e.respuesta), magnitud: estequiometria.magnitudDe(e.datos.pregunta), acierta: (v) => estequiometria.comprobarRespuesta(v, e.respuesta, e.datos).correcto }),
    ),
  'tabla-periodica': () =>
    periodica.CASOS.flatMap((c) => {
      const esperado = c.respuestaNumerica;
      if (esperado === null) return [];
      const entero = (c as { respuestaEntera?: boolean }).respuestaEntera === true;
      return [{
        origen: `ficha ${c.id}`,
        esperado,
        tolerancia: entero ? 0 : periodica.toleranciaDe(esperado),
        magnitud: entero ? 'recuento' : 'real',
        acierta: (v: number) => periodica.comprobarRespuesta(String(v).replace('.', ','), c).correcto,
      } satisfies Pregunta];
    }),
};

function pregunta(
  origen: string,
  esperado: number,
  magnitud: Magnitud,
  tolerancia: (v: number) => number,
  comprobar: (v: number, esperado: number, magnitud: Magnitud) => boolean,
): Pregunta {
  return { origen, esperado, tolerancia: tolerancia(esperado), magnitud, acierta: (v) => comprobar(v, esperado, magnitud) };
}

function deGenetica(origen: string, esperado: number, m: 'porcentaje' | 'individuos'): Pregunta {
  return {
    origen,
    esperado,
    tolerancia: genetica.toleranciaDe(esperado),
    magnitud: m === 'porcentaje' ? 'porcentaje' : 'recuento',
    acierta: (v) => genetica.comprobarRespuesta(v, esperado, m).correcto,
  };
}

/** Valores a 0,9 tolerancias del esperado (o a 0,3 si la tolerancia es 0) que la magnitud declara imposibles. */
function imposiblesDentro(p: Pregunta): number[] {
  const d = p.tolerancia > 0 ? p.tolerancia * 0.9 : 0.3;
  return [p.esperado + d, p.esperado - d].filter((v) => fueraDeDominio(v, p.magnitud) !== null);
}

for (const [slug, preguntas] of Object.entries(APPS)) {
  test(`${slug}: la respuesta es posible, se acepta, y lo imposible cercano se rechaza`, () => {
    const lista = preguntas();
    expect(lista.length, 'sin preguntas que comprobar').toBeGreaterThan(0);
    const problemas: string[] = [];
    let sondas = 0;
    for (const p of lista) {
      if (!Number.isFinite(p.esperado)) continue;
      const imposible = fueraDeDominio(p.esperado, p.magnitud);
      if (imposible) problemas.push(`${p.origen}: su respuesta ${p.esperado} es imposible como ${JSON.stringify(p.magnitud)} (${imposible})`);
      if (!p.acierta(p.esperado)) problemas.push(`${p.origen}: el corrector suspende su propia respuesta ${p.esperado}`);
      for (const v of imposiblesDentro(p)) {
        sondas++;
        if (p.acierta(v)) problemas.push(`${p.origen}: acepta ${v}, imposible como ${JSON.stringify(p.magnitud)} (esperado ${p.esperado})`);
      }
    }
    expect(problemas).toEqual([]);
    // Que la sonda haya probado algo: una app de esta lista tiene al menos una magnitud acotada.
    expect(sondas, 'ninguna sonda de imposible: ¿se quedaron todas las magnitudes en real?').toBeGreaterThan(0);
  });
}
