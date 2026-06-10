/**
 * Datos normativos: Dependencia y cuidadores en España
 *
 * ⚠️ HERRAMIENTA DE ORIENTACIÓN — No constituye asesoramiento oficial.
 * Datos verificados a la fecha indicada. Las cuantías se actualizan
 * anualmente (generalmente en enero) vía LPGE o RD de revalorización.
 * Verifica siempre en la fuente oficial antes de tomar decisiones.
 *
 * Fuente: Ley 39/2006 LAPAD + RD 1051/2013 copago + LPGE 2025
 *         Orden ISM/835/2023 (cotización cuidadores no profesionales)
 *         IRPF: Ley 35/2006 art. 60-65 (mínimos discapacidad)
 * Verificado: 2026-03-30
 * URL oficial IMSERSO: https://imserso.es/el-saad/prestaciones
 * URL oficial SS cuidadores: https://www.seg-social.es
 */

// ─── Metadatos del módulo ────────────────────────────────────────────────────

export const FISCAL_DEPENDENCIA_META = {
  fuente: 'Ley 39/2006 LAPAD + LPGE 2025 + RD 1051/2013 + Orden ISM/835/2023',
  verificado: '2026-03-30',
  vigencia: '2025-2026',
  urlOficial: 'https://imserso.es/el-saad/prestaciones',
  nota: 'Las cuantías son máximas estatales. Cada CCAA puede complementar con importes adicionales. El copago reduce la prestación según capacidad económica. Datos orientativos.',
};

// ─── Grados de dependencia (Ley 39/2006 + RD 174/2011 BVD) ──────────────────

export interface GradoDependencia {
  grado: number;
  nombre: string;
  descripcion: string;
  puntuacionBVDDesde: number;
  puntuacionBVDHasta: number;
}

export const GRADOS_DEPENDENCIA: GradoDependencia[] = [
  {
    grado: 1,
    nombre: 'Grado I — Dependencia Moderada',
    descripcion: 'Necesita ayuda para realizar varias ABVD al menos una vez al día o apoyo intermitente',
    puntuacionBVDDesde: 25,
    puntuacionBVDHasta: 49,
  },
  {
    grado: 2,
    nombre: 'Grado II — Dependencia Severa',
    descripcion: 'Necesita ayuda 2-3 veces al día para varias ABVD sin presencia permanente de cuidador',
    puntuacionBVDDesde: 50,
    puntuacionBVDHasta: 74,
  },
  {
    grado: 3,
    nombre: 'Grado III — Gran Dependencia',
    descripcion: 'Necesita ayuda varias veces al día y presencia/supervisión continua de otra persona',
    puntuacionBVDDesde: 75,
    puntuacionBVDHasta: 100,
  },
];

// ─── Prestaciones económicas SAAD 2025 (cuantías máximas €/mes) ──────────────
// Cuantías máximas estatales. El copago reduce según capacidad económica.
// Actualizadas con RD de revalorización enero 2025.

export interface PrestacionDependencia {
  grado: number;
  tipo: 'PEVS' | 'PECEF' | 'PAP';
  nombre: string;
  descripcion: string;
  cuantiaMaximaMensual: number;
}

/** PEVS = Prestación Económica Vinculada a Servicio */
/** PECEF = Prestación Económica para Cuidados en el Entorno Familiar */
/** PAP = Prestación de Asistencia Personal */

export const PRESTACIONES_DEPENDENCIA_2025: PrestacionDependencia[] = [
  // Grado I
  { grado: 1, tipo: 'PEVS',  nombre: 'Vinculada a servicio (Grado I)',             descripcion: 'Para contratar servicios privados acreditados',   cuantiaMaximaMensual: 300 },
  { grado: 1, tipo: 'PECEF', nombre: 'Cuidados entorno familiar (Grado I)',        descripcion: 'Para cuidador familiar no profesional',             cuantiaMaximaMensual: 153 },
  // Grado II
  { grado: 2, tipo: 'PEVS',  nombre: 'Vinculada a servicio (Grado II)',            descripcion: 'Para contratar servicios privados acreditados',   cuantiaMaximaMensual: 426.12 },
  { grado: 2, tipo: 'PECEF', nombre: 'Cuidados entorno familiar (Grado II)',       descripcion: 'Para cuidador familiar no profesional',             cuantiaMaximaMensual: 286.66 },
  // Grado III
  { grado: 3, tipo: 'PEVS',  nombre: 'Vinculada a servicio (Grado III)',           descripcion: 'Para contratar servicios privados acreditados',   cuantiaMaximaMensual: 833.96 },
  { grado: 3, tipo: 'PECEF', nombre: 'Cuidados entorno familiar (Grado III)',      descripcion: 'Para cuidador familiar no profesional',             cuantiaMaximaMensual: 449.77 },
  { grado: 3, tipo: 'PAP',   nombre: 'Asistencia personal (Grado III)',            descripcion: 'Para contratar asistente personal (vida activa)',  cuantiaMaximaMensual: 833.96 },
];

// ─── Servicios del catálogo SAAD ─────────────────────────────────────────────

export interface ServicioSAAD {
  id: string;
  nombre: string;
  descripcion: string;
  gradosAcceso: number[]; // Grados que pueden acceder
}

export const SERVICIOS_SAAD: ServicioSAAD[] = [
  { id: 'teleasistencia',    nombre: 'Teleasistencia',                 descripcion: 'Dispositivo de alarma 24h con atención telefónica',                      gradosAcceso: [1, 2, 3] },
  { id: 'sad',               nombre: 'Ayuda a Domicilio (SAD)',        descripcion: 'Horas de ayuda personal y doméstica en el hogar',                         gradosAcceso: [1, 2, 3] },
  { id: 'centroDia',         nombre: 'Centro de Día',                  descripcion: 'Atención diurna especializada con transporte',                            gradosAcceso: [1, 2, 3] },
  { id: 'centroNoche',       nombre: 'Centro de Noche',                descripcion: 'Atención nocturna especializada',                                         gradosAcceso: [2, 3] },
  { id: 'residencia',        nombre: 'Atención Residencial',           descripcion: 'Plaza en residencia pública o concertada',                                gradosAcceso: [1, 2, 3] },
  { id: 'prevencion',        nombre: 'Prevención y Promoción',         descripcion: 'Programas de prevención del deterioro y promoción de la autonomía',       gradosAcceso: [1, 2, 3] },
];

// ─── Copago (RD 1051/2013) ───────────────────────────────────────────────────
// El copago se calcula sobre la capacidad económica del beneficiario.
// IPREM 2025 = 600 €/mes (7.200 €/año en 12 pagas, 8.400 €/año en 14 pagas)

export const COPAGO_DEPENDENCIA_2025 = {
  iprem2025Mensual: 600,
  iprem2025Anual14: 8400,
  /** Umbral mínimo de renta bajo el cual no hay copago (% del IPREM) */
  umbralExencionPorcentajeIPREM: 100,
  /** Porcentaje máximo de copago sobre la prestación económica */
  porcentajeMaximoCopago: {
    grado1: 90,
    grado2: 90,
    grado3: 90,
  },
  nota: 'El copago depende de la capacidad económica (renta + patrimonio). Los tramos exactos varían por CCAA. Consultar con Servicios Sociales para el cálculo personalizado.',
};

// ─── Cotización SS cuidadores no profesionales ──────────────────────────────
// Orden ISM/835/2023 + LPGE 2025
// El cuidador no profesional puede ser dado de alta en SS por convenio especial.

export const COTIZACION_CUIDADOR_NO_PROFESIONAL_2025 = {
  /** Base de cotización mensual (base mínima del Régimen General) — Orden PJC/178/2025 */
  baseCotizacionMensual: 1381.20,
  /** Tipo de cotización (%) — jubilación, IT, muerte y supervivencia */
  tipoCotizacion: 28.30,
  /** Cuota mensual resultante aproximada */
  cuotaMensualAproximada: 335.19,
  /** Bonificación estatal: el Estado abona el 100% de la cuota */
  bonificacionEstatal100: true,
  nota: 'Desde 2023, el Estado cubre el 100% de la cotización del cuidador no profesional en convenio especial. El cuidador queda protegido por jubilación, IT y muerte/supervivencia.',
  fuente: 'Orden ISM/835/2023 + RDL 2/2023',
};

// ─── Deducciones IRPF por discapacidad y dependencia ─────────────────────────
// Ley 35/2006 del IRPF, arts. 60-65 (mínimos personales y familiares)
// Complementa los datos de irpf.ts con detalle para el nicho de dependencia

export const DEDUCCIONES_IRPF_DISCAPACIDAD_2025 = {
  // Mínimo por discapacidad del contribuyente
  contribuyente: {
    discapacidad33a65: 3000,
    discapacidad65oMas: 9000,
    gastosAsistencia33a65: 3000,  // Adicional si acredita necesidad de ayuda de terceros o movilidad reducida
    gastosAsistencia65oMas: 3000, // Adicional (acumulable al mínimo por discapacidad ≥65%)
  },
  // Mínimo por discapacidad de ascendientes/descendientes
  familiar: {
    discapacidad33a65: 3000,
    discapacidad65oMas: 9000,
    gastosAsistencia33a65: 3000,
    gastosAsistencia65oMas: 3000,
  },
  // Requisitos para aplicar mínimo por ascendiente con discapacidad
  requisitosAscendiente: {
    edadMinima: 65, // O cualquier edad si tiene discapacidad ≥33%
    rentaMaxima: 8000, // Rentas anuales máximas del ascendiente (excluidas exentas)
    convivencia: true, // Debe convivir con el contribuyente (o dependencia)
  },
  nota: 'Los gastos de asistencia (3.000 €) se suman al mínimo por discapacidad si se acredita necesidad de ayuda de terceros o movilidad reducida (≥33% + certificado). El mínimo reduce la base liquidable, no la cuota directamente.',
};

// ─── Escala Zarit (Caregiver Burden Interview) ──────────────────────────────
// Escala validada en español: Martín et al., 1996
// 22 ítems, puntuación 22-110

export interface NivelZarit {
  nombre: string;
  puntuacionDesde: number;
  puntuacionHasta: number;
  descripcion: string;
  recomendaciones: string[];
}

export const ESCALA_ZARIT_NIVELES: NivelZarit[] = [
  {
    nombre: 'Sin sobrecarga',
    puntuacionDesde: 22,
    puntuacionHasta: 46,
    descripcion: 'El cuidador no presenta signos significativos de sobrecarga. La situación de cuidado es sostenible.',
    recomendaciones: [
      'Mantener las rutinas de autocuidado actuales',
      'Establecer redes de apoyo preventivas',
      'Informarse sobre recursos disponibles para cuando la situación cambie',
    ],
  },
  {
    nombre: 'Sobrecarga leve',
    puntuacionDesde: 47,
    puntuacionHasta: 55,
    descripcion: 'Se detectan signos iniciales de sobrecarga. Es un momento clave para actuar preventivamente.',
    recomendaciones: [
      'Buscar apoyo de otros familiares para repartir tareas',
      'Solicitar información sobre servicios de respiro familiar',
      'Considerar grupos de apoyo para cuidadores (presenciales u online)',
      'Revisar si se ha solicitado la valoración de dependencia',
    ],
  },
  {
    nombre: 'Sobrecarga intensa',
    puntuacionDesde: 56,
    puntuacionHasta: 110,
    descripcion: 'El cuidador presenta sobrecarga significativa con riesgo para su salud física y mental. Requiere intervención.',
    recomendaciones: [
      'Consultar con el médico de cabecera sobre el estado de salud propio',
      'Solicitar servicio de respiro familiar o centro de día urgente',
      'Contactar con asociaciones de cuidadores de la CCAA',
      'Valorar la incorporación de ayuda profesional (SAD, cuidador externo)',
      'Considerar la prestación económica del SAAD si no se ha solicitado',
      'Teléfono de atención al cuidador: 900 123 700 (Línea de Atención a la Dependencia)',
    ],
  },
];

export const PREGUNTAS_ZARIT = [
  '¿Siente que su familiar solicita más ayuda de la que realmente necesita?',
  '¿Siente que debido al tiempo que dedica a su familiar ya no dispone de tiempo suficiente para usted?',
  '¿Se siente tenso/a cuando tiene que cuidar a su familiar y atender además otras responsabilidades?',
  '¿Se siente avergonzado/a por la conducta de su familiar?',
  '¿Se siente enfadado/a cuando está cerca de su familiar?',
  '¿Cree que la situación actual afecta de manera negativa a su relación con amigos u otros miembros de su familia?',
  '¿Siente temor por el futuro que le espera a su familiar?',
  '¿Siente que su familiar depende de usted?',
  '¿Se siente agotado/a cuando tiene que estar junto a su familiar?',
  '¿Siente que su salud se ha resentido por cuidar a su familiar?',
  '¿Siente que no tiene la vida privada que desearía debido a su familiar?',
  '¿Cree que su vida social se ha visto afectada por tener que cuidar de su familiar?',
  '¿Se siente incómodo/a para invitar amigos a casa a causa de su familiar?',
  '¿Cree que su familiar espera que usted le cuide como si fuera la única persona con la que puede contar?',
  '¿Cree que no dispone de dinero suficiente para cuidar a su familiar además de sus otros gastos?',
  '¿Siente que será incapaz de cuidar a su familiar por mucho más tiempo?',
  '¿Siente que ha perdido el control sobre su vida desde que la enfermedad de su familiar se manifestó?',
  '¿Desearía poder encargar el cuidado de su familiar a otras personas?',
  '¿Se siente inseguro/a acerca de lo que debe hacer con su familiar?',
  '¿Siente que debería hacer más de lo que hace por su familiar?',
  '¿Cree que podría cuidar de su familiar mejor de lo que lo hace?',
  'En general, ¿se siente muy sobrecargado/a por tener que cuidar de su familiar?',
];

// ─── Recursos y teléfonos de ayuda ───────────────────────────────────────────

export const RECURSOS_CUIDADORES = {
  telefonoIMSERSO: '901 109 899',
  telefonoDependencia: '900 123 700',
  telefonoEmergencias: '112',
  webIMSERSO: 'https://imserso.es',
  webSAAD: 'https://imserso.es/el-saad',
  webSegSocial: 'https://www.seg-social.es',
  nota: 'Los Servicios Sociales municipales son el primer punto de contacto para cualquier trámite de dependencia.',
};
