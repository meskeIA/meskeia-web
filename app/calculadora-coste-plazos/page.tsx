'use client';

import { useState } from 'react';
import styles from './CalculadoraCostePlazos.module.css';
import { MeskeiaLogo, Footer, RelatedApps, EducationalSection } from '@/components';
import { formatCurrency, formatNumber, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

interface Resultado {
  precioContado: number;
  totalPlazos: number;
  costeFinanciacion: number;
  porcentajeExtra: number;
  taeAproximada: number;
  cuotaMensual: number;
}

export default function CalculadoraCostePlazosPage() {
  const [precioContado, setPrecioContado] = useState('');
  const [cuotaMensual, setCuotaMensual] = useState('');
  const [numeroCuotas, setNumeroCuotas] = useState('12');
  const [entradaInicial, setEntradaInicial] = useState('0');
  const [resultado, setResultado] = useState<Resultado | null>(null);

  // Calcular TAE aproximada usando Newton-Raphson
  const calcularTAE = (principal: number, cuota: number, meses: number): number => {
    if (principal <= 0 || cuota <= 0 || meses <= 0) return 0;

    // Si el total es igual o menor al principal, TAE = 0
    const totalPagado = cuota * meses;
    if (totalPagado <= principal) return 0;

    // Newton-Raphson para encontrar la tasa mensual
    let tasaMensual = 0.01; // Estimación inicial del 1% mensual

    for (let i = 0; i < 100; i++) {
      const factor = Math.pow(1 + tasaMensual, meses);
      const valorPresente = cuota * (factor - 1) / (tasaMensual * factor);
      const derivada = cuota * (
        (meses * Math.pow(1 + tasaMensual, meses - 1) * tasaMensual * factor -
         (factor - 1) * (factor + meses * tasaMensual * Math.pow(1 + tasaMensual, meses - 1))) /
        Math.pow(tasaMensual * factor, 2)
      );

      const error = valorPresente - principal;
      if (Math.abs(error) < 0.01) break;

      tasaMensual = tasaMensual - error / derivada;
      if (tasaMensual <= 0) tasaMensual = 0.001;
    }

    // Convertir tasa mensual a TAE
    const tae = (Math.pow(1 + tasaMensual, 12) - 1) * 100;
    return Math.max(0, tae);
  };

  const calcular = () => {
    const precio = parseSpanishNumber(precioContado);
    const cuota = parseSpanishNumber(cuotaMensual);
    const meses = parseInt(numeroCuotas) || 0;
    const entrada = parseSpanishNumber(entradaInicial) || 0;

    if (precio <= 0 || cuota <= 0 || meses <= 0) {
      alert('Por favor, introduce valores válidos');
      return;
    }

    const totalPlazos = entrada + (cuota * meses);
    const costeFinanciacion = totalPlazos - precio;
    const porcentajeExtra = (costeFinanciacion / precio) * 100;

    // Calcular TAE sobre el importe financiado (sin entrada)
    const importeFinanciado = precio - entrada;
    const tae = calcularTAE(importeFinanciado, cuota, meses);

    setResultado({
      precioContado: precio,
      totalPlazos,
      costeFinanciacion,
      porcentajeExtra,
      taeAproximada: tae,
      cuotaMensual: cuota,
    });
  };

  const limpiar = () => {
    setPrecioContado('');
    setCuotaMensual('');
    setNumeroCuotas('12');
    setEntradaInicial('0');
    setResultado(null);
  };

  // Ejemplos comunes
  const ejemplos = [
    { nombre: 'iPhone 15 Pro', precio: '1329', cuota: '55,38', meses: '24', entrada: '0' },
    { nombre: 'Televisor 65"', precio: '899', cuota: '79,92', meses: '12', entrada: '0' },
    { nombre: 'Lavadora', precio: '549', cuota: '49,91', meses: '12', entrada: '0' },
    { nombre: 'Portátil Gaming', precio: '1499', cuota: '83,28', meses: '20', entrada: '0' },
  ];

  const cargarEjemplo = (ejemplo: typeof ejemplos[0]) => {
    setPrecioContado(ejemplo.precio);
    setCuotaMensual(ejemplo.cuota);
    setNumeroCuotas(ejemplo.meses);
    setEntradaInicial(ejemplo.entrada);
    setResultado(null);
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon}>💳</span>
        <h1 className={styles.title}>Calculadora Coste Real a Plazos</h1>
        <p className={styles.subtitle}>
          Descubre cuánto pagas realmente al financiar un producto. Calcula la TAE y los intereses ocultos.
        </p>
      </header>

      <div className={styles.mainContent}>
        {/* Panel de entrada */}
        <div className={styles.inputPanel}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>📊 Datos de la Financiación</h2>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="precioContado">Precio de contado</label>
                <div className={styles.inputWrapper}>
                  <input
                    id="precioContado"
                    type="text"
                    inputMode="decimal"
                    value={precioContado}
                    onChange={(e) => setPrecioContado(e.target.value)}
                    placeholder="1.299,00"
                  />
                  <span className={styles.inputSuffix}>€</span>
                </div>
                <span className={styles.helper}>El precio si pagas al momento</span>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="entradaInicial">Entrada inicial (opcional)</label>
                <div className={styles.inputWrapper}>
                  <input
                    id="entradaInicial"
                    type="text"
                    inputMode="decimal"
                    value={entradaInicial}
                    onChange={(e) => setEntradaInicial(e.target.value)}
                    placeholder="0"
                  />
                  <span className={styles.inputSuffix}>€</span>
                </div>
                <span className={styles.helper}>Pago inicial al contratar</span>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="cuotaMensual">Cuota mensual</label>
                <div className={styles.inputWrapper}>
                  <input
                    id="cuotaMensual"
                    type="text"
                    inputMode="decimal"
                    value={cuotaMensual}
                    onChange={(e) => setCuotaMensual(e.target.value)}
                    placeholder="55,38"
                  />
                  <span className={styles.inputSuffix}>€/mes</span>
                </div>
                <span className={styles.helper}>Lo que pagas cada mes</span>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="numeroCuotas">Número de cuotas</label>
                <select
                  id="numeroCuotas"
                  value={numeroCuotas}
                  onChange={(e) => setNumeroCuotas(e.target.value)}
                >
                  <option value="3">3 meses</option>
                  <option value="6">6 meses</option>
                  <option value="10">10 meses</option>
                  <option value="12">12 meses</option>
                  <option value="18">18 meses</option>
                  <option value="24">24 meses</option>
                  <option value="36">36 meses</option>
                  <option value="48">48 meses</option>
                  <option value="60">60 meses</option>
                </select>
              </div>
            </div>

            <div className={styles.actions}>
              <button onClick={calcular} className={styles.btnPrimary}>
                🔍 Calcular Coste Real
              </button>
              <button onClick={limpiar} className={styles.btnSecondary}>
                🗑️ Limpiar
              </button>
            </div>
          </section>

          {/* Ejemplos */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>📱 Ejemplos Comunes</h2>
            <div className={styles.ejemplosGrid}>
              {ejemplos.map((ejemplo, i) => (
                <button
                  key={i}
                  onClick={() => cargarEjemplo(ejemplo)}
                  className={styles.ejemploBtn}
                >
                  <span className={styles.ejemploNombre}>{ejemplo.nombre}</span>
                  <span className={styles.ejemploPrecio}>{ejemplo.precio} €</span>
                  <span className={styles.ejemploCuota}>{ejemplo.cuota} €/mes × {ejemplo.meses}</span>
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Panel de resultados */}
        <div className={styles.resultsPanel}>
          {resultado ? (
            <>
              <section className={styles.resultSection}>
                <h2 className={styles.sectionTitle}>💰 Resultado del Análisis</h2>

                <div className={styles.comparativa}>
                  <div className={styles.comparativaItem}>
                    <span className={styles.comparativaLabel}>Precio de contado</span>
                    <span className={styles.comparativaValor}>{formatCurrency(resultado.precioContado)}</span>
                  </div>
                  <div className={styles.comparativaVs}>VS</div>
                  <div className={`${styles.comparativaItem} ${styles.comparativaDestacado}`}>
                    <span className={styles.comparativaLabel}>Total a plazos</span>
                    <span className={styles.comparativaValor}>{formatCurrency(resultado.totalPlazos)}</span>
                  </div>
                </div>

                <div className={styles.resultadoDestacado}>
                  <div className={styles.resultadoIcono}>⚠️</div>
                  <div className={styles.resultadoTexto}>
                    <span className={styles.resultadoEtiqueta}>Coste de la financiación</span>
                    <span className={styles.resultadoCantidad}>
                      {resultado.costeFinanciacion > 0
                        ? `+${formatCurrency(resultado.costeFinanciacion)}`
                        : formatCurrency(resultado.costeFinanciacion)
                      }
                    </span>
                    <span className={styles.resultadoPorcentaje}>
                      ({resultado.costeFinanciacion >= 0 ? '+' : ''}{formatNumber(resultado.porcentajeExtra, 1)}% sobre el precio)
                    </span>
                  </div>
                </div>

                <div className={styles.detallesGrid}>
                  <div className={styles.detalleItem}>
                    <span className={styles.detalleIcono}>📊</span>
                    <span className={styles.detalleLabel}>TAE aproximada</span>
                    <span className={styles.detalleValor}>
                      {resultado.taeAproximada > 0
                        ? `${formatNumber(resultado.taeAproximada, 2)}%`
                        : '0% (sin intereses)'
                      }
                    </span>
                  </div>
                  <div className={styles.detalleItem}>
                    <span className={styles.detalleIcono}>📅</span>
                    <span className={styles.detalleLabel}>Cuota mensual</span>
                    <span className={styles.detalleValor}>{formatCurrency(resultado.cuotaMensual)}</span>
                  </div>
                </div>
              </section>

              {resultado.costeFinanciacion > 0 && (
                <section className={styles.consejoSection}>
                  <h3>💡 ¿Merece la pena financiar?</h3>
                  <ul className={styles.consejoLista}>
                    {resultado.taeAproximada > 20 && (
                      <li className={styles.consejoAlerta}>
                        <strong>TAE muy alta ({formatNumber(resultado.taeAproximada, 1)}%)</strong>:
                        Considera ahorrar y comprar al contado.
                      </li>
                    )}
                    {resultado.taeAproximada > 0 && resultado.taeAproximada <= 20 && (
                      <li>
                        TAE del {formatNumber(resultado.taeAproximada, 1)}%: Compara con otras opciones de financiación.
                      </li>
                    )}
                    {resultado.taeAproximada === 0 && (
                      <li className={styles.consejoPositivo}>
                        <strong>Sin intereses</strong>: Esta financiación no tiene coste adicional.
                      </li>
                    )}
                    <li>
                      Pagas <strong>{formatCurrency(resultado.costeFinanciacion)}</strong> extra por la comodidad de pagar a plazos.
                    </li>
                    <li>
                      En {numeroCuotas} meses, eso equivale a {formatCurrency(resultado.costeFinanciacion / parseInt(numeroCuotas))} de intereses al mes.
                    </li>
                  </ul>
                </section>
              )}
            </>
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcono}>💳</span>
              <p>Introduce los datos de la financiación para ver el coste real</p>
              <p className={styles.placeholderTip}>
                Prueba con uno de los ejemplos de la izquierda
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className={styles.disclaimer}>
        <h3>⚠️ Aviso Importante</h3>
        <p>
          Esta calculadora proporciona estimaciones orientativas. La TAE real puede variar según
          las condiciones específicas del contrato de financiación. Revisa siempre el contrato
          antes de firmar y compara varias opciones de financiación.
        </p>
      </div>

      {/* Sección educativa */}
      <EducationalSection
        title="¿Qué es la TAE y por qué importa?"
        subtitle="Aprende a detectar el coste real de las financiaciones"
        icon="📚"
      >
        <div className={styles.guideContent}>
          <section className={styles.guideSection}>
            <h3>📊 TAE vs TIN: La Diferencia Clave</h3>
            <div className={styles.guideGrid}>
              <div className={styles.guideCard}>
                <h4>TIN (Tipo de Interés Nominal)</h4>
                <p>
                  Es el interés &quot;puro&quot; que te cobran por el préstamo. No incluye comisiones
                  ni otros gastos. Es el número que las tiendas anuncian porque suele ser más bajo.
                </p>
              </div>
              <div className={styles.guideCard}>
                <h4>TAE (Tasa Anual Equivalente)</h4>
                <p>
                  Incluye el TIN más todas las comisiones y gastos. Es el indicador real del
                  coste de la financiación. Por ley, debe aparecer en los contratos.
                </p>
              </div>
            </div>
          </section>

          <section className={styles.guideSection}>
            <h3>🚨 Señales de Alerta en Financiaciones</h3>
            <ul className={styles.alertaLista}>
              <li>
                <strong>&quot;0% de interés&quot;</strong> pero con comisión de apertura:
                La TAE real no será 0%.
              </li>
              <li>
                <strong>Solo muestran la cuota mensual</strong>:
                Calcula siempre el total (cuota × meses).
              </li>
              <li>
                <strong>Seguros obligatorios</strong>:
                Algunos incluyen seguros que aumentan el coste.
              </li>
              <li>
                <strong>Penalizaciones por cancelación anticipada</strong>:
                Revisa si puedes pagar antes sin coste extra.
              </li>
            </ul>
          </section>

          <section className={styles.guideSection}>
            <h3>💡 Cuándo Sí Tiene Sentido Financiar</h3>
            <div className={styles.guideGrid}>
              <div className={styles.guideCard}>
                <h4>✅ Financiación sin intereses real</h4>
                <p>Si la TAE es 0% y no hay comisiones ocultas, es como un préstamo gratis.</p>
              </div>
              <div className={styles.guideCard}>
                <h4>✅ Emergencias necesarias</h4>
                <p>Si necesitas algo urgente (electrodoméstico averiado) y no tienes ahorros.</p>
              </div>
              <div className={styles.guideCard}>
                <h4>❌ Para caprichos</h4>
                <p>Si puedes esperar y ahorrar, evita pagar intereses por algo no urgente.</p>
              </div>
              <div className={styles.guideCard}>
                <h4>❌ TAE superior al 15-20%</h4>
                <p>Es muy cara. Mejor ahorrar o buscar alternativas de financiación.</p>
              </div>
            </div>
          </section>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-coste-plazos')} />
      <Footer appName="calculadora-coste-plazos" />
    </div>
  );
}
