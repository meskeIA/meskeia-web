'use client';

import ChapterPage from '../ChapterPage';
import styles from '../CursoInversion.module.css';

const sections = [
  {
    title: 'Panorama de Productos de Inversión',
    icon: '🌟',
    content: (
      <>
        <p>Los <strong>productos financieros</strong> son instrumentos que nos permiten invertir nuestro dinero con diferentes niveles de riesgo y rentabilidad esperada. Cada producto tiene características únicas que lo hacen más apropiado para ciertos objetivos y perfiles de inversor.</p>

        <div className={styles.infoBox}>
          <p><strong>💡 Principio clave:</strong> No existe el producto "perfecto". La clave está en construir una cartera diversificada que combine diferentes productos según tus objetivos, horizonte temporal y tolerancia al riesgo.</p>
        </div>
      </>
    ),
  },
  {
    title: 'Acciones: Conviértete en Propietario',
    icon: '📈',
    content: (
      <>
        <p>Las <strong>acciones</strong> representan participaciones en la propiedad de una empresa. Al comprar acciones, te conviertes en accionista y tienes derecho a una parte de los beneficios y activos de la empresa.</p>

        <h3>Tipos de acciones</h3>

        <div className={styles.exampleGrid}>
          <div className={styles.exampleCard}>
            <div className={styles.exampleLogo}>📈</div>
            <div className={styles.exampleName}>Acciones de Crecimiento (Growth)</div>
            <div className={styles.exampleDesc}>
              <strong>Riesgo:</strong> Alto<br />
              Empresas con alto potencial de crecimiento (ej: Tesla, startups tecnológicas).<br />
              <strong>Pros:</strong> Alto potencial de revalorización<br />
              <strong>Contras:</strong> Alta volatilidad, pocos dividendos
            </div>
          </div>
          <div className={styles.exampleCard}>
            <div className={styles.exampleLogo}>💎</div>
            <div className={styles.exampleName}>Acciones de Valor (Value)</div>
            <div className={styles.exampleDesc}>
              <strong>Riesgo:</strong> Medio<br />
              Empresas sólidas infravaloradas (ej: Berkshire, bancos consolidados).<br />
              <strong>Pros:</strong> Dividendos estables, menor volatilidad<br />
              <strong>Contras:</strong> Crecimiento más lento
            </div>
          </div>
        </div>

        <div className={styles.exampleGrid}>
          <div className={styles.exampleCard}>
            <div className={styles.exampleLogo}>💰</div>
            <div className={styles.exampleName}>Acciones de Dividendos</div>
            <div className={styles.exampleDesc}>
              <strong>Riesgo:</strong> Medio-Bajo<br />
              Empresas que reparten beneficios regularmente (ej: Coca-Cola, Telefónica).<br />
              <strong>Pros:</strong> Ingresos pasivos recurrentes<br />
              <strong>Contras:</strong> Menos reinversión para crecimiento
            </div>
          </div>
          <div className={styles.exampleCard}>
            <div className={styles.exampleLogo}>🏢</div>
            <div className={styles.exampleName}>Blue Chips</div>
            <div className={styles.exampleDesc}>
              <strong>Riesgo:</strong> Medio<br />
              Grandes empresas establecidas y reconocidas (ej: Apple, Microsoft, BBVA).<br />
              <strong>Pros:</strong> Estabilidad, liquidez<br />
              <strong>Contras:</strong> Crecimiento moderado
            </div>
          </div>
        </div>
      </>
    ),
  },
  {
    title: 'Bonos: Conviértete en Prestamista',
    icon: '📊',
    content: (
      <>
        <p>Los <strong>bonos</strong> son instrumentos de deuda. Cuando compras un bono, estás prestando dinero a una empresa o gobierno a cambio de intereses periódicos y la devolución del principal al vencimiento.</p>

        <h3>Tipos de bonos</h3>

        <table className={styles.comparisonTable}>
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Emisor</th>
              <th>Riesgo</th>
              <th>Rentabilidad típica</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Letras del Tesoro</strong></td>
              <td>Estado español</td>
              <td>Muy bajo</td>
              <td>2-4%</td>
            </tr>
            <tr>
              <td><strong>Bonos del Estado</strong></td>
              <td>Estado español</td>
              <td>Bajo</td>
              <td>3-5%</td>
            </tr>
            <tr>
              <td><strong>Bonos corporativos (IG)</strong></td>
              <td>Empresas sólidas</td>
              <td>Medio</td>
              <td>4-6%</td>
            </tr>
            <tr>
              <td><strong>High Yield (Bonos basura)</strong></td>
              <td>Empresas con riesgo</td>
              <td>Alto</td>
              <td>6-10%+</td>
            </tr>
          </tbody>
        </table>

        <div className={styles.highlightBox}>
          <p><strong>📌 Relación inversa:</strong> Cuando los tipos de interés suben, el precio de los bonos baja, y viceversa. Esto es fundamental para entender la renta fija.</p>
        </div>

        <h3>Ventajas y desventajas</h3>
        <ul>
          <li><strong>✅ Ventajas:</strong> Ingresos predecibles, menor volatilidad que acciones, diversificación</li>
          <li><strong>❌ Desventajas:</strong> Rentabilidad limitada, riesgo de inflación, riesgo de tipos de interés</li>
        </ul>
      </>
    ),
  },
  {
    title: 'ETFs y Fondos de Inversión',
    icon: '📦',
    content: (
      <>
        <p>Los <strong>fondos de inversión</strong> y <strong>ETFs</strong> son vehículos que agrupan el dinero de muchos inversores para invertir en una cesta diversificada de activos.</p>

        <h3>Comparativa ETFs vs Fondos Tradicionales</h3>

        <table className={styles.comparisonTable}>
          <thead>
            <tr>
              <th>Característica</th>
              <th>ETFs</th>
              <th>Fondos Tradicionales</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Cotización</strong></td>
              <td>En bolsa (tiempo real)</td>
              <td>Una vez al día (valor liquidativo)</td>
            </tr>
            <tr>
              <td><strong>Comisiones</strong></td>
              <td>Muy bajas (0,03%-0,50%)</td>
              <td>Variables (0,50%-2%)</td>
            </tr>
            <tr>
              <td><strong>Gestión</strong></td>
              <td>Mayormente pasiva</td>
              <td>Activa o pasiva</td>
            </tr>
            <tr>
              <td><strong>Transparencia</strong></td>
              <td>Composición diaria</td>
              <td>Trimestral/semestral</td>
            </tr>
            <tr>
              <td><strong>Fiscalidad España</strong></td>
              <td>No traspasable sin tributar</td>
              <td>Traspaso sin tributar</td>
            </tr>
          </tbody>
        </table>

        <div className={styles.infoBox}>
          <p><strong>💡 En España:</strong> Los fondos tradicionales tienen una ventaja fiscal importante: puedes traspasar entre fondos sin tributar hasta el momento del reembolso final.</p>
        </div>

        <h3>ETFs más populares</h3>
        <ul>
          <li><strong>MSCI World:</strong> Exposición a +1.500 empresas de países desarrollados</li>
          <li><strong>S&P 500:</strong> Las 500 mayores empresas de EEUU</li>
          <li><strong>MSCI Emerging Markets:</strong> Mercados emergentes (China, India, Brasil...)</li>
          <li><strong>Aggregate Bond:</strong> Bonos diversificados a nivel global</li>
        </ul>
      </>
    ),
  },
  {
    title: 'Otros Productos de Inversión',
    icon: '🎯',
    content: (
      <>
        <h3>REITs (Socimis en España)</h3>
        <p>Sociedades que invierten en inmuebles y reparten la mayoría de beneficios como dividendos. Permiten invertir en inmobiliario sin comprar propiedades directamente.</p>
        <ul>
          <li><strong>Ventajas:</strong> Dividendos altos, diversificación inmobiliaria, liquidez</li>
          <li><strong>Riesgo:</strong> Medio-Alto (sensibles a tipos de interés)</li>
        </ul>

        <h3>Materias Primas (Commodities)</h3>
        <p>Oro, plata, petróleo, gas natural, productos agrícolas... Generalmente se invierte a través de ETFs o futuros.</p>
        <ul>
          <li><strong>Oro:</strong> Refugio tradicional en tiempos de incertidumbre</li>
          <li><strong>Petróleo:</strong> Alta volatilidad, ligado a geopolítica</li>
        </ul>

        <h3>Criptomonedas</h3>
        <div className={styles.warningBox}>
          <p><strong>⚠️ Advertencia:</strong> Las criptomonedas son activos de muy alto riesgo y volatilidad extrema. Solo invierte dinero que puedas permitirte perder completamente.</p>
        </div>
        <ul>
          <li><strong>Bitcoin:</strong> La criptomoneda original, "oro digital"</li>
          <li><strong>Ethereum:</strong> Plataforma para aplicaciones descentralizadas</li>
          <li><strong>Riesgo:</strong> Muy alto (caídas del 80%+ son comunes)</li>
        </ul>

        <h3>Planes de Pensiones</h3>
        <p>Productos específicos para la jubilación con ventajas fiscales en la aportación pero penalizaciones por rescate anticipado.</p>
        <ul>
          <li><strong>Ventaja fiscal:</strong> Aportaciones deducibles en IRPF (hasta 1.500€/año)</li>
          <li><strong>Inconveniente:</strong> Ilíquido hasta jubilación, comisiones históricamente altas</li>
        </ul>
      </>
    ),
  },
  {
    title: 'Cómo Elegir Productos',
    icon: '🎲',
    content: (
      <>
        <p>La elección de productos debe basarse en tu situación personal:</p>

        <h3>Matriz de decisión</h3>

        <table className={styles.comparisonTable}>
          <thead>
            <tr>
              <th>Si eres...</th>
              <th>Horizonte</th>
              <th>Productos recomendados</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Joven (20-35)</strong></td>
              <td>+20 años</td>
              <td>ETFs de renta variable global (80-100%)</td>
            </tr>
            <tr>
              <td><strong>Mediana edad (35-50)</strong></td>
              <td>10-20 años</td>
              <td>Mix RV/RF (60-80% acciones)</td>
            </tr>
            <tr>
              <td><strong>Pre-jubilación (50-65)</strong></td>
              <td>5-15 años</td>
              <td>Mix conservador (40-60% acciones)</td>
            </tr>
            <tr>
              <td><strong>Jubilado (+65)</strong></td>
              <td>Variable</td>
              <td>Enfoque en rentas (bonos, dividendos)</td>
            </tr>
          </tbody>
        </table>

        <div className={styles.highlightBox}>
          <p><strong>📌 Regla general:</strong> Cuanto mayor sea tu horizonte temporal, más riesgo puedes asumir porque tienes tiempo para recuperarte de las caídas del mercado.</p>
        </div>

        <h3>Preguntas clave antes de invertir</h3>
        <ol>
          <li>¿Cuándo necesitaré este dinero?</li>
          <li>¿Cuánta pérdida temporal puedo soportar sin vender?</li>
          <li>¿Entiendo cómo funciona este producto?</li>
          <li>¿Cuáles son las comisiones reales?</li>
          <li>¿Cómo tributa en España?</li>
        </ol>
      </>
    ),
  },
];

export default function ProductosFinancierosPage() {
  return <ChapterPage slug="productos-financieros" sections={sections} />;
}
