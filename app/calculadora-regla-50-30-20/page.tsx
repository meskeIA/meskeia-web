'use client';

import { useState } from 'react';
import styles from './Regla503020.module.css';
import { MeskeiaLogo, Footer, NumberInput, ResultCard, EducationalSection, RelatedApps } from '@/components';
import { formatCurrency, parseSpanishNumber, formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

interface Distribucion {
  necesidades: number;
  deseos: number;
  ahorro: number;
}

interface Resultado {
  ingresoNeto: number;
  ideal: Distribucion;
  real: Distribucion;
  diferencias: Distribucion;
  balance: 'equilibrado' | 'desequilibrado' | 'excelente';
  consejos: string[];
}

export default function CalculadoraRegla503020Page() {
  const [ingresoMensual, setIngresoMensual] = useState('');
  const [gastoNecesidades, setGastoNecesidades] = useState('');
  const [gastoDeseos, setGastoDeseos] = useState('');
  const [gastoAhorro, setGastoAhorro] = useState('');
  const [resultado, setResultado] = useState<Resultado | null>(null);

  const calcularDistribucion = () => {
    const ingreso = parseSpanishNumber(ingresoMensual);
    const necesidades = parseSpanishNumber(gastoNecesidades);
    const deseos = parseSpanishNumber(gastoDeseos);
    const ahorro = parseSpanishNumber(gastoAhorro);

    if (ingreso <= 0) return;

    const ideal: Distribucion = {
      necesidades: ingreso * 0.5,
      deseos: ingreso * 0.3,
      ahorro: ingreso * 0.2,
    };

    const real: Distribucion = {
      necesidades,
      deseos,
      ahorro,
    };

    const diferencias: Distribucion = {
      necesidades: real.necesidades - ideal.necesidades,
      deseos: real.deseos - ideal.deseos,
      ahorro: real.ahorro - ideal.ahorro,
    };

    // Generar consejos
    const consejos: string[] = [];

    if (diferencias.necesidades > ingreso * 0.1) {
      consejos.push('Tus gastos en necesidades superan lo recomendado. Revisa si puedes reducir alquiler, suministros o transporte.');
    }

    if (diferencias.deseos > ingreso * 0.05) {
      consejos.push('Gastas más de lo recomendado en deseos. Considera reducir ocio, suscripciones o compras impulsivas.');
    }

    if (diferencias.ahorro < 0) {
      consejos.push('No estás ahorrando lo suficiente. El 20% de ahorro es clave para tu seguridad financiera futura.');
    }

    if (diferencias.ahorro > ingreso * 0.1) {
      consejos.push('¡Excelente! Ahorras más del 30%. Considera invertir parte de ese excedente.');
    }

    const totalReal = real.necesidades + real.deseos + real.ahorro;
    if (totalReal > ingreso) {
      consejos.push(`Gastas ${formatCurrency(totalReal - ingreso)} más de lo que ingresas. Esto no es sostenible.`);
    }

    // Determinar balance
    let balance: Resultado['balance'];
    const desviacionTotal = Math.abs(diferencias.necesidades) + Math.abs(diferencias.deseos) + Math.abs(diferencias.ahorro);

    if (desviacionTotal < ingreso * 0.1 && diferencias.ahorro >= 0) {
      balance = 'excelente';
    } else if (desviacionTotal < ingreso * 0.25 && diferencias.ahorro >= -ingreso * 0.05) {
      balance = 'equilibrado';
    } else {
      balance = 'desequilibrado';
    }

    if (consejos.length === 0) {
      consejos.push('Tu distribución está muy cerca del ideal. ¡Sigue así!');
    }

    setResultado({
      ingresoNeto: ingreso,
      ideal,
      real,
      diferencias,
      balance,
      consejos,
    });
  };

  const getPorcentaje = (valor: number, total: number) => {
    if (total === 0) return 0;
    return (valor / total) * 100;
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Calculadora Regla 50/30/20</h1>
        <p className={styles.subtitle}>
          Distribuye tus ingresos: 50% necesidades, 30% deseos, 20% ahorro
        </p>
      </header>

      <div className={styles.mainContent}>
        <div className={styles.inputPanel}>
          <h2 className={styles.panelTitle}>Tus ingresos y gastos</h2>

          <NumberInput
            value={ingresoMensual}
            onChange={setIngresoMensual}
            label="Ingreso neto mensual"
            placeholder="2500"
            helperText="Tu salario después de impuestos y deducciones"
            min={0}
          />

          <div className={styles.categoriaHeader}>
            <span className={styles.categoriaIcon}>🏠</span>
            <span>Necesidades (50%)</span>
          </div>
          <NumberInput
            value={gastoNecesidades}
            onChange={setGastoNecesidades}
            label="Gastos en necesidades"
            placeholder="1250"
            helperText="Alquiler, comida, transporte, suministros, seguros..."
            min={0}
          />

          <div className={styles.categoriaHeader}>
            <span className={styles.categoriaIcon}>🎉</span>
            <span>Deseos (30%)</span>
          </div>
          <NumberInput
            value={gastoDeseos}
            onChange={setGastoDeseos}
            label="Gastos en deseos"
            placeholder="750"
            helperText="Ocio, restaurantes, suscripciones, viajes, hobbies..."
            min={0}
          />

          <div className={styles.categoriaHeader}>
            <span className={styles.categoriaIcon}>💰</span>
            <span>Ahorro (20%)</span>
          </div>
          <NumberInput
            value={gastoAhorro}
            onChange={setGastoAhorro}
            label="Ahorro mensual"
            placeholder="500"
            helperText="Lo que ahorras o inviertes cada mes"
            min={0}
          />

          <button onClick={calcularDistribucion} className={styles.btnPrimary}>
            Analizar mi presupuesto
          </button>
        </div>

        <div className={styles.resultsPanel}>
          {resultado && (
            <>
              <ResultCard
                title="Balance general"
                value={resultado.balance === 'excelente' ? 'Excelente' : resultado.balance === 'equilibrado' ? 'Equilibrado' : 'Desequilibrado'}
                variant={resultado.balance === 'excelente' ? 'success' : resultado.balance === 'equilibrado' ? 'info' : 'warning'}
                icon={resultado.balance === 'excelente' ? '🏆' : resultado.balance === 'equilibrado' ? '✅' : '⚠️'}
              />

              <div className={styles.comparativaGrid}>
                <div className={styles.comparativaHeader}>
                  <span></span>
                  <span>Ideal</span>
                  <span>Real</span>
                  <span>Diferencia</span>
                </div>

                <div className={styles.comparativaRow}>
                  <span className={styles.comparativaLabel}>
                    <span className={styles.dot} style={{ background: '#2E86AB' }}></span>
                    Necesidades (50%)
                  </span>
                  <span>{formatCurrency(resultado.ideal.necesidades)}</span>
                  <span>{formatCurrency(resultado.real.necesidades)}</span>
                  <span className={resultado.diferencias.necesidades > 0 ? styles.negative : styles.positive}>
                    {resultado.diferencias.necesidades > 0 ? '+' : ''}{formatCurrency(resultado.diferencias.necesidades)}
                  </span>
                </div>

                <div className={styles.comparativaRow}>
                  <span className={styles.comparativaLabel}>
                    <span className={styles.dot} style={{ background: '#48A9A6' }}></span>
                    Deseos (30%)
                  </span>
                  <span>{formatCurrency(resultado.ideal.deseos)}</span>
                  <span>{formatCurrency(resultado.real.deseos)}</span>
                  <span className={resultado.diferencias.deseos > 0 ? styles.negative : styles.positive}>
                    {resultado.diferencias.deseos > 0 ? '+' : ''}{formatCurrency(resultado.diferencias.deseos)}
                  </span>
                </div>

                <div className={styles.comparativaRow}>
                  <span className={styles.comparativaLabel}>
                    <span className={styles.dot} style={{ background: '#7FB3D3' }}></span>
                    Ahorro (20%)
                  </span>
                  <span>{formatCurrency(resultado.ideal.ahorro)}</span>
                  <span>{formatCurrency(resultado.real.ahorro)}</span>
                  <span className={resultado.diferencias.ahorro < 0 ? styles.negative : styles.positive}>
                    {resultado.diferencias.ahorro > 0 ? '+' : ''}{formatCurrency(resultado.diferencias.ahorro)}
                  </span>
                </div>
              </div>

              <div className={styles.barrasContainer}>
                <div className={styles.barraGroup}>
                  <span className={styles.barraLabel}>Tu distribución real</span>
                  <div className={styles.barraStacked}>
                    <div
                      className={styles.barraNecesidades}
                      style={{ width: `${getPorcentaje(resultado.real.necesidades, resultado.ingresoNeto)}%` }}
                    >
                      {formatNumber(getPorcentaje(resultado.real.necesidades, resultado.ingresoNeto), 0)}%
                    </div>
                    <div
                      className={styles.barraDeseos}
                      style={{ width: `${getPorcentaje(resultado.real.deseos, resultado.ingresoNeto)}%` }}
                    >
                      {formatNumber(getPorcentaje(resultado.real.deseos, resultado.ingresoNeto), 0)}%
                    </div>
                    <div
                      className={styles.barraAhorro}
                      style={{ width: `${getPorcentaje(resultado.real.ahorro, resultado.ingresoNeto)}%` }}
                    >
                      {formatNumber(getPorcentaje(resultado.real.ahorro, resultado.ingresoNeto), 0)}%
                    </div>
                  </div>
                </div>

                <div className={styles.barraGroup}>
                  <span className={styles.barraLabel}>Distribución ideal</span>
                  <div className={styles.barraStacked}>
                    <div className={styles.barraNecesidades} style={{ width: '50%' }}>50%</div>
                    <div className={styles.barraDeseos} style={{ width: '30%' }}>30%</div>
                    <div className={styles.barraAhorro} style={{ width: '20%' }}>20%</div>
                  </div>
                </div>
              </div>

              <div className={styles.consejosCard}>
                <h4>Consejos personalizados</h4>
                <ul>
                  {resultado.consejos.map((consejo, index) => (
                    <li key={index}>{consejo}</li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>

      <div className={styles.disclaimer}>
        <h3>Aviso importante</h3>
        <p>
          La regla 50/30/20 es una guía general de finanzas personales. Tu situación personal
          puede requerir ajustes (ciudades caras pueden necesitar más del 50% en necesidades).
          NO constituye asesoramiento financiero profesional.
        </p>
      </div>

      <EducationalSection
        title="¿Quieres aprender más sobre la regla 50/30/20?"
        subtitle="Descubre cómo aplicar este método de presupuesto popularizado por Elizabeth Warren"
        icon="📚"
      >
        <section className={styles.guideSection}>
          <h2>¿Qué es la regla 50/30/20?</h2>
          <p className={styles.introParagraph}>
            Es un método de presupuesto creado por la senadora Elizabeth Warren y su hija Amelia Warren Tyagi
            en el libro "All Your Worth". Divide tus ingresos netos en tres categorías simples.
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>🏠 50% Necesidades</h4>
              <p>Gastos esenciales que no puedes evitar:</p>
              <ul>
                <li>Alquiler o hipoteca</li>
                <li>Comida básica</li>
                <li>Suministros (luz, agua, gas)</li>
                <li>Transporte al trabajo</li>
                <li>Seguros obligatorios</li>
                <li>Medicamentos esenciales</li>
              </ul>
            </div>

            <div className={styles.contentCard}>
              <h4>🎉 30% Deseos</h4>
              <p>Gastos que mejoran tu calidad de vida:</p>
              <ul>
                <li>Restaurantes y comida a domicilio</li>
                <li>Suscripciones (Netflix, Spotify...)</li>
                <li>Viajes y vacaciones</li>
                <li>Ropa no esencial</li>
                <li>Hobbies y entretenimiento</li>
                <li>Gimnasio</li>
              </ul>
            </div>

            <div className={styles.contentCard}>
              <h4>💰 20% Ahorro</h4>
              <p>Dinero para tu futuro:</p>
              <ul>
                <li>Fondo de emergencia</li>
                <li>Ahorro para jubilación</li>
                <li>Inversiones</li>
                <li>Pago extra de deudas</li>
                <li>Ahorro para objetivos</li>
              </ul>
            </div>

            <div className={styles.contentCard}>
              <h4>¿Y si no puedo cumplirla?</h4>
              <p>
                La regla es una guía, no una ley. Si vives en una ciudad cara, quizás necesites
                60% en necesidades y 20% en deseos. Lo importante es:
              </p>
              <ul>
                <li>Mantener el 20% de ahorro como mínimo</li>
                <li>Reducir deseos antes que ahorro</li>
                <li>Buscar formas de reducir necesidades a largo plazo</li>
              </ul>
            </div>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-regla-50-30-20')} />
      <Footer appName="calculadora-regla-50-30-20" />
    </div>
  );
}
