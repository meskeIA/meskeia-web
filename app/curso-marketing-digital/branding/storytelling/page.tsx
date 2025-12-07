'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../CursoMarketingDigital.module.css';

export default function StorytellingPage() {
  return (
    <ChapterPage chapterId="storytelling">
      <div className={styles.chapterContent}>
        {/* Introducción */}
        <section className={styles.introSection}>
          <p className={styles.introText}>
            En el ecosistema digital de 2025, donde los consumidores reciben más de 10.000 impactos publicitarios diarios, las marcas que sobreviven no son las que gritan más fuerte, sino las que conectan más profundo. El storytelling ha evolucionado de técnica creativa a ciencia aplicada, combinando neurociencia, data analytics y creatividad humana. Ya no basta con tener un buen producto; necesitas una narrativa que transforme características en emociones, beneficios en experiencias y clientes en protagonistas de su propia historia de éxito. Las marcas españolas más exitosas del momento - desde Mercadona hasta Glovo - no venden productos, venden transformaciones. Este capítulo te enseña a construir narrativas que no solo capten atención, sino que generen acción y lealtad duradera.
          </p>
        </section>

        {/* Secciones de contenido */}

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>La neurociencia detrás del storytelling: por qué las historias venden</h2>
          <div className={styles.sectionContent}>
            <p>El cerebro humano procesa historias 22 veces más rápido que datos puros. Cuando escuchamos una narrativa bien estructurada, se activan múltiples áreas cerebrales: el córtex auditivo procesa el sonido, el área de Broca y Wernicke el lenguaje, y el córtex frontal las emociones. Esta activación neural múltiple genera lo que los neurocientíficos llaman 'coupling neural' - una sincronización entre el narrador y la audiencia. En marketing digital 2025, esto se traduce en mayor tiempo de permanencia, más interacciones y, crucialmente, mayor recordación de marca. Las historias generan un promedio de 65% más de recordación que los contenidos puramente informativos, y aumentan la intención de compra en un 30%.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>El Corte Inglés revolutionó su comunicación digital en 2024 con la campaña 'Historias que nos unen', donde cada producto se contextualiza dentro de momentos familiares reales, logrando un 40% más de engagement que sus campañas anteriores basadas en descuentos.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>El framework del viaje del héroe adaptado al customer journey</h2>
          <div className={styles.sectionContent}>
            <p>Joseph Campbell nunca imaginó que su monomito se convertiría en una herramienta de conversión digital. En 2025, las marcas más exitosas mapean cada etapa del customer journey con elementos narrativos específicos: Awareness (mundo ordinario), Consideration (llamada a la aventura), Decision (encuentro con el mentor), Purchase (cruzar el umbral), Retention (pruebas y aliados) y Advocacy (regreso transformado). Esta estructura no es solo storytelling, es arquitectura de experiencia. Cada touchpoint digital - desde el primer anuncio hasta el email post-compra - forma parte de una narrativa coherente que guía al cliente hacia su transformación personal o profesional.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Cabify estructuró toda su comunicación 2024 siguiendo este modelo: desde anuncios que muestran el 'mundo ordinario' del transporte tradicional, hasta testimoniales de usuarios que han 'regresado transformados' con mayor comodidad y seguridad en sus desplazamientos urbanos.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Tu cliente como protagonista: el arte de la empatía digital</h2>
          <div className={styles.sectionContent}>
            <p>El error más común en storytelling de marca es posicionarse como el héroe. En el paradigma digital actual, las marcas más exitosas actúan como 'mentores digitales' que facilitan la transformación del cliente. Este enfoque requiere research profundo de audiencia - algo donde herramientas como el Analizador GEO de meskeIA pueden proporcionarte insights demográficos y psicográficos precisos. Debes entender no solo qué compra tu audiencia, sino por qué lo compra, qué miedos tiene, qué aspiraciones persigue. La empatía digital significa crear contenido que refleje genuinamente los desafíos, frustraciones y sueños de tu audiencia, posicionando tu solución como el catalizador de su éxito.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Glovo transformó su narrativa en 2024 de 'somos rápidos' a 'te damos tiempo para lo que importa'. Sus campañas muestran personas disfrutando momentos valiosos mientras Glovo resuelve sus necesidades logísticas - el cliente es el héroe que recupera tiempo de calidad.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Storytelling multiplataforma: narrativas coherentes en ecosistemas fragmentados</h2>
          <div className={styles.sectionContent}>
            <p>En 2025, tu historia debe funcionar en un TikTok de 15 segundos, un newsletter de 500 palabras y un podcast de 45 minutos. La coherencia narrativa multiplataforma es el nuevo imperativo. Desarrolla un 'DNA narrativo' - elementos core de tu historia que se adaptan a cada formato y plataforma manteniendo la esencia. Instagram Reels requiere ganchos visuales inmediatos, LinkedIn necesita insights profesionales, YouTube permite desarrollo narrativo complejo. Herramientas como el Generador de Carruseles de meskeIA te ayudan a mantener consistencia visual mientras adaptas tu narrativa a diferentes formatos. El secreto está en tener una historia central fuerte que se puede contar de múltiples maneras.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>La startup española Typeform creó en 2024 una narrativa coherente sobre 'hacer formularios humanos' que funciona igual de bien en un tweet de 280 caracteres que en sus case studies detallados, manteniendo siempre al usuario como protagonista de experiencias más fluidas.</p>
          </div>
        </section>


        {/* Ideas Clave */}
        <section className={styles.keyIdeasSection}>
          <h2 className={styles.sectionTitle}>💡 Ideas Clave</h2>
          <ul className={styles.keyIdeasList}>
            <li>Las narrativas activan múltiples áreas cerebrales, generando mayor recordación y conexión emocional</li>
            <li>Cada punto de contacto digital debe formar parte de una historia coherente del customer journey</li>
            <li>Tu marca debe ser el mentor que facilita la transformación del cliente-héroe</li>
            <li>La coherencia narrativa multiplataforma es esencial en ecosistemas digitales fragmentados</li>
          </ul>
        </section>

        {/* Acciones Prácticas */}
        <section className={styles.actionSection}>
          <h2 className={styles.sectionTitle}>🎯 Acciones para Implementar</h2>
          <div className={styles.actionGrid}>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>1</span>
              <p>Utiliza el Analizador GEO de meskeIA para entender profundamente a tu audiencia y construir narrativas relevantes</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>2</span>
              <p>Mapea tu customer journey identificando oportunidades narrativas en cada touchpoint</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>3</span>
              <p>Desarrolla un 'DNA narrativo' central que se adapte a todos tus canales digitales</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>4</span>
              <p>Crea contenido de prueba A/B comparando enfoques narrativos vs. informativos para medir el impacto real</p>
            </div>
          </div>
        </section>

        {/* Preguntas de Reflexión */}
        <section className={styles.reflectionSection}>
          <h2 className={styles.sectionTitle}>🤔 Para Reflexionar</h2>
          <div className={styles.reflectionCards}>
            <div className={styles.reflectionCard}>
              <p>¿Qué transformación específica y medible experimenta tu cliente después de usar tu producto o servicio?</p>
            </div>
            <div className={styles.reflectionCard}>
              <p>¿Cómo puedes convertir cada interacción digital en un capítulo de la historia de éxito de tu cliente?</p>
            </div>
          </div>
        </section>

        {/* Curiosidad */}
        
        <section className={styles.curiositySection}>
          <div className={styles.curiosityBox}>
            <h3>🔍 ¿Sabías que...?</h3>
            <p>Las marcas que implementan storytelling coherente multiplataforma registran un aumento promedio del 23% en customer lifetime value, según datos de marketing automation de 2024.</p>
          </div>
        </section>
      </div>
    </ChapterPage>
  );
}
