'use client';

import { useState, useMemo } from 'react';
import styles from './OrientadorTarifaFreelance.module.css';
import { MeskeiaLogo, Footer, NumberInput, ResultCard, EducationalSection, RelatedApps, DisclaimerCard, LegalNotice, ShareCard, RegionBadge } from '@/components';
import DataReference from '@/components/DataReference';
import { FISCAL_AUTONOMOS_META, PORCENTAJES_IVA, SECCIONES_IAE, TRAMOS_RETA_2025 } from '@/data/fiscal';
import { formatCurrency, formatNumber, parseSpanishNumber } from '@/lib';
import { calcularTarifa } from './motor';

interface GastoItem {
  id: string;
  concepto: string;
  importe: string;
}

/** «21 %» con espacio duro (CLAUDE.md §2). */
const pct = (n: number): string => `${formatNumber(n, Number.isInteger(n) ? 0 : 1)} %`;

// Retenciones de las actividades profesionales, de data/fiscal/cnae-iae.ts (sección 2.ª del IAE):
// general (art. 101.5.a LIRPF) y del año de inicio y los dos siguientes (art. 95.1 RIRPF).
const SECCION_PROFESIONAL = SECCIONES_IAE.find((s) => s.seccion === '2ª');
const RETENCION_GENERAL = SECCION_PROFESIONAL?.tipoRetencion ?? 0;
const RETENCION_INICIO = SECCION_PROFESIONAL?.tipoRetencionInicio ?? 0;

// Horquilla de cuotas de la tabla de cotización del RETA (TRAMOS_RETA_2025).
const CUOTA_RETA_MINIMA = Math.min(...TRAMOS_RETA_2025.map((t) => t.cuotaMinima));
const CUOTA_RETA_MAXIMA = Math.max(...TRAMOS_RETA_2025.map((t) => t.cuotaMaxima));

/** Lee un campo: NaN si está vacío o no es un número (un 0 es un 0, no el valor por defecto). */
const leer = (texto: string): number => parseSpanishNumber(texto);

/**
 * Un importe de gasto vacío cuenta como 0; uno que no es un número o es negativo no se suma y se
 * avisa (hallazgo 4698: un −200 restaba del total en silencio).
 */
function importeInvalido(g: GastoItem): boolean {
  if (g.importe.trim() === '') return false;
  const v = leer(g.importe);
  return Number.isNaN(v) || v < 0;
}

function importeValido(g: GastoItem): number {
  return importeInvalido(g) || g.importe.trim() === '' ? 0 : leer(g.importe);
}

export default function OrientadorTarifaFreelancePage() {
  // Estado: Ingresos objetivo
  const [ingresoNetoDeseado, setIngresoNetoDeseado] = useState('2000');

  // Estado: Gastos fijos mensuales. La cuota de autónomos no va aquí: la calcula el motor con la
  // tabla de cotización según el rendimiento (hallazgo 4693: era un literal de 300 €).
  const [gastosFijos, setGastosFijos] = useState<GastoItem[]>([
    { id: '2', concepto: 'Alquiler oficina/coworking', importe: '0' },
    { id: '3', concepto: 'Internet y teléfono', importe: '50' },
    { id: '4', concepto: 'Software y herramientas', importe: '30' },
    { id: '5', concepto: 'Seguros', importe: '25' },
  ]);

  // Estado: Gastos variables mensuales
  const [gastosVariables, setGastosVariables] = useState<GastoItem[]>([
    { id: '1', concepto: 'Material de trabajo', importe: '50' },
    { id: '2', concepto: 'Formación continua', importe: '30' },
    { id: '3', concepto: 'Marketing y publicidad', importe: '50' },
  ]);

  // Estado: Configuración trabajo
  const [horasSemanales, setHorasSemanales] = useState('40');
  const [diasVacaciones, setDiasVacaciones] = useState('22');
  const [diasFestivos, setDiasFestivos] = useState('14');
  const [diasEnfermedad, setDiasEnfermedad] = useState('5');
  const [porcentajeOcupacion, setPorcentajeOcupacion] = useState('70');

  // Estado: Impuestos. La retención solo es el pago a cuenta que adelanta el cliente: el IRPF lo
  // calcula el motor con la escala (hallazgo 4690).
  const [tipoRetencion, setTipoRetencion] = useState(String(RETENCION_GENERAL));
  const [tipoIVA, setTipoIVA] = useState(String(PORCENTAJES_IVA.general));

  // Estado: Margen
  const [margenBeneficio, setMargenBeneficio] = useState('15');

  // Funciones para gestionar gastos
  const actualizarGastoFijo = (id: string, campo: 'concepto' | 'importe', valor: string) => {
    setGastosFijos(prev => prev.map(g => g.id === id ? { ...g, [campo]: valor } : g));
  };

  const agregarGastoFijo = () => {
    const nuevoId = String(Date.now());
    setGastosFijos(prev => [...prev, { id: nuevoId, concepto: '', importe: '0' }]);
  };

  const eliminarGastoFijo = (id: string) => {
    setGastosFijos(prev => prev.filter(g => g.id !== id));
  };

  const actualizarGastoVariable = (id: string, campo: 'concepto' | 'importe', valor: string) => {
    setGastosVariables(prev => prev.map(g => g.id === id ? { ...g, [campo]: valor } : g));
  };

  const agregarGastoVariable = () => {
    const nuevoId = String(Date.now());
    setGastosVariables(prev => [...prev, { id: nuevoId, concepto: '', importe: '0' }]);
  };

  const eliminarGastoVariable = (id: string) => {
    setGastosVariables(prev => prev.filter(g => g.id !== id));
  };

  // Cálculos
  // Cálculos. Cada campo se lee con NaN si está vacío: un 0 legítimo es 0 (hallazgos 4691 y 4692:
  // `|| defecto` cambiaba el margen 0 por 15 % y el IVA exento por el 21 %).
  const calculos = useMemo(() => {
    const ingresoNeto = leer(ingresoNetoDeseado);
    const horas = leer(horasSemanales);
    const vacaciones = leer(diasVacaciones);
    const festivos = leer(diasFestivos);
    const enfermedad = leer(diasEnfermedad);
    const ocupacion = leer(porcentajeOcupacion);
    const retencion = leer(tipoRetencion);
    const iva = leer(tipoIVA);
    const margen = leer(margenBeneficio);

    const totalGastosFijos = gastosFijos.reduce((sum, g) => sum + importeValido(g), 0);
    const totalGastosVariables = gastosVariables.reduce((sum, g) => sum + importeValido(g), 0);
    const totalGastosMensuales = totalGastosFijos + totalGastosVariables;
    const hayGastoInvalido = [...gastosFijos, ...gastosVariables].some(importeInvalido);

    const problemas: string[] = [];
    if (Number.isNaN(ingresoNeto) || ingresoNeto < 0) problemas.push('el ingreso neto mensual');
    if (Number.isNaN(horas) || horas <= 0) problemas.push('las horas semanales (al menos 1)');
    if ([vacaciones, festivos, enfermedad].some((d) => Number.isNaN(d) || d < 0)) problemas.push('los días de vacaciones, festivos y enfermedad');
    if (Number.isNaN(ocupacion) || ocupacion <= 0) problemas.push('el porcentaje de ocupación facturable');
    if (Number.isNaN(margen) || margen < 0) problemas.push('el margen de seguridad');
    if (problemas.length === 0 && 365 - 104 - vacaciones - festivos - enfermedad <= 0) {
      problemas.push('los días libres (dejan el año sin días laborables)');
    }

    const resultado = problemas.length === 0
      ? calcularTarifa({
          netoMensual: ingresoNeto,
          gastosMensuales: totalGastosMensuales,
          horasSemanales: horas,
          diasVacaciones: vacaciones,
          diasFestivos: festivos,
          diasEnfermedad: enfermedad,
          ocupacion,
          iva: Number.isNaN(iva) ? 0 : iva,
          margen,
          retencion: Number.isNaN(retencion) ? 0 : retencion,
        })
      : null;

    return { totalGastosFijos, totalGastosVariables, totalGastosMensuales, hayGastoInvalido, problemas, resultado };
  }, [ingresoNetoDeseado, gastosFijos, gastosVariables, horasSemanales, diasVacaciones, diasFestivos, diasEnfermedad, porcentajeOcupacion, tipoRetencion, tipoIVA, margenBeneficio]);

  const r = calculos.resultado;
  /** Cifra para una tarjeta, o «—» si faltan datos. */
  const cifra = (valor: number | undefined, decimales: number): string => (valor === undefined ? '—' : formatNumber(valor, decimales));
  const euros = (valor: number | undefined): string => (valor === undefined ? '—' : formatCurrency(valor));
  const resumenVivo = r
    ? `Tarifa recomendada: ${formatCurrency(r.tarifaHora)} por hora, ${formatCurrency(r.tarifaDia)} por día, sin IVA.`
    : `Sin tarifa: revisa ${calculos.problemas.join(', ')}.`;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}><span aria-hidden="true">💼</span> Orientador Tarifa Freelance</h1>
        <p className={styles.subtitle}>
          Calcula tu tarifa por hora, día y semana considerando tus gastos, la cuota de autónomos, el IRPF y las vacaciones. Evita cobrar de menos.
        </p>
      </header>

      <RegionBadge variant="es-only" />

      <LegalNotice lastUpdated="2026-02-02" />

      <div className={styles.mainContent}>
        {/* Panel de configuración */}
        <div className={styles.configPanel}>

          {/* Ingreso objetivo */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}><span aria-hidden="true">🎯</span> Ingreso Neto Deseado</h2>
            <p className={styles.sectionDesc}>¿Cuánto quieres llevarte a casa cada mes después de pagar gastos e impuestos?</p>
            <NumberInput
              value={ingresoNetoDeseado}
              onChange={setIngresoNetoDeseado}
              label="Ingreso neto mensual"
              placeholder="2000"
              suffix="€/mes"
              min={0}
            />
          </section>

          {/* Gastos Fijos */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}><span aria-hidden="true">📋</span> Gastos Fijos Mensuales</h2>
            <p className={styles.sectionDesc}>Gastos que pagas cada mes independientemente de tu facturación</p>
            <p className={styles.notaCuota}>
              La cuota de autónomos no se escribe aquí: la calcula la herramienta con la tabla de cotización según el
              rendimiento que sale de tu tarifa (base mínima de su tramo). Con tarifa plana o una base más alta pagarías otra cuota.
            </p>

            <div className={styles.gastosLista}>
              {gastosFijos.map((gasto, index) => (
                <div key={gasto.id} className={styles.gastoItem}>
                  <input
                    type="text"
                    className={styles.gastoConcepto}
                    value={gasto.concepto}
                    onChange={(e) => actualizarGastoFijo(gasto.id, 'concepto', e.target.value)}
                    placeholder="Concepto"
                    aria-label={`Concepto del gasto fijo ${index + 1}`}
                  />
                  <div className={styles.gastoImporteWrapper}>
                    <input
                      type="text"
                      inputMode="decimal"
                      className={styles.gastoImporte}
                      value={gasto.importe}
                      onChange={(e) => actualizarGastoFijo(gasto.id, 'importe', e.target.value)}
                      placeholder="0"
                      aria-label={`Importe del gasto fijo ${index + 1} en euros`}
                      aria-invalid={importeInvalido(gasto)}
                      aria-describedby={importeInvalido(gasto) ? 'aviso-gastos-fijos' : undefined}
                    />
                    <span className={styles.gastoSuffix}>€</span>
                  </div>
                  <button
                    type="button"
                    className={styles.btnEliminar}
                    onClick={() => eliminarGastoFijo(gasto.id)}
                    aria-label={`Eliminar ${gasto.concepto || `gasto fijo ${index + 1}`}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button type="button" className={styles.btnAgregar} onClick={agregarGastoFijo}>
              + Añadir gasto fijo
            </button>
            <p id="aviso-gastos-fijos" className={styles.avisoGasto} role="alert">
              {gastosFijos.some(importeInvalido) ? 'Un gasto no puede ser negativo ni llevar letras: ese importe no se suma.' : ''}
            </p>
            <div className={styles.subtotal}>
              Subtotal gastos fijos: <strong>{formatCurrency(calculos.totalGastosFijos)}</strong>/mes
            </div>
          </section>

          {/* Gastos Variables */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}><span aria-hidden="true">📊</span> Gastos Variables Mensuales</h2>
            <p className={styles.sectionDesc}>Gastos que pueden variar según tu actividad</p>

            <div className={styles.gastosLista}>
              {gastosVariables.map((gasto, index) => (
                <div key={gasto.id} className={styles.gastoItem}>
                  <input
                    type="text"
                    className={styles.gastoConcepto}
                    value={gasto.concepto}
                    onChange={(e) => actualizarGastoVariable(gasto.id, 'concepto', e.target.value)}
                    placeholder="Concepto"
                    aria-label={`Concepto del gasto variable ${index + 1}`}
                  />
                  <div className={styles.gastoImporteWrapper}>
                    <input
                      type="text"
                      inputMode="decimal"
                      className={styles.gastoImporte}
                      value={gasto.importe}
                      onChange={(e) => actualizarGastoVariable(gasto.id, 'importe', e.target.value)}
                      placeholder="0"
                      aria-label={`Importe del gasto variable ${index + 1} en euros`}
                      aria-invalid={importeInvalido(gasto)}
                      aria-describedby={importeInvalido(gasto) ? 'aviso-gastos-variables' : undefined}
                    />
                    <span className={styles.gastoSuffix}>€</span>
                  </div>
                  <button
                    type="button"
                    className={styles.btnEliminar}
                    onClick={() => eliminarGastoVariable(gasto.id)}
                    aria-label={`Eliminar ${gasto.concepto || `gasto variable ${index + 1}`}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button type="button" className={styles.btnAgregar} onClick={agregarGastoVariable}>
              + Añadir gasto variable
            </button>
            <p id="aviso-gastos-variables" className={styles.avisoGasto} role="alert">
              {gastosVariables.some(importeInvalido) ? 'Un gasto no puede ser negativo ni llevar letras: ese importe no se suma.' : ''}
            </p>
            <div className={styles.subtotal}>
              Subtotal gastos variables: <strong>{formatCurrency(calculos.totalGastosVariables)}</strong>/mes
            </div>
          </section>

          {/* Configuración de trabajo */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}><span aria-hidden="true">⏰</span> Configuración de Trabajo</h2>

            <div className={styles.configGrid}>
              <NumberInput
                value={horasSemanales}
                onChange={setHorasSemanales}
                label="Horas semanales"
                placeholder="40"
                suffix="h"
                min={1}
                max={80}
                helperText="Horas que trabajas por semana"
              />
              <NumberInput
                value={diasVacaciones}
                onChange={setDiasVacaciones}
                label="Días vacaciones/año"
                placeholder="22"
                min={0}
                max={60}
              />
              <NumberInput
                value={diasFestivos}
                onChange={setDiasFestivos}
                label="Días festivos/año"
                placeholder="14"
                min={0}
                max={20}
              />
              <NumberInput
                value={diasEnfermedad}
                onChange={setDiasEnfermedad}
                label="Días enfermedad/año"
                placeholder="5"
                min={0}
                max={30}
                helperText="Previsión días baja"
              />
              <NumberInput
                value={porcentajeOcupacion}
                onChange={setPorcentajeOcupacion}
                label="% Ocupación facturable"
                placeholder="70"
                suffix="%"
                min={10}
                max={100}
                helperText="% tiempo que facturas (resto: admin, comercial)"
              />
            </div>
          </section>

          {/* Impuestos */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}><span aria-hidden="true">🏛️</span> Impuestos</h2>

            <div className={styles.configGrid}>
              <div className={styles.selectGroup}>
                <label htmlFor="tipo-retencion" className={styles.selectLabel}>Retención de IRPF en tus facturas</label>
                <select
                  id="tipo-retencion"
                  className={styles.select}
                  value={tipoRetencion}
                  onChange={(e) => setTipoRetencion(e.target.value)}
                  aria-describedby="nota-retencion"
                >
                  <option value={String(RETENCION_GENERAL)}>{pct(RETENCION_GENERAL)} (actividad profesional, con carácter general)</option>
                  <option value={String(RETENCION_INICIO)}>{pct(RETENCION_INICIO)} (año de inicio de la actividad y los dos siguientes)</option>
                  <option value="0">{pct(0)} (sin retención: actividad empresarial o clientes particulares)</option>
                </select>
              </div>
              <div className={styles.selectGroup}>
                <label htmlFor="tipo-iva" className={styles.selectLabel}>Tipo IVA</label>
                <select
                  id="tipo-iva"
                  className={styles.select}
                  value={tipoIVA}
                  onChange={(e) => setTipoIVA(e.target.value)}
                >
                  <option value={String(PORCENTAJES_IVA.general)}>{pct(PORCENTAJES_IVA.general)} (General)</option>
                  <option value={String(PORCENTAJES_IVA.reducido)}>{pct(PORCENTAJES_IVA.reducido)} (Reducido)</option>
                  <option value={String(PORCENTAJES_IVA.superreducido)}>{pct(PORCENTAJES_IVA.superreducido)} (Superreducido)</option>
                  <option value="0">{pct(0)} (Exento)</option>
                </select>
              </div>
            </div>
            <p id="nota-retencion" className={styles.notaCuota}>
              La retención es un pago a cuenta: el cliente adelanta ese IRPF a Hacienda y se descuenta en tu declaración.
              No cambia la tarifa. El IRPF del año lo calcula la herramienta con la escala por tramos y el mínimo personal
              (estimación directa simplificada), sin la reducción por inicio de actividad, mínimos familiares ni deducciones.
            </p>
          </section>

          {/* Margen */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}><span aria-hidden="true">📈</span> Margen de Beneficio</h2>
            <p className={styles.sectionDesc}>Porcentaje extra para imprevistos, ahorro e inversión</p>
            <NumberInput
              value={margenBeneficio}
              onChange={setMargenBeneficio}
              label="Margen de seguridad"
              placeholder="15"
              suffix="%"
              min={0}
              max={100}
              helperText={'Recomendado: 10-20 % para imprevistos'}
            />
          </section>
        </div>

        {/* Panel de resultados */}
        {/* La región viva es solo el resumen de una línea: el panel entero (unos 500 caracteres)
            se releía en cada pulsación (hallazgo 4699). */}
        <section className={styles.resultsPanel} aria-labelledby="titulo-resultados">
          <h2 id="titulo-resultados" className={styles.resultsTitleMain}><span aria-hidden="true">📊</span> Tu Tarifa Recomendada</h2>
          <p className={styles.resumenVivo} role="status" aria-live="polite">{resumenVivo}</p>

          {/* Tarifas principales */}
          <div className={styles.tarifasPrincipales}>
            <ResultCard
              title="Tarifa por Hora"
              value={cifra(r?.tarifaHora, 2)}
              unit={r ? '€/h' : ''}
              variant="highlight"
              icon="⏱️"
              description={`Con IVA: ${euros(r?.tarifaHoraConIVA)}/h`}
            />
            <ResultCard
              title="Tarifa por Día"
              value={cifra(r?.tarifaDia, 2)}
              unit={r ? '€/día' : ''}
              variant="highlight"
              icon="📅"
              description={`Con IVA: ${euros(r?.tarifaDiaConIVA)}/día`}
            />
            <ResultCard
              title="Tarifa por Semana"
              value={cifra(r?.tarifaSemana, 2)}
              unit={r ? '€/sem' : ''}
              variant="info"
              icon="📆"
              description={`Con IVA: ${euros(r?.tarifaSemanaConIVA)}/sem`}
            />
          </div>

          {/* Desglose mensual */}
          <div className={styles.desglose}>
            <h3 className={styles.desgloseTitle}><span aria-hidden="true">📋</span> Desglose Mensual</h3>
            <div className={styles.desgloseGrid}>
              <div className={styles.desgloseItem}>
                <span className={styles.desgloseLabel}>Facturación necesaria</span>
                <span className={styles.desgloseValue}>{euros(r?.facturacionMensual)}</span>
              </div>
              <div className={styles.desgloseItem}>
                <span className={styles.desgloseLabel}>Gastos de la actividad</span>
                <span className={styles.desgloseValue}>-{formatCurrency(calculos.totalGastosMensuales)}</span>
              </div>
              <div className={styles.desgloseItem}>
                <span className={styles.desgloseLabel}>Cuota de autónomos</span>
                <span className={styles.desgloseValue}>-{euros(r?.cuotaMensual)}</span>
              </div>
              <div className={styles.desgloseItem}>
                <span className={styles.desgloseLabel}>IRPF (promedio mensual)</span>
                <span className={styles.desgloseValue}>-{euros(r ? r.irpfAnual / 12 : undefined)}</span>
              </div>
              <div className={styles.desgloseItem}>
                <span className={styles.desgloseLabel}>Retención que adelanta el cliente</span>
                <span className={styles.desgloseValue}>{euros(r?.retencionMensual)}</span>
              </div>
              <div className={styles.desgloseItem}>
                <span className={styles.desgloseLabel}>Horas facturables/mes</span>
                <span className={styles.desgloseValue}>{cifra(r?.horasFacturablesMes, 1)} h</span>
              </div>
              <div className={styles.desgloseItem}>
                <span className={styles.desgloseLabel}>Días facturables/mes</span>
                <span className={styles.desgloseValue}>{cifra(r?.diasFacturablesMes, 1)} días</span>
              </div>
            </div>
          </div>

          {/* Resumen anual */}
          <div className={styles.resumenAnual}>
            <h3 className={styles.desgloseTitle}><span aria-hidden="true">📊</span> Proyección Anual</h3>
            <div className={styles.resumenGrid}>
              <ResultCard
                title="Facturación Anual"
                value={cifra(r?.facturacionAnual, 0)}
                unit={r ? '€' : ''}
                variant="default"
                icon="💵"
              />
              <ResultCard
                title="Gastos y Cuota Anuales"
                value={cifra(r ? (calculos.totalGastosMensuales + r.cuotaMensual) * 12 : undefined, 0)}
                unit={r ? '€' : ''}
                variant="warning"
                icon="📉"
              />
              <ResultCard
                title="IRPF Estimado"
                value={cifra(r?.irpfAnual, 0)}
                unit={r ? '€' : ''}
                variant="warning"
                icon="🏛️"
                description="Escala por tramos con el mínimo personal"
              />
              <ResultCard
                title="Beneficio Neto"
                value={cifra(r?.netoAnual, 0)}
                unit={r ? '€' : ''}
                variant="success"
                icon="✅"
                description={`${euros(r ? r.netoAnual / 12 : undefined)}/mes`}
              />
            </div>
          </div>

          {/* Días laborables */}
          <div className={styles.diasInfo}>
            <h3 className={styles.desgloseTitle}><span aria-hidden="true">📅</span> Días de Trabajo al Año</h3>
            <div className={styles.diasGrid}>
              <div className={styles.diaItem}>
                <span className={styles.diaNumero}>{cifra(r?.diasLaborablesAno, 0)}</span>
                <span className={styles.diaLabel}>Días laborables</span>
              </div>
              <div className={styles.diaItem}>
                <span className={styles.diaNumero}>{cifra(r?.diasFacturablesAno, 0)}</span>
                <span className={styles.diaLabel}>Días facturables</span>
              </div>
              <div className={styles.diaItem}>
                <span className={styles.diaNumero}>{cifra(r?.horasFacturablesAno, 0)}</span>
                <span className={styles.diaLabel}>Horas facturables</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <DisclaimerCard
        variant="financial"
        severity="critical"
        context="orientador-tarifa-freelance"
        collapsible={false}
      />
      <DataReference
        normativa="RETA / IRPF 2025"
        fuente={FISCAL_AUTONOMOS_META.fuente}
        verificado={FISCAL_AUTONOMOS_META.verificado}
        urlOficial={FISCAL_AUTONOMOS_META.urlOficial}
      />



      {/* Contenido educativo v2.0 */}
      <EducationalSection title="Guía completa: cómo fijar tu tarifa freelance" subtitle="Métodos, estrategias y errores a evitar para cobrar lo que mereces" defaultOpen={false}>
        {/* 1. TABLA COMPARATIVA */}
        <div className={styles.eduComparativa}>
          <h2>Métodos para calcular tu tarifa freelance</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Método</th>
                  <th>Cómo funciona</th>
                  <th>Ventajas</th>
                  <th>Desventajas</th>
                  <th>Mejor para</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Por hora</td>
                  <td>Precio fijo × horas trabajadas</td>
                  <td>Simple, justo, fácil de ajustar</td>
                  <td>Penaliza la eficiencia, techo de ingresos</td>
                  <td>Proyectos variables, nuevos clientes</td>
                </tr>
                <tr>
                  <td>Por proyecto</td>
                  <td>Precio cerrado por entregable</td>
                  <td>Predecible, escalable, premia eficiencia</td>
                  <td>Riesgo de scope creep</td>
                  <td>Proyectos bien definidos</td>
                </tr>
                <tr>
                  <td>Por valor</td>
                  <td>% del valor que generas al cliente</td>
                  <td>Máximo potencial de ingresos</td>
                  <td>Difícil de justificar, requiere confianza</td>
                  <td>Consultores senior, resultados medibles</td>
                </tr>
                <tr>
                  <td>Retainer mensual</td>
                  <td>Tarifa fija por disponibilidad mensual</td>
                  <td>Ingresos recurrentes, estabilidad</td>
                  <td>Requiere gestión de límites</td>
                  <td>Relaciones a largo plazo</td>
                </tr>
                <tr>
                  <td>Day rate</td>
                  <td>Precio por jornada completa (8h)</td>
                  <td>Estándar en consultoría, fácil negociación</td>
                  <td>Menos flexible que por hora</td>
                  <td>Consultoría, formación, agencias</td>
                </tr>
                <tr>
                  <td>Mixto</td>
                  <td>Combinación de métodos según fase</td>
                  <td>Maximiza ingresos en cada etapa</td>
                  <td>Complejo de gestionar y comunicar</td>
                  <td>Proyectos grandes con fases diferenciadas</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. ESCENARIOS */}
        <div className={styles.eduEscenarios}>
          <h2>Ejemplos reales por perfil profesional</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🎨</span>
                <h3>Diseñador UX/UI (5 años)</h3>
              </div>
              <p className={styles.escenarioExample}>Tarifa hora: 45-65 €. Day rate: 360-520 €. Portfolio con casos de impacto medible.</p>
              <span className={styles.escenarioTip}>Muestra portfolio con ROI</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">💻</span>
                <h3>Desarrollador Full Stack senior</h3>
              </div>
              <p className={styles.escenarioExample}>Tarifa hora: 65-95 €. Day rate: 520-760 €. GitHub activo con proyectos propios.</p>
              <span className={styles.escenarioTip}>GitHub activo = poder de negociación</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">✍️</span>
                <h3>Copywriter especializado</h3>
              </div>
              <p className={styles.escenarioExample}>Tarifa hora: 35-55 €. Por proyecto según entregable. Nicho definido = premium.</p>
              <span className={styles.escenarioTip}>Especialización = tarifa 2x</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">📈</span>
                <h3>Consultor de marketing digital</h3>
              </div>
              <p className={styles.escenarioExample}>Tarifa hora: 55-80 €. Retainer mensual: 1.500-3.000 €. Ingresos recurrentes estables.</p>
              <span className={styles.escenarioTip}>Propón retainer desde el inicio</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">📷</span>
                <h3>Fotógrafo/Videógrafo</h3>
              </div>
              <p className={styles.escenarioExample}>Por proyecto: 300-2.500 €. Licencias de uso añaden valor significativo al precio base.</p>
              <span className={styles.escenarioTip}>Licencias de uso aumentan precio</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">⚖️</span>
                <h3>Abogado/Asesor legal</h3>
              </div>
              <p className={styles.escenarioExample}>Tarifa hora: 90-150 €. Por consulta o proyecto. Prestigio justifica tarifas premium.</p>
              <span className={styles.escenarioTip}>El prestigio justifica la tarifa premium</span>
            </div>
          </div>
        </div>

        {/* 3. FAQ */}
        <div className={styles.eduFaq}>
          <h2>Preguntas frecuentes sobre tarifas freelance</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Cómo negocio si el cliente dice que soy caro?</h4>
              <p>Justifica con valor, no bajes el precio: ofrece reducir alcance manteniendo tu tarifa. El precio refleja tu profesionalidad y experiencia.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Debo incluir impuestos en mi tarifa?</h4>
              <p>Trabaja siempre con tarifas sin IVA. El IVA (normalmente el {pct(PORCENTAJES_IVA.general)}) lo paga el cliente y tú lo ingresas en Hacienda: no es tu ingreso. Preséntalo siempre por separado en tus presupuestos.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cuál es la diferencia entre tarifa bruta y neta?</h4>
              <p>La bruta incluye el IRPF (por tramos, según tu rendimiento) y la cuota de autónomo (variable según los rendimientos reales: de {formatCurrency(CUOTA_RETA_MINIMA)} a {formatCurrency(CUOTA_RETA_MAXIMA)} al mes en la tabla de cotización vigente). La neta es lo que realmente ingresas tras pagar impuestos y cuota de autónomo.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cuándo y cuánto debo subir mi tarifa?</h4>
              <p>Cada 12-18 meses o tras certificaciones y casos de éxito. Subidas graduales del 10-20&nbsp;% son más fáciles de aceptar que incrementos bruscos.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cómo facturo a clientes en el extranjero?</h4>
              <p>UE: sin IVA con inversión sujeto pasivo (VAT number del cliente). Fuera UE: sin IVA con justificante de exportación de servicios.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué costes debo incluir en mi tarifa?</h4>
              <p>Cuota autónomo, IRPF estimado, material, formación, software, seguros, y también el tiempo de ventas y administración (20-30&nbsp;% de tu jornada).</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Bajo la tarifa para conseguir el primer cliente?</h4>
              <p>Una vez, máximo 20&nbsp;%, con fecha de revisión acordada por escrito. Nunca como norma habitual: devalúa tu trabajo y crea expectativas incorrectas.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué tarifa cobran otros en mi sector?</h4>
              <p>Benchmarks 2026: dev junior 25-40 €/h, senior 65-95 €/h, diseñador 35-65 €/h, consultor 55-90 €/h. Consulta LinkedIn, Malt y Workana para tu perfil.</p>
            </div>
          </div>
        </div>

        {/* 4. GUÍA PASO A PASO */}
        <div className={styles.eduGuia}>
          <h2>Cómo fijar tu tarifa en 7 pasos</h2>
          <div className={styles.stepGuide}>
            <div className={styles.eduStep}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Calcula tu coste mínimo vital</strong>
                <p>Suma todos tus gastos mensuales personales: alquiler, comida, seguros de salud, transporte, ocio y ahorro mínimo de emergencia.</p>
              </div>
            </div>
            <div className={styles.eduStep}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Añade costes de autónomo</strong>
                <p>Cuota de Seguridad Social (desde {formatCurrency(CUOTA_RETA_MINIMA)} al mes en la tabla de cotización vigente, variable según los rendimientos reales), el IRPF que corresponda a tu rendimiento y la gestoría (unos 100 €/mes). Son gastos inevitables.</p>
              </div>
            </div>
            <div className={styles.eduStep}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Determina horas facturables reales</strong>
                <p>De 160 h/mes, solo el 60-80&nbsp;% son facturables. El resto se va en ventas, administración, formación y comunicación con clientes.</p>
              </div>
            </div>
            <div className={styles.eduStep}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Calcula tu tarifa mínima</strong>
                <p>Divide tus gastos totales mensuales entre las horas facturables. Ese resultado es tu tarifa mínima de supervivencia: nunca cobres por debajo.</p>
              </div>
            </div>
            <div className={styles.eduStep}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Investiga el mercado</strong>
                <p>Consulta LinkedIn, Workana, InfoJobs y foros de tu sector para conocer los rangos reales de tarifas en tu perfil y especialidad.</p>
              </div>
            </div>
            <div className={styles.eduStep}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <strong>Añade margen de beneficio</strong>
                <p>Suma un 30-50&nbsp;% sobre tu mínimo para reinversión, ahorro a largo plazo, vacaciones e imprevistos. No es lujo, es gestión empresarial.</p>
              </div>
            </div>
            <div className={styles.eduStep}>
              <div className={styles.stepNumber}>7</div>
              <div className={styles.stepContent}>
                <strong>Valida y ajusta</strong>
                <p>Presenta presupuesto a 3-5 clientes potenciales. Si todos aceptan inmediatamente sin negociar, es señal clara de que puedes subir tu tarifa.</p>
              </div>
            </div>
          </div>
        </div>

        {/* 5. TIPS */}
        <div className={styles.eduTips}>
          <h2>Consejos para negociar tu tarifa</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">💼</span>
              <strong>Especialízate para cobrar más</strong>
              <p>Los generalistas compiten por precio; los especialistas compiten por valor. Define tu nicho y domínalo.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📊</span>
              <strong>Documenta tus resultados</strong>
              <p>Casos de éxito con números ("aumenté conversiones un 40&nbsp;%") justifican tarifas altas mejor que cualquier argumento.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🤝</span>
              <strong>Negocia el alcance, no el precio</strong>
              <p>Si piden descuento, reduce entregables. Mantén tu tarifa hora intacta para no devaluar tu trabajo.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📅</span>
              <strong>Ofrece pago anticipado con descuento</strong>
              <p>Un 5&nbsp;% de descuento por pago 100&nbsp;% adelantado mejora tu cashflow y reduce riesgo de impago.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🌍</span>
              <strong>Trabaja con clientes internacionales</strong>
              <p>Mismo trabajo, tarifas 2-3x más altas en mercados como UK, DACH o USA. El remoto lo hace posible.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📝</span>
              <strong>Contrato siempre, sin excepción</strong>
              <p>Acuerdo escrito con scope, tarifa, revisiones y condiciones de pago protege tu tarifa y tu negocio.</p>
            </div>
          </div>
        </div>

        {/* 6. WARNING BOX */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>Errores críticos al fijar tu tarifa freelance</strong>
          </div>
          <ul className={styles.warningList}>
            <li>Calcular solo las horas de trabajo directo e ignorar tiempo de ventas, reuniones y administración (20-30&nbsp;% del tiempo real).</li>
            <li>No actualizar la tarifa durante años mientras tus gastos e inflación aumentan cada ejercicio.</li>
            <li>Aceptar pagos sin contrato "para no complicarlo": imposible reclamar si el cliente no paga.</li>
            <li>Dar descuentos como norma sin reducir el alcance del proyecto: devalúa tu trabajo ante el cliente.</li>
            <li>No cobrar por revisiones extra fuera del alcance acordado (scope creep sin facturar).</li>
            <li>Cotizar sin conocer el presupuesto del cliente: podrías quedarte muy por debajo de lo que pagarían.</li>
            <li>Trabajar sin factura "para ahorrar impuestos": riesgo de sanción de Hacienda y sin protección legal.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps />

      <ShareCard appName="orientador-tarifa-freelance" />
      <Footer appName="orientador-tarifa-freelance" />
    </div>
  );
}
