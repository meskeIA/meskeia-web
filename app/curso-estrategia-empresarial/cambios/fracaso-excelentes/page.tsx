'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../CursoEstrategiaEmpresarial.module.css';

export default function FracasoExcelentesPage() {
  return (
    <ChapterPage chapterId="fracaso-excelentes">
      <div className={styles.chapterContent}>
        {/* Introducción */}
        <section className={styles.introSection}>
          <p className={styles.introText}>
            En 1982, Tom Peters y Robert Waterman publicaron 'In Search of Excellence', identificando 43 empresas como modelos de excelencia empresarial. Su mensaje era claro: seguir estos principios garantizaba el éxito duradero. Cuarenta años después, más de dos tercios de esas empresas han fracasado, perdido relevancia o sido adquiridas en situaciones desesperadas. No es mala suerte: es la prueba de que la 'excelencia' de ayer puede ser la trampa mortal de mañana. Si diriges una empresa o tomas decisiones estratégicas, entender por qué fracasaron estas 'excelentes' es más valioso que estudiar cualquier caso de éxito actual.
          </p>
        </section>

        {/* Secciones de contenido */}

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>El mito de 'In Search of Excellence': cuando la receta se convierte en veneno</h2>
          <div className={styles.sectionContent}>
            <p>Peters y Waterman identificaron ocho principios de excelencia: sesgo hacia la acción, cercanía al cliente, autonomía empresarial, productividad a través de las personas, valores compartidos, centrarse en lo que se sabe hacer, estructura simple y control flexible. Sonaba perfecto. El problema es que convirtieron estas características en dogma. Las empresas 'excelentes' se volvieron prisioneras de sus propias recetas de éxito. Cuando el entorno cambió, siguieron aplicando las mismas fórmulas que las habían llevado al éxito. La excelencia se convirtió en rigidez. Los valores compartidos se volvieron pensamiento grupal. Centrarse en lo que sabían hacer se transformó en ceguera ante nuevas oportunidades. El sesgo hacia la acción se convirtió en resistencia a cuestionar los fundamentos del negocio.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Atari, una de las empresas 'excelentes', dominaba los videojuegos con su enfoque en la innovación rápida y la cultura informal. Pero cuando Nintendo cambió las reglas del juego con control de calidad estricto y licencias exclusivas, Atari siguió lanzando juegos mediocres esperando que su marca fuera suficiente. Su 'excelencia' en innovación rápida se había convertido en una incapacidad para entender que el mercado ahora valoraba la calidad sobre la velocidad.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Kodak: cuando inventar el futuro no es suficiente</h2>
          <div className={styles.sectionContent}>
            <p>Kodak inventó la cámara digital en 1975. Steve Sasson, su ingeniero, creó un prototipo que capturaba imágenes en 0.01 megapíxeles. La dirección lo vio y decidió no comercializarlo. ¿Por qué? Porque cada cámara digital vendida era una que no compraba película, y la película generaba el 70% de sus beneficios con márgenes del 60%. Kodak no fracasó por falta de innovación o visión tecnológica. Fracasó porque su modelo de negocio era tan rentable que cualquier alternativa parecía una mala idea. Tenían todos los recursos, el conocimiento y la capacidad para liderar la revolución digital. Pero eligieron proteger el presente en lugar de crear el futuro. Cuando finalmente quisieron reaccionar, ya era demasiado tarde: Canon, Sony y otros habían ocupado el espacio que Kodak había abandonado voluntariamente.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>En 2003, Kodak vendía 670 millones de rollos de película al año. En 2010, vendía menos de 20 millones. Durante esos siete años, lanzaron varias cámaras digitales competitivas, pero nunca con la convicción de canibalizarse completamente. Seguían esperando que la fotografía digital fuera 'complementaria' a la película, no su reemplazo total.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Nokia: de 50% del mercado a irrelevante en cinco años</h2>
          <div className={styles.sectionContent}>
            <p>En 2007, Nokia controlaba el 50% del mercado mundial de móviles. Sus teléfonos eran sinónimo de calidad, durabilidad y cobertura global. Cuando Steve Jobs presentó el iPhone, el CEO de Nokia, Olli-Pekka Kallasvuo, declaró que Apple no entendía el mercado móvil. Nokia tenía razón en muchas cosas: el iPhone era caro, la batería duraba poco, y no tenía teclado físico. Pero se equivocaron en lo fundamental: el mercado no quería un teléfono mejor, quería un ordenador de bolsillo. Nokia siguió optimizando teléfonos mientras Apple redefinía la categoría. Su sistema operativo Symbian era técnicamente superior al iOS inicial, pero era un sistema para teléfonos, no para dispositivos inteligentes. Cuando quisieron reaccionar con Windows Phone, ya habían perdido a los desarrolladores, los operadores y los consumidores. La velocidad del cambio fue brutal: de líderes absolutos a irrelevantes en menos de cinco años.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>En 2010, Nokia vendía 1.2 millones de teléfonos al día. En 2013, Microsoft compró su división móvil por 7.200 millones de euros, una fracción de lo que valía seis años antes. El problema no fue tecnológico: Nokia tenía pantallas táctiles, internet móvil y aplicaciones antes que Apple. El problema fue conceptual: no entendieron que estaban en el negocio de los ordenadores, no de los teléfonos.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Blockbuster vs. Netflix: la ceguera estratégica del líder</h2>
          <div className={styles.sectionContent}>
            <p>En 2000, Reed Hastings, CEO de Netflix, voló a Dallas para reunirse con John Antioco, CEO de Blockbuster. La propuesta era simple: Netflix se encargaría del negocio online de Blockbuster a cambio de promoción en las tiendas físicas. Antioco y su equipo se rieron de la propuesta. Netflix perdía dinero, tenía menos de 300.000 suscriptores y su modelo de 'DVD por correo' parecía un nicho irrelevante. Blockbuster tenía 9.000 tiendas, 84 millones de clientes y generaba 6.000 millones de dólares anuales. ¿Por qué iban a necesitar a Netflix? La ceguera de Blockbuster no fue no ver el streaming (que llegó años después), sino no entender que los clientes odiaban las penalizaciones por retraso, los desplazamientos a la tienda y la limitación de stock. Netflix resolvía estos problemas reales, no vendía tecnología. Cuando Blockbuster finalmente lanzó su servicio online, ya era demasiado tarde: Netflix había construido la infraestructura, los algoritmos y la marca que los convertirían en el gigante del entretenimiento global.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>En 2004, Blockbuster ganaba 800 millones de dólares anuales solo en penalizaciones por retraso. Representaban el 16% de sus ingresos totales. Su modelo de negocio dependía de castigar a los clientes, mientras Netflix los premiaba con 'sin penalizaciones, sin fechas de devolución'. Blockbuster no podía copiar a Netflix sin destruir su fuente principal de beneficios.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Lecciones para no repetir errores: la estrategia en la era de la disrupción continua</h2>
          <div className={styles.sectionContent}>
            <p>Estas empresas no fracasaron por incompetencia o mala suerte. Fracasaron por seguir las reglas del juego anterior cuando las reglas habían cambiado. La lección no es que la planificación estratégica sea inútil, sino que debe ser radicalmente diferente. Primero, asume que tu modelo de negocio actual tiene fecha de caducidad. Segundo, tus fortalezas actuales pueden convertirse en debilidades si el contexto cambia. Tercero, los competidores más peligrosos no vienen de tu industria, vienen de fuera con reglas diferentes. Cuarto, la velocidad de cambio se ha acelerado: lo que antes tardaba décadas ahora sucede en años o meses. Quinto, es mejor canibalizarte a ti mismo que esperar a que otros lo hagan. La estrategia en 2025 no es encontrar una posición defendible, sino desarrollar la capacidad de reinventarse continuamente antes de que sea necesario.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Amazon lleva 30 años canibalizándose sistemáticamente: de librería online a marketplace, de marketplace a cloud computing, de cloud a inteligencia artificial. Jeff Bezos institucionalizó la filosofía 'Day 1': actuar siempre como si fueras una startup, incluso cuando eres la empresa más valiosa del mundo. Su regla es simple: si no te disrumpes tú, alguien más lo hará.</p>
          </div>
        </section>


        {/* Ideas Clave */}
        <section className={styles.keyIdeasSection}>
          <h2 className={styles.sectionTitle}>💡 Ideas Clave</h2>
          <ul className={styles.keyIdeasList}>
            <li>Las empresas 'excelentes' fracasaron porque sus fortalezas se convirtieron en rigideces cuando cambió el entorno</li>
            <li>Tener la tecnología correcta no es suficiente si tu modelo de negocio te impide usarla</li>
            <li>Los competidores más peligrosos redefinen la categoría en lugar de competir en las reglas existentes</li>
            <li>La velocidad del cambio se ha acelerado: disrupciones que antes tardaban décadas ahora suceden en años</li>
            <li>Es mejor canibalizarse a uno mismo que esperar a que otros lo hagan</li>
          </ul>
        </section>

        {/* Acciones Prácticas */}
        <section className={styles.actionSection}>
          <h2 className={styles.sectionTitle}>🎯 Acciones para Implementar</h2>
          <div className={styles.actionGrid}>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>1</span>
              <p>Identifica qué porcentaje de tus ingresos depende de un modelo que podría ser disruptido por IA o tecnología digital</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>2</span>
              <p>Lista tres startups o empresas de otros sectores que podrían redefinir tu categoría en los próximos dos años</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>3</span>
              <p>Pregunta a tus clientes qué problemas tienen que tu empresa no está resolviendo (aunque no sean tu 'core business')</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>4</span>
              <p>Dedica un 10% de recursos a experimentar con modelos de negocio que canibalicen tu negocio actual</p>
            </div>
          </div>
        </section>

        {/* Preguntas de Reflexión */}
        <section className={styles.reflectionSection}>
          <h2 className={styles.sectionTitle}>🤔 Para Reflexionar</h2>
          <div className={styles.reflectionCards}>
            <div className={styles.reflectionCard}>
              <p>¿Qué creencias sobre tu industria podrían estar cegándote ante cambios fundamentales?</p>
            </div>
            <div className={styles.reflectionCard}>
              <p>¿Cuáles de tus actuales fortalezas podrían convertirse en debilidades si cambian las reglas del juego?</p>
            </div>
            <div className={styles.reflectionCard}>
              <p>¿Qué harías si tuvieras que reinventar tu empresa desde cero para competir contigo mismo?</p>
            </div>
          </div>
        </section>

        {/* Curiosidad */}
        
        <section className={styles.curiositySection}>
          <div className={styles.curiosityBox}>
            <h3>🔍 ¿Sabías que...?</h3>
            <p>Netflix casi quiebra en 2007 cuando intentó separar su negocio de DVD del streaming en dos empresas diferentes (Qwikster para DVD). Los clientes se rebelaron y perdieron 800.000 suscriptores en un trimestre. Paradójicamente, este 'fracaso' los obligó a apostar todo al streaming, decisión que los convirtió en el gigante global que son hoy. A veces, los errores estratégicos te salvan de errores aún mayores.</p>
          </div>
        </section>
      </div>
    </ChapterPage>
  );
}
