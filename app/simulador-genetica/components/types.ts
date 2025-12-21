// Tipos base de alelos y genotipos
export type Allele = string;
export type Genotype = [Allele, Allele];
export type InheritanceMode = 'complete' | 'incomplete' | 'codominant' | 'sex-linked';
export type CrossType = 'monohybrid' | 'dihybrid' | 'test-cross';
export type Sex = 'male' | 'female';

// Definición de un alelo
export interface AlleleDefinition {
  symbol: string;
  name: string;
  isDominant: boolean;
}

// Fenotipo resultante
export interface PhenotypeDefinition {
  genotypes: string[]; // ['AA', 'Aa'] para dominante
  name: string;
  color: string;
  icon: string;
}

// Rasgo/Característica
export interface Trait {
  id: string;
  name: string;
  inheritanceMode: InheritanceMode;
  alleles: {
    dominant: AlleleDefinition;
    recessive: AlleleDefinition;
    codominant?: AlleleDefinition; // Para codominancia (ej: grupo sanguíneo)
  };
  phenotypes: PhenotypeDefinition[];
  description: string;
}

// Organismo
export interface Organism {
  id: string;
  name: string;
  icon: string;
  description: string;
  traits: Trait[];
}

// Individuo en el cruce
export interface Individual {
  id: string;
  sex: Sex;
  genotype: Genotype;
  phenotype: string;
  phenotypeColor: string;
  phenotypeIcon: string;
}

// Para herencia ligada al sexo
export interface SexLinkedIndividual extends Individual {
  chromosomes: {
    x1: Allele | null; // Primer X (o único en machos)
    x2: Allele | null; // Segundo X (null en machos)
    y: boolean; // true si tiene Y
  };
}

// Celda del cuadro de Punnett
export interface PunnettCell {
  row: number;
  col: number;
  gamete1: string;
  gamete2: string;
  genotype: string;
  phenotype: string;
  phenotypeColor: string;
  phenotypeIcon: string;
  probability: number;
}

// Resultado del cuadro de Punnett
export interface PunnettResult {
  cells: PunnettCell[];
  gametes1: string[]; // Gametos del padre
  gametes2: string[]; // Gametos de la madre
  genotypeRatios: Record<string, number>;
  phenotypeRatios: Record<string, { count: number; color: string; icon: string }>;
  size: 2 | 4; // 2x2 o 4x4
}

// Resultado de descendencia individual
export interface OffspringResult {
  genotype: string;
  phenotype: string;
  phenotypeColor: string;
  phenotypeIcon: string;
  probability: number;
  count: number;
}

// Resultado del cruce completo
export interface CrossResult {
  parent1: Individual;
  parent2: Individual;
  punnett: PunnettResult;
  offspring: OffspringResult[];
  totalOffspring: number;
}

// Configuración del cruce
export interface CrossConfig {
  organism: Organism;
  trait1: Trait;
  trait2?: Trait; // Para dihíbrido
  crossType: CrossType;
  parent1Genotype: string;
  parent2Genotype: string;
  parent1Genotype2?: string; // Segundo rasgo para dihíbrido
  parent2Genotype2?: string;
  isSexLinked: boolean;
  parent1Sex: Sex;
  parent2Sex: Sex;
}

// Para el árbol genealógico (pedigree)
export interface PedigreeIndividual {
  id: string;
  generation: number; // 0 = abuelos, 1 = padres, 2 = hijos
  position: number; // Posición horizontal
  sex: Sex;
  genotype: string;
  phenotype: string;
  phenotypeColor: string;
  isAffected: boolean; // Si muestra el fenotipo recesivo/afectado
  isCarrier: boolean; // Si es portador (heterocigoto)
  parentIds?: [string, string]; // IDs de los padres
}

export interface PedigreeChart {
  individuals: PedigreeIndividual[];
  connections: Array<{
    parent1Id: string;
    parent2Id: string;
    childIds: string[];
  }>;
}

// Resultado de simulación de población
export interface PopulationSimulation {
  size: number;
  individuals: Array<{
    genotype: string;
    phenotype: string;
    phenotypeIcon: string;
  }>;
  observedRatios: Record<string, { count: number; percentage: number }>;
  expectedRatios: Record<string, { count: number; percentage: number }>;
  chiSquare?: number;
}

// Estado de animación del Punnett
export type PunnettAnimationState = 'idle' | 'showing-gametes' | 'filling-cells' | 'complete';

// Colores para los estados del Punnett
export const PUNNETT_COLORS = {
  header: '#2E86AB',
  headerText: '#FFFFFF',
  cell: '#FFFFFF',
  cellBorder: '#E5E5E5',
  cellHover: '#F0F9FF',
  animating: '#FEF3C7',
};

// Colores de fenotipos predefinidos
export const PHENOTYPE_COLORS = {
  yellow: '#FCD34D',
  green: '#10B981',
  purple: '#8B5CF6',
  white: '#F3F4F6',
  red: '#EF4444',
  pink: '#EC4899',
  brown: '#92400E',
  blue: '#3B82F6',
  gray: '#6B7280',
  black: '#1F2937',
};
