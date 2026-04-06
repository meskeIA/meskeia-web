'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './ConversorUnidadesRF.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
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

      <LegalNotice />

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

        {/* SECCIÓN 1: Tabla Comparativa de Unidades RF */}
        <section className={styles.guideSection}>
          <h2>Tabla Comparativa: dBm vs Watts vs dBW vs dBµV</h2>
          <p className={styles.introParagraph}>
            Cada unidad RF tiene su contexto de uso. Entender cuándo aplicar cada una evita errores de cálculo y facilita la comunicación entre equipos de trabajo.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Unidad</th>
                  <th>Rango típico</th>
                  <th>Cuándo se usa</th>
                  <th>Escala</th>
                  <th>Facilidad de cálculo</th>
                  <th>Estándares donde aparece</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>dBm</strong></td>
                  <td>-174 a +60 dBm</td>
                  <td>Potencia de señal en sistemas de comunicaciones, medición con analizadores de espectro</td>
                  <td>Logarítmica (ref. 1 mW)</td>
                  <td>Muy alta: suma y resta directa de ganancias/pérdidas</td>
                  <td>IEEE 802.11, 3GPP LTE/5G, ITU-T</td>
                </tr>
                <tr>
                  <td><strong>Watts (W/mW)</strong></td>
                  <td>pW a kW</td>
                  <td>Especificación de amplificadores, transmisores, cálculos de SAR</td>
                  <td>Lineal</td>
                  <td>Media: necesita multiplicaciones para cadenas RF</td>
                  <td>IEC 60268, UNE-EN 300 422</td>
                </tr>
                <tr>
                  <td><strong>dBW</strong></td>
                  <td>-30 a +90 dBW</td>
                  <td>Sistemas de satélite, radioenlaces, PIRE (Potencia Isótropa Radiada Equivalente)</td>
                  <td>Logarítmica (ref. 1 W)</td>
                  <td>Alta: igual que dBm, pero referenciada a 1 W</td>
                  <td>ITU-R, ETSI EN 302 217</td>
                </tr>
                <tr>
                  <td><strong>dBµV</strong></td>
                  <td>0 a 120 dBµV</td>
                  <td>Medición de señales de TV, cable, DAB+, compatibilidad electromagnética (EMC)</td>
                  <td>Logarítmica (ref. 1 µV)</td>
                  <td>Alta: estándar en instalaciones de antenas domésticas</td>
                  <td>DVB-T2 (ETSI EN 302 755), UNE-EN 50083</td>
                </tr>
                <tr>
                  <td><strong>dBmV</strong></td>
                  <td>-20 a +60 dBmV</td>
                  <td>Distribución de señal en redes de cable coaxial (CATV, DOCSIS)</td>
                  <td>Logarítmica (ref. 1 mV)</td>
                  <td>Alta: común en instalaciones de cable</td>
                  <td>DOCSIS 3.1, SCTE 40</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* SECCIÓN 2: Casos de Uso por Perfil */}
        <section className={styles.guideSection}>
          <h2>Casos de Uso por Perfil Profesional</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">📡</span>
                <h3>Técnico en Telecomunicaciones calibrando antenas</h3>
              </div>
              <p className={styles.escenarioExample}>
                Instalando una antena sectorial LTE a 1800 MHz. El analizador de espectro marca -45 dBm en el punto de conexión al feeder. Necesita saber si la señal es suficiente para el modem (sensibilidad -100 dBm). Diferencia: 55 dB de margen, más que suficiente. Mide también el VSWR de la antena: 1,4:1 → Return Loss de 15,6 dB → solo el 2,8% de la potencia se refleja. Instalación correcta.
              </p>
              <p className={styles.escenarioTip}>
                Herramienta clave: conversor dBm ↔ W para verificar que la potencia del transmisor (43 dBm = 20 W) no supera los límites legales de exposición de la CMT.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">📻</span>
                <h3>Radioaficionado midiendo potencia de emisora</h3>
              </div>
              <p className={styles.escenarioExample}>
                Operador EA4 con licencia clase A (máx. 400 W PEP en HF). Su transceptor indica 100 W en el display (50 dBm). Ajusta el ATU hasta conseguir VSWR 1,2:1 en la antena dipolo a 14 MHz (λ = 21,4 m → dipolo de 10,7 m). Con cable RG-213 de 15 m (pérdidas: ~0,7 dB/10m a 14 MHz), la pérdida en el cable es ~1 dB: entrega 79,4 W a la antena.
              </p>
              <p className={styles.escenarioTip}>
                Referencia EA/URE: VSWR &lt; 1,5:1 es el objetivo habitual. Con VSWR 2:1 el Return Loss es 9,5 dB y se refleja el 11% de la potencia (11 W de 100 W).
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🔬</span>
                <h3>Ingeniero de RF diseñando amplificadores</h3>
              </div>
              <p className={styles.escenarioExample}>
                Diseño de un LNA (Low Noise Amplifier) para banda 5G sub-6GHz (3,5 GHz). Nivel de entrada esperado: -90 dBm (señal del aire). Ganancia del LNA: 20 dB. Salida: -70 dBm. Figura de ruido del LNA: 1,5 dB. Piso de ruido del sistema: -174 dBm/Hz + 10·log(200 kHz BW) + 1,5 dB = -119,5 dBm. Margen SNR: -70 - (-119,5) = 49,5 dB. Diseño viable.
              </p>
              <p className={styles.escenarioTip}>
                En diseño RF, cada dB cuenta. Un conector mal soldado puede añadir 0,5 dB de pérdidas y degradar la figura de ruido de todo el sistema.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">📺</span>
                <h3>Técnico de instalaciones TV/satélite</h3>
              </div>
              <p className={styles.escenarioExample}>
                Instalación de TDT en edificio de 20 pisos. Señal de entrada en cabecera: 75 dBµV. Cable utilizado: RG-6 con pérdidas de 8 dB/10m a 800 MHz. Distribuidor de 8 salidas: 12 dB de pérdida de inserción. Derivador por planta: 1,5 dB. Con 5 plantas hasta el piso 15 y 30 m de cable: 75 - 12 (distribuidor) - 2,4 (cable) - 7,5 (derivadores) = 53,1 dBµV. Nivel mínimo DVB-T2: 45 dBµV. Sistema válido.
              </p>
              <p className={styles.escenarioTip}>
                Normativa ICT (RD 346/2011): el nivel mínimo de señal en toma de usuario debe estar entre 45 y 80 dBµV para TV terrestre.
              </p>
            </div>
          </div>
        </section>

        {/* SECCIÓN 3: FAQ */}
        <section className={styles.guideSection}>
          <h2>Preguntas Frecuentes sobre Unidades RF</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h3>¿Qué es el dBm y por qué se usa en telecomunicaciones?</h3>
              <p>
                El dBm (decibelio-milivatio) expresa potencia en escala logarítmica referenciada a 1 mW: dBm = 10 × log₁₀(P/1mW). Se usa porque las señales RF abarcan rangos enormes (desde -174 dBm del ruido térmico hasta +60 dBm de una emisora) que serían impracticables en escala lineal. Además, las ganancias y pérdidas en cascada se calculan con simples sumas y restas, no con multiplicaciones.
              </p>
              <p className={styles.faqTip}>Ejemplo: Transmisor 30 dBm + cable -3 dB + antena +8 dBi = PIRE 35 dBm (3,16 W).</p>
            </div>

            <div className={styles.faqItem}>
              <h3>¿Cuál es la diferencia entre dBm y dBW?</h3>
              <p>
                Ambos miden potencia en escala logarítmica pero con distinta referencia. dBm usa 1 mW como referencia; dBW usa 1 W. La conversión es directa: <strong>dBW = dBm - 30</strong>. Por ejemplo, 30 dBm equivale exactamente a 0 dBW (ambos son 1 W). En teleco españoles, los analizadores de espectro suelen mostrar dBm; los cálculos de radioenlaces y satélite usan dBW por tratarse de potencias superiores a 1 W.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3>¿Cómo se calcula la ganancia total de un sistema RF?</h3>
              <p>
                En dB, la ganancia total es la suma algebraica de todas las ganancias y pérdidas de la cadena: G_total (dB) = G₁ + G₂ + ... - L₁ - L₂ - ... Un ejemplo de link budget LTE: PIRE transmisor (+43 dBm) - pérdida de propagación en espacio libre (-120 dB a 1 km, 2,1 GHz) + ganancia antena receptora (+2 dBi) - pérdidas de cable receptor (-2 dB) = nivel en receptor: -77 dBm. Si la sensibilidad del equipo es -100 dBm, el margen es de 23 dB.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3>¿Qué es el VSWR y cuáles son los valores aceptables?</h3>
              <p>
                El VSWR (Voltage Standing Wave Ratio) mide la adaptación de impedancias entre una línea de transmisión (generalmente 50 Ω) y la carga (antena). Un VSWR de 1:1 es perfecto (sin reflexión). Los valores aceptables según aplicación:
              </p>
              <ul>
                <li><strong>VSWR &lt; 1,2:1</strong> — Excelente, para sistemas críticos (radar, satélite)</li>
                <li><strong>VSWR &lt; 1,5:1</strong> — Muy bueno, estándar profesional (Return Loss &gt; 14 dB)</li>
                <li><strong>VSWR &lt; 2:1</strong> — Aceptable, uso general (Return Loss &gt; 9,5 dB, reflexión 11%)</li>
                <li><strong>VSWR &lt; 3:1</strong> — Límite para equipos 50 Ω sin daños en el PA</li>
                <li><strong>VSWR &gt; 3:1</strong> — Problema serio, riesgo de daño al amplificador de potencia</li>
              </ul>
            </div>

            <div className={styles.faqItem}>
              <h3>¿Cómo se relacionan la longitud de onda y la frecuencia?</h3>
              <p>
                La relación es inversa: λ (m) = c / f, donde c = 299.792.458 m/s (velocidad de la luz en el vacío). En medios físicos (cable coaxial, guía de onda), hay que aplicar el factor de velocidad del medio (VF, típicamente 0,66 a 0,85 para cables coaxiales). Ejemplos prácticos en España: FM (100 MHz → λ = 3 m, antena dipolo 1,5 m), DAB+ (225 MHz → λ = 1,33 m), 4G Band 20 (800 MHz → λ = 37,5 cm), WiFi 2,4 GHz (λ = 12,5 cm), 5G mmWave 28 GHz (λ = 10,7 mm).
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3>¿Qué es el nivel de ruido en receptores y cómo afecta al rendimiento?</h3>
              <p>
                El piso de ruido térmico es -174 dBm/Hz a 290 K (temperatura de referencia ITU). Para un ancho de banda B: N₀ = -174 + 10·log₁₀(B) + NF, donde NF es la figura de ruido del receptor en dB. Un receptor LTE con BW de 10 MHz (70 dB·Hz) y NF = 7 dB tiene un piso de ruido de -174 + 70 + 7 = -97 dBm. La sensibilidad real requiere además un margen de SNR mínimo (típicamente 10-15 dB), resultando en una sensibilidad de -82 a -87 dBm.
              </p>
              <p className={styles.faqTip}>Para mejorar la sensibilidad: reducir la figura de ruido del LNA (cada dB de NF mejora directamente la sensibilidad 1 dB) o reducir el ancho de banda si la modulación lo permite.</p>
            </div>

            <div className={styles.faqItem}>
              <h3>¿Cuáles son las pérdidas típicas en cable coaxial?</h3>
              <p>
                Las pérdidas en cables coaxiales comunes (por cada 10 metros) a distintas frecuencias:
              </p>
              <ul>
                <li><strong>RG-58 (3 mm):</strong> 3 dB/10m a 100 MHz, 6 dB a 400 MHz, 20 dB a 2,4 GHz</li>
                <li><strong>RG-213 (10 mm):</strong> 1 dB/10m a 100 MHz, 2 dB a 400 MHz, 6 dB a 2,4 GHz</li>
                <li><strong>RG-6 (coaxial TV/SAT):</strong> 0,8 dB/10m a 100 MHz, 2,5 dB a 800 MHz, 5 dB a 2,15 GHz</li>
                <li><strong>LMR-400:</strong> 0,7 dB/10m a 450 MHz, 1,3 dB a 900 MHz, 2,1 dB a 2,4 GHz</li>
                <li><strong>Heliax 7/8&quot;:</strong> 0,15 dB/10m a 900 MHz, 0,4 dB a 2,4 GHz</li>
              </ul>
              <p className={styles.faqTip}>Regla práctica: duplicar la frecuencia aumenta las pérdidas aproximadamente 1,4 veces (raíz cuadrada de la frecuencia).</p>
            </div>

            <div className={styles.faqItem}>
              <h3>¿Cómo convertir potencia (dBm) a campo eléctrico (dBµV/m)?</h3>
              <p>
                La conversión depende de la distancia y la ganancia de antena. Para una antena isótropa en espacio libre: E (dBµV/m) = PIRE (dBm) + 20·log₁₀(f MHz) - 20·log₁₀(d m) - 77,2. Ejemplo: transmisor de 10 dBm (10 mW) con antena isótropa a 100 m y 900 MHz: E = 10 + 59,1 - 40 - 77,2 = -48,1 dBµV/m. Para mediciones de compatibilidad electromagnética (EMC/CEM), la normativa CISPR y la UNE-EN 55032 especifican límites en dBµV/m a distancias de 10 o 30 metros.
              </p>
            </div>
          </div>
        </section>

        {/* SECCIÓN 4: Guía Paso a Paso */}
        <section className={styles.guideSection}>
          <h2>Guía Paso a Paso: Medir y Analizar una Instalación RF</h2>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">1</div>
              <div className={styles.stepContent}>
                <h3>Identificar la fuente y el tipo de señal</h3>
                <p>
                  Determina la frecuencia de trabajo (HF 3-30 MHz, VHF 30-300 MHz, UHF 300 MHz-3 GHz, SHF 3-30 GHz), la impedancia del sistema (50 Ω en RF profesional, 75 Ω en TV/SAT/cable) y la potencia nominal del transmisor en dBm o W. Consulta la documentación del equipo o la hoja de datos del fabricante.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">2</div>
              <div className={styles.stepContent}>
                <h3>Calcular el presupuesto de enlace (Link Budget)</h3>
                <p>
                  Suma algebraica en dB: Potencia TX (dBm) + Ganancia antena TX (dBi) - Pérdidas en cable TX (dB) - Pérdida de propagación (dB) + Ganancia antena RX (dBi) - Pérdidas cable RX (dB) = Nivel en receptor (dBm). Compara el resultado con la sensibilidad del receptor para obtener el margen del sistema. Un margen mínimo de 10-15 dB es recomendable para instalaciones fijas.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">3</div>
              <div className={styles.stepContent}>
                <h3>Verificar la adaptación de impedancias con el medidor de VSWR</h3>
                <p>
                  Con el reflectómetro o analizador de antenas (ej. NanoVNA, RigExpert AA-55 Zoom), mide el VSWR en la frecuencia de trabajo con la antena conectada. Objetivo: VSWR &lt; 1,5:1. Si el VSWR es mayor, ajusta la longitud de la antena (+/- longitud para subir/bajar la frecuencia de resonancia) o usa un ATU (Automatic Tuning Unit). Anota también el Return Loss y la resistencia e reactancia en la frecuencia de interés.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">4</div>
              <div className={styles.stepContent}>
                <h3>Medir las pérdidas reales del cable y conectores</h3>
                <p>
                  Con un analizador de redes o medidor de pérdidas de inserción, mide la atenuación del cable a la frecuencia de trabajo. Compara con los valores del fabricante; si la pérdida es mayor en más de 1-2 dB, revisa los conectores (corrosión, soldaduras frías, conectores mal crimpados). Un conector PL-259 mal instalado puede añadir hasta 2-3 dB de pérdidas extra.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">5</div>
              <div className={styles.stepContent}>
                <h3>Medir el nivel de señal en el punto de recepción</h3>
                <p>
                  Con el analizador de espectro o un medidor de campo (para instalaciones TV/SAT), mide el nivel en dBm o dBµV en el punto de conexión del receptor. Para TDT: el nivel debe estar entre 45 y 80 dBµV en la toma de usuario (normativa ICT, RD 346/2011). Para LTE/5G: el RSSI debe superar el umbral de sensibilidad del equipo terminal en al menos 10-20 dB.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">6</div>
              <div className={styles.stepContent}>
                <h3>Evaluar la relación señal/ruido (SNR) y la figura de ruido</h3>
                <p>
                  El SNR mínimo depende de la modulación utilizada: BPSK requiere ~10 dB, 16-QAM ~20 dB, 256-QAM ~30 dB, 1024-QAM ~38 dB. Para DVB-T2 con 256-QAM y code rate 3/5, el umbral de SNR es aproximadamente 20 dB. Mide el SNR real con el analizador de espectro o el propio receptor (muchos equipos profesionales muestran MER o SNR en su interfaz de diagnóstico).
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">7</div>
              <div className={styles.stepContent}>
                <h3>Documentar y verificar niveles en el receptor final</h3>
                <p>
                  Redacta un informe con: frecuencia de trabajo, potencia TX, VSWR medido, pérdidas de cable, nivel de señal en receptor (dBm o dBµV), SNR medido y margen de sistema. Verifica que todos los valores cumplen la normativa aplicable (ICT para instalaciones en edificios, RD 123/2017 para el espacio radioeléctrico, plan técnico nacional de TDT). Archiva las mediciones con fecha y equipo de medida usado (número de serie, fecha de calibración).
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECCIÓN 5: Mejores Prácticas */}
        <section className={styles.guideSection}>
          <h2>Mejores Prácticas para Trabajo con Señales RF</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🎯</span>
              <h3>Define siempre el punto de referencia</h3>
              <p>
                Antes de anotar cualquier medición, especifica el punto físico donde se midió (entrada del receptor, salida del transmisor, toma de usuario). Una diferencia de 3 dB entre mediciones puede deberse simplemente a que un técnico midió antes del cable y otro después. Usa etiquetas como &quot;-45 dBm en SMA de salida PA&quot;.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🌡️</span>
              <h3>Compensa la variación térmica en mediciones críticas</h3>
              <p>
                Los cables coaxiales y conectores varían su atenuación con la temperatura: aproximadamente +0,002 dB/°C por cada 10 m de RG-213. En instalaciones al aire libre en España (verano: +40°C, invierno: -5°C, rango de 45°C), un tramo de 50 m de cable puede variar hasta 0,5 dB entre estaciones. Para sistemas con margen ajustado (&lt; 5 dB), calibra en las condiciones de temperatura más desfavorables.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔌</span>
              <h3>Termina siempre los puertos no usados con cargas de 50 Ω</h3>
              <p>
                Un puerto sin terminar de un divisor de potencia o un acoplador puede reflejar hasta el 100% de la señal (VSWR infinito), degradando el VSWR de todo el sistema. Usa siempre cargas terminadoras de 50 Ω (o 75 Ω en sistemas de TV) en los puertos no conectados. Una carga de buena calidad debe mantener VSWR &lt; 1,1:1 hasta la frecuencia de trabajo.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📏</span>
              <h3>Calibra el equipo de medida antes de cada sesión</h3>
              <p>
                Los analizadores de espectro y los reflectómetros requieren calibración previa al uso: ajuste de nivel con señal de referencia conocida (ej. -20 dBm ± 0,5 dB), corrección del factor de calibración del cable de medida y compensación de la pérdida de inserción de los adaptadores. La IEC 61169 recomienda recalibrar los equipos de medida RF al menos cada 12 meses; en campo, una verificación diaria con señal de referencia es suficiente.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">⚡</span>
              <h3>Respeta los límites de potencia de entrada de los instrumentos</h3>
              <p>
                La mayoría de analizadores de espectro portátiles tienen un límite de entrada de +30 dBm (1 W). Superar este nivel puede dañar irreversiblemente el mezclador de entrada. Antes de conectar un transmisor al analizador, siempre usa un atenuador calibrado. Para transmisores de &gt; 5 W (+37 dBm), usa como mínimo un acoplador direccional de 20-30 dB y verifica que el nivel residual esté por debajo de +20 dBm.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📋</span>
              <h3>Documenta el link budget antes de cualquier instalación</h3>
              <p>
                Un link budget completo incluye: potencia TX (dBm), ganancia de antena TX (dBi), pérdidas totales de cable TX (dB), modelo de propagación (Friis, Okumura-Hata, COST-231), pérdidas adicionales por edificios/vegetación (dB), ganancia de antena RX (dBi), pérdidas cable RX (dB), figura de ruido del receptor (dB), ancho de banda (MHz) y margen de desvanecimiento (dB). Para instalaciones ICT en España, el cálculo debe cumplir el Reglamento ICT aprobado por RD 346/2011.
              </p>
            </div>
          </div>
        </section>

        {/* SECCIÓN 6: Warning Box */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox} role="alert">
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <h2>Errores Comunes en el Trabajo con RF</h2>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Confundir dBm con dB (ganancia relativa):</strong> El dBm es una unidad absoluta de potencia; el dB es una ratio adimensional. Sumar 30 dBm + 30 dBm no da 60 dBm: dos señales de 30 dBm combinadas en cuadratura dan 33 dBm (el doble de potencia lineal = +3 dB). Solo se pueden sumar dBm y dB cuando el dB representa una ganancia o pérdida aplicada a esa potencia.
              </li>
              <li>
                <strong>VSWR fuera de rango sin protección del amplificador:</strong> Muchos amplificadores de potencia de estado sólido (PA) tienen protección automática de VSWR, pero esta protección actúa reduciendo la potencia de salida, no eliminando la reflexión. Con VSWR &gt; 3:1, los PA sin circuito de protección pueden dañarse permanentemente por la tensión de pico reflejada. Comprueba siempre el VSWR antes de aplicar potencia, especialmente en antenas resonantes ajustadas manualmente.
              </li>
              <li>
                <strong>No compensar las pérdidas del cable en el cálculo de PIRE:</strong> La Potencia Isótropa Radiada Equivalente (PIRE) se calcula en la entrada de la antena, no en la salida del transmisor. Si el transmisor da 43 dBm y el cable tiene 3 dB de pérdidas, la PIRE con una antena de +8 dBi es 43 - 3 + 8 = 48 dBm (63 W PIRE), no 51 dBm. Error frecuente en declaraciones de conformidad ante la CNAF (Cuadro Nacional de Atribución de Frecuencias).
              </li>
              <li>
                <strong>Mezclar referencias dBm y dBW sin conversión:</strong> En proyectos de radioenlaces o satélite que mezclan equipos americanos (dBm) y estándares ITU (dBW), es fácil cometer errores de 30 dB en los cálculos. Establece una única unidad base en el link budget y convierte siempre explícitamente: 0 dBW = +30 dBm, 10 dBW = +40 dBm, etc. Un error de 30 dB equivale a un factor de 1000 en potencia lineal.
              </li>
              <li>
                <strong>Polarización incorrecta de antena:</strong> Una antena linealmente polarizada (horizontal o vertical) conectada con 90° de error respecto al transmisor sufrirá una pérdida de polarización de hasta 20-30 dB en campo lejano (teóricamente infinita para polarizaciones ortogonales puras). En instalaciones TDT, la polarización de la antena transmisora está especificada en el Plan Técnico Nacional (generalmente horizontal en España para la banda UHF). Verifica la polarización en el BOE correspondiente a la demarcación geográfica.
              </li>
              <li>
                <strong>Interferencias por armónicos del transmisor:</strong> Los transmisores no ideales generan armónicos a 2f, 3f, etc. Un transmisor de 144 MHz puede emitir energía espuria a 288 MHz (2º armónico), 432 MHz (3º armónico) y 576 MHz (4º armónico). Sin filtro paso-bajo a la salida, estos armónicos pueden interferir con servicios como TDT (470-790 MHz), 4G Band 12 (700 MHz) o el satélite NOAA (137 MHz con el 1º subarmónico). La normativa ETSI EN 300 086 exige que los armónicos estén al menos 60 dB por debajo de la portadora para equipos de radiocomunicación profesional.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('conversor-unidades-rf')} />
      <ShareCard appName="conversor-unidades-rf" />
      <Footer appName="conversor-unidades-rf" />
    </div>
  );
}
