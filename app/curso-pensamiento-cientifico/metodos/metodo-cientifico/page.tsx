'use client';

import { LegalNotice } from '@/components';
import ChapterPage from '../../ChapterPage';
import styles from '../../CursoPensamientoCientifico.module.css';

export default function MetodoCientificoPage() {
  return (
    <ChapterPage chapterId="metodo-cientifico">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📖</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>El método científico constituye el fundamento de nuestro conocimiento sobre el mundo natural, proporcionando las herramientas sistemáticas para investigar, comprender y explicar los fenómenos que nos rodean. Desde las preguntas más simples hasta los descubrimientos más revolucionarios, este método nos guía en la búsqueda del conocimiento confiable.</p>
      </section>

        {/* Sección: Los Pilares del Método Científico: Observación, Hipótesis y Experimentación */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>📌</span>
            <h2 className={styles.sectionTitleText}>Los Pilares del Método Científico: Observación, Hipótesis y Experimentación</h2>
          </div>
          <p>El método científico se sustenta en tres pilares fundamentales que funcionan como un ciclo interconectado. La observación constituye el punto de partida, donde registramos cuidadosamente los fenómenos naturales sin prejuicios. Esta etapa requiere atención minuciosa y objetividad, documentando tanto lo esperado como lo inesperado.</p>
          <p>La hipótesis surge como una explicación tentativa del fenómeno observado. Debe ser específica, comprobable y formulada de manera que pueda ser sometida a prueba. Una buena hipótesis no solo explica las observaciones existentes, sino que también predice resultados futuros bajo condiciones específicas.</p>
          <p>La experimentación representa la fase de verificación, donde sometemos nuestra hipótesis a pruebas controladas. Los experimentos deben ser diseñados para aislar variables, controlar condiciones y permitir la reproducción por otros investigadores. Esta etapa determina si nuestra hipótesis se sostiene o debe ser modificada.</p>
          <p>El proceso es cíclico: los resultados experimentales generan nuevas observaciones, que pueden confirmar, refinar o refutar nuestras hipótesis iniciales, llevándonos a formular nuevas preguntas y continuar el ciclo de investigación.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> Cuando observas que las plantas de tu jardín en la zona sombreada crecen menos que las del sol, puedes hipotetizar que 'las plantas necesitan más luz solar para crecer mejor'. Para experimentar, plantas semillas idénticas en macetas: unas las colocas al sol y otras en sombra, manteniendo iguales el agua y fertilizante. Después de semanas, mides y comparas el crecimiento.</p>
          </div>
        </section>

        {/* Sección: El Gran Debate: Empirismo versus Racionalismo */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>🔍</span>
            <h2 className={styles.sectionTitleText}>El Gran Debate: Empirismo versus Racionalismo</h2>
          </div>
          <p>El empirismo y el racionalismo representan dos enfoques filosóficos fundamentales sobre cómo adquirimos conocimiento confiable. El empirismo, defendido por filósofos como John Locke y David Hume, sostiene que todo conocimiento válido proviene de la experiencia sensorial. Los empiristas argumentan que nacemos como una 'tabula rasa' y que únicamente a través de la observación, experimentación y evidencia empírica podemos construir conocimiento verdadero.</p>
          <p>El racionalismo, por el contrario, enfatiza el papel de la razón y el pensamiento lógico. Filósofos como René Descartes y Gottfried Leibniz argumentaban que ciertas verdades pueden conocerse independientemente de la experiencia, a través del razonamiento puro. Los racionalistas confían en la capacidad de la mente humana para deducir principios universales mediante la lógica.</p>
          <p>En la ciencia moderna, estos enfoques no son mutuamente excluyentes sino complementarios. La observación empírica proporciona los datos, pero la razón es esencial para interpretarlos, formular teorías y diseñar experimentos. Las matemáticas, producto del pensamiento racional, son fundamentales para expresar leyes científicas, mientras que la experimentación, de naturaleza empírica, valida o refuta nuestras teorías racionales.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> En medicina tradicional latinoamericana, el conocimiento empírico sobre propiedades curativas de plantas como la manzanilla se transmitió por generaciones a través de la observación. Sin embargo, la ciencia moderna aplica el racionalismo para formular hipótesis sobre los componentes químicos responsables de estos efectos y diseñar estudios controlados que confirmen o refuten estas propiedades medicinales.</p>
          </div>
        </section>

        {/* Sección: La Revolución de Popper: La Falsabilidad como Criterio de Cientificidad */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>💡</span>
            <h2 className={styles.sectionTitleText}>La Revolución de Popper: La Falsabilidad como Criterio de Cientificidad</h2>
          </div>
          <p>Karl Popper transformó nuestra comprensión del método científico al proponer la falsabilidad como criterio distintivo de las teorías científicas genuinas. Según Popper, una teoría es científica no cuando puede ser verificada, sino cuando puede ser potencialmente refutada por la evidencia empírica. Esta perspectiva revolucionaria cambió el enfoque de buscar confirmaciones a buscar posibles refutaciones.</p>
          <p>La falsabilidad implica que las teorías científicas deben hacer predicciones específicas y arriesgadas que, de ser incorrectas, demostrarían la falsedad de la teoría. Popper argumentaba que nunca podemos probar definitivamente que una teoría es verdadera, pero sí podemos demostrar que es falsa. Las teorías que sobreviven a múltiples intentos de refutación son consideradas más robustas, aunque siempre permanecen provisionales.</p>
          <p>Este criterio permite distinguir la ciencia de la pseudociencia. Las afirmaciones no falsables, aunque puedan parecer profundas, no pueden considerarse científicas porque no hay manera de someterlas a prueba empírica. Popper criticaba teorías como el psicoanálisis freudiano por ser formuladas de manera tan vaga que cualquier evidencia podía interpretarse como confirmación.</p>
          <p>La falsabilidad no significa que las teorías científicas sean débiles, sino que son lo suficientemente precisas como para arriesgarse a la refutación, lo que paradójicamente las hace más fuertes y confiables.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> La teoría de que 'todos los cisnes son blancos' es falsable porque basta encontrar un cisne negro para refutarla (como efectivamente ocurrió en Australia). En contraste, afirmar que 'las personas actúan por energías cósmicas' no es falsable porque no especifica qué observación podría demostrar que es incorrecta, por lo tanto, no sería una afirmación científica según los criterios de Popper.</p>
          </div>
        </section>

      {/* Ideas Clave */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🎯</span>
          <h2 className={styles.sectionTitleText}>Ideas Clave</h2>
        </div>
        <ul>
            <li>El método científico se basa en un ciclo de observación, formulación de hipótesis y experimentación controlada</li>
            <li>El empirismo y racionalismo son enfoques complementarios: la experiencia proporciona datos y la razón los interpreta</li>
            <li>La falsabilidad de Popper establece que las teorías científicas deben poder ser potencialmente refutadas por evidencia empírica</li>
            <li>Las teorías científicas son provisionales y se fortalecen al sobrevivir intentos de refutación, no por acumular confirmaciones</li>
        </ul>
      </section>

      {/* Preguntas de Reflexión */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🤔</span>
          <h2 className={styles.sectionTitleText}>Preguntas de Reflexión</h2>
        </div>
        <ol>
            <li>¿Cómo aplicarías los pasos del método científico para investigar un problema cotidiano en tu comunidad, como la efectividad de remedios caseros tradicionales?</li>
            <li>¿Puedes identificar situaciones donde predomina el enfoque empírico versus el racional en tu campo de estudio o trabajo?</li>
            <li>¿Qué diferencia existe entre una creencia personal no falsable y una hipótesis científica falsable? Proporciona ejemplos de ambas.</li>
        </ol>
      </section>

      {/* Dato Curioso */}
      <div className={styles.infoBox}>
        <p><strong>💡 Dato Curioso:</strong> Isaac Newton desarrolló sus leyes del movimiento durante la pandemia de peste bubónica de 1665-1666, cuando Cambridge cerró y él regresó a su granja familiar. En solo 18 meses de aislamiento, revolucionó la física, inventó el cálculo y desarrolló su teoría de la gravitación universal, demostrando que a veces las mejores condiciones para la ciencia surgen en las circunstancias más inesperadas.</p>
      </div>
    </ChapterPage>
  );
}
