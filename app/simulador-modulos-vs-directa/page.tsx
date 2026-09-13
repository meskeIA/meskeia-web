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
  FISCAL_IRPF_META,
  LIMITES_EXCLUSION_MODULOS_2025,
  FISCAL_MODULOS_IRPF_META,
  ORDEN_MODULOS_VIGENTE,
  GASTOS_DIFICIL_JUSTIFICACION_EDS,
  TRAMOS_RETA_2025,
} from '@/data/fiscal';
import { compararModulosVsDirecta } from '@/lib/calculadoras/modulosVsDirecta';
import { calcularCuotaAutonomo } from '@/lib/calculadoras/cuotaAutonomo';
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

// La fórmula NO vive aquí: la página consume lib/calculadoras/modulosVsDirecta.ts, que es
// el mismo motor que sirve a la tool comparar_modulos_vs_directa del MCP de Delegum.
//
// ⚠️ 13/09/2026 — hasta hoy esta página mantenía su propia copia inline del mismo cálculo,
// y las dos divergieron (hallazgos 808 y 809 del Inspector): la reparación del 31/08 (no
// recomendar módulos a quien no es apto) y la del 02/09 (límites de exclusión por volumen)
// se aplicaron solo a esta copia, así que por el MCP se seguía recomendando el régimen que
// la misma respuesta acababa de declarar inaccesible.

// Rango real de cuota RETA mensual (tabla de tramos por rendimiento neto).
const RETA_CUOTA_MIN = Math.min(...TRAMOS_RETA_2025.map(t => t.cuotaMinima));
const RETA_CUOTA_MAX = Math.max(...TRAMOS_RETA_2025.map(t => t.cuotaMaxima));

// Extremos del deslizador, redondeados HACIA DENTRO del rango de la tabla.
// ⚠️ Hasta el 13/09/2026 se redondeaban hacia fuera (Math.floor del mínimo y Math.ceil del
// máximo a la decena), así que el suelo alcanzable era 200 € — por debajo de la cuota
// mínima más baja de la tabla, que es exactamente lo que el rótulo dice que no puede pasar
// (hallazgo 814).
const RETA_SLIDER_MIN = Math.ceil(RETA_CUOTA_MIN);
const RETA_SLIDER_MAX = Math.floor(RETA_CUOTA_MAX);

interface CoherenciaReta {
  /** Tramo de TRAMOS_RETA_2025 al que lleva el rendimiento calculado. */
  tramo: number;
  /** Cuota mensual mínima de ese tramo, en €. */
  cuotaMinimaTramo: number;
  /** Rendimiento neto mensual con el que se ha buscado el tramo, en €. */
  rendimientoMensual: number;
  /** Cuánto queda por debajo del mínimo el coste anual publicado, en €. */
  deficitAnual: number;
}

/**
 * Contrasta la cuota RETA introducida con el tramo que le toca por rendimiento neto.
 *
 * El rendimiento neto del art. 308.1 LGSS —el que encabeza TRAMOS_RETA_2025— es
 * «ingresos − gastos deducibles − cuota SS», así que la cuota que el usuario teclea
 * determina el tramo al que él mismo pertenece. Por debajo de la cuota mínima de ese tramo,
 * el «coste fiscal anual total» que la app publica queda por debajo del mínimo legalmente
 * posible (hallazgo 812): con el estado de fábrica, 1.904,16 €/año por debajo.
 *
 * Se AVISA, no se corrige: la app no sabe si hay tarifa plana, pluriactividad, base
 * elegida por encima de la mínima o un alta a mitad de año.
 *
 * @returns null cuando la cuota es coherente con el tramo (o no hay rendimiento positivo).
 */
function contrastarCuotaReta(d: DatosComunes): CoherenciaReta | null {
  const rendimientoMensual = (Math.max(0, d.ingresos - d.gastos) - d.retaMensual * 12) / 12;
  if (rendimientoMensual <= 0) return null;
  const { tramo, cuotaEfectiva } = calcularCuotaAutonomo({ rendimientoNetoMensual: rendimientoMensual });
  if (d.retaMensual >= cuotaEfectiva) return null;
  return {
    tramo,
    cuotaMinimaTramo: cuotaEfectiva,
    rendimientoMensual,
    deficitAnual: (cuotaEfectiva - d.retaMensual) * 12,
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

  const comparativa = useMemo(
    () => compararModulosVsDirecta({ ...comunes, ...modulos }),
    [comunes, modulos]
  );
  const resED = comparativa.estimacionDirecta;
  const resModulos = comparativa.modulos;
  const diferencia = comparativa.diferencia;
  // El motor ya devuelve ganaED = true cuando módulos no es apta: ahí no hay comparación
  // de importes que valga.
  const ganaED = comparativa.ganaED;

  // Coherencia de la cuota RETA tecleada con el tramo que le toca por rendimiento.
  const coherenciaReta = useMemo(() => contrastarCuotaReta(comunes), [comunes]);

  const aplicarCaso = useCallback((caso: CasoPreconfig) => {
    setComunes(caso.comunes);
    setModulos(caso.modulos);
  }, []);

  const cambiarActividad = useCallback((id: Actividad) => {
    const info = ACTIVIDADES.find(a => a.id === id) ?? ACTIVIDADES[0];
    setModulos(prev => ({
      actividad: id,
      // Los campos que la nueva actividad no muestra se reinician: si no, conservan el
      // valor de la actividad anterior y falsean tanto la elegibilidad como las reducciones.
      personalAsalariado: info.usaPersonalAsalariado ? prev.personalAsalariado : 0,
      personalNoAsalariado: info.usaPersonalNoAsalariado ? prev.personalNoAsalariado : 0,
      superficie: info.usaSuperficie ? prev.superficie : 0,
      kwh: info.usaKwh ? prev.kwh : 0,
      mesas: info.usaMesas ? prev.mesas : 0,
      vehiculo: info.usaVehiculo ? prev.vehiculo : 0,
    }));
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
        normativa="IRPF 2025"
        fuente={FISCAL_IRPF_META.fuente}
        verificado={FISCAL_IRPF_META.verificado}
        urlOficial={FISCAL_IRPF_META.urlOficial}
        nota="El IRPF de ambos regímenes usa esta escala. La cuota RETA la introduces tú libremente dentro del rango real de la tabla de tramos (TRAMOS_RETA_2025) y el rendimiento de módulos usa una fórmula didáctica simplificada, no los coeficientes reales de la Orden HFP."
      />

      <DataReference
        normativa="Límites de exclusión de módulos"
        fuente={FISCAL_MODULOS_IRPF_META.fuente}
        verificado={FISCAL_MODULOS_IRPF_META.verificado}
        urlOficial={FISCAL_MODULOS_IRPF_META.urlOficial}
        nota="El simulador excluye la actividad de módulos si tus ingresos o gastos introducidos superan estos límites. El de facturación a empresas (125.000 €) es solo informativo: no hay campo para ese dato."
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
                type="button"
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
              max={300000}
              step={1000}
              value={comunes.ingresos}
              onChange={e => setComunes({ ...comunes, ingresos: Number(e.target.value) })}
              className={styles.slider}
            />
            <div className={styles.sliderRange}>
              <span>0 €</span>
              <span>300.000 €</span>
            </div>
            <p className={styles.sliderHint}>
              Por encima de {formatCurrency(LIMITES_EXCLUSION_MODULOS_2025.ingresosConjuntoActividades)} quedas excluido de módulos.
            </p>
          </div>

          <div className={styles.sliderGroup}>
            <label className={styles.sliderLabel} htmlFor="gastos">
              Gastos deducibles anuales: <span className={styles.sliderValue}>{formatCurrency(comunes.gastos)}</span>
            </label>
            <input
              id="gastos"
              type="range"
              min={0}
              max={300000}
              step={500}
              value={comunes.gastos}
              onChange={e => setComunes({ ...comunes, gastos: Number(e.target.value) })}
              className={styles.slider}
            />
            <div className={styles.sliderRange}>
              <span>0 €</span>
              <span>300.000 €</span>
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
              min={RETA_SLIDER_MIN}
              max={RETA_SLIDER_MAX}
              step={1}
              value={comunes.retaMensual}
              onChange={e => setComunes({ ...comunes, retaMensual: Number(e.target.value) })}
              className={styles.slider}
            />
            <div className={styles.sliderRange}>
              <span>{formatCurrency(RETA_SLIDER_MIN)}</span>
              <span>{formatCurrency(RETA_SLIDER_MAX)}</span>
            </div>
            <p className={styles.sliderHint}>
              Cuota mensual del RETA según tu base de cotización elegida. El recorrido del
              deslizador ({formatCurrency(RETA_SLIDER_MIN)} a {formatCurrency(RETA_SLIDER_MAX)})
              se queda DENTRO del rango real de la tabla de tramos por rendimiento neto
              ({formatCurrency(RETA_CUOTA_MIN)} a {formatCurrency(RETA_CUOTA_MAX)}) — introduce
              tu cuota exacta si ya la conoces.
            </p>
            {coherenciaReta && (
              <p className={styles.avisoReta} aria-live="polite">
                <span aria-hidden="true">⚠️</span> Con {formatCurrency(comunes.ingresos)} de
                ingresos y {formatCurrency(comunes.gastos)} de gastos, tu rendimiento neto sale a{' '}
                {formatCurrency(coherenciaReta.rendimientoMensual)}/mes, que es el tramo{' '}
                {coherenciaReta.tramo} de la tabla del RETA: la cuota mínima de ese tramo es{' '}
                <strong>{formatCurrency(coherenciaReta.cuotaMinimaTramo)}/mes</strong>. Con{' '}
                {formatCurrency(comunes.retaMensual)} el coste anual que ves más abajo queda{' '}
                {formatCurrency(coherenciaReta.deficitAnual)} por debajo del mínimo posible, salvo
                que tengas tarifa plana, pluriactividad o un alta a mitad de año.
              </p>
            )}
          </div>
        </div>

        {/* Selector de actividad para módulos */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Datos para Estimación Objetiva (Módulos)</h2>

          <p className={styles.avisoElegibilidad}>
            <span aria-hidden="true">⚠️</span> Solo determinadas actividades pueden acogerse a módulos: hostelería, comercio menor,
            transporte, peluquería, taxi y otras listadas en la{' '}
            <strong>{ORDEN_MODULOS_VIGENTE.referencia}</strong> ({ORDEN_MODULOS_VIGENTE.boe}),
            que desarrolla el método para {ORDEN_MODULOS_VIGENTE.ejercicio}.
            Las profesiones liberales <strong>NO</strong> pueden tributar por módulos. Verifica con
            tu asesor fiscal si tu actividad es elegible.
          </p>

          <div className={styles.actividadSelector} role="radiogroup" aria-label="Actividad para módulos">
            {ACTIVIDADES.map(a => (
              <button
                key={a.id}
                type="button"
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
                <span>− Reducción {GASTOS_DIFICIL_JUSTIFICACION_EDS.porcentaje}% (máx. {formatCurrency(GASTOS_DIFICIL_JUSTIFICACION_EDS.limiteAnual)})</span>
                <strong>−{formatCurrency(resED.reduccion5pc)}</strong>
              </div>
              <div className={styles.lineaSubtotal}>
                <span>= Rendimiento neto reducido</span>
                <strong>{formatCurrency(resED.rendimientoNetoReducido)}</strong>
              </div>
              <div className={styles.lineaSubtotal}>
                <span>= Base liquidable (el mínimo va dentro)</span>
                <strong>{formatCurrency(resED.baseLiquidable)}</strong>
              </div>
              <div className={styles.lineaItem}>
                <span>Escala general sobre la base completa</span>
                <strong>{formatCurrency(resED.cuotaEscala)}</strong>
              </div>
              <div className={styles.lineaResta}>
                <span>− Escala sobre el mínimo personal ({formatCurrency(resED.minimosPersonales)}, a tipo cero)</span>
                <strong>−{formatCurrency(resED.cuotaMinimo)}</strong>
              </div>
              <div className={styles.lineaItem}>
                <span>= IRPF</span>
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
                  <span aria-hidden="true">⚠️</span>{' '}
                  {resModulos.motivoNoApta === 'supera_limites'
                    ? `Ingresos o gastos superan los límites de exclusión (${formatCurrency(LIMITES_EXCLUSION_MODULOS_2025.ingresosConjuntoActividades)} / ${formatCurrency(LIMITES_EXCLUSION_MODULOS_2025.comprasBienesYServicios)}) — con estos datos quedarías excluido de módulos aunque la actividad encajase.`
                    : 'Sin parámetros suficientes — esta actividad/configuración probablemente NO es elegible para módulos.'}
                </p>
              )}

              <div className={styles.lineaItem}>
                <span>Rendimiento neto previo (módulos)</span>
                <strong>{formatCurrency(resModulos.rendimientoNetoPrevio)}</strong>
              </div>
              <div className={styles.lineaResta}>
                <span>− Reducción {GASTOS_DIFICIL_JUSTIFICACION_EDS.porcentaje}% (máx. {formatCurrency(GASTOS_DIFICIL_JUSTIFICACION_EDS.limiteAnual)})</span>
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
              <div className={styles.lineaSubtotal}>
                <span>= Base liquidable (el mínimo va dentro)</span>
                <strong>{formatCurrency(resModulos.baseLiquidable)}</strong>
              </div>
              <div className={styles.lineaItem}>
                <span>Escala general sobre la base completa</span>
                <strong>{formatCurrency(resModulos.cuotaEscala)}</strong>
              </div>
              <div className={styles.lineaResta}>
                <span>− Escala sobre el mínimo personal ({formatCurrency(resModulos.minimosPersonales)}, a tipo cero)</span>
                <strong>−{formatCurrency(resModulos.cuotaMinimo)}</strong>
              </div>
              <div className={styles.lineaItem}>
                <span>= IRPF</span>
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
            {resModulos.esApta ? (
              <>
                <span className={styles.diferenciaTitulo}>
                  Pagas <strong>{formatCurrency(Math.abs(diferencia))}</strong> {ganaED ? 'MÁS' : 'MENOS'} con módulos
                  que con Estimación Directa
                </span>
                <span className={styles.diferenciaDetalle}>
                  ED: {formatCurrency(resED.costeAnualTotal)} · Módulos: {formatCurrency(resModulos.costeAnualTotal)}
                </span>
              </>
            ) : (
              <span className={styles.diferenciaTitulo}>
                Con estos datos, la actividad no parece elegible para módulos: la comparativa de
                importes no aplica.
              </span>
            )}
          </div>

          <div className={styles.recomendacionBox}>
            <strong className={styles.recomendacionTitulo}>
              Para tu situación, te conviene más: {!resModulos.esApta || ganaED ? 'Estimación Directa Simplificada' : 'Estimación Objetiva (Módulos)'}
            </strong>
            <p className={styles.recomendacionTexto}>
              {!resModulos.esApta
                ? 'Con los datos introducidos, la actividad no parece elegible para módulos, así que la única opción real es Estimación Directa Simplificada. Verifica la elegibilidad exacta de tu epígrafe con tu asesor.'
                : ganaED
                ? 'Tu margen real (ingresos − gastos) es relativamente bajo, así que tributar por beneficio real (ED) sale más barato que por unidades (módulos).'
                : 'Tu margen real es alto, así que tributar por unidades (módulos) limita el rendimiento computable y reduce el IRPF respecto a tributar por beneficio real (ED).'}
            </p>
            <p className={styles.recomendacionAviso}>
              <span aria-hidden="true">⚠️</span> <strong>Importante:</strong> Módulos solo es elegible para tu actividad si está
              listada en la {ORDEN_MODULOS_VIGENTE.referencia}. <strong>Verifica con tu asesor fiscal</strong> antes
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
                <td>{formatCurrency(LIMITES_EXCLUSION_MODULOS_2025.ingresosConjuntoActividades)}/año (o {formatCurrency(LIMITES_EXCLUSION_MODULOS_2025.facturacionAEmpresas)} facturados a empresas)</td>
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
              Solo las recogidas en la <em>{ORDEN_MODULOS_VIGENTE.referencia}</em>, de {ORDEN_MODULOS_VIGENTE.fecha} ({ORDEN_MODULOS_VIGENTE.boe}), que es la del ejercicio {ORDEN_MODULOS_VIGENTE.ejercicio} y se renueva cada año: hostelería con servicio
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
              Si superas {formatCurrency(LIMITES_EXCLUSION_MODULOS_2025.ingresosConjuntoActividades)} de
              ingresos anuales, {formatCurrency(LIMITES_EXCLUSION_MODULOS_2025.facturacionAEmpresas)} facturados
              a otros empresarios y profesionales, o {formatCurrency(LIMITES_EXCLUSION_MODULOS_2025.comprasBienesYServicios)} de
              compras en bienes y servicios (excluido el inmovilizado), quedas <strong>excluido
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
                asalariado, kWh, vehículos…). Aplicas las reducciones ({GASTOS_DIFICIL_JUSTIFICACION_EDS.porcentaje}%, incentivos al empleo,
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
