/**
 * Conversor de Edad de Mascotas — lógica pura sin React ni DOM
 * Usada por: MCP server (convertir_edad_mascota)
 *
 * Convierte la edad de un perro o gato a años humanos equivalentes
 * y determina su etapa de vida.
 *
 * Método para perros: primer año = 15 años humanos, segundo año = 9,
 * a partir del 3º: factor según tamaño (4-7 años humanos/año canino).
 * Método para gatos: primer año = 15, segundo = 9, resto × 4.
 */

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type TipoMascota = 'perro' | 'gato';
export type TamanoPerro = 'pequeno' | 'mediano' | 'grande' | 'gigante';

export interface ParametrosEdadMascota {
  /** Edad de la mascota en años (puede tener decimales, ej: 0.5 = 6 meses) */
  edadMascota: number;
  /** Tipo de mascota */
  tipoMascota: TipoMascota;
  /**
   * Tamaño del perro (solo si tipoMascota = 'perro'):
   * - 'pequeno': < 10 kg (Chihuahua, Yorkshire...)
   * - 'mediano': 10-25 kg (Beagle, Springer...)
   * - 'grande': 25-45 kg (Pastor Alemán, Labrador...)
   * - 'gigante': > 45 kg (Gran Danés, San Bernardo...)
   */
  tamanoPerro?: TamanoPerro;
}

export interface ResultadoEdadMascota {
  /** Años humanos equivalentes */
  edadHumana: number;
  /** Etapa de vida */
  etapaVida: string;
  /** Descripción de la etapa */
  descripcion: string;
  /** Expectativa de vida aproximada (años) */
  expectativaVida: string;
  /** Recomendaciones de cuidado según etapa */
  recomendaciones: string[];
}

// ─── Expectativas de vida ──────────────────────────────────────────────────────

const EXPECTATIVA_VIDA: Record<TipoMascota, Record<string, string>> = {
  perro: {
    pequeno:  '12-16 años',
    mediano:  '10-14 años',
    grande:   '8-12 años',
    gigante:  '6-10 años',
  },
  gato: {
    cualquiera: '12-18 años (interior); 8-12 años (exterior)',
  },
};

// ─── Cálculo edad humana ──────────────────────────────────────────────────────

const FACTOR_PERRO: Record<TamanoPerro, number> = {
  pequeno: 4,
  mediano: 5,
  grande:  6,
  gigante: 7,
};

function edadHumanaPerro(edad: number, tamano: TamanoPerro): number {
  if (edad <= 0) return 0;
  if (edad <= 1) return Math.round(15 * edad);
  if (edad <= 2) return Math.round(15 + 9 * (edad - 1));
  return Math.round(24 + (edad - 2) * FACTOR_PERRO[tamano]);
}

function edadHumanaGato(edad: number): number {
  if (edad <= 0) return 0;
  if (edad <= 1) return Math.round(15 * edad);
  if (edad <= 2) return Math.round(15 + 9 * (edad - 1));
  return Math.round(24 + (edad - 2) * 4);
}

function etapaPerro(edad: number): { etapa: string; descripcion: string; recomendaciones: string[] } {
  if (edad < 0.5) return { etapa: 'Cachorro', descripcion: 'Etapa de socialización y aprendizaje fundamental', recomendaciones: ['Vacunación y desparasitación inicial', 'Socialización con personas y otros animales', 'Entrenamiento básico de órdenes'] };
  if (edad < 2)   return { etapa: 'Joven', descripcion: 'Lleno de energía, necesita mucho ejercicio y estimulación', recomendaciones: ['Ejercicio diario abundante', 'Refuerzo del adiestramiento', 'Revisión veterinaria anual'] };
  if (edad < 7)   return { etapa: 'Adulto', descripcion: 'En su mejor momento físico y mental', recomendaciones: ['Revisiones anuales', 'Dieta equilibrada para su tamaño', 'Ejercicio regular'] };
  if (edad < 10)  return { etapa: 'Maduro', descripcion: 'Empieza a necesitar más descanso', recomendaciones: ['Revisiones semestrales', 'Control de peso', 'Ejercicio moderado adaptado'] };
  return { etapa: 'Senior', descripcion: 'Requiere atención especial y más cuidados veterinarios', recomendaciones: ['Revisiones cada 3-6 meses', 'Dieta senior específica', 'Control de articulaciones y vista'] };
}

function etapaGato(edad: number): { etapa: string; descripcion: string; recomendaciones: string[] } {
  if (edad < 0.5)  return { etapa: 'Gatito', descripcion: 'Crecimiento rápido y mucha curiosidad', recomendaciones: ['Vacunación y esterilización', 'Socialización temprana', 'Enriquecimiento ambiental'] };
  if (edad < 2)    return { etapa: 'Joven', descripcion: 'Muy activo y juguetón', recomendaciones: ['Juego interactivo diario', 'Revisión veterinaria anual', 'Dieta para jóvenes'] };
  if (edad < 7)    return { etapa: 'Adulto', descripcion: 'En su mejor momento físico y mental', recomendaciones: ['Revisiones anuales', 'Dieta equilibrada', 'Control de peso'] };
  if (edad < 11)   return { etapa: 'Maduro', descripcion: 'Más tranquilo pero todavía activo', recomendaciones: ['Revisiones cada 6 meses', 'Análisis de sangre anuales', 'Dieta adaptada'] };
  if (edad < 15)   return { etapa: 'Senior', descripcion: 'Necesita más cuidados y revisiones', recomendaciones: ['Revisiones cada 3-6 meses', 'Control renal y dental', 'Dieta senior específica'] };
  return { etapa: 'Geriátrico', descripcion: 'Requiere atención especial y mucho cariño', recomendaciones: ['Revisiones frecuentes', 'Máximo confort y calor', 'Cuidados paliativos si necesario'] };
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function convertirEdadMascota(p: ParametrosEdadMascota): ResultadoEdadMascota {
  if (p.edadMascota < 0) throw new Error('La edad de la mascota no puede ser negativa.');
  if (p.edadMascota > 30) throw new Error('La edad máxima soportada es 30 años.');
  if (p.tipoMascota === 'perro' && !p.tamanoPerro) {
    p = { ...p, tamanoPerro: 'mediano' }; // valor por defecto
  }

  let edadHumana: number;
  let etapa: { etapa: string; descripcion: string; recomendaciones: string[] };
  let expectativaVida: string;

  if (p.tipoMascota === 'perro') {
    const tamano = p.tamanoPerro ?? 'mediano';
    edadHumana = edadHumanaPerro(p.edadMascota, tamano);
    etapa = etapaPerro(p.edadMascota);
    expectativaVida = EXPECTATIVA_VIDA.perro[tamano];
  } else {
    edadHumana = edadHumanaGato(p.edadMascota);
    etapa = etapaGato(p.edadMascota);
    expectativaVida = EXPECTATIVA_VIDA.gato.cualquiera;
  }

  return {
    edadHumana,
    etapaVida: etapa.etapa,
    descripcion: etapa.descripcion,
    expectativaVida,
    recomendaciones: etapa.recomendaciones,
  };
}
