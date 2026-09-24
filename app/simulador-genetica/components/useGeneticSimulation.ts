import { useState, useCallback, useMemo } from 'react';
import {
  Organism,
  Trait,
  CrossResult,
  PunnettResult,
  PopulationSimulation,
  PedigreeChart,
  CrossType,
  Sex,
  PunnettAnimationState,
} from './types';
import {
  ORGANISMS,
  getOrganismById,
  getTraitById,
  getPossibleGenotypes,
  getSexLinkedGenotypes,
  genotiposPorDefecto,
  performCross,
  generateMonohybridPunnett,
  generateDihybridPunnett,
  generateSexLinkedPunnett,
  simulatePopulation,
  generateSimplePedigree,
} from './genetics';

interface UseGeneticSimulationState {
  // Selección
  selectedOrganism: Organism;
  selectedTrait1: Trait;
  selectedTrait2: Trait | null;
  crossType: CrossType;

  // Genotipos de padres
  parent1Genotype: string;
  parent2Genotype: string;
  parent1Genotype2: string; // Para dihíbrido
  parent2Genotype2: string;
  parent1Sex: Sex;
  parent2Sex: Sex;

  // Resultados
  crossResult: CrossResult | null;
  punnettResult: PunnettResult | null;
  /** De qué cruce es el cuadro de Punnett: la `firmaDelCruce` con que se calculó. */
  firmaPunnett: string | null;
  populationSimulation: PopulationSimulation | null;
  /** De qué cruce es la población simulada: la firma del cuadro del que se sorteó. */
  firmaPoblacion: string | null;
  pedigreeChart: PedigreeChart | null;

  // Animación
  animationState: PunnettAnimationState;
  animationStep: number;

  // Configuración de población
  populationSize: number;
}

interface UseGeneticSimulationReturn extends UseGeneticSimulationState {
  // Acciones de selección
  setSelectedOrganism: (organismId: string) => void;
  setSelectedTrait1: (traitId: string) => void;
  setSelectedTrait2: (traitId: string | null) => void;
  setCrossType: (type: CrossType) => void;

  // Acciones de genotipos
  setParent1Genotype: (genotype: string) => void;
  setParent2Genotype: (genotype: string) => void;
  setParent1Genotype2: (genotype: string) => void;
  setParent2Genotype2: (genotype: string) => void;
  setParent1Sex: (sex: Sex) => void;
  setParent2Sex: (sex: Sex) => void;

  // Acciones de simulación
  performCrossing: () => void;
  runPopulationSimulation: (size?: number) => void;
  generatePedigree: () => void;
  setPopulationSize: (size: number) => void;

  // Animación
  startAnimation: () => void;
  nextAnimationStep: () => void;
  resetAnimation: () => void;

  // Utilidades
  getPossibleGenotypesForTrait: (trait: Trait, sex?: Sex) => string[];
  organisms: Organism[];
  reset: () => void;
}

const DEFAULT_ORGANISM = ORGANISMS[0]; // Guisantes
const DEFAULT_TRAIT = DEFAULT_ORGANISM.traits[0];

/**
 * Todo lo que decide qué cruce hay en pantalla, en una cadena: si cambia, el cuadro de
 * Punnett es otro y cualquier población simulada con el anterior deja de valer.
 *
 * ⚠️ 24/09/2026 (hallazgo 1587, ALTO) — la población solo se anulaba al cambiar de organismo o
 * de característica 1. Con cualquier otro cambio (un genotipo, el segundo rasgo, el tipo de
 * cruce) el panel seguía pintando los individuos del cruce anterior, con fenotipos que el
 * nuevo no puede dar; «Observado» contaba solo las filas que coincidían con el cuadro nuevo y
 * dejaba de sumar N, y el χ² viejo se juzgaba con los grados de libertad del nuevo, así que el
 * veredicto cambiaba sin haber simulado nada. Es la forma del hallazgo 825 (el árbol viejo).
 *
 * En vez de repetir la anulación en cada setter —que es como se olvidó la primera vez, y como
 * se olvidaría con el próximo control— la población lleva la firma del cruce con que se
 * simuló, y solo se enseña mientras esa firma sea la del cruce actual.
 */
function firmaDelCruce(s: UseGeneticSimulationState): string {
  const dihibrido = s.crossType === 'dihybrid' && s.selectedTrait2 !== null;
  return [
    s.selectedOrganism.id,
    s.selectedTrait1.id,
    s.parent1Genotype,
    s.parent2Genotype,
    s.parent1Sex,
    s.parent2Sex,
    dihibrido ? `${s.selectedTrait2?.id}:${s.parent1Genotype2}:${s.parent2Genotype2}` : 'monohibrido',
  ].join('|');
}

export function useGeneticSimulation(): UseGeneticSimulationReturn {
  const [state, setState] = useState<UseGeneticSimulationState>({
    selectedOrganism: DEFAULT_ORGANISM,
    selectedTrait1: DEFAULT_TRAIT,
    selectedTrait2: null,
    crossType: 'monohybrid',

    parent1Genotype: `${DEFAULT_TRAIT.alleles.dominant.symbol}${DEFAULT_TRAIT.alleles.recessive.symbol}`,
    parent2Genotype: `${DEFAULT_TRAIT.alleles.dominant.symbol}${DEFAULT_TRAIT.alleles.recessive.symbol}`,
    parent1Genotype2: '',
    parent2Genotype2: '',
    parent1Sex: 'male',
    parent2Sex: 'female',

    crossResult: null,
    punnettResult: null,
    firmaPunnett: null,
    populationSimulation: null,
    firmaPoblacion: null,
    pedigreeChart: null,

    animationState: 'idle',
    animationStep: 0,

    populationSize: 100,
  });

  // Setters de selección
  const setSelectedOrganism = useCallback((organismId: string) => {
    const organism = getOrganismById(organismId);
    if (organism) {
      const trait = organism.traits[0];
      const [genotipo1, genotipo2] = genotiposPorDefecto(trait);

      setState((prev) => ({
        ...prev,
        selectedOrganism: organism,
        selectedTrait1: trait,
        selectedTrait2: null,
        crossType: 'monohybrid',
        parent1Genotype: genotipo1,
        parent2Genotype: genotipo2,
        crossResult: null,
        punnettResult: null,
        populationSimulation: null,
        pedigreeChart: null,
      }));
    }
  }, []);

  const setSelectedTrait1 = useCallback((traitId: string) => {
    setState((prev) => {
      const trait = getTraitById(prev.selectedOrganism, traitId);
      if (trait) {
        const [genotipo1, genotipo2] = genotiposPorDefecto(trait);

        /**
         * Un rasgo ligado al X no puede quedarse dentro de un cruce DIHÍBRIDO.
         *
         * ⚠️ 14/09/2026 (hallazgo 824) — este setter cambiaba el rasgo y dejaba `crossType`
         * y `selectedTrait2` como estaban, así que `performCrossing` entraba por la rama
         * dihíbrida con un genotipo 'XD Y' que `generateDihybridGametes` parte por
         * caracteres sueltos: salía un cuadro 4x4 entero de genotipos inexistentes
         * («XX DD», «YX Dl»...), fenotipo «Desconocido / Desconocido» al 100 % y un ratio
         * de seis términos. Y sin vuelta atrás evidente, porque al pasar el rasgo a ligado
         * al sexo desaparece el conmutador Monohíbrido/Dihíbrido (`canDoDihybrid` es
         * falso). El mismo reajuste que ya hacía `setSelectedOrganism`.
         *
         * Se anula también el segundo rasgo cuando el elegido ES ese segundo rasgo: un
         * dihíbrido de un carácter consigo mismo es la misma incoherencia por otra puerta.
         */
        const ligadoAlSexo = trait.inheritanceMode === 'sex-linked';
        const chocaConElSegundo = prev.selectedTrait2?.id === trait.id;
        const deshacerDihibrido = ligadoAlSexo || chocaConElSegundo;

        return {
          ...prev,
          selectedTrait1: trait,
          ...(deshacerDihibrido
            ? {
                selectedTrait2: null,
                crossType: 'monohybrid' as CrossType,
                parent1Genotype2: '',
                parent2Genotype2: '',
              }
            : {}),
          parent1Genotype: genotipo1,
          parent2Genotype: genotipo2,
          crossResult: null,
          punnettResult: null,
          populationSimulation: null,
          pedigreeChart: null,
        };
      }
      return prev;
    });
  }, []);

  const setSelectedTrait2 = useCallback((traitId: string | null) => {
    setState((prev) => {
      if (traitId === null) {
        return {
          ...prev,
          selectedTrait2: null,
          crossType: 'monohybrid',
          parent1Genotype2: '',
          parent2Genotype2: '',
          crossResult: null,
          punnettResult: null,
        };
      }

      const trait = getTraitById(prev.selectedOrganism, traitId);
      if (trait) {
        const [genotipo1, genotipo2] = genotiposPorDefecto(trait);
        return {
          ...prev,
          selectedTrait2: trait,
          crossType: 'dihybrid',
          parent1Genotype2: genotipo1,
          parent2Genotype2: genotipo2,
          crossResult: null,
          punnettResult: null,
        };
      }
      return prev;
    });
  }, []);

  const setCrossType = useCallback((type: CrossType) => {
    setState((prev) => {
      if (type === 'dihybrid' && !prev.selectedTrait2) {
        // Seleccionar segundo rasgo automáticamente
        const availableTraits = prev.selectedOrganism.traits.filter(
          (t) => t.id !== prev.selectedTrait1.id && t.inheritanceMode !== 'sex-linked'
        );
        if (availableTraits.length > 0) {
          const trait2 = availableTraits[0];
          const [genotipo1, genotipo2] = genotiposPorDefecto(trait2);
          return {
            ...prev,
            crossType: type,
            selectedTrait2: trait2,
            parent1Genotype2: genotipo1,
            parent2Genotype2: genotipo2,
          };
        }
      }
      return { ...prev, crossType: type };
    });
  }, []);

  /**
   * Setters de genotipos.
   *
   * ⚠️ 14/09/2026 (hallazgo 825) — invalidan también el ÁRBOL GENEALÓGICO. `generatePedigree`
   * solo se llamaba al pulsar la pestaña y solo si `pedigreeChart` era null, y ningún setter
   * de genotipo lo anulaba: el árbol se quedaba mostrando el cruce anterior —con hijos que el
   * cruce actual ya no puede producir, un «aa» con los padres en AA × Aa— mientras el cuadro
   * de Punnett y el selector de al lado ya decían otra cosa. Quien regenera el árbol cuando
   * hace falta es el efecto de `page.tsx`, para que anularlo no deje el panel colgado en
   * «Generando árbol genealógico...» (hallazgo 826).
   */
  const setParent1Genotype = useCallback((genotype: string) => {
    setState((prev) => ({ ...prev, parent1Genotype: genotype, crossResult: null, pedigreeChart: null }));
  }, []);

  const setParent2Genotype = useCallback((genotype: string) => {
    setState((prev) => ({ ...prev, parent2Genotype: genotype, crossResult: null, pedigreeChart: null }));
  }, []);

  const setParent1Genotype2 = useCallback((genotype: string) => {
    setState((prev) => ({ ...prev, parent1Genotype2: genotype, crossResult: null, pedigreeChart: null }));
  }, []);

  const setParent2Genotype2 = useCallback((genotype: string) => {
    setState((prev) => ({ ...prev, parent2Genotype2: genotype, crossResult: null, pedigreeChart: null }));
  }, []);

  const setParent1Sex = useCallback((sex: Sex) => {
    setState((prev) => ({ ...prev, parent1Sex: sex, pedigreeChart: null }));
  }, []);

  const setParent2Sex = useCallback((sex: Sex) => {
    setState((prev) => ({ ...prev, parent2Sex: sex, pedigreeChart: null }));
  }, []);

  // Realizar cruce
  const performCrossing = useCallback(() => {
    setState((prev) => {
      let punnett: PunnettResult;

      if (prev.crossType === 'dihybrid' && prev.selectedTrait2) {
        punnett = generateDihybridPunnett(
          prev.parent1Genotype,
          prev.parent1Genotype2,
          prev.parent2Genotype,
          prev.parent2Genotype2,
          prev.selectedTrait1,
          prev.selectedTrait2
        );
      } else if (prev.selectedTrait1.inheritanceMode === 'sex-linked') {
        punnett = generateSexLinkedPunnett(
          prev.parent1Genotype,
          prev.parent2Genotype,
          prev.selectedTrait1,
          prev.parent1Sex,
          prev.parent2Sex
        );
      } else {
        punnett = generateMonohybridPunnett(
          prev.parent1Genotype,
          prev.parent2Genotype,
          prev.selectedTrait1
        );
      }

      const crossResult = performCross(
        prev.parent1Genotype,
        prev.parent2Genotype,
        prev.selectedTrait1,
        prev.parent1Sex,
        prev.parent2Sex
      );

      // Una población simulada con OTRO cruce se descarta aquí, que es por donde pasa cualquier
      // cambio de entrada (el efecto de page.tsx), para que no reaparezca al volver a él. Pulsar
      // «Realizar Cruce» sin cambiar nada la conserva: sigue siendo de este cruce (hallazgo 1587).
      const firma = firmaDelCruce(prev);
      const poblacionVigente = prev.firmaPoblacion === firma;

      return {
        ...prev,
        punnettResult: punnett,
        firmaPunnett: firma,
        crossResult,
        populationSimulation: poblacionVigente ? prev.populationSimulation : null,
        firmaPoblacion: poblacionVigente ? prev.firmaPoblacion : null,
        animationState: 'idle',
        animationStep: 0,
      };
    });
  }, []);

  // Simulación de población
  const runPopulationSimulation = useCallback((size?: number) => {
    setState((prev) => {
      if (!prev.punnettResult) return prev;

      const simSize = size || prev.populationSize;
      const simulation = simulatePopulation(
        prev.punnettResult,
        simSize,
        prev.selectedTrait1
      );

      return {
        ...prev,
        populationSimulation: simulation,
        // La firma del CUADRO del que se sortea, no la de los controles: si alguna vez se
        // simulara antes de que el efecto rehaga el cuadro, la población quedaría marcada como
        // de su cruce de verdad y no se enseñaría con el nuevo.
        firmaPoblacion: prev.firmaPunnett,
        populationSize: simSize,
      };
    });
  }, []);

  const setPopulationSize = useCallback((size: number) => {
    setState((prev) => ({ ...prev, populationSize: size }));
  }, []);

  // Generar pedigree
  const generatePedigreeChart = useCallback(() => {
    setState((prev) => {
      const pedigree = generateSimplePedigree(
        prev.parent1Genotype,
        prev.parent2Genotype,
        prev.selectedTrait1,
        4
      );

      return { ...prev, pedigreeChart: pedigree };
    });
  }, []);

  // Animación
  const startAnimation = useCallback(() => {
    setState((prev) => ({
      ...prev,
      animationState: 'showing-gametes',
      animationStep: 0,
    }));
  }, []);

  const nextAnimationStep = useCallback(() => {
    setState((prev) => {
      const totalCells = prev.punnettResult?.cells.length || 4;
      const newStep = prev.animationStep + 1;

      if (prev.animationState === 'showing-gametes') {
        return { ...prev, animationState: 'filling-cells', animationStep: 0 };
      } else if (prev.animationState === 'filling-cells') {
        if (newStep >= totalCells) {
          return { ...prev, animationState: 'complete', animationStep: totalCells };
        }
        return { ...prev, animationStep: newStep };
      }

      return prev;
    });
  }, []);

  const resetAnimation = useCallback(() => {
    setState((prev) => ({
      ...prev,
      animationState: 'idle',
      animationStep: 0,
    }));
  }, []);

  // Utilidad para obtener genotipos posibles
  const getPossibleGenotypesForTrait = useCallback(
    (trait: Trait, sex?: Sex): string[] => {
      if (trait.inheritanceMode === 'sex-linked' && sex) {
        return getSexLinkedGenotypes(trait, sex);
      }
      return getPossibleGenotypes(trait);
    },
    []
  );

  // Reset completo
  const reset = useCallback(() => {
    setState({
      selectedOrganism: DEFAULT_ORGANISM,
      selectedTrait1: DEFAULT_TRAIT,
      selectedTrait2: null,
      crossType: 'monohybrid',
      parent1Genotype: `${DEFAULT_TRAIT.alleles.dominant.symbol}${DEFAULT_TRAIT.alleles.recessive.symbol}`,
      parent2Genotype: `${DEFAULT_TRAIT.alleles.dominant.symbol}${DEFAULT_TRAIT.alleles.recessive.symbol}`,
      parent1Genotype2: '',
      parent2Genotype2: '',
      parent1Sex: 'male',
      parent2Sex: 'female',
      crossResult: null,
      punnettResult: null,
      firmaPunnett: null,
      populationSimulation: null,
      firmaPoblacion: null,
      pedigreeChart: null,
      animationState: 'idle',
      animationStep: 0,
      populationSize: 100,
    });
  }, []);

  /**
   * La población solo sale de aquí si es del cruce actual (hallazgo 1587). `performCrossing` ya
   * la descarta al rehacer el cuadro, pero entre el cambio de un control y ese efecto hay un
   * render: esta comprobación impide que en él asome la población vieja con el cruce nuevo.
   */
  const poblacionDelCruceActual =
    state.firmaPoblacion === firmaDelCruce(state) ? state.populationSimulation : null;

  return {
    ...state,
    populationSimulation: poblacionDelCruceActual,
    setSelectedOrganism,
    setSelectedTrait1,
    setSelectedTrait2,
    setCrossType,
    setParent1Genotype,
    setParent2Genotype,
    setParent1Genotype2,
    setParent2Genotype2,
    setParent1Sex,
    setParent2Sex,
    performCrossing,
    runPopulationSimulation,
    generatePedigree: generatePedigreeChart,
    setPopulationSize,
    startAnimation,
    nextAnimationStep,
    resetAnimation,
    getPossibleGenotypesForTrait,
    organisms: ORGANISMS,
    reset,
  };
}
