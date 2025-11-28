'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../CursoNutrisalud.module.css';

export default function TimingNutricionalPage() {
  const sections = [
    {
      title: 'El Cuándo Importa Tanto Como el Qué',
      icon: '⏰',
      content: (
        <>
          <p>
            Tu cuerpo no funciona igual a todas horas. Los <strong>ritmos
            circadianos</strong> afectan la producción de enzimas digestivas,
            sensibilidad a la insulina, metabolismo de grasas y hasta la
            absorción de nutrientes. Comer lo mismo a diferentes horas
            puede tener efectos metabólicos muy distintos.
          </p>
          <p>
            Entender estos ritmos permite optimizar cuándo comes cada tipo
            de nutriente para maximizar la energía, minimizar el almacenamiento
            de grasa y mejorar la recuperación muscular.
          </p>

          <div className={styles.highlightBox}>
            <p>
              <strong>🔬 Dato científico:</strong> La misma comida consumida por la
              mañana produce un pico de glucosa 20-30% menor que si se consume por
              la noche. La sensibilidad a la insulina es naturalmente mayor en las
              primeras horas del día.
            </p>
          </div>
        </>
      ),
    },
    {
      title: 'Ritmos Circadianos y Metabolismo',
      icon: '🌅',
      content: (
        <>
          <h3>Mañana (6:00 - 12:00)</h3>
          <ul>
            <li><strong>Cortisol alto:</strong> Naturalmente moviliza energía</li>
            <li><strong>Sensibilidad insulina máxima:</strong> Mejor momento para carbohidratos</li>
            <li><strong>Enzimas digestivas activas:</strong> Buena capacidad de procesamiento</li>
            <li><strong>Metabolismo elevado:</strong> Mayor gasto calórico</li>
          </ul>

          <h3>Mediodía (12:00 - 15:00)</h3>
          <ul>
            <li><strong>Capacidad digestiva óptima:</strong> Ideal para comida principal</li>
            <li><strong>Temperatura corporal alta:</strong> Metabolismo activo</li>
            <li><strong>Tolerancia a carbohidratos:</strong> Aún buena</li>
          </ul>

          <h3>Tarde-Noche (15:00 - 22:00)</h3>
          <ul>
            <li><strong>Sensibilidad insulina decrece:</strong> Carbohidratos se manejan peor</li>
            <li><strong>Melatonina comienza:</strong> Prepara para el descanso</li>
            <li><strong>Metabolismo desciende:</strong> Menor gasto calórico</li>
            <li><strong>Mejor para proteínas y grasas:</strong> Digestión más lenta</li>
          </ul>

          <div className={styles.exampleGrid}>
            <div className={styles.exampleCard}>
              <span className={styles.exampleIcon}>☀️</span>
              <h4 className={styles.exampleTitle}>Mañana</h4>
              <p className={styles.exampleDesc}>
                Carbohidratos complejos, proteínas, frutas.
                Momento óptimo para energía.
              </p>
            </div>
            <div className={styles.exampleCard}>
              <span className={styles.exampleIcon}>🌙</span>
              <h4 className={styles.exampleTitle}>Noche</h4>
              <p className={styles.exampleDesc}>
                Proteínas, grasas saludables, vegetales.
                Evitar carbohidratos simples.
              </p>
            </div>
          </div>
        </>
      ),
    },
    {
      title: 'Timing Alrededor del Ejercicio',
      icon: '🏋️',
      content: (
        <>
          <h3>Pre-entrenamiento (1-3 horas antes)</h3>
          <ul>
            <li><strong>Carbohidratos complejos:</strong> Glucógeno disponible para el esfuerzo</li>
            <li><strong>Proteína moderada:</strong> Aminoácidos circulantes</li>
            <li><strong>Grasa baja-moderada:</strong> No retrasar digestión</li>
            <li><strong>Ejemplo:</strong> Avena con plátano y un poco de proteína</li>
          </ul>

          <h3>Intra-entrenamiento (solo si es largo &gt;90 min)</h3>
          <ul>
            <li>Carbohidratos simples de rápida absorción</li>
            <li>Electrolitos (sodio, potasio, magnesio)</li>
            <li>Hidratación constante</li>
          </ul>

          <h3>Post-entrenamiento (0-2 horas después)</h3>
          <p>La famosa &quot;ventana anabólica&quot;:</p>
          <ul>
            <li><strong>Proteína:</strong> 20-40g para síntesis muscular (leucina clave)</li>
            <li><strong>Carbohidratos:</strong> Recarga de glucógeno (ratio 3:1 o 4:1 carb:prot)</li>
            <li><strong>Hidratación:</strong> Reponer fluidos perdidos</li>
          </ul>

          <div className={styles.infoBox}>
            <p>
              <strong>💡 Realidad sobre la &quot;ventana anabólica&quot;:</strong> No es tan
              estrecha como se creía. Si has comido proteína antes del ejercicio,
              la síntesis proteica ya está activa. Lo importante es el total
              diario de proteína, no el timing exacto post-ejercicio.
            </p>
          </div>

          <table className={styles.comparisonTable}>
            <thead>
              <tr>
                <th>Momento</th>
                <th>Prioridad</th>
                <th>Ejemplo de comida</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>2h antes</td>
                <td>Carbohidratos + algo proteína</td>
                <td>Arroz con pollo, plátano</td>
              </tr>
              <tr>
                <td>30min después</td>
                <td>Proteína + carbohidratos rápidos</td>
                <td>Batido whey + fruta</td>
              </tr>
              <tr>
                <td>2h después</td>
                <td>Comida completa</td>
                <td>Pollo, patata, verduras</td>
              </tr>
            </tbody>
          </table>
        </>
      ),
    },
    {
      title: 'Ayuno Intermitente y Ventanas de Alimentación',
      icon: '🕐',
      content: (
        <>
          <p>
            El <strong>ayuno intermitente</strong> consiste en alternar períodos
            de alimentación con períodos de ayuno. No define qué comes, sino
            cuándo comes. Los protocolos más comunes:
          </p>

          <div className={styles.exampleGrid}>
            <div className={styles.exampleCard}>
              <span className={styles.exampleIcon}>16:8</span>
              <h4 className={styles.exampleTitle}>16:8</h4>
              <p className={styles.exampleDesc}>
                16h ayuno, 8h alimentación.
                Ej: comer de 12:00 a 20:00.
                El más sostenible.
              </p>
            </div>
            <div className={styles.exampleCard}>
              <span className={styles.exampleIcon}>18:6</span>
              <h4 className={styles.exampleTitle}>18:6</h4>
              <p className={styles.exampleDesc}>
                18h ayuno, 6h alimentación.
                Más restrictivo, mayores
                beneficios metabólicos.
              </p>
            </div>
            <div className={styles.exampleCard}>
              <span className={styles.exampleIcon}>5:2</span>
              <h4 className={styles.exampleTitle}>5:2</h4>
              <p className={styles.exampleDesc}>
                5 días normal, 2 días ~500kcal.
                Días no consecutivos.
                Flexibilidad semanal.
              </p>
            </div>
            <div className={styles.exampleCard}>
              <span className={styles.exampleIcon}>OMAD</span>
              <h4 className={styles.exampleTitle}>OMAD</h4>
              <p className={styles.exampleDesc}>
                Una comida al día.
                23h ayuno. Difícil de mantener.
                No para principiantes.
              </p>
            </div>
          </div>

          <h3>Beneficios potenciales del ayuno:</h3>
          <ul>
            <li>Mejora sensibilidad a insulina</li>
            <li>Activa autofagia (limpieza celular)</li>
            <li>Puede facilitar déficit calórico</li>
            <li>Simplifica planificación de comidas</li>
          </ul>

          <div className={styles.warningBox}>
            <p>
              <strong>⚠️ El ayuno no es para todos:</strong> Personas con historial
              de trastornos alimentarios, embarazadas, diabéticos tipo 1, o quienes
              toman ciertos medicamentos deben consultar con un profesional antes
              de practicar ayuno intermitente.
            </p>
          </div>
        </>
      ),
    },
    {
      title: 'Secuencia de Alimentos en la Comida',
      icon: '📊',
      content: (
        <>
          <p>
            Investigaciones recientes demuestran que el <strong>orden en que
            consumes los alimentos</strong> dentro de una misma comida afecta
            significativamente la respuesta glucémica.
          </p>

          <h3>Orden óptimo para control de glucosa:</h3>
          <ol>
            <li><strong>Primero: Vegetales y fibra</strong> - Crea una &quot;barrera&quot; que ralentiza absorción</li>
            <li><strong>Segundo: Proteínas y grasas</strong> - Ralentizan vaciado gástrico</li>
            <li><strong>Tercero: Carbohidratos</strong> - Llegan más lento al intestino</li>
          </ol>

          <div className={styles.highlightBox}>
            <p>
              <strong>📊 Resultado:</strong> Comer vegetales antes que carbohidratos
              puede reducir el pico de glucosa postprandial hasta un 40%. Mismo
              alimento, mismo contenido calórico, diferente impacto metabólico.
            </p>
          </div>

          <h3>Aplicación práctica:</h3>
          <ul>
            <li>Empieza con la ensalada antes del plato principal</li>
            <li>Come las verduras del plato antes que el arroz o patatas</li>
            <li>Deja el pan para el final, no al principio</li>
            <li>Postre después de proteína, nunca solo</li>
          </ul>

          <h3>Ejemplo de comida optimizada:</h3>
          <table className={styles.comparisonTable}>
            <thead>
              <tr>
                <th>Orden típico</th>
                <th>Orden optimizado</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1. Pan con aceite</td>
                <td>1. Ensalada mixta</td>
              </tr>
              <tr>
                <td>2. Pasta carbonara</td>
                <td>2. Pollo a la plancha</td>
              </tr>
              <tr>
                <td>3. Ensalada</td>
                <td>3. Pasta (porción moderada)</td>
              </tr>
              <tr>
                <td>4. Postre</td>
                <td>4. Fruta fresca</td>
              </tr>
            </tbody>
          </table>

          <div className={styles.infoBox}>
            <p>
              <strong>💡 Bonus:</strong> Caminar 10-15 minutos después de comer
              también reduce significativamente el pico de glucosa. Combinado
              con el orden correcto, el control glucémico mejora notablemente.
            </p>
          </div>
        </>
      ),
    },
  ];

  return <ChapterPage slug="timing-nutricional" sections={sections} />;
}
