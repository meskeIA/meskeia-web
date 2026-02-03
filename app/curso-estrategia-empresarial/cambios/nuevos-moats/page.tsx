'use client';

import { LegalNotice } from '@/components';
import ChapterPage from '../../ChapterPage';
import styles from '../../CursoEstrategiaEmpresarial.module.css';

export default function NuevosMoatsPage() {
  return (
    <ChapterPage chapterId="nuevos-moats">
      <div className={styles.chapterContent}>
        {/* Introducción */}
        <section className={styles.introSection}>
          <p className={styles.introText}>
            Si tuvieras que construir una ventaja competitiva hoy, ¿apostarías por una fábrica gigante, una red de distribución física o una patente? Probablemente no. Las ventajas competitivas tradicionales —los famosos 'moats' de Warren Buffett— se erosionan más rápido que nunca. Una startup puede escalar a millones de usuarios sin oficinas físicas, una IA puede replicar procesos que tardaron décadas en perfeccionarse, y Amazon puede hacer irrelevante tu red de distribución en meses. Pero esto no significa que las ventajas competitivas hayan desaparecido. Han evolucionado. Las empresas que dominan hoy —Google, Amazon, Tesla, OpenAI— no construyen muros tradicionales. Construyen bucles que se refuerzan a sí mismos y se aceleran con el tiempo.
          </p>
        </section>

        {/* Secciones de contenido */}

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Data Loops: El Nuevo Petróleo Necesita Nuevas Refinerías</h2>
          <div className={styles.sectionContent}>
            <p>Los datos no son valiosos por sí mismos. Lo valioso es la velocidad con la que los conviertes en mejores productos. Google no ganó por tener más páginas web indexadas, sino por crear un bucle: más búsquedas → mejores resultados → más usuarios → más búsquedas. Netflix no triunfa por tener más contenido, sino porque cada visualización mejora sus recomendaciones, lo que aumenta el engagement, lo que genera más datos. Este es el patrón: datos → insights → mejor producto → más usuarios → más datos. Pero aquí está el truco: la velocidad de este ciclo es lo que marca la diferencia. Spotify procesa 100.000 millones de eventos de datos al día para mejorar sus algoritmos en tiempo real. Sus competidores tradicionales (discográficas) siguen pensando en trimestres.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>OpenAI vs Google en IA generativa: OpenAI lanzó ChatGPT y obtuvo 100 millones de usuarios en 2 meses. Cada conversación mejora el modelo. Google tenía mejor tecnología inicial, pero OpenAI creó un bucle de feedback más rápido con usuarios reales. Resultado: OpenAI forzó a Google a acelerar el lanzamiento de Bard, rompiendo su propia cultura de 'lanzar cuando esté perfecto'.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Efectos de Red 2.0: Cuando el Valor Crece Exponencialmente</h2>
          <div className={styles.sectionContent}>
            <p>Los efectos de red tradicionales eran simples: más usuarios = más valor (como el teléfono). Los efectos de red modernos son multidimensionales. LinkedIn no solo conecta profesionales; conecta profesionales con empresas, con contenido, con cursos, con datos de mercado laboral. Cada conexión alimenta múltiples bucles. Amazon no es solo una tienda; es marketplace + logística + cloud + publicidad + contenido. Cada compra fortalece todos los bucles simultáneamente. La clave es que estos efectos se aceleran: los primeros 1000 usuarios aportan poco, pero después del punto de inflexión, cada nuevo usuario aporta valor exponencial. Por eso las empresas digitales luchan ferozmente por masa crítica inicial, incluso perdiendo dinero años.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>TikTok vs YouTube: YouTube tenía 15 años de ventaja y billones de horas de contenido. Pero TikTok creó un efecto de red más potente: su algoritmo aprende no solo de lo que ves, sino de cuánto tiempo lo ves, cuándo lo pausas, cuándo lo compartes. Con 1.000 millones de usuarios generando estos micro-datos, TikTok sabe qué te gustará mejor que tú mismo. YouTube está copiando el formato desesperadamente con Shorts.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Distribución Como Ventaja: El Canal Es el Mensaje</h2>
          <div className={styles.sectionContent}>
            <p>En el mundo físico, la distribución era cara y lenta de construir. En el digital, es aún más poderosa pero funciona diferente. No se trata de tener más puntos de venta, sino de estar integrado en el flujo de trabajo de tus usuarios. Slack no compite por 'cuota de mercado de comunicación'; se vuelve indispensable en el día a día laboral. Shopify no vende solo software; se convierte en la infraestructura crítica de millones de tiendas online. La nueva distribución es sobre dependencia, no sobre alcance. Cuando cambiar de proveedor requiere rehacer procesos críticos, tienes una ventaja distributiva real. Amazon Web Services no es solo más barato; migrar tu infraestructura cloud es tan complejo que la mayoría no lo intenta.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Apple y el App Store: Apple no solo vende teléfonos; controla cómo mil millones de personas instalan software. Cada app que descargas refuerza tu dependencia del ecosistema. Epic Games demandó a Apple por monopolístico, pero perdió porque Apple construyó una distribución tan integrada que cambiar de iPhone significa perder apps, datos, y flujos de trabajo. Es distribución como infraestructura crítica.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Velocidad de Iteración: El Tempo Marca la Guerra</h2>
          <div className={styles.sectionContent}>
            <p>En industrias tradicionales, el que tenía mejor producto inicial ganaba. Hoy gana quien mejora más rápido. Tesla no lanzó el mejor coche eléctrico de la historia; lanzó uno decente y lo mejoró con actualizaciones de software cada mes. Sus competidores siguen pensando en 'modelos anuales'. Meta no creó la mejor red social; creó una plataforma que evoluciona constantemente basada en datos de comportamiento de 3.000 millones de usuarios. La ventaja no está en el producto perfecto, sino en el sistema perfecto para mejorar el producto. Esto requiere cultura, herramientas y procesos completamente diferentes. Mientras Ford tarda 4 años en desarrollar un modelo nuevo, Tesla actualiza su software cada 2 semanas.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Figma vs Adobe: Adobe dominaba diseño gráfico desde los 90s con Photoshop e Illustrator. Figma lanzó una herramienta inferior técnicamente, pero basada en web y colaborativa. Mientras Adobe lanzaba actualizaciones anuales, Figma desplegaba mejoras semanales basadas en feedback de usuarios. En 5 años, Figma se volvió estándar en diseño UI/UX. Adobe tuvo que comprarla por \$20.000 millones para no quedar obsoleta.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Por Qué los Moats Tradicionales Se Erosionan</h2>
          <div className={styles.sectionContent}>
            <p>Las ventajas tradicionales asumen un mundo estable donde el cambio es gradual. Patentes protegían por 20 años; hoy una startup puede hacer obsoleta tu patente con un enfoque completamente diferente. Economías de escala importaban cuando la producción era física; ahora el software escala a coste marginal cero. Las marcas tardaban décadas en construirse; hoy una empresa puede volverse viral globalmente en semanas. Pero el factor clave es que los moats tradicionales eran defensivos (mantenían competidores fuera), mientras que los nuevos moats son ofensivos (se fortalecen atacando). Google no se defiende de competidores; absorbe datos de todo internet para volverse más inteligente. Amazon no protege su negocio; expande a nuevas industrias usando su infraestructura.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Kodak vs Instagram: Kodak tenía 140 años de experiencia, 145.000 empleados, patentes, fábricas, red de distribución global. Instagram tenía 13 empleados y una app. Kodak quebró en 2012; Facebook compró Instagram por \$1.000 millones el mismo año. La ventaja no estaba en los activos físicos sino en entender cómo la gente quería compartir fotos en la era móvil.</p>
          </div>
        </section>


        {/* Ideas Clave */}
        <section className={styles.keyIdeasSection}>
          <h2 className={styles.sectionTitle}>💡 Ideas Clave</h2>
          <ul className={styles.keyIdeasList}>
            <li>Los datos solo son valiosos si puedes convertirlos en mejor producto más rápido que tu competencia</li>
            <li>Los efectos de red modernos son multidimensionales y se aceleran después del punto de inflexión</li>
            <li>La nueva distribución es sobre volverse indispensable en el flujo de trabajo del cliente</li>
            <li>La velocidad de iteración importa más que la perfección del producto inicial</li>
            <li>Los moats tradicionales eran defensivos; los nuevos moats son ofensivos y se fortalecen atacando</li>
          </ul>
        </section>

        {/* Acciones Prácticas */}
        <section className={styles.actionSection}>
          <h2 className={styles.sectionTitle}>🎯 Acciones para Implementar</h2>
          <div className={styles.actionGrid}>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>1</span>
              <p>Mapea todos los datos que generates en tu negocio y diseña un bucle para convertirlos en mejor producto</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>2</span>
              <p>Identifica en qué flujo de trabajo crítico de tus clientes puedes volverte indispensable</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>3</span>
              <p>Mide tu velocidad de iteración actual: ¿cuánto tardas desde idea hasta mejora implementada?</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>4</span>
              <p>Analiza qué efectos de red puedes crear conectando diferentes grupos de usuarios o tipos de valor</p>
            </div>
          </div>
        </section>

        {/* Preguntas de Reflexión */}
        <section className={styles.reflectionSection}>
          <h2 className={styles.sectionTitle}>🤔 Para Reflexionar</h2>
          <div className={styles.reflectionCards}>
            <div className={styles.reflectionCard}>
              <p>¿Qué ventajas competitivas de tu industria eran importantes hace 10 años pero son irrelevantes hoy?</p>
            </div>
            <div className={styles.reflectionCard}>
              <p>¿Cómo podrías usar los datos de tus clientes para crear un producto que mejore automáticamente?</p>
            </div>
            <div className={styles.reflectionCard}>
              <p>¿En qué procesos críticos de tus clientes podrías integrarte tanto que cambiar de proveedor sea muy costoso?</p>
            </div>
          </div>
        </section>

        {/* Curiosidad */}
        
        <section className={styles.curiositySection}>
          <div className={styles.curiosityBox}>
            <h3>🔍 ¿Sabías que...?</h3>
            <p>Netflix casi quiebra en 2011 cuando perdió contenido de Starz y sus acciones cayeron 80%. Su ventaja competitiva real no era el contenido licenciado, sino los datos de visualización que usó para crear contenido original. 'House of Cards' fue la primera serie creada completamente basada en algoritmos de datos de audiencia. Hoy Netflix invierte \$15.000 millones anuales en contenido original usando esos mismos bucles de datos.</p>
          </div>
        </section>
      </div>
    </ChapterPage>
  );
}
