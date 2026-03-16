'use client';

import { useState, useMemo } from 'react';
import styles from './CalculadoraAlquilerVsCompra.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, DisclaimerCard, LegalNotice, ShareCard, EducationalSection } from '@/components';
import { formatCurrency, formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

export default function CalculadoraAlquilerVsCompraPage() {
  // Datos de la vivienda
  const [precioVivienda, setPrecioVivienda] = useState('250000');
  const [entrada, setEntrada] = useState('50000'); // 20%
  const [tipoInteres, setTipoInteres] = useState('3.5');
  const [plazoHipoteca, setPlazoHipoteca] = useState('25');

  // Gastos de compra
  const [ibi, setIbi] = useState('600'); // Anual
  const [comunidad, setComunidad] = useState('100'); // Mensual
  const [seguroHogar, setSeguroHogar] = useState('300'); // Anual
  const [mantenimiento, setMantenimiento] = useState('1'); // % del valor anual

  // Alquiler
  const [alquilerMensual, setAlquilerMensual] = useState('900');
  const [incrementoAlquiler, setIncrementoAlquiler] = useState('3'); // % anual

  // Inversión alternativa
  const [rentabilidadInversion, setRentabilidadInversion] = useState('6'); // % anual

  // Revalorización vivienda
  const [revalorizacion, setRevalorizacion] = useState('2'); // % anual

  // Horizonte temporal
  const [años, setAños] = useState('15');

  const resultados = useMemo(() => {
    const precio = parseFloat(precioVivienda) || 0;
    const entradaVal = parseFloat(entrada) || 0;
    const interes = (parseFloat(tipoInteres) || 0) / 100;
    const plazo = parseInt(plazoHipoteca) || 25;
    const ibiAnual = parseFloat(ibi) || 0;
    const comunidadMensual = parseFloat(comunidad) || 0;
    const seguroAnual = parseFloat(seguroHogar) || 0;
    const mantenimientoPct = (parseFloat(mantenimiento) || 0) / 100;
    const alquiler = parseFloat(alquilerMensual) || 0;
    const incrementoAlq = (parseFloat(incrementoAlquiler) || 0) / 100;
    const rentInversion = (parseFloat(rentabilidadInversion) || 0) / 100;
    const revalPct = (parseFloat(revalorizacion) || 0) / 100;
    const horizonte = parseInt(años) || 15;

    if (precio <= 0 || alquiler <= 0) {
      return null;
    }

    // Cálculos de compra
    const capitalHipoteca = precio - entradaVal;
    const interesMensual = interes / 12;
    const numCuotas = plazo * 12;

    // Cuota mensual hipoteca (fórmula francesa)
    let cuotaHipoteca = 0;
    if (interesMensual > 0) {
      cuotaHipoteca = capitalHipoteca * (interesMensual * Math.pow(1 + interesMensual, numCuotas)) /
        (Math.pow(1 + interesMensual, numCuotas) - 1);
    } else {
      cuotaHipoteca = capitalHipoteca / numCuotas;
    }

    // Gastos de compra (impuestos ~10% aprox)
    const gastosCompra = precio * 0.10;

    // Evolución año a año
    const evolucionCompra: number[] = [];
    const evolucionAlquiler: number[] = [];

    let totalPagadoCompra = entradaVal + gastosCompra;
    let totalPagadoAlquiler = 0;
    let capitalInvertidoAlquiler = entradaVal + gastosCompra; // La entrada que no usas
    let valorVivienda = precio;
    let capitalPendiente = capitalHipoteca;
    let alquilerActual = alquiler;

    for (let año = 1; año <= horizonte; año++) {
      // COMPRA: Pagos del año — bucle mensual para amortización precisa (fórmula francesa)
      let capitalMes = capitalPendiente;
      let amortizacionAño = 0;
      let pagosHipotecaAño = 0;
      for (let mes = 0; mes < 12 && capitalMes > 0; mes++) {
        const interesMes = capitalMes * interesMensual;
        const amortMes = Math.min(cuotaHipoteca - interesMes, capitalMes);
        pagosHipotecaAño += interesMes + amortMes;
        amortizacionAño += amortMes;
        capitalMes = Math.max(0, capitalMes - amortMes);
      }
      const ibiAño = ibiAnual;
      const comunidadAño = comunidadMensual * 12;
      const seguroAño = seguroAnual;
      const mantenimientoAño = valorVivienda * mantenimientoPct;

      totalPagadoCompra += pagosHipotecaAño + ibiAño + comunidadAño + seguroAño + mantenimientoAño;

      // Actualizar capital pendiente
      capitalPendiente = Math.max(0, capitalPendiente - amortizacionAño);

      // Revalorización
      valorVivienda *= (1 + revalPct);

      // Patrimonio neto compra = valor vivienda - deuda pendiente
      const patrimonioCompra = valorVivienda - capitalPendiente;
      evolucionCompra.push(patrimonioCompra);

      // ALQUILER: Pagos del año
      const alquilerAño = alquilerActual * 12;
      totalPagadoAlquiler += alquilerAño;

      // El dinero que no gastas en entrada + gastos, lo inviertes
      capitalInvertidoAlquiler *= (1 + rentInversion);

      // Ahorro mensual: diferencia entre lo que pagarías en compra vs alquiler
      const gastoMensualCompra = cuotaHipoteca + comunidadMensual + (ibiAño + seguroAño + mantenimientoAño) / 12;
      const ahorroMensual = Math.max(0, gastoMensualCompra - alquilerActual);
      capitalInvertidoAlquiler += ahorroMensual * 12 * (1 + rentInversion / 2); // Inversión a mitad de año aprox

      evolucionAlquiler.push(capitalInvertidoAlquiler);

      // Incremento alquiler para siguiente año
      alquilerActual *= (1 + incrementoAlq);
    }

    const patrimonioFinalCompra = evolucionCompra[horizonte - 1] || 0;
    const patrimonioFinalAlquiler = evolucionAlquiler[horizonte - 1] || 0;
    const diferencia = patrimonioFinalCompra - patrimonioFinalAlquiler;

    // Punto de equilibrio aproximado
    let puntoEquilibrio = 0;
    for (let i = 0; i < horizonte; i++) {
      if (evolucionCompra[i] > evolucionAlquiler[i]) {
        puntoEquilibrio = i + 1;
        break;
      }
    }

    return {
      cuotaHipoteca,
      gastosCompra,
      gastoMensualCompra: cuotaHipoteca + comunidadMensual + (ibiAnual + seguroAnual + (precio * mantenimientoPct)) / 12,
      patrimonioFinalCompra,
      patrimonioFinalAlquiler,
      diferencia,
      mejorOpcion: diferencia > 0 ? 'comprar' : 'alquilar',
      totalPagadoCompra,
      totalPagadoAlquiler,
      evolucionCompra,
      evolucionAlquiler,
      puntoEquilibrio,
      valorFinalVivienda: valorVivienda,
    };
  }, [precioVivienda, entrada, tipoInteres, plazoHipoteca, ibi, comunidad, seguroHogar, mantenimiento,
    alquilerMensual, incrementoAlquiler, rentabilidadInversion, revalorizacion, años]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>🏠 Alquiler vs Compra</h1>
        <p className={styles.subtitle}>¿Qué me conviene más? Análisis financiero completo</p>
      </header>

      <LegalNotice lastUpdated="2026-02-02" />

      {/* Disclaimer Legal */}
      <DisclaimerCard
        variant="financial"
        severity="high"
        collapsible={false}
        context="alquiler-vs-compra"
      >
        <p>
          Este análisis proporciona <strong>comparación educativa</strong> basada en supuestos generales.
        </p>
        <p className={styles.disclaimerHighlight}>
          <strong>Factores personales NO considerados:</strong>
        </p>
        <ul>
          <li>Tu situación laboral futura (estabilidad, cambios de ciudad)</li>
          <li>Planes personales (familia, estudios, etc.)</li>
          <li>Riesgo financiero individual (fondo de emergencia, otras deudas)</li>
          <li>Oportunidades de inversión específicas de tu perfil</li>
        </ul>
        <p>
          <strong>La decisión de comprar vs alquilar no es solo financiera.</strong> Consulta con
          asesores financieros que conozcan tu situación completa.
        </p>
      </DisclaimerCard>


      <div className={styles.mainContent}>
        {/* Panel de datos vivienda */}
        <div className={styles.inputPanel}>
          <h2 className={styles.sectionTitle}>🏡 Datos de la vivienda</h2>

          <div className={styles.inputGroup}>
            <label htmlFor="precioVivienda">Precio de compra</label>
            <div className={styles.inputWithUnit}>
              <input
                id="precioVivienda"
                type="text"
                inputMode="numeric"
                value={precioVivienda}
                onChange={e => setPrecioVivienda(e.target.value.replace(/[^0-9]/g, ''))}
                className={styles.input}
              />
              <span className={styles.unit}>€</span>
            </div>
          </div>

          <div className={styles.inputRow}>
            <div className={styles.inputGroup}>
              <label htmlFor="entrada">Entrada (ahorro)</label>
              <div className={styles.inputWithUnit}>
                <input
                  id="entrada"
                  type="text"
                  inputMode="numeric"
                  value={entrada}
                  onChange={e => setEntrada(e.target.value.replace(/[^0-9]/g, ''))}
                  className={styles.input}
                />
                <span className={styles.unit}>€</span>
              </div>
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="tipoInteres">Tipo de interés</label>
              <div className={styles.inputWithUnit}>
                <input
                  id="tipoInteres"
                  type="text"
                  inputMode="decimal"
                  value={tipoInteres}
                  onChange={e => setTipoInteres(e.target.value)}
                  className={styles.input}
                />
                <span className={styles.unit}>%</span>
              </div>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="plazoHipoteca">Plazo hipoteca</label>
            <select
              id="plazoHipoteca"
              value={plazoHipoteca}
              onChange={e => setPlazoHipoteca(e.target.value)}
              className={styles.select}
            >
              <option value="10">10 años</option>
              <option value="15">15 años</option>
              <option value="20">20 años</option>
              <option value="25">25 años</option>
              <option value="30">30 años</option>
            </select>
          </div>
        </div>

        {/* Panel gastos compra */}
        <div className={styles.inputPanel}>
          <h2 className={styles.sectionTitle}>💰 Gastos de propietario (anuales)</h2>

          <div className={styles.inputRow}>
            <div className={styles.inputGroup}>
              <label htmlFor="ibi">IBI</label>
              <div className={styles.inputWithUnit}>
                <input
                  id="ibi"
                  type="text"
                  inputMode="numeric"
                  value={ibi}
                  onChange={e => setIbi(e.target.value.replace(/[^0-9]/g, ''))}
                  className={styles.input}
                />
                <span className={styles.unit}>€/año</span>
              </div>
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="comunidad">Comunidad</label>
              <div className={styles.inputWithUnit}>
                <input
                  id="comunidad"
                  type="text"
                  inputMode="numeric"
                  value={comunidad}
                  onChange={e => setComunidad(e.target.value.replace(/[^0-9]/g, ''))}
                  className={styles.input}
                />
                <span className={styles.unit}>€/mes</span>
              </div>
            </div>
          </div>

          <div className={styles.inputRow}>
            <div className={styles.inputGroup}>
              <label htmlFor="seguroHogar">Seguro hogar</label>
              <div className={styles.inputWithUnit}>
                <input
                  id="seguroHogar"
                  type="text"
                  inputMode="numeric"
                  value={seguroHogar}
                  onChange={e => setSeguroHogar(e.target.value.replace(/[^0-9]/g, ''))}
                  className={styles.input}
                />
                <span className={styles.unit}>€/año</span>
              </div>
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="mantenimiento">Mantenimiento</label>
              <div className={styles.inputWithUnit}>
                <input
                  id="mantenimiento"
                  type="text"
                  inputMode="decimal"
                  value={mantenimiento}
                  onChange={e => setMantenimiento(e.target.value)}
                  className={styles.input}
                />
                <span className={styles.unit}>%/año</span>
              </div>
            </div>
          </div>
        </div>

        {/* Panel alquiler */}
        <div className={styles.inputPanel}>
          <h2 className={styles.sectionTitle}>🏢 Datos del alquiler</h2>

          <div className={styles.inputRow}>
            <div className={styles.inputGroup}>
              <label htmlFor="alquilerMensual">Alquiler mensual</label>
              <div className={styles.inputWithUnit}>
                <input
                  id="alquilerMensual"
                  type="text"
                  inputMode="numeric"
                  value={alquilerMensual}
                  onChange={e => setAlquilerMensual(e.target.value.replace(/[^0-9]/g, ''))}
                  className={styles.input}
                />
                <span className={styles.unit}>€/mes</span>
              </div>
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="incrementoAlquiler">Incremento anual</label>
              <div className={styles.inputWithUnit}>
                <input
                  id="incrementoAlquiler"
                  type="text"
                  inputMode="decimal"
                  value={incrementoAlquiler}
                  onChange={e => setIncrementoAlquiler(e.target.value)}
                  className={styles.input}
                />
                <span className={styles.unit}>%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Panel inversión alternativa */}
        <div className={styles.inputPanel}>
          <h2 className={styles.sectionTitle}>📈 Coste de oportunidad</h2>

          <div className={styles.inputRow}>
            <div className={styles.inputGroup}>
              <label htmlFor="rentabilidadInversion">Rentabilidad inversión</label>
              <div className={styles.inputWithUnit}>
                <input
                  id="rentabilidadInversion"
                  type="text"
                  inputMode="decimal"
                  value={rentabilidadInversion}
                  onChange={e => setRentabilidadInversion(e.target.value)}
                  className={styles.input}
                />
                <span className={styles.unit}>%</span>
              </div>
              <span className={styles.hint}>Si alquilas e inviertes la entrada</span>
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="revalorizacion">Revalorización vivienda</label>
              <div className={styles.inputWithUnit}>
                <input
                  id="revalorizacion"
                  type="text"
                  inputMode="decimal"
                  value={revalorizacion}
                  onChange={e => setRevalorizacion(e.target.value)}
                  className={styles.input}
                />
                <span className={styles.unit}>%</span>
              </div>
              <span className={styles.hint}>Incremento anual del valor</span>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="años">Horizonte temporal</label>
            <select
              id="años"
              value={años}
              onChange={e => setAños(e.target.value)}
              className={styles.select}
            >
              <option value="5">5 años</option>
              <option value="10">10 años</option>
              <option value="15">15 años</option>
              <option value="20">20 años</option>
              <option value="25">25 años</option>
              <option value="30">30 años</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resultados */}
      {resultados && (
        <div className={styles.resultadosSection}>
          {/* Veredicto principal */}
          <div className={`${styles.veredictoPanel} ${resultados.mejorOpcion === 'comprar' ? styles.comprar : styles.alquilar}`}>
            <div className={styles.veredictoIcono}>
              {resultados.mejorOpcion === 'comprar' ? '🏠' : '🏢'}
            </div>
            <div className={styles.veredictoTexto}>
              <span className={styles.veredictoLabel}>En {años} años, te conviene más</span>
              <span className={styles.veredictoOpcion}>
                {resultados.mejorOpcion === 'comprar' ? 'COMPRAR' : 'ALQUILAR'}
              </span>
              <span className={styles.verdictoDiferencia}>
                Diferencia de patrimonio: {formatCurrency(Math.abs(resultados.diferencia))}
              </span>
            </div>
          </div>

          {/* Comparativa lado a lado */}
          <div className={styles.comparativaGrid}>
            {/* Columna Comprar */}
            <div className={styles.comparativaColumna}>
              <h3 className={styles.comparativaTitulo}>🏠 Comprar</h3>

              <div className={styles.comparativaItem}>
                <span className={styles.comparativaLabel}>Cuota hipoteca</span>
                <span className={styles.comparativaValor}>{formatCurrency(resultados.cuotaHipoteca)}/mes</span>
              </div>

              <div className={styles.comparativaItem}>
                <span className={styles.comparativaLabel}>Gasto mensual total</span>
                <span className={styles.comparativaValor}>{formatCurrency(resultados.gastoMensualCompra)}/mes</span>
              </div>

              <div className={styles.comparativaItem}>
                <span className={styles.comparativaLabel}>Gastos de compra (~10%)</span>
                <span className={styles.comparativaValor}>{formatCurrency(resultados.gastosCompra)}</span>
              </div>

              <div className={styles.comparativaItem}>
                <span className={styles.comparativaLabel}>Total pagado en {años} años</span>
                <span className={styles.comparativaValor}>{formatCurrency(resultados.totalPagadoCompra)}</span>
              </div>

              <div className={styles.comparativaItem}>
                <span className={styles.comparativaLabel}>Valor vivienda final</span>
                <span className={styles.comparativaValor}>{formatCurrency(resultados.valorFinalVivienda)}</span>
              </div>

              <div className={`${styles.comparativaItem} ${styles.destacado}`}>
                <span className={styles.comparativaLabel}>Patrimonio neto</span>
                <span className={styles.comparativaValor}>{formatCurrency(resultados.patrimonioFinalCompra)}</span>
              </div>
            </div>

            {/* Columna Alquilar */}
            <div className={styles.comparativaColumna}>
              <h3 className={styles.comparativaTitulo}>🏢 Alquilar + Invertir</h3>

              <div className={styles.comparativaItem}>
                <span className={styles.comparativaLabel}>Alquiler inicial</span>
                <span className={styles.comparativaValor}>{formatCurrency(parseFloat(alquilerMensual))}/mes</span>
              </div>

              <div className={styles.comparativaItem}>
                <span className={styles.comparativaLabel}>Incremento anual</span>
                <span className={styles.comparativaValor}>{incrementoAlquiler}%</span>
              </div>

              <div className={styles.comparativaItem}>
                <span className={styles.comparativaLabel}>Capital inicial invertido</span>
                <span className={styles.comparativaValor}>
                  {formatCurrency(parseFloat(entrada) + resultados.gastosCompra)}
                </span>
              </div>

              <div className={styles.comparativaItem}>
                <span className={styles.comparativaLabel}>Total pagado en {años} años</span>
                <span className={styles.comparativaValor}>{formatCurrency(resultados.totalPagadoAlquiler)}</span>
              </div>

              <div className={styles.comparativaItem}>
                <span className={styles.comparativaLabel}>Rentabilidad inversión</span>
                <span className={styles.comparativaValor}>{rentabilidadInversion}% anual</span>
              </div>

              <div className={`${styles.comparativaItem} ${styles.destacado}`}>
                <span className={styles.comparativaLabel}>Patrimonio neto</span>
                <span className={styles.comparativaValor}>{formatCurrency(resultados.patrimonioFinalAlquiler)}</span>
              </div>
            </div>
          </div>

          {/* Evolución temporal */}
          <div className={styles.evolucionPanel}>
            <h3 className={styles.sectionTitle}>📊 Evolución del patrimonio</h3>
            <div className={styles.evolucionTable}>
              <div className={styles.evolucionHeader}>
                <span>Año</span>
                <span>Comprar</span>
                <span>Alquilar</span>
                <span>Diferencia</span>
              </div>
              {[5, 10, 15, 20, 25, 30].filter(a => a <= parseInt(años)).map(año => {
                const idx = año - 1;
                const compra = resultados.evolucionCompra[idx] || 0;
                const alquiler = resultados.evolucionAlquiler[idx] || 0;
                const diff = compra - alquiler;
                return (
                  <div key={año} className={styles.evolucionRow}>
                    <span className={styles.evolucionAño}>Año {año}</span>
                    <span>{formatCurrency(compra)}</span>
                    <span>{formatCurrency(alquiler)}</span>
                    <span className={diff >= 0 ? styles.positivo : styles.negativo}>
                      {diff >= 0 ? '+' : ''}{formatCurrency(diff)}
                    </span>
                  </div>
                );
              })}
            </div>

            {resultados.puntoEquilibrio > 0 && (
              <p className={styles.puntoEquilibrio}>
                📍 Punto de equilibrio: <strong>Año {resultados.puntoEquilibrio}</strong>
                <br />
                <small>A partir de este año, comprar empieza a ser más rentable</small>
              </p>
            )}
          </div>
        </div>
      )}

      <EducationalSection
        title="Guía: ¿Alquilar o Comprar en España?"
        subtitle="Entiende el coste de oportunidad, los gastos ocultos y cuándo conviene cada opción según tu situación"
        icon="🏠"
      >
        {/* Tabla comparativa */}
        <section className={styles.guideSection}>
          <h2>Comparativa: alquilar vs. comprar</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.tablaComparativa}>
              <thead>
                <tr>
                  <th>Factor</th>
                  <th>🏢 Alquilar</th>
                  <th>🏠 Comprar</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Entrada inicial</strong></td>
                  <td>1-2 meses fianza</td>
                  <td>20-30% del valor + ~10% gastos</td>
                </tr>
                <tr>
                  <td><strong>Coste mensual total</strong></td>
                  <td>Solo renta</td>
                  <td>Cuota + IBI + comunidad + seguro + mantenimiento</td>
                </tr>
                <tr>
                  <td><strong>Flexibilidad</strong></td>
                  <td>Alta (preaviso 1-2 meses)</td>
                  <td>Baja (venta compleja y costosa)</td>
                </tr>
                <tr>
                  <td><strong>Construcción de patrimonio</strong></td>
                  <td>Vía inversión del capital libre</td>
                  <td>Vía amortización del préstamo</td>
                </tr>
                <tr>
                  <td><strong>Riesgo inflación</strong></td>
                  <td>Alto (alquiler sube con IPC)</td>
                  <td>Bajo con hipoteca fija</td>
                </tr>
                <tr>
                  <td><strong>PER razonable</strong></td>
                  <td>Conveniente si PER &gt; 20</td>
                  <td>Conveniente si PER &lt; 15</td>
                </tr>
                <tr>
                  <td><strong>Horizonte recomendado</strong></td>
                  <td>&lt; 7 años</td>
                  <td>&gt; 10-15 años</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Casos de uso */}
        <section className={styles.guideSection}>
          <h2>¿Cuándo conviene cada opción?</h2>
          <div className={styles.casosGrid}>
            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span className={styles.casoIcon}>🚀</span>
                <span className={styles.casoNivel}>Joven móvil (20-32 años)</span>
              </div>
              <p className={styles.casoTip}>
                Con incertidumbre laboral y vital, el alquiler da flexibilidad. Si ahorras e inviertes la diferencia (entrada + diferencial de cuota), puedes superar el patrimonio del comprador en 10 años.
              </p>
            </div>
            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span className={styles.casoIcon}>👨‍👩‍👧</span>
                <span className={styles.casoNivel}>Familia estable (35-50 años)</span>
              </div>
              <p className={styles.casoTip}>
                Con estabilidad laboral y horizonte de 15+ años, comprar suele generar más patrimonio. La cuota fija protege de subidas del alquiler y la hipoteca se amortiza con el tiempo.
              </p>
            </div>
            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span className={styles.casoIcon}>📊</span>
                <span className={styles.casoNivel}>Mercado con PER alto (&gt;25)</span>
              </div>
              <p className={styles.casoTip}>
                En ciudades como Madrid o Barcelona donde el PER supera 25-30, alquilar e invertir el capital libre históricamente ha superado la rentabilidad de comprar en los últimos 15 años.
              </p>
            </div>
            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span className={styles.casoIcon}>🧳</span>
                <span className={styles.casoNivel}>Trabajador remoto / nómada</span>
              </div>
              <p className={styles.casoTip}>
                Si puedes trabajar desde cualquier lugar, alquilar permite optimizar coste de vida (ciudades más baratas) y mantener capital invertido en activos líquidos. La vivienda propia ancla a una localización.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes</h2>
          <dl className={styles.faqList}>
            <div className={styles.faqItem}>
              <dt className={styles.faqPregunta}>¿Es verdad que alquilar es tirar el dinero?</dt>
              <dd className={styles.faqRespuesta}>
                No necesariamente. El coste real de comprar incluye intereses hipotecarios, gastos de compra (~10%), IBI, comunidad y mantenimiento. En los primeros 5-7 años, el total pagado suele superar lo que costaría alquilar. La diferencia es la flexibilidad y la construcción de patrimonio, no la cuota en sí.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt className={styles.faqPregunta}>¿Cuánto ahorrar antes de comprar?</dt>
              <dd className={styles.faqRespuesta}>
                El banco financia hasta el 80% del valor (90% en algunos casos para jóvenes). Necesitas un 20% de entrada + ~10% en gastos de compra (ITP/IVA, notaría, registro, gestoría). Para una vivienda de 200.000 €, prepara unos 60.000 €. Además, mantén un fondo de emergencia de 6 meses después de la compra.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt className={styles.faqPregunta}>¿Qué es el PER inmobiliario y cómo lo uso?</dt>
              <dd className={styles.faqRespuesta}>
                El PER es el precio de la vivienda dividido entre la renta anual de alquiler. Un PER de 20 significa que pagas 20 años de alquiler para comprar el piso. PER &lt; 15: zona favorable a comprar. PER 15-20: zona de equilibrio. PER &gt; 25: zona favorable a alquilar (como Madrid o Barcelona donde supera 30).
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt className={styles.faqPregunta}>¿Hipoteca fija o variable en 2025-2026?</dt>
              <dd className={styles.faqRespuesta}>
                Con el Euríbor bajando desde máximos de 2023-2024, las hipotecas variables vuelven a ganar atractivo, aunque las fijas ofrecen certeza. Si puedes asumir volatilidad a corto plazo y tu horizonte es largo (&gt;15 años), una variable con revisión anual puede ser más barata en el ciclo completo. Simula ambas antes de decidir.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt className={styles.faqPregunta}>¿La vivienda siempre sube?</dt>
              <dd className={styles.faqRespuesta}>
                No. Entre 2008 y 2014, los precios cayeron un 30-45% en España. La rentabilidad real de la vivienda española desde 1985 está entre el 3-4% anual incluyendo alquiler, inferior a índices bursátiles globales. La vivienda es un activo de valor, pero no garantiza revalorización en todos los mercados ni plazos.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt className={styles.faqPregunta}>¿Qué rentabilidad alternativa debo usar en la calculadora?</dt>
              <dd className={styles.faqRespuesta}>
                Usa la rentabilidad real de la alternativa en la que invertirías el capital liberado. Para fondos indexados globales: 5-7% real histórico (descontando inflación). Para depósitos o bonos: 1-3% real. Para ser conservador, usa 4-5%. Cambiar este parámetro tiene gran impacto en el resultado.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt className={styles.faqPregunta}>¿Cómo afecta la Ley de Vivienda 2023 al alquiler?</dt>
              <dd className={styles.faqRespuesta}>
                La Ley de Vivienda (mayo 2023) limita las actualizaciones del alquiler al IPC en zonas tensionadas y endurece las condiciones de desahucio. Para el inquilino, mayor protección pero menos oferta. Para el propietario, más incertidumbre. Esto puede encarecer el alquiler en zonas no tensionadas y reducir la oferta total.
              </dd>
            </div>
          </dl>
        </section>

        {/* Guía paso a paso */}
        <section className={styles.guideSection}>
          <h2>Proceso de decisión: alquilar vs. comprar en 6 pasos</h2>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>Define tu horizonte temporal real</strong>
                <p>¿Cuántos años planeas vivir en esa ciudad? Si es menos de 7 años, los gastos de compra-venta hacen que alquilar sea casi siempre más eficiente financieramente.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>Calcula el PER de tu zona</strong>
                <p>Divide el precio de compra entre la renta anual de alquiler equivalente. PER &lt; 15: comprar. PER 15-20: equilibrio, usa la calculadora. PER &gt; 25: alquilar casi siempre mejor.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>Calcula el coste real mensual de la compra</strong>
                <p>Cuota hipotecaria + IBI (÷12) + comunidad + seguro + mantenimiento (1% del valor al año ÷12). Suma todos estos conceptos para obtener el coste real de ser propietario.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>Estima el coste de oportunidad de la entrada</strong>
                <p>El 20-30% de entrada + gastos de compra inmoviliza capital que podría invertirse. Calcula cuánto crecería ese capital al 5-6% anual durante el mismo horizonte temporal.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>Simula ambos escenarios con esta calculadora</strong>
                <p>Introduce los datos reales de una vivienda concreta. Ajusta la revalorización inmobiliaria esperada y la rentabilidad alternativa. Observa en qué año se cruzan los patrimonios.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>6</span>
              <div className={styles.stepContent}>
                <strong>Pondera factores no financieros</strong>
                <p>La seguridad de no depender de un propietario, personalizar el hogar o saber dónde vivirás en 20 años tienen valor real. La calculadora da el análisis financiero; la decisión final incluye factores personales.</p>
              </div>
            </li>
          </ol>
        </section>

        {/* Mejores prácticas */}
        <section className={styles.guideSection}>
          <h2>6 factores clave que suelen olvidarse</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔧</span>
              <strong>Mantenimiento real ~1% anual</strong>
              <p>Una vivienda de 250.000 € requiere unos 2.500 € al año en mantenimiento medio. Fontanería, electricidad, pintura, electrodomésticos... es un gasto real que muchos calculan en cero.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📋</span>
              <strong>Gastos de compraventa ~10%</strong>
              <p>ITP (4-10% según CCAA), notaría, registro y gestoría suman entre el 8-12% del precio. En una vivienda de 200.000 €, son 16.000-24.000 € que nunca se recuperan si vendes pronto.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📈</span>
              <strong>La revalorización no está garantizada</strong>
              <p>Usar un 3% anual de revalorización es razonable para grandes ciudades, pero en municipios pequeños o zonas con despoblación puede ser negativa. Ajusta según la zona concreta.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>💸</span>
              <strong>El alquiler sube con la inflación</strong>
              <p>Con inflación al 3-4%, una renta de 1.000 €/mes en 2025 puede ser 1.350 €/mes en 2035. Una hipoteca fija protege de este riesgo, aunque el alquiler empieza siendo más bajo.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🏦</span>
              <strong>El ratio cuota/ingresos no debe superar el 35%</strong>
              <p>El banco exige que la cuota no supere el 30-35% de tus ingresos netos. Pero para tu estabilidad financiera personal, lo ideal es no superar el 25-28%.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>⚖️</span>
              <strong>Comprar no siempre genera más riqueza</strong>
              <p>En ciudades con PER &gt; 25 y mercados bursátiles con retornos del 7%, alquilar e invertir el capital libre genera en muchos casos más patrimonio a 20 años que comprar.</p>
            </div>
          </div>
        </section>

        {/* Warning Box */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon}>⚠️</span>
              <h2>Errores frecuentes al tomar esta decisión</h2>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Comparar cuota hipotecaria con alquiler sin incluir todos los gastos.</strong> La cuota representa solo una parte del coste real de ser propietario. IBI, comunidad, seguro y mantenimiento añaden entre 150-400 €/mes al coste total.
              </li>
              <li>
                <strong>Ignorar el coste de oportunidad de la entrada.</strong> 50.000 € inmovilizados durante 20 años al 6% se convierten en 160.000 €. Ese capital libre tiene un valor que debe entrar en el cálculo.
              </li>
              <li>
                <strong>Asumir que la vivienda siempre revaloriza.</strong> En periodos de 5-10 años puede haber caídas del 20-40% en España. Calcular con revalorización positiva fija puede llevar a tomar una decisión errónea.
              </li>
              <li>
                <strong>Decidir bajo presión social o emocional.</strong> &quot;Tirar el dinero en el alquiler&quot; es un mito en muchos mercados. La decisión debe basarse en números, horizonte real y circunstancias vitales concretas.
              </li>
              <li>
                <strong>No tener en cuenta los gastos de venta.</strong> Vender una vivienda cuesta entre un 5-10% del precio (comisión inmobiliaria, plusvalía municipal, IRPF sobre ganancia). Si vendes en 5-7 años, estas pérdidas son enormes.
              </li>
              <li>
                <strong>Comprar sin fondo de emergencia post-compra.</strong> Muchas familias agotan todos sus ahorros en la entrada y quedan sin colchón. Un imprevisto laboral o familiar puede llevar a la imposibilidad de pagar la hipoteca.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-alquiler-vs-compra')} />

      <ShareCard appName="calculadora-alquiler-vs-compra" />
      <Footer appName="calculadora-alquiler-vs-compra" />
    </div>
  );
}
