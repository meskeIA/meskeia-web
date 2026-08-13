/**
 * Datos normativos: Maternidad, paternidad y familia en España
 *
 * ⚠️ HERRAMIENTA DE ORIENTACIÓN — No constituye asesoramiento oficial.
 * Datos verificados a la fecha indicada. Las cuantías y condiciones
 * se actualizan vía RDL o modificaciones del Estatuto de los
 * Trabajadores / LGSS.
 *
 * Fuente: RDL 6/2019 (equiparación permisos 2021) + RDL 9/2025 (ampliación
 *         a 19/32 semanas, en vigor 31-jul-2025, BOE-A-2025-15741) + LGSS
 *         (RDL 8/2015) arts. 177-182 + Ley 35/2006 IRPF art. 81, en la
 *         redacción dada por el art. 64 de la Ley 31/2022 (BOE-A-2022-22128,
 *         efectos 01-ene-2023)
 * Verificado: 2026-08-13
 * URL oficial: https://www.boe.es/buscar/act.php?id=BOE-A-2025-15741
 */

import { IPREM_2026 } from './iprem';
import { BASES_SS_2026 } from './irpf';

// ─── Metadatos del módulo ────────────────────────────────────────────────────

export const FISCAL_MATERNIDAD_META = {
  fuente: 'RDL 9/2025 (BOE-A-2025-15741) + LGSS arts. 177-182 (RDL 8/2015) + Ley 35/2006 IRPF art. 81, redacción del art. 64 de la Ley 31/2022 (BOE-A-2022-22128)',
  verificado: '2026-08-13',
  vigencia: '2026',
  urlOficial: 'https://www.boe.es/buscar/act.php?id=BOE-A-2025-15741',
  /** El art. 81 LIRPF tiene su propio enlace: es la norma que rige la deducción, no el permiso. */
  urlDeduccionIRPF: 'https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764#a81',
  nota: 'Las cuantías dependen de la base reguladora individual. Los datos son orientativos y reflejan el marco general. Consultar con la Seguridad Social para el cálculo exacto.',
};

// ─── Permiso por nacimiento y cuidado del menor (RDL 9/2025) ─────────────────
// En vigor desde el 31-jul-2025 (BOE-A-2025-15741): 19 semanas por progenitor
// en familias biparentales, 32 semanas en familias monoparentales

export interface PermisoNacimiento {
  tipoFamilia: 'biparental' | 'monoparental';
  /** Semanas totales por progenitor (biparental) o para el único progenitor (monoparental) */
  semanasTotal: number;
  /** Primeras semanas, ininterrumpidas tras el nacimiento */
  semanasObligatorias: number;
  /** Semanas de disfrute flexible hasta que el menor cumpla 12 meses */
  semanasFlexiblesHasta12Meses: number;
  /** Semanas de cuidado prolongado, distribuibles hasta que el menor cumpla 8 años */
  semanasCuidadoProlongadoHasta8Anios: number;
  /** Suma de flexibles + cuidado prolongado (semanas no obligatorias) */
  semanasVoluntarias: number;
  obligatoriasIninterrumpidas: boolean;
  voluntariasHasta: number; // meses desde el nacimiento
  cuidadoProlongadoHastaAnios: number; // años del menor
  simultaneoObligatorio: number; // semanas que ambos progenitores deben coincidir (0 en monoparental)
}

export const PERMISO_NACIMIENTO: PermisoNacimiento[] = [
  {
    tipoFamilia: 'biparental',
    semanasTotal: 19,
    semanasObligatorias: 6,
    semanasFlexiblesHasta12Meses: 11,
    semanasCuidadoProlongadoHasta8Anios: 2,
    semanasVoluntarias: 13,
    obligatoriasIninterrumpidas: true,
    voluntariasHasta: 12,
    cuidadoProlongadoHastaAnios: 8,
    simultaneoObligatorio: 6, // las 6 primeras semanas son simultáneas
  },
  {
    tipoFamilia: 'monoparental',
    semanasTotal: 32,
    semanasObligatorias: 6,
    semanasFlexiblesHasta12Meses: 22,
    semanasCuidadoProlongadoHasta8Anios: 4,
    semanasVoluntarias: 26,
    obligatoriasIninterrumpidas: true,
    voluntariasHasta: 12,
    cuidadoProlongadoHastaAnios: 8,
    simultaneoObligatorio: 0,
  },
];

// ─── Ampliaciones del permiso ────────────────────────────────────────────────

/**
 * Identificador estable de cada ampliación. Existe para que los consumidores no
 * dependan ni del ORDEN del array ni del TEXTO de `motivo`: hasta el 13/08/2026,
 * `estimacion-baja-maternal` accedía por índice (`AMPLIACIONES_PERMISO[0]`), de
 * modo que reordenar esta lista habría cambiado sus cálculos sin error visible.
 */
export type AmpliacionId =
  | 'parto-multiple'
  | 'discapacidad-menor'
  | 'hospitalizacion-neonatal'
  | 'adopcion-internacional';

export interface AmpliacionPermiso {
  id: AmpliacionId;
  motivo: string;
  semanasExtra: number;
  porProgenitor: boolean; // true = cada uno, false = solo uno
  nota: string;
}

export const AMPLIACIONES_PERMISO: AmpliacionPermiso[] = [
  {
    id: 'parto-multiple',
    motivo: 'Parto múltiple',
    semanasExtra: 1,
    porProgenitor: true,
    nota: 'Por cada hijo/a adicional a partir del segundo (RDL 9/2025)',
  },
  {
    id: 'discapacidad-menor',
    motivo: 'Discapacidad del hijo/a',
    semanasExtra: 2,
    porProgenitor: true,
    nota: 'Si el recién nacido tiene discapacidad reconocida',
  },
  {
    id: 'hospitalizacion-neonatal',
    motivo: 'Parto prematuro (<37 semanas) u hospitalización neonatal',
    semanasExtra: 13,
    porProgenitor: false,
    nota: 'Hasta 13 semanas adicionales (días de hospitalización tras el parto). Solo un progenitor.',
  },
  {
    id: 'adopcion-internacional',
    motivo: 'Adopción/acogimiento internacional',
    semanasExtra: 2,
    porProgenitor: false,
    nota: 'Hasta 2 semanas adicionales por desplazamiento al país de origen',
  },
];

/** Acceso por identificador: ni el orden ni la redacción del motivo pueden romperlo. */
export const AMPLIACION_POR_ID = Object.fromEntries(
  AMPLIACIONES_PERMISO.map((a) => [a.id, a]),
) as Record<AmpliacionId, AmpliacionPermiso>;

// ─── Prestación económica por nacimiento (LGSS) ─────────────────────────────
// La prestación es el 100% de la base reguladora (BR)

export const PRESTACION_NACIMIENTO = {
  /** Porcentaje de la base reguladora que se cobra */
  porcentajeBaseReguladora: 100,
  /** Base reguladora = base de cotización del mes anterior / 30 días */
  calculoBaseReguladora: 'Base cotización mes anterior ÷ 30',
  /**
   * Período mínimo de cotización del art. 178.1 LGSS. La edad es la que se
   * tiene **en la fecha del nacimiento** (art. 178.2). Los dos umbrales de cada
   * tramo son ALTERNATIVOS: basta cumplir uno de los dos.
   *
   * El campo `meses` anterior (0/3/6) era una traducción aproximada que la ley
   * no usa —habla en días— y no permitía comprobar nada.
   */
  cotizacionMinima: {
    menores21: {
      diasUltimos7Anios: 0,
      diasVidaLaboral: 0,
      nota: 'Sin período mínimo de cotización',
    },
    entre21y25: {
      diasUltimos7Anios: 90,
      diasVidaLaboral: 180,
      nota: '90 días en los últimos 7 años, o 180 en toda la vida laboral',
    },
    mayores26: {
      diasUltimos7Anios: 180,
      diasVidaLaboral: 360,
      nota: '180 días en los últimos 7 años, o 360 en toda la vida laboral',
    },
  },
  /** Art. 178.4 (añadido por el RDL 9/2025): hay que estar en alta o situación asimilada. */
  exigeAltaOAsimilada: true,
  /**
   * Prestación no contributiva (art. 182 LGSS, redacción del RDL 9/2025).
   * El IPREM se importa de `iprem.ts`: es un dato vigilado allí y duplicarlo
   * aquí lo dejaría envejecer en dos sitios a la vez.
   */
  noContributiva: {
    cuantiaDiaria: IPREM_2026.diario,
    cuantiaMensual: IPREM_2026.mensual,
    duracion: 42, // días naturales (6 semanas de descanso obligatorio)
    /** Art. 182.3 LGSS: la duración se incrementa en 14 días naturales en cuatro supuestos. */
    incrementoDias: 14,
    supuestosIncremento: [
      'Familia numerosa (o que adquiera esa condición con el nacimiento)',
      'Monoparentalidad por existir un único progenitor',
      'Parto, adopción, guarda o acogimiento múltiple (dos o más)',
      'Discapacidad ≥ 65% del progenitor beneficiario o del menor',
    ],
    /** El incremento se aplica UNA sola vez aunque concurran dos o más supuestos (art. 182.3 in fine). */
    incrementoAcumulable: false,
    /** Art. 182.2: el 100% del IPREM opera como tope, no como cuantía fija. */
    topeBaseReguladoraInferior: true,
    nota: 'Sin el período mínimo de cotización se cobra el 100% del IPREM durante 42 días naturales —salvo que la base reguladora sea inferior, en cuyo caso se cobra esta—, ampliables en 14 días por familia numerosa, monoparentalidad, parto múltiple o discapacidad ≥65%. El incremento no se acumula si concurren varios supuestos.',
  },
  /**
   * Bases de cotización 2026 (Orden PJC/297/2026), importadas de `irpf.ts`.
   * Hasta el 13/08/2026 este bloque tenía las de 2025 (Orden PJC/178/2025:
   * 1.381,20 / 4.909,50) mientras declaraba vigencia 2025-2026.
   */
  basesReferencia: {
    baseMinimaMensual: BASES_SS_2026.minima,
    baseMaximaMensual: BASES_SS_2026.maxima,
  },
  /** Exenta de IRPF */
  exentaIRPF: true,
  nota: 'La prestación por nacimiento está exenta de IRPF (art. 7.h Ley IRPF). No se declara.',
};

// ─── Deducción por maternidad IRPF (art. 81 Ley 35/2006) ────────────────────
// Redacción vigente desde el 01-ene-2023, dada por el art. 64 de la Ley 31/2022
// (BOE-A-2022-22128). Esa reforma AMPLIÓ el círculo de beneficiarias: hasta 2022
// se exigía estar de alta y realizar una actividad; desde 2023 basta con percibir
// prestación o subsidio de desempleo en el momento del nacimiento, o darse de alta
// en cualquier momento posterior con 30 días cotizados.

export const DEDUCCION_MATERNIDAD_IRPF = {
  /** Importe anual por hijo menor de 3 años */
  importeAnualPorHijo: 1200,
  /** Importe mensual (se puede cobrar anticipado) */
  importeMensualPorHijo: 100,
  /** Incremento adicional por gastos de guardería/centro infantil autorizado */
  incrementoGuarderia: {
    importeMaximoAnual: 1000,
    requisito: 'Gastos en guardería o centro de educación infantil autorizado',
    /** Art. 81.3 in fine: además del tope de 1.000 €, límite del gasto realmente pagado. */
    limiteGastoEfectivo: 'El importe total del gasto efectivo NO subvencionado satisfecho en el período al centro',
    nota: 'El centro debe comunicar los datos a la AEAT. Aplica hasta el mes anterior al inicio del segundo ciclo de educación infantil (generalmente septiembre del año en que el hijo cumple 3 años).',
  },
  /**
   * Vías de acceso del art. 81.1. Son ALTERNATIVAS: basta cumplir una.
   * No estar de alta hoy NO excluye por sí solo del derecho.
   */
  situacionesConDerecho: [
    {
      id: 'alta',
      titulo: 'De alta en la Seguridad Social o mutualidad',
      detalle: 'En el momento del nacimiento o en cualquier momento posterior (por cuenta propia o ajena).',
      requiere30Dias: false,
    },
    {
      id: 'desempleo',
      titulo: 'Percibiendo prestación o subsidio de desempleo al nacer el menor',
      detalle: 'Prestaciones contributivas o asistenciales del sistema de protección por desempleo. Da derecho aunque no se esté de alta.',
      requiere30Dias: false,
    },
    {
      id: 'alta-posterior',
      titulo: 'Alta posterior al nacimiento con 30 días cotizados',
      detalle: 'Quien se da de alta después del nacimiento accede a la deducción al alcanzar 30 días cotizados.',
      requiere30Dias: true,
    },
  ],
  /** Art. 81.3, párrafo 2: pago único adicional el mes en que se completan los 30 días cotizados. */
  incrementoAltaPosterior: {
    importe: 150,
    nota: 'Cuando el derecho nace por alta posterior al nacimiento, la deducción del mes en que se cumplen los 30 días cotizados se incrementa en 150 €.',
  },
  /** Art. 81.3: incompatibilidad mes a mes con el complemento de ayuda para la infancia del IMV. */
  incompatibilidadIMV: {
    aplica: true,
    norma: 'Ley 19/2021, de 20 de diciembre (ingreso mínimo vital)',
    nota: 'No se computan los meses en que cualquiera de los progenitores perciba por ese descendiente el complemento de ayuda para la infancia del IMV.',
  },
  /** Requisitos para aplicar la deducción */
  requisitos: {
    hijoMenor3: true,
    minimoPorDescendientes: true,
    padreViudo: true, // También aplica al padre/tutor si la madre fallece
    nota: 'Mujeres con derecho al mínimo por descendientes por un hijo menor de 3 años que estén de alta en la SS o mutualidad, o que percibieran prestación o subsidio de desempleo al nacer el menor. También aplica al padre o tutor en caso de fallecimiento de la madre o guarda y custodia exclusiva.',
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
