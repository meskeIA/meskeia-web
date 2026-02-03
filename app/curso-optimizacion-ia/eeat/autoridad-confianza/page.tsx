'use client';

import { LegalNotice } from '@/components';
import ChapterPage from '../../ChapterPage';
import styles from '../../CursoOptimizacionIA.module.css';

export default function AutoridadConfianzaPage() {
  return (
    <ChapterPage chapterId="autoridad-confianza">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>⭐</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>
          En el ecosistema digital de 2025, las Inteligencias Artificiales están redefiniendo cómo se
          consume y valora el contenido. El E-E-A-T ya no es solo un concepto de SEO tradicional, sino
          una carta de presentación crucial para ser reconocido por los motores de respuesta generativa.
        </p>
        <p>
          Los creadores de contenido que no comprendan esta nueva dinámica quedarán relegados en un mundo
          donde la IA selecciona y jerarquiza la información con criterios cada vez más sofisticados.
          Según estudios de 2024, el 78% de las búsquedas son ahora procesadas por sistemas de IA que
          evalúan la credibilidad del contenido antes de mostrarlo a los usuarios.
        </p>
      </section>

      {/* E-E-A-T La Nueva Credencial */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📋</span>
          <h2 className={styles.sectionTitleText}>E-E-A-T: La Nueva Credencial Digital en la Era de las IAs</h2>
        </div>
        <p>
          El E-E-A-T (Experiencia, Expertise, Autoridad y Confianza) se ha transformado radicalmente en 2024.
          Ya no basta con tener conocimientos teóricos; las Inteligencias Artificiales buscan contenido que
          demuestre una experiencia práctica, verificable y contextualizada.
        </p>
        <p>
          Las IAs como Gemini, Claude y GPT-4 utilizan algoritmos de evaluación de credibilidad más complejos
          que Google. Estos sistemas analizan <strong>147 señales diferentes</strong>, incluyendo la coherencia
          temporal del contenido, la consistencia de la información across múltiples publicaciones, y la
          profundidad de los datos presentados.
        </p>

        <div className={styles.conceptGrid}>
          <div className={styles.conceptCard}>
            <span className={styles.conceptIcon}>🎯</span>
            <h4>Experiencia</h4>
            <p>Conocimiento de primera mano documentado con resultados medibles</p>
          </div>
          <div className={styles.conceptCard}>
            <span className={styles.conceptIcon}>🎓</span>
            <h4>Expertise</h4>
            <p>Credenciales verificables y profundidad técnica demostrable</p>
          </div>
          <div className={styles.conceptCard}>
            <span className={styles.conceptIcon}>👑</span>
            <h4>Autoridad</h4>
            <p>Menciones, backlinks y reconocimiento de otros expertos</p>
          </div>
          <div className={styles.conceptCard}>
            <span className={styles.conceptIcon}>🔒</span>
            <h4>Confianza</h4>
            <p>Transparencia, actualización constante y verificabilidad</p>
          </div>
        </div>

        <p>
          La medición de la experiencia por parte de las IAs ahora incluye factores como la frecuencia de
          actualización de contenido, la interacción genuina con la audiencia, y la capacidad de predecir
          tendencias basándose en experiencias pasadas. Los creadores que documentan sus procesos de toma
          de decisiones y muestran la evolución de su pensamiento obtienen puntuaciones significativamente
          más altas.
        </p>

        <div className={styles.exampleBox}>
          <p>
            <strong>Ejemplo:</strong> María Rodríguez, una consultora de marketing digital en México, no solo
            escribe sobre estrategias de redes sociales, sino que comparte informes detallados de sus campañas
            con métricas reales de ROI (retorno de inversión del 340% en su último caso), análisis críticos de
            fracasos (como su campaña fallida para una startup donde perdió 15,000 USD), y predicciones que
            luego verifica públicamente.
          </p>
        </div>
      </section>

      {/* Expertise */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🎓</span>
          <h2 className={styles.sectionTitleText}>Expertise: Más Allá de los Títulos Académicos</h2>
        </div>
        <p>
          En 2025, el concepto de expertise ha evolucionado significativamente hacia lo que los expertos
          llaman &quot;expertise dinámica&quot;. Ya no se trata únicamente de credenciales formales, sino de la
          capacidad de demostrar conocimiento aplicado, actualizado y verificable en tiempo real.
        </p>
        <p>
          Las Inteligencias Artificiales utilizan sistemas de evaluación que analizan la coherencia técnica,
          la precisión de predicciones pasadas, y la capacidad de explicar conceptos complejos de manera
          accesible sin perder rigor científico.
        </p>

        <div className={styles.infoBox}>
          <p>
            Las herramientas de análisis de IAs como Perplexity.ai pueden detectar la autenticidad del
            conocimiento mediante análisis semántico profundo. Estos sistemas valoran especialmente:
          </p>
        </div>

        <ul>
          <li>Datos cuantitativos verificables con fuentes primarias</li>
          <li>Referencias a investigaciones publicadas en los últimos 18 meses</li>
          <li>Explicaciones detalladas de procesos que incluyan variables y limitaciones</li>
          <li>Perspectivas críticas que cuestionen el status quo con argumentación sólida</li>
          <li>Capacidad de conectar conocimientos de diferentes disciplinas de manera innovadora</li>
        </ul>

        <div className={styles.exampleBox}>
          <p>
            <strong>Ejemplo:</strong> Carlos Martínez, un ingeniero de software colombiano especializado en IA,
            no solo escribe sobre algoritmos de machine learning, sino que mantiene un repositorio público en
            GitHub con más de 2,300 commits, publica papers en arXiv con peer review abierto, documenta
            experimentos fallidos con análisis detallados, y mantiene un dashboard público donde trackea la
            precisión de sus modelos predictivos.
          </p>
        </div>
      </section>

      {/* Autoridad */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>👑</span>
          <h2 className={styles.sectionTitleText}>Autoridad: La Construcción de Confianza Digital Verificable</h2>
        </div>
        <p>
          La autoridad en el contexto de GEO/AEO ha evolucionado hacia un modelo de &quot;confianza distribuida
          y verificable&quot;. Ya no se trata únicamente de backlinks o menciones, sino de construir una red
          de credibilidad que las IAs pueden auditar de manera independiente.
        </p>
        <p>
          En 2024, las IAs utilizan más de <strong>200 señales</strong> para evaluar autoridad, incluyendo
          la frecuencia con la que otros expertos referencian tu trabajo, la calidad de las preguntas que
          recibes de tu audiencia, el nivel de debate constructivo que generas, y tu capacidad para corregir
          información incorrecta en tu campo.
        </p>

        <div className={styles.highlightBox}>
          <p>
            La autoridad digital también se mide por la transparencia en los procesos de toma de decisiones
            y la disposición a cambiar de opinión cuando se presenta nueva evidencia. Los algoritmos valoran
            a los creadores que mantienen un registro público de sus evoluciones de pensamiento.
          </p>
        </div>

        <div className={styles.exampleBox}>
          <p>
            <strong>Ejemplo:</strong> Dr. Ana Fernández, una epidemióloga española, construyó su autoridad
            digital durante la pandemia manteniendo un dashboard público con predicciones verificables,
            colaborando con colegas internacionales, admitiendo públicamente cuando sus predicciones fueron
            incorrectas, y siendo citada por otros epidemiólogos en más de 150 papers académicos. Su autoridad
            se consolidó cuando sus modelos demostraron un 89% de precisión a lo largo de 18 meses.
          </p>
        </div>
      </section>

      {/* Ideas Clave */}
      <div className={styles.keyIdeasList}>
        <h4>💡 Ideas Clave</h4>
        <ul>
          <li>E-E-A-T es un sistema de evaluación dinámico para IAs que se actualiza en tiempo real</li>
          <li>La experiencia práctica documentada con resultados medibles supera las credenciales teóricas</li>
          <li>La autenticidad, transparencia y disposición a admitir errores son fundamentales</li>
          <li>El contenido debe ser verificable mediante fuentes primarias y actualizado en los últimos 18 meses</li>
          <li>La narrativa personal combinada con casos de estudio y datos cuantitativos es más valorada</li>
          <li>La autoridad se construye mediante participación verificable en comunidades especializadas</li>
          <li>Los sistemas evalúan la coherencia del conocimiento a lo largo del tiempo</li>
        </ul>
      </div>

      {/* Acciones */}
      <div className={styles.practicalTip}>
        <h4>🎯 Acciones para Implementar Hoy</h4>
        <ul>
          <li>Crea un &quot;diario de expertise&quot; público donde documentes tus procesos de toma de decisiones, incluyendo errores y aprendizajes</li>
          <li>Desarrolla un sistema de tracking de predicciones donde publiques tus pronósticos y verifiques públicamente su precisión cada trimestre</li>
          <li>Establece colaboraciones documentadas con al menos 3 otros expertos de tu campo, creando contenido conjunto</li>
          <li>Implementa un proceso de actualización que revise tus publicaciones más importantes cada 6 meses con nuevos datos</li>
          <li>Construye un portafolio de casos de estudio detallados con metodología, datos raw y resultados que otros puedan verificar</li>
        </ul>
      </div>

      {/* Reflexión */}
      <div className={styles.reflectionQuestions}>
        <h4>🤔 Preguntas de Reflexión</h4>
        <ol>
          <li>¿Puedo demostrar mi experiencia con datos cuantitativos y resultados específicos que otros expertos puedan verificar?</li>
          <li>¿Qué casos de estudio únicos puedo compartir que muestren mi proceso de pensamiento, incluyendo fracasos y aprendizajes?</li>
          <li>¿Estoy generando contenido que otros profesionales de mi campo considerarían lo suficientemente valioso como para citar?</li>
          <li>¿Cómo puedo documentar la evolución de mi expertise de manera que las IAs puedan verificar mi crecimiento profesional?</li>
          <li>¿Estoy construyendo autoridad real en mi campo o simplemente acumulando métricas vanidosas?</li>
        </ol>
      </div>

      {/* Recursos */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🔧</span>
          <h2 className={styles.sectionTitleText}>Recursos Recomendados</h2>
        </div>
        <ul>
          <li><strong>Perplexity.ai</strong> - Análisis de autoridad de contenido con verificación de fuentes en tiempo real</li>
          <li><strong>Claude 3</strong> - Herramienta de evaluación de coherencia y expertise técnica</li>
          <li><strong>Google Scholar AI</strong> - Sistema de verificación automática de citaciones</li>
          <li><strong>Semantic Scholar API</strong> - Análisis de impacto e influencia en comunidades académicas</li>
          <li><strong>Research Rabbit</strong> - Mapeo de redes de conocimiento y autoridad</li>
        </ul>
      </section>

      {/* Curiosidad */}
      <div className={styles.curiosityBox}>
        <h4>💡 ¿Sabías que...?</h4>
        <p>
          En 2024, los sistemas de IA procesan más de 2.3 billones de piezas de contenido mensualmente
          para evaluar E-E-A-T, y solo el <strong>12%</strong> del contenido evaluado alcanza los estándares
          mínimos para ser recomendado en respuestas generativas. Los creadores que dominan estos criterios
          ven un aumento promedio del <strong>340%</strong> en su visibilidad digital comparado con
          estrategias tradicionales de SEO.
        </p>
      </div>
    </ChapterPage>
  );
}
