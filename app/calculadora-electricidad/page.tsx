'use client';

import { useState, useMemo } from 'react';
import styles from './CalculadoraElectricidad.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { EducationalSection, RelatedApps, LegalNotice, DisclaimerCard, ShareCard } from '@/components';
import { formatNumber, parseSpanishNumber, formatCurrency } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

type TipoCalculo = 'ohm' | 'potencia' | 'circuito' | 'consumo' | 'divisor' | 'mixto' | 'rcrl';
type VariableOhm = 'V' | 'I' | 'R';
type VariablePotencia = 'P' | 'V' | 'I';
type TipoCircuito = 'serie' | 'paralelo';
type TipoDivisor = 'tension' | 'corriente';
type TipoRCRL = 'rc' | 'rl';

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

  // Estados para Divisor de tensión/corriente
  const [tipoDivisor, setTipoDivisor] = useState<TipoDivisor>('tension');
  const [voltajeFuente, setVoltajeFuente] = useState('12');
  const [r1Divisor, setR1Divisor] = useState('1000');
  const [r2Divisor, setR2Divisor] = useState('2000');
  const [corrienteFuente, setCorrienteFuente] = useState('10');

  // Estados para Circuitos Mixtos
  const [configuracionMixta, setConfiguracionMixta] = useState('serie(10, paralelo(20, 30))');

  // Estados para Circuitos RC/RL
  const [tipoRCRL, setTipoRCRL] = useState<TipoRCRL>('rc');
  const [resistenciaRCRL, setResistenciaRCRL] = useState('1000');
  const [capacitancia, setCapacitancia] = useState('100'); // en µF
  const [inductancia, setInductancia] = useState('10'); // en mH
  const [voltajeRCRL, setVoltajeRCRL] = useState('5');
  const [tiempoRCRL, setTiempoRCRL] = useState('0,1'); // en segundos

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
      const total = valores.reduce((a, b) => a + b, 0);
      return {
        tipo: 'Serie',
        resistenciaEquivalente: total,
        valores
      };
    } else {
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

  // Cálculos de Divisor de tensión/corriente
  const resultadoDivisor = useMemo(() => {
    const R1 = parseSpanishNumber(r1Divisor);
    const R2 = parseSpanishNumber(r2Divisor);

    if (isNaN(R1) || isNaN(R2) || R1 <= 0 || R2 <= 0) return null;

    if (tipoDivisor === 'tension') {
      const Vin = parseSpanishNumber(voltajeFuente);
      if (isNaN(Vin)) return null;

      // Divisor de tensión: Vout = Vin × R2 / (R1 + R2)
      const Vout = Vin * R2 / (R1 + R2);
      const corrienteTotal = Vin / (R1 + R2);
      const potenciaR1 = corrienteTotal * corrienteTotal * R1;
      const potenciaR2 = corrienteTotal * corrienteTotal * R2;

      return {
        tipo: 'tension',
        voltajeSalida: Vout,
        voltajeEntrada: Vin,
        corriente: corrienteTotal,
        potenciaR1,
        potenciaR2,
        potenciaTotal: potenciaR1 + potenciaR2,
        ratio: R2 / (R1 + R2)
      };
    } else {
      const Iin = parseSpanishNumber(corrienteFuente);
      if (isNaN(Iin)) return null;

      // Divisor de corriente: I2 = Iin × R1 / (R1 + R2)
      const I1 = Iin * R2 / (R1 + R2);
      const I2 = Iin * R1 / (R1 + R2);
      const Req = (R1 * R2) / (R1 + R2);
      const voltajeComun = Iin * Req;

      return {
        tipo: 'corriente',
        corrienteR1: I1,
        corrienteR2: I2,
        corrienteTotal: Iin,
        voltaje: voltajeComun,
        resistenciaEquivalente: Req
      };
    }
  }, [tipoDivisor, voltajeFuente, corrienteFuente, r1Divisor, r2Divisor]);

  // Función recursiva para parsear circuitos mixtos
  const parseCircuitoMixto = (expr: string): number | null => {
    expr = expr.trim();

    // Caso base: número simple
    const numMatch = expr.match(/^[\d,\.]+$/);
    if (numMatch) {
      return parseSpanishNumber(expr);
    }

    // Caso serie(...)
    const serieMatch = expr.match(/^serie\s*\((.*)\)$/i);
    if (serieMatch) {
      const elementos = parseElementos(serieMatch[1]);
      if (!elementos) return null;
      return elementos.reduce((a, b) => a + b, 0);
    }

    // Caso paralelo(...)
    const paraleloMatch = expr.match(/^paralelo\s*\((.*)\)$/i);
    if (paraleloMatch) {
      const elementos = parseElementos(paraleloMatch[1]);
      if (!elementos) return null;
      const sumaInversos = elementos.reduce((a, b) => a + 1/b, 0);
      return sumaInversos !== 0 ? 1 / sumaInversos : null;
    }

    return null;
  };

  const parseElementos = (contenido: string): number[] | null => {
    const elementos: number[] = [];
    let nivel = 0;
    let actual = '';

    for (let i = 0; i < contenido.length; i++) {
      const char = contenido[i];
      if (char === '(') nivel++;
      else if (char === ')') nivel--;
      else if (char === ',' && nivel === 0) {
        const valor = parseCircuitoMixto(actual.trim());
        if (valor === null || valor <= 0) return null;
        elementos.push(valor);
        actual = '';
        continue;
      }
      actual += char;
    }

    if (actual.trim()) {
      const valor = parseCircuitoMixto(actual.trim());
      if (valor === null || valor <= 0) return null;
      elementos.push(valor);
    }

    return elementos.length > 0 ? elementos : null;
  };

  // Cálculos de Circuitos Mixtos
  const resultadoMixto = useMemo(() => {
    const req = parseCircuitoMixto(configuracionMixta);
    if (req === null || req <= 0) return null;

    return {
      resistenciaEquivalente: req,
      configuracion: configuracionMixta
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configuracionMixta]);

  // Cálculos de Circuitos RC/RL
  const resultadoRCRL = useMemo(() => {
    const R = parseSpanishNumber(resistenciaRCRL);
    const V0 = parseSpanishNumber(voltajeRCRL);
    const t = parseSpanishNumber(tiempoRCRL);

    if (isNaN(R) || isNaN(V0) || isNaN(t) || R <= 0) return null;

    if (tipoRCRL === 'rc') {
      const C = parseSpanishNumber(capacitancia) * 1e-6; // µF a F
      if (isNaN(C) || C <= 0) return null;

      const tau = R * C; // Constante de tiempo
      const Vc_carga = V0 * (1 - Math.exp(-t / tau)); // Carga del capacitor
      const Vc_descarga = V0 * Math.exp(-t / tau); // Descarga del capacitor
      const I_carga = (V0 / R) * Math.exp(-t / tau);
      const I_descarga = -(V0 / R) * Math.exp(-t / tau);
      const energia = 0.5 * C * V0 * V0;
      const t_63 = tau; // Tiempo al 63.2%
      const t_95 = 3 * tau; // Tiempo al 95%
      const t_99 = 5 * tau; // Tiempo al 99%

      return {
        tipo: 'RC',
        constanteTiempo: tau,
        voltajeCarga: Vc_carga,
        voltajeDescarga: Vc_descarga,
        corrienteCarga: I_carga,
        corrienteDescarga: I_descarga,
        energiaAlmacenada: energia,
        tiempo63: t_63,
        tiempo95: t_95,
        tiempo99: t_99,
        frecuenciaCorte: 1 / (2 * Math.PI * tau)
      };
    } else {
      const L = parseSpanishNumber(inductancia) * 1e-3; // mH a H
      if (isNaN(L) || L <= 0) return null;

      const tau = L / R; // Constante de tiempo
      const IL_carga = (V0 / R) * (1 - Math.exp(-t / tau)); // Corriente creciente
      const IL_descarga = (V0 / R) * Math.exp(-t / tau); // Corriente decreciente
      const VL_carga = V0 * Math.exp(-t / tau);
      const VL_descarga = -V0 * Math.exp(-t / tau);
      const energia = 0.5 * L * Math.pow(V0 / R, 2);
      const t_63 = tau;
      const t_95 = 3 * tau;
      const t_99 = 5 * tau;

      return {
        tipo: 'RL',
        constanteTiempo: tau,
        corrienteCarga: IL_carga,
        corrienteDescarga: IL_descarga,
        voltajeCarga: VL_carga,
        voltajeDescarga: VL_descarga,
        energiaAlmacenada: energia,
        tiempo63: t_63,
        tiempo95: t_95,
        tiempo99: t_99,
        frecuenciaCorte: R / (2 * Math.PI * L)
      };
    }
  }, [tipoRCRL, resistenciaRCRL, capacitancia, inductancia, voltajeRCRL, tiempoRCRL]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>⚡ Calculadora de Electricidad Avanzada</h1>
        <p className={styles.subtitle}>
          Ley de Ohm, Potencia, Divisores, Circuitos Mixtos, RC/RL y Consumo
        </p>
      </header>

      <LegalNotice />

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
              <span className={styles.tipoNombre}>Serie/Paralelo</span>
            </button>
            <button
              className={`${styles.tipoBtn} ${tipoCalculo === 'divisor' ? styles.tipoActivo : ''}`}
              onClick={() => setTipoCalculo('divisor')}
            >
              <span className={styles.tipoIcono}>⫗</span>
              <span className={styles.tipoNombre}>Divisores</span>
            </button>
            <button
              className={`${styles.tipoBtn} ${tipoCalculo === 'mixto' ? styles.tipoActivo : ''}`}
              onClick={() => setTipoCalculo('mixto')}
            >
              <span className={styles.tipoIcono}>⫘⫗</span>
              <span className={styles.tipoNombre}>Mixtos</span>
            </button>
            <button
              className={`${styles.tipoBtn} ${tipoCalculo === 'rcrl' ? styles.tipoActivo : ''}`}
              onClick={() => setTipoCalculo('rcrl')}
            >
              <span className={styles.tipoIcono}>τ</span>
              <span className={styles.tipoNombre}>RC/RL</span>
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

            {tipoCalculo === 'divisor' && (
              <>
                <h3 className={styles.sectionTitle}>Tipo de Divisor</h3>
                <div className={styles.selectorGrid}>
                  <button
                    className={`${styles.selectorBtn} ${tipoDivisor === 'tension' ? styles.selectorActivo : ''}`}
                    onClick={() => setTipoDivisor('tension')}
                  >
                    Tensión
                  </button>
                  <button
                    className={`${styles.selectorBtn} ${tipoDivisor === 'corriente' ? styles.selectorActivo : ''}`}
                    onClick={() => setTipoDivisor('corriente')}
                  >
                    Corriente
                  </button>
                </div>

                {tipoDivisor === 'tension' && (
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Voltaje de entrada (Vin)</label>
                    <div className={styles.inputWrapper}>
                      <input
                        type="text"
                        value={voltajeFuente}
                        onChange={(e) => setVoltajeFuente(e.target.value)}
                        className={styles.input}
                      />
                      <span className={styles.unit}>V</span>
                    </div>
                  </div>
                )}

                {tipoDivisor === 'corriente' && (
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Corriente total (Iin)</label>
                    <div className={styles.inputWrapper}>
                      <input
                        type="text"
                        value={corrienteFuente}
                        onChange={(e) => setCorrienteFuente(e.target.value)}
                        className={styles.input}
                      />
                      <span className={styles.unit}>mA</span>
                    </div>
                  </div>
                )}

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Resistencia R1</label>
                  <div className={styles.inputWrapper}>
                    <input
                      type="text"
                      value={r1Divisor}
                      onChange={(e) => setR1Divisor(e.target.value)}
                      className={styles.input}
                    />
                    <span className={styles.unit}>Ω</span>
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Resistencia R2</label>
                  <div className={styles.inputWrapper}>
                    <input
                      type="text"
                      value={r2Divisor}
                      onChange={(e) => setR2Divisor(e.target.value)}
                      className={styles.input}
                    />
                    <span className={styles.unit}>Ω</span>
                  </div>
                </div>

                <div className={styles.infoBox}>
                  <p><strong>Divisor de tensión:</strong> R1 conectada a Vin, R2 conectada a tierra. Vout se mide entre R1 y R2.</p>
                  <p><strong>Divisor de corriente:</strong> R1 y R2 en paralelo. La corriente se divide inversamente proporcional a las resistencias.</p>
                </div>
              </>
            )}

            {tipoCalculo === 'mixto' && (
              <>
                <h3 className={styles.sectionTitle}>Configuración del Circuito</h3>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Expresión del circuito</label>
                  <textarea
                    value={configuracionMixta}
                    onChange={(e) => setConfiguracionMixta(e.target.value)}
                    className={styles.textarea}
                    rows={3}
                    placeholder="serie(10, paralelo(20, 30))"
                  />
                </div>
                <div className={styles.infoBox}>
                  <p><strong>Sintaxis:</strong></p>
                  <p>• <code>serie(R1, R2, R3)</code> - Resistencias en serie</p>
                  <p>• <code>paralelo(R1, R2)</code> - Resistencias en paralelo</p>
                  <p>• Puedes anidar: <code>serie(10, paralelo(20, 30), 40)</code></p>
                  <p>• Los valores son en ohmios (Ω)</p>
                </div>
                <div className={styles.ejemplosBox}>
                  <p><strong>Ejemplos:</strong></p>
                  <button
                    className={styles.ejemploBtn}
                    onClick={() => setConfiguracionMixta('serie(100, paralelo(200, 300))')}
                  >
                    R1 en serie con (R2 || R3)
                  </button>
                  <button
                    className={styles.ejemploBtn}
                    onClick={() => setConfiguracionMixta('paralelo(100, serie(200, 300))')}
                  >
                    R1 en paralelo con (R2 + R3)
                  </button>
                  <button
                    className={styles.ejemploBtn}
                    onClick={() => setConfiguracionMixta('serie(100, paralelo(200, serie(300, 400)), 500)')}
                  >
                    Circuito complejo
                  </button>
                </div>
              </>
            )}

            {tipoCalculo === 'rcrl' && (
              <>
                <h3 className={styles.sectionTitle}>Tipo de Circuito</h3>
                <div className={styles.selectorGrid}>
                  <button
                    className={`${styles.selectorBtn} ${tipoRCRL === 'rc' ? styles.selectorActivo : ''}`}
                    onClick={() => setTipoRCRL('rc')}
                  >
                    RC (Capacitor)
                  </button>
                  <button
                    className={`${styles.selectorBtn} ${tipoRCRL === 'rl' ? styles.selectorActivo : ''}`}
                    onClick={() => setTipoRCRL('rl')}
                  >
                    RL (Inductor)
                  </button>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Resistencia (R)</label>
                  <div className={styles.inputWrapper}>
                    <input
                      type="text"
                      value={resistenciaRCRL}
                      onChange={(e) => setResistenciaRCRL(e.target.value)}
                      className={styles.input}
                    />
                    <span className={styles.unit}>Ω</span>
                  </div>
                </div>

                {tipoRCRL === 'rc' && (
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Capacitancia (C)</label>
                    <div className={styles.inputWrapper}>
                      <input
                        type="text"
                        value={capacitancia}
                        onChange={(e) => setCapacitancia(e.target.value)}
                        className={styles.input}
                      />
                      <span className={styles.unit}>µF</span>
                    </div>
                  </div>
                )}

                {tipoRCRL === 'rl' && (
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Inductancia (L)</label>
                    <div className={styles.inputWrapper}>
                      <input
                        type="text"
                        value={inductancia}
                        onChange={(e) => setInductancia(e.target.value)}
                        className={styles.input}
                      />
                      <span className={styles.unit}>mH</span>
                    </div>
                  </div>
                )}

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Voltaje de fuente (V₀)</label>
                  <div className={styles.inputWrapper}>
                    <input
                      type="text"
                      value={voltajeRCRL}
                      onChange={(e) => setVoltajeRCRL(e.target.value)}
                      className={styles.input}
                    />
                    <span className={styles.unit}>V</span>
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Tiempo de análisis (t)</label>
                  <div className={styles.inputWrapper}>
                    <input
                      type="text"
                      value={tiempoRCRL}
                      onChange={(e) => setTiempoRCRL(e.target.value)}
                      className={styles.input}
                    />
                    <span className={styles.unit}>s</span>
                  </div>
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

          {tipoCalculo === 'divisor' && resultadoDivisor && (
            <>
              {resultadoDivisor.tipo === 'tension' && (
                <>
                  <div className={styles.resultadoDestacado}>
                    <span className={styles.resultadoLabel}>Voltaje de Salida (Vout)</span>
                    <span className={styles.resultadoValor}>
                      {formatNumber(resultadoDivisor.voltajeSalida ?? 0, 4)} V
                    </span>
                  </div>
                  <div className={styles.divisorGrid}>
                    <div className={styles.divisorCard}>
                      <span className={styles.divisorLabel}>Ratio (R2/(R1+R2))</span>
                      <span className={styles.divisorValor}>{formatNumber(resultadoDivisor.ratio ?? 0, 4)}</span>
                    </div>
                    <div className={styles.divisorCard}>
                      <span className={styles.divisorLabel}>Corriente</span>
                      <span className={styles.divisorValor}>{formatNumber((resultadoDivisor.corriente ?? 0) * 1000, 4)} mA</span>
                    </div>
                    <div className={styles.divisorCard}>
                      <span className={styles.divisorLabel}>Potencia R1</span>
                      <span className={styles.divisorValor}>{formatNumber((resultadoDivisor.potenciaR1 ?? 0) * 1000, 2)} mW</span>
                    </div>
                    <div className={styles.divisorCard}>
                      <span className={styles.divisorLabel}>Potencia R2</span>
                      <span className={styles.divisorValor}>{formatNumber((resultadoDivisor.potenciaR2 ?? 0) * 1000, 2)} mW</span>
                    </div>
                  </div>
                  <div className={styles.formulaBox}>
                    <p>Fórmula: Vout = Vin × R₂ / (R₁ + R₂)</p>
                  </div>
                </>
              )}
              {resultadoDivisor.tipo === 'corriente' && (
                <>
                  <div className={styles.divisorGrid}>
                    <div className={styles.divisorCardDestacado}>
                      <span className={styles.divisorLabel}>Corriente por R1</span>
                      <span className={styles.divisorValor}>{formatNumber(resultadoDivisor.corrienteR1 ?? 0, 4)} mA</span>
                    </div>
                    <div className={styles.divisorCardDestacado}>
                      <span className={styles.divisorLabel}>Corriente por R2</span>
                      <span className={styles.divisorValor}>{formatNumber(resultadoDivisor.corrienteR2 ?? 0, 4)} mA</span>
                    </div>
                    <div className={styles.divisorCard}>
                      <span className={styles.divisorLabel}>Voltaje común</span>
                      <span className={styles.divisorValor}>{formatNumber(resultadoDivisor.voltaje ?? 0, 4)} V</span>
                    </div>
                    <div className={styles.divisorCard}>
                      <span className={styles.divisorLabel}>Req paralelo</span>
                      <span className={styles.divisorValor}>{formatNumber(resultadoDivisor.resistenciaEquivalente ?? 0, 2)} Ω</span>
                    </div>
                  </div>
                  <div className={styles.formulaBox}>
                    <p>Fórmula: I₁ = Iin × R₂ / (R₁ + R₂)</p>
                    <p>Fórmula: I₂ = Iin × R₁ / (R₁ + R₂)</p>
                  </div>
                </>
              )}
            </>
          )}

          {tipoCalculo === 'mixto' && resultadoMixto && (
            <>
              <div className={styles.resultadoDestacado}>
                <span className={styles.resultadoLabel}>Resistencia Equivalente</span>
                <span className={styles.resultadoValor}>
                  {formatNumber(resultadoMixto.resistenciaEquivalente, 4)} Ω
                </span>
              </div>
              <div className={styles.formulaBox}>
                <p><strong>Configuración:</strong></p>
                <code>{resultadoMixto.configuracion}</code>
              </div>
            </>
          )}

          {tipoCalculo === 'mixto' && !resultadoMixto && configuracionMixta && (
            <div className={styles.errorBox}>
              <p>Error en la sintaxis. Verifica la expresión del circuito.</p>
              <p>Usa: serie(...) y paralelo(...) con valores numéricos.</p>
            </div>
          )}

          {tipoCalculo === 'rcrl' && resultadoRCRL && (
            <>
              <div className={styles.resultadoDestacado}>
                <span className={styles.resultadoLabel}>Constante de Tiempo (τ)</span>
                <span className={styles.resultadoValor}>
                  {resultadoRCRL.constanteTiempo >= 0.001
                    ? `${formatNumber(resultadoRCRL.constanteTiempo * 1000, 4)} ms`
                    : `${formatNumber(resultadoRCRL.constanteTiempo * 1000000, 4)} µs`
                  }
                </span>
              </div>

              <div className={styles.rcrlGrid}>
                {resultadoRCRL.tipo === 'RC' && (
                  <>
                    <div className={styles.rcrlCard}>
                      <span className={styles.rcrlLabel}>Voltaje Carga (t={tiempoRCRL}s)</span>
                      <span className={styles.rcrlValor}>{formatNumber(resultadoRCRL.voltajeCarga, 4)} V</span>
                    </div>
                    <div className={styles.rcrlCard}>
                      <span className={styles.rcrlLabel}>Voltaje Descarga (t={tiempoRCRL}s)</span>
                      <span className={styles.rcrlValor}>{formatNumber(resultadoRCRL.voltajeDescarga, 4)} V</span>
                    </div>
                    <div className={styles.rcrlCard}>
                      <span className={styles.rcrlLabel}>Corriente Carga</span>
                      <span className={styles.rcrlValor}>{formatNumber(resultadoRCRL.corrienteCarga * 1000, 4)} mA</span>
                    </div>
                    <div className={styles.rcrlCard}>
                      <span className={styles.rcrlLabel}>Energía Almacenada</span>
                      <span className={styles.rcrlValor}>{formatNumber(resultadoRCRL.energiaAlmacenada * 1000000, 4)} µJ</span>
                    </div>
                  </>
                )}
                {resultadoRCRL.tipo === 'RL' && (
                  <>
                    <div className={styles.rcrlCard}>
                      <span className={styles.rcrlLabel}>Corriente Carga (t={tiempoRCRL}s)</span>
                      <span className={styles.rcrlValor}>{formatNumber(resultadoRCRL.corrienteCarga * 1000, 4)} mA</span>
                    </div>
                    <div className={styles.rcrlCard}>
                      <span className={styles.rcrlLabel}>Corriente Descarga (t={tiempoRCRL}s)</span>
                      <span className={styles.rcrlValor}>{formatNumber(resultadoRCRL.corrienteDescarga * 1000, 4)} mA</span>
                    </div>
                    <div className={styles.rcrlCard}>
                      <span className={styles.rcrlLabel}>Voltaje Inductor</span>
                      <span className={styles.rcrlValor}>{formatNumber(resultadoRCRL.voltajeCarga, 4)} V</span>
                    </div>
                    <div className={styles.rcrlCard}>
                      <span className={styles.rcrlLabel}>Energía Almacenada</span>
                      <span className={styles.rcrlValor}>{formatNumber(resultadoRCRL.energiaAlmacenada * 1000000, 4)} µJ</span>
                    </div>
                  </>
                )}
              </div>

              <div className={styles.tiemposBox}>
                <h4>Tiempos Característicos</h4>
                <div className={styles.tiemposGrid}>
                  <div className={styles.tiempoItem}>
                    <span>1τ (63,2%)</span>
                    <span>{formatNumber(resultadoRCRL.tiempo63 * 1000, 4)} ms</span>
                  </div>
                  <div className={styles.tiempoItem}>
                    <span>3τ (95%)</span>
                    <span>{formatNumber(resultadoRCRL.tiempo95 * 1000, 4)} ms</span>
                  </div>
                  <div className={styles.tiempoItem}>
                    <span>5τ (99%)</span>
                    <span>{formatNumber(resultadoRCRL.tiempo99 * 1000, 4)} ms</span>
                  </div>
                  <div className={styles.tiempoItem}>
                    <span>Frec. Corte</span>
                    <span>{formatNumber(resultadoRCRL.frecuenciaCorte, 2)} Hz</span>
                  </div>
                </div>
              </div>

              <div className={styles.formulaBox}>
                {resultadoRCRL.tipo === 'RC' ? (
                  <>
                    <p>τ = R × C</p>
                    <p>Carga: Vc(t) = V₀(1 - e^(-t/τ))</p>
                    <p>Descarga: Vc(t) = V₀ × e^(-t/τ)</p>
                  </>
                ) : (
                  <>
                    <p>τ = L / R</p>
                    <p>Carga: IL(t) = (V₀/R)(1 - e^(-t/τ))</p>
                    <p>Descarga: IL(t) = (V₀/R) × e^(-t/τ)</p>
                  </>
                )}
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

          {!resultadoOhm && !resultadoPotencia && !resultadoCircuito && !resultadoConsumo && !resultadoDivisor && !resultadoMixto && !resultadoRCRL && (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon}>⚡</span>
              <p>Ingresa los valores para calcular</p>
            </div>
          )}
        </div>
      </div>

      <DisclaimerCard variant="educational" severity="low" collapsible={true} context="calculadora-electricidad">
        <p>Esta calculadora realiza cálculos teóricos basados en leyes físicas:</p>
        <ul className={styles.disclaimerList}>
          <li><strong>Coste de consumo orientativo</strong>: el precio real del kWh varía según tu tarifa, comercializadora, horario y tramo de consumo. Consulta tu factura eléctrica para el precio exacto.</li>
          <li><strong>Cálculos teóricos</strong>: en instalaciones reales intervienen factores como temperatura, tipo de cable, longitud y normativa (REBT). Para instalaciones eléctricas, consulta siempre a un profesional cualificado.</li>
        </ul>
      </DisclaimerCard>

      {/* Sección educativa */}
      <EducationalSection
        title="⚡ Aprende Electricidad: Conceptos, Preguntas y Guías"
        subtitle="Desde la Ley de Ohm hasta circuitos RC/RL — todo lo que necesitas saber"
      >
        {/* Tabla Comparativa */}
        <section className={styles.guideSection}>
          <h2>Corriente Continua (CC) vs Corriente Alterna (CA)</h2>
          <p className={styles.introParagraph}>
            La primera gran pregunta en electricidad: ¿CC o CA? Una pila es CC, el enchufe de casa es CA.
            Entender la diferencia es fundamental antes de trabajar con cualquier circuito.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.tablaComparativa}>
              <thead>
                <tr>
                  <th>Característica</th>
                  <th>Corriente Continua (CC / DC)</th>
                  <th>Corriente Alterna (CA / AC)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Dirección del flujo</td>
                  <td>Un único sentido, constante</td>
                  <td>Cambia de sentido 50 veces/s (50 Hz)</td>
                </tr>
                <tr>
                  <td>Voltaje típico</td>
                  <td>1,5 V (pila) – 48 V (solar/baterías)</td>
                  <td>230 V (monofásico) – 400 V (trifásico)</td>
                </tr>
                <tr>
                  <td>Generación</td>
                  <td>Pilas, baterías, paneles solares</td>
                  <td>Alternadores, centrales eléctricas</td>
                </tr>
                <tr>
                  <td>Transporte</td>
                  <td>Pérdidas elevadas en distancias largas</td>
                  <td>Eficiente con transformadores (alta tensión)</td>
                </tr>
                <tr>
                  <td>Uso doméstico</td>
                  <td>Electrónica, LED, carga de dispositivos</td>
                  <td>Electrodomésticos, motores, iluminación</td>
                </tr>
                <tr>
                  <td>Conversión</td>
                  <td>CC → CA: inversor / ondulador</td>
                  <td>CA → CC: rectificador / fuente de alimentación</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Casos de Uso */}
        <section className={styles.guideSection}>
          <h2>¿Para quién es esta calculadora?</h2>
          <p className={styles.introParagraph}>
            Cuatro perfiles reales que usan esta herramienta y cómo saca partido de ella cada uno.
          </p>
          <div className={styles.casosUsoGrid}>
            <div className={styles.casoCard}>
              <div className={styles.casoIcon}>🎓</div>
              <div className={styles.casoTitle}>Estudiante FP Electricidad</div>
              <div className={styles.casoSubtitle}>Preparando el examen de circuitos</div>
              <p className={styles.casoDesc}>
                Usa Ley de Ohm y Serie/Paralelo para verificar ejercicios del libro antes del examen.
                Entiende por qué la resistencia equivalente en paralelo siempre es menor que la más pequeña
                del grupo.
              </p>
            </div>
            <div className={styles.casoCard}>
              <div className={styles.casoIcon}>🔧</div>
              <div className={styles.casoTitle}>Electricista Junior en Obra</div>
              <div className={styles.casoSubtitle}>Cálculos rápidos en campo</div>
              <p className={styles.casoDesc}>
                Calcula la corriente que circulará por un circuito antes de elegir la sección del cable.
                Usa Potencia para verificar que el interruptor automático es el adecuado y Consumo
                para dar presupuesto al cliente.
              </p>
            </div>
            <div className={styles.casoCard}>
              <div className={styles.casoIcon}>🛠️</div>
              <div className={styles.casoTitle}>Técnico de Mantenimiento</div>
              <div className={styles.casoSubtitle}>Diagnóstico de averías</div>
              <p className={styles.casoDesc}>
                Mide con multímetro y compara con los valores teóricos de la calculadora.
                Un motor que consume más amperios de los calculados señala un devanado en mal estado
                o un problema mecánico.
              </p>
            </div>
            <div className={styles.casoCard}>
              <div className={styles.casoIcon}>🤖</div>
              <div className={styles.casoTitle}>Aficionado DIY / Maker</div>
              <div className={styles.casoSubtitle}>Proyectos Arduino, ESP32, Raspberry</div>
              <p className={styles.casoDesc}>
                Calcula la resistencia limitadora de corriente para un LED, diseña un divisor de tensión
                para adaptar señales de 5 V a 3,3 V, o elige el condensador de filtrado adecuado
                para su fuente de alimentación casera.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className={styles.guideSection}>
          <h2>Preguntas Frecuentes sobre Electricidad</h2>
          <p className={styles.introParagraph}>
            Las 8 dudas que aparecen una y otra vez en clase, en obra y en foros de electrónica.
          </p>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <p className={styles.faqPregunta}>¿Por qué en España usamos 230 V y en USA 120 V?</p>
              <p className={styles.faqRespuesta}>
                Es una decisión histórica. Europa adoptó 220-240 V porque permite transportar la misma
                potencia con cables más finos (menos corriente a mayor voltaje, P = V × I). EE.UU. se
                quedó en 110-120 V por inercia de las primeras instalaciones de Edison (finales del s. XIX).
                A mayor voltaje, mayor eficiencia en transporte pero mayor peligro en caso de contacto accidental.
              </p>
            </div>
            <div className={styles.faqItem}>
              <p className={styles.faqPregunta}>¿Cuándo usar circuito en serie y cuándo en paralelo?</p>
              <p className={styles.faqRespuesta}>
                Serie cuando quieres que los componentes compartan la misma corriente (cadenas de LEDs,
                resistencias limitadoras). Paralelo cuando quieres que cada componente tenga el voltaje
                completo y funcione de forma independiente (enchufes de casa, bombillas). Si una bombilla
                del paralelo se funde, las demás siguen encendidas; en serie, todas se apagan.
              </p>
            </div>
            <div className={styles.faqItem}>
              <p className={styles.faqPregunta}>¿Por qué se queman los fusibles y los plomos?</p>
              <p className={styles.faqRespuesta}>
                El fusible es un sacrificio calculado: un hilo metálico dimensionado para fundirse antes
                de que el calor dañe el cableado o provoque un incendio. Se quema cuando la corriente
                supera su calibre (ej: 16 A). Un cortocircuito o demasiados aparatos conectados generan
                ese exceso. El PIA (interruptor automático) moderno hace lo mismo pero sin consumibles:
                detecta la sobrecorriente y abre el circuito magnéticamente.
              </p>
            </div>
            <div className={styles.faqItem}>
              <p className={styles.faqPregunta}>¿Qué diferencia hay entre Vatios (W) y Voltamperios (VA)?</p>
              <p className={styles.faqRespuesta}>
                En CC son iguales. En CA con cargas inductivas (motores, transformadores) o capacitivas
                hay diferencia: los VA miden la potencia aparente (lo que la red suministra) y los W
                la potencia activa (la que realmente se convierte en trabajo útil). El cos(φ) o factor
                de potencia indica la relación: W = VA × cos(φ). Un motor con cos(φ) = 0,8 necesita
                1,25 kVA de la red para entregar 1 kW de trabajo.
              </p>
            </div>
            <div className={styles.faqItem}>
              <p className={styles.faqPregunta}>¿Por qué se calientan los cables cuando pasa mucha corriente?</p>
              <p className={styles.faqRespuesta}>
                Por el efecto Joule: todo conductor tiene una resistencia interna y cuando pasa corriente,
                parte de la energía se disipa como calor (P = I² × R). A mayor corriente, el calor aumenta
                al cuadrado — doblar la corriente cuadruplica el calor generado. Por eso los cables tienen
                una sección mínima según la corriente: a mayor sección, menor resistencia y menos calentamiento.
              </p>
            </div>
            <div className={styles.faqItem}>
              <p className={styles.faqPregunta}>¿Qué es la constante de tiempo τ (tau) y para qué sirve?</p>
              <p className={styles.faqRespuesta}>
                τ es el tiempo que tarda un circuito RC o RL en cargarse al 63,2% de su valor final.
                Después de 5τ está al 99% y se considera completamente cargado. Es fundamental para
                diseñar temporizadores (555, monoestables), filtros de audio paso alto/bajo, circuitos
                de debounce para botones y etapas de acoplamiento AC en amplificadores.
              </p>
            </div>
            <div className={styles.faqItem}>
              <p className={styles.faqPregunta}>¿Cómo afecta la temperatura a la resistencia de un conductor?</p>
              <p className={styles.faqRespuesta}>
                En la mayoría de los metales (cobre, aluminio), la resistencia aumenta con la temperatura:
                al calentarse, los átomos vibran más y dificultan el paso de electrones. Se calcula con
                R(T) = R₀ × [1 + α × (T - T₀)], donde α es el coeficiente de temperatura del material
                (para cobre: 0,00393 / °C). Por eso un motor en arranque consume más corriente que en
                régimen: la resistencia de los devanados es menor cuando están fríos.
              </p>
            </div>
            <div className={styles.faqItem}>
              <p className={styles.faqPregunta}>¿Cuántos aparatos puedo conectar a un enchufe de 16 A?</p>
              <p className={styles.faqRespuesta}>
                Un circuito de 16 A a 230 V puede suministrar hasta 3.680 W (P = V × I). En la práctica
                se recomienda no superar el 80% (≈ 2.944 W) para evitar calentamiento prolongado. Suma
                las potencias de todos los aparatos conectados: microondas (1.000 W) + tostadora (900 W)
                + hervidor (1.500 W) = 3.400 W, ya cerca del límite. Si saltan los plomos, es la señal
                de que has superado la capacidad del circuito.
              </p>
            </div>
          </div>
        </section>

        {/* Guía paso a paso */}
        <section className={styles.guideSection}>
          <h2>Cómo analizar un circuito desconocido: 6 pasos</h2>
          <p className={styles.introParagraph}>
            Metodología sistemática para resolver cualquier circuito resistivo, tanto en examen
            como en el trabajo real.
          </p>
          <div className={styles.pasosList}>
            <div className={styles.paso}>
              <div className={styles.pasoNum}>1</div>
              <div className={styles.pasoContent}>
                <p className={styles.pasoTitle}>Identificar la fuente de alimentación</p>
                <p className={styles.pasoDesc}>
                  Anota el voltaje (V) y si es CC o CA. En CC, identifica el polo positivo y negativo.
                  En CA, anota la frecuencia (50 Hz en España) si es relevante para el circuito.
                </p>
              </div>
            </div>
            <div className={styles.paso}>
              <div className={styles.pasoNum}>2</div>
              <div className={styles.pasoContent}>
                <p className={styles.pasoTitle}>Localizar y anotar todos los componentes</p>
                <p className={styles.pasoDesc}>
                  Lista todas las resistencias con sus valores en ohmios (Ω). Si hay condensadores
                  o inductores, anótalos también. Lee correctamente el código de colores o el valor marcado.
                </p>
              </div>
            </div>
            <div className={styles.paso}>
              <div className={styles.pasoNum}>3</div>
              <div className={styles.pasoContent}>
                <p className={styles.pasoTitle}>Determinar la topología de conexión</p>
                <p className={styles.pasoDesc}>
                  ¿Están en serie (misma línea), en paralelo (mismos nodos) o en combinación mixta?
                  Redibuja el circuito simplificado si es necesario. Un circuito mixto siempre
                  se resuelve de dentro hacia fuera.
                </p>
              </div>
            </div>
            <div className={styles.paso}>
              <div className={styles.pasoNum}>4</div>
              <div className={styles.pasoContent}>
                <p className={styles.pasoTitle}>Calcular la resistencia equivalente total</p>
                <p className={styles.pasoDesc}>
                  Serie: Req = R₁ + R₂ + ... | Paralelo: 1/Req = 1/R₁ + 1/R₂ + ...
                  En circuitos mixtos, resuelve primero los grupos internos y sustitúyelos por su equivalente.
                  Usa la calculadora de Mixtos para verificar el resultado.
                </p>
              </div>
            </div>
            <div className={styles.paso}>
              <div className={styles.pasoNum}>5</div>
              <div className={styles.pasoContent}>
                <p className={styles.pasoTitle}>Calcular la corriente total con Ley de Ohm</p>
                <p className={styles.pasoDesc}>
                  I_total = V_fuente / Req. En serie, esta corriente es igual en todos los elementos.
                  En paralelo, se reparte entre las ramas inversamente proporcional a su resistencia.
                </p>
              </div>
            </div>
            <div className={styles.paso}>
              <div className={styles.pasoNum}>6</div>
              <div className={styles.pasoContent}>
                <p className={styles.pasoTitle}>Verificar con Leyes de Kirchhoff</p>
                <p className={styles.pasoDesc}>
                  Calcula V en cada elemento (V = I × R). Verifica: la suma de tensiones en un lazo
                  cerrado es 0 (LKT), y la suma de corrientes en un nodo es 0 (LKC). Si cuadra,
                  el análisis es correcto.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Tips y Errores */}
        <section className={styles.guideSection}>
          <h2>Tips Profesionales y Errores Típicos</h2>
          <div className={styles.tipsErrorsSection}>
            <div className={styles.tipsColumn}>
              <h3 className={styles.tipsHeader}>✅ Tips que marcan la diferencia</h3>
              <div className={styles.tipItem}>Apunta siempre las unidades (Ω, V, A, W, kW). Un número sin unidad no significa nada en electricidad.</div>
              <div className={styles.tipItem}>En serie la corriente es idéntica en todo el circuito. En paralelo el voltaje es idéntico en todas las ramas. Grábatelo a fuego.</div>
              <div className={styles.tipItem}>Para calcular consumo, divide los vatios entre 1.000: 1.500 W = 1,5 kW. Luego multiplica por las horas de uso diario.</div>
              <div className={styles.tipItem}>En circuitos RC/RL, usa 5τ como tiempo de estabilización completa para el diseño práctico de temporizadores y filtros.</div>
              <div className={styles.tipItem}>Un divisor de tensión solo funciona bien sin carga o con carga de impedancia mucho mayor que R2. Con carga baja, el voltaje de salida cae.</div>
              <div className={styles.tipItem}>Antes de medir con multímetro, comprueba el modo: voltios para tensión (en paralelo), amperios para corriente (en serie).</div>
            </div>
            <div className={styles.tipsColumn}>
              <h3 className={styles.errorsHeader}>❌ Errores que comete casi todo el mundo</h3>
              <div className={styles.errorItem}>Confundir CC (pilas, USB, solar) con CA (enchufe de pared). Son circuitos incompatibles — conectar un aparato DC a 230 V CA lo destruye.</div>
              <div className={styles.errorItem}>Sumar resistencias en paralelo directamente. Error clásico: dos resistencias de 100 Ω en paralelo NO son 200 Ω, son 50 Ω.</div>
              <div className={styles.errorItem}>Olvidar convertir W a kW al calcular consumo. Un aparato de 2.000 W consume 2 kWh por hora, no 2.000 kWh.</div>
              <div className={styles.errorItem}>Medir amperios poniendo el multímetro en paralelo. Es un cortocircuito instantáneo: el fusible interno del multímetro salta o el aparato se daña.</div>
              <div className={styles.errorItem}>Ignorar el cos(φ) en motores y transformadores. Un motor de 1 kW puede necesitar 1,25 kVA de la red si su factor de potencia es 0,8.</div>
              <div className={styles.errorItem}>Creer que el fusible protege el aparato. El fusible protege el cable. Para proteger aparatos existen varistores y protectores de sobretensión.</div>
            </div>
          </div>
        </section>

        {/* Conceptos Básicos - contenido existente */}
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
              <p>V = I × R relaciona voltaje, corriente y resistencia. Es la base de todos los cálculos eléctricos. 1 Voltio = 1 Amperio × 1 Ohmio.</p>
            </div>
            <div className={styles.contentCard}>
              <h4>Potencia Eléctrica</h4>
              <p>P = V × I mide la energía consumida por unidad de tiempo. Se mide en Vatios (W). 1 kW = 1000 W. También: P = I²R = V²/R.</p>
            </div>
            <div className={styles.contentCard}>
              <h4>Circuitos Serie</h4>
              <p>Resistencias conectadas una tras otra. La corriente es igual en todos los puntos. Req = R₁ + R₂ + R₃...</p>
            </div>
            <div className={styles.contentCard}>
              <h4>Circuitos Paralelo</h4>
              <p>Resistencias conectadas entre los mismos puntos. El voltaje es igual en todas las ramas. 1/Req = 1/R₁ + 1/R₂ + 1/R₃...</p>
            </div>
            <div className={styles.contentCard}>
              <h4>Divisor de Tensión</h4>
              <p>Vout = Vin × R₂ / (R₁ + R₂). Permite obtener un voltaje menor que la fuente. Muy usado en electrónica para adaptar niveles de señal.</p>
            </div>
            <div className={styles.contentCard}>
              <h4>Divisor de Corriente</h4>
              <p>La corriente se divide inversamente proporcional a las resistencias. I₁ = Iin × R₂ / (R₁ + R₂). Útil en circuitos paralelo.</p>
            </div>
            <div className={styles.contentCard}>
              <h4>Circuitos RC</h4>
              <p>Resistencia + Capacitor. τ = R × C. Usados en filtros, temporizadores, acoplamiento AC. El capacitor almacena energía en campo eléctrico.</p>
            </div>
            <div className={styles.contentCard}>
              <h4>Circuitos RL</h4>
              <p>Resistencia + Inductor. τ = L / R. Usados en filtros, fuentes conmutadas, motores. El inductor almacena energía en campo magnético.</p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Respuesta Transitoria RC/RL</h2>
          <p className={styles.introParagraph}>
            Cuando se aplica o retira voltaje en un circuito RC o RL, la respuesta no es instantánea.
            El capacitor o inductor se carga/descarga exponencialmente con constante de tiempo τ (tau).
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.factoresTable}>
              <thead>
                <tr>
                  <th>Tiempo</th>
                  <th>% Carga/Descarga</th>
                  <th>Aplicación</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1τ</td>
                  <td>63,2%</td>
                  <td>Tiempo característico del sistema</td>
                </tr>
                <tr>
                  <td>2τ</td>
                  <td>86,5%</td>
                  <td>Respuesta prácticamente establecida</td>
                </tr>
                <tr>
                  <td>3τ</td>
                  <td>95,0%</td>
                  <td>Considerado &quot;casi completo&quot; en ingeniería</td>
                </tr>
                <tr>
                  <td>5τ</td>
                  <td>99,3%</td>
                  <td>Respuesta completamente establecida</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-electricidad')} />

      <ShareCard appName="calculadora-electricidad" />
      <Footer appName="calculadora-electricidad" />
    </div>
  );
}
