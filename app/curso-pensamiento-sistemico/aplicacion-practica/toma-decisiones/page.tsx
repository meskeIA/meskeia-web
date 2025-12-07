'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../CursoPensamientoSistemico.module.css';

export default function TomaDecisionesPage() {
  return (
    <ChapterPage chapterId="toma-decisiones">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🎯</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>
          Imagina que eres el CEO de una empresa y decides implementar trabajo híbrido para retener talento. Tres meses después, la productividad ha aumentado un 15%, pero los equipos están fragmentados, la cultura organizacional se debilita y los empleados junior luchan sin mentorías presenciales. ¿Éxito o fracaso? La respuesta depende de tu capacidad para pensar sistémicamente. En 2024, las decisiones más aparentemente simples generan cascadas de efectos que trascienden departamentos, geografías y generaciones. El pensamiento sistémico no es una metodología más en tu toolkit profesional: es la diferencia entre liderar con claridad o reaccionar constantemente a consecuencias imprevistas que pudiste anticipar.
        </p>
      </section>

      {/* Consecuencias de Segundo Orden: Más Allá de la Solución Inmediata */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🔄</span>
          <h2 className={styles.sectionTitleText}>Consecuencias de Segundo Orden: Más Allá de la Solución Inmediata</h2>
        </div>
        <p>
          La seducción de la solución inmediata es irresistible. Presionados por métricas trimestrales, crisis mediáticas y la velocidad del mercado, optimizamos para el resultado visible mientras ignoramos las reverberaciones invisibles que determinarán nuestro futuro. Esta miopía sistémica no es solo un error cognitivo: es la principal causa de que el 70% de las transformaciones organizacionales fallen, según el último estudio de McKinsey Global Institute.</p>
        <p></p>
        <p>Consideremos el caso de Netflix en 2022. La plataforma respondió a la pérdida de suscriptores implementando un plan con publicidad y restricciones para cuentas compartidas. La métrica inmediata mejoró: recuperaron 2.4 millones de suscriptores en seis meses. Pero las consecuencias de segundo orden están reshapeando su posición competitiva: alteraron la percepción de marca premium, modificaron los hábitos de consumo familiar y activaron dinámicas de resistencia en mercados emergentes donde el sharing es norma cultural. ¿El resultado? Una transformación no planificada de su modelo de negocio que aún está desarrollándose.</p>
        <p></p>
        <p>El mapeo de consecuencias sistémicas requiere una metodología específica que llamamos &#39;arquitectura de impactos&#39;. Primero, identificamos stakeholders directos e indirectos. Segundo, trazamos flujos de valor, información y poder que serán alterados. Tercero, modelamos feedback loops que pueden amplificar o atenuar efectos. Cuarto, consideramos el factor temporal: algunos efectos emergen inmediatamente, otros necesitan meses para manifestarse.</p>
        <p></p>
        <p>Los puntos de apalancamiento son las joyas del pensamiento sistémico: intervenciones mínimas con máximo impacto. En 2023, Mercado Libre identificó que modificar su algoritmo de reputación de vendedores (una línea de código) generó más mejoras en experiencia de usuario que su inversión anual en customer service. No todas las soluciones requieren más recursos; las mejores requieren más inteligencia sistémica.</p>
        <p></p>
        <p>La incertidumbre sistémica no es un bug, es una feature. Los sistemas complejos son inherentemente impredecibles, pero esto no nos condena a la parálisis. Desarrollamos lo que llamamos &#39;robustez adaptativa&#39;: decisiones que funcionan bien en múltiples escenarios futuros. Spotify ejemplifica esto brillantemente con su arquitectura de equipos autónomos, que les permite experimentar, fallar rápido y adaptarse sin comprometer la estabilidad global de la plataforma.
        </p>

        <div className={styles.exampleBox}>
          <p>
            <strong>Ejemplo práctico:</strong> En 2023, Grupo Bimbo enfrentó el desafío de la inflación y las disrupciones de supply chain. En lugar de subir precios uniformemente (solución obvia), implementaron una estrategia sistémica: rediseñaron rutas de distribución usando IA para optimizar costos logísticos, desarrollaron alianzas estratégicas con productores locales para reducir dependencia de importaciones, y crearon líneas de productos con ingredientes alternativos más estables en precio. El resultado: mantuvieron competitividad sin sacrificar márgenes ni accesibilidad para consumidores de menores ingresos, mientras fortalecían relaciones con proveedores regionales y reducían su huella de carbono.
          </p>
        </div>
      </section>

      {/* Ideas Clave */}
      <div className={styles.keyIdeasList}>
        <h4>💡 Ideas Clave</h4>
        <ul>
          <li>Toda decisión es una apuesta sobre futuros inciertos; el pensamiento sistémico mejora nuestras probabilidades</li>
          <li>Los sistemas complejos recompensan la elegancia sobre la fuerza: pequeñas intervenciones inteligentes superan grandes inversiones mal dirigidas</li>
          <li>La verdadera competencia no es resolver problemas más rápido, sino anticipar las consecuencias que otros ignoran</li>
          <li>En sistemas interconectados, tu mayor fortaleza puede convertirse en tu mayor vulnerabilidad si no mapeas dependencias</li>
          <li>La resiliencia sistémica se construye diseñando para la adaptabilidad, no para la eficiencia máxima</li>
        </ul>
      </div>

      {/* Acciones Prácticas */}
      <div className={styles.practicalTip}>
        <h4>🎯 Acciones para Implementar</h4>
        <ul>
          <li>Selecciona una decisión que debes tomar esta semana. Mapea sus consecuencias en tres círculos concéntricos: impactos inmediatos (1-3 meses), efectos de medio plazo (6-12 meses) y transformaciones sistémicas (1-3 años). Identifica al menos 2 stakeholders indirectos que serán afectados.</li>
          <li>Identifica el punto de mayor apalancamiento en tu trabajo actual preguntándote: &#39;¿Qué pequeño cambio podría generar el mayor impacto positivo en el sistema completo?&#39; Diseña un experimento de 30 días para testear esta hipótesis.</li>
          <li>Implementa &#39;pensamiento en escenarios&#39; para tu próxima decisión importante: define 3 futuros posibles (optimista, realista, pesimista) y diseña tu estrategia para que funcione razonablemente bien en los tres casos.</li>
        </ul>
      </div>

      {/* Preguntas de Reflexión */}
      <div className={styles.reflectionQuestions}>
        <h4>🤔 Preguntas de Reflexión</h4>
        <ol>
          <li>¿Qué decisión reciente tomaste optimizando para métricas inmediatas? ¿Qué consecuencias de segundo orden están emergiendo ahora que no anticipaste?</li>
          <li>¿Cuáles son las dependencias ocultas en tu organización que podrían convertirse en puntos de falla sistémica?</li>
          <li>¿Cómo cambiaría tu enfoque de liderazgo si consideraras que cada decisión genera ondas que impactarán a personas que ni siquiera conoces?</li>
        </ol>
      </div>

      {/* Curiosidad */}
      <div className={styles.curiosityBox}>
        <h4>💡 ¿Sabías que...?</h4>
        <p>
          Un análisis de Harvard Business Review de 2024 reveló que las empresas que incorporan &#39;mapeo de consecuencias sistémicas&#39; en sus procesos de decisión reducen en 43% los costos de corrección de errores estratégicos. Paradójicamente, también toman decisiones 23% más rápido, porque invierten más tiempo en entender el problema y menos tiempo corrigiendo soluciones mal diseñadas.
        </p>
      </div>
    </ChapterPage>
  );
}
