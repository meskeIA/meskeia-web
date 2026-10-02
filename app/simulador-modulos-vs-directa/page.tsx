'use client';

import { useState, useMemo } from 'react';
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
import { formatCurrency, formatNumber, parseSpanishNumber } from '@/lib';
import {
  FISCAL_IRPF_META,
  LIMITES_EXCLUSION_MODULOS_2025,
  FISCAL_MODULOS_IRPF_META,
  ORDEN_MODULOS_VIGENTE,
  GASTOS_DIFICIL_JUSTIFICACION_EDS,
  FISCAL_ESTIMACION_DIRECTA_META,
  LIMITE_CIFRA_NEGOCIO_EDS,
  REDUCCION_GENERAL_MODULOS,
  FISCAL_AUTONOMOS_META,
  TRAMOS_RETA_2025,
  GASTOS_GENERICOS_RETA,
  REDUCCION_ACTIVIDADES_RENTAS_BAJAS,
  rendimientoComputableMensualRETA,
  nombreTramoRETA,
  tramoRETA,
} from '@/data/fiscal';
import type { ResultadoRegimenED } from '@/lib/calculadoras/modulosVsDirecta';
import { compararModulosVsDirecta } from '@/lib/calculadoras/modulosVsDirecta';
import { calcularCuotaAutonomo } from '@/lib/calculadoras/cuotaAutonomo';
import styles from './SimuladorModulosVsDirecta.module.css';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface DatosComunes {
  ingresos: number;
  gastos: number;
  retaMensual: number;
}

/** Lectura del campo «Rendimiento neto de módulos»: sin dato, dato válido o error. */
type LecturaRendimiento =
  | { estado: 'vacio' }
  | { estado: 'valido'; valor: number }
  | { estado: 'error'; mensaje: string };

// ─── Cálculos ────────────────────────────────────────────────────────────────

// La fórmula NO vive aquí: la página consume lib/calculadoras/modulosVsDirecta.ts, que es
// el mismo motor que sirve a la tool comparar_modulos_vs_directa del MCP de Delegum.
//
// ⚠️ 01/10/2026 — hallazgo 2545 y decisión del usuario del mismo día: la página ya no estima
// el rendimiento de módulos con un selector de actividad y deslizadores (mesas, m², kWh,
// vehículos, personal) ni recomienda régimen. Aquellas fórmulas eran inventadas —la Orden
// real usa otros signos y otras cuantías— y con ellas la página decía «te conviene más X».
// Ahora el rendimiento neto de módulos lo teclea el usuario y la diferencia es un dato.
// Por qué no se modela la Orden entera: cabecera del motor.

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

/** Cuota del estado de partida (deslizador y casilla de la cuota exacta). */
const RETA_INICIAL = 320;

// Nombre de la tabla de tramos del RETA tal como lo lee el usuario: la Orden de cotización
// sale de FISCAL_AUTONOMOS_META.fuente (hoy «Orden PJC/297/2026»), y si un re-sellado cambia
// el formato de la fuente, cae al año de vigencia antes que a un literal tecleado.
// ⚠️ 01/10/2026 — hasta hoy la nota del primer DataReference enseñaba el identificador de
// código «(TRAMOS_RETA_2025)», cuyo sufijo además contradecía al dato (hallazgo 2547).
const ORDEN_COTIZACION_RETA = FISCAL_AUTONOMOS_META.fuente.match(/Orden [A-Z]+\/\d+\/\d{4}/)?.[0];
const NOMBRE_TABLA_RETA = ORDEN_COTIZACION_RETA
  ? `tabla de tramos del RETA de la ${ORDEN_COTIZACION_RETA}`
  : `tabla de tramos del RETA de ${FISCAL_AUTONOMOS_META.vigencia}`;

interface CoherenciaReta {
  /** Tramo de la tabla tal como lo numera la Orden: tabla reducida 1-3 o general 1-12. */
  tabla: 'reducida' | 'general';
  numeroTramo: number;
  /** Cuota mensual mínima de ese tramo, en €. */
  cuotaMinimaTramo: number;
  /** Rendimiento computable mensual (art. 308.1.c LGSS) con el que se ha buscado el tramo, en €. */
  rendimientoMensual: number;
  /** Cuánto queda por debajo del mínimo el coste anual publicado, en €. */
  deficitAnual: number;
}

/**
 * Contrasta la cuota RETA introducida con el tramo que le toca por rendimiento.
 *
 * El tramo lo decide el rendimiento COMPUTABLE del art. 308.1.c LGSS, no el neto del IRPF:
 * en directa, el rendimiento neto (que ya lleva restados la cuota y el 5 % de difícil
 * justificación) MÁS las cuotas, y a eso un 7 % menos de gastos genéricos
 * (`rendimientoComputableMensualRETA`). Por debajo de la cuota mínima de ese tramo, el «coste
 * fiscal anual total» que la app publica queda por debajo del mínimo legalmente posible
 * (hallazgo 812).
 *
 * ⚠️ 02/10/2026 — hallazgo 2607: hasta hoy buscaba el tramo con (ingresos − gastos − cuota)/12,
 * atribuyéndolo al art. 308.1. Con 100.000 / 21.000 / 560 avisaba de un déficit de 568,20 €
 * que no existe, y con 30.000 / 4.500 / 370 callaba uno de 130,56 €. Y nombraba el tramo por el
 * id correlativo de la tabla (1-15), que la Orden no usa (hallazgo 2611).
 *
 * Se AVISA, no se corrige: la app no sabe si hay tarifa plana, pluriactividad, base
 * elegida por encima de la mínima o un alta a mitad de año.
 *
 * @returns null cuando la cuota es coherente con el tramo (o no hay rendimiento positivo).
 */
function contrastarCuotaReta(retaMensual: number, ed: ResultadoRegimenED): CoherenciaReta | null {
  // Con pérdidas, el rendimiento neto REAL es negativo y así entra en el art. 308.1.c: el
  // `rendimientoNeto` del motor está acotado a 0 para el IRPF, que es otra cosa.
  const rendimientoNetoReal = ed.ingresos - ed.gastos - ed.cuotaRetaDeducida - ed.reduccion5pc;
  const rendimientoMensual = rendimientoComputableMensualRETA({
    rendimientoNetoAnual: rendimientoNetoReal,
    cuotasAnuales: ed.cuotaRetaDeducida,
    metodo: 'directa',
  });
  if (rendimientoMensual <= 0) return null;
  const { cuotaEfectiva } = calcularCuotaAutonomo({ rendimientoNetoMensual: rendimientoMensual });
  if (retaMensual >= cuotaEfectiva) return null;
  const { tabla, numero } = nombreTramoRETA(tramoRETA(rendimientoMensual));
  return {
    tabla,
    numeroTramo: numero,
    cuotaMinimaTramo: cuotaEfectiva,
    rendimientoMensual,
    deficitAnual: (cuotaEfectiva - retaMensual) * 12,
  };
}

/**
 * Lee el campo de texto del rendimiento neto de módulos. Vacío = sin dato (solo se calcula
 * la directa); lo que no es un número o es negativo NO se convierte en cifra.
 */
function leerRendimiento(texto: string): LecturaRendimiento {
  if (texto.trim() === '') return { estado: 'vacio' };
  const valor = parseSpanishNumber(texto);
  if (!Number.isFinite(valor)) {
    return {
      estado: 'error',
      mensaje: 'Eso no es un importe. Escribe el rendimiento en euros, por ejemplo 18.500 o 18.500,50.',
    };
  }
  if (valor < 0) {
    return {
      estado: 'error',
      mensaje: 'El rendimiento neto de módulos no puede ser negativo. Escribe 0 o un importe positivo.',
    };
  }
  return { estado: 'valido', valor };
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function SimuladorModulosVsDirectaPage() {
  const [comunes, setComunes] = useState<DatosComunes>({
    ingresos: 70000,
    gastos: 25000,
    retaMensual: RETA_INICIAL,
  });
  const [rendimientoTexto, setRendimientoTexto] = useState('');
  // Texto de la cuota exacta: borrador libre; solo se aplica si es un importe de la tabla.
  const [retaTexto, setRetaTexto] = useState(() => formatNumber(RETA_INICIAL, 2));
  const retaLeida = parseSpanishNumber(retaTexto);
  const retaTextoInvalido =
    retaTexto.trim() !== '' &&
    !(Number.isFinite(retaLeida) && retaLeida >= RETA_CUOTA_MIN && retaLeida <= RETA_CUOTA_MAX);

  const lectura = useMemo(() => leerRendimiento(rendimientoTexto), [rendimientoTexto]);

  const comparativa = useMemo(
    () =>
      compararModulosVsDirecta({
        ...comunes,
        rendimientoNetoModulos: lectura.estado === 'valido' ? lectura.valor : undefined,
      }),
    [comunes, lectura]
  );
  const resED = comparativa.estimacionDirecta;
  const resModulos = comparativa.modulos;
  const diferencia = comparativa.diferencia;
  const superaLimites = comparativa.motivoSinModulos === 'supera_limites';

  // Coherencia de la cuota RETA con el tramo que le toca por rendimiento computable.
  const coherenciaReta = useMemo(
    () => contrastarCuotaReta(comunes.retaMensual, resED),
    [comunes.retaMensual, resED]
  );

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">⚖️</span>
        <h1 className={styles.title}>Simulador Módulos vs Estimación Directa</h1>
        <p className={styles.subtitle}>
          Coste anual de IRPF y cuota RETA de un autónomo en España en los dos regímenes, con tus
          datos (orientativo)
        </p>
      </header>

      <RegionBadge variant="es-only" />

      <DisclaimerCard variant="financial" severity="critical" />

      <DataReference
        normativa={`IRPF ${FISCAL_IRPF_META.vigencia}`}
        fuente={FISCAL_IRPF_META.fuente}
        verificado={FISCAL_IRPF_META.verificado}
        urlOficial={FISCAL_IRPF_META.urlOficial}
        nota={`El IRPF de ambos regímenes usa esta escala, con el mínimo personal y sin mínimos familiares, y toma la actividad como tu única renta: por eso, por debajo de ${formatCurrency(REDUCCION_ACTIVIDADES_RENTAS_BAJAS.limiteRentas)} de rendimiento aplica la reducción por rentas bajas del ${REDUCCION_ACTIVIDADES_RENTAS_BAJAS.norma} (si tienes otras rentas, la reducción sería menor o nula). No se modela la reducción del art. 32.2.1.º (cliente único o TRADE). La cuota RETA la introduces tú dentro del rango real de la ${NOMBRE_TABLA_RETA}, y el rendimiento neto de módulos también: la app no lo calcula a partir de la ${ORDEN_MODULOS_VIGENTE.referencia}.`}
      />

      <DataReference
        normativa="Límites de exclusión de módulos"
        fuente={FISCAL_MODULOS_IRPF_META.fuente}
        verificado={FISCAL_MODULOS_IRPF_META.verificado}
        urlOficial={FISCAL_MODULOS_IRPF_META.urlOficial}
        nota={`${FISCAL_MODULOS_IRPF_META.salvedad} El simulador no calcula módulos si tus ingresos o gastos introducidos superan estos límites. El de facturación a empresas (${formatCurrency(LIMITES_EXCLUSION_MODULOS_2025.facturacionAEmpresas)}) es solo informativo: no hay campo para ese dato. La reducción general del ${REDUCCION_GENERAL_MODULOS.porcentaje}\u00A0% sobre el rendimiento neto de módulos es la de la ${REDUCCION_GENERAL_MODULOS.norma} y no tiene tope en euros.`}
      />

      <DataReference
        normativa="Estimación directa simplificada"
        fuente={FISCAL_ESTIMACION_DIRECTA_META.fuente}
        verificado={FISCAL_ESTIMACION_DIRECTA_META.verificado}
        urlOficial={FISCAL_ESTIMACION_DIRECTA_META.urlOficial}
        nota={`La columna de Estimación Directa resta tu cuota RETA como gasto deducible y aplica el ${GASTOS_DIFICIL_JUSTIFICACION_EDS.porcentaje}\u00A0% de provisiones y gastos de difícil justificación, con tope de ${formatCurrency(GASTOS_DIFICIL_JUSTIFICACION_EDS.limiteAnual)} al año.`}
      />

      <DataReference
        normativa="Cotización de autónomos (RETA)"
        fuente={FISCAL_AUTONOMOS_META.fuente}
        verificado={FISCAL_AUTONOMOS_META.verificado}
        urlOficial={FISCAL_AUTONOMOS_META.urlOficial}
        nota="Los tramos de rendimiento y cuota con los que se contrasta la cuota que introduces (aviso de coherencia bajo el deslizador)."
      />

      <LegalNotice />

      <main className={styles.main}>
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
              Solo cuentan en Estimación Directa (alquiler del local, suministros afectos,
              material…). También se usan como aproximación a tus compras para el límite de
              exclusión de módulos ({formatCurrency(LIMITES_EXCLUSION_MODULOS_2025.comprasBienesYServicios)}).
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
              onChange={e => {
                const v = Number(e.target.value);
                setComunes({ ...comunes, retaMensual: v });
                setRetaTexto(formatNumber(v, 2));
              }}
              className={styles.slider}
            />
            <div className={styles.sliderRange}>
              <span>{formatCurrency(RETA_SLIDER_MIN)}</span>
              <span>{formatCurrency(RETA_SLIDER_MAX)}</span>
            </div>
            {/*
              El deslizador va de euro en euro, y todas las cuotas mínimas de la tabla llevan
              céntimos (205,88 €, 302,65 €…): quien paga justo la mínima no podía introducirla y
              el aviso le decía que estaba por debajo del mínimo legal (hallazgo 2613). La cuota
              exacta se escribe aquí, con céntimos.
            */}
            <div className={styles.campoReta}>
              <label className={styles.campoRetaLabel} htmlFor="retaExacta">
                o escribe tu cuota exacta (€/mes, con céntimos)
              </label>
              <input
                id="retaExacta"
                name="retaExacta"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={retaTexto}
                onChange={e => {
                  const texto = e.target.value;
                  setRetaTexto(texto);
                  const v = parseSpanishNumber(texto);
                  if (Number.isFinite(v) && v >= RETA_CUOTA_MIN && v <= RETA_CUOTA_MAX) {
                    setComunes({ ...comunes, retaMensual: Math.round(v * 100) / 100 });
                  }
                }}
                aria-invalid={retaTextoInvalido}
                aria-describedby="retaExacta-ayuda"
                className={`${styles.campoTexto} ${retaTextoInvalido ? styles.campoTextoError : ''}`}
              />
            </div>
            <p id="retaExacta-ayuda" className={styles.sliderHint}>
              Cuota mensual del RETA según tu base de cotización elegida, entre{' '}
              {formatCurrency(RETA_CUOTA_MIN)} y {formatCurrency(RETA_CUOTA_MAX)} (el rango real de
              la tabla de tramos). Mueve el deslizador o escribe tu cuota exacta en la casilla.
              {retaTextoInvalido && (
                <> <strong>Ese importe no está en la tabla: se mantiene {formatCurrency(comunes.retaMensual)}.</strong></>
              )}
            </p>
            {/*
              Región viva PERSISTENTE (hallazgo 2614): antes el <p aria-live> se montaba ya con el
              texto y el lector podía no anunciarlo. Ahora el contenedor existe desde la carga y lo
              que cambia es su contenido.
            */}
            <div aria-live="polite" aria-atomic="true">
              {coherenciaReta && (
                <p className={styles.avisoReta}>
                  <span aria-hidden="true">⚠️</span> Con {formatCurrency(comunes.ingresos)} de
                  ingresos y {formatCurrency(comunes.gastos)} de gastos, tu rendimiento computable
                  para el RETA (rendimiento neto más tus cuotas, menos el{' '}
                  {formatNumber(GASTOS_GENERICOS_RETA.general * 100, 0)}{' '}% de gastos genéricos;{' '}
                  {GASTOS_GENERICOS_RETA.norma}) sale a{' '}
                  {formatCurrency(coherenciaReta.rendimientoMensual)}/mes: tabla{' '}
                  {coherenciaReta.tabla}, tramo {coherenciaReta.numeroTramo}, cuya cuota mínima es{' '}
                  <strong>{formatCurrency(coherenciaReta.cuotaMinimaTramo)}/mes</strong>. Con{' '}
                  {formatCurrency(comunes.retaMensual)} el coste anual que ves más abajo queda{' '}
                  {formatCurrency(coherenciaReta.deficitAnual)} por debajo del mínimo posible, salvo
                  que tengas tarifa plana, pluriactividad, seas autónomo societario (deducción del{' '}
                  {formatNumber(GASTOS_GENERICOS_RETA.societarios * 100, 0)}{' '}%) o un alta a
                  mitad de año.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Dato de módulos */}
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

          <div className={styles.campoGroup}>
            <label className={styles.sliderLabel} htmlFor="rendimientoModulos">
              Rendimiento neto de módulos (anual, en €)
            </label>
            <input
              id="rendimientoModulos"
              name="rendimientoModulos"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              placeholder="Por ejemplo, 18.500"
              value={rendimientoTexto}
              onChange={e => setRendimientoTexto(e.target.value)}
              aria-invalid={lectura.estado === 'error'}
              aria-describedby="rendimientoModulos-ayuda"
              className={`${styles.campoTexto} ${lectura.estado === 'error' ? styles.campoTextoError : ''}`}
            />
            {lectura.estado === 'error' && (
              <p className={styles.campoError} role="alert">
                {lectura.mensaje}
              </p>
            )}
            <p id="rendimientoModulos-ayuda" className={styles.sliderHint}>
              Es lo que resulta de aplicar a tu actividad los módulos de la{' '}
              {ORDEN_MODULOS_VIGENTE.referencia}: cada módulo (personas, potencia eléctrica, mesas…)
              por su importe, menos las minoraciones por incentivos al empleo y a la inversión y
              con los índices correctores aplicados, <strong>antes</strong> de la reducción general
              del {REDUCCION_GENERAL_MODULOS.porcentaje}{'\u00A0'}%, que la app aplica después.
              Te lo calcula tu gestoría. Si lo dejas vacío, solo se calcula la Estimación Directa.
            </p>
          </div>

          <p className={styles.notaModulos}>
            <strong>Por qué la app no lo calcula:</strong> cada epígrafe de la Orden tiene sus
            propios módulos con importes distintos, y una fórmula genérica daría una cifra que no
            es la tuya.
          </p>
        </div>

        {/* Comparativa lado a lado */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Coste anual en cada régimen</h2>

          <div className={styles.comparativaLayout}>
            {/* Columna ED */}
            <div className={styles.colED}>
              <h3 className={styles.colTitle}>Estimación Directa Simplificada</h3>
              <p className={styles.colSub}>Tributas por beneficio real (ingresos − gastos, cuota RETA incluida)</p>

              <div className={styles.lineaItem}>
                <span>Ingresos brutos</span>
                <strong>{formatCurrency(resED.ingresos)}</strong>
              </div>
              <div className={styles.lineaResta}>
                <span>− Gastos deducibles</span>
                <strong>−{formatCurrency(resED.gastos)}</strong>
              </div>
              <div className={styles.lineaResta}>
                <span>− Cuota RETA × 12 (gasto deducible del titular)</span>
                <strong>−{formatCurrency(resED.cuotaRetaDeducida)}</strong>
              </div>
              <div className={styles.lineaSubtotal}>
                <span>= Rendimiento neto previo</span>
                <strong>{formatCurrency(resED.rendimientoNetoPrevio)}</strong>
              </div>
              <div className={styles.lineaResta}>
                <span>− Reducción {GASTOS_DIFICIL_JUSTIFICACION_EDS.porcentaje}{'\u00A0'}% (máx. {formatCurrency(GASTOS_DIFICIL_JUSTIFICACION_EDS.limiteAnual)})</span>
                <strong>−{formatCurrency(resED.reduccion5pc)}</strong>
              </div>
              <div className={styles.lineaSubtotal}>
                <span>= Rendimiento neto de la actividad</span>
                <strong>{formatCurrency(resED.rendimientoNeto)}</strong>
              </div>
              {resED.reduccionRentasBajas > 0 && (
                <>
                  <div className={styles.lineaResta}>
                    <span>− Reducción por rentas bajas ({REDUCCION_ACTIVIDADES_RENTAS_BAJAS.norma})</span>
                    <strong>−{formatCurrency(resED.reduccionRentasBajas)}</strong>
                  </div>
                  <div className={styles.lineaSubtotal}>
                    <span>= Rendimiento neto reducido</span>
                    <strong>{formatCurrency(resED.rendimientoNetoReducido)}</strong>
                  </div>
                </>
              )}
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
                <span>+ Cuota RETA × 12 (la pagas igual)</span>
                <strong>+{formatCurrency(resED.cuotaReta)}</strong>
              </div>
              <div className={styles.lineaTotal}>
                <span>Coste fiscal anual total</span>
                <strong>{formatCurrency(resED.costeAnualTotal)}</strong>
              </div>
            </div>

            {/* Columna Módulos */}
            <div className={styles.colModulos}>
              <h3 className={styles.colTitle}>Estimación Objetiva (Módulos)</h3>
              <p className={styles.colSub}>Tributas por los módulos de la actividad, no por el beneficio real</p>

              {resModulos ? (
                <>
                  <div className={styles.lineaItem}>
                    <span>Rendimiento neto de módulos (tu dato)</span>
                    <strong>{formatCurrency(resModulos.rendimientoNetoModulos)}</strong>
                  </div>
                  <div className={styles.lineaResta}>
                    <span>− Reducción general {REDUCCION_GENERAL_MODULOS.porcentaje}{'\u00A0'}% (sin tope)</span>
                    <strong>−{formatCurrency(resModulos.reduccion5pc)}</strong>
                  </div>
                <div className={styles.lineaSubtotal}>
                  <span>= Rendimiento neto de la actividad</span>
                  <strong>{formatCurrency(resModulos.rendimientoNeto)}</strong>
                </div>
                {resModulos.reduccionRentasBajas > 0 && (
                  <>
                    <div className={styles.lineaResta}>
                      <span>− Reducción por rentas bajas ({REDUCCION_ACTIVIDADES_RENTAS_BAJAS.norma})</span>
                      <strong>−{formatCurrency(resModulos.reduccionRentasBajas)}</strong>
                    </div>
                    <div className={styles.lineaSubtotal}>
                      <span>= Rendimiento neto reducido</span>
                      <strong>{formatCurrency(resModulos.rendimientoNetoReducido)}</strong>
                    </div>
                  </>
                )}
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
                    <span>+ Cuota RETA × 12 (en módulos no se deduce)</span>
                    <strong>+{formatCurrency(resModulos.cuotaReta)}</strong>
                  </div>
                  <div className={styles.lineaTotal}>
                    <span>Coste fiscal anual total</span>
                    <strong>{formatCurrency(resModulos.costeAnualTotal)}</strong>
                  </div>
                </>
              ) : superaLimites ? (
                <p className={styles.avisoNoApta}>
                  <span aria-hidden="true">⚠️</span>{' '}
                  Ingresos o gastos superan los límites de exclusión ({formatCurrency(LIMITES_EXCLUSION_MODULOS_2025.ingresosConjuntoActividades)} / {formatCurrency(LIMITES_EXCLUSION_MODULOS_2025.comprasBienesYServicios)}) — con estos datos quedarías excluido de módulos aunque la actividad encajase.
                </p>
              ) : (
                <p className={styles.sinDatoModulos}>
                  Falta tu <strong>rendimiento neto de módulos</strong>. Escríbelo en el campo de
                  arriba para ver el coste en este régimen: la app no lo calcula, porque depende de
                  los módulos que la {ORDEN_MODULOS_VIGENTE.referencia} fija para tu epígrafe.
                </p>
              )}
            </div>
          </div>

          {/* Diferencia como dato, sin veredicto */}
          <div className={styles.diferenciaBox} role="status" aria-live="polite">
            {resModulos && diferencia !== null ? (
              <>
                <span className={styles.diferenciaTitulo}>
                  {diferencia === 0 ? (
                    'Con estos datos, el coste anual es el mismo en los dos regímenes.'
                  ) : (
                    <>
                      Con estos datos, el coste anual en Estimación Directa es{' '}
                      <strong>{formatCurrency(Math.abs(diferencia))}</strong>{' '}
                      {diferencia > 0 ? 'mayor' : 'menor'} que en módulos.
                    </>
                  )}
                </span>
                <span className={styles.diferenciaDetalle}>
                  Directa: {formatCurrency(resED.costeAnualTotal)} · Módulos: {formatCurrency(resModulos.costeAnualTotal)}
                </span>
              </>
            ) : superaLimites ? (
              <span className={styles.diferenciaTitulo}>
                Con estos ingresos o gastos quedarías excluido de módulos: no hay comparación de importes.
              </span>
            ) : (
              <span className={styles.diferenciaTitulo}>
                Sin el rendimiento neto de módulos solo se calcula la Estimación Directa.
              </span>
            )}
          </div>

          <div className={styles.noRecogeBox}>
            <strong className={styles.noRecogeTitulo}>Lo que la cifra de un año no recoge</strong>
            <ul className={styles.noRecogeLista}>
              <li>
                La renuncia a módulos obliga a seguir al menos <strong>tres años</strong> en
                Estimación Directa.
              </li>
              <li>
                En módulos el rendimiento no baja por sí solo en un año con menos margen; en
                directa sí, porque sale del resultado real.
              </li>
              <li>
                Las minoraciones y los índices correctores de la Orden tienen que ir ya dentro del
                rendimiento que escribes.
              </li>
              <li>
                El IVA: estas cifras solo recogen IRPF y cuota RETA. En módulos suele aplicarse el
                régimen simplificado de IVA, y el comercio minorista persona física está en recargo
                de equivalencia en cualquiera de los dos regímenes de IRPF.
              </li>
            </ul>
            <p className={styles.noRecogeAviso}>
              <span aria-hidden="true">⚠️</span> Módulos solo es posible si tu actividad está
              listada en la {ORDEN_MODULOS_VIGENTE.referencia}. <strong>Consulta con tu asesor
              fiscal</strong> antes de cambiar de régimen.
            </p>
          </div>
        </div>
      </main>

      <EducationalSection
        title="Guía Módulos vs Estimación Directa"
        subtitle="Qué cambia entre los dos regímenes y cómo leer la comparación"
      >
        <h3>Diferencias entre los dos regímenes</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Característica</th>
                <th>ED Simplificada</th>
                <th>Módulos</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Cómo se calcula el rendimiento</td>
                <td>Ingresos − gastos reales</td>
                <td>Por los módulos de la actividad (personas, potencia, mesas…)</td>
              </tr>
              <tr>
                <td>Año con menos margen</td>
                <td>El rendimiento baja con el resultado (puede ser 0)</td>
                <td>El rendimiento no depende del resultado real</td>
              </tr>
              <tr>
                <td>Cuota RETA del titular</td>
                <td>Gasto deducible</td>
                <td>No se deduce</td>
              </tr>
              <tr>
                <td>Actividades</td>
                <td>Cualquiera</td>
                <td>Solo las de la Orden anual de módulos (las profesiones liberales, nunca)</td>
              </tr>
              <tr>
                <td>IVA</td>
                <td>Régimen general (el comercio minorista persona física, recargo de equivalencia)</td>
                <td>Normalmente régimen simplificado (el comercio minorista, recargo de equivalencia)</td>
              </tr>
              <tr>
                <td>Límites</td>
                <td>{formatCurrency(LIMITE_CIFRA_NEGOCIO_EDS)} de cifra de negocios (por encima, directa normal)</td>
                <td>{formatCurrency(LIMITES_EXCLUSION_MODULOS_2025.ingresosConjuntoActividades)} de ingresos, {formatCurrency(LIMITES_EXCLUSION_MODULOS_2025.facturacionAEmpresas)} facturados a empresas o {formatCurrency(LIMITES_EXCLUSION_MODULOS_2025.comprasBienesYServicios)} de compras</td>
              </tr>
              <tr>
                <td>Renuncia</td>
                <td>—</td>
                <td>Voluntaria; la renuncia y la exclusión obligan a tres años en directa</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className={styles.tableNote}>
          Datos generales orientativos. Los límites de exclusión los fija la Ley del IRPF (art.
          31.1.3.ª y su disposición transitoria 32.ª), no la Orden anual de módulos (hoy, la{' '}
          {ORDEN_MODULOS_VIGENTE.referencia}), que solo remite a ellos. {FISCAL_MODULOS_IRPF_META.salvedad}
        </p>

        <h3>Qué mueve la diferencia</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <h4>Beneficio real frente a rendimiento de módulos</h4>
            <p>
              La directa tributa por ingresos − gastos − cuota RETA; módulos, por el rendimiento
              que fija la Orden. Cuanto más se separan esas dos cifras, más se separan las cuotas
              de IRPF, en un sentido o en otro.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <h4>Años distintos</h4>
            <p>
              En directa el rendimiento sigue al resultado de cada año. En módulos depende de los
              módulos de la actividad, así que un año flojo no lo reduce por sí solo. Por eso
              compensa repetir la comparación con varios escenarios de ingresos y gastos.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <h4>La cuota de autónomo</h4>
            <p>
              Se paga en los dos regímenes, pero solo en directa es gasto deducible: rebaja la
              base del IRPF. En módulos solo se suma al coste.
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
            <strong>¿De dónde saco el rendimiento neto de módulos?</strong>
            <p>
              De aplicar a tu actividad el Anexo de la {ORDEN_MODULOS_VIGENTE.referencia}: cada
              módulo de tu epígrafe por su importe, menos las minoraciones y con los índices
              correctores. Es un cálculo propio de cada epígrafe, y lo habitual es que lo haga la
              gestoría. Esta app aplica después la reducción general del{' '}
              {REDUCCION_GENERAL_MODULOS.porcentaje}{'\u00A0'}%, el IRPF y la cuota RETA.
            </p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Cómo cambio de régimen?</strong>
            <p>
              Mediante la <em>declaración censal</em> (modelo 036/037). La renuncia a módulos se
              presenta en diciembre del año anterior al que se quiere cambiar; también cuenta
              como renuncia presentar en plazo el primer pago fraccionado del año por estimación
              directa. Tiene efectos durante <strong>3 años mínimo</strong> (no puedes volver
              hasta entonces) (art. 33 del Reglamento del IRPF).
            </p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Tributo el IVA igual en ambos regímenes?</strong>
            <p>
              Depende de la actividad. En módulos lo normal es el <em>régimen simplificado de
              IVA</em>, que también se calcula por módulos, y si renuncias a módulos en el IRPF
              también sales del simplificado. Pero el comercio minorista persona física va al{' '}
              <em>recargo de equivalencia</em> por la Ley del IVA (arts. 148 y 149), sin depender del
              régimen de IRPF: si renuncias a módulos y más del 80{' '}% de tus ventas son a
              consumidores, sigues en recargo y no pasas a declarar IVA repercutido menos soportado.
              Las demás actividades, en directa, van al régimen general. Esta app no calcula el IVA.
            </p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Qué pasa si supero los límites de módulos?</strong>
            <p>
              Si superas {formatCurrency(LIMITES_EXCLUSION_MODULOS_2025.ingresosConjuntoActividades)} de
              ingresos anuales, {formatCurrency(LIMITES_EXCLUSION_MODULOS_2025.facturacionAEmpresas)} facturados
              a otros empresarios y profesionales, o {formatCurrency(LIMITES_EXCLUSION_MODULOS_2025.comprasBienesYServicios)} de
              compras en bienes y servicios (excluido el inmovilizado), quedas <strong>excluido
              automáticamente</strong> y pasas a Estimación Directa el año siguiente, y ahí te
              quedas <strong>durante los tres años siguientes</strong>, igual que con la renuncia
              (art. 31.1.5.ª de la Ley del IRPF). {FISCAL_MODULOS_IRPF_META.salvedad}
            </p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Hay obligaciones contables distintas?</strong>
            <p>
              Sí. La directa simplificada exige llevar libros de ingresos, gastos y bienes de
              inversión. En módulos basta, en general, con conservar las facturas emitidas y
              recibidas y los justificantes de los módulos aplicados; si deduces amortizaciones,
              también el libro registro de bienes de inversión (art. 68 del Reglamento del IRPF).
            </p>
          </div>
        </div>

        <h3>Cómo hacer la comparación paso a paso</h3>
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Comprueba si tu actividad está en la Orden anual de módulos</strong>
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
                Una previsión razonable basada en el histórico y en lo que vaya a cambiar (personal,
                local, inversiones…).
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Obtén tu rendimiento neto de módulos</strong>
              <p>
                Con los módulos oficiales de tu epígrafe: restas las minoraciones por incentivos al
                empleo y a la inversión y aplicas los índices correctores. Sobre ese rendimiento se
                aplica la reducción general del {REDUCCION_GENERAL_MODULOS.porcentaje}{'\u00A0'}% (sin tope).
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Compara IRPF + cuota RETA en ambos escenarios</strong>
              <p>
                En Estimación Directa la cuota es además gasto deducible y rebaja el IRPF; en
                módulos no. Prueba también con un año de menos ingresos.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Consulta con tu asesor antes de diciembre</strong>
              <p>
                La renuncia se presenta con el modelo 036/037 en diciembre del año anterior, y
                renunciar a módulos te ata 3 años mínimo a la directa.
              </p>
            </div>
          </div>
        </div>

        <h3>Mejores prácticas</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📊</span>
            <div>
              <strong>Repite la comparación cada año</strong>
              <p>Tu margen y la Orden de módulos cambian: las cifras de hace dos años ya no valen.</p>
            </div>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📅</span>
            <div>
              <strong>Atento a diciembre</strong>
              <p>La renuncia a módulos se presenta en el modelo 036/037 en diciembre del año anterior.</p>
            </div>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔒</span>
            <div>
              <strong>La renuncia dura 3 años</strong>
              <p>Renunciar a módulos te obliga a 3 años mínimo en directa: compara más de un año.</p>
            </div>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📑</span>
            <div>
              <strong>Guarda toda la documentación</strong>
              <p>En directa necesitas justificar cada gasto. En módulos, las facturas igualmente para IVA.</p>
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
              <strong>Revisa la Orden de módulos cada año</strong>
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
            <li>Dar por hecho que un régimen es siempre más barato: depende del margen real de cada año.</li>
            <li>No comprobar si tu actividad IAE está en la Orden anual de módulos antes de elegir módulos.</li>
            <li>Renunciar a módulos, o dejarse excluir por superar los límites, sin saber que las dos cosas atan 3 años a la directa.</li>
            <li>Olvidar que en módulos el rendimiento no baja aunque el año vaya peor.</li>
            <li>Dar por hecho que el IVA sigue al IRPF: el simplificado sí va atado a módulos, pero el recargo de equivalencia del comercio minorista no depende del régimen de IRPF.</li>
            <li>Usar el rendimiento de módulos de una Orden antigua: se actualiza cada año.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-modulos-vs-directa')} />
      <ShareCard appName="simulador-modulos-vs-directa" />
      <Footer appName="simulador-modulos-vs-directa" />
    </div>
  );
}
