'use client';

import { Fragment } from 'react';
import styles from '../SimuladorGenetica.module.css';
import { PedigreeChart as PedigreeChartType, PedigreeIndividual, Trait } from './types';
import { notacionGenotipo } from './genetics';

interface PedigreeChartProps {
  pedigree: PedigreeChartType;
  /** El rasgo del árbol: solo para escribir los genotipos (Iᴬi en vez de AO). */
  rasgo: Trait;
}

export default function PedigreeChart({ pedigree, rasgo }: PedigreeChartProps) {
  // Agrupar individuos por generación
  const generations: Map<number, PedigreeIndividual[]> = new Map();

  for (const individual of pedigree.individuals) {
    const gen = individual.generation;
    if (!generations.has(gen)) {
      generations.set(gen, []);
    }
    generations.get(gen)!.push(individual);
  }

  // Ordenar generaciones
  const sortedGenerations = Array.from(generations.entries()).sort(
    ([a], [b]) => a - b
  );

  const generationLabels = ['Padres', 'Hijos'];

  /**
   * En un rasgo sin afectados (grupos sanguíneos) la leyenda no ofrece «Afectado»: nadie en el
   * árbol puede llevar ese símbolo, y anunciarlo sugeriría que el grupo O o el Rh negativo lo
   * son (hallazgo 1589). El portador se nombra por su alelo, en la notación de pantalla.
   */
  const sinAfectados = rasgo.sinAfectados === true;
  const recesivo = rasgo.alleles.recessive.symbol;
  const aleloRecesivo = rasgo.notacion?.[recesivo] ?? recesivo;

  return (
    <div className={styles.pedigreeContainer}>
      {sortedGenerations.map(([genIndex, individuals], i) => (
        <div key={genIndex} className={styles.pedigreeGeneration}>
          <span className={styles.pedigreeGenerationLabel}>
            {generationLabels[genIndex] || `Gen ${genIndex}`}
          </span>

          {genIndex === 0 ? (
            // Padres: mostrar como pareja
            <div className={styles.pedigreeCouple}>
              {/* La key va en el elemento RAÍZ que devuelve el map, es decir en el
                  fragmento, no en el hijo: React avisaba de «unique key prop» en consola. */}
              {individuals.map((ind, idx) => (
                <Fragment key={ind.id}>
                  <PedigreeIndividualComponent individual={ind} rasgo={rasgo} />
                  {idx === 0 && individuals.length > 1 && (
                    <div className={styles.pedigreeConnection} />
                  )}
                </Fragment>
              ))}
            </div>
          ) : (
            // Hijos: mostrar en fila
            <div style={{ display: 'flex', gap: 'var(--spacing-lg)' }}>
              {individuals.map((ind) => (
                <PedigreeIndividualComponent key={ind.id} individual={ind} rasgo={rasgo} />
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Leyenda */}
      <div className={styles.pedigreeLegend}>
        <div className={styles.legendItem}>
          <div className={styles.legendSymbol}></div>
          <span>{sinAfectados ? 'Macho' : 'Macho no afectado'}</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendSymbol} ${styles.female}`}></div>
          <span>{sinAfectados ? 'Hembra' : 'Hembra no afectada'}</span>
        </div>
        {!sinAfectados && (
          <div className={styles.legendItem}>
            <div className={`${styles.legendSymbol} ${styles.affected}`}></div>
            <span>Afectado</span>
          </div>
        )}
        <div className={styles.legendItem}>
          <div className={`${styles.legendSymbol} ${styles.carrier}`}></div>
          <span>{sinAfectados ? `Portador de ${aleloRecesivo}` : 'Portador'}</span>
        </div>
      </div>
    </div>
  );
}

function PedigreeIndividualComponent({
  individual,
  rasgo,
}: {
  individual: PedigreeIndividual;
  rasgo: Trait;
}) {
  const symbolClasses = [
    styles.pedigreeSymbol,
    individual.sex === 'female' ? styles.female : styles.male,
    individual.isAffected ? styles.affected : '',
    individual.isCarrier && !individual.isAffected ? styles.carrier : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.pedigreeIndividual}>
      <div className={symbolClasses}>
        {individual.isAffected ? '' : individual.sex === 'male' ? '♂' : '♀'}
      </div>
      <div className={styles.pedigreeGenotype}>{notacionGenotipo(individual.genotype, [rasgo])}</div>
      <div className={styles.pedigreePhenotype}>{individual.phenotype}</div>
    </div>
  );
}
