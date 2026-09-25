import { test, expect } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact, sembrarValorAcotado } from './_hidratacion';

/**
 * visualizador-sonido-ondas — las cuatro secciones, servidas · 05/09/2026 (semilla S0119)
 *
 * Hasta hoy la app tenía cuatro pestañas y solo la activa llegaba al DOM, así que tres
 * cuartas partes de su contenido no existían para ningún índice: 150 visitas en 90 días
 * con 2 impresiones de buscador, la desproporción mayor del cuadrante STEM.
 *
 * Lo que este test protege es justamente eso, y por eso comprueba la presencia SIMULTÁNEA
 * de los cuatro encabezados: si alguien vuelve a esconder secciones tras un estado de
 * cliente, la regresión es invisible en pantalla (la app se ve igual de bien) y solo se
 * nota meses después en Search Console.
 */

const URL_APP = '/visualizador-sonido-ondas/';

// Sin usuario delante el AudioContext puede quedarse «suspended», y entonces el oscilador
// se crea, arranca y no suena nada. Va al nivel del fichero: Playwright rechaza un
// test.use({ launchOptions }) dentro de un describe, porque obliga a un worker nuevo.
test.use({ launchOptions: { args: ['--autoplay-policy=no-user-gesture-required'] } });

const SECCIONES = [
  { ancla: 'anatomia', titulo: 'Anatomía de una onda sonora' },
  { ancla: 'frecuencia', titulo: 'Frecuencia y tono' },
  { ancla: 'decibelios', titulo: 'Escala de decibelios' },
  { ancla: 'timbre', titulo: 'Timbre y armónicos' },
];

test.describe('visualizador-sonido-ondas', () => {
  test('las cuatro secciones están en la página a la vez, con su h2 y su ancla', async ({ page }) => {
    await page.goto(URL_APP);

    for (const s of SECCIONES) {
      await expect(page.getByRole('heading', { level: 2, name: s.titulo })).toBeVisible();
      await expect(page.locator(`section#${s.ancla}`)).toHaveCount(1);
    }
  });

  test('el índice lleva a cada sección por su ancla', async ({ page }) => {
    await page.goto(URL_APP);

    const indice = page.getByRole('navigation', { name: 'Secciones del visualizador' });
    for (const s of SECCIONES) {
      await expect(indice.locator(`a[href="#${s.ancla}"]`)).toHaveCount(1);
    }

    await indice.locator('a[href="#decibelios"]').click();
    await expect(page).toHaveURL(new RegExp('#decibelios$'));
    await expect(page.getByRole('heading', { level: 2, name: 'Escala de decibelios' })).toBeInViewport();
  });

  test('el contenido de las secciones viaja en el HTML servido, no solo tras hidratar', async ({ page }) => {
    // Se lee la respuesta del servidor directamente: si el contenido volviera a depender
    // de un estado de cliente, aquí faltarían tres de los cuatro títulos.
    const respuesta = await page.request.get(URL_APP);
    expect(respuesta.ok()).toBeTruthy();
    const html = await respuesta.text();

    for (const s of SECCIONES) {
      expect(html).toContain(s.titulo);
      expect(html).toContain(`id="${s.ancla}"`);
    }
  });

  /**
   * ⚠️ Este test aparecía en rojo de forma INTERMITENTE (1 de cada 3 corridas) hasta el
   * 12/09/2026: el botón de 880 Hz no llegaba a existir. No era la app, era la carrera de
   * hidratación descrita en `_hidratacion.ts` — reproducida a voluntad estrangulando la CPU
   * (`Emulation.setCPUThrottlingRate`, factor 20), que deja el `fill` por delante de React:
   * el DOM del deslizador se queda en 880 y el estado en 200, así que el `aria-label`, que
   * se deriva del estado, sigue diciendo «Escuchar tono a 200 hercios».
   * Por eso se espera a la hidratación ANTES de tocar el deslizador.
   */
  test('la onda sigue siendo interactiva tras el cambio', async ({ page }) => {
    await page.goto(URL_APP);
    await esperarHidratacion(page, ['input[aria-label="Frecuencia en hercios"]']);
    const slider = page.getByLabel('Frecuencia en hercios');
    await expect(slider).toHaveValue('200');
    await slider.fill('880');
    // El nombre accesible del botón sale de su aria-label, no del texto visible
    await expect(page.getByRole('button', { name: 'Escuchar tono a 880 hercios' })).toBeVisible();
  });
});

/**
 * ════════════════════════════════════════════════════════════════════════════════════════
 * CASOS PARA CLASE — la tarea asignable (skill /casos-aula-meskeia) · 19/09/2026 (semilla S0151)
 * ════════════════════════════════════════════════════════════════════════════════════════
 *
 * Esta app es la primera de la cola del canal aula sin tarea dentro: 114 de sus 167 visitas
 * históricas llegaron en eventos-aula (el 68 %, la fracción más alta del catálogo) y todas
 * desde el mismo país. Lo que faltaba no era público, era algo que asignarle.
 *
 * Estas pruebas NO abren el navegador: importan `casos.ts` y comprueban la física. El build
 * compila la vista sin mirar si la aritmética está bien, así que si no se comprueba aquí no
 * se comprueba en ningún sitio ([[feedback_motor_calculo_aparte_y_probado]]).
 *
 * ── DE DÓNDE SALE CADA VALOR ESPERADO ───────────────────────────────────────────────────
 * Todos derivados a mano desde la definición, NUNCA copiados de lo que devuelve la app:
 *
 *   1  λ = v/f = 343/686                     = 0,5 m
 *   2  T = 1/f = 1/250 = 0,004 s             = 4 ms
 *   3  f = 1/T = 1/0,0025                    = 400 Hz
 *   4  λ = 1480/740   (agua)                 = 2 m
 *   5  λ = 5100/1700  (acero)                = 3 m
 *   6  tabla de exposición, fila de 100 dB   = 15 min
 *   7  f₄ = 4 · 220                          = 880 Hz
 *   8  f₁ = 1100/5                           = 220 Hz
 *   9  60 + 10·log₁₀(100) = 60 + 20          = 80 dB
 *  10  70 + 10·log₁₀(2) = 70 + 3,0103        = 73,01 dB   ← NO son 140
 *  11  λ = 343/20                            = 17,15 m
 *  12  λ = 343/110000 = 0,0031181 m          = 3,12 mm
 */

import {
  CASOS,
  TOTAL_CASOS,
  EXPOSICION,
  anchoBarraExposicion,
  VELOCIDAD_AIRE,
  comprobarRespuesta,
  generarEjercicioAleatorio,
  longitudDeOnda,
  nivelTrasFactor,
  periodoDe,
  resolverCaso,
  velocidadEn,
} from '../../app/visualizador-sonido-ondas/casos';

/** Las doce respuestas, calculadas a mano arriba. */
const ESPERADAS: Record<number, number> = {
  1: 0.5, 2: 4, 3: 400, 4: 2, 5: 3, 6: 15,
  7: 880, 8: 220, 9: 80, 10: 73.01, 11: 17.15, 12: 3.12,
};

test.describe('visualizador-sonido-ondas · casos para clase', () => {
  test('1 · hay doce casos con ids 1..12 sin huecos', async () => {
    expect(TOTAL_CASOS).toBe(12);
    expect(CASOS.map((c) => c.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  test('2 · son deterministas: dos lecturas dan el mismo enunciado y la misma respuesta', async () => {
    const foto = CASOS.map((c) => `${c.id}|${c.enunciado}|${c.respuesta}`);
    const segunda = CASOS.map((c) => `${c.id}|${c.enunciado}|${c.respuesta}`);
    expect(segunda).toEqual(foto);
  });

  test('3 · la respuesta declarada coincide con recalcularla desde `datos`', async () => {
    // Caza a quien edita un enunciado y se olvida de la solución.
    for (const caso of CASOS) {
      const r = resolverCaso(caso.datos);
      expect(r.ok, `caso ${caso.id}: ${r.error ?? ''}`).toBe(true);
      const decimales = caso.datos.decimales ?? 2;
      const factor = 10 ** decimales;
      expect(Math.round(r.valor * factor) / factor, `caso ${caso.id}`).toBe(caso.respuesta);
    }
  });

  test('3.bis · cada respuesta es la calculada A MANO en la cabecera', async () => {
    for (const caso of CASOS) {
      expect(caso.respuesta, `caso ${caso.id} · ${caso.titulo}`).toBe(ESPERADAS[caso.id]);
    }
  });

  test('4 · cada caso tiene enunciado, etiqueta no vacía, respuesta finita y desarrollo', async () => {
    for (const caso of CASOS) {
      expect(caso.enunciado.length, `caso ${caso.id}`).toBeGreaterThan(30);
      expect(caso.etiquetaRespuesta.trim(), `caso ${caso.id}`).not.toBe('');
      expect(Number.isFinite(caso.respuesta), `caso ${caso.id}`).toBe(true);
      expect(caso.pasos.length, `caso ${caso.id}`).toBeGreaterThanOrEqual(2);
      expect(caso.pista.trim(), `caso ${caso.id}`).not.toBe('');
      expect(caso.respuestaTexto, `caso ${caso.id}`).not.toBe('—');
    }
  });

  test('5 · ningún enunciado nombra un país, una ciudad ni una moneda', async () => {
    // El 68 % del tráfico de esta app son aulas, y el canal es 90 % latinoamericano: un
    // enunciado anclado a un sitio concreto deja fuera a la mayor parte de su público.
    const PROHIBIDO =
      /\b(España|Espana|México|Mexico|Colombia|Argentina|Perú|Peru|Chile|Uruguay|Madrid|Barcelona|Bogotá|Lima|euros?|dólares?|pesos?)\b/i;
    for (const caso of CASOS) {
      expect(PROHIBIDO.test(`${caso.titulo} ${caso.enunciado}`), `caso ${caso.id}`).toBe(false);
    }
  });

  test('6 · el generador es reproducible, variado y usa la misma aritmética', async () => {
    // Reproducible: misma semilla, mismo ejercicio.
    for (const semilla of [1, 7, 99, 12345]) {
      const a = generarEjercicioAleatorio(semilla);
      const b = generarEjercicioAleatorio(semilla);
      expect(b.enunciado).toBe(a.enunciado);
      expect(b.respuesta).toBe(a.respuesta);
    }

    // Variado: reproducible NO es variado. Un xorshift32 sembrado con enteros pequeños
    // devuelve siempre el índice 0 y pasaría la prueba de arriba dando el mismo ejercicio.
    const respuestas = new Set<number>();
    const enunciados = new Set<string>();
    for (let s = 1; s <= 40; s++) {
      const e = generarEjercicioAleatorio(s);
      respuestas.add(e.respuesta);
      enunciados.add(e.enunciado);
    }
    expect(respuestas.size).toBeGreaterThanOrEqual(3);
    expect(enunciados.size).toBeGreaterThanOrEqual(3);

    // Misma aritmética que los fijos: su respuesta sale de `resolverCaso`, no de otra cuenta.
    for (let s = 1; s <= 20; s++) {
      const e = generarEjercicioAleatorio(s);
      const r = resolverCaso(e.datos);
      expect(r.ok, `semilla ${s}`).toBe(true);
      expect(Math.round(r.valor * 100) / 100, `semilla ${s}`).toBe(e.respuesta);
    }
  });

  test('7 · el convenio de la app queda fijado: v = 343 m/s en aire y decibelios logarítmicos', async () => {
    // Si alguien cambia la velocidad por defecto, el panel de la app y estos casos dejarían
    // de decir lo mismo. 343 m/s es aire a 20 °C, el valor con el que la app pinta su tarjeta.
    expect(VELOCIDAD_AIRE).toBe(343);
    expect(velocidadEn('Aire (20 °C)')).toBe(343);
    expect(longitudDeOnda(343)).toBe(1);
    expect(periodoDe(1000)).toBeCloseTo(0.001, 10);

    // El medio importa: el mismo tono mide casi 15 veces más dentro del acero.
    expect(longitudDeOnda(343, velocidadEn('Acero')) / longitudDeOnda(343)).toBeCloseTo(14.87, 2);

    // Los decibelios NO se suman: ×10 son +10 dB y duplicar son +3,01, nunca el doble.
    expect(nivelTrasFactor(60, 10)).toBeCloseTo(70, 10);
    expect(nivelTrasFactor(70, 2)).toBeCloseTo(73.0103, 4);
    expect(nivelTrasFactor(70, 2)).not.toBeCloseTo(140, 0);
  });

  test('8 · casos sin salida se responden con un error legible, nunca con una excepción', async () => {
    // Un throw dentro de un render tumba la página entera; un error se puede pintar.
    expect(resolverCaso({ entrada: { via: 'periodo', frecuencia: 0 } }).ok).toBe(false);
    expect(resolverCaso({ entrada: { via: 'longitud', frecuencia: 100, medio: 'Vacío' } }).ok).toBe(false);
    expect(resolverCaso({ entrada: { via: 'exposicion', db: 93 } }).ok).toBe(false);
    expect(resolverCaso({ entrada: { via: 'fundamental', frecuenciaArmonico: 440, n: 0 } }).ok).toBe(false);
  });

  test('9 · la corrección no imprime NaN y tolera el redondeo declarado', async () => {
    // El alumno escribe «73,01» y la respuesta exacta es 73,0103: tiene que valer.
    expect(comprobarRespuesta(73.01, 73.0103).correcto).toBe(true);
    // Y una respuesta de otro orden, no.
    expect(comprobarRespuesta(140, 73.0103).correcto).toBe(false);
    // Texto que no es número: veredicto con mensaje propio, sin «NaN» en pantalla.
    const v = comprobarRespuesta(Number.NaN, 0.5);
    expect(v.correcto).toBe(false);
    expect(v.motivo).not.toContain('NaN');
  });

  test('10 · la tabla de exposición que corrige es la misma que la app pinta', async () => {
    // `minutos` y `tiempo` son el mismo dato en dos formatos: si divergieran, el caso 6
    // corregiría con un número que la pantalla no dice en ninguna parte.
    const equivalencias: Record<string, number> = {
      '8 horas': 480, '4 horas': 240, '2 horas': 120, '1 hora': 60,
      '30 min': 30, '15 min': 15, '0 seg': 0,
    };
    for (const fila of EXPOSICION) {
      const esperado = equivalencias[fila.tiempo];
      if (esperado !== undefined) expect(fila.minutos, `${fila.db} dB`).toBe(esperado);
    }
  });
});

/**
 * La sección en el navegador. Las pruebas de arriba comprueban la física; esta comprueba lo
 * único que ellas no pueden: que el alumno escriba un número y la app lo corrija de verdad.
 */
test.describe('visualizador-sonido-ondas · los casos, en la página', () => {
  test('la sección se sirve y corrige la respuesta del caso 1', async ({ page }) => {
    await page.goto(URL_APP);
    await expect(page.getByRole('heading', { level: 2, name: 'Casos para clase' })).toBeVisible();

    // Se espera a la hidratación ANTES de escribir: en la ventana entre `load` y React el
    // valor entra en el DOM y no en el estado, y la corrección leería una casilla vacía.
    await esperarHidratacion(page, ['#casos-respuesta']);

    const seccion = page.locator('#casos-aula');
    const casilla = seccion.locator('#casos-respuesta');
    await casilla.fill('0,5');
    await seccion.getByRole('button', { name: 'Comprobar' }).click();
    // Acotado a la sección: la app ya tiene otro role="alert" (el aviso de seguridad auditiva).
    await expect(seccion.getByRole('alert')).toContainText('Correcto');

    // Y una respuesta equivocada no se da por buena.
    await casilla.fill('2');
    await seccion.getByRole('button', { name: 'Comprobar' }).click();
    await expect(seccion.getByRole('alert')).toContainText('No es correcto');
  });

  test('los doce casos son alcanzables y la solución se despliega', async ({ page }) => {
    await page.goto(URL_APP);
    await esperarHidratacion(page, ['#casos-respuesta']);

    const seccion = page.locator('#casos-aula');
    const navegador = seccion.getByRole('group', { name: 'Elegir caso' });
    await expect(navegador.getByRole('button')).toHaveCount(13); // 12 casos + «Practicar»

    await navegador.getByRole('button', { name: 'Caso 10: Dos máquinas iguales a la vez' }).click();
    // La app tiene 21 encabezados de nivel 3: el locator se acota, no se relaja.
    await expect(seccion.getByRole('heading', { level: 3 })).toContainText('Caso 10');

    const verSolucion = seccion.getByRole('button', { name: /Ver solución/ });
    await expect(verSolucion).toHaveAttribute('aria-expanded', 'false');
    await verSolucion.click();
    // 73,01 dB, no 140: es el error que este caso existe para corregir.
    await expect(seccion.getByText(/Respuesta:\s*73,01/)).toBeVisible();
  });
});

/**
 * ════════════════════════════════════════════════════════════════════════════════════════
 * INSPECTOR · 20/09/2026 — el panel de onda: λ, T y el tono que SALE de verdad
 * ════════════════════════════════════════════════════════════════════════════════════════
 *
 * Lo de arriba protege el contenido servido y la aritmética de los casos para clase. Lo que
 * no comprobaba nadie es la promesa central de la sección «Anatomía de onda»: las dos cifras
 * que la app pinta DENTRO del SVG mientras se mueve el deslizador, y que el botón «Escuchar»
 * emita el tono que anuncia. Que el SVG ondule no prueba que λ valga lo que dice, y que el
 * botón exista no prueba que suene.
 *
 * QUÉ PROMETE LA APP (de aquí salen los valores esperados)
 *   - <h1> «Sonido y Ondas» · subtítulo «Frecuencia, amplitud, decibelios y armónicos».
 *   - Tarjeta «Longitud de onda»: λ = v / f  ·  tarjeta «Período»: T = 1 / f.
 *   - Dato destacado y tabla de medios: v = 343 m/s en el aire a 20 °C (VELOCIDAD_AIRE).
 *   - Deslizador de frecuencia acotado a [20, 2.000] Hz, con los dos extremos rotulados.
 *
 * LOS TRES CASOS, RESUELTOS A MANO ANTES DE ABRIR LA APP (v = 343 m/s)
 *   normal   440 Hz   λ = 343/440  = 0,779545… m → «0,78 m»   T = 1/440 = 2,27272… ms → «2,27 ms»
 *   límite 2.000 Hz   λ = 343/2000 = 0,1715 m    → «0,17 m»   T = 0,0005 s = 500 μs  → «500,0 μs»
 *   límite    20 Hz   λ = 343/20   = 17,15 m     → «17,15 m»  T = 0,05 s   = 50 ms   → «50,00 ms»
 *   rechazo  «abc», «1e0», «0,5,1» en la casilla de los casos → veredicto con mensaje propio.
 *   Ninguno está copiado de la pantalla: salen de la fórmula que la propia app enseña.
 *
 * EL TONO SE MIRA EN LA WEB AUDIO API, NO EN EL DOM
 * Se envuelve `createOscillator` para registrar con qué frecuencia se llama a
 * `setValueAtTime`, en qué estado queda el AudioContext al arrancar, y —enganchando un
 * AnalyserNode al propio oscilador, ANTES de la ganancia de la app— qué espectro sale.
 * ⚠️ Un OscillatorNode recién creado ya vale 440 Hz por defecto, así que a 440 Hz el
 * `frequency.value` no discrimina nada: por eso el caso normal exige además la llamada
 * REGISTRADA, y el caso límite repite la medida a 2.000 Hz, que el valor por defecto no
 * puede fingir.
 */

/** Lo que el instrumentador deja en `window` por cada oscilador que la app crea. */
interface RegistroOnda {
  frecuenciasAplicadas: number[];
  iniciado: boolean;
  estadoCtxAlArrancar: AudioContextState | null;
}

/** Lectura del espectro REAL que emite el último oscilador creado. */
interface PicoEmitido {
  hz: number;
  anchoBin: number;
  db: number;
}

interface VentanaInstrumentada {
  __ondas: RegistroOnda[];
  __analizador: AnalyserNode | null;
  __pico: () => PicoEmitido | null;
}

/** Se inyecta con `addInitScript`, ANTES de cargar la página: la app usa ya las envueltas. */
function INSTRUMENTAR_AUDIO(): void {
  const w = window as unknown as VentanaInstrumentada;
  w.__ondas = [];
  w.__analizador = null;

  const crearOsc = AudioContext.prototype.createOscillator;
  AudioContext.prototype.createOscillator = function (this: AudioContext): OscillatorNode {
    const osc = crearOsc.call(this);
    const registro: RegistroOnda = {
      frecuenciasAplicadas: [],
      iniciado: false,
      estadoCtxAlArrancar: null,
    };
    w.__ondas.push(registro);

    // 8.192 puntos a 48 kHz: bins de 5,86 Hz y una ventana de 0,17 s, que se llena mucho
    // antes de que termine el tono de 1,5 s y sobra para separar 440 de 2.000 Hz.
    const analizador = this.createAnalyser();
    analizador.fftSize = 8192;
    analizador.smoothingTimeConstant = 0;
    // Enganchado al oscilador y no a la salida: la rampa de volumen de la app no puede
    // falsear la medida, y la amplitud del deslizador tampoco.
    osc.connect(analizador);
    w.__analizador = analizador;

    const parametro = osc.frequency;
    const fijar = parametro.setValueAtTime.bind(parametro);
    parametro.setValueAtTime = (valor: number, cuando: number): AudioParam => {
      registro.frecuenciasAplicadas.push(valor);
      return fijar(valor, cuando);
    };

    const arrancar = osc.start.bind(osc);
    osc.start = (cuando?: number): void => {
      registro.iniciado = true;
      registro.estadoCtxAlArrancar = osc.context.state;
      arrancar(cuando);
    };
    return osc;
  };

  w.__pico = (): PicoEmitido | null => {
    const analizador = w.__analizador;
    if (!analizador) return null;
    const datos = new Float32Array(analizador.frequencyBinCount);
    analizador.getFloatFrequencyData(datos);
    const anchoBin = analizador.context.sampleRate / analizador.fftSize;
    let picoDb = -Infinity;
    let picoIdx = -1;
    // Se empieza en 1: el bin 0 es la componente continua, que no es ningún tono.
    for (let i = 1; i < datos.length; i++) {
      if (datos[i] > picoDb) {
        picoDb = datos[i];
        picoIdx = i;
      }
    }
    return { hz: picoIdx * anchoBin, anchoBin, db: picoDb };
  };
}

test.describe('visualizador-sonido-ondas · el panel de onda (Inspector 20/09/2026)', () => {
  const SEL_FRECUENCIA = 'input[aria-label="Frecuencia en hercios"]';
  const SVG_ONDA = 'svg[aria-label^="Onda sinusoidal"]';

  test('caso normal · 440 Hz: λ = 0,78 m, T = 2,27 ms y el tono sale a 440 Hz', async ({ page }) => {
    await page.addInitScript(INSTRUMENTAR_AUDIO);
    await page.goto(URL_APP);
    await esperarHidratacion(page, [SEL_FRECUENCIA]);

    // El deslizador arranca en 200 Hz, así que pedir 440 MUEVE el estado de verdad: una
    // siembra que coincidiera con el valor inicial daría verde aunque el evento se perdiera.
    const aceptado = await sembrarValorAcotado(page, SEL_FRECUENCIA, 440);
    expect(aceptado).toBe('440');

    const panel = page.locator(`${SVG_ONDA} text`);
    // λ = 343/440 = 0,779545… m, a dos decimales.
    await expect(panel.nth(0)).toHaveText('λ = 0,78 m');
    // T = 1/440 = 0,00227272… s = 2,27272… ms. Por encima de 1 ms la app rotula en ms.
    await expect(panel.nth(1)).toHaveText('T = 2,27 ms');
    await expect(page.locator(SVG_ONDA)).toHaveAttribute(
      'aria-label',
      'Onda sinusoidal a 440 Hz con amplitud 70%',
    );

    const boton = page.getByRole('button', { name: 'Escuchar tono a 440 hercios' });
    await expect(boton).toBeVisible();
    await boton.click();

    const registros = async (): Promise<RegistroOnda[]> =>
      page.evaluate(() => (window as unknown as VentanaInstrumentada).__ondas);
    await expect.poll(async () => (await registros()).length).toBe(1);

    const [registro] = await registros();
    // La app PIDE 440 Hz: sin esta llamada, un oscilador recién creado ya valdría 440 y la
    // comprobación del espectro pasaría sin que la app hubiera hecho nada.
    expect(registro.frecuenciasAplicadas).toEqual([440]);
    expect(registro.iniciado).toBe(true);
    expect(registro.estadoCtxAlArrancar).toBe('running');

    // Y el tono que SALE: el pico del espectro cae dentro del bin de 440 Hz (medido
    // 439,45 Hz, que es el centro del bin 75 con anchura de 5,86 Hz).
    await expect
      .poll(
        async () => {
          const pico = await page.evaluate(() =>
            (window as unknown as VentanaInstrumentada).__pico(),
          );
          return pico ? Math.abs(pico.hz - 440) <= pico.anchoBin : Number.NaN;
        },
        { intervals: [150, 150, 200, 250], timeout: 4000 },
      )
      .toBe(true);
  });

  test('caso límite · los dos extremos del deslizador, y el tono los sigue', async ({ page }) => {
    await page.addInitScript(INSTRUMENTAR_AUDIO);
    await page.goto(URL_APP);
    await esperarHidratacion(page, [SEL_FRECUENCIA]);

    // Extremo superior: se piden 5.000 Hz, fuera del rango declarado [20, 2.000].
    const tope = await sembrarValorAcotado(page, SEL_FRECUENCIA, 5000);
    expect(tope).toBe('2000');

    const panel = page.locator(`${SVG_ONDA} text`);
    // λ = 343/2000 = 0,1715 m → 0,17 m a dos decimales.
    await expect(panel.nth(0)).toHaveText('λ = 0,17 m');
    // T = 1/2000 = 0,0005 s: por debajo de 1 ms la app cambia de unidad a microsegundos.
    await expect(panel.nth(1)).toHaveText('T = 500,0 μs');

    // El tono emitido es el del extremo. Aquí la medida SÍ discrimina por sí sola: 2.000 Hz
    // no es el valor por defecto de un OscillatorNode, que son 440.
    await page.getByRole('button', { name: 'Escuchar tono a 2000 hercios' }).click();
    await expect
      .poll(
        async () => {
          const pico = await page.evaluate(() =>
            (window as unknown as VentanaInstrumentada).__pico(),
          );
          return pico ? Math.abs(pico.hz - 2000) <= pico.anchoBin : Number.NaN;
        },
        { intervals: [150, 150, 200, 250], timeout: 4000 },
      )
      .toBe(true);

    // Extremo inferior: se piden 0 Hz y el control sube al mínimo declarado, 20 Hz. Con
    // f = 0 no habría onda (λ y T serían infinitos), y la app no llega nunca a ese estado.
    const suelo = await sembrarValorAcotado(page, SEL_FRECUENCIA, 0);
    expect(suelo).toBe('20');
    // λ = 343/20 = 17,15 m · T = 1/20 = 0,05 s = 50 ms.
    await expect(panel.nth(0)).toHaveText('λ = 17,15 m');
    await expect(panel.nth(1)).toHaveText('T = 50,00 ms');
  });

  test('caso de rechazo · lo que no es un número se rechaza con un mensaje legible', async ({ page }) => {
    await page.goto(URL_APP);
    await esperarHidratacion(page, ['#casos-respuesta']);

    const seccion = page.locator('#casos-aula');
    const casilla = seccion.locator('#casos-respuesta');
    const comprobar = seccion.getByRole('button', { name: 'Comprobar' });

    // `parseSpanishNumber` devuelve NaN con las tres, y ese NaN no puede llegar a pantalla:
    // «1e0» es notación científica y «0,5,1» tiene dos comas decimales.
    for (const entrada of ['abc', '1e0', '0,5,1']) {
      await casilla.fill(entrada);
      // `fill()` sí llega a React, pero no si la app aún no ha hidratado: el testigo es el
      // estado, no el DOM.
      await esperarValorEnReact(page, '#casos-respuesta', entrada);
      await comprobar.click();
      await expect(seccion.getByRole('alert')).toContainText('Escribe un número');
      await expect(seccion.getByRole('alert')).not.toContainText('NaN');
    }

    // Y la respuesta buena del caso 1 se acepta: λ = 343/686 = 0,5 m exactos.
    await casilla.fill('0,5');
    await esperarValorEnReact(page, '#casos-respuesta', '0,5');
    await comprobar.click();
    await expect(seccion.getByRole('alert')).toContainText('¡Correcto!');
  });
});

// ── Reparaciones del 20/09/2026 ───────────────────────────────────────────────

test.describe('visualizador-sonido-ondas · lo reparado el 20/09/2026', () => {
  test('la barra de exposición es proporcional al tiempo que rotula', () => {
    // Antes cada fila traía un porcentaje escrito a mano (100, 80, 60, 45…) que no era ni
    // lineal ni logarítmico: la gráfica contradecía al subtítulo «cada +3 dB reduce el tiempo
    // a la mitad» y la fila de 0 minutos pintaba barra.
    const porDb = (db: number) => EXPOSICION.find((e) => e.db === db)!;
    expect(anchoBarraExposicion(porDb(85).minutos)).toBe(100); // 480 min = la referencia
    expect(anchoBarraExposicion(porDb(88).minutos)).toBe(50); // 240 min: la mitad, +3 dB
    expect(anchoBarraExposicion(porDb(91).minutos)).toBe(25); // 120 min: la mitad otra vez
    expect(anchoBarraExposicion(porDb(94).minutos)).toBe(12.5);
    // Cada escalón de +3 dB parte por dos el ancho, que es lo que la sección enseña.
    for (const [a, b] of [[85, 88], [88, 91], [91, 94], [94, 97]] as const) {
      expect(anchoBarraExposicion(porDb(b).minutos) * 2).toBeCloseTo(
        anchoBarraExposicion(porDb(a).minutos),
        6,
      );
    }
    // Y con cero minutos no hay barra que pintar.
    expect(anchoBarraExposicion(porDb(120).minutos)).toBe(0);
  });

  test('el ejercicio de práctica trae pista, y es la del mecanismo que toca', () => {
    // El botón «Ver pista» era un botón muerto en modo práctica: cambiaba de rótulo y de
    // aria-expanded y no aparecía nada, porque el ejercicio generado no traía pista.
    for (let semilla = 0; semilla < 20; semilla++) {
      const ej = generarEjercicioAleatorio(semilla);
      expect(ej.pista.length, `semilla ${semilla}`).toBeGreaterThan(10);
      const delMismoMecanismo = CASOS.find((c) => c.datos.entrada.via === ej.datos.entrada.via);
      expect(ej.pista, `semilla ${semilla}`).toBe(delMismoMecanismo?.pista);
    }
  });

  test('la tarjeta de resonancia ya no usa Tacoma Narrows como ejemplo', async ({ page }) => {
    // Es el contraejemplo canónico: fue flameo aeroelástico, no resonancia. Billah y Scanlan
    // (Am. J. Phys. 59(2), 1991) escribieron su artículo contra esa frase de los libros.
    await page.goto(URL_APP);
    const tarjeta = page.locator('div', { hasText: 'Resonancia' }).last();
    await expect(tarjeta).not.toContainText('colapsó porque el viento generó vibraciones');
    // Si se menciona, es para decir lo que NO es.
    const texto = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
    if (texto.includes('Tacoma')) {
      expect(texto).toContain('NO es un caso de resonancia');
    }
  });

  test('el mismo referente sonoro no recibe dos niveles distintos', async ({ page }) => {
    await page.goto(URL_APP);
    const texto = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
    // El dato destacado decía que 85 dB es «un tráfico denso», y la tabla de al lado, 80.
    expect(texto).not.toContain('Es el volumen de un tráfico denso o un restaurante ruidoso');
  });
});

/**
 * ════════════════════════════════════════════════════════════════════════════════════════
 * INSPECTOR · 25/09/2026 — re-inspección, y la sospecha del 1757 de generador-ondas
 * ════════════════════════════════════════════════════════════════════════════════════════
 *
 * LA SOSPECHA, MEDIDA (forma del hallazgo 1757 de generador-ondas, vista por lectura de código)
 *   (a) Al desmontarse, la página llama a stopTone(), que hace osc.stop() SIN rampa de ganancia
 *       (page.tsx 274-284 y 296-298). CONFIRMADA: al salir a «Óptica» con un tono de 1.000 Hz
 *       sonando, la única llamada es stop() sin argumento; lo emitido cae de ≈ 0,097 a 0 en una
 *       muestra — caída en 3 ms del 89 % del nivel (con una rampa lineal de 10 ms sería el 27 %,
 *       de 50 ms el 9 %). stopTone es la misma función con la que cada nota corta a la anterior,
 *       así que el chasquido también suena al encadenar notas o timbres.
 *   (b) AudioContext de MÓDULO que no se cierra nunca. DESCARTADA como defecto audible: tras
 *       salir con un tono (o con el timbre de piano, 6 osciladores) sonando, a los 0,7 s de reloj
 *       de audio lo que llega a los altavoces es 0; y tres idas y vueltas crean UN solo contexto
 *       (el módulo no se reevalúa en la navegación de cliente), así que no se acumulan. Lo que
 *       queda es un contexto «running» y mudo en la app de destino: sin caso audible.
 *
 * LOS TRES CASOS, RESUELTOS A MANO ANTES DE ABRIR LA APP
 *   normal   686 Hz, amplitud 70 %:
 *              λ = 343/686 = 0,5 m → «λ = 0,50 m»      T = 1/686 s = 1,457726 ms → «T = 1,46 ms»
 *              v = 343 m/s: aire a 20 °C, 331,3·√(1 + 20/273,15) = 343,2 m/s (gas ideal), que es
 *              además la velocidad que la app declara en su tabla de medios.
 *              Tono: 686 Hz, pico 70/100 · 0,5 = 0,35 (page.tsx: amplitud/100 · 0,5).
 *              Notas: temperamento igual con La4 = 440 Hz (ISO 16:1975), f = 440·2^(n/12):
 *              Do3 130,81 · Re3 146,83 · Mi3 164,81 · Fa3 174,61 · Sol3 196,00 · La3 220,00 ·
 *              Si3 246,94 · Do4 261,63 (440·2^(−9/12) = 261,6256) · La4 440,00 · Do5 523,25.
 *   límite   (Pixel 7) amplitud 150 → el control capa a 100 → pico 1 · 0,5 = 0,5; amplitud 0 →
 *              capa a 5 → pico 0,05 · 0,5 = 0,025. Primera fila de la tabla de exposición:
 *              85 dB · 8 horas = NIOSH REL (DHHS/NIOSH 98-126, 1998): 85 dBA durante 8 h.
 *   rechazo  caso 10 (70 dB + una máquina igual): L = 70 + 10·log₁₀(2) = 73,0103 → 73,01 dB.
 *              «140» (sumar decibelios) se rechaza: |140 − 73,01| = 66,99. Tolerancia
 *              max(0,01; 1 % · 73,01) = 0,7301: «73,75» se rechaza (0,74) y «73,74» y «73.01»
 *              se aceptan.
 *
 * LOS DATOS DE LOS HALLAZGOS, DE SU FUENTE
 *   · NIOSH 98-126, Tabla 1-1 y tasa de intercambio de 3 dB: T = 480 / 2^((L − 85)/3) min.
 *     A 120 dBA: 480 / 2^(35/3) = 0,1476 min = 8,9 s (la tabla de NIOSH: 118 dBA 14 s, 121 dBA 7 s).
 *   · Velocidad del sonido: v = √(E/ρ) (sólidos) y √(K/ρ) (fluidos), Newton-Laplace: depende
 *     de la RIGIDEZ entre la densidad. Densidades: agua 998 kg/m³ (20 °C), madera de pino
 *     ≈ 500 kg/m³ (flota), diamante 3.510 kg/m³, acero 7.850 kg/m³.
 *   · Ortografía de la RAE (2010): «15 %» separado; con cuatro cifras no se agrupa (1760);
 *     el ordinal abreviado es «2.º» (letra volada), no el signo de grado «°» (U+00B0).
 */
import { devices, type Locator, type Page } from '@playwright/test';
import { sembrarValor } from './_hidratacion';

interface LlamadaSal {
  quien: string;
  metodo: string;
  args: number[];
  /** Reloj de audio (ctx.currentTime) en el instante de la llamada. */
  ct: number;
}

interface VentanaSal {
  __salLlamadas: LlamadaSal[];
  __salBuses: { ctx: AudioContext; g: GainNode; an: AnalyserNode }[];
  __salContextos: AudioContext[];
}

/**
 * El modelo es el de generador-ondas y generador-tonos («HALLAZGO — al salir a otra app…»):
 * anota cada automatización de las ganancias, start()/stop() con su argumento y cada close(),
 * con el reloj de AUDIO; cuenta los AudioContext que se crean, y desvía todo lo que la app
 * conecta a `ctx.destination` por un bus con un AnalyserNode: lo que mide ese bus es
 * exactamente lo que llega a los altavoces. Si el contexto se cierra, su analizador conserva
 * las últimas 32.768 muestras (0,68 s a 48 kHz).
 */
function INSTRUMENTAR_SALIDA(): void {
  const w = window as unknown as VentanaSal;
  w.__salLlamadas = [];
  w.__salBuses = [];
  w.__salContextos = [];
  const Original = window.AudioContext;
  class Contado extends Original {
    constructor(opciones?: AudioContextOptions) {
      super(opciones);
      w.__salContextos.push(this);
    }
  }
  window.AudioContext = Contado;

  const dueno = new WeakMap<object, { id: string; ctx: BaseAudioContext }>();
  const proto = BaseAudioContext.prototype;
  const crearOsc = proto.createOscillator;
  const crearGan = proto.createGain;
  const crearAn = proto.createAnalyser;
  let nOsc = 0;
  let nGan = 0;
  proto.createOscillator = function (this: BaseAudioContext): OscillatorNode {
    const nodo = crearOsc.call(this);
    const id = `osc${nOsc++}`;
    dueno.set(nodo, { id, ctx: this });
    dueno.set(nodo.frequency, { id: `${id}.frequency`, ctx: this });
    return nodo;
  };
  proto.createGain = function (this: BaseAudioContext): GainNode {
    const nodo = crearGan.call(this);
    dueno.set(nodo.gain, { id: `gain${nGan++}.gain`, ctx: this });
    return nodo;
  };
  const anotar = (obj: object, metodo: string, args: unknown[]): void => {
    const d = dueno.get(obj);
    if (!d) return;
    w.__salLlamadas.push({
      quien: d.id,
      metodo,
      args: args.filter((a): a is number => typeof a === 'number'),
      ct: d.ctx.currentTime,
    });
  };
  const param = AudioParam.prototype as unknown as Record<string, (...a: number[]) => AudioParam>;
  for (const metodo of [
    'setValueAtTime',
    'linearRampToValueAtTime',
    'exponentialRampToValueAtTime',
    'setTargetAtTime',
    'cancelScheduledValues',
    'cancelAndHoldAtTime',
  ]) {
    const original = param[metodo];
    param[metodo] = function (this: AudioParam, ...args: number[]): AudioParam {
      anotar(this, metodo, args);
      return original.apply(this, args);
    };
  }
  const osc = OscillatorNode.prototype;
  const arrancar = osc.start;
  const parar = osc.stop;
  osc.start = function (this: OscillatorNode, cuando?: number): void {
    anotar(this, 'start', cuando === undefined ? [] : [cuando]);
    return arrancar.call(this, cuando);
  };
  osc.stop = function (this: OscillatorNode, cuando?: number): void {
    anotar(this, 'stop', cuando === undefined ? [] : [cuando]);
    return parar.call(this, cuando);
  };
  const cerrar = Original.prototype.close;
  Original.prototype.close = function (this: AudioContext): Promise<void> {
    w.__salLlamadas.push({ quien: 'ctx', metodo: 'close', args: [], ct: this.currentTime });
    return cerrar.call(this);
  };
  const nodo = AudioNode.prototype as unknown as { connect: (...a: unknown[]) => unknown };
  const conectar = nodo.connect;
  nodo.connect = function (this: AudioNode, destino: unknown, ...resto: unknown[]): unknown {
    if (destino instanceof AudioDestinationNode) {
      const ctx = this.context as AudioContext;
      let bus = w.__salBuses.find((b) => b.ctx === ctx);
      if (!bus) {
        const g = crearGan.call(ctx);
        const an = crearAn.call(ctx);
        an.fftSize = 32768;
        an.smoothingTimeConstant = 0;
        conectar.call(g, ctx.destination);
        conectar.call(g, an);
        bus = { ctx, g, an };
        w.__salBuses.push(bus);
      }
      return conectar.call(this, bus.g, ...resto);
    }
    return conectar.call(this, destino, ...resto);
  };
}

const SEL_FREQ_25 = 'input[aria-label="Frecuencia en hercios"]';
const SEL_AMP_25 = 'input[aria-label="Amplitud en porcentaje"]';
const SEL_INST_25 = 'input[aria-label="Seleccionar instrumento"]';
const RAMPAS = ['linearRampToValueAtTime', 'exponentialRampToValueAtTime', 'setTargetAtTime'];

async function abrirInstrumentada(page: Page): Promise<void> {
  await page.addInitScript(INSTRUMENTAR_SALIDA);
  await page.goto(URL_APP);
  await esperarHidratacion(page, [SEL_FREQ_25, SEL_AMP_25, SEL_INST_25]);
}

const llamadasSal = (page: Page): Promise<LlamadaSal[]> =>
  page.evaluate(() => (window as unknown as VentanaSal).__salLlamadas);

/** Reloj de audio del ÚLTIMO contexto que ha sonado (si la app cerrase y recrease, el vigente). */
const relojSal = (page: Page): Promise<number> =>
  page.evaluate(() => (window as unknown as VentanaSal).__salBuses.at(-1)?.ctx.currentTime ?? -1);

/** Pulsa y espera, en el reloj de AUDIO, a que lo que ha empezado a sonar lleve `segundos`. */
async function escuchar(
  page: Page,
  boton: Locator,
  segundos: number,
  pulsar: (b: Locator) => Promise<void> = (b) => b.click(),
): Promise<number> {
  const desde = (await llamadasSal(page)).length;
  await pulsar(boton);
  await expect.poll(async () => (await llamadasSal(page)).slice(desde).some((l) => l.metodo === 'start')).toBe(true);
  const inicio = (await llamadasSal(page)).slice(desde).find((l) => l.metodo === 'start')?.ct ?? 0;
  await expect
    .poll(() => relojSal(page), { intervals: [20], timeout: 10000, message: 'el reloj de audio no avanza' })
    .toBeGreaterThanOrEqual(inicio + segundos);
  return inicio;
}

interface CapturaSal {
  sr: number;
  x: number[];
  estado: string;
}

const capturarSal = (page: Page): Promise<CapturaSal> =>
  page.evaluate(() => {
    const b = (window as unknown as VentanaSal).__salBuses.at(-1);
    if (!b) return { sr: 0, x: [], estado: 'sin-bus' };
    const x = new Float32Array(b.an.fftSize);
    b.an.getFloatTimeDomainData(x);
    return { sr: b.ctx.sampleRate, x: Array.from(x), estado: b.ctx.state };
  });

/** Pico de |x| en el búfer (0,68 s) del último contexto: el nivel que llega a los altavoces. */
const picoSal = async (page: Page): Promise<number> => {
  const c = await capturarSal(page);
  return c.x.reduce((m, v) => Math.max(m, Math.abs(v)), 0);
};

/** Frecuencia del pico del espectro que llega a los altavoces, con la anchura de su bin. */
const espectroSal = (page: Page): Promise<{ hz: number; anchoBin: number }> =>
  page.evaluate(() => {
    const b = (window as unknown as VentanaSal).__salBuses.at(-1);
    if (!b) return { hz: Number.NaN, anchoBin: Number.NaN };
    const d = new Float32Array(b.an.frequencyBinCount);
    b.an.getFloatFrequencyData(d);
    const anchoBin = b.ctx.sampleRate / b.an.fftSize;
    let pico = -Infinity;
    let k = -1;
    for (let i = 1; i < d.length; i++) {
      if (d[i] > pico) {
        pico = d[i];
        k = i;
      }
    }
    return { hz: k * anchoBin, anchoBin };
  });

/**
 * La mayor CAÍDA de la envolvente en 3 ms, relativa al nivel de los 30 ms anteriores.
 * Envolvente = máximo de |x| en ±0,75 ms (a 1.000 Hz, un periodo y medio), en pasos de 0,25 ms.
 * Validada sobre señales sintéticas del mismo tono con su decaimiento de 1,5 s: corte en seco
 * 0,889 · rampa lineal de 5 ms 0,537 · de 10 ms 0,274 · de 50 ms 0,090 · setTargetAtTime con
 * τ = 5 ms 0,395 · sin corte 0,010. Umbral 0,45: el corte en seco (medido 0,889 en la app) queda
 * al doble, y cualquier rampa de 10 ms o más, o τ ≥ 5 ms, por debajo.
 */
function caidaMaxima3ms(c: CapturaSal): { caida: number; nivel: number } {
  const ms = (m: number): number => Math.round((m / 1000) * c.sr);
  const w = ms(0.75);
  const paso = Math.max(1, ms(0.25));
  const env: number[] = [];
  for (let i = 0; i < c.x.length; i += paso) {
    let m = 0;
    for (let k = Math.max(0, i - w); k <= Math.min(c.x.length - 1, i + w); k++) m = Math.max(m, Math.abs(c.x[k]));
    env.push(m);
  }
  const d3 = Math.round(ms(3) / paso);
  const d30 = Math.round(ms(30) / paso);
  let caida = 0;
  let nivel = 0;
  for (let j = d30; j + d3 < env.length; j++) {
    let ref = 0;
    for (let k = j - d30; k <= j; k++) ref = Math.max(ref, env[k]);
    nivel = Math.max(nivel, ref);
    if (ref < 0.02) continue;
    caida = Math.max(caida, (env[j] - env[j + d3]) / ref);
  }
  return { caida, nivel };
}

/** Sale por la tarjeta de RelatedApps: navegación de cliente, que DESMONTA la página. */
async function salirAOptica(page: Page): Promise<void> {
  await page.locator('a[href*="/visualizador-optica/"]').first().click();
  await page.waitForURL(/visualizador-optica/);
}

/** Contraste texto/fondo del primer elemento; para texto SVG, el color es el `fill`. */
const contrasteDe = (loc: Locator): Promise<number> =>
  loc.first().evaluate((el) => {
    interface C {
      r: number;
      g: number;
      b: number;
      a: number;
    }
    const leer = (s: string): C => {
      const m = s.match(/rgba?\(([^)]+)\)/);
      if (!m) return { r: 0, g: 0, b: 0, a: 0 };
      const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
      return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
    };
    const mezcla = (a: C, b: C): C => ({
      r: a.r * a.a + b.r * (1 - a.a),
      g: a.g * a.a + b.g * (1 - a.a),
      b: a.b * a.a + b.b * (1 - a.a),
      a: 1,
    });
    const lum = ({ r, g, b }: C): number => {
      const f = (v: number): number => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const capas: C[] = [];
    for (let e: Element | null = el; e; e = e.parentElement) {
      const c = leer(getComputedStyle(e).backgroundColor);
      if (c.a > 0) {
        capas.push(c);
        if (c.a === 1) break;
      }
    }
    let fondo: C = { r: 255, g: 255, b: 255, a: 1 };
    for (let i = capas.length - 1; i >= 0; i--) fondo = mezcla(capas[i], fondo);
    const estilo = getComputedStyle(el);
    const texto = mezcla(leer(el instanceof SVGElement ? estilo.fill : estilo.color), fondo);
    const [l1, l2] = [lum(texto), lum(fondo)];
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  });

/** Tamaño de letra con el que se PINTA: en SVG, el `font-size` por la escala del viewBox. */
const letraPintada = (loc: Locator): Promise<number> =>
  loc.first().evaluate((el) => {
    const base = parseFloat(getComputedStyle(el).fontSize);
    if (el instanceof SVGGraphicsElement) {
      const m = el.getScreenCTM();
      return m ? base * Math.hypot(m.a, m.b) : base;
    }
    return base;
  });

test.describe('visualizador-sonido-ondas · Inspector 25/09/2026', () => {
  test('CASO NORMAL · 686 Hz: λ = 0,50 m, T = 1,46 ms, suena a 686 Hz con pico 0,35, y las diez notas en temperamento igual', async ({
    page,
  }) => {
    await abrirInstrumentada(page);
    // Arranca en 200 Hz: pedir 686 MUEVE el estado de verdad.
    await sembrarValor(page, SEL_FREQ_25, 686);

    const panel = page.locator('svg[aria-label^="Onda sinusoidal"] text');
    await expect(panel.nth(0)).toHaveText('λ = 0,50 m'); // 343/686 = 0,5 m
    await expect(panel.nth(1)).toHaveText('T = 1,46 ms'); // 1/686 s = 1,457726 ms
    await expect(page.locator('svg[aria-label^="Onda sinusoidal"]')).toHaveAttribute(
      'aria-label',
      /^Onda sinusoidal a 686 Hz con amplitud 70/,
    );

    await escuchar(page, page.getByRole('button', { name: 'Escuchar tono a 686 hercios' }), 0.25);
    const log = await llamadasSal(page);
    expect(
      log.filter((l) => l.quien.endsWith('.frequency') && l.metodo === 'setValueAtTime').map((l) => l.args[0]),
    ).toEqual([686]);
    // Lo que SALE: pico del espectro dentro del bin de 686 Hz (1,46 Hz a 48 kHz)…
    const pico = await espectroSal(page);
    expect(Math.abs(pico.hz - 686), `pico en ${pico.hz} Hz`).toBeLessThanOrEqual(pico.anchoBin);
    // …y a 70/100 · 0,5 = 0,35 de pico. El primer máximo del seno llega a 0,36 ms, con la
    // rampa exponencial apenas empezada (0,3495): el intervalo caza un 0,5 o un 0,7.
    const nivel = await picoSal(page);
    expect(nivel).toBeGreaterThan(0.33);
    expect(nivel).toBeLessThanOrEqual(0.3505);

    // Las diez notas: 440·2^(n/12), redondeadas a 2 decimales (ISO 16:1975, La4 = 440 Hz).
    const filas = await page
      .locator('[role="button"][aria-label^="Escuchar "][aria-label$=" hercios"]')
      .evaluateAll((els) => els.map((e) => e.getAttribute('aria-label')));
    expect(filas).toEqual([
      'Escuchar Do3 (C3) a 130,81 hercios',
      'Escuchar Re3 (D3) a 146,83 hercios',
      'Escuchar Mi3 (E3) a 164,81 hercios',
      'Escuchar Fa3 (F3) a 174,61 hercios',
      'Escuchar Sol3 (G3) a 196,00 hercios',
      'Escuchar La3 (A3) a 220,00 hercios',
      'Escuchar Si3 (B3) a 246,94 hercios',
      'Escuchar Do4 (C4) a 261,63 hercios',
      'Escuchar La4 (A4) a 440,00 hercios',
      'Escuchar Do5 (C5) a 523,25 hercios',
    ]);
    // Y la nota suena a lo que rotula, también con la barra espaciadora (reparación 1058).
    const desde = (await llamadasSal(page)).length;
    await page.getByRole('button', { name: 'Escuchar Do4 (C4) a 261,63 hercios' }).focus();
    await page.keyboard.press(' ');
    await expect
      .poll(async () =>
        (await llamadasSal(page))
          .slice(desde)
          .filter((l) => l.quien.endsWith('.frequency') && l.metodo === 'setValueAtTime')
          .map((l) => l.args[0]),
      )
      .toEqual([261.63]);
  });

  test('CASO RECHAZO · caso 10: sumar decibelios (140) se rechaza con la desviación exacta; 73,01 se acepta', async ({
    page,
  }) => {
    await page.goto(URL_APP);
    await esperarHidratacion(page, ['#casos-respuesta']);
    const seccion = page.locator('#casos-aula');
    await seccion.getByRole('button', { name: 'Caso 10: Dos máquinas iguales a la vez' }).click();
    await expect(seccion.getByRole('heading', { level: 3 })).toContainText('Caso 10');
    const casilla = seccion.locator('#casos-respuesta');
    // Acotado a la sección: getByRole('alert') casaría también con #__next-route-announcer__.
    const veredicto = seccion.getByRole('alert');
    const responder = async (texto: string): Promise<void> => {
      await casilla.fill(texto);
      await esperarValorEnReact(page, '#casos-respuesta', texto);
      await seccion.getByRole('button', { name: 'Comprobar' }).click();
    };

    // 70 + 70 = 140 es el error que el caso existe para corregir: |140 − 73,01| = 66,99.
    await responder('140');
    await expect(veredicto).toContainText('No es correcto. Te has desviado 66,99 de la respuesta.');
    // Justo fuera de la tolerancia (0,7301): 73,75 − 73,01 = 0,74.
    await responder('73,75');
    await expect(veredicto).toContainText('Te has desviado 0,74');
    // Justo dentro (0,73) y el valor exacto, con coma y con punto decimal.
    for (const bueno of ['73,74', '73,01', '73.01']) {
      await responder(bueno);
      await expect(veredicto).toContainText('¡Correcto!');
    }
  });

  test('SOSPECHA (b) descartada · al salir con un tono o un timbre sonando no queda nada sonando, y volver no acumula contextos', async ({
    page,
  }) => {
    await abrirInstrumentada(page);
    for (const sonido of ['tono', 'timbre', 'tono'] as const) {
      let boton = page.getByRole('button', { name: /^Escuchar tono a / });
      if (sonido === 'timbre') {
        await sembrarValor(page, SEL_INST_25, 2); // Piano: 6 osciladores
        boton = page.getByRole('button', { name: 'Escuchar La4 con timbre de Piano' });
      }
      await escuchar(page, boton, 0.3);
      await salirAOptica(page);
      // En la app de destino: cada contexto, o cerrado, o mudo en todo su búfer de 0,68 s.
      await expect
        .poll(
          async () =>
            page.evaluate(() =>
              (window as unknown as VentanaSal).__salBuses.every((b) => {
                if (b.ctx.state === 'closed') return true;
                const x = new Float32Array(b.an.fftSize);
                b.an.getFloatTimeDomainData(x);
                return x.every((v) => Math.abs(v) < 1e-3);
              }),
            ),
          { timeout: 5000, message: `el ${sonido} sigue sonando en la app de destino` },
        )
        .toBe(true);
      await page.goBack();
      await page.waitForURL(/visualizador-sonido-ondas/);
      await esperarHidratacion(page, [SEL_FREQ_25, SEL_INST_25]);
    }
    // Medido hoy: UN contexto en las tres vueltas. Si la reparación cerrase al salir y
    // crease otro al volver, lo que importa es que nunca haya más de uno vivo.
    const vivos = await page.evaluate(
      () => (window as unknown as VentanaSal).__salContextos.filter((c) => c.state !== 'closed').length,
    );
    expect(vivos).toBeLessThanOrEqual(1);
  });

  /**
   * HALLAZGO [bajo, operativa] (Inspector 25/09/2026) — SOSPECHA (a) confirmada, forma del
   * 1757/1637 de generador-ondas y generador-tonos. Al desmontarse, stopTone() hace osc.stop()
   * sin rampa (page.tsx 274-284, llamada desde el efecto de 296-298).
   * Medido (1.000 Hz, amplitud 70 %, 48 kHz, clic en «Óptica» a los 0,3 s de reloj de audio):
   *   llamadas tras el clic: stop() sin argumento — ninguna sobre la ganancia;
   *   lo emitido: de ≈ 0,097 a 0 en una muestra → caída en 3 ms del 89 % del nivel.
   * Esperado con el patrón reparado (apagarConRampa de diapason, 50 ms): 9 %. Umbral 45 %.
   */
  test('HALLAZGO — al salir a otra app con un tono sonando, la ganancia baja en rampa y no se corta en seco', async ({
    page,
  }) => {
    test.fail(); // HALLAZGO bajo (Inspector 25/09/2026)
    await abrirInstrumentada(page);
    await sembrarValor(page, SEL_FREQ_25, 1000); // un periodo de 1 ms: la envolvente se mide fina
    await escuchar(page, page.getByRole('button', { name: 'Escuchar tono a 1000 hercios' }), 0.3);
    const desde = (await llamadasSal(page)).length;
    await salirAOptica(page);

    // Se espera a que el sonido haya terminado: o el contexto está cerrado, o los últimos 10 ms
    // de su búfer ya son silencio (el final del tono sigue dentro de los 0,68 s capturados).
    await expect
      .poll(
        async () => {
          const c = await capturarSal(page);
          const cola = c.x.slice(c.x.length - Math.round(0.01 * c.sr));
          return c.estado === 'closed' || cola.every((v) => Math.abs(v) < 1e-4);
        },
        { intervals: [20], timeout: 5000, message: 'el tono no termina al salir de la página' },
      )
      .toBe(true);
    const { caida, nivel } = caidaMaxima3ms(await capturarSal(page));
    const log = (await llamadasSal(page)).slice(desde);
    expect(nivel, 'la captura contiene el tono que sonaba al salir').toBeGreaterThan(0.03);
    expect(caida, `caída de la envolvente en 3 ms · llamadas tras salir: ${JSON.stringify(log)}`).toBeLessThan(0.45);
  });

  /**
   * Mismo HALLAZGO, el camino más transitado: stopTone() es también la función con la que cada
   * nota corta a la anterior (playTone la llama antes de arrancar), así que encadenar notas en la
   * lista de «Notas musicales» chasquea igual. Medido: clic en Do4 y, a los 0,2 s, en La4 →
   * stop() sin argumento sobre el oscilador de Do4 y ninguna automatización de su ganancia.
   */
  test('HALLAZGO — encadenar dos notas: la que sonaba sale con rampa, no con stop() en seco', async ({ page }) => {
    test.fail(); // HALLAZGO bajo (Inspector 25/09/2026)
    await abrirInstrumentada(page);
    await escuchar(page, page.getByRole('button', { name: 'Escuchar Do4 (C4) a 261,63 hercios' }), 0.2);
    const antes = await llamadasSal(page);
    const oscDo = antes
      .find((l) => l.quien.endsWith('.frequency') && l.metodo === 'setValueAtTime' && l.args[0] === 261.63)
      ?.quien.replace('.frequency', '');
    expect(oscDo, 'el oscilador de Do4').toBeTruthy();
    const gananciasPrevias = new Set(antes.filter((l) => l.quien.endsWith('.gain')).map((l) => l.quien));
    const desde = antes.length;
    await page.getByRole('button', { name: 'Escuchar La4 (A4) a 440,00 hercios' }).click();
    await expect.poll(async () => (await llamadasSal(page)).slice(desde).some((l) => l.metodo === 'start')).toBe(true);

    const log = (await llamadasSal(page)).slice(desde);
    const rampa = log.find(
      (l) => gananciasPrevias.has(l.quien) && RAMPAS.includes(l.metodo) && Number(l.args[0]) <= 1e-3,
    );
    expect(rampa, `llamadas al pulsar La4: ${JSON.stringify(log)}`).toBeDefined();
    const stop = log.find((l) => l.quien === oscDo && l.metodo === 'stop');
    if (stop) {
      expect(stop.args.length, 'stop() sin argumento corta en el acto').toBe(1);
      expect(stop.args[0]).toBeGreaterThanOrEqual(Number(rampa?.args[1]) - 1e-6);
    }
  });

  /**
   * HALLAZGO [medio, contenido] (Inspector 25/09/2026). La tarjeta «Velocidad del sonido en
   * diferentes medios» lleva por subtítulo «Cuanto más denso el medio, más rápido viaja», y su
   * propia tabla lo desmiente dos veces: la madera (≈ 500 kg/m³, flota) transmite a 3.300 m/s y
   * el agua (998 kg/m³) a 1.480; el diamante (3.510 kg/m³) a 12.000 y el acero (7.850 kg/m³) a
   * 5.100. v = √(E/ρ): a igual rigidez, MÁS densidad es MÁS lento. Es la idea errónea más
   * extendida sobre este tema, en una app cuyo 68 % de visitas llega de aulas.
   */
  test('HALLAZGO — la velocidad del sonido no se atribuye a la densidad: la propia tabla lo desmiente', async ({
    page,
  }) => {
    test.fail(); // HALLAZGO medio (Inspector 25/09/2026)
    // Las dos premisas salen de la tabla que la app pinta, no de fuera.
    expect(velocidadEn('Madera')).toBeGreaterThan(velocidadEn('Agua'));
    expect(velocidadEn('Diamante')).toBeGreaterThan(velocidadEn('Acero'));
    await page.goto(URL_APP);
    const texto = (await page.locator('section#anatomia').innerText()).replace(/\s+/g, ' ');
    expect(texto).not.toMatch(/más denso[^.]*más rápido/i);
  });

  /**
   * HALLAZGO [bajo, dato] (Inspector 25/09/2026). La tabla «Tiempo de exposición segura» se
   * atribuye a NIOSH («cada +3 dB reduce el tiempo a la mitad») y en su última fila da
   * «120 dB · 0 seg» (minutos: 0, sin barra). Con la regla que ella misma enuncia:
   * 480 / 2^((120 − 85)/3) = 0,1476 min = 8,9 s (NIOSH 98-126, Tabla 1-1: 118 dBA 14 s, 121 dBA 7 s).
   * Si la fila se retira, el caso pasa.
   */
  test('HALLAZGO — a 120 dB la tabla NIOSH no da «0 seg», sino unos 9 s', async ({ page }) => {
    test.fail(); // HALLAZGO bajo (Inspector 25/09/2026)
    const fila = EXPOSICION.find((e) => e.db === 120);
    if (!fila) return;
    // 0,1476 min; precisión 1 (±0,05 min = ±3 s): el defecto es de 0,15 min, un orden más.
    expect(fila.minutos, 'minutos tabulados a 120 dB').toBeCloseTo(0.1476, 1);
    await page.goto(URL_APP);
    await expect(page.locator('[class*="exposicionRow"]', { hasText: '120 dB' })).not.toContainText('0 seg');
  });

  /**
   * HALLAZGO [bajo, contenido] (Inspector 25/09/2026) — el % pegado a la cifra (regla del
   * 25/09/2026: «15 %», con espacio duro). Dónde: lectura del deslizador de amplitud («70%»),
   * sus extremos («5%», «100%»), los seis porcentajes de «Armónicos por instrumento» («100%»,
   * «30%»…), el aviso «auriculares al 60% del volumen máximo» y el aria-label del SVG
   * («… con amplitud 70%»).
   */
  test('HALLAZGO — el % va separado de la cifra, en el texto y en los nombres accesibles', async ({ page }) => {
    test.fail(); // HALLAZGO bajo (Inspector 25/09/2026)
    await page.goto(URL_APP);
    for (const id of ['anatomia', 'frecuencia', 'decibelios', 'timbre']) {
      const texto = await page.locator(`section#${id}`).innerText();
      expect(texto.match(/[^\n]{0,20}\d%/g) ?? [], `sección #${id}`).toEqual([]);
    }
    const nombres = await page
      .locator('section [aria-label]')
      .evaluateAll((els) => els.map((e) => e.getAttribute('aria-label') ?? '').filter((a) => /\d%/.test(a)));
    expect(nombres).toEqual([]);
  });

  /**
   * HALLAZGO [bajo, contenido] (Inspector 25/09/2026) — cifras de cuatro dígitos con punto de
   * millar, y el mismo número en dos formatos (la forma del 1063): «La6 = 1.760 Hz» y
   * «(880, 1.320, 1.760 Hz...)» junto a «3° armónico (3f): 1320 Hz → 4° (4f): 1760 Hz» del
   * formateador; el caso 5 dice «1.700 Hz» y su solución «5100 / 1700»; el caso 8, «1.100 Hz» y
   * «1100 / 5». Además «4.000-6.000 Hz», «1.100 millones», «Un segundo son 1.000 milisegundos»,
   * «× 1.000» en las soluciones de los casos 2 y 12, y «hace 2.500 años» (bloque educativo).
   */
  test('HALLAZGO — las cifras de cuatro dígitos no se agrupan, y un número no sale en dos formatos', async ({
    page,
  }) => {
    test.fail(); // HALLAZGO bajo (Inspector 25/09/2026)
    await page.goto(URL_APP);
    await esperarHidratacion(page, ['#casos-respuesta']);
    const seccion = page.locator('#casos-aula');
    const textos: string[] = [];
    // Todo el contenedor de la app, incluido el bloque educativo plegado (está en el DOM).
    textos.push(await page.locator('h1').evaluate((h) => h.closest('header')?.parentElement?.textContent ?? ''));
    for (const n of [2, 5, 8, 12]) {
      await seccion.getByRole('button', { name: new RegExp(`^Caso ${n}:`) }).click();
      await expect(seccion.getByRole('heading', { level: 3 })).toContainText(`Caso ${n} `);
      await seccion.getByRole('button', { name: /Ver pista/ }).click();
      await seccion.getByRole('button', { name: /Ver solución/ }).click();
      textos.push(await seccion.innerText());
    }
    // «1.320, 1.760»: la coma que sigue a un número es de enumeración, no decimal, y cuenta.
    const agrupadas = textos.join('\n').match(/(?<![\d.,])\d\.\d{3}(?!\d|[.,]\d)[^\n]{0,8}/g) ?? [];
    expect(agrupadas).toEqual([]);
  });

  /**
   * HALLAZGO [bajo, contenido] (Inspector 25/09/2026). Los ordinales de «Armónicos por
   * instrumento» se escriben con el signo de GRADO (U+00B0): «2° arm.» … «6° arm.», «2° armónico
   * (2f)», «3° armónico (3f)», «4° (4f)». La abreviatura es «2.º» (punto y o volada, U+00BA);
   * con «°» un lector de pantalla en español lee «2 grados».
   */
  test('HALLAZGO — los ordinales se abrevian «2.º», no con el signo de grado', async ({ page }) => {
    test.fail(); // HALLAZGO bajo (Inspector 25/09/2026)
    await page.goto(URL_APP);
    const texto = await page.locator('section#timbre').innerText();
    expect(texto.match(/\d°[^\n]{0,10}/g) ?? []).toEqual([]);
  });

  /**
   * HALLAZGO [bajo, accesibilidad] (Inspector 25/09/2026). El deslizador «Seleccionar
   * instrumento» elige entre seis timbres con un índice 0-5 y no lleva aria-valuetext: el lector
   * de pantalla anuncia «Seleccionar instrumento, 2» en lugar de «Piano». El nombre visible está
   * en un <label> que no está asociado al control.
   */
  test('HALLAZGO — el deslizador de instrumento anuncia el instrumento, no su índice', async ({ page }) => {
    test.fail(); // HALLAZGO bajo (Inspector 25/09/2026)
    await page.goto(URL_APP);
    await esperarHidratacion(page, [SEL_INST_25]);
    await sembrarValor(page, SEL_INST_25, 2); // índice 2 = «Piano» en INSTRUMENTOS
    await expect(page.getByText('Piano', { exact: true }).first()).toBeVisible();
    await expect(page.locator(SEL_INST_25)).toHaveAttribute('aria-valuetext', /Piano/);
  });

  /**
   * HALLAZGO [bajo, accesibilidad] (Inspector 25/09/2026). Texto por debajo de 4,5:1 (todo por
   * debajo de 18,66 px en negrita). Medido en claro: λ del panel #48A9A6 sobre blanco 2,80:1 ·
   * lectura del deslizador y frecuencias de notas/medios/animales/armónicos en #2E86AB 3,77-4,11:1
   * · niveles en dB de las zonas segura y de precaución 2,87:1 · etiquetas «Seguro»/«Precaución»
   * 2,55-2,65:1 · unidad del dato destacado 2,68:1 · título del caso («Caso 1 · …») 2,68:1.
   * En oscuro, `.container` fija --primary: #2E86AB sin variante: T del panel 3,50:1, cifras de
   * medios, notas, animales y armónicos 3,08:1.
   */
  test('HALLAZGO — las cifras en color de marca y las etiquetas de zona pasan de 4,5:1 en claro y en oscuro', async ({
    page,
  }) => {
    test.fail(); // HALLAZGO bajo (Inspector 25/09/2026)
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto(URL_APP);
    await esperarHidratacion(page, [SEL_FREQ_25]);
    await page.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important}' });
    const medidas: Record<string, number> = {
      'λ del panel (claro)': await contrasteDe(page.getByText(/^λ = [\d,]+ m$/)),
      'frecuencia de las notas (claro)': await contrasteDe(page.locator('[class*="notaFreq"]')),
      'nivel en dB, zona segura (claro)': await contrasteDe(page.locator('[class*="dbValor"]')),
      'etiqueta «Seguro» (claro)': await contrasteDe(page.locator('[class*="dbTag"]')),
      'unidad del dato destacado (claro)': await contrasteDe(page.locator('[class*="datoUnidad"]')),
      'título del caso (claro)': await contrasteDe(page.locator('[class*="casoTitulo"]')),
    };
    await page.getByRole('button', { name: /Cambiar a modo oscuro/ }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    medidas['velocidad por medio (oscuro)'] = await contrasteDe(page.locator('[class*="velocidadValor"]'));
    medidas['T del panel (oscuro)'] = await contrasteDe(page.getByText(/^T = [\d,]+ (ms|μs)$/));
    for (const [donde, ratio] of Object.entries(medidas)) {
      expect(ratio, `${donde}: la medida tiene que existir`).toBeGreaterThan(1);
      expect(ratio, donde).toBeGreaterThanOrEqual(4.5);
    }
  });
});

test.describe('visualizador-sonido-ondas · Inspector 25/09/2026 · en móvil (Pixel 7)', () => {
  // Se enumeran las opciones en vez de esparcir `...devices['Pixel 7']` porque el device trae
  // `defaultBrowserType` y Playwright no lo admite dentro de un describe.
  const PIXEL_7 = devices['Pixel 7'];
  test.use({
    viewport: PIXEL_7.viewport,
    userAgent: PIXEL_7.userAgent,
    deviceScaleFactor: PIXEL_7.deviceScaleFactor,
    isMobile: PIXEL_7.isMobile,
    hasTouch: PIXEL_7.hasTouch,
  });

  test('CASO LÍMITE · amplitud 150 → 100 (pico 0,5) y 0 → 5 (pico 0,025); la tabla empieza en 85 dB · 8 horas', async ({
    page,
  }) => {
    await abrirInstrumentada(page);
    expect(page.viewportSize()).toEqual({ width: 412, height: 839 }); // devices['Pixel 7']
    const anchos = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      cliente: document.documentElement.clientWidth,
    }));
    expect(anchos.scroll).toBeLessThanOrEqual(anchos.cliente);

    const tocar = (b: Locator): Promise<void> => b.tap();
    const boton = page.getByRole('button', { name: 'Escuchar tono a 200 hercios' });

    // Techo: el control capa 150 a 100 → 100/100 · 0,5 = 0,5. El primer máximo del seno
    // (1,25 ms a 200 Hz) llega con la rampa apenas empezada: 0,4974. Nunca por encima de 0,5.
    expect(await sembrarValorAcotado(page, SEL_AMP_25, 150)).toBe('100');
    const inicio = await escuchar(page, boton, 0.2, tocar);
    const alto = await picoSal(page);
    expect(alto).toBeGreaterThan(0.45);
    expect(alto).toBeLessThanOrEqual(0.5005);
    // Se deja acabar el tono (1,5 s) y vaciarse el búfer del bus (0,68 s), en reloj de AUDIO.
    await expect
      .poll(() => relojSal(page), { intervals: [50], timeout: 10000 })
      .toBeGreaterThanOrEqual(inicio + 1.5 + 0.75);

    // Suelo: el control sube 0 a 5 → 5/100 · 0,5 = 0,025 (primer máximo: 0,02493).
    expect(await sembrarValorAcotado(page, SEL_AMP_25, 0)).toBe('5');
    await escuchar(page, boton, 0.2, tocar);
    const bajo = await picoSal(page);
    expect(bajo).toBeGreaterThan(0.02);
    expect(bajo).toBeLessThanOrEqual(0.0251);

    // NIOSH REL: 85 dBA durante 8 h es la primera fila, y +3 dB la parte por dos.
    const filas = page.locator('[class*="exposicionRow"]');
    await expect(filas.nth(0)).toContainText('85 dB');
    await expect(filas.nth(0)).toContainText('8 horas');
    await expect(filas.nth(1)).toContainText('88 dB');
    await expect(filas.nth(1)).toContainText('4 horas');
  });

  /**
   * HALLAZGO [medio, accesibilidad] (Inspector 25/09/2026). λ y T —las dos cifras que la app
   * calcula— solo existen como <text font-size="12"> DENTRO del SVG de viewBox 800 × 200, que se
   * escala al ancho del contenedor. En un Pixel 7 el SVG mide 362 px: 12 · 362/800 = 5,43 px de
   * letra (caja de 7 px de alto). No hay otra lectura de λ ni de T en la página. Umbral 11 px:
   * el texto más pequeño que la app usa fuera del SVG es de 10,88-11,2 px.
   */
  test('HALLAZGO — en el móvil λ y T se pintan a un tamaño legible, no a 5 px', async ({ page }) => {
    test.fail(); // HALLAZGO medio (Inspector 25/09/2026)
    await page.goto(URL_APP);
    await esperarHidratacion(page, [SEL_FREQ_25]);
    for (const patron of [/^λ = [\d,]+ m$/, /^T = [\d,]+ (ms|μs)$/]) {
      expect(await letraPintada(page.getByText(patron)), String(patron)).toBeGreaterThanOrEqual(11);
    }
  });
});
