'use client';

import { useState, useMemo } from 'react';
import styles from './AmortizacionHipoteca.module.css';
import { MeskeiaLogo, Footer, RelatedApps, DisclaimerCard, LegalNotice, EducationalSection, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatNumber, formatCurrency, parseSpanishNumber } from '@/lib';

type ModoCalculo = 'simple' | 'escenarios' | 'periodica';

interface ResultadoAmortizacion {
  importeAmortizado: number;
  saldoAntes: number;
  saldoDespues: number;
  // Opción 1: Reducir cuota
  nuevaCuota: number;
  reduccionCuota: number;
  ahorroInteresesCuota: number;
  // Opción 2: Reducir plazo
  nuevoPlazoMeses: number;
  reduccionMeses: number;
  nuevaFechaFin: Date;
  ahorroInteresesPlazo: number;
  // Datos originales para comparar
  cuotaOriginal: number;
  plazoRestanteMeses: number;
  totalInteresesSinAmortizar: number;
}

interface ResultadoPeriodico {
  anio: number;
  saldoInicio: number;
  amortizacion: number;
  saldoFinal: number;
  cuotaMensual: number;
  interesesAnuales: number;
  capitalAnual: number;
}

export default function AmortizacionHipotecaPage() {
  const [modo, setModo] = useState<ModoCalculo>('simple');

  // Datos del préstamo original
  const [importeInicial, setImporteInicial] = useState('150000');
  const [plazoAnios, setPlazoAnios] = useState('25');
  const [tipoInteres, setTipoInteres] = useState('3');
  const [fechaInicio, setFechaInicio] = useState('2020-01-01');

  // Datos de la amortización anticipada (modo simple)
  const [fechaAmortizacion, setFechaAmortizacion] = useState('2025-01-01');
  const [importeAmortizacion, setImporteAmortizacion] = useState('20000');

  // Datos para multi-escenarios
  const [escenario1, setEscenario1] = useState('10000');
  const [escenario2, setEscenario2] = useState('20000');
  const [escenario3, setEscenario3] = useState('30000');
  const [escenario4, setEscenario4] = useState('50000');

  // Datos para amortización periódica
  const [amortizacionAnual, setAmortizacionAnual] = useState('5000');
  const [aniosAmortizando, setAniosAmortizando] = useState('10');

  const [resultado, setResultado] = useState<ResultadoAmortizacion | null>(null);
  const [resultadosEscenarios, setResultadosEscenarios] = useState<ResultadoAmortizacion[]>([]);
  const [resultadosPeriodicos, setResultadosPeriodicos] = useState<ResultadoPeriodico[]>([]);

  const calcularCuotaMensual = (capital: number, interesMensual: number, meses: number): number => {
    if (interesMensual === 0) return capital / meses;
    return capital * interesMensual * Math.pow(1 + interesMensual, meses) / (Math.pow(1 + interesMensual, meses) - 1);
  };

  const calcularSaldoPendiente = (
    capitalInicial: number,
    interesMensual: number,
    cuotaMensual: number,
    mesesTranscurridos: number
  ): number => {
    if (interesMensual === 0) {
      return capitalInicial - (cuotaMensual * mesesTranscurridos);
    }
    const factor = Math.pow(1 + interesMensual, mesesTranscurridos);
    return capitalInicial * factor - cuotaMensual * (factor - 1) / interesMensual;
  };

  const calcularMesesParaSaldar = (
    saldo: number,
    interesMensual: number,
    cuotaMensual: number
  ): number => {
    if (interesMensual === 0) return Math.ceil(saldo / cuotaMensual);
    if (cuotaMensual <= saldo * interesMensual) return Infinity;
    return Math.ceil(Math.log(cuotaMensual / (cuotaMensual - saldo * interesMensual)) / Math.log(1 + interesMensual));
  };

  const calcularTotalIntereses = (
    capital: number,
    interesMensual: number,
    meses: number
  ): number => {
    const cuota = calcularCuotaMensual(capital, interesMensual, meses);
    return (cuota * meses) - capital;
  };

  const calcularAmortizacionSimple = (
    capital: number,
    anios: number,
    tin: number,
    amortizacion: number,
    fechaInicioStr: string,
    fechaAmortStr: string
  ): ResultadoAmortizacion | null => {
    const plazoTotalMeses = anios * 12;
    const interesMensual = tin / 100 / 12;
    const cuotaOriginal = calcularCuotaMensual(capital, interesMensual, plazoTotalMeses);

    const inicio = new Date(fechaInicioStr);
    const fechaAmort = new Date(fechaAmortStr);
    const mesesTranscurridos = Math.max(0,
      (fechaAmort.getFullYear() - inicio.getFullYear()) * 12 +
      (fechaAmort.getMonth() - inicio.getMonth())
    );

    if (mesesTranscurridos >= plazoTotalMeses) return null;

    const saldoAntes = calcularSaldoPendiente(capital, interesMensual, cuotaOriginal, mesesTranscurridos);
    if (amortizacion >= saldoAntes) return null;

    const saldoDespues = saldoAntes - amortizacion;
    const plazoRestanteMeses = plazoTotalMeses - mesesTranscurridos;

    // OPCIÓN 1: Reducir cuota
    const nuevaCuota = calcularCuotaMensual(saldoDespues, interesMensual, plazoRestanteMeses);
    const reduccionCuota = cuotaOriginal - nuevaCuota;
    const interesesConNuevaCuota = (nuevaCuota * plazoRestanteMeses) - saldoDespues;

    // OPCIÓN 2: Reducir plazo
    const nuevoPlazoMeses = calcularMesesParaSaldar(saldoDespues, interesMensual, cuotaOriginal);
    const reduccionMeses = plazoRestanteMeses - nuevoPlazoMeses;
    const nuevaFechaFin = new Date(fechaAmort);
    nuevaFechaFin.setMonth(nuevaFechaFin.getMonth() + nuevoPlazoMeses);
    const interesesConMismaCuota = (cuotaOriginal * nuevoPlazoMeses) - saldoDespues;

    const interesesSinAmortizar = calcularTotalIntereses(saldoAntes, interesMensual, plazoRestanteMeses);
    const ahorroInteresesCuota = interesesSinAmortizar - interesesConNuevaCuota;
    const ahorroInteresesPlazo = interesesSinAmortizar - interesesConMismaCuota;

    return {
      importeAmortizado: amortizacion,
      saldoAntes,
      saldoDespues,
      nuevaCuota,
      reduccionCuota,
      ahorroInteresesCuota,
      nuevoPlazoMeses,
      reduccionMeses,
      nuevaFechaFin,
      ahorroInteresesPlazo,
      cuotaOriginal,
      plazoRestanteMeses,
      totalInteresesSinAmortizar: interesesSinAmortizar,
    };
  };

  const calcular = () => {
    const capital = parseSpanishNumber(importeInicial);
    const anios = parseInt(plazoAnios);
    const tin = parseSpanishNumber(tipoInteres);

    if (isNaN(capital) || isNaN(anios) || isNaN(tin)) return;

    if (modo === 'simple') {
      const amortizacion = parseSpanishNumber(importeAmortizacion);
      if (isNaN(amortizacion)) return;

      const res = calcularAmortizacionSimple(capital, anios, tin, amortizacion, fechaInicio, fechaAmortizacion);
      setResultado(res);
      setResultadosEscenarios([]);
      setResultadosPeriodicos([]);

    } else if (modo === 'escenarios') {
      const escenarios = [
        parseSpanishNumber(escenario1),
        parseSpanishNumber(escenario2),
        parseSpanishNumber(escenario3),
        parseSpanishNumber(escenario4),
      ].filter(e => !isNaN(e) && e > 0);

      const resultados = escenarios
        .map(amort => calcularAmortizacionSimple(capital, anios, tin, amort, fechaInicio, fechaAmortizacion))
        .filter((r): r is ResultadoAmortizacion => r !== null);

      setResultadosEscenarios(resultados);
      setResultado(null);
      setResultadosPeriodicos([]);

    } else if (modo === 'periodica') {
      const amortAnual = parseSpanishNumber(amortizacionAnual);
      const numAnios = parseInt(aniosAmortizando);

      if (isNaN(amortAnual) || isNaN(numAnios)) return;

      const plazoTotalMeses = anios * 12;
      const interesMensual = tin / 100 / 12;
      let saldo = capital;
      let cuotaActual = calcularCuotaMensual(capital, interesMensual, plazoTotalMeses);
      let mesesRestantes = plazoTotalMeses;

      const resultados: ResultadoPeriodico[] = [];
      const inicio = new Date(fechaInicio);

      for (let i = 0; i < numAnios && saldo > 0 && mesesRestantes > 0; i++) {
        const anioActual = inicio.getFullYear() + i;
        const saldoInicio = saldo;

        // Calcular intereses y capital pagados en 12 meses
        let interesesAnuales = 0;
        let capitalAnual = 0;

        for (let mes = 0; mes < 12 && saldo > 0; mes++) {
          const interesMes = saldo * interesMensual;
          const capitalMes = Math.min(cuotaActual - interesMes, saldo);
          interesesAnuales += interesMes;
          capitalAnual += capitalMes;
          saldo -= capitalMes;
          mesesRestantes--;
        }

        // Amortización anticipada al final del año
        const amortizacionReal = Math.min(amortAnual, saldo);
        saldo -= amortizacionReal;

        // Recalcular cuota manteniendo plazo restante (reducir cuota)
        if (saldo > 0 && mesesRestantes > 0) {
          cuotaActual = calcularCuotaMensual(saldo, interesMensual, mesesRestantes);
        }

        resultados.push({
          anio: anioActual,
          saldoInicio,
          amortizacion: amortizacionReal,
          saldoFinal: saldo,
          cuotaMensual: cuotaActual,
          interesesAnuales,
          capitalAnual,
        });

        if (saldo <= 0) break;
      }

      setResultadosPeriodicos(resultados);
      setResultado(null);
      setResultadosEscenarios([]);
    }
  };

  const formatFecha = (date: Date): string => {
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long' });
  };

  const limpiar = () => {
    setImporteInicial('150000');
    setPlazoAnios('25');
    setTipoInteres('3');
    setFechaInicio('2020-01-01');
    setFechaAmortizacion('2025-01-01');
    setImporteAmortizacion('20000');
    setEscenario1('10000');
    setEscenario2('20000');
    setEscenario3('30000');
    setEscenario4('50000');
    setAmortizacionAnual('5000');
    setAniosAmortizando('10');
    setResultado(null);
    setResultadosEscenarios([]);
    setResultadosPeriodicos([]);
  };

  // Calcular totales para amortización periódica
  const totalesPeriodicos = useMemo(() => {
    if (resultadosPeriodicos.length === 0) return null;

    const totalAmortizado = resultadosPeriodicos.reduce((sum, r) => sum + r.amortizacion, 0);
    const totalIntereses = resultadosPeriodicos.reduce((sum, r) => sum + r.interesesAnuales, 0);
    const totalCapital = resultadosPeriodicos.reduce((sum, r) => sum + r.capitalAnual, 0);
    const saldoFinal = resultadosPeriodicos[resultadosPeriodicos.length - 1].saldoFinal;
    const cuotaInicial = calcularCuotaMensual(
      parseSpanishNumber(importeInicial),
      parseSpanishNumber(tipoInteres) / 100 / 12,
      parseInt(plazoAnios) * 12
    );
    const cuotaFinal = resultadosPeriodicos[resultadosPeriodicos.length - 1].cuotaMensual;

    // Calcular intereses sin amortizar
    const capital = parseSpanishNumber(importeInicial);
    const tin = parseSpanishNumber(tipoInteres);
    const anios = parseInt(plazoAnios);
    const interesMensual = tin / 100 / 12;
    const plazoMeses = anios * 12;
    const interesesSinAmortizar = calcularTotalIntereses(capital, interesMensual, plazoMeses);
    const ahorroIntereses = interesesSinAmortizar - totalIntereses - (saldoFinal > 0 ? calcularTotalIntereses(saldoFinal, interesMensual, Math.ceil(saldoFinal / cuotaFinal)) : 0);

    return {
      totalAmortizado,
      totalIntereses,
      totalCapital,
      saldoFinal,
      cuotaInicial,
      cuotaFinal,
      reduccionCuota: cuotaInicial - cuotaFinal,
      ahorroIntereses: Math.max(0, ahorroIntereses),
    };
  }, [resultadosPeriodicos, importeInicial, tipoInteres, plazoAnios]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Amortización Anticipada Hipoteca</h1>
        <p className={styles.subtitle}>
          Calcula el ahorro al amortizar: simple, multi-escenarios o plan periódico
        </p>
      </header>

      <LegalNotice lastUpdated="2026-02-02" />

      {/* Disclaimer Legal */}
      <DisclaimerCard
        variant="financial"
        severity="critical"
        collapsible={false}
        context="amortizacion-hipoteca"
      >
        <p>
          Este simulador calcula el <strong>ahorro teórico</strong> de amortizar anticipadamente.
        </p>
        <p className={styles.disclaimerHighlight}>
          <strong>ANTES de amortizar, consulta con tu banco:</strong>
        </p>
        <ul>
          <li><strong>Comisiones por amortización anticipada</strong> (hasta 0,25% en hipotecas variables, 0,15% en fijas según tiempo restante)</li>
          <li><strong>Penalizaciones específicas</strong> según tu contrato de hipoteca</li>
          <li><strong>Procedimiento y plazos</strong> para realizar la amortización</li>
          <li><strong>Alternativas de inversión</strong> con tu asesor financiero (¿es mejor invertir ese dinero en otro sitio?)</li>
        </ul>
        <p>
          <strong>La decisión de amortizar depende de tu situación financiera completa</strong> (fondo de emergencia, otras deudas, objetivos de inversión).
        </p>
      </DisclaimerCard>

      {/* Última actualización */}

      {/* Selector de modo */}
      <div className={styles.modoSelector}>
        <button
          type="button"
          className={`${styles.modoBtn} ${modo === 'simple' ? styles.modoActivo : ''}`}
          onClick={() => setModo('simple')}
        >
          <span className={styles.modoIcon}>🏠</span>
          <span className={styles.modoNombre}>Simple</span>
        </button>
        <button
          type="button"
          className={`${styles.modoBtn} ${modo === 'escenarios' ? styles.modoActivo : ''}`}
          onClick={() => setModo('escenarios')}
        >
          <span className={styles.modoIcon}>📊</span>
          <span className={styles.modoNombre}>Multi-escenarios</span>
        </button>
        <button
          type="button"
          className={`${styles.modoBtn} ${modo === 'periodica' ? styles.modoActivo : ''}`}
          onClick={() => setModo('periodica')}
        >
          <span className={styles.modoIcon}>📅</span>
          <span className={styles.modoNombre}>Periódica</span>
        </button>
      </div>

      <div className={styles.mainGrid}>
        <section className={styles.inputSection}>
          <div className={styles.inputCard}>
            <h2 className={styles.sectionTitle}>Datos del préstamo original</h2>

            <div className={styles.formGroup}>
              <label>Importe inicial (€)</label>
              <input
                type="text"
                value={importeInicial}
                onChange={(e) => setImporteInicial(e.target.value)}
                placeholder="150000"
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Plazo (años)</label>
                <input
                  type="number"
                  value={plazoAnios}
                  onChange={(e) => setPlazoAnios(e.target.value)}
                  min="1"
                  max="40"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Tipo interés (%)</label>
                <input
                  type="text"
                  value={tipoInteres}
                  onChange={(e) => setTipoInteres(e.target.value)}
                  placeholder="3"
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Fecha de inicio</label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
            </div>
          </div>

          {/* Inputs específicos según modo */}
          {modo === 'simple' && (
            <div className={styles.inputCard}>
              <h2 className={styles.sectionTitle}>Amortización anticipada</h2>
              <div className={styles.formGroup}>
                <label>Fecha de amortización</label>
                <input
                  type="date"
                  value={fechaAmortizacion}
                  onChange={(e) => setFechaAmortizacion(e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Importe a amortizar (€)</label>
                <input
                  type="text"
                  value={importeAmortizacion}
                  onChange={(e) => setImporteAmortizacion(e.target.value)}
                  placeholder="20000"
                />
              </div>
            </div>
          )}

          {modo === 'escenarios' && (
            <div className={styles.inputCard}>
              <h2 className={styles.sectionTitle}>Comparar escenarios</h2>
              <p className={styles.modoDesc}>Compara diferentes importes de amortización para encontrar el óptimo</p>
              <div className={styles.formGroup}>
                <label>Fecha de amortización</label>
                <input
                  type="date"
                  value={fechaAmortizacion}
                  onChange={(e) => setFechaAmortizacion(e.target.value)}
                />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Escenario 1 (€)</label>
                  <input
                    type="text"
                    value={escenario1}
                    onChange={(e) => setEscenario1(e.target.value)}
                    placeholder="10000"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Escenario 2 (€)</label>
                  <input
                    type="text"
                    value={escenario2}
                    onChange={(e) => setEscenario2(e.target.value)}
                    placeholder="20000"
                  />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Escenario 3 (€)</label>
                  <input
                    type="text"
                    value={escenario3}
                    onChange={(e) => setEscenario3(e.target.value)}
                    placeholder="30000"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Escenario 4 (€)</label>
                  <input
                    type="text"
                    value={escenario4}
                    onChange={(e) => setEscenario4(e.target.value)}
                    placeholder="50000"
                  />
                </div>
              </div>
            </div>
          )}

          {modo === 'periodica' && (
            <div className={styles.inputCard}>
              <h2 className={styles.sectionTitle}>Plan de amortizaciones anuales</h2>
              <p className={styles.modoDesc}>Simula amortizaciones recurrentes cada año</p>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Amortización anual (€)</label>
                  <input
                    type="text"
                    value={amortizacionAnual}
                    onChange={(e) => setAmortizacionAnual(e.target.value)}
                    placeholder="5000"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Durante (años)</label>
                  <input
                    type="number"
                    value={aniosAmortizando}
                    onChange={(e) => setAniosAmortizando(e.target.value)}
                    min="1"
                    max="30"
                  />
                </div>
              </div>
            </div>
          )}

          <div className={styles.buttonRow}>
            <button type="button" onClick={calcular} className={styles.btnPrimary}>
              Calcular
            </button>
            <button type="button" onClick={limpiar} className={styles.btnSecondary}>
              Limpiar
            </button>
          </div>
        </section>

        <section className={styles.resultSection}>
          {/* RESULTADOS MODO SIMPLE */}
          {modo === 'simple' && resultado && (
            <>
              <div className={styles.situacionActual}>
                <h2 className={styles.sectionTitle}>Situación en fecha de amortización</h2>
                <div className={styles.statsRow}>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Saldo pendiente</span>
                    <span className={styles.statValue}>{formatCurrency(resultado.saldoAntes)}</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Cuota actual</span>
                    <span className={styles.statValue}>{formatCurrency(resultado.cuotaOriginal)}</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Meses restantes</span>
                    <span className={styles.statValue}>{resultado.plazoRestanteMeses}</span>
                  </div>
                </div>
                <div className={styles.amortizacionInfo}>
                  <span>Amortización anticipada:</span>
                  <strong>{formatCurrency(resultado.importeAmortizado)}</strong>
                  <span>→ Nuevo saldo:</span>
                  <strong>{formatCurrency(resultado.saldoDespues)}</strong>
                </div>
              </div>

              <div className={styles.opcionesGrid}>
                <div className={styles.opcionCard}>
                  <div className={styles.opcionHeader}>
                    <h3>Opción 1: Reducir Cuota</h3>
                    <span className={styles.opcionTag}>Mismo plazo</span>
                  </div>
                  <div className={styles.opcionBody}>
                    <div className={styles.resultRow}>
                      <span>Nueva cuota mensual:</span>
                      <strong className={styles.highlight}>{formatCurrency(resultado.nuevaCuota)}</strong>
                    </div>
                    <div className={styles.resultRow}>
                      <span>Reducción mensual:</span>
                      <strong className={styles.saving}>-{formatCurrency(resultado.reduccionCuota)}</strong>
                    </div>
                    <div className={styles.resultRow}>
                      <span>Ahorro en intereses:</span>
                      <strong className={styles.saving}>{formatCurrency(resultado.ahorroInteresesCuota)}</strong>
                    </div>
                  </div>
                  <div className={styles.opcionFooter}>
                    <p>Pagarás menos cada mes pero durante el mismo tiempo.</p>
                  </div>
                </div>

                <div className={styles.opcionCard}>
                  <div className={styles.opcionHeader}>
                    <h3>Opción 2: Reducir Plazo</h3>
                    <span className={styles.opcionTagAlt}>Misma cuota</span>
                  </div>
                  <div className={styles.opcionBody}>
                    <div className={styles.resultRow}>
                      <span>Nuevo plazo:</span>
                      <strong className={styles.highlight}>
                        {Math.floor(resultado.nuevoPlazoMeses / 12)} años y {resultado.nuevoPlazoMeses % 12} meses
                      </strong>
                    </div>
                    <div className={styles.resultRow}>
                      <span>Reducción:</span>
                      <strong className={styles.saving}>
                        -{Math.floor(resultado.reduccionMeses / 12)} años y {resultado.reduccionMeses % 12} meses
                      </strong>
                    </div>
                    <div className={styles.resultRow}>
                      <span>Nueva fecha fin:</span>
                      <strong>{formatFecha(resultado.nuevaFechaFin)}</strong>
                    </div>
                    <div className={styles.resultRow}>
                      <span>Ahorro en intereses:</span>
                      <strong className={styles.saving}>{formatCurrency(resultado.ahorroInteresesPlazo)}</strong>
                    </div>
                  </div>
                  <div className={styles.opcionFooter}>
                    <p>Terminarás antes y ahorrarás más en intereses.</p>
                  </div>
                </div>
              </div>

              <div className={styles.recomendacion}>
                <h3>💡 Recomendación</h3>
                {resultado.ahorroInteresesPlazo > resultado.ahorroInteresesCuota ? (
                  <p>
                    <strong>Reducir plazo</strong> te ahorra <strong>{formatCurrency(resultado.ahorroInteresesPlazo - resultado.ahorroInteresesCuota)}</strong> más en intereses.
                    Es la mejor opción si puedes mantener la cuota actual.
                  </p>
                ) : (
                  <p>
                    Ambas opciones ofrecen el mismo ahorro. Elige <strong>reducir cuota</strong> si
                    prefieres más liquidez mensual, o <strong>reducir plazo</strong> para liberarte antes.
                  </p>
                )}
              </div>
            </>
          )}

          {/* RESULTADOS MODO ESCENARIOS */}
          {modo === 'escenarios' && resultadosEscenarios.length > 0 && (
            <>
              <h2 className={styles.sectionTitle}>Comparativa de escenarios</h2>
              <div className={styles.escenariosGrid}>
                {resultadosEscenarios.map((res, idx) => (
                  <div key={idx} className={styles.escenarioCard}>
                    <div className={styles.escenarioHeader}>
                      <span className={styles.escenarioNum}>Escenario {idx + 1}</span>
                      <span className={styles.escenarioImporte}>{formatCurrency(res.importeAmortizado)}</span>
                    </div>
                    <div className={styles.escenarioBody}>
                      <div className={styles.escenarioRow}>
                        <span>Nueva cuota:</span>
                        <strong>{formatCurrency(res.nuevaCuota)}</strong>
                      </div>
                      <div className={styles.escenarioRow}>
                        <span>Reducción cuota:</span>
                        <strong className={styles.saving}>-{formatCurrency(res.reduccionCuota)}/mes</strong>
                      </div>
                      <div className={styles.escenarioRow}>
                        <span>Reducción plazo:</span>
                        <strong className={styles.saving}>-{Math.floor(res.reduccionMeses / 12)}a {res.reduccionMeses % 12}m</strong>
                      </div>
                      <div className={styles.escenarioRow}>
                        <span>Ahorro intereses (cuota):</span>
                        <strong>{formatCurrency(res.ahorroInteresesCuota)}</strong>
                      </div>
                      <div className={styles.escenarioRow}>
                        <span>Ahorro intereses (plazo):</span>
                        <strong className={styles.highlight}>{formatCurrency(res.ahorroInteresesPlazo)}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.comparativaEscenarios}>
                <h3>📊 Tabla comparativa - Reducir Plazo (máximo ahorro)</h3>
                <table className={styles.comparativaTable}>
                  <thead>
                    <tr>
                      <th>Amortización</th>
                      <th>Nuevo saldo</th>
                      <th>Reducción plazo</th>
                      <th>Ahorro intereses</th>
                      <th>€ ahorrado / € invertido</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultadosEscenarios.map((res, idx) => {
                      const ratio = res.ahorroInteresesPlazo / res.importeAmortizado;
                      const mejorRatio = Math.max(...resultadosEscenarios.map(r => r.ahorroInteresesPlazo / r.importeAmortizado));
                      return (
                        <tr key={idx} className={ratio === mejorRatio ? styles.mejorEscenario : ''}>
                          <td>{formatCurrency(res.importeAmortizado)}</td>
                          <td>{formatCurrency(res.saldoDespues)}</td>
                          <td>{Math.floor(res.reduccionMeses / 12)}a {res.reduccionMeses % 12}m</td>
                          <td className={styles.better}>{formatCurrency(res.ahorroInteresesPlazo)}</td>
                          <td>{formatNumber(ratio, 2)}€</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className={styles.recomendacion}>
                <h3>💡 Análisis</h3>
                <p>
                  El escenario con mejor ratio ahorro/inversión es <strong>{formatCurrency(
                    resultadosEscenarios.reduce((best, r) =>
                      (r.ahorroInteresesPlazo / r.importeAmortizado) > (best.ahorroInteresesPlazo / best.importeAmortizado) ? r : best
                    ).importeAmortizado
                  )}</strong>.
                  A mayor amortización, mayor ahorro total pero menor rentabilidad relativa.
                </p>
              </div>
            </>
          )}

          {/* RESULTADOS MODO PERIÓDICO */}
          {modo === 'periodica' && resultadosPeriodicos.length > 0 && totalesPeriodicos && (
            <>
              <h2 className={styles.sectionTitle}>Plan de amortización periódica</h2>

              <div className={styles.resumenPeriodico}>
                <div className={styles.resumenGrid}>
                  <div className={styles.resumenItem}>
                    <span className={styles.resumenLabel}>Total amortizado</span>
                    <span className={styles.resumenValor}>{formatCurrency(totalesPeriodicos.totalAmortizado)}</span>
                  </div>
                  <div className={styles.resumenItem}>
                    <span className={styles.resumenLabel}>Saldo final</span>
                    <span className={styles.resumenValor}>{formatCurrency(totalesPeriodicos.saldoFinal)}</span>
                  </div>
                  <div className={styles.resumenItem}>
                    <span className={styles.resumenLabel}>Cuota inicial → final</span>
                    <span className={styles.resumenValor}>
                      {formatCurrency(totalesPeriodicos.cuotaInicial)} → {formatCurrency(totalesPeriodicos.cuotaFinal)}
                    </span>
                  </div>
                  <div className={styles.resumenItem}>
                    <span className={styles.resumenLabel}>Reducción cuota</span>
                    <span className={`${styles.resumenValor} ${styles.saving}`}>
                      -{formatCurrency(totalesPeriodicos.reduccionCuota)}/mes
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.tablaPeriodica}>
                <h3>📅 Evolución año a año</h3>
                <table className={styles.comparativaTable}>
                  <thead>
                    <tr>
                      <th>Año</th>
                      <th>Saldo inicio</th>
                      <th>Intereses</th>
                      <th>Capital</th>
                      <th>Amortización</th>
                      <th>Saldo final</th>
                      <th>Cuota</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultadosPeriodicos.map((r, idx) => (
                      <tr key={idx}>
                        <td>{r.anio}</td>
                        <td>{formatCurrency(r.saldoInicio)}</td>
                        <td>{formatCurrency(r.interesesAnuales)}</td>
                        <td>{formatCurrency(r.capitalAnual)}</td>
                        <td className={styles.better}>{formatCurrency(r.amortizacion)}</td>
                        <td>{formatCurrency(r.saldoFinal)}</td>
                        <td>{formatCurrency(r.cuotaMensual)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className={styles.totalRow}>
                      <td>Total</td>
                      <td>-</td>
                      <td>{formatCurrency(totalesPeriodicos.totalIntereses)}</td>
                      <td>{formatCurrency(totalesPeriodicos.totalCapital)}</td>
                      <td className={styles.better}>{formatCurrency(totalesPeriodicos.totalAmortizado)}</td>
                      <td>{formatCurrency(totalesPeriodicos.saldoFinal)}</td>
                      <td>-</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className={styles.recomendacion}>
                <h3>💡 Resumen del plan</h3>
                <p>
                  Con amortizaciones anuales de <strong>{formatCurrency(parseSpanishNumber(amortizacionAnual))}</strong> durante {aniosAmortizando} años,
                  habrás amortizado <strong>{formatCurrency(totalesPeriodicos.totalAmortizado)}</strong> y
                  tu cuota mensual pasará de <strong>{formatCurrency(totalesPeriodicos.cuotaInicial)}</strong> a <strong>{formatCurrency(totalesPeriodicos.cuotaFinal)}</strong> (
                  <span className={styles.saving}>-{formatCurrency(totalesPeriodicos.reduccionCuota)}/mes</span>).
                </p>
              </div>
            </>
          )}

          {/* PLACEHOLDER */}
          {((modo === 'simple' && !resultado) ||
            (modo === 'escenarios' && resultadosEscenarios.length === 0) ||
            (modo === 'periodica' && resultadosPeriodicos.length === 0)) && (
            <div className={styles.placeholder}>
              <div className={styles.placeholderIcon}>🏠</div>
              <p>
                {modo === 'simple' && 'Introduce los datos de tu hipoteca y la amortización anticipada para ver el resultado'}
                {modo === 'escenarios' && 'Compara diferentes importes de amortización para encontrar el escenario óptimo'}
                {modo === 'periodica' && 'Simula un plan de amortizaciones anuales y ve cómo evoluciona tu hipoteca'}
              </p>
            </div>
          )}
        </section>
      </div>

      <section className={styles.infoSection}>
        <h2>¿Qué es la amortización anticipada?</h2>
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <h3>📉 Reducir cuota</h3>
            <p>
              Mantienes el mismo plazo pero pagas menos cada mes.
              Ideal si necesitas más liquidez mensual o tienes ingresos variables.
            </p>
          </div>
          <div className={styles.infoCard}>
            <h3>⏱️ Reducir plazo</h3>
            <p>
              Mantienes la misma cuota pero terminas antes.
              <strong> Genera más ahorro en intereses</strong> porque reduces el tiempo que el dinero está prestado.
            </p>
          </div>
          <div className={styles.infoCard}>
            <h3>💰 Comisiones</h3>
            <p>
              Desde 2019, las hipotecas a tipo variable no pueden cobrar más del 0,25% (primeros 3 años) o 0,15% (resto).
              Las de tipo fijo: máximo 2% (primeros 10 años) o 1,5% (resto).
            </p>
          </div>
        </div>
      </section>

      <div className={styles.disclaimer}>
        <h3>⚠️ Aviso Importante</h3>
        <p>
          Este simulador proporciona cálculos orientativos basados en el sistema de amortización francés (cuota fija).
          Los resultados pueden variar según las condiciones específicas de tu hipoteca.
          Consulta con tu entidad bancaria antes de realizar cualquier amortización anticipada.
        </p>
      </div>

      <EducationalSection
        title="Guía de amortización anticipada de hipoteca"
        subtitle="Compara estrategias, entiende las ventajas y elige la mejor opción para tu situación"
        icon="📚"
      >
        {/* Tabla comparativa: reducir cuota vs reducir plazo */}
        <section className={styles.guideSection}>
          <h2>Comparativa: reducir cuota vs reducir plazo</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.tablaComparativa}>
              <thead>
                <tr>
                  <th>Factor</th>
                  <th>🔽 Reducir cuota</th>
                  <th>⏰ Reducir plazo</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Intereses ahorrados</td>
                  <td>Menos ahorro</td>
                  <td><strong>Más ahorro total</strong></td>
                </tr>
                <tr>
                  <td>Liquidez mensual</td>
                  <td><strong>Mejora inmediata</strong></td>
                  <td>Sin cambio hasta cancelación</td>
                </tr>
                <tr>
                  <td>Termina antes</td>
                  <td>No</td>
                  <td><strong>Sí</strong></td>
                </tr>
                <tr>
                  <td>Ideal para...</td>
                  <td>Quien necesita más renta disponible</td>
                  <td>Quien quiere pagar menos intereses</td>
                </tr>
                <tr>
                  <td>Seguridad ante imprevistos</td>
                  <td><strong>Mayor</strong> (cuota más baja)</td>
                  <td>Menor (cuota igual)</td>
                </tr>
                <tr>
                  <td>Comisión por amortización</td>
                  <td colSpan={2}>Igual en ambos casos (máx. 0,25-0,5% según ley)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Casos de uso */}
        <section className={styles.guideSection}>
          <h2>¿Cuándo usar cada modo de cálculo?</h2>
          <div className={styles.casosGrid}>
            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span className={styles.casoIcon}>💰</span>
                <span className={styles.casoNivel}>Amortización puntual</span>
              </div>
              <p className={styles.casoTip}>
                Tienes un extra de dinero (bonus, herencia, ahorro). Calcula cuánto ahorras
                amortizando ahora vs. dejarlo en depósito o inversión.
              </p>
            </div>
            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span className={styles.casoIcon}>📅</span>
                <span className={styles.casoNivel}>Amortización periódica</span>
              </div>
              <p className={styles.casoTip}>
                Puedes aportar una cantidad fija cada mes o año además de tu cuota habitual.
                Ideal para calcular el efecto de un pequeño esfuerzo sostenido.
              </p>
            </div>
            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span className={styles.casoIcon}>📊</span>
                <span className={styles.casoNivel}>Comparar escenarios</span>
              </div>
              <p className={styles.casoTip}>
                Contrasta hasta 3 importes de amortización simultáneamente. Ve de un vistazo
                cuál es la mejor estrategia según tus objetivos.
              </p>
            </div>
            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span className={styles.casoIcon}>⚠️</span>
                <span className={styles.casoNivel}>Antes de amortizar</span>
              </div>
              <p className={styles.casoTip}>
                Compara el TAE de tu hipoteca con la rentabilidad de invertir ese dinero.
                Si inviertes al 6% y pagas intereses al 2%, puede no valer la pena amortizar.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes</h2>
          <dl className={styles.faqList}>
            <div className={styles.faqItem}>
              <dt className={styles.faqPregunta}>¿Cuándo conviene amortizar hipoteca vs. invertir?</dt>
              <dd className={styles.faqRespuesta}>
                Depende del tipo de interés de tu hipoteca vs. la rentabilidad esperada de tu inversión.
                Si tu hipoteca está al 3% y puedes invertir al 7%, invertir puede ser más rentable a largo plazo.
                Si tu hipoteca está al 5-6%, amortizar es más seguro y suele compensar más.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt className={styles.faqPregunta}>¿Qué comisión me pueden cobrar por amortizar?</dt>
              <dd className={styles.faqRespuesta}>
                La Ley Hipotecaria (Ley 5/2019) limita las comisiones de amortización anticipada:
                máx. 0,25% los primeros 3 años o 0,15% entre el 3.º y 5.º año para tipo variable;
                0,25% los primeros 5 años o 0,5% los primeros 3 para tipo fijo. Muchos bancos
                las han eliminado en sus hipotecas variables.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt className={styles.faqPregunta}>¿Puedo deducir la amortización en el IRPF?</dt>
              <dd className={styles.faqRespuesta}>
                Solo si compraste antes del 1 de enero de 2013 y tienes derecho a la deducción por
                inversión en vivienda habitual. En ese caso, las amortizaciones anticipadas pueden
                ser deducibles. Consulta con un asesor fiscal.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt className={styles.faqPregunta}>¿Es lo mismo amortizar a principio o final de año?</dt>
              <dd className={styles.faqRespuesta}>
                No. Amortizar antes en el año te ahorra más intereses porque el capital pendiente
                sobre el que se calculan los intereses es menor durante más meses. La diferencia
                puede ser significativa en hipotecas grandes.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt className={styles.faqPregunta}>¿Qué es el sistema de amortización francés?</dt>
              <dd className={styles.faqRespuesta}>
                Es el sistema estándar en España: cuota mensual fija donde al principio pagas
                más intereses y menos capital, y al final más capital y menos intereses. Este
                simulador usa el sistema francés para todos sus cálculos.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt className={styles.faqPregunta}>¿Compensa amortizar en el primer tercio de la hipoteca?</dt>
              <dd className={styles.faqRespuesta}>
                Sí, especialmente en los primeros años, donde la mayor parte de la cuota son intereses.
                Cada euro que amortizas en el primer año puede ahorrarte hasta 0,80-0,90 € en intereses.
                En los últimos años, el efecto es menor porque ya queda poco capital.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt className={styles.faqPregunta}>¿Qué pasa si tengo hipoteca variable y sube el Euríbor?</dt>
              <dd className={styles.faqRespuesta}>
                En hipotecas variables, amortizar capital reduce el importe sobre el que se aplica el tipo
                de interés, protegiéndote parcialmente de subidas del Euríbor. Si reduces cuota, el efecto
                es inmediato; si reduces plazo, la protección es mayor a largo plazo.
              </dd>
            </div>
          </dl>
        </section>

        {/* Guía paso a paso */}
        <section className={styles.guideSection}>
          <h2>Cómo realizar una amortización anticipada: paso a paso</h2>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>Revisa tu contrato hipotecario</strong>
                <p>Localiza la cláusula de amortización anticipada. Verifica el tipo de hipoteca (variable/fija) y la comisión máxima aplicable según la Ley 5/2019.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>Simula el ahorro con esta calculadora</strong>
                <p>Introduce tus datos reales: importe inicial, plazo, tipo de interés y fecha actual. Compara la opción de reducir cuota vs. reducir plazo para tu caso concreto.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>Compara con alternativas de inversión</strong>
                <p>Si tu hipoteca está al 2-3%, calcula si invertir ese dinero en fondos indexados (rentabilidad media histórica 6-8% anual) puede ser más rentable a largo plazo.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>Contacta con tu banco y solicita el importe exacto</strong>
                <p>Pide el &quot;certificado de deuda&quot; o &quot;saldo pendiente&quot; actualizado al día que quieres amortizar. El banco tiene obligación de dártelo.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>Confirma la opción elegida (cuota o plazo)</strong>
                <p>Comunica al banco tu decisión por escrito. La mayoría de bancos permiten hacerlo por banca online, aunque algunos exigen ir en persona o por teléfono.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>6</span>
              <div className={styles.stepContent}>
                <strong>Verifica la nueva situación en tu próxima cuota</strong>
                <p>Comprueba que el banco ha aplicado correctamente la amortización. Si elegiste reducir cuota, verifica el nuevo importe en el recibo del mes siguiente.</p>
              </div>
            </li>
          </ol>
        </section>

        {/* Mejores prácticas */}
        <section className={styles.guideSection}>
          <h2>6 consejos para amortizar de forma inteligente</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📅</span>
              <strong>Amortiza a principios de año</strong>
              <p>Cada mes que adelantas la amortización reduce el tiempo durante el que pagas intereses. La diferencia entre enero y diciembre puede ser de cientos de euros.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🏦</span>
              <strong>Negocia la eliminación de comisiones</strong>
              <p>Muchos bancos las eliminan si llevas productos vinculados (seguro de hogar, nómina domiciliada). Pide que conste en el contrato o en una adenda firmada.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>💡</span>
              <strong>Prioriza reducir plazo vs. cuota</strong>
              <p>A igualdad de ahorro total, reducir plazo siempre genera un mayor ahorro en intereses. Solo elige reducir cuota si necesitas liquidez mensual urgentemente.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🛡️</span>
              <strong>Mantén fondo de emergencia primero</strong>
              <p>Antes de amortizar, asegúrate de tener 3-6 meses de gastos en liquidez. La hipoteca está garantizada por el inmueble; no lo priorices sobre tu seguridad financiera.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📊</span>
              <strong>Considera el impacto fiscal</strong>
              <p>Si tu hipoteca es anterior a 2013, verificar si la amortización anticipa reduce tu base de deducción por vivienda habitual puede cambiar la decisión óptima.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔄</span>
              <strong>Plan de amortizaciones anuales</strong>
              <p>Aportar 3.000-5.000 € extras cada año puede reducir el plazo en 4-6 años y ahorrarte más de 15.000 € en intereses en una hipoteca de 200.000 € al 3%.</p>
            </div>
          </div>
        </section>

        {/* Warning Box - Errores comunes */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon}>⚠️</span>
              <h2>Errores frecuentes al amortizar hipoteca</h2>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Amortizar sin consultar la comisión exacta.</strong> La ley fija los máximos, pero tu banco puede cobrar menos. Pide siempre el importe exacto antes de decidir.
              </li>
              <li>
                <strong>Amortizar y quedarse sin liquidez.</strong> Si surge un imprevisto (paro, enfermedad) y no tienes ahorros, puedes tener problemas para pagar la cuota ordinaria. La hipoteca es un préstamo a muy largo plazo.
              </li>
              <li>
                <strong>Olvidar comparar con la rentabilidad de invertir.</strong> Con tipos hipotecarios bajos (2-3%), históricamente ha sido más rentable invertir en índices bursátiles. Esta calculadora no sustituye ese análisis.
              </li>
              <li>
                <strong>No pedir confirmación escrita al banco.</strong> Siempre solicita un documento o justificante de la amortización realizada con el nuevo cuadro de amortización actualizado.
              </li>
              <li>
                <strong>Elegir reducir cuota por defecto.</strong> El banco suele proponer reducir cuota por comodidad operativa. Analiza qué te conviene según tus circunstancias, no aceptes sin comparar.
              </li>
              <li>
                <strong>Amortizar en la segunda mitad del préstamo.</strong> Si ya llevas el 60-70% del plazo, la mayor parte de los intereses ya están pagados. El ahorro es limitado; puede ser mejor destinar ese dinero a inversión o a otros objetivos.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('amortizacion-hipoteca')} />
      <ShareCard appName="amortizacion-hipoteca" />
      <Footer appName="amortizacion-hipoteca" />
    </div>
  );
}
