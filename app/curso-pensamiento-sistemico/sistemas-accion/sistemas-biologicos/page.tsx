'use client';

import { LegalNotice } from '@/components';
import ChapterPage from '../../ChapterPage';
import styles from '../../CursoPensamientoSistemico.module.css';

export default function SistemasBiologicosPage() {
  return (
    <ChapterPage chapterId="sistemas-biologicos">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🎯</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>
          Imagina que pudieras observar tu cuerpo con la misma perspectiva que un ingeniero de sistemas analiza Netflix: no como componentes aislados, sino como una red de flujos de información, retroalimentación constante y adaptación en tiempo real. Mientras escribes estas líneas, 37 billones de células coordinan sus actividades sin un director ejecutivo, tu microbioma procesa información química que influirá en tu próxima decisión, y tu sistema nervioso recalibra constantemente su percepción del mundo. Esta no es biología de libro de texto: es la nueva frontera del pensamiento sistémico aplicado, donde cada descubrimiento redefine lo que significa estar vivo, ser resiliente y evolucionar en un mundo de cambio exponencial.
        </p>
      </section>

      {/* Tu Cuerpo Como Startup Biotecnológica: Iteración, Pivote y Escala */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🔄</span>
          <h2 className={styles.sectionTitleText}>Tu Cuerpo Como Startup Biotecnológica: Iteración, Pivote y Escala</h2>
        </div>
        <p>
          Olvida la metáfora del cuerpo como máquina. Tu organismo opera más como una startup tecnológica disruptiva: constantemente iterando, pivoteando estrategias y escalando soluciones exitosas. Considera tu sistema inmunológico como el departamento de I+D más sofisticado del planeta. Cada vez que te expones a un patógeno, tus células B no solo &#39;recuerdan&#39; la amenaza—literalmente reprograman su ADN mediante hipermutación somática, generando hasta 10 elevado a la 11 variantes de anticuerpos diferentes en cuestión de días. Es como si tu cuerpo ejecutara millones de experimentos A/B testing simultáneamente para optimizar su respuesta defensiva.</p>
        <p></p>
        <p>En 2022, el laboratorio de sistemas inmunológicos de la Universidad Pompeu Fabra en Barcelona descubrió algo revolucionario: las células T de memoria no son solo archivos estáticos de experiencias pasadas. Actúan como &#39;consultores sistémicos&#39; internos, compartiendo información contextual que influye en respuestas completamente no relacionadas. Una infección respiratoria leve puede optimizar tu respuesta a futuras alergias alimentarias—tu cuerpo está constantemente cross-training entre sistemas aparentemente inconexos.</p>
        <p></p>
        <p>Tu microbioma intestinal funciona como un consejo asesor de 1000 especies diferentes, donde cada bacteria &#39;vota&#39; químicamente sobre decisiones que van desde tu apetito hasta tu estado de ánimo. Investigaciones recientes del Hospital Clínic de Barcelona muestran que ciertos metabolitos bacterianos pueden predecir respuestas a antidepresivos con 85% de precisión—antes incluso de que el paciente comience el tratamiento. Tu intestino no solo procesa comida; procesa información emocional y la convierte en señales que reconfiguran tu percepción neurológica de la realidad.</p>
        <p></p>
        <p>Lo más fascinante es el concepto de &#39;redundancia inteligente&#39;: tu cuerpo mantiene múltiples sistemas de respaldo que no son copias exactas, sino variaciones creativas. Si tu hígado sufre daño, el tejido renal puede asumir parcialmente funciones de desintoxicación mediante vías metabólicas alternativas que normalmente permanecen dormidas. Esta flexibilidad adaptativa no es casualidad—es arquitectura sistémica sofisticada que permite que la falla de un componente fortalezca el conjunto.
        </p>
      </section>

      {/* Ideas Clave */}
      <div className={styles.keyIdeasList}>
        <h4>💡 Ideas Clave</h4>
        <ul>
          <li>Los sistemas biológicos optimizan continuamente mediante experimentación masiva paralela, no control centralizado</li>
          <li>La memoria sistémica es contextual y cross-funcional: una experiencia inmunológica reprograma respuestas emocionales</li>
          <li>La redundancia inteligente crea resiliencia mediante diversidad funcional, no duplicación mecánica</li>
          <li>Los límites entre sistemas son interfaces de intercambio de información, no barreras físicas</li>
          <li>La emergencia sistémica genera capacidades que ningún componente individual posee</li>
        </ul>
      </div>

      {/* Acciones Prácticas */}
      <div className={styles.practicalTip}>
        <h4>🎯 Acciones para Implementar</h4>
        <ul>
          <li>Experimenta el &#39;mapeo de flujos personales&#39;: durante 3 días, registra en una app como Notion o Obsidian cómo tus patrones de sueño → elecciones alimentarias → energía cognitiva → decisiones profesionales se influencian mutuamente. Busca bucles de retroalimentación no obvios</li>
          <li>Implementa &#39;diversidad microbiana intencional&#39;: introduce un nuevo alimento fermentado cada semana (kéfir, kimchi, miso) y documenta cambios en digestión, estado de ánimo y claridad mental usando una escala del 1-10</li>
          <li>Practica &#39;redundancia adaptativa&#39;: identifica 3 habilidades profesionales que dependes excesivamente y desarrolla vías alternativas para lograr los mismos resultados (ej: si dependes de email, desarrolla competencias en video-llamadas espontáneas y mensajería directa)</li>
        </ul>
      </div>

      {/* Preguntas de Reflexión */}
      <div className={styles.reflectionQuestions}>
        <h4>🤔 Preguntas de Reflexión</h4>
        <ol>
          <li>Si tu cuerpo fuera una organización, ¿sería más parecida a una corporación jerárquica tradicional o a una red descentralizada de equipos auto-gestionados? ¿Qué te dice esto sobre cómo tomas decisiones?</li>
          <li>¿Cuáles son las &#39;funciones dormidas&#39; en tu vida personal y profesional que podrías activar ante una crisis, similar a como tu cuerpo activa vías metabólicas alternativas?</li>
          <li>¿Cómo podrías diseñar tu rutina diaria para maximizar los bucles de retroalimentación positiva entre diferentes &#39;sistemas&#39; de tu vida (salud, trabajo, relaciones, aprendizaje)?</li>
        </ol>
      </div>

      {/* Curiosidad */}
      <div className={styles.curiosityBox}>
        <h4>💡 ¿Sabías que...?</h4>
        <p>
          En enero 2024, investigadores del Centro Nacional de Investigaciones Cardiovasculares (CNIC) en Madrid descubrieron que las células del corazón &#39;recuerdan&#39; patrones de ejercicio mediante modificaciones epigenéticas que persisten hasta 8 semanas después del entrenamiento, sugiriendo que nuestros órganos mantienen &#39;memorias de rendimiento&#39; que se activan automáticamente ante demandas similares futuras—como si tu cuerpo fuera un algoritmo de machine learning que optimiza silenciosamente basado en datos históricos.
        </p>
      </div>
    </ChapterPage>
  );
}
