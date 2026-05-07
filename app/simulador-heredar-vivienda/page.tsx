'use client';

import { useState, useMemo, useCallback } from 'react';
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
  REDUCCION_VIVIENDA_PORC_IS,
  REDUCCION_VIVIENDA_MAX_IS,
  BONIFICACIONES_CCAA_IS,
  COEFICIENTES_IIVTNU_2025,
  TRAMOS_GANANCIAS_PATRIMONIALES_2025,
  PLUSVALIA_MUNICIPAL_META,
} from '@/data/fiscal';
import styles from './SimuladorHeredarVivienda.module.css';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Parentesco = 'conyuge_hijo' | 'padre' | 'hermano' | 'sobrino' | 'sin_parentesco';

interface ResultadoISD {
  baseImponible: number;
  reduccionParentesco: number;
  reduccionVivienda: number;
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

const PARENTESCOS: Array<{ id: Parentesco; label: string; grupo: string; reducKey: string }> = [
  { id: 'conyuge_hijo', label: 'Cónyuge / Hijo / Descendiente ≥21', grupo: 'II', reducKey: 'I-conyuge' },
  { id: 'padre', label: 'Padre / Ascendiente', grupo: 'II', reducKey: 'II-ascendiente' },
  { id: 'hermano', label: 'Hermano / Tío / Sobrino', grupo: 'III', reducKey: 'III' },
  { id: 'sobrino', label: 'Pariente lejano (Grupo III)', grupo: 'III', reducKey: 'III' },
  { id: 'sin_parentesco', label: 'Sin parentesco (Grupo IV)', grupo: 'IV', reducKey: 'IV' },
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
  viviendaHabitual: boolean;
  aniosHastaVenta: number;
  valorVenta: number;
}

const CASOS: CasoPreconfigurado[] = [
  {
    id: 'madrid-hijo',
    nombre: 'Hijo hereda piso 200k en Madrid',
    descripcion: 'Vivienda habitual del padre, Madrid bonifica 99%',
    parentesco: 'conyuge_hijo',
    edad: 45,
    ccaa: 'madrid',
    anioAdquisicion: 1995,
    valorAdquisicion: 80000,
    valorReferencia: 200000,
    valorCatastralSuelo: 60000,
    viviendaHabitual: true,
    aniosHastaVenta: 5,
    valorVenta: 250000,
  },
  {
    id: 'cataluna-conyuge',
    nombre: 'Cónyuge hereda piso 350k en Cataluña',
    descripcion: 'Tarifa propia Cataluña, reducción cónyuge 100k',
    parentesco: 'conyuge_hijo',
    edad: 60,
    ccaa: 'cataluna',
    anioAdquisicion: 2000,
    valorAdquisicion: 150000,
    valorReferencia: 350000,
    valorCatastralSuelo: 100000,
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
    viviendaHabitual: false,
    aniosHastaVenta: 2,
    valorVenta: 180000,
  },
  {
    id: 'andalucia-sobrino',
    nombre: 'Sobrino hereda piso 250k en Andalucía',
    descripcion: 'Grupo III sin bonificación autonómica',
    parentesco: 'sobrino',
    edad: 40,
    ccaa: 'andalucia',
    anioAdquisicion: 2005,
    valorAdquisicion: 120000,
    valorReferencia: 250000,
    valorCatastralSuelo: 75000,
    viviendaHabitual: false,
    aniosHastaVenta: 1,
    valorVenta: 280000,
  },
];

// ─── Lógica de cálculo ────────────────────────────────────────────────────────

const TIPO_MUNICIPAL_PLUSVALIA = 0.30; // tipo medio orientativo (30%)
const ANIO_ACTUAL = 2025;

function aplicarTarifa(
  base: number,
  tarifa: typeof TARIFA_ESTATAL_IS
): number {
  let cuota = 0;
  let restante = base;
  let limiteAnterior = 0;

  for (const tramo of tarifa) {
    if (restante <= 0) break;
    const limite = tramo.hasta === Infinity ? base + 1 : tramo.hasta;
    const ancho = limite - limiteAnterior;
    const aplicado = Math.min(restante, ancho);
    cuota += aplicado * (tramo.tipo / 100);
    restante -= aplicado;
    limiteAnterior = limite;
  }

  return cuota;
}

function calcularISD(
  valorReferencia: number,
  parentesco: Parentesco,
  ccaa: string,
  viviendaHabitual: boolean
): ResultadoISD {
  const parentescoData = PARENTESCOS.find(p => p.id === parentesco) ?? PARENTESCOS[0];
  const grupo = parentescoData.grupo;
  const reducKey = parentescoData.reducKey;

  const ccaaInfo = BONIFICACIONES_CCAA_IS[ccaa];
  const ccaaNombre = ccaaInfo?.nombre ?? 'Régimen común';
  const esCataluna = ccaa === 'cataluna';

  const baseImponible = valorReferencia;

  // Reducción por parentesco
  const reducciones = esCataluna ? REDUCCIONES_PARENTESCO_CATALUNA_IS : REDUCCIONES_PARENTESCO_IS;
  const reduccionParentesco = reducciones[reducKey] ?? 0;

  // Reducción vivienda habitual (95% hasta 122.606,47€) — solo Grupos I, II y III conviviente
  let reduccionVivienda = 0;
  if (viviendaHabitual && grupo !== 'IV') {
    reduccionVivienda = Math.min(
      valorReferencia * REDUCCION_VIVIENDA_PORC_IS,
      REDUCCION_VIVIENDA_MAX_IS
    );
  }

  const baseLiquidable = Math.max(0, baseImponible - reduccionParentesco - reduccionVivienda);

  // Aplicar tarifa
  const tarifa = esCataluna ? TARIFA_CATALUNA_IS : TARIFA_ESTATAL_IS;
  const cuotaIntegra = aplicarTarifa(baseLiquidable, tarifa);

  // Coeficiente patrimonio preexistente (asumimos primer tramo: patrimonio < 402.678€)
  const coeficientesGrupo: Record<string, number> = {
    'I': 1.0,
    'II': 1.0,
    'III': 1.5882,
    'IV': 2.0,
  };
  const coeficiente = coeficientesGrupo[grupo] ?? 1.0;
  const cuotaTributaria = cuotaIntegra * coeficiente;

  // Bonificación CCAA
  let bonificacionPorc = 0;
  if (ccaaInfo) {
    const bonifGrupo = ccaaInfo.bonificaciones[reducKey];
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
      // Aragón: limite — si supera el limite no aplica
      if (bonifGrupo.limite && baseLiquidable > bonifGrupo.limite) {
        bonificacionPorc = 0;
      }
      // Andalucia/Galicia/Cantabria: exencion total bajo umbral
      if (bonifGrupo.exencion && baseLiquidable < bonifGrupo.exencion) {
        bonificacionPorc = 1.0;
      }
    }
  }

  const bonificacion = cuotaTributaria * bonificacionPorc;
  const cuotaFinal = Math.max(0, cuotaTributaria - bonificacion);

  return {
    baseImponible,
    reduccionParentesco,
    reduccionVivienda,
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

function calcularPlusvaliaMunicipal(
  valorCatastralSuelo: number,
  valorAdquisicionOriginal: number,
  valorReferenciaActual: number,
  aniosTenencia: number
): ResultadoPlusvalia {
  // Coeficiente según años (max 20)
  const aniosClamp = Math.min(20, Math.max(0, aniosTenencia));
  const coefRow = COEFICIENTES_IIVTNU_2025.find(c => c.anios === aniosClamp);
  const coeficiente = coefRow?.coeficiente ?? 0.45;

  // Método objetivo: valor catastral del suelo × coef × tipo municipal
  const baseObjetiva = valorCatastralSuelo * coeficiente;
  const metodoObjetivo = baseObjetiva * TIPO_MUNICIPAL_PLUSVALIA;

  // Método real: ganancia real prorrateada al suelo
  const gananciaTotal = valorReferenciaActual - valorAdquisicionOriginal;
  // Proporción del suelo sobre el total (asumimos suelo / valor referencia)
  const proporcionSuelo = valorReferenciaActual > 0
    ? valorCatastralSuelo / valorReferenciaActual
    : 0;
  const gananciaSuelo = Math.max(0, gananciaTotal * proporcionSuelo);
  const metodoReal = gananciaSuelo * TIPO_MUNICIPAL_PLUSVALIA;

  // Si no hay ganancia real → exento (RDL 26/2021)
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

  // Aplicar tramos ganancias patrimoniales
  let cuota = 0;
  let restante = ganancia;
  let limiteAnterior = 0;
  const desglose: ResultadoIRPF['desglose'] = [];

  for (const tramo of TRAMOS_GANANCIAS_PATRIMONIALES_2025) {
    if (restante <= 0) break;
    const limite = tramo.hasta === Infinity ? ganancia + 1 : tramo.hasta;
    const ancho = limite - limiteAnterior;
    const aplicado = Math.min(restante, ancho);
    const cuotaTramo = aplicado * (tramo.tipo / 100);
    cuota += cuotaTramo;
    desglose.push({
      desde: limiteAnterior,
      hasta: limite,
      tipo: tramo.tipo,
      aplicado,
      cuota: cuotaTramo,
    });
    restante -= aplicado;
    limiteAnterior = limite;
  }

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
  const [parentesco, setParentesco] = useState<Parentesco>('conyuge_hijo');
  const [edad, setEdad] = useState<number>(45);
  const [ccaa, setCcaa] = useState<string>('madrid');
  const [anioAdquisicion, setAnioAdquisicion] = useState<number>(1995);
  const [valorAdquisicion, setValorAdquisicion] = useState<number>(80000);
  const [valorReferencia, setValorReferencia] = useState<number>(200000);
  const [valorCatastralSuelo, setValorCatastralSuelo] = useState<number>(60000);
  const [viviendaHabitual, setViviendaHabitual] = useState<boolean>(true);
  const [aniosHastaVenta, setAniosHastaVenta] = useState<number>(5);
  const [valorVenta, setValorVenta] = useState<number>(250000);

  const aplicarCaso = useCallback((caso: CasoPreconfigurado) => {
    setParentesco(caso.parentesco);
    setEdad(caso.edad);
    setCcaa(caso.ccaa);
    setAnioAdquisicion(caso.anioAdquisicion);
    setValorAdquisicion(caso.valorAdquisicion);
    setValorReferencia(caso.valorReferencia);
    setValorCatastralSuelo(caso.valorCatastralSuelo);
    setViviendaHabitual(caso.viviendaHabitual);
    setAniosHastaVenta(caso.aniosHastaVenta);
    setValorVenta(caso.valorVenta);
  }, []);

  // Cálculos
  const aniosTenenciaCausante = ANIO_ACTUAL - anioAdquisicion;

  const isd = useMemo(
    () => calcularISD(valorReferencia, parentesco, ccaa, viviendaHabitual),
    [valorReferencia, parentesco, ccaa, viviendaHabitual]
  );

  const plusvalia = useMemo(
    () =>
      calcularPlusvaliaMunicipal(
        valorCatastralSuelo,
        valorAdquisicion,
        valorReferencia,
        aniosTenenciaCausante
      ),
    [valorCatastralSuelo, valorAdquisicion, valorReferencia, aniosTenenciaCausante]
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
  const avisoEdad = edad < 21 && parentesco === 'conyuge_hijo';

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
              max={2025}
              step={1}
              value={anioAdquisicion}
              onChange={e => setAnioAdquisicion(Number(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.sliderRange}>
              <span>1985</span>
              <span>2025</span>
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
                ⚠️ Heredero menor de 21 años: existen reducciones adicionales no incluidas
                aquí. Consulta con un asesor.
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
              Valor de referencia catastral 2025:{' '}
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

          <div className={styles.toggleGroup}>
            <label className={styles.toggleLabel}>
              <input
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
              Reducción de parentesco (15.957 €) + reducción vivienda habitual 95% (hasta
              122.606 €). En CCAA con bonificación 99% (Madrid, Andalucía, Galicia, Murcia,
              Valencia, Extremadura, Castilla y León, Castilla-La Mancha, Cantabria, Aragón…)
              el ISD se reduce a casi cero. Solo queda la plusvalía municipal y, si vende,
              el IRPF.
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
              Heredar 200.000 € puede suponer 80-100.000 € de ISD. Conviene valorar si compensa
              renunciar a la herencia (la herencia es siempre voluntaria).
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
