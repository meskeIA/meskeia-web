'use client';

import { LegalNotice } from '@/components';
import ChapterPage from '../../ChapterPage';
import styles from '../../CursoNutrisalud.module.css';

export default function CombinacionesPositivasPage() {
  const sections = [
    {
      title: 'El Poder de las Sinergias Nutricionales',
      icon: '✨',
      content: (
        <>
          <p>
            La nutrición no es solo sumar nutrientes individuales. Ciertos alimentos,
            cuando se combinan, crean <strong>sinergias</strong> que multiplican la
            absorción y el efecto de los nutrientes presentes. Estas combinaciones
            pueden aumentar la biodisponibilidad hasta 10 veces o más.
          </p>
          <p>
            Entender estas sinergias te permite diseñar comidas estratégicamente
            para maximizar la nutrición sin necesidad de suplementos costosos.
            La naturaleza ya tiene las soluciones; solo hay que saber combinar.
          </p>

          <div className={styles.highlightBox}>
            <p>
              <strong>🔬 Ciencia de las sinergias:</strong> La curcumina del cúrcuma
              sola tiene una biodisponibilidad de solo 1-2%. Combinada con piperina
              (pimienta negra), la absorción aumenta un 2000%. Una simple pizca de
              pimienta transforma completamente el valor de tu cúrcuma.
            </p>
          </div>
        </>
      ),
    },
    {
      title: 'Vitamina C + Hierro: La Combinación Clásica',
      icon: '🍊',
      content: (
        <>
          <p>
            El hierro no-hemo (de origen vegetal) tiene baja absorción por sí solo
            (2-20%). La vitamina C puede <strong>triplicar o cuadruplicar</strong>
            esta absorción al convertir el hierro férrico (Fe³⁺) en ferroso (Fe²⁺),
            que es la forma absorbible.
          </p>

          <h3>Combinaciones prácticas:</h3>
          <div className={styles.exampleGrid}>
            <div className={styles.exampleCard}>
              <span className={styles.exampleIcon}>🥗</span>
              <h4 className={styles.exampleTitle}>Espinacas + Limón</h4>
              <p className={styles.exampleDesc}>
                Ensalada de espinacas con aliño de limón.
                Hierro vegetal + vitamina C.
              </p>
            </div>
            <div className={styles.exampleCard}>
              <span className={styles.exampleIcon}>🍲</span>
              <h4 className={styles.exampleTitle}>Lentejas + Pimiento</h4>
              <p className={styles.exampleDesc}>
                Estofado de lentejas con pimiento rojo.
                Legumbres + alta vitamina C.
              </p>
            </div>
            <div className={styles.exampleCard}>
              <span className={styles.exampleIcon}>🥣</span>
              <h4 className={styles.exampleTitle}>Avena + Fresas</h4>
              <p className={styles.exampleDesc}>
                Porridge con fresas frescas.
                Hierro de avena + vitamina C de fresas.
              </p>
            </div>
            <div className={styles.exampleCard}>
              <span className={styles.exampleIcon}>🌮</span>
              <h4 className={styles.exampleTitle}>Frijoles + Salsa</h4>
              <p className={styles.exampleDesc}>
                Tacos de frijoles con pico de gallo.
                Hierro + vitamina C del tomate.
              </p>
            </div>
          </div>

          <div className={styles.infoBox}>
            <p>
              <strong>💡 Tip:</strong> Solo 25-50mg de vitamina C son suficientes para
              potenciar significativamente la absorción de hierro. Un kiwi, medio
              pimiento o unas fresas junto a tu comida rica en hierro lo consiguen.
            </p>
          </div>
        </>
      ),
    },
    {
      title: 'Grasas + Vitaminas Liposolubles',
      icon: '🥑',
      content: (
        <>
          <p>
            Las vitaminas A, D, E y K, así como los carotenoides (licopeno,
            betacaroteno, luteína), son <strong>liposolubles</strong>. Sin grasa
            en la misma comida, simplemente atraviesan tu intestino sin absorberse.
          </p>

          <h3>Evidencia científica:</h3>
          <ul>
            <li>Ensalada con aliño graso: absorción de carotenoides 7-10 veces mayor que sin grasa</li>
            <li>Tomates cocinados con aceite de oliva: licopeno más biodisponible que tomates crudos</li>
            <li>Zanahorias con hummus (grasa del tahini): betacaroteno mejor absorbido</li>
          </ul>

          <h3>Combinaciones óptimas:</h3>
          <table className={styles.comparisonTable}>
            <thead>
              <tr>
                <th>Alimento rico en vitaminas liposolubles</th>
                <th>Fuente de grasa ideal</th>
                <th>Beneficio</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Zanahorias, boniato</td>
                <td>Aceite de oliva, mantequilla</td>
                <td>Betacaroteno → Vitamina A</td>
              </tr>
              <tr>
                <td>Espinacas, kale</td>
                <td>Aguacate, frutos secos</td>
                <td>Vitamina K, luteína</td>
              </tr>
              <tr>
                <td>Tomates cocidos</td>
                <td>Aceite de oliva</td>
                <td>Licopeno (antioxidante)</td>
              </tr>
              <tr>
                <td>Huevos (yema)</td>
                <td>Ya contienen grasa</td>
                <td>Vitaminas A, D, E, K</td>
              </tr>
            </tbody>
          </table>

          <div className={styles.warningBox}>
            <p>
              <strong>⚠️ Error común:</strong> Ensaladas &quot;light&quot; sin aceite o con
              aliños sin grasa desaprovechan los nutrientes de las verduras. Un poco
              de aceite de oliva virgen extra es más saludable que evitar la grasa.
            </p>
          </div>
        </>
      ),
    },
    {
      title: 'Vitamina D + Calcio + Vitamina K2',
      icon: '🦴',
      content: (
        <>
          <p>
            Para la salud ósea, no basta con calcio solo. Se necesita un trío
            sinérgico: <strong>vitamina D para absorber</strong> el calcio,
            <strong>vitamina K2 para dirigirlo</strong> a los huesos (y no a las arterias).
          </p>

          <h3>Cómo funciona la sinergia:</h3>
          <ol>
            <li><strong>Vitamina D:</strong> Aumenta absorción intestinal de calcio de 10% a 40%</li>
            <li><strong>Vitamina K2:</strong> Activa proteínas que depositan calcio en huesos</li>
            <li><strong>Magnesio:</strong> Cofactor necesario para la activación de vitamina D</li>
          </ol>

          <h3>Fuentes de cada nutriente:</h3>
          <div className={styles.exampleGrid}>
            <div className={styles.exampleCard}>
              <span className={styles.exampleIcon}>🥛</span>
              <h4 className={styles.exampleTitle}>Calcio</h4>
              <p className={styles.exampleDesc}>
                Lácteos, sardinas con espinas, kale,
                brócoli, almendras, tofu con calcio
              </p>
            </div>
            <div className={styles.exampleCard}>
              <span className={styles.exampleIcon}>☀️</span>
              <h4 className={styles.exampleTitle}>Vitamina D</h4>
              <p className={styles.exampleDesc}>
                Sol (principal), pescados grasos,
                yema de huevo, suplementos
              </p>
            </div>
            <div className={styles.exampleCard}>
              <span className={styles.exampleIcon}>🧀</span>
              <h4 className={styles.exampleTitle}>Vitamina K2</h4>
              <p className={styles.exampleDesc}>
                Natto (soja fermentada), queso curado,
                yema de huevo de gallinas camperas
              </p>
            </div>
            <div className={styles.exampleCard}>
              <span className={styles.exampleIcon}>🥬</span>
              <h4 className={styles.exampleTitle}>Magnesio</h4>
              <p className={styles.exampleDesc}>
                Semillas de calabaza, cacao puro,
                almendras, espinacas, aguacate
              </p>
            </div>
          </div>

          <div className={styles.highlightBox}>
            <p>
              <strong>🦴 Comida sinérgica ideal:</strong> Salmón (D + omega-3) con
              ensalada de kale (K1 + calcio) aliñada con aceite de oliva, acompañado
              de queso parmesano (K2 + calcio) y semillas de calabaza (magnesio).
            </p>
          </div>
        </>
      ),
    },
    {
      title: 'Más Sinergias Poderosas',
      icon: '🚀',
      content: (
        <>
          <h3>Cúrcuma + Pimienta Negra + Grasa</h3>
          <p>
            La curcumina necesita piperina para absorberse (+2000%) y grasa para
            llegar a las células (es liposoluble). Un &quot;golden milk&quot; con pimienta
            y aceite de coco es óptimo.
          </p>

          <h3>Proteínas Complementarias (vegetales)</h3>
          <ul>
            <li><strong>Legumbres + Cereales:</strong> Lentejas con arroz, hummus con pan</li>
            <li><strong>Legumbres + Semillas:</strong> Ensalada de garbanzos con semillas de calabaza</li>
            <li><strong>Cereales + Frutos secos:</strong> Avena con nueces</li>
          </ul>

          <h3>Quercetina + Vitamina C</h3>
          <p>
            La quercetina (cebollas, manzanas) y la vitamina C se potencian
            mutuamente como antioxidantes. Una ensalada de manzana con cebolla
            y cítricos maximiza este efecto.
          </p>

          <h3>Prebióticos + Probióticos (simbióticos)</h3>
          <ul>
            <li>Yogur (probiótico) + plátano o avena (prebiótico)</li>
            <li>Kéfir + frutos rojos</li>
            <li>Chucrut + patata enfriada (almidón resistente)</li>
          </ul>

          <div className={styles.infoBox}>
            <p>
              <strong>💡 Resumen práctico:</strong> No necesitas memorizar cada sinergia.
              Simplemente: come colores variados, incluye grasas saludables, combina
              fuentes vegetales de proteína, y añade cítricos o pimientos a comidas
              con hierro vegetal.
            </p>
          </div>

          <div className={styles.highlightBox}>
            <p>
              <strong>🍽️ Regla simple:</strong> Una comida colorida con verduras,
              proteína, grasa saludable y algo ácido (limón, vinagre) naturalmente
              activa múltiples sinergias sin necesidad de planificación compleja.
            </p>
          </div>
        </>
      ),
    },
  ];

  return <ChapterPage slug="combinaciones-positivas" sections={sections} />;
}
