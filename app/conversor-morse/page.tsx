'use client';
// @disclaimer: exempt
import { useState, useRef, useEffect } from 'react';
import styles from './ConversorMorse.module.css';
import { MeskeiaLogo, Footer, RelatedApps, LegalNotice, ShareCard, EducationalSection,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import {
  MARCA_DESCONOCIDO,
  MORSE_EXTENSIONES,
  MORSE_UIT,
  morseATexto,
  planificarTonos,
  segundosPorUnidad,
  textoAMorse,
} from './motor';

type ModoType = 'texto-morse' | 'morse-texto';

/** Velocidad del sonido: 12 palabras por minuto (PARIS) → un punto de 100 ms. */
const PPM = 12;
const UNIDAD_S = segundosPorUnidad(PPM);
const FRECUENCIA_HZ = 600;
const GANANCIA = 0.3;
/**
 * Subida y bajada de cada tono (hallazgo 1988). Un tono que entra en escalón se oye como un
 * chasquido («key click»); en CW se suaviza el flanco en unos milisegundos. La rampa va DENTRO
 * de la duración del elemento, así que la temporización UIT no cambia.
 */
const RAMPA_S = 0.005;
/** Con cuánta antelación se programa cada tono en el reloj de audio. */
const ANTELACION_S = 0.03;

interface TonoActivo {
  oscilador: OscillatorNode;
  ganancia: GainNode;
}

const esperar = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    window.setTimeout(resolve, Math.max(0, ms));
  });

/** Corta un tono con una rampa corta, anclada en el valor en curso, y lo para al final de ella. */
function cortarTono(ctx: AudioContext, tono: TonoActivo): void {
  const ahora = ctx.currentTime;
  const g = tono.ganancia.gain;
  g.cancelScheduledValues(ahora);
  g.setValueAtTime(g.value, ahora);
  g.linearRampToValueAtTime(0, ahora + RAMPA_S);
  try {
    tono.oscilador.stop(ahora + RAMPA_S);
  } catch {
    // El oscilador ya había terminado
  }
}

/** Letras de las extensiones, en el orden en que se enseñan. */
const EXTENSIONES = Object.entries(MORSE_EXTENSIONES);
const ALFABETO_UIT = Object.entries(MORSE_UIT);

export default function ConversorMorsePage() {
  const [modo, setModo] = useState<ModoType>('texto-morse');
  const [entrada, setEntrada] = useState('');
  const [salida, setSalida] = useState('');
  const [avisos, setAvisos] = useState<string[]>([]);
  const [reproduciendo, setReproduciendo] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  /**
   * Número de la reproducción en curso. «Reproducir», «Detener» y el desmontaje lo incrementan:
   * un bucle que despierta y ve otro número sabe que ya no le toca sonar (hallazgo 1981: con un
   * simple booleano, «Reproducir» lo volvía a poner a false y el bucle viejo seguía).
   */
  const sesionRef = useRef(0);
  const tonoActivoRef = useRef<TonoActivo | null>(null);

  const cambiarModo = (nuevo: ModoType) => {
    setModo(nuevo);
    setAvisos([]);
  };

  const convertir = () => {
    if (modo === 'texto-morse') {
      const r = textoAMorse(entrada);
      setSalida(r.morse);
      const lista: string[] = [];
      if (r.omitidos.length) {
        lista.push(`Sin código Morse, se han omitido: ${r.omitidos.map((c) => (c === ' ' ? '␣' : c)).join(' ')}`);
      }
      if (r.transcritos.length) {
        lista.push(`${r.transcritos.join(' ')}: la UIT no tiene código para las vocales con tilde (solo para la É); se transmiten sin tilde.`);
      }
      if (r.extensiones.length) {
        const n = r.extensiones.filter((c) => c === 'Ñ');
        const otras = r.extensiones.filter((c) => c !== 'Ñ');
        const partes: string[] = [];
        if (n.length) partes.push('Ñ (--.--) es la variante que se usa en español');
        if (otras.length) partes.push(`${otras.join(' ')} son extensiones de radioaficionado`);
        lista.push(`${partes.join('; ')}. No están en la Recomendación UIT-R M.1677-1: quien reciba con el código internacional puede no reconocerlas.`);
      }
      if (r.porcentaje) {
        lista.push('El % se transmite como 0/0, unido a la cifra por un guion (UIT-R M.1677-1 §3.3): 50 % → 50-0/0.');
      }
      setAvisos(lista);
    } else {
      const r = morseATexto(entrada);
      setSalida(r.texto);
      const lista: string[] = [];
      if (r.desconocidos.length) {
        lista.push(`Códigos no reconocidos (se muestran como ${MARCA_DESCONOCIDO}): ${r.desconocidos.join('  ')}`);
      }
      if (r.invalidos.length) {
        lista.push(`Fragmentos no válidos, solo se admiten puntos y rayas (se muestran como ${MARCA_DESCONOCIDO}): ${r.invalidos.join('  ')}`);
      }
      setAvisos(lista);
    }
  };

  const intercambiar = () => {
    cambiarModo(modo === 'texto-morse' ? 'morse-texto' : 'texto-morse');
    setEntrada(salida);
    setSalida(entrada);
  };

  const limpiar = () => {
    setEntrada('');
    setSalida('');
    setAvisos([]);
  };

  const copiarResultado = async () => {
    if (salida) {
      await navigator.clipboard.writeText(salida);
    }
  };

  /**
   * Lo que suena es el mensaje de la ENTRADA, leído según el modo (hallazgos 1979 y 1987): en
   * «Morse → Texto» la entrada ya es Morse y se reproduce tal cual —antes se volvía a codificar
   * como texto y cada «.» sonaba como el signo punto—, y en «Texto → Morse» suena sin tener que
   * pulsar antes «Convertir».
   */
  const palabrasParaSonar = (): string[][] =>
    modo === 'texto-morse' ? textoAMorse(entrada).palabras : morseATexto(entrada).palabras;

  const hayQueSonar = palabrasParaSonar().length > 0;

  /** Detiene lo que suene: invalida el bucle en curso y corta el tono con una rampa. */
  const silenciar = () => {
    sesionRef.current++;
    const ctx = audioContextRef.current;
    const tono = tonoActivoRef.current;
    tonoActivoRef.current = null;
    if (ctx && tono && ctx.state !== 'closed') cortarTono(ctx, tono);
  };

  /**
   * Reproducción con la temporización UIT (motor.ts, `planificarTonos`). Cada tono se programa en
   * el RELOJ DE AUDIO, un poco antes de su hora; el temporizador solo despierta al bucle. Así los
   * huecos son los del plan (hallazgo 1980) y no la suma de esperas encadenadas.
   */
  const reproducirMorse = async () => {
    const palabras = palabrasParaSonar();
    if (!palabras.length) return;
    silenciar();
    const sesion = sesionRef.current;

    let ctx = audioContextRef.current;
    if (!ctx || ctx.state === 'closed') {
      ctx = new AudioContext();
      audioContextRef.current = ctx;
    }
    if (ctx.state === 'suspended') await ctx.resume().catch(() => undefined);
    if (sesion !== sesionRef.current) return;
    setReproduciendo(true);

    const plan = planificarTonos(palabras);
    let origen = ctx.currentTime + 0.05;
    for (const t of plan.tonos) {
      let inicio = origen + t.inicio * UNIDAD_S;
      await esperar((inicio - ANTELACION_S - ctx.currentTime) * 1000);
      if (sesion !== sesionRef.current) return;
      // Si el temporizador llegó tarde, se desplaza el resto del mensaje: el tono conserva su
      // duración y el retraso se va a un hueco, nunca a un punto o una raya.
      const retraso = ctx.currentTime + 0.005 - inicio;
      if (retraso > 0) {
        origen += retraso;
        inicio += retraso;
      }
      const fin = inicio + t.duracion * UNIDAD_S;
      const oscilador = ctx.createOscillator();
      const ganancia = ctx.createGain();
      oscilador.type = 'sine';
      oscilador.frequency.value = FRECUENCIA_HZ;
      ganancia.gain.setValueAtTime(0, inicio);
      ganancia.gain.linearRampToValueAtTime(GANANCIA, inicio + RAMPA_S);
      ganancia.gain.setValueAtTime(GANANCIA, fin - RAMPA_S);
      ganancia.gain.linearRampToValueAtTime(0, fin);
      oscilador.connect(ganancia);
      ganancia.connect(ctx.destination);
      const tono: TonoActivo = { oscilador, ganancia };
      oscilador.onended = () => {
        oscilador.disconnect();
        ganancia.disconnect();
        if (tonoActivoRef.current === tono) tonoActivoRef.current = null;
      };
      tonoActivoRef.current = tono;
      oscilador.start(inicio);
      oscilador.stop(fin);
    }

    await esperar((origen + plan.total * UNIDAD_S - ctx.currentTime) * 1000);
    if (sesion === sesionRef.current) setReproduciendo(false);
  };

  const detenerReproduccion = () => {
    silenciar();
    setReproduciendo(false);
  };

  /**
   * Limpieza al desmontar (hallazgos 1978 y 1986, la forma del 1757 de generador-ondas). Sin
   * ella, una navegación de cliente con el mensaje sonando dejaba el bucle vivo: seguía creando
   * tonos en la app de destino, y cada visita dejaba su AudioContext abierto. Ahora se invalida
   * el bucle, se corta el tono con su rampa y se cierra el contexto al acabar la rampa. El ref se
   * suelta en el acto, para que un remontaje (StrictMode en desarrollo) cree uno nuevo.
   */
  useEffect(() => {
    return () => {
      sesionRef.current++;
      const ctx = audioContextRef.current;
      const tono = tonoActivoRef.current;
      audioContextRef.current = null;
      tonoActivoRef.current = null;
      if (!ctx || ctx.state === 'closed') return;
      if (tono) cortarTono(ctx, tono);
      window.setTimeout(() => {
        ctx.close().catch(() => {
          // El contexto ya estaba cerrado
        });
      }, RAMPA_S * 1000 + 50);
    };
  }, []);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Conversor de Código Morse</h1>
        <p className={styles.subtitle}>
          Traduce texto a código Morse y viceversa con reproducción de sonido
        </p>
      </header>

      <LegalNotice />

      <div className={styles.mainContent}>
        <div className={styles.modeSelector}>
          <button
            type="button"
            className={`${styles.modeBtn} ${modo === 'texto-morse' ? styles.active : ''}`}
            onClick={() => cambiarModo('texto-morse')}
            aria-pressed={modo === 'texto-morse'}
          >
            Texto → Morse
          </button>
          <button
            type="button"
            className={`${styles.modeBtn} ${modo === 'morse-texto' ? styles.active : ''}`}
            onClick={() => cambiarModo('morse-texto')}
            aria-pressed={modo === 'morse-texto'}
          >
            Morse → Texto
          </button>
        </div>

        <div className={styles.converterBox}>
          <div className={styles.inputSection}>
            <label className={styles.label} htmlFor="morse-entrada">
              {modo === 'texto-morse' ? 'Texto' : 'Código Morse'}
            </label>
            <textarea
              id="morse-entrada"
              value={entrada}
              onChange={(e) => setEntrada(e.target.value)}
              placeholder={modo === 'texto-morse'
                ? 'Escribe tu mensaje aquí...'
                : 'Introduce código Morse (usa . y -, espacio entre letras, / entre palabras)'}
              className={styles.textarea}
              rows={4}
            />
          </div>

          <div className={styles.buttonRow}>
            <button type="button" onClick={convertir} className={styles.btnPrimary}>
              Convertir
            </button>
            <button
              type="button"
              onClick={intercambiar}
              className={styles.btnSwap}
              title="Intercambiar"
              aria-label="Intercambiar entrada y salida"
            >
              ⇄
            </button>
            <button type="button" onClick={limpiar} className={styles.btnSecondary}>
              Limpiar
            </button>
          </div>

          <div className={styles.outputSection}>
            <p className={styles.label} id="morse-salida-titulo">
              {modo === 'texto-morse' ? 'Código Morse' : 'Texto'}
            </p>
            <div
              className={styles.outputBox}
              role="status"
              aria-live="polite"
              aria-atomic="true"
              aria-labelledby="morse-salida-titulo"
            >
              {salida || 'El resultado aparecerá aquí...'}
            </div>
            {avisos.length > 0 && (
              <div className={styles.avisos}>
                {avisos.map((a) => (
                  <p key={a}>{a}</p>
                ))}
              </div>
            )}
            <div className={styles.outputActions}>
              <button type="button" onClick={copiarResultado} className={styles.btnAction} disabled={!salida}>
                <span aria-hidden="true">📋</span> Copiar
              </button>
              {!reproduciendo ? (
                <button type="button" onClick={reproducirMorse} className={styles.btnAction} disabled={!hayQueSonar}>
                  <span aria-hidden="true">🔊</span> Reproducir sonido
                </button>
              ) : (
                <button type="button" onClick={detenerReproduccion} className={styles.btnStop}>
                  <span aria-hidden="true">⏹</span> Detener
                </button>
              )}
            </div>
            <p className={styles.nota}>
              Suena el mensaje de la entrada: tono de {FRECUENCIA_HZ} Hz a {PPM} palabras por minuto
              (un punto dura {Math.round(UNIDAD_S * 1000)} ms), con la temporización de la UIT: raya 3 puntos, 1 entre
              símbolos, 3 entre letras y 7 entre palabras.
            </p>
          </div>
        </div>
      </div>

      <section className={styles.alphabetSection}>
        <h2>Alfabeto Morse Internacional</h2>
        <p className={styles.alphabetIntro}>
          Letras, cifras y signos de la Recomendación UIT-R M.1677-1. La única letra con tilde que
          recoge es la É.
        </p>
        <div className={styles.alphabetGrid}>
          {ALFABETO_UIT.map(([char, code]) => (
            <div key={char} className={styles.alphabetItem}>
              <span className={styles.char}>{char}</span>
              <span className={styles.code}>{code}</span>
            </div>
          ))}
        </div>
        <h3 className={styles.alphabetSubtitulo}>Fuera de la norma UIT</h3>
        <p className={styles.alphabetIntro}>
          La Ñ con la variante que se usa en español y signos que añaden los radioaficionados. El
          conversor los usa y lo avisa, porque quien reciba con el código internacional puede no
          reconocerlos. Las vocales con tilde (salvo la É) se transmiten sin tilde.
        </p>
        <div className={styles.alphabetGrid}>
          {EXTENSIONES.map(([char, code]) => (
            <div key={char} className={styles.alphabetItem}>
              <span className={styles.char}>{char}</span>
              <span className={styles.code}>{code}</span>
            </div>
          ))}
        </div>
      </section>

      <EducationalSection title="Aprende sobre el Código Morse" subtitle="Historia, técnica y uso actual del lenguaje telegráfico universal" defaultOpen={false}>
        <section>
          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <h3><span aria-hidden="true">📡</span> Historia</h3>
              <p>Inventado por Samuel Morse en 1837, fue el primer sistema de comunicación eléctrica de larga distancia. Revolucionó las telecomunicaciones.</p>
            </div>
            <div className={styles.infoCard}>
              <h3><span aria-hidden="true">🆘</span> SOS</h3>
              <p>La señal de socorro internacional SOS (... --- ...) se eligió por ser fácil de recordar y transmitir, no como acrónimo.</p>
            </div>
            <div className={styles.infoCard}>
              <h3><span aria-hidden="true">⏱️</span> Tiempos</h3>
              <p>Un punto dura 1 unidad, una raya 3 unidades. Entre símbolos 1 unidad, entre letras 3 unidades, entre palabras 7 unidades.</p>
            </div>
          </div>

          {/* SECCIÓN 1: Tabla Comparativa */}
          <div className={styles.eduComparativaSection}>
            <h3><span aria-hidden="true">📊</span> Morse Internacional vs Otros Sistemas de Telegrafía</h3>
            <div className={styles.eduTablaWrapper}>
              <table className={styles.eduTablaComparativa}>
                <thead>
                  <tr>
                    <th>Sistema</th>
                    <th>Año</th>
                    <th>Medio</th>
                    <th>Velocidad típica</th>
                    <th>Vigencia actual</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Morse Internacional (ITU)</strong></td>
                    <td>1865</td>
                    <td>Radio, cable</td>
                    <td>15-30 WPM</td>
                    <td><span aria-hidden="true">✅</span> Activo (radioafición)</td>
                  </tr>
                  <tr>
                    <td>Morse Americano (original)</td>
                    <td>1837</td>
                    <td>Cable telegráfico</td>
                    <td>15-25 WPM</td>
                    <td><span aria-hidden="true">❌</span> Obsoleto</td>
                  </tr>
                  <tr>
                    <td>Morse Marítimo</td>
                    <td>1906</td>
                    <td>Radio 500 kHz</td>
                    <td>16-22 WPM</td>
                    <td><span aria-hidden="true">❌</span> Retirado en 1999</td>
                  </tr>
                  <tr>
                    <td>Código Baudot</td>
                    <td>1870</td>
                    <td>Teleimpresor</td>
                    <td>45-75 WPM</td>
                    <td><span aria-hidden="true">❌</span> Obsoleto</td>
                  </tr>
                  <tr>
                    <td>Señales de Luz (Aldis)</td>
                    <td>1867</td>
                    <td>Lámpara visual</td>
                    <td>8-12 WPM</td>
                    <td><span aria-hidden="true">✅</span> Activo (naval/militar)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* SECCIÓN 2: Casos de Uso */}
          <div className={styles.eduEscenariosSection}>
            <h3><span aria-hidden="true">🎯</span> Dónde se usa hoy el Código Morse</h3>
            <div className={styles.eduEscenariosGrid}>
              <div className={styles.eduEscenarioCard}>
                <div className={styles.eduEscenarioIcon} aria-hidden="true">📡</div>
                <h4>Radioafición (Ham Radio)</h4>
                <p>El Morse sigue siendo uno de los modos habituales de la radioafición (modo CW). Ya no se exige para obtener la autorización: en España el examen vigente (Orden IET/1311/2013) tiene dos partes, electricidad y radioelectricidad, y normativa, sin telegrafía. En los concursos se opera a menudo a más de 30 palabras por minuto.</p>
              </div>
              <div className={styles.eduEscenarioCard}>
                <div className={styles.eduEscenarioIcon} aria-hidden="true">✈️</div>
                <h4>Aviación</h4>
                <p>Los identificadores de balizas de navegación aérea (VOR, NDB, ILS) se transmiten en Morse. Los pilotos aprenden a identificar estaciones por su código Morse de 2-3 letras. Un VOR emite su ID en Morse cada 30 segundos.</p>
              </div>
              <div className={styles.eduEscenarioCard}>
                <div className={styles.eduEscenarioIcon} aria-hidden="true">♿</div>
                <h4>Comunicación Alternativa</h4>
                <p>El Morse es una herramienta de comunicación aumentativa para personas con ELA, parálisis cerebral u otras condiciones que limitan el movimiento. Con un solo interruptor o parpadeo, se puede codificar cualquier mensaje.</p>
              </div>
              <div className={styles.eduEscenarioCard}>
                <div className={styles.eduEscenarioIcon} aria-hidden="true">🏕️</div>
                <h4>Supervivencia y Emergencias</h4>
                <p>El SOS (... --- ...) es reconocido mundialmente sin importar el idioma. En situaciones de emergencia sin comunicación de voz (tormenta, avería de radio), el Morse puede salvarte la vida con una linterna o cualquier medio de señalización.</p>
              </div>
            </div>
          </div>

          {/* SECCIÓN 3: FAQ */}
          <div className={styles.eduFaqSection}>
            <h3><span aria-hidden="true">❓</span> Preguntas Frecuentes sobre el Código Morse</h3>
            <div className={styles.eduFaqList}>
              <div className={styles.eduFaqItem}>
                <h4>¿Por qué SOS no significa &quot;Save Our Souls&quot;?</h4>
                <p>SOS (... --- ...) fue adoptado en 1908 porque es el patrón más reconocible y fácil de transmitir: tres cortos, tres largos, tres cortos. No fue elegido como acrónimo de ninguna frase. Los significados populares (&quot;Save Our Souls&quot;, &quot;Save Our Ship&quot;) surgieron después como backronym. Antes del SOS, cada nación usaba su propia señal de socorro, lo que causaba confusión en emergencias internacionales.</p>
              </div>
              <div className={styles.eduFaqItem}>
                <h4>¿Cuántas palabras por minuto puede alcanzar un experto?</h4>
                <p>Los radiotelegrafistas militares de la II Guerra Mundial alcanzaban 25-35 WPM cómodamente. El récord mundial de recepción supera los 75 WPM. Un radioaficionado competente trabaja a 20-25 WPM. Para referencia, una conversación normal en inglés equivale a unas 130 WPM, pero el Morse es altamente eficiente en canales de radio degradados donde la voz sería ininteligible.</p>
              </div>
              <div className={styles.eduFaqItem}>
                <h4>¿El Morse sigue siendo obligatorio para licencias de radioaficionado?</h4>
                <p>Ya no. La Conferencia Mundial de Radiocomunicaciones de la UIT de 2003 dejó de exigirlo y cada país decide. En España la prueba de telegrafía se suprimió por la Resolución de 16 de marzo de 2005, y el examen vigente (Orden IET/1311/2013) no la incluye. Sin embargo, el modo CW (Continuous Wave, es decir, Morse en radio) sigue siendo muy popular por su eficiencia: una señal CW a 5 vatios alcanza distancias que la voz necesitaría 100 vatios para conseguir, gracias al ancho de banda estrecho (150 Hz vs 3 kHz de la voz).</p>
              </div>
              <div className={styles.eduFaqItem}>
                <h4>¿Qué diferencia hay entre el Morse Internacional y el Americano original?</h4>
                <p>El Morse Americano (de 1837) usaba una longitud variable para las rayas y silencios internos en algunos caracteres (la C, F, L, O, R, Y tenían un silencio interno). Era muy confuso. El Morse Internacional (ITU, 1865) estandarizó todo: punto = 1 unidad, raya = 3 unidades, sin silencios internos. La C pasó de &quot;· ·&quot; a &quot;-·-·&quot;. Esta estandarización fue crucial para la comunicación internacional.</p>
              </div>
              <div className={styles.eduFaqItem}>
                <h4>¿Por qué la E es solo un punto y la T es solo una raya?</h4>
                <p>El sistema fue diseñado por frecuencia de uso. Morse consultó estadísticas de las letras más frecuentes en inglés y asignó los códigos más cortos a las letras más comunes. E (la más frecuente en inglés) recibe &quot;·&quot; y T (segunda más frecuente) recibe &quot;-&quot;. La misma lógica explica que A=&quot;·-&quot;, I=&quot;··&quot;, N=&quot;-·&quot;. Es un código de longitud variable óptimo, precursor teórico de la compresión Huffman.</p>
              </div>
              <div className={styles.eduFaqItem}>
                <h4>¿Qué es el modo CW en radioafición?</h4>
                <p>CW (Continuous Wave) es el modo de operación en radio que usa Morse. A diferencia de la modulación AM o FM que modulan una portadora, CW simplemente enciende y apaga la señal de radio portadora según los puntos y rayas del Morse. Ocupa solo 150 Hz de espectro (frente a 3000 Hz de SSB o 8000 Hz de FM), lo que lo hace extremadamente eficiente y capaz de penetrar interferencias que destruirían cualquier señal de voz.</p>
              </div>
              <div className={styles.eduFaqItem}>
                <h4>¿Sigue siendo válido el Morse en la marina internacional?</h4>
                <p>La SOLAS (Safety Of Life At Sea) retiró el Morse marítimo en 1999, sustituyéndolo por el GMDSS (Sistema Mundial de Socorro y Seguridad Marítima) que usa DSC (Digital Selective Calling) y EPIRB (radiobalizas satelitales). Sin embargo, el SOS visual (luz o banderas) sigue siendo válido, y muchas marinas militares mantienen la capacitación en Morse óptico (señales de luz) para comunicaciones tácticas donde el radio silencio es necesario.</p>
              </div>
              <div className={styles.eduFaqItem}>
                <h4>¿Cómo se aprende Morse de forma efectiva?</h4>
                <p>El método más efectivo es el <strong>método Koch</strong>: empezar con solo 2 letras (K y M) enviadas a velocidad final (20 WPM), aprender a reconocerlas al 90% de precisión, y añadir una letra nueva. Nunca memorices puntos y rayas visualmente; el cerebro debe asociar el sonido directamente con la letra. Herramientas recomendadas: LCWO.net (Morse online gratuito), Just Learn Morse Code (software Windows). Con 15 minutos diarios constantes, en 3-6 meses se alcanzan 5-10 WPM.</p>
              </div>
            </div>
          </div>

          {/* SECCIÓN 4: Guía Paso a Paso */}
          <div className={styles.eduStepSection}>
            <h3><span aria-hidden="true">📚</span> Cómo Aprender Código Morse: Método Científico</h3>
            <div className={styles.eduStepList}>
              <div className={styles.eduStepItem}>
                <div className={styles.eduStepNumber}>1</div>
                <div className={styles.eduStepContent}>
                  <h4>Escucha, no memorices visualmente</h4>
                  <p>El error más común es memorizar la tabla de puntos y rayas. El cerebro humano no puede decodificar símbolos visuales a alta velocidad. En cambio, debes asociar el ritmo sonoro directamente con la letra: &quot;dit&quot; para el punto, &quot;dah&quot; para la raya. La E suena &quot;dit&quot;, la T suena &quot;dah&quot;, la A suena &quot;dit-dah&quot;. Este paso es el más importante de todos.</p>
                </div>
              </div>
              <div className={styles.eduStepItem}>
                <div className={styles.eduStepNumber}>2</div>
                <div className={styles.eduStepContent}>
                  <h4>Empieza con el Método Koch</h4>
                  <p>Comienza solo con 2 letras (K y M) enviadas a la velocidad objetivo final (20 WPM). Practica hasta identificarlas con 90% de precisión. Añade una tercera letra. Nunca bajes la velocidad de emisión; en su lugar, usa el método Farnsworth: aumenta el espacio entre letras y palabras, manteniendo la velocidad de los símbolos. Así el oído aprende el ritmo correcto desde el principio.</p>
                </div>
              </div>
              <div className={styles.eduStepItem}>
                <div className={styles.eduStepNumber}>3</div>
                <div className={styles.eduStepContent}>
                  <h4>Aprende las letras por frecuencia, no por orden alfabético</h4>
                  <p>Orden recomendado: E, T, A, I, N, M, S, O, R, H, D, L, U, C, W, F, K, Y, G, P, B, V, J, X, Q, Z. Las primeras 10 letras cubren más del 70% del texto en castellano. Dedica más tiempo a las frecuentes (E, T, A, I, N) que a las raras (X, Q, Z), que aparecen principalmente en prefijos de indicativos de radio.</p>
                </div>
              </div>
              <div className={styles.eduStepItem}>
                <div className={styles.eduStepNumber}>4</div>
                <div className={styles.eduStepContent}>
                  <h4>Practica recepción antes que envío</h4>
                  <p>El oído debe entrenarse antes que los dedos. Dedica el 80% del tiempo a escuchar y copiar (escribir lo que oyes) antes de aprender a enviar. Usa software de generación de Morse aleatorio: grupos de 5 letras, luego palabras, luego frases. La velocidad de recepción siempre será tu cuello de botella; el envío es más fácil y flexible.</p>
                </div>
              </div>
              <div className={styles.eduStepItem}>
                <div className={styles.eduStepNumber}>5</div>
                <div className={styles.eduStepContent}>
                  <h4>Aprende los prosignos y procedimientos de radio</h4>
                  <p>Los prosignos son abreviaturas estándar en CW: CQ (llamada general), DE (de/from), K (adelante), AR (fin de mensaje), SK (fin de contacto), QSO (contacto), 73 (saludos), 88 (amor y besos). En radioafición, los mensajes tienen estructura formal: &quot;CQ CQ CQ DE EA4ABC EA4ABC K&quot;. Aprender estos procedimientos es esencial para operar en bandas de radio reales.</p>
                </div>
              </div>
              <div className={styles.eduStepItem}>
                <div className={styles.eduStepNumber}>6</div>
                <div className={styles.eduStepContent}>
                  <h4>Mide y registra tu progreso en WPM</h4>
                  <p>Palabras por minuto (WPM) se mide usando la palabra estándar &quot;PARIS&quot; (50 elementos de duración). 1 WPM = 1 &quot;PARIS&quot; por minuto = 1 ciclo de 50 elementos por minuto. Con 15 minutos diarios constantes: semana 4 → 5 WPM, mes 3 → 10 WPM, mes 6 → 15 WPM, año 1 → 20+ WPM. La constancia diaria supera en efectividad a sesiones largas esporádicas.</p>
                </div>
              </div>
            </div>
          </div>

          {/* SECCIÓN 5: Tips */}
          <div className={styles.eduTipsSection}>
            <h3><span aria-hidden="true">✅</span> Mejores Prácticas para Transmitir y Recibir Morse</h3>
            <div className={styles.eduTipsGrid}>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcon} aria-hidden="true">🎵</span>
                <h4>Piensa en ritmo, no en símbolos</h4>
                <p>La K suena &quot;dah-dit-dah&quot; (ritmo de vals). La A es &quot;dit-dah&quot; (respuesta breve). Asocia cada letra con su música, no con sus puntos y rayas en papel.</p>
              </div>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcon} aria-hidden="true">⏰</span>
                <h4>El timing es todo</h4>
                <p>La calidad del Morse enviado depende de mantener las proporciones 1:3:7 (símbolo:letra:palabra) perfectas. Una llave electrónica (keyer) con paleta ayuda enormemente a mantener el ritmo perfecto.</p>
              </div>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcon} aria-hidden="true">📻</span>
                <h4>Practica escuchando QSOs reales</h4>
                <p>Sintoniza las bandas de radioafición (7.000-7.040 MHz para CW en Europa) y copia los intercambios reales. El Morse &quot;en vivo&quot; tiene variaciones de operador que los generadores artificiales no reproducen.</p>
              </div>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcon} aria-hidden="true">📝</span>
                <h4>Copia sin mirar lo escrito</h4>
                <p>Al practicar recepción, escribe lo que oyes sin releer lo anterior. El objetivo es procesar y copiar en tiempo real, no corregir errores. La &quot;copia a ciegas&quot; entrena la fluidez automática.</p>
              </div>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcon} aria-hidden="true">🔢</span>
                <h4>Aprende los números desde el principio</h4>
                <p>Los números en Morse son los 5 caracteres más largos (5 elementos cada uno). Son imprescindibles en radioafición para intercambiar informes RST (Readability-Strength-Tone) y localizadores QTH.</p>
              </div>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcon} aria-hidden="true">🎯</span>
                <h4>Un tono de 600-700 Hz es el habitual</h4>
                <p>El oído es más sensible hacia 3-4 kHz (curvas de igual sonoridad, ISO 226:2003), pero para CW se prefieren tonos graves, que cansan menos en escuchas largas: 600-700 Hz es una elección muy común, y muchos receptores permiten ajustarlo al gusto. Esta herramienta usa 600 Hz.</p>
              </div>
            </div>
          </div>

          {/* SECCIÓN 6: Warning Box */}
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <h3>Errores Comunes al Aprender y Usar Código Morse</h3>
            </div>
            <ul className={styles.warningList}>
              <li><strong><span aria-hidden="true">❌</span> Memorizar puntos y rayas visualmente:</strong> Si aprendes que la K es &quot;-.-&quot; mirando una tabla, tu cerebro decodificará símbolo por símbolo y nunca superarás los 5 WPM. El Morse se aprende como idioma oral: por sonido, por ritmo, por asociación directa con la letra.</li>
              <li><strong><span aria-hidden="true">❌</span> Empezar a velocidad demasiado lenta (bajo 15 WPM):</strong> Si entrenas a 5 WPM, tu cerebro aprende a decodificar a 5 WPM y luego no puede acelerar. El método Farnsworth recomienda enviar a velocidad final (20 WPM) con pausas largas entre letras, reduciendo gradualmente las pausas hasta alcanzar la velocidad objetivo real.</li>
              <li><strong><span aria-hidden="true">❌</span> Confundir Morse Internacional con Morse Americano:</strong> Los caracteres C, F, L, O, R, Y difieren entre ambos sistemas. Si aprendes caracteres del Morse americano creyendo que es el estándar ITU, tus mensajes serán incomprensibles en comunicaciones internacionales de radioafición.</li>
              <li><strong><span aria-hidden="true">❌</span> Practicar irregularmente en sesiones largas:</strong> 3 horas una vez a la semana es mucho menos efectivo que 15 minutos diarios. La memoria motora y auditiva del Morse se consolida durante el sueño. La constancia supera exponencialmente la intensidad en el aprendizaje de Morse.</li>
              <li><strong><span aria-hidden="true">❌</span> Ignorar los prosignos y procedimientos:</strong> En una comunicación real de radio no basta con saber el alfabeto. Los prosignos (AR, SK, CQ, DE, K, BK, HH) y los procedimientos de llamada son esenciales para que el otro operador entienda el contexto del mensaje.</li>
              <li><strong><span aria-hidden="true">❌</span> Usar aplicaciones de conversión en lugar de aprender a decodificar:</strong> Esta herramienta es útil para entender el código o para comunicaciones puntuales, pero no sustituye el entrenamiento auditivo. La velocidad de conversión manual (oído → letra) es la habilidad real; la conversión visual (mirar símbolos → letras) no entrena esa vía neurológica.</li>
            </ul>
          </div>

        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('conversor-morse')} />

      <ShareCard appName="conversor-morse" />
      <Footer appName="conversor-morse" />
    </div>
  );
}
