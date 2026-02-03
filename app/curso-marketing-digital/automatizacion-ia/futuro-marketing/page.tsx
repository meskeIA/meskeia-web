'use client';

import { LegalNotice } from '@/components';
import ChapterPage from '../../ChapterPage';
import styles from '../../CursoMarketingDigital.module.css';

export default function FuturoMarketingPage() {
  return (
    <ChapterPage chapterId="futuro-marketing">
      <div className={styles.chapterContent}>
        {/* Introducción */}
        <section className={styles.introSection}>
          <p className={styles.introText}>
            El marketing digital en 2025 no es el mismo que conocíamos hace apenas dos años. La inteligencia artificial generativa, la desaparición definitiva de las cookies de terceros y los cambios en el comportamiento del consumidor han creado un nuevo paradigma. Este no es un tema del futuro: es la realidad actual que ya están viviendo empresas como Mercadona con su app personalizada o Inditex con su estrategia omnicanal. Como profesional del marketing, tienes una decisión clara: adaptarte ahora o quedarte atrás. Este módulo te dará las claves concretas para liderar esta transformación en tu empresa o negocio.
          </p>
        </section>

        {/* Secciones de contenido */}

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>El Nuevo Ecosistema Digital 2025: IA Generativa y Automatización Inteligente</h2>
          <div className={styles.sectionContent}>
            <p>En 2025, la IA generativa ya no es una novedad: es una herramienta básica de trabajo. ChatGPT-4, Gemini y Claude están transformando desde la creación de contenido hasta el análisis predictivo de comportamiento. Las empresas españolas líderes como Telefónica y BBVA ya utilizan IA para personalizar experiencias en tiempo real. La clave no está en usar IA, sino en integrarla estratégicamente. Herramientas especializadas como el Generador de Palabras Clave de meskeIA o el Analizador SEO permiten optimizar campañas con precisión quirúrgica, combinando inteligencia artificial con datos locales y específicos de tu mercado.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>El Corte Inglés utiliza IA para analizar patrones de compra y enviar recomendaciones personalizadas que han aumentado su tasa de conversión en un 34% durante 2024.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Datos Propios: Construyendo Tu Fortaleza Digital</h2>
          <div className={styles.sectionContent}>
            <p>Con Google eliminando definitivamente las cookies de terceros en Chrome durante 2024, los datos propios se han convertido en el activo más valioso de cualquier empresa. No se trata solo de recopilar información, sino de crear ecosistemas de valor donde el usuario quiera compartir sus datos. Esto requiere transparencia total, ofertas de valor claras y herramientas que realmente aporten beneficios. La clave está en la calidad sobre la cantidad: mejor tener 1000 contactos comprometidos que 10.000 desinteresados. El Analizador GEO de meskeIA puede ayudarte a entender mejor el comportamiento local de tus usuarios y crear estrategias de captación más efectivas.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Decathlon España ha creado un programa de fidelización donde los usuarios comparten sus objetivos deportivos a cambio de planes de entrenamiento personalizados y descuentos relevantes, logrando un 89% de satisfacción.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Omnicanalidad Real: Más Allá de Estar Presente en Todos Lados</h2>
          <div className={styles.sectionContent}>
            <p>La omnicanalidad en 2025 no significa tener perfiles en todas las redes sociales. Significa crear experiencias coherentes y fluidas donde cada punto de contacto refuerce el mensaje central de tu marca. Instagram, TikTok, LinkedIn, email marketing, web y WhatsApp Business deben funcionar como una orquesta sincronizada. El usuario debe sentir que está interactuando con la misma entidad, independientemente del canal. Las herramientas como el Generador de Carruseles de meskeIA facilitan mantener coherencia visual y de mensaje across diferentes plataformas.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Mango ha integrado su estrategia de contenido donde un post de Instagram lleva a una historia de WhatsApp, que dirige a una landing específica en su web, creando un journey de usuario sin fricciones que ha mejorado su ROI en un 45%.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>El Perfil del Marketer 2025: Generalista Estratégico con Especialización Técnica</h2>
          <div className={styles.sectionContent}>
            <p>El marketer exitoso de 2025 combina visión estratégica con dominio técnico. Ya no basta con ser creativo; necesitas entender de analítica avanzada, automatización de procesos, y tener la capacidad de interpretar datos complejos para tomar decisiones rápidas. Pero también necesitas mantener la esencia humana: la empatía, la creatividad y la capacidad de contar historias que conecten emocionalmente. El futuro pertenece a quienes sepan equilibrar la tecnología con la humanidad. Herramientas como la Calculadora ROI Marketing de meskeIA te permiten demostrar el valor real de tus acciones con datos concretos.</p>
          </div>
          
        </section>


        {/* Ideas Clave */}
        <section className={styles.keyIdeasSection}>
          <h2 className={styles.sectionTitle}>💡 Ideas Clave</h2>
          <ul className={styles.keyIdeasList}>
            <li>La IA generativa es ya una herramienta básica, no opcional</li>
            <li>Los datos propios requieren ecosistemas de valor para el usuario</li>
            <li>Omnicanalidad significa coherencia, no omnipresencia</li>
            <li>El marketer 2025 equilibra tecnología avanzada con conexión humana</li>
          </ul>
        </section>

        {/* Acciones Prácticas */}
        <section className={styles.actionSection}>
          <h2 className={styles.sectionTitle}>🎯 Acciones para Implementar</h2>
          <div className={styles.actionGrid}>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>1</span>
              <p>Audita tu estrategia actual de datos propios y crea un plan de mejora para los próximos 90 días</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>2</span>
              <p>Identifica qué herramientas de IA puedes integrar inmediatamente en tu flujo de trabajo diario</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>3</span>
              <p>Mapea tu customer journey actual y encuentra los puntos de fricción entre canales</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>4</span>
              <p>Invierte en formación específica: analítica avanzada, automatización o IA aplicada al marketing</p>
            </div>
          </div>
        </section>

        {/* Preguntas de Reflexión */}
        <section className={styles.reflectionSection}>
          <h2 className={styles.sectionTitle}>🤔 Para Reflexionar</h2>
          <div className={styles.reflectionCards}>
            <div className={styles.reflectionCard}>
              <p>¿Qué porcentaje de tus decisiones de marketing actuales se basan en datos concretos vs intuición?</p>
            </div>
            <div className={styles.reflectionCard}>
              <p>Si tus clientes describieran su experiencia con tu marca en una palabra, ¿cuál sería y es la que tú quieres?</p>
            </div>
          </div>
        </section>

        {/* Curiosidad */}
        
        <section className={styles.curiositySection}>
          <div className={styles.curiosityBox}>
            <h3>🔍 ¿Sabías que...?</h3>
            <p>En 2024, las empresas que han implementado estrategias de marketing basadas en IA han visto un aumento promedio del 37% en su ROI, pero solo el 23% de las pymes españolas las están utilizando de forma estratégica.</p>
          </div>
        </section>
      </div>
    </ChapterPage>
  );
}
