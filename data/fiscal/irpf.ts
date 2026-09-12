/**
 * Datos fiscales: IRPF + Seguridad Social cuenta ajena
 *
 * ⚠️ HERRAMIENTA DE ORIENTACIÓN — No constituye asesoramiento fiscal.
 * Datos verificados a la fecha indicada. Pueden haber cambiado en 2026.
 * Verifica siempre en la fuente oficial antes de tomar decisiones.
 *
 * Fuente: Ley 35/2006 del IRPF (texto consolidado) + LGSS
 * Verificado: 2026-08-12
 * URL oficial IRPF: https://sede.agenciatributaria.gob.es
 * URL oficial SS: https://www.seg-social.es
 *
 * ⚠️ 2026-08-12: verificados uno a uno contra el texto consolidado del BOE
 *    (actualizado a 29/04/2026) los artículos que sostienen este módulo. Siguen
 *    vigentes en 2026 porque ninguno se ha tocado desde entonces:
 *      · art. 63 (escala general) — última modificación: Ley 11/2020, efectos 1/1/2021
 *      · art. 57 (mínimo del contribuyente) — Ley 26/2014
 *      · art. 58 (descendientes) y 59 (ascendientes) — Ley 26/2014
 *      · art. 60 (discapacidad) — Ley 26/2014
 *      · art. 66 (base del ahorro, en inmuebles.ts) — Ley 7/2024, efectos 1/1/2025
 *    Las constantes conservan el sufijo _2025 por compatibilidad con las apps que
 *    ya las importan; el sufijo es histórico, no una fecha de caducidad.
 */

export const FISCAL_IRPF_META = {
  fuente: 'Ley 35/2006 del IRPF (texto consolidado, arts. 57 a 66)',
  // 2026-09-09: reducción del art. 20 corregida contra el Manual práctico de Renta 2025
  // de la AEAT. La revisión del 2026-08-12 la dio por buena y llevaba la redacción
  // anterior al RDL 4/2024, con una reducción residual de 2.364 € que no existe.
  verificado: '2026-09-09',
  vigencia: '2026',
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

// La escala de la BASE DEL AHORRO (rendimientos del capital mobiliario y
// ganancias patrimoniales por transmisión) está centralizada en
// data/fiscal/inmuebles.ts como TRAMOS_GANANCIAS_PATRIMONIALES_2025
// (19/21/23/27/30 % en 2025). Importar desde allí; no duplicar aquí.

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

/**
 * Reducción por tributación conjunta (art. 84.2, reglas 3ª y 4ª LIRPF). Solo aplica si la
 * unidad familiar opta por declarar conjunta (un cónyuge sin ingresos, o unidad
 * monoparental); con dos ingresos separados no hay tributación conjunta y no procede.
 *
 * ⚠️ **NO es un mínimo, y no se calcula como un mínimo.** La ley dice «la base imponible se
 * reducirá en 3.400 euros anuales»: va contra la base y por tanto se valora al tipo
 * MARGINAL del contribuyente. Los mínimos del art. 57 a 61, en cambio, NO reducen la renta
 * —se gravan a tipo cero por la vía del art. 63.1.2º— y se valoran a los tipos BAJOS de la
 * escala. Mezclarlas en un mismo sumando da un resultado incorrecto para las dos.
 *
 * Hasta el 12/09/2026 el comentario de aquí decía «igual que los mínimos personales», que
 * era exactamente la confusión que el art. 63.1.2º deshace. Ver `calcularCuotaIntegraGeneral`.
 *
 * Fuente: AEAT, Manual práctico Renta 2025, «Reducción por tributación conjunta»
 * (arts. 82.1, 82.2 y 84.2.3º y 4º LIRPF). Verificado en sesión el 12/09/2026.
 */
export const REDUCCION_TRIBUTACION_CONJUNTA_2025 = {
  biparental:   3400, // matrimonio con un solo perceptor de ingresos
  monoparental: 2150, // un progenitor + hijos (art. 82.1.2ª LIRPF)
};

// ─── Cuota íntegra general: la escala y el art. 63.1.2º ──────────────────────

/** Un tramo tal y como se aplicó a una base concreta. Lo consumen los desgloses en pantalla. */
export interface TramoAplicadoIRPF {
  /** Límite inferior del tramo (€). */
  desde: number;
  /** Límite superior del tramo (€), o `null` en el tramo abierto. */
  hasta: number | null;
  /** Tipo del tramo (%). */
  tipo: number;
  /** Parte de la base que cayó en este tramo (€). */
  base: number;
  /** Cuota aportada por este tramo (€). */
  cuota: number;
}

/**
 * Aplica una escala progresiva a una base y devuelve además el desglose tramo a tramo.
 *
 * Solo modela la escala. Quien calcule una cuota íntegra real debe usar
 * `calcularCuotaIntegraGeneral`, que es la que aplica el art. 63.1.2º.
 */
export function desglosarEscalaGeneral(
  base: number,
  escala: TramoIRPF[] = TRAMOS_IRPF_2025,
): { cuota: number; tramos: TramoAplicadoIRPF[] } {
  const tramos: TramoAplicadoIRPF[] = [];
  if (!Number.isFinite(base) || base <= 0) return { cuota: 0, tramos };

  let cuota = 0;
  let anterior = 0;
  for (const tramo of escala) {
    if (base <= anterior) break;
    const baseEnTramo = Math.min(base, tramo.hasta) - anterior;
    const cuotaTramo = baseEnTramo * (tramo.tipo / 100);
    cuota += cuotaTramo;
    tramos.push({
      desde: anterior,
      hasta: tramo.hasta === Infinity ? null : tramo.hasta,
      tipo: tramo.tipo,
      base: baseEnTramo,
      cuota: cuotaTramo,
    });
    anterior = tramo.hasta;
  }
  return { cuota, tramos };
}

/** Cuota que resulta de aplicar la escala progresiva a una base. Sin desglose. */
export function cuotaEscalaGeneral(
  base: number,
  escala: TramoIRPF[] = TRAMOS_IRPF_2025,
): number {
  return desglosarEscalaGeneral(base, escala).cuota;
}

/**
 * **Fuente ÚNICA de la cuota íntegra de la base liquidable general (art. 63.1.2º LIRPF).**
 *
 * El mínimo personal y familiar **NO reduce la renta**: forma parte de la base liquidable
 * general y se grava a TIPO CERO. La ley lo consigue aplicando la escala DOS VECES —a la
 * base liquidable general completa y a la parte que corresponde al mínimo— y restando la
 * segunda cuota de la primera. La AEAT lo enuncia así en el manual de ayuda de Renta 2025:
 *
 *   1. «A la base liquidable general (sin descontar el importe del mínimo personal y
 *      familiar) se le aplicarán los tipos correspondientes a la escala general del impuesto.»
 *   2. «Se aplicará la misma escala a la parte de base liquidable general correspondiente al
 *      mínimo personal y familiar.»
 *   3. «Se restará a la cuota resultante del apartado 1 la cuota resultante del apartado 2.»
 *
 * Lo mismo hace el art. 74 con la escala autonómica, así que el método vale igual sobre la
 * escala combinada (estatal + autonómico medio) que es la que lleva `TRAMOS_IRPF_2025`.
 *
 * ⚠️ **Por qué importa, y no es un tecnicismo.** Restar el mínimo de la base antes de aplicar
 * la escala —`escala(base − mínimo)`— lo valora al tipo MARGINAL del contribuyente en vez de a
 * los tipos bajos de la escala, y **subestima la cuota**. Con el mínimo personal de 5.550 € el
 * error crece con la renta hasta un tope de **1.443 €/año** (5.550 × (45 − 19) %): 610,50 € con
 * 30.000 € de bruto, 951,75 € con 45.000 €, 1.443 € de 80.000 € en adelante. Con mínimos
 * familiares grandes llega mucho más lejos: 3.691 €/año con 70.000 € de base y tres hijos.
 *
 * Existe para que la fórmula no se reescriba en cada motor y cada app. El 09/09/2026 se
 * reparó el mismo defecto a mano en seis motores de `lib/calculadoras` (commit 2b80033d) y
 * el 11/09/2026 en `estimador-sueldo-neto` (4ba094cd); las dos veces quedaron fuera los
 * consumidores que nadie había mirado, porque la fórmula estaba copiada en 19 sitios.
 * **No reimplementar: importar.** El candado `npm run check:minimo-irpf` rompe el build si
 * vuelve a aparecer una resta del mínimo contra la base.
 *
 * @param baseLiquidableGeneral Base liquidable general, **con el mínimo dentro** (€).
 * @param minimoPersonalYFamiliar Suma de los mínimos de los arts. 57 a 61 (€).
 *   La reducción por tributación conjunta del art. 84.2 NO va aquí: esa sí reduce la base.
 */
export function calcularCuotaIntegraGeneral(
  baseLiquidableGeneral: number,
  minimoPersonalYFamiliar: number,
  escala: TramoIRPF[] = TRAMOS_IRPF_2025,
): number {
  const base = Number.isFinite(baseLiquidableGeneral) ? Math.max(0, baseLiquidableGeneral) : 0;
  // El mínimo no puede exceder la base: la parte que no cabe en ella no llega a gravarse, y
  // sin este tope la resta daría una cuota negativa en rentas por debajo del mínimo.
  const minimo = Number.isFinite(minimoPersonalYFamiliar)
    ? Math.min(Math.max(0, minimoPersonalYFamiliar), base)
    : 0;
  return Math.max(0, cuotaEscalaGeneral(base, escala) - cuotaEscalaGeneral(minimo, escala));
}

// ─── Seguridad Social cuenta ajena ──────────────────────────────────────────

export const FISCAL_SS_CUENTA_AJENA_META = {
  fuente: 'Orden PJC/297/2026 de cotización a la Seguridad Social',
  verificado: '2026-06-13',
  vigencia: '2026',
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

// Tipos de cotización 2026 (porción trabajador) — DT 38ª LGSS / Orden PJC/297/2026
export const COTIZACIONES_SS_2026 = {
  contingenciasComunes:    4.70,
  desempleo:               1.55,
  formacionProfesional:    0.10,
  mef:                     0.15, // Mecanismo Equidad Intergeneracional (0,9% total; 0,15% trabajador en 2026)
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
 * Reducción por obtención de rendimientos del trabajo (art. 20 LIRPF), ejercicio 2025.
 * Se aplica sobre el Rendimiento Neto del Trabajo (ingresos íntegros − gastos del art. 19).
 *
 * ⚠️ CORREGIDA EL 09/09/2026 contra el Manual práctico de Renta 2025 de la AEAT
 * («Fase 3ª: Determinación del rendimiento neto reducido»). Hasta esa fecha este módulo
 * llevaba la redacción ANTERIOR al RDL 4/2024 —6.498 / 13.115 / 16.825 con factor 1,14—
 * y, sobre todo, declaraba una **reducción residual permanente de 2.364 € para todo RNT
 * ≥ 16.825 €**. Esa reducción residual NO EXISTE: la reducción se agota en 19.747,5 € y
 * a partir de ahí vale CERO. El efecto era que 9 apps y 5 motores rebajaban la base
 * imponible de todos los sueldos medios y altos en 2.364 € que no corresponden, y
 * publicaban cuotas inferiores a las reales (≈700 € menos en un sueldo de 30.000 €).
 *
 * La escala vigente tiene DOS tramos decrecientes, no uno:
 *
 * - RNT ≤ 14.852 €                    → 7.302 €
 * - 14.852 < RNT ≤ 17.673,52 €        → 7.302 − 1,75 × (RNT − 14.852)
 * - 17.673,52 < RNT < 19.747,5 €      → 2.364,34 − 1,14 × (RNT − 17.673,52)
 * - RNT ≥ 19.747,5 €                  → 0 €
 *
 * Los dos tramos empalman: en 17.673,52 el primero da exactamente 2.364,34, y en
 * 19.747,5 el segundo da exactamente 0.
 *
 * ⚠️ La reducción exige además NO tener rentas distintas de las del trabajo superiores a
 * 6.500 € (excluidas las exentas). Esa condición no la modela este módulo: quien la
 * necesite debe comprobarla antes de llamar a `calcularReduccionRendimientosTrabajo`.
 *
 * Fuente: AEAT, Manual práctico Renta 2025, capítulo 3 — art. 20 Ley 35/2006 en la
 * redacción dada por el RDL 4/2024.
 */
export const REDUCCION_RENDIMIENTOS_TRABAJO_2025 = {
  limite1:                14852,     // RNT hasta aquí: reducción máxima
  reduccion1:              7302,     // €/año de reducción máxima
  limiteIntermedio:    17673.52,     // Frontera entre los dos tramos decrecientes
  reduccionIntermedia:  2364.34,     // Reducción exacta en esa frontera
  limite2:              19747.5,     // RNT a partir de aquí: SIN reducción (0 €)
  reduccion2:                 0,     // €/año por encima de limite2 — NO hay residual
  factorTramo1:            1.75,     // Pendiente entre limite1 y limiteIntermedio
  factorTramo2:            1.14,     // Pendiente entre limiteIntermedio y limite2
};

/**
 * Fuente ÚNICA de la reducción del art. 20. Devuelve la reducción que corresponde a un
 * rendimiento neto del trabajo.
 *
 * Existe para que la fórmula no se reescriba en cada motor y cada app: hasta el 09/09/2026
 * estaba copiada a mano en 14 sitios, y así fue como tres de ellos acabaron con tres
 * versiones distintas de la misma norma (`irpfSegundoPagador` con 5.565/0,
 * `devolucionIRPF` y `dividendoEmpresarial` con 7.302/14.047,5, y este módulo con la
 * redacción vieja). **No reimplementar: importar.**
 */
export function calcularReduccionRendimientosTrabajo(rendimientoNetoTrabajo: number): number {
  const r = REDUCCION_RENDIMIENTOS_TRABAJO_2025;
  if (!Number.isFinite(rendimientoNetoTrabajo) || rendimientoNetoTrabajo <= 0) return 0;
  if (rendimientoNetoTrabajo <= r.limite1) return r.reduccion1;
  if (rendimientoNetoTrabajo >= r.limite2) return 0;
  const bruta = rendimientoNetoTrabajo <= r.limiteIntermedio
    ? r.reduccion1 - r.factorTramo1 * (rendimientoNetoTrabajo - r.limite1)
    : r.reduccionIntermedia - r.factorTramo2 * (rendimientoNetoTrabajo - r.limiteIntermedio);
  return Math.max(0, Math.round(bruta * 100) / 100);
}

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
    COTIZACIONES_SS_2026.contingenciasComunes +
    COTIZACIONES_SS_2026.desempleo +
    COTIZACIONES_SS_2026.formacionProfesional +
    COTIZACIONES_SS_2026.mef;
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
  const reduccion = calcularReduccionRendimientosTrabajo(rnt);
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
