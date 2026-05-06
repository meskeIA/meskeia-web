'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import styles from './EstimadorPrestamos.module.css';
import { MeskeiaLogo, Footer, RelatedApps, DisclaimerCard, LegalNotice, EducationalSection, ShareCard } from '@/components';
import { formatNumber, formatCurrency, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import Chart from 'chart.js/auto';

type Sistema = 'frances' | 'aleman' | 'americano';
type ModoApp = 'simulador' | 'comparador';

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

// Interface para préstamo en comparador
interface PrestamoComparador {
  capital: string;
  plazoMeses: string;
  tin: string;
}

export default function SimuladorPrestamosPage() {
  // Estado para modo
  const [modo, setModo] = useState<ModoApp>('simulador');

  // Estados modo simulador
  const [capital, setCapital] = useState('10000');
  const [plazoMeses, setPlazoMeses] = useState('36');
  const [tin, setTin] = useState('7');
  const [comisionApertura, setComisionApertura] = useState('1');
  const [sistemaSeleccionado, setSistemaSeleccionado] = useState<Sistema>('frances');
  const [resultados, setResultados] = useState<ResultadoSistema[] | null>(null);
  const [taeCalculada, setTaeCalculada] = useState<number | null>(null);
  const [mostrarCuadro, setMostrarCuadro] = useState(false);

  // Estados para código HTML exportable
  const [htmlCode, setHtmlCode] = useState<string>('');
  const [htmlExpanded, setHtmlExpanded] = useState(false);

  // Estados modo comparador (3 préstamos)
  const [sistemaComparador, setSistemaComparador] = useState<Sistema>('frances');
  const [prestamo1, setPrestamo1] = useState<PrestamoComparador>({ capital: '10000', plazoMeses: '24', tin: '7' });
  const [prestamo2, setPrestamo2] = useState<PrestamoComparador>({ capital: '15000', plazoMeses: '36', tin: '6,5' });
  const [prestamo3, setPrestamo3] = useState<PrestamoComparador>({ capital: '20000', plazoMeses: '48', tin: '6' });

  // Ref para gráfico
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

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

  // Función para generar código HTML exportable del cuadro de amortización
  const generarCodigoHTML = useCallback(() => {
    if (!resultadoActual) {
      setHtmlCode('');
      return;
    }

    const nombreSistema = resultadoActual.nombre;
    const C = parseSpanishNumber(capital);

    let codigo = '<!-- Cuadro de Amortización generado con meskeIA -->\n\n';
    codigo += '<div class="cuadro-amortizacion">\n';
    codigo += `  <h2>Cuadro de Amortización - ${nombreSistema}</h2>\n`;
    codigo += '  <table>\n';
    codigo += '    <thead>\n';
    codigo += '      <tr>\n';
    codigo += '        <th>Mes</th>\n';
    codigo += '        <th>Cuota</th>\n';
    codigo += '        <th>Interés</th>\n';
    codigo += '        <th>Amortización</th>\n';
    codigo += '        <th>Saldo Pendiente</th>\n';
    codigo += '      </tr>\n';
    codigo += '    </thead>\n';
    codigo += '    <tbody>\n';

    resultadoActual.cuotas.forEach((c) => {
      codigo += '      <tr>\n';
      codigo += `        <td>${c.mes}</td>\n`;
      codigo += `        <td>${formatCurrency(c.cuota)}</td>\n`;
      codigo += `        <td>${formatCurrency(c.interes)}</td>\n`;
      codigo += `        <td>${formatCurrency(c.amortizacion)}</td>\n`;
      codigo += `        <td>${formatCurrency(c.saldoPendiente)}</td>\n`;
      codigo += '      </tr>\n';
    });

    codigo += '    </tbody>\n';
    codigo += '    <tfoot>\n';
    codigo += '      <tr>\n';
    codigo += '        <td><strong>Total</strong></td>\n';
    codigo += `        <td><strong>${formatCurrency(resultadoActual.cuotas.reduce((s, c) => s + c.cuota, 0))}</strong></td>\n`;
    codigo += `        <td><strong>${formatCurrency(resultadoActual.totalIntereses)}</strong></td>\n`;
    codigo += `        <td><strong>${formatCurrency(C)}</strong></td>\n`;
    codigo += '        <td>-</td>\n';
    codigo += '      </tr>\n';
    codigo += '    </tfoot>\n';
    codigo += '  </table>\n';
    codigo += '</div>\n\n';
    codigo += '<style>\n';
    codigo += '.cuadro-amortizacion {\n';
    codigo += '  max-width: 900px;\n';
    codigo += '  margin: 2rem auto;\n';
    codigo += '  padding: 1.5rem;\n';
    codigo += '  background: #ffffff;\n';
    codigo += '  border: 1px solid #e5e5e5;\n';
    codigo += '  border-radius: 12px;\n';
    codigo += '  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);\n';
    codigo += '}\n';
    codigo += '.cuadro-amortizacion h2 {\n';
    codigo += '  text-align: center;\n';
    codigo += '  color: #2E86AB;\n';
    codigo += '  margin-bottom: 1.5rem;\n';
    codigo += '}\n';
    codigo += '.cuadro-amortizacion table {\n';
    codigo += '  width: 100%;\n';
    codigo += '  border-collapse: collapse;\n';
    codigo += '}\n';
    codigo += '.cuadro-amortizacion th,\n';
    codigo += '.cuadro-amortizacion td {\n';
    codigo += '  padding: 0.75rem;\n';
    codigo += '  text-align: right;\n';
    codigo += '  border-bottom: 1px solid #e5e5e5;\n';
    codigo += '}\n';
    codigo += '.cuadro-amortizacion th {\n';
    codigo += '  background: linear-gradient(135deg, #2E86AB 0%, #48A9A6 100%);\n';
    codigo += '  color: white;\n';
    codigo += '  font-weight: 600;\n';
    codigo += '}\n';
    codigo += '.cuadro-amortizacion th:first-child,\n';
    codigo += '.cuadro-amortizacion td:first-child {\n';
    codigo += '  text-align: left;\n';
    codigo += '}\n';
    codigo += '.cuadro-amortizacion tfoot td {\n';
    codigo += '  background: #f5f5f5;\n';
    codigo += '  font-weight: 600;\n';
    codigo += '  border-top: 2px solid #2E86AB;\n';
    codigo += '}\n';
    codigo += '</style>';

    setHtmlCode(codigo);
  }, [resultadoActual, capital]);

  // Efecto para generar código HTML automáticamente
  useEffect(() => {
    generarCodigoHTML();
  }, [generarCodigoHTML]);

  // Función para copiar código HTML al portapapeles
  const copiarCodigo = () => {
    navigator.clipboard.writeText(htmlCode);
  };

  // Función para calcular un préstamo según el sistema seleccionado
  const calcularPrestamo = (C: number, n: number, tinAnual: number, sistema: Sistema) => {
    if (isNaN(C) || isNaN(n) || isNaN(tinAnual) || C <= 0 || n <= 0 || tinAnual < 0) {
      return null;
    }
    const i = tinAnual / 100 / 12;
    let cuotas: CuotaMensual[];

    if (sistema === 'frances') {
      cuotas = calcularSistemaFrances(C, n, i);
    } else if (sistema === 'aleman') {
      cuotas = calcularSistemaAleman(C, n, i);
    } else {
      cuotas = calcularSistemaAmericano(C, n, i);
    }

    const totalPagado = cuotas.reduce((sum, c) => sum + c.cuota, 0);
    const totalIntereses = cuotas.reduce((sum, c) => sum + c.interes, 0);

    return {
      cuotas,
      totalPagado,
      totalIntereses,
      cuotaMedia: totalPagado / n,
      cuotaInicial: cuotas[0]?.cuota || 0,
      cuotaFinal: cuotas[cuotas.length - 1]?.cuota || 0,
    };
  };

  // Datos para modo comparador
  const datosComparador = useMemo(() => {
    const prestamos = [prestamo1, prestamo2, prestamo3];
    const resultados = prestamos.map((p, idx) => {
      const C = parseSpanishNumber(p.capital);
      const n = parseInt(p.plazoMeses);
      const tinAnual = parseSpanishNumber(p.tin);
      const resultado = calcularPrestamo(C, n, tinAnual, sistemaComparador);

      if (!resultado) {
        return {
          nombre: `Préstamo ${idx + 1}`,
          capital: 0,
          plazo: 0,
          tin: 0,
          cuotaMedia: 0,
          totalIntereses: 0,
          totalPagado: 0,
          evolucionSaldo: [],
          valido: false,
        };
      }

      return {
        nombre: `Préstamo ${idx + 1}`,
        capital: C,
        plazo: n,
        tin: tinAnual,
        cuotaMedia: resultado.cuotaMedia,
        cuotaInicial: resultado.cuotaInicial,
        cuotaFinal: resultado.cuotaFinal,
        totalIntereses: resultado.totalIntereses,
        totalPagado: resultado.totalPagado,
        evolucionSaldo: resultado.cuotas.map(c => c.saldoPendiente),
        valido: true,
      };
    });

    // Encontrar el plazo más largo para el gráfico
    const maxPlazo = Math.max(...resultados.filter(r => r.valido).map(r => r.plazo));

    return { resultados, maxPlazo };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prestamo1, prestamo2, prestamo3, sistemaComparador]);

  // Efecto para crear/actualizar el gráfico
  useEffect(() => {
    if (modo !== 'comparador' || !chartRef.current) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    const { resultados, maxPlazo } = datosComparador;
    const validResults = resultados.filter(r => r.valido);

    if (validResults.length === 0 || maxPlazo === 0) return;

    const labels = Array.from({ length: maxPlazo + 1 }, (_, i) => i === 0 ? 'Inicio' : `Mes ${i}`);
    const colores = ['#2E86AB', '#48A9A6', '#7FB3D3'];

    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: validResults.map((r, idx) => {
          // Crear array con saldo inicial + evolución
          const data = [r.capital, ...r.evolucionSaldo];
          // Rellenar con 0 si el plazo es menor que el máximo
          while (data.length < maxPlazo + 1) {
            data.push(0);
          }

          return {
            label: `${r.nombre} (${formatCurrency(r.capital)}, ${r.plazo}m)`,
            data,
            borderColor: colores[idx],
            backgroundColor: `${colores[idx]}20`,
            fill: false,
            tension: 0.3,
            pointRadius: 2,
          };
        }),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { usePointStyle: true, padding: 15 },
          },
          tooltip: {
            callbacks: {
              label: (context) => `${context.dataset.label}: ${formatCurrency(context.parsed.y ?? 0)}`,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Saldo pendiente' },
            ticks: {
              callback: (value) => formatCurrency(Number(value)),
            },
          },
          x: {
            title: { display: true, text: 'Tiempo' },
          },
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [modo, datosComparador]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Estimador de Préstamos</h1>
        <p className={styles.subtitle}>
          Compara sistemas de amortización: Francés, Alemán y Americano
        </p>
      </header>

      <LegalNotice lastUpdated="2026-02-02" />

      {/* Disclaimer Legal */}
      <DisclaimerCard
        variant="financial"
        severity="critical"
        collapsible={false}
        context="estimador-prestamos"
      >
        <p>
          Este simulador proporciona <strong>estimaciones educativas</strong> de préstamos personales.
        </p>
        <p>
          <strong>⚠️ Factores NO incluidos:</strong>
        </p>
        <ul>
          <li><strong>Comisiones bancarias:</strong> Apertura, estudio, gestión, amortización anticipada</li>
          <li><strong>Seguros vinculados:</strong> Muchos préstamos requieren seguro de vida/paro</li>
          <li><strong>Tu situación crediticia:</strong> Los bancos evalúan historial crediticio y solvencia</li>
          <li><strong>Ofertas comerciales:</strong> Los tipos de interés reales varían según entidad y campaña</li>
          <li><strong>TAE real:</strong> La TAE incluye todos los costes asociados (puede ser muy superior al TIN)</li>
        </ul>
        <p>
          <strong>Compara ofertas de múltiples bancos</strong> antes de solicitar un préstamo. Lee siempre
          la letra pequeña y el cuadro de información precontractual.
        </p>
      </DisclaimerCard>

      {/* Última actualización */}
      

      {/* Selector de Modo */}
      <div className={styles.modoSelector}>
        <button
          type="button"
          className={`${styles.modoBtn} ${modo === 'simulador' ? styles.modoActivo : ''}`}
          onClick={() => setModo('simulador')}
        >
          <span className={styles.modoIcon}>🧮</span>
          <span className={styles.modoNombre}>Simulador</span>
        </button>
        <button
          type="button"
          className={`${styles.modoBtn} ${modo === 'comparador' ? styles.modoActivo : ''}`}
          onClick={() => setModo('comparador')}
        >
          <span className={styles.modoIcon}>📊</span>
          <span className={styles.modoNombre}>Comparador</span>
        </button>
      </div>

      {modo === 'simulador' ? (
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
      ) : (
        /* Modo Comparador */
        <div className={styles.comparadorContent}>
          {/* Selector de sistema de amortización */}
          <div className={styles.sistemaSelector}>
            <span className={styles.sistemaLabel}>Sistema de amortización:</span>
            <div className={styles.sistemaBtns}>
              <button
                type="button"
                className={`${styles.sistemaBtn} ${sistemaComparador === 'frances' ? styles.sistemaActivo : ''}`}
                onClick={() => setSistemaComparador('frances')}
              >
                🇫🇷 Francés
              </button>
              <button
                type="button"
                className={`${styles.sistemaBtn} ${sistemaComparador === 'aleman' ? styles.sistemaActivo : ''}`}
                onClick={() => setSistemaComparador('aleman')}
              >
                🇩🇪 Alemán
              </button>
              <button
                type="button"
                className={`${styles.sistemaBtn} ${sistemaComparador === 'americano' ? styles.sistemaActivo : ''}`}
                onClick={() => setSistemaComparador('americano')}
              >
                🇺🇸 Americano
              </button>
            </div>
          </div>

          {/* Grid de inputs para 3 préstamos */}
          <div className={styles.prestamosInputGrid}>
            {/* Préstamo 1 */}
            <div className={styles.prestamoInputCard}>
              <h3 className={styles.prestamoInputTitle}>
                <span className={styles.prestamoColor} style={{ background: '#2E86AB' }}></span>
                Préstamo 1
              </h3>
              <div className={styles.prestamoInputGroup}>
                <label>Capital (€)</label>
                <input
                  type="text"
                  value={prestamo1.capital}
                  onChange={(e) => setPrestamo1({ ...prestamo1, capital: e.target.value })}
                  placeholder="10000"
                />
              </div>
              <div className={styles.prestamoInputGroup}>
                <label>Plazo (meses)</label>
                <input
                  type="number"
                  value={prestamo1.plazoMeses}
                  onChange={(e) => setPrestamo1({ ...prestamo1, plazoMeses: e.target.value })}
                  min="1"
                  max="360"
                  placeholder="24"
                />
              </div>
              <div className={styles.prestamoInputGroup}>
                <label>TIN anual (%)</label>
                <input
                  type="text"
                  value={prestamo1.tin}
                  onChange={(e) => setPrestamo1({ ...prestamo1, tin: e.target.value })}
                  placeholder="7"
                />
              </div>
            </div>

            {/* Préstamo 2 */}
            <div className={styles.prestamoInputCard}>
              <h3 className={styles.prestamoInputTitle}>
                <span className={styles.prestamoColor} style={{ background: '#48A9A6' }}></span>
                Préstamo 2
              </h3>
              <div className={styles.prestamoInputGroup}>
                <label>Capital (€)</label>
                <input
                  type="text"
                  value={prestamo2.capital}
                  onChange={(e) => setPrestamo2({ ...prestamo2, capital: e.target.value })}
                  placeholder="15000"
                />
              </div>
              <div className={styles.prestamoInputGroup}>
                <label>Plazo (meses)</label>
                <input
                  type="number"
                  value={prestamo2.plazoMeses}
                  onChange={(e) => setPrestamo2({ ...prestamo2, plazoMeses: e.target.value })}
                  min="1"
                  max="360"
                  placeholder="36"
                />
              </div>
              <div className={styles.prestamoInputGroup}>
                <label>TIN anual (%)</label>
                <input
                  type="text"
                  value={prestamo2.tin}
                  onChange={(e) => setPrestamo2({ ...prestamo2, tin: e.target.value })}
                  placeholder="6,5"
                />
              </div>
            </div>

            {/* Préstamo 3 */}
            <div className={styles.prestamoInputCard}>
              <h3 className={styles.prestamoInputTitle}>
                <span className={styles.prestamoColor} style={{ background: '#7FB3D3' }}></span>
                Préstamo 3
              </h3>
              <div className={styles.prestamoInputGroup}>
                <label>Capital (€)</label>
                <input
                  type="text"
                  value={prestamo3.capital}
                  onChange={(e) => setPrestamo3({ ...prestamo3, capital: e.target.value })}
                  placeholder="20000"
                />
              </div>
              <div className={styles.prestamoInputGroup}>
                <label>Plazo (meses)</label>
                <input
                  type="number"
                  value={prestamo3.plazoMeses}
                  onChange={(e) => setPrestamo3({ ...prestamo3, plazoMeses: e.target.value })}
                  min="1"
                  max="360"
                  placeholder="48"
                />
              </div>
              <div className={styles.prestamoInputGroup}>
                <label>TIN anual (%)</label>
                <input
                  type="text"
                  value={prestamo3.tin}
                  onChange={(e) => setPrestamo3({ ...prestamo3, tin: e.target.value })}
                  placeholder="6"
                />
              </div>
            </div>
          </div>

          {/* Gráfico de evolución del saldo */}
          <div className={styles.chartSection}>
            <h3 className={styles.chartTitle}>Evolución del Saldo Pendiente</h3>
            <div className={styles.chartContainer}>
              <canvas ref={chartRef}></canvas>
            </div>
          </div>

          {/* Cards de resumen */}
          <div className={styles.resumenCards}>
            {datosComparador.resultados.filter(r => r.valido).map((r, idx) => {
              const colores = ['#2E86AB', '#48A9A6', '#7FB3D3'];
              const menorIntereses = Math.min(...datosComparador.resultados.filter(x => x.valido).map(x => x.totalIntereses));
              const esMejor = r.totalIntereses === menorIntereses && datosComparador.resultados.filter(x => x.valido).length > 1;

              return (
                <div
                  key={idx}
                  className={`${styles.resumenCard} ${esMejor ? styles.mejorOpcion : ''}`}
                  style={{ borderTopColor: colores[idx] }}
                >
                  {esMejor && <span className={styles.mejorBadge}>Menos intereses</span>}
                  <h4 className={styles.resumenCardTitle}>{r.nombre}</h4>
                  <div className={styles.resumenDatos}>
                    <div className={styles.resumenItem}>
                      <span>Capital</span>
                      <strong>{formatCurrency(r.capital)}</strong>
                    </div>
                    <div className={styles.resumenItem}>
                      <span>Plazo</span>
                      <strong>{r.plazo} meses</strong>
                    </div>
                    <div className={styles.resumenItem}>
                      <span>TIN</span>
                      <strong>{formatNumber(r.tin, 2)}%</strong>
                    </div>
                    <div className={styles.resumenItem}>
                      <span>Cuota media</span>
                      <strong>{formatCurrency(r.cuotaMedia)}</strong>
                    </div>
                    <div className={`${styles.resumenItem} ${styles.destacado}`}>
                      <span>Total intereses</span>
                      <strong>{formatCurrency(r.totalIntereses)}</strong>
                    </div>
                    <div className={`${styles.resumenItem} ${styles.destacado}`}>
                      <span>Total a pagar</span>
                      <strong>{formatCurrency(r.totalPagado)}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tabla comparativa */}
          {datosComparador.resultados.filter(r => r.valido).length > 0 && (
            <div className={styles.tablaComparativa}>
              <h3 className={styles.tablaTitle}>Tabla Comparativa</h3>
              <div className={styles.tableWrapper}>
                <table className={styles.comparativaTableFull}>
                  <thead>
                    <tr>
                      <th>Concepto</th>
                      {datosComparador.resultados.filter(r => r.valido).map((r, idx) => (
                        <th key={idx}>{r.nombre}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Capital</td>
                      {datosComparador.resultados.filter(r => r.valido).map((r, idx) => (
                        <td key={idx}>{formatCurrency(r.capital)}</td>
                      ))}
                    </tr>
                    <tr>
                      <td>Plazo</td>
                      {datosComparador.resultados.filter(r => r.valido).map((r, idx) => (
                        <td key={idx}>{r.plazo} meses ({formatNumber(r.plazo / 12, 1)} años)</td>
                      ))}
                    </tr>
                    <tr>
                      <td>TIN anual</td>
                      {datosComparador.resultados.filter(r => r.valido).map((r, idx) => (
                        <td key={idx}>{formatNumber(r.tin, 2)}%</td>
                      ))}
                    </tr>
                    <tr>
                      <td>Cuota inicial</td>
                      {datosComparador.resultados.filter(r => r.valido).map((r, idx) => (
                        <td key={idx}>{formatCurrency(r.cuotaInicial ?? 0)}</td>
                      ))}
                    </tr>
                    <tr>
                      <td>Cuota final</td>
                      {datosComparador.resultados.filter(r => r.valido).map((r, idx) => (
                        <td key={idx}>{formatCurrency(r.cuotaFinal ?? 0)}</td>
                      ))}
                    </tr>
                    <tr>
                      <td>Cuota media</td>
                      {datosComparador.resultados.filter(r => r.valido).map((r, idx) => (
                        <td key={idx}>{formatCurrency(r.cuotaMedia)}</td>
                      ))}
                    </tr>
                    <tr className={styles.rowHighlight}>
                      <td>Total intereses</td>
                      {datosComparador.resultados.filter(r => r.valido).map((r, idx) => {
                        const menorIntereses = Math.min(...datosComparador.resultados.filter(x => x.valido).map(x => x.totalIntereses));
                        const esMejor = r.totalIntereses === menorIntereses && datosComparador.resultados.filter(x => x.valido).length > 1;
                        return (
                          <td key={idx} className={esMejor ? styles.mejorValor : ''}>
                            {formatCurrency(r.totalIntereses)}
                            {esMejor && <span className={styles.checkMark}> ✓</span>}
                          </td>
                        );
                      })}
                    </tr>
                    <tr className={styles.rowHighlight}>
                      <td>Total a pagar</td>
                      {datosComparador.resultados.filter(r => r.valido).map((r, idx) => {
                        const menorTotal = Math.min(...datosComparador.resultados.filter(x => x.valido).map(x => x.totalPagado));
                        const esMejor = r.totalPagado === menorTotal && datosComparador.resultados.filter(x => x.valido).length > 1;
                        return (
                          <td key={idx} className={esMejor ? styles.mejorValor : ''}>
                            {formatCurrency(r.totalPagado)}
                            {esMejor && <span className={styles.checkMark}> ✓</span>}
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== SECCIONES PROFESIONALES ==================== */}

      {/* 1. HTML Code Exportable */}
      {htmlCode && (
        <section className={styles.htmlSection}>
          <div className={styles.htmlHeader}>
            <div>
              <h2>📋 Exportar Cuadro de Amortización</h2>
              <p className={styles.htmlSubtitle}>
                Copia el código HTML para usar el cuadro en tu web, blog o documento
              </p>
            </div>
            <div className={styles.htmlActions}>
              <button
                onClick={() => setHtmlExpanded(!htmlExpanded)}
                className={styles.btnToggleCode}
                aria-label={htmlExpanded ? 'Ocultar código HTML' : 'Mostrar código HTML'}
              >
                {htmlExpanded ? '▲ Ocultar' : '▼ Mostrar'} código
              </button>
              {htmlExpanded && (
                <button
                  onClick={copiarCodigo}
                  className={styles.btnCopyCode}
                  aria-label="Copiar código HTML al portapapeles"
                >
                  📋 Copiar
                </button>
              )}
            </div>
          </div>

          {htmlExpanded && (
            <div className={styles.codeContainer}>
              <pre className={styles.codeBlock}>
                <code>{htmlCode}</code>
              </pre>
            </div>
          )}
        </section>
      )}

      {/* Contenido educativo colapsable - Patrón Profesional v2.0 */}
      <EducationalSection
        title="📚 ¿Quieres entender préstamos personales en profundidad?"
        subtitle="Aprende a elegir el mejor sistema, comparar ofertas, evitar errores comunes y gestionar tu préstamo de forma inteligente"
        icon="📚"
      >
        {/* 2. Tabla Comparativa de Sistemas */}
      <section className={styles.comparativaSection}>
        <h2>⚖️ Comparativa de Sistemas de Amortización</h2>
        <p className={styles.sectionIntro}>
          Cada sistema tiene ventajas según tu situación financiera. Aquí puedes ver ejemplos reales
          con un préstamo de 10.000 € a 3 años al 7% TIN:
        </p>

        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Característica</th>
                <th>🇫🇷 Francés</th>
                <th>🇩🇪 Alemán</th>
                <th>🇺🇸 Americano</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Cuota mensual</strong></td>
                <td>308,77 € (fija)</td>
                <td>336,11 € → 279,44 € (decreciente)</td>
                <td>58,33 € (solo intereses)</td>
              </tr>
              <tr>
                <td><strong>Primera cuota</strong></td>
                <td>308,77 €</td>
                <td>336,11 €</td>
                <td>58,33 €</td>
              </tr>
              <tr>
                <td><strong>Última cuota</strong></td>
                <td>308,77 €</td>
                <td>279,44 €</td>
                <td>10.058,33 € (capital + último interés)</td>
              </tr>
              <tr>
                <td><strong>Total intereses</strong></td>
                <td>1.115,72 €</td>
                <td>1.049,99 €</td>
                <td>2.099,88 €</td>
              </tr>
              <tr>
                <td><strong>Total a pagar</strong></td>
                <td>11.115,72 €</td>
                <td>11.049,99 €</td>
                <td>12.099,88 €</td>
              </tr>
              <tr>
                <td><strong>Ventaja principal</strong></td>
                <td>Previsibilidad (cuota fija)</td>
                <td>Menor coste total</td>
                <td>Liquidez mensual alta</td>
              </tr>
              <tr>
                <td><strong>Desventaja principal</strong></td>
                <td>Intereses ligeramente más altos</td>
                <td>Cuotas iniciales elevadas</td>
                <td>Máximo coste de intereses</td>
              </tr>
              <tr>
                <td><strong>¿Cuándo elegirlo?</strong></td>
                <td>Si necesitas estabilidad presupuestaria</td>
                <td>Si puedes pagar más al principio</td>
                <td>Si esperas ingresos futuros grandes</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. Casos de Uso Reales */}
      <section className={styles.casosSection}>
        <h2>💡 Casos de Uso: ¿Cuándo solicitar un préstamo personal?</h2>
        <p className={styles.sectionIntro}>
          Los préstamos personales son útiles para financiar gastos específicos. Aquí tienes 5 ejemplos reales:
        </p>

        <div className={styles.casosGrid}>
          <div className={styles.casoCard}>
            <div className={styles.casoIcon}>🚗</div>
            <h3>Compra de coche usado</h3>
            <div className={styles.casoDetalle}>
              <p><strong>Situación:</strong> María necesita 12.000 € para un coche</p>
              <p><strong>Solución:</strong> Préstamo a 48 meses, TIN 6,5%</p>
              <p><strong>Resultado:</strong> Cuota mensual ~280 €, sin tocar ahorro de emergencia</p>
            </div>
            <div className={styles.casoTip}>
              <strong>💡 Consejo:</strong> Compara con financiación del concesionario
            </div>
          </div>

          <div className={styles.casoCard}>
            <div className={styles.casoIcon}>🏠</div>
            <h3>Reforma integral del hogar</h3>
            <div className={styles.casoDetalle}>
              <p><strong>Situación:</strong> Juan quiere reformar cocina y baño (20.000 €)</p>
              <p><strong>Solución:</strong> Préstamo a 60 meses, TIN 7%</p>
              <p><strong>Resultado:</strong> Cuota ~396 €, mejora valor vivienda +15%</p>
            </div>
            <div className={styles.casoTip}>
              <strong>💡 Consejo:</strong> Pide presupuestos detallados antes de solicitar
            </div>
          </div>

          <div className={styles.casoCard}>
            <div className={styles.casoIcon}>💳</div>
            <h3>Consolidación de deudas</h3>
            <div className={styles.casoDetalle}>
              <p><strong>Situación:</strong> Laura tiene 3 tarjetas de crédito al 22% TAE</p>
              <p><strong>Solución:</strong> Préstamo personal 15.000 € al 9% TAE</p>
              <p><strong>Resultado:</strong> Ahorro de 1.950 € en intereses, 1 sola cuota</p>
            </div>
            <div className={styles.casoTip}>
              <strong>💡 Consejo:</strong> Cancela las tarjetas tras pagar para evitar recaer
            </div>
          </div>

          <div className={styles.casoCard}>
            <div className={styles.casoIcon}>🎓</div>
            <h3>Estudios de posgrado</h3>
            <div className={styles.casoDetalle}>
              <p><strong>Situación:</strong> Carlos necesita 8.000 € para un máster</p>
              <p><strong>Solución:</strong> Préstamo a 36 meses, TIN 5,5% (oferta estudiantes)</p>
              <p><strong>Resultado:</strong> Cuota ~241 €, carencia de 6 meses durante estudio</p>
            </div>
            <div className={styles.casoTip}>
              <strong>💡 Consejo:</strong> Verifica si tu banco tiene líneas educativas especiales
            </div>
          </div>

          <div className={styles.casoCard}>
            <div className={styles.casoIcon}>💼</div>
            <h3>Arranque de negocio freelance</h3>
            <div className={styles.casoDetalle}>
              <p><strong>Situación:</strong> Ana deja su empleo y necesita 10.000 € para 6 meses</p>
              <p><strong>Solución:</strong> Préstamo a 24 meses, TIN 8%, carencia 3 meses</p>
              <p><strong>Resultado:</strong> Liquidez para arrancar sin presión inmediata</p>
            </div>
            <div className={styles.casoTip}>
              <strong>💡 Consejo:</strong> Ten plan de negocio realista antes de endeudarte
            </div>
          </div>
        </div>
      </section>

      {/* 4. FAQ */}
      <section className={styles.faqSection}>
        <h2>❓ Preguntas Frecuentes sobre Préstamos Personales</h2>

        <div className={styles.faqGrid}>
          <details className={styles.faqItem}>
            <summary className={styles.faqQuestion}>
              ¿Cuál es el sistema de amortización más usado?
            </summary>
            <div className={styles.faqAnswer}>
              <p>
                El <strong>sistema francés</strong> es el más común en banca de retail (90%+ de préstamos personales) en España y en la mayoría de países hispanohablantes.
                Ofrece cuota fija durante todo el plazo, lo que facilita la planificación presupuestaria.
              </p>
              <p>
                Los bancos lo prefieren porque al principio pagas más intereses (el banco cobra antes).
                Para ti como cliente, la ventaja es la <strong>previsibilidad</strong>: sabes exactamente
                cuánto pagarás cada mes hasta el final.
              </p>
            </div>
          </details>

          <details className={styles.faqItem}>
            <summary className={styles.faqQuestion}>
              ¿Qué diferencia hay entre TIN y TAE?
            </summary>
            <div className={styles.faqAnswer}>
              <p>
                El <strong>TIN (Tipo de Interés Nominal)</strong> es el porcentaje que el banco cobra
                por prestar el dinero, <strong>sin incluir gastos</strong>.
              </p>
              <p>
                La <strong>TAE (Tasa Anual Equivalente)</strong> incluye TIN + todas las comisiones
                (apertura, estudio, seguros obligatorios) y refleja el <strong>coste real</strong>.
              </p>
              <p>
                <strong>Ejemplo:</strong> TIN 5% puede convertirse en TAE 7,5% tras sumar comisiones.
                Compara siempre por TAE, no por TIN.
              </p>
            </div>
          </details>

          <details className={styles.faqItem}>
            <summary className={styles.faqQuestion}>
              ¿Puedo amortizar anticipadamente un préstamo personal?
            </summary>
            <div className={styles.faqAnswer}>
              <p>
                Sí, legalmente tienes derecho a amortizar (pagar por adelantado) total o parcialmente.
                El banco puede cobrarte una <strong>comisión de amortización anticipada</strong>:
              </p>
              <ul>
                <li><strong>Primer año:</strong> Máximo 1% sobre el capital amortizado</li>
                <li><strong>Después del primer año:</strong> Máximo 0,5%</li>
              </ul>
              <p>
                Algunos préstamos ofrecen <strong>amortización gratuita</strong> (sin comisión).
                Comprueba esto antes de firmar.
              </p>
            </div>
          </details>

          <details className={styles.faqItem}>
            <summary className={styles.faqQuestion}>
              ¿Qué documentos necesito para solicitar un préstamo?
            </summary>
            <div className={styles.faqAnswer}>
              <p>Documentación estándar habitual (los nombres exactos varían por país):</p>
              <ul>
                <li><strong>Documento de identidad oficial</strong> en vigor (DNI/NIE en España, INE en México, DNI en Argentina/Perú, RUT en Chile, cédula en Colombia/Ecuador, etc.)</li>
                <li><strong>Última declaración de impuestos sobre la renta</strong> (IRPF en España, ISR en México, equivalentes en otros países)</li>
                <li><strong>Recibos de salario de los últimos 3 meses</strong> (o certificado de ingresos si eres trabajador independiente)</li>
                <li><strong>Extractos bancarios de los últimos 3-6 meses</strong></li>
                <li><strong>Contrato laboral</strong> (si eres asalariado) o <strong>alta de actividad económica</strong> (si trabajas por cuenta propia)</li>
              </ul>
              <p>
                Algunos bancos pueden pedir <strong>aval</strong> o <strong>garantía</strong> si el
                importe es elevado o tu perfil crediticio es débil.
              </p>
            </div>
          </details>

          <details className={styles.faqItem}>
            <summary className={styles.faqQuestion}>
              ¿Cómo afecta mi historial crediticio a la aprobación?
            </summary>
            <div className={styles.faqAnswer}>
              <p>
                Los bancos consultan bases de datos de riesgo crediticio (<strong>CIRBE</strong> y ficheros como ASNEF/RAI en España, <strong>buró de crédito</strong> en México, <strong>BCRA</strong> en Argentina, <strong>Datacrédito</strong> en Colombia, etc.). Analizan:
              </p>
              <ul>
                <li><strong>Nivel de endeudamiento actual:</strong> ¿Tienes otros préstamos?</li>
                <li><strong>Historial de pagos:</strong> ¿Has tenido impagos?</li>
                <li><strong>Ratio ingresos/deuda:</strong> La cuota no debe superar 35-40% de tus ingresos netos</li>
              </ul>
              <p>
                Si estás en ASNEF, es muy difícil conseguir préstamos de bancos tradicionales.
                Alternativas: <strong>préstamos con aval</strong>, limpiar tu historial o microcréditos
                (cuidado con las TAE elevadas).
              </p>
            </div>
          </details>

          <details className={styles.faqItem}>
            <summary className={styles.faqQuestion}>
              ¿Es mejor un préstamo personal o una línea de crédito?
            </summary>
            <div className={styles.faqAnswer}>
              <p>Depende del uso que vayas a darle:</p>
              <table className={styles.faqComparativaTable}>
                <thead>
                  <tr>
                    <th>Aspecto</th>
                    <th>Préstamo Personal</th>
                    <th>Línea de Crédito</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Dinero disponible</strong></td>
                    <td>Todo de golpe</td>
                    <td>Usas solo lo que necesitas</td>
                  </tr>
                  <tr>
                    <td><strong>Intereses</strong></td>
                    <td>Pagas sobre todo el capital</td>
                    <td>Solo sobre lo que usas</td>
                  </tr>
                  <tr>
                    <td><strong>Cuota mensual</strong></td>
                    <td>Fija (sistema francés)</td>
                    <td>Variable según consumo</td>
                  </tr>
                  <tr>
                    <td><strong>Uso ideal</strong></td>
                    <td>Gasto único grande (coche, reforma)</td>
                    <td>Gastos variables o emergencias</td>
                  </tr>
                  <tr>
                    <td><strong>TAE típica</strong></td>
                    <td>5-10%</td>
                    <td>8-15% (más cara)</td>
                  </tr>
                </tbody>
              </table>
              <p>
                <strong>Recomendación:</strong> Préstamo personal si sabes exactamente cuánto necesitas.
                Línea de crédito para imprevistos puntuales.
              </p>
            </div>
          </details>

          <details className={styles.faqItem}>
            <summary className={styles.faqQuestion}>
              ¿Qué pasa si no puedo pagar una cuota?
            </summary>
            <div className={styles.faqAnswer}>
              <p>
                <strong>⚠️ Nunca dejes de pagar sin avisar.</strong> Consecuencias de impago:
              </p>
              <ul>
                <li><strong>Intereses de demora:</strong> Suben automáticamente (pueden triplicar el TIN)</li>
                <li><strong>Inclusión en ASNEF/RAI:</strong> Dificulta futuros créditos</li>
                <li><strong>Reclamación judicial:</strong> El banco puede demandarte</li>
                <li><strong>Embargo de bienes/nómina:</strong> En casos extremos</li>
              </ul>
              <p><strong>Soluciones si prevés dificultades:</strong></p>
              <ul>
                <li><strong>Contacta con el banco ANTES de impagar:</strong> Pide renegociar (carencia, ampliación plazo)</li>
                <li><strong>Ley de Segunda Oportunidad:</strong> Si estás sobreendeudado, puedes cancelar deudas</li>
                <li><strong>Asesoría legal gratuita:</strong> Servicios sociales de tu ayuntamiento</li>
              </ul>
            </div>
          </details>
        </div>
      </section>

      {/* 5. Guía Paso a Paso */}
      <section className={styles.guiaSection}>
        <h2>🗺️ Guía Paso a Paso: Cómo Solicitar un Préstamo Personal</h2>
        <p className={styles.sectionIntro}>
          Sigue estos 6 pasos para solicitar tu préstamo de forma inteligente y evitar sorpresas:
        </p>

        <div className={styles.stepsContainer}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <h3>📊 Calcula tu capacidad de endeudamiento</h3>
              <p>
                Antes de solicitar, calcula cuánto puedes pagar mensualmente <strong>sin comprometer
                tu estabilidad financiera</strong>:
              </p>
              <ul>
                <li>Suma tus ingresos netos mensuales (después de impuestos)</li>
                <li>Resta tus gastos fijos (alquiler, suministros, seguros, alimentación)</li>
                <li>La cuota del préstamo <strong>no debe superar el 35-40% de tus ingresos</strong></li>
              </ul>
              <div className={styles.stepExample}>
                <strong>Ejemplo:</strong> Ingresos 2.000 €/mes → Máximo recomendado para cuota: 700-800 €/mes
              </div>
            </div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <h3>🏦 Compara ofertas de múltiples bancos</h3>
              <p>
                <strong>Nunca te quedes con la primera oferta.</strong> Compara al menos 3-4 entidades:
              </p>
              <ul>
                <li><strong>Tu banco habitual:</strong> Suelen ofrecer mejores condiciones a clientes fieles</li>
                <li><strong>Bancos online:</strong> Menos costes operativos = TAE más bajas</li>
                <li><strong>Comparadores:</strong> iAhorro, Kelisto, HelpMyCash (revisan múltiples ofertas)</li>
                <li><strong>Cooperativas de crédito:</strong> Cajamar, Laboral Kutxa (buenas TAE locales)</li>
              </ul>
              <div className={styles.stepWarning}>
                ⚠️ <strong>Fíjate en la TAE, no solo en el TIN.</strong> La TAE incluye todos los costes reales.
              </div>
            </div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <h3>📄 Prepara toda la documentación</h3>
              <p>
                Reúne estos documentos antes de solicitar (acelera la aprobación):
              </p>
              <ul>
                <li>Documento de identidad oficial en vigor</li>
                <li>Últimos 3 recibos de salario (o declaración periódica de impuestos si eres trabajador independiente)</li>
                <li>Última declaración de impuestos sobre la renta</li>
                <li>Extractos bancarios de los últimos 3-6 meses</li>
                <li>Contrato de trabajo o certificado de empresa</li>
              </ul>
              <div className={styles.stepTip}>
                💡 <strong>Tip:</strong> Si eres autónomo, presenta también tu modelo 036/037 y cuentas anuales.
              </div>
            </div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <h3>📝 Lee la letra pequeña (FIPER)</h3>
              <p>
                Antes de firmar, el banco debe entregarte el <strong>FIPER (Ficha de Información
                Precontractual)</strong>. Revisa:
              </p>
              <ul>
                <li><strong>TAE final:</strong> ¿Incluye todas las comisiones y seguros?</li>
                <li><strong>Comisión de apertura:</strong> Suele ser 0,5-2% (puedes negociarla)</li>
                <li><strong>Comisión de amortización anticipada:</strong> ¿Cuánto cuesta cancelar antes?</li>
                <li><strong>Seguros vinculados:</strong> ¿Son obligatorios? (vida, paro, hogar)</li>
                <li><strong>Penalizaciones por impago:</strong> ¿Qué pasa si no puedes pagar una cuota?</li>
              </ul>
              <div className={styles.stepWarning}>
                ⚠️ Si algo no queda claro, <strong>pregunta antes de firmar.</strong> Una vez firmado, es difícil renegociar.
              </div>
            </div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>
              <h3>✍️ Firma y recibe el dinero</h3>
              <p>
                Una vez aprobado el préstamo:
              </p>
              <ul>
                <li>Firma el <strong>contrato de préstamo</strong> (puedes hacerlo digitalmente en la mayoría de bancos)</li>
                <li>El dinero se transfiere a tu cuenta en <strong>24-48 horas</strong> (bancos online) o <strong>5-7 días</strong> (bancos tradicionales)</li>
                <li>Guarda una <strong>copia del contrato y del cuadro de amortización</strong> para futuras referencias</li>
              </ul>
              <div className={styles.stepTip}>
                💡 <strong>Tip:</strong> Activa domiciliación bancaria para no olvidar ninguna cuota.
              </div>
            </div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepNumber}>6</div>
            <div className={styles.stepContent}>
              <h3>📈 Gestiona tu préstamo de forma inteligente</h3>
              <p>
                Una vez tengas el préstamo activo:
              </p>
              <ul>
                <li><strong>Amortiza anticipadamente si puedes:</strong> Reduce intereses totales</li>
                <li><strong>Revisa anualmente si puedes refinanciar:</strong> Quizá encuentres TAE mejores</li>
                <li><strong>No acumules más deudas:</strong> Evita tarjetas de crédito mientras pagas el préstamo</li>
                <li><strong>Mantén un colchón de emergencia:</strong> Equivalente a 3-6 meses de cuotas</li>
              </ul>
              <div className={styles.stepExample}>
                <strong>Ejemplo:</strong> Si tu cuota es 300 €/mes, ten 900-1.800 € de ahorro para imprevistos.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Mejores Prácticas */}
      <section className={styles.tipsSection}>
        <h2>✨ Mejores Prácticas al Solicitar un Préstamo Personal</h2>
        <p className={styles.sectionIntro}>
          Estos consejos te ayudarán a elegir el mejor préstamo y evitar problemas:
        </p>

        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <div className={styles.tipIcon}>🎯</div>
            <h3>Define el propósito claramente</h3>
            <p>
              Los préstamos <strong>con propósito definido</strong> (coche, reforma, estudios)
              suelen tener mejores TAE que los "préstamos al consumo" genéricos.
            </p>
            <p>
              <strong>Ejemplo:</strong> Préstamo coche al 5,5% TAE vs. préstamo personal genérico al 8% TAE.
            </p>
          </div>

          <div className={styles.tipCard}>
            <div className={styles.tipIcon}>💬</div>
            <h3>Negocia las condiciones</h3>
            <p>
              <strong>Todo es negociable:</strong> TAE, comisión de apertura, seguros vinculados.
              Si eres cliente con nómina domiciliada, tienes más poder de negociación.
            </p>
            <p>
              <strong>Frase mágica:</strong> "He visto una oferta mejor en [banco competidor], ¿puedes igualarla?"
            </p>
          </div>

          <div className={styles.tipCard}>
            <div className={styles.tipIcon}>⏱️</div>
            <h3>Elige el plazo con cabeza</h3>
            <p>
              <strong>Plazo corto:</strong> Cuotas altas, menos intereses totales<br />
              <strong>Plazo largo:</strong> Cuotas bajas, más intereses totales
            </p>
            <p>
              <strong>Regla de oro:</strong> El plazo debe coincidir con la vida útil del bien.
              Ejemplo: No financies un coche a 10 años (quedará obsoleto antes de pagarlo).
            </p>
          </div>

          <div className={styles.tipCard}>
            <div className={styles.tipIcon}>🛡️</div>
            <h3>Evalúa los seguros vinculados</h3>
            <p>
              Algunos bancos exigen seguros (vida, paro, hogar) para aprobar el préstamo.
              <strong>Compara el coste del seguro</strong> con aseguradoras externas.
            </p>
            <p>
              Legalmente, <strong>puedes contratar el seguro en otra compañía</strong> (Ley de Contratos
              de Crédito al Consumo). Úsalo como palanca de negociación.
            </p>
          </div>

          <div className={styles.tipCard}>
            <div className={styles.tipIcon}>📉</div>
            <h3>Evita el sobreendeudamiento</h3>
            <p>
              <strong>Regla del 35%:</strong> Tus deudas totales (préstamos + tarjetas + alquiler/hipoteca)
              no deben superar el 35-40% de tus ingresos netos.
            </p>
            <p>
              Si ya estás cerca del límite, <strong>NO solicites más crédito.</strong> Considera
              consolidar deudas o aumentar ingresos primero.
            </p>
          </div>

          <div className={styles.tipCard}>
            <div className={styles.tipIcon}>🔍</div>
            <h3>Revisa tu historial crediticio</h3>
            <p>
              Antes de solicitar, consulta tu situación en:
            </p>
            <ul>
              <li><strong>Central de riesgos del banco central de tu país:</strong> Listado de tus deudas bancarias (CIRBE en España, equivalentes en cada país)</li>
              <li><strong>Ficheros de morosidad / buró de crédito:</strong> Si apareces, corrígelo antes</li>
            </ul>
            <p>
              Puedes solicitar estos informes <strong>gratis una vez al año.</strong>
            </p>
          </div>
        </div>
      </section>

      {/* 7. Warning Box - Errores Comunes */}
      <section className={styles.warningSection}>
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon}>⚠️</span>
            <h2>Errores Comunes que Debes Evitar</h2>
          </div>
          <div className={styles.warningContent}>
            <p className={styles.warningIntro}>
              Estos son los <strong>8 errores más frecuentes</strong> al solicitar préstamos personales
              (y cómo evitarlos):
            </p>

            <div className={styles.warningList}>
              <div className={styles.warningItem}>
                <div className={styles.warningItemHeader}>
                  <span className={styles.warningNumber}>1</span>
                  <strong>No comparar múltiples ofertas</strong>
                </div>
                <p>
                  Aceptar la primera oferta sin comparar puede costarte <strong>cientos de euros extra</strong>
                  en intereses. Diferencias del 2-3% TAE parecen pequeñas, pero en préstamos grandes suman mucho.
                </p>
                <p className={styles.warningExample}>
                  <strong>Ejemplo:</strong> 15.000 € a 5 años: 7% TAE = 2.810 € intereses | 10% TAE = 4.050 € intereses
                  (<strong>diferencia de 1.240 €</strong>)
                </p>
              </div>

              <div className={styles.warningItem}>
                <div className={styles.warningItemHeader}>
                  <span className={styles.warningNumber}>2</span>
                  <strong>Fijarse solo en el TIN (ignorar la TAE)</strong>
                </div>
                <p>
                  El TIN no incluye comisiones ni seguros obligatorios. Un préstamo "TIN 5%" puede acabar
                  siendo <strong>"TAE 8%"</strong> tras sumar todos los costes.
                </p>
                <p className={styles.warningSolution}>
                  ✅ <strong>Solución:</strong> Compara siempre por TAE (es el coste real total).
                </p>
              </div>

              <div className={styles.warningItem}>
                <div className={styles.warningItemHeader}>
                  <span className={styles.warningNumber}>3</span>
                  <strong>Solicitar más dinero del necesario</strong>
                </div>
                <p>
                  "Por si acaso" es un error caro. Cada euro de más que pidas <strong>genera intereses
                  innecesarios</strong>. Además, aumenta tu ratio de endeudamiento.
                </p>
                <p className={styles.warningSolution}>
                  ✅ <strong>Solución:</strong> Calcula exactamente cuánto necesitas (presupuestos reales + margen 10%).
                </p>
              </div>

              <div className={styles.warningItem}>
                <div className={styles.warningItemHeader}>
                  <span className={styles.warningNumber}>4</span>
                  <strong>Alargar el plazo para reducir la cuota</strong>
                </div>
                <p>
                  Extender el plazo baja la cuota mensual, pero <strong>multiplica los intereses totales</strong>.
                  Un préstamo de 10.000 € al 7%: 3 años = 1.115 € intereses | 5 años = 1.875 € intereses.
                </p>
                <p className={styles.warningSolution}>
                  ✅ <strong>Solución:</strong> Elige el plazo más corto que puedas pagar cómodamente.
                </p>
              </div>

              <div className={styles.warningItem}>
                <div className={styles.warningItemHeader}>
                  <span className={styles.warningNumber}>5</span>
                  <strong>No leer el contrato completo</strong>
                </div>
                <p>
                  Las cláusulas importantes están en la letra pequeña: comisiones ocultas, seguros obligatorios,
                  penalizaciones por impago, condiciones de amortización anticipada.
                </p>
                <p className={styles.warningSolution}>
                  ✅ <strong>Solución:</strong> Lee el FIPER completo. Si algo no queda claro, pregunta ANTES de firmar.
                </p>
              </div>

              <div className={styles.warningItem}>
                <div className={styles.warningItemHeader}>
                  <span className={styles.warningNumber}>6</span>
                  <strong>Aceptar seguros vinculados sin comparar</strong>
                </div>
                <p>
                  Los seguros que te ofrece el banco suelen ser <strong>más caros</strong> que contratarlos
                  por tu cuenta. Legalmente, puedes contratar el seguro en otra aseguradora.
                </p>
                <p className={styles.warningSolution}>
                  ✅ <strong>Solución:</strong> Compara el seguro del banco con Rastreator, Acierto.com, etc.
                </p>
              </div>

              <div className={styles.warningItem}>
                <div className={styles.warningItemHeader}>
                  <span className={styles.warningNumber}>7</span>
                  <strong>Usar préstamos para gastos recurrentes</strong>
                </div>
                <p>
                  Los préstamos son para <strong>gastos puntuales</strong> (coche, reforma), NO para
                  financiar tu día a día (vacaciones, ropa, restaurantes). Eso indica un problema de ingresos.
                </p>
                <p className={styles.warningSolution}>
                  ✅ <strong>Solución:</strong> Si necesitas crédito para gastos corrientes, revisa tu presupuesto primero.
                </p>
              </div>

              <div className={styles.warningItem}>
                <div className={styles.warningItemHeader}>
                  <span className={styles.warningNumber}>8</span>
                  <strong>No tener plan B si no puedes pagar</strong>
                </div>
                <p>
                  La vida es impredecible: pérdida de empleo, enfermedad, gastos inesperados. Si entras
                  en impago, las consecuencias son graves (ASNEF, demanda judicial, embargo).
                </p>
                <p className={styles.warningSolution}>
                  ✅ <strong>Solución:</strong> Mantén un fondo de emergencia equivalente a 3-6 cuotas del préstamo.
                  Si tienes problemas, <strong>contacta con el banco ANTES de dejar de pagar</strong> (pueden renegociar).
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FIN SECCIONES PROFESIONALES ==================== */}

      <section className={styles.infoSection}>
        <h2>Sistemas de Amortización</h2>
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <h3>🇫🇷 Sistema Francés</h3>
            <p><strong>Cuota fija</strong> durante todo el préstamo.</p>
            <ul>
              <li>Al principio pagas más intereses</li>
              <li>Al final pagas más capital</li>
              <li>El más usado en banca de retail hispanohablante</li>
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
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('estimador-prestamos')} />

      <ShareCard appName="estimador-prestamos" />
      <Footer appName="estimador-prestamos" />
    </div>
  );
}
