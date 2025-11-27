'use client';

import ChapterPage from '../ChapterPage';
import styles from '../CursoInversion.module.css';

const sections = [
  {
    title: 'Introducción a las Estrategias',
    icon: '🎯',
    content: (
      <>
        <p>Una <strong>estrategia de inversión</strong> es un plan sistemático para seleccionar, comprar y vender activos financieros. La mejor estrategia es aquella que puedes mantener a largo plazo, independientemente de las emociones del mercado.</p>

        <div className={styles.infoBox}>
          <p><strong>💡 Dato clave:</strong> Estudios demuestran que el 90% de los inversores activos NO superan al índice a largo plazo. La consistencia y los bajos costes suelen ganar a la "habilidad" de elegir acciones.</p>
        </div>
      </>
    ),
  },
  {
    title: 'Gestión Pasiva vs Activa',
    icon: '⚖️',
    content: (
      <>
        <p>La primera decisión estratégica es elegir entre gestión pasiva o activa.</p>

        <div className={styles.exampleGrid}>
          <div className={styles.exampleCard}>
            <div className={styles.exampleLogo}>🎯</div>
            <div className={styles.exampleName}>Gestión Pasiva (Indexada)</div>
            <div className={styles.exampleDesc}>
              <strong>Objetivo:</strong> Replicar un índice (S&P 500, MSCI World)<br /><br />
              <strong>Pros:</strong> Costes muy bajos (0,03-0,20%), diversificación automática, sin necesidad de elegir acciones<br /><br />
              <strong>Contras:</strong> Nunca superarás al índice<br /><br />
              <strong>Ideal para:</strong> La mayoría de inversores
            </div>
          </div>
          <div className={styles.exampleCard}>
            <div className={styles.exampleLogo}>🔍</div>
            <div className={styles.exampleName}>Gestión Activa</div>
            <div className={styles.exampleDesc}>
              <strong>Objetivo:</strong> Superar al mercado seleccionando activos<br /><br />
              <strong>Pros:</strong> Potencial de rentabilidad extra, flexibilidad<br /><br />
              <strong>Contras:</strong> Costes altos (1-2%), 90%+ fracasa a largo plazo, requiere tiempo y conocimiento<br /><br />
              <strong>Ideal para:</strong> Profesionales o apasionados del análisis
            </div>
          </div>
        </div>

        <div className={styles.highlightBox}>
          <p><strong>📊 Evidencia:</strong> Según el informe SPIVA, a 15 años, más del 92% de los fondos activos de renta variable en España no superan a su índice de referencia.</p>
        </div>
      </>
    ),
  },
  {
    title: 'Value Investing',
    icon: '💎',
    content: (
      <>
        <p>El <strong>Value Investing</strong> busca comprar empresas infravaloradas por el mercado. Popularizado por Benjamin Graham y Warren Buffett.</p>

        <h3>Principios fundamentales</h3>
        <ul>
          <li><strong>Margen de seguridad:</strong> Comprar con descuento sobre el valor intrínseco</li>
          <li><strong>Análisis fundamental:</strong> Estudiar estados financieros, competencia, gestión</li>
          <li><strong>Paciencia:</strong> Esperar a que el mercado reconozca el valor</li>
          <li><strong>Pensamiento contrarian:</strong> Comprar cuando otros tienen miedo</li>
        </ul>

        <h3>Métricas clave</h3>
        <table className={styles.comparisonTable}>
          <thead>
            <tr>
              <th>Métrica</th>
              <th>Qué mide</th>
              <th>Value típico</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>PER</strong></td>
              <td>Precio / Beneficio</td>
              <td>&lt; 15</td>
            </tr>
            <tr>
              <td><strong>P/B</strong></td>
              <td>Precio / Valor contable</td>
              <td>&lt; 1,5</td>
            </tr>
            <tr>
              <td><strong>Dividend Yield</strong></td>
              <td>Dividendo / Precio</td>
              <td>&gt; 3%</td>
            </tr>
            <tr>
              <td><strong>Deuda/EBITDA</strong></td>
              <td>Apalancamiento</td>
              <td>&lt; 3x</td>
            </tr>
          </tbody>
        </table>

        <div className={styles.warningBox}>
          <p><strong>⚠️ Cuidado con las trampas de valor:</strong> Una acción barata puede estar barata por buenas razones (empresa en declive, sector obsoleto). No toda acción barata es una buena inversión.</p>
        </div>
      </>
    ),
  },
  {
    title: 'Growth Investing',
    icon: '🚀',
    content: (
      <>
        <p>El <strong>Growth Investing</strong> busca empresas con alto potencial de crecimiento de beneficios, aunque coticen a múltiplos elevados.</p>

        <h3>Características de empresas growth</h3>
        <ul>
          <li>Crecimiento de ingresos &gt; 15-20% anual</li>
          <li>Sectores en expansión (tecnología, salud, energías renovables)</li>
          <li>Reinversión de beneficios (pocos o ningún dividendo)</li>
          <li>Ventajas competitivas sostenibles (moat)</li>
        </ul>

        <div className={styles.exampleGrid}>
          <div className={styles.exampleCard}>
            <div className={styles.exampleLogo}>📱</div>
            <div className={styles.exampleName}>Ejemplos históricos</div>
            <div className={styles.exampleDesc}>Amazon, Google, Netflix, Tesla en sus inicios. Todas cotizaban "caras" pero el crecimiento justificó el precio.</div>
          </div>
          <div className={styles.exampleCard}>
            <div className={styles.exampleLogo}>⚠️</div>
            <div className={styles.exampleName}>Riesgos</div>
            <div className={styles.exampleDesc}>Alta volatilidad, sensibles a tipos de interés, expectativas ya incorporadas en el precio, riesgo de decepción.</div>
          </div>
        </div>

        <div className={styles.infoBox}>
          <p><strong>💡 Growth vs Value:</strong> Históricamente, Value ha superado a Growth a muy largo plazo, pero Growth domina en mercados alcistas y tipos bajos. La mejor estrategia suele ser combinar ambos.</p>
        </div>
      </>
    ),
  },
  {
    title: 'Dividend Investing',
    icon: '💰',
    content: (
      <>
        <p>El <strong>Dividend Investing</strong> se centra en empresas que reparten dividendos consistentes y crecientes. El objetivo es generar ingresos pasivos y beneficiarse del efecto compuesto de reinvertir dividendos.</p>

        <h3>Tipos de empresas de dividendos</h3>
        <ul>
          <li><strong>Dividend Aristocrats:</strong> +25 años aumentando dividendo (ej: Johnson & Johnson, Coca-Cola)</li>
          <li><strong>Dividend Kings:</strong> +50 años aumentando dividendo</li>
          <li><strong>High Yield:</strong> Dividendos altos pero no necesariamente crecientes</li>
        </ul>

        <h3>Métricas importantes</h3>
        <table className={styles.comparisonTable}>
          <thead>
            <tr>
              <th>Métrica</th>
              <th>Descripción</th>
              <th>Objetivo</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Dividend Yield</strong></td>
              <td>Dividendo anual / Precio</td>
              <td>3-5% (equilibrado)</td>
            </tr>
            <tr>
              <td><strong>Payout Ratio</strong></td>
              <td>% beneficio repartido</td>
              <td>&lt; 60% (sostenible)</td>
            </tr>
            <tr>
              <td><strong>Dividend Growth</strong></td>
              <td>Crecimiento anual del dividendo</td>
              <td>&gt; inflación</td>
            </tr>
          </tbody>
        </table>

        <div className={styles.highlightBox}>
          <p><strong>📊 Poder del compuesto:</strong> Reinvertir dividendos durante 30 años puede multiplicar por 10x el capital inicial, incluso sin crecimiento del precio de la acción.</p>
        </div>
      </>
    ),
  },
  {
    title: 'Dollar-Cost Averaging (DCA)',
    icon: '📅',
    content: (
      <>
        <p>El <strong>Dollar-Cost Averaging</strong> (o "Promediado del Coste") consiste en invertir cantidades fijas de forma periódica, independientemente del precio del mercado.</p>

        <h3>Cómo funciona</h3>
        <ul>
          <li>Inviertes 200€ cada mes en un ETF del MSCI World</li>
          <li>Cuando el mercado baja, compras más participaciones</li>
          <li>Cuando el mercado sube, compras menos participaciones</li>
          <li>A largo plazo, obtienes un precio promedio</li>
        </ul>

        <div className={styles.exampleGrid}>
          <div className={styles.exampleCard}>
            <div className={styles.exampleLogo}>✅</div>
            <div className={styles.exampleName}>Ventajas del DCA</div>
            <div className={styles.exampleDesc}>
              • Elimina el "timing" del mercado<br />
              • Reduce el impacto de la volatilidad<br />
              • Automatizable (menos decisiones emocionales)<br />
              • Disciplina de ahorro forzada
            </div>
          </div>
          <div className={styles.exampleCard}>
            <div className={styles.exampleLogo}>⚠️</div>
            <div className={styles.exampleName}>Consideraciones</div>
            <div className={styles.exampleDesc}>
              • Si tienes un lump sum, estadísticamente es mejor invertirlo todo de golpe<br />
              • Pero psicológicamente, DCA es más llevadero<br />
              • Importante: las comisiones por operación deben ser bajas
            </div>
          </div>
        </div>

        <div className={styles.highlightBox}>
          <p><strong>📌 Recomendación:</strong> El DCA es ideal para inversores que reciben un salario mensual. Configura una transferencia automática a tu broker y olvídate del "mejor momento" para invertir.</p>
        </div>
      </>
    ),
  },
];

export default function EstrategiasInversionPage() {
  return <ChapterPage slug="estrategias-inversion" sections={sections} />;
}
