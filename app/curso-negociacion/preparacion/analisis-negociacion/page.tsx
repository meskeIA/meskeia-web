'use client';

import { LegalNotice } from '@/components';
import ChapterPage from '../../ChapterPage';
import styles from '../../CursoNegociacion.module.css';

export default function AnalisisNegociacionPage() {
  return (
    <ChapterPage chapterId="analisis-negociacion">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📖</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>Imagínate entrando a una negociación sin conocer tu verdadero poder de maniobra, sin saber cuándo caminar hacia la puerta o qué resultados son realmente posibles. Sería como jugar poker sin mirar tus cartas. El análisis previo no es solo teoría académica: es la diferencia entre conseguir lo que necesitas y conformarte con las migajas. En el mundo empresarial hispanohablante de 2024, donde las relaciones personales siguen siendo clave pero los márgenes cada vez más ajustados, dominar estas herramientas de análisis te dará la confianza para negociar desde una posición de fuerza real, no imaginaria.</p>
      </section>

        {/* Sección 1: BATNA: Tu Seguro de Vida en Cualquier Negociación */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>📋</span>
            <h2 className={styles.sectionTitleText}>BATNA: Tu Seguro de Vida en Cualquier Negociación</h2>
          </div>

          <p>El BATNA (Best Alternative to a Negotiated Agreement) es tu mejor alternativa si la negociación actual fracasa. No es un plan B débil, sino tu fuente de poder real en la mesa. En el contexto latinoamericano, donde las relaciones personales a menudo influyen en las decisiones comerciales, muchos negociadores cometen el error de no desarrollar alternativas sólidas por temor a parecer desleales o confrontativos.</p>
          <p>Desarrollar tu BATNA requiere un análisis sistemático. Primero, identifica todas las alternativas posibles si esta negociación no prospera. Segundo, evalúa cuáles son más viables y atractivas. Tercero, invierte tiempo en mejorar tu mejor alternativa. Un BATNA fuerte no solo te protege, sino que también mejora tu posición negociadora actual.</p>
          <p>La clave está en la preparación activa. No basta con saber que tienes otras opciones; debes cultivarlas. Si estás negociando un contrato con un cliente importante, tu BATNA podría incluir otros clientes potenciales, diversificación de servicios o incluso alianzas estratégicas. El error más común es desarrollar el BATNA solo cuando la negociación va mal, pero entonces ya es tarde.</p>
          <p>En la cultura empresarial española y latinoamericana, comunicar sutilmente que tienes alternativas (sin amenazar) puede ser especialmente efectivo. La clave está en el equilibrio: mostrar que valoras la relación actual pero no dependes desesperadamente de ella.</p>

          <div className={styles.exampleBox}>
            <strong>Ejemplo práctico:</strong>
            <p>Carlos, director comercial de una empresa tecnológica mexicana, negocia la renovación de contrato con su cliente más grande, que representa el 40% de sus ingresos. Su BATNA incluía: tres prospectos calificados en Colombia y Chile que había estado cultivando, un nuevo producto que reduciría su dependencia de este cliente, y una posible alianza con un competidor. Durante la negociación, cuando el cliente presionó por una reducción del 30% en precios, Carlos pudo mantener firmeza porque sabía que su BATNA le generaría 70% de los ingresos perdidos en seis meses, con mejores márgenes.</p>
          </div>
        </section>

        {/* Sección 2: La Arquitectura de Precios: Reserva, Probable y Meta Ambiciosa */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>🎯</span>
            <h2 className={styles.sectionTitleText}>La Arquitectura de Precios: Reserva, Probable y Meta Ambiciosa</h2>
          </div>

          <p>Establecer tu estructura de precios es como construir un edificio: necesitas fundamentos sólidos (precio de reserva), un piso habitable (precio probable) y una terraza con vistas (meta ambiciosa). El precio de reserva es tu límite absoluto, el punto donde prefieres irte antes que aceptar. El precio probable es lo que esperas conseguir basándote en tu investigación del mercado y la contraparte. La meta ambiciosa es tu escenario ideal, pero alcanzable con buena ejecución.</p>
          <p>En mercados latinoamericanos donde el regateo es culturalmente aceptado, muchos negociadores cometen el error de empezar demasiado cerca de su precio probable, perdiendo espacio de maniobra. La investigación previa es crucial: analiza transacciones similares, condiciones del mercado, y la situación específica de tu contraparte.</p>
          <p>Tu precio de reserva debe basarse en tu BATNA, no en deseos o presiones emocionales. Si tu mejor alternativa te genera X valor, tu precio de reserva no puede ser menor. El precio probable surge del análisis de mercado y la situación específica. Tu meta ambiciosa debe ser optimista pero creíble; una propuesta absurda destruye tu credibilidad.</p>
          <p>La flexibilidad es clave. Estos precios no son estáticos; pueden ajustarse conforme obtienes nueva información durante la negociación. También recuerda que 'precio' no siempre es dinero: puede incluir términos de pago, servicios adicionales, exclusividades o valor a futuro.</p>

          <div className={styles.exampleBox}>
            <strong>Ejemplo práctico:</strong>
            <p>Ana, consultora independiente en Madrid, prepara una propuesta para asesorar la transformación digital de una empresa familiar. Su precio de reserva: €50,000 (basado en su BATNA de tres proyectos menores que sumarían esa cantidad). Precio probable: €75,000 (investigó que consultoras similares cobraban entre €70,000-€80,000 por proyectos comparables). Meta ambiciosa: €95,000 más bonus por resultados. Inició la negociación en €110,000, justificado por su especialización en empresas familiares, y cerró en €82,000 con cláusula de bonus, superando su expectativa probable.</p>
          </div>
        </section>

        {/* Sección 3: ZOPA: El Territorio Donde Nacen los Acuerdos */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>💡</span>
            <h2 className={styles.sectionTitleText}>ZOPA: El Territorio Donde Nacen los Acuerdos</h2>
          </div>

          <p>La Zona de Acuerdo Potencial (ZOPA) es el espacio donde tu rango de precios se solapa con el de tu contraparte. Si tu precio de reserva es menor al precio máximo que están dispuestos a pagar, existe ZOPA y el acuerdo es posible. Si no hay solapamiento, no importa cuánto negocies: no habrá acuerdo a menos que alguien cambie sus parámetros.</p>
          <p>El desafío es que rara vez conoces la ZOPA real al inicio. Debes inferirla a través de preguntas inteligentes, investigación previa y observación durante la negociación. En culturas como la española o colombiana, donde las conversaciones pueden ser más indirectas, descubrir los verdaderos límites de la contraparte requiere paciencia y habilidad para leer entre líneas.</p>
          <p>Identificar la ZOPA te ayuda a enfocar tus esfuerzos. Si sospechas que no existe, puedes trabajar en expandirla: añadiendo valor, cambiando términos no monetarios, o explorando necesidades subyacentes que no habías considerado. A veces la ZOPA aparece cuando reformulas el problema.</p>
          <p>Un error común es asumir que existe ZOPA cuando no la hay, perdiendo tiempo en negociaciones destinadas al fracaso. Otro error es no intentar expandir una ZOPA estrecha siendo creativos con la propuesta de valor. La ZOPA también es dinámica: puede cambiar conforme evolucionan las circunstancias o se revela nueva información.</p>

          <div className={styles.exampleBox}>
            <strong>Ejemplo práctico:</strong>
            <p>Roberto negocia la venta de su software a una cadena retail argentina. Su precio de reserva: US\$80,000. Inicialmente, el cliente indicó presupuesto máximo de US\$60,000 (sin ZOPA aparente). Explorando más, Roberto descubrió que el cliente valoraba altamente el soporte local y la implementación rápida. Reestructuró la oferta: US\$65,000 por el software base + US\$20,000 por soporte premium localizado durante el primer año. El cliente aceptó US\$78,000 total porque resolvía su verdadera preocupación operativa, creando ZOPA donde antes no existía.</p>
          </div>
        </section>

        {/* Sección 4: Árboles de Decisión: Navegando la Incertidumbre con Claridad */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>⚡</span>
            <h2 className={styles.sectionTitleText}>Árboles de Decisión: Navegando la Incertidumbre con Claridad</h2>
          </div>

          <p>Los árboles de decisión te permiten visualizar diferentes caminos de negociación y sus posibles resultados, especialmente útil cuando enfrentas múltiples opciones o escenarios inciertos. En lugar de negociar 'a ciegas', puedes mapear las decisiones clave y sus consecuencias probables, asignando valores y probabilidades a cada resultado.</p>
          <p>Empiezas identificando los puntos de decisión críticos: ¿acepto su primera oferta o contraofrezco? ¿revelo mi presupuesto real o mantengo ambigüedad? ¿incluyo servicios adicionales o me enfoco solo en precio? Cada decisión abre diferentes ramas de posibilidades. Luego asignas probabilidades realistas a cada resultado y valores a cada resultado final.</p>
          <p>Esta herramienta es especialmente valiosa en negociaciones complejas típicas del sector corporativo latinoamericano, donde múltiples stakeholders y factores culturales pueden influir en el resultado. Te ayuda a preparar respuestas para diferentes escenarios y identificar cuáles son las decisiones más críticas.</p>
          <p>La clave está en no sobrecomplificar. Un árbol con 50 ramas es inútil. Enfócate en las 3-4 decisiones más importantes y los escenarios más probables. También recuerda que es una herramienta de planificación, no un guión rígido. Durante la negociación real, mantén flexibilidad para adaptarte a información nueva.</p>

          <div className={styles.exampleBox}>
            <strong>Ejemplo práctico:</strong>
            <p>Lucía, gerente de adquisiciones de una empresa chilena, debe negociar un contrato crítico de suministros. Mapea tres decisiones clave: 1) ¿Revela urgencia por cierre rápido? (Sí: 70% probabilidad de cierre en una semana pero precio 15% más alto; No: 40% probabilidad de mejor precio pero riesgo de retrasos). 2) ¿Negocia volumen vs. precio? 3) ¿Incluye cláusulas de exclusividad? Su árbol mostró que la mejor estrategia era ocultar la urgencia, negociar primero volumen, y usar exclusividad como variable de intercambio final, resultando en ahorro proyectado de 12% vs. estrategia inicial.</p>
          </div>
        </section>

      {/* Ideas Clave */}
      <div className={styles.keyIdeasList}>
        <h4>💡 Ideas Clave</h4>
        <ul>
            <li>Tu BATNA determina tu verdadero poder negociador - invierte tiempo en desarrollarlo antes de sentarte a negociar</li>
            <li>La estructura de precios (reserva, probable, ambiciosa) te da confianza y flexibilidad durante la negociación</li>
            <li>Sin ZOPA no hay acuerdo posible - enfócate en descubrirla y expandirla creativamente</li>
            <li>Los árboles de decisión te preparan para múltiples escenarios sin crear rigidez excesiva</li>
            <li>El análisis previo no es tiempo perdido - es inversión que se multiplica en mejores resultados</li>
        </ul>
      </div>

      {/* Preguntas de Reflexión */}
      <div className={styles.reflectionQuestions}>
        <h4>🤔 Preguntas para Reflexionar</h4>
        <ol>
            <li>¿Cuál fue tu BATNA en tu última negociación importante y cómo influyó en tu confianza y resultados?</li>
            <li>¿Alguna vez has abandonado una negociación por no existir ZOPA, o te has conformado con acuerdos por debajo de tu precio de reserva?</li>
            <li>¿Qué herramientas usas actualmente para prepararte antes de negociaciones complejas y cómo podrías mejorar tu proceso de análisis?</li>
        </ol>
      </div>

      {/* Consejo Práctico */}
      <div className={styles.practicalTip}>
        <h4>🎯 Consejo Práctico</h4>
        <p>Antes de tu próxima negociación importante, dedica 30 minutos a escribir tu BATNA específico y tres acciones concretas para fortalecerlo. Esto transformará tu confianza en la mesa y tu disposición a caminar si es necesario.</p>
      </div>

      {/* Curiosidad */}
      <div className={styles.curiosityBox}>
        <h4>🔍 Dato Curioso</h4>
        <p>Estudios recientes muestran que los negociadores que dedican al menos 15 minutos a análisis previo usando estas herramientas obtienen resultados 23% mejores que quienes negocian 'sobre la marcha'. En culturas latinoamericanas, donde las relaciones personales son clave, combinar este análisis racional con inteligencia emocional genera los mejores resultados.</p>
      </div>
    </ChapterPage>
  );
}
