'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../CursoNutrisalud.module.css';

export default function MicronutrientesPage() {
  const sections = [
    {
      title: 'El Mundo Invisible de los Micronutrientes',
      icon: '🔬',
      content: (
        <>
          <p>
            Mientras los macronutrientes proporcionan energía, los <strong>micronutrientes</strong>
            orquestan todas las reacciones bioquímicas de tu cuerpo. Vitaminas, minerales
            y antioxidantes son los catalizadores que permiten que tu metabolismo funcione
            correctamente.
          </p>
          <p>
            El concepto clave aquí es la <strong>biodisponibilidad</strong>: no basta con
            consumir un nutriente, lo importante es cuánto de ese nutriente tu cuerpo
            puede realmente absorber y utilizar. Un suplemento puede contener 1000mg de
            un mineral, pero si solo absorbes el 5%, estás obteniendo 50mg reales.
          </p>

          <div className={styles.highlightBox}>
            <p>
              <strong>🧪 Realidad de absorción:</strong> El hierro de la carne (hemo) se
              absorbe hasta un 35%, mientras que el hierro vegetal (no-hemo) solo un 2-20%.
              Pero combinar hierro vegetal con vitamina C puede triplicar su absorción.
            </p>
          </div>
        </>
      ),
    },
    {
      title: 'Vitaminas: Catalizadores de la Vida',
      icon: '💊',
      content: (
        <>
          <h3>Vitaminas Liposolubles (A, D, E, K)</h3>
          <p>
            Se almacenan en el tejido graso y requieren grasas dietéticas para su absorción.
          </p>
          <ul>
            <li>
              <strong>Vitamina A:</strong> Visión, inmunidad, piel. Fuentes: hígado, zanahorias,
              boniato. El betacaroteno (precursor) se absorbe mejor con grasas.
            </li>
            <li>
              <strong>Vitamina D:</strong> Huesos, inmunidad, ánimo. El sol es la fuente principal.
              Suplementación recomendada en latitudes altas o trabajo interior.
            </li>
            <li>
              <strong>Vitamina E:</strong> Antioxidante, protección celular. Fuentes: almendras,
              aguacate, aceite de oliva virgen.
            </li>
            <li>
              <strong>Vitamina K:</strong> Coagulación, salud ósea. K1 en verduras verdes,
              K2 en fermentados y yema de huevo.
            </li>
          </ul>

          <div className={styles.infoBox}>
            <p>
              <strong>💡 Tip de absorción:</strong> Siempre consume verduras ricas en
              vitaminas liposolubles con una fuente de grasa saludable. Un poco de
              aceite de oliva en la ensalada puede aumentar la absorción hasta 10 veces.
            </p>
          </div>

          <h3>Vitaminas Hidrosolubles (C y grupo B)</h3>
          <p>
            No se almacenan, se excretan en orina. Requieren consumo regular.
          </p>
          <ul>
            <li>
              <strong>Vitamina C:</strong> Antioxidante, colágeno, absorción de hierro.
              Se destruye con calor y luz. Mejor fuentes frescas y crudas.
            </li>
            <li>
              <strong>B1 (Tiamina):</strong> Metabolismo energético, sistema nervioso.</li>
            <li>
              <strong>B6:</strong> Neurotransmisores, metabolismo de proteínas.</li>
            <li>
              <strong>B9 (Folato):</strong> División celular, ADN. Crítico en embarazo.</li>
            <li>
              <strong>B12:</strong> Nervios, glóbulos rojos. Solo en alimentos animales o suplementos.</li>
          </ul>
        </>
      ),
    },
    {
      title: 'Minerales: Los Conductores Eléctricos',
      icon: '⚡',
      content: (
        <>
          <h3>Macrominerales (necesarios en mayores cantidades)</h3>
          <ul>
            <li>
              <strong>Calcio:</strong> Huesos, músculos, señalización. Absorción mejorada con
              vitamina D y K2. Inhibida por oxalatos (espinacas) y fitatos.
            </li>
            <li>
              <strong>Magnesio:</strong> 300+ reacciones enzimáticas. Deficiencia muy común.
              Fuentes: verduras verdes, frutos secos, cacao puro.
            </li>
            <li>
              <strong>Potasio:</strong> Balance electrolítico, presión arterial. Plátanos,
              aguacates, patatas con piel.
            </li>
            <li>
              <strong>Sodio:</strong> Balance de fluidos. Generalmente consumimos demasiado
              de fuentes procesadas.
            </li>
          </ul>

          <h3>Microminerales (oligoelementos)</h3>
          <ul>
            <li>
              <strong>Hierro:</strong> Transporte de oxígeno. Hemo (carnes) vs no-hemo (vegetales).
              Vitamina C potencia absorción; taninos y calcio la reducen.
            </li>
            <li>
              <strong>Zinc:</strong> Inmunidad, cicatrización, hormonas. Fuentes: mariscos,
              carne roja, semillas de calabaza.
            </li>
            <li>
              <strong>Selenio:</strong> Antioxidante, tiroides. Nueces de Brasil (1-2 diarias
              cubren necesidades).
            </li>
            <li>
              <strong>Yodo:</strong> Función tiroidea. Sal yodada, algas, pescados de mar.
            </li>
          </ul>

          <div className={styles.warningBox}>
            <p>
              <strong>⚠️ Competición mineral:</strong> El hierro, zinc y calcio compiten
              por los mismos transportadores intestinales. Evita tomar suplementos de
              estos minerales juntos. Sepáralos al menos 2 horas.
            </p>
          </div>
        </>
      ),
    },
    {
      title: 'Antioxidantes y Fitonutrientes',
      icon: '🌈',
      content: (
        <>
          <p>
            Más allá de vitaminas y minerales, las plantas contienen miles de
            <strong> fitonutrientes</strong> que no son esenciales para sobrevivir
            pero optimizan la salud y previenen enfermedades.
          </p>

          <h3>Familias principales de fitonutrientes:</h3>

          <div className={styles.exampleGrid}>
            <div className={styles.exampleCard}>
              <span className={styles.exampleIcon}>🍅</span>
              <h4 className={styles.exampleTitle}>Carotenoides</h4>
              <p className={styles.exampleDesc}>
                Licopeno (tomates), betacaroteno (zanahorias), luteína (espinacas).
                Protegen ojos y piel.
              </p>
            </div>
            <div className={styles.exampleCard}>
              <span className={styles.exampleIcon}>🍇</span>
              <h4 className={styles.exampleTitle}>Polifenoles</h4>
              <p className={styles.exampleDesc}>
                Flavonoides (bayas, cacao), resveratrol (uvas), catequinas (té verde).
                Antiinflamatorios potentes.
              </p>
            </div>
            <div className={styles.exampleCard}>
              <span className={styles.exampleIcon}>🥦</span>
              <h4 className={styles.exampleTitle}>Glucosinolatos</h4>
              <p className={styles.exampleDesc}>
                Sulforafano (brócoli), indoles (coles). Activan enzimas de
                desintoxicación hepática.
              </p>
            </div>
            <div className={styles.exampleCard}>
              <span className={styles.exampleIcon}>🧄</span>
              <h4 className={styles.exampleTitle}>Compuestos Azufrados</h4>
              <p className={styles.exampleDesc}>
                Alicina (ajo), quercetina (cebolla). Antimicrobianos y
                cardioprotectores.
              </p>
            </div>
          </div>

          <div className={styles.highlightBox}>
            <p>
              <strong>🌈 Regla del arcoíris:</strong> Cada color representa diferentes
              fitonutrientes. Rojo = licopeno. Naranja = betacaroteno. Verde = clorofila
              y luteína. Morado = antocianinas. Blanco = alicina. Come el arcoíris
              diariamente.
            </p>
          </div>
        </>
      ),
    },
    {
      title: 'Factores que Afectan la Biodisponibilidad',
      icon: '🎯',
      content: (
        <>
          <h3>Potenciadores de absorción:</h3>
          <ul>
            <li><strong>Vitamina C + Hierro:</strong> Aumenta absorción 2-3x</li>
            <li><strong>Grasas + Vitaminas liposolubles:</strong> Esencial para absorción</li>
            <li><strong>Vitamina D + Calcio:</strong> Optimiza fijación ósea</li>
            <li><strong>Piperina (pimienta) + Curcumina:</strong> Aumenta absorción 2000%</li>
            <li><strong>Fermentación:</strong> Reduce antinutrientes, aumenta biodisponibilidad</li>
          </ul>

          <h3>Inhibidores de absorción:</h3>
          <ul>
            <li><strong>Fitatos</strong> (cereales, legumbres): Quelatan minerales. Reducir con remojo.</li>
            <li><strong>Oxalatos</strong> (espinacas, ruibarbo): Bloquean calcio y hierro.</li>
            <li><strong>Taninos</strong> (té, café, vino): Reducen absorción de hierro.</li>
            <li><strong>Calcio + Hierro juntos:</strong> Compiten por transportadores.</li>
            <li><strong>Procesamiento excesivo:</strong> Destruye nutrientes sensibles.</li>
          </ul>

          <h3>Estrategias prácticas:</h3>
          <ol>
            <li>Remoja legumbres y cereales integrales antes de cocinar</li>
            <li>Consume té y café lejos de comidas principales (1-2h)</li>
            <li>Añade limón o pimiento a platos con hierro vegetal</li>
            <li>Cocina tomates con aceite de oliva para aumentar licopeno disponible</li>
            <li>No sobrecalientes verduras (preserva vitamina C y enzimas)</li>
          </ol>

          <div className={styles.infoBox}>
            <p>
              <strong>💡 Recuerda:</strong> Un alimento con &quot;menos nutrientes&quot; pero alta
              biodisponibilidad puede ser más nutritivo que uno con &quot;más nutrientes&quot;
              pero mala absorción. La forma en que preparas y combinas importa tanto
              como lo que comes.
            </p>
          </div>
        </>
      ),
    },
  ];

  return <ChapterPage slug="micronutrientes" sections={sections} />;
}
