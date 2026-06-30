'use client';
// @disclaimer: exempt

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatNumber } from '@/lib';
import styles from './SimuladorBacktracking.module.css';

// ============================================================
//  TIPOS
// ============================================================

type EstadoPaso = 'probar' | 'conflicto' | 'colocar' | 'retroceder' | 'solucion';

interface Snapshot {
  posiciones: number[]; // fila de la reina por columna (-1 si no hay)
  probando: { col: number; row: number } | null;
  estado: EstadoPaso;
  texto: string;
}

// ============================================================
//  MOTOR DE BACKTRACKING (N reinas)
// ============================================================

function resolverNReinas(n: number): { pasos: Snapshot[]; encontrada: boolean } {
  const pasos: Snapshot[] = [];
  const pos = new Array<number>(n).fill(-1);
  let encontrada = false;

  const snap = (
    probando: { col: number; row: number } | null,
    estado: EstadoPaso,
    texto: string
  ): void => {
    pasos.push({ posiciones: [...pos], probando, estado, texto });
  };

  const seguro = (col: number, row: number): boolean => {
    for (let c = 0; c < col; c += 1) {
      const r = pos[c];
      if (r === row) return false;
      if (Math.abs(r - row) === Math.abs(c - col)) return false;
    }
    return true;
  };

  const bt = (col: number): void => {
    if (encontrada) return;
    if (col === n) {
      encontrada = true;
      snap(null, 'solucion', `¡Solución encontrada! Las ${n} reinas no se atacan entre sí.`);
      return;
    }
    for (let row = 0; row < n && !encontrada; row += 1) {
      snap({ col, row }, 'probar', `Probar una reina en columna ${col + 1}, fila ${row + 1}.`);
      if (seguro(col, row)) {
        pos[col] = row;
        snap({ col, row }, 'colocar', `Sin conflictos: se coloca la reina en columna ${col + 1}, fila ${row + 1}.`);
        bt(col + 1);
        if (!encontrada) {
          pos[col] = -1;
          snap(
            { col, row },
            'retroceder',
            `La columna ${col + 2} no tenía posiciones válidas: se retira la reina de la columna ${col + 1} y se sigue probando.`
          );
        }
      } else {
        snap({ col, row }, 'conflicto', `La casilla (columna ${col + 1}, fila ${row + 1}) es atacada por otra reina: se descarta.`);
      }
    }
  };

  bt(0);
  return { pasos, encontrada };
}

function contarSoluciones(n: number): number {
  const pos = new Array<number>(n).fill(-1);
  let total = 0;
  const seguro = (col: number, row: number): boolean => {
    for (let c = 0; c < col; c += 1) {
      const r = pos[c];
      if (r === row || Math.abs(r - row) === Math.abs(c - col)) return false;
    }
    return true;
  };
  const bt = (col: number): void => {
    if (col === n) {
      total += 1;
      return;
    }
    for (let row = 0; row < n; row += 1) {
      if (seguro(col, row)) {
        pos[col] = row;
        bt(col + 1);
        pos[col] = -1;
      }
    }
  };
  bt(0);
  return total;
}

// ============================================================
//  COMPONENTE
// ============================================================

export default function SimuladorBacktracking() {
  const [n, setN] = useState<number>(6);
  const [pasoIdx, setPasoIdx] = useState<number>(0);
  const [auto, setAuto] = useState<boolean>(false);
  const [velocidad, setVelocidad] = useState<number>(350);

  const { pasos } = useMemo(() => resolverNReinas(n), [n]);
  const totalSoluciones = useMemo(() => contarSoluciones(n), [n]);

  useEffect(() => {
    setPasoIdx(0);
    setAuto(false);
  }, [n]);

  const total = pasos.length;
  const snap = pasos[Math.min(pasoIdx, total - 1)];

  useEffect(() => {
    if (!auto) return undefined;
    if (pasoIdx >= total - 1) {
      setAuto(false);
      return undefined;
    }
    const t = setTimeout(() => setPasoIdx((i) => Math.min(i + 1, total - 1)), velocidad);
    return () => clearTimeout(t);
  }, [auto, pasoIdx, total, velocidad]);

  const intentos = useMemo(
    () => pasos.slice(0, pasoIdx + 1).filter((p) => p.estado === 'probar').length,
    [pasos, pasoIdx]
  );
  const retrocesos = useMemo(
    () => pasos.slice(0, pasoIdx + 1).filter((p) => p.estado === 'retroceder').length,
    [pasos, pasoIdx]
  );

  const reinas = snap.posiciones;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Simulador de Backtracking</h1>
        <p className={styles.subtitle}>
          Observa el algoritmo de vuelta atrás resolviendo el problema de las N reinas: prueba una
          casilla, descarta las atacadas, coloca la reina y retrocede cuando se queda sin opciones.
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* Tamaño */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Tamaño del tablero</h2>
          <div className={styles.controlesEntrada}>
            <label className={styles.sliderCampo}>
              {n} reinas en un tablero {n}×{n}
              <input
                type="range"
                min={4}
                max={8}
                value={n}
                onChange={(e) => setN(Number(e.target.value))}
              />
            </label>
            <div className={styles.solucionesInfo}>
              Soluciones totales para {n} reinas: <strong>{formatNumber(totalSoluciones, 0)}</strong>
            </div>
          </div>
        </section>

        {/* Tablero */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Tablero</h2>
          <div className={styles.tableroWrap}>
            <div
              className={styles.tablero}
              style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}
            >
              {Array.from({ length: n }).map((_, row) =>
                Array.from({ length: n }).map((__, col) => {
                  const esClara = (row + col) % 2 === 0;
                  const hayReina = reinas[col] === row;
                  const probando = snap.probando && snap.probando.col === col && snap.probando.row === row;
                  let claseProbando = '';
                  if (probando) {
                    if (snap.estado === 'conflicto') claseProbando = styles.casillaConflicto;
                    else if (snap.estado === 'colocar') claseProbando = styles.casillaColocar;
                    else claseProbando = styles.casillaProbando;
                  }
                  return (
                    <div
                      key={`c-${row}-${col}`}
                      className={`${styles.casilla} ${esClara ? styles.casillaClara : styles.casillaOscura} ${claseProbando}`}
                    >
                      {hayReina && (
                        <span className={styles.reina} aria-label="reina">
                          ♛
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div
            className={`${styles.explicacion} ${snap.estado === 'solucion' ? styles.explicacionOk : ''} ${snap.estado === 'conflicto' || snap.estado === 'retroceder' ? styles.explicacionAlerta : ''}`}
            role="status"
            aria-live="polite"
          >
            <strong>
              {snap.estado === 'probar' && '🔍 Probando: '}
              {snap.estado === 'conflicto' && '✗ Conflicto: '}
              {snap.estado === 'colocar' && '♛ Colocada: '}
              {snap.estado === 'retroceder' && '↩ Retroceso: '}
              {snap.estado === 'solucion' && '✅ '}
            </strong>
            {snap.texto}
          </div>
        </section>

        {/* Stats */}
        <section className={styles.panel}>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Intentos</span>
              <span className={styles.statValor}>{formatNumber(intentos, 0)}</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Retrocesos</span>
              <span className={styles.statValor}>{formatNumber(retrocesos, 0)}</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Reinas colocadas</span>
              <span className={styles.statValor}>{reinas.filter((r) => r >= 0).length} / {n}</span>
            </div>
          </div>
        </section>

        {/* Controles */}
        <section className={styles.panel}>
          <div className={styles.controles}>
            <button
              type="button"
              className={styles.ctrlBtn}
              onClick={() => {
                setAuto(false);
                setPasoIdx((i) => Math.max(0, i - 1));
              }}
              disabled={pasoIdx === 0}
            >
              ◀ Anterior
            </button>
            <button
              type="button"
              className={styles.ctrlBtn}
              onClick={() => setPasoIdx((i) => Math.min(total - 1, i + 1))}
              disabled={pasoIdx >= total - 1}
            >
              Siguiente ▶
            </button>
            <button
              type="button"
              className={`${styles.ctrlBtn} ${auto ? styles.ctrlBtnDanger : styles.ctrlBtnSecondary}`}
              onClick={() => setAuto((a) => !a)}
              aria-pressed={auto}
              disabled={pasoIdx >= total - 1}
            >
              {auto ? 'Pausar' : 'Auto ▶▶'}
            </button>
            <button
              type="button"
              className={`${styles.ctrlBtn} ${styles.ctrlBtnDanger}`}
              onClick={() => {
                setAuto(false);
                setPasoIdx(0);
              }}
            >
              Reiniciar
            </button>
          </div>
          <div className={styles.progreso}>
            Paso {Math.min(pasoIdx + 1, total)} de {total}
            <div className={styles.progresoBarra}>
              <div
                className={styles.progresoRelleno}
                style={{ width: total ? `${((pasoIdx + 1) / total) * 100}%` : '0%' }}
              />
            </div>
          </div>
          <div className={styles.speedControl}>
            <label htmlFor="vel-input">Velocidad automática:</label>
            <input
              id="vel-input"
              type="range"
              min="100"
              max="900"
              step="50"
              value={velocidad}
              onChange={(e) => setVelocidad(Number(e.target.value))}
            />
            <span className={styles.speedValue}>{velocidad} ms</span>
          </div>
        </section>
      </main>

      <EducationalSection
        title="Guía del Backtracking"
        subtitle="Vuelta atrás, poda y el problema de las N reinas"
      >
        <h3>Fuerza bruta vs Backtracking vs Programación dinámica</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Técnica</th>
                <th>Idea</th>
                <th>Cuándo encaja</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Fuerza bruta</td><td>Genera todas las combinaciones y filtra al final</td><td>Espacios muy pequeños</td></tr>
              <tr><td>Backtracking</td><td>Construye y poda en cuanto algo es inválido</td><td>Restricciones que descartan pronto</td></tr>
              <tr><td>Voraz (greedy)</td><td>Elige lo mejor en cada paso sin deshacer</td><td>Cuando la decisión local es óptima global</td></tr>
              <tr><td>Programación dinámica</td><td>Reutiliza subproblemas solapados</td><td>Subestructura óptima + solapamiento</td></tr>
              <tr><td>Ramificación y poda</td><td>Backtracking + cotas para podar más</td><td>Optimización combinatoria</td></tr>
            </tbody>
          </table>
        </div>

        <h3>Casos de Uso Reales</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🧩</span>
              <strong>Sudokus y puzzles lógicos</strong>
            </div>
            <div className={styles.escenarioExample}>
              Un resolutor de sudoku prueba un número en una casilla y, si más adelante se bloquea,
              retrocede y prueba otro. Es backtracking puro sobre restricciones de fila, columna y región.
            </div>
            <div className={styles.escenarioTip}>Tip: los crucigramas y el kakuro se resuelven igual.</div>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🗺️</span>
              <strong>Coloreado de mapas y grafos</strong>
            </div>
            <div className={styles.escenarioExample}>
              Asignar colores a regiones (o a registros del procesador) de modo que vecinos no compartan
              color es un problema de restricciones que se resuelve con vuelta atrás.
            </div>
            <div className={styles.escenarioTip}>Tip: el compilador usa esto para asignar registros.</div>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">📅</span>
              <strong>Horarios y asignación</strong>
            </div>
            <div className={styles.escenarioExample}>
              Cuadrar horarios de clases, turnos o exámenes sin solapamientos es buscar una combinación
              válida entre muchas: se prueba una asignación y se retrocede si genera conflicto.
            </div>
            <div className={styles.escenarioTip}>Tip: estos son los CSP (problemas de satisfacción de restricciones).</div>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🧭</span>
              <strong>Laberintos y caminos</strong>
            </div>
            <div className={styles.escenarioExample}>
              Encontrar la salida de un laberinto probando direcciones y volviendo atrás en los
              callejones sin salida es el ejemplo más visual de backtracking.
            </div>
            <div className={styles.escenarioTip}>Tip: generar permutaciones y subconjuntos también es vuelta atrás.</div>
          </div>
        </div>

        <h3>Preguntas Frecuentes</h3>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <h4>¿Qué es la poda en backtracking?</h4>
            <p>
              Podar es abandonar una rama del árbol de búsqueda en cuanto se sabe que no puede llevar a
              una solución válida. En las N reinas, si una casilla está atacada no se explora qué pasaría
              colocando ahí la reina: se descarta de inmediato. Cuanto antes podas, menos trabajo haces.
            </p>
            <p className={styles.faqTip}>En el simulador, cada "conflicto" es una poda.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Por qué se coloca una reina por columna?</h4>
            <p>
              Porque garantiza que nunca habrá dos reinas en la misma columna, así que solo hay que
              comprobar filas y diagonales. Reduce el problema a elegir una fila por columna, lo que hace
              el backtracking mucho más eficiente que probar todas las casillas del tablero.
            </p>
            <p className={styles.faqTip}>Es una forma de simetría que simplifica el espacio de búsqueda.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿El backtracking siempre encuentra la solución?</h4>
            <p>
              Si existe, sí: el backtracking es completo, explora sistemáticamente todo el espacio salvo
              las ramas podadas (que por definición no contienen soluciones). Si no hay solución, lo
              acabará confirmando tras agotar todas las ramas. Otra cosa es el tiempo que tarde.
            </p>
            <p className={styles.faqTip}>Para tableros grandes, el tiempo puede dispararse: es exponencial en el peor caso.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Cuál es el coste del backtracking?</h4>
            <p>
              En el peor caso es exponencial, porque el árbol de posibilidades crece muy rápido. La poda
              y un buen orden de exploración reducen drásticamente las ramas visitadas, pero no cambian la
              cota teórica. Por eso, para problemas grandes, se combinan con heurísticas o cotas (ramificación y poda).
            </p>
            <p className={styles.faqTip}>Compara intentos para 4, 6 y 8 reinas: el crecimiento es claro.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿En qué se diferencia del DFS?</h4>
            <p>
              El backtracking es esencialmente una búsqueda en profundidad (DFS) sobre el árbol de
              soluciones parciales, con la diferencia clave de que poda ramas inválidas y deshace la
              última decisión al retroceder. Todo backtracking es un DFS, pero no todo DFS poda.
            </p>
            <p className={styles.faqTip}>La "vuelta atrás" es el deshacer del DFS al salir de una rama.</p>
          </div>
        </div>

        <h3>Cómo Diseñar un Backtracking — Paso a Paso</h3>
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <strong>Define la solución parcial</strong>
              <p>¿Qué construyes paso a paso? En las N reinas, una reina colocada por columna.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <strong>Elige el siguiente candidato</strong>
              <p>Itera las opciones de la decisión actual (cada fila posible de la columna).</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <strong>Comprueba la validez (poda)</strong>
              <p>Si el candidato viola una restricción, descártalo sin explorar más allá.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <strong>Avanza y recurre</strong>
              <p>Si es válido, añádelo a la solución parcial y resuelve el resto recursivamente.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>
              <strong>Deshaz al retroceder</strong>
              <p>Si la recursión falla, quita el candidato (vuelta atrás) y prueba el siguiente.</p>
            </div>
          </div>
        </div>

        <h3>Claves Prácticas</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✂️</span>
            <strong>Poda cuanto antes</strong>
            <p>Comprobar la validez lo antes posible elimina ramas enteras y acelera todo.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔢</span>
            <strong>Ordena los candidatos</strong>
            <p>Probar primero las opciones más prometedoras (heurísticas) encuentra la solución antes.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">↩️</span>
            <strong>Deshaz exactamente lo que hiciste</strong>
            <p>Al retroceder, revierte el estado al de antes de la decisión, sin dejar rastro.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🧮</span>
            <strong>Aprovecha la simetría</strong>
            <p>Una reina por columna o fijar la primera fila reduce mucho el espacio de búsqueda.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">⏱️</span>
            <strong>Pon límites en problemas grandes</strong>
            <p>Si el espacio es enorme, combina con cotas (ramificación y poda) o heurísticas.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🧪</span>
            <strong>Valida con casos conocidos</strong>
            <p>4 reinas → 2 soluciones; 8 reinas → 92. Si no te salen, hay un bug.</p>
          </div>
        </div>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>Errores frecuentes al programar backtracking</strong>
          </div>
          <ul className={styles.warningList}>
            <li>No deshacer la decisión al retroceder (dejar el estado "sucio").</li>
            <li>Comprobar las restricciones demasiado tarde, explorando ramas inútiles.</li>
            <li>Olvidar el caso base que marca cuándo la solución está completa.</li>
            <li>Confundir backtracking con fuerza bruta y no podar nada.</li>
            <li>Modificar una estructura compartida sin restaurarla entre ramas.</li>
            <li>Asumir que siempre será rápido: el peor caso es exponencial.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-backtracking')} />
      <ShareCard appName="simulador-backtracking" />
      <Footer appName="simulador-backtracking" />
    </div>
  );
}
