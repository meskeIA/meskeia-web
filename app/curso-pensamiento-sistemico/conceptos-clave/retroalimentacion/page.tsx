'use client';

import { LegalNotice } from '@/components';
import ChapterPage from '../../ChapterPage';
import styles from '../../CursoPensamientoSistemico.module.css';

export default function RetroalimentacionPage() {
  return (
    <ChapterPage chapterId="retroalimentacion">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🎯</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>
          Imagina por un momento el algoritmo de recomendaciones de TikTok observándote mientras dudas entre seguir viendo videos o cerrar la aplicación. Cada segundo adicional que permaneces en la plataforma alimenta un sistema que aprende a mantenerte aún más tiempo la próxima vez. Este no es simplemente un programa ejecutándose: es un bucle de retroalimentación que se fortalece con cada interacción, creando patrones de comportamiento que ni tú ni los programadores originales pudieron anticipar completamente. Los bucles de retroalimentación no son solo conceptos teóricos de la ciencia de sistemas; son los arquitectos invisibles de nuestra realidad digital, económica y social, moldeando desde las crisis financieras hasta los movimientos sociales virales.
        </p>
      </section>

      {/* Bucles de Retroalimentación: Los Arquitectos Invisibles de la Realidad */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🔄</span>
          <h2 className={styles.sectionTitleText}>Bucles de Retroalimentación: Los Arquitectos Invisibles de la Realidad</h2>
        </div>
        <p>
          Los bucles de retroalimentación funcionan como conversaciones perpetuas entre las partes de un sistema, donde cada &#39;respuesta&#39; modifica la próxima &#39;pregunta&#39;. A diferencia de las máquinas industriales del siglo XX, que operaban con inputs y outputs predecibles, los sistemas contemporáneos se comportan más como organismos vivos que aprenden y se adaptan constantemente.</p>
        <p></p>
        <p>Consideremos el fenómeno de la inflación en Argentina durante 2023-2024. Cuando los precios comenzaron a subir, los consumidores aceleraron sus compras anticipando aumentos futuros, incrementando la demanda y, paradójicamente, validando sus temores originales. Este bucle de retroalimentación positiva transformó expectativas en realidad, demostrando cómo las percepciones pueden alterar fundamentalmente las condiciones objetivas de un sistema económico.</p>
        <p></p>
        <p>Pero la verdadera potencia de estos bucles se revela en su capacidad para generar efectos en cascada. En 2022, cuando Elon Musk anunció su intención de comprar Twitter, cada tweet suyo sobre la plataforma modificaba tanto el valor de las acciones como la percepción pública, lo que a su vez influenciaba sus siguientes declaraciones y decisiones estratégicas. El resultado fue una danza compleja entre percepción, valor financiero y decisiones empresariales que ningún modelo tradicional de causa-efecto podría haber predicho.</p>
        <p></p>
        <p>Lo fascinante de estos sistemas es que operan simultáneamente en múltiples escalas temporales. Mientras que un like en Instagram genera retroalimentación instantánea, las decisiones algorítmicas basadas en millones de estas micro-interacciones moldean tendencias culturales que emergen durante meses. Esta multiplicidad temporal es lo que hace que los sistemas con retroalimentación sean tan resistentes a las predicciones lineales y tan ricos en comportamientos emergentes.</p>
        <p></p>
        <p>En el contexto latinoamericano, empresas como Mercado Libre han construido imperios comerciales entendiendo intuitivamente estos principios. Su sistema de reputación crea bucles donde vendedores exitosos atraen más compradores, generando más transacciones exitosas, lo que mejora su reputación en un ciclo virtuoso. Simultáneamente, los compradores satisfechos se convierten en usuarios más activos, ampliando la base de la plataforma y atrayendo nuevos vendedores. Este diseño sistémico trasciende la simple intermediación comercial para crear un ecosistema auto-reforzante.
        </p>

        <div className={styles.exampleBox}>
          <p>
            <strong>Ejemplo práctico:</strong> El colapso de Terra Luna en mayo de 2022 ofreció una lección magistral sobre bucles de retroalimentación negativos en sistemas financieros descentralizados. Cuando algunos inversores grandes comenzaron a vender sus holdings de LUNA, el mecanismo algorítmico diseñado para mantener la estabilidad de TerraUSD comenzó a imprimir más tokens LUNA para absorber la venta. Esta inflación súbita devaluó LUNA, provocando más ventas masivas, que activaron más impresión de tokens, en una espiral descendente que colapsó un ecosistema valorado en $60 mil millones en menos de una semana. La ironía es que el mecanismo de estabilización se convirtió precisamente en el vector de destrucción.
          </p>
        </div>
      </section>

      {/* Ideas Clave */}
      <div className={styles.keyIdeasList}>
        <h4>💡 Ideas Clave</h4>
        <ul>
          <li>Los bucles de retroalimentación transforman sistemas mecánicos en ecosistemas adaptativos que aprenden y evolucionan con cada iteración.</li>
          <li>La velocidad de la retroalimentación digital ha comprimido los ciclos de adaptación sistémica de años a segundos, intensificando tanto oportunidades como riesgos.</li>
          <li>Los sistemas exitosos diseñan intencionalmente bucles de retroalimentación positiva para crear ventajas competitivas auto-reforzantes.</li>
          <li>Las crisis sistémicas modernas emergen frecuentemente de bucles de retroalimentación que amplifican pequeñas perturbaciones hasta convertirlas en disrupciones masivas.</li>
          <li>La retroalimentación múltiple y simultánea crea puntos ciegos en nuestros modelos predictivos tradicionales, requiriendo enfoques de monitoreo continuo y adaptativo.</li>
        </ul>
      </div>

      {/* Acciones Prácticas */}
      <div className={styles.practicalTip}>
        <h4>🎯 Acciones para Implementar</h4>
        <ul>
          <li>Documenta durante una semana todos los bucles de retroalimentación que identificas en tu trabajo diario: desde las métricas que modifican tu comportamiento hasta las respuestas del equipo que influencian tus siguientes decisiones. Crea un &#39;diario de bucles&#39; con situaciones específicas, tiempos de ciclo y efectos observados.</li>
          <li>Selecciona un proceso problemático en tu organización y traza un mapa visual de cómo la &#39;solución&#39; actual podría estar alimentando inadvertidamente el problema original. Utiliza flechas para mostrar las conexiones circulares y identifica al menos tres puntos donde podrías intervenir para romper ciclos negativos.</li>
          <li>Diseña un experimento de retroalimentación: modifica intencionalmente una variable pequeña en tu entorno de trabajo (horario de reuniones, frecuencia de comunicación, método de seguimiento) y documenta cómo esta modificación genera cambios en cascada durante dos semanas. Registra tanto efectos esperados como sorpresas.</li>
        </ul>
      </div>

      {/* Preguntas de Reflexión */}
      <div className={styles.reflectionQuestions}>
        <h4>🤔 Preguntas de Reflexión</h4>
        <ol>
          <li>¿Qué bucles de retroalimentación en mi vida profesional me están llevando hacia resultados que conscientemente no deseo, y cómo puedo identificar el momento preciso donde el ciclo se puede interrumpir?</li>
          <li>¿Cómo las herramientas digitales que uso diariamente (email, redes sociales, aplicaciones de productividad) están creando bucles de retroalimentación que modifican mi comportamiento de maneras que no había considerado?</li>
          <li>¿Qué información estoy recibiendo tan rápido que me impide ver los patrones de retroalimentación más lentos pero más significativos en mis proyectos y relaciones profesionales?</li>
        </ol>
      </div>

      {/* Curiosidad */}
      <div className={styles.curiosityBox}>
        <h4>💡 ¿Sabías que...?</h4>
        <p>
          Los investigadores del MIT descubrieron en 2024 que los sistemas de inteligencia artificial desarrollan espontáneamente bucles de retroalimentación internos no programados explícitamente, sugiriendo que la retroalimentación podría ser una propiedad emergente fundamental de cualquier sistema de procesamiento de información suficientemente complejo, incluyendo organizaciones humanas.
        </p>
      </div>
    </ChapterPage>
  );
}
