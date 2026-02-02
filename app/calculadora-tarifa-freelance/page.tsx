'use client';

import { useState, useMemo } from 'react';
import styles from './CalculadoraTarifaFreelance.module.css';
import { MeskeiaLogo, Footer, NumberInput, ResultCard, EducationalSection, RelatedApps, DisclaimerCard, LastUpdated } from '@/components';
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
        variant="legal"
        severity="high"
        context="calculadora-tarifa-freelance"
        collapsible={true}
      />

      <LastUpdated
        date="2026-02-02"
        changelog={[
          "Migrado disclaimer antiguo a DisclaimerCard para consistencia visual",
          "Añadido componente LastUpdated con historial de cambios",
          "Mejorada accesibilidad con ARIA labels en componentes interactivos"
        ]}
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
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-tarifa-freelance')} />

      <Footer appName="calculadora-tarifa-freelance" />
    </div>
  );
}
