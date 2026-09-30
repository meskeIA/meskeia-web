'use client';

import { useState, useMemo } from 'react';
import styles from './EstimadorSucesiones.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, ShareCard, LegalNotice, DisclaimerCard,
  DataReference, RegionBadge
} from '@/components';
import { formatCurrency, formatDate, formatNumber, formatPercentage, parseISODateLocal, parseSpanishNumber } from '@/lib';
import {
  ESCALA_RECARGO_EXTEMPORANEO,
  porcentajeRecargoExtemporaneo,
} from '@/lib/calculadoras/recargoPresentacionTardia';
import { getRelatedApps } from '@/data/app-relations';
import {
  FISCAL_SUCESIONES_META,
  FISCAL_SUCESIONES_CATALUNA_META,
  TARIFA_ESTATAL_IS,
  TARIFA_CATALUNA_IS,
  COEFICIENTES_IS,
  COEFICIENTES_CATALUNA_IS,
  LIMITES_PATRIMONIO_PREEXISTENTE_IS,
  indiceTramoPatrimonioIS,
  cuotaTributariaConCorreccionIS,
  REDUCCIONES_PARENTESCO_IS,
  REDUCCIONES_PARENTESCO_CATALUNA_IS,
  REDUCCION_EDAD_MENOR_21_IS,
  REDUCCION_EDAD_MENOR_21_MAX_IS,
  REDUCCION_EDAD_MENOR_21_CATALUNA_IS,
  REDUCCION_EDAD_MENOR_21_MAX_CATALUNA_IS,
  REDUCCION_SEGURO_VIDA_MAX_IS,
  PLAZO_ISD,
  REDUCCION_VIVIENDA_MAX_IS,
  REDUCCION_VIVIENDA_PORC_IS,
  REDUCCION_VIVIENDA_MAX_CATALUNA_IS,
  REDUCCION_VIVIENDA_MIN_INDIVIDUAL_CATALUNA_IS,
  VALORACION_USUFRUCTO_IS,
  porcentajeUsufructoVitalicio,
  REDUCCION_VIVIENDA_ANIOS_MANTENIMIENTO_IS,
  REDUCCION_VIVIENDA_ANIOS_MANTENIMIENTO_CATALUNA_IS,
  REDUCCION_DISCAPACIDAD_33_IS,
  REDUCCION_DISCAPACIDAD_65_IS,
  REDUCCION_EMPRESA_FAMILIAR_IS,
  REDUCCION_EMPRESA_FAMILIAR_CATALUNA_IS,
  PORC_AJUAR_DOMESTICO_IS,
  BONIFICACIONES_CCAA_IS,
  TramoTarifaIS,
  BonificacionGrupoIS,
} from '@/data/fiscal';
import {
  evaluarReduccionVivienda,
  calcularSucesion,
  porcentajeBonificacionPonderada,
  EDAD_MIN_COLATERAL_VIVIENDA_IS,
} from '@/lib/calculadoras/sucesiones';

// ─── Tipos ────────────────────────────────────────────────────────────────────

// 'II' es el HIJO de 21 o más y 'II-descendiente' el nieto o bisnieto de esa edad: Cataluña
// les da 100.000 € y 50.000 € respectivamente (art. 2 Ley 19/2010) y el régimen común no los
// distingue. Ver el tipo `GrupoParentescoIS` del motor, con el que este debe coincidir.
type GrupoParentesco = 'I-conyuge' | 'I-descendiente' | 'II' | 'II-descendiente' | 'II-ascendiente' | 'III' | 'IV';
type TipoAdquisicion = 'plena' | 'usufructo' | 'nuda';
type NivelDiscapacidad = '0' | '33' | '65';

interface DetalleReduccion {
  concepto: string;
  importe: number;
}

interface ResultadoSucesiones {
  // Masa hereditaria
  totalActivos: number;
  totalDeudas: number;
  masaHereditaria: number;
  ajuarDomestico: number;
  /** Hay seguro de vida en la masa y el ajuar no lo ha tomado como caudal relicto (hallazgo 1824) */
  segurosFueraDelAjuar: boolean;
  baseImponible: number;
  // Adquisición
  porcentajeAdquisicion: number;
  baseAjustada: number;
  // Reducciones
  reducciones: DetalleReduccion[];
  totalReducciones: number;
  /** Por qué NO se ha aplicado la reducción de vivienda habitual, si se declaró una y no cuenta */
  viviendaNoAplicada: string | null;
  baseLiquidable: number;
  // Liquidación
  cuotaIntegra: number;
  coeficienteMultiplicador: number;
  /** Lo que la corrección del salto del art. 22.2 LISD resta de la cuota (0 si no procede) */
  correccionSalto: number;
  cuotaTributaria: number;
  // Bonificación
  bonificacionCcaa: number;
  porcentajeBonificacion: number;
  detalleBonificacion: string;
  cuotaFinal: number;
  // Meta
  tipoEfectivo: number;
  /** El porcentaje de herencia REALMENTE aplicado, ya capado entre 0 y 1 (hallazgo 798). */
  porcentajeHerenciaAplicado: number;
  ccaaNombre: string;
  esForal: boolean;
}

// ─── Funciones de cálculo ─────────────────────────────────────────────────────

function calcularTarifa(base: number, tarifa: TramoTarifaIS[]): number {
  if (base <= 0) return 0;
  let prevHasta = 0;
  for (const tramo of tarifa) {
    if (base <= tramo.hasta) {
      return tramo.cuota + (base - prevHasta) * (tramo.tipo / 100);
    }
    prevHasta = tramo.hasta;
  }
  return 0;
}

function getGrupoBase(grupo: string): string {
  if (grupo === 'I-conyuge' || grupo === 'I-descendiente') return 'I';
  if (grupo === 'II' || grupo === 'II-descendiente' || grupo === 'II-ascendiente') return 'II';
  if (grupo === 'III') return 'III';
  return 'IV';
}

/**
 * Ninguna comunidad distingue al nieto del hijo para BONIFICAR la cuota: la distinción del
 * art. 2 de la Ley 19/2010 es solo de reducción en base. Sin este colapso, un nieto se
 * quedaría sin la bonificación del 99 % porque `bonificaciones['II-descendiente']` no existe
 * en ninguna de las 17 comunidades. Igual que `claveBonificacion` en el motor.
 */
function claveBonificacion(grupo: string): string {
  return grupo === 'II-descendiente' ? 'II' : grupo;
}

function aplicarBonificacion(
  cuotaTributaria: number,
  baseLiquidable: number,
  grupo: string,
  ccaa: string,
  baseImponible: number
): { bonificacion: number; porcentaje: number; detalle: string } {

  const config = BONIFICACIONES_CCAA_IS[ccaa];
  if (!config) return { bonificacion: 0, porcentaje: 0, detalle: 'CCAA no configurada' };

  const bGrupo: BonificacionGrupoIS | undefined = config.bonificaciones[claveBonificacion(grupo)];
  if (!bGrupo) return { bonificacion: 0, porcentaje: 0, detalle: 'Sin bonificación para este grupo' };

  // Asturias: reducción en base (no bonificación), ya aplicada antes
  if (bGrupo.reduccionBase !== undefined) {
    return { bonificacion: 0, porcentaje: 0, detalle: 'Reducción aplicada en base liquidable' };
  }

  /**
   * Cataluña (art. 58 bis Ley 19/2010): escala PONDERADA sobre la base IMPONIBLE, no un tramo
   * plano sobre la liquidable como el `escalonado` de abajo. La regla la sirve el motor de
   * sucesiones —`porcentajeBonificacionPonderada`—, que es el mismo que ejecuta el MCP: escribir
   * aquí una segunda copia es exactamente lo que produjo los hallazgos 277, 461 y 462.
   */
  if (bGrupo.escalaPonderada && bGrupo.escalaPonderada.length > 0) {
    const pct = porcentajeBonificacionPonderada(baseImponible, bGrupo.escalaPonderada);
    return {
      bonificacion: cuotaTributaria * pct,
      porcentaje: pct * 100,
      detalle: `Bonificación ${formatPercentage(pct, 2)} por escala del art. 58 bis (${config.nombre})`,
    };
  }

  // Exención total por importe
  if (bGrupo.exencion !== undefined && baseLiquidable < bGrupo.exencion) {
    return {
      bonificacion: cuotaTributaria,
      porcentaje: 100,
      detalle: `Exención total (base < ${formatCurrency(bGrupo.exencion)})`,
    };
  }

  // Bonificación escalonada (Castilla-La Mancha, Cantabria)
  if (bGrupo.escalonado && bGrupo.escalonado.length > 0) {
    let tramoSeleccionado = bGrupo.escalonado[bGrupo.escalonado.length - 1];
    for (const t of bGrupo.escalonado) {
      if (t.hasta !== undefined && baseLiquidable <= t.hasta) {
        tramoSeleccionado = t;
        break;
      }
    }
    const bonif = cuotaTributaria * tramoSeleccionado.porcentaje;
    return {
      bonificacion: bonif,
      porcentaje: tramoSeleccionado.porcentaje * 100,
      detalle: `Bonificación ${formatPercentage(tramoSeleccionado.porcentaje, 0)} (${config.nombre})`,
    };
  }

  // Bonificación con tope (La Rioja)
  if (bGrupo.tope !== undefined && bGrupo.porcentajeMayor !== undefined && baseLiquidable > bGrupo.tope) {
    const bonif = cuotaTributaria * bGrupo.porcentajeMayor;
    return {
      bonificacion: bonif,
      porcentaje: bGrupo.porcentajeMayor * 100,
      detalle: `Bonificación ${formatPercentage(bGrupo.porcentajeMayor, 0)} (base supera ${formatCurrency(bGrupo.tope)})`,
    };
  }

  // Bonificación con límite de base (Aragón)
  if (bGrupo.limite !== null && bGrupo.limite !== undefined && baseLiquidable > bGrupo.limite) {
    return {
      bonificacion: 0,
      porcentaje: 0,
      detalle: `Sin bonificación (base supera el límite de ${formatCurrency(bGrupo.limite)})`,
    };
  }

  // Bonificación fija
  if (bGrupo.porcentaje !== undefined && bGrupo.porcentaje > 0) {
    const bonif = cuotaTributaria * bGrupo.porcentaje;
    return {
      bonificacion: bonif,
      porcentaje: bGrupo.porcentaje * 100,
      detalle: `Bonificación ${formatPercentage(bGrupo.porcentaje, 1)} (${config.nombre})`,
    };
  }

  return { bonificacion: 0, porcentaje: 0, detalle: 'Sin bonificación autonómica' };
}

/**
 * Los diez campos de importe, en UNA sola lista.
 *
 * El `id` es lo que permite que cada `<label>` tenga su `htmlFor` y que el control tenga
 * nombre accesible: hasta el 11/09/2026 las etiquetas se pintaban como hermanas del control,
 * sin asociar, y un lector de pantalla anunciaba «edición, 0,00» catorce veces seguidas sin
 * decir de qué concepto de la masa hereditaria se trataba (hallazgo 741).
 *
 * La etiqueta vive aquí y no en el JSX porque el aviso de importe inválido la nombra: si cada
 * sitio tuviera la suya, el aviso acabaría señalando un campo que en pantalla se llama de otra
 * manera.
 */
const CAMPOS_BIENES = [
  { id: 'saldos-cuentas', etiqueta: 'Saldos en cuentas bancarias', icono: '💳' },
  { id: 'acciones-fondos', etiqueta: 'Acciones, fondos y productos financieros', icono: '📊' },
  { id: 'vivienda-habitual', etiqueta: 'Vivienda habitual', icono: '🏠' },
  { id: 'otros-inmuebles', etiqueta: 'Otros inmuebles', icono: '🏢' },
  { id: 'vehiculos', etiqueta: 'Vehículos', icono: '🚗' },
  { id: 'seguros-vida', etiqueta: 'Seguros de vida', icono: '📋' },
  { id: 'otros-bienes', etiqueta: 'Otros bienes', icono: '📦' },
] as const;

const CAMPOS_DEUDAS = [
  { id: 'hipotecas', etiqueta: 'Hipotecas y préstamos hipotecarios' },
  { id: 'otros-prestamos', etiqueta: 'Otros préstamos y deudas' },
  { id: 'gastos-sepelio', etiqueta: 'Gastos de sepelio' },
] as const;

// ─── Componente ───────────────────────────────────────────────────────────────

/**
 * El ejemplo de la tarjeta «Hijo adulto hereda piso», resuelto por el MOTOR.
 *
 * ⚠️ 13/09/2026 — iba escrito a mano con la tarifa DEROGADA de siete tramos y se quedaba
 * 1.200 € por debajo de lo que liquida la propia herramienta con esos mismos datos: «cuota
 * íntegra ~6.100 €» y «cuota final ~61 €» frente a 7.300,03 € y 73,00 € (hallazgo 794). Su
 * aritmética era internamente coherente, así que nada la delataba salvo ejecutar la app — y
 * el usuario lee estas tarjetas como confirmación del número que acaba de obtener. Es el
 * gemelo del hallazgo 737, que el 11/09 sí recalculó la tarjeta del sobrino de Asturias.
 *
 * Derivarlo, y no corregir el número, es lo que impide que vuelva a separarse.
 */
/**
 * El piso del ejemplo, declarado UNA vez: es a la vez la base imponible y la vivienda
 * habitual que se reduce, y el desarrollo que se enseña al usuario partía de otra cifra
 * —190.000 €— que no aparece en ningún otro sitio de la tarjeta (hallazgo 820). El
 * resultado no cambiaba, porque los dos productos superan el tope estatal, pero la
 * aritmética que se enseña tiene que ser la del ejemplo.
 */
const EJEMPLO_MADRID_PISO = 200000;
const EJEMPLO_MADRID = calcularSucesion({
  baseImponible: EJEMPLO_MADRID_PISO,
  ccaa: 'madrid',
  grupo: 'II',
  edadHeredero: 45,
  viviendaHabitual: EJEMPLO_MADRID_PISO,
  incluyeAjuar: true,
});

/**
 * La tarjeta de la viuda catalana, por el mismo motivo y con el mismo remedio.
 *
 * ⚠️ 14/09/2026 (hallazgo 815) — anunciaba «base liquidable 400.000 € y cuota 57.000 €» y a
 * continuación llamaba a esa cifra «el techo, no la factura». Con esos mismos datos la
 * herramienta liquida 606,00 €: el número escrito a mano se saltaba el ajuar del 3 % que la
 * app siempre añade (base 515.000 €, liquidable 415.000 €) y, sobre todo, la bonificación
 * del 99 % del cónyuge catalán (art. 58 bis.1 de la Ley 19/2010) que la ficha de Cataluña
 * anuncia dos bloques más arriba en esta misma página. El usuario lee estas tarjetas como
 * confirmación del número que acaba de obtener, y aquí era 94 veces mayor.
 */
const EJEMPLO_CATALUNA = calcularSucesion({
  baseImponible: 500000,
  ccaa: 'cataluna',
  grupo: 'I-conyuge',
  edadHeredero: 60,
  incluyeAjuar: true,
});

/**
 * La comparativa Asturias/Madrid del bloque «Diferencias entre CCAA», por el mismo motivo.
 *
 * ⚠️ 14/09/2026 (hallazgo 816) — el párrafo invoca a la herramienta como testigo («esta misma
 * calculadora liquida...») y la herramienta lo desmentía: decía 111,11 € en Madrid y la app
 * daba 154,74 €, un 39 % por encima, que es además el valor que fija el test de regresión
 * desde el 11/09/2026. Un texto que cita a la calculadora tiene que EJECUTARLA.
 */
const COMPARATIVA_CCAA = { baseImponible: 250000, viviendaHabitual: 200000 } as const;
const EJEMPLO_ASTURIAS = calcularSucesion({
  baseImponible: COMPARATIVA_CCAA.baseImponible,
  ccaa: 'asturias',
  grupo: 'II',
  edadHeredero: 45,
  viviendaHabitual: COMPARATIVA_CCAA.viviendaHabitual,
  incluyeAjuar: true,
});
const EJEMPLO_MADRID_COMPARATIVA = calcularSucesion({
  baseImponible: COMPARATIVA_CCAA.baseImponible,
  ccaa: 'madrid',
  grupo: 'II',
  edadHeredero: 45,
  viviendaHabitual: COMPARATIVA_CCAA.viviendaHabitual,
  incluyeAjuar: true,
});

/**
 * La tarjeta del sobrino asturiano, que era la última de las cuatro con la aritmética
 * TECLEADA A MANO.
 *
 * ⚠️ 21/09/2026 (hallazgos 1152 y 1153) — escribía a mano los 2.400 € de ajuar, los 50.000 €
 * de la reducción de Asturias, los 24.406,54 € de base liquidable, los 2.081,95 € de cuota
 * íntegra, el coeficiente 1,5882 y los 3.306,56 € de cuota final; solo la reducción de
 * parentesco se derivaba. Las cifras eran correctas —verificadas contra la herramienta—,
 * pero es exactamente la forma que ya se separó dos veces en este mismo fichero (hallazgos
 * 794, 815 y 816), y los 50.000 € y el 1,5882 están sellados en `BONIFICACIONES_CCAA_IS` y
 * `COEFICIENTES_IS`. Al derivarla desaparece además la segunda mitad del defecto: la tarjeta
 * escribía «2.081,95 €» y «3.306,56 €» con punto de millar y el panel de resultados, para
 * esos mismos datos, «2081,95 €» y «3306,56 €», que es lo que da `formatCurrency` (en es-ES
 * un número de cuatro cifras enteras no lleva separador de millar).
 */
const EJEMPLO_SOBRINO_CUENTA = 80000;
const EJEMPLO_SOBRINO = calcularSucesion({
  baseImponible: EJEMPLO_SOBRINO_CUENTA,
  ccaa: 'asturias',
  grupo: 'III',
  edadHeredero: 45,
  incluyeAjuar: true,
});

/** Importe en euros para la prosa: mismo formato que el resto de la página. */
const euros = (n: number) => formatCurrency(n);

/**
 * Porcentaje para la pantalla, a partir de PUNTOS (95 → «95 %»), con el `%` separado por un
 * espacio duro: CLAUDE.md global §2 desde el 25/09/2026 (hallazgo 1833). Toda cifra con `%`
 * de la página pasa por aquí o escribe `&nbsp;%` a mano en la prosa sin cifra derivada.
 */
const pct = (puntos: number, decimales = 0) => formatPercentage(puntos / 100, decimales);

/**
 * Lo que el Grupo III recibe en cada comunidad de régimen común, CONTADO en `data/fiscal`.
 *
 * ⚠️ 25/09/2026 (hallazgo 1829) — el consejo de la tarjeta del sobrino tecleaba «doce
 * comunidades del régimen común no le dan nada» cuando en `BONIFICACIONES_CCAA_IS` son diez,
 * y a su lado las cifras de Asturias, Madrid, Murcia y Canarias. Contarlas aquí impide que la
 * frase vuelva a separarse de la tabla que la sostiene.
 */
const COMUNES_GRUPO_III = Object.entries(BONIFICACIONES_CCAA_IS).filter(
  ([, c]) => c.regimen === 'comun',
);
const COMUNES_SIN_NADA_GRUPO_III = COMUNES_GRUPO_III.filter(([, c]) => {
  const iii = c.bonificaciones['III'];
  return !(iii?.porcentaje ?? 0) && !(iii?.reduccionBase ?? 0);
}).length;
const ASTURIAS_REDUCCION_GRUPO_III = BONIFICACIONES_CCAA_IS['asturias'].bonificaciones['III']?.reduccionBase ?? 0;
const BONIF_GRUPO_III = (ccaa: string) => (BONIFICACIONES_CCAA_IS[ccaa].bonificaciones['III']?.porcentaje ?? 0) * 100;

/** «el 50 %» si Madrid y Murcia bonifican lo mismo al Grupo III, «el X % y el Y %» si no. */
const MADRID_MURCIA_GRUPO_III = BONIF_GRUPO_III('madrid') === BONIF_GRUPO_III('murcia')
  ? `el ${pct(BONIF_GRUPO_III('madrid'))}`
  : `el ${pct(BONIF_GRUPO_III('madrid'))} y el ${pct(BONIF_GRUPO_III('murcia'))}`;

/** Número en letra para la prosa (solo el rango que puede salir: de 0 a 17 comunidades). */
const EN_LETRA = ['ninguna', 'una', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve',
  'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete'];
const enLetra = (n: number) => EN_LETRA[n] ?? String(n);

/**
 * El sello de la rama que LIQUIDA, con su organismo para el enlace del hero.
 *
 * ⚠️ 27/09/2026 (hallazgo 2330) — con Cataluña elegida la app liquida con la Ley 19/2010, que
 * tiene sello propio en `FISCAL_SUCESIONES_CATALUNA_META` (verificado el 08/09/2026, fuente la
 * Agència Tributària de Catalunya), pero el hero y el DataReference daban siempre el del módulo
 * (01/01/2025, AEAT). `calcularSucesion` devuelve en `fuenteDatos` el catalán para el mismo
 * cálculo, así que la web y el MCP citaban fuentes distintas. La elección es la misma que la del
 * motor —Cataluña o el resto— y el testigo la coteja con `fuenteDatos` para que no se separen.
 */
const SELLO_GENERAL = {
  meta: FISCAL_SUCESIONES_META,
  normativa: `ISD ${FISCAL_SUCESIONES_META.vigencia}`,
  organismo: 'Agencia Tributaria',
};
const SELLO_CATALUNA = {
  meta: FISCAL_SUCESIONES_CATALUNA_META,
  normativa: `ISD Cataluña ${FISCAL_SUCESIONES_CATALUNA_META.vigencia}`,
  // «Ley 19/2010 … — Agència Tributària de Catalunya»: el organismo es lo que va tras la raya.
  organismo: FISCAL_SUCESIONES_CATALUNA_META.fuente.split(' — ').pop() ?? FISCAL_SUCESIONES_CATALUNA_META.fuente,
};
const selloDeLaRama = (ccaa: string) => (ccaa === 'cataluna' ? SELLO_CATALUNA : SELLO_GENERAL);

/** Fecha de verificación en DD/MM/AAAA, como la del DataReference (hallazgo 1830). */
const fechaSello = (isoFecha: string) => formatDate(parseISODateLocal(isoFecha));

/**
 * El rango de bonificación en cuota de unas comunidades para un grupo, LEÍDO de
 * `BONIFICACIONES_CCAA_IS`: el mínimo es el porcentaje y el máximo, el 100 % allí donde hay
 * exención total por debajo de un importe (Andalucía y Galicia hasta 1.000.000 €).
 *
 * ⚠️ 27/09/2026 (hallazgo 2331) — «99 %–100 %» iba tecleado en la tabla comparativa y en un
 * consejo, con la tabla sellada al lado. Y derivado se ve que para Madrid y Canarias el techo es
 * el 99,9 %, no el 100 %: la cifra tecleada no correspondía a ninguna de las dos.
 */
function rangoBonificacion(ccaas: string[], grupo: string): string {
  const valores = ccaas.flatMap((c) => {
    const b = BONIFICACIONES_CCAA_IS[c]?.bonificaciones[grupo];
    if (!b || b.porcentaje === undefined) return [];
    return b.exencion !== undefined ? [b.porcentaje, 1] : [b.porcentaje];
  });
  if (valores.length === 0) return '';
  const aTexto = (f: number) => formatPercentage(f, Number.isInteger(Math.round(f * 1000) / 10) ? 0 : 1);
  const [min, max] = [Math.min(...valores), Math.max(...valores)];
  return min === max ? `el ${aTexto(min)}` : `del ${aTexto(min)} al ${aTexto(max)}`;
}
const capitalizar = (texto: string) => texto.charAt(0).toUpperCase() + texto.slice(1);

/**
 * Tramo del art. 22.2 LISD en que cae el patrimonio tecleado, con los límites legales exactos
 * de `data/fiscal` (hallazgo 2484: la página los escribía truncados, «Menos de 402.678 €»).
 */
function textoTramoPatrimonio(patrimonio: number): string {
  const [l1, l2, l3] = LIMITES_PATRIMONIO_PREEXISTENTE_IS;
  const rangos = [
    `de 0 a ${euros(l1)}`,
    `de más de ${euros(l1)} a ${euros(l2)}`,
    `de más de ${euros(l2)} a ${euros(l3)}`,
    `más de ${euros(l3)}`,
  ];
  const k = indiceTramoPatrimonioIS(patrimonio);
  return `Tramo ${k + 1} del coeficiente multiplicador (${rangos[k]}). Vacío cuenta como 0 €.`;
}
const NOMBRES_CCAA = (ccaas: string[]) => {
  const nombres = ccaas.map((c) => BONIFICACIONES_CCAA_IS[c].nombre.replace(/^Comunidad de /, ''));
  return nombres.length > 1 ? `${nombres.slice(0, -1).join(', ')} y ${nombres[nombres.length - 1]}` : nombres[0];
};
const CCAA_BONIF_GRUPO_I = ['madrid', 'canarias', 'galicia', 'andalucia'];
const CCAA_BONIF_GRUPO_II = ['madrid', 'canarias'];
const CCAA_CUOTA_CASI_CERO = ['madrid', 'canarias', 'galicia'];

/** Lo que queda por pagar tras la bonificación del Grupo II, en puntos (99 % → 1). */
const RESTO_TRAS_BONIF_II = (ccaa: string) =>
  (1 - (BONIFICACIONES_CCAA_IS[ccaa].bonificaciones['II']?.porcentaje ?? 0)) * 100;

/**
 * La misma herencia de la comparativa, liquidada en Canarias, para la FAQ de Madrid y Canarias
 * (hallazgo 2328): la FAQ decía «La cuota resultante es de céntimos» y la herramienta de la
 * misma página da decenas o cientos de euros, porque con un 99 % se paga el 1 % de la cuota.
 */
const EJEMPLO_CANARIAS_COMPARATIVA = calcularSucesion({
  baseImponible: COMPARATIVA_CCAA.baseImponible,
  ccaa: 'canarias',
  grupo: 'II',
  edadHeredero: 45,
  viviendaHabitual: COMPARATIVA_CCAA.viviendaHabitual,
  incluyeAjuar: true,
});

/** Plazo para PEDIR la prórroga, con la redacción del art. 68.1 RISD (hallazgo 2331). */
const PLAZO_PEDIR_PRORROGA = `dentro de los ${PLAZO_ISD.mesesParaPedirProrroga} primeros meses`;

/**
 * Edad del heredero y del usufructuario: años cumplidos, enteros, de 0 a este máximo.
 *
 * ⚠️ 27/09/2026 (hallazgos 2325 y 2332) — las edades se liquidaban sin mirar: «-5» en el
 * usufructuario daba el 70 % de un menor de 20, vacía se tomaba como 70 años sin decirlo, «-3» en
 * el heredero se rotulaba «heredero de -3 años», y el «Descendiente menor de 21 años» venía con
 * un 35 PRELLENADO que la app liquidaba sin reducción por edad y, en Cataluña, con la escala de
 * bonificación del Grupo I: una cuota que no corresponde a ninguna situación posible. Desde el
 * 740 un importe negativo se rechaza con aviso; las edades siguen ahora la misma regla.
 */
const EDAD_MAXIMA = 120;
/** El Grupo I son los descendientes MENORES de esta edad (art. 20.2.a LISD). */
const EDAD_LIMITE_GRUPO_I = 21;

/** Años cumplidos de un campo de edad: `null` si está vacío y `NaN` si no es una edad posible. */
function leerEdad(texto: string): number | null {
  const t = texto.trim();
  if (t === '') return null;
  if (!/^\d{1,3}$/.test(t)) return Number.NaN;
  const anios = Number(t);
  return anios <= EDAD_MAXIMA ? anios : Number.NaN;
}

/**
 * Lo que ahorra una REDUCCIÓN, que por definición depende del tramo en que caiga.
 *
 * ⚠️ 14/09/2026 (hallazgo 821) — dos textos cifraban esa horquilla «dependiendo del tramo» y
 * ninguno usaba los tramos: «una reducción de 15.956 € ahorra entre ~1.200 € y ~3.700 €»
 * (el techo real son 5.425,34 €, al 34 %) y «un ajuar de 12.000 € supone ~600-2.000 €»
 * (918-4.080 €). El 3.700 no corresponde a ningún tipo de la escala vigente ni de la
 * derogada de siete tramos: era residuo de la tarifa que se reparó el 11/09. Si la frase
 * invoca la escala, la escala tiene que ser la que salga.
 */
const horquillaAhorro = (importe: number) => ({
  min: importe * (TARIFA_ESTATAL_IS[0].tipo / 100),
  max: importe * (TARIFA_ESTATAL_IS[TARIFA_ESTATAL_IS.length - 1].tipo / 100),
});
const AHORRO_REDUCCION_PARENTESCO = horquillaAhorro(REDUCCIONES_PARENTESCO_IS['II']);
/** Ajuar presunto de la herencia de ejemplo del bloque de consejos. */
const EJEMPLO_AJUAR_HERENCIA = 400000;
const EJEMPLO_AJUAR_PRESUNTO = EJEMPLO_AJUAR_HERENCIA * PORC_AJUAR_DOMESTICO_IS;
const AHORRO_AJUAR = horquillaAhorro(EJEMPLO_AJUAR_PRESUNTO);
/**
 * El piso del consejo sobre la valoración catastral. Decía «puede ahorrar 1.000–4.000 € en
 * ISD» por rebajar un 10 % un piso de 300.000 €, sin tramo que lo sostuviera: 30.000 € de base
 * se mueven entre el primer y el último tipo de la escala (Inspector, 25/09/2026, al paso).
 */
const EJEMPLO_VALORACION_PISO = 300000;
const AHORRO_VALORACION = horquillaAhorro(EJEMPLO_VALORACION_PISO * 0.1);

export default function EstimadorImpuestoSucesionesPage() {
  // Bienes del fallecido
  const [saldosCuentas, setSaldosCuentas] = useState('');
  const [accionesFondos, setAccionesFondos] = useState('');
  const [viviendaHabitual, setViviendaHabitual] = useState('');
  const [otrosInmuebles, setOtrosInmuebles] = useState('');
  const [vehiculos, setVehiculos] = useState('');
  const [segurosVida, setSegurosVida] = useState('');
  const [otrosBienes, setOtrosBienes] = useState('');

  // Deudas
  const [hipotecas, setHipotecas] = useState('');
  const [otrosPrestamos, setOtrosPrestamos] = useState('');
  const [gastosSepelio, setGastosSepelio] = useState('');

  // Datos del heredero
  const [ccaa, setCcaa] = useState('');
  const [grupo, setGrupo] = useState<GrupoParentesco | ''>('');
  // Sin prellenar: el 35 que traía contradecía al «Descendiente menor de 21 años» (hallazgo 2325).
  const [edad, setEdad] = useState('');
  // Solo interviene si el heredero es colateral (Grupo III): art. 20.2.c LISD
  const [convivenciaDosAnios, setConvivenciaDosAnios] = useState(false);
  const [discapacidad, setDiscapacidad] = useState<NivelDiscapacidad>('0');
  /**
   * El patrimonio preexistente se pide como IMPORTE, no por tramos (hallazgo 2483, 30/09/2026).
   * Con un selector de tramos la corrección del salto de coeficiente del art. 22.2 LISD no se
   * podía aplicar —depende de cuánto pasa el patrimonio del límite—, y a quien superaba un umbral
   * por poco se le cobraba el coeficiente entero: 899,86 € de más para un sobrino gallego con
   * 402.700 €. Vacío vale 0 €, el primer tramo, que era la opción por defecto del selector.
   */
  const [patrimonioPreexistente, setPatrimonioPreexistente] = useState('');

  // Tipo de adquisición
  const [tipoAdquisicion, setTipoAdquisicion] = useState<TipoAdquisicion>('plena');
  const [edadUsufructuario, setEdadUsufructuario] = useState('70');
  const [porcentajeHerencia, setPorcentajeHerencia] = useState('100');

  const ccaaInfo = useMemo(() => (ccaa ? BONIFICACIONES_CCAA_IS[ccaa] : null), [ccaa]);
  const sello = selloDeLaRama(ccaa);

  /**
   * Los diez importes, leídos de una vez: cada campo trae un número utilizable o deja su
   * nombre en `invalidos`, y entonces la app se ABSTIENE de dar cifra.
   *
   * Hasta el 11/09/2026 los diez hacían `parseSpanishNumber(x) || 0`, y ese `|| 0` convertía
   * en cero dos cosas distintas de un campo vacío:
   *
   *  · el NaN con el que el parser rechaza lo que no es un número (hallazgo 742). Con
   *    «Saldos = 1.2.3» y «Vivienda = 200000» la app publicaba «Total activos 200.000,00 €»
   *    y una cuota completa, sin ninguna marca sobre los saldos que acababa de tirar.
   *  · el signo menos (hallazgo 740). `totalDeudas` se restaba sin mirar el signo, así que
   *    una deuda negativa AUMENTABA la masa: 250.000 € en cuentas con «-500000» de hipoteca
   *    daban 750.000 € de masa hereditaria y triplicaban la herencia.
   *
   * Un cero inventado es indistinguible de un campo vacío, y aquí la diferencia son miles de
   * euros de cuota: o se lee el importe, o no se da número (ver `feedback_aviso_bajo_cifra_falsa`).
   */
  const importes = useMemo(() => {
    const invalidos: string[] = [];
    const leer = (etiqueta: string, texto: string): number => {
      if (texto.trim() === '') return 0;
      const n = parseSpanishNumber(texto);
      if (!Number.isFinite(n) || n < 0) {
        invalidos.push(etiqueta);
        return 0;
      }
      return n;
    };
    const [bSaldos, bAcciones, bVivienda, bOtrosInm, bVehiculos, bSeguros, bOtros] = [
      saldosCuentas, accionesFondos, viviendaHabitual, otrosInmuebles, vehiculos, segurosVida, otrosBienes,
    ].map((texto, i) => leer(CAMPOS_BIENES[i].etiqueta, texto));
    const [dHipotecas, dPrestamos, dSepelio] = [hipotecas, otrosPrestamos, gastosSepelio].map(
      (texto, i) => leer(CAMPOS_DEUDAS[i].etiqueta, texto)
    );
    const patrimonio = leer('Patrimonio preexistente del heredero', patrimonioPreexistente);
    return {
      invalidos,
      patrimonio,
      bienes: { bSaldos, bAcciones, bVivienda, bOtrosInm, bVehiculos, bSeguros, bOtros },
      deudas: { dHipotecas, dPrestamos, dSepelio },
    };
  }, [saldosCuentas, accionesFondos, viviendaHabitual, otrosInmuebles, vehiculos, segurosVida,
      otrosBienes, hipotecas, otrosPrestamos, gastosSepelio, patrimonioPreexistente]);

  /**
   * El porcentaje de herencia, leído con la misma regla que los importes: o es utilizable, o
   * la app se abstiene y lo nombra.
   *
   * ⚠️ 25/09/2026 (hallazgo 1822) — un porcentaje NEGATIVO se capaba a 0 en silencio y la app
   * publicaba «Impuesto estimado 0,00 €» sin ninguna marca: «no pagas nada» como respuesta a
   * un error de tecleo, en una app de riesgo 1. Los importes negativos ya se rechazaban con
   * aviso desde el 740, y el porcentaje mayor que 100 se rotula «capado al 100 %» desde el 798;
   * el negativo no tenía ni lo uno ni lo otro. El vacío sigue valiendo el 100 % (heredero
   * único) y el 0 sigue siendo un valor con significado (hallazgo 743).
   */
  const porcentajeInvalido = useMemo(() => {
    if (porcentajeHerencia.trim() === '') return false;
    const n = Number.parseFloat(porcentajeHerencia);
    return !Number.isFinite(n) || n < 0;
  }, [porcentajeHerencia]);

  /**
   * Las edades, leídas con la misma regla que los importes (hallazgos 2325 y 2332): o son una
   * edad posible y coherente con el parentesco, o la app se abstiene y dice por qué.
   *
   *  · «Descendiente menor de 21 años» EXIGE la edad, de 0 a 20: la reducción del art. 20.2.a
   *    depende de ella y, en Cataluña, también la escala de bonificación del Grupo I.
   *  · Hermano, tío o sobrino: la edad solo decide la vivienda habitual (65 años o más), así que
   *    vacía se admite —la reducción no se aplica y se dice por qué—, pero imposible, no.
   *  · Usufructo o nuda propiedad: el art. 26.a valora el derecho por la edad del usufructuario,
   *    así que vacía o imposible no da cifra. Antes se tomaba 70 años sin decirlo.
   */
  const avisoEdad = useMemo(() => {
    let heredero: string | null = null;
    let usufructuario: string | null = null;
    const edadHeredero = leerEdad(edad);
    if (grupo === 'I-descendiente') {
      if (edadHeredero === null) {
        heredero = `Escribe la edad del heredero: con «Descendiente menor de ${EDAD_LIMITE_GRUPO_I} años» la reducción depende de ella (de 0 a ${EDAD_LIMITE_GRUPO_I - 1} años).`;
      } else if (Number.isNaN(edadHeredero)) {
        heredero = `La edad del heredero no es válida: escribe los años cumplidos, de 0 a ${EDAD_LIMITE_GRUPO_I - 1}, sin decimales ni signos.`;
      } else if (edadHeredero >= EDAD_LIMITE_GRUPO_I) {
        heredero = `La edad del heredero (${edadHeredero} años) contradice el parentesco «Descendiente menor de ${EDAD_LIMITE_GRUPO_I} años». Si tiene ${EDAD_LIMITE_GRUPO_I} o más, elige «Hijo/a de ${EDAD_LIMITE_GRUPO_I} años o más» o «Nieto/a u otro descendiente de ${EDAD_LIMITE_GRUPO_I} años o más».`;
      }
    } else if (grupo === 'III' && edadHeredero !== null && Number.isNaN(edadHeredero)) {
      heredero = `La edad del heredero no es válida: escribe los años cumplidos, de 0 a ${EDAD_MAXIMA}, sin decimales ni signos.`;
    }
    if (tipoAdquisicion !== 'plena') {
      const edadUsuf = leerEdad(edadUsufructuario);
      if (edadUsuf === null) {
        usufructuario = `Escribe la edad del usufructuario: el valor ${tipoAdquisicion === 'usufructo' ? 'del usufructo' : 'de la nuda propiedad'} depende de ella (${VALORACION_USUFRUCTO_IS.norma}).`;
      } else if (Number.isNaN(edadUsuf)) {
        usufructuario = `La edad del usufructuario no es válida: escribe los años cumplidos, de 0 a ${EDAD_MAXIMA}, sin decimales ni signos.`;
      }
    }
    return { heredero, usufructuario, hay: heredero !== null || usufructuario !== null };
  }, [grupo, edad, tipoAdquisicion, edadUsufructuario]);

  const resultado = useMemo((): ResultadoSucesiones | null => {
    if (!ccaa || !grupo) return null;
    // Con un solo importe ilegible no se estima: el aviso lo nombra y el panel no da cifra.
    if (importes.invalidos.length > 0 || porcentajeInvalido) return null;
    // Ni con una edad imposible o que contradiga el parentesco (hallazgos 2325 y 2332).
    if (avisoEdad.hay) return null;

    // Bienes
    const { bSaldos: v_cuentas, bAcciones: v_acciones, bVivienda: v_vivienda,
            bOtrosInm: v_otrosInm, bVehiculos: v_vehiculos, bSeguros: v_seguros,
            bOtros: v_otros } = importes.bienes;

    const totalActivos = v_cuentas + v_acciones + v_vivienda + v_otrosInm + v_vehiculos + v_seguros + v_otros;
    if (totalActivos <= 0) return null;

    // Deudas
    const { dHipotecas: d_hipotecas, dPrestamos: d_prestamos, dSepelio: d_sepelio } = importes.deudas;
    const totalDeudas = d_hipotecas + d_prestamos + d_sepelio;

    // Masa hereditaria
    const masaHereditaria = Math.max(0, totalActivos - totalDeudas);
    /**
     * ⚠️ 25/09/2026 (hallazgo 1824) — el ajuar se calculaba también sobre el SEGURO DE VIDA.
     *
     * El art. 15 LISD lo valora en «el tres por ciento del importe del caudal relicto del
     * causante», y el seguro no es caudal relicto: lo percibe el beneficiario por el contrato
     * (art. 3.1.c LISD) y, como dice la propia guía de esta página, «no forma parte de la
     * herencia civil». Con solo 100.000 € de seguro, la app añadía 3000 € de ajuar y cobraba
     * 969,00 € de más a un Grupo IV. El seguro sigue en la base —tributa—, pero no genera ajuar.
     */
    const caudalRelicto = Math.max(0, totalActivos - v_seguros - totalDeudas);
    const ajuarDomestico = caudalRelicto * PORC_AJUAR_DOMESTICO_IS;
    const baseImponibleTotal = masaHereditaria + ajuarDomestico;

    /**
     * Porcentaje que recibe este heredero.
     *
     * ⚠️ El CERO es un valor con significado —«no recibo nada»— y aquí se convertía en el
     * 100 %: `parseFloat(porcentajeHerencia) || 100` lo trataba como ausencia de dato porque 0
     * es falsy. La pantalla acababa afirmando las dos cosas a la vez, «Porcentaje de herencia
     * 0%» y justo debajo «Base ajustada 257.500,00 €», que es la herencia entera, y liquidaba
     * sobre ella (hallazgo 743). Es el mismo defecto que el 08/09/2026 se corrigió en el campo
     * de la edad y que sobrevivía en éste y en el del usufructuario. El 100 solo debe salir
     * cuando NO hay porcentaje escrito.
     */
    const porcentajeParseado = Number.parseFloat(porcentajeHerencia);
    // El negativo ya no llega aquí (`porcentajeInvalido`): solo queda capar por arriba.
    const porcHerencia = Math.min(100, Math.max(0,
      Number.isFinite(porcentajeParseado) ? porcentajeParseado : 100
    )) / 100;
    let baseAjustada = baseImponibleTotal * porcHerencia;

    // Tipo de adquisición (usufructo / nuda)
    // Ya validada en `avisoEdad`: en usufructo y nuda es un entero de 0 a 120. El «: 70» que
    // había aquí era el defecto del 2332 — una edad vacía se liquidaba como 70 años sin decirlo.
    const edadUsuf = leerEdad(edadUsufructuario) ?? Number.NaN;
    let porcentajeAdquisicion = 1;
    /**
     * ⚠️ 22/09/2026 (hallazgo 1196) — la regla iba tecleada aquí, sin constante y sin norma, y
     * le faltaba el TECHO del 70 % que el art. 26.a) LISD fija por debajo de los 20 años: con
     * los 15 que el campo admite escribir, «(89 − 15) / 100» daba un 74 % ilegal. Ahora sale
     * de `porcentajeUsufructoVitalicio`, en `data/fiscal`, con el artículo citado al lado.
     */
    if (tipoAdquisicion === 'usufructo') {
      porcentajeAdquisicion = porcentajeUsufructoVitalicio(edadUsuf);
      baseAjustada = baseImponibleTotal * porcHerencia * porcentajeAdquisicion;
    } else if (tipoAdquisicion === 'nuda') {
      porcentajeAdquisicion = 1 - porcentajeUsufructoVitalicio(edadUsuf);
      baseAjustada = baseImponibleTotal * porcHerencia * porcentajeAdquisicion;
    }

    const esCataluna = ccaa === 'cataluna';
    const esForal = ccaaInfo?.regimen === 'foral';

    // Reducciones
    const reducciones: DetalleReduccion[] = [];

    // 1. Reducción por parentesco
    const reduccionesParentesco = esCataluna
      ? REDUCCIONES_PARENTESCO_CATALUNA_IS
      : REDUCCIONES_PARENTESCO_IS;
    const reduccionParentesco = reduccionesParentesco[grupo] || 0;
    if (reduccionParentesco > 0) {
      reducciones.push({ concepto: 'Por parentesco', importe: reduccionParentesco });
    }

    // 2. Reducción por edad (solo grupo I descendiente, para menores de 21).
    //    ⚠️ El tope legal es del TOTAL (parentesco + incremento), no del incremento suelto:
    //    47.858,59 € en régimen común (art. 20.2.a LISD) y 196.000 € en Cataluña (art. 2 Ley
    //    19/2010). Hasta el 08/09/2026 aquí se sumaba `reduccionParentesco + MAX`, así que un
    //    recién nacido llegaba a 63.815,46 € estatales, un 33 % por encima del tope de la ley,
    //    y además se le aplicaban las cifras estatales viviendo en Cataluña.
    /**
     * ⚠️ `parseInt(edad) || 35` convertía el CERO en 35, porque 0 es falsy: un heredero de
     * meses —justo el que más reducción tiene, 3.990,72 € por año en régimen común y 12.000 €
     * en Cataluña— se liquidaba como si tuviera 35 años y perdía la reducción entera. El
     * campo admite `min="0"`, así que el caso era expresable en pantalla y no en el cálculo.
     * El 35 solo debe salir cuando NO hay edad escrita.
     *
     * ⚠️ 27/09/2026 (hallazgo 2325) — y tampoco entonces: con «Descendiente menor de 21 años» el
     * 35 contradecía el parentesco. Ahora `avisoEdad` exige para ese grupo una edad de 0 a 20
     * antes de llegar aquí, y en el Grupo III una edad vacía queda como `null`, sin inventarla.
     */
    const edadHeredero = leerEdad(edad);
    const edadNum = edadHeredero ?? Number.NaN;
    if (grupo === 'I-descendiente' && edadNum < EDAD_LIMITE_GRUPO_I) {
      const porAnio = esCataluna ? REDUCCION_EDAD_MENOR_21_CATALUNA_IS : REDUCCION_EDAD_MENOR_21_IS;
      const topeTotal = esCataluna ? REDUCCION_EDAD_MENOR_21_MAX_CATALUNA_IS : REDUCCION_EDAD_MENOR_21_MAX_IS;
      const reduccionEdad = Math.min(
        reduccionParentesco + porAnio * (EDAD_LIMITE_GRUPO_I - edadNum),
        topeTotal
      ) - reduccionParentesco;
      if (reduccionEdad > 0) {
        // Rotulaba `${21 - edad} años < 21`, que se lee como la edad del heredero: a uno de 15
        // le ponía «6 años < 21» y a uno de 0, «21 años < 21» (hallazgo 1831).
        reducciones.push({
          concepto: `Por edad (heredero de ${edadNum} ${edadNum === 1 ? 'año' : 'años'}, menor de ${EDAD_LIMITE_GRUPO_I})`,
          importe: reduccionEdad,
        });
      }
    }

    // 3. Reducción por seguro de vida (solo para cónyuge, descendientes, ascendientes)
    const gruposConSeguro = ['I-conyuge', 'I-descendiente', 'II', 'II-descendiente', 'II-ascendiente'];
    if (gruposConSeguro.includes(grupo) && v_seguros > 0) {
      /**
       * ⚠️ 13/09/2026 — se tomaba el capital ENTERO del seguro aunque el heredero solo
       * percibiera una parte, mientras la reducción de vivienda habitual del bloque de
       * abajo sí se prorratea (`v_vivienda * porcHerencia`). Un heredero del 50 % se
       * llevaba la reducción completa, es decir, una reducción mayor que el importe por el
       * que la propia app le hace tributar: siempre INFRAVALORA la cuota, con techo en el
       * tope de 9.195,49 € de base (hallazgo 796 del Inspector). Solo se veía en las
       * comunidades sin bonificación del 99 % en cuota, que en las demás lo aplana.
       */
      // Y por el tipo de adquisición, por la misma razón que la vivienda de abajo (hallazgo
      // 1821): la app grava el seguro al porcentaje del usufructo o de la nuda propiedad, y la
      // reducción no puede pasar de lo que se grava.
      const segurosDelHeredero = v_seguros * porcHerencia * porcentajeAdquisicion;
      const reduccionSeguro = Math.min(segurosDelHeredero, REDUCCION_SEGURO_VIDA_MAX_IS);
      if (reduccionSeguro > 0) {
        reducciones.push({ concepto: 'Seguro de vida', importe: reduccionSeguro });
      }
    }

    // 4. Reducción vivienda habitual — evaluarReduccionVivienda es la fuente única de esta
    // regla desde el 27/08/2026 (hallazgo 500): esta app tenía su propia copia y concedía el
    // 95% a todo el Grupo III sin comprobar los 65 años ni la convivencia de los 2 años
    // anteriores que exige el art. 20.2.c LISD.
    /**
     * ⚠️ 25/09/2026 (hallazgo 1821, ALTO) — en USUFRUCTO y NUDA PROPIEDAD la reducción se
     * calculaba sobre el valor PLENO de la vivienda (`v_vivienda × porcHerencia`), mientras la
     * base solo la gravaba al porcentaje del derecho adquirido (art. 26.a LISD). El art. 20.2.c
     * reduce «las adquisiciones mortis causa de la vivienda habitual»: lo adquirido es la nuda
     * propiedad o el usufructo, y la reducción se practica sobre el valor del DERECHO sobre la
     * vivienda que entra en la base de este heredero. Medido: un hermano de 70 años en Castilla
     * y León con la nuda propiedad (81 %) de 120.000 € se reducía 114.000 €, el 117 % de la
     * vivienda gravada (97.200 €), y liquidaba 10.275,29 € donde salen 15.412,18 €. Es la forma
     * de los hallazgos 796 (seguro) y 1193 (tope catalán): la reducción por encima de la parte
     * gravada. En plena propiedad `porcentajeAdquisicion` vale 1 y nada se mueve.
     *
     * El tope (122.606,47 € por sujeto pasivo, o el catalán prorrateado) se aplica después,
     * dentro de `evaluarReduccionVivienda`, sobre este valor ya ajustado.
     */
    const baseViviendaHeredero = v_vivienda * porcHerencia * porcentajeAdquisicion;
    /**
     * ⚠️ 22/09/2026 (hallazgo 1193, ALTO) — el VALOR de la vivienda se prorrataba y su TOPE no.
     *
     * El de Cataluña son 500.000 € del art. 17 de la Ley 19/2010 sobre el valor CONJUNTO de la
     * vivienda, y se reparte entre los adquirentes según su participación con un suelo de
     * 180.000 € por sujeto pasivo — lo sella el comentario de
     * `REDUCCION_VIVIENDA_MIN_INDIVIDUAL_CATALUNA_IS` («el límite individual resultante del
     * prorrateo no puede bajar de esta cifra») y lo anuncia la prosa de esta misma página, dos
     * bloques más abajo. Dejando vacío `limiteViviendaCataluna` se le daba a CADA heredero el
     * tope conjunto entero, así que la reducción podía superar la parte por la que la propia
     * app le hace tributar: siempre INFRAVALORA la cuota. Medido: un hijo con el 50 % de un
     * piso de 1.200.000 € liquidaba 643,86 € donde salen 17.660,27 €, 27 veces menos.
     *
     * El motor lo avisa en su propia firma —el parámetro existe «para quien conoce el valor
     * conjunto de la vivienda y el reparto»— y esta app conoce los dos: `v_vivienda` es el
     * conjunto y `porcHerencia` el reparto. `calcularHerenciaConjunta` hace el mismo prorrateo
     * desde el 13/09 para el caso de varios herederos.
     *
     * Con el 100 % de la herencia el prorrateo devuelve el tope entero, que es lo que ya hacía:
     * la cuota del heredero único no se mueve.
     */
    const limiteViviendaCataluna =
      ccaa === 'cataluna' && v_vivienda > 0 && porcHerencia > 0
        ? Math.max(
            REDUCCION_VIVIENDA_MIN_INDIVIDUAL_CATALUNA_IS,
            REDUCCION_VIVIENDA_MAX_CATALUNA_IS * porcHerencia,
          )
        : undefined;
    const vivienda = evaluarReduccionVivienda({
      valorVivienda: baseViviendaHeredero > 0 ? baseViviendaHeredero : undefined,
      grupo,
      ccaa,
      edadHeredero: edadHeredero ?? undefined,
      convivenciaDosAnios,
      limiteViviendaCataluna,
    });
    if (vivienda.reduccion > 0) {
      reducciones.push({ concepto: `Vivienda habitual (${pct(REDUCCION_VIVIENDA_PORC_IS * 100)})`, importe: vivienda.reduccion });
    }
    // Sin edad, el motor responde «menor de 65 años», que afirma una edad que nadie ha escrito:
    // se dice lo que de verdad falta (hallazgo 2332, la misma forma que el 70 supuesto).
    const viviendaNoAplicada = vivienda.noAplicada && grupo === 'III' && edadHeredero === null
      ? `falta la edad del heredero: el pariente colateral necesita ${EDAD_MIN_COLATERAL_VIVIENDA_IS} años o más`
      : vivienda.noAplicada;

    // 5. Reducción por discapacidad
    if (discapacidad === '33') {
      reducciones.push({ concepto: `Discapacidad ${pct(33)}–${pct(64)}`, importe: REDUCCION_DISCAPACIDAD_33_IS });
    } else if (discapacidad === '65') {
      reducciones.push({ concepto: `Discapacidad ≥${pct(65)}`, importe: REDUCCION_DISCAPACIDAD_65_IS });
    }

    // 6. Reducción adicional Asturias
    if (ccaa === 'asturias') {
      const reducAdicionalAsturias = BONIFICACIONES_CCAA_IS['asturias'].bonificaciones[claveBonificacion(grupo)]?.reduccionBase ?? 0;
      if (reducAdicionalAsturias > 0) {
        reducciones.push({ concepto: 'Reducción adicional Asturias', importe: reducAdicionalAsturias });
      }
    }

    const totalReducciones = reducciones.reduce((s, r) => s + r.importe, 0);
    const baseLiquidable = Math.max(0, baseAjustada - totalReducciones);

    // Tarifa
    const tarifa = esCataluna ? TARIFA_CATALUNA_IS : TARIFA_ESTATAL_IS;
    /**
     * ⚠️ 22/09/2026 (hallazgo 1195) — a céntimo, donde lo redondea `calcularSucesion`.
     *
     * La cuota íntegra es una casilla del modelo 650 y de ella se parte para aplicar el
     * coeficiente del art. 22 LISD, así que el producto tiene que salir del importe LIQUIDADO y
     * no de los 2081,95436 € de la aritmética interna. Sin esto el desglose no cuadraba
     * consigo mismo en pantalla: imprimía «Cuota íntegra 2081,95 €» y «× 1,5882» y una cuota
     * tributaria de 3306,56 €, que es un céntimo más de lo que sale multiplicando las dos
     * cifras que el usuario está leyendo. Y era además la divergencia que el hallazgo 1153 no
     * pudo cerrar: la tarjeta del sobrino se derivó del motor y siguió dando otra cuota que el
     * panel, porque las dos aritméticas redondeaban en sitios distintos.
     */
    const cuotaIntegra = Math.round(calcularTarifa(baseLiquidable, tarifa) * 100) / 100;

    // Coeficiente multiplicador
    const grupoBase = getGrupoBase(grupo);
    const coeficientes = esCataluna ? COEFICIENTES_CATALUNA_IS : COEFICIENTES_IS;
    const filaCoeficientes = coeficientes[grupoBase] ?? [1, 1, 1, 1];

    /**
     * ⚠️ 25/09/2026 (hallazgo 1823) — a céntimo la cuota tributaria y la bonificación, como en
     * `calcularSucesion`. El 1195 redondeó la cuota íntegra, pero la tributaria y la
     * bonificación seguían sin redondear: en Murcia, un sobrino con 100.000 € veía «Cuota
     * tributaria 18.437,27 €», «– Bonificación 9218,64 €» y «CUOTA A INGRESAR 9218,64 €», y la
     * resta de lo que se lee da 9218,63 €, que es lo que liquida el motor de las tarjetas de
     * esta misma página y de la tool del MCP. Ahora la cuota final es la resta de las dos
     * cifras publicadas.
     */
    const aCentimo = (n: number) => Math.round(n * 100) / 100;
    // Coeficiente del tramo y corrección del salto del art. 22.2 LISD, con la fórmula de data/fiscal.
    const {
      coeficiente: coeficienteMultiplicador,
      cuotaTributaria,
      correccionSalto,
    } = cuotaTributariaConCorreccionIS(cuotaIntegra, filaCoeficientes, importes.patrimonio);

    // Bonificación CCAA. `baseAjustada` es la base IMPONIBLE de ESTE heredero —ya con el ajuar
    // y con su porcentaje de herencia o su usufructo aplicados—, que es sobre la que la escala
    // catalana del art. 58 bis construye el porcentaje. El resto de comunidades siguen mirando
    // la liquidable.
    const bonificacionCalculada = aplicarBonificacion(
      cuotaTributaria, baseLiquidable, grupo, ccaa, baseAjustada
    );
    const { porcentaje, detalle } = bonificacionCalculada;
    const bonificacion = aCentimo(bonificacionCalculada.bonificacion);

    const cuotaFinal = aCentimo(Math.max(0, cuotaTributaria - bonificacion));
    // ⚠️ 13/09/2026 — la guarda miraba `baseImponibleTotal` y la división usaba
    // `baseAjustada`, que con el 0 % de herencia vale cero: 0/0 = NaN, y `formatNumber`
    // lo imprime como «No definido» (hallazgo 797, residuo de la reparación del 743).
    const tipoEfectivo = baseAjustada > 0 ? (cuotaFinal / baseAjustada) * 100 : 0;

    return {
      totalActivos,
      totalDeudas,
      masaHereditaria,
      ajuarDomestico,
      segurosFueraDelAjuar: v_seguros > 0,
      baseImponible: baseImponibleTotal,
      porcentajeAdquisicion,
      baseAjustada,
      reducciones,
      totalReducciones,
      viviendaNoAplicada,
      baseLiquidable,
      cuotaIntegra,
      coeficienteMultiplicador,
      correccionSalto,
      cuotaTributaria,
      bonificacionCcaa: bonificacion,
      porcentajeBonificacion: porcentaje,
      detalleBonificacion: detalle,
      cuotaFinal,
      tipoEfectivo,
      porcentajeHerenciaAplicado: porcHerencia,
      ccaaNombre: ccaaInfo?.nombre ?? '',
      esForal,
    };
  }, [
    ccaa, grupo, edad, convivenciaDosAnios, discapacidad, tipoAdquisicion,
    edadUsufructuario, porcentajeHerencia, porcentajeInvalido, importes, ccaaInfo, avisoEdad,
  ]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}><span aria-hidden="true">⚖️</span> Estimador del Impuesto de Sucesiones</h1>
        <p className={styles.subtitle}>
          Oriéntate sobre el ISD en las 17 comunidades autónomas antes de hablar con tu asesor fiscal
        </p>
        {/* El sello de la rama que liquida: con Cataluña, el de la Ley 19/2010 (hallazgo 2330). */}
        <p className={styles.metaVerificado}>
          Datos verificados: {fechaSello(sello.meta.verificado)} — Fuente:{' '}
          <a href={sello.meta.urlOficial} target="_blank" rel="noopener noreferrer" className={styles.linkFuente}>
            {sello.organismo}
          </a>
        </p>
      </header>

      <RegionBadge variant="es-only" />


      <LegalNotice />

      <div className={styles.mainContent}>
        {/* ── Panel de inputs ─────────────────────────────────────── */}
        <div className={styles.inputsPanel}>

          {/* Sección 1: CCAA y datos del heredero */}
          <div className={styles.seccion}>
            <h2 className={styles.seccionTitulo}><span aria-hidden="true">👤</span> Datos del Heredero</h2>

            {/*
              ⚠️ La CCAA competente es la del CAUSANTE, no la del heredero (art. 32.2.c de la
              Ley 22/2009: la de la residencia habitual del fallecido los 5 años anteriores).
              Hasta el 11/09/2026 esta etiqueta pedía la del heredero, y la propia página lo
              desmentía tres veces más abajo —en el paso 6 de la guía, en los «6 errores que
              pueden costarte caro» y en el faqJsonLd—: quien hacía caso a la etiqueta cometía
              exactamente el error del que la app le avisaba, y en el caso del acta la
              estimación se movía 2.068,39 € sobre una herencia de 80.000 € (hallazgo 736).
            */}
            <div className={styles.campo}>
              <label className={styles.label} htmlFor="ccaa-causante">
                Comunidad autónoma donde residía el fallecido *
              </label>
              <select id="ccaa-causante" className={styles.select} value={ccaa} onChange={(e) => setCcaa(e.target.value)}>
                {/* Pedía «tu CCAA» bajo una etiqueta que pide la del fallecido y encima de un
                    helper que dice «No es donde vives tú»: residuo del 736 (hallazgo 1832). */}
                <option value="">— Selecciona la comunidad del fallecido —</option>
                <optgroup label="Régimen Común (14 CCAA)">
                  <option value="madrid">Comunidad de Madrid</option>
                  <option value="andalucia">Andalucía</option>
                  <option value="galicia">Galicia</option>
                  <option value="valencia">Comunitat Valenciana</option>
                  <option value="castilla-leon">Castilla y León</option>
                  <option value="castilla-mancha">Castilla-La Mancha</option>
                  <option value="aragon">Aragón</option>
                  <option value="canarias">Canarias</option>
                  <option value="baleares">Islas Baleares</option>
                  <option value="extremadura">Extremadura</option>
                  <option value="murcia">Región de Murcia</option>
                  <option value="asturias">Asturias</option>
                  <option value="cantabria">Cantabria</option>
                  <option value="rioja">La Rioja</option>
                </optgroup>
                {/* Cataluña NO es territorio foral —los forales son País Vasco y Navarra—,
                    aunque `data/fiscal` la agrupe con ellos bajo esa etiqueta interna. Lo que
                    comparten es tener normativa propia que se aparta del régimen común, y eso
                    es lo que aquí se le dice al usuario. */}
                <optgroup label="Normativa propia">
                  {/* Sin emoji: <option> no admite elementos hijos, así que no hay forma de
                      ocultárselo al lector de pantalla, que lo leería como «señal de
                      advertencia» sin decir de qué advierte. El grupo «Normativa propia» ya
                      lo dice con palabras, y al elegirlas aparece el aviso completo. */}
                  <option value="cataluna">Cataluña</option>
                  <option value="pais-vasco">País Vasco</option>
                  <option value="navarra">Navarra</option>
                </optgroup>
              </select>
              <span className={styles.helper}>
                No es donde vives tú: el ISD se liquida en la comunidad donde el fallecido tuvo
                su residencia habitual los 5 años anteriores (art. 32.2.c de la Ley 22/2009).
              </span>
            </div>

            {/* Con País Vasco o Navarra la misma nota salía DOS veces seguidas, en esta alerta
                y en la caja informativa de abajo (hallazgo 1832): la alerta foral la lleva ya,
                con el nombre de la comunidad, y la caja se reserva para las demás. */}
            {ccaaInfo?.regimen === 'foral' && ccaa !== 'cataluna' && (
              <div className={styles.alertaForal}>
                <strong><span aria-hidden="true">⚠️</span> Régimen Foral — {ccaaInfo.nombre}</strong>
                <p>{ccaaInfo.notas}</p>
              </div>
            )}

            {ccaaInfo && !(ccaaInfo.regimen === 'foral' && ccaa !== 'cataluna') && (
              <div className={styles.infoCcaa}>
                <strong><span aria-hidden="true">ℹ️</span> {ccaaInfo.nombre}</strong>
                <p>{ccaaInfo.notas}</p>
              </div>
            )}

            <div className={styles.campo}>
              <label className={styles.label} htmlFor="parentesco">Parentesco con el fallecido *</label>
              <select id="parentesco" className={styles.select} value={grupo} onChange={(e) => setGrupo(e.target.value as GrupoParentesco)}>
                <option value="">— Selecciona —</option>
                <option value="I-conyuge">Cónyuge / pareja de hecho</option>
                <option value="I-descendiente">Descendiente menor de 21 años</option>
                <option value="II">Hijo/a de 21 años o más</option>
                <option value="II-descendiente">Nieto/a u otro descendiente de 21 años o más</option>
                <option value="II-ascendiente">Ascendiente (padre, madre, abuelo/a)</option>
                <option value="III">Hermano/a, tío/a, sobrino/a (2º–3º grado)</option>
                <option value="IV">Primo/a, otro pariente o sin parentesco (4º grado+)</option>
              </select>
            </div>

            {(grupo === 'I-descendiente' || grupo === 'III') && (
              <div className={styles.campo}>
                <label className={styles.label} htmlFor="edad-heredero">Edad del heredero (años)</label>
                <input id="edad-heredero" type="number" className={styles.input} value={edad}
                  onChange={(e) => setEdad(e.target.value)} min="0" step="1"
                  max={grupo === 'I-descendiente' ? EDAD_LIMITE_GRUPO_I - 1 : EDAD_MAXIMA}
                  placeholder="Años cumplidos"
                  aria-invalid={avisoEdad.heredero !== null} />
                <span className={styles.helper}>
                  {grupo === 'I-descendiente'
                    ? `Obligatoria: de 0 a ${EDAD_LIMITE_GRUPO_I - 1} años. La reducción por edad crece por cada año que le falte para los ${EDAD_LIMITE_GRUPO_I}`
                    : `Relevante para la reducción por vivienda habitual: el colateral solo tiene derecho con ${EDAD_MIN_COLATERAL_VIVIENDA_IS} años o más`}
                </span>
              </div>
            )}

            {grupo === 'III' && (
              <div className={styles.campo}>
                <label className={styles.radioLabel}>
                  <input type="checkbox" checked={convivenciaDosAnios}
                    onChange={(e) => setConvivenciaDosAnios(e.target.checked)} />
                  Conviví con el fallecido los 2 años anteriores
                </label>
                <span className={styles.helper}>
                  Requisito adicional del art. 20.2.c LISD para que un hermano, tío o sobrino
                  acceda a la reducción por vivienda habitual
                </span>
              </div>
            )}

            <div className={styles.campo}>
              <span className={styles.label} id="etiqueta-discapacidad">Discapacidad reconocida</span>
              <div className={styles.radioGroup} role="radiogroup" aria-labelledby="etiqueta-discapacidad">
                {[['0','No'], ['33',`${pct(33)}–${pct(64)}`], ['65',`≥${pct(65)}`]].map(([v, l]) => (
                  <label key={v} className={styles.radioLabel}>
                    <input type="radio" value={v} checked={discapacidad === v}
                      onChange={() => setDiscapacidad(v as NivelDiscapacidad)} />
                    {l}
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.campo}>
              <label className={styles.label} htmlFor="patrimonio-preexistente">Patrimonio preexistente del heredero</label>
              <div className={styles.inputConUnidad}>
                <input id="patrimonio-preexistente" type="text" className={styles.input} value={patrimonioPreexistente}
                  onChange={(e) => setPatrimonioPreexistente(e.target.value)}
                  placeholder="0,00" inputMode="decimal" aria-describedby="patrimonio-preexistente-ayuda" />
                <span className={styles.unidad}>€</span>
              </div>
              <span className={styles.helper} id="patrimonio-preexistente-ayuda">
                {textoTramoPatrimonio(importes.patrimonio)}
              </span>
            </div>

            <div className={styles.campo}>
              <label className={styles.label} htmlFor="porcentaje-herencia">Porcentaje de la herencia que recibes</label>
              <div className={styles.inputConUnidad}>
                <input id="porcentaje-herencia" type="number" className={styles.input} value={porcentajeHerencia}
                  onChange={(e) => setPorcentajeHerencia(e.target.value)} min="0" max="100" />
                <span className={styles.unidad}>%</span>
              </div>
              <span className={styles.helper}>{pct(100)} si eres el único heredero</span>
            </div>
          </div>

          {/* Sección 2: Tipo de adquisición */}
          <div className={styles.seccion}>
            <h2 className={styles.seccionTitulo} id="etiqueta-adquisicion">
              <span aria-hidden="true">📋</span> Tipo de Adquisición
            </h2>
            <div className={styles.radioGroup} role="radiogroup" aria-labelledby="etiqueta-adquisicion">
              {([['plena','Plena propiedad'], ['usufructo','Usufructo'], ['nuda','Nuda propiedad']] as [TipoAdquisicion, string][]).map(([v, l]) => (
                <label key={v} className={styles.radioLabel}>
                  <input type="radio" value={v} checked={tipoAdquisicion === v}
                    onChange={() => setTipoAdquisicion(v)} />
                  {l}
                </label>
              ))}
            </div>
            {(tipoAdquisicion === 'usufructo' || tipoAdquisicion === 'nuda') && (
              <div className={styles.campo}>
                <label className={styles.label} htmlFor="edad-usufructuario">Edad del usufructuario</label>
                <input id="edad-usufructuario" type="number" className={styles.input} value={edadUsufructuario}
                  onChange={(e) => setEdadUsufructuario(e.target.value)} min="0" max={EDAD_MAXIMA} step="1"
                  aria-invalid={avisoEdad.usufructuario !== null} />
                {/* El helper decía la fórmula abreviada y se comía su techo, que es la mitad
                    del artículo que importa en este campo: por debajo de 20 años el porcentaje
                    no se calcula, son el 70 % (hallazgo 1196). Y cita la norma, como el resto
                    de los datos normativos de esta página. */}
                <span className={styles.helper}>
                  {VALORACION_USUFRUCTO_IS.norma}: {pct(VALORACION_USUFRUCTO_IS.porcMaximo)} hasta los{' '}
                  {VALORACION_USUFRUCTO_IS.edadUmbralMaximo} años y, desde ahí,{' '}
                  {VALORACION_USUFRUCTO_IS.edadReferencia} − edad, con un mínimo del{' '}
                  {pct(VALORACION_USUFRUCTO_IS.porcMinimo)}
                  {/* Solo con una edad posible: con «-5» enseñaba el 70 % (hallazgo 2332). */}
                  {Number.isFinite(leerEdad(edadUsufructuario) ?? Number.NaN) &&
                    ` → ${formatPercentage(porcentajeUsufructoVitalicio(leerEdad(edadUsufructuario) ?? 0), 0)}`}
                </span>
              </div>
            )}
          </div>

          {/* Sección 3: Bienes */}
          <div className={styles.seccion}>
            <h2 className={styles.seccionTitulo}><span aria-hidden="true">🏦</span> Bienes del Fallecido</h2>
            <p className={styles.seccionNota}>Introduce el valor total de todos los bienes</p>

            {([saldosCuentas, accionesFondos, viviendaHabitual, otrosInmuebles, vehiculos, segurosVida, otrosBienes] as string[])
              .map((value, i) => [value, [setSaldosCuentas, setAccionesFondos, setViviendaHabitual,
                setOtrosInmuebles, setVehiculos, setSegurosVida, setOtrosBienes][i]] as const)
              .map(([value, setter], i) => (
              <div key={CAMPOS_BIENES[i].id} className={styles.campo}>
                <label className={styles.label} htmlFor={CAMPOS_BIENES[i].id}>
                  <span aria-hidden="true">{CAMPOS_BIENES[i].icono}</span> {CAMPOS_BIENES[i].etiqueta}
                </label>
                <div className={styles.inputConUnidad}>
                  <input id={CAMPOS_BIENES[i].id} type="text" className={styles.input} value={value}
                    onChange={(e) => setter(e.target.value)}
                    placeholder="0,00" inputMode="decimal" />
                  <span className={styles.unidad}>€</span>
                </div>
              </div>
            ))}
          </div>

          {/* Sección 4: Deudas */}
          <div className={styles.seccion}>
            <h2 className={styles.seccionTitulo}><span aria-hidden="true">💸</span> Deudas y Cargas</h2>
            {([hipotecas, otrosPrestamos, gastosSepelio] as string[])
              .map((value, i) => [value, [setHipotecas, setOtrosPrestamos, setGastosSepelio][i]] as const)
              .map(([value, setter], i) => (
              <div key={CAMPOS_DEUDAS[i].id} className={styles.campo}>
                <label className={styles.label} htmlFor={CAMPOS_DEUDAS[i].id}>{CAMPOS_DEUDAS[i].etiqueta}</label>
                <div className={styles.inputConUnidad}>
                  <input id={CAMPOS_DEUDAS[i].id} type="text" className={styles.input} value={value}
                    onChange={(e) => setter(e.target.value)}
                    placeholder="0,00" inputMode="decimal" />
                  <span className={styles.unidad}>€</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Panel de resultados ──────────────────────────────────── */}
        <div className={styles.resultsPanel}>
          {importes.invalidos.length > 0 || porcentajeInvalido || avisoEdad.hay ? (
            /*
              El aviso NOMBRA los campos, y el panel no da ninguna cifra mientras estén así.
              Antes el importe ilegible se convertía en cero y la estimación salía igual: el
              usuario veía una cuota completa calculada sin sus saldos bancarios, o con una
              masa hereditaria que un signo menos había triplicado (hallazgos 740 y 742).
            */
            <div className={styles.placeholder} role="alert">
              {importes.invalidos.length > 0 && (
                <>
                  <p>
                    <span aria-hidden="true">⚠️</span>{' '}
                    {importes.invalidos.length === 1
                      ? 'Hay un importe que no se puede leer: '
                      : 'Hay importes que no se pueden leer: '}
                    <strong>{importes.invalidos.join(', ')}</strong>.
                  </p>
                  <p>
                    Escribe solo cifras positivas, con coma para los decimales (por ejemplo
                    «1.234,56»). No se da estimación mientras haya un importe sin leer, porque
                    tomarlo como cero cambiaría la cuota sin avisar.
                  </p>
                </>
              )}
              {/* Hallazgo 1822: el negativo se capaba a 0 % y la app publicaba 0,00 € de
                  impuesto sin decir nada. Se nombra el campo y no se da cifra. */}
              {porcentajeInvalido && (
                <p>
                  <span aria-hidden="true">⚠️</span>{' '}
                  El <strong>porcentaje de la herencia que recibes</strong> no puede ser negativo:
                  escribe un valor entre 0 y 100 (déjalo en 100 si eres el único heredero). No se
                  da estimación con ese dato, porque tomarlo como 0 daría un impuesto de cero.
                </p>
              )}
              {/* Hallazgos 2325 y 2332: una edad imposible, vacía donde el cálculo la necesita o
                  que contradice el parentesco no se sustituye por otra: se dice y no hay cifra. */}
              {[avisoEdad.heredero, avisoEdad.usufructuario].filter((a): a is string => a !== null).map((aviso) => (
                <p key={aviso}>
                  <span aria-hidden="true">⚠️</span> {aviso} No se da estimación sin ese dato,
                  porque suponer una edad cambiaría la cuota sin avisar.
                </p>
              ))}
            </div>
          ) : !resultado ? (
            <div className={styles.placeholder}>
              <p><span aria-hidden="true">📝</span> Selecciona la CCAA del fallecido y el parentesco, e introduce los bienes para ver la estimación</p>
            </div>
          ) : (
            <>
              {resultado.esForal && ccaa !== 'cataluna' && (
                <div className={styles.alertaForal}>
                  <strong><span aria-hidden="true">⚠️</span> Estimación muy aproximada — Régimen Foral</strong>
                  <p>Esta estimación usa la tarifa estatal como aproximación. El régimen foral real puede diferir significativamente. Consulta obligatoria.</p>
                </div>
              )}

              {/* Resultado destacado */}
              <div className={styles.resultadoDestacado}>
                <span className={styles.resultadoLabel}>Impuesto estimado en {resultado.ccaaNombre}</span>
                <span className={styles.resultadoValor}>{formatCurrency(resultado.cuotaFinal)}</span>
                {resultado.porcentajeBonificacion > 0 && (
                  <span className={styles.resultadoNota}>
                    Bonificación autonómica: {pct(resultado.porcentajeBonificacion, 1)}
                  </span>
                )}
                <span className={styles.resultadoTipoEfectivo}>
                  Tipo efectivo: {pct(resultado.tipoEfectivo, 2)}
                </span>
              </div>

              {/* Masa hereditaria */}
              <div className={styles.desglose}>
                <h3 className={styles.desgloseTitle}>Masa Hereditaria</h3>
                <div className={styles.linea}><span>Total activos</span><span>{formatCurrency(resultado.totalActivos)}</span></div>
                {resultado.totalDeudas > 0 && <div className={styles.linea}><span>– Deudas y cargas</span><span>{formatCurrency(resultado.totalDeudas)}</span></div>}
                <div className={styles.linea}><span>Masa hereditaria neta</span><span>{formatCurrency(resultado.masaHereditaria)}</span></div>
                <div className={styles.linea}>
                  <span>
                    + Ajuar doméstico ({pct(PORC_AJUAR_DOMESTICO_IS * 100)}
                    {resultado.segurosFueraDelAjuar ? ' del caudal relicto, sin los seguros de vida' : ''})
                  </span>
                  <span>{formatCurrency(resultado.ajuarDomestico)}</span>
                </div>
                <div className={`${styles.linea} ${styles.lineaTotal}`}><span>Base imponible total</span><span>{formatCurrency(resultado.baseImponible)}</span></div>
              </div>

              {/* Ajuste por adquisición */}
              {(tipoAdquisicion !== 'plena' || parseFloat(porcentajeHerencia) !== 100) && (
                <div className={styles.desglose}>
                  <h3 className={styles.desgloseTitle}>Adquisición del Heredero</h3>
                  {/* El que se ENSEÑA tiene que ser el que se USA: el cálculo lo capa con
                      Math.min(100, …) y la pantalla lo imprimía crudo, así que con «150» la app
                      afirmaba un porcentaje y liquidaba otro (hallazgo 798). */}
                  <div className={styles.linea}>
                    <span>Porcentaje de herencia</span>
                    <span>
                      {pct(resultado.porcentajeHerenciaAplicado * 100, 2)}
                      {Number.parseFloat(porcentajeHerencia) > 100 ? ' (capado al 100 %)' : ''}
                    </span>
                  </div>
                  {tipoAdquisicion !== 'plena' && (
                    <div className={styles.linea}>
                      <span>Tipo adquisición ({tipoAdquisicion})</span>
                      <span>{pct(resultado.porcentajeAdquisicion * 100, 1)}</span>
                    </div>
                  )}
                  <div className={`${styles.linea} ${styles.lineaTotal}`}><span>Base ajustada</span><span>{formatCurrency(resultado.baseAjustada)}</span></div>
                </div>
              )}

              {/* Reducciones */}
              {(resultado.reducciones.length > 0 || resultado.viviendaNoAplicada) && (
                <div className={styles.desglose}>
                  <h3 className={styles.desgloseTitle}>Reducciones</h3>
                  {resultado.reducciones.map((r, i) => (
                    <div key={i} className={styles.linea}>
                      <span className={styles.lineaBonif}>– {r.concepto}</span>
                      <span className={styles.lineaBonif}>{formatCurrency(r.importe)}</span>
                    </div>
                  ))}
                  {resultado.viviendaNoAplicada && (
                    <div className={styles.linea}>
                      <span>Vivienda habitual</span>
                      <span>No aplicable: {resultado.viviendaNoAplicada}</span>
                    </div>
                  )}
                  <div className={`${styles.linea} ${styles.lineaTotal}`}><span>Base liquidable</span><span>{formatCurrency(resultado.baseLiquidable)}</span></div>
                </div>
              )}

              {/* Liquidación */}
              <div className={styles.desglose}>
                <h3 className={styles.desgloseTitle}>Liquidación</h3>
                <div className={styles.linea}><span>Cuota íntegra</span><span>{formatCurrency(resultado.cuotaIntegra)}</span></div>
                <div className={styles.linea}><span>× Coeficiente multiplicador</span><span>×{formatNumber(resultado.coeficienteMultiplicador, 4)}</span></div>
                {resultado.correccionSalto > 0 && (
                  <div className={styles.linea}>
                    <span>– Corrección del salto de coeficiente (art. 22.2 LISD)</span>
                    <span>{formatCurrency(resultado.correccionSalto)}</span>
                  </div>
                )}
                <div className={styles.linea}><span>Cuota tributaria</span><span>{formatCurrency(resultado.cuotaTributaria)}</span></div>
                {resultado.bonificacionCcaa > 0 && (
                  <div className={styles.linea}>
                    <span className={styles.lineaBonif}>– {resultado.detalleBonificacion}</span>
                    <span className={styles.lineaBonif}>{formatCurrency(resultado.bonificacionCcaa)}</span>
                  </div>
                )}
                <div className={`${styles.linea} ${styles.lineaTotal} ${styles.lineaFinal}`}>
                  <span>CUOTA A INGRESAR (estimada)</span>
                  <span>{formatCurrency(resultado.cuotaFinal)}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/*
        Los avisos van DEBAJO de la herramienta, que es la posición 6 de la estructura
        estándar del proyecto (logo, hero, LegalNotice, herramienta, RESULTADOS,
        DisclaimerCard). Estaban encima, y el hallazgo 1151 midió lo que eso costaba en
        390x844, el viewport de la mitad del tráfico: el primer control caía a 2.308 px
        —2,73 pantallas— y la segunda pantalla entera no contenía ni un encabezado, ni un
        control, ni un botón: solo la cola del DisclaimerCard y el DataReference. La
        reparación del 14/09 había quitado 196 px de 2.504, un 7,8 %, y el resultado que
        motivaba el hallazgo no se movió.

        No se toca NADA del contenido: el DisclaimerCard sigue íntegro y sin colapsar, como
        exige la política de riesgo 1, el DataReference sigue inmediatamente detrás de él y
        el bloque de límites de ESTE cálculo sigue siempre visible. Lo único que cambia es
        que ahora se leen junto a la cifra a la que se refieren.
      */}
      <DisclaimerCard
        variant="financial"
        severity="critical"
        collapsible={false}
      />

      <DataReference
        normativa={sello.normativa}
        fuente={sello.meta.fuente}
        verificado={sello.meta.verificado}
        urlOficial={sello.meta.urlOficial}
      />

      {/*
        Qué NO entra en la estimación, SIEMPRE VISIBLE y sin repetir el DisclaimerCard.

        ⚠️ 14/09/2026 (hallazgo 819) — este bloque y el DisclaimerCard obligatorio de arriba
        sumaban 1.394 px de avisos consecutivos que decían sustancialmente lo mismo: los dos
        abrían con «exclusivamente orientativa» y cerraban con «meskeIA no se responsabiliza».
        Con ellos, el primer control de la app quedaba a 2.504 px en 390x844 —casi tres
        pantallas de advertencias antes del primer desplegable— y la estancia media era de 21
        segundos. La duplicación era de la app, no de la política de riesgo 1, que exige UN
        disclaimer: el obligatorio se queda íntegro y arriba, y aquí solo permanece lo que no
        está en ninguna otra parte, que son los límites concretos de ESTE cálculo.
      */}
      <div className={styles.disclaimerCritico}>
        <h2 className={styles.disclaimerTitulo}><span aria-hidden="true">⚠️</span> Qué no incluye esta estimación</h2>
        <ul>
          <li>El ISD contempla decenas de supuestos especiales no incluidos aquí</li>
          <li>Empresas familiares, explotaciones agrarias y otros bienes tienen reducciones especiales</li>
          <li>Las bonificaciones autonómicas pueden tener requisitos formales adicionales</li>
          <li>El ajuar doméstico ({pct(PORC_AJUAR_DOMESTICO_IS * 100, 0)}) puede impugnarse con prueba en contrario</li>
        </ul>
        <p className={styles.disclaimerPlazo}>
          <span aria-hidden="true">📅</span> Plazo de autoliquidación: <strong>{PLAZO_ISD.mesesPresentacion} meses</strong> desde el fallecimiento ({PLAZO_ISD.norma}), prorrogable {PLAZO_ISD.mesesProrroga} meses más con intereses de demora, y la prórroga se pide dentro de los {PLAZO_ISD.mesesParaPedirProrroga} primeros
        </p>
      </div>


      {/* Contenido educativo */}
      <EducationalSection
        title="¿Quieres entender el Impuesto de Sucesiones?"
        subtitle="Guía completa: cómo funciona, plazos y diferencias entre CCAA"
      >
        <section className={styles.guideSection}>
          <h2>El Impuesto de Sucesiones en España</h2>
          <p>
            El Impuesto de Sucesiones y Donaciones (ISD) grava la adquisición de bienes y derechos
            por herencia, legado o donación. Está cedido a las comunidades autónomas, lo que genera
            grandes diferencias entre territorios.
          </p>

          <h3>Pasos del cálculo</h3>
          <ol>
            <li><strong>Masa hereditaria neta:</strong> Total activos – deudas y cargas</li>
            <li><strong>Ajuar doméstico:</strong> Se añade automáticamente un {pct(PORC_AJUAR_DOMESTICO_IS * 100)} del caudal relicto (salvo prueba en contrario)</li>
            <li><strong>Base imponible:</strong> Masa + ajuar, proporcional al porcentaje heredado</li>
            <li><strong>Reducciones:</strong> Por parentesco, edad, discapacidad, vivienda habitual, seguro de vida</li>
            <li><strong>Base liquidable:</strong> Base imponible – reducciones</li>
            <li><strong>Cuota íntegra:</strong> Aplicando la tarifa correspondiente a la base liquidable</li>
            <li><strong>Coeficiente multiplicador:</strong> Según grupo y patrimonio preexistente</li>
            <li><strong>Bonificación autonómica:</strong> Las CCAA pueden reducir la cuota hasta el {pct((BONIFICACIONES_CCAA_IS['canarias'].bonificaciones['II']?.porcentaje ?? 0) * 100, 1)}</li>
          </ol>

          <h3>Diferencias entre CCAA</h3>
          <p>
            Las comunidades usan dos mecanismos distintos y conviene no confundirlos. Madrid y
            Canarias bonifican la CUOTA —el {pct((BONIFICACIONES_CCAA_IS['madrid'].bonificaciones['II']?.porcentaje ?? 0) * 100)} y
            el {pct((BONIFICACIONES_CCAA_IS['canarias'].bonificaciones['II']?.porcentaje ?? 0) * 100, 1)} para los grupos más cercanos—, de modo
            que el impuesto queda cerca de cero. Asturias no bonifica en cuota a esos grupos, pero
            les aplica una reducción de {euros(EJEMPLO_ASTURIAS.reduccionAutonomicaBase)} en la
            BASE, que en herencias medianas absorbe la base entera y deja también una cuota de
            cero: con {euros(COMPARATIVA_CCAA.baseImponible)} heredados por un hijo, de
            los que {euros(COMPARATIVA_CCAA.viviendaHabitual)} son la vivienda habitual, esta misma
            calculadora liquida {euros(EJEMPLO_ASTURIAS.cuotaFinal)} en
            Asturias y {euros(EJEMPLO_MADRID_COMPARATIVA.cuotaFinal)} en Madrid. Cuál sale más barata depende del importe y del
            parentesco, así que la comparación hay que hacerla con el caso concreto delante.
          </p>

          <h3>Grupos de parentesco</h3>
          <div className={styles.conceptGrid}>
            <div className={styles.conceptCard}>
              <h4>Grupo I</h4>
              <p>Descendientes y adoptados menores de 21 años</p>
            </div>
            <div className={styles.conceptCard}>
              <h4>Grupo II</h4>
              <p>Descendientes de 21 años o más, cónyuge y ascendientes</p>
            </div>
            <div className={styles.conceptCard}>
              <h4>Grupo III</h4>
              <p>Colaterales 2º y 3º grado: hermanos, tíos, sobrinos</p>
            </div>
            <div className={styles.conceptCard}>
              <h4>Grupo IV</h4>
              <p>Colaterales 4º grado, parientes más lejanos y extraños</p>
            </div>
          </div>

          <h3>Normativa propia: Cataluña, País Vasco y Navarra</h3>
          <p>
            Cataluña <strong>no es territorio foral</strong> —los forales son País Vasco y Navarra—,
            pero sí tiene su propia ley del impuesto (Ley 19/2010): tarifa entre
            el {pct(TARIFA_CATALUNA_IS[0].tipo, 0)} y
            el {pct(TARIFA_CATALUNA_IS[TARIFA_CATALUNA_IS.length - 1].tipo, 0)} y
            reducciones distintas de las estatales, entre
            ellas {euros(REDUCCIONES_PARENTESCO_CATALUNA_IS['I-conyuge'])} para el cónyuge y para el
            hijo, {euros(REDUCCIONES_PARENTESCO_CATALUNA_IS['II-descendiente'])} para el resto de
            descendientes y {euros(REDUCCIONES_PARENTESCO_CATALUNA_IS['II-ascendiente'])} para los
            ascendientes. País Vasco (tres Haciendas Forales, cada una con su norma) y Navarra
            tienen tarifas y reducciones propias; para cónyuge, hijos y padres la carga suele ser
            baja, pero depende del territorio y del caso, y esta herramienta solo los aproxima.
          </p>

          <h3>Plazos importantes</h3>
          <div className={styles.plazosGrid}>
            <div className={styles.plazoCard}>
              <span className={styles.plazoNum}>{PLAZO_ISD.mesesPresentacion} meses</span>
              <span>Para autoliquidar desde el fallecimiento</span>
            </div>
            <div className={styles.plazoCard}>
              <span className={styles.plazoNum}>+{PLAZO_ISD.mesesProrroga} meses</span>
              <span>Prórroga, pidiéndola {PLAZO_PEDIR_PRORROGA}</span>
            </div>
          </div>
        </section>

        {/* ── Sección 1: Tabla comparativa de grupos ────────────────── */}
        <section className={styles.guideSection}>
          <h2>Comparativa de los 4 grupos de parentesco</h2>
          <p>
            El grupo de parentesco es el factor que más condiciona la carga fiscal. La diferencia entre
            un hijo y un sobrino puede suponer pagar el 0&nbsp;% o más del 30&nbsp;% de la herencia.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Grupo</th>
                  <th>Reducción estatal base</th>
                  <th>Coeficiente multiplicador*</th>
                  <th>Bonificación autonómica típica</th>
                  <th>Situación típica</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Grupo I</strong><br /><small>Descendiente &lt;21 a.</small></td>
                  <td>{euros(REDUCCIONES_PARENTESCO_IS['I-descendiente'])} + {euros(REDUCCION_EDAD_MENOR_21_IS)} por año &lt;21 (máx. {euros(REDUCCION_EDAD_MENOR_21_MAX_IS)})</td>
                  <td>{formatNumber(COEFICIENTES_IS['I'][0], 4)} (patrimonio hasta {euros(LIMITES_PATRIMONIO_PREEXISTENTE_IS[0])})</td>
                  <td>{capitalizar(rangoBonificacion(CCAA_BONIF_GRUPO_I, 'I-descendiente'))} en {NOMBRES_CCAA(CCAA_BONIF_GRUPO_I)}</td>
                  <td>Hijo menor de 21 años hereda la vivienda familiar</td>
                </tr>
                <tr>
                  <td><strong>Grupo II</strong><br /><small>Descendiente ≥21 a. / cónyuge / ascendiente</small></td>
                  <td>{euros(REDUCCIONES_PARENTESCO_IS['II'])}</td>
                  <td>{formatNumber(COEFICIENTES_IS['II'][0], 4)} (patrimonio hasta {euros(LIMITES_PATRIMONIO_PREEXISTENTE_IS[0])})</td>
                  <td>{capitalizar(rangoBonificacion(CCAA_BONIF_GRUPO_II, 'II'))} en {NOMBRES_CCAA(CCAA_BONIF_GRUPO_II)}; en Asturias, reducción de {euros(BONIFICACIONES_CCAA_IS['asturias'].bonificaciones['II']?.reduccionBase ?? 0)} en la base en vez de bonificación</td>
                  <td>Hijo adulto, cónyuge o padre hereda bienes del fallecido</td>
                </tr>
                <tr>
                  <td><strong>Grupo III</strong><br /><small>Hermanos, tíos, sobrinos</small></td>
                  <td>{euros(REDUCCIONES_PARENTESCO_IS['III'])}</td>
                  <td>{formatNumber(COEFICIENTES_IS['III'][0], 4)} (patrimonio hasta {euros(LIMITES_PATRIMONIO_PREEXISTENTE_IS[0])})</td>
                  <td>Escasa o nula en la mayoría de CCAA</td>
                  <td>Sobrino hereda de tía sin hijos</td>
                </tr>
                <tr>
                  <td><strong>Grupo IV</strong><br /><small>Primos, parientes lejanos, extraños</small></td>
                  <td>{euros(REDUCCIONES_PARENTESCO_IS['IV'])}</td>
                  <td>{formatNumber(COEFICIENTES_IS['IV'][0], 4)} (patrimonio hasta {euros(LIMITES_PATRIMONIO_PREEXISTENTE_IS[0])})</td>
                  <td>Generalmente sin bonificación</td>
                  <td>Amigo o pareja no registrada hereda bienes</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className={styles.helper}>* Coeficientes del art. 22.2 LISD para el régimen estatal (tarifa de {FISCAL_SUCESIONES_META.vigencia}). Cataluña tiene coeficientes propios.</p>
        </section>

        {/* ── Sección 2: Casos de uso ───────────────────────────────── */}
        <section className={styles.guideSection}>
          <h2>Casos de uso reales: 4 perfiles</h2>
          <p>
            Estos escenarios ilustran cómo varía el impuesto según la CCAA, el parentesco y el tipo
            de bien heredado. Los importes son aproximados y orientativos.
          </p>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🏠</span>
                <div>
                  <strong>Hijo adulto hereda piso</strong>
                  <small>Madrid — Grupo II — 200.000 €</small>
                </div>
              </div>
              <div className={styles.escenarioExample}>
                <p>
                  Base imponible: {euros(EJEMPLO_MADRID_PISO)} (piso) +{' '}
                  {euros(EJEMPLO_MADRID.ajuarDomestico)} (ajuar{' '}
                  {pct(PORC_AJUAR_DOMESTICO_IS * 100, 0)}) ={' '}
                  <strong>{euros(EJEMPLO_MADRID.baseImponibleConAjuar)}</strong>.
                  Reducción por parentesco: {euros(REDUCCIONES_PARENTESCO_IS['II'])}. Reducción vivienda
                  habitual ({pct(REDUCCION_VIVIENDA_PORC_IS * 100)}): mín({euros(EJEMPLO_MADRID_PISO)} × {formatNumber(REDUCCION_VIVIENDA_PORC_IS, 2)}; {euros(REDUCCION_VIVIENDA_MAX_IS)}) ={' '}
                  <strong>{euros(REDUCCION_VIVIENDA_MAX_IS)}</strong>.
                  Base liquidable: {euros(EJEMPLO_MADRID.baseLiquidable)}. Cuota íntegra (tarifa
                  estatal): {euros(EJEMPLO_MADRID.cuotaIntegra)}. Bonificación Madrid{' '}
                  ({pct(EJEMPLO_MADRID.porcentajeBonificacion, 0)}):{' '}
                  –{euros(EJEMPLO_MADRID.bonificacionCcaa)}.
                </p>
                <p><strong>Cuota final estimada: {euros(EJEMPLO_MADRID.cuotaFinal)}</strong></p>
              </div>
              <div className={styles.escenarioTip}>
                Madrid tiene bonificación del {pct((BONIFICACIONES_CCAA_IS['madrid'].bonificaciones['II']?.porcentaje ?? 0) * 100)} para Grupos I y II: un hijo paga
                el {pct(RESTO_TRAS_BONIF_II('madrid'), 0)} de la cuota, {euros(EJEMPLO_MADRID.cuotaFinal)} en este ejemplo.
              </div>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">💳</span>
                <div>
                  <strong>Sobrino hereda cuenta bancaria</strong>
                  <small>Asturias — Grupo III — 80.000 €</small>
                </div>
              </div>
              <div className={styles.escenarioExample}>
                <p>
                  Base imponible: {euros(EJEMPLO_SOBRINO_CUENTA)} + {euros(EJEMPLO_SOBRINO.ajuarDomestico)} (ajuar) ={' '}
                  <strong>{euros(EJEMPLO_SOBRINO.baseImponibleConAjuar)}</strong>.
                  Reducción por parentesco (Grupo III): {euros(EJEMPLO_SOBRINO.reduccionParentesco)}. Reducción propia de Asturias
                  para el Grupo III: {euros(EJEMPLO_SOBRINO.reduccionAutonomicaBase)} en la base. Base liquidable: {euros(EJEMPLO_SOBRINO.baseLiquidable)}.
                  Cuota íntegra: {euros(EJEMPLO_SOBRINO.cuotaIntegra)}. Coeficiente multiplicador (Grupo III): ×{formatNumber(EJEMPLO_SOBRINO.coeficienteMultiplicador, 4)} → <strong>{euros(EJEMPLO_SOBRINO.cuotaFinal)}</strong>.
                  Asturias no tiene bonificación en cuota para el Grupo III: su beneficio ya se ha
                  aplicado antes, en la base.
                </p>
                {/* El tipo efectivo sale del motor, que lo calcula sobre la base CON ajuar,
                    que es lo que se grava. La tarjeta lo dividía entre los 80.000 € de la
                    cuenta y publicaba «4,1 %» donde el panel imprimía «4,01 %»: dos
                    denominadores para la misma operación (hallazgo 1152). */}
                <p><strong>Cuota final estimada: {euros(EJEMPLO_SOBRINO.cuotaFinal)}</strong> ({pct(EJEMPLO_SOBRINO.tipoEfectivo, 2)} de la base con ajuar)</p>
              </div>
              <div className={styles.escenarioTip}>
                Al colateral le toca el coeficiente multiplicador de {formatNumber(EJEMPLO_SOBRINO.coeficienteMultiplicador, 4)}, que encarece la cuota
                frente a hijos y cónyuge. Lo que cambia mucho de una comunidad a otra es qué recibe
                el Grupo III: {enLetra(COMUNES_SIN_NADA_GRUPO_III)} de las {enLetra(COMUNES_GRUPO_III.length)} comunidades
                del régimen común no le dan nada, Asturias le reduce {euros(ASTURIAS_REDUCCION_GRUPO_III)} de
                la base, Madrid y Murcia le bonifican {MADRID_MURCIA_GRUPO_III} de la cuota y Canarias
                el {pct(BONIF_GRUPO_III('canarias'), 1)}. Comprueba la tuya antes de dar por hecha la cifra.
              </div>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🏢</span>
                <div>
                  <strong>Viuda hereda empresa familiar</strong>
                  <small>Cataluña — Grupo I-cónyuge — 500.000 €</small>
                </div>
              </div>
              <div className={styles.escenarioExample}>
                <p>
                  Cataluña aplica tarifa propia ({pct(TARIFA_CATALUNA_IS[0].tipo, 0)}–
                  {pct(TARIFA_CATALUNA_IS[TARIFA_CATALUNA_IS.length - 1].tipo, 0)}) y
                  coeficientes propios. Con el ajuar del{' '}
                  {pct(PORC_AJUAR_DOMESTICO_IS * 100, 0)} la base imponible sube a{' '}
                  {euros(EJEMPLO_CATALUNA.baseImponibleConAjuar)} y, sin más reducciones que la de
                  parentesco del cónyuge ({euros(EJEMPLO_CATALUNA.reduccionParentesco)} en Cataluña),
                  la base liquidable queda en {euros(EJEMPLO_CATALUNA.baseLiquidable)} y la cuota
                  íntegra en {euros(EJEMPLO_CATALUNA.cuotaIntegra)}. Coeficiente cónyuge catalán:{' '}
                  {formatNumber(EJEMPLO_CATALUNA.coeficienteMultiplicador, 4)}.
                </p>
                <p>
                  Sobre esa cuota se aplica la bonificación del cónyuge
                  ({pct(EJEMPLO_CATALUNA.porcentajeBonificacion, 0)}, art. 58 bis.1 de la
                  Ley 19/2010), así que la <strong>cuota final estimada es
                  de {euros(EJEMPLO_CATALUNA.cuotaFinal)}</strong> — que es lo que liquida la
                  calculadora de arriba con estos mismos datos.
                </p>
                <p>
                  <strong>La reducción del {pct(REDUCCION_EMPRESA_FAMILIAR_CATALUNA_IS.porcentaje)} por empresa
                  familiar</strong> ({REDUCCION_EMPRESA_FAMILIAR_CATALUNA_IS.norma}; en régimen común,
                  el {REDUCCION_EMPRESA_FAMILIAR_IS.norma}) puede dejar la cuota en cero si se
                  cumplen los requisitos de permanencia, pero <strong>esta herramienta no la
                  calcula</strong>: la cifra de arriba es el techo, no la factura.
                </p>
              </div>
              <div className={styles.escenarioTip}>
                {/* Decía «10 años», que es el plazo estatal del art. 20.2.c LISD, en la tarjeta
                    de una herencia CATALANA: el art. 9 de la Ley 19/2010 pide cinco (Inspector,
                    25/09/2026, verificado en el BOE). */}
                La reducción por empresa familiar ({pct(REDUCCION_EMPRESA_FAMILIAR_CATALUNA_IS.porcentaje)}) exige,
                entre otros requisitos, mantener la actividad y lo adquirido
                durante {REDUCCION_EMPRESA_FAMILIAR_CATALUNA_IS.aniosMantenimiento} años en Cataluña
                ({REDUCCION_EMPRESA_FAMILIAR_IS.aniosMantenimiento} en régimen común).
              </div>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">👶</span>
                <div>
                  <strong>Hijo menor con discapacidad</strong>
                  <small>País Vasco — Grupo I — 300.000 €</small>
                </div>
              </div>
              <div className={styles.escenarioExample}>
                {/* Daba cifras sin fuente ni sello —«55.000 €–65.000 €» de reducción por
                    discapacidad y «bonificación del 95 %–100 %»— para tres territorios con
                    normas distintas que esta app no modela (Inspector, 25/09/2026). Se describe
                    sin cifras en vez de inventarlas; la estatal sí va derivada de data/fiscal. */}
                <p>
                  País Vasco tiene normativa foral propia, y cada territorio histórico (Álava,
                  Bizkaia, Gipuzkoa) fija sus reducciones por parentesco y por discapacidad y su
                  tarifa. Para un hijo menor la carga suele ser baja, pero el importe exacto
                  depende de la norma foral de cada territorio: esta herramienta solo lo aproxima
                  con la tarifa estatal.
                </p>
                <p><strong>Consulta la norma foral de tu territorio o a un asesor</strong></p>
              </div>
              <div className={styles.escenarioTip}>
                {/* Emparejaba la cifra del 33 %–64 % con el grado del 65 % (hallazgo 1827). */}
                País Vasco, Navarra y Cataluña tienen sus propias reducciones por discapacidad, que
                conviene comparar con las estatales: {euros(REDUCCION_DISCAPACIDAD_33_IS)} con un grado
                del 33&nbsp;% al 64&nbsp;% y {euros(REDUCCION_DISCAPACIDAD_65_IS)} con un grado del 65&nbsp;%
                o más.
              </div>
            </div>
          </div>
        </section>

        {/* ── Sección 3: FAQ ────────────────────────────────────────── */}
        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes sobre el Impuesto de Sucesiones</h2>
          <dl className={styles.faqList}>
            <div className={styles.faqItem}>
              <dt>¿Tengo que pagar si heredo en Madrid o Canarias?</dt>
              <dd>
                {/* Decía «En la práctica, casi nunca […] La cuota resultante es de céntimos», y la
                    herramienta de esta misma página da decenas o cientos de euros: con un 99 % se
                    paga el 1 % de la cuota, que solo es de céntimos si la base liquidable apenas
                    llega a 1.300 € (hallazgo 2328). Las cifras salen del motor, no del teclado. */}
                Sí, aunque poco. Madrid aplica una bonificación del {pct((BONIFICACIONES_CCAA_IS['madrid'].bonificaciones['II']?.porcentaje ?? 0) * 100)} para los Grupos I y II
                (cónyuge, descendientes, ascendientes) y Canarias, del {pct((BONIFICACIONES_CCAA_IS['canarias'].bonificaciones['II']?.porcentaje ?? 0) * 100, 1)} para los mismos grupos:
                se paga el {pct(RESTO_TRAS_BONIF_II('madrid'), 0)} de la cuota en Madrid y
                el {pct(RESTO_TRAS_BONIF_II('canarias'), 1)} en Canarias: poco, pero no cero, y en Madrid
                una herencia normal deja decenas o cientos de euros. Con {euros(COMPARATIVA_CCAA.baseImponible)} heredados por un
                hijo, {euros(COMPARATIVA_CCAA.viviendaHabitual)} de ellos en la vivienda habitual, esta
                calculadora liquida {euros(EJEMPLO_MADRID_COMPARATIVA.cuotaFinal)} en Madrid
                y {euros(EJEMPLO_CANARIAS_COMPARATIVA.cuotaFinal)} en Canarias. Y aunque la cuota
                fuera cero, <strong>sí estás obligado a autoliquidar</strong>, presentando el modelo 650
                en el plazo de {PLAZO_ISD.mesesPresentacion} meses.
                <div className={styles.faqTip}>Presentar aunque la cuota sea 0 evita sanciones por extemporaneidad.</div>
              </dd>
            </div>

            <div className={styles.faqItem}>
              <dt>¿Qué pasa si el inmueble vale más que el valor catastral?</dt>
              <dd>
                Para el ISD, los inmuebles se declaran por el <strong>valor de referencia del Catastro</strong>
                (desde 2022, conforme a la Ley 11/2021). Si ese valor no existe o el contribuyente lo
                impugna, se usa el valor de mercado. Si declaras por debajo del valor de referencia,
                Hacienda puede iniciar una comprobación de valores y girar una liquidación complementaria
                con intereses de demora (actualmente al{' '}
                {pct(ESCALA_RECARGO_EXTEMPORANEO.interesDemoraAnual, 2)} anual).
              </dd>
            </div>

            <div className={styles.faqItem}>
              <dt>¿Puedo aplazar el pago si no tengo liquidez?</dt>
              <dd>
                Sí. El art. 65 LGT permite solicitar aplazamiento o fraccionamiento. Para el ISD
                existe además la posibilidad de aplazamiento especial cuando en la herencia hay bienes
                inmuebles y el heredero no tiene liquidez suficiente. El aplazamiento ordinario
                conlleva intereses de demora. En algunos casos, la CCAA puede aceptar el pago
                mediante adjudicación de bienes (dación en pago).
                <div className={styles.faqTip}>Solicitar el aplazamiento ANTES de que venza el plazo. Si presentas fuera de plazo, pagas recargo además.</div>
              </dd>
            </div>

            <div className={styles.faqItem}>
              <dt>¿Qué es el coeficiente multiplicador?</dt>
              <dd>
                Es un factor que incrementa la cuota íntegra según el grupo de parentesco y el
                patrimonio preexistente del heredero. Un hijo con un patrimonio de hasta {euros(LIMITES_PATRIMONIO_PREEXISTENTE_IS[0])}
                usa el coeficiente {formatNumber(COEFICIENTES_IS['II'][0], 4)} (sin incremento). Un sobrino (Grupo III) con el mismo
                patrimonio usa {formatNumber(COEFICIENTES_IS['III'][0], 4)}, por lo que paga un {pct((COEFICIENTES_IS['III'][0] - 1) * 100, 2)} más que la cuota íntegra base.
                Con patrimonio preexistente de más de {euros(LIMITES_PATRIMONIO_PREEXISTENTE_IS[2])}, el coeficiente llega a{' '}
                {formatNumber(COEFICIENTES_IS['IV'][COEFICIENTES_IS['IV'].length - 1], 1)} en el Grupo IV.
                Al pasar de un tramo al siguiente, el art. 22.2 LISD impide que la cuota suba más de
                lo que el patrimonio excede del límite: la herramienta aplica esa corrección con el
                importe que escribas.
              </dd>
            </div>

            <div className={styles.faqItem}>
              <dt>¿Cómo afecta la discapacidad a las reducciones?</dt>
              <dd>
                La normativa estatal establece dos tramos: discapacidad entre el 33&nbsp;% y el 64&nbsp;%
                da derecho a una reducción adicional de <strong>{euros(REDUCCION_DISCAPACIDAD_33_IS)}</strong>;
                discapacidad del 65&nbsp;% o superior da derecho a <strong>{euros(REDUCCION_DISCAPACIDAD_65_IS)}</strong>. Estas reducciones
                se suman a las de parentesco. Algunas CCAA (Andalucía, Valencia, Cataluña) amplían
                estos importes. El grado de discapacidad debe estar reconocido oficialmente antes
                del devengo del impuesto.
              </dd>
            </div>

            <div className={styles.faqItem}>
              <dt>¿Qué pasa si presento fuera de plazo?</dt>
              <dd>
                Si presentas antes de que Hacienda te requiera, se aplica el recargo por extemporaneidad
                espontánea del art. 27.2 LGT: un <strong>{pct(ESCALA_RECARGO_EXTEMPORANEO.porcentajeBase, 0)} de partida
                más otro {pct(ESCALA_RECARGO_EXTEMPORANEO.porcentajePorMes, 0)} por cada mes completo de retraso</strong>,
                hasta los {ESCALA_RECARGO_EXTEMPORANEO.mesesEscalaProporcional} meses. A partir de ahí es
                un {pct(ESCALA_RECARGO_EXTEMPORANEO.porcentajeMas12Meses, 0)} fijo más intereses de demora
                (al {pct(ESCALA_RECARGO_EXTEMPORANEO.interesDemoraAnual, 2)} anual). El recargo se reduce
                un {pct(ESCALA_RECARGO_EXTEMPORANEO.reduccionProntoPago, 0)} si se paga en período voluntario.
                Si Hacienda actúa primero (liquidación de oficio), se aplican sanciones que pueden
                llegar al 150&nbsp;% de la deuda.
              </dd>
            </div>

            <div className={styles.faqItem}>
              <dt>¿Puedo deducir las deudas del causante?</dt>
              <dd>
                Sí. Las deudas acreditadas del fallecido (hipotecas, préstamos, facturas pendientes)
                minoran la masa hereditaria. También son deducibles los <strong>gastos de última
                enfermedad</strong> y los gastos de sepelio (entierro y funeral) en cuantía razonable.
                No lo son, en cambio, las deudas a favor de los herederos o de los legatarios de parte
                alícuota, ni las que lo sean a favor de sus cónyuges, ascendientes, descendientes o
                hermanos, aunque renuncien a la herencia (art. 13.1 LISD).
              </dd>
            </div>

            <div className={styles.faqItem}>
              <dt>¿Qué diferencia hay entre reducción y bonificación?</dt>
              <dd>
                Son mecanismos distintos que actúan en fases diferentes del cálculo:
                <ul>
                  <li><strong>Reducción</strong>: Resta de la base imponible antes de aplicar la tarifa.
                  Ejemplo: reducción por parentesco de {euros(REDUCCIONES_PARENTESCO_IS['II'])} en Grupo II.</li>
                  <li><strong>Bonificación</strong>: Porcentaje que se aplica sobre la cuota tributaria
                  ya calculada. Ejemplo: Madrid bonifica el {pct((BONIFICACIONES_CCAA_IS['madrid'].bonificaciones['II']?.porcentaje ?? 0) * 100)} de la cuota para Grupo II.</li>
                </ul>
                Una reducción de {euros(REDUCCIONES_PARENTESCO_IS['II'])} ahorra
                entre {euros(AHORRO_REDUCCION_PARENTESCO.min)} y {euros(AHORRO_REDUCCION_PARENTESCO.max)} según
                el tramo en que caiga (del {pct(TARIFA_ESTATAL_IS[0].tipo, 2)} al{' '}
                {pct(TARIFA_ESTATAL_IS[TARIFA_ESTATAL_IS.length - 1].tipo, 2)} de la escala estatal).
                Una bonificación del 99&nbsp;% sobre una cuota de 10.000 € ahorra 9900 €.
                <div className={styles.faqTip}>Las bonificaciones autonómicas son en general mucho más potentes que las reducciones estatales.</div>
              </dd>
            </div>
          </dl>
        </section>

        {/* ── Sección 4: Guía paso a paso ──────────────────────────── */}
        <section className={styles.guideSection}>
          <h2>Guía paso a paso: del fallecimiento al pago del impuesto</h2>
          <p>
            Desde el fallecimiento hasta la inscripción de los bienes, el proceso tiene 7 etapas
            claramente definidas. El plazo para liquidar el impuesto es de <strong>{PLAZO_ISD.mesesPresentacion} meses</strong>,
            pero la tramitación completa puede llevar 1–2 años.
          </p>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>Obtener el certificado de defunción</strong>
                <p>
                  Se solicita en el Registro Civil del municipio donde ocurrió el fallecimiento.
                  Plazo recomendado: dentro de las 24 horas. Es gratuito. Necesario para todos
                  los trámites posteriores.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>Solicitar el certificado de últimas voluntades</strong>
                <p>
                  Acredita si el fallecido otorgó testamento y ante qué notario. Se solicita al
                  Ministerio de Justicia (presencialmente o por correo) con el certificado de
                  defunción. <strong>Plazo mínimo: 15 días hábiles</strong> desde el fallecimiento.
                  Está sujeto a una tasa del Ministerio de Justicia (modelo 790).
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>Obtener el testamento o iniciar declaración de herederos</strong>
                <p>
                  Si hay testamento: la notaría que lo otorgó entrega copia autorizada.
                  Si no hay testamento (abintestato): se inicia ante notaría el acta de declaración
                  de herederos, que puede tardar 2–4 meses. Sin este documento no se puede
                  inventariar ni adjudicar la herencia.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>Calcular la masa hereditaria neta</strong>
                <p>
                  Inventariar todos los bienes (cuentas, inmuebles, vehículos, fondos, seguros) y
                  restar las deudas acreditadas. El ajuar doméstico se presume en
                  el {pct(PORC_AJUAR_DOMESTICO_IS * 100)} del caudal relicto salvo
                  prueba en contrario. Obtener certificados de saldos bancarios a la fecha de
                  fallecimiento y tasaciones de inmuebles si es necesario.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>Aplicar reducciones y calcular la cuota</strong>
                <p>
                  Aplicar las reducciones según parentesco, edad, discapacidad y tipo de bien.
                  Aplicar la tarifa correspondiente (estatal o autonómica) sobre la base liquidable.
                  Multiplicar por el coeficiente según grupo y patrimonio. Aplicar la bonificación
                  autonómica si corresponde.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>6</span>
              <div className={styles.stepContent}>
                <strong>Autoliquidar con el modelo 650 en la CCAA competente</strong>
                <p>
                  La CCAA competente es donde residía el causante (fallecido) de forma habitual
                  durante los 5 años anteriores al fallecimiento. Plazo: <strong>{PLAZO_ISD.mesesPresentacion} meses</strong>
                  desde el fallecimiento. Se puede solicitar prórroga de {PLAZO_ISD.mesesProrroga} meses adicionales{' '}
                  {PLAZO_PEDIR_PRORROGA} ({PLAZO_ISD.norma}). El modelo 650 se presenta online
                  en el portal tributario de la CCAA correspondiente.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>7</span>
              <div className={styles.stepContent}>
                <strong>Inscribir bienes y adjudicar la herencia</strong>
                <p>
                  Una vez pagado el impuesto (o acreditado que la cuota es cero), se firma la
                  escritura de aceptación y adjudicación de herencia ante notario. Los inmuebles
                  se inscriben en el Registro de la Propiedad presentando la escritura junto con
                  el justificante de pago del ISD. Plazo registral: 15 días hábiles habitual.
                </p>
              </div>
            </li>
          </ol>
        </section>

        {/* ── Sección 5: Mejores prácticas ─────────────────────────── */}
        <section className={styles.guideSection}>
          <h2>6 buenas prácticas para liquidar correctamente el impuesto y aplicar los beneficios fiscales previstos por la norma</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">⏰</span>
              <div>
                <strong>Solicita la prórroga {PLAZO_PEDIR_PRORROGA}</strong>
                <p>
                  Si no tienes tiempo de tramitar la herencia en {PLAZO_ISD.mesesPresentacion} meses, solicita la prórroga{' '}
                  {PLAZO_PEDIR_PRORROGA}. La prórroga es de {PLAZO_ISD.mesesProrroga} meses adicionales y
                  evita el recargo por presentación extemporánea, pero <strong>no es gratis</strong>:
                  devenga intereses de demora desde que vencen los {PLAZO_ISD.mesesPresentacion} meses hasta que presentas
                  ({PLAZO_ISD.norma}).
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📋</span>
              <div>
                <strong>Valora la aceptación a beneficio de inventario</strong>
                <p>
                  Si el causante podría tener deudas desconocidas, acepta la herencia a beneficio
                  de inventario. Así solo respondes con los bienes heredados, no con tu patrimonio
                  personal. El plazo para optar es de 30 días hábiles desde que conoces la herencia.
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🏷️</span>
              <div>
                <strong>Verifica el método de valoración del inmueble</strong>
                <p>
                  Desde 2022, los inmuebles se declaran por el valor de referencia catastral.
                  Si es mayor que el valor de mercado, puedes impugnarlo ante la Dirección General
                  del Catastro aportando tasación pericial. Una reducción del 10&nbsp;% en la valoración
                  de un piso de {euros(EJEMPLO_VALORACION_PISO)} rebaja la base
                  en {euros(EJEMPLO_VALORACION_PISO * 0.1)}: entre {euros(AHORRO_VALORACION.min)} y{' '}
                  {euros(AHORRO_VALORACION.max)} de cuota íntegra según el tramo, antes de la
                  bonificación de tu comunidad.
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🪑</span>
              <div>
                <strong>Declara el ajuar doméstico correctamente</strong>
                <p>
                  {/* Decía «de la masa hereditaria neta», que en el panel incluye los seguros de
                      vida; el art. 15 LISD dice caudal relicto, y así calcula la app (hallazgo 2329). */}
                  Hacienda presume el {pct(PORC_AJUAR_DOMESTICO_IS * 100, 0)} del caudal
                  relicto —lo que deja el fallecido, sin los seguros de vida— como ajuar doméstico
                  (art. 15 LISD).
                  Si los muebles, ropa y enseres valen menos, puedes impugnar esta presunción
                  aportando inventario valorado. En una herencia de {euros(EJEMPLO_AJUAR_HERENCIA)}, el
                  ajuar presunto es de {euros(EJEMPLO_AJUAR_PRESUNTO)}, lo que
                  supone entre {euros(AHORRO_AJUAR.min)} y {euros(AHORRO_AJUAR.max)} adicionales de
                  impuesto según el tramo.
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🏠</span>
              <div>
                <strong>Aplica la reducción por vivienda habitual</strong>
                <p>
                  Si heredas la vivienda habitual del causante, aplica la reducción
                  del {pct(REDUCCION_VIVIENDA_PORC_IS * 100)}
                  sobre su valor (con el límite estatal de {euros(REDUCCION_VIVIENDA_MAX_IS)} por heredero). Cónyuge,
                  descendientes y ascendientes pueden aplicarla. En Cataluña el límite es muy
                  superior —{euros(REDUCCION_VIVIENDA_MAX_CATALUNA_IS)} sobre el valor conjunto de
                  la vivienda, con un mínimo de {euros(REDUCCION_VIVIENDA_MIN_INDIVIDUAL_CATALUNA_IS)} por
                  heredero tras el prorrateo—, y por eso allí esta reducción suele
                  decidir el resultado. Requisito: mantener la
                  vivienda {formatNumber(REDUCCION_VIVIENDA_ANIOS_MANTENIMIENTO_IS, 0)} años
                  ({formatNumber(REDUCCION_VIVIENDA_ANIOS_MANTENIMIENTO_CATALUNA_IS, 0)} en Cataluña).
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📤</span>
              <div>
                <strong>Liquida aunque la cuota sea cero</strong>
                <p>
                  En comunidades con bonificación {rangoBonificacion(CCAA_CUOTA_CASI_CERO, 'II')}{' '}
                  ({NOMBRES_CCAA(CCAA_CUOTA_CASI_CERO)}) la cuota que queda suele ser pequeña, o cero
                  con exención, pero la obligación de presentar el modelo 650 subsiste. No presentar en plazo puede acarrear una sanción por infracción
                  formal (art. 198 de la Ley General Tributaria) y complicar la inscripción de
                  los bienes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Sección 6: Warning box — errores comunes ─────────────── */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <h2>6 errores que pueden costarte caro</h2>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>No declarar en plazo.</strong> El recargo por extemporaneidad espontánea
                es del {pct(ESCALA_RECARGO_EXTEMPORANEO.porcentajeBase, 0)} más
                un {pct(ESCALA_RECARGO_EXTEMPORANEO.porcentajePorMes, 0)} por mes completo de retraso,
                y un {pct(ESCALA_RECARGO_EXTEMPORANEO.porcentajeMas12Meses, 0)} fijo más intereses
                pasados los {ESCALA_RECARGO_EXTEMPORANEO.mesesEscalaProporcional} meses. Una cuota de
                10.000 € presentada con 8 meses de retraso genera{' '}
                {formatCurrency(10000 * porcentajeRecargoExtemporaneo(8) / 100)} de recargo.
              </li>
              <li>
                <strong>Confundir la CCAA competente.</strong> El impuesto se presenta en la CCAA
                donde residía habitualmente el causante durante los últimos 5 años, <em>no</em> donde
                está el heredero ni donde están los bienes. Presentar en la CCAA incorrecta no
                interrumpe el plazo: Hacienda puede exigirte el impuesto en la CCAA correcta con
                los recargos correspondientes.
              </li>
              <li>
                <strong>No solicitar prórroga en tiempo.</strong> La prórroga de {PLAZO_ISD.mesesProrroga} meses solo puede
                pedirse {PLAZO_PEDIR_PRORROGA}. Pasados esos {PLAZO_ISD.mesesParaPedirProrroga} meses ya no
                es posible: queda el plazo ordinario de {PLAZO_ISD.mesesPresentacion} meses, y presentar
                después genera recargo.
              </li>
              <li>
                <strong>Ignorar el ajuar doméstico.</strong> Hacienda presume automáticamente el
                {pct(PORC_AJUAR_DOMESTICO_IS * 100)} del caudal relicto como ajuar. Si lo omites en tu
                declaración, la oficina gestora puede practicar una liquidación paralela incluyendo
                ese {pct(PORC_AJUAR_DOMESTICO_IS * 100)} más intereses de demora.
              </li>
              <li>
                <strong>Aceptar la herencia sin inventario cuando hay deudas.</strong> Si el causante
                tenía deudas desconocidas (tarjetas, avales, impuestos pendientes), aceptar la
                herencia pura y simplemente hace que respondas con todo tu patrimonio. La aceptación
                a beneficio de inventario limita tu responsabilidad a los bienes heredados.
              </li>
              <li>
                <strong>Olvidar los seguros de vida.</strong> Los seguros de vida contratados por
                el causante con beneficiarios nominados no forman parte de la herencia civil, pero
                <em>sí tributan por ISD</em> por su normativa específica. El beneficiario debe
                declararlos en el modelo 650 dentro del mismo plazo de {PLAZO_ISD.mesesPresentacion} meses, con independencia
                de la herencia. La reducción estatal máxima es
                de {euros(REDUCCION_SEGURO_VIDA_MAX_IS)} para cónyuge,
                descendientes y ascendientes.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('estimador-impuesto-sucesiones')} />
      <ShareCard appName="estimador-impuesto-sucesiones" />
      <Footer appName="estimador-impuesto-sucesiones" />
    </div>
  );
}
