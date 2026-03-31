/**
 * Datos normativos: Maternidad, paternidad y familia en España
 *
 * ⚠️ HERRAMIENTA DE ORIENTACIÓN — No constituye asesoramiento oficial.
 * Datos verificados a la fecha indicada. Las cuantías y condiciones
 * se actualizan anualmente vía LPGE o modificaciones del Estatuto
 * de los Trabajadores / LGSS.
 *
 * Fuente: RDL 6/2019 (permiso nacimiento igualitario) + LGSS (RDL 8/2015)
 *         Ley 35/2006 IRPF art. 81 (deducción maternidad)
 *         LPGE 2025 (bases cotización, IPREM)
 * Verificado: 2026-03-31
 * URL oficial SS: https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/PrestacionesPensionesTrabajadores/10938
 */

// ─── Metadatos del módulo ────────────────────────────────────────────────────

export const FISCAL_MATERNIDAD_META = {
  fuente: 'RDL 6/2019 + LGSS (RDL 8/2015) + Ley 35/2006 IRPF art. 81 + LPGE 2025',
  verificado: '2026-03-31',
  vigencia: '2025-2026',
  urlOficial: 'https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/PrestacionesPensionesTrabajadores/10938',
  nota: 'Las cuantías dependen de la base reguladora individual. Los datos son orientativos y reflejan el marco general. Consultar con la Seguridad Social para el cálculo exacto.',
};

// ─── Permiso por nacimiento y cuidado del menor (RDL 6/2019) ─────────────────
// Desde 2021: 16 semanas para AMBOS progenitores (igualitario)

export interface PermisoNacimiento {
  progenitor: 'biologico' | 'otro';
  semanasTotal: number;
  semanasObligatorias: number;
  semanasVoluntarias: number;
  obligatoriasIninterrumpidas: boolean;
  voluntariasHasta: number; // meses desde el nacimiento
  simultaneoObligatorio: number; // semanas que ambos deben estar a la vez
}

export const PERMISO_NACIMIENTO_2025: PermisoNacimiento[] = [
  {
    progenitor: 'biologico',
    semanasTotal: 16,
    semanasObligatorias: 6,
    semanasVoluntarias: 10,
    obligatoriasIninterrumpidas: true,
    voluntariasHasta: 12, // hasta que el menor cumpla 12 meses
    simultaneoObligatorio: 6, // las 6 primeras semanas son simultáneas
  },
  {
    progenitor: 'otro',
    semanasTotal: 16,
    semanasObligatorias: 6,
    semanasVoluntarias: 10,
    obligatoriasIninterrumpidas: true,
    voluntariasHasta: 12,
    simultaneoObligatorio: 6,
  },
];

// ─── Ampliaciones del permiso ────────────────────────────────────────────────

export interface AmpliacionPermiso {
  motivo: string;
  semanasExtra: number;
  porProgenitor: boolean; // true = cada uno, false = solo uno
  nota: string;
}

export const AMPLIACIONES_PERMISO: AmpliacionPermiso[] = [
  {
    motivo: 'Parto múltiple',
    semanasExtra: 2,
    porProgenitor: true,
    nota: 'Por cada hijo/a adicional a partir del segundo',
  },
  {
    motivo: 'Discapacidad del hijo/a',
    semanasExtra: 2,
    porProgenitor: true,
    nota: 'Si el recién nacido tiene discapacidad reconocida',
  },
  {
    motivo: 'Parto prematuro (<37 semanas) u hospitalización neonatal',
    semanasExtra: 13,
    porProgenitor: false,
    nota: 'Hasta 13 semanas adicionales (días de hospitalización tras el parto). Solo un progenitor.',
  },
  {
    motivo: 'Adopción/acogimiento internacional',
    semanasExtra: 2,
    porProgenitor: false,
    nota: 'Hasta 2 semanas adicionales por desplazamiento al país de origen',
  },
];

// ─── Prestación económica por nacimiento (LGSS) ─────────────────────────────
// La prestación es el 100% de la base reguladora (BR)

export const PRESTACION_NACIMIENTO_2025 = {
  /** Porcentaje de la base reguladora que se cobra */
  porcentajeBaseReguladora: 100,
  /** Base reguladora = base de cotización del mes anterior / 30 días */
  calculoBaseReguladora: 'Base cotización mes anterior ÷ 30',
  /** Requisitos de cotización mínima */
  cotizacionMinima: {
    menores21: { meses: 0, nota: 'Sin período mínimo de cotización' },
    entre21y25: { meses: 3, nota: '90 días en los últimos 7 años, o 180 en toda la vida laboral' },
    mayores26: { meses: 6, nota: '180 días en los últimos 7 años, o 360 en toda la vida laboral' },
  },
  /** Prestación no contributiva (sin cotización suficiente) */
  noContributiva: {
    cuantiaDiaria: 20, // IPREM diario aproximado 2025
    cuantiaMensual: 600, // IPREM mensual 2025
    duracion: 42, // días naturales (6 semanas)
    nota: 'Si no se cumple el período mínimo de cotización, se cobra el 100% del IPREM durante 42 días',
  },
  /** Bases de cotización referencia 2025 */
  basesReferencia: {
    baseMinimaMensual: 1184.40,
    baseMaximaMensual: 4720.50,
  },
  /** Exenta de IRPF */
  exentaIRPF: true,
  nota: 'La prestación por nacimiento está exenta de IRPF (art. 7.h Ley IRPF). No se declara.',
};

// ─── Deducción por maternidad IRPF (art. 81 Ley 35/2006) ────────────────────
// Para madres trabajadoras con hijos menores de 3 años

export const DEDUCCION_MATERNIDAD_IRPF_2025 = {
  /** Importe anual por hijo menor de 3 años */
  importeAnualPorHijo: 1200,
  /** Importe mensual (se puede cobrar anticipado) */
  importeMensualPorHijo: 100,
  /** Incremento adicional por gastos de guardería/centro infantil autorizado */
  incrementoGuarderia: {
    importeMaximoAnual: 1000,
    requisito: 'Gastos en guardería o centro de educación infantil autorizado',
    nota: 'El centro debe comunicar los datos a la AEAT. Aplica hasta el mes anterior al inicio del segundo ciclo de educación infantil (generalmente septiembre del año en que el hijo cumple 3 años).',
  },
  /** Requisitos para aplicar la deducción */
  requisitos: {
    madresTrabajadoras: true,
    altaSSoMutualidad: true,
    hijoMenor3: true,
    padreViudo: true, // También aplica al padre/tutor si la madre fallece
    nota: 'Solo para madres (o padres viudos/tutores) dadas de alta en la SS o mutualidad. No aplica a desempleadas que cobran prestación sin cotizar.',
  },
  /** Cobro anticipado */
  anticipado: {
    disponible: true,
    formulario: 'Modelo 140',
    periodicidad: 'Mensual (100 €/mes por hijo)',
    nota: 'Se puede solicitar el cobro anticipado mensual a la AEAT presentando el Modelo 140.',
  },
};

// ─── Gastos estimados primer año del bebé ────────────────────────────────────
// Estimaciones medias España 2025 (rangos orientativos)

export interface CategoriaGasto {
  categoria: string;
  icono: string;
  gastoMinimo: number; // €/año estimación baja
  gastoMedio: number;  // €/año estimación media
  gastoAlto: number;   // €/año estimación alta
  nota: string;
}

export const GASTOS_PRIMER_ANO_BEBE: CategoriaGasto[] = [
  {
    categoria: 'Pañales y toallitas',
    icono: '🧷',
    gastoMinimo: 400,
    gastoMedio: 700,
    gastoAlto: 1100,
    nota: 'Desechables estándar vs. eco/marca. Los reutilizables reducen coste a largo plazo.',
  },
  {
    categoria: 'Alimentación (leche, potitos, cereales)',
    icono: '🍼',
    gastoMinimo: 300,
    gastoMedio: 800,
    gastoAlto: 1500,
    nota: 'Lactancia materna exclusiva reduce significativamente. Fórmula + alimentación complementaria en el rango alto.',
  },
  {
    categoria: 'Ropa y calzado',
    icono: '👶',
    gastoMinimo: 200,
    gastoMedio: 500,
    gastoAlto: 1200,
    nota: 'Ropa heredada/segunda mano vs. nueva. Los bebés crecen muy rápido (4-5 tallas el primer año).',
  },
  {
    categoria: 'Cuna, cochecito, silla coche',
    icono: '🛏️',
    gastoMinimo: 300,
    gastoMedio: 800,
    gastoAlto: 2500,
    nota: 'Inversión inicial fuerte. Segunda mano o heredado reduce mucho el coste. La silla de coche (grupo 0+) es obligatoria.',
  },
  {
    categoria: 'Guardería / Escuela infantil',
    icono: '🏫',
    gastoMinimo: 0,
    gastoMedio: 3000,
    gastoAlto: 6000,
    nota: 'Desde 0 € (no guardería o pública gratuita en algunas CCAA) hasta 500+ €/mes en privada. La mayor partida si aplica.',
  },
  {
    categoria: 'Pediatra y farmacia',
    icono: '🩺',
    gastoMinimo: 50,
    gastoMedio: 200,
    gastoAlto: 600,
    nota: 'SS pública cubre revisiones y urgencias. Coste adicional si se usa pediatra privado o seguro médico.',
  },
  {
    categoria: 'Higiene y cuidado (cremas, gel, colonia)',
    icono: '🧴',
    gastoMinimo: 100,
    gastoMedio: 250,
    gastoAlto: 500,
    nota: 'Productos básicos vs. marcas especializadas.',
  },
  {
    categoria: 'Juguetes y estimulación',
    icono: '🧸',
    gastoMinimo: 50,
    gastoMedio: 200,
    gastoAlto: 500,
    nota: 'Los bebés necesitan pocos juguetes el primer año. Libros sensoriales y mantas de juego son lo más útil.',
  },
  {
    categoria: 'Seguro médico privado (bebé)',
    icono: '🏥',
    gastoMinimo: 0,
    gastoMedio: 400,
    gastoAlto: 900,
    nota: 'Opcional. Desde 0 € (solo SS pública) hasta 75 €/mes en seguro privado con copago.',
  },
  {
    categoria: 'Otros (biberones, chupetes, sacaleches, etc.)',
    icono: '🎒',
    gastoMinimo: 100,
    gastoMedio: 300,
    gastoAlto: 700,
    nota: 'Accesorios varios, bolsa de paseo, intercomunicador, bañera, cambiador...',
  },
];

// ─── Estilos parentales (modelo Baumrind) ────────────────────────────────────
// Clasificación clásica validada: Diana Baumrind (1966) + Maccoby & Martin (1983)

export interface EstiloParental {
  id: string;
  nombre: string;
  icono: string;
  control: 'alto' | 'bajo';
  afecto: 'alto' | 'bajo';
  descripcion: string;
  caracteristicas: string[];
  impactoHijos: string;
  recomendacion: string;
}

export const ESTILOS_PARENTALES: EstiloParental[] = [
  {
    id: 'democratico',
    nombre: 'Democrático (Autoritativo)',
    icono: '🤝',
    control: 'alto',
    afecto: 'alto',
    descripcion: 'Equilibrio entre firmeza y calidez. Establece normas claras con explicación, escucha activa y negociación según la edad.',
    caracteristicas: [
      'Normas claras con explicaciones razonadas',
      'Escucha activa y validación emocional',
      'Consecuencias proporcionales y coherentes',
      'Fomento de la autonomía progresiva',
      'Comunicación bidireccional',
    ],
    impactoHijos: 'Mayor autoestima, mejor rendimiento académico, habilidades sociales sólidas, mejor regulación emocional.',
    recomendacion: 'Considerado el estilo más equilibrado por la evidencia. Mantener la coherencia entre ambos progenitores refuerza su eficacia.',
  },
  {
    id: 'autoritario',
    nombre: 'Autoritario',
    icono: '👊',
    control: 'alto',
    afecto: 'bajo',
    descripcion: 'Normas rígidas con poca explicación. La obediencia se espera sin discusión. Escasa demostración de afecto.',
    caracteristicas: [
      'Reglas estrictas sin margen de negociación',
      'Escasa explicación de los motivos',
      'Castigos como herramienta principal',
      'Poca expresión emocional',
      'Comunicación unidireccional (de padre a hijo)',
    ],
    impactoHijos: 'Obediencia a corto plazo, pero posible baja autoestima, ansiedad, dificultad en la toma de decisiones y rebeldía en adolescencia.',
    recomendacion: 'Si te identificas aquí, incorporar más momentos de escucha y explicar el porqué de las normas puede mejorar la relación sin perder autoridad.',
  },
  {
    id: 'permisivo',
    nombre: 'Permisivo (Indulgente)',
    icono: '🫶',
    control: 'bajo',
    afecto: 'alto',
    descripcion: 'Mucho cariño y aceptación, pero pocas normas o límites. Evita la confrontación y tiende a ceder ante las demandas del hijo.',
    caracteristicas: [
      'Pocos límites o normas definidas',
      'Dificultad para decir "no"',
      'Muy afectuoso y cercano',
      'Evita conflictos con el hijo',
      'El hijo tiene gran poder de decisión',
    ],
    impactoHijos: 'Buena autoestima pero posible baja tolerancia a la frustración, dificultad con normas sociales, impulsividad.',
    recomendacion: 'Mantener el afecto es valioso. Introducir normas claras y consistentes (pocas pero firmes) ayuda a equilibrar este estilo.',
  },
  {
    id: 'negligente',
    nombre: 'Negligente (No implicado)',
    icono: '😶',
    control: 'bajo',
    afecto: 'bajo',
    descripcion: 'Escasa implicación tanto en normas como en afecto. El progenitor está ausente física o emocionalmente.',
    caracteristicas: [
      'Poca supervisión del hijo',
      'Escasa o nula demostración de afecto',
      'Desinterés por el rendimiento escolar o las amistades',
      'Delegación excesiva del cuidado en terceros',
      'Falta de rutinas o estructura',
    ],
    impactoHijos: 'Riesgo de problemas de conducta, baja autoestima, dificultades académicas, apego inseguro.',
    recomendacion: 'Si te identificas aquí y deseas mejorar, buscar apoyo profesional (psicólogo familiar, servicios sociales) es un paso positivo y valiente. No se juzga, se acompaña.',
  },
];
