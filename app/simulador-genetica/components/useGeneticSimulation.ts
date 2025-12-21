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
  populationSimulation: PopulationSimulation | null;
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
    populationSimulation: null,
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
      const defaultGenotype = trait.inheritanceMode === 'sex-linked'
        ? getSexLinkedGenotypes(trait, 'male')[0]
        : getPossibleGenotypes(trait)[1]; // Heterocigoto por defecto

      setState((prev) => ({
        ...prev,
        selectedOrganism: organism,
        selectedTrait1: trait,
        selectedTrait2: null,
        crossType: 'monohybrid',
        parent1Genotype: defaultGenotype,
        parent2Genotype: trait.inheritanceMode === 'sex-linked'
          ? getSexLinkedGenotypes(trait, 'female')[1]
          : defaultGenotype,
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
        const defaultGenotype = trait.inheritanceMode === 'sex-linked'
          ? getSexLinkedGenotypes(trait, 'male')[0]
          : getPossibleGenotypes(trait)[1];

        return {
          ...prev,
          selectedTrait1: trait,
          parent1Genotype: defaultGenotype,
          parent2Genotype: trait.inheritanceMode === 'sex-linked'
            ? getSexLinkedGenotypes(trait, 'female')[1]
            : defaultGenotype,
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
        const defaultGenotype = getPossibleGenotypes(trait)[1];
        return {
          ...prev,
          selectedTrait2: trait,
          crossType: 'dihybrid',
          parent1Genotype2: defaultGenotype,
          parent2Genotype2: defaultGenotype,
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
          const defaultGenotype = getPossibleGenotypes(trait2)[1];
          return {
            ...prev,
            crossType: type,
            selectedTrait2: trait2,
            parent1Genotype2: defaultGenotype,
            parent2Genotype2: defaultGenotype,
          };
        }
      }
      return { ...prev, crossType: type };
    });
  }, []);

  // Setters de genotipos
  const setParent1Genotype = useCallback((genotype: string) => {
    setState((prev) => ({ ...prev, parent1Genotype: genotype, crossResult: null }));
  }, []);

  const setParent2Genotype = useCallback((genotype: string) => {
    setState((prev) => ({ ...prev, parent2Genotype: genotype, crossResult: null }));
  }, []);

  const setParent1Genotype2 = useCallback((genotype: string) => {
    setState((prev) => ({ ...prev, parent1Genotype2: genotype, crossResult: null }));
  }, []);

  const setParent2Genotype2 = useCallback((genotype: string) => {
    setState((prev) => ({ ...prev, parent2Genotype2: genotype, crossResult: null }));
  }, []);

  const setParent1Sex = useCallback((sex: Sex) => {
    setState((prev) => ({ ...prev, parent1Sex: sex }));
  }, []);

  const setParent2Sex = useCallback((sex: Sex) => {
    setState((prev) => ({ ...prev, parent2Sex: sex }));
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

      return {
        ...prev,
        punnettResult: punnett,
        crossResult,
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
      populationSimulation: null,
      pedigreeChart: null,
      animationState: 'idle',
      animationStep: 0,
      populationSize: 100,
    });
  }, []);

  return {
    ...state,
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
