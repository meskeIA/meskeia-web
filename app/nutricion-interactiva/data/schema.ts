// ============================================================================
// SCHEMAS TYPESCRIPT - NUTRICIÓN INTERACTIVA
// ============================================================================
// Define las interfaces TypeScript para toda la base de datos nutricional

/**
 * Categorías de alimentos
 */
export type CategoriaAlimento =
  | 'verdura'
  | 'fruta'
  | 'proteina'
  | 'cereal'
  | 'legumbre'
  | 'fruto-seco'
  | 'lacteo'
  | 'especias'
  | 'aceites'
  | 'pescado'
  | 'carne'
  | 'huevo';

/**
 * Niveles de impacto/beneficio
 */
export type NivelImpacto = 'alto' | 'medio' | 'bajo';

/**
 * Sistemas corporales principales
 */
export type SistemaCorporal =
  | 'digestivo'
  | 'cardiovascular'
  | 'nervioso'
  | 'respiratorio'
  | 'endocrino'
  | 'inmunologico'
  | 'muscular'
  | 'oseo';

/**
 * Órgano del cuerpo humano
 */
export interface Organo {
  id: string;                    // 'higado', 'corazon', etc.
  nombre: string;                // 'Hígado', 'Corazón', etc.
  sistema: SistemaCorporal;      // Sistema al que pertenece
  descripcion: string;           // Breve descripción de su función
  emoji: string;                 // Emoji representativo
}

/**
 * Impacto de un alimento sobre un órgano (beneficioso)
 */
export interface OrganoImpacto {
  organoId: string;              // ID del órgano
  beneficio: string;             // Descripción del beneficio
  nivel: NivelImpacto;           // Alto, medio, bajo
  fuente: string;                // Referencia científica [1], [2], etc.
}

/**
 * Precaución sobre un alimento para un órgano
 */
export interface OrganoPrecaucion {
  organoId: string;              // ID del órgano
  advertencia: string;           // Descripción de la precaución
  condicion?: string;            // Condición específica (ej: "Si tienes cálculos renales")
  nivel: NivelImpacto;           // Alto, medio, bajo
  fuente: string;                // Referencia científica
}

/**
 * Nutriente (vitamina, mineral, etc.)
 */
export interface Nutriente {
  id: string;                    // 'hierro', 'vitamina-c', etc.
  nombre: string;                // 'Hierro', 'Vitamina C', etc.
  tipo: 'vitamina' | 'mineral' | 'aminoacido' | 'acido-graso' | 'antioxidante' | 'otro';
  funcion: string;               // Función principal en el cuerpo
  dosis_recomendada?: string;    // Ej: "18 mg/día (mujeres adultas)"
  emoji?: string;                // Emoji representativo (opcional)
}

/**
 * Detalle de un nutriente en un alimento
 */
export interface NutrienteDetalle {
  nutrienteId: string;           // ID del nutriente
  cantidad?: string;             // Ej: "2.7 mg por 100g"
  nivel: NivelImpacto;           // Alto, medio, bajo (contenido)
}

/**
 * Sinergia entre alimentos (se potencian)
 */
export interface Sinergia {
  conAlimentoId: string;         // ID del alimento con el que sinergia
  razon: string;                 // Explicación de por qué se potencian
  fuente: string;                // Referencia científica
}

/**
 * Antagonismo entre alimentos (se inhiben)
 */
export interface Antagonismo {
  conAlimentoId: string;         // ID del alimento que antagoniza
  razon: string;                 // Explicación de por qué se inhiben
  fuente: string;                // Referencia científica
}

/**
 * Alimento completo
 */
export interface Alimento {
  id: string;                    // 'espinacas', 'salmon', etc.
  nombre: string;                // 'Espinacas', 'Salmón', etc.
  categoria: CategoriaAlimento;  // Categoría del alimento
  emoji: string;                 // Emoji representativo
  descripcion?: string;          // Descripción breve (opcional)

  // Impacto en órganos
  organos: {
    beneficiosos: OrganoImpacto[];
    perjudiciales?: OrganoPrecaucion[];
  };

  // Nutrientes que contiene
  nutrientes: NutrienteDetalle[];

  // Interacciones con otros alimentos
  sinergias: Sinergia[];
  antagonismos: Antagonismo[];
}

/**
 * Referencia científica
 */
export interface Referencia {
  id: string;                    // [1], [2], etc.
  titulo: string;                // Título del estudio/artículo
  autores?: string;              // Autores (opcional)
  fuente: string;                // Publicación/organización
  año?: number;                  // Año de publicación
  url?: string;                  // URL al estudio (si disponible)
}

/**
 * Resultado de búsqueda por órgano
 */
export interface ResultadoBusquedaOrgano {
  organo: Organo;
  alimentosBeneficiosos: {
    alimento: Alimento;
    impacto: OrganoImpacto;
  }[];
  alimentosPerjudiciales: {
    alimento: Alimento;
    precaucion: OrganoPrecaucion;
  }[];
}

/**
 * Resultado de análisis de combinación
 */
export interface ResultadoCombinacion {
  alimentos: Alimento[];
  sinergias: {
    alimento1: Alimento;
    alimento2: Alimento;
    detalle: Sinergia;
  }[];
  antagonismos: {
    alimento1: Alimento;
    alimento2: Alimento;
    detalle: Antagonismo;
  }[];
  compatible: boolean;           // Si la combinación es beneficiosa
}
