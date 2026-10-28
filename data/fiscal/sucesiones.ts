/**
 * data/fiscal/sucesiones.ts
 * Datos fiscales Impuesto de Sucesiones y Donaciones (ISD) — rama sucesiones
 * Tarifa estatal + tarifa Cataluña + bonificaciones de las 17 CCAA
 * Última revisión: 2025-01-01
 *
 * ⚠️ 2026-08-12: incorporada la advertencia de la Ley 3/2026 de Madrid (empresa
 *    familiar). El sello de abajo NO se mueve a propósito: el barrido mensual no
 *    puede afirmar que las 17 comunidades están verificadas, y eso es lo que
 *    significa el sello de un módulo cedido. La inmersión por CCAA es de enero
 *    (skill /revision-fiscal-enero).
 */

// ─── Metadatos ───────────────────────────────────────────────────────────────

export const FISCAL_SUCESIONES_META = {
  fuente: 'Ley 29/1987 ISD + normativas autonómicas 2025',
  verificado: '2025-01-01',
  vigencia: '2025',
  urlOficial: 'https://sede.agenciatributaria.gob.es/Sede/impuestos-tasas/isd.html',
  nota: 'Impuesto cedido a las CCAA. Verificar bonificaciones en la Agencia Tributaria de cada comunidad.',
};

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface TramoTarifaIS {
  hasta: number;
  cuota: number;
  tipo: number;
}

export interface BonificacionGrupoIS {
  porcentaje?: number;
  exencion?: number;
  limite?: number | null;
  tope?: number;
  porcentajeMayor?: number;
  reduccionBase?: number;
  escalonado?: Array<{ hasta?: number; desde?: number; porcentaje: number }>;
  /**
   * Escala MARGINAL sobre la base imponible (hoy solo Cataluña, art. 58 bis Ley 19/2010).
   *
   * No es lo mismo que `escalonado`, y confundirlas cuesta miles de euros: en `escalonado` la
   * base cae en un tramo y se lleva SU porcentaje entero; aquí cada tramo bonifica solo la
   * parte de base que le toca, y el porcentaje final es el medio ponderado del conjunto. Una
   * base de 250.000 € del Grupo II bonifica al 56,00 %, que no es ninguno de los porcentajes
   * de la tabla: sale de 100.000 al 60 % + 100.000 al 55 % + 50.000 al 50 %.
   */
  escalaPonderada?: TramoEscalaBonificacionIS[];
}

/** Un tramo de una escala marginal de bonificación: el marginal se aplica al resto de base. */
export interface TramoEscalaBonificacionIS {
  /** Límite superior del tramo de base imponible (€); `Infinity` en el último. */
  hasta: number;
  /** Porcentaje que bonifica la porción de base imponible comprendida en este tramo. */
  marginal: number;
}

export interface BonificacionCCAA_IS {
  nombre: string;
  regimen: 'comun' | 'foral';
  bonificaciones: Record<string, BonificacionGrupoIS>;
  notas: string;
  /**
   * Causahabientes de los Grupos III y IV a los que la comunidad extiende los beneficios de los
   * Grupos I y II si cumplen un requisito propio (Extremadura: inscripción en el Registro
   * Autonómico de Personas con Especial Vinculación, arts. 20 ter y 20 quater DLeg 1/2018).
   * Cambia la bonificación en cuota y la reducción por parentesco, que pasa a ser la MEJORA
   * autonómica de los Grupos I y II si la comunidad la tiene (`MEJORAS_REDUCCIONES_CCAA_IS`); el
   * coeficiente del art. 22 LISD sigue siendo el de su grupo legal.
   */
  especialVinculacion?: {
    norma: string;
    /** Quiénes pueden serlo y qué se exige, para la ayuda del formulario */
    quienes: string;
  };
}

// ─── Tarifa estatal del ISD (art. 21.2 LISD — 16 tramos) ─────────────────────

/**
 * La escala del art. 21.2 de la Ley 29/1987, que el Estado aplica en defecto de tarifa
 * autonómica. Es UNA SOLA para todo el impuesto: el art. 21 no distingue entre adquisiciones
 * mortis causa e inter vivos, así que la misma tabla liquida una herencia y una donación. Lo
 * que sí cambia de una modalidad a otra son las reducciones del art. 20, no la tarifa.
 *
 * Por eso la rama de donaciones la reexporta desde aquí como `TARIFA_ESTATAL_ID` en vez de
 * transcribirla otra vez. Estuvo transcrita dos veces hasta el 11/09/2026 y las dos copias
 * divergieron: la de esta rama tenía SIETE tramos y un tipo máximo del 25,50 % —umbrales
 * reales del art. 21 emparejados con la cuota y el tipo de filas que no les correspondían, de
 * modo que la escala era internamente coherente y legalmente inexistente— e infravaloraba la
 * cuota SIEMPRE, tanto más cuanto mayor era la herencia: 824.000 € de base liquidable en el
 * Grupo IV salían por 278.585,05 € en vez de los 416.565,35 € que exige la ley, 137.980,30 €
 * por debajo (hallazgo 735 del Inspector). El comentario de la copia buena llegó a afirmar
 * que la escala de donaciones era «diferente a sucesiones», que es la creencia que sostuvo
 * el error mientras el dato correcto estaba a un directorio de distancia.
 *
 * Columna `cuota`: la cuota íntegra ACUMULADA al cerrar el tramo anterior, tal como la
 * publica el BOE con sus propios redondeos. `calcularCuotaIntegraIS` la usa tal cual en vez
 * de acumular marginales, porque manda la tabla, que es la ley.
 */
export const TARIFA_ESTATAL_ISD: TramoTarifaIS[] = [
  { hasta: 7993.46,    cuota: 0,          tipo: 7.65  },
  { hasta: 15980.91,   cuota: 611.50,     tipo: 8.50  },
  { hasta: 23968.36,   cuota: 1290.43,    tipo: 9.35  },
  { hasta: 31955.81,   cuota: 2037.26,    tipo: 10.20 },
  { hasta: 39943.26,   cuota: 2851.98,    tipo: 11.05 },
  { hasta: 47930.72,   cuota: 3734.59,    tipo: 11.90 },
  { hasta: 55918.17,   cuota: 4685.10,    tipo: 12.75 },
  { hasta: 63905.62,   cuota: 5703.50,    tipo: 13.60 },
  { hasta: 71893.07,   cuota: 6789.79,    tipo: 14.45 },
  { hasta: 79880.52,   cuota: 7943.98,    tipo: 15.30 },
  { hasta: 119757.67,  cuota: 9166.06,    tipo: 16.15 },
  { hasta: 159634.83,  cuota: 15606.22,   tipo: 18.70 },
  { hasta: 239389.13,  cuota: 23063.25,   tipo: 21.25 },
  { hasta: 398777.54,  cuota: 40011.04,   tipo: 25.50 },
  { hasta: 797555.08,  cuota: 80655.08,   tipo: 29.75 },
  { hasta: Infinity,   cuota: 199291.40,  tipo: 34.00 },
];

/** Nombre con el que la rama de sucesiones nombra la tarifa única del art. 21.2 LISD. */
export const TARIFA_ESTATAL_IS: TramoTarifaIS[] = TARIFA_ESTATAL_ISD;

// ─── Tarifa Cataluña sucesiones (5 tramos propios) ───────────────────────────

export const TARIFA_CATALUNA_IS: TramoTarifaIS[] = [
  { hasta: 50000,     cuota: 0,       tipo: 7  },
  { hasta: 150000,    cuota: 3500,    tipo: 11 },
  { hasta: 400000,    cuota: 14500,   tipo: 17 },
  { hasta: 800000,    cuota: 57000,   tipo: 24 },
  { hasta: Infinity,  cuota: 153000,  tipo: 32 },
];

// ─── Coeficientes multiplicadores por grupo y patrimonio preexistente ─────────

export const COEFICIENTES_IS: Record<string, number[]> = {
  'I':   [1.0000, 1.0500, 1.1000, 1.2000],
  'II':  [1.0000, 1.0500, 1.1000, 1.2000],
  'III': [1.5882, 1.6676, 1.7471, 1.9059],
  'IV':  [2.0000, 2.1000, 2.2000, 2.4000],
};

/**
 * Límites SUPERIORES de los tres primeros tramos de patrimonio preexistente (art. 22.2 LISD,
 * cotejado en el texto consolidado del BOE, BOE-A-1987-28141, el 30/09/2026): «De 0 a
 * 402.678,11», «De más de 402.678,11 a 2.007.380,43», «De más de 2.007.380,43 a 4.020.770,98» y
 * «Más de 4.020.770,98». Son la otra mitad de la tabla de `COEFICIENTES_IS`.
 *
 * Hasta el 30/09/2026 no estaban aquí: la página los tecleaba truncados en diez líneas
 * («Menos de 402.678 €»), así que quien tenía justo 402.678,11 € —tramo 1 por ley— solo cabía
 * en la opción del tramo 2 (hallazgo 2484).
 */
export const LIMITES_PATRIMONIO_PREEXISTENTE_IS = [402678.11, 2007380.43, 4020770.98] as const;

/** Índice 0-3 del tramo de patrimonio preexistente al que pertenece un importe (art. 22.2 LISD). */
export function indiceTramoPatrimonioIS(patrimonio: number): 0 | 1 | 2 | 3 {
  const [l1, l2, l3] = LIMITES_PATRIMONIO_PREEXISTENTE_IS;
  if (patrimonio <= l1) return 0;
  if (patrimonio <= l2) return 1;
  if (patrimonio <= l3) return 2;
  return 3;
}

export interface CuotaTributariaIS {
  /** Coeficiente del tramo en que cae el patrimonio. */
  coeficiente: number;
  /** Cuota íntegra × coeficiente, ya con la corrección del salto, a céntimo. */
  cuotaTributaria: number;
  /** Lo que la corrección del art. 22.2 in fine le ha quitado (0 si no procede). */
  correccionSalto: number;
}

/**
 * Cuota tributaria del art. 22 LISD con la corrección del salto de coeficiente (art. 22.2, último
 * párrafo): cuando la diferencia entre la cuota con el coeficiente del tramo y la que daría el
 * coeficiente inmediato inferior es MAYOR que lo que el patrimonio preexistente pasa del límite
 * de ese tramo inferior, la cuota se reduce en el exceso. Es decir:
 *
 *   cuota = mín( CI × c[k],  CI × c[k−1] + (patrimonio − límite[k−1]) )
 *
 * Sin ella, a quien pasa un umbral por un euro se le cobraba el coeficiente entero: un sobrino
 * gallego con 402.700 € de patrimonio y 11.608,91 € de cuota íntegra pagaba 19.359,02 € en vez
 * de 18.459,16 € (899,86 € de más; hallazgo 2483, 30/09/2026).
 *
 * `coeficientes` es la fila del grupo (estatal o autonómica): con coeficientes planos, como los
 * de Cataluña, la diferencia es cero y la corrección nunca actúa.
 */
export function cuotaTributariaConCorreccionIS(
  cuotaIntegra: number,
  coeficientes: readonly number[],
  patrimonio: number,
): CuotaTributariaIS {
  const aCentimo = (n: number) => Math.round(n * 100) / 100;
  const k = indiceTramoPatrimonioIS(Math.max(0, patrimonio));
  const coeficiente = coeficientes[k] ?? 1;
  const cuotaEntera = aCentimo(cuotaIntegra * coeficiente);
  if (k === 0) return { coeficiente, cuotaTributaria: cuotaEntera, correccionSalto: 0 };
  const cuotaInferior = aCentimo(cuotaIntegra * (coeficientes[k - 1] ?? coeficiente));
  const exceso = patrimonio - LIMITES_PATRIMONIO_PREEXISTENTE_IS[k - 1];
  const tope = aCentimo(cuotaInferior + exceso);
  if (cuotaEntera <= tope) return { coeficiente, cuotaTributaria: cuotaEntera, correccionSalto: 0 };
  return { coeficiente, cuotaTributaria: tope, correccionSalto: aCentimo(cuotaEntera - tope) };
}

// Cataluña: coeficientes propios (Gr I-II sin incremento por patrimonio)
export const COEFICIENTES_CATALUNA_IS: Record<string, number[]> = {
  'I':   [1.0000, 1.0000, 1.0000, 1.0000],
  'II':  [1.0000, 1.0000, 1.0000, 1.0000],
  'III': [1.5882, 1.5882, 1.5882, 1.5882],
  'IV':  [2.0000, 2.0000, 2.0000, 2.0000],
};

// ─── Tarifas y coeficientes propios de comunidades de régimen común ──────────

/**
 * Una comunidad de régimen común que aprueba su propia tarifa (art. 48.1.b Ley 22/2009) y sus
 * propios coeficientes multiplicadores (art. 48.1.c). Sustituyen a los estatales del art. 21.2 y
 * del art. 22 LISD en las DOS modalidades del impuesto, herencias y donaciones, cuando la norma
 * autonómica no las distingue.
 *
 * Cataluña no está aquí: tiene tarifas distintas para herencias y donaciones (y una reducida en
 * donaciones), y cada rama la elige por su cuenta.
 */
export interface TarifaPropiaCCAA_ISD {
  tarifa: TramoTarifaIS[];
  /**
   * Fila de coeficientes por grupo legal, con las cuatro columnas de patrimonio preexistente del
   * art. 22.2 LISD. Si la comunidad no distingue por patrimonio, las cuatro son iguales y la
   * corrección del salto nunca actúa.
   */
  coeficientes: Record<string, number[]>;
  normaTarifa: string;
  normaCoeficientes: string;
  urlOficial: string;
  verificado: string;
}

/**
 * Andalucía — art. 37 de la Ley 5/2021, de 20 de octubre, de Tributos Cedidos (BOE-A-2021-17915,
 * consolidado, leído el 28/10/2026; redacción única, vigente desde el 01/01/2022): «La cuota
 * íntegra del impuesto […] se obtendrá aplicando sobre la base liquidable los tipos de gravamen que
 * se indican en la siguiente escala». Del 7 % al 26 %. Está en la Sección 3.ª del capítulo del ISD,
 * común a herencias y donaciones. Columna `cuota`: la del BOE al empezar el tramo, como en la
 * estatal (8.000 × 7 % = 560; 560 + 7.000 × 8 % = 1.120…, comprobado tramo a tramo).
 *
 * Hasta el 28/10/2026 Andalucía liquidaba con la tarifa estatal (del 7,65 % al 34 %): 1.000.000 €
 * donados a un hijo con escritura daban 2681,23 € en vez de 2236,20 € (cabo C0023).
 */
export const TARIFA_ANDALUCIA_ISD: TramoTarifaIS[] = [
  { hasta: 8000,      cuota: 0,       tipo: 7  },
  { hasta: 15000,     cuota: 560,     tipo: 8  },
  { hasta: 30000,     cuota: 1120,    tipo: 10 },
  { hasta: 50000,     cuota: 2620,    tipo: 12 },
  { hasta: 70000,     cuota: 5020,    tipo: 14 },
  { hasta: 100000,    cuota: 7820,    tipo: 16 },
  { hasta: 150000,    cuota: 12620,   tipo: 18 },
  { hasta: 200000,    cuota: 21620,   tipo: 20 },
  { hasta: 400000,    cuota: 31620,   tipo: 22 },
  { hasta: 800000,    cuota: 75620,   tipo: 24 },
  { hasta: Infinity,  cuota: 171620,  tipo: 26 },
];

/**
 * Andalucía — art. 38.1 de la Ley 5/2021 (mismo texto, leído el 28/10/2026): «se obtendrá
 * aplicando a la cuota íntegra el coeficiente multiplicador que corresponda según los siguientes
 * grupos de parentesco: Grupos I y II 1,0 · Grupo III 1,5 · Grupo IV 1,9». No depende del
 * patrimonio preexistente: las cuatro columnas son iguales.
 */
export const COEFICIENTES_ANDALUCIA_ISD: Record<string, number[]> = {
  'I':   [1.0, 1.0, 1.0, 1.0],
  'II':  [1.0, 1.0, 1.0, 1.0],
  'III': [1.5, 1.5, 1.5, 1.5],
  'IV':  [1.9, 1.9, 1.9, 1.9],
};

export const TARIFAS_PROPIAS_CCAA_ISD: Record<string, TarifaPropiaCCAA_ISD> = {
  'andalucia': {
    tarifa: TARIFA_ANDALUCIA_ISD,
    coeficientes: COEFICIENTES_ANDALUCIA_ISD,
    normaTarifa: 'art. 37 Ley 5/2021',
    normaCoeficientes: 'art. 38 Ley 5/2021',
    urlOficial: 'https://www.boe.es/buscar/act.php?id=BOE-A-2021-17915',
    verificado: '2026-10-28',
  },
};

// ─── Reducciones estatales por parentesco ────────────────────────────────────

export const REDUCCIONES_PARENTESCO_IS: Record<string, number> = {
  'I-conyuge':      15956.87,
  'I-descendiente': 15956.87,
  'II':             15956.87,
  'II-descendiente': 15956.87,  // El art. 20.2.a LISD no distingue hijo de nieto: mismo importe
  'II-ascendiente': 15956.87,
  'III':            7993.46,
  'IV':             0,
};

/**
 * Cataluña: reducciones por parentesco propias (art. 2 Ley 19/2010).
 *
 * ⚠️ Cataluña SÍ desglosa el Grupo II, y el régimen común NO. Aquí es donde más caro sale
 * confundirlos, porque es la única comunidad sin bonificación general que aplane el error:
 * en las otras 16 el 99 % de bonificación deja la cuota en el entorno de 100 €, y aquí una
 * reducción mal elegida son miles de euros.
 *
 * Hasta el 08/09/2026 la clave 'II' valía 50.000 € —el importe del NIETO— y se la servía a
 * los hijos, que son la inmensa mayoría de quienes usan estas apps, mientras 'II-ascendiente'
 * daba 50.000 € donde la ley dice 30.000 €. Salió al contrastar con ChatGPT una herencia de
 * 250.000 € con vivienda de 180.000 €: nuestras herramientas decían 23.000 € y la Agència
 * Tributària de Catalunya, 0 €.
 */
export const REDUCCIONES_PARENTESCO_CATALUNA_IS: Record<string, number> = {
  'I-conyuge':      100000,  // Cónyuge o pareja estable
  'I-descendiente': 100000,  // Grupo I (<21), antes del incremento por año — ver constantes de abajo
  'II':             100000,  // Hijo o hija de 21 años o más
  'II-descendiente': 50000,  // Resto de descendientes ≥21 (nieto, bisnieto)
  'II-ascendiente':  30000,  // Ascendientes (padre, madre, abuelos)
  'III':            8000,
  'IV':             0,
};

// ─── Reducciones especiales (régimen común) ──────────────────────────────────

export const REDUCCION_EDAD_MENOR_21_IS = 3990.72;       // Por cada año por debajo de 21
export const REDUCCION_EDAD_MENOR_21_MAX_IS = 47858.59;  // Tope máximo
export const REDUCCION_SEGURO_VIDA_MAX_IS = 9195.49;     // 100% cónyuge/desc/asc, con límite
export const REDUCCION_VIVIENDA_PORC_IS = 0.95;          // 95% del valor neto
export const REDUCCION_VIVIENDA_MAX_IS = 122606.47;      // Tope máximo reducción vivienda
/**
 * Art. 20.2.c LISD: años que hay que mantener la vivienda para conservar la reducción.
 *
 * Vive aquí y no escrito a mano en cada app porque su hermana catalana
 * —`REDUCCION_VIVIENDA_ANIOS_MANTENIMIENTO_CATALUNA_IS`, que son 5 y no 10— ya estaba
 * sellada desde el 08/09/2026, y las apps seguían tecleando el plazo estatal en su prosa:
 * al usuario catalán se le decía que no podía vender hasta el décimo año cuando la app SÍ
 * le estaba aplicando el tope catalán del art. 17 (hallazgo 696 del Inspector).
 */
export const REDUCCION_VIVIENDA_ANIOS_MANTENIMIENTO_IS = 10;
export const REDUCCION_DISCAPACIDAD_33_IS = 47858.59;    // Grado 33%–64%
export const REDUCCION_DISCAPACIDAD_65_IS = 150253.03;   // Grado ≥65%
export const PORC_AJUAR_DOMESTICO_IS = 0.03;             // 3% de la masa hereditaria

// ─── Mejoras autonómicas de las reducciones estatales ────────────────────────

/**
 * Reducciones por parentesco y por discapacidad que una comunidad MEJORA: la cifra autonómica
 * SUSTITUYE a la estatal en esa comunidad (art. 48.1.a Ley 22/2009, BOE-A-2009-20375: «la
 * reducción mejorada sustituirá, en esa Comunidad Autónoma, a la reducción estatal»). No es lo
 * mismo que una reducción PROPIA, que se aplica después de las estatales y se suma a ellas
 * —como la de Asturias, `reduccionBase` en `BONIFICACIONES_CCAA_IS`— ni impide la bonificación
 * en cuota.
 *
 * Hoy solo Extremadura (DLeg 1/2018, BOE-A-2018-8159, consolidado; cotejado el 22/10/2026):
 *   · art. 17, «Mejora de la reducción personal […] para los causahabientes incluidos en los
 *     grupos I y II de parentesco»: «podrán aplicarse una reducción en la base imponible de
 *     500.000 euros» (redacción de la Ley 1/2024, vigente desde el 01/01/2024). Sustituye a los
 *     15.956,87 € del art. 20.2.a LISD y a los 3.990,72 € por año hasta los 21.
 *   · art. 18, «Mejora de la reducción de la base imponible para las personas discapacitadas»:
 *     60.000 € (33 % a menos del 50 %), 120.000 € (50 % a menos del 65 %) y 180.000 € (65 % o
 *     más), «además de la reducción que les pudiera corresponder en función de su grado de
 *     parentesco». Sustituye a los 47.858,59 / 150.253,03 € estatales.
 * Las dos son compatibles con la bonificación del 99 % del art. 20.
 *
 * Hasta el 22/10/2026 no se modelaban (cabo C0371): un hijo que heredaba 400.000 € en
 * Extremadura pagaba el 1 % de la cuota estatal cuando la reducción de 500.000 € la deja en 0.
 * Modelarlas como mejoras y no como propias lo decidió el usuario el 22/10/2026: la diferencia
 * solo aparece con bases de más de unos 500.000 €. Lo haría cambiar un criterio de la Junta o
 * una consulta vinculante que las trate como propias.
 */
export interface MejoraReduccionesCCAA_IS {
  /** Reducción por parentesco que sustituye a la estatal (y al incremento por edad), por grupo. */
  parentesco: { norma: string; importes: Partial<Record<string, number>> };
  /** Escala por discapacidad que sustituye a la estatal, por grado mínimo. */
  discapacidad: { norma: string; '33': number; '50': number; '65': number };
  urlOficial: string;
  verificado: string;
}

export const MEJORAS_REDUCCIONES_CCAA_IS: Record<string, MejoraReduccionesCCAA_IS> = {
  'extremadura': {
    parentesco: {
      norma: 'art. 17 DLeg 1/2018 de Extremadura',
      importes: {
        'I-conyuge':       500000,
        'I-descendiente':  500000,
        'II':              500000,
        'II-descendiente': 500000,
        'II-ascendiente':  500000,
      },
    },
    discapacidad: { norma: 'art. 18 DLeg 1/2018 de Extremadura', '33': 60000, '50': 120000, '65': 180000 },
    urlOficial: 'https://www.boe.es/buscar/act.php?id=BOE-A-2018-8159',
    verificado: '2026-10-22',
  },
  // Andalucía — Ley 5/2021 (BOE-A-2021-17915, consolidado, leído el 28/10/2026; redacción única,
  // vigente desde el 01/01/2022). Art. 28.1: «El importe de reducción previsto en el artículo
  // 20.2 a) de la Ley 29/1987 […] será el siguiente: a) Grupo I […] 1.000.000 de euros. b) Grupo
  // II […] 1.000.000 euros. c) Grupo III […] 10.000 euros». Art. 29.1: 250.000 € con discapacidad
  // del 33 % al 65 % y 500.000 € del 65 % en adelante, «compatible» con la del art. 28 (29.2).
  // El Grupo IV no tiene mejora: se queda con la estatal, que es 0.
  // Hasta el 28/10/2026 el millón se modelaba como EXENCIÓN TOTAL de la herencia por debajo de
  // 1.000.000 € de base liquidable, y por encima se reducían solo los 15.956,87 € estatales: un
  // hijo con 1.019.700 € de base imponible pasaba de 0 € a 2693,95 € por 5.000 € más (cabo C0495).
  'andalucia': {
    parentesco: {
      norma: 'art. 28 Ley 5/2021 de Andalucía',
      importes: {
        'I-conyuge':       1000000,
        'I-descendiente':  1000000,
        'II':              1000000,
        'II-descendiente': 1000000,
        'II-ascendiente':  1000000,
        'III':             10000,
      },
    },
    discapacidad: { norma: 'art. 29 Ley 5/2021 de Andalucía', '33': 250000, '50': 250000, '65': 500000 },
    urlOficial: 'https://www.boe.es/buscar/act.php?id=BOE-A-2021-17915',
    verificado: '2026-10-28',
  },
};

/**
 * Plazo de presentación y prórroga del ISD en adquisiciones por causa de muerte.
 *
 * Arts. 67.1.a) y 68 del Reglamento del ISD (RD 1629/1991). Verificado el 13/09/2026
 * contra el BOE y la sede de la AEAT (modelo 650, «Plazos de presentación»).
 *
 * ⚠  Existe porque el plazo iba tecleado y SIN norma citada en cuatro sitios de
 * `simulador-heredar-vivienda` y doce de `estimador-impuesto-sucesiones` (hallazgos 782 y
 * 801 del Inspector), en frases que sí citaban la norma del recargo de al lado. Es el mismo
 * caso que PLAZO_ITP, creado el 11/09/2026 para el tributo vecino.
 *
 * ⚠  La prórroga NO es gratis: devenga intereses de demora desde que vence el plazo de
 * seis meses hasta la presentación (art. 68.3 RISD). Decir «prórroga de otros 6 meses» sin
 * más hace pensar lo contrario, y la misma URL de `estimador-impuesto-sucesiones` afirmaba
 * las dos cosas a la vez (hallazgo 795).
 */
export const PLAZO_ISD = {
  /** Meses desde el fallecimiento para presentar la autoliquidación (art. 67.1.a). */
  mesesPresentacion: 6,
  /** Meses de la prórroga, única y por un plazo igual al de presentación (art. 68.1). */
  mesesProrroga: 6,
  /** La prórroga se pide dentro de los cinco primeros meses (art. 68.1). */
  mesesParaPedirProrroga: 5,
  /** La prórroga devenga intereses de demora (art. 68.3). */
  prorrogaDevengaIntereses: true,
  norma: 'arts. 67.1.a) y 68 del Reglamento del ISD (RD 1629/1991)',
  urlOficial:
    'https://sede.agenciatributaria.gob.es/Sede/no-residentes/impuesto-sobre-sucesiones-donaciones/adquisiciones-mortis-causa-modelo-650/plazos-presentacion.html',
  verificado: '2026-09-13',
};

/**
 * Valoración del USUFRUCTO y la NUDA PROPIEDAD en el ISD.
 *
 * Art. 26.a) de la Ley 29/1987 (LISD). Verificado el 22/09/2026 contra el texto consolidado
 * del BOE, que dice literalmente: en los usufructos vitalicios «se estimará que el valor es
 * igual al 70 por 100 del valor total de los bienes cuando el usufructuario cuente menos de
 * veinte años, minorando, a medida que aumenta la edad, en la proporción de un 1 por 100
 * menos por cada año más, con el límite mínimo del 10 por 100 del valor total».
 *
 * ⚠  Existe porque la regla iba TECLEADA en dos sitios de `estimador-impuesto-sucesiones`
 * —`Math.max(0.10, (89 - edad) / 100)` en el cálculo y la misma fórmula escrita en el helper
 * del campo— sin constante y sin ninguna norma al lado, en una app donde el plazo y hasta los
 * años de mantenimiento de la vivienda sí estaban sellados (hallazgo 1196). Es la forma exacta
 * del hallazgo 801, del que nació PLAZO_ISD.
 *
 * ⚠  Y sin la norma delante la regla se había quedado SIN SU TECHO. El «89 − edad» es la forma
 * abreviada del artículo y solo vale a partir de los 20 años (89 − 20 = 69 %); por debajo, el
 * artículo fija un 70 % plano. Como el campo de la app admite desde los 10 años, las edades de
 * 10 a 19 devolvían del 71 % al 79 %, por encima del máximo legal: sobrevaloraba la base del
 * usufructuario e infravaloraba la del nudo propietario. Con 15 años y 100.000 € en cuentas la
 * app aplicaba el 74 % donde corresponde el 70 %.
 */
export const VALORACION_USUFRUCTO_IS = {
  /** Minuendo de la forma abreviada «89 − edad», equivalente al artículo desde los 20 años */
  edadReferencia: 89,
  /** Por debajo de esta edad el artículo fija un porcentaje plano, sin fórmula */
  edadUmbralMaximo: 20,
  /** Porcentaje del usufructo vitalicio por debajo de `edadUmbralMaximo`, y techo de la regla */
  porcMaximo: 70,
  /** Suelo expreso del artículo, al que se llega a los 79 años */
  porcMinimo: 10,
  /** Usufructo temporal: 2 % por cada año, sin exceder del 70 % (mismo art. 26.a) */
  porcPorAnioTemporal: 2,
  norma: 'art. 26.a) de la Ley 29/1987 del ISD',
  urlOficial: 'https://www.boe.es/buscar/act.php?id=BOE-A-1987-28141#a26',
  verificado: '2026-09-22',
};

/**
 * Porcentaje del valor de los bienes que corresponde a un USUFRUCTO VITALICIO, por edad.
 *
 * Devuelve una fracción (0,70 para el 70 %). Aplica el techo y el suelo del art. 26.a): sin
 * ellos, una edad por debajo de 20 pasaba del 70 % legal y una por encima de 79 habría bajado
 * del 10 %.
 */
export function porcentajeUsufructoVitalicio(edad: number): number {
  const { edadReferencia, edadUmbralMaximo, porcMaximo, porcMinimo } = VALORACION_USUFRUCTO_IS;
  if (!Number.isFinite(edad) || edad < edadUmbralMaximo) return porcMaximo / 100;
  return Math.min(porcMaximo, Math.max(porcMinimo, edadReferencia - edad)) / 100;
}

// ─── Reducciones especiales de Cataluña (Ley 19/2010) ────────────────────────
//
// Mismas figuras que las estatales de arriba, con importes propios. Se listan aparte porque
// los dos regímenes conviven en el mismo cálculo y mezclar una constante con otra no da error
// de tipos: da una cifra plausible y equivocada.

/** Art. 2: por cada año de menos de 21 del causahabiente del Grupo I (sobre los 100.000 € base) */
export const REDUCCION_EDAD_MENOR_21_CATALUNA_IS = 12000;
/** Art. 2: tope de la reducción del Grupo I una vez sumado el incremento por edad */
export const REDUCCION_EDAD_MENOR_21_MAX_CATALUNA_IS = 196000;
/** Art. 17: límite de la reducción por vivienda habitual, por el valor CONJUNTO de la vivienda */
export const REDUCCION_VIVIENDA_MAX_CATALUNA_IS = 500000;
/** Art. 17: el límite individual resultante del prorrateo no puede bajar de esta cifra */
export const REDUCCION_VIVIENDA_MIN_INDIVIDUAL_CATALUNA_IS = 180000;
/** Art. 19: años que hay que mantener la vivienda para conservar la reducción */
export const REDUCCION_VIVIENDA_ANIOS_MANTENIMIENTO_CATALUNA_IS = 5;

// ─── Bonificación en cuota de Cataluña (art. 58 bis Ley 19/2010) ─────────────
//
// ⚠️ SON DOS ESCALAS DISTINTAS, no una. El Grupo I (descendientes menores de 21) bonifica
// del 99 % al 20 %, y el Grupo II del 60 % al 0 %: para una base de 250.000 € son 56,00 %
// frente a 97,50 %. Aplicarle al menor la escala del Grupo II le costaría casi la cuota
// entera, así que la distinción no es un detalle de precisión.
//
// El cónyuge y la pareja estable van aparte, con un 99 % fijo que no depende de la base.
//
// Las columnas «Bonificación (%)» que publica la Agència Tributària son el porcentaje MEDIO
// acumulado en cada límite; aquí se guardan solo los marginales, que son el dato primitivo,
// y las medias se recalculan. Las medias oficiales van anotadas en cada línea para poder
// comprobar la transcripción sin volver a la web: las once de cada tabla cuadran.

/** Grupo I catalán (descendientes menores de 21 años), excepto cónyuge o pareja estable. */
export const ESCALA_BONIF_CATALUNA_GRUPO_I_IS: TramoEscalaBonificacionIS[] = [
  { hasta: 100000,   marginal: 99 },  // media acumulada al llegar al límite: 99,00 %
  { hasta: 200000,   marginal: 97 },  // 98,00 %
  { hasta: 300000,   marginal: 95 },  // 97,00 %
  { hasta: 500000,   marginal: 90 },  // 94,20 %
  { hasta: 750000,   marginal: 80 },  // 89,47 %
  { hasta: 1000000,  marginal: 70 },  // 84,60 %
  { hasta: 1500000,  marginal: 60 },  // 76,40 %
  { hasta: 2000000,  marginal: 50 },  // 69,80 %
  { hasta: 2500000,  marginal: 40 },  // 63,84 %
  { hasta: 3000000,  marginal: 25 },  // 57,37 %
  { hasta: Infinity, marginal: 20 },
];

/** Grupo II catalán: hijos y demás descendientes de 21 años o más, y ascendientes. */
export const ESCALA_BONIF_CATALUNA_GRUPO_II_IS: TramoEscalaBonificacionIS[] = [
  { hasta: 100000,   marginal: 60 },  // media acumulada al llegar al límite: 60,00 %
  { hasta: 200000,   marginal: 55 },  // 57,50 %
  { hasta: 300000,   marginal: 50 },  // 55,00 %
  { hasta: 500000,   marginal: 45 },  // 51,00 %
  { hasta: 750000,   marginal: 40 },  // 47,33 %
  { hasta: 1000000,  marginal: 35 },  // 44,25 %
  { hasta: 1500000,  marginal: 30 },  // 39,50 %
  { hasta: 2000000,  marginal: 25 },  // 35,88 %
  { hasta: 2500000,  marginal: 20 },  // 32,70 %
  { hasta: 3000000,  marginal: 10 },  // 28,92 %
  { hasta: Infinity, marginal: 0  },
];

/** Cónyuge o pareja estable: 99 % de la cuota, sin escala (art. 58 bis.1). */
export const BONIF_CONYUGE_CATALUNA_IS = 0.99;

/**
 * Sello propio de la rama catalana. El de arriba (`FISCAL_SUCESIONES_META`) NO se mueve: sigue
 * cubriendo las otras 16 comunidades, y no se ha verificado ninguna de ellas en esta revisión.
 * Un sello que dijera «2026-09-08» para todo el módulo afirmaría un trabajo que no se ha hecho.
 */
export const FISCAL_SUCESIONES_CATALUNA_META = {
  fuente: 'Ley 19/2010, de 7 de junio (arts. 2, 17 y 19) — Agència Tributària de Catalunya',
  verificado: '2026-09-08',
  vigencia: '2026',
  urlOficial: 'https://atc.gencat.cat/es/tributs/isd/herencies/reduccions/',
  urlNorma: 'https://www.boe.es/buscar/act.php?id=BOE-A-2010-10829',
  nota: 'Verificados el desglose del Grupo II, la reducción por vivienda habitual y la bonificación en cuota del art. 58 bis (99 % al cónyuge y dos escalas ponderadas distintas para los Grupos I y II). NO se modelan las reducciones de empresa familiar, participaciones, fincas rústicas ni patrimonio cultural o natural: si la herencia incluye alguna de ellas, la cuota real puede ser bastante menor, y además esas reducciones dividen por dos los porcentajes de bonificación.',
};

// ─── Reducción por empresa familiar (NO la modela ningún cálculo) ────────────
//
// Solo para la PROSA de las apps: las estimaciones no la aplican y lo dicen. Existe porque
// `estimador-impuesto-sucesiones` tecleaba «la familia mantenga los bienes 10 años» en la
// tarjeta de una viuda CATALANA, cuando la Ley 19/2010 pide cinco (Inspector, 25/09/2026).
// Verificado el 25/09/2026 contra el BOE: art. 20.2.c) LISD («otra del 95 por 100 […] durante
// los diez años siguientes al fallecimiento del causante») y arts. 6 y 9 de la Ley 19/2010
// (95 % y «durante los cinco años siguientes a la muerte del causante»).

export const REDUCCION_EMPRESA_FAMILIAR_IS = {
  porcentaje: 95,
  aniosMantenimiento: 10,
  norma: 'art. 20.2.c) de la Ley 29/1987 del ISD',
  urlOficial: 'https://www.boe.es/buscar/act.php?id=BOE-A-1987-28141',
  verificado: '2026-09-25',
};

export const REDUCCION_EMPRESA_FAMILIAR_CATALUNA_IS = {
  porcentaje: 95,
  aniosMantenimiento: 5,
  norma: 'arts. 6 y 9 de la Ley 19/2010',
  urlOficial: 'https://www.boe.es/buscar/act.php?id=BOE-A-2010-10829',
  verificado: '2026-09-25',
};

// ─── Bonificaciones autonómicas (17 CCAA) ────────────────────────────────────
//
// ⚠️ `notas` DESCRIBE, no califica. Las de Asturias y Canarias decían «Tributación más alta
// del régimen común» y «La más favorable del régimen común», y la propia herramienta las
// desmentía: con 300.000 € de un hijo, 0,00 € en Asturias y 53,69 € en Canarias (hallazgo
// 1825, §1.quinquies.6 del CLAUDE.md). Cuál sale más barata depende del caso. El `%` va
// separado con espacio duro (` `), como el resto del catálogo desde el 25/09/2026.

export const BONIFICACIONES_CCAA_IS: Record<string, BonificacionCCAA_IS> = {

  'madrid': {
    nombre: 'Comunidad de Madrid',
    regimen: 'comun',
    bonificaciones: {
      'I-conyuge':      { porcentaje: 0.99 },
      'I-descendiente': { porcentaje: 0.99 },
      'II':             { porcentaje: 0.99 },
      'II-ascendiente': { porcentaje: 0.99 },
      'III':            { porcentaje: 0.50 },
      'IV':             { porcentaje: 0 },
    },
    notas: 'Bonificación 99 % para Grupos I y II. Grupo III: 50 %. ⚠️ La Ley 3/2026, de 30 de junio, de Apoyo a la Empresa Familiar (BOE-A-2026-16019) añadió una reducción del 99 % EN BASE por transmisión de empresa individual, negocio profesional o participaciones, extendida a los Grupos I, II y III y a colaterales de cuarto grado, con requisitos de permanencia (5 años) y participación (5 % individual o 20 % del grupo familiar). Esta estimación NO la aplica: solo modela la bonificación en cuota por parentesco. Si la herencia incluye una empresa familiar, el resultado real puede ser bastante menor.',
  },

  // Andalucía — Ley 5/2021 (BOE-A-2021-17915, leída el 28/10/2026). Art. 39: los Grupos I y II
  // «aplicarán una bonificación del 99% en la cuota tributaria derivada de adquisiciones mortis
  // causa». No hay exención por importe: el millón es la reducción en base del art. 28, que está
  // en `MEJORAS_REDUCCIONES_CCAA_IS`, y la tarifa y los coeficientes son los propios de los arts. 37
  // y 38 (`TARIFAS_PROPIAS_CCAA_ISD`). Cabo C0495.
  'andalucia': {
    nombre: 'Andalucía',
    regimen: 'comun',
    bonificaciones: {
      'I-conyuge':      { porcentaje: 0.99 },
      'I-descendiente': { porcentaje: 0.99 },
      'II':             { porcentaje: 0.99 },
      'II-ascendiente': { porcentaje: 0.99 },
      'III':            { porcentaje: 0 },
      'IV':             { porcentaje: 0 },
    },
    notas: 'Tarifa propia (del 7 % al 26 %) y coeficientes propios (1,0 para los Grupos I y II, 1,5 para el III y 1,9 para el IV, sin escalones por patrimonio previo). Reducción de 1.000.000 € en la base para los Grupos I y II y de 10.000 € para el III, más 250.000 o 500.000 € con discapacidad. Sobre la cuota que quede, bonificación del 99 % para los Grupos I y II.',
  },

  'galicia': {
    nombre: 'Galicia',
    regimen: 'comun',
    bonificaciones: {
      'I-conyuge':      { porcentaje: 0.99, exencion: 1000000 },
      'I-descendiente': { porcentaje: 0.99, exencion: 1000000 },
      'II':             { porcentaje: 0.99, exencion: 1000000 },
      'II-ascendiente': { porcentaje: 0.99, exencion: 1000000 },
      'III':            { porcentaje: 0 },
      'IV':             { porcentaje: 0 },
    },
    notas: 'Exención total si base liquidable < 1.000.000 €. Si supera, bonificación 99 %.',
  },

  'murcia': {
    nombre: 'Región de Murcia',
    regimen: 'comun',
    bonificaciones: {
      'I-conyuge':      { porcentaje: 0.99 },
      'I-descendiente': { porcentaje: 0.99 },
      'II':             { porcentaje: 0.99 },
      'II-ascendiente': { porcentaje: 0.99 },
      'III':            { porcentaje: 0.50 },
      'IV':             { porcentaje: 0 },
    },
    notas: 'Bonificación 99 % Grupos I y II, 50 % Grupo III.',
  },

  'valencia': {
    nombre: 'Comunitat Valenciana',
    regimen: 'comun',
    bonificaciones: {
      'I-conyuge':      { porcentaje: 0.99 },
      'I-descendiente': { porcentaje: 0.99 },
      'II':             { porcentaje: 0.99 },
      'II-ascendiente': { porcentaje: 0.99 },
      'III':            { porcentaje: 0 },
      'IV':             { porcentaje: 0 },
    },
    notas: 'Bonificación 99 % para Grupos I y II.',
  },

  // 22/10/2026 (cabo C0146), cotejado en el BOE consolidado (BOE-A-2018-8159, texto del
  // 04/08/2026): art. 20 la bonificación del 99 % de los Grupos I y II; arts. 20 ter y 20 quater
  // extienden «los beneficios fiscales autonómicos vigentes para los grupos I y II» a las personas
  // con especial vinculación inscritas en el Registro Autonómico. Las mejoras de los arts. 17 y 18
  // (500.000 € por parentesco y la escala por discapacidad) están en `MEJORAS_REDUCCIONES_CCAA_IS`
  // desde el 22/10/2026 (C0371). Desde el 23/10/2026 (C0374, decisión del usuario) a la especial
  // vinculación se le extiende también la mejora de 500.000 € del art. 17, que sustituye a la
  // reducción estatal de su grupo: el art. 20 quater.1 habla de «los beneficios fiscales que se
  // encuentren vigentes en la normativa autonómica para los grupos I y II», sin acotarlos.
  // Una sola comunidad: el sello del módulo NO se mueve.
  'extremadura': {
    nombre: 'Extremadura',
    regimen: 'comun',
    especialVinculacion: {
      norma: 'arts. 20 ter y 20 quater DLeg 1/2018',
      quienes:
        'Descendientes de la pareja del causante, parejas de sus ascendientes, sobrinos de un causante sin descendientes directos y quien convivió con él sus tres últimos años (hasta cuatro, sin relación laboral de cuidados), inscritos en el Registro Autonómico de Personas con Especial Vinculación',
    },
    bonificaciones: {
      'I-conyuge':      { porcentaje: 0.99 },
      'I-descendiente': { porcentaje: 0.99 },
      'II':             { porcentaje: 0.99 },
      'II-ascendiente': { porcentaje: 0.99 },
      'III':            { porcentaje: 0 },
      'IV':             { porcentaje: 0 },
    },
    notas: 'Bonificación 99 % para Grupos I y II. Reducción de 500.000 € por parentesco para los Grupos I y II y de 60.000, 120.000 o 180.000 € por discapacidad, que sustituyen a las estatales (arts. 17 y 18 DLeg 1/2018).',
  },

  'canarias': {
    nombre: 'Canarias',
    regimen: 'comun',
    bonificaciones: {
      'I-conyuge':      { porcentaje: 0.999 },
      'I-descendiente': { porcentaje: 0.999 },
      'II':             { porcentaje: 0.999 },
      'II-ascendiente': { porcentaje: 0.999 },
      'III':            { porcentaje: 0.999 },
      'IV':             { porcentaje: 0 },
    },
    notas: 'Bonificación 99,9 % para Grupos I, II y III.',
  },

  'castilla-leon': {
    nombre: 'Castilla y León',
    regimen: 'comun',
    bonificaciones: {
      'I-conyuge':      { porcentaje: 0.99 },
      'I-descendiente': { porcentaje: 0.99 },
      'II':             { porcentaje: 0.99 },
      'II-ascendiente': { porcentaje: 0.99 },
      'III':            { porcentaje: 0 },
      'IV':             { porcentaje: 0 },
    },
    notas: 'Bonificación 99 % para Grupos I y II.',
  },

  'rioja': {
    nombre: 'La Rioja',
    regimen: 'comun',
    bonificaciones: {
      'I-conyuge':      { porcentaje: 0.99, tope: 500000, porcentajeMayor: 0.98 },
      'I-descendiente': { porcentaje: 0.99, tope: 500000, porcentajeMayor: 0.98 },
      'II':             { porcentaje: 0.99, tope: 500000, porcentajeMayor: 0.98 },
      'II-ascendiente': { porcentaje: 0.99, tope: 500000, porcentajeMayor: 0.98 },
      'III':            { porcentaje: 0 },
      'IV':             { porcentaje: 0 },
    },
    notas: 'Bonificación 99 % hasta 500.000 €, 98 % si supera ese importe.',
  },

  'castilla-mancha': {
    nombre: 'Castilla-La Mancha',
    regimen: 'comun',
    bonificaciones: {
      'I-conyuge':      { escalonado: [{ hasta: 175000, porcentaje: 1.00 }, { hasta: 225000, porcentaje: 0.95 }, { hasta: 275000, porcentaje: 0.90 }, { hasta: 300000, porcentaje: 0.85 }, { desde: 300000, porcentaje: 0.80 }] },
      'I-descendiente': { escalonado: [{ hasta: 175000, porcentaje: 1.00 }, { hasta: 225000, porcentaje: 0.95 }, { hasta: 275000, porcentaje: 0.90 }, { hasta: 300000, porcentaje: 0.85 }, { desde: 300000, porcentaje: 0.80 }] },
      'II':             { escalonado: [{ hasta: 175000, porcentaje: 1.00 }, { hasta: 225000, porcentaje: 0.95 }, { hasta: 275000, porcentaje: 0.90 }, { hasta: 300000, porcentaje: 0.85 }, { desde: 300000, porcentaje: 0.80 }] },
      'II-ascendiente': { escalonado: [{ hasta: 175000, porcentaje: 1.00 }, { hasta: 225000, porcentaje: 0.95 }, { hasta: 275000, porcentaje: 0.90 }, { hasta: 300000, porcentaje: 0.85 }, { desde: 300000, porcentaje: 0.80 }] },
      'III':            { porcentaje: 0 },
      'IV':             { porcentaje: 0 },
    },
    notas: 'Bonificación escalonada: 100 % hasta 175.000 €, decrece hasta 80 % si supera 300.000 €.',
  },

  'cantabria': {
    nombre: 'Cantabria',
    regimen: 'comun',
    bonificaciones: {
      'I-conyuge':      { escalonado: [{ hasta: 100000, porcentaje: 1.00 }, { desde: 100000, porcentaje: 0.99 }] },
      'I-descendiente': { escalonado: [{ hasta: 100000, porcentaje: 1.00 }, { desde: 100000, porcentaje: 0.99 }] },
      'II':             { escalonado: [{ hasta: 100000, porcentaje: 1.00 }, { desde: 100000, porcentaje: 0.99 }] },
      'II-ascendiente': { escalonado: [{ hasta: 100000, porcentaje: 1.00 }, { desde: 100000, porcentaje: 0.99 }] },
      'III':            { porcentaje: 0 },
      'IV':             { porcentaje: 0 },
    },
    notas: 'Exención total hasta 100.000 €, bonificación 99 % si supera.',
  },

  'aragon': {
    nombre: 'Aragón',
    regimen: 'comun',
    bonificaciones: {
      'I-conyuge':      { porcentaje: 1.00, limite: 3000000 },
      'I-descendiente': { porcentaje: 1.00, limite: 3000000 },
      'II':             { porcentaje: 1.00, limite: 3000000 },
      'II-ascendiente': { porcentaje: 1.00, limite: 3000000 },
      'III':            { porcentaje: 0 },
      'IV':             { porcentaje: 0 },
    },
    notas: 'Exención total hasta 3.000.000 € para Grupos I y II.',
  },

  'baleares': {
    nombre: 'Islas Baleares',
    regimen: 'comun',
    bonificaciones: {
      'I-conyuge':      { porcentaje: 0.99 },
      'I-descendiente': { porcentaje: 0.99 },
      'II':             { porcentaje: 0.95 },
      'II-ascendiente': { porcentaje: 0.95 },
      'III':            { porcentaje: 0 },
      'IV':             { porcentaje: 0 },
    },
    notas: 'Bonificación 99 % Grupo I, 95 % Grupo II.',
  },

  'asturias': {
    nombre: 'Principado de Asturias',
    regimen: 'comun',
    bonificaciones: {
      'I-conyuge':      { porcentaje: 0, reduccionBase: 300000 },
      'I-descendiente': { porcentaje: 0, reduccionBase: 300000 },
      'II':             { porcentaje: 0, reduccionBase: 300000 },
      'II-ascendiente': { porcentaje: 0, reduccionBase: 300000 },
      'III':            { porcentaje: 0, reduccionBase: 50000 },
      'IV':             { porcentaje: 0, reduccionBase: 0 },
    },
    notas: 'Sin bonificación autonómica en cuota. Reducción adicional en base de 300.000 € para los Grupos I y II y de 50.000 € para el Grupo III.',
  },

  'cataluna': {
    nombre: 'Cataluña',
    // ⚠️ Cataluña NO es territorio foral: los forales son País Vasco y Navarra. Aquí 'foral'
    // se usa como etiqueta interna de «se aparta del régimen común» (tarifa, reducciones y
    // coeficientes propios), que es lo que el motor necesita distinguir. No sirve para
    // rotularla ante el usuario, y por eso el selector del estimador dice «Normativa propia».
    regimen: 'foral',
    bonificaciones: {
      // Art. 58 bis.1: cónyuge y pareja estable, 99 % fijo con independencia de la base.
      'I-conyuge':      { porcentaje: BONIF_CONYUGE_CATALUNA_IS },
      // Art. 58 bis.2: el resto de los Grupos I y II, por escala ponderada — cada grupo la suya.
      'I-descendiente': { escalaPonderada: ESCALA_BONIF_CATALUNA_GRUPO_I_IS },
      'II':             { escalaPonderada: ESCALA_BONIF_CATALUNA_GRUPO_II_IS },
      'II-ascendiente': { escalaPonderada: ESCALA_BONIF_CATALUNA_GRUPO_II_IS },
      // Los Grupos III y IV quedan fuera del art. 58 bis: no tienen bonificación en cuota.
      'III':            { porcentaje: 0 },
      'IV':             { porcentaje: 0 },
    },
    notas: 'Tarifa propia (7 %–32 %) y reducciones propias de la Ley 19/2010: 100.000 € al cónyuge y al hijo, 50.000 € al resto de descendientes, 30.000 € a los ascendientes, y vivienda habitual al 95 % con tope de 500.000 € sobre el valor conjunto. La bonificación del art. 58 bis es del 99 % para el cónyuge y por escala ponderada para el resto de los Grupos I y II.',
  },

  'pais-vasco': {
    nombre: 'País Vasco',
    regimen: 'foral',
    bonificaciones: {
      'I-conyuge':      { porcentaje: 0.99 },
      'I-descendiente': { porcentaje: 0.99 },
      'II':             { porcentaje: 0.99 },
      'II-ascendiente': { porcentaje: 0.99 },
      'III':            { porcentaje: 0 },
      'IV':             { porcentaje: 0 },
    },
    notas: '⚠️ Régimen foral. Esta estimación es MUY APROXIMADA. Las 3 Haciendas Forales (Álava, Bizkaia, Gipuzkoa) tienen normativas distintas entre sí. CONSULTA OBLIGATORIA.',
  },

  'navarra': {
    nombre: 'Navarra',
    regimen: 'foral',
    bonificaciones: {
      'I-conyuge':      { porcentaje: 0.98 },
      'I-descendiente': { porcentaje: 0.98 },
      'II':             { porcentaje: 0.98 },
      'II-ascendiente': { porcentaje: 0.98 },
      'III':            { porcentaje: 0 },
      'IV':             { porcentaje: 0 },
    },
    notas: '⚠️ Régimen foral (Ley Foral 16/1997). Esta estimación es MUY APROXIMADA. Tarifas y reducciones propias de Navarra. CONSULTA OBLIGATORIA con asesor fiscal navarro.',
  },
};
