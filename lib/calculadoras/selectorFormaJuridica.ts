// lib/calculadoras/selectorFormaJuridica.ts
// Lógica del selector autónomo vs SL — tools ChatGPT / MCP
// Basada en los mismos pesos del selector web: app/selector-forma-juridica/page.tsx

export type FormaJuridicaKey = 'autonomo' | 'sl' | 'valorar';

export interface PerfilFormaJuridica {
  /** Ingresos brutos anuales esperados */
  ingresos_esperados: 'menos_30k' | '30k_60k' | '60k_100k' | 'mas_100k';
  /** Socios o co-fundadores */
  socios: 'solo' | 'dos_o_mas' | 'quizas';
  /** Riesgo patrimonial de la actividad */
  riesgo_patrimonial: 'muy_bajo' | 'bajo' | 'medio' | 'alto';
  /** Tipo de cartera de clientes */
  tipo_clientes: 'pocos_grandes' | 'muchos_pequenos' | 'uno_principal' | 'no_sabe';
  /** Necesidad de separar patrimonio personal del empresarial */
  separacion_patrimonio: 'no_prioritario' | 'deseable' | 'imprescindible';
  /** Tolerancia a la carga administrativa */
  carga_administrativa: 'minima' | 'algo' | 'no_importa';
  /** Proyección del negocio a 3-5 años */
  proyeccion: 'complementaria' | 'principal_estable' | 'crecimiento';
  /** Necesidad de captar inversores o financiación externa */
  necesita_inversores: 'no' | 'posiblemente' | 'si';
  /** Disponibilidad de capital inicial */
  capital_inicial: 'no_inmovilizar' | 'uno_euro' | 'tengo_capital';
  /** Experiencia empresarial previa */
  experiencia: 'desde_cero' | 'autonomo_escalando' | 'experiencia_empresarial';
}

interface ResultadoSelectorFormaJuridica {
  forma_recomendada: FormaJuridicaKey;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  ventajas: string[];
  inconvenientes: string[];
  score: number;
}

const DESCRIPCIONES: Record<FormaJuridicaKey, {
  titulo: string;
  subtitulo: string;
  descripcion: string;
  ventajas: string[];
  inconvenientes: string[];
}> = {
  autonomo: {
    titulo: 'Operar como Autónomo',
    subtitulo: 'Tu perfil encaja mejor con el régimen de autónomo',
    descripcion: 'Según tus respuestas, el alta como autónomo (RETA) es la opción más adecuada para empezar. Es más sencillo, tiene menor coste de constitución y es ideal para freelances y actividades con bajo riesgo patrimonial. Pagarás IRPF progresivo sobre tus beneficios y tu cuota RETA dependerá de tus rendimientos reales.',
    ventajas: [
      'Alta en 24-48 h, sin notario ni registro',
      'Sin capital mínimo obligatorio',
      'Gestión administrativa más simple',
      'Cuota RETA proporcional a ingresos reales',
      'Gastos deducibles directos en el IRPF',
    ],
    inconvenientes: [
      'Responsabilidad ilimitada con tu patrimonio personal',
      'IRPF puede ser más alto que el IS a partir de ~40.000 € de beneficio',
      'Imagen menos corporativa frente a grandes clientes',
      'Dificulta captar socios o inversores',
    ],
  },
  sl: {
    titulo: 'Constituir una Sociedad Limitada',
    subtitulo: 'Tu perfil apunta hacia una Sociedad Limitada (SL)',
    descripcion: 'Tus respuestas sugieren que la Sociedad Limitada puede ofrecerte ventajas importantes: separación patrimonial, posible ahorro fiscal cuando los beneficios superan los 40.000-50.000 €, e imagen más profesional frente a clientes y entidades financieras. Requiere escritura ante notario, inscripción en el Registro Mercantil y llevar contabilidad formal.',
    ventajas: [
      'Responsabilidad limitada al capital aportado',
      'Tipo IS del 23-25 % (puede ser menor que el IRPF)',
      'Capital mínimo desde 1 € (reforma 2023)',
      'Facilita captar socios, inversores y financiación',
      'Mayor credibilidad ante grandes clientes y proveedores',
    ],
    inconvenientes: [
      'Coste de constitución: notaría + registro (~600-1.000 €)',
      'Obligación de llevar contabilidad mercantil',
      'Gestoría o asesor fiscal imprescindible',
      'Reuniones y actas de socios obligatorias',
    ],
  },
  valorar: {
    titulo: 'Valorar con un Gestor',
    subtitulo: 'Tu perfil tiene factores mixtos — merece análisis personalizado',
    descripcion: 'Tu situación presenta tanto factores a favor del régimen de autónomo como de la Sociedad Limitada. Antes de decidir, te recomendamos consultar con un gestor o asesor fiscal que pueda estudiar tu caso concreto: ingresos esperados, tipo marginal del IRPF, posibilidad de retribución como socio-administrador, etc.',
    ventajas: [
      'Un gestor puede simular ambos escenarios con cifras reales',
      'Evitas consecuencias fiscales o legales inesperadas',
      'Puedes empezar como autónomo y dar el salto a SL más adelante',
      'La reforma de 2023 permite constituir SL con 1 € de capital',
    ],
    inconvenientes: [
      'Requiere invertir tiempo en análisis previo',
      'El asesoramiento tiene coste (habitualmente asumible)',
      'La incertidumbre dificulta tomar la decisión sola',
    ],
  },
};

// Tabla de puntuaciones por respuesta (mismos valores que page.tsx)
const PUNTOS: Record<keyof PerfilFormaJuridica, Record<string, number>> = {
  ingresos_esperados:    { menos_30k: -3, '30k_60k': 0, '60k_100k': 2, mas_100k: 4 },
  socios:                { solo: -2, dos_o_mas: 3, quizas: 0 },
  riesgo_patrimonial:    { muy_bajo: -3, bajo: -1, medio: 1, alto: 3 },
  tipo_clientes:         { pocos_grandes: 1, muchos_pequenos: 0, uno_principal: -2, no_sabe: 0 },
  separacion_patrimonio: { no_prioritario: -2, deseable: 1, imprescindible: 3 },
  carga_administrativa:  { minima: -3, algo: 0, no_importa: 2 },
  proyeccion:            { complementaria: -3, principal_estable: -1, crecimiento: 3 },
  necesita_inversores:   { no: -1, posiblemente: 1, si: 3 },
  capital_inicial:       { no_inmovilizar: -2, uno_euro: 0, tengo_capital: 1 },
  experiencia:           { desde_cero: -1, autonomo_escalando: 2, experiencia_empresarial: 1 },
};

export function recomendarFormaJuridica(perfil: PerfilFormaJuridica): ResultadoSelectorFormaJuridica {
  let score = 0;

  (Object.keys(PUNTOS) as (keyof PerfilFormaJuridica)[]).forEach((campo) => {
    const valor = perfil[campo] as string;
    score += PUNTOS[campo][valor] ?? 0;
  });

  let forma: FormaJuridicaKey;
  if (score <= -8) forma = 'autonomo';
  else if (score >= 8) forma = 'sl';
  else forma = 'valorar';

  return {
    forma_recomendada: forma,
    ...DESCRIPCIONES[forma],
    score,
  };
}
