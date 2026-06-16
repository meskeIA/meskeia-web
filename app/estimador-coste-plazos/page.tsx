'use client';

import { useState } from 'react';
import styles from './EstimadorCostePlazos.module.css';
import { MeskeiaLogo, Footer, RelatedApps, EducationalSection, DisclaimerCard, LegalNotice, ShareCard } from '@/components';
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
        <span className={styles.heroIcon} aria-hidden="true">💳</span>
        <h1 className={styles.title}>Estimador Coste Real a Plazos</h1>
        <p className={styles.subtitle}>
          Descubre cuánto pagas realmente al financiar un producto. Calcula la TAE y los intereses ocultos.
        </p>
      </header>

      <LegalNotice lastUpdated="2026-02-02" />

      <div className={styles.mainContent}>
        {/* Panel de entrada */}
        <div className={styles.inputPanel}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}><span aria-hidden="true">📊</span> Datos de la Financiación</h2>

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
              <button type="button" onClick={calcular} className={styles.btnPrimary}>
                <span aria-hidden="true">🔍</span> Calcular Coste Real
              </button>
              <button type="button" onClick={limpiar} className={styles.btnSecondary}>
                <span aria-hidden="true">🗑️</span> Limpiar
              </button>
            </div>
          </section>

          {/* Ejemplos */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}><span aria-hidden="true">📱</span> Ejemplos Comunes</h2>
            <div className={styles.ejemplosGrid}>
              {ejemplos.map((ejemplo, i) => (
                <button
                  key={i}
                  type="button"
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
                <h2 className={styles.sectionTitle}><span aria-hidden="true">💰</span> Resultado del Análisis</h2>

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
                  <div className={styles.resultadoIcono} aria-hidden="true">⚠️</div>
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
                    <span className={styles.detalleIcono} aria-hidden="true">📊</span>
                    <span className={styles.detalleLabel}>TAE aproximada</span>
                    <span className={styles.detalleValor}>
                      {resultado.taeAproximada > 0
                        ? `${formatNumber(resultado.taeAproximada, 2)}%`
                        : '0% (sin intereses)'
                      }
                    </span>
                  </div>
                  <div className={styles.detalleItem}>
                    <span className={styles.detalleIcono} aria-hidden="true">📅</span>
                    <span className={styles.detalleLabel}>Cuota mensual</span>
                    <span className={styles.detalleValor}>{formatCurrency(resultado.cuotaMensual)}</span>
                  </div>
                </div>
              </section>

              {resultado.costeFinanciacion > 0 && (
                <section className={styles.consejoSection}>
                  <h3><span aria-hidden="true">💡</span> ¿Merece la pena financiar?</h3>
                  <ul className={styles.consejoLista}>
                    {resultado.taeAproximada > 20 && (
                      <li className={styles.consejoAlerta}>
                        <strong>TAE alta ({formatNumber(resultado.taeAproximada, 1)}%)</strong>:
                        si la compra puede aplazarse, considera ahorrar primero. Si es urgente, compara con un préstamo personal de tu banco habitual o con tarjeta de débito a plazos, que suelen ofrecer TAE más bajas.
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

      <DisclaimerCard
        variant="financial"
        severity="high"
        context="estimador-coste-plazos"
        collapsible={false}
      />


      {/* Sección educativa */}
      <EducationalSection
        title="💳 Todo sobre la Financiación a Plazos"
        subtitle="Entiende la TAE, detecta intereses ocultos y decide cuándo compensa financiar"
        icon="📚"
      >
        {/* Tabla comparativa */}
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Indicador</th>
                <th>Qué incluye</th>
                <th>Quién lo usa</th>
                <th>¿Fiable para comparar?</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>TIN</strong> (Tipo Interés Nominal)</td>
                <td>Solo el interés puro del préstamo</td>
                <td>Las tiendas en su publicidad</td>
                <td>❌ No (oculta comisiones)</td>
              </tr>
              <tr>
                <td><strong>TAE</strong> (Tasa Anual Equivalente)</td>
                <td>TIN + comisiones + gastos</td>
                <td>Contratos legales (obligatorio)</td>
                <td>✅ Sí (coste real)</td>
              </tr>
              <tr>
                <td><strong>Coste total</strong></td>
                <td>Todo lo que pagas al final</td>
                <td>Esta calculadora</td>
                <td>✅ Sí (importe exacto)</td>
              </tr>
              <tr>
                <td><strong>Cuota mensual</strong></td>
                <td>Solo el pago periódico</td>
                <td>La mayoría de ofertas</td>
                <td>❌ No (no muestra el total)</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Casos de uso */}
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">📱</span>
              <strong>Compra de tecnología</strong>
            </div>
            <p>Móviles, portátiles y televisores suelen ofrecerse con financiación a 12-24 meses. La TAE puede superar el 20%.</p>
            <div className={styles.escenarioExample}>Ejemplo: iPhone 15 Pro a 55,38 €/mes × 24 = 1.329,12 € (vs 1.329 € contado → TAE ~0%)</div>
            <div className={styles.escenarioTip}>Si el total a plazos es igual al precio de contado, la financiación es realmente gratuita</div>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🛋️</span>
              <strong>Electrodomésticos y hogar</strong>
            </div>
            <p>Las grandes superficies ofrecen &quot;sin intereses&quot; pero con seguros obligatorios o comisiones de apertura que elevan la TAE real.</p>
            <div className={styles.escenarioExample}>Ejemplo: Lavadora 549 € a 12 meses → verifica si hay comisión de apertura oculta</div>
            <div className={styles.escenarioTip}>Lee la letra pequeña del contrato: los seguros obligatorios no aparecen en el anuncio</div>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🚗</span>
              <strong>Vehículos y motos</strong>
            </div>
            <p>Los préstamos de concesionario suelen tener TAE entre el 6% y el 12%. Compara siempre con un préstamo personal de banco.</p>
            <div className={styles.escenarioExample}>Ejemplo: Moto 3.500 € → financiación concesionario al 9% TAE vs préstamo banco al 5% TAE</div>
            <div className={styles.escenarioTip}>Un préstamo personal suele ser más barato que la financiación del punto de venta</div>
          </div>
        </div>

        {/* FAQ */}
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <strong>¿Qué significa &quot;0% de intereses&quot; en realidad?</strong>
            <p>Puede ser financiación genuinamente gratuita o puede ocultar comisiones de apertura, seguros obligatorios o precio de contado inflado. Usa esta calculadora para comprobarlo: si el total a plazos supera el precio de contado, hay costes ocultos.</p>
            <span className={styles.faqTip}>Si el total a plazos = precio de contado exacto, la TAE es realmente 0%.</span>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Cómo calcula esta herramienta la TAE?</strong>
            <p>Usa el método Newton-Raphson para encontrar la tasa mensual equivalente y la convierte a tasa anual. Es una aproximación muy precisa, válida para comparar opciones aunque pueda diferir ligeramente de la TAE oficial del contrato.</p>
            <span className={styles.faqTip}>La TAE oficial del contrato puede variar si hay gastos no incluidos en la cuota.</span>
          </div>
          <div className={styles.faqItem}>
            <strong>¿A partir de qué TAE se considera &quot;cara&quot; una financiación?</strong>
            <p>Por encima del 15-20% anual se considera alta. Las tarjetas revolving suelen estar entre el 20% y el 30%. Algunos créditos rápidos superan el 100% TAE, lo que los hace muy perjudiciales.</p>
            <span className={styles.faqTip}>El Banco de España publica trimestralmente el tipo medio del mercado como referencia.</span>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Puedo cancelar anticipadamente la financiación?</strong>
            <p>Depende del contrato. Muchas financiaciones permiten cancelación anticipada, pero algunas cobran una penalización. Revisa las condiciones antes de firmar.</p>
            <span className={styles.faqTip}>La Ley de Crédito al Consumo limita las penalizaciones por cancelación anticipada a un máximo del 1%.</span>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Cuándo tiene sentido financiar aunque haya intereses?</strong>
            <p>Cuando necesitas algo urgente (electrodoméstico averiado), cuando la TAE es inferior a la rentabilidad de tus ahorros, o cuando el importe financiado es pequeño y el coste total es asumible.</p>
            <span className={styles.faqTip}>Si tienes ahorros con rentabilidad superior a la TAE del préstamo, puede ser mejor financiar.</span>
          </div>
        </div>

        {/* Guía paso a paso */}
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <strong>Obtén el precio de contado real</strong>
              <p>Busca el precio sin financiación. A veces el precio &quot;con financiación&quot; ya está inflado respecto al contado.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <strong>Introduce cuota, meses y entrada</strong>
              <p>Usa los datos exactos del contrato o la oferta. Si hay entrada, inclúyela en el campo correspondiente.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <strong>Analiza la TAE y el coste total</strong>
              <p>Compara el total a plazos con el precio de contado. La diferencia es lo que pagas por financiar.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <strong>Decide basándote en el porcentaje extra</strong>
              <p>Si el coste de financiación supera el 10-15% del precio, considera ahorrar y comprar al contado.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>
              <strong>Compara con otras opciones</strong>
              <p>Prueba diferentes plazos: menos meses = menos intereses aunque la cuota mensual sea mayor.</p>
            </div>
          </div>
        </div>

        {/* Mejores prácticas */}
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔍</span>
            <strong>Siempre compara la TAE</strong>
            <p>Es el único indicador legal que permite comparar financiaciones de forma justa.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📋</span>
            <strong>Lee el contrato completo</strong>
            <p>Seguros obligatorios, comisiones de gestión y penalizaciones aparecen en la letra pequeña.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">💰</span>
            <strong>Menos meses = menos intereses</strong>
            <p>Si puedes asumir una cuota mayor, reduce el plazo para pagar menos en total.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🏦</span>
            <strong>Compara con tu banco</strong>
            <p>Un préstamo personal de tu banco suele ser más barato que la financiación del punto de venta.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📅</span>
            <strong>Calcula el coste mensual real</strong>
            <p>Divide el coste total de financiación entre los meses. Así ves lo que pagas de más cada mes.</p>
          </div>
        </div>

        {/* Warning box */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>Errores frecuentes al financiar compras</strong>
          </div>
          <ul className={styles.warningList}>
            <li><strong>Fijarse solo en la cuota mensual:</strong> Una cuota baja puede implicar un plazo muy largo y un coste total muy alto.</li>
            <li><strong>Asumir que &quot;0% intereses&quot; es gratis:</strong> Comprueba siempre si el precio de contado es menor que el total a plazos.</li>
            <li><strong>No leer sobre seguros obligatorios:</strong> Algunos contratos incluyen seguros que incrementan el coste real significativamente.</li>
            <li><strong>Financiar compras aplazables:</strong> si la compra puede esperar 2-3 meses, ahorrar y pagar al contado te evita los intereses. Reserva la financiación para gastos urgentes o cuando la TAE sea genuinamente 0%.</li>
            <li><strong>Ignorar la penalización por cancelación:</strong> Antes de amortizar anticipadamente, verifica si hay coste por hacerlo.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('estimador-coste-plazos')} />
      <ShareCard appName="estimador-coste-plazos" />
      <Footer appName="estimador-coste-plazos" />
    </div>
  );
}
