'use client';

import { LegalNotice } from '@/components';
import ChapterPage from '../ChapterPage';
import styles from '../CursoInversion.module.css';

const sections = [
  {
    title: 'La Importancia del Mantenimiento',
    icon: '🔧',
    content: (
      <>
        <p>Una vez construida tu cartera, el trabajo no termina. El <strong>mantenimiento</strong> adecuado es lo que diferencia a los inversores exitosos de los que abandonan en el camino.</p>

        <div className={styles.infoBox}>
          <p><strong>💡 Paradoja del inversor:</strong> Cuanto menos "toques" tu cartera, mejor suele irte. El mantenimiento óptimo es mínimo pero consistente. No confundas actividad con progreso.</p>
        </div>

        <h3>¿Qué implica el mantenimiento?</h3>
        <ul>
          <li>Rebalanceo periódico de la cartera</li>
          <li>Revisión de la estrategia (anual)</li>
          <li>Seguimiento de comisiones y costes</li>
          <li>Ajustes por cambios vitales importantes</li>
          <li>Gestión fiscal eficiente</li>
        </ul>
      </>
    ),
  },
  {
    title: 'Rebalanceo en la Práctica',
    icon: '⚖️',
    content: (
      <>
        <p>El <strong>rebalanceo</strong> devuelve tu cartera a las proporciones objetivo cuando se han desviado por los movimientos del mercado.</p>

        <h3>Ejemplo práctico</h3>
        <table className={styles.comparisonTable}>
          <thead>
            <tr>
              <th>Activo</th>
              <th>Objetivo</th>
              <th>Actual</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>RV Global</td>
              <td>60%</td>
              <td>68% (+8%)</td>
              <td>Vender/reducir aportes</td>
            </tr>
            <tr>
              <td>RF Euro</td>
              <td>30%</td>
              <td>24% (-6%)</td>
              <td>Comprar/aumentar aportes</td>
            </tr>
            <tr>
              <td>Efectivo</td>
              <td>10%</td>
              <td>8% (-2%)</td>
              <td>Aumentar ligeramente</td>
            </tr>
          </tbody>
        </table>

        <h3>Métodos de rebalanceo</h3>
        <div className={styles.exampleGrid}>
          <div className={styles.exampleCard}>
            <div className={styles.exampleLogo}>📅</div>
            <div className={styles.exampleName}>Por calendario</div>
            <div className={styles.exampleDesc}>
              Rebalanceas cada 6 o 12 meses, sea cual sea la desviación.<br />
              <strong>Ventaja:</strong> Simple, predecible<br />
              <strong>Uso:</strong> Ideal para la mayoría
            </div>
          </div>
          <div className={styles.exampleCard}>
            <div className={styles.exampleLogo}>📊</div>
            <div className={styles.exampleName}>Por bandas</div>
            <div className={styles.exampleDesc}>
              Rebalanceas cuando un activo se desvía ±5% del objetivo.<br />
              <strong>Ventaja:</strong> Solo cuando es necesario<br />
              <strong>Uso:</strong> Para carteras grandes
            </div>
          </div>
        </div>

        <h3>Rebalanceo sin vender (España-friendly)</h3>
        <p>Para evitar tributar por las ventas:</p>
        <ol>
          <li>Dirige las nuevas aportaciones al activo infraponderado</li>
          <li>Usa los dividendos/cupones para comprar lo que falta</li>
          <li>Solo vende si la desviación es muy grande (&gt;10%)</li>
        </ol>

        <div className={styles.highlightBox}>
          <p><strong>📌 Tip fiscal:</strong> Si usas fondos de inversión en España, puedes rebalancear mediante traspasos sin tributar. Esta es una gran ventaja sobre los ETFs.</p>
        </div>
      </>
    ),
  },
  {
    title: 'Revisión Anual de la Cartera',
    icon: '📋',
    content: (
      <>
        <p>Una vez al año (por ejemplo, en enero), dedica 1-2 horas a revisar tu cartera en profundidad.</p>

        <h3>Checklist de revisión anual</h3>
        <ol>
          <li><strong>Rendimiento:</strong> ¿Cómo fue respecto al benchmark? (No te obsesiones)</li>
          <li><strong>Asset allocation:</strong> ¿Se mantiene según tu plan?</li>
          <li><strong>Costes:</strong> ¿Han cambiado las comisiones de tus fondos/ETFs?</li>
          <li><strong>Alternativas:</strong> ¿Han aparecido productos mejores/más baratos?</li>
          <li><strong>Situación personal:</strong> ¿Ha cambiado algo importante en tu vida?</li>
          <li><strong>Horizonte:</strong> ¿Necesitas ajustar el riesgo? (Te acercas a un objetivo)</li>
          <li><strong>Fiscalidad:</strong> ¿Hay pérdidas que compensar antes de fin de año?</li>
        </ol>

        <h3>Señales de que debes ajustar</h3>
        <ul>
          <li>Cambio importante en ingresos o gastos</li>
          <li>Nuevo objetivo financiero (casa, hijos, negocio)</li>
          <li>Cambio en horizonte temporal</li>
          <li>Descubres que no toleras bien las caídas</li>
          <li>Un producto concreto ha cambiado significativamente</li>
        </ul>

        <div className={styles.warningBox}>
          <p><strong>⚠️ Lo que NO es señal para cambiar:</strong> Que el mercado haya subido o bajado, que un gurú prediga una crisis, que tu cuñado te recomiende una acción, o que leas un artículo alarmista.</p>
        </div>
      </>
    ),
  },
  {
    title: 'Cuándo Vender (y Cuándo No)',
    icon: '🚪',
    content: (
      <>
        <p>Saber cuándo vender es tan importante como saber cuándo comprar. La mayoría de errores ocurren por vender en el momento equivocado.</p>

        <h3>Razones VÁLIDAS para vender</h3>
        <ul>
          <li><strong>Necesitas el dinero:</strong> Para el objetivo previsto (jubilación, casa...)</li>
          <li><strong>Rebalanceo:</strong> Para mantener tu asset allocation</li>
          <li><strong>Cambio de estrategia meditado:</strong> Tras análisis racional, no emocional</li>
          <li><strong>Optimización fiscal:</strong> Realizar pérdidas para compensar ganancias</li>
          <li><strong>El producto cambió:</strong> Subió comisiones, cambió política, etc.</li>
        </ul>

        <h3>Razones INVÁLIDAS para vender</h3>
        <ul>
          <li>❌ "El mercado está cayendo" (el mejor momento para comprar)</li>
          <li>❌ "Ha subido mucho, mejor asegurar" (sin datos sobre sobrevaloración)</li>
          <li>❌ "Un experto dice que viene una crisis"</li>
          <li>❌ "Todos mis amigos están vendiendo"</li>
          <li>❌ "Tengo miedo" (las emociones no son estrategia)</li>
        </ul>

        <div className={styles.highlightBox}>
          <p><strong>📌 Regla práctica:</strong> Antes de vender, espera 48 horas y pregúntate: "Si no tuviera esta posición, ¿la compraría hoy a este precio?". Si la respuesta es "sí" o "no lo sé", probablemente no deberías vender.</p>
        </div>
      </>
    ),
  },
  {
    title: 'Seguimiento y Herramientas',
    icon: '📱',
    content: (
      <>
        <p>No necesitas revisar tu cartera cada día. De hecho, es contraproducente. Pero sí necesitas un sistema para hacer seguimiento.</p>

        <h3>Frecuencia recomendada</h3>
        <table className={styles.comparisonTable}>
          <thead>
            <tr>
              <th>Actividad</th>
              <th>Frecuencia</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Comprobar que se ejecutan las aportaciones</td>
              <td>Mensual</td>
            </tr>
            <tr>
              <td>Revisar composición general</td>
              <td>Trimestral</td>
            </tr>
            <tr>
              <td>Rebalanceo (si es necesario)</td>
              <td>Semestral/Anual</td>
            </tr>
            <tr>
              <td>Revisión estratégica profunda</td>
              <td>Anual</td>
            </tr>
            <tr>
              <td>Actualizar plan de inversión</td>
              <td>Cuando haya cambios vitales</td>
            </tr>
          </tbody>
        </table>

        <h3>Herramientas útiles</h3>
        <ul>
          <li><strong>Excel/Google Sheets:</strong> Lo más simple y personalizable</li>
          <li><strong>Portfolio Performance (gratis):</strong> Software open source muy completo</li>
          <li><strong>Morningstar X-Ray:</strong> Para analizar la composición real de tus fondos</li>
          <li><strong>Backtest Portfolio:</strong> Para simular carteras históricamente</li>
        </ul>

        <div className={styles.infoBox}>
          <p><strong>💡 Consejo:</strong> Evita las apps que te envían notificaciones de movimientos del mercado. Cada notificación es una tentación para actuar emocionalmente. La ignorancia selectiva es una virtud en inversión.</p>
        </div>
      </>
    ),
  },
  {
    title: 'Planificación del Rescate',
    icon: '🎯',
    content: (
      <>
        <p>Cuando te acerques a tu objetivo (jubilación, compra de casa...), necesitas un plan de "aterrizaje".</p>

        <h3>Estrategia de "glide path"</h3>
        <p>Reduce gradualmente el riesgo a medida que te acercas al momento de usar el dinero:</p>
        <ul>
          <li>5 años antes: Empieza a reducir RV</li>
          <li>3 años antes: Acelera la reducción</li>
          <li>1 año antes: Mayoría en RF/efectivo</li>
        </ul>

        <h3>Planificación fiscal del rescate</h3>
        <ol>
          <li><strong>Distribuye en varios años:</strong> No rescates todo de golpe para no disparar el tipo marginal</li>
          <li><strong>Usa las pérdidas:</strong> Vende primero posiciones con pérdidas para compensar</li>
          <li><strong>Planifica con antelación:</strong> Los años previos a la jubilación suelen tener menores ingresos = menor tipo</li>
          <li><strong>Combina fuentes:</strong> Mezcla rescates de fondos, ETFs y planes de pensiones para optimizar</li>
        </ol>

        <div className={styles.highlightBox}>
          <p><strong>📊 Ejemplo de planificación:</strong><br /><br />
          Objetivo: Necesitas 200.000€ para jubilación en 5 años<br />
          Cartera actual: 250.000€ (80% RV / 20% RF)<br /><br />
          <strong>Plan:</strong><br />
          Año 1: Reducir a 65% RV<br />
          Año 2: Reducir a 50% RV<br />
          Año 3: Reducir a 35% RV<br />
          Año 4: Reducir a 20% RV<br />
          Año 5: 10% RV / 90% RF-efectivo<br /><br />
          Así, una caída del 30% en el último año solo afectaría al 10% de la cartera.</p>
        </div>
      </>
    ),
  },
  {
    title: 'Resumen y Próximos Pasos',
    icon: '🎓',
    content: (
      <>
        <p>Has completado los 10 capítulos del curso. Aquí tienes un resumen de las claves:</p>

        <h3>Los 10 mandamientos del inversor a largo plazo</h3>
        <ol>
          <li><strong>Empieza cuanto antes:</strong> El tiempo es tu mayor aliado</li>
          <li><strong>Invierte regularmente:</strong> DCA elimina el market timing</li>
          <li><strong>Diversifica:</strong> No pongas todos los huevos en una cesta</li>
          <li><strong>Mantén los costes bajos:</strong> Las comisiones son el enemigo silencioso</li>
          <li><strong>Ignora el ruido:</strong> Los medios viven del miedo y la euforia</li>
          <li><strong>No vendas en pánico:</strong> Las crisis son temporales, vender es permanente</li>
          <li><strong>Rebalancea:</strong> Mantén tu perfil de riesgo constante</li>
          <li><strong>Ten paciencia:</strong> La riqueza se construye en décadas, no meses</li>
          <li><strong>Sigue aprendiendo:</strong> Pero no confundas información con sabiduría</li>
          <li><strong>Disfruta el camino:</strong> Invertir bien te da libertad, no ansiedad</li>
        </ol>

        <h3>Tus próximos pasos</h3>
        <ol>
          <li>Completa el test de perfil de riesgo (cuando esté disponible)</li>
          <li>Define tu asset allocation según tu perfil</li>
          <li>Elige los productos concretos (fondos indexados/ETFs)</li>
          <li>Abre cuenta en un broker adecuado</li>
          <li>Configura aportaciones automáticas</li>
          <li>Documenta tu plan y ¡olvídate del ruido!</li>
        </ol>

        <div className={styles.highlightBox}>
          <p><strong>🎉 Felicidades:</strong> Has dado el paso más importante: educarte. La mayoría de personas nunca llega hasta aquí. Ahora tienes las herramientas para tomar decisiones de inversión informadas. ¡Úsalas!</p>
        </div>
      </>
    ),
  },
];

export default function MantenimientoCarteraPage() {
  return <ChapterPage slug="mantenimiento-cartera" sections={sections} />;
}
