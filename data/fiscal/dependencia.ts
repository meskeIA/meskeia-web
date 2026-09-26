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
 *         RDL 17/2026 (Grado III+ y nivel mínimo de protección, BOE-A-2026-13643)
 * Verificado: 2026-07-14
 * URL oficial IMSERSO: https://imserso.es/el-saad/prestaciones
 * URL oficial SS cuidadores: https://www.seg-social.es
 */

// ─── Metadatos del módulo ────────────────────────────────────────────────────

export const FISCAL_DEPENDENCIA_META = {
  fuente: 'Ley 39/2006 LAPAD + LPGE 2025 + RD 1051/2013 + Orden ISM/835/2023 + RDL 17/2026',
  verificado: '2026-07-14',
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

// ─── Grado III+ «dependencia extrema» (RDL 17/2026) ─────────────────────────
// Nueva categoría ADICIONAL a los Grados I-III, en vigor desde el 25/06/2026.
// El RDL NO define su baremo de valoración (pendiente de desarrollo
// reglamentario), por lo que NO se integra en GRADOS_DEPENDENCIA: no hay
// puntuación BVD oficial que asignarle todavía.

// ⚠️ 26/09/2026: el origen estaba mal. Lo crea el RDL 11/2025, de 21 de octubre, que añade la
// disposición adicional 17.ª a la Ley 39/2006 (BOE-A-2025-21205, leído en sesión); el RDL
// 17/2026 solo le fijó después el nivel mínimo de protección. Las cuantías de
// PRESTACIONES_DEPENDENCIA_2025 están pendientes de cotejo con el anexo IV vigente (Inspector).
export const GRADO_III_PLUS = {
  nombre: 'Grado III+ — Dependencia Extrema',
  baseNormativa: 'RDL 11/2025, de 21 de octubre (BOE-A-2025-21205), que añade la disposición adicional 17.ª a la Ley 39/2006',
  enVigorDesde: '2025-10-23',
  /** Cuantía máxima estatal de la prestación vinculada al servicio de ayuda a domicilio y de la de asistencia personal (RDL 11/2025). */
  cuantiaMaximaMensual: 9859,
  descripcion:
    'Categoría adicional a los Grados I-III para situaciones de dependencia extrema (p. ej. ELA y enfermedades de alta complejidad). Criterios de valoración pendientes de desarrollo reglamentario.',
  nota: 'Algunas CCAA lo despliegan en paralelo con prestación directa propia (p. ej. Extremadura, DL 2/2026: 3.200-9.859 €/mes para ELA y alta complejidad, con procedimiento acelerado de 2 meses).',
};

// ─── Baremo de Valoración de la Dependencia (RD 174/2011, anexo I) ──────────
// Pesos de la columna «18 y más» años. Verificado contra el texto del BOE
// (BOE-A-2011-3174) el 24/09/2026: los pesos de las tareas de cada actividad
// suman 1,00 y los de las actividades de cada escala suman 100.
//
// Puntuación final = Σ (peso de la tarea × peso de su actividad × coeficiente
// del tipo de apoyo), sumado SOLO sobre las tareas con desempeño negativo por
// dependencia, y redondeado al entero más cercano. Con una condición de salud
// que afecte a las funciones mentales se calcula además la escala específica
// (anexo B, que añade «Tomar decisiones») y vale la MAYOR de las dos.
// Los cortes de grado son los de GRADOS_DEPENDENCIA (25 / 50 / 75).

export const BVD_META = {
  fuente: 'RD 174/2011, anexo I (BVD): anexos A, B y C, escala de 18 y más años',
  verificado: '2026-09-24',
  urlOficial: 'https://www.boe.es/buscar/act.php?id=BOE-A-2011-3174',
};

/** Coeficientes del tipo de apoyo de otra u otras personas (anexo C) */
export const BVD_COEFICIENTES_APOYO = {
  supervision: 0.9,
  fisicaParcial: 0.9,
  sustitucionMaxima: 0.95,
  apoyoEspecial: 1.0,
};

export interface TareaBVD {
  id: string;
  nombre: string;
  /** Peso de la tarea dentro de su actividad (18 y más años; igual en ambas escalas) */
  peso: number;
}

export interface ActividadBVD {
  id: string;
  nombre: string;
  /** Peso en la escala general (anexo A); null si la actividad no existe en ella */
  pesoGeneral: number | null;
  /** Peso en la escala específica para funciones mentales (anexo B) */
  pesoEspecifico: number;
  tareas: TareaBVD[];
}

export const BVD_ACTIVIDADES_18_MAS: ActividadBVD[] = [
  {
    id: 'comer', nombre: 'Comer y beber', pesoGeneral: 16.8, pesoEspecifico: 10.0,
    tareas: [
      { id: 'comer-alcanzar', nombre: 'Reconocer y/o alcanzar los alimentos servidos', peso: 0.25 },
      { id: 'comer-cortar', nombre: 'Cortar o partir la comida en trozos', peso: 0.20 },
      { id: 'comer-cubiertos', nombre: 'Usar cubiertos para llevar la comida a la boca', peso: 0.30 },
      { id: 'comer-beber', nombre: 'Acercarse el recipiente de bebida a la boca', peso: 0.25 },
    ],
  },
  {
    id: 'miccion', nombre: 'Higiene personal relacionada con la micción y defecación', pesoGeneral: 14.8, pesoEspecifico: 7.0,
    tareas: [
      { id: 'miccion-acudir', nombre: 'Acudir a un lugar adecuado', peso: 0.20 },
      { id: 'miccion-ropa', nombre: 'Manipular la ropa', peso: 0.15 },
      { id: 'miccion-postura', nombre: 'Adoptar o abandonar la postura adecuada', peso: 0.30 },
      { id: 'miccion-limpiarse', nombre: 'Limpiarse', peso: 0.35 },
    ],
  },
  {
    id: 'lavarse', nombre: 'Lavarse', pesoGeneral: 8.8, pesoEspecifico: 8.0,
    tareas: [
      { id: 'lavarse-grifos', nombre: 'Abrir y cerrar grifos', peso: 0.15 },
      { id: 'lavarse-manos', nombre: 'Lavarse las manos', peso: 0.20 },
      { id: 'lavarse-ducha', nombre: 'Acceder a la bañera, ducha o similar', peso: 0.15 },
      { id: 'lavarse-inferior', nombre: 'Lavarse la parte inferior del cuerpo', peso: 0.25 },
      { id: 'lavarse-superior', nombre: 'Lavarse la parte superior del cuerpo', peso: 0.25 },
    ],
  },
  {
    id: 'cuidados', nombre: 'Realizar otros cuidados corporales', pesoGeneral: 2.9, pesoEspecifico: 2.0,
    tareas: [
      { id: 'cuidados-peinarse', nombre: 'Peinarse', peso: 0.30 },
      { id: 'cuidados-unas', nombre: 'Cortarse las uñas', peso: 0.15 },
      { id: 'cuidados-pelo', nombre: 'Lavarse el pelo', peso: 0.25 },
      { id: 'cuidados-dientes', nombre: 'Lavarse los dientes', peso: 0.30 },
    ],
  },
  {
    id: 'vestirse', nombre: 'Vestirse', pesoGeneral: 11.9, pesoEspecifico: 11.6,
    tareas: [
      { id: 'vestirse-alcanzar', nombre: 'Reconocer y alcanzar la ropa y el calzado', peso: 0.15 },
      { id: 'vestirse-calzarse', nombre: 'Calzarse', peso: 0.10 },
      { id: 'vestirse-botones', nombre: 'Abrocharse botones o similar', peso: 0.15 },
      { id: 'vestirse-inferior', nombre: 'Vestirse las prendas de la parte inferior del cuerpo', peso: 0.30 },
      { id: 'vestirse-superior', nombre: 'Vestirse las prendas de la parte superior del cuerpo', peso: 0.30 },
    ],
  },
  {
    id: 'salud', nombre: 'Mantenimiento de la salud', pesoGeneral: 2.9, pesoEspecifico: 11.0,
    tareas: [
      { id: 'salud-solicitar', nombre: 'Solicitar asistencia terapéutica', peso: 0.15 },
      { id: 'salud-medidas', nombre: 'Aplicarse las medidas terapéuticas recomendadas', peso: 0.10 },
      { id: 'salud-riesgo-dentro', nombre: 'Evitar situaciones de riesgo dentro del domicilio', peso: 0.25 },
      { id: 'salud-riesgo-fuera', nombre: 'Evitar situaciones de riesgo fuera del domicilio', peso: 0.25 },
      { id: 'salud-urgencia', nombre: 'Pedir ayuda ante una urgencia', peso: 0.25 },
    ],
  },
  {
    id: 'posicion', nombre: 'Cambiar y mantener la posición del cuerpo', pesoGeneral: 9.4, pesoEspecifico: 2.0,
    tareas: [
      { id: 'posicion-sentarse-cama', nombre: 'Cambiar de tumbado a sentado en la cama', peso: 0.10 },
      { id: 'posicion-sentado', nombre: 'Permanecer sentado', peso: 0.15 },
      { id: 'posicion-levantarse', nombre: 'Cambiar de sentado en una silla a estar de pie', peso: 0.10 },
      { id: 'posicion-de-pie', nombre: 'Permanecer de pie', peso: 0.15 },
      { id: 'posicion-sentarse', nombre: 'Cambiar de estar de pie a sentado en una silla', peso: 0.10 },
      { id: 'posicion-transfer-sentado', nombre: 'Transferir el propio cuerpo mientras se está sentado', peso: 0.10 },
      { id: 'posicion-transfer-acostado', nombre: 'Transferir el propio cuerpo mientras se está acostado', peso: 0.10 },
      { id: 'posicion-gravedad', nombre: 'Cambiar el centro de gravedad del cuerpo mientras se está acostado', peso: 0.20 },
    ],
  },
  {
    id: 'dentro', nombre: 'Desplazarse dentro del hogar', pesoGeneral: 12.3, pesoEspecifico: 12.1,
    tareas: [
      { id: 'dentro-vestirse', nombre: 'Realizar desplazamientos para vestirse', peso: 0.25 },
      { id: 'dentro-comer', nombre: 'Realizar desplazamientos para comer', peso: 0.15 },
      { id: 'dentro-lavarse', nombre: 'Realizar desplazamientos para lavarse', peso: 0.10 },
      { id: 'dentro-otros', nombre: 'Realizar desplazamientos no vinculados al autocuidado', peso: 0.25 },
      { id: 'dentro-no-comunes', nombre: 'Realizar desplazamientos entre estancias no comunes', peso: 0.10 },
      { id: 'dentro-comunes', nombre: 'Acceder a todas las estancias comunes del hogar', peso: 0.15 },
    ],
  },
  {
    id: 'fuera', nombre: 'Desplazarse fuera del hogar', pesoGeneral: 12.2, pesoEspecifico: 12.9,
    tareas: [
      { id: 'fuera-exterior', nombre: 'Acceder al exterior', peso: 0.25 },
      { id: 'fuera-edificio', nombre: 'Realizar desplazamientos alrededor del edificio', peso: 0.25 },
      { id: 'fuera-cerca-conocido', nombre: 'Realizar desplazamientos cercanos en entornos conocidos', peso: 0.20 },
      { id: 'fuera-cerca-desconocido', nombre: 'Realizar desplazamientos cercanos en entornos desconocidos', peso: 0.15 },
      { id: 'fuera-lejos-conocido', nombre: 'Realizar desplazamientos lejanos en entornos conocidos', peso: 0.10 },
      { id: 'fuera-lejos-desconocido', nombre: 'Realizar desplazamientos lejanos en entornos desconocidos', peso: 0.05 },
    ],
  },
  {
    id: 'domesticas', nombre: 'Realizar tareas domésticas', pesoGeneral: 8.0, pesoEspecifico: 8.0,
    tareas: [
      { id: 'domesticas-comidas', nombre: 'Preparar comidas', peso: 0.45 },
      { id: 'domesticas-compra', nombre: 'Hacer la compra', peso: 0.25 },
      { id: 'domesticas-limpiar', nombre: 'Limpiar y cuidar de la vivienda', peso: 0.20 },
      { id: 'domesticas-ropa', nombre: 'Lavar y cuidar la ropa', peso: 0.10 },
    ],
  },
  {
    // Solo en la escala específica (condición de salud que afecte a las funciones mentales)
    id: 'decisiones', nombre: 'Tomar decisiones', pesoGeneral: null, pesoEspecifico: 15.4,
    tareas: [
      { id: 'decisiones-alimentacion', nombre: 'Decidir sobre la alimentación cotidiana', peso: 0.20 },
      { id: 'decisiones-higiene', nombre: 'Dirigir los hábitos de higiene personal', peso: 0.10 },
      { id: 'decisiones-desplazamientos', nombre: 'Planificar los desplazamientos fuera del hogar', peso: 0.10 },
      { id: 'decisiones-conocidos', nombre: 'Decidir sus relaciones interpersonales con personas conocidas', peso: 0.20 },
      { id: 'decisiones-desconocidos', nombre: 'Decidir sus relaciones interpersonales con personas desconocidas', peso: 0.10 },
      { id: 'decisiones-dinero', nombre: 'Gestionar el dinero del presupuesto cotidiano', peso: 0.10 },
      { id: 'decisiones-tiempo', nombre: 'Disponer su tiempo y sus actividades cotidianas', peso: 0.15 },
      { id: 'decisiones-servicios', nombre: 'Resolver el uso de servicios a disposición del público', peso: 0.05 },
    ],
  },
];

// ─── Nivel mínimo de protección garantizado (RDL 17/2026, desde 01/07/2026) ──
// Financiación que el Estado transfiere a las CCAA por beneficiario y grado.
// ⚠️ Concepto DISTINTO de las prestaciones directas al beneficiario
// (PRESTACIONES_DEPENDENCIA_2025), que el RDL 17/2026 NO modifica.

export const NIVEL_MINIMO_PROTECCION_2026 = {
  vigenteDesde: '2026-07-01',
  baseNormativa: 'RDL 17/2026 (BOE-A-2026-13643), art. primero',
  cuantiaMensualPorGrado: {
    grado1: 90.0,
    grado2: 260.0,
    grado3: 660.0,
    grado3Plus: 4930.0,
  },
};

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
    gastosAsistencia33a65: 3000,  // Adicional SOLO si acredita ayuda de terceras personas o movilidad reducida
    gastosAsistencia65oMas: 3000, // Adicional: el grado ≥65% da derecho por sí solo, sin acreditar nada más
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
  nota: 'Los gastos de asistencia (3.000 €) se suman al mínimo por discapacidad ante cualquiera de tres supuestos ALTERNATIVOS (basta uno): acreditar necesidad de ayuda de terceras personas, acreditar movilidad reducida, o tener un grado de discapacidad igual o superior al 65%. Con grado del 33% al 64% la acreditación es condición necesaria; con grado ≥65% el propio grado da derecho al incremento. El mínimo NO reduce la base: forma parte de la base liquidable general y se grava a tipo cero (art. 63.1.2º LIRPF), aplicando la escala a la base completa y restando de la cuota la misma escala aplicada al mínimo. Por eso se valora a los tipos bajos de la escala y no al tipo marginal del contribuyente.',
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
