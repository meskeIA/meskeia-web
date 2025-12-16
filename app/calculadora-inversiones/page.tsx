'use client';

import { useState, useMemo } from 'react';
import styles from './CalculadoraInversiones.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { EducationalSection, RelatedApps} from '@/components';
import { formatNumber, formatCurrency, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

type PerfilInversor = 'conservador' | 'moderado' | 'equilibrado' | 'dinamico' | 'agresivo';

interface AsignacionActivos {
  rentaVariable: number;
  rentaFija: number;
  liquidez: number;
  alternativos: number;
}

const PERFILES: Record<PerfilInversor, { nombre: string; icon: string; desc: string; asignacion: AsignacionActivos; rentabilidadEsperada: number; volatilidad: number }> = {
  conservador: {
    nombre: 'Conservador',
    icon: '🛡️',
    desc: 'Mínimo riesgo',
    asignacion: { rentaVariable: 15, rentaFija: 60, liquidez: 20, alternativos: 5 },
    rentabilidadEsperada: 3,
    volatilidad: 5,
  },
  moderado: {
    nombre: 'Moderado',
    icon: '⚖️',
    desc: 'Riesgo bajo',
    asignacion: { rentaVariable: 30, rentaFija: 50, liquidez: 15, alternativos: 5 },
    rentabilidadEsperada: 4.5,
    volatilidad: 8,
  },
  equilibrado: {
    nombre: 'Equilibrado',
    icon: '📊',
    desc: 'Riesgo medio',
    asignacion: { rentaVariable: 50, rentaFija: 35, liquidez: 10, alternativos: 5 },
    rentabilidadEsperada: 6,
    volatilidad: 12,
  },
  dinamico: {
    nombre: 'Dinámico',
    icon: '📈',
    desc: 'Riesgo alto',
    asignacion: { rentaVariable: 70, rentaFija: 20, liquidez: 5, alternativos: 5 },
    rentabilidadEsperada: 7.5,
    volatilidad: 16,
  },
  agresivo: {
    nombre: 'Agresivo',
    icon: '🚀',
    desc: 'Máximo riesgo',
    asignacion: { rentaVariable: 85, rentaFija: 5, liquidez: 5, alternativos: 5 },
    rentabilidadEsperada: 9,
    volatilidad: 22,
  },
};

export default function CalculadoraInversionesPage() {
  const [capitalInvertir, setCapitalInvertir] = useState('50000');
  const [perfil, setPerfil] = useState<PerfilInversor>('equilibrado');
  const [horizonteTemporal, setHorizonteTemporal] = useState(10);
  const [edadInversor, setEdadInversor] = useState(35);

  const perfilActual = PERFILES[perfil];

  // Calcular distribución
  const distribucion = useMemo(() => {
    const capital = parseSpanishNumber(capitalInvertir) || 0;
    const asignacion = perfilActual.asignacion;

    return {
      rentaVariable: {
        porcentaje: asignacion.rentaVariable,
        importe: capital * (asignacion.rentaVariable / 100),
      },
      rentaFija: {
        porcentaje: asignacion.rentaFija,
        importe: capital * (asignacion.rentaFija / 100),
      },
      liquidez: {
        porcentaje: asignacion.liquidez,
        importe: capital * (asignacion.liquidez / 100),
      },
      alternativos: {
        porcentaje: asignacion.alternativos,
        importe: capital * (asignacion.alternativos / 100),
      },
    };
  }, [capitalInvertir, perfilActual]);

  // Calcular métricas
  const metricas = useMemo(() => {
    const capital = parseSpanishNumber(capitalInvertir) || 0;
    const rentabilidad = perfilActual.rentabilidadEsperada / 100;
    const volatilidad = perfilActual.volatilidad;

    // Capital proyectado
    const capitalProyectado = capital * Math.pow(1 + rentabilidad, horizonteTemporal);

    // Escenario pesimista (rentabilidad - volatilidad/2)
    const rentabilidadPesimista = Math.max(0, rentabilidad - volatilidad / 200);
    const capitalPesimista = capital * Math.pow(1 + rentabilidadPesimista, horizonteTemporal);

    // Escenario optimista (rentabilidad + volatilidad/2)
    const rentabilidadOptimista = rentabilidad + volatilidad / 200;
    const capitalOptimista = capital * Math.pow(1 + rentabilidadOptimista, horizonteTemporal);

    // Sharpe ratio simplificado (asumiendo tasa libre de riesgo 1%)
    const sharpeRatio = (perfilActual.rentabilidadEsperada - 1) / volatilidad;

    return {
      capitalProyectado,
      capitalPesimista,
      capitalOptimista,
      rentabilidadEsperada: perfilActual.rentabilidadEsperada,
      volatilidad,
      sharpeRatio,
      gananciasEsperadas: capitalProyectado - capital,
    };
  }, [capitalInvertir, perfilActual, horizonteTemporal]);

  // Recomendaciones basadas en edad y horizonte
  const recomendaciones = useMemo(() => {
    const recs: string[] = [];

    // Regla del 110 (o 120 para más agresivos)
    const porcentajeRVRecomendado = Math.max(0, 110 - edadInversor);

    if (perfilActual.asignacion.rentaVariable > porcentajeRVRecomendado + 15) {
      recs.push(`Según tu edad (${edadInversor} años), podrías considerar reducir renta variable al ~${porcentajeRVRecomendado}%.`);
    }

    if (horizonteTemporal < 5 && perfil === 'agresivo') {
      recs.push('Con un horizonte menor a 5 años, un perfil agresivo podría ser demasiado arriesgado.');
    }

    if (horizonteTemporal > 15 && (perfil === 'conservador' || perfil === 'moderado')) {
      recs.push('Con un horizonte tan largo, podrías considerar un perfil más dinámico para aprovechar el interés compuesto.');
    }

    const capital = parseSpanishNumber(capitalInvertir) || 0;
    if (distribucion.liquidez.importe > 10000) {
      recs.push('Mantener más de 10.000€ en liquidez puede ser ineficiente. Considera un fondo monetario.');
    }

    if (capital > 100000 && distribucion.alternativos.porcentaje < 10) {
      recs.push('Con un capital elevado, podrías diversificar más con alternativos (REITs, materias primas).');
    }

    if (recs.length === 0) {
      recs.push('Tu cartera está bien equilibrada para tu perfil de riesgo y horizonte temporal.');
    }

    return recs;
  }, [perfil, perfilActual, edadInversor, horizonteTemporal, capitalInvertir, distribucion]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>📊 Calculadora de Inversiones</h1>
        <p className={styles.subtitle}>
          Diseña tu cartera según tu perfil de riesgo
        </p>
      </header>

      <div className={styles.mainContent}>
        {/* Panel de Configuración */}
        <div className={styles.configPanel}>
          <h2 className={styles.sectionTitle}>💰 Capital a Invertir</h2>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Importe total</label>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                className={styles.input}
                value={capitalInvertir}
                onChange={(e) => setCapitalInvertir(e.target.value)}
                placeholder="50000"
              />
              <span className={styles.unit}>€</span>
            </div>
          </div>

          <h2 className={styles.sectionTitle}>👤 Tu Perfil</h2>

          <div className={styles.sliderGroup}>
            <div className={styles.sliderHeader}>
              <label className={styles.label}>Tu edad</label>
              <span className={styles.sliderValue}>{edadInversor} años</span>
            </div>
            <input
              type="range"
              className={styles.slider}
              min="18"
              max="70"
              value={edadInversor}
              onChange={(e) => setEdadInversor(parseInt(e.target.value))}
            />
          </div>

          <div className={styles.sliderGroup}>
            <div className={styles.sliderHeader}>
              <label className={styles.label}>Horizonte temporal</label>
              <span className={styles.sliderValue}>{horizonteTemporal} años</span>
            </div>
            <input
              type="range"
              className={styles.slider}
              min="1"
              max="30"
              value={horizonteTemporal}
              onChange={(e) => setHorizonteTemporal(parseInt(e.target.value))}
            />
          </div>

          <h2 className={styles.sectionTitle}>📈 Perfil de Riesgo</h2>

          <div className={styles.perfilesGrid}>
            {(Object.keys(PERFILES) as PerfilInversor[]).map((key) => (
              <button
                key={key}
                className={`${styles.perfilBtn} ${perfil === key ? styles.activo : ''}`}
                onClick={() => setPerfil(key)}
              >
                <div className={styles.perfilIcon}>{PERFILES[key].icon}</div>
                <span className={styles.perfilNombre}>{PERFILES[key].nombre}</span>
                <span className={styles.perfilDesc}>{PERFILES[key].desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Panel de Resultados */}
        <div className={styles.resultsPanel}>
          <h2 className={styles.sectionTitle}>📊 Tu Distribución de Activos</h2>

          {/* Barra Visual */}
          <div className={styles.distribucionVisual}>
            <div className={styles.barraDistribucion}>
              {distribucion.rentaVariable.porcentaje > 0 && (
                <div
                  className={`${styles.barraSegmento} ${styles.rentaVariable}`}
                  style={{ width: `${distribucion.rentaVariable.porcentaje}%` }}
                >
                  {distribucion.rentaVariable.porcentaje}%
                </div>
              )}
              {distribucion.rentaFija.porcentaje > 0 && (
                <div
                  className={`${styles.barraSegmento} ${styles.rentaFija}`}
                  style={{ width: `${distribucion.rentaFija.porcentaje}%` }}
                >
                  {distribucion.rentaFija.porcentaje}%
                </div>
              )}
              {distribucion.liquidez.porcentaje > 0 && (
                <div
                  className={`${styles.barraSegmento} ${styles.liquidez}`}
                  style={{ width: `${distribucion.liquidez.porcentaje}%` }}
                >
                  {distribucion.liquidez.porcentaje}%
                </div>
              )}
              {distribucion.alternativos.porcentaje > 0 && (
                <div
                  className={`${styles.barraSegmento} ${styles.alternativos}`}
                  style={{ width: `${distribucion.alternativos.porcentaje}%` }}
                >
                  {distribucion.alternativos.porcentaje}%
                </div>
              )}
            </div>

            <div className={styles.leyenda}>
              <div className={styles.leyendaItem}>
                <div className={`${styles.leyendaColor} ${styles.rentaVariable}`} />
                <span>Renta Variable</span>
              </div>
              <div className={styles.leyendaItem}>
                <div className={`${styles.leyendaColor} ${styles.rentaFija}`} />
                <span>Renta Fija</span>
              </div>
              <div className={styles.leyendaItem}>
                <div className={`${styles.leyendaColor} ${styles.liquidez}`} />
                <span>Liquidez</span>
              </div>
              <div className={styles.leyendaItem}>
                <div className={`${styles.leyendaColor} ${styles.alternativos}`} />
                <span>Alternativos</span>
              </div>
            </div>
          </div>

          {/* Cards de Distribución */}
          <div className={styles.distribucionGrid}>
            <div className={styles.activoCard}>
              <div className={styles.activoHeader}>
                <span className={styles.activoNombre}>📈 Renta Variable</span>
                <span className={styles.activoPorcentaje}>{distribucion.rentaVariable.porcentaje}%</span>
              </div>
              <div className={styles.activoImporte}>{formatCurrency(distribucion.rentaVariable.importe)}</div>
              <div className={styles.activoDesc}>Acciones, ETFs de índices, fondos de inversión</div>
            </div>

            <div className={styles.activoCard}>
              <div className={styles.activoHeader}>
                <span className={styles.activoNombre}>📊 Renta Fija</span>
                <span className={styles.activoPorcentaje}>{distribucion.rentaFija.porcentaje}%</span>
              </div>
              <div className={styles.activoImporte}>{formatCurrency(distribucion.rentaFija.importe)}</div>
              <div className={styles.activoDesc}>Bonos gubernamentales, corporativos, fondos RF</div>
            </div>

            <div className={styles.activoCard}>
              <div className={styles.activoHeader}>
                <span className={styles.activoNombre}>💵 Liquidez</span>
                <span className={styles.activoPorcentaje}>{distribucion.liquidez.porcentaje}%</span>
              </div>
              <div className={styles.activoImporte}>{formatCurrency(distribucion.liquidez.importe)}</div>
              <div className={styles.activoDesc}>Depósitos, cuentas remuneradas, monetarios</div>
            </div>

            <div className={styles.activoCard}>
              <div className={styles.activoHeader}>
                <span className={styles.activoNombre}>🏠 Alternativos</span>
                <span className={styles.activoPorcentaje}>{distribucion.alternativos.porcentaje}%</span>
              </div>
              <div className={styles.activoImporte}>{formatCurrency(distribucion.alternativos.importe)}</div>
              <div className={styles.activoDesc}>REITs, materias primas, criptomonedas</div>
            </div>
          </div>

          {/* Métricas */}
          <div className={styles.metricasSection}>
            <h3 className={styles.sectionTitle}>📈 Proyección a {horizonteTemporal} años</h3>
            <div className={styles.metricasGrid}>
              <div className={`${styles.metricaCard} ${styles.positivo}`}>
                <span className={styles.metricaLabel}>Capital proyectado</span>
                <span className={styles.metricaValor}>{formatCurrency(metricas.capitalProyectado)}</span>
              </div>
              <div className={styles.metricaCard}>
                <span className={styles.metricaLabel}>Rentabilidad esperada</span>
                <span className={styles.metricaValor}>{formatNumber(metricas.rentabilidadEsperada, 1)}%</span>
              </div>
              <div className={styles.metricaCard}>
                <span className={styles.metricaLabel}>Volatilidad</span>
                <span className={styles.metricaValor}>{formatNumber(metricas.volatilidad, 0)}%</span>
              </div>
              <div className={styles.metricaCard}>
                <span className={styles.metricaLabel}>Escenario pesimista</span>
                <span className={styles.metricaValor}>{formatCurrency(metricas.capitalPesimista)}</span>
              </div>
              <div className={styles.metricaCard}>
                <span className={styles.metricaLabel}>Escenario optimista</span>
                <span className={styles.metricaValor}>{formatCurrency(metricas.capitalOptimista)}</span>
              </div>
              <div className={styles.metricaCard}>
                <span className={styles.metricaLabel}>Ratio Sharpe</span>
                <span className={styles.metricaValor}>{formatNumber(metricas.sharpeRatio, 2)}</span>
              </div>
            </div>
          </div>

          {/* Recomendaciones */}
          <div className={styles.recomendacionesSection}>
            <h4>💡 Recomendaciones Personalizadas</h4>
            {recomendaciones.map((rec, index) => (
              <div key={index} className={styles.recomendacionItem}>
                <span className={styles.recomendacionIcon}>💡</span>
                <span className={styles.recomendacionTexto}>{rec}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Disclaimer - SIEMPRE VISIBLE */}
      <div className={styles.disclaimer}>
        <h3>⚠️ Aviso Importante</h3>
        <p>
          Esta calculadora proporciona una <strong>distribución orientativa</strong> basada en perfiles
          de riesgo estándar. Las rentabilidades pasadas no garantizan resultados futuros. La volatilidad
          y las proyecciones son estimaciones y pueden variar significativamente.
          <strong> No constituye asesoramiento financiero</strong>. Antes de invertir, consulta con un
          profesional y evalúa tu situación personal, objetivos y tolerancia al riesgo.
        </p>
      </div>

      {/* Contenido Educativo */}
      <EducationalSection
        title="📚 ¿Quieres entender mejor la asignación de activos?"
        subtitle="Aprende los fundamentos de la diversificación y cómo construir una cartera equilibrada"
      >
        <section className={styles.guideSection}>
          <h2>Fundamentos de la Inversión</h2>
          <p className={styles.introParagraph}>
            La asignación de activos (asset allocation) es la estrategia de distribuir tu inversión
            entre diferentes tipos de activos para equilibrar riesgo y rentabilidad. Es más importante
            que la selección individual de valores: determina más del 90% del rendimiento de tu cartera.
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>📈 Renta Variable</h4>
              <p>
                Acciones y fondos de renta variable. Mayor potencial de rentabilidad pero más volatilidad.
                Históricamente ~7-10% anual a largo plazo. Ideal para horizontes largos (+10 años).
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>📊 Renta Fija</h4>
              <p>
                Bonos y obligaciones. Menor rentabilidad pero más estabilidad.
                Actúa como amortiguador cuando la renta variable cae.
                Especialmente importante cerca de la jubilación.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>💵 Liquidez</h4>
              <p>
                Efectivo y equivalentes (depósitos, monetarios). Rentabilidad mínima
                pero disponibilidad inmediata. Esencial para emergencias
                y oportunidades de inversión.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>🏠 Alternativos</h4>
              <p>
                Inmobiliario (REITs), materias primas, oro, cripto.
                Descorrelación con mercados tradicionales.
                Añaden diversificación pero con riesgos específicos.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>La Regla del 110</h2>
          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>📐 Fórmula Simple</h4>
              <p>
                % Renta Variable = 110 - tu edad. A los 30 años: 80% RV, 20% RF.
                A los 50 años: 60% RV, 40% RF. A los 65: 45% RV, 55% RF.
                Es una guía orientativa, no una regla absoluta.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>🔄 Rebalanceo</h4>
              <p>
                Revisa tu cartera anualmente y rebalancea si la distribución
                se desvía más de un 5% del objetivo. Vende lo que ha subido
                y compra lo que ha bajado: comprar barato, vender caro.
              </p>
            </div>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-inversiones')} />

      <Footer appName="calculadora-inversiones" />
    </div>
  );
}
