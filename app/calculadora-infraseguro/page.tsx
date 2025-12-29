'use client';

import { useState, useMemo } from 'react';
import styles from './CalculadoraInfraseguro.module.css';
import { MeskeiaLogo, Footer, NumberInput, ResultCard, EducationalSection, RelatedApps } from '@/components';
import { formatCurrency, formatNumber, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

interface ResultadoCalculo {
  porcentajeCobertura: number;
  indemnizacionReal: number;
  perdidaPorInfraseguro: number;
  hayInfraseguro: boolean;
  recomendacion: string;
}

export default function CalculadoraInfraseguroPage() {
  const [valorReal, setValorReal] = useState('');
  const [capitalAsegurado, setCapitalAsegurado] = useState('');
  const [importeDano, setImporteDano] = useState('');

  const resultado = useMemo((): ResultadoCalculo | null => {
    const valorRealNum = parseSpanishNumber(valorReal);
    const capitalNum = parseSpanishNumber(capitalAsegurado);
    const danoNum = parseSpanishNumber(importeDano);

    if (!valorRealNum || !capitalNum || !danoNum || valorRealNum <= 0 || capitalNum <= 0 || danoNum <= 0) {
      return null;
    }

    // Si el daño es mayor que el capital asegurado, se limita al capital
    const danoAConsiderar = Math.min(danoNum, capitalNum);

    // Porcentaje de cobertura
    const porcentajeCobertura = Math.min((capitalNum / valorRealNum) * 100, 100);

    // Hay infraseguro si el capital es menor que el valor real
    const hayInfraseguro = capitalNum < valorRealNum;

    let indemnizacionReal: number;
    let perdidaPorInfraseguro: number;

    if (hayInfraseguro) {
      // Regla proporcional: Indemnización = (Capital / Valor Real) × Daño
      indemnizacionReal = (capitalNum / valorRealNum) * danoAConsiderar;
      perdidaPorInfraseguro = danoAConsiderar - indemnizacionReal;
    } else {
      // Sin infraseguro, se cobra el daño completo (hasta el límite del capital)
      indemnizacionReal = danoAConsiderar;
      perdidaPorInfraseguro = 0;
    }

    // Generar recomendación
    let recomendacion: string;
    if (!hayInfraseguro) {
      recomendacion = 'Tu seguro cubre adecuadamente el valor de tus bienes. En caso de siniestro, recibirás la indemnización completa.';
    } else if (porcentajeCobertura >= 80) {
      recomendacion = 'Tienes un infraseguro leve. Considera aumentar el capital asegurado en tu próxima renovación para evitar sorpresas.';
    } else if (porcentajeCobertura >= 50) {
      recomendacion = 'Tienes un infraseguro significativo. En caso de siniestro perderías un porcentaje importante. Te recomendamos ajustar el capital urgentemente.';
    } else {
      recomendacion = 'Tu infraseguro es muy grave. Estás pagando un seguro que apenas te protege. Debes actualizar el capital asegurado cuanto antes.';
    }

    return {
      porcentajeCobertura,
      indemnizacionReal,
      perdidaPorInfraseguro,
      hayInfraseguro,
      recomendacion,
    };
  }, [valorReal, capitalAsegurado, importeDano]);

  const limpiarFormulario = () => {
    setValorReal('');
    setCapitalAsegurado('');
    setImporteDano('');
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon}>⚖️</span>
        <h1 className={styles.title}>Calculadora de Infraseguro</h1>
        <p className={styles.subtitle}>
          Descubre cuánto cobrarías realmente en caso de siniestro si tu seguro no cubre el valor total
        </p>
      </header>

      <div className={styles.mainContent}>
        {/* Panel de entrada */}
        <div className={styles.inputPanel}>
          <h2 className={styles.sectionTitle}>Datos del seguro y siniestro</h2>

          <div className={styles.inputGroup}>
            <NumberInput
              value={valorReal}
              onChange={setValorReal}
              label="Valor real de los bienes asegurados"
              placeholder="150000"
              helperText="Lo que costaría reponer todo hoy (continente o contenido)"
            />
          </div>

          <div className={styles.inputGroup}>
            <NumberInput
              value={capitalAsegurado}
              onChange={setCapitalAsegurado}
              label="Capital asegurado en tu póliza"
              placeholder="100000"
              helperText="El importe que figura en tu seguro"
            />
          </div>

          <div className={styles.inputGroup}>
            <NumberInput
              value={importeDano}
              onChange={setImporteDano}
              label="Importe del daño sufrido"
              placeholder="30000"
              helperText="Coste de reparar o reponer lo dañado"
            />
          </div>

          <button onClick={limpiarFormulario} className={styles.btnSecondary}>
            🔄 Limpiar
          </button>
        </div>

        {/* Panel de resultados */}
        <div className={styles.resultsPanel}>
          {resultado ? (
            <>
              <div className={styles.resultCards}>
                <ResultCard
                  title="Cobertura actual"
                  value={formatNumber(resultado.porcentajeCobertura, 1) + '%'}
                  variant={resultado.porcentajeCobertura >= 100 ? 'success' : resultado.porcentajeCobertura >= 80 ? 'warning' : 'warning'}
                  icon={resultado.porcentajeCobertura >= 100 ? '✅' : '⚠️'}
                  description={resultado.hayInfraseguro ? 'Tienes infraseguro' : 'Sin infraseguro'}
                />
                <ResultCard
                  title="Indemnización que recibirías"
                  value={formatCurrency(resultado.indemnizacionReal)}
                  variant="highlight"
                  icon="💰"
                  description="Aplicando la regla proporcional"
                />
                {resultado.hayInfraseguro && (
                  <ResultCard
                    title="Pérdida por infraseguro"
                    value={formatCurrency(resultado.perdidaPorInfraseguro)}
                    variant="warning"
                    icon="📉"
                    description="Dinero que NO cobrarías"
                  />
                )}
              </div>

              {/* Visualización de la fórmula */}
              <div className={styles.formulaBox}>
                <h3>📐 Cálculo aplicado (Regla Proporcional)</h3>
                <div className={styles.formula}>
                  <div className={styles.formulaFraccion}>
                    <span className={styles.formulaNumerador}>{formatCurrency(parseSpanishNumber(capitalAsegurado) || 0)}</span>
                    <span className={styles.formulaDivisor}></span>
                    <span className={styles.formulaDenominador}>{formatCurrency(parseSpanishNumber(valorReal) || 0)}</span>
                  </div>
                  <span className={styles.formulaOperador}>×</span>
                  <span className={styles.formulaValor}>{formatCurrency(Math.min(parseSpanishNumber(importeDano) || 0, parseSpanishNumber(capitalAsegurado) || 0))}</span>
                  <span className={styles.formulaOperador}>=</span>
                  <span className={styles.formulaResultado}>{formatCurrency(resultado.indemnizacionReal)}</span>
                </div>
                <p className={styles.formulaLeyenda}>
                  (Capital asegurado ÷ Valor real) × Daño = Indemnización
                </p>
              </div>

              {/* Recomendación */}
              <div className={`${styles.recomendacion} ${resultado.hayInfraseguro ? styles.recomendacionWarning : styles.recomendacionSuccess}`}>
                <h3>{resultado.hayInfraseguro ? '⚠️ Recomendación' : '✅ Buenas noticias'}</h3>
                <p>{resultado.recomendacion}</p>
              </div>

              {/* Ejemplo práctico */}
              {resultado.hayInfraseguro && (
                <div className={styles.ejemploBox}>
                  <h3>📋 Resumen de tu situación</h3>
                  <ul>
                    <li>
                      <strong>Has sufrido un daño de:</strong> {formatCurrency(parseSpanishNumber(importeDano) || 0)}
                    </li>
                    <li>
                      <strong>Pero solo cobrarías:</strong> {formatCurrency(resultado.indemnizacionReal)}
                    </li>
                    <li>
                      <strong>Tendrías que poner de tu bolsillo:</strong> {formatCurrency(resultado.perdidaPorInfraseguro)}
                    </li>
                  </ul>
                </div>
              )}
            </>
          ) : (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>⚖️</span>
              <h3>Calcula tu indemnización</h3>
              <p>Introduce el valor real, capital asegurado y daño para ver cuánto cobrarías</p>
            </div>
          )}
        </div>
      </div>

      {/* Disclaimer fuerte */}
      <div className={styles.disclaimer}>
        <h3>⚠️ Aviso Legal Importante</h3>
        <p>
          Esta calculadora aplica la <strong>regla proporcional</strong> establecida en el <strong>artículo 30 de la Ley de Contrato de Seguro</strong>.
          Sin embargo, cada póliza puede tener cláusulas específicas (franquicias, exclusiones, límites por concepto) que afecten a la indemnización final.
          Los resultados son <strong>orientativos</strong> y no sustituyen la valoración de un perito o la interpretación de tu aseguradora.
          Consulta siempre con tu compañía de seguros o un profesional antes de tomar decisiones.
        </p>
      </div>

      {/* Contenido educativo */}
      <EducationalSection
        title="¿Qué es el infraseguro y cómo te afecta?"
        subtitle="Aprende sobre la regla proporcional y cómo evitar perder dinero en un siniestro"
        icon="📚"
      >
        <section className={styles.guideSection}>
          <h2>¿Qué es el infraseguro?</h2>
          <p className={styles.introParagraph}>
            El <strong>infraseguro</strong> ocurre cuando el capital asegurado en tu póliza es inferior al valor real
            de los bienes que proteges. Esto es más común de lo que parece: muchas personas contratan un seguro
            y no lo actualizan cuando reforman la casa, compran muebles nuevos o los precios suben por inflación.
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>📜 Base legal</h4>
              <p>
                El artículo 30 de la Ley 50/1980 de Contrato de Seguro establece que si el valor del interés
                asegurado es superior a la suma asegurada, el asegurador indemnizará el daño causado en la
                misma proporción en que aquella cubre el interés asegurado.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>⚖️ La regla proporcional</h4>
              <p>
                Si tienes asegurado el 70% del valor real, solo cobrarás el 70% de cualquier daño.
                Aunque el siniestro sea parcial y no supere el capital asegurado, se aplica igualmente
                esta proporción.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Ejemplo práctico</h2>
          <div className={styles.ejemploDetallado}>
            <div className={styles.ejemploItem}>
              <span className={styles.ejemploIcon}>🏠</span>
              <div>
                <strong>Situación:</strong>
                <p>Tu vivienda tiene un valor real de reposición de 200.000€, pero tu póliza solo cubre 120.000€ (60% de cobertura).</p>
              </div>
            </div>
            <div className={styles.ejemploItem}>
              <span className={styles.ejemploIcon}>🔥</span>
              <div>
                <strong>Siniestro:</strong>
                <p>Un incendio causa daños valorados en 50.000€ en la cocina y el salón.</p>
              </div>
            </div>
            <div className={styles.ejemploItem}>
              <span className={styles.ejemploIcon}>💸</span>
              <div>
                <strong>Indemnización:</strong>
                <p>Aplicando la regla proporcional: (120.000 ÷ 200.000) × 50.000 = <strong>30.000€</strong></p>
                <p>Tendrías que poner de tu bolsillo: <strong>20.000€</strong></p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>¿Cómo evitar el infraseguro?</h2>
          <div className={styles.consejosGrid}>
            <div className={styles.consejoCard}>
              <span className={styles.consejoIcon}>📝</span>
              <h4>Revisa tu póliza anualmente</h4>
              <p>Cada año comprueba que el capital asegurado refleja el valor real. Ten en cuenta inflación y nuevas adquisiciones.</p>
            </div>
            <div className={styles.consejoCard}>
              <span className={styles.consejoIcon}>🏗️</span>
              <h4>Actualiza tras reformas</h4>
              <p>Si haces obras, reformas la cocina o el baño, comunícalo a tu aseguradora para ajustar el capital.</p>
            </div>
            <div className={styles.consejoCard}>
              <span className={styles.consejoIcon}>📸</span>
              <h4>Haz inventario fotográfico</h4>
              <p>Fotografía tus pertenencias y guarda facturas. Te ayudará a calcular el valor real y a justificar siniestros.</p>
            </div>
            <div className={styles.consejoCard}>
              <span className={styles.consejoIcon}>🔄</span>
              <h4>Cláusula de actualización</h4>
              <p>Algunas pólizas incluyen actualización automática según IPC. Comprueba si la tuya la tiene.</p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes</h2>
          <div className={styles.faqGrid}>
            <div className={styles.faqItem}>
              <h4>¿Se aplica siempre la regla proporcional?</h4>
              <p>
                En seguros de daños (hogar, comercio), sí. En seguros de personas (vida, accidentes)
                no existe infraseguro porque no hay un "valor real" de la persona, solo el capital pactado.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Y si tengo sobreseguro (capital mayor que valor real)?</h4>
              <p>
                El sobreseguro no te beneficia: nunca cobrarás más que el daño real sufrido.
                Solo estarías pagando primas más altas de lo necesario.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué diferencia hay entre continente y contenido?</h4>
              <p>
                Continente es la estructura (paredes, suelos, instalaciones fijas).
                Contenido son tus pertenencias (muebles, electrodomésticos, ropa).
                El infraseguro se calcula por separado para cada uno.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Puede la aseguradora negarse a pagar por infraseguro?</h4>
              <p>
                No puede negarse, pero sí aplicar la regla proporcional legalmente.
                Por eso es tan importante tener el capital bien ajustado.
              </p>
            </div>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-infraseguro')} />
      <Footer appName="calculadora-infraseguro" />
    </div>
  );
}
