'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './AmplificadorSonido.module.css';
import { MeskeiaLogo, Footer, RelatedApps, EducationalSection, DisclaimerCard, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatNumber } from '@/lib';

// Parámetros del amplificador
const GAIN_MAX = 12;        // ganancia máxima (×12 sobre la señal del micrófono)
const VOICE_FREQ = 1800;    // Hz — centro del realce de voz (banda de inteligibilidad del habla)
const VOICE_Q = 0.9;        // anchura del filtro peaking
const VOICE_BOOST_DB = 9;   // realce aplicado a la banda de voz cuando está activo

export default function AmplificadorSonidoPage() {
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gainPct, setGainPct] = useState(50);
  const [voiceBoost, setVoiceBoost] = useState(true);
  const [noiseSuppress, setNoiseSuppress] = useState(false);
  const [level, setLevel] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const compressorRef = useRef<DynamicsCompressorNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

  // Ganancia real (multiplicador) derivada del deslizador
  const gainValue = (gainPct / 100) * GAIN_MAX;

  // Detener y liberar todos los recursos de audio
  const detener = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    gainRef.current = null;
    filterRef.current = null;
    compressorRef.current = null;
    analyserRef.current = null;
    setLevel(0);
    setIsActive(false);
  }, []);

  // Limpiar al desmontar
  useEffect(() => {
    return () => detener();
  }, [detener]);

  // Bucle del medidor de nivel (señal ya amplificada)
  const medirNivel = useCallback(() => {
    if (!analyserRef.current) return;
    const datos = new Uint8Array(analyserRef.current.fftSize);
    analyserRef.current.getByteTimeDomainData(datos);
    let suma = 0;
    for (let i = 0; i < datos.length; i++) {
      const n = (datos[i] - 128) / 128;
      suma += n * n;
    }
    const rms = Math.sqrt(suma / datos.length);
    setLevel(Math.min(100, Math.round(rms * 300)));
    animationRef.current = requestAnimationFrame(medirNivel);
  }, []);

  // Iniciar la escucha amplificada
  const iniciar = async () => {
    try {
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false, // audio crudo: sin cancelación que atenúe el ambiente
          noiseSuppression: noiseSuppress, // off por defecto: no silenciar la tele de fondo
          autoGainControl: false, // la ganancia la controla el usuario, no el navegador
        },
      });
      streamRef.current = stream;

      const ctx = new AudioContext();
      audioContextRef.current = ctx;
      await ctx.resume();

      const source = ctx.createMediaStreamSource(stream);

      const gain = ctx.createGain();
      gain.gain.value = gainValue;
      gainRef.current = gain;

      const filter = ctx.createBiquadFilter();
      filter.type = 'peaking';
      filter.frequency.value = VOICE_FREQ;
      filter.Q.value = VOICE_Q;
      filter.gain.value = voiceBoost ? VOICE_BOOST_DB : 0;
      filterRef.current = filter;

      // Compresor: levanta los sonidos flojos hasta hacerlos audibles y frena los
      // picos fuertes (limitador), lo que además protege el oído.
      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.value = -45; // umbral bajo: entra en acción pronto
      compressor.knee.value = 30;
      compressor.ratio.value = 6;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.25;
      compressorRef.current = compressor;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.6;
      analyserRef.current = analyser;

      // Cadena: micrófono → ganancia → realce de voz → compresor → medidor → auriculares
      source.connect(gain);
      gain.connect(filter);
      filter.connect(compressor);
      compressor.connect(analyser);
      analyser.connect(ctx.destination);

      setIsActive(true);
      medirNivel();
    } catch (err) {
      console.error('Error al acceder al micrófono:', err);
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Permiso de micrófono denegado. Permite el acceso al micrófono en tu navegador para usar el amplificador.');
        } else if (err.name === 'NotFoundError') {
          setError('No se detecta ningún micrófono. Conecta o activa uno e inténtalo de nuevo.');
        } else {
          setError(`No se pudo iniciar el audio: ${err.message}`);
        }
      }
    }
  };

  // Actualizar la ganancia en vivo mientras suena
  useEffect(() => {
    if (gainRef.current) gainRef.current.gain.value = gainValue;
  }, [gainValue]);

  // Activar/desactivar el realce de voz en vivo
  useEffect(() => {
    if (filterRef.current) filterRef.current.gain.value = voiceBoost ? VOICE_BOOST_DB : 0;
  }, [voiceBoost]);

  // Aplicar la reducción de ruido en vivo (si el navegador lo permite)
  useEffect(() => {
    const track = streamRef.current?.getAudioTracks?.()[0];
    if (track) {
      track.applyConstraints({ noiseSuppression: noiseSuppress }).catch(() => {
        /* algunos navegadores no permiten cambiarlo en caliente; se aplicará al reiniciar */
      });
    }
  }, [noiseSuppress]);

  // Color del medidor según nivel (verde → ámbar → rojo, aviso de volumen alto)
  const nivelColor = level > 80 ? '#ef4444' : level > 55 ? '#eab308' : '#22c55e';

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">🦻</span>
        <h1 className={styles.title}>Amplificador de Sonido en Vivo</h1>
        <p className={styles.subtitle}>
          Capta el sonido de tu entorno con el micrófono del móvil o celular, súbelo de volumen
          y realza las voces en tiempo real. Escúchalo con auriculares para oír mejor una
          conversación, la televisión o una clase.
        </p>
      </header>

      <LegalNotice />

      <main className={styles.mainContent}>
        <div className={styles.controlPanel}>
          {/* Aviso permanente de auriculares (efecto Larsen) */}
          <div className={styles.larsenWarning} role="note">
            <span aria-hidden="true">🎧</span>
            <span>
              <strong>Usa auriculares.</strong> Sin ellos, el micrófono capta el sonido del altavoz
              y se produce un acople (pitido agudo).
            </span>
          </div>

          {/* Medidor de nivel */}
          <div className={styles.levelMeter} aria-hidden="true">
            <div className={styles.levelTrack}>
              <div
                className={styles.levelBar}
                style={{ width: `${level}%`, background: nivelColor }}
              />
            </div>
          </div>
          <div className={styles.levelLabel} role="status" aria-live="polite">
            {isActive
              ? level > 80
                ? 'Nivel alto — considera bajar el volumen'
                : 'Amplificando sonido en directo'
              : 'Detenido'}
          </div>

          {/* Botón principal */}
          <div className={styles.controls}>
            {!isActive ? (
              <button type="button" onClick={iniciar} className={styles.btnStart}>
                <span aria-hidden="true">🎤</span> Iniciar amplificación
              </button>
            ) : (
              <button type="button" onClick={detener} className={styles.btnStop}>
                <span aria-hidden="true">⏹️</span> Detener
              </button>
            )}
          </div>

          {/* Controles de ajuste */}
          <div className={styles.adjustPanel}>
            <div className={styles.sliderRow}>
              <label htmlFor="ganancia" className={styles.sliderLabel}>
                Volumen (ganancia)
                <span className={styles.gainValue}>{formatNumber(gainValue, 1)}×</span>
              </label>
              <input
                id="ganancia"
                type="range"
                min={0}
                max={100}
                step={1}
                value={gainPct}
                onChange={(e) => setGainPct(Number(e.target.value))}
                className={styles.slider}
                aria-valuetext={`${formatNumber(gainValue, 1)} aumentos`}
              />
            </div>

            <div className={styles.toggleRow}>
              <button
                type="button"
                className={`${styles.toggleBtn} ${voiceBoost ? styles.toggleOn : ''}`}
                aria-pressed={voiceBoost}
                onClick={() => setVoiceBoost((v) => !v)}
              >
                <span aria-hidden="true">🗣️</span> Realce de voz
              </button>
              <button
                type="button"
                className={`${styles.toggleBtn} ${noiseSuppress ? styles.toggleOn : ''}`}
                aria-pressed={noiseSuppress}
                onClick={() => setNoiseSuppress((v) => !v)}
              >
                <span aria-hidden="true">🌫️</span> Reducir ruido
              </button>
            </div>
          </div>

          {error && (
            <div className={styles.errorMessage} role="alert">
              <span aria-hidden="true">⚠️</span> {error}
            </div>
          )}

          {!isActive && !error && (
            <p className={styles.infoMessage}>
              <span aria-hidden="true">💡</span> Al iniciar, tu navegador te pedirá permiso para
              usar el micrófono. El audio se procesa en tu dispositivo y no se envía a ningún sitio.
            </p>
          )}
        </div>
      </main>

      {/* Disclaimer — SIEMPRE VISIBLE (asistencia auditiva, no producto sanitario) */}
      <DisclaimerCard
        variant="medical"
        severity="high"
        collapsible={false}
        context="amplificador-sonido"
      >
        <p>
          Esta es una <strong>ayuda de escucha puntual</strong>, no un producto sanitario.{' '}
          <strong>No sustituye a un audífono (aparato auditivo) ni a una evaluación audiológica.</strong>{' '}
          Si notas pérdida de audición, consulta con un profesional (otorrinolaringólogo o
          audioprotesista): un audífono se adapta a tu pérdida concreta y esta herramienta no.
        </p>
        <p>
          <strong>Protege tu oído.</strong> Una amplificación excesiva y prolongada puede dañar la
          audición, igual que escuchar música muy alta. Empieza con el volumen bajo y súbelo poco a
          poco; si notas molestia, pitidos o dolor, detente.
        </p>
        <p>
          <strong>Usa auriculares.</strong> Sin ellos, el micrófono captará el sonido del propio
          altavoz y se producirá un acople (efecto Larsen), un pitido agudo que puede resultar
          dañino a volumen alto.
        </p>
      </DisclaimerCard>

      {/* Contenido educativo v2.0 */}
      <EducationalSection
        title="Cómo funciona un amplificador de sonido personal"
        subtitle="Escucha asistida, realce de voz y salud auditiva"
        icon="📚"
      >
        <section className={styles.guideSection}>
          <h2>¿Qué hace esta herramienta?</h2>
          <p className={styles.introParagraph}>
            Un amplificador de sonido personal capta el audio de tu alrededor con el micrófono del
            dispositivo, lo procesa y lo devuelve amplificado a tus auriculares con muy poco retardo.
            Es la versión auditiva de una lupa: no crea información nueva, sino que hace{' '}
            <strong>más audible</strong> lo que ya está sonando. Resulta útil cuando la voz de otra
            persona te llega baja, en una sala grande o con ruido de fondo.
          </p>
          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4><span aria-hidden="true">🔊</span> Ganancia</h4>
              <ul>
                <li>Sube el volumen general de todo lo que entra por el micrófono</li>
                <li>Ajustable con el deslizador (hasta ×12)</li>
                <li>Un compresor levanta los sonidos flojos y frena los golpes fuertes</li>
                <li>Empieza baja y sube poco a poco</li>
              </ul>
            </div>
            <div className={styles.contentCard}>
              <h4><span aria-hidden="true">🗣️</span> Realce de voz</h4>
              <ul>
                <li>Refuerza la banda del habla (~1.000–3.000 Hz)</li>
                <li>Hace destacar las consonantes sobre el murmullo</li>
                <li>Mejora la inteligibilidad, no solo el volumen</li>
              </ul>
            </div>
          </div>
        </section>

        {/* SECCIÓN 1: Tabla comparativa */}
        <section className={styles.guideSection}>
          <h2>Amplificador personal frente a otras soluciones</h2>
          <p className={styles.introParagraph}>
            No todas las dificultades para oír se resuelven igual. Esta tabla sitúa el amplificador
            de escucha entre las alternativas más habituales para elegir con criterio.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Solución</th>
                  <th>Para qué sirve</th>
                  <th>Coste</th>
                  <th>Personalización</th>
                  <th>Cuándo elegirla</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Amplificador personal (esta app)</strong></td>
                  <td>Subir y realzar el sonido del entorno en el momento</td>
                  <td>Gratis (móvil + auriculares)</td>
                  <td>Volumen y realce de voz manuales</td>
                  <td>Ayuda puntual, probar antes de invertir, situaciones concretas</td>
                </tr>
                <tr>
                  <td><strong>Audífono (aparato auditivo)</strong></td>
                  <td>Compensar una pérdida auditiva diagnosticada, todo el día</td>
                  <td>Alto (producto sanitario)</td>
                  <td>Adaptado por audioprotesista a tu audiograma</td>
                  <td>Pérdida auditiva confirmada; uso continuado</td>
                </tr>
                <tr>
                  <td><strong>Subir el volumen del televisor/altavoz</strong></td>
                  <td>Oír mejor una única fuente</td>
                  <td>Gratis</td>
                  <td>Ninguna; molesta a los demás</td>
                  <td>Estás solo y la fuente tiene su propio volumen</td>
                </tr>
                <tr>
                  <td><strong>Subtítulos / transcripción</strong></td>
                  <td>Leer en lugar de oír</td>
                  <td>Gratis o incluido</td>
                  <td>Idioma y tamaño de texto</td>
                  <td>Contenido con audio grabado; entornos muy ruidosos</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* SECCIÓN 2: Casos de uso */}
        <section className={styles.guideSection}>
          <h2>Casos de uso reales</h2>
          <p className={styles.introParagraph}>
            La escucha amplificada ayuda en situaciones cotidianas muy distintas. Estos son cuatro
            perfiles que se benefician de tenerla siempre a mano en el móvil.
          </p>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">👵</span>
                <strong>Conversación con un familiar mayor</strong>
              </div>
              <p className={styles.escenarioExample}>
                Un familiar oye peor y sube mucho la televisión. Con unos auriculares y el
                amplificador puede seguir la conversación o el programa sin forzar al resto de la casa.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: activa el realce de voz y mantén la ganancia moderada; el objetivo es
                entender, no que suene fuerte.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🍽️</span>
                <strong>Restaurante o reunión ruidosa</strong>
              </div>
              <p className={styles.escenarioExample}>
                En un local con mucho ruido de fondo cuesta seguir a quien tienes enfrente. Acercar
                el micrófono a esa persona y activar la reducción de ruido ayuda a aislar su voz.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: coloca el móvil apuntando hacia quien habla y usa auriculares con cable para
                menos retardo.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🎓</span>
                <strong>Clase o charla en sala grande</strong>
              </div>
              <p className={styles.escenarioExample}>
                Desde el fondo de un aula o una conferencia la voz llega baja. Dejar el móvil más
                cerca del ponente y amplificar permite seguir la explicación con claridad.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: prueba antes de que empiece para ajustar el volumen sin perderte el inicio.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🔧</span>
                <strong>Escuchar un ruido concreto</strong>
              </div>
              <p className={styles.escenarioExample}>
                Localizar un pitido, un goteo o un ruido del coche es más fácil si amplificas el
                sonido de una zona concreta acercando el micrófono.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: baja la ganancia si el ruido es fuerte; solo necesitas oírlo, no saturarlo.
              </p>
            </div>
          </div>
        </section>

        {/* SECCIÓN 3: FAQ */}
        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes</h2>
          <ul className={styles.faqList}>
            <li className={styles.faqItem}>
              <strong>¿Necesito auriculares de verdad?</strong>
              <p>
                Sí, son imprescindibles. Sin auriculares el micrófono vuelve a captar el sonido que
                sale por el altavoz y se genera un acople: un pitido agudo (efecto Larsen). Sirven
                auriculares con cable o Bluetooth; los de cable tienen menos retardo y la escucha
                resulta más natural.
              </p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Sustituye a un audífono?</strong>
              <p>
                No. Es una ayuda de escucha puntual, no un producto sanitario. No sustituye a un
                audífono (aparato auditivo) ni a una evaluación audiológica. Un audífono se adapta a
                tu pérdida auditiva concreta; esta herramienta amplifica por igual todo el sonido.
              </p>
              <p className={styles.faqTip}>
                Si notas que oyes peor de forma habitual, consulta con un otorrinolaringólogo o
                audioprotesista.
              </p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Se envía mi audio a algún servidor?</strong>
              <p>
                No. Todo el procesamiento ocurre en tu propio dispositivo, dentro del navegador. El
                sonido del micrófono no se graba ni se envía a ningún sitio; al detener o cerrar la
                página, el acceso al micrófono se libera.
              </p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Por qué se oye con un pequeño retardo?</strong>
              <p>
                Captar, procesar y reproducir el sonido lleva unos milisegundos (latencia). Con
                auriculares por cable es mínimo; por Bluetooth suele ser mayor y puede notarse un
                ligero desfase entre lo que ves y lo que oyes.
              </p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Es seguro para el oído?</strong>
              <p>
                Siempre que mantengas el volumen moderado. Una amplificación alta y prolongada puede
                dañar la audición, igual que la música muy fuerte. Empieza con la ganancia baja y
                súbela poco a poco hasta oír con comodidad.
              </p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Funciona sin conexión a internet?</strong>
              <p>
                Una vez cargada la página, el amplificador funciona en local: no necesita conexión
                para captar y amplificar el sonido, porque usa las capacidades de audio de tu propio
                navegador.
              </p>
            </li>
          </ul>
        </section>

        {/* SECCIÓN 4: Guía paso a paso */}
        <section className={styles.guideSection}>
          <h2>Cómo usarlo paso a paso</h2>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>Conecta los auriculares</strong>
                <p>Ponte los auriculares (con cable o Bluetooth) antes de empezar. Es el paso que evita el acople.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>Inicia la amplificación y concede el permiso</strong>
                <p>Pulsa «Iniciar amplificación» y autoriza el acceso al micrófono cuando el navegador te lo pida.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>Sube el volumen poco a poco</strong>
                <p>Mueve el deslizador de ganancia de forma gradual hasta oír con comodidad. El medidor te avisa en rojo si el nivel es alto.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>Activa el realce de voz si hablan bajo</strong>
                <p>Si lo que quieres es entender a alguien, activa «Realce de voz» para reforzar las frecuencias del habla.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>Reduce el ruido de fondo</strong>
                <p>En ambientes ruidosos, activa «Reducir ruido» y apunta el micrófono hacia la fuente que te interesa.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>6</span>
              <div className={styles.stepContent}>
                <strong>Detén cuando termines</strong>
                <p>Pulsa «Detener» para liberar el micrófono. También se libera al cerrar la pestaña.</p>
              </div>
            </li>
          </ol>
        </section>

        {/* SECCIÓN 5: Mejores prácticas */}
        <section className={styles.guideSection}>
          <h2>Consejos para oír mejor</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🎧</span>
              <div>
                <strong>Auriculares con cable siempre que puedas</strong>
                <p>Tienen menos retardo que el Bluetooth, así la escucha resulta más natural y evitas el desfase con lo que ves.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📉</span>
              <div>
                <strong>Empieza con la ganancia baja</strong>
                <p>Sube el volumen de forma gradual. Es más cómodo para el oído y evitas sustos si de repente hay un ruido fuerte.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🎯</span>
              <div>
                <strong>Acerca el micrófono a la fuente</strong>
                <p>Cuanto más cerca esté el micrófono de quien habla, mejor la relación entre su voz y el ruido de fondo.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🗣️</span>
              <div>
                <strong>Usa el realce de voz para conversar</strong>
                <p>Para entender a alguien, el realce de voz aporta más que subir el volumen general, que también amplifica el ruido.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔋</span>
              <div>
                <strong>Vigila la batería</strong>
                <p>Procesar audio en directo consume batería. Detén la amplificación cuando no la necesites.</p>
              </div>
            </div>
          </div>
        </section>

        {/* SECCIÓN 6: Errores frecuentes */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <strong>Errores frecuentes al usar la escucha amplificada</strong>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Usarlo por el altavoz, sin auriculares.</strong> Provoca un acople inmediato
                (pitido agudo) que puede ser molesto o dañino a volumen alto.
              </li>
              <li>
                <strong>Poner la ganancia al máximo de golpe.</strong> Amplifica también los ruidos
                bruscos. Sube el volumen poco a poco.
              </li>
              <li>
                <strong>Confiarlo como si fuera un audífono.</strong> No compensa una pérdida
                auditiva concreta ni sustituye la valoración de un profesional.
              </li>
              <li>
                <strong>Esperar sonido perfecto por Bluetooth.</strong> El retardo puede desincronizar
                lo que ves y lo que oyes; para conversar, mejor cable.
              </li>
              <li>
                <strong>Ignorar el aviso de nivel alto.</strong> Si el medidor se pone en rojo de
                forma sostenida, baja el volumen para proteger tu oído.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('amplificador-sonido')} />

      <ShareCard appName="amplificador-sonido" />
      <Footer appName="amplificador-sonido" />
    </div>
  );
}
