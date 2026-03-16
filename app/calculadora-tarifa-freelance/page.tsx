'use client';

import { useState, useMemo } from 'react';
import styles from './CalculadoraTarifaFreelance.module.css';
import { MeskeiaLogo, Footer, NumberInput, ResultCard, EducationalSection, RelatedApps, DisclaimerCard, LegalNotice, ShareCard } from '@/components';
import { formatCurrency, formatNumber, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

interface GastoItem {
  id: string;
  concepto: string;
  importe: string;
}

export default function CalculadoraTarifaFreelancePage() {
  // Estado: Ingresos objetivo
  const [ingresoNetoDeseado, setIngresoNetoDeseado] = useState('2000');

  // Estado: Gastos fijos mensuales
  const [gastosFijos, setGastosFijos] = useState<GastoItem[]>([
    { id: '1', concepto: 'Cuota autónomos', importe: '300' },
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

  // Estado: Impuestos
  const [tipoIRPF, setTipoIRPF] = useState('21');
  const [tipoIVA, setTipoIVA] = useState('21');

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
  const calculos = useMemo(() => {
    const ingresoNeto = parseSpanishNumber(ingresoNetoDeseado) || 0;
    const horas = parseSpanishNumber(horasSemanales) || 40;
    const vacaciones = parseSpanishNumber(diasVacaciones) || 22;
    const festivos = parseSpanishNumber(diasFestivos) || 14;
    const enfermedad = parseSpanishNumber(diasEnfermedad) || 5;
    const ocupacion = (parseSpanishNumber(porcentajeOcupacion) || 70) / 100;
    const irpf = (parseSpanishNumber(tipoIRPF) || 21) / 100;
    const iva = (parseSpanishNumber(tipoIVA) || 21) / 100;
    const margen = (parseSpanishNumber(margenBeneficio) || 15) / 100;

    // Total gastos mensuales
    const totalGastosFijos = gastosFijos.reduce((sum, g) => sum + (parseSpanishNumber(g.importe) || 0), 0);
    const totalGastosVariables = gastosVariables.reduce((sum, g) => sum + (parseSpanishNumber(g.importe) || 0), 0);
    const totalGastosMensuales = totalGastosFijos + totalGastosVariables;

    // Días laborables reales al año
    const diasLaborablesAno = 365 - (52 * 2) - vacaciones - festivos - enfermedad; // 365 - fines de semana - vacaciones - festivos - enfermedad
    const diasFacturablesAno = diasLaborablesAno * ocupacion;
    const diasFacturablesMes = diasFacturablesAno / 12;

    // Horas facturables
    const horasDia = horas / 5; // Horas por día laboral
    const horasFacturablesAno = diasFacturablesAno * horasDia;
    const horasFacturablesMes = horasFacturablesAno / 12;

    // Ingresos brutos necesarios (antes de IRPF)
    // Fórmula: Bruto = (Neto deseado + Gastos) / (1 - IRPF) * (1 + Margen)
    const baseNecesariaMensual = ingresoNeto + totalGastosMensuales;
    const brutoAntesIRPFMensual = baseNecesariaMensual / (1 - irpf);
    const brutoConMargenMensual = brutoAntesIRPFMensual * (1 + margen);

    // Tarifas
    const tarifaHora = horasFacturablesMes > 0 ? brutoConMargenMensual / horasFacturablesMes : 0;
    const tarifaDia = diasFacturablesMes > 0 ? brutoConMargenMensual / diasFacturablesMes : 0;
    const tarifaSemana = tarifaDia * 5;

    // Con IVA
    const tarifaHoraConIVA = tarifaHora * (1 + iva);
    const tarifaDiaConIVA = tarifaDia * (1 + iva);
    const tarifaSemanaConIVA = tarifaSemana * (1 + iva);

    // Anuales
    const facturacionAnual = brutoConMargenMensual * 12;
    const gastosAnuales = totalGastosMensuales * 12;
    // IRPF se aplica sobre el rendimiento neto (facturación - gastos deducibles), no sobre la facturación bruta
    const rendimientoNetoAnual = facturacionAnual - gastosAnuales;
    const irpfAnual = rendimientoNetoAnual * irpf;
    const beneficioNetoAnual = facturacionAnual - gastosAnuales - irpfAnual;

    return {
      totalGastosFijos,
      totalGastosVariables,
      totalGastosMensuales,
      diasLaborablesAno,
      diasFacturablesAno,
      diasFacturablesMes,
      horasFacturablesAno,
      horasFacturablesMes,
      brutoConMargenMensual,
      tarifaHora,
      tarifaDia,
      tarifaSemana,
      tarifaHoraConIVA,
      tarifaDiaConIVA,
      tarifaSemanaConIVA,
      facturacionAnual,
      gastosAnuales,
      irpfAnual,
      beneficioNetoAnual,
    };
  }, [ingresoNetoDeseado, gastosFijos, gastosVariables, horasSemanales, diasVacaciones, diasFestivos, diasEnfermedad, porcentajeOcupacion, tipoIRPF, tipoIVA, margenBeneficio]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>💼 Calculadora Tarifa Freelance</h1>
        <p className={styles.subtitle}>
          Calcula tu tarifa por hora, día y proyecto considerando todos tus gastos, impuestos y vacaciones. Evita cobrar de menos.
        </p>
      </header>

      <LegalNotice lastUpdated="2026-02-02" />

      <div className={styles.mainContent}>
        {/* Panel de configuración */}
        <div className={styles.configPanel}>

          {/* Ingreso objetivo */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>🎯 Ingreso Neto Deseado</h2>
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
            <h2 className={styles.sectionTitle}>📋 Gastos Fijos Mensuales</h2>
            <p className={styles.sectionDesc}>Gastos que pagas cada mes independientemente de tu facturación</p>

            <div className={styles.gastosLista}>
              {gastosFijos.map((gasto) => (
                <div key={gasto.id} className={styles.gastoItem}>
                  <input
                    type="text"
                    className={styles.gastoConcepto}
                    value={gasto.concepto}
                    onChange={(e) => actualizarGastoFijo(gasto.id, 'concepto', e.target.value)}
                    placeholder="Concepto"
                  />
                  <div className={styles.gastoImporteWrapper}>
                    <input
                      type="text"
                      className={styles.gastoImporte}
                      value={gasto.importe}
                      onChange={(e) => actualizarGastoFijo(gasto.id, 'importe', e.target.value)}
                      placeholder="0"
                    />
                    <span className={styles.gastoSuffix}>€</span>
                  </div>
                  <button
                    type="button"
                    className={styles.btnEliminar}
                    onClick={() => eliminarGastoFijo(gasto.id)}
                    title="Eliminar gasto"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button type="button" className={styles.btnAgregar} onClick={agregarGastoFijo}>
              + Añadir gasto fijo
            </button>
            <div className={styles.subtotal}>
              Subtotal gastos fijos: <strong>{formatCurrency(calculos.totalGastosFijos)}</strong>/mes
            </div>
          </section>

          {/* Gastos Variables */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>📊 Gastos Variables Mensuales</h2>
            <p className={styles.sectionDesc}>Gastos que pueden variar según tu actividad</p>

            <div className={styles.gastosLista}>
              {gastosVariables.map((gasto) => (
                <div key={gasto.id} className={styles.gastoItem}>
                  <input
                    type="text"
                    className={styles.gastoConcepto}
                    value={gasto.concepto}
                    onChange={(e) => actualizarGastoVariable(gasto.id, 'concepto', e.target.value)}
                    placeholder="Concepto"
                  />
                  <div className={styles.gastoImporteWrapper}>
                    <input
                      type="text"
                      className={styles.gastoImporte}
                      value={gasto.importe}
                      onChange={(e) => actualizarGastoVariable(gasto.id, 'importe', e.target.value)}
                      placeholder="0"
                    />
                    <span className={styles.gastoSuffix}>€</span>
                  </div>
                  <button
                    type="button"
                    className={styles.btnEliminar}
                    onClick={() => eliminarGastoVariable(gasto.id)}
                    title="Eliminar gasto"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button type="button" className={styles.btnAgregar} onClick={agregarGastoVariable}>
              + Añadir gasto variable
            </button>
            <div className={styles.subtotal}>
              Subtotal gastos variables: <strong>{formatCurrency(calculos.totalGastosVariables)}</strong>/mes
            </div>
          </section>

          {/* Configuración de trabajo */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>⏰ Configuración de Trabajo</h2>

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
            <h2 className={styles.sectionTitle}>🏛️ Impuestos</h2>

            <div className={styles.configGrid}>
              <div className={styles.selectGroup}>
                <label className={styles.selectLabel}>Retención IRPF</label>
                <select
                  className={styles.select}
                  value={tipoIRPF}
                  onChange={(e) => setTipoIRPF(e.target.value)}
                >
                  <option value="7">7% (Nuevos autónomos - 2 primeros años)</option>
                  <option value="15">15% (Reducido)</option>
                  <option value="21">21% (General)</option>
                </select>
              </div>
              <div className={styles.selectGroup}>
                <label className={styles.selectLabel}>Tipo IVA</label>
                <select
                  className={styles.select}
                  value={tipoIVA}
                  onChange={(e) => setTipoIVA(e.target.value)}
                >
                  <option value="21">21% (General)</option>
                  <option value="10">10% (Reducido)</option>
                  <option value="4">4% (Superreducido)</option>
                  <option value="0">0% (Exento)</option>
                </select>
              </div>
            </div>
          </section>

          {/* Margen */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>📈 Margen de Beneficio</h2>
            <p className={styles.sectionDesc}>Porcentaje extra para imprevistos, ahorro e inversión</p>
            <NumberInput
              value={margenBeneficio}
              onChange={setMargenBeneficio}
              label="Margen de seguridad"
              placeholder="15"
              suffix="%"
              min={0}
              max={100}
              helperText="Recomendado: 10-20% para imprevistos"
            />
          </section>
        </div>

        {/* Panel de resultados */}
        <div className={styles.resultsPanel}>
          <h2 className={styles.resultsTitleMain}>📊 Tu Tarifa Recomendada</h2>

          {/* Tarifas principales */}
          <div className={styles.tarifasPrincipales}>
            <ResultCard
              title="Tarifa por Hora"
              value={formatNumber(calculos.tarifaHora, 2)}
              unit="€/h"
              variant="highlight"
              icon="⏱️"
              description={`Con IVA: ${formatCurrency(calculos.tarifaHoraConIVA)}/h`}
            />
            <ResultCard
              title="Tarifa por Día"
              value={formatNumber(calculos.tarifaDia, 2)}
              unit="€/día"
              variant="highlight"
              icon="📅"
              description={`Con IVA: ${formatCurrency(calculos.tarifaDiaConIVA)}/día`}
            />
            <ResultCard
              title="Tarifa por Semana"
              value={formatNumber(calculos.tarifaSemana, 2)}
              unit="€/sem"
              variant="info"
              icon="📆"
              description={`Con IVA: ${formatCurrency(calculos.tarifaSemanaConIVA)}/sem`}
            />
          </div>

          {/* Desglose mensual */}
          <div className={styles.desglose}>
            <h3 className={styles.desgloseTitle}>📋 Desglose Mensual</h3>
            <div className={styles.desgloseGrid}>
              <div className={styles.desgloseItem}>
                <span className={styles.desgloseLabel}>Facturación necesaria</span>
                <span className={styles.desgloseValue}>{formatCurrency(calculos.brutoConMargenMensual)}</span>
              </div>
              <div className={styles.desgloseItem}>
                <span className={styles.desgloseLabel}>Total gastos</span>
                <span className={styles.desgloseValue}>-{formatCurrency(calculos.totalGastosMensuales)}</span>
              </div>
              <div className={styles.desgloseItem}>
                <span className={styles.desgloseLabel}>Horas facturables/mes</span>
                <span className={styles.desgloseValue}>{formatNumber(calculos.horasFacturablesMes, 1)} h</span>
              </div>
              <div className={styles.desgloseItem}>
                <span className={styles.desgloseLabel}>Días facturables/mes</span>
                <span className={styles.desgloseValue}>{formatNumber(calculos.diasFacturablesMes, 1)} días</span>
              </div>
            </div>
          </div>

          {/* Resumen anual */}
          <div className={styles.resumenAnual}>
            <h3 className={styles.desgloseTitle}>📊 Proyección Anual</h3>
            <div className={styles.resumenGrid}>
              <ResultCard
                title="Facturación Anual"
                value={formatNumber(calculos.facturacionAnual, 0)}
                unit="€"
                variant="default"
                icon="💵"
              />
              <ResultCard
                title="Gastos Anuales"
                value={formatNumber(calculos.gastosAnuales, 0)}
                unit="€"
                variant="warning"
                icon="📉"
              />
              <ResultCard
                title="IRPF Estimado"
                value={formatNumber(calculos.irpfAnual, 0)}
                unit="€"
                variant="warning"
                icon="🏛️"
              />
              <ResultCard
                title="Beneficio Neto"
                value={formatNumber(calculos.beneficioNetoAnual, 0)}
                unit="€"
                variant="success"
                icon="✅"
                description={`${formatCurrency(calculos.beneficioNetoAnual / 12)}/mes`}
              />
            </div>
          </div>

          {/* Días laborables */}
          <div className={styles.diasInfo}>
            <h3 className={styles.desgloseTitle}>📅 Días de Trabajo al Año</h3>
            <div className={styles.diasGrid}>
              <div className={styles.diaItem}>
                <span className={styles.diaNumero}>{formatNumber(calculos.diasLaborablesAno, 0)}</span>
                <span className={styles.diaLabel}>Días laborables</span>
              </div>
              <div className={styles.diaItem}>
                <span className={styles.diaNumero}>{formatNumber(calculos.diasFacturablesAno, 0)}</span>
                <span className={styles.diaLabel}>Días facturables</span>
              </div>
              <div className={styles.diaItem}>
                <span className={styles.diaNumero}>{formatNumber(calculos.horasFacturablesAno, 0)}</span>
                <span className={styles.diaLabel}>Horas facturables</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DisclaimerCard
        variant="financial"
        severity="high"
        context="calculadora-tarifa-freelance"
        collapsible={false}
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
                <span className={styles.escenarioIcon}>🎨</span>
                <h3>Diseñador UX/UI (5 años)</h3>
              </div>
              <p className={styles.escenarioExample}>Tarifa hora: 45-65 €. Day rate: 360-520 €. Portfolio con casos de impacto medible.</p>
              <span className={styles.escenarioTip}>Muestra portfolio con ROI</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>💻</span>
                <h3>Desarrollador Full Stack senior</h3>
              </div>
              <p className={styles.escenarioExample}>Tarifa hora: 65-95 €. Day rate: 520-760 €. GitHub activo con proyectos propios.</p>
              <span className={styles.escenarioTip}>GitHub activo = poder de negociación</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>✍️</span>
                <h3>Copywriter especializado</h3>
              </div>
              <p className={styles.escenarioExample}>Tarifa hora: 35-55 €. Por proyecto según entregable. Nicho definido = premium.</p>
              <span className={styles.escenarioTip}>Especialización = tarifa 2x</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>📈</span>
                <h3>Consultor de marketing digital</h3>
              </div>
              <p className={styles.escenarioExample}>Tarifa hora: 55-80 €. Retainer mensual: 1.500-3.000 €. Ingresos recurrentes estables.</p>
              <span className={styles.escenarioTip}>Propón retainer desde el inicio</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>📷</span>
                <h3>Fotógrafo/Videógrafo</h3>
              </div>
              <p className={styles.escenarioExample}>Por proyecto: 300-2.500 €. Licencias de uso añaden valor significativo al precio base.</p>
              <span className={styles.escenarioTip}>Licencias de uso aumentan precio</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>⚖️</span>
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
              <p>Trabaja siempre con tarifas netas. El IVA (21%) es un impuesto del cliente, no tu ingreso. Preséntalo siempre por separado en tus presupuestos.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cuál es la diferencia entre tarifa bruta y neta?</h4>
              <p>La bruta incluye IRPF (~15-20%) y cotización autónomo (cuota variable según ingresos reales: 204-1.478 €/mes en 2026). La neta es lo que realmente ingresas tras pagar impuestos y cuota de autónomo.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cuándo y cuánto debo subir mi tarifa?</h4>
              <p>Cada 12-18 meses o tras certificaciones y casos de éxito. Subidas graduales del 10-20% son más fáciles de aceptar que incrementos bruscos.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cómo facturo a clientes en el extranjero?</h4>
              <p>UE: sin IVA con inversión sujeto pasivo (VAT number del cliente). Fuera UE: sin IVA con justificante de exportación de servicios.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué costes debo incluir en mi tarifa?</h4>
              <p>Cuota autónomo, IRPF estimado, material, formación, software, seguros, y también el tiempo de ventas y administración (20-30% de tu jornada).</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Bajo la tarifa para conseguir el primer cliente?</h4>
              <p>Una vez, máximo 20%, con fecha de revisión acordada por escrito. Nunca como norma habitual: devalúa tu trabajo y crea expectativas incorrectas.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué tarifa cobran otros en mi sector?</h4>
              <p>Benchmarks 2025: dev junior 25-40 €/h, senior 65-95 €/h, diseñador 35-65 €/h, consultor 55-90 €/h. Consulta LinkedIn, Malt y Workana para tu perfil.</p>
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
                <p>Cuota de Seguridad Social (mínimo ~204 €/mes en 2026, variable según ingresos reales), IRPF estimado (15-20% los primeros años) y gestoría (~100 €/mes). Son gastos inevitables.</p>
              </div>
            </div>
            <div className={styles.eduStep}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Determina horas facturables reales</strong>
                <p>De 160 h/mes, solo el 60-80% son facturables. El resto se va en ventas, administración, formación y comunicación con clientes.</p>
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
                <p>Suma un 30-50% sobre tu mínimo para reinversión, ahorro a largo plazo, vacaciones e imprevistos. No es lujo, es gestión empresarial.</p>
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
              <span className={styles.tipIcon}>💼</span>
              <strong>Especialízate para cobrar más</strong>
              <p>Los generalistas compiten por precio; los especialistas compiten por valor. Define tu nicho y domínalo.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📊</span>
              <strong>Documenta tus resultados</strong>
              <p>Casos de éxito con números ("aumenté conversiones un 40%") justifican tarifas altas mejor que cualquier argumento.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🤝</span>
              <strong>Negocia el alcance, no el precio</strong>
              <p>Si piden descuento, reduce entregables. Mantén tu tarifa hora intacta para no devaluar tu trabajo.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📅</span>
              <strong>Ofrece pago anticipado con descuento</strong>
              <p>Un 5% de descuento por pago 100% adelantado mejora tu cashflow y reduce riesgo de impago.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🌍</span>
              <strong>Trabaja con clientes internacionales</strong>
              <p>Mismo trabajo, tarifas 2-3x más altas en mercados como UK, DACH o USA. El remoto lo hace posible.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📝</span>
              <strong>Contrato siempre, sin excepción</strong>
              <p>Acuerdo escrito con scope, tarifa, revisiones y condiciones de pago protege tu tarifa y tu negocio.</p>
            </div>
          </div>
        </div>

        {/* 6. WARNING BOX */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon}>⚠️</span>
            <strong>Errores críticos al fijar tu tarifa freelance</strong>
          </div>
          <ul className={styles.warningList}>
            <li>Calcular solo las horas de trabajo directo e ignorar tiempo de ventas, reuniones y administración (20-30% del tiempo real).</li>
            <li>No actualizar la tarifa durante años mientras tus gastos e inflación aumentan cada ejercicio.</li>
            <li>Aceptar pagos sin contrato "para no complicarlo": imposible reclamar si el cliente no paga.</li>
            <li>Dar descuentos como norma sin reducir el alcance del proyecto: devalúa tu trabajo ante el cliente.</li>
            <li>No cobrar por revisiones extra fuera del alcance acordado (scope creep sin facturar).</li>
            <li>Cotizar sin conocer el presupuesto del cliente: podrías quedarte muy por debajo de lo que pagarían.</li>
            <li>Trabajar sin factura "para ahorrar impuestos": riesgo de sanción de Hacienda y sin protección legal.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-tarifa-freelance')} />

      <ShareCard appName="calculadora-tarifa-freelance" />
      <Footer appName="calculadora-tarifa-freelance" />
    </div>
  );
}
