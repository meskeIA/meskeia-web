'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './EjerciciosVocalizacion.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  DisclaimerCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ============================================
// Tipos y constantes
// ============================================

interface EjercicioVocal {
  letra: string;
  objetivo: number; // duración objetivo en segundos
  descripcion: string;
}

interface FraseEjercicio {
  texto: string;
  descripcion: string;
}

interface RegistroSesion {
  fecha: string;
  tipo: 'vocal' | 'frase';
  ejercicio: string;
  duracion: number; // segundos conseguidos
  objetivo: number;
  exito: boolean;
}

const VOCALES: EjercicioVocal[] = [
  { letra: 'A', objetivo: 10, descripcion: 'Vocal central abierta. Proyecta desde el abdomen.' },
  { letra: 'E', objetivo: 10, descripcion: 'Vocal anterior media. Mantén la boca bien abierta.' },
  { letra: 'I', objetivo: 10, descripcion: 'Vocal anterior alta. Estira los labios hacia los lados.' },
  { letra: 'O', objetivo: 10, descripcion: 'Vocal posterior media. Redondea bien los labios.' },
  { letra: 'U', objetivo: 10, descripcion: 'Vocal posterior alta. Proyecta los labios hacia delante.' },
];

const FRASES: FraseEjercicio[] = [
  { texto: '¡Buenos días! ¿Cómo estás hoy?', descripcion: 'Saludo con entonación ascendente' },
  { texto: 'El cielo es azul y el sol brilla fuerte.', descripcion: 'Frase declarativa con pausas naturales' },
  { texto: 'Mamá, papá, hermana, hermano.', descripcion: 'Palabras familiares con énfasis vocal' },
  { texto: 'Uno, dos, tres, cuatro, cinco, seis.', descripcion: 'Secuencia numérica con volumen constante' },
  { texto: 'Me llamo... y vivo en...', descripcion: 'Presentación personal con voz proyectada' },
  { texto: '¿Puedes ayudarme, por favor? Gracias.', descripcion: 'Petición educada con claridad' },
  { texto: 'El perro corre, el gato duerme.', descripcion: 'Dos frases cortas con pausa intermedia' },
  { texto: '¡Bien! ¡Muy bien! ¡Excelente!', descripcion: 'Expresiones de ánimo con énfasis creciente' },
];

const UMBRAL_VOZ = 15; // Nivel mínimo de volumen (0-100) para contar como voz activa
const HISTORIA_KEY = 'meskeia-vocalizacion-historial';

// ============================================
// Componente principal
// ============================================

export default function EjerciciosVocalizacionPage() {
  // Micrófono y audio
  const [micActivo, setMicActivo] = useState(false);
  const [volumenActual, setVolumenActual] = useState(0);
  const [errorMic, setErrorMic] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Ejercicio activo
  type ModoEjercicio = 'inicio' | 'vocal' | 'frase';
  const [modo, setModo] = useState<ModoEjercicio>('inicio');
  const [ejercicioActual, setEjercicioActual] = useState<EjercicioVocal | FraseEjercicio | null>(null);
  const [enEjercicio, setEnEjercicio] = useState(false);
  const [segundosVoz, setSegundosVoz] = useState(0);
  const [objetivoSeg, setObjetivoSeg] = useState(10);
  const [ejercicioCompleto, setEjercicioCompleto] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Historial
  const [historial, setHistorial] = useState<RegistroSesion[]>([]);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);

  // Cargar historial de localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORIA_KEY);
      if (raw) setHistorial(JSON.parse(raw) as RegistroSesion[]);
    } catch {
      // Ignorar error de localStorage
    }
  }, []);

  const guardarRegistro = useCallback((registro: RegistroSesion) => {
    setHistorial(prev => {
      const nuevo = [registro, ...prev].slice(0, 50); // máx 50 entradas
      try { localStorage.setItem(HISTORIA_KEY, JSON.stringify(nuevo)); } catch { /* ignorar */ }
      return nuevo;
    });
  }, []);

  // Leer nivel de volumen del micrófono
  const leerVolumen = useCallback(() => {
    if (!analyserRef.current) return;
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    const suma = dataArray.reduce((acc, v) => acc + v, 0);
    const promedio = suma / dataArray.length;
    const nivel = Math.round((promedio / 255) * 100);
    setVolumenActual(nivel);
    animFrameRef.current = requestAnimationFrame(leerVolumen);
  }, []);

  const activarMicrofono = useCallback(async () => {
    setErrorMic(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
      setMicActivo(true);
      leerVolumen();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      if (msg.includes('Permission') || msg.includes('NotAllowed')) {
        setErrorMic('Permiso de micrófono denegado. Actívalo en la configuración del navegador.');
      } else if (msg.includes('NotFound')) {
        setErrorMic('No se encontró un micrófono en tu dispositivo.');
      } else {
        setErrorMic(`No se pudo acceder al micrófono: ${msg}`);
      }
    }
  }, [leerVolumen]);

  const desactivarMicrofono = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    audioCtxRef.current?.close();
    streamRef.current = null;
    audioCtxRef.current = null;
    analyserRef.current = null;
    setMicActivo(false);
    setVolumenActual(0);
    setEnEjercicio(false);
  }, []);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
      audioCtxRef.current?.close();
    };
  }, []);

  // Iniciar ejercicio
  const iniciarEjercicio = useCallback((ejercicio: EjercicioVocal | FraseEjercicio, objetivo: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setEjercicioActual(ejercicio);
    setObjetivoSeg(objetivo);
    setSegundosVoz(0);
    setEjercicioCompleto(false);
    setEnEjercicio(true);

    let segs = 0;
    timerRef.current = setInterval(() => {
      if (volumenActual >= UMBRAL_VOZ) {
        segs += 1;
        setSegundosVoz(segs);
        if (segs >= objetivo) {
          if (timerRef.current) clearInterval(timerRef.current);
          setEnEjercicio(false);
          setEjercicioCompleto(true);

          // Reproducir tono de éxito
          try {
            const ctx = new AudioContext();
            [523, 659, 784].forEach((freq, i) => {
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.frequency.value = freq;
              osc.type = 'sine';
              gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.18);
              gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.18 + 0.35);
              osc.start(ctx.currentTime + i * 0.18);
              osc.stop(ctx.currentTime + i * 0.18 + 0.35);
            });
          } catch { /* ignorar si AudioContext no disponible */ }

          // Guardar en historial
          const esVocal = 'letra' in ejercicio;
          guardarRegistro({
            fecha: new Date().toLocaleString('es-ES'),
            tipo: esVocal ? 'vocal' : 'frase',
            ejercicio: esVocal ? `Vocal ${(ejercicio as EjercicioVocal).letra}` : (ejercicio as FraseEjercicio).texto.slice(0, 40),
            duracion: segs,
            objetivo,
            exito: true,
          });
        }
      }
    }, 1000);
  }, [volumenActual, guardarRegistro]);

  const detenerEjercicio = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setEnEjercicio(false);
    if (ejercicioActual && segundosVoz > 0 && !ejercicioCompleto) {
      const esVocal = 'letra' in ejercicioActual;
      guardarRegistro({
        fecha: new Date().toLocaleString('es-ES'),
        tipo: esVocal ? 'vocal' : 'frase',
        ejercicio: esVocal ? `Vocal ${(ejercicioActual as EjercicioVocal).letra}` : (ejercicioActual as FraseEjercicio).texto.slice(0, 40),
        duracion: segundosVoz,
        objetivo: objetivoSeg,
        exito: false,
      });
    }
  }, [ejercicioActual, segundosVoz, ejercicioCompleto, objetivoSeg, guardarRegistro]);

  // Calcular color y nivel del medidor de volumen
  const getColorVolumen = (nivel: number): string => {
    if (nivel < UMBRAL_VOZ) return '#94A3B8'; // gris (silencio)
    if (nivel < 40) return '#2E86AB'; // azul (débil)
    if (nivel < 65) return '#48A9A6'; // teal (medio)
    return '#16A34A'; // verde (fuerte)
  };

  const progresoEjercicio = objetivoSeg > 0 ? Math.min((segundosVoz / objetivoSeg) * 100, 100) : 0;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>🎙️ Ejercicios de Vocalización</h1>
        <p className={styles.subtitle}>
          Práctica guiada para fortalecer la voz en la enfermedad de Parkinson.
          Mide tu volumen en tiempo real y registra tu progreso.
        </p>
      </header>

      <LegalNotice />

      {/* Disclaimer médico — SIEMPRE VISIBLE */}
      <DisclaimerCard
        variant="medical"
        severity="high"
        title="⚕️ Complemento a la terapia profesional"
      >
        <p>
          Esta herramienta es un <strong>apoyo para la práctica en casa</strong>, no un sustituto
          de la logopedia profesional. La rehabilitación vocal del Parkinson (como LSVT LOUD®)
          debe ser supervisada por un logopeda certificado.
        </p>
        <p>
          Consulta siempre con tu equipo médico antes de iniciar o modificar tu programa de
          ejercicios. Si sientes dolor, mareos o dificultad respiratoria, detén el ejercicio.
        </p>
      </DisclaimerCard>

      {/* SECCIÓN MICRÓFONO */}
      <section className={styles.seccionMic} aria-label="Control de micrófono">
        {!micActivo ? (
          <div className={styles.micInactivo}>
            <div className={styles.micIcono} aria-hidden="true">🎤</div>
            <p className={styles.micTexto}>
              Para usar los ejercicios necesitas activar el micrófono.
              El audio se procesa <strong>solo en tu dispositivo</strong> y nunca se envía a ningún servidor.
            </p>
            {errorMic && (
              <div className={styles.errorMic} role="alert">
                ⚠️ {errorMic}
              </div>
            )}
            <button
              className={styles.btnActivarMic}
              onClick={activarMicrofono}
              aria-label="Activar micrófono"
            >
              🎤 Activar micrófono
            </button>
          </div>
        ) : (
          <div className={styles.micActivo}>
            {/* Medidor de volumen */}
            <div className={styles.medidorWrapper} aria-label={`Volumen de voz: ${volumenActual}%`}>
              <div className={styles.medidorLabel}>Nivel de voz</div>
              <div className={styles.medidorBarra} role="meter" aria-valuenow={volumenActual} aria-valuemin={0} aria-valuemax={100}>
                <div
                  className={styles.medidorRelleno}
                  style={{
                    width: `${volumenActual}%`,
                    backgroundColor: getColorVolumen(volumenActual),
                  }}
                />
                {/* Línea de umbral */}
                <div
                  className={styles.medidorUmbral}
                  style={{ left: `${UMBRAL_VOZ}%` }}
                  title={`Umbral mínimo: ${UMBRAL_VOZ}%`}
                />
              </div>
              <div className={styles.medidorEstado}>
                {volumenActual < UMBRAL_VOZ
                  ? <span className={styles.silencio}>Silencio</span>
                  : <span className={styles.vozDetectada}>✓ Voz detectada</span>
                }
                <span className={styles.medidorNumero}>{volumenActual}%</span>
              </div>
            </div>

            <button
              className={styles.btnDesactivarMic}
              onClick={desactivarMicrofono}
              aria-label="Desactivar micrófono"
            >
              🔇 Desactivar micrófono
            </button>
          </div>
        )}
      </section>

      {/* NAVEGACIÓN DE MODOS */}
      {micActivo && (
        <>
          <div className={styles.modosNav} role="tablist" aria-label="Tipo de ejercicio">
            <button
              className={`${styles.modoBtn} ${modo === 'vocal' ? styles.modoBtnActivo : ''}`}
              onClick={() => { setModo('vocal'); setEjercicioActual(null); setEnEjercicio(false); setEjercicioCompleto(false); }}
              role="tab"
              aria-selected={modo === 'vocal'}
            >
              🗣️ Vocales sostenidas
            </button>
            <button
              className={`${styles.modoBtn} ${modo === 'frase' ? styles.modoBtnActivo : ''}`}
              onClick={() => { setModo('frase'); setEjercicioActual(null); setEnEjercicio(false); setEjercicioCompleto(false); }}
              role="tab"
              aria-selected={modo === 'frase'}
            >
              📝 Lectura en voz alta
            </button>
          </div>

          {/* PANEL VOCALES */}
          {modo === 'vocal' && (
            <section className={styles.panel} role="tabpanel" aria-label="Ejercicios de vocales">
              <h2 className={styles.panelTitulo}>Vocales sostenidas</h2>
              <p className={styles.panelDesc}>
                Elige una vocal y mantenla en voz alta durante <strong>10 segundos</strong>.
                El temporizador solo avanza cuando se detecta tu voz.
              </p>

              <div className={styles.vocalesGrid}>
                {VOCALES.map(v => (
                  <button
                    key={v.letra}
                    className={`${styles.vocalBtn} ${ejercicioActual && 'letra' in ejercicioActual && (ejercicioActual as EjercicioVocal).letra === v.letra ? styles.vocalBtnActivo : ''}`}
                    onClick={() => {
                      if (!enEjercicio) iniciarEjercicio(v, v.objetivo);
                    }}
                    disabled={enEjercicio}
                    aria-label={`Ejercicio vocal ${v.letra}: ${v.descripcion}`}
                  >
                    <span className={styles.vocalLetra}>{v.letra}</span>
                    <span className={styles.vocalSeg}>{v.objetivo}s</span>
                  </button>
                ))}
              </div>

              {ejercicioActual && 'letra' in ejercicioActual && (
                <div className={styles.ejercicioActivo}>
                  <div className={styles.ejercicioInstruccion}>
                    <strong>Di la vocal <span className={styles.vocalDestacada}>{(ejercicioActual as EjercicioVocal).letra}</span> en voz alta y sostenla</strong>
                    <p>{(ejercicioActual as EjercicioVocal).descripcion}</p>
                  </div>

                  {/* Progreso del ejercicio */}
                  <div className={styles.progresoWrapper}>
                    <div className={styles.progresoCirculo}>
                      <svg width="140" height="140" aria-hidden="true">
                        <circle cx="70" cy="70" r="58" fill="none" stroke="var(--border)" strokeWidth="10" />
                        <circle
                          cx="70" cy="70" r="58"
                          fill="none"
                          stroke={ejercicioCompleto ? '#16A34A' : '#2E86AB'}
                          strokeWidth="10"
                          strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 58}`}
                          strokeDashoffset={`${2 * Math.PI * 58 * (1 - progresoEjercicio / 100)}`}
                          transform="rotate(-90 70 70)"
                          style={{ transition: 'stroke-dashoffset 0.9s ease, stroke 0.3s ease' }}
                        />
                      </svg>
                      <div className={styles.progresoTexto}>
                        <span className={styles.progresoSegs}>{segundosVoz}</span>
                        <span className={styles.progresoTotal}>/ {objetivoSeg}s</span>
                      </div>
                    </div>

                    {ejercicioCompleto ? (
                      <div className={styles.exito} role="status">
                        🎉 ¡Objetivo alcanzado!
                      </div>
                    ) : (
                      <div className={styles.indicadorVoz} role="status" aria-live="polite">
                        {volumenActual >= UMBRAL_VOZ
                          ? <span className={styles.vozOk}>✓ Voz detectada — sigue así</span>
                          : <span className={styles.vozBaja}>↑ Habla más fuerte para avanzar</span>
                        }
                      </div>
                    )}
                  </div>

                  {enEjercicio && (
                    <button className={styles.btnDetener} onClick={detenerEjercicio}>
                      ⏹ Detener ejercicio
                    </button>
                  )}
                  {ejercicioCompleto && (
                    <button
                      className={styles.btnNuevo}
                      onClick={() => { setEjercicioActual(null); setEjercicioCompleto(false); setSegundosVoz(0); }}
                    >
                      ↩ Elegir otra vocal
                    </button>
                  )}
                </div>
              )}
            </section>
          )}

          {/* PANEL FRASES */}
          {modo === 'frase' && (
            <section className={styles.panel} role="tabpanel" aria-label="Ejercicios de lectura">
              <h2 className={styles.panelTitulo}>Lectura en voz alta</h2>
              <p className={styles.panelDesc}>
                Lee la frase en voz alta con <strong>volumen proyectado</strong>.
                El temporizador avanza solo cuando se detecta tu voz.
              </p>

              <div className={styles.frasesLista}>
                {FRASES.map((f, i) => (
                  <button
                    key={i}
                    className={`${styles.fraseBtn} ${ejercicioActual && !('letra' in ejercicioActual) && (ejercicioActual as FraseEjercicio).texto === f.texto ? styles.fraseBtnActiva : ''}`}
                    onClick={() => {
                      if (!enEjercicio) {
                        const duracion = Math.max(5, Math.round(f.texto.split(' ').length * 0.9));
                        iniciarEjercicio(f, duracion);
                      }
                    }}
                    disabled={enEjercicio}
                    aria-label={`Ejercicio de frase: ${f.texto}`}
                  >
                    <span className={styles.fraseTexto}>{f.texto}</span>
                    <span className={styles.fraseDesc}>{f.descripcion}</span>
                  </button>
                ))}
              </div>

              {ejercicioActual && !('letra' in ejercicioActual) && (
                <div className={styles.ejercicioActivo}>
                  <div className={styles.fraseActiva} aria-live="polite">
                    &ldquo;{(ejercicioActual as FraseEjercicio).texto}&rdquo;
                  </div>

                  <div className={styles.progresoWrapper}>
                    <div className={styles.progresoLineal}>
                      <div
                        className={styles.progresoLinealRelleno}
                        style={{
                          width: `${progresoEjercicio}%`,
                          backgroundColor: ejercicioCompleto ? '#16A34A' : '#2E86AB',
                        }}
                      />
                    </div>
                    <div className={styles.progresoLinealTexto}>
                      {segundosVoz}s / {objetivoSeg}s
                    </div>

                    {ejercicioCompleto ? (
                      <div className={styles.exito} role="status">
                        🎉 ¡Frase completada!
                      </div>
                    ) : (
                      <div className={styles.indicadorVoz} role="status" aria-live="polite">
                        {volumenActual >= UMBRAL_VOZ
                          ? <span className={styles.vozOk}>✓ Voz detectada — sigue leyendo</span>
                          : <span className={styles.vozBaja}>↑ Lee más fuerte para avanzar</span>
                        }
                      </div>
                    )}
                  </div>

                  {enEjercicio && (
                    <button className={styles.btnDetener} onClick={detenerEjercicio}>
                      ⏹ Detener ejercicio
                    </button>
                  )}
                  {ejercicioCompleto && (
                    <button
                      className={styles.btnNuevo}
                      onClick={() => { setEjercicioActual(null); setEjercicioCompleto(false); setSegundosVoz(0); }}
                    >
                      ↩ Elegir otra frase
                    </button>
                  )}
                </div>
              )}
            </section>
          )}

          {/* HISTORIAL */}
          {historial.length > 0 && (
            <section className={styles.historialSeccion} aria-label="Historial de sesiones">
              <button
                className={styles.historialToggle}
                onClick={() => setMostrarHistorial(p => !p)}
                aria-expanded={mostrarHistorial}
              >
                📋 Historial de sesiones ({historial.length})
                <span className={styles.toggleFlecha}>{mostrarHistorial ? '▲' : '▼'}</span>
              </button>

              {mostrarHistorial && (
                <div className={styles.historialLista}>
                  {historial.slice(0, 20).map((r, i) => (
                    <div key={i} className={`${styles.historialItem} ${r.exito ? styles.historialExito : styles.historialParcial}`}>
                      <span className={styles.historialFecha}>{r.fecha}</span>
                      <span className={styles.historialEjercicio}>{r.ejercicio}</span>
                      <span className={styles.historialDuracion}>
                        {r.duracion}s / {r.objetivo}s {r.exito ? '✓' : ''}
                      </span>
                    </div>
                  ))}
                  <button
                    className={styles.btnLimpiarHistorial}
                    onClick={() => {
                      setHistorial([]);
                      try { localStorage.removeItem(HISTORIA_KEY); } catch { /* ignorar */ }
                    }}
                  >
                    🗑️ Borrar historial
                  </button>
                </div>
              )}
            </section>
          )}
        </>
      )}

      <EducationalSection
        title="📚 Sobre la voz en la enfermedad de Parkinson"
        subtitle="Información sobre logopedia y rehabilitación vocal"
      >
        <section className={styles.guiaSeccion}>
          <h2>¿Por qué se ve afectada la voz en el Parkinson?</h2>
          <p>
            La enfermedad de Parkinson reduce la actividad dopaminérgica, lo que afecta al control
            motor de la musculatura implicada en la fonación. Los síntomas vocales más frecuentes son:
          </p>
          <ul>
            <li><strong>Hipofonía</strong>: voz débil o apagada (el más común, afecta al 70-80%)</li>
            <li><strong>Disartria</strong>: articulación imprecisa y voz monótona</li>
            <li><strong>Disfagia</strong>: dificultad para tragar, que puede afectar a la voz</li>
            <li><strong>Voz temblorosa</strong>: tremor vocal por el temblor de reposo</li>
          </ul>

          <h2>¿Qué es la terapia LSVT LOUD®?</h2>
          <p>
            El <strong>Lee Silverman Voice Treatment (LSVT LOUD®)</strong> es el programa de
            rehabilitación vocal más avalado científicamente para el Parkinson. Se basa en un principio
            simple pero eficaz: <strong>hablar en VOZ ALTA</strong> de forma consciente y constante.
          </p>
          <p>
            El paciente aprende a recalibrar su percepción del volumen: lo que siente como &quot;gritar&quot;
            es en realidad un volumen normal. Esta app practica ese mismo concepto de proyección vocal.
          </p>

          <h2>Consejos para los ejercicios</h2>
          <ul>
            <li>Haz los ejercicios <strong>sentado o de pie con postura erguida</strong></li>
            <li>Inspira profundamente antes de empezar cada ejercicio</li>
            <li>Proyecta la voz como si hablaras con alguien al <strong>otro extremo de la habitación</strong></li>
            <li>Practica <strong>10-15 minutos diarios</strong> para mejores resultados</li>
            <li>Alterna vocales sostenidas con lectura en voz alta</li>
            <li>Si la voz se fatiga, descansa — no fuerces</li>
          </ul>

          <h2>¿Cuándo buscar un logopeda?</h2>
          <p>
            Esta app es un complemento al trabajo profesional. Consulta a un logopeda si:
          </p>
          <ul>
            <li>Tienes dificultad para que te entiendan en conversaciones normales</li>
            <li>Has notado un cambio significativo en tu voz en los últimos meses</li>
            <li>Tienes dificultades para tragar (disfagia)</li>
            <li>Quieres acceder a un programa certificado LSVT LOUD®</li>
          </ul>
        </section>

        {/* TABLA COMPARATIVA */}
        <section className={styles.guiaSeccion}>
          <h2>Comparativa de opciones de rehabilitación vocal en Parkinson</h2>
          <p>Esta app es una herramienta de apoyo entre sesiones. Aquí comparamos distintos recursos disponibles:</p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Recurso</th>
                  <th>Disponibilidad</th>
                  <th>Feedback tiempo real</th>
                  <th>Personalizable</th>
                  <th>Indicado para</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>🎙️ Esta app (meskeIA)</td>
                  <td className={styles.celdaDestacada}>24/7, sin cita</td>
                  <td className={styles.celdaDestacada}>Sí (volumen)</td>
                  <td>Básica</td>
                  <td>Práctica diaria entre sesiones</td>
                </tr>
                <tr>
                  <td>Logopeda (LSVT LOUD®)</td>
                  <td>Citas presenciales</td>
                  <td>Sí (experto)</td>
                  <td className={styles.celdaDestacada}>Muy alta</td>
                  <td>Tratamiento principal certificado</td>
                </tr>
                <tr>
                  <td>Apps LSVT LOUD (oficial)</td>
                  <td>Con suscripción</td>
                  <td>Sí</td>
                  <td>Alta</td>
                  <td>Complemento al programa LSVT</td>
                </tr>
                <tr>
                  <td>Sin rehabilitación</td>
                  <td>—</td>
                  <td>No</td>
                  <td>—</td>
                  <td>No recomendado (voz se deteriora)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* CASOS DE USO */}
        <section className={styles.guiaSeccion}>
          <h2>¿Para quién es esta app de ejercicios?</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcono}>🧑‍⚕️</span>
              <h3>Persona con Parkinson en fase inicial</h3>
              <p>Mantener el volumen y la proyección vocal desde el inicio del diagnóstico ralentiza el deterioro. La app permite practicar a diario en casa sin depender de citas.</p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcono}>👪</span>
              <h3>Familiar o cuidador</h3>
              <p>Puede guiar al familiar con Parkinson en los ejercicios usando la app como referencia visual. El medidor de volumen objetivo hace la sesión más motivadora y cuantificable.</p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcono}>🏥</span>
              <h3>Logopeda en rehabilitación</h3>
              <p>Puede mostrar la app en consulta para demostrar el nivel de volumen objetivo, y recomendarla como práctica entre sesiones. El historial de sesiones facilita el seguimiento.</p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcono}>👴</span>
              <h3>Persona mayor con voz debilitada</h3>
              <p>Aunque no tenga Parkinson, la hipofonía por envejecimiento también mejora con ejercicios de proyección vocal. La app es útil para cualquier persona con voz débil.</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className={styles.guiaSeccion}>
          <h2>Preguntas frecuentes</h2>
          <dl className={styles.faqList}>
            <div className={styles.faqItem}>
              <dt>¿Cuántas veces a la semana debo practicar?</dt>
              <dd>La evidencia del LSVT LOUD® sugiere 4 sesiones semanales para mejores resultados. Para práctica de mantenimiento, 10-15 minutos diarios son suficientes. La constancia es más importante que la duración.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿El micrófono del móvil es suficientemente bueno?</dt>
              <dd>Sí para los objetivos de esta app. No necesitas un micrófono externo. El micrófono interno de cualquier smartphone o tableta es capaz de captar la variación de volumen que la app mide.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Puede usarla alguien que no tiene Parkinson?</dt>
              <dd>Completamente. La app es útil para cualquier persona con voz débil por envejecimiento, disfonía funcional, fatiga vocal profesional (cantantes, docentes) o recuperación tras una afección respiratoria.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Se guardan los resultados de mis ejercicios?</dt>
              <dd>Sí. El historial de sesiones se guarda en el almacenamiento local del navegador. Puedes ver las últimas sesiones completadas, con fecha y tipo de ejercicio. No se envía ningún dato a servidores externos.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Qué diferencia hay entre vocales sostenidas y lectura en voz alta?</dt>
              <dd>Las vocales sostenidas entrenan la proyección pura y la capacidad de mantener el volumen. La lectura en voz alta entrena la articulación y la prosodia en contexto real de comunicación. Se complementan: combinar ambos da mejores resultados.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Puedo usar la app si estoy en tratamiento con medicación para el Parkinson?</dt>
              <dd>Sí. Los ejercicios vocales son compatibles con cualquier medicación para el Parkinson. De hecho, muchos especialistas recomiendan practicar en el momento de mayor efecto de la medicación (ventana &quot;ON&quot;).</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿La app funciona en tablet y móvil?</dt>
              <dd>Sí. La interfaz es responsive. En tablet la experiencia es especialmente buena por el mayor tamaño de los botones y el medidor de volumen. Asegúrate de dar permiso al navegador para acceder al micrófono.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Qué hago si el micrófono no detecta mi voz?</dt>
              <dd>Primero comprueba que has dado permiso de micrófono al navegador (aparece un icono en la barra de dirección). Si sigue sin funcionar, prueba a acercarte más al dispositivo o sube el volumen de tu voz. Los micrófonos en funda gruesa pueden tener menor sensibilidad.</dd>
            </div>
          </dl>
        </section>

        {/* GUÍA PASO A PASO */}
        <section className={styles.guiaSeccion}>
          <h2>Cómo realizar una sesión completa</h2>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div>
                <strong>Prepara el entorno</strong>
                <p>Siéntate erguido o ponte de pie. Asegúrate de estar en un lugar sin mucho ruido ambiente. Acerca el dispositivo a unos 30-40 cm de tu boca.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div>
                <strong>Activa el micrófono</strong>
                <p>Pulsa &quot;Activar micrófono&quot; y acepta el permiso del navegador. El medidor de volumen debe mostrar actividad cuando hablas en voz normal.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div>
                <strong>Haz 2-3 respiraciones profundas</strong>
                <p>Inhala expandiendo el diafragma, no el pecho. Este precalentamiento mejora la proyección vocal y reduce la fatiga.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div>
                <strong>Empieza con vocales sostenidas</strong>
                <p>Selecciona la vocal A y practica sostenerla durante 10 segundos. El temporizador solo avanza cuando detecta tu voz — si se detiene, proyecta más.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div>
                <strong>Completa las 5 vocales</strong>
                <p>Practica A, E, I, O, U en ese orden. Entre cada vocal, descansa 15-20 segundos. No fuerces si notas tensión en la garganta.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>6</span>
              <div>
                <strong>Pasa a la lectura en voz alta</strong>
                <p>Cambia al modo de frases y lee en voz alta manteniendo el mismo nivel de proyección que con las vocales. El objetivo es mantener ese volumen en frases completas.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>7</span>
              <div>
                <strong>Revisa tu historial</strong>
                <p>Al terminar, la sesión queda registrada. Si practicas regularmente, podrás ver tu progreso y compartirlo con tu logopeda.</p>
              </div>
            </li>
          </ol>
        </section>

        {/* MEJORES PRÁCTICAS */}
        <section className={styles.guiaSeccion}>
          <h2>Buenas prácticas para familiares y cuidadores</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono}>📅</span>
              <p><strong>Integra la práctica en la rutina diaria.</strong> Vincular los ejercicios a una actividad fija (después del desayuno, antes de ver la tele) facilita que se conviertan en hábito.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono}>🎯</span>
              <p><strong>Practica en el &quot;momento ON&quot; de la medicación.</strong> Los ejercicios son más efectivos cuando el efecto de la medicación está en su pico. Coordínalo con el neurólogo si es posible.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono}>💬</span>
              <p><strong>Recuerda durante las conversaciones.</strong> Cuando el familiar con Parkinson hable en voz baja, recuérdale amablemente: &quot;Habla como cuando practicas.&quot; El refuerzo positivo es más efectivo que la corrección.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono}>🔄</span>
              <p><strong>Comparte el historial con el logopeda.</strong> El registro de sesiones es una herramienta de seguimiento. Muéstraselo en la próxima visita para que el especialista evalúe la adherencia y ajuste el plan.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono}>😌</span>
              <p><strong>No fuerces si hay fatiga vocal o días malos.</strong> En días de mayor rigidez o temblor, el esfuerzo puede ser contraproducente. Descansar un día no rompe el progreso; forzar sí puede hacerlo.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono}>🏆</span>
              <p><strong>Celebra los logros, por pequeños que sean.</strong> Mantener el volumen 10 segundos hoy es un éxito. El refuerzo positivo, no la comparación con ayer, es el motor del progreso en rehabilitación.</p>
            </div>
          </div>
        </section>

        {/* WARNING BOX */}
        <section className={styles.guiaSeccion}>
          <div className={styles.warningBox}>
            <h3>⚠️ Señales de que debes consultar al médico o logopeda</h3>
            <ul>
              <li><strong>Dolor al hablar o al tragar:</strong> la disfonía con dolor no debe tratarse con ejercicios sin evaluación previa. Puede indicar una lesión en las cuerdas vocales o disfagia que requiere valoración médica.</li>
              <li><strong>Cambio repentino en la voz:</strong> si la voz cambia significativamente en pocos días, consulta a tu neurólogo. Puede indicar un cambio en la progresión de la enfermedad que requiera ajuste de tratamiento.</li>
              <li><strong>Fatiga vocal persistente:</strong> si la voz se cansa en pocos minutos de práctica de forma repetida, el plan de ejercicios puede ser demasiado intenso. El logopeda debe ajustarlo.</li>
              <li><strong>Esta app no diagnostica ni trata:</strong> el feedback del medidor de volumen es orientativo, no clínico. No uses los datos de la app para evaluar la progresión de la enfermedad sin supervisión profesional.</li>
              <li><strong>No reemplaza la evaluación logopédica:</strong> la rehabilitación vocal en Parkinson debe ser prescrita y supervisada por un logopeda. Esta app es un complemento entre sesiones, no un sustituto del tratamiento.</li>
              <li><strong>Disfagia (dificultad para tragar):</strong> si aparecen atragantamientos frecuentes o sensación de ahogo al comer o beber, comunícalo inmediatamente al neurólogo. La disfagia en Parkinson puede tener consecuencias graves y requiere evaluación urgente.</li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('ejercicios-vocalizacion')} />
      <Footer appName="ejercicios-vocalizacion" />
    </div>
  );
}
