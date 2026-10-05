/**
 * data/fiscal/premios-loterias.ts
 * Gravamen especial sobre los premios de determinadas loterías y apuestas
 * (disposición adicional 33.ª de la Ley 35/2006 del IRPF).
 *
 * Nace el 05/10/2026 (S0180) para el reparto de un premio de peña en generador-loteria.
 * Hasta entonces las cifras vivían como texto en la FAQ de esa app (hallazgo 2734), porque
 * nada las calculaba; en cuanto una app las CALCULA, van aquí.
 *
 * Cotejado en sesión contra el texto consolidado del BOE (BOE-A-2006-20764, DA 33.ª, última
 * actualización publicada el 04/07/2018, en vigor desde el 05/07/2018):
 *   · ap. 1  — el gravamen se exige de forma independiente por cada décimo, fracción o cupón
 *              de lotería o apuesta premiados.
 *   · ap. 2  — exentos los premios de importe íntegro igual o inferior a 40.000 € (redacción
 *              del art. 67.1 de la Ley 6/2018); por encima, tributa solo el exceso. La exención
 *              se REDUCE proporcionalmente si el décimo, fracción, cupón o apuesta cuesta menos
 *              de 0,50 €. Si el premio es de titularidad compartida, la exención se prorratea
 *              entre los cotitulares según su cuota.
 *   · ap. 3  — base = premio − exención; también se prorratea por cuotas si es compartido.
 *   · ap. 4  — tipo del 20 %.
 *   · ap. 6  — retención o ingreso a cuenta del 20 % sobre esa misma base.
 *   · ap. 7  — no hay que autoliquidar si se practicó la retención.
 *   · ap. 8  — el premio no se integra en la base imponible del IRPF.
 *
 * Lo que dice la sede de la AEAT (nivel 3: sirve para entender, NO para sellar) en su nota del
 * 15/12/2025 sobre la Lotería de Navidad: en los premios compartidos (amigos, familia, peñas,
 * cofradías…) quien cobra como beneficiario único o gestor «deberá estar en condiciones de
 * acreditar ante la Administración Tributaria que el premio ha sido repartido», identificando
 * a cada ganador y su porcentaje.
 *
 * Casos resueltos a mano en tests/reparto-pena-motor.spec.ts.
 */

// ─── Metadatos ───────────────────────────────────────────────────────────────

export const FISCAL_PREMIOS_LOTERIAS_META = {
  fuente: 'Ley 35/2006 del IRPF, disposición adicional 33.ª (redacción de la Ley 6/2018)',
  verificado: '2026-10-05',
  vigencia: '2020-2026',
  urlOficial: 'https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764#datrigesimatercera',
  nota: 'Se aplica a los premios de SELAE, de las loterías autonómicas, de la ONCE y de los sorteos de Cruz Roja, y a los equivalentes de otros Estados de la UE o del EEE. Exento hasta 40.000 € por décimo o apuesta desde 2020 (10.000 € en los juegos de 2018 desde el 05/07/2018 y 20.000 € en los de 2019: disposición transitoria 35.ª de la LIRPF, añadida por el art. 67.2 de la Ley 6/2018).',
};

/** Importe exento por décimo, fracción, cupón o apuesta (DA 33.ª.2). */
export const EXENCION_PREMIO_LOTERIA = 40_000;

/** Tipo del gravamen especial y de su retención (DA 33.ª.4 y 33.ª.6). */
export const TIPO_GRAVAMEN_PREMIO_LOTERIA = 0.2;

/** Por debajo de este importe jugado, la exención se reduce en proporción (DA 33.ª.2). */
export const IMPORTE_MINIMO_EXENCION_COMPLETA = 0.5;

export interface GravamenPremio {
  /** Parte del premio exenta, ya reducida si el importe jugado es menor de 0,50 € */
  exento: number;
  /** Base del gravamen: lo que excede de la exención */
  base: number;
  /** 20 % de la base: cuota y retención coinciden */
  retencion: number;
  /** Lo que llega: premio íntegro − retención */
  neto: number;
}

/**
 * Exención aplicable a UN décimo, fracción, cupón o apuesta según lo que costó.
 * Con 0,50 € o más, los 40.000 € enteros; con menos, en proporción (0,25 € → 20.000 €).
 */
export function exencionPorImporteJugado(importeJugado: number): number {
  if (!(importeJugado > 0)) return 0;
  if (importeJugado >= IMPORTE_MINIMO_EXENCION_COMPLETA) return EXENCION_PREMIO_LOTERIA;
  return (EXENCION_PREMIO_LOTERIA * importeJugado) / IMPORTE_MINIMO_EXENCION_COMPLETA;
}

/**
 * Gravamen de UN décimo o apuesta premiados, entero (sin repartir entre cotitulares).
 * Repartirlo después por cuotas da lo mismo que prorratear exención y base por separado,
 * como dice la norma, porque todas las operaciones son proporcionales.
 */
export function gravamenPremio(premioIntegro: number, importeJugado: number): GravamenPremio {
  const premio = Math.max(0, premioIntegro);
  const exento = Math.min(premio, exencionPorImporteJugado(importeJugado));
  const base = premio - exento;
  const retencion = base * TIPO_GRAVAMEN_PREMIO_LOTERIA;
  return { exento, base, retencion, neto: premio - retencion };
}
