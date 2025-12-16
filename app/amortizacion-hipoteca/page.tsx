'use client';

import { useState } from 'react';
import styles from './AmortizacionHipoteca.module.css';
import { MeskeiaLogo, Footer, RelatedApps } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatNumber, formatCurrency, parseSpanishNumber } from '@/lib';

interface ResultadoAmortizacion {
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

export default function AmortizacionHipotecaPage() {
  // Datos del préstamo original
  const [importeInicial, setImporteInicial] = useState('150000');
  const [plazoAnios, setPlazoAnios] = useState('25');
  const [tipoInteres, setTipoInteres] = useState('3');
  const [fechaInicio, setFechaInicio] = useState('2020-01-01');

  // Datos de la amortización anticipada
  const [fechaAmortizacion, setFechaAmortizacion] = useState('2025-01-01');
  const [importeAmortizacion, setImporteAmortizacion] = useState('20000');

  const [resultado, setResultado] = useState<ResultadoAmortizacion | null>(null);

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
    // Saldo pendiente después de n cuotas pagadas
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
    // Número de meses necesarios para saldar un saldo con una cuota fija
    if (interesMensual === 0) return Math.ceil(saldo / cuotaMensual);
    if (cuotaMensual <= saldo * interesMensual) return Infinity; // Cuota no cubre ni intereses
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

  const calcular = () => {
    const capital = parseSpanishNumber(importeInicial);
    const anios = parseInt(plazoAnios);
    const tin = parseSpanishNumber(tipoInteres);
    const amortizacion = parseSpanishNumber(importeAmortizacion);

    if (isNaN(capital) || isNaN(anios) || isNaN(tin) || isNaN(amortizacion)) {
      return;
    }

    const plazoTotalMeses = anios * 12;
    const interesMensual = tin / 100 / 12;

    // Calcular cuota original
    const cuotaOriginal = calcularCuotaMensual(capital, interesMensual, plazoTotalMeses);

    // Calcular meses transcurridos
    const inicio = new Date(fechaInicio);
    const fechaAmort = new Date(fechaAmortizacion);
    const mesesTranscurridos = Math.max(0,
      (fechaAmort.getFullYear() - inicio.getFullYear()) * 12 +
      (fechaAmort.getMonth() - inicio.getMonth())
    );

    if (mesesTranscurridos >= plazoTotalMeses) {
      return; // Préstamo ya terminado
    }

    // Saldo pendiente en la fecha de amortización
    const saldoAntes = calcularSaldoPendiente(capital, interesMensual, cuotaOriginal, mesesTranscurridos);

    if (amortizacion >= saldoAntes) {
      return; // No se puede amortizar más de lo que se debe
    }

    const saldoDespues = saldoAntes - amortizacion;
    const plazoRestanteMeses = plazoTotalMeses - mesesTranscurridos;

    // OPCIÓN 1: Mantener plazo, reducir cuota
    const nuevaCuota = calcularCuotaMensual(saldoDespues, interesMensual, plazoRestanteMeses);
    const reduccionCuota = cuotaOriginal - nuevaCuota;
    const totalPagarConNuevaCuota = nuevaCuota * plazoRestanteMeses;
    const interesesConNuevaCuota = totalPagarConNuevaCuota - saldoDespues;

    // OPCIÓN 2: Mantener cuota, reducir plazo
    const nuevoPlazoMeses = calcularMesesParaSaldar(saldoDespues, interesMensual, cuotaOriginal);
    const reduccionMeses = plazoRestanteMeses - nuevoPlazoMeses;
    const nuevaFechaFin = new Date(fechaAmort);
    nuevaFechaFin.setMonth(nuevaFechaFin.getMonth() + nuevoPlazoMeses);
    const totalPagarConMismaCuota = cuotaOriginal * nuevoPlazoMeses;
    const interesesConMismaCuota = totalPagarConMismaCuota - saldoDespues;

    // Intereses que se pagarían SIN amortizar (restantes)
    const interesesSinAmortizar = calcularTotalIntereses(saldoAntes, interesMensual, plazoRestanteMeses);

    // Ahorro en intereses
    const ahorroInteresesCuota = interesesSinAmortizar - interesesConNuevaCuota;
    const ahorroInteresesPlazo = interesesSinAmortizar - interesesConMismaCuota;

    setResultado({
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
    });
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
    setResultado(null);
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Amortización Anticipada Hipoteca</h1>
        <p className={styles.subtitle}>
          Calcula el ahorro al amortizar anticipadamente: reducir cuota o reducir plazo
        </p>
      </header>

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

          <div className={styles.buttonRow}>
            <button onClick={calcular} className={styles.btnPrimary}>
              Calcular
            </button>
            <button onClick={limpiar} className={styles.btnSecondary}>
              Limpiar
            </button>
          </div>
        </section>

        <section className={styles.resultSection}>
          {resultado ? (
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
                  <strong>{formatCurrency(parseSpanishNumber(importeAmortizacion))}</strong>
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

              <div className={styles.comparativa}>
                <h3>Comparativa de ahorro</h3>
                <table className={styles.comparativaTable}>
                  <thead>
                    <tr>
                      <th>Concepto</th>
                      <th>Sin amortizar</th>
                      <th>Reducir cuota</th>
                      <th>Reducir plazo</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Cuota mensual</td>
                      <td>{formatCurrency(resultado.cuotaOriginal)}</td>
                      <td className={styles.better}>{formatCurrency(resultado.nuevaCuota)}</td>
                      <td>{formatCurrency(resultado.cuotaOriginal)}</td>
                    </tr>
                    <tr>
                      <td>Plazo restante</td>
                      <td>{resultado.plazoRestanteMeses} meses</td>
                      <td>{resultado.plazoRestanteMeses} meses</td>
                      <td className={styles.better}>{resultado.nuevoPlazoMeses} meses</td>
                    </tr>
                    <tr>
                      <td>Intereses restantes</td>
                      <td>{formatCurrency(resultado.totalInteresesSinAmortizar)}</td>
                      <td>{formatCurrency(resultado.totalInteresesSinAmortizar - resultado.ahorroInteresesCuota)}</td>
                      <td className={styles.better}>{formatCurrency(resultado.totalInteresesSinAmortizar - resultado.ahorroInteresesPlazo)}</td>
                    </tr>
                    <tr className={styles.totalRow}>
                      <td>Ahorro total</td>
                      <td>-</td>
                      <td>{formatCurrency(resultado.ahorroInteresesCuota)}</td>
                      <td className={styles.better}>{formatCurrency(resultado.ahorroInteresesPlazo)}</td>
                    </tr>
                  </tbody>
                </table>
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
          ) : (
            <div className={styles.placeholder}>
              <div className={styles.placeholderIcon}>🏠</div>
              <p>Introduce los datos de tu hipoteca y la amortización anticipada para ver el resultado</p>
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

      <RelatedApps apps={getRelatedApps('amortizacion-hipoteca')} />
      <Footer appName="amortizacion-hipoteca" />
    </div>
  );
}
