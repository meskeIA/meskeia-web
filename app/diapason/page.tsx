'use client';
// @disclaimer: exempt

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './Diapason.module.css';
import { MeskeiaLogo, Footer, RelatedApps, LegalNotice, ShareCard, EducationalSection } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

interface FrecuenciaPreset {
  nombre: string;
  frecuencia: number;
  descripcion: string;
}

const FRECUENCIAS_PRESET: FrecuenciaPreset[] = [
  { nombre: 'La 440Hz', frecuencia: 440, descripcion: 'Estándar internacional (ISO 16)' },
  { nombre: 'La 432Hz', frecuencia: 432, descripcion: 'Afinación alternativa "natural"' },
  { nombre: 'La 442Hz', frecuencia: 442, descripcion: 'Orquestas europeas' },
  { nombre: 'La 443Hz', frecuencia: 443, descripcion: 'Algunas orquestas (Berlín)' },
  { nombre: 'La 415Hz', frecuencia: 415, descripcion: 'Música barroca' },
  { nombre: 'La 466Hz', frecuencia: 466, descripcion: 'Renacimiento (medio tono arriba)' },
];

export default function DiapasonPage() {
  const [frecuencia, setFrecuencia] = useState(440);
  /**
   * Lo escrito en el campo, aparte del número que suena.
   *
   * El input estaba controlado por `frecuencia` y su onChange acotaba en CADA pulsación:
   * al teclear «440», el primer «4» caía bajo el mínimo de 20 y se convertía en 20, con los
   * dígitos siguientes pegándose detrás. Escribir la frecuencia era imposible. Es el mismo
   * defecto que el Inspector encontró en `generador-tonos` (hallazgo 127, 21/08/2026); aquí
   * no lo había inspeccionado nadie, apareció al grepear el patrón por el catálogo.
   */
  const [frecuenciaTexto, setFrecuenciaTexto] = useState('440');

  const DIAPASON_MIN = 20;
  const DIAPASON_MAX = 2000;

  /** Única puerta para cambiar la frecuencia desde fuera del campo (slider y presets) */
  const aplicarFrecuencia = (n: number) => {
    const v = Math.max(DIAPASON_MIN, Math.min(DIAPASON_MAX, Math.round(n)));
    setFrecuencia(v);
    setFrecuenciaTexto(String(v));
  };
  const [reproduciendo, setReproduciendo] = useState(false);
  const [volumen, setVolumen] = useState(0.5);
  const [tipoOnda, setTipoOnda] = useState<OscillatorType>('sine');

  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Inicializar AudioContext
  useEffect(() => {
    return () => {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const iniciarAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }

    const ctx = audioContextRef.current;

    // Crear oscilador
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = tipoOnda;
    oscillator.frequency.setValueAtTime(frecuencia, ctx.currentTime);

    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(volumen, ctx.currentTime + 0.1);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start();

    oscillatorRef.current = oscillator;
    gainNodeRef.current = gainNode;
    setReproduciendo(true);
  }, [frecuencia, volumen, tipoOnda]);

  const detenerAudio = useCallback(() => {
    if (gainNodeRef.current && audioContextRef.current) {
      gainNodeRef.current.gain.linearRampToValueAtTime(0, audioContextRef.current.currentTime + 0.1);
    }

    setTimeout(() => {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current = null;
      }
      setReproduciendo(false);
    }, 100);
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

  // Actualizar tipo de onda (requiere reiniciar)
  useEffect(() => {
    if (reproduciendo) {
      detenerAudio();
      setTimeout(() => iniciarAudio(), 150);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipoOnda]);

  const seleccionarPreset = (preset: FrecuenciaPreset) => {
    aplicarFrecuencia(preset.frecuencia);
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Diapasón Digital</h1>
        <p className={styles.subtitle}>
          Tono de referencia para afinar instrumentos
        </p>
      </header>

      <LegalNotice />

      {/* Diapasón principal */}
      <div className={styles.diapasonCard}>
        <div className={styles.frecuenciaDisplay}>
          <span className={styles.frecuenciaNumero}>{frecuencia}</span>
          <span className={styles.frecuenciaUnidad}>Hz</span>
        </div>

        <div className={styles.notaDisplay}>
          <span className={styles.notaNombre}>La</span>
          <span className={styles.notaOctava}>A4</span>
        </div>

        {/* Botón principal */}
        <button
          className={`${styles.btnDiapason} ${reproduciendo ? styles.activo : ''}`}
          onClick={toggleAudio}
          aria-pressed={reproduciendo}
          aria-label={reproduciendo ? 'Detener tono de referencia' : 'Reproducir tono de referencia'}
        >
          <span className={styles.diapasonIcon} aria-hidden="true">
            {reproduciendo ? '🔊' : '🔇'}
          </span>
          <span className={styles.diapasonTexto}>
            {reproduciendo ? 'Detener' : 'Reproducir'}
          </span>
        </button>

        {/* Visualización de onda */}
        {reproduciendo && (
          <div className={styles.ondaVisual}>
            <div className={styles.ondaBarra}></div>
            <div className={styles.ondaBarra}></div>
            <div className={styles.ondaBarra}></div>
            <div className={styles.ondaBarra}></div>
            <div className={styles.ondaBarra}></div>
          </div>
        )}

        {/* Control de volumen */}
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
          />
          <span className={styles.volumenIcon}>🔊</span>
          <span className={styles.volumenValor}>{Math.round(volumen * 100)}%</span>
        </div>
      </div>

      {/* Presets de frecuencia */}
      <div className={styles.presetsSection}>
        <h2 className={styles.presetsTitle}>Frecuencias de referencia</h2>
        <div className={styles.presetsGrid}>
          {FRECUENCIAS_PRESET.map((preset) => (
            <button
              key={preset.frecuencia}
              className={`${styles.presetBtn} ${frecuencia === preset.frecuencia ? styles.presetActivo : ''}`}
              onClick={() => seleccionarPreset(preset)}
            >
              <span className={styles.presetNombre}>{preset.nombre}</span>
              <span className={styles.presetDesc}>{preset.descripcion}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Frecuencia personalizada */}
      <div className={styles.customSection}>
        <h3 className={styles.customTitle}>Frecuencia personalizada</h3>
        <div className={styles.customControl}>
          <input
            type="range"
            min="400"
            max="480"
            step="1"
            value={frecuencia}
            onChange={(e) => aplicarFrecuencia(parseInt(e.target.value, 10))}
            className={styles.customSlider}
          />
          <input
            type="number"
            min="20"
            max="2000"
            value={frecuenciaTexto}
            onChange={(e) => {
              setFrecuenciaTexto(e.target.value);
              const n = parseInt(e.target.value, 10);
              if (Number.isFinite(n) && n >= DIAPASON_MIN && n <= DIAPASON_MAX) setFrecuencia(n);
            }}
            onBlur={() => aplicarFrecuencia(parseInt(frecuenciaTexto, 10) || 440)}
            aria-label="Frecuencia personalizada en Hz"
            className={styles.customInput}
          />
        </div>
      </div>

      {/* Tipo de onda */}
      <div className={styles.ondaSection}>
        <h3 className={styles.ondaTitle}>Tipo de onda</h3>
        <div className={styles.ondaGrid}>
          {(['sine', 'triangle', 'square', 'sawtooth'] as OscillatorType[]).map((tipo) => (
            <button
              key={tipo}
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

      {/* Contenido educativo */}
      <EducationalSection
        title="¿Quieres aprender más sobre afinación musical?"
        subtitle="Descubre la historia del La 440Hz y los estándares de afinación"
      >
        {/* Tabla comparativa */}
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Estándar</th>
                <th>Frecuencia La4</th>
                <th>Época / Origen</th>
                <th>Quién lo usa</th>
                <th>Diferencia con 440Hz</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>ISO 16 (Estándar)</strong></td>
                <td>440,0 Hz</td>
                <td>1939 / Internacional</td>
                <td>Mayoría de orquestas, grabaciones</td>
                <td>Referencia (0 cents)</td>
              </tr>
              <tr>
                <td><strong>Europeo alto</strong></td>
                <td>442,0 Hz</td>
                <td>Siglo XX / Europa central</td>
                <td>Orquestas de Viena, Berlín</td>
                <td>+7,85 cents (más brillante)</td>
              </tr>
              <tr>
                <td><strong>Europeo medio</strong></td>
                <td>441,0 Hz</td>
                <td>Siglo XX / Europa</td>
                <td>Algunas orquestas europeas</td>
                <td>+3,93 cents</td>
              </tr>
              <tr>
                <td><strong>Berlinés</strong></td>
                <td>443,0 Hz</td>
                <td>Siglo XX / Alemania</td>
                <td>Filarmónica de Berlín</td>
                <td>+11,76 cents</td>
              </tr>
              <tr>
                <td><strong>Barroco</strong></td>
                <td>415,0 Hz</td>
                <td>S. XVII-XVIII / Europa</td>
                <td>Grupos de música antigua</td>
                <td>-99 cents (casi un semitono)</td>
              </tr>
              <tr>
                <td><strong>Renacentista</strong></td>
                <td>466,0 Hz</td>
                <td>S. XV-XVI / Europa</td>
                <td>Música de época renacentista</td>
                <td>+99,5 cents (casi semitono arriba)</td>
              </tr>
              <tr>
                <td><strong>Verdi / Natural</strong></td>
                <td>432,0 Hz</td>
                <td>S. XIX / Italia</td>
                <td>Comunidad alternativa, some jazz</td>
                <td>-31,77 cents</td>
              </tr>
              <tr>
                <td><strong>Científico / Filosófico</strong></td>
                <td>430,5 Hz</td>
                <td>Siglo XIX</td>
                <td>Uso histórico, investigación</td>
                <td>-37 cents aprox.</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Escenarios de uso */}
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <h3>🎸 Afinar guitarra acústica</h3>
            <p>Genera el La4 a 440 Hz con onda senoidal pura. Toca la cuerda La (5ª) de tu guitarra y ajusta la clavija hasta que ambos tonos suenen igual. Sin necesidad de app de afinación.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h3>🎻 Ensayo de orquesta</h3>
            <p>El oboe da el La de referencia al inicio de cada ensayo. Si no tienes oboe, usa el diapasón digital a 440 Hz (o 442 Hz si tu orquesta usa estándar europeo) para que todos afinen al unísono.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h3>🎼 Interpretación barroca</h3>
            <p>Para tocar con instrumentos de época (clavicémbalo, viola da gamba, flauta dulce barroca), selecciona 415 Hz. Así tu instrumento moderno sonará &quot;en tono&quot; con los instrumentos históricos.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h3>🎹 Profesor de música</h3>
            <p>Usa el diapasón para enseñar el concepto de frecuencia y tono a alumnos. Compara 432 Hz vs 440 Hz vs 442 Hz en tiempo real para que perciban las diferencias sutiles de afinación.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h3>🎤 Cantante sin instrumento</h3>
            <p>Antes de ensayar sola, genera el La4 a 440 Hz para situar tu voz en el tono correcto. También útil para cantantes de coro que necesitan encontrar su nota de entrada.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h3>🔬 Experimento de batimento</h3>
            <p>Abre dos pestañas del diapasón con frecuencias ligeramente distintas (440 Hz y 441 Hz). Escucharás un &quot;batimento&quot; pulsante de 1 Hz: el fenómeno físico que usan los músicos para detectar desafinación.</p>
          </div>
        </div>

        {/* FAQ */}
        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <h3>¿Por qué se eligió exactamente 440 Hz como estándar?</h3>
            <p>En 1939 la ISO adoptó 440 Hz por ser un compromiso entre las distintas afinaciones nacionales del momento (algunas usaban 435 Hz, otras 452 Hz). En 1955 se ratificó como ISO 16. No hay ningún motivo &quot;místico&quot;: fue puro pragmatismo para facilitar la fabricación de instrumentos y la grabación internacional.</p>
          </li>
          <li className={styles.faqItem}>
            <h3>¿Es verdad que 432 Hz es más &quot;natural&quot; o &quot;armónica con el universo&quot;?</h3>
            <p>No. Es un mito moderno sin base científica. La afirmación de que 432 Hz es la &quot;frecuencia de la naturaleza&quot; o que se relaciona con el número phi o con Pitágoras no está respaldada por ningún estudio acústico o histórico riguroso. El oído humano no tiene preferencia biológica por 432 Hz frente a 440 Hz.</p>
          </li>
          <li className={styles.faqItem}>
            <h3>¿Por qué las orquestas europeas afinan más alto que 440 Hz?</h3>
            <p>La afinación alta (441-443 Hz) produce un sonido más brillante y penetrante, especialmente en instrumentos de cuerda y viento metal. Esto es una preferencia estética, no un estándar técnico. La Filarmónica de Berlín, una de las más reconocidas del mundo, usa habitualmente 443 Hz.</p>
          </li>
          <li className={styles.faqItem}>
            <h3>¿Qué es un &quot;cent&quot; en afinación musical?</h3>
            <p>Un cent es la centésima parte de un semitono. 100 cents = 1 semitono; 1.200 cents = 1 octava. El oído humano entrenado puede detectar diferencias de ~5-10 cents. La diferencia entre 440 Hz y 442 Hz es de ~7,85 cents, perceptible para músicos con oído relativo.</p>
          </li>
          <li className={styles.faqItem}>
            <h3>¿Qué tipo de onda es mejor para afinar: senoidal o cuadrada?</h3>
            <p>La senoidal es la más precisa para afinar porque es una onda pura sin armónicos. Los armónicos de la cuadrada o la sierra pueden &quot;confundir&quot; al oído. Usa senoidal cuando necesites comparar con precisión el tono de tu instrumento.</p>
          </li>
          <li className={styles.faqItem}>
            <h3>¿Puedo usar el diapasón digital en directo sobre un escenario?</h3>
            <p>Sí, si tienes conexión al sistema de sonido. Pero en un escenario con ruido ambiente, un afinador cromático con clip (tipo Peterson o Snark) es más fiable. El diapasón digital es ideal para ensayos en sala o para dar el la inicial antes de salir al escenario.</p>
          </li>
          <li className={styles.faqItem}>
            <h3>¿Por qué el barroco usa 415 Hz y no otro valor?</h3>
            <p>415 Hz equivale aproximadamente a La♭4 en afinación moderna, es decir, exactamente un semitono por debajo de 440 Hz. Esta afinación está documentada en instrumentos originales de los siglos XVII-XVIII y es el estándar adoptado por los grupos de interpretación históricamente informada (HIP).</p>
          </li>
          <li className={styles.faqItem}>
            <h3>¿Cómo afina un piano si el diapasón solo da el La?</h3>
            <p>El afinador de pianos parte del La4 (440 Hz) y afina por quintas y octavas hacia arriba y abajo para llegar a las 88 teclas. En un piano de concierto este proceso tarda 2-3 horas y requiere ajuste de temperamento igual para que todas las tonalidades suenen aceptablemente afinadas.</p>
          </li>
        </ul>

        {/* Guía paso a paso */}
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <h3>Elige la frecuencia de referencia</h3>
              <p>Selecciona el estándar que uses: 440 Hz para música moderna, 442-443 Hz si tocas con orquesta europea, 415 Hz para música barroca.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <h3>Selecciona el tipo de onda</h3>
              <p>Usa senoidal para máxima precisión al afinar. Las ondas cuadrada, triangular o sierra son útiles para explorar timbres pero menos precisas para comparar tonos.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <h3>Ajusta el volumen a un nivel cómodo</h3>
              <p>Sube el volumen gradualmente hasta que puedas escuchar claramente el tono sin esfuerzo. Un volumen demasiado alto puede fatigar el oído y dificultar la comparación.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <h3>Pulsa Reproducir</h3>
              <p>El diapasón genera el tono de referencia continuamente. Puedes dejarlo sonando mientras tocas tu instrumento para comparar ambos sonidos simultáneamente.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>
              <h3>Toca la cuerda o nota de referencia</h3>
              <p>Toca el La de tu instrumento (cuerda 5ª en guitarra, cuerda 2ª en violín). Escucha simultáneamente ambos tonos para detectar batimentos (pulsaciones de desafinación).</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>6</div>
            <div className={styles.stepContent}>
              <h3>Ajusta hasta eliminar los batimentos</h3>
              <p>Gira la clavija lentamente. Cuando los batimentos desaparezcan y los tonos &quot;fundan&quot; en uno solo, tu instrumento está afinado en La.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>7</div>
            <div className={styles.stepContent}>
              <h3>Afina el resto de cuerdas desde el La</h3>
              <p>Con el La afinado como referencia, afina las demás cuerdas por intervalos (4ª y 5ª justas), o usa las notas en los trastes 5ª y 7ª del mástil según el método estándar.</p>
            </div>
          </div>
        </div>

        {/* Mejores prácticas */}
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <h3>🎯 Afina siempre subiendo</h3>
            <p>Si la cuerda está muy alta, bájala por debajo de la nota y sube hasta afinar. Las cuerdas retienen mejor la afinación cuando la tensión llega desde abajo.</p>
          </div>
          <div className={styles.tipCard}>
            <h3>🌡️ La temperatura afecta la afinación</h3>
            <p>Los instrumentos de viento cambian de afinación con la temperatura. Déjalos calentar 5-10 minutos antes de afinar en un local frío o caliente.</p>
          </div>
          <div className={styles.tipCard}>
            <h3>🎵 El La es la nota de referencia universal</h3>
            <p>Todos los instrumentos pueden afinar tomando el La como punto de partida. En orquesta, es el oboe quien lo da porque su afinación es difícil de ajustar durante la actuación.</p>
          </div>
          <div className={styles.tipCard}>
            <h3>👂 Entrena el oído a detectar batimentos</h3>
            <p>Los batimentos son pulsaciones audibles cuando dos frecuencias cercanas suenan juntas. Su velocidad (Hz) es exactamente la diferencia entre ambas frecuencias. Escucharlos es la clave de afinar de oído.</p>
          </div>
          <div className={styles.tipCard}>
            <h3>🔕 Afina en silencio</h3>
            <p>El ruido ambiente interfiere con la percepción de los batimentos. Busca un lugar silencioso o usa auriculares para comparar con mayor precisión el tono del diapasón con tu instrumento.</p>
          </div>
          <div className={styles.tipCard}>
            <h3>📱 Complementa con un afinador cromático</h3>
            <p>El diapasón te da el La de referencia; para afinar el resto de cuerdas rápidamente, complementa con el Afinador Cromático de meskeIA que detecta cualquier nota automáticamente.</p>
          </div>
        </div>

        {/* Aviso importante */}
        <div className={styles.warningBox}>
          <h3>⚠️ Sobre la afinación &quot;432 Hz&quot; y otras alternativas</h3>
          <ul className={styles.warningList}>
            <li>La afirmación de que 432 Hz es &quot;la frecuencia de la naturaleza&quot; o &quot;más armónica&quot; no tiene respaldo científico.</li>
            <li>Si grabas con músicos que usen 440 Hz estándar, usar 432 Hz hará que tu instrumento suene desafinado en la mezcla.</li>
            <li>Para tocar con otros músicos, siempre verifica qué estándar usan antes de afinar.</li>
            <li>La afinación 442-443 Hz es legítima y usada por orquestas profesionales, pero no es compatible con grabaciones en 440 Hz sin reprocesado.</li>
          </ul>
        </div>

        {/* Información original */}
        <div className={styles.infoSection}>
          <h2 className={styles.infoTitle}>Sobre el diapasón</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <span className={styles.infoIcon}>🎵</span>
              <h4>La 440Hz</h4>
              <p>Es el estándar internacional de afinación desde 1939 (ISO 16). La mayoría de instrumentos y orquestas lo usan como referencia.</p>
            </div>
            <div className={styles.infoCard}>
              <span className={styles.infoIcon}>🎻</span>
              <h4>Orquestas</h4>
              <p>Algunas orquestas europeas afinan a 442-443Hz para conseguir un sonido más brillante.</p>
            </div>
            <div className={styles.infoCard}>
              <span className={styles.infoIcon}>🎼</span>
              <h4>Música barroca</h4>
              <p>Los instrumentos de época se afinan a 415Hz, aproximadamente un semitono por debajo del estándar.</p>
            </div>
          </div>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('diapason')} />
      <ShareCard appName="diapason" />
      <Footer appName="diapason" />
    </div>
  );
}
