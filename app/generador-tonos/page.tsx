'use client';
// @disclaimer: exempt

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './GeneradorTonos.module.css';
import { MeskeiaLogo, Footer, RelatedApps, LegalNotice, ShareCard, EducationalSection } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatNumber } from '@/lib';

interface FrecuenciaPreset {
  nombre: string;
  frecuencia: number;
  categoria: string;
}

/** Rango audible que la app promete en su <h1>, su title y jsonLd.features */
const FREC_MIN = 20;
const FREC_MAX = 20000;
const acotarFrecuencia = (n: number) => Math.max(FREC_MIN, Math.min(FREC_MAX, n));

const PRESETS: FrecuenciaPreset[] = [
  // Notas musicales
  { nombre: 'Do (C4)', frecuencia: 261.63, categoria: 'Notas' },
  { nombre: 'Re (D4)', frecuencia: 293.66, categoria: 'Notas' },
  { nombre: 'Mi (E4)', frecuencia: 329.63, categoria: 'Notas' },
  { nombre: 'Fa (F4)', frecuencia: 349.23, categoria: 'Notas' },
  { nombre: 'Sol (G4)', frecuencia: 392.00, categoria: 'Notas' },
  { nombre: 'La (A4)', frecuencia: 440.00, categoria: 'Notas' },
  { nombre: 'Si (B4)', frecuencia: 493.88, categoria: 'Notas' },
  // Tests de audio
  { nombre: 'Subgraves', frecuencia: 30, categoria: 'Tests' },
  { nombre: 'Graves', frecuencia: 100, categoria: 'Tests' },
  { nombre: 'Medios-bajos', frecuencia: 500, categoria: 'Tests' },
  { nombre: 'Medios', frecuencia: 1000, categoria: 'Tests' },
  { nombre: 'Medios-altos', frecuencia: 2000, categoria: 'Tests' },
  { nombre: 'Agudos', frecuencia: 5000, categoria: 'Tests' },
  { nombre: 'Muy agudos', frecuencia: 10000, categoria: 'Tests' },
  { nombre: 'Ultrasonido', frecuencia: 15000, categoria: 'Tests' },
];

export default function GeneradorTonosPage() {
  const [frecuencia, setFrecuencia] = useState(440);
  /**
   * Lo que se ve escrito en el campo, separado del número que se emite.
   *
   * El input estaba controlado directamente por `frecuencia` y su onChange saturaba el
   * valor en CADA pulsación: al teclear «1000», el primer «1» caía bajo el mínimo, se
   * convertía en 20, y los dígitos siguientes se pegaban detrás hasta acabar en 20.000 Hz
   * —justo la frecuencia que la propia app pide evitar a volumen alto—. Escribir era
   * imposible y no había ningún aviso. Ahora el texto se acota al salir del campo, no
   * mientras se escribe.
   */
  const [frecuenciaTexto, setFrecuenciaTexto] = useState('440');
  const [reproduciendo, setReproduciendo] = useState(false);
  const [volumen, setVolumen] = useState(0.3);
  const [tipoOnda, setTipoOnda] = useState<OscillatorType>('sine');
  const [sweep, setSweep] = useState(false);
  const [sweepMin, setSweepMin] = useState(20);
  const [sweepMax, setSweepMax] = useState(2000);
  const [sweepMinTexto, setSweepMinTexto] = useState('20');

  /**
   * Cambiar la frecuencia desde fuera del campo (slider, atajos, presets, barrido) pasa
   * SIEMPRE por aquí, para que el número y lo escrito no se separen. Antes cada sitio
   * llamaba a setFrecuencia por su cuenta y el campo mostraba lo que le tocara.
   */
  const aplicarFrecuencia = useCallback((n: number) => {
    // NO se redondea: los presets musicales son fracciones (Do = 261,63 Hz) y redondear
    // aquí las destruía —lo cazó el CASO 1 del propio spec al reparar el hallazgo 127—.
    // Quien necesite un entero, como el barrido, lo redondea antes de llamar.
    const v = acotarFrecuencia(n);
    setFrecuencia(v);
    setFrecuenciaTexto(String(v));
  }, []);
  const [sweepMaxTexto, setSweepMaxTexto] = useState('2000');
  const [sweepDuracion, setSweepDuracion] = useState(5);

  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const sweepIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (oscillatorRef.current) {
        try {
          oscillatorRef.current.stop();
        } catch {
          // El oscilador ya estaba detenido
        }
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {
          // El contexto ya estaba cerrado
        });
      }
      if (sweepIntervalRef.current) {
        clearInterval(sweepIntervalRef.current);
      }
    };
  }, []);

  const iniciarAudio = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }

      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = tipoOnda;
      oscillator.frequency.setValueAtTime(frecuencia, ctx.currentTime);

      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(volumen, ctx.currentTime + 0.05);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start();

      oscillatorRef.current = oscillator;
      gainNodeRef.current = gainNode;
      setReproduciendo(true);
    } catch (error) {
      console.error('No se pudo iniciar el generador de tonos:', error);
    }
  }, [frecuencia, volumen, tipoOnda]);

  const detenerAudio = useCallback(() => {
    if (sweepIntervalRef.current) {
      clearInterval(sweepIntervalRef.current);
      sweepIntervalRef.current = null;
    }
    setSweep(false);

    const oscillator = oscillatorRef.current;
    const ctx = audioContextRef.current;

    if (gainNodeRef.current && ctx) {
      gainNodeRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.05);
    }

    setTimeout(() => {
      if (oscillator) {
        try {
          oscillator.stop();
        } catch {
          // El oscilador ya estaba detenido
        }
      }
      // Solo limpiar el estado si nadie ha iniciado un nuevo oscilador mientras tanto
      if (oscillatorRef.current === oscillator) {
        oscillatorRef.current = null;
        setReproduciendo(false);
      }
    }, 50);
  }, []);

  const toggleAudio = () => {
    if (reproduciendo) {
      detenerAudio();
    } else {
      iniciarAudio();
    }
  };

  // Actualizar frecuencia en tiempo real
  useEffect(() => {
    if (oscillatorRef.current && audioContextRef.current) {
      oscillatorRef.current.frequency.setValueAtTime(frecuencia, audioContextRef.current.currentTime);
    }
  }, [frecuencia]);

  // Actualizar volumen en tiempo real
  useEffect(() => {
    if (gainNodeRef.current && audioContextRef.current && reproduciendo) {
      gainNodeRef.current.gain.setValueAtTime(volumen, audioContextRef.current.currentTime);
    }
  }, [volumen, reproduciendo]);

  // Actualizar tipo de onda
  useEffect(() => {
    if (oscillatorRef.current) {
      oscillatorRef.current.type = tipoOnda;
    }
  }, [tipoOnda]);

  // Función de barrido (sweep)
  const iniciarSweep = () => {
    if (!reproduciendo) {
      iniciarAudio();
    }

    // Los límites se ordenan aquí: con «Desde» mayor que «Hasta» el incremento salía
    // negativo y el barrido se quedaba clavado en el mínimo sin avisar de nada.
    const desde = acotarFrecuencia(Math.min(sweepMin, sweepMax));
    const hasta = acotarFrecuencia(Math.max(sweepMin, sweepMax));

    setSweep(true);
    let frecActual = desde;
    const incremento = (hasta - desde) / (sweepDuracion * 20);

    sweepIntervalRef.current = setInterval(() => {
      frecActual += incremento;
      if (frecActual >= hasta) {
        frecActual = desde;
      }
      aplicarFrecuencia(Math.round(frecActual));
    }, 50);
  };

  const detenerSweep = () => {
    if (sweepIntervalRef.current) {
      clearInterval(sweepIntervalRef.current);
      sweepIntervalRef.current = null;
    }
    setSweep(false);
  };

  const getDescripcionFrecuencia = (freq: number): string => {
    if (freq < 60) return 'Subgraves - Sentir más que oír';
    if (freq < 250) return 'Graves - Bajos profundos';
    if (freq < 500) return 'Medios-bajos - Calidez';
    if (freq < 2000) return 'Medios - Voz humana';
    if (freq < 4000) return 'Medios-altos - Presencia';
    if (freq < 8000) return 'Agudos - Brillo';
    if (freq < 16000) return 'Muy agudos - Aire';
    return 'Ultrasonido - Límite audible';
  };

  const categoriasPresets = ['Notas', 'Tests'];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Generador de Tonos</h1>
        <p className={styles.subtitle}>
          Frecuencias de audio de 20Hz a 20kHz
        </p>
      </header>

      <LegalNotice />

      {/* Panel principal */}
      <div className={styles.mainPanel}>
        <div className={styles.frecuenciaDisplay}>
          <input
            type="number"
            min="20"
            max="20000"
            value={frecuenciaTexto}
            onChange={(e) => {
              setFrecuenciaTexto(e.target.value);
              // Solo se emite cuando lo escrito ya es una frecuencia válida; mientras tanto
              // el oscilador se queda en la última buena y el usuario termina de teclear.
              const n = parseInt(e.target.value, 10);
              if (Number.isFinite(n) && n >= FREC_MIN && n <= FREC_MAX) setFrecuencia(n);
            }}
            onBlur={() => {
              const n = acotarFrecuencia(parseInt(frecuenciaTexto, 10) || FREC_MIN);
              setFrecuencia(n);
              setFrecuenciaTexto(String(n));
            }}
            className={styles.frecuenciaInput}
            aria-label="Frecuencia en Hz"
          />
          <span className={styles.frecuenciaUnidad}>Hz</span>
        </div>

        <p className={styles.descripcionFrecuencia}>
          {getDescripcionFrecuencia(frecuencia)}
        </p>

        {/* Slider principal */}
        <div className={styles.sliderContainer}>
          <span className={styles.sliderLabel}>20 Hz</span>
          <input
            type="range"
            min="20"
            max="20000"
            value={frecuencia}
            onChange={(e) => aplicarFrecuencia(parseInt(e.target.value, 10))}
            className={styles.frecuenciaSlider}
            aria-label="Seleccionar frecuencia"
          />
          <span className={styles.sliderLabel}>20 kHz</span>
        </div>

        {/* Slider logarítmico visual */}
        <div className={styles.escalaVisual}>
          <button type="button" onClick={() => aplicarFrecuencia(20)} aria-label="Ir a 20 Hz">20</button>
          <button type="button" onClick={() => aplicarFrecuencia(100)} aria-label="Ir a 100 Hz">100</button>
          <button type="button" onClick={() => aplicarFrecuencia(500)} aria-label="Ir a 500 Hz">500</button>
          <button type="button" onClick={() => aplicarFrecuencia(1000)} aria-label="Ir a 1.000 Hz">1k</button>
          <button type="button" onClick={() => aplicarFrecuencia(5000)} aria-label="Ir a 5.000 Hz">5k</button>
          <button type="button" onClick={() => aplicarFrecuencia(10000)} aria-label="Ir a 10.000 Hz">10k</button>
          <button type="button" onClick={() => aplicarFrecuencia(20000)} aria-label="Ir a 20.000 Hz">20k</button>
        </div>

        {/* Botones de control */}
        <div className={styles.controles}>
          <button
            type="button"
            className={`${styles.btnPlay} ${reproduciendo ? styles.activo : ''}`}
            onClick={toggleAudio}
            aria-pressed={reproduciendo}
          >
            {reproduciendo ? '⏹️ Detener' : '▶️ Reproducir'}
          </button>
        </div>

        {/* Volumen */}
        <div className={styles.volumenControl}>
          <span className={styles.volumenIcon}>🔉</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volumen}
            onChange={(e) => setVolumen(parseFloat(e.target.value))}
            className={styles.volumenSlider}
            aria-label="Volumen"
          />
          <span className={styles.volumenIcon}>🔊</span>
          <span className={styles.volumenValor}>{Math.round(volumen * 100)}%</span>
        </div>
      </div>

      {/* Tipo de onda */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Tipo de onda</h3>
        <div className={styles.ondaGrid}>
          {(['sine', 'triangle', 'square', 'sawtooth'] as OscillatorType[]).map((tipo) => (
            <button
              key={tipo}
              type="button"
              className={`${styles.ondaBtn} ${tipoOnda === tipo ? styles.ondaActiva : ''}`}
              onClick={() => setTipoOnda(tipo)}
              aria-pressed={tipoOnda === tipo}
            >
              <span className={styles.ondaIcono} aria-hidden="true">
                {tipo === 'sine' && '〰️'}
                {tipo === 'triangle' && '📐'}
                {tipo === 'square' && '⬜'}
                {tipo === 'sawtooth' && '📈'}
              </span>
              <span className={styles.ondaNombre}>
                {tipo === 'sine' && 'Senoidal'}
                {tipo === 'triangle' && 'Triangular'}
                {tipo === 'square' && 'Cuadrada'}
                {tipo === 'sawtooth' && 'Sierra'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Barrido de frecuencias */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Barrido de frecuencias (Sweep)</h3>
        <div className={styles.sweepControles}>
          <div className={styles.sweepInputs}>
            <div className={styles.sweepInput}>
              <label htmlFor="sweep-min">Desde</label>
              <input
                id="sweep-min"
                type="number"
                value={sweepMinTexto}
                onChange={(e) => {
                  setSweepMinTexto(e.target.value);
                  const n = parseInt(e.target.value, 10);
                  if (Number.isFinite(n) && n >= FREC_MIN && n <= FREC_MAX) setSweepMin(n);
                }}
                onBlur={() => {
                  const n = acotarFrecuencia(parseInt(sweepMinTexto, 10) || FREC_MIN);
                  setSweepMin(n);
                  setSweepMinTexto(String(n));
                }}
                min={FREC_MIN}
                max={FREC_MAX}
              />
              <span>Hz</span>
            </div>
            <div className={styles.sweepInput}>
              <label htmlFor="sweep-max">Hasta</label>
              <input
                id="sweep-max"
                type="number"
                value={sweepMaxTexto}
                onChange={(e) => {
                  setSweepMaxTexto(e.target.value);
                  const n = parseInt(e.target.value, 10);
                  if (Number.isFinite(n) && n >= FREC_MIN && n <= FREC_MAX) setSweepMax(n);
                }}
                onBlur={() => {
                  const n = acotarFrecuencia(parseInt(sweepMaxTexto, 10) || FREC_MAX);
                  setSweepMax(n);
                  setSweepMaxTexto(String(n));
                }}
                min={FREC_MIN}
                max={FREC_MAX}
              />
              <span>Hz</span>
            </div>
            <div className={styles.sweepInput}>
              <label htmlFor="sweep-dur">Duración</label>
              <input
                id="sweep-dur"
                type="number"
                value={sweepDuracion}
                onChange={(e) => setSweepDuracion(parseInt(e.target.value) || 5)}
                min="1"
                max="60"
              />
              <span>seg</span>
            </div>
          </div>
          <button
            type="button"
            className={`${styles.btnSweep} ${sweep ? styles.sweepActivo : ''}`}
            onClick={sweep ? detenerSweep : iniciarSweep}
            aria-pressed={sweep}
          >
            {sweep ? '⏹️ Detener barrido' : '🔄 Iniciar barrido'}
          </button>
        </div>
      </div>

      {/* Presets */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Frecuencias predefinidas</h3>
        {categoriasPresets.map((categoria) => (
          <div key={categoria} className={styles.categoriaPresets}>
            <h4 className={styles.categoriaTitulo}>{categoria}</h4>
            <div className={styles.presetsGrid}>
              {PRESETS.filter(p => p.categoria === categoria).map((preset) => (
                <button
                  key={preset.nombre}
                  type="button"
                  className={`${styles.presetBtn} ${Math.round(frecuencia) === Math.round(preset.frecuencia) ? styles.presetActivo : ''}`}
                  onClick={() => aplicarFrecuencia(preset.frecuencia)}
                  aria-pressed={Math.round(frecuencia) === Math.round(preset.frecuencia)}
                >
                  <span className={styles.presetNombre}>{preset.nombre}</span>
                  {/* [131] formato español: se imprimía el número crudo, con punto decimal,
                      mientras el bloque educativo de la misma página escribe «261,63 Hz» */}
                  <span className={styles.presetFrec}>{formatNumber(preset.frecuencia, preset.frecuencia % 1 === 0 ? 0 : 2)} Hz</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Información */}
      <div className={styles.infoSection}>
        <h3 className={styles.infoTitle}>Usos comunes</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>🔊</span>
            <h4>Test de altavoces</h4>
            <p>Comprueba la respuesta de frecuencia de tus altavoces o auriculares.</p>
          </div>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>👂</span>
            <h4>Test de audición</h4>
            <p>Descubre hasta qué frecuencia puedes oír (normalmente hasta 15-20kHz).</p>
          </div>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>🎵</span>
            <h4>Afinación</h4>
            <p>Usa las notas musicales para afinar instrumentos.</p>
          </div>
        </div>
      </div>

      <EducationalSection
        title="Física del Sonido y Aplicaciones Prácticas"
        subtitle="Comprende las frecuencias, tipos de onda y usos reales del sonido"
        icon="🔊"
      >
        <section>
          <h3><span aria-hidden="true">📊</span> Rangos de Frecuencia: De los Subgraves al Ultrasonido</h3>
          <div className={styles.eduTablaWrapper}>
            <table className={styles.eduTabla}>
              <thead>
                <tr>
                  <th>Rango</th>
                  <th>Frecuencia</th>
                  <th>Percepción</th>
                  <th>Instrumentos / fuentes</th>
                  <th>Uso técnico</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Subgraves</strong></td>
                  <td>20 – 60 Hz</td>
                  <td>Se sienten más que se oyen (vibración corporal)</td>
                  <td>Bombo, bajo eléctrico, explosiones</td>
                  <td>Subwoofer, salas de cine</td>
                </tr>
                <tr>
                  <td><strong>Graves</strong></td>
                  <td>60 – 250 Hz</td>
                  <td>Calidez y peso del sonido</td>
                  <td>Bajo, barítono, cello, tuba</td>
                  <td>EQ de graves, test de altavoces</td>
                </tr>
                <tr>
                  <td><strong>Medios-bajos</strong></td>
                  <td>250 – 500 Hz</td>
                  <td>Cuerpo y presencia de la voz</td>
                  <td>Guitarra, piano, voz masculina</td>
                  <td>Reducir para eliminar "embarrado"</td>
                </tr>
                <tr>
                  <td><strong>Medios</strong></td>
                  <td>500 Hz – 2 kHz</td>
                  <td>Inteligibilidad vocal máxima</td>
                  <td>Voz humana, guitarra, violin</td>
                  <td>Calibración PA, telefonía</td>
                </tr>
                <tr>
                  <td><strong>Medios-altos</strong></td>
                  <td>2 – 4 kHz</td>
                  <td>Presencia, claridad de ataque</td>
                  <td>Snare, consonantes del habla</td>
                  <td>Audiometría vocal</td>
                </tr>
                <tr>
                  <td><strong>Agudos</strong></td>
                  <td>4 – 8 kHz</td>
                  <td>Brillo, definición</td>
                  <td>Platillos, flautín, sibilantes</td>
                  <td>Test auriculares, sibilancia vocal</td>
                </tr>
                <tr>
                  <td><strong>Muy agudos</strong></td>
                  <td>8 – 20 kHz</td>
                  <td>Aire, espacialidad</td>
                  <td>Armónicos altos, rozamientos</td>
                  <td>Límite audición, test de edad</td>
                </tr>
                <tr>
                  <td><strong>Ultrasonido</strong></td>
                  <td>&gt; 20 kHz</td>
                  <td>Inaudible para humanos</td>
                  <td>Murciélagos, delfines, perros</td>
                  <td>Ecografía, limpieza ultrasónica, sonar</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h3><span aria-hidden="true">🎯</span> Casos de Uso: Para Qué Sirve un Generador de Tonos</h3>
          <div className={styles.eduEscenariosGrid}>
            <div className={styles.eduEscenarioCard}>
              <span className={styles.eduEscenarioIcon}>👂</span>
              <h4>Test de Audición Personal</h4>
              <p>Sube progresivamente la frecuencia desde 8.000 Hz hasta 20.000 Hz para descubrir tu límite auditivo superior. A los 20 años el límite suele ser ~20 kHz; a los 40 años baja a ~14-16 kHz; a los 60 años puede estar en ~8-10 kHz. Un resultado muy distinto al esperado para tu edad puede justificar una audiometría profesional.</p>
            </div>
            <div className={styles.eduEscenarioCard}>
              <span className={styles.eduEscenarioIcon}>🎵</span>
              <h4>Afinación de Instrumentos</h4>
              <p>La nota La4 estándar es 440 Hz (ISO 16:1975). La interpretación históricamente informada del barroco suele afinar en 415 Hz, un semitono por debajo, y las orquestas europeas modernas tiran de 442-443 Hz. En el barroco no había un estándar único: los órganos del norte de Alemania llegaban a 466 Hz y los instrumentos franceses bajaban hasta 392 Hz. Reproduce el tono y afina tu instrumento por referencia auditiva. Para instrumentos de cuerda: Do (261,63 Hz), Re (293,66 Hz), Mi (329,63 Hz), Fa (349,23 Hz), Sol (392 Hz), La (440 Hz), Si (493,88 Hz).</p>
            </div>
            <div className={styles.eduEscenarioCard}>
              <span className={styles.eduEscenarioIcon}>🔊</span>
              <h4>Calibración de Sistemas de Audio</h4>
              <p>Usa el barrido (sweep) de 20 Hz a 20 kHz para detectar resonancias o "huecos" en la respuesta de frecuencia de altavoces, auriculares o una sala. Si un rango se escucha mucho más fuerte o más débil que el resto, tu sistema tiene una coloración no lineal. Los tonos de prueba individuales identifican la frecuencia exacta del problema.</p>
            </div>
            <div className={styles.eduEscenarioCard}>
              <span className={styles.eduEscenarioIcon}>🏫</span>
              <h4>Educación y Física Acústica</h4>
              <p>Ideal para clases de física: demuestra en tiempo real la diferencia entre onda senoidal (tono puro), cuadrada (rica en armónicos impares), sierra (todos los armónicos) y triangular (armónicos impares con caída rápida). El barrido de frecuencias ilustra visualmente el espectro audible y permite que los estudiantes experimenten las diferencias perceptivas entre rangos.</p>
            </div>
          </div>
        </section>

        <section>
          <h3><span aria-hidden="true">❓</span> Preguntas Frecuentes sobre Frecuencias y Sonido</h3>
          <div className={styles.eduFaqList}>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqPregunta}>¿Qué es la frecuencia y por qué se mide en Hz?</summary>
              <p className={styles.eduFaqRespuesta}>La frecuencia es el número de oscilaciones completas por segundo de una onda sonora. El hercio (Hz), llamado así en honor al físico Heinrich Hertz, equivale a 1 ciclo por segundo. 440 Hz significa que el aire oscila 440 veces por segundo. A mayor frecuencia, más agudo es el sonido; a menor frecuencia, más grave. La velocidad del sonido en el aire (~343 m/s a 20°C) divide entre la frecuencia da la longitud de onda: a 440 Hz, λ ≈ 78 cm; a 20 Hz, λ ≈ 17 metros.</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqPregunta}>¿Por qué el oído humano oye exactamente de 20 Hz a 20 kHz?</summary>
              <p className={styles.eduFaqRespuesta}>El rango audible humano está determinado por la anatomía del oído interno. La cóclea contiene ~16.000 células ciliares dispuestas como un piano: las de la base detectan agudos y las del ápice detectan graves. Las frecuencias muy bajas (&lt;20 Hz) no son suficientemente energéticas para mover los cilios con eficacia; y las muy altas (&gt;20 kHz) dejan de mover la membrana basilar de forma eficaz — el límite lo pone la mecánica de la onda viajera en la cóclea, no el tamaño de los cilios: a 20 kHz la longitud de onda en aire es de 1,7 cm, unas diez mil veces mayor que un estereocilio. Con la edad, las células de los agudos mueren primero por ser las más expuestas, lo que explica la presbiacusia (pérdida auditiva de agudos por envejecimiento).</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqPregunta}>¿Qué diferencia hay entre onda senoidal, cuadrada, triangular y sierra?</summary>
              <p className={styles.eduFaqRespuesta}>La <strong>onda senoidal</strong> es el tono más puro: un solo armónico, la frecuencia fundamental. Es la más suave y menos agresiva al oído. La <strong>onda cuadrada</strong> contiene la fundamental más todos los armónicos impares (3ª, 5ª, 7ª...) con amplitud 1/n. Suena más "metálica" y brillante; es la base de los sintetizadores clásicos (Moog). La <strong>onda sierra</strong> contiene todos los armónicos (pares e impares), dando el timbre más rico y "rasgado". La <strong>onda triangular</strong> tiene solo armónicos impares pero con caída mucho más rápida (1/n²), sonando más suave que la cuadrada pero más brillante que la senoidal.</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqPregunta}>¿Qué son los tonos binaurales y sirven para algo?</summary>
              <p className={styles.eduFaqRespuesta}>Los tonos binaurales se crean reproduciendo dos frecuencias ligeramente diferentes en cada oído (p. ej., 400 Hz en el izquierdo y 410 Hz en el derecho). El cerebro percibe una tercera frecuencia "fantasma" de 10 Hz (la diferencia). La teoría es que esto puede inducir estados de ondas cerebrales específicos: delta (1-4 Hz, sueño), theta (4-8 Hz, relajación), alfa (8-13 Hz, alerta relajada), beta (13-30 Hz, concentración). La evidencia científica es mixta: algunos estudios muestran efectos modestos en concentración y relajación; otros no encuentran diferencias significativas con el placebo.</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqPregunta}>¿Por qué los graves se sienten físicamente en el cuerpo?</summary>
              <p className={styles.eduFaqRespuesta}>Las frecuencias bajas (&lt;100 Hz) tienen longitudes de onda muy largas (3 metros a 100 Hz) y gran energía mecánica. A niveles altos de presión sonora, literalmente mueven el aire y los objetos del entorno. El cuerpo humano tiene receptores mecánicos en la piel (corpúsculos de Pacini, sensibles a 250-300 Hz) y receptores vibrotáctiles que captan estas frecuencias aunque el oído no las perciba claramente. Por eso se "siente" el bajo en un concierto en el pecho. Las frecuencias entre 18-19 Hz pueden causar malestar por resonancia de órbitas oculares.</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqPregunta}>¿Qué es el decibelio y cuál es un volumen seguro?</summary>
              <p className={styles.eduFaqRespuesta}>El decibelio (dB) mide la intensidad sonora en escala logarítmica: 0 dB es el umbral de audición, 60 dB es una conversación normal, 85 dB es el límite de exposición laboral (8h/día según la OIT), 110 dB es un concierto de rock. La exposición a &gt;85 dB durante períodos prolongados daña permanentemente las células ciliares. La regla del 3 dB: cada 3 dB adicionales se duplica la energía sonora, por lo que el tiempo de exposición segura se reduce a la mitad. Con auriculares al máximo volumen (~110 dB), el daño auditivo puede ocurrir en menos de 5 minutos.</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqPregunta}>¿A qué frecuencia vibra la voz humana?</summary>
              <p className={styles.eduFaqRespuesta}>La voz humana abarca un rango amplio. El <strong>fundamental de la voz</strong> (F0, la nota que "cantamos") va de ~85 Hz (bajo profundo) a ~1.100 Hz (soprano coloratura). La voz hablada masculina se centra en 85-180 Hz; la femenina en 165-255 Hz; la infantil en 250-400 Hz. Pero la inteligibilidad del habla depende sobre todo de los <strong>formantes</strong> vocálicos (2-4 kHz) y las consonantes fricativas (4-8 kHz). Por eso la telefonía estándar filtra el audio entre 300 Hz y 3.400 Hz: es suficiente para entender el habla aunque recorte graves y agudos.</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqPregunta}>¿Por qué la nota La estándar es 440 Hz y no otra frecuencia?</summary>
              <p className={styles.eduFaqRespuesta}>Durante siglos no existía un estándar: Mozart componía con La ~421 Hz, Händel usó 423 Hz, y en el siglo XIX las orquestas llegaron a usar 452 Hz para sonar "más brillantes". El acuerdo llegó en la conferencia internacional de Londres de 1939, por ser un compromiso entre las prácticas europeas de la época; la ISO —fundada en 1947— lo recogió en la norma ISO 16 en 1955 y la revisó en 1975. Sin embargo, muchas orquestas modernas tocan a 441-443 Hz por sonar "más brillantes". La polémica de los 432 Hz como "frecuencia natural" carece de base científica sólida, pero continúa siendo popular en círculos de bienestar.</p>
            </details>
          </div>
        </section>

        <section>
          <h3><span aria-hidden="true">📋</span> Guía: Cómo Hacer un Test de Audición Casero</h3>
          <ol className={styles.eduPasosList}>
            <li className={styles.eduPaso}>
              <span className={styles.eduPasoNum}>1</span>
              <div>
                <strong>Prepara el entorno</strong>
                <p>Elige un lugar silencioso sin ruido de fondo. Usa auriculares de buena calidad (preferiblemente circumaurales cerrados) y ajusta el volumen al 30-50%. El ruido ambiente contamina el test: incluso 40 dB de fondo pueden enmascarar tonos débiles en los agudos.</p>
              </div>
            </li>
            <li className={styles.eduPaso}>
              <span className={styles.eduPasoNum}>2</span>
              <div>
                <strong>Establece el punto de referencia grave</strong>
                <p>Empieza en 1.000 Hz con onda senoidal. Este es un tono de referencia en audiometría clínica: si no lo oyes con claridad a volumen normal, algo inusual pasa con el equipo o el entorno. Baja a 500 Hz y 250 Hz para confirmar que los medios y graves son audibles.</p>
              </div>
            </li>
            <li className={styles.eduPaso}>
              <span className={styles.eduPasoNum}>3</span>
              <div>
                <strong>Explora los agudos progresivamente</strong>
                <p>Sube de 4.000 Hz en incrementos: 6.000, 8.000, 10.000, 12.000, 14.000, 16.000, 18.000, 20.000 Hz. Anota la frecuencia más alta a la que todavía escuchas un tono claro (no solo presión o "silencio percibido"). Este es tu límite auditivo superior aproximado.</p>
              </div>
            </li>
            <li className={styles.eduPaso}>
              <span className={styles.eduPasoNum}>4</span>
              <div>
                <strong>Compara con los valores esperados por edad</strong>
                <p>Orientativo: 20 años → ~18-20 kHz; 30 años → ~16-18 kHz; 40 años → ~14-16 kHz; 50 años → ~12-14 kHz; 60+ años → ~8-12 kHz. Valores significativamente inferiores al rango para tu edad pueden indicar presbiacusia o daño auditivo por ruido.</p>
              </div>
            </li>
            <li className={styles.eduPaso}>
              <span className={styles.eduPasoNum}>5</span>
              <div>
                <strong>Test comparativo oído izquierdo vs. derecho</strong>
                <p>Tapa un oído con la palma de la mano y repite el test con el otro. Una diferencia notable entre oídos (&gt;2-3 kHz) justifica una consulta audiológica. La asimetría auditiva puede indicar patologías como la neurinoma del acústico, infección o trauma local.</p>
              </div>
            </li>
            <li className={styles.eduPaso}>
              <span className={styles.eduPasoNum}>6</span>
              <div>
                <strong>Interpreta los resultados con precaución</strong>
                <p>Este test casero es orientativo, no diagnóstico. La calidad del altavoz/auricular limita los resultados: muchos auriculares baratos no reproducen bien por encima de 15 kHz ni por debajo de 50 Hz. Para una audiometría clínica precisa, consulta un audiólogo o un ORL. La Sociedad Española de Otorrinolaringología recomienda revisión auditiva periódica a partir de los 50 años.</p>
              </div>
            </li>
          </ol>
        </section>

        <section>
          <h3><span aria-hidden="true">💡</span> Consejos para Sacar el Máximo al Generador de Tonos</h3>
          <div className={styles.eduTipsGrid}>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcono}>🎧</span>
              <h4>Usa auriculares para los agudos</h4>
              <p>Los altavoces del ordenador o smartphone raramente reproducen bien por encima de 12-14 kHz. Para testar frecuencias superiores a 10 kHz necesitas auriculares de calidad. Las frecuencias &lt;60 Hz tampoco se escuchan bien sin altavoces con woofer o subwoofer.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcono}>📉</span>
              <h4>Baja el volumen antes de subir la frecuencia</h4>
              <p>Los agudos intensos son los más dañinos para el oído. Al explorar frecuencias &gt;8 kHz, reduce el volumen al 20-30%. Lo que falta de volumen puedes compensarlo con atención; lo que dañas en las células ciliares no se recupera.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcono}>🔁</span>
              <h4>El sweep revela la respuesta de frecuencia</h4>
              <p>Un barrido lento de 20 Hz a 20 kHz con volumen constante te muestra qué frecuencias suenan más alto o más bajo en tu sistema. Las "montañas" son resonancias del altavoz o la sala; los "valles" son cancelaciones de fase o deficiencias del driver.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcono}>🎼</span>
              <h4>La onda senoidal es la más pura para afinar</h4>
              <p>Para afinar instrumentos, usa siempre onda senoidal. Las ondas cuadrada y sierra tienen armónicos que pueden confundir el oído al comparar con el timbre del instrumento. La senoidal da un único punto de referencia sin coloración tonal.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcono}>🐕</span>
              <h4>Las mascotas oyen más que tú</h4>
              <p>Los perros oyen hasta ~65 kHz y los gatos hasta ~79 kHz. Si tienes mascotas en casa, evita reproducir frecuencias &gt;15 kHz a volumen alto: aunque tú no lo escuches, ellas sí lo oyen y puede causarles estrés o malestar.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcono}>🏠</span>
              <h4>Los graves &lt;100 Hz dependen de la sala</h4>
              <p>Las frecuencias muy graves se amplifican o cancelan drásticamente según las dimensiones de la habitación (modos de sala). Un tono de 80 Hz puede sonar 20 dB más alto en una esquina de tu cuarto que en el centro. Para tests precisos de graves, necesitas una sala anecoica o análisis con micrófono de medición.</p>
            </div>
          </div>
        </section>

        <section>
          <div className={styles.warningBox}>
            <span className={styles.warningIcono}>⚠️</span>
            <div>
              <strong>Advertencias importantes sobre el uso del generador de tonos</strong>
              <ul>
                <li><strong>Riesgo de daño auditivo:</strong> El uso prolongado a volumen alto puede dañar permanentemente el oído. Las células ciliares cocleares no se regeneran. Mantén siempre el volumen por debajo del 50% y no uses la herramienta durante más de 15-20 minutos seguidos con auriculares.</li>
                <li><strong>No es un diagnóstico médico:</strong> Los resultados de un test de audición casero con esta herramienta son orientativos y no sustituyen a una audiometría clínica realizada por un audiólogo o médico ORL con equipamiento calibrado en cámara silente.</li>
                <li><strong>Cuidado con mascotas y niños pequeños:</strong> Frecuencias superiores a 15 kHz pueden ser audibles y molestas para mascotas (perros, gatos, roedores) aunque tú no las escuches. Los niños también tienen umbrales de agudos más altos. No uses la herramienta a volumen alto sin asegurarte de que no hay personas sensibles o animales cerca.</li>
                <li><strong>Frecuencias muy bajas a volumen alto:</strong> Los tonos entre 18-20 Hz reproducidos a niveles muy altos a través de sistemas de audio potentes pueden causar sensaciones físicas incómodas (mareo, presión en el pecho, náuseas). A nivel del ordenador personal esto no es un riesgo real, pero en sistemas de sonido profesionales con subwoofers sí puede serlo.</li>
                <li><strong>No usar con implantes cocleares o audífonos:</strong> Si usas audífonos o llevas implantes auditivos, consulta a tu audiólogo antes de hacer tests de frecuencias. Algunos dispositivos pueden responder de forma no lineal a tonos puros de alta intensidad.</li>
              </ul>
            </div>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('generador-tonos')} />
      <ShareCard appName="generador-tonos" />
      <Footer appName="generador-tonos" />
    </div>
  );
}
