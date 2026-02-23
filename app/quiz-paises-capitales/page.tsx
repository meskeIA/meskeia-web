'use client';

import { useState, useMemo, useCallback } from 'react';
import 'flag-icons/css/flag-icons.min.css';
import styles from './QuizPaisesCapitales.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { countries, Country } from '@/data/countries';

type ModoJuego = 'capital' | 'pais' | 'bandera';
type Dificultad = 'facil' | 'normal' | 'dificil' | 'experto' | 'maestro';

interface PreguntaQuiz {
  pais: Country;
  opciones: string[]; // 4 opciones de respuesta (texto)
  respuestaCorrecta: string;
}

const DIFICULTAD_CONFIG: Record<Dificultad, { label: string; preguntas: number; continentes: string[] }> = {
  facil:   { label: '🟢 Fácil',   preguntas: 10, continentes: ['Europa'] },
  normal:  { label: '🟡 Normal',  preguntas: 15, continentes: ['Europa', 'América'] },
  dificil: { label: '🟠 Difícil', preguntas: 20, continentes: ['Europa', 'América', 'Asia'] },
  experto: { label: '🔴 Experto', preguntas: 25, continentes: ['Europa', 'América', 'Asia', 'África'] },
  maestro: { label: '⭐ Maestro', preguntas: 30, continentes: [] }, // todos los continentes
};

const MODO_CONFIG: Record<ModoJuego, { label: string; icon: string; desc: string }> = {
  capital: { label: 'Capital', icon: '🏛️', desc: '¿Cuál es la capital de...?' },
  pais:    { label: 'País',    icon: '🌍', desc: '¿A qué país pertenece esta capital?' },
  bandera: { label: 'Bandera', icon: '🚩', desc: 'Identifica el país por su bandera' },
};

const LETRAS = ['A', 'B', 'C', 'D'];

function mezclar<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generarOpciones(correcto: string, pool: string[], total = 4): string[] {
  const incorrectos = mezclar(pool.filter(o => o !== correcto)).slice(0, total - 1);
  return mezclar([correcto, ...incorrectos]);
}

function generarPreguntas(modo: ModoJuego, dificultad: Dificultad): PreguntaQuiz[] {
  const cfg = DIFICULTAD_CONFIG[dificultad];
  const pool = cfg.continentes.length > 0
    ? countries.filter(c => cfg.continentes.includes(c.continent))
    : countries;

  const seleccionados = mezclar(pool).slice(0, cfg.preguntas);

  return seleccionados.map(pais => {
    let respuestaCorrecta: string;
    let poolRespuestas: string[];

    if (modo === 'capital') {
      respuestaCorrecta = pais.capital;
      poolRespuestas = pool.map(c => c.capital);
    } else {
      // modo 'pais' o 'bandera' → respuesta es el nombre del país
      respuestaCorrecta = pais.name;
      poolRespuestas = pool.map(c => c.name);
    }

    const opciones = generarOpciones(respuestaCorrecta, poolRespuestas);
    return { pais, opciones, respuestaCorrecta };
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
  if (pct >= 0.9) return { emoji: '🏆', titulo: '¡Geógrafo experto!' };
  if (pct >= 0.7) return { emoji: '⭐', titulo: '¡Muy buena puntuación!' };
  if (pct >= 0.5) return { emoji: '👍', titulo: 'Buen intento' };
  return { emoji: '📚', titulo: 'Sigue practicando' };
}

type Pantalla = 'config' | 'quiz' | 'resultado';

export default function QuizPaisesCapitalesPage() {
  const [pantalla, setPantalla] = useState<Pantalla>('config');
  const [modo, setModo] = useState<ModoJuego>('capital');
  const [dificultad, setDificultad] = useState<Dificultad>('normal');
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
    const nuevasPreguntas = generarPreguntas(modo, dificultad);
    setPreguntas(nuevasPreguntas);
    setPreguntaActual(0);
    setSeleccionada(null);
    setCorrectas(0);
    setTiempoInicio(Date.now());
    setPantalla('quiz');
  }, [modo, dificultad]);

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

  const reiniciar = useCallback(() => {
    iniciarQuiz();
  }, [iniciarQuiz]);

  const volverConfig = useCallback(() => {
    setPantalla('config');
  }, []);

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
        <h1 className={styles.title}>Quiz Países y Capitales 🌍</h1>
        <p className={styles.subtitle}>
          Pon a prueba tus conocimientos de geografía mundial
        </p>
      </header>

      <LegalNotice />

      {/* ── PANTALLA CONFIGURACIÓN ── */}
      {pantalla === 'config' && (
        <div className={styles.configPanel}>
          <h2 className={styles.configTitle}>Elige tu modo de juego</h2>

          <div className={styles.modoGrid}>
            {(Object.entries(MODO_CONFIG) as [ModoJuego, typeof MODO_CONFIG[ModoJuego]][]).map(([key, cfg]) => (
              <button
                key={key}
                className={`${styles.modoBtn} ${modo === key ? styles.active : ''}`}
                onClick={() => setModo(key)}
                aria-pressed={modo === key}
              >
                <span className={styles.modoIcon} aria-hidden="true">{cfg.icon}</span>
                <span className={styles.modoNombre}>{cfg.label}</span>
                <span className={styles.modoDesc}>{cfg.desc}</span>
              </button>
            ))}
          </div>

          <div className={styles.dificultadRow} role="group" aria-label="Nivel de dificultad">
            {(Object.entries(DIFICULTAD_CONFIG) as [Dificultad, typeof DIFICULTAD_CONFIG[Dificultad]][]).map(([key, cfg]) => (
              <button
                key={key}
                className={`${styles.difBtn} ${dificultad === key ? styles.active : ''}`}
                onClick={() => setDificultad(key)}
                aria-pressed={dificultad === key}
              >
                {cfg.label}
              </button>
            ))}
          </div>

          <button className={styles.btnIniciar} onClick={iniciarQuiz}>
            Empezar Quiz — {DIFICULTAD_CONFIG[dificultad].preguntas} preguntas
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
                {totalPreguntas > 0 ? Math.round((correctas / Math.max(preguntaActual, 1)) * 100) : 0}%
              </span>
              <span className={styles.hudLabel}>Precisión</span>
            </div>
          </div>

          <div className={styles.progresoBar}>
            <div
              className={styles.progresoFill}
              style={{ width: `${((preguntaActual) / totalPreguntas) * 100}%` }}
              role="progressbar"
              aria-valuenow={preguntaActual}
              aria-valuemin={0}
              aria-valuemax={totalPreguntas}
            />
          </div>

          {/* Pregunta */}
          <div className={styles.preguntaCard}>
            <p className={styles.preguntaNumero}>Pregunta {preguntaActual + 1} de {totalPreguntas}</p>

            {modo === 'bandera' && (
              <span
                className={`fi fi-${pregunta.pais.code} ${styles.preguntaBandera}`}
                role="img"
                aria-label={`Bandera de ${pregunta.pais.name}`}
              />
            )}

            {modo === 'capital' && (
              <p className={styles.preguntaTexto}>
                ¿Cuál es la capital de <strong>{pregunta.pais.name}</strong>?
              </p>
            )}

            {modo === 'pais' && (
              <p className={styles.preguntaTexto}>
                ¿A qué país pertenece la capital <strong>{pregunta.pais.capital}</strong>?
              </p>
            )}

            {modo === 'bandera' && (
              <p className={styles.preguntaTexto}>
                ¿De qué país es esta bandera?
              </p>
            )}
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

          {/* Feedback y botón siguiente */}
          {seleccionada !== null && (
            <>
              <div
                className={`${styles.feedbackBanner} ${seleccionada === pregunta.respuestaCorrecta ? styles.feedbackCorrecto : styles.feedbackIncorrecto}`}
                role="alert"
                aria-live="polite"
              >
                {seleccionada === pregunta.respuestaCorrecta
                  ? `✅ ¡Correcto! La respuesta es ${pregunta.respuestaCorrecta}.`
                  : `❌ Incorrecto. La respuesta correcta es ${pregunta.respuestaCorrecta}.`}
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
              ⚙️ Cambiar modo
            </button>
          </div>
        </div>
      )}

      <RelatedApps apps={getRelatedApps('quiz-paises-capitales')} />

      <Footer appName="quiz-paises-capitales" />
    </div>
  );
}
