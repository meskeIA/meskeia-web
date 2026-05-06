'use client';

import { useState, useCallback } from 'react';
import styles from './SimuladorFisica.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { EducationalSection, RelatedApps, LegalNotice, ShareCard, DisclaimerCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

import { CaidaLibre, PenduloSimple, Proyectil, Ondas, Resorte } from './components';

type SimuladorTipo = 'caida' | 'pendulo' | 'proyectil' | 'ondas' | 'resorte';

interface SimuladorInfo {
  id: SimuladorTipo;
  nombre: string;
  icono: string;
  descripcion: string;
}

const SIMULADORES: SimuladorInfo[] = [
  {
    id: 'caida',
    nombre: 'Caída Libre',
    icono: '⬇️',
    descripcion: 'Simula la caída de objetos bajo la influencia de la gravedad, con o sin resistencia del aire.',
  },
  {
    id: 'pendulo',
    nombre: 'Péndulo',
    icono: '🔔',
    descripcion: 'Observa el movimiento oscilatorio de un péndulo simple con visualización de energías.',
  },
  {
    id: 'proyectil',
    nombre: 'Proyectil',
    icono: '🎯',
    descripcion: 'Lanza proyectiles y observa su trayectoria parabólica con vectores de velocidad.',
  },
  {
    id: 'ondas',
    nombre: 'Ondas',
    icono: '〰️',
    descripcion: 'Visualiza ondas viajeras, estacionarias y fenómenos de interferencia.',
  },
  {
    id: 'resorte',
    nombre: 'Resorte',
    icono: '🔧',
    descripcion: 'Explora el movimiento armónico simple de un sistema masa-resorte.',
  },
];

export default function SimuladorFisicaPage() {
  const [simuladorActivo, setSimuladorActivo] = useState<SimuladorTipo>('caida');
  const [isPlaying, setIsPlaying] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setResetKey(prev => prev + 1);
  }, []);

  const handleSimuladorChange = (tipo: SimuladorTipo) => {
    setIsPlaying(false);
    setSimuladorActivo(tipo);
    setResetKey(prev => prev + 1);
  };

  const simuladorInfo = SIMULADORES.find(s => s.id === simuladorActivo)!;

  const renderSimulador = () => {
    const props = {
      key: resetKey,
      isPlaying,
      onReset: () => setIsPlaying(false),
    };

    switch (simuladorActivo) {
      case 'caida':
        return <CaidaLibre {...props} />;
      case 'pendulo':
        return <PenduloSimple {...props} />;
      case 'proyectil':
        return <Proyectil {...props} />;
      case 'ondas':
        return <Ondas {...props} />;
      case 'resorte':
        return <Resorte {...props} />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>🔬 Simulador de Física</h1>
        <p className={styles.subtitle}>
          Experimenta con física en tiempo real: caída libre, péndulos, proyectiles, ondas y resortes
        </p>
      </header>

      <LegalNotice />

      <DisclaimerCard variant="educational" severity="low" collapsible={true} context="simulador-fisica" />

      {/* Selector de simuladores */}
      <div className={styles.simulatorSelector}>
        {SIMULADORES.map((sim) => (
          <button
            key={sim.id}
            className={`${styles.simBtn} ${simuladorActivo === sim.id ? styles.active : ''}`}
            onClick={() => handleSimuladorChange(sim.id)}
          >
            <span className={styles.simIcon}>{sim.icono}</span>
            <span className={styles.simName}>{sim.nombre}</span>
          </button>
        ))}
      </div>

      {/* Contenido principal */}
      <div className={styles.mainContent}>
        {/* Panel del canvas */}
        <div className={styles.canvasSection}>
          <div className={styles.canvasHeader}>
            <h2 className={styles.canvasTitle}>
              {simuladorInfo.icono} {simuladorInfo.nombre}
            </h2>
            <div className={styles.canvasControls}>
              {!isPlaying ? (
                <button
                  className={styles.controlBtn}
                  onClick={handlePlay}
                  title="Iniciar"
                >
                  ▶️
                </button>
              ) : (
                <button
                  className={`${styles.controlBtn} ${styles.active}`}
                  onClick={handlePause}
                  title="Pausar"
                >
                  ⏸️
                </button>
              )}
              <button
                className={styles.controlBtn}
                onClick={handleReset}
                title="Reiniciar"
              >
                🔄
              </button>
            </div>
          </div>

          {renderSimulador()}
        </div>
      </div>

      {/* Descripción del simulador */}
      <div className={styles.simDescription}>
        <h3 className={styles.descriptionTitle}>Acerca de {simuladorInfo.nombre}</h3>
        <div className={styles.descriptionText}>
          <p>{simuladorInfo.descripcion}</p>
          {simuladorActivo === 'caida' && (
            <p>
              La caída libre es un caso especial de movimiento rectilíneo uniformemente acelerado (MRUA)
              donde la única fuerza que actúa es la gravedad. En la Tierra, la aceleración es aproximadamente
              9,81 m/s². Puedes activar la resistencia del aire para ver cómo afecta a objetos de diferente masa.
            </p>
          )}
          {simuladorActivo === 'pendulo' && (
            <p>
              El péndulo simple es un sistema que oscila bajo la acción de la gravedad. Para ángulos pequeños,
              el período depende solo de la longitud y la gravedad, no de la masa. Observa cómo la energía
              se transforma continuamente entre cinética y potencial.
            </p>
          )}
          {simuladorActivo === 'proyectil' && (
            <p>
              El movimiento de proyectiles combina un movimiento horizontal uniforme (MRU) con una caída libre
              vertical (MRUA). El alcance máximo se obtiene con un ángulo de 45°. Los vectores muestran
              cómo la velocidad horizontal permanece constante mientras la vertical cambia.
            </p>
          )}
          {simuladorActivo === 'ondas' && (
            <p>
              Las ondas transportan energía sin transportar materia. Puedes explorar ondas viajeras,
              ondas estacionarias (que se forman cuando dos ondas viajan en direcciones opuestas), y
              fenómenos de interferencia cuando se superponen ondas de diferentes frecuencias.
            </p>
          )}
          {simuladorActivo === 'resorte' && (
            <p>
              El sistema masa-resorte es el ejemplo clásico de movimiento armónico simple (MAS).
              La frecuencia de oscilación depende de la constante del resorte (k) y la masa.
              La energía total se conserva, transformándose entre cinética y potencial elástica.
            </p>
          )}
        </div>
      </div>

      {/* Sección educativa */}
      <EducationalSection
        title="📚 ¿Quieres aprender más sobre Física?"
        subtitle="Conceptos fundamentales de mecánica y ondas"
      >
        {/* Sección 1: Tabla Comparativa */}
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Sistema</th>
                <th>Ecuación principal</th>
                <th>Variable clave</th>
                <th>Período / Frecuencia</th>
                <th>¿Conserva energía?</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Caída Libre</td><td>y = ½·g·t²</td><td>Aceleración g = 9,81 m/s²</td><td>No oscila</td><td>✅ Sin rozamiento</td></tr>
              <tr><td>Péndulo Simple</td><td>T = 2π√(L/g)</td><td>Longitud L, gravedad g</td><td>T independiente de masa</td><td>✅ Sin amortiguamiento</td></tr>
              <tr><td>Tiro Parabólico</td><td>x = v₀·cos(α)·t</td><td>Ángulo α, velocidad v₀</td><td>Máx. alcance a 45°</td><td>✅ Sin resistencia aire</td></tr>
              <tr><td>Ondas Mecánicas</td><td>v = λ·f</td><td>Amplitud, frecuencia, λ</td><td>T = 1/f</td><td>✅ Medio sin pérdidas</td></tr>
              <tr><td>Resorte (MAS)</td><td>T = 2π√(m/k)</td><td>Masa m, constante k</td><td>T independiente de amplitud</td><td>✅ Sin fricción</td></tr>
              <tr><td>Velocidad terminal</td><td>v_t = √(2mg/ρCdA)</td><td>Masa, densidad del fluido</td><td>Estado estacionario</td><td>❌ Con rozamiento</td></tr>
              <tr><td>Ondas estacionarias</td><td>λₙ = 2L/n</td><td>Longitud, armónicos</td><td>fₙ = n·f₁</td><td>✅ Nodos fijos</td></tr>
              <tr><td>Energía cinética</td><td>Ek = ½·m·v²</td><td>Masa m, velocidad v</td><td>Instantánea</td><td>↔️ Se transforma</td></tr>
            </tbody>
          </table>
        </div>

        {/* Sección 2: Casos de uso */}
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <h3>🏫 Clases de Física en secundaria y preparatoria</h3>
            <p>Visualiza caída libre, péndulos y tiro parabólico en tiempo real para reforzar los conceptos teóricos con experimentación interactiva.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h3>🎯 Verificar el ángulo de 45°</h3>
            <p>Comprueba experimentalmente que el ángulo de 45° maximiza el alcance de un proyectil cuando no hay resistencia del aire.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h3>⚙️ Ingeniería de sistemas oscilantes</h3>
            <p>Estudia cómo varía el período de un resorte o péndulo al cambiar masa y constante elástica. Base para el diseño de amortiguadores.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h3>🎵 Física acústica y ondas</h3>
            <p>Analiza ondas estacionarias para entender la formación de armónicos en instrumentos musicales de cuerda y viento.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h3>📐 Preparación de exámenes universitarios</h3>
            <p>Practica con los 5 simuladores para afianzar los conceptos de mecánica clásica antes de exámenes de Física I y II.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h3>🔬 Comprobación de fórmulas</h3>
            <p>Verifica rápidamente resultados de problemas calculados a mano: introduce los mismos valores y observa si la simulación coincide.</p>
          </div>
        </div>

        {/* Sección 3: FAQ */}
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <h3>¿Por qué g = 9,81 m/s² y no otro valor?</h3>
            <p>9,81 m/s² es la aceleración de la gravedad a nivel del mar en latitudes medias. Varía entre 9,78 (ecuador) y 9,83 m/s² (polos) por la forma achatada de la Tierra y la fuerza centrífuga.</p>
          </div>
          <div className={styles.faqItem}>
            <h3>¿Por qué el período del péndulo no depende de la masa?</h3>
            <p>Porque la fuerza gravitatoria que acelera al péndulo es proporcional a su masa, y la inercia que resiste ese movimiento también. Ambos efectos se cancelan, dejando T = 2π√(L/g).</p>
          </div>
          <div className={styles.faqItem}>
            <h3>¿A qué ángulo se logra el máximo alcance en el proyectil?</h3>
            <p>A 45° (sin resistencia del aire). Ángulos menores o mayores reducen el alcance. Con resistencia del aire, el ángulo óptimo baja a 30-40° dependiendo de la velocidad inicial.</p>
          </div>
          <div className={styles.faqItem}>
            <h3>¿Qué diferencia hay entre onda viajera y estacionaria?</h3>
            <p>Una onda viajera transporta energía desplazándose en una dirección. Una onda estacionaria se forma por la superposición de dos ondas opuestas y tiene puntos fijos (nodos) que no oscilan.</p>
          </div>
          <div className={styles.faqItem}>
            <h3>¿Qué es la velocidad terminal?</h3>
            <p>Es la velocidad máxima que alcanza un objeto en caída cuando la resistencia del aire equilibra la fuerza gravitatoria. A partir de ese punto, no hay aceleración neta.</p>
          </div>
          <div className={styles.faqItem}>
            <h3>¿Cómo se conserva la energía en el resorte?</h3>
            <p>La energía total (cinética + potencial elástica) permanece constante. Cuando el resorte está en equilibrio, toda la energía es cinética; en los extremos, toda es potencial.</p>
          </div>
          <div className={styles.faqItem}>
            <h3>¿Qué es el movimiento armónico simple (MAS)?</h3>
            <p>Es un movimiento oscilatorio donde la fuerza restauradora es proporcional al desplazamiento (F = -kx). El péndulo (para ángulos pequeños) y el resorte son ejemplos clásicos de MAS.</p>
          </div>
          <div className={styles.faqItem}>
            <h3>¿Para qué sirven los vectores de velocidad en el proyectil?</h3>
            <p>Muestran cómo la componente horizontal permanece constante (sin rozamiento) mientras la vertical disminuye por la gravedad. Esto ilustra la independencia de movimientos horizontales y verticales.</p>
          </div>
        </div>

        {/* Sección 4: Guía paso a paso */}
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <h3>Selecciona el simulador</h3>
              <p>Elige entre Caída Libre, Péndulo, Proyectil, Ondas o Resorte según el fenómeno que quieras estudiar.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <h3>Lee la descripción del fenómeno</h3>
              <p>La sección &quot;Acerca de&quot; explica el concepto físico, las variables implicadas y la fórmula principal.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <h3>Inicia la simulación</h3>
              <p>Pulsa ▶️ para arrancar. Observa el movimiento, los vectores y los indicadores de energía en tiempo real.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <h3>Pausa y analiza</h3>
              <p>Usa ⏸️ para detener la simulación en un instante concreto y observar los valores de posición, velocidad y energía.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>
              <h3>Compara con las fórmulas</h3>
              <p>Calcula manualmente el resultado esperado usando las fórmulas de la sección educativa y compara con la simulación.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>6</div>
            <div className={styles.stepContent}>
              <h3>Reinicia y varía parámetros</h3>
              <p>Usa 🔄 para reiniciar. En el proyectil, prueba diferentes ángulos; en el péndulo, cambia la longitud mental y observa el cambio de período.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>7</div>
            <div className={styles.stepContent}>
              <h3>Relaciona con aplicaciones reales</h3>
              <p>Conecta cada simulación con ejemplos cotidianos: un columpio (péndulo), un balón de fútbol (proyectil), una guitarra (ondas).</p>
            </div>
          </div>
        </div>

        {/* Sección 5: Mejores prácticas */}
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <h3>💡 Empieza por Caída Libre</h3>
            <p>Es el simulador más sencillo. Domina la caída libre antes de pasar al tiro parabólico, que la combina con movimiento horizontal.</p>
          </div>
          <div className={styles.tipCard}>
            <h3>⚡ Observa el intercambio de energías</h3>
            <p>En el péndulo y el resorte, presta atención a cómo la energía cinética y potencial se transforman continuamente sin perderse.</p>
          </div>
          <div className={styles.tipCard}>
            <h3>🎯 Prueba el ángulo de 45°</h3>
            <p>En el proyectil, observa que 45° maximiza el alcance. Compara con 30° y 60° para visualizar la simetría de la función seno.</p>
          </div>
          <div className={styles.tipCard}>
            <h3>🔊 Conecta ondas con música</h3>
            <p>Las ondas estacionarias son la base física de los instrumentos musicales. Los nodos corresponden a puntos fijos de la cuerda.</p>
          </div>
          <div className={styles.tipCard}>
            <h3>📐 Verifica cálculos de examen</h3>
            <p>Usa el simulador como verificador: introduce los datos del problema y comprueba si el comportamiento coincide con tu solución.</p>
          </div>
          <div className={styles.tipCard}>
            <h3>🔄 Reinicia entre pruebas</h3>
            <p>Siempre reinicia la simulación antes de cambiar de escenario para evitar confusiones entre estados intermedios de la animación.</p>
          </div>
        </div>

        {/* Sección 6: Warning Box */}
        <div className={styles.warningBox}>
          <h3>⚠️ Modelos idealizados</h3>
          <ul className={styles.warningList}>
            <li>Las simulaciones usan modelos idealizados: sin fricción, gravedad constante y sin pérdidas de energía.</li>
            <li>En la realidad, el rozamiento, la resistencia del aire y el amortiguamiento modifican el comportamiento.</li>
            <li>Los resultados son aproximaciones educativas y no sustituyen experimentos físicos reales.</li>
            <li>Para aplicaciones de ingeniería o investigación, usa software especializado como MATLAB o ANSYS.</li>
          </ul>
        </div>

        <section className={styles.guideSection}>
          <h2>Conceptos de Física Simulados</h2>
          <p className={styles.introParagraph}>
            Este simulador cubre varios conceptos fundamentales de la física clásica. Cada simulación
            te permite experimentar con diferentes parámetros y observar cómo afectan al comportamiento
            del sistema en tiempo real.
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>Caída Libre y Gravedad</h4>
              <p>
                Todos los objetos caen con la misma aceleración (g ≈ 9,81 m/s²) en ausencia de
                resistencia del aire. Con resistencia, objetos más densos caen más rápido y
                pueden alcanzar una velocidad terminal.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>Péndulo Simple</h4>
              <p>
                Un péndulo oscila con período T = 2π√(L/g), independiente de la masa para ángulos
                pequeños. Es un ejemplo de movimiento armónico simple con intercambio continuo
                entre energía cinética y potencial gravitatoria.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>Tiro Parabólico</h4>
              <p>
                La trayectoria de un proyectil es una parábola. El alcance máximo (sin considerar
                aire) se logra a 45°. El tiempo de vuelo depende solo de la componente vertical
                de la velocidad inicial.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>Ondas Mecánicas</h4>
              <p>
                Las ondas se caracterizan por su amplitud, frecuencia, longitud de onda y velocidad.
                La relación v = λf conecta estas propiedades. Las ondas estacionarias tienen nodos
                (puntos fijos) y antinodos (máxima amplitud).
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>Movimiento Armónico Simple</h4>
              <p>
                El MAS ocurre cuando la fuerza restauradora es proporcional al desplazamiento (F = -kx).
                El período de un sistema masa-resorte es T = 2π√(m/k). La energía total se conserva
                si no hay amortiguamiento.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>Conservación de Energía</h4>
              <p>
                En sistemas sin fricción, la energía mecánica total (cinética + potencial) se conserva.
                Puedes observar esto en el péndulo y el resorte, donde la energía oscila entre
                sus formas cinética y potencial.
              </p>
            </div>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-fisica')} />
      <ShareCard appName="simulador-fisica" />
      <Footer appName="simulador-fisica" />
    </div>
  );
}
