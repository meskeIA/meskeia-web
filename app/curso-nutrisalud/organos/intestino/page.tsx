'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../CursoNutrisalud.module.css';

export default function IntestinoPage() {
  const sections = [
    {
      title: 'La Microbiota: Tu Ecosistema Interior',
      icon: '🦠',
      content: (
        <>
          <p>
            En tu intestino viven <strong>billones de microorganismos</strong> (bacterias,
            hongos, virus) que colectivamente se llaman microbiota. Este ecosistema
            pesa aproximadamente 2 kg y contiene más genes que tu propio genoma
            humano (100:1). No son invasores: son socios metabólicos esenciales.
          </p>

          <h3>Funciones de la microbiota:</h3>
          <ul>
            <li><strong>Digestión:</strong> Fermentan fibras que no podemos digerir</li>
            <li><strong>Síntesis de vitaminas:</strong> K2, algunas vitaminas B</li>
            <li><strong>Sistema inmune:</strong> 70% del sistema inmune está en el intestino</li>
            <li><strong>Neurotransmisores:</strong> Producen 95% de la serotonina corporal</li>
            <li><strong>Protección:</strong> Compiten con patógenos por espacio y recursos</li>
            <li><strong>Metabolismo:</strong> Influyen en peso, glucemia, inflamación</li>
          </ul>

          <div className={styles.highlightBox}>
            <p>
              <strong>🧠 El eje intestino-cerebro:</strong> Tu intestino y tu cerebro
              están conectados por el nervio vago y señales químicas. El estado de
              tu microbiota afecta directamente el ánimo, ansiedad, e incluso el
              comportamiento alimentario.
            </p>
          </div>
        </>
      ),
    },
    {
      title: 'Diversidad: La Clave de una Microbiota Sana',
      icon: '🌈',
      content: (
        <>
          <p>
            Una microbiota sana se caracteriza por su <strong>diversidad</strong>.
            Cuantas más especies diferentes, más funciones pueden realizar y más
            resiliente es el ecosistema ante perturbaciones (antibióticos, estrés,
            enfermedades).
          </p>

          <h3>Factores que reducen la diversidad:</h3>
          <ul>
            <li>Antibióticos (necesarios a veces, pero con impacto)</li>
            <li>Dieta baja en fibra</li>
            <li>Dieta ultraprocesada</li>
            <li>Estrés crónico</li>
            <li>Falta de exposición a entornos naturales</li>
            <li>Exceso de higiene (hipótesis)</li>
          </ul>

          <h3>Factores que aumentan la diversidad:</h3>
          <ul>
            <li>Dieta rica en fibras variadas (30+ plantas/semana)</li>
            <li>Alimentos fermentados (yogur, kéfir, chucrut, kimchi)</li>
            <li>Contacto con naturaleza (jardín, mascotas, campo)</li>
            <li>Ejercicio regular</li>
            <li>Sueño adecuado</li>
            <li>Reducción del estrés</li>
          </ul>

          <div className={styles.infoBox}>
            <p>
              <strong>💡 Meta semanal:</strong> El proyecto American Gut descubrió
              que las personas que comen 30+ plantas diferentes por semana tienen
              microbiota significativamente más diversa. Incluye vegetales, frutas,
              legumbres, cereales integrales, frutos secos, semillas y hierbas.
            </p>
          </div>
        </>
      ),
    },
    {
      title: 'Prebióticos y Probióticos: Alimenta Tu Microbiota',
      icon: '🍽️',
      content: (
        <>
          <h3>Prebióticos: El alimento de tus bacterias</h3>
          <p>
            Son fibras y compuestos que tú no digieres pero que alimentan a las
            bacterias beneficiosas de tu intestino.
          </p>

          <div className={styles.exampleGrid}>
            <div className={styles.exampleCard}>
              <span className={styles.exampleIcon}>🧅</span>
              <h4 className={styles.exampleTitle}>Inulina/FOS</h4>
              <p className={styles.exampleDesc}>
                Cebolla, ajo, puerro, alcachofa,
                espárragos, plátano verde.
              </p>
            </div>
            <div className={styles.exampleCard}>
              <span className={styles.exampleIcon}>🌾</span>
              <h4 className={styles.exampleTitle}>Almidón resistente</h4>
              <p className={styles.exampleDesc}>
                Patata enfriada, arroz enfriado,
                plátano verde, legumbres.
              </p>
            </div>
            <div className={styles.exampleCard}>
              <span className={styles.exampleIcon}>🥣</span>
              <h4 className={styles.exampleTitle}>Beta-glucanos</h4>
              <p className={styles.exampleDesc}>
                Avena, cebada, setas (shiitake,
                maitake, reishi).
              </p>
            </div>
            <div className={styles.exampleCard}>
              <span className={styles.exampleIcon}>🍇</span>
              <h4 className={styles.exampleTitle}>Polifenoles</h4>
              <p className={styles.exampleDesc}>
                Frutos rojos, cacao, té verde,
                café, vino tinto (moderación).
              </p>
            </div>
          </div>

          <h3>Probióticos: Bacterias vivas beneficiosas</h3>
          <p>
            Alimentos que contienen microorganismos vivos que, al consumirlos,
            aportan beneficios para la salud.
          </p>

          <table className={styles.comparisonTable}>
            <thead>
              <tr>
                <th>Alimento</th>
                <th>Cepas principales</th>
                <th>Beneficios</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Yogur natural</td>
                <td>L. bulgaricus, S. thermophilus</td>
                <td>Digestión lactosa, inmunidad</td>
              </tr>
              <tr>
                <td>Kéfir</td>
                <td>Múltiples (50+ cepas)</td>
                <td>Mayor diversidad que yogur</td>
              </tr>
              <tr>
                <td>Chucrut (sin pasteurizar)</td>
                <td>L. plantarum, L. brevis</td>
                <td>Resistentes a ácido gástrico</td>
              </tr>
              <tr>
                <td>Kimchi</td>
                <td>L. kimchii y otras</td>
                <td>Antiinflamatorio, vitaminas</td>
              </tr>
              <tr>
                <td>Kombucha</td>
                <td>SCOBY (levaduras + bacterias)</td>
                <td>Antioxidantes, probióticos</td>
              </tr>
            </tbody>
          </table>

          <div className={styles.warningBox}>
            <p>
              <strong>⚠️ Importante:</strong> Los alimentos fermentados industriales
              a menudo están pasteurizados, lo que mata los probióticos. Busca
              productos refrigerados que digan &quot;con cultivos vivos&quot; o hazlos en casa.
            </p>
          </div>
        </>
      ),
    },
    {
      title: 'Permeabilidad Intestinal: El Intestino Permeable',
      icon: '🚧',
      content: (
        <>
          <p>
            La barrera intestinal permite absorber nutrientes mientras bloquea
            toxinas, bacterias y alimentos no digeridos. Cuando esta barrera se
            daña, aumenta la <strong>permeabilidad intestinal</strong> (a veces llamado
            &quot;intestino permeable&quot;), permitiendo que sustancias indeseadas
            entren al torrente sanguíneo.
          </p>

          <h3>Factores que dañan la barrera intestinal:</h3>
          <ul>
            <li>Gluten (en personas sensibles)</li>
            <li>Alcohol excesivo</li>
            <li>AINEs crónicos (ibuprofeno, aspirina)</li>
            <li>Estrés crónico</li>
            <li>Dieta baja en fibra</li>
            <li>Disbiosis (desequilibrio de microbiota)</li>
            <li>Infecciones intestinales</li>
          </ul>

          <h3>Factores que reparan y protegen:</h3>
          <div className={styles.exampleGrid}>
            <div className={styles.exampleCard}>
              <span className={styles.exampleIcon}>🍖</span>
              <h4 className={styles.exampleTitle}>Glutamina</h4>
              <p className={styles.exampleDesc}>
                Combustible para células intestinales.
                Carne, huevos, col, lácteos.
              </p>
            </div>
            <div className={styles.exampleCard}>
              <span className={styles.exampleIcon}>🦴</span>
              <h4 className={styles.exampleTitle}>Caldo de huesos</h4>
              <p className={styles.exampleDesc}>
                Colágeno, glicina, prolina.
                Tradicional para salud intestinal.
              </p>
            </div>
            <div className={styles.exampleCard}>
              <span className={styles.exampleIcon}>🥬</span>
              <h4 className={styles.exampleTitle}>Zinc</h4>
              <p className={styles.exampleDesc}>
                Esencial para reparar tejidos.
                Mariscos, carne, semillas calabaza.
              </p>
            </div>
            <div className={styles.exampleCard}>
              <span className={styles.exampleIcon}>🐟</span>
              <h4 className={styles.exampleTitle}>Omega-3</h4>
              <p className={styles.exampleDesc}>
                Antiinflamatorio, protege mucosa.
                Pescados grasos, chía, nueces.
              </p>
            </div>
          </div>

          <div className={styles.highlightBox}>
            <p>
              <strong>🧈 Butirato:</strong> Ácido graso de cadena corta que tus
              bacterias producen al fermentar fibra. Es el principal combustible
              de las células del colon y fortalece la barrera intestinal. Más
              fibra = más butirato = intestino más sano.
            </p>
          </div>
        </>
      ),
    },
    {
      title: 'Plan de Alimentación para la Salud Intestinal',
      icon: '🎯',
      content: (
        <>
          <h3>Diariamente:</h3>
          <ul>
            <li>5+ porciones de vegetales variados (colores diferentes)</li>
            <li>1-2 porciones de alimentos fermentados</li>
            <li>25-35g de fibra (de fuentes variadas)</li>
            <li>Hidratación abundante (agua, no bebidas azucaradas)</li>
          </ul>

          <h3>Semanalmente:</h3>
          <ul>
            <li>Legumbres 3-4 veces (diferentes tipos)</li>
            <li>Pescado graso 2-3 veces</li>
            <li>Variedad de 30+ plantas diferentes</li>
            <li>Hierbas y especias diversas</li>
          </ul>

          <h3>Limitar/evitar:</h3>
          <ul>
            <li>Edulcorantes artificiales (alteran microbiota)</li>
            <li>Emulsionantes (carragenina, polisorbatos)</li>
            <li>Ultraprocesados en general</li>
            <li>Antibióticos innecesarios (solo cuando médicamente indicado)</li>
          </ul>

          <div className={styles.infoBox}>
            <p>
              <strong>💡 Transición gradual:</strong> Si actualmente comes poca fibra,
              aumenta gradualmente durante 2-3 semanas. Un aumento brusco puede
              causar gases e hinchazón temporales mientras tu microbiota se adapta.
            </p>
          </div>

          <h3>Señales de una microbiota sana:</h3>
          <ul>
            <li>Deposiciones regulares y bien formadas (1-2 veces/día)</li>
            <li>Sin hinchazón excesiva después de comer fibra</li>
            <li>Buen estado de ánimo y energía estable</li>
            <li>Sistema inmune fuerte (pocas infecciones)</li>
            <li>Piel saludable</li>
          </ul>
        </>
      ),
    },
  ];

  return <ChapterPage slug="intestino" sections={sections} />;
}
