'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './JuegoTresEnRaya.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';

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

      <Footer appName="juego-tres-en-raya" />
    </div>
  );
}
