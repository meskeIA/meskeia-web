'use client';

import { useState, useMemo } from 'react';
import styles from './ConversorUnidadesRF.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps } from '@/components';
import { formatNumber, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// Tipos de conversión RF
type CategoriaRF = 'potencia' | 'voltaje' | 'vswr' | 'frecuencia' | 'atenuacion';

// Constantes físicas
const VELOCIDAD_LUZ = 299792458; // m/s

// ============================================
// CONVERSIONES DE POTENCIA (dBm, W, mW, etc.)
// ============================================

interface PotenciaResult {
  dBm: number;
  dBW: number;
  W: number;
  mW: number;
  uW: number;
  pW: number;
}

const convertirPotencia = (valor: number, unidad: string): PotenciaResult | null => {
  if (isNaN(valor)) return null;

  let mW: number;

  // Convertir todo a mW primero
  switch (unidad) {
    case 'dBm':
      mW = Math.pow(10, valor / 10);
      break;
    case 'dBW':
      mW = Math.pow(10, (valor + 30) / 10);
      break;
    case 'W':
      mW = valor * 1000;
      break;
    case 'mW':
      mW = valor;
      break;
    case 'uW':
      mW = valor / 1000;
      break;
    case 'pW':
      mW = valor / 1000000;
      break;
    default:
      return null;
  }

  if (mW <= 0) return null;

  return {
    dBm: 10 * Math.log10(mW),
    dBW: 10 * Math.log10(mW / 1000),
    W: mW / 1000,
    mW: mW,
    uW: mW * 1000,
    pW: mW * 1000000,
  };
};

// ============================================
// CONVERSIONES DE VOLTAJE (dBV, dBmV, dBµV, V)
// ============================================

interface VoltajeResult {
  dBV: number;
  dBmV: number;
  dBuV: number;
  V: number;
  mV: number;
  uV: number;
}

const convertirVoltaje = (valor: number, unidad: string): VoltajeResult | null => {
  if (isNaN(valor)) return null;

  let V: number;

  // Convertir todo a Voltios primero
  switch (unidad) {
    case 'dBV':
      V = Math.pow(10, valor / 20);
      break;
    case 'dBmV':
      V = Math.pow(10, (valor - 60) / 20);
      break;
    case 'dBuV':
      V = Math.pow(10, (valor - 120) / 20);
      break;
    case 'V':
      V = valor;
      break;
    case 'mV':
      V = valor / 1000;
      break;
    case 'uV':
      V = valor / 1000000;
      break;
    default:
      return null;
  }

  if (V <= 0) return null;

  return {
    dBV: 20 * Math.log10(V),
    dBmV: 20 * Math.log10(V * 1000),
    dBuV: 20 * Math.log10(V * 1000000),
    V: V,
    mV: V * 1000,
    uV: V * 1000000,
  };
};

// ============================================
// CONVERSIONES VSWR / RETURN LOSS / COEF. REFLEXIÓN
// ============================================

interface VSWRResult {
  vswr: number;
  returnLoss: number;
  gamma: number;
  gammaPercent: number;
  mismatchLoss: number;
  powerReflected: number;
}

const convertirVSWR = (valor: number, unidad: string): VSWRResult | null => {
  if (isNaN(valor)) return null;

  let gamma: number; // Coeficiente de reflexión (0 a 1)

  switch (unidad) {
    case 'vswr':
      if (valor < 1) return null;
      gamma = (valor - 1) / (valor + 1);
      break;
    case 'returnLoss':
      if (valor < 0) return null;
      gamma = Math.pow(10, -valor / 20);
      break;
    case 'gamma':
      if (valor < 0 || valor > 1) return null;
      gamma = valor;
      break;
    case 'gammaPercent':
      if (valor < 0 || valor > 100) return null;
      gamma = valor / 100;
      break;
    default:
      return null;
  }

  const vswr = (1 + gamma) / (1 - gamma);
  const returnLoss = -20 * Math.log10(gamma);
  const mismatchLoss = -10 * Math.log10(1 - gamma * gamma);
  const powerReflected = gamma * gamma * 100;

  return {
    vswr: vswr,
    returnLoss: isFinite(returnLoss) ? returnLoss : 999,
    gamma: gamma,
    gammaPercent: gamma * 100,
    mismatchLoss: mismatchLoss,
    powerReflected: powerReflected,
  };
};

// ============================================
// CONVERSIONES FRECUENCIA ↔ LONGITUD DE ONDA
// ============================================

interface FrecuenciaResult {
  Hz: number;
  kHz: number;
  MHz: number;
  GHz: number;
  lambda_m: number;
  lambda_cm: number;
  lambda_mm: number;
}

const convertirFrecuencia = (valor: number, unidad: string): FrecuenciaResult | null => {
  if (isNaN(valor) || valor <= 0) return null;

  let Hz: number;

  switch (unidad) {
    case 'Hz':
      Hz = valor;
      break;
    case 'kHz':
      Hz = valor * 1000;
      break;
    case 'MHz':
      Hz = valor * 1000000;
      break;
    case 'GHz':
      Hz = valor * 1000000000;
      break;
    case 'lambda_m':
      Hz = VELOCIDAD_LUZ / valor;
      break;
    case 'lambda_cm':
      Hz = VELOCIDAD_LUZ / (valor / 100);
      break;
    case 'lambda_mm':
      Hz = VELOCIDAD_LUZ / (valor / 1000);
      break;
    default:
      return null;
  }

  const lambda_m = VELOCIDAD_LUZ / Hz;

  return {
    Hz: Hz,
    kHz: Hz / 1000,
    MHz: Hz / 1000000,
    GHz: Hz / 1000000000,
    lambda_m: lambda_m,
    lambda_cm: lambda_m * 100,
    lambda_mm: lambda_m * 1000,
  };
};

// ============================================
// CONVERSIONES DE ATENUACIÓN (dB)
// ============================================

interface AtenuacionResult {
  dB: number;
  ratio: number;
  ratioPercent: number;
  neper: number;
}

const convertirAtenuacion = (valor: number, unidad: string): AtenuacionResult | null => {
  if (isNaN(valor)) return null;

  let dB: number;

  switch (unidad) {
    case 'dB':
      dB = valor;
      break;
    case 'ratio':
      if (valor <= 0) return null;
      dB = 10 * Math.log10(valor);
      break;
    case 'ratioPercent':
      if (valor <= 0) return null;
      dB = 10 * Math.log10(valor / 100);
      break;
    case 'neper':
      dB = valor * 8.686;
      break;
    default:
      return null;
  }

  const ratio = Math.pow(10, dB / 10);

  return {
    dB: dB,
    ratio: ratio,
    ratioPercent: ratio * 100,
    neper: dB / 8.686,
  };
};

// ============================================
// INFORMACIÓN DE CATEGORÍAS
// ============================================

const CATEGORIAS_INFO: Record<CategoriaRF, { nombre: string; icono: string; descripcion: string }> = {
  potencia: {
    nombre: 'Potencia',
    icono: '📡',
    descripcion: 'dBm ↔ Watts'
  },
  voltaje: {
    nombre: 'Voltaje',
    icono: '⚡',
    descripcion: 'dBV ↔ dBµV'
  },
  vswr: {
    nombre: 'VSWR',
    icono: '📊',
    descripcion: 'VSWR ↔ Return Loss'
  },
  frecuencia: {
    nombre: 'Frecuencia',
    icono: '🌊',
    descripcion: 'f ↔ λ'
  },
  atenuacion: {
    nombre: 'Atenuación',
    icono: '📉',
    descripcion: 'dB ↔ Ratio'
  },
};

// Unidades por categoría
const UNIDADES: Record<CategoriaRF, { id: string; nombre: string; simbolo: string }[]> = {
  potencia: [
    { id: 'dBm', nombre: 'Decibelios-milivatio', simbolo: 'dBm' },
    { id: 'dBW', nombre: 'Decibelios-vatio', simbolo: 'dBW' },
    { id: 'W', nombre: 'Vatio', simbolo: 'W' },
    { id: 'mW', nombre: 'Milivatio', simbolo: 'mW' },
    { id: 'uW', nombre: 'Microvatio', simbolo: 'µW' },
    { id: 'pW', nombre: 'Picovatio', simbolo: 'pW' },
  ],
  voltaje: [
    { id: 'dBV', nombre: 'Decibelios-voltio', simbolo: 'dBV' },
    { id: 'dBmV', nombre: 'Decibelios-milivoltio', simbolo: 'dBmV' },
    { id: 'dBuV', nombre: 'Decibelios-microvoltio', simbolo: 'dBµV' },
    { id: 'V', nombre: 'Voltio', simbolo: 'V' },
    { id: 'mV', nombre: 'Milivoltio', simbolo: 'mV' },
    { id: 'uV', nombre: 'Microvoltio', simbolo: 'µV' },
  ],
  vswr: [
    { id: 'vswr', nombre: 'VSWR', simbolo: ':1' },
    { id: 'returnLoss', nombre: 'Return Loss', simbolo: 'dB' },
    { id: 'gamma', nombre: 'Coef. reflexión (Γ)', simbolo: '' },
    { id: 'gammaPercent', nombre: 'Coef. reflexión', simbolo: '%' },
  ],
  frecuencia: [
    { id: 'Hz', nombre: 'Hercio', simbolo: 'Hz' },
    { id: 'kHz', nombre: 'Kilohercio', simbolo: 'kHz' },
    { id: 'MHz', nombre: 'Megahercio', simbolo: 'MHz' },
    { id: 'GHz', nombre: 'Gigahercio', simbolo: 'GHz' },
    { id: 'lambda_m', nombre: 'Longitud de onda', simbolo: 'm' },
    { id: 'lambda_cm', nombre: 'Longitud de onda', simbolo: 'cm' },
    { id: 'lambda_mm', nombre: 'Longitud de onda', simbolo: 'mm' },
  ],
  atenuacion: [
    { id: 'dB', nombre: 'Decibelios', simbolo: 'dB' },
    { id: 'ratio', nombre: 'Ratio (lineal)', simbolo: '' },
    { id: 'ratioPercent', nombre: 'Porcentaje', simbolo: '%' },
    { id: 'neper', nombre: 'Neper', simbolo: 'Np' },
  ],
};

// Ejemplos de referencia para cada categoría
const REFERENCIAS: Record<CategoriaRF, { nombre: string; valor: string; unidad: string }[]> = {
  potencia: [
    { nombre: 'WiFi típico', valor: '20', unidad: 'dBm (100 mW)' },
    { nombre: 'Móvil 4G/5G', valor: '23', unidad: 'dBm (200 mW)' },
    { nombre: 'Radioaficionado', valor: '43', unidad: 'dBm (20 W)' },
    { nombre: 'Emisora FM', valor: '60', unidad: 'dBW (1 MW)' },
    { nombre: 'Sensibilidad GPS', valor: '-130', unidad: 'dBm' },
    { nombre: 'Ruido térmico', valor: '-174', unidad: 'dBm/Hz' },
  ],
  voltaje: [
    { nombre: 'Señal TV cable', valor: '60-80', unidad: 'dBµV' },
    { nombre: 'Señal FM antena', valor: '40-60', unidad: 'dBµV' },
    { nombre: 'Límite EMC', valor: '30-40', unidad: 'dBµV/m' },
    { nombre: 'Señal débil', valor: '0-20', unidad: 'dBµV' },
  ],
  vswr: [
    { nombre: 'Excelente', valor: '< 1,2', unidad: ':1' },
    { nombre: 'Muy bueno', valor: '< 1,5', unidad: ':1' },
    { nombre: 'Aceptable', valor: '< 2,0', unidad: ':1' },
    { nombre: 'Límite 50Ω', valor: '< 3,0', unidad: ':1' },
    { nombre: 'Pobre', valor: '> 3,0', unidad: ':1' },
  ],
  frecuencia: [
    { nombre: 'FM Radio', valor: '88-108', unidad: 'MHz (λ ≈ 3 m)' },
    { nombre: 'WiFi 2.4 GHz', valor: '2400', unidad: 'MHz (λ ≈ 12 cm)' },
    { nombre: 'WiFi 5 GHz', valor: '5000', unidad: 'MHz (λ ≈ 6 cm)' },
    { nombre: '4G LTE', valor: '700-2600', unidad: 'MHz' },
    { nombre: '5G mmWave', valor: '24-40', unidad: 'GHz (λ ≈ 8 mm)' },
    { nombre: 'GPS L1', valor: '1575,42', unidad: 'MHz' },
  ],
  atenuacion: [
    { nombre: '-3 dB', valor: '-3', unidad: 'dB = 50% potencia' },
    { nombre: '-6 dB', valor: '-6', unidad: 'dB = 25% potencia' },
    { nombre: '-10 dB', valor: '-10', unidad: 'dB = 10% potencia' },
    { nombre: '-20 dB', valor: '-20', unidad: 'dB = 1% potencia' },
  ],
};

export default function ConversorUnidadesRFPage() {
  const [categoria, setCategoria] = useState<CategoriaRF>('potencia');
  const [valor, setValor] = useState('0');
  const [unidadOrigen, setUnidadOrigen] = useState('dBm');

  // Cambiar categoría
  const handleCategoriaChange = (cat: CategoriaRF) => {
    setCategoria(cat);
    setUnidadOrigen(UNIDADES[cat][0].id);
    setValor(cat === 'vswr' ? '1,5' : '0');
  };

  // Calcular resultados
  const resultado = useMemo(() => {
    const num = parseSpanishNumber(valor);

    switch (categoria) {
      case 'potencia':
        return convertirPotencia(num, unidadOrigen);
      case 'voltaje':
        return convertirVoltaje(num, unidadOrigen);
      case 'vswr':
        return convertirVSWR(num, unidadOrigen);
      case 'frecuencia':
        return convertirFrecuencia(num, unidadOrigen);
      case 'atenuacion':
        return convertirAtenuacion(num, unidadOrigen);
      default:
        return null;
    }
  }, [valor, categoria, unidadOrigen]);

  // Formatear resultado según tipo
  const formatearResultado = (key: string, value: number): string => {
    if (!isFinite(value)) return '∞';

    // Casos especiales de formato
    if (key === 'vswr') return formatNumber(value, 2) + ':1';
    if (key === 'gamma') return formatNumber(value, 4);
    if (key.includes('Percent') || key === 'powerReflected') return formatNumber(value, 2) + '%';
    if (key.includes('dB') || key === 'returnLoss' || key === 'mismatchLoss') return formatNumber(value, 2) + ' dB';
    if (key === 'neper') return formatNumber(value, 4) + ' Np';
    if (key === 'ratio') return formatNumber(value, 6);

    // Notación científica para valores muy grandes o pequeños
    if (Math.abs(value) >= 1e9 || (Math.abs(value) < 1e-6 && value !== 0)) {
      return value.toExponential(3);
    }

    return formatNumber(value, 4);
  };

  // Obtener nombre de unidad
  const getNombreUnidad = (key: string): string => {
    const nombres: Record<string, string> = {
      dBm: 'dBm',
      dBW: 'dBW',
      W: 'W',
      mW: 'mW',
      uW: 'µW',
      pW: 'pW',
      dBV: 'dBV',
      dBmV: 'dBmV',
      dBuV: 'dBµV',
      V: 'V',
      mV: 'mV',
      uV: 'µV',
      vswr: 'VSWR',
      returnLoss: 'Return Loss',
      gamma: 'Γ (coef.)',
      gammaPercent: 'Γ (%)',
      mismatchLoss: 'Mismatch Loss',
      powerReflected: 'Potencia reflejada',
      Hz: 'Hz',
      kHz: 'kHz',
      MHz: 'MHz',
      GHz: 'GHz',
      lambda_m: 'λ (m)',
      lambda_cm: 'λ (cm)',
      lambda_mm: 'λ (mm)',
      dB: 'dB',
      ratio: 'Ratio',
      ratioPercent: 'Porcentaje',
      neper: 'Neper',
    };
    return nombres[key] || key;
  };

  const unidadesActuales = UNIDADES[categoria];
  const referenciasActuales = REFERENCIAS[categoria];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>📡 Conversor de Unidades RF</h1>
        <p className={styles.subtitle}>
          Conversiones para radiofrecuencia: dBm↔Watts, VSWR, Return Loss, frecuencia↔longitud de onda
        </p>
      </header>

      <div className={styles.mainContent}>
        {/* Panel de categorías */}
        <div className={styles.configPanel}>
          <h2 className={styles.sectionTitle}>Tipo de Conversión</h2>

          <div className={styles.categoriasGrid}>
            {(Object.keys(CATEGORIAS_INFO) as CategoriaRF[]).map((cat) => (
              <button
                key={cat}
                className={`${styles.categoriaBtn} ${categoria === cat ? styles.categoriaActiva : ''}`}
                onClick={() => handleCategoriaChange(cat)}
              >
                <span className={styles.categoriaIcono}>{CATEGORIAS_INFO[cat].icono}</span>
                <span className={styles.categoriaNombre}>{CATEGORIAS_INFO[cat].nombre}</span>
                <span className={styles.categoriaDesc}>{CATEGORIAS_INFO[cat].descripcion}</span>
              </button>
            ))}
          </div>

          {/* Referencias */}
          <div className={styles.referenciasSection}>
            <h3 className={styles.referenciasTitle}>📋 Valores de referencia</h3>
            <div className={styles.referenciasList}>
              {referenciasActuales.map((ref, idx) => (
                <div key={idx} className={styles.referenciaItem}>
                  <span className={styles.referenciaNombre}>{ref.nombre}</span>
                  <span className={styles.referenciaValor}>{ref.valor} {ref.unidad}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Panel de conversión */}
        <div className={styles.resultsPanel}>
          <h2 className={styles.sectionTitle}>
            {CATEGORIAS_INFO[categoria].icono} {CATEGORIAS_INFO[categoria].nombre}
          </h2>

          <div className={styles.conversionBox}>
            {/* Input */}
            <div className={styles.inputGroup}>
              <label className={styles.label}>Valor de entrada</label>
              <input
                type="text"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                className={styles.input}
                placeholder="Ingresa un valor"
              />
              <select
                value={unidadOrigen}
                onChange={(e) => setUnidadOrigen(e.target.value)}
                className={styles.select}
              >
                {unidadesActuales.map((unidad) => (
                  <option key={unidad.id} value={unidad.id}>
                    {unidad.nombre} ({unidad.simbolo})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Resultados */}
          {resultado && (
            <div className={styles.resultadosGrid}>
              {Object.entries(resultado).map(([key, value]) => (
                <div
                  key={key}
                  className={`${styles.resultadoCard} ${key === unidadOrigen ? styles.resultadoActivo : ''}`}
                >
                  <span className={styles.resultadoLabel}>{getNombreUnidad(key)}</span>
                  <span className={styles.resultadoValor}>
                    {formatearResultado(key, value as number)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {!resultado && valor !== '' && (
            <div className={styles.errorBox}>
              <p>⚠️ Valor inválido. Verifica que el número sea correcto para esta unidad.</p>
            </div>
          )}

          {/* Fórmulas */}
          <div className={styles.formulasSection}>
            <h3>📐 Fórmulas utilizadas</h3>
            {categoria === 'potencia' && (
              <div className={styles.formulaBox}>
                <p><strong>dBm a mW:</strong> P(mW) = 10^(P(dBm)/10)</p>
                <p><strong>mW a dBm:</strong> P(dBm) = 10 × log₁₀(P(mW))</p>
                <p><strong>dBW a dBm:</strong> P(dBm) = P(dBW) + 30</p>
              </div>
            )}
            {categoria === 'voltaje' && (
              <div className={styles.formulaBox}>
                <p><strong>dBV a V:</strong> V = 10^(dBV/20)</p>
                <p><strong>V a dBV:</strong> dBV = 20 × log₁₀(V)</p>
                <p><strong>dBµV:</strong> dBµV = dBV + 120</p>
              </div>
            )}
            {categoria === 'vswr' && (
              <div className={styles.formulaBox}>
                <p><strong>VSWR a Γ:</strong> Γ = (VSWR - 1) / (VSWR + 1)</p>
                <p><strong>Return Loss:</strong> RL = -20 × log₁₀(Γ) dB</p>
                <p><strong>Potencia reflejada:</strong> P_ref = Γ² × 100%</p>
              </div>
            )}
            {categoria === 'frecuencia' && (
              <div className={styles.formulaBox}>
                <p><strong>Longitud de onda:</strong> λ = c / f</p>
                <p><strong>Donde:</strong> c = 299.792.458 m/s</p>
                <p><strong>Frecuencia:</strong> f = c / λ</p>
              </div>
            )}
            {categoria === 'atenuacion' && (
              <div className={styles.formulaBox}>
                <p><strong>dB a ratio:</strong> ratio = 10^(dB/10)</p>
                <p><strong>Ratio a dB:</strong> dB = 10 × log₁₀(ratio)</p>
                <p><strong>Neper:</strong> 1 Np = 8,686 dB</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sección educativa */}
      <EducationalSection
        title="📚 ¿Quieres aprender más sobre unidades RF?"
        subtitle="Conceptos clave de radiofrecuencia y telecomunicaciones"
      >
        <section className={styles.guideSection}>
          <h2>Conceptos Fundamentales de RF</h2>
          <p className={styles.introParagraph}>
            Las unidades de radiofrecuencia utilizan escalas logarítmicas (decibelios) porque facilitan
            los cálculos con señales que varían en rangos muy amplios, desde picowatts hasta megawatts.
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>¿Por qué usar dBm?</h4>
              <p>
                El dBm es una unidad logarítmica referenciada a 1 mW. Permite sumar ganancias y restar
                pérdidas directamente en lugar de multiplicar y dividir. Por ejemplo: 20 dBm + 3 dB = 23 dBm
                es más simple que 100 mW × 2 = 200 mW.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>VSWR y Adaptación de Impedancias</h4>
              <p>
                El VSWR (Voltage Standing Wave Ratio) mide qué tan bien adaptada está una antena.
                Un VSWR de 1:1 es perfecto (toda la potencia se transmite). Un VSWR de 2:1 significa
                que ~11% de la potencia se refleja.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>Return Loss</h4>
              <p>
                Es la medida en dB de cuánta potencia se refleja. Un Return Loss de 20 dB significa
                que solo el 1% de la potencia se refleja (muy bueno). Valores mayores de 10 dB son
                generalmente aceptables.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>Longitud de Onda y Antenas</h4>
              <p>
                La longitud de una antena depende de la frecuencia. Una antena dipolo mide λ/2.
                Por ejemplo, para WiFi a 2,4 GHz (λ ≈ 12,5 cm), un dipolo mide unos 6 cm.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>Sensibilidad del Receptor</h4>
              <p>
                Se mide en dBm y representa la señal mínima detectable. Un receptor WiFi típico
                tiene -70 a -85 dBm. Los receptores GPS pueden detectar señales de -130 dBm.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>Pérdidas en Cables</h4>
              <p>
                Los cables coaxiales tienen pérdidas que aumentan con la frecuencia. Por ejemplo,
                un cable RG-58 tiene ~6 dB/10m a 400 MHz, pero ~20 dB/10m a 2,4 GHz.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Tabla de Conversión Rápida dBm ↔ mW</h2>
          <div className={styles.tablaRapida}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>dBm</th>
                  <th>mW</th>
                  <th>W</th>
                  <th>Uso típico</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>-30</td><td>0,001</td><td>1 µW</td><td>Señal débil recibida</td></tr>
                <tr><td>-20</td><td>0,01</td><td>10 µW</td><td>Señal recibida típica</td></tr>
                <tr><td>-10</td><td>0,1</td><td>100 µW</td><td>Señal fuerte recibida</td></tr>
                <tr><td>0</td><td>1</td><td>1 mW</td><td>Referencia dBm</td></tr>
                <tr><td>10</td><td>10</td><td>10 mW</td><td>Bluetooth clase 1</td></tr>
                <tr><td>20</td><td>100</td><td>100 mW</td><td>WiFi típico</td></tr>
                <tr><td>30</td><td>1.000</td><td>1 W</td><td>Radio PMR, walkie-talkie</td></tr>
                <tr><td>40</td><td>10.000</td><td>10 W</td><td>Radioaficionado HF</td></tr>
                <tr><td>50</td><td>100.000</td><td>100 W</td><td>Radioaficionado potente</td></tr>
                <tr><td>60</td><td>1.000.000</td><td>1 kW</td><td>Emisora local</td></tr>
              </tbody>
            </table>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('conversor-unidades-rf')} />
      <Footer appName="conversor-unidades-rf" />
    </div>
  );
}
