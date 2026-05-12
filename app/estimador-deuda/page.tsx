'use client';

import { useState, useMemo } from 'react';
import styles from './EstimadorDeuda.module.css';
import { MeskeiaLogo, Footer, RelatedApps, EducationalSection, DisclaimerCard, LegalNotice, ShareCard } from '@/components';
import { formatCurrency, formatNumber, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

interface Deuda {
  id: string;
  nombre: string;
  saldo: string;
  tasaInteres: string;
  pagoMinimo: string;
}

interface ResultadoDeuda {
  nombre: string;
  saldoInicial: number;
  interesesTotales: number;
  mesesParaPagar: number;
  orden: number;
}

interface ResultadoMetodo {
  nombre: string;
  descripcion: string;
  totalIntereses: number;
  mesesTotales: number;
  deudas: ResultadoDeuda[];
  ahorroVsMinimo: number;
}

export default function CalculadoraDeudaPage() {
  const [deudas, setDeudas] = useState<Deuda[]>([
    { id: crypto.randomUUID(), nombre: 'Tarjeta de crédito', saldo: '', tasaInteres: '20', pagoMinimo: '' },
  ]);
  const [pagoExtraMensual, setPagoExtraMensual] = useState('200');
  const [mostrarResultados, setMostrarResultados] = useState(false);

  const agregarDeuda = () => {
    setDeudas([
      ...deudas,
      { id: crypto.randomUUID(), nombre: '', saldo: '', tasaInteres: '10', pagoMinimo: '' },
    ]);
  };

  const eliminarDeuda = (id: string) => {
    if (deudas.length > 1) {
      setDeudas(deudas.filter((d) => d.id !== id));
    }
  };

  const actualizarDeuda = (id: string, campo: keyof Deuda, valor: string) => {
    setDeudas(deudas.map((d) => (d.id === id ? { ...d, [campo]: valor } : d)));
  };

  // Simular el pago de deudas con un método dado
  const simularPago = (deudasOrdenadas: { nombre: string; saldo: number; tasa: number; minimo: number }[], pagoExtra: number): ResultadoDeuda[] => {
    const resultados: ResultadoDeuda[] = [];
    const saldos = deudasOrdenadas.map((d) => ({ ...d, saldoActual: d.saldo, interesesPagados: 0, meses: 0 }));
    let orden = 1;
    let mesesGlobales = 0;
    const maxMeses = 360; // 30 años máximo

    while (saldos.some((s) => s.saldoActual > 0.01) && mesesGlobales < maxMeses) {
      mesesGlobales++;

      // Aplicar intereses mensuales
      for (const s of saldos) {
        if (s.saldoActual > 0) {
          const interesMensual = (s.saldoActual * (s.tasa / 100)) / 12;
          s.interesesPagados += interesMensual;
          s.saldoActual += interesMensual;
        }
      }

      // Pagar mínimos primero
      let pagoDisponible = pagoExtra;
      for (const s of saldos) {
        if (s.saldoActual > 0) {
          const pagoMinimo = Math.min(s.minimo, s.saldoActual);
          s.saldoActual -= pagoMinimo;
          s.meses = mesesGlobales;
        }
      }

      // Aplicar pago extra a la primera deuda con saldo
      for (const s of saldos) {
        if (s.saldoActual > 0 && pagoDisponible > 0) {
          const pagoAplicado = Math.min(pagoDisponible, s.saldoActual);
          s.saldoActual -= pagoAplicado;
          pagoDisponible -= pagoAplicado;
          s.meses = mesesGlobales;

          // Si esta deuda se liquidó, registrarla
          if (s.saldoActual <= 0.01 && !resultados.find((r) => r.nombre === s.nombre)) {
            resultados.push({
              nombre: s.nombre,
              saldoInicial: s.saldo,
              interesesTotales: s.interesesPagados,
              mesesParaPagar: mesesGlobales,
              orden: orden++,
            });
          }
          break; // Solo pagar extra a una deuda a la vez
        }
      }

      // Verificar deudas que se liquidaron solo con mínimos
      for (const s of saldos) {
        if (s.saldoActual <= 0.01 && !resultados.find((r) => r.nombre === s.nombre)) {
          resultados.push({
            nombre: s.nombre,
            saldoInicial: s.saldo,
            interesesTotales: s.interesesPagados,
            mesesParaPagar: mesesGlobales,
            orden: orden++,
          });
        }
      }
    }

    return resultados;
  };

  // Calcular resultados
  const resultados = useMemo(() => {
    const deudasValidas = deudas.filter(
      (d) => parseSpanishNumber(d.saldo) > 0 && parseSpanishNumber(d.pagoMinimo) > 0
    );

    if (deudasValidas.length === 0) return null;

    const pagoExtra = parseSpanishNumber(pagoExtraMensual) || 0;
    const deudasParsed = deudasValidas.map((d) => ({
      nombre: d.nombre || 'Deuda sin nombre',
      saldo: parseSpanishNumber(d.saldo),
      tasa: parseSpanishNumber(d.tasaInteres),
      minimo: parseSpanishNumber(d.pagoMinimo),
    }));

    // Método Bola de Nieve: ordenar por saldo (menor primero)
    const bolaNieve = [...deudasParsed].sort((a, b) => a.saldo - b.saldo);
    const resultadoBolaNieve = simularPago(bolaNieve, pagoExtra);

    // Método Avalancha: ordenar por tasa de interés (mayor primero)
    const avalancha = [...deudasParsed].sort((a, b) => b.tasa - a.tasa);
    const resultadoAvalancha = simularPago(avalancha, pagoExtra);

    // Solo pago mínimo (sin extra)
    const soloMinimos = simularPago(deudasParsed, 0);

    const totalInteresBolaNieve = resultadoBolaNieve.reduce((acc, r) => acc + r.interesesTotales, 0);
    const totalInteresAvalancha = resultadoAvalancha.reduce((acc, r) => acc + r.interesesTotales, 0);
    const totalInteresSoloMinimos = soloMinimos.reduce((acc, r) => acc + r.interesesTotales, 0);

    const mesesBolaNieve = Math.max(...resultadoBolaNieve.map((r) => r.mesesParaPagar));
    const mesesAvalancha = Math.max(...resultadoAvalancha.map((r) => r.mesesParaPagar));
    const mesesSoloMinimos = Math.max(...soloMinimos.map((r) => r.mesesParaPagar));

    const metodos: ResultadoMetodo[] = [
      {
        nombre: 'Bola de Nieve',
        descripcion: 'Paga primero las deudas más pequeñas. Más victorias rápidas, mayor motivación.',
        totalIntereses: totalInteresBolaNieve,
        mesesTotales: mesesBolaNieve,
        deudas: resultadoBolaNieve,
        ahorroVsMinimo: totalInteresSoloMinimos - totalInteresBolaNieve,
      },
      {
        nombre: 'Avalancha',
        descripcion: 'Paga primero las deudas con mayor interés. Matemáticamente óptimo, menos intereses.',
        totalIntereses: totalInteresAvalancha,
        mesesTotales: mesesAvalancha,
        deudas: resultadoAvalancha,
        ahorroVsMinimo: totalInteresSoloMinimos - totalInteresAvalancha,
      },
    ];

    // Determinar el mejor método
    const mejorMetodo = totalInteresAvalancha < totalInteresBolaNieve ? 'Avalancha' : 'Bola de Nieve';
    const diferencia = Math.abs(totalInteresAvalancha - totalInteresBolaNieve);

    // Verificar si ambos métodos producen el mismo orden de pago
    const ordenBolaNieve = resultadoBolaNieve.map(d => d.nombre).join(',');
    const ordenAvalancha = resultadoAvalancha.map(d => d.nombre).join(',');
    const mismosResultados = ordenBolaNieve === ordenAvalancha && Math.abs(totalInteresBolaNieve - totalInteresAvalancha) < 1;

    return {
      metodos,
      mejorMetodo,
      diferencia,
      mismosResultados,
      totalDeuda: deudasParsed.reduce((acc, d) => acc + d.saldo, 0),
      pagoMinimoTotal: deudasParsed.reduce((acc, d) => acc + d.minimo, 0),
      soloMinimos: {
        meses: mesesSoloMinimos,
        intereses: totalInteresSoloMinimos,
      },
    };
  }, [deudas, pagoExtraMensual]);

  const calcular = () => {
    const deudasValidas = deudas.filter(
      (d) => parseSpanishNumber(d.saldo) > 0 && parseSpanishNumber(d.pagoMinimo) > 0
    );

    if (deudasValidas.length === 0) {
      alert('Añade al menos una deuda con saldo y pago mínimo');
      return;
    }

    setMostrarResultados(true);
  };

  const tiposDeuda = [
    'Tarjeta de crédito',
    'Préstamo personal',
    'Préstamo coche',
    'Crédito al consumo',
    'Línea de crédito',
    'Otro',
  ];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon}>🎯</span>
        <h1 className={styles.title}>Estimador de Deuda</h1>
        <p className={styles.subtitle}>
          Compara el método Bola de Nieve vs Avalancha. Descubre cuál te ahorra más tiempo y dinero.
        </p>
      </header>

      <LegalNotice lastUpdated="2026-02-02" />

      <div className={styles.mainContent}>
        {/* Panel de entrada */}
        <div className={styles.inputPanel}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>💳 Tus Deudas</h2>

            <div className={styles.deudasContainer}>
              {deudas.map((deuda, index) => (
                <div key={deuda.id} className={styles.deudaCard}>
                  <div className={styles.deudaHeader}>
                    <span className={styles.deudaNumero}>{index + 1}</span>
                    <select
                      value={deuda.nombre}
                      onChange={(e) => actualizarDeuda(deuda.id, 'nombre', e.target.value)}
                      className={styles.deudaNombreSelect}
                    >
                      <option value="">Selecciona tipo...</option>
                      {tiposDeuda.map((tipo) => (
                        <option key={tipo} value={tipo}>{tipo}</option>
                      ))}
                    </select>
                    {deudas.length > 1 && (
                      <button
                        type="button"
                        onClick={() => eliminarDeuda(deuda.id)}
                        className={styles.deleteBtn}
                        title="Eliminar deuda"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div className={styles.deudaGrid}>
                    <div className={styles.formGroup}>
                      <label>Saldo pendiente</label>
                      <div className={styles.inputWrapper}>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={deuda.saldo}
                          onChange={(e) => actualizarDeuda(deuda.id, 'saldo', e.target.value)}
                          placeholder="5.000"
                        />
                        <span className={styles.inputSuffix}>€</span>
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label>Interés anual (TAE)</label>
                      <div className={styles.inputWrapper}>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={deuda.tasaInteres}
                          onChange={(e) => actualizarDeuda(deuda.id, 'tasaInteres', e.target.value)}
                          placeholder="20"
                        />
                        <span className={styles.inputSuffix}>%</span>
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label>Pago mínimo mensual</label>
                      <div className={styles.inputWrapper}>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={deuda.pagoMinimo}
                          onChange={(e) => actualizarDeuda(deuda.id, 'pagoMinimo', e.target.value)}
                          placeholder="150"
                        />
                        <span className={styles.inputSuffix}>€/mes</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button type="button" onClick={agregarDeuda} className={styles.addBtn}>
              + Añadir otra deuda
            </button>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>💰 Pago Extra Mensual</h2>
            <p className={styles.sectionDesc}>
              ¿Cuánto dinero extra puedes destinar cada mes a pagar deudas (además de los mínimos)?
            </p>

            <div className={styles.formGroup}>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  inputMode="decimal"
                  value={pagoExtraMensual}
                  onChange={(e) => setPagoExtraMensual(e.target.value)}
                  placeholder="200"
                  className={styles.inputLarge}
                />
                <span className={styles.inputSuffix}>€/mes</span>
              </div>
            </div>

            <button type="button" onClick={calcular} className={styles.btnPrimary}>
              📊 Comparar Métodos
            </button>
          </section>
        </div>

        {/* Panel de resultados */}
        <div className={styles.resultsPanel}>
          {mostrarResultados && resultados ? (
            <>
              {/* Resumen */}
              <section className={styles.resumenSection}>
                <div className={styles.resumenGrid}>
                  <div className={styles.resumenItem}>
                    <span className={styles.resumenLabel}>Deuda total</span>
                    <span className={styles.resumenValor}>{formatCurrency(resultados.totalDeuda)}</span>
                  </div>
                  <div className={styles.resumenItem}>
                    <span className={styles.resumenLabel}>Pago mensual total</span>
                    <span className={styles.resumenValor}>
                      {formatCurrency(resultados.pagoMinimoTotal + parseSpanishNumber(pagoExtraMensual))}
                    </span>
                  </div>
                </div>
              </section>

              {/* Comparativa */}
              <section className={styles.comparativaSection}>
                <h2 className={styles.sectionTitle}>
                  {resultados.mismosResultados ? '📊 Tu Plan de Pago de Deudas' : '🏆 Comparativa de Métodos'}
                </h2>

                {/* Cuando los resultados son idénticos, mostrar cuadro único */}
                {resultados.mismosResultados ? (
                  <>
                    <div className={styles.mismosResultadosAviso}>
                      <span className={styles.avisoIcono}>✨</span>
                      <div>
                        <strong>¡Buenas noticias!</strong>
                        <p>
                          En tu caso, ambos métodos (Bola de Nieve y Avalancha) producen exactamente
                          el mismo resultado. Esto ocurre cuando la deuda con menor saldo también tiene
                          el mayor interés, o cuando el orden de pago coincide en ambas estrategias.
                        </p>
                      </div>
                    </div>

                    <div className={styles.metodoUnico}>
                      <div className={styles.metodoStats}>
                        <div className={styles.metodoStat}>
                          <span className={styles.metodoStatLabel}>Tiempo para liquidar todas las deudas</span>
                          <span className={styles.metodoStatValor}>
                            {Math.floor(resultados.metodos[0].mesesTotales / 12) > 0 &&
                              `${Math.floor(resultados.metodos[0].mesesTotales / 12)} años `}
                            {resultados.metodos[0].mesesTotales % 12} meses
                          </span>
                        </div>
                        <div className={styles.metodoStat}>
                          <span className={styles.metodoStatLabel}>Intereses totales a pagar</span>
                          <span className={styles.metodoStatValor}>
                            {formatCurrency(resultados.metodos[0].totalIntereses)}
                          </span>
                        </div>
                        <div className={styles.metodoStat}>
                          <span className={styles.metodoStatLabel}>Ahorro vs solo pagar mínimos</span>
                          <span className={styles.metodoStatValorPositivo}>
                            -{formatCurrency(resultados.metodos[0].ahorroVsMinimo)}
                          </span>
                        </div>
                      </div>

                      <div className={styles.ordenPago}>
                        <span className={styles.ordenTitulo}>📋 Tu orden óptimo de pago:</span>
                        <ol className={styles.ordenLista}>
                          {resultados.metodos[0].deudas.map((d, index) => (
                            <li key={d.nombre}>
                              <strong>{index + 1}.</strong> {d.nombre} ({formatCurrency(d.saldoInicial)})
                              <span className={styles.ordenDetalle}>
                                → Liquidada en {d.mesesParaPagar} meses
                              </span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Cuando hay diferencias, mostrar comparativa normal */
                  <>
                    <div className={styles.metodosGrid}>
                      {resultados.metodos.map((metodo) => (
                        <div
                          key={metodo.nombre}
                          className={`${styles.metodoCard} ${metodo.nombre === resultados.mejorMetodo ? styles.metodoGanador : ''}`}
                        >
                          {metodo.nombre === resultados.mejorMetodo && (
                            <span className={styles.metodoTag}>✨ Recomendado</span>
                          )}
                          <h3 className={styles.metodoNombre}>
                            {metodo.nombre === 'Bola de Nieve' ? '⚪' : '🏔️'} {metodo.nombre}
                          </h3>
                          <p className={styles.metodoDesc}>{metodo.descripcion}</p>

                          <div className={styles.metodoStats}>
                            <div className={styles.metodoStat}>
                              <span className={styles.metodoStatLabel}>Tiempo para liquidar</span>
                              <span className={styles.metodoStatValor}>
                                {Math.floor(metodo.mesesTotales / 12) > 0 && `${Math.floor(metodo.mesesTotales / 12)} años `}
                                {metodo.mesesTotales % 12} meses
                              </span>
                            </div>
                            <div className={styles.metodoStat}>
                              <span className={styles.metodoStatLabel}>Intereses totales</span>
                              <span className={styles.metodoStatValor}>{formatCurrency(metodo.totalIntereses)}</span>
                            </div>
                            <div className={styles.metodoStat}>
                              <span className={styles.metodoStatLabel}>Ahorro vs solo mínimos</span>
                              <span className={styles.metodoStatValorPositivo}>
                                -{formatCurrency(metodo.ahorroVsMinimo)}
                              </span>
                            </div>
                          </div>

                          <div className={styles.ordenPago}>
                            <span className={styles.ordenTitulo}>Orden de pago:</span>
                            <ol className={styles.ordenLista}>
                              {metodo.deudas.map((d) => (
                                <li key={d.nombre}>
                                  {d.nombre} ({formatCurrency(d.saldoInicial)})
                                </li>
                              ))}
                            </ol>
                          </div>
                        </div>
                      ))}
                    </div>

                    {resultados.diferencia > 10 && (
                      <div className={styles.veredicto}>
                        <span className={styles.veredictoIcono}>💡</span>
                        <p>
                          El método <strong>{resultados.mejorMetodo}</strong> implica{' '}
                          <strong>{formatCurrency(resultados.diferencia)}</strong> menos en intereses pagados.
                          {resultados.mejorMetodo === 'Bola de Nieve'
                            ? ' Aunque Avalancha genera un ahorro algo mayor en intereses, las victorias tempranas de Bola de Nieve ayudan a sostener el plan a largo plazo.'
                            : ' Avalancha minimiza intereses si mantienes la disciplina durante todo el plan.'}
                        </p>
                      </div>
                    )}

                    {resultados.diferencia <= 10 && (
                      <div className={styles.veredicto}>
                        <span className={styles.veredictoIcono}>🤝</span>
                        <p>
                          Ambos métodos son muy similares (diferencia de solo{' '}
                          <strong>{formatCurrency(resultados.diferencia)}</strong>).
                          Elige <strong>Bola de Nieve</strong> si prefieres victorias rápidas,
                          o <strong>Avalancha</strong> si quieres optimizar al máximo.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </section>

              {/* Advertencia sin pago extra */}
              {parseSpanishNumber(pagoExtraMensual) === 0 && (
                <section className={styles.advertenciaSection}>
                  <h3>⚠️ Sin pago extra</h3>
                  <p>
                    Solo pagando los mínimos tardarás{' '}
                    <strong>
                      {Math.floor(resultados.soloMinimos.meses / 12)} años y{' '}
                      {resultados.soloMinimos.meses % 12} meses
                    </strong>{' '}
                    y pagarás <strong>{formatCurrency(resultados.soloMinimos.intereses)}</strong> en intereses.
                    Añade un pago extra para acelerar el proceso.
                  </p>
                </section>
              )}
            </>
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcono}>🎯</span>
              <p>Añade tus deudas y el pago extra mensual</p>
              <p className={styles.placeholderTip}>
                Te mostraremos el mejor camino para salir de deudas
              </p>
            </div>
          )}
        </div>
      </div>

      <DisclaimerCard
        variant="financial"
        severity="high"
        context="estimador-deuda"
      />


      {/* Sección educativa */}
      <EducationalSection
        title="Guía completa: Cómo eliminar deudas"
        subtitle="Estrategias, comparativas y casos reales para salir de deudas en España"
        icon="📚"
      >
        <div className={styles.guideContent}>
          <section className={styles.guideSection}>
            <h3>⚪ Método Bola de Nieve</h3>
            <div className={styles.guideGrid}>
              <div className={styles.guideCard}>
                <h4>Cómo funciona</h4>
                <ol className={styles.pasosList}>
                  <li>Ordena las deudas de menor a mayor saldo</li>
                  <li>Paga el mínimo en todas excepto la más pequeña</li>
                  <li>Destina todo el extra a la deuda más pequeña</li>
                  <li>Al liquidarla, pasa a la siguiente</li>
                </ol>
              </div>
              <div className={styles.guideCard}>
                <h4>Ventajas</h4>
                <ul className={styles.ventajasList}>
                  <li><strong>Victorias rápidas:</strong> Liquidas deudas antes, lo que motiva</li>
                  <li><strong>Psicológicamente efectivo:</strong> Ver progreso mantiene el ánimo</li>
                  <li><strong>Simple de seguir:</strong> Solo miras el saldo</li>
                </ul>
              </div>
            </div>
          </section>

          <section className={styles.guideSection}>
            <h3>🏔️ Método Avalancha</h3>
            <div className={styles.guideGrid}>
              <div className={styles.guideCard}>
                <h4>Cómo funciona</h4>
                <ol className={styles.pasosList}>
                  <li>Ordena las deudas de mayor a menor interés</li>
                  <li>Paga el mínimo en todas excepto la de mayor interés</li>
                  <li>Destina todo el extra a la deuda con más interés</li>
                  <li>Al liquidarla, pasa a la siguiente</li>
                </ol>
              </div>
              <div className={styles.guideCard}>
                <h4>Ventajas</h4>
                <ul className={styles.ventajasList}>
                  <li><strong>Óptimo matemáticamente:</strong> Pagas menos intereses en total</li>
                  <li><strong>Más rápido:</strong> Generalmente terminas antes</li>
                  <li><strong>Ideal si las tasas varían mucho:</strong> Mayor ahorro con diferencias grandes</li>
                </ul>
              </div>
            </div>
          </section>

          <section className={styles.guideSection}>
            <h3>🤔 ¿Cuál elegir?</h3>
            <div className={styles.eleccionGrid}>
              <div className={styles.eleccionCard}>
                <h4>Elige Bola de Nieve si...</h4>
                <ul>
                  <li>Necesitas motivación y victorias rápidas</li>
                  <li>Tienes muchas deudas pequeñas</li>
                  <li>Las tasas de interés son similares</li>
                  <li>Te cuesta mantener la disciplina</li>
                </ul>
              </div>
              <div className={styles.eleccionCard}>
                <h4>Elige Avalancha si...</h4>
                <ul>
                  <li>Priorizas el ahorro de dinero</li>
                  <li>Tienes una deuda grande con alto interés</li>
                  <li>Eres disciplinado y paciente</li>
                  <li>Quieres optimizar matemáticamente</li>
                </ul>
              </div>
            </div>
          </section>

          <section className={styles.guideSection}>
            <h3>💡 Consejos Adicionales</h3>
            <ul className={styles.consejosList}>
              <li>
                <strong>Asegura un colchón mínimo de liquidez:</strong> antes de destinar todo el excedente a deuda, conviene tener disponible al menos 1 mes de gastos fijos (alquiler/hipoteca, suministros, alimentación). En situaciones de mayor incertidumbre laboral, 3-6 meses suelen ser una referencia razonable.
              </li>
              <li>
                <strong>No acumules más deuda:</strong> Congela o cancela tarjetas mientras pagas.
              </li>
              <li>
                <strong>Busca ingresos extra:</strong> Cualquier dinero extra acelera el proceso exponencialmente.
              </li>
              <li>
                <strong>Negocia tasas de interés:</strong> Llama a tus acreedores y pide reducción.
              </li>
              <li>
                <strong>Considera la reunificación de deudas:</strong> si no figuras en ficheros de morosos (ASNEF, RAI) y tienes ingresos estables, un préstamo único a menor tipo puede reducir intereses. Compara siempre la TAE final, no solo la cuota.
              </li>
            </ul>
          </section>

          {/* Tabla comparativa */}
          <section className={styles.guideSection}>
            <h3>📊 Comparativa: Bola de Nieve vs Avalancha vs Solo Mínimos</h3>
            <div className={styles.tablaWrapper}>
              <table className={styles.tabla}>
                <thead>
                  <tr>
                    <th>Criterio</th>
                    <th>⚪ Bola de Nieve</th>
                    <th>🏔️ Avalancha</th>
                    <th>Solo Mínimos</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Intereses totales</td>
                    <td>Medios</td>
                    <td>Mínimos ✅</td>
                    <td>Máximos ❌</td>
                  </tr>
                  <tr>
                    <td>Tiempo de liquidación</td>
                    <td>Medio</td>
                    <td>Más corto ✅</td>
                    <td>Más largo ❌</td>
                  </tr>
                  <tr>
                    <td>Motivación psicológica</td>
                    <td>Alta ✅</td>
                    <td>Media</td>
                    <td>Baja ❌</td>
                  </tr>
                  <tr>
                    <td>Victorias rápidas</td>
                    <td>Sí ✅</td>
                    <td>Depende</td>
                    <td>No ❌</td>
                  </tr>
                  <tr>
                    <td>Complejidad de seguimiento</td>
                    <td>Fácil ✅</td>
                    <td>Fácil ✅</td>
                    <td>Muy fácil</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className={styles.tablaNota}>* Comparativa con el mismo pago mensual total en los tres escenarios.</p>
          </section>

          {/* Casos de uso */}
          <section className={styles.guideSection}>
            <h3>🎯 Casos Reales</h3>
            <div className={styles.casosGrid}>
              <div className={styles.casoCard}>
                <span className={styles.casoIcono} aria-hidden="true">💳</span>
                <h4>Joven con 3 tarjetas</h4>
                <p>María tiene 3 tarjetas con saldos de 500 €, 1.200 € y 3.000 €, todas al 20% TAE. Como las tasas son iguales, Bola de Nieve y Avalancha producen el mismo orden de pago: liquida la de 500 € en pocos meses y avanza a la siguiente. El refuerzo psicológico de cerrar la primera cuenta puede ayudar a mantener el plan.</p>
              </div>
              <div className={styles.casoCard}>
                <span className={styles.casoIcono} aria-hidden="true">🏠</span>
                <h4>Familia con deuda cara</h4>
                <p>La familia García tiene un crédito al consumo al 24% TAE y un préstamo personal al 8%. Con Avalancha atacan primero el crédito caro y ahorran 1.800€ en intereses.</p>
              </div>
              <div className={styles.casoCard}>
                <span className={styles.casoIcono} aria-hidden="true">💰</span>
                <h4>Ingreso extra puntual</h4>
                <p>Carlos recibe 2.000€ de bonus. En lugar de gastarlos, los aplica íntegros a su deuda más cara. Ese pago único reduce su tiempo de liquidación en 8 meses.</p>
              </div>
              <div className={styles.casoCard}>
                <span className={styles.casoIcono} aria-hidden="true">🚨</span>
                <h4>Sobreendeudamiento grave</h4>
                <p>Si los pagos mínimos ya superan el 40% de tus ingresos, contacta con un asesor de deudas o el servicio de mediación de tu banco antes de aplicar cualquier método por tu cuenta.</p>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className={styles.guideSection}>
            <h3>❓ Preguntas Frecuentes</h3>
            <div className={styles.faqGrid}>
              <div className={styles.faqItem}>
                <h4>¿Qué pasa si solo pago el mínimo de la tarjeta?</h4>
                <p>Pagarás principalmente intereses y muy poco capital. Una deuda de 3.000€ al 20% TAE con pago mínimo del 3% puede tardar más de 10 años en liquidarse, pagando más de 3.000€ solo en intereses.</p>
              </div>
              <div className={styles.faqItem}>
                <h4>¿Incluyo la hipoteca en la calculadora?</h4>
                <p>Por lo general no, porque su TAE suele ser muy inferior a la de las deudas de consumo (5-15 puntos menos) y su plazo es mucho mayor. El criterio para incluirla sería puramente matemático: si su TAE supera al de tus otras deudas, tendría sentido considerarla. La deducción por vivienda habitual solo aplica si compraste antes de 2013.</p>
              </div>
              <div className={styles.faqItem}>
                <h4>¿Debo cancelar la tarjeta al pagarla?</h4>
                <p>Depende. Cancelar reduce la tentación de volver a endeudarse, pero puede afectar negativamente a tu historial crediticio. Una opción intermedia: guarda la tarjeta y no la uses habitualmente.</p>
              </div>
              <div className={styles.faqItem}>
                <h4>¿Puedo combinar Bola de Nieve y Avalancha?</h4>
                <p>Sí. Puedes empezar con Bola de Nieve para ganar confianza y cambiar a Avalancha cuando te queden pocas deudas. Lo importante es mantener la consistencia mes a mes.</p>
              </div>
              <div className={styles.faqItem}>
                <h4>¿Qué es la consolidación de deudas?</h4>
                <p>Reunificar todas las deudas en un solo préstamo a menor tipo de interés. Puede reducir la cuota mensual, pero alarga el plazo. Solo recomendable si la diferencia de tipos es significativa.</p>
              </div>
              <div className={styles.faqItem}>
                <h4>¿Qué ocurre si entro en mora?</h4>
                <p>En España, tras 90 días de impago el banco puede reportarlo a ficheros de morosos (ASNEF, RAI). Esto dificulta obtener créditos futuros. Si tienes dificultades, contacta con tu banco antes de ese plazo.</p>
              </div>
            </div>
          </section>

          {/* Warning box */}
          <div className={styles.warningBox}>
            <span className={styles.warningIcono} aria-hidden="true">🚨</span>
            <div>
              <strong>El peligro silencioso de pagar solo el mínimo</strong>
              <p>Un saldo de 5.000€ en una tarjeta al 20% TAE, pagando solo el mínimo (3% mensual), puede tardar más de 12 años en liquidarse y generar más de 5.800€ en intereses — más que el propio capital inicial. El pago extra mensual es la herramienta más poderosa para salir de deudas.</p>
            </div>
          </div>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('estimador-deuda')} />
      <ShareCard appName="estimador-deuda" />
      <Footer appName="estimador-deuda" />
    </div>
  );
}
