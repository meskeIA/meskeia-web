'use client';

import { Fragment } from 'react';
import styles from '../SimuladorGenetica.module.css';
import { PedigreeChart as PedigreeChartType, PedigreeIndividual, Trait } from './types';
import { notacionGenotipo } from './genetics';

interface PedigreeChartProps {
  pedigree: PedigreeChartType;
  /**
   * Los rasgos del cruce, en orden: uno en el monohíbrido, dos en el dihíbrido. Sirven para
   * escribir los genotipos (Iᴬi en vez de AO) y para decir qué representa el árbol.
   */
  rasgos: Trait[];
}

export default function PedigreeChart({ pedigree, rasgos }: PedigreeChartProps) {
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
   * El símbolo de cada individuo describe UN rasgo: el primero. En un dihíbrido el segundo se
   * lee en el genotipo y el fenotipo escritos debajo, y el árbol lo dice (hallazgo 1694).
   */
  const rasgo = rasgos[0];
  const segundoRasgo = rasgos.length > 1 ? rasgos[1] : null;

  /**
   * En un rasgo sin afectados (grupos sanguíneos) la leyenda no ofrece «Afectado»: nadie en el
   * árbol puede llevar ese símbolo, y anunciarlo sugeriría que el grupo O o el Rh negativo lo
   * son (hallazgo 1589). El portador se nombra por su alelo, en la notación de pantalla.
   *
   * En dominancia incompleta no hay ni afectados ni portadores: el heterocigoto tiene fenotipo
   * propio (hallazgo 1697), así que la leyenda solo distingue el sexo.
   */
  const sinAfectados = rasgo.sinAfectados === true;
  const incompleta = rasgo.inheritanceMode === 'incomplete';
  const recesivo = rasgo.alleles.recessive.symbol;
  const aleloRecesivo = rasgo.notacion?.[recesivo] ?? recesivo;

  return (
    <div className={styles.pedigreeContainer}>
      <p className={styles.pedigreeRasgo}>
        {segundoRasgo ? (
          <>
            Árbol de <strong>{rasgo.name}</strong> y <strong>{segundoRasgo.name}</strong>: debajo
            de cada símbolo, el genotipo y el fenotipo de los dos. El símbolo (afectado,
            portador) sigue solo a <strong>{rasgo.name}</strong>. Los cuatro hijos son ejemplos de
            lo que puede salir, uno por combinación, no una muestra en proporción: las
            proporciones están en Estadísticas.
          </>
        ) : (
          <>
            Árbol de <strong>{rasgo.name}</strong>
          </>
        )}
      </p>

      {sortedGenerations.map(([genIndex, individuals]) => (
        <div key={genIndex} className={styles.pedigreeGeneration}>
          {/* En el flujo, encima de su fila: en posición absoluta se montaba sobre el primer
              símbolo en cuanto la fila llegaba al borde, en móvil (hallazgo 1695). */}
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
                  <PedigreeIndividualComponent individual={ind} rasgos={rasgos} />
                  {idx === 0 && individuals.length > 1 && (
                    <div className={styles.pedigreeConnection} />
                  )}
                </Fragment>
              ))}
            </div>
          ) : (
            // Hijos: mostrar en fila
            <div className={styles.pedigreeHijos}>
              {individuals.map((ind) => (
                <PedigreeIndividualComponent key={ind.id} individual={ind} rasgos={rasgos} />
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Leyenda */}
      <div className={styles.pedigreeLegend}>
        <div className={styles.legendItem}>
          <div className={styles.legendSymbol}></div>
          <span>{sinAfectados || incompleta ? 'Macho' : 'Macho no afectado'}</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendSymbol} ${styles.female}`}></div>
          <span>{sinAfectados || incompleta ? 'Hembra' : 'Hembra no afectada'}</span>
        </div>
        {!sinAfectados && !incompleta && (
          <div className={styles.legendItem}>
            <div className={`${styles.legendSymbol} ${styles.affected}`}></div>
            <span>Afectado</span>
          </div>
        )}
        {!incompleta && (
          <div className={styles.legendItem}>
            <div className={`${styles.legendSymbol} ${styles.carrier}`}></div>
            <span>{sinAfectados ? `Portador de ${aleloRecesivo}` : 'Portador'}</span>
          </div>
        )}
      </div>
      {incompleta && (
        <p className={styles.pedigreeNota}>
          En dominancia incompleta no hay portadores: el heterocigoto tiene su propio fenotipo
          y se distingue a simple vista. El fenotipo de cada individuo va escrito bajo su
          símbolo.
        </p>
      )}
    </div>
  );
}

function PedigreeIndividualComponent({
  individual,
  rasgos,
}: {
  individual: PedigreeIndividual;
  rasgos: Trait[];
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
      <div className={styles.pedigreeGenotype}>{notacionGenotipo(individual.genotype, rasgos)}</div>
      <div className={styles.pedigreePhenotype}>{individual.phenotype}</div>
    </div>
  );
}
