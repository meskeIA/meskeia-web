'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../CursoNutrisalud.module.css';

export default function LecturaEtiquetasPage() {
  const sections = [
    {
      title: 'La Etiqueta: Tu Herramienta de Decisión',
      icon: '🏷️',
      content: (
        <>
          <p>
            La etiqueta nutricional es obligatoria en productos envasados, pero pocos
            saben interpretarla correctamente. Más allá de las calorías, contiene
            información valiosa que puede revelar si un producto es nutritivo o solo
            aparenta serlo.
          </p>
          <p>
            Lo más importante no es la información nutricional, sino la
            <strong> lista de ingredientes</strong>. Esta te dice exactamente qué
            contiene el producto, ordenado de mayor a menor cantidad.
          </p>

          <div className={styles.highlightBox}>
            <p>
              <strong>🔍 Regla fundamental:</strong> Los ingredientes se listan por
              peso, de mayor a menor. Si el azúcar o una grasa refinada aparece
              entre los primeros tres ingredientes, ese producto es probablemente
              más postre que alimento nutritivo.
            </p>
          </div>
        </>
      ),
    },
    {
      title: 'La Lista de Ingredientes: Lo que Realmente Importa',
      icon: '📋',
      content: (
        <>
          <h3>Señales de un buen producto:</h3>
          <ul>
            <li>Lista corta (5-10 ingredientes o menos)</li>
            <li>Ingredientes que reconoces y podrías comprar en una tienda</li>
            <li>Primeros ingredientes son alimentos reales (harina integral, pollo, tomate)</li>
            <li>Sin aditivos innecesarios o difíciles de pronunciar</li>
          </ul>

          <h3>Señales de alerta:</h3>
          <ul>
            <li>Lista muy larga (20+ ingredientes)</li>
            <li>Azúcar o derivados entre los primeros ingredientes</li>
            <li>Múltiples tipos de azúcar (truco para que ninguno sea &quot;el primero&quot;)</li>
            <li>Aceites vegetales refinados (girasol, palma, soja)</li>
            <li>Ingredientes que no usarías en tu cocina</li>
          </ul>

          <div className={styles.exampleGrid}>
            <div className={styles.exampleCard} style={{ borderTop: '4px solid #27AE60' }}>
              <span className={styles.exampleIcon}>✅</span>
              <h4 className={styles.exampleTitle}>Buen ejemplo</h4>
              <p className={styles.exampleDesc}>
                &quot;Ingredientes: Avena integral, pasas,
                almendras, sal&quot;<br />
                4 ingredientes reconocibles.
              </p>
            </div>
            <div className={styles.exampleCard} style={{ borderTop: '4px solid #E74C3C' }}>
              <span className={styles.exampleIcon}>⛔</span>
              <h4 className={styles.exampleTitle}>Mal ejemplo</h4>
              <p className={styles.exampleDesc}>
                &quot;Cereales de trigo, azúcar, jarabe de glucosa,
                maltodextrina, aceite de palma...&quot;<br />
                15+ ingredientes, azúcares predominan.
              </p>
            </div>
          </div>
        </>
      ),
    },
    {
      title: 'Azúcares Ocultos: 60+ Nombres Diferentes',
      icon: '🍬',
      content: (
        <>
          <p>
            La industria alimentaria usa más de 60 nombres diferentes para el azúcar,
            dificultando que los consumidores lo identifiquen. Aprende a reconocerlos.
          </p>

          <h3>Nombres comunes del azúcar:</h3>
          <table className={styles.comparisonTable}>
            <thead>
              <tr>
                <th>Categoría</th>
                <th>Nombres</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Terminados en &quot;-osa&quot;</td>
                <td>Glucosa, fructosa, sacarosa, dextrosa, maltosa, lactosa</td>
              </tr>
              <tr>
                <td>Jarabes</td>
                <td>Jarabe de maíz, de glucosa, de arce, de agave, de arroz</td>
              </tr>
              <tr>
                <td>Concentrados</td>
                <td>Concentrado de zumo de fruta, mosto</td>
              </tr>
              <tr>
                <td>Otros nombres</td>
                <td>Miel, melaza, panela, azúcar de coco, caramelo</td>
              </tr>
              <tr>
                <td>Técnicos</td>
                <td>Maltodextrina, dextrina, isomaltosa</td>
              </tr>
            </tbody>
          </table>

          <div className={styles.warningBox}>
            <p>
              <strong>⚠️ Truco del azúcar fragmentado:</strong> Un producto puede
              listar &quot;harina de trigo&quot; primero, pero si sumas jarabe de glucosa +
              azúcar + miel + dextrosa, el total de azúcares supera a cualquier otro
              ingrediente. Lee toda la lista.
            </p>
          </div>

          <h3>Azúcares &quot;saludables&quot; que siguen siendo azúcar:</h3>
          <ul>
            <li><strong>Azúcar de coco:</strong> 70-80% sacarosa. No es mejor.</li>
            <li><strong>Miel:</strong> Nutrientes mínimos. Metabolismo igual que azúcar.</li>
            <li><strong>Sirope de agave:</strong> 90% fructosa. Peor para el hígado.</li>
            <li><strong>Panela:</strong> Azúcar de caña sin refinar. Sigue siendo azúcar.</li>
          </ul>
        </>
      ),
    },
    {
      title: 'Claims de Marketing: No Te Dejes Engañar',
      icon: '📣',
      content: (
        <>
          <p>
            El frente del paquete está diseñado para vender, no para informar.
            Los claims pueden ser técnicamente verdaderos pero engañosos.
          </p>

          <h3>Claims que no significan lo que crees:</h3>

          <table className={styles.comparisonTable}>
            <thead>
              <tr>
                <th>Claim</th>
                <th>Lo que parece</th>
                <th>Realidad</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>&quot;Natural&quot;</td>
                <td>Saludable, sin procesar</td>
                <td>No regulado. Puede contener aditivos.</td>
              </tr>
              <tr>
                <td>&quot;Sin azúcar añadido&quot;</td>
                <td>Sin azúcar</td>
                <td>Puede tener azúcares naturales altos (zumos)</td>
              </tr>
              <tr>
                <td>&quot;Light&quot; o &quot;Bajo en grasa&quot;</td>
                <td>Más saludable</td>
                <td>A menudo más azúcar para compensar sabor</td>
              </tr>
              <tr>
                <td>&quot;Integral&quot;</td>
                <td>100% grano completo</td>
                <td>Puede ser mayormente harina refinada</td>
              </tr>
              <tr>
                <td>&quot;Rico en fibra&quot;</td>
                <td>Alimento natural alto en fibra</td>
                <td>Fibra añadida artificialmente (inulina)</td>
              </tr>
              <tr>
                <td>&quot;Sin colesterol&quot;</td>
                <td>Cardiosaludable</td>
                <td>Puede estar lleno de azúcar y grasas malas</td>
              </tr>
            </tbody>
          </table>

          <div className={styles.highlightBox}>
            <p>
              <strong>🎯 Regla de oro:</strong> Cuanto más grita un producto sus
              beneficios en el frente del paquete, más debes sospechar. Los
              alimentos realmente nutritivos (verduras, huevos, pescado) no
              necesitan marketing agresivo.
            </p>
          </div>

          <h3>Claims legítimos a buscar:</h3>
          <ul>
            <li><strong>&quot;Virgen extra&quot;</strong> (aceite de oliva): Regulado, significa calidad real</li>
            <li><strong>&quot;Ecológico/Bio&quot;</strong>: Certificación oficial, límites de pesticidas</li>
            <li><strong>&quot;DOP/IGP&quot;</strong>: Denominación de origen protegida</li>
          </ul>
        </>
      ),
    },
    {
      title: 'Aditivos: Cuáles Evitar y Cuáles Son Seguros',
      icon: '🧪',
      content: (
        <>
          <p>
            Los aditivos (E-xxx) cumplen funciones técnicas: conservar, colorear,
            espesar, emulsionar. Algunos son inofensivos o incluso nutrientes;
            otros son controvertidos o a evitar.
          </p>

          <h3>Aditivos generalmente seguros:</h3>
          <ul>
            <li><strong>E-300 (Ácido ascórbico):</strong> Vitamina C</li>
            <li><strong>E-306 (Tocoferol):</strong> Vitamina E</li>
            <li><strong>E-330 (Ácido cítrico):</strong> Presente en cítricos</li>
            <li><strong>E-410, E-412, E-415:</strong> Espesantes naturales (guar, xantana)</li>
            <li><strong>E-160 (Carotenos):</strong> Colorantes naturales</li>
          </ul>

          <h3>Aditivos a limitar o evitar:</h3>
          <div className={styles.exampleGrid}>
            <div className={styles.exampleCard}>
              <span className={styles.exampleIcon}>⚠️</span>
              <h4 className={styles.exampleTitle}>Nitratos/Nitritos</h4>
              <p className={styles.exampleDesc}>
                E-249 a E-252. En embutidos.
                Asociados a riesgo de cáncer colorrectal.
              </p>
            </div>
            <div className={styles.exampleCard}>
              <span className={styles.exampleIcon}>⚠️</span>
              <h4 className={styles.exampleTitle}>Colorantes azo</h4>
              <p className={styles.exampleDesc}>
                E-102, E-110, E-122, E-129.
                Posible hiperactividad en niños.
              </p>
            </div>
            <div className={styles.exampleCard}>
              <span className={styles.exampleIcon}>⚠️</span>
              <h4 className={styles.exampleTitle}>Edulcorantes artificiales</h4>
              <p className={styles.exampleDesc}>
                E-950 (acesulfamo K), E-951 (aspartamo).
                Impacto en microbiota debatido.
              </p>
            </div>
            <div className={styles.exampleCard}>
              <span className={styles.exampleIcon}>⚠️</span>
              <h4 className={styles.exampleTitle}>Emulsionantes</h4>
              <p className={styles.exampleDesc}>
                E-433, E-466, E-407 (carragenina).
                Posible impacto en barrera intestinal.
              </p>
            </div>
          </div>

          <div className={styles.infoBox}>
            <p>
              <strong>💡 Perspectiva:</strong> No te obsesiones con cada E-número.
              Lo más importante es reducir ultraprocesados en general. Si comes
              principalmente alimentos frescos, tu exposición a aditivos será
              naturalmente baja.
            </p>
          </div>

          <h3>Guía práctica de compra:</h3>
          <ol>
            <li>Lee la lista de ingredientes ANTES de la información nutricional</li>
            <li>Si no entiendes un ingrediente, investígalo o evita el producto</li>
            <li>Compara productos similares: elige el de lista más corta</li>
            <li>Desconfía del marketing agresivo en el frente</li>
            <li>Prioriza alimentos sin etiqueta (frescos)</li>
          </ol>
        </>
      ),
    },
  ];

  return <ChapterPage slug="lectura-etiquetas" sections={sections} />;
}
