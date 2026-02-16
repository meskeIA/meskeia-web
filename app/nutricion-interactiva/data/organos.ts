// ============================================================================
// BASE DE DATOS: ÓRGANOS Y SISTEMAS CORPORALES
// ============================================================================

import { Organo } from './schema';

/**
 * Lista completa de órganos del cuerpo humano
 * Organizados por sistemas corporales
 */
export const organos: Organo[] = [
  // SISTEMA DIGESTIVO
  {
    id: 'higado',
    nombre: 'Hígado',
    sistema: 'digestivo',
    descripcion: 'Órgano vital que filtra toxinas, produce bilis y regula el metabolismo',
    emoji: '🫀',
  },
  {
    id: 'estomago',
    nombre: 'Estómago',
    sistema: 'digestivo',
    descripcion: 'Digiere alimentos mediante ácidos y enzimas',
    emoji: '🫃',
  },
  {
    id: 'intestinos',
    nombre: 'Intestinos',
    sistema: 'digestivo',
    descripcion: 'Absorben nutrientes y eliminan desechos',
    emoji: '🧬',
  },
  {
    id: 'pancreas',
    nombre: 'Páncreas',
    sistema: 'endocrino',
    descripcion: 'Produce insulina y enzimas digestivas',
    emoji: '🫁',
  },

  // SISTEMA CARDIOVASCULAR
  {
    id: 'corazon',
    nombre: 'Corazón',
    sistema: 'cardiovascular',
    descripcion: 'Bombea sangre a todo el cuerpo',
    emoji: '❤️',
  },
  {
    id: 'arterias',
    nombre: 'Arterias',
    sistema: 'cardiovascular',
    descripcion: 'Transportan sangre oxigenada desde el corazón',
    emoji: '🩸',
  },

  // SISTEMA NERVIOSO
  {
    id: 'cerebro',
    nombre: 'Cerebro',
    sistema: 'nervioso',
    descripcion: 'Controla todas las funciones corporales y procesos mentales',
    emoji: '🧠',
  },

  // SISTEMA RESPIRATORIO
  {
    id: 'pulmones',
    nombre: 'Pulmones',
    sistema: 'respiratorio',
    descripcion: 'Permiten el intercambio de oxígeno y dióxido de carbono',
    emoji: '🫁',
  },

  // SISTEMA URINARIO (parte del endocrino/digestivo)
  {
    id: 'rinones',
    nombre: 'Riñones',
    sistema: 'endocrino',
    descripcion: 'Filtran la sangre y eliminan desechos a través de la orina',
    emoji: '🫘',
  },

  // SISTEMA ÓSEO Y MUSCULAR
  {
    id: 'huesos',
    nombre: 'Huesos',
    sistema: 'oseo',
    descripcion: 'Proporcionan estructura, protección y producen células sanguíneas',
    emoji: '🦴',
  },
  {
    id: 'musculos',
    nombre: 'Músculos',
    sistema: 'muscular',
    descripcion: 'Permiten el movimiento y queman energía',
    emoji: '💪',
  },

  // SISTEMA INMUNOLÓGICO (parcial)
  {
    id: 'sistema-inmune',
    nombre: 'Sistema Inmune',
    sistema: 'inmunologico',
    descripcion: 'Defiende el cuerpo contra enfermedades e infecciones',
    emoji: '🛡️',
  },

  // OTROS ÓRGANOS IMPORTANTES
  {
    id: 'ojos',
    nombre: 'Ojos',
    sistema: 'nervioso',
    descripcion: 'Órgano de la visión, sensible a la luz',
    emoji: '👁️',
  },
  {
    id: 'piel',
    nombre: 'Piel',
    sistema: 'inmunologico',
    descripcion: 'Barrera protectora y regulador de temperatura',
    emoji: '🧴',
  },
];

/**
 * Obtener órgano por ID
 */
export const getOrganoPorId = (id: string): Organo | undefined => {
  return organos.find((o) => o.id === id);
};

/**
 * Obtener órganos por sistema
 */
export const getOrganosPorSistema = (sistema: string): Organo[] => {
  return organos.filter((o) => o.sistema === sistema);
};
