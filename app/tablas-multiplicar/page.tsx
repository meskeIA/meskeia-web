'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import styles from './TablasMultiplicar.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

type Dificultad = 'facil' | 'medio' | 'dificil';
type EstadoJuego = 'menu' | 'jugando' | 'resultado';

interface Pregunta {
  num1: number;
  num2: number;
  respuesta: number;
}

interface Estadisticas {
  totalJugadas: number;
  mejorRacha: number;
  totalAciertos: number;
  medallasOro: number;
  medallasPlata: number;
  medallasBronce: number;
}

const MEDALLAS = {
  oro: { emoji: '🥇', nombre: 'Oro', minPuntos: 90 },
  plata: { emoji: '🥈', nombre: 'Plata', minPuntos: 70 },
  bronce: { emoji: '🥉', nombre: 'Bronce', minPuntos: 50 },
};

const DIFICULTADES = {
  facil: { nombre: 'Fácil', tablas: [2, 3, 4, 5], tiempo: 15, preguntas: 10 },
  medio: { nombre: 'Medio', tablas: [2, 3, 4, 5, 6, 7, 8], tiempo: 10, preguntas: 15 },
  dificil: { nombre: 'Difícil', tablas: [2, 3, 4, 5, 6, 7, 8, 9, 10], tiempo: 8, preguntas: 20 },
};

const EMOJIS_CORRECTO = ['🎉', '⭐', '🌟', '✨', '🔥', '💪', '👏', '🚀'];
const EMOJIS_INCORRECTO = ['😢', '💔', '🙈', '😅'];
const FRASES_ANIMO = [
  '¡Genial!', '¡Increíble!', '¡Eres un crack!', '¡Sigue así!',
  '¡Fantástico!', '¡Muy bien!', '¡Excelente!', '¡Brillante!'
];

export default function TablasMultiplicarPage() {
  const [estado, setEstado] = useState<EstadoJuego>('menu');
  const [dificultad, setDificultad] = useState<Dificultad>('facil');
  const [tablasSeleccionadas, setTablasSeleccionadas] = useState<number[]>([]);
  const [preguntaActual, setPreguntaActual] = useState<Pregunta | null>(null);
  const [respuestaUsuario, setRespuestaUsuario] = useState('');
  const [preguntasRespondidas, setPreguntasRespondidas] = useState(0);
  const [aciertos, setAciertos] = useState(0);
  const [rachaActual, setRachaActual] = useState(0);
  const [mejorRachaSesion, setMejorRachaSesion] = useState(0);
  const [tiempoRestante, setTiempoRestante] = useState(0);
  const [feedback, setFeedback] = useState<{ tipo: 'correcto' | 'incorrecto' | null; emoji: string; frase: string }>({ tipo: null, emoji: '', frase: '' });
  const [estadisticas, setEstadisticas] = useState<Estadisticas>({
    totalJugadas: 0,
    mejorRacha: 0,
    totalAciertos: 0,
    medallasOro: 0,
    medallasPlata: 0,
    medallasBronce: 0,
  });
  const [animacionPuntos, setAnimacionPuntos] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Cargar estadísticas del localStorage
  useEffect(() => {
    const saved = localStorage.getItem('tablasMultiplicar_stats');
    if (saved) {
      setEstadisticas(JSON.parse(saved));
    }
  }, []);

  // Guardar estadísticas
  const guardarEstadisticas = useCallback((nuevasStats: Estadisticas) => {
    setEstadisticas(nuevasStats);
    localStorage.setItem('tablasMultiplicar_stats', JSON.stringify(nuevasStats));
  }, []);

  // Generar pregunta aleatoria
  const generarPregunta = useCallback((): Pregunta => {
    const tablas = tablasSeleccionadas.length > 0
      ? tablasSeleccionadas
      : DIFICULTADES[dificultad].tablas;

    const num1 = tablas[Math.floor(Math.random() * tablas.length)];
    const num2 = Math.floor(Math.random() * 10) + 1;

    return {
      num1,
      num2,
      respuesta: num1 * num2,
    };
  }, [dificultad, tablasSeleccionadas]);

  // Iniciar juego
  const iniciarJuego = useCallback(() => {
    setEstado('jugando');
    setPreguntasRespondidas(0);
    setAciertos(0);
    setRachaActual(0);
    setMejorRachaSesion(0);
    setRespuestaUsuario('');
    setFeedback({ tipo: null, emoji: '', frase: '' });

    const nuevaPregunta = generarPregunta();
    setPreguntaActual(nuevaPregunta);
    setTiempoRestante(DIFICULTADES[dificultad].tiempo);

    setTimeout(() => inputRef.current?.focus(), 100);
  }, [dificultad, generarPregunta]);

  // Timer
  useEffect(() => {
    if (estado !== 'jugando' || !preguntaActual) return;

    timerRef.current = setInterval(() => {
      setTiempoRestante(prev => {
        if (prev <= 1) {
          // Tiempo agotado - respuesta incorrecta
          procesarRespuesta(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [estado, preguntaActual]);

  // Procesar respuesta
  const procesarRespuesta = useCallback((tiempoAgotado = false) => {
    if (!preguntaActual) return;

    if (timerRef.current) clearInterval(timerRef.current);

    const respuestaNum = parseInt(respuestaUsuario) || 0;
    const esCorrecto = !tiempoAgotado && respuestaNum === preguntaActual.respuesta;

    if (esCorrecto) {
      const nuevoAciertos = aciertos + 1;
      const nuevaRacha = rachaActual + 1;
      setAciertos(nuevoAciertos);
      setRachaActual(nuevaRacha);
      if (nuevaRacha > mejorRachaSesion) {
        setMejorRachaSesion(nuevaRacha);
      }
      setAnimacionPuntos(true);
      setTimeout(() => setAnimacionPuntos(false), 500);

      setFeedback({
        tipo: 'correcto',
        emoji: EMOJIS_CORRECTO[Math.floor(Math.random() * EMOJIS_CORRECTO.length)],
        frase: FRASES_ANIMO[Math.floor(Math.random() * FRASES_ANIMO.length)],
      });
    } else {
      setRachaActual(0);
      setFeedback({
        tipo: 'incorrecto',
        emoji: EMOJIS_INCORRECTO[Math.floor(Math.random() * EMOJIS_INCORRECTO.length)],
        frase: `${preguntaActual.num1} × ${preguntaActual.num2} = ${preguntaActual.respuesta}`,
      });
    }

    const nuevasPreguntasRespondidas = preguntasRespondidas + 1;
    setPreguntasRespondidas(nuevasPreguntasRespondidas);

    // Verificar si terminó el juego
    if (nuevasPreguntasRespondidas >= DIFICULTADES[dificultad].preguntas) {
      setTimeout(() => {
        finalizarJuego(esCorrecto ? aciertos + 1 : aciertos);
      }, 1500);
    } else {
      // Siguiente pregunta
      setTimeout(() => {
        setRespuestaUsuario('');
        setFeedback({ tipo: null, emoji: '', frase: '' });
        setPreguntaActual(generarPregunta());
        setTiempoRestante(DIFICULTADES[dificultad].tiempo);
        inputRef.current?.focus();
      }, 1500);
    }
  }, [preguntaActual, respuestaUsuario, aciertos, rachaActual, mejorRachaSesion, preguntasRespondidas, dificultad, generarPregunta]);

  // Finalizar juego
  const finalizarJuego = useCallback((aciertosFinales: number) => {
    setEstado('resultado');

    const porcentaje = (aciertosFinales / DIFICULTADES[dificultad].preguntas) * 100;
    const nuevasStats = { ...estadisticas };
    nuevasStats.totalJugadas++;
    nuevasStats.totalAciertos += aciertosFinales;

    if (mejorRachaSesion > nuevasStats.mejorRacha) {
      nuevasStats.mejorRacha = mejorRachaSesion;
    }

    if (porcentaje >= MEDALLAS.oro.minPuntos) {
      nuevasStats.medallasOro++;
    } else if (porcentaje >= MEDALLAS.plata.minPuntos) {
      nuevasStats.medallasPlata++;
    } else if (porcentaje >= MEDALLAS.bronce.minPuntos) {
      nuevasStats.medallasBronce++;
    }

    guardarEstadisticas(nuevasStats);
  }, [dificultad, estadisticas, mejorRachaSesion, guardarEstadisticas]);

  // Manejar envío
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (respuestaUsuario && feedback.tipo === null) {
      procesarRespuesta();
    }
  };

  // Toggle tabla seleccionada
  const toggleTabla = (tabla: number) => {
    setTablasSeleccionadas(prev =>
      prev.includes(tabla)
        ? prev.filter(t => t !== tabla)
        : [...prev, tabla]
    );
  };

  // Calcular medalla obtenida
  const getMedalla = () => {
    const porcentaje = (aciertos / DIFICULTADES[dificultad].preguntas) * 100;
    if (porcentaje >= MEDALLAS.oro.minPuntos) return MEDALLAS.oro;
    if (porcentaje >= MEDALLAS.plata.minPuntos) return MEDALLAS.plata;
    if (porcentaje >= MEDALLAS.bronce.minPuntos) return MEDALLAS.bronce;
    return null;
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon}>✖️</span>
        <h1 className={styles.title}>Entrenador Tablas de Multiplicar</h1>
        <p className={styles.subtitle}>
          ¡Aprende las tablas de multiplicar jugando! Gana puntos, consigue rachas y colecciona medallas.
        </p>
      </header>

      {/* Menú principal */}
      {estado === 'menu' && (
        <div className={styles.menuSection}>
          {/* Estadísticas */}
          <div className={styles.statsCard}>
            <h3 className={styles.statsTitle}>📊 Tus estadísticas</h3>
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{estadisticas.totalJugadas}</span>
                <span className={styles.statLabel}>Partidas</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{estadisticas.mejorRacha}</span>
                <span className={styles.statLabel}>Mejor racha</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{estadisticas.totalAciertos}</span>
                <span className={styles.statLabel}>Aciertos totales</span>
              </div>
            </div>
            <div className={styles.medalsRow}>
              <span className={styles.medalBadge}>🥇 {estadisticas.medallasOro}</span>
              <span className={styles.medalBadge}>🥈 {estadisticas.medallasPlata}</span>
              <span className={styles.medalBadge}>🥉 {estadisticas.medallasBronce}</span>
            </div>
          </div>

          {/* Selección de dificultad */}
          <div className={styles.configCard}>
            <h3 className={styles.configTitle}>🎮 Elige dificultad</h3>
            <div className={styles.difficultyGrid}>
              {(Object.keys(DIFICULTADES) as Dificultad[]).map((dif) => (
                <button
                  key={dif}
                  onClick={() => setDificultad(dif)}
                  className={`${styles.difficultyButton} ${dificultad === dif ? styles.difficultyActive : ''}`}
                >
                  <span className={styles.difficultyEmoji}>
                    {dif === 'facil' ? '🌱' : dif === 'medio' ? '🌿' : '🌳'}
                  </span>
                  <span className={styles.difficultyName}>{DIFICULTADES[dif].nombre}</span>
                  <span className={styles.difficultyInfo}>
                    Tablas {DIFICULTADES[dif].tablas[0]}-{DIFICULTADES[dif].tablas[DIFICULTADES[dif].tablas.length - 1]}
                  </span>
                  <span className={styles.difficultyInfo}>
                    {DIFICULTADES[dif].preguntas} preguntas • {DIFICULTADES[dif].tiempo}s
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Selección de tablas específicas */}
          <div className={styles.configCard}>
            <h3 className={styles.configTitle}>🎯 Practica tablas específicas (opcional)</h3>
            <p className={styles.configHint}>Selecciona las tablas que quieras practicar, o déjalo vacío para jugar con todas</p>
            <div className={styles.tablasGrid}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((tabla) => (
                <button
                  key={tabla}
                  onClick={() => toggleTabla(tabla)}
                  className={`${styles.tablaButton} ${tablasSeleccionadas.includes(tabla) ? styles.tablaActive : ''}`}
                >
                  {tabla}
                </button>
              ))}
            </div>
            {tablasSeleccionadas.length > 0 && (
              <button
                onClick={() => setTablasSeleccionadas([])}
                className={styles.clearButton}
              >
                Limpiar selección
              </button>
            )}
          </div>

          {/* Botón de inicio */}
          <button onClick={iniciarJuego} className={styles.startButton}>
            🚀 ¡Empezar a jugar!
          </button>
        </div>
      )}

      {/* Pantalla de juego */}
      {estado === 'jugando' && preguntaActual && (
        <div className={styles.gameSection}>
          {/* Barra de progreso */}
          <div className={styles.progressBar}>
            <div className={styles.progressInfo}>
              <span>Pregunta {preguntasRespondidas + 1} de {DIFICULTADES[dificultad].preguntas}</span>
              <span className={`${styles.streak} ${rachaActual >= 3 ? styles.streakHot : ''}`}>
                🔥 Racha: {rachaActual}
              </span>
            </div>
            <div className={styles.progressTrack}>
              <div
                className={styles.progressFill}
                style={{ width: `${(preguntasRespondidas / DIFICULTADES[dificultad].preguntas) * 100}%` }}
              />
            </div>
          </div>

          {/* Timer */}
          <div className={`${styles.timer} ${tiempoRestante <= 3 ? styles.timerUrgent : ''}`}>
            ⏱️ {tiempoRestante}s
          </div>

          {/* Pregunta */}
          <div className={styles.questionCard}>
            <div className={styles.question}>
              <span className={styles.questionNum}>{preguntaActual.num1}</span>
              <span className={styles.questionOp}>×</span>
              <span className={styles.questionNum}>{preguntaActual.num2}</span>
              <span className={styles.questionOp}>=</span>
              <span className={styles.questionAnswer}>?</span>
            </div>

            <form onSubmit={handleSubmit} className={styles.answerForm}>
              <input
                ref={inputRef}
                type="number"
                value={respuestaUsuario}
                onChange={(e) => setRespuestaUsuario(e.target.value)}
                className={styles.answerInput}
                placeholder="Tu respuesta"
                disabled={feedback.tipo !== null}
                autoComplete="off"
              />
              <button
                type="submit"
                className={styles.submitButton}
                disabled={!respuestaUsuario || feedback.tipo !== null}
              >
                Responder
              </button>
            </form>
          </div>

          {/* Feedback */}
          {feedback.tipo && (
            <div className={`${styles.feedback} ${styles[`feedback${feedback.tipo === 'correcto' ? 'Correcto' : 'Incorrecto'}`]}`}>
              <span className={styles.feedbackEmoji}>{feedback.emoji}</span>
              <span className={styles.feedbackText}>{feedback.frase}</span>
              {feedback.tipo === 'correcto' && (
                <span className={`${styles.pointsAdded} ${animacionPuntos ? styles.pointsAnimate : ''}`}>+1</span>
              )}
            </div>
          )}

          {/* Puntuación actual */}
          <div className={styles.scoreDisplay}>
            <span className={styles.scoreLabel}>Aciertos:</span>
            <span className={styles.scoreValue}>{aciertos}</span>
          </div>
        </div>
      )}

      {/* Pantalla de resultado */}
      {estado === 'resultado' && (
        <div className={styles.resultSection}>
          <div className={styles.resultCard}>
            {getMedalla() ? (
              <>
                <span className={styles.resultMedal}>{getMedalla()?.emoji}</span>
                <h2 className={styles.resultTitle}>¡{getMedalla()?.nombre}!</h2>
              </>
            ) : (
              <>
                <span className={styles.resultMedal}>💪</span>
                <h2 className={styles.resultTitle}>¡Sigue practicando!</h2>
              </>
            )}

            <div className={styles.resultStats}>
              <div className={styles.resultStat}>
                <span className={styles.resultStatValue}>{aciertos}/{DIFICULTADES[dificultad].preguntas}</span>
                <span className={styles.resultStatLabel}>Aciertos</span>
              </div>
              <div className={styles.resultStat}>
                <span className={styles.resultStatValue}>{Math.round((aciertos / DIFICULTADES[dificultad].preguntas) * 100)}%</span>
                <span className={styles.resultStatLabel}>Precisión</span>
              </div>
              <div className={styles.resultStat}>
                <span className={styles.resultStatValue}>{mejorRachaSesion}</span>
                <span className={styles.resultStatLabel}>Mejor racha</span>
              </div>
            </div>

            <div className={styles.resultActions}>
              <button onClick={iniciarJuego} className={styles.playAgainButton}>
                🔄 Jugar de nuevo
              </button>
              <button onClick={() => setEstado('menu')} className={styles.menuButton}>
                📋 Volver al menú
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contenido educativo */}
      <EducationalSection
        title="¿Quieres dominar las tablas de multiplicar?"
        subtitle="Consejos y trucos para aprender más rápido"
        icon="📚"
      >
        <section className={styles.guideSection}>
          <h2>Trucos para las tablas</h2>
          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>🔢 Tabla del 9</h4>
              <p>
                Los resultados de la tabla del 9 suman siempre 9:
                9×2=18 (1+8=9), 9×3=27 (2+7=9), 9×4=36 (3+6=9)...
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>✋ Tabla del 9 con los dedos</h4>
              <p>
                Baja el dedo de la posición que multiplicas.
                Los dedos a la izquierda son decenas, a la derecha unidades.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>5️⃣ Tabla del 5</h4>
              <p>
                Los resultados siempre terminan en 0 o 5.
                Si multiplicas por par, termina en 0. Si es impar, en 5.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>🔄 La propiedad conmutativa</h4>
              <p>
                El orden no importa: 3×7 = 7×3.
                ¡Así solo necesitas memorizar la mitad de las tablas!
              </p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Orden recomendado para aprender</h2>
          <ul className={styles.usesList}>
            <li><strong>Tabla del 1:</strong> Cualquier número por 1 es ese mismo número</li>
            <li><strong>Tabla del 2:</strong> Simplemente es sumar el número consigo mismo (doble)</li>
            <li><strong>Tabla del 5:</strong> Termina siempre en 0 o 5, muy fácil de recordar</li>
            <li><strong>Tabla del 10:</strong> Solo añade un 0 al final del número</li>
            <li><strong>Tabla del 4:</strong> Es el doble del doble (el doble de la tabla del 2)</li>
            <li><strong>Tabla del 9:</strong> Usa el truco de los dedos o la suma igual a 9</li>
            <li><strong>Tablas del 3, 6, 7 y 8:</strong> Las más difíciles, practicar con repetición</li>
          </ul>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('tablas-multiplicar')} />
      <Footer appName="tablas-multiplicar" />
    </div>
  );
}
