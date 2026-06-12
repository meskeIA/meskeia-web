'use client';
// @disclaimer: exempt

import { useState, useEffect, useCallback } from 'react';
import styles from './JuegoSudoku.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice, ShareCard, EducationalSection } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

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

      <LegalNotice />

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

      {/* Contenido educativo colapsable */}
      <EducationalSection
        title="¿Quieres aprender más sobre Sudoku?"
        subtitle="Técnicas, niveles, consejos y errores frecuentes para dominar el juego"
      >
        {/* ── SECCIÓN 1: Tabla Comparativa de Niveles ── */}
        <section>
          <h2>Niveles de dificultad comparados</h2>
          <p>
            Cada nivel exige un conjunto diferente de técnicas. Conocer qué esperar en cada uno
            te ayuda a elegir el reto adecuado y mejorar progresivamente.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Nivel</th>
                  <th>Celdas dadas</th>
                  <th>Técnicas necesarias</th>
                  <th>Tiempo promedio</th>
                  <th>Estrategia clave</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>🟢 Fácil</td>
                  <td>46 – 50</td>
                  <td>Naked single</td>
                  <td>5 – 10 min</td>
                  <td>Buscar celdas con una sola opción</td>
                </tr>
                <tr>
                  <td>🟡 Medio</td>
                  <td>36 – 45</td>
                  <td>Naked single + hidden single</td>
                  <td>15 – 30 min</td>
                  <td>Identificar números exclusivos por bloque</td>
                </tr>
                <tr>
                  <td>🔴 Difícil</td>
                  <td>26 – 35</td>
                  <td>Pares desnudos, apuntamiento, bifurcación</td>
                  <td>30 – 60 min</td>
                  <td>Eliminar candidatos por intersección</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── SECCIÓN 2: Casos de Uso ── */}
        <section>
          <h2>¿Quién juega al sudoku y por qué?</h2>
          <p>
            El sudoku se adapta a distintos estilos de vida. Aquí tienes tres perfiles reales
            que ilustran cómo encaja en el día a día.
          </p>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🧓</span>
                <h4>Adulto mayor</h4>
              </div>
              <p className={styles.escenarioExample}>
                Resuelve un sudoku fácil cada mañana como ejercicio de pensamiento lógico diario,
                manteniendo la mente activa y la concentración entrenada.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: empezar por el nivel fácil y progresar gradualmente es la clave
                para que el reto sea estimulante sin resultar frustrante.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🚆</span>
                <h4>Viajero en transporte</h4>
              </div>
              <p className={styles.escenarioExample}>
                Abre el sudoku en el móvil durante el trayecto en metro o tren como
                entretenimiento offline, sin necesidad de conexión a internet.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: el nivel medio es ideal para trayectos de 20-30 minutos:
                suficientemente retador para no aburrirse y resoluble antes de llegar.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">📚</span>
                <h4>Estudiante</h4>
              </div>
              <p className={styles.escenarioExample}>
                Usa el sudoku como pausa activa entre sesiones de estudio para desarrollar
                el razonamiento deductivo y la capacidad de concentración sostenida.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: una partida de 10 minutos entre bloques de estudio ayuda a resetear
                la atención sin desconectar completamente del modo analítico.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 3: FAQ ── */}
        <section>
          <h2>Preguntas frecuentes sobre el sudoku</h2>
          <ul className={styles.faqList}>
            <li className={styles.faqItem}>
              <details>
                <summary>¿El sudoku requiere matemáticas?</summary>
                <p>
                  No. El sudoku no usa operaciones aritméticas; los dígitos 1-9 son
                  simplemente símbolos diferenciados. Podrías usar letras o colores
                  y el juego funcionaría exactamente igual. Lo que entrena es la lógica
                  deductiva y la atención, no el cálculo numérico.
                </p>
                <p className={styles.faqTip}>
                  Dato: los puzzles originales japoneses se llamaban &quot;Sūji wa dokushin ni kagiru&quot;
                  (los números deben aparecer solos), acuñado por Maki Kaji en 1984.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Cuántas soluciones puede tener un sudoku válido?</summary>
                <p>
                  Un sudoku bien formado tiene exactamente una solución única. Si un puzzle
                  tiene más de una solución, se considera inválido o mal diseñado según los
                  estándares clásicos del pasatiempo. Matemáticamente, se ha demostrado que
                  17 pistas es el número mínimo necesario para que un sudoku pueda tener
                  solución única; por debajo de esa cifra, siempre existe más de una
                  combinación válida.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Qué técnica uso cuando me bloqueo?</summary>
                <p>
                  El primer paso es revisar si hay un <em>naked single</em> que se te escapó
                  (una celda con un único candidato posible). Si no, busca <em>hidden singles</em>:
                  un número que solo puede ir en una celda dentro de su fila, columna o bloque.
                  Si sigues bloqueado, usa la función de notas para anotar candidatos en cada
                  celda y busca pares desnudos en bloques.
                </p>
                <p className={styles.faqTip}>
                  Consejo: en niveles fácil y medio, naked single y hidden single son
                  suficientes para resolver el puzzle completo sin adivinar.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Mejora el sudoku la memoria?</summary>
                <p>
                  El sudoku entrena principalmente la memoria de trabajo a corto plazo
                  (mantener candidatos en mente mientras se razona) y la concentración.
                  Varios estudios sugieren que los juegos de lógica pueden retrasar el
                  deterioro cognitivo asociado al envejecimiento, aunque no reemplazan
                  otros hábitos saludables como el ejercicio físico o la dieta.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Cuál es la diferencia entre naked single y hidden single?</summary>
                <p>
                  Un <strong>naked single</strong> es una celda donde solo cabe un número:
                  los otros 8 dígitos ya aparecen en su fila, columna o bloque. Un{' '}
                  <strong>hidden single</strong> es un número que, aunque la celda tenga
                  varios candidatos, solo puede colocarse en esa celda dentro de su fila,
                  columna o bloque. El naked single es más fácil de detectar visualmente;
                  el hidden single requiere analizar toda la unidad (fila/columna/bloque).
                </p>
              </details>
            </li>
          </ul>
        </section>

        {/* ── SECCIÓN 4: Guía Paso a Paso ── */}
        <section>
          <h2>Cómo resolver un sudoku: 5 pasos</h2>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">1</span>
              <div className={styles.stepContent}>
                <strong>Buscar celdas con una sola opción (naked single)</strong>
                <p>
                  Recorre el tablero buscando celdas vacías donde solo un número sea posible
                  porque los otros 8 ya están en su fila, columna o bloque 3×3. Rellena
                  todas las que encuentres antes de pasar al siguiente paso.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">2</span>
              <div className={styles.stepContent}>
                <strong>Identificar números que solo caben en una celda del bloque (hidden single)</strong>
                <p>
                  Para cada bloque 3×3, fila y columna, comprueba si hay un dígito que solo
                  puede ir en una de las celdas vacías. Aunque esa celda tenga varios candidatos,
                  si el número no cabe en ninguna otra posición de la unidad, va ahí.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">3</span>
              <div className={styles.stepContent}>
                <strong>Usar eliminación por filas y columnas</strong>
                <p>
                  Cuando un número ya está colocado en una fila o columna, elimínalo como
                  candidato de todas las celdas vacías de esa fila o columna. Esto puede
                  revelar nuevos naked singles o hidden singles en otros bloques.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">4</span>
              <div className={styles.stepContent}>
                <strong>Aplicar técnica de pares desnudos si hay bloqueo</strong>
                <p>
                  Si dos celdas del mismo bloque/fila/columna solo tienen los mismos dos
                  candidatos, esos dos números no pueden ir en ninguna otra celda de esa
                  unidad. Elimínalos del resto de candidatos para desbloquear el puzzle.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">5</span>
              <div className={styles.stepContent}>
                <strong>En niveles difíciles, probar bifurcación controlada</strong>
                <p>
                  Si las técnicas anteriores no avanzan, elige una celda con solo dos
                  candidatos, supón uno y resuelve hasta encontrar contradicción o solución.
                  Si hay contradicción, el otro candidato es el correcto. Úsalo como último
                  recurso; en fácil y medio nunca es necesario.
                </p>
              </div>
            </li>
          </ol>
        </section>

        {/* ── SECCIÓN 5: Mejores Prácticas ── */}
        <section>
          <h2>4 mejores prácticas para mejorar tu juego</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔢</span>
              <h4>Empieza por el número más frecuente</h4>
              <p>
                Observa qué dígito aparece más veces en el tablero inicial. Con más
                apariciones, hay menos celdas posibles para ese número, lo que facilita
                completar sus posiciones restantes rápidamente.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">✏️</span>
              <h4>Usa notas y candidatos en celdas difíciles</h4>
              <p>
                Activa el modo notas para anotar todos los números posibles en cada celda
                dudosa. Ver los candidatos escritos reduce errores y hace visible cuándo
                un par desnudo o hidden single aparece.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🧩</span>
              <h4>Resuelve bloque por bloque antes de saltar</h4>
              <p>
                Trabaja un bloque 3×3 hasta agotarlo antes de pasar al siguiente. La
                concentración en una unidad pequeña reduce la carga cognitiva y ayuda
                a detectar hidden singles con más facilidad.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🚫</span>
              <h4>Nunca adivines en niveles fácil/medio</h4>
              <p>
                En los dos primeros niveles siempre existe una deducción lógica válida.
                Si sientes que tienes que adivinar, vuelve atrás: hay un naked single o
                hidden single que no has visto. Adivinar invalida la lógica del puzzle.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 6: Warning Box ── */}
        <section>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <h3>4 errores que arruinan tu partida</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Adivinar sin deducción.</strong> Colocar un número sin haberlo
                deducido lógicamente invalida la coherencia del puzzle. Si el número es
                incorrecto, los errores en cascada pueden hacer el tablero irresolvable.
              </li>
              <li>
                <strong>No usar notas en el nivel difícil.</strong> En dificultad difícil
                intentar resolver de memoria sin anotar candidatos lleva
                inevitablemente a errores. Las notas son una herramienta, no una trampa.
              </li>
              <li>
                <strong>Olvidar actualizar candidatos tras poner un número.</strong> Al
                colocar un dígito, debes eliminar ese número de los candidatos de todas las
                celdas de la misma fila, columna y bloque. Omitirlo genera inconsistencias
                que bloquean el avance.
              </li>
              <li>
                <strong>Saltarse niveles intermedios.</strong> Pasar directamente de fácil
                a difícil sin dominar primero la eliminación por filas y columnas y los
                pares desnudos del nivel medio hace que el salto de dificultad resulte
                frustrante en lugar de progresivo.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('juego-sudoku')} />

      <ShareCard appName="juego-sudoku" />
      <Footer appName="juego-sudoku" />
    </div>
  );
}
