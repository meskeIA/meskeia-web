'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../CursoPensamientoSistemico.module.css';

export default function HistoriaSistemasPage() {
  return (
    <ChapterPage chapterId="historia-sistemas">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🎯</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>
          ¿Por qué el algoritmo de TikTok sabe qué te gustará antes que tú mismo? ¿Cómo es que el precio del litio en Chile puede afectar el sueño de un ejecutivo de Tesla en California? Vivimos inmersos en una red invisible de conexiones que operan a velocidades y escalas que desafían nuestra comprensión lineal del mundo. El pensamiento sistémico no es solo una metodología: es una lente completamente nueva para ver la realidad. Mientras nuestro cerebro busca naturalmente causas simples y efectos directos, los sistemas que realmente importan —desde las criptomonedas hasta las migraciones climáticas— operan bajo reglas radicalmente diferentes. Esta no es solo teoría académica; es la diferencia entre navegar exitosamente la complejidad del siglo XXI o quedar atrapado en patrones obsoletos de pensamiento.
        </p>
      </section>

      {/* De la Fragmentación a la Interconexión: Orígenes del Pensamiento Sistémico */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🔄</span>
          <h2 className={styles.sectionTitleText}>De la Fragmentación a la Interconexión: Orígenes del Pensamiento Sistémico</h2>
        </div>
        <p>
          Durante décadas, abordamos los problemas como si fueran relojes suizos: desarmar, arreglar la pieza rota, volver a ensamblar. Esta mentalidad funcionó brillantemente para construir puentes y lanzar cohetes, pero fracasa estrepitosamente cuando se trata de entender por qué Zoom se convirtió en verbo durante la pandemia mientras otras plataformas de videoconferencia desaparecieron. El pensamiento sistémico nació de una crisis: científicos del MIT en los años 50 se dieron cuenta de que los métodos tradicionales no podían explicar comportamientos emergentes en sistemas complejos. Jay Forrester, pionero del campo, observó algo fascinante: en los sistemas complejos, las soluciones obvias frecuentemente empeoran el problema original. Esto no es filosofía abstracta. Spotify revolucionó la industria musical no porque tuviera mejor tecnología que sus competidores, sino porque entendió la música como un sistema de relaciones: artistas, oyentes, algoritmos, estados de ánimo, contextos sociales. Mientras iTunes vendía canciones individuales (pensamiento lineal), Spotify diseñó un ecosistema donde cada interacción alimenta el siguiente descubrimiento musical. El resultado: transformaron el consumo de música de una transacción en una experiencia sistémica continua. Esta diferencia fundamental es lo que separa a las organizaciones que prosperan de las que simplemente sobreviven. En América Latina, hemos visto esta transformación en tiempo real. Rappi no se limitó a ser una app de delivery; construyó un sistema donde restaurantes, repartidores, usuarios y tecnología co-evolucionan constantemente. Cada pedido modifica el algoritmo, cada nueva ciudad requiere adaptar el modelo, cada crisis (como la pandemia) revela nuevas capacidades del sistema. La complejidad dejó de ser el enemigo para convertirse en la ventaja competitiva.
        </p>

        <div className={styles.exampleBox}>
          <p>
            <strong>Ejemplo práctico:</strong> Cuando MercadoLibre lanzó MercadoPago en 2003, no estaban creando solo una pasarela de pagos. Identificaron que la desconfianza en las transacciones online era un problema sistémico: vendedores sin reputación, compradores sin protección, bancos tradicionales lentos para innovar. Su solución sistémica conectó reputación del vendedor + garantía de compra + facilidad de pago + logística integrada. Cada elemento refuerza los otros, creando lo que ahora llamamos un &#39;ecosystem moat&#39; - una ventaja competitiva que es sistémica, no solo tecnológica.
          </p>
        </div>
      </section>

      {/* Ideas Clave */}
      <div className={styles.keyIdeasList}>
        <h4>💡 Ideas Clave</h4>
        <ul>
          <li>En sistemas complejos, las soluciones intuitivas frecuentemente generan problemas más grandes en otra parte del sistema</li>
          <li>Los patrones de comportamiento emergen de la estructura del sistema, no de las intenciones individuales de sus componentes</li>
          <li>Los bucles de retroalimentación determinan si un sistema se autorrefuerza positivamente o se autodestruye</li>
          <li>La resistencia al cambio en organizaciones es sistémica: cambiar individuos sin cambiar estructuras genera frustración</li>
          <li>Los sistemas adaptativos exitosos balancean estabilidad (lo que preserva identidad) con flexibilidad (lo que permite evolución)</li>
          <li>Los puntos de apalancamiento más poderosos están en cambiar las reglas del juego, no en jugar mejor con las reglas existentes</li>
        </ul>
      </div>

      {/* Acciones Prácticas */}
      <div className={styles.practicalTip}>
        <h4>🎯 Acciones para Implementar</h4>
        <ul>
          <li>Esta semana, elige un problema recurrente en tu trabajo y dibuja un &#39;mapa de influencias&#39;: identifica 5 actores clave y traza las flechas de cómo cada uno influye en los otros. Busca los bucles cerrados.</li>
          <li>Analiza una decisión importante que hayas tomado en los últimos 6 meses: ¿qué efectos no anticipados generó? ¿En qué partes del &#39;sistema&#39; (familia, trabajo, salud) aparecieron consecuencias inesperadas?</li>
          <li>Experimenta con &#39;pausa sistémica&#39;: antes de tu próxima reunión importante, dedica 5 minutos a identificar qué quiere cada persona en la sala Y qué presiones sistémicas están enfrentando (metas de su área, política organizacional, incentivos personales).</li>
        </ul>
      </div>

      {/* Preguntas de Reflexión */}
      <div className={styles.reflectionQuestions}>
        <h4>🤔 Preguntas de Reflexión</h4>
        <ol>
          <li>¿Qué problema recurrente en mi vida profesional podría ser síntoma de un patrón sistémico más profundo que no estoy viendo?</li>
          <li>¿Cómo mis &#39;soluciones rápidas&#39; habituales podrían estar reforzando precisamente los problemas que quiero eliminar?</li>
          <li>Si yo fuera un &#39;nodo&#39; en el sistema de mi organización/familia, ¿qué tipo de información recibo, proceso y transmito? ¿Soy un amplificador de patrones positivos o negativos?</li>
        </ol>
      </div>

      {/* Curiosidad */}
      <div className={styles.curiosityBox}>
        <h4>💡 ¿Sabías que...?</h4>
        <p>
          Netflix descubrió algo contraintuitivo: cuando agregaron ratings de estrellas más precisos (permitiendo medias estrellas), la satisfacción del usuario DISMINUYÓ. El sistema de recomendación funcionaba mejor con información &#39;menos precisa&#39; pero más auténtica. A veces, más datos crean peores decisiones sistémicas.
        </p>
      </div>
    </ChapterPage>
  );
}
