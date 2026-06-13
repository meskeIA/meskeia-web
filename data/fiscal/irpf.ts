/**
 * Datos fiscales: IRPF + Seguridad Social cuenta ajena
 *
 * ⚠️ HERRAMIENTA DE ORIENTACIÓN — No constituye asesoramiento fiscal.
 * Datos verificados a la fecha indicada. Pueden haber cambiado en 2026.
 * Verifica siempre en la fuente oficial antes de tomar decisiones.
 *
 * Fuente: Ley 35/2006 del IRPF + LPGE 2025 + LGSS
 * Verificado: 2025-01-15
 * URL oficial IRPF: https://sede.agenciatributaria.gob.es
 * URL oficial SS: https://www.seg-social.es
 */

export const FISCAL_IRPF_META = {
  fuente: 'Ley 35/2006 del IRPF + Ley de Presupuestos Generales del Estado 2025',
  verificado: '2025-01-15',
  vigencia: '2025',
  urlOficial: 'https://sede.agenciatributaria.gob.es/Sede/procedimientoini/GI01.shtml',
  nota: 'Tramos estatales + tipo autonómico medio. Cada CCAA puede tener variaciones. Verificar en la Agencia Tributaria para cálculo exacto.',
};

// Tramos IRPF 2025 (estatal + autonómico medio ponderado)
export interface TramoIRPF {
  hasta: number;
  tipo: number; // porcentaje
}

export const TRAMOS_IRPF_2025: TramoIRPF[] = [
  { hasta: 12450,    tipo: 19 },
  { hasta: 20200,    tipo: 24 },
  { hasta: 35200,    tipo: 30 },
  { hasta: 60000,    tipo: 37 },
  { hasta: 300000,   tipo: 45 },
  { hasta: Infinity, tipo: 47 },
];

// Mínimos personales y familiares IRPF 2025
export const MINIMOS_IRPF_2025 = {
  personal:          5550,
  personal_65:       6700,
  personal_75:       8100,
  hijo_1:            2400,
  hijo_2:            2700,
  hijo_3:            4000,
  hijo_4_mas:        4500,
  hijo_menor_3:      2800,  // adicional por hijo < 3 años
  ascendiente_65:    1150,
  ascendiente_75:    2550,
  discapacidad_33_65: 3000,
  discapacidad_65_mas: 9000,
};

// ─── Seguridad Social cuenta ajena ──────────────────────────────────────────

export const FISCAL_SS_CUENTA_AJENA_META = {
  fuente: 'Orden PJC/51/2025 de cotización a la Seguridad Social',
  verificado: '2025-01-15',
  vigencia: '2025',
  urlOficial: 'https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/CotizacionRecaudacionTrabajadores',
  nota: 'Tipos trabajador (cuota a cargo del empleado). El empleador paga tipos adicionales no incluidos aquí.',
};

// Tipos de cotización 2025 (porción trabajador)
export const COTIZACIONES_SS_2025 = {
  contingenciasComunes:    4.70,
  desempleo:               1.55,
  formacionProfesional:    0.10,
  mef:                     0.12, // Mecanismo Equidad Intergeneracional
};

// Bases de cotización 2025 (mensuales) — Orden PJC/178/2025, vigentes desde el 01-ene-2025
export const BASES_SS_2025 = {
  minima: 1381.20,
  maxima: 4909.50,
};

// Bases de cotización 2026 (mensuales) — Orden PJC/297/2026, vigentes desde el 01-ene-2026
// Mínima: grupos 4-7 (SMI 2026 + 1/6). Máxima: tope único Régimen General.
export const BASES_SS_2026 = {
  minima: 1424.40,
  maxima: 5101.20,
};

// ─── Rendimientos del trabajo: gastos deducibles y reducción 2025 ─────────────

/**
 * Gastos deducibles generales de los rendimientos del trabajo.
 * Ley 35/2006 IRPF art. 19.2.f
 */
export const GASTOS_DEDUCIBLES_TRABAJO_2025 = {
  importeGeneral: 2000,  // €/año (todos los contribuyentes con rendimientos del trabajo)
};

/**
 * Reducción por rendimientos netos del trabajo (RNT) 2025
 * Se aplica sobre el Rendimiento Neto del Trabajo (ingresos - gastos deducibles).
 * Ley 35/2006 IRPF art. 20 (según LPGE 2025)
 *
 * - RNT ≤ 13.115 €: reducción de 6.498 €
 * - 13.115 < RNT < 16.825 €: 6.498 - 1,14 × (RNT - 13.115)
 * - RNT ≥ 16.825 €: reducción de 2.364 €
 */
export const REDUCCION_RENDIMIENTOS_TRABAJO_2025 = {
  limite1:               13115,   // RNT hasta aquí: reducción máxima
  reduccion1:             6498,   // €/año de reducción
  limite2:               16825,   // RNT a partir de aquí: reducción mínima
  reduccion2:             2364,   // €/año de reducción
  factorInterpolacion:    1.14,   // Factor interpolación entre límite1 y límite2
};

// ─── Deducción por rendimientos del trabajo para rentas bajas (art. 80 bis) ──

/**
 * Deducción en cuota por obtención de rendimientos del trabajo (art. 80 bis LIRPF)
 * Introducida por RDL 4/2024, aplicable desde ejercicio 2025.
 *
 * Requisitos:
 * - Rendimientos netos del trabajo ≤ limiteMaximo (18.276 €)
 * - Otras rentas (no del trabajo) ≤ limiteOtrasRentas (6.500 €)
 *
 * Cuantía:
 * - RNT ≤ limiteCompleto (14.852 €): deducción completa (340 €)
 * - limiteCompleto < RNT ≤ limiteMaximo: deducción proporcional decreciente
 * - RNT > limiteMaximo: sin deducción
 *
 * Fuente: art. 80 bis Ley 35/2006 del IRPF
 * Verificado: 2026-04-01
 */
export const DEDUCCION_RENTAS_BAJAS_2025 = {
  deduccionMaxima:     340,     // € anuales
  limiteCompleto:    14852,     // RNT hasta aquí: deducción máxima
  limiteMaximo:      18276,     // RNT por encima: sin deducción
  limiteOtrasRentas:  6500,     // Máximo de rentas no laborales permitido
};

/**
 * Calcula la deducción por rentas bajas del trabajo (art. 80 bis LIRPF).
 * @param rnt Rendimiento Neto del Trabajo (después de gastos deducibles art.19, antes de reducción art.20)
 * @param otrasRentas Suma de rentas no laborales (capital, imputadas, etc.). 0 si no se conocen.
 * @returns Importe de la deducción (0 a 340 €)
 */
export function calcularDeduccionRentasBajas(rnt: number, otrasRentas: number = 0): number {
  const d = DEDUCCION_RENTAS_BAJAS_2025;
  if (otrasRentas > d.limiteOtrasRentas) return 0;
  if (rnt <= 0) return 0;
  if (rnt <= d.limiteCompleto) return d.deduccionMaxima;
  if (rnt > d.limiteMaximo) return 0;
  // Interpolación lineal entre limiteCompleto y limiteMaximo
  return d.deduccionMaxima * (1 - (rnt - d.limiteCompleto) / (d.limiteMaximo - d.limiteCompleto));
}

// ─── Helpers: estimación tipo marginal ────────────────────────────────────────

/**
 * Estima el tipo marginal IRPF a partir de los rendimientos brutos del trabajo.
 * Aplica: cotizaciones SS trabajador → gastos deducibles art. 19 → reducción art. 20 → tramos.
 * Orientativo: no incluye mínimo personal ni otras circunstancias personales/familiares.
 */
export function tipoMarginalDesdeRendimientosBrutos(brutos: number): number {
  const totalSS =
    COTIZACIONES_SS_2025.contingenciasComunes +
    COTIZACIONES_SS_2025.desempleo +
    COTIZACIONES_SS_2025.formacionProfesional +
    COTIZACIONES_SS_2025.mef;
  const gastosSS = brutos * (totalSS / 100);
  const rnt = Math.max(0, brutos - gastosSS - GASTOS_DEDUCIBLES_TRABAJO_2025.importeGeneral);
  return tipoMarginalDesdeRNT(rnt);
}

/**
 * Estima el tipo marginal IRPF a partir del rendimiento neto del trabajo (RNT).
 * El RNT es el ingreso ya descontadas cotizaciones SS y gastos deducibles art. 19,
 * pero antes de la reducción art. 20.
 * Aplica: reducción art. 20 → tramos.
 * Orientativo: no incluye mínimo personal ni otras circunstancias.
 */
export function tipoMarginalDesdeRNT(rnt: number): number {
  const rd = REDUCCION_RENDIMIENTOS_TRABAJO_2025;
  let reduccion: number;
  if (rnt <= rd.limite1) {
    reduccion = rd.reduccion1;
  } else if (rnt < rd.limite2) {
    reduccion = rd.reduccion1 - rd.factorInterpolacion * (rnt - rd.limite1);
  } else {
    reduccion = rd.reduccion2;
  }
  const baseImponible = Math.max(0, rnt - reduccion);
  for (const tramo of TRAMOS_IRPF_2025) {
    if (baseImponible <= tramo.hasta) return tramo.tipo;
  }
  return 47;
}

// ─── Obligación de declarar IRPF 2025 (ejercicio fiscal 2025, campaña 2026) ──

/**
 * Umbrales de obligación de declarar la Renta 2025
 * Art. 96 Ley 35/2006 del IRPF + modificaciones LPGE 2025
 *
 * Fuente: https://sede.agenciatributaria.gob.es
 * Verificado: 2026-04-01
 */
export const OBLIGACION_DECLARAR_2025 = {
  // Rendimientos del trabajo
  trabajo: {
    unPagador: 22000,          // 1 pagador o varios si 2º+3º ≤ 1.500 €
    variosPagadores: 15876,    // 2+ pagadores si 2º+3º > 1.500 €
    limiteSegundoPagador: 1500, // Umbral para considerar "varios pagadores"
  },
  // Rendimientos del capital mobiliario y ganancias patrimoniales
  capitalMobiliario: {
    limite: 1600,              // Sujetos a retención
  },
  // Rentas inmobiliarias imputadas, letras del tesoro, subvenciones vivienda
  rentasImputadas: {
    limite: 1000,
  },
  // Rendimientos del trabajo no sujetos a retención (pensiones extranjeras, etc.)
  trabajoSinRetencion: {
    limite: 15876,
  },
  // Obligación de declarar SIEMPRE (independientemente del importe)
  siempreObligados: [
    'Deducciones por inversión en vivienda habitual (régimen transitorio)',
    'Deducciones por aportaciones a patrimonio protegido de personas con discapacidad',
    'Deducciones por doble imposición internacional',
    'Reducciones en la base imponible por aportaciones a planes de pensiones',
    'Solicitar devolución derivada de la normativa del tributo',
  ],
  // Exenciones destacadas
  exenciones: {
    imv: true,                 // Perceptores de IMV: obligados a declarar siempre
    desempleo: false,          // Desempleo tributa como rendimiento del trabajo (no exento)
    indemnizacionDespido: true, // Exenta hasta el límite legal (art. 7.e LIRPF)
  },
};
