import {
  FISCAL_IRPF_META, TRAMOS_IRPF_2025, MINIMOS_IRPF_2025,
  FISCAL_IVA_META, TIPOS_IVA, EXENCIONES_ART20, RECARGO_EQUIVALENCIA, RECARGO_EQUIVALENCIA_TABACO,
  FISCAL_SMI_META, SMI_2026, SMI_2025,
  FISCAL_AUTONOMOS_META, TRAMOS_RETA_2025, TIPO_COTIZACION_RETA, TARIFA_PLANA_2025,
  FISCAL_INMUEBLES_META, TIPOS_ITP_CCAA_2025,
  FISCAL_INTERESES_META, INTERES_LEGAL_DINERO_2025, TIPOS_DEMORA_COMERCIAL, INTERES_DEMORA_TRIBUTARIO_2025,
  TRAMOS_GANANCIAS_PATRIMONIALES_2025,
  FISCAL_SUCESIONES_META, TARIFA_ESTATAL_IS, COEFICIENTES_IS, REDUCCIONES_PARENTESCO_IS, BONIFICACIONES_CCAA_IS,
  FISCAL_DONACIONES_META, TARIFA_ESTATAL_ID, COEFICIENTES_ID, REDUCCIONES_PARENTESCO_ID, BONIFICACIONES_CCAA_ID,
  FISCAL_PATRIMONIO_META, ESCALA_PATRIMONIO_ESTATAL, BONIFICACIONES_CCAA_PATRIMONIO, MINIMO_EXENTO_ESTATAL, EXENCION_VIVIENDA_HABITUAL, UMBRAL_OBLIGACION_DECLARAR, ITSGF_UMBRAL,
  FISCAL_AMORTIZACION_META, TABLA_AMORTIZACION_2026, MULTIPLICADORES_DEGRESIVO_2026,
  FISCAL_SOCIEDADES_META, TIPOS_IS_2025, TRAMOS_IS_MICROPYMES_2026, RETENCIONES_IS_2025, OBLIGACIONES_SL_2025,
  FISCAL_IPREM_META, IPREM_2026,
  FISCAL_PENSIONES_META, TABLA_EDAD_JUBILACION, COTIZACION_MINIMA, TRAMOS_PORCENTAJE_PENSION_2025, LIMITES_PENSION_2025, BASE_REGULADORA,
  FISCAL_MATERNIDAD_META, PERMISO_NACIMIENTO, AMPLIACIONES_PERMISO, PRESTACION_NACIMIENTO, DEDUCCION_MATERNIDAD_IRPF,
  PLUSVALIA_MUNICIPAL_META, COEFICIENTES_IIVTNU_2025,
  FISCAL_DEPENDENCIA_META, GRADOS_DEPENDENCIA, PRESTACIONES_DEPENDENCIA_2025, COTIZACION_CUIDADOR_NO_PROFESIONAL_2025, DEDUCCIONES_IRPF_DISCAPACIDAD_2025,
  FISCAL_CALENDARIO_META, CALENDARIO_FISCAL,
} from '@/data/fiscal';

/**
 * Endpoints JSON públicos de los datos fiscales de Delegum (capa de grounding para IA).
 * URL: https://delegum.com/api/datos/<slug>  (servido en delegum.com vía passthrough de /api)
 * Datos desde data/fiscal (fuente única).
 */
const BASE = 'https://delegum.com';

interface Dataset {
  meta: {
    nombre: string; descripcion: string; fuente: string;
    verificado: string; vigencia: string; urlOficial?: string; paginaHumana: string;
  };
  datos: unknown;
}

const DATASETS: Record<string, Dataset> = {
  'irpf-tramos-minimos': {
    meta: {
      nombre: 'Tramos y mínimos del IRPF',
      descripcion: 'Escala general por tramos, escala del ahorro y mínimos personales y familiares del IRPF en España.',
      fuente: FISCAL_IRPF_META.fuente, verificado: FISCAL_IRPF_META.verificado, vigencia: FISCAL_IRPF_META.vigencia,
      urlOficial: FISCAL_IRPF_META.urlOficial, paginaHumana: `${BASE}/datos-fiscales/irpf-tramos-minimos`,
    },
    datos: {
      escalaGeneral: TRAMOS_IRPF_2025,
      escalaAhorro: TRAMOS_GANANCIAS_PATRIMONIALES_2025,
      minimosPersonalesYFamiliares: MINIMOS_IRPF_2025,
    },
  },
  'iva-tipos': {
    meta: {
      nombre: 'Tipos de IVA en España',
      descripcion: 'Tipos general, reducido y superreducido del IVA, operaciones exentas y recargo de equivalencia.',
      fuente: FISCAL_IVA_META.fuente, verificado: FISCAL_IVA_META.verificado, vigencia: FISCAL_IVA_META.vigencia,
      urlOficial: FISCAL_IVA_META.urlOficial, paginaHumana: `${BASE}/datos-fiscales/iva-tipos`,
    },
    datos: {
      tipos: TIPOS_IVA, exencionesArt20: EXENCIONES_ART20,
      recargoEquivalencia: RECARGO_EQUIVALENCIA, recargoEquivalenciaTabaco: RECARGO_EQUIVALENCIA_TABACO,
    },
  },
  'smi-salario-minimo': {
    meta: {
      nombre: 'Salario Mínimo Interprofesional (SMI)',
      descripcion: 'Cuantías del SMI vigente en España (mensual, anual, diario y por hora) y año anterior.',
      fuente: FISCAL_SMI_META.fuente, verificado: FISCAL_SMI_META.verificado, vigencia: FISCAL_SMI_META.vigencia,
      urlOficial: FISCAL_SMI_META.urlOficial, paginaHumana: `${BASE}/datos-fiscales/smi-salario-minimo`,
    },
    datos: { smi2026: SMI_2026, smi2025: SMI_2025 },
  },
  'cuota-autonomos-reta': {
    meta: {
      nombre: 'Cuota de autónomos (RETA)',
      descripcion: 'Tabla de cotización por ingresos reales: tramos de rendimiento, base y cuota; tipo y tarifa plana.',
      fuente: FISCAL_AUTONOMOS_META.fuente, verificado: FISCAL_AUTONOMOS_META.verificado, vigencia: FISCAL_AUTONOMOS_META.vigencia,
      urlOficial: FISCAL_AUTONOMOS_META.urlOficial, paginaHumana: `${BASE}/datos-fiscales/cuota-autonomos-reta`,
    },
    datos: { tipoCotizacion: TIPO_COTIZACION_RETA, tramos: TRAMOS_RETA_2025, tarifaPlana: TARIFA_PLANA_2025 },
  },
  'itp-ccaa': {
    meta: {
      nombre: 'Tipos de ITP por comunidad autónoma',
      descripcion: 'Impuesto de Transmisiones Patrimoniales en vivienda usada: tipos generales y reducidos por CCAA.',
      fuente: FISCAL_INMUEBLES_META.fuente, verificado: FISCAL_INMUEBLES_META.verificado, vigencia: FISCAL_INMUEBLES_META.vigencia,
      urlOficial: FISCAL_INMUEBLES_META.urlOficialITP, paginaHumana: `${BASE}/datos-fiscales/itp-ccaa`,
    },
    datos: { tiposPorCCAA: TIPOS_ITP_CCAA_2025 },
  },
  'interes-legal-demora': {
    meta: {
      nombre: 'Interés legal del dinero y de demora',
      descripcion: 'Interés legal, interés de demora comercial por semestre (Ley 3/2004) e interés de demora tributario.',
      fuente: FISCAL_INTERESES_META.fuente, verificado: FISCAL_INTERESES_META.verificado, vigencia: FISCAL_INTERESES_META.vigencia,
      urlOficial: FISCAL_INTERESES_META.urlOficialLey3, paginaHumana: `${BASE}/datos-fiscales/interes-legal-demora`,
    },
    datos: {
      interesLegalDinero: INTERES_LEGAL_DINERO_2025,
      demoraComercialPorSemestre: TIPOS_DEMORA_COMERCIAL,
      interesDemoraTributario: INTERES_DEMORA_TRIBUTARIO_2025,
    },
  },
  'sucesiones-isd': {
    meta: {
      nombre: 'Impuesto de Sucesiones por comunidad autónoma',
      descripcion: 'Bonificaciones autonómicas del ISD por CCAA, grupos de parentesco, tarifa estatal por tramos, coeficientes multiplicadores y reducciones por parentesco.',
      fuente: FISCAL_SUCESIONES_META.fuente, verificado: FISCAL_SUCESIONES_META.verificado, vigencia: FISCAL_SUCESIONES_META.vigencia,
      urlOficial: FISCAL_SUCESIONES_META.urlOficial, paginaHumana: `${BASE}/datos-fiscales/sucesiones-isd`,
    },
    datos: {
      tarifaEstatal: TARIFA_ESTATAL_IS,
      coeficientesMultiplicadores: COEFICIENTES_IS,
      reduccionesPorParentesco: REDUCCIONES_PARENTESCO_IS,
      bonificacionesPorCCAA: BONIFICACIONES_CCAA_IS,
    },
  },
  'donaciones-isd': {
    meta: {
      nombre: 'Impuesto de Donaciones por comunidad autónoma',
      descripcion: 'Bonificaciones autonómicas del ISD en donaciones por CCAA, grupos de parentesco, tarifa estatal por tramos, coeficientes multiplicadores y reducciones por parentesco.',
      fuente: FISCAL_DONACIONES_META.fuente, verificado: FISCAL_DONACIONES_META.verificado, vigencia: FISCAL_DONACIONES_META.vigencia,
      urlOficial: FISCAL_DONACIONES_META.urlOficial, paginaHumana: `${BASE}/datos-fiscales/donaciones-isd`,
    },
    datos: {
      tarifaEstatal: TARIFA_ESTATAL_ID,
      coeficientesMultiplicadores: COEFICIENTES_ID,
      reduccionesPorParentesco: REDUCCIONES_PARENTESCO_ID,
      bonificacionesPorCCAA: BONIFICACIONES_CCAA_ID,
    },
  },
  'impuesto-patrimonio': {
    meta: {
      nombre: 'Impuesto sobre el Patrimonio por comunidad autónoma',
      descripcion: 'Mínimo exento, escala estatal por tramos, bonificaciones autonómicas y umbral del Impuesto de Solidaridad de las Grandes Fortunas (ITSGF).',
      fuente: FISCAL_PATRIMONIO_META.fuente, verificado: FISCAL_PATRIMONIO_META.verificado, vigencia: FISCAL_PATRIMONIO_META.vigencia,
      urlOficial: FISCAL_PATRIMONIO_META.urlOficial, paginaHumana: `${BASE}/datos-fiscales/impuesto-patrimonio`,
    },
    datos: {
      minimoExentoEstatal: MINIMO_EXENTO_ESTATAL,
      exencionViviendaHabitual: EXENCION_VIVIENDA_HABITUAL,
      umbralObligacionDeclarar: UMBRAL_OBLIGACION_DECLARAR,
      umbralITSGF: ITSGF_UMBRAL,
      escalaEstatal: ESCALA_PATRIMONIO_ESTATAL,
      bonificacionesPorCCAA: BONIFICACIONES_CCAA_PATRIMONIO,
    },
  },
  'amortizacion-inmovilizado': {
    meta: {
      nombre: 'Coeficientes de amortización del inmovilizado',
      descripcion: 'Coeficientes de amortización lineal máximos y períodos máximos por tipo de activo (art. 12.1.a LIS) y multiplicadores de la amortización degresiva por porcentaje constante.',
      fuente: FISCAL_AMORTIZACION_META.fuente, verificado: FISCAL_AMORTIZACION_META.verificado, vigencia: FISCAL_AMORTIZACION_META.vigencia,
      urlOficial: FISCAL_AMORTIZACION_META.urlOficial, paginaHumana: `${BASE}/datos-fiscales/amortizacion-inmovilizado`,
    },
    datos: {
      tablaAmortizacionLineal: TABLA_AMORTIZACION_2026,
      multiplicadoresDegresivo: MULTIPLICADORES_DEGRESIVO_2026,
    },
  },
  'impuesto-sociedades': {
    meta: {
      nombre: 'Tipos del Impuesto de Sociedades',
      descripcion: 'Tipos de gravamen del IS (general, nueva creación, escala de microempresas Ley 7/2024, cooperativas), retenciones y obligaciones periódicas.',
      fuente: FISCAL_SOCIEDADES_META.fuente, verificado: FISCAL_SOCIEDADES_META.verificado, vigencia: FISCAL_SOCIEDADES_META.vigencia,
      urlOficial: FISCAL_SOCIEDADES_META.urlOficial, paginaHumana: `${BASE}/datos-fiscales/impuesto-sociedades`,
    },
    datos: {
      tipos: TIPOS_IS_2025,
      escalaMicroempresas2026: TRAMOS_IS_MICROPYMES_2026,
      retenciones: RETENCIONES_IS_2025,
      obligaciones: OBLIGACIONES_SL_2025,
    },
  },
  'iprem': {
    meta: {
      nombre: 'IPREM 2026',
      descripcion: 'Cuantías del Indicador Público de Renta de Efectos Múltiples (diaria, mensual y anual con 12 y 14 pagas).',
      fuente: FISCAL_IPREM_META.fuente, verificado: FISCAL_IPREM_META.verificado, vigencia: FISCAL_IPREM_META.vigencia,
      urlOficial: FISCAL_IPREM_META.urlOficial, paginaHumana: `${BASE}/datos-fiscales/iprem`,
    },
    datos: { iprem2026: IPREM_2026 },
  },
  'pensiones-jubilacion': {
    meta: {
      nombre: 'Pensión de jubilación: edad, cotización y cuantías',
      descripcion: 'Edad de jubilación por año, años mínimos de cotización, porcentaje de pensión según años cotizados y límites de la pensión pública 2026.',
      fuente: FISCAL_PENSIONES_META.fuente, verificado: FISCAL_PENSIONES_META.verificado, vigencia: FISCAL_PENSIONES_META.vigencia,
      urlOficial: FISCAL_PENSIONES_META.urlOficial, paginaHumana: `${BASE}/datos-fiscales/pensiones-jubilacion`,
    },
    datos: {
      edadJubilacion: TABLA_EDAD_JUBILACION,
      cotizacionMinima: COTIZACION_MINIMA,
      porcentajePorAniosCotizados: TRAMOS_PORCENTAJE_PENSION_2025,
      limitesPension2026: LIMITES_PENSION_2025,
      baseReguladora: BASE_REGULADORA,
    },
  },
  'permiso-prestacion-nacimiento': {
    meta: {
      nombre: 'Permiso y prestación por nacimiento',
      descripcion: 'Semanas del permiso por nacimiento (RDL 9/2025) en familias biparentales y monoparentales, ampliaciones, prestación de la SS y deducción por maternidad en IRPF.',
      fuente: FISCAL_MATERNIDAD_META.fuente, verificado: FISCAL_MATERNIDAD_META.verificado, vigencia: FISCAL_MATERNIDAD_META.vigencia,
      urlOficial: FISCAL_MATERNIDAD_META.urlOficial, paginaHumana: `${BASE}/datos-fiscales/permiso-prestacion-nacimiento`,
    },
    datos: {
      permisos: PERMISO_NACIMIENTO,
      ampliaciones: AMPLIACIONES_PERMISO,
      prestacion: PRESTACION_NACIMIENTO,
      deduccionMaternidadIRPF: DEDUCCION_MATERNIDAD_IRPF,
    },
  },
  'plusvalia-municipal': {
    meta: {
      nombre: 'Plusvalía municipal (IIVTNU)',
      descripcion: 'Coeficientes máximos por años de tenencia, tipo máximo legal y métodos de cálculo objetivo y real de la plusvalía municipal (RDL 26/2021).',
      fuente: PLUSVALIA_MUNICIPAL_META.baseNormativa, verificado: PLUSVALIA_MUNICIPAL_META.verificado, vigencia: PLUSVALIA_MUNICIPAL_META.vigencia,
      urlOficial: PLUSVALIA_MUNICIPAL_META.urlReferencia, paginaHumana: `${BASE}/datos-fiscales/plusvalia-municipal`,
    },
    datos: {
      tipoMaximoLegal: PLUSVALIA_MUNICIPAL_META.tipoMaximoLegal,
      quienPaga: PLUSVALIA_MUNICIPAL_META.quien,
      coeficientesPorAnios: COEFICIENTES_IIVTNU_2025,
    },
  },
  'prestaciones-dependencia': {
    meta: {
      nombre: 'Prestaciones por dependencia (SAAD)',
      descripcion: 'Grados de dependencia, cuantías de prestaciones económicas SAAD por grado, cotización del cuidador no profesional y deducciones por discapacidad en IRPF.',
      fuente: FISCAL_DEPENDENCIA_META.fuente, verificado: FISCAL_DEPENDENCIA_META.verificado, vigencia: FISCAL_DEPENDENCIA_META.vigencia,
      urlOficial: FISCAL_DEPENDENCIA_META.urlOficial, paginaHumana: `${BASE}/datos-fiscales/prestaciones-dependencia`,
    },
    datos: {
      grados: GRADOS_DEPENDENCIA,
      prestacionesEconomicas: PRESTACIONES_DEPENDENCIA_2025,
      cotizacionCuidador: COTIZACION_CUIDADOR_NO_PROFESIONAL_2025,
      deduccionesIRPFDiscapacidad: DEDUCCIONES_IRPF_DISCAPACIDAD_2025,
    },
  },
  'calendario-fiscal': {
    meta: {
      nombre: 'Calendario fiscal de España',
      descripcion: 'Plazos recurrentes de presentación de los modelos tributarios (trimestrales, resúmenes anuales, Renta e Impuesto de Sociedades), con el perfil al que aplican.',
      fuente: FISCAL_CALENDARIO_META.fuente, verificado: FISCAL_CALENDARIO_META.verificado, vigencia: FISCAL_CALENDARIO_META.vigencia,
      urlOficial: FISCAL_CALENDARIO_META.urlOficial, paginaHumana: `${BASE}/datos-fiscales/calendario-fiscal`,
    },
    datos: { modelos: CALENDARIO_FISCAL },
  },
};

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const dataset = DATASETS[slug];

  if (!dataset) {
    return Response.json(
      { error: 'Dataset no encontrado', disponibles: Object.keys(DATASETS) },
      { status: 404 },
    );
  }

  return Response.json(
    {
      aviso: 'Datos orientativos de Delegum (meskeIA). No constituyen asesoramiento profesional. Verifica en la fuente oficial antes de tomar decisiones.',
      ...dataset,
    },
    { headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=86400', 'Access-Control-Allow-Origin': '*' } },
  );
}
