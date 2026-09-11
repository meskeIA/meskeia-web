'use client';

import { useState, useMemo } from 'react';
import styles from './EstimadorSucesiones.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, ShareCard, LegalNotice, DisclaimerCard,
  DataReference, RegionBadge
} from '@/components';
import { formatCurrency, formatNumber, parseSpanishNumber } from '@/lib';
import {
  ESCALA_RECARGO_EXTEMPORANEO,
  porcentajeRecargoExtemporaneo,
} from '@/lib/calculadoras/recargoPresentacionTardia';
import { getRelatedApps } from '@/data/app-relations';
import {
  FISCAL_SUCESIONES_META,
  TARIFA_ESTATAL_IS,
  TARIFA_CATALUNA_IS,
  COEFICIENTES_IS,
  COEFICIENTES_CATALUNA_IS,
  REDUCCIONES_PARENTESCO_IS,
  REDUCCIONES_PARENTESCO_CATALUNA_IS,
  REDUCCION_EDAD_MENOR_21_IS,
  REDUCCION_EDAD_MENOR_21_MAX_IS,
  REDUCCION_EDAD_MENOR_21_CATALUNA_IS,
  REDUCCION_EDAD_MENOR_21_MAX_CATALUNA_IS,
  REDUCCION_SEGURO_VIDA_MAX_IS,
  REDUCCION_DISCAPACIDAD_33_IS,
  REDUCCION_DISCAPACIDAD_65_IS,
  PORC_AJUAR_DOMESTICO_IS,
  BONIFICACIONES_CCAA_IS,
  TramoTarifaIS,
  BonificacionGrupoIS,
} from '@/data/fiscal';
import {
  evaluarReduccionVivienda,
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
  cuotaTributaria: number;
  // Bonificación
  bonificacionCcaa: number;
  porcentajeBonificacion: number;
  detalleBonificacion: string;
  cuotaFinal: number;
  // Meta
  tipoEfectivo: number;
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
      detalle: `Bonificación ${formatNumber(pct * 100, 2)}% por escala del art. 58 bis (${config.nombre})`,
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
      detalle: `Bonificación ${formatNumber(tramoSeleccionado.porcentaje * 100, 0)} % (${config.nombre})`,
    };
  }

  // Bonificación con tope (La Rioja)
  if (bGrupo.tope !== undefined && bGrupo.porcentajeMayor !== undefined && baseLiquidable > bGrupo.tope) {
    const bonif = cuotaTributaria * bGrupo.porcentajeMayor;
    return {
      bonificacion: bonif,
      porcentaje: bGrupo.porcentajeMayor * 100,
      detalle: `Bonificación ${formatNumber(bGrupo.porcentajeMayor * 100, 0)} % (base supera ${formatCurrency(bGrupo.tope)})`,
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
      detalle: `Bonificación ${formatNumber(bGrupo.porcentaje * 100, 1)} % (${config.nombre})`,
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
  const [edad, setEdad] = useState('35');
  // Solo interviene si el heredero es colateral (Grupo III): art. 20.2.c LISD
  const [convivenciaDosAnios, setConvivenciaDosAnios] = useState(false);
  const [discapacidad, setDiscapacidad] = useState<NivelDiscapacidad>('0');
  const [patrimonioIdx, setPatrimonioIdx] = useState('1');

  // Tipo de adquisición
  const [tipoAdquisicion, setTipoAdquisicion] = useState<TipoAdquisicion>('plena');
  const [edadUsufructuario, setEdadUsufructuario] = useState('70');
  const [porcentajeHerencia, setPorcentajeHerencia] = useState('100');

  const ccaaInfo = useMemo(() => (ccaa ? BONIFICACIONES_CCAA_IS[ccaa] : null), [ccaa]);

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
    return {
      invalidos,
      bienes: { bSaldos, bAcciones, bVivienda, bOtrosInm, bVehiculos, bSeguros, bOtros },
      deudas: { dHipotecas, dPrestamos, dSepelio },
    };
  }, [saldosCuentas, accionesFondos, viviendaHabitual, otrosInmuebles, vehiculos, segurosVida,
      otrosBienes, hipotecas, otrosPrestamos, gastosSepelio]);

  const resultado = useMemo((): ResultadoSucesiones | null => {
    if (!ccaa || !grupo) return null;
    // Con un solo importe ilegible no se estima: el aviso lo nombra y el panel no da cifra.
    if (importes.invalidos.length > 0) return null;

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
    const ajuarDomestico = masaHereditaria * PORC_AJUAR_DOMESTICO_IS;
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
    const porcHerencia = Math.min(100, Math.max(0,
      Number.isFinite(porcentajeParseado) ? porcentajeParseado : 100
    )) / 100;
    let baseAjustada = baseImponibleTotal * porcHerencia;

    // Tipo de adquisición (usufructo / nuda)
    const edadUsufParseada = Number.parseInt(edadUsufructuario, 10);
    const edadUsuf = Number.isFinite(edadUsufParseada) ? edadUsufParseada : 70;
    let porcentajeAdquisicion = 1;
    if (tipoAdquisicion === 'usufructo') {
      porcentajeAdquisicion = Math.max(0.10, (89 - edadUsuf) / 100);
      baseAjustada = baseImponibleTotal * porcHerencia * porcentajeAdquisicion;
    } else if (tipoAdquisicion === 'nuda') {
      const porcUsuf = Math.max(0.10, (89 - edadUsuf) / 100);
      porcentajeAdquisicion = 1 - porcUsuf;
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
     */
    const edadParseada = Number.parseInt(edad, 10);
    const edadNum = Number.isFinite(edadParseada) ? edadParseada : 35;
    if (grupo === 'I-descendiente' && edadNum < 21) {
      const porAnio = esCataluna ? REDUCCION_EDAD_MENOR_21_CATALUNA_IS : REDUCCION_EDAD_MENOR_21_IS;
      const topeTotal = esCataluna ? REDUCCION_EDAD_MENOR_21_MAX_CATALUNA_IS : REDUCCION_EDAD_MENOR_21_MAX_IS;
      const reduccionEdad = Math.min(
        reduccionParentesco + porAnio * (21 - edadNum),
        topeTotal
      ) - reduccionParentesco;
      if (reduccionEdad > 0) {
        reducciones.push({ concepto: `Por edad (${21 - edadNum} años < 21)`, importe: reduccionEdad });
      }
    }

    // 3. Reducción por seguro de vida (solo para cónyuge, descendientes, ascendientes)
    const gruposConSeguro = ['I-conyuge', 'I-descendiente', 'II', 'II-descendiente', 'II-ascendiente'];
    if (gruposConSeguro.includes(grupo) && v_seguros > 0) {
      const reduccionSeguro = Math.min(v_seguros, REDUCCION_SEGURO_VIDA_MAX_IS);
      reducciones.push({ concepto: 'Seguro de vida', importe: reduccionSeguro });
    }

    // 4. Reducción vivienda habitual — evaluarReduccionVivienda es la fuente única de esta
    // regla desde el 27/08/2026 (hallazgo 500): esta app tenía su propia copia y concedía el
    // 95% a todo el Grupo III sin comprobar los 65 años ni la convivencia de los 2 años
    // anteriores que exige el art. 20.2.c LISD.
    const baseViviendaHeredero = v_vivienda * porcHerencia;
    const vivienda = evaluarReduccionVivienda({
      valorVivienda: baseViviendaHeredero > 0 ? baseViviendaHeredero : undefined,
      grupo,
      ccaa,
      edadHeredero: Number.isFinite(edadParseada) ? edadParseada : undefined,
      convivenciaDosAnios,
    });
    if (vivienda.reduccion > 0) {
      reducciones.push({ concepto: 'Vivienda habitual (95%)', importe: vivienda.reduccion });
    }
    const viviendaNoAplicada = vivienda.noAplicada;

    // 5. Reducción por discapacidad
    if (discapacidad === '33') {
      reducciones.push({ concepto: 'Discapacidad 33%–64%', importe: REDUCCION_DISCAPACIDAD_33_IS });
    } else if (discapacidad === '65') {
      reducciones.push({ concepto: 'Discapacidad ≥65%', importe: REDUCCION_DISCAPACIDAD_65_IS });
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
    const cuotaIntegra = calcularTarifa(baseLiquidable, tarifa);

    // Coeficiente multiplicador
    const grupoBase = getGrupoBase(grupo);
    const coeficientes = esCataluna ? COEFICIENTES_CATALUNA_IS : COEFICIENTES_IS;
    const idxPatrimonio = Math.min(3, Math.max(0, parseInt(patrimonioIdx) - 1));
    const coeficienteMultiplicador = coeficientes[grupoBase]?.[idxPatrimonio] ?? 1;

    const cuotaTributaria = cuotaIntegra * coeficienteMultiplicador;

    // Bonificación CCAA. `baseAjustada` es la base IMPONIBLE de ESTE heredero —ya con el ajuar
    // y con su porcentaje de herencia o su usufructo aplicados—, que es sobre la que la escala
    // catalana del art. 58 bis construye el porcentaje. El resto de comunidades siguen mirando
    // la liquidable.
    const { bonificacion, porcentaje, detalle } = aplicarBonificacion(
      cuotaTributaria, baseLiquidable, grupo, ccaa, baseAjustada
    );

    const cuotaFinal = Math.max(0, cuotaTributaria - bonificacion);
    const tipoEfectivo = baseImponibleTotal > 0 ? (cuotaFinal / baseAjustada) * 100 : 0;

    return {
      totalActivos,
      totalDeudas,
      masaHereditaria,
      ajuarDomestico,
      baseImponible: baseImponibleTotal,
      porcentajeAdquisicion,
      baseAjustada,
      reducciones,
      totalReducciones,
      viviendaNoAplicada,
      baseLiquidable,
      cuotaIntegra,
      coeficienteMultiplicador,
      cuotaTributaria,
      bonificacionCcaa: bonificacion,
      porcentajeBonificacion: porcentaje,
      detalleBonificacion: detalle,
      cuotaFinal,
      tipoEfectivo,
      ccaaNombre: ccaaInfo?.nombre ?? '',
      esForal,
    };
  }, [
    ccaa, grupo, edad, convivenciaDosAnios, discapacidad, patrimonioIdx, tipoAdquisicion,
    edadUsufructuario, porcentajeHerencia, importes, ccaaInfo,
  ]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}><span aria-hidden="true">⚖️</span> Estimador del Impuesto de Sucesiones</h1>
        <p className={styles.subtitle}>
          Oriéntate sobre el ISD en las 17 comunidades autónomas antes de hablar con tu asesor fiscal
        </p>
        <p className={styles.metaVerificado}>
          Datos verificados: {FISCAL_SUCESIONES_META.verificado} — Fuente:{' '}
          <a href={FISCAL_SUCESIONES_META.urlOficial} target="_blank" rel="noopener noreferrer" className={styles.linkFuente}>
            Agencia Tributaria
          </a>
        </p>
      </header>

      <RegionBadge variant="es-only" />


      <LegalNotice />

      <DisclaimerCard
        variant="financial"
        severity="critical"
        collapsible={false}
      />

      <DataReference
        normativa={`ISD ${FISCAL_SUCESIONES_META.vigencia}`}
        fuente={FISCAL_SUCESIONES_META.fuente}
        verificado={FISCAL_SUCESIONES_META.verificado}
        urlOficial={FISCAL_SUCESIONES_META.urlOficial}
      />

      {/* Disclaimer SIEMPRE VISIBLE */}
      <div className={styles.disclaimerCritico}>
        <h2 className={styles.disclaimerTitulo}><span aria-hidden="true">⚠️</span> Aviso Legal Imprescindible</h2>
        <p>
          Esta herramienta es <strong>exclusivamente orientativa</strong>. Los resultados son estimaciones
          basadas en tarifas generales y <strong>no tienen validez fiscal</strong>.
        </p>
        <ul>
          <li>El ISD contempla decenas de supuestos especiales no incluidos aquí</li>
          <li>Empresas familiares, explotaciones agrarias y otros bienes tienen reducciones especiales</li>
          <li>Las bonificaciones autonómicas pueden tener requisitos formales adicionales</li>
          <li>El ajuar doméstico (3%) puede impugnarse con prueba en contrario</li>
          <li><strong>Consulta siempre con un gestor o asesor fiscal antes de autoliquidar</strong></li>
        </ul>
        <p className={styles.disclaimerPlazo}>
          <span aria-hidden="true">📅</span> Plazo de autoliquidación: <strong>6 meses</strong> desde el fallecimiento (prorrogable 6 meses más)
        </p>
        <p className={styles.disclaimerResponsabilidad}>
          meskeIA no se responsabiliza de decisiones basadas en estas herramientas.
        </p>
      </div>

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
                <option value="">— Selecciona tu CCAA —</option>
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

            {ccaaInfo?.regimen === 'foral' && ccaa !== 'cataluna' && (
              <div className={styles.alertaForal}>
                <strong><span aria-hidden="true">⚠️</span> Régimen Foral</strong>
                <p>{ccaaInfo.notas}</p>
              </div>
            )}

            {ccaaInfo && (
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
                  onChange={(e) => setEdad(e.target.value)} min="0" max="100" />
                <span className={styles.helper}>
                  {grupo === 'I-descendiente'
                    ? 'Relevante si es menor de 21 años'
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
                {[['0','No'], ['33','33%–64%'], ['65','≥65%']].map(([v, l]) => (
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
              <select id="patrimonio-preexistente" className={styles.select} value={patrimonioIdx} onChange={(e) => setPatrimonioIdx(e.target.value)}>
                <option value="1">Menos de 402.678 €</option>
                <option value="2">402.678 € – 2.007.380 €</option>
                <option value="3">2.007.380 € – 4.020.770 €</option>
                <option value="4">Más de 4.020.770 €</option>
              </select>
            </div>

            <div className={styles.campo}>
              <label className={styles.label} htmlFor="porcentaje-herencia">Porcentaje de la herencia que recibes</label>
              <div className={styles.inputConUnidad}>
                <input id="porcentaje-herencia" type="number" className={styles.input} value={porcentajeHerencia}
                  onChange={(e) => setPorcentajeHerencia(e.target.value)} min="0" max="100" />
                <span className={styles.unidad}>%</span>
              </div>
              <span className={styles.helper}>100% si eres el único heredero</span>
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
                  onChange={(e) => setEdadUsufructuario(e.target.value)} min="10" max="89" />
                <span className={styles.helper}>Fórmula: valor usufructo = (89 – edad) / 100, mín. 10%</span>
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
          {importes.invalidos.length > 0 ? (
            /*
              El aviso NOMBRA los campos, y el panel no da ninguna cifra mientras estén así.
              Antes el importe ilegible se convertía en cero y la estimación salía igual: el
              usuario veía una cuota completa calculada sin sus saldos bancarios, o con una
              masa hereditaria que un signo menos había triplicado (hallazgos 740 y 742).
            */
            <div className={styles.placeholder} role="alert">
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
                    Bonificación autonómica: {formatNumber(resultado.porcentajeBonificacion, 1)}%
                  </span>
                )}
                <span className={styles.resultadoTipoEfectivo}>
                  Tipo efectivo: {formatNumber(resultado.tipoEfectivo, 2)}%
                </span>
              </div>

              {/* Masa hereditaria */}
              <div className={styles.desglose}>
                <h3 className={styles.desgloseTitle}>Masa Hereditaria</h3>
                <div className={styles.linea}><span>Total activos</span><span>{formatCurrency(resultado.totalActivos)}</span></div>
                {resultado.totalDeudas > 0 && <div className={styles.linea}><span>– Deudas y cargas</span><span>{formatCurrency(resultado.totalDeudas)}</span></div>}
                <div className={styles.linea}><span>Masa hereditaria neta</span><span>{formatCurrency(resultado.masaHereditaria)}</span></div>
                <div className={styles.linea}><span>+ Ajuar doméstico (3%)</span><span>{formatCurrency(resultado.ajuarDomestico)}</span></div>
                <div className={`${styles.linea} ${styles.lineaTotal}`}><span>Base imponible total</span><span>{formatCurrency(resultado.baseImponible)}</span></div>
              </div>

              {/* Ajuste por adquisición */}
              {(tipoAdquisicion !== 'plena' || parseFloat(porcentajeHerencia) !== 100) && (
                <div className={styles.desglose}>
                  <h3 className={styles.desgloseTitle}>Adquisición del Heredero</h3>
                  <div className={styles.linea}><span>Porcentaje de herencia</span><span>{porcentajeHerencia}%</span></div>
                  {tipoAdquisicion !== 'plena' && (
                    <div className={styles.linea}>
                      <span>Tipo adquisición ({tipoAdquisicion})</span>
                      <span>{formatNumber(resultado.porcentajeAdquisicion * 100, 1)}%</span>
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
            <li><strong>Ajuar doméstico:</strong> Se añade automáticamente un 3% (salvo prueba en contrario)</li>
            <li><strong>Base imponible:</strong> Masa + ajuar, proporcional al porcentaje heredado</li>
            <li><strong>Reducciones:</strong> Por parentesco, edad, discapacidad, vivienda habitual, seguro de vida</li>
            <li><strong>Base liquidable:</strong> Base imponible – reducciones</li>
            <li><strong>Cuota íntegra:</strong> Aplicando la tarifa correspondiente a la base liquidable</li>
            <li><strong>Coeficiente multiplicador:</strong> Según grupo y patrimonio preexistente</li>
            <li><strong>Bonificación autonómica:</strong> Las CCAA pueden reducir la cuota hasta el 99,9%</li>
          </ol>

          <h3>Diferencias entre CCAA</h3>
          <p>
            Las comunidades usan dos mecanismos distintos y conviene no confundirlos. Madrid y
            Canarias bonifican la CUOTA —el 99% y el 99,9% para los grupos más cercanos—, de modo
            que el impuesto queda cerca de cero. Asturias no bonifica en cuota a esos grupos, pero
            les aplica una reducción de 300.000 € en la BASE, que en herencias medianas absorbe la
            base entera y deja también una cuota de cero: con 250.000 € heredados por un hijo, de
            los que 200.000 € son la vivienda habitual, esta misma calculadora liquida 0,00 € en
            Asturias y 111,11 € en Madrid. Cuál sale más barata depende del importe y del
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
            pero sí tiene su propia ley del impuesto (Ley 19/2010): tarifa entre el 7% y el 32% y
            reducciones distintas de las estatales, entre ellas 100.000 € para el cónyuge y para el
            hijo, 50.000 € para el resto de descendientes y 30.000 € para los ascendientes. País Vasco
            (tres Haciendas Forales diferentes) y Navarra tienen sistemas muy favorables para
            familiares directos, con reducciones cercanas al 100%.
          </p>

          <h3>Plazos importantes</h3>
          <div className={styles.plazosGrid}>
            <div className={styles.plazoCard}>
              <span className={styles.plazoNum}>6 meses</span>
              <span>Para autoliquidar desde el fallecimiento</span>
            </div>
            <div className={styles.plazoCard}>
              <span className={styles.plazoNum}>+6 meses</span>
              <span>Prórroga solicitando antes de los primeros 5 meses</span>
            </div>
          </div>
        </section>

        {/* ── Sección 1: Tabla comparativa de grupos ────────────────── */}
        <section className={styles.guideSection}>
          <h2>Comparativa de los 4 grupos de parentesco</h2>
          <p>
            El grupo de parentesco es el factor que más condiciona la carga fiscal. La diferencia entre
            un hijo y un sobrino puede suponer pagar el 0% o más del 30% de la herencia.
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
                  <td>15.956,87 € + 3.990,72 € por año &lt;21 (máx. 47.858,59 €)</td>
                  <td>1,0000 (patrimonio &lt;402.678 €)</td>
                  <td>99%–100% en Madrid, Canarias, Galicia, Andalucía</td>
                  <td>Hijo menor de 21 años hereda la vivienda familiar</td>
                </tr>
                <tr>
                  <td><strong>Grupo II</strong><br /><small>Descendiente ≥21 a. / cónyuge / ascendiente</small></td>
                  <td>15.956,87 €</td>
                  <td>1,0000 (patrimonio &lt;402.678 €)</td>
                  <td>99%–100% en Madrid, Canarias; 0% en Asturias</td>
                  <td>Hijo adulto, cónyuge o padre hereda bienes del fallecido</td>
                </tr>
                <tr>
                  <td><strong>Grupo III</strong><br /><small>Hermanos, tíos, sobrinos</small></td>
                  <td>7.993,46 €</td>
                  <td>1,5882 (patrimonio &lt;402.678 €)</td>
                  <td>Escasa o nula en la mayoría de CCAA</td>
                  <td>Sobrino hereda de tía sin hijos</td>
                </tr>
                <tr>
                  <td><strong>Grupo IV</strong><br /><small>Primos, parientes lejanos, extraños</small></td>
                  <td>0 €</td>
                  <td>2,0000 (patrimonio &lt;402.678 €)</td>
                  <td>Generalmente sin bonificación</td>
                  <td>Amigo o pareja no registrada hereda bienes</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className={styles.helper}>* Coeficientes para el régimen estatal (tarifa de 2025). Cataluña tiene coeficientes propios.</p>
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
                  Base imponible: 200.000 € (piso) + 6.000 € (ajuar 3%) = <strong>206.000 €</strong>.
                  Reducción por parentesco: 15.956,87 €. Reducción vivienda habitual (95%):
                  mín(190.000 × 0,95; 122.606 €) = <strong>122.606 €</strong>.
                  Base liquidable: 67.437 €. Cuota íntegra (tarifa estatal): ~6.100 €.
                  Bonificación Madrid (99%): –6.039 €.
                </p>
                <p><strong>Cuota final estimada: ~61 €</strong></p>
              </div>
              <div className={styles.escenarioTip}>
                Madrid tiene bonificación del 99% para Grupos I y II. Un hijo paga prácticamente cero.
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
                  Base imponible: 80.000 € + 2.400 € (ajuar) = <strong>82.400 €</strong>.
                  Reducción por parentesco (Grupo III): 7.993,46 €. Reducción propia de Asturias
                  para el Grupo III: 50.000 € en la base. Base liquidable: 24.406,54 €.
                  Cuota íntegra: 2.081,95 €. Coeficiente multiplicador (Grupo III): × 1,5882 → <strong>3.306,56 €</strong>.
                  Asturias no tiene bonificación en cuota para el Grupo III: su beneficio ya se ha
                  aplicado antes, en la base.
                </p>
                <p><strong>Cuota final estimada: 3.306,56 €</strong> (4,1% del valor heredado)</p>
              </div>
              <div className={styles.escenarioTip}>
                Al colateral le toca el coeficiente multiplicador de 1,5882, que encarece la cuota
                frente a hijos y cónyuge. Lo que cambia mucho de una comunidad a otra es qué recibe
                el Grupo III: doce comunidades del régimen común no le dan nada, Asturias le reduce
                50.000 € de la base, Madrid y Murcia le bonifican el 50% de la cuota y Canarias el
                99,9%. Comprueba la tuya antes de dar por hecha la cifra.
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
                  Cataluña aplica tarifa propia (7%–32%) y coeficientes propios.
                  Sin más reducciones que la de parentesco del cónyuge (100.000 € en Cataluña),
                  la base liquidable es de 400.000 € y la cuota, de 57.000 €.
                  Coeficiente cónyuge catalán: 1,0000.
                </p>
                <p>
                  <strong>La reducción del 95% por empresa familiar</strong> (art. 20.2.c de la
                  Ley 29/1987 y sección 3ª de la Ley 19/2010) puede dejar la cuota en cero si se
                  cumplen los requisitos de permanencia, pero <strong>esta herramienta no la
                  calcula</strong>: la cifra de arriba es el techo, no la factura.
                </p>
              </div>
              <div className={styles.escenarioTip}>
                La reducción por empresa familiar (95%) requiere que el causante ejerciera
                funciones de dirección y que la familia mantenga los bienes 10 años.
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
                <p>
                  País Vasco tiene normativa foral propia (Álava, Bizkaia, Gipuzkoa con pequeñas
                  diferencias). Para descendientes directos con discapacidad ≥33%, la reducción
                  adicional es de 55.000 €–65.000 € según territorio. La bonificación para
                  familiares directos es del 95%–100% en la mayoría de supuestos.
                </p>
                <p><strong>Cuota efectiva generalmente cercana a 0 €</strong></p>
              </div>
              <div className={styles.escenarioTip}>
                País Vasco, Navarra y Cataluña tienen sus propias reducciones por discapacidad,
                a menudo más generosas que la estatal (47.858,59 € al 65%).
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
                En la práctica, casi nunca. Madrid aplica una bonificación del 99% para los Grupos I y II
                (cónyuge, descendientes, ascendientes). Canarias aplica el 99,9% para los mismos grupos.
                La cuota resultante es de céntimos. Sin embargo, <strong>sí estás obligado a autoliquidar
                aunque la cuota sea cero</strong>, presentando el modelo 650 en el plazo de 6 meses.
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
                con intereses de demora (actualmente al 4,0625% anual).
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
                patrimonio preexistente del heredero. Un hijo con menos de 402.678 € de patrimonio
                usa el coeficiente 1,0000 (sin incremento). Un sobrino (Grupo III) con el mismo
                patrimonio usa 1,5882, por lo que paga un 58,82% más que la cuota íntegra base.
                Con patrimonio preexistente superior a 4.020.770 €, el coeficiente llega a 2,4 en
                el Grupo IV.
              </dd>
            </div>

            <div className={styles.faqItem}>
              <dt>¿Cómo afecta la discapacidad a las reducciones?</dt>
              <dd>
                La normativa estatal establece dos tramos: discapacidad entre el 33% y el 64%
                da derecho a una reducción adicional de <strong>47.858,59 €</strong>; discapacidad
                del 65% o superior da derecho a <strong>150.253,03 €</strong>. Estas reducciones
                se suman a las de parentesco. Algunas CCAA (Andalucía, Valencia, Cataluña) amplían
                estos importes. El grado de discapacidad debe estar reconocido oficialmente antes
                del devengo del impuesto.
              </dd>
            </div>

            <div className={styles.faqItem}>
              <dt>¿Qué pasa si presento fuera de plazo?</dt>
              <dd>
                Si presentas antes de que Hacienda te requiera, se aplica el recargo por extemporaneidad
                espontánea del art. 27.2 LGT: un <strong>{formatNumber(ESCALA_RECARGO_EXTEMPORANEO.porcentajeBase, 0)}% de partida
                más otro {formatNumber(ESCALA_RECARGO_EXTEMPORANEO.porcentajePorMes, 0)}% por cada mes completo de retraso</strong>,
                hasta los {ESCALA_RECARGO_EXTEMPORANEO.mesesEscalaProporcional} meses. A partir de ahí es
                un {formatNumber(ESCALA_RECARGO_EXTEMPORANEO.porcentajeMas12Meses, 0)}% fijo más intereses de demora
                (al {formatNumber(ESCALA_RECARGO_EXTEMPORANEO.interesDemoraAnual, 2)}% anual). El recargo se reduce
                un {formatNumber(ESCALA_RECARGO_EXTEMPORANEO.reduccionProntoPago, 0)}% si se paga en período voluntario.
                Si Hacienda actúa primero (liquidación de oficio), se aplican sanciones que pueden
                llegar al 150% de la deuda.
              </dd>
            </div>

            <div className={styles.faqItem}>
              <dt>¿Puedo deducir las deudas del causante?</dt>
              <dd>
                Sí. Las deudas acreditadas del fallecido (hipotecas, préstamos, facturas pendientes)
                minoran la masa hereditaria. También son deducibles los <strong>gastos de última
                enfermedad</strong> y los gastos de sepelio (entierro y funeral) en cuantía razonable.
                No son deducibles las deudas contraídas con herederos, ni las garantizadas con cláusula
                de reserva de dominio.
              </dd>
            </div>

            <div className={styles.faqItem}>
              <dt>¿Qué diferencia hay entre reducción y bonificación?</dt>
              <dd>
                Son mecanismos distintos que actúan en fases diferentes del cálculo:
                <ul>
                  <li><strong>Reducción</strong>: Resta de la base imponible antes de aplicar la tarifa.
                  Ejemplo: reducción por parentesco de 15.956,87 € en Grupo II.</li>
                  <li><strong>Bonificación</strong>: Porcentaje que se aplica sobre la cuota tributaria
                  ya calculada. Ejemplo: Madrid bonifica el 99% de la cuota para Grupo II.</li>
                </ul>
                Una reducción de 15.956 € ahorra entre ~1.200 € y ~3.700 € dependiendo del tramo.
                Una bonificación del 99% sobre una cuota de 10.000 € ahorra 9.900 €.
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
            claramente definidas. El plazo para liquidar el impuesto es de <strong>6 meses</strong>,
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
                  Coste: 3,78 €.
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
                  restar las deudas acreditadas. El ajuar doméstico se presume en el 3% salvo
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
                  durante los 5 años anteriores al fallecimiento. Plazo: <strong>6 meses</strong>
                  desde el fallecimiento. Se puede solicitar prórroga de 6 meses adicionales
                  antes de que expiren los primeros 5 meses. El modelo 650 se presenta online
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
                <strong>Solicita la prórroga antes del mes 5</strong>
                <p>
                  Si no tienes tiempo de tramitar la herencia en 6 meses, solicita la prórroga
                  antes de que expiren los primeros 5 meses. La prórroga es de 6 meses adicionales
                  y no genera intereses ni recargo si se solicita en plazo.
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
                  del Catastro aportando tasación pericial. Una reducción del 10% en la valoración
                  de un piso de 300.000 € puede ahorrar 1.000–4.000 € en ISD.
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🪑</span>
              <div>
                <strong>Declara el ajuar doméstico correctamente</strong>
                <p>
                  Hacienda presume el 3% del valor de la masa hereditaria neta como ajuar doméstico.
                  Si los muebles, ropa y enseres valen menos, puedes impugnar esta presunción
                  aportando inventario valorado. En una herencia de 400.000 €, el ajuar presunto
                  es de 12.000 €, lo que supone ~600–2.000 € adicionales de impuesto.
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🏠</span>
              <div>
                <strong>Aplica la reducción por vivienda habitual</strong>
                <p>
                  Si heredas la vivienda habitual del causante, aplica la reducción del 95%
                  sobre su valor (con el límite estatal de 122.606,47 € por heredero). Cónyuge,
                  descendientes y ascendientes pueden aplicarla. En Cataluña el límite es muy
                  superior —500.000 € sobre el valor conjunto de la vivienda, con un mínimo de
                  180.000 € por heredero tras el prorrateo—, y por eso allí esta reducción suele
                  decidir el resultado. Requisito: mantener la vivienda 10 años (5 en Cataluña,
                  o 3 en algunas CCAA).
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📤</span>
              <div>
                <strong>Liquida aunque la cuota sea cero</strong>
                <p>
                  En CCAA con bonificación del 99%–100% (Madrid, Canarias, Galicia), la cuota
                  resultante es prácticamente cero pero la obligación de presentar el modelo 650
                  subsiste. No presentar conlleva sanción por infracción formal de entre 200 € y
                  400 € y puede complicar la inscripción de los bienes.
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
                es del {formatNumber(ESCALA_RECARGO_EXTEMPORANEO.porcentajeBase, 0)}% más
                un {formatNumber(ESCALA_RECARGO_EXTEMPORANEO.porcentajePorMes, 0)}% por mes completo de retraso,
                y un {formatNumber(ESCALA_RECARGO_EXTEMPORANEO.porcentajeMas12Meses, 0)}% fijo más intereses
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
                <strong>No solicitar prórroga en tiempo.</strong> La prórroga de 6 meses solo puede
                pedirse antes de que expiren los primeros 5 meses. Si esperas al mes 6, ya no es
                posible: el plazo ha vencido y cualquier presentación fuera de plazo genera recargo.
              </li>
              <li>
                <strong>Ignorar el ajuar doméstico.</strong> Hacienda presume automáticamente el
                3% del valor neto como ajuar. Si lo omites en tu declaración, la oficina gestora
                puede practicar una liquidación paralela incluyendo ese 3% más intereses de demora.
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
                declararlos en el modelo 650 dentro del mismo plazo de 6 meses, con independencia
                de la herencia. La reducción estatal máxima es de 9.195,49 € para cónyuge,
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
