'use client';

import { LegalNotice } from '@/components';
import ChapterPage from '../../ChapterPage';
import styles from '../../CursoPensamientoSistemico.module.css';

export default function CambioClimaticoPage() {
  return (
    <ChapterPage chapterId="cambio-climatico">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🎯</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>
          Cuando Netflix decidió expandirse globalmente en 2016, sus algoritmos de recomendación colapsaron en mercados como India y Brasil. ¿La razón? Intentaron aplicar lógica lineal (más datos = mejores predicciones) a un sistema cultural complejo donde las preferencias de entretenimiento están entrelazadas con dinámicas familiares, tradiciones locales y estructuras socioeconómicas únicas. Esta experiencia ilustra perfectamente por qué el pensamiento sistémico se ha convertido en la competencia más demandada del siglo XXI. En un mundo donde una crisis de semiconductores en Taiwán puede paralizar la industria automotriz alemana, o donde un cambio en el algoritmo de TikTok puede transformar las tendencias de consumo en Latinoamérica, ya no podemos permitirnos el lujo de pensar en línea recta. El pensamiento sistémico no es solo una herramienta de análisis; es una nueva forma de navegar la realidad interconectada de 2024.
        </p>
      </section>

      {/* Anatomía de la Complejidad: Cuando 1+1 No Siempre Suma 2 */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🔄</span>
          <h2 className={styles.sectionTitleText}>Anatomía de la Complejidad: Cuando 1+1 No Siempre Suma 2</h2>
        </div>
        <p>
          Imagina que eres el CEO de una cadena de restaurantes en México durante 2022. La inflación sube, decides aumentar precios un 15%. Lógica lineal: más ingresos por plato. Realidad sistémica: los clientes reducen visitas, los empleados piden aumentos salariales, los proveedores aprovechan para subir sus precios, la competencia mantiene precios bajos ganando market share, las reseñas online se vuelven negativas afectando la reputación, y seis meses después tienes menos ingresos que antes del aumento. Este es el poder destructivo del pensamiento lineal en sistemas complejos.</p>
        <p></p>
        <p>Los sistemas complejos poseen cuatro características que los hacen impredecibles: emergencia, no-linealidad, adaptabilidad y auto-organización. La emergencia significa que el comportamiento del sistema completo es fundamentalmente diferente a la suma de sus partes. Uber no es simplemente una app más taxistas; es un ecosistema emergente que transformó la movilidad urbana, las relaciones laborales y hasta la planificación urbana. La no-linealidad implica que pequeñas acciones pueden tener consecuencias masivas, mientras que grandes esfuerzos pueden generar cambios mínimos.</p>
        <p></p>
        <p>En 2023, la startup colombiana Rappi descubrió esto de manera dramática. Implementaron un sistema de gamificación para motivar a sus repartidores, esperando un aumento lineal en productividad. El resultado fue un ecosistema auto-organizado donde los repartidores desarrollaron estrategias colaborativas no previstas, algunos especializándose en horarios específicos, otros compartiendo información sobre rutas óptimas, creando un sistema de inteligencia colectiva que superó en 340% las expectativas originales.</p>
        <p></p>
        <p>La adaptabilidad de los sistemas complejos significa que están constantemente evolucionando en respuesta a cambios internos y externos. No son máquinas que ejecutan programas fijos, sino organismos vivos que aprenden y se transforman. La pandemia de COVID-19 demostró esta realidad: las organizaciones que sobrevivieron no fueron necesariamente las más grandes o con más recursos, sino las que pudieron adaptarse sistémicamente más rápido.</p>
        <p></p>
        <p>Finalmente, la auto-organización revela que los sistemas complejos desarrollan estructuras y patrones sin control centralizado. Las favelas brasileñas son ejemplos fascinantes de auto-organización urbana: sin planificación formal, desarrollan sistemas complejos de comercio, transporte, comunicación y gobernanza que funcionan con una eficiencia que desafía la lógica urbanística tradicional.
        </p>

        <div className={styles.exampleBox}>
          <p>
            <strong>Ejemplo práctico:</strong> En 2024, el Banco Santander México implementó lo que llamaron &#39;Decisiones Sistémicas Inteligentes&#39;. Antes de aprobar créditos hipotecarios, su IA no solo evalúa el historial crediticio del solicitante, sino que mapea 47 variables sistémicas: desde la estabilidad del sector donde trabaja, la resiliencia económica de su colonia, las tendencias demográficas de su edad, hasta los patrones de movilidad urbana que podrían afectar el valor de la propiedad. Resultado: redujeron la morosidad en un 73% y descubrieron oportunidades de negocio en segmentos que la banca tradicional consideraba &#39;de alto riesgo&#39;.
          </p>
        </div>
      </section>

      {/* Ideas Clave */}
      <div className={styles.keyIdeasList}>
        <h4>💡 Ideas Clave</h4>
        <ul>
          <li>En sistemas complejos, las consecuencias de nuestras acciones emergen de interacciones impredecibles entre múltiples elementos, no de relaciones causales directas</li>
          <li>La no-linealidad sistémica significa que el timing de una decisión puede ser más importante que la decisión misma</li>
          <li>Los sistemas complejos se auto-organizan y adaptan constantemente, por lo que las soluciones efectivas deben ser evolutivas, no estáticas</li>
          <li>El pensamiento sistémico requiere aceptar la incertidumbre como aliada estratégica, no como enemiga a eliminar</li>
          <li>Las intervenciones más poderosas en sistemas complejos ocurren en los puntos de apalancamiento, no necesariamente donde el problema es más visible</li>
        </ul>
      </div>

      {/* Acciones Prácticas */}
      <div className={styles.practicalTip}>
        <h4>🎯 Acciones para Implementar</h4>
        <ul>
          <li>Esta semana, antes de tomar cualquier decisión importante, pregúntate: &#39;¿Qué tres efectos no intencionados podría generar esta acción?&#39; y diseña sensores para detectarlos tempranamente</li>
          <li>Mapea tu ecosistema profesional identificando: actores directos, influenciadores indirectos, flujos de información, y bucles de retroalimentación. Usa colores para distinguir relaciones formales de informales</li>
          <li>Implementa la &#39;Regla 72 horas&#39;: espera tres días antes de ejecutar decisiones importantes, utilizando ese tiempo para consultar con personas que vean el sistema desde perspectivas diferentes a la tuya</li>
        </ul>
      </div>

      {/* Preguntas de Reflexión */}
      <div className={styles.reflectionQuestions}>
        <h4>🤔 Preguntas de Reflexión</h4>
        <ol>
          <li>¿Cuál es el último &#39;efecto secundario&#39; positivo que experimentaste por algo que inicialmente consideraste un problema?</li>
          <li>Si tuvieras que explicar tu trabajo como parte de un sistema más amplio, ¿cómo describirías tu función ecosistémica real versus tu descripción de puesto oficial?</li>
          <li>¿Qué decisión reciente tomaste pensando en resultados inmediatos que ahora reconoces podría tener consecuencias sistémicas a 3-5 años?</li>
        </ol>
      </div>

      {/* Curiosidad */}
      <div className={styles.curiosityBox}>
        <h4>💡 ¿Sabías que...?</h4>
        <p>
          En 2024, investigadores de la Universidad de São Paulo descubrieron que los algoritmos de delivery de comida han creado un &#39;efecto mariposa gastronómico&#39;: sus sistemas de recomendación están homogeneizando los gustos culinarios urbanos tan rápidamente que ciudades separadas por miles de kilómetros ahora tienen patrones de consumo más similares entre sí que con sus propias tradiciones rurales locales, redefiniendo involuntariamente la identidad cultural a través de la optimización logística.
        </p>
      </div>
    </ChapterPage>
  );
}
