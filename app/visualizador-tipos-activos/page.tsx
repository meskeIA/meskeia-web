'use client';

import { useState } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import DisclaimerCard from '@/components/DisclaimerCard';
import { getRelatedApps } from '@/data/app-relations';
import { jsonLd } from './metadata';
import styles from './VisualizadorTiposActivos.module.css';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

interface ClaseActivo {
  id: string;
  nombre: string;
  emoji: string;
  color: string;
  subtitulo: string;
  descripcion: string;
  ejemplos: string[];
  rentabilidadNominal: string;
  rentabilidadReal: string;
  volatilidad: string;
  calidaMax: string;
  horizonte: string;
  liquidez: 'muy alta' | 'alta' | 'media' | 'baja' | 'muy baja';
  barrEntrada: string;
  proteccionInflacion: 'muy buena' | 'buena' | 'neutral' | 'mala' | 'muy mala';
  ventajas: string[];
  riesgos: string[];
}

interface AsignacionCartera {
  activoId: string;
  porcentaje: number;
}

interface CarteraTipo {
  nombre: string;
  descripcion: string;
  perfilRiesgo: string;
  horizonte: string;
  asignacion: AsignacionCartera[];
  rentabilidadEsperada: string;
  volatilidad: string;
}

// ─────────────────────────────────────────────
// Datos
// ─────────────────────────────────────────────

const CLASES_ACTIVOS: ClaseActivo[] = [
  {
    id: 'acciones',
    nombre: 'Acciones',
    emoji: '📈',
    color: '#2E86AB',
    subtitulo: 'Renta variable · Bolsa global',
    descripcion:
      'Participaciones en el capital de empresas cotizadas. Al comprar una acción te conviertes en propietario de una fracción de la empresa y participas en sus beneficios y pérdidas.',
    ejemplos: [
      'ETF MSCI World (Vanguard, iShares)',
      'ETF S&P 500',
      'Fondos indexados globales',
      'Acciones individuales (Apple, LVMH, Inditex)',
    ],
    rentabilidadNominal: '~8-10% anual en USD (MSCI World 1972-2024) · ~7-8% estimado en EUR',
    rentabilidadReal: '~5-6% anual real en EUR · estimaciones prospectivas 2024: 4-6%',
    volatilidad: '~15-17% desviación estándar anual',
    calidaMax: '-54% (crisis 2008-2009) · -34% (COVID marzo 2020)',
    horizonte: '7-10+ años',
    liquidez: 'muy alta',
    barrEntrada: 'Desde 1 € (ETF fraccionado)',
    proteccionInflacion: 'buena',
    ventajas: [
      'Mayor rentabilidad histórica a largo plazo de todas las clases',
      'Alta liquidez: puedes vender en cualquier sesión bursátil',
      'Diversificación global accesible desde muy poco capital con ETF',
    ],
    riesgos: [
      'Alta volatilidad: caídas del 30-50% son históricamente normales',
      'Requiere horizonte largo: quien vendió en 2009 perdió la recuperación',
      'Riesgo divisa si inviertes en activos extranjeros sin cobertura',
    ],
  },
  {
    id: 'bonos',
    nombre: 'Bonos',
    emoji: '🏛️',
    color: '#48A9A6',
    subtitulo: 'Renta fija · Deuda soberana y corporativa',
    descripcion:
      'Préstamos a gobiernos o empresas a cambio de un tipo de interés fijo. El emisor devuelve el principal al vencimiento. Son el contrapeso tradicional de las acciones en una cartera.',
    ejemplos: [
      'Letras del Tesoro español',
      'Bonos del Estado a 10 años',
      'ETF renta fija europea (iShares Core Euro Gov)',
      'Fondos monetarios (EURIBOR +)',
    ],
    rentabilidadNominal: '~3-4% anual histórico (zona euro) · ~2-3% actual (BCE bajando tipos 2025)',
    rentabilidadReal: '~0-1% anual real · negativa en periodos de inflación alta',
    volatilidad: '~5-8% (soberanos) · ~3% (corto plazo)',
    calidaMax: '-18% (bonos largos en 2022, subida de tipos BCE)',
    horizonte: '1-5 años (corto) · 5-10 años (largo plazo)',
    liquidez: 'alta',
    barrEntrada: 'Desde 1.000 € (Tesoro directo) · 1 € (ETF)',
    proteccionInflacion: 'mala',
    ventajas: [
      'Menor volatilidad que las acciones: amortigua caídas de la cartera',
      'Renta predecible: el cupón se cobra con independencia del mercado',
      'Correlación negativa o baja con acciones en crisis económicas normales',
    ],
    riesgos: [
      'Sensibles a las subidas de tipos: cuando suben tipos, bajan los precios de los bonos',
      'Rendimiento real negativo en periodos de inflación alta (2021-2023)',
      'Riesgo de impago en bonos corporativos de baja calificación (high yield)',
    ],
  },
  {
    id: 'inmobiliario',
    nombre: 'Inmobiliario',
    emoji: '🏘️',
    color: '#E07B54',
    subtitulo: 'Real estate · Vivienda y REITs',
    descripcion:
      'Inversión en propiedades físicas o en fondos que invierten en ellas (REITs). Combina rentas periódicas (alquiler) con revalorización del inmueble.',
    ejemplos: [
      'Vivienda en alquiler (directo)',
      'REITs (Realty Income, Vonovia)',
      'ETF inmobiliario europeo (Amundi Real Estate)',
      'Socimis españolas (Colonial, Merlin)',
    ],
    rentabilidadNominal: '~5-7% anual (REITs globales 1990-2024; fuerte peso EE.UU.)',
    rentabilidadReal: '~2-4% anual real (muy variable según región y periodo)',
    volatilidad: '~14-16% (REITs) · baja (inmueble directo, valoración anual)',
    calidaMax: '-65% en REITs (2008) · -30% en precio vivienda España (2007-2013)',
    horizonte: '10+ años (directo) · 5+ años (REITs)',
    liquidez: 'muy baja',
    barrEntrada: 'Alta (compra directa: 50.000-200.000 €+) · Baja (REITs desde 1 €)',
    proteccionInflacion: 'buena',
    ventajas: [
      'Renta periódica por alquiler: flujo de caja relativamente estable',
      'Cobertura parcial frente a inflación: los alquileres suelen subir con el IPC',
      'Activo tangible: da seguridad psicológica que los activos financieros no tienen',
    ],
    riesgos: [
      'Liquidez muy baja en inmueble directo: vender puede llevar meses',
      'Gestión activa necesaria (inquilinos, mantenimiento, impuestos locales)',
      'Concentración geográfica: el riesgo no se diversifica fácilmente',
    ],
  },
  {
    id: 'materias-primas',
    nombre: 'Materias Primas',
    emoji: '🥇',
    color: '#C9A84C',
    subtitulo: 'Commodities · Oro, petróleo, agrícolas',
    descripcion:
      'Recursos físicos con precio determinado por oferta y demanda global. El oro es el más usado como reserva de valor y cobertura; el petróleo y las agrícolas tienen uso industrial y alimentario.',
    ejemplos: [
      'Oro físico (monedas, lingotes)',
      'ETF oro (iShares Physical Gold)',
      'ETF materias primas diversificadas',
      'Futuros petróleo (uso avanzado)',
    ],
    rentabilidadNominal: '~2-5% anual nominal (muy dependiente del periodo; 1971 fue inicio anómalo por fin del patrón oro)',
    rentabilidadReal: '~0-2% anual real a largo plazo · décadas enteras con retornos negativos',
    volatilidad: '~15% (oro) · ~30-40% (petróleo) · ~20% (índice diversificado)',
    calidaMax: '-45% (oro 2011-2015) · -80% (petróleo 2014-2016)',
    horizonte: '5-10+ años',
    liquidez: 'alta',
    barrEntrada: 'Desde 1 € (ETF) · ~50 € (moneda de oro)',
    proteccionInflacion: 'muy buena',
    ventajas: [
      'Cobertura histórica frente a inflación y depreciación de monedas',
      'El oro tiene baja correlación con acciones: reduce el riesgo de cartera',
      'Activo refugio en crisis geopolíticas y financieras extremas',
    ],
    riesgos: [
      'No genera ingresos propios (sin dividendo ni cupón): rentabilidad solo por precio',
      'Alta volatilidad en materias primas industriales (petróleo, gas)',
      'El oro puede estar años o décadas en rentabilidad real negativa',
    ],
  },
  {
    id: 'cripto',
    nombre: 'Criptomonedas',
    emoji: '₿',
    color: '#F7931A',
    subtitulo: 'Activo digital · Bitcoin, Ethereum y altcoins',
    descripcion:
      'Activos digitales basados en tecnología blockchain. Bitcoin funciona como reserva de valor digital con oferta limitada; Ethereum como plataforma de contratos inteligentes. Alta volatilidad y perfil especulativo.',
    ejemplos: [
      'Bitcoin (BTC)',
      'Ethereum (ETH)',
      'ETF Bitcoin spot (BlackRock iShares Bitcoin)',
      'Criptomonedas en exchanges regulados',
    ],
    rentabilidadNominal: 'Muy variable: +1.000% en años alcistas · -75% en ciclos bajistas',
    rentabilidadReal: 'Sin historia suficiente para estimar fiablemente (Bitcoin: 2009)',
    volatilidad: '~70-80% (Bitcoin anualizada) · Mayor en altcoins',
    calidaMax: '-84% (Bitcoin 2017-2018) · -77% (2021-2022)',
    horizonte: '5+ años si se asume como reserva de valor',
    liquidez: 'alta',
    barrEntrada: 'Desde 10 € (en exchanges regulados)',
    proteccionInflacion: 'neutral',
    ventajas: [
      'Potencial de rentabilidad muy alto en ciclos alcistas',
      'Activo no correlacionado con el sistema financiero tradicional',
      'Bitcoin: oferta limitada a 21 millones de unidades por protocolo',
    ],
    riesgos: [
      'Volatilidad extrema: caídas del 70-80% son históricamente frecuentes',
      'Sin respaldo de activo físico ni flujo de caja: el precio es puramente expectativa',
      'Riesgo regulatorio: cambios legales pueden afectar su valor y uso',
    ],
  },
  {
    id: 'efectivo',
    nombre: 'Efectivo y Equivalentes',
    emoji: '💶',
    color: '#5BA05A',
    subtitulo: 'Liquidez · Depósitos, letras y fondos monetarios',
    descripcion:
      'Dinero en cuenta o instrumentos de muy corto plazo (letras del Tesoro, fondos monetarios, depósitos). Rentabilidad ligada al tipo de referencia del banco central. Máxima seguridad, mínima rentabilidad real.',
    ejemplos: [
      'Cuenta remunerada (Trade Republic, ING)',
      'Letras del Tesoro a 3-12 meses',
      'Fondos monetarios EURIBOR',
      'Depósitos a plazo fijo',
    ],
    rentabilidadNominal: '~2-3% actual (BCE bajando tipos desde 2024) · históricamente muy variable',
    rentabilidadReal: 'Muy baja o negativa en periodos de inflación alta',
    volatilidad: '~0% (la más baja de todas las clases)',
    calidaMax: '0% nominal · rentabilidad real negativa en inflación alta',
    horizonte: 'Corto plazo · Fondo de emergencia (3-6 meses gastos)',
    liquidez: 'muy alta',
    barrEntrada: 'Desde 1 €',
    proteccionInflacion: 'muy mala',
    ventajas: [
      'Máxima seguridad nominal: garantía FGD hasta 100.000 € por entidad',
      'Liquidez inmediata: disponible en cualquier momento sin penalización',
      'Cero volatilidad: ideal como fondo de emergencia o reserva táctica',
    ],
    riesgos: [
      'Erosión del poder adquisitivo en periodos de inflación (2021-2023: -10% real)',
      'Rentabilidad real negativa histórica en la mayoría de décadas',
      'No aprovecha el crecimiento económico a largo plazo',
    ],
  },
];

// Correlaciones aproximadas a largo plazo (1990-2024)
const CORRELACIONES: Record<string, Record<string, number>> = {
  acciones:          { acciones: 1.00, bonos: -0.15, inmobiliario: 0.60, 'materias-primas': 0.10, cripto: 0.25, efectivo: 0.00 },
  bonos:             { acciones: -0.15, bonos: 1.00, inmobiliario: 0.10, 'materias-primas': -0.05, cripto: -0.10, efectivo: 0.05 },
  inmobiliario:      { acciones: 0.60, bonos: 0.10, inmobiliario: 1.00, 'materias-primas': 0.15, cripto: 0.10, efectivo: 0.00 },
  'materias-primas': { acciones: 0.10, bonos: -0.05, inmobiliario: 0.15, 'materias-primas': 1.00, cripto: 0.05, efectivo: 0.00 },
  cripto:            { acciones: 0.25, bonos: -0.10, inmobiliario: 0.10, 'materias-primas': 0.05, cripto: 1.00, efectivo: 0.00 },
  efectivo:          { acciones: 0.00, bonos: 0.05, inmobiliario: 0.00, 'materias-primas': 0.00, cripto: 0.00, efectivo: 1.00 },
};

const CARTERAS: CarteraTipo[] = [
  {
    nombre: 'Defensiva',
    descripcion: 'Preservar capital con mínima volatilidad. Prioriza estabilidad sobre rentabilidad.',
    perfilRiesgo: 'Conservador',
    horizonte: '1-3 años',
    asignacion: [
      { activoId: 'efectivo', porcentaje: 20 },
      { activoId: 'bonos', porcentaje: 50 },
      { activoId: 'acciones', porcentaje: 20 },
      { activoId: 'inmobiliario', porcentaje: 10 },
    ],
    rentabilidadEsperada: '~3-5% anual',
    volatilidad: '~5-7%',
  },
  {
    nombre: 'Equilibrada',
    descripcion: 'Balance entre crecimiento y estabilidad. La asignación clásica 60/40 modernizada.',
    perfilRiesgo: 'Moderado',
    horizonte: '5-7 años',
    asignacion: [
      { activoId: 'acciones', porcentaje: 40 },
      { activoId: 'bonos', porcentaje: 30 },
      { activoId: 'inmobiliario', porcentaje: 15 },
      { activoId: 'materias-primas', porcentaje: 10 },
      { activoId: 'efectivo', porcentaje: 5 },
    ],
    rentabilidadEsperada: '~4-6% anual (estimación en euros)',
    volatilidad: '~9-11%',
  },
  {
    nombre: 'Crecimiento',
    descripcion: 'Maximizar rentabilidad a largo plazo aceptando mayor volatilidad.',
    perfilRiesgo: 'Dinámico',
    horizonte: '10+ años',
    asignacion: [
      { activoId: 'acciones', porcentaje: 60 },
      { activoId: 'inmobiliario', porcentaje: 15 },
      { activoId: 'bonos', porcentaje: 10 },
      { activoId: 'materias-primas', porcentaje: 10 },
      { activoId: 'efectivo', porcentaje: 5 },
    ],
    rentabilidadEsperada: '~5-7% anual (estimación en euros)',
    volatilidad: '~12-14%',
  },
  {
    nombre: 'Especulativa',
    descripcion: 'Alto potencial de rentabilidad con riesgo muy elevado. No apta para la mayoría.',
    perfilRiesgo: 'Agresivo',
    horizonte: '10+ años (con tolerancia a caídas del 50%+)',
    asignacion: [
      { activoId: 'acciones', porcentaje: 50 },
      { activoId: 'cripto', porcentaje: 20 },
      { activoId: 'inmobiliario', porcentaje: 15 },
      { activoId: 'materias-primas', porcentaje: 10 },
      { activoId: 'efectivo', porcentaje: 5 },
    ],
    rentabilidadEsperada: 'Muy variable: desde -50% a +30%+ anual',
    volatilidad: '~20-25%+',
  },
];

// ─────────────────────────────────────────────
// Utilidades
// ─────────────────────────────────────────────

function liquidezEmoji(nivel: ClaseActivo['liquidez']): string {
  const mapa: Record<ClaseActivo['liquidez'], string> = {
    'muy alta': '🟢🟢',
    alta: '🟢',
    media: '🟡',
    baja: '🔴',
    'muy baja': '🔴🔴',
  };
  return mapa[nivel];
}

function proteccionEmoji(nivel: ClaseActivo['proteccionInflacion']): string {
  const mapa: Record<ClaseActivo['proteccionInflacion'], string> = {
    'muy buena': '🟢🟢',
    buena: '🟢',
    neutral: '🟡',
    mala: '🔴',
    'muy mala': '🔴🔴',
  };
  return mapa[nivel];
}

function colorCorrelacion(valor: number): string {
  if (valor === 1.0) return '#9ca3af'; // diagonal: gris
  if (valor > 0.5) return '#fca5a5';  // alta: rojo suave
  if (valor > 0.1) return '#fde68a';  // media-alta: amarillo
  if (valor >= -0.1) return '#d1fae5'; // baja: verde muy claro
  return '#86efac'; // negativa: verde
}

function getActivo(id: string): ClaseActivo | undefined {
  return CLASES_ACTIVOS.find((a) => a.id === id);
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorTiposActivosPage() {
  const [tabActivo, setTabActivo] = useState<number>(0);
  const [claseSeleccionada, setClaseSeleccionada] = useState<string | null>(null);

  const activo = claseSeleccionada ? getActivo(claseSeleccionada) : null;
  const activoIdx = claseSeleccionada
    ? CLASES_ACTIVOS.findIndex((a) => a.id === claseSeleccionada)
    : -1;

  const seleccionarClase = (id: string) => {
    setClaseSeleccionada(id);
    setTabActivo(1);
  };

  const irAnterior = () => {
    if (activoIdx > 0) {
      setClaseSeleccionada(CLASES_ACTIVOS[activoIdx - 1].id);
    }
  };

  const irSiguiente = () => {
    if (activoIdx < CLASES_ACTIVOS.length - 1) {
      setClaseSeleccionada(CLASES_ACTIVOS[activoIdx + 1].id);
    }
  };

  const TABS = ['Las 6 clases', 'Clase en detalle', 'Correlación', 'Carteras tipo'];

  return (
    <>
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        {/* Hero */}
        <header className={styles.hero}>
          <h1 className={styles.titulo}>📊 Las 6 Clases de Activos</h1>
          <p className={styles.subtitulo}>
            Rentabilidad histórica, volatilidad, liquidez y correlación. Compara las grandes
            familias de inversión y descubre cómo combinarlas en una cartera equilibrada.
          </p>
        </header>

        <main className={styles.main}>
          <LegalNotice />

          {/* Disclaimer financiero — severity high, no colapsable */}
          <DisclaimerCard
            variant="financial"
            severity="high"
            collapsible={false}
          />

          {/* Navegación por tabs */}
          <div className={styles.tabsNav} role="tablist" aria-label="Secciones del visualizador">
            {TABS.map((nombre, idx) => (
              <button
                key={nombre}
                role="tab"
                aria-selected={tabActivo === idx}
                className={`${styles.tabBtn} ${tabActivo === idx ? styles.tabBtnActivo : ''}`}
                onClick={() => setTabActivo(idx)}
              >
                {nombre}
              </button>
            ))}
          </div>

          {/* ── Tab 1: Las 6 clases ── */}
          {tabActivo === 0 && (
            <section className={styles.seccion} aria-label="Las 6 clases de activos">
              <div className={styles.gridClases}>
                {CLASES_ACTIVOS.map((clase) => (
                  <button
                    key={clase.id}
                    className={styles.tarjetaClase}
                    style={{ borderLeftColor: clase.color }}
                    onClick={() => seleccionarClase(clase.id)}
                    aria-label={`Ver detalle de ${clase.nombre}`}
                  >
                    <div className={styles.tarjetaHeader}>
                      <span className={styles.tarjetaEmoji} aria-hidden="true">
                        {clase.emoji}
                      </span>
                      <div>
                        <div className={styles.tarjetaNombre}>{clase.nombre}</div>
                        <div className={styles.tarjetaSubtitulo}>{clase.subtitulo}</div>
                      </div>
                    </div>
                    <div className={styles.tarjetaBadges}>
                      <span className={styles.badge} style={{ background: clase.color + '22', color: clase.color }}>
                        {clase.rentabilidadNominal.split('(')[0].trim()}
                      </span>
                      <span className={styles.badge}>
                        Volatilidad: {clase.volatilidad.split('~')[1]?.split(' ')[0] ?? clase.volatilidad}
                      </span>
                      <span className={styles.badge}>
                        Horizonte: {clase.horizonte}
                      </span>
                    </div>
                    <div className={styles.tarjetaCta}>Ver detalle →</div>
                  </button>
                ))}
              </div>

              {/* Tabla resumen comparativa */}
              <div className={styles.tablaWrapper}>
                <h2 className={styles.seccionTitulo}>Comparativa general</h2>
                <div className={styles.tablaScroll}>
                  <table className={styles.tablaComparativa}>
                    <thead>
                      <tr>
                        <th>Clase</th>
                        <th>Rent. nominal</th>
                        <th>Volatilidad</th>
                        <th>Horizonte</th>
                        <th>Liquidez</th>
                        <th>Prot. inflación</th>
                      </tr>
                    </thead>
                    <tbody>
                      {CLASES_ACTIVOS.map((c) => (
                        <tr
                          key={c.id}
                          className={styles.tablaFila}
                          onClick={() => seleccionarClase(c.id)}
                          tabIndex={0}
                          onKeyDown={(e) => e.key === 'Enter' && seleccionarClase(c.id)}
                          aria-label={`Ver detalle de ${c.nombre}`}
                        >
                          <td>
                            <span aria-hidden="true">{c.emoji}</span> {c.nombre}
                          </td>
                          <td>{c.rentabilidadNominal.split('(')[0].trim()}</td>
                          <td>{c.volatilidad.split('(')[0].trim()}</td>
                          <td>{c.horizonte}</td>
                          <td>{liquidezEmoji(c.liquidez)} {c.liquidez}</td>
                          <td>{proteccionEmoji(c.proteccionInflacion)} {c.proteccionInflacion}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className={styles.tablaFuente}>
                  Datos aproximados históricos a largo plazo. Las rentabilidades pasadas no garantizan resultados futuros.
                </p>
              </div>
            </section>
          )}

          {/* ── Tab 2: Clase en detalle ── */}
          {tabActivo === 1 && (
            <section className={styles.seccion} aria-label="Detalle de clase de activo">
              {!activo ? (
                <div className={styles.placeholder}>
                  <span aria-hidden="true">←</span> Selecciona una clase en el Tab 1 o en la tabla de comparativa
                </div>
              ) : (
                <div className={styles.detallePanel}>
                  {/* Header del activo */}
                  <div
                    className={styles.detalleHeader}
                    style={{ borderBottomColor: activo.color }}
                  >
                    <span className={styles.detalleEmoji} aria-hidden="true">
                      {activo.emoji}
                    </span>
                    <div>
                      <h2 className={styles.detalleNombre} style={{ color: activo.color }}>
                        {activo.nombre}
                      </h2>
                      <p className={styles.detalleSubtitulo}>{activo.subtitulo}</p>
                    </div>
                  </div>
                  <p className={styles.detalleDescripcion}>{activo.descripcion}</p>

                  {/* Grid de métricas */}
                  <div className={styles.metricasGrid}>
                    <div className={styles.metricaCard}>
                      <div className={styles.metricaLabel}>Rentabilidad nominal</div>
                      <div className={styles.metricaValor}>{activo.rentabilidadNominal}</div>
                    </div>
                    <div className={styles.metricaCard}>
                      <div className={styles.metricaLabel}>Rentabilidad real</div>
                      <div className={styles.metricaValor}>{activo.rentabilidadReal}</div>
                    </div>
                    <div className={styles.metricaCard}>
                      <div className={styles.metricaLabel}>Volatilidad</div>
                      <div className={styles.metricaValor}>{activo.volatilidad}</div>
                    </div>
                    <div className={styles.metricaCard}>
                      <div className={styles.metricaLabel}>Caída máxima histórica</div>
                      <div className={styles.metricaValor}>{activo.calidaMax}</div>
                    </div>
                    <div className={styles.metricaCard}>
                      <div className={styles.metricaLabel}>Horizonte recomendado</div>
                      <div className={styles.metricaValor}>{activo.horizonte}</div>
                    </div>
                    <div className={styles.metricaCard}>
                      <div className={styles.metricaLabel}>Liquidez</div>
                      <div className={styles.metricaValor}>
                        {liquidezEmoji(activo.liquidez)} {activo.liquidez}
                      </div>
                    </div>
                    <div className={styles.metricaCard}>
                      <div className={styles.metricaLabel}>Barrera de entrada</div>
                      <div className={styles.metricaValor}>{activo.barrEntrada}</div>
                    </div>
                    <div className={styles.metricaCard}>
                      <div className={styles.metricaLabel}>Protección inflación</div>
                      <div className={styles.metricaValor}>
                        {proteccionEmoji(activo.proteccionInflacion)} {activo.proteccionInflacion}
                      </div>
                    </div>
                  </div>

                  {/* Instrumentos típicos */}
                  <div className={styles.instrumentosSec}>
                    <h3 className={styles.subsecTitulo}>Instrumentos típicos</h3>
                    <ul className={styles.ejemplosList}>
                      {activo.ejemplos.map((ej) => (
                        <li key={ej} className={styles.ejemplosItem}>
                          <span aria-hidden="true" style={{ color: activo.color }}>▸</span> {ej}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Ventajas y riesgos */}
                  <div className={styles.vrGrid}>
                    <div className={styles.ventajasSec}>
                      <h3 className={styles.subsecTitulo}>✅ Ventajas</h3>
                      <ul className={styles.vrList}>
                        {activo.ventajas.map((v) => (
                          <li key={v} className={styles.vrItem}>{v}</li>
                        ))}
                      </ul>
                    </div>
                    <div className={styles.riesgosSec}>
                      <h3 className={styles.subsecTitulo}>⚠️ Riesgos</h3>
                      <ul className={styles.vrList}>
                        {activo.riesgos.map((r) => (
                          <li key={r} className={styles.vrItem}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Navegación anterior / siguiente */}
                  <div className={styles.navActivos}>
                    <button
                      className={styles.navBtn}
                      onClick={irAnterior}
                      disabled={activoIdx <= 0}
                      aria-label="Clase de activo anterior"
                    >
                      ← Anterior
                    </button>
                    <span className={styles.navContador}>
                      {activoIdx + 1} / {CLASES_ACTIVOS.length}
                    </span>
                    <button
                      className={styles.navBtn}
                      onClick={irSiguiente}
                      disabled={activoIdx >= CLASES_ACTIVOS.length - 1}
                      aria-label="Clase de activo siguiente"
                    >
                      Siguiente →
                    </button>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* ── Tab 3: Correlación ── */}
          {tabActivo === 2 && (
            <section className={styles.seccion} aria-label="Matriz de correlación entre activos">
              <h2 className={styles.seccionTitulo}>Matriz de Correlación</h2>
              <p className={styles.seccionDesc}>
                Correlaciones aproximadas a largo plazo (1990-2024). Datos orientativos: las
                correlaciones varían según el periodo analizado.
              </p>
              <div className={styles.matrizScroll}>
                <table className={styles.matrizTabla}>
                  <thead>
                    <tr>
                      <th className={styles.matrizHeaderVacio}></th>
                      {CLASES_ACTIVOS.map((c) => (
                        <th key={c.id} className={styles.matrizTh}>
                          <span aria-hidden="true">{c.emoji}</span>
                          <span className={styles.matrizNombreCorto}>{c.nombre}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {CLASES_ACTIVOS.map((fila) => (
                      <tr key={fila.id}>
                        <td className={styles.matrizRowHeader}>
                          <span aria-hidden="true">{fila.emoji}</span> {fila.nombre}
                        </td>
                        {CLASES_ACTIVOS.map((col) => {
                          const valor = CORRELACIONES[fila.id]?.[col.id] ?? 0;
                          return (
                            <td
                              key={col.id}
                              className={styles.matrizCelda}
                              style={{
                                background: colorCorrelacion(valor),
                              }}
                              title={`${fila.nombre} ↔ ${col.nombre}: ${valor.toFixed(2)}`}
                            >
                              <span className={styles.matrizValor}>
                                {valor.toFixed(2)}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className={styles.matrizLeyenda}>
                <span className={styles.leyendaItem} style={{ background: '#fca5a5' }}>
                  Alta correlación (&gt;0,5): poca diversificación
                </span>
                <span className={styles.leyendaItem} style={{ background: '#fde68a' }}>
                  Correlación media
                </span>
                <span className={styles.leyendaItem} style={{ background: '#d1fae5' }}>
                  Correlación baja
                </span>
                <span className={styles.leyendaItem} style={{ background: '#86efac' }}>
                  Correlación negativa: buena diversificación
                </span>
                <span className={styles.leyendaItem} style={{ background: '#9ca3af', color: 'white' }}>
                  Diagonal (el activo con sí mismo)
                </span>
              </div>
              <div className={styles.matrizNota}>
                <strong>Nota:</strong> Una correlación baja o negativa entre dos activos significa que
                cuando uno baja, el otro no necesariamente baja (o incluso sube), reduciendo el
                riesgo total de la cartera. En 2022 la correlación acciones-bonos fue positiva, una
                excepción histórica causada por la subida de tipos simultánea.
              </div>
              <div
                className={styles.matrizNotaDark}
                style={{ display: 'none' }}
                aria-hidden="true"
              >
                {/* Placeholder para overrides dark en JS si fuera necesario */}
              </div>
            </section>
          )}

          {/* ── Tab 4: Carteras tipo ── */}
          {tabActivo === 3 && (
            <section className={styles.seccion} aria-label="Carteras tipo por perfil de riesgo">
              <h2 className={styles.seccionTitulo}>Carteras Tipo</h2>
              <p className={styles.seccionDesc}>
                Ejemplos orientativos de distribución de activos según perfil de riesgo. No
                constituyen asesoramiento financiero personalizado.
              </p>
              <div className={styles.carterasGrid}>
                {CARTERAS.map((cartera) => (
                  <div key={cartera.nombre} className={styles.carteraCard}>
                    <div className={styles.carteraHeader}>
                      <h3 className={styles.carteraNombre}>{cartera.nombre}</h3>
                      <span className={styles.carteraPerfil}>{cartera.perfilRiesgo}</span>
                    </div>
                    <p className={styles.carteraDesc}>{cartera.descripcion}</p>
                    <div className={styles.carteraHorizonte}>
                      Horizonte: <strong>{cartera.horizonte}</strong>
                    </div>

                    {/* Barra de asignación */}
                    <div className={styles.barraAsignacion} role="img" aria-label={`Asignación de ${cartera.nombre}`}>
                      {cartera.asignacion.map((seg) => {
                        const actClase = getActivo(seg.activoId);
                        return actClase ? (
                          <div
                            key={seg.activoId}
                            className={styles.barraSegmento}
                            style={{
                              flex: seg.porcentaje,
                              background: actClase.color,
                            }}
                            title={`${actClase.nombre}: ${seg.porcentaje}%`}
                          />
                        ) : null;
                      })}
                    </div>

                    {/* Leyenda de la barra */}
                    <div className={styles.barraLeyenda}>
                      {cartera.asignacion.map((seg) => {
                        const actClase = getActivo(seg.activoId);
                        return actClase ? (
                          <div key={seg.activoId} className={styles.barraLeyendaItem}>
                            <span
                              className={styles.barraLeyendaColor}
                              style={{ background: actClase.color }}
                              aria-hidden="true"
                            />
                            <span>
                              {actClase.emoji} {actClase.nombre}: {seg.porcentaje}%
                            </span>
                          </div>
                        ) : null;
                      })}
                    </div>

                    {/* Badges rentabilidad y volatilidad */}
                    <div className={styles.carteraBadges}>
                      <span className={styles.carteraBadgeVerde}>
                        Rent. esperada: {cartera.rentabilidadEsperada}
                      </span>
                      <span className={styles.carteraBadgeNaranja}>
                        Volatilidad: {cartera.volatilidad}
                      </span>
                    </div>

                    <p className={styles.carteraNota}>
                      Ejemplo orientativo. No es asesoramiento financiero.
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Sección educativa v2.0 */}
          <EducationalSection
            title="Guía de Clases de Activos"
            subtitle="Diversificación, correlación y cómo construir una cartera"
            icon="📚"
          >
            <div className={styles.eduIntro}>
              <p>
                Las clases de activos son los grandes grupos en que se organizan las inversiones. Cada
                una tiene un perfil propio de rentabilidad, riesgo, liquidez y comportamiento frente a
                la inflación. Combinarlas de forma inteligente (diversificación) permite reducir el
                riesgo sin sacrificar necesariamente la rentabilidad esperada.
              </p>
            </div>

            <h3 className={styles.eduSubtitulo}>Comparativa de características clave</h3>
            <div className={styles.tablaScroll}>
              <table className={styles.tablaComparativa}>
                <thead>
                  <tr>
                    <th>Característica</th>
                    <th>Valor destacado</th>
                    <th>Detalle</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      caracteristica: 'Mayor rentabilidad histórica',
                      valor: 'Acciones (renta variable)',
                      detalle:
                        '~8-10% nominal en USD (MSCI World 1972-2024); ~7-8% en euros. Estimaciones prospectivas 2024: 4-6% nominal. El tiempo en el mercado supera al timing del mercado.',
                    },
                    {
                      caracteristica: 'Menor volatilidad',
                      valor: 'Efectivo y equivalentes',
                      detalle:
                        '~0% de volatilidad nominal. Pero pierde poder adquisitivo con la inflación de forma silenciosa.',
                    },
                    {
                      caracteristica: 'Mejor cobertura inflación',
                      valor: 'Materias primas (oro)',
                      detalle:
                        'El oro ha mantenido su poder adquisitivo durante siglos. Las acciones también protegen a largo plazo.',
                    },
                    {
                      caracteristica: 'Mayor diversificación',
                      valor: 'Combinación acciones + bonos',
                      detalle:
                        'Correlación negativa histórica: cuando caen las acciones, los bonos suelen subir (no siempre: 2022 fue excepción).',
                    },
                    {
                      caracteristica: 'Mayor volatilidad',
                      valor: 'Criptomonedas',
                      detalle:
                        '~70-80% de desviación estándar anual. Caídas del 80% son históricamente frecuentes en ciclos bajistas.',
                    },
                    {
                      caracteristica: 'Mito más extendido',
                      valor: '"El inmobiliario siempre sube"',
                      detalle:
                        'En España bajó un 35-40% entre 2007 y 2013. En Japón lleva décadas sin recuperar máximos de 1991.',
                    },
                  ].map((fila) => (
                    <tr key={fila.caracteristica}>
                      <td>
                        <strong>{fila.caracteristica}</strong>
                      </td>
                      <td>{fila.valor}</td>
                      <td>{fila.detalle}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className={styles.eduSubtitulo}>¿Para quién es útil este visualizador?</h3>
            <div className={styles.escenariosGrid}>
              {[
                {
                  titulo: 'Primer inversor',
                  descripcion:
                    'Entender qué es cada clase antes de invertir. La regla de oro: nunca invertir en algo que no puedas explicarle a otra persona en 2 minutos.',
                  icono: '🌱',
                },
                {
                  titulo: 'Construir una cartera',
                  descripcion:
                    'Ver cómo combinar clases para reducir el riesgo. La correlación entre activos es el concepto clave: busca activos que no se muevan siempre en la misma dirección.',
                  icono: '🧱',
                },
                {
                  titulo: 'Comparar con tu cartera actual',
                  descripcion:
                    'Si solo tienes dinero en el banco, solo tienes efectivo. Si solo tienes tu casa, solo tienes inmobiliario concentrado. La diversificación empieza por ver el cuadro completo.',
                  icono: '🔍',
                },
                {
                  titulo: 'Preparar una conversación con tu banco',
                  descripcion:
                    'Los bancos venden productos financieros propios. Conocer las clases de activos te da criterio para evaluar si lo que te ofrecen encaja con tu perfil real.',
                  icono: '🏦',
                },
              ].map((esc) => (
                <div key={esc.titulo} className={styles.escenarioCard}>
                  <span className={styles.escenarioIcono} aria-hidden="true">
                    {esc.icono}
                  </span>
                  <h4 className={styles.escenarioTitulo}>{esc.titulo}</h4>
                  <p>{esc.descripcion}</p>
                </div>
              ))}
            </div>

            <h3 className={styles.eduSubtitulo}>Preguntas frecuentes</h3>
            <div className={styles.faqLista}>
              {[
                {
                  pregunta: '¿Cuántas clases de activos debería tener en mi cartera?',
                  respuesta:
                    'La mayoría de inversores particulares se benefician de 2-3 clases: acciones globales (núcleo), bonos o efectivo (estabilizador) y opcionalmente materias primas. Añadir más clases tiene rendimientos decrecientes y aumenta la complejidad de gestión.',
                },
                {
                  pregunta: '¿Son las criptomonedas una clase de activo legítima?',
                  respuesta:
                    'Depende del marco. Académicamente, muchos las clasifican como activos especulativos más que como clase de activo establecida, por su corta historia y altísima volatilidad. Pueden tener cabida como posición satélite pequeña (1-5%) en carteras con horizonte largo y alta tolerancia al riesgo.',
                },
                {
                  pregunta: '¿Por qué la correlación acciones-bonos fue positiva en 2022?',
                  respuesta:
                    'En 2022 la subida agresiva de tipos por parte de los bancos centrales (BCE, Fed) golpeó tanto a acciones como a bonos. La correlación negativa histórica entre ambos es más robusta en recesiones económicas que en shocks de inflación. No hay relación perfecta entre clases.',
                },
                {
                  pregunta: '¿Qué es el efecto de la diversificación?',
                  respuesta:
                    'Combinar activos con baja correlación permite reducir la volatilidad total de la cartera sin reducir proporcionalmente la rentabilidad esperada. Es la única forma de obtener algo "gratis" en inversión (Harry Markowitz, Premio Nobel 1990).',
                },
                {
                  pregunta: '¿Cuánto debería tener en efectivo?',
                  respuesta:
                    'El consenso general es mantener 3-6 meses de gastos en efectivo o equivalentes como fondo de emergencia, fuera del dinero que se invierte. Este colchón evita tener que vender inversiones en mal momento por necesidad de liquidez.',
                },
              ].map((faq) => (
                <div key={faq.pregunta} className={styles.faqItem}>
                  <strong className={styles.faqPregunta}>{faq.pregunta}</strong>
                  <p className={styles.faqRespuesta}>{faq.respuesta}</p>
                </div>
              ))}
            </div>

            <h3 className={styles.eduSubtitulo}>Cómo construir tu cartera paso a paso</h3>
            <div className={styles.pasosLista}>
              {[
                {
                  numero: 1,
                  titulo: 'Define tu horizonte temporal',
                  descripcion:
                    'Si necesitas el dinero en menos de 3 años → efectivo y bonos cortos. Si tienes 10+ años → puedes asumir la volatilidad de las acciones.',
                },
                {
                  numero: 2,
                  titulo: 'Evalúa tu tolerancia al riesgo real',
                  descripcion:
                    '¿Qué harías si tu cartera cayera un 30% en un mes? Si la respuesta es vender → tu tolerancia real es menor de lo que crees.',
                },
                {
                  numero: 3,
                  titulo: 'Elige las clases de activos adecuadas',
                  descripcion:
                    'Empieza simple: acciones globales (ETF MSCI World) + efectivo o bonos cortos. La sofisticación no garantiza mejores resultados.',
                },
                {
                  numero: 4,
                  titulo: 'Diversifica dentro de cada clase',
                  descripcion:
                    'En acciones: mejor un ETF global que acciones de un solo país o empresa. En bonos: vencimientos variados. En inmobiliario: REITs diversificados geográficamente.',
                },
                {
                  numero: 5,
                  titulo: 'Revisa y rebalancea periódicamente',
                  descripcion:
                    'Una vez al año o cuando alguna clase se desvíe más del 5-10% de tu asignación objetivo. No hace falta más frecuencia.',
                },
              ].map((paso) => (
                <div key={paso.numero} className={styles.pasoItem}>
                  <div className={styles.pasoNumero}>{paso.numero}</div>
                  <div className={styles.pasoContenido}>
                    <strong>{paso.titulo}</strong>
                    <p>{paso.descripcion}</p>
                  </div>
                </div>
              ))}
            </div>

            <h3 className={styles.eduSubtitulo}>Consejos prácticos</h3>
            <div className={styles.tipsGrid}>
              {[
                'La diversificación entre clases reduce el riesgo total: en 2008 los bonos soberanos subieron mientras las acciones caían un 50%',
                'Los costes importan más que la clase: un ETF de acciones al 0,07% anual supera a largo plazo a un fondo activo al 1,5% con la misma clase',
                'El efectivo "seguro" tiene su propio riesgo: la inflación de 2021-2023 destruyó ~15% del poder adquisitivo del dinero en cuenta en 2 años',
                'El backtesting de carteras no garantiza resultados futuros, pero sí ayuda a entender qué esperar en términos de volatilidad y caídas máximas',
              ].map((tip) => (
                <div key={tip} className={styles.tipCard}>
                  <span className={styles.tipIcono} aria-hidden="true">💡</span>
                  <p>{tip}</p>
                </div>
              ))}
            </div>

            {/* warningBox — requisito v2.0 */}
            <div className={styles.warningBox} role="alert">
              <div className={styles.warningHeader}>
                <span className={styles.warningIcono} aria-hidden="true">⚠️</span>
                Errores frecuentes al invertir por clases de activos
              </div>
              <ul className={styles.warningLista}>
                <li>
                  Confundir volatilidad con pérdida permanente: las caídas del mercado son temporales si
                  el horizonte es largo; una empresa que quiebra es pérdida permanente.
                </li>
                <li>
                  Sobrediversificar: 15 fondos con los mismos activos no diversifica más que 2-3 ETF bien
                  elegidos; solo añade coste y complejidad.
                </li>
                <li>
                  Ignorar el efectivo como clase de activo: no tener fondo de emergencia obliga a vender
                  inversiones en el peor momento.
                </li>
                <li>
                  Asumir que la correlación histórica se mantiene en todas las crisis: el mercado siempre
                  encuentra formas de sorprender (2022: acciones Y bonos cayeron juntos).
                </li>
              </ul>
            </div>
          </EducationalSection>

          <RelatedApps apps={getRelatedApps('visualizador-tipos-activos')} />
          <ShareCard appName="visualizador-tipos-activos" />
        </main>

        <Footer appName="visualizador-tipos-activos" />
      </div>
    </>
  );
}

