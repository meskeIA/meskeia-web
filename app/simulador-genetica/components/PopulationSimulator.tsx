'use client';

import { useState } from 'react';
import styles from '../SimuladorGenetica.module.css';
import { formatNumber } from '@/lib';
import { PopulationSimulation, PunnettResult } from './types';
import { interpretChiSquare } from './genetics';

const TAMANO_MINIMO = 10;
const TAMANO_MAXIMO = 500;

interface PopulationSimulatorProps {
  punnett: PunnettResult;
  simulation: PopulationSimulation | null;
  populationSize: number;
  onSimulate: (size?: number) => void;
  onSetSize: (size: number) => void;
}

export default function PopulationSimulator({
  punnett,
  simulation,
  populationSize,
  onSimulate,
  onSetSize,
}: PopulationSimulatorProps) {
  /**
   * El TEXTO del campo, aparte del tamaño que se simula.
   *
   * ⚠️ 22/09/2026 (hallazgo 1203, ALTO) — el input era controlado por `populationSize`, un
   * número, y `handleSizeChange` juzgaba cada pulsación por separado. Al teclear «50», el
   * dígito intermedio «5» cae fuera de [10, 500], se rechazaba sin llamar a `onSetSize`, React
   * restauraba el valor controlado a 100 y el segundo dígito ya no se pegaba al primero: el
   * campo NO admitía teclear ningún valor, ni siquiera uno de su propio rango, y el aviso que
   * quedaba en pantalla acusaba de salirse de un rango en el que el valor tecleado SÍ estaba.
   * La única vía abierta era la flecha del spinner, de uno en uno —cincuenta pulsaciones para
   * ir de 100 a 50—, y borrar el campo tampoco era posible: revertía a 100 y seguía simulando
   * 100. Choca de frente con lo que promete el bloque educativo («hasta 500 individuos»).
   *
   * Separando el texto del valor, un prefijo a medio teclear deja de ser un error: lo que se
   * juzga es lo que hay escrito, y mientras no sea un tamaño válido no se simula nada, en vez
   * de simular a espaldas del usuario un número distinto del que está viendo.
   *
   * El spec no podía verlo: usaba `fill()`, que entrega el valor entero en un solo evento, que
   * era justo el único camino que la app dejaba abierto.
   */
  const [textoTamano, setTextoTamano] = useState(String(populationSize));
  const [avisoTamano, setAvisoTamano] = useState('');

  /** El tamaño escrito, o null si lo que hay en el campo no es un tamaño simulable. */
  const tamanoEscrito = (() => {
    const bruto = textoTamano.trim();
    if (bruto === '' || !/^\d+$/.test(bruto)) return null;
    const valor = parseInt(bruto, 10);
    if (valor < TAMANO_MINIMO || valor > TAMANO_MAXIMO) return null;
    return valor;
  })();

  const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const bruto = e.target.value;
    setTextoTamano(bruto);

    const limpio = bruto.trim();
    if (limpio === '') {
      setAvisoTamano(`Escribe un tamaño entre ${TAMANO_MINIMO} y ${TAMANO_MAXIMO} individuos.`);
      return;
    }
    if (!/^\d+$/.test(limpio)) {
      setAvisoTamano('El tamaño de la población es un número entero de individuos.');
      return;
    }
    const valor = parseInt(limpio, 10);
    if (valor < TAMANO_MINIMO || valor > TAMANO_MAXIMO) {
      setAvisoTamano(
        `El tamaño de la población debe estar entre ${TAMANO_MINIMO} y ${TAMANO_MAXIMO} individuos.`,
      );
      return;
    }
    setAvisoTamano('');
    onSetSize(valor);
  };

  // Calcular grados de libertad (número de fenotipos - 1)
  const degreesOfFreedom = Object.keys(punnett.phenotypeRatios).length - 1;

  /**
   * El orden en que se listan los fenotipos en las DOS columnas (hallazgo 1205): el del cuadro
   * de Punnett, que es estable y el mismo que el alumno tiene arriba en pantalla.
   */
  const ordenFenotipos = Object.keys(punnett.phenotypeRatios);

  // `chiSquare` puede valer 0 —ajuste perfecto, el caso que la FAQ describe como
  // excelente— y con la comprobación por veracidad el panel entero desaparecía justo ahí.
  const chiSquareResult =
    simulation != null && simulation.chiSquare != null
      ? interpretChiSquare(simulation.chiSquare, degreesOfFreedom)
      : null;

  return (
    <div>
      <div className={styles.populationConfig}>
        <label className={styles.label} htmlFor="tamano-poblacion">
          Tamaño de población:
        </label>
        <input
          id="tamano-poblacion"
          type="number"
          className={styles.populationInput}
          value={textoTamano}
          onChange={handleSizeChange}
          min={TAMANO_MINIMO}
          max={TAMANO_MAXIMO}
          aria-invalid={avisoTamano !== ''}
          aria-describedby={avisoTamano ? 'aviso-tamano-poblacion' : undefined}
        />
        {/*
          Mientras lo escrito no sea un tamaño válido, no se simula: antes el botón seguía
          activo y simulaba el último valor aceptado —100— aunque en el campo se leyera otro
          número. Es la mitad del 1203 que hace que la cifra de la pantalla mienta.
        */}
        <button
          type="button"
          className={styles.simulateBtn}
          onClick={() => onSimulate(tamanoEscrito ?? undefined)}
          disabled={tamanoEscrito === null}
        >
          <span aria-hidden="true">🔄</span> Simular
        </button>
      </div>

      {avisoTamano && (
        <p id="aviso-tamano-poblacion" role="alert" className={styles.avisoTamano}>
          {avisoTamano}
        </p>
      )}

      {simulation && (
        <>
          {/* Grid de individuos */}
          <div className={styles.populationGrid}>
            {simulation.individuals.map((ind, i) => (
              <span
                key={i}
                className={styles.populationIndividual}
                title={`${ind.genotype}: ${ind.phenotype}`}
              >
                {ind.phenotypeIcon}
              </span>
            ))}
          </div>

          {/*
            Comparación observado vs esperado.

            ⚠️ 22/09/2026 (hallazgo 1205) — cada columna se recorría con el orden de SU objeto:
            «Esperado» con el del cuadro de Punnett y «Observado» con el orden en que cada
            fenotipo apareció en el sorteo, que cambia en cada corrida. Están pegadas
            precisamente para leerse fila a fila, así que el alumno acababa comparando un
            fenotipo con otro distinto (5 de 6 corridas desalineadas). Ahora las dos recorren
            el MISMO orden, el del cuadro de Punnett, y un fenotipo que no salió en el sorteo
            se imprime con 0 en vez de desaparecer y correr las filas de abajo.
          */}
          <div className={styles.populationResults}>
            <div className={styles.resultColumn}>
              <div className={styles.resultTitle}>Observado</div>
              {ordenFenotipos.map((phenotype) => {
                const data = simulation.observedRatios[phenotype];
                return (
                  <div key={phenotype} className={styles.resultRow}>
                    <span>{phenotype}</span>
                    <span>
                      {data?.count ?? 0} ({formatNumber(data?.percentage ?? 0, 1)}%)
                    </span>
                  </div>
                );
              })}
            </div>

            <div className={styles.resultColumn}>
              <div className={styles.resultTitle}>Esperado</div>
              {ordenFenotipos.map((phenotype) => {
                const data = simulation.expectedRatios[phenotype];
                return (
                  <div key={phenotype} className={styles.resultRow}>
                    <span>{phenotype}</span>
                    <span>
                      {/* La esperanza lleva decimal cuando lo tiene: son 112,5 plantas de 200,
                          no 113 (hallazgo 1204). */}
                      {formatNumber(data?.count ?? 0, Number.isInteger(data?.count ?? 0) ? 0 : 1)} (
                      {formatNumber(data?.percentage ?? 0, 1)}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chi-cuadrado */}
          {chiSquareResult && (
            <div className={styles.chiSquare}>
              <div className={styles.chiSquareTitle}>
                📐 Prueba Chi-cuadrado (χ²)
              </div>
              <div className={styles.chiSquareValue}>
                χ² = {formatNumber(simulation.chiSquare ?? 0, 3)}
              </div>
              <div className={styles.chiSquareInterpretation}>
                {/* Con 0 grados de libertad no hay p-valor que dar: la interpretación lo
                    explica sola y anteponerle una «p» diría justo lo contrario (hallazgo 832). */}
                {chiSquareResult.pValue !== 'no procede' && (
                  <>
                    <strong>p {chiSquareResult.pValue}</strong>
                    <br />
                  </>
                )}
                {chiSquareResult.interpretation}
              </div>
            </div>
          )}
        </>
      )}

      {!simulation && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🧬</div>
          <p className={styles.emptyText}>
            Haz clic en &quot;Simular&quot; para generar una población
          </p>
        </div>
      )}
    </div>
  );
}
