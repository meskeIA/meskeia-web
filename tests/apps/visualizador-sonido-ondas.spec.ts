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
