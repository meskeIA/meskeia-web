/**
 * Datos fiscales: Impuesto de Sociedades (IS)
 *
 * ⚠️ HERRAMIENTA DE ORIENTACIÓN — No constituye asesoramiento fiscal.
 * Datos verificados a la fecha indicada. Pueden haber cambiado en 2026.
 * Verifica siempre en la fuente oficial antes de tomar decisiones.
 *
 * Fuente: Ley 27/2014 del Impuesto sobre Sociedades + LPGE 2025
 * Verificado: 2025-01-15
 * URL oficial: https://sede.agenciatributaria.gob.es/Sede/impuesto-sociedades.html
 */

export const FISCAL_SOCIEDADES_META = {
  fuente: 'Ley 27/2014, de 27 de noviembre, del Impuesto sobre Sociedades',
  verificado: '2025-01-15',
  vigencia: '2025',
  urlOficial: 'https://sede.agenciatributaria.gob.es/Sede/impuesto-sociedades.html',
  nota: 'Tipos generales IS 2025. Las pymes y sociedades de nueva creación pueden aplicar tipos reducidos. Verificar en la Agencia Tributaria para el cálculo exacto.',
};

// ─── Tipos IS 2025 ────────────────────────────────────────────────────────────

export const TIPOS_IS_2025 = {
  general:              25,    // % — Tipo general
  nuevaCreacion:        15,    // % — Primeros 2 periodos con base imponible positiva
  micropymes:           23,    // % — Entidades con cifra de negocios < 1M € (a partir 2023)
  entidadesExentas:     10,    // % — Entidades sin ánimo de lucro (parcialmente exentas)
  cooperativas:         20,    // % — Resultados cooperativos
  socInversionInmob:    0,     // % — SOCIMI (tributación a nivel del socio)
};

// ─── Retenciones sobre dividendos y beneficios ───────────────────────────────

export const RETENCIONES_IS_2025 = {
  dividendos:           19,    // % retención IRPF sobre dividendos distribuidos a socios personas físicas
  intereses:            19,    // % retención sobre intereses de préstamos a socios
};

// ─── Cotización autónomo societario (Administrador) ──────────────────────────
// Base mínima para administradores con participación >= 25% o >= 33% sin control

export const AUTONOMO_SOCIETARIO_2025 = {
  baseMinimaMensual:    1634.88, // € — Base mínima obligatoria para adm. con control
  cuotaMinimaMensual:   511.51,  // € — Cuota mínima mensual (31,3% de la base)
  nota: 'Los administradores con participación ≥25% que controlan la sociedad cotizan por base mínima obligatoria, no por ingresos reales. Verificar en SS.',
};

// ─── Gastos deducibles relevantes en SL ──────────────────────────────────────

export const GASTOS_DEDUCIBLES_SL = {
  sueldoAdministrador: {
    deducible: true,
    condicion: 'Solo si el cargo es retribuido en estatutos y se declara en IRPF del administrador',
  },
  dividendos: {
    deducible: false,
    condicion: 'Los dividendos NO son gasto deducible; tributan en IS y luego en IRPF del socio',
  },
  retribucionEspecies: {
    deducible: true,
    condicion: 'Con valoración a mercado y declaración en IRPF del perceptor',
  },
};

// ─── Obligaciones periódicas SL ───────────────────────────────────────────────

export const OBLIGACIONES_SL_2025 = [
  { modelo: '202', nombre: 'Pago fraccionado IS', periodicidad: 'Trimestral (abril, oct, dic)', nota: 'Solo si cuota IS año anterior > 0' },
  { modelo: '200', nombre: 'Declaración IS anual', periodicidad: 'Jul (6 meses desde cierre ejercicio)', nota: 'Ejercicio ordinario enero-diciembre' },
  { modelo: '111', nombre: 'Retenciones trabajo/actividades', periodicidad: 'Trimestral', nota: 'Si hay empleados o autónomos con retención' },
  { modelo: '303', nombre: 'IVA trimestral', periodicidad: 'Trimestral', nota: 'Igual que autónomo' },
  { modelo: '347', nombre: 'Operaciones > 3.005,06 €', periodicidad: 'Anual (febrero)', nota: 'Igual que autónomo' },
];
