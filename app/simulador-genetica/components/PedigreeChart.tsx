'use client';

import styles from '../SimuladorGenetica.module.css';
import { PedigreeChart as PedigreeChartType, PedigreeIndividual } from './types';

interface PedigreeChartProps {
  pedigree: PedigreeChartType;
}

export default function PedigreeChart({ pedigree }: PedigreeChartProps) {
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
              {individuals.map((ind, idx) => (
                <>
                  <PedigreeIndividualComponent key={ind.id} individual={ind} />
                  {idx === 0 && individuals.length > 1 && (
                    <div className={styles.pedigreeConnection} />
                  )}
                </>
              ))}
            </div>
          ) : (
            // Hijos: mostrar en fila
            <div style={{ display: 'flex', gap: 'var(--spacing-lg)' }}>
              {individuals.map((ind) => (
                <PedigreeIndividualComponent key={ind.id} individual={ind} />
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Leyenda */}
      <div className={styles.pedigreeLegend}>
        <div className={styles.legendItem}>
          <div className={styles.legendSymbol}></div>
          <span>Macho no afectado</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendSymbol} ${styles.female}`}></div>
          <span>Hembra no afectada</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendSymbol} ${styles.affected}`}></div>
          <span>Afectado</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendSymbol} ${styles.carrier}`}></div>
          <span>Portador</span>
        </div>
      </div>
    </div>
  );
}

function PedigreeIndividualComponent({
  individual,
}: {
  individual: PedigreeIndividual;
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
      <div className={styles.pedigreeGenotype}>{individual.genotype}</div>
      <div className={styles.pedigreePhenotype}>{individual.phenotype}</div>
    </div>
  );
}
