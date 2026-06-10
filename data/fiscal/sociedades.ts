/**
 * Datos fiscales: Impuesto de Sociedades (IS)
 *
 * ⚠️ HERRAMIENTA DE ORIENTACIÓN — No constituye asesoramiento fiscal.
 * Datos verificados a la fecha indicada. Pueden haber cambiado.
 * Verifica siempre en la fuente oficial antes de tomar decisiones.
 *
 * Fuente: Ley 27/2014 del Impuesto sobre Sociedades, modificada por la
 * Ley 7/2024, de 20 de diciembre, que introduce una escala progresiva
 * para microempresas (cifra de negocio < 1M €) en sustitución del
 * antiguo tipo plano del 23%.
 * Verificado: 2026-06-10
 * URL oficial: https://sede.agenciatributaria.gob.es/Sede/impuesto-sociedades.html
 */

export const FISCAL_SOCIEDADES_META = {
  fuente: 'Ley 27/2014, de 27 de noviembre, del Impuesto sobre Sociedades (modificada por Ley 7/2024, de 20 de diciembre)',
  verificado: '2026-06-10',
  vigencia: '2026',
  urlOficial: 'https://sede.agenciatributaria.gob.es/Sede/impuesto-sociedades.html',
  nota: 'Tipo general 25% sin cambios. Las microempresas (cifra de negocio < 1M €) tributan desde 2025 por la escala progresiva de la Ley 7/2024 — ver TRAMOS_IS_MICROPYMES_2026 y calcularCuotaISMicropyme(). Las sociedades de nueva creación mantienen el 15% en los dos primeros periodos con base imponible positiva. Verificar en la Agencia Tributaria para el cálculo exacto.',
};

// ─── Tipos IS 2025/2026 ────────────────────────────────────────────────────────

export const TIPOS_IS_2025 = {
  general:              25,    // % — Tipo general, sin cambios
  nuevaCreacion:        15,    // % — Primeros 2 periodos con base imponible positiva, sin cambios
  micropymes:           23,    // % — ⚠️ OBSOLETO: tipo plano vigente solo hasta el ejercicio 2024. Desde 2025 se aplica una escala progresiva (Ley 7/2024) — usar TRAMOS_IS_MICROPYMES_2026 / calcularCuotaISMicropyme(). Se conserva como referencia histórica.
  entidadesExentas:     10,    // % — Entidades sin ánimo de lucro (parcialmente exentas)
  cooperativas:         20,    // % — Resultados cooperativos
  socInversionInmob:    0,     // % — SOCIMI (tributación a nivel del socio)
};

// ─── Escala progresiva IS micropymes (Ley 7/2024, DT 44ª LIS) ─────────────────
// Aplica a entidades con cifra de negocio < 1M € en el periodo impositivo
// anterior. Calendario de implantación gradual:
//   2025 → 21% (hasta 50.000 €) / 22% (resto)
//   2026 → 19% (hasta 50.000 €) / 21% (resto)  ← escala vigente recogida abajo
//   2027 → 17% (hasta 50.000 €) / 20% (resto)

export const TRAMOS_IS_MICROPYMES_2026: { hasta: number; tipo: number }[] = [
  { hasta: 50000,    tipo: 19 }, // % sobre los primeros 50.000 € de base imponible
  { hasta: Infinity, tipo: 21 }, // % sobre el resto
];

/**
 * Calcula la cuota del Impuesto de Sociedades de una microempresa aplicando
 * la escala progresiva 2026 de la Ley 7/2024 (por tramos de base imponible).
 */
export function calcularCuotaISMicropyme(baseImponible: number): number {
  if (baseImponible <= 0) return 0;
  let cuota = 0;
  let baseAnterior = 0;
  for (const tramo of TRAMOS_IS_MICROPYMES_2026) {
    if (baseImponible <= baseAnterior) break;
    const baseEnTramo = Math.min(baseImponible, tramo.hasta) - baseAnterior;
    cuota += baseEnTramo * (tramo.tipo / 100);
    baseAnterior = tramo.hasta;
  }
  return cuota;
}

// ─── Retenciones sobre dividendos y beneficios ───────────────────────────────

export const RETENCIONES_IS_2025 = {
  dividendos:           19,    // % retención IRPF sobre dividendos distribuidos a socios personas físicas
  intereses:            19,    // % retención sobre intereses de préstamos a socios
};

// ─── Cotización autónomo societario (Administrador) ──────────────────────────
// Base mínima para administradores con participación >= 25% o >= 33% sin control

export const AUTONOMO_SOCIETARIO_2025 = {
  baseMinimaMensual:    1634.88, // € — Base mínima obligatoria para adm. con control
  cuotaMinimaMensual:   514.99,  // € — Cuota mínima mensual (31,5% de la base desde 2026 por subida MEI)
  nota: 'Los administradores con participación ≥25% que controlan la sociedad cotizan por base mínima obligatoria, no por ingresos reales. Tipo 31,5% (RDL 16/2025). Verificar en SS.',
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
