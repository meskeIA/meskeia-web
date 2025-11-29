'use client';

import { useState } from 'react';
import styles from './SimuladorPrestamos.module.css';
import { MeskeiaLogo, Footer } from '@/components';
import { formatNumber, formatCurrency, parseSpanishNumber } from '@/lib';

type Sistema = 'frances' | 'aleman' | 'americano';

interface CuotaMensual {
  mes: number;
  cuota: number;
  interes: number;
  amortizacion: number;
  saldoPendiente: number;
}

interface ResultadoSistema {
  sistema: Sistema;
  nombre: string;
  cuotas: CuotaMensual[];
  totalPagado: number;
  totalIntereses: number;
  cuotaInicial: number;
  cuotaFinal: number;
}

export default function SimuladorPrestamosPage() {
  const [capital, setCapital] = useState('10000');
  const [plazoMeses, setPlazoMeses] = useState('36');
  const [tin, setTin] = useState('7');
  const [comisionApertura, setComisionApertura] = useState('1');
  const [sistemaSeleccionado, setSistemaSeleccionado] = useState<Sistema>('frances');
  const [resultados, setResultados] = useState<ResultadoSistema[] | null>(null);
  const [taeCalculada, setTaeCalculada] = useState<number | null>(null);
  const [mostrarCuadro, setMostrarCuadro] = useState(false);

  const calcularSistemaFrances = (C: number, n: number, i: number): CuotaMensual[] => {
    // Sistema Francés: Cuota fija
    // Cuota = C * i * (1+i)^n / ((1+i)^n - 1)
    const cuotaMensual = C * i * Math.pow(1 + i, n) / (Math.pow(1 + i, n) - 1);
    const cuotas: CuotaMensual[] = [];
    let saldo = C;

    for (let mes = 1; mes <= n; mes++) {
      const interesMes = saldo * i;
      const amortizacionMes = cuotaMensual - interesMes;
      saldo -= amortizacionMes;

      cuotas.push({
        mes,
        cuota: cuotaMensual,
        interes: interesMes,
        amortizacion: amortizacionMes,
        saldoPendiente: Math.max(0, saldo),
      });
    }

    return cuotas;
  };

  const calcularSistemaAleman = (C: number, n: number, i: number): CuotaMensual[] => {
    // Sistema Alemán: Amortización constante
    // Amortización = C / n (constante)
    // Interés = Saldo * i (decreciente)
    const amortizacionConstante = C / n;
    const cuotas: CuotaMensual[] = [];
    let saldo = C;

    for (let mes = 1; mes <= n; mes++) {
      const interesMes = saldo * i;
      const cuotaMes = amortizacionConstante + interesMes;
      saldo -= amortizacionConstante;

      cuotas.push({
        mes,
        cuota: cuotaMes,
        interes: interesMes,
        amortizacion: amortizacionConstante,
        saldoPendiente: Math.max(0, saldo),
      });
    }

    return cuotas;
  };

  const calcularSistemaAmericano = (C: number, n: number, i: number): CuotaMensual[] => {
    // Sistema Americano: Solo intereses, capital al final
    // Cuota mensual = C * i (solo intereses)
    // Última cuota = C * i + C (intereses + capital)
    const interesMensual = C * i;
    const cuotas: CuotaMensual[] = [];

    for (let mes = 1; mes <= n; mes++) {
      const esUltimaCuota = mes === n;
      cuotas.push({
        mes,
        cuota: esUltimaCuota ? interesMensual + C : interesMensual,
        interes: interesMensual,
        amortizacion: esUltimaCuota ? C : 0,
        saldoPendiente: esUltimaCuota ? 0 : C,
      });
    }

    return cuotas;
  };

  const calcularTAE = (C: number, n: number, tinAnual: number, comision: number): number => {
    // TAE aproximada considerando comisión de apertura
    // Fórmula simplificada: TAE = (1 + TIN/12)^12 - 1 + ajuste por comisión
    const capitalEfectivo = C - (C * comision / 100);
    const cuotaMensual = C * (tinAnual / 100 / 12) * Math.pow(1 + tinAnual / 100 / 12, n) / (Math.pow(1 + tinAnual / 100 / 12, n) - 1);

    // Buscar TAE por iteración (método de Newton-Raphson simplificado)
    let tae = tinAnual / 100;
    for (let iter = 0; iter < 100; iter++) {
      const iMensual = tae / 12;
      const valorActual = cuotaMensual * (1 - Math.pow(1 + iMensual, -n)) / iMensual;
      const diferencia = valorActual - capitalEfectivo;
      if (Math.abs(diferencia) < 0.01) break;
      tae += diferencia / capitalEfectivo * 0.1;
    }

    return tae * 100;
  };

  const calcular = () => {
    const C = parseSpanishNumber(capital);
    const n = parseInt(plazoMeses);
    const tinAnual = parseSpanishNumber(tin);
    const comision = parseSpanishNumber(comisionApertura);

    if (isNaN(C) || isNaN(n) || isNaN(tinAnual) || C <= 0 || n <= 0 || tinAnual < 0) {
      return;
    }

    const i = tinAnual / 100 / 12; // Interés mensual

    const sistemas: { id: Sistema; nombre: string; calcular: () => CuotaMensual[] }[] = [
      { id: 'frances', nombre: 'Sistema Francés', calcular: () => calcularSistemaFrances(C, n, i) },
      { id: 'aleman', nombre: 'Sistema Alemán', calcular: () => calcularSistemaAleman(C, n, i) },
      { id: 'americano', nombre: 'Sistema Americano', calcular: () => calcularSistemaAmericano(C, n, i) },
    ];

    const resultadosCalculados: ResultadoSistema[] = sistemas.map(({ id, nombre, calcular }) => {
      const cuotas = calcular();
      const totalPagado = cuotas.reduce((sum, c) => sum + c.cuota, 0);
      const totalIntereses = cuotas.reduce((sum, c) => sum + c.interes, 0);

      return {
        sistema: id,
        nombre,
        cuotas,
        totalPagado: totalPagado + (C * comision / 100),
        totalIntereses,
        cuotaInicial: cuotas[0]?.cuota || 0,
        cuotaFinal: cuotas[cuotas.length - 1]?.cuota || 0,
      };
    });

    setResultados(resultadosCalculados);
    setTaeCalculada(calcularTAE(C, n, tinAnual, comision));
    setMostrarCuadro(false);
  };

  const limpiar = () => {
    setCapital('10000');
    setPlazoMeses('36');
    setTin('7');
    setComisionApertura('1');
    setResultados(null);
    setTaeCalculada(null);
    setMostrarCuadro(false);
  };

  const resultadoActual = resultados?.find(r => r.sistema === sistemaSeleccionado);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Simulador de Préstamos</h1>
        <p className={styles.subtitle}>
          Compara sistemas de amortización: Francés, Alemán y Americano
        </p>
      </header>

      <div className={styles.mainGrid}>
        <section className={styles.inputSection}>
          <h2 className={styles.sectionTitle}>Datos del préstamo</h2>

          <div className={styles.formGroup}>
            <label>Capital solicitado (€)</label>
            <input
              type="text"
              value={capital}
              onChange={(e) => setCapital(e.target.value)}
              placeholder="10000"
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Plazo (meses)</label>
              <input
                type="number"
                value={plazoMeses}
                onChange={(e) => setPlazoMeses(e.target.value)}
                min="1"
                max="360"
              />
            </div>
            <div className={styles.formGroup}>
              <label>TIN anual (%)</label>
              <input
                type="text"
                value={tin}
                onChange={(e) => setTin(e.target.value)}
                placeholder="7"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Comisión apertura (%)</label>
            <input
              type="text"
              value={comisionApertura}
              onChange={(e) => setComisionApertura(e.target.value)}
              placeholder="1"
            />
          </div>

          <div className={styles.buttonRow}>
            <button onClick={calcular} className={styles.btnPrimary}>
              Calcular
            </button>
            <button onClick={limpiar} className={styles.btnSecondary}>
              Limpiar
            </button>
          </div>

          {taeCalculada !== null && (
            <div className={styles.taeBox}>
              <div className={styles.taeLabel}>TAE aproximada</div>
              <div className={styles.taeValue}>{formatNumber(taeCalculada, 2)}%</div>
              <p className={styles.taeNote}>
                La TAE incluye TIN + comisión de apertura
              </p>
            </div>
          )}
        </section>

        <section className={styles.resultSection}>
          <h2 className={styles.sectionTitle}>Comparativa de sistemas</h2>

          {resultados ? (
            <>
              <div className={styles.comparativaGrid}>
                {resultados.map((r) => (
                  <button
                    key={r.sistema}
                    className={`${styles.sistemaCard} ${sistemaSeleccionado === r.sistema ? styles.active : ''}`}
                    onClick={() => setSistemaSeleccionado(r.sistema)}
                  >
                    <h3>{r.nombre}</h3>
                    <div className={styles.sistemaStats}>
                      <div className={styles.statRow}>
                        <span>Cuota inicial:</span>
                        <strong>{formatCurrency(r.cuotaInicial)}</strong>
                      </div>
                      <div className={styles.statRow}>
                        <span>Cuota final:</span>
                        <strong>{formatCurrency(r.cuotaFinal)}</strong>
                      </div>
                      <div className={styles.statRow}>
                        <span>Total intereses:</span>
                        <strong>{formatCurrency(r.totalIntereses)}</strong>
                      </div>
                      <div className={`${styles.statRow} ${styles.highlight}`}>
                        <span>Total a pagar:</span>
                        <strong>{formatCurrency(r.totalPagado)}</strong>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className={styles.resumenComparativo}>
                <h3>Resumen comparativo</h3>
                <table className={styles.comparativaTable}>
                  <thead>
                    <tr>
                      <th>Sistema</th>
                      <th>1ª Cuota</th>
                      <th>Última</th>
                      <th>Total Int.</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultados.map((r) => (
                      <tr key={r.sistema} className={sistemaSeleccionado === r.sistema ? styles.rowActive : ''}>
                        <td>{r.nombre.replace('Sistema ', '')}</td>
                        <td>{formatCurrency(r.cuotaInicial)}</td>
                        <td>{formatCurrency(r.cuotaFinal)}</td>
                        <td>{formatCurrency(r.totalIntereses)}</td>
                        <td><strong>{formatCurrency(r.totalPagado)}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                onClick={() => setMostrarCuadro(!mostrarCuadro)}
                className={styles.btnToggleCuadro}
              >
                {mostrarCuadro ? '▲ Ocultar' : '▼ Ver'} cuadro de amortización ({resultadoActual?.nombre})
              </button>

              {mostrarCuadro && resultadoActual && (
                <div className={styles.cuadroAmortizacion}>
                  <h3>Cuadro de Amortización - {resultadoActual.nombre}</h3>
                  <div className={styles.tableWrapper}>
                    <table className={styles.amortizacionTable}>
                      <thead>
                        <tr>
                          <th>Mes</th>
                          <th>Cuota</th>
                          <th>Interés</th>
                          <th>Amortización</th>
                          <th>Saldo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resultadoActual.cuotas.map((c) => (
                          <tr key={c.mes}>
                            <td>{c.mes}</td>
                            <td>{formatCurrency(c.cuota)}</td>
                            <td>{formatCurrency(c.interes)}</td>
                            <td>{formatCurrency(c.amortizacion)}</td>
                            <td>{formatCurrency(c.saldoPendiente)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td><strong>Total</strong></td>
                          <td><strong>{formatCurrency(resultadoActual.cuotas.reduce((s, c) => s + c.cuota, 0))}</strong></td>
                          <td><strong>{formatCurrency(resultadoActual.totalIntereses)}</strong></td>
                          <td><strong>{formatCurrency(parseSpanishNumber(capital))}</strong></td>
                          <td>-</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className={styles.placeholder}>
              <p>Introduce los datos del préstamo y pulsa "Calcular" para ver la comparativa</p>
            </div>
          )}
        </section>
      </div>

      <section className={styles.infoSection}>
        <h2>Sistemas de Amortización</h2>
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <h3>🇫🇷 Sistema Francés</h3>
            <p><strong>Cuota fija</strong> durante todo el préstamo.</p>
            <ul>
              <li>Al principio pagas más intereses</li>
              <li>Al final pagas más capital</li>
              <li>Más usado en España</li>
              <li>Ideal si prefieres previsibilidad</li>
            </ul>
          </div>
          <div className={styles.infoCard}>
            <h3>🇩🇪 Sistema Alemán</h3>
            <p><strong>Amortización constante</strong>, cuota decreciente.</p>
            <ul>
              <li>Cuotas altas al principio</li>
              <li>Cuotas más bajas al final</li>
              <li>Pagas menos intereses totales</li>
              <li>Ideal si tienes mayor capacidad inicial</li>
            </ul>
          </div>
          <div className={styles.infoCard}>
            <h3>🇺🇸 Sistema Americano</h3>
            <p><strong>Solo intereses</strong>, capital al vencimiento.</p>
            <ul>
              <li>Cuotas muy bajas durante el préstamo</li>
              <li>Pago grande al final (capital completo)</li>
              <li>Máximo de intereses totales</li>
              <li>Ideal para inversiones con retorno final</li>
            </ul>
          </div>
        </div>
      </section>

      <section className={styles.glossarySection}>
        <h2>Glosario</h2>
        <div className={styles.glossaryGrid}>
          <div className={styles.glossaryItem}>
            <strong>TIN (Tipo de Interés Nominal)</strong>
            <p>Porcentaje que el banco cobra por prestar el dinero, sin incluir comisiones ni gastos.</p>
          </div>
          <div className={styles.glossaryItem}>
            <strong>TAE (Tasa Anual Equivalente)</strong>
            <p>Coste real del préstamo incluyendo TIN, comisiones y frecuencia de pagos. Permite comparar ofertas.</p>
          </div>
          <div className={styles.glossaryItem}>
            <strong>Amortización</strong>
            <p>Parte de la cuota destinada a devolver el capital prestado (no incluye intereses).</p>
          </div>
          <div className={styles.glossaryItem}>
            <strong>Capital pendiente</strong>
            <p>Cantidad que todavía debes al banco en un momento dado del préstamo.</p>
          </div>
        </div>
      </section>

      <div className={styles.disclaimer}>
        <h3>⚠️ Aviso Importante</h3>
        <p>
          Este simulador proporciona cálculos orientativos con fines educativos.
          Los resultados pueden variar respecto a las condiciones reales ofrecidas por entidades financieras.
          Consulta siempre con un profesional antes de contratar cualquier producto financiero.
        </p>
      </div>

      <Footer appName="simulador-prestamos" />
    </div>
  );
}
