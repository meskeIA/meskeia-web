'use client';

import { LegalNotice } from '@/components';
import ChapterPage from '../ChapterPage';
import styles from '../CursoInversion.module.css';

const sections = [
  {
    title: '¿Qué es el Riesgo en Inversiones?',
    icon: '⚠️',
    content: (
      <>
        <p>El <strong>riesgo</strong> en inversiones se refiere a la posibilidad de que los resultados reales difieran de los esperados. No es solo la posibilidad de perder dinero, sino también la incertidumbre sobre los retornos.</p>

        <div className={styles.infoBox}>
          <p><strong>💡 Principio fundamental:</strong> Mayor riesgo = Mayor rentabilidad potencial. No existe rentabilidad sin riesgo. La clave está en asumir riesgos calculados y compensados.</p>
        </div>

        <h3>Tipos de riesgo</h3>
        <ul>
          <li><strong>Riesgo de mercado:</strong> Movimientos generales del mercado (sistemático, no diversificable)</li>
          <li><strong>Riesgo específico:</strong> Problemas de una empresa concreta (diversificable)</li>
          <li><strong>Riesgo de tipos de interés:</strong> Afecta especialmente a bonos</li>
          <li><strong>Riesgo de divisa:</strong> Fluctuaciones en tipos de cambio</li>
          <li><strong>Riesgo de inflación:</strong> Pérdida de poder adquisitivo</li>
          <li><strong>Riesgo de liquidez:</strong> Dificultad para vender un activo</li>
        </ul>
      </>
    ),
  },
  {
    title: 'Volatilidad: Midiendo el Riesgo',
    icon: '📊',
    content: (
      <>
        <p>La <strong>volatilidad</strong> mide cuánto fluctúa el precio de un activo. Se expresa como desviación estándar de los retornos.</p>

        <h3>Interpretación de la volatilidad</h3>
        <table className={styles.comparisonTable}>
          <thead>
            <tr>
              <th>Volatilidad anual</th>
              <th>Interpretación</th>
              <th>Ejemplo</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>&lt; 10%</td>
              <td>Baja volatilidad</td>
              <td>Bonos gubernamentales</td>
            </tr>
            <tr>
              <td>10-20%</td>
              <td>Volatilidad moderada</td>
              <td>Índices diversificados (S&P 500)</td>
            </tr>
            <tr>
              <td>20-30%</td>
              <td>Alta volatilidad</td>
              <td>Acciones individuales</td>
            </tr>
            <tr>
              <td>&gt; 30%</td>
              <td>Muy alta volatilidad</td>
              <td>Criptomonedas, startups</td>
            </tr>
          </tbody>
        </table>

        <div className={styles.warningBox}>
          <p><strong>⚠️ Volatilidad no es lo mismo que riesgo:</strong> Un activo puede ser volátil pero dar buenos retornos a largo plazo. El verdadero riesgo para un inversor a largo plazo es la pérdida permanente de capital.</p>
        </div>
      </>
    ),
  },
  {
    title: 'Diversificación: Tu Mejor Defensa',
    icon: '🛡️',
    content: (
      <>
        <p>La <strong>diversificación</strong> es la estrategia más efectiva para reducir el riesgo sin sacrificar rentabilidad. "No pongas todos los huevos en la misma cesta."</p>

        <h3>Niveles de diversificación</h3>
        <ol>
          <li><strong>Por activos:</strong> Acciones, bonos, inmobiliario, materias primas</li>
          <li><strong>Por geografía:</strong> EEUU, Europa, Asia, emergentes</li>
          <li><strong>Por sectores:</strong> Tecnología, salud, finanzas, consumo</li>
          <li><strong>Por tamaño:</strong> Large cap, mid cap, small cap</li>
          <li><strong>Por estilo:</strong> Value, growth, dividendos</li>
        </ol>

        <div className={styles.highlightBox}>
          <p><strong>📊 El poder de la diversificación:</strong> Con solo 20-30 acciones de diferentes sectores, eliminas aproximadamente el 95% del riesgo específico. Un ETF global te da esta diversificación automáticamente.</p>
        </div>

        <h3>Correlación entre activos</h3>
        <p>La diversificación funciona mejor cuando los activos tienen <strong>baja correlación</strong> (no se mueven juntos):</p>
        <ul>
          <li><strong>Correlación +1:</strong> Se mueven exactamente igual (no diversifica)</li>
          <li><strong>Correlación 0:</strong> Movimientos independientes (buena diversificación)</li>
          <li><strong>Correlación -1:</strong> Se mueven en direcciones opuestas (máxima diversificación)</li>
        </ul>
      </>
    ),
  },
  {
    title: 'Drawdown y Recuperación',
    icon: '📉',
    content: (
      <>
        <p>El <strong>drawdown</strong> es la caída desde un máximo hasta un mínimo. Es una medida crucial del riesgo real que sentirás como inversor.</p>

        <h3>Drawdowns históricos del S&P 500</h3>
        <table className={styles.comparisonTable}>
          <thead>
            <tr>
              <th>Crisis</th>
              <th>Caída máxima</th>
              <th>Tiempo recuperación</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Crisis 2008</td>
              <td>-57%</td>
              <td>4 años</td>
            </tr>
            <tr>
              <td>Burbuja punto-com (2000)</td>
              <td>-49%</td>
              <td>7 años</td>
            </tr>
            <tr>
              <td>COVID-19 (2020)</td>
              <td>-34%</td>
              <td>5 meses</td>
            </tr>
            <tr>
              <td>Corrección 2022</td>
              <td>-25%</td>
              <td>~2 años</td>
            </tr>
          </tbody>
        </table>

        <div className={styles.warningBox}>
          <p><strong>⚠️ Matemática de las pérdidas:</strong><br />
          • Una caída del 50% requiere una subida del 100% para recuperarse<br />
          • Una caída del 33% requiere una subida del 50%<br />
          Por eso es crucial limitar las pérdidas máximas.</p>
        </div>
      </>
    ),
  },
  {
    title: 'Beta y Ratio de Sharpe',
    icon: '📐',
    content: (
      <>
        <h3>Beta (β)</h3>
        <p>La <strong>beta</strong> mide la sensibilidad de un activo respecto al mercado:</p>
        <ul>
          <li><strong>Beta = 1:</strong> Se mueve igual que el mercado</li>
          <li><strong>Beta &gt; 1:</strong> Más volátil que el mercado (ej: tecnológicas)</li>
          <li><strong>Beta &lt; 1:</strong> Menos volátil que el mercado (ej: utilities)</li>
          <li><strong>Beta negativa:</strong> Se mueve en dirección opuesta (raro)</li>
        </ul>

        <h3>Ratio de Sharpe</h3>
        <p>El <strong>Sharpe Ratio</strong> mide la rentabilidad ajustada al riesgo:</p>
        <div className={styles.highlightBox}>
          <p><strong>Sharpe = (Rentabilidad - Tipo libre de riesgo) / Volatilidad</strong><br /><br />
          Interpretación:<br />
          • &lt; 1: Rendimiento ajustado al riesgo pobre<br />
          • 1-2: Bueno<br />
          • &gt; 2: Excelente</p>
        </div>

        <div className={styles.infoBox}>
          <p><strong>💡 En la práctica:</strong> Un fondo con rentabilidad del 8% y volatilidad del 10% (Sharpe ~0,6) puede ser peor opción que uno con 6% de rentabilidad y 5% de volatilidad (Sharpe ~0,8).</p>
        </div>
      </>
    ),
  },
  {
    title: 'Estrategias de Gestión de Riesgo',
    icon: '🎯',
    content: (
      <>
        <h3>1. Asset Allocation estratégico</h3>
        <p>Define un porcentaje fijo entre activos según tu perfil y mantente en él:</p>
        <ul>
          <li><strong>Agresivo:</strong> 90% RV / 10% RF</li>
          <li><strong>Moderado:</strong> 60% RV / 40% RF</li>
          <li><strong>Conservador:</strong> 30% RV / 70% RF</li>
        </ul>

        <h3>2. Rebalanceo periódico</h3>
        <p>Cuando tu cartera se desvía de la asignación objetivo, rebalancea vendiendo lo que ha subido y comprando lo que ha bajado.</p>

        <h3>3. Stop-loss (con cautela)</h3>
        <p>Órdenes automáticas de venta si un activo cae un porcentaje. Útil para traders, pero cuidado con los "whipsaws" (falsas señales).</p>

        <h3>4. Hedging con derivados</h3>
        <p>Opciones PUT para proteger posiciones. Solo para inversores avanzados.</p>

        <div className={styles.highlightBox}>
          <p><strong>📌 La mejor gestión de riesgo:</strong> Conocerte a ti mismo. Si una caída del 30% te hará vender en pánico, no tengas 100% en renta variable. El riesgo máximo es el que puedes soportar sin tomar malas decisiones.</p>
        </div>
      </>
    ),
  },
];

export default function GestionRiesgoPage() {
  return <ChapterPage slug="gestion-riesgo" sections={sections} />;
}
