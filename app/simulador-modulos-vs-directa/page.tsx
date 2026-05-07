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
  TRAMOS_IRPF_2025,
  FISCAL_AUTONOMOS_META,
} from '@/data/fiscal';
import styles from './SimuladorModulosVsDirecta.module.css';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Actividad = 'bar' | 'comercio_menor' | 'transporte' | 'peluqueria' | 'taxi';

interface ActividadInfo {
  id: Actividad;
  nombre: string;
  descripcion: string;
  // Variables relevantes a mostrar
  usaMesas: boolean;
  usaSuperficie: boolean;
  usaKwh: boolean;
  usaVehiculo: boolean;
  usaPersonalAsalariado: boolean;
  usaPersonalNoAsalariado: boolean;
}

const ACTIVIDADES: ActividadInfo[] = [
  {
    id: 'bar',
    nombre: 'Bar / Cafetería',
    descripcion: 'Hostelería con servicio de mesa',
    usaMesas: true,
    usaSuperficie: true,
    usaKwh: true,
    usaVehiculo: false,
    usaPersonalAsalariado: true,
    usaPersonalNoAsalariado: true,
  },
  {
    id: 'comercio_menor',
    nombre: 'Comercio menor',
    descripcion: 'Tiendas pequeñas, menudeo',
    usaMesas: false,
    usaSuperficie: true,
    usaKwh: false,
    usaVehiculo: false,
    usaPersonalAsalariado: true,
    usaPersonalNoAsalariado: true,
  },
  {
    id: 'transporte',
    nombre: 'Transporte de mercancías',
    descripcion: 'Transportistas autónomos',
    usaMesas: false,
    usaSuperficie: false,
    usaKwh: false,
    usaVehiculo: true,
    usaPersonalAsalariado: false,
    usaPersonalNoAsalariado: false,
  },
  {
    id: 'peluqueria',
    nombre: 'Peluquería',
    descripcion: 'Servicios de peluquería',
    usaMesas: false,
    usaSuperficie: true,
    usaKwh: false,
    usaVehiculo: false,
    usaPersonalAsalariado: true,
    usaPersonalNoAsalariado: true,
  },
  {
    id: 'taxi',
    nombre: 'Taxi (autotaxi)',
    descripcion: 'Servicio de taxi urbano',
    usaMesas: false,
    usaSuperficie: false,
    usaKwh: false,
    usaVehiculo: true,
    usaPersonalAsalariado: false,
    usaPersonalNoAsalariado: false,
  },
];

interface DatosComunes {
  ingresos: number;
  gastos: number;
  retaMensual: number;
}

interface DatosModulos {
  actividad: Actividad;
  personalAsalariado: number;
  personalNoAsalariado: number;
  superficie: number;
  kwh: number;
  mesas: number;
  vehiculo: number; // 1 = un vehículo, 0 = ninguno
}

interface CasoPreconfig {
  id: string;
  etiqueta: string;
  descripcion: string;
  comunes: DatosComunes;
  modulos: DatosModulos;
}

const CASOS: CasoPreconfig[] = [
  {
    id: 'bar_rentable',
    etiqueta: 'Bar pequeño rentable',
    descripcion: 'Margen alto: módulos suelen ganar',
    comunes: { ingresos: 90000, gastos: 25000, retaMensual: 320 },
    modulos: {
      actividad: 'bar',
      personalAsalariado: 1,
      personalNoAsalariado: 1,
      superficie: 60,
      kwh: 12000,
      mesas: 8,
      vehiculo: 0,
    },
  },
  {
    id: 'bar_perdidas',
    etiqueta: 'Bar con pérdidas',
    descripcion: 'Mucho gasto: ED gana porque pagas menos',
    comunes: { ingresos: 60000, gastos: 55000, retaMensual: 320 },
    modulos: {
      actividad: 'bar',
      personalAsalariado: 1,
      personalNoAsalariado: 1,
      superficie: 60,
      kwh: 12000,
      mesas: 8,
      vehiculo: 0,
    },
  },
  {
    id: 'comercio_medio',
    etiqueta: 'Comercio mediano',
    descripcion: 'Depende del margen real',
    comunes: { ingresos: 70000, gastos: 35000, retaMensual: 300 },
    modulos: {
      actividad: 'comercio_menor',
      personalAsalariado: 1,
      personalNoAsalariado: 1,
      superficie: 80,
      kwh: 0,
      mesas: 0,
      vehiculo: 0,
    },
  },
  {
    id: 'profesional_puro',
    etiqueta: 'Profesional puro',
    descripcion: 'NO puede acogerse a módulos — solo ED',
    comunes: { ingresos: 50000, gastos: 8000, retaMensual: 300 },
    modulos: {
      actividad: 'comercio_menor',
      personalAsalariado: 0,
      personalNoAsalariado: 1,
      superficie: 0,
      kwh: 0,
      mesas: 0,
      vehiculo: 0,
    },
  },
];

// ─── Cálculos ────────────────────────────────────────────────────────────────

function calcularIRPF(baseLiquidable: number): number {
  let cuota = 0;
  let resto = Math.max(0, baseLiquidable);
  let limAnt = 0;
  for (const t of TRAMOS_IRPF_2025) {
    const limSup = t.hasta === Infinity ? Infinity : t.hasta;
    const ancho = limSup - limAnt;
    const aplicada = Math.min(resto, ancho);
    if (aplicada > 0) cuota += aplicada * (t.tipo / 100);
    resto -= aplicada;
    limAnt = limSup;
    if (resto <= 0) break;
  }
  return cuota;
}

// Mínimo personal orientativo (sin familia)
const MINIMO_PERSONAL_ORIENTATIVO = 5550;

interface ResultadoED {
  ingresos: number;
  gastos: number;
  rendimientoNetoPrevio: number;
  reduccion5pc: number;
  rendimientoNetoReducido: number;
  minimosPersonales: number;
  baseLiquidable: number;
  irpf: number;
  cuotaReta: number;
  costeAnualTotal: number;
}

function calcularED(d: DatosComunes): ResultadoED {
  const rendimientoNetoPrevio = Math.max(0, d.ingresos - d.gastos);
  // Reducción 5% gastos difícil justificación, tope 2.000 €
  const reduccion5pc = Math.min(rendimientoNetoPrevio * 0.05, 2000);
  const rendimientoNetoReducido = Math.max(0, rendimientoNetoPrevio - reduccion5pc);
  const minimosPersonales = MINIMO_PERSONAL_ORIENTATIVO;
  const baseLiquidable = Math.max(0, rendimientoNetoReducido - minimosPersonales);
  const irpf = calcularIRPF(baseLiquidable);
  const cuotaReta = d.retaMensual * 12;
  const costeAnualTotal = irpf + cuotaReta;
  return {
    ingresos: d.ingresos,
    gastos: d.gastos,
    rendimientoNetoPrevio,
    reduccion5pc,
    rendimientoNetoReducido,
    minimosPersonales,
    baseLiquidable,
    irpf,
    cuotaReta,
    costeAnualTotal,
  };
}

// Fórmulas didácticas orientativas por actividad (NO son los módulos reales)
function calcularRendimientoModulos(m: DatosModulos): number {
  switch (m.actividad) {
    case 'bar':
      return (
        1500 * m.mesas +
        800 * m.personalAsalariado +
        6 * m.superficie +
        0.05 * m.kwh
      );
    case 'comercio_menor':
      return (
        4500 * m.personalNoAsalariado +
        1000 * m.personalAsalariado +
        8 * m.superficie
      );
    case 'transporte':
      return 12000 * m.vehiculo;
    case 'peluqueria':
      return (
        5500 * m.personalAsalariado +
        2000 * m.personalNoAsalariado +
        7 * m.superficie
      );
    case 'taxi':
      return 6800 * m.vehiculo;
  }
}

interface ResultadoModulos {
  rendimientoNetoPrevio: number;
  reduccion5pc: number;
  reduccionEmpleo: number;
  rendimientoNetoReducido: number;
  minimosPersonales: number;
  baseLiquidable: number;
  irpf: number;
  cuotaReta: number;
  costeAnualTotal: number;
  esApta: boolean;
}

function calcularModulos(d: DatosComunes, m: DatosModulos): ResultadoModulos {
  // Profesionales puros NO pueden acogerse — caso didáctico
  // Aquí asumimos que si no hay parámetros físicos relevantes, la actividad NO es apta
  const tieneParametros =
    m.mesas > 0 ||
    m.superficie > 0 ||
    m.vehiculo > 0 ||
    m.personalAsalariado > 0 ||
    (m.actividad !== 'transporte' && m.actividad !== 'taxi' && m.personalNoAsalariado > 0 && m.superficie > 0);

  const esApta = tieneParametros;

  const rendimientoNetoPrevio = calcularRendimientoModulos(m);
  // Reducción 5% (sí aplicable también)
  const reduccion5pc = Math.min(rendimientoNetoPrevio * 0.05, 2000);
  // Reducción incentivos al empleo (simplificado: 100 € por persona asalariada)
  const reduccionEmpleo = m.personalAsalariado * 100;
  const rendimientoNetoReducido = Math.max(0, rendimientoNetoPrevio - reduccion5pc - reduccionEmpleo);
  const minimosPersonales = MINIMO_PERSONAL_ORIENTATIVO;
  const baseLiquidable = Math.max(0, rendimientoNetoReducido - minimosPersonales);
  const irpf = calcularIRPF(baseLiquidable);
  const cuotaReta = d.retaMensual * 12;
  const costeAnualTotal = irpf + cuotaReta;

  return {
    rendimientoNetoPrevio,
    reduccion5pc,
    reduccionEmpleo,
    rendimientoNetoReducido,
    minimosPersonales,
    baseLiquidable,
    irpf,
    cuotaReta,
    costeAnualTotal,
    esApta,
  };
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function SimuladorModulosVsDirectaPage() {
  const [comunes, setComunes] = useState<DatosComunes>({
    ingresos: 70000,
    gastos: 25000,
    retaMensual: 320,
  });

  const [modulos, setModulos] = useState<DatosModulos>({
    actividad: 'bar',
    personalAsalariado: 1,
    personalNoAsalariado: 1,
    superficie: 50,
    kwh: 10000,
    mesas: 6,
    vehiculo: 0,
  });

  const actividadActual = useMemo(
    () => ACTIVIDADES.find(a => a.id === modulos.actividad) ?? ACTIVIDADES[0],
    [modulos.actividad]
  );

  const resED = useMemo(() => calcularED(comunes), [comunes]);
  const resModulos = useMemo(() => calcularModulos(comunes, modulos), [comunes, modulos]);

  const diferencia = resED.costeAnualTotal - resModulos.costeAnualTotal;
  const ganaED = resED.costeAnualTotal < resModulos.costeAnualTotal;

  const aplicarCaso = useCallback((caso: CasoPreconfig) => {
    setComunes(caso.comunes);
    setModulos(caso.modulos);
  }, []);

  const cambiarActividad = useCallback((id: Actividad) => {
    setModulos(prev => ({ ...prev, actividad: id }));
  }, []);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">⚖️</span>
        <h1 className={styles.title}>Simulador Módulos vs Estimación Directa</h1>
        <p className={styles.subtitle}>
          Qué régimen fiscal te conviene como autónomo en España (orientativo)
        </p>
      </header>

      <RegionBadge variant="es-only" />

      <DisclaimerCard variant="financial" severity="critical" />

      <DataReference
        normativa="Autónomos y Módulos 2025"
        fuente={FISCAL_AUTONOMOS_META.fuente}
        verificado={FISCAL_AUTONOMOS_META.verificado}
        urlOficial={FISCAL_AUTONOMOS_META.urlOficial}
      />

      <LegalNotice />

      <main className={styles.main}>
        {/* Casos preconfigurados */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Casos preconfigurados</h2>
          <div className={styles.casosGrid}>
            {CASOS.map(caso => (
              <button
                key={caso.id}
                className={styles.casoBtn}
                onClick={() => aplicarCaso(caso)}
                aria-label={`Aplicar caso ${caso.etiqueta}: ${caso.descripcion}`}
              >
                <strong>{caso.etiqueta}</strong>
                <span>{caso.descripcion}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Datos comunes */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Tus datos como autónomo</h2>

          <div className={styles.sliderGroup}>
            <label className={styles.sliderLabel} htmlFor="ingresos">
              Ingresos anuales brutos: <span className={styles.sliderValue}>{formatCurrency(comunes.ingresos)}</span>
            </label>
            <input
              id="ingresos"
              type="range"
              min={0}
              max={200000}
              step={1000}
              value={comunes.ingresos}
              onChange={e => setComunes({ ...comunes, ingresos: Number(e.target.value) })}
              className={styles.slider}
            />
            <div className={styles.sliderRange}>
              <span>0 €</span>
              <span>200.000 €</span>
            </div>
          </div>

          <div className={styles.sliderGroup}>
            <label className={styles.sliderLabel} htmlFor="gastos">
              Gastos deducibles anuales: <span className={styles.sliderValue}>{formatCurrency(comunes.gastos)}</span>
            </label>
            <input
              id="gastos"
              type="range"
              min={0}
              max={100000}
              step={500}
              value={comunes.gastos}
              onChange={e => setComunes({ ...comunes, gastos: Number(e.target.value) })}
              className={styles.slider}
            />
            <div className={styles.sliderRange}>
              <span>0 €</span>
              <span>100.000 €</span>
            </div>
            <p className={styles.sliderHint}>
              Solo deducibles para Estimación Directa Simplificada (alquiler local, suministros afectos, material…).
            </p>
          </div>

          <div className={styles.sliderGroup}>
            <label className={styles.sliderLabel} htmlFor="reta">
              Cuota RETA mensual: <span className={styles.sliderValue}>{formatCurrency(comunes.retaMensual)}</span>
            </label>
            <input
              id="reta"
              type="range"
              min={200}
              max={600}
              step={10}
              value={comunes.retaMensual}
              onChange={e => setComunes({ ...comunes, retaMensual: Number(e.target.value) })}
              className={styles.slider}
            />
            <div className={styles.sliderRange}>
              <span>200 €</span>
              <span>600 €</span>
            </div>
            <p className={styles.sliderHint}>
              Cuota mensual del RETA según tu base de cotización elegida.
            </p>
          </div>
        </div>

        {/* Selector de actividad para módulos */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Datos para Estimación Objetiva (Módulos)</h2>

          <p className={styles.avisoElegibilidad}>
            ⚠️ Solo determinadas actividades pueden acogerse a módulos: hostelería, comercio menor,
            transporte, peluquería, taxi y otras listadas en la <strong>Orden HFP/X/2024</strong>.
            Las profesiones liberales <strong>NO</strong> pueden tributar por módulos. Verifica con
            tu asesor fiscal si tu actividad es elegible.
          </p>

          <div className={styles.actividadSelector} role="radiogroup" aria-label="Actividad para módulos">
            {ACTIVIDADES.map(a => (
              <button
                key={a.id}
                role="radio"
                aria-checked={modulos.actividad === a.id}
                className={`${styles.actividadBtn} ${modulos.actividad === a.id ? styles.actividadActiva : ''}`}
                onClick={() => cambiarActividad(a.id)}
              >
                <strong>{a.nombre}</strong>
                <span>{a.descripcion}</span>
              </button>
            ))}
          </div>

          {actividadActual.usaPersonalAsalariado && (
            <div className={styles.sliderGroup}>
              <label className={styles.sliderLabel} htmlFor="pAsal">
                Personal asalariado: <span className={styles.sliderValue}>{modulos.personalAsalariado}</span>
              </label>
              <input
                id="pAsal"
                type="range"
                min={0}
                max={5}
                step={1}
                value={modulos.personalAsalariado}
                onChange={e => setModulos({ ...modulos, personalAsalariado: Number(e.target.value) })}
                className={styles.slider}
              />
              <div className={styles.sliderRange}>
                <span>0</span>
                <span>5</span>
              </div>
            </div>
          )}

          {actividadActual.usaPersonalNoAsalariado && (
            <div className={styles.sliderGroup}>
              <label className={styles.sliderLabel} htmlFor="pNoAsal">
                Personal no asalariado (incluido titular): <span className={styles.sliderValue}>{modulos.personalNoAsalariado}</span>
              </label>
              <input
                id="pNoAsal"
                type="range"
                min={0}
                max={3}
                step={1}
                value={modulos.personalNoAsalariado}
                onChange={e => setModulos({ ...modulos, personalNoAsalariado: Number(e.target.value) })}
                className={styles.slider}
              />
              <div className={styles.sliderRange}>
                <span>0</span>
                <span>3</span>
              </div>
            </div>
          )}

          {actividadActual.usaSuperficie && (
            <div className={styles.sliderGroup}>
              <label className={styles.sliderLabel} htmlFor="sup">
                Superficie del local: <span className={styles.sliderValue}>{formatNumber(modulos.superficie, 0)} m²</span>
              </label>
              <input
                id="sup"
                type="range"
                min={0}
                max={200}
                step={5}
                value={modulos.superficie}
                onChange={e => setModulos({ ...modulos, superficie: Number(e.target.value) })}
                className={styles.slider}
              />
              <div className={styles.sliderRange}>
                <span>0 m²</span>
                <span>200 m²</span>
              </div>
            </div>
          )}

          {actividadActual.usaKwh && (
            <div className={styles.sliderGroup}>
              <label className={styles.sliderLabel} htmlFor="kwh">
                Consumo eléctrico anual: <span className={styles.sliderValue}>{formatNumber(modulos.kwh, 0)} kWh</span>
              </label>
              <input
                id="kwh"
                type="range"
                min={0}
                max={50000}
                step={500}
                value={modulos.kwh}
                onChange={e => setModulos({ ...modulos, kwh: Number(e.target.value) })}
                className={styles.slider}
              />
              <div className={styles.sliderRange}>
                <span>0 kWh</span>
                <span>50.000 kWh</span>
              </div>
            </div>
          )}

          {actividadActual.usaMesas && (
            <div className={styles.sliderGroup}>
              <label className={styles.sliderLabel} htmlFor="mesas">
                Mesas: <span className={styles.sliderValue}>{modulos.mesas}</span>
              </label>
              <input
                id="mesas"
                type="range"
                min={0}
                max={30}
                step={1}
                value={modulos.mesas}
                onChange={e => setModulos({ ...modulos, mesas: Number(e.target.value) })}
                className={styles.slider}
              />
              <div className={styles.sliderRange}>
                <span>0</span>
                <span>30</span>
              </div>
            </div>
          )}

          {actividadActual.usaVehiculo && (
            <div className={styles.sliderGroup}>
              <label className={styles.sliderLabel} htmlFor="veh">
                Vehículo afecto: <span className={styles.sliderValue}>{modulos.vehiculo === 1 ? 'Sí (1)' : 'No (0)'}</span>
              </label>
              <input
                id="veh"
                type="range"
                min={0}
                max={1}
                step={1}
                value={modulos.vehiculo}
                onChange={e => setModulos({ ...modulos, vehiculo: Number(e.target.value) })}
                className={styles.slider}
              />
              <div className={styles.sliderRange}>
                <span>No</span>
                <span>Sí</span>
              </div>
            </div>
          )}

          <p className={styles.notaModulos}>
            <strong>Nota didáctica:</strong> Cálculo orientativo simplificado — los valores reales
            de los módulos por unidad se publican en la Orden HFP anual del Ministerio de Hacienda.
          </p>
        </div>

        {/* Comparativa lado a lado */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Comparativa: Estimación Directa vs Módulos</h2>

          <div className={styles.comparativaLayout}>
            {/* Columna ED */}
            <div className={`${styles.colED} ${ganaED ? styles.colGanadora : ''}`}>
              <h3 className={styles.colTitle}>Estimación Directa Simplificada</h3>
              <p className={styles.colSub}>Tributas por beneficio real (ingresos − gastos)</p>

              <div className={styles.lineaItem}>
                <span>Ingresos brutos</span>
                <strong>{formatCurrency(resED.ingresos)}</strong>
              </div>
              <div className={styles.lineaResta}>
                <span>− Gastos deducibles</span>
                <strong>−{formatCurrency(resED.gastos)}</strong>
              </div>
              <div className={styles.lineaSubtotal}>
                <span>= Rendimiento neto previo</span>
                <strong>{formatCurrency(resED.rendimientoNetoPrevio)}</strong>
              </div>
              <div className={styles.lineaResta}>
                <span>− Reducción 5% (máx. 2.000 €)</span>
                <strong>−{formatCurrency(resED.reduccion5pc)}</strong>
              </div>
              <div className={styles.lineaSubtotal}>
                <span>= Rendimiento neto reducido</span>
                <strong>{formatCurrency(resED.rendimientoNetoReducido)}</strong>
              </div>
              <div className={styles.lineaResta}>
                <span>− Mínimo personal (orientativo)</span>
                <strong>−{formatCurrency(resED.minimosPersonales)}</strong>
              </div>
              <div className={styles.lineaSubtotal}>
                <span>= Base liquidable</span>
                <strong>{formatCurrency(resED.baseLiquidable)}</strong>
              </div>
              <div className={styles.lineaItem}>
                <span>IRPF por tramos</span>
                <strong>{formatCurrency(resED.irpf)}</strong>
              </div>
              <div className={styles.lineaSuma}>
                <span>+ Cuota RETA × 12</span>
                <strong>+{formatCurrency(resED.cuotaReta)}</strong>
              </div>
              <div className={styles.lineaTotal}>
                <span>Coste fiscal anual total</span>
                <strong>{formatCurrency(resED.costeAnualTotal)}</strong>
              </div>
            </div>

            {/* Columna Módulos */}
            <div className={`${styles.colModulos} ${!ganaED ? styles.colGanadora : ''}`}>
              <h3 className={styles.colTitle}>Estimación Objetiva (Módulos)</h3>
              <p className={styles.colSub}>Tributas por unidades, NO por beneficio real</p>

              {!resModulos.esApta && (
                <p className={styles.avisoNoApta}>
                  ⚠️ Sin parámetros suficientes — esta actividad/configuración probablemente NO es
                  elegible para módulos.
                </p>
              )}

              <div className={styles.lineaItem}>
                <span>Rendimiento neto previo (módulos)</span>
                <strong>{formatCurrency(resModulos.rendimientoNetoPrevio)}</strong>
              </div>
              <div className={styles.lineaResta}>
                <span>− Reducción 5% (máx. 2.000 €)</span>
                <strong>−{formatCurrency(resModulos.reduccion5pc)}</strong>
              </div>
              <div className={styles.lineaResta}>
                <span>− Reducción incentivos al empleo</span>
                <strong>−{formatCurrency(resModulos.reduccionEmpleo)}</strong>
              </div>
              <div className={styles.lineaSubtotal}>
                <span>= Rendimiento neto reducido</span>
                <strong>{formatCurrency(resModulos.rendimientoNetoReducido)}</strong>
              </div>
              <div className={styles.lineaResta}>
                <span>− Mínimo personal (orientativo)</span>
                <strong>−{formatCurrency(resModulos.minimosPersonales)}</strong>
              </div>
              <div className={styles.lineaSubtotal}>
                <span>= Base liquidable</span>
                <strong>{formatCurrency(resModulos.baseLiquidable)}</strong>
              </div>
              <div className={styles.lineaItem}>
                <span>IRPF por tramos</span>
                <strong>{formatCurrency(resModulos.irpf)}</strong>
              </div>
              <div className={styles.lineaSuma}>
                <span>+ Cuota RETA × 12</span>
                <strong>+{formatCurrency(resModulos.cuotaReta)}</strong>
              </div>
              <div className={styles.lineaTotal}>
                <span>Coste fiscal anual total</span>
                <strong>{formatCurrency(resModulos.costeAnualTotal)}</strong>
              </div>
            </div>
          </div>

          {/* Diferencia + recomendación */}
          <div className={styles.diferenciaBox} role="status" aria-live="polite">
            <span className={styles.diferenciaTitulo}>
              Pagas <strong>{formatCurrency(Math.abs(diferencia))}</strong> {ganaED ? 'MÁS' : 'MENOS'} con módulos
              que con Estimación Directa
            </span>
            <span className={styles.diferenciaDetalle}>
              ED: {formatCurrency(resED.costeAnualTotal)} · Módulos: {formatCurrency(resModulos.costeAnualTotal)}
            </span>
          </div>

          <div className={styles.recomendacionBox}>
            <strong className={styles.recomendacionTitulo}>
              Para tu situación, te conviene más: {ganaED ? 'Estimación Directa Simplificada' : 'Estimación Objetiva (Módulos)'}
            </strong>
            <p className={styles.recomendacionTexto}>
              {ganaED
                ? 'Tu margen real (ingresos − gastos) es relativamente bajo, así que tributar por beneficio real (ED) sale más barato que por unidades (módulos).'
                : 'Tu margen real es alto, así que tributar por unidades (módulos) limita el rendimiento computable y reduce el IRPF respecto a tributar por beneficio real (ED).'}
            </p>
            <p className={styles.recomendacionAviso}>
              ⚠️ <strong>Importante:</strong> Módulos solo es elegible para tu actividad si está
              listada en la Orden HFP/X/2024. <strong>Verifica con tu asesor fiscal</strong> antes
              de cambiar de régimen.
            </p>
          </div>
        </div>
      </main>

      <EducationalSection
        title="Guía Módulos vs Estimación Directa"
        subtitle="Cómo elegir tu régimen fiscal autónomo"
      >
        <h3>Comparativa de regímenes</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Característica</th>
                <th>ED Simplificada</th>
                <th>Módulos</th>
                <th>Cuándo conviene</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Cómo se calcula</td>
                <td>Ingresos − gastos reales</td>
                <td>Por unidades (mesas, m², personal…)</td>
                <td>Depende del margen real</td>
              </tr>
              <tr>
                <td>Tributa por</td>
                <td>Beneficio real</td>
                <td>Importe fijo por parámetros</td>
                <td>Si beneficio real bajo: ED</td>
              </tr>
              <tr>
                <td>Pérdidas computables</td>
                <td>Sí (rendimiento puede ser 0)</td>
                <td>No (siempre tributas algo)</td>
                <td>Año malo: ED</td>
              </tr>
              <tr>
                <td>Contabilidad exigida</td>
                <td>Libros de ingresos, gastos, bienes</td>
                <td>Solo libro de ventas</td>
                <td>Menos burocracia: módulos</td>
              </tr>
              <tr>
                <td>Actividades elegibles</td>
                <td>Cualquiera</td>
                <td>Solo las de la Orden HFP anual</td>
                <td>Profesionales liberales: ED obligatoria</td>
              </tr>
              <tr>
                <td>IVA</td>
                <td>Régimen general</td>
                <td>Régimen simplificado (cuotas trimestrales fijas)</td>
                <td>Operativa simple: módulos</td>
              </tr>
              <tr>
                <td>Límite de ingresos</td>
                <td>Sin límite</td>
                <td>250.000 €/año (general) o 150.000 € en algunos casos</td>
                <td>Volumen alto: ED</td>
              </tr>
              <tr>
                <td>Renuncia</td>
                <td>—</td>
                <td>Voluntaria con efectos 3 años</td>
                <td>Ojo al lock-in si renuncias</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className={styles.tableNote}>
          Datos generales orientativos. Los límites concretos (incluida la prórroga del régimen
          de módulos) se actualizan anualmente en la Ley de Presupuestos y en la Orden HFP que
          regula los módulos del año siguiente.
        </p>

        <h3>Casos típicos</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <h4>Bar pequeño con margen alto</h4>
            <p>
              Ingresos 90.000 €, gastos 25.000 €. ED tributa sobre 65.000 € de rendimiento. Módulos
              tributa sobre el importe fijo por mesas + personal + m² (que suele ser bastante menor).
              <strong> Módulos suele ganar</strong> en hostelería rentable.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <h4>Bar con pérdidas o margen bajo</h4>
            <p>
              Ingresos 60.000 €, gastos 55.000 €. ED tributa sobre solo 5.000 € de beneficio real.
              Módulos sigue tributando por el importe fijo por unidades, ignorando que tu negocio va
              mal. <strong>ED gana en años malos</strong>.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <h4>Comercio menor estándar</h4>
            <p>
              Resultado intermedio: depende de la rotación, márgenes y plantilla. Calcula ambos
              escenarios cada año y compara antes de mantenerte en módulos o renunciar.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <h4>Profesional liberal (abogado, médico, consultor)</h4>
            <p>
              <strong>NO puede tributar por módulos.</strong> Las actividades profesionales
              recogidas en la Sección 2ª del IAE están excluidas. Régimen obligatorio: Estimación
              Directa (Simplificada o Normal según cifra de negocio).
            </p>
          </div>
        </div>

        <h3>Preguntas frecuentes</h3>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <strong>¿Qué actividades pueden acogerse a módulos?</strong>
            <p>
              Solo las recogidas en la <em>Orden HFP/X/2024</em> (anual): hostelería con servicio
              de mesa, comercio menor, transporte de mercancías, taxi, peluquerías, talleres
              mecánicos, actividades agrícolas y ganaderas, etc. Las profesiones liberales y la
              mayoría de servicios B2B están excluidas.
            </p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Cómo cambio de régimen?</strong>
            <p>
              Mediante la <em>declaración censal</em> (modelo 036/037) presentada antes del 31 de
              diciembre del año anterior al que se quiere cambiar. La renuncia a módulos tiene
              efectos durante <strong>3 años mínimo</strong> (no puedes volver hasta entonces).
            </p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Tributo el IVA igual en ambos regímenes?</strong>
            <p>
              No. En ED estás en régimen general de IVA (declaras IVA repercutido − IVA soportado).
              En módulos estás en <em>régimen simplificado de IVA</em>, con cuotas trimestrales
              fijas calculadas también por unidades. El régimen de IVA va atado al de IRPF.
            </p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Y si tengo pérdidas estando en módulos?</strong>
            <p>
              Sigues tributando lo mismo. Los módulos NO admiten pérdidas: aunque ganes 0 €,
              tributarás por el rendimiento estimado por las unidades. Por eso ED es más
              conveniente en años malos.
            </p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Qué pasa si supero los límites de módulos?</strong>
            <p>
              Si superas 250.000 € de ingresos anuales (o 150.000 € si más del 50% de tus clientes
              son empresarios y profesionales) o 150.000 € de gastos, quedas <strong>excluido
              automáticamente</strong> y pasas a Estimación Directa al año siguiente.
            </p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Hay obligaciones contables distintas?</strong>
            <p>
              Sí. ED Simplificada exige llevar libros de ingresos, gastos, bienes de inversión y
              provisiones. Módulos solo exige libro registro de ventas + facturas emitidas y
              recibidas. Módulos es claramente menos exigente en burocracia.
            </p>
          </div>
        </div>

        <h3>Cómo decidir paso a paso</h3>
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Comprueba si tu actividad está en la Orden HFP</strong>
              <p>
                Si tu epígrafe IAE no aparece, ni siquiera puedes plantearte módulos. Régimen
                obligatorio: Estimación Directa.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Estima ingresos y gastos reales del próximo año</strong>
              <p>
                Necesitas una previsión razonable basada en el histórico y proyecciones (apertura de
                personal, cambios de local, mayor inversión, etc.).
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Calcula el rendimiento por módulos</strong>
              <p>
                Según los parámetros oficiales de tu actividad (mesas, m², personal asalariado y no
                asalariado, kWh, vehículos…). Aplicas las reducciones (5%, incentivos al empleo,
                minoración por inversión).
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Compara IRPF total + cuota RETA en ambos escenarios</strong>
              <p>
                No olvides incluir la cuota mensual del RETA × 12. La diferencia entre ambos
                regímenes puede ser de varios miles de € al año.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Decide con tu asesor antes del 31 de diciembre</strong>
              <p>
                La renuncia o vuelta al régimen tiene plazo: presenta el modelo 036/037 antes del
                fin del año anterior. Recuerda que renunciar a módulos te ata 3 años mínimo a ED.
              </p>
            </div>
          </div>
        </div>

        <h3>Mejores prácticas</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📊</span>
            <div>
              <strong>Recalcula cada año</strong>
              <p>Tu margen real cambia. Lo que era óptimo hace 2 años puede no serlo hoy.</p>
            </div>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📅</span>
            <div>
              <strong>Decide antes del 31 de diciembre</strong>
              <p>El cambio se solicita en modelo 036/037 antes de fin de año.</p>
            </div>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔒</span>
            <div>
              <strong>Cuidado con el lock-in de 3 años</strong>
              <p>Renunciar a módulos te obliga a 3 años mínimo en ED. No es decisión rápida.</p>
            </div>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📑</span>
            <div>
              <strong>Guarda toda la documentación</strong>
              <p>En ED necesitas justificar cada gasto. En módulos, las facturas igualmente para IVA.</p>
            </div>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">⚖️</span>
            <div>
              <strong>Consulta siempre a un asesor</strong>
              <p>El cambio de régimen tiene implicaciones que un simulador no cubre (IVA, censal, retenciones).</p>
            </div>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔍</span>
            <div>
              <strong>Revisa la Orden HFP cada noviembre</strong>
              <p>El Ministerio publica los módulos del año siguiente en torno a noviembre/diciembre.</p>
            </div>
          </div>
        </div>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            Errores frecuentes a evitar
          </div>
          <ul className={styles.warningList}>
            <li>Asumir que módulos siempre es más barato — depende del margen real, no del régimen.</li>
            <li>No comprobar si tu actividad IAE está en la Orden HFP antes de elegir módulos.</li>
            <li>Renunciar a módulos sin saber que el lock-in son 3 años en ED.</li>
            <li>Olvidar que en módulos tributas igual aunque tengas pérdidas reales.</li>
            <li>Confundir el régimen de IRPF con el de IVA — van atados, no son independientes.</li>
            <li>No actualizar el cálculo cada año al publicarse la Orden HFP de módulos.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-modulos-vs-directa')} />
      <ShareCard appName="simulador-modulos-vs-directa" />
      <Footer appName="simulador-modulos-vs-directa" />
    </div>
  );
}
