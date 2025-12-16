'use client';

import { useState, useMemo } from 'react';
import styles from './CalculadoraElectricidad.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { EducationalSection, RelatedApps} from '@/components';
import { formatNumber, parseSpanishNumber, formatCurrency } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

type TipoCalculo = 'ohm' | 'potencia' | 'circuito' | 'consumo';
type VariableOhm = 'V' | 'I' | 'R';
type VariablePotencia = 'P' | 'V' | 'I';
type TipoCircuito = 'serie' | 'paralelo';

export default function CalculadoraElectricidadPage() {
  const [tipoCalculo, setTipoCalculo] = useState<TipoCalculo>('ohm');

  // Estados para Ley de Ohm
  const [variableOhm, setVariableOhm] = useState<VariableOhm>('V');
  const [voltaje, setVoltaje] = useState('12');
  const [corriente, setCorriente] = useState('2');
  const [resistencia, setResistencia] = useState('6');

  // Estados para Potencia
  const [variablePotencia, setVariablePotencia] = useState<VariablePotencia>('P');
  const [potencia, setPotencia] = useState('100');
  const [voltajePot, setVoltajePot] = useState('220');
  const [corrientePot, setCorrientePot] = useState('0.45');

  // Estados para Circuitos
  const [tipoCircuito, setTipoCircuito] = useState<TipoCircuito>('serie');
  const [resistencias, setResistencias] = useState('10, 20, 30');

  // Estados para Consumo
  const [potenciaConsumo, setPotenciaConsumo] = useState('1000');
  const [horasUso, setHorasUso] = useState('5');
  const [diasMes, setDiasMes] = useState('30');
  const [precioKwh, setPrecioKwh] = useState('0,15');

  // Cálculos de Ley de Ohm
  const resultadoOhm = useMemo(() => {
    const V = parseSpanishNumber(voltaje);
    const I = parseSpanishNumber(corriente);
    const R = parseSpanishNumber(resistencia);

    switch (variableOhm) {
      case 'V':
        if (!isNaN(I) && !isNaN(R)) return { variable: 'Voltaje (V)', valor: I * R, unidad: 'V' };
        break;
      case 'I':
        if (!isNaN(V) && !isNaN(R) && R !== 0) return { variable: 'Corriente (I)', valor: V / R, unidad: 'A' };
        break;
      case 'R':
        if (!isNaN(V) && !isNaN(I) && I !== 0) return { variable: 'Resistencia (R)', valor: V / I, unidad: 'Ω' };
        break;
    }
    return null;
  }, [variableOhm, voltaje, corriente, resistencia]);

  // Cálculos de Potencia
  const resultadoPotencia = useMemo(() => {
    const P = parseSpanishNumber(potencia);
    const V = parseSpanishNumber(voltajePot);
    const I = parseSpanishNumber(corrientePot);

    switch (variablePotencia) {
      case 'P':
        if (!isNaN(V) && !isNaN(I)) return { variable: 'Potencia (P)', valor: V * I, unidad: 'W' };
        break;
      case 'V':
        if (!isNaN(P) && !isNaN(I) && I !== 0) return { variable: 'Voltaje (V)', valor: P / I, unidad: 'V' };
        break;
      case 'I':
        if (!isNaN(P) && !isNaN(V) && V !== 0) return { variable: 'Corriente (I)', valor: P / V, unidad: 'A' };
        break;
    }
    return null;
  }, [variablePotencia, potencia, voltajePot, corrientePot]);

  // Cálculos de Circuitos
  const resultadoCircuito = useMemo(() => {
    const valoresStr = resistencias.split(',').map(s => s.trim());
    const valores = valoresStr.map(parseSpanishNumber).filter(n => !isNaN(n) && n > 0);

    if (valores.length === 0) return null;

    if (tipoCircuito === 'serie') {
      // Serie: Req = R1 + R2 + R3...
      const total = valores.reduce((a, b) => a + b, 0);
      return {
        tipo: 'Serie',
        resistenciaEquivalente: total,
        valores
      };
    } else {
      // Paralelo: 1/Req = 1/R1 + 1/R2 + 1/R3...
      const sumaInversos = valores.reduce((a, b) => a + 1 / b, 0);
      const total = sumaInversos !== 0 ? 1 / sumaInversos : 0;
      return {
        tipo: 'Paralelo',
        resistenciaEquivalente: total,
        valores
      };
    }
  }, [tipoCircuito, resistencias]);

  // Cálculos de Consumo
  const resultadoConsumo = useMemo(() => {
    const P = parseSpanishNumber(potenciaConsumo);
    const h = parseSpanishNumber(horasUso);
    const d = parseSpanishNumber(diasMes);
    const precio = parseSpanishNumber(precioKwh);

    if (isNaN(P) || isNaN(h) || isNaN(d) || isNaN(precio)) return null;

    const kWhDiario = (P / 1000) * h;
    const kWhMensual = kWhDiario * d;
    const costeMensual = kWhMensual * precio;
    const costeAnual = costeMensual * 12;

    return {
      consumoDiario: kWhDiario,
      consumoMensual: kWhMensual,
      costeMensual,
      costeAnual
    };
  }, [potenciaConsumo, horasUso, diasMes, precioKwh]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>⚡ Calculadora de Electricidad</h1>
        <p className={styles.subtitle}>
          Ley de Ohm, Potencia, Circuitos Serie/Paralelo y Consumo Energético
        </p>
      </header>

      <div className={styles.mainContent}>
        {/* Panel de configuración */}
        <div className={styles.configPanel}>
          <h2 className={styles.sectionTitle}>Tipo de Cálculo</h2>

          <div className={styles.tiposGrid}>
            <button
              className={`${styles.tipoBtn} ${tipoCalculo === 'ohm' ? styles.tipoActivo : ''}`}
              onClick={() => setTipoCalculo('ohm')}
            >
              <span className={styles.tipoIcono}>V=IR</span>
              <span className={styles.tipoNombre}>Ley de Ohm</span>
            </button>
            <button
              className={`${styles.tipoBtn} ${tipoCalculo === 'potencia' ? styles.tipoActivo : ''}`}
              onClick={() => setTipoCalculo('potencia')}
            >
              <span className={styles.tipoIcono}>P=VI</span>
              <span className={styles.tipoNombre}>Potencia</span>
            </button>
            <button
              className={`${styles.tipoBtn} ${tipoCalculo === 'circuito' ? styles.tipoActivo : ''}`}
              onClick={() => setTipoCalculo('circuito')}
            >
              <span className={styles.tipoIcono}>⫘</span>
              <span className={styles.tipoNombre}>Circuitos</span>
            </button>
            <button
              className={`${styles.tipoBtn} ${tipoCalculo === 'consumo' ? styles.tipoActivo : ''}`}
              onClick={() => setTipoCalculo('consumo')}
            >
              <span className={styles.tipoIcono}>💡</span>
              <span className={styles.tipoNombre}>Consumo</span>
            </button>
          </div>

          {/* Inputs según tipo */}
          <div className={styles.inputsSection}>
            {tipoCalculo === 'ohm' && (
              <>
                <h3 className={styles.sectionTitle}>Calcular</h3>
                <div className={styles.selectorGrid}>
                  {(['V', 'I', 'R'] as VariableOhm[]).map((v) => (
                    <button
                      key={v}
                      className={`${styles.selectorBtn} ${variableOhm === v ? styles.selectorActivo : ''}`}
                      onClick={() => setVariableOhm(v)}
                    >
                      {v === 'V' ? 'Voltaje' : v === 'I' ? 'Corriente' : 'Resistencia'}
                    </button>
                  ))}
                </div>

                {variableOhm !== 'V' && (
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Voltaje (V)</label>
                    <div className={styles.inputWrapper}>
                      <input
                        type="text"
                        value={voltaje}
                        onChange={(e) => setVoltaje(e.target.value)}
                        className={styles.input}
                      />
                      <span className={styles.unit}>V</span>
                    </div>
                  </div>
                )}

                {variableOhm !== 'I' && (
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Corriente (I)</label>
                    <div className={styles.inputWrapper}>
                      <input
                        type="text"
                        value={corriente}
                        onChange={(e) => setCorriente(e.target.value)}
                        className={styles.input}
                      />
                      <span className={styles.unit}>A</span>
                    </div>
                  </div>
                )}

                {variableOhm !== 'R' && (
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Resistencia (R)</label>
                    <div className={styles.inputWrapper}>
                      <input
                        type="text"
                        value={resistencia}
                        onChange={(e) => setResistencia(e.target.value)}
                        className={styles.input}
                      />
                      <span className={styles.unit}>Ω</span>
                    </div>
                  </div>
                )}
              </>
            )}

            {tipoCalculo === 'potencia' && (
              <>
                <h3 className={styles.sectionTitle}>Calcular</h3>
                <div className={styles.selectorGrid}>
                  {(['P', 'V', 'I'] as VariablePotencia[]).map((v) => (
                    <button
                      key={v}
                      className={`${styles.selectorBtn} ${variablePotencia === v ? styles.selectorActivo : ''}`}
                      onClick={() => setVariablePotencia(v)}
                    >
                      {v === 'P' ? 'Potencia' : v === 'V' ? 'Voltaje' : 'Corriente'}
                    </button>
                  ))}
                </div>

                {variablePotencia !== 'P' && (
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Potencia (P)</label>
                    <div className={styles.inputWrapper}>
                      <input
                        type="text"
                        value={potencia}
                        onChange={(e) => setPotencia(e.target.value)}
                        className={styles.input}
                      />
                      <span className={styles.unit}>W</span>
                    </div>
                  </div>
                )}

                {variablePotencia !== 'V' && (
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Voltaje (V)</label>
                    <div className={styles.inputWrapper}>
                      <input
                        type="text"
                        value={voltajePot}
                        onChange={(e) => setVoltajePot(e.target.value)}
                        className={styles.input}
                      />
                      <span className={styles.unit}>V</span>
                    </div>
                  </div>
                )}

                {variablePotencia !== 'I' && (
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Corriente (I)</label>
                    <div className={styles.inputWrapper}>
                      <input
                        type="text"
                        value={corrientePot}
                        onChange={(e) => setCorrientePot(e.target.value)}
                        className={styles.input}
                      />
                      <span className={styles.unit}>A</span>
                    </div>
                  </div>
                )}
              </>
            )}

            {tipoCalculo === 'circuito' && (
              <>
                <h3 className={styles.sectionTitle}>Tipo de Conexión</h3>
                <div className={styles.selectorGrid}>
                  <button
                    className={`${styles.selectorBtn} ${tipoCircuito === 'serie' ? styles.selectorActivo : ''}`}
                    onClick={() => setTipoCircuito('serie')}
                  >
                    Serie ─⫘─⫘─
                  </button>
                  <button
                    className={`${styles.selectorBtn} ${tipoCircuito === 'paralelo' ? styles.selectorActivo : ''}`}
                    onClick={() => setTipoCircuito('paralelo')}
                  >
                    Paralelo ═⫘═
                  </button>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Resistencias (separadas por coma)</label>
                  <input
                    type="text"
                    value={resistencias}
                    onChange={(e) => setResistencias(e.target.value)}
                    className={styles.input}
                    placeholder="10, 20, 30"
                  />
                  <span className={styles.helpText}>Ejemplo: 10, 20, 30 (en ohmios)</span>
                </div>
              </>
            )}

            {tipoCalculo === 'consumo' && (
              <>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Potencia del aparato</label>
                  <div className={styles.inputWrapper}>
                    <input
                      type="text"
                      value={potenciaConsumo}
                      onChange={(e) => setPotenciaConsumo(e.target.value)}
                      className={styles.input}
                    />
                    <span className={styles.unit}>W</span>
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Horas de uso diario</label>
                  <div className={styles.inputWrapper}>
                    <input
                      type="text"
                      value={horasUso}
                      onChange={(e) => setHorasUso(e.target.value)}
                      className={styles.input}
                    />
                    <span className={styles.unit}>h</span>
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Días al mes</label>
                  <div className={styles.inputWrapper}>
                    <input
                      type="text"
                      value={diasMes}
                      onChange={(e) => setDiasMes(e.target.value)}
                      className={styles.input}
                    />
                    <span className={styles.unit}>días</span>
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Precio kWh</label>
                  <div className={styles.inputWrapper}>
                    <input
                      type="text"
                      value={precioKwh}
                      onChange={(e) => setPrecioKwh(e.target.value)}
                      className={styles.input}
                    />
                    <span className={styles.unit}>€/kWh</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Panel de resultados */}
        <div className={styles.resultsPanel}>
          <h2 className={styles.sectionTitle}>Resultados</h2>

          {tipoCalculo === 'ohm' && resultadoOhm && (
            <div className={styles.resultadoDestacado}>
              <span className={styles.resultadoLabel}>{resultadoOhm.variable}</span>
              <span className={styles.resultadoValor}>
                {formatNumber(resultadoOhm.valor, 4)} {resultadoOhm.unidad}
              </span>
              <div className={styles.formulaBox}>
                <p>Fórmula: V = I × R</p>
                {variableOhm === 'V' && <p>V = {formatNumber(parseSpanishNumber(corriente), 2)} A × {formatNumber(parseSpanishNumber(resistencia), 2)} Ω</p>}
                {variableOhm === 'I' && <p>I = {formatNumber(parseSpanishNumber(voltaje), 2)} V / {formatNumber(parseSpanishNumber(resistencia), 2)} Ω</p>}
                {variableOhm === 'R' && <p>R = {formatNumber(parseSpanishNumber(voltaje), 2)} V / {formatNumber(parseSpanishNumber(corriente), 2)} A</p>}
              </div>
            </div>
          )}

          {tipoCalculo === 'potencia' && resultadoPotencia && (
            <div className={styles.resultadoDestacado}>
              <span className={styles.resultadoLabel}>{resultadoPotencia.variable}</span>
              <span className={styles.resultadoValor}>
                {formatNumber(resultadoPotencia.valor, 4)} {resultadoPotencia.unidad}
              </span>
              <div className={styles.formulaBox}>
                <p>Fórmula: P = V × I</p>
              </div>
            </div>
          )}

          {tipoCalculo === 'circuito' && resultadoCircuito && (
            <>
              <div className={styles.resultadoDestacado}>
                <span className={styles.resultadoLabel}>Resistencia Equivalente ({resultadoCircuito.tipo})</span>
                <span className={styles.resultadoValor}>
                  {formatNumber(resultadoCircuito.resistenciaEquivalente, 4)} Ω
                </span>
              </div>

              <div className={styles.circuitoInfo}>
                <h3>Resistencias: {resultadoCircuito.valores.length}</h3>
                <div className={styles.resistenciasLista}>
                  {resultadoCircuito.valores.map((r, i) => (
                    <span key={i} className={styles.resistenciaChip}>
                      R{i + 1} = {formatNumber(r, 2)} Ω
                    </span>
                  ))}
                </div>
                <div className={styles.formulaBox}>
                  {tipoCircuito === 'serie' ? (
                    <p>Serie: Req = R₁ + R₂ + R₃ + ...</p>
                  ) : (
                    <p>Paralelo: 1/Req = 1/R₁ + 1/R₂ + 1/R₃ + ...</p>
                  )}
                </div>
              </div>
            </>
          )}

          {tipoCalculo === 'consumo' && resultadoConsumo && (
            <div className={styles.consumoGrid}>
              <div className={styles.consumoCard}>
                <span className={styles.consumoLabel}>Consumo Diario</span>
                <span className={styles.consumoValor}>{formatNumber(resultadoConsumo.consumoDiario, 3)}</span>
                <span className={styles.consumoUnidad}>kWh/día</span>
              </div>
              <div className={styles.consumoCard}>
                <span className={styles.consumoLabel}>Consumo Mensual</span>
                <span className={styles.consumoValor}>{formatNumber(resultadoConsumo.consumoMensual, 2)}</span>
                <span className={styles.consumoUnidad}>kWh/mes</span>
              </div>
              <div className={styles.consumoCard + ' ' + styles.consumoDestacado}>
                <span className={styles.consumoLabel}>Coste Mensual</span>
                <span className={styles.consumoValor}>{formatCurrency(resultadoConsumo.costeMensual)}</span>
                <span className={styles.consumoUnidad}>/mes</span>
              </div>
              <div className={styles.consumoCard}>
                <span className={styles.consumoLabel}>Coste Anual</span>
                <span className={styles.consumoValor}>{formatCurrency(resultadoConsumo.costeAnual)}</span>
                <span className={styles.consumoUnidad}>/año</span>
              </div>
            </div>
          )}

          {!resultadoOhm && !resultadoPotencia && !resultadoCircuito && !resultadoConsumo && (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon}>⚡</span>
              <p>Ingresa los valores para calcular</p>
            </div>
          )}
        </div>
      </div>

      {/* Sección educativa */}
      <EducationalSection
        title="📚 ¿Quieres aprender más sobre Electricidad?"
        subtitle="Descubre conceptos fundamentales, fórmulas y aplicaciones prácticas"
      >
        <section className={styles.guideSection}>
          <h2>Conceptos Básicos de Electricidad</h2>
          <p className={styles.introParagraph}>
            La electricidad es el flujo de electrones a través de un conductor. Los tres conceptos
            fundamentales son el voltaje (presión eléctrica), la corriente (flujo de electrones)
            y la resistencia (oposición al flujo).
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>Ley de Ohm</h4>
              <p>
                V = I × R relaciona voltaje, corriente y resistencia.
                Es la base de todos los cálculos eléctricos.
                1 Voltio = 1 Amperio × 1 Ohmio.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>Potencia Eléctrica</h4>
              <p>
                P = V × I mide la energía consumida por unidad de tiempo.
                Se mide en Vatios (W). 1 kW = 1000 W.
                También: P = I²R = V²/R.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>Circuitos Serie</h4>
              <p>
                Resistencias conectadas una tras otra.
                La corriente es igual en todos los puntos.
                Req = R₁ + R₂ + R₃...
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>Circuitos Paralelo</h4>
              <p>
                Resistencias conectadas entre los mismos puntos.
                El voltaje es igual en todas las ramas.
                1/Req = 1/R₁ + 1/R₂ + 1/R₃...
              </p>
            </div>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-electricidad')} />

      <Footer appName="calculadora-electricidad" />
    </div>
  );
}
