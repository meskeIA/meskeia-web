'use client';

import { LegalNotice } from '@/components';
import ChapterPage from '../../ChapterPage';
import styles from '../../CursoMarketingDigital.module.css';

export default function MarcaPersonalPage() {
  return (
    <ChapterPage chapterId="marca-personal">
      <div className={styles.chapterContent}>
        {/* Introducción */}
        <section className={styles.introSection}>
          <p className={styles.introText}>
            En 2025, tu marca personal ya no es opcional: es tu principal diferenciador profesional. Mientras la IA automatiza tareas, los profesionales que destacan son aquellos que construyen autoridad, generan confianza y crean conexiones auténticas. Tu marca personal es lo que te permite pasar de ser 'uno más' a convertirte en 'el profesional' al que recurren cuando necesitan expertise real. En un mercado saturado de perfiles similares, una marca personal estratégica no solo multiplica tus oportunidades, sino que te posiciona como un referente que atrae proyectos, clientes y colaboraciones de alto valor de manera natural.
          </p>
        </section>

        {/* Secciones de contenido */}

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>El nuevo paradigma: De CV a ecosistema digital personal</h2>
          <div className={styles.sectionContent}>
            <p>La marca personal en 2025 trasciende el concepto tradicional de 'networking'. Es un ecosistema digital que demuestra tu valor antes de cualquier conversación. Los datos son contundentes: profesionales con marca personal sólida reciben 5 veces más propuestas laborales y negocian salarios hasta un 40% superiores. No se trata de popularidad, sino de posicionarte como la solución a problemas específicos. Tu marca personal debe responder a una pregunta clave: '¿Por qué deberían elegirte a ti y no a tu competencia?' La diferencia está en demostrar resultados tangibles, compartir conocimiento valioso y mantener una presencia consistente y profesional.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Laura Fernández, especialista en automatización de procesos en Madrid, transformó su carrera al compartir casos reales de optimización. Pasó de recibir 2-3 propuestas anuales a gestionar una lista de espera de clientes tras posicionarse como referente en LinkedIn y su blog personal.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>LinkedIn 2025: Tu plataforma de autoridad y generación de leads</h2>
          <div className={styles.sectionContent}>
            <p>LinkedIn ha evolucionado hacia un hub de conocimiento donde se toman decisiones de negocio. En 2025, un perfil optimizado incluye: headline orientado a resultados (no solo tu puesto), extracto que posiciona tu propuesta de valor, experiencias con métricas cuantificables y actividad constante que demuestre expertise. El algoritmo prioriza contenido que genera conversación genuina. Utiliza el Analizador SEO de meskeIA para optimizar tus publicaciones con palabras clave relevantes. La clave está en ser útil antes que promocional: comparte insights, analiza tendencias y ofrece perspectivas únicas de tu sector.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Javier Ruiz, consultor en transformación digital de Sevilla, genera más de 80 leads cualificados mensualmente mediante contenido técnico en LinkedIn. Su estrategia: publicar análisis semanales de casos reales con datos y metodologías, posicionándose como el consultor de referencia para pymes tecnológicas.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Content strategy que convierte audiencia en oportunidades</h2>
          <div className={styles.sectionContent}>
            <p>El contenido efectivo en 2025 combina expertise técnico con narrativa personal. Funciona la regla 70-20-10: 70% contenido educativo que resuelve problemas, 20% contenido inspiracional que humaniza tu marca, 10% promocional de tus servicios o logros. Diversifica formatos: posts de LinkedIn con insights, vídeos cortos explicando procesos, carruseles con datos, artículos profundos sobre tendencias. Usa herramientas como el Generador de Carruseles de meskeIA para crear contenido visual impactante. El objetivo es que tu audiencia asocie tu nombre con soluciones concretas en tu área de especialización.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Carmen López, experta en marketing para e-commerce, publica semanalmente análisis de campañas reales (con autorización) mostrando métricas, estrategias y resultados. Sus posts generan +15,000 visualizaciones y han derivado en colaboraciones con marcas como El Corte Inglés y Mango.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Del anonimato al thought leadership: Estrategia de posicionamiento</h2>
          <div className={styles.sectionContent}>
            <p>Convertirse en referente requiere un enfoque sistemático. Define tu nicho específico (no seas generalista), desarrolla un punto de vista diferenciador, documenta tu metodología de trabajo, participa en conversaciones relevantes y mantén presencia en eventos del sector. El thought leadership se construye siendo consistentemente útil. Crea tu propio framework, comparte fracasos y aprendizajes, desafía ideas establecidas con argumentos sólidos. Utiliza el Analizador GEO de meskeIA para identificar oportunidades locales de networking y eventos donde posicionarte como speaker.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Alberto García, especialista en marketing para startups tecnológicas, desarrolló el 'Framework SCALE' para growth marketing. Lo compartió gratuitamente, lo presentó en eventos tech y ahora es consultor de referencia para startups valoradas en +10M€, incluyendo colaboraciones con aceleradoras como Telefónica Open Future.</p>
          </div>
        </section>


        {/* Ideas Clave */}
        <section className={styles.keyIdeasSection}>
          <h2 className={styles.sectionTitle}>💡 Ideas Clave</h2>
          <ul className={styles.keyIdeasList}>
            <li>Tu marca personal es tu principal activo de diferenciación profesional en 2025</li>
            <li>LinkedIn funciona como ecosistema de generación de oportunidades, no solo networking</li>
            <li>El contenido valioso y consistente construye autoridad real y medible</li>
            <li>El thought leadership se conquista siendo útil sistemáticamente, no solo visible</li>
          </ul>
        </section>

        {/* Acciones Prácticas */}
        <section className={styles.actionSection}>
          <h2 className={styles.sectionTitle}>🎯 Acciones para Implementar</h2>
          <div className={styles.actionGrid}>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>1</span>
              <p>Optimiza tu perfil de LinkedIn con métricas cuantificables y propuesta de valor clara</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>2</span>
              <p>Implementa la regla 70-20-10 en tu estrategia de contenidos semanal</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>3</span>
              <p>Utiliza herramientas meskeIA para optimizar SEO y crear contenido visual impactante</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>4</span>
              <p>Define tu framework personal y compártelo como valor diferencial en el mercado</p>
            </div>
          </div>
        </section>

        {/* Preguntas de Reflexión */}
        <section className={styles.reflectionSection}>
          <h2 className={styles.sectionTitle}>🤔 Para Reflexionar</h2>
          <div className={styles.reflectionCards}>
            <div className={styles.reflectionCard}>
              <p>¿Qué problema específico resuelves mejor que nadie en tu sector y cómo lo demuestras?</p>
            </div>
            <div className={styles.reflectionCard}>
              <p>¿Qué metodología o enfoque único podrías sistematizar y compartir como tu firma profesional?</p>
            </div>
          </div>
        </section>

        {/* Curiosidad */}
        
        <section className={styles.curiositySection}>
          <div className={styles.curiosityBox}>
            <h3>🔍 ¿Sabías que...?</h3>
            <p>En 2025, el 94% de los decision makers utilizan LinkedIn para evaluar proveedores y colaboradores antes de cualquier reunión, convirtiendo tu marca personal en tu principal herramienta de ventas pasiva que trabaja 24/7.</p>
          </div>
        </section>
      </div>
    </ChapterPage>
  );
}
