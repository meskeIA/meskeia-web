'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../CursoNutrisalud.module.css';

export default function MacronutrientesPage() {
  const sections = [
    {
      title: 'Más Allá de la Simplicidad: Calidad vs Cantidad',
      icon: '🔬',
      content: (
        <>
          <p>
            Cuando hablamos de macronutrientes, la mayoría se queda en la superficie:
            carbohidratos para energía, proteínas para músculo, grasas para hormonas.
            Pero <strong>no todos los carbohidratos son iguales</strong>, no todas las
            proteínas tienen el mismo valor biológico, y no todas las grasas afectan
            tu cuerpo de la misma manera.
          </p>
          <p>
            La diferencia entre una dieta que simplemente aporta macronutrientes y una
            que optimiza tu metabolismo radica en <strong>entender las sutilezas
            cualitativas</strong>: el índice glucémico vs carga glucémica, el perfil
            completo de aminoácidos, la relación omega-3/omega-6, la biodisponibilidad
            según el procesamiento.
          </p>

          <div className={styles.highlightBox}>
            <p>
              <strong>🔬 Realidad metabólica:</strong> 100 calorías de glucosa pura
              producen un pico de insulina 10 veces mayor que 100 calorías de almendras,
              aunque ambas aporten la misma energía. La diferencia no está en las calorías,
              sino en cómo cada macronutriente interactúa con tu sistema hormonal.
            </p>
          </div>
        </>
      ),
    },
    {
      title: 'Carbohidratos: Más que Simple Energía',
      icon: '🌾',
      content: (
        <>
          <p>
            Los carbohidratos son la fuente preferida de energía del cerebro y músculos,
            pero su impacto metabólico varía radicalmente según su estructura y procesamiento.
          </p>

          <h3>Tipos por estructura:</h3>
          <ul>
            <li><strong className={styles.carbsHighlight}>Monosacáridos</strong> (glucosa, fructosa): Absorción inmediata</li>
            <li><strong className={styles.carbsHighlight}>Disacáridos</strong> (sacarosa, lactosa): Digestión rápida</li>
            <li><strong className={styles.carbsHighlight}>Oligosacáridos</strong>: Prebióticos, fermentación intestinal</li>
            <li><strong className={styles.carbsHighlight}>Polisacáridos complejos</strong>: Liberación gradual de energía</li>
          </ul>

          <h3>Fibra funcional:</h3>
          <ul>
            <li><strong>Soluble:</strong> Regula glucosa y colesterol (avena, legumbres, manzanas)</li>
            <li><strong>Insoluble:</strong> Tránsito intestinal, volumen (cereales integrales, verduras)</li>
            <li><strong>Fermentable:</strong> Alimenta microbiota, produce ácidos grasos de cadena corta</li>
            <li><strong>Resistente:</strong> Actúa como prebiótico (plátano verde, arroz enfriado)</li>
          </ul>

          <h3>Índice Glucémico vs Carga Glucémica:</h3>
          <table className={styles.comparisonTable}>
            <thead>
              <tr>
                <th>Alimento</th>
                <th>IG</th>
                <th>Porción</th>
                <th>CG</th>
                <th>Impacto</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Pan blanco</td>
                <td>75</td>
                <td>2 rebanadas</td>
                <td>22</td>
                <td>Alto</td>
              </tr>
              <tr>
                <td>Avena integral</td>
                <td>58</td>
                <td>1 taza cocida</td>
                <td>13</td>
                <td>Moderado</td>
              </tr>
              <tr>
                <td>Sandía</td>
                <td>72</td>
                <td>1 taza</td>
                <td>8</td>
                <td>Bajo (sorpresa)</td>
              </tr>
              <tr>
                <td>Legumbres</td>
                <td>25</td>
                <td>1 taza cocida</td>
                <td>7</td>
                <td>Ideal</td>
              </tr>
            </tbody>
          </table>

          <div className={styles.infoBox}>
            <p>
              <strong>💡 Clave:</strong> El índice glucémico mide la velocidad de absorción,
              pero la carga glucémica considera la cantidad real consumida. La sandía tiene
              IG alto pero CG baja porque tiene mucha agua y poca glucosa por porción.
            </p>
          </div>
        </>
      ),
    },
    {
      title: 'Proteínas: Los Bloques de la Vida',
      icon: '💪',
      content: (
        <>
          <p>
            Las proteínas son los bloques constructores celulares cuyo valor va más
            allá del músculo: enzimas, hormonas, neurotransmisores y función inmune
            dependen de su calidad y completitud.
          </p>

          <h3>Calidad proteica - Lo que importa:</h3>
          <ul>
            <li><strong className={styles.proteinHighlight}>Valor biológico:</strong> Porcentaje de absorción y utilización</li>
            <li><strong className={styles.proteinHighlight}>Score de aminoácidos:</strong> Completitud del perfil</li>
            <li><strong className={styles.proteinHighlight}>Digestibilidad:</strong> Porcentaje que llega al torrente sanguíneo</li>
            <li><strong className={styles.proteinHighlight}>Biodisponibilidad:</strong> Accesibilidad real para síntesis</li>
          </ul>

          <h3>Los 9 Aminoácidos Esenciales:</h3>
          <div className={styles.exampleGrid}>
            <div className={styles.exampleCard}>
              <h4 className={styles.exampleTitle}>BCAAs (ramificados)</h4>
              <p className={styles.exampleDesc}>
                <strong>Leucina:</strong> Síntesis proteica muscular<br />
                <strong>Isoleucina:</strong> Energía muscular<br />
                <strong>Valina:</strong> Reparación tejidos
              </p>
            </div>
            <div className={styles.exampleCard}>
              <h4 className={styles.exampleTitle}>Otros esenciales</h4>
              <p className={styles.exampleDesc}>
                <strong>Triptófano:</strong> Serotonina, sueño<br />
                <strong>Lisina:</strong> Absorción calcio<br />
                <strong>Metionina:</strong> Metabolismo, detox
              </p>
            </div>
          </div>

          <h3>Fuentes de proteína por valor biológico:</h3>
          <ol>
            <li><strong>Huevo entero:</strong> 100 (referencia)</li>
            <li><strong>Suero de leche (whey):</strong> 104</li>
            <li><strong>Carne de res:</strong> 80</li>
            <li><strong>Pescado:</strong> 76</li>
            <li><strong>Soja:</strong> 74</li>
            <li><strong>Legumbres:</strong> 49 (mejora combinando con cereales)</li>
          </ol>

          <div className={styles.highlightBox}>
            <p>
              <strong>🥣 Combinaciones proteicas vegetales:</strong> Legumbres + cereales
              (lentejas con arroz, hummus con pan) proporcionan un perfil completo de
              aminoácidos comparable a la proteína animal.
            </p>
          </div>
        </>
      ),
    },
    {
      title: 'Grasas: De Villano a Aliado Metabólico',
      icon: '🥑',
      content: (
        <>
          <p>
            Durante décadas demonizamos las grasas sin distinguir tipos. Hoy sabemos que
            ciertas grasas son <strong>esenciales para la salud</strong>, mientras otras
            son verdaderamente perjudiciales.
          </p>

          <h3>Clasificación funcional:</h3>
          <ul>
            <li><strong className={styles.fatsHighlight}>Saturadas:</strong> Estabilidad estructural, síntesis hormonal</li>
            <li><strong className={styles.fatsHighlight}>Monoinsaturadas:</strong> Fluidez de membrana celular</li>
            <li><strong className={styles.fatsHighlight}>Poliinsaturadas:</strong> Señalización celular, antiinflamatorio</li>
            <li><strong className={styles.fatsHighlight}>Trans industriales:</strong> Pro-inflamatorias, evitar siempre</li>
          </ul>

          <div className={styles.exampleGrid}>
            <div className={styles.exampleCard} style={{ borderTop: '4px solid #27AE60' }}>
              <span className={styles.exampleIcon}>✅</span>
              <h4 className={styles.exampleTitle}>Grasas Beneficiosas</h4>
              <p className={styles.exampleDesc}>
                <strong>Omega-3:</strong> Salmón, sardinas, chía, nueces<br />
                <strong>Monoinsaturadas:</strong> Aceite oliva, aguacate<br />
                <strong>MCT:</strong> Aceite de coco
              </p>
            </div>
            <div className={styles.exampleCard} style={{ borderTop: '4px solid #E74C3C' }}>
              <span className={styles.exampleIcon}>⛔</span>
              <h4 className={styles.exampleTitle}>Grasas a Evitar</h4>
              <p className={styles.exampleDesc}>
                <strong>Trans industriales:</strong> Margarinas, bollería<br />
                <strong>Omega-6 excesivo:</strong> Aceites refinados<br />
                <strong>Oxidadas:</strong> Frituras repetidas
              </p>
            </div>
          </div>

          <h3>El ratio Omega-3 / Omega-6:</h3>
          <ul>
            <li><strong>Ratio ideal:</strong> 1:1 a 1:4</li>
            <li><strong>Ratio actual típico:</strong> 1:20 o peor</li>
            <li><strong>Consecuencia del desequilibrio:</strong> Inflamación crónica sistémica</li>
          </ul>

          <div className={styles.warningBox}>
            <p>
              <strong>⚠️ Importante:</strong> El exceso de omega-6 (aceites vegetales refinados)
              compite con omega-3 por las mismas enzimas, reduciendo la producción de
              compuestos antiinflamatorios. Reduce aceites de girasol, maíz y soja.
            </p>
          </div>
        </>
      ),
    },
    {
      title: 'Principios de Optimización de Macronutrientes',
      icon: '🎯',
      content: (
        <>
          <div className={styles.highlightBox}>
            <p>
              <strong>🕐 Timing de macronutrientes:</strong> Los carbohidratos tienen mejor
              partición nutricional post-entrenamiento (ventana anabólica). Las proteínas
              se absorben mejor distribuyendo 20-40g cada 3-4 horas. Las grasas no interfieren
              con la absorción si se separan de carbohidratos de alto IG.
            </p>
          </div>

          <div className={styles.highlightBox}>
            <p>
              <strong>⚖️ Sinergia de macronutrientes:</strong> Combinar proteínas con
              carbohidratos mejora la síntesis proteica. Las grasas ralentizan el vaciado
              gástrico, estabilizando glucosa. La fibra soluble reduce el índice glucémico
              efectivo de cualquier comida.
            </p>
          </div>

          <div className={styles.highlightBox}>
            <p>
              <strong>🧬 Calidad sobre cantidad:</strong> 30g de proteína de huevo tienen
              mayor valor biológico que 40g de proteína de trigo. 20g de omega-3 son más
              valiosos que 200g de omega-6. 50g de carbohidratos de legumbres impactan
              menos que 30g de azúcar refinado.
            </p>
          </div>

          <h3>Distribución recomendada general:</h3>
          <ul>
            <li><strong>Mantenimiento:</strong> 40% carbs, 30% proteína, 30% grasas</li>
            <li><strong>Pérdida de grasa:</strong> 25% carbs, 40% proteína, 35% grasas</li>
            <li><strong>Ganancia muscular:</strong> 45% carbs, 30% proteína, 25% grasas</li>
            <li><strong>Rendimiento deportivo:</strong> 55% carbs, 25% proteína, 20% grasas</li>
          </ul>

          <div className={styles.infoBox}>
            <p>
              <strong>📊 Monitorización inteligente:</strong> En lugar de solo contar calorías,
              evalúa: saciedad post-comida (3-4h), estabilidad energética, calidad del sueño,
              rendimiento cognitivo. Estos indicadores revelan si tus ratios son óptimos para TI.
            </p>
          </div>
        </>
      ),
    },
  ];

  return <ChapterPage slug="macronutrientes" sections={sections} />;
}
