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

// ─── Tipo IS 2026 de las entidades de reducida dimensión (DT 44ª LIS) ─────────
// Entidades del art. 101 LIS (cifra de negocios < 10 M €) que no son microempresas.
// Cita literal, DT 44ª.2.b) de la Ley 27/2014 consolidada (BOE-A-2014-12328), añadida por la
// DF 8.8 de la Ley 7/2024, consultada el 20/10/2026: «Las entidades que cumplan las previsiones
// previstas en el artículo 101 de esta ley tributarán al 23 %, salvo que deban tributar a un
// tipo diferente del general.» Calendario: 2025 → 24 · 2026 → 23 · 2027 → 22 · 2028 → 21.

export const TIPO_IS_REDUCIDA_DIMENSION_2026 = 23; // %

// ─── Retenciones sobre dividendos y beneficios ───────────────────────────────

export const RETENCIONES_IS_2025 = {
  dividendos:           19,    // % retención IRPF sobre dividendos distribuidos a socios personas físicas
  intereses:            19,    // % retención sobre intereses de préstamos a socios
};

// ─── Cotización autónomo societario (Administrador) ──────────────────────────
// Base mínima para quien tiene el control efectivo de la sociedad. El art. 305.2.b LGSS lo
// presume con una participación IGUAL O SUPERIOR a la cuarta parte si se ejercen funciones de
// dirección y gerencia, a la tercera parte sin ellas, y siempre con la mitad (hallazgo 2144).
//
// Verificado el 20/10/2026 (cabo C0339). Hasta entonces la base era 1.634,88 € (cuota 514,99 €),
// sin fuente: entró el 15/03/2026, antes de publicarse la orden de cotización de 2026.
//   · Art. 308.1.a), regla 4.ª LGSS (BOE-A-2015-11724): «no podrán elegir una base de cotización
//     mensual inferior a aquella que determine la correspondiente Ley de Presupuestos Generales
//     del Estado como base de cotización mínima para contingencias comunes para los trabajadores
//     incluidos en el Régimen General de la Seguridad Social del grupo de cotización 7».
//   · Orden PJC/297/2026 (BOE-A-2026-7296), art. 3: grupo 7, «Auxiliares Administrativos.
//     1.424,40» €/mes. Tipo: 28,30 contingencias comunes + 1,30 profesionales + 0,90 MEI (art. 18.2)
//     + 0,90 cese de actividad + 0,10 formación profesional (art. 37.5 y 6) = 31,50 %.
//   · Art. 18.4 de la orden: en 2026 se puede mantener la base provisional de 2025 (1.000 €), pero
//     en la regularización «la base de cotización definitiva no podrá ser inferior» a la del grupo 7.

export const AUTONOMO_SOCIETARIO_2025 = {
  baseMinimaMensual:    1424.40, // € — Base mínima del grupo 7 del Régimen General (Orden PJC/297/2026)
  cuotaMinimaMensual:   448.69,  // € — 1.424,40 × 31,50 %
  nota: 'Quien tiene el control efectivo de la sociedad (art. 305.2.b LGSS: participación igual o superior al 25 % con funciones de dirección y gerencia, al 33 % sin ellas, o al 50 % en todo caso) no puede cotizar por una base inferior a la mínima del grupo 7 del Régimen General (1.424,40 € en 2026, Orden PJC/297/2026), sean cuales sean sus ingresos. Tipo 31,50 %. En 2026 puede mantener la base provisional de 2025 (1.000 €) y regularizar la diferencia después. Verificar en la Seguridad Social.',
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
