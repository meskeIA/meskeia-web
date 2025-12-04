'use client';

import { useState, useMemo } from 'react';
import styles from './CalculadoraAlquilerVsCompra.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { formatCurrency, formatNumber } from '@/lib';

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
      // COMPRA: Pagos del año
      const pagosHipotecaAño = Math.min(cuotaHipoteca * 12, capitalPendiente + (capitalPendiente * interes));
      const ibiAño = ibiAnual;
      const comunidadAño = comunidadMensual * 12;
      const seguroAño = seguroAnual;
      const mantenimientoAño = valorVivienda * mantenimientoPct;

      totalPagadoCompra += pagosHipotecaAño + ibiAño + comunidadAño + seguroAño + mantenimientoAño;

      // Actualizar capital pendiente
      let interesesAño = capitalPendiente * interes;
      let amortizacionAño = pagosHipotecaAño - interesesAño;
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

      {/* Disclaimer */}
      <div className={styles.disclaimer}>
        <h3>⚠️ Aviso Importante</h3>
        <p>
          Esta calculadora proporciona estimaciones orientativas basadas en proyecciones financieras simplificadas.
          Los resultados NO constituyen asesoramiento financiero profesional. Los mercados inmobiliarios y de inversión
          son impredecibles y los resultados reales pueden variar significativamente.
          Consulta con un asesor financiero antes de tomar decisiones importantes.
        </p>
      </div>

      {/* Info Panel */}
      <div className={styles.infoPanel}>
        <h3>💡 ¿Qué tiene en cuenta esta calculadora?</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>🏠</span>
            <div>
              <strong>Compra</strong>
              <p>Hipoteca, IBI, comunidad, seguro, mantenimiento y revalorización</p>
            </div>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>🏢</span>
            <div>
              <strong>Alquiler</strong>
              <p>Renta mensual con incremento anual según IPC estimado</p>
            </div>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>📈</span>
            <div>
              <strong>Coste oportunidad</strong>
              <p>Si alquilas, inviertes la entrada y el ahorro mensual</p>
            </div>
          </div>
        </div>
      </div>

      <Footer appName="calculadora-alquiler-vs-compra" />
    </div>
  );
}
