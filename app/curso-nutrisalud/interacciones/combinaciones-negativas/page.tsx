'use client';

import { LegalNotice } from '@/components';
import ChapterPage from '../../ChapterPage';
import styles from '../../CursoNutrisalud.module.css';

export default function CombinacionesNegativasPage() {
  const sections = [
    {
      title: 'Cuando los Nutrientes Compiten',
      icon: '⚔️',
      content: (
        <>
          <p>
            Así como existen sinergias que potencian la absorción, también hay
            <strong> antagonismos</strong> que la reducen. Ciertos nutrientes
            compiten por los mismos transportadores intestinales, mientras que
            otros compuestos (antinutrientes) secuestran minerales impidiendo
            su absorción.
          </p>
          <p>
            Conocer estas interacciones negativas te permite evitar combinaciones
            contraproducentes y espaciar estratégicamente ciertos alimentos o
            suplementos para maximizar la absorción de cada uno.
          </p>

          <div className={styles.warningBox}>
            <p>
              <strong>⚠️ Perspectiva importante:</strong> Los antinutrientes no son
              &quot;venenos&quot;. En una dieta variada, su impacto es menor. Pero si tienes
              deficiencias específicas (ej: anemia), prestarles atención puede
              marcar una diferencia significativa.
            </p>
          </div>
        </>
      ),
    },
    {
      title: 'Fitatos: El Secuestrador de Minerales',
      icon: '🌾',
      content: (
        <>
          <p>
            Los <strong>fitatos</strong> (ácido fítico) se encuentran en cereales
            integrales, legumbres, frutos secos y semillas. Actúan como
            &quot;quelantes&quot;: se unen a minerales como hierro, zinc, calcio y
            magnesio formando complejos insolubles que no se absorben.
          </p>

          <h3>Alimentos ricos en fitatos:</h3>
          <ul>
            <li>Cereales integrales (avena, trigo, arroz integral)</li>
            <li>Legumbres (lentejas, garbanzos, judías)</li>
            <li>Frutos secos (almendras, nueces)</li>
            <li>Semillas (chía, lino, calabaza)</li>
          </ul>

          <h3>Estrategias para reducir fitatos:</h3>
          <div className={styles.exampleGrid}>
            <div className={styles.exampleCard}>
              <span className={styles.exampleIcon}>💧</span>
              <h4 className={styles.exampleTitle}>Remojo</h4>
              <p className={styles.exampleDesc}>
                Remojar legumbres 8-12h reduce fitatos 20-50%.
                Descartar el agua de remojo.
              </p>
            </div>
            <div className={styles.exampleCard}>
              <span className={styles.exampleIcon}>🌱</span>
              <h4 className={styles.exampleTitle}>Germinación</h4>
              <p className={styles.exampleDesc}>
                Germinar semillas y legumbres activa fitasa,
                reduciendo fitatos hasta 75%.
              </p>
            </div>
            <div className={styles.exampleCard}>
              <span className={styles.exampleIcon}>🍞</span>
              <h4 className={styles.exampleTitle}>Fermentación</h4>
              <p className={styles.exampleDesc}>
                Pan de masa madre tiene menos fitatos
                que pan normal. El tempeh igual.
              </p>
            </div>
            <div className={styles.exampleCard}>
              <span className={styles.exampleIcon}>🔥</span>
              <h4 className={styles.exampleTitle}>Cocción</h4>
              <p className={styles.exampleDesc}>
                Cocinar reduce fitatos moderadamente.
                Combinar con remojo previo es mejor.
              </p>
            </div>
          </div>

          <div className={styles.infoBox}>
            <p>
              <strong>💡 Nota positiva:</strong> Los fitatos también tienen propiedades
              antioxidantes y anticancerígenas. No hay que eliminarlos completamente,
              solo gestionarlos cuando la absorción mineral es crítica.
            </p>
          </div>
        </>
      ),
    },
    {
      title: 'Oxalatos y Taninos',
      icon: '🥬',
      content: (
        <>
          <h3>Oxalatos (ácido oxálico)</h3>
          <p>
            Se unen fuertemente al calcio formando oxalato de calcio, que no se
            absorbe y puede contribuir a cálculos renales en personas susceptibles.
          </p>

          <p><strong>Alimentos muy ricos en oxalatos:</strong></p>
          <ul>
            <li>Espinacas (muy alto)</li>
            <li>Ruibarbo</li>
            <li>Acelgas</li>
            <li>Remolacha</li>
            <li>Cacao/chocolate</li>
            <li>Frutos secos (especialmente almendras)</li>
          </ul>

          <div className={styles.warningBox}>
            <p>
              <strong>⚠️ Mito de las espinacas:</strong> Aunque las espinacas contienen
              calcio, su alto contenido en oxalatos hace que solo se absorba un 5%
              del calcio presente. Para calcio, el kale y el brócoli son mejores
              opciones (oxalatos bajos).
            </p>
          </div>

          <h3>Taninos</h3>
          <p>
            Presentes en té, café, vino tinto y algunos frutos. Se unen al hierro
            no-hemo reduciendo su absorción hasta un 60%.
          </p>

          <table className={styles.comparisonTable}>
            <thead>
              <tr>
                <th>Bebida</th>
                <th>Contenido de taninos</th>
                <th>Reducción absorción hierro</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Té negro</td>
                <td>Alto</td>
                <td>Hasta 60%</td>
              </tr>
              <tr>
                <td>Café</td>
                <td>Moderado</td>
                <td>35-40%</td>
              </tr>
              <tr>
                <td>Té verde</td>
                <td>Moderado</td>
                <td>25-35%</td>
              </tr>
              <tr>
                <td>Vino tinto</td>
                <td>Alto</td>
                <td>Variable</td>
              </tr>
            </tbody>
          </table>

          <div className={styles.highlightBox}>
            <p>
              <strong>☕ Regla práctica:</strong> Si tienes tendencia a anemia o
              tomas suplementos de hierro, consume té y café al menos 1-2 horas
              antes o después de las comidas principales, no durante.
            </p>
          </div>
        </>
      ),
    },
    {
      title: 'Competición entre Minerales',
      icon: '🔄',
      content: (
        <>
          <p>
            Varios minerales utilizan los mismos transportadores intestinales
            para absorberse. Cuando se consumen juntos en altas dosis, compiten
            y pueden reducir la absorción mutua.
          </p>

          <h3>Principales competiciones:</h3>

          <div className={styles.exampleGrid}>
            <div className={styles.exampleCard}>
              <span className={styles.exampleIcon}>⚔️</span>
              <h4 className={styles.exampleTitle}>Calcio vs Hierro</h4>
              <p className={styles.exampleDesc}>
                500mg+ de calcio reducen absorción de hierro 50%.
                Separar suplementos 2-3h.
              </p>
            </div>
            <div className={styles.exampleCard}>
              <span className={styles.exampleIcon}>⚔️</span>
              <h4 className={styles.exampleTitle}>Zinc vs Cobre</h4>
              <p className={styles.exampleDesc}>
                Exceso de zinc a largo plazo puede causar
                deficiencia de cobre. Balance importante.
              </p>
            </div>
            <div className={styles.exampleCard}>
              <span className={styles.exampleIcon}>⚔️</span>
              <h4 className={styles.exampleTitle}>Hierro vs Zinc</h4>
              <p className={styles.exampleDesc}>
                En suplementos, compiten moderadamente.
                En alimentos, menos impacto.
              </p>
            </div>
            <div className={styles.exampleCard}>
              <span className={styles.exampleIcon}>⚔️</span>
              <h4 className={styles.exampleTitle}>Calcio vs Magnesio</h4>
              <p className={styles.exampleDesc}>
                Ratio ideal 2:1. Exceso de calcio
                puede afectar absorción de magnesio.
              </p>
            </div>
          </div>

          <h3>Recomendaciones prácticas:</h3>
          <ul>
            <li>Toma suplementos de calcio separados de comidas ricas en hierro</li>
            <li>Si suplementas zinc, asegura suficiente cobre en la dieta</li>
            <li>Hierro en ayunas o con vitamina C (mejor absorción)</li>
            <li>Calcio mejor en dosis divididas (máx 500mg por toma)</li>
          </ul>

          <div className={styles.infoBox}>
            <p>
              <strong>💡 Alimentos vs Suplementos:</strong> La competición es más
              relevante con suplementos concentrados. En alimentos, las dosis son
              menores y las interacciones menos significativas.
            </p>
          </div>
        </>
      ),
    },
    {
      title: 'Estrategias para Minimizar Efectos Negativos',
      icon: '🎯',
      content: (
        <>
          <h3>Timing inteligente:</h3>
          <ul>
            <li><strong>Café/té:</strong> 1-2 horas separados de comidas principales</li>
            <li><strong>Lácteos:</strong> No con comidas ricas en hierro vegetal</li>
            <li><strong>Suplementos de calcio:</strong> Separados de hierro y zinc</li>
          </ul>

          <h3>Preparación de alimentos:</h3>
          <ul>
            <li>Remojar legumbres y cereales integrales antes de cocinar</li>
            <li>Preferir pan de masa madre sobre pan normal</li>
            <li>Germinar semillas cuando sea posible</li>
            <li>Cocinar espinacas (reduce oxalatos parcialmente)</li>
          </ul>

          <h3>Combinaciones a evitar (especialmente si hay deficiencias):</h3>
          <table className={styles.comparisonTable}>
            <thead>
              <tr>
                <th>Evitar combinar</th>
                <th>Razón</th>
                <th>Alternativa</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Espinacas + lácteos</td>
                <td>Oxalatos bloquean calcio</td>
                <td>Kale + lácteos (bajo en oxalatos)</td>
              </tr>
              <tr>
                <td>Té con comida rica en hierro</td>
                <td>Taninos reducen absorción</td>
                <td>Té entre comidas</td>
              </tr>
              <tr>
                <td>Suplemento hierro + calcio</td>
                <td>Competición directa</td>
                <td>Separar 2-3 horas</td>
              </tr>
              <tr>
                <td>Cereales crudos + minerales</td>
                <td>Fitatos altos</td>
                <td>Cereales cocidos o fermentados</td>
              </tr>
            </tbody>
          </table>

          <div className={styles.highlightBox}>
            <p>
              <strong>🔑 Mensaje clave:</strong> No te obsesiones con estas interacciones.
              Si sigues una dieta variada, el impacto es menor. Pero si tienes deficiencias
              específicas diagnosticadas, aplicar estas estrategias puede acelerar
              significativamente la recuperación.
            </p>
          </div>
        </>
      ),
    },
  ];

  return <ChapterPage slug="combinaciones-negativas" sections={sections} />;
}
