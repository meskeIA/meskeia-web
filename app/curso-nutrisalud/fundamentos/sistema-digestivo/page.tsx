'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../CursoNutrisalud.module.css';

export default function SistemaDigestivoPage() {
  const sections = [
    {
      title: 'Tu Sistema Digestivo: Un Laboratorio Sofisticado',
      icon: '🔬',
      content: (
        <>
          <p>
            Tu sistema digestivo no es simplemente un tubo por donde pasa la comida.
            Es un <strong>laboratorio bioquímico de 9 metros</strong> que transforma
            alimentos complejos en moléculas que tus células pueden usar: glucosa,
            aminoácidos, ácidos grasos, vitaminas y minerales.
          </p>
          <p>
            Entender cómo funciona este proceso te permite optimizar la nutrición
            de formas que van más allá de simplemente &quot;comer bien&quot;. El momento
            en que comes, cómo masticas, qué combinas y el estado de tu microbiota
            determinan cuánto absorbes realmente.
          </p>

          <div className={styles.highlightBox}>
            <p>
              <strong>🧬 Dato fascinante:</strong> Tu intestino tiene más neuronas que
              la médula espinal (500 millones), por eso se le llama &quot;el segundo cerebro&quot;.
              Produce el 95% de la serotonina de tu cuerpo, el neurotransmisor del bienestar.
            </p>
          </div>
        </>
      ),
    },
    {
      title: 'El Viaje de los Alimentos',
      icon: '🛤️',
      content: (
        <>
          <h3>1. Boca (1-2 minutos)</h3>
          <ul>
            <li><strong>Masticación:</strong> Rompe alimentos en partículas más pequeñas</li>
            <li><strong>Amilasa salival:</strong> Comienza digestión de carbohidratos</li>
            <li><strong>Lipasa lingual:</strong> Inicia digestión de grasas</li>
          </ul>

          <div className={styles.infoBox}>
            <p>
              <strong>💡 Tip práctico:</strong> Masticar cada bocado 20-30 veces aumenta
              la superficie de contacto con enzimas y mejora la señalización de saciedad
              al cerebro. Comer despacio = absorber mejor y comer menos.
            </p>
          </div>

          <h3>2. Estómago (2-4 horas)</h3>
          <ul>
            <li><strong>Ácido clorhídrico (pH 1.5-3.5):</strong> Desnaturaliza proteínas, mata patógenos</li>
            <li><strong>Pepsina:</strong> Rompe proteínas en péptidos</li>
            <li><strong>Lipasa gástrica:</strong> Continúa digestión de grasas</li>
            <li><strong>Factor intrínseco:</strong> Necesario para absorber B12</li>
          </ul>

          <h3>3. Intestino Delgado (3-5 horas)</h3>
          <p>
            Aquí ocurre el 90% de la absorción de nutrientes. Mide unos 6 metros
            pero su superficie interna, gracias a las vellosidades, equivale a una
            cancha de tenis.
          </p>
          <ul>
            <li><strong>Duodeno:</strong> Recibe bilis y enzimas pancreáticas</li>
            <li><strong>Yeyuno:</strong> Absorción principal de nutrientes</li>
            <li><strong>Íleon:</strong> Absorbe B12, sales biliares, nutrientes restantes</li>
          </ul>

          <h3>4. Intestino Grueso (12-36 horas)</h3>
          <ul>
            <li><strong>Fermentación microbiana:</strong> Fibra → ácidos grasos de cadena corta</li>
            <li><strong>Absorción de agua:</strong> Compacta residuos</li>
            <li><strong>Producción de vitaminas:</strong> K2, algunas vitaminas B</li>
          </ul>
        </>
      ),
    },
    {
      title: 'Enzimas Digestivas: Los Trabajadores Invisibles',
      icon: '⚙️',
      content: (
        <>
          <p>
            Las enzimas son proteínas especializadas que aceleran reacciones químicas.
            Sin ellas, digerir una comida tomaría días en lugar de horas.
          </p>

          <table className={styles.comparisonTable}>
            <thead>
              <tr>
                <th>Enzima</th>
                <th>Origen</th>
                <th>Sustrato</th>
                <th>Productos</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Amilasa</td>
                <td>Saliva, páncreas</td>
                <td>Almidones</td>
                <td>Maltosa, glucosa</td>
              </tr>
              <tr>
                <td>Proteasa/Pepsina</td>
                <td>Estómago, páncreas</td>
                <td>Proteínas</td>
                <td>Péptidos, aminoácidos</td>
              </tr>
              <tr>
                <td>Lipasa</td>
                <td>Páncreas, estómago</td>
                <td>Grasas</td>
                <td>Ácidos grasos, glicerol</td>
              </tr>
              <tr>
                <td>Lactasa</td>
                <td>Intestino delgado</td>
                <td>Lactosa</td>
                <td>Glucosa, galactosa</td>
              </tr>
            </tbody>
          </table>

          <h3>Factores que afectan la actividad enzimática:</h3>
          <ul>
            <li><strong>pH:</strong> Cada enzima tiene un pH óptimo (pepsina: ácido, tripsina: neutro)</li>
            <li><strong>Temperatura:</strong> 37°C es óptimo; demasiado calor las destruye</li>
            <li><strong>Cofactores:</strong> Muchas necesitan zinc, magnesio u otras vitaminas</li>
            <li><strong>Estrés:</strong> Reduce producción enzimática y ácido gástrico</li>
          </ul>

          <div className={styles.warningBox}>
            <p>
              <strong>⚠️ Sobre los antiácidos:</strong> Reducir el ácido estomacal puede
              parecer alivio, pero impide la digestión de proteínas y la absorción de
              minerales (hierro, calcio, B12). Usa solo cuando sea médicamente necesario.
            </p>
          </div>
        </>
      ),
    },
    {
      title: 'El pH Digestivo y Su Importancia',
      icon: '📊',
      content: (
        <>
          <p>
            Cada sección del tracto digestivo tiene un pH específico optimizado
            para diferentes funciones. Alterar este equilibrio afecta la digestión.
          </p>

          <div className={styles.exampleGrid}>
            <div className={styles.exampleCard}>
              <span className={styles.exampleIcon}>👅</span>
              <h4 className={styles.exampleTitle}>Boca</h4>
              <p className={styles.exampleDesc}>
                pH 6.5-7.5 (neutro)<br />
                Óptimo para amilasa salival
              </p>
            </div>
            <div className={styles.exampleCard}>
              <span className={styles.exampleIcon}>🫃</span>
              <h4 className={styles.exampleTitle}>Estómago</h4>
              <p className={styles.exampleDesc}>
                pH 1.5-3.5 (muy ácido)<br />
                Activa pepsina, mata patógenos
              </p>
            </div>
            <div className={styles.exampleCard}>
              <span className={styles.exampleIcon}>🔄</span>
              <h4 className={styles.exampleTitle}>Duodeno</h4>
              <p className={styles.exampleDesc}>
                pH 6-7 (neutralizado)<br />
                Bilis y enzimas pancreáticas
              </p>
            </div>
            <div className={styles.exampleCard}>
              <span className={styles.exampleIcon}>🦠</span>
              <h4 className={styles.exampleTitle}>Colon</h4>
              <p className={styles.exampleDesc}>
                pH 5.5-7 (ligeramente ácido)<br />
                Fermentación bacteriana
              </p>
            </div>
          </div>

          <h3>Señales de pH estomacal bajo (hipoclorhidria):</h3>
          <ul>
            <li>Hinchazón y gases después de comer proteínas</li>
            <li>Sensación de pesadez prolongada</li>
            <li>Eructos frecuentes</li>
            <li>Reflujo (paradójicamente, a veces por poco ácido)</li>
            <li>Uñas frágiles, cabello débil (mala absorción de minerales)</li>
          </ul>

          <div className={styles.infoBox}>
            <p>
              <strong>💡 Apoyo natural:</strong> Un poco de vinagre de manzana (1 cucharada
              diluida en agua) antes de las comidas puede ayudar a acidificar el estómago.
              El jengibre y las hierbas amargas también estimulan la producción de jugos gástricos.
            </p>
          </div>
        </>
      ),
    },
    {
      title: 'Optimizando Tu Digestión',
      icon: '🎯',
      content: (
        <>
          <h3>Antes de comer:</h3>
          <ul>
            <li>Relájate 5 minutos antes de la comida (activa el sistema parasimpático)</li>
            <li>Evita beber grandes cantidades de agua (diluye enzimas)</li>
            <li>Considera hierbas amargas o vinagre para estimular jugos gástricos</li>
          </ul>

          <h3>Durante la comida:</h3>
          <ul>
            <li>Mastica completamente cada bocado (20-30 veces)</li>
            <li>Come sin distracciones (mejora las señales intestino-cerebro)</li>
            <li>No comas estresado o apurado</li>
            <li>Evita líquidos fríos con las comidas (pueden frenar enzimas)</li>
          </ul>

          <h3>Combinación de alimentos (reglas básicas):</h3>
          <ul>
            <li>Frutas: mejor solas o antes de las comidas (se digieren rápido)</li>
            <li>Proteínas + vegetales: excelente combinación</li>
            <li>Almidones + vegetales: buena combinación</li>
            <li>Proteínas + almidones: digestión más lenta (combinar con moderación)</li>
          </ul>

          <div className={styles.highlightBox}>
            <p>
              <strong>🍽️ Orden de consumo:</strong> Estudios recientes sugieren que comer
              vegetales y proteínas ANTES de los carbohidratos en la misma comida reduce
              significativamente el pico de glucosa postprandial. El orden importa.
            </p>
          </div>

          <h3>Después de comer:</h3>
          <ul>
            <li>Un paseo suave mejora la digestión y el control de glucosa</li>
            <li>Evita acostarte inmediatamente (espera 2-3 horas)</li>
            <li>No hagas ejercicio intenso (sangre va a digestión, no a músculos)</li>
          </ul>

          <div className={styles.infoBox}>
            <p>
              <strong>💡 El tiempo de tránsito ideal:</strong> Desde que comes hasta que
              eliminas debería ser 24-48 horas. Más lento indica estreñimiento; más rápido
              puede significar malabsorción. La fibra, hidratación y movimiento lo regulan.
            </p>
          </div>
        </>
      ),
    },
  ];

  return <ChapterPage slug="sistema-digestivo" sections={sections} />;
}
