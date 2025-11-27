'use client';

import ChapterPage from '../ChapterPage';
import styles from '../CursoInversion.module.css';

const sections = [
  {
    title: '¿Qué es Asset Allocation?',
    icon: '🥧',
    content: (
      <>
        <p>El <strong>Asset Allocation</strong> (distribución de activos) es la decisión más importante que tomarás como inversor. Consiste en dividir tu cartera entre diferentes clases de activos para optimizar la relación riesgo-rentabilidad.</p>

        <div className={styles.highlightBox}>
          <p><strong>📊 Dato clave:</strong> Estudios académicos demuestran que el asset allocation explica más del 90% de la variabilidad de los retornos de una cartera a largo plazo. La selección de valores individuales tiene mucho menos impacto.</p>
        </div>

        <h3>Clases de activos principales</h3>
        <ul>
          <li><strong>Renta Variable (RV):</strong> Acciones de empresas</li>
          <li><strong>Renta Fija (RF):</strong> Bonos gubernamentales y corporativos</li>
          <li><strong>Efectivo:</strong> Cuentas de ahorro, fondos monetarios</li>
          <li><strong>Inmobiliario:</strong> REITs, Socimis, propiedades directas</li>
          <li><strong>Materias primas:</strong> Oro, petróleo, commodities</li>
          <li><strong>Alternativos:</strong> Private equity, hedge funds, criptomonedas</li>
        </ul>
      </>
    ),
  },
  {
    title: 'Perfiles de Riesgo',
    icon: '🎯',
    content: (
      <>
        <p>Tu perfil de riesgo determina qué distribución de activos es adecuada para ti.</p>

        <table className={styles.comparisonTable}>
          <thead>
            <tr>
              <th>Perfil</th>
              <th>Renta Variable</th>
              <th>Renta Fija</th>
              <th>Caída máxima esperada</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Muy conservador</strong></td>
              <td>10-20%</td>
              <td>80-90%</td>
              <td>-5% a -10%</td>
            </tr>
            <tr>
              <td><strong>Conservador</strong></td>
              <td>30-40%</td>
              <td>60-70%</td>
              <td>-10% a -20%</td>
            </tr>
            <tr>
              <td><strong>Moderado</strong></td>
              <td>50-60%</td>
              <td>40-50%</td>
              <td>-20% a -30%</td>
            </tr>
            <tr>
              <td><strong>Agresivo</strong></td>
              <td>70-80%</td>
              <td>20-30%</td>
              <td>-30% a -40%</td>
            </tr>
            <tr>
              <td><strong>Muy agresivo</strong></td>
              <td>90-100%</td>
              <td>0-10%</td>
              <td>-40% a -50%</td>
            </tr>
          </tbody>
        </table>

        <h3>Factores que determinan tu perfil</h3>
        <div className={styles.exampleGrid}>
          <div className={styles.exampleCard}>
            <div className={styles.exampleLogo}>📅</div>
            <div className={styles.exampleName}>Horizonte temporal</div>
            <div className={styles.exampleDesc}>
              Más tiempo = Más riesgo posible<br />
              +20 años: Puedes ser muy agresivo<br />
              5-10 años: Moderado<br />
              &lt;5 años: Conservador
            </div>
          </div>
          <div className={styles.exampleCard}>
            <div className={styles.exampleLogo}>💪</div>
            <div className={styles.exampleName}>Capacidad de riesgo</div>
            <div className={styles.exampleDesc}>
              Ingresos estables, fondo de emergencia, sin deudas = Mayor capacidad<br />
              Situación precaria = Menor capacidad
            </div>
          </div>
        </div>

        <div className={styles.infoBox}>
          <p><strong>💡 Regla del pulgar:</strong> "Tu edad en renta fija" es una regla simple pero útil. Con 30 años: 30% RF, 70% RV. Con 60 años: 60% RF, 40% RV.</p>
        </div>
      </>
    ),
  },
  {
    title: 'Carteras Modelo',
    icon: '📋',
    content: (
      <>
        <p>Algunas carteras modelo populares y probadas en el tiempo:</p>

        <h3>Cartera 60/40 (Clásica)</h3>
        <ul>
          <li>60% Acciones globales (ETF MSCI World)</li>
          <li>40% Bonos globales (ETF Aggregate Bond)</li>
        </ul>
        <p><em>Rentabilidad histórica: ~7% anual. Volatilidad moderada.</em></p>

        <h3>Cartera Boglehead de 3 Fondos</h3>
        <ul>
          <li>40% Acciones EEUU (S&P 500)</li>
          <li>20% Acciones internacionales (ex-US)</li>
          <li>40% Bonos totales (US Aggregate)</li>
        </ul>
        <p><em>Simple, diversificada, bajos costes.</em></p>

        <h3>Cartera All-Weather (Ray Dalio)</h3>
        <ul>
          <li>30% Acciones</li>
          <li>40% Bonos largo plazo</li>
          <li>15% Bonos medio plazo</li>
          <li>7,5% Oro</li>
          <li>7,5% Materias primas</li>
        </ul>
        <p><em>Diseñada para funcionar en cualquier entorno económico.</em></p>

        <h3>Cartera Permanente (Harry Browne)</h3>
        <ul>
          <li>25% Acciones</li>
          <li>25% Bonos largo plazo</li>
          <li>25% Oro</li>
          <li>25% Efectivo</li>
        </ul>
        <p><em>Muy conservadora, baja volatilidad, funciona en crisis.</em></p>

        <div className={styles.warningBox}>
          <p><strong>⚠️ Importante:</strong> Estas carteras son ejemplos educativos. Debes adaptar cualquier modelo a tu situación personal, fiscalidad española y objetivos específicos.</p>
        </div>
      </>
    ),
  },
  {
    title: 'Implementación Práctica en España',
    icon: '🇪🇸',
    content: (
      <>
        <h3>ETFs vs Fondos Indexados en España</h3>
        <p>Para inversores españoles, hay una consideración fiscal importante:</p>

        <table className={styles.comparisonTable}>
          <thead>
            <tr>
              <th>Aspecto</th>
              <th>ETFs</th>
              <th>Fondos Indexados</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Traspaso sin tributar</strong></td>
              <td>❌ No</td>
              <td>✅ Sí</td>
            </tr>
            <tr>
              <td><strong>Comisiones</strong></td>
              <td>Muy bajas (0,03-0,20%)</td>
              <td>Bajas (0,10-0,30%)</td>
            </tr>
            <tr>
              <td><strong>Comisión de compra</strong></td>
              <td>Sí (broker)</td>
              <td>No (generalmente)</td>
            </tr>
            <tr>
              <td><strong>Variedad</strong></td>
              <td>Enorme</td>
              <td>Limitada</td>
            </tr>
          </tbody>
        </table>

        <div className={styles.highlightBox}>
          <p><strong>📌 Recomendación España:</strong> Para la mayoría de inversores españoles, los fondos indexados son preferibles por la ventaja fiscal del traspaso. Solo usa ETFs si la diferencia de costes es muy significativa o necesitas un activo no disponible en fondos.</p>
        </div>

        <h3>Proveedores populares en España</h3>
        <ul>
          <li><strong>Fondos indexados:</strong> Vanguard (vía Openbank, MyInvestor), Amundi, iShares</li>
          <li><strong>Roboadvisors:</strong> Indexa Capital, Finizens, MyInvestor Cartera Indexada</li>
          <li><strong>ETFs:</strong> iShares, Vanguard, Amundi (vía Interactive Brokers, DEGIRO)</li>
        </ul>
      </>
    ),
  },
  {
    title: 'Rebalanceo de Cartera',
    icon: '⚖️',
    content: (
      <>
        <p>El <strong>rebalanceo</strong> es el proceso de devolver tu cartera a su asignación objetivo cuando se ha desviado debido a movimientos del mercado.</p>

        <h3>¿Por qué rebalancear?</h3>
        <ul>
          <li>Mantiene tu nivel de riesgo constante</li>
          <li>Te "obliga" a vender caro y comprar barato</li>
          <li>Disciplina automática contra las emociones</li>
        </ul>

        <h3>Métodos de rebalanceo</h3>
        <div className={styles.exampleGrid}>
          <div className={styles.exampleCard}>
            <div className={styles.exampleLogo}>📅</div>
            <div className={styles.exampleName}>Por tiempo</div>
            <div className={styles.exampleDesc}>
              Rebalanceas cada 6 o 12 meses, independientemente de la desviación.<br />
              <strong>Pros:</strong> Simple, predecible<br />
              <strong>Contras:</strong> Puede rebalancear innecesariamente
            </div>
          </div>
          <div className={styles.exampleCard}>
            <div className={styles.exampleLogo}>📊</div>
            <div className={styles.exampleName}>Por bandas</div>
            <div className={styles.exampleDesc}>
              Rebalanceas cuando un activo se desvía más de X% (ej: ±5%).<br />
              <strong>Pros:</strong> Solo cuando es necesario<br />
              <strong>Contras:</strong> Requiere monitoreo
            </div>
          </div>
        </div>

        <h3>Ejemplo práctico</h3>
        <p>Cartera objetivo: 70% RV / 30% RF</p>
        <ul>
          <li>Inicio: 70.000€ acciones + 30.000€ bonos = 100.000€</li>
          <li>Tras un año alcista: 91.000€ acciones + 31.000€ bonos = 122.000€</li>
          <li>Nueva proporción: 74,6% RV / 25,4% RF (desviación)</li>
          <li>Rebalanceo: Vender 6.400€ en acciones, comprar bonos → volver a 70/30</li>
        </ul>

        <div className={styles.infoBox}>
          <p><strong>💡 Truco fiscal España:</strong> En lugar de vender para rebalancear (tributa), dirige las nuevas aportaciones al activo infraponderado. Así rebalanceas sin coste fiscal.</p>
        </div>
      </>
    ),
  },
];

export default function AssetAllocationPage() {
  return <ChapterPage slug="asset-allocation" sections={sections} />;
}
