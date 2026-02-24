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
    const irpfAnual = facturacionAnual * irpf;
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
        collapsible={true}
      />

      

      {/* Contenido educativo */}
      <EducationalSection
        title="¿Quieres aprender más sobre tarifas freelance?"
        subtitle="Descubre cómo fijar precios competitivos y evitar cobrar de menos"
      >
        <section className={styles.guideSection}>
          <h2>El Error Más Común de los Freelancers</h2>
          <p className={styles.introParagraph}>
            El 80% de los freelancers cobra menos de lo que debería porque olvidan incluir gastos ocultos,
            impuestos y tiempo no facturable. Esta calculadora te ayuda a evitar ese error.
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>📌 ¿Por qué el 70% de ocupación?</h4>
              <p>
                Como freelance, no puedes facturar el 100% de tu tiempo. Entre el 30-40% se dedica a:
                tareas administrativas, comercial (buscar clientes), formación, gestión de proyectos y comunicación con clientes.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>📌 ¿Cuánto añadir de margen?</h4>
              <p>
                Un margen del 15-20% te protege de: meses con menos trabajo, clientes que no pagan a tiempo,
                inversiones necesarias (equipo, software), e imprevistos como enfermedad o reparaciones.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>📌 ¿Por qué es importante el IRPF?</h4>
              <p>
                El IRPF es una retención a cuenta de tu declaración de la renta. Si facturas con 21% de retención,
                ese dinero lo descuenta el cliente y lo paga a Hacienda directamente. Debes preverlo en tu tarifa.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>📌 ¿Y si mi tarifa es muy alta?</h4>
              <p>
                Si el resultado te parece alto, revisa: ¿estás incluyendo gastos innecesarios?, ¿puedes reducir gastos fijos?,
                ¿puedes aumentar tu ocupación facturable? Pero nunca cobres por debajo de tu coste real.
              </p>
            </div>
          </div>

          <h3>Gastos Que Los Freelancers Suelen Olvidar</h3>
          <ul className={styles.tipsList}>
            <li><strong>Cuota de autónomos:</strong> Mínimo 293€/mes en 2024 (puede aumentar según ingresos)</li>
            <li><strong>Seguro de responsabilidad civil:</strong> 150-500€/año según actividad</li>
            <li><strong>Formación continua:</strong> Cursos, certificaciones, libros técnicos</li>
            <li><strong>Equipo y renovación:</strong> Ordenador, móvil, software (amortizar en 3-4 años)</li>
            <li><strong>Gestoría o asesoría fiscal:</strong> 50-150€/mes</li>
            <li><strong>Días sin facturar:</strong> Vacaciones, enfermedad, festivos, tiempo entre proyectos</li>
          </ul>
        </section>

        {/* ========== SECCIÓN 1: TABLA COMPARATIVA ========== */}
        <section className={styles.comparativaSection}>
          <h2>📊 Comparativa de Modelos de Facturación Freelance</h2>
          <p className={styles.comparativaSubtitle}>
            Descubre las ventajas e inconvenientes de cada modelo de tarifa para elegir el que mejor se adapte a tu servicio
          </p>

          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Modelo</th>
                  <th>Ventajas</th>
                  <th>Inconvenientes</th>
                  <th>Cuándo usarlo</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Por Hora</strong></td>
                  <td>
                    • Fácil de calcular<br />
                    • Flexible para cambios<br />
                    • Control total del tiempo<br />
                    • Ideal para sprints cortos
                  </td>
                  <td>
                    • Penaliza la eficiencia<br />
                    • Conflictos por horas extras<br />
                    • Cliente vigila cada minuto<br />
                    • Ingresos limitados por tiempo
                  </td>
                  <td>
                    Proyectos con alcance indefinido, mantenimiento continuo, soporte técnico, consultoría puntual
                  </td>
                </tr>
                <tr>
                  <td><strong>Por Día (Day Rate)</strong></td>
                  <td>
                    • Previsibilidad para ambas partes<br />
                    • Simplifica facturación<br />
                    • Minimiza conflicto por horas<br />
                    • Standard en sectores creativos
                  </td>
                  <td>
                    • Dificulta trabajos parciales<br />
                    • Rigidez en jornadas<br />
                    • Puede ser caro para proyectos cortos<br />
                    • Cliente espera disponibilidad total
                  </td>
                  <td>
                    Proyectos de varios días consecutivos, workshops, producción audiovisual, eventos presenciales
                  </td>
                </tr>
                <tr>
                  <td><strong>Por Proyecto (Precio Fijo)</strong></td>
                  <td>
                    • Cliente conoce coste total<br />
                    • Recompensa la eficiencia<br />
                    • Menos microgestión<br />
                    • Mayor margen si optimizas
                  </td>
                  <td>
                    • Riesgo de subestimar scope<br />
                    • Cambios generan conflictos<br />
                    • Necesitas experiencia previa<br />
                    • Difícil cotizar sin conocer bien
                  </td>
                  <td>
                    Proyectos con alcance definido, diseño de marca, desarrollo web específico, redacción de contenidos
                  </td>
                </tr>
                <tr>
                  <td><strong>Retainer Mensual</strong></td>
                  <td>
                    • Ingresos recurrentes estables<br />
                    • Relación cliente a largo plazo<br />
                    • Menos tiempo en comercial<br />
                    • Previsibilidad de caja
                  </td>
                  <td>
                    • Límites de horas confusos<br />
                    • Cliente espera disponibilidad 24/7<br />
                    • Difícil gestionar múltiples retainers<br />
                    • Puede convertirse en "empleado barato"
                  </td>
                  <td>
                    Community management, soporte técnico continuo, servicios de consultoría, gestión de campañas
                  </td>
                </tr>
                <tr>
                  <td><strong>Por Valor (Value-Based)</strong></td>
                  <td>
                    • Ingresos desacoplados de tiempo<br />
                    • Recompensa experiencia/resultados<br />
                    • Alineado con impacto para cliente<br />
                    • Mayor margen potencial
                  </td>
                  <td>
                    • Difícil cuantificar el valor<br />
                    • Requiere credibilidad alta<br />
                    • Negociaciones complejas<br />
                    • Cliente puede no entenderlo
                  </td>
                  <td>
                    Estrategia de marketing con ROI claro, optimización de conversión, procesos que ahorran costes significativos
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ========== SECCIÓN 2: CASOS DE USO ========== */}
        <section className={styles.casosSection}>
          <h2>💼 Casos de Uso: Freelancers Reales</h2>
          <p className={styles.casosSubtitle}>
            Ejemplos prácticos de cómo diferentes perfiles calculan sus tarifas según su situación personal
          </p>

          <div className={styles.casosGrid}>
            {/* Caso 1 */}
            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span className={styles.casoIcon}>👨‍💻</span>
                <h3>Alberto - Desarrollador Junior</h3>
              </div>
              <div className={styles.casoBody}>
                <p className={styles.casoSituacion}>
                  <strong>Situación:</strong> 2 años de experiencia, viviendo con padres, sin cargas familiares. Quiere independizarse.
                </p>
                <div className={styles.casoData}>
                  <div className={styles.casoDataRow}>
                    <span>Ingreso neto objetivo:</span>
                    <span><strong>1.500 €/mes</strong></span>
                  </div>
                  <div className={styles.casoDataRow}>
                    <span>Gastos mensuales:</span>
                    <span><strong>455 €</strong> (cuota + software + móvil)</span>
                  </div>
                  <div className={styles.casoDataRow}>
                    <span>Ocupación facturable:</span>
                    <span><strong>60%</strong> (aprende mientras trabaja)</span>
                  </div>
                  <div className={styles.casoDataRow}>
                    <span>IRPF:</span>
                    <span><strong>7%</strong> (nuevos autónomos 2 años)</span>
                  </div>
                </div>
                <div className={styles.casoResultado}>
                  <strong>Tarifa recomendada:</strong> 35-40 €/h | 280-320 €/día
                </div>
                <p className={styles.casoConclusion}>
                  Alberto cobra por debajo del mercado para ganar experiencia y crear portfolio, pero cubre sus costes reales y puede ahorrar moderadamente.
                </p>
              </div>
            </div>

            {/* Caso 2 */}
            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span className={styles.casoIcon}>👩‍🎨</span>
                <h3>María - Diseñadora Senior</h3>
              </div>
              <div className={styles.casoBody}>
                <p className={styles.casoSituacion}>
                  <strong>Situación:</strong> 8 años experiencia, vive en alquiler compartido, tiene hija de 5 años. Portfolio consolidado.
                </p>
                <div className={styles.casoData}>
                  <div className={styles.casoDataRow}>
                    <span>Ingreso neto objetivo:</span>
                    <span><strong>2.500 €/mes</strong></span>
                  </div>
                  <div className={styles.casoDataRow}>
                    <span>Gastos mensuales:</span>
                    <span><strong>680 €</strong> (cuota + software Adobe + gestoría + seguros)</span>
                  </div>
                  <div className={styles.casoDataRow}>
                    <span>Ocupación facturable:</span>
                    <span><strong>75%</strong> (eficiente, clientes recurrentes)</span>
                  </div>
                  <div className={styles.casoDataRow}>
                    <span>IRPF:</span>
                    <span><strong>15%</strong> (reducido)</span>
                  </div>
                </div>
                <div className={styles.casoResultado}>
                  <strong>Tarifa recomendada:</strong> 55-65 €/h | 440-520 €/día
                </div>
                <p className={styles.casoConclusion}>
                  María cobra tarifas medias-altas justificadas por su experiencia. Combina proyectos fijos (branding) con retainers mensuales (2-3 clientes).
                </p>
              </div>
            </div>

            {/* Caso 3 */}
            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span className={styles.casoIcon}>🧑‍💼</span>
                <h3>Javier - Consultor Estratégico</h3>
              </div>
              <div className={styles.casoBody}>
                <p className={styles.casoSituacion}>
                  <strong>Situación:</strong> 15 años experiencia corporativa, especializado en transformación digital. Hipoteca y 2 hijos.
                </p>
                <div className={styles.casoData}>
                  <div className={styles.casoDataRow}>
                    <span>Ingreso neto objetivo:</span>
                    <span><strong>4.000 €/mes</strong></span>
                  </div>
                  <div className={styles.casoDataRow}>
                    <span>Gastos mensuales:</span>
                    <span><strong>950 €</strong> (cuota máxima + oficina + gestoría + seguros + formación)</span>
                  </div>
                  <div className={styles.casoDataRow}>
                    <span>Ocupación facturable:</span>
                    <span><strong>65%</strong> (mucha preparación + comercial)</span>
                  </div>
                  <div className={styles.casoDataRow}>
                    <span>IRPF:</span>
                    <span><strong>21%</strong> (general)</span>
                  </div>
                </div>
                <div className={styles.casoResultado}>
                  <strong>Tarifa recomendada:</strong> 95-120 €/h | 800-1.000 €/día
                </div>
                <p className={styles.casoConclusion}>
                  Javier cobra por valor (no por hora). Proyectos típicos: 15.000-30.000 € por diagnóstico estratégico de 4-6 semanas. Su red de contactos le garantiza flujo constante.
                </p>
              </div>
            </div>

            {/* Caso 4 */}
            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span className={styles.casoIcon}>📝</span>
                <h3>Laura - Redactora Freelance</h3>
              </div>
              <div className={styles.casoBody}>
                <p className={styles.casoSituacion}>
                  <strong>Situación:</strong> 5 años experiencia, vive en zona rural (bajo coste vida), trabajo 100% remoto. Sin cargas.
                </p>
                <div className={styles.casoData}>
                  <div className={styles.casoDataRow}>
                    <span>Ingreso neto objetivo:</span>
                    <span><strong>1.800 €/mes</strong></span>
                  </div>
                  <div className={styles.casoDataRow}>
                    <span>Gastos mensuales:</span>
                    <span><strong>420 €</strong> (cuota + internet + Grammarly + gestoría)</span>
                  </div>
                  <div className={styles.casoDataRow}>
                    <span>Ocupación facturable:</span>
                    <span><strong>80%</strong> (muy eficiente, templates propios)</span>
                  </div>
                  <div className={styles.casoDataRow}>
                    <span>IRPF:</span>
                    <span><strong>15%</strong> (reducido)</span>
                  </div>
                </div>
                <div className={styles.casoResultado}>
                  <strong>Tarifa recomendada:</strong> 40-50 €/h | Por palabra: 0,10-0,15 € | Artículo 1.000 palabras: 100-150 €
                </div>
                <p className={styles.casoConclusion}>
                  Laura combina retainers (blogs mensuales 500 €) con proyectos puntuales. Su baja ocupación por gastos + vida rural le permite tarifas competitivas sin sacrificar calidad de vida.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========== SECCIÓN 3: FAQ AMPLIADO ========== */}
        <section className={styles.faqSection}>
          <h2>❓ Preguntas Frecuentes sobre Tarifas Freelance</h2>

          <div className={styles.faqGrid}>
            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>¿Debo cobrar lo mismo a todos los clientes?</h3>
              <p className={styles.faqAnswer}>
                No necesariamente. Puedes ajustar tu tarifa según:
              </p>
              <ul className={styles.faqList}>
                <li><strong>Volumen:</strong> Clientes recurrentes pueden tener descuento del 10-15% por estabilidad</li>
                <li><strong>Urgencia:</strong> Proyectos urgentes (entrega &lt;48h) pueden llevar recargo del 50-100%</li>
                <li><strong>Complejidad:</strong> Proyectos nuevos/complejos pueden justificar tarifas más altas</li>
                <li><strong>Tipo de cliente:</strong> Startups vs corporaciones tienen presupuestos diferentes</li>
              </ul>
              <p className={styles.faqAnswer}>
                <strong>Regla de oro:</strong> Nunca bajes de tu tarifa base calculada (la que cubre costes + objetivo). Los descuentos deben venir de reducir tu margen, no de trabajar por debajo de coste.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>¿Cómo subo mi tarifa sin perder clientes?</h3>
              <p className={styles.faqAnswer}>
                Estrategia gradual:
              </p>
              <ul className={styles.faqList}>
                <li><strong>Clientes nuevos primero:</strong> Aplica la nueva tarifa solo a proyectos futuros</li>
                <li><strong>Aviso con 3 meses:</strong> Informa a clientes actuales que subirás tarifas</li>
                <li><strong>Justifica el valor:</strong> Explica qué ha mejorado (experiencia, eficiencia, resultados probados)</li>
                <li><strong>Incrementos moderados:</strong> Sube 10-20% cada 12-18 meses, no 50% de golpe</li>
                <li><strong>Ofrece alternativa:</strong> "Retainer anual con tarifa actual bloqueada"</li>
              </ul>
              <p className={styles.faqAnswer}>
                <strong>Realidad:</strong> Perderás 1 de cada 5 clientes al subir tarifas. Si no pierdes ninguno, es que no has subido lo suficiente. Los buenos clientes entienden que tu experiencia vale más con el tiempo.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>¿Qué hago si un cliente dice "es muy caro"?</h3>
              <p className={styles.faqAnswer}>
                Respuestas estratégicas:
              </p>
              <ul className={styles.faqList}>
                <li><strong>Reformula en valor:</strong> "No es 5.000 €, es automatizar un proceso que te ahorra 2 horas diarias (40h/mes × 25 €/h = 1.000 €/mes de ahorro)"</li>
                <li><strong>Desglosa el precio:</strong> "Solo 166 €/día durante 30 días" suena menos que "5.000 € totales"</li>
                <li><strong>Ofrece opciones:</strong> "Versión completa 5.000 € o MVP básico 2.500 €"</li>
                <li><strong>Pregunta su presupuesto:</strong> "¿Qué tenías en mente?" (puede ser más alto de lo que imaginas)</li>
              </ul>
              <p className={styles.faqAnswer}>
                <strong>Nunca hacer:</strong> No justifiques tu tarifa bajándola ("bueno, puedo hacerlo por..."). Si no pueden pagarte, no son tu cliente ideal. Mejor invertir ese tiempo en buscar clientes que valoren tu trabajo.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>¿Es mejor cobrar por hora o por proyecto?</h3>
              <p className={styles.faqAnswer}>
                Depende de tu experiencia y tipo de trabajo:
              </p>
              <p className={styles.faqAnswer}>
                <strong>Cobra por hora si:</strong>
              </p>
              <ul className={styles.faqList}>
                <li>Eres junior y aún estimas mal</li>
                <li>El alcance es indefinido o cambiante</li>
                <li>Haces mantenimiento/soporte continuo</li>
                <li>Trabajas con metodologías ágiles flexibles</li>
              </ul>
              <p className={styles.faqAnswer}>
                <strong>Cobra por proyecto si:</strong>
              </p>
              <ul className={styles.faqList}>
                <li>Tienes experiencia estimando</li>
                <li>El alcance está perfectamente definido</li>
                <li>Quieres recompensar tu eficiencia</li>
                <li>El cliente valora precio fijo</li>
              </ul>
              <p className={styles.faqAnswer}>
                <strong>Tip profesional:</strong> Calcula el proyecto en horas internamente, pero preséntalo como precio fijo. Ejemplo: "Diseño logo completo: 1.500 €" (tú sabes que son 20-25h × 60 €/h). Si terminas en 15h, ganas más por hora. Si tardas 30h, aprendes a estimar mejor la próxima vez.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>¿Debo incluir el IVA en mi tarifa?</h3>
              <p className={styles.faqAnswer}>
                Depende de tu cliente:
              </p>
              <p className={styles.faqAnswer}>
                <strong>Siempre presenta dos cifras:</strong> "Mi tarifa es 60 €/h (sin IVA) o 72,60 €/h (IVA incluido)".
              </p>
              <ul className={styles.faqList}>
                <li><strong>Clientes B2B (empresas):</strong> El IVA es neutro para ellos (lo deducen), así que puedes hablar de tarifas sin IVA</li>
                <li><strong>Clientes B2C (particulares):</strong> El IVA es coste real, mejor presentar precio con IVA incluido para evitar sorpresas</li>
              </ul>
              <p className={styles.faqAnswer}>
                <strong>Recuerda:</strong> El IVA NO es tu ingreso. Lo cobras del cliente y lo pagas trimestral/mensualmente a Hacienda. Tu tarifa real (lo que te llevas) es la cifra sin IVA menos los impuestos (IRPF).
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>¿Cuánto debo cobrar si estoy empezando?</h3>
              <p className={styles.faqAnswer}>
                Estrategia por etapas:
              </p>
              <ul className={styles.faqList}>
                <li><strong>Fase 1 (0-6 meses):</strong> Cobra el 50-70% de la tarifa de mercado. Prioriza portfolio y testimonios sobre ingresos máximos</li>
                <li><strong>Fase 2 (6-18 meses):</strong> Sube a 70-90% de mercado a medida que acumulas casos de éxito</li>
                <li><strong>Fase 3 (18+ meses):</strong> Cobra tarifa de mercado completa o más si te especializas</li>
              </ul>
              <p className={styles.faqAnswer}>
                <strong>Error común:</strong> Trabajar gratis "por exposición". Cobrar poco es válido, trabajar gratis devalúa tu profesión.
              </p>
              <p className={styles.faqAnswer}>
                <strong>Mínimo:</strong> Cubre tus costes reales (cuota autónomos + gastos directos). Si un cliente no puede pagar eso, ofrécele un descuento pequeño, no gratuidad.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>¿Cómo gestiono los cambios de alcance (scope creep)?</h3>
              <p className={styles.faqAnswer}>
                <strong>Prevención:</strong>
              </p>
              <ul className={styles.faqList}>
                <li>Define alcance por escrito antes de empezar (documento firmado)</li>
                <li>Especifica qué NO incluye el proyecto</li>
                <li>Establece sistema de "cambios requieren presupuesto adicional"</li>
                <li>Usa herramientas de gestión de proyectos con tareas cerradas</li>
              </ul>
              <p className={styles.faqAnswer}>
                <strong>Cuando ocurre:</strong>
              </p>
              <ul className={styles.faqList}>
                <li><strong>Identifica el cambio:</strong> "Esto no estaba en el alcance original"</li>
                <li><strong>Valora impacto:</strong> "+8 horas de trabajo adicional"</li>
                <li><strong>Presenta opciones:</strong> "Puedo añadirlo por 480 € extra o lo dejamos para Fase 2"</li>
                <li><strong>Documenta aceptación del cliente por escrito</strong></li>
              </ul>
              <p className={styles.faqAnswer}>
                <strong>Filosofía:</strong> Los clientes respetan más a freelancers que protegen su tiempo. Si aceptas todo cambio gratis, te verán como alguien que no valora su trabajo. La firmeza profesional genera respeto y mejores relaciones a largo plazo.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>¿Es normal cobrar anticipo o señal?</h3>
              <p className={styles.faqAnswer}>
                Sí, es estándar profesional. Estructuras comunes:
              </p>
              <ul className={styles.faqList}>
                <li><strong>Proyectos pequeños (&lt;2.000 €):</strong> 50% al inicio, 50% a la entrega</li>
                <li><strong>Proyectos medianos (2.000-10.000 €):</strong> 30% al inicio, 40% a mitad de proyecto, 30% a la entrega</li>
                <li><strong>Proyectos grandes (&gt;10.000 €):</strong> 20% al inicio, hitos mensuales del 20-30%, 20% final</li>
                <li><strong>Retainers mensuales:</strong> 100% al inicio de cada mes (como Netflix)</li>
              </ul>
              <p className={styles.faqAnswer}>
                <strong>Por qué es importante:</strong>
              </p>
              <ul className={styles.faqList}>
                <li>Filtra clientes no serios (si no pueden pagar 30% inicial, no podrán pagar el 100% final)</li>
                <li>Cubre tus gastos iniciales (software, herramientas)</li>
                <li>Te protege si el cliente desaparece a mitad de proyecto</li>
                <li>Es práctica estándar en industrias creativas</li>
              </ul>
              <p className={styles.faqAnswer}>
                <strong>Nunca:</strong> Empieces un proyecto sin anticipo, especialmente con clientes nuevos.
              </p>
            </div>
          </div>
        </section>

        {/* ========== SECCIÓN 4: GUÍA PASO A PASO ========== */}
        <section className={styles.guiaSection}>
          <h2>📋 Guía Paso a Paso: Cómo Fijar Tu Tarifa Freelance</h2>
          <p className={styles.guiaSubtitle}>
            Sigue estos 7 pasos para calcular una tarifa justa que cubra tus necesidades y refleje tu valor real
          </p>

          <div className={styles.stepsContainer}>
            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h3>Define tu Ingreso Neto Objetivo</h3>
                <p>
                  Calcula cuánto dinero necesitas <strong>llevarte a casa cada mes</strong> después de pagar impuestos y gastos profesionales. Considera: alquiler, comida, transporte, ahorros, ocio y fondo de emergencia. No confundas "ingreso bruto" (lo que facturas) con "ingreso neto" (lo que realmente te queda).
                </p>
                <p className={styles.stepExample}>
                  <strong>Ejemplo:</strong> Si necesitas 2.000 €/mes para vivir cómodamente y ahorrar 300 €, tu objetivo neto es 2.300 €/mes (27.600 €/año).
                </p>
              </div>
            </div>

            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h3>Lista Todos tus Gastos Profesionales</h3>
                <p>
                  Identifica <strong>todos los costes</strong> de operar como autónomo, incluso los pequeños que suelen olvidarse. Divide en fijos (cuota, alquiler oficina, seguros) y variables (formación, material, marketing). Muchos freelancers olvidan amortización de equipo (ordenador cada 3-4 años = 800€/4 años = 16,67€/mes).
                </p>
                <p className={styles.stepExample}>
                  <strong>Ejemplo:</strong> Cuota autónomos 300€ + Internet 40€ + Software 50€ + Gestoría 60€ + Seguros 25€ + Formación 30€ + Marketing 50€ = <strong>555 €/mes</strong>.
                </p>
              </div>
            </div>

            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h3>Calcula tus Días Facturables Reales</h3>
                <p>
                  NO puedes facturar 365 días al año. Resta: 104 fines de semana + 22 días vacaciones + 14 festivos + 5 días enfermedad = <strong>220 días laborables/año</strong>. Ahora aplica tu tasa de ocupación facturable (70% es realista): 220 × 0,70 = <strong>154 días facturables/año</strong> (12,8 días/mes).
                </p>
                <p className={styles.stepExample}>
                  <strong>Ejemplo:</strong> Si trabajas 8h/día, tienes 154 días × 8h = 1.232 horas facturables/año (103 h/mes). El resto lo dedicas a admin, comercial, formación, descansos.
                </p>
              </div>
            </div>

            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h3>Calcula tu Base Imponible Necesaria</h3>
                <p>
                  Suma tu ingreso neto objetivo + gastos profesionales. Luego divide entre (1 - tipo IRPF) para obtener el bruto necesario antes de impuestos. Este es el dinero que debes facturar mensualmente ANTES de que te retengan el IRPF.
                </p>
                <p className={styles.stepExample}>
                  <strong>Ejemplo:</strong> (2.300€ objetivo + 555€ gastos) / (1 - 0,21) = 2.855€ / 0,79 = <strong>3.614 €/mes</strong> necesarios antes de IRPF.
                </p>
              </div>
            </div>

            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h3>Añade Margen de Beneficio/Seguridad</h3>
                <p>
                  Incrementa entre 10-20% para cubrir imprevistos: clientes que pagan tarde, meses con menos trabajo, inversiones necesarias (nuevo ordenador, formación cara), reserva para autónomos en vacaciones. Este margen NO es lujo, es gestión de riesgo empresarial.
                </p>
                <p className={styles.stepExample}>
                  <strong>Ejemplo:</strong> 3.614 € × 1,15 (margen 15%) = <strong>4.156 €/mes</strong> que debes facturar para estar seguro.
                </p>
              </div>
            </div>

            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <h3>Calcula tu Tarifa por Hora/Día</h3>
                <p>
                  Divide tu facturación mensual necesaria entre tus horas/días facturables. Esto te da tu <strong>tarifa base sin IVA</strong>. Si trabajas en sectores B2B, presenta siempre la tarifa sin IVA (el IVA se suma después). Si trabajas con particulares (B2C), presenta con IVA incluido.
                </p>
                <p className={styles.stepExample}>
                  <strong>Ejemplo:</strong> 4.156 €/mes ÷ 103 h/mes = <strong>40,35 €/h</strong> (sin IVA) o <strong>48,82 €/h</strong> (con IVA 21%). Por día (8h): 323 €/día o 391 €/día con IVA.
                </p>
              </div>
            </div>

            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>7</div>
              <div className={styles.stepContent}>
                <h3>Valida con Mercado y Ajusta</h3>
                <p>
                  Investiga qué cobran otros freelancers de tu sector y experiencia (plataformas: Malt, Workana, LinkedIn). Si tu tarifa calculada está muy por debajo del mercado, puedes subirla (aprovecha demanda). Si está muy por encima, analiza: ¿puedes reducir gastos? ¿mejorar ocupación? Nunca bajes de tu coste real.
                </p>
                <p className={styles.stepExample}>
                  <strong>Ejemplo:</strong> Si calculas 40€/h pero el mercado paga 60€/h a tu perfil, cobra 60€/h. Si calculas 80€/h pero el mercado paga 50€/h, revisa gastos/ocupación, pero no bajes de 40€/h si ese es tu coste real. Busca nichos mejor pagados.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========== SECCIÓN 5: MEJORES PRÁCTICAS ========== */}
        <section className={styles.tipsSection}>
          <h2>💡 Mejores Prácticas para Fijar y Defender tu Tarifa</h2>

          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <div className={styles.tipIcon}>📊</div>
              <h3>Revisa tu tarifa cada 6-12 meses</h3>
              <p>
                Tu coste de vida aumenta (inflación), tu experiencia mejora, tus gastos cambian. Recalcula tu tarifa mínimo 2 veces al año. Un error común: mantener la misma tarifa durante 3-4 años porque "funciona". En ese tiempo, la inflación ha reducido tu poder adquisitivo un 10-15%.
              </p>
            </div>

            <div className={styles.tipCard}>
              <div className={styles.tipIcon}>🎯</div>
              <h3>Especialízate para cobrar más</h3>
              <p>
                Un generalista cobra 40-50€/h. Un especialista en React Native para fintech cobra 80-120€/h haciendo lo mismo. La especialización te permite: (1) Competir menos por precio, (2) Resolver problemas más rápido (más valor por hora), (3) Atraer clientes dispuestos a pagar más. Define tu nicho en 12-18 meses.
              </p>
            </div>

            <div className={styles.tipCard}>
              <div className={styles.tipIcon}>📝</div>
              <h3>Documenta TODO por escrito</h3>
              <p>
                Antes de empezar cualquier proyecto: (1) Presupuesto firmado con alcance detallado, (2) Condiciones de pago (anticipo, hitos, plazos), (3) Política de cambios ("modificaciones fuera de alcance se facturan aparte"), (4) Plazos de entrega y revisiones incluidas. Esto previene el 90% de conflictos futuros.
              </p>
            </div>

            <div className={styles.tipCard}>
              <div className={styles.tipIcon}>💰</div>
              <h3>Ofrece paquetes en lugar de solo tarifas horarias</h3>
              <p>
                En vez de "60€/h", ofrece: "Pack Básico 1.500€ (logo + tarjetas), Pack Pro 3.000€ (logo + branding completo + web landing), Pack Premium 6.000€ (todo lo anterior + estrategia de marca)". Los clientes prefieren precios cerrados y tú vendes más valor que horas. El Pack Pro tiene mejor margen aunque incluya más trabajo.
              </p>
            </div>

            <div className={styles.tipCard}>
              <div className={styles.tipIcon}>🚫</div>
              <h3>Di NO a proyectos por debajo de tu mínimo</h3>
              <p>
                Cada proyecto mal pagado te quita tiempo para buscar clientes buenos. Si aceptas un proyecto a 20€/h cuando tu mínimo es 40€/h, estás perdiendo 20€/h + el coste de oportunidad de no estar disponible para proyectos buenos. Mejor respuesta: "Mi tarifa actual es 40€/h, pero si tu presupuesto es inferior, puedo recomendarte a [compañero junior]".
              </p>
            </div>

            <div className={styles.tipCard}>
              <div className={styles.tipIcon}>🔄</div>
              <h3>Automatiza y sistematiza para mejorar margen</h3>
              <p>
                Cada hora que ahorras mejora tu tarifa efectiva. Crea: (1) Templates de propuestas/contratos (ahorra 2h por proyecto), (2) Flujos de trabajo documentados (rediseño web en 5 pasos repetibles), (3) Snippets de código reutilizables, (4) Procesos de onboarding de clientes. Si un proyecto que antes tomaba 20h ahora toma 15h, tu tarifa efectiva sube 33% (de 60€/h a 80€/h).
              </p>
            </div>
          </div>
        </section>

        {/* ========== SECCIÓN 6: WARNING BOX ========== */}
        <div className={styles.warningBox}>
          <h2>⚠️ Errores Costosos al Fijar Tarifas (Evítalos)</h2>
          <p className={styles.warningIntro}>
            Estos errores han costado miles de euros a freelancers experimentados. Aprende de sus fallos:
          </p>
          <ul className={styles.warningList}>
            <li>
              <strong>Calcular tarifa basándote solo en lo que ganan empleados de tu sector</strong>: Un empleado con sueldo de 30.000€/año no equivale a un freelance cobrando 30.000€/año. El empleado tiene: pagas extras (14 pagas), vacaciones pagadas, Seguridad Social pagada por empresa (30% adicional), estabilidad, equipo proporcionado. Como freelance necesitas facturar 45.000-50.000€/año para igualar ese sueldo.
            </li>
            <li>
              <strong>Olvidar incluir tu propio seguro de salud privado</strong>: La Seguridad Social de autónomos cubre lo básico, pero muchos freelancers necesitan seguro privado (150-300€/mes) para: atención rápida, especialistas sin listas de espera, baja dental. Esto suma 1.800-3.600€/año que debes incluir en gastos.
            </li>
            <li>
              <strong>Cobrar igual a tu competencia sin conocer sus costes</strong>: Tu competidor que cobra 50€/h puede: (1) Vivir con padres (sin alquiler), (2) Tener pareja con ingresos estables, (3) Estar sobreocupado al 90% (tú al 60%), (4) Aceptar márgenes peligrosamente bajos. No copies precios sin conocer contexto. Calcula TU tarifa según TUS necesidades.
            </li>
            <li>
              <strong>Aceptar proyectos "de exposición" sin pago adecuado</strong>: "No puedo pagarte pero tendrás mucha visibilidad". La exposición NO paga facturas. Estadística real: menos del 5% de proyectos "por exposición" generan clientes pagos después. Si quieres portfolio, haz proyectos personales de calidad (tienes control 100%) o cobra mínimo el 50% de tu tarifa normal.
            </li>
            <li>
              <strong>No ajustar tarifa por inflación anual</strong>: Con inflación del 5%/año, mantener la misma tarifa durante 3 años equivale a perder 15% de poder adquisitivo. Si cobrabas 50€/h en 2021 y sigues cobrando lo mismo en 2024, realmente estás cobrando el equivalente a 42,50€/h en poder de compra. Sube tarifas 3-5%/año como mínimo para compensar inflación.
            </li>
            <li>
              <strong>No considerar tiempo de comercial y administración</strong>: Si asumes ocupación facturable del 100%, tu tarifa será insuficiente. Realísticamente: 20% del tiempo se va en buscar clientes, 10% en administración (facturas, impuestos, correos), 5% en formación. Una ocupación del 65-75% es lo normal para freelances sostenibles. Si calculas con 100%, trabajarás gratis el 25-35% del tiempo.
            </li>
            <li>
              <strong>Bajar precio para "cerrar el trato" con cliente indeciso</strong>: Cuando bajas precio por presión, comunicas: "mi precio inicial estaba inflado" o "no confío en mi valor". El cliente lo recuerda y pedirá descuentos siempre. Mejor respuesta: "Entiendo que es tu presupuesto. Puedo reducir el alcance [eliminar X funcionalidad] para ajustarnos a 3.000€ en lugar de 4.000€". Reduces trabajo, no tarifa.
            </li>
            <li>
              <strong>No separar dinero para impuestos trimestrales</strong>: Muchos nuevos autónomos gastan todo lo facturado y luego no tienen para pagar IRPF trimestral (modelo 130) o IVA trimestral (modelo 303). Regla simple: cada vez que cobres una factura, AUTOMÁTICAMENTE transfiere el 25-30% a cuenta de ahorro "impuestos". Nunca toques ese dinero salvo para pagar Hacienda. Evitarás sustos en julio, octubre, enero y abril.
            </li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-tarifa-freelance')} />

      <ShareCard appName="calculadora-tarifa-freelance" />
      <Footer appName="calculadora-tarifa-freelance" />
    </div>
  );
}
