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
  COEFICIENTES_IIVTNU_2025,
  REDUCCION_VIVIENDA_MAX_IS,
  desglosarCuotaBaseAhorro,
  PLUSVALIA_MUNICIPAL_META,
} from '@/data/fiscal';
import {
  calcularCuotaIntegraIS,
  evaluarReduccionVivienda,
  EDAD_MIN_COLATERAL_VIVIENDA_IS,
  type GrupoParentescoIS,
} from '@/lib/calculadoras/sucesiones';
import styles from './SimuladorHeredarVivienda.module.css';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Parentesco = 'conyuge' | 'hijo' | 'padre' | 'hermano' | 'sin_parentesco';

interface ResultadoISD {
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
 * pero en Cataluña NO, porque allí el cónyuge reduce 100.000 € y el hijo ≥21, 50.000 €.
 * Separar cónyuge de hijo arregla las dos cosas a la vez.
 */
/**
  * Las comunidades cuya bonificación al Grupo II es un porcentaje FIJO de al menos el 99 %,
  * leídas de `BONIFICACIONES_CCAA_IS`. La tarjeta educativa las listaba a mano y contaba una
  * versión que el motor de la misma página no calcula (hallazgo 465): metía a Castilla-La
  * Mancha, que no tiene porcentaje fijo sino un escalonado que cae al 80 % por encima de
  * 300.000 € de base —ahí la cuota no es «casi cero», son 8.416,51 €—, ponía a Cantabria y
  * Aragón como «99 %» cuando lo suyo es una exención por tramos, y dejaba fuera a Canarias,
  * que es la más generosa del régimen común. Derivada, la lista no puede volver a mentir.
  */
const CCAA_BONIFICACION_CASI_TOTAL = Object.values(BONIFICACIONES_CCAA_IS)
  .filter((c) => typeof c.bonificaciones['II']?.porcentaje === 'number' && (c.bonificaciones['II'].porcentaje as number) >= 0.99)
  .map((c) => c.nombre);

const PARENTESCOS: Array<{ id: Parentesco; label: string; grupo: string; reducKey: GrupoParentescoIS }> = [
  { id: 'conyuge', label: 'Cónyuge o pareja estable (Grupo II)', grupo: 'II', reducKey: 'I-conyuge' },
  { id: 'hijo', label: 'Hijo o descendiente ≥21 años (Grupo II)', grupo: 'II', reducKey: 'II' },
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
 * Como esa columna no es exactamente la acumulación de sus propios tipos —arrastra los
 * redondeos de la tabla oficial condensada—, las dos lecturas divergían por encima de
 * 31.956,87 € de base liquidable y dos apps fiscales de meskeIA daban cuotas distintas
 * para la misma herencia (hallazgo 277 del Inspector). Manda la tabla publicada.
 */

/** Edad mínima del colateral (Grupo III) para la reducción de vivienda habitual, art. 20.2.c LISD */
const EDAD_MIN_COLATERAL_VIVIENDA = EDAD_MIN_COLATERAL_VIVIENDA_IS;

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
  const bonifGrupo = ccaaInfo?.bonificaciones[reducKey];

  const baseImponible = valorReferencia;

  // Reducción por parentesco
  const reducciones = esCataluna ? REDUCCIONES_PARENTESCO_CATALUNA_IS : REDUCCIONES_PARENTESCO_IS;
  const reduccionParentesco = reducciones[reducKey] ?? 0;

  /**
   * Reducción por vivienda habitual (art. 20.2.c LISD, 95 % hasta 122.606,47 €).
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
  const reduccionVivienda = vivienda.reduccion;
  const viviendaNoAplicada = vivienda.noAplicada;

  /**
   * Reducción autonómica sobre la BASE. Asturias es la única CCAA del catálogo cuyo
   * beneficio está modelado así (300.000 € para Grupos I y II, 50.000 € para el III) en vez
   * de como bonificación en cuota, y era justo la que el motor no sabía leer: presentaba
   * Asturias como la comunidad más cara mientras `data/fiscal` decía que un hijo que hereda
   * 250.000 € de vivienda habitual no paga nada.
   */
  const reduccionAutonomica = bonifGrupo?.reduccionBase ?? 0;

  const baseLiquidable = Math.max(
    0,
    baseImponible - reduccionParentesco - reduccionVivienda - reduccionAutonomica
  );

  // Aplicar tarifa
  const tarifa = esCataluna ? TARIFA_CATALUNA_IS : TARIFA_ESTATAL_IS;
  const cuotaIntegra = calcularCuotaIntegraIS(baseLiquidable, tarifa);

  // Coeficiente por patrimonio preexistente, desde data/fiscal. Índice 0 = primer tramo
  // (patrimonio del heredero < 402.678,11 €), que es el supuesto que simula esta app.
  const tablaCoeficientes = esCataluna ? COEFICIENTES_CATALUNA_IS : COEFICIENTES_IS;
  const coeficiente = tablaCoeficientes[grupo]?.[0] ?? 1.0;
  const cuotaTributaria = cuotaIntegra * coeficiente;

  // Bonificación CCAA
  let bonificacionPorc = 0;
  if (bonifGrupo) {
    if (typeof bonifGrupo.porcentaje === 'number') {
      bonificacionPorc = bonifGrupo.porcentaje;
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

  const bonificacion = cuotaTributaria * bonificacionPorc;
  const cuotaFinal = Math.max(0, cuotaTributaria - bonificacion);

  return {
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
  // Coeficiente según años (max 20)
  const aniosClamp = Math.min(20, Math.max(0, aniosTenencia));
  const coefRow = COEFICIENTES_IIVTNU_2025.find(c => c.anios === aniosClamp);
  const coeficiente = coefRow?.coeficiente ?? 0.45;

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
  valorVenta: number
): ResultadoIRPF {
  // Valor adquisición fiscal: el valor declarado en ISD + impuestos pagados
  const valorAdquisicionFiscal = valorReferenciaISD + cuotaISD + cuotaIIVTNU;
  const ganancia = valorVenta - valorAdquisicionFiscal;

  if (ganancia <= 0) {
    return {
      valorAdquisicionFiscal,
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

  const irpf = useMemo(
    () =>
      aniosHastaVenta > 0
        ? calcularIRPFGanancia(valorReferencia, isd.cuotaFinal, plusvalia.cuotaFinal, valorVenta)
        : null,
    [aniosHastaVenta, valorReferencia, isd.cuotaFinal, plusvalia.cuotaFinal, valorVenta]
  );

  const totalImpuestos = isd.cuotaFinal + plusvalia.cuotaFinal + (irpf?.cuota ?? 0);
  const porcSobreVenta = valorVenta > 0 ? (totalImpuestos / valorVenta) * 100 : 0;

  // Aviso edad menor de 21 (informativo)
  const avisoEdad = edad < 21 && parentesco === 'hijo';

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

      <DataReference
        normativa="ISD + IIVTNU 2025"
        fuente={FISCAL_SUCESIONES_META.fuente}
        verificado={FISCAL_SUCESIONES_META.verificado}
        urlOficial={FISCAL_SUCESIONES_META.urlOficial}
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
            <input
              id="edadHer"
              type="range"
              min={18}
              max={90}
              step={1}
              value={edad}
              onChange={e => setEdad(Number(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.sliderRange}>
              <span>18</span>
              <span>90</span>
            </div>
            {avisoEdad && (
              <p className={styles.sliderHint} role="status" aria-live="polite">
                <span aria-hidden="true">⚠️</span> Heredero menor de 21 años: existen
                reducciones adicionales no incluidas aquí. Consulta con un asesor.
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
                <span className={styles.muted}>(reducción 95% ISD hasta 122.606 €)</span>
              </span>
            </label>
          </div>

          {/* El colateral (Grupo III) solo tiene derecho a la reducción si además es mayor
              de 65 años y convivió con el causante los dos años anteriores (art. 20.2.c LISD) */}
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
                    (requisito del colateral, junto con tener 65 años o más)
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

        {/* 3 paneles horizontales */}
        <div className={styles.tresPaneles}>
          {/* Panel 1: ISD */}
          <div className={styles.panelISD}>
            <h3 className={styles.panelHeaderTitle}>1. ISD al heredar</h3>
            <p className={styles.panelHeaderSub}>
              {isd.ccaaNombre} — Grupo {isd.grupo}
            </p>

            <div className={styles.panelLine}>
              <span>Base imponible (valor referencia)</span>
              <strong>{formatCurrency(isd.baseImponible)}</strong>
            </div>
            <div className={styles.panelLine}>
              <span>− Reducción parentesco</span>
              <strong>−{formatCurrency(isd.reduccionParentesco)}</strong>
            </div>
            {isd.reduccionVivienda > 0 && (
              <div className={styles.panelLine}>
                <span>− Reducción vivienda habitual (95%)</span>
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
          </div>

          {/* Panel 2: Plusvalía */}
          <div className={styles.panelPlusvalia}>
            <h3 className={styles.panelHeaderTitle}>2. Plusvalía municipal</h3>
            <p className={styles.panelHeaderSub}>
              IIVTNU — {plusvalia.aniosTenencia} años de tenencia
            </p>

            <div className={styles.panelLine}>
              <span>Valor catastral suelo</span>
              <strong>{formatCurrency(valorCatastralSuelo)}</strong>
            </div>
            <div className={styles.panelLine}>
              <span>Coeficiente {plusvalia.aniosTenencia} años</span>
              <strong>{formatNumber(plusvalia.coeficiente, 2)}</strong>
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
                  ? 'Exenta (sin ganancia)'
                  : formatCurrency(plusvalia.metodoReal)}
              </strong>
            </div>
            <div className={styles.panelLine}>
              <span>Método elegido</span>
              <strong>
                {plusvalia.metodoElegido === 'exenta'
                  ? 'Exenta'
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
                <div className={styles.panelLine}>
                  <span>{irpf.esPerdida ? 'Pérdida patrimonial' : 'Ganancia patrimonial'}</span>
                  <strong>
                    {irpf.esPerdida
                      ? `−${formatCurrency(Math.abs(irpf.ganancia))}`
                      : formatCurrency(irpf.ganancia)}
                  </strong>
                </div>
                {!irpf.esPerdida && (
                  <p className={styles.muted}>
                    Tramos: 19% / 21% / 23% / 27% / 30%
                  </p>
                )}
                <div className={styles.panelTotal}>
                  <span>Cuota IRPF venta</span>
                  <strong>{formatCurrency(irpf.cuota)}</strong>
                </div>
                <p className={styles.footnote}>
                  * Valor referencia ISD + cuota ISD + cuota plusvalía pagadas.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Bloque total */}
        <div className={styles.bloqueTotal}>
          <h2 className={styles.bloqueTitle}>Coste fiscal total acumulado</h2>
          <div className={styles.bloqueGrid}>
            <div className={styles.bloqueCard}>
              <span>ISD</span>
              <strong>{formatCurrency(isd.cuotaFinal)}</strong>
            </div>
            <div className={styles.bloqueCard}>
              <span>+ Plusvalía municipal</span>
              <strong>{formatCurrency(plusvalia.cuotaFinal)}</strong>
            </div>
            <div className={styles.bloqueCard}>
              <span>+ IRPF venta</span>
              <strong>{formatCurrency(irpf?.cuota ?? 0)}</strong>
            </div>
            <div className={styles.bloqueCardTotal}>
              <span>= TOTAL</span>
              <strong>{formatCurrency(totalImpuestos)}</strong>
            </div>
          </div>
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
                <td>Plazo 6 meses tras fallecimiento (prorrogable a 1 año)</td>
                <td>Sobre valor de referencia, con tarifa estatal o autonómica + bonificación CCAA</td>
                <td>Heredero (cada uno por su parte)</td>
              </tr>
              <tr>
                <td><strong>Plusvalía municipal (IIVTNU)</strong></td>
                <td>Plazo 6 meses tras fallecimiento</td>
                <td>Método objetivo (valor catastral suelo × coef.) o método real (ganancia real prorrateada al suelo). Se elige el menor.</td>
                <td>Heredero. Paga al Ayuntamiento.</td>
              </tr>
              <tr>
                <td><strong>IRPF</strong> (ganancia patrimonial)</td>
                <td>Año siguiente a la venta (campaña Renta)</td>
                <td>(Valor venta − valor adquisición fiscal) × tramos 19-30%. Valor adquisición fiscal incluye los impuestos pagados al heredar.</td>
                <td>El que vende (heredero, si vendes)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className={styles.tableNote}>
          La secuencia es siempre: ISD + plusvalía al heredar (mismo plazo de 6 meses), e IRPF
          solo si después decides vender. Si conservas la vivienda como tuya, no hay IRPF.
        </p>

        <h3>Casos típicos</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <h4>Hijo hereda piso vivienda habitual del padre</h4>
            <p>
              Reducción de parentesco ({formatCurrency(REDUCCIONES_PARENTESCO_IS['II'] ?? 0)}) + reducción
              vivienda habitual del 95% (hasta {formatCurrency(REDUCCION_VIVIENDA_MAX_IS)}). En las
              comunidades que bonifican la cuota al 99% o más ({CCAA_BONIFICACION_CASI_TOTAL.join(', ')})
              el ISD se queda en casi nada. Ojo con las que bonifican <strong>por tramos</strong>:
              Castilla-La Mancha empieza en el 100% pero baja al 80% por encima de 300.000 € de base
              liquidable, y Cantabria y Aragón funcionan con una exención hasta cierto importe, no con
              un porcentaje plano. Cambia la comunidad en el selector de arriba y el cálculo lo dice.
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
              Reducción de parentesco mucho menor (7.993 €) y coeficiente multiplicador 1,5882.
              La mayoría de CCAA NO bonifican al Grupo III. Resultado: tributación notable, a
              menudo decenas de miles de euros sobre 200-300k.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <h4>Heredero del Grupo IV (sin parentesco)</h4>
            <p>
              Coeficiente multiplicador 2,0 y sin reducciones. Casi ninguna CCAA bonifica.
              Heredar 200.000 € supone {formatCurrency(EJEMPLO_GRUPO_IV.cuotaFinal)} de ISD en
              régimen común, y más con un patrimonio previo alto (el coeficiente llega a 2,4).
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
              6 meses desde el fallecimiento. Se puede pedir prórroga de otros 6 meses dentro de los
              5 primeros meses. Si superas el plazo sin liquidar, hay recargos del 5% al 20% más
              intereses. Es clave: el reloj corre desde el fallecimiento, no desde que tú te enteras.
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
            <strong>¿La plusvalía municipal está exenta si hay pérdida?</strong>
            <p>
              Sí, desde el RDL 26/2021. Si demuestras que no ha habido incremento real del valor
              del terreno entre la fecha de adquisición original y la transmisión, no se devenga
              el impuesto. Hay que aportar prueba (escrituras de compra y herencia). El método
              real también permite elegir la base más baja entre el método objetivo y el real.
            </p>
          </div>
          <div className={styles.faqItem}>
            <strong>Si vendo en menos de 1 año, ¿hay diferencia en el IRPF?</strong>
            <p>
              No. En España, las ganancias patrimoniales de inmuebles tributan siempre en la
              base del ahorro (19-30%) sea cual sea el plazo de tenencia. En 2025 los tramos son:
              19% (hasta 6.000 €), 21% (hasta 50.000 €), 23% (hasta 200.000 €), 27% (hasta 300.000 €)
              y 30% (más de 300.000 €).
            </p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Cómo afecta que fuera la vivienda habitual del fallecido?</strong>
            <p>
              Hay reducción del 95% en la base imponible del ISD para cónyuge, descendientes,
              ascendientes o un colateral mayor de 65 años que conviviera con el fallecido los
              últimos 2 años. El tope estatal es 122.606,47 €/heredero (cada CCAA puede mejorarlo).
              Requisito: mantener la vivienda al menos 10 años (en algunas CCAA es menor). Si la
              vendes antes, pierdes la reducción retroactivamente.
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
              <strong>Liquidar ISD y plusvalía municipal (6 meses)</strong>
              <p>
                ISD: ante la Hacienda autonómica de la CCAA donde residía el fallecido. Plusvalía
                municipal: ante el Ayuntamiento donde está el inmueble. Si necesitas más tiempo,
                pide prórroga antes de los 5 meses.
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
                inherentes. Valor de transmisión = precio de venta − gastos asociados (notaría,
                gestoría, comisión inmobiliaria si la pagas).
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
              <p>El plazo de ISD es de 6 meses. Empieza con el inventario en cuanto tengas el certificado de últimas voluntades.</p>
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
              <p>Si era residencia habitual del fallecido y eres cónyuge/descendiente/ascendiente, la reducción del 95% (hasta 122.606 €) puede ser decisiva.</p>
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
            <li>Olvidar la plusvalía municipal: es un impuesto distinto del ISD que también vence a los 6 meses.</li>
            <li>Vender antes de los 10 años cuando se aplicó la reducción de vivienda habitual: pierdes la reducción retroactivamente.</li>
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
