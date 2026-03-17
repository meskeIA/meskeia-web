'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './Metronomo.module.css';
import { MeskeiaLogo, Footer, RelatedApps, EducationalSection, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// Tempos preestablecidos con nombres musicales
const TEMPO_PRESETS = [
  { name: 'Largo', bpm: 50 },
  { name: 'Adagio', bpm: 70 },
  { name: 'Andante', bpm: 90 },
  { name: 'Moderato', bpm: 110 },
  { name: 'Allegro', bpm: 130 },
  { name: 'Vivace', bpm: 160 },
  { name: 'Presto', bpm: 180 },
];

// Compases disponibles
const TIME_SIGNATURES = [
  { beats: 4, noteValue: 4, label: '4/4' },
  { beats: 3, noteValue: 4, label: '3/4' },
  { beats: 2, noteValue: 4, label: '2/4' },
  { beats: 6, noteValue: 8, label: '6/8' },
  { beats: 5, noteValue: 4, label: '5/4' },
  { beats: 7, noteValue: 8, label: '7/8' },
];

export default function MetronomoPage() {
  const [bpm, setBpm] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [timeSignature, setTimeSignature] = useState(TIME_SIGNATURES[0]);
  const [accentFirst, setAccentFirst] = useState(true);
  const [volume, setVolume] = useState(0.7);
  const [tapTimes, setTapTimes] = useState<number[]>([]);

  const audioContextRef = useRef<AudioContext | null>(null);
  const nextNoteTimeRef = useRef(0);
  const timerIdRef = useRef<number | null>(null);
  const currentBeatRef = useRef(0);

  // Inicializar AudioContext
  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    return audioContextRef.current;
  }, []);

  // Generar sonido de click
  const playClick = useCallback((time: number, isAccent: boolean) => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    // Frecuencia más alta para el acento
    osc.frequency.value = isAccent ? 1000 : 800;
    osc.type = 'sine';

    // Volumen
    const vol = isAccent ? volume : volume * 0.7;
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

    osc.start(time);
    osc.stop(time + 0.1);
  }, [volume]);

  // Scheduler del metrónomo
  const scheduler = useCallback(() => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    const scheduleAheadTime = 0.1; // 100ms de anticipación
    const lookahead = 25; // ms entre checks

    while (nextNoteTimeRef.current < ctx.currentTime + scheduleAheadTime) {
      const isAccent = accentFirst && currentBeatRef.current === 0;
      playClick(nextNoteTimeRef.current, isAccent);

      // Actualizar beat actual
      setCurrentBeat(currentBeatRef.current);

      // Avanzar al siguiente beat
      currentBeatRef.current = (currentBeatRef.current + 1) % timeSignature.beats;

      // Calcular tiempo del siguiente beat
      const secondsPerBeat = 60.0 / bpm;
      nextNoteTimeRef.current += secondsPerBeat;
    }

    timerIdRef.current = window.setTimeout(scheduler, lookahead);
  }, [bpm, timeSignature.beats, accentFirst, playClick]);

  // Iniciar metrónomo
  const start = useCallback(() => {
    const ctx = initAudio();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    currentBeatRef.current = 0;
    nextNoteTimeRef.current = ctx.currentTime;
    setIsPlaying(true);
    scheduler();
  }, [initAudio, scheduler]);

  // Detener metrónomo
  const stop = useCallback(() => {
    if (timerIdRef.current) {
      clearTimeout(timerIdRef.current);
      timerIdRef.current = null;
    }
    setIsPlaying(false);
    setCurrentBeat(0);
    currentBeatRef.current = 0;
  }, []);

  // Toggle play/stop
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      stop();
    } else {
      start();
    }
  }, [isPlaying, start, stop]);

  // Tap Tempo
  const handleTap = useCallback(() => {
    const now = Date.now();
    const newTaps = [...tapTimes, now].filter(t => now - t < 3000); // Solo últimos 3 segundos

    if (newTaps.length >= 2) {
      // Calcular intervalos
      const intervals: number[] = [];
      for (let i = 1; i < newTaps.length; i++) {
        intervals.push(newTaps[i] - newTaps[i - 1]);
      }

      // Promedio de intervalos
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const calculatedBpm = Math.round(60000 / avgInterval);

      // Limitar entre 40 y 220
      setBpm(Math.max(40, Math.min(220, calculatedBpm)));
    }

    setTapTimes(newTaps);
  }, [tapTimes]);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (timerIdRef.current) {
        clearTimeout(timerIdRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Reiniciar scheduler cuando cambian parámetros
  useEffect(() => {
    if (isPlaying) {
      stop();
      start();
    }
  }, [bpm, timeSignature, accentFirst]);

  // Obtener nombre del tempo
  const getTempoName = (bpm: number): string => {
    if (bpm < 60) return 'Largo';
    if (bpm < 80) return 'Adagio';
    if (bpm < 100) return 'Andante';
    if (bpm < 120) return 'Moderato';
    if (bpm < 140) return 'Allegro';
    if (bpm < 170) return 'Vivace';
    return 'Presto';
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon}>🎵</span>
        <h1 className={styles.title}>Metrónomo</h1>
        <p className={styles.subtitle}>
          Metrónomo online preciso para práctica musical.
          Ajusta el tempo, compás y usa tap tempo para detectar BPM.
        </p>
      </header>

      <LegalNotice />

      <main className={styles.mainContent}>
        {/* Panel principal */}
        <div className={styles.metronomePanel}>
          {/* Visualización del pulso */}
          <div className={styles.beatDisplay}>
            {Array.from({ length: timeSignature.beats }).map((_, i) => (
              <div
                key={i}
                className={`${styles.beatDot} ${i === currentBeat && isPlaying ? styles.active : ''} ${i === 0 ? styles.accent : ''}`}
              />
            ))}
          </div>

          {/* BPM Display */}
          <div className={styles.bpmDisplay}>
            <span className={styles.bpmValue}>{bpm}</span>
            <span className={styles.bpmLabel}>BPM</span>
            <span className={styles.tempoName}>{getTempoName(bpm)}</span>
          </div>

          {/* Slider de BPM */}
          <div className={styles.sliderContainer}>
            <button
              className={styles.bpmAdjust}
              onClick={() => setBpm(Math.max(40, bpm - 1))}
            >
              −
            </button>
            <input
              type="range"
              min="40"
              max="220"
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
              className={styles.bpmSlider}
            />
            <button
              className={styles.bpmAdjust}
              onClick={() => setBpm(Math.min(220, bpm + 1))}
            >
              +
            </button>
          </div>

          {/* Botones de control */}
          <div className={styles.controls}>
            <button
              onClick={togglePlay}
              className={`${styles.playButton} ${isPlaying ? styles.playing : ''}`}
            >
              {isPlaying ? '⏹️ Detener' : '▶️ Iniciar'}
            </button>
            <button onClick={handleTap} className={styles.tapButton}>
              👆 Tap Tempo
            </button>
          </div>
        </div>

        {/* Panel de configuración */}
        <div className={styles.configPanel}>
          <h2 className={styles.sectionTitle}>⚙️ Configuración</h2>

          {/* Compás */}
          <div className={styles.configRow}>
            <label className={styles.configLabel}>Compás</label>
            <div className={styles.timeSignatures}>
              {TIME_SIGNATURES.map((ts) => (
                <button
                  key={ts.label}
                  className={`${styles.tsButton} ${timeSignature.label === ts.label ? styles.selected : ''}`}
                  onClick={() => setTimeSignature(ts)}
                >
                  {ts.label}
                </button>
              ))}
            </div>
          </div>

          {/* Acento */}
          <div className={styles.configRow}>
            <label className={styles.configLabel}>Acento en primer tiempo</label>
            <button
              className={`${styles.toggleButton} ${accentFirst ? styles.on : ''}`}
              onClick={() => setAccentFirst(!accentFirst)}
            >
              {accentFirst ? 'Sí' : 'No'}
            </button>
          </div>

          {/* Volumen */}
          <div className={styles.configRow}>
            <label className={styles.configLabel}>Volumen</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className={styles.volumeSlider}
            />
          </div>

          {/* Presets de tempo */}
          <div className={styles.configRow}>
            <label className={styles.configLabel}>Tempos rápidos</label>
            <div className={styles.presets}>
              {TEMPO_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  className={styles.presetButton}
                  onClick={() => setBpm(preset.bpm)}
                  title={`${preset.bpm} BPM`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Contenido educativo */}
      <EducationalSection
        title="Guía del Metrónomo"
        subtitle="Todo lo que necesitas saber sobre el tempo, el ritmo y cómo practicar con metrónomo"
        icon="🎵"
      >
        {/* 1. TABLA COMPARATIVA — tempos y géneros musicales */}
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Indicación italiana</th>
                <th>Rango BPM</th>
                <th>Significado</th>
                <th>Géneros típicos</th>
                <th>Sensación</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Largo</td><td>40–60 BPM</td><td>Muy lento y amplio</td><td>Música fúnebre, adagios</td><td>Solemne, majestuoso</td></tr>
              <tr><td>Adagio</td><td>66–76 BPM</td><td>Lento y expresivo</td><td>Baladas, slow jazz</td><td>Tranquilo, expresivo</td></tr>
              <tr><td>Andante</td><td>76–108 BPM</td><td>Paso de marcha</td><td>Pop lento, bolero</td><td>Natural, caminando</td></tr>
              <tr><td>Moderato</td><td>108–120 BPM</td><td>Moderado</td><td>Pop, rock moderado</td><td>Equilibrado</td></tr>
              <tr><td>Allegro</td><td>120–156 BPM</td><td>Vivo y rápido</td><td>Rock, pop, salsa</td><td>Energético, animado</td></tr>
              <tr><td>Presto</td><td>168–200 BPM</td><td>Muy rápido</td><td>Thrash metal, drum&amp;bass</td><td>Frenético, virtuoso</td></tr>
            </tbody>
          </table>
        </div>

        {/* 2. CASOS DE USO */}
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>🎸</span>
              <strong>Guitarrista / Bajista</strong>
            </div>
            <p>Practica escalas, arpegios y riffs a tempo controlado, comenzando lento (50-60% del tempo objetivo) y aumentando gradualmente 5 BPM cada vez que dominas el pasaje sin errores.</p>
            <div className={styles.escenarioTip}>Tip: Practica siempre el pasaje difícil más lento de lo que crees necesario. La velocidad viene sola una vez que los dedos aprenden el patrón.</div>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>🥁</span>
              <strong>Baterista / Percusionista</strong>
            </div>
            <p>Desarrolla el tiempo interno y reduce el rusheo (acelerar inconscientemente) y el dragging (ralentizar) practicando con metrónomo en tiempos 2 y 4 para el estilo funk y jazz.</p>
            <div className={styles.escenarioTip}>Tip: Programa el metrónomo solo en los tiempos 2 y 4 (backbeat) en lugar de en todos los tiempos. Es más difícil pero desarrolla mejor el tiempo interno.</div>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>🎹</span>
              <strong>Pianista / Instrumentista</strong>
            </div>
            <p>Trabaja pasajes técnicos complejos (octavas, tresillos, polirritmia) garantizando que ambas manos estén perfectamente sincronizadas antes de subir el tempo.</p>
            <div className={styles.escenarioTip}>Tip: Para pasajes muy difíciles, practica con metrónomo a la mitad del tempo con subdivisión (negra = corchea), lo que revela problemas de sincronía ocultos.</div>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>🎤</span>
              <strong>Cantante / Compositor</strong>
            </div>
            <p>Fija el tempo exacto de una canción original para grabarla o para ensayar con la banda. Mide el BPM de canciones de referencia para adaptarlas a tu rango de voz o instrumento.</p>
            <div className={styles.escenarioTip}>Tip: Usa el tap tempo para medir el BPM de cualquier canción simplemente golpeando al ritmo. La media de 8-16 taps es muy precisa.</div>
          </div>
        </div>

        {/* 3. FAQ */}
        <details className={styles.faqList}>
          <summary className={styles.faqItem} style={{listStyle:'none', cursor:'pointer', fontWeight:600, fontSize:'1.1rem', padding:'0.75rem 0'}}>❓ Preguntas Frecuentes sobre el Metrónomo y el Tempo</summary>
          <div>
            <div className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Qué son los BPM y cómo se miden?</div>
              <div className={styles.faqRespuesta}>BPM (Beats Per Minute, pulsaciones por minuto) es la unidad que mide el tempo musical. Indica cuántos tiempos (negras en compás 4/4) hay en un minuto. Un metrónomo a 60 BPM da exactamente 1 click por segundo. La mayoría de música pop está entre 90 y 140 BPM.</div>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Por qué debo practicar con metrónomo si luego toco sin él?</div>
              <div className={styles.faqRespuesta}>El metrónomo es como las ruedas de entrenamiento de una bicicleta: desarrollas el tiempo interno y la regularidad métrica que llevarás siempre contigo. Los músicos profesionales practican con metrónomo no porque no tengan tiempo interno, sino porque lo están refinando constantemente.</div>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿A qué tempo debo empezar a practicar un pasaje difícil?</div>
              <div className={styles.faqRespuesta}>La regla clásica es empezar al 50-60% del tempo objetivo. Si la pieza está marcada a 120 BPM, empieza en 60-72 BPM. Solo sube el tempo cuando puedas tocar 3 repeticiones consecutivas sin errores. Subir 5 BPM cada vez es un ritmo de progresión sostenible.</div>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Qué diferencia hay entre compás 4/4, 3/4 y 6/8?</div>
              <div className={styles.faqRespuesta}>El numerador indica los tiempos por compás, el denominador la figura que vale un tiempo. 4/4: 4 negras por compás (marcha, rock, pop). 3/4: 3 negras (vals, mazurca). 6/8: 6 corcheas agrupadas en 2 tiempos de 3 (jig, barcarola, mucho pop moderno). El metrónomo marca el tiempo base en todos los casos.</div>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Qué es el rusheo y cómo evitarlo?</div>
              <div className={styles.faqRespuesta}>El rusheo es la tendencia inconsciente a acelerar en los pasajes técnicos difíciles o emocionantes. Se produce por la anticipación muscular. Para evitarlo: practica siempre con metrónomo, grábate y escucha, practica con subdivisiones (click en corcheas en lugar de negras) y practica más lento de lo que crees necesario.</div>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Qué es el tap tempo y cuándo usarlo?</div>
              <div className={styles.faqRespuesta}>El tap tempo permite medir el BPM de una canción simplemente golpeando al ritmo. Útil para: medir el tempo exacto de una canción antes de cubrirla, sincronizar efectos de delay y reverb al BPM de la música, o establecer el tempo de una composición que "suena bien" antes de formalizarlo.</div>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Cuál es el BPM ideal para practicar técnica de instrumento?</div>
              <div className={styles.faqRespuesta}>Depende del ejercicio: escalas y arpegios se trabajan entre 60-100 BPM empezando; sightreading (lectura a vista) siempre lento (40-60 BPM); polirritmia y subdivisiones complejas a 60-80 BPM. La regla: el tempo de práctica correcto es aquel al que puedes tocar sin errores el 90% del tiempo.</div>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Debo practicar siempre con metrónomo o a veces sin él?</div>
              <div className={styles.faqRespuesta}>Ambos tienen su lugar. Con metrónomo: técnica, pasajes difíciles, sightreading, sincronización. Sin metrónomo: musicalidad, fraseo, dinámica, expresión, rubato. Un buen músico practica con y sin metrónomo: el metrónomo enseña la regularidad; la práctica libre enseña la expresión musical.</div>
            </div>
          </div>
        </details>

        {/* 4. GUÍA PASO A PASO */}
        <ol className={styles.pasosList}>
          <li className={styles.paso}>
            <span className={styles.pasoNum}>1</span>
            <div><strong>Establece el tempo inicial</strong> — Para practicar un pasaje nuevo, fija el BPM al 50-60% del tempo final. Para mantener tiempo en una pieza conocida, fija el tempo de la partitura o usa tap tempo para medirlo.</div>
          </li>
          <li className={styles.paso}>
            <span className={styles.pasoNum}>2</span>
            <div><strong>Configura el compás</strong> — Selecciona el compás de la pieza (4/4 para la mayoría, 3/4 para valses, 6/8 para jigs). El acento en el primer tiempo te ayudará a orientarte dentro del compás.</div>
          </li>
          <li className={styles.paso}>
            <span className={styles.pasoNum}>3</span>
            <div><strong>Escucha varios clicks antes de tocar</strong> — Interioriza el pulso antes de empezar. Mueve el pie o la cabeza al ritmo para sentir el tempo corporalmente, no solo auditivamente.</div>
          </li>
          <li className={styles.paso}>
            <span className={styles.pasoNum}>4</span>
            <div><strong>Toca con atención al click</strong> — Si te pierdes o adelantas, no pares: vuelve a sincronizar. Parar y empezar de nuevo en cada error no entrena el tiempo; mantener el pulso sí lo hace.</div>
          </li>
          <li className={styles.paso}>
            <span className={styles.pasoNum}>5</span>
            <div><strong>Sube el tempo gradualmente</strong> — Solo cuando puedas tocar 3 repeticiones consecutivas sin errores, sube 5 BPM. La progresión sostenible es mejor que los saltos de tempo.</div>
          </li>
          <li className={styles.paso}>
            <span className={styles.pasoNum}>6</span>
            <div><strong>Grábate y evalúa</strong> — Periódicamente graba tu práctica y escucha si estás detrás o delante del click, si hay acelerones en los pasajes difíciles y si el tempo es uniforme en toda la pieza.</div>
          </li>
        </ol>

        {/* 5. TIPS GRID */}
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcono}>🦶</span>
            <strong>Mueve el cuerpo</strong>
            <p>Marca el pulso con el pie o asiente con la cabeza. El tiempo interno se desarrolla mejor cuando lo sientes físicamente, no solo cuando lo escuchas.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcono}>🎯</span>
            <strong>Regla del 90%</strong>
            <p>El tempo correcto de práctica es aquel al que ejecutas bien el 90% de las notas. Si cometes más errores, baja el BPM. No hay prisa en el aprendizaje.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcono}>📻</span>
            <strong>Subdivide</strong>
            <p>Para pasajes con figuras pequeñas (semicorcheas, tresillos), programa el click en la subdivisión (corchea) en lugar de la negra. Más información rítmica, más precisión.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcono}>🔇</span>
            <strong>Practica sin click</strong>
            <p>Alterna sesiones con y sin metrónomo. Toca con click, luego apágalo e intenta mantener el mismo tempo. Eso desarrolla el tiempo interno verdadero.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcono}>🎚️</span>
            <strong>Volumen adecuado</strong>
            <p>El click debe ser audible pero no dominante. Si el metrónomo &quot;tapa&quot; tu instrumento, reduces la atención a los matices musicales que también hay que trabajar.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcono}>📈</span>
            <strong>Registro de tempos</strong>
            <p>Apunta el BPM máximo al que dominas cada pasaje. En la siguiente sesión empieza 10 BPM por debajo para calentar. Es la forma más fiable de medir el progreso.</p>
          </div>
        </div>

        {/* 6. WARNING BOX */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcono}>⚠️</span>
            <strong>Errores comunes al practicar con metrónomo</strong>
          </div>
          <ul className={styles.warningList}>
            <li><strong>Practicar demasiado rápido desde el principio</strong> — Tocar rápido con errores no enseña el pasaje; enseña a cometer esos errores con mayor velocidad. Empieza siempre lento.</li>
            <li><strong>Parar en cada error</strong> — Parar y reiniciar en cada fallo no entrena la recuperación. Aprende a seguir tocando aunque te pierdas y a re-sincronizarte con el click.</li>
            <li><strong>Subir el tempo demasiado rápido</strong> — Saltar de 80 a 120 BPM en una sesión no consolida el aprendizaje. El aumento progresivo de 5 BPM es más efectivo aunque parezca lento.</li>
            <li><strong>Ignorar el metrónomo y tocar &quot;encima&quot;</strong> — Si siempre llegas al click en lugar de estar en él, estás anticipando. El click debe sonar dentro del sonido de tu instrumento, no antes.</li>
            <li><strong>Usar solo el metrónomo para toda la práctica</strong> — La expresión musical, el rubato y la dinámica requieren práctica sin metrónomo. Un músico que solo practica con click puede sonar mecánico.</li>
            <li><strong>No grabar para evaluar</strong> — La percepción propia del tiempo es subjetiva. Grábate para escuchar objetivamente si estás adelantado, retrasado o rushando en los pasajes difíciles.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('metronomo')} />
      <ShareCard appName="metronomo" />
      <Footer appName="metronomo" />
    </div>
  );
}
