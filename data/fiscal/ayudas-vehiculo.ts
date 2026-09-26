/**
 * Datos normativos: ayuda estatal a la compra de vehículos eléctricos — España
 *
 * ⚠️ HERRAMIENTA DE ORIENTACIÓN — No constituye asesoramiento.
 *
 * Fuente: Real Decreto 609/2026, de 22 de julio, por el que se regula la concesión directa de
 * ayudas a la compra de vehículos eléctricos y electrificados (Programa Auto+), BOE-A-2026-16010.
 * Anexo I (definiciones) y Anexo II (cuantías de la línea 1, particulares).
 *
 * Verificado: 2026-09-26 (texto del BOE leído en sesión)
 * Vigencia: vehículos matriculados desde el 01/01/2026 (disposición transitoria primera);
 * programa hasta el 31/12/2030, con solicitudes cada año hasta el 15 de octubre.
 *
 * POR QUÉ EXISTE (26/09/2026, hallazgos 1996, 1997 y 2054 del Inspector)
 * ─────────────────────────────────────────────────────────────────────────
 * Tres apps escribían a mano el MOVES III (4.500 € y 7.000 € con achatarramiento) como ayuda
 * vigente nueve meses después de que terminara: el preámbulo del RD 609/2026 dice que el
 * Programa MOVES «ha estado vigente entre los años 2019 y 2025». Sin módulo, el cambio no
 * llegó al Vigía Normativo. La ayuda de Auto+ no es una cantidad fija: es un MÁXIMO que se
 * alcanza sumando criterios, y no tiene tramo por achatarramiento.
 *
 * ⚠️ ACTUALIZACIÓN NECESARIA: cada ejercicio puede cambiar la dotación; comprobar que el RD
 * 609/2026 no se ha modificado en las cuantías ni en los porcentajes del Anexo II.
 */

export const FISCAL_AYUDAS_VEHICULO_META = {
  fuente: 'Real Decreto 609/2026, de 22 de julio (Programa Auto+), Anexo II',
  verificado: '2026-09-26',
  vigencia: '2026-2030',
  urlOficial: 'https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-16010',
};

/** El programa anterior, solo como referencia histórica: NO es una ayuda vigente. */
export const MOVES_III_HISTORICO = {
  nombre: 'Programa MOVES III',
  norma: 'Real Decreto 266/2021',
  vigencia: '2019-2025',
  finalizado: '2025-12-31',
};

/**
 * Programa Auto+, línea 1 (particulares). Importes máximos por vehículo y porcentajes del
 * máximo que aporta cada criterio (acumulativos). Precios en factura, SIN impuestos y tras
 * los descuentos comerciales.
 */
export const AYUDA_AUTO_PLUS_2026 = {
  nombre: 'Programa Auto+',
  matriculadosDesde: '2026-01-01',
  vigenteHasta: '2030-12-31',
  solicitudAnualHasta: '15 de octubre',
  /** Máximo por vehículo, en €. */
  maximo: {
    turismo: 4500,      // M1
    furgoneta: 5000,    // N1
    motocicleta: 1100,  // L3e, L4e, L5e
    cuadriciclo: 1500,  // L6e, L7e
  },
  /** Criterio eléctrico (E1): BEV y pila de combustible 50 %; EREV y PHEV 25 %. */
  criterioElectrico: { puro: 0.5, electrificado: 0.25 },
  /** Criterio económico (E2) de un turismo: 25 % hasta 35.000 €; 15 % hasta 45.000 €. */
  criterioEconomicoTurismo: [
    { precioMaxSinImpuestos: 35000, porcentaje: 0.25 },
    { precioMaxSinImpuestos: 45000, porcentaje: 0.15 },
  ],
  /** Por encima de este precio (sin impuestos) un turismo no recibe ayuda. */
  precioMaxTurismoSinImpuestos: 45000,
  /**
   * Criterio europeo (E3) de un turismo: 15 % por montaje en la UE, y un 10 % ADICIONAL solo
   * para eléctricos puros que cumplan a la vez varias condiciones (entre ellas, la batería
   * fabricada en la UE). No se modela como cálculo: sus condiciones no caben en un formulario.
   */
  criterioEuropeo: { montajeUE: 0.15, adicionalPuroBateriaUE: 0.1 },
  /**
   * El texto leído el 26/09/2026 no deja claro qué criterios, además del eléctrico, suman en
   * las motocicletas: se publica solo su máximo. Las apps NO calculan la ayuda: piden la que
   * corresponda al usuario (0 por defecto) y remiten a la fuente.
   */
};
