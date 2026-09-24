'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
  DisclaimerCard,
  RegionBadge,
  DataReference,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatNumber, formatCurrency } from '@/lib';
import {
  FISCAL_SUCESIONES_META,
  TARIFA_ESTATAL_IS,
  TARIFA_CATALUNA_IS,
  REDUCCIONES_PARENTESCO_IS,
  REDUCCIONES_PARENTESCO_CATALUNA_IS,
  BONIFICACIONES_CCAA_IS,
  COEFICIENTES_IS,
  COEFICIENTES_CATALUNA_IS,
  coeficienteIIVTNU,
  REDUCCION_VIVIENDA_PORC_IS,
  PORC_AJUAR_DOMESTICO_IS,
  REDUCCION_VIVIENDA_MAX_IS,
  REDUCCION_VIVIENDA_MAX_CATALUNA_IS,
  REDUCCION_VIVIENDA_ANIOS_MANTENIMIENTO_IS,
  REDUCCION_VIVIENDA_ANIOS_MANTENIMIENTO_CATALUNA_IS,
  REDUCCION_EDAD_MENOR_21_IS,
  REDUCCION_EDAD_MENOR_21_MAX_IS,
  REDUCCION_EDAD_MENOR_21_CATALUNA_IS,
  REDUCCION_EDAD_MENOR_21_MAX_CATALUNA_IS,
  desglosarCuotaBaseAhorro,
  TRAMOS_GANANCIAS_PATRIMONIALES_2025,
  PLUSVALIA_MUNICIPAL_META,
  GANANCIAS_PATRIMONIALES_META,
  PLAZO_ISD,
  PLAZO_IIVTNU,
} from '@/data/fiscal';

/**
 * La escala de la base del ahorro, LEÍDA de data/fiscal. Iba escrita a mano dos veces en
 * este fichero —la nota de la tarjeta del IRPF y el desglose de la FAQ— aunque la propia
 * página ya consume `desglosarCuotaBaseAhorro`. Residuo exacto del hallazgo 463, que derivó
 * la escala en `metadata.ts` y dejó estas dos copias (hallazgo 609).
 */
const ESCALA_AHORRO = TRAMOS_GANANCIAS_PATRIMONIALES_2025;
const TIPOS_AHORRO = ESCALA_AHORRO.map((t) => `${t.tipo}%`).join(' / ');
const TIPO_AHORRO_MIN = ESCALA_AHORRO[0].tipo;
const TIPO_AHORRO_MAX = ESCALA_AHORRO[ESCALA_AHORRO.length - 1].tipo;
import {
  calcularCuotaIntegraIS,
  evaluarReduccionVivienda,
  porcentajeBonificacionPonderada,
  EDAD_MIN_COLATERAL_VIVIENDA_IS,
  type GrupoParentescoIS,
} from '@/lib/calculadoras/sucesiones';
import { ESCALA_RECARGO_EXTEMPORANEO } from '@/lib/calculadoras/recargoPresentacionTardia';
import styles from './SimuladorHeredarVivienda.module.css';

/**
 * El 95 % del art. 20.2.c LISD, LEÍDO de data/fiscal. Aparecía escrito a mano en las cinco
 * frases que lo citan —etiqueta de la casilla, línea del panel, dos tarjetas educativas y la
 * FAQ— mientras su tope viajaba derivado (`REDUCCION_VIVIENDA_MAX_IS`) en esas mismas
 * frases: el porcentaje y el tope de la misma reducción, uno a mano y el otro no
 * (hallazgo 658). Cataluña usa el mismo porcentaje con otro tope, así que la cifra vale para
 * los dos regímenes.
 */
const PORC_REDUCCION_VIVIENDA = formatNumber(REDUCCION_VIVIENDA_PORC_IS * 100, 0);
/** 3 % del art. 15 LISD, para el rótulo del ajuar. */
const PORC_AJUAR = formatNumber(PORC_AJUAR_DOMESTICO_IS * 100, 0);

/**
 * El coeficiente multiplicador del Grupo IV con el patrimonio preexistente más bajo, que es
 * el supuesto que simula esta app (índice 0). La tarjeta educativa lo escribía a mano en la
 * misma frase en la que SÍ derivaba el otro extremo de la fila (hallazgo 658).
 */
const COEF_GRUPO_IV_MIN = COEFICIENTES_IS['IV'][0];

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Parentesco = 'conyuge' | 'hijo_menor21' | 'hijo' | 'nieto' | 'padre' | 'hermano' | 'sin_parentesco';

interface ResultadoISD {
  /** Valor declarado de la vivienda, ANTES de sumarle el ajuar. */
  caudalRelicto: number;
  /** Ajuar doméstico del art. 15 LISD: 3 % del caudal, presunción destruible con prueba. */
  ajuarDomestico: number;
  baseImponible: number;
  reduccionParentesco: number;
  reduccionVivienda: number;
  /** Reducción propia de la CCAA sobre la BASE (hoy solo Asturias: 300.000 € Grupos I-II) */
  reduccionAutonomica: number;
  /** Por qué NO se ha aplicado la reducción de vivienda habitual, si el usuario la marcó */
  viviendaNoAplicada: string | null;
  baseLiquidable: number;
  cuotaIntegra: number;
  coeficiente: number;
  cuotaTributaria: number;
  bonificacion: number;
  cuotaFinal: number;
  grupo: string;
  ccaaNombre: string;
  bonificacionPorc: number;
}

interface ResultadoPlusvalia {
  metodoObjetivo: number;
  metodoReal: number;
  metodoElegido: 'objetivo' | 'real' | 'exenta';
  cuotaFinal: number;
  aniosTenencia: number;
  coeficiente: number;
}

interface ResultadoIRPF {
  valorAdquisicionFiscal: number;
  /** Precio de venta MENOS la plusvalía municipal de esa venta (art. 35.2 LIRPF). */
  valorTransmision: number;
  ganancia: number;
  cuota: number;
  desglose: Array<{ desde: number; hasta: number; tipo: number; aplicado: number; cuota: number }>;
  esPerdida: boolean;
}

// ─── Datos auxiliares ─────────────────────────────────────────────────────────

/**
 * Cada opción tiene que significar algo DISTINTO, y su `reducKey` es la fila que se lee
 * en `data/fiscal/sucesiones.ts` — no el número del grupo.
 *
 * Antes había dos opciones («Hermano / Tío / Sobrino» y «Pariente lejano (Grupo III)») que
 * compartían grupo y clave, así que devolvían exactamente el mismo resultado, y el sobrino
 * aparecía nombrado en las dos. Y «Cónyuge / Hijo / Descendiente ≥21» iba rotulada Grupo II
 * leyendo la fila `I-conyuge`: en régimen común da igual (las cuatro filas valen 15.956,87 €)
 * pero en Cataluña NO, porque allí cada parentesco reduce lo suyo.
 *
 * ⚠️ Corregido el 08/09/2026: este comentario afirmaba que en Cataluña «el hijo ≥21 reduce
 * 50.000 €». No es cierto —el art. 2 de la Ley 19/2010 le da 100.000 €, y son 50.000 € los
 * del NIETO—, y el dato mal escrito aquí era el mismo que servía `data/fiscal`. Por eso el
 * nieto tiene ahora opción propia: mientras compartía fila con el hijo, uno de los dos tenía
 * que salir mal por fuerza.
 */
/**
  * Las comunidades de RÉGIMEN COMÚN cuya bonificación al Grupo II es un porcentaje FIJO de al
  * menos el 99 %, leídas de `BONIFICACIONES_CCAA_IS`. La tarjeta educativa las listaba a mano y
  * contaba una versión que el motor de la misma página no calcula (hallazgo 465): metía a
  * Castilla-La Mancha, que no tiene porcentaje fijo sino un escalonado que cae al 80 % por
  * encima de 300.000 € de base —ahí la cuota no es «casi cero», son 8.416,51 €—, ponía a
  * Cantabria como «99 %» cuando lo suyo es una exención por tramos (100 % hasta 100.000 €, 99 %
  * a partir de ahí), y dejaba fuera a Canarias, que es la más generosa del régimen común.
  *
  * El filtro por `regimen !== 'foral'` es del hallazgo 502: sin él, entraba también País Vasco
  * (0,99 fijo), cuyas propias notas piden consulta obligatoria a la Hacienda Foral — la frase
  * que acompaña esta lista habla del régimen común, y meter ahí una comunidad foral la
  * contradecía. Derivada, la lista no puede volver a mentir.
  */
const CCAA_BONIFICACION_CASI_TOTAL = Object.values(BONIFICACIONES_CCAA_IS)
  .filter((c) => c.regimen !== 'foral' && typeof c.bonificaciones['II']?.porcentaje === 'number' && (c.bonificaciones['II'].porcentaje as number) >= 0.99)
  .map((c) => c.nombre);

const PARENTESCOS: Array<{ id: Parentesco; label: string; grupo: string; reducKey: GrupoParentescoIS }> = [
  { id: 'conyuge', label: 'Cónyuge o pareja estable (Grupo II)', grupo: 'II', reducKey: 'I-conyuge' },
  // El Grupo I no era expresable: el desplegable no lo ofrecía y el deslizador de edad
  // arrancaba en 18, así que un heredero de 10 años solo podía simularse como Grupo II, sin
  // la reducción del art. 20.2.a LISD que `data/fiscal` ya exportaba (hallazgo 612).
  { id: 'hijo_menor21', label: 'Hijo o descendiente <21 años (Grupo I)', grupo: 'I', reducKey: 'I-descendiente' },
  { id: 'hijo', label: 'Hijo o hija ≥21 años (Grupo II)', grupo: 'II', reducKey: 'II' },
  { id: 'nieto', label: 'Nieto u otro descendiente ≥21 años (Grupo II)', grupo: 'II', reducKey: 'II-descendiente' },
  { id: 'padre', label: 'Padre / Ascendiente (Grupo II)', grupo: 'II', reducKey: 'II-ascendiente' },
  { id: 'hermano', label: 'Hermano / Tío / Sobrino (Grupo III)', grupo: 'III', reducKey: 'III' },
  { id: 'sin_parentesco', label: 'Primo, pariente lejano o sin parentesco (Grupo IV)', grupo: 'IV', reducKey: 'IV' },
];

const CCAA_LIST: Array<{ id: string; label: string }> = [
  { id: 'madrid', label: 'Comunidad de Madrid' },
  { id: 'andalucia', label: 'Andalucía' },
  { id: 'galicia', label: 'Galicia' },
  { id: 'murcia', label: 'Región de Murcia' },
  { id: 'valencia', label: 'Comunitat Valenciana' },
  { id: 'extremadura', label: 'Extremadura' },
  { id: 'canarias', label: 'Canarias' },
  { id: 'castilla-leon', label: 'Castilla y León' },
  { id: 'rioja', label: 'La Rioja' },
  { id: 'castilla-mancha', label: 'Castilla-La Mancha' },
  { id: 'cantabria', label: 'Cantabria' },
  { id: 'aragon', label: 'Aragón' },
  { id: 'baleares', label: 'Islas Baleares' },
  { id: 'asturias', label: 'Principado de Asturias' },
  { id: 'cataluna', label: 'Cataluña' },
  { id: 'pais-vasco', label: 'País Vasco (orientativo)' },
  { id: 'navarra', label: 'Navarra (orientativo)' },
];

interface CasoPreconfigurado {
  id: string;
  nombre: string;
  descripcion: string;
  parentesco: Parentesco;
  edad: number;
  ccaa: string;
  anioAdquisicion: number;
  valorAdquisicion: number;
  valorReferencia: number;
  valorCatastralSuelo: number;
  valorCatastralTotal: number;
  viviendaHabitual: boolean;
  aniosHastaVenta: number;
  valorVenta: number;
}

const CASOS: CasoPreconfigurado[] = [
  {
    id: 'madrid-hijo',
    nombre: 'Hijo hereda piso 200k en Madrid',
    descripcion: 'Vivienda habitual del padre, Madrid bonifica 99%',
    parentesco: 'hijo',
    edad: 45,
    ccaa: 'madrid',
    anioAdquisicion: 1995,
    valorAdquisicion: 80000,
    valorReferencia: 200000,
    valorCatastralSuelo: 60000,
    valorCatastralTotal: 120000,
    viviendaHabitual: true,
    aniosHastaVenta: 5,
    valorVenta: 250000,
  },
  {
    id: 'cataluna-conyuge',
    nombre: 'Cónyuge hereda piso 350k en Cataluña',
    descripcion: 'Tarifa propia Cataluña, reducción cónyuge 100k',
    parentesco: 'conyuge',
    edad: 60,
    ccaa: 'cataluna',
    anioAdquisicion: 2000,
    valorAdquisicion: 150000,
    valorReferencia: 350000,
    valorCatastralSuelo: 100000,
    valorCatastralTotal: 200000,
    viviendaHabitual: true,
    aniosHastaVenta: 3,
    valorVenta: 400000,
  },
  {
    id: 'pais-vasco-hermano',
    nombre: 'Hermano hereda piso 150k en País Vasco',
    descripcion: 'Régimen foral, Grupo III sin bonificación',
    parentesco: 'hermano',
    edad: 55,
    ccaa: 'pais-vasco',
    anioAdquisicion: 1990,
    valorAdquisicion: 50000,
    valorReferencia: 150000,
    valorCatastralSuelo: 45000,
    valorCatastralTotal: 90000,
    viviendaHabitual: false,
    aniosHastaVenta: 2,
    valorVenta: 180000,
  },
  {
    id: 'andalucia-sobrino',
    nombre: 'Sobrino hereda piso 250k en Andalucía',
    descripcion: 'Grupo III sin bonificación autonómica',
    parentesco: 'hermano',
    edad: 40,
    ccaa: 'andalucia',
    anioAdquisicion: 2005,
    valorAdquisicion: 120000,
    valorReferencia: 250000,
    valorCatastralSuelo: 75000,
    valorCatastralTotal: 150000,
    viviendaHabitual: false,
    aniosHastaVenta: 1,
    valorVenta: 280000,
  },
];

// ─── Lógica de cálculo ────────────────────────────────────────────────────────

/**
 * El tipo lo fija cada Ayuntamiento. `PLUSVALIA_MUNICIPAL_META` declara DOS valores y aquí
 * hay que usar el orientativo (25 %), no el máximo legal (30 %): la interfaz rotula
 * «Tipo municipal (orientativo)», así que tomar el techo sobreestimaba la plusvalía un 20 %
 * en todos los casos, y de rebote el IRPF (la cuota pagada engorda el valor de adquisición
 * fiscal) y el total. Hardcodeado además, contra la regla de CLAUDE.md.
 */
const TIPO_MUNICIPAL_PLUSVALIA = PLUSVALIA_MUNICIPAL_META.tipoOrientativo / 100;

/**
 * Año de partida del primer render, el mismo en servidor y en cliente para que la
 * hidratación no discrepe. El año REAL lo pone `useEffect` nada más montar: antes esto era
 * una constante `2025` y con ella se congelaban la tenencia del causante (que decide el
 * coeficiente del IIVTNU) y el tope del deslizador de año de adquisición.
 */
const ANIO_REFERENCIA = 2026;

/**
 * La cuota íntegra la calcula `calcularCuotaIntegraIS`, el mismo helper que usan
 * `lib/calculadoras/sucesiones.ts` (MCP Delegum y GPT), `estimador-impuesto-sucesiones` y
 * `estimador-impuesto-donaciones`.
 *
 * Hasta el 24/08/2026 esta app tenía aquí su propia versión, que acumulaba los tramos
 * marginales e ignoraba la columna `cuota` que declara cada fila de `TARIFA_ESTATAL_IS`.
 * Como esa columna arrastra los redondeos a céntimo con los que el BOE la publica, las dos
 * lecturas no tienen por qué coincidir, y dos apps fiscales de meskeIA daban cuotas distintas
 * para la misma herencia (hallazgo 277 del Inspector). Manda la tabla publicada.
 *
 * (Las divergencias de euros que este comentario citaba hasta el 11/09/2026 no eran de la ley:
 *  venían de que `TARIFA_ESTATAL_IS` tenía entonces siete tramos mal emparejados — hallazgo
 *  735. Con la escala del art. 21.2 bien transcrita la diferencia máxima es de 0,0045 €.)
 */

/** Edad mínima del colateral (Grupo III) para la reducción de vivienda habitual, art. 20.2.c LISD */
const EDAD_MIN_COLATERAL_VIVIENDA = EDAD_MIN_COLATERAL_VIVIENDA_IS;

/**
 * Redondeo al céntimo de CADA importe de la liquidación.
 *
 * ── De dónde sale la regla (hallazgo 657, 09/09/2026) ─────────────────────────
 * Es literalmente el helper `r` de `calcularSucesion` en `lib/calculadoras/sucesiones.ts`
 * —`Math.round(n * 100) / 100`—, aplicado en los MISMOS pasos: reducciones, base
 * liquidable, cuota íntegra, cuota tributaria, bonificación y cuota final. Una liquidación
 * del ISD se expresa al céntimo en cada concepto, no solo en el total.
 *
 * Hasta el 09/09/2026 esta app redondeaba solo AL PINTAR (`formatCurrency`) y la cadena
 * seguía por dentro con el número largo, así que la multiplicación y la resta escritas en
 * pantalla no daban el número de debajo: el panel decía «4335,91 × 2,0000 = 8671,83», y
 * 4.335,91 × 2 son 8.671,82. En un barrido de las 2.233.392 combinaciones alcanzables con
 * los deslizadores la cadena impresa no cuadraba en 787.942 (35 %); con este redondeo
 * cuadra en las 2.233.392.
 *
 * La bonificación se redondea ANTES de restarla, y así lo hace también el motor compartido
 * desde el commit 0a2fa220 (09/09/2026): `calcularSucesion` publica `bonificacionPublicada`
 * y resta ESA, no la larga. Los dos coinciden hoy al céntimo, incluido el caso que separaba
 * a los dos (hijo de 45 años, Castilla-La Mancha, 400.000 € de vivienda habitual: cuota
 * tributaria 26.782,55 €, bonificación del 90 % = 24.104,30 € y cuota final 2.678,25 € por
 * ambas vías).
 *
 * ⚠️ Hasta el 10/09/2026 estas líneas seguían documentando esa divergencia como VIGENTE —y
 * la daban como razón escrita para NO llamar al motor, con un recuento de 20.104
 * combinaciones (0,9 %) que ya no existían—. El riesgo no era cosmético: quien la leyera la
 * habría dado por buena sin medirla (hallazgo 697 del Inspector).
 */
const redondearCentimos = (n: number): number => Math.round(n * 100) / 100;

function calcularISD(
  valorReferencia: number,
  parentesco: Parentesco,
  ccaa: string,
  viviendaHabitual: boolean,
  edad: number,
  convivioDosAnios: boolean
): ResultadoISD {
  const parentescoData = PARENTESCOS.find(p => p.id === parentesco) ?? PARENTESCOS[0];
  const grupo = parentescoData.grupo;
  const reducKey = parentescoData.reducKey;

  const ccaaInfo = BONIFICACIONES_CCAA_IS[ccaa];
  const ccaaNombre = ccaaInfo?.nombre ?? 'Régimen común';
  const esCataluna = ccaa === 'cataluna';
  // Ninguna comunidad bonifica distinto al nieto que al hijo —la distinción del art. 2 de la
  // Ley 19/2010 es solo de reducción en base—, y `bonificaciones['II-descendiente']` no existe
  // en ninguna de las 17: sin colapsarlo, el nieto perdería el 99 % de bonificación.
  const bonifGrupo = ccaaInfo?.bonificaciones[reducKey === 'II-descendiente' ? 'II' : reducKey];

  /**
   * Ajuar doméstico (art. 15 LISD): se presume en el 3 % del caudal relicto salvo prueba en
   * contrario, y forma parte de la masa hereditaria — no es un gasto ni una reducción.
   *
   * ⚠  Hasta el 13/09/2026 no entraba en la base ni se mencionaba en ninguna parte de la
   * página, mientras la app hermana `estimador-impuesto-sucesiones` y el motor compartido
   * `calcularSucesion` (tools del MCP) sí lo sumaban: la MISMA herencia tenía dos respuestas
   * en meskeIA según por dónde se preguntara (hallazgo 780 del Inspector). En un Grupo IV de
   * 1.500.000 € sin bonificación, la diferencia son 30.600 € de cuota.
   *
   * La presunción se destruye con prueba, así que el panel lo dice en su línea propia en vez
   * de esconderlo dentro de la base. No se le aplica la minoración del art. 15 in fine (3 %
   * del valor catastral de la vivienda habitual del causante, que corresponde al cónyuge
   * superviviente): esta app no modela ese supuesto, y aplicarla a un hijo sería inventarlo.
   */
  const caudalRelicto = valorReferencia;
  const ajuarDomestico = redondearCentimos(caudalRelicto * PORC_AJUAR_DOMESTICO_IS);
  const baseImponible = redondearCentimos(caudalRelicto + ajuarDomestico);

  // Reducción por parentesco
  const reducciones = esCataluna ? REDUCCIONES_PARENTESCO_CATALUNA_IS : REDUCCIONES_PARENTESCO_IS;
  const reduccionBaseParentesco = reducciones[reducKey] ?? 0;

  /**
   * Incremento del Grupo I por cada año menos de 21: la reducción de parentesco sube 3.990,72 €
   * por año sin que el TOTAL exceda de 47.858,59 € (art. 20.2.a LISD), y en Cataluña 12.000 €
   * por año con tope de 196.000 € (art. 2 Ley 19/2010).
   *
   * Cataluña se saltaba entera esta figura porque `data/fiscal` no traía sus cuantías. Desde
   * el 08/09/2026 sí las trae, verificadas en el BOE y en la Agència Tributària, así que ya no
   * hay que elegir entre inventarse el dato estatal y no dar ninguno.
   */
  const anosPorDebajo = grupo === 'I' ? Math.max(0, 21 - edad) : 0;
  const reduccionParentesco = redondearCentimos(
    anosPorDebajo > 0
      ? Math.min(
          reduccionBaseParentesco + anosPorDebajo * (esCataluna ? REDUCCION_EDAD_MENOR_21_CATALUNA_IS : REDUCCION_EDAD_MENOR_21_IS),
          esCataluna ? REDUCCION_EDAD_MENOR_21_MAX_CATALUNA_IS : REDUCCION_EDAD_MENOR_21_MAX_IS,
        )
      : reduccionBaseParentesco
  );

  /**
   * Reducción por vivienda habitual: 95 % hasta 122.606,47 € en régimen común (art. 20.2.c
   * LISD) y hasta 500.000 € en Cataluña (art. 17 Ley 19/2010).
   *
   * La regla ya NO se escribe aquí: la sirve `evaluarReduccionVivienda` del motor de
   * sucesiones, el mismo que ejecutan las tools `calcular_sucesiones` y `consulta_herencia`
   * del MCP Delegum. Estaba escrita dos veces y las dos copias divergieron: por MCP un
   * hermano de 40 años se llevaba la reducción entera (hallazgo 462) y en Cataluña la web
   * aplicaba un tope estatal que allí no rige (hallazgo 461). La misma herencia valía
   * 12.013,29 € en la web y 31.500,00 € por MCP.
   */
  const vivienda = evaluarReduccionVivienda({
    valorVivienda: viviendaHabitual ? valorReferencia : undefined,
    grupo: reducKey,
    ccaa,
    edadHeredero: edad,
    convivenciaDosAnios: convivioDosAnios,
  });
  const reduccionVivienda = redondearCentimos(vivienda.reduccion);
  const viviendaNoAplicada = vivienda.noAplicada;

  /**
   * Reducción autonómica sobre la BASE. Asturias es la única CCAA del catálogo cuyo
   * beneficio está modelado así (300.000 € para Grupos I y II, 50.000 € para el III) en vez
   * de como bonificación en cuota, y era justo la que el motor no sabía leer: presentaba
   * Asturias como la comunidad más cara mientras `data/fiscal` decía que un hijo que hereda
   * 250.000 € de vivienda habitual no paga nada.
   */
  const reduccionAutonomica = redondearCentimos(bonifGrupo?.reduccionBase ?? 0);

  const baseLiquidable = redondearCentimos(
    Math.max(0, baseImponible - reduccionParentesco - reduccionVivienda - reduccionAutonomica)
  );

  // Aplicar tarifa
  const tarifa = esCataluna ? TARIFA_CATALUNA_IS : TARIFA_ESTATAL_IS;
  const cuotaIntegra = redondearCentimos(calcularCuotaIntegraIS(baseLiquidable, tarifa));

  // Coeficiente por patrimonio preexistente, desde data/fiscal. Índice 0 = primer tramo
  // (patrimonio del heredero < 402.678,11 €), que es el supuesto que simula esta app.
  const tablaCoeficientes = esCataluna ? COEFICIENTES_CATALUNA_IS : COEFICIENTES_IS;
  const coeficiente = tablaCoeficientes[grupo]?.[0] ?? 1.0;
  const cuotaTributaria = redondearCentimos(cuotaIntegra * coeficiente);

  // Bonificación CCAA
  let bonificacionPorc = 0;
  if (bonifGrupo) {
    if (typeof bonifGrupo.porcentaje === 'number') {
      bonificacionPorc = bonifGrupo.porcentaje;
    }
    /**
     * Cataluña (art. 58 bis Ley 19/2010): escala PONDERADA sobre la base IMPONIBLE. No es el
     * `escalonado` de abajo —que elige UN tramo por la base liquidable y aplica su porcentaje
     * entero—, sino un porcentaje medio que casi nunca coincide con ninguno de la tabla. La
     * regla la sirve el motor de sucesiones, el mismo que ejecuta el MCP Delegum.
     */
    if (bonifGrupo.escalaPonderada && bonifGrupo.escalaPonderada.length > 0) {
      bonificacionPorc = porcentajeBonificacionPonderada(baseImponible, bonifGrupo.escalaPonderada);
    }
    if (bonifGrupo.escalonado && bonifGrupo.escalonado.length > 0) {
      // Tomar el primer tramo aplicable según base liquidable
      for (const t of bonifGrupo.escalonado) {
        if (t.hasta && baseLiquidable <= t.hasta) {
          bonificacionPorc = t.porcentaje;
          break;
        }
        if (t.desde && baseLiquidable > t.desde) {
          bonificacionPorc = t.porcentaje;
        }
      }
    }
    // La Rioja: 99 % hasta 500.000 € de base y 98 % por encima. Sin leer el escalón, la app
    // cobraba la MITAD de lo debido en las herencias grandes: como la bonificación va sobre
    // cuota y lo que se paga es el complemento, pasar del 98 % al 99 % duplica el error.
    if (bonifGrupo.tope && typeof bonifGrupo.porcentajeMayor === 'number' && baseLiquidable > bonifGrupo.tope) {
      bonificacionPorc = bonifGrupo.porcentajeMayor;
    }
    // Aragón: limite — si supera el limite no aplica
    if (bonifGrupo.limite && baseLiquidable > bonifGrupo.limite) {
      bonificacionPorc = 0;
    }
    // Andalucia/Galicia: exencion total bajo umbral
    if (bonifGrupo.exencion && baseLiquidable < bonifGrupo.exencion) {
      bonificacionPorc = 1.0;
    }
  }

  // La bonificación se redondea ANTES de restarla: es lo que hace cuadrar la resta escrita
  // en el panel. Ver `redondearCentimos` para el céntimo en que esto se separa del motor.
  const bonificacion = redondearCentimos(cuotaTributaria * bonificacionPorc);
  const cuotaFinal = redondearCentimos(Math.max(0, cuotaTributaria - bonificacion));

  return {
    caudalRelicto,
    ajuarDomestico,
    baseImponible,
    reduccionParentesco,
    reduccionVivienda,
    reduccionAutonomica,
    viviendaNoAplicada,
    baseLiquidable,
    cuotaIntegra,
    coeficiente,
    cuotaTributaria,
    bonificacion,
    cuotaFinal,
    grupo,
    ccaaNombre,
    bonificacionPorc,
  };
}

/**
 * Lo que ESTA MISMA página liquida para el ejemplo que cita el bloque educativo: Grupo IV,
 * 200.000 €, sin vivienda habitual, régimen común (Madrid, que no bonifica al Grupo IV).
 *
 * Sale del motor y no de un número escrito a mano porque el texto decía «80-100.000 € de
 * ISD», más del DOBLE de lo que devuelve el motor y una cifra inalcanzable en la app: ni
 * la CCAA más cara ni el coeficiente más alto del Grupo IV llegan ahí. Y era el texto que
 * aconseja «valorar si compensa renunciar a la herencia» (hallazgo 275 del Inspector).
 */
const EJEMPLO_GRUPO_IV = calcularISD(200000, 'sin_parentesco', 'madrid', false, 50, false);

function calcularPlusvaliaMunicipal(
  valorCatastralSuelo: number,
  valorAdquisicionOriginal: number,
  valorReferenciaActual: number,
  aniosTenencia: number,
  valorCatastralTotal: number
): ResultadoPlusvalia {
  // Coeficiente según años (max 20). Desde el 24/09/2026 sale de `coeficienteIIVTNU`, que lee
  // la tabla vigente del art. 107.4 (RDL 8/2023) y prorratea por meses por debajo del año;
  // antes se consultaba aquí la del RDL 26/2021, caducada desde 2023 (hallazgos 1559 y 1560).
  const aniosClamp = Math.min(20, Math.max(0, aniosTenencia));
  const coeficiente = coeficienteIIVTNU(aniosClamp).coeficiente;

  // Método objetivo: valor catastral del suelo × coef × tipo municipal (art. 107.4 TRLHL)
  const baseObjetiva = valorCatastralSuelo * coeficiente;
  const metodoObjetivo = baseObjetiva * TIPO_MUNICIPAL_PLUSVALIA;

  // Método real (art. 107.5 TRLHL): el incremento se reparte entre suelo y construcción
  // en la proporción CATASTRAL, no respecto al valor de mercado. Usar el valor de
  // referencia como denominador infravaloraba el suelo y con él la cuota.
  const gananciaTotal = valorReferenciaActual - valorAdquisicionOriginal;
  const proporcionSuelo = valorCatastralTotal > 0
    ? Math.min(1, valorCatastralSuelo / valorCatastralTotal)
    : 0;
  const gananciaSuelo = Math.max(0, gananciaTotal * proporcionSuelo);
  const metodoReal = gananciaSuelo * TIPO_MUNICIPAL_PLUSVALIA;

  // Si no hay incremento de valor → no sujeta (RDL 26/2021)
  if (gananciaTotal <= 0) {
    return {
      metodoObjetivo,
      metodoReal: 0,
      metodoElegido: 'exenta',
      cuotaFinal: 0,
      aniosTenencia: aniosClamp,
      coeficiente,
    };
  }

  // Elegir el menor (RDL 26/2021)
  const cuotaFinal = Math.min(metodoObjetivo, metodoReal);
  const metodoElegido: 'objetivo' | 'real' = metodoObjetivo <= metodoReal ? 'objetivo' : 'real';

  return {
    metodoObjetivo,
    metodoReal,
    metodoElegido,
    cuotaFinal,
    aniosTenencia: aniosClamp,
    coeficiente,
  };
}

function calcularIRPFGanancia(
  valorReferenciaISD: number,
  cuotaISD: number,
  cuotaIIVTNU: number,
  valorVenta: number,
  cuotaIIVTNUVenta: number
): ResultadoIRPF {
  // Valor adquisición fiscal: el valor declarado en ISD + impuestos pagados (art. 36 LIRPF
  // remitiendo al 35.1: importe real + gastos y tributos inherentes a la adquisición).
  const valorAdquisicionFiscal = valorReferenciaISD + cuotaISD + cuotaIIVTNU;
  /**
   * Valor de TRANSMISIÓN (art. 35.2 LIRPF): del importe real se deducen «los gastos y
   * tributos inherentes a la transmisión… satisfechos por el transmitente», y la plusvalía
   * municipal de la venta lo es — la paga el vendedor.
   *
   * ⚠  13/09/2026: la app no liquidaba esa segunda plusvalía (hallazgo 779), así que
   * tampoco podía descontarla aquí. Al añadirla, el TOTAL no es una suma simple: el mismo
   * impuesto que sube el total por un lado baja el IRPF por el otro.
   */
  const valorTransmision = valorVenta - cuotaIIVTNUVenta;
  const ganancia = valorTransmision - valorAdquisicionFiscal;

  if (ganancia <= 0) {
    return {
      valorAdquisicionFiscal,
      valorTransmision,
      ganancia,
      cuota: 0,
      desglose: [],
      esPerdida: true,
    };
  }

  // Los tramos de la base del ahorro los desglosa `data/fiscal/inmuebles.ts`, que se declara
  // «fuente única del cálculo» y es lo que usan `estimador-plusvalias-irpf` y la tool del MCP.
  // Este bucle estaba reimplementado a mano: hoy daba la misma cifra, pero es la mitad del
  // hallazgo 276 que no llegó a repararse, y una corrección en data/fiscal no llegaría aquí.
  const tramos = desglosarCuotaBaseAhorro(ganancia);
  const cuota = tramos.reduce((acc, t) => acc + t.cuota, 0);
  const desglose: ResultadoIRPF['desglose'] = tramos.map((t) => ({
    desde: t.desde,
    hasta: t.hasta,
    tipo: t.tipo,
    aplicado: t.base,
    cuota: t.cuota,
  }));

  return {
    valorAdquisicionFiscal,
    valorTransmision,
    ganancia,
    cuota,
    desglose,
    esPerdida: false,
  };
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function SimuladorHeredarViviendaPage() {
  const [parentesco, setParentesco] = useState<Parentesco>('hijo');
  const [edad, setEdad] = useState<number>(45);
  const [ccaa, setCcaa] = useState<string>('madrid');
  const [anioAdquisicion, setAnioAdquisicion] = useState<number>(1995);
  const [valorAdquisicion, setValorAdquisicion] = useState<number>(80000);
  const [valorReferencia, setValorReferencia] = useState<number>(200000);
  const [valorCatastralSuelo, setValorCatastralSuelo] = useState<number>(60000);
  // Valor catastral total (suelo + construcción): denominador de la proporción de suelo
  // que exige el método real del IIVTNU (art. 107.5 TRLHL)
  const [valorCatastralTotal, setValorCatastralTotal] = useState<number>(120000);
  const [viviendaHabitual, setViviendaHabitual] = useState<boolean>(true);
  // Solo interviene si el heredero es colateral (Grupo III): art. 20.2.c LISD
  const [convivioDosAnios, setConvivioDosAnios] = useState<boolean>(false);
  const [aniosHastaVenta, setAniosHastaVenta] = useState<number>(5);
  const [valorVenta, setValorVenta] = useState<number>(250000);

  // El año real solo se conoce en el navegador: en el primer render (y en el HTML que se
  // sirve) vale ANIO_REFERENCIA, para que servidor y cliente pinten lo mismo
  const [anioActual, setAnioActual] = useState<number>(ANIO_REFERENCIA);
  useEffect(() => {
    setAnioActual(new Date().getFullYear());
  }, []);

  const aplicarCaso = useCallback((caso: CasoPreconfigurado) => {
    setParentesco(caso.parentesco);
    setEdad(caso.edad);
    setCcaa(caso.ccaa);
    setAnioAdquisicion(caso.anioAdquisicion);
    setValorAdquisicion(caso.valorAdquisicion);
    setValorReferencia(caso.valorReferencia);
    setValorCatastralSuelo(caso.valorCatastralSuelo);
    setValorCatastralTotal(caso.valorCatastralTotal);
    setViviendaHabitual(caso.viviendaHabitual);
    setConvivioDosAnios(false);
    setAniosHastaVenta(caso.aniosHastaVenta);
    setValorVenta(caso.valorVenta);
  }, []);

  // Cálculos
  const aniosTenenciaCausante = anioActual - anioAdquisicion;

  const isd = useMemo(
    () => calcularISD(valorReferencia, parentesco, ccaa, viviendaHabitual, edad, convivioDosAnios),
    [valorReferencia, parentesco, ccaa, viviendaHabitual, edad, convivioDosAnios]
  );

  const plusvalia = useMemo(
    () =>
      calcularPlusvaliaMunicipal(
        valorCatastralSuelo,
        valorAdquisicion,
        valorReferencia,
        aniosTenenciaCausante,
        valorCatastralTotal
      ),
    [valorCatastralSuelo, valorAdquisicion, valorReferencia, aniosTenenciaCausante, valorCatastralTotal]
  );

  /**
   * Plusvalía municipal de la SEGUNDA transmisión (hallazgo 779).
   *
   * El IIVTNU se devenga en CADA transmisión, y en la venta lo paga el vendedor — que aquí
   * es el heredero. Lo dice el módulo del que esta misma página lee los coeficientes
   * (PLUSVALIA_MUNICIPAL_META.quien) y lo dice su propia tabla del bloque educativo, pero el
   * TOTAL sumaba tres conceptos donde la operación simulada tiene cuatro.
   *
   * Los datos ya estaban en pantalla: el periodo de tenencia del heredero son los años hasta
   * la venta, el valor catastral del suelo no cambia al heredar y el incremento de esta
   * segunda transmisión es precio de venta − valor declarado en el ISD.
   */
  const plusvaliaVenta = useMemo(
    () =>
      aniosHastaVenta > 0 && valorVenta > 0
        ? calcularPlusvaliaMunicipal(
            valorCatastralSuelo,
            valorReferencia,
            valorVenta,
            aniosHastaVenta,
            valorCatastralTotal
          )
        : null,
    [aniosHastaVenta, valorVenta, valorCatastralSuelo, valorReferencia, valorCatastralTotal]
  );

  /**
   * Pérdida de la reducción por vivienda habitual al vender dentro del plazo de
   * mantenimiento (hallazgo 778).
   *
   * El art. 20.2.c LISD condiciona la reducción a mantener la adquisición diez años (cinco
   * en Cataluña, art. 19 Ley 19/2010). Vender antes obliga a regularizar: se ingresa la parte
   * del impuesto que se dejó de pagar, más intereses de demora. La app tenía el dato de
   * entrada, conocía la regla y la enunciaba — pero dentro del bloque educativo colapsado,
   * mientras el TOTAL sumaba a la vez una reducción y la venta que la anula.
   *
   * ⚠  Solo están modelados los plazos estatal y catalán, que son los que data/fiscal trae
   * sellados. Otras comunidades tienen el suyo propio, y eso se dice en el aviso en vez de
   * aplicar un plazo inventado.
   */
  const aniosMantenimiento =
    ccaa === 'cataluna'
      ? REDUCCION_VIVIENDA_ANIOS_MANTENIMIENTO_CATALUNA_IS
      : REDUCCION_VIVIENDA_ANIOS_MANTENIMIENTO_IS;

  /**
   * El tope de la reducción por vivienda habitual, EN LA COMUNIDAD ELEGIDA.
   *
   * Mismo criterio con el que `evaluarReduccionVivienda` (lib/calculadoras/sucesiones.ts)
   * decide el límite que aplica, para que la etiqueta no pueda volver a prometer otro
   * distinto del que se está usando (hallazgo 861).
   */
  const topeReduccionVivienda =
    ccaa === 'cataluna' ? REDUCCION_VIVIENDA_MAX_CATALUNA_IS : REDUCCION_VIVIENDA_MAX_IS;

  const isdSinReduccionVivienda = useMemo(
    () => calcularISD(valorReferencia, parentesco, ccaa, false, edad, convivioDosAnios),
    [valorReferencia, parentesco, ccaa, edad, convivioDosAnios]
  );

  const ventaDentroDePlazo =
    isd.reduccionVivienda > 0 && aniosHastaVenta > 0 && aniosHastaVenta < aniosMantenimiento;

  /** Lo que hay que devolver (sin intereses, que dependen de la fecha real de cada pago). */
  const regularizacionVivienda = ventaDentroDePlazo
    ? redondearCentimos(Math.max(0, isdSinReduccionVivienda.cuotaFinal - isd.cuotaFinal))
    : 0;

  /**
   * El IRPF de la venta, con el ISD **REGULARIZADO** dentro del valor de adquisición.
   *
   * ⚠️ 15/09/2026 (hallazgo 859) — este bloque vivía más arriba, antes de que existiera
   * `regularizacionVivienda`, así que recibía solo `isd.cuotaFinal`: cuando la venta cae
   * dentro del plazo de mantenimiento, la app cobraba la cuota de la complementaria en el
   * TOTAL y no la sumaba al coste de adquisición. El art. 36 LIRPF remite al 35.1.b, que
   * suma al importe real los tributos inherentes a la adquisición satisfechos por el
   * adquirente, y ese es el ISD entero — el que la propia app acaba de escribir dos líneas
   * antes. La página se contradecía dos veces: la nota al pie del panel dice «Valor
   * referencia ISD + cuota ISD + cuota plusvalía pagadas», y su lista de errores frecuentes
   * advierte de «calcular la ganancia sin sumar ISD ni plusvalía pagados: pagas IRPF de
   * más». En el caso del acta eran 4.293,19 € de IRPF de más, un 9,8 % del coste anunciado.
   * Por eso se calcula aquí abajo: el orden de las declaraciones ERA el defecto.
   */
  const irpf = useMemo(
    () =>
      aniosHastaVenta > 0
        ? calcularIRPFGanancia(
            valorReferencia,
            isd.cuotaFinal + regularizacionVivienda,
            plusvalia.cuotaFinal,
            valorVenta,
            plusvaliaVenta?.cuotaFinal ?? 0
          )
        : null,
    [
      aniosHastaVenta,
      valorReferencia,
      isd.cuotaFinal,
      regularizacionVivienda,
      plusvalia.cuotaFinal,
      valorVenta,
      plusvaliaVenta,
    ]
  );

  const totalImpuestos =
    isd.cuotaFinal +
    regularizacionVivienda +
    plusvalia.cuotaFinal +
    (plusvaliaVenta?.cuotaFinal ?? 0) +
    (irpf?.cuota ?? 0);
  const porcSobreVenta = valorVenta > 0 ? (totalImpuestos / valorVenta) * 100 : 0;

  // Los tres avisos de coherencia entre parentesco y edad (hallazgo 612)
  const avisoEdad = edad < 21 && (parentesco === 'hijo' || parentesco === 'nieto');
  const avisoGrupoIMayor = edad >= 21 && parentesco === 'hijo_menor21';
  const avisoGrupoICataluna = parentesco === 'hijo_menor21' && edad < 21 && ccaa === 'cataluna';

  // Grupo del parentesco elegido, para decidir qué campos tienen sentido en el formulario
  const grupoParentesco = PARENTESCOS.find(p => p.id === parentesco)?.grupo ?? 'II';

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">🏠</span>
        <h1 className={styles.title}>Simulador Heredar Vivienda</h1>
        <p className={styles.subtitle}>
          Coste fiscal completo: ISD + plusvalía municipal + IRPF al vender
        </p>
      </header>

      <RegionBadge variant="es-only" />

      <DisclaimerCard variant="financial" severity="critical" />

      {/* Un sello por MÓDULO, no uno solo con el rótulo de los tres impuestos. La página
          liquida ISD, plusvalía municipal e IRPF de la venta con datos de DOS módulos de
          data/fiscal, y el sello único rotulaba «ISD + IIVTNU 2025» mientras enseñaba la
          fecha del de sucesiones —año y medio anterior— y una URL que no habla ni del
          IIVTNU ni del IRPF (hallazgo 610). */}
      <DataReference
        normativa="ISD"
        fuente={FISCAL_SUCESIONES_META.fuente}
        verificado={FISCAL_SUCESIONES_META.verificado}
        urlOficial={FISCAL_SUCESIONES_META.urlOficial}
      />
      {/* Y el segundo se parte a su vez en DOS, por la misma razón que el 610 partió el
          primero: juntaba el IIVTNU y el IRPF bajo una sola fecha —la del módulo entero,
          FISCAL_INMUEBLES_META— que es 17 meses MÁS NUEVA que la que declara el dato que
          rotula. PLUSVALIA_MUNICIPAL_META lleva su propio sello dentro del mismo fichero,
          igual que FISCAL_SUCESIONES_CATALUNA_META lo lleva aparte del de sucesiones y por
          idéntico motivo. Era el 610 dado la vuelta: entonces el sello único enseñaba una
          fecha año y medio ANTERIOR, y aquí se quedaba con la más nueva de las dos —y
          justo debajo, la nota que pide mirar esa fecha (hallazgo 695). */}
      <DataReference
        normativa="Plusvalía municipal (IIVTNU)"
        fuente={PLUSVALIA_MUNICIPAL_META.baseNormativa}
        verificado={PLUSVALIA_MUNICIPAL_META.verificado}
        urlOficial={PLUSVALIA_MUNICIPAL_META.urlReferencia}
        nota={PLUSVALIA_MUNICIPAL_META.aviso}
      />
      {/* Y el tercero tampoco puede llevar el sello del módulo entero: FISCAL_INMUEBLES_META
          se re-selló cuatro veces entre enero y junio de 2026 en commits que solo tocaban los
          tipos del ITP —tributo que esta app no calcula—, así que el rótulo «IRPF de la
          venta» enseñaba una fecha ganada revisando otra cosa, y su `fuente` nombraba cuatro
          normas de las que tres no venían al caso (hallazgo 781). La escala del ahorro tiene
          desde hoy sello propio, como ya lo tenía el IIVTNU en el mismo fichero. */}
      <DataReference
        normativa="IRPF de la venta"
        fuente={GANANCIAS_PATRIMONIALES_META.fuente}
        verificado={GANANCIAS_PATRIMONIALES_META.verificado}
        urlOficial={GANANCIAS_PATRIMONIALES_META.urlOficial}
        nota={GANANCIAS_PATRIMONIALES_META.nota}
      />

      <LegalNotice />

      <main className={styles.main}>
        {/* Casos preconfigurados */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Casos preconfigurados</h2>
          <p className={styles.panelHint}>
            Carga un caso real para ver el efecto de cada CCAA y parentesco.
          </p>
          <div className={styles.casosGrid}>
            {CASOS.map(caso => (
              <button
                key={caso.id}
                type="button"
                className={styles.casoBtn}
                onClick={() => aplicarCaso(caso)}
                aria-label={`Cargar caso: ${caso.nombre}`}
              >
                <strong>{caso.nombre}</strong>
                <span>{caso.descripcion}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Datos del causante */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Datos del causante (fallecido)</h2>

          <div className={styles.sliderGroup}>
            <label className={styles.sliderLabel} htmlFor="anioAdq">
              Año de adquisición de la vivienda:{' '}
              <span className={styles.sliderValue}>{anioAdquisicion}</span>
              <span className={styles.muted}>
                {' '}({aniosTenenciaCausante} años hasta hoy)
              </span>
            </label>
            <input
              id="anioAdq"
              type="range"
              min={1985}
              max={anioActual}
              step={1}
              value={Math.min(anioAdquisicion, anioActual)}
              onChange={e => setAnioAdquisicion(Number(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.sliderRange}>
              <span>1985</span>
              <span>{anioActual}</span>
            </div>
          </div>

          <div className={styles.sliderGroup}>
            <label className={styles.sliderLabel} htmlFor="valorAdq">
              Valor de adquisición original:{' '}
              <span className={styles.sliderValue}>{formatCurrency(valorAdquisicion)}</span>
            </label>
            <input
              id="valorAdq"
              type="range"
              min={30000}
              max={1000000}
              step={5000}
              value={valorAdquisicion}
              onChange={e => setValorAdquisicion(Number(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.sliderRange}>
              <span>30.000 €</span>
              <span>1.000.000 €</span>
            </div>
          </div>
        </div>

        {/* Datos del heredero */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Datos del heredero</h2>

          <div className={styles.parentescoSelector}>
            <label className={styles.selectLabel} htmlFor="parentescoSel">
              Parentesco con el causante:
            </label>
            <select
              id="parentescoSel"
              value={parentesco}
              onChange={e => setParentesco(e.target.value as Parentesco)}
              className={styles.select}
            >
              {PARENTESCOS.map(p => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.sliderGroup}>
            <label className={styles.sliderLabel} htmlFor="edadHer">
              Edad del heredero: <span className={styles.sliderValue}>{edad} años</span>
            </label>
            {/* Desde 0: el Grupo I son los descendientes MENORES de 21 años, y con el
                mínimo en 18 su caso no se podía ni plantear (hallazgo 612). */}
            <input
              id="edadHer"
              type="range"
              min={0}
              max={90}
              step={1}
              value={edad}
              onChange={e => setEdad(Number(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.sliderRange}>
              <span>0</span>
              <span>90</span>
            </div>
            {avisoEdad && (
              <p className={styles.sliderHint} role="status" aria-live="polite">
                <span aria-hidden="true">⚠️</span> Con menos de 21 años, un hijo o descendiente
                es <strong>Grupo I</strong>, no Grupo II: elige esa opción en el parentesco para
                que se aplique la reducción del art. 20.2.a LISD.
              </p>
            )}
            {avisoGrupoIMayor && (
              <p className={styles.sliderHint} role="status" aria-live="polite">
                <span aria-hidden="true">⚠️</span> El Grupo I es solo para descendientes de
                menos de 21 años. Con {edad} años el parentesco correcto es el Grupo II.
              </p>
            )}
            {avisoGrupoICataluna && (
              <p className={styles.sliderHint} role="status" aria-live="polite">
                <span aria-hidden="true">ℹ️</span> En Cataluña el Grupo I suma{' '}
                <strong>12.000 € por cada año de menos de 21</strong> sobre los 100.000 € de
                partida, con un tope de 196.000 € (art. 2 de la Ley 19/2010). Es la cuantía que
                se aplica aquí, distinta de la estatal.
              </p>
            )}
          </div>

          <div className={styles.ccaaSelector}>
            <label className={styles.selectLabel} htmlFor="ccaaSel">
              CCAA donde residía el causante:
            </label>
            <select
              id="ccaaSel"
              value={ccaa}
              onChange={e => setCcaa(e.target.value)}
              className={styles.select}
            >
              {CCAA_LIST.map(c => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Datos vivienda */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Datos de la vivienda heredada</h2>

          <div className={styles.sliderGroup}>
            <label className={styles.sliderLabel} htmlFor="valorRef">
              Valor de referencia catastral:{' '}
              <span className={styles.sliderValue}>{formatCurrency(valorReferencia)}</span>
              <span className={styles.muted}> (base ISD)</span>
            </label>
            <input
              id="valorRef"
              type="range"
              min={50000}
              max={2000000}
              step={5000}
              value={valorReferencia}
              onChange={e => setValorReferencia(Number(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.sliderRange}>
              <span>50.000 €</span>
              <span>2.000.000 €</span>
            </div>
          </div>

          <div className={styles.sliderGroup}>
            <label className={styles.sliderLabel} htmlFor="valorSuelo">
              Valor catastral del suelo:{' '}
              <span className={styles.sliderValue}>{formatCurrency(valorCatastralSuelo)}</span>
              <span className={styles.muted}> (base plusvalía municipal)</span>
            </label>
            <input
              id="valorSuelo"
              type="range"
              min={5000}
              max={500000}
              step={1000}
              value={valorCatastralSuelo}
              onChange={e => setValorCatastralSuelo(Number(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.sliderRange}>
              <span>5.000 €</span>
              <span>500.000 €</span>
            </div>
          </div>

          <div className={styles.sliderGroup}>
            <label className={styles.sliderLabel} htmlFor="valorCatastralTotal">
              Valor catastral total:{' '}
              <span className={styles.sliderValue}>{formatCurrency(valorCatastralTotal)}</span>
              <span className={styles.muted}> (suelo + construcción, del recibo del IBI)</span>
            </label>
            <input
              id="valorCatastralTotal"
              type="range"
              min={10000}
              max={1000000}
              step={1000}
              value={valorCatastralTotal}
              onChange={e => setValorCatastralTotal(Number(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.sliderRange}>
              <span>10.000 €</span>
              <span>1.000.000 €</span>
            </div>
          </div>

          <div className={styles.toggleGroup}>
            <label className={styles.toggleLabel}>
              <input
                id="viviendaHabitual"
                type="checkbox"
                checked={viviendaHabitual}
                onChange={e => setViviendaHabitual(e.target.checked)}
                className={styles.toggleInput}
              />
              <span>
                Era vivienda habitual del fallecido{' '}
                {/*
                  ⚠️ 15/09/2026 (hallazgo 861) — el tope se escribía sin mirar la comunidad, así
                  que en Cataluña la etiqueta anunciaba el estatal (122.606,47 €) mientras la app
                  aplicaba el del art. 17 de la Ley 19/2010 (500.000 €): con una vivienda de
                  400.000 € reducía 380.000 € y el rótulo de al lado prometía tres veces menos.
                  Es la forma exacta del hallazgo 696 —el plazo de mantenimiento que no conocía
                  los cinco años catalanes— reaparecida sobre el TOPE en vez de sobre el plazo.
                */}
                <span className={styles.muted}>(reducción {PORC_REDUCCION_VIVIENDA}% ISD hasta {formatCurrency(topeReduccionVivienda)})</span>
              </span>
            </label>
          </div>

          {/* El colateral (Grupo III) solo tiene derecho a la reducción si además es mayor
              de EDAD_MIN_COLATERAL_VIVIENDA años y convivió con el causante los dos años anteriores
                  (art. 20.2.c LISD) */}
          {viviendaHabitual && grupoParentesco === 'III' && (
            <div className={styles.toggleGroup}>
              <label className={styles.toggleLabel}>
                <input
                  id="convivencia"
                  type="checkbox"
                  checked={convivioDosAnios}
                  onChange={e => setConvivioDosAnios(e.target.checked)}
                  className={styles.toggleInput}
                />
                <span>
                  Convivió con el fallecido los 2 años anteriores{' '}
                  <span className={styles.muted}>
                    (requisito del colateral, junto con tener {EDAD_MIN_COLATERAL_VIVIENDA} años o más)
                  </span>
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Datos venta */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Si vendes la vivienda heredada</h2>

          <div className={styles.sliderGroup}>
            <label className={styles.sliderLabel} htmlFor="aniosVenta">
              Años hasta la venta tras heredar:{' '}
              <span className={styles.sliderValue}>{aniosHastaVenta} años</span>
              {aniosHastaVenta === 0 && (
                <span className={styles.muted}> (no se simula venta)</span>
              )}
            </label>
            <input
              id="aniosVenta"
              type="range"
              min={0}
              max={30}
              step={1}
              value={aniosHastaVenta}
              onChange={e => setAniosHastaVenta(Number(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.sliderRange}>
              <span>0 (no vendo)</span>
              <span>30 años</span>
            </div>
          </div>

          {aniosHastaVenta > 0 && (
            <div className={styles.sliderGroup}>
              <label className={styles.sliderLabel} htmlFor="valorVta">
                Valor de venta estimado:{' '}
                <span className={styles.sliderValue}>{formatCurrency(valorVenta)}</span>
              </label>
              <input
                id="valorVta"
                type="range"
                min={50000}
                max={2000000}
                step={5000}
                value={valorVenta}
                onChange={e => setValorVenta(Number(e.target.value))}
                className={styles.slider}
              />
              <div className={styles.sliderRange}>
                <span>50.000 €</span>
                <span>2.000.000 €</span>
              </div>
            </div>
          )}
        </div>

        {/* 3 paneles horizontales. `role="status"` + `aria-live="polite"`: los siete
            deslizadores recalculan las tres liquidaciones y un lector de pantalla no oía
            nada, en una herramienta cuyo contenido entero es el resultado (hallazgo 613).
            Va en el contenedor y no en cada panel para que se anuncie UNA vez por cambio,
            no tres. */}
        <div className={styles.tresPaneles} role="status" aria-live="polite" aria-atomic="true">
          {/* Panel 1: ISD */}
          <div className={styles.panelISD}>
            <h3 className={styles.panelHeaderTitle}>1. ISD al heredar</h3>
            <p className={styles.panelHeaderSub}>
              {isd.ccaaNombre} — Grupo {isd.grupo}
            </p>

            <div className={styles.panelLine}>
              <span>Valor de referencia de la vivienda</span>
              <strong>{formatCurrency(isd.caudalRelicto)}</strong>
            </div>
            <div className={styles.panelLine}>
              <span>+ Ajuar doméstico ({PORC_AJUAR} % del caudal, art. 15 LISD)</span>
              <strong>+{formatCurrency(isd.ajuarDomestico)}</strong>
            </div>
            <div className={styles.panelLine}>
              <span>= Base imponible</span>
              <strong>{formatCurrency(isd.baseImponible)}</strong>
            </div>
            <div className={styles.panelLine}>
              <span>− Reducción parentesco</span>
              <strong>−{formatCurrency(isd.reduccionParentesco)}</strong>
            </div>
            {isd.reduccionVivienda > 0 && (
              <div className={styles.panelLine}>
                <span>− Reducción vivienda habitual ({PORC_REDUCCION_VIVIENDA}%)</span>
                <strong>−{formatCurrency(isd.reduccionVivienda)}</strong>
              </div>
            )}
            {isd.viviendaNoAplicada && (
              <div className={styles.panelLine}>
                <span>Reducción vivienda habitual</span>
                <strong>No aplicable: {isd.viviendaNoAplicada}</strong>
              </div>
            )}
            {isd.reduccionAutonomica > 0 && (
              <div className={styles.panelLine}>
                <span>− Reducción autonómica ({isd.ccaaNombre})</span>
                <strong>−{formatCurrency(isd.reduccionAutonomica)}</strong>
              </div>
            )}
            <div className={styles.panelLine}>
              <span>= Base liquidable</span>
              <strong>{formatCurrency(isd.baseLiquidable)}</strong>
            </div>
            <div className={styles.panelLine}>
              <span>Cuota íntegra (tarifa)</span>
              <strong>{formatCurrency(isd.cuotaIntegra)}</strong>
            </div>
            <div className={styles.panelLine}>
              <span>× Coef. patrimonio (Grupo {isd.grupo})</span>
              <strong>×{formatNumber(isd.coeficiente, 4)}</strong>
            </div>
            <div className={styles.panelLine}>
              <span>= Cuota tributaria</span>
              <strong>{formatCurrency(isd.cuotaTributaria)}</strong>
            </div>
            <div className={styles.panelLine}>
              <span>− Bonificación CCAA ({formatNumber(isd.bonificacionPorc * 100, 1)}%)</span>
              <strong>−{formatCurrency(isd.bonificacion)}</strong>
            </div>
            <div className={styles.panelTotal}>
              <span>Cuota ISD final</span>
              <strong>{formatCurrency(isd.cuotaFinal)}</strong>
            </div>

            {/* El aviso va JUNTO A LA CIFRA, no dentro del bloque educativo colapsado: la
                misma pantalla sumaba una reducción y la venta que la anula (hallazgo 778). */}
            {ventaDentroDePlazo && (
              <div className={styles.avisoMantenimiento}>
                {/*
                  ⚠️ 15/09/2026 — dos reparaciones en este aviso:

                  · 863: el plazo salía SIN UNIDAD («exige mantenerla 10.»), porque el paréntesis
                    condicional de Cataluña se comía el sustantivo. En una app de riesgo 1 un «10»
                    suelto se lee como meses tan fácilmente como años, y va justo encima de una
                    cifra que hay que ingresar. De paso, la atribución: los 5 años catalanes son
                    del art. 19 de la Ley 19/2010, no del art. 20.2.c LISD, que da 10.

                  · 862: cerraba con «El plazo es de {PLAZO_ISD.mesesPresentacion} meses desde la
                    venta», leyendo una constante cuyo dies a quo es el FALLECIMIENTO («seis meses
                    contados desde el día del fallecimiento del causante», art. 67.1.a RISD). Esa
                    norma no habla de la pérdida sobrevenida de una reducción, así que la app
                    publicaba una fecha límite que su propia fuente no respalda. No hay en
                    data/fiscal ningún plazo sellado para la complementaria —lo fija la normativa
                    de cada comunidad—, así que se dice eso en vez de dar un número: o se cita la
                    norma, o no se da la cifra.
                */}
                <span aria-hidden="true">⚠️</span> <strong>Pierdes la reducción por vivienda
                habitual:</strong> vendes a los {aniosHastaVenta} años y{' '}
                {ccaa === 'cataluna'
                  ? `el art. 19 de la Ley 19/2010 de Cataluña exige mantenerla ${aniosMantenimiento} años`
                  : `el art. 20.2.c LISD exige mantenerla ${aniosMantenimiento} años`}.{' '}
                {/*
                  ⚠️ 21/09/2026 (hallazgo 1178) — este aviso exigía «presentar una autoliquidación
                  complementaria e ingresar los 0,00 € … más intereses de demora» en las
                  comunidades cuyo beneficio llega DESPUÉS de la reducción (Andalucía y Galicia,
                  exención total bajo 1.000.000 € de base liquidable; Asturias, 300.000 € de
                  reducción en base): allí quitar la reducción de vivienda no mueve la cuota y los
                  dos escenarios dan 0,00 €. El bloque total ya lo sabía y no pintaba la línea «+
                  ISD regularizado», así que la pantalla se contradecía. El incumplimiento del
                  requisito es cierto y se sigue diciendo; lo que desaparece es la orden de
                  ingresar una cifra que no existe. Es la reparación del 778 pasada de frenada.
                */}
                {regularizacionVivienda > 0 ? (
                  <>
                    Hay que presentar una autoliquidación complementaria e ingresar los{' '}
                    <strong>{formatCurrency(regularizacionVivienda)}</strong> que la reducción ahorró,
                    más intereses de demora (que dependen de las fechas reales y no se calculan aquí).
                    El plazo para presentarla lo fija la normativa de tu comunidad autónoma: compruébalo
                    antes de que corran más intereses.
                  </>
                ) : (
                  <>
                    Con estos datos, <strong>quitar la reducción no cambia la cuota</strong>: los
                    beneficios de {CCAA_LIST.find(c => c.id === ccaa)?.label ?? 'tu comunidad'} llegan
                    después de ella y el ISD sale igual a{' '}
                    <strong>{formatCurrency(isd.cuotaFinal)}</strong> con reducción y sin ella, así
                    que no hay importe que devolver. Aun así, el incumplimiento del plazo de
                    mantenimiento se comunica a la administración de tu comunidad autónoma, que es
                    quien fija cómo y cuándo.
                  </>
                )}
                {ccaa !== 'cataluna' && ' Otras comunidades fijan plazos de mantenimiento propios: comprueba el de la tuya.'}
              </div>
            )}
          </div>

          {/* Panel 2: Plusvalía */}
          <div className={styles.panelPlusvalia}>
            <h3 className={styles.panelHeaderTitle}>2. Plusvalía municipal (herencia)</h3>
            <p className={styles.panelHeaderSub}>
              IIVTNU — {plusvalia.aniosTenencia} años de tenencia
            </p>

            <div className={styles.panelLine}>
              <span>Valor catastral suelo</span>
              <strong>{formatCurrency(valorCatastralSuelo)}</strong>
            </div>
            <div className={styles.panelLine}>
              {/* Por debajo del año el coeficiente se prorratea por meses y la app no los pregunta:
                  es el TECHO con 11 meses (coeficienteIIVTNU), y con dos decimales 0,1375 se leía
                  «0,14» junto a una cuota calculada con 0,1375 (24/09/2026, hallazgo 1560). */}
              <span>
                {plusvalia.aniosTenencia < 1
                  ? 'Coeficiente, menos de 1 año (máximo: prorrateado a 11 meses)'
                  : `Coeficiente ${plusvalia.aniosTenencia} años`}
              </span>
              <strong>{formatNumber(plusvalia.coeficiente, plusvalia.aniosTenencia < 1 ? 4 : 2)}</strong>
            </div>
            <div className={styles.panelLine}>
              <span>Tipo municipal (orientativo)</span>
              <strong>{formatNumber(TIPO_MUNICIPAL_PLUSVALIA * 100, 0)}%</strong>
            </div>
            <div className={styles.panelLine}>
              <span>Método objetivo</span>
              <strong>{formatCurrency(plusvalia.metodoObjetivo)}</strong>
            </div>
            <div className={styles.panelLine}>
              <span>Método real (suelo)</span>
              <strong>
                {plusvalia.metodoElegido === 'exenta'
                  /*
                    'No sujeta' y no 'Exenta': el art. 104.5 TRLRHL lo articula como supuesto de
                    NO SUJECIÓN —el impuesto no llega a devengarse— y no como exención del art.
                    105, que presupone un hecho imponible realizado. El faqJsonLd de esta misma
                    página se toma la molestia de decirlo desde la reparación del hallazgo 783, y
                    el panel seguía diciendo lo contrario (hallazgo 866).
                  */
                  ? 'No sujeta (sin incremento)'
                  : formatCurrency(plusvalia.metodoReal)}
              </strong>
            </div>
            <div className={styles.panelLine}>
              <span>Método elegido</span>
              <strong>
                {plusvalia.metodoElegido === 'exenta'
                  ? 'No sujeta'
                  : plusvalia.metodoElegido === 'objetivo'
                  ? 'Objetivo (menor)'
                  : 'Real (menor)'}
              </strong>
            </div>
            <div className={styles.panelTotal}>
              <span>Cuota plusvalía municipal</span>
              <strong>{formatCurrency(plusvalia.cuotaFinal)}</strong>
            </div>
          </div>

          {/* Panel 3: IRPF */}
          <div className={styles.panelIRPF}>
            <h3 className={styles.panelHeaderTitle}>3. IRPF al vender</h3>
            <p className={styles.panelHeaderSub}>
              {aniosHastaVenta === 0
                ? 'Sin venta simulada'
                : `Venta a los ${aniosHastaVenta} años`}
            </p>

            {irpf === null ? (
              <p className={styles.muted}>
                Si no vendes (años = 0), no hay IRPF de ganancia patrimonial. La vivienda
                queda en tu patrimonio con el valor de referencia ISD como valor de adquisición fiscal.
              </p>
            ) : (
              <>
                <div className={styles.panelLine}>
                  <span>Valor adquisición fiscal*</span>
                  <strong>{formatCurrency(irpf.valorAdquisicionFiscal)}</strong>
                </div>
                <div className={styles.panelLine}>
                  <span>Valor de venta</span>
                  <strong>{formatCurrency(valorVenta)}</strong>
                </div>
                {plusvaliaVenta && (
                  <>
                    <div className={styles.panelLine}>
                      <span>
                        − Plusvalía municipal de la venta ({plusvaliaVenta.aniosTenencia < 1
                          ? 'menos de 1 año, coef. máximo'
                          : `${plusvaliaVenta.aniosTenencia} años, coef.`}{' '}
                        {formatNumber(plusvaliaVenta.coeficiente, plusvaliaVenta.aniosTenencia < 1 ? 4 : 2)})
                      </span>
                      <strong>−{formatCurrency(plusvaliaVenta.cuotaFinal)}</strong>
                    </div>
                    <div className={styles.panelLine}>
                      <span>= Valor de transmisión**</span>
                      <strong>{formatCurrency(irpf.valorTransmision)}</strong>
                    </div>
                  </>
                )}
                {/*
                  El cero no es una pérdida: se vende exactamente por el valor de adquisición
                  fiscal. `esPerdida` es `ganancia <= 0` —correcto para decidir que no hay
                  cuota— y rotularlo con él ponía «Pérdida patrimonial −0,00 €». Mismo criterio
                  con el que se repararon los hallazgos 823 y 845 en las apps de compraventa.
                  Medio céntimo es lo que la pantalla redondea a 0,00 €.
                */}
                <div className={styles.panelLine}>
                  <span>
                    {Math.abs(irpf.ganancia) < 0.005
                      ? 'Sin ganancia ni pérdida'
                      : irpf.esPerdida
                        ? 'Pérdida patrimonial'
                        : 'Ganancia patrimonial'}
                  </span>
                  <strong>
                    {Math.abs(irpf.ganancia) < 0.005
                      ? formatCurrency(0)
                      : irpf.esPerdida
                        ? `−${formatCurrency(Math.abs(irpf.ganancia))}`
                        : formatCurrency(irpf.ganancia)}
                  </strong>
                </div>
                {!irpf.esPerdida && (
                  <p className={styles.muted}>
                    Tramos: {TIPOS_AHORRO}
                  </p>
                )}
                <div className={styles.panelTotal}>
                  <span>Cuota IRPF venta</span>
                  <strong>{formatCurrency(irpf.cuota)}</strong>
                </div>
                <p className={styles.footnote}>
                  * Valor referencia ISD + cuota ISD + cuota plusvalía pagadas.
                </p>
                {plusvaliaVenta && (
                  <p className={styles.footnote}>
                    ** Precio menos los tributos inherentes a la transmisión satisfechos por el
                    vendedor (art. 35.2 LIRPF): la plusvalía municipal que se devenga en esta
                    segunda transmisión, y que pagas tú.
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Bloque total. `role="status"` + `aria-live`: los siete deslizadores recalculan
            todas las cifras y un lector de pantalla no se enteraba de nada, en una
            herramienta cuyo contenido entero es el resultado (hallazgo 613). */}
        <div className={styles.bloqueTotal} role="status" aria-live="polite" aria-atomic="true">
          <h2 className={styles.bloqueTitle}>Coste fiscal total acumulado</h2>
          <div className={styles.bloqueGrid}>
            <div className={styles.bloqueCard}>
              <span>ISD</span>
              <strong>{formatCurrency(isd.cuotaFinal)}</strong>
            </div>
            {regularizacionVivienda > 0 && (
              <div className={styles.bloqueCard}>
                <span>+ ISD regularizado (venta antes de {aniosMantenimiento} años)</span>
                <strong>{formatCurrency(regularizacionVivienda)}</strong>
              </div>
            )}
            <div className={styles.bloqueCard}>
              <span>+ Plusvalía municipal (herencia)</span>
              <strong>{formatCurrency(plusvalia.cuotaFinal)}</strong>
            </div>
            {plusvaliaVenta && (
              <div className={styles.bloqueCard}>
                <span>+ Plusvalía municipal (venta)</span>
                <strong>{formatCurrency(plusvaliaVenta.cuotaFinal)}</strong>
              </div>
            )}
            <div className={styles.bloqueCard}>
              <span>+ IRPF venta</span>
              <strong>{formatCurrency(irpf?.cuota ?? 0)}</strong>
            </div>
            <div className={styles.bloqueCardTotal}>
              <span>= TOTAL</span>
              <strong>{formatCurrency(totalImpuestos)}</strong>
            </div>
          </div>
          {plusvaliaVenta && (
            <p className={styles.bloqueNota}>
              El IIVTNU se devenga en <strong>cada</strong> transmisión y en la venta lo paga el
              vendedor, que aquí eres tú: son {aniosHastaVenta} años de tenencia sobre el mismo
              valor catastral del suelo. Esa cuota se descuenta además del valor de transmisión
              en el IRPF (art. 35.2 LIRPF), así que el total no sube en su importe entero.
            </p>
          )}
          {aniosHastaVenta > 0 && valorVenta > 0 && (
            <p className={styles.bloquePorc}>
              Representa el <strong>{formatNumber(porcSobreVenta, 2)}%</strong> del valor de venta
              ({formatCurrency(valorVenta)}).
            </p>
          )}
        </div>
      </main>

      <EducationalSection
        title="Guía Heredar y Vender Vivienda"
        subtitle="ISD, plusvalía municipal e IRPF en cadena"
      >
        <h3>Los tres impuestos en cadena</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Impuesto</th>
                <th>Cuándo se paga</th>
                <th>Cómo se calcula</th>
                <th>Quién lo paga</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>ISD</strong> (Sucesiones)</td>
                <td>Plazo {PLAZO_ISD.mesesPresentacion} meses tras el fallecimiento (prorrogable otros {PLAZO_ISD.mesesProrroga} meses, art. 68 RISD)</td>
                <td>Sobre valor de referencia, con tarifa estatal o autonómica + bonificación CCAA</td>
                <td>Heredero (cada uno por su parte)</td>
              </tr>
              <tr>
                <td><strong>Plusvalía municipal (IIVTNU)</strong></td>
                {/*
                  El plazo del IIVTNU sale ya de SU norma (art. 110.2.b TRLRHL), no de la
                  constante del ISD: coinciden hoy en seis meses, pero son tributos distintos
                  ante administraciones distintas y con prórrogas distintas — la del IIVTNU
                  llega «hasta un año» y no tiene el corte de los cinco primeros meses del
                  art. 68 RISD (hallazgo 864).
                */}
                <td>Plazo {PLAZO_IIVTNU.mesesMortisCausa} meses tras el fallecimiento (prorrogable hasta {PLAZO_IIVTNU.mesesMaximoConProrroga} meses en TOTAL a solicitud, art. 110.2.b TRLRHL)</td>
                <td>Método objetivo (valor catastral suelo × coef.) o método real (ganancia real prorrateada al suelo). Se elige el menor.</td>
                <td>Heredero. Paga al Ayuntamiento.</td>
              </tr>
              <tr>
                <td><strong>IRPF</strong> (ganancia patrimonial)</td>
                <td>Año siguiente a la venta (campaña Renta)</td>
                {/* La fórmula tiene que ser la que el motor ejecuta: desde el hallazgo 779 la
                    app resta del precio la plusvalía municipal de la VENTA (art. 35.2 LIRPF)
                    antes de comparar, y lo pinta en dos líneas del panel. Esta fila se quedó en
                    la versión anterior —la misma que el hallazgo 862 retiró del faqJsonLd—, y
                    sobre el CASO 1 daba 53.401,20 € de ganancia donde la app calcula 48.601,20 €
                    (hallazgo 1180). */}
                <td>(Valor de transmisión − valor adquisición fiscal) × tramos {TIPO_AHORRO_MIN}-{TIPO_AHORRO_MAX}%. El valor de transmisión es el precio de venta menos la plusvalía municipal de la venta (art. 35.2 LIRPF), y el valor de adquisición fiscal incluye los impuestos pagados al heredar.</td>
                <td>El que vende (heredero, si vendes)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className={styles.tableNote}>
          La secuencia es siempre: ISD + plusvalía al heredar (mismo plazo de {PLAZO_ISD.mesesPresentacion} meses), e IRPF
          solo si después decides vender. Si conservas la vivienda como tuya, no hay IRPF.
        </p>

        <h3>Casos típicos</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <h4>Hijo hereda piso vivienda habitual del padre</h4>
            <p>
              Reducción de parentesco ({formatCurrency(REDUCCIONES_PARENTESCO_IS['II'] ?? 0)}) + reducción
              vivienda habitual del {PORC_REDUCCION_VIVIENDA}% (hasta {formatCurrency(REDUCCION_VIVIENDA_MAX_IS)}). En las
              comunidades de régimen común que bonifican la cuota al 99% o más
              ({CCAA_BONIFICACION_CASI_TOTAL.join(', ')}) el ISD se queda en casi nada — Aragón, eso sí,
              deja de bonificar del todo por encima de 3.000.000 € de base liquidable. Ojo con las que
              bonifican <strong>por tramos</strong>: Castilla-La Mancha empieza en el 100% pero baja al
              80% por encima de 300.000 € de base liquidable, y Cantabria baja del 100% al 99% a partir
              de 100.000 €. País Vasco bonifica también cerca del 99%, pero es régimen foral: la cifra
              real depende de la Hacienda Foral correspondiente (Álava, Bizkaia o Gipuzkoa) y exige
              consulta obligatoria. Cambia la comunidad en el selector de arriba y el cálculo lo dice.
              En cualquier caso quedan la plusvalía municipal y, si vende, el IRPF.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <h4>Cónyuge viudo hereda</h4>
            <p>
              Mismo trato que descendientes (Grupo II). Importante: el cónyuge viudo en gananciales
              ya es titular del 50% antes de la herencia (no es "heredero" de esa parte). Solo
              hereda lo que es privativo del fallecido o el 50% de los gananciales.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <h4>Hermano o sobrino hereda (Grupo III)</h4>
            <p>
              Reducción de parentesco mucho menor ({formatCurrency(REDUCCIONES_PARENTESCO_IS['III'] ?? 0)}) y coeficiente multiplicador {formatNumber(COEFICIENTES_IS['III'][0], 4)}.
              La mayoría de CCAA NO bonifican al Grupo III. Resultado: tributación notable, a
              menudo decenas de miles de euros sobre 200-300k.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <h4>Heredero del Grupo IV (sin parentesco)</h4>
            <p>
              Coeficiente multiplicador {formatNumber(COEF_GRUPO_IV_MIN, 1)} y sin reducciones. Casi ninguna CCAA bonifica.
              Heredar 200.000 € supone {formatCurrency(EJEMPLO_GRUPO_IV.cuotaFinal)} de ISD en
              régimen común, y más con un patrimonio previo alto (el coeficiente llega a {formatNumber(COEFICIENTES_IS['IV'][COEFICIENTES_IS['IV'].length - 1], 1)}).
              Conviene valorar si compensa renunciar a la herencia (la herencia es siempre
              voluntaria). Simula tu caso arriba: cada CCAA cambia el resultado.
            </p>
          </div>
        </div>

        <h3>Preguntas frecuentes</h3>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <strong>¿Cuál es la diferencia entre ISD y plusvalía municipal?</strong>
            <p>
              El <em>ISD</em> es un impuesto estatal cedido a las CCAA que grava el incremento
              patrimonial del heredero (lo que recibe). Se paga sobre el valor de referencia. La{' '}
              <em>plusvalía municipal (IIVTNU)</em> es un impuesto del Ayuntamiento que grava
              específicamente el aumento del valor del terreno urbano desde la última transmisión.
              Se calcula sobre el valor catastral del suelo. Son impuestos distintos: pagas los dos.
            </p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Cuál es el plazo para liquidar el ISD?</strong>
            <p>
              {PLAZO_ISD.mesesPresentacion} meses desde el fallecimiento ({PLAZO_ISD.norma}). Se puede pedir
              una prórroga de otros {PLAZO_ISD.mesesProrroga} meses dentro de los{' '}
              {PLAZO_ISD.mesesParaPedirProrroga} primeros, pero no sale gratis: devenga intereses de
              demora desde que vencen los {PLAZO_ISD.mesesPresentacion} meses hasta que presentas. Si superas el plazo sin liquidar, el recargo se debe desde el primer
              día: un {ESCALA_RECARGO_EXTEMPORANEO.porcentajeBase}% de partida más otro{' '}
              {ESCALA_RECARGO_EXTEMPORANEO.porcentajePorMes}% por cada mes completo de retraso, y el{' '}
              {ESCALA_RECARGO_EXTEMPORANEO.porcentajeMas12Meses}% más intereses de demora una vez
              transcurridos {ESCALA_RECARGO_EXTEMPORANEO.mesesEscalaProporcional} meses
              ({ESCALA_RECARGO_EXTEMPORANEO.baseNormativa}). Es clave: el reloj corre desde el
              fallecimiento, no desde que tú te enteras.
            </p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Y si renuncio a la herencia?</strong>
            <p>
              La renuncia es válida y libera de pagar el ISD. Pero debe ser pura, simple y gratuita
              ante notario. Si renuncias en favor de otra persona, Hacienda lo trata como una
              donación y tributa doble (ISD + donación). Si la herencia tiene deudas, se puede
              aceptar "a beneficio de inventario" para no responder con tu patrimonio personal.
            </p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿La plusvalía municipal se paga si hay pérdida?</strong>
            <p>
              No, desde el RDL 26/2021. Si demuestras que no ha habido incremento real del valor
              del terreno entre la fecha de adquisición original y la transmisión, la transmisión
              NO está sujeta al impuesto (art. 104.5 TRLRHL): no es una exención, es que el hecho
              imponible no llega a producirse. Hay que aportar prueba (escrituras de compra y herencia). El método
              real también permite elegir la base más baja entre el método objetivo y el real.
            </p>
          </div>
          <div className={styles.faqItem}>
            <strong>Si vendo en menos de 1 año, ¿hay diferencia en el IRPF?</strong>
            <p>
              No. En España, las ganancias patrimoniales de inmuebles tributan siempre en la
              base del ahorro ({TIPO_AHORRO_MIN}-{TIPO_AHORRO_MAX}%) sea cual sea el plazo de tenencia. Los tramos son:{' '}
              {ESCALA_AHORRO.map((tramo, i) => (
                <span key={tramo.tipo}>
                  {i > 0 && ', '}
                  {tramo.tipo}% ({Number.isFinite(tramo.hasta) ? `hasta ${formatCurrency(tramo.hasta)}` : `más de ${formatCurrency(ESCALA_AHORRO[i - 1].hasta)}`})
                </span>
              ))}.
            </p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Cómo afecta que fuera la vivienda habitual del fallecido?</strong>
            <p>
              Hay reducción del {PORC_REDUCCION_VIVIENDA}% en la base imponible del ISD para cónyuge, descendientes,
              ascendientes o un colateral de {EDAD_MIN_COLATERAL_VIVIENDA} años o más que conviviera con el fallecido los
              últimos 2 años. El tope estatal es {formatCurrency(REDUCCION_VIVIENDA_MAX_IS)}/heredero (cada CCAA puede mejorarlo).
              Requisito: mantener la vivienda al menos {REDUCCION_VIVIENDA_ANIOS_MANTENIMIENTO_IS} años
              (art. 20.2.c LISD). Algunas CCAA piden menos: en Cataluña son {REDUCCION_VIVIENDA_ANIOS_MANTENIMIENTO_CATALUNA_IS} años
              (art. 19 de la Ley 19/2010). Si la vendes antes, pierdes la reducción retroactivamente.
            </p>
          </div>
        </div>

        <h3>Pasos cronológicos tras el fallecimiento</h3>
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Certificado de defunción y de últimas voluntades</strong>
              <p>
                Defunción: en el Registro Civil. Últimas voluntades: 15 días después del
                fallecimiento, en el Ministerio de Justicia. Te dirá si hay testamento y ante
                qué notario.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Aceptar o renunciar la herencia ante notario</strong>
              <p>
                Con o sin testamento. Si hay varios herederos, deben acudir todos. Inventario
                de bienes y deudas. Es el momento de plantear "aceptación a beneficio de
                inventario" si hay deudas.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Liquidar ISD y plusvalía municipal ({PLAZO_ISD.mesesPresentacion} meses)</strong>
              <p>
                ISD: ante la Hacienda autonómica de la CCAA donde residía el fallecido. Plusvalía
                municipal: ante el Ayuntamiento donde está el inmueble. Si necesitas más tiempo,
                pide prórroga antes de los {PLAZO_ISD.mesesParaPedirProrroga} meses (con intereses de demora).
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Inscribir en el Registro de la Propiedad</strong>
              <p>
                Con la escritura de aceptación de herencia y las cartas de pago de ISD y
                plusvalía. Sin esta inscripción no podrás vender.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Si decides vender: declarar ganancia en IRPF</strong>
              <p>
                En la declaración de la Renta del año siguiente a la venta. Valor de adquisición =
                valor declarado en ISD + ISD pagado + plusvalía municipal pagada + gastos
                inherentes. Valor de transmisión = precio de venta − la plusvalía municipal de la
                venta (art. 35.2 LIRPF), que es lo único que esta calculadora descuenta, y −
                los demás gastos que soportes al vender (notaría, gestoría o comisión
                inmobiliaria), que no se modelan aquí.
              </p>
            </div>
          </div>
        </div>

        <h3>Buenas prácticas</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📅</span>
            <div>
              <strong>No esperes al último mes</strong>
              <p>El plazo de ISD es de {PLAZO_ISD.mesesPresentacion} meses. Empieza con el inventario en cuanto tengas el certificado de últimas voluntades.</p>
            </div>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📍</span>
            <div>
              <strong>El ISD lo cobra la CCAA del fallecido</strong>
              <p>No la del heredero. Si el fallecido vivía en Madrid y tú en Cataluña, pagas en Madrid (mucho más beneficioso en este caso).</p>
            </div>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🏛️</span>
            <div>
              <strong>Régimen foral: consulta obligatoria</strong>
              <p>País Vasco y Navarra tienen normativas propias muy distintas. La estimación de esta app es solo orientativa.</p>
            </div>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">💰</span>
            <div>
              <strong>Aprovecha la reducción de vivienda habitual</strong>
              {/* «Estatal», como ya dice su vecina de la FAQ: la tarjeta es texto fijo del
                  bloque educativo y no puede seguir al selector, pero sí dejar de prometer
                  como universal un tope que en Cataluña es cuatro veces mayor (hallazgo 1179,
                  la mitad del 861 que quedó sin reparar). */}
              <p>Si era residencia habitual del fallecido y eres cónyuge/descendiente/ascendiente, la reducción del {PORC_REDUCCION_VIVIENDA}% (hasta {formatCurrency(REDUCCION_VIVIENDA_MAX_IS)} por heredero según el tope estatal, que cada comunidad autónoma puede mejorar: en Cataluña son {formatCurrency(REDUCCION_VIVIENDA_MAX_CATALUNA_IS)}) puede ser decisiva.</p>
            </div>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📝</span>
            <div>
              <strong>Suma los impuestos pagados al valor de adquisición</strong>
              <p>Al vender, el valor de adquisición fiscal incluye ISD y plusvalía municipal pagados al heredar. Reduce la ganancia patrimonial y por tanto el IRPF.</p>
            </div>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">👤</span>
            <div>
              <strong>Asesor fiscal para casos complejos</strong>
              <p>Múltiples inmuebles, herederos en distintos países, deudas, empresa familiar, herencia con donaciones previas… consulta siempre con un profesional.</p>
            </div>
          </div>
        </div>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            Errores frecuentes a evitar
          </div>
          <ul className={styles.warningList}>
            <li>Confundir el valor catastral (más bajo) con el valor de referencia (base ISD desde 2022).</li>
            <li>No declarar la herencia pensando que "como no hay dinero líquido, no pasa nada": el plazo corre y los recargos llegan automáticamente.</li>
            <li>Renunciar a favor de otra persona: tributa como donación + ISD (doble coste).</li>
            <li>Olvidar la plusvalía municipal: es un impuesto distinto del ISD, ante el Ayuntamiento, que también vence a los {PLAZO_IIVTNU.mesesMortisCausa} meses ({PLAZO_IIVTNU.baseNormativa}).</li>
            <li>Vender antes del plazo de mantenimiento cuando se aplicó la reducción de vivienda habitual: pierdes la reducción retroactivamente. Son {REDUCCION_VIVIENDA_ANIOS_MANTENIMIENTO_IS} años con la norma estatal y {REDUCCION_VIVIENDA_ANIOS_MANTENIMIENTO_CATALUNA_IS} en Cataluña.</li>
            <li>Calcular la ganancia patrimonial al vender sin sumar ISD ni plusvalía pagados al valor de adquisición fiscal: pagas IRPF de más.</li>
          </ul>
          <p className={styles.warningFootnote}>
            Datos basados en {PLUSVALIA_MUNICIPAL_META.baseNormativa}. Verificación{' '}
            {PLUSVALIA_MUNICIPAL_META.verificado}.
          </p>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-heredar-vivienda')} />
      <ShareCard appName="simulador-heredar-vivienda" />
      <Footer appName="simulador-heredar-vivienda" />
    </div>
  );
}
