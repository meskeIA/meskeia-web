'use client';

import { useState, useMemo } from 'react';
import styles from './CalculadoraElectricidad.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { EducationalSection, RelatedApps, LegalNotice, DisclaimerCard, ShareCard } from '@/components';
import { formatNumber, parseSpanishNumber, parsearSerieNumerica, formatCurrency } from '@/lib';
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
    // Partía solo por comas, así que «10,5, 22» daba tres resistencias en vez de dos: la
    // coma decimal no tenía cabida. El lector compartido deduce su papel del propio texto
    // (04/09/2026, mismo arreglo que en las dos apps de estadística). Aquí no hace falta el
    // eco de LecturaSerie porque la app ya lista abajo cada resistencia interpretada.
    const valores = parsearSerieNumerica(resistencias).valores.filter(n => n > 0);

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
      const Iin = parseSpanishNumber(corrienteFuente) / 1000; // entrada en mA → A
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
              aria-pressed={tipoCalculo === 'ohm'}
            >
              <span className={styles.tipoIcono} aria-hidden="true">V=IR</span>
              <span className={styles.tipoNombre}>Ley de Ohm</span>
            </button>
            <button
              className={`${styles.tipoBtn} ${tipoCalculo === 'potencia' ? styles.tipoActivo : ''}`}
              onClick={() => setTipoCalculo('potencia')}
              aria-pressed={tipoCalculo === 'potencia'}
            >
              <span className={styles.tipoIcono} aria-hidden="true">P=VI</span>
              <span className={styles.tipoNombre}>Potencia</span>
            </button>
            <button
              className={`${styles.tipoBtn} ${tipoCalculo === 'circuito' ? styles.tipoActivo : ''}`}
              onClick={() => setTipoCalculo('circuito')}
              aria-pressed={tipoCalculo === 'circuito'}
            >
              <span className={styles.tipoIcono} aria-hidden="true">⫘</span>
              <span className={styles.tipoNombre}>Serie/Paralelo</span>
            </button>
            <button
              className={`${styles.tipoBtn} ${tipoCalculo === 'divisor' ? styles.tipoActivo : ''}`}
              onClick={() => setTipoCalculo('divisor')}
              aria-pressed={tipoCalculo === 'divisor'}
            >
              <span className={styles.tipoIcono} aria-hidden="true">⫗</span>
              <span className={styles.tipoNombre}>Divisores</span>
            </button>
            <button
              className={`${styles.tipoBtn} ${tipoCalculo === 'mixto' ? styles.tipoActivo : ''}`}
              onClick={() => setTipoCalculo('mixto')}
              aria-pressed={tipoCalculo === 'mixto'}
            >
              <span className={styles.tipoIcono} aria-hidden="true">⫘⫗</span>
              <span className={styles.tipoNombre}>Mixtos</span>
            </button>
            <button
              className={`${styles.tipoBtn} ${tipoCalculo === 'rcrl' ? styles.tipoActivo : ''}`}
              onClick={() => setTipoCalculo('rcrl')}
              aria-pressed={tipoCalculo === 'rcrl'}
            >
              <span className={styles.tipoIcono} aria-hidden="true">τ</span>
              <span className={styles.tipoNombre}>RC/RL</span>
            </button>
            <button
              className={`${styles.tipoBtn} ${tipoCalculo === 'consumo' ? styles.tipoActivo : ''}`}
              onClick={() => setTipoCalculo('consumo')}
              aria-pressed={tipoCalculo === 'consumo'}
            >
              <span className={styles.tipoIcono} aria-hidden="true">💡</span>
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
        <div className={styles.resultsPanel} role="status" aria-live="polite" aria-atomic="false">
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
                      <span className={styles.divisorValor}>{formatNumber((resultadoDivisor.corrienteR1 ?? 0) * 1000, 4)} mA</span>
                    </div>
                    <div className={styles.divisorCardDestacado}>
                      <span className={styles.divisorLabel}>Corriente por R2</span>
                      <span className={styles.divisorValor}>{formatNumber((resultadoDivisor.corrienteR2 ?? 0) * 1000, 4)} mA</span>
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
            <div className={styles.errorBox} role="alert">
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
        title="⚡ Aprende Electricidad: Leyes, Cálculos y Aplicaciones Prácticas"
        subtitle="Desde la Ley de Ohm hasta instalaciones reales — todo lo que necesitas saber"
      >
        {/* Sección 1: Tabla Comparativa */}
        <section className={styles.guideSection}>
          <h2>Leyes y Fórmulas Eléctricas Fundamentales</h2>
          <p className={styles.introParagraph}>
            Las siete leyes y conceptos que resuelven el 95% de los problemas eléctricos reales,
            con fórmulas, unidades y un ejemplo concreto de cada una.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.tablaComparativaV2}>
              <thead>
                <tr>
                  <th>Ley / Concepto</th>
                  <th>Fórmula</th>
                  <th>Variables</th>
                  <th>Unidades</th>
                  <th>Ejemplo real</th>
                  <th>Aplicación práctica</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Ley de Ohm</td>
                  <td>V = I × R</td>
                  <td>V voltaje, I corriente, R resistencia</td>
                  <td>V, A, Ω</td>
                  <td>12 V / 6 Ω = 2 A en un circuito de coche</td>
                  <td>Base de cualquier cálculo eléctrico</td>
                </tr>
                <tr>
                  <td>Potencia eléctrica</td>
                  <td>P = V × I</td>
                  <td>P potencia, V voltaje, I corriente</td>
                  <td>W (vatios)</td>
                  <td>230 V × 4,35 A = 1.000 W (secador)</td>
                  <td>Dimensionar cables e interruptores</td>
                </tr>
                <tr>
                  <td>Ley de Watt</td>
                  <td>P = I² × R</td>
                  <td>P potencia, I corriente, R resistencia</td>
                  <td>W, A, Ω</td>
                  <td>2 A² × 6 Ω = 24 W disipados en resistencia</td>
                  <td>Calcular calor generado en conductores</td>
                </tr>
                <tr>
                  <td>Energía eléctrica</td>
                  <td>E = P × t</td>
                  <td>E energía, P potencia, t tiempo</td>
                  <td>Wh o kWh</td>
                  <td>1.000 W × 5 h = 5 kWh (factura)</td>
                  <td>Calcular coste de electrodomésticos</td>
                </tr>
                <tr>
                  <td>Ley de Joule</td>
                  <td>Q = I² × R × t</td>
                  <td>Q calor, I corriente, R resistencia, t tiempo</td>
                  <td>J (julios)</td>
                  <td>2² × 6 × 10 s = 240 J de calor</td>
                  <td>Diseño de fusibles y protecciones térmicas</td>
                </tr>
                <tr>
                  <td>Circuito serie</td>
                  <td>Req = R₁ + R₂ + ...</td>
                  <td>Req resistencia equivalente, R₁ R₂ resistencias</td>
                  <td>Ω</td>
                  <td>10 Ω + 20 Ω + 30 Ω = 60 Ω total</td>
                  <td>Cadenas de LEDs, resistencias limitadoras</td>
                </tr>
                <tr>
                  <td>Circuito paralelo</td>
                  <td>1/Req = 1/R₁ + 1/R₂ + ...</td>
                  <td>Req resistencia equivalente, R₁ R₂ resistencias</td>
                  <td>Ω</td>
                  <td>1/(1/20 + 1/30) = 12 Ω equivalente</td>
                  <td>Enchufes domésticos, circuitos independientes</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Sección 2: Escenarios */}
        <section className={styles.guideSection}>
          <h2>Escenarios Reales: ¿Cómo lo resuelves?</h2>
          <p className={styles.introParagraph}>
            Cuatro situaciones reales con cálculo detallado y el tip profesional que marca la diferencia.
          </p>
          <div className={styles.escenarioGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🏠</span>
                <span className={styles.escenarioTitulo}>Propietario de vivienda</span>
              </div>
              <p className={styles.escenarioProblema}>
                ¿Puedo conectar el horno (2.200 W) y la vitrocerámica (3.500 W) al mismo circuito de 20 A a 230 V?
                P_total = 5.700 W, I = 5.700/230 = 24,8 A &gt; 20 A.
                <strong> No, necesita circuito dedicado.</strong>
              </p>
              <div className={styles.escenarioTip}>
                <span className={styles.escenarioTipLabel}>Tip profesional</span>
                Calcula siempre la corriente total antes de conectar varios electrodomésticos en el mismo circuito.
              </div>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>⚡</span>
                <span className={styles.escenarioTitulo}>Técnico electricista</span>
              </div>
              <p className={styles.escenarioProblema}>
                Dimensionar el cable de una instalación: bomba de 1.500 W a 230 V, 15 m de distancia,
                caída de tensión máx. 3%. I = 6,52 A → cable de 1,5 mm² es suficiente para potencia,
                pero la caída de tensión exige <strong>2,5 mm²</strong>.
              </p>
              <div className={styles.escenarioTip}>
                <span className={styles.escenarioTipLabel}>Tip profesional</span>
                La caída de tensión en cables largos es tan crítica como la sección por corriente.
              </div>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🌞</span>
                <span className={styles.escenarioTitulo}>Instalador solar</span>
              </div>
              <p className={styles.escenarioProblema}>
                Sistema solar aislado: 4 paneles de 300 W (1.200 W pico), batería 200 Ah a 24 V
                (4.800 Wh), inversor 1.500 W. ¿Autonomía? 4.800 Wh / 600 Wh consumo diario =
                <strong> 8 días sin sol.</strong>
              </p>
              <div className={styles.escenarioTip}>
                <span className={styles.escenarioTipLabel}>Tip profesional</span>
                Energía almacenada (Wh) = Capacidad (Ah) × Tensión (V). Siempre calcular en Wh, no en Ah.
              </div>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🏭</span>
                <span className={styles.escenarioTitulo}>Ingeniero industrial</span>
              </div>
              <p className={styles.escenarioProblema}>
                Motor trifásico 15 kW, cos φ = 0,85, η = 92%. Potencia aparente: S = 15/(0,85 × 0,92) = 19,2 kVA.
                Corriente de línea a 400 V: I = 19.200/(√3 × 400) = 27,7 A →
                <strong> magnetotérmico de 32 A.</strong>
              </p>
              <div className={styles.escenarioTip}>
                <span className={styles.escenarioTipLabel}>Tip profesional</span>
                En trifásico, P = √3 × V_línea × I × cos φ. El factor de potencia y rendimiento siempre reducen la eficiencia real.
              </div>
            </div>
          </div>
        </section>

        {/* Sección 3: FAQ */}
        <section className={styles.guideSection}>
          <h2>Preguntas Frecuentes sobre Electricidad</h2>
          <p className={styles.introParagraph}>
            Las dudas más habituales de propietarios, instaladores y aficionados a la electrónica.
          </p>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <p className={styles.faqPregunta}>¿Cuánto cuesta al año tener un frigorífico encendido?</p>
              <p className={styles.faqRespuesta}>
                Frigorífico clase A++ 150 W medio: 150 W × 8.760 h/año = 1.314 kWh/año.
                A 0,18 €/kWh = 236,52 €/año. Pero la mayoría son &lt;200 kWh/año por el ciclo compresor.
                Mira la etiqueta energética: indica kWh/año real.
              </p>
            </div>
            <div className={styles.faqItem}>
              <p className={styles.faqPregunta}>¿Qué diferencia hay entre vatios y vatios-hora?</p>
              <p className={styles.faqRespuesta}>
                Vatio (W) es potencia: velocidad a la que se consume energía. Vatio-hora (Wh) es energía:
                cantidad total consumida. Un calefactor de 1.000 W encendido 5 horas consume 5.000 Wh = 5 kWh.
                La factura te cobra kWh.
              </p>
            </div>
            <div className={styles.faqItem}>
              <p className={styles.faqPregunta}>¿Por qué el circuito del horno debe ser independiente?</p>
              <p className={styles.faqRespuesta}>
                El horno necesita 2.200 W → 2.200/230 = 9,6 A. El ICP del circuito general es 16-20 A.
                Con otros electrodomésticos activos, se supera fácilmente. El Reglamento Eléctrico exige
                circuito independiente para cocina.
              </p>
            </div>
            <div className={styles.faqItem}>
              <p className={styles.faqPregunta}>¿Qué es el factor de potencia y por qué importa en casa?</p>
              <p className={styles.faqRespuesta}>
                En corriente alterna, los aparatos con bobinas (motores, transformadores) consumen potencia
                reactiva que no hace trabajo útil. Las distribuidoras penalizan factor de potencia &lt;0,95
                en industria. En viviendas, afecta menos pero puede disparar el ICP.
              </p>
            </div>
            <div className={styles.faqItem}>
              <p className={styles.faqPregunta}>¿Cómo calculo si puedo poner un cargador de coche eléctrico en casa?</p>
              <p className={styles.faqRespuesta}>
                Wallbox 7,4 kW: I = 7.400/230 = 32 A. Necesitas contrato ≥10 kW (unos 44 A). Comprueba
                que el ICP, el cable desde el contador y el diferencial soporten 32 A. Muchas casas antiguas
                necesitan refuerzo de instalación.
              </p>
            </div>
            <div className={styles.faqItem}>
              <p className={styles.faqPregunta}>¿Qué sección de cable necesito para mi instalación?</p>
              <p className={styles.faqRespuesta}>
                Regla práctica: 1,5 mm² hasta 16 A (bombillas, enchufes pequeños), 2,5 mm² hasta 20 A
                (enchufes uso general), 4 mm² hasta 25 A (cocina, lavadora), 6 mm² hasta 32 A (horno,
                cargador VE). Siempre calcular caída de tensión en tramos largos.
              </p>
            </div>
            <div className={styles.faqItem}>
              <p className={styles.faqPregunta}>¿Cuánto ahorro con LED vs halógenas?</p>
              <p className={styles.faqRespuesta}>
                Bombilla halógena 60 W vs LED 8 W equivalente. Ahorro: 52 W × 1.000 h/año = 52 kWh ×
                0,18 € = 9,36 €/año por bombilla. Con 20 bombillas: 187 €/año. El LED se amortiza en 3-6 meses.
              </p>
            </div>
            <div className={styles.faqItem}>
              <p className={styles.faqPregunta}>¿Qué es la tarifa de discriminación horaria?</p>
              <p className={styles.faqRespuesta}>
                En España (PVPC y tarifas reguladas): valle (0-8 h, fines de semana) a ~0,08 €/kWh,
                punta (10-14 h y 18-22 h) a ~0,28 €/kWh. Usar lavadora, lavavajillas y cargador EV
                en horas valle puede ahorrar 30-40% en la factura eléctrica.
              </p>
            </div>
          </div>
        </section>

        {/* Sección 4: Guía paso a paso */}
        <section className={styles.guideSection}>
          <h2>Cómo calcular el consumo mensual de tu hogar: 7 pasos</h2>
          <p className={styles.introParagraph}>
            Metodología práctica para conocer cuánto consumes y dónde están los mayores gastos antes
            de actuar sobre la factura.
          </p>
          <div className={styles.pasosList}>
            <div className={styles.paso}>
              <div className={styles.pasoNum}>1</div>
              <div className={styles.pasoContent}>
                <p className={styles.pasoTitle}>Inventariar aparatos</p>
                <p className={styles.pasoDesc}>
                  Lista todos los electrodomésticos con su potencia (W) en la placa técnica o manual.
                  Agrupa: iluminación, climatización, electrodomésticos de cocina, standby.
                </p>
              </div>
            </div>
            <div className={styles.paso}>
              <div className={styles.pasoNum}>2</div>
              <div className={styles.pasoContent}>
                <p className={styles.pasoTitle}>Estimar horas de uso</p>
                <p className={styles.pasoDesc}>
                  Frigorífico: 24 h (ciclo 30%). TV: 4 h/día. Calefacción eléctrica: 6 h/día en invierno.
                  Iluminación: 3 h/día promedio.
                </p>
              </div>
            </div>
            <div className={styles.paso}>
              <div className={styles.pasoNum}>3</div>
              <div className={styles.pasoContent}>
                <p className={styles.pasoTitle}>Calcular consumo diario</p>
                <p className={styles.pasoDesc}>
                  Energía (Wh) = Potencia (W) × Horas. Frigorífico 150 W × 24 h × 0,30 = 1.080 Wh = 1,08 kWh.
                  TV 100 W × 4 h = 400 Wh. Suma todos.
                </p>
              </div>
            </div>
            <div className={styles.paso}>
              <div className={styles.pasoNum}>4</div>
              <div className={styles.pasoContent}>
                <p className={styles.pasoTitle}>Convertir a mensual</p>
                <p className={styles.pasoDesc}>
                  kWh diario × 30 días. Ejemplo: 10 kWh/día × 30 = 300 kWh/mes.
                </p>
              </div>
            </div>
            <div className={styles.paso}>
              <div className={styles.pasoNum}>5</div>
              <div className={styles.pasoContent}>
                <p className={styles.pasoTitle}>Calcular coste energético</p>
                <p className={styles.pasoDesc}>
                  300 kWh × precio/kWh (aprox. 0,15-0,25 € según tarifa y período) = 45-75 € solo en
                  energía, sin término de potencia ni impuestos.
                </p>
              </div>
            </div>
            <div className={styles.paso}>
              <div className={styles.pasoNum}>6</div>
              <div className={styles.pasoContent}>
                <p className={styles.pasoTitle}>Añadir términos fijos</p>
                <p className={styles.pasoDesc}>
                  Término de potencia (~3,5 €/kW contratado × kW/mes) + IVA 21% + impuesto eléctrico
                  5,1% + alquiler equipo medida (~3 €/mes).
                </p>
              </div>
            </div>
            <div className={styles.paso}>
              <div className={styles.pasoNum}>7</div>
              <div className={styles.pasoContent}>
                <p className={styles.pasoTitle}>Identificar mayores consumidores</p>
                <p className={styles.pasoDesc}>
                  Normalmente: climatización (40%), calentador ACS (20%), frigorífico (15%), iluminación
                  (10%). Actúa sobre los mayores consumidores primero.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Sección 5: Mejores prácticas */}
        <section className={styles.guideSection}>
          <h2>Mejores Prácticas para Ahorrar y Dimensionar Bien</h2>
          <p className={styles.introParagraph}>
            Seis consejos aplicables inmediatamente, tanto si eres propietario como instalador.
          </p>
          <div className={styles.mejoresPracticasGrid}>
            <div className={styles.mejorPracticaCard}>
              <div className={styles.mejorPracticaIcono}>🔌</div>
              <div className={styles.mejorPracticaTitulo}>Mide antes de estimar</div>
              <p className={styles.mejorPracticaDesc}>
                Un medidor de consumo enchufable (&lt;15 €) te da el consumo real de cada aparato.
                Sorpresa habitual: el set-top box en standby consume más que el LED encendido.
              </p>
            </div>
            <div className={styles.mejorPracticaCard}>
              <div className={styles.mejorPracticaIcono}>⏰</div>
              <div className={styles.mejorPracticaTitulo}>Programar consumos en valle</div>
              <p className={styles.mejorPracticaDesc}>
                Lavar, secar y cargar el coche en horas valle (0-8 h) puede ahorrar 30-40% en esas
                cargas con tarifa discriminación horaria.
              </p>
            </div>
            <div className={styles.mejorPracticaCard}>
              <div className={styles.mejorPracticaIcono}>🌡️</div>
              <div className={styles.mejorPracticaTitulo}>1°C menos = 7% ahorro calefacción</div>
              <p className={styles.mejorPracticaDesc}>
                Bajar el termostato de 22°C a 21°C ahorra ~7% en calefacción. De 22°C a 19°C: 21%
                de ahorro, sin sacrificar confort.
              </p>
            </div>
            <div className={styles.mejorPracticaCard}>
              <div className={styles.mejorPracticaIcono}>💡</div>
              <div className={styles.mejorPracticaTitulo}>LED para iluminación siempre</div>
              <p className={styles.mejorPracticaDesc}>
                El LED tiene 15.000-25.000 h de vida vs 1.000 h del incandescente. Con precio actual,
                la amortización es &lt;6 meses incluso en lámparas de uso esporádico.
              </p>
            </div>
            <div className={styles.mejorPracticaCard}>
              <div className={styles.mejorPracticaIcono}>🔋</div>
              <div className={styles.mejorPracticaTitulo}>Dimensiona bien la instalación solar</div>
              <p className={styles.mejorPracticaDesc}>
                Sobredimensionar paneles es barato (paneles son baratos). Sobredimensionar baterías es caro.
                Calcula primero tu consumo real antes de dimensionar.
              </p>
            </div>
            <div className={styles.mejorPracticaCard}>
              <div className={styles.mejorPracticaIcono}>📊</div>
              <div className={styles.mejorPracticaTitulo}>Contrata la potencia justa</div>
              <p className={styles.mejorPracticaDesc}>
                En España, bajar de 5,75 kW a 4,6 kW ahorra ~15 €/mes en término de potencia.
                Si no tienes climatización eléctrica, 3,45 kW puede ser suficiente.
              </p>
            </div>
          </div>
        </section>

        {/* Sección 6: Warning Box */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <h3 className={styles.warningTitle}>⚠️ Errores eléctricos con consecuencias graves</h3>
            <ul className={styles.warningList}>
              <li>
                <strong>Sobrecargar un circuito:</strong> Superar la corriente nominal del cable causa
                calentamiento → incendio. El magnetotérmico protege, pero si está mal dimensionado
                no saltará a tiempo.
              </li>
              <li>
                <strong>Usar cable de sección insuficiente en instalaciones solares 12 V:</strong> A 12 V,
                la corriente es el doble que a 24 V para la misma potencia. El 80% de incendios en
                instalaciones solares son por cables mal dimensionados.
              </li>
              <li>
                <strong>Confundir kW con kWh en baterías:</strong> Una batería de 200 Ah a 12 V = 2.400 Wh
                = 2,4 kWh, NO 200 kWh. Error frecuente que lleva a subdimensionar.
              </li>
              <li>
                <strong>No considerar la caída de tensión en DC:</strong> En corriente continua (solar,
                12/24 V), tramos largos de cable pueden perder 10-20% de tensión si la sección es insuficiente.
              </li>
              <li>
                <strong>Instalar sin diferencial o con uno averiado:</strong> El diferencial salva vidas
                (corriente de fuga &gt;30 mA). Verifica mensualmente pulsando el botón de test.
              </li>
              <li>
                <strong>Mezclar circuitos de distinta tensión sin separación galvánica:</strong> 230 V AC
                y 12 V DC en el mismo cuadro sin separación puede causar electrocución en la parte de
                baja tensión.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-electricidad')} />

      <ShareCard appName="calculadora-electricidad" />
      <Footer appName="calculadora-electricidad" />
    </div>
  );
}
