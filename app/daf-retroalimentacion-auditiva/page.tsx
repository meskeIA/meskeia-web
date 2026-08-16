'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './DafRetroalimentacion.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  DisclaimerCard,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ============================================
// Constantes
// ============================================
const RETARDO_MIN = 40;
const RETARDO_MAX = 250;
const RETARDO_DEFECTO = 120;

interface TextoPractica { titulo: string; texto: string; }

const TEXTOS_PRACTICA: TextoPractica[] = [
  {
    titulo: 'Presentación',
    texto: 'Hola, me llamo... y hoy voy a leer este texto en voz alta con calma. Voy a mantener un ritmo pausado y a respirar entre las frases.',
  },
  {
    titulo: 'Descripción tranquila',
    texto: 'La tarde caía despacio sobre el parque. Los árboles se movían con el viento y la gente paseaba sin prisa por los caminos de tierra.',
  },
  {
    titulo: 'Conteo y ritmo',
    texto: 'Uno, dos, tres, cuatro, cinco. Voy a hablar marcando cada palabra con tranquilidad, alargando un poco las vocales al principio de cada frase.',
  },
  {
    titulo: 'Frase cotidiana',
    texto: 'Me gustaría un café con leche y un vaso de agua, por favor. Muchas gracias. ¿Podría decirme dónde está la salida más cercana?',
  },
];

export default function DafRetroalimentacionPage() {
  const [auricularesOk, setAuricularesOk] = useState(false);
  const [activo, setActivo] = useState(false);
  const [errorMic, setErrorMic] = useState<string | null>(null);
  const [retardoMs, setRetardoMs] = useState(RETARDO_DEFECTO);
  const [enmascaramiento, setEnmascaramiento] = useState(false);
  const [nivelEntrada, setNivelEntrada] = useState(0);
  const [indiceTexto, setIndiceTexto] = useState(0);

  const ctxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const delayRef = useRef<DelayNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const noiseSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const noiseGainRef = useRef<GainNode | null>(null);
  const rafRef = useRef<number | null>(null);

  // Medidor de nivel de entrada
  const leerNivel = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;
    const datos = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(datos);
    let suma = 0;
    for (let i = 0; i < datos.length; i++) suma += datos[i];
    const nivel = Math.round((suma / datos.length / 255) * 100 * 2.2);
    setNivelEntrada(Math.min(100, nivel));
    rafRef.current = requestAnimationFrame(leerNivel);
  }, []);

  // Crear y arrancar el ruido de enmascaramiento
  const arrancarRuido = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx || noiseSourceRef.current) return;
    const segundos = 2;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * segundos, ctx.sampleRate);
    const salida = buffer.getChannelData(0);
    for (let i = 0; i < salida.length; i++) salida[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    const gain = ctx.createGain();
    gain.gain.value = 0.06; // suave
    src.connect(gain);
    gain.connect(ctx.destination);
    src.start();
    noiseSourceRef.current = src;
    noiseGainRef.current = gain;
  }, []);

  const detenerRuido = useCallback(() => {
    try { noiseSourceRef.current?.stop(); } catch { /* ya detenido */ }
    noiseSourceRef.current?.disconnect();
    noiseGainRef.current?.disconnect();
    noiseSourceRef.current = null;
    noiseGainRef.current = null;
  }, []);

  const iniciar = useCallback(async () => {
    setErrorMic(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
        video: false,
      });
      streamRef.current = stream;
      const ctx = new AudioContext();
      ctxRef.current = ctx;
      if (ctx.state === 'suspended') await ctx.resume();

      const source = ctx.createMediaStreamSource(stream);

      // Cadena principal DAF: micrófono → retardo → salida (auriculares)
      const delay = ctx.createDelay(1.0);
      delay.delayTime.value = retardoMs / 1000;
      source.connect(delay);
      delay.connect(ctx.destination);
      delayRef.current = delay;

      // Rama de análisis para el medidor (no llega a la salida)
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      setActivo(true);
      if (enmascaramiento) arrancarRuido();
      rafRef.current = requestAnimationFrame(leerNivel);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      if (msg.includes('Permission') || msg.includes('NotAllowed')) {
        setErrorMic('Permiso de micrófono denegado. Actívalo en la configuración del navegador para usar la herramienta.');
      } else if (msg.includes('NotFound')) {
        setErrorMic('No se encontró ningún micrófono en tu dispositivo.');
      } else {
        setErrorMic(`No se pudo acceder al micrófono: ${msg}`);
      }
    }
  }, [retardoMs, enmascaramiento, arrancarRuido, leerNivel]);

  const detener = useCallback(() => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    detenerRuido();
    delayRef.current?.disconnect();
    analyserRef.current?.disconnect();
    streamRef.current?.getTracks().forEach(t => t.stop());
    ctxRef.current?.close();
    delayRef.current = null;
    analyserRef.current = null;
    ctxRef.current = null;
    streamRef.current = null;
    setActivo(false);
    setNivelEntrada(0);
  }, [detenerRuido]);

  // Actualizar el retardo en vivo sin cortar la sesión
  useEffect(() => {
    if (delayRef.current && ctxRef.current) {
      delayRef.current.delayTime.setTargetAtTime(retardoMs / 1000, ctxRef.current.currentTime, 0.02);
    }
  }, [retardoMs]);

  // Encender/apagar el enmascaramiento en vivo
  useEffect(() => {
    if (!activo) return;
    if (enmascaramiento) arrancarRuido();
    else detenerRuido();
  }, [enmascaramiento, activo, arrancarRuido, detenerRuido]);

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      try { noiseSourceRef.current?.stop(); } catch { /* ya detenido */ }
      streamRef.current?.getTracks().forEach(t => t.stop());
      ctxRef.current?.close();
    };
  }, []);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}><span aria-hidden="true">🎧</span> Retroalimentación Auditiva Retardada (DAF)</h1>
        <p className={styles.subtitle}>
          Oye tu propia voz con un pequeño retardo ajustable a través de los auriculares.
          Una técnica de apoyo a la <strong>fluidez del habla</strong> usada en la tartamudez.
        </p>
      </header>

      <LegalNotice />

      {/* Disclaimer — SIEMPRE VISIBLE */}
      <DisclaimerCard
        variant="medical"
        severity="high"
        title="⚕️ Herramienta de apoyo, no un tratamiento"
      >
        <p>
          La retroalimentación auditiva retardada es una <strong>técnica de apoyo y exploración
          personal</strong>, no un tratamiento médico ni un sustituto de la terapia con un
          <strong> logopeda o fonoaudiólogo</strong>. Su eficacia varía mucho de una persona a otra
          y el efecto puede disminuir con el uso continuado.
        </p>
        <p>
          No la uses como único abordaje de la tartamudez. Si el habla te genera malestar o
          dificultades en tu vida diaria, consulta con un profesional. Deja de usar la herramienta
          si te provoca molestias, fatiga o incomodidad auditiva.
        </p>
      </DisclaimerCard>

      {/* AVISO DE AURICULARES */}
      <section className={styles.avisoAuriculares} role="note">
        <span className={styles.avisoIcono} aria-hidden="true">🎧</span>
        <div>
          <strong>Usa auriculares obligatoriamente.</strong> Sin ellos, el altavoz devolvería el
          sonido al micrófono y se produciría un pitido creciente (efecto Larsen). Con auriculares,
          la experiencia es limpia y solo tú oyes tu voz retardada.
        </div>
      </section>

      {/* PANEL PRINCIPAL */}
      <section className={styles.panel} aria-label="Control de la herramienta DAF">
        {!activo ? (
          <div className={styles.panelInactivo}>
            <label className={styles.checkAuriculares}>
              <input
                type="checkbox"
                checked={auricularesOk}
                onChange={e => setAuricularesOk(e.target.checked)}
              />
              <span>Tengo puestos los auriculares y he entendido que esto es una herramienta de apoyo.</span>
            </label>

            {errorMic && (
              <div className={styles.errorMic} role="alert"><span aria-hidden="true">⚠️</span> {errorMic}</div>
            )}

            <button
              type="button"
              className={styles.btnActivar}
              onClick={iniciar}
              disabled={!auricularesOk}
              aria-label="Activar la retroalimentación auditiva retardada"
            >
              <span aria-hidden="true">🎙️</span> Empezar
            </button>
            <p className={styles.panelAyuda}>
              Al empezar, el navegador pedirá permiso para el micrófono. El audio se procesa
              <strong> solo en tu dispositivo</strong> y no se graba ni se envía a ningún servidor.
            </p>
          </div>
        ) : (
          <div className={styles.panelActivo}>
            {/* Medidor de entrada */}
            <div className={styles.medidorWrapper} aria-label={`Nivel de tu voz: ${nivelEntrada}%`}>
              <div className={styles.medidorLabel}>Nivel de tu voz</div>
              <div className={styles.medidorBarra} role="meter" aria-valuenow={nivelEntrada} aria-valuemin={0} aria-valuemax={100}>
                <div className={styles.medidorRelleno} style={{ width: `${nivelEntrada}%` }} />
              </div>
              <div className={styles.medidorEstado} role="status" aria-live="polite">
                {nivelEntrada > 8
                  ? <span className={styles.vozOk}>✓ Te oigo — sigue leyendo con calma</span>
                  : <span className={styles.vozBaja}>Habla o lee en voz alta para oír el retardo</span>}
              </div>
            </div>

            <button type="button" className={styles.btnDetener} onClick={detener} aria-label="Detener la herramienta">
              <span aria-hidden="true">⏹️</span> Detener
            </button>
          </div>
        )}

        {/* Control de retardo (siempre visible) */}
        <div className={styles.controlRetardo}>
          <label htmlFor="retardo" className={styles.controlLabel}>
            Retardo: <strong>{retardoMs} ms</strong>
          </label>
          <input
            id="retardo"
            type="range"
            min={RETARDO_MIN}
            max={RETARDO_MAX}
            step={5}
            value={retardoMs}
            onChange={e => setRetardoMs(Number(e.target.value))}
            className={styles.slider}
            aria-valuetext={`${retardoMs} milisegundos`}
          />
          <div className={styles.sliderEscala} aria-hidden="true">
            <span>{RETARDO_MIN} ms</span>
            <span>Más natural ↔ Más marcado</span>
            <span>{RETARDO_MAX} ms</span>
          </div>
        </div>

        {/* Enmascaramiento opcional */}
        <label className={styles.toggleEnmasc}>
          <input
            type="checkbox"
            checked={enmascaramiento}
            onChange={e => setEnmascaramiento(e.target.checked)}
          />
          <span>
            <strong>Sonido de enmascaramiento</strong> (opcional): un ruido suave y constante,
            técnica alternativa que reduce la audición de la propia voz.
          </span>
        </label>
      </section>

      {/* TEXTOS DE PRÁCTICA */}
      <section className={styles.textosSeccion} aria-label="Textos de práctica">
        <h2 className={styles.textosTitulo}>Texto para leer en voz alta</h2>
        <div className={styles.textoCard}>
          <p className={styles.textoContenido}>{TEXTOS_PRACTICA[indiceTexto].texto}</p>
          <span className={styles.textoEtiqueta}>{TEXTOS_PRACTICA[indiceTexto].titulo}</span>
        </div>
        <div className={styles.textosNav}>
          <button
            type="button"
            className={styles.btnNavTexto}
            onClick={() => setIndiceTexto(i => (i > 0 ? i - 1 : TEXTOS_PRACTICA.length - 1))}
            aria-label="Texto anterior"
          >
            ← Anterior
          </button>
          <span className={styles.textoCounter}>{indiceTexto + 1} / {TEXTOS_PRACTICA.length}</span>
          <button
            type="button"
            className={styles.btnNavTexto}
            onClick={() => setIndiceTexto(i => (i < TEXTOS_PRACTICA.length - 1 ? i + 1 : 0))}
            aria-label="Siguiente texto"
          >
            Siguiente →
          </button>
        </div>
      </section>

      <EducationalSection
        title="Qué es la DAF, cómo usarla y qué esperar de ella"
        subtitle="La retroalimentación auditiva retardada como apoyo a la fluidez del habla"
      >
        <section className={styles.guiaSeccion}>
          <h2>¿Cómo funciona la retroalimentación auditiva retardada?</h2>
          <p>
            Cuando hablamos, no solo producimos sonido: también nos <strong>escuchamos</strong> a
            nosotros mismos, y ese oírnos ayuda a regular el ritmo y la articulación. La DAF introduce
            un pequeño desfase entre lo que dices y lo que oyes por los auriculares (unas décimas de
            segundo). Ese retardo cambia el circuito habitual de control auditivo del habla.
          </p>
          <p>
            En muchas personas que tartamudean, hablar bajo DAF se asocia a un habla más lenta y
            fluida <em>mientras se aplica</em>. El efecto es parecido, en cierto modo, al de hablar al
            unísono con otra persona o al de leer en coro, situaciones en las que la tartamudez suele
            reducirse. No se conoce con total exactitud por qué ocurre, pero el fenómeno está
            documentado desde hace décadas.
          </p>

          <h2>Qué NO es la DAF</h2>
          <ul>
            <li><strong>No es una cura</strong>: no elimina la tartamudez de forma permanente.</li>
            <li><strong>No sustituye al logopeda</strong>: es una herramienta que puede acompañar, no reemplazar, un plan terapéutico.</li>
            <li><strong>No funciona igual en todo el mundo</strong>: hay quien nota un gran cambio y quien apenas lo percibe.</li>
            <li><strong>Puede perder efecto</strong>: con el uso continuado, el cerebro se adapta y el beneficio inicial puede disminuir.</li>
          </ul>
        </section>

        {/* TABLA COMPARATIVA */}
        <section className={styles.guiaSeccion}>
          <h2>Técnicas de habla alterada: en qué se diferencian</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Técnica</th>
                  <th>Qué hace</th>
                  <th>En esta herramienta</th>
                  <th>Nota</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={styles.celdaDestacada}>DAF (retardo)</td>
                  <td>Oyes tu voz con un desfase temporal</td>
                  <td className={styles.celdaDestacada}>Sí (control principal)</td>
                  <td>La más estudiada; base de muchos dispositivos</td>
                </tr>
                <tr>
                  <td>Enmascaramiento (MAF)</td>
                  <td>Un ruido reduce la audición de tu propia voz</td>
                  <td className={styles.celdaDestacada}>Sí (opcional)</td>
                  <td>Alternativa simple; a algunas personas les ayuda</td>
                </tr>
                <tr>
                  <td>FAF (cambio de tono)</td>
                  <td>Oyes tu voz con el tono alterado</td>
                  <td>No incluida</td>
                  <td>A menudo se combina con DAF en aparatos</td>
                </tr>
                <tr>
                  <td>Habla en coro / al unísono</td>
                  <td>Hablas a la vez que otra voz</td>
                  <td>No aplica</td>
                  <td>Muy eficaz, pero requiere otra persona o grabación</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* CASOS DE USO */}
        <section className={styles.guiaSeccion}>
          <h2>¿Para quién puede ser útil?</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcono} aria-hidden="true">🗣️</span>
              <h3>Personas que tartamudean</h3>
              <p>Para explorar por su cuenta el efecto de la DAF, practicar lectura en voz alta o preparar situaciones concretas, siempre como complemento al trabajo con un profesional.</p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcono} aria-hidden="true">🧑‍⚕️</span>
              <h3>Logopedas y fonoaudiólogos</h3>
              <p>Como demostración en consulta de en qué consiste la retroalimentación auditiva retardada, sin necesidad de un aparato dedicado, antes de decidir si integrarla en la terapia.</p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcono} aria-hidden="true">🎓</span>
              <h3>Estudiantes y curiosos</h3>
              <p>Para entender de primera mano cómo la audición regula el habla: cualquier persona nota que hablar con retardo cambia por completo su ritmo al hablar.</p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcono} aria-hidden="true">📚</span>
              <h3>Preparar una intervención</h3>
              <p>Ensayar la lectura pausada de un texto o discurso, usando el retardo como recordatorio físico de bajar el ritmo y respirar entre frases.</p>
            </div>
          </div>
        </section>

        {/* GUÍA PASO A PASO */}
        <section className={styles.guiaSeccion}>
          <h2>Cómo hacer una sesión</h2>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div>
                <strong>Ponte los auriculares</strong>
                <p>Imprescindible. Comprueba que el volumen del dispositivo está a un nivel medio antes de empezar, para no llevarte un susto.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div>
                <strong>Activa el micrófono</strong>
                <p>Marca la casilla de auriculares, pulsa &quot;Empezar&quot; y acepta el permiso. El medidor debe moverse cuando hablas.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div>
                <strong>Lee un texto en voz alta</strong>
                <p>Usa los textos de práctica. Al principio el retardo desconcierta: es normal. Habla despacio y deja que tu voz te &quot;guíe&quot;.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div>
                <strong>Ajusta el retardo</strong>
                <p>Empieza por 120 ms y mueve el deslizador hasta encontrar el valor que te resulte más cómodo y fluido. Cada persona tiene el suyo.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div>
                <strong>Sesiones cortas</strong>
                <p>Practica en tramos de pocos minutos. Si notas fatiga o incomodidad, detente. No hace falta forzar sesiones largas.</p>
              </div>
            </li>
          </ol>
        </section>

        {/* MEJORES PRÁCTICAS */}
        <section className={styles.guiaSeccion}>
          <h2>Consejos para sacarle partido</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono} aria-hidden="true">🐢</span>
              <p><strong>Prioriza la lentitud.</strong> La DAF invita a bajar el ritmo. No intentes hablar rápido &quot;a pesar&quot; del retardo; deja que te frene, esa es parte de la técnica.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono} aria-hidden="true">🔊</span>
              <p><strong>Cuida el volumen.</strong> Un volumen medio basta para oírte con claridad. Un volumen muy alto puede resultar molesto y no mejora el efecto.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono} aria-hidden="true">📝</span>
              <p><strong>Anota qué retardo te funciona.</strong> Si un valor te resulta cómodo, recuérdalo para la próxima sesión y coméntalo con tu logopeda.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono} aria-hidden="true">🤝</span>
              <p><strong>Combínala con terapia.</strong> El mayor beneficio suele venir de integrar la DAF dentro de un plan guiado por un profesional, no de usarla en solitario.</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className={styles.guiaSeccion}>
          <h2>Preguntas frecuentes</h2>
          <dl className={styles.faqList}>
            <div className={styles.faqItem}>
              <dt>¿Puedo usarla con altavoces en vez de auriculares?</dt>
              <dd>No es recomendable. Sin auriculares, el micrófono vuelve a captar el sonido que sale del altavoz y se genera un acoplamiento (efecto Larsen): un pitido creciente muy molesto. Los auriculares evitan ese bucle y son parte esencial de la técnica.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Sirve para el tartamudeo en niños?</dt>
              <dd>El uso de la DAF en la infancia debe valorarlo siempre un logopeda o fonoaudiólogo. En edades tempranas hay abordajes específicos y la introducción de aparatos o técnicas de habla alterada no está indicada de forma general. Consulta antes con un profesional.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Por qué a veces el efecto desaparece?</dt>
              <dd>El cerebro se adapta con rapidez a estímulos constantes. Es habitual que el beneficio inicial de la DAF se reduzca tras un uso prolongado. Variar el retardo, hacer pausas y no depender solo de la técnica ayuda, pero la adaptación es una limitación conocida.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Necesito un micrófono especial?</dt>
              <dd>No. El micrófono de unos auriculares con cable, de unos auriculares inalámbricos o el del propio ordenador o móvil es suficiente. Lo importante es que la salida vaya a los auriculares y no al altavoz.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Hay latencia añadida por el navegador?</dt>
              <dd>La Web Audio API procesa el audio en tiempo real con una latencia muy baja, pero los dispositivos inalámbricos (Bluetooth) añaden un retardo propio de decenas de milisegundos. Si usas Bluetooth, el retardo total que oyes será algo mayor que el que marca el deslizador; con auriculares por cable es más fiel.</dd>
            </div>
          </dl>
        </section>

        {/* WARNING BOX */}
        <section className={styles.guiaSeccion}>
          <div className={styles.warningBox}>
            <h3><span aria-hidden="true">⚠️</span> Antes de usar la herramienta, ten en cuenta</h3>
            <ul>
              <li><strong>No es un tratamiento:</strong> la DAF es un apoyo, no cura la tartamudez ni sustituye la terapia logopédica. Para un abordaje serio, acude a un logopeda o fonoaudiólogo.</li>
              <li><strong>Empieza con el volumen bajo:</strong> súbelo poco a poco. Un volumen excesivo en los auriculares puede resultar molesto o, mantenido, dañino para el oído.</li>
              <li><strong>Detente si hay malestar:</strong> mareo, fatiga auditiva o incomodidad son señal de parar. No fuerces sesiones largas.</li>
              <li><strong>En niños, siempre con supervisión profesional:</strong> el uso de técnicas de habla alterada en la infancia debe indicarlo y supervisarlo un especialista.</li>
              <li><strong>La eficacia es individual y variable:</strong> que no te funcione no significa que hagas nada mal; simplemente la respuesta a la DAF difiere mucho entre personas.</li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('daf-retroalimentacion-auditiva')} />
      <ShareCard appName="daf-retroalimentacion-auditiva" />
      <Footer appName="daf-retroalimentacion-auditiva" />
    </div>
  );
}
