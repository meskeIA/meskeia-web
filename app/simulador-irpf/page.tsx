'use client';

import { useState, useMemo } from 'react';
import styles from './SimuladorIRPF.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { EducationalSection, RelatedApps} from '@/components';
import { formatNumber, formatCurrency, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// Tramos IRPF 2024 (Base General - Estatal + Autonómico estándar)
const TRAMOS_IRPF_2024 = [
  { desde: 0, hasta: 12450, tipoEstatal: 9.5, tipoAutonomico: 9.5 },
  { desde: 12450, hasta: 20200, tipoEstatal: 12.0, tipoAutonomico: 12.0 },
  { desde: 20200, hasta: 35200, tipoEstatal: 15.0, tipoAutonomico: 15.0 },
  { desde: 35200, hasta: 60000, tipoEstatal: 18.5, tipoAutonomico: 18.5 },
  { desde: 60000, hasta: 300000, tipoEstatal: 22.5, tipoAutonomico: 22.5 },
  { desde: 300000, hasta: Infinity, tipoEstatal: 24.5, tipoAutonomico: 22.5 },
];

// Mínimo personal y familiar 2024
const MINIMO_PERSONAL = 5550;
const MINIMO_DESCENDIENTE_1 = 2400;
const MINIMO_DESCENDIENTE_2 = 2700;
const MINIMO_DESCENDIENTE_3 = 4000;
const MINIMO_DESCENDIENTE_4_Y_MAS = 4500;
const INCREMENTO_MENOR_3_ANOS = 2800;
const MINIMO_ASCENDIENTE_65 = 1150;
const MINIMO_ASCENDIENTE_75 = 1400;

type SituacionPersonal = 'soltero' | 'casado_individual' | 'casado_conjunto';

interface ResultadoIRPF {
  baseImponible: number;
  baseImponibleGeneral: number;
  minimoPersonalFamiliar: number;
  baseLiquidable: number;
  cuotaIntegra: number;
  deduccionesAplicadas: number;
  cuotaLiquida: number;
  tipoEfectivo: number;
  desglosePorTramos: {
    tramo: string;
    base: number;
    tipo: number;
    cuota: number;
  }[];
}

export default function SimuladorIRPFPage() {
  // Ingresos
  const [salarioBruto, setSalarioBruto] = useState('');
  const [otrosIngresos, setOtrosIngresos] = useState('');
  const [retencionesYaPagadas, setRetencionesYaPagadas] = useState('');

  // Situación personal
  const [situacion, setSituacion] = useState<SituacionPersonal>('soltero');
  const [edad, setEdad] = useState('35');

  // Familia
  const [numHijos, setNumHijos] = useState('0');
  const [hijosMenores3, setHijosMenores3] = useState('0');
  const [ascendientes65, setAscendientes65] = useState('0');
  const [ascendientes75, setAscendientes75] = useState('0');

  // Deducciones
  const [viviendaHabitual, setViviendaHabitual] = useState(false);
  const [planPensiones, setPlanPensiones] = useState('');

  const [calculado, setCalculado] = useState(false);

  // Calcular mínimo personal y familiar
  const calcularMinimoPersonalFamiliar = (): number => {
    let minimo = MINIMO_PERSONAL;

    // Mínimo por descendientes
    const hijos = parseInt(numHijos) || 0;
    const menores3 = parseInt(hijosMenores3) || 0;

    if (hijos >= 1) minimo += MINIMO_DESCENDIENTE_1;
    if (hijos >= 2) minimo += MINIMO_DESCENDIENTE_2;
    if (hijos >= 3) minimo += MINIMO_DESCENDIENTE_3;
    if (hijos >= 4) {
      for (let i = 4; i <= hijos; i++) {
        minimo += MINIMO_DESCENDIENTE_4_Y_MAS;
      }
    }

    // Incremento por hijos menores de 3 años
    minimo += menores3 * INCREMENTO_MENOR_3_ANOS;

    // Mínimo por ascendientes
    const asc65 = parseInt(ascendientes65) || 0;
    const asc75 = parseInt(ascendientes75) || 0;
    minimo += asc65 * MINIMO_ASCENDIENTE_65;
    minimo += asc75 * MINIMO_ASCENDIENTE_75;

    // Duplicar si tributación conjunta
    if (situacion === 'casado_conjunto') {
      minimo += MINIMO_PERSONAL; // Segundo cónyuge
    }

    return minimo;
  };

  // Calcular cuota por tramos
  const calcularCuotaPorTramos = (baseLiquidable: number): { cuota: number; desglose: ResultadoIRPF['desglosePorTramos'] } => {
    let cuotaTotal = 0;
    const desglose: ResultadoIRPF['desglosePorTramos'] = [];
    let baseRestante = baseLiquidable;

    for (const tramo of TRAMOS_IRPF_2024) {
      if (baseRestante <= 0) break;

      const baseTramo = Math.min(baseRestante, tramo.hasta - tramo.desde);
      const tipoTotal = tramo.tipoEstatal + tramo.tipoAutonomico;
      const cuotaTramo = (baseTramo * tipoTotal) / 100;

      if (baseTramo > 0) {
        desglose.push({
          tramo: tramo.hasta === Infinity
            ? `Más de ${formatNumber(tramo.desde, 0)} €`
            : `${formatNumber(tramo.desde, 0)} - ${formatNumber(tramo.hasta, 0)} €`,
          base: baseTramo,
          tipo: tipoTotal,
          cuota: cuotaTramo,
        });

        cuotaTotal += cuotaTramo;
      }

      baseRestante -= baseTramo;
    }

    return { cuota: cuotaTotal, desglose };
  };

  const resultado = useMemo((): ResultadoIRPF | null => {
    if (!calculado) return null;

    const salario = parseSpanishNumber(salarioBruto) || 0;
    const otros = parseSpanishNumber(otrosIngresos) || 0;
    const pensiones = parseSpanishNumber(planPensiones) || 0;

    // Base imponible general
    const baseImponibleGeneral = salario + otros;

    // Reducción por aportaciones a planes de pensiones (máx 1.500€ o 30% rendimientos netos)
    const reduccionPensiones = Math.min(pensiones, 1500, baseImponibleGeneral * 0.3);

    // Base imponible tras reducciones
    const baseImponible = Math.max(0, baseImponibleGeneral - reduccionPensiones);

    // Mínimo personal y familiar
    const minimoPersonalFamiliar = calcularMinimoPersonalFamiliar();

    // Base liquidable (base imponible - mínimo, pero nunca negativa)
    const baseLiquidable = Math.max(0, baseImponible - minimoPersonalFamiliar);

    // Calcular cuota por tramos
    const { cuota: cuotaIntegra, desglose: desglosePorTramos } = calcularCuotaPorTramos(baseLiquidable);

    // Deducciones adicionales
    let deducciones = 0;
    if (viviendaHabitual) {
      // Deducción vivienda habitual (solo para préstamos anteriores a 2013)
      // Máximo 15% sobre 9.040€ = 1.356€
      deducciones += Math.min(1356, baseImponible * 0.15);
    }

    // Cuota líquida
    const cuotaLiquida = Math.max(0, cuotaIntegra - deducciones);

    // Tipo efectivo
    const tipoEfectivo = baseImponibleGeneral > 0
      ? (cuotaLiquida / baseImponibleGeneral) * 100
      : 0;

    return {
      baseImponible,
      baseImponibleGeneral,
      minimoPersonalFamiliar,
      baseLiquidable,
      cuotaIntegra,
      deduccionesAplicadas: deducciones,
      cuotaLiquida,
      tipoEfectivo,
      desglosePorTramos,
    };
  }, [calculado, salarioBruto, otrosIngresos, planPensiones, viviendaHabitual, situacion, numHijos, hijosMenores3, ascendientes65, ascendientes75]);

  // Calcular diferencia con retenciones
  const diferenciaRetenciones = useMemo(() => {
    if (!resultado) return null;
    const retenciones = parseSpanishNumber(retencionesYaPagadas) || 0;
    return resultado.cuotaLiquida - retenciones;
  }, [resultado, retencionesYaPagadas]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>📋 Simulador IRPF 2024</h1>
        <p className={styles.subtitle}>
          Calcula tu Impuesto sobre la Renta de las Personas Físicas
        </p>
      </header>

      <div className={styles.mainContent}>
        {/* Panel de Configuración */}
        <div className={styles.configPanel}>
          <h2 className={styles.sectionTitle}>💰 Ingresos Anuales</h2>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Salario bruto anual</label>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                className={styles.input}
                value={salarioBruto}
                onChange={(e) => setSalarioBruto(e.target.value)}
                placeholder="30000"
              />
              <span className={styles.unit}>€</span>
            </div>
            <span className={styles.helpText}>Antes de retenciones e impuestos</span>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Otros ingresos (opcional)</label>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                className={styles.input}
                value={otrosIngresos}
                onChange={(e) => setOtrosIngresos(e.target.value)}
                placeholder="0"
              />
              <span className={styles.unit}>€</span>
            </div>
            <span className={styles.helpText}>Alquileres, autónomos, etc.</span>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Retenciones ya practicadas</label>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                className={styles.input}
                value={retencionesYaPagadas}
                onChange={(e) => setRetencionesYaPagadas(e.target.value)}
                placeholder="0"
              />
              <span className={styles.unit}>€</span>
            </div>
            <span className={styles.helpText}>Suma de retenciones en nóminas</span>
          </div>

          <h2 className={styles.sectionTitle}>👤 Situación Personal</h2>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Tipo de declaración</label>
            <select
              className={styles.select}
              value={situacion}
              onChange={(e) => setSituacion(e.target.value as SituacionPersonal)}
            >
              <option value="soltero">Individual (soltero/a)</option>
              <option value="casado_individual">Casado/a - Declaración individual</option>
              <option value="casado_conjunto">Casado/a - Declaración conjunta</option>
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Tu edad</label>
            <div className={styles.inputWrapper}>
              <input
                type="number"
                className={styles.input}
                value={edad}
                onChange={(e) => setEdad(e.target.value)}
                min="18"
                max="100"
              />
              <span className={styles.unit}>años</span>
            </div>
          </div>

          <h2 className={styles.sectionTitle}>👨‍👩‍👧‍👦 Familia</h2>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Número de hijos</label>
            <select
              className={styles.select}
              value={numHijos}
              onChange={(e) => setNumHijos(e.target.value)}
            >
              {[0, 1, 2, 3, 4, 5, 6].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          {parseInt(numHijos) > 0 && (
            <div className={styles.inputGroup}>
              <label className={styles.label}>De ellos, menores de 3 años</label>
              <select
                className={styles.select}
                value={hijosMenores3}
                onChange={(e) => setHijosMenores3(e.target.value)}
              >
                {Array.from({ length: parseInt(numHijos) + 1 }, (_, i) => i).map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          )}

          <div className={styles.inputGroup}>
            <label className={styles.label}>Ascendientes mayores de 65 años</label>
            <select
              className={styles.select}
              value={ascendientes65}
              onChange={(e) => setAscendientes65(e.target.value)}
            >
              {[0, 1, 2, 3, 4].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Ascendientes mayores de 75 años</label>
            <select
              className={styles.select}
              value={ascendientes75}
              onChange={(e) => setAscendientes75(e.target.value)}
            >
              {[0, 1, 2, 3, 4].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          <h2 className={styles.sectionTitle}>📉 Deducciones</h2>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Plan de pensiones (aportación anual)</label>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                className={styles.input}
                value={planPensiones}
                onChange={(e) => setPlanPensiones(e.target.value)}
                placeholder="0"
              />
              <span className={styles.unit}>€</span>
            </div>
            <span className={styles.helpText}>Máximo deducible: 1.500 €/año</span>
          </div>

          <div className={styles.inputGroup}>
            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={viviendaHabitual}
                  onChange={(e) => setViviendaHabitual(e.target.checked)}
                />
                Deducción vivienda habitual (préstamo anterior a 2013)
              </label>
            </div>
          </div>

          <button
            className={styles.btnCalcular}
            onClick={() => setCalculado(true)}
          >
            Calcular IRPF
          </button>
        </div>

        {/* Panel de Resultados */}
        <div className={styles.resultsPanel}>
          <h2 className={styles.sectionTitle}>📊 Resultado del Cálculo</h2>

          {resultado ? (
            <>
              {/* Resultado Principal */}
              <div className={styles.resultadoPrincipal}>
                <span className={styles.resultadoLabel}>Cuota IRPF a pagar</span>
                <span className={styles.resultadoValor}>
                  {formatCurrency(resultado.cuotaLiquida)}
                </span>
                <span className={styles.resultadoTipoEfectivo}>
                  Tipo efectivo: {formatNumber(resultado.tipoEfectivo, 2)}%
                </span>
              </div>

              {/* Diferencia con retenciones */}
              {diferenciaRetenciones !== null && parseSpanishNumber(retencionesYaPagadas) > 0 && (
                <div className={`${styles.desgloseCard} ${diferenciaRetenciones > 0 ? styles.negativo : styles.positivo}`}>
                  <span className={styles.desgloseLabel}>
                    {diferenciaRetenciones > 0 ? 'A pagar en declaración' : 'A devolver'}
                  </span>
                  <span className={styles.desgloseValor}>
                    {formatCurrency(Math.abs(diferenciaRetenciones))}
                  </span>
                </div>
              )}

              {/* Desglose */}
              <div className={styles.desgloseGrid}>
                <div className={styles.desgloseCard}>
                  <span className={styles.desgloseLabel}>Base imponible</span>
                  <span className={styles.desgloseValor}>
                    {formatCurrency(resultado.baseImponibleGeneral)}
                  </span>
                </div>
                <div className={styles.desgloseCard}>
                  <span className={styles.desgloseLabel}>Mínimo personal/familiar</span>
                  <span className={styles.desgloseValor}>
                    {formatCurrency(resultado.minimoPersonalFamiliar)}
                  </span>
                </div>
                <div className={styles.desgloseCard}>
                  <span className={styles.desgloseLabel}>Base liquidable</span>
                  <span className={styles.desgloseValor}>
                    {formatCurrency(resultado.baseLiquidable)}
                  </span>
                </div>
                <div className={styles.desgloseCard}>
                  <span className={styles.desgloseLabel}>Cuota íntegra</span>
                  <span className={styles.desgloseValor}>
                    {formatCurrency(resultado.cuotaIntegra)}
                  </span>
                </div>
              </div>

              {/* Tabla de Tramos */}
              {resultado.desglosePorTramos.length > 0 && (
                <div className={styles.tramosSection}>
                  <h3 className={styles.sectionTitle}>📈 Desglose por Tramos</h3>
                  <table className={styles.tramosTable}>
                    <thead>
                      <tr>
                        <th>Tramo</th>
                        <th>Base</th>
                        <th>Tipo</th>
                        <th>Cuota</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resultado.desglosePorTramos.map((tramo, index) => (
                        <tr key={index}>
                          <td>{tramo.tramo}</td>
                          <td>{formatCurrency(tramo.base)}</td>
                          <td>{formatNumber(tramo.tipo, 0)}%</td>
                          <td>{formatCurrency(tramo.cuota)}</td>
                        </tr>
                      ))}
                      <tr>
                        <td>Total</td>
                        <td>{formatCurrency(resultado.baseLiquidable)}</td>
                        <td>-</td>
                        <td>{formatCurrency(resultado.cuotaIntegra)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* Resumen de Deducciones */}
              {resultado.deduccionesAplicadas > 0 && (
                <div className={styles.resumenBox}>
                  <h4>Deducciones Aplicadas</h4>
                  <div className={styles.resumenItem}>
                    <span>Deducción vivienda habitual</span>
                    <span>-{formatCurrency(resultado.deduccionesAplicadas)}</span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className={styles.placeholder}>
              <div className={styles.placeholderIcon}>📋</div>
              <p>Introduce tus datos y pulsa &quot;Calcular IRPF&quot;</p>
              <p>para ver el resultado</p>
            </div>
          )}
        </div>
      </div>

      {/* Disclaimer - SIEMPRE VISIBLE */}
      <div className={styles.disclaimer}>
        <h3>⚠️ Aviso Importante</h3>
        <p>
          Este simulador proporciona una <strong>estimación orientativa</strong> del IRPF basada en los
          tramos generales de 2024. Los resultados pueden variar según tu comunidad autónoma,
          situación personal específica y otras circunstancias. <strong>No constituye asesoramiento fiscal
          profesional</strong>. Para tu declaración oficial, consulta con un asesor fiscal o utiliza
          el programa PADRE de la Agencia Tributaria.
        </p>
      </div>

      {/* Contenido Educativo */}
      <EducationalSection
        title="📚 ¿Quieres entender mejor el IRPF?"
        subtitle="Aprende cómo funciona el impuesto sobre la renta, los tramos, deducciones y estrategias de optimización fiscal"
      >
        <section className={styles.guideSection}>
          <h2>¿Qué es el IRPF?</h2>
          <p className={styles.introParagraph}>
            El Impuesto sobre la Renta de las Personas Físicas (IRPF) es un tributo directo y progresivo
            que grava la renta obtenida por los contribuyentes residentes en España. &quot;Progresivo&quot; significa
            que quien más gana, paga proporcionalmente más.
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>📊 Sistema de Tramos</h4>
              <p>
                El IRPF funciona por tramos: los primeros euros de renta tributan a un tipo bajo (19%),
                y solo el exceso sobre ciertos umbrales tributa a tipos mayores. No pagas el tipo máximo
                sobre toda tu renta, solo sobre la parte que supera cada tramo.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>👨‍👩‍👧 Mínimo Personal y Familiar</h4>
              <p>
                Antes de aplicar los tramos, se resta el mínimo personal (5.550€) más cantidades por
                hijos y ascendientes a cargo. Esta cantidad queda exenta para cubrir necesidades básicas
                del contribuyente y su familia.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>🏠 Deducciones Autonómicas</h4>
              <p>
                Cada comunidad autónoma puede establecer deducciones adicionales: por alquiler de vivienda,
                gastos educativos, nacimiento de hijos, etc. Consulta las específicas de tu comunidad para
                optimizar tu declaración.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>💼 Planes de Pensiones</h4>
              <p>
                Las aportaciones a planes de pensiones reducen la base imponible (hasta 1.500€/año),
                lo que supone un ahorro fiscal inmediato. Sin embargo, cuando rescates el plan,
                tributarás por ese dinero como rendimiento del trabajo.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Tramos IRPF 2024</h2>
          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>Hasta 12.450 €</h4>
              <p>Tipo: 19% (9,5% estatal + 9,5% autonómico)</p>
            </div>
            <div className={styles.contentCard}>
              <h4>12.450 € - 20.200 €</h4>
              <p>Tipo: 24% (12% + 12%)</p>
            </div>
            <div className={styles.contentCard}>
              <h4>20.200 € - 35.200 €</h4>
              <p>Tipo: 30% (15% + 15%)</p>
            </div>
            <div className={styles.contentCard}>
              <h4>35.200 € - 60.000 €</h4>
              <p>Tipo: 37% (18,5% + 18,5%)</p>
            </div>
            <div className={styles.contentCard}>
              <h4>60.000 € - 300.000 €</h4>
              <p>Tipo: 45% (22,5% + 22,5%)</p>
            </div>
            <div className={styles.contentCard}>
              <h4>Más de 300.000 €</h4>
              <p>Tipo: 47% (24,5% + 22,5%)</p>
            </div>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-irpf')} />

      <Footer appName="simulador-irpf" />
    </div>
  );
}
