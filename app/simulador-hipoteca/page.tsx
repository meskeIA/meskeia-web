'use client';

import { useState, useMemo } from 'react';
import styles from './SimuladorHipoteca.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { EducationalSection, RelatedApps, DisclaimerCard, LegalNotice } from '@/components';
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

  // Generar código HTML de implementación
  const generarCodigoHTML = () => {
    if (!resultado) return;

    let codigo = '<!-- Simulador de Hipoteca - generado con meskeIA -->\n\n';
    codigo += '<!-- Widget básico para blogs/inmobiliarias -->\n';
    codigo += '<div class="simulador-hipoteca-widget">\n';
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
    codigo += '    <a href="https://meskeia.com/simulador-hipoteca/" class="cta-simular">Simula tu hipoteca gratis</a>\n';
    codigo += '  </div>\n';
    codigo += '</div>\n\n';
    codigo += '<!-- CSS recomendado (personaliza según tu diseño) -->\n';
    codigo += '<style>\n';
    codigo += '  .simulador-hipoteca-widget {\n';
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
        <h1 className={styles.title}>🏠 Simulador de Hipoteca</h1>
        <p className={styles.subtitle}>
          Calcula tu cuota mensual y visualiza la amortización completa
        </p>
      </header>

      <LegalNotice lastUpdated="2026-02-02" />

      {/* Disclaimer Legal */}
      <DisclaimerCard
        variant="financial"
        severity="high"
        collapsible={true}
        context="simulador-hipoteca"
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

      {/* Última actualización */}
      

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

      {/* Tabla comparativa Fija vs Variable */}
      <div className={styles.comparativaSection}>
        <h2>⚖️ Hipoteca Fija vs Variable: ¿Cuál te conviene?</h2>
        <p className={styles.comparativaSubtitle}>
          Entiende las diferencias clave para tomar la mejor decisión según tu perfil
        </p>

        <div className={styles.comparativaTable}>
          <div className={styles.comparativaRow}>
            <div className={styles.comparativaAspecto}>
              <strong>Aspecto</strong>
            </div>
            <div className={styles.comparativaFija}>
              <strong>🔒 Hipoteca Fija</strong>
            </div>
            <div className={styles.comparativaVariable}>
              <strong>📊 Hipoteca Variable</strong>
            </div>
          </div>

          <div className={styles.comparativaRow}>
            <div className={styles.comparativaAspecto}>Cuota mensual</div>
            <div className={styles.comparativaFija}>Siempre la misma</div>
            <div className={styles.comparativaVariable}>Cambia según Euríbor</div>
          </div>

          <div className={styles.comparativaRow}>
            <div className={styles.comparativaAspecto}>TIN inicial</div>
            <div className={styles.comparativaFija}>Mayor (3-4%)</div>
            <div className={styles.comparativaVariable}>Menor (Euríbor + 0.6-1.2%)</div>
          </div>

          <div className={styles.comparativaRow}>
            <div className={styles.comparativaAspecto}>Riesgo</div>
            <div className={styles.comparativaFija}>✅ Nulo (previsibilidad total)</div>
            <div className={styles.comparativaVariable}>⚠️ Alto (si suben los tipos)</div>
          </div>

          <div className={styles.comparativaRow}>
            <div className={styles.comparativaAspecto}>Ideal para...</div>
            <div className={styles.comparativaFija}>
              • Buscas estabilidad<br />
              • Ingresos justos<br />
              • Plazo largo (25-30 años)
            </div>
            <div className={styles.comparativaVariable}>
              • Puedes asumir riesgo<br />
              • Ingresos holgados<br />
              • Plazo corto (10-15 años)
            </div>
          </div>

          <div className={styles.comparativaRow}>
            <div className={styles.comparativaAspecto}>Ahorro potencial</div>
            <div className={styles.comparativaFija}>Menor (pagas "seguro")</div>
            <div className={styles.comparativaVariable}>Mayor (si Euríbor baja o se mantiene)</div>
          </div>
        </div>

        <div className={styles.comparativaConsejo}>
          <strong>💡 Recomendación meskeIA:</strong> Si tu ratio de endeudamiento supera el 35%,
          prioriza la hipoteca fija para evitar sorpresas. Si está por debajo del 25% y tienes
          colchón de ahorro, la variable puede ahorrarte dinero.
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
              Cuota: <strong>~1.165 €/mes</strong>
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
              Cuota: <strong>~735 €/mes</strong>
            </div>
            <p className={styles.escenarioConsejo}>
              Plazo corto para amortizar rápido. El alquiler debe cubrir la cuota + gastos (~900 €/mes).
            </p>
          </div>
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
        title="📚 Guía completa sobre hipotecas"
        subtitle="Aprende sobre tipos de interés, amortización, negociación y preguntas frecuentes"
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

      <RelatedApps apps={getRelatedApps('simulador-hipoteca')} />
      <Footer appName="simulador-hipoteca" />
    </div>
  );
}
