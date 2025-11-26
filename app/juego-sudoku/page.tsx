'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './JuegoSudoku.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';

type Dificultad = 'facil' | 'medio' | 'dificil';
type Tablero = (number | null)[][];
type Notas = Set<number>[][];

interface Estadisticas {
  partidasJugadas: number;
  partidasGanadas: number;
  mejorTiempoFacil: number | null;
  mejorTiempoMedio: number | null;
  mejorTiempoDificil: number | null;
}

const CELDAS_A_QUITAR: Record<Dificultad, number> = {
  facil: 35,
  medio: 45,
  dificil: 55,
};

export default function JuegoSudokuPage() {
  const [tableroInicial, setTableroInicial] = useState<Tablero>([]);
  const [tablero, setTablero] = useState<Tablero>([]);
  const [solucion, setSolucion] = useState<Tablero>([]);
  const [notas, setNotas] = useState<Notas>([]);
  const [celdaSeleccionada, setCeldaSeleccionada] = useState<[number, number] | null>(null);
  const [dificultad, setDificultad] = useState<Dificultad>('facil');
  const [tiempo, setTiempo] = useState(0);
  const [juegoActivo, setJuegoActivo] = useState(false);
  const [victoria, setVictoria] = useState(false);
  const [errores, setErrores] = useState<Set<string>>(new Set());
  const [modoNotas, setModoNotas] = useState(false);
  const [estadisticas, setEstadisticas] = useState<Estadisticas>({
    partidasJugadas: 0,
    partidasGanadas: 0,
    mejorTiempoFacil: null,
    mejorTiempoMedio: null,
    mejorTiempoDificil: null,
  });

  // Cargar estadísticas
  useEffect(() => {
    const saved = localStorage.getItem('meskeia-sudoku-stats');
    if (saved) {
      setEstadisticas(JSON.parse(saved));
    }
  }, []);

  // Guardar estadísticas
  const guardarEstadisticas = useCallback((newStats: Estadisticas) => {
    setEstadisticas(newStats);
    localStorage.setItem('meskeia-sudoku-stats', JSON.stringify(newStats));
  }, []);

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (juegoActivo && !victoria) {
      interval = setInterval(() => {
        setTiempo(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [juegoActivo, victoria]);

  // Generar tablero Sudoku válido
  const generarSolucion = useCallback((): Tablero => {
    const tablero: Tablero = Array(9).fill(null).map(() => Array(9).fill(null));

    const esValido = (tablero: Tablero, fila: number, col: number, num: number): boolean => {
      // Verificar fila
      for (let x = 0; x < 9; x++) {
        if (tablero[fila][x] === num) return false;
      }
      // Verificar columna
      for (let x = 0; x < 9; x++) {
        if (tablero[x][col] === num) return false;
      }
      // Verificar cuadrante 3x3
      const startRow = Math.floor(fila / 3) * 3;
      const startCol = Math.floor(col / 3) * 3;
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (tablero[startRow + i][startCol + j] === num) return false;
        }
      }
      return true;
    };

    const resolver = (tablero: Tablero): boolean => {
      for (let fila = 0; fila < 9; fila++) {
        for (let col = 0; col < 9; col++) {
          if (tablero[fila][col] === null) {
            const numeros = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
            for (const num of numeros) {
              if (esValido(tablero, fila, col, num)) {
                tablero[fila][col] = num;
                if (resolver(tablero)) return true;
                tablero[fila][col] = null;
              }
            }
            return false;
          }
        }
      }
      return true;
    };

    resolver(tablero);
    return tablero;
  }, []);

  // Crear puzzle quitando números
  const crearPuzzle = useCallback((solucion: Tablero, dificultad: Dificultad): Tablero => {
    const puzzle = solucion.map(fila => [...fila]);
    const celdasAQuitar = CELDAS_A_QUITAR[dificultad];

    const posiciones: [number, number][] = [];
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        posiciones.push([i, j]);
      }
    }

    // Mezclar posiciones
    posiciones.sort(() => Math.random() - 0.5);

    for (let i = 0; i < celdasAQuitar && i < posiciones.length; i++) {
      const [fila, col] = posiciones[i];
      puzzle[fila][col] = null;
    }

    return puzzle;
  }, []);

  // Iniciar nuevo juego
  const nuevoJuego = useCallback((dif: Dificultad = dificultad) => {
    const sol = generarSolucion();
    const puzzle = crearPuzzle(sol, dif);

    setSolucion(sol);
    setTableroInicial(puzzle.map(fila => [...fila]));
    setTablero(puzzle.map(fila => [...fila]));
    setNotas(Array(9).fill(null).map(() => Array(9).fill(null).map(() => new Set<number>())));
    setCeldaSeleccionada(null);
    setDificultad(dif);
    setTiempo(0);
    setJuegoActivo(true);
    setVictoria(false);
    setErrores(new Set());
    setModoNotas(false);

    guardarEstadisticas({
      ...estadisticas,
      partidasJugadas: estadisticas.partidasJugadas + 1,
    });
  }, [dificultad, generarSolucion, crearPuzzle, estadisticas, guardarEstadisticas]);

  // Verificar victoria
  const verificarVictoria = useCallback((nuevoTablero: Tablero): boolean => {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (nuevoTablero[i][j] !== solucion[i][j]) return false;
      }
    }
    return true;
  }, [solucion]);

  // Encontrar errores
  const encontrarErrores = useCallback((nuevoTablero: Tablero): Set<string> => {
    const erroresNuevos = new Set<string>();

    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        const valor = nuevoTablero[i][j];
        if (valor === null) continue;

        // Verificar fila
        for (let x = 0; x < 9; x++) {
          if (x !== j && nuevoTablero[i][x] === valor) {
            erroresNuevos.add(`${i}-${j}`);
            erroresNuevos.add(`${i}-${x}`);
          }
        }

        // Verificar columna
        for (let x = 0; x < 9; x++) {
          if (x !== i && nuevoTablero[x][j] === valor) {
            erroresNuevos.add(`${i}-${j}`);
            erroresNuevos.add(`${x}-${j}`);
          }
        }

        // Verificar cuadrante 3x3
        const startRow = Math.floor(i / 3) * 3;
        const startCol = Math.floor(j / 3) * 3;
        for (let di = 0; di < 3; di++) {
          for (let dj = 0; dj < 3; dj++) {
            const ni = startRow + di;
            const nj = startCol + dj;
            if ((ni !== i || nj !== j) && nuevoTablero[ni][nj] === valor) {
              erroresNuevos.add(`${i}-${j}`);
              erroresNuevos.add(`${ni}-${nj}`);
            }
          }
        }
      }
    }

    return erroresNuevos;
  }, []);

  // Colocar número
  const colocarNumero = useCallback((num: number | null) => {
    if (!celdaSeleccionada || !juegoActivo || victoria) return;

    const [fila, col] = celdaSeleccionada;

    // No modificar celdas fijas
    if (tableroInicial[fila][col] !== null) return;

    if (modoNotas && num !== null) {
      // Modo notas
      const nuevasNotas = notas.map(f => f.map(c => new Set(c)));
      if (nuevasNotas[fila][col].has(num)) {
        nuevasNotas[fila][col].delete(num);
      } else {
        nuevasNotas[fila][col].add(num);
      }
      setNotas(nuevasNotas);
    } else {
      // Modo normal
      const nuevoTablero = tablero.map(f => [...f]);
      nuevoTablero[fila][col] = num;
      setTablero(nuevoTablero);

      // Limpiar notas de la celda
      if (num !== null) {
        const nuevasNotas = notas.map(f => f.map(c => new Set(c)));
        nuevasNotas[fila][col].clear();
        setNotas(nuevasNotas);
      }

      // Verificar errores
      const nuevosErrores = encontrarErrores(nuevoTablero);
      setErrores(nuevosErrores);

      // Verificar victoria
      if (nuevosErrores.size === 0 && verificarVictoria(nuevoTablero)) {
        setVictoria(true);
        setJuegoActivo(false);

        // Actualizar estadísticas
        const newStats = { ...estadisticas, partidasGanadas: estadisticas.partidasGanadas + 1 };
        const tiempoKey = `mejorTiempo${dificultad.charAt(0).toUpperCase() + dificultad.slice(1)}` as keyof Estadisticas;
        const mejorTiempoActual = newStats[tiempoKey] as number | null;

        if (mejorTiempoActual === null || tiempo < mejorTiempoActual) {
          (newStats as Record<string, number | null>)[tiempoKey] = tiempo;
        }

        guardarEstadisticas(newStats);
      }
    }
  }, [celdaSeleccionada, juegoActivo, victoria, tableroInicial, tablero, modoNotas, notas, encontrarErrores, verificarVictoria, estadisticas, dificultad, tiempo, guardarEstadisticas]);

  // Dar pista
  const darPista = useCallback(() => {
    if (!juegoActivo || victoria) return;

    // Encontrar celda vacía aleatoria
    const celdasVacias: [number, number][] = [];
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (tablero[i][j] === null) {
          celdasVacias.push([i, j]);
        }
      }
    }

    if (celdasVacias.length === 0) return;

    const [fila, col] = celdasVacias[Math.floor(Math.random() * celdasVacias.length)];
    const nuevoTablero = tablero.map(f => [...f]);
    nuevoTablero[fila][col] = solucion[fila][col];
    setTablero(nuevoTablero);

    // También actualizar tablero inicial para marcar como fija
    const nuevoInicial = tableroInicial.map(f => [...f]);
    nuevoInicial[fila][col] = solucion[fila][col];
    setTableroInicial(nuevoInicial);

    setCeldaSeleccionada([fila, col]);

    // Verificar victoria
    const nuevosErrores = encontrarErrores(nuevoTablero);
    setErrores(nuevosErrores);

    if (nuevosErrores.size === 0 && verificarVictoria(nuevoTablero)) {
      setVictoria(true);
      setJuegoActivo(false);
    }
  }, [juegoActivo, victoria, tablero, solucion, tableroInicial, encontrarErrores, verificarVictoria]);

  // Contar números colocados
  const contarNumero = useCallback((num: number): number => {
    if (tablero.length === 0) return 0;
    let count = 0;
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (tablero[i]?.[j] === num) count++;
      }
    }
    return count;
  }, [tablero]);

  // Teclado físico
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!juegoActivo || victoria) return;

      if (e.key >= '1' && e.key <= '9') {
        colocarNumero(parseInt(e.key));
      } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
        colocarNumero(null);
      } else if (e.key === 'n' || e.key === 'N') {
        setModoNotas(m => !m);
      } else if (celdaSeleccionada) {
        const [fila, col] = celdaSeleccionada;
        if (e.key === 'ArrowUp' && fila > 0) {
          setCeldaSeleccionada([fila - 1, col]);
        } else if (e.key === 'ArrowDown' && fila < 8) {
          setCeldaSeleccionada([fila + 1, col]);
        } else if (e.key === 'ArrowLeft' && col > 0) {
          setCeldaSeleccionada([fila, col - 1]);
        } else if (e.key === 'ArrowRight' && col < 8) {
          setCeldaSeleccionada([fila, col + 1]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [juegoActivo, victoria, celdaSeleccionada, colocarNumero]);

  // Formatear tiempo
  const formatearTiempo = (segundos: number): string => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Iniciar primer juego
  useEffect(() => {
    nuevoJuego('facil');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>🔢 Sudoku</h1>
        <p className={styles.subtitle}>Completa la cuadrícula con números del 1 al 9</p>
      </header>

      {/* Controles superiores */}
      <div className={styles.topControls}>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <div className={styles.statLabel}>Tiempo</div>
            <div className={styles.statValue}>{formatearTiempo(tiempo)}</div>
          </div>
        </div>

        <div className={styles.difficultySelector}>
          {(['facil', 'medio', 'dificil'] as Dificultad[]).map((dif) => (
            <button
              key={dif}
              className={`${styles.difficultyBtn} ${dificultad === dif ? styles.active : ''}`}
              onClick={() => nuevoJuego(dif)}
            >
              {dif === 'facil' ? 'Fácil' : dif === 'medio' ? 'Medio' : 'Difícil'}
            </button>
          ))}
        </div>
      </div>

      {/* Mensaje de victoria */}
      {victoria && (
        <div className={`${styles.mensaje} ${styles.victoria}`}>
          🎉 ¡Completado en {formatearTiempo(tiempo)}!
        </div>
      )}

      {/* Tablero */}
      {tablero.length > 0 && (
        <div className={styles.tablero}>
          {tablero.map((fila, i) =>
            fila.map((valor, j) => {
              const esFija = tableroInicial[i]?.[j] !== null;
              const esSeleccionada = celdaSeleccionada?.[0] === i && celdaSeleccionada?.[1] === j;
              const esError = errores.has(`${i}-${j}`);
              const valorSeleccionado = celdaSeleccionada ? tablero[celdaSeleccionada[0]][celdaSeleccionada[1]] : null;
              const esMismoNumero = valor !== null && valor === valorSeleccionado && !esSeleccionada;
              const notasCelda = notas[i]?.[j];

              return (
                <div
                  key={`${i}-${j}`}
                  className={`${styles.celda}
                    ${esFija ? styles.fija : ''}
                    ${esSeleccionada ? styles.seleccionada : ''}
                    ${esError ? styles.error : ''}
                    ${esMismoNumero ? styles.mismoNumero : ''}
                    ${!esFija && valor !== null ? styles.correcto : ''}`}
                  onClick={() => !victoria && setCeldaSeleccionada([i, j])}
                >
                  {valor !== null ? (
                    valor
                  ) : notasCelda && notasCelda.size > 0 ? (
                    <div className={styles.notas}>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                        <span key={n} className={styles.nota}>
                          {notasCelda.has(n) ? n : ''}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Teclado numérico */}
      <div className={styles.teclado}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => {
          const count = contarNumero(num);
          const completo = count >= 9;

          return (
            <button
              key={num}
              className={`${styles.teclaNum} ${completo ? styles.completo : ''}`}
              onClick={() => colocarNumero(num)}
              disabled={!juegoActivo || victoria}
            >
              {num}
            </button>
          );
        })}
      </div>

      {/* Botones de acción */}
      <div className={styles.acciones}>
        <button
          className={`${styles.btnAccion} ${styles.btnNuevo}`}
          onClick={() => nuevoJuego()}
        >
          🔄 Nuevo juego
        </button>
        <button
          className={`${styles.btnAccion} ${modoNotas ? styles.modoNotas : ''}`}
          onClick={() => setModoNotas(m => !m)}
          disabled={!juegoActivo || victoria}
        >
          ✏️ {modoNotas ? 'Modo notas ON' : 'Notas (N)'}
        </button>
        <button
          className={styles.btnAccion}
          onClick={() => colocarNumero(null)}
          disabled={!juegoActivo || victoria || !celdaSeleccionada}
        >
          ⌫ Borrar
        </button>
        <button
          className={styles.btnAccion}
          onClick={darPista}
          disabled={!juegoActivo || victoria}
        >
          💡 Pista
        </button>
      </div>

      {/* Estadísticas */}
      <div className={styles.estadisticas}>
        <h3>📊 Estadísticas</h3>
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <div className={styles.valor}>{estadisticas.partidasJugadas}</div>
            <div className={styles.label}>Partidas</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.valor}>{estadisticas.partidasGanadas}</div>
            <div className={styles.label}>Ganadas</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.valor}>
              {estadisticas.partidasJugadas > 0
                ? Math.round((estadisticas.partidasGanadas / estadisticas.partidasJugadas) * 100)
                : 0}%
            </div>
            <div className={styles.label}>Ratio</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.valor}>
              {estadisticas.mejorTiempoFacil ? formatearTiempo(estadisticas.mejorTiempoFacil) : '-'}
            </div>
            <div className={styles.label}>Mejor Fácil</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.valor}>
              {estadisticas.mejorTiempoMedio ? formatearTiempo(estadisticas.mejorTiempoMedio) : '-'}
            </div>
            <div className={styles.label}>Mejor Medio</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.valor}>
              {estadisticas.mejorTiempoDificil ? formatearTiempo(estadisticas.mejorTiempoDificil) : '-'}
            </div>
            <div className={styles.label}>Mejor Difícil</div>
          </div>
        </div>
      </div>

      <Footer appName="juego-sudoku" />
    </div>
  );
}
