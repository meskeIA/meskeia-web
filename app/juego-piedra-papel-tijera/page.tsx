'use client';
// @disclaimer: exempt

import { useState, useEffect } from 'react';
import styles from './JuegoPiedraPapelTijera.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice, ShareCard, EducationalSection } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

type Opcion = 'piedra' | 'papel' | 'tijera';
type Resultado = 'ganaste' | 'perdiste' | 'empate' | null;

interface Estadisticas {
  victorias: number;
  derrotas: number;
  empates: number;
  rachaActual: number;
  mejorRacha: number;
}

const OPCIONES: { id: Opcion; emoji: string; nombre: string }[] = [
  { id: 'piedra', emoji: '🪨', nombre: 'Piedra' },
  { id: 'papel', emoji: '📄', nombre: 'Papel' },
  { id: 'tijera', emoji: '✂️', nombre: 'Tijera' },
];

// Determinar ganador
const determinarGanador = (jugador: Opcion, computadora: Opcion): Resultado => {
  if (jugador === computadora) return 'empate';

  if (
    (jugador === 'piedra' && computadora === 'tijera') ||
    (jugador === 'papel' && computadora === 'piedra') ||
    (jugador === 'tijera' && computadora === 'papel')
  ) {
    return 'ganaste';
  }

  return 'perdiste';
};

// Obtener elección aleatoria de la computadora
const eleccionComputadora = (): Opcion => {
  const opciones: Opcion[] = ['piedra', 'papel', 'tijera'];
  return opciones[Math.floor(Math.random() * opciones.length)];
};

export default function JuegoPiedraPapelTijeraPage() {
  const [eleccionJugador, setEleccionJugador] = useState<Opcion | null>(null);
  const [eleccionPC, setEleccionPC] = useState<Opcion | null>(null);
  const [resultado, setResultado] = useState<Resultado>(null);
  const [animando, setAnimando] = useState(false);
  const [estadisticas, setEstadisticas] = useState<Estadisticas>({
    victorias: 0,
    derrotas: 0,
    empates: 0,
    rachaActual: 0,
    mejorRacha: 0,
  });

  // Cargar estadísticas
  useEffect(() => {
    const saved = localStorage.getItem('rps-stats');
    if (saved) {
      try {
        setEstadisticas(JSON.parse(saved));
      } catch {
        // Ignorar
      }
    }
  }, []);

  // Guardar estadísticas
  useEffect(() => {
    if (estadisticas.victorias > 0 || estadisticas.derrotas > 0 || estadisticas.empates > 0) {
      localStorage.setItem('rps-stats', JSON.stringify(estadisticas));
    }
  }, [estadisticas]);

  // Jugar
  const jugar = (opcion: Opcion) => {
    if (animando) return;

    setAnimando(true);
    setEleccionJugador(opcion);
    setEleccionPC(null);
    setResultado(null);

    // Animación de "pensando"
    setTimeout(() => {
      const pc = eleccionComputadora();
      setEleccionPC(pc);

      const res = determinarGanador(opcion, pc);
      setResultado(res);

      // Actualizar estadísticas
      setEstadisticas(prev => {
        const nuevaRacha = res === 'ganaste' ? prev.rachaActual + 1 : 0;
        return {
          victorias: prev.victorias + (res === 'ganaste' ? 1 : 0),
          derrotas: prev.derrotas + (res === 'perdiste' ? 1 : 0),
          empates: prev.empates + (res === 'empate' ? 1 : 0),
          rachaActual: nuevaRacha,
          mejorRacha: Math.max(prev.mejorRacha, nuevaRacha),
        };
      });

      setAnimando(false);
    }, 800);
  };

  // Reiniciar estadísticas
  const reiniciarStats = () => {
    if (confirm('¿Reiniciar todas las estadísticas?')) {
      const nuevasStats = {
        victorias: 0,
        derrotas: 0,
        empates: 0,
        rachaActual: 0,
        mejorRacha: 0,
      };
      setEstadisticas(nuevasStats);
      localStorage.removeItem('rps-stats');
      setEleccionJugador(null);
      setEleccionPC(null);
      setResultado(null);
    }
  };

  const totalPartidas = estadisticas.victorias + estadisticas.derrotas + estadisticas.empates;
  const porcentajeVictorias = totalPartidas > 0
    ? Math.round((estadisticas.victorias / totalPartidas) * 100)
    : 0;

  const getOpcionInfo = (opcion: Opcion | null) => {
    return OPCIONES.find(o => o.id === opcion) || null;
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Piedra, Papel o Tijera</h1>
        <p className={styles.subtitle}>
          El clásico juego contra la computadora
        </p>
      </header>

      <LegalNotice />

      <div className={styles.mainContent}>
        {/* Panel de juego */}
        <div className={styles.gamePanel}>
          <h2 className={styles.panelTitle}>Elige tu jugada</h2>

          <div className={styles.opciones}>
            {OPCIONES.map((opcion) => (
              <button
                key={opcion.id}
                onClick={() => jugar(opcion.id)}
                className={`${styles.opcionBtn} ${eleccionJugador === opcion.id ? styles.selected : ''}`}
                disabled={animando}
              >
                <span className={styles.opcionEmoji}>{opcion.emoji}</span>
                <span className={styles.opcionNombre}>{opcion.nombre}</span>
              </button>
            ))}
          </div>

          {/* Arena de batalla */}
          <div className={styles.arena}>
            <div className={styles.jugador}>
              <span className={styles.jugadorLabel}>Tú</span>
              <div className={`${styles.eleccion} ${eleccionJugador ? styles.mostrar : ''}`}>
                {eleccionJugador ? (
                  <span className={styles.eleccionEmoji}>
                    {getOpcionInfo(eleccionJugador)?.emoji}
                  </span>
                ) : (
                  <span className={styles.esperando}>❓</span>
                )}
              </div>
            </div>

            <div className={styles.vs}>
              {animando ? (
                <div className={styles.pensando}>🤔</div>
              ) : resultado ? (
                <div className={`${styles.resultadoIcono} ${styles[resultado]}`}>
                  {resultado === 'ganaste' && '🎉'}
                  {resultado === 'perdiste' && '😢'}
                  {resultado === 'empate' && '🤝'}
                </div>
              ) : (
                <span>VS</span>
              )}
            </div>

            <div className={styles.computadora}>
              <span className={styles.jugadorLabel}>PC</span>
              <div className={`${styles.eleccion} ${eleccionPC ? styles.mostrar : ''}`}>
                {animando ? (
                  <span className={styles.animandoEleccion}>🎲</span>
                ) : eleccionPC ? (
                  <span className={styles.eleccionEmoji}>
                    {getOpcionInfo(eleccionPC)?.emoji}
                  </span>
                ) : (
                  <span className={styles.esperando}>❓</span>
                )}
              </div>
            </div>
          </div>

          {/* Resultado */}
          {resultado && !animando && (
            <div className={`${styles.resultadoPanel} ${styles[resultado]}`}>
              <span className={styles.resultadoTexto}>
                {resultado === 'ganaste' && '¡Ganaste! 🎊'}
                {resultado === 'perdiste' && 'Perdiste 😔'}
                {resultado === 'empate' && '¡Empate! 🤝'}
              </span>
              <span className={styles.resultadoDetalle}>
                {getOpcionInfo(eleccionJugador)?.nombre} vs {getOpcionInfo(eleccionPC)?.nombre}
              </span>
            </div>
          )}
        </div>

        {/* Panel de estadísticas */}
        <div className={styles.statsPanel}>
          <div className={styles.statsHeader}>
            <h2 className={styles.panelTitle}>Estadísticas</h2>
            <button onClick={reiniciarStats} className={styles.resetBtn}>
              🔄 Reiniciar
            </button>
          </div>

          <div className={styles.statsGrid}>
            <div className={`${styles.statCard} ${styles.victorias}`}>
              <span className={styles.statValor}>{estadisticas.victorias}</span>
              <span className={styles.statLabel}>Victorias</span>
            </div>
            <div className={`${styles.statCard} ${styles.derrotas}`}>
              <span className={styles.statValor}>{estadisticas.derrotas}</span>
              <span className={styles.statLabel}>Derrotas</span>
            </div>
            <div className={`${styles.statCard} ${styles.empates}`}>
              <span className={styles.statValor}>{estadisticas.empates}</span>
              <span className={styles.statLabel}>Empates</span>
            </div>
          </div>

          <div className={styles.statsExtra}>
            <div className={styles.statRow}>
              <span>Total partidas:</span>
              <strong>{totalPartidas}</strong>
            </div>
            <div className={styles.statRow}>
              <span>% Victorias:</span>
              <strong>{porcentajeVictorias}%</strong>
            </div>
            <div className={styles.statRow}>
              <span>Racha actual:</span>
              <strong>{estadisticas.rachaActual} 🔥</strong>
            </div>
            <div className={styles.statRow}>
              <span>Mejor racha:</span>
              <strong>{estadisticas.mejorRacha} 🏆</strong>
            </div>
          </div>

          {/* Barra de progreso */}
          {totalPartidas > 0 && (
            <div className={styles.progressBar}>
              <div
                className={styles.progressVictorias}
                style={{ width: `${(estadisticas.victorias / totalPartidas) * 100}%` }}
              />
              <div
                className={styles.progressEmpates}
                style={{ width: `${(estadisticas.empates / totalPartidas) * 100}%` }}
              />
              <div
                className={styles.progressDerrotas}
                style={{ width: `${(estadisticas.derrotas / totalPartidas) * 100}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Reglas */}
      <div className={styles.infoPanel}>
        <h3>Reglas del juego</h3>
        <div className={styles.reglas}>
          <div className={styles.regla}>
            <span>🪨 → ✂️</span>
            <p>Piedra aplasta Tijera</p>
          </div>
          <div className={styles.regla}>
            <span>✂️ → 📄</span>
            <p>Tijera corta Papel</p>
          </div>
          <div className={styles.regla}>
            <span>📄 → 🪨</span>
            <p>Papel envuelve Piedra</p>
          </div>
        </div>
      </div>

      {/* Contenido educativo colapsable */}
      <EducationalSection
        title="¿Quieres saber más sobre Piedra, Papel o Tijera?"
        subtitle="Variantes del juego, estrategias, curiosidades y preguntas frecuentes"
      >
        {/* ── SECCIÓN 1: Tabla Comparativa ── */}
        <section className={styles.guideSection}>
          <h2>Variantes del juego</h2>
          <p>
            Piedra-Papel-Tijera tiene múltiples variantes según el número de jugadores y
            la complejidad deseada. Aquí las cuatro más populares.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Variante</th>
                  <th>Gestos</th>
                  <th>Prob. empate</th>
                  <th>Estrategia óptima</th>
                  <th>Dificultad</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>🪨 Clásico</td>
                  <td>3</td>
                  <td>1/3 (33,3 %)</td>
                  <td>Aleatoriedad uniforme</td>
                  <td>Baja</td>
                </tr>
                <tr>
                  <td>🖖 Piedra-Papel-Tijera-Lagarto-Spock</td>
                  <td>5</td>
                  <td>1/5 (20 %)</td>
                  <td>Aleatoriedad uniforme</td>
                  <td>Media</td>
                </tr>
                <tr>
                  <td>👥 Multijugador (3+ personas)</td>
                  <td>3</td>
                  <td>Alta si todos coinciden</td>
                  <td>Observar tendencias del grupo</td>
                  <td>Media</td>
                </tr>
                <tr>
                  <td>🏆 Torneo eliminatorio</td>
                  <td>3</td>
                  <td>Variable por ronda</td>
                  <td>Gestión psicológica por rondas</td>
                  <td>Alta</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── SECCIÓN 2: Casos de Uso ── */}
        <section className={styles.guideSection}>
          <h2>¿Cuándo usar Piedra-Papel-Tijera?</h2>
          <p>
            Más allá del entretenimiento, el juego tiene usos prácticos en la vida cotidiana
            y en la educación.
          </p>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🍽️</span>
                <h4>Tomar decisiones triviales</h4>
              </div>
              <p className={styles.escenarioExample}>
                ¿Quién lava los platos esta noche? En lugar de discutir, una ronda de
                Piedra-Papel-Tijera resuelve el dilema en segundos de forma completamente
                justa y sin resentimientos.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: para decisiones importantes, mejor tres rondas (al mejor de tres)
                para reducir la influencia del azar puro.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🤝</span>
                <h4>Romper el hielo en grupos</h4>
              </div>
              <p className={styles.escenarioExample}>
                En dinámicas de equipo o reuniones con personas que no se conocen, un
                torneo rápido de Piedra-Papel-Tijera genera risa, reduce tensiones y
                fomenta la interacción natural entre participantes.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: los torneos por eliminación con 8-16 participantes son ideales
                para grupos medianos y duran menos de 5 minutos.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">📐</span>
                <h4>Entender probabilidad y aleatoriedad</h4>
              </div>
              <p className={styles.escenarioExample}>
                El juego es una herramienta educativa excelente para explicar conceptos
                como probabilidad uniforme, sesgo cognitivo, teoría de juegos y la
                diferencia entre aleatoriedad real y percibida.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: registrar 50+ partidas y analizar la frecuencia de cada gesto
                revela patrones inconscientes fascinantes.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 3: FAQ ── */}
        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes</h2>
          <ul className={styles.faqList}>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Existe alguna estrategia ganadora en Piedra-Papel-Tijera?</summary>
                <p>
                  Contra una máquina que elige al azar (como esta app), no existe estrategia
                  que mejore el 33,3 % de victorias a largo plazo. Sin embargo, contra humanos
                  sí hay ventaja: los jugadores tienen sesgos inconscientes y patrones repetibles
                  que un observador atento puede explotar. La estrategia óptima contra humanos
                  es observar y adaptar.
                </p>
                <p className={styles.faqTip}>
                  Dato: en el Campeonato Mundial de RPS, los jugadores expertos estudian
                  microexpresiones y patrones del rival entre rondas.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Cuál es la jugada más elegida por los humanos?</summary>
                <p>
                  Según investigaciones en teoría de juegos, la Piedra es la jugada más
                  frecuente entre jugadores humanos, especialmente en la primera ronda.
                  Los hombres eligen Piedra con mayor frecuencia que las mujeres. El Papel
                  suele ser la jugada menos elegida espontáneamente.
                </p>
                <p className={styles.faqTip}>
                  Implicación práctica: si no sabes nada de tu rival, elegir Papel en la
                  primera ronda tiene ligera ventaja estadística.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Qué es el sesgo de repetición en este juego?</summary>
                <p>
                  El sesgo de repetición es la tendencia humana a repetir la misma jugada
                  después de ganar con ella (&quot;si funcionó, lo repito&quot;) o a cambiar después
                  de perder. Los jugadores experimentados explotan este sesgo: si tu rival
                  acaba de ganar con Piedra, probablemente vuelva a elegir Piedra, por lo
                  que deberías elegir Papel.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Cómo funciona el Campeonato Mundial de RPS?</summary>
                <p>
                  La World RPS Society organiza competiciones donde los jugadores compiten
                  en formato torneo. Se juega al mejor de tres rondas por partida. Los
                  competidores avanzados estudian el lenguaje corporal del rival, sus
                  tendencias previas y emplean técnicas de bluff para ser impredecibles.
                  El campeonato fue muy popular en Canadá durante los años 2000.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Puede una IA ganar siempre a Piedra-Papel-Tijera?</summary>
                <p>
                  Sí, si la IA puede leer la intención del jugador antes de que este
                  ejecute el gesto. Investigadores del MIT desarrollaron un sistema de
                  visión artificial que detecta microgestos musculares y predice la jugada
                  con alta precisión. Contra humanos predecibles, una IA que analice el
                  historial de partidas puede superar el 50 % de victorias con facilidad.
                  Esta app, sin embargo, elige al azar para garantizar una experiencia justa.
                </p>
              </details>
            </li>
          </ul>
        </section>

        {/* ── SECCIÓN 4: Guía Paso a Paso ── */}
        <section className={styles.guideSection}>
          <h2>Cómo mejorar contra jugadores humanos: 5 pasos</h2>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">1</span>
              <div className={styles.stepContent}>
                <strong>Observa los patrones de tu oponente</strong>
                <p>
                  Presta atención a qué jugada elige más veces. La mayoría de las personas
                  no son realmente aleatorias: tienden a repetir jugadas ganadoras o a
                  seguir secuencias inconscientemente (piedra → papel → tijera).
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">2</span>
              <div className={styles.stepContent}>
                <strong>No repitas la misma jugada tres veces seguidas</strong>
                <p>
                  La repetición es el patrón más fácil de detectar y explotar. Si has
                  elegido Piedra dos veces, evita hacerlo una tercera: tu rival lo anticipará.
                  Mezcla tus jugadas de forma consciente.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">3</span>
              <div className={styles.stepContent}>
                <strong>Después de que el rival pierda, tiende a repetir</strong>
                <p>
                  Psicológicamente, cuando alguien pierde con una jugada, a menudo la
                  repite creyendo que &quot;era buena pero mala suerte&quot;. Si acabas de ganarle
                  a su Tijera con Piedra, es probable que vuelva a elegir Tijera: prepara
                  de nuevo Piedra.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">4</span>
              <div className={styles.stepContent}>
                <strong>Tras un empate, el oponente suele cambiar de jugada</strong>
                <p>
                  Después de un empate, la mayoría de los jugadores sienten presión por
                  cambiar. Si empatasteis con Papel, anticipa que tu rival cambiará a
                  Tijera o Piedra. Elegir Tijera en este momento tiene ventaja estadística.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">5</span>
              <div className={styles.stepContent}>
                <strong>Usa aleatoriedad verdadera para ser impredecible</strong>
                <p>
                  Si tu rival también lee patrones, la mejor defensa es ser genuinamente
                  impredecible. Usa un método externo para elegir (dado mental, número de
                  objetos en tu campo visual) de modo que tus jugadas no sigan ningún
                  patrón consciente o inconsciente.
                </p>
              </div>
            </li>
          </ol>
        </section>

        {/* ── SECCIÓN 5: Mejores Prácticas ── */}
        <section className={styles.guideSection}>
          <h2>4 consejos para sacar más partido al juego</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">👁️</span>
              <h4>Observa las tendencias del rival</h4>
              <p>
                Lleva un conteo mental de cuántas veces elige cada gesto. Con 10 o más
                rondas puedes detectar preferencias inconscientes y ajustar tu estrategia
                para aprovecharlas.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔀</span>
              <h4>Evita patrones predecibles propios</h4>
              <p>
                Vigila tu propio historial. Si la app de estadísticas muestra que juegas
                Piedra el 50 % del tiempo, un rival humano que lo note siempre elegirá
                Papel y ganará sistemáticamente.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">⚖️</span>
              <h4>Usa el juego para decisiones justas</h4>
              <p>
                Piedra-Papel-Tijera es matemáticamente justo: ninguna jugada tiene ventaja
                inherente. Úsalo como árbitro neutro en decisiones cotidianas para evitar
                conflictos y negociaciones interminables.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📊</span>
              <h4>Conoce las estadísticas de frecuencia</h4>
              <p>
                La Piedra es elegida ~35 % de las veces, Papel ~33 % y Tijera ~32 % en
                jugadores sin entrenamiento. Conocer estos datos te da una ligera ventaja
                inicial al elegir Papel en rondas de apertura contra rivales desconocidos.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 6: Warning Box ── */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <h3>4 errores comunes al jugar Piedra-Papel-Tijera</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Creer que el juego es puramente aleatorio.</strong> Contra
                humanos existen sesgos cognitivos bien documentados (preferencia por
                Piedra, sesgo de repetición) que hacen que el resultado no sea 33/33/33.
                Ignorar esto te pone en desventaja frente a un rival consciente de ello.
              </li>
              <li>
                <strong>Apostar dinero real con desconocidos.</strong> Aunque parezca un
                juego de azar puro, un rival experimentado puede tener ventaja real al
                detectar y explotar tus patrones. No apuestes sumas significativas en
                contextos informales o con personas que desconoces.
              </li>
              <li>
                <strong>Creer que una racha predice el siguiente resultado.</strong> Haber
                ganado 5 veces seguidas no aumenta ni reduce la probabilidad de ganar la
                siguiente ronda. Cada partida es independiente. La &quot;racha caliente&quot; es
                una falacia cognitiva llamada falacia del jugador.
              </li>
              <li>
                <strong>Usar solo Piedra-Papel-Tijera para decisiones verdaderamente importantes.</strong>{' '}
                El juego es ideal para decidir quién lava los platos, no para tomar
                decisiones con consecuencias económicas, legales o de salud relevantes.
                Para esas situaciones, usa procesos de toma de decisiones estructurados.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('juego-piedra-papel-tijera')} />

      <ShareCard appName="juego-piedra-papel-tijera" />
      <Footer appName="juego-piedra-papel-tijera" />
    </div>
  );
}
