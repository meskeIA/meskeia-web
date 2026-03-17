'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './JuegoTresEnRaya.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice, ShareCard, EducationalSection } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

type Casilla = 'X' | 'O' | null;
type Tablero = Casilla[];
type Dificultad = 'facil' | 'medio' | 'dificil';

interface Estadisticas {
  victorias: number;
  derrotas: number;
  empates: number;
}

const LINEAS_GANADORAS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Filas
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columnas
  [0, 4, 8], [2, 4, 6],            // Diagonales
];

// Verificar ganador
const verificarGanador = (tablero: Tablero): Casilla => {
  for (const [a, b, c] of LINEAS_GANADORAS) {
    if (tablero[a] && tablero[a] === tablero[b] && tablero[a] === tablero[c]) {
      return tablero[a];
    }
  }
  return null;
};

// Verificar empate
const verificarEmpate = (tablero: Tablero): boolean => {
  return tablero.every(casilla => casilla !== null) && !verificarGanador(tablero);
};

// Obtener casillas vacías
const casillasVacias = (tablero: Tablero): number[] => {
  return tablero.reduce<number[]>((acc, casilla, index) => {
    if (casilla === null) acc.push(index);
    return acc;
  }, []);
};

// Minimax para IA difícil
const minimax = (tablero: Tablero, profundidad: number, esMaximizando: boolean): number => {
  const ganador = verificarGanador(tablero);
  if (ganador === 'O') return 10 - profundidad;
  if (ganador === 'X') return profundidad - 10;
  if (verificarEmpate(tablero)) return 0;

  const vacias = casillasVacias(tablero);

  if (esMaximizando) {
    let mejorPuntuacion = -Infinity;
    for (const i of vacias) {
      tablero[i] = 'O';
      mejorPuntuacion = Math.max(mejorPuntuacion, minimax(tablero, profundidad + 1, false));
      tablero[i] = null;
    }
    return mejorPuntuacion;
  } else {
    let mejorPuntuacion = Infinity;
    for (const i of vacias) {
      tablero[i] = 'X';
      mejorPuntuacion = Math.min(mejorPuntuacion, minimax(tablero, profundidad + 1, true));
      tablero[i] = null;
    }
    return mejorPuntuacion;
  }
};

// Movimiento de la IA
const movimientoIA = (tablero: Tablero, dificultad: Dificultad): number => {
  const vacias = casillasVacias(tablero);
  if (vacias.length === 0) return -1;

  // Fácil: movimiento aleatorio
  if (dificultad === 'facil') {
    return vacias[Math.floor(Math.random() * vacias.length)];
  }

  // Medio: 50% óptimo, 50% aleatorio
  if (dificultad === 'medio' && Math.random() < 0.5) {
    return vacias[Math.floor(Math.random() * vacias.length)];
  }

  // Difícil (o medio con suerte): minimax
  let mejorMovimiento = vacias[0];
  let mejorPuntuacion = -Infinity;

  for (const i of vacias) {
    const nuevoTablero = [...tablero];
    nuevoTablero[i] = 'O';
    const puntuacion = minimax(nuevoTablero, 0, false);
    if (puntuacion > mejorPuntuacion) {
      mejorPuntuacion = puntuacion;
      mejorMovimiento = i;
    }
  }

  return mejorMovimiento;
};

export default function JuegoTresEnRayaPage() {
  const [tablero, setTablero] = useState<Tablero>(Array(9).fill(null));
  const [turnoJugador, setTurnoJugador] = useState(true);
  const [ganador, setGanador] = useState<Casilla>(null);
  const [empate, setEmpate] = useState(false);
  const [dificultad, setDificultad] = useState<Dificultad>('medio');
  const [lineaGanadora, setLineaGanadora] = useState<number[]>([]);
  const [estadisticas, setEstadisticas] = useState<Estadisticas>({
    victorias: 0,
    derrotas: 0,
    empates: 0,
  });

  // Cargar estadísticas
  useEffect(() => {
    const saved = localStorage.getItem('ttt-stats');
    if (saved) {
      try {
        setEstadisticas(JSON.parse(saved));
      } catch {
        // Ignorar
      }
    }
  }, []);

  // Guardar estadísticas
  const guardarStats = useCallback((stats: Estadisticas) => {
    localStorage.setItem('ttt-stats', JSON.stringify(stats));
  }, []);

  // Turno de la IA
  useEffect(() => {
    if (!turnoJugador && !ganador && !empate) {
      const timeout = setTimeout(() => {
        const movimiento = movimientoIA(tablero, dificultad);
        if (movimiento !== -1) {
          const nuevoTablero = [...tablero];
          nuevoTablero[movimiento] = 'O';
          setTablero(nuevoTablero);

          const nuevoGanador = verificarGanador(nuevoTablero);
          if (nuevoGanador) {
            setGanador(nuevoGanador);
            // Encontrar línea ganadora
            for (const linea of LINEAS_GANADORAS) {
              if (nuevoTablero[linea[0]] === nuevoGanador &&
                  nuevoTablero[linea[1]] === nuevoGanador &&
                  nuevoTablero[linea[2]] === nuevoGanador) {
                setLineaGanadora(linea);
                break;
              }
            }
            const nuevasStats = { ...estadisticas, derrotas: estadisticas.derrotas + 1 };
            setEstadisticas(nuevasStats);
            guardarStats(nuevasStats);
          } else if (verificarEmpate(nuevoTablero)) {
            setEmpate(true);
            const nuevasStats = { ...estadisticas, empates: estadisticas.empates + 1 };
            setEstadisticas(nuevasStats);
            guardarStats(nuevasStats);
          } else {
            setTurnoJugador(true);
          }
        }
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [turnoJugador, tablero, ganador, empate, dificultad, estadisticas, guardarStats]);

  // Click en casilla
  const clickCasilla = (index: number) => {
    if (tablero[index] || ganador || empate || !turnoJugador) return;

    const nuevoTablero = [...tablero];
    nuevoTablero[index] = 'X';
    setTablero(nuevoTablero);

    const nuevoGanador = verificarGanador(nuevoTablero);
    if (nuevoGanador) {
      setGanador(nuevoGanador);
      // Encontrar línea ganadora
      for (const linea of LINEAS_GANADORAS) {
        if (nuevoTablero[linea[0]] === nuevoGanador &&
            nuevoTablero[linea[1]] === nuevoGanador &&
            nuevoTablero[linea[2]] === nuevoGanador) {
          setLineaGanadora(linea);
          break;
        }
      }
      const nuevasStats = { ...estadisticas, victorias: estadisticas.victorias + 1 };
      setEstadisticas(nuevasStats);
      guardarStats(nuevasStats);
    } else if (verificarEmpate(nuevoTablero)) {
      setEmpate(true);
      const nuevasStats = { ...estadisticas, empates: estadisticas.empates + 1 };
      setEstadisticas(nuevasStats);
      guardarStats(nuevasStats);
    } else {
      setTurnoJugador(false);
    }
  };

  // Reiniciar juego
  const reiniciar = () => {
    setTablero(Array(9).fill(null));
    setTurnoJugador(true);
    setGanador(null);
    setEmpate(false);
    setLineaGanadora([]);
  };

  // Reiniciar estadísticas
  const reiniciarStats = () => {
    if (confirm('¿Reiniciar todas las estadísticas?')) {
      const nuevasStats = { victorias: 0, derrotas: 0, empates: 0 };
      setEstadisticas(nuevasStats);
      localStorage.removeItem('ttt-stats');
    }
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Tres en Raya</h1>
        <p className={styles.subtitle}>
          El clásico Tic Tac Toe contra la computadora
        </p>
      </header>

      <LegalNotice />

      <div className={styles.mainContent}>
        {/* Panel de juego */}
        <div className={styles.gamePanel}>
          {/* Selector de dificultad */}
          <div className={styles.dificultadSelector}>
            <span className={styles.dificultadLabel}>Dificultad:</span>
            <div className={styles.dificultadBtns}>
              {(['facil', 'medio', 'dificil'] as Dificultad[]).map((d) => (
                <button
                  key={d}
                  onClick={() => { setDificultad(d); reiniciar(); }}
                  className={`${styles.dificultadBtn} ${dificultad === d ? styles.active : ''}`}
                >
                  {d === 'facil' && '😊 Fácil'}
                  {d === 'medio' && '🤔 Medio'}
                  {d === 'dificil' && '🧠 Difícil'}
                </button>
              ))}
            </div>
          </div>

          {/* Estado del juego */}
          <div className={styles.estado}>
            {ganador ? (
              <span className={ganador === 'X' ? styles.victoria : styles.derrota}>
                {ganador === 'X' ? '🎉 ¡Ganaste!' : '😔 Perdiste'}
              </span>
            ) : empate ? (
              <span className={styles.empate}>🤝 ¡Empate!</span>
            ) : (
              <span className={styles.turno}>
                {turnoJugador ? '👤 Tu turno (X)' : '🤖 Pensando...'}
              </span>
            )}
          </div>

          {/* Tablero */}
          <div className={styles.tablero}>
            {tablero.map((casilla, index) => (
              <button
                key={index}
                onClick={() => clickCasilla(index)}
                className={`${styles.casilla} ${casilla ? styles.ocupada : ''} ${lineaGanadora.includes(index) ? styles.ganadora : ''}`}
                disabled={!!casilla || !!ganador || empate || !turnoJugador}
              >
                {casilla && (
                  <span className={casilla === 'X' ? styles.x : styles.o}>
                    {casilla}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Botón reiniciar */}
          <button onClick={reiniciar} className={styles.reiniciarBtn}>
            🔄 Nueva Partida
          </button>
        </div>

        {/* Panel de estadísticas */}
        <div className={styles.statsPanel}>
          <div className={styles.statsHeader}>
            <h2 className={styles.panelTitle}>Estadísticas</h2>
            <button onClick={reiniciarStats} className={styles.resetBtn}>
              🗑️
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

          <div className={styles.leyenda}>
            <div className={styles.leyendaItem}>
              <span className={styles.x}>X</span>
              <span>Tú</span>
            </div>
            <div className={styles.leyendaItem}>
              <span className={styles.o}>O</span>
              <span>Computadora</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido educativo colapsable */}
      <EducationalSection
        title="¿Quieres aprender más sobre el Tres en Raya?"
        subtitle="Variantes del juego, estrategia minimax, FAQ y guía de movimientos óptimos"
        icon="🎮"
      >
        {/* ── SECCIÓN 1: Tabla Comparativa ── */}
        <section className={styles.guideSection}>
          <h2>Variantes del Tres en Raya en el mundo</h2>
          <p>
            El Tic-Tac-Toe clásico es solo el punto de partida. Existen variantes con
            tableros más grandes, más fichas o reglas especiales que aumentan la complejidad
            estratégica considerablemente.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Variante</th>
                  <th>Tablero</th>
                  <th>Condición de victoria</th>
                  <th>Empates posibles</th>
                  <th>Complejidad estratégica</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>🎯 Clásico (Tic-Tac-Toe)</td>
                  <td>3 × 3</td>
                  <td>3 en línea</td>
                  <td>Sí (con juego perfecto)</td>
                  <td>Baja — 255.168 partidas posibles</td>
                </tr>
                <tr>
                  <td>🟢 Gomoku</td>
                  <td>15 × 15</td>
                  <td>5 en línea</td>
                  <td>Muy raros</td>
                  <td>Muy alta — comparable al ajedrez</td>
                </tr>
                <tr>
                  <td>🔵 Cuatro en Raya</td>
                  <td>7 × 6 (vertical)</td>
                  <td>4 en línea</td>
                  <td>Posibles</td>
                  <td>Media — el primer jugador puede forzar victoria</td>
                </tr>
                <tr>
                  <td>🌀 Ultimate Tic-Tac-Toe</td>
                  <td>9 tableros 3 × 3</td>
                  <td>Ganar 3 sub-tableros en línea</td>
                  <td>Raros</td>
                  <td>Alta — posiciones estratégicas encadenadas</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── SECCIÓN 2: Casos de Uso ── */}
        <section className={styles.guideSection}>
          <h2>¿Quién juega al Tres en Raya y para qué?</h2>
          <p>
            Aunque parece un juego simple, el Tres en Raya tiene aplicaciones reales
            en educación, informática y entretenimiento cotidiano.
          </p>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🧒</span>
                <h4>Niños aprendiendo estrategia</h4>
              </div>
              <p className={styles.escenarioExample}>
                Un niño de 6 años aprende a anticipar los movimientos del rival,
                a bloquear amenazas y a planificar con un turno de antelación.
              </p>
              <p className={styles.escenarioTip}>
                El Tres en Raya es el primer juego donde los niños desarrollan
                pensamiento estratégico básico sin reglas complejas.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🤖</span>
                <h4>Introducción al algoritmo minimax</h4>
              </div>
              <p className={styles.escenarioExample}>
                En cursos de IA y teoría de juegos, el Tres en Raya es el ejemplo
                canónico para enseñar minimax porque el árbol de decisión es
                pequeño y tratable manualmente.
              </p>
              <p className={styles.escenarioTip}>
                El minimax implementado en esta app evalúa todas las ramas posibles
                para elegir siempre el movimiento óptimo en dificultad alta.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">⏱️</span>
                <h4>Entretenimiento en esperas cortas</h4>
              </div>
              <p className={styles.escenarioExample}>
                Una partida dura entre 30 segundos y 2 minutos. Ideal para sala
                de espera, transporte público o cualquier pausa breve donde no
                quieres empezar algo largo.
              </p>
              <p className={styles.escenarioTip}>
                Prueba la dificultad &quot;Difícil&quot; si quieres un reto real:
                la IA nunca comete errores con minimax completo.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 3: FAQ ── */}
        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes sobre el Tres en Raya</h2>
          <ul className={styles.faqList}>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Puede ganar siempre el que empieza primero?</summary>
                <p>
                  No necesariamente. Con juego perfecto de ambos jugadores, el resultado
                  siempre es empate independientemente de quién empiece. El primer jugador
                  tiene una ligera ventaja inicial (más casillas a elegir), pero no puede
                  forzar una victoria si el rival juega correctamente.
                </p>
                <p className={styles.faqTip}>
                  Dato: el primer jugador gana en 131.184 posiciones, pierde en 77.904
                  y empata en 46.080 de las 255.168 partidas posibles.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Cuántas combinaciones posibles tiene el Tres en Raya?</summary>
                <p>
                  El árbol de juego completo tiene 255.168 partidas posibles (sin contar
                  simetrías). Si eliminamos posiciones simétricas equivalentes, quedan
                  26.830 posiciones únicas. Es un juego resuelto: el resultado con juego
                  perfecto siempre es empate.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Qué es el algoritmo minimax?</summary>
                <p>
                  Minimax es un algoritmo de teoría de juegos para juegos de suma cero
                  con dos jugadores. Evalúa recursivamente todos los movimientos posibles
                  asumiendo que el rival siempre jugará su mejor movimiento. El jugador
                  MAX intenta maximizar su puntuación; el jugador MIN, minimizarla.
                  Para el Tres en Raya, minimax garantiza juego óptimo perfecto.
                </p>
                <p className={styles.faqTip}>
                  Esta app implementa minimax con poda implícita por profundidad para
                  que la IA en dificultad &quot;Difícil&quot; nunca pueda ser vencida.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Puede vencer una IA perfecta siempre?</summary>
                <p>
                  No. Una IA perfecta (minimax completo) nunca pierde, pero tampoco puede
                  ganar si el rival también juega de forma perfecta. El mejor resultado
                  que puede obtener la IA es el empate. Solo gana cuando el rival comete
                  un error. En dificultad &quot;Difícil&quot; de esta app, la IA no falla nunca.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Por qué siempre acaba en empate entre jugadores expertos?</summary>
                <p>
                  El Tres en Raya es un juego matemáticamente &quot;resuelto&quot;: existe una
                  estrategia perfecta para ambos jugadores que garantiza el empate.
                  Con solo 9 casillas y líneas ganadoras bien estudiadas, un jugador
                  con experiencia reconoce todos los patrones y nunca deja ganar al rival.
                  Por eso se usa como ejemplo de juego trivial en teoría de juegos.
                </p>
              </details>
            </li>
          </ul>
        </section>

        {/* ── SECCIÓN 4: Guía Paso a Paso ── */}
        <section className={styles.guideSection}>
          <h2>Estrategia óptima: 5 principios fundamentales</h2>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">1</span>
              <div className={styles.stepContent}>
                <strong>Ocupa el centro si está libre</strong>
                <p>
                  La casilla central (posición 4) participa en 4 de las 8 líneas ganadoras.
                  Es la posición más poderosa del tablero. Si el centro está libre en tu
                  turno, siempre debes tomarlo.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">2</span>
              <div className={styles.stepContent}>
                <strong>Si el rival ocupa el centro, ve a una esquina</strong>
                <p>
                  Las esquinas participan en 3 líneas ganadoras cada una, frente a las 2
                  de los lados. Si no puedes tomar el centro, una esquina es siempre
                  mejor que un lado.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">3</span>
              <div className={styles.stepContent}>
                <strong>Bloquea siempre las amenazas del rival</strong>
                <p>
                  Si el rival tiene dos fichas en una línea con la tercera casilla vacía,
                  debes bloquear esa casilla inmediatamente. Ignorar una amenaza por
                  atacar es el error más común entre jugadores novatos.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">4</span>
              <div className={styles.stepContent}>
                <strong>Crea un fork (doble amenaza)</strong>
                <p>
                  Un fork es una posición donde tienes dos líneas con dos fichas cada
                  una simultáneamente. El rival solo puede bloquear una, así que ganas
                  por la otra. Crear un fork es la única forma de ganar contra un rival
                  atento que siempre bloquea.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">5</span>
              <div className={styles.stepContent}>
                <strong>Con juego perfecto de ambos, el empate es inevitable</strong>
                <p>
                  Si ambos jugadores aplican estos principios, ninguno puede ganar.
                  El Tres en Raya es un juego resuelto donde el empate es el resultado
                  teórico con estrategia perfecta. Ganar requiere que el rival cometa un error.
                </p>
              </div>
            </li>
          </ol>
        </section>

        {/* ── SECCIÓN 5: Mejores Prácticas ── */}
        <section className={styles.guideSection}>
          <h2>4 principios tácticos para no perder nunca</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🎯</span>
              <h4>El centro es la posición más poderosa</h4>
              <p>
                La casilla central conecta con las 2 diagonales, la fila central
                y la columna central. Ocúpala siempre que puedas. Si la IA la toma
                primero, responde con una esquina, nunca con un lado.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📐</span>
              <h4>Las esquinas superan a los lados</h4>
              <p>
                Cada esquina cubre 3 líneas ganadoras; cada lado solo cubre 2.
                Preferir esquinas sobre lados aumenta tus opciones de fork y
                hace más difícil que el rival te bloquee todas las vías.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">⚡</span>
              <h4>El fork es la única victoria garantizada</h4>
              <p>
                Crear una doble amenaza simultánea (fork) es el único patrón que
                garantiza ganar contra un rival que siempre bloquea. Busca
                posiciones donde un movimiento cree dos amenazas a la vez.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🛡️</span>
              <h4>Bloquea antes de atacar</h4>
              <p>
                Una amenaza del rival no bloqueada se convierte en derrota en
                el siguiente turno. La defensa tiene prioridad absoluta sobre
                el ataque, salvo que tengas una victoria inmediata disponible.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 6: Warning Box ── */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <h3>4 errores que hacen perder al instante</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Ignorar la amenaza del rival por atacar.</strong> Si el rival
                tiene dos fichas en línea y no bloqueas, perderás en el siguiente turno
                sin importar lo buena que sea tu jugada de ataque.
              </li>
              <li>
                <strong>No reconocer el fork del oponente.</strong> Si el rival construye
                silenciosamente una doble amenaza, no habrá forma de bloquear ambas.
                Hay que identificar y neutralizar el fork antes de que se complete.
              </li>
              <li>
                <strong>Jugar los lados cuando el centro está libre.</strong> Los lados
                son las posiciones más débiles del tablero (solo 2 líneas ganadoras).
                Elegirlos sobre el centro o las esquinas limita severamente las opciones.
              </li>
              <li>
                <strong>Subestimar al rival en el primer movimiento.</strong> El primer
                movimiento determina todo el árbol de posibilidades. Una mala elección
                inicial cede la iniciativa y obliga a jugar en modo defensivo el resto
                de la partida.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('juego-tres-en-raya')} />

      <ShareCard appName="juego-tres-en-raya" />
      <Footer appName="juego-tres-en-raya" />
    </div>
  );
}
