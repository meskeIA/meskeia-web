'use client';

import { useState, useMemo } from 'react';
import styles from './SimuladorHipoteca.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { EducationalSection, RelatedApps } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatNumber, formatCurrency, parseSpanishNumber } from '@/lib';

type TipoInteres = 'fijo' | 'variable';
type VistaTabla = 'mensual' | 'anual';

interface CuotaAmortizacion {
  periodo: number;
  cuota: number;
  interes: number;
  capital: number;
  pendiente: number;
}

export default function SimuladorHipotecaPage() {
  // Datos del préstamo
  const [precioVivienda, setPrecioVivienda] = useState('200000');
  const [entrada, setEntrada] = useState('40000');
  const [plazo, setPlazo] = useState(25);
  const [tipoInteres, setTipoInteres] = useState<TipoInteres>('fijo');
  const [interesAnual, setInteresAnual] = useState(3.5);
  const [euribor, setEuribor] = useState(3.0);
  const [diferencial, setDiferencial] = useState(0.8);

  // Ingresos para ratio
  const [ingresosMensuales, setIngresosMensuales] = useState('3000');

  // Vista de tabla
  const [vistaTabla, setVistaTabla] = useState<VistaTabla>('anual');

  // Calcular resultado
  const resultado = useMemo(() => {
    const precio = parseSpanishNumber(precioVivienda) || 0;
    const entradaNum = parseSpanishNumber(entrada) || 0;
    const capital = precio - entradaNum;

    if (capital <= 0 || plazo <= 0) return null;

    // Tipo de interés efectivo
    const tipoEfectivo = tipoInteres === 'fijo'
      ? interesAnual
      : euribor + diferencial;

    const interesMensual = tipoEfectivo / 100 / 12;
    const numCuotas = plazo * 12;

    // Fórmula francesa: C = P * [i(1+i)^n] / [(1+i)^n - 1]
    const cuotaMensual = capital *
      (interesMensual * Math.pow(1 + interesMensual, numCuotas)) /
      (Math.pow(1 + interesMensual, numCuotas) - 1);

    // Generar tabla de amortización
    const tablaMensual: CuotaAmortizacion[] = [];
    let pendiente = capital;

    for (let i = 1; i <= numCuotas; i++) {
      const interesMes = pendiente * interesMensual;
      const capitalMes = cuotaMensual - interesMes;
      pendiente = pendiente - capitalMes;

      tablaMensual.push({
        periodo: i,
        cuota: cuotaMensual,
        interes: interesMes,
        capital: capitalMes,
        pendiente: Math.max(0, pendiente),
      });
    }

    // Agrupar por años
    const tablaAnual: CuotaAmortizacion[] = [];
    for (let ano = 1; ano <= plazo; ano++) {
      const cuotasAno = tablaMensual.slice((ano - 1) * 12, ano * 12);
      const totalCuota = cuotasAno.reduce((s, c) => s + c.cuota, 0);
      const totalInteres = cuotasAno.reduce((s, c) => s + c.interes, 0);
      const totalCapital = cuotasAno.reduce((s, c) => s + c.capital, 0);
      const pendienteAno = cuotasAno[cuotasAno.length - 1]?.pendiente || 0;

      tablaAnual.push({
        periodo: ano,
        cuota: totalCuota,
        interes: totalInteres,
        capital: totalCapital,
        pendiente: pendienteAno,
      });
    }

    // Totales
    const totalPagado = cuotaMensual * numCuotas;
    const totalIntereses = totalPagado - capital;

    return {
      capital,
      cuotaMensual,
      tipoEfectivo,
      totalPagado,
      totalIntereses,
      tablaMensual,
      tablaAnual,
    };
  }, [precioVivienda, entrada, plazo, tipoInteres, interesAnual, euribor, diferencial]);

  // Ratio de endeudamiento
  const ratioEndeudamiento = useMemo(() => {
    if (!resultado) return 0;
    const ingresos = parseSpanishNumber(ingresosMensuales) || 1;
    return (resultado.cuotaMensual / ingresos) * 100;
  }, [resultado, ingresosMensuales]);

  const getRatioClase = () => {
    if (ratioEndeudamiento <= 30) return 'bueno';
    if (ratioEndeudamiento <= 40) return 'moderado';
    return 'alto';
  };

  const getRatioMensaje = () => {
    if (ratioEndeudamiento <= 30) return '✅ Ratio saludable (recomendado < 30%)';
    if (ratioEndeudamiento <= 40) return '⚠️ Ratio moderado (límite recomendado 30-35%)';
    return '❌ Ratio elevado (difícil aprobación bancaria)';
  };

  const tablaActual = vistaTabla === 'mensual'
    ? resultado?.tablaMensual || []
    : resultado?.tablaAnual || [];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>🏠 Simulador de Hipoteca</h1>
        <p className={styles.subtitle}>
          Calcula tu cuota mensual y visualiza la amortización completa
        </p>
      </header>

      <div className={styles.mainContent}>
        {/* Panel de Configuración */}
        <div className={styles.configPanel}>
          <h2 className={styles.sectionTitle}>🏡 Datos del Préstamo</h2>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Precio de la vivienda</label>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                className={styles.input}
                value={precioVivienda}
                onChange={(e) => setPrecioVivienda(e.target.value)}
                placeholder="200000"
              />
              <span className={styles.unit}>€</span>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Entrada (ahorros)</label>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                className={styles.input}
                value={entrada}
                onChange={(e) => setEntrada(e.target.value)}
                placeholder="40000"
              />
              <span className={styles.unit}>€</span>
            </div>
            <span className={styles.helpText}>
              Recomendado: mínimo 20% del precio
            </span>
          </div>

          <div className={styles.sliderGroup}>
            <div className={styles.sliderHeader}>
              <label className={styles.label}>Plazo</label>
              <span className={styles.sliderValue}>{plazo} años</span>
            </div>
            <input
              type="range"
              className={styles.slider}
              min="5"
              max="40"
              value={plazo}
              onChange={(e) => setPlazo(parseInt(e.target.value))}
            />
          </div>

          <h2 className={styles.sectionTitle}>📊 Tipo de Interés</h2>

          <div className={styles.tipoToggle}>
            <button
              className={`${styles.tipoBtn} ${tipoInteres === 'fijo' ? styles.activo : ''}`}
              onClick={() => setTipoInteres('fijo')}
            >
              Fijo
            </button>
            <button
              className={`${styles.tipoBtn} ${tipoInteres === 'variable' ? styles.activo : ''}`}
              onClick={() => setTipoInteres('variable')}
            >
              Variable
            </button>
          </div>

          {tipoInteres === 'fijo' ? (
            <div className={styles.sliderGroup}>
              <div className={styles.sliderHeader}>
                <label className={styles.label}>Interés fijo anual (TIN)</label>
                <span className={styles.sliderValue}>{interesAnual.toFixed(2)}%</span>
              </div>
              <input
                type="range"
                className={styles.slider}
                min="1"
                max="6"
                step="0.1"
                value={interesAnual}
                onChange={(e) => setInteresAnual(parseFloat(e.target.value))}
              />
            </div>
          ) : (
            <>
              <div className={styles.sliderGroup}>
                <div className={styles.sliderHeader}>
                  <label className={styles.label}>Euríbor actual</label>
                  <span className={styles.sliderValue}>{euribor.toFixed(2)}%</span>
                </div>
                <input
                  type="range"
                  className={styles.slider}
                  min="-0.5"
                  max="5"
                  step="0.1"
                  value={euribor}
                  onChange={(e) => setEuribor(parseFloat(e.target.value))}
                />
              </div>
              <div className={styles.sliderGroup}>
                <div className={styles.sliderHeader}>
                  <label className={styles.label}>Diferencial</label>
                  <span className={styles.sliderValue}>+{diferencial.toFixed(2)}%</span>
                </div>
                <input
                  type="range"
                  className={styles.slider}
                  min="0.3"
                  max="2"
                  step="0.1"
                  value={diferencial}
                  onChange={(e) => setDiferencial(parseFloat(e.target.value))}
                />
              </div>
            </>
          )}

          <h2 className={styles.sectionTitle}>💰 Tus Ingresos</h2>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Ingresos netos mensuales</label>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                className={styles.input}
                value={ingresosMensuales}
                onChange={(e) => setIngresosMensuales(e.target.value)}
                placeholder="3000"
              />
              <span className={styles.unit}>€</span>
            </div>
            <span className={styles.helpText}>Para calcular tu ratio de endeudamiento</span>
          </div>
        </div>

        {/* Panel de Resultados */}
        <div className={styles.resultsPanel}>
          <h2 className={styles.sectionTitle}>📊 Resultado de la Simulación</h2>

          {resultado ? (
            <>
              {/* Cuota Principal */}
              <div className={styles.resultadoPrincipal}>
                <span className={styles.resultadoLabel}>Tu cuota mensual</span>
                <span className={styles.resultadoValor}>
                  {formatCurrency(resultado.cuotaMensual)}
                </span>
                <span className={styles.resultadoSubtexto}>
                  Tipo de interés: {formatNumber(resultado.tipoEfectivo, 2)}%
                  {tipoInteres === 'variable' && ' (Euríbor + diferencial)'}
                </span>
              </div>

              {/* Resumen */}
              <div className={styles.resumenGrid}>
                <div className={styles.resumenCard}>
                  <div className={styles.resumenIcon}>💵</div>
                  <span className={styles.resumenLabel}>Capital solicitado</span>
                  <span className={styles.resumenValor}>
                    {formatCurrency(resultado.capital)}
                  </span>
                </div>
                <div className={styles.resumenCard}>
                  <div className={styles.resumenIcon}>📅</div>
                  <span className={styles.resumenLabel}>Total a pagar</span>
                  <span className={styles.resumenValor}>
                    {formatCurrency(resultado.totalPagado)}
                  </span>
                </div>
                <div className={`${styles.resumenCard} ${styles.intereses}`}>
                  <div className={styles.resumenIcon}>📈</div>
                  <span className={styles.resumenLabel}>Total intereses</span>
                  <span className={styles.resumenValor}>
                    {formatCurrency(resultado.totalIntereses)}
                  </span>
                </div>
                <div className={styles.resumenCard}>
                  <div className={styles.resumenIcon}>🔢</div>
                  <span className={styles.resumenLabel}>Número de cuotas</span>
                  <span className={styles.resumenValor}>
                    {plazo * 12}
                  </span>
                </div>
              </div>

              {/* Ratio de Endeudamiento */}
              <div className={styles.ratioBox}>
                <div className={styles.ratioHeader}>
                  <span className={styles.ratioLabel}>Ratio de endeudamiento</span>
                  <span className={styles.ratioValor}>
                    {formatNumber(ratioEndeudamiento, 1)}%
                  </span>
                </div>
                <div className={styles.ratioBarra}>
                  <div
                    className={`${styles.ratioProgreso} ${styles[getRatioClase()]}`}
                    style={{ width: `${Math.min(ratioEndeudamiento, 100)}%` }}
                  />
                </div>
                <div className={`${styles.ratioAviso} ${styles[getRatioClase()]}`}>
                  {getRatioMensaje()}
                </div>
              </div>

              {/* Tabla de Amortización */}
              <div className={styles.tablaSection}>
                <div className={styles.tablaHeader}>
                  <h3 className={styles.sectionTitle}>📋 Tabla de Amortización</h3>
                  <div className={styles.tablaToggle}>
                    <button
                      className={`${styles.tablaToggleBtn} ${vistaTabla === 'anual' ? styles.activo : ''}`}
                      onClick={() => setVistaTabla('anual')}
                    >
                      Anual
                    </button>
                    <button
                      className={`${styles.tablaToggleBtn} ${vistaTabla === 'mensual' ? styles.activo : ''}`}
                      onClick={() => setVistaTabla('mensual')}
                    >
                      Mensual
                    </button>
                  </div>
                </div>

                <div className={styles.tablaContainer}>
                  <table className={styles.tabla}>
                    <thead>
                      <tr>
                        <th>{vistaTabla === 'mensual' ? 'Mes' : 'Año'}</th>
                        <th>Cuota</th>
                        <th>Intereses</th>
                        <th>Capital</th>
                        <th>Pendiente</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tablaActual.map((row) => (
                        <tr key={row.periodo}>
                          <td>{row.periodo}</td>
                          <td>{formatCurrency(row.cuota)}</td>
                          <td className={styles.interesesCell}>{formatCurrency(row.interes)}</td>
                          <td className={styles.capitalCell}>{formatCurrency(row.capital)}</td>
                          <td>{formatCurrency(row.pendiente)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className={styles.placeholder}>
              <div className={styles.placeholderIcon}>🏠</div>
              <p>Introduce los datos del préstamo</p>
              <p>para ver el resultado</p>
            </div>
          )}
        </div>
      </div>

      {/* Disclaimer - SIEMPRE VISIBLE */}
      <div className={styles.disclaimer}>
        <h3>⚠️ Aviso Importante</h3>
        <p>
          Este simulador proporciona una <strong>estimación orientativa</strong>. La cuota real
          puede variar según las condiciones específicas de cada entidad bancaria, gastos asociados
          (notaría, registro, tasación, impuestos) y otros factores. En hipotecas variables,
          el Euríbor fluctúa y la cuota puede cambiar. <strong>No constituye una oferta vinculante</strong>.
          Consulta con tu banco para obtener una simulación oficial.
        </p>
      </div>

      {/* Contenido Educativo */}
      <EducationalSection
        title="📚 ¿Quieres entender mejor las hipotecas?"
        subtitle="Aprende sobre tipos de interés, amortización y cómo elegir la mejor opción"
      >
        <section className={styles.guideSection}>
          <h2>Conceptos Clave de las Hipotecas</h2>
          <p className={styles.introParagraph}>
            Una hipoteca es un préstamo a largo plazo garantizado por el inmueble que compras.
            Entender bien sus componentes te ayudará a negociar mejores condiciones y
            evitar sorpresas durante los años de pago.
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>🏦 Sistema Francés</h4>
              <p>
                Es el más común en España. La cuota es constante durante toda la vida del préstamo,
                pero al principio pagas más intereses y menos capital. Con el tiempo, esta proporción
                se invierte.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>📊 TIN vs TAE</h4>
              <p>
                El TIN (Tipo de Interés Nominal) es el porcentaje que aplica el banco. La TAE
                (Tasa Anual Equivalente) incluye además comisiones y gastos, siendo más representativa
                del coste real. Compara siempre por TAE.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>🔄 Fija vs Variable</h4>
              <p>
                La hipoteca fija te da seguridad (cuota constante) pero suele ser más cara.
                La variable (Euríbor + diferencial) puede ser más barata pero conlleva riesgo
                si los tipos suben.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>📉 Ratio de Endeudamiento</h4>
              <p>
                Los bancos recomiendan que la cuota no supere el 30-35% de tus ingresos netos.
                Por encima del 40%, es difícil que aprueben la hipoteca. Cuanto menor sea el ratio,
                más holgura financiera tendrás.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Consejos para tu Hipoteca</h2>
          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>💰 Ahorra para la Entrada</h4>
              <p>
                Los bancos financian como máximo el 80% del valor de tasación. Necesitarás
                ahorrar al menos el 20% más un 10-12% adicional para gastos (impuestos, notaría,
                registro, gestoría).
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>🔍 Compara Ofertas</h4>
              <p>
                Solicita simulaciones en varios bancos. Negocia las condiciones, especialmente
                los productos vinculados (seguros, domiciliación de nómina). Un pequeño diferencial
                de 0.1% supone miles de euros a largo plazo.
              </p>
            </div>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-hipoteca')} />
      <Footer appName="simulador-hipoteca" />
    </div>
  );
}
