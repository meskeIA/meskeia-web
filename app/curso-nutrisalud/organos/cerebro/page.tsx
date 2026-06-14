'use client';

import { LegalNotice } from '@/components';
import ChapterPage from '../../ChapterPage';
import styles from '../../CursoNutrisalud.module.css';

export default function CerebroPage() {
  const sections = [
    {
      title: 'El Cerebro: Un Órgano Hambriento',
      icon: '🧠',
      content: (
        <>
          <p>
            Tu cerebro representa solo el 2% de tu peso corporal pero consume
            el <strong>20% de tu energía total</strong>. Es el órgano más
            exigente metabólicamente, y su función depende directamente de los
            nutrientes que le proporcionas.
          </p>
          <p>
            La composición del cerebro es principalmente grasa (60% de su peso
            seco), lo que explica la importancia crucial de los ácidos grasos
            esenciales, especialmente omega-3, para su funcionamiento óptimo.
          </p>

          <h3>Necesidades cerebrales básicas:</h3>
          <ul>
            <li><strong>Glucosa:</strong> Combustible principal (pero puede usar cetonas)</li>
            <li><strong>Oxígeno:</strong> Para metabolismo energético</li>
            <li><strong>DHA (omega-3):</strong> Componente estructural de membranas</li>
            <li><strong>Aminoácidos:</strong> Precursores de neurotransmisores</li>
            <li><strong>Vitaminas B:</strong> Cofactores en síntesis de neurotransmisores</li>
            <li><strong>Antioxidantes:</strong> Protección contra estrés oxidativo</li>
          </ul>

          <div className={styles.highlightBox}>
            <p>
              <strong>🔬 Barrera hematoencefálica:</strong> No todo lo que comes
              llega al cerebro. Esta barrera selectiva protege pero también limita.
              Por eso ciertos nutrientes (omega-3, aminoácidos específicos) son
              especialmente valiosos: atraviesan esta barrera eficientemente.
            </p>
          </div>
        </>
      ),
    },
    {
      title: 'Neurotransmisores: Los Mensajeros Químicos',
      icon: '⚡',
      content: (
        <>
          <p>
            Los neurotransmisores son las moléculas que permiten la comunicación
            entre neuronas. Se sintetizan a partir de <strong>aminoácidos
            específicos</strong> que obtienes de la proteína dietética.
          </p>

          <table className={styles.comparisonTable}>
            <thead>
              <tr>
                <th>Neurotransmisor</th>
                <th>Función</th>
                <th>Precursor</th>
                <th>Fuentes alimentarias</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Serotonina</td>
                <td>Ánimo, sueño, calma</td>
                <td>Triptófano</td>
                <td>Pavo, huevos, plátano, nueces</td>
              </tr>
              <tr>
                <td>Dopamina</td>
                <td>Motivación, placer, foco</td>
                <td>Tirosina</td>
                <td>Carne, pescado, huevos, soja</td>
              </tr>
              <tr>
                <td>Norepinefrina</td>
                <td>Alerta, energía</td>
                <td>Tirosina</td>
                <td>Proteínas animales, almendras</td>
              </tr>
              <tr>
                <td>GABA</td>
                <td>Relajación, anti-ansiedad</td>
                <td>Glutamato</td>
                <td>Té verde, fermentados, almendras</td>
              </tr>
              <tr>
                <td>Acetilcolina</td>
                <td>Memoria, aprendizaje</td>
                <td>Colina</td>
                <td>Yema de huevo, hígado, soja</td>
              </tr>
            </tbody>
          </table>

          <h3>Cofactores esenciales:</h3>
          <p>
            Los aminoácidos necesitan vitaminas y minerales para convertirse
            en neurotransmisores:
          </p>
          <ul>
            <li><strong>Vitamina B6:</strong> Conversión de triptófano a serotonina</li>
            <li><strong>Hierro:</strong> Síntesis de dopamina</li>
            <li><strong>Magnesio:</strong> Regulación de GABA</li>
            <li><strong>Zinc:</strong> Múltiples funciones enzimáticas</li>
            <li><strong>Folato y B12:</strong> Metilación para síntesis de neurotransmisores</li>
          </ul>

          <div className={styles.infoBox}>
            <p>
              <strong>💡 El triptófano y los carbohidratos:</strong> El triptófano
              compite con otros aminoácidos para entrar al cerebro. Los carbohidratos
              (al estimular insulina) facilitan su entrada. Por eso los carbohidratos
              pueden mejorar el ánimo temporalmente.
            </p>
          </div>
        </>
      ),
    },
    {
      title: 'Omega-3: El Nutriente Cerebral por Excelencia',
      icon: '🐟',
      content: (
        <>
          <p>
            El <strong>DHA</strong> (ácido docosahexaenoico) es un omega-3 que
            constituye el 30-40% de los ácidos grasos en la corteza cerebral.
            Es esencial para la fluidez de las membranas neuronales, la
            transmisión sináptica y la neurogénesis.
          </p>

          <h3>Beneficios del omega-3 para el cerebro:</h3>
          <ul>
            <li>Mejora la comunicación entre neuronas</li>
            <li>Reduce inflamación cerebral</li>
            <li>Apoya la neurogénesis (formación de nuevas neuronas)</li>
            <li>Mejora memoria y función cognitiva</li>
            <li>Puede reducir síntomas de depresión y ansiedad</li>
            <li>Protege contra deterioro cognitivo con la edad</li>
          </ul>

          <div className={styles.exampleGrid}>
            <div className={styles.exampleCard}>
              <span className={styles.exampleIcon}>🐟</span>
              <h4 className={styles.exampleTitle}>Fuentes marinas (EPA+DHA)</h4>
              <p className={styles.exampleDesc}>
                Salmón, sardinas, caballa, arenque,
                anchoas. Forma más biodisponible.
              </p>
            </div>
            <div className={styles.exampleCard}>
              <span className={styles.exampleIcon}>🌱</span>
              <h4 className={styles.exampleTitle}>Fuentes vegetales (ALA)</h4>
              <p className={styles.exampleDesc}>
                Chía, lino, nueces. Conversión a DHA
                es baja (&lt;10%). Suplementar si vegano.
              </p>
            </div>
          </div>

          <div className={styles.warningBox}>
            <p>
              <strong>⚠️ Ratio omega-6/omega-3:</strong> El exceso de omega-6
              (aceites vegetales refinados) compite con omega-3 e interfiere
              con su incorporación al cerebro. Reduce aceites de girasol, maíz
              y soja; aumenta pescado graso y fuentes de omega-3.
            </p>
          </div>

          <h3>Dosis recomendada:</h3>
          <ul>
            <li><strong>Mantenimiento:</strong> 250-500mg EPA+DHA/día</li>
            <li><strong>Apoyo cognitivo:</strong> 1000-2000mg EPA+DHA/día</li>
            <li><strong>2-3 raciones de pescado graso por semana</strong> cubren necesidades básicas</li>
          </ul>
        </>
      ),
    },
    {
      title: 'Glucosa Cerebral y Función Cognitiva',
      icon: '📈',
      content: (
        <>
          <p>
            El cerebro consume unos 120g de glucosa diarios. Sin embargo, esto
            no significa que debas comer azúcar. De hecho, los picos y caídas
            de glucosa son perjudiciales para la función cognitiva.
          </p>

          <h3>Problemas de la glucosa inestable:</h3>
          <ul>
            <li>Niebla mental después de comidas altas en azúcar</li>
            <li>Dificultad de concentración</li>
            <li>Irritabilidad (hipoglucemia reactiva)</li>
            <li>Fatiga cognitiva</li>
            <li>Antojos constantes</li>
          </ul>

          <h3>Estrategias para glucosa cerebral estable:</h3>
          <ul>
            <li>Carbohidratos complejos en lugar de simples</li>
            <li>Combinar carbohidratos con proteína y grasa</li>
            <li>Comer fibra antes de carbohidratos</li>
            <li>Evitar ayunos muy largos si afectan concentración</li>
            <li>Considerar cetonas como combustible alternativo</li>
          </ul>

          <div className={styles.highlightBox}>
            <p>
              <strong>🔥 El cerebro y las cetonas:</strong> Cuando los carbohidratos
              son bajos, el hígado produce cetonas a partir de grasas. El cerebro
              puede usar cetonas como combustible alternativo. Algunas personas
              reportan mayor claridad mental en cetosis o ayuno intermitente.
            </p>
          </div>

          <h3>Alimentos para energía mental sostenida:</h3>
          <div className={styles.exampleGrid}>
            <div className={styles.exampleCard}>
              <span className={styles.exampleIcon}>🥣</span>
              <h4 className={styles.exampleTitle}>Avena</h4>
              <p className={styles.exampleDesc}>
                Liberación lenta de glucosa.
                Añade proteína para estabilizar más.
              </p>
            </div>
            <div className={styles.exampleCard}>
              <span className={styles.exampleIcon}>🥚</span>
              <h4 className={styles.exampleTitle}>Huevos</h4>
              <p className={styles.exampleDesc}>
                Proteína + colina + grasas.
                Saciedad y energía estable.
              </p>
            </div>
            <div className={styles.exampleCard}>
              <span className={styles.exampleIcon}>🥜</span>
              <h4 className={styles.exampleTitle}>Frutos secos</h4>
              <p className={styles.exampleDesc}>
                Grasas, proteína, fibra.
                Snack ideal para concentración.
              </p>
            </div>
            <div className={styles.exampleCard}>
              <span className={styles.exampleIcon}>🫐</span>
              <h4 className={styles.exampleTitle}>Arándanos</h4>
              <p className={styles.exampleDesc}>
                &quot;Brain berries&quot;. Antocianinas
                mejoran memoria y flujo sanguíneo.
              </p>
            </div>
          </div>
        </>
      ),
    },
    {
      title: 'Nootrópicos Naturales: Potenciadores Cognitivos',
      icon: '🚀',
      content: (
        <>
          <p>
            Los <strong>nootrópicos</strong> son sustancias que mejoran la función
            cognitiva. Muchos compuestos naturales de los alimentos tienen
            propiedades nootrópicas demostradas.
          </p>

          <h3>Nootrópicos alimentarios:</h3>

          <table className={styles.comparisonTable}>
            <thead>
              <tr>
                <th>Compuesto</th>
                <th>Fuente</th>
                <th>Beneficio</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Cafeína + L-teanina</td>
                <td>Té verde</td>
                <td>Alerta sin ansiedad, foco sostenido</td>
              </tr>
              <tr>
                <td>Antocianinas</td>
                <td>Arándanos, uvas</td>
                <td>Memoria, flujo sanguíneo cerebral</td>
              </tr>
              <tr>
                <td>Curcumina</td>
                <td>Cúrcuma</td>
                <td>Antiinflamatorio, neuroprotector</td>
              </tr>
              <tr>
                <td>Cacao flavanoles</td>
                <td>Chocolate negro 70%+</td>
                <td>Flujo sanguíneo, función cognitiva</td>
              </tr>
              <tr>
                <td>Epicatequinas</td>
                <td>Té verde, cacao</td>
                <td>Neurogénesis, plasticidad</td>
              </tr>
              <tr>
                <td>Creatina</td>
                <td>Carne roja</td>
                <td>Energía cerebral, memoria de trabajo</td>
              </tr>
            </tbody>
          </table>

          <div className={styles.infoBox}>
            <p>
              <strong>💡 Combinación sinérgica:</strong> El té verde combina
              naturalmente cafeína con L-teanina, produciendo un estado de
              &quot;alerta relajada&quot; ideal para trabajo cognitivo. 2-3 tazas/día
              son seguras para la mayoría.
            </p>
          </div>

          <h3>Plan de alimentación para el cerebro:</h3>
          <ul>
            <li>Pescado graso 2-3 veces por semana (omega-3)</li>
            <li>Huevos a diario (colina)</li>
            <li>Arándanos y frutos rojos frecuentemente</li>
            <li>Té verde como bebida habitual</li>
            <li>Chocolate negro 70%+ como snack ocasional</li>
            <li>Verduras de hoja verde (folato, nitratos)</li>
            <li>Frutos secos como snack (omega-3, vitamina E)</li>
            <li>Cúrcuma en comidas (con pimienta y grasa)</li>
          </ul>

          <div className={styles.highlightBox}>
            <p>
              <strong>🧠 Dieta MIND:</strong> Combina mediterránea y DASH, diseñada
              específicamente para salud cerebral. El estudio observacional de Morris et al.
              (2015, Rush University) encontró asociaciones de hasta 53% de reducción de
              riesgo de Alzheimer en alta adherencia y 35% en adherencia moderada, aunque
              estos datos provienen de un único estudio observacional que no establece
              causalidad. Prioriza bayas, verduras de hoja, pescado y nueces.
            </p>
          </div>
        </>
      ),
    },
  ];

  return <ChapterPage slug="cerebro" sections={sections} />;
}
