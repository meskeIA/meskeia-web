'use client';

import { useState, useMemo } from 'react';
import styles from './EstimadorHipoteca.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { EducationalSection, RelatedApps, DisclaimerCard, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatNumber, formatCurrency, parseSpanishNumber } from '@/lib';

type TipoInteres = 'fijo' | 'variable' | 'mixta';
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
  const [plazoFijoMixta, setPlazoFijoMixta] = useState(5);

  // Ingresos para ratio
  const [ingresosMensuales, setIngresosMensuales] = useState('3000');

  // Vista de tabla
  const [vistaTabla, setVistaTabla] = useState<VistaTabla>('anual');

  // Estados para código HTML
  const [htmlCode, setHtmlCode] = useState<string>('');
  const [copiado, setCopiado] = useState(false);
  const [htmlExpanded, setHtmlExpanded] = useState(false);

  // Calcular resultado
  const resultado = useMemo(() => {
    const precio = parseSpanishNumber(precioVivienda) || 0;
    const entradaNum = parseSpanishNumber(entrada) || 0;
    const capital = precio - entradaNum;

    if (capital <= 0 || plazo <= 0) return null;

    const numCuotas = plazo * 12;
    const tablaMensual: CuotaAmortizacion[] = [];

    // Fórmula francesa
    const calcCuota = (cap: number, tasa: number, meses: number) => {
      if (meses <= 0) return 0;
      if (tasa === 0) return cap / meses;
      const r = tasa / 100 / 12;
      return cap * (r * Math.pow(1 + r, meses)) / (Math.pow(1 + r, meses) - 1);
    };

    if (tipoInteres === 'mixta') {
      const n1 = Math.min(plazoFijoMixta * 12, numCuotas - 1);
      const n2 = numCuotas - n1;
      const tipoVar = euribor + diferencial;
      const r1 = interesAnual / 100 / 12;
      const r2 = tipoVar / 100 / 12;

      // Fase 1: cuota calculada sobre el plazo total (práctica bancaria habitual)
      const cuota1 = calcCuota(capital, interesAnual, numCuotas);
      let pendiente = capital;

      for (let i = 1; i <= n1; i++) {
        const interesMes = pendiente * r1;
        const capitalMes = cuota1 - interesMes;
        pendiente = Math.max(0, pendiente - capitalMes);
        tablaMensual.push({ periodo: i, cuota: cuota1, interes: interesMes, capital: capitalMes, pendiente });
      }

      // Fase 2: nueva cuota sobre capital pendiente
      const cuota2 = n2 > 0 && pendiente > 0 ? calcCuota(pendiente, tipoVar, n2) : 0;
      for (let i = n1 + 1; i <= numCuotas; i++) {
        const interesMes = pendiente * r2;
        const capitalMes = cuota2 - interesMes;
        pendiente = Math.max(0, pendiente - capitalMes);
        tablaMensual.push({ periodo: i, cuota: cuota2, interes: interesMes, capital: capitalMes, pendiente });
      }

      const tablaAnual: CuotaAmortizacion[] = [];
      for (let ano = 1; ano <= plazo; ano++) {
        const cuotasAno = tablaMensual.slice((ano - 1) * 12, ano * 12);
        tablaAnual.push({
          periodo: ano,
          cuota: cuotasAno.reduce((s, c) => s + c.cuota, 0),
          interes: cuotasAno.reduce((s, c) => s + c.interes, 0),
          capital: cuotasAno.reduce((s, c) => s + c.capital, 0),
          pendiente: cuotasAno[cuotasAno.length - 1]?.pendiente || 0,
        });
      }

      const totalPagado = tablaMensual.reduce((s, c) => s + c.cuota, 0);
      return {
        capital, cuotaMensual: cuota1, cuotaMixta2: cuota2,
        tipoEfectivo: interesAnual, totalPagado, totalIntereses: totalPagado - capital,
        tablaMensual, tablaAnual,
      };
    }

    // Hipoteca fija o variable
    const tipoEfectivo = tipoInteres === 'fijo' ? interesAnual : euribor + diferencial;
    const cuotaMensual = calcCuota(capital, tipoEfectivo, numCuotas);
    let pendiente = capital;

    for (let i = 1; i <= numCuotas; i++) {
      const r = tipoEfectivo / 100 / 12;
      const interesMes = pendiente * r;
      const capitalMes = cuotaMensual - interesMes;
      pendiente = Math.max(0, pendiente - capitalMes);
      tablaMensual.push({ periodo: i, cuota: cuotaMensual, interes: interesMes, capital: capitalMes, pendiente });
    }

    const tablaAnual: CuotaAmortizacion[] = [];
    for (let ano = 1; ano <= plazo; ano++) {
      const cuotasAno = tablaMensual.slice((ano - 1) * 12, ano * 12);
      tablaAnual.push({
        periodo: ano,
        cuota: cuotasAno.reduce((s, c) => s + c.cuota, 0),
        interes: cuotasAno.reduce((s, c) => s + c.interes, 0),
        capital: cuotasAno.reduce((s, c) => s + c.capital, 0),
        pendiente: cuotasAno[cuotasAno.length - 1]?.pendiente || 0,
      });
    }

    const totalPagado = cuotaMensual * numCuotas;
    return {
      capital, cuotaMensual, cuotaMixta2: 0, tipoEfectivo,
      totalPagado, totalIntereses: totalPagado - capital, tablaMensual, tablaAnual,
    };
  }, [precioVivienda, entrada, plazo, tipoInteres, interesAnual, euribor, diferencial, plazoFijoMixta]);

  // Comparación simultánea de los 3 tipos
  const comparacion = useMemo(() => {
    const precio = parseSpanishNumber(precioVivienda) || 0;
    const entradaNum = parseSpanishNumber(entrada) || 0;
    const capital = precio - entradaNum;
    if (capital <= 0 || plazo <= 0) return null;

    const n = plazo * 12;
    const tipoVar = euribor + diferencial;

    const calcCuota = (cap: number, tasa: number, meses: number) => {
      if (meses <= 0 || cap <= 0) return 0;
      if (tasa === 0) return cap / meses;
      const r = tasa / 100 / 12;
      return cap * (r * Math.pow(1 + r, meses)) / (Math.pow(1 + r, meses) - 1);
    };

    // Fija
    const cuotaFija = calcCuota(capital, interesAnual, n);
    const totalFija = cuotaFija * n;

    // Variable
    const cuotaVariable = calcCuota(capital, tipoVar, n);
    const totalVariable = cuotaVariable * n;

    // Mixta: n1 meses fijo, n2 meses variable
    const n1 = Math.min(plazoFijoMixta * 12, n - 1);
    const n2 = n - n1;
    const cuota1 = calcCuota(capital, interesAnual, n);
    let pendienteMixta = capital;
    const r1 = interesAnual / 100 / 12;
    for (let i = 0; i < n1; i++) {
      const interes = pendienteMixta * r1;
      pendienteMixta = Math.max(0, pendienteMixta - (cuota1 - interes));
    }
    const cuota2 = n2 > 0 ? calcCuota(pendienteMixta, tipoVar, n2) : 0;
    const totalMixta = cuota1 * n1 + cuota2 * n2;

    return {
      fija: { cuota: cuotaFija, total: totalFija, intereses: totalFija - capital },
      variable: { cuota: cuotaVariable, total: totalVariable, intereses: totalVariable - capital },
      mixta: { cuota1, cuota2, total: totalMixta, intereses: totalMixta - capital },
    };
  }, [precioVivienda, entrada, plazo, interesAnual, euribor, diferencial, plazoFijoMixta]);

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

  // Generar código HTML de implementación
  const generarCodigoHTML = () => {
    if (!resultado) return;

    let codigo = '<!-- Estimador de Hipoteca - generado con meskeIA -->\n\n';
    codigo += '<!-- Widget básico para blogs/inmobiliarias -->\n';
    codigo += '<div class="estimador-hipoteca-widget">\n';
    codigo += '  <div class="widget-header">\n';
    codigo += '    <h3>🏠 Tu hipoteca en un vistazo</h3>\n';
    codigo += '  </div>\n';
    codigo += '  <div class="widget-resultado">\n';
    codigo += '    <div class="cuota-principal">\n';
    codigo += `      <span class="label">Cuota mensual</span>\n`;
    codigo += `      <span class="valor">${formatCurrency(resultado.cuotaMensual)}</span>\n`;
    codigo += '    </div>\n';
    codigo += '    <div class="detalles-grid">\n';
    codigo += `      <div><strong>Capital:</strong> ${formatCurrency(resultado.capital)}</div>\n`;
    codigo += `      <div><strong>Plazo:</strong> ${plazo} años</div>\n`;
    codigo += `      <div><strong>Tipo:</strong> ${formatNumber(resultado.tipoEfectivo, 2)}% ${tipoInteres === 'fijo' ? 'fijo' : 'variable'}</div>\n`;
    codigo += `      <div><strong>Total intereses:</strong> ${formatCurrency(resultado.totalIntereses)}</div>\n`;
    codigo += '    </div>\n';
    codigo += '    <a href="https://meskeia.com/estimador-hipoteca/" class="cta-simular">Simula tu hipoteca gratis</a>\n';
    codigo += '  </div>\n';
    codigo += '</div>\n\n';
    codigo += '<!-- CSS recomendado (personaliza según tu diseño) -->\n';
    codigo += '<style>\n';
    codigo += '  .estimador-hipoteca-widget {\n';
    codigo += '    border: 1px solid #E5E5E5;\n';
    codigo += '    border-radius: 12px;\n';
    codigo += '    padding: 1.5rem;\n';
    codigo += '    background: #FFFFFF;\n';
    codigo += '  }\n';
    codigo += '  .cuota-principal .valor {\n';
    codigo += '    font-size: 2rem;\n';
    codigo += '    font-weight: bold;\n';
    codigo += '    color: #2E86AB;\n';
    codigo += '  }\n';
    codigo += '  .cta-simular {\n';
    codigo += '    display: inline-block;\n';
    codigo += '    margin-top: 1rem;\n';
    codigo += '    padding: 0.75rem 1.5rem;\n';
    codigo += '    background: linear-gradient(135deg, #2E86AB 0%, #48A9A6 100%);\n';
    codigo += '    color: white;\n';
    codigo += '    text-decoration: none;\n';
    codigo += '    border-radius: 8px;\n';
    codigo += '  }\n';
    codigo += '</style>';

    setHtmlCode(codigo);
  };

  // Copiar código HTML al portapapeles
  const copiarCodigoHTML = () => {
    navigator.clipboard.writeText(htmlCode);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  // Generar código HTML cuando hay resultado
  useMemo(() => {
    if (resultado) {
      generarCodigoHTML();
    } else {
      setHtmlCode('');
    }
  }, [resultado]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>🏠 Estimador de Hipoteca</h1>
        <p className={styles.subtitle}>
          Calcula tu cuota mensual y visualiza la amortización completa
        </p>
      </header>

      <LegalNotice lastUpdated="2026-02-02" />

      {/* Disclaimer Legal */}
      <DisclaimerCard
        variant="financial"
        severity="critical"
        collapsible={false}
        context="estimador-hipoteca"
      >
        <p>
          <strong>Este simulador proporciona ESTIMACIONES educativas.</strong> Los resultados NO son
          ofertas vinculantes de ninguna entidad bancaria.
        </p>
        <p className={styles.disclaimerHighlight}>
          <strong>Factores NO incluidos en el cálculo:</strong>
        </p>
        <ul>
          <li>Comisiones bancarias (apertura, estudio, etc.)</li>
          <li>Seguros obligatorios (vida, hogar, protección de pagos)</li>
          <li>Gastos de tasación y gestoría</li>
          <li>Variaciones futuras del Euríbor (en hipotecas variables)</li>
          <li>Tu situación crediticia específica</li>
        </ul>
        <p>
          <strong>Consulta con varios bancos</strong> para obtener ofertas reales adaptadas a tu
          situación personal antes de tomar una decisión de compra.
        </p>
      </DisclaimerCard>

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
              type="button"
              className={`${styles.tipoBtn} ${tipoInteres === 'fijo' ? styles.activo : ''}`}
              onClick={() => setTipoInteres('fijo')}
            >
              🔒 Fijo
            </button>
            <button
              type="button"
              className={`${styles.tipoBtn} ${tipoInteres === 'variable' ? styles.activo : ''}`}
              onClick={() => setTipoInteres('variable')}
            >
              📊 Variable
            </button>
            <button
              type="button"
              className={`${styles.tipoBtn} ${tipoInteres === 'mixta' ? styles.activo : ''}`}
              onClick={() => setTipoInteres('mixta')}
            >
              🔄 Mixta
            </button>
          </div>

          {tipoInteres === 'fijo' && (
            <div className={styles.sliderGroup}>
              <div className={styles.sliderHeader}>
                <label className={styles.label}>Interés fijo anual (TIN)</label>
                <span className={styles.sliderValue}>{formatNumber(interesAnual, 2)}%</span>
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
          )}

          {tipoInteres === 'variable' && (
            <>
              <div className={styles.sliderGroup}>
                <div className={styles.sliderHeader}>
                  <label className={styles.label}>Euríbor actual</label>
                  <span className={styles.sliderValue}>{formatNumber(euribor, 2)}%</span>
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
                  <span className={styles.sliderValue}>+{formatNumber(diferencial, 2)}%</span>
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

          {tipoInteres === 'mixta' && (
            <>
              <div className={styles.sliderGroup}>
                <div className={styles.sliderHeader}>
                  <label className={styles.label}>Tramo fijo inicial</label>
                  <span className={styles.sliderValue}>{plazoFijoMixta} años</span>
                </div>
                <input
                  type="range"
                  className={styles.slider}
                  min="1"
                  max={Math.min(15, plazo - 1) || 1}
                  value={plazoFijoMixta}
                  onChange={(e) => setPlazoFijoMixta(parseInt(e.target.value))}
                />
                <span className={styles.helpText}>Años con tipo fijo antes de pasar a variable</span>
              </div>
              <div className={styles.sliderGroup}>
                <div className={styles.sliderHeader}>
                  <label className={styles.label}>Tipo fijo inicial (TIN)</label>
                  <span className={styles.sliderValue}>{formatNumber(interesAnual, 2)}%</span>
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
              <div className={styles.sliderGroup}>
                <div className={styles.sliderHeader}>
                  <label className={styles.label}>Euríbor (tramo variable)</label>
                  <span className={styles.sliderValue}>{formatNumber(euribor, 2)}%</span>
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
                  <label className={styles.label}>Diferencial (tramo variable)</label>
                  <span className={styles.sliderValue}>+{formatNumber(diferencial, 2)}%</span>
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
                <span className={styles.resultadoLabel}>
                  {tipoInteres === 'mixta' ? `Cuota fase fija (${plazoFijoMixta} años)` : 'Tu cuota mensual'}
                </span>
                <span className={styles.resultadoValor}>
                  {formatCurrency(resultado.cuotaMensual)}
                </span>
                <span className={styles.resultadoSubtexto}>
                  {tipoInteres === 'fijo' && `Tipo fijo: ${formatNumber(resultado.tipoEfectivo, 2)}%`}
                  {tipoInteres === 'variable' && `TIN: ${formatNumber(resultado.tipoEfectivo, 2)}% (Euríbor + diferencial)`}
                  {tipoInteres === 'mixta' && `${formatNumber(interesAnual, 2)}% fijo · Luego Euríbor ${formatNumber(euribor, 2)}% + ${formatNumber(diferencial, 2)}%`}
                </span>
                {tipoInteres === 'mixta' && resultado.cuotaMixta2 > 0 && (
                  <span className={styles.resultadoCuota2}>
                    Cuota fase variable (años {plazoFijoMixta + 1}–{plazo}): {formatCurrency(resultado.cuotaMixta2)}/mes
                  </span>
                )}
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

      {/* Código HTML de implementación - Colapsable */}
      {resultado && htmlCode && (
        <div className={styles.htmlSection}>
          <div className={styles.htmlHeader}>
            <div>
              <h2>💻 Código de implementación</h2>
              <p className={styles.htmlSubtitle}>
                Integra este widget en tu blog, inmobiliaria o sitio web de finanzas personales
              </p>
            </div>
            <button
              onClick={() => setHtmlExpanded(!htmlExpanded)}
              className={styles.btnToggleCode}
              aria-label={htmlExpanded ? 'Ocultar código' : 'Mostrar código'}
            >
              {htmlExpanded ? '▼ Ocultar código' : '▶ Ver código HTML'}
            </button>
          </div>

          {htmlExpanded && (
            <div className={styles.codeContainer}>
              <pre className={styles.codeBlock}>
                <code>{htmlCode}</code>
              </pre>
              <button onClick={copiarCodigoHTML} className={styles.btnCopyCode}>
                {copiado ? '✅ Copiado' : '📋 Copiar código'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Comparador simultáneo Fija vs Variable vs Mixta */}
      {comparacion && (
        <div className={styles.comparadorSection}>
          <h2 className={styles.comparadorTitle}>⚖️ Compara los 3 tipos en tiempo real</h2>
          <p className={styles.comparadorSubtitle}>
            Misma hipoteca ({formatCurrency(comparacion.fija.cuota > 0 ? (parseSpanishNumber(precioVivienda) || 0) - (parseSpanishNumber(entrada) || 0) : 0)} de capital · {plazo} años), tres escenarios distintos
          </p>
          <div className={styles.comparadorGrid}>

            {/* Fija */}
            <div className={`${styles.comparadorCard} ${tipoInteres === 'fijo' ? styles.comparadorActivo : ''}`}>
              <div className={styles.comparadorCardHeader}>🔒 Hipoteca Fija</div>
              <div className={styles.comparadorCuota}>{formatCurrency(comparacion.fija.cuota)}<span className={styles.comparadorMes}>/mes</span></div>
              <div className={styles.comparadorRows}>
                <div className={styles.comparadorRow}>
                  <span>TIN</span>
                  <strong>{formatNumber(interesAnual, 2)}% fijo siempre</strong>
                </div>
                <div className={styles.comparadorRow}>
                  <span>Total pagado</span>
                  <strong>{formatCurrency(comparacion.fija.total)}</strong>
                </div>
                <div className={`${styles.comparadorRow} ${styles.comparadorRowIntereses}`}>
                  <span>Coste en intereses</span>
                  <strong>{formatCurrency(comparacion.fija.intereses)}</strong>
                </div>
              </div>
              <div className={styles.comparadorTag}>✅ Máxima estabilidad</div>
            </div>

            {/* Variable */}
            <div className={`${styles.comparadorCard} ${tipoInteres === 'variable' ? styles.comparadorActivo : ''}`}>
              <div className={styles.comparadorCardHeader}>📊 Hipoteca Variable</div>
              <div className={styles.comparadorCuota}>{formatCurrency(comparacion.variable.cuota)}<span className={styles.comparadorMes}>/mes</span></div>
              <div className={styles.comparadorRows}>
                <div className={styles.comparadorRow}>
                  <span>TIN actual</span>
                  <strong>Euríbor {formatNumber(euribor, 2)}% + {formatNumber(diferencial, 2)}%</strong>
                </div>
                <div className={styles.comparadorRow}>
                  <span>Total pagado</span>
                  <strong>{formatCurrency(comparacion.variable.total)}</strong>
                </div>
                <div className={`${styles.comparadorRow} ${styles.comparadorRowIntereses}`}>
                  <span>Coste en intereses</span>
                  <strong>{formatCurrency(comparacion.variable.intereses)}</strong>
                </div>
              </div>
              <div className={styles.comparadorTag}>⚡ Potencial de ahorro</div>
            </div>

            {/* Mixta */}
            <div className={`${styles.comparadorCard} ${tipoInteres === 'mixta' ? styles.comparadorActivo : ''}`}>
              <div className={styles.comparadorCardHeader}>🔄 Hipoteca Mixta</div>
              <div className={styles.comparadorCuota}>{formatCurrency(comparacion.mixta.cuota1)}<span className={styles.comparadorMes}>/mes*</span></div>
              <div className={styles.comparadorRows}>
                <div className={styles.comparadorRow}>
                  <span>Fase fija ({plazoFijoMixta}a)</span>
                  <strong>{formatNumber(interesAnual, 2)}% TIN</strong>
                </div>
                <div className={styles.comparadorRow}>
                  <span>Fase variable</span>
                  <strong>{formatCurrency(comparacion.mixta.cuota2)}/mes*</strong>
                </div>
                <div className={`${styles.comparadorRow} ${styles.comparadorRowIntereses}`}>
                  <span>Coste en intereses</span>
                  <strong>{formatCurrency(comparacion.mixta.intereses)}</strong>
                </div>
              </div>
              <div className={styles.comparadorTag}>🎯 Equilibrio riesgo-ahorro</div>
              <p className={styles.comparadorNota}>*Con Euríbor actual. Puede variar.</p>
            </div>

          </div>
          <p className={styles.comparadorAviso}>
            💡 Usa los controles de arriba para ajustar Euríbor y diferencial y ver cómo cambia la comparativa en tiempo real.
          </p>
        </div>
      )}

      {/* Contenido Educativo */}
      <EducationalSection
        title="Guía completa sobre hipotecas"
        subtitle="Aprende sobre tipos de interés, amortización, negociación y preguntas frecuentes"
      >
        {/* Tabla comparativa Fija vs Variable vs Mixta */}
        <div className={styles.comparativaSection}>
          <h2>⚖️ Hipoteca Fija vs Variable vs Mixta: ¿Cuál te conviene?</h2>
        <p className={styles.comparativaSubtitle}>
          Entiende las diferencias clave para tomar la mejor decisión según tu perfil
        </p>

        <div className={styles.comparativaTable} style={{ '--cols': '4' } as React.CSSProperties}>
          <div className={styles.comparativaRow4}>
            <div className={styles.comparativaAspecto}><strong>Aspecto</strong></div>
            <div className={styles.comparativaFija}><strong>🔒 Fija</strong></div>
            <div className={styles.comparativaVariable}><strong>📊 Variable</strong></div>
            <div className={styles.comparativaMixta}><strong>🔄 Mixta</strong></div>
          </div>

          <div className={styles.comparativaRow4}>
            <div className={styles.comparativaAspecto}>Cuota mensual</div>
            <div className={styles.comparativaFija}>Siempre la misma</div>
            <div className={styles.comparativaVariable}>Cambia según Euríbor</div>
            <div className={styles.comparativaMixta}>Fija X años, luego variable</div>
          </div>

          <div className={styles.comparativaRow4}>
            <div className={styles.comparativaAspecto}>TIN inicial</div>
            <div className={styles.comparativaFija}>Mayor (3-4%)</div>
            <div className={styles.comparativaVariable}>Menor (Euríbor + 0.6-1.2%)</div>
            <div className={styles.comparativaMixta}>Medio (inferior al fijo puro)</div>
          </div>

          <div className={styles.comparativaRow4}>
            <div className={styles.comparativaAspecto}>Riesgo</div>
            <div className={styles.comparativaFija}>✅ Nulo</div>
            <div className={styles.comparativaVariable}>⚠️ Alto</div>
            <div className={styles.comparativaMixta}>🟡 Medio (solo fase variable)</div>
          </div>

          <div className={styles.comparativaRow4}>
            <div className={styles.comparativaAspecto}>Ideal para...</div>
            <div className={styles.comparativaFija}>
              • Máxima estabilidad<br />
              • Ingresos justos<br />
              • Plazo largo (25-30 años)
            </div>
            <div className={styles.comparativaVariable}>
              • Asumir riesgo<br />
              • Ingresos holgados<br />
              • Plazo corto (10-15 años)
            </div>
            <div className={styles.comparativaMixta}>
              • Amortización anticipada planificada<br />
              • Ingresos estables y crecientes<br />
              • Herencia o bonus esperados
            </div>
          </div>

          <div className={styles.comparativaRow4}>
            <div className={styles.comparativaAspecto}>Ahorro potencial</div>
            <div className={styles.comparativaFija}>Menor (pagas "seguro")</div>
            <div className={styles.comparativaVariable}>Mayor (si Euríbor baja)</div>
            <div className={styles.comparativaMixta}>Medio (mejor que fija si Euríbor baja en fase variable)</div>
          </div>
        </div>

          <div className={styles.comparativaConsejo}>
            <strong>💡 Recomendación meskeIA:</strong> Si tu ratio de endeudamiento supera el 35%,
            prioriza la hipoteca fija para evitar sorpresas. Si está por debajo del 25% y tienes
            colchón de ahorro, la variable puede ahorrarte dinero. La mixta es óptima si planeas
            amortizar anticipadamente en los primeros años.
          </div>
        </div>

        {/* Escenarios típicos */}
        <div className={styles.escenariosSection}>
        <h2>🎯 Escenarios típicos de hipoteca</h2>
        <p className={styles.escenariosSubtitle}>
          Ejemplos reales para ayudarte a tomar decisiones informadas
        </p>

        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioIcon}>🏠</div>
            <h3>Primera vivienda (joven)</h3>
            <div className={styles.escenarioData}>
              <div className={styles.escenarioDato}>
                <span>Precio:</span> <strong>180.000 €</strong>
              </div>
              <div className={styles.escenarioDato}>
                <span>Entrada:</span> <strong>36.000 € (20%)</strong>
              </div>
              <div className={styles.escenarioDato}>
                <span>Plazo:</span> <strong>30 años</strong>
              </div>
              <div className={styles.escenarioDato}>
                <span>TIN:</span> <strong>3.5% fijo</strong>
              </div>
            </div>
            <div className={styles.escenarioResultado}>
              Cuota: <strong>~645 €/mes</strong>
            </div>
            <p className={styles.escenarioConsejo}>
              Plazo largo para reducir cuota. Fijo para estabilidad con ingresos iniciales modestos.
            </p>
          </div>

          <div className={styles.escenarioCard}>
            <div className={styles.escenarioIcon}>🏘️</div>
            <h3>Segunda residencia (familiar)</h3>
            <div className={styles.escenarioData}>
              <div className={styles.escenarioDato}>
                <span>Precio:</span> <strong>300.000 €</strong>
              </div>
              <div className={styles.escenarioDato}>
                <span>Entrada:</span> <strong>90.000 € (30%)</strong>
              </div>
              <div className={styles.escenarioDato}>
                <span>Plazo:</span> <strong>20 años</strong>
              </div>
              <div className={styles.escenarioDato}>
                <span>TIN:</span> <strong>Euríbor + 0.9%</strong>
              </div>
            </div>
            <div className={styles.escenarioResultado}>
              Cuota: <strong>~1.262 €/mes</strong>
            </div>
            <p className={styles.escenarioConsejo}>
              Entrada mayor (más ahorro). Variable para aprovechar tipos bajos con colchón económico.
            </p>
          </div>

          <div className={styles.escenarioCard}>
            <div className={styles.escenarioIcon}>🏢</div>
            <h3>Inversión (alquiler)</h3>
            <div className={styles.escenarioData}>
              <div className={styles.escenarioDato}>
                <span>Precio:</span> <strong>150.000 €</strong>
              </div>
              <div className={styles.escenarioDato}>
                <span>Entrada:</span> <strong>45.000 € (30%)</strong>
              </div>
              <div className={styles.escenarioDato}>
                <span>Plazo:</span> <strong>15 años</strong>
              </div>
              <div className={styles.escenarioDato}>
                <span>TIN:</span> <strong>Euríbor + 1.2%</strong>
              </div>
            </div>
            <div className={styles.escenarioResultado}>
              Cuota: <strong>~787 €/mes</strong>
            </div>
            <p className={styles.escenarioConsejo}>
              Plazo corto para amortizar rápido. El alquiler debe cubrir la cuota + gastos (~950 €/mes).
            </p>
          </div>

          <div className={styles.escenarioCard}>
            <div className={styles.escenarioIcon}>🏢</div>
            <h3>Hipoteca mixta (joven profesional)</h3>
            <div className={styles.escenarioData}>
              <div className={styles.escenarioDato}>
                <span>Precio:</span> <strong>220.000 €</strong>
              </div>
              <div className={styles.escenarioDato}>
                <span>Entrada:</span> <strong>44.000 € (20%)</strong>
              </div>
              <div className={styles.escenarioDato}>
                <span>Plazo:</span> <strong>25 años</strong>
              </div>
              <div className={styles.escenarioDato}>
                <span>Tipo:</span> <strong>Mixta: 5 años fijo 2.8% + variable</strong>
              </div>
            </div>
            <div className={styles.escenarioResultado}>
              Cuota: <strong>~830 €/mes (fase fija)</strong>
            </div>
            <p className={styles.escenarioConsejo}>
              Hipoteca mixta: previsibilidad inicial con posible ahorro posterior. Ideal para quien espera amortizar anticipadamente en los primeros 5 años.
            </p>
          </div>

          <div className={styles.escenarioCard}>
            <div className={styles.escenarioIcon}>👴</div>
            <h3>Hipoteca con entrada alta (55 años)</h3>
            <div className={styles.escenarioData}>
              <div className={styles.escenarioDato}>
                <span>Precio:</span> <strong>350.000 €</strong>
              </div>
              <div className={styles.escenarioDato}>
                <span>Entrada:</span> <strong>175.000 € (50%)</strong>
              </div>
              <div className={styles.escenarioDato}>
                <span>Plazo:</span> <strong>10 años</strong>
              </div>
              <div className={styles.escenarioDato}>
                <span>TIN:</span> <strong>3.8% fijo</strong>
              </div>
            </div>
            <div className={styles.escenarioResultado}>
              Cuota: <strong>~1.740 €/mes</strong>
            </div>
            <p className={styles.escenarioConsejo}>
              A partir de los 55 años, los bancos limitan el plazo (hipoteca debe acabar antes de 70-75 años). Necesitas mayor entrada y cuota más alta. Fija para certidumbre cerca de la jubilación.
            </p>
          </div>

          <div className={styles.escenarioCard}>
            <div className={styles.escenarioIcon}>🌍</div>
            <h3>No residente (español en el extranjero)</h3>
            <div className={styles.escenarioData}>
              <div className={styles.escenarioDato}>
                <span>Precio:</span> <strong>200.000 €</strong>
              </div>
              <div className={styles.escenarioDato}>
                <span>Entrada:</span> <strong>70.000 € (35%)</strong>
              </div>
              <div className={styles.escenarioDato}>
                <span>Plazo:</span> <strong>20 años</strong>
              </div>
              <div className={styles.escenarioDato}>
                <span>TIN:</span> <strong>4.2% fijo (no residente)</strong>
              </div>
            </div>
            <div className={styles.escenarioResultado}>
              Cuota: <strong>~802 €/mes</strong>
            </div>
            <p className={styles.escenarioConsejo}>
              Los no residentes necesitan mayor entrada (30-40%) y obtienen tipos algo más altos. Algunos bancos especializados (Sabadell, CaixaBank) tienen productos específicos para emigrantes.
            </p>
          </div>
        </div>
        </div>

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

          {/* Guía paso a paso */}
          <h2>Cómo conseguir tu hipoteca (paso a paso)</h2>
          <div className={styles.stepGuide}>
            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h3>Calcula tu capacidad de ahorro real</h3>
                <p>
                  Necesitas ahorrar <strong>al menos 30-32% del precio de la vivienda</strong>:
                  20% de entrada + 10-12% de gastos (impuestos, notaría, registro, gestoría).
                  Para una vivienda de 200.000 €, necesitas ~60.000 € ahorrados.
                </p>
              </div>
            </div>

            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h3>Determina tu presupuesto máximo</h3>
                <p>
                  Usa la regla del 30-35%: tu cuota mensual NO debe superar el 35% de tus ingresos netos.
                  Si cobras 2.500 € netos, tu cuota máxima es ~875 €/mes. Esto te permite acceder a
                  hipotecas de 150.000-180.000 € (dependiendo del plazo e interés).
                </p>
              </div>
            </div>

            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h3>Solicita ofertas en 3-5 bancos</h3>
                <p>
                  No te quedes con el primer banco. Pide simulaciones vinculantes en al menos 3 entidades.
                  Lleva: DNI, últimas 3 nóminas, declaración de la renta, escrituras del piso (si ya tienes reserva).
                  Compara TAE, no solo TIN.
                </p>
              </div>
            </div>

            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h3>Negocia productos vinculados</h3>
                <p>
                  Los bancos ofrecen mejores tipos si contratas seguros, domicilias nómina o adquieres
                  tarjetas. <strong>Calcula el coste real</strong>: un diferencial 0.2% más bajo puede
                  compensar 30 €/mes de seguros. Negocia cada producto por separado.
                </p>
              </div>
            </div>

            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h3>Revisa la oferta vinculante con un experto</h3>
                <p>
                  Antes de firmar, lleva la oferta a un abogado especializado en hipotecas o a un asesor
                  financiero independiente. Verifica: comisiones de apertura, penalizaciones por amortización
                  anticipada, cláusulas suelo, gastos de subrogación. Invertir 200-300 € aquí te ahorra miles.
                </p>
              </div>
            </div>

            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <h3>Firma en notaría y registra</h3>
                <p>
                  El día de la firma: lee TODO el contrato antes de firmar (lleva 1-2 horas). Pregunta cualquier
                  duda al notario. Tras firmar, registra la hipoteca en el Registro de la Propiedad (lo hace
                  la gestoría). Guarda TODOS los documentos originales en un lugar seguro.
                </p>
              </div>
            </div>
          </div>

          {/* FAQ ampliado */}
          <h2>Preguntas frecuentes</h2>

          <div className={styles.faqItem}>
            <h3>❓ ¿Qué es mejor: hipoteca fija o variable?</h3>
            <p>
              Depende de tu perfil de riesgo y situación financiera:
            </p>
            <p className={styles.faqExample}>
              <strong>Elige FIJA si:</strong><br />
              • Tu ratio de endeudamiento es alto (más del 35%)<br />
              • Tus ingresos son justos y no puedes asumir subidas de cuota<br />
              • Buscas previsibilidad total durante 20-30 años<br />
              • Los tipos están históricamente bajos (momento de "congelar" el precio)
            </p>
            <p className={styles.faqExample}>
              <strong>Elige VARIABLE si:</strong><br />
              • Tu ratio de endeudamiento es bajo (menos del 25%)<br />
              • Tienes colchón de ahorro para absorber subidas puntuales<br />
              • El plazo es corto (10-15 años) y puedes amortizar anticipadamente<br />
              • Esperas que el Euríbor se mantenga o baje en el medio plazo
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>❓ ¿Cuánto necesito exactamente de entrada y gastos?</h3>
            <p>
              Para comprar una vivienda de <strong>200.000 €</strong>, necesitas ahorrar:
            </p>
            <p className={styles.faqExample}>
              <strong>Desglose completo:</strong><br />
              • <strong>Entrada (20%):</strong> 40.000 € (el banco financia 160.000 €)<br />
              • <strong>ITP/IVA:</strong> 12.000-20.000 € (6-10% según CCAA y si es nueva/usada)<br />
              • <strong>Notaría + Registro:</strong> 1.500-2.000 €<br />
              • <strong>Gestoría:</strong> 600-800 €<br />
              • <strong>Tasación:</strong> 300-400 €<br />
              • <strong>TOTAL NECESARIO:</strong> ~54.000-63.000 € (27-31% del precio)
            </p>
            <p className={styles.faqTip}>
              💡 <strong>Consejo:</strong> Reserva 5.000-10.000 € adicionales como colchón para imprevistos
              (muebles, pequeñas reformas, comunidad de propietarios del primer mes).
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>❓ ¿Puedo cambiar mi hipoteca de banco (subrogación)?</h3>
            <p>
              Sí, es posible y GRATIS desde 2019 (Ley de Crédito Inmobiliario). El proceso:
            </p>
            <p className={styles.faqExample}>
              <strong>Pasos para subrogar:</strong><br />
              1. Solicita ofertas vinculantes en otros bancos (mínimo 3)<br />
              2. Informa a tu banco actual: tienen 15 días para mejorar condiciones<br />
              3. Si no mejoran o no es suficiente, acepta la mejor oferta externa<br />
              4. El nuevo banco paga al antiguo y tu hipoteca se "traslada"<br />
              5. <strong>Gastos:</strong> Solo notaría (~500-800 €), el resto lo paga el banco
            </p>
            <p className={styles.faqTip}>
              💡 <strong>Cuándo merece la pena:</strong> Si reduces el TIN más de 0.5% y te quedan
              más de 10 años de hipoteca. Ahorro potencial: 10.000-30.000 € en total.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>❓ ¿Qué pasa si suben los tipos de interés en una variable?</h3>
            <p>
              En hipotecas variables, tu cuota se revisa cada 6 o 12 meses según el Euríbor.
              <strong>Ejemplo real:</strong>
            </p>
            <p className={styles.faqExample}>
              • <strong>Situación inicial:</strong> Hipoteca de 150.000 € a 25 años, Euríbor 1% + diferencial 0.8% = 1.8% TIN<br />
              • <strong>Cuota inicial:</strong> ~625 €/mes<br />
              <br />
              <strong>Escenario 1 - Euríbor sube a 3%:</strong><br />
              • Nuevo TIN: 3.8% (3% + 0.8%)<br />
              • Nueva cuota: ~800 €/mes (+175 €/mes = +28%)<br />
              <br />
              <strong>Escenario 2 - Euríbor baja a -0.5%:</strong><br />
              • Nuevo TIN: 0.8% (-0.5% + 0.8%, con suelo en 0%)<br />
              • Nueva cuota: ~540 €/mes (-85 €/mes = -14%)
            </p>
            <p className={styles.faqTip}>
              ⚠️ <strong>Protección:</strong> Muchos bancos ofrecen "seguros de tipos" que limitan
              las subidas (caps) a cambio de renunciar a bajadas (floors). Evalúa si te compensa.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>❓ ¿Conviene hacer amortizaciones anticipadas?</h3>
            <p>
              Sí, <strong>especialmente en los primeros años</strong> de la hipoteca, cuando pagas más intereses.
            </p>
            <p className={styles.faqExample}>
              <strong>Ejemplo práctico:</strong><br />
              Hipoteca de 160.000 € a 25 años al 3.5% TIN (cuota ~800 €/mes).<br />
              <br />
              <strong>Opción A - Amortizar 10.000 € en el año 5:</strong><br />
              • Ahorras ~22.000 € en intereses totales<br />
              • Reduces el plazo en 2 años (terminas en 23 años)<br />
              <br />
              <strong>Opción B - Amortizar 10.000 € en el año 15:</strong><br />
              • Ahorras ~8.000 € en intereses totales<br />
              • Reduces el plazo en 1 año (terminas en 24 años)
            </p>
            <p className={styles.faqTip}>
              💡 <strong>Estrategia óptima:</strong> Si puedes, amortiza pequeñas cantidades (3.000-5.000 €)
              cada 2-3 años en lugar de esperar a acumular mucho. Elige reducir PLAZO en lugar de cuota
              para ahorrar más intereses.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>❓ ¿Qué comisiones puedo negociar o evitar?</h3>
            <p>
              Hay comisiones obligatorias y otras negociables. Lista completa:
            </p>
            <p className={styles.faqExample}>
              <strong>Comisiones OBLIGATORIAS (no puedes evitarlas):</strong><br />
              • Notaría: ~1.000-1.500 € (fijado por arancel)<br />
              • Registro de la Propiedad: ~400-600 € (fijado por arancel)<br />
              • Gestoría: ~600-800 € (libre, puedes elegir la tuya)<br />
              • Tasación: ~300-400 € (obligatoria, elige la más barata)<br />
              <br />
              <strong>Comisiones NEGOCIABLES (intenta reducirlas):</strong><br />
              • Comisión de apertura: 0-2% del capital (¡negocia que la eliminen!)<br />
              • Comisión estudio: ~300-500 € (muchos bancos la quitan si domicilias nómina)<br />
              • Seguros vinculados: Variable (compara con aseguradoras externas)
            </p>
            <p className={styles.faqTip}>
              💡 <strong>Truco de negociación:</strong> Lleva ofertas de otros bancos. Si el Banco A
              te cobra 1% de apertura (1.600 €) y el Banco B 0%, muéstraselo al A. Muchos aceptan
              igualarlo para no perder el cliente.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>❓ ¿Qué es la hipoteca mixta y cuándo conviene?</h3>
            <p>
              La hipoteca mixta combina un período inicial a tipo fijo (normalmente 3-10 años) con el resto a tipo variable (Euríbor + diferencial). Ventajas: tipos fijos del tramo inicial suelen ser menores que una hipoteca fija pura; si amortizas anticipadamente durante el tramo fijo, reduces mucho el coste del tramo variable posterior. Inconveniente: si los tipos suben mucho justo cuando empieza el tramo variable, te quedas sin el escudo de la fija.
            </p>
            <p className={styles.faqTip}>
              💡 <strong>Ideal para:</strong> Quien planea amortizar fuertemente en los primeros 5-7 años (herencia esperada, bonus recurrentes) y así reducir el capital pendiente antes del tramo variable.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>❓ ¿Qué es el seguro de vida vinculado a la hipoteca y es obligatorio?</h3>
            <p>
              Desde la Ley de Crédito Inmobiliario (2019), el banco no puede obligarte a contratar seguros con ellos. Pero sí pueden ofrecerte un diferencial de interés menor si los contratas (bonificación). El seguro de vida hipotecario garantiza el pago del préstamo si el titular fallece. El seguro de hogar (continente) sí es obligatorio por ley, pero puedes contratarlo con cualquier aseguradora.
            </p>
            <p className={styles.faqTip}>
              💡 <strong>Cálculo clave:</strong> Compara el seguro del banco vs. aseguradoras externas (Mutua, Mapfre, AXA). La bonificación en el diferencial puede ser 0.1-0.3%. Calcula si el ahorro en intereses compensa el sobrecoste del seguro bancario. A menudo, no compensa.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>❓ ¿Cómo afecta el Euríbor a mi hipoteca variable y qué perspectivas hay?</h3>
            <p>
              El Euríbor (Euro Interbank Offered Rate) es el tipo al que los bancos europeos se prestan dinero entre sí. Las hipotecas variables en España se referencian principalmente al Euríbor a 12 meses. Cuando el BCE sube los tipos de interés para combatir la inflación, el Euríbor sube; cuando los baja (entorno de recesión o baja inflación), el Euríbor baja. La revisión de tu hipoteca variable ocurre cada 6 o 12 meses según el contrato.
            </p>
            <p className={styles.faqTip}>
              💡 <strong>Perspectiva:</strong> El Euríbor ha oscilado entre -0.5% y +4.2% entre 2016 y 2024. Para hipotecas a 25-30 años, es estadísticamente seguro asumir que atravesará varios ciclos alcistas y bajistas. Usa el simulador con el tipo actual y luego con +2% para ver el impacto en tu cuota.
            </p>
          </div>

          {/* Mejores prácticas */}
          <h2>Mejores prácticas para tu hipoteca</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✅</span>
              <h4>Simula antes de buscar piso</h4>
              <p>Calcula tu capacidad de compra ANTES de enamorarte de un piso. Evitarás decepciones y negociarás mejor sabiendo tu límite.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✅</span>
              <h4>Compara TAE, no TIN</h4>
              <p>La TAE incluye comisiones y seguros. Un TIN de 3% con TAE 3.8% puede ser peor que un TIN 3.2% con TAE 3.5%.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✅</span>
              <h4>Negocia productos vinculados</h4>
              <p>No aceptes todo el "pack". Calcula si los seguros obligatorios compensan el diferencial reducido. A veces es mejor pagar 0.2% más sin vinculaciones.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✅</span>
              <h4>Lee cláusulas de penalización</h4>
              <p>Verifica la comisión por amortización anticipada (máximo 0.15% en fijas, gratis en variables tras 5 años). Evita cláusulas suelo abusivas.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✅</span>
              <h4>Mantén un fondo de emergencia</h4>
              <p>Tras pagar entrada y gastos, conserva 3-6 meses de gastos en ahorro líquido. Imprevistos (paro, reparaciones) no deben ponerte en riesgo de impago.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✅</span>
              <h4>Revisa tu hipoteca cada 2 años</h4>
              <p>Compara ofertas del mercado. Si encuentras mejores condiciones, negocia con tu banco o subroga. El ahorro acumulado puede superar los 20.000 €.</p>
            </div>
          </div>

          {/* Advertencias */}
          <div className={styles.warningBox}>
            <h3>⚠️ Errores comunes que debes evitar</h3>
            <ul>
              <li><strong>Apurar toda tu capacidad de ahorro en la entrada:</strong> Necesitas colchón post-compra para imprevistos.</li>
              <li><strong>No leer el contrato completo antes de firmar:</strong> Las cláusulas en letra pequeña pueden costarte miles de euros.</li>
              <li><strong>Aceptar la primera oferta sin negociar:</strong> Los bancos SIEMPRE tienen margen de mejora. Pide reducción de diferencial.</li>
              <li><strong>Ignorar gastos ocultos (seguros, productos vinculados):</strong> Suma TODO al calcular el coste real mensual.</li>
              <li><strong>Elegir variable sin colchón financiero:</strong> Si tu ratio ya es del 35%, una subida del Euríbor puede ahogarte.</li>
              <li><strong>No solicitar ofertas vinculantes:</strong> Las simulaciones orales no valen. Exige documento firmado con condiciones exactas.</li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('estimador-hipoteca')} />
      <ShareCard appName="estimador-hipoteca" />
      <Footer appName="estimador-hipoteca" />
    </div>
  );
}
