'use client';

import { useState, useRef, useCallback } from 'react';
import styles from './ConversorMorse.module.css';
import { MeskeiaLogo, Footer, RelatedApps, LegalNotice, ShareCard, EducationalSection } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// Diccionario Morse internacional
const MORSE_CODE: Record<string, string> = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
  'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
  'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
  'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
  'Y': '-.--', 'Z': '--..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
  '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', '!': '-.-.--',
  '/': '-..-.', '(': '-.--.', ')': '-.--.-', '&': '.-...', ':': '---...',
  ';': '-.-.-.', '=': '-...-', '+': '.-.-.', '-': '-....-', '_': '..--.-',
  '"': '.-..-.', '$': '...-..-', '@': '.--.-.', ' ': '/',
};

// Diccionario inverso
const MORSE_TO_TEXT: Record<string, string> = Object.fromEntries(
  Object.entries(MORSE_CODE).map(([k, v]) => [v, k])
);

type ModoType = 'texto-morse' | 'morse-texto';

export default function ConversorMorsePage() {
  const [modo, setModo] = useState<ModoType>('texto-morse');
  const [entrada, setEntrada] = useState('');
  const [salida, setSalida] = useState('');
  const [reproduciendo, setReproduciendo] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const stopRef = useRef(false);

  const textoAMorse = (texto: string): string => {
    return texto
      .toUpperCase()
      .split('')
      .map(char => MORSE_CODE[char] || char)
      .join(' ');
  };

  const morseATexto = (morse: string): string => {
    return morse
      .split(' ')
      .map(code => {
        if (code === '/') return ' ';
        if (code === '') return '';
        return MORSE_TO_TEXT[code] || code;
      })
      .join('');
  };

  const convertir = () => {
    if (modo === 'texto-morse') {
      setSalida(textoAMorse(entrada));
    } else {
      setSalida(morseATexto(entrada));
    }
  };

  const intercambiar = () => {
    setModo(modo === 'texto-morse' ? 'morse-texto' : 'texto-morse');
    setEntrada(salida);
    setSalida(entrada);
  };

  const limpiar = () => {
    setEntrada('');
    setSalida('');
  };

  const copiarResultado = async () => {
    if (salida) {
      await navigator.clipboard.writeText(salida);
    }
  };

  // Reproducir sonido Morse
  const reproducirMorse = useCallback(async () => {
    const morseCode = modo === 'texto-morse' ? salida : textoAMorse(entrada);
    if (!morseCode || reproduciendo) return;

    setReproduciendo(true);
    stopRef.current = false;

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    const ctx = audioContextRef.current;
    const DOT_DURATION = 0.1; // 100ms para punto
    const DASH_DURATION = DOT_DURATION * 3;
    const SYMBOL_GAP = DOT_DURATION;
    const LETTER_GAP = DOT_DURATION * 3;
    const WORD_GAP = DOT_DURATION * 7;

    const playTone = (duration: number): Promise<void> => {
      return new Promise((resolve) => {
        if (stopRef.current) {
          resolve();
          return;
        }
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        oscillator.frequency.value = 600;
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        oscillator.start();
        oscillator.stop(ctx.currentTime + duration);
        setTimeout(resolve, duration * 1000);
      });
    };

    const wait = (duration: number): Promise<void> => {
      return new Promise((resolve) => {
        if (stopRef.current) {
          resolve();
          return;
        }
        setTimeout(resolve, duration * 1000);
      });
    };

    for (const char of morseCode) {
      if (stopRef.current) break;
      if (char === '.') {
        await playTone(DOT_DURATION);
        await wait(SYMBOL_GAP);
      } else if (char === '-') {
        await playTone(DASH_DURATION);
        await wait(SYMBOL_GAP);
      } else if (char === ' ') {
        await wait(LETTER_GAP);
      } else if (char === '/') {
        await wait(WORD_GAP);
      }
    }

    setReproduciendo(false);
  }, [modo, salida, entrada, reproduciendo]);

  const detenerReproduccion = () => {
    stopRef.current = true;
    setReproduciendo(false);
  };

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
            className={`${styles.modeBtn} ${modo === 'texto-morse' ? styles.active : ''}`}
            onClick={() => setModo('texto-morse')}
          >
            Texto → Morse
          </button>
          <button
            className={`${styles.modeBtn} ${modo === 'morse-texto' ? styles.active : ''}`}
            onClick={() => setModo('morse-texto')}
          >
            Morse → Texto
          </button>
        </div>

        <div className={styles.converterBox}>
          <div className={styles.inputSection}>
            <label className={styles.label}>
              {modo === 'texto-morse' ? 'Texto' : 'Código Morse'}
            </label>
            <textarea
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
            <button onClick={convertir} className={styles.btnPrimary}>
              Convertir
            </button>
            <button onClick={intercambiar} className={styles.btnSwap} title="Intercambiar">
              ⇄
            </button>
            <button onClick={limpiar} className={styles.btnSecondary}>
              Limpiar
            </button>
          </div>

          <div className={styles.outputSection}>
            <label className={styles.label}>
              {modo === 'texto-morse' ? 'Código Morse' : 'Texto'}
            </label>
            <div className={styles.outputBox}>
              {salida || 'El resultado aparecerá aquí...'}
            </div>
            <div className={styles.outputActions}>
              <button onClick={copiarResultado} className={styles.btnAction} disabled={!salida}>
                📋 Copiar
              </button>
              {!reproduciendo ? (
                <button onClick={reproducirMorse} className={styles.btnAction} disabled={!salida && !entrada}>
                  🔊 Reproducir sonido
                </button>
              ) : (
                <button onClick={detenerReproduccion} className={styles.btnStop}>
                  ⏹ Detener
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <section className={styles.alphabetSection}>
        <h2>Alfabeto Morse Internacional</h2>
        <div className={styles.alphabetGrid}>
          {Object.entries(MORSE_CODE).slice(0, 36).map(([char, code]) => (
            <div key={char} className={styles.alphabetItem}>
              <span className={styles.char}>{char === ' ' ? '␣' : char}</span>
              <span className={styles.code}>{code}</span>
            </div>
          ))}
        </div>
      </section>

      <EducationalSection title="Aprende sobre el Código Morse" subtitle="Historia, técnica y uso actual del lenguaje telegráfico universal" defaultOpen={false}>
        <section>
          {/* CONTENIDO EXISTENTE: los 3 infoCard */}
          <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1.5rem', marginBottom:'2rem'}}>
            <div className={styles.infoCard}>
              <h3>📡 Historia</h3>
              <p>Inventado por Samuel Morse en 1837, fue el primer sistema de comunicación eléctrica de larga distancia. Revolucionó las telecomunicaciones.</p>
            </div>
            <div className={styles.infoCard}>
              <h3>🆘 SOS</h3>
              <p>La señal de socorro internacional SOS (... --- ...) se eligió por ser fácil de recordar y transmitir, no como acrónimo.</p>
            </div>
            <div className={styles.infoCard}>
              <h3>⏱️ Tiempos</h3>
              <p>Un punto dura 1 unidad, una raya 3 unidades. Entre símbolos 1 unidad, entre letras 3 unidades, entre palabras 7 unidades.</p>
            </div>
          </div>

          {/* SECCIÓN 1: Tabla Comparativa */}
          <div className={styles.eduComparativaSection}>
            <h3>📊 Morse Internacional vs Otros Sistemas de Telegrafía</h3>
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
                    <td>✅ Activo (radioafición)</td>
                  </tr>
                  <tr>
                    <td>Morse Americano (original)</td>
                    <td>1837</td>
                    <td>Cable telegráfico</td>
                    <td>15-25 WPM</td>
                    <td>❌ Obsoleto</td>
                  </tr>
                  <tr>
                    <td>Morse Marítimo</td>
                    <td>1906</td>
                    <td>Radio 500 kHz</td>
                    <td>16-22 WPM</td>
                    <td>❌ Retirado en 1999</td>
                  </tr>
                  <tr>
                    <td>Código Baudot</td>
                    <td>1870</td>
                    <td>Teleimpresor</td>
                    <td>45-75 WPM</td>
                    <td>❌ Obsoleto</td>
                  </tr>
                  <tr>
                    <td>Señales de Luz (Aldis)</td>
                    <td>1867</td>
                    <td>Lámpara visual</td>
                    <td>8-12 WPM</td>
                    <td>✅ Activo (naval/militar)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* SECCIÓN 2: Casos de Uso */}
          <div className={styles.eduEscenariosSection}>
            <h3>🎯 Dónde se usa hoy el Código Morse</h3>
            <div className={styles.eduEscenariosGrid}>
              <div className={styles.eduEscenarioCard}>
                <div className={styles.eduEscenarioIcon}>📡</div>
                <h4>Radioafición (Ham Radio)</h4>
                <p>Más de 3 millones de radioaficionados en todo el mundo usan Morse (modo CW). En España, la licencia de radioaficionado clase A requiere su dominio. Los concursos internacionales premian velocidades de 30+ WPM.</p>
              </div>
              <div className={styles.eduEscenarioCard}>
                <div className={styles.eduEscenarioIcon}>✈️</div>
                <h4>Aviación</h4>
                <p>Los identificadores de balizas de navegación aérea (VOR, NDB, ILS) se transmiten en Morse. Los pilotos aprenden a identificar estaciones por su código Morse de 2-3 letras. Un VOR emite su ID en Morse cada 30 segundos.</p>
              </div>
              <div className={styles.eduEscenarioCard}>
                <div className={styles.eduEscenarioIcon}>♿</div>
                <h4>Comunicación Alternativa</h4>
                <p>El Morse es una herramienta de comunicación aumentativa para personas con ELA, parálisis cerebral u otras condiciones que limitan el movimiento. Con un solo interruptor o parpadeo, se puede codificar cualquier mensaje.</p>
              </div>
              <div className={styles.eduEscenarioCard}>
                <div className={styles.eduEscenarioIcon}>🏕️</div>
                <h4>Supervivencia y Emergencias</h4>
                <p>El SOS (... --- ...) es reconocido mundialmente sin importar el idioma. En situaciones de emergencia sin comunicación de voz (tormenta, aveería de radio), el Morse puede salvarte la vida con una linterna o cualquier medio de señalización.</p>
              </div>
            </div>
          </div>

          {/* SECCIÓN 3: FAQ */}
          <div className={styles.eduFaqSection}>
            <h3>❓ Preguntas Frecuentes sobre el Código Morse</h3>
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
                <p>Ya no. La ITU eliminó el requisito de Morse en 2003. España lo retiró de las pruebas de licencia en 2004. Sin embargo, el modo CW (Continuous Wave, es decir, Morse en radio) sigue siendo muy popular por su eficiencia: una señal CW a 5 vatios alcanza distancias que la voz necesitaría 100 vatios para conseguir, gracias al ancho de banda estrecho (150 Hz vs 3 kHz de la voz).</p>
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
            <h3>📚 Cómo Aprender Código Morse: Método Científico</h3>
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
            <h3>✅ Mejores Prácticas para Transmitir y Recibir Morse</h3>
            <div className={styles.eduTipsGrid}>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcon}>🎵</span>
                <h4>Piensa en ritmo, no en símbolos</h4>
                <p>La K suena &quot;dah-dit-dah&quot; (ritmo de vals). La A es &quot;dit-dah&quot; (respuesta breve). Asocia cada letra con su música, no con sus puntos y rayas en papel.</p>
              </div>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcon}>⏰</span>
                <h4>El timing es todo</h4>
                <p>La calidad del Morse enviado depende de mantener las proporciones 1:3:7 (símbolo:letra:palabra) perfectas. Una llave electrónica (keyer) con paleta ayuda enormemente a mantener el ritmo perfecto.</p>
              </div>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcon}>📻</span>
                <h4>Practica escuchando QSOs reales</h4>
                <p>Sintoniza las bandas de radioafición (7.000-7.040 MHz para CW en Europa) y copia los intercambios reales. El Morse &quot;en vivo&quot; tiene variaciones de operador que los generadores artificiales no reproducen.</p>
              </div>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcon}>📝</span>
                <h4>Copia sin mirar lo escrito</h4>
                <p>Al practicar recepción, escribe lo que oyes sin releer lo anterior. El objetivo es procesar y copiar en tiempo real, no corregir errores. La &quot;copia a ciegas&quot; entrena la fluidez automática.</p>
              </div>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcon}>🔢</span>
                <h4>Aprende los números desde el principio</h4>
                <p>Los números en Morse son los 5 caracteres más largos (5 elementos cada uno). Son imprescindibles en radioafición para intercambiar informes RST (Readability-Strength-Tone) y localizadores QTH.</p>
              </div>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcon}>🎯</span>
                <h4>Frecuencia de 600-700 Hz es la óptima</h4>
                <p>El oído humano tiene máxima sensibilidad entre 500-1000 Hz. La frecuencia estándar de tono CW en radio es 600-700 Hz. Esta herramienta usa 600 Hz, que es la óptima para entrenar la discriminación auditiva en condiciones reales de radio.</p>
              </div>
            </div>
          </div>

          {/* SECCIÓN 6: Warning Box */}
          <div className={styles.eduWarningBox}>
            <div className={styles.eduWarningHeader}>
              <span className={styles.eduWarningIcon}>⚠️</span>
              <h3>Errores Comunes al Aprender y Usar Código Morse</h3>
            </div>
            <ul className={styles.eduWarningList}>
              <li><strong>❌ Memorizar puntos y rayas visualmente:</strong> Si aprendes que la K es &quot;-.-&quot; mirando una tabla, tu cerebro decodificará símbolo por símbolo y nunca superarás los 5 WPM. El Morse se aprende como idioma oral: por sonido, por ritmo, por asociación directa con la letra.</li>
              <li><strong>❌ Empezar a velocidad demasiado lenta (bajo 15 WPM):</strong> Si entrenas a 5 WPM, tu cerebro aprende a decodificar a 5 WPM y luego no puede acelerar. El método Farnsworth recomienda enviar a velocidad final (20 WPM) con pausas largas entre letras, reduciendo gradualmente las pausas hasta alcanzar la velocidad objetivo real.</li>
              <li><strong>❌ Confundir Morse Internacional con Morse Americano:</strong> Los caracteres C, F, L, O, R, Y difieren entre ambos sistemas. Si aprendes caracteres del Morse americano creyendo que es el estándar ITU, tus mensajes serán incomprensibles en comunicaciones internacionales de radioafición.</li>
              <li><strong>❌ Practicar irregularmente en sesiones largas:</strong> 3 horas una vez a la semana es mucho menos efectivo que 15 minutos diarios. La memoria motora y auditiva del Morse se consolida durante el sueño. La constancia supera exponencialmente la intensidad en el aprendizaje de Morse.</li>
              <li><strong>❌ Ignorar los prosignos y procedimientos:</strong> En una comunicación real de radio no basta con saber el alfabeto. Los prosignos (AR, SK, CQ, DE, K, BK, HH) y los procedimientos de llamada son esenciales para que el otro operador entienda el contexto del mensaje.</li>
              <li><strong>❌ Usar aplicaciones de conversión en lugar de aprender a decodificar:</strong> Esta herramienta es útil para entender el código o para comunicaciones puntuales, pero no sustituye el entrenamiento auditivo. La velocidad de conversión manual (oído → letra) es la habilidad real; la conversión visual (mirar símbolos → letras) no entrena esa vía neurológica.</li>
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
