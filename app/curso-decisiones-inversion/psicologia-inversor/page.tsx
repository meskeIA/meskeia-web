'use client';

import ChapterPage from '../ChapterPage';
import styles from '../CursoInversion.module.css';

const sections = [
  {
    title: 'El Factor Humano en las Inversiones',
    icon: '🧠',
    content: (
      <>
        <p>La <strong>psicología del inversor</strong> es frecuentemente el factor más determinante del éxito o fracaso. Los mercados no son solo números; son emociones colectivas de millones de personas.</p>

        <div className={styles.highlightBox}>
          <p><strong>📊 Dato revelador:</strong> El fondo Magellan de Peter Lynch promedió un 29% anual durante 13 años. Sin embargo, el inversor promedio del fondo PERDIÓ dinero porque compraba después de subidas y vendía después de caídas.</p>
        </div>

        <p>La diferencia entre rentabilidad del fondo y rentabilidad del inversor se llama <strong>"behavior gap"</strong> y puede ser de 3-4% anual.</p>
      </>
    ),
  },
  {
    title: 'Sesgos Cognitivos Comunes',
    icon: '🎭',
    content: (
      <>
        <p>Nuestro cerebro tiene atajos mentales que fueron útiles para sobrevivir, pero son perjudiciales para invertir.</p>

        <div className={styles.exampleGrid}>
          <div className={styles.exampleCard}>
            <div className={styles.exampleLogo}>📉</div>
            <div className={styles.exampleName}>Aversión a las pérdidas</div>
            <div className={styles.exampleDesc}>
              Perder 100€ duele el doble de lo que alegra ganar 100€. Esto nos hace mantener perdedores y vender ganadores demasiado pronto.
            </div>
          </div>
          <div className={styles.exampleCard}>
            <div className={styles.exampleLogo}>🔮</div>
            <div className={styles.exampleName}>Sesgo de confirmación</div>
            <div className={styles.exampleDesc}>
              Buscamos información que confirme nuestras creencias e ignoramos la que las contradice. "Mi acción va a subir porque lo dice este analista."
            </div>
          </div>
        </div>

        <div className={styles.exampleGrid}>
          <div className={styles.exampleCard}>
            <div className={styles.exampleLogo}>📊</div>
            <div className={styles.exampleName}>Sesgo de recencia</div>
            <div className={styles.exampleDesc}>
              Damos más peso a eventos recientes. Si el mercado lleva subiendo 2 años, asumimos que seguirá subiendo siempre.
            </div>
          </div>
          <div className={styles.exampleCard}>
            <div className={styles.exampleLogo}>🎯</div>
            <div className={styles.exampleName}>Exceso de confianza</div>
            <div className={styles.exampleDesc}>
              Creemos que somos mejores que el promedio seleccionando acciones. El 80% de conductores cree conducir mejor que la media.
            </div>
          </div>
        </div>

        <div className={styles.exampleGrid}>
          <div className={styles.exampleCard}>
            <div className={styles.exampleLogo}>👥</div>
            <div className={styles.exampleName}>Efecto manada (Herding)</div>
            <div className={styles.exampleDesc}>
              Seguimos a la mayoría. Si todos compran Bitcoin, debe ser buena inversión, ¿no? (Spoiler: no necesariamente)
            </div>
          </div>
          <div className={styles.exampleCard}>
            <div className={styles.exampleLogo}>⚓</div>
            <div className={styles.exampleName}>Anclaje</div>
            <div className={styles.exampleDesc}>
              Nos "anclamos" a un precio. "Compré a 100€, no vendo hasta que vuelva a 100€", aunque los fundamentales hayan cambiado.
            </div>
          </div>
        </div>
      </>
    ),
  },
  {
    title: 'FOMO y Pánico: Los Enemigos',
    icon: '😱',
    content: (
      <>
        <h3>FOMO (Fear Of Missing Out)</h3>
        <p>El miedo a perderse una oportunidad nos lleva a:</p>
        <ul>
          <li>Comprar después de grandes subidas (comprar caro)</li>
          <li>Invertir en activos que no entendemos</li>
          <li>Abandonar nuestra estrategia por "la nueva moda"</li>
          <li>Asumir más riesgo del que podemos soportar</li>
        </ul>

        <h3>Pánico (Fear)</h3>
        <p>El miedo durante las caídas nos lleva a:</p>
        <ul>
          <li>Vender en mínimos (vender barato)</li>
          <li>Abandonar el mercado justo antes de la recuperación</li>
          <li>Convertir pérdidas temporales en permanentes</li>
          <li>Perder las mejores sesiones del mercado</li>
        </ul>

        <div className={styles.warningBox}>
          <p><strong>⚠️ Dato crítico:</strong> Si te pierdes los 10 mejores días de bolsa en 20 años, tu rentabilidad se reduce a la mitad. Esos días suelen ocurrir justo después de grandes caídas, cuando muchos han vendido en pánico.</p>
        </div>

        <div className={styles.highlightBox}>
          <p><strong>📌 Regla de oro:</strong> "Sé codicioso cuando otros tienen miedo, y temeroso cuando otros son codiciosos." - Warren Buffett</p>
        </div>
      </>
    ),
  },
  {
    title: 'Ciclos Emocionales del Mercado',
    icon: '🎢',
    content: (
      <>
        <p>Los mercados siguen ciclos emocionales predecibles:</p>

        <ol>
          <li><strong>Optimismo:</strong> "Las cosas van bien, voy a invertir"</li>
          <li><strong>Excitación:</strong> "Esto es fácil, voy a ganar mucho"</li>
          <li><strong>Euforia:</strong> "¡Soy un genio! Voy a meter más dinero" (PELIGRO: punto máximo)</li>
          <li><strong>Ansiedad:</strong> "Es solo una corrección temporal"</li>
          <li><strong>Negación:</strong> "Ya se recuperará, mantengo"</li>
          <li><strong>Miedo:</strong> "¿Y si pierdo todo?"</li>
          <li><strong>Desesperación:</strong> "Nunca debí invertir"</li>
          <li><strong>Pánico:</strong> "¡Vendo todo!" (OPORTUNIDAD: cerca del mínimo)</li>
          <li><strong>Capitulación:</strong> "Nunca más volveré a invertir"</li>
          <li><strong>Depresión:</strong> "Soy un fracasado"</li>
          <li><strong>Esperanza:</strong> "Quizás las cosas mejoren"</li>
          <li><strong>Alivio:</strong> "Menos mal que no vendí todo"</li>
          <li><strong>Optimismo:</strong> Y el ciclo se repite...</li>
        </ol>

        <div className={styles.infoBox}>
          <p><strong>💡 La clave:</strong> El mejor momento para comprar (punto 8-10) es exactamente cuando menos ganas tienes de hacerlo. El peor momento para comprar (punto 3) es cuando más seguro te sientes.</p>
        </div>
      </>
    ),
  },
  {
    title: 'Desarrollando Disciplina',
    icon: '🎯',
    content: (
      <>
        <p>La disciplina se puede entrenar. Aquí tienes estrategias prácticas:</p>

        <h3>1. Plan de inversión por escrito</h3>
        <p>Documenta ANTES de invertir:</p>
        <ul>
          <li>Por qué compras este activo</li>
          <li>Cuánto tiempo planeas mantenerlo</li>
          <li>En qué circunstancias venderías</li>
          <li>Qué porcentaje de tu cartera representa</li>
        </ul>

        <h3>2. Automatiza todo lo posible</h3>
        <ul>
          <li>Aportaciones automáticas mensuales</li>
          <li>Rebalanceo automático (si tu broker lo permite)</li>
          <li>No mires la cartera más de una vez al mes</li>
        </ul>

        <h3>3. El "filtro de las 24 horas"</h3>
        <p>Antes de cualquier operación impulsiva, espera 24 horas. La mayoría de decisiones emocionales no pasarán este filtro.</p>

        <h3>4. Lleva un diario de inversiones</h3>
        <p>Registra cada decisión y las emociones que sentías. Aprenderás de tus patrones.</p>

        <div className={styles.highlightBox}>
          <p><strong>📌 Recuerda:</strong> El éxito en inversiones es 80% comportamiento y 20% conocimiento. Puedes saber todo sobre el mercado y aun así fracasar si no controlas tus emociones.</p>
        </div>
      </>
    ),
  },
  {
    title: 'Errores Comunes a Evitar',
    icon: '🚫',
    content: (
      <>
        <h3>Los 10 errores más costosos</h3>
        <ol>
          <li><strong>No empezar:</strong> El mayor riesgo es no invertir y perder poder adquisitivo</li>
          <li><strong>Esperar el "momento perfecto":</strong> Time in the market &gt; Timing the market</li>
          <li><strong>Vender en pánico:</strong> Convierte pérdidas temporales en permanentes</li>
          <li><strong>Comprar en euforia:</strong> FOMO + precios inflados = desastre</li>
          <li><strong>No diversificar:</strong> Todo en una acción, sector o país</li>
          <li><strong>Ignorar las comisiones:</strong> 1% anual extra puede costar 100.000€ en 30 años</li>
          <li><strong>Perseguir rentabilidades pasadas:</strong> "Este fondo subió 50% el año pasado"</li>
          <li><strong>Invertir dinero que necesitas:</strong> Te forzará a vender en mal momento</li>
          <li><strong>Operar demasiado:</strong> Cada operación tiene costes y riesgo de error</li>
          <li><strong>No tener paciencia:</strong> La magia del interés compuesto necesita tiempo</li>
        </ol>

        <div className={styles.infoBox}>
          <p><strong>💡 Consejo final:</strong> La inversión aburrida suele ser la más rentable. Compra, mantén, rebalancea, repite. No necesitas acción constante para ganar dinero.</p>
        </div>
      </>
    ),
  },
];

export default function PsicologiaInversorPage() {
  return <ChapterPage slug="psicologia-inversor" sections={sections} />;
}
