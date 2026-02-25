'use client';

import { useState, useMemo, useCallback } from 'react';
import styles from './QuizReinosNaturaleza.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { organismosNaturaleza, OrganismoNaturaleza } from '@/data/organismos-naturaleza';

type Nivel = 'basico' | 'intermedio' | 'avanzado' | 'todos';
type Pantalla = 'config' | 'quiz' | 'resultado';

interface PreguntaQuiz {
  organismo: OrganismoNaturaleza;
  opciones: string[];
  respuestaCorrecta: string;
}

const NIVEL_CONFIG: Record<Nivel, { label: string; desc: string }> = {
  basico:      { label: '🟢 Básico',       desc: '20 animales contraintuitivos'       },
  intermedio:  { label: '🟡 Intermedio',   desc: '13 hongos, plantas y algas'         },
  avanzado:    { label: '🔴 Avanzado',     desc: '10 microorganismos y casos límite'  },
  todos:       { label: '⭐ Todos',        desc: '43 organismos sorprendentes'        },
};

const OPCIONES_PREGUNTAS = [10, 15, 20];
const LETRAS = ['A', 'B', 'C', 'D'];

function mezclar<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generarPreguntas(nivel: Nivel, numPreguntas: number): PreguntaQuiz[] {
  const pool = nivel === 'todos'
    ? organismosNaturaleza
    : organismosNaturaleza.filter(o => o.nivel === nivel);

  const seleccionados = mezclar(pool).slice(0, Math.min(numPreguntas, pool.length));

  return seleccionados.map(organismo => {
    // opciones = respuesta correcta + 3 distractores específicos mezclados
    const opciones = mezclar([organismo.grupo, ...organismo.confundibleCon]);
    return { organismo, opciones, respuestaCorrecta: organismo.grupo };
  });
}

function calcularPuntuacion(correctas: number, total: number): number {
  const pct = correctas / total;
  if (pct >= 0.9) return 100;
  if (pct >= 0.7) return Math.round(60 + (pct - 0.7) / 0.2 * 40);
  if (pct >= 0.5) return Math.round(40 + (pct - 0.5) / 0.2 * 20);
  return Math.round(pct * 80);
}

function getResultadoTexto(pct: number): { emoji: string; titulo: string } {
  if (pct >= 0.9) return { emoji: '🏆', titulo: '¡Eres un experto en biología!' };
  if (pct >= 0.7) return { emoji: '⭐', titulo: '¡Muy buena puntuación!' };
  if (pct >= 0.5) return { emoji: '👍', titulo: 'Buen intento' };
  return { emoji: '📚', titulo: 'Sigue practicando' };
}

const NIVEL_ETIQUETA: Record<string, string> = {
  basico:      '🟢 Básico',
  intermedio:  '🟡 Intermedio',
  avanzado:    '🔴 Avanzado',
};

export default function QuizReinosNaturalezaPage() {
  const [pantalla, setPantalla] = useState<Pantalla>('config');
  const [nivel, setNivel] = useState<Nivel>('basico');
  const [numPreguntas, setNumPreguntas] = useState(10);
  const [preguntas, setPreguntas] = useState<PreguntaQuiz[]>([]);
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [seleccionada, setSeleccionada] = useState<string | null>(null);
  const [correctas, setCorrectas] = useState(0);
  const [tiempoInicio, setTiempoInicio] = useState<number>(0);
  const [tiempoTotal, setTiempoTotal] = useState<number>(0);

  const pregunta = preguntas[preguntaActual];
  const totalPreguntas = preguntas.length;
  const esUltima = preguntaActual === totalPreguntas - 1;

  const iniciarQuiz = useCallback(() => {
    const nuevasPreguntas = generarPreguntas(nivel, numPreguntas);
    setPreguntas(nuevasPreguntas);
    setPreguntaActual(0);
    setSeleccionada(null);
    setCorrectas(0);
    setTiempoInicio(Date.now());
    setPantalla('quiz');
  }, [nivel, numPreguntas]);

  const responder = useCallback((opcion: string) => {
    if (seleccionada !== null) return;
    setSeleccionada(opcion);
    if (opcion === pregunta.respuestaCorrecta) {
      setCorrectas(prev => prev + 1);
    }
  }, [seleccionada, pregunta]);

  const siguiente = useCallback(() => {
    if (esUltima) {
      setTiempoTotal(Math.round((Date.now() - tiempoInicio) / 1000));
      setPantalla('resultado');
    } else {
      setPreguntaActual(prev => prev + 1);
      setSeleccionada(null);
    }
  }, [esUltima, tiempoInicio]);

  const reiniciar = useCallback(() => { iniciarQuiz(); }, [iniciarQuiz]);
  const volverConfig = useCallback(() => { setPantalla('config'); }, []);

  const puntuacion = useMemo(
    () => calcularPuntuacion(correctas, totalPreguntas),
    [correctas, totalPreguntas]
  );

  const resultadoTexto = useMemo(
    () => getResultadoTexto(totalPreguntas > 0 ? correctas / totalPreguntas : 0),
    [correctas, totalPreguntas]
  );

  const formatTiempo = (seg: number): string => {
    const m = Math.floor(seg / 60);
    const s = seg % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Quiz Reinos de la Naturaleza 🔬</h1>
        <p className={styles.subtitle}>
          ¿Animal, planta, hongo o bacteria? 43 organismos que sorprenden · Con curiosidades científicas
        </p>
      </header>

      <LegalNotice />

      {/* ── PANTALLA CONFIGURACIÓN ── */}
      {pantalla === 'config' && (
        <div className={styles.configPanel}>
          <h2 className={styles.configTitle}>Elige tu nivel</h2>

          <div className={styles.nivelGrid}>
            {(Object.entries(NIVEL_CONFIG) as [Nivel, typeof NIVEL_CONFIG[Nivel]][]).map(([key, cfg]) => (
              <button
                key={key}
                className={`${styles.nivelBtn} ${nivel === key ? styles.active : ''}`}
                onClick={() => setNivel(key)}
                aria-pressed={nivel === key}
              >
                <span className={styles.nivelLabel}>{cfg.label}</span>
                <span className={styles.nivelDesc}>{cfg.desc}</span>
              </button>
            ))}
          </div>

          <h3 className={styles.configSubtitle}>Número de preguntas</h3>
          <div className={styles.preguntasRow} role="group" aria-label="Número de preguntas">
            {OPCIONES_PREGUNTAS.map(n => (
              <button
                key={n}
                className={`${styles.pregBtn} ${numPreguntas === n ? styles.active : ''}`}
                onClick={() => setNumPreguntas(n)}
                aria-pressed={numPreguntas === n}
              >
                {n} preguntas
              </button>
            ))}
          </div>

          <button className={styles.btnIniciar} onClick={iniciarQuiz}>
            Empezar Quiz — {numPreguntas} preguntas · {NIVEL_CONFIG[nivel].label}
          </button>
        </div>
      )}

      {/* ── PANTALLA QUIZ ── */}
      {pantalla === 'quiz' && pregunta && (
        <>
          {/* HUD */}
          <div className={styles.hudBar}>
            <div className={styles.hudItem}>
              <span className={styles.hudValor}>{preguntaActual + 1}/{totalPreguntas}</span>
              <span className={styles.hudLabel}>Pregunta</span>
            </div>
            <div className={styles.hudItem}>
              <span className={styles.hudValor}>{correctas}</span>
              <span className={styles.hudLabel}>Correctas</span>
            </div>
            <div className={styles.hudItem}>
              <span className={styles.hudValor}>
                {preguntaActual > 0 ? Math.round((correctas / preguntaActual) * 100) : 0}%
              </span>
              <span className={styles.hudLabel}>Precisión</span>
            </div>
          </div>

          <div className={styles.progresoBar}>
            <div
              className={styles.progresoFill}
              style={{ width: `${(preguntaActual / totalPreguntas) * 100}%` }}
              role="progressbar"
              aria-valuenow={preguntaActual}
              aria-valuemin={0}
              aria-valuemax={totalPreguntas}
            />
          </div>

          {/* Tarjeta de pregunta */}
          <div className={styles.preguntaCard}>
            <p className={styles.preguntaNumero}>Pregunta {preguntaActual + 1} de {totalPreguntas}</p>
            <p className={styles.preguntaEtiqueta}>¿A qué grupo pertenece...?</p>
            <p className={styles.organismoNombre}>{pregunta.organismo.nombre}</p>
            <span className={styles.nivelBadge}>
              {NIVEL_ETIQUETA[pregunta.organismo.nivel]}
            </span>
          </div>

          {/* Opciones */}
          <div className={styles.opcionesGrid}>
            {pregunta.opciones.map((opcion, i) => {
              let claseExtra = '';
              if (seleccionada !== null) {
                if (opcion === pregunta.respuestaCorrecta) claseExtra = styles.opcionCorrecta;
                else if (opcion === seleccionada) claseExtra = styles.opcionIncorrecta;
                else claseExtra = styles.opcionNeutral;
              }
              return (
                <button
                  key={opcion}
                  className={`${styles.opcion} ${claseExtra}`}
                  onClick={() => responder(opcion)}
                  disabled={seleccionada !== null}
                  aria-label={`Opción ${LETRAS[i]}: ${opcion}`}
                >
                  <span className={styles.opcionLetra}>{LETRAS[i]}</span>
                  {opcion}
                </button>
              );
            })}
          </div>

          {/* Feedback educativo */}
          {seleccionada !== null && (
            <>
              <div
                className={`${styles.feedbackPanel} ${seleccionada === pregunta.respuestaCorrecta ? styles.feedbackCorrecto : styles.feedbackIncorrecto}`}
                role="alert"
                aria-live="polite"
              >
                <div className={styles.feedbackCabecera}>
                  <span className={styles.feedbackIcono}>
                    {seleccionada === pregunta.respuestaCorrecta ? '✅' : '❌'}
                  </span>
                  <div>
                    <p className={styles.feedbackResultado}>
                      {seleccionada === pregunta.respuestaCorrecta ? '¡Correcto!' : 'Incorrecto'}
                    </p>
                    <p className={styles.feedbackGrupo}>{pregunta.organismo.grupo}</p>
                    <p className={styles.feedbackNombreOrg}>{pregunta.organismo.nombre}</p>
                  </div>
                </div>

                <div className={styles.feedbackBloque}>
                  <span className={styles.feedbackBloqueIcono} aria-hidden="true">🔬</span>
                  <p>{pregunta.organismo.porQueConfunde}</p>
                </div>

                <div className={styles.feedbackBloque}>
                  <span className={styles.feedbackBloqueIcono} aria-hidden="true">💡</span>
                  <p>{pregunta.organismo.curiosidad}</p>
                </div>
              </div>

              <button className={styles.btnSiguiente} onClick={siguiente}>
                {esUltima ? 'Ver resultados' : 'Siguiente pregunta →'}
              </button>
            </>
          )}
        </>
      )}

      {/* ── PANTALLA RESULTADO ── */}
      {pantalla === 'resultado' && (
        <div className={styles.resultadoPanel}>
          <span className={styles.resultadoEmoji} aria-hidden="true">{resultadoTexto.emoji}</span>
          <h2 className={styles.resultadoTitulo}>{resultadoTexto.titulo}</h2>
          <p className={styles.resultadoPuntos}>{puntuacion} pts</p>
          <p className={styles.resultadoSubtitulo}>
            {correctas} de {totalPreguntas} respuestas correctas
          </p>

          <div className={styles.statsResultado}>
            <div className={styles.statR}>
              <span className={styles.statRValor}>{correctas}/{totalPreguntas}</span>
              <p className={styles.statRLabel}>Correctas</p>
            </div>
            <div className={styles.statR}>
              <span className={styles.statRValor}>
                {Math.round((correctas / totalPreguntas) * 100)}%
              </span>
              <p className={styles.statRLabel}>Acierto</p>
            </div>
            <div className={styles.statR}>
              <span className={styles.statRValor}>{formatTiempo(tiempoTotal)}</span>
              <p className={styles.statRLabel}>Tiempo</p>
            </div>
          </div>

          <div className={styles.botonesResultado}>
            <button className={styles.btnRejugar} onClick={reiniciar}>
              🔄 Jugar de nuevo
            </button>
            <button className={styles.btnConfig} onClick={volverConfig}>
              ⚙️ Cambiar nivel
            </button>
          </div>
        </div>
      )}

      <RelatedApps apps={getRelatedApps('quiz-reinos-naturaleza')} />
      <ShareCard appName="quiz-reinos-naturaleza" />
      <Footer appName="quiz-reinos-naturaleza" />
    </div>
  );
}
