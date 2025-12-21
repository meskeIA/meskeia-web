import { Organism, PHENOTYPE_COLORS } from '../types';

// Guisantes de Mendel - El organismo clásico
export const GUISANTES: Organism = {
  id: 'guisantes',
  name: 'Guisantes',
  icon: '🌱',
  description: 'El organismo usado por Gregor Mendel en sus experimentos originales',
  traits: [
    {
      id: 'color-semilla',
      name: 'Color de semilla',
      inheritanceMode: 'complete',
      description: 'El color amarillo es dominante sobre el verde',
      alleles: {
        dominant: { symbol: 'A', name: 'Amarillo', isDominant: true },
        recessive: { symbol: 'a', name: 'Verde', isDominant: false },
      },
      phenotypes: [
        {
          genotypes: ['AA', 'Aa'],
          name: 'Amarillo',
          color: PHENOTYPE_COLORS.yellow,
          icon: '🟡',
        },
        {
          genotypes: ['aa'],
          name: 'Verde',
          color: PHENOTYPE_COLORS.green,
          icon: '🟢',
        },
      ],
    },
    {
      id: 'forma-semilla',
      name: 'Forma de semilla',
      inheritanceMode: 'complete',
      description: 'La forma lisa es dominante sobre la rugosa',
      alleles: {
        dominant: { symbol: 'R', name: 'Lisa', isDominant: true },
        recessive: { symbol: 'r', name: 'Rugosa', isDominant: false },
      },
      phenotypes: [
        {
          genotypes: ['RR', 'Rr'],
          name: 'Lisa',
          color: '#F59E0B',
          icon: '⚪',
        },
        {
          genotypes: ['rr'],
          name: 'Rugosa',
          color: '#78350F',
          icon: '🔘',
        },
      ],
    },
    {
      id: 'color-flor',
      name: 'Color de flor',
      inheritanceMode: 'complete',
      description: 'El color púrpura es dominante sobre el blanco',
      alleles: {
        dominant: { symbol: 'P', name: 'Púrpura', isDominant: true },
        recessive: { symbol: 'p', name: 'Blanco', isDominant: false },
      },
      phenotypes: [
        {
          genotypes: ['PP', 'Pp'],
          name: 'Púrpura',
          color: PHENOTYPE_COLORS.purple,
          icon: '🟣',
        },
        {
          genotypes: ['pp'],
          name: 'Blanco',
          color: PHENOTYPE_COLORS.white,
          icon: '⚪',
        },
      ],
    },
    {
      id: 'altura-planta',
      name: 'Altura de planta',
      inheritanceMode: 'complete',
      description: 'La altura alta es dominante sobre la enana',
      alleles: {
        dominant: { symbol: 'T', name: 'Alta', isDominant: true },
        recessive: { symbol: 't', name: 'Enana', isDominant: false },
      },
      phenotypes: [
        {
          genotypes: ['TT', 'Tt'],
          name: 'Alta',
          color: '#059669',
          icon: '🌿',
        },
        {
          genotypes: ['tt'],
          name: 'Enana',
          color: '#6B7280',
          icon: '🌱',
        },
      ],
    },
  ],
};

// Drosophila melanogaster - La mosca de la fruta
export const DROSOPHILA: Organism = {
  id: 'drosophila',
  name: 'Drosophila',
  icon: '🪰',
  description: 'Mosca de la fruta, modelo clásico en genética',
  traits: [
    {
      id: 'color-ojos',
      name: 'Color de ojos',
      inheritanceMode: 'sex-linked',
      description: 'El color rojo es dominante, ligado al cromosoma X',
      alleles: {
        dominant: { symbol: 'W', name: 'Rojo', isDominant: true },
        recessive: { symbol: 'w', name: 'Blanco', isDominant: false },
      },
      phenotypes: [
        {
          genotypes: ['XW XW', 'XW Xw', 'XW Y'],
          name: 'Ojos rojos',
          color: PHENOTYPE_COLORS.red,
          icon: '🔴',
        },
        {
          genotypes: ['Xw Xw', 'Xw Y'],
          name: 'Ojos blancos',
          color: PHENOTYPE_COLORS.white,
          icon: '⚪',
        },
      ],
    },
    {
      id: 'color-cuerpo',
      name: 'Color de cuerpo',
      inheritanceMode: 'complete',
      description: 'El color gris es dominante sobre el negro',
      alleles: {
        dominant: { symbol: 'B', name: 'Gris', isDominant: true },
        recessive: { symbol: 'b', name: 'Negro', isDominant: false },
      },
      phenotypes: [
        {
          genotypes: ['BB', 'Bb'],
          name: 'Gris',
          color: PHENOTYPE_COLORS.gray,
          icon: '🩶',
        },
        {
          genotypes: ['bb'],
          name: 'Negro',
          color: PHENOTYPE_COLORS.black,
          icon: '🖤',
        },
      ],
    },
    {
      id: 'forma-alas',
      name: 'Forma de alas',
      inheritanceMode: 'complete',
      description: 'Las alas normales son dominantes sobre las vestigiales',
      alleles: {
        dominant: { symbol: 'V', name: 'Normal', isDominant: true },
        recessive: { symbol: 'v', name: 'Vestigial', isDominant: false },
      },
      phenotypes: [
        {
          genotypes: ['VV', 'Vv'],
          name: 'Alas normales',
          color: '#D1D5DB',
          icon: '🦋',
        },
        {
          genotypes: ['vv'],
          name: 'Alas vestigiales',
          color: '#9CA3AF',
          icon: '🪳',
        },
      ],
    },
  ],
};

// Humanos - Características simples para educación
export const HUMANOS: Organism = {
  id: 'humanos',
  name: 'Humanos',
  icon: '👤',
  description: 'Características humanas simplificadas con herencia mendeliana',
  traits: [
    {
      id: 'color-ojos',
      name: 'Color de ojos',
      inheritanceMode: 'complete',
      description: 'Simplificación: marrón dominante sobre azul',
      alleles: {
        dominant: { symbol: 'B', name: 'Marrón', isDominant: true },
        recessive: { symbol: 'b', name: 'Azul', isDominant: false },
      },
      phenotypes: [
        {
          genotypes: ['BB', 'Bb'],
          name: 'Ojos marrones',
          color: PHENOTYPE_COLORS.brown,
          icon: '🟤',
        },
        {
          genotypes: ['bb'],
          name: 'Ojos azules',
          color: PHENOTYPE_COLORS.blue,
          icon: '🔵',
        },
      ],
    },
    {
      id: 'lobulo-oreja',
      name: 'Lóbulo de oreja',
      inheritanceMode: 'complete',
      description: 'El lóbulo libre es dominante sobre el pegado',
      alleles: {
        dominant: { symbol: 'L', name: 'Libre', isDominant: true },
        recessive: { symbol: 'l', name: 'Pegado', isDominant: false },
      },
      phenotypes: [
        {
          genotypes: ['LL', 'Ll'],
          name: 'Lóbulo libre',
          color: '#FCD34D',
          icon: '👂',
        },
        {
          genotypes: ['ll'],
          name: 'Lóbulo pegado',
          color: '#9CA3AF',
          icon: '👂',
        },
      ],
    },
    {
      id: 'enrollar-lengua',
      name: 'Enrollar lengua',
      inheritanceMode: 'complete',
      description: 'La capacidad de enrollar la lengua es dominante',
      alleles: {
        dominant: { symbol: 'R', name: 'Puede enrollar', isDominant: true },
        recessive: { symbol: 'r', name: 'No puede', isDominant: false },
      },
      phenotypes: [
        {
          genotypes: ['RR', 'Rr'],
          name: 'Puede enrollar',
          color: PHENOTYPE_COLORS.pink,
          icon: '👅',
        },
        {
          genotypes: ['rr'],
          name: 'No puede enrollar',
          color: '#F3F4F6',
          icon: '👅',
        },
      ],
    },
    {
      id: 'daltonismo',
      name: 'Daltonismo',
      inheritanceMode: 'sex-linked',
      description: 'El daltonismo es recesivo y ligado al cromosoma X',
      alleles: {
        dominant: { symbol: 'D', name: 'Visión normal', isDominant: true },
        recessive: { symbol: 'd', name: 'Daltónico', isDominant: false },
      },
      phenotypes: [
        {
          genotypes: ['XD XD', 'XD Xd', 'XD Y'],
          name: 'Visión normal',
          color: PHENOTYPE_COLORS.green,
          icon: '👁️',
        },
        {
          genotypes: ['Xd Xd', 'Xd Y'],
          name: 'Daltónico',
          color: PHENOTYPE_COLORS.gray,
          icon: '👁️',
        },
      ],
    },
    {
      id: 'hoyuelos',
      name: 'Hoyuelos',
      inheritanceMode: 'complete',
      description: 'Los hoyuelos son dominantes',
      alleles: {
        dominant: { symbol: 'H', name: 'Con hoyuelos', isDominant: true },
        recessive: { symbol: 'h', name: 'Sin hoyuelos', isDominant: false },
      },
      phenotypes: [
        {
          genotypes: ['HH', 'Hh'],
          name: 'Con hoyuelos',
          color: PHENOTYPE_COLORS.pink,
          icon: '😊',
        },
        {
          genotypes: ['hh'],
          name: 'Sin hoyuelos',
          color: '#F3F4F6',
          icon: '🙂',
        },
      ],
    },
  ],
};

// Flores - Para demostrar dominancia incompleta
export const FLORES: Organism = {
  id: 'flores',
  name: 'Flores (Boca de dragón)',
  icon: '🌸',
  description: 'Ejemplo clásico de dominancia incompleta',
  traits: [
    {
      id: 'color-flor',
      name: 'Color de flor',
      inheritanceMode: 'incomplete',
      description: 'Rojo y blanco muestran dominancia incompleta (rosa)',
      alleles: {
        dominant: { symbol: 'R', name: 'Rojo', isDominant: true },
        recessive: { symbol: 'r', name: 'Blanco', isDominant: false },
      },
      phenotypes: [
        {
          genotypes: ['RR'],
          name: 'Rojo',
          color: PHENOTYPE_COLORS.red,
          icon: '🔴',
        },
        {
          genotypes: ['Rr'],
          name: 'Rosa',
          color: PHENOTYPE_COLORS.pink,
          icon: '🩷',
        },
        {
          genotypes: ['rr'],
          name: 'Blanco',
          color: PHENOTYPE_COLORS.white,
          icon: '⚪',
        },
      ],
    },
  ],
};

// Lista de todos los organismos disponibles
export const ORGANISMS: Organism[] = [GUISANTES, DROSOPHILA, HUMANOS, FLORES];

// Función para obtener un organismo por ID
export function getOrganismById(id: string): Organism | undefined {
  return ORGANISMS.find((org) => org.id === id);
}

// Función para obtener un rasgo por ID dentro de un organismo
export function getTraitById(organism: Organism, traitId: string) {
  return organism.traits.find((trait) => trait.id === traitId);
}

// Genotipos posibles para un rasgo
export function getPossibleGenotypes(trait: { alleles: { dominant: { symbol: string }; recessive: { symbol: string } } }): string[] {
  const d = trait.alleles.dominant.symbol;
  const r = trait.alleles.recessive.symbol;
  return [`${d}${d}`, `${d}${r}`, `${r}${r}`];
}

// Genotipos posibles para herencia ligada al sexo
export function getSexLinkedGenotypes(
  trait: { alleles: { dominant: { symbol: string }; recessive: { symbol: string } } },
  sex: 'male' | 'female'
): string[] {
  const d = trait.alleles.dominant.symbol;
  const r = trait.alleles.recessive.symbol;

  if (sex === 'female') {
    return [`X${d} X${d}`, `X${d} X${r}`, `X${r} X${r}`];
  } else {
    return [`X${d} Y`, `X${r} Y`];
  }
}
