'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../CursoNutrisalud.module.css';

export default function MatrizAlimentariaPage() {
  const sections = [
    {
      title: 'Un Alimento Es Más Que Sus Nutrientes',
      icon: '🧩',
      content: (
        <>
          <p>
            La <strong>matriz alimentaria</strong> es la estructura física y química
            completa de un alimento: cómo están organizados sus nutrientes, las fibras
            que los envuelven, las membranas celulares, los compuestos bioactivos
            que los acompañan. Esta estructura determina cómo se digiere, absorbe
            y metaboliza cada alimento.
          </p>
          <p>
            Por eso un alimento entero tiene efectos diferentes a sus nutrientes
            aislados o procesados. 100 calorías de manzana no equivalen metabólicamente
            a 100 calorías de zumo de manzana, aunque vengan del mismo fruto.
          </p>

          <div className={styles.highlightBox}>
            <p>
              <strong>🍎 Ejemplo clásico:</strong> Una manzana entera contiene fibra,
              agua, vitaminas y polifenoles en una matriz que ralentiza la liberación
              de azúcar. El zumo de manzana ha perdido la fibra y concentra el azúcar,
              produciendo un pico glucémico similar al de un refresco.
            </p>
          </div>
        </>
      ),
    },
    {
      title: 'El Efecto Matriz en Acción',
      icon: '🔬',
      content: (
        <>
          <h3>Caso 1: Frutos secos</h3>
          <p>
            Las almendras tienen ~576 kcal/100g en las tablas nutricionales, pero
            estudios demuestran que absorbemos solo ~70% de esas calorías. La matriz
            (fibra, paredes celulares) impide la absorción completa de las grasas.
          </p>

          <h3>Caso 2: Lácteos fermentados vs leche</h3>
          <p>
            El queso y el yogur tienen efectos cardiovasculares neutros o positivos,
            mientras que algunos estudios asocian el exceso de leche líquida con
            riesgos. La fermentación transforma la matriz: péptidos bioactivos,
            probióticos, calcio más biodisponible.
          </p>

          <h3>Caso 3: Cereales integrales vs refinados</h3>
          <div className={styles.exampleGrid}>
            <div className={styles.exampleCard}>
              <span className={styles.exampleIcon}>🌾</span>
              <h4 className={styles.exampleTitle}>Grano Integral</h4>
              <p className={styles.exampleDesc}>
                Salvado + germen + endospermo.
                Fibra, vitaminas B, minerales.
                Liberación lenta de glucosa.
              </p>
            </div>
            <div className={styles.exampleCard}>
              <span className={styles.exampleIcon}>🍞</span>
              <h4 className={styles.exampleTitle}>Grano Refinado</h4>
              <p className={styles.exampleDesc}>
                Solo endospermo (almidón).
                Sin fibra ni micronutrientes.
                Pico rápido de glucosa.
              </p>
            </div>
          </div>

          <div className={styles.infoBox}>
            <p>
              <strong>💡 Concepto clave:</strong> La molienda destruye la matriz.
              Un grano integral molido en harina fina pierde parte de sus beneficios
              aunque técnicamente tenga los mismos nutrientes. La textura importa.
            </p>
          </div>
        </>
      ),
    },
    {
      title: 'Alimentos Enteros vs Suplementos',
      icon: '💊',
      content: (
        <>
          <p>
            Los suplementos aislan nutrientes específicos, eliminando la matriz
            alimentaria. Esto puede ser útil para corregir deficiencias específicas,
            pero no replica los beneficios de los alimentos completos.
          </p>

          <table className={styles.comparisonTable}>
            <thead>
              <tr>
                <th>Nutriente</th>
                <th>En alimento</th>
                <th>Como suplemento</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Vitamina C</td>
                <td>Naranja: con flavonoides, fibra, potasio. Sinergia antioxidante.</td>
                <td>Ácido ascórbico aislado. Funciona, pero sin cofactores.</td>
              </tr>
              <tr>
                <td>Omega-3</td>
                <td>Pescado: con proteína, selenio, D, en matriz de fosfolípidos.</td>
                <td>Aceite de pescado: absorción variable, sin cofactores.</td>
              </tr>
              <tr>
                <td>Fibra</td>
                <td>Legumbres: con proteína, minerales, polifenoles, prebióticos.</td>
                <td>Suplemento: un tipo solo, sin compuestos acompañantes.</td>
              </tr>
              <tr>
                <td>Calcio</td>
                <td>Lácteos: con K2, proteínas lácteas, probióticos (yogur).</td>
                <td>Carbonato/citrato: puede depositarse mal sin K2 y D.</td>
              </tr>
            </tbody>
          </table>

          <h3>Cuándo los suplementos son útiles:</h3>
          <ul>
            <li><strong>Deficiencias diagnosticadas:</strong> Hierro en anemia, B12 en veganos</li>
            <li><strong>Condiciones especiales:</strong> Embarazo (ácido fólico), veganos (B12, D)</li>
            <li><strong>Imposibilidad de obtener del alimento:</strong> Vitamina D en invierno</li>
            <li><strong>Necesidades aumentadas:</strong> Atletas de alto rendimiento</li>
          </ul>

          <div className={styles.warningBox}>
            <p>
              <strong>⚠️ Cuidado con el exceso:</strong> Los suplementos pueden causar
              toxicidad porque carecen de los mecanismos de autorregulación de los
              alimentos. Nadie ha desarrollado toxicidad por vitamina A comiendo
              zanahorias, pero sí por suplementos en exceso.
            </p>
          </div>
        </>
      ),
    },
    {
      title: 'Procesamiento y Destrucción de la Matriz',
      icon: '⚙️',
      content: (
        <>
          <p>
            Cada nivel de procesamiento altera la matriz alimentaria. Algunos
            procesamientos son beneficiosos (cocción de legumbres), otros neutros
            (congelación), y otros perjudiciales (ultraprocesamiento).
          </p>

          <h3>Espectro de procesamiento:</h3>
          <div className={styles.exampleGrid}>
            <div className={styles.exampleCard} style={{ borderTop: '4px solid #27AE60' }}>
              <span className={styles.exampleIcon}>✅</span>
              <h4 className={styles.exampleTitle}>Mínimo procesamiento</h4>
              <p className={styles.exampleDesc}>
                Lavado, cortado, congelación, refrigeración.
                Matriz esencialmente intacta.
              </p>
            </div>
            <div className={styles.exampleCard} style={{ borderTop: '4px solid #F39C12' }}>
              <span className={styles.exampleIcon}>⚠️</span>
              <h4 className={styles.exampleTitle}>Procesamiento culinario</h4>
              <p className={styles.exampleDesc}>
                Cocción, fermentación, molienda casera.
                Matriz alterada pero reconocible.
              </p>
            </div>
            <div className={styles.exampleCard} style={{ borderTop: '4px solid #E74C3C' }}>
              <span className={styles.exampleIcon}>⛔</span>
              <h4 className={styles.exampleTitle}>Ultraprocesamiento</h4>
              <p className={styles.exampleDesc}>
                Extrusión, hidrogenación, aditivos.
                Matriz destruida, reconstruida artificialmente.
              </p>
            </div>
          </div>

          <h3>Señales de ultraprocesamiento:</h3>
          <ul>
            <li>Ingredientes que no usarías en casa (maltodextrina, jarabe de glucosa-fructosa)</li>
            <li>Lista de ingredientes muy larga (&gt;10 componentes)</li>
            <li>Aditivos cosméticos (colorantes, aromas artificiales)</li>
            <li>Textura o apariencia &quot;demasiado perfecta&quot;</li>
            <li>Larga vida útil sin refrigeración</li>
          </ul>

          <div className={styles.infoBox}>
            <p>
              <strong>💡 Regla práctica:</strong> Si tu abuela no lo reconocería como
              comida, o si no podrías hacerlo en tu cocina, probablemente es
              ultraprocesado. Prioriza alimentos con lista de ingredientes corta
              o sin lista (productos frescos).
            </p>
          </div>
        </>
      ),
    },
    {
      title: 'Aplicación: Priorizando Alimentos Enteros',
      icon: '🎯',
      content: (
        <>
          <h3>Jerarquía de elecciones:</h3>
          <ol>
            <li><strong>Alimento entero fresco:</strong> Fruta, verdura, huevo, pescado</li>
            <li><strong>Alimento entero congelado:</strong> Verduras congeladas, pescado congelado</li>
            <li><strong>Procesamiento mínimo:</strong> Legumbres en conserva (sin azúcar añadido)</li>
            <li><strong>Procesamiento tradicional:</strong> Pan de masa madre, queso, encurtidos</li>
            <li><strong>Procesamiento moderado:</strong> Pasta integral, aceite de oliva</li>
            <li><strong>Evitar/limitar:</strong> Ultraprocesados industriales</li>
          </ol>

          <h3>Ejemplos de sustituciones:</h3>
          <table className={styles.comparisonTable}>
            <thead>
              <tr>
                <th>En lugar de...</th>
                <th>Elige...</th>
                <th>Por qué</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Zumo de naranja</td>
                <td>Naranja entera</td>
                <td>Fibra intacta, saciedad, menos pico glucémico</td>
              </tr>
              <tr>
                <td>Barritas de cereales</td>
                <td>Avena con fruta</td>
                <td>Sin azúcares añadidos, fibra soluble</td>
              </tr>
              <tr>
                <td>Mantequilla de cacahuete comercial</td>
                <td>Cacahuetes naturales</td>
                <td>Sin aceites añadidos, más masticación</td>
              </tr>
              <tr>
                <td>Embutidos</td>
                <td>Carne fresca cocinada</td>
                <td>Sin nitratos, sin conservantes</td>
              </tr>
            </tbody>
          </table>

          <div className={styles.highlightBox}>
            <p>
              <strong>🛒 Estrategia de compra:</strong> Haz la mayor parte de tu compra
              en el perímetro del supermercado (frescos, refrigerados) y minimiza
              los pasillos centrales (ultraprocesados envasados). Tu matriz
              alimentaria te lo agradecerá.
            </p>
          </div>
        </>
      ),
    },
  ];

  return <ChapterPage slug="matriz-alimentaria" sections={sections} />;
}
