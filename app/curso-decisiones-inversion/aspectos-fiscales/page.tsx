'use client';

import { LegalNotice } from '@/components';
import ChapterPage from '../ChapterPage';
import styles from '../CursoInversion.module.css';

const sections = [
  {
    title: 'Fiscalidad de las Inversiones en España',
    icon: '📋',
    content: (
      <>
        <p>Entender la fiscalidad es fundamental para maximizar la rentabilidad neta de tus inversiones. En España, las ganancias de inversiones tributan en la <strong>base del ahorro del IRPF</strong>.</p>

        <div className={styles.warningBox}>
          <p><strong>⚠️ Aviso importante:</strong> La normativa fiscal puede cambiar. Este contenido es educativo y no sustituye el asesoramiento de un profesional fiscal. Consulta siempre con un asesor para tu situación concreta.</p>
        </div>

        <h3>Tramos de la base del ahorro (2024)</h3>
        <table className={styles.comparisonTable}>
          <thead>
            <tr>
              <th>Base liquidable</th>
              <th>Tipo estatal</th>
              <th>Tipo autonómico*</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Hasta 6.000€</td>
              <td>9,5%</td>
              <td>9,5%</td>
              <td><strong>19%</strong></td>
            </tr>
            <tr>
              <td>6.000€ - 50.000€</td>
              <td>10,5%</td>
              <td>10,5%</td>
              <td><strong>21%</strong></td>
            </tr>
            <tr>
              <td>50.000€ - 200.000€</td>
              <td>11,5%</td>
              <td>11,5%</td>
              <td><strong>23%</strong></td>
            </tr>
            <tr>
              <td>200.000€ - 300.000€</td>
              <td>13,5%</td>
              <td>13,5%</td>
              <td><strong>27%</strong></td>
            </tr>
            <tr>
              <td>Más de 300.000€</td>
              <td>14%</td>
              <td>14%</td>
              <td><strong>28%</strong></td>
            </tr>
          </tbody>
        </table>
        <p><em>* El tipo autonómico puede variar según comunidad autónoma.</em></p>
      </>
    ),
  },
  {
    title: 'Ganancias y Pérdidas Patrimoniales',
    icon: '📈',
    content: (
      <>
        <p>Las <strong>ganancias patrimoniales</strong> se producen cuando vendes un activo por más de lo que pagaste.</p>

        <h3>Cálculo de la ganancia</h3>
        <div className={styles.highlightBox}>
          <p><strong>Ganancia = Precio de venta - Precio de compra - Gastos</strong><br /><br />
          Ejemplo:<br />
          • Compras 100 acciones a 10€ = 1.000€ + 5€ comisión = 1.005€<br />
          • Vendes a 15€ = 1.500€ - 5€ comisión = 1.495€<br />
          • Ganancia patrimonial = 1.495€ - 1.005€ = <strong>490€</strong><br />
          • Tributación (19%) = 93,10€</p>
        </div>

        <h3>Compensación de pérdidas</h3>
        <p>Las pérdidas patrimoniales pueden compensar ganancias:</p>
        <ol>
          <li>Primero compensas pérdidas con ganancias del mismo año</li>
          <li>Si quedan pérdidas, puedes compensar hasta el 25% de rendimientos del capital (dividendos, intereses)</li>
          <li>Las pérdidas no compensadas se arrastran 4 años</li>
        </ol>

        <div className={styles.warningBox}>
          <p><strong>⚠️ Regla de los 2 meses:</strong> Si vendes con pérdidas y recompras el mismo valor en los 2 meses anteriores o posteriores, NO puedes compensar esa pérdida fiscalmente. Es la norma "antiaplicación" española.</p>
        </div>
      </>
    ),
  },
  {
    title: 'Dividendos e Intereses',
    icon: '💰',
    content: (
      <>
        <p>Los <strong>rendimientos del capital mobiliario</strong> incluyen dividendos, intereses y cupones de bonos.</p>

        <h3>Tributación de dividendos</h3>
        <ul>
          <li>Tributan al tipo de la base del ahorro (19-28%)</li>
          <li>El broker español retiene el 19% automáticamente</li>
          <li>En la declaración se ajusta según tu tramo real</li>
        </ul>

        <h3>Dividendos de acciones extranjeras</h3>
        <p>Sufren <strong>doble retención</strong>:</p>
        <ol>
          <li>Retención en origen (país de la empresa)</li>
          <li>Retención en España (19%)</li>
        </ol>

        <table className={styles.comparisonTable}>
          <thead>
            <tr>
              <th>País</th>
              <th>Retención origen</th>
              <th>Recuperable en IRPF</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>EEUU (con W-8BEN)</td>
              <td>15%</td>
              <td>Sí, hasta 15%</td>
            </tr>
            <tr>
              <td>Alemania</td>
              <td>26,375%</td>
              <td>Sí, hasta 15%</td>
            </tr>
            <tr>
              <td>Francia</td>
              <td>25%</td>
              <td>Sí, hasta 15%</td>
            </tr>
            <tr>
              <td>Reino Unido</td>
              <td>0%</td>
              <td>N/A</td>
            </tr>
            <tr>
              <td>Irlanda</td>
              <td>0% (ETFs)</td>
              <td>N/A</td>
            </tr>
          </tbody>
        </table>

        <div className={styles.infoBox}>
          <p><strong>💡 Consejo:</strong> Para evitar la doble imposición ineficiente, prioriza ETFs de acumulación domiciliados en Irlanda. No reparten dividendos, por lo que no sufres retenciones y difiere la tributación.</p>
        </div>
      </>
    ),
  },
  {
    title: 'Fondos de Inversión: Ventaja Fiscal',
    icon: '🎁',
    content: (
      <>
        <p>Los <strong>fondos de inversión</strong> tienen un tratamiento fiscal privilegiado en España.</p>

        <h3>Traspaso sin tributación</h3>
        <p>Puedes traspasar de un fondo a otro <strong>sin tributar</strong> hasta el momento del reembolso final. Esto permite:</p>
        <ul>
          <li>Cambiar de estrategia sin coste fiscal</li>
          <li>Rebalancear la cartera sin tributar</li>
          <li>Diferir impuestos durante décadas</li>
          <li>El efecto compuesto actúa sobre el importe bruto</li>
        </ul>

        <div className={styles.highlightBox}>
          <p><strong>📊 Ejemplo del poder del diferimiento:</strong><br /><br />
          Inversión inicial: 10.000€, rentabilidad 7% anual, 30 años<br /><br />
          <strong>Con ETF (tributas cada vez que rebalanceas):</strong><br />
          Resultado aproximado: ~55.000€<br /><br />
          <strong>Con fondos (difiere impuestos):</strong><br />
          Resultado aproximado: ~76.000€<br /><br />
          Diferencia: +21.000€ solo por diferir impuestos.</p>
        </div>

        <h3>¿ETF o Fondo?</h3>
        <table className={styles.comparisonTable}>
          <thead>
            <tr>
              <th>Situación</th>
              <th>Mejor opción</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Vas a rebalancear frecuentemente</td>
              <td>Fondos indexados</td>
            </tr>
            <tr>
              <td>Buy & hold puro sin cambios</td>
              <td>ETF (menores comisiones)</td>
            </tr>
            <tr>
              <td>Necesitas flexibilidad fiscal</td>
              <td>Fondos indexados</td>
            </tr>
            <tr>
              <td>Quieres activos muy específicos</td>
              <td>ETF (mayor variedad)</td>
            </tr>
          </tbody>
        </table>
      </>
    ),
  },
  {
    title: 'Planes de Pensiones',
    icon: '👴',
    content: (
      <>
        <p>Los <strong>planes de pensiones</strong> tienen un tratamiento fiscal especial diseñado para incentivar el ahorro para la jubilación.</p>

        <h3>Ventaja fiscal en aportación</h3>
        <ul>
          <li>Las aportaciones reducen la base imponible del IRPF</li>
          <li>Límite actual: <strong>1.500€/año</strong> (reducido desde 8.000€)</li>
          <li>Ahorro fiscal = aportación × tipo marginal (hasta 47%)</li>
        </ul>

        <h3>Tributación en el rescate</h3>
        <div className={styles.warningBox}>
          <p><strong>⚠️ Cuidado:</strong> Al rescatar, TODO tributa como rendimiento del trabajo (no como ahorro). Esto puede suponer tipos del 19% al 47%, dependiendo de tus ingresos totales ese año.</p>
        </div>

        <h3>¿Merece la pena?</h3>
        <p>Depende de tu situación:</p>
        <ul>
          <li><strong>Sí vale la pena:</strong> Si tu tipo marginal actual es muy alto y esperas uno bajo en jubilación</li>
          <li><strong>No vale la pena:</strong> Si tu tipo marginal es similar ahora y en jubilación</li>
          <li><strong>Alternativa:</strong> Fondos indexados (tributación más favorable al rescatar)</li>
        </ul>

        <h3>Planes de empleo</h3>
        <p>Los planes de pensiones de empresa tienen un límite adicional de hasta 8.500€/año, lo que los hace más atractivos si tu empresa los ofrece.</p>

        <div className={styles.infoBox}>
          <p><strong>💡 Estrategia:</strong> Si tienes acceso a un plan de empleo con aportación de la empresa (matching), aprovéchalo primero. Es "dinero gratis". Luego valora si los 1.500€ individuales compensan en tu caso.</p>
        </div>
      </>
    ),
  },
  {
    title: 'Declaración de la Renta: Inversiones',
    icon: '📄',
    content: (
      <>
        <p>Consejos prácticos para la declaración de la renta:</p>

        <h3>Documentación necesaria</h3>
        <ul>
          <li>Informe fiscal del broker (lo proporcionan en Q1)</li>
          <li>Certificados de retenciones</li>
          <li>Historial de compras y ventas</li>
          <li>Justificantes de gastos deducibles</li>
        </ul>

        <h3>Casillas importantes</h3>
        <ul>
          <li><strong>Casilla 0029:</strong> Dividendos y participaciones en beneficios</li>
          <li><strong>Casilla 0310-0318:</strong> Ganancias y pérdidas patrimoniales por transmisión de acciones</li>
          <li><strong>Casilla 0328:</strong> Compensación de pérdidas años anteriores</li>
        </ul>

        <h3>Errores comunes a evitar</h3>
        <ol>
          <li><strong>Olvidar dividendos extranjeros:</strong> Aunque ya te retuvieron, debes declararlos</li>
          <li><strong>No incluir comisiones:</strong> Son gastos deducibles del precio de compra/venta</li>
          <li><strong>Confundir FIFO:</strong> En España se aplica el método FIFO (primeras compradas, primeras vendidas)</li>
          <li><strong>No compensar pérdidas:</strong> Puedes arrastrarlas 4 años</li>
        </ol>

        <div className={styles.highlightBox}>
          <p><strong>📌 Consejo:</strong> Los brokers españoles suelen enviar la información fiscal directamente a Hacienda. Aun así, revisa siempre el borrador porque puede haber errores, especialmente con inversiones en el extranjero.</p>
        </div>
      </>
    ),
  },
];

export default function AspectosFiscalesPage() {
  return <ChapterPage slug="aspectos-fiscales" sections={sections} />;
}
