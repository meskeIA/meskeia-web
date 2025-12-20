'use client';

import { useState, useMemo } from 'react';
import styles from './CalculadoraElectricidad.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { EducationalSection, RelatedApps} from '@/components';
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
                      {formatNumber(resultadoDivisor.voltajeSalida, 4)} V
                    </span>
                  </div>
                  <div className={styles.divisorGrid}>
                    <div className={styles.divisorCard}>
                      <span className={styles.divisorLabel}>Ratio (R2/(R1+R2))</span>
                      <span className={styles.divisorValor}>{formatNumber(resultadoDivisor.ratio, 4)}</span>
                    </div>
                    <div className={styles.divisorCard}>
                      <span className={styles.divisorLabel}>Corriente</span>
                      <span className={styles.divisorValor}>{formatNumber(resultadoDivisor.corriente * 1000, 4)} mA</span>
                    </div>
                    <div className={styles.divisorCard}>
                      <span className={styles.divisorLabel}>Potencia R1</span>
                      <span className={styles.divisorValor}>{formatNumber(resultadoDivisor.potenciaR1 * 1000, 2)} mW</span>
                    </div>
                    <div className={styles.divisorCard}>
                      <span className={styles.divisorLabel}>Potencia R2</span>
                      <span className={styles.divisorValor}>{formatNumber(resultadoDivisor.potenciaR2 * 1000, 2)} mW</span>
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
                      <span className={styles.divisorValor}>{formatNumber(resultadoDivisor.corrienteR1, 4)} mA</span>
                    </div>
                    <div className={styles.divisorCardDestacado}>
                      <span className={styles.divisorLabel}>Corriente por R2</span>
                      <span className={styles.divisorValor}>{formatNumber(resultadoDivisor.corrienteR2, 4)} mA</span>
                    </div>
                    <div className={styles.divisorCard}>
                      <span className={styles.divisorLabel}>Voltaje común</span>
                      <span className={styles.divisorValor}>{formatNumber(resultadoDivisor.voltaje, 4)} V</span>
                    </div>
                    <div className={styles.divisorCard}>
                      <span className={styles.divisorLabel}>Req paralelo</span>
                      <span className={styles.divisorValor}>{formatNumber(resultadoDivisor.resistenciaEquivalente, 2)} Ω</span>
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

            <div className={styles.contentCard}>
              <h4>Divisor de Tensión</h4>
              <p>
                Vout = Vin × R₂ / (R₁ + R₂).
                Permite obtener un voltaje menor que la fuente.
                Muy usado en electrónica para adaptar niveles de señal.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>Divisor de Corriente</h4>
              <p>
                La corriente se divide inversamente proporcional a las resistencias.
                I₁ = Iin × R₂ / (R₁ + R₂).
                Útil en circuitos paralelo.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>Circuitos RC</h4>
              <p>
                Resistencia + Capacitor. τ = R × C.
                Usados en filtros, temporizadores, acoplamiento AC.
                El capacitor almacena energía en campo eléctrico.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>Circuitos RL</h4>
              <p>
                Resistencia + Inductor. τ = L / R.
                Usados en filtros, fuentes conmutadas, motores.
                El inductor almacena energía en campo magnético.
              </p>
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

      <Footer appName="calculadora-electricidad" />
    </div>
  );
}
