'use client';

import { LegalNotice } from '@/components';
import ChapterPage from '../../ChapterPage';
import styles from '../../CursoNutrisalud.module.css';

export default function CardiovascularPage() {
  const sections = [
    {
      title: 'El Sistema Cardiovascular y la Nutrición',
      icon: '❤️',
      content: (
        <>
          <p>
            Las enfermedades cardiovasculares (ECV) son la primera causa de muerte
            a nivel mundial. Sin embargo, la mayoría son prevenibles a través de
            la alimentación y el estilo de vida. La nutrición afecta directamente
            la presión arterial, los niveles de colesterol, la inflamación y la
            función de los vasos sanguíneos.
          </p>

          <h3>Factores de riesgo modificables:</h3>
          <ul>
            <li>Colesterol LDL elevado (partículas pequeñas y densas)</li>
            <li>Triglicéridos altos</li>
            <li>HDL bajo</li>
            <li>Presión arterial elevada</li>
            <li>Inflamación crónica (PCR elevada)</li>
            <li>Resistencia a la insulina</li>
            <li>Homocisteína elevada</li>
          </ul>

          <div className={styles.highlightBox}>
            <p>
              <strong>📊 Más allá del colesterol total:</strong> El colesterol total
              es un marcador incompleto. Lo importante es el perfil: ratio triglicéridos/HDL
              (ideal &lt;2), número de partículas LDL, y nivel de Lp(a). Pide un
              análisis completo de lípidos, no solo el básico.
            </p>
          </div>
        </>
      ),
    },
    {
      title: 'Colesterol: La Historia Completa',
      icon: '🔬',
      content: (
        <>
          <p>
            El colesterol dietético tuvo mala fama durante décadas, pero la ciencia
            actual muestra un panorama más complejo. El hígado produce el 80% del
            colesterol que necesitas; solo el 20% viene de la dieta.
          </p>

          <h3>Lo que realmente eleva el colesterol LDL &quot;malo&quot;:</h3>
          <ul>
            <li><strong>Grasas trans:</strong> Principal culpable (eliminar completamente)</li>
            <li><strong>Exceso de azúcar refinado:</strong> Aumenta triglicéridos y LDL pequeño</li>
            <li><strong>Carbohidratos refinados:</strong> Similar efecto al azúcar</li>
            <li><strong>Grasas saturadas en exceso:</strong> Efecto moderado, variable según persona</li>
          </ul>

          <h3>Lo que mejora el perfil lipídico:</h3>
          <ul>
            <li><strong>Fibra soluble:</strong> Avena, legumbres, manzanas (reduce LDL)</li>
            <li><strong>Omega-3:</strong> Reduce triglicéridos significativamente</li>
            <li><strong>Fitoesteroles:</strong> Nueces, semillas (bloquean absorción colesterol)</li>
            <li><strong>Grasas monoinsaturadas:</strong> Aceite oliva, aguacate (elevan HDL)</li>
          </ul>

          <table className={styles.comparisonTable}>
            <thead>
              <tr>
                <th>Alimento/Nutriente</th>
                <th>Efecto en LDL</th>
                <th>Efecto en HDL</th>
                <th>Efecto en triglicéridos</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Omega-3 (pescado)</td>
                <td>Neutro/leve ↓</td>
                <td>↑</td>
                <td>↓↓↓</td>
              </tr>
              <tr>
                <td>Aceite de oliva</td>
                <td>↓</td>
                <td>↑</td>
                <td>↓</td>
              </tr>
              <tr>
                <td>Avena/fibra soluble</td>
                <td>↓↓</td>
                <td>Neutro</td>
                <td>↓</td>
              </tr>
              <tr>
                <td>Azúcar/refinados</td>
                <td>↑ (LDL pequeño)</td>
                <td>↓</td>
                <td>↑↑↑</td>
              </tr>
              <tr>
                <td>Grasas trans</td>
                <td>↑↑↑</td>
                <td>↓↓</td>
                <td>↑</td>
              </tr>
            </tbody>
          </table>

          <div className={styles.infoBox}>
            <p>
              <strong>💡 Sobre los huevos:</strong> Estudios recientes muestran que
              para la mayoría de personas, comer huevos (incluso diariamente) no
              eleva significativamente el riesgo cardiovascular. La yema contiene
              colina, nutriente esencial para el cerebro.
            </p>
          </div>
        </>
      ),
    },
    {
      title: 'Inflamación: El Verdadero Enemigo',
      icon: '🔥',
      content: (
        <>
          <p>
            La inflamación crónica de bajo grado es un factor central en la
            enfermedad cardiovascular. Daña el endotelio (revestimiento de las
            arterias), promueve la formación de placas y aumenta el riesgo de
            eventos cardiovasculares.
          </p>

          <h3>Marcadores de inflamación:</h3>
          <ul>
            <li><strong>PCR ultrasensible:</strong> Ideal &lt;1 mg/L</li>
            <li><strong>Homocisteína:</strong> Ideal &lt;10 μmol/L</li>
            <li><strong>Ratio omega-6/omega-3:</strong> Ideal &lt;4:1</li>
          </ul>

          <div className={styles.exampleGrid}>
            <div className={styles.exampleCard} style={{ borderTop: '4px solid #27AE60' }}>
              <span className={styles.exampleIcon}>✅</span>
              <h4 className={styles.exampleTitle}>Antiinflamatorios</h4>
              <p className={styles.exampleDesc}>
                Omega-3, cúrcuma, jengibre, bayas,
                verduras de hoja, aceite oliva,
                frutos secos, té verde.
              </p>
            </div>
            <div className={styles.exampleCard} style={{ borderTop: '4px solid #E74C3C' }}>
              <span className={styles.exampleIcon}>⛔</span>
              <h4 className={styles.exampleTitle}>Proinflamatorios</h4>
              <p className={styles.exampleDesc}>
                Azúcar refinado, aceites vegetales
                refinados, trans, ultraprocesados,
                carnes procesadas, alcohol excesivo.
              </p>
            </div>
          </div>

          <div className={styles.warningBox}>
            <p>
              <strong>⚠️ Ratio omega-6/omega-3:</strong> La dieta occidental típica
              tiene ratio 20:1 o peor. El ideal es 1:1 a 4:1. Reduce aceites de
              girasol, maíz, soja. Aumenta pescado graso, nueces, chía.
            </p>
          </div>
        </>
      ),
    },
    {
      title: 'Presión Arterial y Nutrición',
      icon: '📉',
      content: (
        <>
          <p>
            La hipertensión (presión arterial elevada) es el principal factor de
            riesgo modificable para infarto e ictus. La dieta tiene un impacto
            significativo y puede reducir la presión tanto como medicamentos en
            casos leves.
          </p>

          <h3>Dieta DASH (Dietary Approaches to Stop Hypertension):</h3>
          <ul>
            <li>Rica en frutas y verduras (8-10 porciones/día)</li>
            <li>Lácteos bajos en grasa</li>
            <li>Cereales integrales</li>
            <li>Frutos secos, legumbres</li>
            <li>Pescado y aves (limitando carnes rojas)</li>
            <li>Baja en sal, azúcar y grasas saturadas</li>
          </ul>

          <h3>Nutrientes clave para la presión arterial:</h3>
          <table className={styles.comparisonTable}>
            <thead>
              <tr>
                <th>Nutriente</th>
                <th>Efecto</th>
                <th>Fuentes</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Potasio</td>
                <td>↓ Presión (antagoniza sodio)</td>
                <td>Plátano, patata, aguacate, espinacas</td>
              </tr>
              <tr>
                <td>Magnesio</td>
                <td>↓ Presión (relaja vasos)</td>
                <td>Cacao, almendras, espinacas</td>
              </tr>
              <tr>
                <td>Nitratos</td>
                <td>↓ Presión (óxido nítrico)</td>
                <td>Remolacha, espinacas, rúcula</td>
              </tr>
              <tr>
                <td>Omega-3</td>
                <td>↓ Presión moderadamente</td>
                <td>Pescados grasos, nueces</td>
              </tr>
            </tbody>
          </table>

          <div className={styles.highlightBox}>
            <p>
              <strong>🥤 Zumo de remolacha:</strong> Estudios demuestran que 250ml
              de zumo de remolacha pueden reducir la presión sistólica 4-10 mmHg
              en pocas horas. Los nitratos se convierten en óxido nítrico, que
              dilata los vasos sanguíneos.
            </p>
          </div>

          <h3>Reducción de sodio:</h3>
          <ul>
            <li>Limitar a &lt;2.3g sodio/día (ideal &lt;1.5g si hipertenso)</li>
            <li>El 75% del sodio viene de alimentos procesados, no del salero</li>
            <li>Usar hierbas y especias en lugar de sal</li>
            <li>Leer etiquetas: evitar &gt;600mg sodio por ración</li>
          </ul>
        </>
      ),
    },
    {
      title: 'Alimentos Cardioprotectores',
      icon: '🛡️',
      content: (
        <>
          <h3>Los mejores alimentos para el corazón:</h3>

          <div className={styles.exampleGrid}>
            <div className={styles.exampleCard}>
              <span className={styles.exampleIcon}>🐟</span>
              <h4 className={styles.exampleTitle}>Pescado graso</h4>
              <p className={styles.exampleDesc}>
                Salmón, sardinas, caballa. 2-3 veces/semana.
                Omega-3 EPA y DHA.
              </p>
            </div>
            <div className={styles.exampleCard}>
              <span className={styles.exampleIcon}>🫒</span>
              <h4 className={styles.exampleTitle}>Aceite de oliva</h4>
              <p className={styles.exampleDesc}>
                Virgen extra, en crudo idealmente.
                Polifenoles + grasas monoinsaturadas.
              </p>
            </div>
            <div className={styles.exampleCard}>
              <span className={styles.exampleIcon}>🥜</span>
              <h4 className={styles.exampleTitle}>Frutos secos</h4>
              <p className={styles.exampleDesc}>
                Nueces especialmente. 30g/día.
                Reducen LDL, aumentan HDL.
              </p>
            </div>
            <div className={styles.exampleCard}>
              <span className={styles.exampleIcon}>🫐</span>
              <h4 className={styles.exampleTitle}>Frutos rojos</h4>
              <p className={styles.exampleDesc}>
                Arándanos, fresas, frambuesas.
                Antocianinas protegen vasos.
              </p>
            </div>
            <div className={styles.exampleCard}>
              <span className={styles.exampleIcon}>🥬</span>
              <h4 className={styles.exampleTitle}>Verduras de hoja</h4>
              <p className={styles.exampleDesc}>
                Espinacas, kale, rúcula.
                Nitratos + vitamina K + folato.
              </p>
            </div>
            <div className={styles.exampleCard}>
              <span className={styles.exampleIcon}>🥣</span>
              <h4 className={styles.exampleTitle}>Avena</h4>
              <p className={styles.exampleDesc}>
                Beta-glucanos reducen LDL.
                3g/día = efecto significativo.
              </p>
            </div>
          </div>

          <h3>Patrón alimentario global:</h3>
          <p>
            La <strong>dieta mediterránea</strong> tiene la mayor evidencia
            científica para prevención cardiovascular. No es solo una lista
            de alimentos, sino un patrón completo que incluye:
          </p>
          <ul>
            <li>Abundancia de vegetales, frutas, legumbres, cereales integrales</li>
            <li>Aceite de oliva como grasa principal</li>
            <li>Pescado frecuente, carne roja ocasional</li>
            <li>Frutos secos diarios</li>
            <li>Vino tinto moderado (opcional)</li>
            <li>Socialización y comida en compañía</li>
          </ul>

          <div className={styles.infoBox}>
            <p>
              <strong>💡 Estudio PREDIMED:</strong> La dieta mediterránea suplementada
              con aceite de oliva virgen extra o nueces redujo los eventos
              cardiovasculares un 30% comparado con dieta baja en grasas. La calidad
              de las grasas importa más que la cantidad.
            </p>
          </div>
        </>
      ),
    },
  ];

  return <ChapterPage slug="cardiovascular" sections={sections} />;
}
