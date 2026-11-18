/**
 * Peaje de acceso 2.0TD — periodos horarios y días de valle completo
 *
 * El peaje 2.0TD lo tiene TODO suministro doméstico normal: es el de las redes de tensión no
 * superior a 1 kV con potencia contratada de 15 kW o menos en todos los periodos (art. 6.2.a). Lo
 * pagan igual quien está en el PVPC y quien está en el mercado libre: lo que en el mercado libre
 * puede ser plano es el precio de la ENERGÍA que fija la comercializadora, no el peaje.
 *
 * Fuente: Circular 3/2020 de la CNMC, arts. 6.2.a y 7.3 (BOE-A-2020-1066, consolidada a
 * 05/02/2025). Verificado: 2026-11-18, leyendo el texto consolidado en el BOE.
 *   · Art. 7.3: son valle (periodo 3) «todas las horas de los sábados, domingos, el 6 de enero y
 *     los días festivos de ámbito nacional», «con exclusión tanto de los festivos sustituibles como
 *     de los que no tienen fecha fija». Viernes Santo (sin fecha fija) y los festivos que una
 *     comunidad sustituye por otro día se facturan como laborables.
 *   · Franjas de lunes a viernes laborables en la península, Illes Balears y Canarias: P1 10-14 h y
 *     18-22 h · P2 8-10 h, 14-18 h y 22-24 h · P3 0-8 h. Ceuta y Melilla tienen su propio horario
 *     en la misma tabla, que ninguna app usa todavía: se añade aquí, con su cita, cuando una lo pida.
 *
 * Hasta el 18/11/2026 selector-tarifa-electrica daba valle las 24 horas en CUALQUIER festivo
 * nacional, en cuatro textos escritos a mano (hallazgo 4537, decisión del usuario en /reparar
 * pendientes): por eso la regla vive aquí y las cuatro bocas la leen.
 */

export const FISCAL_PEAJES_ELECTRICOS_META = {
  fuente: 'Circular 3/2020 de la CNMC, arts. 6.2.a y 7.3 (BOE-A-2020-1066, consolidada a 05/02/2025)',
  verificado: '2026-11-18',
  vigencia: '2026',
  urlOficial: 'https://www.boe.es/buscar/act.php?id=BOE-A-2020-1066',
};

/** Ámbito del peaje 2.0TD (art. 6.2.a). */
export const PEAJE_2_0TD_AMBITO = {
  tensionMaximaKv: 1,
  potenciaMaximaKw: 15,
};

/** Franjas de lunes a viernes laborables en la península, Illes Balears y Canarias (art. 7.3). */
export const FRANJAS_2_0TD_PENINSULA = {
  punta: '10-14 h y 18-22 h',
  llano: '8-10 h, 14-18 h y 22-24 h',
  valle: '0-8 h',
};

/** Días que son valle las 24 horas (art. 7.3), listo para ir detrás de «todo el día los…». */
export const DIAS_VALLE_COMPLETO_2_0TD =
  'sábados, domingos, el 6 de enero y los festivos nacionales de fecha fija no sustituibles';

/** Lo que el art. 7.3 deja FUERA del valle completo, para quien pregunte por un festivo. */
export const FESTIVOS_FUERA_DEL_VALLE_2_0TD =
  'Los festivos nacionales sin fecha fija, como Viernes Santo, y los que una comunidad sustituye por otro día se facturan como laborables, igual que los autonómicos y los locales';
